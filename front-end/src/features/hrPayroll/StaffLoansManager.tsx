import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import InputField from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import SearchableSelect, { SearchableSelectOption } from '../../components/form/select/SearchableSelect';
import DatePicker from '../../components/form/date-picker';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
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
  CreditCard, DollarSign, Clock, CheckCircle2, 
  Search, Plus, FileDown, Download, Loader2, 
  ChevronLeft, ChevronRight, X, Printer, HandCoins 
} from 'lucide-react';

interface StaffLoan {
  id: string;
  tenant_id: string;
  staff_id: string;
  staff_name: string;
  designation: string;
  loan_amount: number;
  monthly_installment: number;
  remaining_balance: number;
  status: 'Approved' | 'Repaid' | 'Pending' | 'Rejected';
  reason: string;
  issue_date: string;
  created_at: string;
}

interface StaffLookup {
  id: string;
  first_name: string;
  last_name: string;
  designation: string;
}

export default function StaffLoansManager() {
  const tenantId = localStorage.getItem("tenantId") || "";

  const [loans, setLoans] = useState<StaffLoan[]>([]);
  const [staffList, setStaffList] = useState<StaffLookup[]>([]);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'repaid'>('all');

  // Table States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [formData, setFormData] = useState({
    staff_id: '',
    loan_amount: 0,
    monthly_installment: 0,
    reason: '',
    issue_date: new Date().toISOString().split('T')[0]
  });

  const fetchLoans = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [loansRes, staffRes] = await Promise.all([
        api.get<StaffLoan[]>(`/staffloans/tenant/${tenantId}`),
        api.get<StaffLookup[]>(`/staff/tenant/${tenantId}`)
      ]);
      setLoans(loansRes.data || []);
      setStaffList(staffRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load staff loans data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [tenantId]);

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.staff_id || formData.loan_amount <= 0 || formData.monthly_installment <= 0) {
      toast.error('Please fill all required fields correctly.');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/staffloans', {
        tenant_id: tenantId,
        staff_id: formData.staff_id,
        loan_amount: formData.loan_amount,
        monthly_installment: formData.monthly_installment,
        reason: formData.reason,
        issue_date: formData.issue_date
      });

      toast.success('Staff Advance Loan issued successfully.');
      setDrawerOpen(false);
      setFormData({ 
        staff_id: '', 
        loan_amount: 0, 
        monthly_installment: 0, 
        reason: '',
        issue_date: new Date().toISOString().split('T')[0]
      });
      fetchLoans();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not issue loan.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteLoan = async (id: string, staffName: string) => {
    const result = await Swal.fire({
      title: 'Cancel Advance Loan?',
      text: `Are you sure you want to cancel the loan record for ${staffName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Cancel Loan'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/staffloans/${id}`);
        setLoans(prev => prev.filter(l => l.id !== id));
        toast.success('Loan record cancelled successfully.');
      } catch (err) {
        toast.error('Could not cancel loan record.');
      }
    }
  };

  // PDF Receipt Generator
  const printLoanReceipt = (loan: StaffLoan) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.setFont("helvetica", "bold");
    doc.text("SCHOOL MANAGEMENT SYSTEM", 105, 20, { align: "center" });

    doc.setFontSize(13);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("Official Staff Advance Loan Receipt", 105, 28, { align: "center" });

    doc.setDrawColor(220);
    doc.line(14, 34, 196, 34);

    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text(`Employee Name:`, 14, 44);
    doc.setFont("helvetica", "bold");
    doc.text(loan.staff_name, 55, 44);

    doc.setFont("helvetica", "normal");
    doc.text(`Designation:`, 14, 52);
    doc.setFont("helvetica", "bold");
    doc.text(loan.designation || 'Staff Member', 55, 52);

    doc.setFont("helvetica", "normal");
    doc.text(`Issue Date:`, 130, 44);
    doc.setFont("helvetica", "bold");
    doc.text(new Date(loan.issue_date || loan.created_at).toLocaleDateString(), 160, 44);

    doc.setFont("helvetica", "normal");
    doc.text(`Status:`, 130, 52);
    const isRepaid = loan.status === 'Repaid' || loan.remaining_balance <= 0;
    if (isRepaid) {
      doc.setTextColor(16, 185, 129);
    } else {
      doc.setTextColor(245, 158, 11);
    }
    doc.text(isRepaid ? 'REPAID' : 'ACTIVE LOAN', 160, 52);

    doc.setTextColor(50);

    autoTable(doc, {
      startY: 62,
      head: [['Loan Term Specification', 'Amount (PKR)']],
      body: [
        ['Total Sanctioned Loan Amount', `Rs. ${loan.loan_amount.toLocaleString()}`],
        ['Monthly Deductible Installment', `Rs. ${loan.monthly_installment.toLocaleString()} / month`],
        ['Current Remaining Outstanding Balance', `Rs. ${loan.remaining_balance.toLocaleString()}`],
        ['Loan Purpose / Reason', loan.reason || 'General Staff Advance']
      ],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 11, cellPadding: 5 },
      columnStyles: { 1: { halign: 'right' } }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text("Note: Installments will be automatically deducted from monthly salary slips until remaining balance reaches Rs. 0.", 14, finalY + 15);

    doc.line(140, finalY + 35, 190, finalY + 35);
    doc.text("Staff Member Signature", 142, finalY + 40);

    doc.save(`loan_receipt_${loan.staff_name.replace(/\s+/g, '_')}.pdf`);
    toast.success(`Loan receipt generated for ${loan.staff_name}`);
  };

  // CSV Export
  const exportCSV = () => {
    const headers = ['Staff Name', 'Designation', 'Total Loan Amount', 'Monthly Installment', 'Remaining Balance', 'Status', 'Issue Date'];
    const csvRows = filteredLoans.map(l => [
      `"${l.staff_name.replace(/"/g, '""')}"`,
      `"${l.designation.replace(/"/g, '""')}"`,
      l.loan_amount,
      l.monthly_installment,
      l.remaining_balance,
      l.remaining_balance <= 0 ? 'Repaid' : 'Active',
      new Date(l.issue_date || l.created_at).toLocaleDateString()
    ]);
    const csvContent = [headers.join(","), ...csvRows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `staff_loans_registry_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Staff loans CSV downloaded');
  };

  // PDF List Export
  const exportListPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text("Staff Advance Loans Registry", 14, 15);
    
    autoTable(doc, {
      startY: 22,
      head: [['Staff Name', 'Designation', 'Total Loan (Rs)', 'Monthly Installment', 'Remaining Balance', 'Status', 'Issue Date']],
      body: filteredLoans.map(l => [
        l.staff_name,
        l.designation,
        `Rs. ${l.loan_amount.toLocaleString()}`,
        `Rs. ${l.monthly_installment.toLocaleString()}`,
        `Rs. ${l.remaining_balance.toLocaleString()}`,
        l.remaining_balance <= 0 ? 'Repaid' : 'Active',
        new Date(l.issue_date || l.created_at).toLocaleDateString()
      ]),
      styles: { fontSize: 9 }
    });
    doc.save(`staff_loans_registry_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Staff loans PDF registry downloaded');
  };

  const staffOptions: SearchableSelectOption[] = useMemo(() => {
    return staffList.map(s => ({
      value: s.id,
      label: `${s.first_name} ${s.last_name} (${s.designation || 'Staff'})`
    }));
  }, [staffList]);

  // StatCards KPI Data
  const statsData: StatCardData[] = useMemo(() => {
    const totalDisbursed = loans.reduce((s, l) => s + l.loan_amount, 0);
    const totalRemaining = loans.reduce((s, l) => s + l.remaining_balance, 0);
    const activeCount = loans.filter(l => (l.status === 'Approved' || l.status === 'Pending') && l.remaining_balance > 0).length;
    const repaidCount = loans.filter(l => l.remaining_balance <= 0 || l.status === 'Repaid').length;

    return [
      {
        title: 'Active Loan Accounts',
        value: `${activeCount} Accounts`,
        icon: <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
        theme: 'brand'
      },
      {
        title: 'Total Loan Disbursed',
        value: `Rs. ${totalDisbursed.toLocaleString()}`,
        icon: <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
        theme: 'success'
      },
      {
        title: 'Pending Recoveries',
        value: `Rs. ${totalRemaining.toLocaleString()}`,
        icon: <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
        theme: 'warning'
      },
      {
        title: 'Repaid Accounts',
        value: `${repaidCount} Repaid`,
        icon: <CheckCircle2 className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
        theme: 'sky'
      }
    ];
  }, [loans]);

  // Filtered Loans
  const filteredLoans = useMemo(() => {
    return loans.filter(l => {
      const isRepaid = l.status === 'Repaid' || l.remaining_balance <= 0;
      if (statusFilter === 'active' && isRepaid) return false;
      if (statusFilter === 'repaid' && !isRepaid) return false;

      if (!globalFilter.trim()) return true;
      const q = globalFilter.toLowerCase();
      return l.staff_name.toLowerCase().includes(q) || (l.designation && l.designation.toLowerCase().includes(q));
    });
  }, [loans, statusFilter, globalFilter]);

  // TanStack Table Columns Setup
  const columns = useMemo<ColumnDef<StaffLoan>[]>(() => [
    {
      accessorKey: 'staff_name',
      header: 'Staff Profile',
      cell: ({ row }) => {
        const name = row.original.staff_name;
        const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST';
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center border border-blue-100 dark:border-blue-800 shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{row.original.designation || 'Staff Member'}</p>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'loan_amount',
      header: 'Total Loan',
      cell: ({ row }) => (
        <span className="font-bold text-xs text-gray-800 dark:text-gray-200">Rs. {row.original.loan_amount.toLocaleString()}</span>
      )
    },
    {
      accessorKey: 'monthly_installment',
      header: 'Monthly Installment',
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-amber-600 dark:text-amber-400">
          Rs. {row.original.monthly_installment.toLocaleString()} / mo
        </span>
      )
    },
    {
      accessorKey: 'remaining_balance',
      header: 'Remaining Balance',
      cell: ({ row }) => (
        row.original.remaining_balance > 0 ? (
          <span className="font-extrabold text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-100 dark:border-rose-900/40">
            Rs. {row.original.remaining_balance.toLocaleString()}
          </span>
        ) : (
          <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">Rs. 0 (Fully Paid)</span>
        )
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const isRepaid = row.original.status === 'Repaid' || row.original.remaining_balance <= 0;
        return isRepaid ? (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-extrabold border border-emerald-200 dark:border-emerald-800">
            REPAID
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs font-extrabold border border-blue-200 dark:border-blue-800">
            ACTIVE LOAN
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ActionMenu 
            items={[
              {
                label: 'Print Loan Receipt',
                icon: <Printer className="w-4 h-4 text-blue-500" />,
                onClick: () => printLoanReceipt(row.original)
              },
              {
                label: 'Cancel Loan Record',
                icon: <X className="w-4 h-4 text-red-500" />,
                onClick: () => handleDeleteLoan(row.original.id, row.original.staff_name),
                className: 'text-red-600 dark:text-red-400'
              }
            ]}
          />
        </div>
      )
    }
  ], []);

  const table = useReactTable({
    data: filteredLoans,
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
        { label: 'HR & Payroll', href: '/hr' },
        { label: 'Staff Advance Loan Management' }
      ]} />

      {/* Main Header Banner Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <HandCoins className="w-6 h-6 text-blue-500" />
              Staff Advance Loan Management
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Issue advance loans to staff and auto-deduct monthly installments during payroll generation.
            </p>
          </div>
          
          <button 
            onClick={() => setDrawerOpen(true)} 
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all h-11 flex items-center justify-center gap-2 shadow-sm self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Advance Loan</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <StatCards stats={statsData} />

      {/* Main Datatable Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        
        {/* Controls Bar: Search Bar, Status Pills, and Export Buttons */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-gray-800/50">
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search loan by staff name or designation..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-between md:justify-end">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                All ({loans.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'active' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Active ({loans.filter(l => l.remaining_balance > 0).length})
              </button>
              <button
                onClick={() => setStatusFilter('repaid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'repaid' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Repaid ({loans.filter(l => l.remaining_balance <= 0).length})
              </button>
            </div>

            {/* Export Actions */}
            <div className="flex gap-2">
              <button 
                onClick={exportListPDF} 
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

        {/* Datatable */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Loading staff advance loan records...</p>
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
                      No staff advance loan records found. Click "+ Issue Advance Loan" to add one.
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
            {table.getFilteredRowModel().rows.length} loan accounts
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-36">
              <SearchableSelect
                options={[
                  { value: '10', label: '10 per page' },
                  { value: '20', label: '20 per page' },
                  { value: '30', label: '30 per page' },
                  { value: '50', label: '50 per page' }
                ]}
                value={table.getState().pagination.pageSize.toString()}
                onChange={(val) => table.setPageSize(Number(val))}
              />
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

      {/* Slide-Over Drawer for Loan Creation */}
      <ProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Issue Staff Advance Loan"
      >
        <form onSubmit={handleCreateLoan} className="space-y-5 p-2">
          <div>
            <Label required>Select Staff Member</Label>
            <SearchableSelect 
              options={staffOptions}
              value={formData.staff_id}
              onChange={(val) => setFormData({ ...formData, staff_id: val })}
              placeholder="Search Staff Member..."
            />
          </div>

          <div>
            <Label required>Total Loan Amount (Rs)</Label>
            <InputField 
              type="number"
              min="1"
              required
              placeholder="e.g. 50000"
              value={formData.loan_amount || ''}
              onChange={(e) => setFormData({ ...formData, loan_amount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label required>Monthly Deductible Installment (Rs)</Label>
            <InputField 
              type="number"
              min="1"
              required
              placeholder="e.g. 5000"
              value={formData.monthly_installment || ''}
              onChange={(e) => setFormData({ ...formData, monthly_installment: parseFloat(e.target.value) || 0 })}
            />
            <span className="text-[11px] text-gray-400 block mt-1">
              This monthly amount will be automatically deducted on every salary slip generation until remaining balance becomes Rs. 0.
            </span>
          </div>

          <div>
            <DatePicker 
              label="Issue Date"
              value={formData.issue_date}
              onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
              placeholder="Select Issue Date"
            />
          </div>

          <div>
            <Label>Loan Purpose / Reason</Label>
            <InputField 
              type="text"
              placeholder="e.g. Medical emergency / Advance salary request"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
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
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-40"
            >
              <HandCoins className="w-4 h-4" />
              <span>{submitLoading ? 'Processing...' : 'Issue Advance Loan'}</span>
            </button>
          </div>
        </form>
      </ProfileDrawer>

    </div>
  );
}
