import React from 'react';
import { X } from 'lucide-react';
import SearchableSelect, { SearchableSelectOption } from '../../../components/form/select/SearchableSelect';
import Label from '../../../components/form/Label';
import Button from '../../../components/ui/button/Button';

export interface FeeStructureFormData {
  id: string;
  tenant_id: string;
  academic_year_id: string;
  class_id: string;
  fee_type_id: string;
  category?: string;
  amount: number;
}

interface FeeStructuresDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FeeStructureFormData;
  setFormData: React.Dispatch<React.SetStateAction<FeeStructureFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  submitLoading: boolean;
  isEditing: boolean;
  yearOptions: SearchableSelectOption[];
  classOptions: SearchableSelectOption[];
  feeTypeOptions: SearchableSelectOption[];
}

export default function FeeStructuresDrawer({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  submitLoading,
  isEditing,
  yearOptions,
  classOptions,
  feeTypeOptions
}: FeeStructuresDrawerProps) {
  if (!isOpen) return null;

  const categoryOptions: SearchableSelectOption[] = [
    { value: 'Normal', label: 'Normal Student' },
    { value: 'Staff Child', label: 'Staff Child (Employee Concession)' },
    { value: 'Orphan', label: 'Orphan / Deserving' },
    { value: 'Merit', label: 'Merit Scholarship' }
  ];

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
              {isEditing ? 'Update Fee Amount' : 'Allocate New Fee'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {isEditing ? 'Modify the assigned fee amount & category.' : 'Assign a specific fee to a class & category.'}
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
          <form id="fee-structure-form" onSubmit={onSubmit} className="space-y-6">
            
            <div>
              <Label required>Target Academic Year</Label>
              <SearchableSelect 
                options={yearOptions} 
                value={formData.academic_year_id} 
                onChange={val => setFormData({...formData, academic_year_id: val})} 
                placeholder="Select Academic Year" 
                required 
                isDisabled={isEditing} 
              />
            </div>

            <div>
              <Label required>Select Class</Label>
              <SearchableSelect 
                options={classOptions} 
                value={formData.class_id} 
                onChange={val => setFormData({...formData, class_id: val})} 
                placeholder="Select Class" 
                required 
                isDisabled={isEditing} 
              />
            </div>

            <div>
              <Label required>Select Category</Label>
              <SearchableSelect 
                options={categoryOptions} 
                value={formData.category || 'Normal'} 
                onChange={val => setFormData({...formData, category: val})} 
                placeholder="Select Category (Normal, Staff Child, etc.)" 
                required 
              />
            </div>

            <div>
              <Label required>Select Fee Type</Label>
              <SearchableSelect 
                options={feeTypeOptions} 
                value={formData.fee_type_id} 
                onChange={val => setFormData({...formData, fee_type_id: val})} 
                placeholder="Select Fee (e.g. Tuition)" 
                required 
                isDisabled={isEditing} 
              />
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 mt-4">
              <Label required>Fee Amount (Rs)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rs.</span>
                <input 
                  type="number" 
                  min="0" 
                  required 
                  className="w-full h-12 pl-12 pr-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-lg font-black text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                  placeholder="0.00" 
                  value={formData.amount || ''} 
                  onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} 
                />
              </div>
              {isEditing && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-2 font-medium">
                  Note: Updating this amount affects all future challans for this class. Past challans remain unchanged.
                </p>
              )}
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
            form="fee-structure-form" 
            variant="primary" 
            disabled={submitLoading || !formData.class_id || !formData.fee_type_id || formData.amount <= 0}
            className="min-w-[120px]"
          >
            {submitLoading ? 'Saving...' : (isEditing ? 'Update Amount' : 'Allocate Fee')}
          </Button>
        </div>
      </div>
    </>
  );
}
