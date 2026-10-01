import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { ColumnDef } from '@tanstack/react-table';

// Components
import Button from '../../components/ui/button/Button';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import Badge from '../../components/ui/badge/Badge';
import ActionMenu, { ActionMenuItem } from '../../components/ui/UIDesigns/ActionMenu';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { DataTable } from '../../components/ui/table/DataTable';
import { Skeleton } from '../../components/ui/Skeleton';
import { toast } from '../../components/ui/Toast';

// Icons
import { Plus, Edit, Trash2, Database, Brain, Target, BookOpen, HelpCircle, Layers, CheckCircle } from 'lucide-react';

// --- TYPES ---
interface QuestionBankItem {
  id: string;
  tenant_id: string;
  class_id: string;
  subject_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  marks: number;
  difficulty_level: string;
  topic_name?: string;
  explanation?: string;
  question_type?: string;
  created_at?: string;
}

interface LookupItem {
  id: string;
  name?: string;
  title?: string;
}

export default function QuestionBank() {
  const tenantId = localStorage.getItem("tenantId") || "";

  // --- STATES ---
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [classes, setClasses] = useState<LookupItem[]>([]);
  const [subjects, setSubjects] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterClass, setFilterClass] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');

  // Drawer & Form States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form State
  const initialForm: Partial<QuestionBankItem> = {
    tenant_id: tenantId,
    class_id: '',
    subject_id: '',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    marks: 1,
    difficulty_level: 'Medium',
    topic_name: '',
    explanation: '',
    question_type: 'MCQ'
  };
  const [formData, setFormData] = useState<any>(initialForm);

  // --- FETCH LOOKUPS ---
  useEffect(() => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (!activeTenant) return;
    Promise.all([
      api.get(`/classes/tenant/${activeTenant}`),
      api.get(`/subjects/tenant/${activeTenant}`)
    ]).then(([classesRes, subjectsRes]) => {
      setClasses(classesRes.data || []);
      setSubjects(subjectsRes.data || []);
    }).catch(console.error);
  }, [tenantId]);

  // --- FETCH QUESTIONS ---
  const fetchQuestions = async () => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (!activeTenant) return;
    setLoading(true);
    try {
      const res = await api.get(`/questionbanks/tenant/${activeTenant}`, {
        params: { classId: filterClass || undefined, subjectId: filterSubject || undefined }
      });
      setQuestions(res.data);
    } catch (err) {
      toast.error('Failed to load question bank items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [tenantId, filterClass, filterSubject]);

  // --- ACTIONS ---
  const handleAddNew = () => {
    setFormData({
      ...initialForm,
      tenant_id: tenantId || localStorage.getItem("tenantId") || "",
      class_id: filterClass || (classes.length > 0 ? classes[0].id : ''),
      subject_id: filterSubject || (subjects.length > 0 ? subjects[0].id : '')
    });
    setIsEditing(false);
    setIsDrawerOpen(true);
  };

  const handleEdit = (q: QuestionBankItem) => {
    setFormData({ ...q });
    setIsEditing(true);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete Question?',
      text: "This question will be removed permanently from the Question Bank.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/questionbanks/${id}`);
        setQuestions(prev => prev.filter(q => q.id !== id));
        toast.success("Question deleted from bank.");
      } catch (err) {
        toast.error("Failed to delete question.");
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.class_id || !formData.subject_id || !formData.question_text || !formData.option_a) {
      toast.error('Please fill in all required question fields.');
      return;
    }

    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    const payload = {
      ...formData,
      tenant_id: activeTenant,
      marks: Number(formData.marks)
    };

    setSubmitLoading(true);
    try {
      if (isEditing) {
        await api.put(`/questionbanks/${formData.id}`, payload);
        toast.success('Question updated successfully.');
      } else {
        await api.post('/questionbanks', payload);
        toast.success('Question added to bank.');
      }
      setIsDrawerOpen(false);
      fetchQuestions();
    } catch (err) {
      toast.error('Failed to save question.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- ANALYTICS STATS ---
  const statsData: StatCardData[] = useMemo(() => {
    const total = questions.length;
    const easy = questions.filter(q => q.difficulty_level === 'Easy').length;
    const medium = questions.filter(q => q.difficulty_level === 'Medium').length;
    const hard = questions.filter(q => q.difficulty_level === 'Hard').length;
    return [
      { title: 'Total Questions', value: `${total} Items`, icon: <Database className="w-6 h-6 text-brand-500" />, theme: 'brand' },
      { title: 'Easy / Medium', value: `${easy} / ${medium}`, icon: <Target className="w-6 h-6 text-success-500" />, theme: 'success' },
      { title: 'Hard Challenge', value: `${hard} Questions`, icon: <Brain className="w-6 h-6 text-rose-500" />, theme: 'rose' }
    ];
  }, [questions]);

  // --- TABLE COLUMNS ---
  const columns = useMemo<ColumnDef<QuestionBankItem>[]>(() => [
    {
      header: 'Question Statement',
      accessorKey: 'question_text',
      cell: (info: any) => {
        const q = info.row.original as QuestionBankItem;
        return (
          <div className="max-w-lg space-y-1">
            <div className="font-bold text-gray-900 dark:text-white leading-snug">{q.question_text}</div>
            {q.topic_name && (
              <span className="inline-block text-xs font-medium text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800">
                Topic: {q.topic_name}
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Correct Answer',
      accessorKey: 'correct_option',
      cell: (info: any) => {
        const q = info.row.original as QuestionBankItem;
        const optKey = `option_${q.correct_option.toLowerCase()}` as keyof QuestionBankItem;
        const optText = q[optKey] || '';
        return (
          <div className="space-y-0.5">
            <Badge variant="solid" color="success" size="sm">
              Option {q.correct_option}
            </Badge>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium max-w-[200px] truncate" title={String(optText)}>
              {String(optText)}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Marks',
      accessorKey: 'marks',
      cell: (info: any) => (
        <span className="inline-block font-black text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700">
          {info.getValue()} Pt
        </span>
      )
    },
    {
      header: 'Difficulty',
      accessorKey: 'difficulty_level',
      cell: (info: any) => {
        const diff = info.getValue() as string;
        return (
          <Badge variant="light" color={diff === 'Easy' ? 'success' : diff === 'Medium' ? 'warning' : 'danger'}>
            {diff}
          </Badge>
        );
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (info: any) => {
        const q = info.row.original as QuestionBankItem;
        const groups: ActionMenuItem[][] = [
          [
            { label: 'Edit Question', icon: <Edit className="w-4 h-4" />, onClick: () => handleEdit(q) },
            { label: 'Delete Question', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(q.id), isDanger: true }
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

  const classOpts = useMemo(() => classes.map(c => ({ value: c.id, label: c.name || '' })), [classes]);
  const subjectOpts = useMemo(() => subjects.map(s => ({ value: s.id, label: s.name || '' })), [subjects]);

  if (loading && questions.length === 0) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Examinations', href: '#' }, { label: 'Question Bank' }]} />
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
      <Breadcrumb items={[{ label: 'Examinations', href: '#' }, { label: 'Question Bank (CBT)' }]} />
      
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Question Bank (CBT) Engine</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage multiple-choice questions, difficulty weights, chapter topics, and answer explanations.</p>
        </div>
        <Button variant="primary" onClick={handleAddNew} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Add Question
        </Button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <SearchableSelect 
            label="Filter by Target Class"
            options={[{ value: '', label: 'All Classes' }, ...classOpts]}
            value={filterClass}
            onChange={(val) => setFilterClass(val as string)}
            placeholder="All Classes"
          />
        </div>
        <div>
          <SearchableSelect 
            label="Filter by Subject Course"
            options={[{ value: '', label: 'All Subjects' }, ...subjectOpts]}
            value={filterSubject}
            onChange={(val) => setFilterSubject(val as string)}
            placeholder="All Subjects"
          />
        </div>
      </div>

      {/* STATS SUMMARY */}
      <StatCards stats={statsData} loading={loading} />

      {/* DATA TABLE SECTION */}
      <DataTable
        loading={loading}
        data={questions}
        columns={columns}
        searchPlaceholder="Search questions or topics..."
        emptyMessage="No questions found in bank."
        exportable={true}
        exportFilename="QuestionBank"
      />

      {/* DRAWER FORM (Add/Edit) using ProfileDrawer */}
      <ProfileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={isEditing ? 'Modify Question' : 'Add New Question'}
        subtitle="Configure MCQ statement, options, correct answer, topic, and explanation"
      >
        <form id="questionForm" onSubmit={handleFormSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <SearchableSelect 
                label="Target Class *"
                options={[{ value: 'all', label: 'All Classes' }, ...classes.map(c => ({ value: c.id, label: c.name }))]}
                value={formData.class_id || 'all'}
                onChange={(val) => setFormData({ ...formData, class_id: val === 'all' ? '' : val as string })}
              />
            </div>
            <div>
              <SearchableSelect 
                label="Target Subject *"
                options={subjects.map(s => ({ value: s.id, label: s.name }))}
                value={formData.subject_id}
                onChange={(val) => setFormData({ ...formData, subject_id: val as string })}
              />
            </div>
          </div>

          <div>
            <Label required>Question Statement</Label>
            <Input 
              type="text" 
              placeholder="e.g. Which organelle is known as the powerhouse of the cell?" 
              value={formData.question_text} 
              onChange={e => setFormData({...formData, question_text: e.target.value})} 
              required 
            />
          </div>

          <div>
            <Label>Topic / Chapter</Label>
            <Input 
              type="text" 
              placeholder="e.g. Cell Biology, Thermodynamics..." 
              value={formData.topic || ''} 
              onChange={e => setFormData({...formData, topic: e.target.value})} 
            />
          </div>

          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
            <Label required>Multiple Choice Options</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Option A *</Label>
                <Input type="text" placeholder="Option A" value={formData.option_a} onChange={e => setFormData({...formData, option_a: e.target.value})} required />
              </div>
              <div>
                <Label>Option B *</Label>
                <Input type="text" placeholder="Option B" value={formData.option_b} onChange={e => setFormData({...formData, option_b: e.target.value})} required />
              </div>
              <div>
                <Label>Option C</Label>
                <Input type="text" placeholder="Option C" value={formData.option_c || ''} onChange={e => setFormData({...formData, option_c: e.target.value})} />
              </div>
              <div>
                <Label>Option D</Label>
                <Input type="text" placeholder="Option D" value={formData.option_d || ''} onChange={e => setFormData({...formData, option_d: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <SearchableSelect 
                label="Correct Answer *"
                options={[
                  { value: 'A', label: 'Option A' },
                  { value: 'B', label: 'Option B' },
                  { value: 'C', label: 'Option C' },
                  { value: 'D', label: 'Option D' },
                ]}
                value={formData.correct_option}
                onChange={(val) => setFormData({ ...formData, correct_option: val as string })}
              />
            </div>
            <div>
              <SearchableSelect 
                label="Difficulty *"
                options={[
                  { value: 'Easy', label: 'Easy' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Hard', label: 'Hard' },
                ]}
                value={formData.difficulty_level || 'Medium'}
                onChange={(val) => setFormData({ ...formData, difficulty_level: val as string })}
              />
            </div>
            <div>
              <Label required>Marks / Weight</Label>
              <Input 
                type="number" 
                value={formData.marks} 
                onChange={e => setFormData({...formData, marks: parseFloat(e.target.value) || 1})} 
                min={0.5} 
                step={0.5} 
                required 
              />
            </div>
          </div>

          <div>
            <Label>Solution Explanation / Rationale</Label>
            <Input
              type="text"
              placeholder="Explain why this option is correct for student practice feedback..."
              value={formData.explanation || ''}
              onChange={e => setFormData({...formData, explanation: e.target.value})}
            />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitLoading}
              loadingText="Saving..."
              disabled={!formData.question_text}
            >
              Save Question
            </Button>
          </div>
        </form>
      </ProfileDrawer>
    </div>
  );
}
