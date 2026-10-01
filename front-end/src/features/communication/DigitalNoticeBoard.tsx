import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import Input from '../../components/form/input/InputField';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { X, Bell, Pin, Trash2, Calendar, Tag } from 'lucide-react';
import SearchableSelect, { SearchableSelectOption } from '../../components/form/select/SearchableSelect';

interface Notice {
  id: string;
  tenant_id: string;
  title: string;
  content: string;
  category: 'Academic' | 'Holiday' | 'Urgent' | 'Events';
  target_audience: string;
  attachment_url?: string;
  posted_by: string;
  created_at: string;
}

export default function DigitalNoticeBoard() {
  const tenantId = localStorage.getItem("tenantId") || "";
  const [searchParams] = useSearchParams();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Academic',
    target_audience: 'All',
    posted_by: 'Principal Office'
  });

  const fetchNotices = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await api.get<Notice[]>(`/notices/tenant/${tenantId}`);
      setNotices(res.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to load digital notice board.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [tenantId]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setDrawerOpen(true);
    }
  }, [searchParams]);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      Swal.fire('Required', 'Please fill in the title and content of the notice.', 'warning');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/notices', {
        tenant_id: tenantId,
        title: formData.title,
        content: formData.content,
        category: formData.category,
        target_audience: formData.target_audience,
        posted_by: formData.posted_by
      });

      Swal.fire('Published!', 'Notice published to Digital Notice Board.', 'success');
      setDrawerOpen(false);
      setFormData({
        title: '',
        content: '',
        category: 'Academic',
        target_audience: 'All',
        posted_by: 'Principal Office'
      });
      fetchNotices();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Could not publish notice.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    const result = await Swal.fire({
      title: 'Remove Notice?',
      text: 'Are you sure you want to delete this notice from the board?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/notices/${id}`);
        Swal.fire('Deleted!', 'Notice removed.', 'success');
        fetchNotices();
      } catch (err) {
        Swal.fire('Error', 'Failed to delete notice.', 'error');
      }
    }
  };

  const categoryOptions: SearchableSelectOption[] = [
    { value: 'Academic', label: '📖 Academic & Examinations' },
    { value: 'Holiday', label: '🏖️ School Holiday Announcement' },
    { value: 'Urgent', label: '🚨 Urgent Notice' },
    { value: 'Events', label: '🎉 Sports & Cultural Events' },
  ];

  const filteredNotices = notices.filter(n => {
    const matchesCat = selectedCategory === 'All' || n.category === selectedCategory;
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'Urgent': return 'error';
      case 'Holiday': return 'warning';
      case 'Events': return 'success';
      default: return 'primary';
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* BREADCRUMB & HEADER */}
      <div>
        <Breadcrumb items={[{ label: 'Communication & Helpdesk', href: '#' }, { label: 'Digital Notice Board' }]} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Digital Notice Board</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Official announcements, holiday notices, and circulars broadcasted from the Principal Office.</p>
          </div>
          <Button variant="primary" onClick={() => setDrawerOpen(true)}>
            + Post Digital Notice
          </Button>
        </div>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          {['All', 'Academic', 'Holiday', 'Urgent', 'Events'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-64">
          <Input 
            type="text"
            placeholder="Search notice titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* NOTICES GRID */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <Bell className="w-12 h-12 text-brand-500 mx-auto mb-3 opacity-70" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">No Notices Published Yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto mb-4">
            Broadcast official circulars, examination schedules, public holidays, or sports event announcements to the digital board.
          </p>
          <Button variant="primary" size="sm" onClick={() => setDrawerOpen(true)}>
            + Post First Notice
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotices.map((notice) => (
            <div key={notice.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative group">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="light" color={getCategoryBadgeColor(notice.category) as any}>
                    {notice.category}
                  </Badge>
                  <button 
                    onClick={() => handleDeleteNotice(notice.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-opacity"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-start gap-2">
                  <Pin className="w-4 h-4 text-brand-500 shrink-0 mt-1" />
                  {notice.title}
                </h3>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {notice.content}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-brand-500" />
                  {notice.posted_by}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(notice.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FIXED SLIDE-OVER DRAWER FOR POSTING NOTICES */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[999]" onClick={() => setDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[1000] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-brand-500" />
                Post Digital Notice
              </h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="noticeForm" onSubmit={handleCreateNotice} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Notice Title *</label>
                  <Input 
                    type="text"
                    required
                    placeholder="e.g. Mid-Term Examination Date Sheet Announcement"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <SearchableSelect
                    label="Notice Category *"
                    options={categoryOptions}
                    value={formData.category}
                    onChange={(val) => setFormData({ ...formData, category: val })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Notice Announcement Content *</label>
                  <textarea 
                    rows={6}
                    required
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    placeholder="Write detailed circular text..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Posted By</label>
                  <Input 
                    type="text"
                    value={formData.posted_by}
                    onChange={(e) => setFormData({ ...formData, posted_by: e.target.value })}
                  />
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
              <Button type="submit" form="noticeForm" variant="primary" disabled={submitLoading}>
                {submitLoading ? 'Publishing...' : 'Publish to Board'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
