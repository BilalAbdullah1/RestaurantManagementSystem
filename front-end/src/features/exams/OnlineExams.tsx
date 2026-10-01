import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { ColumnDef } from '@tanstack/react-table';

// Components
import Button from '../../components/ui/button/Button';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import DatePicker from '../../components/form/date-picker';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import Badge from '../../components/ui/badge/Badge';
import ActionMenu, { ActionMenuItem } from '../../components/ui/UIDesigns/ActionMenu';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { DataTable } from '../../components/ui/table/DataTable';
import { Skeleton } from '../../components/ui/Skeleton';
import { toast } from '../../components/ui/Toast';

// Icons
import { Plus, Edit, Trash2, MonitorPlay, Clock, Target, CheckSquare, Shield, Shuffle, Send, FileText, CheckCircle } from 'lucide-react';

// --- TYPES ---
interface OnlineExam {
  id: string;
  title: string;
  exam_date: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  shuffle_questions?: boolean;
  shuffle_options?: boolean;
  is_published?: boolean;
  created_at?: string;
}

interface LookupItem {
  id: string;
  name?: string;
  title?: string;
}

export default function OnlineExams() {
  const tenantId = localStorage.getItem("tenantId") || "";

  // --- STATES ---
  const [exams, setExams] = useState<OnlineExam[]>([]);
  const [examTerms, setExamTerms] = useState<LookupItem[]>([]);
  const [classes, setClasses] = useState<LookupItem[]>([]);
  const [sections, setSections] = useState<LookupItem[]>([]);
  const [subjects, setSubjects] = useState<LookupItem[]>([]);
  const [questionBank, setQuestionBank] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewQuestionsModal, setViewQuestionsModal] = useState<any[] | null>(null);

  // FORM STATE
  const initialForm = {
    tenant_id: tenantId,
    exam_setup_id: '',
    class_id: '',
    section_id: '',
    subject_id: '',
    title: '',
    exam_date: new Date().toISOString().split('T')[0],
    duration_minutes: 60,
    total_marks: 100,
    passing_marks: 40,
    shuffle_questions: true,
    shuffle_options: true,
    is_published: false,
    question_ids: [] as string[]
  };
  const [formData, setFormData] = useState<any>(initialForm);

  // --- FETCH MASTER DATA ---
  useEffect(() => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (!activeTenant) return;
    const fetchMetadata = async () => {
      try {
        const [terms, cls, subs] = await Promise.all([
          api.get(`/examsetups/tenant/${activeTenant}`),
          api.get(`/classes/tenant/${activeTenant}`),
          api.get(`/subjects/tenant/${activeTenant}`)
        ]);
        setExamTerms(terms.data || []);
        setClasses(cls.data || []);
        setSubjects(subs.data || []);
      } catch (err) {
        toast.error('Failed to load scheduling metadata.');
      }
    };
    fetchMetadata();
  }, [tenantId]);

  useEffect(() => {
    if (formData.class_id) {
      api.get(`/sections/class/${formData.class_id}`)
         .then(res => setSections(res.data || []))
         .catch(console.error);
    }
  }, [formData.class_id]);

  useEffect(() => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (formData.subject_id && formData.class_id && activeTenant) {
      api.get(`/questionbanks/tenant/${activeTenant}`, {
        params: { classId: formData.class_id, subjectId: formData.subject_id }
      })
      .then(res => setQuestionBank(res.data || []))
      .catch(console.error);
    }
  }, [formData.subject_id, formData.class_id, tenantId]);

  // --- FETCH EXAMS ---
  const fetchExams = async () => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (!activeTenant) return;
    setLoading(true);
    try {
      const res = await api.get<OnlineExam[]>(`/onlineexams/tenant/${activeTenant}`);
      setExams(res.data);
    } catch (err) {
      toast.error('Failed to fetch online exams from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [tenantId]);

  // --- ACTIONS ---
  const handleAddNew = () => {
    setFormData({
      ...initialForm,
      tenant_id: tenantId || localStorage.getItem("tenantId") || "",
      exam_setup_id: examTerms.length > 0 ? examTerms[0].id : '',
      class_id: classes.length > 0 ? classes[0].id : '',
      subject_id: subjects.length > 0 ? subjects[0].id : ''
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: 'Delete Online CBT Exam?',
      text: `Are you sure you want to delete "${title}"? Students won't be able to access it anymore.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/onlineexams/${id}`);
        toast.success(`Exam "${title}" deleted.`);
        setExams(prev => prev.filter(e => e.id !== id));
      } catch (err) {
        toast.error("Failed to delete exam.");
      }
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const res = await api.patch(`/onlineexams/${id}/toggle-publish`);
      toast.success(res.data.message || 'Publish status updated.');
      fetchExams();
    } catch (err) {
      toast.error('Failed to update publish status.');
    }
  };

  const handleViewQuestions = async (id: string) => {
    try {
      const res = await api.get(`/onlineexams/${id}/questions`);
      setViewQuestionsModal(res.data || []);
    } catch (err) {
      toast.error('Could not load mapped questions for this exam.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.question_ids.length === 0) {
      toast.error("Please select at least one question from the Question Bank.");
      return;
    }
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    setSubmitLoading(true);
    try {
      const payload = {
        ...formData,
        tenant_id: activeTenant,
        section_id: formData.section_id || null,
        duration_minutes: Number(formData.duration_minutes),
        total_marks: Number(formData.total_marks),
        passing_marks: Number(formData.passing_marks)
      };
      await api.post('/onlineexams', payload);
      toast.success('Online CBT Exam deployed successfully!');
      setIsDrawerOpen(false);
      fetchExams();
    } catch (err) {
      toast.error('Failed to deploy CBT exam.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const toggleQuestion = (id: string) => {
    setFormData((prev: any) => {
      const qIds = prev.question_ids;
      if (qIds.includes(id)) {
        return { ...prev, question_ids: qIds.filter((q: string) => q !== id) };
      }
      return { ...prev, question_ids: [...qIds, id] };
    });
  };

  // --- STATS SUMMARY ---
  const stats: StatCardData[] = useMemo(() => {
    const total = exams.length;
    const published = exams.filter(e => e.is_published).length;
    const draft = total - published;

    return [
      { title: 'Total CBT Exams', value: `${total} Exams`, icon: <MonitorPlay className="w-6 h-6 text-brand-500" />, theme: 'brand' },
      { title: 'Published & Live', value: `${published} Live`, icon: <Send className="w-6 h-6 text-success-500" />, theme: 'success' },
      { title: 'Draft / Unpublished', value: `${draft} Drafts`, icon: <FileText className="w-6 h-6 text-warning-500" />, theme: 'warning' },
    ];
  }, [exams]);

  // --- TABLE COLUMNS ---
  const columns = useMemo<ColumnDef<OnlineExam>[]>(() => [
    {
      header: 'Exam Title & Details',
      accessorKey: 'title',
      cell: (info: any) => {
        const exam = info.row.original as OnlineExam;
        return (
          <div>
            <div className="font-bold text-gray-900 dark:text-white text-base">{exam.title}</div>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-brand-500" /> {exam.duration_minutes} Mins</span>
              {exam.shuffle_questions && (
                <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                  <Shuffle className="w-3 h-3" /> Random Order
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Scheduled Date',
      accessorKey: 'exam_date',
      cell: (info: any) => (
        <span className="inline-flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200">
          {new Date(info.getValue()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      )
    },
    {
      header: 'Marks Benchmarks',
      id: 'benchmarks',
      cell: (info: any) => {
        const exam = info.row.original as OnlineExam;
        return (
          <div className="flex items-center gap-2">
            <Badge variant="light" color="primary">Total: {exam.total_marks}</Badge>
            <Badge variant="light" color="success">Pass: {exam.passing_marks}</Badge>
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessorKey: 'is_published',
      cell: (info: any) => {
        const isPub = info.getValue() as boolean;
        return isPub ? (
          <Badge variant="solid" color="success" size="sm" className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Published & Live
          </Badge>
        ) : (
          <Badge variant="light" color="warning" size="sm" className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Draft / Hidden
          </Badge>
        );
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (info: any) => {
        const exam = info.row.original as OnlineExam;
        const groups: ActionMenuItem[][] = [
          [
            { label: exam.is_published ? 'Unpublish (Draft)' : 'Publish to Students', icon: <Send className="w-4 h-4" />, onClick: () => handleTogglePublish(exam.id) },
            { label: 'View Mapped Questions', icon: <CheckSquare className="w-4 h-4" />, onClick: () => handleViewQuestions(exam.id) },
            { label: 'Delete CBT Exam', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(exam.id, exam.title), isDanger: true }
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

  const examOpts = useMemo(() => examTerms.map(e => ({ value: e.id, label: e.title || '' })), [examTerms]);
  const classOpts = useMemo(() => classes.map(c => ({ value: c.id, label: c.name || '' })), [classes]);
  const sectionOpts = useMemo(() => sections.map(s => ({ value: s.id, label: s.name || '' })), [sections]);
  const subjectOpts = useMemo(() => subjects.map(s => ({ value: s.id, label: s.name || '' })), [subjects]);

  if (loading && exams.length === 0) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Examinations', href: '#' }, { label: 'Online CBT Exams' }]} />
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
      <Breadcrumb items={[{ label: 'Examinations', href: '#' }, { label: 'Online CBT Exams' }]} />
      
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Online Exams (CBT) Engine</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Deploy computer-based MCQ tests with anti-cheating randomization and instant grading.</p>
        </div>
        <Button variant="primary" onClick={handleAddNew} className="flex items-center gap-2 shadow-sm">
          <MonitorPlay className="w-4 h-4" /> Create CBT Exam
        </Button>
      </div>

      {/* STATS SUMMARY */}
      <StatCards stats={stats} loading={loading} />

      {/* DATA TABLE SECTION */}
      <DataTable
        loading={loading}
        data={exams}
        columns={columns}
        searchPlaceholder="Search CBT exams..."
        emptyMessage="No online CBT exams created yet. Click 'Create CBT Exam' to deploy test papers."
        exportable={true}
        exportFilename="OnlineCBTExams"
      />

      {/* DRAWER FORM (Create CBT) using ProfileDrawer */}
      <ProfileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Deploy Computer-Based Test (CBT)"
        subtitle="Set exam duration, security controls, and map questions from the Question Bank"
      >
        <form id="onlineExamForm" onSubmit={handleFormSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <SearchableSelect 
                label="Exam Setup Term *"
                options={examOpts} 
                value={formData.exam_setup_id} 
                onChange={(val) => setFormData({...formData, exam_setup_id: val as string})} 
              />
            </div>
            <div>
              <SearchableSelect 
                label="Target Class *"
                options={classOpts} 
                value={formData.class_id} 
                onChange={(val) => setFormData({...formData, class_id: val as string, section_id: '', subject_id: ''})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <SearchableSelect 
                label="Section Scope (Optional)"
                options={[{ value: '', label: 'All Sections' }, ...sectionOpts]} 
                value={formData.section_id} 
                onChange={(val) => setFormData({...formData, section_id: val as string})} 
              />
            </div>
            <div>
              <SearchableSelect 
                label="Subject Course *"
                options={subjectOpts} 
                value={formData.subject_id} 
                onChange={(val) => setFormData({...formData, subject_id: val as string})} 
              />
            </div>
          </div>

          <div>
            <Label required>Exam Title</Label>
            <Input 
              type="text" 
              placeholder="e.g. Mid-Term Computer Science MCQs Test" 
              required 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label required>Exam Date</Label>
              <DatePicker 
                id="cbt-exam-date"
                value={formData.exam_date} 
                onChange={(e: any) => setFormData({...formData, exam_date: e.target.value})} 
              />
            </div>
            <div>
              <Label required>Duration (Mins)</Label>
              <Input 
                type="number" 
                min="10" max="360" required 
                value={formData.duration_minutes} 
                onChange={e => setFormData({...formData, duration_minutes: Number(e.target.value)})} 
              />
            </div>
            <div>
              <Label required>Total Marks</Label>
              <Input 
                type="number" 
                min="1" max="500" required 
                value={formData.total_marks} 
                onChange={e => setFormData({...formData, total_marks: Number(e.target.value)})} 
              />
            </div>
          </div>

          {/* Anti-Cheating & Security Controls */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-brand-500" /> Security & Randomization Controls
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.shuffle_questions} 
                  onChange={(e) => setFormData({ ...formData, shuffle_questions: e.target.checked })} 
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                Randomize Question Order
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.shuffle_options} 
                  onChange={(e) => setFormData({ ...formData, shuffle_options: e.target.checked })} 
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                Randomize Options (A, B, C, D)
              </label>
            </div>
          </div>

          {/* QUESTION SELECTOR */}
          {formData.subject_id && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-brand-500" /> Select Questions from Question Bank
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">Check MCQs to map onto this CBT test paper.</p>
                </div>
                <Badge variant="solid" color="primary">
                  {formData.question_ids.length} Selected
                </Badge>
              </div>

              <div className="max-h-60 overflow-y-auto p-4 space-y-3">
                {questionBank.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No questions found in Question Bank for this subject/class.</p>
                ) : (
                  questionBank.map((q: any) => (
                    <label key={q.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.question_ids.includes(q.id) ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                      <input 
                        type="checkbox" 
                        className="mt-1 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        checked={formData.question_ids.includes(q.id)}
                        onChange={() => toggleQuestion(q.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{q.question_text}</p>
                        <div className="flex gap-4 mt-1.5 text-xs text-gray-500">
                          <span>A: {q.option_a}</span>
                          <span>B: {q.option_b}</span>
                        </div>
                      </div>
                      <Badge variant="light" color={q.difficulty_level === 'Easy' ? 'success' : q.difficulty_level === 'Medium' ? 'warning' : 'danger'}>
                        {q.marks} Pt ({q.difficulty_level})
                      </Badge>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitLoading}
              loadingText="Deploying..."
              disabled={formData.question_ids.length === 0}
            >
              Deploy CBT Exam
            </Button>
          </div>
        </form>
      </ProfileDrawer>

      {/* VIEW QUESTIONS MODAL */}
      {viewQuestionsModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3 border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-brand-500" /> Mapped Exam Questions ({viewQuestionsModal.length})
              </h3>
              <Button variant="outline" size="sm" onClick={() => setViewQuestionsModal(null)}>Close</Button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {viewQuestionsModal.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No mapped questions found.</p>
              ) : (
                viewQuestionsModal.map((q: any, i: number) => (
                  <div key={q.id} className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">{i + 1}. {q.question_text}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <div>A) {q.option_a}</div>
                      <div>B) {q.option_b}</div>
                      <div>C) {q.option_c}</div>
                      <div>D) {q.option_d}</div>
                    </div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Correct Answer: Option {q.correct_option} ({q.marks} Marks)
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
