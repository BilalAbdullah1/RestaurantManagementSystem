import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import { 
  BookOpen, User, CheckCircle2, Clock, Search, X, Download, 
  FileCheck, AlertCircle, Award, ExternalLink, Loader2, FileDown,
  ChevronLeft, ChevronRight, Award as AwardIcon
} from 'lucide-react';
import Button from '../../components/ui/button/Button';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import InputField from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import { toast } from '../../components/ui/Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  getPaginationRowModel, 
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState
} from '@tanstack/react-table';

export default function HomeworkSubmissions() {
  const tenantId = localStorage.getItem("tenantId") || "";

  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedHomework, setSelectedHomework] = useState('');
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'graded'>('all');
  
  // Table States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<any>(null);
  const [marks, setMarks] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchClassesAndSections();
  }, [tenantId]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchHomeworks();
    } else {
      setHomeworks([]);
      setSelectedHomework('');
    }
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    if (selectedHomework) {
      fetchSubmissions();
    } else {
      setSubmissions([]);
    }
  }, [selectedHomework]);

  const fetchClassesAndSections = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        api.get(`/classes/tenant/${tenantId}`),
        api.get(`/sections/tenant/${tenantId}`)
      ]);
      setClasses(cRes.data || []);
      setSections(sRes.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load class directory');
    }
  };

  const fetchHomeworks = async () => {
    try {
      const res = await api.get(`/homeworks/tenant/${tenantId}/class/${selectedClass}/section/${selectedSection}`);
      setHomeworks(res.data || []);
      
      const studRes = await api.get(`/students/tenant/${tenantId}/class/${selectedClass}/section/${selectedSection}`);
      setStudents(studRes.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load assignments');
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/homeworksubmissions/tenant/${tenantId}/homework/${selectedHomework}`);
      setSubmissions(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Error fetching submissions');
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (id: string) => {
    const st = students.find(s => s.id === id);
    if (!st) return 'Student Member';
    const fullName = `${st.first_name || ''} ${st.last_name || ''}`.trim();
    return fullName || `Roll: ${st.roll_number || 'N/A'}`;
  };

  const getHomeworkDetails = (id: string) => homeworks.find(h => h.id === id);

  const openGradingModal = (submission: any) => {
    setCurrentSubmission(submission);
    setMarks(submission.marks_obtained?.toString() || '');
    setRemarks(submission.teacher_remarks || '');
    setGradingModalOpen(true);
  };

  const handleGrade = async () => {
    try {
      await api.put(`/homeworksubmissions/${currentSubmission.id}/grade`, {
        marks_obtained: marks ? parseInt(marks) : null,
        teacher_remarks: remarks
      });
      toast.success('Submission graded successfully!');
      setGradingModalOpen(false);
      fetchSubmissions();
    } catch (e) {
      toast.error('Failed to save grade');
    }
  };

  // Filtered Submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      if (statusFilter === 'graded' && sub.status !== 'Graded') return false;
      if (statusFilter === 'submitted' && sub.status === 'Graded') return false;

      if (!globalFilter.trim()) return true;
      const q = globalFilter.toLowerCase();
      const studentName = getStudentName(sub.student_id).toLowerCase();
      return studentName.includes(q);
    });
  }, [submissions, statusFilter, globalFilter, students]);

  // StatCards KPI Data
  const statsData: StatCardData[] = useMemo(() => {
    if (!selectedHomework) return [];
    const totalSubs = submissions.length;
    const graded = submissions.filter(s => s.status === 'Graded').length;
    const pendingGrading = totalSubs - graded;

    return [
      {
        title: 'Total Submissions',
        value: `${totalSubs} Turned In`,
        icon: <FileCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
        theme: 'brand'
      },
      {
        title: 'Graded Works',
        value: `${graded} Graded`,
        icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
        theme: 'success'
      },
      {
        title: 'Pending Review',
        value: `${pendingGrading} Unchecked`,
        icon: <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
        theme: 'warning'
      },
      {
        title: 'Completion Rate',
        value: students.length > 0 ? `${Math.round((totalSubs / students.length) * 100)}%` : 'N/A',
        icon: <Award className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
        theme: 'sky'
      }
    ];
  }, [selectedHomework, submissions, students]);

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const hwObj = getHomeworkDetails(selectedHomework);
    doc.text(`Homework Grading Roster - ${hwObj?.title || 'Assignment'}`, 14, 15);

    const tableData: any[] = [];
    filteredSubmissions.forEach((sub, idx) => {
      tableData.push([
        idx + 1,
        getStudentName(sub.student_id),
        sub.status,
        new Date(sub.submission_date).toLocaleDateString(),
        sub.marks_obtained !== null ? `${sub.marks_obtained} Pts` : 'Pending'
      ]);
    });

    autoTable(doc, {
      startY: 22,
      head: [['#', 'Student Name', 'Status', 'Submitted On', 'Marks Obtained']],
      body: tableData,
    });
    doc.save(`homework_grades_${selectedHomework}.pdf`);
    toast.success('Grading roster PDF generated');
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['#', 'Student Name', 'Status', 'Submitted Date', 'Marks Obtained', 'Teacher Remarks'];
    const csvRows: any[] = [];
    filteredSubmissions.forEach((sub, idx) => {
      csvRows.push([
        idx + 1,
        getStudentName(sub.student_id).replace(/,/g, ' '),
        sub.status,
        new Date(sub.submission_date).toLocaleDateString(),
        sub.marks_obtained !== null ? sub.marks_obtained : 'Pending',
        (sub.teacher_remarks || '').replace(/,/g, ' ')
      ]);
    });

    const csvContent = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `homework_grades_${selectedHomework}.csv`;
    link.click();
    toast.success('Grading CSV exported');
  };

  // Columns Configuration
  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'student_id',
      header: 'Student Member',
      cell: ({ row }) => {
        const name = getStudentName(row.original.student_id);
        const initials = name.substring(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center border border-blue-100 dark:border-blue-800 shrink-0">
              {initials}
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">{name}</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        row.original.status === 'Graded' ? (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-extrabold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" /> GRADED
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs font-extrabold border border-amber-200 dark:border-amber-800 flex items-center gap-1 w-fit">
            <Clock className="w-3.5 h-3.5" /> TURNED IN
          </span>
        )
      )
    },
    {
      accessorKey: 'submission_date',
      header: 'Submitted On',
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-gray-700 dark:text-gray-300">
          {new Date(row.original.submission_date).toLocaleString()}
        </span>
      )
    },
    {
      accessorKey: 'marks_obtained',
      header: 'Marks Obtained',
      cell: ({ row }) => (
        row.original.marks_obtained !== null ? (
          <span className="font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900/40">
            {row.original.marks_obtained} Points
          </span>
        ) : (
          <span className="text-xs text-gray-400 font-medium italic">Pending Evaluation</span>
        )
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ActionMenu 
            items={[
              {
                label: row.original.status === 'Graded' ? 'Edit Grade & Feedback' : 'Grade Assignment',
                icon: <AwardIcon className="w-4 h-4 text-emerald-500" />,
                onClick: () => openGradingModal(row.original)
              }
            ]}
          />
        </div>
      )
    }
  ], [students]);

  const table = useReactTable({
    data: filteredSubmissions,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <div className="w-full max-w-full space-y-6">
      <Breadcrumb items={[
        { label: 'LMS Portal', href: '/lms' },
        { label: 'Homework Submissions & Grading' }
      ]} />

      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-blue-500" />
              Homework Submissions & Grading
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Review turned-in assignments, inspect student attachments, and evaluate grades.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button 
              onClick={exportPDF} 
              disabled={submissions.length === 0} 
              className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5 disabled:opacity-30" 
            >
              <FileDown className="w-4 h-4 text-rose-500" />
              <span>PDF</span>
            </button>
            <button 
              onClick={exportCSV} 
              disabled={submissions.length === 0} 
              className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5 disabled:opacity-30" 
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2 block">
              Target Class *
            </label>
            <SearchableSelect 
              options={classes.map(c => ({ value: c.id, label: c.name }))} 
              placeholder="Select Class..." 
              value={selectedClass} 
              onChange={setSelectedClass} 
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2 block">
              Target Section *
            </label>
            <SearchableSelect 
              options={sections.map(s => ({ value: s.id, label: s.name }))} 
              placeholder="Select Section..." 
              value={selectedSection} 
              onChange={setSelectedSection} 
              disabled={!selectedClass} 
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2 block">
              Assignment *
            </label>
            <SearchableSelect 
              options={homeworks.map(h => ({ value: h.id, label: h.title }))} 
              placeholder="Select Homework Assignment..." 
              value={selectedHomework} 
              onChange={setSelectedHomework} 
              disabled={!selectedSection} 
            />
          </div>
        </div>
      </div>

      {selectedHomework && (
        <StatCards stats={statsData} loading={loading} />
      )}

      {selectedHomework && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search student by name..."
                value={globalFilter}
                onChange={e => setGlobalFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                All ({submissions.length})
              </button>
              <button
                onClick={() => setStatusFilter('submitted')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === 'submitted' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Pending Review
              </button>
              <button
                onClick={() => setStatusFilter('graded')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === 'graded' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Graded
              </button>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[250px]">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="px-6 py-3.5 font-bold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 bg-white dark:bg-gray-900">
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
                    <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-400 italic">
                      No turned-in submissions found for this filter.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors">
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

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div>
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
              {table.getFilteredRowModel().rows.length} turned-in submissions
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-2 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-2 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guidance Placeholder when no Homework Selected */}
      {!selectedHomework && (
        <div className="flex flex-col items-center justify-center p-14 bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
            <FileCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Select Homework Assignment</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
            Choose the Class, Section, and Assignment from the dropdowns above to review student file submissions, mark scores, and leave constructive feedback.
          </p>
        </div>
      )}

      {gradingModalOpen && currentSubmission && (
        <div className="fixed inset-0 z-[999999] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-gray-800 rounded-t-2xl">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" />
                Grade Submission: {getStudentName(currentSubmission.student_id)}
              </h3>
              <button onClick={() => setGradingModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              
              <div className="p-4 bg-slate-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Student Work / Response:</h4>
                <div 
                  className="text-gray-800 dark:text-gray-200 text-xs leading-relaxed prose dark:prose-invert max-w-none" 
                  dangerouslySetInnerHTML={{ __html: currentSubmission.student_notes || 'No notes written.' }} 
                />
                
                {currentSubmission.attachment_urls && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1.5">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Student File Attachments:</h5>
                    {JSON.parse(currentSubmission.attachment_urls).map((url: string, i: number) => (
                      <a 
                        key={i} 
                        href={url.trim()} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 truncate"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span>Attachment {i + 1}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label required>Marks Obtained / Score</Label>
                <InputField 
                  type="number" 
                  value={marks} 
                  onChange={e => setMarks(e.target.value)} 
                  placeholder="e.g. 85" 
                />
              </div>
              
              <div>
                <Label>Teacher Remarks / Feedback</Label>
                <textarea 
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs" 
                  rows={3} 
                  value={remarks} 
                  onChange={e => setRemarks(e.target.value)} 
                  placeholder="Provide constructive feedback for student..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800">
                <button 
                  type="button" 
                  onClick={() => setGradingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleGrade} 
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Save Grade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
