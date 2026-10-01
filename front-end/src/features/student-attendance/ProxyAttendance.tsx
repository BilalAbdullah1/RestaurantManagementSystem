import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import DatePicker from '../../components/form/date-picker';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { toast } from '../../components/ui/Toast';
import { Users, CheckCircle, XCircle, Clock, Check, X } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';

export default function ProxyAttendance() {
  const tenantId = localStorage.getItem("tenantId") || "";

  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [allSections, setAllSections] = useState<any[]>([]);

  const [yearId, setYearId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    const fetchMeta = async () => {
      try {
        const [yearsRes, classesRes, sectionsRes] = await Promise.all([
          api.get(`/academicyears/tenant/${tenantId}`),
          api.get(`/classes/tenant/${tenantId}`),
          api.get(`/sections/tenant/${tenantId}`)
        ]);
        setAcademicYears(yearsRes.data);
        setClasses(classesRes.data);
        setAllSections(sectionsRes.data);

        const currentYear = yearsRes.data.find((y: any) => y.is_current) || yearsRes.data[0];
        if (currentYear) setYearId(currentYear.id);
        if (classesRes.data.length > 0) setClassId(classesRes.data[0].id);
      } catch (err) {
        toast.error("Failed to load metadata");
      }
    };
    fetchMeta();
  }, [tenantId]);

  const filteredSections = useMemo(() => allSections.filter(s => s.class_id === classId), [allSections, classId]);
  useEffect(() => {
    if (filteredSections.length > 0) setSectionId(filteredSections[0].id);
    else setSectionId('');
  }, [filteredSections]);

  const fetchAttendance = async () => {
    if (!yearId || !classId || !sectionId || !date) return;
    setLoading(true);
    try {
      const res = await api.get('/studentattendances/daily-list', {
        params: { academicYearId: yearId, classId, sectionId, date }
      });
      setStudents(res.data);
    } catch (err) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [yearId, classId, sectionId, date]);

  const handleStatusChange = (studentId: string, status: string) => {
    setStudents(prev => prev.map(s => s.student_id === studentId ? { ...s, attendance_status: status } : s));
  };

  const handleMarkAll = (status: string) => {
    setStudents(prev => prev.map(s => ({ ...s, attendance_status: status })));
  };

  const saveAttendance = async () => {
    if (students.length === 0) return;
    setIsSaving(true);
    try {
      const records = students.map(s => ({
        student_id: s.student_id,
        status: s.attendance_status,
        remarks: s.remarks || ''
      }));
      await api.post('/studentattendances/bulk-mark', {
        tenant_id: tenantId,
        academic_year_id: yearId,
        date: date,
        records
      });
      toast.success('Attendance saved successfully');
    } catch (err) {
      toast.error('Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const stats = [
    { title: "Total Students", value: students.length, icon: <Users className="w-5 h-5 text-brand-500" />, theme: "brand" as any },
    { title: "Present", value: students.filter(s => s.attendance_status === 'Present').length, icon: <CheckCircle className="w-5 h-5 text-success-500" />, theme: "success" as any },
    { title: "Absent", value: students.filter(s => s.attendance_status === 'Absent').length, icon: <XCircle className="w-5 h-5 text-error-500" />, theme: "error" as any },
    { title: "Late/Leave", value: students.filter(s => ['Late', 'Leave'].includes(s.attendance_status)).length, icon: <Clock className="w-5 h-5 text-warning-500" />, theme: "warning" as any }
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Attendance", href: "#" }, { label: "Proxy Attendance" }]} />
      
      <StatCards stats={stats} />

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <SearchableSelect 
            options={academicYears.map(y => ({ value: y.id, label: y.title }))}
            value={yearId}
            onChange={setYearId}
            placeholder="Select Year"
          />
          <SearchableSelect 
            options={classes.map(c => ({ value: c.id, label: c.name }))}
            value={classId}
            onChange={setClassId}
            placeholder="Select Class"
          />
          <SearchableSelect 
            options={filteredSections.map(s => ({ value: s.id, label: s.name }))}
            value={sectionId}
            onChange={setSectionId}
            placeholder="Select Section"
          />
          <DatePicker 
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => handleMarkAll('Present')} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold">Mark All Present</button>
          <button onClick={() => handleMarkAll('Absent')} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">Mark All Absent</button>
          <button onClick={saveAttendance} disabled={isSaving} className="ml-auto px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600">
            {isSaving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>

        <div className="overflow-x-auto min-h-[250px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-4">
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-400">No students found.</td></tr>
              ) : (
                students.map(s => (
                  <tr key={s.student_id}>
                    <td className="px-4 py-3">{s.roll_number}</td>
                    <td className="px-4 py-3 font-semibold dark:text-white">{s.student_name}</td>
                    <td className="px-4 py-3">
                      <select 
                        value={s.attendance_status} 
                        onChange={(e) => handleStatusChange(s.student_id, e.target.value)}
                        className={`text-sm rounded-lg border-gray-200 dark:border-gray-700 bg-transparent dark:text-white ${s.attendance_status === 'Absent' ? 'text-red-500' : 'text-emerald-500'}`}
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                        <option value="Leave">Leave</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <ActionMenu 
                        groups={[[
                          { label: 'Mark Present', icon: <Check className="w-4 h-4" />, onClick: () => handleStatusChange(s.student_id, 'Present') },
                          { label: 'Mark Absent', icon: <X className="w-4 h-4" />, onClick: () => handleStatusChange(s.student_id, 'Absent'), isDanger: true }
                        ]]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
