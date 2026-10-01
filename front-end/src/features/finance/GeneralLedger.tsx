import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import { toast } from '../../components/ui/Toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { DebouncedSearch } from '../../components/form/DebouncedSearch';
import SearchableSelect, { SearchableSelectOption } from '../../components/form/select/SearchableSelect';
import Label from '../../components/form/Label';
import InputField from '../../components/form/input/InputField';
import DatePicker from '../../components/form/date-picker';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import Button from '../../components/ui/button/Button';
import { ChartOfAccountItem } from './ChartOfAccountsManager';
import {
  BookOpen, ArrowRightLeft, Loader2, FileDown, Download,
  ChevronLeft, ChevronRight, CheckCircle2, TrendingUp, TrendingDown,
  Eye, Plus, RefreshCw, Info, X
} from 'lucide-react';
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, getFilteredRowModel, flexRender,
  ColumnDef, SortingState
} from '@tanstack/react-table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Storage key (shared with ChartOfAccountsManager sub-ledger) ───
const getJvStorageKey = (tenantId: string) => `posted_journal_vouchers_${tenantId || 'default'}`;

interface JournalVoucher {
  id: string;
  voucher_no: string;
  date: string;
  debit_account_id: string;
  debit_account_name: string;
  debit_account_type: string;
  credit_account_id: string;
  credit_account_name: string;
  credit_account_type: string;
  narrative: string;
  amount: number;
  source: 'Manual JV' | 'Fee Collection' | 'Expense' | 'Salary' | 'Auto';
  posted_at: string;
}

const loadJvs = (tenantId: string): JournalVoucher[] => {
  try {
    const raw = localStorage.getItem(getJvStorageKey(tenantId));
    if (!raw) return [];
    return JSON.parse(raw) as JournalVoucher[];
  } catch { return []; }
};

const saveJvs = (tenantId: string, jvs: JournalVoucher[]) => {
  try {
    localStorage.setItem(getJvStorageKey(tenantId), JSON.stringify(jvs));
  } catch { /* ignore */ }
};

const SOURCE_OPTIONS: SearchableSelectOption[] = [
  { value: 'ALL', label: 'All Sources' },
  { value: 'Manual JV', label: '✏️ Manual Journal Vouchers' },
  { value: 'Fee Collection', label: '💰 Fee Collections' },
  { value: 'Expense', label: '📤 Expenses' },
  { value: 'Salary', label: '👔 Salary Payroll' },
];

// Proper double-entry balance rules
const applyDebit  = (acc: ChartOfAccountItem, amt: number) =>
  (acc.type === 'Asset' || acc.type === 'Expense') ? acc.balance + amt : acc.balance - amt;
const applyCredit = (acc: ChartOfAccountItem, amt: number) =>
  (acc.type === 'Liability' || acc.type === 'Equity' || acc.type === 'Revenue') ? acc.balance + amt : acc.balance - amt;

export default function GeneralLedger() {
  const tenantId = localStorage.getItem('tenantId') || '';

  const [searchParams] = useSearchParams();
  const [accounts, setAccounts]   = useState<ChartOfAccountItem[]>([]);
  const [allJvs, setAllJvs]       = useState<JournalVoucher[]>(() => loadJvs(tenantId));
  const [loading, setLoading]     = useState(true);

  // Filters
  const [globalFilter,  setGlobalFilter]  = useState('');
  const [sourceFilter,  setSourceFilter]  = useState('ALL');
  const [accountFilter, setAccountFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');

  // Drawers
  const [jvDrawerOpen,   setJvDrawerOpen]   = useState(false);
  const [submitLoading,  setSubmitLoading]  = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccountItem | null>(null);
  const [subLedgerOpen,   setSubLedgerOpen]   = useState(false);

  // JV Form
  const [jvForm, setJvForm] = useState({
    debitAccountId:  '',
    creditAccountId: '',
    narrative:       '',
    amount:          0,
    voucherDate:     new Date().toISOString().split('T')[0]
  });

  // Table
  const [sorting,    setSorting]    = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });

  // ── Fetch accounts & live General Ledger transactions from API ──────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let liveJvs: JournalVoucher[] = [];
      if (tenantId) {
        const [accRes, glRes] = await Promise.allSettled([
          api.get<ChartOfAccountItem[]>(`/chartofaccounts/tenant/${tenantId}`),
          api.get<any[]>(`/financereports/general-ledger`)
        ]);

        if (accRes.status === 'fulfilled') {
          setAccounts(accRes.value.data || []);
        }

        if (glRes.status === 'fulfilled' && Array.isArray(glRes.value.data)) {
          liveJvs = glRes.value.data.map(item => ({
            id: item.id || item.Id,
            voucher_no: item.voucherNo || item.VoucherNo || `JV-${Date.now()}`,
            date: (item.date || item.Date || '').split('T')[0],
            debit_account_id: item.debitAccountId || item.DebitAccountId || '',
            debit_account_name: item.debitAccountName || item.DebitAccountName || 'Debit Account',
            debit_account_type: item.debitAccountType || item.DebitAccountType || 'Asset',
            credit_account_id: item.creditAccountId || item.CreditAccountId || '',
            credit_account_name: item.creditAccountName || item.CreditAccountName || 'Credit Account',
            credit_account_type: item.creditAccountType || item.CreditAccountType || 'Revenue',
            narrative: item.narrative || item.Narrative || '',
            amount: Number(item.amount || item.Amount || 0),
            source: (item.source || item.Source || 'Auto') as any,
            posted_at: item.postedAt || item.PostedAt || new Date().toISOString()
          }));
        }
      }

      // Merge backend live JVs with local manual JVs (avoiding duplicate IDs)
      const manualJvs = loadJvs(tenantId);
      const combined = [...manualJvs.filter(m => !liveJvs.some(l => l.id === m.id)), ...liveJvs];
      combined.sort((a, b) => b.date.localeCompare(a.date));
      setAllJvs(combined);
    } catch {
      toast.error('Failed to load live ledger. Showing local postings.');
      setAllJvs(loadJvs(tenantId));
    } finally {
      setLoading(false);
    }
  }, [tenantId]);


  useEffect(() => { fetchData(); }, [fetchData]);

  // Deep linking: Handle URL query params
  useEffect(() => {
    if (searchParams.get('action') === 'new' || searchParams.get('action') === 'post-jv') {
      setJvDrawerOpen(true);
    }
    const acc = searchParams.get('account');
    if (acc) {
      setAccountFilter(acc);
    }
    const src = searchParams.get('source');
    if (src) {
      setSourceFilter(src);
    }
  }, [searchParams]);

  // ── Filtered JVs ─────────────────────────────────────────────
  const filteredJvs = useMemo(() => {
    let data = [...allJvs];
    if (sourceFilter  !== 'ALL') data = data.filter(j => j.source === sourceFilter);
    if (accountFilter !== 'ALL') data = data.filter(j => j.debit_account_id === accountFilter || j.credit_account_id === accountFilter);
    if (dateFrom)     data = data.filter(j => j.date >= dateFrom);
    if (dateTo)       data = data.filter(j => j.date <= dateTo);
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      data = data.filter(j =>
        j.voucher_no.toLowerCase().includes(q) ||
        j.narrative.toLowerCase().includes(q) ||
        j.debit_account_name.toLowerCase().includes(q) ||
        j.credit_account_name.toLowerCase().includes(q)
      );
    }
    return data;
  }, [allJvs, sourceFilter, accountFilter, dateFrom, dateTo, globalFilter]);

  const totalDebits  = useMemo(() => allJvs.reduce((s, j) => s + j.amount, 0), [allJvs]);
  const manualJvCount = allJvs.filter(j => j.source === 'Manual JV').length;

  const statsData: StatCardData[] = useMemo(() => [
    { title: 'Total Posted Vouchers',   value: `${allJvs.length} JVs`,              icon: <BookOpen    className="w-6 h-6 text-blue-600"   />, theme: 'brand'   },
    { title: 'Total Debit Movements',   value: `Rs. ${totalDebits.toLocaleString()}`, icon: <TrendingUp  className="w-6 h-6 text-emerald-600"/>, theme: 'success' },
    { title: 'Total Credit Movements',  value: `Rs. ${totalDebits.toLocaleString()}`, icon: <TrendingDown className="w-6 h-6 text-rose-600" />, theme: 'error'   },
    { title: 'Manual Journal Vouchers', value: `${manualJvCount} Posted`,            icon: <CheckCircle2 className="w-6 h-6 text-purple-600"/>, theme: 'purple'  }
  ], [allJvs.length, totalDebits, manualJvCount]);

  const subLedgerEntries = useMemo(() => {
    if (!selectedAccount) return [];
    return allJvs
      .filter(j => j.debit_account_id === selectedAccount.id || j.credit_account_id === selectedAccount.id)
      .map(j => ({
        ...j,
        dr: j.debit_account_id  === selectedAccount.id ? j.amount : 0,
        cr: j.credit_account_id === selectedAccount.id ? j.amount : 0
      }));
  }, [selectedAccount, allJvs]);

  // ── Post Journal Voucher ─────────────────────────────────────
  // CRITICAL FIX: Save JV to localStorage FIRST (source of truth for GL),
  // then try to update account balances via API.
  // If API fails, JV is still recorded and visible in General Ledger.
  const handlePostJournalVoucher = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jvForm.debitAccountId || !jvForm.creditAccountId) {
      toast.error('Select both Debit and Credit account heads.'); return;
    }
    if (jvForm.debitAccountId === jvForm.creditAccountId) {
      toast.error('Debit and Credit accounts must be different.'); return;
    }
    if (jvForm.amount <= 0) {
      toast.error('Enter a valid amount greater than 0.'); return;
    }
    if (!jvForm.voucherDate) {
      toast.error('Select a voucher date.'); return;
    }

    const debitAcc  = accounts.find(a => a.id === jvForm.debitAccountId);
    const creditAcc = accounts.find(a => a.id === jvForm.creditAccountId);
    if (!debitAcc || !creditAcc) {
      toast.error('Account not found. Reload accounts and try again.'); return;
    }

    setSubmitLoading(true);
    try {
      const newJv: JournalVoucher = {
        id:                   'jv-' + Date.now(),
        voucher_no:           `JV-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900)).padStart(3,'0')}`,
        date:                 jvForm.voucherDate,
        debit_account_id:     debitAcc.id,
        debit_account_name:   debitAcc.name,
        debit_account_type:   debitAcc.type,
        credit_account_id:    creditAcc.id,
        credit_account_name:  creditAcc.name,
        credit_account_type:  creditAcc.type,
        narrative:            jvForm.narrative.trim() || `Journal Posting: ${debitAcc.name} / ${creditAcc.name}`,
        amount:               Number(jvForm.amount),
        source:               'Manual JV',
        posted_at:            new Date().toISOString()
      };

      // ── Step 1: Save JV to localStorage IMMEDIATELY ──────────
      const existing = loadJvs(tenantId);
      const updated  = [newJv, ...existing];
      saveJvs(tenantId, updated);
      setAllJvs(updated);

      // ── Step 2: Update account balances via API (best-effort) ─
      let apiOk = true;
      try {
        await api.put(`/chartofaccounts/${debitAcc.id}`,  { ...debitAcc,  balance: applyDebit(debitAcc,   newJv.amount) });
        await api.put(`/chartofaccounts/${creditAcc.id}`, { ...creditAcc, balance: applyCredit(creditAcc, newJv.amount) });
      } catch {
        apiOk = false;
        toast.info('JV posted to Ledger. Account balance sync failed — refresh from API manually.');
      }

      if (apiOk) toast.success(`✅ Journal Voucher ${newJv.voucher_no} posted & balances updated!`);

      setJvDrawerOpen(false);
      setJvForm({ debitAccountId: '', creditAccountId: '', narrative: '', amount: 0, voucherDate: new Date().toISOString().split('T')[0] });

      // Reload accounts to show fresh balances
      if (apiOk) {
        try {
          const res = await api.get<ChartOfAccountItem[]>(`/chartofaccounts/tenant/${tenantId}`);
          setAccounts(res.data || []);
        } catch { /* silent */ }
      }

    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Exports ───────────────────────────────────────────────────
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14); doc.setTextColor(79, 70, 229);
    doc.text('GENERAL LEDGER — JOURNAL VOUCHERS REGISTER', 14, 15);
    doc.setFontSize(9); doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-PK')} | Entries: ${filteredJvs.length}`, 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [['Voucher No', 'Date', 'Debit Account', 'Credit Account', 'Narrative', 'Amount (Rs.)', 'Source']],
      body: filteredJvs.map(j => [j.voucher_no, j.date, j.debit_account_name, j.credit_account_name, j.narrative, j.amount.toLocaleString(), j.source]),
      styles: { fontSize: 7 }, headStyles: { fillColor: [79, 70, 229] }
    });
    doc.save('general-ledger.pdf');
    toast.success('PDF exported.');
  };

  const exportCSV = () => {
    const rows = [
      ['Voucher No','Date','Debit Account','Credit Account','Narrative','Amount','Source'],
      ...filteredJvs.map(j => [j.voucher_no,j.date,j.debit_account_name,j.credit_account_name,j.narrative,j.amount,j.source])
    ];
    const blob = new Blob([rows.map(r=>r.join(',')).join('\n')], { type:'text/csv' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download:'general-ledger.csv' });
    a.click();
    toast.success('CSV exported.');
  };

  // ── Table Columns ─────────────────────────────────────────────
  const columns: ColumnDef<JournalVoucher>[] = [
    {
      header: 'Voucher No', accessorKey: 'voucher_no',
      cell: ({ getValue }) => <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{getValue() as string}</span>
    },
    {
      header: 'Date', accessorKey: 'date',
      cell: ({ getValue }) => <span className="text-xs text-gray-600 dark:text-gray-400">{getValue() as string}</span>
    },
    {
      header: 'Debit Account', accessorKey: 'debit_account_name',
      cell: ({ row }) => (
        <div>
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{row.original.debit_account_name}</p>
          <p className="text-[10px] text-gray-400">{row.original.debit_account_type}</p>
        </div>
      )
    },
    {
      header: 'Credit Account', accessorKey: 'credit_account_name',
      cell: ({ row }) => (
        <div>
          <p className="text-xs font-semibold text-purple-700 dark:text-purple-400">{row.original.credit_account_name}</p>
          <p className="text-[10px] text-gray-400">{row.original.credit_account_type}</p>
        </div>
      )
    },
    {
      header: 'Narrative', accessorKey: 'narrative',
      cell: ({ getValue }) => <span className="text-xs text-gray-600 dark:text-gray-400 max-w-[200px] truncate block">{getValue() as string}</span>
    },
    {
      header: 'Amount (Rs.)', accessorKey: 'amount',
      cell: ({ getValue }) => <span className="text-sm font-black text-gray-900 dark:text-white">Rs. {(getValue() as number).toLocaleString()}</span>
    },
    {
      header: 'Source', accessorKey: 'source',
      cell: ({ getValue }) => {
        const src = getValue() as string;
        const cls: Record<string,string> = {
          'Manual JV':    'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
          'Fee Collection':'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
          'Expense':      'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
          'Salary':       'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
        };
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cls[src] || 'bg-gray-100 text-gray-700'}`}>{src}</span>;
      }
    },
    {
      id: 'actions', header: 'Sub-Ledger',
      cell: ({ row }) => {
        const jv = row.original;
        return (
          <ActionMenu items={[
            {
              label: `View Sub-Ledger: ${jv.debit_account_name}`,
              icon: <Eye className="w-4 h-4 text-emerald-500" />,
              onClick: () => {
                const acc = accounts.find(a => a.id === jv.debit_account_id);
                if (acc) { setSelectedAccount(acc); setSubLedgerOpen(true); }
                else toast.info('Reload accounts to view sub-ledger.');
              }
            },
            {
              label: `View Sub-Ledger: ${jv.credit_account_name}`,
              icon: <Eye className="w-4 h-4 text-purple-500" />,
              onClick: () => {
                const acc = accounts.find(a => a.id === jv.credit_account_id);
                if (acc) { setSelectedAccount(acc); setSubLedgerOpen(true); }
                else toast.info('Reload accounts to view sub-ledger.');
              }
            }
          ]} />
        );
      }
    }
  ];

  const table = useReactTable({
    data: filteredJvs, columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const accountOptions: SearchableSelectOption[] = [
    { value: 'ALL', label: 'All Accounts' },
    ...accounts.map(a => ({ value: a.id, label: `#${a.code} - ${a.name} (${a.type})` }))
  ];

  return (
    <div className="p-4 md:p-6 space-y-5">
      <Breadcrumb items={[{ label: 'Finance & Accounts', href: '/FeeChallans' }, { label: 'General Ledger' }]} />

      {/* Header */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-500" />
              General Ledger — Double-Entry Journal Register
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Post Manual JVs, view all vouchers, and drill into per-account sub-ledger entries.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={fetchData} className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-xl h-11 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button onClick={() => setJvDrawerOpen(true)} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-11 flex items-center gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Post Manual JV
            </button>
            <button onClick={exportPDF} className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl h-11 flex items-center gap-2 shadow-sm">
              <FileDown className="w-4 h-4" /> PDF
            </button>
            <button onClick={exportCSV} className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl h-11 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Download className="w-4 h-4" /> CSV
            </button>
          </div>
        </div>
      </div>

      <StatCards stats={statsData} loading={loading} />

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3 flex-wrap">
          <div className="w-full lg:w-72">
            <DebouncedSearch value={globalFilter} onChange={setGlobalFilter} placeholder="Search voucher, narrative, account name..." />
          </div>
          <div className="w-full sm:w-52">
            <SearchableSelect options={SOURCE_OPTIONS} value={sourceFilter} onChange={v => setSourceFilter(v as string)} placeholder="Filter by Source..." />
          </div>
          <div className="w-full sm:w-64">
            <SearchableSelect options={accountOptions} value={accountFilter} onChange={v => setAccountFilter(v as string)} placeholder="Filter by Account..." />
          </div>
          <div className="flex gap-2 items-end flex-wrap">
            <div className="w-44">
              <Label>From Date</Label>
              <DatePicker value={dateFrom} onChange={(e: any) => setDateFrom(e?.target?.value ?? '')} />
            </div>
            <span className="text-xs text-gray-400 mb-2.5">to</span>
            <div className="w-44">
              <Label>To Date</Label>
              <DatePicker value={dateTo} onChange={(e: any) => setDateTo(e?.target?.value ?? '')} />
            </div>
            {(dateFrom || dateTo || sourceFilter !== 'ALL' || accountFilter !== 'ALL' || globalFilter) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); setSourceFilter('ALL'); setAccountFilter('ALL'); setGlobalFilter(''); }}
                className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 mb-0.5 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[250px] rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id} className="border-b border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/60">
                  {hg.headers.map(h => (
                    <th key={h.id} onClick={h.column.getToggleSortingHandler()} className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none whitespace-nowrap">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getIsSorted() ? (h.column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ''}
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
                      <td key={`skeleton-cell-${colIndex}`} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : allJvs.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16 text-center text-sm text-gray-400">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <BookOpen className="w-14 h-14 text-gray-300 dark:text-gray-700" />
                      <p className="text-base font-bold text-gray-500 dark:text-gray-400">No Journal Vouchers Posted Yet</p>
                      <p className="text-xs text-gray-400 text-center max-w-sm">
                        Click <strong>"Post Manual JV"</strong> above to record your first double-entry journal voucher.
                      </p>
                      <button onClick={() => setJvDrawerOpen(true)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Post First Journal Voucher
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredJvs.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <p className="font-semibold text-gray-600 dark:text-gray-300">No vouchers match the active filters</p>
                      <p className="text-xs text-gray-400">Try adjusting your date range, source, or account selection.</p>
                      <button
                        onClick={() => { setDateFrom(''); setDateTo(''); setSourceFilter('ALL'); setAccountFilter('ALL'); setGlobalFilter(''); }}
                        className="mt-2 px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, idx) => (
                  <tr key={row.id} className={`hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/40 dark:bg-gray-800/20'}`}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3 whitespace-nowrap">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredJvs.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredJvs.length)} of {filteredJvs.length}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Rows:</span>
                <div className="w-20">
                  <SearchableSelect options={[10,15,25,50].map(s=>({value:String(s),label:String(s)}))} value={String(table.getState().pagination.pageSize)} onChange={v=>table.setPageSize(Number(v))} />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={()=>table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 px-2">Page {table.getState().pagination.pageIndex+1} / {table.getPageCount()}</span>
                <button onClick={()=>table.nextPage()} disabled={!table.getCanNextPage()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sub-Ledger Drawer */}
      <ProfileDrawer isOpen={subLedgerOpen} onClose={() => { setSubLedgerOpen(false); setSelectedAccount(null); }} title={selectedAccount ? `Sub-Ledger: ${selectedAccount.name}` : ''}>
        {selectedAccount && (
          <div className="space-y-4 p-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <p className="text-xs text-gray-500">Account Code / Type</p>
              <p className="font-bold text-indigo-700 dark:text-indigo-300">#{selectedAccount.code} — {selectedAccount.type}</p>
              <p className="text-xs text-gray-500 mt-2">Current Ledger Balance</p>
              <p className="font-black text-gray-900 dark:text-white text-xl">Rs. {selectedAccount.balance.toLocaleString()}</p>
            </div>
            <h5 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Journal Voucher Entries</h5>
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {subLedgerEntries.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No journal entries for this account yet.</p>
                </div>
              ) : subLedgerEntries.map(e => (
                <div key={e.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{e.voucher_no}</span>
                    <span className="text-gray-400">{e.date}</span>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-white">{e.narrative}</p>
                  <div className="flex justify-between pt-1">
                    {e.dr > 0 && <span className="font-bold text-emerald-600">Dr: Rs. {e.dr.toLocaleString()}</span>}
                    {e.cr > 0 && <span className="font-bold text-purple-600">Cr: Rs. {e.cr.toLocaleString()}</span>}
                    <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{e.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ProfileDrawer>

      {/* Post Manual JV Drawer */}
      <ProfileDrawer isOpen={jvDrawerOpen} onClose={() => setJvDrawerOpen(false)} title="Post Manual Journal Voucher">
        <div className="p-4 space-y-5">
          <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <ArrowRightLeft className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              Every Debit must have an equal Credit. Example: Debit "Bank" → Credit "Fee Revenue" to record fee collection.
            </p>
          </div>

          {accounts.length === 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
              ⚠️ No account heads loaded. Go to <strong>Chart of Accounts</strong> to add accounts first. JVs can still be posted but balance updates won't sync.
            </div>
          )}

          <form onSubmit={handlePostJournalVoucher} className="space-y-4">
            <div>
              <Label required>Debit Account (Dr)</Label>
              <SearchableSelect
                options={accounts
                  .sort((a, b) => (a.code || '').localeCompare(b.code || ''))
                  .map(a => ({
                    value: a.id,
                    label: `${a.level === 1 ? '👑 ' : a.level === 2 ? '📁 ' : '📄 '}#${a.code} — ${a.name} (${a.type}${a.level ? ` • Lvl ${a.level}` : ''})`
                  }))}
                value={jvForm.debitAccountId}
                onChange={val => setJvForm(prev => ({ ...prev, debitAccountId: val as string }))}
                placeholder="Select account to debit..."
              />
            </div>
            <div>
              <Label required>Credit Account (Cr)</Label>
              <SearchableSelect
                options={accounts
                  .sort((a, b) => (a.code || '').localeCompare(b.code || ''))
                  .map(a => ({
                    value: a.id,
                    label: `${a.level === 1 ? '👑 ' : a.level === 2 ? '📁 ' : '📄 '}#${a.code} — ${a.name} (${a.type}${a.level ? ` • Lvl ${a.level}` : ''})`
                  }))}
                value={jvForm.creditAccountId}
                onChange={val => setJvForm(prev => ({ ...prev, creditAccountId: val as string }))}
                placeholder="Select account to credit..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Voucher Date</Label>
                <DatePicker
                  value={jvForm.voucherDate}
                  onChange={(e: any) => setJvForm(prev => ({ ...prev, voucherDate: e?.target?.value ?? prev.voucherDate }))}
                />
              </div>
              <div>
                <Label required>Amount (PKR)</Label>
                <InputField
                  type="number"
                  value={jvForm.amount}
                  onChange={e => setJvForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <Label>Narrative / Description</Label>
              <InputField
                value={jvForm.narrative}
                onChange={e => setJvForm(prev => ({ ...prev, narrative: e.target.value }))}
                placeholder="e.g. Monthly fee collection — May 2025"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button type="button" variant="outline" onClick={() => setJvDrawerOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" loading={submitLoading} loadingText="Posting...">
                Post Journal Voucher
              </Button>
            </div>
          </form>
        </div>
      </ProfileDrawer>
    </div>
  );
}
