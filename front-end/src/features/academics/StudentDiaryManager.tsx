import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { ColumnDef } from '@tanstack/react-table';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import Input from '../../components/form/input/InputField';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import DatePicker from '../../components/form/date-picker';
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { toast } from '../../components/ui/Toast';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { BookOpen, Calendar, Edit3, Plus, User, Users, CheckSquare } from 'lucide-react';
import { DataTable } from '../../components/ui/table/DataTable';

interface StudentDiary {
  id?: string;
  tenant_id: string;
  student_id: string;
  class_id: string;
  section_id: string;
  date: string;
  remarks: string;
  homework_summary?: string;
  conduct?: string;
  created_by?: string;
  student_name?: string;
  admission_number?: string;
  class_name?: string;
  section_name?: string;
  created_at?: string;
}

interface Student { id: string; first_name: string; last_name: string; admission_number: string; }
interface SchoolClass { id: string; name: string; }
interface Section { id: string; name: string; class_id: string; }

const CONDUCT_OPTIONS = [
  { value: 'Excellent', label: '⭐ Excellent' },
  { value: 'Good', label: '👍 Good' },
  { value: 'Satisfactory', label: '🆗 Satisfactory' },
  { value: 'Needs Improvement', label: '⚠️ Needs Improvement' },
];

export default function StudentDiaryManager() {
  const tenantId = localStorage.getItem('tenantId') || '';
  const [diaries, setDiaries] = useState<StudentDiary[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  // Mode: Single vs Bulk
  const [drawerMode, setDrawerMode] = useState<'single' | 'bulk'>('single');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<StudentDiary>({
    tenant_id: tenantId,
    student_id: '',
    class_id: '',
    section_id: '',
    date: new Date().toISOString().split('T')[0],
    remarks: '',
    homework_summary: '',
    conduct: 'Good',
    created_by: 'Class Teacher',
  });

  const [bulkClassId, setBulkClassId] = useState('');
  const [bulkSectionId, setBulkSectionId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!tenantId) return;
    fetchData();
  }, [tenantId]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openSingleDrawer();
    } else if (searchParams.get('mode') === 'bulk') {
      openBulkDrawer();
    }
  }, [searchParams]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [diariesRes, studentsRes, classesRes, sectionsRes] = await Promise.all([
        api.get(`/studentdiaries/tenant/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`/students/tenant/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`/classes/tenant/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`/sections/tenant/${tenantId}`).catch(() => ({ data: [] })),
      ]);
      setDiaries(Array.isArray(diariesRes.data) ? diariesRes.data : []);
      const stList = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      setStudents(stList.filter((s: any) => s.is_active));
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      setSections(Array.isArray(sectionsRes.data) ? sectionsRes.data : []);
    } catch (err) {
      console.error('Failed to load diary entries', err);
    } finally {
      setLoading(false);
    }
  };

  const openSingleDrawer = () => {
    setDrawerMode('single');
    setFormData({
      tenant_id: tenantId,
      student_id: students[0]?.id || '',
      class_id: classes[0]?.id || '',
      section_id: sections[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      remarks: '',
      homework_summary: '',
      conduct: 'Good',
      created_by: 'Class Teacher',
    });
    setDrawerOpen(true);
  };

  const openBulkDrawer = () => {
    setDrawerMode('bulk');
    setBulkClassId(classes[0]?.id || '');
    setBulkSectionId(sections[0]?.id || '');
    setSelectedStudentIds(students.map(s => s.id));
    setFormData({
      tenant_id: tenantId,
      student_id: '',
      class_id: classes[0]?.id || '',
      section_id: sections[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      remarks: '',
      homework_summary: '',
      conduct: 'Good',
      created_by: 'Class Teacher',
    });
    setDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (drawerMode === 'bulk') {
        await api.post('/studentdiaries/bulk', {
          tenant_id: tenantId,
          class_id: bulkClassId,
          section_id: bulkSectionId,
          date: formData.date,
          remarks: formData.remarks,
          homework_summary: formData.homework_summary,
          created_by: 'Class Teacher',
          student_ids: selectedStudentIds,
        });
        toast.success(`Diary published to ${selectedStudentIds.length} students!`);
      } else {
        await api.post('/studentdiaries', formData);
        toast.success('Diary note saved successfully.');
      }
      setDrawerOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save diary entry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (entry: StudentDiary) => {
    const res = await Swal.fire({
      title: 'Delete Diary Entry?',
      text: 'Remove this note from student diary?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
    });
    if (!res.isConfirmed) return;
    try {
      await api.delete(`/studentdiaries/${entry.id}`);
      toast.success('Diary entry deleted.');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete entry.');
    }
  };

  const totalDiaries = diaries.length;
  const todayDiaries = diaries.filter(d => new Date(d.date).toDateString() === new Date().toDateString()).length;
  const excellentConduct = diaries.filter(d => d.conduct === 'Excellent').length;

  const stats: StatCardData[] = [
    { title: 'Total Published Notes', value: totalDiaries, icon: <BookOpen className="w-5 h-5 text-indigo-500" />, theme: 'indigo' },
    { title: "Today's Class Diaries", value: todayDiaries, icon: <Calendar className="w-5 h-5 text-emerald-500" />, theme: 'success' },
    { title: 'Excellent Remarks', value: excellentConduct, icon: <Edit3 className="w-5 h-5 text-amber-500" />, theme: 'warning' },
    { title: 'Active Students', value: students.length, icon: <Users className="w-5 h-5 text-blue-500" />, theme: 'brand' },
  ];

  const columns = useMemo<ColumnDef<StudentDiary>[]>(() => [
    {
      accessorKey: 'student_name',
      header: 'Student Name',
      cell: info => {
        const d = info.row.original;
        return (
          <div>
            <span className="font-semibold text-gray-900 dark:text-white">{info.getValue() as string || 'Student'}</span>
            <span className="text-xs text-gray-400 block font-mono">GR: {d.admission_number}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'class_name',
      header: 'Class / Section',
      cell: info => (
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {info.getValue() as string} {info.row.original.section_name ? `- ${info.row.original.section_name}` : ''}
        </span>
      ),
    },
    {
      accessorKey: 'remarks',
      header: 'Daily Remarks & Note',
      cell: info => (
        <div>
          <p className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate max-w-sm">{info.getValue() as string}</p>
          {info.row.original.homework_summary && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 truncate max-w-sm">HW: {info.row.original.homework_summary}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'conduct',
      header: 'Conduct',
      cell: info => {
        const conduct = info.getValue() as string;
        const color = conduct === 'Excellent' ? 'success' : conduct === 'Good' ? 'info' : 'warning';
        return <Badge variant="light" color={color} size="sm">{conduct || 'Good'}</Badge>;
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: info => <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{new Date(info.getValue() as string).toLocaleDateString()}</span>,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: info => (
        <div className="flex justify-end">
          <ActionMenu
            groups={[
              [
                { label: 'Delete Diary Entry', icon: <Edit3 className="w-4 h-4" />, onClick: () => handleDelete(info.row.original), isDanger: true }
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Student Diary & Teacher Notes</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Publish daily teacher remarks, conduct notes, and homework summaries to parents.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openBulkDrawer}>
            <Users className="w-4 h-4 mr-2" /> Bulk Class Diary
          </Button>
          <Button variant="primary" onClick={openSingleDrawer}>
            <Plus className="w-4 h-4 mr-2" /> Single Note
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <StatCards stats={stats} loading={loading} />

      {/* Table */}
      <DataTable
        loading={loading}
        data={diaries}
        columns={columns}
        searchPlaceholder="Search diary entries by student, remarks, or class..."
        emptyMessage="No diary entries published."
        exportable={true}
        exportFilename="student_diaries_log"
      />

      {/* Drawer */}
      <ProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerMode === 'bulk' ? 'Bulk Class Diary Entry' : 'New Student Diary Note'}
        subtitle={drawerMode === 'bulk' ? 'Publish note to all students in a section' : 'Direct note for an individual student'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label>Date *</Label>
            <DatePicker
              id="diary-date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          {drawerMode === 'single' ? (
            <div>
              <SearchableSelect
                label="Select Student *"
                options={students.map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name} (${s.admission_number})` }))}
                value={formData.student_id}
                onChange={val => {
                  const selectedSt = students.find(s => s.id === val);
                  setFormData({ ...formData, student_id: val as string });
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <SearchableSelect
                  label="Target Class *"
                  options={classes.map(c => ({ value: c.id, label: c.name }))}
                  value={bulkClassId}
                  onChange={val => setBulkClassId(val as string)}
                />
              </div>
              <div>
                <SearchableSelect
                  label="Section *"
                  options={sections.map(sec => ({ value: sec.id, label: sec.name }))}
                  value={bulkSectionId}
                  onChange={val => setBulkSectionId(val as string)}
                />
              </div>
            </div>
          )}

          <div>
            <Label>Daily Teacher Remarks & Conduct Note *</Label>
            <textarea
              rows={4}
              required
              placeholder="e.g. Participated actively in Science experiment today. Good discipline."
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 resize-none"
            />
          </div>

          <div>
            <Label>Homework Summary (Optional)</Label>
            <Input
              type="text"
              placeholder="e.g. Math Ex 4.2 Q1-5 due tomorrow"
              value={formData.homework_summary || ''}
              onChange={e => setFormData({ ...formData, homework_summary: e.target.value })}
            />
          </div>

          <div>
            <SearchableSelect
              label="Student Conduct Grade"
              options={CONDUCT_OPTIONS}
              value={formData.conduct || 'Good'}
              onChange={val => setFormData({ ...formData, conduct: val as string })}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              loadingText="Publishing..."
              className="flex-1"
            >
              Publish Diary Note
            </Button>
          </div>
        </form>
      </ProfileDrawer>
    </div>
  );
}
