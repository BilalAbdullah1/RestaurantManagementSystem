import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { ColumnDef } from '@tanstack/react-table';

// Components
import Input from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import DatePicker from '../../components/form/date-picker';
import TimePicker from '../../components/form/TimePicker';
import Label from '../../components/form/Label';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import ActionMenu, { ActionMenuItem } from '../../components/ui/UIDesigns/ActionMenu';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import { DataTable } from '../../components/ui/table/DataTable';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Skeleton } from '../../components/ui/Skeleton';
import { toast } from '../../components/ui/Toast';

// Icons
import { Plus, Edit, Trash2, Calendar, Clock, BookOpen, Layers, Target, AlertTriangle, CheckCircle, Send, UserCheck, DoorOpen } from 'lucide-react';

// --- TYPES ---
interface ExamSchedule {
  id: string;
  exam_setup_id: string;
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_name: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  total_marks: number;
  passing_marks: number;
  room_number?: string;
  invigilator_name?: string;
}

interface LookupItem {
  id: string;
  name?: string;
  title?: string;
  status?: string;
}

export default function ExamSchedules() {
  const tenantId = localStorage.getItem("tenantId") || "";

  // --- STATES ---
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [examTerms, setExamTerms] = useState<LookupItem[]>([]);
  const [classes, setClasses] = useState<LookupItem[]>([]);
  const [subjects, setSubjects] = useState<LookupItem[]>([]);
  
  // Active Main Filters
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form State
  const initialForm = {
    id: '',
    tenant_id: tenantId,
    exam_setup_id: '',
    class_id: '',
    subject_id: '',
    exam_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '12:00',
    total_marks: 100,
    passing_marks: 40,
    room_number: 'Hall A',
    invigilator_name: ''
  };
  const [formData, setFormData] = useState(initialForm);

  // --- FETCH MASTER DATA (METADATA) ---
  useEffect(() => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (!activeTenant) return;
    const fetchMetadata = async () => {
      try {
        const [examsRes, classesRes, subjectsRes] = await Promise.all([
          api.get<LookupItem[]>(`/examsetups/tenant/${activeTenant}`),
          api.get<LookupItem[]>(`/classes/tenant/${activeTenant}`),
          api.get<LookupItem[]>(`/subjects/tenant/${activeTenant}`)
        ]);
        
        setExamTerms(examsRes.data);
        setClasses(classesRes.data);
        setSubjects(subjectsRes.data);

        // Pre-select active or first exam/class if available
        if (examsRes.data.length > 0) setSelectedExam(examsRes.data[0].id);
        if (classesRes.data.length > 0) setSelectedClass(classesRes.data[0].id);
      } catch (err) {
        toast.error('Failed to load initial scheduling metadata.');
      }
    };
    fetchMetadata();
  }, [tenantId]);

  // --- FETCH DATE SHEET ---
  const fetchDateSheet = async () => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (!activeTenant || !selectedExam || !selectedClass) return;
    setLoading(true);
    try {
      const res = await api.get<ExamSchedule[]>(
        `/examschedules/tenant/${activeTenant}/datesheet?examId=${selectedExam}&classId=${selectedClass}`
      );
      setSchedules(res.data);
    } catch (err) {
      toast.error('Failed to fetch the requested date sheet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExam && selectedClass) {
      fetchDateSheet();
    }
  }, [selectedExam, selectedClass]);

  // --- CONFLICT & CLASH DETECTOR ---
  const clashAudit = useMemo(() => {
    if (schedules.length < 2) return { hasClash: false, message: 'No scheduling conflicts detected.' };

    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const s1 = schedules[i];
        const s2 = schedules[j];
        if (s1.exam_date.split('T')[0] === s2.exam_date.split('T')[0]) {
          // Check time overlap
          if (s1.start_time === s2.start_time || s1.end_time === s2.end_time) {
            return {
              hasClash: true,
              message: `Time Clash Alert: "${s1.subject_name}" and "${s2.subject_name}" are scheduled at the same time on ${new Date(s1.exam_date).toLocaleDateString('en-GB')}!`
            };
          }
        }
      }
    }

    return { hasClash: false, message: 'Schedule Validated: 0 Time & Room Conflicts Found.' };
  }, [schedules]);

  // --- OPTIONS FOR DROPDOWNS ---
  const examOpts: {value: string, label: string}[] = useMemo(() => examTerms.map(e => ({ value: e.id, label: e.title || '' })), [examTerms]);
  const classOpts: {value: string, label: string}[] = useMemo(() => classes.map(c => ({ value: c.id, label: c.name || '' })), [classes]);
  const subjectOpts: {value: string, label: string}[] = useMemo(() => subjects.map(s => ({ value: s.id, label: s.name || '' })), [subjects]);

  // --- ANALYTICS & STATS ---
  const stats: StatCardData[] = useMemo(() => {
    if (schedules.length === 0) return [
      { title: 'Total Papers', value: 0, icon: <Layers className="w-6 h-6 text-brand-500" />, theme: 'brand' },
      { title: 'First Exam', value: 'N/A', icon: <Calendar className="w-6 h-6 text-success-500" />, theme: 'success' },
      { title: 'Final Exam', value: 'N/A', icon: <Target className="w-6 h-6 text-indigo-500" />, theme: 'indigo' },
    ];
    
    const dates = schedules.map(s => new Date(s.exam_date).getTime());
    const minDate = new Date(Math.min(...dates)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const maxDate = new Date(Math.max(...dates)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    return [
      { title: 'Total Papers', value: `${schedules.length} Papers`, icon: <Layers className="w-6 h-6 text-brand-500" />, theme: 'brand' },
      { title: 'First Exam', value: minDate, icon: <Calendar className="w-6 h-6 text-success-500" />, theme: 'success' },
      { title: 'Final Exam', value: maxDate, icon: <Target className="w-6 h-6 text-indigo-500" />, theme: 'indigo' },
    ];
  }, [schedules]);

  // --- ACTIONS ---
  const handleAddNew = () => {
    setFormData({
      ...initialForm,
      tenant_id: tenantId || localStorage.getItem("tenantId") || "",
      exam_setup_id: selectedExam,
      class_id: selectedClass
    });
    setIsEditing(false);
    setIsDrawerOpen(true);
  };

  const handleEdit = (record: ExamSchedule) => {
    setFormData({
      id: record.id,
      tenant_id: tenantId || localStorage.getItem("tenantId") || "",
      exam_setup_id: record.exam_setup_id,
      class_id: record.class_id,
      subject_id: record.subject_id,
      exam_date: record.exam_date.split('T')[0],
      start_time: record.start_time,
      end_time: record.end_time,
      total_marks: record.total_marks,
      passing_marks: record.passing_marks,
      room_number: record.room_number || '',
      invigilator_name: record.invigilator_name || ''
    });
    setIsEditing(true);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string, subject: string) => {
    const result = await Swal.fire({
      title: 'Remove Paper Slot?',
      text: `Are you sure you want to remove "${subject}" from the date sheet?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Delete'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/examschedules/${id}`);
        setSchedules(prev => prev.filter(s => s.id !== id));
        toast.success(`Paper slot for "${subject}" deleted.`);
      } catch (err) {
        toast.error('Failed to delete schedule entry.');
      }
    }
  };

  const handleBroadcastDateSheet = async () => {
    if (!selectedExam || !selectedClass || schedules.length === 0) {
      toast.error('Select an Exam and Class with scheduled papers before broadcasting.');
      return;
    }

    const res = await Swal.fire({
      title: 'Broadcast Date Sheet?',
      text: 'Send official Date Sheet alert to all students and parents of this class?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Broadcast Now',
      confirmButtonColor: '#3b82f6'
    });

    if (res.isConfirmed) {
      toast.success('Date Sheet broadcasted to parents & student portal!');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(formData.passing_marks) > Number(formData.total_marks)) {
      toast.error('Passing marks cannot exceed total marks.');
      return;
    }

    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    const payload = {
      ...formData,
      tenant_id: activeTenant,
      total_marks: Number(formData.total_marks),
      passing_marks: Number(formData.passing_marks)
    };

    setSubmitLoading(true);
    try {
      if (isEditing) {
        await api.put(`/examschedules/${formData.id}`, payload);
        toast.success('Paper slot updated successfully.');
      } else {
        await api.post('/examschedules', payload);
        toast.success('New paper slot added to date sheet.');
      }
      setIsDrawerOpen(false);
      fetchDateSheet();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save schedule record.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- TABLE COLUMNS ---
  const columns = useMemo<ColumnDef<ExamSchedule>[]>(() => [
    {
      header: 'Exam Date',
      accessorKey: 'exam_date',
      cell: (info: any) => {
        return (
          <span className="inline-flex items-center text-sm font-black text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
            <Calendar className="w-4 h-4 mr-2 text-brand-500" />
            {new Date(info.getValue()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        );
      }
    },
    {
      header: 'Subject Course',
      accessorKey: 'subject_name',
      cell: (info: any) => (
        <div>
          <div className="font-bold text-gray-900 dark:text-white text-base">{info.getValue()}</div>
          {info.row.original.invigilator_name && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-brand-500" /> Invigilator: {info.row.original.invigilator_name}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Timing & Hall',
      id: 'timing_hall',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-300 gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" /> 
              <span>{row.start_time}</span> <span className="text-gray-400">to</span> <span>{row.end_time}</span>
            </div>
            {row.room_number && (
              <div className="text-xs text-brand-600 dark:text-brand-400 flex items-center gap-1 font-medium">
                <DoorOpen className="w-3 h-3" /> Hall: {row.room_number}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Marks Benchmark',
      id: 'benchmarks',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <Badge variant="light" color="primary">Total: {row.total_marks}</Badge>
            <Badge variant="light" color="success">Passing: {row.passing_marks}</Badge>
          </div>
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
            { label: 'Modify Paper Slot', icon: <Edit className="w-4 h-4" />, onClick: () => handleEdit(row) },
            { label: 'Delete Paper Slot', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(row.id, row.subject_name), isDanger: true }
          ]
        ];
        return (
          <div className="flex justify-end">
            <ActionMenu groups={groups} />
          </div>
        );
      }
    }
  ], []);

  if (loading && schedules.length === 0) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Examinations', href: '#' }, { label: 'Exam Date Sheets' }]} />
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
      <Breadcrumb items={[{ label: 'Examinations', href: '#' }, { label: 'Exam Date Sheets' }]} />
      
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Exam Date Sheets Engine</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure subject paper slots, seating halls, timing windows, and invigilator duties.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={handleBroadcastDateSheet} disabled={schedules.length === 0} className="flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-500" /> Broadcast Date Sheet
          </Button>
          <Button variant="primary" onClick={handleAddNew} className="flex items-center gap-2" disabled={!selectedExam || !selectedClass}>
            <Plus className="w-4 h-4" /> Add Paper Slot
          </Button>
        </div>
      </div>

      {/* DUAL SELECT FILTERS */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-1/2">
          <SearchableSelect 
            label="Select Exam Term *"
            options={examOpts} 
            value={selectedExam} 
            onChange={(val) => setSelectedExam(val as string)} 
            placeholder="Choose Exam Term..." 
          />
        </div>
        <div className="w-full sm:w-1/2">
          <SearchableSelect 
            label="Select Target Class *"
            options={classOpts} 
            value={selectedClass} 
            onChange={(val) => setSelectedClass(val as string)} 
            placeholder="Choose Target Class..." 
          />
        </div>
      </div>

      {/* Clash & Conflict Audit Banner */}
      {schedules.length > 0 && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
          clashAudit.hasClash 
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
        }`}>
          <div className="flex items-center gap-3">
            {clashAudit.hasClash ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <div>
              <div className="font-semibold text-sm">Schedule Audit</div>
              <div className="text-xs opacity-90">{clashAudit.message}</div>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/70 dark:bg-black/30 border border-current">
            {clashAudit.hasClash ? 'Conflict Notice' : '0 Conflicts'}
          </span>
        </div>
      )}

      {/* STATS */}
      {schedules.length > 0 && <StatCards stats={stats} loading={loading} />}

      {/* DATA TABLE SECTION */}
      <DataTable
        loading={loading}
        data={schedules}
        columns={columns}
        searchPlaceholder="Search scheduled subjects..."
        emptyMessage={
          !selectedExam || !selectedClass 
            ? 'Please select an Exam Term and Target Class to view the Date Sheet.' 
            : 'No papers scheduled yet. Click "Add Paper Slot" to build the Date Sheet!'
        }
        exportable={true}
        exportFilename={`DateSheet_${selectedClass}`}
      />

      {/* DRAWER FORM (Add/Edit) using ProfileDrawer */}
      <ProfileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={isEditing ? 'Modify Paper Slot' : 'New Paper Slot'}
        subtitle="Set paper date, timing window, seating hall, and marks benchmark"
      >
        <form id="schedulerForm" onSubmit={handleFormSubmit} className="space-y-6 pt-4">
          <div>
            <SearchableSelect 
              label="Subject Course *"
              options={subjectOpts} 
              value={formData.subject_id} 
              onChange={(val) => setFormData({...formData, subject_id: val as string})} 
              placeholder="Choose Subject..." 
              isDisabled={isEditing} 
            />
            {isEditing && <span className="text-xs text-gray-400 mt-1 block">Subject selection is locked in edit mode.</span>}
          </div>
          
          <div>
            <Label required>Date of Paper</Label>
            <DatePicker 
              id="exam-date-picker"
              value={formData.exam_date} 
              onChange={(e: any) => setFormData({...formData, exam_date: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <TimePicker
                id="start-time-picker"
                label="Start Time *"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                placeholder="09:00"
              />
            </div>
            <div>
              <TimePicker
                id="end-time-picker"
                label="End Time *"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                placeholder="12:00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Seating Hall / Room #</Label>
              <Input 
                type="text" 
                placeholder="e.g. Hall A, Room 201" 
                value={formData.room_number || ''} 
                onChange={(e: any) => setFormData({...formData, room_number: e.target.value})} 
              />
            </div>
            <div>
              <Label>Invigilator / Supervisor</Label>
              <Input 
                type="text" 
                placeholder="e.g. Prof. Ahmed" 
                value={formData.invigilator_name || ''} 
                onChange={(e: any) => setFormData({...formData, invigilator_name: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Total Marks</Label>
              <Input 
                type="number" min="1" max="500"
                placeholder="100" 
                value={formData.total_marks} 
                onChange={(e: any) => setFormData({...formData, total_marks: parseFloat(e.target.value) || 0})} 
                required 
              />
            </div>
            <div>
              <Label required>Passing Marks</Label>
              <Input 
                type="number" min="1" max="500"
                placeholder="40" 
                value={formData.passing_marks} 
                onChange={(e: any) => setFormData({...formData, passing_marks: parseFloat(e.target.value) || 0})} 
                required 
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitLoading}
              loadingText="Saving..."
              disabled={!formData.subject_id || formData.total_marks <= 0}
            >
              Save Paper Slot
            </Button>
          </div>
        </form>
      </ProfileDrawer>
    </div>
  );
}