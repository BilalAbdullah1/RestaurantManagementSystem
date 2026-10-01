import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Input from '../../components/form/input/InputField';
import DatePicker from '../../components/form/date-picker';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import MultiSelect from '../../components/form/MultiSelect';
import Label from '../../components/form/Label';
import RichTextEditor from '../../components/form/RichTextEditor';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../components/ui/table/DataTable';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Skeleton } from '../../components/ui/Skeleton';
import { toast } from '../../components/ui/Toast';

// --- ICONS ---
import { Calendar, Activity, CheckCircle, Edit, Trash2, Eye, AlignLeft, Plus, Lock, Unlock, Send, Scale, Clock, Layers } from 'lucide-react';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';

// --- TYPES ---
interface ExamSetup {
  id: string;
  tenant_id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  is_locked?: boolean;
  description?: string;
  weightage_percentage?: number;
  marks_entry_deadline?: string;
  target_class_ids?: string;
  academic_session?: string;
  is_published?: boolean;
  created_at?: string;
}

interface ClassLookup {
  id: string;
  name?: string;
  class_name?: string;
}

export default function ExamSetups() {
  const tenantId = localStorage.getItem("tenantId") || "";

  // --- STATES ---
  const [exams, setExams] = useState<ExamSetup[]>([]);
  const [classList, setClassList] = useState<ClassLookup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'Upcoming' | 'Ongoing' | 'Completed'>('all');
  const [submitLoading, setSubmitLoading] = useState(false);

  const [view, setView] = useState<'list' | 'form'>('list');
  const [isEditing, setIsEditing] = useState(false);
  const [drawerExam, setDrawerExam] = useState<ExamSetup | null>(null);

  // Form State
  const initialForm: Partial<ExamSetup> = {
    tenant_id: tenantId,
    title: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    status: 'Upcoming',
    description: '',
    weightage_percentage: 100,
    marks_entry_deadline: '',
    target_class_ids: '',
    academic_session: '2025-2026',
    is_published: false
  };
  const [formData, setFormData] = useState<any>(initialForm);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  // --- FETCH DATA ---
  const fetchExamsAndClasses = async () => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (!activeTenant) return;
    setLoading(true);
    try {
      const [examsRes, classesRes] = await Promise.all([
        api.get<ExamSetup[]>(`/examsetups/tenant/${activeTenant}`),
        api.get<ClassLookup[]>(`/classes/tenant/${activeTenant}`).catch(() => ({ data: [] }))
      ]);
      setExams(examsRes.data);
      setClassList(classesRes.data);
    } catch (err) {
      toast.error('Could not load exam setups from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamsAndClasses();
  }, [tenantId]);

  // --- DERIVED DATA & STATS ---
  const filteredExams = useMemo(() => {
    if (activeTab === 'all') return exams;
    return exams.filter(e => e.status === activeTab);
  }, [exams, activeTab]);

  const upcomingCount = exams.filter(e => e.status === 'Upcoming').length;
  const ongoingCount = exams.filter(e => e.status === 'Ongoing').length;
  const completedCount = exams.filter(e => e.status === 'Completed').length;

  const statCardsData: StatCardData[] = [
    { title: 'Upcoming Exams', value: upcomingCount, icon: <Calendar className="w-6 h-6 text-brand-500" />, theme: 'brand' },
    { title: 'Ongoing Exams', value: ongoingCount, icon: <Activity className="w-6 h-6 text-warning-500" />, theme: 'warning' },
    { title: 'Completed Exams', value: completedCount, icon: <CheckCircle className="w-6 h-6 text-success-500" />, theme: 'success' },
  ];

  const classOptions = useMemo(() => {
    return classList.map(c => ({ value: c.id, text: c.name || c.class_name || 'Class' }));
  }, [classList]);

  // --- ACTIONS ---
  const handleAddNew = () => {
    setFormData({
      ...initialForm,
      tenant_id: tenantId || localStorage.getItem("tenantId") || ""
    });
    setSelectedClasses([]);
    setIsEditing(false);
    setView('form');
  };

  const handleEdit = (record: ExamSetup) => {
    const classIdsArr = record.target_class_ids ? record.target_class_ids.split(',').filter(Boolean) : [];
    setSelectedClasses(classIdsArr);
    setFormData({
      ...record,
      start_date: record.start_date.split('T')[0],
      end_date: record.end_date.split('T')[0],
      marks_entry_deadline: record.marks_entry_deadline ? record.marks_entry_deadline.split('T')[0] : ''
    });
    setIsEditing(true);
    setView('form');
  };

  const cancelForm = () => {
    setFormData(initialForm);
    setSelectedClasses([]);
    setIsEditing(false);
    setView('list');
  };

  const handleDelete = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: 'Delete Exam?',
      text: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/examsetups/${id}`);
        toast.success(`Exam term "${title}" deleted.`);
        fetchExamsAndClasses();
      } catch (err) {
        toast.error('Failed to delete exam.');
      }
    }
  };

  const handleToggleLock = async (id: string, currentLock: boolean, title: string) => {
    const action = currentLock ? 'Unlock' : 'Lock';
    const res = await Swal.fire({
      title: `${action} Marks Entry?`,
      text: `Are you sure you want to ${action.toLowerCase()} marks entry for "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      confirmButtonColor: currentLock ? '#10b981' : '#f59e0b'
    });

    if (res.isConfirmed) {
      try {
        const response = await api.post(`/examsetups/${id}/toggle-lock`);
        setExams(prev => prev.map(e => e.id === id ? { ...e, is_locked: response.data.is_locked } : e));
        toast.success(response.data.message || `Marks entry ${action.toLowerCase()}ed.`);
      } catch (err) {
        toast.error('Failed to toggle lock status.');
      }
    }
  };

  const handlePublishNotify = async (id: string, title: string) => {
    const res = await Swal.fire({
      title: 'Publish & Notify Parents?',
      text: `Broadcast exam schedule for "${title}" to all parents via Portal & Push notifications?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Broadcast Now',
      confirmButtonColor: '#3b82f6'
    });

    if (res.isConfirmed) {
      try {
        const response = await api.post(`/examsetups/${id}/publish-notify`);
        setExams(prev => prev.map(e => e.id === id ? { ...e, is_published: true } : e));
        toast.success(response.data.message || 'Exam term published and broadcasted!');
      } catch (err) {
        toast.error('Failed to broadcast notification.');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast.error('Start Date cannot be after End Date.');
      return;
    }

    const currentTenant = tenantId || localStorage.getItem("tenantId") || "";
    const payload = {
      ...formData,
      tenant_id: currentTenant,
      weightage_percentage: formData.weightage_percentage ? Number(formData.weightage_percentage) : null,
      target_class_ids: selectedClasses.join(','),
      marks_entry_deadline: formData.marks_entry_deadline ? new Date(formData.marks_entry_deadline).toISOString() : null
    };

    setSubmitLoading(true);
    try {
      if (isEditing) {
        await api.put(`/examsetups/${formData.id}`, payload);
        toast.success('Exam details updated successfully!');
      } else {
        await api.post('/examsetups', payload);
        toast.success('New exam setup created successfully!');
      }
      setView('list');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save exam setup.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'primary';
      case 'Ongoing': return 'warning';
      case 'Completed': return 'success';
      default: return 'light';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getClassNamesFromIds = (idsStr?: string) => {
    if (!idsStr) return 'All Classes';
    const ids = idsStr.split(',').filter(Boolean);
    if (ids.length === 0) return 'All Classes';
    const names = classList.filter(c => ids.includes(c.id)).map(c => c.name || c.class_name || 'Class');
    return names.length > 0 ? names.join(', ') : `${ids.length} Classes`;
  };

  // --- TANSTACK TABLE CONFIGURATION ---
  const columns = useMemo<ColumnDef<ExamSetup>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Exam Title',
        cell: info => (
          <div>
            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {info.getValue() as string}
              {info.row.original.is_published && (
                <Badge variant="solid" color="primary" size="sm" className="text-[10px] px-1.5 py-0.5">
                  Published
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
              <Layers className="w-3 h-3 text-brand-500" /> {info.row.original.academic_session || '2025-2026'}
            </div>
          </div>
        ),
      },
      {
        header: 'Weightage',
        accessorKey: 'weightage_percentage',
        cell: info => {
          const w = info.getValue() as number | undefined;
          return (
            <span className="font-semibold text-gray-800 dark:text-gray-200 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-md text-xs border border-blue-200 dark:border-blue-800">
              {w !== undefined && w !== null ? `${w}% Weight` : '100%'}
            </span>
          );
        }
      },
      {
        header: 'Scope',
        id: 'target_classes',
        cell: info => (
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {getClassNamesFromIds(info.row.original.target_class_ids)}
          </span>
        )
      },
      {
        accessorKey: 'start_date',
        header: 'Schedule',
        cell: info => (
          <div className="text-xs space-y-0.5">
            <div className="text-gray-700 dark:text-gray-300">Start: {formatDate(info.getValue() as string)}</div>
            <div className="text-gray-500 dark:text-gray-400">End: {formatDate(info.row.original.end_date)}</div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: info => {
          const st = info.getValue() as string;
          return (
            <Badge variant="light" color={getStatusBadgeColor(st) as any} size="sm">
              {st}
            </Badge>
          );
        },
      },
      {
        id: 'marks_lock',
        header: 'Marks Lock',
        cell: info => {
          const locked = !!info.row.original.is_locked;
          const deadline = info.row.original.marks_entry_deadline;
          return (
            <div className="space-y-1">
              {locked ? (
                <Badge variant="solid" color="error" size="sm" className="flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </Badge>
              ) : (
                <Badge variant="light" color="success" size="sm" className="flex items-center gap-1">
                  <Unlock className="w-3 h-3 text-emerald-500" /> Open
                </Badge>
              )}
              {deadline && (
                <div className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-warning-500" /> Deadline: {formatDate(deadline)}
                </div>
              )}
            </div>
          );
        }
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: info => (
          <div className="flex justify-end">
            <ActionMenu 
              groups={[
                [
                  { label: 'View Details', icon: <Eye className="w-4 h-4" />, onClick: () => setDrawerExam(info.row.original) },
                  { label: 'Edit Exam', icon: <Edit className="w-4 h-4" />, onClick: () => handleEdit(info.row.original) },
                  { 
                    label: info.row.original.is_published ? 'Re-Broadcast Alert' : 'Publish & Broadcast', 
                    icon: <Send className="w-4 h-4 text-blue-500" />, 
                    onClick: () => handlePublishNotify(info.row.original.id, info.row.original.title) 
                  },
                  { 
                    label: info.row.original.is_locked ? 'Unlock Marks Entry' : 'Lock Marks Entry', 
                    icon: info.row.original.is_locked ? <Unlock className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-amber-500" />, 
                    onClick: () => handleToggleLock(info.row.original.id, !!info.row.original.is_locked, info.row.original.title) 
                  }
                ],
                [
                  { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(info.row.original.id, info.row.original.title), isDanger: true }
                ]
              ]}
            />
          </div>
        ),
      },
    ],
    [classList]
  );

  if (loading && view === 'list') {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Examinations', href: '#' }, { label: 'Exam Setup' }]} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // ─── LIST VIEW ────────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="w-full space-y-6">
        <Breadcrumb items={[{ label: 'Examinations', href: '#' }, { label: 'Exam Setup' }]} />
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Terms Setup Engine</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure academic terms, weightage %, target classes, deadline locks, and parent broadcasters.</p>
          </div>
          <Button variant="primary" onClick={handleAddNew} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add New Exam
          </Button>
        </div>

        {/* Global StatCards Widget */}
        <StatCards stats={statCardsData} loading={loading} />

        {/* Standardized DataTable */}
        <DataTable
          loading={loading}
          data={filteredExams}
          columns={columns}
          searchPlaceholder="Search exam terms..."
          emptyMessage="No exams found in this category."
          exportable={true}
          exportFilename="ExamSetups"
          leftActions={
            <div className="flex p-1 space-x-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
              {[
                { id: 'all', label: 'All Exams' },
                { id: 'Upcoming', label: 'Upcoming' },
                { id: 'Ongoing', label: 'Ongoing' },
                { id: 'Completed', label: 'Completed' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm border border-gray-200/50 dark:border-gray-600/50' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          }
        />

        {/* Global ProfileDrawer for viewing Exam Details */}
        <ProfileDrawer 
          isOpen={!!drawerExam}
          onClose={() => setDrawerExam(null)}
          title={drawerExam?.title || ''}
          subtitle="Examination Config Details"
          badges={
            drawerExam 
            ? [
                { label: drawerExam.status, color: getStatusBadgeColor(drawerExam.status) as any },
                { label: drawerExam.is_locked ? 'Marks Locked' : 'Marks Open', color: drawerExam.is_locked ? 'error' : 'success' },
                { label: drawerExam.is_published ? 'Broadcasted' : 'Draft', color: drawerExam.is_published ? 'primary' : 'light' }
              ] 
            : []
          }
          sections={[
            {
              title: 'Pro Configurations',
              items: [
                { icon: <Scale className="w-4 h-4 text-blue-500" />, label: `Term Weightage: ${drawerExam?.weightage_percentage || 100}%` },
                { icon: <Layers className="w-4 h-4 text-indigo-500" />, label: `Academic Session: ${drawerExam?.academic_session || '2025-2026'}` },
                { icon: <Clock className="w-4 h-4 text-amber-500" />, label: `Auto-Lock Deadline: ${formatDate(drawerExam?.marks_entry_deadline)}` },
                { icon: <CheckCircle className="w-4 h-4 text-emerald-500" />, label: `Target Scope: ${getClassNamesFromIds(drawerExam?.target_class_ids)}` }
              ]
            },
            {
              title: 'Exam Schedule',
              items: [
                { icon: <Calendar className="w-4 h-4" />, label: `Start Date: ${formatDate(drawerExam?.start_date)}` },
                { icon: <Calendar className="w-4 h-4" />, label: `End Date: ${formatDate(drawerExam?.end_date)}` }
              ]
            },
            {
              title: 'Instructions',
              items: [
                { 
                  icon: <AlignLeft className="w-4 h-4" />, 
                  label: drawerExam?.description ? (
                    <div dangerouslySetInnerHTML={{ __html: drawerExam.description }} />
                  ) : 'No specific instructions provided.' 
                }
              ]
            }
          ]}
        />

      </div>
    );
  }

  // ─── FORM VIEW ────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleFormSubmit} className="w-full space-y-6">
      
      <div className="flex justify-between items-center p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            {isEditing ? 'Edit Exam Setup' : 'Add New Exam Setup'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure term dates, weightage %, target classes, and deadline lock settings (*).
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={cancelForm}>
          ← Back to List
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Exam Details Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm lg:col-span-2">
          <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 rounded-t-xl">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <span className="text-brand-500">📋</span> Term Basic Details
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div className="sm:col-span-2">
              <Label required>Exam Title</Label>
              <Input 
                type="text" 
                required 
                placeholder="e.g. Mid-Term 2026" 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              />
            </div>

            <div>
              <SearchableSelect
                label="Academic Session *"
                options={[
                  { value: '2024-2025', label: '2024 - 2025' },
                  { value: '2025-2026', label: '2025 - 2026' },
                  { value: '2026-2027', label: '2026 - 2027' },
                ]}
                value={formData.academic_session}
                onChange={(val) => setFormData({ ...formData, academic_session: val as string })}
              />
            </div>

            <div>
              <Label>Term Weightage (%)</Label>
              <Input 
                type="number" 
                step="0.1"
                min="0"
                max="100"
                placeholder="e.g. 30" 
                value={formData.weightage_percentage || ''} 
                onChange={(e) => setFormData({ ...formData, weightage_percentage: e.target.value })} 
              />
            </div>
            
            <div>
              <Label required>Start Date</Label>
              <DatePicker 
                id="start-date-picker" 
                value={formData.start_date} 
                required 
                placeholder="Select start date" 
                onChange={(e: any) => setFormData({ ...formData, start_date: e.target.value })} 
              />
            </div>
            
            <div>
              <Label required>End Date</Label>
              <DatePicker 
                id="end-date-picker" 
                value={formData.end_date} 
                required 
                placeholder="Select end date" 
                onChange={(e: any) => setFormData({ ...formData, end_date: e.target.value })} 
              />
            </div>

            <div>
              <Label>Marks Entry Auto-Lock Deadline</Label>
              <DatePicker 
                id="deadline-date-picker" 
                value={formData.marks_entry_deadline} 
                placeholder="Select auto-lock date" 
                onChange={(e: any) => setFormData({ ...formData, marks_entry_deadline: e.target.value })} 
              />
            </div>

            <div>
              <SearchableSelect
                label="Exam Status *"
                options={[
                  { value: 'Upcoming', label: 'Upcoming' },
                  { value: 'Ongoing', label: 'Ongoing' },
                  { value: 'Completed', label: 'Completed' },
                ]}
                value={formData.status}
                onChange={(val) => setFormData({ ...formData, status: val as string })}
              />
            </div>

            <div className="sm:col-span-2">
              <MultiSelect
                label="Target Classes (Leave empty for All Classes)"
                options={classOptions}
                value={selectedClasses}
                onChange={(selected) => setSelectedClasses(selected)}
                placeholder="Select applicable classes..."
              />
            </div>
            
          </div>
        </div>

        {/* Description / Instructions Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden lg:col-span-2">
          <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <span className="text-warning-500">📝</span> Exam Instructions & Guidelines
            </h3>
          </div>
          <div className="p-6">
            <RichTextEditor
              label="Additional Instructions & Rules"
              value={formData.description}
              onChange={(val) => setFormData({ ...formData, description: val })}
              placeholder="Write any rules, guidelines, or instructions for this exam term..."
            />
          </div>
        </div>

      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="flex justify-end items-center gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        <Button type="button" variant="outline" onClick={cancelForm}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={submitLoading}
          loadingText="Saving..."
          disabled={!formData.title}
          className="min-w-[160px]"
        >
          {isEditing ? 'Save Changes' : 'Save Exam'}
        </Button>
      </div>
      
    </form>
  );
}