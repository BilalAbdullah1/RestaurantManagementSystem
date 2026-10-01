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
  Check,
  RefreshCw,
  Clock,
  Calculator,
  DollarSign,
  Plus
} from 'lucide-react';

// --- TYPES ---
interface AttendanceDetail {
  status: 'Present' | 'Absent' | 'Late' | 'Leave' | 'Half-Day';
  check_in?: string;
  check_out?: string;
}

interface StaffWeeklyData {
  staff_id: string;
  staff_name: string;
  designation: string;
  overall_percentage: number;
  records: Record<string, AttendanceDetail>; // Key: "yyyy-MM-dd"
}

interface PayrollSummary {
  staff_id: string;
  staff_name: string;
  designation: string;
  basic_salary: number;
  total_presents: number;
  total_lates: number;
  total_half_days: number;
  total_leaves: number;
  actual_absents: number;
  penalty_absents: number;
  lwp_days: number;
  total_deductible_days: number;
  deduction_amount: number;
  net_payable_salary: number;
}

const getMondayOfWeek = (dateStr?: string) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
};

export default function StaffAttendance() {
  const navigate = useNavigate();
  const tenantId = localStorage.getItem("tenantId") || "";

  // --- TABS ---
  const [activeTab, setActiveTab] = useState<'weekly' | 'payroll'>('weekly');

  // --- TAB 1: WEEKLY ATTENDANCE STATES ---
  const [weekStart, setWeekStart] = useState<string>(() => getMondayOfWeek());
  const [staffData, setStaffData] = useState<StaffWeeklyData[]>([]);
  const [isWeeklyLoading, setIsWeeklyLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState<StaffWeeklyData[]>([]);
  const [modifiedDates, setModifiedDates] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [timeModal, setTimeModal] = useState<{
    isOpen: boolean;
    staffId: string;
    staffName: string;
    dateKey: string;
    checkIn: string;
    checkOut: string;
    status: AttendanceDetail['status'];
  } | null>(null);

  // --- TAB 2: PAYROLL ENGINE STATES ---
  const [payrollMonth, setPayrollMonth] = useState<number>(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState<number>(new Date().getFullYear());
  const [latesConfig, setLatesConfig] = useState<number>(3);
  const [halfDaysConfig, setHalfDaysConfig] = useState<number>(2);
  const [leavesConfig, setLeavesConfig] = useState<number>(2);
  const [payrollData, setPayrollData] = useState<PayrollSummary[]>([]);
  const [isPayrollLoading, setIsPayrollLoading] = useState(false);

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

  const weekEnd = useMemo(() => (daysOfWeek.length > 0 ? daysOfWeek[6].dateKey : ''), [daysOfWeek]);
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);

  // --- FETCH WEEKLY DATA ---
  const fetchWeeklyMatrix = async () => {
    if (!tenantId || !weekStart) return;
    setIsWeeklyLoading(true);
    try {
      const res = await api.get<StaffWeeklyData[]>('/staffattendances/weekly-matrix', {
        params: { tenantId, startDate: weekStart, endDate: weekEnd }
      });
      setStaffData(res.data);
    } catch {
      toast.error('Unable to fetch staff weekly attendance matrix.');
    } finally {
      setIsWeeklyLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'weekly') {
      fetchWeeklyMatrix();
      setIsEditing(false);
    }
  }, [weekStart, tenantId, activeTab]);

  useEffect(() => {
    setLocalData(JSON.parse(JSON.stringify(staffData)));
    setModifiedDates(new Set());
  }, [staffData]);

  // --- WEEK NAVIGATION ---
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
  const hasContinuousAbsents = (staff: StaffWeeklyData) => {
    let absentStreak = 0;
    for (const day of daysOfWeek) {
      if (day.isHoliday) continue;
      const rec = staff.records[day.dateKey];
      if (rec && rec.status === 'Absent') {
        absentStreak++;
        if (absentStreak >= 3) return true;
      } else {
        absentStreak = 0;
      }
    }
    return false;
  };

  // --- BIOMETRIC SYNC ---
  const handleBiometricSync = async () => {
    const today = new Date().toISOString().split('T')[0];
    const result = await Swal.fire({
      title: 'Sync Biometric Device?',
      text: `Import time logs and punch-ins from biometric machine for today (${today})?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Sync Now',
      confirmButtonColor: '#2563eb'
    });

    if (result.isConfirmed) {
      setIsSyncing(true);
      try {
        await api.post('/staffattendances/sync-biometric', { tenant_id: tenantId, date: today });
        Swal.fire({
          icon: 'success',
          title: 'Device Synced!',
          text: 'Biometric records successfully imported.',
          timer: 1800,
          showConfirmButton: false
        });
        fetchWeeklyMatrix();
      } catch {
        Swal.fire('Sync Error', 'Unable to reach the biometric device or server.', 'error');
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // --- EDITING INTERACTIONS ---
  const toggleEditMode = () => setIsEditing(prev => !prev);

  const handleCellClick = (staffId: string, dateKey: string, isHoliday: boolean) => {
    if (!isEditing || isHoliday) return;
    setLocalData((prev) => {
      const newData = [...prev];
      const staff = newData.find(s => s.staff_id === staffId);
      if (staff) {
        const currentRecord = staff.records[dateKey];
        let nextStatus: AttendanceDetail['status'] = 'Present';

        if (currentRecord) {
          if (currentRecord.status === 'Present') nextStatus = 'Absent';
          else if (currentRecord.status === 'Absent') nextStatus = 'Late';
          else if (currentRecord.status === 'Late') nextStatus = 'Half-Day';
          else if (currentRecord.status === 'Half-Day') nextStatus = 'Leave';
          else if (currentRecord.status === 'Leave') nextStatus = 'Present';
        }
        staff.records[dateKey] = { ...currentRecord, status: nextStatus };
      }
      return newData;
    });
    setModifiedDates(prev => new Set(prev).add(dateKey));
  };

  const markAllForDay = (dateKey: string) => {
    setLocalData((prev) => {
      const newData = [...prev];
      newData.forEach(staff => {
        staff.records[dateKey] = { ...staff.records[dateKey], status: 'Present' };
      });
      return newData;
    });
    setModifiedDates(prev => new Set(prev).add(dateKey));
    toast.success(`Marked all faculty & staff as Present for ${dateKey}`);
  };

  const openTimeModal = (staffId: string, staffName: string, dateKey: string, isHoliday: boolean) => {
    if (!isEditing || isHoliday) return;
    const staff = localData.find(s => s.staff_id === staffId);
    if (!staff) return;
    const record = staff.records[dateKey] || { status: 'Present', check_in: '', check_out: '' };

    const formatTime = (isoString?: string) => {
      if (!isoString) return '';
      const d = new Date(isoString);
      return isNaN(d.getTime()) ? isoString : d.toTimeString().substring(0, 5);
    };

    setTimeModal({
      isOpen: true,
      staffId,
      staffName,
      dateKey,
      status: record.status,
      checkIn: formatTime(record.check_in),
      checkOut: formatTime(record.check_out)
    });
  };

  const saveTimeModal = () => {
    if (!timeModal) return;
    setLocalData((prev) => {
      const newData = [...prev];
      const staff = newData.find(s => s.staff_id === timeModal.staffId);
      if (staff) {
        staff.records[timeModal.dateKey] = {
          ...staff.records[timeModal.dateKey],
          status: timeModal.status,
          check_in: timeModal.checkIn,
          check_out: timeModal.checkOut
        };
      }
      return newData;
    });
    setModifiedDates(prev => new Set(prev).add(timeModal.dateKey));
    setTimeModal(null);
    toast.success('Punch timings updated.');
  };

  const discardEdits = () => {
    if (modifiedDates.size > 0) {
      Swal.fire({
        title: 'Discard Changes?',
        text: 'Are you sure you want to discard all unsaved changes?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Yes, Discard'
      }).then((result) => {
        if (result.isConfirmed) {
          setLocalData(JSON.parse(JSON.stringify(staffData)));
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
        const records = localData.map(s => {
          const rec = s.records[date];
          return {
            staff_id: s.staff_id,
            status: rec?.status || 'Present',
            check_in: rec?.check_in && !rec.check_in.includes('T') ? `${date}T${rec.check_in}:00Z` : rec?.check_in || null,
            check_out: rec?.check_out && !rec.check_out.includes('T') ? `${date}T${rec.check_out}:00Z` : rec?.check_out || null
          };
        });
        return api.post('/staffattendances/bulk-mark', {
          tenant_id: tenantId,
          date: date,
          records: records
        });
      });

      await Promise.all(savePromises);
      Swal.fire({
        icon: 'success',
        title: 'Staff Attendance Saved!',
        text: `Successfully synced attendance across ${modifiedDates.size} date(s).`,
        timer: 1800,
        showConfirmButton: false
      });
      setIsEditing(false);
      fetchWeeklyMatrix();
    } catch {
      Swal.fire('Save Error', 'Failed to save staff attendance logs.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // --- PDF EXPORT ---
  const exportToPDF = () => {
    if (localData.length === 0) {
      Swal.fire('Notice', 'No attendance data available to export.', 'info');
      return;
    }
    const doc = new jsPDF('landscape');
    doc.setFontSize(18);
    doc.text("Faculty & Staff Weekly Attendance Broadsheet", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Week Period: ${weekStart} to ${weekEnd}`, 14, 28);

    const tableColumns = ["Staff Member", "Designation", "Weekly %", ...daysOfWeek.map(d => `${d.dayName} ${d.displayDate}`)];
    const tableRows = localData.map(staff => {
      const rowData = [staff.staff_name, staff.designation, `${staff.overall_percentage}%`];
      daysOfWeek.forEach(day => {
        if (day.isHoliday) {
          rowData.push("Holiday");
        } else {
          const rec = staff.records[day.dateKey];
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

    doc.save(`Staff_Attendance_${weekStart}.pdf`);
    toast.success('Staff Attendance PDF downloaded!');
  };

  // --- CSV EXPORT ---
  const exportToCSV = () => {
    if (localData.length === 0) {
      Swal.fire('Notice', 'No attendance records available to export.', 'info');
      return;
    }
    const headers = ['Staff Name', 'Designation', 'Weekly Percentage', ...daysOfWeek.map(d => `${d.fullDayName} (${d.dateKey})`)];
    const rows = localData.map(s => [
      `"${s.staff_name || ''}"`,
      `"${s.designation || ''}"`,
      `"${s.overall_percentage}%"`,
      ...daysOfWeek.map(d => {
        if (d.isHoliday) return '"Holiday"';
        const rec = s.records[d.dateKey];
        if (!rec) return '"Not Marked"';
        let text = rec.status;
        if (rec.check_in || rec.check_out) {
          text += ` (${rec.check_in || '--'} - ${rec.check_out || '--'})`;
        }
        return `"${text}"`;
      })
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Staff_Attendance_${weekStart}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Staff attendance CSV exported successfully!');
  };

  // --- TAB 2: PAYROLL ENGINE LOGIC ---
  const fetchPayrollSummary = async () => {
    if (!tenantId) return;
    setIsPayrollLoading(true);
    try {
      const res = await api.get<PayrollSummary[]>('/staffattendances/payroll-summary', {
        params: {
          tenantId,
          month: payrollMonth,
          year: payrollYear,
          latesPerAbsent: latesConfig,
          halfDaysPerAbsent: halfDaysConfig,
          allowedLeaves: leavesConfig
        }
      });
      setPayrollData(res.data);
    } catch {
      Swal.fire('Error', 'Unable to calculate payroll summary.', 'error');
    } finally {
      setIsPayrollLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'payroll') {
      fetchPayrollSummary();
    }
  }, [activeTab, payrollMonth, payrollYear]);

  // --- KPI STATS CALCULATION ---
  const totalStaff = localData.length;
  const todayPresents = localData.filter(s => s.records[todayKey]?.status === 'Present').length;
  const todayAbsents = localData.filter(s => s.records[todayKey]?.status === 'Absent').length;
  const atRiskCount = localData.filter(s => hasContinuousAbsents(s)).length;
  const avgPercentage = totalStaff > 0
    ? Math.round(localData.reduce((acc, curr) => acc + (curr.overall_percentage || 0), 0) / totalStaff)
    : 0;

  const statCardsData: StatCardData[] = [
    {
      title: 'Total Faculty & Staff',
      value: totalStaff,
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
      title: 'Staff Weekly Average',
      value: `${avgPercentage}%`,
      icon: <Calendar className="w-5 h-5 text-indigo-500" />,
      theme: 'indigo'
    }
  ];

  // --- FILTERED STAFF ROWS (SEARCH) ---
  const displayedStaff = useMemo(() => {
    if (!searchQuery.trim()) return localData;
    const q = searchQuery.toLowerCase();
    return localData.filter(s =>
      s.staff_name.toLowerCase().includes(q) ||
      (s.designation && s.designation.toLowerCase().includes(q))
    );
  }, [localData, searchQuery]);

  return (
    <div className="w-full space-y-6">

      {/* TOP HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Attendance Manager</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track daily attendance punch-ins, weekly percentages, and automated payroll deductions.
          </p>
        </div>

        {activeTab === 'weekly' && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBiometricSync}
              loading={isSyncing}
              loadingText="Syncing..."
              startIcon={<RefreshCw className="w-4 h-4 text-blue-600" />}
            >
              Sync Biometric
            </Button>
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
        )}
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex p-1.5 space-x-2 bg-gray-100 dark:bg-gray-800/60 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'weekly'
              ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4" /> Weekly Grid & Time Tracking
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'payroll'
              ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Monthly Payroll Deductions
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WEEKLY ATTENDANCE MATRIX                                           */}
      {/* ========================================================================= */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">

          {/* TOP KPI STAT CARDS */}
          <StatCards stats={statCardsData} loading={isWeeklyLoading} count={4} />

          {/* AT-RISK ATTENTION BANNER */}
          {atRiskCount > 0 && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center justify-between text-rose-800 dark:text-rose-200 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <h4 className="text-sm font-bold">Faculty Attendance Risk Warning</h4>
                  <p className="text-xs text-rose-600 dark:text-rose-300 mt-0.5">
                    {atRiskCount} staff member(s) have accumulated 3 or more consecutive absences this week.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* FILTERS & WEEK NAVIGATOR CARD */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">

              {/* Week Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-52">
                  <DatePicker
                    id="staff-weekly-date-picker"
                    value={weekStart}
                    onChange={(e) => setWeekStart(e.target.value)}
                    placeholder="Select Week Start Date"
                  />
                </div>

                <div className="flex items-center gap-1.5">
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
                </div>

                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">
                  {weekStart} <span className="text-gray-400">to</span> {weekEnd}
                </span>
              </div>

              {/* In-Grid Real-Time Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search staff or designation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

            </div>
          </div>

          {/* EDIT MODE BANNER */}
          {isEditing && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-800 dark:text-amber-200">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-amber-100 dark:bg-amber-900/60 rounded-lg text-amber-600 dark:text-amber-400 font-bold">
                  ✏️
                </span>
                <span className="text-xs font-semibold">
                  <span className="font-bold">Edit Mode Active:</span> Single-click any cell to cycle status (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Present</span> ➜{' '}
                  <span className="text-rose-600 dark:text-rose-400 font-bold">Absent</span> ➜{' '}
                  <span className="text-amber-600 dark:text-amber-400 font-bold">Late</span> ➜{' '}
                  <span className="text-purple-600 dark:text-purple-400 font-bold">Half-Day</span> ➜{' '}
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Leave</span>
                  ). Double-click a cell to edit exact punch-in/out timestamps.
                </span>
              </div>
              <div className="text-xs font-bold text-amber-700 dark:text-amber-300">
                {modifiedDates.size} date(s) altered
              </div>
            </div>
          )}

          {/* ATTENDANCE BROADSHEET TABLE */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            
            {/* Header Legend */}
            <div className="px-6 py-3 bg-gray-50/70 dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Faculty Attendance Grid ({displayedStaff.length} Members)
              </span>

              <div className="flex items-center gap-3 font-medium text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Present</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Absent</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Late</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Half-Day</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Leave</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Holiday</span>
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto min-h-[350px]">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    {/* Sticky Staff Column */}
                    <th className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 w-72 bg-gray-50 dark:bg-gray-800 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      Faculty / Staff Details
                    </th>

                    {/* Weekday Columns */}
                    {daysOfWeek.map((day) => {
                      const isToday = day.dateKey === todayKey;
                      return (
                        <th
                          key={day.dateKey}
                          className={`px-3 py-3.5 text-center border-b border-gray-200 dark:border-gray-800 min-w-[135px] relative group ${
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
                  {isWeeklyLoading ? (
                    Array.from({ length: 5 }).map((_, rIdx) => (
                      <tr key={`staff-skel-${rIdx}`} className="animate-pulse">
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
                  ) : displayedStaff.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-gray-400 dark:text-gray-500">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                          <p className="font-bold text-gray-800 dark:text-white">No faculty or staff records found</p>
                          <p className="text-xs text-gray-400 max-w-xs text-center">Add teachers and staff in the Staff Directory to begin recording daily or biometric attendance.</p>
                          <button
                            type="button"
                            onClick={() => navigate('/StaffDirectory?action=new')}
                            className="mt-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Staff in Directory</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    displayedStaff.map((staff) => {
                      const isAtRisk = hasContinuousAbsents(staff);

                      return (
                        <tr key={staff.staff_id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                          
                          {/* Sticky Staff Profile Column */}
                          <td className="px-6 py-3.5 bg-white dark:bg-gray-900 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs ${getAvatarGradient(staff.staff_name)} shrink-0 shadow-xs`}>
                                {getInitials(staff.staff_name.split(' ')[0] || '', staff.staff_name.split(' ')[1] || '')}
                              </div>

                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[140px]" title={staff.staff_name}>
                                    {staff.staff_name}
                                  </span>
                                  {isAtRisk && (
                                    <span className="text-rose-500 text-xs font-bold" title="3+ consecutive absences this week">
                                      ⚠️ Risk
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center justify-between gap-2 mt-0.5 text-xs">
                                  <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-[120px]">
                                    {staff.designation}
                                  </span>
                                  <span className={`font-bold text-[11px] ${staff.overall_percentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {staff.overall_percentage}%
                                  </span>
                                </div>

                                {/* Mini percentage progress bar */}
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1 mt-1 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${staff.overall_percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                    style={{ width: `${Math.min(staff.overall_percentage, 100)}%` }}
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

                            const record = staff.records[day.dateKey];
                            const isCellEdited = modifiedDates.has(day.dateKey);

                            if (!record) {
                              return (
                                <td
                                  key={day.dateKey}
                                  onClick={() => handleCellClick(staff.staff_id, day.dateKey, day.isHoliday)}
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
                                onClick={() => handleCellClick(staff.staff_id, day.dateKey, day.isHoliday)}
                                onDoubleClick={() => openTimeModal(staff.staff_id, staff.staff_name, day.dateKey, day.isHoliday)}
                                title={isEditing ? "Single-click: Cycle status\nDouble-click: Edit punch times" : ""}
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

                                  {status === 'Half-Day' && (
                                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 flex items-center gap-1 shadow-2xs">
                                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Half-Day
                                    </span>
                                  )}

                                  {status === 'Leave' && (
                                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 flex items-center gap-1 shadow-2xs">
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Leave
                                    </span>
                                  )}

                                  {/* Punch Timings Indicator if available */}
                                  {(record.check_in || record.check_out) && (
                                    <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5" /> {record.check_in || '--'} - {record.check_out || '--'}
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
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MONTHLY PAYROLL DEDUCTION ENGINE                                   */}
      {/* ========================================================================= */}
      {activeTab === 'payroll' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 space-y-6">

          {/* Config Controls Bar */}
          <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            
            {/* Month & Year Select */}
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Payroll Month</label>
                <select
                  value={payrollMonth}
                  onChange={(e) => setPayrollMonth(parseInt(e.target.value))}
                  className="h-10 px-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('en', { month: 'long' })}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Year</label>
                <input
                  type="number"
                  min="2020"
                  max="2100"
                  value={payrollYear}
                  onChange={(e) => setPayrollYear(parseInt(e.target.value))}
                  className="w-24 h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500 dark:text-white text-center"
                />
              </div>
            </div>

            {/* Config Inputs & Calculate Action */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 shadow-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Lates = 1 Absent</span>
                  <input
                    type="number"
                    min="1"
                    value={latesConfig}
                    onChange={e => setLatesConfig(parseInt(e.target.value) || 3)}
                    className="w-16 text-sm font-bold bg-transparent outline-none dark:text-white border-b border-dashed border-gray-300 dark:border-gray-600 text-center"
                  />
                </div>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Half-Days = 1 Absent</span>
                  <input
                    type="number"
                    min="1"
                    value={halfDaysConfig}
                    onChange={e => setHalfDaysConfig(parseInt(e.target.value) || 2)}
                    className="w-16 text-sm font-bold bg-transparent outline-none dark:text-white border-b border-dashed border-gray-300 dark:border-gray-600 text-center"
                  />
                </div>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Allowed Leaves</span>
                  <input
                    type="number"
                    min="0"
                    value={leavesConfig}
                    onChange={e => setLeavesConfig(parseInt(e.target.value) || 0)}
                    className="w-16 text-sm font-bold bg-transparent outline-none dark:text-white border-b border-dashed border-gray-300 dark:border-gray-600 text-center"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                onClick={fetchPayrollSummary}
                loading={isPayrollLoading}
                loadingText="Calculating..."
                startIcon={<Calculator className="w-4 h-4" />}
                className="h-11"
              >
                Calculate Engine
              </Button>
            </div>

          </div>

          {/* Payroll Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">Faculty Member</th>
                  <th className="px-5 py-4 text-right">Basic Salary</th>
                  <th className="px-5 py-4 text-center bg-blue-50/50 dark:bg-blue-900/10 border-l border-r border-gray-200 dark:border-gray-700">
                    Attendance Log (P / A / L / H / Lv)
                  </th>
                  <th className="px-5 py-4 text-center bg-rose-50/50 dark:bg-rose-900/10">Rule Penalties</th>
                  <th className="px-5 py-4 text-right text-rose-600 dark:text-rose-400">Deductions (-Rs)</th>
                  <th className="px-5 py-4 text-right bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400">
                    Net Payable Salary
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {isPayrollLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={`payroll-skel-${idx}`} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-32" /></td>
                      <td className="px-5 py-4 text-right"><div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-20 ml-auto" /></td>
                      <td className="px-5 py-4 text-center"><div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-28 mx-auto" /></td>
                      <td className="px-5 py-4 text-center"><div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-24 mx-auto" /></td>
                      <td className="px-5 py-4 text-right"><div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-24 ml-auto" /></td>
                      <td className="px-5 py-4 text-right"><div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-28 ml-auto" /></td>
                    </tr>
                  ))
                ) : payrollData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400 dark:text-gray-500">
                      Click "Calculate Engine" to run automatic attendance deduction rules.
                    </td>
                  </tr>
                ) : (
                  payrollData.map((staff) => (
                    <tr key={staff.staff_id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-gray-900 dark:text-white">{staff.staff_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{staff.designation}</p>
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-semibold text-gray-700 dark:text-gray-300">
                        Rs. {staff.basic_salary.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-center border-l border-r border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-center gap-2.5 text-xs font-bold">
                          <span className="text-emerald-600 dark:text-emerald-400" title="Present">{staff.total_presents}P</span>
                          <span className="text-rose-600 dark:text-rose-400" title="Actual Absent">{staff.actual_absents}A</span>
                          <span className="text-amber-600 dark:text-amber-400" title="Lates">{staff.total_lates}L</span>
                          <span className="text-purple-600 dark:text-purple-400" title="Half Days">{staff.total_half_days}H</span>
                          <span className="text-blue-600 dark:text-blue-400" title="Leaves">{staff.total_leaves}Lv</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex flex-col text-[11px] font-bold gap-1">
                          <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 px-2 py-0.5 rounded">
                            +{staff.penalty_absents} Rule Penalties
                          </span>
                          <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 px-2 py-0.5 rounded">
                            +{staff.lwp_days} LWP (Leaves &gt; {leavesConfig})
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{staff.total_deductible_days} Days Deducted</p>
                        <p className="font-bold text-rose-600 dark:text-rose-400 mt-0.5">- Rs. {staff.deduction_amount.toLocaleString()}</p>
                      </td>
                      <td className="px-5 py-4 text-right bg-emerald-50/40 dark:bg-emerald-950/10">
                        <span className="inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold px-3 py-1.5 rounded-lg text-sm font-mono shadow-2xs">
                          Rs. {staff.net_payable_salary.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TIME TRACKING POPUP MODAL */}
      {timeModal && timeModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Edit Exact Punch Times</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Set check-in and check-out times for <span className="font-semibold text-brand-600 dark:text-brand-400">{timeModal.staffName}</span> on {timeModal.dateKey}.
            </p>

            <div className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1.5">Attendance Status</label>
                <select
                  value={timeModal.status}
                  onChange={(e) => setTimeModal({ ...timeModal, status: e.target.value as any })}
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half-Day">Half-Day</option>
                  <option value="Leave">Leave</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1.5">Check-In Time</label>
                  <input
                    type="time"
                    value={timeModal.checkIn}
                    onChange={(e) => setTimeModal({ ...timeModal, checkIn: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1.5">Check-Out Time</label>
                  <input
                    type="time"
                    value={timeModal.checkOut}
                    onChange={(e) => setTimeModal({ ...timeModal, checkOut: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button variant="outline" size="sm" onClick={() => setTimeModal(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={saveTimeModal}>
                Update Punch Timing
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}