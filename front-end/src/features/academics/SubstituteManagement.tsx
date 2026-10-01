import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import api from '../../utils/axiosConfig';
import { 
  Calendar as CalendarIcon, Clock, MapPin, BookOpen, User, CheckCircle2, 
  AlertCircle, Loader2, Sparkles, Download, Search, Printer, Grid, List,
  UserCheck, UserX, ShieldAlert, CheckCircle, ArrowRight
} from 'lucide-react';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import DatePicker from '../../components/form/date-picker';
import Button from '../../components/ui/button/Button';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { toast } from '../../components/ui/Toast';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TimetablePeriod {
  id: string;
  class_id: string;
  section_id: string;
  subject_id: string;
  staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_name?: string;
}

interface TimetableProxy {
  id: string;
  timetable_period_id: string;
  date_of_proxy: string;
  substitute_staff_id: string;
}

export default function SubstituteManagement() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedAbsentTeacher, setSelectedAbsentTeacher] = useState<string>('');
  
  const [periods, setPeriods] = useState<TimetablePeriod[]>([]);
  const [proxies, setProxies] = useState<TimetableProxy[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoAllocating, setAutoAllocating] = useState(false);
  
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'covered'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Maps period_id to a selected substitute_staff_id for periods not yet saved
  const [pendingAllocations, setPendingAllocations] = useState<Record<string, string>>({});
  // Maps period_id to a list of free teachers for that period
  const [freeTeachersForPeriod, setFreeTeachersForPeriod] = useState<Record<string, any[]>>({});

  const tenantId = localStorage.getItem("tenantId") || "";

  useEffect(() => {
    fetchInitialData();
  }, [tenantId]);

  useEffect(() => {
    if (selectedDate && selectedAbsentTeacher) {
      loadAbsentTeacherSchedule();
    } else {
      setPeriods([]);
      setProxies([]);
      setFreeTeachersForPeriod({});
      setPendingAllocations({});
    }
  }, [selectedDate, selectedAbsentTeacher]);

  const fetchInitialData = async () => {
    try {
      if (!tenantId) return;
      const [staffRes, subRes, classRes, secRes] = await Promise.all([
        api.get(`/staff/tenant/${tenantId}`),
        api.get(`/subjects/tenant/${tenantId}`),
        api.get(`/classes/tenant/${tenantId}`),
        api.get(`/sections/tenant/${tenantId}`)
      ]);
      setStaff(staffRes.data || []);
      setSubjects(subRes.data || []);
      setClasses(classRes.data || []);
      setSections(secRes.data || []);
    } catch (error) {
      console.error('Failed to fetch initial data', error);
      toast.error('Failed to load faculty directory');
    }
  };

  const loadAbsentTeacherSchedule = async () => {
    setLoading(true);
    setPendingAllocations({});
    setFreeTeachersForPeriod({});
    try {
      // 1. Determine day of week from selectedDate
      const dateObj = new Date(selectedDate);
      const dayOfWeek = dateObj.getDay();

      // 2. Fetch all periods for this teacher
      const periodRes = await api.get(`/timetableperiods/tenant/${tenantId}/teacher/${selectedAbsentTeacher}`);
      
      // Filter only periods for the selected day of the week
      const todaysPeriods = (periodRes.data || [])
        .filter((p: any) => p.day_of_week === dayOfWeek)
        .sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));
      setPeriods(todaysPeriods);

      // 3. Fetch existing proxies for this date
      const proxyRes = await api.get(`/timetableproxies/tenant/${tenantId}/date/${selectedDate}`);
      setProxies(proxyRes.data || []);

      // 4. Pre-fetch free teachers for each period
      const freeTeacherMap: Record<string, any[]> = {};
      for (const p of todaysPeriods) {
        const alreadyProxied = (proxyRes.data || []).find((pr: any) => pr.timetable_period_id === p.id);
        if (!alreadyProxied) {
          try {
            const ftRes = await api.get(`/timetableperiods/tenant/${tenantId}/free-teachers?dayOfWeek=${dayOfWeek}&start=${p.start_time}&end=${p.end_time}&date=${selectedDate}`);
            freeTeacherMap[p.id] = (ftRes.data || []).filter((t: any) => t.id !== selectedAbsentTeacher);
          } catch (e) {
            freeTeacherMap[p.id] = [];
          }
        }
      }
      setFreeTeachersForPeriod(freeTeacherMap);

    } catch (error) {
      console.error('Failed to load schedule', error);
      toast.error('Could not load teacher schedule for selected date');
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (periodId: string) => {
    const substituteId = pendingAllocations[periodId];
    if (!substituteId) {
      toast.info('Please select a substitute teacher first.');
      return;
    }

    try {
      await api.post('/timetableproxies', {
        tenant_id: tenantId,
        timetable_period_id: periodId,
        date_of_proxy: selectedDate,
        absent_staff_id: selectedAbsentTeacher,
        substitute_staff_id: substituteId
      });
      toast.success('Substitute allocated successfully');
      loadAbsentTeacherSchedule();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to allocate substitute');
    }
  };

  const handleAutoAllocateAll = async () => {
    const unallocatedPeriods = periods.filter(p => !proxies.some(pr => pr.timetable_period_id === p.id));
    if (unallocatedPeriods.length === 0) {
      toast.info('All periods are already covered!');
      return;
    }

    const confirm = await Swal.fire({
      title: 'Smart Auto-Allocate Substitutes?',
      text: `Automatically assign available free teachers to ${unallocatedPeriods.length} unassigned period(s)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Auto-Allocate',
      confirmButtonColor: '#2563eb'
    });

    if (!confirm.isConfirmed) return;

    setAutoAllocating(true);
    let successCount = 0;
    try {
      for (const period of unallocatedPeriods) {
        const freeList = freeTeachersForPeriod[period.id] || [];
        if (freeList.length > 0) {
          const selectedSub = freeList[0]; // Pick first available free teacher
          await api.post('/timetableproxies', {
            tenant_id: tenantId,
            timetable_period_id: period.id,
            date_of_proxy: selectedDate,
            absent_staff_id: selectedAbsentTeacher,
            substitute_staff_id: selectedSub.id
          });
          successCount++;
        }
      }
      toast.success(`Successfully auto-allocated ${successCount} substitute(s)!`);
      loadAbsentTeacherSchedule();
    } catch (err) {
      toast.error('Error during auto-allocation process');
    } finally {
      setAutoAllocating(false);
    }
  };

  const handleDeleteProxy = async (proxyId: string) => {
    const result = await Swal.fire({
      title: 'Remove Substitute?',
      text: 'Are you sure you want to cancel this proxy assignment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Remove'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/timetableproxies/${proxyId}`);
        toast.info('Substitute assignment removed');
        loadAbsentTeacherSchedule();
      } catch (error) {
        toast.error('Failed to remove substitute proxy');
      }
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Subject';
  const getClassName = (id: string) => classes.find(c => c.id === id)?.name || '';
  const getSectionName = (id: string) => sections.find(s => s.id === id)?.name || '';
  const getStaffName = (id: string) => {
    const s = staff.find(st => st.id === id);
    if (!s) return 'Substitute Teacher';
    const fullName = `${s.first_name || ''} ${s.last_name || ''}`.trim();
    return fullName || s.designation || 'Faculty Member';
  };

  // Filtered Periods list based on Status & Search
  const filteredPeriods = useMemo(() => {
    return periods.filter(p => {
      const isCovered = proxies.some(pr => pr.timetable_period_id === p.id);
      
      if (statusFilter === 'covered' && !isCovered) return false;
      if (statusFilter === 'pending' && isCovered) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const subName = getSubjectName(p.subject_id).toLowerCase();
      const clsName = getClassName(p.class_id).toLowerCase();
      const secName = getSectionName(p.section_id).toLowerCase();
      const roomName = (p.room_name || '').toLowerCase();

      return subName.includes(q) || clsName.includes(q) || secName.includes(q) || roomName.includes(q);
    });
  }, [periods, proxies, statusFilter, searchQuery, subjects, classes, sections]);

  // StatCards KPI Data
  const statsData: StatCardData[] = useMemo(() => {
    if (!selectedAbsentTeacher || !selectedDate) return [];

    const totalClasses = periods.length;
    const coveredCount = periods.filter(p => proxies.some(pr => pr.timetable_period_id === p.id)).length;
    const pendingCount = totalClasses - coveredCount;

    return [
      {
        title: 'Classes to Cover',
        value: `${totalClasses} Periods`,
        icon: <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
        theme: 'brand'
      },
      {
        title: 'Covered Proxies',
        value: `${coveredCount} Assigned`,
        icon: <UserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
        theme: 'success'
      },
      {
        title: 'Pending Coverage',
        value: `${pendingCount} Unassigned`,
        icon: <UserX className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
        theme: 'warning'
      },
      {
        title: 'Coverage Status',
        value: totalClasses > 0 && coveredCount === totalClasses ? '100% Complete' : `${coveredCount}/${totalClasses} Slots`,
        icon: <CheckCircle className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
        theme: 'sky'
      }
    ];
  }, [selectedAbsentTeacher, selectedDate, periods, proxies]);

  // Export Daily Arrangement PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const absentTeacherName = getStaffName(selectedAbsentTeacher);
    const dateFormatted = new Date(selectedDate).toLocaleDateString();
    
    doc.text(`Daily Teacher Substitute Arrangement Sheet`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Absent Faculty: ${absentTeacherName} | Date: ${dateFormatted}`, 14, 22);

    const tableData: any[] = [];
    periods.forEach((p, idx) => {
      const proxy = proxies.find(pr => pr.timetable_period_id === p.id);
      tableData.push([
        `Period ${idx + 1}`,
        `${formatTime(p.start_time)} - ${formatTime(p.end_time)}`,
        getSubjectName(p.subject_id),
        `Class ${getClassName(p.class_id)} (${getSectionName(p.section_id)})`,
        p.room_name || 'N/A',
        proxy ? getStaffName(proxy.substitute_staff_id) : 'UNASSIGNED'
      ]);
    });

    autoTable(doc, {
      startY: 28,
      head: [['Period', 'Time Slot', 'Subject', 'Class & Sec', 'Room', 'Assigned Substitute']],
      body: tableData,
    });
    doc.save(`substitute_arrangement_${absentTeacherName.replace(/\s+/g, '_')}_${selectedDate}.pdf`);
    toast.success('Arrangement sheet PDF generated');
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['Period', 'Time Slot', 'Subject', 'Class Section', 'Room', 'Substitute Teacher'];
    const csvRows: any[] = [];
    periods.forEach((p, idx) => {
      const proxy = proxies.find(pr => pr.timetable_period_id === p.id);
      csvRows.push([
        `Period ${idx + 1}`,
        `${formatTime(p.start_time)} - ${formatTime(p.end_time)}`,
        getSubjectName(p.subject_id).replace(/,/g, ' '),
        `Class ${getClassName(p.class_id)} (${getSectionName(p.section_id)})`.replace(/,/g, ' '),
        (p.room_name || 'N/A').replace(/,/g, ' '),
        (proxy ? getStaffName(proxy.substitute_staff_id) : 'UNASSIGNED').replace(/,/g, ' ')
      ]);
    });

    const csvContent = [headers, ...csvRows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const absentTeacherName = getStaffName(selectedAbsentTeacher);

    link.setAttribute("href", url);
    link.setAttribute("download", `substitute_arrangement_${absentTeacherName.replace(/\s+/g, '_')}_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Arrangement CSV downloaded');
  };

  return (
    <div className="w-full max-w-full space-y-6">
      {/* Top Breadcrumb Navigation */}
      <Breadcrumb items={[
        { label: 'Academics', href: '/academics' },
        { label: 'Substitute Management' }
      ]} />

      {/* Header Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-blue-500" />
              Substitute Management
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Allocate substitute teachers for absent faculty members and print daily arrangement slips.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={handleAutoAllocateAll}
              disabled={autoAllocating || !selectedAbsentTeacher || periods.length === 0}
              className="px-3.5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all h-11 flex items-center gap-1.5 shadow-sm disabled:opacity-40"
              title="Smart Auto-Allocate Free Substitutes"
            >
              <Sparkles className="w-4 h-4" />
              <span>Smart Auto-Allocate</span>
            </button>
            <button 
              onClick={exportPDF}
              disabled={!selectedAbsentTeacher || periods.length === 0}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-300 transition-colors h-11 flex items-center justify-center disabled:opacity-40"
              title="Export Arrangement Sheet (PDF)"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button 
              onClick={exportCSV}
              disabled={!selectedAbsentTeacher || periods.length === 0}
              className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors h-11 flex items-center justify-center disabled:opacity-40"
              title="Export CSV"
            >
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Selection Control Box */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
              <CalendarIcon className="w-4 h-4 text-blue-500" /> Date of Absence *
            </label>
            <DatePicker
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              placeholder="Select date"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
              <User className="w-4 h-4 text-blue-500" /> Absent Teacher *
            </label>
            <SearchableSelect 
              options={staff.map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name}` }))}
              placeholder="Search & select absent teacher..."
              onChange={val => setSelectedAbsentTeacher(val)}
              value={selectedAbsentTeacher}
            />
          </div>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      {selectedAbsentTeacher && selectedDate && (
        <StatCards stats={statsData} loading={loading} />
      )}

      {/* Periods & Substitutes Section */}
      {selectedDate && selectedAbsentTeacher && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          
          {/* Controls Bar: Search & Status Filters */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search subject, class, or room..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                All Slots ({periods.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'pending' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Pending ({periods.filter(p => !proxies.some(pr => pr.timetable_period_id === p.id)).length})
              </button>
              <button
                onClick={() => setStatusFilter('covered')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'covered' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Covered ({periods.filter(p => proxies.some(pr => pr.timetable_period_id === p.id)).length})
              </button>

              <div className="ml-2 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-1 shadow-sm">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg text-xs transition-all ${viewMode === 'cards' ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
                  title="Cards View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs transition-all ${viewMode === 'table' ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-44 bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-800" />
              ))}
            </div>
          ) : periods.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-60" />
              <h4 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">No Classes Scheduled Today!</h4>
              <p className="text-sm mt-1 max-w-md mx-auto text-gray-500 dark:text-gray-400">
                {getStaffName(selectedAbsentTeacher)} has no teaching periods on {new Date(selectedDate).toLocaleDateString()}.
              </p>
            </div>
          ) : (
            <div className="p-6">
              
              {/* VIEW 1: CARDS VIEW */}
              {viewMode === 'cards' && (
                <div className="space-y-4">
                  {filteredPeriods.map((period, idx) => {
                    const existingProxy = proxies.find(pr => pr.timetable_period_id === period.id);
                    const isCovered = !!existingProxy;
                    const freeTeachers = freeTeachersForPeriod[period.id] || [];

                    return (
                      <div 
                        key={period.id} 
                        className={`relative flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border transition-all ${
                          isCovered 
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60' 
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm'
                        }`}
                      >
                        {/* Side Accent Line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${isCovered ? 'bg-emerald-500' : 'bg-amber-500'}`} />

                        {/* Class Info */}
                        <div className="flex-1 pl-3 space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-blue-500" />
                              Period {idx + 1}: {formatTime(period.start_time)} - {formatTime(period.end_time)}
                            </span>

                            {isCovered ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Covered
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800/60">
                                <AlertCircle className="w-3.5 h-3.5" /> Pending Allocation
                              </span>
                            )}
                          </div>

                          <div className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-500" />
                            {getSubjectName(period.subject_id)}
                          </div>

                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-4">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              Class: <span className="text-gray-800 dark:text-gray-200 font-bold">{getClassName(period.class_id)} - {getSectionName(period.section_id)}</span>
                            </span>
                            {period.room_name && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                Room: <span className="text-gray-800 dark:text-gray-200 font-bold">{period.room_name}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Substitute Allocation Actions */}
                        <div className="w-full md:w-80 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 md:pl-6">
                          {isCovered ? (
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Assigned Substitute</label>
                              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800/80 rounded-xl shadow-xs">
                                <div className="flex items-center gap-2">
                                  <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                  <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                    {getStaffName(existingProxy.substitute_staff_id)}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDeleteProxy(existingProxy.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                                  title="Remove Proxy Allocation"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Select Available Free Faculty</label>
                              <SearchableSelect 
                                options={freeTeachers.map(t => {
                                  const fullName = `${t.first_name || ''} ${t.last_name || ''}`.trim();
                                  return { value: t.id, label: fullName || t.designation || 'Free Teacher' };
                                })}
                                placeholder={freeTeachers.length > 0 ? `Select from ${freeTeachers.length} free teachers...` : 'No free teachers'}
                                value={pendingAllocations[period.id] || ''}
                                onChange={val => setPendingAllocations({...pendingAllocations, [period.id]: val})}
                                disabled={freeTeachers.length === 0}
                              />
                              <button
                                onClick={() => handleAllocate(period.id)}
                                disabled={!pendingAllocations[period.id]}
                                className="w-full py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm disabled:opacity-40 flex items-center justify-center gap-1.5"
                              >
                                <span>Allocate Substitute</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

              {/* VIEW 2: DATATABLE VIEW */}
              {viewMode === 'table' && (
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-slate-50 dark:bg-gray-800/60">
                      <tr>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time Slot</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class & Section</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Room</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned Substitute</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800/60">
                      {filteredPeriods.map((period, idx) => {
                        const existingProxy = proxies.find(pr => pr.timetable_period_id === period.id);
                        const isCovered = !!existingProxy;

                        return (
                          <tr key={period.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-900 dark:text-white">
                              {formatTime(period.start_time)} - {formatTime(period.end_time)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 dark:text-blue-400">
                              {getSubjectName(period.subject_id)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                              Class {getClassName(period.class_id)} ({getSectionName(period.section_id)})
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {period.room_name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-bold">
                              {isCovered ? (
                                <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-md">
                                  Covered
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-md">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                              {isCovered ? getStaffName(existingProxy.substitute_staff_id) : 'Unassigned'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* Empty State when Date/Teacher not selected */}
      {(!selectedDate || !selectedAbsentTeacher) && (
        <div className="flex flex-col items-center justify-center p-14 bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
            <UserX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">No Absent Teacher Selected</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
            Please pick a Date of Absence and select the Absent Teacher from the form above to view scheduled periods and allocate substitutes.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/Timetable')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <CalendarIcon className="w-4 h-4 text-blue-500" />
              <span>View Class Timetables</span>
            </button>
            <button
              onClick={() => navigate('/StaffAttendance')}
              className="px-4 py-2 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 text-brand-600 dark:text-brand-400 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-brand-200 dark:border-brand-800"
            >
              <UserCheck className="w-4 h-4" />
              <span>Check Staff Attendance</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

