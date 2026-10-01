import { X, Calendar, BookOpen, Hash, Activity } from 'lucide-react';
import Badge from '../../../components/ui/badge/Badge';

interface EnrollmentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  historyList: any[];
  historyLoading: boolean;
}

export default function EnrollmentHistoryModal({ 
  isOpen, 
  onClose, 
  studentName, 
  historyList, 
  historyLoading 
}: EnrollmentHistoryModalProps) {
  
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[999999] transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-in fade-in zoom-in duration-200">
          
          <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lifecycle Enrollment History</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Audit log for <span className="font-semibold text-brand-600 dark:text-brand-400">{studentName}</span>
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-gray-900/50">
            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mb-4"></div>
                <p className="text-brand-500 font-semibold animate-pulse">Accessing timeline vault...</p>
              </div>
            ) : historyList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium text-lg">No archival tracks found.</p>
                <p className="text-sm text-gray-400">This student does not have any recorded enrollment history.</p>
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[17px] before:w-[2px] before:bg-gray-200 dark:before:bg-gray-800">
                {historyList.map((log, idx) => (
                  <div key={log.id} className="relative flex items-start gap-6 pl-10">
                    <div className="absolute left-[13px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-white dark:ring-gray-900" />
                    
                    <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="light" color={log.status === 'Active' ? 'success' : 'light'}>
                          {log.status}
                        </Badge>
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-900/50 px-2 py-1 rounded-md">
                          Entry {historyList.length - idx}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Session</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{log.academic_year_title}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Class</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{log.class_name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Section</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{log.section_name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Hash className="w-3 h-3" /> Roll</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{log.roll_number}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
