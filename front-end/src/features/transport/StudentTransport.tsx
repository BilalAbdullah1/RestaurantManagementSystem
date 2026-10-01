import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState
} from '@tanstack/react-table';

// Custom Components
import Input from '../../components/form/input/InputField';
import DatePicker from '../../components/form/date-picker';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import ActionMenu, { ActionMenuItem } from '../../components/ui/UIDesigns/ActionMenu';
import SearchableSelect, { OptionType } from '../../components/form/select/SearchableSelect';
import Label from '../../components/form/Label';
import { toast } from '../../components/ui/Toast';
import { FileText, Download, Briefcase, CheckCircle, Edit2, Trash2, Bus, Plus } from 'lucide-react';

// ─── Interfaces ─────────────────────────────────────────────────────────────────
interface StudentTransport {
  id?: string;
  tenant_id: string;
  student_id: string;
  route_id: string;
  pickup_point: string;
  start_date: string;
  end_date?: string;
  status: string; // Active | Inactive
  created_at?: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
}

interface TransportRoute {
  id: string;
  route_name: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getTodayDateString = () => new Date().toISOString().split('T')[0];

const initialFormState = (tenantId: string): StudentTransport => ({
  tenant_id: tenantId,
  student_id: '',
  route_id: '',
  pickup_point: '',
  start_date: getTodayDateString(),
  end_date: '',
  status: 'Active',
});

const statusOptions: OptionType[] = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' }
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function StudentTransportPage() {
  const [assignments, setAssignments]             = useState<StudentTransport[]>([]);
  const [students, setStudents]                   = useState<Student[]>([]);
  const [routes, setRoutes]                       = useState<TransportRoute[]>([]);
  
  const [globalFilter, setGlobalFilter]           = useState('');
  const [loading, setLoading]                     = useState(true);
  const [submitLoading, setSubmitLoading]         = useState(false);

  const [sorting, setSorting]                     = useState<SortingState>([]);
  const [view, setView]                           = useState<'list' | 'form'>('list');
  const [editingAssignment, setEditingAssignment] = useState<StudentTransport | null>(null);

  const tenantId = localStorage.getItem('tenantId') || '';
  const [formData, setFormData]                   = useState<StudentTransport>(initialFormState(tenantId));
  const [searchParams]                            = useSearchParams();

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openAddView();
    }
  }, [searchParams]);

  // ── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!tenantId) {
      toast.error('We could not identify your school. Please log in again.');
      setLoading(false);
      return;
    }
    fetchData();
  }, [tenantId]);

  // ── Data fetching ────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, studentsRes, routesRes] = await Promise.all([
        api.get<StudentTransport[]>(`/studenttransport/tenant/${tenantId}`),
        api.get<Student[]>(`/students/tenant/${tenantId}`),
        api.get<TransportRoute[]>(`/transportroutes/tenant/${tenantId}`)
      ]);
      
      setAssignments(assignmentsRes.data);
      setStudents(studentsRes.data);
      setRoutes(routesRes.data);
    } catch {
      toast.error('Something went wrong while retrieving transport assignments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentsOnly = async () => {
    try {
      const response = await api.get<StudentTransport[]>(`/studenttransport/tenant/${tenantId}`);
      setAssignments(response.data);
    } catch {
      toast.error('Failed to refresh assignments.');
    }
  };

  // ── Dropdown Options ─────────────────────────────────────────────────────────
  const studentOptions: OptionType[] = useMemo(() => {
    return students.map(s => ({
      value: s.id,
      label: `${s.first_name} ${s.last_name} (${s.admission_number})`
    }));
  }, [students]);

  const routeOptions: OptionType[] = useMemo(() => {
    return routes.map(r => ({
      value: r.id,
      label: r.route_name
    }));
  }, [routes]);

  // Lookup helpers for displaying real names in the table
  const getStudentName = (id: string) => {
    const student = students.find(s => s.id === id);
    return student ? `${student.first_name} ${student.last_name}` : id;
  };

  const getRouteName = (id: string) => {
    const route = routes.find(r => r.id === id);
    return route ? route.route_name : id;
  };

  // ── Date formatting ──────────────────────────────────────────────────────────
  const formatInputDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return dateString.split('T')[0];
    }
  };

  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-PK', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalAssignments  = assignments.length;
  const activeAssignments = assignments.filter((a) => a.status === 'Active').length;

  const statCardsData = [
    { title: 'Total Assignments', value: totalAssignments, icon: <Briefcase className="w-6 h-6 text-brand-500" />, theme: 'brand' as const },
    { title: 'Active Assignments', value: activeAssignments, icon: <CheckCircle className="w-6 h-6 text-success-500" />, theme: 'success' as const },
  ];

  // ── Form helpers ─────────────────────────────────────────────────────────────
  const openAddView = () => {
    setEditingAssignment(null);
    setFormData(initialFormState(tenantId));
    setView('form');
  };

  const openEditView = (assignment: StudentTransport) => {
    setEditingAssignment(assignment);
    setFormData({
      ...assignment,
      start_date: formatInputDate(assignment.start_date),
      end_date:   formatInputDate(assignment.end_date),
    });
    setView('form');
  };

  const cancelForm = () => {
    setEditingAssignment(null);
    setFormData(initialFormState(tenantId));
    setView('list');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id || !formData.route_id) {
      toast.error('Please select both Student and Route.');
      return;
    }

    setSubmitLoading(true);

    const payload: StudentTransport = {
      ...formData,
      end_date: formData.end_date?.trim() ? formData.end_date : undefined,
    };

    try {
      if (editingAssignment && editingAssignment.id) {
        await api.put(`/studenttransport/${editingAssignment.id}`, payload);
        toast.success('The transport assignment has been saved.');
      } else {
        await api.post('/studenttransport', payload);
        toast.success('The student has been assigned to transport.');
      }
      cancelForm();
      fetchAssignmentsOnly();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Please review the form and try again.';
      toast.error(errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteAssignment = async (assignment: StudentTransport) => {
    const result = await Swal.fire({
      title: 'Remove Assignment?',
      text: `This will permanently remove the transport assignment. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Remove',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/studenttransport/${assignment.id}`);
      toast.success('The transport assignment has been removed.');
      fetchAssignmentsOnly();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'We could not remove this assignment. Please try again.';
      toast.error(errorMsg);
    }
  };

  // ── Exports ──────────────────────────────────────────────────────────────────
  const exportToCSV = () => {
    const headers = ['Student Name', 'Route Name', 'Pickup Point', 'Start Date', 'End Date', 'Status'];
    const rows = assignments.map(a => [
      getStudentName(a.student_id),
      getRouteName(a.route_id),
      a.pickup_point,
      formatDisplayDate(a.start_date),
      formatDisplayDate(a.end_date),
      a.status
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.map(field => `"${field}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Student_Transport_Assignments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Exported Successfully');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Student Transport Assignments', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Student Name', 'Route Name', 'Pickup Point', 'Start Date', 'End Date', 'Status']],
      body: assignments.map(a => [
        getStudentName(a.student_id),
        getRouteName(a.route_id),
        a.pickup_point,
        formatDisplayDate(a.start_date),
        formatDisplayDate(a.end_date),
        a.status
      ]),
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [60, 80, 224] }
    });
    doc.save('Student_Transport_Assignments.pdf');
    toast.success('PDF Exported Successfully');
  };

  // ── Table Columns ────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<StudentTransport>[]>(() => [
    {
      accessorKey: 'student_id',
      header: 'Student Name',
      cell: info => <span className="font-semibold text-gray-800 dark:text-white/90">{getStudentName(info.getValue() as string)}</span>,
      // For global filtering by real name instead of ID:
      filterFn: (row, id, value) => {
        const val = getStudentName(row.getValue(id));
        return val.toLowerCase().includes(value.toLowerCase());
      }
    },
    {
      accessorKey: 'route_id',
      header: 'Route',
      cell: info => <span className="text-gray-600 dark:text-gray-300">{getRouteName(info.getValue() as string)}</span>,
    },
    {
      accessorKey: 'pickup_point',
      header: 'Pickup Point',
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: info => <span className="text-gray-600 dark:text-gray-300">{formatDisplayDate(info.getValue() as string)}</span>,
    },
    {
      accessorKey: 'end_date',
      header: 'End Date',
      cell: info => <span className="text-gray-600 dark:text-gray-300">{formatDisplayDate(info.getValue() as string)}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => {
        const isActive = info.getValue() === 'Active';
        return (
          <Badge
            variant="light"
            color={isActive ? 'success' : 'dark'}
            size="sm"
            startIcon={<span className={`w-1.5 h-1.5 rounded-full inline-block ${isActive ? 'bg-success-500' : 'bg-gray-400'}`} />}
          >
            {info.getValue() as string}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const assignment = row.original;
        const groups: ActionMenuItem[][] = [
          [
            { label: 'Edit Assignment', icon: <Edit2 className="w-4 h-4" />, onClick: () => openEditView(assignment) }
          ],
          [
            { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => deleteAssignment(assignment), isDanger: true }
          ]
        ];
        return (
          <div className="flex justify-end">
            <ActionMenu groups={groups} />
          </div>
        );
      },
    }
  ], [students, routes]);

  const table = useReactTable({
    data: assignments,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  // ─── LIST VIEW ─────────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="w-full space-y-6">
        <StatCards stats={statCardsData} loading={loading} />

        {/* Main Table Card */}
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Student Transport Assignments</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage which students are assigned to transport routes and pickup points.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={exportToCSV} className="flex items-center gap-2">
                <FileText className="w-4 h-4" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportToPDF} className="flex items-center gap-2">
                <Download className="w-4 h-4" /> PDF
              </Button>
              <Button variant="primary" onClick={openAddView} className="w-full sm:w-auto flex items-center gap-2">
                + Assign Student
              </Button>
            </div>
          </div>

          {/* Global Search */}
          <div className="my-6 max-w-md">
            <Input
              type="text"
              placeholder="Search by student name, route, pickup point..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>

          {/* TanStack Table */}
          <div className="overflow-x-auto min-h-[250px] rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className={`px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none ${header.column.getCanSort() ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors' : ''}`}
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
                      {columns.map((col, colIndex) => (
                        <td key={`skeleton-cell-${colIndex}`} className="px-6 py-4 whitespace-nowrap">
                          {colIndex === columns.length - 1 ? (
                            <div className="flex justify-end">
                              <div className="h-7 w-7 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                            </div>
                          ) : (
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-16 text-center">
                      <div className="max-w-md mx-auto flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 border border-brand-100 dark:border-brand-800">
                          <Bus className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-2">
                          No Student Transport Allocations Yet
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                          Assign enrolled students to school van/bus routes and pickup stops to manage daily commuter attendance and transport fee dues.
                        </p>
                        <Button variant="primary" onClick={openAddView} startIcon={<Plus className="w-4 h-4" />}>
                          + Assign First Student
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
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

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-5 border-t border-gray-200 dark:border-gray-800 mt-4 select-none">
            <div className="flex items-center gap-2">
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-brand-500 dark:focus:border-brand-500"
              >
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page <span className="font-semibold text-gray-700 dark:text-gray-200">{table.getState().pagination.pageIndex + 1}</span> of{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-200">{table.getPageCount() || 1}</span>
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── FORM VIEW ─────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleFormSubmit} className="w-full space-y-6">

      {/* Form Header */}
      <div className="flex justify-between items-center p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            {editingAssignment ? 'Edit Transport Assignment' : 'New Transport Assignment'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ensure all mandatory fields (*) are accurately populated.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={cancelForm}>
          Back to Assignments
        </Button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Card 1: Assignment Details */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <span className="text-brand-500">🎒</span> Assignment Details
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <SearchableSelect
                label="Student *"
                options={studentOptions}
                value={formData.student_id}
                onChange={(val) => setFormData({ ...formData, student_id: val as string })}
              />
            </div>
            <div>
              <SearchableSelect
                label="Route *"
                options={routeOptions}
                value={formData.route_id}
                onChange={(val) => setFormData({ ...formData, route_id: val as string })}
              />
            </div>
            <div>
              <Label>Pickup Point *</Label>
              <Input
                type="text"
                required
                placeholder="e.g. Main Gate, Block C Stop"
                value={formData.pickup_point}
                onChange={(e) => setFormData({ ...formData, pickup_point: e.target.value })}
              />
            </div>
            <div>
              <SearchableSelect
                label="Status *"
                options={statusOptions}
                value={formData.status}
                onChange={(val) => setFormData({ ...formData, status: val as string })}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Duration */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <span className="text-success-500">📅</span> Duration
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <Label>Start Date *</Label>
              <DatePicker
                id="transport-start-date"
                value={formData.start_date}
                required
                placeholder="Select start date"
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label>
                End Date <span className="text-gray-400 normal-case font-normal">(optional — leave blank for ongoing)</span>
              </Label>
              <DatePicker
                id="transport-end-date"
                value={formData.end_date ?? ''}
                placeholder="Select end date (optional)"
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
            <div className="pt-2 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                <span className="font-semibold">Note:</span> If no end date is set, the assignment will remain active until
                manually changed to Inactive status.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Form Actions */}
      <div className="flex justify-end items-center gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        <Button type="button" variant="outline" onClick={cancelForm}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={submitLoading}
          loadingText={editingAssignment ? 'Saving Changes...' : 'Creating Assignment...'}
          className="min-w-[160px]"
        >
          {editingAssignment ? 'Save Changes' : 'Create Assignment'}
        </Button>
      </div>

    </form>
  );
}
