import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import { Calendar, Plus, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Button from '../../components/ui/button/Button';
import InputField from '../../components/form/input/InputField';
import DatePicker from '../../components/form/date-picker';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import Label from '../../components/form/Label';
import { Modal } from '../../components/ui/modal';
import Swal from 'sweetalert2';

export default function StudentLeaveApplication() {
  const tenantId = localStorage.getItem("tenantId") || "";
  const studentId = localStorage.getItem("userId") || "";

  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    leave_type: 'Sick Leave',
    start_date: '',
    end_date: '',
    reason: '',
    attachment_url: ''
  });
  
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, [tenantId, studentId]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/leaveapplications/tenant/${tenantId}/student/${studentId}`);
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch leaves', 'error');
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
      setFormData({ ...formData, attachment_url: newUrl });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'File upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/leaveapplications', {
        tenant_id: tenantId,
        student_id: studentId,
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
        attachment_url: formData.attachment_url
      });
      Swal.fire('Success', 'Leave application submitted successfully', 'success');
      setModalOpen(false);
      setFormData({ leave_type: 'Sick Leave', start_date: '', end_date: '', reason: '', attachment_url: '' });
      fetchLeaves();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to submit application', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"><Clock className="w-3.5 h-3.5" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Student Leave Applications Desk</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Apply for student leaves and view application status.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Apply Student Leave
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Dates</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Approver Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading applications...</td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                      <p>No leave applications found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                leaves.map((leave, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{leave.leave_type}</div>
                      <div className="text-xs text-gray-500">Applied: {new Date(leave.applied_on).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 dark:text-white">{new Date(leave.start_date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">to {new Date(leave.end_date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="truncate text-gray-700 dark:text-gray-300" title={leave.reason}>{leave.reason}</p>
                      {leave.attachment_url && (
                        <a href={leave.attachment_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">View Attachment</a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(leave.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 italic">
                      {leave.approver_notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} className="max-w-lg">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Apply for Leave</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <SearchableSelect
              label="Leave Type *"
              options={[
                { value: 'Sick Leave', label: 'Sick Leave' },
                { value: 'Casual Leave', label: 'Casual Leave' },
                { value: 'Urgent Work', label: 'Urgent Work' },
                { value: 'Other', label: 'Other' },
              ]}
              value={formData.leave_type}
              onChange={(val) => setFormData({ ...formData, leave_type: val as string })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <DatePicker label="Start Date *" value={formData.start_date} onChange={(e: any) => setFormData({...formData, start_date: e.target.value})} required />
            </div>
            <div>
              <DatePicker label="End Date *" value={formData.end_date} onChange={(e: any) => setFormData({...formData, end_date: e.target.value})} required />
            </div>
          </div>

          <div>
            <Label required>Reason</Label>
            <textarea 
              className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm dark:text-white"
              rows={3}
              value={formData.reason}
              onChange={e => setFormData({...formData, reason: e.target.value})}
              required
              placeholder="Please provide a detailed reason..."
            />
          </div>

          <div>
            <Label>Attachment (Optional)</Label>
            <div className="flex gap-2">
              <InputField 
                value={formData.attachment_url} 
                onChange={e => setFormData({...formData, attachment_url: e.target.value})} 
                placeholder="Medical certificate URL" 
              />
              <div className="relative">
                <input type="file" id="leave-file" className="hidden" onChange={handleFileUpload} />
                <label htmlFor="leave-file" className="cursor-pointer flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg px-4 h-11 transition-colors whitespace-nowrap text-sm font-medium">
                  {uploading ? 'Uploading...' : 'Upload'}
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Submit Application</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
