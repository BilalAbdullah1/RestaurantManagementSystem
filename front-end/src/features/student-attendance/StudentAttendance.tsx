import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import SearchableSelect, { OptionType as SearchableSelectOption } from '../../components/form/select/SearchableSelect';
import DatePicker from '../../components/form/date-picker';
import Button from '../../components/ui/button/Button';
import { toast } from '../../components/ui/Toast';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { getAvatarGradient, getInitials } from '../../utils/avatarUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Save,
  RotateCcw,
  Search,
  Check
} from 'lucide-react';

// --- TYPES ---
interface AttendanceDetail {
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  reason?: string;
}

interface StudentWeeklyData {
  student_id: string;
  student_name: string;
  admission_number: string;
  overall_percentage: number;
  records: Record<string, AttendanceDetail>; // Key: "yyyy-MM-dd"
}

interface LookupItem {
  id: string;
  name?: string;
  title?: string;
  class_id?: string;
  is_current?: boolean;
}

const getMondayOfWeek = (dateStr?: string) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
};

export default function StudentAttendance() {
  const navigate = useNavigate();
  const tenantId = localStorage.getItem("tenantId") || "";

  // --- METADATA STATES ---
  const [academicYears, setAcademicYears] = useState<LookupItem[]>([]);
  const [classes, setClasses] = useState<LookupItem[]>([]);
  const [allSections, setAllSections] = useState<LookupItem[]>([]);

  const [yearId, setYearId] = useState<string>('');
  const [classId, setClassId] = useState<string>('');
  const [sectionId, setSectionId] = useState<string>('');

  // Date tracking (Default to current week's Monday)
  const [weekStart, setWeekStart] = useState<string>(() => getMondayOfWeek());

  // --- DATA STATES ---
  const [studentsData, setStudentsData] = useState<StudentWeeklyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);

  // --- SEARCH IN GRID ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- EDITING STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState<StudentWeeklyData[]>([]);
  const [modifiedDates, setModifiedDates] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // --- METADATA FETCH ---
  useEffect(() => {
    if (!tenantId) return;
    const fetchMeta = async () => {
      try {
        setMetaLoading(true);
        const [yearsRes, classesRes, sectionsRes] = await Promise.all([
          api.get<LookupItem[]>(`/academicyears/tenant/${tenantId}`),
          api.get<LookupItem[]>(`/classes/tenant/${tenantId}`),
          api.get<LookupItem[]>(`/sections/tenant/${tenantId}`)
        ]);
        setAcademicYears(yearsRes.data);
        setClasses(classesRes.data);
        setAllSections(sectionsRes.data);

        // Auto-select active year and initial class
        const currentYear = yearsRes.data.find(y => y.is_current) || yearsRes.data[0];
        if (currentYear) setYearId(currentYear.id);

        if (classesRes.data.length > 0) {
          const firstClass = classesRes.data[0];
          setClassId(firstClass.id);

          // Find sections matching first class
          const matchingSections = sectionsRes.data.filter(
            s => String(s.class_id).toLowerCase() === String(firstClass.id).toLowerCase()
          );
          if (matchingSections.length > 0) {
            setSectionId(matchingSections[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load attendance metadata", err);
      } finally {
        setMetaLoading(false);
      }
    };
    fetchMeta();
  }, [tenantId]);

  // Section Filtering based on active classId
  const filteredSections = useMemo(() => {
    if (!classId) return [];
    return allSections.filter(
      s => String(s.class_id).toLowerCase() === String(classId).toLowerCase()
    );
  }, [allSections, classId]);

  // Class Change Handler with synchronized Section selection
  const handleClassChange = (newClassId: string) => {
    setClassId(newClassId);
    const matching = allSections.filter(
      s => String(s.class_id).toLowerCase() === String(newClassId).toLowerCase()
    );
    if (matching.length > 0) {
      setSectionId(matching[0].id);
    } else {
      setSectionId('');
    }
  };

  // --- DYNAMIC WEEK DAYS GENERATOR ---
  const daysOfWeek = useMemo(() => {
    if (!weekStart) return [];
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const isSunday = d.getDay() === 0;
      return {
        dateKey: d.toISOString().split('T')[0],
        displayDate: d.getDate().toString(),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
        isHoliday: isSunday
      };
    });
  }, [weekStart]);

  const weekEnd = useMemo(() => daysOfWeek.length > 0 ? daysOfWeek[6].dateKey : '', [daysOfWeek]);
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);

  // --- FETCH WEEKLY DATA ---
  const fetchWeeklyMatrix = async () => {
    if (!yearId || !classId || !sectionId || !weekStart) return;
    setLoading(true);
    try {
      const res = await api.get<StudentWeeklyData[]>('/studentattendances/weekly-matrix', {
        params: { academicYearId: yearId, classId, sectionId, startDate: weekStart, endDate: weekEnd }
      });
      setStudentsData(res.data);
    } catch {
      toast.error('Unable to retrieve weekly attendance matrix.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyMatrix();
    setIsEditing(false);
  }, [yearId, classId, sectionId, weekStart]);

  useEffect(() => {
    setLocalData(JSON.parse(JSON.stringify(studentsData)));
    setModifiedDates(new Set());
  }, [studentsData]);

  // --- WEEK QUICK NAVIGATION ---
  const handlePrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };

  const handleCurrentWeek = () => {
    setWeekStart(getMondayOfWeek());
  };

  // --- CONTINUOUS ABSENT CHECKER (3+ Absents) ---
  const hasContinuousAbsents = (student: StudentWeeklyData) => {
    let absentStreak = 0;
    for (const day of daysOfWeek) {
      if (day.isHoliday) continue;
      const rec = student.records[day.dateKey];
      if (rec && rec.status === 'Absent') {
        absentStreak++;
        if (absentStreak >= 3) return true;
      } else {
        absentStreak = 0;
      }
    }
    return false;
  };

  // --- INTERACTIVE EDITING LOGIC ---
  const toggleEditMode = () => setIsEditing(true);

  const handleCellClick = (studentId: string, dateKey: string, isHoliday: boolean) => {
    if (!isEditing || isHoliday) return;
    setLocalData((prev) => {
      const newData = [...prev];
      const student = newData.find(s => s.student_id === studentId);
      if (student) {
        const currentRecord = student.records[dateKey];
        let nextStatus: 'Present' | 'Absent' | 'Late' | 'Leave' = 'Present';

        if (currentRecord) {
          if (currentRecord.status === 'Present') nextStatus = 'Absent';
          else if (currentRecord.status === 'Absent') nextStatus = 'Late';
          else if (currentRecord.status === 'Late') nextStatus = 'Leave';
          else if (currentRecord.status === 'Leave') nextStatus = 'Present';
        }
        student.records[dateKey] = { status: nextStatus, reason: '' };
      }
      return newData;
    });
    setModifiedDates(prev => new Set(prev).add(dateKey));
  };

  // MARK ALL PRESENT FOR A SPECIFIC DAY
  const markAllForDay = (dateKey: string) => {
    setLocalData((prev) => {
      const newData = [...prev];
      newData.forEach(student => {
        student.records[dateKey] = { status: 'Present', reason: '' };
      });
      return newData;
    });
    setModifiedDates(prev => new Set(prev).add(dateKey));
    toast.success(`Marked all students as Present for ${dateKey}`);
  };

  const discardEdits = () => {
    if (modifiedDates.size > 0) {
      Swal.fire({
        title: 'Discard Changes?',
        text: "Are you sure you want to discard all unsaved edits?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Yes, discard'
      }).then((result) => {
        if (result.isConfirmed) {
          setLocalData(JSON.parse(JSON.stringify(studentsData)));
          setModifiedDates(new Set());
          setIsEditing(false);
        }
      });
    } else {
      setIsEditing(false);
    }
  };

  const saveChanges = async () => {
    if (modifiedDates.size === 0) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      const savePromises = Array.from(modifiedDates).map(date => {
        const records = localData.map(s => ({
          student_id: s.student_id,
          status: s.records[date]?.status || 'Present',
          remarks: s.records[date]?.reason || ''
        }));
        return api.post('/studentattendances/bulk-mark', {
          tenant_id: tenantId, 
          academic_year_id: yearId, 
          class_id: classId,
          section_id: sectionId,
          date: date, 
          records: records
        });
      });

      await Promise.all(savePromises);
      Swal.fire({
        icon: 'success',
        title: 'Attendance Saved!',
        text: `Updated attendance logs across ${modifiedDates.size} date(s).`,
        timer: 1800,
        showConfirmButton: false
      });
      setIsEditing(false);
      fetchWeeklyMatrix();
    } catch {
      Swal.fire('Error', 'Failed to save attendance logs. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // --- PDF REPORT EXPORT ---
  const exportToPDF = () => {
    if (localData.length === 0) {
      Swal.fire('Notice', 'No attendance data available to export.', 'info');
      return;
    }
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.text("Weekly Student Attendance Broadsheet", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    
    const className = classes.find(c => c.id === classId)?.name || 'Class';
    const sectionName = allSections.find(s => s.id === sectionId)?.name || 'Section';
    doc.text(`Class: ${className} - Section ${sectionName} | Week: ${weekStart} to ${weekEnd}`, 14, 28);
    
    const tableColumns = ["Adm #", "Student Name", "Percent", ...daysOfWeek.map(d => `${d.dayName} ${d.displayDate}`)];
    const tableRows = localData.map(student => {
      const rowData = [
        student.admission_number || '-',
        student.student_name,
        `${student.overall_percentage}%`
      ];
      daysOfWeek.forEach(day => {
        if (day.isHoliday) {
          rowData.push("Holiday");
        } else {
          const rec = student.records[day.dateKey];
          rowData.push(rec ? rec.status : '-');
        }
      });
      return rowData;
    });

    autoTable(doc, {
      startY: 34,
      head: [tableColumns],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      styles: { fontSize: 8 },
    });

    doc.save(`Attendance_${className}_${sectionName}_${weekStart}.pdf`);
    toast.success('Attendance PDF downloaded!');
  };

  // --- CSV EXPORT ---
  const exportToCSV = () => {
    if (localData.length === 0) {
      Swal.fire('Notice', 'No attendance records available to export.', 'info');
      return;
    }
    const headers = ['Admission Number', 'Student Name', 'Weekly Percentage', ...daysOfWeek.map(d => `${d.fullDayName} (${d.dateKey})`)];
    const rows = localData.map(s => [
      `"${s.admission_number || ''}"`,
      `"${s.student_name || ''}"`,
      `"${s.overall_percentage}%"`,
      ...daysOfWeek.map(d => {
        if (d.isHoliday) return '"Holiday"';
        return `"${s.records[d.dateKey]?.status || 'Not Marked'}"`;
      })
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_${classId}_${weekStart}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Attendance CSV exported successfully!');
  };

  // --- DROPDOWN OPTIONS ---
  const yearOptions = useMemo((): SearchableSelectOption[] => 
    academicYears.map(y => ({ value: y.id, label: y.title || y.name || 'Academic Year' })),
    [academicYears]
  );
  
  const classOptions = useMemo((): SearchableSelectOption[] => 
    classes.map(c => ({ value: c.id, label: c.name || 'Class' })),
    [classes]
  );
  
  const sectionOptions = useMemo((): SearchableSelectOption[] => 
    filteredSections.map(s => ({ value: s.id, label: `Section ${s.name}` })),
    [filteredSections]
  );

  // --- KPI STATS CALCULATION ---
  const totalStudents = localData.length;
  const todayPresents = localData.filter(s => s.records[todayKey]?.status === 'Present').length;
  const todayAbsents = localData.filter(s => s.records[todayKey]?.status === 'Absent').length;
  const atRiskCount = localData.filter(s => hasContinuousAbsents(s)).length;
  const avgPercentage = totalStudents > 0
    ? Math.round(localData.reduce((acc, curr) => acc + (curr.overall_percentage || 0), 0) / totalStudents)
    : 0;

  const statCardsData: StatCardData[] = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: <Users className="w-5 h-5 text-brand-500" />,
      theme: 'brand'
    },
    {
      title: "Today's Present",
      value: todayPresents,
      icon: <CheckCircle2 className="w-5 h-5 text-success-500" />,
      theme: 'success'
    },
    {
      title: "Today's Absent",
      value: todayAbsents,
      icon: <XCircle className="w-5 h-5 text-error-500" />,
      theme: 'error'
    },
    {
      title: 'Class Weekly Average',
      value: `${avgPercentage}%`,
      icon: <Calendar className="w-5 h-5 text-indigo-500" />,
      theme: 'indigo'
    }
  ];

  // --- FILTERED STUDENT ROWS (SEARCH QUERY) ---
  const displayedStudents = useMemo(() => {
    if (!searchQuery.trim()) return localData;
    const q = searchQuery.toLowerCase();
    return localData.filter(s => 
      s.student_name.toLowerCase().includes(q) || 
      (s.admission_number && s.admission_number.toLowerCase().includes(q))
    );
  }, [localData, searchQuery]);

  return (
    <div className="w-full space-y-6">

      {/* TOP HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Student Attendance Manager</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track daily roll call, weekly matrix percentages, and attendance streaks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV} startIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}>
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF} startIcon={<Download className="w-4 h-4 text-rose-600" />}>
            Export PDF
          </Button>
          {!isEditing ? (
            <Button variant="primary" size="sm" onClick={toggleEditMode} startIcon={<Edit3 className="w-4 h-4" />}>
              Mark / Edit Attendance
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={discardEdits} startIcon={<RotateCcw className="w-4 h-4" />}>
                Discard
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={saveChanges}
                loading={isSaving}
                loadingText="Saving..."
                startIcon={<Save className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Save Attendance ({modifiedDates.size})
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* TOP KPI STAT CARDS */}
      <StatCards stats={statCardsData} loading={loading || metaLoading} count={4} />

      {/* AT-RISK ATTENTION BANNER */}
      {atRiskCount > 0 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center justify-between text-rose-800 dark:text-rose-200 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h4 className="text-sm font-bold">Attendance Risk Warning</h4>
              <p className="text-xs text-rose-600 dark:text-rose-300 mt-0.5">
                {atRiskCount} student(s) in this section have accumulated 3 or more consecutive absences this week.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FILTERS & CONTROLS CARD */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-5 space-y-4">
        
        {/* Row 1: Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1.5">Academic Session</label>
            <SearchableSelect
              options={yearOptions}
              value={yearId}
              onChange={(val) => setYearId(String(val))}
              placeholder="Select Year..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1.5">Class / Grade</label>
            <SearchableSelect
              options={classOptions}
              value={classId}
              onChange={(val) => handleClassChange(String(val))}
              placeholder="Select Class..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1.5">Section</label>
            <SearchableSelect
              options={sectionOptions}
              value={sectionId}
              onChange={(val) => setSectionId(String(val))}
              placeholder={filteredSections.length > 0 ? "Select Section..." : "No sections in this class"}
              isDisabled={filteredSections.length === 0}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1.5">Week Starting (Monday)</label>
            <DatePicker
              id="weekly-date-picker"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              placeholder="Select Start Date"
            />
          </div>
        </div>

        {/* Row 2: Quick Week Navigator & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          
          {/* Week Prev / Current / Next Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCurrentWeek}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 transition-colors"
            >
              This Week
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-2">
              {weekStart} <span className="text-gray-400">to</span> {weekEnd}
            </span>
          </div>

          {/* Search bar inside list */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or roll #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

        </div>

      </div>

      {/* EDIT MODE PROMPT BAR */}
      {isEditing && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-amber-100 dark:bg-amber-900/60 rounded-lg text-amber-600 dark:text-amber-400 font-bold">
              ✏️
            </span>
            <span className="text-xs font-semibold">
              <span className="font-bold">Edit Mode Active:</span> Click any weekday cell to cycle status (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Present</span> ➜{' '}
              <span className="text-rose-600 dark:text-rose-400 font-bold">Absent</span> ➜{' '}
              <span className="text-amber-600 dark:text-amber-400 font-bold">Late</span> ➜{' '}
              <span className="text-blue-600 dark:text-blue-400 font-bold">Leave</span>
              ). Click "✔️ All" in headers to mark whole day present.
            </span>
          </div>
          <div className="text-xs font-bold text-amber-700 dark:text-amber-300">
            {modifiedDates.size} date(s) altered
          </div>
        </div>
      )}

      {/* ATTENDANCE MATRIX TABLE */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Table Header Legend */}
        <div className="px-6 py-3 bg-gray-50/70 dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            Attendance Broadsheet ({displayedStudents.length} Students)
          </span>

          <div className="flex items-center gap-3 font-medium text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Present</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Absent</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Late</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Leave</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Holiday</span>
          </div>
        </div>

        {/* Scrollable Table Area */}
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 text-xs font-semibold uppercase tracking-wider">
              <tr>
                {/* Sticky Student Column */}
                <th className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 w-72 bg-gray-50 dark:bg-gray-800 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  Student Details
                </th>

                {/* Weekday Columns */}
                {daysOfWeek.map((day) => {
                  const isToday = day.dateKey === todayKey;
                  return (
                    <th
                      key={day.dateKey}
                      className={`px-3 py-3.5 text-center border-b border-gray-200 dark:border-gray-800 min-w-[130px] relative group ${
                        isToday ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span className={`text-base font-bold ${isToday ? 'text-brand-600 dark:text-brand-400' : 'text-gray-800 dark:text-gray-100'}`}>
                          {day.displayDate}
                        </span>
                        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                          {day.dayName} {isToday && '• Today'}
                        </span>
                      </div>

                      {/* Quick Mark All Present in Edit Mode */}
                      {isEditing && !day.isHoliday && (
                        <button 
                          type="button"
                          onClick={() => markAllForDay(day.dateKey)}
                          className="mt-1 text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-xs hover:bg-emerald-200 inline-flex items-center gap-0.5"
                          title={`Mark all present for ${day.fullDayName}`}
                        >
                          <Check className="w-3 h-3" /> All Present
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {loading ? (
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={`attendance-skel-${rIdx}`} className="animate-pulse">
                    <td className="px-6 py-4 bg-white dark:bg-gray-900 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
                        <div className="space-y-1.5">
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20" />
                        </div>
                      </div>
                    </td>
                    {daysOfWeek.map((day) => (
                      <td key={day.dateKey} className="px-3 py-4 text-center">
                        <div className="h-9 bg-gray-100 dark:bg-gray-800 rounded-lg w-20 mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : displayedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400 dark:text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-1" />
                      <p className="font-semibold text-gray-800 dark:text-gray-200">No students enrolled in this class & section.</p>
                      <p className="text-xs text-gray-400 max-w-sm">Make sure students are registered and assigned to this class and section.</p>
                      <button
                        onClick={() => navigate('/StudentEnrollments')}
                        className="mt-3 px-4 py-2 text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors shadow-xs"
                      >
                        + Assign Students to this Section
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedStudents.map((student) => {
                  const isAtRisk = hasContinuousAbsents(student);

                  return (
                    <tr key={student.student_id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                      
                      {/* Sticky Student Profile Column */}
                      <td className="px-6 py-3.5 bg-white dark:bg-gray-900 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs ${getAvatarGradient(student.student_name)} shrink-0 shadow-xs`}>
                            {getInitials(student.student_name.split(' ')[0] || '', student.student_name.split(' ')[1] || '')}
                          </div>
                          
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[140px]" title={student.student_name}>
                                {student.student_name}
                              </span>
                              {isAtRisk && (
                                <span className="text-rose-500 text-xs font-bold" title="3+ consecutive absents this week">
                                  ⚠️ Risk
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-0.5 text-xs">
                              <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500">
                                {student.admission_number || 'No GR'}
                              </span>
                              <span className={`font-bold text-[11px] ${student.overall_percentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {student.overall_percentage}%
                              </span>
                            </div>

                            {/* Mini percentage progress bar */}
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1 mt-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${student.overall_percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                style={{ width: `${Math.min(student.overall_percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Weekday Status Cells */}
                      {daysOfWeek.map((day) => {
                        if (day.isHoliday) {
                          return (
                            <td key={day.dateKey} className="px-2 py-3 text-center bg-gray-50/50 dark:bg-gray-800/30">
                              <span className="inline-block px-2.5 py-1 text-xs font-medium text-gray-400 dark:text-gray-500 rounded-md border border-dashed border-gray-200 dark:border-gray-700">
                                Holiday
                              </span>
                            </td>
                          );
                        }

                        const record = student.records[day.dateKey];
                        const isCellEdited = modifiedDates.has(day.dateKey);

                        if (!record) {
                          return (
                            <td
                              key={day.dateKey}
                              onClick={() => handleCellClick(student.student_id, day.dateKey, day.isHoliday)}
                              className={`px-2 py-3 text-center ${
                                isEditing ? 'cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-800/60' : ''
                              }`}
                            >
                              <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                            </td>
                          );
                        }

                        const status = record.status;
                        
                        return (
                          <td
                            key={day.dateKey}
                            onClick={() => handleCellClick(student.student_id, day.dateKey, day.isHoliday)}
                            className={`px-2 py-2 text-center select-none ${
                              isEditing ? 'cursor-pointer hover:scale-[1.03] transition-transform' : ''
                            }`}
                          >
                            <div className="relative inline-flex flex-col items-center">
                              {isCellEdited && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-500 rounded-full animate-ping" />
                              )}

                              {status === 'Present' && (
                                <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 shadow-2xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Present
                                </span>
                              )}

                              {status === 'Absent' && (
                                <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 flex items-center gap-1 shadow-2xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Absent
                                </span>
                              )}

                              {status === 'Late' && (
                                <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1 shadow-2xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Late
                                </span>
                              )}

                              {status === 'Leave' && (
                                <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 flex items-center gap-1 shadow-2xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Leave
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}