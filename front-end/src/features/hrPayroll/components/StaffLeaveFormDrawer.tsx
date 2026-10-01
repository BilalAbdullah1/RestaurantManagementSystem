import React from 'react';
import ProfileDrawer from '../../../components/ui/UIDesigns/ProfileDrawer';
import InputField from '../../../components/form/input/InputField';
import Label from '../../../components/form/Label';
import DatePicker from '../../../components/form/date-picker';
import SearchableSelect from '../../../components/form/select/SearchableSelect';
import { Calendar, Upload, FileText, Send, X } from 'lucide-react';

interface StaffLeaveFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  uploading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  viewMode?: boolean;
}

export default function StaffLeaveFormDrawer({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  uploading,
  handleFileUpload,
  viewMode = false
}: StaffLeaveFormDrawerProps) {
  const leaveOptions = [
    { value: 'Sick Leave', label: 'Sick Leave' },
    { value: 'Casual Leave', label: 'Casual Leave' },
    { value: 'Urgent Work', label: 'Urgent Work' },
    { value: 'Maternity Leave', label: 'Maternity Leave' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <ProfileDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={viewMode ? 'Leave Application Details' : 'Apply for Leave'}
    >
      {viewMode ? (
        <div className="space-y-5 p-2">
          <div className="p-4 bg-slate-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Leave Type</span>
              <span className="text-base font-extrabold text-gray-900 dark:text-white">{formData.leave_type}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700/60">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Start Date</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  {formData.start_date ? new Date(formData.start_date).toLocaleDateString() : '-'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">End Date</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  {formData.end_date ? new Date(formData.end_date).toLocaleDateString() : '-'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <Label>Reason for Leave</Label>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {formData.reason || 'No reason provided.'}
            </div>
          </div>

          {formData.attachment_url && (
            <div>
              <Label>Attached Document Proof</Label>
              <a 
                href={formData.attachment_url} 
                target="_blank" 
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>View Proof Document</span>
              </a>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5 p-2">
          <div>
            <Label required>Leave Type</Label>
            <SearchableSelect 
              options={leaveOptions} 
              value={formData.leave_type} 
              onChange={(val) => setFormData({...formData, leave_type: val})} 
              placeholder="Select Type" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <DatePicker 
                label="Start Date"
                value={formData.start_date} 
                onChange={(e) => setFormData({...formData, start_date: e.target.value})} 
                placeholder="Select Date"
              />
            </div>
            <div>
              <DatePicker 
                label="End Date"
                value={formData.end_date} 
                onChange={(e) => setFormData({...formData, end_date: e.target.value})} 
                placeholder="Select Date"
              />
            </div>
          </div>

          <div>
            <Label required>Reason for Leave</Label>
            <textarea 
              className="w-full p-3 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400 outline-none shadow-sm transition-all"
              rows={4}
              value={formData.reason}
              onChange={e => setFormData({...formData, reason: e.target.value})}
              required
              placeholder="Please provide a clear reason for your leave request..."
            />
          </div>

          <div>
            <Label>Attachment (Medical Certificate / Proof Document)</Label>
            <div className="flex gap-2 items-center">
              <InputField 
                value={formData.attachment_url} 
                onChange={e => setFormData({...formData, attachment_url: e.target.value})} 
                placeholder="Document URL or click Upload" 
              />
              <div className="relative shrink-0">
                <input type="file" id="leave-file-staff" className="hidden" onChange={handleFileUpload} />
                <label 
                  htmlFor="leave-file-staff" 
                  className="cursor-pointer flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-xl px-4 h-10 transition-colors whitespace-nowrap text-xs font-bold gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Application</span>
            </button>
          </div>
        </form>
      )}
    </ProfileDrawer>
  );
}

