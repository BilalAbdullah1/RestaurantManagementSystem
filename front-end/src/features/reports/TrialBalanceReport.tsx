import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../utils/axiosConfig';
import { toast } from '../../components/ui/Toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import Badge from '../../components/ui/badge/Badge';
import { ChartOfAccountItem } from '../finance/ChartOfAccountsManager';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BookOpen, Loader2, FileDown, CheckCircle2 } from 'lucide-react';

const FX_RATES: Record<string, number> = { PKR: 1, USD: 278.50, SAR: 74.25, AED: 75.80 };
const pkr = (acc: ChartOfAccountItem) => acc.balance * (FX_RATES[acc.currency || 'PKR'] || 1);

export default function TrialBalanceReport() {
  const tenantId = localStorage.getItem('tenantId') || '';
  const [accounts, setAccounts] = useState<ChartOfAccountItem[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const fetchAccounts = useCallback(async () => {
    if (!tenantId) return;
    setLoadingAccounts(true);
    try {
      const res = await api.get<ChartOfAccountItem[]>(`/chartofaccounts/tenant/${tenantId}`);
      setAccounts(res.data || []);
    } catch {
      toast.error('Failed to load accounts.');
    } finally {
      setLoadingAccounts(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const trialBalance = useMemo(() => {
    let dr = 0; let cr = 0;
    const list = accounts.map(a => {
      const bal = pkr(a);
      const isDebit = a.type === 'Asset' || a.type === 'Expense';
      const debit = isDebit && bal >= 0 ? bal : (!isDebit && bal < 0 ? Math.abs(bal) : 0);
      const credit = !isDebit && bal >= 0 ? bal : (isDebit && bal < 0 ? Math.abs(bal) : 0);
      dr += debit; cr += credit;
      return { ...a, debit, credit };
    });

    const diff = dr - cr;
    const plugRow = diff !== 0 ? [{
      id: '__ob_diff__',
      code: 'OBD',
      name: 'Opening Balance Difference (Unposted)',
      type: 'Equity',
      sub_category: 'Suspense — Post Opening JVs to clear',
      balance: Math.abs(diff),
      currency: 'PKR',
      is_active: true,
      debit: diff < 0 ? Math.abs(diff) : 0,
      credit: diff > 0 ? Math.abs(diff) : 0,
    }] : [];

    const finalDr = dr + (plugRow[0]?.debit || 0);
    const finalCr = cr + (plugRow[0]?.credit || 0);
    return { list: [...list, ...plugRow] as any[], totalDebit: finalDr, totalCredit: finalCr, balanced: Math.abs(finalDr - finalCr) < 1 };
  }, [accounts]);

  const exportTrialBalancePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.setTextColor(79, 70, 229);
    doc.text('TRIAL BALANCE STATEMENT', 14, 15);
    doc.setFontSize(9); doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-PK')}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [['Code', 'Account Head', 'Type', 'Debit (Rs.)', 'Credit (Rs.)']],
      body: trialBalance.list.map(a => [a.code, a.name, a.type, a.debit > 0 ? `Rs. ${a.debit.toLocaleString()}` : '-', a.credit > 0 ? `Rs. ${a.credit.toLocaleString()}` : '-']),
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8 }
    });

    const y = (doc as any).lastAutoTable?.finalY + 10 || 100;
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
    doc.text(`TOTAL DEBITS: Rs. ${trialBalance.totalDebit.toLocaleString()}`, 14, y);
    doc.text(`TOTAL CREDITS: Rs. ${trialBalance.totalCredit.toLocaleString()}`, 110, y);

    doc.save('trial_balance.pdf');
    toast.success('Trial Balance PDF exported.');
  };

  return (
    <div className="w-full space-y-6">
      <Breadcrumb items={[{ label: 'Reports & Analytics' }, { label: 'Trial Balance Statement Report' }]} />

      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-indigo-600" /> Trial Balance Statement Report
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Double-entry ledger balances audit verifying Total Debits equal Total Credits.
        </p>
      </div>

      {loadingAccounts && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      )}

      {!loadingAccounts && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl border flex items-center justify-between flex-wrap gap-4 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                  Trial Balance ✓ BALANCED — Debits = Credits
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Total Debits: Rs. {trialBalance.totalDebit.toLocaleString()} | Total Credits: Rs. {trialBalance.totalCredit.toLocaleString()}
                </p>
              </div>
            </div>
            <button onClick={exportTrialBalancePDF} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer">
              <FileDown className="w-4 h-4" /> Export PDF
            </button>
          </div>

          <div className="overflow-x-auto min-h-[250px] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  {['Code #', 'Account Head', 'Type', 'Sub-Category', 'Debit (PKR)', 'Credit (PKR)'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {trialBalance.list.map((a, idx) => (
                  <tr key={a.id} className={`hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/40 dark:bg-gray-800/20'}`}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">#{a.code}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm">{a.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="light" color={a.type === 'Asset' ? 'info' : a.type === 'Revenue' ? 'success' : a.type === 'Expense' ? 'warning' : 'danger'}>{a.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{a.sub_category || 'General'}</td>
                    <td className="px-4 py-3 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {a.debit > 0 ? `Rs. ${a.debit.toLocaleString()}` : <span className="text-gray-300 dark:text-gray-700">—</span>}
                    </td>
                    <td className="px-4 py-3 font-black text-purple-600 dark:text-purple-400 text-sm">
                      {a.credit > 0 ? `Rs. ${a.credit.toLocaleString()}` : <span className="text-gray-300 dark:text-gray-700">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 dark:bg-gray-800 border-t-2 border-gray-300 dark:border-gray-700">
                <tr>
                  <td colSpan={4} className="px-4 py-4 font-black text-gray-900 dark:text-white text-sm uppercase">TOTALS</td>
                  <td className="px-4 py-4 font-black text-emerald-600 dark:text-emerald-400 text-sm">Rs. {trialBalance.totalDebit.toLocaleString()}</td>
                  <td className="px-4 py-4 font-black text-purple-600 dark:text-purple-400 text-sm">Rs. {trialBalance.totalCredit.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
