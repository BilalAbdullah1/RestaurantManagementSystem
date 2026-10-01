import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import Input from '../../components/form/input/InputField';
import DatePicker from '../../components/form/date-picker';
import SearchableSelect, { SearchableSelectOption } from '../../components/form/select/SearchableSelect';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { X, Calendar, Clock, UserCheck, CheckCircle2 } from 'lucide-react';

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

interface StaffLookup {
  id: string;
  first_name: string;
  last_name: string;
  designation: string;
}

export default function PtmScheduler() {
  const tenantId = localStorage.getItem("tenantId") || "";
  const [searchParams] = useSearchParams();

  const [slots, setSlots] = useState<PtmSlot[]>([]);
  const [staffList, setStaffList] = useState<StaffLookup[]>([]);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<PtmSlot | null>(null);

  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    teacher_id: '',
    teacher_name: '',
    meeting_date: new Date().toISOString().split('T')[0],
    start_time: '10:00 AM',
    end_time: '10:15 AM'
  });

  const [bookingData, setBookingData] = useState({
    parent_name: '',
    student_name: '',
    notes: ''
  });

  const fetchPtmData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [slotsRes, staffRes] = await Promise.all([
        api.get<PtmSlot[]>(`/ptmscheduler/tenant/${tenantId}`),
        api.get<StaffLookup[]>(`/staff/tenant/${tenantId}`)
      ]);
      setSlots(slotsRes.data);
      setStaffList(staffRes.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to load PTM schedule slots.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPtmData();
  }, [tenantId]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setDrawerOpen(true);
    }
  }, [searchParams]);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teacher_id) {
      Swal.fire('Required', 'Please select a teacher for the PTM slot.', 'warning');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/ptmscheduler/slots', {
        tenant_id: tenantId,
        teacher_id: formData.teacher_id,
        teacher_name: formData.teacher_name,
        meeting_date: formData.meeting_date,
        start_time: formData.start_time,
        end_time: formData.end_time
      });

      Swal.fire('Created!', 'PTM Meeting slot published.', 'success');
      setDrawerOpen(false);
      fetchPtmData();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Could not create slot.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

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
        notes: bookingData.notes
      });

      Swal.fire('Booked! 🎉', `PTM slot with ${selectedSlot.teacher_name} successfully reserved!`, 'success');
      setBookingModalOpen(false);
      setSelectedSlot(null);
      setBookingData({ parent_name: '', student_name: '', notes: '' });
      fetchPtmData();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Could not book slot.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const staffOptions: SearchableSelectOption[] = useMemo(() => {
    return staffList.map(s => ({
      value: s.id,
      label: `${s.first_name} ${s.last_name} (${s.designation})`
    }));
  }, [staffList]);

  return (
    <div className="w-full space-y-6">
      
      {/* BREADCRUMB & HEADER */}
      <div>
        <Breadcrumb items={[{ label: 'Communication & Helpdesk', href: '#' }, { label: 'Parent-Teacher Meeting (PTM) Scheduler' }]} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Parent-Teacher Meeting (PTM) Scheduler</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Schedule 1-on-1 meeting time slots for parents with class teachers and subject faculty.</p>
          </div>
          <Button variant="primary" onClick={() => setDrawerOpen(true)}>
            + Create PTM Slot
          </Button>
        </div>
      </div>

      {/* SLOTS GRID */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : slots.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <Calendar className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-70" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">No PTM Slots Available</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto mb-4">
            Publish 1-on-1 consultation time slots for parents to reserve meeting appointments with class teachers and subject faculty.
          </p>
          <Button variant="primary" size="sm" onClick={() => setDrawerOpen(true)}>
            + Create First PTM Slot
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slots.map((slot) => (
            <div key={slot.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="light" color={slot.is_booked ? 'error' : 'success'}>
                    {slot.is_booked ? 'BOOKED' : 'AVAILABLE SLOT'}
                  </Badge>
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                    {slot.start_time} - {slot.end_time}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-500" />
                  {slot.teacher_name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(slot.meeting_date).toLocaleDateString()}
                </p>

                {slot.is_booked && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30 text-xs text-red-800 dark:text-red-300">
                    <p className="font-bold">Reserved By: {slot.booked_by_parent_name}</p>
                    <p className="mt-0.5">Student: {slot.booked_by_student_name}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                {!slot.is_booked ? (
                  <Button 
                    variant="primary" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs"
                    onClick={() => {
                      setSelectedSlot(slot);
                      setBookingModalOpen(true);
                    }}
                  >
                    Book This Meeting Slot
                  </Button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Meeting Confirmed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DRAWER FOR CREATING PTM SLOT */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[999]" onClick={() => setDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[1000] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create PTM Meeting Slot</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="slotForm" onSubmit={handleCreateSlot} className="space-y-5">
                <div>
                  <SearchableSelect
                    label="Select Teacher *"
                    options={staffOptions}
                    value={formData.teacher_id}
                    onChange={(val) => {
                      const selected = staffList.find(s => s.id === val);
                      setFormData({ 
                        ...formData, 
                        teacher_id: val, 
                        teacher_name: selected ? `${selected.first_name} ${selected.last_name}` : '' 
                      });
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Meeting Date *</label>
                  <DatePicker 
                    date={formData.meeting_date}
                    onSelect={(val) => setFormData({ ...formData, meeting_date: val })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Start Time</label>
                    <Input 
                      type="text"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">End Time</label>
                    <Input 
                      type="text"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
              <Button type="submit" form="slotForm" variant="primary" disabled={submitLoading}>
                {submitLoading ? 'Publishing...' : 'Publish Slot'}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* BOOKING MODAL FOR PARENTS */}
      {bookingModalOpen && selectedSlot && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Book PTM Slot with {selectedSlot.teacher_name}</h3>
              <button onClick={() => setBookingModalOpen(false)} className="text-gray-500 hover:bg-gray-100 rounded-full p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Parent Full Name *</label>
                <Input 
                  type="text"
                  required
                  placeholder="e.g. Muhammad Ali"
                  value={bookingData.parent_name}
                  onChange={(e) => setBookingData({ ...bookingData, parent_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Student Name & Roll No *</label>
                <Input 
                  type="text"
                  required
                  placeholder="e.g. Bilal Ahmed (Grade 5-A)"
                  value={bookingData.student_name}
                  onChange={(e) => setBookingData({ ...bookingData, student_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Topic / Discussion Notes</label>
                <Input 
                  type="text"
                  placeholder="e.g. Discussing Mathematics term progress"
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setBookingModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-700" disabled={submitLoading}>
                  {submitLoading ? 'Booking...' : 'Confirm Reservation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
