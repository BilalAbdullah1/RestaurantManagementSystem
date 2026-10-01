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

// For PDF/CSV exports
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download, Edit, Trash2, DollarSign, Calendar, TrendingUp } from 'lucide-react';

interface SchoolExpense {
  id?: string;
  tenant_id: string;
  category: string;
  title: string;
  amount: number;
  expense_date: string;
  description: string;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const initialFormState = (tenantId: string): SchoolExpense => ({
  tenant_id: tenantId,
  category: 'Utilities',
  title: '',
  amount: 0,
  expense_date: getTodayDateString(),
  description: '',
});

const categoryOptions = [
  { value: 'Salary', label: 'Salary' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Supplies', label: 'Supplies' },
  { value: 'Events', label: 'Events' },
  { value: 'Miscellaneous', label: 'Miscellaneous' },
];

export default function ExpenseLogs() {
  const [expenses, setExpenses] = useState<SchoolExpense[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingItem, setEditingItem] = useState<SchoolExpense | null>(null);

  const tenantId = localStorage.getItem('tenantId') || '';
  const [formData, setFormData] = useState<SchoolExpense>(initialFormState(tenantId));

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
      const res = await api.get<SchoolExpense[]>(`/SchoolExpenses/tenant/${tenantId}`);
      setExpenses(Array.isArray(res.data) ? res.data : []);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to retrieve expenses.' });
    } finally {
      setLoading(false);
    }
  };

  const openAddView = () => {
    setEditingItem(null);
    setFormData(initialFormState(tenantId));
    setView('form');
  };

  const openEditView = (item: SchoolExpense) => {
    setEditingItem(item);
    setFormData({
      ...item,
      expense_date: new Date(item.expense_date).toISOString().split('T')[0]
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
    if (!formData.title || formData.amount <= 0) {
      Swal.fire({ icon: 'warning', title: 'Invalid Input', text: 'Please provide a valid title and amount.' });
      return;
    }

    setSubmitLoading(true);
    try {
      if (editingItem && editingItem.id) {
        await api.put(`/SchoolExpenses/${editingItem.id}`, formData);
        Swal.fire({ icon: 'success', title: 'Updated', text: 'Expense updated.', timer: 2000, showConfirmButton: false });
      } else {
        await api.post('/SchoolExpenses', formData);
        Swal.fire({ icon: 'success', title: 'Recorded', text: 'Expense recorded.', timer: 2000, showConfirmButton: false });
      }
      cancelForm();
      fetchData();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Save Failed', text: err.response?.data?.message || 'Error saving expense.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteExpense = async (exp: SchoolExpense) => {
    const result = await Swal.fire({
      title: 'Delete Expense?',
      text: `Are you sure you want to delete "${exp.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Delete',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/SchoolExpenses/${exp.id}`);
      Swal.fire({ icon: 'success', title: 'Deleted', text: 'Expense deleted.', timer: 1500, showConfirmButton: false });
      fetchData();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete.' });
    }
  };

  const getCategoryColor = (category: string): "primary" | "success" | "error" | "danger" | "warning" | "info" | "light" | "dark" => {
    switch (category) {
      case 'Salary': return 'info';
      case 'Utilities': return 'warning';
      case 'Maintenance': return 'primary';
      case 'Supplies': return 'success';
      case 'Events': return 'dark';
      case 'Miscellaneous': return 'light';
      default: return 'light';
    }
  };

  const columns = useMemo<ColumnDef<SchoolExpense>[]>(() => [
    {
      accessorKey: 'expense_date',
      header: 'Date',
      cell: ({ row }) => <span className="text-sm text-gray-600 dark:text-gray-300">{new Date(row.original.expense_date).toLocaleDateString()}</span>
    },
    {
      accessorKey: 'title',
      header: 'Title & Desc',
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{row.original.title}</div>
          <div className="text-xs text-gray-500 max-w-[200px] truncate">{row.original.description || '-'}</div>
        </div>
      )
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <Badge variant="light" color={getCategoryColor(row.original.category)} size="sm">{row.original.category}</Badge>
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => <span className="text-sm font-bold text-error-600 dark:text-error-500">${row.original.amount.toFixed(2)}</span>
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
                { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => deleteExpense(row.original), isDanger: true }
              ]
            ]}
          />
        </div>
      ),
    }
  ], []);

  const table = useReactTable({
    data: expenses,
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
    if (expenses.length === 0) return;
    const headers = ['Date', 'Title', 'Category', 'Amount', 'Description'];
    const rows = expenses.map(t => [
      new Date(t.expense_date).toLocaleDateString(),
      t.title,
      t.category,
      t.amount.toString(),
      t.description || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.map(field => `"${field}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'School_Expenses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (expenses.length === 0) return;
    const doc = new jsPDF();
    doc.text("School Expense Logs", 14, 15);
    const tableData = expenses.map(t => [
      new Date(t.expense_date).toLocaleDateString(),
      t.title,
      t.category,
      `Rs. ${Number(t.amount || 0).toLocaleString()}`,
      t.description || '-'
    ]);
    (doc as any).autoTable({
      head: [['Date', 'Title', 'Category', 'Amount', 'Description']],
      body: tableData,
      startY: 20,
    });
    doc.save("School_Expenses.pdf");
  };

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonthCount = expenses.filter(e => new Date(e.expense_date).getMonth() === new Date().getMonth()).length;

  const statCardsData: any[] = [
    { title: 'Total Expense Value', value: `$${totalExpense.toFixed(2)}`, theme: 'error', icon: <DollarSign className="w-5 h-5 text-error-500" /> },
    { title: 'Total Transactions', value: expenses.length.toString(), theme: 'brand', icon: <TrendingUp className="w-5 h-5 text-brand-500" /> },
    { title: 'Expenses This Month', value: thisMonthCount.toString(), theme: 'indigo', icon: <Calendar className="w-5 h-5 text-indigo-500" /> }
  ];

  if (view === 'list') {
    return (
      <div className="w-full space-y-6">
        <StatCards stats={statCardsData} loading={loading} />

        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">School Expense Logs</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Track all general and administrative expenses.
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
                + Record Expense
              </Button>
            </div>
          </div>

          <div className="my-6">
            <Input
              type="text"
              placeholder="Search by title, category..."
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
                    <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-gray-500">
                      No expense logs found.
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{editingItem ? 'Edit Expense' : 'Record Expense'}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Provide details of the school expense.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={cancelForm}>Back</Button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Title *</Label>
            <Input type="text" required placeholder="e.g. Monthly Electric Bill" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
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
            <Label>Amount ($) *</Label>
            <Input type="number" step={0.01} min="0" required placeholder="e.g. 500" value={formData.amount === 0 ? '' : formData.amount.toString()} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} />
          </div>
          <div>
            <Label>Date *</Label>
            <DatePicker id="e-date" value={formData.expense_date} onChange={e => setFormData({...formData, expense_date: e.target.value})} />
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
            loadingText={editingItem ? 'Saving Changes...' : 'Saving Expense...'}
          >
            {editingItem ? 'Save Changes' : 'Save Expense'}
          </Button>
        </div>
      </div>
    </form>
  );
}
