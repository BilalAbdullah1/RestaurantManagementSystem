import React, { useState } from 'react';
import api from '../../utils/axiosConfig';
import { FileUp, Calendar, Send } from 'lucide-react';
import Swal from 'sweetalert2';
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button';
import DatePicker from '../../components/form/date-picker';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import ImageUpload from '../../components/form/ImageUpload';
import { toast } from '../../components/ui/Toast';

export default function ApplyLeave() {
  const tenantId = localStorage.getItem("tenantId") || "";
  const studentId = localStorage.getItem("userId") || ""; // Or specific student ID context for parent portal

  const [formData, setFormData] = useState({
    leave_type: 'Sick',
    start_date: '',
    end_date: '',
    reason: '',
    attachment_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.start_date || !formData.end_date || !formData.reason) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/leaveapplications', {
        tenant_id: tenantId,
        student_id: studentId,
        ...formData
      });
      toast.success("Leave application submitted successfully!");
      setFormData({ leave_type: 'Sick', start_date: '', end_date: '', reason: '', attachment_url: '' });
    } catch (err) {
      toast.error("Failed to submit leave application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const leaveTypes = [
    { value: 'Sick', label: 'Sick Leave' },
    { value: 'Casual', label: 'Casual Leave' },
    { value: 'Urgent', label: 'Urgent Work' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 mt-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-brand-500" /> Apply for Leave
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Submit an online leave application for your child.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label required>Leave Type</Label>
              <SearchableSelect 
                options={leaveTypes}
                value={formData.leave_type}
                onChange={(val) => setFormData({ ...formData, leave_type: val as string })}
                placeholder="Select Type"
              />
            </div>
            <div>
              <Label>Attachment (Medical Cert. etc)</Label>
              <ImageUpload 
                onChange={(url: any) => setFormData({ ...formData, attachment_url: url })}
                label="Upload File"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label required>Start Date</Label>
              <DatePicker 
                id="leave-start-date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label required>End Date</Label>
              <DatePicker 
                id="leave-end-date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label required>Reason</Label>
            <textarea 
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please explain the reason for the leave..."
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent py-3 px-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none shadow-sm"
              required
            />
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <Button 
              type="submit" 
              variant="primary"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
