import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import LeaveApprovalDrawer from './components/LeaveApprovalDrawer';
import { toast } from '../../components/ui/Toast';
import Swal from 'sweetalert2';
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
  CheckCircle2, XCircle, Clock, CalendarCheck, 
  Search, FileDown, Download, Loader2, 
  ChevronLeft, ChevronRight, Eye, ShieldAlert, Check, X
} from 'lucide-react';

export default function LeaveApprovals() {
  const tenantId = localStorage.getItem("tenantId") || "";
  const approverId = localStorage.getItem("userId") || "";

  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [actionNotes, setActionNotes] = useState('');

  // Table States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  useEffect(() => {
    fetchPendingLeaves();
  }, [tenantId]);

  const fetchPendingLeaves = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const res = await api.get(`/leaveapplications/tenant/${tenantId}/pending`);
      setPendingLeaves(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch pending leave applications.');
    } finally {
      setLoading(false);
    }
  };

  const openActionDrawer = (leave: any) => {
    setSelectedLeave(leave);
    setActionNotes('');
    setIsDrawerOpen(true);
  };

  const handleAction = async (status: 'Approved' | 'Rejected') => {
    if (!selectedLeave) return;
    try {
      await api.put(`/leaveapplications/${selectedLeave.id}/status`, {
        status: status,
        approver_id: approverId,
        approver_notes: actionNotes
      });
      toast.success(`Leave application ${status.toLowerCase()} successfully!`);
      setIsDrawerOpen(false);
      fetchPendingLeaves();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${status.toLowerCase()} leave application.`);
    }
  };

  // KPI Stat Cards Setup
  const statsData: StatCardData[] = useMemo(() => {
    const totalPending = pendingLeaves.length;
    const studentCount = pendingLeaves.filter(l => !!l.student_id).length;
    const staffCount = pendingLeaves.filter(l => !l.student_id).length;

    return [
      {
        title: 'Pending Leave Queue',
        value: `${totalPending} Requests`,
        icon: <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
        theme: 'warning'
      },
      {
        title: 'Staff Leave Requests',
        value: `${staffCount} Pending`,
        icon: <CalendarCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
        theme: 'brand'
      },
      {
        title: 'Student Leave Requests',
        value: `${studentCount} Pending`,
        icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
        theme: 'success'
      },
      {
        title: 'Review Action Required',
        value: `${totalPending} Action Items`,
        icon: <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
        theme: 'sky'
      }
    ];
  }, [pendingLeaves]);

  // Export Actions
  const exportPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('Pending Leave Approvals Queue', 14, 15);
    
    autoTable(doc, {
      startY: 22,
      head: [['Applicant Type', 'Leave Type', 'Applied Date', 'Start Date', 'End Date', 'Reason']],
      body: filteredLeaves.map(l => [
        l.student_id ? 'Student Member' : 'Staff Member',
        l.leave_type,
        new Date(l.applied_on).toLocaleDateString(),
        new Date(l.start_date).toLocaleDateString(),
        new Date(l.end_date).toLocaleDateString(),
        l.reason
      ]),
      styles: { fontSize: 9 }
    });
    doc.save(`leave_approvals_queue_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Leave approvals PDF downloaded.');
  };

  const exportCSV = () => {
    const headers = ['Applicant Type', 'Leave Type', 'Applied Date', 'Start Date', 'End Date', 'Reason'];
    const rows = filteredLeaves.map(l => [
      l.student_id ? 'Student' : 'Staff',
      `"${l.leave_type.replace(/"/g, '""')}"`,
      new Date(l.applied_on).toLocaleDateString(),
      new Date(l.start_date).toLocaleDateString(),
      new Date(l.end_date).toLocaleDateString(),
      `"${l.reason.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leave_approvals_queue_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Leave approvals CSV downloaded.');
  };

  // Filtered List
  const filteredLeaves = useMemo(() => {
    return pendingLeaves.filter(l => {
      if (!globalFilter.trim()) return true;
      const q = globalFilter.toLowerCase();
      const type = l.leave_type ? l.leave_type.toLowerCase() : '';
      const reason = l.reason ? l.reason.toLowerCase() : '';
      const applicant = l.student_id ? 'student' : 'staff';
      return type.includes(q) || reason.includes(q) || applicant.includes(q);
    });
  }, [pendingLeaves, globalFilter]);

  // Datatable Columns
  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'applicant_type',
      header: 'Applicant',
      cell: ({ row }) => {
        const isStudent = !!row.original.student_id;
        return (
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl font-extrabold text-xs flex items-center justify-center border shrink-0 ${
              isStudent 
                ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' 
                : 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800'
            }`}>
              {isStudent ? 'ST' : 'HR'}
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
                {isStudent ? 'Student Leave Request' : 'Staff Leave Request'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Applied: {new Date(row.original.applied_on).toLocaleDateString()}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'leave_type',
      header: 'Leave Category',
      cell: ({ row }) => (
        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-bold border border-gray-200 dark:border-gray-700">
          {row.original.leave_type}
        </span>
      )
    },
    {
      accessorKey: 'start_date',
      header: 'Leave Duration',
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-xs text-gray-800 dark:text-gray-200 block">
            {new Date(row.original.start_date).toLocaleDateString()}
          </span>
          <span className="text-[11px] text-gray-400 block">
            to {new Date(row.original.end_date).toLocaleDateString()}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => (
        <p className="max-w-[250px] truncate text-xs text-gray-600 dark:text-gray-400 font-medium" title={row.original.reason}>
          {row.original.reason}
        </p>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: () => (
        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs font-extrabold border border-amber-200 dark:border-amber-800 flex items-center gap-1 w-fit">
          <Clock className="w-3.5 h-3.5" />
          PENDING REVIEW
        </span>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ActionMenu 
            items={[
              {
                label: 'Review & Action',
                icon: <Eye className="w-4 h-4 text-blue-500" />,
                onClick: () => openActionDrawer(row.original)
              }
            ]}
          />
        </div>
      )
    }
  ], []);

  const table = useReactTable({
    data: filteredLeaves,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full max-w-full space-y-6">
      <Breadcrumb items={[
        { label: 'HR & Payroll', href: '/hr' },
        { label: 'Leave Approvals Queue' }
      ]} />

      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <CalendarCheck className="w-6 h-6 text-blue-500" />
              Staff & Student Leave Approvals
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Review, approve, or reject pending leave applications from staff members and students.
            </p>
          </div>
        </div>
      </div>

      <StatCards stats={statsData} loading={loading} />

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-gray-800/50">
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search pending requests by type, reason, or applicant..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all"
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
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-400 italic">
                    No pending leave requests found in queue. All leave requests have been reviewed!
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

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div>
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
            {table.getFilteredRowModel().rows.length} pending leave requests
          </div>
          
          <div className="flex items-center gap-3">
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

      <LeaveApprovalDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        leave={selectedLeave}
        actionNotes={actionNotes}
        setActionNotes={setActionNotes}
        onAction={handleAction}
      />
    </div>
  );
}
