import React from 'react';
import { X, WalletIcon } from 'lucide-react';
import Input from '../../../components/form/input/InputField';
import DatePicker from '../../../components/form/date-picker';
import SearchableSelect from '../../../components/form/select/SearchableSelect';
import Button from '../../../components/ui/button/Button';

export const EXPENSE_CATEGORIES = [
  "Raw Food & Kitchen Ingredients",
  "Meat, Poultry & Seafood",
  "Dairy, Bakery & Groceries",
  "Beverages & Bar Supplies",
  "Commercial LPG Gas & Utilities",
  "Kitchen Equipment Maintenance",
  "Packaging & Delivery Boxes",
  "Staff Salaries (Misc)",
  "Marketing & Promotions",
  "Cleaning & Sanitation Supplies",
  "Miscellaneous Restaurant Expenses"
];

export interface RestaurantExpenseFormData {
  id?: string;
  tenant_id: string;
  category: string;
  title: string;
  amount: number;
  expense_date: string;
  description: string;
}

interface RestaurantExpensesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  formData: RestaurantExpenseFormData;
  setFormData: (data: RestaurantExpenseFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLoading: boolean;
  isEditing: boolean;
}

export default function RestaurantExpensesDrawer({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  submitLoading,
  isEditing
}: RestaurantExpensesDrawerProps) {
  if (!isOpen) return null;

  const categoryOptions = EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }));

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[999] transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[1000] transform transition-transform duration-300 ease-in-out flex flex-col animate-in slide-in-from-right">
        
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-rose-600 to-red-600 text-white">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <WalletIcon className="w-5 h-5" /> {isEditing ? 'Update Restaurant Expense' : 'Record Restaurant Expense'}
            </h2>
            <p className="text-xs text-rose-100 mt-1 opacity-90">
              Log kitchen, inventory, utilities, and daily operations expenses.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="restaurant-expense-form" onSubmit={onSubmit} className="space-y-6">
            
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Expense Title *</label>
              <Input 
                type="text" 
                placeholder="e.g. Fresh Chicken Batch & Dairy Stock..." 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Category *</label>
              <SearchableSelect 
                options={categoryOptions}
                value={formData.category}
                onChange={val => setFormData({...formData, category: val})}
                placeholder="Select expense category..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Date of Expense *</label>
              <DatePicker 
                value={formData.expense_date} 
                onChange={(e: any) => setFormData({...formData, expense_date: e.target.value})} 
                required 
              />
            </div>

            <div className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-xl border border-rose-100 dark:border-rose-900/30">
              <label className="block text-xs font-bold text-rose-700 dark:text-rose-400 uppercase mb-2">Amount Spent (Rs) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rs.</span>
                <input 
                  type="number" 
                  min="1" 
                  required 
                  className="w-full h-12 pl-12 pr-4 rounded-lg border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 text-lg font-black text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-rose-500 transition-shadow"
                  placeholder="0.00" 
                  value={formData.amount || ''} 
                  onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Additional Description / Notes</label>
              <textarea 
                rows={3}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent px-4 py-3 text-sm text-gray-800 dark:text-white focus:border-brand-500 outline-none resize-none"
                placeholder="Add supplier invoice numbers, vendor details, or chef notes here..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="restaurant-expense-form" 
            variant="primary" 
            disabled={submitLoading || !formData.title || formData.amount <= 0}
            className="min-w-[120px]"
          >
            {submitLoading ? 'Saving...' : (isEditing ? 'Update Expense' : 'Save Expense')}
          </Button>
        </div>
      </div>
    </>
  );
}
