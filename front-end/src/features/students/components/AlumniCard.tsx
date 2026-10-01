import { Edit, Trash2, Briefcase, GraduationCap, MapPin, Phone } from 'lucide-react';
import { getAvatarGradient, getInitials } from '../../../utils/avatarUtils';

interface AlumniProfile {
  id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  gender: string;
  phone_number: string;
  graduation_year: number;
  current_occupation: string;
  current_organization: string;
  higher_education_details: string;
}

interface AlumniCardProps {
  alumni: AlumniProfile;
  onEdit: (alumni: AlumniProfile) => void;
  onDelete: (id: string, name: string) => void;
  onViewDetails: (alumni: AlumniProfile) => void;
}

export default function AlumniCard({ alumni, onEdit, onDelete, onViewDetails }: AlumniCardProps) {
  // Generate a dynamic gradient based on graduation year to make each card feel unique
  const getCoverGradient = (year: number) => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-red-500',
      'from-purple-500 to-pink-500',
      'from-brand-500 to-cyan-600'
    ];
    return gradients[year % gradients.length];
  };

  return (
    <div 
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      onClick={() => onViewDetails(alumni)}
    >
      
      {/* Cover Photo Area */}
      <div className={`h-24 bg-gradient-to-r ${getCoverGradient(alumni.graduation_year)} relative overflow-hidden`}>
        {/* Abstract Pattern overlay */}
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] bg-repeat" />
        
        {/* Floating Actions */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(alumni); }} 
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-black/50 text-gray-700 dark:text-gray-200 hover:text-brand-500 dark:hover:text-brand-400 flex items-center justify-center shadow-sm backdrop-blur-sm transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(alumni.id, alumni.student_name); }} 
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-black/50 text-gray-700 dark:text-gray-200 hover:text-error-500 dark:hover:text-error-500 flex items-center justify-center shadow-sm backdrop-blur-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Batch Badge */}
        <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md border border-white/20 shadow-sm">
          Class of {alumni.graduation_year}
        </div>
      </div>
      
      {/* Profile Details */}
      <div className="px-5 pb-5 relative flex-1 flex flex-col">
        {/* Avatar */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg border-4 border-white dark:border-gray-900 -mt-8 z-10 ${getAvatarGradient(alumni.student_name)}`}>
          {getInitials(alumni.student_name, '')}
        </div>
        
        <div className="mt-3">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {alumni.student_name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">#{alumni.admission_number}</p>
        </div>
        
        <div className="mt-4 space-y-3 flex-1">
          {alumni.current_occupation ? (
            <div className="flex items-start">
              <div className="mt-0.5 p-1.5 rounded-md bg-orange-50 dark:bg-orange-500/10 text-orange-500 mr-2.5 shrink-0">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug">{alumni.current_occupation}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{alumni.current_organization}</p>
              </div>
            </div>
          ) : (
             <div className="flex items-center text-gray-400 dark:text-gray-600 text-xs italic">
                <Briefcase className="w-3.5 h-3.5 mr-2" /> No occupation added
             </div>
          )}

          {alumni.higher_education_details && (
            <div className="flex items-start">
              <div className="mt-0.5 p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 mr-2.5 shrink-0">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                {alumni.higher_education_details}
              </p>
            </div>
          )}
        </div>

        {/* Contact Footer */}
        <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-800/60 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
             <Phone className="w-3.5 h-3.5 mr-1.5" /> 
             {alumni.phone_number || 'No contact info'}
          </div>
          <div className="text-brand-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View Profile →
          </div>
        </div>
      </div>

    </div>
  );
}
