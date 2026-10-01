import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Input from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import SearchableSelect, { OptionType } from '../../components/form/select/SearchableSelect';
import DatePicker from '../../components/form/date-picker';
import Select from '../../components/form/Select';
import Label from '../../components/form/Label';
import { getAvatarGradient, getInitials } from '../../utils/avatarUtils';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { Trash2, AlertCircle, Award, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- TYPES ---
interface BehaviorLog {
  id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  incident_date: string;
  incident_type: string;
  points_affected: number;
  action_taken: string;
  reported_by_name: string;
}

interface LookupItem {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  admission_number?: string;
  title?: string;
  is_current?: boolean;
}

const PREDEFINED_INCIDENTS = [
  { type: 'Outstanding Project Work', points: 10, category: 'positive' },
  { type: 'Helping Another Student', points: 5, category: 'positive' },
  { type: 'Extracurricular Achievement', points: 15, category: 'positive' },
  { type: 'Late Arrival', points: -5, category: 'negative' },
  { type: 'Disruptive Behavior in Class', points: -10, category: 'negative' },
  { type: 'Incomplete Homework', points: -5, category: 'negative' },
  { type: 'Bullying / Physical Altercation', points: -20, category: 'negative' },
];

export default function StudentBehaviorLogs() {
  const tenantId = localStorage.getItem("tenantId") || "";
  const currentUserId = localStorage.getItem("userId") || "00000000-0000-0000-0000-000000000000";

  // --- STATES ---
  const [logs, setLogs] = useState<BehaviorLog[]>([]);
  const [academicYears, setAcademicYears] = useState<LookupItem[]>([]);
  const [students, setStudents] = useState<LookupItem[]>([]);
  
  const [filterYear, setFilterYear] = useState<string>('');
  const [globalFilter, setGlobalFilter] = useState('');
  
  const [view, setView] = useState<'list' | 'form'>('list');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Form State
  const initialForm = { student_id: '', incident_date: new Date().toISOString().split('T')[0], incident_type: '', points_affected: 0, action_taken: '' };
  const [formData, setFormData] = useState(initialForm);

  // --- METADATA FETCH ---
  useEffect(() => {
    if (!tenantId) return;
    const fetchMeta = async () => {
      try {
        const [yearsRes, studentsRes] = await Promise.all([
          api.get<LookupItem[]>(`/academicyears/tenant/${tenantId}`),
          api.get<LookupItem[]>(`/students/tenant/${tenantId}`)
        ]);
        setAcademicYears(yearsRes.data);
        setStudents(studentsRes.data);

        const currentYr = yearsRes.data.find(y => y.is_current) || yearsRes.data[0];
        if (currentYr) setFilterYear(currentYr.id);
      } catch (err) {
        console.error("Failed to load metadata");
      }
    };
    fetchMeta();
  }, [tenantId]);

  // --- FETCH LOGS ---
  const fetchLogs = async () => {
    if (!tenantId || !filterYear) return;
    setLoading(true);
    try {
      const res = await api.get<BehaviorLog[]>(`/studentbehaviorlogs/tenant/${tenantId}/year/${filterYear}`);
      setLogs(res.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to load behavior logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filterYear) fetchLogs();
  }, [filterYear]);

  // --- FILTER & STATS ---
  const stats = useMemo(() => {
    let positive = 0;
    let negative = 0;
    logs.forEach(log => {
      if (log.points_affected > 0) positive += log.points_affected;
      else if (log.points_affected < 0) negative += Math.abs(log.points_affected);
    });
    return { positive, negative, total: logs.length };
  }, [logs]);

  // --- EXPORT TO PDF & CSV ---
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Student Behavior & Discipline Logs', 14, 15);
    
    const activeYearTitle = academicYears.find(y => y.id === filterYear)?.title || '';
    doc.setFontSize(10);
    doc.text(`Academic Session: ${activeYearTitle}`, 14, 20);

    autoTable(doc, {
      startY: 25,
      head: [['Date', 'Student Name', 'Admission No', 'Incident', 'Points', 'Action Taken']],
      body: table.getFilteredRowModel().rows.map(row => {
        const log = row.original;
        return [
          new Date(log.incident_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          log.student_name,
          log.admission_number,
          log.incident_type,
          `${log.points_affected > 0 ? '+' : ''}${log.points_affected} Pts`,
          log.action_taken
        ];
      }),
    });
    doc.save(`behavior_logs_${activeYearTitle.replace(/\s+/g, '_')}.pdf`);
  };

  const exportCSV = () => {
    const headers = ['Date', 'Student Name', 'Admission No', 'Incident', 'Points', 'Action Taken'];
    const csvRows = table.getFilteredRowModel().rows.map(row => {
      const log = row.original;
      return [
        new Date(log.incident_date).toLocaleDateString('en-GB'),
        log.student_name,
        log.admission_number,
        log.incident_type.replace(/,/g, ' '),
        log.points_affected,
        log.action_taken.replace(/,/g, ' ')
      ];
    });
    const csvContent = [headers, ...csvRows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const activeYearTitle = academicYears.find(y => y.id === filterYear)?.title || '';
    
    link.setAttribute("href", url);
    link.setAttribute("download", `behavior_logs_${activeYearTitle.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- ACTIONS ---
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Remove Log?',
      text: `Are you sure you want to delete this behavior record?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Delete'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/studentbehaviorlogs/${id}`);
        setLogs(prev => prev.filter(l => l.id !== id));
        Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Record has been removed.', timer: 1500, showConfirmButton: false });
      } catch (err) {
        Swal.fire('Error', 'Failed to delete record.', 'error');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const payload = {
        tenant_id: tenantId,
        academic_year_id: filterYear,
        reported_by_user_id: currentUserId,
        ...formData
      };
      await api.post('/studentbehaviorlogs', payload);
      Swal.fire({ icon: 'success', title: 'Logged!', text: 'Student behavior has been recorded.', timer: 1500, showConfirmButton: false });
      setView('list');
      fetchLogs();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to save log.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleIncidentPresetSelect = (value: string) => {
    const selected = PREDEFINED_INCIDENTS.find(inc => inc.type === value);
    if (selected) {
      setFormData(prev => ({ ...prev, incident_type: selected.type, points_affected: selected.points }));
    } else {
      setFormData(prev => ({ ...prev, incident_type: value }));
    }
  };

  // --- OPTIONS ---
  const yearOptions = useMemo((): OptionType[] => academicYears.map(y => ({ value: y.id, label: y.title || '' })), [academicYears]);
  const studentOptions = useMemo((): OptionType[] => students.map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name} (${s.admission_number})` })), [students]);
  const presetOptions = useMemo(() => [
    { value: 'Outstanding Project Work', label: 'Outstanding Project Work (+10)' },
    { value: 'Helping Another Student', label: 'Helping Another Student (+5)' },
    { value: 'Extracurricular Achievement', label: 'Extracurricular Achievement (+15)' },
    { value: 'Late Arrival', label: 'Late Arrival (-5)' },
    { value: 'Disruptive Behavior in Class', label: 'Disruptive Behavior in Class (-10)' },
    { value: 'Incomplete Homework', label: 'Incomplete Homework (-5)' },
    { value: 'Bullying / Physical Altercation', label: 'Bullying / Physical Altercation (-20)' },
  ], []);

  // --- TABLE COLUMNS ---
  const columns = useMemo<ColumnDef<BehaviorLog>[]>(
    () => [
      {
        accessorKey: 'incident_date',
        header: 'Date',
        cell: info => <span className="text-gray-600 dark:text-gray-300 font-medium">{new Date(info.getValue() as string).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>,
      },
      {
        accessorFn: row => row.student_name,
        id: 'student_name',
        header: 'Student',
        cell: info => {
          const log = info.row.original;
          const name = info.getValue() as string;
          return (
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ${getAvatarGradient(name)}`}>
                {getInitials(name, '')}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800 dark:text-white/90">{name}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">ID: {log.admission_number}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'incident_type',
        header: 'Incident',
        cell: info => <span className="text-gray-800 dark:text-gray-200 font-medium">{info.getValue() as string}</span>,
      },
      {
        accessorKey: 'points_affected',
        header: 'Points',
        cell: info => {
          const points = info.getValue() as number;
          const isPositive = points > 0;
          return (
            <Badge variant="light" color={isPositive ? 'success' : 'error'}>
              {isPositive ? '+' : ''}{points} Pts
            </Badge>
          );
        },
      },
      {
        accessorKey: 'action_taken',
        header: 'Action Taken',
        cell: info => (
          <div className="max-w-[200px] truncate text-gray-500 dark:text-gray-400" title={info.getValue() as string}>
            {info.getValue() as string}
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: info => (
          <div className="flex justify-end">
            <button 
              onClick={() => handleDelete(info.row.original.id)} 
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              title="Delete Log"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: logs,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Student Behavior & Discipline</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage conduct records, merits, and demerits across the campus.</p>
        </div>
        
        {view === 'list' ? (
          <Button variant="primary" onClick={() => { setFormData(initialForm); setView('form'); }} className="whitespace-nowrap shadow-lg shadow-brand-500/20">
            + Log Incident
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setView('list')}>← Back to Logs</Button>
        )}
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: LIST & STATS VIEW                                 */}
      {/* ========================================================= */}
      {view === 'list' && (
        <div className="space-y-6 animate-in fade-in zoom-in duration-200">
          
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Logs</p>
                <h3 className="text-3xl font-black text-gray-800 dark:text-white">{stats.total}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-success-500/80 uppercase tracking-wider mb-1">Positive Points</p>
                <h3 className="text-3xl font-black text-success-600 dark:text-success-500">+{stats.positive}</h3>
              </div>
              <div className="w-12 h-12 bg-success-50 dark:bg-success-900/20 rounded-full flex items-center justify-center text-success-500">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-error-500/80 uppercase tracking-wider mb-1">Negative Points</p>
                <h3 className="text-3xl font-black text-error-600 dark:text-error-500">-{stats.negative}</h3>
              </div>
              <div className="w-12 h-12 bg-error-50 dark:bg-error-900/20 rounded-full flex items-center justify-center text-error-500">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* MAIN TABLE CONTAINER */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden min-w-0">
            
            {/* Filter Bar */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex flex-col md:flex-row gap-4 relative z-50">
              <div className="w-full md:w-64">
                <SearchableSelect label="Academic Year" options={yearOptions} value={filterYear} onChange={setFilterYear} placeholder="Academic Year" />
              </div>
              <div className="w-full md:flex-1 flex items-end gap-2">
                <div className="flex-1">
                  <Input type="text" placeholder="Search by student name, admission #, or incident type..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
                </div>
                <button onClick={exportPDF} title="Export to PDF" className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors h-10 flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={exportCSV} title="Export to CSV" className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 transition-colors h-10 flex items-center justify-center">
                  CSV
                </button>
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto min-h-[250px]">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50/50 dark:bg-gray-800/30">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th 
                          key={header.id} 
                          onClick={header.column.getToggleSortingHandler()}
                          className={`px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none ${header.column.getCanSort() ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors' : ''}`}
                        >
                          <div className={`flex items-center gap-2 ${header.id === 'actions' ? 'justify-end' : ''}`}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() && (
                              <span className="text-brand-500">
                                {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-12">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-3"></div>
                          <p className="text-sm font-medium text-gray-500">Loading records...</p>
                        </div>
                      </td>
                    </tr>
                  ) : table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400 text-sm">
                        No behavior records found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
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

            {/* Pagination */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                 <span className="text-sm text-gray-500 dark:text-gray-400">Rows per page:</span>
                 <select
                   value={table.getState().pagination.pageSize}
                   onChange={e => table.setPageSize(Number(e.target.value))}
                   className="h-9 px-3 rounded-lg border border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
                 >
                   {[10, 20, 50].map(pageSize => (
                     <option key={pageSize} value={pageSize}>
                       {pageSize}
                     </option>
                   ))}
                 </select>
              </div>

              {table.getPageCount() > 1 && (
                <div className="flex items-center gap-2">
                  <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 transition-all">
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium px-2">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </span>
                  <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 transition-all">
                    Next
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: LOG INCIDENT FORM                                 */}
      {/* ========================================================= */}
      {view === 'form' && (
        <form onSubmit={handleFormSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">Incident Details</h3>
              <p className="text-xs text-gray-500 mt-0.5">Record a positive or negative behavior event.</p>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="relative z-50">
              <SearchableSelect label="Student *" options={studentOptions} value={formData.student_id} onChange={val => setFormData({...formData, student_id: val})} placeholder="Select student" required />
            </div>

            <div>
              <DatePicker 
                label="Incident Date *" 
                required 
                value={formData.incident_date} 
                onChange={e => setFormData(prev => ({ ...prev, incident_date: e.target.value }))} 
              />
            </div>

            <div className="md:col-span-2 bg-gray-50/50 dark:bg-gray-800/30 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
              <Label>Select Incident Category or Type Custom</Label>
              <div className="flex flex-col sm:flex-row gap-4 items-end mt-2">
                <div className="w-full sm:w-1/2">
                  <Select 
                    options={presetOptions}
                    placeholder="-- Choose from Presets --"
                    onChange={handleIncidentPresetSelect}
                  />
                </div>
                <div className="w-full sm:w-1/2">
                   <Input type="text" required placeholder="Or type incident here..." value={formData.incident_type} onChange={e => setFormData(prev => ({ ...prev, incident_type: e.target.value }))} />
                </div>
              </div>
            </div>

            <div>
              <Label required>Points Affected (Use - for deduction)</Label>
              <Input type="number" required placeholder="e.g. 10 or -5" value={formData.points_affected} onChange={e => setFormData({...formData, points_affected: parseInt(e.target.value) || 0})} />
              <p className="text-[10px] text-gray-400 mt-1.5 font-medium">Positive points build up profile, negative points deduct.</p>
            </div>

            <div className="md:col-span-2">
              <Label required>Action Taken / Remarks</Label>
              <textarea 
                rows={3} required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-sm text-gray-800 dark:text-white focus:border-brand-500 outline-none resize-none mt-2"
                placeholder="e.g. Issued a verbal warning and informed parents..."
                value={formData.action_taken}
                onChange={e => setFormData({...formData, action_taken: e.target.value})}
              />
            </div>

          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setView('list')}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitLoading || !formData.student_id || !formData.incident_type}>
              {submitLoading ? 'Saving...' : 'Save Behavior Log'}
            </Button>
          </div>
        </form>
      )}

    </div>
  );
}