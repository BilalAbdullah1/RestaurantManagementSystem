import React from 'react';
import { X, BookOpen, Layers, ClipboardList } from 'lucide-react';
import Button from '../../../components/ui/button/Button';
import Input from '../../../components/form/input/InputField';
import SearchableSelect, { OptionType } from '../../../components/form/select/SearchableSelect';
import Label from '../../../components/form/Label';

interface ClassSubjectFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isViewing?: boolean;
  classOptions: OptionType[];
  subjectOptions: OptionType[];
  classMap: Record<string, string>;
  subjectMap: Record<string, { name: string; code?: string }>;
  formData: {
    class_id: string;
    subject_id: string;
    total_marks: number;
    passing_marks: number;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  submitLoading: boolean;
}

export default function ClassSubjectFormDrawer({
  isOpen,
  onClose,
  isViewing = false,
  classOptions,
  subjectOptions,
  classMap,
  subjectMap,
  formData,
  setFormData,
  onSubmit,
  submitLoading
}: ClassSubjectFormDrawerProps) {
  if (!isOpen) return null;

  const targetClass = classMap[formData.class_id] || 'N/A';
  const targetSubject = subjectMap[formData.subject_id] || { name: 'N/A', code: 'N/A' };

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
              {isViewing ? 'Allocation Details' : 'Assign Subject to Class'}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
              {isViewing ? 'Summary of class subject allocation and criteria' : 'Map curriculum subject to class grade and setup marking parameters'}
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
                <ClipboardList className="w-4 h-4 text-brand-500" /> Mapping Information
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Class / Grade</label>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{targetClass}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Subject Name</label>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{targetSubject.name}</p>
              </div>

              {targetSubject.code && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Subject Code</label>
                  <p className="text-sm font-mono text-gray-750 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 rounded-md inline-block">
                    {targetSubject.code}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Total Marks</label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{formData.total_marks} Marks</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Passing Marks</label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{formData.passing_marks} Marks</p>
                </div>
              </div>
            </div>
          ) : (
            <form id="class-subject-form" onSubmit={onSubmit} className="space-y-6">
              
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Allocation Parameters
                </h3>
                
                <div className="relative z-50">
                  <SearchableSelect
                    label="Target Class *"
                    options={classOptions}
                    value={formData.class_id}
                    onChange={val => setFormData({ ...formData, class_id: val })}
                    placeholder="Select Class"
                    required
                  />
                </div>

                <div className="relative z-40">
                  <SearchableSelect
                    label="Select Subject *"
                    options={subjectOptions}
                    value={formData.subject_id}
                    onChange={val => setFormData({ ...formData, subject_id: val })}
                    placeholder="Select Subject"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label required>Total Marks</Label>
                    <Input 
                      type="number" 
                      required 
                      min="1" 
                      placeholder="100" 
                      value={formData.total_marks} 
                      onChange={e => setFormData({ ...formData, total_marks: parseFloat(e.target.value) || 0 })} 
                    />
                  </div>
                  <div>
                    <Label required>Passing Marks</Label>
                    <Input 
                      type="number" 
                      required 
                      min="1" 
                      placeholder="33" 
                      value={formData.passing_marks} 
                      onChange={e => setFormData({ ...formData, passing_marks: parseFloat(e.target.value) || 0 })} 
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
                form="class-subject-form"
                variant="primary" 
                disabled={submitLoading || !formData.class_id || !formData.subject_id}
                className="min-w-[120px]"
              >
                {submitLoading ? 'Saving...' : 'Assign Subject'}
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
