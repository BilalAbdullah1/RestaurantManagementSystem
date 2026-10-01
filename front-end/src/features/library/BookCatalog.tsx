import React, { useState, useEffect, useMemo } from 'react';
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
import { Download, Edit, Trash2, Book, BookOpen, Library, Plus } from 'lucide-react';

interface LibraryBook {
  id?: string;
  tenant_id: string;
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publication_year?: number;
  category: string;
  shelf_location?: string;
  total_copies: number;
  available_copies: number;
  price?: number;
}

const initialFormState = (tenantId: string): LibraryBook => ({
  tenant_id: tenantId,
  title: '',
  author: '',
  isbn: '',
  publisher: '',
  category: 'General',
  shelf_location: '',
  total_copies: 1,
  available_copies: 1,
});

const categoryOptions = [
  { value: 'Science', label: 'Science' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Literature', label: 'Literature' },
  { value: 'History', label: 'History' },
  { value: 'Computer', label: 'Computer' },
  { value: 'Religion', label: 'Religion' },
  { value: 'General', label: 'General' },
];

export default function BookCatalog() {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingBook, setEditingBook] = useState<LibraryBook | null>(null);

  const tenantId = localStorage.getItem('tenantId') || '';
  const [formData, setFormData] = useState<LibraryBook>(initialFormState(tenantId));
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!tenantId) {
      Swal.fire({ icon: 'error', title: 'Unable to Continue', text: 'School not identified.' });
      setLoading(false);
      return;
    }
    fetchBooks();
  }, [tenantId]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get<LibraryBook[]>(`/LibraryBooks/tenant/${tenantId}`);
      setBooks(response.data);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to retrieve books.' });
    } finally {
      setLoading(false);
    }
  };

  const openAddView = () => {
    setEditingBook(null);
    setFormData(initialFormState(tenantId));
    setView('form');
  };

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openAddView();
    }
  }, [searchParams]);

  const openEditView = (book: LibraryBook) => {
    setEditingBook(book);
    setFormData(book);
    setView('form');
  };

  const cancelForm = () => {
    setEditingBook(null);
    setFormData(initialFormState(tenantId));
    setView('list');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.category) {
      Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'Please fill in all required fields.' });
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = { ...formData };
      if (!editingBook) {
        payload.available_copies = payload.total_copies;
      }

      if (editingBook && editingBook.id) {
        await api.put(`/LibraryBooks/${editingBook.id}`, payload);
        Swal.fire({ icon: 'success', title: 'Updated', text: 'Book details saved.', timer: 2000, showConfirmButton: false });
      } else {
        await api.post('/LibraryBooks', payload);
        Swal.fire({ icon: 'success', title: 'Added', text: 'New book added.', timer: 2000, showConfirmButton: false });
      }
      cancelForm();
      fetchBooks();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Save Failed', text: err.response?.data?.message || 'Something went wrong.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteBook = async (book: LibraryBook) => {
    const result = await Swal.fire({
      title: 'Delete Book?',
      text: 'Are you sure you want to delete this book from the catalog?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Delete',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/LibraryBooks/${book.id}`);
      Swal.fire({ icon: 'success', title: 'Deleted', text: 'Book deleted.', timer: 1500, showConfirmButton: false });
      fetchBooks();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete book.' });
    }
  };

  const columns = useMemo<ColumnDef<LibraryBook>[]>(() => [
    {
      accessorKey: 'title',
      header: 'Book Details',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-gray-800 dark:text-gray-200">{row.original.title}</div>
          <div className="text-xs text-gray-500">ISBN: {row.original.isbn || 'N/A'} • {row.original.shelf_location || 'No Shelf'}</div>
        </div>
      )
    },
    {
      accessorKey: 'author',
      header: 'Author',
      cell: ({ row }) => <span className="text-gray-600 dark:text-gray-300 font-medium">{row.original.author}</span>
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <Badge color="primary" variant="light">{row.original.category}</Badge>
    },
    {
      accessorKey: 'available_copies',
      header: 'Availability',
      cell: ({ row }) => (
        <span className={`font-bold ${row.original.available_copies > 0 ? 'text-success-600' : 'text-error-600'}`}>
            {row.original.available_copies} / {row.original.total_copies}
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
                { label: 'Edit', icon: <Edit className="w-4 h-4" />, onClick: () => openEditView(row.original) },
              ],
              [
                { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => deleteBook(row.original), isDanger: true }
              ]
            ]}
          />
        </div>
      ),
    }
  ], []);

  const table = useReactTable({
    data: books,
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
    if (books.length === 0) return;
    const headers = ['Title', 'Author', 'Category', 'ISBN', 'Shelf Location', 'Available', 'Total Copies'];
    const rowsList = books.map(t => [
      t.title,
      t.author,
      t.category,
      t.isbn || '',
      t.shelf_location || '',
      t.available_copies.toString(),
      t.total_copies.toString()
    ]);
    const csvContent = [headers.join(','), ...rowsList.map(e => e.map(field => `"${field}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Library_Catalog.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (books.length === 0) return;
    const doc = new jsPDF();
    doc.text("Library Catalog", 14, 15);
    const tableData = books.map(t => [
      t.title,
      t.author,
      t.category,
      t.isbn || '-',
      `${t.available_copies} / ${t.total_copies}`
    ]);
    (doc as any).autoTable({
      head: [['Title', 'Author', 'Category', 'ISBN', 'Availability']],
      body: tableData,
      startY: 20,
    });
    doc.save("Library_Catalog.pdf");
  };

  const totalBooks = books.length;
  const totalCopies = books.reduce((sum, b) => sum + b.total_copies, 0);
  const totalAvailable = books.reduce((sum, b) => sum + b.available_copies, 0);

  const statCardsData: any[] = [
    { title: 'Total Titles', value: totalBooks.toString(), theme: 'brand', icon: <Library className="w-5 h-5 text-brand-500" /> },
    { title: 'Total Copies', value: totalCopies.toString(), theme: 'primary', icon: <Book className="w-5 h-5 text-primary-500" /> },
    { title: 'Available Copies', value: totalAvailable.toString(), theme: 'success', icon: <BookOpen className="w-5 h-5 text-success-500" /> }
  ];

  if (view === 'list') {
    return (
      <div className="w-full space-y-6">
        <StatCards stats={statCardsData} loading={loading} />

        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Library Catalog</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage all books and resources in the school library.
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
                + Add Book
              </Button>
            </div>
          </div>

          <div className="my-6">
            <Input
              type="text"
              placeholder="Search books by title, author, category, ISBN..."
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
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-1">
                          No Books in Library Catalog Yet
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                          Register textbooks, reference materials, fiction, and academic journals with ISBNs, rack shelf locations, and total copies.
                        </p>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={openAddView}
                          startIcon={<Plus className="w-4 h-4" />}
                        >
                          Add First Book
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{editingBook ? 'Edit Book' : 'Add Book'}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Provide details for the library catalog record.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={cancelForm}>Back</Button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Title *</Label>
            <Input type="text" required placeholder="Enter book title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div>
            <Label>Author *</Label>
            <Input type="text" required placeholder="Enter author name" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
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
            <Label>ISBN</Label>
            <Input type="text" placeholder="e.g. 978-3-16-148410-0" value={formData.isbn || ''} onChange={e => setFormData({...formData, isbn: e.target.value})} />
          </div>
          <div>
            <Label>Total Copies *</Label>
            <Input type="number" required min="1" value={formData.total_copies.toString()} onChange={e => setFormData({...formData, total_copies: parseInt(e.target.value) || 1})} />
          </div>
          <div>
            <Label>Shelf Location</Label>
            <Input type="text" placeholder="e.g. A1-Rack2" value={formData.shelf_location || ''} onChange={e => setFormData({...formData, shelf_location: e.target.value})} />
          </div>
          <div>
            <Label>Price (Rs)</Label>
            <Input type="number" step={0.01} value={formData.price === 0 || !formData.price ? '' : formData.price.toString()} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} />
          </div>
          <div>
            <Label>Publisher</Label>
            <Input type="text" placeholder="Publisher name" value={formData.publisher || ''} onChange={e => setFormData({...formData, publisher: e.target.value})} />
          </div>
        </div>
        <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={cancelForm}>Cancel</Button>
          <Button variant="primary" type="submit" loading={submitLoading} loadingText="Saving...">
            {editingBook ? 'Save Changes' : 'Save Book'}
          </Button>
        </div>
      </div>
    </form>
  );
}
