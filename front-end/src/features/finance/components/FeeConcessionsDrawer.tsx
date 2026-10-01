import React from 'react';
import { X } from 'lucide-react';
import Input from '../../../components/form/input/InputField';
import SearchableSelect, { SearchableSelectOption } from '../../../components/form/input/SearchableSelect';
import Button from '../../../components/ui/button/Button';

interface FeeConcessionFormData {
  id: string;
  tenant_id: string;
  student_id: string;
  fee_type_id: string;
  name: string;
  discount_type: 'Percentage' | 'FixedAmount';
  discount_value: number;
  is_active: boolean;
}

interface FeeConcessionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FeeConcessionFormData;
  setFormData: (data: FeeConcessionFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLoading: boolean;
  isEditing: boolean;
  studentOptions: SearchableSelectOption[];
  feeTypeOptions: SearchableSelectOption[];
}

export default function FeeConcessionsDrawer({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  submitLoading,
  isEditing,
  studentOptions,
  feeTypeOptions
}: FeeConcessionsDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[999] transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[1000] transform transition-transform duration-300 ease-in-out flex flex-col animate-in slide-in-from-right">
        
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Update Discount' : 'Apply New Discount'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Configure scholarship or custom fee reduction.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="fee-concession-form" onSubmit={onSubmit} className="space-y-6">
            
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Student *</label>
              <SearchableSelect 
                options={studentOptions} 
                value={formData.student_id} 
                onChange={val => setFormData({...formData, student_id: val})} 
                placeholder="Search Student..." 
                required 
                disabled={isEditing} 
              />
              {isEditing && <span className="text-[10px] text-gray-400 mt-1 block">Student cannot be changed during edit.</span>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Target Fee Category *</label>
              <SearchableSelect 
                options={feeTypeOptions} 
                value={formData.fee_type_id} 
                onChange={val => setFormData({...formData, fee_type_id: val})} 
                placeholder="Select Fee (e.g., Tuition Fee)" 
                required 
                disabled={isEditing} 
              />
              {isEditing && <span className="text-[10px] text-gray-400 mt-1 block">Fee category cannot be changed during edit.</span>}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Discount Title *</label>
              <Input 
                type="text" 
                required 
                placeholder="e.g., Sibling Discount, Merit Scholarship..." 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Discount Type *</label>
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, discount_type: 'Percentage', discount_value: 0 })}
                  className={`flex-1 text-sm font-bold py-2 rounded-md transition-colors ${formData.discount_type === 'Percentage' ? 'bg-white dark:bg-gray-700 text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, discount_type: 'FixedAmount', discount_value: 0 })}
                  className={`flex-1 text-sm font-bold py-2 rounded-md transition-colors ${formData.discount_type === 'FixedAmount' ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Fixed Amount (Rs.)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Discount Value *</label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${formData.discount_type === 'Percentage' ? 'text-brand-500' : 'text-emerald-500'}`}>
                  {formData.discount_type === 'Percentage' ? '%' : 'Rs.'}
                </span>
                <input 
                  type="number" 
                  min="1" 
                  max={formData.discount_type === 'Percentage' ? "100" : undefined}
                  required 
                  className={`w-full h-11 pl-12 pr-4 rounded-lg border bg-transparent text-sm font-bold outline-none transition-shadow dark:text-white ${formData.discount_type === 'Percentage' ? 'border-brand-200 focus:ring-brand-500' : 'border-emerald-200 focus:ring-emerald-500'}`}
                  placeholder="0" 
                  value={formData.discount_value || ''} 
                  onChange={e => setFormData({...formData, discount_value: parseFloat(e.target.value) || 0})} 
                />
              </div>
            </div>

            <div className="flex items-center mt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.is_active} 
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  className="w-5 h-5 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Discount is active</span>
              </label>
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="fee-concession-form" 
            variant="primary" 
            disabled={submitLoading || !formData.student_id || !formData.fee_type_id || !formData.name || formData.discount_value <= 0}
            className="min-w-[120px]"
          >
            {submitLoading ? 'Saving...' : 'Save Discount'}
          </Button>
        </div>
      </div>
    </>
  );
}
