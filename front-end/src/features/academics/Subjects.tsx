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
import SearchableSelect from '../../components/form/select/SearchableSelect';
import { toast } from '../../components/ui/Toast';
import { BookOpen, Star, Beaker, Download, Edit3, Trash2, Eye, Hash, ShieldAlert } from 'lucide-react';
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

interface Subject {
  id?: string;
  tenant_id: string;
  name: string;
  code?: string;
  is_elective: boolean;
  elective_group_name?: string;
}

const ELECTIVE_GROUPS = [
  { value: 'Group A: Pre-Medical (Biology & Life Sciences)', label: 'Group A: Pre-Medical (Biology & Life Sciences)' },
  { value: 'Group B: Pre-Engineering (Mathematics & Physics)', label: 'Group B: Pre-Engineering (Mathematics & Physics)' },
  { value: 'Group C: Computer Science & IT', label: 'Group C: Computer Science & IT' },
  { value: 'Group D: Commerce & Economics', label: 'Group D: Commerce & Economics' },
  { value: 'Group E: Humanities & Social Sciences', label: 'Group E: Humanities & Social Sciences' },
  { value: 'Group F: Fine Arts & Design', label: 'Group F: Fine Arts & Design' }
];

const initialFormState = (tenantId: string): Subject => ({
  tenant_id: tenantId,
  name: '',
  code: '',
  is_elective: false,
  elective_group_name: ''
});

export default function Subjects() {
  const tenantId = localStorage.getItem("tenantId") || "";

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'core' | 'elective'>('all');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<Subject>(initialFormState(tenantId));

  useEffect(() => {
    if (!tenantId) { setLoading(false); return; }
    fetchSubjects();
  }, [tenantId]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get<Subject[]>(`/subjects/tenant/${tenantId}`);
      setSubjects(res.data || []);
    } catch {
      toast.error('Unable to load subjects directory.');
    } finally {
      setLoading(false);
    }
  };

  const coreCount = useMemo(() => subjects.filter(s => !s.is_elective).length, [subjects]);
  const electiveCount = useMemo(() => subjects.filter(s => s.is_elective).length, [subjects]);

  const filteredSubjects = useMemo(() => {
    if (activeTab === 'all') return subjects;
    return subjects.filter(s => s.is_elective === (activeTab === 'elective'));
  }, [subjects, activeTab]);

  const openAddView = () => {
    setEditingSubject(null);
    setFormData(initialFormState(tenantId));
    setIsEditing(false);
    setIsViewing(false);
    setIsFormDrawerOpen(true);
  };

  const openEditView = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({ ...subject, code: subject.code ?? '', elective_group_name: subject.elective_group_name ?? '' });
    setIsEditing(true);
    setIsViewing(false);
    setIsFormDrawerOpen(true);
  };

  const openDetailView = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({ ...subject, code: subject.code ?? '', elective_group_name: subject.elective_group_name ?? '' });
    setIsEditing(false);
    setIsViewing(true);
    setIsFormDrawerOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Subject Name is required.');
      return;
    }
    if (formData.is_elective && !formData.elective_group_name) {
      toast.error('Please assign an Elective Choice Group for optional subjects.');
      return;
    }

    setSubmitLoading(true);
    try {
      if (isEditing && editingSubject && editingSubject.id) {
        await api.put(`/subjects/${editingSubject.id}`, formData);
        toast.success('Subject updated successfully.');
      } else {
        await api.post('/subjects', formData);
        toast.success('New subject created successfully.');
      }
      setIsFormDrawerOpen(false);
      fetchSubjects();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Please review the form and try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Subjects Directory Report', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Subject Name', 'Subject Code', 'Classification', 'Elective Choice Group']],
      body: filteredSubjects.map(s => [
        s.name,
        s.code || 'N/A',
        s.is_elective ? 'Elective Subject' : 'Compulsory Core',
        s.is_elective ? (s.elective_group_name || 'Unassigned Group') : '-'
      ]),
    });
    doc.save('Subjects_Directory.pdf');
  };

  const exportCSV = () => {
    const headers = ['Subject Name', 'Subject Code', 'Classification', 'Elective Choice Group'];
    const csvRows = filteredSubjects.map(s => [
      s.name.replace(/,/g, ' '),
      (s.code || '').replace(/,/g, ' '),
      s.is_elective ? 'Elective' : 'Core',
      s.is_elective ? (s.elective_group_name || 'N/A').replace(/,/g, ' ') : '-'
    ]);
    const csvContent = [headers, ...csvRows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Subjects_Directory.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteSubject = async (subject: Subject) => {
    if (!window.confirm(`Are you sure you want to delete subject "${subject.name}"?`)) return;
    try {
      await api.delete(`/subjects/${subject.id}`);
      toast.success('Subject deleted successfully.');
      fetchSubjects();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not delete subject.');
    }
  };

  const stats: StatCardData[] = useMemo(() => [
    { title: 'Total Registered Subjects', value: `${subjects.length} Subjects`, icon: <BookOpen className="w-5 h-5 text-brand-500" />, theme: 'brand' as const },
    { title: 'Compulsory Core Subjects', value: `${coreCount} Core`, icon: <Beaker className="w-5 h-5 text-emerald-500" />, theme: 'success' as const },
    { title: 'Optional Elective Courses', value: `${electiveCount} Electives`, icon: <Star className="w-5 h-5 text-amber-500" />, theme: 'warning' as const },
  ], [subjects, coreCount, electiveCount]);

  const columns = useMemo<ColumnDef<Subject>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Subject Name',
        cell: info => (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm ${info.row.original.is_elective ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
              {(info.getValue() as string).charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              {info.getValue() as string}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'code',
        header: 'Subject Code',
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
        accessorKey: 'is_elective',
        header: 'Subject Classification & Group',
        cell: info => {
          const isElective = info.getValue() as boolean;
          const groupName = info.row.original.elective_group_name;
          return isElective ? (
            <div className="space-y-1">
              <Badge variant="solid" color="warning">Elective Course</Badge>
              {groupName && (
                <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> {groupName}
                </p>
              )}
            </div>
          ) : (
            <Badge variant="solid" color="success">Compulsory Core</Badge>
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
                    label: 'View Subject Profile',
                    icon: <Eye className="w-4 h-4 text-blue-500" />,
                    onClick: () => openDetailView(rowData),
                  },
                  {
                    label: 'Edit Subject Details',
                    icon: <Edit3 className="w-4 h-4 text-emerald-500" />,
                    onClick: () => openEditView(rowData),
                  },
                  {
                    label: 'Delete Subject',
                    icon: <Trash2 className="w-4 h-4 text-rose-500" />,
                    onClick: () => deleteSubject(rowData),
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
    data: filteredSubjects,
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
      <PageMeta title="Subjects Directory" description="School Academic Subjects & Course Management Portal" />

      <div className="w-full space-y-6 animate-in fade-in duration-300">
        <Breadcrumb items={[{ label: 'Academics' }, { label: 'Subjects Directory' }]} />

        {/* HEADER */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-brand-500" /> Subjects & Curriculum Directory
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage academic subjects, course codes, and elective choice groups.</p>
          </div>

          <Button variant="primary" onClick={openAddView} className="flex items-center gap-2">
            + Add New Subject
          </Button>
        </div>

        {/* KPI STATS */}
        <StatCards stats={stats} loading={loading} />

        {/* MAIN TABLE CONTAINER */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          {/* Toolbar Header */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2 border-b sm:border-b-0 border-gray-200 dark:border-gray-800 pb-2 sm:pb-0">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'all' ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                All ({subjects.length})
              </button>
              <button
                onClick={() => setActiveTab('core')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'core' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Compulsory Core ({coreCount})
              </button>
              <button
                onClick={() => setActiveTab('elective')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'elective' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Electives ({electiveCount})
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-64">
                <Input
                  type="text"
                  placeholder="Search subject or code..."
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
                      No subjects found in directory.
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
          title={isViewing ? 'Subject Profile Details' : isEditing ? 'Update Subject Details' : 'Create New Subject'}
        >
          {isViewing ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <Label>Subject Name</Label>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formData.name}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <Label>Subject Code</Label>
                <p className="font-mono text-sm text-gray-700 dark:text-gray-300">{formData.code || 'None'}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <Label>Course Classification</Label>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{formData.is_elective ? 'Elective Course' : 'Compulsory Core'}</p>
                {formData.is_elective && (
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">Group: {formData.elective_group_name || 'Unassigned'}</p>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <Label required>Subject Name</Label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Mathematics or Computer Science"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Subject Short Code (Optional)</Label>
                <Input
                  type="text"
                  placeholder="e.g. MATH-101 or CS-202"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>

              <div className="space-y-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_elective_checkbox"
                    checked={formData.is_elective}
                    onChange={(e) => setFormData({ ...formData, is_elective: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                  />
                  <label htmlFor="is_elective_checkbox" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                    Mark as Optional / Elective Subject
                  </label>
                </div>

                {formData.is_elective && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <SearchableSelect
                      label="Elective Choice Group *"
                      options={ELECTIVE_GROUPS}
                      value={formData.elective_group_name || ''}
                      onChange={(v) => setFormData({ ...formData, elective_group_name: v as string })}
                    />
                    <p className="text-[11px] text-gray-500 italic">Assigning an Elective Choice Group prevents course enrollment conflicts!</p>
                  </div>
                )}
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
                  {isEditing ? 'Save Changes' : 'Create Subject'}
                </Button>
              </div>
            </form>
          )}
        </ProfileDrawer>
      </div>
    </>
  );
}