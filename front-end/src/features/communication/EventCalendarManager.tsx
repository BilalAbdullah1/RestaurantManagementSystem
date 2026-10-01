import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import Input from '../../components/form/input/InputField';
import DatePicker from '../../components/form/date-picker';
import SearchableSelect, { SearchableSelectOption } from '../../components/form/select/SearchableSelect';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { X, Calendar as CalendarIcon, MapPin, Trash2, Trophy, BookOpen, PartyPopper } from 'lucide-react';

interface EventCalendarItem {
  id: string;
  tenant_id: string;
  title: string;
  event_type: 'Sports' | 'Academics' | 'Cultural' | 'Holiday' | 'Exam';
  start_date: string;
  end_date: string;
  location: string;
  description: string;
  created_at: string;
}

export default function EventCalendarManager() {
  const tenantId = localStorage.getItem("tenantId") || "";
  const [searchParams] = useSearchParams();

  const [events, setEvents] = useState<EventCalendarItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    event_type: 'Sports',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    location: 'School Main Ground',
    description: ''
  });

  const fetchEvents = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await api.get<EventCalendarItem[]>(`/eventcalendar/tenant/${tenantId}`);
      setEvents(res.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to load event calendar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [tenantId]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setDrawerOpen(true);
    }
  }, [searchParams]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      Swal.fire('Required', 'Event title is required.', 'warning');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/eventcalendar', {
        tenant_id: tenantId,
        title: formData.title,
        event_type: formData.event_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        location: formData.location,
        description: formData.description
      });

      Swal.fire('Added!', 'New event added to School Event Calendar.', 'success');
      setDrawerOpen(false);
      setFormData({
        title: '',
        event_type: 'Sports',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        location: 'School Main Ground',
        description: ''
      });
      fetchEvents();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Could not add event.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete Event?',
      text: 'Remove this event from the calendar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/eventcalendar/${id}`);
        Swal.fire('Deleted!', 'Event removed.', 'success');
        fetchEvents();
      } catch (err) {
        Swal.fire('Error', 'Failed to delete event.', 'error');
      }
    }
  };

  const eventTypeOptions: SearchableSelectOption[] = [
    { value: 'Sports', label: '🏆 Sports Week & Athletics' },
    { value: 'Academics', label: '📖 Academic Debate & Quiz Competition' },
    { value: 'Cultural', label: '🎉 Cultural Day & Annual Function' },
    { value: 'Holiday', label: '🏖️ Public / Gazetted Holiday' },
    { value: 'Exam', label: '📝 Examination Schedule' },
  ];

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'Sports': return 'warning';
      case 'Holiday': return 'error';
      case 'Cultural': return 'purple';
      case 'Exam': return 'primary';
      default: return 'success';
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* BREADCRUMB & HEADER */}
      <div>
        <Breadcrumb items={[{ label: 'Communication & Helpdesk', href: '#' }, { label: 'Event Calendar' }]} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-7 h-7 text-indigo-600" />
              Shared School Event Calendar
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Shared academic, sports, debates, cultural, and holiday calendar for parents and staff.</p>
          </div>
          <Button variant="primary" onClick={() => setDrawerOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            + Add Calendar Event
          </Button>
        </div>
      </div>

      {/* EVENTS GRID */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <CalendarIcon className="w-12 h-12 text-indigo-600 mx-auto mb-3 opacity-70" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">No Events Scheduled</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto mb-4">
            Schedule upcoming sports tournaments, academic examinations, debate competitions, cultural festivals, or public holidays.
          </p>
          <Button variant="primary" size="sm" onClick={() => setDrawerOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            + Schedule First Event
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div key={ev.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="light" color={getEventBadgeColor(ev.event_type) as any}>
                    {ev.event_type.toUpperCase()}
                  </Badge>
                  <button 
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{ev.title}</h3>
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  {ev.location}
                </p>

                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {ev.description || 'No additional details specified.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>{new Date(ev.start_date).toLocaleDateString()}</span>
                <span>➔</span>
                <span>{new Date(ev.end_date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DRAWER FOR ADDING EVENT */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[999]" onClick={() => setDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[1000] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                Schedule Calendar Event
              </h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="eventForm" onSubmit={handleCreateEvent} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Event Title *</label>
                  <Input 
                    type="text"
                    required
                    placeholder="e.g. Annual Sports Gala 2026"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <SearchableSelect
                    label="Event Category *"
                    options={eventTypeOptions}
                    value={formData.event_type}
                    onChange={(val) => setFormData({ ...formData, event_type: val })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Start Date *</label>
                    <DatePicker 
                      date={formData.start_date}
                      onSelect={(val) => setFormData({ ...formData, start_date: val })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">End Date *</label>
                    <DatePicker 
                      date={formData.end_date}
                      onSelect={(val) => setFormData({ ...formData, end_date: val })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Location / Venue</label>
                  <Input 
                    type="text"
                    placeholder="e.g. School Sports Ground / Auditorium"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Event Description</label>
                  <textarea 
                    rows={4}
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    placeholder="Provide event schedule details..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
              <Button type="submit" form="eventForm" variant="primary" className="bg-indigo-600 hover:bg-indigo-700" disabled={submitLoading}>
                {submitLoading ? 'Saving...' : 'Add to Calendar'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
