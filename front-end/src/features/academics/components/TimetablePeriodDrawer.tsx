import React, { useMemo } from 'react';
import { X, Calendar, Clock, BookOpen, User, MapPin } from 'lucide-react';
import Button from '../../../components/ui/button/Button';
import SearchableSelect from '../../../components/form/select/SearchableSelect';
import TimePicker from '../../../components/form/TimePicker';
import InputField from '../../../components/form/input/InputField';
import Label from '../../../components/form/Label';

interface Subject {
  id: string;
  name: string;
}

interface Staff {
  id: string;
  first_name: string;
  last_name: string;
}

interface Section {
  id: string;
  name: string;
  class_id: string;
  room_number?: string;
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

interface TimetablePeriodDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dayName: string;
  subjects: Subject[];
  staff: Staff[];
  sections?: Section[];
  formData: TimetablePeriod;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  submitLoading: boolean;
}

export default function TimetablePeriodDrawer({
  isOpen,
  onClose,
  dayName,
  subjects,
  staff,
  sections = [],
  formData,
  setFormData,
  onSubmit,
  submitLoading
}: TimetablePeriodDrawerProps) {
  const roomOptions = useMemo(() => {
    const optionsSet = new Set<string>();
    
    // Only collect actual room numbers assigned to sections in database
    sections.forEach(s => {
      if (s.room_number && s.room_number.trim() !== '') {
        optionsSet.add(s.room_number.trim());
      }
    });

    // Also include current formData.room_name if set
    if (formData.room_name && formData.room_name.trim() !== '') {
      optionsSet.add(formData.room_name.trim());
    }

    return Array.from(optionsSet).map(r => ({ value: r, label: r }));
  }, [sections, formData.room_name]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[999] transition-opacity animate-in fade-in duration-200" 
        onClick={onClose} 
      />
      
      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[1000] transform transition-transform duration-300 ease-in-out flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Add Period
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
              Add new timetable slot for {dayName}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="timetable-period-form" onSubmit={onSubmit} className="space-y-6">
            
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-500" /> Time Parameters
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label required>Start Time</Label>
                  <TimePicker
                    value={formData.start_time}
                    onChange={e => setFormData({...formData, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <Label required>End Time</Label>
                  <TimePicker
                    value={formData.end_time}
                    onChange={e => setFormData({...formData, end_time: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-500" /> Course Allocation
              </h3>
              
              <div className="z-50 relative">
                <Label required>Subject</Label>
                <SearchableSelect 
                  options={subjects.map(s => ({ value: s.id, label: s.name }))}
                  placeholder="Select Subject"
                  onChange={val => setFormData({...formData, subject_id: val})}
                  value={formData.subject_id}
                />
              </div>

              <div className="z-40 relative">
                <Label required>Teacher</Label>
                <SearchableSelect 
                  options={staff.map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name}` }))}
                  placeholder="Select Teacher"
                  onChange={val => setFormData({...formData, staff_id: val})}
                  value={formData.staff_id}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-500" /> Room Allocation
              </h3>
              
              <div className="z-30 relative">
                <Label>Room / Location</Label>
                <SearchableSelect
                  options={roomOptions}
                  placeholder="Select or search room / lab..."
                  value={formData.room_name || ''}
                  onChange={val => setFormData({...formData, room_name: val})}
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="timetable-period-form"
            variant="primary" 
            loading={submitLoading}
            loadingText="Saving..."
            disabled={!formData.subject_id || !formData.staff_id}
            className="min-w-[120px]"
          >
            Save Period
          </Button>
        </div>
      </div>
    </>
  );
}
