import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Input from '../../components/form/input/InputField';
import DatePicker from '../../components/form/date-picker';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import ImageUpload from '../../components/form/ImageUpload';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../components/ui/table/DataTable';
import { toast } from '../../components/ui/Toast';
import { Upload, Download, Plus } from 'lucide-react';

// Subcomponents
import StudentStats from './components/StudentStats';
import StudentProfileDrawer from './components/StudentProfileDrawer';
import StudentActionMenu from './components/StudentActionMenu';
import StudentMedicalForm from './components/StudentMedicalForm';
import TransferCertificate from './components/TransferCertificate';
import { getAvatarGradient, getInitials } from '../../utils/avatarUtils';
import { getFileBaseUrl } from '../../utils/apiConfig';

interface Student {
  id?: string;
  tenant_id: string;
  user_id?: string | null;
  b_form_number: string;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  admission_date: string;
  admission_number: string;
  father_name: string;
  father_cnic: string;
  guardian_phone: string;
  address: string;
  blood_group: string;
  category?: string;
  is_active: boolean;
  parent_id?: string | null;
  profile_picture_url?: string | null;
  created_at?: string;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const initialFormState = (tenantId: string): Student => ({
  tenant_id: tenantId,
  b_form_number: '',
  first_name: '',
  last_name: '',
  gender: 'Male',
  date_of_birth: getTodayDateString(),
  admission_date: getTodayDateString(),
  admission_number: '',
  father_name: '',
  father_cnic: '',
  guardian_phone: '',
  address: '',
  blood_group: '',
  category: 'Normal',
  is_active: true,
  parent_id: '',
  profile_picture_url: null,
});

export default function StudentDirectory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [drawerStudent, setDrawerStudent] = useState<Student | null>(null);
  const [medicalStudent, setMedicalStudent] = useState<Student | null>(null);
  const [tcStudent, setTcStudent] = useState<Student | null>(null);
  const [tcEnrolledClass, setTcEnrolledClass] = useState<string>('');
  const [selectedSiblingId, setSelectedSiblingId] = useState<string>('');

  const tenantId = localStorage.getItem('tenantId') || '';
  const [formData, setFormData] = useState<Student>(initialFormState(tenantId));
  const [parentUsers, setParentUsers] = useState<{ value: string, label: string }[]>([]);

  useEffect(() => {
    if (searchParams.get('action') === 'new' || searchParams.get('new') === 'true') {
      setView('form');
      setEditingStudent(null);
      setFormData(initialFormState(tenantId));
    }
  }, [searchParams, tenantId]);

  const siblingOptions = useMemo(() => {
    const opts = students
      .filter(s => !editingStudent || s.id !== editingStudent.id)
      .map(s => ({
        value: s.id!,
        label: `${s.first_name} ${s.last_name} (${s.admission_number || 'GR'}) — Father: ${s.father_name || 'N/A'}`
      }));
    return [{ value: '', label: 'Select Sibling to Copy Guardian Info...' }, ...opts];
  }, [students, editingStudent]);

  const handleSiblingChange = (siblingId: string | number | boolean) => {
    const idStr = String(siblingId);
    setSelectedSiblingId(idStr);
    if (!idStr) return;

    const sibling = students.find(s => s.id === idStr);
    if (sibling) {
      setFormData(prev => ({
        ...prev,
        father_name: sibling.father_name || prev.father_name,
        father_cnic: sibling.father_cnic || prev.father_cnic,
        guardian_phone: sibling.guardian_phone || prev.guardian_phone,
        address: sibling.address || prev.address,
        parent_id: sibling.parent_id || prev.parent_id,
      }));
      toast.success(`Guardian details auto-filled from sibling: ${sibling.first_name} ${sibling.last_name}`);
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await api.get(`/importexport/export/students/${tenantId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Students_Export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Student CSV exported successfully!');
    } catch {
      if (students.length === 0) {
        Swal.fire('Notice', 'No student records available to export.', 'info');
        return;
      }
      const headers = ['Admission Number', 'First Name', 'Last Name', 'Gender', 'Date of Birth', 'Admission Date', 'Father Name', 'Father CNIC', 'Guardian Phone', 'B-Form Number', 'Address', 'Status'];
      const rows = students.map(s => [
        `"${s.admission_number || ''}"`,
        `"${s.first_name || ''}"`,
        `"${s.last_name || ''}"`,
        `"${s.gender || ''}"`,
        `"${s.date_of_birth || ''}"`,
        `"${s.admission_date || ''}"`,
        `"${s.father_name || ''}"`,
        `"${s.father_cnic || ''}"`,
        `"${s.guardian_phone || ''}"`,
        `"${s.b_form_number || ''}"`,
        `"${(s.address || '').replace(/"/g, '""')}"`,
        `"${s.is_active ? 'Active' : 'Inactive'}"`
      ].join(','));
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Student_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Student directory CSV downloaded!');
    }
  };

  const handleImportCsv = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const uploadData = new FormData();
      uploadData.append('file', file);
      try {
        setLoading(true);
        const res = await api.post(`/importexport/import/students/${tenantId}`, uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire({
          icon: 'success',
          title: 'CSV Import Completed',
          text: res.data.message || 'Students imported successfully.',
          confirmButtonColor: '#4f46e5',
        });
        fetchStudents();
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Import Failed',
          text: err.response?.data?.message || 'Could not process CSV file.',
          confirmButtonColor: '#ef4444',
        });
      } finally {
        setLoading(false);
      }
    };
    input.click();
  };

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    fetchStudents();
    fetchParentUsers();
  }, [tenantId]);

  const fetchParentUsers = async () => {
    try {
      const rolesResponse = await api.get(`/roles/tenant/${tenantId}`);
      const parentRole = rolesResponse.data.find((r: any) => r.name === 'Parent');

      if (parentRole) {
        const usersResponse = await api.get(`/users/tenant/${tenantId}`);
        const parents = usersResponse.data
          .filter((u: any) => u.role_id === parentRole.id && u.is_active)
          .map((u: any) => ({
            value: u.id,
            label: `${u.first_name} ${u.last_name} (${u.email})`
          }));
        setParentUsers([{ value: '', label: 'Select Parent Account (Optional)' }, ...parents]);
      }
    } catch (error) {
      console.error("Error fetching parent users", error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get<Student[]>(`/students/tenant/${tenantId}`);
      setStudents(response.data);
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Unable to Load Students',
        text: 'Something went wrong while retrieving student records. Please try again.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatInputDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime()) || d.getFullYear() <= 1900) return '';
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const openAddView = async () => {
    setEditingStudent(null);
    setSelectedSiblingId('');
    const initial = initialFormState(tenantId);
    try {
      const res = await api.get(`/students/tenant/${tenantId}/generate-gr`);
      if (res.data?.gr_number) {
        initial.admission_number = res.data.gr_number;
      }
    } catch (err) {
      console.error('Failed to auto-generate GR number', err);
    }
    setFormData(initial);
    setView('form');
  };

  const autoGenerateGrNumber = async () => {
    try {
      const res = await api.get(`/students/tenant/${tenantId}/generate-gr`);
      if (res.data?.gr_number) {
        setFormData(prev => ({ ...prev, admission_number: res.data.gr_number }));
      }
    } catch (err) {
      console.error('Failed to auto-generate GR number', err);
    }
  };

  const formatCnicOrBForm = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  };

  const openEditView = (student: Student) => {
    setEditingStudent(student);
    const normalizedGender = student.gender
      ? (student.gender.charAt(0).toUpperCase() + student.gender.slice(1).toLowerCase())
      : 'Male';
    setFormData({
      ...student,
      gender: normalizedGender,
      date_of_birth: formatInputDate(student.date_of_birth),
      admission_date: formatInputDate(student.admission_date),
      blood_group: student.blood_group ?? '',
      b_form_number: student.b_form_number ?? '',
      father_cnic: student.father_cnic ?? '',
      address: student.address ?? '',
      parent_id: student.parent_id ?? '',
    });
    setView('form');
  };

  const cancelForm = () => {
    setEditingStudent(null);
    setFormData(initialFormState(tenantId));
    setView('list');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    const payload = {
      ...formData,
      parent_id: formData.parent_id === '' ? null : formData.parent_id
    };

    try {
      if (editingStudent && editingStudent.id) {
        await api.put(`/students/${editingStudent.id}`, payload);
        Swal.fire({ icon: 'success', title: 'Student Updated', text: 'The student profile has been saved.', timer: 2000, showConfirmButton: false });
      } else {
        await api.post('/students', payload);
        Swal.fire({ icon: 'success', title: 'Student Added', text: 'The new student has been registered.', timer: 2000, showConfirmButton: false });
      }
      cancelForm();
      fetchStudents();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Please review the form and try again.';
      Swal.fire({ icon: 'error', title: 'Unable to Save', text: errorMsg, confirmButtonColor: '#ef4444' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteStudent = async (student: Student) => {
    const result = await Swal.fire({
      title: 'Delete Student?',
      text: `This will permanently remove "${student.first_name} ${student.last_name}". This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/students/${student.id}`);
      Swal.fire({ icon: 'success', title: 'Deleted', text: 'Record has been removed.', timer: 1500, showConfirmButton: false });
      fetchStudents();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Unable to Delete', text: err.response?.data?.message || 'Error occurred.' });
    }
  };

  const generateStudentLogin = async (student: Student) => {
    try {
      setLoading(true);
      const response = await api.post(`/students/${student.id}/generate-account`);
      Swal.fire({
        icon: 'success',
        title: 'Account Generated',
        html: `
          <div class="text-left mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p class="mb-2"><span class="font-bold text-gray-700 dark:text-gray-300">Username:</span> <span class="font-mono text-brand-600 dark:text-brand-400">${response.data.username}</span></p>
            <p><span class="font-bold text-gray-700 dark:text-gray-300">Password:</span> <span class="font-mono text-brand-600 dark:text-brand-400">${response.data.password}</span></p>
            <p class="text-xs text-gray-500 mt-4">Please securely share these credentials with the student.</p>
          </div>
        `,
        confirmButtonColor: '#2563eb'
      });
      fetchStudents();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Unable to Generate',
        text: err.response?.data?.message || 'Error occurred.'
      });
    } finally {
      setLoading(false);
    }
  };

  // --- TANSTACK TABLE CONFIGURATION ---

  const filteredStudents = useMemo(() => {
    if (activeTab === 'all') return students;
    return students.filter(s => s.is_active === (activeTab === 'active'));
  }, [students, activeTab]);

  const columns = useMemo<ColumnDef<Student>[]>(
    () => [
      {
        accessorKey: 'admission_number',
        header: 'Adm. #',
        cell: info => <span className="font-mono text-gray-500 dark:text-gray-400">{info.getValue() as string}</span>,
      },
      {
        accessorFn: row => `${row.first_name} ${row.last_name}`,
        id: 'fullName',
        header: 'Student',
        cell: info => {
          const student = info.row.original;
          const fullName = info.getValue() as string;

          const getFullUrl = (url: string) => {
            return getFileBaseUrl(url);
          };

          return (
            <div className="flex items-center gap-3">
              {student.profile_picture_url ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 shrink-0">
                  <img
                    src={getFullUrl(student.profile_picture_url)}
                    alt={fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                  />
                </div>
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getAvatarGradient(fullName)} shrink-0`}>
                  {getInitials(student.first_name, student.last_name)}
                </div>
              )}
              <div>
                <div
                  className="text-sm font-semibold text-gray-800 dark:text-white/90 hover:text-brand-500 cursor-pointer transition-colors"
                  onClick={() => setDrawerStudent(student)}
                >
                  {fullName}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">B-Form: {student.b_form_number}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'father_name',
        header: "Father's Name",
      },
      {
        accessorKey: 'gender',
        header: 'Gender',
      },
      {
        accessorKey: 'category',
        header: 'Quota / Category',
        cell: info => {
          const cat = (info.getValue() as string) || 'Normal';
          return (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {cat}
            </span>
          );
        }
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: info => {
          const isActive = info.getValue() as boolean;
          return (
            <Badge
              variant="light"
              color={isActive ? 'success' : 'error'}
              size="sm"
              startIcon={<span className={`w-1.5 h-1.5 rounded-full inline-block ${isActive ? 'bg-success-500' : 'bg-error-500'}`} />}
            >
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: info => (
          <div className="flex justify-end">
            <StudentActionMenu
              onView={() => setDrawerStudent(info.row.original)}
              onEdit={() => openEditView(info.row.original)}
              onDelete={() => deleteStudent(info.row.original)}
              onGenerateLogin={() => generateStudentLogin(info.row.original)}
              onMedical={() => setMedicalStudent(info.row.original)}
              onGenerateTC={() => { setTcStudent(info.row.original); setTcEnrolledClass(''); }}
              onFeeChallan={() => navigate(`/FeeChallans?search=${encodeURIComponent(info.row.original.admission_number || info.row.original.first_name)}`)}
              onIDCard={() => navigate(`/reports/student-id-cards?search=${encodeURIComponent(info.row.original.admission_number || info.row.original.first_name)}`)}
            />
          </div>
        ),
      },
    ],
    [navigate]
  );

  // Calculate Stats
  const activeCount = students.filter(s => s.is_active).length;
  const boysCount = students.filter(s => s.gender === 'Male').length;
  const girlsCount = students.filter(s => s.gender === 'Female').length;

  // ─── LIST VIEW ────────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="w-full space-y-6">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Student Directory</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all admissions and student profiles.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="outline" onClick={handleImportCsv} startIcon={<Upload className="w-4 h-4" />}>
              Import CSV
            </Button>
            <Button variant="outline" onClick={handleExportCsv} startIcon={<Download className="w-4 h-4" />}>
              Export CSV
            </Button>
            <Button variant="primary" onClick={openAddView} startIcon={<Plus className="w-4 h-4" />}>
              + Register New Student
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <StudentStats
          loading={loading}
          totalStudents={students.length}
          activeStudents={activeCount}
          inactiveStudents={students.length - activeCount}
          boysCount={boysCount}
          girlsCount={girlsCount}
        />

        {/* User-Friendly Actionable Onboarding Empty State */}
        {students.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center p-10 text-center rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 my-2">
            <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 shadow-sm text-3xl">
              🎓
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Students Enrolled Yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6 leading-relaxed">
              Start your academic session by admitting your first student or importing existing student records in bulk via CSV.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button variant="primary" onClick={openAddView} startIcon={<Plus className="w-4 h-4" />}>
                Admit First Student
              </Button>
              <Button variant="outline" onClick={handleImportCsv} startIcon={<Upload className="w-4 h-4" />}>
                Import CSV Spreadsheet
              </Button>
            </div>
          </div>
        )}

        {/* DataTable */}
        <DataTable
          loading={loading}
          data={filteredStudents}
          columns={columns}
          searchPlaceholder="Search directory..."
          emptyMessage="No students found in this category."
          leftActions={
            <div className="flex p-1 space-x-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
              {[
                { id: 'all', label: 'All Students' },
                { id: 'active', label: 'Active Enrolled' },
                { id: 'inactive', label: 'Inactive / Alumni' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === tab.id
                      ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          }
          exportable={true}
          exportFilename="student_directory"
        />

        {/* The Slide-Over Drawer */}
        <StudentProfileDrawer 
          student={drawerStudent}
          isOpen={!!drawerStudent}
          onClose={() => setDrawerStudent(null)}
        />

        {/* Medical Record Form */}
        {medicalStudent && (
          <StudentMedicalForm
            studentId={medicalStudent.id!}
            studentName={`${medicalStudent.first_name} ${medicalStudent.last_name}`}
            tenantId={tenantId}
            isOpen={!!medicalStudent}
            onClose={() => setMedicalStudent(null)}
          />
        )}

        {/* Transfer Certificate */}
        {tcStudent && (
          <TransferCertificate
            student={tcStudent as any}
            schoolName={localStorage.getItem('schoolName') || 'School'}
            enrolledClass={tcEnrolledClass}
            isOpen={!!tcStudent}
            onClose={() => setTcStudent(null)}
          />
        )}
      </div>
    );
  }

  // ─── FORM VIEW ────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleFormSubmit} className="w-full space-y-6">
      <div className="flex justify-between items-center p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            {editingStudent ? 'Edit Student Profile' : 'Register New Student'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ensure all mandatory fields (*) are accurately populated.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={cancelForm}>
          ← Back to Directory
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <span className="text-brand-500">🎓</span> Personal Information
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <ImageUpload
              label="Student Profile Picture"
              currentImageUrl={formData.profile_picture_url}
              onUploadSuccess={(url) => setFormData({ ...formData, profile_picture_url: url })}
            />
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">First Name *</label>
                <Input type="text" required placeholder="e.g. Ahmed" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Last Name *</label>
                <Input type="text" required placeholder="e.g. Khan" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <SearchableSelect
                  label="Gender *"
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  value={formData.gender}
                  onChange={(val) => setFormData({ ...formData, gender: val as string })}
                />
              </div>
              <div>
                <SearchableSelect
                  label="Blood Group"
                  options={[
                    { value: '', label: 'Not specified' },
                    { value: 'A+', label: 'A+' },
                    { value: 'A-', label: 'A-' },
                    { value: 'B+', label: 'B+' },
                    { value: 'B-', label: 'B-' },
                    { value: 'AB+', label: 'AB+' },
                    { value: 'AB-', label: 'AB-' },
                    { value: 'O+', label: 'O+' },
                    { value: 'O-', label: 'O-' },
                  ]}
                  value={formData.blood_group}
                  onChange={(val) => setFormData({ ...formData, blood_group: val as string })}
                />
              </div>
            </div>
            <div>
              <SearchableSelect
                label="Student Quota / Fee Category *"
                options={[
                  { value: 'Normal', label: 'Normal (Standard Student)' },
                  { value: 'Staff Child', label: 'Staff Child (50% Concession)' },
                  { value: 'Orphan', label: 'Orphan / Welfare Quota' },
                  { value: 'Merit', label: 'Merit Scholarship' },
                  { value: 'Need-Based', label: 'Need-Based Financial Assistance' },
                  { value: 'Special Quota', label: 'Special Quota' },
                ]}
                value={formData.category || 'Normal'}
                onChange={(val) => setFormData({ ...formData, category: val as string })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Date of Birth *</label>
              <DatePicker id="dob-picker" value={formData.date_of_birth} required placeholder="Select date of birth" onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">B-Form / National ID *</label>
              <Input type="text" required placeholder="e.g. 42101-1234567-1" value={formData.b_form_number} onChange={(e) => setFormData({ ...formData, b_form_number: formatCnicOrBForm(e.target.value) })} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <span className="text-warning-500">👨‍👦</span> Guardian Information
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <SearchableSelect
                label="🔗 Link Sibling (Auto-fill Guardian Details)"
                options={siblingOptions}
                value={selectedSiblingId}
                onChange={(val) => handleSiblingChange(val)}
                placeholder="Search sibling by student name, GR # or father name..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Father's Name *</label>
              <Input type="text" required placeholder="e.g. Muhammad Khan" value={formData.father_name} onChange={(e) => setFormData({ ...formData, father_name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Father's CNIC *</label>
              <Input type="text" required placeholder="e.g. 42101-1234567-1" value={formData.father_cnic} onChange={(e) => setFormData({ ...formData, father_cnic: formatCnicOrBForm(e.target.value) })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Guardian Phone *</label>
              <Input type="text" required placeholder="e.g. 0300-1234567" value={formData.guardian_phone} onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Residential Address *</label>
              <textarea
                required
                rows={4}
                placeholder="Enter the student's full residential address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 resize-none"
              />
            </div>
            <div>
              <SearchableSelect
                label="Linked Parent Account (Optional)"
                options={parentUsers}
                value={formData.parent_id || ''}
                onChange={(val) => setFormData({ ...formData, parent_id: val as string })}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden lg:col-span-2">
          <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <span className="text-success-500">📋</span> Admission Details
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">GR / Admission Number *</label>
              <div className="flex gap-2">
                <Input type="text" required placeholder="e.g. GR-2026-001" value={formData.admission_number} onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })} />
                {!editingStudent && (
                  <button
                    type="button"
                    onClick={autoGenerateGrNumber}
                    className="shrink-0 px-3 py-2 text-xs font-bold bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50 border border-brand-200 dark:border-brand-800 rounded-lg transition-colors whitespace-nowrap"
                    title="Auto-generate GR Number"
                  >
                    ✨ Auto GR
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Admission Date *</label>
              <DatePicker id="admission-date-picker" value={formData.admission_date} required placeholder="Select admission date" onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })} />
            </div>
            <div>
              <SearchableSelect
                label="Account Status *"
                options={[
                  { value: true, label: 'Active (Enrolled)' },
                  { value: false, label: 'Inactive (Left / Suspended)' },
                ]}
                value={formData.is_active}
                onChange={(val) => setFormData({ ...formData, is_active: val as boolean })}
              />
            </div>
          </div>
        </div>

      </div>

      <div className="flex justify-end items-center gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        <Button type="button" variant="outline" onClick={cancelForm}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={submitLoading}
          loadingText={editingStudent ? 'Saving Changes...' : 'Registering Student...'}
          className="min-w-[160px]"
        >
          {editingStudent ? 'Save Changes' : 'Register Student'}
        </Button>
      </div>
    </form>
  );
}
