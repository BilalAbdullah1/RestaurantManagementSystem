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
import StatCards from '../../components/ui/UIDesigns/StatCards';
import { Download, Trash2, ArrowUpRight, ArrowDownLeft, FileText, Plus } from 'lucide-react';
import jsPDF from 'jspdf';

interface InventoryTransaction {
  id?: string;
  tenant_id: string;
  item_id: string;
  transaction_type: string;
  quantity: number;
  issued_to?: string;
  purpose?: string;
  reference_number?: string;
  transaction_date: string;
  remarks?: string;
  created_at?: string;
}

interface InventoryItem {
  id: string;
  item_name: string;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const initialFormState = (tenantId: string): InventoryTransaction => ({
  tenant_id: tenantId,
  item_id: '',
  transaction_type: 'Issue',
  quantity: 1,
  transaction_date: getTodayDateString(),
});

const typeOptions = [
  { value: 'Purchase', label: 'Purchase' },
  { value: 'Issue', label: 'Issue' },
  { value: 'Return', label: 'Return' },
  { value: 'Adjustment', label: 'Adjustment' },
];

export default function StockLedger() {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [view, setView] = useState<'list' | 'form'>('list');
  const tenantId = localStorage.getItem('tenantId') || '';
  const [formData, setFormData] = useState<InventoryTransaction>(initialFormState(tenantId));
  const [searchParams] = useSearchParams();

  const openAddView = () => {
    setFormData(initialFormState(tenantId));
    setView('form');
  };

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openAddView();
    }
  }, [searchParams]);

  useEffect(() => {
    if (!tenantId) {
      Swal.fire({ icon: 'error', title: 'Unable to Continue', text: 'Branch not identified.' });
      setLoading(false);
      return;
    }
    fetchData();
  }, [tenantId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, itemsRes] = await Promise.all([
        api.get<InventoryTransaction[]>(`/InventoryTransactions/tenant/${tenantId}`),
        api.get<InventoryItem[]>(`/InventoryItems/tenant/${tenantId}`)
      ]);
      setTransactions(transRes.data);
      setItems(itemsRes.data);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to retrieve ledger data.' });
    } finally {
      setLoading(false);
    }
  };

  const itemOptions = useMemo(() => {
    return items.map(item => ({
      value: item.id,
      label: item.item_name
    }));
  }, [items]);

  const getItemName = (id: string) => {
    return items.find(i => i.id === id)?.item_name || 'Unknown Item';
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item_id) {
        Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select an item.' });
        return;
    }
    setSubmitLoading(true);
    try {
      await api.post('/InventoryTransactions', formData);
      Swal.fire({ icon: 'success', title: 'Recorded', text: 'Transaction recorded.', timer: 2000, showConfirmButton: false });
      setView('list');
      setFormData(initialFormState(tenantId));
      fetchData();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Save Failed', text: err.response?.data?.message || 'Error saving transaction.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteTransaction = async (t: InventoryTransaction) => {
    const result = await Swal.fire({
      title: 'Delete Transaction?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Delete',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/InventoryTransactions/${t.id}`);
      fetchData();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete.' });
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Purchase': return 'success';
      case 'Issue': return 'warning';
      case 'Return': return 'primary';
      case 'Adjustment': return 'light';
      default: return 'light';
    }
  };

  const columns = useMemo<ColumnDef<InventoryTransaction>[]>(() => [
    {
      accessorKey: 'transaction_date',
      header: 'Date',
      cell: ({ row }) => <span className="text-sm">{new Date(row.original.transaction_date).toLocaleDateString()}</span>
    },
    {
      accessorKey: 'item_id',
      header: 'Item',
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {getItemName(row.original.item_id)}
        </span>
      )
    },
    {
      accessorKey: 'transaction_type',
      header: 'Type',
      cell: ({ row }) => <Badge variant="light" color={getTypeBadgeColor(row.original.transaction_type)} size="sm">{row.original.transaction_type}</Badge>
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => <span className="text-sm font-bold text-gray-800 dark:text-gray-300">{row.original.quantity}</span>
    },
    {
      accessorKey: 'issued_to',
      header: 'Issued To / Ref',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.original.issued_to || row.original.reference_number || '-'}
        </span>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ActionMenu
            groups={[
              [
                { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => deleteTransaction(row.original), isDanger: true }
              ]
            ]}
          />
        </div>
      ),
    }
  ], [items]);

  const table = useReactTable({
    data: transactions,
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
    if (transactions.length === 0) return;
    const headers = ['Date', 'Item Name', 'Type', 'Quantity', 'Issued To', 'Reference No'];
    const rows = transactions.map(t => [
      new Date(t.transaction_date).toLocaleDateString(),
      getItemName(t.item_id),
      t.transaction_type,
      t.quantity.toString(),
      t.issued_to || '',
      t.reference_number || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.map(field => `"${field}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Stock_Ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (transactions.length === 0) return;
    const doc = new jsPDF();
    doc.text("Stock Ledger", 14, 15);
    const tableData = transactions.map(t => [
      new Date(t.transaction_date).toLocaleDateString(),
      getItemName(t.item_id),
      t.transaction_type,
      t.quantity,
      t.issued_to || t.reference_number || '-'
    ]);
    (doc as any).autoTable({
      head: [['Date', 'Item Name', 'Type', 'Quantity', 'Issued To / Ref']],
      body: tableData,
      startY: 20,
    });
    doc.save("Stock_Ledger.pdf");
  };

  const totalTransactions = transactions.length;
  const totalPurchases = transactions.filter(t => t.transaction_type === 'Purchase').length;
  const totalIssues = transactions.filter(t => t.transaction_type === 'Issue').length;

  const statCardsData: any[] = [
    { title: 'Total Transactions', value: totalTransactions.toString(), theme: 'brand', icon: <FileText className="w-5 h-5 text-brand-500" /> },
    { title: 'Stock Purchases', value: totalPurchases.toString(), theme: 'success', icon: <ArrowDownLeft className="w-5 h-5 text-success-500" /> },
    { title: 'Stock Issues', value: totalIssues.toString(), theme: 'warning', icon: <ArrowUpRight className="w-5 h-5 text-warning-500" /> }
  ];

  if (view === 'list') {
    return (
      <div className="w-full space-y-6 relative">
        <StatCards stats={statCardsData} loading={loading} />

        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Stock Ledger</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Track all inventory transactions and movements.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={exportCSV} className="hidden sm:flex" title="Export CSV">
                <Download className="w-4 h-4 mr-2" /> CSV
              </Button>
              <Button variant="outline" onClick={exportPDF} className="hidden sm:flex" title="Export PDF">
                <Download className="w-4 h-4 mr-2" /> PDF
              </Button>
              <Button variant="primary" onClick={() => setView('form')}>
                + New Transaction
              </Button>
            </div>
          </div>

          <div className="my-6">
            <Input
              type="text"
              placeholder="Search by item, reference..."
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
                          <FileText className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-1">
                          No Inventory Movements Recorded
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                          Log purchase intake, teacher/department stock issuance, return items, or manual stock reconciliation adjustments.
                        </p>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={openAddView}
                          startIcon={<Plus className="w-4 h-4" />}
                        >
                          Record First Movement
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
                className="px-3 py-1.5 text-sm font-medium rounded-lg border bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Record Transaction</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add a new movement to the stock ledger.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setView('list')}>Back</Button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <SearchableSelect
              label="Item *"
              options={itemOptions}
              value={formData.item_id || 'none'}
              onChange={(val) => setFormData({...formData, item_id: val as string})}
            />
          </div>
          <div>
            <SearchableSelect
              label="Transaction Type *"
              options={typeOptions}
              value={formData.transaction_type}
              onChange={(val) => setFormData({...formData, transaction_type: val as string})}
            />
          </div>
          <div>
            <Label>Quantity *</Label>
            <Input type="number" required min="1" placeholder="e.g. 5" value={formData.quantity.toString()} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})} />
          </div>
          <div>
            <Label>Date *</Label>
            <DatePicker id="t-date" value={formData.transaction_date} onChange={e => setFormData({...formData, transaction_date: e.target.value})} />
          </div>
          <div>
            <Label>Issued To</Label>
            <Input type="text" placeholder="e.g. John Doe / Science Dept" value={formData.issued_to || ''} onChange={e => setFormData({...formData, issued_to: e.target.value})} />
          </div>
          <div>
            <Label>Ref Number</Label>
            <Input type="text" placeholder="e.g. PO-1024" value={formData.reference_number || ''} onChange={e => setFormData({...formData, reference_number: e.target.value})} />
          </div>
        </div>
        <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => setView('list')}>Cancel</Button>
          <Button
            variant="primary"
            type="submit"
            loading={submitLoading}
            loadingText="Saving..."
          >
            Save Transaction
          </Button>
        </div>
      </div>
    </form>
  );
}
