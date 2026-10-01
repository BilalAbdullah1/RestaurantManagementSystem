import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import InputField from '../../components/form/input/InputField';
import SearchableSelect, { SearchableSelectOption } from '../../components/form/select/SearchableSelect';
import Label from '../../components/form/Label';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
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
  Layers, School, DollarSign, Plus, Search,
  FileDown, Download, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import Button from '../../components/ui/button/Button';

interface FeeStructure {
  id: string;
  class_id: string;
  class_name: string;
  fee_type_id: string;
  fee_type_name: string;
  frequency: string;
  category?: string;
  amount: number;
  created_at?: string;
}

interface LookupItem {
  id: string;
  name?: string;
  title?: string;
  is_current?: boolean;
}

interface FeeTypeLookup {
  id: string;
  name: string;
  frequency: string;
  is_active: boolean;
}

export default function FeeStructures() {
  const tenantId = localStorage.getItem("tenantId") || "";

  // Data States
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [academicYears, setAcademicYears] = useState<LookupItem[]>([]);
  const [classes, setClasses] = useState<LookupItem[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeTypeLookup[]>([]);

  // Filter States
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Drawer Form States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Table States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Single Form State
  const initialForm = {
    id: '',
    tenant_id: tenantId,
    academic_year_id: '',
    class_id: '',
    fee_type_id: '',
    category: 'Normal',
    amount: 0
  };
  const [formData, setFormData] = useState(initialForm);

  // Metadata Fetch
  useEffect(() => {
    if (!tenantId) return;
    const fetchMeta = async () => {
      try {
        const [yearsRes, classesRes, feesRes] = await Promise.all([
          api.get<LookupItem[]>(`/academicyears/tenant/${tenantId}`),
          api.get<LookupItem[]>(`/classes/tenant/${tenantId}`),
          api.get<FeeTypeLookup[]>(`/feetypes/tenant/${tenantId}`)
        ]);

        setAcademicYears(yearsRes.data || []);
        setClasses(classesRes.data || []);
        setFeeTypes((feesRes.data || []).filter(f => f.is_active));

        const currentYear = yearsRes.data?.find(y => y.is_current) || yearsRes.data?.[0];
        if (currentYear) {
          setFilterYear(currentYear.id);
          setFormData((prev) => ({ ...prev, academic_year_id: currentYear.id }));
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load setup metadata.');
      }
    };
    fetchMeta();
  }, [tenantId]);

  // Fetch Fee Structure Allocations
  const fetchStructures = async () => {
    if (!tenantId || !filterYear) return;
    setLoading(true);
    try {
      const res = await api.get<FeeStructure[]>(`/feestructures/tenant/${tenantId}/year/${filterYear}`);
      setStructures(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load class fee structures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filterYear) {
      fetchStructures();
    }
  }, [filterYear]);

  // Dropdown Options
  const yearOptions = useMemo((): SearchableSelectOption[] => academicYears.map(y => ({ value: y.id, label: y.title || '' })), [academicYears]);
  const classOptions = useMemo((): SearchableSelectOption[] => classes.map(c => ({ value: c.id, label: c.name || '' })), [classes]);
  const feeTypeOptions = useMemo((): SearchableSelectOption[] => feeTypes.map(f => ({ value: f.id, label: `${f.name} (${f.frequency})` })), [feeTypes]);

  // Open Drawer for Add
  const handleAddNew = () => {
    setFormData({ ...initialForm, academic_year_id: filterYear });
    setIsEditing(false);
    setDrawerOpen(true);
  };

  // Open Drawer for Edit
  const handleEdit = (structure: FeeStructure) => {
    setFormData({
      id: structure.id,
      tenant_id: tenantId,
      academic_year_id: filterYear,
      class_id: structure.class_id,
      fee_type_id: structure.fee_type_id,
      category: structure.category || 'Normal',
      amount: structure.amount
    });
    setIsEditing(true);
    setDrawerOpen(true);
  };

  // Delete Allocation Rule
  const handleDelete = async (id: string, className: string, feeName: string) => {
    const result = await Swal.fire({
      title: 'Remove Fee Allocation?',
      text: `Are you sure you want to remove "${feeName}" from ${className}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Remove'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/feestructures/${id}`);
        setStructures(prev => prev.filter(s => s.id !== id));
        toast.success('Fee allocation removed successfully.');
      } catch (err) {
        toast.error('Failed to delete fee allocation.');
      }
    }
  };

  // Form Submit Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing && (!formData.class_id || !formData.fee_type_id)) {
      toast.error('Please select both class and fee head.');
      return;
    }
    const activeYearId = formData.academic_year_id || filterYear || academicYears.find(y => y.is_current)?.id || academicYears[0]?.id;
    if (!activeYearId) {
      toast.error('Academic Session Year is required. Please select a session first.');
      return;
    }

    const payload = {
      ...formData,
      tenant_id: tenantId,
      academic_year_id: activeYearId,
      category: formData.category || 'Normal'
    };

    setSubmitLoading(true);
    try {
      if (isEditing) {
        await api.put(`/feestructures/${formData.id}`, { amount: formData.amount, category: formData.category || 'Normal' });
        toast.success('Fee allocation amount updated.');
      } else {
        await api.post('/feestructures', payload);
        toast.success('Fee head assigned to class successfully.');
      }
      setDrawerOpen(false);
      fetchStructures();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save fee allocation.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Cascading Filtered List
  const filteredStructures = useMemo(() => {
    return structures.filter(item => {
      if (filterClass && item.class_id !== filterClass) return false;
      if (filterCategory && (item.category || 'Normal') !== filterCategory) return false;
      if (globalFilter.trim()) {
        const q = globalFilter.toLowerCase();
        const cName = item.class_name ? item.class_name.toLowerCase() : '';
        const fName = item.fee_type_name ? item.fee_type_name.toLowerCase() : '';
        return cName.includes(q) || fName.includes(q);
      }
      return true;
    });
  }, [structures, filterClass, filterCategory, globalFilter]);

  // KPI Summary Calculation
  const statsData: StatCardData[] = useMemo(() => {
    const totalAllocations = filteredStructures.length;
    const uniqueClasses = new Set(filteredStructures.map(s => s.class_id)).size;
    const totalPool = filteredStructures.reduce((sum, s) => sum + (s.amount || 0), 0);
    const avgAmount = totalAllocations > 0 ? Math.round(totalPool / totalAllocations) : 0;

    return [
      {
        title: 'Fee Structure Rules',
        value: totalAllocations.toString(),
        icon: <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
        theme: 'brand'
      },
      {
        title: 'Classes Configured',
        value: uniqueClasses.toString(),
        icon: <School className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
        theme: 'indigo'
      },
      {
        title: 'Total Monthly Fee Pool',
        value: `Rs. ${totalPool.toLocaleString()}`,
        icon: <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
        theme: 'success'
      },
      {
        title: 'Average Head Amount',
        value: `Rs. ${avgAmount.toLocaleString()}`,
        icon: <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
        theme: 'purple'
      }
    ];
  }, [filteredStructures]);

  // Export PDF Report
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('Class Fee Structure Allocation Report', 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [['Class Name', 'Fee Head Category', 'Frequency', 'Student Category', 'Amount (PKR)']],
      body: filteredStructures.map(s => [
        s.class_name,
        s.fee_type_name,
        s.frequency,
        s.category || 'Normal',
        `Rs. ${s.amount.toLocaleString()}`
      ]),
      styles: { fontSize: 9 }
    });
    doc.save('class_fee_structures.pdf');
    toast.success('Fee structures PDF downloaded.');
  };

  // Export CSV Report
  const exportCSV = () => {
    const headers = ['Class Name', 'Fee Head Category', 'Frequency', 'Student Category', 'Amount (PKR)'];
    const rows = filteredStructures.map(s => [
      `"${s.class_name.replace(/"/g, '""')}"`,
      `"${s.fee_type_name.replace(/"/g, '""')}"`,
      s.frequency,
      s.category || 'Normal',
      s.amount
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "class_fee_structures.csv";
    link.click();
    toast.success('Fee structures CSV downloaded.');
  };

  // Columns Configuration
  const columns = useMemo<ColumnDef<FeeStructure>[]>(() => [
    {
      accessorKey: 'class_name',
      header: 'Class Name',
      cell: ({ row }) => (
        <div>
          <span className="font-bold text-gray-900 dark:text-white text-sm block">
            {row.original.class_name}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'fee_type_name',
      header: 'Fee Head Category',
      cell: ({ row }) => (
        <div>
          <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
            {row.original.fee_type_name}
          </span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
            Frequency: {row.original.frequency}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'category',
      header: 'Student Quota / Category',
      cell: ({ row }) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
          {row.original.category || 'Normal Student'}
        </span>
      )
    },
    {
      accessorKey: 'amount',
      header: 'Fee Amount (PKR)',
      cell: ({ row }) => (
        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
          Rs. {Number(row.original.amount).toLocaleString()}
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
                label: 'Edit Allocation Amount',
                icon: <DollarSign className="w-4 h-4 text-blue-500" />,
                onClick: () => handleEdit(row.original)
              },
              {
                label: 'Remove Allocation',
                icon: <DollarSign className="w-4 h-4 text-rose-500" />,
                onClick: () => handleDelete(row.original.id, row.original.class_name, row.original.fee_type_name)
              }
            ]}
          />
        </div>
      )
    }
  ], []);

  const table = useReactTable({
    data: filteredStructures,
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
        { label: 'Class Fee Structure Allocation' }
      ]} />

      {/* Main Header Banner Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <Layers className="w-6 h-6 text-blue-500" />
              Class Fee Structure Allocation
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Assign class-wise fee heads and amounts for the active academic session.
            </p>
          </div>

          <button
            onClick={handleAddNew}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all h-11 flex items-center justify-center gap-2 shadow-sm self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Fee Head to Class</span>
          </button>
        </div>
      </div>

      {/* Cascading Filter Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2 block">
              Academic Session Year *
            </label>
            <SearchableSelect
              options={yearOptions}
              value={filterYear}
              onChange={(val) => setFilterYear(val as string)}
              placeholder="Select Academic Year"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2 block">
              Filter by Class Scope
            </label>
            <SearchableSelect
              options={[{ value: '', label: 'All Classes Scope' }, ...classOptions]}
              value={filterClass}
              onChange={(val) => setFilterClass(val as string)}
              placeholder="All Classes"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2 block">
              Filter by Category Scope
            </label>
            <SearchableSelect
              options={[
                { value: '', label: 'All Student Categories' },
                { value: 'Normal', label: 'Normal (Standard Student)' },
                { value: 'Staff Child', label: 'Staff Child (50% Concession)' },
                { value: 'Orphan', label: 'Orphan / Welfare Quota' },
                { value: 'Merit', label: 'Merit Scholarship' },
                { value: 'Need-Based', label: 'Need-Based Financial Assistance' },
                { value: 'Special Quota', label: 'Special Quota' }
              ]}
              value={filterCategory}
              onChange={(val) => setFilterCategory(val as string)}
              placeholder="All Categories"
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
              placeholder="Search by class name or fee category..."
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
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 border border-blue-100 dark:border-blue-800">
                        <Layers className="w-8 h-8" />
                      </div>
                      <h3 className="text-base font-bold text-gray-800 dark:text-white mb-1">
                        No Fee Structures Configured Yet
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                        Assign monthly tuition fees, admission charges, or lab funds to classes for this academic session.
                      </p>
                      <button
                        onClick={handleAddNew}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Assign First Fee Head</span>
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
            {table.getFilteredRowModel().rows.length} fee rules
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

      {/* Slide-Over Drawer for Fee Structure Allocation */}
      <ProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={isEditing ? 'Edit Fee Allocation Amount' : 'Assign Fee Head Amount to Class'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-5 p-2">
          {!isEditing && (
            <>
              <div>
                <Label required>Target Class</Label>
                <SearchableSelect
                  options={classOptions}
                  value={formData.class_id}
                  onChange={(val) => setFormData({ ...formData, class_id: val as string })}
                  placeholder="Select Target Class..."
                />
              </div>

              <div>
                <Label required>Fee Head Category</Label>
                <SearchableSelect
                  options={feeTypeOptions}
                  value={formData.fee_type_id}
                  onChange={(val) => setFormData({ ...formData, fee_type_id: val as string })}
                  placeholder="Select Fee Head (e.g. Tuition Fee)..."
                />
              </div>
            </>
          )}

          <div>
            <Label required>Student Quota / Category</Label>
            <SearchableSelect
              options={[
                { value: 'Normal', label: 'Normal (Standard Student)' },
                { value: 'Staff Child', label: 'Staff Child (50% Concession)' },
                { value: 'Orphan', label: 'Orphan / Welfare Quota' },
                { value: 'Merit', label: 'Merit Scholarship' },
                { value: 'Need-Based', label: 'Need-Based Financial Assistance' },
                { value: 'Special Quota', label: 'Special Quota' }
              ]}
              value={formData.category}
              onChange={(val) => setFormData({ ...formData, category: val as string })}
            />
          </div>

          <div>
            <Label required>Fee Amount (PKR)</Label>
            <InputField
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              placeholder="e.g. 12000"
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
              {isEditing ? 'Update Fee Amount' : 'Save Fee Allocation'}
            </Button>
          </div>
        </form>
      </ProfileDrawer>
    </div>
  );
}