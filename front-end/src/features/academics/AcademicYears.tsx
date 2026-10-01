import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Input from '../../components/form/input/InputField';
import DatePicker from '../../components/form/date-picker';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import Label from '../../components/form/Label';
import ActionMenuPortal, { ActionMenuItem } from '../../components/ui/UIDesigns/ActionMenu';
import { Calendar, CheckCircle2, Clock, MoreVertical, Edit, Trash2, Star, CalendarDays, Plus, ArrowRight } from 'lucide-react';

interface AcademicYear {
  id?: string;
  tenant_id: string;
  title: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at?: string;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const initialFormState = (tenantId: string): AcademicYear => ({
  tenant_id: tenantId,
  title: '',
  start_date: getTodayDateString(),
  end_date: getTodayDateString(),
  is_current: false
});

export default function AcademicYears() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

  const tenantId = localStorage.getItem("tenantId") || "";
  const [formData, setFormData] = useState<AcademicYear>(initialFormState(tenantId));

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    fetchYears();
  }, [tenantId]);

  const fetchYears = async () => {
    try {
      setLoading(true);
      const response = await api.get<AcademicYear[]>(`/academicyears/tenant/${tenantId}`);
      setYears(response.data);
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load academic years.', confirmButtonColor: '#ef4444' });
    } finally {
      setLoading(false);
    }
  };

  const formatInputDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return dateString.split('T')[0];
    }
  };

  const displayDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const calculateProgress = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const now = Date.now();
    if (now < s) return 0;
    if (now > e) return 100;
    return Math.round(((now - s) / (e - s)) * 100);
  };

  const getDaysRemaining = (end: string) => {
    const diff = new Date(end).getTime() - Date.now();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getDurationMonths = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    return months;
  };

  const currentYear = useMemo(() => years.find(y => y.is_current), [years]);
  const otherYears = useMemo(() => {
    return years.filter(y => !y.is_current).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  }, [years]);

  // --- Form Handlers ---
  const openEditView = (year: AcademicYear) => {
    setEditingYear(year);
    setFormData({
      ...year,
      start_date: formatInputDate(year.start_date),
      end_date: formatInputDate(year.end_date)
    });
    setView('form');
  };

  const openAddView = () => {
    setEditingYear(null);
    setFormData(initialFormState(tenantId));
    setView('form');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      if (editingYear && editingYear.id) {
        await api.put(`/academicyears/${editingYear.id}`, formData);
        Swal.fire({ icon: 'success', title: 'Academic Year Updated', text: 'The academic year details have been saved.', timer: 2000, showConfirmButton: false });
      } else {
        await api.post('/academicyears', formData);
        Swal.fire({ icon: 'success', title: 'Academic Year Added', text: 'The new academic year has been created.', timer: 2000, showConfirmButton: false });
      }
      setView('list');
      fetchYears();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Unable to Save', text: err.response?.data?.message || "Please review the form and try again.", confirmButtonColor: '#ef4444' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const toggleCurrentStatus = async (year: AcademicYear) => {
    if (year.is_current) return;
    const result = await Swal.fire({
      title: 'Set as Active Academic Year?',
      text: `This will make "${year.title}" the active academic year and deactivate the one currently in use.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Set as Active'
    });
    if (!result.isConfirmed) return;
    try {
      await api.put(`/academicyears/${year.id}`, { ...year, is_current: true });
      Swal.fire({ icon: 'success', title: 'Active Year Updated', text: 'The active academic year has been changed.', timer: 1500, showConfirmButton: false });
      fetchYears();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update.' });
    }
  };

  const deleteYear = async (year: AcademicYear) => {
    const result = await Swal.fire({
      title: 'Delete Academic Year?',
      text: `This action cannot be undone. The academic year "${year.title}" will be permanently deleted.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete'
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/academicyears/${year.id}`);
      Swal.fire({ icon: 'success', title: 'Deleted', text: 'The academic year has been removed.', timer: 1500, showConfirmButton: false });
      fetchYears();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Unable to Delete', text: err.response?.data?.message || "Could not delete." });
    }
  };

  // --- ActionMenu Portal ---
  const ActionMenu = ({ year }: { year: AcademicYear }) => {
    const items: ActionMenuItem[] = [];
    if (!year.is_current) {
      items.push({
        label: 'Set as Active',
        icon: <Star className="w-4 h-4 text-amber-500" />,
        onClick: () => toggleCurrentStatus(year)
      });
    }
    items.push({
      label: 'Edit Details',
      icon: <Edit className="w-4 h-4 text-brand-500" />,
      onClick: () => openEditView(year)
    });
    items.push({
      label: 'Delete Year',
      icon: <Trash2 className="w-4 h-4 text-red-500" />,
      onClick: () => deleteYear(year),
      isDanger: true
    });

    return <ActionMenuPortal items={items} />;
  };

  // ===================== RENDER =====================
  return (
    <div className="w-full space-y-6">

      {/* ──── HEADER ──── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Years</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your school's academic sessions and set the active year.</p>
        </div>

        {view === 'list' ? (
          <Button variant="primary" onClick={openAddView}>
            <Plus className="w-4 h-4" /> Add Academic Year
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setView('list')}>← Back to List</Button>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  LIST VIEW                                            */}
      {/* ══════════════════════════════════════════════════════ */}
      {view === 'list' && (
        <div className="space-y-6">

          {/* Loading Skeletons */}
          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              </div>
            </div>
          ) : (
            <>
              {/* ── CURRENT YEAR HERO ── */}
              {currentYear ? (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 shadow-lg text-white">
              {/* Background decorations */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>

              <div className="relative z-10 p-8 md:p-10">
                {/* Top row */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    Active Session
                  </span>
                  <div className="ml-auto">
                    <ActionMenu year={currentYear} />
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-end">
                  {/* Left: Title & Dates */}
                  <div className="flex-1 space-y-4">
                    <h3 className="text-4xl sm:text-5xl font-black tracking-tight leading-none">{currentYear.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-brand-100">
                      <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                        <CalendarDays className="w-4 h-4 text-brand-200" />
                        <span className="font-semibold">{displayDate(currentYear.start_date)}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-brand-300" />
                      <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                        <CalendarDays className="w-4 h-4 text-brand-200" />
                        <span className="font-semibold">{displayDate(currentYear.end_date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Stats mini-cards */}
                  <div className="flex gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 text-center min-w-[100px]">
                      <p className="text-3xl font-black">{calculateProgress(currentYear.start_date, currentYear.end_date)}%</p>
                      <p className="text-[11px] font-semibold text-brand-200 uppercase tracking-wider mt-1">Complete</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 text-center min-w-[100px]">
                      <p className="text-3xl font-black">{getDaysRemaining(currentYear.end_date)}</p>
                      <p className="text-[11px] font-semibold text-brand-200 uppercase tracking-wider mt-1">Days Left</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 text-center min-w-[100px]">
                      <p className="text-3xl font-black">{getDurationMonths(currentYear.start_date, currentYear.end_date)}</p>
                      <p className="text-[11px] font-semibold text-brand-200 uppercase tracking-wider mt-1">Months</p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-8">
                  <div className="flex justify-between text-xs font-semibold text-brand-200 mb-2">
                    <span>{displayDate(currentYear.start_date)}</span>
                    <span>{displayDate(currentYear.end_date)}</span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-white h-2.5 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${calculateProgress(currentYear.start_date, currentYear.end_date)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 rounded-2xl border-2 border-dashed border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-800/40 rounded-full flex items-center justify-center text-amber-500 mb-4">
                <Star className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300">No Active Academic Year</h3>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1 max-w-md">Set one of your academic years as "Active" to enable enrollments, attendance, and fee collection.</p>
            </div>
          )}

          {/* ── OTHER YEARS GRID ── */}
          {otherYears.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Other Sessions</h3>
                <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
                <span className="text-xs font-semibold text-gray-400">{otherYears.length} {otherYears.length === 1 ? 'year' : 'years'}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {otherYears.map(year => {
                  const isPast = new Date(year.end_date).getTime() < Date.now();
                  const progress = calculateProgress(year.start_date, year.end_date);

                  return (
                    <div key={year.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group overflow-hidden">

                      {/* Top progress strip */}
                      <div className="h-1 w-full bg-gray-100 dark:bg-gray-800">
                        <div className={`h-full transition-all ${isPast ? 'bg-gray-300 dark:bg-gray-600' : 'bg-brand-500'}`} style={{ width: `${progress}%` }}></div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPast ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-500'}`}>
                            {isPast ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                          </div>
                          <ActionMenu year={year} />
                        </div>

                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-500 transition-colors">{year.title}</h4>

                        <Badge variant="light" color={isPast ? 'light' : 'info'} size="sm">
                          {isPast ? 'Completed' : 'Upcoming'}
                        </Badge>

                        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 dark:text-gray-500 font-medium flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" /> Start
                            </span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{displayDate(year.start_date)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 dark:text-gray-500 font-medium flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" /> End
                            </span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{displayDate(year.end_date)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 dark:text-gray-500 font-medium">Duration</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{getDurationMonths(year.start_date, year.end_date)} months</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state if no years at all */}
          {years.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-5">
                <Calendar className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">No Academic Years Yet</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">Get started by adding your first academic year to begin managing your school calendar.</p>
              <Button variant="primary" onClick={openAddView} className="mt-6">
                <Plus className="w-4 h-4" /> Create First Year
              </Button>
            </div>
          )}
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/*  FORM VIEW                                            */}
      {/* ══════════════════════════════════════════════════════ */}
      {view === 'form' && (
        <form onSubmit={handleFormSubmit} className="w-full space-y-6">

          {/* Form Header */}
          <div className="flex justify-between items-center p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
                {editingYear ? 'Edit Academic Year' : 'Add Academic Year'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter the details for this academic year below.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setView('list')}>
              ← Back to List
            </Button>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">Session Information</h3>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <Label required>Title</Label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. 2026-2027"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label required>Start Date</Label>
                  <DatePicker
                    id="acad-start-date"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label required>End Date</Label>
                  <DatePicker
                    id="acad-end-date"
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_current}
                    onChange={e => setFormData({ ...formData, is_current: e.target.checked })}
                    className="w-4 h-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Set as Active Academic Year</span>
                    <p className="text-xs text-gray-400">Making this active will automatically deactivate any currently active year.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end items-center gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
            <Button type="button" variant="outline" onClick={() => setView('list')}>Cancel</Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitLoading}
              loadingText="Saving..."
              className="min-w-[140px]"
            >
              Save
            </Button>
          </div>
        </form>
      )}

    </div>
  );
}
