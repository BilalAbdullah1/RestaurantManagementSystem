import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import { 
  BookOpen, Calendar, Clock, Paperclip, Plus, Trash2, Search, 
  CheckCircle2, FileText, Download, Award, AlertCircle, Loader2, X 
} from 'lucide-react';
import Button from '../../components/ui/button/Button';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import InputField from '../../components/form/input/InputField';
import DatePicker from '../../components/form/date-picker';
import Label from '../../components/form/Label';
import RichTextEditor from '../../components/form/RichTextEditor';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { toast } from '../../components/ui/Toast';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Homework {
  id: string;
  title: string;
  description: string;
  homework_date: string;
  due_date: string;
  max_marks: number | null;
  attachment_urls: string | null;
  class_id: string;
  section_id: string;
  subject_id: string;
}

export default function HomeworkManagement() {
  const tenantId = localStorage.getItem("tenantId") || "";
  const staffId = localStorage.getItem("userId") || "";

  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'past'>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    homework_date: new Date().toISOString().split('T')[0],
    due_date: '',
    subject_id: '',
    max_marks: '',
    attachment_urls: ''
  });

  const [uploading, setUploading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setDrawerOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchInitialData();
  }, [tenantId]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchHomeworks();
    } else {
      setHomeworks([]);
    }
  }, [selectedClass, selectedSection]);

  const fetchInitialData = async () => {
    try {
      if (!tenantId) return;
      const [classRes, secRes, subRes] = await Promise.all([
        api.get(`/classes/tenant/${tenantId}`),
        api.get(`/sections/tenant/${tenantId}`),
        api.get(`/subjects/tenant/${tenantId}`)
      ]);
      setClasses(classRes.data || []);
      setSections(secRes.data || []);
      setSubjects(subRes.data || []);
    } catch (err) {
      console.error("Failed to fetch initial data", err);
      toast.error('Failed to load classes & subjects');
    }
  };

  const fetchHomeworks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/homeworks/tenant/${tenantId}/class/${selectedClass}/section/${selectedSection}`);
      setHomeworks(res.data || []);
    } catch (err) {
      console.error("Failed to fetch homeworks", err);
      toast.error('Error fetching homework assignments');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedSection || !formData.subject_id) {
      toast.info('Please select class, section and subject');
      return;
    }

    try {
      const payload = {
        tenant_id: tenantId,
        class_id: selectedClass,
        section_id: selectedSection,
        subject_id: formData.subject_id,
        staff_id: staffId,
        title: formData.title,
        description: formData.description,
        homework_date: new Date(formData.homework_date).toISOString(),
        due_date: new Date(formData.due_date).toISOString(),
        max_marks: formData.max_marks ? parseInt(formData.max_marks) : null,
        attachment_urls: formData.attachment_urls ? JSON.stringify(formData.attachment_urls.split(',')) : null
      };

      await api.post('/homeworks', payload);
      toast.success('Homework assigned successfully!');
      setDrawerOpen(false);
      fetchHomeworks();
      setFormData({ title: '', description: '', homework_date: new Date().toISOString().split('T')[0], due_date: '', subject_id: '', max_marks: '', attachment_urls: '' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to assign homework');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete Assignment?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/homeworks/${id}`);
        fetchHomeworks();
        toast.info('Homework deleted');
      } catch (err) {
        toast.error('Failed to delete homework');
      }
    }
  };

  const getSubjectName = (id: string) => subjects.find((s: any) => s.id === id)?.name || 'Subject';
  const getClassName = (id: string) => classes.find((c: any) => c.id === id)?.name || '';
  const getSectionName = (id: string) => sections.find((s: any) => s.id === id)?.name || '';

  // Filtered Homeworks
  const filteredHomeworks = useMemo(() => {
    return homeworks.filter(hw => {
      const isPast = new Date() > new Date(hw.due_date);
      if (statusFilter === 'active' && isPast) return false;
      if (statusFilter === 'past' && !isPast) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const subName = getSubjectName(hw.subject_id).toLowerCase();
      return hw.title.toLowerCase().includes(q) || subName.includes(q);
    });
  }, [homeworks, statusFilter, searchQuery, subjects]);

  // StatCards KPI Data
  const statsData: StatCardData[] = useMemo(() => {
    if (!selectedClass || !selectedSection) return [];
    const total = homeworks.length;
    const active = homeworks.filter(h => new Date() <= new Date(h.due_date)).length;
    const past = total - active;

    return [
      {
        title: 'Total Homeworks',
        value: `${total} Assignments`,
        icon: <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
        theme: 'brand'
      },
      {
        title: 'Active Assignments',
        value: `${active} Due Soon`,
        icon: <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
        theme: 'success'
      },
      {
        title: 'Past Due',
        value: `${past} Completed`,
        icon: <CheckCircle2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
        theme: 'warning'
      },
      {
        title: 'Class Target',
        value: `${getClassName(selectedClass)} - ${getSectionName(selectedSection)}`,
        icon: <FileText className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
        theme: 'sky'
      }
    ];
  }, [selectedClass, selectedSection, homeworks, classes, sections]);

  // PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    const clsName = getClassName(selectedClass);
    const secName = getSectionName(selectedSection);
    doc.text(`Homework Assignments Report - Class ${clsName} (${secName})`, 14, 15);

    const tableData: any[] = [];
    filteredHomeworks.forEach((h, idx) => {
      tableData.push([
        idx + 1,
        h.title,
        getSubjectName(h.subject_id),
        new Date(h.homework_date).toLocaleDateString(),
        new Date(h.due_date).toLocaleDateString(),
        h.max_marks ? `${h.max_marks} Pts` : 'N/A'
      ]);
    });

    autoTable(doc, {
      startY: 22,
      head: [['#', 'Title', 'Subject', 'Assigned', 'Due Date', 'Points']],
      body: tableData,
    });
    doc.save(`homework_report_${clsName}_${secName}.pdf`);
    toast.success('Homework PDF report generated');
  };

  // CSV Export
  const exportCSV = () => {
    const headers = ['#', 'Title', 'Subject', 'Assigned Date', 'Due Date', 'Points'];
    const csvRows: any[] = [];
    filteredHomeworks.forEach((h, idx) => {
      csvRows.push([
        idx + 1,
        h.title.replace(/,/g, ' '),
        getSubjectName(h.subject_id).replace(/,/g, ' '),
        new Date(h.homework_date).toLocaleDateString(),
        new Date(h.due_date).toLocaleDateString(),
        h.max_marks ? `${h.max_marks}` : 'N/A'
      ]);
    });
    const csvContent = [headers, ...csvRows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `homework_report.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Homework CSV report downloaded');
  };

  return (
    <div className="w-full max-w-full space-y-6">
      {/* Top Breadcrumb Navigation */}
      <Breadcrumb items={[
        { label: 'LMS Portal', href: '/lms' },
        { label: 'Homework & Assignments' }
      ]} />

      {/* Header Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-500" />
              Homework & Assignments
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create, schedule, and distribute homework assignments to student classes.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button 
              onClick={exportPDF} 
              disabled={homeworks.length === 0} 
              className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors h-11 flex items-center justify-center disabled:opacity-40" 
              title="Export PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button 
              onClick={exportCSV} 
              disabled={homeworks.length === 0} 
              className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition-colors h-11 flex items-center justify-center disabled:opacity-40" 
              title="Export CSV"
            >
              CSV
            </button>
            <button 
              onClick={() => setDrawerOpen(true)} 
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all h-11 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Assign Homework
            </button>
          </div>
        </div>
      </div>

      {/* Class & Section Selection Form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2 block">
              Target Class *
            </label>
            <SearchableSelect
              options={classes.map(c => ({ value: c.id, label: c.name }))}
              placeholder="Select Class"
              value={selectedClass}
              onChange={setSelectedClass}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2 block">
              Target Section *
            </label>
            <SearchableSelect
              options={sections.map(s => ({ value: s.id, label: s.name }))}
              placeholder="Select Section"
              value={selectedSection}
              onChange={setSelectedSection}
              disabled={!selectedClass}
            />
          </div>
        </div>
      </div>

      {/* KPI Stats Summary */}
      {selectedClass && selectedSection && (
        <StatCards stats={statsData} loading={loading} />
      )}

      {/* Main Homework List */}
      {selectedClass && selectedSection && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          
          {/* Controls Bar: Search & Status Filters */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Filter by title or subject..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                All ({homeworks.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'active' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Active Due
              </button>
              <button
                onClick={() => setStatusFilter('past')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'past' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Past Due
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-44 bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-800" />
              ))}
            </div>
          ) : filteredHomeworks.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
              <h4 className="text-base font-bold text-gray-700 dark:text-gray-300">No Assignments Found</h4>
              <p className="text-xs mt-1">No active homework found matching your selected class & filter.</p>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHomeworks.map(hw => {
                const isPast = new Date() > new Date(hw.due_date);

                return (
                  <div key={hw.id} className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
                    <div className={`absolute top-0 left-0 bottom-0 w-1.5 rounded-l-2xl ${isPast ? 'bg-amber-500' : 'bg-blue-600'}`} />

                    <div className="pl-2 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-extrabold border border-blue-100 dark:border-blue-800">
                          {getSubjectName(hw.subject_id)}
                        </span>

                        <button 
                          onClick={() => handleDelete(hw.id)} 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete Homework"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="font-extrabold text-lg text-gray-900 dark:text-white leading-tight truncate" title={hw.title}>
                        {hw.title}
                      </h3>

                      <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2" dangerouslySetInnerHTML={{ __html: hw.description || 'No description provided.' }} />
                    </div>

                    <div className="pl-2 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2 text-xs font-semibold">
                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          Assigned: {new Date(hw.homework_date).toLocaleDateString()}
                        </span>
                        {hw.max_marks && (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                            {hw.max_marks} Pts
                          </span>
                        )}
                      </div>

                      <div className={`flex items-center gap-1.5 font-bold ${isPast ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        Due: {new Date(hw.due_date).toLocaleDateString()} {isPast && '(Past Due)'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Guidance Placeholder when no Class & Section Selected */}
      {(!selectedClass || !selectedSection) && (
        <div className="flex flex-col items-center justify-center p-14 bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Select Class and Section</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
            Choose a target class and section from the controls above to view assigned homework, student submissions, or assign new coursework.
          </p>
        </div>
      )}

      {/* Slide-over Drawer for Assigning Homework */}
      <ProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Assign New Homework"
      >
        <form onSubmit={handleSubmit} className="space-y-5 p-2">
          <div>
            <Label required>Assignment Title</Label>
            <InputField 
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })} 
              placeholder="e.g. Mathematics Chapter 4 Algebra Exercises" 
              required 
            />
          </div>

          <div>
            <Label required>Subject</Label>
            <SearchableSelect 
              options={subjects.map(s => ({ value: s.id, label: s.name }))} 
              placeholder="Select Subject..." 
              value={formData.subject_id} 
              onChange={val => setFormData({ ...formData, subject_id: val as string })} 
            />
          </div>

          <div>
            <RichTextEditor
              label="Instructions & Description"
              value={formData.description}
              onChange={val => setFormData({ ...formData, description: val })}
              placeholder="Provide detailed assignment guidelines, page numbers, or requirements..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <DatePicker 
                label="Assign Date *" 
                value={formData.homework_date} 
                onChange={e => setFormData({ ...formData, homework_date: e.target.value })} 
                required 
              />
            </div>
            <div>
              <DatePicker 
                label="Due Date *" 
                value={formData.due_date} 
                onChange={e => setFormData({ ...formData, due_date: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div>
            <Label>Max Points / Marks</Label>
            <InputField 
              type="number" 
              value={formData.max_marks} 
              onChange={e => setFormData({ ...formData, max_marks: e.target.value })} 
              placeholder="e.g. 100" 
            />
          </div>

          <div>
            <Label className="flex items-center gap-1.5 mb-1.5">
              <Paperclip className="w-4 h-4 text-blue-500" /> Attachment Files or Drive Links
            </Label>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <InputField 
                  value={formData.attachment_urls} 
                  onChange={e => setFormData({ ...formData, attachment_urls: e.target.value })} 
                  placeholder="https://drive.google.com/..." 
                />
              </div>
              <div className="relative">
                <input type="file" id="homework-file-upload" className="hidden" onChange={handleFileUpload} />
                <label 
                  htmlFor="homework-file-upload" 
                  className="cursor-pointer flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 h-11 transition-colors text-xs font-bold"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </label>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
            >
              Assign Homework
            </Button>
          </div>
        </form>
      </ProfileDrawer>

    </div>
  );
}

