import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Badge from '../../components/ui/badge/Badge';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
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
  AlertCircle, Send, DollarSign, Clock, MessageSquare, PhoneCall,
  Search, FileDown, Download, Loader2, ChevronLeft, ChevronRight, CheckCircle2, ShieldAlert
} from 'lucide-react';

interface DefaulterChallan {
  id: string;
  challan_number: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  guardian_phone?: string; // FIX: now returned by backend API
  billing_month: string;
  due_date: string;
  net_payable: number;
  paid_amount?: number;
  late_fine?: number; // FIX: dynamic late fine from backend
  status: string;
}

export default function FeeDefaultersManager() {
  const tenantId = localStorage.getItem("tenantId") || "";

  const [searchParams] = useSearchParams();
  const [defaulters, setDefaulters] = useState<DefaulterChallan[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [clearedOverrides, setClearedOverrides] = useState<string[]>(() => {
    try {
      // FIX: Consistent key name for finance hold clearances
      return JSON.parse(localStorage.getItem("finance_hold_cleared") || "[]");
    } catch { return []; }
  });

  // Table States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Sync search/filter from URL search params
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setGlobalFilter(searchParam);
    }
  }, [searchParams]);

  const fetchDefaulters = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await api.get<DefaulterChallan[]>(`/feechallans/tenant/${tenantId}`);
      const overdueOnly = (res.data || []).filter(c => c.status !== 'Paid' && new Date(c.due_date) < new Date());
      setDefaulters(overdueOnly);
    } catch (err) {
      toast.error('Failed to load fee defaulters list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaulters();
  }, [tenantId]);

  const toggleFinanceClearance = (studentId: string, studentName: string) => {
    let updated: string[];
    if (clearedOverrides.includes(studentId)) {
      updated = clearedOverrides.filter(id => id !== studentId);
      toast.error(`Exam & Gradebook Hold RE-APPLIED for ${studentName}.`);
    } else {
      updated = [...clearedOverrides, studentId];
      toast.success(`Finance Clearance Granted! ${studentName} can now access Exam Cards & Gradebooks.`);
    }
    setClearedOverrides(updated);
    // FIX: Consistent key name
    localStorage.setItem("finance_hold_cleared", JSON.stringify(updated));
  };

  const handleSendWhatsAppReminder = async (id: string, studentName: string, isHoldAlert = false) => {
    setSendingReminderId(id);
    try {
      await api.post(`/feechallans/${id}/send-reminder`);
      if (isHoldAlert) {
        toast.success(`Exam Hold SMS & WhatsApp Notice dispatched to ${studentName}'s guardian.`);
      } else {
        toast.success(`WhatsApp & SMS fee reminder sent to ${studentName}'s guardian.`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not send WhatsApp reminder.');
    } finally {
      setSendingReminderId(null);
    }
  };

  const totalDefaulterAmount = useMemo(() => {
    return defaulters.reduce((acc, curr) => acc + curr.net_payable + (curr.late_fine || 0), 0);
  }, [defaulters]);

  const examHoldCount = useMemo(() => {
    return defaulters.filter(c => {
      const daysOverdue = Math.max(0, Math.floor((new Date().getTime() - new Date(c.due_date).getTime()) / (1000 * 3600 * 24)));
      return daysOverdue >= 60 && !clearedOverrides.includes(c.student_id);
    }).length;
  }, [defaulters, clearedOverrides]);

  const statsData: StatCardData[] = useMemo(() => [
    {
      title: 'Total Fee Defaulters',
      value: defaulters.length,
      icon: <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
      theme: 'error'
    },
    {
      title: 'Total Overdue Balance',
      value: `Rs. ${totalDefaulterAmount.toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      theme: 'warning'
    },
    {
      title: 'Exam Hold (60+ Days Overdue)',
      value: `${examHoldCount} Students`,
      icon: <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />,
      theme: 'error'
    },
    {
      title: 'Active Reminder Channel',
      value: 'WhatsApp + SMS',
      icon: <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      theme: 'success'
    }
  ], [defaulters.length, totalDefaulterAmount, examHoldCount]);

  // Export PDF Report
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(225, 29, 72);
    doc.text('Fee Defaulters & Overdue Dues Report', 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [['Challan #', 'Student Name', 'Class', 'Due Date', 'Total Overdue (Rs.)', 'Exam Status']],
      body: defaulters.map(c => {
        const daysOverdue = Math.max(0, Math.floor((new Date().getTime() - new Date(c.due_date).getTime()) / (1000 * 3600 * 24)));
        const isCleared = clearedOverrides.includes(c.student_id);
        const examStatus = isCleared ? 'Cleared' : (daysOverdue >= 60 ? 'BLOCKED (60+ Days)' : 'Warning');
        return [
          c.challan_number,
          c.student_name,
          c.class_name,
          new Date(c.due_date).toLocaleDateString('en-GB'),
          `Rs. ${(c.net_payable + (c.late_fine || 0)).toLocaleString()}`,
          examStatus
        ];
      }),
      styles: { fontSize: 9 }
    });
    doc.save(`fee_defaulters_report.pdf`);
    toast.success('Fee defaulters PDF downloaded.');
  };

  // Export CSV Report
  const exportCSV = () => {
    const headers = ['Challan #', 'Student Name', 'Class', 'Due Date', 'Net Payable', 'Late Fine', 'Total Overdue', 'Exam Access Status'];
    const rows = defaulters.map(c => {
      const daysOverdue = Math.max(0, Math.floor((new Date().getTime() - new Date(c.due_date).getTime()) / (1000 * 3600 * 24)));
      const isCleared = clearedOverrides.includes(c.student_id);
      const examStatus = isCleared ? 'Cleared' : (daysOverdue >= 60 ? 'BLOCKED (60+ Days Overdue)' : 'Standard Defaulter');
      return [
        c.challan_number,
        `"${c.student_name.replace(/"/g, '""')}"`,
        c.class_name,
        c.due_date,
        c.net_payable,
        c.late_fine || 0,
        c.net_payable + (c.late_fine || 0),
        examStatus
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `fee_defaulters_report.csv`;
    link.click();
    toast.success('Fee defaulters CSV downloaded.');
  };

  const columns = useMemo<ColumnDef<DefaulterChallan>[]>(
    () => [
      {
        accessorKey: 'challan_number',
        header: 'Challan #',
        cell: (info) => <span className="font-bold text-gray-900 dark:text-white text-sm">{info.getValue() as string}</span>
      },
      {
        accessorKey: 'student_name',
        header: 'Student & Class',
        cell: ({ row }) => (
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{row.original.student_name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Class: {row.original.class_name}</p>
          </div>
        )
      },
      {
        accessorKey: 'due_date',
        header: 'Due Date & Days Overdue',
        cell: ({ row }) => {
          const dueDate = new Date(row.original.due_date);
          const daysOverdue = Math.max(0, Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 3600 * 24)));
          return (
            <div>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">{dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${daysOverdue >= 60
                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                  : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}>
                {daysOverdue} Days Overdue
              </span>
            </div>
          );
        }
      },
      {
        id: 'exam_hold_status',
        header: 'Exam & Result Access',
        cell: ({ row }) => {
          const item = row.original;
          const dueDate = new Date(item.due_date);
          const daysOverdue = Math.max(0, Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 3600 * 24)));
          const isCleared = clearedOverrides.includes(item.student_id);

          if (isCleared) {
            return (
              <Badge variant="light" color="success">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Finance Override (Cleared)</span>
              </Badge>
            );
          }

          if (daysOverdue >= 60) {
            return (
              <Badge variant="light" color="danger">
                <span className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400"><ShieldAlert className="w-3 h-3" /> ⛔ EXAM HOLD (60+ Days)</span>
              </Badge>
            );
          }

          return (
            <Badge variant="light" color="warning">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Warning ({daysOverdue}d)</span>
            </Badge>
          );
        }
      },
      {
        accessorKey: 'net_payable',
        header: 'Dues + Fine',
        cell: ({ row }) => (
          <div>
            <p className="font-black text-rose-600 dark:text-rose-400 text-sm">Rs. {(row.original.net_payable + (row.original.late_fine || 0)).toLocaleString()}</p>
            {row.original.late_fine > 0 && (
              <p className="text-[10px] text-gray-400 dark:text-gray-500">Includes Rs.{row.original.late_fine} late fine</p>
            )}
          </div>
        )
      },
      {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
          const item = row.original;
          const isCleared = clearedOverrides.includes(item.student_id);
          const actionItems = [
            {
              label: sendingReminderId === item.id ? 'Sending Alert...' : 'Send WhatsApp & SMS Fee Reminder',
              icon: <Send className="w-4 h-4 text-emerald-500" />,
              onClick: () => handleSendWhatsAppReminder(item.id, item.student_name, false)
            },
            {
              label: 'Send Exam Hold Notice (60+ Days)',
              icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
              onClick: () => handleSendWhatsAppReminder(item.id, item.student_name, true)
            },
            {
              label: isCleared ? 'Revoke Finance Exam Clearance' : 'Grant Temporary Finance Clearance',
              icon: <CheckCircle2 className={`w-4 h-4 ${isCleared ? 'text-rose-500' : 'text-indigo-500'}`} />,
              onClick: () => toggleFinanceClearance(item.student_id, item.student_name)
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
    [sendingReminderId, clearedOverrides]
  );

  const table = useReactTable({
    data: defaulters,
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
        { label: 'Late Fee Fine & Defaulters Tracker' }
      ]} />

      {/* Main Header Banner Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-rose-500" />
              Late Fee Fine & Defaulters Tracker
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Auto-calculate daily late fines and dispatch 1-Click WhatsApp & SMS reminders to guardians.
            </p>
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
              placeholder="Search by student name, roll number, or phone..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all"
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
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-3 shadow-inner">
                        <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">
                        Zero Fee Defaulters Found
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                        All issued student challans are either fully settled or within their permissible due date grace window.
                      </p>
                      <button
                        onClick={fetchDefaulters}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 shadow-sm transition-all"
                      >
                        <Clock className="w-4 h-4" />
                        Refresh Defaulter Status
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
            {table.getFilteredRowModel().rows.length} defaulters
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
    </div>
  );
}
