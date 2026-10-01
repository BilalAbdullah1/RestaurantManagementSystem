import React from 'react';
import { X, BoltIcon } from 'lucide-react';
import SearchableSelect, { SearchableSelectOption } from '../../../components/form/select/SearchableSelect';
import Label from '../../../components/form/Label';
import DatePicker from '../../../components/form/date-picker';
import Button from '../../../components/ui/button/Button';

interface FeeChallansDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  generateLoading: boolean;
  
  genYearId: string;
  setGenYearId: (v: string) => void;
  genClassId: string;
  setGenClassId: (v: string) => void;
  genMonth: string;
  setGenMonth: (v: string) => void;
  issueDate: string;
  setIssueDate: (v: string) => void;
  dueDate: string;
  setDueDate: (v: string) => void;

  yearOptions: SearchableSelectOption[];
  classOptions: SearchableSelectOption[];
  monthOptions: SearchableSelectOption[];
}

export default function FeeChallansDrawer({
  isOpen,
  onClose,
  onSubmit,
  generateLoading,
  genYearId, setGenYearId,
  genClassId, setGenClassId,
  genMonth, setGenMonth,
  issueDate, setIssueDate,
  dueDate, setDueDate,
  yearOptions,
  classOptions,
  monthOptions
}: FeeChallansDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[999] transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[1000] transform transition-transform duration-300 ease-in-out flex flex-col animate-in slide-in-from-right">
        
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-brand-600 to-blue-700 text-white">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BoltIcon className="w-5 h-5" /> Automation Engine
            </h2>
            <p className="text-xs text-brand-100 mt-1 opacity-90">
              Generate monthly bills instantly.
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
          <form id="fee-generate-form" onSubmit={onSubmit} className="space-y-6">
            
            <div>
              <Label required>Academic Year</Label>
              <SearchableSelect options={yearOptions} value={genYearId} onChange={setGenYearId} required />
            </div>

            <div>
              <Label required>Billing Month</Label>
              <SearchableSelect options={monthOptions} value={genMonth} onChange={setGenMonth} required />
            </div>

            <div>
              <Label required>Target Class</Label>
              <SearchableSelect options={classOptions} value={genClassId} onChange={setGenClassId} placeholder="Select class to generate bills for..." required />
            </div>

            <div className="border-t border-gray-100 dark:border-slate-800 pt-6">
              <Label required>Issue Date</Label>
              <DatePicker value={issueDate} onChange={(e: any) => setIssueDate(e.target.value)} required />
            </div>

            <div>
              <Label required>Due Date</Label>
              <DatePicker value={dueDate} onChange={(e: any) => setDueDate(e.target.value)} placeholder="Select expiry date" required />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 p-4 rounded-xl flex items-start gap-3 mt-4">
              <span className="text-blue-600 text-lg">💡</span>
              <p className="text-xs font-medium text-blue-900 dark:text-blue-300 leading-relaxed">
                <strong>Smart Quota Engine Active:</strong> The engine automatically matches each student's <em>Category / Quota</em> (Normal, Staff Child, Orphan, Merit, Need-Based, Special Quota) against your configured Class Fee Structures and Fee Concessions to calculate itemized line items and discounts automatically.
              </p>
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="fee-generate-form" 
            variant="primary" 
            disabled={generateLoading || !genClassId || !dueDate}
            className="min-w-[120px]"
          >
            {generateLoading ? 'Generating...' : 'Run Engine'}
          </Button>
        </div>
      </div>
    </>
  );
}
