import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ColumnDef } from '@tanstack/react-table';

// Components
import Button from '../../components/ui/button/Button';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import Label from '../../components/form/Label';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { toast } from '../../components/ui/Toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import Badge from '../../components/ui/badge/Badge';
import { DataTable } from '../../components/ui/table/DataTable';
import { Skeleton } from '../../components/ui/Skeleton';

// Icons
import { Download, FileText, Filter, Save, Users, UserX, BarChart2, ShieldAlert, CheckCircle, Award, Sparkles, RefreshCw } from 'lucide-react';
import Input from '../../components/form/input/InputField';

// --- TYPES ---
interface StudentMarkSheet {
  student_id: string;
  student_name: string;
  admission_number: string;
  mark_id: string | null;
  theory_marks: number | string;
  practical_marks: number | string;
  assignment_marks: number | string;
  obtained_marks: number | string;
  is_absent: boolean;
  remarks: string;
}

interface ExamLookupItem {
  id: string;
  title: string;
  is_locked?: boolean;
  marks_entry_deadline?: string;
}

interface LookupItem {
  id: string;
  name?: string;
  title?: string;
}

export default function MarksEntryDashboard() {
  const tenantId = localStorage.getItem("tenantId") || "";

  // --- METADATA STATES ---
  const [examTerms, setExamTerms] = useState<ExamLookupItem[]>([]);
  const [classes, setClasses] = useState<LookupItem[]>([]);
  const [subjects, setSubjects] = useState<LookupItem[]>([]);

  // --- FILTER STATES ---
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  // --- DATA STATES ---
  const [marksData, setMarksData] = useState<StudentMarkSheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [maxPaperMarks, setMaxPaperMarks] = useState<number>(100);

  // --- FETCH METADATA ---
  useEffect(() => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (!activeTenant) return;
    const fetchMetadata = async () => {
      try {
        const [examsRes, classesRes, subjectsRes] = await Promise.all([
          api.get<ExamLookupItem[]>(`/examsetups/tenant/${activeTenant}`),
          api.get<LookupItem[]>(`/classes/tenant/${activeTenant}`),
          api.get<LookupItem[]>(`/subjects/tenant/${activeTenant}`)
        ]);
        setExamTerms(examsRes.data);
        setClasses(classesRes.data);
        setSubjects(subjectsRes.data);

        if (examsRes.data.length > 0) setSelectedExam(examsRes.data[0].id);
        if (classesRes.data.length > 0) setSelectedClass(classesRes.data[0].id);
        if (subjectsRes.data.length > 0) setSelectedSubject(subjectsRes.data[0].id);
      } catch (err) {
        toast.error('Failed to load metadata for filters.');
      }
    };
    fetchMetadata();
  }, [tenantId]);

  // Check if exam is locked or deadline passed
  const selectedExamObject = useMemo(() => {
    return examTerms.find(e => e.id === selectedExam);
  }, [selectedExam, examTerms]);

  const isExamLocked = useMemo(() => {
    if (!selectedExamObject) return false;
    if (selectedExamObject.is_locked) return true;
    if (selectedExamObject.marks_entry_deadline) {
      const deadline = new Date(selectedExamObject.marks_entry_deadline);
      if (deadline < new Date()) return true;
    }
    return false;
  }, [selectedExamObject]);

  // --- LOAD MARKS SHEET ---
  const loadMarksSheet = async () => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (!selectedExam || !selectedClass || !selectedSubject) {
      toast.error('Please select Exam, Class, and Subject first.');
      return;
    }
    
    setLoading(true);
    setIsDataLoaded(false);
    try {
      const [sheetRes, scheduleRes, classSubRes] = await Promise.all([
        api.get<StudentMarkSheet[]>(`/exammarks/tenant/${activeTenant}/sheet?examId=${selectedExam}&classId=${selectedClass}&subjectId=${selectedSubject}`),
        api.get(`/examschedules/tenant/${activeTenant}/datesheet?examId=${selectedExam}&classId=${selectedClass}`).catch(() => ({ data: [] })),
        api.get(`/classsubjects/class/${selectedClass}`).catch(() => ({ data: [] }))
      ]);

      const matchedSlot = (scheduleRes.data || []).find((s: any) => s.subject_id === selectedSubject);
      const matchedClassSubject = (classSubRes.data || []).find((cs: any) => cs.subject_id === selectedSubject);

      if (matchedSlot && matchedSlot.total_marks) {
        setMaxPaperMarks(matchedSlot.total_marks);
      } else if (matchedClassSubject && matchedClassSubject.total_marks) {
        setMaxPaperMarks(matchedClassSubject.total_marks);
      } else {
        setMaxPaperMarks(100);
      }

      setMarksData(sheetRes.data);
      setIsDataLoaded(true);
      toast.success("Student marks roster loaded!");
    } catch (err) {
      toast.error('Failed to load student roster.');
    } finally {
      setLoading(false);
    }
  };

  // --- LIVE STATS CALCULATION ---
  const stats: StatCardData[] = useMemo(() => {
    let present = 0, absent = 0, totalObtained = 0;
    marksData.forEach(m => {
      if (m.is_absent) absent++;
      else {
        present++;
        totalObtained += Number(m.obtained_marks) || 0;
      }
    });
    const avgScore = present > 0 ? (totalObtained / present).toFixed(1) : '0.0';
    const avgPct = maxPaperMarks > 0 ? ((Number(avgScore) / maxPaperMarks) * 100).toFixed(1) : '0.0';
    
    return [
      { title: 'Total Enrolled', value: `${marksData.length} Candidates`, icon: <Users className="w-6 h-6 text-brand-500" />, theme: 'brand' as const },
      { title: 'Absentees Count', value: `${absent} Students`, icon: <UserX className="w-6 h-6 text-rose-500" />, theme: 'error' as const },
      { title: 'Class Average', value: `${avgScore} / ${maxPaperMarks} (${avgPct}%)`, icon: <BarChart2 className="w-6 h-6 text-indigo-500" />, theme: 'indigo' as const },
    ];
  }, [marksData, maxPaperMarks]);

  // --- INPUT HANDLERS ---
  const handleMarkChange = (studentId: string, field: 'theory_marks' | 'practical_marks' | 'assignment_marks', val: string) => {
    const numVal = Math.max(0, Number(val) || 0);
    setMarksData(prev => prev.map(m => {
      if (m.student_id === studentId) {
        const updated = { ...m, [field]: val };
        const t = Number(updated.theory_marks) || 0;
        const p = Number(updated.practical_marks) || 0;
        const a = Number(updated.assignment_marks) || 0;
        updated.obtained_marks = t + p + a;

        if (updated.obtained_marks > maxPaperMarks) {
          toast.error(`Obtained marks (${updated.obtained_marks}) cannot exceed maximum paper marks (${maxPaperMarks}).`);
        }
        return updated;
      }
      return m;
    }));
  };

  const handleAbsentToggle = (studentId: string, isAbsent: boolean) => {
    setMarksData(prev => prev.map(m => 
      m.student_id === studentId ? { ...m, is_absent: isAbsent, theory_marks: isAbsent ? 0 : m.theory_marks, practical_marks: isAbsent ? 0 : m.practical_marks, assignment_marks: isAbsent ? 0 : m.assignment_marks, obtained_marks: isAbsent ? 0 : m.obtained_marks } : m
    ));
  };

  const handleRemarksChange = (studentId: string, text: string) => {
    setMarksData(prev => prev.map(m => 
      m.student_id === studentId ? { ...m, remarks: text } : m
    ));
  };

  // --- QUICK FILL TOOL ---
  const handleMarkAllPresent = () => {
    setMarksData(prev => prev.map(m => ({ ...m, is_absent: false })));
    toast.info('Marked all students as present.');
  };

  // --- BULK SAVE ---
  const handleBulkSave = async () => {
    if (marksData.length === 0) return;
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";

    const invalid = marksData.find(m => !m.is_absent && Number(m.obtained_marks) > maxPaperMarks);
    if (invalid) {
      toast.error(`Cannot save: Candidate "${invalid.student_name}" has obtained marks exceeding max (${maxPaperMarks}).`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        tenant_id: activeTenant,
        exam_setup_id: selectedExam,
        class_id: selectedClass,
        subject_id: selectedSubject,
        marks: marksData.map(m => ({
          student_id: m.student_id,
          theory_marks: Number(m.theory_marks) || 0,
          practical_marks: Number(m.practical_marks) || 0,
          assignment_marks: Number(m.assignment_marks) || 0,
          obtained_marks: Number(m.obtained_marks) || 0,
          is_absent: m.is_absent,
          remarks: m.remarks || ''
        }))
      };

      const res = await api.post('/exammarks/bulk-save', payload);
      toast.success(res.data.message || 'Marks saved successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save marks.');
    } finally {
      setSaving(false);
    }
  };

  // Helper to compute grade badge
  const calculateGradeBadge = (obtained: number, max: number, isAbsent: boolean) => {
    if (isAbsent) return <Badge variant="solid" color="error" size="sm">ABSENT</Badge>;
    if (max <= 0) return <Badge variant="light" color="light" size="sm">N/A</Badge>;
    const pct = (obtained / max) * 100;
    if (pct >= 90) return <Badge variant="solid" color="success" size="sm">A+ ({pct.toFixed(0)}%)</Badge>;
    if (pct >= 80) return <Badge variant="solid" color="primary" size="sm">A ({pct.toFixed(0)}%)</Badge>;
    if (pct >= 70) return <Badge variant="light" color="info" size="sm">B ({pct.toFixed(0)}%)</Badge>;
    if (pct >= 60) return <Badge variant="light" color="warning" size="sm">C ({pct.toFixed(0)}%)</Badge>;
    if (pct >= 50) return <Badge variant="light" color="warning" size="sm">D ({pct.toFixed(0)}%)</Badge>;
    return <Badge variant="solid" color="error" size="sm">F ({pct.toFixed(0)}%)</Badge>;
  };

  // --- TABLE COLUMNS ---
  const columns = useMemo<ColumnDef<StudentMarkSheet>[]>(() => [
    {
      header: 'Student Profile',
      id: 'profile',
      accessorFn: row => `${row.student_name} ${row.admission_number}`,
      cell: (info: any) => {
        const row = info.row.original as StudentMarkSheet;
        return (
          <div>
            <p className={`font-bold text-base ${row.is_absent ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>{row.student_name}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">Roll No: {row.admission_number}</p>
          </div>
        );
      }
    },
    {
      header: 'Attendance',
      id: 'absence',
      cell: (info: any) => {
        const row = info.row.original as StudentMarkSheet;
        return (
          <label className="inline-flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <input 
              type="checkbox" 
              className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500 cursor-pointer disabled:opacity-50"
              checked={row.is_absent}
              onChange={(e) => handleAbsentToggle(row.student_id, e.target.checked)}
              disabled={isExamLocked}
            />
            <span className={`text-xs font-bold ${row.is_absent ? 'text-rose-600 dark:text-rose-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {row.is_absent ? 'ABSENT' : 'Present'}
            </span>
          </label>
        );
      }
    },
    {
      header: 'Theory Marks',
      id: 'theory',
      cell: (info: any) => {
        const row = info.row.original as StudentMarkSheet;
        return (
          <Input 
            type="number"
            min="0" max={maxPaperMarks}
            placeholder="0"
            className="w-24 text-center font-bold"
            value={row.is_absent ? '' : (row.theory_marks ?? '')}
            onChange={(e: any) => handleMarkChange(row.student_id, 'theory_marks', e.target.value)}
            disabled={row.is_absent || isExamLocked}
          />
        );
      }
    },
    {
      header: 'Practical',
      id: 'practical',
      cell: (info: any) => {
        const row = info.row.original as StudentMarkSheet;
        return (
          <Input 
            type="number"
            min="0" max={maxPaperMarks}
            placeholder="0"
            className="w-24 text-center font-bold"
            value={row.is_absent ? '' : (row.practical_marks ?? '')}
            onChange={(e: any) => handleMarkChange(row.student_id, 'practical_marks', e.target.value)}
            disabled={row.is_absent || isExamLocked}
          />
        );
      }
    },
    {
      header: 'Assignment',
      id: 'assignment',
      cell: (info: any) => {
        const row = info.row.original as StudentMarkSheet;
        return (
          <Input 
            type="number"
            min="0" max={maxPaperMarks}
            placeholder="0"
            className="w-24 text-center font-bold"
            value={row.is_absent ? '' : (row.assignment_marks ?? '')}
            onChange={(e: any) => handleMarkChange(row.student_id, 'assignment_marks', e.target.value)}
            disabled={row.is_absent || isExamLocked}
          />
        );
      }
    },
    {
      header: 'Obtained Total',
      id: 'total',
      cell: (info: any) => {
        const row = info.row.original as StudentMarkSheet;
        const obtained = Number(row.obtained_marks) || 0;
        const isExceeded = obtained > maxPaperMarks;
        return (
          <div className="flex flex-col items-start gap-1">
            <span className={`font-black text-lg ${isExceeded ? 'text-rose-600' : 'text-brand-600 dark:text-brand-400'}`}>
              {row.is_absent ? '0' : obtained} / {maxPaperMarks}
            </span>
            {calculateGradeBadge(obtained, maxPaperMarks, row.is_absent)}
          </div>
        );
      }
    },
    {
      header: 'Remarks',
      id: 'remarks',
      cell: (info: any) => {
        const row = info.row.original as StudentMarkSheet;
        return (
          <Input 
            type="text"
            placeholder="Add remarks..."
            className="w-full text-xs"
            value={row.remarks || ''}
            onChange={(e: any) => handleRemarksChange(row.student_id, e.target.value)}
            disabled={row.is_absent || isExamLocked}
          />
        );
      }
    }
  ], [isExamLocked, maxPaperMarks]);

  const examOpts = useMemo(() => examTerms.map(e => ({ value: e.id, label: e.title || '' })), [examTerms]);
  const classOpts = useMemo(() => classes.map(c => ({ value: c.id, label: c.name || '' })), [classes]);
  const subjectOpts = useMemo(() => subjects.map(s => ({ value: s.id, label: s.name || '' })), [subjects]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300 pb-24">
      <Breadcrumb items={[{ label: 'Examinations', href: '#' }, { label: 'Marks Entry Dashboard' }]} />
      
      {/* HEADER CARD */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Marks Entry Dashboard Engine</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Input student marks for theory, practicals, and assignments with real-time grade calculations.
            </p>
          </div>
          {isDataLoaded && marksData.length > 0 && (
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleMarkAllPresent} disabled={isExamLocked} className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" /> Mark All Present
              </Button>
            </div>
          )}
        </div>

        {/* FILTER CONTROL PANEL */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 items-end pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            <SearchableSelect 
              label="Exam Term *"
              options={examOpts} 
              value={selectedExam} 
              onChange={(val) => setSelectedExam(val as string)} 
              placeholder="Select Exam..." 
            />
          </div>
          <div>
            <SearchableSelect 
              label="Target Class *"
              options={classOpts} 
              value={selectedClass} 
              onChange={(val) => setSelectedClass(val as string)} 
              placeholder="Select Class..." 
            />
          </div>
          <div>
            <SearchableSelect 
              label="Subject Course *"
              options={subjectOpts} 
              value={selectedSubject} 
              onChange={(val) => setSelectedSubject(val as string)} 
              placeholder="Select Subject..." 
            />
          </div>
          <div>
            <Button 
              variant="primary" 
              onClick={loadMarksSheet} 
              disabled={!selectedExam || !selectedClass || !selectedSubject} 
              loading={loading}
              loadingText="Loading Roster..."
              className="w-full h-10 shadow-sm"
            >
              <Filter className="w-4 h-4 mr-2" /> Load Roster
            </Button>
          </div>
        </div>
      </div>

      {/* SECURITY LOCK WARNING BANNER */}
      {isExamLocked && (
        <div className="p-4 rounded-xl border bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <div className="font-semibold text-sm">Marks Entry Locked</div>
              <div className="text-xs opacity-90">The submission deadline for this exam has passed or admin has locked marks entry. Editing is disabled.</div>
            </div>
          </div>
          <Badge variant="solid" color="error">ENTRY LOCKED</Badge>
        </div>
      )}

      {/* INITIAL GUIDANCE PLACEHOLDER */}
      {!isDataLoaded && !loading && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center shadow-sm">
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 border border-brand-100 dark:border-brand-800">
              <BarChart2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-2">
              Ready to Grade Students
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
              Select the Exam Term, Target Class, and Subject Course from the controls above, then click <strong>"Load Roster"</strong> to fetch student grading sheets.
            </p>
            <Button
              variant="primary"
              onClick={loadMarksSheet}
              disabled={!selectedExam || !selectedClass || !selectedSubject}
              className="px-6 py-2.5 shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Filter className="w-4 h-4" />
              <span>Load Student Roster</span>
            </Button>
          </div>
        </div>
      )}

      {/* SPREADSHEET ROSTER AREA */}
      {isDataLoaded && (
        <div className="space-y-6">
          {/* STATS SUMMARY */}
          <StatCards stats={stats} loading={loading} />

          {/* DATA TABLE SECTION */}
          <DataTable
            loading={loading}
            data={marksData}
            columns={columns}
            searchPlaceholder="Search student name or roll number..."
            emptyMessage="No students enrolled in this class."
            exportable={true}
            exportFilename={`Marksheet_${selectedClass}_${selectedSubject}`}
          />

          {/* STICKY ACTION BAR AT BOTTOM */}
          {marksData.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 md:pl-64 z-50 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-2xl flex justify-between items-center animate-in slide-in-from-bottom duration-200">
              <div className="hidden sm:block text-sm font-medium text-gray-600 dark:text-gray-300">
                Editing <strong className="text-gray-900 dark:text-white">{marksData.length}</strong> student marks records for paper max marks <strong className="text-brand-600">{maxPaperMarks}</strong>.
              </div>
              <Button 
                variant="primary" 
                onClick={handleBulkSave} 
                disabled={isExamLocked}
                loading={saving}
                loadingText="Saving Marks..."
                className="w-full sm:w-auto px-8 py-2.5 shadow-md h-11"
              >
                <Save className="w-5 h-5 mr-2" /> Save All Marks
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}