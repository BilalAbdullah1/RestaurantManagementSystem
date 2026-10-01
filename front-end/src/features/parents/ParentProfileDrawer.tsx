import React, { useState } from 'react';
import { Mail, Phone, Link, Unlink, UserPlus, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../utils/axiosConfig';
import ProfileDrawer, { DrawerSection } from '../../components/ui/UIDesigns/ProfileDrawer';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import Button from '../../components/ui/button/Button';

interface ParentUser {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  parent_id: string | null;
}

interface ParentProfileDrawerProps {
  parent: ParentUser | null;
  isOpen: boolean;
  onClose: () => void;
  allStudents: Student[];
  onDataChange: () => void;
}

export default function ParentProfileDrawer({ parent, isOpen, onClose, allStudents, onDataChange }: ParentProfileDrawerProps) {
  const [linking, setLinking] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [loadingAction, setLoadingAction] = useState(false);

  if (!parent) return null;

  const linkedStudents = allStudents.filter(s => s.parent_id === parent.id);
  const unlinkedStudents = allStudents.filter(s => s.parent_id !== parent.id);

  const fullName = `${parent.first_name} ${parent.last_name}`;

  const handleLinkStudent = async () => {
    if (!selectedStudentId) return;
    setLoadingAction(true);
    try {
      const student = allStudents.find(s => s.id === selectedStudentId);
      if (!student) return;
      
      const payload = { ...student, parent_id: parent.id };
      await api.put(`/students/${selectedStudentId}`, payload);
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Student linked successfully',
        showConfirmButton: false,
        timer: 3000
      });
      setLinking(false);
      setSelectedStudentId('');
      onDataChange();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to link student', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUnlinkStudent = async (studentId: string) => {
    const result = await Swal.fire({
      title: 'Unlink Student?',
      text: "This student will no longer be associated with this parent account.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Unlink'
    });

    if (result.isConfirmed) {
      setLoadingAction(true);
      try {
        const student = allStudents.find(s => s.id === studentId);
        if (!student) return;

        const payload = { ...student, parent_id: null };
        await api.put(`/students/${studentId}`, payload);
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Student unlinked',
          showConfirmButton: false,
          timer: 3000
        });
        onDataChange();
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Failed to unlink student', 'error');
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const sections: DrawerSection[] = [
    {
      title: 'Contact Information',
      items: [
        { icon: <Mail className="w-4 h-4" />, label: parent.email },
        { icon: <Phone className="w-4 h-4" />, label: parent.phone_number || 'N/A' }
      ]
    },
    {
      title: 'Linked Students (Siblings Matrix)',
      items: linkedStudents.length > 0 ? linkedStudents.map(student => ({
        icon: <CheckCircle2 className="w-4 h-4 text-success-500" />,
        label: (
          <div className="flex items-center justify-between w-full pr-2">
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{student.first_name} {student.last_name}</p>
              <p className="text-xs text-gray-500">{student.admission_number}</p>
            </div>
            <button
              onClick={() => handleUnlinkStudent(student.id)}
              disabled={loadingAction}
              className="p-1.5 text-error-600 hover:bg-error-50 dark:hover:bg-error-900/30 rounded-lg transition-colors"
              title="Unlink Student"
            >
              <Unlink className="w-4 h-4" />
            </button>
          </div>
        )
      })) : [
        {
          icon: <Link className="w-4 h-4 text-gray-400" />,
          label: <span className="text-gray-500 italic">No students linked yet</span>
        }
      ]
    }
  ];

  if (linking) {
    sections[1].items.push({
      icon: <UserPlus className="w-4 h-4 text-brand-500" />,
      label: (
        <div className="flex flex-col gap-2 mt-2 w-full pr-2">
          <SearchableSelect
            label="Select Student to Link"
            options={unlinkedStudents.map(s => ({
              value: s.id,
              label: `${s.first_name} ${s.last_name} (${s.admission_number})`
            }))}
            value={selectedStudentId}
            onChange={(val) => setSelectedStudentId(val as string)}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setLinking(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleLinkStudent} disabled={loadingAction || !selectedStudentId}>
              {loadingAction ? 'Linking...' : 'Link'}
            </Button>
          </div>
        </div>
      )
    });
  } else {
    sections[1].items.push({
      icon: <></>,
      label: (
        <button
          onClick={() => setLinking(true)}
          className="mt-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
        >
          <UserPlus className="w-4 h-4" /> Add Student
        </button>
      )
    });
  }

  const badges = [
    { label: parent.is_active ? 'Active' : 'Inactive', color: (parent.is_active ? 'success' : 'error') as any }
  ];

  return (
    <ProfileDrawer
      isOpen={isOpen}
      onClose={() => {
        setLinking(false);
        onClose();
      }}
      title={fullName}
      subtitle="Parent / Guardian Account"
      badges={badges}
      sections={sections}
    />
  );
}
