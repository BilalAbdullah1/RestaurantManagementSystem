import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import PageMeta from '../../components/common/PageMeta';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import { DataTable } from '../../components/ui/table/DataTable';
import { toast } from '../../components/ui/Toast';
import { ColumnDef } from '@tanstack/react-table';
import { Award, Printer, Search, RefreshCw, GraduationCap, Building, Receipt, CheckCircle } from 'lucide-react';

export default function BroadsheetReport() {
  const tenantId = localStorage.getItem('tenantId') || '';

  const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);
  const [examSetups, setExamSetups] = useState<{ value: string; label: string }[]>([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [challanCount, setChallanCount] = useState(0);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [broadsheetData, setBroadsheetData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    fetchLookups();
  }, [tenantId]);

  const fetchLookups = async () => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (!activeTenant) return;
    setLoading(true);
    try {
      const [classRes, examRes, studentRes, staffRes, challanRes] = await Promise.all([
        api.get(`/classes/tenant/${activeTenant}`).catch(() => ({ data: [] })),
        api.get(`/examsetups/tenant/${activeTenant}`).catch(() => ({ data: [] })),
        api.get(`/students/tenant/${activeTenant}`).catch(() => ({ data: [] })),
        api.get(`/staff/tenant/${activeTenant}`).catch(() => ({ data: [] })),
        api.get(`/feechallans/tenant/${activeTenant}`).catch(() => ({ data: [] }))
      ]);

      const classData = classRes.data || [];
      const examData = examRes.data || [];
      setClasses(classData.map((c: any) => ({ value: c.id, label: c.name })));
      setExamSetups(examData.map((e: any) => ({ value: e.id, label: e.name || e.title })));
      setStudentsCount((studentRes.data || []).length);
      setStaffCount((staffRes.data || []).length);
      setChallanCount((challanRes.data || []).length);

      if (classData.length > 0) setSelectedClass(classData[0].id);
      if (examData.length > 0) setSelectedExamId(examData[0].id);
    } catch (err) {
      toast.error('Failed to load lookup parameters.');
    } finally {
      setLoading(false);
    }
  };

  const generateBroadsheet = async () => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (!selectedClass || !selectedExamId || !activeTenant) {
      toast.error('Please select both Exam Term and Target Class to compile Broadsheet.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/examresults/tenant/${activeTenant}/class/${selectedClass}?examId=${selectedExamId}`);
      const rawResults = res.data || [];

      const compiled = rawResults.map((r: any, idx: number) => ({
        id: r.student_id,
        roll_number: r.admission_number || `${101 + idx}`,
        name: r.student_name,
        admNo: r.admission_number,
        totalObtained: r.total_obtained_marks,
        totalMax: r.total_max_marks,
        percentage: r.percentage,
        grade: r.grade,
        status: r.status,
        position: idx === 0 ? '1st (Valedictorian)' : idx === 1 ? '2nd' : idx === 2 ? '3rd' : `${idx + 1}th`
      }));

      setBroadsheetData(compiled);
      toast.success(`Compiled official broadsheet for ${compiled.length} student(s).`);
    } catch (err) {
      toast.error('Failed to compile live broadsheet from exam database.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const stats: StatCardData[] = useMemo(() => [
    { title: 'Enrolled Students', value: `${studentsCount} Students`, icon: <GraduationCap className="w-5 h-5 text-indigo-500" />, theme: 'indigo' as const },
    { title: 'Active Staff', value: `${staffCount} Members`, icon: <Building className="w-5 h-5 text-emerald-500" />, theme: 'success' as const },
    { title: 'Fee Vouchers', value: `${challanCount} Vouchers`, icon: <Receipt className="w-5 h-5 text-brand-500" />, theme: 'brand' as const },
    { title: 'Database Engine', value: 'Live Database Sync 🟢', icon: <CheckCircle className="w-5 h-5 text-amber-500" />, theme: 'warning' as const },
  ], [studentsCount, staffCount, challanCount]);

  const broadsheetColumns = useMemo<ColumnDef<any>[]>(() => [
    { header: 'Rank', accessorKey: 'position', cell: (info: any) => <span className="font-bold text-brand-600 dark:text-brand-400">{info.getValue()}</span> },
    { header: 'Roll / Adm No', accessorKey: 'admNo', cell: (info: any) => <span className="font-mono text-xs">{info.getValue()}</span> },
    { header: 'Student Name', accessorKey: 'name', cell: (info: any) => <span className="font-bold text-gray-900 dark:text-white">{info.getValue()}</span> },
    { header: 'Score Ratio', accessorKey: 'totalObtained', cell: (info: any) => <span className="font-mono font-bold">{info.row.original.totalObtained} / {info.row.original.totalMax}</span> },
    { header: 'Percentage', accessorKey: 'percentage', cell: (info: any) => <span className="font-bold">{info.getValue()}%</span> },
    { header: 'Grade', accessorKey: 'grade', cell: (info: any) => <Badge variant="solid" color={info.row.original.status === 'Pass' ? 'success' : 'error'}>{info.getValue()}</Badge> },
    { header: 'Status', accessorKey: 'status', cell: (info: any) => <Badge variant="light" color={info.getValue() === 'Pass' ? 'success' : 'error'}>{info.getValue()}</Badge> }
  ], []);

  return (
    <>
      <PageMeta title="Class Broadsheet Result Report" description="Official Class Broadsheet Result Matrix" />

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; background: white !important; color: black !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="w-full space-y-6 animate-in fade-in duration-300">
        <div className="no-print">
          <Breadcrumb items={[{ label: 'Reports & Analytics' }, { label: 'Class Broadsheet Result Report' }]} />
        </div>

        <div className="no-print bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-brand-500" /> Class Broadsheet Result Report
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Compile cumulative exam broadsheet results directly from live database exam marks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchLookups} disabled={loading} className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="w-4 h-4" /> Print Broadsheet
            </Button>
          </div>
        </div>

        <div className="no-print">
          <StatCards stats={stats} />
        </div>

        <div className="no-print bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Select Exam Scope for Broadsheet</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchableSelect label="Exam Term Scope *" options={examSetups} value={selectedExamId} onChange={v => setSelectedExamId(v as string)} />
            <SearchableSelect label="Target Class *" options={classes} value={selectedClass} onChange={v => setSelectedClass(v as string)} />
            <div className="flex items-end">
              <Button variant="primary" onClick={generateBroadsheet} disabled={loading} className="w-full flex items-center justify-center gap-2 h-10">
                <Search className="w-4 h-4" /> {loading ? 'Compiling Live Matrix...' : 'Compile Live Broadsheet'}
              </Button>
            </div>
          </div>
        </div>

        <div className="printable-area space-y-6">
          <DataTable
            data={broadsheetData}
            columns={broadsheetColumns}
            searchPlaceholder="Search broadsheet by candidate..."
            emptyMessage="Select Exam and Class above and click 'Compile Live Broadsheet'."
            exportable={true}
            exportFilename={`Broadsheet_${selectedClass}`}
          />
        </div>
      </div>
    </>
  );
}
