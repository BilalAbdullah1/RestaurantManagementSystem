import React from 'react';
import { X, Layers, Users, MapPin } from 'lucide-react';
import Button from '../../../components/ui/button/Button';
import Input from '../../../components/form/input/InputField';
import SearchableSelect, { OptionType } from '../../../components/form/select/SearchableSelect';
import Label from '../../../components/form/Label';

interface SectionFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  isViewing?: boolean;
  classOptions: OptionType[];
  classMap: Record<string, string>;
  formData: {
    class_id: string;
    name: string;
    room_number: string;
    max_capacity: number;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  submitLoading: boolean;
}

export default function SectionFormDrawer({
  isOpen,
  onClose,
  isEditing,
  isViewing = false,
  classOptions,
  classMap,
  formData,
  setFormData,
  onSubmit,
  submitLoading
}: SectionFormDrawerProps) {
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isViewing ? 'Section Details' : isEditing ? 'Update Section details' : 'Create New Section'}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
              {isViewing ? 'Summary of section details and capacity' : isEditing ? 'Modify room allocation and capacity details' : 'Organize a class into a new section'}
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
          {isViewing ? (
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" /> Section Designation
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Class / Grade</label>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{classMap[formData.class_id] || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Section Name</label>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{formData.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Room Number</label>
                  <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{formData.room_number || 'No Room Assigned'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Max Capacity</label>
                  <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                    <Users className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{formData.max_capacity} Seats</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form id="section-form" onSubmit={onSubmit} className="space-y-6">
              
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Section Identification
                </h3>
                
                <div>
                  <Label required>Class</Label>
                  <SearchableSelect
                    options={classOptions}
                    value={formData.class_id}
                    onChange={(val) => setFormData({ ...formData, class_id: val })}
                    placeholder="Select a class"
                  />
                </div>

                <div>
                  <Label required>Section Name</Label>
                  <Input 
                    type="text" 
                    required 
                    placeholder="e.g. Section A" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Room Number</Label>
                    <Input 
                      type="text" 
                      placeholder="e.g. 101" 
                      value={formData.room_number} 
                      onChange={(e) => setFormData({ ...formData, room_number: e.target.value })} 
                    />
                  </div>
                  <div>
                    <Label>Max Capacity</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      placeholder="40" 
                      value={String(formData.max_capacity)} 
                      onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value, 10) || 0 })} 
                    />
                  </div>
                </div>
              </div>

            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end gap-3">
          {isViewing ? (
            <Button type="button" variant="primary" onClick={onClose} className="min-w-[120px]">
              Close Drawer
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="section-form"
                variant="primary" 
                disabled={submitLoading}
                className="min-w-[120px]"
              >
                {submitLoading ? 'Saving...' : 'Save Section'}
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
