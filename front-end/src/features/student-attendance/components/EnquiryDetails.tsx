import { X, Phone, User, BookOpen, Clock, Activity } from 'lucide-react';
import Badge from '../../../components/ui/badge/Badge';
import { getAvatarGradient, getInitials } from '../../../utils/avatarUtils';

interface AdmissionEnquiry {
  id: string;
  tenant_id: string;
  child_name: string;
  father_name: string;
  phone_number: string;
  class_id: string;
  class_name: string;
  status: string;
  remarks: string;
  created_at: string;
}

interface EnquiryDetailsProps {
  enquiry: AdmissionEnquiry | null;
  onClose: () => void;
}

export default function EnquiryDetails({ enquiry, onClose }: EnquiryDetailsProps) {
  if (!enquiry) return null;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Enquiry': return 'primary';
      case 'Follow-Up': return 'warning';
      case 'Registered': return 'success';
      case 'Closed': return 'dark';
      default: return 'light';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[999] transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[1000] transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header with beautiful gradient */}
        <div className="relative h-32 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-bl-3xl">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-md transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="absolute -bottom-8 left-5">
            <div className={`w-20 h-20 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center text-2xl font-bold text-white shadow-lg ${getAvatarGradient(enquiry.child_name)}`}>
              {getInitials(enquiry.child_name, '')}
            </div>
          </div>
        </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pt-10 px-5 pb-5 custom-scrollbar">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{enquiry.child_name}</h2>
          <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm mt-1">Target Class: {enquiry.class_name}</p>
          <div className="mt-2.5 flex gap-2">
            <Badge variant="light" color={getStatusColor(enquiry.status) as any}>
              Lead Status: {enquiry.status}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          {/* Contact Info */}
          <div className="p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-3 border border-gray-100 dark:border-gray-800">
            <h4 className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Guardian Contact</h4>
            <div className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
              <User className="w-4 h-4 text-emerald-500" />
              <span>{enquiry.father_name}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
              <Phone className="w-4 h-4 text-emerald-500" />
              <a href={`tel:${enquiry.phone_number}`} className="hover:text-emerald-600 underline decoration-emerald-500/30 underline-offset-4">
                {enquiry.phone_number}
              </a>
            </div>
          </div>

          {/* Admission Details */}
          <div className="p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-3 border border-gray-100 dark:border-gray-800">
            <h4 className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Lead Information</h4>
            <div className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>Interested in: {enquiry.class_name}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Enquired: {new Date(enquiry.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Activity className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="block font-medium text-gray-900 dark:text-white mb-1">Remarks / Source</span>
                <p className="text-gray-600 dark:text-gray-400 text-[13px] whitespace-pre-wrap">
                  {enquiry.remarks || 'No remarks provided.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);
}
