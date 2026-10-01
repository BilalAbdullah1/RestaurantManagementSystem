import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import SearchableSelect, { SearchableSelectOption } from '../../components/form/select/SearchableSelect';
import InputField from '../../components/form/input/InputField';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { toast } from '../../components/ui/Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SalarySlipActionMenu from './components/SalarySlipActionMenu';
import PayrollEngineDrawer from './components/PayrollEngineDrawer';
import Swal from 'sweetalert2';
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
  Calculator, Search, CheckCircle2, DollarSign, 
  Clock, UserCheck, Loader2, FileDown, Download,
  ChevronLeft, ChevronRight, User
} from 'lucide-react';

interface SalarySlip {
  id: string;
  staff_id: string;
  staff_name: string;
  designation: string;
  salary_month: string;
  basic_salary: number;
  house_rent_allowance?: number;
  medical_allowance?: number;
  allowance_amount: number;
  deduction_amount: number;
  provident_fund_deduction?: number;
  loan_deduction?: number;
  income_tax_deduction?: number;
  net_salary: number;
  status: 'Unpaid' | 'Paid';
  payment_date?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export default function SalarySlipsManager() {
  const tenantId = localStorage.getItem("tenantId") || "";

  const [searchParams] = useSearchParams();
  const [slips, setSlips] = useState<SalarySlip[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEngineOpen, setIsEngineOpen] = useState(false);

  const currentMonthName = MONTHS[new Date().getMonth()] + " " + new Date().getFullYear();
  const [filterMonth, setFilterMonth] = useState<string>(currentMonthName);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Unpaid'>('all');

  // Table States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Deep linking: Handle URL query params
  useEffect(() => {
    if (searchParams.get('action') === 'run-payroll' || searchParams.get('action') === 'new') {
      setIsEngineOpen(true);
    }
    const m = searchParams.get('month');
    if (m) {
      setFilterMonth(m);
    }
    const s = searchParams.get('status');
    if (s === 'Paid' || s === 'Unpaid' || s === 'all') {
      setStatusFilter(s);
    }
  }, [searchParams]);

  // Fetch Data
  const fetchSlips = async () => {
    if (!tenantId || !filterMonth) return;
    setLoading(true);
    try {
      const res = await api.get<SalarySlip[]>(`/salaryslips/tenant/${tenantId}?salaryMonth=${filterMonth}`);
      setSlips(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load salary slips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlips();
  }, [filterMonth, tenantId]);

  // Derived KPI Stats for StatCards
  const statsData: StatCardData[] = useMemo(() => {
    let totalPayable = 0, disbursed = 0, pending = 0, paidCount = 0;
    slips.forEach(s => {
      totalPayable += s.net_salary;
      if (s.status === 'Paid') {
        disbursed += s.net_salary;
        paidCount++;
      } else {
        pending += s.net_salary;
      }
    });

    return [
      {
        title: 'Total Payable Payroll',
        value: `Rs. ${totalPayable.toLocaleString()}`,
        icon: <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
        theme: 'brand'
      },
      {
        title: 'Disbursed Payroll',
        value: `Rs. ${disbursed.toLocaleString()}`,
        icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
        theme: 'success'
      },
      {
        title: 'Pending Disbursement',
        value: `Rs. ${pending.toLocaleString()}`,
        icon: <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
        theme: 'warning'
      },
      {
        title: 'Disbursed Ratio',
        value: slips.length > 0 ? `${paidCount} / ${slips.length} Staff` : '0 Staff',
        icon: <UserCheck className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
        theme: 'sky'
      }
    ];
  }, [slips]);

  // Month Options
  const monthOptions = useMemo((): SearchableSelectOption[] => {
    const year = new Date().getFullYear();
    return MONTHS.map(m => ({ value: `${m} ${year}`, label: `${m} ${year}` }));
  }, []);

  const handleMarkAsPaid = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Mark Salary as Paid?',
      text: `Confirm salary payment for ${name} for ${filterMonth}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Yes, Mark Paid'
    });

    if (result.isConfirmed) {
      try {
        await api.post(`/salaryslips/${id}/pay`);
        toast.success(`Salary slip for ${name} marked as Paid`);
        fetchSlips();
      } catch (err) {
        toast.error('Failed to process salary payment');
      }
    }
  };

  // PDF Payslip Generator
  const printSlip = (slip: SalarySlip) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.setFont("helvetica", "bold");
    doc.text("SCHOOL MANAGEMENT SYSTEM", 105, 20, { align: "center" });

    doc.setFontSize(13);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("Official Staff Monthly Payslip", 105, 28, { align: "center" });

    doc.setDrawColor(220);
    doc.line(14, 34, 196, 34);

    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text(`Employee Name:`, 14, 44);
    doc.setFont("helvetica", "bold");
    doc.text(slip.staff_name, 50, 44);

    doc.setFont("helvetica", "normal");
    doc.text(`Designation:`, 14, 52);
    doc.setFont("helvetica", "bold");
    doc.text(slip.designation, 50, 52);

    doc.setFont("helvetica", "normal");
    doc.text(`Salary Month:`, 130, 44);
    doc.setFont("helvetica", "bold");
    doc.text(slip.salary_month, 160, 44);

    doc.setFont("helvetica", "normal");
    doc.text(`Payment Status:`, 130, 52);
    if (slip.status === 'Paid') {
      doc.setTextColor(16, 185, 129);
    } else {
      doc.setTextColor(245, 158, 11);
    }
    doc.text(slip.status.toUpperCase(), 165, 52);

    doc.setTextColor(50);

    const houseRent = slip.house_rent_allowance || Math.round(slip.basic_salary * 0.15);
    const medical = slip.medical_allowance || Math.round(slip.basic_salary * 0.10);
    const pf = slip.provident_fund_deduction || Math.round(slip.basic_salary * 0.05);
    const loan = slip.loan_deduction || 0;
    const tax = slip.income_tax_deduction || 0;
    const attendanceDeduct = Math.max(0, slip.deduction_amount - pf - loan - tax);

    autoTable(doc, {
      startY: 62,
      head: [['Description of Earnings / Deductions', 'Amount (PKR)']],
      body: [
        ['Basic Base Pay', `Rs. ${slip.basic_salary.toLocaleString()}`],
        ['House Rent Allowance (15% HRA)', `+ Rs. ${houseRent.toLocaleString()}`],
        ['Medical Allowance (10%)', `+ Rs. ${medical.toLocaleString()}`],
        ['Provident Fund (PF Deduction 5%)', `- Rs. ${pf.toLocaleString()}`],
        ['Advance Loan Installment Recovery', `- Rs. ${loan.toLocaleString()}`],
        ['Income Tax Deduction (FBR Slabs)', `- Rs. ${tax.toLocaleString()}`],
        ['Attendance Lates/Absents Deductions', `- Rs. ${attendanceDeduct.toLocaleString()}`],
      ],
      foot: [['NET PAYABLE SALARY', `Rs. ${slip.net_salary.toLocaleString()}`]],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 12 },
      styles: { fontSize: 11, cellPadding: 5 },
      columnStyles: { 1: { halign: 'right' } }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(10);
    doc.line(140, finalY + 15, 190, finalY + 15);
    doc.text("Employee Signature", 145, finalY + 20);

    doc.save(`Salary_Slip_${slip.staff_name}_${slip.salary_month}.pdf`);
    toast.success(`Payslip generated for ${slip.staff_name}`);
  };

  // Bulk Registry Exports
  const exportListPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(16);
    doc.text(`Salary Registry - ${filterMonth}`, 14, 15);
    autoTable(doc, {
      startY: 22,
      head: [['Staff Name', 'Designation', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary', 'Status']],
      body: filteredSlips.map(s => [
        s.staff_name,
        s.designation,
        `Rs. ${s.basic_salary.toLocaleString()}`,
        `Rs. ${s.allowance_amount.toLocaleString()}`,
        `Rs. ${s.deduction_amount.toLocaleString()}`,
        `Rs. ${s.net_salary.toLocaleString()}`,
        s.status
      ]),
      styles: { fontSize: 9 }
    });
    doc.save(`Salary_Registry_${filterMonth}.pdf`);
    toast.success('Salary Registry PDF downloaded');
  };

  const exportListCSV = () => {
    const headers = ['Staff Name', 'Designation', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary', 'Status'];
    const rows = filteredSlips.map(s => [
      `"${s.staff_name.replace(/"/g, '""')}"`,
      `"${s.designation.replace(/"/g, '""')}"`,
      s.basic_salary,
      s.allowance_amount,
      s.deduction_amount,
      s.net_salary,
      s.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Salary_Registry_${filterMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Salary Registry CSV downloaded');
  };

  // Filtered Slips by Status & Search Query
  const filteredSlips = useMemo(() => {
    return slips.filter(s => {
      if (statusFilter === 'Paid' && s.status !== 'Paid') return false;
      if (statusFilter === 'Unpaid' && s.status !== 'Unpaid') return false;

      if (!globalFilter.trim()) return true;
      const q = globalFilter.toLowerCase();
      return s.staff_name.toLowerCase().includes(q) || s.designation.toLowerCase().includes(q);
    });
  }, [slips, statusFilter, globalFilter]);

  // Table Columns
  const columns = useMemo<ColumnDef<SalarySlip>[]>(() => [
    {
      header: 'Staff Profile',
      accessorFn: row => `${row.staff_name} ${row.designation}`,
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
              <p className="text-xs text-gray-500 dark:text-gray-400">{row.original.designation}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Basic Pay',
      accessorKey: 'basic_salary',
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-gray-700 dark:text-gray-300">Rs. {row.original.basic_salary.toLocaleString()}</span>
      )
    },
    {
      header: 'Allowances',
      accessorKey: 'allowance_amount',
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400">+ Rs. {row.original.allowance_amount.toLocaleString()}</span>
      )
    },
    {
      header: 'Deductions',
      accessorKey: 'deduction_amount',
      cell: ({ row }) => (
        row.original.deduction_amount > 0 ? (
          <span className="font-bold text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-100 dark:border-red-900/40">
            - Rs. {row.original.deduction_amount.toLocaleString()}
          </span>
        ) : (
          <span className="text-gray-400 text-xs font-medium">Rs. 0</span>
        )
      )
    },
    {
      header: 'Net Payable',
      accessorKey: 'net_salary',
      cell: ({ row }) => (
        <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
          Rs. {row.original.net_salary.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        row.original.status === 'Paid' ? (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-extrabold border border-emerald-200 dark:border-emerald-800">
            PAID
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs font-extrabold border border-amber-200 dark:border-amber-800">
            UNPAID
          </span>
        )
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <SalarySlipActionMenu 
            slip={row.original} 
            onPrint={printSlip} 
            onDisburse={handleMarkAsPaid} 
          />
        </div>
      )
    }
  ], [filterMonth]);

  const table = useReactTable({
    data: filteredSlips,
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
        { label: 'Finance & Accounts', href: '/finance' },
        { label: 'Staff Payroll & Salary Slips' }
      ]} />

      {/* Main Header Banner Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-blue-500" />
              Staff Payroll & Salary Slips
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Sync monthly attendance, calculate deductions & tax, and disburse staff salaries.
            </p>
          </div>
          
          <button 
            onClick={() => setIsEngineOpen(true)} 
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all h-11 flex items-center justify-center gap-2 shadow-sm self-start md:self-auto"
          >
            <Calculator className="w-4 h-4" />
            <span>Run Payroll Engine</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <StatCards stats={statsData} />

      {/* Main Datatable Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        
        {/* Controls Bar: Month Selector, Search Bar, Status Pills, and Export Buttons */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50 dark:bg-gray-800/50">
          
          <div className="flex flex-col md:flex-row items-center gap-3 flex-1">
            <div className="w-full md:w-60">
              <SearchableSelect 
                options={monthOptions} 
                value={filterMonth} 
                onChange={setFilterMonth} 
                placeholder="Salary Month" 
              />
            </div>
            
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search staff or designation..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 justify-between lg:justify-end flex-wrap">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                All ({slips.length})
              </button>
              <button
                onClick={() => setStatusFilter('Unpaid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'Unpaid' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Unpaid ({slips.filter(s => s.status === 'Unpaid').length})
              </button>
              <button
                onClick={() => setStatusFilter('Paid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'Paid' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Paid ({slips.filter(s => s.status === 'Paid').length})
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
                onClick={exportListCSV} 
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
            <p className="text-xs text-gray-500 dark:text-gray-400">Loading payroll slips for {filterMonth}...</p>
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
                    <td colSpan={columns.length} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center mb-3 shadow-inner">
                          <Calculator className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">
                          No Payroll Slips for {filterMonth}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                          Salary slips have not yet been computed for this month. Run the automated payroll engine to calculate staff attendance, allowances, and tax deductions.
                        </p>
                        <button
                          onClick={() => setIsEngineOpen(true)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 shadow-sm transition-all"
                        >
                          <Calculator className="w-4 h-4" />
                          Run Payroll Engine
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
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div>
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
            {table.getFilteredRowModel().rows.length} staff slips
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

      {/* Payroll Engine Slide-Over Drawer */}
      <PayrollEngineDrawer
        isOpen={isEngineOpen}
        onClose={() => setIsEngineOpen(false)}
        tenantId={tenantId}
        onSuccess={(targetMonthString) => {
          setFilterMonth(targetMonthString);
          setIsEngineOpen(false);
          fetchSlips();
        }}
      />

    </div>
  );
}