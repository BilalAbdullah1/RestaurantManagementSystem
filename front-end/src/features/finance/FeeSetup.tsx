import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import InputField from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import SearchableSelect from '../../components/form/select/SearchableSelect';
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
  CreditCard, CheckCircle2, XCircle, Plus, Search, FileDown, 
  Download, Loader2, ChevronLeft, ChevronRight, Edit3, Trash2, ToggleLeft, ToggleRight, Calendar
} from 'lucide-react';

interface FeeType {
  id?: string;
  tenant_id: string;
  name: string;
  description: string;
  frequency: string;
  is_active: boolean;
  created_at?: string;
}

export default function FeeSetup() {
  const tenantId = localStorage.getItem("tenantId") || "";

  // States
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Table States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Form State
  const initialForm: FeeType = {
    tenant_id: tenantId,
    name: '',
    description: '',
    frequency: 'Monthly',
    is_active: true
  };
  const [formData, setFormData] = useState<FeeType>(initialForm);

  const fetchFeeTypes = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await api.get<FeeType[]>(`/feetypes/tenant/${tenantId}`);
      setFeeTypes(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load fee types.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeTypes();
  }, [tenantId]);

  const handleAddNew = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setDrawerOpen(true);
  };

  const handleEdit = (feeType: FeeType) => {
    setFormData({ ...feeType });
    setIsEditing(true);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Delete Fee Head?',
      text: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/feetypes/${id}`);
        setFeeTypes(prev => prev.filter(f => f.id !== id));
        toast.success('Fee head removed successfully.');
      } catch (err) {
        toast.error('Failed to delete fee head.');
      }
    }
  };

  const handleToggleStatus = async (feeType: FeeType) => {
    try {
      const updatedRecord = { ...feeType, is_active: !feeType.is_active };
      await api.put(`/feetypes/${feeType.id}`, updatedRecord);
      setFeeTypes(prev => prev.map(f => f.id === feeType.id ? updatedRecord : f));
      toast.success(`${feeType.name} is now ${updatedRecord.is_active ? 'Active' : 'Inactive'}.`);
    } catch (err) {
      toast.error('Failed to update fee status.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please provide a fee head name.');
      return;
    }

    setSubmitLoading(true);
    try {
      if (isEditing) {
        await api.put(`/feetypes/${formData.id}`, formData);
        toast.success('Fee head updated successfully.');
      } else {
        await api.post('/feetypes', formData);
        toast.success('New fee head added.');
      }
      setDrawerOpen(false);
      fetchFeeTypes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save fee head.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // KPI Stats Setup
  const statsData: StatCardData[] = useMemo(() => {
    const total = feeTypes.length;
    const active = feeTypes.filter(f => f.is_active).length;
    const monthly = feeTypes.filter(f => f.frequency === 'Monthly').length;
    const annual = feeTypes.filter(f => f.frequency === 'Annually' || f.frequency === 'One-Time').length;

    return [
      {
        title: 'Total Fee Heads',
        value: `${total} Categories`,
        icon: <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
        theme: 'brand'
      },
      {
        title: 'Active Fee Heads',
        value: `${active} Active`,
        icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
        theme: 'success'
      },
      {
        title: 'Monthly Recurring',
        value: `${monthly} Heads`,
        icon: <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
        theme: 'purple'
      },
      {
        title: 'Annual / One-Time',
        value: `${annual} Heads`,
        icon: <CreditCard className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
        theme: 'warning'
      }
    ];
  }, [feeTypes]);

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('Fee Head Categories Setup Report', 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [['Fee Head Name', 'Description', 'Frequency', 'Status']],
      body: filteredFeeTypes.map(f => [
        f.name,
        f.description || '-',
        f.frequency,
        f.is_active ? 'Active' : 'Inactive'
      ]),
      styles: { fontSize: 9 }
    });
    doc.save(`fee_types_setup_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Fee setup PDF downloaded.');
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['Fee Head Name', 'Description', 'Frequency', 'Status'];
    const rows = filteredFeeTypes.map(f => [
      `"${f.name.replace(/"/g, '""')}"`,
      `"${(f.description || '').replace(/"/g, '""')}"`,
      f.frequency,
      f.is_active ? 'Active' : 'Inactive'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `fee_types_setup_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Fee setup CSV downloaded.');
  };

  // Filtered Fee Types
  const filteredFeeTypes = useMemo(() => {
    return feeTypes.filter(f => {
      if (!globalFilter.trim()) return true;
      const q = globalFilter.toLowerCase();
      return f.name.toLowerCase().includes(q) || (f.description && f.description.toLowerCase().includes(q));
    });
  }, [feeTypes, globalFilter]);

  // Datatable Columns
  const columns = useMemo<ColumnDef<FeeType>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Fee Head Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center border border-blue-100 dark:border-blue-800 shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{row.original.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">{row.original.description || 'No description'}</p>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'frequency',
      header: 'Billing Frequency',
      cell: ({ row }) => {
        const freq = row.original.frequency;
        const color = freq === 'Monthly' 
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800' 
          : freq === 'Annually' 
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800' 
          : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800';

        return (
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${color}`}>
            {freq}
          </span>
        );
      }
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        row.original.is_active ? (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-extrabold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs font-extrabold border border-rose-200 dark:border-rose-800 flex items-center gap-1 w-fit">
            <XCircle className="w-3.5 h-3.5" /> INACTIVE
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
                label: 'Edit Fee Head',
                icon: <Edit3 className="w-4 h-4 text-blue-500" />,
                onClick: () => handleEdit(row.original)
              },
              {
                label: row.original.is_active ? 'Deactivate Head' : 'Activate Head',
                icon: row.original.is_active ? <ToggleLeft className="w-4 h-4 text-amber-500" /> : <ToggleRight className="w-4 h-4 text-emerald-500" />,
                onClick: () => handleToggleStatus(row.original)
              },
              {
                label: 'Delete Fee Head',
                icon: <Trash2 className="w-4 h-4 text-red-500" />,
                onClick: () => handleDelete(row.original.id!, row.original.name),
                className: 'text-red-600 dark:text-red-400'
              }
            ]}
          />
        </div>
      )
    }
  ], []);

  const table = useReactTable({
    data: filteredFeeTypes,
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
        { label: 'Fee Head Setup' }
      ]} />

      {/* Main Header Banner Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-500" />
              Customizable Fee Head Setup
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure class-wise, annual, monthly, and admission fee categories.
            </p>
          </div>

          <button 
            onClick={handleAddNew}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all h-11 flex items-center justify-center gap-2 shadow-sm self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Fee Head</span>
          </button>
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
              placeholder="Search fee heads by name or description..."
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
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-400 italic">
                    No fee heads configured. Click "+ Add Fee Head" to create one.
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
            {table.getFilteredRowModel().rows.length} fee heads
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

      {/* Slide-Over Drawer for Fee Head Setup */}
      <ProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={isEditing ? 'Edit Fee Head Category' : 'Create New Fee Head Category'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-5 p-2">
          <div>
            <Label required>Fee Head Name</Label>
            <InputField 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Tuition Fee, Security Deposit, Computer Lab Fee"
              required
            />
          </div>

          <div>
            <Label required>Billing Frequency</Label>
            <SearchableSelect 
              options={[
                { value: 'Monthly', label: 'Monthly (Recurring Every Month)' },
                { value: 'Annually', label: 'Annually (Once Per Year)' },
                { value: 'One-Time', label: 'One-Time (On Admission / Registration)' }
              ]}
              value={formData.frequency}
              onChange={(val) => setFormData({ ...formData, frequency: val as string })}
            />
          </div>

          <div>
            <Label>Description / Notes</Label>
            <textarea
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide context for accountants and parents..."
            />
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800">
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
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              {submitLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEditing ? 'Save Changes' : 'Create Fee Head'}</span>
            </button>
          </div>
        </form>
      </ProfileDrawer>

    </div>
  );
}