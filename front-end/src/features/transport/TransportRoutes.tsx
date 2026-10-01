import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import SearchableSelect, { OptionType } from '../../components/form/select/SearchableSelect';
import Label from '../../components/form/Label';
import { toast } from '../../components/ui/Toast';
import { FileText, Download, Map, MapPin, Edit2, Trash2 } from 'lucide-react';

// ─── Interfaces ─────────────────────────────────────────────────────────────────
interface TransportRoute {
  id?: string;
  tenant_id: string;
  route_name: string;
  start_point: string;
  end_point: string;
  stops?: string;
  monthly_fee: number;
  vehicle_id?: string | null;
  is_active: boolean;
  created_at?: string;
}

interface TransportVehicle {
  id: string;
  vehicle_number: string;
  vehicle_type: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const initialFormState = (tenantId: string): TransportRoute => ({
  tenant_id: tenantId,
  route_name: '',
  start_point: '',
  end_point: '',
  stops: '',
  monthly_fee: 0,
  vehicle_id: null,
  is_active: true,
});

const statusOptions: OptionType[] = [
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' }
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function TransportRoutesPage() {
  const [routes, setRoutes]                       = useState<TransportRoute[]>([]);
  const [vehicles, setVehicles]                   = useState<TransportVehicle[]>([]);
  
  const [globalFilter, setGlobalFilter]           = useState('');
  const [loading, setLoading]                     = useState(true);
  const [submitLoading, setSubmitLoading]         = useState(false);
  const [isDrawerOpen, setIsDrawerOpen]           = useState(false);

  const [sorting, setSorting]                     = useState<SortingState>([]);
  const [editingRoute, setEditingRoute]           = useState<TransportRoute | null>(null);

  const tenantId = localStorage.getItem('tenantId') || '';
  const [formData, setFormData]                   = useState<TransportRoute>(initialFormState(tenantId));

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
      const [routesRes, vehiclesRes] = await Promise.all([
        api.get<TransportRoute[]>(`/transportroutes/tenant/${tenantId}`),
        api.get<TransportVehicle[]>(`/transportvehicles/tenant/${tenantId}`)
      ]);
      
      setRoutes(routesRes.data);
      setVehicles(vehiclesRes.data);
    } catch {
      toast.error('Something went wrong while retrieving data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutesOnly = async () => {
    try {
      const response = await api.get<TransportRoute[]>(`/transportroutes/tenant/${tenantId}`);
      setRoutes(response.data);
    } catch {
      toast.error('Failed to refresh transport routes.');
    }
  };

  // ── Dropdown Options ─────────────────────────────────────────────────────────
  const vehicleOptions: OptionType[] = useMemo(() => {
    const opts = vehicles.map(v => ({
      value: v.id,
      label: `${v.vehicle_number} (${v.vehicle_type})`
    }));
    // Allow empty selection
    return [{ value: 'none', label: '--- No Vehicle Assigned ---' }, ...opts];
  }, [vehicles]);

  const getVehicleName = (id?: string | null) => {
    if (!id) return 'Unassigned';
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? `${vehicle.vehicle_number} (${vehicle.vehicle_type})` : 'Unassigned';
  };

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalRoutes  = routes.length;
  const activeRoutes = routes.filter((r) => r.is_active).length;

  const statCardsData = [
    { title: 'Total Routes', value: totalRoutes, icon: <Map className="w-6 h-6 text-brand-500" />, theme: 'brand' as const },
    { title: 'Active Routes', value: activeRoutes, icon: <MapPin className="w-6 h-6 text-success-500" />, theme: 'success' as const },
  ];

  // ── Form helpers ─────────────────────────────────────────────────────────────
  const openAddDrawer = () => {
    setEditingRoute(null);
    setFormData(initialFormState(tenantId));
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (route: TransportRoute) => {
    setEditingRoute(route);
    setFormData({
      ...route,
      stops: route.stops || '',
    });
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingRoute(null);
    setFormData(initialFormState(tenantId));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    const payload: TransportRoute = {
      ...formData,
      vehicle_id: formData.vehicle_id === 'none' ? null : formData.vehicle_id,
      stops: formData.stops?.trim() ? formData.stops : undefined,
    };

    try {
      if (editingRoute && editingRoute.id) {
        await api.put(`/transportroutes/${editingRoute.id}`, payload);
        toast.success('The transport route has been saved.');
      } else {
        await api.post('/transportroutes', payload);
        toast.success('The transport route has been created.');
      }
      closeDrawer();
      fetchRoutesOnly();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Please review the form and try again.';
      toast.error(errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteRoute = async (route: TransportRoute) => {
    const result = await Swal.fire({
      title: 'Delete Route?',
      text: `This will permanently remove the route "${route.route_name}". This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/transportroutes/${route.id}`);
      toast.success('The transport route has been removed.');
      fetchRoutesOnly();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'We could not remove this route. Please try again.';
      toast.error(errorMsg);
    }
  };

  // ── Exports ──────────────────────────────────────────────────────────────────
  const exportToCSV = () => {
    const headers = ['Route Name', 'Start Point', 'End Point', 'Monthly Fee', 'Assigned Vehicle', 'Status'];
    const rows = routes.map(r => [
      r.route_name,
      r.start_point,
      r.end_point,
      r.monthly_fee.toString(),
      getVehicleName(r.vehicle_id),
      r.is_active ? 'Active' : 'Inactive'
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.map(field => `"${field}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Transport_Routes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Exported Successfully');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Transport Routes Report', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Route Name', 'Start Point', 'End Point', 'Fee', 'Vehicle', 'Status']],
      body: routes.map(r => [
        r.route_name,
        r.start_point,
        r.end_point,
        r.monthly_fee.toString(),
        getVehicleName(r.vehicle_id),
        r.is_active ? 'Active' : 'Inactive'
      ]),
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [60, 80, 224] }
    });
    doc.save('Transport_Routes.pdf');
    toast.success('PDF Exported Successfully');
  };

  // ── Table Columns ────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<TransportRoute>[]>(() => [
    {
      accessorKey: 'route_name',
      header: 'Route Name',
      cell: info => <span className="font-semibold text-gray-800 dark:text-white/90">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'start_point',
      header: 'Start Point',
    },
    {
      accessorKey: 'end_point',
      header: 'End Point',
    },
    {
      accessorKey: 'monthly_fee',
      header: 'Monthly Fee',
      cell: info => <span className="font-semibold text-brand-600 dark:text-brand-400">Rs. {info.getValue() as number}</span>,
    },
    {
      accessorKey: 'vehicle_id',
      header: 'Vehicle Assigned',
      cell: info => <span className="text-gray-600 dark:text-gray-300">{getVehicleName(info.getValue() as string | null)}</span>,
      filterFn: (row, id, value) => {
        const val = getVehicleName(row.getValue(id));
        return val.toLowerCase().includes(value.toLowerCase());
      }
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
        const route = row.original;
        const groups: ActionMenuItem[][] = [
          [
            { label: 'Edit Route', icon: <Edit2 className="w-4 h-4" />, onClick: () => openEditDrawer(route) }
          ],
          [
            { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => deleteRoute(route), isDanger: true }
          ]
        ];
        return (
          <div className="flex justify-end">
            <ActionMenu groups={groups} />
          </div>
        );
      },
    }
  ], [vehicles]);

  const table = useReactTable({
    data: routes,
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

  // ── Drawer Sections for the UI ────────────────────────────────────────────────
  // The drawer can display details cleanly when viewing, but since we want to edit directly inside it, 
  // we will inject a custom Form inside the drawer. Wait, the user reverted the changes to ProfileDrawer 
  // that allowed `children`. Let's check `ProfileDrawer.tsx` to see if we can use it, or if we need 
  // to build a custom slide-over drawer for forms. 
  
  // Ah, the user made me revert `ProfileDrawer.tsx` so it ONLY accepts `sections` and DOES NOT accept `children`.
  // So we CANNOT use `ProfileDrawer` to render a form inside it.
  // We must render our own sliding Drawer component here or use the full-page layout.
  // The prompt says "I will use the ProfileDrawer slide-over to handle the Add/Edit form", but since it doesn't take children,
  // I will just implement a standard full-page conditional form or a custom overlay in this file. 
  // Wait! Let's just create a custom slide-over inline here so it looks exactly like ProfileDrawer but takes form elements.
  
  const renderSlideOver = () => {
    if (!isDrawerOpen) return null;
    return createPortal(
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 z-[9998] bg-gray-900/40 backdrop-blur-sm transition-opacity" 
          onClick={closeDrawer}
        />
        {/* Drawer */}
        <div className="fixed inset-y-0 right-0 z-[9999] w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 transform translate-x-0 border-l border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              {editingRoute ? 'Edit Route Details' : 'Add New Route'}
            </h2>
            <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <form id="route-form" onSubmit={handleFormSubmit} className="space-y-5">
              <div>
                <Label>Route Name *</Label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Blue Line"
                  value={formData.route_name}
                  onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Start Point *</Label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Central Station"
                  value={formData.start_point}
                  onChange={(e) => setFormData({ ...formData, start_point: e.target.value })}
                />
              </div>
              <div>
                <Label>End Point *</Label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. School Campus"
                  value={formData.end_point}
                  onChange={(e) => setFormData({ ...formData, end_point: e.target.value })}
                />
              </div>
              <div>
                <Label>Stops (optional)</Label>
                <Input
                  type="text"
                  placeholder="e.g. Stop A, Stop B"
                  value={formData.stops || ''}
                  onChange={(e) => setFormData({ ...formData, stops: e.target.value })}
                />
              </div>
              <div>
                <Label>Monthly Fee (Rs.) *</Label>
                <Input
                  type="number"
                  required
                  min="0"
                  step={0.01}
                  placeholder="e.g. 5000"
                  value={formData.monthly_fee === 0 ? '' : String(formData.monthly_fee)}
                  onChange={(e) => setFormData({ ...formData, monthly_fee: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <SearchableSelect
                  label="Assign Vehicle"
                  options={vehicleOptions}
                  value={formData.vehicle_id || 'none'}
                  onChange={(val) => setFormData({ ...formData, vehicle_id: val as string })}
                />
              </div>
              <div>
                <SearchableSelect
                  label="Status *"
                  options={statusOptions}
                  value={formData.is_active}
                  onChange={(val) => setFormData({ ...formData, is_active: val as boolean })}
                />
              </div>
            </form>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
            <Button variant="outline" onClick={closeDrawer}>Cancel</Button>
            <Button
              form="route-form"
              type="submit"
              variant="primary"
              loading={submitLoading}
              loadingText="Saving..."
            >
              Save Route
            </Button>
          </div>
        </div>
      </>,
      document.body
    );
  };

  // ─── LIST VIEW ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-6 relative">
      <StatCards stats={statCardsData} loading={loading} />

      {/* Main Table Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Transport Routes</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage transport routes, fees, and assigned vehicles.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={exportToCSV} className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPDF} className="flex items-center gap-2">
              <Download className="w-4 h-4" /> PDF
            </Button>
            <Button variant="primary" onClick={openAddDrawer} className="w-full sm:w-auto flex items-center gap-2">
              + Create Route
            </Button>
          </div>
        </div>

        {/* Global Search */}
        <div className="my-6 max-w-md">
          <Input
            type="text"
            placeholder="Search by route, vehicle, driver..."
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
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
                    No routes found matching your criteria.
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
      
      {/* Slide-over Drawer for Form */}
      {renderSlideOver()}
    </div>
  );
}
