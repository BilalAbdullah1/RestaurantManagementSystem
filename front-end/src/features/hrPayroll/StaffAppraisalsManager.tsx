import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import InputField from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import SearchableSelect, { SearchableSelectOption } from '../../components/form/select/SearchableSelect';
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
  Award, TrendingUp, Star, Search, Plus,
  FileDown, Download, Loader2, ChevronLeft,
  ChevronRight, Printer, Sparkles, CheckCircle2, ShieldCheck,
  Clock
} from 'lucide-react';

interface StaffAppraisal {
  id: string;
  tenant_id: string;
  staff_id: string;
  staff_name: string;
  designation: string;
  appraisal_year: number;
  performance_rating: number;
  is_teacher_of_the_month: boolean;
  award_month?: string;
  recommended_increment_pct: number;
  previous_basic_salary: number;
  new_basic_salary: number;
  is_increment_applied: boolean;
  comments: string;
  created_at: string;
}

interface StaffLookup {
  id: string;
  first_name: string;
  last_name: string;
  designation: string;
  basic_salary: number;
}

export default function StaffAppraisalsManager() {
  const tenantId = localStorage.getItem("tenantId") || "";

  const [appraisals, setAppraisals] = useState<StaffAppraisal[]>([]);
  const [staffList, setStaffList] = useState<StaffLookup[]>([]);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'applied' | 'pending' | 'totm'>('all');

  // Table States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [formData, setFormData] = useState({
    staff_id: '',
    appraisal_year: new Date().getFullYear(),
    performance_rating: 4.5,
    is_teacher_of_the_month: false,
    award_month: '',
    recommended_increment_pct: 10,
    comments: ''
  });

  const fetchAppraisals = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [appRes, staffRes] = await Promise.all([
        api.get<StaffAppraisal[]>(`/staffappraisals/tenant/${tenantId}`),
        api.get<StaffLookup[]>(`/staff/tenant/${tenantId}`)
      ]);
      setAppraisals(appRes.data || []);
      setStaffList(staffRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load staff appraisals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppraisals();
  }, [tenantId]);

  const handleCreateAppraisal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.staff_id || formData.performance_rating < 1 || formData.performance_rating > 5) {
      toast.error('Please select a staff member and enter a rating between 1.0 and 5.0.');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/staffappraisals', {
        tenant_id: tenantId,
        staff_id: formData.staff_id,
        appraisal_year: formData.appraisal_year,
        performance_rating: formData.performance_rating,
        is_teacher_of_the_month: formData.is_teacher_of_the_month,
        award_month: formData.award_month,
        recommended_increment_pct: formData.recommended_increment_pct,
        comments: formData.comments
      });

      toast.success('Performance Appraisal review created successfully.');
      setDrawerOpen(false);
      setFormData({
        staff_id: '',
        appraisal_year: new Date().getFullYear(),
        performance_rating: 4.5,
        is_teacher_of_the_month: false,
        award_month: '',
        recommended_increment_pct: 10,
        comments: ''
      });
      fetchAppraisals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not create appraisal review.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleApplyIncrement = async (id: string, staffName: string, newSalary: number) => {
    const result = await Swal.fire({
      title: 'Apply Salary Increment?',
      text: `Confirm updating ${staffName}'s basic salary to Rs. ${newSalary.toLocaleString()}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Yes, Apply Increment'
    });

    if (result.isConfirmed) {
      try {
        await api.post(`/staffappraisals/${id}/apply-increment`);
        toast.success(`Salary increment applied! New Basic Salary: Rs. ${newSalary.toLocaleString()}`);
        fetchAppraisals();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to apply salary increment.');
      }
    }
  };

  // PDF Merit Certificate & Appraisal Report Generator
  const printAppraisalCertificate = (app: StaffAppraisal) => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.setFont("helvetica", "bold");
    doc.text("RESTAURANT MANAGEMENT SYSTEM", 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text(app.is_teacher_of_the_month ? "CERTIFICATE OF MERIT & APPRAISAL" : "STAFF PERFORMANCE APPRAISAL REPORT", 105, 28, { align: "center" });

    doc.setDrawColor(220);
    doc.line(14, 34, 196, 34);

    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text(`Employee Name:`, 14, 44);
    doc.setFont("helvetica", "bold");
    doc.text(app.staff_name, 55, 44);

    doc.setFont("helvetica", "normal");
    doc.text(`Designation:`, 14, 52);
    doc.setFont("helvetica", "bold");
    doc.text(app.designation || 'Staff Member', 55, 52);

    doc.setFont("helvetica", "normal");
    doc.text(`Evaluation Year:`, 130, 44);
    doc.setFont("helvetica", "bold");
    doc.text(app.appraisal_year.toString(), 165, 44);

    doc.setFont("helvetica", "normal");
    doc.text(`Increment Status:`, 130, 52);
    if (app.is_increment_applied) {
      doc.setTextColor(16, 185, 129);
      doc.text("APPLIED", 165, 52);
    } else {
      doc.setTextColor(245, 158, 11);
      doc.text("PENDING APPROVAL", 165, 52);
    }

    doc.setTextColor(50);

    autoTable(doc, {
      startY: 62,
      head: [['Evaluation Criteria & Salary Revision', 'Details']],
      body: [
        ['Overall Performance Rating', `${app.performance_rating} / 5.0 Stars`],
        ['Teacher of the Month Award', app.is_teacher_of_the_month ? `YES (${app.award_month || 'Awarded'})` : 'No'],
        ['Recommended Salary Increment', `+${app.recommended_increment_pct}%`],
        ['Previous Basic Base Pay', `Rs. ${app.previous_basic_salary.toLocaleString()}`],
        ['Revised Proposed Basic Pay', `Rs. ${app.new_basic_salary.toLocaleString()}`],
        ['Evaluator Comments / Remarks', app.comments || 'Satisfactory annual performance review. Recommended for annual revision.']
      ],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: { 0: { fontStyle: 'bold' } }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 160;

    doc.setFontSize(10);
    doc.line(20, finalY + 30, 70, finalY + 30);
    doc.text("Evaluator / HOD Signature", 22, finalY + 35);

    doc.line(135, finalY + 30, 185, finalY + 30);
    doc.text("Principal / Director Signature", 137, finalY + 35);

    doc.save(`appraisal_${app.staff_name.replace(/\s+/g, '_')}_${app.appraisal_year}.pdf`);
    toast.success(`Appraisal report generated for ${app.staff_name}`);
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['Staff Name', 'Designation', 'Evaluation Year', 'Rating', 'Teacher of Month', 'Increment Pct', 'Previous Pay', 'New Pay', 'Status'];
    const rows = filteredAppraisals.map(a => [
      `"${a.staff_name.replace(/"/g, '""')}"`,
      `"${a.designation.replace(/"/g, '""')}"`,
      a.appraisal_year,
      a.performance_rating,
      a.is_teacher_of_the_month ? 'Yes' : 'No',
      `${a.recommended_increment_pct}%`,
      a.previous_basic_salary,
      a.new_basic_salary,
      a.is_increment_applied ? 'Applied' : 'Pending'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `staff_appraisals_registry_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Staff appraisals CSV downloaded');
  };

  // Export List PDF
  const exportListPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text("Staff Performance & Appraisals Registry", 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [['Staff Name', 'Designation', 'Rating', 'Teacher of Month', 'Increment %', 'Previous Salary', 'Revised Salary', 'Status']],
      body: filteredAppraisals.map(a => [
        a.staff_name,
        a.designation,
        `${a.performance_rating} / 5.0`,
        a.is_teacher_of_the_month ? '⭐ Yes' : 'No',
        `+${a.recommended_increment_pct}%`,
        `Rs. ${a.previous_basic_salary.toLocaleString()}`,
        `Rs. ${a.new_basic_salary.toLocaleString()}`,
        a.is_increment_applied ? 'Applied' : 'Pending'
      ]),
      styles: { fontSize: 9 }
    });
    doc.save(`staff_appraisals_registry_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Staff appraisals PDF registry downloaded');
  };

  const staffOptions: SearchableSelectOption[] = useMemo(() => {
    return staffList.map(s => ({
      value: s.id,
      label: `${s.first_name} ${s.last_name} (${s.designation || 'Staff'} - Current Basic: Rs. ${s.basic_salary.toLocaleString()})`
    }));
  }, [staffList]);

  // StatCards KPI Data
  const statsData: StatCardData[] = useMemo(() => {
    const totalEvaluated = appraisals.length;
    const totmCount = appraisals.filter(a => a.is_teacher_of_the_month).length;
    const incrementsApplied = appraisals.filter(a => a.is_increment_applied).length;
    const avgRating = totalEvaluated > 0
      ? (appraisals.reduce((sum, a) => sum + a.performance_rating, 0) / totalEvaluated).toFixed(1)
      : '0.0';

    return [
      {
        title: 'Evaluated Staff Reviews',
        value: `${totalEvaluated} Reviews`,
        icon: <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
        theme: 'brand'
      },
      {
        title: 'Teachers of the Month',
        value: `${totmCount} Awarded`,
        icon: <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
        theme: 'warning'
      },
      {
        title: 'Increments Processed',
        value: `${incrementsApplied} Applied`,
        icon: <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
        theme: 'success'
      },
      {
        title: 'Average Staff Rating',
        value: `${avgRating} / 5.0 ⭐`,
        icon: <Star className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
        theme: 'sky'
      }
    ];
  }, [appraisals]);

  // Filtered Appraisals
  const filteredAppraisals = useMemo(() => {
    return appraisals.filter(a => {
      if (statusFilter === 'applied' && !a.is_increment_applied) return false;
      if (statusFilter === 'pending' && a.is_increment_applied) return false;
      if (statusFilter === 'totm' && !a.is_teacher_of_the_month) return false;

      if (!globalFilter.trim()) return true;
      const q = globalFilter.toLowerCase();
      return a.staff_name.toLowerCase().includes(q) ||
        (a.designation && a.designation.toLowerCase().includes(q)) ||
        (a.comments && a.comments.toLowerCase().includes(q));
    });
  }, [appraisals, statusFilter, globalFilter]);

  // Table Columns Setup
  const columns = useMemo<ColumnDef<StaffAppraisal>[]>(() => [
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
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{name}</p>
                {row.original.is_teacher_of_the_month && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-full flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                    <Sparkles className="w-3 h-3 fill-amber-500 text-amber-500" />
                    TOTM
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{row.original.designation || 'Staff Member'}</p>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'performance_rating',
      header: 'Rating (out of 5)',
      cell: ({ row }) => {
        const rating = row.original.performance_rating;
        return (
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-100 dark:border-amber-900/40 w-fit">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-extrabold text-xs text-amber-700 dark:text-amber-300">{rating} / 5.0</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'recommended_increment_pct',
      header: 'Salary Increment Recommendation',
      cell: ({ row }) => (
        <div>
          <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
            +{row.original.recommended_increment_pct}% Increment
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Rs. {row.original.previous_basic_salary.toLocaleString()} ➔ <span className="font-bold text-gray-800 dark:text-gray-200">Rs. {row.original.new_basic_salary.toLocaleString()}</span>
          </p>
        </div>
      )
    },
    {
      accessorKey: 'is_increment_applied',
      header: 'Status',
      cell: ({ row }) => (
        row.original.is_increment_applied ? (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-extrabold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 w-fit">
            <ShieldCheck className="w-3.5 h-3.5" />
            APPLIED
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs font-extrabold border border-amber-200 dark:border-amber-800 flex items-center gap-1 w-fit">
            <Clock className="w-3.5 h-3.5" />
            PENDING APPROVAL
          </span>
        )
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
                label: 'Print Appraisal Certificate',
                icon: <Printer className="w-4 h-4 text-blue-500" />,
                onClick: () => printAppraisalCertificate(row.original)
              },
              {
                label: row.original.is_increment_applied ? 'Increment Already Applied' : 'Apply Salary Increment',
                icon: <TrendingUp className="w-4 h-4 text-emerald-500" />,
                onClick: () => {
                  if (!row.original.is_increment_applied) {
                    handleApplyIncrement(row.original.id, row.original.staff_name, row.original.new_basic_salary);
                  }
                },
                className: row.original.is_increment_applied ? 'opacity-40 cursor-not-allowed' : 'text-emerald-600 dark:text-emerald-400 font-bold'
              }
            ]}
          />
        </div>
      )
    }
  ], []);

  const table = useReactTable({
    data: filteredAppraisals,
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
        { label: 'Staff Appraisals & Performance' }
      ]} />

      {/* Main Header Banner Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-500" />
              Staff Appraisals & Performance Tracking
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Evaluate staff performance, award Teacher of the Month, and process annual salary increments.
            </p>
          </div>

          <button
            onClick={() => setDrawerOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all h-11 flex items-center justify-center gap-2 shadow-sm self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Appraisal Review</span>
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
              placeholder="Search appraisals by staff name or designation..."
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
                All ({appraisals.length})
              </button>
              <button
                onClick={() => setStatusFilter('totm')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'totm' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                ⭐ TOTM ({appraisals.filter(a => a.is_teacher_of_the_month).length})
              </button>
              <button
                onClick={() => setStatusFilter('applied')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'applied' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Applied ({appraisals.filter(a => a.is_increment_applied).length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'pending' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Pending ({appraisals.filter(a => !a.is_increment_applied).length})
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
            <p className="text-xs text-gray-500 dark:text-gray-400">Loading staff performance appraisals...</p>
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
                      No staff performance appraisal records found. Click "+ Create Appraisal Review" to add one.
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
            {table.getFilteredRowModel().rows.length} appraisal records
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

      {/* Slide-Over Drawer for Appraisal Review Creation */}
      <ProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Staff Performance Appraisal Review"
      >
        <form onSubmit={handleCreateAppraisal} className="space-y-5 p-2">
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
            <Label required>Performance Rating (1.0 - 5.0)</Label>
            <InputField
              type="number"
              step="0.1"
              min="1"
              max="5"
              required
              placeholder="e.g. 4.5"
              value={formData.performance_rating || ''}
              onChange={(e) => setFormData({ ...formData, performance_rating: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Award Teacher of the Month?
              </label>
              <input
                type="checkbox"
                className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                checked={formData.is_teacher_of_the_month}
                onChange={(e) => setFormData({ ...formData, is_teacher_of_the_month: e.target.checked })}
              />
            </div>
            {formData.is_teacher_of_the_month && (
              <InputField
                type="text"
                placeholder="Award Month (e.g. October 2026)"
                value={formData.award_month}
                onChange={(e) => setFormData({ ...formData, award_month: e.target.value })}
              />
            )}
          </div>

          <div>
            <Label required>Recommended Salary Increment (%)</Label>
            <InputField
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 10%"
              value={formData.recommended_increment_pct || ''}
              onChange={(e) => setFormData({ ...formData, recommended_increment_pct: parseFloat(e.target.value) || 0 })}
            />
            <span className="text-[11px] text-gray-400 block mt-1">
              Calculates the new proposed basic salary for annual revision.
            </span>
          </div>

          <div>
            <Label>Evaluation Remarks / Comments</Label>
            <InputField
              type="text"
              placeholder="e.g. Excellent student feedback, 98% attendance, active participation."
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
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
              <Award className="w-4 h-4" />
              <span>{submitLoading ? 'Processing...' : 'Save Appraisal Review'}</span>
            </button>
          </div>
        </form>
      </ProfileDrawer>

    </div>
  );
}
