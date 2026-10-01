import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import TimePicker from '../../components/form/TimePicker';
import InputField from '../../components/form/input/InputField';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { toast } from '../../components/ui/Toast';
import { 
  Calendar, Clock, MapPin, User, BookOpen, Download, Sparkles, 
  Grid, List, Layers, Search, Plus, Trash2, CheckCircle2,
  CalendarDays, Table as TableIcon, LayoutGrid, Clock3
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import TimetablePeriodDrawer from './components/TimetablePeriodDrawer';

interface SchoolClass {
  id: string;
  name: string;
}

interface Section {
  id: string;
  name: string;
  class_id: string;
  room_number?: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Staff {
  id: string;
  first_name: string;
  last_name: string;
}

interface TimetablePeriod {
  id?: string;
  tenant_id: string;
  academic_year_id?: string;
  class_id: string;
  section_id: string;
  subject_id: string;
  staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_name?: string;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Timetable() {
  const navigate = useNavigate();
  const tenantId = localStorage.getItem("tenantId") || "";

  // Data States
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [periods, setPeriods] = useState<TimetablePeriod[]>([]);

  // Selection & View States
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'matrix' | 'kanban' | 'timeline'>('matrix');
  const [activeDayFilter, setActiveDayFilter] = useState<number>(0); // 0 = All days
  const [searchQuery, setSearchQuery] = useState<string>('');

  // UI & Drawer States
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [autoGenLoading, setAutoGenLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<TimetablePeriod>({
    tenant_id: tenantId,
    class_id: '',
    section_id: '',
    subject_id: '',
    staff_id: '',
    day_of_week: 1, // Default Monday
    start_time: '09:00:00',
    end_time: '09:45:00',
    room_name: ''
  });

  useEffect(() => {
    if (tenantId) {
      fetchInitialData();
    }
  }, [tenantId]);

  useEffect(() => {
    if (selectedClassId) {
      fetchSections(selectedClassId);
      setSelectedSectionId(''); // Reset section when class changes
    } else {
      setSections([]);
      setSelectedSectionId('');
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedSectionId) {
      fetchTimetable();
    } else {
      setPeriods([]);
    }
  }, [selectedSectionId]);

  const fetchInitialData = async () => {
    try {
      const [classesRes, subjectsRes, staffRes] = await Promise.all([
        api.get(`/classes/tenant/${tenantId}`),
        api.get(`/subjects/tenant/${tenantId}`),
        api.get(`/staff/tenant/${tenantId}`)
      ]);
      setClasses(classesRes.data || []);
      setSubjects(subjectsRes.data || []);
      setStaff(staffRes.data || []);
    } catch (err) {
      console.error("Error fetching initial data", err);
      toast.error("Failed to load initial data");
    }
  };

  const fetchSections = async (classId: string) => {
    try {
      const response = await api.get(`/sections/class/${classId}`);
      setSections(response.data || []);
    } catch (err) {
      console.error("Error fetching sections", err);
      toast.error("Failed to load sections");
    }
  };

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/timetableperiods/tenant/${tenantId}/section/${selectedSectionId}`);
      setPeriods(response.data || []);
    } catch (err) {
      console.error("Error fetching timetable", err);
      toast.error("Error loading timetable periods");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = (dayIndex: number, startTime: string = '09:00', endTime: string = '09:45') => {
    const activeSection = sections.find(s => s.id === selectedSectionId);
    const defaultRoom = activeSection?.room_number || '';

    setFormData({
      tenant_id: tenantId,
      class_id: selectedClassId,
      section_id: selectedSectionId,
      subject_id: '',
      staff_id: '',
      day_of_week: dayIndex,
      start_time: startTime,
      end_time: endTime,
      room_name: defaultRoom
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleAutoGenerate = async () => {
    if (!selectedClassId || !selectedSectionId) {
      toast.info('Please select both a class and a section first.');
      return;
    }
    
    const confirm = await Swal.fire({
      title: 'Auto-Generate Timetable?',
      text: 'This will automatically generate and populate period slots for this section based on subject allocations.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Generate Now',
      confirmButtonColor: '#2563eb'
    });

    if (!confirm.isConfirmed) return;

    setAutoGenLoading(true);
    try {
      const res = await api.post('/timetableperiods/auto-generate', {
        tenant_id: tenantId,
        class_id: selectedClassId,
        section_id: selectedSectionId
      });
      toast.success(res.data?.message || 'Smart timetable generated successfully!');
      fetchTimetable();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error generating timetable.');
    } finally {
      setAutoGenLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject_id || !formData.staff_id) {
      toast.error('Please select both a Subject and a Teacher.');
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        ...formData,
        start_time: formData.start_time.includes(':') && formData.start_time.split(':').length === 2 ? `${formData.start_time}:00` : formData.start_time,
        end_time: formData.end_time.includes(':') && formData.end_time.split(':').length === 2 ? `${formData.end_time}:00` : formData.end_time,
      };

      await api.post('/timetableperiods', payload);
      toast.success('Period slot saved');
      closeModal();
      fetchTimetable();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add timetable period');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete Period?',
      text: "Are you sure you want to remove this timetable slot?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/timetableperiods/${id}`);
        fetchTimetable();
        toast.success('Period slot deleted');
      } catch (err) {
        toast.error('Failed to delete period');
      }
    }
  };

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Unknown Subject';
  const getStaffName = (id: string) => {
    const s = staff.find(st => st.id === id);
    return s ? `${s.first_name} ${s.last_name}` : 'Unknown Teacher';
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    const [hours, minutes] = parts;
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${minutes} ${ampm}`;
  };

  const getSubjectColor = (subjectName: string) => {
    const hash = Array.from(subjectName).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      { bg: 'bg-blue-50 dark:bg-blue-950/40', border: 'border-blue-200 dark:border-blue-800/80', text: 'text-blue-800 dark:text-blue-200', accent: 'bg-blue-600', tagBg: 'bg-blue-100 dark:bg-blue-900/60' },
      { bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800/80', text: 'text-emerald-800 dark:text-emerald-200', accent: 'bg-emerald-600', tagBg: 'bg-emerald-100 dark:bg-emerald-900/60' },
      { bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-800/80', text: 'text-amber-800 dark:text-amber-200', accent: 'bg-amber-600', tagBg: 'bg-amber-100 dark:bg-amber-900/60' },
      { bg: 'bg-indigo-50 dark:bg-indigo-950/40', border: 'border-indigo-200 dark:border-indigo-800/80', text: 'text-indigo-800 dark:text-indigo-200', accent: 'bg-indigo-600', tagBg: 'bg-indigo-100 dark:bg-indigo-900/60' },
      { bg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-200 dark:border-rose-800/80', text: 'text-rose-800 dark:text-rose-200', accent: 'bg-rose-600', tagBg: 'bg-rose-100 dark:bg-rose-900/60' },
      { bg: 'bg-purple-50 dark:bg-purple-950/40', border: 'border-purple-200 dark:border-purple-800/80', text: 'text-purple-800 dark:text-purple-200', accent: 'bg-purple-600', tagBg: 'bg-purple-100 dark:bg-purple-900/60' },
    ];
    return colors[hash % colors.length];
  };

  // Unique Time Slots Extracted & Sorted
  const uniqueTimeSlots = useMemo(() => {
    const slotsMap = new Map<string, { start_time: string, end_time: string }>();
    periods.forEach(p => {
      const key = `${p.start_time}-${p.end_time}`;
      if (!slotsMap.has(key)) {
        slotsMap.set(key, { start_time: p.start_time, end_time: p.end_time });
      }
    });
    const slots = Array.from(slotsMap.values());
    slots.sort((a, b) => a.start_time.localeCompare(b.start_time));
    
    // If no periods scheduled yet, provide default 6 period slots
    if (slots.length === 0) {
      return [
        { start_time: '09:00:00', end_time: '09:45:00' },
        { start_time: '09:45:00', end_time: '10:30:00' },
        { start_time: '10:30:00', end_time: '11:15:00' },
        { start_time: '11:15:00', end_time: '12:00:00' },
        { start_time: '12:00:00', end_time: '12:45:00' },
        { start_time: '12:45:00', end_time: '01:30:00' },
      ];
    }
    return slots;
  }, [periods]);

  // Filtered Periods based on Search & Active Day
  const filteredPeriods = useMemo(() => {
    return periods.filter(p => {
      const matchDay = activeDayFilter === 0 || p.day_of_week === activeDayFilter;
      if (!matchDay) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const subjectName = getSubjectName(p.subject_id).toLowerCase();
      const teacherName = getStaffName(p.staff_id).toLowerCase();
      const roomName = (p.room_name || '').toLowerCase();

      return subjectName.includes(q) || teacherName.includes(q) || roomName.includes(q);
    });
  }, [periods, activeDayFilter, searchQuery, subjects, staff]);

  // KPI Card Data
  const statsData: StatCardData[] = useMemo(() => {
    if (!selectedSectionId) return [];

    const totalSlots = periods.length;
    const uniqueSubjects = new Set(periods.map(p => p.subject_id)).size;
    const uniqueTeachers = new Set(periods.map(p => p.staff_id)).size;
    const activeDays = new Set(periods.map(p => p.day_of_week)).size;

    return [
      {
        title: 'Weekly Periods',
        value: totalSlots,
        icon: <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
        theme: 'brand'
      },
      {
        title: 'Assigned Subjects',
        value: uniqueSubjects,
        icon: <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
        theme: 'indigo'
      },
      {
        title: 'Active Teachers',
        value: uniqueTeachers,
        icon: <User className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
        theme: 'success'
      },
      {
        title: 'Days Scheduled',
        value: `${activeDays} / 6 Days`,
        icon: <Clock className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
        theme: 'sky'
      }
    ];
  }, [selectedSectionId, periods]);

  // --- EXPORT TO PDF & CSV ---
  const exportPDF = () => {
    const doc = new jsPDF();
    const className = classes.find(c => c.id === selectedClassId)?.name || 'N/A';
    const sectionName = sections.find(s => s.id === selectedSectionId)?.name || 'N/A';
    doc.text(`Weekly Timetable - Class: ${className} (Sec: ${sectionName})`, 14, 15);
    
    const tableData: any[] = [];
    [1, 2, 3, 4, 5, 6].forEach(dayIndex => {
      const dayPeriods = periods.filter(p => p.day_of_week === dayIndex).sort((a, b) => a.start_time.localeCompare(b.start_time));
      if (dayPeriods.length === 0) {
        tableData.push([DAYS_OF_WEEK[dayIndex], 'No scheduled periods', '', '', '']);
      } else {
        dayPeriods.forEach((p, idx) => {
          tableData.push([
            idx === 0 ? DAYS_OF_WEEK[dayIndex] : '',
            `${formatTime(p.start_time)} - ${formatTime(p.end_time)}`,
            getSubjectName(p.subject_id),
            getStaffName(p.staff_id),
            p.room_name || 'N/A'
          ]);
        });
      }
    });

    autoTable(doc, {
      startY: 20,
      head: [['Day', 'Time Slot', 'Subject', 'Teacher', 'Room']],
      body: tableData,
    });
    doc.save(`timetable_${className.replace(/\s+/g, '_')}_${sectionName.replace(/\s+/g, '_')}.pdf`);
    toast.success('PDF export generated');
  };

  const exportCSV = () => {
    const headers = ['Day', 'Time Slot', 'Subject', 'Teacher', 'Room'];
    const csvRows: any[] = [];
    [1, 2, 3, 4, 5, 6].forEach(dayIndex => {
      const dayPeriods = periods.filter(p => p.day_of_week === dayIndex).sort((a, b) => a.start_time.localeCompare(b.start_time));
      dayPeriods.forEach(p => {
        csvRows.push([
          DAYS_OF_WEEK[dayIndex],
          `${formatTime(p.start_time)} - ${formatTime(p.end_time)}`,
          getSubjectName(p.subject_id).replace(/,/g, ' '),
          getStaffName(p.staff_id).replace(/,/g, ' '),
          (p.room_name || 'N/A').replace(/,/g, ' ')
        ]);
      });
    });
    const csvContent = [headers, ...csvRows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const className = classes.find(c => c.id === selectedClassId)?.name || 'N/A';
    const sectionName = sections.find(s => s.id === selectedSectionId)?.name || 'N/A';
    
    link.setAttribute("href", url);
    link.setAttribute("download", `timetable_${className.replace(/\s+/g, '_')}_${sectionName.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV export downloaded');
  };

  return (
    <div className="w-full max-w-full space-y-6">
      {/* Top Breadcrumb Navigation */}
      <Breadcrumb items={[
        { label: 'Academics', href: '/academics' },
        { label: 'Class Timetable' }
      ]} />

      {/* Header and Selection Area (Restored Standard Clean Theme) */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              Class Timetable
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage weekly schedules for your classes.</p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
            <div className="w-full sm:w-48 z-20">
              <SearchableSelect
                options={classes.map(c => ({ value: c.id, label: c.name }))}
                placeholder="Select Class"
                onChange={(val) => setSelectedClassId(val)}
                value={selectedClassId}
              />
            </div>
            
            <div className="w-full sm:w-48 z-10">
              <SearchableSelect
                options={sections.map(s => ({ value: s.id, label: s.name }))}
                placeholder="Select Section"
                onChange={(val) => setSelectedSectionId(val)}
                value={selectedSectionId}
                disabled={!selectedClassId}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAutoGenerate}
                disabled={autoGenLoading || !selectedSectionId}
                title="Auto Generate Timetable"
                className="px-3.5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all h-11 flex items-center gap-1.5 shadow-sm disabled:opacity-40"
              >
                ✨ Auto-Generate
              </button>
              <button 
                onClick={exportPDF} 
                disabled={!selectedSectionId || periods.length === 0} 
                title="Export to PDF" 
                className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300 transition-colors h-11 flex items-center justify-center disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={exportCSV} 
                disabled={!selectedSectionId || periods.length === 0} 
                title="Export to CSV" 
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 transition-colors h-11 flex items-center justify-center disabled:opacity-40"
              >
                CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {selectedSectionId && (
        <StatCards stats={statsData} />
      )}

      {/* Main Timetable Area */}
      {selectedSectionId ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Controls Bar: Search & View Modes */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search subject, teacher, or room..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all"
              />
            </div>

            {/* View Mode Buttons */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <div className="bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-1 shadow-sm">
                <button
                  onClick={() => setViewMode('matrix')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'matrix' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Weekly Matrix Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'kanban' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Day Columns</span>
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'timeline' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <Clock3 className="w-3.5 h-3.5" />
                  <span>Timeline</span>
                </button>
              </div>
            </div>
          </div>

          {/* Loading Skeleton Indicator */}
          {loading ? (
            <div className="p-6 space-y-4 animate-pulse">
              <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl w-full" />
              <div className="grid grid-cols-6 gap-3">
                {Array.from({ length: 18 }).map((_, idx) => (
                  <div key={idx} className="h-24 bg-gray-100 dark:bg-gray-800/60 rounded-xl" />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6">
              
              {/* UNIQUE TABLE 1: 🗓️ WEEKLY MATRIX GRID TABLE (2D Matrix: Time Slots x Days of Week) */}
              {viewMode === 'matrix' && (
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm scrollbar-thin">
                  <table className="w-full min-w-[950px] border-collapse bg-white dark:bg-gray-900">
                    <thead>
                      <tr className="bg-slate-100/90 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800">
                        <th className="px-4 py-3.5 text-left text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-40 border-r border-gray-200 dark:border-gray-800">
                          Time Slot
                        </th>
                        {[1, 2, 3, 4, 5, 6].map(dayIdx => (
                          <th key={dayIdx} className="px-4 py-3.5 text-center text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider border-r border-gray-200 dark:border-gray-800 last:border-r-0">
                            {DAYS_OF_WEEK[dayIdx]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {uniqueTimeSlots.map((slot, sIdx) => (
                        <tr key={sIdx} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/40 transition-colors">
                          
                          {/* Time Column Header */}
                          <td className="px-4 py-4 align-middle border-r border-gray-200 dark:border-gray-800 bg-slate-50/70 dark:bg-gray-800/60">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                              <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span>Period {sIdx + 1}</span>
                            </div>
                            <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-1">
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </div>
                          </td>

                          {/* Days Columns */}
                          {[1, 2, 3, 4, 5, 6].map(dayIdx => {
                            // Find period for this Day & Time slot
                            const period = filteredPeriods.find(p => p.day_of_week === dayIdx && p.start_time.slice(0, 5) === slot.start_time.slice(0, 5));

                            if (period) {
                              const colors = getSubjectColor(getSubjectName(period.subject_id));
                              return (
                                <td key={dayIdx} className="p-2.5 align-top border-r border-gray-200 dark:border-gray-800 last:border-r-0 min-w-[140px]">
                                  <div className={`relative group/card p-3 rounded-xl border ${colors.border} ${colors.bg} shadow-2xs hover:shadow-md transition-all flex flex-col gap-1.5`}>
                                    
                                    {/* Subject Title & Delete */}
                                    <div className="flex items-start justify-between">
                                      <span className="font-extrabold text-gray-900 dark:text-white text-xs truncate max-w-[110px]" title={getSubjectName(period.subject_id)}>
                                        {getSubjectName(period.subject_id)}
                                      </span>
                                      <button
                                        onClick={() => handleDelete(period.id!)}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-opacity p-0.5"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {/* Teacher Info */}
                                    <div className="flex items-center gap-1 text-[11px] font-medium text-gray-600 dark:text-gray-300 truncate">
                                      <User className="w-3 h-3 text-gray-400 shrink-0" />
                                      <span className="truncate">{getStaffName(period.staff_id)}</span>
                                    </div>

                                    {/* Room Tag */}
                                    {period.room_name && (
                                      <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                                        <span>Rm: {period.room_name}</span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            }

                            // Empty Cell Slot with Add Button
                            return (
                              <td key={dayIdx} className="p-2 align-middle border-r border-gray-200 dark:border-gray-800 last:border-r-0 text-center">
                                <button
                                  onClick={() => openAddModal(dayIdx, slot.start_time.slice(0, 5), slot.end_time.slice(0, 5))}
                                  className="w-full h-16 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 group cursor-pointer"
                                  title={`Add period on ${DAYS_OF_WEEK[dayIdx]} at ${formatTime(slot.start_time)}`}
                                >
                                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                  <span className="text-[10px] font-semibold mt-0.5">Add Slot</span>
                                </button>
                              </td>
                            );
                          })}

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* UNIQUE TABLE 2: 📊 DAY COLUMNS KANBAN VIEW */}
              {viewMode === 'kanban' && (
                <div className="overflow-x-auto w-full max-w-full pb-4 scrollbar-thin">
                  <div className="flex gap-5 min-w-max">
                    {[1, 2, 3, 4, 5, 6].map((dayIndex) => {
                      const dayPeriods = filteredPeriods
                        .filter(p => p.day_of_week === dayIndex)
                        .sort((a, b) => a.start_time.localeCompare(b.start_time));

                      return (
                        <div 
                          key={dayIndex} 
                          className="w-72 shrink-0 bg-slate-50/70 dark:bg-gray-800/40 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-4 flex flex-col min-h-[500px]"
                        >
                          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 dark:text-white text-base">{DAYS_OF_WEEK[dayIndex]}</span>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                                {dayPeriods.length}
                              </span>
                            </div>
                            <button
                              onClick={() => openAddModal(dayIndex)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-all"
                              title="Add Slot"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex-1 space-y-3 overflow-y-auto max-h-[550px] pr-1 scrollbar-thin">
                            {dayPeriods.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-white/40 dark:bg-gray-900/10 p-4">
                                <Clock className="w-8 h-8 opacity-30 mb-2" />
                                <span className="text-xs italic">No periods scheduled</span>
                              </div>
                            ) : (
                              dayPeriods.map((period) => {
                                const colors = getSubjectColor(getSubjectName(period.subject_id));
                                return (
                                  <div 
                                    key={period.id} 
                                    className={`relative overflow-hidden group/card p-4 rounded-xl border ${colors.border} ${colors.bg} shadow-xs hover:shadow-md transition-all flex flex-col gap-2.5`}
                                  >
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${colors.accent}`} />
                                    
                                    <div className="flex items-start justify-between">
                                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                                        {getSubjectName(period.subject_id)}
                                      </h4>
                                      <button 
                                        onClick={() => handleDelete(period.id!)}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-opacity p-1"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    <div className="space-y-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                                      <div className="flex items-center gap-1.5 bg-white/80 dark:bg-gray-900/60 p-1.5 rounded-lg border border-gray-150 dark:border-gray-800 text-gray-800 dark:text-gray-200">
                                        <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                        <span>{formatTime(period.start_time)} - {formatTime(period.end_time)}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 px-1">
                                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                        <span className="truncate">{getStaffName(period.staff_id)}</span>
                                      </div>
                                      {period.room_name && (
                                        <div className="flex items-center gap-1.5 px-1 text-gray-500 dark:text-gray-400">
                                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                          <span className="truncate">Room: {period.room_name}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* UNIQUE TABLE 3: ⏱️ CHRONOLOGICAL TIMELINE VIEW */}
              {viewMode === 'timeline' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {[1, 2, 3, 4, 5, 6].map((dayIndex) => {
                    const dayPeriods = filteredPeriods
                      .filter(p => p.day_of_week === dayIndex)
                      .sort((a, b) => a.start_time.localeCompare(b.start_time));

                    return (
                      <div key={dayIndex} className="bg-slate-50/60 dark:bg-gray-800/40 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            {DAYS_OF_WEEK[dayIndex]}
                          </h3>
                          <button
                            onClick={() => openAddModal(dayIndex)}
                            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Period
                          </button>
                        </div>

                        {dayPeriods.length === 0 ? (
                          <div className="text-center py-4 text-xs text-gray-400 dark:text-gray-500 italic">
                            No periods scheduled for {DAYS_OF_WEEK[dayIndex]}
                          </div>
                        ) : (
                          <div className="relative border-l-2 border-blue-500/30 pl-6 space-y-3 ml-3">
                            {dayPeriods.map((period) => {
                              const colors = getSubjectColor(getSubjectName(period.subject_id));
                              return (
                                <div key={period.id} className="relative group">
                                  <div className="absolute -left-[31px] top-2.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white dark:ring-gray-900" />
                                  <div className={`p-4 rounded-xl border ${colors.border} ${colors.bg} flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all`}>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                                          {getSubjectName(period.subject_id)}
                                        </h4>
                                        {period.room_name && (
                                          <span className="px-2 py-0.5 bg-white/80 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[10px] font-semibold text-gray-600 dark:text-gray-300 rounded-md">
                                            Room {period.room_name}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-gray-400" /> Teacher: <span className="font-semibold text-gray-800 dark:text-gray-200">{getStaffName(period.staff_id)}</span>
                                      </p>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-3">
                                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-gray-200">
                                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                                        {formatTime(period.start_time)} - {formatTime(period.end_time)}
                                      </div>
                                      <button
                                        onClick={() => handleDelete(period.id!)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>
      ) : (
        /* Empty State Screen when no Class & Section Selected */
        <div className="flex flex-col items-center justify-center p-14 bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">No Timetable Selected</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
            Please select a Class and Section from the dropdowns above to view or manage the academic timetable.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/SubstituteManagement')}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-indigo-200 dark:border-indigo-800"
            >
              <Sparkles className="w-4 h-4" />
              <span>Substitute Teacher Desk</span>
            </button>
            <button
              onClick={() => navigate('/TeacherTimetable')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4 text-emerald-500" />
              <span>Teacher Timetable</span>
            </button>
          </div>
        </div>
      )}

      {/* Timetable Period Drawer (Slide-Over Drawer) */}
      <TimetablePeriodDrawer
        isOpen={showModal}
        onClose={closeModal}
        dayName={DAYS_OF_WEEK[formData.day_of_week]}
        subjects={subjects}
        staff={staff}
        sections={sections}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitLoading={submitLoading}
      />

    </div>
  );
}


