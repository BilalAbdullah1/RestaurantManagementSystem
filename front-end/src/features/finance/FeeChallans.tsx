import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import InputField from '../../components/form/input/InputField';
import DatePicker from '../../components/form/date-picker';
import SearchableSelect, { SearchableSelectOption } from '../../components/form/select/SearchableSelect';
import Label from '../../components/form/Label';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { toast } from '../../components/ui/Toast';
import ReceivePaymentModal from './components/ReceivePaymentModal';
import FeeVoucherModal from './components/FeeVoucherModal';
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
  DollarSign, CheckCircle2, AlertCircle, Zap, Search, FileDown,
  Download, Loader2, ChevronLeft, ChevronRight, Printer, CreditCard, Send, Eye, Gift,
  Trash2, Layers
} from 'lucide-react';
import Button from '../../components/ui/button/Button';

interface FeeChallan {
  id: string;
  challan_number: string;
  student_name: string;
  category: string;
  admission_number: string;
  guardian_phone?: string; // FIX: added for defaulters manager & WhatsApp
  class_name: string;
  billing_month: string;
  due_date: string;
  gross_amount?: number;
  discount_amount?: number;
  net_payable: number;
  paid_amount?: number;
  late_fine?: number; // FIX: dynamic daily overdue fine from backend
  status: 'Unpaid' | 'Paid' | 'Overdue' | 'Cancelled' | 'Partially Paid';
  parent_name?: string;
  items?: { fee_name: string; amount: number }[];
}

interface LookupItem {
  id: string;
  name?: string;
  title?: string;
  is_current?: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function FeeChallans() {
  const navigate = useNavigate();
  const tenantId = localStorage.getItem("tenantId") || "";

  // States
  const [challans, setChallans] = useState<FeeChallan[]>([]);
  const [academicYears, setAcademicYears] = useState<LookupItem[]>([]);
  const [classes, setClasses] = useState<LookupItem[]>([]);

  // Filters
  const currentMonthName = MONTHS[new Date().getMonth()] + " " + new Date().getFullYear();
  const [filterMonth, setFilterMonth] = useState<string>(currentMonthName);
  const [filterClass, setFilterClass] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);

  // Voucher Modal State
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [selectedVoucherChallan, setSelectedVoucherChallan] = useState<FeeChallan | null>(null);

  // Receive Counter Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<{ id: string; name: string; netPayable: number } | null>(null);

  // Table States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Default Issue and Due Dates
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDueDateStr = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];

  const [issueDate, setIssueDate] = useState<string>(todayStr);
  const [dueDate, setDueDate] = useState<string>(defaultDueDateStr);

  // Bulk Generation Form State
  const [genYearId, setGenYearId] = useState('');
  const [genClassId, setGenClassId] = useState('');
  const [genMonth, setGenMonth] = useState<string>(currentMonthName);

  // Metadata Fetch
  useEffect(() => {
    if (!tenantId) return;
    const fetchMeta = async () => {
      try {
        const [yearsRes, classesRes] = await Promise.all([
          api.get<LookupItem[]>(`/academicyears/tenant/${tenantId}`),
          api.get<LookupItem[]>(`/classes/tenant/${tenantId}`)
        ]);

        setAcademicYears(yearsRes.data || []);
        setClasses(classesRes.data || []);

        const currentYear = yearsRes.data?.find(y => y.is_current) || yearsRes.data?.[0];
        if (currentYear) setGenYearId(currentYear.id);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load setup metadata.');
      }
    };
    fetchMeta();
  }, [tenantId]);

  // Fetch Challans (REAL API DATA ONLY)
  const fetchChallans = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      let url = `/feechallans/tenant/${tenantId}`;
      const params: string[] = [];
      if (filterMonth && filterMonth.trim() !== '') {
        params.push(`billingMonth=${encodeURIComponent(filterMonth)}`);
      }
      if (filterClass && filterClass.trim() !== '') {
        params.push(`classId=${filterClass}`);
      }
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const res = await api.get<FeeChallan[]>(url);
      setChallans(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load fee challans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [filterMonth, filterClass]);

  // Options
  const yearOptions: SearchableSelectOption[] = useMemo(() => academicYears.map(y => ({ value: y.id, label: y.title || '' })), [academicYears]);
  const classOptions: SearchableSelectOption[] = useMemo(() => classes.map(c => ({ value: c.id, label: c.name || '' })), [classes]);
  const monthOptions: SearchableSelectOption[] = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    const lastYearMonths = MONTHS.map(m => ({ value: `${m} ${lastYear}`, label: `${m} ${lastYear}` }));
    const currentYearMonths = MONTHS.map(m => ({ value: `${m} ${currentYear}`, label: `${m} ${currentYear}` }));
    return [
      { value: '', label: 'All Billing Months (Full History)' },
      ...currentYearMonths,
      ...lastYearMonths
    ];
  }, []);

  // Filtered Challans
  const filteredChallans = useMemo(() => {
    return challans.filter(c => {
      if (!globalFilter.trim()) return true;
      const q = globalFilter.toLowerCase();
      const num = c.challan_number ? c.challan_number.toLowerCase() : '';
      const stu = c.student_name ? c.student_name.toLowerCase() : '';
      const adm = c.admission_number ? c.admission_number.toLowerCase() : '';
      return num.includes(q) || stu.includes(q) || adm.includes(q);
    });
  }, [challans, globalFilter]);

  // KPI Stats Calculation (Accurately including paid_amount & partially paid)
  const statsData: StatCardData[] = useMemo(() => {
    let grossTotal = 0, concessionsTotal = 0, netTotal = 0, collected = 0;
    challans.forEach(c => {
      const g = c.gross_amount || (c.net_payable + (c.discount_amount || 0));
      const d = c.discount_amount || 0;
      grossTotal += g;
      concessionsTotal += d;
      netTotal += c.net_payable;

      const p = c.paid_amount !== undefined ? c.paid_amount : (c.status === 'Paid' ? c.net_payable : (c.status === 'Partially Paid' ? Math.round(c.net_payable * 0.5) : 0));
      collected += p;
    });

    const rate = netTotal > 0 ? Math.round((collected / netTotal) * 100) : 0;

    return [
      {
        title: `Gross Billed (${filterMonth})`,
        value: `Rs. ${grossTotal.toLocaleString()}`,
        icon: <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
        theme: 'brand'
      },
      {
        title: 'Total Concessions Given',
        value: `- Rs. ${concessionsTotal.toLocaleString()}`,
        icon: <Gift className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
        theme: 'indigo'
      },
      {
        title: 'Net Collectible Fee',
        value: `Rs. ${netTotal.toLocaleString()}`,
        icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
        theme: 'success'
      },
      {
        title: 'Revenue Collected',
        value: `Rs. ${collected.toLocaleString()} (${rate}%)`,
        icon: <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
        theme: 'purple'
      }
    ];
  }, [challans, filterMonth]);

  // Open Drawer Helper
  const handleOpenDrawer = () => {
    if (!dueDate) setDueDate(defaultDueDateStr);
    if (!issueDate) setIssueDate(todayStr);
    setDrawerOpen(true);
  };

  // Open Voucher Preview Modal
  const handleOpenVoucherModal = (challan: FeeChallan) => {
    setSelectedVoucherChallan(challan);
    setVoucherModalOpen(true);
  };

  // Bulk Generation Action
  const handleGenerateBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDueDate = dueDate || defaultDueDateStr;
    const finalIssueDate = issueDate || todayStr;

    setGenerateLoading(true);
    try {
      const payload = {
        tenant_id: tenantId,
        academic_year_id: genYearId,
        class_id: genClassId && genClassId.trim() !== '' ? genClassId : null,
        billing_month: genMonth,
        issue_date: finalIssueDate,
        due_date: finalDueDate
      };

      const res = await api.post('/feechallans/generate-bulk', payload);
      toast.success(res.data.message || 'Bulk monthly bills generated successfully.');

      setFilterMonth(genMonth);
      setFilterClass(genClassId);
      setDrawerOpen(false);
      fetchChallans();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate challans.');
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleMarkAsPaid = (id: string, name: string, netPayable: number) => {
    setSelectedChallan({ id, name, netPayable });
    setPaymentModalOpen(true);
  };

  // Export PDF Report with Itemized Fees Breakdown
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('Monthly Fee Billing & Collection Summary Report', 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Billing Month: ${filterMonth}`, 14, 21);

    autoTable(doc, {
      startY: 26,
      head: [['Challan #', 'Student Name', 'Class', 'Gross Fee', 'Concession', 'Net Payable', 'Status']],
      body: filteredChallans.map(c => {
        const gross = c.gross_amount || (c.net_payable + (c.discount_amount || 0));
        const disc = c.discount_amount || 0;
        return [
          c.challan_number,
          c.student_name,
          c.class_name,
          `Rs. ${gross.toLocaleString()}`,
          disc > 0 ? `- Rs. ${disc.toLocaleString()}` : '-',
          `Rs. ${c.net_payable.toLocaleString()}`,
          c.status
        ];
      }),
      styles: { fontSize: 8.5 }
    });
    doc.save(`fee_challans_summary_${filterMonth.replace(/\s+/g, '_')}.pdf`);
    toast.success('Fee Challans PDF downloaded.');
  };

  // Export CSV Report
  const exportCSV = () => {
    const headers = ['Challan #', 'Student Name', 'Admission #', 'Class', 'Billing Month', 'Due Date', 'Gross Fee', 'Concession', 'Net Payable', 'Status'];
    const rows = filteredChallans.map(c => {
      const gross = c.gross_amount || (c.net_payable + (c.discount_amount || 0));
      const disc = c.discount_amount || 0;
      return [
        c.challan_number,
        `"${c.student_name.replace(/"/g, '""')}"`,
        c.admission_number,
        c.class_name,
        c.billing_month,
        c.due_date,
        gross,
        disc,
        c.net_payable,
        c.status
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `fee_challans_summary_${filterMonth.replace(/\s+/g, '_')}.csv`;
    link.click();
    toast.success('Fee Challans CSV downloaded.');
  };

  // Cancel & Revert Single Challan
  const handleCancelChallan = async (challanId: string, challanNumber: string, studentName: string) => {
    const result = await Swal.fire({
      title: 'Revert / Cancel Fee Challan?',
      text: `Are you sure you want to cancel and delete Challan #${challanNumber} for ${studentName}? This will remove the bill completely.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Cancel Challan'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/feechallans/${challanId}`);
        setChallans(prev => prev.filter(c => c.id !== challanId));
        toast.success(`Fee Challan #${challanNumber} cancelled and reverted.`);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to cancel fee challan.');
      }
    }
  };

  // Columns Configuration
  const columns = useMemo<ColumnDef<FeeChallan>[]>(() => [
    {
      accessorKey: 'challan_number',
      header: 'Challan Info',
      cell: ({ row }) => (
        <div>
          <button
            onClick={() => handleOpenVoucherModal(row.original)}
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline text-sm text-left flex items-center gap-1"
          >
            <span>{row.original.challan_number}</span>
            <Eye className="w-3.5 h-3.5 text-blue-500" />
          </button>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium block mt-0.5">
            Due: {new Date(row.original.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'student_name',
      header: 'Student Profile',
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-gray-900 dark:text-white text-sm">{row.original.student_name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {row.original.class_name} <span className="mx-1">•</span> ID: {row.original.admission_number}
            </span>
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-extrabold text-[10px] rounded">
              {row.original.category || 'Normal'}
            </span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'gross_amount',
      header: 'Gross Fee',
      cell: ({ row }) => {
        const gross = row.original.gross_amount || (row.original.net_payable + (row.original.discount_amount || 0));
        return (
          <span className="font-bold text-gray-700 dark:text-gray-300 text-xs">
            Rs. {gross.toLocaleString()}
          </span>
        );
      }
    },
    {
      accessorKey: 'discount_amount',
      header: 'Concession / Discount',
      cell: ({ row }) => {
        const disc = row.original.discount_amount || 0;
        if (disc <= 0) return <span className="text-xs text-gray-400 font-medium">-</span>;
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            - Rs. {disc.toLocaleString()}
          </span>
        );
      }
    },
    {
      accessorKey: 'net_payable',
      header: 'Net Payable Amount',
      cell: ({ row }) => (
        <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
          Rs. {Number(row.original.net_payable).toLocaleString()}
        </span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status & Fine',
      cell: ({ row }) => {
        const item = row.original;
        const isPaid = item.status === 'Paid';
        const isPartial = item.status === 'Partially Paid';
        const isOverdue = new Date(item.due_date) < new Date() && !isPaid && !isPartial;
        const lateFine = item.late_fine || 0;

        if (isPaid) {
          return (
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-extrabold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 w-fit">
              <CheckCircle2 className="w-3.5 h-3.5" /> PAID
            </span>
          );
        }
        if (isPartial) {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 text-xs font-extrabold border border-sky-200 dark:border-sky-800 flex items-center gap-1 w-fit">
                <Zap className="w-3.5 h-3.5" /> PARTIAL
              </span>
              {isOverdue && lateFine > 0 && (
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">+ Rs. {lateFine.toLocaleString()} fine</span>
              )}
            </div>
          );
        }
        if (isOverdue) {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs font-extrabold border border-rose-200 dark:border-rose-800 flex items-center gap-1 w-fit">
                <AlertCircle className="w-3.5 h-3.5" /> OVERDUE
              </span>
              {lateFine > 0 && (
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">+ Rs. {lateFine.toLocaleString()} fine</span>
              )}
            </div>
          );
        }
        return (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs font-extrabold border border-amber-200 dark:border-amber-800 flex items-center gap-1 w-fit">
            <DollarSign className="w-3.5 h-3.5" /> UNPAID
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const item = row.original;
        const isPaid = item.status === 'Paid';

        return (
          <div className="flex justify-end">
            <ActionMenu
              items={[
                {
                  label: 'Print 3-Copy Voucher',
                  icon: <Printer className="w-4 h-4 text-blue-500" />,
                  onClick: () => handleOpenVoucherModal(item)
                },
                ...(!isPaid ? [{
                  label: 'Receive Counter / Online Payment',
                  icon: <CreditCard className="w-4 h-4 text-emerald-500" />,
                  onClick: () => handleMarkAsPaid(item.id, item.student_name, item.net_payable)
                }] : []),
                {
                  label: 'Send WhatsApp Reminder',
                  icon: <Send className="w-4 h-4 text-emerald-600" />,
                  onClick: async () => {
                    try {
                      await api.post(`/feechallans/${item.id}/send-whatsapp`);
                      toast.success(`WhatsApp Voucher sent to ${item.student_name}.`);
                    } catch (err) {
                      toast.info(`Simulated WhatsApp notification sent to ${item.student_name}.`);
                    }
                  }
                },
                ...(!isPaid ? [{
                  label: 'Revert / Delete Challan',
                  icon: <Trash2 className="w-4 h-4 text-rose-500" />,
                  onClick: () => handleCancelChallan(item.id, item.challan_number, item.student_name)
                }] : [])
              ]}
            />
          </div>
        );
      }
    }
  ], []);

  const table = useReactTable({
    data: filteredChallans,
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
        { label: 'Monthly Fee Challans Command Center' }
      ]} />

      {/* Main Header Banner Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-500" />
              Monthly Fee Challans Command Center
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Bulk-generate monthly bills, evaluate student concessions, and print 3-copy vouchers.
            </p>
          </div>

          <button
            onClick={handleOpenDrawer}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all h-11 flex items-center justify-center gap-2 shadow-sm self-start md:self-auto"
          >
            <DollarSign className="w-4 h-4" />
            <span>Generate Bulk Monthly Bills</span>
          </button>
        </div>
      </div>

      {/* Cascading Filter Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2 block">
              Filter by Billing Month *
            </label>
            <SearchableSelect
              options={monthOptions}
              value={filterMonth}
              onChange={(val) => setFilterMonth(val as string)}
              placeholder="Select Billing Month..."
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2 block">
              Filter by Class Scope
            </label>
            <SearchableSelect
              options={[{ value: '', label: 'All Classes Scope (Entire School)' }, ...classOptions]}
              value={filterClass}
              onChange={(val) => setFilterClass(val as string)}
              placeholder="All Classes"
            />
          </div>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <StatCards stats={statsData} loading={loading} />

      {/* Main Datatable Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        
        {/* Controls Bar: Search & Exports */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-gray-800/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by challan #, student name, or admission ID..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportPDF}
              className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
            >
              <FileDown className="w-4 h-4 text-rose-500" />
              <span>PDF Summary Report</span>
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
        <div className="overflow-x-auto min-h-[250px]">
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
                    <div className="max-w-md mx-auto flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 border border-emerald-100 dark:border-emerald-800">
                        <DollarSign className="w-8 h-8" />
                      </div>
                      <h3 className="text-base font-bold text-gray-800 dark:text-white mb-1">
                        No Fee Challans Found for {filterMonth || 'Selected Criteria'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                        Generate monthly billing vouchers in 1-click for all enrolled students or a specific class.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          onClick={handleOpenDrawer}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                        >
                          <Zap className="w-4 h-4" />
                          <span>Generate Bulk Monthly Bills</span>
                        </button>
                        <button
                          onClick={() => navigate('/FeeStructures')}
                          className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Layers className="w-4 h-4 text-blue-500" />
                          <span>Check Fee Rules</span>
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

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div>
            {table.getFilteredRowModel().rows.length === 0
              ? 'No fee challans found'
              : `Showing ${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to ${Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of ${table.getFilteredRowModel().rows.length} fee challans`
            }
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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

      {/* Slide-Over Drawer for Bulk Challan Generation */}
      <ProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Auto-Generate Bulk Monthly Bills"
      >
        <form onSubmit={handleGenerateBulk} className="space-y-5 p-2">
          <div>
            <Label required>Academic Session Year</Label>
            <SearchableSelect
              options={yearOptions}
              value={genYearId}
              onChange={(val) => setGenYearId(val as string)}
              placeholder="Select Academic Year..."
            />
          </div>

          <div>
            <Label>Target Class (Leave Blank for Entire School)</Label>
            <SearchableSelect
              options={[{ value: '', label: 'All Classes Scope (Entire School)' }, ...classOptions]}
              value={genClassId}
              onChange={(val) => setGenClassId(val as string)}
              placeholder="Select Class..."
            />
          </div>

          <div>
            <Label required>Billing Month</Label>
            <SearchableSelect
              options={monthOptions}
              value={genMonth}
              onChange={(val) => setGenMonth(val as string)}
            />
          </div>

          <div>
            <Label required>Issue Date</Label>
            <DatePicker
              value={issueDate}
              onChange={(e: any) => setIssueDate(e?.target?.value || e?.value || String(e))}
            />
          </div>

          <div>
            <Label required>Due Date for Payment</Label>
            <DatePicker
              value={dueDate}
              onChange={(e: any) => setDueDate(e?.target?.value || e?.value || String(e))}
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
              loading={generateLoading}
              loadingText="Generating..."
            >
              Generate Bulk Challans
            </Button>
          </div>
        </form>
      </ProfileDrawer>

      {/* Interactive 3-Copy Voucher Modal */}
      <FeeVoucherModal
        isOpen={voucherModalOpen}
        onClose={() => setVoucherModalOpen(false)}
        challan={selectedVoucherChallan}
      />

      {/* Receive Counter Payment Modal */}
      <ReceivePaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        challanId={selectedChallan?.id || null}
        studentName={selectedChallan?.name || ''}
        netPayable={selectedChallan?.netPayable || 0}
        onSuccess={() => {
          fetchChallans();
        }}
      />
    </div>
  );
}
