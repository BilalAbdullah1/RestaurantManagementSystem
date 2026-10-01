import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import Input from '../../components/form/input/InputField';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import DatePicker from '../../components/form/date-picker';
import TimePicker from '../../components/form/TimePicker';
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { toast } from '../../components/ui/Toast';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { Video, ExternalLink, Plus, Calendar, Clock, User, CheckCircle2 } from 'lucide-react';
import { DataTable } from '../../components/ui/table/DataTable';

interface LiveClass {
  id?: string;
  tenant_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  topic: string;
  platform: string;
  meeting_link: string;
  start_time: string;
  duration_minutes: number;
  status: string;
  class_name?: string;
  subject_name?: string;
  teacher_name?: string;
  created_at?: string;
}

interface SchoolClass { id: string; name: string; }
interface Subject { id: string; name: string; }
interface Staff { id: string; first_name: string; last_name: string; }

const PLATFORM_OPTIONS = [
  { value: 'Zoom', label: '💻 Zoom Meeting' },
  { value: 'Google Meet', label: '🟢 Google Meet' },
  { value: 'Microsoft Teams', label: '🟣 Microsoft Teams' },
];

export default function LiveClassesManager() {
  const tenantId = localStorage.getItem('tenantId') || '';
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<LiveClass>({
    tenant_id: tenantId,
    class_id: '',
    subject_id: '',
    teacher_id: '',
    topic: '',
    platform: 'Zoom',
    meeting_link: '',
    start_time: new Date().toISOString().slice(0, 16),
    duration_minutes: 40,
    status: 'Scheduled',
  });

  useEffect(() => {
    if (!tenantId) return;
    fetchData();
  }, [tenantId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classesRes, classesListRes, subjectsRes, staffRes] = await Promise.all([
        api.get(`/liveclasses/tenant/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`/classes/tenant/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`/subjects/tenant/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`/staff/tenant/${tenantId}`).catch(() => ({ data: [] })),
      ]);
      setLiveClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      setClasses(Array.isArray(classesListRes.data) ? classesListRes.data : []);
      setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
      setTeachers(Array.isArray(staffRes.data) ? staffRes.data : []);
    } catch (err) {
      console.error('Failed to load live classes', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddDrawer = () => {
    setFormData({
      tenant_id: tenantId,
      class_id: classes[0]?.id || '',
      subject_id: subjects[0]?.id || '',
      teacher_id: teachers[0]?.id || '',
      topic: '',
      platform: 'Zoom',
      meeting_link: '',
      start_time: new Date().toISOString().slice(0, 16),
      duration_minutes: 40,
      status: 'Scheduled',
    });
    setDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/liveclasses', formData);
      toast.success('Live online class scheduled successfully.');
      setDrawerOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to schedule live class.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (lc: LiveClass) => {
    const res = await Swal.fire({
      title: 'Cancel Session?',
      text: `Cancel live class "${lc.topic}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
    });
    if (!res.isConfirmed) return;
    try {
      await api.delete(`/liveclasses/${lc.id}`);
      toast.success('Live class session cancelled.');
      fetchData();
    } catch (err) {
      toast.error('Failed to cancel session.');
    }
  };

  const totalClasses = liveClasses.length;
  const liveNow = liveClasses.filter(c => c.status === 'Live').length;
  const scheduled = liveClasses.filter(c => c.status === 'Scheduled').length;
  const ended = liveClasses.filter(c => c.status === 'Ended').length;

  const stats: StatCardData[] = [
    { title: 'Total Live Sessions', value: totalClasses, icon: <Video className="w-5 h-5 text-indigo-500" />, theme: 'indigo' },
    { title: 'Live Now 🔴', value: liveNow, icon: <Video className="w-5 h-5 text-rose-500 animate-pulse" />, theme: 'error' },
    { title: 'Upcoming Scheduled', value: scheduled, icon: <Calendar className="w-5 h-5 text-blue-500" />, theme: 'brand' },
    { title: 'Completed Sessions', value: ended, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, theme: 'success' },
  ];

  const columns = useMemo<ColumnDef<LiveClass>[]>(() => [
    {
      accessorKey: 'topic',
      header: 'Topic & Platform',
      cell: info => {
        const lc = info.row.original;
        return (
          <div>
            <span className="font-semibold text-gray-900 dark:text-white">{lc.topic}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{lc.platform}</span>
              <span className="text-xs text-gray-400">• {lc.duration_minutes} Mins</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'class_name',
      header: 'Class & Subject',
      cell: info => (
        <div className="text-sm">
          <span className="font-semibold text-gray-800 dark:text-gray-200">{info.getValue() as string}</span>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 block">{info.row.original.subject_name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'teacher_name',
      header: 'Host / Teacher',
      cell: info => (
        <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-gray-400" />
          {info.getValue() as string || 'Staff'}
        </span>
      ),
    },
    {
      accessorKey: 'start_time',
      header: 'Date & Time',
      cell: info => {
        const d = new Date(info.getValue() as string);
        return (
          <div className="text-xs font-mono text-gray-700 dark:text-gray-300">
            <div>{d.toLocaleDateString()}</div>
            <div className="text-gray-400">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => {
        const status = info.getValue() as string;
        return (
          <Badge
            variant="light"
            color={status === 'Live' ? 'error' : status === 'Scheduled' ? 'info' : 'success'}
            size="sm"
          >
            {status === 'Live' ? '🔴 Live Now' : status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'meeting_link',
      header: 'Join Class',
      cell: info => {
        const link = info.getValue() as string;
        return (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-200"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Launch Class
          </a>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: info => (
        <div className="flex justify-end">
          <ActionMenu
            groups={[
              [
                { label: 'Cancel Session', icon: <Video className="w-4 h-4" />, onClick: () => handleDelete(info.row.original), isDanger: true }
              ]
            ]}
          />
        </div>
      ),
    },
  ], []);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Live Online Classes (Zoom / Meet)</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Schedule and manage virtual classrooms with 1-click meeting links.</p>
        </div>
        <Button variant="primary" onClick={openAddDrawer}>
          <Plus className="w-4 h-4 mr-2" /> Schedule Live Class
        </Button>
      </div>

      {/* Stat Cards */}
      <StatCards stats={stats} loading={loading} />

      {/* Table */}
      <DataTable
        loading={loading}
        data={liveClasses}
        columns={columns}
        searchPlaceholder="Search live sessions by topic, class, or host..."
        emptyMessage="No live classes scheduled."
        exportable={true}
        exportFilename="live_classes_schedule"
      />

      {/* Drawer */}
      <ProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Schedule Virtual Class"
        subtitle="Embed Zoom or Google Meet links for interactive learning"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label>Class Topic / Agenda *</Label>
            <Input
              type="text"
              required
              placeholder="e.g. Organic Chemistry Live Quiz & Q/A"
              value={formData.topic}
              onChange={e => setFormData({ ...formData, topic: e.target.value })}
            />
          </div>

          <div>
            <SearchableSelect
              label="Meeting Platform *"
              options={PLATFORM_OPTIONS}
              value={formData.platform}
              onChange={val => setFormData({ ...formData, platform: val as string })}
            />
          </div>

          <div>
            <Label>Meeting Link (URL) *</Label>
            <Input
              type="url"
              required
              placeholder="https://zoom.us/j/... or https://meet.google.com/..."
              value={formData.meeting_link}
              onChange={e => setFormData({ ...formData, meeting_link: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <SearchableSelect
                label="Target Class *"
                options={classes.map(c => ({ value: c.id, label: c.name }))}
                value={formData.class_id}
                onChange={val => setFormData({ ...formData, class_id: val as string })}
              />
            </div>
            <div>
              <SearchableSelect
                label="Subject *"
                options={subjects.map(s => ({ value: s.id, label: s.name }))}
                value={formData.subject_id}
                onChange={val => setFormData({ ...formData, subject_id: val as string })}
              />
            </div>
          </div>

          <div>
            <SearchableSelect
              label="Host Teacher *"
              options={teachers.map(t => ({ value: t.id, label: `${t.first_name} ${t.last_name}` }))}
              value={formData.teacher_id}
              onChange={val => setFormData({ ...formData, teacher_id: val as string })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Date & Time *</Label>
              <Input
                type="datetime-local"
                required
                value={formData.start_time}
                onChange={e => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>
            <div>
              <Label>Duration (Minutes)</Label>
              <Input
                type="number"
                min="10"
                max="240"
                value={formData.duration_minutes}
                onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 40 })}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              loadingText="Scheduling..."
              className="flex-1"
            >
              Schedule Class
            </Button>
          </div>
        </form>
      </ProfileDrawer>
    </div>
  );
}
