import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import Input from '../../components/form/input/InputField';
import DatePicker from '../../components/form/date-picker';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import Label from '../../components/form/Label';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { toast } from '../../components/ui/Toast';

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

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, AlertTriangle, DollarSign, CheckCircle2, RefreshCcw, FileText } from 'lucide-react';

interface BookIssuance {
  id: string;
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

export default function LibraryFines() {
  const navigate = useNavigate();
  const tenantId = localStorage.getItem('tenantId') || '';

  const [issuances, setIssuances] = useState<BookIssuance[]>([]);
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Modal / Drawer state for fine collection
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedIssuance, setSelectedIssuance] = useState<BookIssuance | null>(null);
  const [calculatedFine, setCalculatedFine] = useState<number>(0);
  const [paymentChannel, setPaymentChannel] = useState<string>('Cash');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!tenantId) {
      toast.error('School context missing.');
      setLoading(false);
      return;
    }
    fetchData();
  }, [tenantId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [issueRes, bookRes, studRes] = await Promise.all([
        api.get<BookIssuance[]>(`/BookIssuances/tenant/${tenantId}`),
        api.get<LibraryBook[]>(`/LibraryBooks/tenant/${tenantId}`),
        api.get<Student[]>(`/students/tenant/${tenantId}`)
      ]);

      // Filter overdue / fine-accruing issuances
      const today = new Date();
      const overdueOrFineList = issueRes.data.filter(i => {
        if (i.status === 'Overdue') return true;
        if (i.status === 'Issued' && new Date(i.due_date) < today) return true;
        if (i.fine_amount && i.fine_amount > 0) return true;
        return false;
      });

      setIssuances(overdueOrFineList);
      setBooks(bookRes.data);
      setStudents(studRes.data);
    } catch {
      toast.error('Failed to load library fine records.');
    } finally {
      setLoading(false);
    }
  };

  const getBookTitle = (id: string) => {
    const b = books.find(x => x.id === id);
    return b ? b.title : id;
  };

  const getStudentName = (id?: string) => {
    if (!id) return 'Staff / Unknown';
    const s = students.find(x => x.id === id);
    return s ? `${s.first_name} ${s.last_name} (${s.admission_number || 'N/A'})` : id;
  };

  const getDaysOverdue = (dueDateStr: string) => {
    const today = new Date();
    const due = new Date(dueDateStr);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateAccruedFine = (dueDateStr: string) => {
    const days = getDaysOverdue(dueDateStr);
    return days * 20; // Rs. 20 per day fine
  };

  // Open Fine Collection Modal
  const openCollectModal = (item: BookIssuance) => {
    setSelectedIssuance(item);
    const fine = item.fine_amount && item.fine_amount > 0 ? item.fine_amount : calculateAccruedFine(item.due_date);
    setCalculatedFine(fine);
    setPaymentChannel('Cash');
    setCollectModalOpen(true);
  };

  const handleConfirmCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssuance?.id) return;

    setSubmitLoading(true);
    try {
      await api.put(`/BookIssuances/${selectedIssuance.id}/return`, {
        return_date: new Date().toISOString().split('T')[0],
        fine_amount: calculatedFine,
        remarks: `Fine collected Rs. ${calculatedFine} via ${paymentChannel}`
      });

      toast.success(`Collected Rs. ${calculatedFine} fine and marked book as returned.`);
      setCollectModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to collect library fine.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Stats
  const totalOverdueCount = issuances.length;
  const totalAccruedFine = useMemo(() => {
    return issuances.reduce((acc, curr) => {
      const fine = curr.fine_amount && curr.fine_amount > 0 ? curr.fine_amount : calculateAccruedFine(curr.due_date);
      return acc + fine;
    }, 0);
  }, [issuances]);

  const statCardsData = [
    { title: 'Overdue Books', value: totalOverdueCount.toString(), theme: 'error' as const, icon: <AlertTriangle className="w-5 h-5 text-rose-500" /> },
    { title: 'Total Accrued Fines', value: `Rs. ${totalAccruedFine.toLocaleString()}`, theme: 'warning' as const, icon: <DollarSign className="w-5 h-5 text-amber-500" /> },
    { title: 'Daily Fine Rate', value: 'Rs. 20 / Day', theme: 'brand' as const, icon: <CheckCircle2 className="w-5 h-5 text-brand-500" /> },
  ];

  // Table Columns
  const columns = useMemo<ColumnDef<BookIssuance>[]>(() => [
    {
      accessorKey: 'book_id',
      header: 'Book Title',
      cell: ({ row }) => (
        <span className="font-bold text-gray-900 dark:text-white">
          {getBookTitle(row.original.book_id)}
        </span>
      )
    },
    {
      accessorKey: 'student_id',
      header: 'Borrower',
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-200">{getStudentName(row.original.student_id)}</p>
          <p className="text-xs text-gray-500">{row.original.borrower_type}</p>
        </div>
      )
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row }) => (
        <span className="font-bold text-rose-600 dark:text-rose-400">
          {new Date(row.original.due_date).toLocaleDateString()}
        </span>
      )
    },
    {
      id: 'days_overdue',
      header: 'Days Overdue',
      cell: ({ row }) => {
        const days = getDaysOverdue(row.original.due_date);
        return (
          <Badge variant="light" color="error">
            {days} Days Overdue
          </Badge>
        );
      }
    },
    {
      id: 'accrued_fine',
      header: 'Accrued Fine (Rs)',
      cell: ({ row }) => {
        const fine = row.original.fine_amount && row.original.fine_amount > 0 ? row.original.fine_amount : calculateAccruedFine(row.original.due_date);
        return (
          <span className="font-black text-rose-600 dark:text-rose-400 text-base">
            Rs. {fine.toLocaleString()}
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ActionMenu
            groups={[
              [
                {
                  label: 'Collect Fine & Return',
                  icon: <RefreshCcw className="w-4 h-4 text-emerald-600" />,
                  onClick: () => openCollectModal(row.original)
                }
              ]
            ]}
          />
        </div>
      )
    }
  ], [books, students]);

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
    const headers = ['Book Title', 'Borrower', 'Due Date', 'Days Overdue', 'Accrued Fine (Rs)'];
    const rowsList = issuances.map(i => [
      getBookTitle(i.book_id),
      getStudentName(i.student_id),
      new Date(i.due_date).toLocaleDateString(),
      getDaysOverdue(i.due_date).toString(),
      calculateAccruedFine(i.due_date).toString()
    ]);
    const csvContent = [headers.join(','), ...rowsList.map(e => e.map(field => `"${field}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Library_Overdue_Fines.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Exported Successfully');
  };

  const exportPDF = () => {
    if (issuances.length === 0) return;
    const doc = new jsPDF();
    doc.text("Library Overdue Fines Report", 14, 15);
    const tableData = issuances.map(i => [
      getBookTitle(i.book_id),
      getStudentName(i.student_id),
      new Date(i.due_date).toLocaleDateString(),
      `${getDaysOverdue(i.due_date)} Days`,
      `Rs. ${calculateAccruedFine(i.due_date).toLocaleString()}`
    ]);
    autoTable(doc, {
      head: [['Book Title', 'Borrower', 'Due Date', 'Overdue', 'Accrued Fine']],
      body: tableData,
      startY: 20,
    });
    doc.save("Library_Overdue_Fines.pdf");
    toast.success('PDF Exported Successfully');
  };

  return (
    <div className="w-full space-y-6">
      <Breadcrumb items={[{ label: 'Library', href: '#' }, { label: 'Overdue Fines & Recovery' }]} />

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" /> Overdue Library Fines & Fines Collector
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track overdue book returns, calculate accrued daily penalties (Rs. 20/day), and collect counter fines.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF} className="flex items-center gap-2">
            <Download className="w-4 h-4" /> PDF
          </Button>
        </div>
      </div>

      <StatCards stats={statCardsData} loading={loading} />

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden p-6">
        <div className="mb-6 max-w-md">
          <Input
            type="text"
            placeholder="Search by book title or borrower name..."
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
                    <th key={header.id} className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {flexRender(header.column.columnDef.header, header.getContext())}
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
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-1">
                        All Library Books Returned on Time
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        There are currently no overdue book returns or outstanding library penalties across all student and staff borrowers.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate('/IssueBooks')}
                        className="flex items-center gap-2"
                      >
                        <RefreshCcw className="w-4 h-4" /> Open Circulation Desk
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FINE COLLECTION MODAL */}
      {collectModalOpen && selectedIssuance && (
        <>
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[999]" onClick={() => setCollectModalOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[1000] p-6 flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-rose-600" /> Collect Library Fine & Return Book
                </h3>
                <button onClick={() => setCollectModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
              </div>

              <form id="collect-fine-form" onSubmit={handleConfirmCollection} className="space-y-4 pt-6">
                <div>
                  <Label>Book Title</Label>
                  <Input readOnly value={getBookTitle(selectedIssuance.book_id)} className="bg-gray-100 dark:bg-gray-800" />
                </div>

                <div>
                  <Label>Borrower</Label>
                  <Input readOnly value={getStudentName(selectedIssuance.student_id)} className="bg-gray-100 dark:bg-gray-800" />
                </div>

                <div>
                  <Label required>Accrued Fine Amount (Rs)</Label>
                  <Input
                    type="number"
                    required
                    min="0"
                    value={calculatedFine}
                    onChange={(e) => setCalculatedFine(Number(e.target.value) || 0)}
                  />
                  <p className="text-xs text-rose-500 mt-1 font-medium">
                    Calculated for {getDaysOverdue(selectedIssuance.due_date)} days overdue @ Rs. 20/day.
                  </p>
                </div>

                <div>
                  <Label required>Payment Method</Label>
                  <SearchableSelect
                    options={[
                      { value: 'Cash', label: 'Counter Cash Collection' },
                      { value: 'Wallet', label: 'Student RFID Wallet Deduction' },
                      { value: 'JazzCash', label: 'JazzCash / EasyPaisa' },
                      { value: 'Waived', label: 'Fine Waived / Authorized Exemption' }
                    ]}
                    value={paymentChannel}
                    onChange={(val) => setPaymentChannel(val as string)}
                  />
                </div>
              </form>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCollectModalOpen(false)} disabled={submitLoading}>Cancel</Button>
              <Button variant="primary" type="submit" form="collect-fine-form" loading={submitLoading} loadingText="Processing..." className="bg-rose-600 hover:bg-rose-700 text-white">
                Confirm Collection & Return
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
