import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Input from '../../components/form/input/InputField'; 
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import SearchableSelect, { OptionType } from '../../components/form/select/SearchableSelect';
import { getAvatarGradient, getInitials } from '../../utils/avatarUtils';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Premium Components
import EnrollmentStats from './components/EnrollmentStats';
import EnrollmentActionMenu from './components/EnrollmentActionMenu';
import EnrollmentFormDrawer from './components/EnrollmentFormDrawer';
import EnrollmentHistoryModal from './components/EnrollmentHistoryModal';

// TanStack Table
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';

// --- TYPES ---
interface StudentEnrollment {
  id?: string;
  tenant_id: string;
  student_id: string;
  academic_year_id: string;
  class_id: string;
  section_id: string;
  roll_number: number;
  status: 'Active' | 'Transferred' | 'Promoted' | 'Dropped';
  created_at?: string;
  student_name?: string;
  admission_number?: string;
  class_name?: string;
  section_name?: string;
  academic_year_title?: string;
}

interface LookupItem {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  title?: string; 
  code?: string;
  class_id?: string; 
  admission_number?: string; 
}

const columnHelper = createColumnHelper<StudentEnrollment>();

export default function StudentEnrollments() {
  const tenantId = localStorage.getItem("tenantId") || "";

  // --- MAIN LIST STATES ---
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [academicYears, setAcademicYears] = useState<LookupItem[]>([]);
  const [classes, setClasses] = useState<LookupItem[]>([]);
  const [allSections, setAllSections] = useState<LookupItem[]>([]);
  const [students, setStudents] = useState<LookupItem[]>([]);
  const [historyList, setHistoryList] = useState<StudentEnrollment[]>([]);
  
  // Dashboard filtering configuration
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [filterSection, setFilterSection] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // UI state controllers
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Drawer & Modal states
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'enroll' | 'transfer' | 'promote'>('enroll');
  const [historyStudentName, setHistoryStudentName] = useState('');

  // Dynamic state representation for form orchestration
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [targetYearId, setTargetYearId] = useState<string>('');
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [targetSectionId, setTargetSectionId] = useState<string>('');
  const [rollNumber, setRollNumber] = useState<string>('');
  const [activeEnrollmentId, setActiveEnrollmentId] = useState<string>(''); 

  // --- INITIAL METADATA FETCH ---
  useEffect(() => {
    if (!tenantId) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Required',
        text: 'School identity context is missing. Please re-authenticate.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const loadMetadata = async () => {
      try {
        const [yearsRes, classesRes, sectionsRes, studentsRes] = await Promise.all([
          api.get<LookupItem[]>(`/academicyears/tenant/${tenantId}`),
          api.get<LookupItem[]>(`/classes/tenant/${tenantId}`),
          api.get<LookupItem[]>(`/sections/tenant/${tenantId}`),
          api.get<LookupItem[]>(`/students/tenant/${tenantId}`)
        ]);

        setAcademicYears(yearsRes.data);
        setClasses(classesRes.data);
        setAllSections(sectionsRes.data);
        setStudents(studentsRes.data);

        const currentYear = yearsRes.data.find((y: any) => y.is_current);
        if (currentYear) setFilterYear(currentYear.id);
        else if (yearsRes.data.length > 0) setFilterYear(yearsRes.data[0].id);

        if (classesRes.data.length > 0) setFilterClass(classesRes.data[0].id);
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Data Fetch Error', text: 'Unable to populate lookup metrics setup.' });
      }
    };
    loadMetadata();
  }, [tenantId]);

  // Handle section context mutation when class changes inside main list filters
  useEffect(() => {
    const availableSections = allSections.filter(s => s.class_id == filterClass);
    if (availableSections.length > 0) {
      setFilterSection(availableSections[0].id);
    } else {
      setFilterSection('');
    }
  }, [filterClass, allSections]);

  // Main system data fetch query execution
  const fetchEnrollments = async () => {
    if (!filterYear || !filterClass || !filterSection) return;
    try {
      setLoading(true);
      const response = await api.get<StudentEnrollment[]>(
        `/studentenrollments/list?yearId=${filterYear}&classId=${filterClass}&sectionId=${filterSection}`
      );
      
      const structuredData = response.data.map(item => {
        const targetStudent = students.find(s => s.id === item.student_id);
        const targetClass = classes.find(c => c.id === item.class_id);
        const targetSec = allSections.find(s => s.id === item.section_id);
        return {
          ...item,
          student_name: targetStudent ? `${targetStudent.first_name} ${targetStudent.last_name}` : 'Unknown Student',
          admission_number: targetStudent?.admission_number || 'N/A',
          class_name: targetClass ? targetClass.name : '',
          section_name: targetSec ? targetSec.name : ''
        };
      });
      setEnrollments(structuredData);
    } catch (err) {
      setEnrollments([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [filterYear, filterClass, filterSection, students]);

  // Option Converters for custom SearchableSelect
  const academicYearOptions = useMemo((): OptionType[] => 
    academicYears.map(y => ({ value: y.id, label: y.title || '' })), [academicYears]);

  const classOptions = useMemo((): OptionType[] => 
    classes.map(c => ({ value: c.id, label: c.name })), [classes]);

  const filteredSectionOptions = useMemo((): OptionType[] => {
    return allSections.filter(s => s.class_id === targetClassId).map(s => ({ value: s.id, label: s.name }));
  }, [allSections, targetClassId]);

  const studentOptions = useMemo((): OptionType[] => 
    students.map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name} (${s.admission_number})` })), [students]);

  // --- AUTO ROLL NUMBER CALCULATOR ---
  const autoFetchNextRollNumber = async (yId?: string, cId?: string, sId?: string) => {
    const year = yId || targetYearId;
    const cls = cId || targetClassId;
    const sec = sId || targetSectionId;

    if (!year || !cls || !sec) return;

    try {
      const response = await api.get<StudentEnrollment[]>(
        `/studentenrollments/list?yearId=${year}&classId=${cls}&sectionId=${sec}`
      );
      if (response.data && response.data.length > 0) {
        const maxRoll = Math.max(...response.data.map(e => e.roll_number || 0));
        setRollNumber((maxRoll + 1).toString());
      } else {
        setRollNumber('1');
      }
    } catch {
      setRollNumber('1');
    }
  };

  useEffect(() => {
    if (isFormDrawerOpen && actionType === 'enroll' && targetYearId && targetClassId && targetSectionId) {
      autoFetchNextRollNumber(targetYearId, targetClassId, targetSectionId);
    }
  }, [targetYearId, targetClassId, targetSectionId, isFormDrawerOpen, actionType]);

  // --- ACTIONS ---
  const initEnrollView = () => {
    setActionType('enroll');
    setSelectedStudentId('');
    setTargetYearId(filterYear);
    setTargetClassId(filterClass);
    setTargetSectionId(filterSection);
    autoFetchNextRollNumber(filterYear, filterClass, filterSection);
    setIsFormDrawerOpen(true);
  };

  const initTransferView = (record: StudentEnrollment) => {
    setActionType('transfer');
    setActiveEnrollmentId(record.id || '');
    setSelectedStudentId(record.student_id);
    setTargetYearId(record.academic_year_id);
    setTargetClassId(record.class_id);
    setTargetSectionId(record.section_id);
    setRollNumber(record.roll_number.toString());
    setIsFormDrawerOpen(true);
  };

  const initPromoteView = (record: StudentEnrollment) => {
    setActionType('promote');
    setActiveEnrollmentId(record.id || '');
    setSelectedStudentId(record.student_id);
    setTargetYearId(''); 
    setTargetClassId('');
    setTargetSectionId('');
    setRollNumber('');
    setIsFormDrawerOpen(true);
  };

  const viewHistoryContext = async (studentId: string, name: string) => {
    try {
      setHistoryStudentName(name);
      setIsHistoryModalOpen(true);
      setHistoryLoading(true);
      const response = await api.get<StudentEnrollment[]>(`/studentenrollments/student/${studentId}/history`);
      const hydratedHistory = response.data.map(item => {
        const cls = classes.find(c => c.id === item.class_id);
        const sec = allSections.find(s => s.id === item.section_id);
        const yr = academicYears.find(y => y.id === item.academic_year_id);
        return {
          ...item,
          student_name: name,
          class_name: cls ? cls.name : 'N/A',
          section_name: sec ? sec.name : 'N/A',
          academic_year_title: yr ? yr.title : 'N/A'
        };
      });
      // Sort history (newest first usually makes more sense for timeline)
      setHistoryList(hydratedHistory.reverse());
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'History Failed', text: 'Could not fetch historical footprint logs.' });
      setIsHistoryModalOpen(false);
    } finally {
      setHistoryLoading(false);
    }
  };

  // --- EXPORT TO PDF & CSV ---
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Student Enrollments List', 14, 15);
    
    const activeYearTitle = academicYears.find(y => y.id === filterYear)?.title || '';
    const activeClassName = classes.find(c => c.id === filterClass)?.name || '';
    const activeSectionName = allSections.find(s => s.id === filterSection)?.name || '';
    doc.setFontSize(10);
    doc.text(`Academic Year: ${activeYearTitle} | Class: ${activeClassName} | Section: ${activeSectionName}`, 14, 20);

    autoTable(doc, {
      startY: 25,
      head: [['Roll No', 'Student Name', 'Admission No', 'Status']],
      body: processedData.map(e => [
        e.roll_number,
        e.student_name || '',
        e.admission_number || '',
        e.status
      ]),
    });
    doc.save(`enrollments_${activeClassName}_${activeSectionName}.pdf`);
  };

  const exportCSV = () => {
    const headers = ['Roll No', 'Student Name', 'Admission No', 'Status'];
    const csvRows = processedData.map(e => [
      e.roll_number,
      e.student_name || '',
      e.admission_number || '',
      e.status
    ]);
    const csvContent = [headers, ...csvRows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const activeClassName = classes.find(c => c.id === filterClass)?.name || '';
    const activeSectionName = allSections.find(s => s.id === filterSection)?.name || '';
    
    link.setAttribute("href", url);
    link.setAttribute("download", `enrollments_${activeClassName}_${activeSectionName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEnrollmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      if (actionType === 'enroll') {
        const payload = {
          tenant_id: tenantId,
          student_id: selectedStudentId,
          academic_year_id: targetYearId,
          class_id: targetClassId,
          section_id: targetSectionId,
          roll_number: parseInt(rollNumber)
        };
        await api.post('/studentenrollments/enroll', payload);
        Swal.fire({ icon: 'success', title: 'Enrollment Confirmed', text: 'Student has been initialized successfully.', timer: 1500, showConfirmButton: false });

      } else if (actionType === 'transfer') {
        const payload = {
          enrollment_id: activeEnrollmentId,
          new_class_id: targetClassId,
          new_section_id: targetSectionId,
          new_roll_number: parseInt(rollNumber),
          remarks: 'Lateral Section Transfer'
        };
        await api.put('/studentenrollments/transfer', payload);
        Swal.fire({ icon: 'success', title: 'Transfer Completed', text: 'Class configuration updated successfully.', timer: 1500, showConfirmButton: false });

      } else if (actionType === 'promote') {
        const payload = {
          student_id: selectedStudentId,
          previous_enrollment_id: activeEnrollmentId,
          new_academic_year_id: targetYearId,
          new_class_id: targetClassId,
          new_section_id: targetSectionId,
          new_roll_number: parseInt(rollNumber)
        };
        await api.post('/studentenrollments/promote', payload);
        Swal.fire({ icon: 'success', title: 'Promotion Cataloged', text: 'Student migrated to next level.', timer: 1500, showConfirmButton: false });
      }

      setIsFormDrawerOpen(false);
      fetchEnrollments();
    } catch (err: any) {
      const serverData = err.response?.data;
      let msg = 'Transaction could not safely update tracking parameters.';
      if (typeof serverData === 'string') {
        msg = serverData;
      } else if (serverData?.message) {
        msg = serverData.message;
      } else if (serverData?.errors) {
        msg = Object.values(serverData.errors).flat().join(' ');
      } else if (serverData?.title) {
        msg = serverData.title;
      }
      Swal.fire({ icon: 'error', title: 'Operation Failed', text: msg, confirmButtonColor: '#ef4444' });
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- TANSTACK TABLE CONFIGURATION ---
  const processedData = useMemo(() => {
    const keyword = searchKeyword.toLowerCase();
    return enrollments.filter(e => 
      e.student_name?.toLowerCase().includes(keyword) || 
      e.admission_number?.toLowerCase().includes(keyword)
    );
  }, [enrollments, searchKeyword]);

  const [sorting, setSorting] = useState<SortingState>([{ id: 'roll_number', desc: false }]);

  const columns = useMemo(() => [
    columnHelper.accessor('roll_number', {
      header: 'Roll No',
      cell: info => (
        <span className="inline-flex items-center justify-center min-w-[2.25rem] h-8 px-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs border border-indigo-200 dark:border-indigo-800/60 shadow-2xs">
          #{info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('student_name', {
      header: 'Student Profile',
      cell: info => {
        const row = info.row.original;
        const fullName = info.getValue() || 'Unknown';
        return (
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ${getAvatarGradient(fullName)}`}>
              {getInitials(fullName, '')}
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white text-sm">{fullName}</div>
              <div className="text-xs text-gray-500 font-mono mt-0.5">{row.admission_number}</div>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: 'Lifecycle Status',
      cell: info => {
        const val = info.getValue();
        let color: any = 'light';
        if (val === 'Active') color = 'success';
        else if (val === 'Transferred') color = 'warning';
        else if (val === 'Promoted') color = 'primary';
        else if (val === 'Dropped') color = 'error';
        
        return <Badge variant="light" color={color}>{val}</Badge>;
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: info => {
        const row = info.row.original;
        return (
          <div className="flex justify-end">
            <EnrollmentActionMenu 
              status={row.status}
              onTransfer={() => initTransferView(row)}
              onPromote={() => initPromoteView(row)}
              onHistory={() => viewHistoryContext(row.student_id, row.student_name || 'Unknown')}
            />
          </div>
        );
      },
    }),
  ], []);

  const table = useReactTable({
    data: processedData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 }
    }
  });

  // --- STATS CALCULATION ---
  const activeStudents = enrollments.filter(e => e.status === 'Active').length;
  const transferredStudents = enrollments.filter(e => e.status === 'Transferred').length;
  const promotedStudents = enrollments.filter(e => e.status === 'Promoted').length;

  return (
    <div className="w-full min-w-0 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Student Enrollments</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Process new admissions, section lateral transfers, and next-grade year promotions.</p>
        </div>
        
        <Button variant="primary" onClick={initEnrollView} className="shadow-lg shadow-brand-500/20">
          + Enroll New Student
        </Button>
      </div>

      {/* KPI STATS */}
      <EnrollmentStats 
        totalStudents={enrollments.length}
        activeStudents={activeStudents}
        transferredStudents={transferredStudents}
        promotedStudents={promotedStudents}
        loading={loading}
      />

      {/* DATA INVENTORY GRID */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm min-w-0">
        
        {/* Interactive Filters */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <SearchableSelect
                label="Academic Year"
                options={academicYearOptions}
                value={filterYear}
                onChange={(val) => setFilterYear(val as string)}
                placeholder="Choose Year"
              />
            </div>
            <div>
              <SearchableSelect
                label="Class Focus"
                options={classOptions}
                value={filterClass}
                onChange={(val) => setFilterClass(val as string)}
                placeholder="Choose Class"
              />
            </div>
            <div>
              <SearchableSelect
                label="Section Grid"
                options={allSections.filter(s => s.class_id === filterClass).map(s => ({ value: s.id, label: s.name }))}
                value={filterSection}
                onChange={(val) => setFilterSection(val)}
                placeholder="Choose Section"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Search & Export</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Name or admission id..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>
                <button onClick={exportPDF} title="Export to PDF" className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={exportCSV} title="Export to CSV" className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors">
                  CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
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
                      <div className="flex items-center gap-2">
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
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No active enrollments found for the selected criteria.
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

      {/* --- DRAWERS & MODALS --- */}
      <EnrollmentFormDrawer 
        isOpen={isFormDrawerOpen}
        onClose={() => setIsFormDrawerOpen(false)}
        actionType={actionType}
        studentOptions={studentOptions}
        academicYearOptions={academicYearOptions}
        classOptions={classOptions}
        filteredSectionOptions={filteredSectionOptions}
        selectedStudentId={selectedStudentId}
        setSelectedStudentId={setSelectedStudentId}
        targetYearId={targetYearId}
        setTargetYearId={setTargetYearId}
        targetClassId={targetClassId}
        setTargetClassId={setTargetClassId}
        targetSectionId={targetSectionId}
        setTargetSectionId={setTargetSectionId}
        rollNumber={rollNumber}
        setRollNumber={setRollNumber}
        onAutoRollNumber={autoFetchNextRollNumber}
        submitLoading={submitLoading}
        onSubmit={handleEnrollmentSubmit}
      />

      <EnrollmentHistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        studentName={historyStudentName}
        historyList={historyList}
        historyLoading={historyLoading}
      />

    </div>
  );
}