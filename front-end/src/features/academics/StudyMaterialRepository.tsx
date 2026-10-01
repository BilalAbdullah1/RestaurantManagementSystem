import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import Input from '../../components/form/input/InputField';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { BookOpen, FileText, Video, Download, ExternalLink, Plus, Filter, PlayCircle, Upload } from 'lucide-react';
import { DataTable } from '../../components/ui/table/DataTable';

interface StudyMaterial {
  id?: string;
  tenant_id: string;
  class_id: string;
  subject_id: string;
  title: string;
  description?: string;
  material_type: string;
  file_url?: string;
  video_url?: string;
  uploaded_by?: string;
  class_name?: string;
  subject_name?: string;
  created_at?: string;
}

interface SchoolClass { id: string; name: string; }
interface Subject { id: string; name: string; }

const MATERIAL_TYPE_OPTIONS = [
  { value: 'Notes', label: '📄 Lecture Notes' },
  { value: 'Past Paper', label: '📝 Past Paper / Worksheet' },
  { value: 'Video', label: '🎥 Video Tutorial / Lecture' },
  { value: 'Book', label: '📚 Reference E-Book' },
];

export default function StudyMaterialRepository() {
  const tenantId = localStorage.getItem('tenantId') || '';
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<StudyMaterial>({
    tenant_id: tenantId,
    class_id: '',
    subject_id: '',
    title: '',
    description: '',
    material_type: 'Notes',
    file_url: '',
    video_url: '',
    uploaded_by: 'Staff',
  });

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
      setFormData(prev => ({ ...prev, file_url: newUrl }));
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'File Uploaded Successfully', timer: 2000, showConfirmButton: false });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'File upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!tenantId) return;
    fetchData();
  }, [tenantId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matRes, classesRes, subjectsRes] = await Promise.all([
        api.get(`/studymaterials/tenant/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`/classes/tenant/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`/subjects/tenant/${tenantId}`).catch(() => ({ data: [] })),
      ]);
      setMaterials(Array.isArray(matRes.data) ? matRes.data : []);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
    } catch (err) {
      console.error('Failed to load study materials', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddDrawer = () => {
    setFormData({
      tenant_id: tenantId,
      class_id: classes[0]?.id || '',
      subject_id: subjects[0]?.id || '',
      title: '',
      description: '',
      material_type: 'Notes',
      file_url: '',
      video_url: '',
      uploaded_by: 'Staff Teacher',
    });
    setDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/studymaterials', formData);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Material Uploaded', timer: 2000, showConfirmButton: false });
      setDrawerOpen(false);
      fetchData();
    } catch (err) {
      Swal.fire('Error', 'Failed to upload material.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (mat: StudyMaterial) => {
    const res = await Swal.fire({
      title: 'Delete Material?',
      text: `Remove "${mat.title}" from library?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
    });
    if (!res.isConfirmed) return;
    try {
      await api.delete(`/studymaterials/${mat.id}`);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Deleted', timer: 1500, showConfirmButton: false });
      fetchData();
    } catch (err) {
      Swal.fire('Error', 'Failed to delete.', 'error');
    }
  };

  const getEmbedVideoUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url;
  };

  const totalMaterials = materials.length;
  const notesCount = materials.filter(m => m.material_type === 'Notes').length;
  const pastPapersCount = materials.filter(m => m.material_type === 'Past Paper').length;
  const videosCount = materials.filter(m => m.material_type === 'Video').length;

  const stats: StatCardData[] = [
    { title: 'Total Repository Files', value: totalMaterials, icon: <BookOpen className="w-5 h-5 text-indigo-500" />, theme: 'indigo' },
    { title: 'Lecture Notes', value: notesCount, icon: <FileText className="w-5 h-5 text-blue-500" />, theme: 'brand' },
    { title: 'Past Papers', value: pastPapersCount, icon: <Download className="w-5 h-5 text-emerald-500" />, theme: 'success' },
    { title: 'Video Tutorials', value: videosCount, icon: <Video className="w-5 h-5 text-rose-500" />, theme: 'error' },
  ];

  const columns = useMemo<ColumnDef<StudyMaterial>[]>(() => [
    {
      accessorKey: 'title',
      header: 'Resource Title',
      cell: info => {
        const mat = info.row.original;
        return (
          <div>
            <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {mat.material_type === 'Video' ? <Video className="w-4 h-4 text-rose-500" /> : <FileText className="w-4 h-4 text-indigo-500" />}
              {mat.title}
            </span>
            {mat.description && <p className="text-xs text-gray-400 truncate max-w-xs">{mat.description}</p>}
          </div>
        );
      },
    },
    {
      accessorKey: 'material_type',
      header: 'Type',
      cell: info => {
        const type = info.getValue() as string;
        const color = type === 'Video' ? 'error' : type === 'Notes' ? 'info' : type === 'Past Paper' ? 'success' : 'warning';
        return <Badge variant="light" color={color} size="sm">{type}</Badge>;
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
      accessorKey: 'file_url',
      header: 'Access Resource',
      cell: info => {
        const mat = info.row.original;
        if (mat.video_url) {
          return (
            <button
              onClick={() => setVideoModalUrl(getEmbedVideoUrl(mat.video_url))}
              className="px-3 py-1 bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100 transition-colors"
            >
              <PlayCircle className="w-4 h-4" /> Watch Video
            </button>
          );
        }
        if (mat.file_url) {
          return (
            <a
              href={mat.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Resource
            </a>
          );
        }
        return <span className="text-xs text-gray-400">No Attachment</span>;
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
                { label: 'Delete Resource', icon: <Download className="w-4 h-4" />, onClick: () => handleDelete(info.row.original), isDanger: true }
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Study Material Digital Repository</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload and organize notes, past papers, worksheets, and video lectures.</p>
        </div>
        <Button variant="primary" onClick={openAddDrawer}>
          <Plus className="w-4 h-4 mr-2" /> Upload Material
        </Button>
      </div>

      {/* Stat Cards */}
      <StatCards stats={stats} loading={loading} />

      {/* Table */}
      <DataTable
        loading={loading}
        data={materials}
        columns={columns}
        searchPlaceholder="Search materials by title, subject, or class..."
        emptyMessage="No study materials in repository."
        exportable={true}
        exportFilename="study_materials_list"
      />

      {/* Video Modal */}
      {videoModalUrl && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-black rounded-2xl overflow-hidden w-full max-w-3xl aspect-video relative shadow-2xl">
            <button
              onClick={() => setVideoModalUrl(null)}
              className="absolute top-3 right-3 z-10 px-3 py-1 bg-white/20 hover:bg-white/40 text-white rounded-full text-xs font-bold"
            >
              ✕ Close
            </button>
            <iframe src={videoModalUrl} className="w-full h-full" allowFullScreen allow="autoplay" title="Video Lecture" />
          </div>
        </div>
      )}

      {/* Drawer */}
      <ProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Upload Study Material"
        subtitle="Share lecture notes, worksheets or video links with students"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label>Resource Title *</Label>
            <Input
              type="text"
              required
              placeholder="e.g. Physics Chapter 3 Comprehensive Notes"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <SearchableSelect
              label="Material Type *"
              options={MATERIAL_TYPE_OPTIONS}
              value={formData.material_type}
              onChange={val => setFormData({ ...formData, material_type: val as string })}
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

          {formData.material_type === 'Video' ? (
            <div>
              <Label>Video Lecture Link (YouTube / Vimeo / Google Drive)</Label>
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.video_url || ''}
                onChange={e => setFormData({ ...formData, video_url: e.target.value })}
              />
            </div>
          ) : (
            <div>
              <Label>Resource File Attachment (Upload File or Paste Link)</Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://drive.google.com/file/... or upload local file"
                  value={formData.file_url || ''}
                  onChange={e => setFormData({ ...formData, file_url: e.target.value })}
                />
                <div className="relative shrink-0">
                  <input type="file" id="material-file-upload" className="hidden" onChange={handleFileUpload} />
                  <label 
                    htmlFor="material-file-upload" 
                    className="cursor-pointer flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 h-11 transition-colors whitespace-nowrap text-sm font-bold gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </label>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label>Resource Description / Topics Covered</Label>
            <textarea
              rows={3}
              placeholder="Brief description of the material..."
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
              loadingText="Uploading..."
              className="flex-1"
            >
              Publish Material
            </Button>
          </div>
        </form>
      </ProfileDrawer>
    </div>
  );
}
