import React, { useState, useEffect } from 'react';
import { Phone, User, Calendar, MapPin, Hash, Activity, CreditCard, FileText, AlertTriangle } from 'lucide-react';
import ProfileDrawer, { DrawerSection } from '../../../components/ui/UIDesigns/ProfileDrawer';
import { useNavigate } from 'react-router';
import api from '../../../utils/axiosConfig';

interface Student {
  id?: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  father_name: string;
  guardian_phone: string;
  is_active: boolean;
  date_of_birth: string;
  blood_group: string;
  address: string;
  b_form_number: string;
  gender: string;
  category?: string;
  profile_picture_url?: string | null;
}

interface StudentProfileDrawerProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentProfileDrawer({ student, isOpen, onClose }: StudentProfileDrawerProps) {
  const navigate = useNavigate();
  const [medicalRecord, setMedicalRecord] = useState<{ allergies?: string; chronic_conditions?: string } | null>(null);

  useEffect(() => {
    if (isOpen && student?.id) {
      api.get(`/studentmedical/student/${student.id}`)
        .then(res => setMedicalRecord(res.data))
        .catch(() => setMedicalRecord(null));
    } else {
      setMedicalRecord(null);
    }
  }, [isOpen, student]);

  if (!student) return null;

  const fullName = `${student.first_name} ${student.last_name}`;

  const hasMedicalAlert = Boolean(medicalRecord?.allergies || medicalRecord?.chronic_conditions);

  const badges = [
    { label: student.is_active ? 'Active Enrolled' : 'Inactive / Left', color: (student.is_active ? 'success' : 'error') as any },
    { label: `Quota: ${student.category || 'Normal'}`, color: 'warning' as any },
    { label: student.gender, color: 'primary' as any },
    ...(hasMedicalAlert ? [{ label: '🚨 Medical Alert', color: 'error' as any }] : [])
  ];

  const sections: DrawerSection[] = [
    {
      title: 'Guardian Contact',
      items: [
        { icon: <User className="w-4 h-4" />, label: `${student.father_name} (Father)` },
        { icon: <Phone className="w-4 h-4" />, label: student.guardian_phone },
        { icon: <MapPin className="w-4 h-4" />, label: student.address }
      ]
    },
    {
      title: 'Personal Details',
      items: [
        { icon: <Calendar className="w-4 h-4" />, label: `DOB: ${new Date(student.date_of_birth).toLocaleDateString()}` },
        { icon: <Activity className="w-4 h-4" />, label: `Blood Group: ${student.blood_group || 'Not specified'}` },
        { icon: <Hash className="w-4 h-4" />, label: `B-Form: ${student.b_form_number}` }
      ]
    }
  ];

  return (
    <ProfileDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={fullName}
      subtitle={student.admission_number}
      imageUrl={student.profile_picture_url}
      badges={badges}
      sections={sections}
    >
      {medicalRecord && (medicalRecord.allergies || medicalRecord.chronic_conditions) && (
        <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" /> 🚨 Emergency Medical Alert
          </div>
          {medicalRecord.allergies && (
            <p className="text-xs text-rose-900 dark:text-rose-200">
              <span className="font-semibold">Allergies:</span> {medicalRecord.allergies}
            </p>
          )}
          {medicalRecord.chronic_conditions && (
            <p className="text-xs text-rose-900 dark:text-rose-200">
              <span className="font-semibold">Chronic Conditions:</span> {medicalRecord.chronic_conditions}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            onClose();
            navigate(`/FeeChallans?search=${encodeURIComponent(student.admission_number || student.first_name)}`);
          }}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl font-semibold text-xs transition-colors border border-emerald-200 dark:border-emerald-800"
        >
          <CreditCard className="w-4 h-4" /> Fee Challan
        </button>
        <button
          onClick={() => {
            onClose();
            navigate(`/reports/student-id-cards?search=${encodeURIComponent(student.admission_number || student.first_name)}`);
          }}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-xl font-semibold text-xs transition-colors border border-purple-200 dark:border-purple-800"
        >
          <FileText className="w-4 h-4" /> ID Card
        </button>
      </div>
    </ProfileDrawer>
  );
}
