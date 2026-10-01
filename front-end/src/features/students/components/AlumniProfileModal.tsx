import { X, Phone, Briefcase, GraduationCap, MapPin, AtSign, Mail } from 'lucide-react';
import { getAvatarGradient, getInitials } from '../../../utils/avatarUtils';

interface AlumniProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  alumni: any | null;
}

export default function AlumniProfileModal({ isOpen, onClose, alumni }: AlumniProfileModalProps) {
  
  if (!isOpen || !alumni) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[999999] transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-gray-800">
          
          <div className="p-6 sm:p-8">
            
            {/* Header / Profile Info */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-sm shrink-0 ${getAvatarGradient(alumni.student_name)}`}>
                  {getInitials(alumni.student_name, '')}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                      {alumni.student_name}
                    </h1>
                    <span className="inline-block bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-bold px-2.5 py-1 rounded-md">
                      Class of {alumni.graduation_year}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                    Roll ID: {alumni.admission_number}
                  </p>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full h-px bg-gray-100 dark:bg-gray-800 mb-8"></div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Career & Edu */}
              <div className="space-y-6">
                
                {/* Career Card */}
                <div className="bg-slate-50 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
                  <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                    <Briefcase className="w-4 h-4 text-brand-500" /> Professional Status
                  </h3>
                  {alumni.current_occupation ? (
                    <div>
                      <p className="text-base font-bold text-gray-900 dark:text-white mb-1">{alumni.current_occupation}</p>
                      <p className="text-sm text-brand-600 dark:text-brand-400 font-medium">{alumni.current_organization}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No professional details added yet.</p>
                  )}
                </div>

                {/* Education Card */}
                <div className="bg-slate-50 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
                  <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                    <GraduationCap className="w-4 h-4 text-brand-500" /> Higher Education
                  </h3>
                  {alumni.higher_education_details ? (
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                      {alumni.higher_education_details}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No higher education info available.</p>
                  )}
                </div>

              </div>

              {/* Right Column: Contact & Basic Info */}
              <div className="space-y-6">
                
                {/* Contact Card */}
                <div className="bg-brand-50 dark:bg-brand-500/10 rounded-2xl p-6 border border-brand-100 dark:border-brand-500/20 transition-all hover:shadow-md">
                  <h3 className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-2 mb-5">
                    <AtSign className="w-4 h-4" /> Contact Information
                  </h3>
                  
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-brand-500 shadow-sm shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-brand-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Phone Number</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{alumni.phone_number || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {/* Placeholder for email if we ever add it to the backend */}
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-brand-500 shadow-sm shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-brand-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Email Address</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Not provided</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
