import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import Input from '../../components/form/input/InputField';
import DatePicker from '../../components/form/date-picker';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import {
  Calendar, Clock, UserCheck, CheckCircle2, X,
  CalendarCheck, CalendarX, Users, BookOpen
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────
interface PtmSlot {
  id: string;
  tenant_id: string;
  teacher_id: string;
  teacher_name: string;
  meeting_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  booked_by_parent_name?: string;
  booked_by_student_name?: string;
  meeting_notes?: string;
}

// ─── Main Component ───────────────────────────────────────────────
export default function PtmSlotsPage() {
  const tenantId = localStorage.getItem('tenantId') || '';

  const [searchParams] = useSearchParams();
  const [slots, setSlots] = useState<PtmSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<PtmSlot | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'booked'>('available');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [bookingData, setBookingData] = useState({
    parent_name: '',
    student_name: '',
    notes: '',
  });

  // Sync filters from URL search params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'booked' || tabParam === 'available') {
      setActiveTab(tabParam);
    }
    const teacherParam = searchParams.get('teacher');
    if (teacherParam) {
      setTeacherFilter(teacherParam);
    }
    const dateParam = searchParams.get('date');
    if (dateParam) {
      setDateFilter(dateParam);
    }
  }, [searchParams]);

  // ── Fetch ────────────────────────────────────────────────────
  const fetchSlots = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await api.get<PtmSlot[]>(`/ptmscheduler/tenant/${tenantId}`);
      setSlots(res.data);
    } catch {
      Swal.fire('Error', 'Failed to load PTM schedule.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(); }, [tenantId]);

  // ── Stats ────────────────────────────────────────────────────
  const availableCount = useMemo(() => slots.filter(s => !s.is_booked).length, [slots]);
  const bookedCount    = useMemo(() => slots.filter(s => s.is_booked).length, [slots]);

  // ── Unique teachers for filter ────────────────────────────────
  const teacherOptions = useMemo(() => {
    const unique = [...new Set(slots.map(s => s.teacher_name))];
    return [
      { value: '', label: 'All Teachers' },
      ...unique.map(t => ({ value: t, label: t })),
    ];
  }, [slots]);

  // ── Filtered slots ────────────────────────────────────────────
  const filteredSlots = useMemo(() => {
    return slots.filter(s => {
      const matchTab      = activeTab === 'available' ? !s.is_booked : s.is_booked;
      const matchTeacher  = !teacherFilter || s.teacher_name === teacherFilter;
      const matchDate     = !dateFilter || s.meeting_date.startsWith(dateFilter);
      return matchTab && matchTeacher && matchDate;
    });
  }, [slots, activeTab, teacherFilter, dateFilter]);

  // ── Book Slot ────────────────────────────────────────────────
  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !bookingData.parent_name || !bookingData.student_name) {
      Swal.fire('Required', 'Parent name and Student name are required.', 'warning');
      return;
    }
    setSubmitLoading(true);
    try {
      await api.post(`/ptmscheduler/slots/${selectedSlot.id}/book`, {
        parent_name: bookingData.parent_name,
        student_name: bookingData.student_name,
        notes: bookingData.notes,
      });
      Swal.fire({
        icon: 'success',
        title: 'Meeting Booked! 🎉',
        text: `Your PTM slot with ${selectedSlot.teacher_name} is confirmed.`,
        timer: 2000,
        showConfirmButton: false,
      });
      setBookingModalOpen(false);
      setSelectedSlot(null);
      setBookingData({ parent_name: '', student_name: '', notes: '' });
      fetchSlots();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Could not book the slot.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">

      {/* BREADCRUMB & HEADER */}
      <div>
        <Breadcrumb items={[{ label: 'Front Office', href: '#' }, { label: 'PTM Slot Booking' }]} />
        <div className="mt-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-emerald-600" />
            Parent-Teacher Meeting — Slot Booking
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Browse available meeting slots and book a one-on-one session with your child's teacher.
          </p>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <StatCards
        stats={[
          { title: 'Total Slots', value: slots.length, icon: <Calendar className="w-5 h-5" />, theme: 'brand' },
          { title: 'Available', value: availableCount, icon: <CalendarCheck className="w-5 h-5" />, theme: 'success' },
          { title: 'Booked', value: bookedCount, icon: <CalendarX className="w-5 h-5" />, theme: 'warning' },
          { title: 'Teachers Available', value: teacherOptions.length - 1, icon: <Users className="w-5 h-5" />, theme: 'indigo' },
        ]}
      />

      {/* FILTER TOOLBAR */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl h-fit">
            {(['available', 'booked'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                  activeTab === tab
                    ? tab === 'available'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-amber-500 text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                {tab === 'available' ? `✓ Available (${availableCount})` : `⊘ Booked (${bookedCount})`}
              </button>
            ))}
          </div>

          {/* Teacher Filter */}
          <div className="w-full sm:w-64">
            <SearchableSelect
              label="Filter by Teacher"
              options={teacherOptions}
              value={teacherFilter}
              onChange={(val) => setTeacherFilter(val || '')}
              placeholder="All Teachers"
            />
          </div>

          {/* Date Filter */}
          <div className="w-full sm:w-52">
            <DatePicker
              label="Filter by Date"
              value={dateFilter}
              onChange={(e: any) => setDateFilter(e?.target?.value ?? e ?? '')}
              placeholder="Pick meeting date"
            />
          </div>

          {(teacherFilter || dateFilter) && (
            <button
              onClick={() => { setTeacherFilter(''); setDateFilter(''); }}
              className="text-xs text-red-500 hover:text-red-700 font-semibold whitespace-nowrap self-end pb-3"
            >
              ✕ Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* SLOTS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredSlots.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-16 text-center border border-dashed border-gray-200 dark:border-gray-800">
          <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">
            No {activeTab === 'available' ? 'Available' : 'Booked'} Slots Found
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto leading-relaxed">
            {activeTab === 'available'
              ? 'No available PTM consultation slots match your current filters. Try adjusting the teacher or date filter.'
              : 'No slots have been booked yet for the selected criteria.'}
          </p>
          {(teacherFilter || dateFilter) && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setTeacherFilter(''); setDateFilter(''); }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSlots.map((slot) => (
            <div
              key={slot.id}
              className={`group relative bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                slot.is_booked
                  ? 'border-amber-200 dark:border-amber-900/30'
                  : 'border-emerald-200 dark:border-emerald-900/30'
              }`}
            >
              {/* Top accent bar */}
              <div className={`h-1.5 w-full ${slot.is_booked ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`} />

              <div className="p-6">
                {/* Status Badge & Time */}
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="light" color={slot.is_booked ? 'warning' : 'success'}>
                    {slot.is_booked ? 'Booked' : 'Available'}
                  </Badge>
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    {slot.start_time} – {slot.end_time}
                  </span>
                </div>

                {/* Teacher Name */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="truncate">{slot.teacher_name}</span>
                </h3>

                {/* Date */}
                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(slot.meeting_date).toLocaleDateString('en-GB', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>

                {/* Booked info */}
                {slot.is_booked && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-900/30 text-xs">
                    <p className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> Reserved by: {slot.booked_by_parent_name}
                    </p>
                    <p className="text-amber-700 dark:text-amber-400/70 mt-0.5">
                      Student: {slot.booked_by_student_name}
                    </p>
                    {slot.meeting_notes && (
                      <p className="text-amber-600 dark:text-amber-400/60 mt-0.5 italic">"{slot.meeting_notes}"</p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer CTA */}
              <div className="px-6 pb-5">
                {!slot.is_booked ? (
                  <Button
                    variant="primary"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                    onClick={() => { setSelectedSlot(slot); setBookingModalOpen(true); }}
                  >
                    Book This Slot
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold py-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Meeting Confirmed
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── BOOKING MODAL ─────────────────────────────────────────── */}
      {bookingModalOpen && selectedSlot && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-800 overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Book PTM Meeting</h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  {selectedSlot.teacher_name} · {selectedSlot.start_time}–{selectedSlot.end_time}
                </p>
              </div>
              <button onClick={() => { setBookingModalOpen(false); setSelectedSlot(null); }} className="text-white/70 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slot Summary */}
            <div className="mx-6 mt-5 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-900/30">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                  {new Date(selectedSlot.meeting_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                  {' '} · {selectedSlot.start_time} – {selectedSlot.end_time}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleBookSlot} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Parent / Guardian Full Name *</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Ali Khan"
                  value={bookingData.parent_name}
                  onChange={(e) => setBookingData({ ...bookingData, parent_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Student Name & Class *</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Ahmed Ali — Grade 5-A"
                  value={bookingData.student_name}
                  onChange={(e) => setBookingData({ ...bookingData, student_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Discussion Topic / Notes</label>
                <Input
                  type="text"
                  placeholder="e.g. Academic progress in Mathematics"
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setBookingModalOpen(false); setSelectedSlot(null); }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Booking...' : '✓ Confirm Booking'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
