import React from 'react';
import { Phone, Mail, Calendar, Hash, Briefcase, Award, FileText, ExternalLink } from 'lucide-react';
import ProfileDrawer, { DrawerSection } from '../../../components/ui/UIDesigns/ProfileDrawer';

interface Staff {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  cnic: string;
  staff_type?: string;
  designation: string;
  qualification: string;
  basic_salary: number;
  joining_date: string;
  is_active: boolean;
  profile_picture_url?: string | null;
  cnic_doc_url?: string | null;
  degree_doc_url?: string | null;
  contract_doc_url?: string | null;
}

interface StaffDrawerProps {
  staff: Staff | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StaffDrawer({ staff, isOpen, onClose }: StaffDrawerProps) {
  if (!staff) return null;

  const fullName = `${staff.first_name} ${staff.last_name}`;

  const badges = [
    {
      label: staff.is_active ? 'Active Employee' : 'Inactive / Former',
      color: (staff.is_active ? 'success' : 'error') as 'success' | 'error'
    },
    {
      label: staff.staff_type || 'Teaching',
      color: 'primary' as const
    },
    {
      label: `Rs. ${Number(staff.basic_salary || 0).toLocaleString()}/mo`,
      color: 'warning' as const
    }
  ];

  const sections: DrawerSection[] = [
    {
      title: 'Contact Details',
      items: [
        { icon: <Phone className="w-4 h-4 text-emerald-500" />, label: staff.phone || 'No phone provided' },
        { icon: <Mail className="w-4 h-4 text-blue-500" />, label: staff.email || 'No email provided' },
        { icon: <Hash className="w-4 h-4 text-gray-500" />, label: `CNIC: ${staff.cnic || 'N/A'}` },
      ]
    },
    {
      title: 'Employment & Compensation',
      items: [
        { icon: <Calendar className="w-4 h-4 text-indigo-500" />, label: `Joined: ${staff.joining_date ? new Date(staff.joining_date).toLocaleDateString() : 'N/A'}` },
        { icon: <Award className="w-4 h-4 text-amber-500" />, label: `Basic Salary: Rs. ${Number(staff.basic_salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
        { icon: <Briefcase className="w-4 h-4 text-purple-500" />, label: `Category: ${staff.staff_type || 'Teaching'} Faculty` },
      ]
    }
  ];

  return (
    <ProfileDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={fullName}
      subtitle={`${staff.designation} • ${staff.qualification}`}
      imageUrl={staff.profile_picture_url}
      badges={badges}
      sections={sections}
    >
      {/* Document Vault */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/60 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-brand-500" /> Document Vault
          </h4>
          <span className="text-[10px] uppercase font-semibold text-gray-400 dark:text-gray-500 tracking-wider">
            Verified Records
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <span className="font-medium text-gray-700 dark:text-gray-300">📄 CNIC Document</span>
            {staff.cnic_doc_url ? (
              <a
                href={staff.cnic_doc_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold hover:underline"
              >
                View <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-gray-400 italic">Not Uploaded</span>
            )}
          </div>

          <div className="flex items-center justify-between p-2.5 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <span className="font-medium text-gray-700 dark:text-gray-300">🎓 Degree Certificate</span>
            {staff.degree_doc_url ? (
              <a
                href={staff.degree_doc_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold hover:underline"
              >
                View <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-gray-400 italic">Not Uploaded</span>
            )}
          </div>

          <div className="flex items-center justify-between p-2.5 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <span className="font-medium text-gray-700 dark:text-gray-300">📜 Contract Agreement</span>
            {staff.contract_doc_url ? (
              <a
                href={staff.contract_doc_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold hover:underline"
              >
                View <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-gray-400 italic">Not Uploaded</span>
            )}
          </div>
        </div>
      </div>
    </ProfileDrawer>
  );
}
