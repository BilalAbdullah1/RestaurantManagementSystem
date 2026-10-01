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
import { Download, Bookmark, Clock, CheckCircle, RefreshCcw, Trash2, Plus } from 'lucide-react';

interface BookIssuance {
  id?: string;
  tenant_id: string;
  book_id: string;
  student_id?: string;
  staff_id?: string;
  borrower_type: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: string;
  fine_amount?: number;
  remarks?: string;
}

interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn?: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  admission_number?: string;
}

interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  designation?: string;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const initialFormState = (tenantId: string): BookIssuance => ({
  tenant_id: tenantId,
  book_id: '',
  borrower_type: 'Student',
  student_id: '',
  issue_date: getTodayDateString(),
  due_date: getTodayDateString(),
  status: 'Issued',
});

const borrowerTypeOptions = [
  { value: 'Student', label: 'Student' },
  { value: 'Staff', label: 'Staff' }
];

export default function IssueBooks() {
  const [issuances, setIssuances] = useState<BookIssuance[]>([]);
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [view, setView] = useState<'list' | 'form' | 'return'>('list');
  const [editingIssuance, setEditingIssuance] = useState<BookIssuance | null>(null);

  const tenantId = localStorage.getItem('tenantId') || '';
  const [formData, setFormData] = useState<BookIssuance>(initialFormState(tenantId));
  const [searchParams] = useSearchParams();
  
  // Return form specific state
  const [returnDate, setReturnDate] = useState(getTodayDateString());
  const [fineAmount, setFineAmount] = useState(0);

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
      const [issueRes, bookRes, studRes, staffRes] = await Promise.all([
        api.get<BookIssuance[]>(`/BookIssuances/tenant/${tenantId}`),
        api.get<LibraryBook[]>(`/LibraryBooks/tenant/${tenantId}`),
        api.get<Student[]>(`/students/tenant/${tenantId}`),
        api.get<Staff[]>(`/Staff/tenant/${tenantId}`)
      ]);
      setIssuances(issueRes.data);
      setBooks(bookRes.data);
      setStudents(studRes.data);
      setStaff(staffRes.data);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to retrieve related records.' });
    } finally {
      setLoading(false);
    }
  };

  const getBookTitle = (id: string) => {
    const b = books.find(x => x.id === id);
    return b ? b.title : id;
  };

  const getBorrowerName = (type: string, studentId?: string, staffId?: string) => {
    if (type === 'Student' && studentId) {
      const s = students.find(x => x.id === studentId);
      return s ? `${s.first_name} ${s.last_name}` : studentId;
    } else if (type === 'Staff' && staffId) {
      const s = staff.find(x => x.id === staffId);
      return s ? `${s.first_name} ${s.last_name}` : staffId;
    }
    return 'Unknown';
  };

  const bookOptions = books.map(b => ({ value: b.id, label: `${b.title} ${b.isbn ? `(ISBN: ${b.isbn})` : ''}` }));
  const studentOptions = students.map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name} ${s.admission_number ? `(${s.admission_number})` : ''}` }));
  const staffOptions = staff.map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name} ${s.designation ? `(${s.designation})` : ''}` }));

  const openIssueView = () => {
    setFormData(initialFormState(tenantId));
    setView('form');
  };

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openIssueView();
    }
  }, [searchParams]);

  const openReturnView = (item: BookIssuance) => {
    setEditingIssuance(item);
    setReturnDate(getTodayDateString());
    setFineAmount(0);
    setView('return');
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.book_id) {
      Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'Please select a book.' });
      return;
    }
    if (formData.borrower_type === 'Student' && !formData.student_id) {
      Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'Please select a student.' });
      return;
    }
    if (formData.borrower_type === 'Staff' && !formData.staff_id) {
      Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'Please select a staff member.' });
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = { ...formData };
      if (payload.borrower_type === 'Student') delete payload.staff_id;
      if (payload.borrower_type === 'Staff') delete payload.student_id;
      
      await api.post('/BookIssuances', payload);
      Swal.fire({ icon: 'success', title: 'Issued', text: 'Book issued successfully.', timer: 2000, showConfirmButton: false });
      setView('list');
      fetchData();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.response?.data?.message || 'Error issuing book.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIssuance?.id) return;
    setSubmitLoading(true);
    try {
      await api.put(`/BookIssuances/${editingIssuance.id}/return`, {
        return_date: returnDate,
        fine_amount: fineAmount,
        remarks: 'Returned via UI'
      });
      Swal.fire({ icon: 'success', title: 'Returned', text: 'Book return recorded.', timer: 2000, showConfirmButton: false });
      setView('list');
      fetchData();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.response?.data?.message || 'Error returning book.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteRecord = async (rec: BookIssuance) => {
    const result = await Swal.fire({
      title: 'Delete Record?',
      text: 'Are you sure you want to delete this issuance record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Delete',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/BookIssuances/${rec.id}`);
      Swal.fire({ icon: 'success', title: 'Deleted', text: 'Issuance record deleted.', timer: 1500, showConfirmButton: false });
      fetchData();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete.' });
    }
  };

  const getStatusColor = (status: string): any => {
    switch (status) {
      case 'Issued': return 'primary';
      case 'Returned': return 'success';
      case 'Overdue': return 'error';
      default: return 'light';
    }
  };

  const columns = useMemo<ColumnDef<BookIssuance>[]>(() => [
    {
      accessorKey: 'book_id',
      header: 'Book Title',
      cell: ({ row }) => (
        <div className="font-semibold text-gray-800 dark:text-gray-200">
          {getBookTitle(row.original.book_id)}
        </div>
      )
    },
    {
      id: 'borrower',
      accessorFn: (row) => getBorrowerName(row.borrower_type, row.student_id, row.staff_id),
      header: 'Borrower',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-800 dark:text-gray-200">{getBorrowerName(row.original.borrower_type, row.original.student_id, row.original.staff_id)}</div>
          <div className="text-xs text-gray-500">{row.original.borrower_type}</div>
        </div>
      )
    },
    {
      accessorKey: 'issue_date',
      header: 'Issue Date',
      cell: ({ row }) => <span className="text-sm text-gray-600 dark:text-gray-300">{new Date(row.original.issue_date).toLocaleDateString()}</span>
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row }) => (
        <span className={`text-sm ${row.original.status === 'Overdue' ? 'text-error-600 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>
          {new Date(row.original.due_date).toLocaleDateString()}
        </span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge color={getStatusColor(row.original.status)} variant="light">{row.original.status}</Badge>
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const canReturn = row.original.status === 'Issued' || row.original.status === 'Overdue';
        const groups = [];
        
        if (canReturn) {
          groups.push([{ label: 'Return Book', icon: <RefreshCcw className="w-4 h-4 text-success-500" />, onClick: () => openReturnView(row.original) }]);
        }
        groups.push([{ label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => deleteRecord(row.original), isDanger: true }]);

        return (
          <div className="flex justify-end">
            <ActionMenu groups={groups} />
          </div>
        );
      },
    }
  ], [books, students, staff]);

  const table = useReactTable({
    data: issuances,
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
    if (issuances.length === 0) return;
    const headers = ['Book Title', 'Borrower', 'Type', 'Issue Date', 'Due Date', 'Status'];
    const rowsList = issuances.map(i => [
      getBookTitle(i.book_id),
      getBorrowerName(i.borrower_type, i.student_id, i.staff_id),
      i.borrower_type,
      new Date(i.issue_date).toLocaleDateString(),
      new Date(i.due_date).toLocaleDateString(),
      i.status
    ]);
    const csvContent = [headers.join(','), ...rowsList.map(e => e.map(field => `"${field}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Book_Issuances.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (issuances.length === 0) return;
    const doc = new jsPDF();
    doc.text("Book Issuances Report", 14, 15);
    const tableData = issuances.map(i => [
      getBookTitle(i.book_id),
      getBorrowerName(i.borrower_type, i.student_id, i.staff_id),
      new Date(i.issue_date).toLocaleDateString(),
      new Date(i.due_date).toLocaleDateString(),
      i.status
    ]);
    (doc as any).autoTable({
      head: [['Book', 'Borrower', 'Issue Date', 'Due Date', 'Status']],
      body: tableData,
      startY: 20,
    });
    doc.save("Book_Issuances.pdf");
  };

  const totalIssued = issuances.length;
  const currentlyOut = issuances.filter(i => i.status === 'Issued' || i.status === 'Overdue').length;
  const overdueCount = issuances.filter(i => i.status === 'Overdue').length;

  const statCardsData: any[] = [
    { title: 'Total Transactions', value: totalIssued.toString(), theme: 'brand', icon: <Bookmark className="w-5 h-5 text-brand-500" /> },
    { title: 'Currently Issued', value: currentlyOut.toString(), theme: 'success', icon: <CheckCircle className="w-5 h-5 text-success-500" /> },
    { title: 'Overdue Returns', value: overdueCount.toString(), theme: 'error', icon: <Clock className="w-5 h-5 text-error-500" /> }
  ];

  if (view === 'list') {
    return (
      <div className="w-full space-y-6">
        <StatCards stats={statCardsData} loading={loading} />

        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Issue & Return Books</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage book checkouts and track overdue returns.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={exportCSV} className="hidden sm:flex" title="Export CSV">
                <Download className="w-4 h-4 mr-2" /> CSV
              </Button>
              <Button variant="outline" onClick={exportPDF} className="hidden sm:flex" title="Export PDF">
                <Download className="w-4 h-4 mr-2" /> PDF
              </Button>
              <Button variant="primary" onClick={openIssueView}>
                + Issue Book
              </Button>
            </div>
          </div>

          <div className="my-6">
            <Input
              type="text"
              placeholder="Search by book title, borrower name..."
              value={globalFilter}
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
                      {columns.map((_, colIndex) => (
                        <td key={`skeleton-cell-${colIndex}`} className="px-6 py-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${row.original.status === 'Overdue' ? 'bg-error-50 dark:bg-error-900/10' : ''}`}>
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
                          <Bookmark className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-1">
                          No Books Currently Issued
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                          Lend cataloged books to enrolled students or staff members, assign return due dates, and monitor overdue fines.
                        </p>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={openIssueView}
                          startIcon={<Plus className="w-4 h-4" />}
                        >
                          Issue First Book
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

  if (view === 'return') {
    return (
      <form onSubmit={handleReturnSubmit} className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Return Book</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {editingIssuance ? `Recording return for "${getBookTitle(editingIssuance.book_id)}"` : ''}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setView('list')}>Back</Button>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Return Date *</Label>
              <DatePicker id="ret-date" value={returnDate} onChange={e => setReturnDate(e.target.value)} />
            </div>
            <div>
              <Label>Fine Amount (Rs)</Label>
              <Input type="number" step={0.01} min="0" value={fineAmount === 0 ? '' : fineAmount.toString()} onChange={e => setFineAmount(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setView('list')}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitLoading}>{submitLoading ? 'Processing...' : 'Confirm Return'}</Button>
          </div>
        </div>
      </form>
    );
  }

  // ISSUE FORM
  return (
    <form onSubmit={handleIssueSubmit} className="w-full space-y-6">
      <div className="flex justify-between items-center p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Issue Book</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Assign a book to a student or staff member.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setView('list')}>Back</Button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <SearchableSelect
              label="Select Book *"
              options={bookOptions}
              value={formData.book_id}
              onChange={(val) => setFormData({...formData, book_id: val as string})}
            />
          </div>
          <div>
            <SearchableSelect
              label="Borrower Type *"
              options={borrowerTypeOptions}
              value={formData.borrower_type}
              onChange={(val) => {
                setFormData({
                  ...formData,
                  borrower_type: val as string,
                  student_id: '',
                  staff_id: ''
                });
              }}
            />
          </div>
          
          {formData.borrower_type === 'Student' ? (
            <div>
              <SearchableSelect
                label="Select Student *"
                options={studentOptions}
                value={formData.student_id || ''}
                onChange={(val) => setFormData({...formData, student_id: val as string})}
              />
            </div>
          ) : (
            <div>
              <SearchableSelect
                label="Select Staff *"
                options={staffOptions}
                value={formData.staff_id || ''}
                onChange={(val) => setFormData({...formData, staff_id: val as string})}
              />
            </div>
          )}

          <div>
            <Label>Issue Date *</Label>
            <DatePicker id="i-date" value={formData.issue_date} onChange={e => setFormData({...formData, issue_date: e.target.value})} />
          </div>
          <div>
            <Label>Due Date *</Label>
            <DatePicker id="d-date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
          </div>
        </div>
        <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => setView('list')}>Cancel</Button>
          <Button variant="primary" type="submit" loading={submitLoading} loadingText="Issuing...">Issue Book</Button>
        </div>
      </div>
    </form>
  );
}
