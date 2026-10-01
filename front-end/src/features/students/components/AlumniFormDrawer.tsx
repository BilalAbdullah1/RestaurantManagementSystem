import React from 'react';
import { X, GraduationCap, Briefcase, School } from 'lucide-react';
import Button from '../../../components/ui/button/Button';
import Input from '../../../components/form/input/InputField';
import SearchableSelect, { OptionType } from '../../../components/form/select/SearchableSelect';

interface AlumniFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  studentOptions: OptionType[];
  formData: {
    student_id: string;
    graduation_year: number;
    current_occupation: string;
    current_organization: string;
    higher_education_details: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  submitLoading: boolean;
}

export default function AlumniFormDrawer({
  isOpen,
  onClose,
  isEditing,
  studentOptions,
  formData,
  setFormData,
  onSubmit,
  submitLoading
}: AlumniFormDrawerProps) {

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[999999] transition-opacity"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      />
      
      {/* Drawer */}
      <div 
        className="fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl z-[999999] transform transition-transform duration-300 ease-in-out flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Update Alumni Profile' : 'Register New Alumni'}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
              {isEditing ? 'Modify professional networking details' : 'Add a graduate to the alumni network'}
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
          <form id="alumni-form" onSubmit={onSubmit} className="space-y-6">
            
            {/* Core Identification */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Identity & Graduation
              </h3>
              
              {!isEditing ? (
                <div className="mb-4">
                  <SearchableSelect 
                    label="Select Student *"
                    options={studentOptions} 
                    value={formData.student_id} 
                    onChange={val => setFormData({...formData, student_id: val})} 
                    placeholder="Search graduated student..." 
                    required 
                  />
                </div>
              ) : (
                <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-100 dark:border-brand-900/50 text-xs text-brand-700 dark:text-brand-300 font-medium">
                  Editing existing profile. The underlying student identity mapping cannot be changed once established.
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Graduation Year *</label>
                <Input 
                  type="number" 
                  required 
                  min="1990" 
                  max="2100" 
                  placeholder="e.g. 2026" 
                  value={formData.graduation_year} 
                  onChange={e => setFormData({...formData, graduation_year: parseInt(e.target.value) || new Date().getFullYear()})} 
                />
              </div>
            </div>

            {/* Professional Journey */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Professional Journey
              </h3>
              
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Current Job Title / Role</label>
                <Input 
                  type="text" 
                  placeholder="e.g. Software Engineer, Doctor..." 
                  value={formData.current_occupation} 
                  onChange={e => setFormData({...formData, current_occupation: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Company / Organization</label>
                <Input 
                  type="text" 
                  placeholder="e.g. Google, Shaukat Khanum Hospital..." 
                  value={formData.current_organization} 
                  onChange={e => setFormData({...formData, current_organization: e.target.value})} 
                />
              </div>
            </div>

            {/* Academic Journey */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <School className="w-4 h-4" /> Higher Education
              </h3>
              
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">University & Degree Details</label>
                <textarea 
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-800 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none resize-none transition-all"
                  placeholder="e.g. BS Computer Science from NUST University, currently pursuing MS..."
                  value={formData.higher_education_details}
                  onChange={e => setFormData({...formData, higher_education_details: e.target.value})}
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
            form="alumni-form"
            variant="primary" 
            loading={submitLoading}
            loadingText="Saving..."
            disabled={!isEditing && !formData.student_id}
          >
            Save Profile
          </Button>
        </div>

      </div>
    </>
  );
}
