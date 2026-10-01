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
  FileCheck, UserX, DollarSign, ShieldAlert, 
  Search, Plus, FileDown, Download, Loader2, 
  ChevronLeft, ChevronRight, Printer, CheckCircle2, Trash2,
  Calculator, Sparkles, AlertCircle, Coins
} from 'lucide-react';

interface StaffClearance {
  id: string;
  tenant_id: string;
  staff_id: string;
  staff_name: string;
  designation: string;
  resignation_date: string;
  relieving_date: string;
  notice_period_days: number;
  unpaid_salary_amount: number;
  leave_encashment_amount: number;
  loan_deduction_amount: number;
  net_settlement_amount: number;
  clearance_status: 'Pending' | 'Approved' | 'Completed';
  remarks: string;
  created_at: string;
}

interface StaffLookup {
  id: string;
  first_name: string;
  last_name: string;
  designation: string;
  basic_salary: number;
}

interface StaffLoan {
  id: string;
  staff_id: string;
  loan_amount: number;
  remaining_balance: number;
  status: string;
}

export default function StaffClearanceManager() {
  const tenantId = localStorage.getItem("tenantId") || "";

  const [clearances, setClearances] = useState<StaffClearance[]>([]);
  const [staffList, setStaffList] = useState<StaffLookup[]>([]);
  const [loansList, setLoansList] = useState<StaffLoan[]>([]);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Table States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Automation Form States
  const [unpaidDaysInput, setUnpaidDaysInput] = useState<number>(0);
  const [encashDaysInput, setEncashDaysInput] = useState<number>(0);

  const [formData, setFormData] = useState({
    staff_id: '',
    resignation_date: new Date().toISOString().split('T')[0],
    relieving_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notice_period_days: 30,
    unpaid_salary_amount: 0,
    leave_encashment_amount: 0,
    remarks: ''
  });

  const fetchClearances = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [clrRes, staffRes, loansRes] = await Promise.all([
        api.get<StaffClearance[]>(`/staffclearances/tenant/${tenantId}`),
        api.get<StaffLookup[]>(`/staff/tenant/${tenantId}`),
        api.get<StaffLoan[]>(`/staffloans/tenant/${tenantId}`)
      ]);
      setClearances(clrRes.data || []);
      setStaffList(staffRes.data || []);
      setLoansList(loansRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load staff clearance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClearances();
  }, [tenantId]);

  // Selected Staff Details & Automated Loan Detection
  const selectedStaff = useMemo(() => {
    return staffList.find(s => s.id === formData.staff_id);
  }, [staffList, formData.staff_id]);

  const activeLoan = useMemo(() => {
    if (!formData.staff_id) return null;
    return loansList.find(l => l.staff_id === formData.staff_id && l.remaining_balance > 0 && (l.status === 'Approved' || l.status === 'Pending'));
  }, [loansList, formData.staff_id]);

  const dailyRate = useMemo(() => {
    if (!selectedStaff || !selectedStaff.basic_salary) return 0;
    return Math.round(selectedStaff.basic_salary / 30);
  }, [selectedStaff]);

  // Auto-calculate Unpaid Salary Amount from Unpaid Days
  const handleUnpaidDaysChange = (days: number) => {
    setUnpaidDaysInput(days);
    if (dailyRate > 0) {
      setFormData(prev => ({ ...prev, unpaid_salary_amount: Math.round(dailyRate * days) }));
    }
  };

  // Auto-calculate Leave Encashment Amount from Encash Days
  const handleEncashDaysChange = (days: number) => {
    setEncashDaysInput(days);
    if (dailyRate > 0) {
      setFormData(prev => ({ ...prev, leave_encashment_amount: Math.round(dailyRate * days) }));
    }
  };

  // Estimated Net F&F Settlement Amount
  const estimatedNetSettlement = useMemo(() => {
    const unpaid = formData.unpaid_salary_amount || 0;
    const encashment = formData.leave_encashment_amount || 0;
    const loanDeduction = activeLoan ? activeLoan.remaining_balance : 0;
    return (unpaid + encashment) - loanDeduction;
  }, [formData.unpaid_salary_amount, formData.leave_encashment_amount, activeLoan]);

  const handleCreateClearance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.staff_id) {
      toast.error('Please select a staff member to process clearance.');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/staffclearances', {
        tenant_id: tenantId,
        staff_id: formData.staff_id,
        resignation_date: formData.resignation_date,
        relieving_date: formData.relieving_date,
        notice_period_days: formData.notice_period_days,
        unpaid_salary_amount: formData.unpaid_salary_amount,
        leave_encashment_amount: formData.leave_encashment_amount,
        remarks: formData.remarks
      });

      toast.success('Full & Final Settlement generated and staff account deactivated.');
      setDrawerOpen(false);
      setFormData({
        staff_id: '',
        resignation_date: new Date().toISOString().split('T')[0],
        relieving_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notice_period_days: 30,
        unpaid_salary_amount: 0,
        leave_encashment_amount: 0,
        remarks: ''
      });
      setUnpaidDaysInput(0);
      setEncashDaysInput(0);
      fetchClearances();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not process clearance.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteClearance = async (id: string, staffName: string) => {
    const result = await Swal.fire({
      title: 'Delete Clearance Record?',
      text: `Are you sure you want to delete clearance record for ${staffName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/staffclearances/${id}`);
        setClearances(prev => prev.filter(c => c.id !== id));
        toast.success('Clearance record deleted.');
      } catch (err) {
        toast.error('Failed to delete clearance record.');
      }
    }
  };

  // PDF Full & Final Statement Generator
  const printClearanceCertificate = (item: StaffClearance) => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.setFont("helvetica", "bold");
    doc.text("RESTAURANT MANAGEMENT SYSTEM", 105, 20, { align: "center" });

    doc.setFontSize(13);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("FULL & FINAL (F&F) SETTLEMENT STATEMENT", 105, 28, { align: "center" });

    doc.setDrawColor(220);
    doc.line(14, 34, 196, 34);

    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text(`Employee Name:`, 14, 44);
    doc.setFont("helvetica", "bold");
    doc.text(item.staff_name, 55, 44);

    doc.setFont("helvetica", "normal");
    doc.text(`Designation:`, 14, 52);
    doc.setFont("helvetica", "bold");
    doc.text(item.designation || 'Staff Member', 55, 52);

    doc.setFont("helvetica", "normal");
    doc.text(`Resignation Date:`, 125, 44);
    doc.setFont("helvetica", "bold");
    doc.text(new Date(item.resignation_date).toLocaleDateString(), 165, 44);

    doc.setFont("helvetica", "normal");
    doc.text(`Relieving Date:`, 125, 52);
    doc.setFont("helvetica", "bold");
    doc.text(new Date(item.relieving_date).toLocaleDateString(), 165, 52);

    doc.setTextColor(50);

    autoTable(doc, {
      startY: 62,
      head: [['Full & Final Settlement Component', 'Amount (PKR)']],
      body: [
        ['Unpaid Working Salary Days Payable', `Rs. ${item.unpaid_salary_amount.toLocaleString()}`],
        ['Unutilized Leave Encashment Pay', `+ Rs. ${item.leave_encashment_amount.toLocaleString()}`],
        ['Outstanding Advance Loan Deductions', `- Rs. ${item.loan_deduction_amount.toLocaleString()}`],
        ['Remarks / Clearance Notes', item.remarks || 'Full & Final Settlement completed. All restaurant assets returned.']
      ],
      foot: [['NET FINAL SETTLEMENT DISBURSED', `Rs. ${item.net_settlement_amount.toLocaleString()}`]],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 12 },
      styles: { fontSize: 11, cellPadding: 6 },
      columnStyles: { 1: { halign: 'right' } }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(10);
    doc.line(20, finalY + 30, 70, finalY + 30);
    doc.text("HR / Accounts Manager", 22, finalY + 35);

    doc.line(140, finalY + 30, 190, finalY + 30);
    doc.text("Employee Signature (Received)", 140, finalY + 35);

    doc.save(`Full_Final_Settlement_${item.staff_name.replace(/\s+/g, '_')}.pdf`);
    toast.success(`F&F Statement PDF generated for ${item.staff_name}`);
  };

  // CSV Export
  const exportCSV = () => {
    const headers = ['Staff Name', 'Designation', 'Resignation Date', 'Relieving Date', 'Unpaid Salary', 'Leave Encashment', 'Loan Deductions', 'Net Settlement'];
    const rows = filteredClearances.map(c => [
      `"${c.staff_name.replace(/"/g, '""')}"`,
      `"${c.designation.replace(/"/g, '""')}"`,
      new Date(c.resignation_date).toLocaleDateString(),
      new Date(c.relieving_date).toLocaleDateString(),
      c.unpaid_salary_amount,
      c.leave_encashment_amount,
      c.loan_deduction_amount,
      c.net_settlement_amount
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `staff_clearances_registry_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Staff clearances CSV downloaded');
  };

  // PDF List Export
  const exportListPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text("Staff Resignations & F&F Clearances Registry", 14, 15);
    
    autoTable(doc, {
      startY: 22,
      head: [['Staff Name', 'Designation', 'Relieving Date', 'Unpaid Salary', 'Leave Encashment', 'Loan Deductions', 'Net F&F Settlement']],
      body: filteredClearances.map(c => [
        c.staff_name,
        c.designation,
        new Date(c.relieving_date).toLocaleDateString(),
        `Rs. ${c.unpaid_salary_amount.toLocaleString()}`,
        `Rs. ${c.leave_encashment_amount.toLocaleString()}`,
        `- Rs. ${c.loan_deduction_amount.toLocaleString()}`,
        `Rs. ${c.net_settlement_amount.toLocaleString()}`
      ]),
      styles: { fontSize: 9 }
    });
    doc.save(`staff_clearances_registry_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Staff clearances PDF registry downloaded');
  };

  const staffOptions: SearchableSelectOption[] = useMemo(() => {
    return staffList.map(s => ({
      value: s.id,
      label: `${s.first_name} ${s.last_name} (${s.designation || 'Staff'} - Basic: Rs. ${s.basic_salary.toLocaleString()})`
    }));
  }, [staffList]);

  // StatCards KPI Data
  const statsData: StatCardData[] = useMemo(() => {
    const totalSettled = clearances.length;
    const totalDisbursed = clearances.reduce((s, c) => s + c.net_settlement_amount, 0);
    const totalLoansRecovered = clearances.reduce((s, c) => s + c.loan_deduction_amount, 0);
    const avgSettlement = totalSettled > 0 ? Math.round(totalDisbursed / totalSettled) : 0;

    return [
      {
        title: 'Settled Employees',
        value: `${totalSettled} Employees`,
        icon: <UserX className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
        theme: 'brand'
      },
      {
        title: 'Total Disbursed F&F',
        value: `Rs. ${totalDisbursed.toLocaleString()}`,
        icon: <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
        theme: 'success'
      },
      {
        title: 'Loan Recovery Deductions',
        value: `Rs. ${totalLoansRecovered.toLocaleString()}`,
        icon: <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
        theme: 'warning'
      },
      {
        title: 'Average F&F Settlement',
        value: `Rs. ${avgSettlement.toLocaleString()}`,
        icon: <FileCheck className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
        theme: 'sky'
      }
    ];
  }, [clearances]);

  // Filtered Clearances
  const filteredClearances = useMemo(() => {
    return clearances.filter(c => {
      if (!globalFilter.trim()) return true;
      const q = globalFilter.toLowerCase();
      return c.staff_name.toLowerCase().includes(q) || 
             (c.designation && c.designation.toLowerCase().includes(q)) ||
             (c.remarks && c.remarks.toLowerCase().includes(q));
    });
  }, [clearances, globalFilter]);

  // Table Columns Setup
  const columns = useMemo<ColumnDef<StaffClearance>[]>(() => [
    {
      accessorKey: 'staff_name',
      header: 'Staff Member',
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
      accessorKey: 'relieving_date',
      header: 'Relieving Date',
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-gray-700 dark:text-gray-300">
          {new Date(row.original.relieving_date).toLocaleDateString()}
        </span>
      )
    },
    {
      accessorKey: 'leave_encashment_amount',
      header: 'Leave Encashment',
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400">
          + Rs. {row.original.leave_encashment_amount.toLocaleString()}
        </span>
      )
    },
    {
      accessorKey: 'loan_deduction_amount',
      header: 'Loan Deducted',
      cell: ({ row }) => (
        row.original.loan_deduction_amount > 0 ? (
          <span className="font-bold text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-1 rounded-lg border border-rose-100 dark:border-rose-900/40">
            - Rs. {row.original.loan_deduction_amount.toLocaleString()}
          </span>
        ) : (
          <span className="text-xs text-gray-400 font-medium">Rs. 0</span>
        )
      )
    },
    {
      accessorKey: 'net_settlement_amount',
      header: 'Net F&F Settlement',
      cell: ({ row }) => (
        <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
          Rs. {row.original.net_settlement_amount.toLocaleString()}
        </span>
      )
    },
    {
      accessorKey: 'clearance_status',
      header: 'Status',
      cell: () => (
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-extrabold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 w-fit">
          <CheckCircle2 className="w-3.5 h-3.5" />
          ACCOUNT SETTLED
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
                label: 'Print F&F Statement PDF',
                icon: <Printer className="w-4 h-4 text-blue-500" />,
                onClick: () => printClearanceCertificate(row.original)
              },
              {
                label: 'Delete Record',
                icon: <Trash2 className="w-4 h-4 text-red-500" />,
                onClick: () => handleDeleteClearance(row.original.id, row.original.staff_name),
                className: 'text-red-600 dark:text-red-400'
              }
            ]}
          />
        </div>
      )
    }
  ], []);

  const table = useReactTable({
    data: filteredClearances,
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
        { label: 'Resignation & Clearance (F&F)' }
      ]} />

      {/* Main Header Banner Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-blue-500" />
              Full & Final (F&F) Clearance Settlement
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Process staff resignations, encash unutilized leaves, adjust loans, and generate clearance certificates.
            </p>
          </div>
          
          <button 
            onClick={() => setDrawerOpen(true)} 
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all h-11 flex items-center justify-center gap-2 shadow-sm self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Process Staff Resignation & F&F</span>
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
              placeholder="Search clearance records by staff name or designation..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all"
            />
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

        {/* Datatable */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Loading staff clearance records...</p>
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
                      No staff clearance records found. Click "+ Process Staff Resignation & F&F" to add one.
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
            {table.getFilteredRowModel().rows.length} clearance records
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

      {/* Slide-Over Drawer for Clearance Creation */}
      <ProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Staff Resignation & Full & Final (F&F) Settlement"
      >
        <form onSubmit={handleCreateClearance} className="space-y-5 p-2">
          <div>
            <Label required>Select Staff Member</Label>
            <SearchableSelect 
              options={staffOptions}
              value={formData.staff_id}
              onChange={(val) => setFormData({ ...formData, staff_id: val })}
              placeholder="Search Staff Member..."
            />
          </div>

          {/* AUTOMATED CALCULATION & LOAN DETECTION BANNER */}
          {selectedStaff && (
            <div className="p-4 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                    Automated Salary & Loan Profile
                  </span>
                </div>
                <span className="text-[11px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-md">
                  Daily Rate: Rs. {dailyRate.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white dark:bg-gray-900 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Basic Base Pay</span>
                  <span className="font-extrabold text-gray-800 dark:text-gray-200">Rs. {selectedStaff.basic_salary.toLocaleString()}</span>
                </div>
                <div className="p-2 bg-white dark:bg-gray-900 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Active Loan Recovery</span>
                  {activeLoan ? (
                    <span className="font-extrabold text-rose-600 dark:text-rose-400">- Rs. {activeLoan.remaining_balance.toLocaleString()}</span>
                  ) : (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">No Active Loan</span>
                  )}
                </div>
              </div>

              {/* Quick Auto-Fill Buttons */}
              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleUnpaidDaysChange(15)}
                  className="px-2.5 py-1 bg-white dark:bg-gray-900 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-lg border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Auto 15 Days Salary
                </button>
                <button
                  type="button"
                  onClick={() => handleEncashDaysChange(5)}
                  className="px-2.5 py-1 bg-white dark:bg-gray-900 hover:bg-blue-100 dark:hover:bg-blue-900 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-lg border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1"
                >
                  <Coins className="w-3 h-3" /> Auto 5 Days Leaves
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <DatePicker 
                label="Resignation Date"
                value={formData.resignation_date}
                onChange={(e) => setFormData({ ...formData, resignation_date: e.target.value })}
                placeholder="Select Date"
              />
            </div>
            <div>
              <DatePicker 
                label="Relieving Date"
                value={formData.relieving_date}
                onChange={(e) => setFormData({ ...formData, relieving_date: e.target.value })}
                placeholder="Select Date"
              />
            </div>
          </div>

          {/* Unpaid Salary Days Calculation */}
          <div className="grid grid-cols-3 gap-3 items-end">
            <div>
              <Label>Unpaid Days</Label>
              <InputField 
                type="number"
                min="0"
                max="31"
                placeholder="Days"
                value={unpaidDaysInput || ''}
                onChange={(e) => handleUnpaidDaysChange(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="col-span-2">
              <Label>Unpaid Salary Pay (Rs)</Label>
              <InputField 
                type="number"
                min="0"
                placeholder="Auto-calculated amount"
                value={formData.unpaid_salary_amount || ''}
                onChange={(e) => setFormData({ ...formData, unpaid_salary_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Leave Encashment Calculation */}
          <div className="grid grid-cols-3 gap-3 items-end">
            <div>
              <Label>Encash Days</Label>
              <InputField 
                type="number"
                min="0"
                max="30"
                placeholder="Days"
                value={encashDaysInput || ''}
                onChange={(e) => handleEncashDaysChange(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="col-span-2">
              <Label>Leave Encashment Pay (Rs)</Label>
              <InputField 
                type="number"
                min="0"
                placeholder="Auto-calculated amount"
                value={formData.leave_encashment_amount || ''}
                onChange={(e) => setFormData({ ...formData, leave_encashment_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* LIVE ESTIMATED NET F&F PAYOUT PREVIEW */}
          {selectedStaff && (
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                  Estimated Net F&F Disbursed Payout
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  (Unpaid + Leave Encashment) - Active Loan
                </span>
              </div>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                Rs. {estimatedNetSettlement.toLocaleString()}
              </span>
            </div>
          )}

          <div>
            <Label>Clearance Remarks / Reason</Label>
            <InputField 
              type="text"
              placeholder="e.g. Resigned due to personal reasons. All restaurant assets returned."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
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
              <FileCheck className="w-4 h-4" />
              <span>{submitLoading ? 'Processing...' : 'Finalize & Deactivate Account'}</span>
            </button>
          </div>
        </form>
      </ProfileDrawer>

    </div>
  );
}


