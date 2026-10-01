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
import { BookOpen, CheckCircle, Clock, Percent, Plus, Target, User } from 'lucide-react';
import { DataTable } from '../../components/ui/table/DataTable';

interface LessonPlan {
  id?: string;
  tenant_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  title: string;
  description?: string;
  target_date?: string;
  completion_percentage: number;
  status: string;
  class_name?: string;
  subject_name?: string;
  teacher_name?: string;
  created_at?: string;
}

interface SchoolClass { id: string; name: string; }
interface Subject { id: string; name: string; }
interface Staff { id: string; first_name: string; last_name: string; }

export default function LessonPlanning() {
  const tenantId = localStorage.getItem('tenantId') || '';
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer & Form states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LessonPlan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<LessonPlan>({
    tenant_id: tenantId,
    class_id: '',
    subject_id: '',
    teacher_id: '',
    title: '',
    description: '',
    target_date: new Date().toISOString().split('T')[0],
    completion_percentage: 0,
    status: 'Pending',
  });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!tenantId) return;
    fetchData();
  }, [tenantId]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openAddDrawer();
    }
  }, [searchParams]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, classesRes, subjectsRes, staffRes] = await Promise.all([
        api.get(`/lessonplans/tenant/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`/classes/tenant/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`/subjects/tenant/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`/staff/tenant/${tenantId}`).catch(() => ({ data: [] })),
      ]);
      setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
      setTeachers(Array.isArray(staffRes.data) ? staffRes.data : []);
    } catch (err) {
      console.error('Failed to load lesson plans', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddDrawer = () => {
    setEditingPlan(null);
    setFormData({
      tenant_id: tenantId,
      class_id: classes[0]?.id || '',
      subject_id: subjects[0]?.id || '',
      teacher_id: teachers[0]?.id || '',
      title: '',
      description: '',
      target_date: new Date().toISOString().split('T')[0],
      completion_percentage: 0,
      status: 'Pending',
    });
    setDrawerOpen(true);
  };

  const openEditDrawer = (plan: LessonPlan) => {
    setEditingPlan(plan);
    setFormData({
      ...plan,
      target_date: plan.target_date ? new Date(plan.target_date).toISOString().split('T')[0] : '',
    });
    setDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingPlan && editingPlan.id) {
        await api.put(`/lessonplans/${editingPlan.id}`, formData);
        toast.success('Lesson plan updated successfully.');
      } else {
        await api.post('/lessonplans', formData);
        toast.success('Lesson plan created successfully.');
      }
      setDrawerOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save lesson plan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (plan: LessonPlan) => {
    const res = await Swal.fire({
      title: 'Delete Lesson Plan?',
      text: `Are you sure you want to remove "${plan.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
    });
    if (!res.isConfirmed) return;
    try {
      await api.delete(`/lessonplans/${plan.id}`);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Deleted', timer: 1500, showConfirmButton: false });
      fetchData();
    } catch (err) {
      Swal.fire('Error', 'Failed to delete.', 'error');
    }
  };

  // Stats calculation
  const totalPlans = plans.length;
  const completedPlans = plans.filter(p => p.completion_percentage >= 100).length;
  const inProgressPlans = plans.filter(p => p.completion_percentage > 0 && p.completion_percentage < 100).length;
  const avgCompletion = totalPlans > 0 ? Math.round(plans.reduce((acc, p) => acc + p.completion_percentage, 0) / totalPlans) : 0;

  const stats: StatCardData[] = [
    { title: 'Total Topics / Plans', value: totalPlans, icon: <BookOpen className="w-5 h-5 text-indigo-500" />, theme: 'indigo' },
    { title: 'Completed Syllabus', value: completedPlans, icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, theme: 'success' },
    { title: 'In Progress', value: inProgressPlans, icon: <Clock className="w-5 h-5 text-amber-500" />, theme: 'warning' },
    { title: 'Avg Completion Rate', value: `${avgCompletion}%`, icon: <Percent className="w-5 h-5 text-blue-500" />, theme: 'brand' },
  ];

  const columns = useMemo<ColumnDef<LessonPlan>[]>(() => [
    {
      accessorKey: 'title',
      header: 'Topic / Unit Title',
      cell: info => (
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">{info.getValue() as string}</span>
          {info.row.original.description && (
            <p className="text-xs text-gray-400 truncate max-w-xs">{info.row.original.description}</p>
          )}
        </div>
      ),
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
      header: 'Assigned Teacher',
      cell: info => (
        <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-gray-400" />
          {info.getValue() as string || 'Unassigned'}
        </span>
      ),
    },
    {
      accessorKey: 'completion_percentage',
      header: 'Syllabus Progress',
      cell: info => {
        const pct = info.getValue() as number;
        return (
          <div className="w-36">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className={pct >= 100 ? 'text-emerald-600' : pct > 40 ? 'text-blue-600' : 'text-amber-600'}>{pct}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  pct >= 100 ? 'bg-emerald-500' : pct > 40 ? 'bg-blue-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
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
            color={status === 'Completed' ? 'success' : status === 'In Progress' ? 'info' : 'warning'}
            size="sm"
          >
            {status}
          </Badge>
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
                { label: 'Edit Plan', icon: <BookOpen className="w-4 h-4" />, onClick: () => openEditDrawer(info.row.original) }
              ],
              [
                { label: 'Delete Plan', icon: <Target className="w-4 h-4" />, onClick: () => handleDelete(info.row.original), isDanger: true }
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lesson Planning & Syllabus Tracking</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track course completion, lesson timelines, and syllabus progress.</p>
        </div>
        <Button variant="primary" onClick={openAddDrawer}>
          <Plus className="w-4 h-4 mr-2" /> Add Lesson Plan
        </Button>
      </div>

      {/* Stat Cards */}
      <StatCards stats={stats} loading={loading} />

      {/* Table */}
      <DataTable
        loading={loading}
        data={plans}
        columns={columns}
        searchPlaceholder="Search lesson plans, topics, or teachers..."
        emptyMessage="No lesson plans created yet."
        exportable={true}
        exportFilename="lesson_planning_report"
      />

      {/* Form Drawer (Agent 1 ProfileDrawer pattern) */}
      <ProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingPlan ? 'Edit Lesson Plan' : 'Create Lesson Plan'}
        subtitle="Manage syllabus target dates and progress"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label>Topic / Unit Title *</Label>
            <Input
              type="text"
              required
              placeholder="e.g. Chapter 4: Quadratic Equations"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <SearchableSelect
                label="Class *"
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
              label="Assigned Teacher *"
              options={teachers.map(t => ({ value: t.id, label: `${t.first_name} ${t.last_name}` }))}
              value={formData.teacher_id}
              onChange={val => setFormData({ ...formData, teacher_id: val as string })}
            />
          </div>

          <div>
            <Label>Target Completion Date</Label>
            <DatePicker
              id="plan-target-date"
              value={formData.target_date || ''}
              onChange={e => setFormData({ ...formData, target_date: e.target.value })}
            />
          </div>

          <div>
            <Label>Completion Percentage ({formData.completion_percentage}%)</Label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.completion_percentage}
              onChange={e => setFormData({ ...formData, completion_percentage: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-gray-700"
            />
          </div>

          <div>
            <Label>Description / Key Learning Objectives</Label>
            <textarea
              rows={4}
              placeholder="Summary of topics covered, practical exercises, homework tasks..."
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 resize-none"
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
              loadingText="Saving..."
              className="flex-1"
            >
              {editingPlan ? 'Save Changes' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </ProfileDrawer>
    </div>
  );
}
