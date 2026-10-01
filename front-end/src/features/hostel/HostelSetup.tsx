import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Input from '../../components/form/input/InputField';
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

// For PDF/CSV exports
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download, Edit, Trash2, Home, Users, DollarSign, Plus } from 'lucide-react';

interface HostelRoom {
  id?: string;
  tenant_id: string;
  room_number: string;
  room_type: string;
  capacity: number;
  monthly_fee: number;
  is_available: boolean;
  description: string;
}

const roomTypeOptions = [
  { value: 'Single', label: 'Single' },
  { value: 'Double', label: 'Double' },
  { value: 'Triple', label: 'Triple' },
  { value: 'Dormitory', label: 'Dormitory' },
];

const initialFormState = (tenantId: string): HostelRoom => ({
  tenant_id: tenantId,
  room_number: '',
  room_type: 'Single',
  capacity: 1,
  monthly_fee: 0,
  is_available: true,
  description: '',
});

export default function HostelSetup() {
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingItem, setEditingItem] = useState<HostelRoom | null>(null);

  const tenantId = localStorage.getItem('tenantId') || '';
  const [formData, setFormData] = useState<HostelRoom>(initialFormState(tenantId));
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openAddView();
    }
  }, [searchParams]);

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
      const res = await api.get<HostelRoom[]>(`/HostelRooms/tenant/${tenantId}`);
      setRooms(res.data);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to retrieve hostel rooms.' });
    } finally {
      setLoading(false);
    }
  };

  const openAddView = () => {
    setEditingItem(null);
    setFormData(initialFormState(tenantId));
    setView('form');
  };

  const openEditView = (item: HostelRoom) => {
    setEditingItem(item);
    setFormData({ ...item });
    setView('form');
  };

  const cancelForm = () => {
    setEditingItem(null);
    setFormData(initialFormState(tenantId));
    setView('list');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.room_number) {
      Swal.fire({ icon: 'warning', title: 'Invalid Input', text: 'Room Number is required.' });
      return;
    }

    setSubmitLoading(true);
    try {
      if (editingItem && editingItem.id) {
        await api.put(`/HostelRooms/${editingItem.id}`, formData);
        Swal.fire({ icon: 'success', title: 'Updated', text: 'Room details updated.', timer: 2000, showConfirmButton: false });
      } else {
        await api.post('/HostelRooms', formData);
        Swal.fire({ icon: 'success', title: 'Added', text: 'Room successfully added.', timer: 2000, showConfirmButton: false });
      }
      cancelForm();
      fetchData();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Save Failed', text: err.response?.data?.message || 'Error saving room.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteRoom = async (item: HostelRoom) => {
    const result = await Swal.fire({
      title: 'Delete Room?',
      text: `Are you sure you want to delete Room ${item.room_number}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Delete',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/HostelRooms/${item.id}`);
      Swal.fire({ icon: 'success', title: 'Deleted', text: 'Room deleted.', timer: 1500, showConfirmButton: false });
      fetchData();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete room. Ensure no students are allocated to it.' });
    }
  };

  const columns = useMemo<ColumnDef<HostelRoom>[]>(() => [
    {
      accessorKey: 'room_number',
      header: 'Room Number',
      cell: ({ row }) => <span className="font-semibold text-gray-800 dark:text-gray-200">{row.original.room_number}</span>
    },
    {
      accessorKey: 'room_type',
      header: 'Type',
      cell: ({ row }) => <Badge variant="light" color="primary">{row.original.room_type}</Badge>
    },
    {
      accessorKey: 'capacity',
      header: 'Capacity',
      cell: ({ row }) => <span className="text-gray-600 dark:text-gray-300">{row.original.capacity} Persons</span>
    },
    {
      accessorKey: 'monthly_fee',
      header: 'Monthly Fee',
      cell: ({ row }) => <span className="font-semibold text-gray-700 dark:text-gray-300">Rs. {row.original.monthly_fee.toLocaleString()}</span>
    },
    {
      accessorKey: 'is_available',
      header: 'Status',
      cell: ({ row }) => row.original.is_available 
        ? <Badge color="success" variant="light">Available</Badge> 
        : <Badge color="danger" variant="light">Unavailable</Badge>
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
                { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => deleteRoom(row.original), isDanger: true }
              ]
            ]}
          />
        </div>
      ),
    }
  ], []);

  const table = useReactTable({
    data: rooms,
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
    if (rooms.length === 0) return;
    const headers = ['Room Number', 'Type', 'Capacity', 'Monthly Fee', 'Available', 'Description'];
    const rowsList = rooms.map(t => [
      t.room_number,
      t.room_type,
      t.capacity.toString(),
      t.monthly_fee.toString(),
      t.is_available ? 'Yes' : 'No',
      t.description || ''
    ]);
    const csvContent = [headers.join(','), ...rowsList.map(e => e.map(field => `"${field}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Hostel_Rooms.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (rooms.length === 0) return;
    const doc = new jsPDF();
    doc.text("Hostel Rooms List", 14, 15);
    const tableData = rooms.map(t => [
      t.room_number,
      t.room_type,
      t.capacity.toString(),
      `Rs. ${t.monthly_fee.toLocaleString()}`,
      t.is_available ? 'Available' : 'Unavailable'
    ]);
    (doc as any).autoTable({
      head: [['Room Number', 'Type', 'Capacity', 'Fee', 'Status']],
      body: tableData,
      startY: 20,
    });
    doc.save("Hostel_Rooms.pdf");
  };

  const availableRoomsCount = rooms.filter(r => r.is_available).length;
  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);

  const statCardsData: any[] = [
    { title: 'Total Rooms', value: rooms.length.toString(), theme: 'brand', icon: <Home className="w-5 h-5 text-brand-500" /> },
    { title: 'Available Rooms', value: availableRoomsCount.toString(), theme: 'success', icon: <Home className="w-5 h-5 text-success-500" /> },
    { title: 'Total Capacity', value: totalCapacity.toString(), theme: 'indigo', icon: <Users className="w-5 h-5 text-indigo-500" /> }
  ];

  if (view === 'list') {
    return (
      <div className="w-full space-y-6">
        <StatCards stats={statCardsData} loading={loading} />

        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Hostel Rooms</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage available rooms, capacity, and fees.
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
                + Add Room
              </Button>
            </div>
          </div>

          <div className="my-6">
            <Input
              type="text"
              placeholder="Search by room #, type, fee..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto min-h-[250px] border border-gray-200 dark:border-gray-800 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className={`px-6 py-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none ${header.column.getCanSort() ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors' : ''}`}
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
                    <td colSpan={columns.length} className="px-6 py-16 text-center">
                      <div className="max-w-md mx-auto flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 border border-brand-100 dark:border-brand-800">
                          <Home className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-2">
                          No Hostel Rooms Configured Yet
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                          Set up hostel dormitories, room types (Single, Double, Dormitory), bed capacities, and monthly hostel fees.
                        </p>
                        <Button variant="primary" onClick={openAddView} startIcon={<Plus className="w-4 h-4" />}>
                          + Add First Hostel Room
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{editingItem ? 'Edit Room' : 'Add New Room'}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Provide details for the hostel room.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={cancelForm}>Back</Button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Room Number *</Label>
            <Input type="text" required placeholder="e.g. A-101" value={formData.room_number} onChange={e => setFormData({...formData, room_number: e.target.value})} />
          </div>
          <div>
            <SearchableSelect
              label="Room Type *"
              options={roomTypeOptions}
              value={formData.room_type}
              onChange={(val) => setFormData({...formData, room_type: val as string})}
            />
          </div>
          <div>
            <Label>Capacity *</Label>
            <Input type="number" min="1" required value={formData.capacity.toString()} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 1})} />
          </div>
          <div>
            <Label>Monthly Fee (Rs) *</Label>
            <Input type="number" step={0.01} min="0" required value={formData.monthly_fee === 0 ? '' : formData.monthly_fee.toString()} onChange={e => setFormData({...formData, monthly_fee: parseFloat(e.target.value) || 0})} />
          </div>
          <div>
            <Label>Status</Label>
            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={e => setFormData({...formData, is_available: e.target.checked})}
                className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Room is Available</span>
            </div>
          </div>
          <div className="col-span-1 md:col-span-2">
            <Label>Description</Label>
            <Input type="text" placeholder="Additional details..." value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
        </div>
        <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={cancelForm}>Cancel</Button>
          <Button
            variant="primary"
            type="submit"
            loading={submitLoading}
            loadingText={editingItem ? 'Saving Changes...' : 'Saving Room...'}
          >
            {editingItem ? 'Save Changes' : 'Save Room'}
          </Button>
        </div>
      </div>
    </form>
  );
}
