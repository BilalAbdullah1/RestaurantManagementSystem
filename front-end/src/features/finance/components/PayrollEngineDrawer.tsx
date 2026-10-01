import React, { useState } from 'react';
import { Calculator, Sparkles, CheckCircle2 } from 'lucide-react';
import SearchableSelect from '../../../components/form/select/SearchableSelect';
import InputField from '../../../components/form/input/InputField';
import Label from '../../../components/form/Label';
import ProfileDrawer from '../../../components/ui/UIDesigns/ProfileDrawer';
import { toast } from '../../../components/ui/Toast';
import api from '../../../utils/axiosConfig';

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

interface PayrollEngineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  onSuccess: (targetMonthString: string) => void;
}

export default function PayrollEngineDrawer({ isOpen, onClose, tenantId, onSuccess }: PayrollEngineDrawerProps) {
  const [genMonthIndex, setGenMonthIndex] = useState<number>(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState<number>(new Date().getFullYear());
  const [rules, setRules] = useState({
    lates_per_absent: 3,
    half_days_per_absent: 2,
    allowed_leaves: 2
  });
  const [generateLoading, setGenerateLoading] = useState(false);

  const handleGenerateBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerateLoading(true);
    try {
      const targetMonthString = `${MONTHS[genMonthIndex - 1]} ${genYear}`;
      const payload = {
        tenant_id: tenantId,
        salary_month: targetMonthString,
        month: genMonthIndex,
        year: genYear,
        lates_per_absent: rules.lates_per_absent,
        half_days_per_absent: rules.half_days_per_absent,
        allowed_leaves: rules.allowed_leaves
      };

      const res = await api.post('/salaryslips/generate-bulk', payload);
      toast.success(res.data.message || 'Payroll generated successfully!');
      
      onSuccess(targetMonthString);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate payroll.');
    } finally {
      setGenerateLoading(false);
    }
  };

  const monthOptions = MONTHS.map((m, i) => ({ value: (i + 1).toString(), label: m }));
  const yearOptions = [2024, 2025, 2026, 2027].map(y => ({ value: y.toString(), label: y.toString() }));

  return (
    <ProfileDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Run Payroll Engine & Bulk Generator"
    >
      <form id="payrollEngineForm" onSubmit={handleGenerateBulk} className="space-y-6 p-2">
        
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-2xl flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
            <span className="font-bold block mb-1">Attendance-Synced Payroll Calculations</span>
            The system syncs with monthly staff attendance (Lates, Half-days, Leaves, Absents) and active staff loan balances to automatically compute net salary slips.
          </div>
        </div>

        {/* Target Month & Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>Target Month</Label>
            <SearchableSelect 
              options={monthOptions}
              value={genMonthIndex.toString()}
              onChange={(val) => setGenMonthIndex(parseInt(val))}
              placeholder="Month"
            />
          </div>
          <div>
            <Label required>Target Year</Label>
            <SearchableSelect 
              options={yearOptions}
              value={genYear.toString()}
              onChange={(val) => setGenYear(parseInt(val))}
              placeholder="Year"
            />
          </div>
        </div>

        {/* Deduction Rules Section */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-500" />
            Attendance Deduction Rules
          </h4>
          
          <div className="space-y-4">
            <div>
              <Label required>Lates per 1 Absent</Label>
              <InputField 
                type="number" 
                min="1" 
                value={rules.lates_per_absent} 
                onChange={e => setRules({...rules, lates_per_absent: parseInt(e.target.value) || 1})} 
                placeholder="e.g. 3 (3 Late arrivals = 1 Day salary deduction)"
                required
              />
              <span className="text-[11px] text-gray-400 block mt-1">Default: 3 Lates = 1 Day Absent</span>
            </div>

            <div>
              <Label required>Half-Days per 1 Absent</Label>
              <InputField 
                type="number" 
                min="1" 
                value={rules.half_days_per_absent} 
                onChange={e => setRules({...rules, half_days_per_absent: parseInt(e.target.value) || 1})} 
                placeholder="e.g. 2 (2 Half-days = 1 Day salary deduction)"
                required
              />
              <span className="text-[11px] text-gray-400 block mt-1">Default: 2 Half-Days = 1 Day Absent</span>
            </div>

            <div>
              <Label required>Allowed Paid Leaves / Month</Label>
              <InputField 
                type="number" 
                min="0" 
                value={rules.allowed_leaves} 
                onChange={e => setRules({...rules, allowed_leaves: parseInt(e.target.value) || 0})} 
                placeholder="e.g. 2"
                required
              />
              <span className="text-[11px] text-gray-400 block mt-1">Leaves above this threshold trigger Leave Without Pay (LWP)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={generateLoading}
            className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={generateLoading}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{generateLoading ? 'Calculating Payroll...' : 'Run Payroll Engine'}</span>
          </button>
        </div>

      </form>
    </ProfileDrawer>
  );
}

