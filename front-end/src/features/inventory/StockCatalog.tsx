import React, { useState, useEffect, useMemo, useRef } from 'react';
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

import { useSearchParams } from 'react-router';
// For PDF/CSV exports
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download, Edit, Trash2, Package, DollarSign, AlertTriangle, Plus } from 'lucide-react';

interface InventoryItem {
  id?: string;
  tenant_id: string;
  item_name: string;
  category: string;
  description?: string;
  quantity: number;
  reorder_level: number;
  unit: string;
  unit_price: number;
  supplier_name?: string;
  location?: string;
  created_at?: string;
}

const initialFormState = (tenantId: string): InventoryItem => ({
  tenant_id: tenantId,
  item_name: '',
  category: 'Stationery',
  description: '',
  quantity: 0,
  reorder_level: 5,
  unit: 'Pcs',
  unit_price: 0,
  supplier_name: '',
  location: '',
});

const categoryOptions = [
  { value: 'Furniture', label: 'Furniture' },
  { value: 'Stationery', label: 'Stationery' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Lab Equipment', label: 'Lab Equipment' },
  { value: 'Cleaning', label: 'Cleaning' },
];

const unitOptions = [
  { value: 'Pcs', label: 'Pcs' },
  { value: 'Box', label: 'Box' },
  { value: 'Kg', label: 'Kg' },
  { value: 'Litre', label: 'Litre' },
  { value: 'Set', label: 'Set' },
];

export default function StockCatalog() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const tenantId = localStorage.getItem('tenantId') || '';
  const [formData, setFormData] = useState<InventoryItem>(initialFormState(tenantId));
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!tenantId) {
      Swal.fire({ icon: 'error', title: 'Unable to Continue', text: 'Branch not identified. Please log in again.' });
      setLoading(false);
      return;
    }
    fetchItems();
  }, [tenantId]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get<InventoryItem[]>(`/InventoryItems/tenant/${tenantId}`);
      setItems(response.data);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to retrieve inventory items.' });
    } finally {
      setLoading(false);
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

  const openEditView = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData(item);
    setView('form');
  };

  const cancelForm = () => {
    setEditingItem(null);
    setFormData(initialFormState(tenantId));
    setView('list');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      if (editingItem && editingItem.id) {
        await api.put(`/InventoryItems/${editingItem.id}`, formData);
        Swal.fire({ icon: 'success', title: 'Updated', text: 'Item details saved.', timer: 2000, showConfirmButton: false });
      } else {
        await api.post('/InventoryItems', formData);
        Swal.fire({ icon: 'success', title: 'Added', text: 'New item added to inventory.', timer: 2000, showConfirmButton: false });
      }
      cancelForm();
      fetchItems();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Save Failed', text: err.response?.data?.message || 'Something went wrong.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteItem = async (item: InventoryItem) => {
    const result = await Swal.fire({
      title: 'Delete Item?',
      text: `Remove "${item.item_name}" from inventory?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Delete',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/InventoryItems/${item.id}`);
      Swal.fire({ icon: 'success', title: 'Deleted', text: 'Item removed.', timer: 1500, showConfirmButton: false });
      fetchItems();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Delete failed.' });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Stationery': return 'primary';
      case 'Furniture': return 'success';
      case 'Electronics': return 'warning';
      case 'Sports': return 'error';
      case 'Cleaning': return 'light';
      default: return 'light';
    }
  };

  const columns = useMemo<ColumnDef<InventoryItem>[]>(() => [
    {
      accessorKey: 'item_name',
      header: 'Item Details',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div>
            <div className="text-sm font-semibold text-gray-800 dark:text-white">{item.item_name}</div>
            <div className="text-xs text-gray-500 max-w-[200px] truncate">{item.description || 'No description'}</div>
          </div>
        );
      }
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <Badge variant="light" color={getCategoryColor(row.original.category)} size="sm">{row.original.category}</Badge>
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => {
        const item = row.original;
        const isLowStock = item.quantity <= item.reorder_level;
        return (
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${isLowStock ? 'text-error-600' : 'text-gray-800 dark:text-gray-300'}`}>
              {item.quantity} {item.unit}
            </span>
            {isLowStock && <span className="text-[10px] uppercase text-error-500 font-bold bg-error-50 dark:bg-error-900/20 px-1.5 py-0.5 rounded">Low</span>}
          </div>
        );
      }
    },
    {
      accessorKey: 'unit_price',
      header: 'Unit Price',
      cell: ({ row }) => <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Rs. {row.original.unit_price.toLocaleString()}</span>
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => <span className="text-sm text-gray-600 dark:text-gray-300">{row.original.location || '-'}</span>
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
                { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => deleteItem(row.original), isDanger: true }
              ]
            ]}
          />
        </div>
      ),
    }
  ], []);

  const table = useReactTable({
    data: items,
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
    if (items.length === 0) return;
    const headers = ['Item Name', 'Category', 'Description', 'Quantity', 'Reorder Level', 'Unit Price', 'Supplier', 'Location'];
    const rows = items.map(i => [
      i.item_name,
      i.category,
      i.description || '',
      `${i.quantity} ${i.unit}`,
      i.reorder_level.toString(),
      i.unit_price.toString(),
      i.supplier_name || '',
      i.location || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.map(field => `"${field}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Inventory_Catalog.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (items.length === 0) return;
    const doc = new jsPDF();
    doc.text("Inventory Catalog", 14, 15);
    const tableData = items.map(i => [
      i.item_name, i.category, `${i.quantity} ${i.unit}`, `Rs. ${i.unit_price.toLocaleString()}`, i.location || '-'
    ]);
    (doc as any).autoTable({
      head: [['Item Name', 'Category', 'Quantity', 'Unit Price', 'Location']],
      body: tableData,
      startY: 20,
    });
    doc.save("Inventory_Catalog.pdf");
  };

  // Stats
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const lowStockCount = items.filter(i => i.quantity <= i.reorder_level).length;

  const statCardsData: any[] = [
    { title: 'Total Items Types', value: totalItems.toString(), theme: 'brand', icon: <Package className="w-5 h-5 text-brand-500" /> },
    { title: 'Total Stock Value', value: `Rs. ${totalValue.toLocaleString()}`, theme: 'success', icon: <DollarSign className="w-5 h-5 text-success-500" /> },
    { title: 'Low Stock Alerts', value: lowStockCount.toString(), theme: 'error', icon: <AlertTriangle className="w-5 h-5 text-error-500" /> }
  ];

  if (view === 'list') {
    return (
      <div className="w-full space-y-6 relative">
        <StatCards stats={statCardsData} loading={loading} />

        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Stock Catalog</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage inventory items, pricing, and monitor stock levels.
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
                + Add Item
              </Button>
            </div>
          </div>

          <div className="my-6">
            <Input
              type="text"
              placeholder="Search items, locations..."
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
                  table.getRowModel().rows.map(row => {
                    const isLowStock = row.original.quantity <= row.original.reorder_level;
                    return (
                      <tr key={row.id} className={`${isLowStock ? 'bg-error-50 dark:bg-error-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'} transition-colors`}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                        <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
                          <Package className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-1">
                          No Inventory Items Registered Yet
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                          Catalog stationery, lab equipment, furniture, or sporting goods to monitor stock levels and reorder thresholds.
                        </p>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={openAddView}
                          startIcon={<Plus className="w-4 h-4" />}
                        >
                          Add First Item
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{editingItem ? 'Edit Item' : 'Add Item'}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Provide item details to update the stock catalog.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={cancelForm}>Back</Button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Item Name *</Label>
            <Input type="text" required placeholder="e.g. A4 Paper" value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} />
          </div>
          <div>
            <SearchableSelect
              label="Category *"
              options={categoryOptions}
              value={formData.category}
              onChange={(val) => setFormData({...formData, category: val as string})}
            />
          </div>
          <div>
            <Label>Initial Quantity *</Label>
            <Input type="number" required placeholder="e.g. 100" value={formData.quantity.toString()} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} disabled={!!editingItem} />
          </div>
          <div>
            <SearchableSelect
              label="Unit *"
              options={unitOptions}
              value={formData.unit}
              onChange={(val) => setFormData({...formData, unit: val as string})}
            />
          </div>
          <div>
            <Label>Unit Price (Rs) *</Label>
            <Input type="number" step={0.01} min="0" required placeholder="e.g. 500" value={formData.unit_price === 0 ? '' : formData.unit_price.toString()} onChange={e => setFormData({...formData, unit_price: parseFloat(e.target.value) || 0})} />
          </div>
          <div>
            <Label>Reorder Level *</Label>
            <Input type="number" required placeholder="e.g. 10" value={formData.reorder_level.toString()} onChange={e => setFormData({...formData, reorder_level: parseInt(e.target.value) || 0})} />
          </div>
          <div>
            <Label>Supplier Name</Label>
            <Input type="text" placeholder="e.g. Office Depot" value={formData.supplier_name || ''} onChange={e => setFormData({...formData, supplier_name: e.target.value})} />
          </div>
          <div>
            <Label>Storage Location</Label>
            <Input type="text" placeholder="e.g. Shelf A, Store Room 1" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Label>Description</Label>
            <Input type="text" placeholder="Additional details..." value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
        </div>
        
        <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={cancelForm}>Cancel</Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitLoading}
            loadingText={editingItem ? 'Saving Changes...' : 'Saving Item...'}
          >
            {editingItem ? 'Save Changes' : 'Save Item'}
          </Button>
        </div>
      </div>
    </form>
  );
}
