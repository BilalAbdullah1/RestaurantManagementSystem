import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import PageMeta from '../../components/common/PageMeta';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import { toast } from '../../components/ui/Toast';
import { Layers, Hash, GraduationCap, CheckCircle, Download, Edit3, Trash2, Eye } from 'lucide-react';
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
  SortingState,
} from '@tanstack/react-table';

interface SchoolClass {
  id?: string;
  tenant_id: string;
  name: string;
  code: string;
  created_at?: string;
}

const initialFormState = (tenantId: string): SchoolClass => ({
  tenant_id: tenantId,
  name: '',
  code: ''
});

export default function Classes() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  const tenantId = localStorage.getItem("tenantId") || "";
  const [formData, setFormData] = useState<SchoolClass>(initialFormState(tenantId));

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    fetchClasses();
  }, [tenantId]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get<SchoolClass[]>(`/classes/tenant/${tenantId}`);
      setClasses(response.data);
    } catch (err: any) {
      toast.error('Unable to load classes directory.');
    } finally {
      setLoading(false);
    }
  };

  const openEditView = (schoolClass: SchoolClass) => {
    setEditingClass(schoolClass);
    setFormData({ ...schoolClass, code: schoolClass.code ?? '' });
    setIsEditing(true);
    setIsViewing(false);
    setIsFormDrawerOpen(true);
  };

  const openAddView = () => {
    setEditingClass(null);
    setFormData(initialFormState(tenantId));
    setIsEditing(false);
    setIsViewing(false);
    setIsFormDrawerOpen(true);
  };

  const openDetailView = (schoolClass: SchoolClass) => {
    setEditingClass(schoolClass);
    setFormData({ ...schoolClass, code: schoolClass.code ?? '' });
    setIsEditing(false);
    setIsViewing(true);
    setIsFormDrawerOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Class Name is required.');
      return;
    }

    setSubmitLoading(true);
    try {
      if (isEditing && editingClass && editingClass.id) {
        await api.put(`/classes/${editingClass.id}`, formData);
        toast.success('Class updated successfully.');
      } else {
        await api.post('/classes', formData);
        toast.success('New class created successfully.');
      }
      setIsFormDrawerOpen(false);
      fetchClasses();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Please review the form and try again.";
      toast.error(errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Classes Directory Report', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Class Name', 'Class Short Code']],
      body: classes.map(c => [
        c.name,
        c.code || 'N/A'
      ]),
    });
    doc.save('Classes_Directory.pdf');
  };

  const exportCSV = () => {
    const headers = ['Class Name', 'Class Short Code'];
    const csvRows = classes.map(c => [
      c.name.replace(/,/g, ' '),
      c.code || ''
    ]);
    const csvContent = [headers, ...csvRows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Classes_Directory.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteClass = async (schoolClass: SchoolClass) => {
    if (!window.confirm(`Are you sure you want to delete class "${schoolClass.name}"?`)) return;
    try {
      await api.delete(`/classes/${schoolClass.id}`);
      toast.success('Class deleted successfully.');
      fetchClasses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not delete this class.");
    }
  };

  const codedClassesCount = useMemo(() => classes.filter(c => !!c.code).length, [classes]);

  const stats: StatCardData[] = useMemo(() => [
    { title: 'Total Enrolled Classes', value: `${classes.length} Classes`, icon: <Layers className="w-5 h-5 text-brand-500" />, theme: 'brand' as const },
    { title: 'Coded Grade Levels', value: `${codedClassesCount} Grades`, icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, theme: 'success' as const },
    { title: 'Standard Forms', value: `${classes.length - codedClassesCount} Forms`, icon: <GraduationCap className="w-5 h-5 text-indigo-500" />, theme: 'indigo' as const },
  ], [classes, codedClassesCount]);

  const columns = useMemo<ColumnDef<SchoolClass>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Class Name',
        cell: info => (
          <div className="font-bold text-gray-900 dark:text-white">
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: 'code',
        header: 'Class Short Code',
        cell: info => {
          const val = info.getValue() as string;
          return val ? (
            <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
              <Hash className="w-3 h-3 text-brand-500" />
              {val}
            </span>
          ) : (
            <span className="text-xs text-gray-400 italic">No code</span>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: info => {
          const rowData = info.row.original;
          return (
            <div className="flex justify-end">
              <ActionMenu
                items={[
                  {
                    label: 'View Class Profile',
                    icon: <Eye className="w-4 h-4 text-blue-500" />,
                    onClick: () => openDetailView(rowData),
                  },
                  {
                    label: 'Edit Class Details',
                    icon: <Edit3 className="w-4 h-4 text-emerald-500" />,
                    onClick: () => openEditView(rowData),
                  },
                  {
                    label: 'Delete Class',
                    icon: <Trash2 className="w-4 h-4 text-rose-500" />,
                    onClick: () => deleteClass(rowData),
                  },
                ]}
              />
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: classes,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <PageMeta title="Classes Directory" description="School Class Grade Management Portal" />

      <div className="w-full space-y-6 animate-in fade-in duration-300">
        <Breadcrumb items={[{ label: 'Academics' }, { label: 'Classes Directory' }]} />

        {/* HEADER */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-brand-500" /> Classes Directory
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage academic grade levels and class designations.</p>
          </div>

          <Button variant="primary" onClick={openAddView} className="flex items-center gap-2">
            + Add New Class
          </Button>
        </div>

        {/* KPI STATS */}
        <StatCards stats={stats} loading={loading} />

        {/* MAIN TABLE CONTAINER */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          {/* Toolbar Header */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">Classes Ledger</h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-64">
                <Input
                  type="text"
                  placeholder="Search classes..."
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
              </div>
              <button onClick={exportPDF} title="Export to PDF" className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors h-10 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={exportCSV} title="Export to CSV" className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors h-10 flex items-center justify-center">
                CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[250px]">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none"
                      >
                        <div className={`flex items-center ${header.id === 'actions' ? 'justify-end' : ''}`}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <span className="ml-1 text-brand-500">▲</span>,
                            desc: <span className="ml-1 text-brand-500">▼</span>,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
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
                    <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
                      <div className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3 text-2xl">
                          🏫
                        </div>
                        <h4 className="font-bold text-gray-800 dark:text-white mb-1">No Academic Classes Found</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mb-4">
                          Define your grade levels (e.g. Nursery, KG, Grade 1 to 10) to organize students and timetables.
                        </p>
                        <Button variant="primary" size="sm" onClick={openAddView} className="flex items-center gap-1.5">
                          + Add First Class
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Rows per page:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
                className="h-9 px-3 rounded-lg border border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
              >
                {[10, 20, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>

            {table.getPageCount() > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 transition-all cursor-pointer">
                  Previous
                </button>
                <span className="text-xs text-gray-400">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 transition-all cursor-pointer">
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PROFILE DRAWER FORM */}
        <ProfileDrawer
          isOpen={isFormDrawerOpen}
          onClose={() => setIsFormDrawerOpen(false)}
          title={isViewing ? 'Class Profile Details' : isEditing ? 'Update Class Details' : 'Create New Class'}
        >
          {isViewing ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <Label>Class Name</Label>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formData.name}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <Label>Class Short Code</Label>
                <p className="font-mono text-sm text-gray-700 dark:text-gray-300">{formData.code || 'None'}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <Label required>Class Name</Label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Grade 10 or O-Levels"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Class Short Code (Optional)</Label>
                <Input
                  type="text"
                  placeholder="e.g. G10 or OL"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                <Button variant="outline" onClick={() => setIsFormDrawerOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  loading={submitLoading}
                  loadingText="Saving..."
                >
                  {isEditing ? 'Save Changes' : 'Create Class'}
                </Button>
              </div>
            </form>
          )}
        </ProfileDrawer>
      </div>
    </>
  );
}
