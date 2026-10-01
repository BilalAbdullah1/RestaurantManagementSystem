import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import Input from '../../components/form/input/InputField';
import SearchableSelect, { SearchableSelectOption } from '../../components/form/select/SearchableSelect';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { X, MessageSquareHeart, ShieldCheck, CheckCircle } from 'lucide-react';

interface FeedbackSuggestion {
  id: string;
  tenant_id: string;
  is_anonymous: boolean;
  submitted_by_name?: string;
  category: string;
  subject: string;
  feedback_text: string;
  admin_response?: string;
  status: 'Under Review' | 'Reviewed' | 'Action Taken';
  created_at: string;
}

export default function FeedbackSuggestionsManager() {
  const tenantId = localStorage.getItem("tenantId") || "";
  const [searchParams] = useSearchParams();

  const [feedbacks, setFeedbacks] = useState<FeedbackSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [respondModalOpen, setRespondModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FeedbackSuggestion | null>(null);

  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    is_anonymous: true,
    submitted_by_name: '',
    category: 'General',
    subject: '',
    feedback_text: ''
  });

  const [responseForm, setResponseForm] = useState({
    status: 'Reviewed',
    admin_response: ''
  });

  const fetchFeedbacks = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await api.get<FeedbackSuggestion[]>(`/feedbacksuggestions/tenant/${tenantId}`);
      setFeedbacks(res.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to load feedback box entries.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [tenantId]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setDrawerOpen(true);
    }
  }, [searchParams]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.feedback_text) {
      Swal.fire('Required', 'Subject and Feedback details are required.', 'warning');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/feedbacksuggestions', {
        tenant_id: tenantId,
        is_anonymous: formData.is_anonymous,
        submitted_by_name: formData.is_anonymous ? 'Anonymous Stakeholder' : formData.submitted_by_name,
        category: formData.category,
        subject: formData.subject,
        feedback_text: formData.feedback_text
      });

      Swal.fire('Submitted!', 'Your feedback has been delivered securely to the Principal Office box.', 'success');
      setDrawerOpen(false);
      setFormData({
        is_anonymous: true,
        submitted_by_name: '',
        category: 'General',
        subject: '',
        feedback_text: ''
      });
      fetchFeedbacks();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Could not submit feedback.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitLoading(true);
    try {
      await api.put(`/feedbacksuggestions/${selectedItem.id}/respond`, {
        status: responseForm.status,
        admin_response: responseForm.admin_response
      });

      Swal.fire('Recorded!', 'Principal Office response saved.', 'success');
      setRespondModalOpen(false);
      setSelectedItem(null);
      fetchFeedbacks();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to save response.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const categoryOptions: SearchableSelectOption[] = [
    { value: 'Academic Quality', label: '📖 Academic & Teaching Quality' },
    { value: 'Infrastructure', label: '🍽️ Dining & Kitchen Facilities' },
    { value: 'Discipline', label: '🛡️ Student Discipline & Behavior' },
    { value: 'General', label: '💡 General Restaurant Suggestion' },
  ];

  return (
    <div className="w-full space-y-6">
      
      {/* BREADCRUMB & HEADER */}
      <div>
        <Breadcrumb items={[{ label: 'Communication & Helpdesk', href: '#' }, { label: 'Anonymous Feedback & Suggestion Box' }]} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquareHeart className="w-7 h-7 text-purple-600" />
              Principal Office Feedback & Suggestion Box
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Secure anonymous & identified suggestion portal directly connected to the Principal Office.</p>
          </div>
          <Button variant="primary" onClick={() => setDrawerOpen(true)} className="bg-purple-600 hover:bg-purple-700">
            + Submit Feedback / Suggestion
          </Button>
        </div>
      </div>

      {/* FEEDBACK CARDS GRID */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <MessageSquareHeart className="w-12 h-12 text-purple-600 mx-auto mb-3 opacity-70" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Suggestion Box Empty</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto mb-4">
            Stakeholders can submit confidential suggestions, facility feedback, or campus improvement ideas directly to the Principal Office.
          </p>
          <Button variant="primary" size="sm" onClick={() => setDrawerOpen(true)} className="bg-purple-600 hover:bg-purple-700">
            + Submit First Suggestion
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedbacks.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="light" color={item.status === 'Action Taken' ? 'success' : item.status === 'Reviewed' ? 'warning' : 'primary'}>
                    {item.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {item.is_anonymous ? 'ANONYMOUS' : item.submitted_by_name}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.subject}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{item.feedback_text}</p>

                {item.admin_response && (
                  <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-900/30 text-xs text-purple-900 dark:text-purple-200">
                    <p className="font-bold">Principal Remarks:</p>
                    <p className="mt-0.5">{item.admin_response}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-500">
                <span>Category: {item.category}</span>
                <button 
                  onClick={() => {
                    setSelectedItem(item);
                    setResponseForm({ status: item.status, admin_response: item.admin_response || '' });
                    setRespondModalOpen(true);
                  }}
                  className="font-bold text-purple-600 hover:text-purple-700"
                >
                  Principal Response ➔
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DRAWER FOR SUBMITTING FEEDBACK */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[999]" onClick={() => setDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[1000] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquareHeart className="w-5 h-5 text-purple-600" />
                Submit Feedback / Suggestion
              </h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="feedbackForm" onSubmit={handleSubmitFeedback} className="space-y-5">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-900/30 flex items-center justify-between">
                  <div>
                    <label className="text-sm font-bold text-purple-900 dark:text-purple-300">Submit Anonymously?</label>
                    <p className="text-xs text-purple-700 dark:text-purple-400">Your identity will remain completely confidential.</p>
                  </div>
                  <input 
                    type="checkbox"
                    className="w-5 h-5 accent-purple-600 rounded"
                    checked={formData.is_anonymous}
                    onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                  />
                </div>

                {!formData.is_anonymous && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Your Name</label>
                    <Input 
                      type="text"
                      placeholder="e.g. Tariq Mehmood"
                      value={formData.submitted_by_name}
                      onChange={(e) => setFormData({ ...formData, submitted_by_name: e.target.value })}
                    />
                  </div>
                )}

                <div>
                  <SearchableSelect
                    label="Feedback Category *"
                    options={categoryOptions}
                    value={formData.category}
                    onChange={(val) => setFormData({ ...formData, category: val })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Subject / Topic *</label>
                  <Input 
                    type="text"
                    required
                    placeholder="e.g. Suggestion for Parent-Teacher Interaction"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Feedback & Suggestion Details *</label>
                  <textarea 
                    rows={5}
                    required
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                    placeholder="Provide detailed feedback or suggestion..."
                    value={formData.feedback_text}
                    onChange={(e) => setFormData({ ...formData, feedback_text: e.target.value })}
                  />
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
              <Button type="submit" form="feedbackForm" variant="primary" className="bg-purple-600 hover:bg-purple-700" disabled={submitLoading}>
                {submitLoading ? 'Submitting...' : 'Deliver to Principal'}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* PRINCIPAL RESPONSE MODAL */}
      {respondModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Principal Office Response</h3>
              <button onClick={() => setRespondModalOpen(false)} className="text-gray-500 hover:bg-gray-100 rounded-full p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRespond} className="space-y-4">
              <div>
                <SearchableSelect
                  label="Update Action Status *"
                  options={[
                    { value: 'Under Review', label: '🟡 Under Review' },
                    { value: 'Reviewed', label: '🟣 Reviewed' },
                    { value: 'Action Taken', label: '🟢 Action Taken' },
                  ]}
                  value={responseForm.status}
                  onChange={(val) => setResponseForm({ ...responseForm, status: val })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Principal Remarks / Decision</label>
                <textarea 
                  rows={3}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  placeholder="Record official principal response..."
                  value={responseForm.admin_response}
                  onChange={(e) => setResponseForm({ ...responseForm, admin_response: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setRespondModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="bg-purple-600 hover:bg-purple-700" disabled={submitLoading}>
                  {submitLoading ? 'Recording...' : 'Save Remarks'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
