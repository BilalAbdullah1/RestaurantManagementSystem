import React from 'react';
import { X } from 'lucide-react';
import Input from '../../../components/form/input/InputField';
import SearchableSelect from '../../../components/form/select/SearchableSelect';
import Button from '../../../components/ui/button/Button';

interface FeeType {
  id?: string;
  tenant_id: string;
  name: string;
  description: string;
  frequency: string;
  is_active: boolean;
}

interface FeeSetupDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FeeType;
  setFormData: (data: FeeType) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLoading: boolean;
  isEditing: boolean;
}

export default function FeeSetupDrawer({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  submitLoading,
  isEditing
}: FeeSetupDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[999] transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[1000] transform transition-transform duration-300 ease-in-out flex flex-col animate-in slide-in-from-right">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Fee Type' : 'Create Fee Type'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Configure fee names and billing frequency.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="fee-setup-form" onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Fee Name *</label>
              <Input 
                type="text" 
                required 
                placeholder="e.g. Tuition Fee, Security Deposit..." 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              />
            </div>

            <div>
              <SearchableSelect
                label="Frequency *"
                options={[
                  { value: 'Monthly', label: 'Monthly (Billed 12 times a year)' },
                  { value: 'Annually', label: 'Annually (Billed once a year)' },
                  { value: 'One-Time', label: 'One-Time (Billed at admission)' }
                ]}
                value={formData.frequency}
                onChange={(val) => setFormData({ ...formData, frequency: val as string })}
              />
            </div>

            <div>
              <SearchableSelect
                label="Account Status *"
                options={[
                  { value: true, label: 'Active' },
                  { value: false, label: 'Inactive' },
                ]}
                value={formData.is_active}
                onChange={(val) => setFormData({ ...formData, is_active: val as boolean })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Description (Optional)</label>
              <textarea 
                rows={4}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-sm text-gray-800 dark:text-white focus:border-brand-500 outline-none resize-none"
                placeholder="Add notes or rules for this fee type..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="fee-setup-form" 
            variant="primary" 
            loading={submitLoading}
            loadingText="Saving..."
            disabled={!formData.name}
            className="min-w-[120px]"
          >
            {isEditing ? 'Save Changes' : 'Create Fee'}
          </Button>
        </div>
      </div>
    </>
  );
}
