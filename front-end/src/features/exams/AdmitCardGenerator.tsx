import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ColumnDef } from '@tanstack/react-table';

// Components
import Button from '../../components/ui/button/Button';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import Label from '../../components/form/Label';
import { toast } from '../../components/ui/Toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import Badge from '../../components/ui/badge/Badge';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { DataTable } from '../../components/ui/table/DataTable';
import { Skeleton } from '../../components/ui/Skeleton';

// Icons
import { ShieldAlert, Download, AlertTriangle, CheckCircle, Printer as PrintIcon, Users, UserCheck, ShieldX, QrCode } from 'lucide-react';

interface LookupItem {
  id: string;
  name?: string;
  title?: string;
}

interface StudentRecord {
  id: string;
  first_name: string;
  last_name: string;
  father_name?: string;
  registration_number?: string;
  admission_number?: string;
  roll_number?: string | number;
  status: string;
  has_dues: boolean;
  dues_amount: number;
  is_exam_blocked?: boolean;
  days_overdue?: number;
}

interface ExamScheduleItem {
  subject_name: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  room_number?: string;
}

export default function AdmitCardGenerator() {
  const tenantId = localStorage.getItem("tenantId") || "";

  // --- LOOKUP STATES ---
  const [examTerms, setExamTerms] = useState<LookupItem[]>([]);
  const [classes, setClasses] = useState<LookupItem[]>([]);
  const [tenantInfo, setTenantInfo] = useState<any>(null);

  // --- FILTER STATES ---
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');

  // --- DATA STATES ---
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [dateSheet, setDateSheet] = useState<ExamScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);

  // --- FETCH LOOKUPS ---
  useEffect(() => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (!activeTenant) return;
    const fetchLookups = async () => {
      try {
        const [examsRes, classesRes, tenantRes] = await Promise.all([
          api.get<LookupItem[]>(`/examsetups/tenant/${activeTenant}`),
          api.get<LookupItem[]>(`/classes/tenant/${activeTenant}`),
          api.get(`/tenants/${activeTenant}`).catch(() => ({ data: null }))
        ]);
        setExamTerms(examsRes.data);
        setClasses(classesRes.data);
        if (tenantRes.data) setTenantInfo(tenantRes.data);

        if (examsRes.data.length > 0) setSelectedExam(examsRes.data[0].id);
        if (classesRes.data.length > 0) setSelectedClass(classesRes.data[0].id);
      } catch (err) {
        toast.error("Failed to load metadata.");
      }
    };
    fetchLookups();
  }, [tenantId]);

  // --- FETCH CANDIDATES & DATESHEET ---
  const fetchStudents = async () => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (!selectedExam || !selectedClass) {
      toast.error('Please select both Exam Term and Target Class.');
      return;
    }
    setLoading(true);
    try {
      const [studentsRes, enrollmentsRes, defaultersRes, dateSheetRes] = await Promise.all([
        api.get(`/students/tenant/${activeTenant}`),
        api.get(`/studentenrollments/tenant/${activeTenant}`).catch(() => ({ data: [] })),
        api.get(`/feechallans/tenant/${activeTenant}`).catch(() => ({ data: [] })),
        api.get(`/examschedules/tenant/${activeTenant}/datesheet?examId=${selectedExam}&classId=${selectedClass}`).catch(() => ({ data: [] }))
      ]);

      setDateSheet(dateSheetRes.data || []);
      const enrollments = enrollmentsRes.data || [];
      const clearedOverrides: string[] = JSON.parse(localStorage.getItem("finance_exam_hold_cleared") || "[]");
      const overdueChallans = (defaultersRes.data || []).filter((c: any) => c.status !== 'Paid' && new Date(c.due_date) < new Date());

      let classStudents = (studentsRes.data || []).map((s: any, idx: number) => {
        const studentEnrollment = enrollments.find((e: any) => e.student_id === s.id);
        const studentChallan = overdueChallans.find((c: any) => c.student_id === s.id || c.admission_number === s.admission_number || c.admission_number === s.registration_number);
        let isBlocked = false;
        let daysOverdue = 0;

        if (studentChallan) {
          daysOverdue = Math.max(0, Math.floor((new Date().getTime() - new Date(studentChallan.due_date).getTime()) / (1000 * 3600 * 24)));
          if (daysOverdue >= 60 && !clearedOverrides.includes(s.id)) {
            isBlocked = true;
          }
        }

        const rollNoDisplay = studentEnrollment?.roll_number 
          ? String(studentEnrollment.roll_number) 
          : (s.roll_no ? String(s.roll_no) : (s.roll_number ? String(s.roll_number) : String(idx + 101)));

        const regAdmDisplay = s.admission_number || s.registration_number || `REG-${1000 + idx}`;

        return {
          ...s,
          roll_number: rollNoDisplay,
          admission_number: regAdmDisplay,
          registration_number: regAdmDisplay,
          has_dues: !!studentChallan,
          dues_amount: studentChallan ? (studentChallan.net_payable + (studentChallan.late_fine || 0)) : 0,
          is_exam_blocked: isBlocked,
          days_overdue: daysOverdue
        };
      });

      setStudents(classStudents);
    } catch (err) {
      toast.error('Failed to load candidate list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExam && selectedClass) {
      fetchStudents();
    }
  }, [selectedExam, selectedClass]);

  // --- STATS COMPUTATION ---
  const stats: StatCardData[] = useMemo(() => {
    const total = students.length;
    const cleared = students.filter(s => !s.is_exam_blocked).length;
    const blocked = students.filter(s => s.is_exam_blocked).length;

    return [
      { title: 'Total Candidates', value: `${total} Students`, icon: <Users className="w-6 h-6 text-brand-500" />, theme: 'brand' as const },
      { title: 'Admit Card Cleared', value: `${cleared} Eligible`, icon: <UserCheck className="w-6 h-6 text-success-500" />, theme: 'success' as const },
      { title: 'Fee Hold (Blocked)', value: `${blocked} On Hold`, icon: <ShieldX className="w-6 h-6 text-rose-500" />, theme: 'error' as const },
    ];
  }, [students]);

  // --- GENERATE ADMIT CARDS PDF ---
  const generateAdmitCards = (selectedStudents: StudentRecord[]) => {
    const blockedCount = selectedStudents.filter(s => s.is_exam_blocked).length;
    if (blockedCount > 0) {
      toast.error(`Cannot generate admit cards: ${blockedCount} student(s) have 60+ days overdue fee hold.`);
      return;
    }

    if (selectedStudents.length === 0) {
      toast.error('Please select at least one eligible student.');
      return;
    }

    const examTitle = examTerms.find(e => e.id === selectedExam)?.title || 'Academic Examination';
    const className = classes.find(c => c.id === selectedClass)?.name || 'Class';
    const schoolName = tenantInfo?.name || tenantInfo?.school_name || localStorage.getItem("tenantName") || "SCHOOL MANAGEMENT SYSTEM";

    const doc = new jsPDF('p', 'pt', 'a4');
    
    selectedStudents.forEach((student, index) => {
      if (index > 0) {
        doc.addPage();
      }

      let y = 35;

      // Outer Card Frame
      doc.setDrawColor(30, 64, 175);
      doc.setLineWidth(1.5);
      doc.rect(30, y, 535, 770);

      // School & Exam Title Header
      doc.setFillColor(30, 64, 175);
      doc.rect(30, y, 535, 60, 'F');
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(schoolName.toUpperCase(), 297, y + 25, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`OFFICIAL ADMIT CARD & ENTRY SLIP — ${examTitle.toUpperCase()}`, 297, y + 45, { align: 'center' });

      y += 75;

      // Student Information Box
      doc.setDrawColor(220, 226, 235);
      doc.setFillColor(248, 250, 252);
      doc.rect(45, y, 505, 95, 'FD');

      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'bold');
      doc.text(`STUDENT CANDIDATE PROFILE`, 55, y + 20);

      doc.setFont('helvetica', 'normal');
      doc.text(`Roll Number:`, 55, y + 40);
      doc.setFont('helvetica', 'bold');
      doc.text(String(student.roll_number || 'N/A'), 130, y + 40);

      doc.setFont('helvetica', 'normal');
      doc.text(`Reg / Adm No:`, 270, y + 40);
      doc.setFont('helvetica', 'bold');
      doc.text(String(student.admission_number || student.registration_number || 'N/A'), 355, y + 40);

      doc.setFont('helvetica', 'normal');
      doc.text(`Student Name:`, 55, y + 60);
      doc.setFont('helvetica', 'bold');
      doc.text(`${student.first_name} ${student.last_name}`, 130, y + 60);

      doc.setFont('helvetica', 'normal');
      doc.text(`Father Name:`, 270, y + 60);
      doc.setFont('helvetica', 'bold');
      doc.text(student.father_name || 'N/A', 355, y + 60);

      doc.setFont('helvetica', 'normal');
      doc.text(`Class / Grade:`, 55, y + 80);
      doc.setFont('helvetica', 'bold');
      doc.text(className, 130, y + 80);

      // Student Photo Placeholder Frame (Top Right of Info Box)
      doc.setDrawColor(180, 180, 180);
      doc.rect(460, y + 10, 75, 75);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`CANDIDATE`, 497, y + 45, { align: 'center' });
      doc.text(`PHOTO`, 497, y + 55, { align: 'center' });

      y += 115;

      // Date Sheet Schedule Table Section
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text(`EXAMINATION SCHEDULE (DATE SHEET)`, 45, y);

      y += 10;

      const scheduleRows = dateSheet.length > 0 
        ? dateSheet.map(ds => [
            new Date(ds.exam_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            ds.subject_name,
            `${ds.start_time} - ${ds.end_time}`,
            ds.room_number || 'Main Hall'
          ])
        : [['N/A', 'General Examination', '09:00 AM - 12:00 PM', 'Main Hall']];

      autoTable(doc, {
        head: [['Date', 'Subject Paper', 'Timing Window', 'Exam Hall']],
        body: scheduleRows,
        startY: y,
        margin: { left: 45, right: 45 },
        styles: { fontSize: 9, cellPadding: 5 },
        headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' }
      });

      y = (doc as any).lastAutoTable.finalY + 25;

      // Instructions & Verification Block
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`EXAM HALL INSTRUCTIONS & RULES:`, 45, y);
      
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(70, 70, 70);
      doc.text(`1. Candidate MUST present this original Admit Card upon entering the examination hall.`, 45, y + 15);
      doc.text(`2. Electronic devices, smartwatches, and unauthorized materials are strictly prohibited.`, 45, y + 28);
      doc.text(`3. Candidates must occupy their assigned seating hall at least 15 minutes before start time.`, 45, y + 41);

      y += 65;

      // Dues Notice (if applicable)
      if (student.has_dues) {
        doc.setFillColor(254, 242, 242);
        doc.setDrawColor(248, 113, 113);
        doc.rect(45, y, 505, 25, 'FD');
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 38, 38);
        doc.text(`* PROVISIONAL PERMIT: Student has pending fee dues of Rs. ${student.dues_amount}. Clear before result release.`, 55, y + 16);
        y += 40;
      }

      // Verification Barcode Box & Controller Stamp Signature (Bottom)
      doc.setDrawColor(200, 200, 200);
      doc.rect(45, y, 100, 45);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`[ QR SECURITY ]`, 95, y + 25, { align: 'center' });

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.line(400, y + 30, 530, y + 30);
      doc.text(`Controller of Examinations`, 465, y + 42, { align: 'center' });
    });

    doc.save(`Admit_Cards_${className}.pdf`);
    toast.success(`Generated Admit Cards PDF for ${selectedStudents.length} candidates.`);
  };

  // --- TABLE COLUMNS ---
  const columns = useMemo<ColumnDef<StudentRecord>[]>(() => [
    {
      header: 'Roll No',
      accessorKey: 'roll_number',
      cell: info => (
        <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-black px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700">
          {String(info.getValue() || 'N/A')}
        </span>
      )
    },
    {
      header: 'Reg / Adm No',
      accessorKey: 'admission_number',
      cell: info => <span className="font-semibold text-gray-700 dark:text-gray-300">{String(info.getValue() || 'N/A')}</span>
    },
    {
      header: 'Candidate Name',
      id: 'name',
      accessorFn: row => `${row.first_name} ${row.last_name}`,
      cell: info => <span className="font-bold text-gray-900 dark:text-white">{info.getValue() as string}</span>
    },
    {
      header: 'Father Name',
      accessorKey: 'father_name',
      cell: info => <span className="text-gray-600 dark:text-gray-400 font-medium">{String(info.getValue() || '-')}</span>
    },
    {
      header: 'Fee Status & Admit Hold',
      id: 'status_hold',
      cell: info => {
        const student = info.row.original;
        if (student.is_exam_blocked) {
          return (
            <Badge variant="solid" color="error" size="sm" className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> ⛔ FEE HOLD (60+ Days Overdue)
            </Badge>
          );
        }
        return student.has_dues ? (
          <Badge variant="light" color="warning" size="sm" className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Dues Pending (Rs. {student.dues_amount})
          </Badge>
        ) : (
          <Badge variant="light" color="success" size="sm" className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Cleared & Eligible
          </Badge>
        );
      }
    },
    {
      header: 'Action',
      id: 'print_action',
      cell: info => {
        const student = info.row.original;
        return (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              disabled={student.is_exam_blocked}
              onClick={() => generateAdmitCards([student])}
              className="flex items-center gap-1 text-xs"
            >
              <PrintIcon className="w-3.5 h-3.5 text-indigo-500" /> Print Slip
            </Button>
          </div>
        );
      }
    }
  ], [examTerms, classes, dateSheet]);

  const examOptions = useMemo(() => examTerms.map(e => ({ value: e.id, label: e.title || '' })), [examTerms]);
  const classOptions = useMemo(() => classes.map(c => ({ value: c.id, label: c.name || '' })), [classes]);

  if (loading && students.length === 0) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Examinations', href: '#' }, { label: 'Admit Cards' }]} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      <Breadcrumb items={[{ label: 'Examinations', href: '#' }, { label: 'Admit Cards' }]} />
      
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Admit Cards & Slips Generator</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Generate Roll No slips with embedded subject Date Sheets, QR security codes, and fee clearance holds.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="primary" 
            onClick={() => generateAdmitCards(students.filter(s => !s.is_exam_blocked))} 
            disabled={students.length === 0}
            className="flex items-center gap-2"
          >
            <PrintIcon className="w-4 h-4" /> Print All Eligible Slips
          </Button>
        </div>
      </div>

      {/* DUAL SELECT FILTERS */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <SearchableSelect 
            label="Select Exam Term *"
            options={examOptions}
            value={selectedExam}
            onChange={(val) => setSelectedExam(val as string)}
            placeholder="Choose Exam Term..."
          />
        </div>
        <div>
          <SearchableSelect 
            label="Select Target Class *"
            options={classOptions}
            value={selectedClass}
            onChange={(val) => setSelectedClass(val as string)}
            placeholder="Choose Target Class..."
          />
        </div>
      </div>

      {/* STATS SUMMARY */}
      {students.length > 0 && <StatCards stats={stats} loading={loading} />}

      {/* DATA TABLE SECTION */}
      <DataTable
        loading={loading}
        data={students}
        columns={columns}
        searchPlaceholder="Search candidates by name or roll number..."
        emptyMessage={
          !selectedExam || !selectedClass 
            ? 'Select an Exam Term and Class to load candidates.' 
            : 'No candidates found in this class.'
        }
        exportable={true}
        exportFilename="AdmitCardCandidates"
      />
    </div>
  );
}
