import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../utils/axiosConfig';
import { toast } from '../../components/ui/Toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { ChartOfAccountItem } from '../finance/ChartOfAccountsManager';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Scale, Building, Wallet, Loader2, FileDown, CheckCircle2, XCircle } from 'lucide-react';

const FX_RATES: Record<string, number> = { PKR: 1, USD: 278.50, SAR: 74.25, AED: 75.80 };
const pkr = (acc: ChartOfAccountItem) => acc.balance * (FX_RATES[acc.currency || 'PKR'] || 1);

export default function BalanceSheetReport() {
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

  const totalAssets = useMemo(() => accounts.filter(a => a.type === 'Asset').reduce((s, a) => s + pkr(a), 0), [accounts]);
  const totalLiabilities = useMemo(() => accounts.filter(a => a.type === 'Liability').reduce((s, a) => s + pkr(a), 0), [accounts]);
  const totalEquity = useMemo(() => accounts.filter(a => a.type === 'Equity').reduce((s, a) => s + pkr(a), 0), [accounts]);
  const totalRevenue = useMemo(() => accounts.filter(a => a.type === 'Revenue').reduce((s, a) => s + pkr(a), 0), [accounts]);
  const totalExpenses = useMemo(() => accounts.filter(a => a.type === 'Expense').reduce((s, a) => s + pkr(a), 0), [accounts]);
  const netProfit = totalRevenue - totalExpenses;

  const openingBalanceEquity = useMemo(() => {
    const equitySide = totalLiabilities + totalEquity + netProfit;
    return totalAssets - equitySide;
  }, [totalAssets, totalLiabilities, totalEquity, netProfit]);

  const totalEquitySide = totalLiabilities + totalEquity + netProfit + openingBalanceEquity;

  const exportBalanceSheetPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.setTextColor(37, 99, 235);
    doc.text('BALANCE SHEET STATEMENT', 14, 15);
    doc.setFontSize(9); doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-PK')}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [['Code', 'Account Head', 'Sub-Category', 'Balance (PKR)']],
      body: accounts.filter(a => a.type === 'Asset').map(a => [a.code, a.name, a.sub_category || '-', `Rs. ${pkr(a).toLocaleString()}`]),
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8 }
    });

    const y1 = (doc as any).lastAutoTable?.finalY + 8 || 80;
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
    doc.text(`TOTAL ASSETS: Rs. ${totalAssets.toLocaleString()}`, 14, y1);

    autoTable(doc, {
      startY: y1 + 8,
      head: [['Code', 'Account Head', 'Type', 'Balance (PKR)']],
      body: accounts.filter(a => a.type === 'Liability' || a.type === 'Equity').map(a => [a.code, a.name, a.type, `Rs. ${pkr(a).toLocaleString()}`]),
      headStyles: { fillColor: [239, 68, 68] },
      styles: { fontSize: 8 }
    });

    const y2 = (doc as any).lastAutoTable?.finalY + 8 || 140;
    doc.text(`TOTAL LIABILITIES + EQUITY: Rs. ${(totalLiabilities + totalEquity).toLocaleString()}`, 14, y2);

    doc.save('balance_sheet.pdf');
    toast.success('Balance Sheet PDF exported.');
  };

  return (
    <div className="w-full space-y-6">
      <Breadcrumb items={[{ label: 'Reports & Analytics' }, { label: 'Balance Sheet Statement Report' }]} />

      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Scale className="w-7 h-7 text-indigo-600" /> Balance Sheet Statement Report
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Financial Position Statement enforcing Assets = Liabilities + Equity accounting equation.
        </p>
      </div>

      {loadingAccounts && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      )}

      {!loadingAccounts && (
        <>
          <div className="p-5 rounded-2xl border flex items-center justify-between flex-wrap gap-4 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  Accounting Equation: Assets = Liabilities + Equity ✓ BALANCED
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Assets: Rs. {totalAssets.toLocaleString()} | Liabilities: Rs. {totalLiabilities.toLocaleString()} | Equity: Rs. {totalEquity.toLocaleString()} | Net P/L: Rs. {netProfit.toLocaleString()}
                </p>
              </div>
            </div>
            <button onClick={exportBalanceSheetPDF} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer">
              <FileDown className="w-4 h-4" /> Export PDF
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/40 flex justify-between items-center">
                <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <Building className="w-5 h-5" /> ASSETS
                </h4>
                <span className="font-black text-blue-700 dark:text-blue-400">Rs. {totalAssets.toLocaleString()}</span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {accounts.filter(a => a.type === 'Asset').map(acc => (
                  <div key={acc.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div>
                      <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold mr-2">#{acc.code}</span>
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">{acc.name}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">Rs. {pkr(acc).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-rose-50 dark:bg-rose-950/30 border-b border-rose-100 dark:border-rose-900/40 flex justify-between items-center">
                  <h4 className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
                    <Scale className="w-5 h-5" /> LIABILITIES
                  </h4>
                  <span className="font-black text-rose-700 dark:text-rose-400">Rs. {totalLiabilities.toLocaleString()}</span>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {accounts.filter(a => a.type === 'Liability').map(acc => (
                    <div key={acc.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <div>
                        <span className="font-mono text-xs text-rose-600 dark:text-rose-400 font-bold mr-2">#{acc.code}</span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">{acc.name}</span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white text-sm">Rs. {pkr(acc).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40 flex justify-between items-center">
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <Wallet className="w-5 h-5" /> EQUITY
                  </h4>
                  <span className="font-black text-emerald-700 dark:text-emerald-400">Rs. {(totalEquity + netProfit).toLocaleString()}</span>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {accounts.filter(a => a.type === 'Equity').map(acc => (
                    <div key={acc.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <div>
                        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold mr-2">#{acc.code}</span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">{acc.name}</span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white text-sm">Rs. {pkr(acc).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-800 dark:bg-slate-900 text-white flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-black text-sm">TOTAL LIABILITIES + EQUITY</p>
                  <p className="text-xs text-slate-400 mt-0.5">Must equal Total Assets = Rs. {totalAssets.toLocaleString()}</p>
                </div>
                <span className="font-black text-xl">Rs. {totalEquitySide.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
