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
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import ActionMenu, { ActionMenuItem } from '../../components/ui/UIDesigns/ActionMenu';
import SearchableSelect, { OptionType } from '../../components/form/select/SearchableSelect';
import Label from '../../components/form/Label';
import { toast } from '../../components/ui/Toast';
import { Edit2, Trash2, Download, FileText, Bus, Users, CheckCircle, Plus } from 'lucide-react';

// ─── Interface ─────────────────────────────────────────────────────────────────
interface TransportVehicle {
  id?: string;
  tenant_id: string;
  vehicle_number: string;
  vehicle_type: string; // Bus | Van | Minibus
  model: string;
  capacity: number;
  driver_name: string;
  driver_phone: string;
  driver_license_number?: string;
  is_active: boolean;
  created_at?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const initialFormState = (tenantId: string): TransportVehicle => ({
  tenant_id: tenantId,
  vehicle_number: '',
  vehicle_type: 'Bus',
  model: '',
  capacity: 0,
  driver_name: '',
  driver_phone: '',
  driver_license_number: '',
  is_active: true,
});

type BadgeColor = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark';

const vehicleTypeBadgeColor = (type: string): BadgeColor => {
  switch (type) {
    case 'Bus': return 'primary';
    case 'Van': return 'success';
    case 'Minibus': return 'warning';
    default: return 'light';
  }
};

const vehicleTypeOptions: OptionType[] = [
  { value: 'Bus', label: 'Bus' },
  { value: 'Van', label: 'Van' },
  { value: 'Minibus', label: 'Minibus' }
];

const statusOptions: OptionType[] = [
  { value: true, label: 'Active (In Service)' },
  { value: false, label: 'Inactive (Out of Service)' }
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function TransportSetup() {
  const [vehicles, setVehicles] = useState<TransportVehicle[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingVehicle, setEditingVehicle] = useState<TransportVehicle | null>(null);

  const tenantId = localStorage.getItem('tenantId') || '';
  const [formData, setFormData] = useState<TransportVehicle>(initialFormState(tenantId));
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchParams] = useSearchParams();

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
    fetchVehicles();
  }, [tenantId]);

  // ── Data fetching ────────────────────────────────────────────────────────────
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get<TransportVehicle[]>(`/transportvehicles/tenant/${tenantId}`);
      setVehicles(response.data);
    } catch {
      toast.error('Something went wrong while retrieving vehicle records.');
    } finally {
      setLoading(false);
    }
  };

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter((v) => v.is_active).length;
  const totalCapacity = vehicles.filter((v) => v.is_active).reduce((sum, v) => sum + (v.capacity || 0), 0);

  const statCardsData = [
    { title: 'Total Fleet', value: totalVehicles, icon: <Bus className="w-6 h-6 text-brand-500" />, theme: 'brand' as const },
    { title: 'Active Vehicles', value: activeVehicles, icon: <CheckCircle className="w-6 h-6 text-success-500" />, theme: 'success' as const },
    { title: 'Total Capacity', value: totalCapacity, icon: <Users className="w-6 h-6 text-indigo-500" />, theme: 'indigo' as const },
  ];

  // ── Form helpers ─────────────────────────────────────────────────────────────
  const openAddView = () => {
    setEditingVehicle(null);
    setFormData(initialFormState(tenantId));
    setView('form');
  };

  const openEditView = (vehicle: TransportVehicle) => {
    setEditingVehicle(vehicle);
    setFormData({ ...vehicle, driver_license_number: vehicle.driver_license_number ?? '' });
    setView('form');
  };

  const closeForm = () => {
    setView('list');
    setEditingVehicle(null);
    setFormData(initialFormState(tenantId));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      if (editingVehicle && editingVehicle.id) {
        await api.put(`/transportvehicles/${editingVehicle.id}`, formData);
        toast.success('Vehicle record has been saved.');
      } else {
        await api.post('/transportvehicles', formData);
        toast.success('New vehicle has been registered.');
      }
      closeForm();
      fetchVehicles();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Please review the form and try again.';
      toast.error(errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteVehicle = async (vehicle: TransportVehicle) => {
    const result = await Swal.fire({
      title: 'Delete Vehicle?',
      text: `This will permanently remove vehicle "${vehicle.vehicle_number}" from the system.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/transportvehicles/${vehicle.id}`);
      toast.success('The vehicle record has been removed.');
      fetchVehicles();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'We could not delete this vehicle. Please try again.';
      toast.error(errorMsg);
    }
  };

  // ── Exports ──────────────────────────────────────────────────────────────────
  const exportToCSV = () => {
    const headers = ['Vehicle Number', 'Type', 'Model', 'Capacity', 'Driver Name', 'Driver Phone', 'Status'];
    const rows = vehicles.map(v => [
      v.vehicle_number, v.vehicle_type, v.model, v.capacity.toString(),
      v.driver_name, v.driver_phone, v.is_active ? 'Active' : 'Inactive'
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Transport_Vehicles.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Exported Successfully');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Transport Vehicles Report', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Vehicle #', 'Type', 'Model', 'Capacity', 'Driver', 'Phone', 'Status']],
      body: vehicles.map(v => [
        v.vehicle_number, v.vehicle_type, v.model, v.capacity.toString(),
        v.driver_name, v.driver_phone, v.is_active ? 'Active' : 'Inactive'
      ]),
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [60, 80, 224] }
    });
    doc.save('Transport_Vehicles.pdf');
    toast.success('PDF Exported Successfully');
  };

  // ── Table Columns ────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<TransportVehicle>[]>(() => [
    {
      accessorKey: 'vehicle_number',
      header: 'Vehicle #',
      cell: info => <span className="font-mono font-semibold text-gray-800 dark:text-white/90">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'vehicle_type',
      header: 'Type',
      cell: info => (
        <Badge variant="light" color={vehicleTypeBadgeColor(info.getValue() as string)} size="sm">
          {info.getValue() as string}
        </Badge>
      ),
    },
    {
      accessorKey: 'model',
      header: 'Model',
    },
    {
      accessorKey: 'capacity',
      header: 'Capacity',
      cell: info => (
        <span>
          <span className="font-semibold">{info.getValue() as number}</span>
          <span className="text-gray-400 ml-1 text-xs">seats</span>
        </span>
      ),
    },
    {
      accessorKey: 'driver_name',
      header: 'Driver',
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-semibold text-gray-800 dark:text-white/90">{row.original.driver_name}</div>
          {row.original.driver_license_number && (
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-mono">
              Lic: {row.original.driver_license_number}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'driver_phone',
      header: 'Driver Phone',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: info => {
        const isActive = info.getValue() as boolean;
        return (
          <Badge
            variant="light"
            color={isActive ? 'success' : 'error'}
            size="sm"
            startIcon={<span className={`w-1.5 h-1.5 rounded-full inline-block ${isActive ? 'bg-success-500' : 'bg-error-500'}`} />}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const vehicle = row.original;
        const groups: ActionMenuItem[][] = [
          [
            { label: 'Edit Vehicle', icon: <Edit2 className="w-4 h-4" />, onClick: () => openEditView(vehicle) }
          ],
          [
            { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => deleteVehicle(vehicle), isDanger: true }
          ]
        ];
        return (
          <div className="flex justify-end">
            <ActionMenu groups={groups} />
          </div>
        );
      },
    }
  ], []);

  const table = useReactTable({
    data: vehicles,
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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Transport Vehicles</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage school transport fleet — buses, vans, and minibuses.
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
                + Add Vehicle
              </Button>
            </div>
          </div>

          {/* Global Search */}
          <div className="my-6 max-w-md">
            <Input
              type="text"
              placeholder="Search by number, model, driver..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[250px]">
            <table className="w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
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
                          No Fleet Vehicles Registered Yet
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                          Register your school buses, vans, drivers, and capacity limits to start setting up transport routes.
                        </p>
                        <Button variant="primary" onClick={openAddView} startIcon={<Plus className="w-4 h-4" />}>
                          + Register First Vehicle
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
            {editingVehicle ? 'Edit Vehicle Details' : 'Register New Vehicle'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ensure all mandatory fields (*) are accurately populated.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={closeForm}>
          Back to Vehicles
        </Button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Card 1: Vehicle Information */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <span className="text-brand-500">🚌</span> Vehicle Information
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <Label>Vehicle Number *</Label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. ABC-123"
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                />
              </div>
              <div>
                <SearchableSelect
                  label="Vehicle Type *"
                  options={vehicleTypeOptions}
                  value={formData.vehicle_type}
                  onChange={(val) => setFormData({ ...formData, vehicle_type: val as string })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <Label>Model *</Label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Toyota Coaster"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
              <div>
                <Label>Seating Capacity *</Label>
                <Input
                  type="number"
                  required
                  placeholder="e.g. 30"
                  value={formData.capacity === 0 ? '' : String(formData.capacity)}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <SearchableSelect
                label="Status *"
                options={statusOptions}
                value={formData.is_active}
                onChange={(val) => setFormData({ ...formData, is_active: val as boolean })}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Driver Information */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <span className="text-warning-500">🧑‍✈️</span> Driver Information
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <Label>Driver Full Name *</Label>
              <Input
                type="text"
                required
                placeholder="e.g. Muhammad Aslam"
                value={formData.driver_name}
                onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Driver Phone Number *</Label>
              <Input
                type="text"
                required
                placeholder="e.g. 0300-1234567"
                value={formData.driver_phone}
                onChange={(e) => setFormData({ ...formData, driver_phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Driver License Number</Label>
              <Input
                type="text"
                placeholder="e.g. LHR-12345-2020"
                value={formData.driver_license_number ?? ''}
                onChange={(e) => setFormData({ ...formData, driver_license_number: e.target.value })}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Form Actions */}
      <div className="flex justify-end items-center gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        <Button type="button" variant="outline" onClick={closeForm}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={submitLoading}
          loadingText={editingVehicle ? 'Saving Changes...' : 'Registering Vehicle...'}
          className="min-w-[160px]"
        >
          {editingVehicle ? 'Save Changes' : 'Register Vehicle'}
        </Button>
      </div>

    </form>
  );
}
