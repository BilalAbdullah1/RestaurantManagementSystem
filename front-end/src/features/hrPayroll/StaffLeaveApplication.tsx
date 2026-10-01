import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import StaffLeaveFormDrawer from './components/StaffLeaveFormDrawer';
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
  Calendar, Plus, CheckCircle2, XCircle, Clock, 
  Search, FileDown, Download, Loader2, 
  ChevronLeft, ChevronRight, Eye, Ban
} from 'lucide-react';

export default function StaffLeaveApplication() {
  const tenantId = localStorage.getItem("tenantId") || "";
  const staffId = localStorage.getItem("userId") || "";

  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: 'Sick Leave',
    start_date: '',
    end_date: '',
    reason: '',
    attachment_url: ''
  });
  const [uploading, setUploading] = useState(false);

  // Table States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  useEffect(() => {
    fetchLeaves();
  }, [tenantId, staffId]);

  const fetchLeaves = async () => {
    if (!tenantId || !staffId) return;
    try {
      setLoading(true);
      const res = await api.get(`/leaveapplications/tenant/${tenantId}/staff/${staffId}`);
      setLeaves(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch your leave applications.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append("file", file);

    setUploading(true);
    try {
      const res = await api.post('/uploads', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newUrl = res.data.url;
      setFormData({ ...formData, attachment_url: newUrl });
      toast.success('Document file uploaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.start_date || !formData.end_date || !formData.reason) {
      toast.error('Please fill in all required leave application fields.');
      return;
    }

    try {
      await api.post('/leaveapplications', {
        tenant_id: tenantId,
        staff_id: staffId,
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
        attachment_url: formData.attachment_url
      });
      toast.success('Leave application submitted successfully!');
      setIsDrawerOpen(false);
      setFormData({ leave_type: 'Sick Leave', start_date: '', end_date: '', reason: '', attachment_url: '' });
      fetchLeaves();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit leave application.');
    }
  };

  const handleCancel = async (leave: any) => {
    const res = await Swal.fire({
      title: 'Cancel Application?',
      text: "Are you sure you want to cancel this leave application?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Cancel'
    });

    if (res.isConfirmed) {
      try {
        await api.delete(`/leaveapplications/${leave.id}`);
        toast.success('Leave application cancelled.');
        fetchLeaves();
      } catch (err) {
        console.error(err);
        toast.error('Failed to cancel leave application.');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-extrabold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs font-extrabold border border-rose-200 dark:border-rose-800 flex items-center gap-1 w-fit">
            <XCircle className="w-3.5 h-3.5" /> REJECTED
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs font-extrabold border border-amber-200 dark:border-amber-800 flex items-center gap-1 w-fit">
            <Clock className="w-3.5 h-3.5" /> PENDING REVIEW
          </span>
        );
    }
  };

  // StatCards Setup
  const statsData: StatCardData[] = useMemo(() => {
    let pending = 0, approved = 0, rejected = 0;
    leaves.forEach(l => {
      if (l.status === 'Pending') pending++;
      else if (l.status === 'Approved') approved++;
      else if (l.status === 'Rejected') rejected++;
    });

    return [
      {
        title: 'Total Applications',
        value: `${leaves.length} Requests`,
        icon: <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
        theme: 'brand'
      },
      {
        title: 'Pending Approvals',
        value: `${pending} In Review`,
        icon: <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
        theme: 'warning'
      },
      {
        title: 'Approved Leaves',
        value: `${approved} Granted`,
        icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
        theme: 'success'
      },
      {
        title: 'Rejected Applications',
        value: `${rejected} Declined`,
        icon: <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
        theme: 'sky'
      }
    ];
  }, [leaves]);

  // Export Actions
  const exportPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('My Leave Applications Registry', 14, 15);
    
    autoTable(doc, {
      startY: 22,
      head: [['Leave Type', 'Applied Date', 'Start Date', 'End Date', 'Status', 'Approver Notes']],
      body: filteredLeaves.map(l => [
        l.leave_type,
        new Date(l.applied_on).toLocaleDateString(),
        new Date(l.start_date).toLocaleDateString(),
        new Date(l.end_date).toLocaleDateString(),
        l.status,
        l.approver_notes || '-'
      ]),
      styles: { fontSize: 9 }
    });
    doc.save(`my_leave_applications_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('My leaves PDF downloaded.');
  };

  const exportCSV = () => {
    const headers = ['Leave Type', 'Applied Date', 'Start Date', 'End Date', 'Reason', 'Status', 'Approver Notes'];
    const rows = filteredLeaves.map(l => [
      `"${l.leave_type.replace(/"/g, '""')}"`,
      new Date(l.applied_on).toLocaleDateString(),
      new Date(l.start_date).toLocaleDateString(),
      new Date(l.end_date).toLocaleDateString(),
      `"${l.reason.replace(/"/g, '""')}"`,
      l.status,
      `"${(l.approver_notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `my_leave_applications_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('My leaves CSV downloaded.');
  };

  // Filtered Leaves
  const filteredLeaves = useMemo(() => {
    return leaves.filter(l => {
      if (!globalFilter.trim()) return true;
      const q = globalFilter.toLowerCase();
      const type = l.leave_type ? l.leave_type.toLowerCase() : '';
      const reason = l.reason ? l.reason.toLowerCase() : '';
      const status = l.status ? l.status.toLowerCase() : '';
      return type.includes(q) || reason.includes(q) || status.includes(q);
    });
  }, [leaves, globalFilter]);

  // Datatable Columns
  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'leave_type',
      header: 'Leave Type & Applied Date',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center border border-blue-100 dark:border-blue-800 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{row.original.leave_type}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Applied: {new Date(row.original.applied_on).toLocaleDateString()}
            </p>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'start_date',
      header: 'Leave Period',
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
        <p className="max-w-[200px] truncate text-xs text-gray-600 dark:text-gray-400 font-medium" title={row.original.reason}>
          {row.original.reason}
        </p>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status)
    },
    {
      accessorKey: 'approver_notes',
      header: 'Approver Remarks',
      cell: ({ row }) => (
        <span className="text-xs text-gray-500 dark:text-gray-400 italic">
          {row.original.approver_notes || '-'}
        </span>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const isPending = row.original.status === 'Pending';
        return (
          <div className="flex justify-end">
            <ActionMenu 
              items={[
                {
                  label: 'View Application Details',
                  icon: <Eye className="w-4 h-4 text-blue-500" />,
                  onClick: () => {
                    setFormData({
                      leave_type: row.original.leave_type,
                      start_date: row.original.start_date,
                      end_date: row.original.end_date,
                      reason: row.original.reason,
                      attachment_url: row.original.attachment_url || ''
                    });
                    setViewMode(true);
                    setIsDrawerOpen(true);
                  }
                },
                ...(isPending ? [{
                  label: 'Cancel Leave Request',
                  icon: <Ban className="w-4 h-4 text-red-500" />,
                  onClick: () => handleCancel(row.original),
                  className: 'text-red-600 dark:text-red-400'
                }] : [])
              ]}
            />
          </div>
        );
      }
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
      {/* Top Breadcrumb Navigation */}
      <Breadcrumb items={[
        { label: 'HR & Payroll', href: '/hr' },
        { label: 'My Leave Applications' }
      ]} />

      {/* Main Header Banner Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              Staff & Faculty Leave Portal
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Apply for faculty/staff leaves, upload medical certificates, and track approval status.
            </p>
          </div>
          
          <button 
            onClick={() => {
              setFormData({ leave_type: 'Sick Leave', start_date: '', end_date: '', reason: '', attachment_url: '' });
              setViewMode(false);
              setIsDrawerOpen(true);
            }} 
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all h-11 flex items-center justify-center gap-2 shadow-sm self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Staff Leave</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <StatCards stats={statsData} />

      {/* Main Datatable Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        
        {/* Controls Bar: Search Bar and Export Buttons */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-gray-800/50">
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search your leaves by type, reason, or status..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all"
            />
          </div>

          {/* Export Actions */}
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
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Loading your leave applications...</p>
          </div>
        ) : (
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
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-400 italic">
                      No leave applications found. Click "+ Apply Staff Leave" to submit a request.
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
            {table.getFilteredRowModel().rows.length} leave applications
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

      {/* Slide-Over Drawer for Staff Leave Application */}
      <StaffLeaveFormDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        uploading={uploading}
        handleFileUpload={handleFileUpload}
        viewMode={viewMode}
      />
    </div>
  );
}


