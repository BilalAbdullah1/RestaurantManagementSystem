import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Input from '../../components/form/input/InputField';
import DatePicker from '../../components/form/date-picker';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import Label from '../../components/form/Label';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import StatCards from '../../components/ui/UIDesigns/StatCards';

// Tanstack Table
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

import { useSearchParams } from 'react-router';
// For PDF/CSV exports
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download, Edit, Trash2, UserCheck, Key, LogOut, Plus } from 'lucide-react';

interface HostelAllocation {
  id?: string;
  tenant_id: string;
  student_id: string;
  room_id: string;
  allocation_date: string;
  vacating_date?: string;
  status: string;
  remarks?: string;
  created_at?: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  admission_number?: string;
}

interface HostelRoom {
  id: string;
  room_number: string;
  room_type: string;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const initialFormState = (tenantId: string): HostelAllocation => ({
  tenant_id: tenantId,
  student_id: '',
  room_id: '',
  allocation_date: getTodayDateString(),
  status: 'Active',
  remarks: '',
});

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Vacated', label: 'Vacated' },
];

export default function HostelAllocations() {
  const [allocations, setAllocations] = useState<HostelAllocation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingItem, setEditingItem] = useState<HostelAllocation | null>(null);

  const tenantId = localStorage.getItem('tenantId') || '';
  const [formData, setFormData] = useState<HostelAllocation>(initialFormState(tenantId));
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!tenantId) {
      Swal.fire({ icon: 'error', title: 'Unable to Continue', text: 'School not identified.' });
      setLoading(false);
      return;
    }
    fetchData();
  }, [tenantId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allocRes, studRes, roomsRes] = await Promise.all([
        api.get<HostelAllocation[]>(`/HostelAllocations/tenant/${tenantId}`),
        api.get<Student[]>(`/students/tenant/${tenantId}`),
        api.get<HostelRoom[]>(`/HostelRooms/tenant/${tenantId}`)
      ]);
      setAllocations(allocRes.data);
      setStudents(studRes.data);
      setRooms(roomsRes.data);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to retrieve allocations or related data.' });
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (id: string) => {
    const s = students.find(x => x.id === id);
    return s ? `${s.first_name} ${s.last_name}` : id;
  };

  const getRoomNumber = (id: string) => {
    const r = rooms.find(x => x.id === id);
    return r ? r.room_number : id;
  };

  const studentOptions = students.map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name} ${s.admission_number ? `(${s.admission_number})` : ''}` }));
  const roomOptions = rooms.map(r => ({ value: r.id, label: `${r.room_number} (${r.room_type})` }));

  const formatInputDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return dateString.split('T')[0];
    }
  };

  const openAddView = () => {
    setEditingItem(null);
    setFormData(initialFormState(tenantId));
    setView('form');
  };

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openAddView();
    }
  }, [searchParams]);

  const openEditView = (item: HostelAllocation) => {
    setEditingItem(item);
    setFormData({
      ...item,
      allocation_date: formatInputDate(item.allocation_date),
      vacating_date: formatInputDate(item.vacating_date),
    });
    setView('form');
  };

  const cancelForm = () => {
    setEditingItem(null);
    setFormData(initialFormState(tenantId));
    setView('list');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id || !formData.room_id) {
      Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'Please select a student and a room.' });
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = { ...formData };
      if (payload.status === 'Active') {
        payload.vacating_date = undefined; // Clear vacating date if active
      }

      if (editingItem && editingItem.id) {
        await api.put(`/HostelAllocations/${editingItem.id}`, payload);
        Swal.fire({ icon: 'success', title: 'Updated', text: 'Allocation updated.', timer: 2000, showConfirmButton: false });
      } else {
        await api.post('/HostelAllocations', payload);
        Swal.fire({ icon: 'success', title: 'Allocated', text: 'Room successfully allocated.', timer: 2000, showConfirmButton: false });
      }
      cancelForm();
      fetchData();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Save Failed', text: err.response?.data?.message || 'Error saving allocation.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteAllocation = async (item: HostelAllocation) => {
    const result = await Swal.fire({
      title: 'Delete Allocation?',
      text: 'Are you sure you want to delete this allocation record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Delete',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/HostelAllocations/${item.id}`);
      Swal.fire({ icon: 'success', title: 'Deleted', text: 'Allocation deleted.', timer: 1500, showConfirmButton: false });
      fetchData();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete allocation.' });
    }
  };

  const columns = useMemo<ColumnDef<HostelAllocation>[]>(() => [
    {
      accessorKey: 'student_id',
      header: 'Student',
      cell: ({ row }) => (
        <div className="font-semibold text-gray-800 dark:text-gray-200">
          {getStudentName(row.original.student_id)}
        </div>
      )
    },
    {
      accessorKey: 'room_id',
      header: 'Room',
      cell: ({ row }) => (
        <span className="text-gray-600 dark:text-gray-300 font-medium">
          {getRoomNumber(row.original.room_id)}
        </span>
      )
    },
    {
      accessorKey: 'allocation_date',
      header: 'Allocated On',
      cell: ({ row }) => <span className="text-sm text-gray-600 dark:text-gray-300">{new Date(row.original.allocation_date).toLocaleDateString()}</span>
    },
    {
      accessorKey: 'vacating_date',
      header: 'Vacated On',
      cell: ({ row }) => <span className="text-sm text-gray-600 dark:text-gray-300">{row.original.vacating_date ? new Date(row.original.vacating_date).toLocaleDateString() : '-'}</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => row.original.status === 'Active' 
        ? <Badge color="success" variant="light">Active</Badge> 
        : <Badge color="dark" variant="light">Vacated</Badge>
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ActionMenu
            groups={[
              [
                { label: 'Edit', icon: <Edit className="w-4 h-4" />, onClick: () => openEditView(row.original) },
              ],
              [
                { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => deleteAllocation(row.original), isDanger: true }
              ]
            ]}
          />
        </div>
      ),
    }
  ], [students, rooms]);

  const table = useReactTable({
    data: allocations,
    columns,
    state: { globalFilter, sorting, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const exportCSV = () => {
    if (allocations.length === 0) return;
    const headers = ['Student Name', 'Room Number', 'Allocated On', 'Vacated On', 'Status', 'Remarks'];
    const rowsList = allocations.map(t => [
      getStudentName(t.student_id),
      getRoomNumber(t.room_id),
      new Date(t.allocation_date).toLocaleDateString(),
      t.vacating_date ? new Date(t.vacating_date).toLocaleDateString() : '',
      t.status,
      t.remarks || ''
    ]);
    const csvContent = [headers.join(','), ...rowsList.map(e => e.map(field => `"${field}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Hostel_Allocations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (allocations.length === 0) return;
    const doc = new jsPDF();
    doc.text("Hostel Allocations List", 14, 15);
    const tableData = allocations.map(t => [
      getStudentName(t.student_id),
      getRoomNumber(t.room_id),
      new Date(t.allocation_date).toLocaleDateString(),
      t.vacating_date ? new Date(t.vacating_date).toLocaleDateString() : '-',
      t.status
    ]);
    (doc as any).autoTable({
      head: [['Student', 'Room', 'Allocated On', 'Vacated On', 'Status']],
      body: tableData,
      startY: 20,
    });
    doc.save("Hostel_Allocations.pdf");
  };

  const activeAllocations = allocations.filter(a => a.status === 'Active').length;
  const vacatedAllocations = allocations.filter(a => a.status === 'Vacated').length;

  const statCardsData: any[] = [
    { title: 'Total Allocations', value: allocations.length.toString(), theme: 'brand', icon: <UserCheck className="w-5 h-5 text-brand-500" /> },
    { title: 'Active', value: activeAllocations.toString(), theme: 'success', icon: <Key className="w-5 h-5 text-success-500" /> },
    { title: 'Vacated', value: vacatedAllocations.toString(), theme: 'purple', icon: <LogOut className="w-5 h-5 text-purple-500" /> }
  ];

  if (view === 'list') {
    return (
      <div className="w-full space-y-6">
        <StatCards stats={statCardsData} loading={loading} />

        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Hostel Allocations</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage student room assignments and vacating records.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={exportCSV} className="hidden sm:flex" title="Export CSV">
                <Download className="w-4 h-4 mr-2" /> CSV
              </Button>
              <Button variant="outline" onClick={exportPDF} className="hidden sm:flex" title="Export PDF">
                <Download className="w-4 h-4 mr-2" /> PDF
              </Button>
              <Button variant="primary" onClick={openAddView}>
                + Allocate Room
              </Button>
            </div>
          </div>

          <div className="my-6">
            <Input
              type="text"
              placeholder="Search allocations..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto min-h-[250px] rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className={`px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${header.column.getCanSort() ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <span className="text-brand-500">▲</span>,
                            desc: <span className="text-brand-500">▼</span>,
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
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                        <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
                          <UserCheck className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-1">
                          No Boarder Students Allocated Yet
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                          Assign enrolled students to hostel rooms, designate bed numbers, and manage residential check-in dates.
                        </p>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={openAddView}
                          startIcon={<Plus className="w-4 h-4" />}
                        >
                          Check In First Student
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-5 border-t border-gray-200 dark:border-gray-800 mt-4 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Rows per page:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-600 dark:text-gray-300"
              >
                {[5, 10, 20, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>{pageSize}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 mr-2">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <button
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="w-full space-y-6">
      <div className="flex justify-between items-center p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{editingItem ? 'Edit Allocation' : 'Allocate Room'}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Provide details for the student's room allocation.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={cancelForm}>Back</Button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <SearchableSelect
              label="Student *"
              options={studentOptions}
              value={formData.student_id}
              onChange={(val) => setFormData({...formData, student_id: val as string})}
            />
          </div>
          <div>
            <SearchableSelect
              label="Room *"
              options={roomOptions}
              value={formData.room_id}
              onChange={(val) => setFormData({...formData, room_id: val as string})}
            />
          </div>
          <div>
            <Label>Allocation Date *</Label>
            <DatePicker id="alloc-date" value={formData.allocation_date} onChange={e => setFormData({...formData, allocation_date: e.target.value})} />
          </div>
          <div>
            <SearchableSelect
              label="Status *"
              options={statusOptions}
              value={formData.status}
              onChange={(val) => setFormData({...formData, status: val as string})}
            />
          </div>
          {formData.status === 'Vacated' && (
            <div>
              <Label>Vacating Date *</Label>
              <DatePicker id="vacate-date" value={formData.vacating_date || ''} onChange={e => setFormData({...formData, vacating_date: e.target.value})} />
            </div>
          )}
          <div className="col-span-1 md:col-span-2">
            <Label>Remarks</Label>
            <Input type="text" placeholder="Additional details..." value={formData.remarks || ''} onChange={e => setFormData({...formData, remarks: e.target.value})} />
          </div>
        </div>
        <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={cancelForm}>Cancel</Button>
          <Button
            variant="primary"
            type="submit"
            loading={submitLoading}
            loadingText={editingItem ? 'Saving Changes...' : 'Saving Allocation...'}
          >
            {editingItem ? 'Save Changes' : 'Save Allocation'}
          </Button>
        </div>
      </div>
    </form>
  );
}
