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
import { BookOpen, Layers, Trash2, Download, Eye, Award } from 'lucide-react';
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

interface ClassSubject {
  id?: string;
  tenant_id: string;
  class_id: string;
  subject_id: string;
  passing_marks: number;
  total_marks: number;
  subject_name?: string;
  subject_code?: string;
}

interface LookupItem {
  id: string;
  name: string;
  code?: string;
}

const initialFormState = (tenantId: string, classId: string): ClassSubject => ({
  tenant_id: tenantId,
  class_id: classId,
  subject_id: '',
  passing_marks: 33.00,
  total_marks: 100.00
});

export default function ClassSubjects() {
  const tenantId = localStorage.getItem("tenantId") || "";

  const [assignments, setAssignments] = useState<ClassSubject[]>([]);
  const [classes, setClasses] = useState<LookupItem[]>([]);
  const [subjects, setSubjects] = useState<LookupItem[]>([]);

  const [filterClassId, setFilterClassId] = useState<string>('');
  const [globalFilter, setGlobalFilter] = useState('');

  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [formData, setFormData] = useState<ClassSubject>(initialFormState(tenantId, ''));

  useEffect(() => {
    if (!tenantId) return;
    const loadInitialData = async () => {
      try {
        const [classesRes, subjectsRes] = await Promise.all([
          api.get<LookupItem[]>(`/classes/tenant/${tenantId}`),
          api.get<LookupItem[]>(`/subjects/tenant/${tenantId}`)
        ]);
        const clsData = classesRes.data || [];
        const subData = subjectsRes.data || [];
        setClasses(clsData);
        setSubjects(subData);
        if (clsData.length > 0) {
          setFilterClassId(clsData[0].id);
        }
      } catch {
        toast.error('Failed to load classes or subjects.');
      }
    };
    loadInitialData();
  }, [tenantId]);

  const fetchAssignments = async () => {
    if (!filterClassId) return;
    setLoading(true);
    try {
      const response = await api.get<ClassSubject[]>(`/classsubjects/class/${filterClassId}`);
      const enrichedData = (response.data || []).map(item => {
        const sub = subjects.find(s => s.id === item.subject_id);
        return { ...item, subject_name: sub ? sub.name : 'Unknown Subject', subject_code: sub ? sub.code : 'N/A' };
      });
      setAssignments(enrichedData);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setAssignments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filterClassId && subjects.length > 0) fetchAssignments();
  }, [filterClassId, subjects]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this subject mapping?')) return;
    try {
      await api.delete(`/classsubjects/${id}`);
      setAssignments(prev => prev.filter(a => a.id !== id));
      toast.success('Subject mapping removed successfully.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not remove mapping.');
    }
  };

  const openAddView = () => {
    setFormData(initialFormState(tenantId, filterClassId));
    setIsViewing(false);
    setIsFormDrawerOpen(true);
  };

  const openDetailView = (assignment: ClassSubject) => {
    setFormData({ ...assignment });
    setIsViewing(true);
    setIsFormDrawerOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject_id) {
      toast.error('Please select a Subject.');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/classsubjects', formData);
      toast.success('Subject mapped to class successfully.');
      setIsFormDrawerOpen(false);
      fetchAssignments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Please review the form and try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const className = classes.find(c => c.id === filterClassId)?.name || 'N/A';
    doc.text(`Subject Allocation Report - Class: ${className}`, 14, 15);
    
    autoTable(doc, {
      startY: 20,
      head: [['Subject Name', 'Subject Code', 'Total Max Marks', 'Passing Marks']],
      body: assignments.map(a => [
        a.subject_name || 'N/A',
        a.subject_code || 'N/A',
        a.total_marks,
        a.passing_marks
      ]),
    });
    doc.save(`Subject_Allocation_${className.replace(/\s+/g, '_')}.pdf`);
  };

  const exportCSV = () => {
    const headers = ['Subject Name', 'Subject Code', 'Total Max Marks', 'Passing Marks'];
    const csvRows = assignments.map(a => [
      (a.subject_name || '').replace(/,/g, ' '),
      (a.subject_code || '').replace(/,/g, ' '),
      a.total_marks,
      a.passing_marks
    ]);
    const csvContent = [headers, ...csvRows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const className = classes.find(c => c.id === filterClassId)?.name || 'N/A';
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Subject_Allocation_${className.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalMaxMarksSum = useMemo(() => assignments.reduce((acc, a) => acc + (a.total_marks || 0), 0), [assignments]);

  const stats: StatCardData[] = useMemo(() => [
    { title: 'Mapped Subjects Count', value: `${assignments.length} Subjects`, icon: <BookOpen className="w-5 h-5 text-brand-500" />, theme: 'brand' as const },
    { title: 'Cumulative Max Marks', value: `${totalMaxMarksSum} Marks`, icon: <Award className="w-5 h-5 text-emerald-500" />, theme: 'success' as const },
    { title: 'Available Classes', value: `${classes.length} Classes`, icon: <Layers className="w-5 h-5 text-indigo-500" />, theme: 'indigo' as const },
  ], [assignments, totalMaxMarksSum, classes]);

  const columns = useMemo<ColumnDef<ClassSubject>[]>(
    () => [
      {
        accessorKey: 'subject_name',
        header: 'Subject Name',
        cell: info => (
          <span className="font-bold text-gray-900 dark:text-white">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'subject_code',
        header: 'Subject Code',
        cell: info => <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">{info.getValue() as string}</span>,
      },
      {
        accessorKey: 'total_marks',
        header: 'Total Max Marks',
        cell: info => <Badge variant="solid" color="primary">{info.getValue() as number} Marks</Badge>,
      },
      {
        accessorKey: 'passing_marks',
        header: 'Passing Marks Threshold',
        cell: info => <Badge variant="light" color="success">{info.getValue() as number} Marks</Badge>,
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
                    label: 'View Allocation Profile',
                    icon: <Eye className="w-4 h-4 text-blue-500" />,
                    onClick: () => openDetailView(rowData),
                  },
                  {
                    label: 'Remove Subject Mapping',
                    icon: <Trash2 className="w-4 h-4 text-rose-500" />,
                    onClick: () => handleDelete(rowData.id!),
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
    data: assignments,
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
      <PageMeta title="Class Subject Allocation" description="Class Course Mapping & Grading Allocation Portal" />

      <div className="w-full space-y-6 animate-in fade-in duration-300">
        <Breadcrumb items={[{ label: 'Academics' }, { label: 'Class Subject Allocation' }]} />

        {/* HEADER */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-brand-500" /> Class Subject Allocation Desk
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Map curriculum subjects to class grades with total & passing marks.</p>
          </div>

          <Button variant="primary" onClick={openAddView} className="flex items-center gap-2">
            + Map New Subject to Class
          </Button>
        </div>

        {/* KPI STATS */}
        <StatCards stats={stats} />

        {/* MAIN TABLE CONTAINER */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          {/* Toolbar Header */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-64">
              <SearchableSelect
                label="Target Class / Grade"
                options={classes.map(c => ({ value: c.id, label: c.name }))}
                value={filterClassId}
                onChange={(v) => setFilterClassId(v as string)}
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-64">
                <Input
                  type="text"
                  placeholder="Search mapped subjects..."
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
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
                      {loading ? 'Loading mapped subjects...' : 'No subjects mapped to this class yet.'}
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
          title={isViewing ? 'Subject Mapping Details' : 'Map Subject to Class'}
        >
          {isViewing ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <Label>Subject Name</Label>
                <p className="text-base font-bold text-gray-900 dark:text-white">{formData.subject_name}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <Label>Total Max Paper Marks</Label>
                <p className="font-mono text-base font-bold text-brand-600">{formData.total_marks} Marks</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <Label>Passing Marks Threshold</Label>
                <p className="font-mono text-base font-bold text-emerald-600">{formData.passing_marks} Marks</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <SearchableSelect
                  label="Select Subject to Map *"
                  options={subjects.map(s => ({ value: s.id, label: `${s.name} (${s.code || 'N/A'})` }))}
                  value={formData.subject_id}
                  onChange={(v) => setFormData({ ...formData, subject_id: v as string })}
                />
              </div>

              <div>
                <Label required>Total Maximum Paper Marks</Label>
                <Input
                  type="number"
                  required
                  placeholder="100"
                  value={formData.total_marks}
                  onChange={(e) => setFormData({ ...formData, total_marks: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label required>Passing Marks Threshold</Label>
                <Input
                  type="number"
                  required
                  placeholder="33"
                  value={formData.passing_marks}
                  onChange={(e) => setFormData({ ...formData, passing_marks: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                <Button variant="outline" onClick={() => setIsFormDrawerOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={submitLoading}>
                  {submitLoading ? 'Mapping...' : 'Confirm Mapping'}
                </Button>
              </div>
            </form>
          )}
        </ProfileDrawer>
      </div>
    </>
  );
}