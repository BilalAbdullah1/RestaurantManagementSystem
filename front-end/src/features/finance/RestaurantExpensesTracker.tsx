import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Badge from '../../components/ui/badge/Badge';
import InputField from '../../components/form/input/InputField';
import DatePicker from '../../components/form/date-picker';
import SearchableSelect, { SearchableSelectOption } from '../../components/form/select/SearchableSelect';
import { DebouncedSearch } from '../../components/form/DebouncedSearch';
import Label from '../../components/form/Label';
import ImageUpload from '../../components/form/ImageUpload';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import { toast } from '../../components/ui/Toast';
import { activeClientConfig } from '../../config/clientConfig';
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
  DollarSign, TrendingDown, Tag, Plus, Edit3, Trash2, Calendar,
  Search, FileDown, Download, Loader2, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle,
  Receipt, FileText, Zap, Wrench, Sparkles, Building2, Truck, ShoppingCart, CreditCard,
  ShieldCheck, ShieldAlert, Sliders, Vault, ArrowUpRight, Check, X
} from 'lucide-react';
import Button from '../../components/ui/button/Button';

export const EXPENSE_CATEGORIES = [
  'Raw Food & Kitchen Ingredients',
  'Meat, Poultry & Seafood',
  'Dairy, Bakery & Groceries',
  'Beverages & Bar Supplies',
  'Commercial LPG Gas & Utilities',
  'Kitchen Equipment Maintenance',
  'Packaging & Delivery Boxes',
  'Staff Meals & Uniforms',
  'Marketing & Food Promos',
  'Miscellaneous / Petty Cash'
];

export const PAYMENT_METHODS = [
  'POS Cash Drawer Float',
  'Bank Cheque',
  'Direct Bank Transfer (1Link)',
  'Restaurant Corporate Card'
];

interface RestaurantExpense {
  id: string;
  tenant_id: string;
  account_id?: string;
  category: string;
  title: string;
  amount: number;
  expense_date: string;
  description: string;
  paid_to?: string;
  payment_method?: string;
  receipt_no?: string;
  receipt_image_url?: string;
  approval_status?: 'Approved' | 'Pending Approval' | 'Rejected';
  recorded_by_user_id?: string;
  created_at?: string;
}

const DEFAULT_BUDGET_CAPS: Record<string, number> = {
  'Utilities (Electricity, Water, Gas)': 150000,
  'Maintenance & Repairs': 100000,
  'Events & Celebrations': 80000,
  'Salaries & Stipends': 500000,
  'Marketing & Advertising': 60000,
  'Stationery & Office Supplies': 50000,
  'Fuel & Transport Logistics': 120000,
  'Miscellaneous / Petty Cash': 40000
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const MONTH_OPTIONS: SearchableSelectOption[] = MONTHS.map((m, idx) => ({
  value: (idx + 1).toString(),
  label: m
}));

const currentSysYear = new Date().getFullYear();
const YEAR_OPTIONS: SearchableSelectOption[] = [
  { value: (currentSysYear - 2).toString(), label: (currentSysYear - 2).toString() },
  { value: (currentSysYear - 1).toString(), label: (currentSysYear - 1).toString() },
  { value: currentSysYear.toString(), label: currentSysYear.toString() },
  { value: (currentSysYear + 1).toString(), label: (currentSysYear + 1).toString() }
];

export default function RestaurantExpensesTracker() {
  const tenantId = localStorage.getItem("tenantId") || "";

  const [expenses, setExpenses] = useState<RestaurantExpense[]>([]);
  const [chartAccounts, setChartAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterMonth, setFilterMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('ALL');

  // Budget Caps State
  const [budgetCaps, setBudgetCaps] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem("restaurant_expense_budget_caps") || "null") || DEFAULT_BUDGET_CAPS;
    } catch {
      return DEFAULT_BUDGET_CAPS;
    }
  });
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  // Petty Cash Vault State
  const [vaultOpeningBalance, setVaultOpeningBalance] = useState<number>(() => {
    try {
      return Number(localStorage.getItem("petty_cash_vault_opening") || "0");
    } catch { return 0; }
  });
  const [vaultTopUps, setVaultTopUps] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("petty_cash_vault_topups") || "[]");
    } catch { return []; }
  });
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [topUpAmountInput, setTopUpAmountInput] = useState('');

  // Table States
  const [searchParams] = useSearchParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const initialForm: Partial<RestaurantExpense> = {
    tenant_id: tenantId,
    account_id: '',
    category: EXPENSE_CATEGORIES[0],
    title: '',
    paid_to: '',
    amount: 0,
    expense_date: new Date().toISOString().split('T')[0],
    description: '',
    payment_method: PAYMENT_METHODS[0],
    receipt_no: '',
    receipt_image_url: '',
    approval_status: 'Approved'
  };
  const [formData, setFormData] = useState<any>(initialForm);

  const coaMap = useMemo(() => {
    const map: Record<string, string> = {};
    chartAccounts.forEach(a => { map[a.id] = `${a.code} - ${a.name}`; });
    return map;
  }, [chartAccounts]);

  const fetchExpenses = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [res, coaRes] = await Promise.all([
        api.get<RestaurantExpense[]>(`/RestaurantExpenses/tenant/${tenantId}?month=${filterMonth}&year=${filterYear}`),
        api.get<any[]>(`/chartofaccounts/tenant/${tenantId}`).catch(() => ({ data: [] }))
      ]);
      const list = (res.data || []).map((e: any) => ({
        ...e,
        approval_status: e.approval_status || (e.amount > 50000 ? 'Pending Approval' : 'Approved')
      }));
      setExpenses(list);
      setChartAccounts(coaRes.data || []);
    } catch (err) {
      toast.error('Failed to load Restaurant Expenses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [tenantId, filterMonth, filterYear]);

  // Deep linking: Auto-open expense drawer if ?action=new in URL
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsEditing(false);
      setFormData(initialForm);
      setDrawerOpen(true);
    }
    const cat = searchParams.get('category');
    if (cat) {
      setFilterCategory(cat);
    }
  }, [searchParams]);

  // Save budget caps changes
  const saveBudgetCaps = (newCaps: Record<string, number>) => {
    setBudgetCaps(newCaps);
    localStorage.setItem("restaurant_expense_budget_caps", JSON.stringify(newCaps));
    toast.success('Category budget caps updated.');
    setBudgetModalOpen(false);
  };

  // Add Petty Cash Top up
  const handleAddTopUp = () => {
    const amt = Number(topUpAmountInput);
    if (amt <= 0) {
      toast.error('Enter valid top-up amount');
      return;
    }
    const updated = [...vaultTopUps, amt];
    setVaultTopUps(updated);
    localStorage.setItem("petty_cash_vault_topups", JSON.stringify(updated));
    toast.success(`Rs. ${amt.toLocaleString()} added to Petty Cash Vault!`);
    setTopUpAmountInput('');
    setTopUpModalOpen(false);
  };

  // Reset / Clear Petty Cash Vault Top-Ups
  const handleResetTopUps = () => {
    setVaultTopUps([]);
    setVaultOpeningBalance(0);
    localStorage.removeItem("petty_cash_vault_topups");
    localStorage.removeItem("petty_cash_vault_opening");
    toast.success("Petty cash vault top-ups and balance cleared.");
    setTopUpModalOpen(false);
  };

  // Filtered Expenses List
  const filteredExpenses = useMemo(() => {
    let result = expenses;
    if (filterCategory !== 'ALL') {
      result = result.filter(e => e.category === filterCategory);
    }
    if (filterPaymentMethod !== 'ALL') {
      result = result.filter(e => (e.payment_method || 'Petty Cash Vault') === filterPaymentMethod);
    }
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      result = result.filter(e =>
        (e.title || '').toLowerCase().includes(q) ||
        (e.paid_to || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q) ||
        (e.receipt_no || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [expenses, filterCategory, filterPaymentMethod, globalFilter]);

  // Calculations
  const stats = useMemo(() => {
    let total = 0;
    const categoryBreakdown: Record<string, number> = {};

    expenses.forEach(e => {
      if (e.approval_status !== 'Rejected') {
        total += Number(e.amount || 0);
        categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + Number(e.amount || 0);
      }
    });

    let topCategory = "N/A";
    let topCategoryAmount = 0;
    Object.entries(categoryBreakdown).forEach(([cat, amt]) => {
      if (amt > topCategoryAmount) {
        topCategoryAmount = amt;
        topCategory = cat;
      }
    });

    // Petty Cash Vault Available Balance
    const pettyCashDisbursed = expenses
      .filter(e => e.payment_method === 'Petty Cash Vault' && e.approval_status !== 'Rejected')
      .reduce((sum, curr) => sum + Number(curr.amount || 0), 0);
    const totalTopUpsSum = vaultTopUps.reduce((sum, curr) => sum + curr, 0);
    const vaultAvailableCash = vaultOpeningBalance + totalTopUpsSum - pettyCashDisbursed;

    const pendingApprovalsCount = expenses.filter(e => e.approval_status === 'Pending Approval').length;

    return { total, topCategory, topCategoryAmount, categoryBreakdown, vaultAvailableCash, pendingApprovalsCount };
  }, [expenses, vaultOpeningBalance, vaultTopUps]);

  const statsData: StatCardData[] = useMemo(() => [
    {
      title: `Total Expense (${MONTHS[parseInt(filterMonth) - 1]} ${filterYear})`,
      value: `Rs. ${stats.total.toLocaleString()}`,
      icon: <TrendingDown className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
      theme: 'error'
    },
    {
      title: 'Petty Cash Vault Available',
      value: `Rs. ${stats.vaultAvailableCash.toLocaleString()}`,
      icon: <Vault className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      theme: 'success'
    },
    {
      title: 'Pending High-Value Approvals (>50k)',
      value: `${stats.pendingApprovalsCount} Vouchers`,
      icon: <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      theme: 'warning'
    },
    {
      title: 'Total Expense Vouchers',
      value: `${expenses.length} Records`,
      icon: <Tag className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      theme: 'brand'
    }
  ], [stats, expenses.length, filterMonth, filterYear]);

  const handleAddNew = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setDrawerOpen(true);
  };

  const handleEdit = (record: RestaurantExpense) => {
    setFormData({
      ...record,
      expense_date: record.expense_date.split('T')[0]
    });
    setIsEditing(true);
    setDrawerOpen(true);
  };

  const handleApprovalAction = async (record: RestaurantExpense, newStatus: 'Approved' | 'Rejected') => {
    try {
      const updated = { ...record, approval_status: newStatus };
      await api.put(`/RestaurantExpenses/${record.id}`, updated);
      if (newStatus === 'Approved') {
        toast.success(`Disbursement of Rs. ${record.amount.toLocaleString()} APPROVED by Principal.`);
      } else {
        toast.error(`Disbursement voucher for "${record.title}" REJECTED.`);
      }
      fetchExpenses();
    } catch (err) {
      toast.error('Failed to update approval status.');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: 'Delete Expense Record?',
      text: `Are you sure you want to delete "${title}"? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete Expense'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/RestaurantExpenses/${id}`);
        toast.success('Expense record deleted successfully.');
        fetchExpenses();
      } catch (err) {
        toast.error('Failed to delete expense record.');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      toast.error('Expense amount must be greater than zero.');
      return;
    }

    // Check Petty Cash Vault limit
    if (formData.payment_method === 'Petty Cash Vault' && formData.amount > stats.vaultAvailableCash && !isEditing) {
      toast.error(`Insufficient Cash in Vault! Available cash: Rs. ${stats.vaultAvailableCash.toLocaleString()}`);
      return;
    }

    // Budget Cap warning check
    const currentCategorySpent = stats.categoryBreakdown[formData.category] || 0;
    const categoryCap = budgetCaps[formData.category] || 100000;
    if (currentCategorySpent + formData.amount > categoryCap) {
      toast.warning(`⚠️ OVER BUDGET ALERT! This expense pushes "${formData.category}" past its monthly budget cap of Rs. ${categoryCap.toLocaleString()}.`);
    }

    // Automatic approval status assignment
    const assignedStatus = formData.amount > 50000 ? 'Pending Approval' : 'Approved';
    const payload = {
      ...formData,
      approval_status: isEditing ? formData.approval_status : assignedStatus
    };

    setSubmitLoading(true);
    try {
      if (isEditing) {
        await api.put(`/RestaurantExpenses/${formData.id}`, payload);
        toast.success('Expense record updated successfully.');
      } else {
        await api.post('/RestaurantExpenses', { ...payload, recorded_by_user_id: localStorage.getItem("userId") });
        if (assignedStatus === 'Pending Approval') {
          toast.warning(`High-Value Expense (> Rs. 50,000) recorded! Status set to PENDING PRINCIPAL APPROVAL.`);
        } else {
          toast.success('New expense voucher recorded successfully.');
        }
      }
      setDrawerOpen(false);
      fetchExpenses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save expense record.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Download Single Expense Voucher PDF
  const downloadExpenseVoucherPDF = (expense: RestaurantExpense) => {
    const doc = new jsPDF();
    const isPending = expense.approval_status === 'Pending Approval';
    const restaurantName = (localStorage.getItem('restaurantName') || activeClientConfig.branding.restaurantName).toUpperCase();

    // Watermark if Pending Approval
    if (isPending) {
      doc.setTextColor(254, 243, 199);
      doc.setFontSize(60);
      doc.setFont('helvetica', 'bold');
      doc.text('PENDING APPROVAL', 20, 150, { angle: 45 });
    }

    doc.setFillColor(225, 29, 72); // rose-600
    doc.rect(14, 15, 182, 25, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(restaurantName, 105, 26, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL PAYMENT DISBURSEMENT VOUCHER', 105, 34, { align: 'center' });

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text(`Voucher ID: EXP-${expense.id.substring(0, 8).toUpperCase()}`, 16, 50);
    doc.text(`Disbursement Date: ${new Date(expense.expense_date).toLocaleDateString('en-GB')}`, 16, 59);
    doc.text(`Expense Category: ${expense.category}`, 16, 68);

    doc.text(`Payment Source: ${expense.payment_method || 'Petty Cash Vault'}`, 120, 50);
    doc.text(`Paid / Beneficiary: ${expense.paid_to || 'Vendor Record'}`, 120, 59);
    doc.text(`Approval Status: ${(expense.approval_status || 'Approved').toUpperCase()}`, 120, 68);

    autoTable(doc, {
      startY: 76,
      margin: { left: 16, right: 16 },
      theme: 'grid',
      head: [['Particulars / Description', 'Vendor / Recipient', 'Category', 'Disbursed Amount']],
      body: [
        [
          expense.title + (expense.description ? `\nNote: ${expense.description}` : ''),
          expense.paid_to || 'N/A',
          expense.category,
          `Rs. ${Number(expense.amount).toLocaleString()}`
        ]
      ],
      headStyles: { fillColor: [225, 29, 72], textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 120;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Disbursed: Rs. ${Number(expense.amount).toLocaleString()}`, 135, finalY + 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // 3 Signature Lines (Accountant, Vendor/Receiver, Principal)
    doc.line(16, finalY + 45, 60, finalY + 45);
    doc.text('Accountant Signature', 18, finalY + 52);

    doc.line(78, finalY + 45, 122, finalY + 45);
    doc.text('Vendor / Receiver Sign', 80, finalY + 52);

    doc.line(140, finalY + 45, 184, finalY + 45);
    doc.text(isPending ? 'Principal (PENDING)' : 'Principal Approval Sign', 140, finalY + 52);

    doc.save(`Expense_Voucher_${expense.title.replace(/\s+/g, '_')}.pdf`);
    toast.success('Disbursement voucher PDF generated.');
  };

  // Export PDF Summary Report
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(225, 29, 72);
    doc.text(`Restaurant Expenses Audit Report - ${MONTHS[parseInt(filterMonth) - 1]} ${filterYear}`, 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [['Title / Particulars', 'Category', 'Expense Date', 'Payment Mode', 'Status', 'Amount (Rs.)']],
      body: filteredExpenses.map(e => [
        e.title,
        e.category,
        new Date(e.expense_date).toLocaleDateString('en-GB'),
        e.payment_method || 'Petty Cash',
        e.approval_status || 'Approved',
        `Rs. ${Number(e.amount).toLocaleString()}`
      ]),
      styles: { fontSize: 9 }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`Grand Total Expense: Rs. ${stats.total.toLocaleString()}`, 14, finalY + 12);

    doc.save(`restaurant_expenses_${filterMonth}_${filterYear}.pdf`);
    toast.success('Restaurant Expenses PDF downloaded.');
  };

  // Export CSV Summary Report
  const exportCSV = () => {
    const headers = ['Title', 'Category', 'Expense Date', 'Payment Mode', 'Approval Status', 'Amount (PKR)', 'Description'];
    const rows = filteredExpenses.map(e => [
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.category.replace(/"/g, '""')}"`,
      e.expense_date,
      `"${(e.payment_method || 'Petty Cash').replace(/"/g, '""')}"`,
      e.approval_status || 'Approved',
      e.amount,
      `"${(e.description || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `restaurant_expenses_${filterMonth}_${filterYear}.csv`;
    link.click();
    toast.success('Restaurant Expenses CSV downloaded.');
  };

  // Category Icon Helper
  const getCategoryBadge = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('utility')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Zap className="w-3.5 h-3.5 text-amber-600" /> Utilities
        </span>
      );
    }
    if (cat.includes('maintenance')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <Wrench className="w-3.5 h-3.5 text-blue-600" /> Maintenance
        </span>
      );
    }
    if (cat.includes('event')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Events
        </span>
      );
    }
    if (cat.includes('salaries')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Salaries
        </span>
      );
    }
    if (cat.includes('transport') || cat.includes('fuel')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
          <Truck className="w-3.5 h-3.5 text-orange-600" /> Transport
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
        <ShoppingCart className="w-3.5 h-3.5 text-gray-500" /> {category.split(' ')[0]}
      </span>
    );
  };

  const columns = useMemo<ColumnDef<RestaurantExpense>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Particulars & Vendor',
        cell: ({ row }) => (
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{row.original.title}</p>
            {row.original.paid_to && (
              <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">Paid To: {row.original.paid_to}</p>
            )}
            {row.original.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{row.original.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              {row.original.receipt_no && (
                <span className="text-[10px] font-mono text-gray-400">Ref #: {row.original.receipt_no}</span>
              )}
              {row.original.receipt_image_url && (
                <a
                  href={row.original.receipt_image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-700 flex items-center gap-0.5"
                >
                  <Receipt className="w-3 h-3" /> View Attachment Slip
                </a>
              )}
            </div>
          </div>
        )
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => getCategoryBadge(row.original.category)
      },
      {
        id: 'approval_status',
        header: 'Approval Status',
        cell: ({ row }) => {
          const status = row.original.approval_status || 'Approved';
          if (status === 'Approved') {
            return (
              <Badge variant="light" color="success">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>
              </Badge>
            );
          }
          if (status === 'Pending Approval') {
            return (
              <Badge variant="light" color="warning">
                <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="w-3 h-3" /> ⏳ Pending Sign-Off (&gt;50k)
                </span>
              </Badge>
            );
          }
          return (
            <Badge variant="light" color="danger">
              <span className="flex items-center gap-1"><X className="w-3 h-3" /> Rejected</span>
            </Badge>
          );
        }
      },
      {
        accessorKey: 'amount',
        header: 'Amount (Rs.)',
        cell: ({ row }) => (
          <span className="font-black text-rose-600 dark:text-rose-400 text-sm">
            Rs. {Number(row.original.amount).toLocaleString()}
          </span>
        )
      },
      {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
          const item = row.original;
          const isPending = item.approval_status === 'Pending Approval';
          const actionItems = [
            ...(isPending ? [
              {
                label: 'Approve High-Value Disbursement',
                icon: <Check className="w-4 h-4 text-emerald-500" />,
                onClick: () => handleApprovalAction(item, 'Approved')
              },
              {
                label: 'Reject Disbursement Voucher',
                icon: <X className="w-4 h-4 text-rose-500" />,
                onClick: () => handleApprovalAction(item, 'Rejected')
              }
            ] : []),
            {
              label: 'Download Voucher PDF',
              icon: <FileText className="w-4 h-4 text-emerald-500" />,
              onClick: () => downloadExpenseVoucherPDF(item)
            },
            {
              label: 'Edit Expense Record',
              icon: <Edit3 className="w-4 h-4 text-blue-500" />,
              onClick: () => handleEdit(item)
            },
            {
              label: 'Delete Expense Record',
              icon: <Trash2 className="w-4 h-4 text-rose-500" />,
              onClick: () => handleDelete(item.id, item.title)
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
    []
  );

  const table = useReactTable({
    data: filteredExpenses,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <div className="w-full max-w-full space-y-6">
      
      {/* Top Breadcrumb Navigation */}
      <Breadcrumb items={[
        { label: 'Finance & Accounts', href: '/finance' },
        { label: 'Restaurant Operating Expenses & Petty Cash Float' }
      ]} />

      {/* Main Header Banner Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-rose-500" />
              Restaurant Operating Expenses & Petty Cash Float
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage kitchen ingredients, utilities, equipment maintenance budgets, and disbursement vouchers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setTopUpModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all h-11 flex items-center gap-2 shadow-sm"
            >
              <Vault className="w-4 h-4" />
              <span>Top-Up Petty Cash</span>
            </button>
            <button 
              onClick={() => setBudgetModalOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all h-11 flex items-center gap-2 shadow-sm"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Budget Caps</span>
            </button>
            <button 
              onClick={handleAddNew}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all h-11 flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <StatCards stats={statsData} loading={loading} />

      {/* 📊 FEATURE 1: Budget vs Actual Variance Progress Bars */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-500" /> Category Budget vs. Actual Spend Variance
          </h3>
          <button 
            onClick={() => setBudgetModalOpen(true)}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline"
          >
            Configure Monthly Budget Caps →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXPENSE_CATEGORIES.map(category => {
            const spent = stats.categoryBreakdown[category] || 0;
            const cap = budgetCaps[category] || 100000;
            const percent = Math.min(Math.round((spent / cap) * 100), 100);
            const isExceeded = spent > cap;

            return (
              <div key={category} className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-slate-50/60 dark:bg-gray-800/40 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700 dark:text-gray-300 truncate max-w-[140px]">{category}</span>
                  <span className={`font-mono font-bold ${isExceeded ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500'}`}>
                    {percent}% ({isExceeded ? 'OVER CAP' : 'Used'})
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isExceeded ? 'bg-rose-500' : percent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Spent: Rs. {spent.toLocaleString()}</span>
                  <span>Cap: Rs. {cap.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cascading Filter Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2 block">
              Expense Year
            </label>
            <SearchableSelect 
              options={[{ value: 'ALL', label: 'All Years' }, ...YEAR_OPTIONS]}
              value={filterYear}
              onChange={(val) => setFilterYear(val as string)}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2 block">
              Expense Month
            </label>
            <SearchableSelect 
              options={[{ value: 'ALL', label: 'All Months' }, ...MONTH_OPTIONS]}
              value={filterMonth}
              onChange={(val) => setFilterMonth(val as string)}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2 block">
              Payment Method
            </label>
            <SearchableSelect 
              options={[{ value: 'ALL', label: 'All Methods' }, ...PAYMENT_METHODS.map(m => ({ value: m, label: m }))]}
              value={filterPaymentMethod}
              onChange={(val) => setFilterPaymentMethod(val as string)}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2 block">
              Filter Category
            </label>
            <SearchableSelect 
              options={[{ value: 'ALL', label: 'All Categories' }, ...EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }))]}
              value={filterCategory}
              onChange={(val) => setFilterCategory(val as string)}
            />
          </div>
        </div>
      </div>

      {/* Main Datatable Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden space-y-4 p-6">
        
        {/* Controls Bar: Search & Exports */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-80">
            <DebouncedSearch
              value={globalFilter}
              onChange={setGlobalFilter}
              placeholder="Search expenses by title or notes..."
            />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={exportPDF} 
              className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
            >
              <FileDown className="w-4 h-4 text-rose-500" />
              <span>PDF Report</span>
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

        {/* Datatable */}
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
                  <td colSpan={columns.length} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 flex items-center justify-center mb-3 shadow-inner">
                        <Receipt className="w-7 h-7 text-rose-600 dark:text-rose-400" />
                      </div>
                      <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">
                        No Expense Vouchers Found
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                        No operational or petty cash expenses were recorded for the selected month/category.
                      </p>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData(initialForm);
                          setDrawerOpen(true);
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 shadow-sm transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Record New Expense
                      </button>
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

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div>
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
            {table.getFilteredRowModel().rows.length} expenses
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
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

      {/* Slide-Over Drawer for Adding/Editing Expense */}
      <ProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={isEditing ? "Edit Expense Record" : "Record New Restaurant expense"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-5 p-2">
          <div>
            <Label required>Expense Category</Label>
            <SearchableSelect 
              options={EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }))}
              value={formData.category}
              onChange={(val) => setFormData({ ...formData, category: val as string })}
            />
          </div>

          <div>
            <Label>Link General Ledger Head (Chart of Accounts)</Label>
            <SearchableSelect 
              options={[
                { value: '', label: 'None (Unlinked / General Expense Head)' },
                ...chartAccounts.map(a => ({
                  value: a.id,
                  label: `${a.code} - ${a.name} (${a.type})`
                }))
              ]}
              value={formData.account_id || ''}
              onChange={(val) => setFormData({ ...formData, account_id: val as string })}
              placeholder="Select General Ledger Account..."
            />
          </div>

          <div>
            <Label required>Payment Method / Vault Source</Label>
            <SearchableSelect 
              options={PAYMENT_METHODS.map(m => ({ value: m, label: m }))}
              value={formData.payment_method || PAYMENT_METHODS[0]}
              onChange={(val) => setFormData({ ...formData, payment_method: val as string })}
            />
          </div>

          <div>
            <Label required>Title / Particulars</Label>
            <InputField 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. K-Electric Bill / Generator Fuel / Building Maintenance"
            />
          </div>

          <div>
            <Label required>Amount (Rs.)</Label>
            <InputField 
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              placeholder="Enter amount in PKR"
            />
            {formData.amount > 50000 && (
              <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> High-Value Disbursement (&gt; Rs. 50,000) will require Principal Sign-Off.
              </p>
            )}
          </div>

          <div>
            <Label required>Disbursement Date</Label>
            <DatePicker 
              value={formData.expense_date}
              onChange={(e: any) => setFormData({ ...formData, expense_date: e?.target?.value || e?.value || String(e) })}
            />
          </div>

          <div>
            <Label>Paid To / Vendor Beneficiary</Label>
            <InputField 
              value={formData.paid_to || ''}
              onChange={(e) => setFormData({ ...formData, paid_to: e.target.value })}
              placeholder="e.g. K-Electric / Al-Rehman Stationers / Master Motors"
            />
          </div>

          <div>
            <Label>Vendor Receipt / Cheque Number</Label>
            <InputField 
              value={formData.receipt_no || ''}
              onChange={(e) => setFormData({ ...formData, receipt_no: e.target.value })}
              placeholder="e.g. CHQ-99104 or REC-4412"
            />
          </div>

          <div>
            <Label>Description / Invoice Details</Label>
            <InputField 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Generator service for 500 hours operation. Paid to Vendor."
            />
          </div>

          <div>
            <ImageUpload 
              label="Vendor Receipt / Invoice Attachment Slip"
              currentImageUrl={formData.receipt_image_url}
              onChange={(url) => setFormData({ ...formData, receipt_image_url: url })}
            />
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              loading={submitLoading}
              loadingText="Saving..."
            >
              {isEditing ? "Update Expense" : "Save Expense Voucher"}
            </Button>
          </div>
        </form>
      </ProfileDrawer>

      {/* Modal: Manage Budget Caps */}
      {budgetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" /> Manage Category Monthly Budget Caps
              </h3>
              <button onClick={() => setBudgetModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {EXPENSE_CATEGORIES.map(cat => (
                <div key={cat} className="flex justify-between items-center gap-3">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-1/2 truncate" title={cat}>{cat}</span>
                  <input 
                    type="number"
                    value={budgetCaps[cat] || 100000}
                    onChange={(e) => setBudgetCaps({ ...budgetCaps, [cat]: Number(e.target.value) })}
                    className="w-1/2 px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white font-bold"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
              <button onClick={() => setBudgetModalOpen(false)} className="px-4 py-2 text-xs font-bold border rounded-xl">Cancel</button>
              <button onClick={() => saveBudgetCaps(budgetCaps)} className="px-4 py-2 text-xs font-bold bg-amber-500 text-white rounded-xl">Save Budget Caps</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Top-Up Petty Cash Vault */}
      {topUpModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Vault className="w-5 h-5 text-emerald-500" /> Top-Up Petty Cash Vault Float
              </h3>
              <button onClick={() => setTopUpModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">Add physical cash replenishment float into the custodian vault.</p>

            <div>
              <Label required>Top-Up Amount (PKR)</Label>
              <InputField 
                type="number"
                value={topUpAmountInput}
                onChange={(e) => setTopUpAmountInput(e.target.value)}
                placeholder="e.g. 25000"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button onClick={handleResetTopUps} className="px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800">
                Clear Vault History
              </button>
              <div className="flex gap-2">
                <button onClick={() => setTopUpModalOpen(false)} className="px-4 py-2 text-xs font-bold border rounded-xl">Cancel</button>
                <button onClick={handleAddTopUp} className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl">Add Cash Top-Up</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}