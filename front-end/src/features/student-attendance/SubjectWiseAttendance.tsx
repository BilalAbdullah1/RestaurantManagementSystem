import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import DatePicker from '../../components/form/date-picker';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import { Skeleton } from '../../components/ui/Skeleton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { toast } from '../../components/ui/Toast';
import { Users, CheckCircle, XCircle, Check, X } from 'lucide-react';

export default function SubjectWiseAttendance() {
  const tenantId = localStorage.getItem("tenantId") || "";

  const [classes, setClasses] = useState<any[]>([]);
  const [allSections, setAllSections] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);

  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [periodId, setPeriodId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [classesRes, sectionsRes] = await Promise.all([
          api.get(`/classes/tenant/${tenantId}`),
          api.get(`/sections/tenant/${tenantId}`)
        ]);
        setClasses(classesRes.data);
        setAllSections(sectionsRes.data);
        if (classesRes.data.length > 0) setClassId(classesRes.data[0].id);
      } catch (err) {
        toast.error("Failed to load metadata");
      }
    };
    if (tenantId) fetchMeta();
  }, [tenantId]);

  const filteredSections = useMemo(() => allSections.filter(s => s.class_id === classId), [allSections, classId]);
  useEffect(() => {
    if (filteredSections.length > 0) setSectionId(filteredSections[0].id);
    else setSectionId('');
  }, [filteredSections]);

  useEffect(() => {
    const fetchPeriods = async () => {
      if (!sectionId) { setPeriods([]); return; }
      try {
        // Fix: Correct API endpoint with tenantId
        const res = await api.get(`/timetableperiods/tenant/${tenantId}/section/${sectionId}`);
        setPeriods(res.data);
        if (res.data.length > 0) setPeriodId(res.data[0].id);
        else setPeriodId('');
      } catch (err) {
        setPeriods([]);
        setPeriodId('');
      }
    };
    fetchPeriods();
  }, [sectionId]);

  const fetchAttendance = async () => {
    if (!classId || !sectionId || !periodId || !date) return;
    setLoading(true);
    try {
      const res = await api.get('/studentsubjectattendance/by-period', {
        params: { classId, sectionId, periodId, date }
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
  }, [classId, sectionId, periodId, date]);

  const handleStatusChange = (studentId: string, status: string) => {
    setStudents(prev => prev.map(s => s.student_id === studentId ? { ...s, attendance_status: status } : s));
  };

  const saveAttendance = async () => {
    if (students.length === 0) return;
    setIsSaving(true);
    try {
      const records = students.map(s => ({
        studentId: s.student_id,
        status: s.attendance_status,
        remarks: s.remarks || ''
      }));
      await api.post('/studentsubjectattendance/bulk-mark', {
        periodId: periodId,
        date: date,
        records: records
      });
      toast.success('Subject Attendance saved successfully');
    } catch (err) {
      toast.error('Failed to save subject attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const stats = [
    { title: "Period Strength", value: students.length, icon: <Users className="w-5 h-5 text-brand-500" />, theme: "brand" as any },
    { title: "Present", value: students.filter(s => s.attendance_status === 'Present').length, icon: <CheckCircle className="w-5 h-5 text-success-500" />, theme: "success" as any },
    { title: "Absent", value: students.filter(s => s.attendance_status === 'Absent').length, icon: <XCircle className="w-5 h-5 text-error-500" />, theme: "error" as any },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Attendance", href: "#" }, { label: "Subject-wise Attendance" }]} />
      
      <StatCards stats={stats} />

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
          <SearchableSelect 
            options={periods.map(p => ({ value: p.id, label: p.title || p.name || `Period (${p.start_time} - ${p.end_time})` }))}
            value={periodId}
            onChange={setPeriodId}
            placeholder="Select Period"
          />
          <DatePicker 
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="flex gap-2 mb-4 justify-end">
          <button onClick={saveAttendance} disabled={isSaving} className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600">
            {isSaving ? 'Saving...' : 'Save Period Attendance'}
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
                <tr><td colSpan={4} className="p-4 text-center text-gray-400">No students found for this period.</td></tr>
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
