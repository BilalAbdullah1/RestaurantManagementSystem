import React from 'react';
import ProfileDrawer from '../../../components/ui/UIDesigns/ProfileDrawer';
import Label from '../../../components/form/Label';
import { CheckCircle2, XCircle, FileText, UserCheck, Calendar, Paperclip } from 'lucide-react';

interface LeaveApprovalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  leave: any;
  actionNotes: string;
  setActionNotes: (notes: string) => void;
  onAction: (status: 'Approved' | 'Rejected') => void;
}

export default function LeaveApprovalDrawer({
  isOpen,
  onClose,
  leave,
  actionNotes,
  setActionNotes,
  onAction
}: LeaveApprovalDrawerProps) {
  if (!leave) return null;

  const isStudent = !!leave.student_id;

  return (
    <ProfileDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Review Leave Application"
    >
      <div className="space-y-5 p-2">
        {/* Applicant Summary Card */}
        <div className="p-4 bg-slate-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Applicant Type</span>
              <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                {isStudent ? 'Student Member' : 'Staff Member'}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-extrabold border border-blue-200 dark:border-blue-800">
              {leave.leave_type}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-gray-700/60 text-xs">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Start Date</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {leave.start_date ? new Date(leave.start_date).toLocaleDateString() : '-'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">End Date</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {leave.end_date ? new Date(leave.end_date).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Reason Box */}
        <div>
          <Label>Reason for Leave</Label>
          <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
            <p className="font-medium">{leave.reason || 'No reason provided.'}</p>
            {leave.attachment_url && (
              <div className="mt-3 pt-2 border-t border-amber-500/20">
                <a 
                  href={leave.attachment_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  View Attached Document
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Approver Notes Input */}
        <div>
          <Label>Approver Review Notes (Optional)</Label>
          <textarea 
            className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs text-gray-800 dark:text-white placeholder-gray-400 shadow-sm"
            rows={3}
            value={actionNotes}
            onChange={e => setActionNotes(e.target.value)}
            placeholder="e.g. Approved. Please submit medical certificate upon return..."
          />
        </div>

        {/* Bottom Action Bar */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              type="button" 
              onClick={() => onAction('Rejected')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject</span>
            </button>
            
            <button 
              type="button" 
              onClick={() => onAction('Approved')}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve</span>
            </button>
          </div>
        </div>

      </div>
    </ProfileDrawer>
  );
}

