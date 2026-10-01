import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
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
  Award, Percent, DollarSign, Plus, Search, FileDown, 
  Download, Loader2, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Trash2, Edit3
} from 'lucide-react';
import Button from '../../components/ui/button/Button';

interface FeeConcessionItem {
  id: string;
  tenant_id: string;
  student_id: string;
  student_name?: string;
  fee_type_id: string;
  fee_type_name?: string;
  name: string;
  discount_type: 'Percentage' | 'FixedAmount' | string;
  discount_value: number;
  is_active: boolean;
  created_at?: string;
}

interface StudentLookup {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  category?: string;
}

interface FeeTypeLookup {
  id: string;
  name: string;
}

export default function FeeConcessionsManager() {
  const tenantId = localStorage.getItem("tenantId") || "";

  const [searchParams] = useSearchParams();
  const [concessions, setConcessions] = useState<FeeConcessionItem[]>([]);
  const [students, setStudents] = useState<StudentLookup[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeTypeLookup[]>([]);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Table States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [formData, setFormData] = useState({
    student_id: '',
    fee_type_id: '',
    name: 'Merit Scholarship',
    discount_type: 'Percentage',
    discount_value: 25
  });

  const fetchData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [concRes, stuRes, feeRes] = await Promise.all([
        api.get<FeeConcessionItem[]>(`/feeconcessions/tenant/${tenantId}`),
        api.get<StudentLookup[]>(`/students/tenant/${tenantId}`),
        api.get<FeeTypeLookup[]>(`/feetypes/tenant/${tenantId}`)
      ]);
      setConcessions(concRes.data || []);
      setStudents(stuRes.data || []);
      setFeeTypes(feeRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load scholarship and concessions data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  // Deep linking: Auto-open grant drawer if ?action=new in URL
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        student_id: '',
        fee_type_id: '',
        name: 'Merit Scholarship',
        discount_type: 'Percentage',
        discount_value: 25
      });
      setDrawerOpen(true);
    }
  }, [searchParams]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && editingId) {
      // Edit existing concession
      if (formData.discount_value <= 0) {
        toast.error('Please enter a valid discount value greater than 0.');
        return;
      }
      setSubmitLoading(true);
      try {
        await api.put(`/feeconcessions/${editingId}`, {
          name: formData.name,
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          is_active: true
        });
        toast.success('Concession updated successfully.');
        setDrawerOpen(false);
        setIsEditing(false);
        setEditingId(null);
        fetchData();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to update concession.');
      } finally {
        setSubmitLoading(false);
      }
      return;
    }

    if (!formData.student_id || !formData.fee_type_id) {
      toast.error('Please select both student and fee head.');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/feeconcessions', {
        tenant_id: tenantId,
        student_id: formData.student_id,
        fee_type_id: formData.fee_type_id,
        name: formData.name,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value
      });

      toast.success('Scholarship / Concession granted successfully.');
      setDrawerOpen(false);
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        student_id: '',
        fee_type_id: '',
        name: 'Merit Scholarship',
        discount_type: 'Percentage',
        discount_value: 25
      });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to grant concession.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Revoke Concession?',
      text: `Are you sure you want to revoke "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Revoke'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/feeconcessions/${id}`);
        toast.success('Scholarship record revoked.');
        fetchData();
      } catch (err) {
        toast.error('Could not revoke concession.');
      }
    }
  };

  const studentOptions: SearchableSelectOption[] = useMemo(() => students.map(s => ({
    value: s.id,
    label: `${s.first_name || ''} ${s.last_name || ''} (${s.admission_number || 'N/A'}) — [Quota: ${s.category || 'Normal'}]`.trim()
  })), [students]);

  const feeTypeOptions: SearchableSelectOption[] = useMemo(() => feeTypes.map(f => ({
    value: f.id,
    label: f.name
  })), [feeTypes]);

  // Filtered Concessions
  const filteredConcessions = useMemo(() => {
    return concessions.filter(c => {
      if (!globalFilter.trim()) return true;
      const q = globalFilter.toLowerCase();
      const name = c.name ? c.name.toLowerCase() : '';
      const stuName = c.student_name ? c.student_name.toLowerCase() : '';
      const feeName = c.fee_type_name ? c.fee_type_name.toLowerCase() : '';
      return name.includes(q) || stuName.includes(q) || feeName.includes(q);
    });
  }, [concessions, globalFilter]);

  // KPI Stats Setup
  const statsData: StatCardData[] = useMemo(() => {
    const total = concessions.length;
    const percent = concessions.filter(c => c.discount_type === 'Percentage').length;
    const flat = concessions.filter(c => c.discount_type === 'FixedAmount').length;
    const active = concessions.filter(c => c.is_active).length;

    return [
      {
        title: 'Total Granted Concessions',
        value: `${total} Granted`,
        icon: <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
        theme: 'purple'
      },
      {
        title: 'Active Percent Discounts',
        value: `${percent} % Discounts`,
        icon: <Percent className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
        theme: 'brand'
      },
      {
        title: 'Flat Amount Discounts',
        value: `${flat} Flat Head Rules`,
        icon: <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
        theme: 'success'
      },
      {
        title: 'Active Quotas',
        value: `${active} Active`,
        icon: <CheckCircle2 className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
        theme: 'sky'
      }
    ];
  }, [concessions]);

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('Fee Concessions & Scholarships Registry', 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [['Scholarship Title', 'Discount Type & Value', 'Status']],
      body: filteredConcessions.map(c => [
        c.name,
        c.discount_type === 'Percentage' ? `${c.discount_value}% OFF` : `Rs. ${c.discount_value} FLAT`,
        c.is_active ? 'Active' : 'Inactive'
      ]),
      styles: { fontSize: 9 }
    });
    doc.save(`fee_concessions_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Fee concessions PDF downloaded.');
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['Scholarship Title', 'Discount Type', 'Discount Value', 'Status'];
    const rows = filteredConcessions.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      c.discount_type,
      c.discount_value,
      c.is_active ? 'Active' : 'Inactive'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `fee_concessions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Fee concessions CSV downloaded.');
  };

  // Columns Configuration
  const columns = useMemo<ColumnDef<FeeConcessionItem>[]>(() => [
    {
      accessorKey: 'student_name',
      header: 'Student',
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{row.original.student_name || 'N/A'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400"></p>
        </div>
      )
    },
    {
      accessorKey: 'name',
      header: 'Scholarship / Concession Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 font-extrabold text-xs flex items-center justify-center border border-purple-100 dark:border-purple-800 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{row.original.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{row.original.fee_type_name || ''}</p>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'discount_type',
      header: 'Discount Value',
      cell: ({ row }) => {
        const item = row.original;
        const color = item.discount_type === 'Percentage'
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800'
          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${color}`}>
            {item.discount_type === 'Percentage' ? `${item.discount_value}% OFF` : `Rs. ${item.discount_value} FLAT`}
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
                label: 'Edit Discount Value',
                icon: <Edit3 className="w-4 h-4 text-blue-500" />,
                onClick: () => {
                  setFormData({
                    student_id: row.original.student_id,
                    fee_type_id: row.original.fee_type_id,
                    name: row.original.name,
                    discount_type: row.original.discount_type,
                    discount_value: row.original.discount_value
                  });
                  setEditingId(row.original.id);
                  setIsEditing(true);
                  setDrawerOpen(true);
                }
              },
              {
                label: 'Revoke Concession',
                icon: <Trash2 className="w-4 h-4 text-red-500" />,
                onClick: () => handleDelete(row.original.id, row.original.name),
                className: 'text-red-600 dark:text-red-400'
              }
            ]}
          />
        </div>
      )
    }
  ], []);

  const table = useReactTable({
    data: filteredConcessions,
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
        { label: 'Fee Concessions & Scholarships' }
      ]} />

      {/* Main Header Banner Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-500" />
              Scholarships & Fee Concessions
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage merit-based scholarships, orphan quotas, and staff-child discount approvals.
            </p>
          </div>

          <button 
            onClick={() => setDrawerOpen(true)}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all h-11 flex items-center justify-center gap-2 shadow-sm self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Grant Scholarship / Discount</span>
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
              placeholder="Search concessions by title or student name..."
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
                  <td colSpan={columns.length} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 flex items-center justify-center mb-3 shadow-inner">
                        <Award className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">
                        No Concessions or Scholarships Found
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                        Assign merit scholarships, need-based fee remissions, or sibling discounts to students.
                      </p>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditingId(null);
                          setFormData({
                            student_id: '',
                            fee_type_id: '',
                            name: 'Merit Scholarship',
                            discount_type: 'Percentage',
                            discount_value: 25
                          });
                          setDrawerOpen(true);
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 shadow-sm transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Grant Scholarship / Discount
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
            {table.getFilteredRowModel().rows.length} granted concessions
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
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

      {/* Slide-Over Drawer for Granting Concession */}
      <ProfileDrawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setIsEditing(false); setEditingId(null); }}
        title={isEditing ? 'Edit Concession Discount Value' : 'Grant Fee Scholarship / Concession'}
      >
        <form onSubmit={handleCreate} className="space-y-5 p-2">
          {!isEditing && (
            <>
              <div>
                <Label required>Select Student Member</Label>
                <SearchableSelect 
                  options={studentOptions}
                  value={formData.student_id}
                  onChange={(val) => setFormData({ ...formData, student_id: val as string })}
                  placeholder="Search Student Name / Admission #"
                />
              </div>

              <div>
                <Label required>Target Fee Head Category</Label>
                <SearchableSelect 
                  options={feeTypeOptions}
                  value={formData.fee_type_id}
                  onChange={(val) => setFormData({ ...formData, fee_type_id: val as string })}
                  placeholder="Select Tuition Fee / Composite Head..."
                />
              </div>
            </>
          )}

          <div>
            <Label required>Scholarship / Quota Category</Label>
            <SearchableSelect 
              options={[
                { value: 'Merit Scholarship', label: '🏆 Merit Academic Scholarship' },
                { value: 'Orphan Quota', label: '❤️ Orphan Welfare Discount' },
                { value: 'Staff Child Discount', label: '👨‍🏫 Staff & Teacher Child Discount' },
                { value: 'Need-based Financial Aid', label: '🤝 Need-based Financial Aid' }
              ]}
              value={formData.name}
              onChange={(val) => setFormData({ ...formData, name: val as string })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label required>Discount Mechanism</Label>
              <SearchableSelect 
                options={[
                  { value: 'Percentage', label: '% Percentage OFF' },
                  { value: 'FixedAmount', label: 'Rs. Fixed Flat Amount' }
                ]}
                value={formData.discount_type}
                onChange={(val) => setFormData({ ...formData, discount_type: val as string })}
              />
            </div>

            <div>
              <Label required>{formData.discount_type === 'Percentage' ? 'Discount %' : 'Flat Amount (Rs.)'}</Label>
              <InputField 
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                placeholder={formData.discount_type === 'Percentage' ? 'e.g. 25' : 'e.g. 2000'}
                required
              />
            </div>
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
              loadingText="Approving..."
            >
              Approve Concession
            </Button>
          </div>
        </form>
      </ProfileDrawer>

    </div>
  );
}

