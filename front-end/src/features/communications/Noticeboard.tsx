import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Input from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import DatePicker from '../../components/form/date-picker';
import Label from '../../components/form/Label';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import StatCards, { StatCardItem } from '../../components/ui/UIDesigns/StatCards';
import { getUserRoleName } from '../../utils/authUtils';
import { Plus, Edit3, Trash2, Megaphone, Bell, Calendar, Eye, ShieldAlert, CheckCircle } from 'lucide-react';

interface Notice {
  id?: string;
  tenant_id: string;
  title: string;
  content: string;
  category?: string;
  target_audience: string; // All, Students, Teachers, Parents, Staff
  priority: string; // Normal, High, Urgent
  attachment_url?: string | null;
  posted_by?: string;
  is_active: boolean;
  published_at?: string;
  expires_at?: string | null;
  created_at?: string;
}

const initialFormState = (tenantId: string): Notice => ({
  tenant_id: tenantId,
  title: '',
  content: '',
  category: 'Normal',
  target_audience: 'All',
  priority: 'Normal',
  posted_by: 'Principal Office',
  is_active: true,
  expires_at: null
});

export default function Noticeboard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  const tenantId = localStorage.getItem("tenantId") || "";
  const roleName = getUserRoleName() || localStorage.getItem("roleName") || "";
  const isAdmin = roleName === "Admin";

  const [formData, setFormData] = useState<Notice>(initialFormState(tenantId));

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    fetchNotices();
  }, [tenantId]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      // If admin, fetch all notices. Otherwise fetch only active ones.
      const endpoint = isAdmin ? `/notices/tenant/${tenantId}` : `/notices/active/tenant/${tenantId}`;
      const response = await api.get<Notice[]>(endpoint);
      
      // Ensure priority/category are mapped cleanly
      const mapped = response.data.map(n => ({
        ...n,
        priority: n.priority || n.category || 'Normal'
      }));
      setNotices(mapped);
    } catch (err: any) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Unable to Load Notices', 
        text: 'Something went wrong while retrieving announcements.', 
        confirmButtonColor: '#ef4444' 
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddView = () => {
    setEditingNotice(null);
    setFormData(initialFormState(tenantId));
    setView('form');
  };

  const openEditView = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      ...notice,
      priority: notice.priority || notice.category || 'Normal',
      expires_at: notice.expires_at ? notice.expires_at.split('T')[0] : null
    });
    setView('form');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const payload = {
        ...formData,
        category: formData.priority || formData.category || 'Normal',
        posted_by: formData.posted_by || 'Principal Office',
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null
      };

      if (editingNotice && editingNotice.id) {
        await api.put(`/notices/${editingNotice.id}`, payload);
        Swal.fire({ icon: 'success', title: 'Bulletin Updated', timer: 2000, showConfirmButton: false });
      } else {
        await api.post('/notices', payload);
        Swal.fire({ icon: 'success', title: 'Bulletin Published', timer: 2000, showConfirmButton: false });
      }
      setView('list');
      fetchNotices();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Unable to Save', text: err.response?.data?.message || 'Please review the fields and try again.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteNotice = async (notice: Notice) => {
    const result = await Swal.fire({
      title: 'Delete Notice?',
      text: 'Are you sure you want to permanently remove this bulletin announcement?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Delete'
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/notices/${notice.id}`);
      Swal.fire({ icon: 'success', title: 'Deleted', timer: 1500, showConfirmButton: false });
      fetchNotices();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Unable to Delete', text: err.response?.data?.message });
    }
  };

  const filteredNotices = useMemo(() => {
    return notices.filter(n => {
      const matchesSearch = (n.title || '').toLowerCase().includes(searchKeyword.toLowerCase()) || 
                            (n.content || '').toLowerCase().includes(searchKeyword.toLowerCase());
      const matchesAudience = audienceFilter === 'All' || (n.target_audience || '').toLowerCase() === audienceFilter.toLowerCase();
      const matchesPriority = priorityFilter === 'All' || (n.priority || '').toLowerCase() === priorityFilter.toLowerCase();

      return matchesSearch && matchesAudience && matchesPriority;
    });
  }, [notices, searchKeyword, audienceFilter, priorityFilter]);

  const activeCount = useMemo(() => {
    const now = new Date();
    return notices.filter(n => n.is_active && (!n.expires_at || new Date(n.expires_at) > now)).length;
  }, [notices]);

  const urgentCount = useMemo(() => {
    return notices.filter(n => {
      const p = (n.priority || '').toLowerCase();
      return p === 'urgent' || p === 'high';
    }).length;
  }, [notices]);

  const getPriorityColor = (priority: string) => {
    switch ((priority || '').toLowerCase()) {
      case 'urgent': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-900/30';
      case 'high': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-900/30';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-800/30';
    }
  };

  const getAudienceColor = (audience: string) => {
    switch ((audience || '').toLowerCase()) {
      case 'teachers': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'students': return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
      case 'parents': return 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400';
      case 'staff': return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const statCardsData: StatCardItem[] = [
    { title: 'Total Announcements', value: notices.length.toString(), icon: <Megaphone className="w-5 h-5 text-brand-500" />, theme: 'brand' },
    { title: 'Active Bulletins', value: activeCount.toString(), icon: <CheckCircle className="w-5 h-5 text-success-500" />, theme: 'success' },
    { title: 'Urgent & High Priority', value: urgentCount.toString(), icon: <ShieldAlert className="w-5 h-5 text-error-500" />, theme: 'error' },
  ];

  return (
    <div className="w-full space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-brand-500" /> Bulletin Noticeboard
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View and manage notifications for teachers, students, and parents.</p>
        </div>
        {view === 'list' && isAdmin && (
          <Button variant="primary" onClick={openAddView}>
            + Add Announcement
          </Button>
        )}
        {view === 'form' && (
          <Button variant="outline" onClick={() => setView('list')}>← Back to Noticeboard</Button>
        )}
      </div>

      {view === 'list' && (
        <div className="space-y-6">

          {/* DYNAMIC KPI SUMMARY PANEL */}
          <StatCards stats={statCardsData} loading={loading} />

          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
            
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              
              {/* Audience Filters */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                {['All', 'Students', 'Teachers', 'Parents', 'Staff'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setAudienceFilter(tab)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      audienceFilter === tab 
                        ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {tab === 'All' ? 'Everyone' : tab}
                  </button>
                ))}
              </div>

              {/* Priority Filters */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                {['All', 'Normal', 'High', 'Urgent'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setPriorityFilter(tab)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      priorityFilter === tab 
                        ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm' 
                        : 'text-gray-505 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {tab} Priority
                  </button>
                ))}
              </div>

            </div>

            {/* Keyword Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search notices by keyword, title, or details..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>

          </div>

          {/* NOTICES BULLETIN BOARD GRID */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-[2rem] p-6" />
              ))}
            </div>
          ) : filteredNotices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredNotices.map((notice) => {
                const priorityLower = (notice.priority || '').toLowerCase();
                const isUrgent = priorityLower === 'urgent';
                const isHigh = priorityLower === 'high';
                const isExpired = notice.expires_at && new Date(notice.expires_at) < new Date();
                
                return (
                  <div
                    key={notice.id}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-[2rem] p-1 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:z-10 ${
                      isExpired ? 'opacity-60 grayscale-[50%]' : ''
                    }`}
                  >
                    {/* Animated Gradient Border Wrapper */}
                    <div className={`absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-100 ${
                      isUrgent ? 'bg-gradient-to-br from-red-500 via-rose-400 to-orange-400' :
                      isHigh ? 'bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-500' :
                      'bg-gradient-to-br from-brand-400 via-blue-500 to-indigo-500'
                    }`} />
                    
                    {/* Inner Card Content */}
                    <div className="relative flex h-full flex-col justify-between rounded-[1.8rem] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-6 shadow-inner">
                      
                      {/* Decorative Pin / Tape */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full shadow-sm border border-gray-200/50 dark:border-gray-700/50 z-20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 shadow-inner" />
                      </div>

                      <div className="space-y-4 pt-2">
                        {/* Priority and Target Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm ${getAudienceColor(notice.target_audience)}`}>
                            {notice.target_audience}
                          </span>
                          
                          <div className="flex items-center gap-1.5">
                            {isUrgent && !isExpired && (
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                              </span>
                            )}
                            <span className={`px-2.5 py-1 border rounded-lg text-[10px] font-bold shadow-sm ${getPriorityColor(notice.priority)}`}>
                              {notice.priority}
                            </span>
                          </div>
                        </div>

                        {/* Title & Body */}
                        <div className="relative z-10">
                          <h4 className={`text-xl font-extrabold line-clamp-2 leading-tight ${
                            isUrgent ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500 dark:from-red-400 dark:to-rose-300' :
                            isHigh ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500 dark:from-amber-400 dark:to-orange-300' :
                            'text-gray-900 dark:text-white'
                          }`}>
                            {notice.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 whitespace-pre-wrap line-clamp-4 leading-relaxed font-medium">
                            {notice.content}
                          </p>
                        </div>
                      </div>

                      {/* Footer Metadata */}
                      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/50 flex flex-col gap-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <span>Published: {notice.published_at ? new Date(notice.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Today'}</span>
                        </div>
                        {notice.expires_at && (
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-md ${isExpired ? 'bg-red-50 text-red-500 dark:bg-red-500/10' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                              <Eye className="w-3.5 h-3.5" />
                            </div>
                            <span className={isExpired ? 'text-red-500' : ''}>
                              {isExpired ? 'Expired: ' : 'Valid until: '}
                              {new Date(notice.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Admin Action Menu Portal */}
                      {isAdmin && (
                        <div className="absolute top-4 right-4 z-20">
                          <ActionMenu
                            items={[
                              {
                                label: 'Edit Bulletin',
                                icon: <Edit3 className="w-4 h-4" />,
                                onClick: () => openEditView(notice)
                              },
                              {
                                label: 'Delete Announcement',
                                icon: <Trash2 className="w-4 h-4" />,
                                onClick: () => deleteNotice(notice),
                                isDanger: true
                              }
                            ]}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">No Announcements Found</h3>
              <p className="text-sm text-gray-500 mt-1 mb-6">There are no active bulletins match your filter selection.</p>
              {isAdmin && (
                <Button variant="primary" onClick={openAddView}><Plus className="w-4 h-4" /> Add Notice</Button>
              )}
            </div>
          )}

        </div>
      )}

      {/* FORM VIEW */}
      {view === 'form' && (
        <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            
            {/* Header */}
            <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingNotice ? 'Edit Bulletin details' : 'Publish New Bulletin'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Fill in details to post an announcement on the school board.</p>
              </div>
            </div>

            {/* Inputs */}
            <div className="p-8 space-y-5">
              
              <div>
                <Label required>Bulletin Title</Label>
                <Input
                  type="text" required
                  placeholder="e.g. Mid-Term Examination Datesheet"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <Label required>Detailed Message Content</Label>
                <textarea
                  required
                  rows={6}
                  placeholder="Write the details of the announcement here..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <SearchableSelect
                    label="Target Audience"
                    value={formData.target_audience}
                    options={[
                      { value: 'All', label: 'Everyone' },
                      { value: 'Students', label: 'Students Only' },
                      { value: 'Teachers', label: 'Teachers Only' },
                      { value: 'Parents', label: 'Parents Only' },
                      { value: 'Staff', label: 'Non-Teaching Staff' },
                    ]}
                    onChange={(val) => setFormData({ ...formData, target_audience: val })}
                  />
                </div>

                <div>
                  <SearchableSelect
                    label="Priority"
                    value={formData.priority}
                    options={[
                      { value: 'Normal', label: 'Normal' },
                      { value: 'High', label: 'High' },
                      { value: 'Urgent', label: 'Urgent' },
                    ]}
                    onChange={(val) => setFormData({ ...formData, priority: val })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <DatePicker
                    label="Expiry Date (Optional)"
                    placeholder="Select expiry date"
                    value={formData.expires_at || ''}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value ? e.target.value : null })}
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4.5 h-4.5 rounded border-gray-300 text-brand-650 focus:ring-brand-500"
                    />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Publish immediately</span>
                  </label>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="px-8 py-5 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setView('list')}>Cancel</Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitLoading}
                loadingText="Publishing..."
                className="min-w-[120px]"
              >
                Publish Bulletin
              </Button>
            </div>
          </div>
        </form>
      )}

    </div>
  );
}
