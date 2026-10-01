import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Badge from '../../components/ui/badge/Badge';
import InputField from '../../components/form/input/InputField';
import SearchableSelect, { SearchableSelectOption } from '../../components/form/select/SearchableSelect';
import { DebouncedSearch } from '../../components/form/DebouncedSearch';
import Label from '../../components/form/Label';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import { toast } from '../../components/ui/Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState
} from '@tanstack/react-table';
import {
  BookOpen, Layers, Plus, Trash2,
  FileDown, Download, Loader2, ChevronLeft, ChevronRight, Edit3, Building,
  Scale, FolderTree, Scale as ScaleIcon, RefreshCw,
  Eye, ChevronDown, ChevronUp, X, Sparkles
} from 'lucide-react';

export interface ChartOfAccountItem {
  id: string;
  tenant_id: string;
  parent_id?: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense' | string;
  sub_category?: string;
  level?: number;
  balance: number;
  currency?: string;
  exchange_rate?: number;
  is_reconciled?: boolean;
  is_active: boolean;
  created_at?: string;
}

interface JournalVoucherEntry {
  id: string;
  voucher_no: string;
  date: string;
  narrative: string;
  debit: number;
  credit: number;
  running_balance: number;
}

// --- CONSTANTS & HELPERS MOVED OUTSIDE COMPONENT TO PREVENT RE-RENDERS --- //

const CATEGORY_OPTIONS: SearchableSelectOption[] = [
  { value: 'ALL', label: 'All Account Categories' },
  { value: 'Asset', label: '🏢 Asset (Cash, Bank, Property)' },
  { value: 'Liability', label: '💳 Liability (Payables, Loans)' },
  { value: 'Equity', label: '🏛️ Equity (Capital, Retained Earnings)' },
  { value: 'Revenue', label: '📈 Revenue (Tuition, Admission Fees)' },
  { value: 'Expense', label: '📉 Expense (Salaries, Utilities, Rent)' }
];

const ACCOUNT_TYPES: SearchableSelectOption[] = [
  { value: 'Asset', label: '🏢 Asset (Cash, Bank, Property, Equipment)' },
  { value: 'Liability', label: '💳 Liability (Loans, Vendor Payable)' },
  { value: 'Equity', label: '🏛️ Equity (Capital, Retained Earnings)' },
  { value: 'Revenue', label: '📈 Revenue (Tuition Fees, Lab Fees)' },
  { value: 'Expense', label: '📉 Expense (Salaries, Utilities, Rent)' }
];

const LEVEL_OPTIONS: SearchableSelectOption[] = [
  { value: '1', label: 'Level 1: Main Control Head (e.g. Current Assets)' },
  { value: '2', label: 'Level 2: Sub-Control Head (e.g. Bank Accounts)' },
  { value: '3', label: 'Level 3: Operational Sub-Ledger (e.g. Bank Al-Habib Main)' }
];

const CURRENCY_OPTIONS: SearchableSelectOption[] = [
  { value: 'PKR', label: '🇵🇰 PKR - Pakistani Rupee (Base)' },
  { value: 'USD', label: '🇺🇸 USD - US Dollar (@ 278.50 PKR)' },
  { value: 'SAR', label: '🇸🇦 SAR - Saudi Riyal (@ 74.25 PKR)' },
  { value: 'AED', label: '🇦🇪 AED - UAE Dirham (@ 75.80 PKR)' }
];

const FX_RATES: Record<string, number> = {
  'PKR': 1,
  'USD': 278.50,
  'SAR': 74.25,
  'AED': 75.80
};

const initialForm = {
  parent_id: '',
  code: '1001',
  name: '',
  type: 'Asset',
  sub_category: 'Current Asset',
  level: 1,
  balance: 0,
  currency: 'PKR',
  exchange_rate: 1,
  is_active: true
};

const getCategoryBadge = (type: string) => {
  const t = (type || '').toLowerCase();
  if (t === 'asset') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
        🏢 ASSET
      </span>
    );
  }
  if (t === 'liability') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
        💳 LIABILITY
      </span>
    );
  }
  if (t === 'equity') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        🏛️ EQUITY
      </span>
    );
  }
  if (t === 'revenue') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
        📈 REVENUE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
      📉 EXPENSE
    </span>
  );
};

export default function ChartOfAccountsManager() {
  const tenantId = localStorage.getItem("tenantId") || "";

  const [searchParams] = useSearchParams();
  const [accounts, setAccounts] = useState<ChartOfAccountItem[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: Datatable vs Tree Hierarchy
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
  const [expandedTreeCategories, setExpandedTreeCategories] = useState<Record<string, boolean>>({
    'Asset': true, 'Liability': true, 'Equity': true, 'Revenue': true, 'Expense': true
  });

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Drawers & Modals
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Feature Modals & Drawers
  const [trialBalanceOpen, setTrialBalanceOpen] = useState(false);
  const [timelineAccount, setTimelineAccount] = useState<ChartOfAccountItem | null>(null);
  const [timelineDrawerOpen, setTimelineDrawerOpen] = useState(false);

  // Table States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [formData, setFormData] = useState(initialForm);
  const [seedLoading, setSeedLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await api.get<ChartOfAccountItem[]>(`/chartofaccounts/tenant/${tenantId}`);
      setAccounts(res.data || []);
    } catch (err) {
      toast.error('Failed to load Chart of Accounts.');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const handleSeedDefaults = async () => {
    if (!tenantId) return;
    setSeedLoading(true);
    try {
      const res = await api.post(`/chartofaccounts/tenant/${tenantId}/seed-default`);
      toast.success(res.data?.message || 'Standard Chart of Accounts verified & seeded.');
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to seed default accounts.');
    } finally {
      setSeedLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleOpenCreate = useCallback(() => {
    const nextCode = (1000 + accounts.length + 1).toString();
    setFormData({ ...initialForm, code: nextCode });
    setIsEditing(false);
    setEditingId(null);
    setDrawerOpen(true);
  }, [accounts.length]);

  // Deep linking: Handle URL query params
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      handleOpenCreate();
    }
    const viewParam = searchParams.get('view');
    if (viewParam === 'tree' || viewParam === 'table') {
      setViewMode(viewParam);
    }
    const catParam = searchParams.get('category');
    if (catParam) {
      setCategoryFilter(catParam);
    }
    if (searchParams.get('trial_balance') === 'true') {
      setTrialBalanceOpen(true);
    }
  }, [searchParams, handleOpenCreate]);

  const handleOpenEdit = useCallback((account: ChartOfAccountItem) => {
    setFormData({
      parent_id: account.parent_id || '',
      code: account.code,
      name: account.name,
      type: account.type,
      sub_category: account.sub_category || '',
      level: account.level || 1,
      balance: account.balance,
      currency: account.currency || 'PKR',
      exchange_rate: account.exchange_rate || FX_RATES[account.currency || 'PKR'] || 1,
      is_active: account.is_active
    });
    setIsEditing(true);
    setEditingId(account.id);
    setDrawerOpen(true);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      toast.error('Account Code and Name are required.');
      return;
    }

    setSubmitLoading(true);
    try {
      if (isEditing && editingId) {
        await api.put(`/chartofaccounts/${editingId}`, {
          ...formData,
          tenant_id: tenantId
        });
        toast.success('Ledger Account Head updated successfully.');
      } else {
        await api.post('/chartofaccounts', {
          ...formData,
          tenant_id: tenantId,
          exchange_rate: FX_RATES[formData.currency] || 1
        });
        toast.success('New Ledger Account Head created successfully.');
      }
      setDrawerOpen(false);
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not save ledger head.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleYearEndClosing = async () => {
    const revenueSum = accounts.filter(a => a.type === 'Revenue').reduce((sum, a) => sum + a.balance, 0);
    const expenseSum = accounts.filter(a => a.type === 'Expense').reduce((sum, a) => sum + a.balance, 0);
    const netIncome = revenueSum - expenseSum;

    const retainedHead = accounts.find(a => a.code === '3001' || a.name.toLowerCase().includes('retained'));

    if (!retainedHead) {
      Swal.fire(
        'Missing Equity Account', 
        'Please ensure a "Retained Earnings" account (Code: 3001) is set up under Equity before executing a fiscal close.', 
        'error'
      );
      return;
    }

    const result = await Swal.fire({
      title: 'Execute Fiscal Year-End Closing?',
      html: `
        <div class="text-left space-y-2 text-sm">
          <p>This action will perform automated Year-End Ledger Rollover:</p>
          <ul class="list-disc pl-5 font-semibold text-gray-700">
            <li>Total Revenue: <span class="text-emerald-600">Rs. ${revenueSum.toLocaleString()}</span></li>
            <li>Total Expenses: <span class="text-rose-600">Rs. ${expenseSum.toLocaleString()}</span></li>
            <li>Net Income Transfer: <span class="text-indigo-600">Rs. ${netIncome.toLocaleString()}</span></li>
          </ul>
          <p class="text-xs text-amber-600 mt-2 font-bold">Net Income will be transferred into "${retainedHead.name}" and P&L balances will reset for the new fiscal year.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      confirmButtonText: 'Yes, Execute Year-End Close'
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/chartofaccounts/${retainedHead.id}`, {
          ...retainedHead,
          balance: retainedHead.balance + netIncome
        });
        toast.success(`Fiscal Year-End Closed! Net Income of Rs. ${netIncome.toLocaleString()} transferred to Equity.`);
        fetchAccounts();
      } catch (err) {
        toast.error('Failed to execute year-end closing.');
      }
    }
  };

  const handleDelete = useCallback(async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Delete Ledger Head?',
      text: `Remove "${name}" from General Ledger? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/chartofaccounts/${id}`);
        toast.success('Account head removed successfully.');
        fetchAccounts();
      } catch (err) {
        toast.error('Could not delete account head.');
      }
    }
  }, [fetchAccounts]);

  const filteredAccounts = useMemo(() => {
    if (categoryFilter === 'ALL') return accounts;
    return accounts.filter(a => a.type === categoryFilter);
  }, [accounts, categoryFilter]);

  const totalAssets = useMemo(() => accounts.filter(a => a.type === 'Asset').reduce((sum, a) => sum + (a.balance * (FX_RATES[a.currency || 'PKR'] || 1)), 0), [accounts]);
  const totalLiabilities = useMemo(() => accounts.filter(a => a.type === 'Liability').reduce((sum, a) => sum + (a.balance * (FX_RATES[a.currency || 'PKR'] || 1)), 0), [accounts]);
  const totalRevenue = useMemo(() => accounts.filter(a => a.type === 'Revenue').reduce((sum, a) => sum + (a.balance * (FX_RATES[a.currency || 'PKR'] || 1)), 0), [accounts]);
  
  const trialBalanceData = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;

    const list = accounts.map(a => {
      const pkrBalance = a.balance * (FX_RATES[a.currency || 'PKR'] || 1);
      // Accounting rules: Assets & Expenses have Debit-normal balances
      //                   Liabilities, Equity & Revenue have Credit-normal balances
      const isDebitType = a.type === 'Asset' || a.type === 'Expense';
      // If balance is negative for a debit-type account it goes on credit side (contra)
      // and vice versa — this handles contra accounts properly
      const debit  = isDebitType  && pkrBalance >= 0 ? pkrBalance
                   : !isDebitType && pkrBalance <  0 ? Math.abs(pkrBalance)
                   : 0;
      const credit = !isDebitType && pkrBalance >= 0 ? pkrBalance
                   : isDebitType  && pkrBalance <  0 ? Math.abs(pkrBalance)
                   : 0;

      totalDebit  += debit;
      totalCredit += credit;

      return { ...a, pkrBalance, debit, credit };
    });

    const diff = totalDebit - totalCredit;
    // If difference exists, it represents opening balance entries not yet posted as JVs.
    // We surface this as a transparent row so accountants can see what is unposted.
    const openingDiffRow = diff !== 0 ? [{
      id: '__ob_diff__',
      code: 'OBD',
      name: 'Opening Balance Difference (Unposted)',
      type: 'Equity',
      sub_category: 'Suspense — Post Opening JVs to clear',
      balance: Math.abs(diff),
      currency: 'PKR',
      is_active: true,
      pkrBalance: Math.abs(diff),
      debit:  diff < 0 ? Math.abs(diff) : 0,   // plug credit surplus into debit
      credit: diff > 0 ? Math.abs(diff) : 0,   // plug debit surplus into credit
    }] : [];

    // Recalculate totals including the plug row
    const finalDebit  = totalDebit  + (openingDiffRow[0]?.debit  || 0);
    const finalCredit = totalCredit + (openingDiffRow[0]?.credit || 0);
    const isBalanced  = Math.abs(finalDebit - finalCredit) < 1;

    return { list: [...list, ...openingDiffRow] as any[], totalDebit: finalDebit, totalCredit: finalCredit, isBalanced };
  }, [accounts]);

  const timelineEntries: JournalVoucherEntry[] = useMemo(() => {
    if (!timelineAccount) return [];
    try {
      const stored: any[] = JSON.parse(localStorage.getItem('posted_journal_vouchers') || '[]');
      return stored
        .filter(jv => jv.debit_account_id === timelineAccount.id || jv.credit_account_id === timelineAccount.id)
        .map(jv => ({
          id: jv.id,
          voucher_no: jv.voucher_no,
          date: jv.date,
          narrative: jv.narrative || '',
          debit: jv.debit_account_id === timelineAccount.id ? jv.amount : 0,
          credit: jv.credit_account_id === timelineAccount.id ? jv.amount : 0,
          running_balance: 0
        }));
    } catch {
      return [];
    }
  }, [timelineAccount]);

  const statsData: StatCardData[] = useMemo(() => [
    {
      title: 'Total General Ledger Heads',
      value: `${accounts.length} Heads`,
      icon: <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      theme: 'brand'
    },
    {
      title: 'Total Asset Portfolio (PKR)',
      value: `Rs. ${totalAssets.toLocaleString()}`,
      icon: <Building className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      theme: 'success'
    },
    {
      title: 'Total Liabilities & Payables',
      value: `Rs. ${totalLiabilities.toLocaleString()}`,
      icon: <Scale className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
      theme: 'error'
    },
    {
      title: 'Trial Balance Equation Status',
      value: trialBalanceData.isBalanced ? 'Balanced (Debits=Credits)' : 'Unbalanced Warning',
      icon: <ScaleIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      theme: trialBalanceData.isBalanced ? 'purple' : 'warning'
    }
  ], [accounts.length, totalAssets, totalLiabilities, trialBalanceData.isBalanced]);


  const exportTrialBalancePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229);
    doc.text('AUTOMATED TRIAL BALANCE AUDIT STATEMENT', 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [['Code #', 'Account Head Name', 'Category', 'Debit Balance (PKR)', 'Credit Balance (PKR)']],
      body: trialBalanceData.list.map(a => [
        a.code,
        a.name,
        a.type,
        a.debit > 0 ? `Rs. ${a.debit.toLocaleString()}` : '-',
        a.credit > 0 ? `Rs. ${a.credit.toLocaleString()}` : '-'
      ]),
      styles: { fontSize: 9 }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`TOTAL DEBITS: Rs. ${trialBalanceData.totalDebit.toLocaleString()}`, 14, finalY + 12);
    doc.text(`TOTAL CREDITS: Rs. ${trialBalanceData.totalCredit.toLocaleString()}`, 110, finalY + 12);

    doc.save(`Trial_Balance_Report.pdf`);
    toast.success('Trial Balance PDF Statement downloaded.');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('Chart of Accounts & General Ledger Audit Report', 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [['Code #', 'Account Head Name', 'Category', 'Sub-Category', 'Currency', 'Ledger Balance (Rs.)']],
      body: filteredAccounts.map(a => [
        a.code,
        a.name,
        a.type,
        a.sub_category || 'General',
        a.currency || 'PKR',
        `Rs. ${(a.balance * (FX_RATES[a.currency || 'PKR'] || 1)).toLocaleString()}`
      ]),
      styles: { fontSize: 9 }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`Total Assets: Rs. ${totalAssets.toLocaleString()}  |  Total Revenue: Rs. ${totalRevenue.toLocaleString()}`, 14, finalY + 12);

    doc.save(`chart_of_accounts_report.pdf`);
    toast.success('Chart of Accounts PDF downloaded.');
  };

  const exportCSV = () => {
    const headers = ['Code #', 'Account Head Name', 'Category', 'Sub-Category', 'Currency', 'Native Balance', 'PKR Equivalent'];
    const rows = filteredAccounts.map(a => [
      a.code,
      `"${a.name.replace(/"/g, '""')}"`,
      a.type,
      `"${(a.sub_category || 'General').replace(/"/g, '""')}"`,
      a.currency || 'PKR',
      a.balance,
      a.balance * (FX_RATES[a.currency || 'PKR'] || 1)
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `chart_of_accounts_report.csv`;
    link.click();
    toast.success('Chart of Accounts CSV downloaded.');
  };

  // Fixed Columns dependency array
  const columns = useMemo<ColumnDef<ChartOfAccountItem>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Code #',
        cell: (info) => (
          <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-xs bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded border border-indigo-200 dark:border-indigo-800">
            #{info.getValue() as string}
          </span>
        )
      },
      {
        accessorKey: 'name',
        header: 'Account Head Name & Hierarchy',
        cell: ({ row }) => {
          const item = row.original;
          const lvl = item.level || (item.parent_id ? 3 : 1);
          return (
            <div className={`flex items-center gap-2 ${lvl === 2 ? 'pl-4' : lvl === 3 ? 'pl-8' : ''}`}>
              {lvl === 1 ? (
                <span className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {item.name}
                </span>
              ) : lvl === 2 ? (
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <span className="text-gray-400">└─</span> 📁 {item.name}
                </span>
              ) : (
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <span className="text-gray-300 dark:text-gray-600">└──</span> 📄 {item.name}
                </span>
              )}
            </div>
          );
        }
      },
      {
        accessorKey: 'type',
        header: 'Category',
        cell: ({ row }) => getCategoryBadge(row.original.type)
      },
      {
        accessorKey: 'sub_category',
        header: 'Sub-Category & Level',
        cell: ({ row }) => {
          const item = row.original;
          const lvl = item.level || 1;
          return (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                {item.sub_category || 'General Ledger'}
              </span>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                lvl === 1 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                lvl === 2 ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' :
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
              }`}>
                Lvl {lvl} {lvl === 1 ? '• Main' : lvl === 2 ? '• Sub' : '• Sub-Ledger'}
              </span>
            </div>
          );
        }
      },
      {
        accessorKey: 'balance',
        header: 'Ledger Balance & Currency',
        cell: ({ row }) => {
          const item = row.original;
          const curr = item.currency || 'PKR';
          const rate = FX_RATES[curr] || 1;
          const pkrEquiv = item.balance * rate;

          return (
            <div>
              <p className="font-black text-gray-900 dark:text-white text-sm">
                {curr === 'USD' ? `$${item.balance.toLocaleString()}` : curr === 'SAR' ? `${item.balance.toLocaleString()} SAR` : `Rs. ${item.balance.toLocaleString()}`}
              </p>
              {curr !== 'PKR' && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                  ≈ Rs. {pkrEquiv.toLocaleString()} PKR (@{rate})
                </span>
              )}
            </div>
          );
        }
      },
      {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
          const item = row.original;
          const actionItems = [
            {
              label: 'View Sub-Ledger Audit Drawer',
              icon: <Eye className="w-4 h-4 text-indigo-500" />,
              onClick: () => {
                setTimelineAccount(item);
                setTimelineDrawerOpen(true);
              }
            },
            {
              label: 'Edit Account Head',
              icon: <Edit3 className="w-4 h-4 text-blue-500" />,
              onClick: () => handleOpenEdit(item)
            },
            {
              label: 'Delete Account Head',
              icon: <Trash2 className="w-4 h-4 text-rose-500" />,
              onClick: () => handleDelete(item.id, item.name)
            }
          ];

          return (
            <div className="flex justify-end">
              <ActionMenu items={actionItems} />
            </div>
          );
        }
      }
    ],
    [handleOpenEdit, handleDelete]
  );

  const table = useReactTable({
    data: filteredAccounts,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <div className="w-full max-w-full space-y-6">

      {/* Top Breadcrumb Navigation */}
      <Breadcrumb items={[
        { label: 'Finance & Accounts', href: '/finance' },
        { label: 'Chart of Accounts & General Ledger' }
      ]} />

      {/* Main Header Banner Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-500" />
              Chart of Accounts & General Ledger
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Structure double-entry accounting hierarchy, verify Trial Balance debits/credits, and execute Year-End closing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSeedDefaults}
              disabled={seedLoading}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all h-11 flex items-center gap-2 shadow-sm disabled:opacity-50"
              title="Seed Standard Master Restaurant Accounts"
            >
              {seedLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-emerald-200" />}
              <span>Seed Standard Accounts</span>
            </button>
            <button
              onClick={() => setTrialBalanceOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all h-11 flex items-center gap-2 shadow-sm"
            >
              <ScaleIcon className="w-4 h-4" />
              <span>Trial Balance</span>
            </button>
            <button
              onClick={handleYearEndClosing}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all h-11 flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span>Year-End Close</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all h-11 flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Ledger Head</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <StatCards stats={statsData} loading={loading} />

      {/* Main Datatable & Tree View Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden space-y-4 p-6">

        {/* Controls Bar: Search, View Mode Toggle & Category Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-80">
            <DebouncedSearch
              value={globalFilter}
              onChange={setGlobalFilter}
              placeholder="Search by code or account head name..."
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${viewMode === 'table' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Layers className="w-3.5 h-3.5" /> Datatable
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${viewMode === 'tree' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <FolderTree className="w-3.5 h-3.5" /> 🌲 Tree Hierarchy
              </button>
            </div>

            <div className="w-full sm:w-56">
              <SearchableSelect
                options={CATEGORY_OPTIONS}
                value={categoryFilter}
                onChange={(val) => setCategoryFilter(val as string)}
                placeholder="Filter by Category..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportPDF}
                className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
              >
                <FileDown className="w-4 h-4 text-rose-500" />
                <span>PDF</span>
              </button>
              <button
                onClick={exportCSV}
                className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'tree' ? (
          <div className="space-y-4 pt-2">
            {['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map(cat => {
              const catAccounts = accounts.filter(a => a.type === cat);
              const catTotal = catAccounts.reduce((sum, a) => sum + (a.balance * (FX_RATES[a.currency || 'PKR'] || 1)), 0);
              const isOpen = expandedTreeCategories[cat] ?? true;

              return (
                <div key={cat} className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                  <div
                    onClick={() => setExpandedTreeCategories({ ...expandedTreeCategories, [cat]: !isOpen })}
                    className="p-4 bg-slate-50 dark:bg-gray-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      <span className="font-extrabold text-gray-900 dark:text-white text-base flex items-center gap-2">
                        {getCategoryBadge(cat)} Category Group
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{catAccounts.length} Heads</span>
                      <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                        Total: Rs. {catTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="p-4 bg-white dark:bg-gray-900 space-y-3">
                      {catAccounts.length === 0 ? (
                        <p className="text-xs text-gray-400 italic py-2">No account heads registered under this category.</p>
                      ) : (
                        (() => {
                          const level1Accounts = catAccounts.filter(a => (a.level === 1 || !a.parent_id) && a.code.endsWith('000'));
                          const level2Accounts = catAccounts.filter(a => a.level === 2 || (a.code.endsWith('00') && !a.code.endsWith('000')));
                          const level3Accounts = catAccounts.filter(a => !level1Accounts.some(l1 => l1.id === a.id) && !level2Accounts.some(l2 => l2.id === a.id));

                          return (
                            <div className="space-y-3">
                              {level2Accounts.length > 0 ? (
                                level2Accounts.map(l2 => {
                                  const children = level3Accounts.filter(l3 => l3.parent_id === l2.id || l3.code.startsWith(l2.code.substring(0, 2)));
                                  const l2Total = children.reduce((sum, c) => sum + (c.balance * (FX_RATES[c.currency || 'PKR'] || 1)), l2.balance * (FX_RATES[l2.currency || 'PKR'] || 1));

                                  return (
                                    <div key={l2.id} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 overflow-hidden">
                                      <div className="p-3 bg-gray-100/70 dark:bg-gray-800/60 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                          <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                                            #{l2.code}
                                          </span>
                                          <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                                            📁 {l2.name}
                                          </span>
                                          <span className="text-[10px] font-bold text-purple-600 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 rounded">
                                            Sub-Group • {children.length} Ledgers
                                          </span>
                                        </div>
                                        <span className="font-bold text-xs text-gray-700 dark:text-gray-300">
                                          Rs. {l2Total.toLocaleString()}
                                        </span>
                                      </div>

                                      <div className="p-2 divide-y divide-gray-100 dark:divide-gray-800/50 bg-white dark:bg-gray-900">
                                        {children.length === 0 ? (
                                          <p className="text-[11px] text-gray-400 italic px-4 py-2">No operational ledgers under this sub-group.</p>
                                        ) : (
                                          children.map(acc => (
                                            <div key={acc.id} className="py-2 px-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/30 rounded-lg transition-colors pl-6">
                                              <div className="flex items-center gap-3">
                                                <span className="text-gray-300 dark:text-gray-600 text-xs">└──</span>
                                                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                                                  #{acc.code}
                                                </span>
                                                <div>
                                                  <p className="font-semibold text-gray-900 dark:text-white text-xs">{acc.name}</p>
                                                  <p className="text-[10px] text-gray-400">{acc.sub_category || 'General Ledger'}</p>
                                                </div>
                                              </div>

                                              <div className="flex items-center gap-4">
                                                <span className="font-bold text-gray-900 dark:text-white text-xs">
                                                  Rs. {(acc.balance * (FX_RATES[acc.currency || 'PKR'] || 1)).toLocaleString()}
                                                </span>
                                                <button
                                                  onClick={() => { setTimelineAccount(acc); setTimelineDrawerOpen(true); }}
                                                  className="p-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded transition"
                                                  title="View Sub-Ledger Audit Drawer"
                                                >
                                                  <Eye className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                catAccounts.map(acc => (
                                  <div key={acc.id} className="p-3 bg-gray-50/50 dark:bg-gray-800/40 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded border border-indigo-200 dark:border-indigo-800">
                                        #{acc.code}
                                      </span>
                                      <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{acc.name}</p>
                                        <p className="text-xs text-gray-400">{acc.sub_category || 'General Sub-Group'}</p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                      <span className="font-black text-gray-900 dark:text-white text-sm">
                                        Rs. {(acc.balance * (FX_RATES[acc.currency || 'PKR'] || 1)).toLocaleString()}
                                      </span>
                                      <button
                                        onClick={() => { setTimelineAccount(acc); setTimelineDrawerOpen(true); }}
                                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition"
                                        title="View Sub-Ledger Audit Drawer"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          );
                        })()
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[250px] rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="px-6 py-3.5 font-bold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 bg-white dark:bg-gray-900">
                {loading ? (
                  Array.from({ length: 5 }).map((_, rowIndex) => (
                    <tr key={`skeleton-${rowIndex}`} className="animate-pulse">
                      {columns.map((_, colIndex) => (
                        <td key={`skeleton-cell-${colIndex}`} className="px-6 py-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-400">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <p className="italic">No chart of account heads found for this restaurant branch.</p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleSeedDefaults}
                            disabled={seedLoading}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Seed Standard Master Restaurant Accounts</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div>
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
            {table.getFilteredRowModel().rows.length} account heads
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <div className="w-24">
                <SearchableSelect
                  options={[10, 20, 50, 100].map(s => ({ value: String(s), label: String(s) }))}
                  value={String(table.getState().pagination.pageSize)}
                  onChange={(val) => table.setPageSize(Number(val))}
                />
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-2 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-2 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Slide-Over Drawer for Adding/Editing Ledger Head */}
      <ProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={isEditing ? "Edit General Ledger Account Head" : "Create New Ledger Account Head"}
      >
        <form onSubmit={handleSave} className="space-y-5 p-2">
          <div>
            <Label required>Account Code #</Label>
            <InputField
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. 1001"
            />
          </div>

          <div>
            <Label required>Account Head Name</Label>
            <InputField
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Petty Cash / Bank Al-Habib Main"
            />
          </div>

          <div>
            <Label required>Account Category</Label>
            <SearchableSelect
              options={ACCOUNT_TYPES}
              value={formData.type}
              onChange={(val) => setFormData({ ...formData, type: val as string })}
            />
          </div>

          <div>
            <Label required>Account Base Currency</Label>
            <SearchableSelect
              options={CURRENCY_OPTIONS}
              value={formData.currency}
              onChange={(val) => setFormData({ ...formData, currency: val as string })}
            />
          </div>

          <div>
            <Label>Sub-Category / Account Sub-Group</Label>
            <InputField
              value={formData.sub_category}
              onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
              placeholder="e.g. Current Assets / Operating Expense"
            />
          </div>

          <div>
            <Label>Parent Account Head (Hierarchical Link)</Label>
            <SearchableSelect
              options={[
                { value: '', label: 'None (Root / Main Level 1 Head)' },
                ...accounts
                  .filter(a => a.id !== editingId)
                  .map(a => ({ value: a.id, label: `${a.code} - ${a.name} (${a.type})` }))
              ]}
              value={formData.parent_id || ''}
              onChange={(val) => setFormData({ ...formData, parent_id: val as string })}
              placeholder="Select Parent Account Head..."
            />
          </div>

          <div>
            <Label>Account Hierarchy Level</Label>
            <SearchableSelect
              options={LEVEL_OPTIONS}
              value={formData.level.toString()}
              onChange={(val) => setFormData({ ...formData, level: parseInt(val as string) || 1 })}
            />
          </div>

          <div>
            <Label>Opening Native Balance</Label>
            <InputField
              type="number"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
              placeholder="Enter opening balance"
            />
            {formData.currency !== 'PKR' && (
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                ≈ Rs. {(formData.balance * (FX_RATES[formData.currency] || 1)).toLocaleString()} PKR Equivalent
              </p>
            )}
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              {submitLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEditing ? "Update Account Head" : "Create Account Head"}</span>
            </button>
          </div>
        </form>
      </ProfileDrawer>

      {/* ⚖️ FEATURE 2: Modal for Automated Trial Balance Statement */}
      {trialBalanceOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ScaleIcon className="w-6 h-6 text-indigo-600" /> Real-Time Automated Trial Balance Statement
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Verification of Total Debits vs Total Credits across all general ledger accounts.</p>
              </div>
              <button onClick={() => setTrialBalanceOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex justify-between items-center bg-slate-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div>
                <span className="text-xs text-gray-500 uppercase font-bold block">Equation Status</span>
                <Badge variant="light" color={trialBalanceData.isBalanced ? 'success' : 'danger'}>
                  <span className="font-bold">{trialBalanceData.isBalanced ? '✅ EQUAL - TRIAL BALANCE BALANCED' : '❌ UNBALANCED WARNING'}</span>
                </Badge>
              </div>
              <div className="flex gap-4 text-right">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-bold block">Total Debits</span>
                  <span className="font-black text-indigo-600 text-base">Rs. {trialBalanceData.totalDebit.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-bold block">Total Credits</span>
                  <span className="font-black text-purple-600 text-base">Rs. {trialBalanceData.totalCredit.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="max-h-[350px] overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-gray-800 font-bold uppercase text-gray-600 dark:text-gray-300 sticky top-0">
                  <tr>
                    <th className="p-3">Code #</th>
                    <th className="p-3">Account Head Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3 text-right">Debit (PKR)</th>
                    <th className="p-3 text-right">Credit (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {trialBalanceData.list.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="p-3 font-mono font-bold text-indigo-600">#{a.code}</td>
                      <td className="p-3 font-bold text-gray-900 dark:text-white">{a.name}</td>
                      <td className="p-3">{getCategoryBadge(a.type)}</td>
                      <td className="p-3 text-right font-black text-emerald-600">{a.debit > 0 ? `Rs. ${a.debit.toLocaleString()}` : '-'}</td>
                      <td className="p-3 text-right font-black text-purple-600">{a.credit > 0 ? `Rs. ${a.credit.toLocaleString()}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setTrialBalanceOpen(false)} className="px-4 py-2 text-xs font-bold border rounded-xl">Close</button>
              <button onClick={exportTrialBalancePDF} className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl flex items-center gap-2">
                <FileDown className="w-4 h-4" /> Download Statement PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 FEATURE 4: Slide-Over Drawer for Sub-Ledger Transaction Timeline Audit */}
      <ProfileDrawer
        isOpen={timelineDrawerOpen}
        onClose={() => setTimelineDrawerOpen(false)}
        title={`Sub-Ledger Audit Drawer: ${timelineAccount?.name || ''}`}
      >
        {timelineAccount && (
          <div className="space-y-6 p-2">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">#{timelineAccount.code}</span>
                {getCategoryBadge(timelineAccount.type)}
              </div>
              <h4 className="text-lg font-black text-gray-900 dark:text-white">{timelineAccount.name}</h4>
              <p className="text-xs text-gray-500">Current Ledger Balance: <strong className="text-indigo-600">Rs. {(timelineAccount.balance * (FX_RATES[timelineAccount.currency || 'PKR'] || 1)).toLocaleString()} PKR</strong></p>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Posted Journal Vouchers Timeline</h5>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {timelineEntries.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800">
                    <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400">No Posted Journal Vouchers Yet</p>
                    <p className="text-[11px] text-gray-400 mt-1">Real-time sub-ledger posting audit logs will appear here when manual or automated journal vouchers are posted.</p>
                  </div>
                ) : (
                  timelineEntries.map(e => (
                    <div key={e.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/60 space-y-1 text-xs">
                      <div className="flex justify-between text-gray-400">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{e.voucher_no}</span>
                        <span>{e.date}</span>
                      </div>
                      <p className="font-bold text-gray-800 dark:text-white">{e.narrative}</p>
                      <div className="flex justify-between pt-1 font-semibold text-gray-600 dark:text-gray-300">
                        <span>Debit: <strong className="text-emerald-600">Rs. {e.debit.toLocaleString()}</strong></span>
                        <span>Credit: <strong className="text-purple-600">Rs. {e.credit.toLocaleString()}</strong></span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </ProfileDrawer>
    </div>
  );
}