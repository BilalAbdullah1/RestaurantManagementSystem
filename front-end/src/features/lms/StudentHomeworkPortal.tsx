import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import { 
  BookOpen, Calendar, Clock, Upload, CheckCircle2, AlertCircle, X, 
  Paperclip, Search, Award, FileText, CheckCircle, ExternalLink, Loader2 
} from 'lucide-react';
import Button from '../../components/ui/button/Button';
import InputField from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import RichTextEditor from '../../components/form/RichTextEditor';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { toast } from '../../components/ui/Toast';

export default function StudentHomeworkPortal() {
  const tenantId = localStorage.getItem("tenantId") || "";
  const studentId = localStorage.getItem("userId") || ""; 

  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'submitted' | 'graded' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [currentHomework, setCurrentHomework] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    notes: '',
    attachment_urls: ''
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchStudentAndSubjects();
  }, [tenantId, studentId]);

  useEffect(() => {
    if (studentDetails) {
      fetchHomeworksAndSubmissions();
    }
  }, [studentDetails]);

  const fetchStudentAndSubjects = async () => {
    try {
      const [studRes, subRes] = await Promise.all([
        api.get(`/students/${studentId}`),
        api.get(`/subjects/tenant/${tenantId}`)
      ]);
      setStudentDetails(studRes.data || { class_id: 'mock', section_id: 'mock' });
      setSubjects(subRes.data || []);
    } catch (e) {
      console.error(e);
      setStudentDetails({ class_id: 'mock', section_id: 'mock' });
    }
  };

  const fetchHomeworksAndSubmissions = async () => {
    setLoading(true);
    try {
      const hwRes = await api.get(`/homeworks/tenant/${tenantId}`);
      const classHw = (hwRes.data || []).filter((h: any) => 
        studentDetails.class_id === 'mock' ? true : h.class_id === studentDetails.class_id
      );
      setHomeworks(classHw);

      const subRes = await api.get(`/homeworksubmissions/tenant/${tenantId}/student/${studentId}`);
      setSubmissions(subRes.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load active assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append("file", file);

    setUploading(true);
    try {
      const res = await api.post('/uploads', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newUrl = res.data.url;
      const currentUrls = formData.attachment_urls ? formData.attachment_urls + ", " : "";
      setFormData({ ...formData, attachment_urls: currentUrls + newUrl });
      toast.success('File uploaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getSubmission = (hwId: string) => submissions.find(s => s.homework_id === hwId);
  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Subject';

  const openSubmitModal = (hw: any) => {
    setCurrentHomework(hw);
    const existing = getSubmission(hw.id);
    if (existing) {
      setFormData({
        notes: existing.student_notes || '',
        attachment_urls: existing.attachment_urls ? JSON.parse(existing.attachment_urls).join(', ') : ''
      });
    } else {
      setFormData({ notes: '', attachment_urls: '' });
    }
    setSubmitModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        tenant_id: tenantId,
        homework_id: currentHomework.id,
        student_id: studentId,
        student_notes: formData.notes,
        attachment_urls: formData.attachment_urls ? JSON.stringify(formData.attachment_urls.split(',')) : null
      };

      await api.post('/homeworksubmissions/submit', payload);
      toast.success('Homework turned in successfully!');
      setSubmitModalOpen(false);
      fetchHomeworksAndSubmissions();
    } catch (err) {
      toast.error('Failed to turn in homework');
    }
  };

  // Filtered Homework List
  const filteredHomeworks = useMemo(() => {
    return homeworks.filter(hw => {
      const sub = getSubmission(hw.id);
      const isLate = new Date() > new Date(hw.due_date);
      const status = sub?.status || (isLate ? 'Overdue' : 'Pending');

      if (statusFilter === 'pending' && (sub || isLate)) return false;
      if (statusFilter === 'submitted' && sub?.status !== 'Submitted') return false;
      if (statusFilter === 'graded' && sub?.status !== 'Graded') return false;
      if (statusFilter === 'overdue' && !isLate) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const subName = getSubjectName(hw.subject_id).toLowerCase();
      return hw.title.toLowerCase().includes(q) || subName.includes(q);
    });
  }, [homeworks, submissions, statusFilter, searchQuery, subjects]);

  // StatCards KPI Data
  const statsData: StatCardData[] = useMemo(() => {
    const total = homeworks.length;
    const submitted = submissions.filter(s => s.status === 'Submitted').length;
    const graded = submissions.filter(s => s.status === 'Graded').length;
    const pending = total - (submitted + graded);

    return [
      {
        title: 'Total Assignments',
        value: `${total} Tasks`,
        icon: <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
        theme: 'brand'
      },
      {
        title: 'Turned In & Graded',
        value: `${graded + submitted} Submitted`,
        icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
        theme: 'success'
      },
      {
        title: 'Pending Work',
        value: `${pending} Pending`,
        icon: <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
        theme: 'warning'
      },
      {
        title: 'Completion Rate',
        value: total > 0 ? `${Math.round(((graded + submitted) / total) * 100)}%` : '100%',
        icon: <Award className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
        theme: 'sky'
      }
    ];
  }, [homeworks, submissions]);

  return (
    <div className="w-full max-w-full space-y-6">
      {/* Top Breadcrumb Navigation */}
      <Breadcrumb items={[
        { label: 'Student Portal', href: '/student-portal' },
        { label: 'My Homework & Assignments' }
      ]} />

      {/* Header Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-500" />
              My Homework & Assignments
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track active assignments, view teacher guidelines, and submit your homework online.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Summary */}
      <StatCards stats={statsData} loading={loading} />

      {/* Main Homework Grid Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        
        {/* Controls Bar: Search & Status Filter Tabs */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search assignment by title or subject..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              All Tasks ({homeworks.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'pending' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('submitted')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'submitted' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              Turned In
            </button>
            <button
              onClick={() => setStatusFilter('graded')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'graded' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              Graded
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-48 bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-800" />
            ))}
          </div>
        ) : filteredHomeworks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-60" />
            <h4 className="text-base font-bold text-gray-800 dark:text-white">All Caught Up!</h4>
            <p className="text-xs mt-1">No active homework assignments matching this filter.</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHomeworks.map(hw => {
              const sub = getSubmission(hw.id);
              const isLate = new Date() > new Date(hw.due_date);
              const status = sub?.status || (isLate ? 'Overdue' : 'Pending');

              return (
                <div 
                  key={hw.id} 
                  className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className={`absolute top-0 left-0 bottom-0 w-1.5 rounded-l-2xl ${
                    status === 'Graded' ? 'bg-emerald-500' : 
                    status === 'Submitted' ? 'bg-blue-500' : 
                    isLate ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                  
                  <div className="pl-2 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-extrabold border border-blue-100 dark:border-blue-800">
                        {getSubjectName(hw.subject_id)}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        status === 'Graded' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 
                        status === 'Submitted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 
                        isLate ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {status}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-lg text-gray-900 dark:text-white leading-tight truncate" title={hw.title}>
                      {hw.title}
                    </h3>
                  </div>

                  <div className="pl-2 space-y-3 text-xs">
                    <div className={`flex items-center gap-1.5 font-bold ${isLate && !sub ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      Due Date: {new Date(hw.due_date).toLocaleDateString()}
                    </div>

                    {hw.max_marks && (
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-semibold">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        Max Marks: {hw.max_marks} Points
                      </div>
                    )}

                    {status === 'Graded' && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-1">
                        <div className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                          Score: {sub.marks_obtained} / {hw.max_marks || 100}
                        </div>
                        {sub.teacher_remarks && (
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 italic">
                            "{sub.teacher_remarks}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => openSubmitModal(hw)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                      status === 'Pending' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {status === 'Pending' ? (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Submit Work</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5" />
                        <span>View My Submission</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submission Modal Dialog */}
      {submitModalOpen && currentHomework && (
        <div className="fixed inset-0 z-[999999] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-gray-800 rounded-t-2xl">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" />
                Submit Assignment: {currentHomework.title}
              </h3>
              <button onClick={() => setSubmitModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* Teacher Assignment Instructions */}
              <div className="p-4 bg-slate-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Teacher Instructions:</h4>
                <div 
                  className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed prose dark:prose-invert max-w-none" 
                  dangerouslySetInnerHTML={{ __html: currentHomework.description || 'No description provided.' }} 
                />
                
                {currentHomework.attachment_urls && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Teacher Attachments:</h5>
                    {JSON.parse(currentHomework.attachment_urls).map((url: string, i: number) => (
                      <a 
                        key={i} 
                        href={url.trim()} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        <Paperclip className="w-3.5 h-3.5" /> Attachment {i + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Submission Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <RichTextEditor 
                    label="Your Response / Notes"
                    value={formData.notes}
                    onChange={val => setFormData({...formData, notes: val})}
                    placeholder="Type your answer, notes, or explanations here..."
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-1.5 mb-1.5">
                    <Paperclip className="w-4 h-4 text-blue-500" /> Upload File or Drive Link
                  </Label>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <InputField 
                        value={formData.attachment_urls} 
                        onChange={e => setFormData({...formData, attachment_urls: e.target.value})} 
                        placeholder="Google Drive URL, Dropbox link..." 
                      />
                    </div>
                    <div className="relative">
                      <input type="file" id="student-homework-file-upload" className="hidden" onChange={handleFileUpload} />
                      <label 
                        htmlFor="student-homework-file-upload" 
                        className="cursor-pointer flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 h-11 transition-colors text-xs font-bold"
                      >
                        {uploading ? 'Uploading...' : 'Upload File'}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800">
                  <button 
                    type="button" 
                    onClick={() => setSubmitModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Turn In Assignment</span>
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

