import React from 'react';
import { X, Layers } from 'lucide-react';
import Button from '../../../components/ui/button/Button';
import Input from '../../../components/form/input/InputField';
import Label from '../../../components/form/Label';

interface ClassFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  isViewing?: boolean;
  formData: {
    name: string;
    code: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  submitLoading: boolean;
}

export default function ClassFormDrawer({
  isOpen,
  onClose,
  isEditing,
  isViewing = false,
  formData,
  setFormData,
  onSubmit,
  submitLoading
}: ClassFormDrawerProps) {
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
              {isViewing ? 'Class Details' : isEditing ? 'Update Class details' : 'Create New Class'}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
              {isViewing ? 'Summary of class designation information' : isEditing ? 'Modify class and code designations' : 'Define a new class grade for the academy'}
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
                <Layers className="w-4 h-4" /> Class Designation
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Class Name</label>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{formData.name}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Short Code</label>
                <p className="text-sm font-mono text-gray-700 dark:text-gray-350 bg-gray-150 dark:bg-gray-800 px-2.5 py-1.5 rounded-md inline-block">
                  {formData.code || 'No Short Code Assigned'}
                </p>
              </div>
            </div>
          ) : (
            <form id="class-form" onSubmit={onSubmit} className="space-y-6">
              
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Class Identification
                </h3>
                
                <div>
                  <Label required>Class Name</Label>
                  <Input
                    type="text" 
                    required
                    placeholder="e.g. Grade 9 or O-Levels"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Short Code</Label>
                  <Input
                    type="text"
                    placeholder="e.g. C9 (optional)"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
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
                form="class-form"
                variant="primary" 
                disabled={submitLoading}
                className="min-w-[120px]"
              >
                {submitLoading ? 'Saving...' : 'Save Class'}
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
