import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import { DataTable } from '../../components/ui/table/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import Badge from '../../components/ui/badge/Badge';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { toast } from '../../components/ui/Toast';
import { getAvatarGradient, getInitials } from '../../utils/avatarUtils';
import { ArrowRight, GraduationCap, Users, CheckCircle2, UserCheck, AlertCircle, Sparkles, Filter } from 'lucide-react';

export default function StudentPromotions() {
  const tenantId = localStorage.getItem('tenantId') || '';

  const [academicYears, setAcademicYears] = useState<{ value: string; label: string }[]>([]);
  const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);
  const [sections, setSections] = useState<{ value: string; label: string; classId: string }[]>([]);

  const [sourceYear, setSourceYear] = useState('');
  const [sourceClass, setSourceClass] = useState('');
  const [sourceSection, setSourceSection] = useState('');

  const [targetYear, setTargetYear] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [targetSection, setTargetSection] = useState('');

  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    const fetchDropdowns = async () => {
      try {
        const [yearRes, classRes, sectionRes] = await Promise.all([
          api.get(`/academicYears/tenant/${tenantId}`).catch(() => ({ data: [] })),
          api.get(`/classes/tenant/${tenantId}`).catch(() => ({ data: [] })),
          api.get(`/sections/tenant/${tenantId}`).catch(() => ({ data: [] }))
        ]);

        setAcademicYears(yearRes.data.map((y: any) => ({ value: y.id, label: y.title })));
        setClasses(classRes.data.map((c: any) => ({ value: c.id, label: c.name })));
        setSections(sectionRes.data.map((s: any) => ({ value: s.id, label: s.name, classId: s.class_id })));
      } catch (error) {
        console.error("Error fetching dropdowns:", error);
      }
    };
    fetchDropdowns();
  }, [tenantId]);

  const filteredSourceSections = useMemo(() => sections.filter(s => s.classId === sourceClass), [sections, sourceClass]);
  const filteredTargetSections = useMemo(() => sections.filter(s => s.classId === targetClass), [sections, targetClass]);

  const loadStudents = async () => {
    if (!sourceYear || !sourceClass || !sourceSection) {
      Swal.fire('Missing Selection', 'Please select source Academic Year, Class, and Section to load students.', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/StudentEnrollments/list?yearId=${sourceYear}&classId=${sourceClass}&sectionId=${sourceSection}`);
      const activeEnrollments = (res.data || []).filter((e: any) => e.status === 'Active');
      
      const studentRes = await api.get(`/students/tenant/${tenantId}`);
      const allStudents = studentRes.data || [];

      const mergedData = activeEnrollments.map((e: any) => {
        const studentObj = allStudents.find((s: any) => s.id === e.student_id) || {};
        return {
          student_id: e.student_id,
          roll_number: e.roll_number || 'N/A',
          first_name: studentObj.first_name || 'Unknown',
          last_name: studentObj.last_name || '',
          admission_number: studentObj.admission_number || 'N/A',
          gender: studentObj.gender || 'Male'
        };
      });

      setStudents(mergedData);
      setSelectedStudentIds(new Set(mergedData.map((s: any) => s.student_id))); // Select all by default
      toast.success(`Loaded ${mergedData.length} eligible students for promotion.`);
    } catch (err: any) {
      Swal.fire('Error', 'Unable to load student enrollment list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!targetYear || !targetClass || !targetSection) {
      Swal.fire('Missing Target', 'Please select the Target Academic Year, Class, and Section.', 'warning');
      return;
    }

    if (selectedStudentIds.size === 0) {
      Swal.fire('No Students Selected', 'Please select at least one student to promote.', 'warning');
      return;
    }

    const targetClassName = classes.find(c => c.value === targetClass)?.label || 'Target Class';
    const targetSecName = sections.find(s => s.value === targetSection)?.label || 'Target Section';

    const confirm = await Swal.fire({
      title: 'Promote Selected Students?',
      html: `<p class="text-sm text-gray-600">Are you sure you want to promote <b>${selectedStudentIds.size} student(s)</b> to <b>${targetClassName} (${targetSecName})</b>?</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      confirmButtonText: 'Yes, Promote Now'
    });

    if (!confirm.isConfirmed) return;

    const payload = {
      tenant_id: tenantId,
      new_academic_year_id: targetYear,
      new_class_id: targetClass,
      new_section_id: targetSection,
      student_ids: Array.from(selectedStudentIds)
    };

    try {
      setPromoting(true);
      const res = await api.post('/StudentEnrollments/bulk-promote', payload);
      Swal.fire('Promotion Successful! 🎉', res.data.message || `${selectedStudentIds.size} students promoted successfully.`, 'success');
      loadStudents();
    } catch (err: any) {
      Swal.fire('Promotion Failed', err.response?.data?.message || 'Failed to promote students', 'error');
    } finally {
      setPromoting(false);
    }
  };

  const toggleSelection = (studentId: string) => {
    const newSet = new Set(selectedStudentIds);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setSelectedStudentIds(newSet);
  };

  const toggleAll = () => {
    if (selectedStudentIds.size === students.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(students.map(s => s.student_id)));
    }
  };

  // KPI Summary
  const stats: StatCardData[] = useMemo(() => [
    { title: 'Loaded Eligible Students', value: students.length, icon: <Users className="w-5 h-5 text-indigo-500" />, theme: 'indigo' },
    { title: 'Selected for Promotion', value: selectedStudentIds.size, icon: <UserCheck className="w-5 h-5 text-emerald-500" />, theme: 'success' },
    { title: 'Unselected / Retained', value: Math.max(0, students.length - selectedStudentIds.size), icon: <AlertCircle className="w-5 h-5 text-amber-500" />, theme: 'warning' },
  ], [students, selectedStudentIds]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            checked={students.length > 0 && selectedStudentIds.size === students.length}
            onChange={toggleAll}
          />
        ),
        cell: (info) => (
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            checked={selectedStudentIds.has(info.row.original.student_id)}
            onChange={() => toggleSelection(info.row.original.student_id)}
          />
        )
      },
      {
        accessorKey: 'admission_number',
        header: 'Admission #',
        cell: info => <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">{info.getValue() as string}</span>,
      },
      {
        accessorFn: row => `${row.first_name} ${row.last_name}`,
        id: 'fullName',
        header: 'Student Name',
        cell: info => {
          const student = info.row.original;
          const initials = getInitials(student.first_name, student.last_name);
          const gradient = getAvatarGradient(student.student_id || '1');

          return (
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm"
                style={{ background: gradient }}
              >
                {initials}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {student.first_name} {student.last_name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {student.gender}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'roll_number',
        header: 'Current Roll No.',
        cell: info => (
          <Badge variant="light" color="primary">
            Roll #: {info.getValue() as string}
          </Badge>
        )
      },
      {
        id: 'status',
        header: 'Promotion Status',
        cell: info => {
          const isSelected = selectedStudentIds.has(info.row.original.student_id);
          return (
            <Badge variant="light" color={isSelected ? 'success' : 'warning'}>
              {isSelected ? 'Ready for Promotion 🟢' : 'Retained in Class 🟡'}
            </Badge>
          );
        }
      }
    ],
    [students, selectedStudentIds]
  );

  return (
    <div className="w-full space-y-6">
      <Breadcrumb items={[{ label: 'Students' }, { label: 'Bulk Student Promotions Engine' }]} />

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-brand-600" /> Bulk Student Promotions Engine
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Seamlessly promote active students from one academic session/class to the next session.
          </p>
        </div>
      </div>

      <StatCards stats={stats} />

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SOURCE */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-800">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">1</span>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Source Class & Session</h3>
          </div>
          
          <SearchableSelect label="Source Academic Year *" options={academicYears} value={sourceYear} onChange={(val) => setSourceYear(val as string)} />
          <SearchableSelect label="Source Class *" options={classes} value={sourceClass} onChange={(val) => setSourceClass(val as string)} />
          <SearchableSelect label="Source Section *" options={filteredSourceSections} value={sourceSection} onChange={(val) => setSourceSection(val as string)} />
          
          <div className="pt-2">
            <Button variant="primary" onClick={loadStudents} disabled={loading} className="w-full flex items-center justify-center gap-2">
              <Filter className="w-4 h-4" /> {loading ? 'Loading Students...' : 'Load Eligible Students'}
            </Button>
          </div>
        </div>

        {/* TARGET */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-800">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">2</span>
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 text-base">Target Class & Session</h3>
          </div>

          <SearchableSelect label="Target Academic Year *" options={academicYears} value={targetYear} onChange={(val) => setTargetYear(val as string)} />
          <SearchableSelect label="Target Class *" options={classes} value={targetClass} onChange={(val) => setTargetClass(val as string)} />
          <SearchableSelect label="Target Section *" options={filteredTargetSections} value={targetSection} onChange={(val) => setTargetSection(val as string)} />
          
          <div className="pt-2">
            <Button 
              variant="outline" 
              onClick={handlePromote} 
              disabled={promoting || students.length === 0} 
              className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 flex items-center justify-center gap-2 font-bold"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" /> {promoting ? 'Promoting Students...' : `Promote ${selectedStudentIds.size} Selected Students`}
            </Button>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      {students.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> Loaded Students Register ({students.length})
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Uncheck checkboxes for students who should be retained/not promoted.
            </span>
          </div>

          <div className="overflow-x-auto min-h-[250px]">
            <DataTable
              data={students}
              columns={columns}
              searchPlaceholder="Filter students by name or admission number..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
