import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import { toast } from '../../components/ui/Toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import ActionMenu, { ActionMenuItem } from '../../components/ui/UIDesigns/ActionMenu';
import { DataTable } from '../../components/ui/table/DataTable';
import { Skeleton } from '../../components/ui/Skeleton';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ColumnDef } from '@tanstack/react-table';
import { ShieldAlert, Printer, Cpu, Trophy, Medal, Award, CheckCircle, XCircle, Users } from 'lucide-react';
import { activeClientConfig } from '../../config/clientConfig';

interface SubjectMarkBreakdown {
  subject_name: string;
  max_marks: number;
  passing_marks: number;
  theory_marks: number;
  practical_marks: number;
  assignment_marks: number;
  obtained_marks: number;
  is_absent: boolean;
}

interface StudentReportCard {
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  exam_title: string;
  total_max_marks: number;
  total_obtained_marks: number;
  percentage: number;
  grade: string;
  gpa: number;
  status: 'Pass' | 'Fail';
  subjects: SubjectMarkBreakdown[];
  is_exam_blocked?: boolean;
}

interface LookupItem {
  id: string;
  name?: string;
  title?: string;
}

export default function ExamReportCardsReport() {
  const tenantId = localStorage.getItem("tenantId") || "";

  const [examTerms, setExamTerms] = useState<LookupItem[]>([]);
  const [classes, setClasses] = useState<LookupItem[]>([]);
  const [tenantInfo, setTenantInfo] = useState<any>(null);

  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');

  const [results, setResults] = useState<StudentReportCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [compiling, setCompiling] = useState(false);

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
        toast.error('Failed to load report parameters.');
      }
    };
    fetchLookups();
  }, [tenantId]);

  const fetchClassResults = async () => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (!selectedExam || !selectedClass || !activeTenant) return;
    setLoading(true);
    try {
      const [resultsRes, defaultersRes] = await Promise.all([
        api.get<StudentReportCard[]>(`/examresults/tenant/${activeTenant}/class/${selectedClass}?examId=${selectedExam}`),
        api.get(`/feechallans/tenant/${activeTenant}`).catch(() => ({ data: [] }))
      ]);

      const clearedOverrides: string[] = JSON.parse(localStorage.getItem("finance_exam_hold_cleared") || "[]");
      const overdueChallans = (defaultersRes.data || []).filter((c: any) => c.status !== 'Paid' && new Date(c.due_date) < new Date());

      const enrichedResults = (resultsRes.data || []).map((r: StudentReportCard) => {
        const studentChallan = overdueChallans.find((c: any) => c.student_id === r.student_id || c.admission_number === r.admission_number);
        let isBlocked = false;

        if (studentChallan) {
          const daysOverdue = Math.max(0, Math.floor((new Date().getTime() - new Date(studentChallan.due_date).getTime()) / (1000 * 3600 * 24)));
          if (daysOverdue >= 60 && !clearedOverrides.includes(r.student_id)) {
            isBlocked = true;
          }
        }

        return {
          ...r,
          is_exam_blocked: isBlocked
        };
      });

      setResults(enrichedResults);
    } catch (err) {
      toast.error('Failed to read compiled report cards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExam && selectedClass) {
      fetchClassResults();
    }
  }, [selectedExam, selectedClass]);

  const handleCompileResults = async () => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (!selectedExam || !selectedClass || !activeTenant) {
      toast.error('Please select both Exam Term and Target Class before compiling.');
      return;
    }

    setCompiling(true);
    try {
      const payload = {
        tenant_id: activeTenant,
        exam_setup_id: selectedExam,
        class_id: selectedClass
      };
      
      await api.post('/examresults/generate', payload);
      await fetchClassResults();
      toast.success('Results Processed! Total percentages, grades, and positions recalculated.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Calculation engine halted.');
    } finally {
      setCompiling(false);
    }
  };

  const positionHolders = useMemo(() => {
    if (results.length === 0) return { first: null, second: null, third: null };
    return {
      first: results[0] || null,
      second: results[1] || null,
      third: results[2] || null
    };
  }, [results]);

  const stats: StatCardData[] = useMemo(() => {
    const total = results.length;
    const passCount = results.filter(r => r.status === 'Pass').length;
    const failCount = results.filter(r => r.status === 'Fail').length;

    return [
      { title: 'Total Transcripts', value: `${total} Students`, icon: <Users className="w-6 h-6 text-brand-500" />, theme: 'brand' as const },
      { title: 'Passed Candidates', value: `${passCount} Passed`, icon: <CheckCircle className="w-6 h-6 text-success-500" />, theme: 'success' as const },
      { title: 'Failed / Re-sit', value: `${failCount} Failed`, icon: <XCircle className="w-6 h-6 text-rose-500" />, theme: 'error' as const },
    ];
  }, [results]);

  const printReportCardPdf = (student: StudentReportCard, docObj?: jsPDF, isBulk = false) => {
    if (student.is_exam_blocked && !isBulk) {
      toast.error(`⛔ Gradebook Restricted! ${student.student_name} has 60+ days fee default.`);
      return;
    }

    const doc = docObj || new jsPDF('p', 'pt', 'a4');
    const activeExamTitle = examTerms.find(e => e.id === selectedExam)?.title || "Academic Examination";
    const activeClassName = classes.find(c => c.id === selectedClass)?.name || "Class Group";
    const schoolName = tenantInfo?.name || tenantInfo?.school_name || localStorage.getItem("tenantName") || activeClientConfig.branding.schoolName;

    let y = 35;

    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(1.5);
    doc.rect(30, y, 535, 770);

    doc.setFillColor(30, 64, 175);
    doc.rect(30, y, 535, 55, 'F');

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(schoolName.toUpperCase(), 297, y + 25, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`OFFICIAL ACADEMIC TRANSCRIPT — ${activeExamTitle.toUpperCase()}`, 297, y + 43, { align: "center" });

    y += 70;

    doc.setDrawColor(220, 226, 235);
    doc.setFillColor(248, 250, 252);
    doc.rect(45, y, 505, 80, 'FD');

    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    doc.setFont("helvetica", "normal"); doc.text("Student Name:", 55, y + 25);
    doc.setFont("helvetica", "bold"); doc.text(student.student_name, 140, y + 25);

    doc.setFont("helvetica", "normal"); doc.text("Roll / Adm No:", 55, y + 45);
    doc.setFont("helvetica", "bold"); doc.text(student.admission_number, 140, y + 45);

    doc.setFont("helvetica", "normal"); doc.text("Class / Grade:", 55, y + 65);
    doc.setFont("helvetica", "bold"); doc.text(activeClassName, 140, y + 65);

    doc.setFont("helvetica", "normal"); doc.text("Final Grade:", 330, y + 25);
    doc.setFont("helvetica", "bold"); doc.text(student.grade, 410, y + 25);

    doc.setFont("helvetica", "normal"); doc.text("GPA Secured:", 330, y + 45);
    doc.setFont("helvetica", "bold"); doc.text(student.gpa.toFixed(2), 410, y + 45);

    doc.setFont("helvetica", "normal"); doc.text("Exam Outcome:", 330, y + 65);
    if (student.status === 'Pass') {
      doc.setTextColor(16, 185, 129);
    } else {
      doc.setTextColor(239, 68, 68);
    }
    doc.setFont("helvetica", "bold"); doc.text(student.status.toUpperCase(), 410, y + 65);

    y += 95;

    const tableBody = (student.subjects || []).map((sub) => {
      const subPercentage = sub.max_marks > 0 ? ((sub.obtained_marks / sub.max_marks) * 100).toFixed(1) + '%' : '0%';
      const statusText = sub.is_absent ? 'ABSENT' : (sub.obtained_marks >= sub.passing_marks ? 'PASS' : 'FAIL');
      return [
        sub.subject_name,
        sub.max_marks,
        sub.passing_marks,
        sub.is_absent ? '0' : sub.theory_marks,
        sub.is_absent ? '0' : sub.practical_marks,
        sub.is_absent ? '0' : sub.assignment_marks,
        sub.is_absent ? '0' : sub.obtained_marks,
        subPercentage,
        statusText
      ];
    });

    autoTable(doc, {
      startY: y,
      margin: { left: 45, right: 45 },
      head: [['Subject Paper', 'Max', 'Pass', 'Theory', 'Prac', 'Assig', 'Total', '%', 'Status']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, halign: 'center' },
      styles: { fontSize: 8.5, cellPadding: 5 },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'center' },
        8: { halign: 'center' }
      }
    });

    y = (doc as any).lastAutoTable.finalY + 20;

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(45, y, 505, 30, 'FD');

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 64, 175);
    doc.text(`Cumulative Marks: ${student.total_obtained_marks} / ${student.total_max_marks}`, 55, y + 19);
    doc.text(`Aggregate Score: ${student.percentage.toFixed(1)}%`, 330, y + 19);

    y += 60;

    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");

    doc.line(65, y, 195, y);
    doc.text("Class Teacher Signature", 130, y + 15, { align: 'center' });

    doc.line(355, y, 485, y);
    doc.text("Principal / Controller Signature", 420, y + 15, { align: 'center' });

    if (!docObj) {
      doc.save(`Transcript_${student.student_name.replace(/\s+/g, '_')}_${student.admission_number}.pdf`);
      toast.success(`Downloaded transcript for ${student.student_name}.`);
    }
  };

  const handlePrintAllTranscripts = () => {
    const eligibleStudents = results.filter(r => !r.is_exam_blocked);
    if (eligibleStudents.length === 0) {
      toast.error('No eligible students available for transcript printing.');
      return;
    }

    const doc = new jsPDF('p', 'pt', 'a4');
    eligibleStudents.forEach((student, index) => {
      if (index > 0) doc.addPage();
      printReportCardPdf(student, doc, true);
    });

    const activeClassName = classes.find(c => c.id === selectedClass)?.name || "Class";
    doc.save(`All_Transcripts_${activeClassName}.pdf`);
    toast.success(`Generated consolidated PDF transcripts for ${eligibleStudents.length} students.`);
  };

  const columns = useMemo<ColumnDef<StudentReportCard>[]>(() => [
    {
      header: 'Rank',
      id: 'rank',
      cell: (info: any) => {
        const index = info.row.index;
        return (
          <span className={`inline-block font-black px-2.5 py-1 rounded-md text-xs ${
            index < 3 
              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}>
            #{index + 1}
          </span>
        );
      }
    },
    {
      header: 'Candidate Profile',
      id: 'profile',
      accessorFn: row => `${row.student_name} ${row.admission_number}`,
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-base">{row.student_name}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">Roll No: {row.admission_number}</p>
          </div>
        );
      }
    },
    {
      header: 'Marks & Score Ratio',
      id: 'score',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div>
            <div className="font-extrabold text-base text-gray-900 dark:text-white">{row.percentage.toFixed(1)}%</div>
            <div className="text-xs text-gray-500 font-medium">{row.total_obtained_marks} / {row.total_max_marks} Marks</div>
          </div>
        );
      }
    },
    {
      header: 'Grade & GPA',
      id: 'gpa',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <Badge variant="solid" color={row.status === 'Pass' ? 'success' : 'error'} size="md">
              {row.grade}
            </Badge>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">GPA {row.gpa.toFixed(2)}</span>
          </div>
        );
      }
    },
    {
      header: 'Status & Hold',
      id: 'status_hold',
      cell: (info: any) => {
        const row = info.row.original;
        if (row.is_exam_blocked) {
          return (
            <Badge variant="solid" color="error" size="sm" className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> ⛔ GRADEBOOK BLOCKED (60+ Days)
            </Badge>
          );
        }
        return (
          <Badge variant="light" color={row.status === 'Pass' ? 'success' : 'error'} size="sm">
            {row.status.toUpperCase()}
          </Badge>
        );
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (info: any) => {
        const row = info.row.original;
        const groups: ActionMenuItem[][] = [
          [
            { label: 'Print Transcript PDF', icon: <Printer className="w-4 h-4" />, onClick: () => printReportCardPdf(row) }
          ]
        ];
        return (
          <div className="flex justify-end">
            <ActionMenu groups={groups} />
          </div>
        );
      }
    }
  ], [examTerms, classes, tenantInfo]);

  const examOpts = useMemo(() => examTerms.map(e => ({ value: e.id, label: e.title || '' })), [examTerms]);
  const classOpts = useMemo(() => classes.map(c => ({ value: c.id, label: c.name || '' })), [classes]);

  if (loading && results.length === 0) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Reports & Analytics' }, { label: 'Academic Report Cards & Transcripts' }]} />
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
      <Breadcrumb items={[{ label: 'Reports & Analytics' }, { label: 'Academic Report Cards & Transcripts' }]} />
      
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Academic Report Cards & Transcripts Report</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Compile cumulative class results, process grade thresholds, and print multi-course transcripts.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={handlePrintAllTranscripts} disabled={results.length === 0} className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-indigo-500" /> Print All Class Transcripts
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCompileResults} 
            disabled={compiling || !selectedExam || !selectedClass} 
            className="flex items-center gap-2 shadow-sm"
          >
            {compiling ? 'Compiling Scores...' : <><Cpu className="w-4 h-4" /> Compile Results Engine</>}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <SearchableSelect 
            label="Select Exam Term Scope *"
            options={examOpts} 
            value={selectedExam} 
            onChange={(val) => setSelectedExam(val as string)} 
            placeholder="Choose Exam Term..." 
          />
        </div>
        <div>
          <SearchableSelect 
            label="Select Target Class Group *"
            options={classOpts} 
            value={selectedClass} 
            onChange={(val) => setSelectedClass(val as string)} 
            placeholder="Choose Class Group..." 
          />
        </div>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-bottom-4 duration-300">
          {positionHolders.first && (
            <div className="bg-white dark:bg-gray-900 border border-amber-300 dark:border-amber-700 rounded-xl p-5 shadow-sm relative overflow-hidden flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 font-black flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-700 shadow-inner">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">1st Position (Valedictorian)</p>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate mt-0.5">{positionHolders.first.student_name}</h4>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Score: <strong className="text-gray-900 dark:text-white">{positionHolders.first.percentage.toFixed(1)}%</strong> ({positionHolders.first.grade})</p>
              </div>
            </div>
          )}

          {positionHolders.second && (
            <div className="bg-white dark:bg-gray-900 border border-slate-300 dark:border-slate-700 rounded-xl p-5 shadow-sm relative overflow-hidden flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 shadow-inner">
                <Medal className="w-6 h-6" />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">2nd Position</p>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate mt-0.5">{positionHolders.second.student_name}</h4>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Score: <strong className="text-gray-900 dark:text-white">{positionHolders.second.percentage.toFixed(1)}%</strong> ({positionHolders.second.grade})</p>
              </div>
            </div>
          )}

          {positionHolders.third && (
            <div className="bg-white dark:bg-gray-900 border border-orange-300 dark:border-orange-700 rounded-xl p-5 shadow-sm relative overflow-hidden flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-black flex items-center justify-center shrink-0 border border-orange-200 dark:border-orange-800 shadow-inner">
                <Award className="w-6 h-6" />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider">3rd Position</p>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate mt-0.5">{positionHolders.third.student_name}</h4>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Score: <strong className="text-gray-900 dark:text-white">{positionHolders.third.percentage.toFixed(1)}%</strong> ({positionHolders.third.grade})</p>
              </div>
            </div>
          )}
        </div>
      )}

      {results.length > 0 && <StatCards stats={stats} />}

      {selectedExam && selectedClass && (
        <DataTable
          data={results}
          columns={columns}
          searchPlaceholder="Search compiled transcripts by candidate name or roll number..."
          emptyMessage="No compiled results found for this class. Click 'Compile Results Engine' above to process grades."
          exportable={true}
          exportFilename={`ClassLedger_${selectedClass}`}
        />
      )}
    </div>
  );
}
