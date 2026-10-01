import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import { toast } from '../../components/ui/Toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { DebouncedSearch } from '../../components/form/DebouncedSearch';
import DatePicker from '../../components/form/date-picker';
import Label from '../../components/form/Label';
import Badge from '../../components/ui/badge/Badge';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  TrendingUp, TrendingDown, FileText,
  Calendar, Wallet, Loader2, FileDown, RefreshCw, CheckCircle2, XCircle, ChevronRight,
  ChevronDown, ChevronUp
} from 'lucide-react';

interface FinanceCategorySummaryDto {
  category: string;
  amount: number;
  percentage: number;
  count?: number;
}
interface PnlLineItemDto {
  date: string;
  description: string;
  category: string;
  reference: string;
  amount: number;
  source: string;
}
interface ProfitAndLossDto {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueBreakdown: FinanceCategorySummaryDto[];
  expenseBreakdown: FinanceCategorySummaryDto[];
  revenueItems: PnlLineItemDto[];
  expenseItems: PnlLineItemDto[];
  periodLabel: string;
  totalPaymentsCount: number;
  totalExpenseCount: number;
}

export default function ProfitLossReport() {
  const [searchParams] = useSearchParams();
  const [pnlReport, setPnlReport] = useState<ProfitAndLossDto | null>(null);
  const [loadingPnl, setLoadingPnl] = useState(false);
  const [pnlStart, setPnlStart] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [pnlEnd, setPnlEnd] = useState(new Date().toISOString().split('T')[0]);

  const [showRevItems, setShowRevItems] = useState(false);
  const [showExpItems, setShowExpItems] = useState(false);
  const [revSearch, setRevSearch] = useState('');
  const [expSearch, setExpSearch] = useState('');

  // Sync date filters from URL search params
  useEffect(() => {
    const s = searchParams.get('startDate');
    if (s) setPnlStart(s);
    const e = searchParams.get('endDate');
    if (e) setPnlEnd(e);
  }, [searchParams]);

  const fetchPnl = useCallback(async () => {
    setLoadingPnl(true);
    try {
      const res = await api.get<ProfitAndLossDto>(`/financereports/profit-loss?startDate=${pnlStart}&endDate=${pnlEnd}`);
      setPnlReport(res.data);
    } catch {
      toast.error('Failed to load P&L statement.');
    } finally {
      setLoadingPnl(false);
    }
  }, [pnlStart, pnlEnd]);

  useEffect(() => {
    fetchPnl();
  }, [fetchPnl]);

  const exportPnlPDF = () => {
    if (!pnlReport) return;
    const doc = new jsPDF();

    doc.setFontSize(18); doc.setFont('helvetica', 'bold'); doc.setTextColor(5, 150, 105);
    doc.text('PROFIT & LOSS STATEMENT', 14, 16);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100);
    doc.text(`Period: ${pnlReport.periodLabel || `${pnlStart} to ${pnlEnd}`}`, 14, 24);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}`, 14, 30);

    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(5, 100, 70);
    doc.text('INCOME / REVENUE', 14, 42);
    autoTable(doc, {
      startY: 46,
      head: [['Category', 'Amount (Rs.)', 'Contribution %']],
      body: pnlReport.revenueBreakdown.map(r => [
        r.category,
        `Rs. ${Number(r.amount).toLocaleString()}`,
        `${r.percentage}%`
      ]),
      headStyles: { fillColor: [5, 150, 105], fontSize: 8 },
      styles: { fontSize: 8 }
    });

    const y1 = (doc as any).lastAutoTable?.finalY + 4 || 80;
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(50);
    doc.text('Revenue Detail Transactions:', 14, y1);
    autoTable(doc, {
      startY: y1 + 4,
      head: [['Date', 'Description', 'Category', 'Reference', 'Amount (Rs.)']],
      body: (pnlReport.revenueItems || []).map(r => [
        r.date, r.description, r.category, r.reference,
        `Rs. ${Number(r.amount).toLocaleString()}`
      ]),
      headStyles: { fillColor: [16, 185, 129], fontSize: 7 },
      styles: { fontSize: 7 },
      foot: [['', '', '', 'TOTAL REVENUE', `Rs. ${Number(pnlReport.totalRevenue).toLocaleString()}`]],
      footStyles: { fillColor: [236, 253, 245], textColor: [5, 150, 105], fontStyle: 'bold', fontSize: 8 }
    });

    doc.addPage();
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(220, 38, 38);
    doc.text('EXPENDITURE / EXPENSES', 14, 14);
    autoTable(doc, {
      startY: 18,
      head: [['Category', 'Amount (Rs.)', 'Contribution %']],
      body: pnlReport.expenseBreakdown.map(r => [
        r.category,
        `Rs. ${Number(r.amount).toLocaleString()}`,
        `${r.percentage}%`
      ]),
      headStyles: { fillColor: [239, 68, 68], fontSize: 8 },
      styles: { fontSize: 8 }
    });

    const y3 = (doc as any).lastAutoTable?.finalY + 4 || 80;
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(50);
    doc.text('Expense Detail Transactions:', 14, y3);
    autoTable(doc, {
      startY: y3 + 4,
      head: [['Date', 'Description', 'Category', 'Reference', 'Amount (Rs.)']],
      body: (pnlReport.expenseItems || []).map(r => [
        r.date, r.description, r.category, r.reference,
        `Rs. ${Number(r.amount).toLocaleString()}`
      ]),
      headStyles: { fillColor: [239, 68, 68], fontSize: 7 },
      styles: { fontSize: 7 },
      foot: [['', '', '', 'TOTAL EXPENSES', `Rs. ${Number(pnlReport.totalExpenses).toLocaleString()}`]],
      footStyles: { fillColor: [255, 241, 242], textColor: [220, 38, 38], fontStyle: 'bold', fontSize: 8 }
    });

    const yFinal = (doc as any).lastAutoTable?.finalY + 14 || 220;
    const isProfit = pnlReport.netProfit >= 0;
    doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.setTextColor(isProfit ? 5 : 220, isProfit ? 150 : 38, isProfit ? 105 : 38);
    doc.text(`NET ${isProfit ? 'PROFIT' : 'LOSS'}: Rs. ${Math.abs(Number(pnlReport.netProfit)).toLocaleString()}`, 14, yFinal);

    doc.save('profit_loss_statement.pdf');
    toast.success('P&L PDF exported with full detail.');
  };

  const filteredRevItems = useMemo(() => {
    if (!pnlReport?.revenueItems) return [];
    const q = revSearch.toLowerCase();
    if (!q) return pnlReport.revenueItems;
    return pnlReport.revenueItems.filter(r =>
      r.description.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.reference.toLowerCase().includes(q)
    );
  }, [pnlReport, revSearch]);

  const filteredExpItems = useMemo(() => {
    if (!pnlReport?.expenseItems) return [];
    const q = expSearch.toLowerCase();
    if (!q) return pnlReport.expenseItems;
    return pnlReport.expenseItems.filter(r =>
      r.description.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.reference.toLowerCase().includes(q)
    );
  }, [pnlReport, expSearch]);

  const sourceColor = (source: string) => {
    switch (source) {
      case 'FeePayment': return 'success';
      case 'LateFine': return 'warning';
      case 'Salary': return 'danger';
      case 'Expense': return 'primary';
      default: return 'light';
    }
  };

  return (
    <div className="w-full space-y-6">
      <Breadcrumb items={[{ label: 'Reports & Analytics' }, { label: 'Profit & Loss Statement Report' }]} />

      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-7 h-7 text-emerald-600" /> Profit & Loss Statement Report
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Income vs Expenditure calculation, itemized ledger lines, and PDF export.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-end gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex-1">
          <Label>Start Date</Label>
          <DatePicker value={pnlStart} onChange={(e: any) => setPnlStart(e.target?.value || e)} />
        </div>
        <div className="flex-1">
          <Label>End Date</Label>
          <DatePicker value={pnlEnd} onChange={(e: any) => setPnlEnd(e.target?.value || e)} />
        </div>
        <button
          onClick={fetchPnl}
          disabled={loadingPnl}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl flex items-center gap-2 h-10 cursor-pointer"
        >
          {loadingPnl ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Generate P&L
        </button>
        {pnlReport && (
          <button
            onClick={exportPnlPDF}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 h-10 cursor-pointer"
          >
            <FileDown className="w-4 h-4" /> Export PDF
          </button>
        )}
      </div>

      {loadingPnl && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      )}

      {!loadingPnl && !pnlReport && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-16 text-center border border-dashed border-gray-200 dark:border-gray-800">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">
            No Profit & Loss Statement Generated
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            Select a date range above and click "Generate P&L" to compile revenues, operating expenses, and net surplus.
          </p>
        </div>
      )}

      {!loadingPnl && pnlReport && (
        <>
          <div className="flex items-center justify-between px-5 py-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-bold">Report Period:</span>
              <span className="text-sm">{pnlReport.periodLabel || `${pnlStart} to ${pnlEnd}`}</span>
            </div>
            <div className="flex gap-4 text-xs text-indigo-600 dark:text-indigo-400">
              <span>{pnlReport.totalPaymentsCount} payment(s)</span>
              <span>{pnlReport.totalExpenseCount} expense(s)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Total Income</p>
              </div>
              <h3 className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
                Rs. {Number(pnlReport.totalRevenue).toLocaleString()}
              </h3>
            </div>

            <div className="p-6 rounded-2xl border border-rose-100 dark:border-rose-900/30 bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase">Total Expenses</p>
              </div>
              <h3 className="text-3xl font-black text-rose-700 dark:text-rose-300">
                Rs. {Number(pnlReport.totalExpenses).toLocaleString()}
              </h3>
            </div>

            <div className={`p-6 rounded-2xl text-white ${
              pnlReport.netProfit >= 0
                ? 'bg-gradient-to-br from-indigo-600 to-blue-600'
                : 'bg-gradient-to-br from-rose-600 to-red-700'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold uppercase opacity-90">Net Profit / (Loss)</p>
              </div>
              <h3 className="text-3xl font-black">Rs. {Math.abs(Number(pnlReport.netProfit)).toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> INCOME / REVENUE
              </h4>
              <span className="font-black text-emerald-700 dark:text-emerald-400">Rs. {Number(pnlReport.totalRevenue).toLocaleString()}</span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {pnlReport.revenueBreakdown.map((item, i) => (
                <div key={i} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">{item.category}</span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">Rs. {Number(item.amount).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 bg-rose-50 dark:bg-rose-950/30 border-t border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
              <h4 className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" /> EXPENDITURE / EXPENSES
              </h4>
              <span className="font-black text-rose-700 dark:text-rose-400">Rs. {Number(pnlReport.totalExpenses).toLocaleString()}</span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {pnlReport.expenseBreakdown.map((item, i) => (
                <div key={i} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">{item.category}</span>
                    </div>
                    <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">Rs. {Number(item.amount).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
