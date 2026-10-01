import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import { 
  Calendar, Clock, MapPin, BookOpen, User, Loader2, Sparkles, 
  Download, Search, Grid, List, CheckCircle, CalendarDays, Table as TableIcon, LayoutGrid 
} from 'lucide-react';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import Label from '../../components/form/Label';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { toast } from '../../components/ui/Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TimetablePeriod {
  id?: string;
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

export default function TeacherTimetable() {
  const [staff, setStaff] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [periods, setPeriods] = useState<TimetablePeriod[]>([]);
  
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'matrix' | 'cards' | 'table'>('matrix');

  const tenantId = localStorage.getItem("tenantId") || "";

  useEffect(() => {
    fetchInitialData();
  }, [tenantId]);

  useEffect(() => {
    if (selectedTeacherId) {
      fetchTeacherSchedule(selectedTeacherId);
    } else {
      setPeriods([]);
    }
  }, [selectedTeacherId]);

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

  const fetchTeacherSchedule = async (teacherId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/timetableperiods/tenant/${tenantId}/teacher/${teacherId}`);
      setPeriods(res.data || []);
    } catch (error) {
      console.error('Failed to fetch teacher schedule', error);
      toast.error('Error fetching teacher schedule');
    } finally {
      setLoading(false);
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

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Unknown Subject';
  const getClassName = (id: string) => classes.find(c => c.id === id)?.name || '';
  const getSectionName = (id: string) => sections.find(s => s.id === id)?.name || '';
  const getTeacherName = (id: string) => {
    const t = staff.find(s => s.id === id);
    return t ? `${t.first_name} ${t.last_name}` : 'Selected Teacher';
  };

  // Unique Sorted Time Slots for Matrix
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

  // Filtered Periods for Search
  const filteredPeriods = useMemo(() => {
    if (!searchQuery.trim()) return periods;
    const q = searchQuery.toLowerCase();
    return periods.filter(p => {
      const subName = getSubjectName(p.subject_id).toLowerCase();
      const clsName = getClassName(p.class_id).toLowerCase();
      const secName = getSectionName(p.section_id).toLowerCase();
      const roomName = (p.room_name || '').toLowerCase();
      return subName.includes(q) || clsName.includes(q) || secName.includes(q) || roomName.includes(q);
    });
  }, [periods, searchQuery, subjects, classes, sections]);

  // StatCards KPI Data for Teacher
  const statsData: StatCardData[] = useMemo(() => {
    if (!selectedTeacherId) return [];

    const totalPeriods = periods.length;
    const uniqueClasses = new Set(periods.map(p => `${p.class_id}-${p.section_id}`)).size;
    const uniqueSubjects = new Set(periods.map(p => p.subject_id)).size;
    const activeDaysCount = new Set(periods.map(p => p.day_of_week)).size;
    const freeDays = 6 - activeDaysCount;

    return [
      {
        title: 'Weekly Workload',
        value: `${totalPeriods} Periods`,
        icon: <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
        theme: 'brand'
      },
      {
        title: 'Assigned Classes',
        value: `${uniqueClasses} Sections`,
        icon: <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
        theme: 'indigo'
      },
      {
        title: 'Subjects Taught',
        value: uniqueSubjects,
        icon: <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
        theme: 'success'
      },
      {
        title: 'Free Days',
        value: `${freeDays} / 6 Days`,
        icon: <CheckCircle className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
        theme: 'sky'
      }
    ];
  }, [selectedTeacherId, periods]);

  // Export PDF functionality
  const exportPDF = () => {
    const doc = new jsPDF();
    const teacherName = getTeacherName(selectedTeacherId);
    doc.text(`Teacher Timetable Schedule - ${teacherName}`, 14, 15);
    
    const tableData: any[] = [];
    [1, 2, 3, 4, 5, 6].forEach(dayIndex => {
      const dayPeriods = periods.filter(p => p.day_of_week === dayIndex).sort((a, b) => a.start_time.localeCompare(b.start_time));
      if (dayPeriods.length === 0) {
        tableData.push([DAYS_OF_WEEK[dayIndex], 'Free (No classes)', '', '', '']);
      } else {
        dayPeriods.forEach((p, idx) => {
          tableData.push([
            idx === 0 ? DAYS_OF_WEEK[dayIndex] : '',
            `${formatTime(p.start_time)} - ${formatTime(p.end_time)}`,
            getSubjectName(p.subject_id),
            `${getClassName(p.class_id)} - ${getSectionName(p.section_id)}`,
            p.room_name || 'N/A'
          ]);
        });
      }
    });

    autoTable(doc, {
      startY: 20,
      head: [['Day', 'Time Slot', 'Subject', 'Class & Section', 'Room']],
      body: tableData,
    });
    doc.save(`teacher_timetable_${teacherName.replace(/\s+/g, '_')}.pdf`);
    toast.success('Teacher schedule PDF exported');
  };

  // Export CSV functionality
  const exportCSV = () => {
    const headers = ['Day', 'Time Slot', 'Subject', 'Class Section', 'Room'];
    const csvRows: any[] = [];
    [1, 2, 3, 4, 5, 6].forEach(dayIndex => {
      const dayPeriods = periods.filter(p => p.day_of_week === dayIndex).sort((a, b) => a.start_time.localeCompare(b.start_time));
      dayPeriods.forEach(p => {
        csvRows.push([
          DAYS_OF_WEEK[dayIndex],
          `${formatTime(p.start_time)} - ${formatTime(p.end_time)}`,
          getSubjectName(p.subject_id).replace(/,/g, ' '),
          `${getClassName(p.class_id)} - ${getSectionName(p.section_id)}`.replace(/,/g, ' '),
          (p.room_name || 'N/A').replace(/,/g, ' ')
        ]);
      });
    });
    const csvContent = [headers, ...csvRows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const teacherName = getTeacherName(selectedTeacherId);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `teacher_timetable_${teacherName.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Teacher schedule CSV exported');
  };

  return (
    <div className="w-full max-w-full space-y-6">
      {/* Top Breadcrumb Navigation */}
      <Breadcrumb items={[
        { label: 'Academics', href: '/academics' },
        { label: 'Teacher Timetable' }
      ]} />

      {/* Header and Selection Area (Restored Standard Clean Theme) */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              Teacher Timetable
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View the weekly schedule for any teacher to find free slots.</p>
          </div>

          <div className="w-full md:w-80">
            <SearchableSelect 
              options={staff.map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name}` }))}
              placeholder="Search teacher..."
              onChange={val => setSelectedTeacherId(val)}
              value={selectedTeacherId}
            />
          </div>
        </div>
      </div>

      {/* KPI Stats Cards Summary */}
      {selectedTeacherId && (
        <StatCards stats={statsData} />
      )}

      {/* Main Schedule Container */}
      {selectedTeacherId ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          
          {/* Header Controls Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Filter by subject, class, or room..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all"
              />
            </div>

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
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'cards' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Day Cards</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List View</span>
                </button>
              </div>

              <button 
                onClick={exportPDF} 
                disabled={periods.length === 0} 
                title="Export PDF" 
                className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 transition-all shadow-sm disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={exportCSV} 
                disabled={periods.length === 0} 
                title="Export CSV" 
                className="px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 transition-all shadow-sm disabled:opacity-40"
              >
                CSV
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 space-y-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Loading schedule for selected faculty member...</p>
            </div>
          ) : (
            <div className="p-6">
              
              {/* UNIQUE TABLE 1: 🗓️ TEACHER WEEKLY MATRIX TABLE (Time Slots x Days of Week) */}
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
                            const period = filteredPeriods.find(p => p.day_of_week === dayIdx && p.start_time.slice(0, 5) === slot.start_time.slice(0, 5));

                            if (period) {
                              return (
                                <td key={dayIdx} className="p-2.5 align-top border-r border-gray-200 dark:border-gray-800 last:border-r-0 min-w-[140px]">
                                  <div className="relative p-3 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/80 dark:bg-indigo-950/40 shadow-2xs hover:shadow-md transition-all flex flex-col gap-1.5">
                                    <div className="font-extrabold text-indigo-950 dark:text-indigo-100 text-xs truncate" title={getSubjectName(period.subject_id)}>
                                      {getSubjectName(period.subject_id)}
                                    </div>

                                    <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                                      <User className="w-3 h-3 text-indigo-500 shrink-0" />
                                      <span className="truncate">Class: {getClassName(period.class_id)} ({getSectionName(period.section_id)})</span>
                                    </div>

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

                            // Free Slot Indicator
                            return (
                              <td key={dayIdx} className="p-2.5 align-middle border-r border-gray-200 dark:border-gray-800 last:border-r-0 text-center">
                                <div className="py-3 px-2 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-dashed border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                                  <span>Free Slot</span>
                                </div>
                              </td>
                            );
                          })}

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* UNIQUE TABLE 2: 📊 DAY-BY-DAY CARDS VIEW */}
              {viewMode === 'cards' && (
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5, 6].map((dayIndex) => {
                    const dayPeriods = filteredPeriods
                      .filter(p => p.day_of_week === dayIndex)
                      .sort((a, b) => a.start_time.localeCompare(b.start_time));
                    
                    return (
                      <div key={dayIndex} className="bg-slate-50/60 dark:bg-gray-800/40 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-extrabold text-gray-900 dark:text-white text-lg tracking-tight">
                              {DAYS_OF_WEEK[dayIndex]}
                            </h3>
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                              {dayPeriods.length} Classes
                            </span>
                          </div>

                          {dayPeriods.length === 0 && (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5" /> Completely Free Day
                            </span>
                          )}
                        </div>

                        {dayPeriods.length === 0 ? (
                          <div className="py-6 text-center text-xs italic text-gray-400 dark:text-gray-500 bg-white/40 dark:bg-gray-900/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                            No lectures assigned for {DAYS_OF_WEEK[dayIndex]}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {dayPeriods.map((period) => (
                              <div 
                                key={period.id} 
                                className="relative group/card bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between space-y-3"
                              >
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 rounded-l-xl" />

                                <div className="pl-2">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Subject</span>
                                  <h4 className="font-bold text-gray-900 dark:text-white text-base leading-tight flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                                    <span className="truncate">{getSubjectName(period.subject_id)}</span>
                                  </h4>
                                </div>
                                
                                <div className="space-y-2 text-xs font-medium pl-2">
                                  <div className="flex items-center gap-2 bg-blue-50/70 dark:bg-blue-950/30 p-2 rounded-lg border border-blue-100 dark:border-blue-900/40 text-blue-800 dark:text-blue-200">
                                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                    <span className="font-bold">{formatTime(period.start_time)} - {formatTime(period.end_time)}</span>
                                  </div>

                                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold px-1">
                                    <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <span className="truncate">
                                      Class {getClassName(period.class_id)} - {getSectionName(period.section_id)}
                                    </span>
                                  </div>

                                  {period.room_name && (
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 px-1">
                                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                      <span className="truncate">Room: {period.room_name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* UNIQUE TABLE 3: ⏱️ LIST BREAKDOWN VIEW */}
              {viewMode === 'table' && (
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-slate-50 dark:bg-gray-800/60">
                      <tr>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Day</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class & Section</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Room</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800/60">
                      {filteredPeriods.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400 dark:text-gray-500 italic">
                            No scheduled classes found for this teacher
                          </td>
                        </tr>
                      ) : (
                        filteredPeriods.map((period) => (
                          <tr key={period.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                              {DAYS_OF_WEEK[period.day_of_week]}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-blue-700 dark:text-blue-300">
                              <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                                {formatTime(period.start_time)} - {formatTime(period.end_time)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                              {getSubjectName(period.subject_id)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Class {getClassName(period.class_id)} ({getSectionName(period.section_id)})
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {period.room_name || 'N/A'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

        </div>
      ) : (
        /* Empty State when no Teacher Selected */
        <div className="flex flex-col items-center justify-center p-14 bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
            <User className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">No Teacher Selected</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
            Select a faculty member from the dropdown above to view their weekly timetable schedule and availability.
          </p>
        </div>
      )}

    </div>
  );
}


