import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import Badge from '../../components/ui/badge/Badge';
import ImageUpload from '../../components/form/ImageUpload';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import DatePicker from '../../components/form/date-picker';
import Button from '../../components/ui/button/Button';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../components/ui/table/DataTable';
import { toast } from '../../components/ui/Toast';
import { Upload, Download, Plus, Users } from 'lucide-react';

// Components
import StaffStats from './components/StaffStats';
import StaffDrawer from './components/StaffDrawer';
import StaffActionMenu from './components/StaffActionMenu';
import { getAvatarGradient, getInitials } from '../../utils/avatarUtils';
import { getFileBaseUrl } from '../../utils/apiConfig';

interface Staff {
  id?: string;
  tenant_id: string;
  role_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  cnic: string;
  staff_type?: 'Teaching' | 'Non-Teaching' | 'Management';
  designation: string;
  qualification: string;
  basic_salary: number;
  joining_date: string;
  is_active: boolean;
  profile_picture_url?: string | null;
  cnic_doc_url?: string | null;
  degree_doc_url?: string | null;
  contract_doc_url?: string | null;
  created_at?: string;
}

const initialFormState = (tenantId: string, roleId: string): Staff => ({
  tenant_id: tenantId,
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  cnic: '',
  role_id: roleId,
  staff_type: 'Teaching',
  designation: '',
  qualification: '',
  basic_salary: 0,
  joining_date: new Date().toISOString().split('T')[0],
  is_active: true,
  profile_picture_url: null,
  cnic_doc_url: '',
  degree_doc_url: '',
  contract_doc_url: ''
});

export default function StaffDirectory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'Teaching' | 'Non-Teaching' | 'inactive'>('all');
  
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [drawerStaff, setDrawerStaff] = useState<Staff | null>(null);

  const tenantId = localStorage.getItem("tenantId") || "";
  const userRoleId = localStorage.getItem("userRole") || "";
  const [formData, setFormData] = useState<Staff>(initialFormState(tenantId, userRoleId));
  
  const designations = [
    'Principal', 'Vice Principal', 'Coordinator', 'Senior Teacher', 'Junior Teacher',
    'Subject Specialist', 'Accountant', 'Admin Officer', 'IT Administrator', 'Lab Assistant', 'Librarian'
  ];

  useEffect(() => {
    if (!tenantId) {
      Swal.fire({
        icon: 'error',
        title: 'Unable to Continue',
        text: 'We could not identify your restaurant workspace. Please log in again.',
        confirmButtonColor: '#2563eb'
      });
      setLoading(false);
      return;
    }
    fetchStaffData();
  }, [tenantId]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openAddView();
    }
  }, [searchParams]);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const response = await api.get<Staff[]>(`/staff/tenant/${tenantId}`);
      setStaffList(response.data);
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Unable to Load Staff',
        text: 'Something went wrong while retrieving faculty and staff records.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await api.get(`/importexport/export/staff/${tenantId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Staff_Export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Staff directory CSV exported successfully!');
    } catch {
      if (staffList.length === 0) {
        Swal.fire('Notice', 'No staff records available to export.', 'info');
        return;
      }
      const headers = ['First Name', 'Last Name', 'Designation', 'Category', 'Qualification', 'CNIC', 'Phone', 'Email', 'Basic Salary', 'Joining Date', 'Status'];
      const rows = staffList.map(s => [
        `"${s.first_name || ''}"`,
        `"${s.last_name || ''}"`,
        `"${s.designation || ''}"`,
        `"${s.staff_type || 'Teaching'}"`,
        `"${s.qualification || ''}"`,
        `"${s.cnic || ''}"`,
        `"${s.phone || ''}"`,
        `"${s.email || ''}"`,
        `"${s.basic_salary || 0}"`,
        `"${s.joining_date ? s.joining_date.split('T')[0] : ''}"`,
        `"${s.is_active ? 'Active' : 'Inactive'}"`
      ].join(','));
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Staff_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Staff directory CSV downloaded!');
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
        const res = await api.post(`/importexport/import/staff/${tenantId}`, uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire({
          icon: 'success',
          title: 'CSV Import Completed',
          text: res.data.message || 'Staff records imported successfully.',
          confirmButtonColor: '#4f46e5',
        });
        fetchStaffData();
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Import Failed',
          text: err.response?.data?.message || 'Could not process CSV file. Ensure format matches template.',
          confirmButtonColor: '#ef4444',
        });
      } finally {
        setLoading(false);
      }
    };
    input.click();
  };

  const openAddView = () => {
    setEditingStaff(null);
    setFormData(initialFormState(tenantId, userRoleId));
    setView('form');
  };

  const openEditView = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      ...staff,
      joining_date: staff.joining_date ? staff.joining_date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setView('form');
  };

  const cancelForm = () => {
    setEditingStaff(null);
    setFormData(initialFormState(tenantId, userRoleId));
    setView('list');
  };

  const formatCnic = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name) {
      Swal.fire({ icon: 'warning', title: 'Name Required', text: "Please enter staff member's full name.", confirmButtonColor: '#2563eb' });
      return;
    }
    if (formData.basic_salary <= 0) {
      Swal.fire({ icon: 'warning', title: 'Invalid Salary', text: 'Please enter a valid basic salary amount.', confirmButtonColor: '#2563eb' });
      return;
    }

    setSubmitLoading(true);
    try {
      if (editingStaff && editingStaff.id) {
        await api.put(`/staff/${editingStaff.id}`, formData);
        Swal.fire({ icon: 'success', title: 'Profile Updated', text: 'Staff profile updated successfully.', timer: 1800, showConfirmButton: false });
      } else {
        await api.post('/staff', formData);
        Swal.fire({ icon: 'success', title: 'Staff Registered', text: 'New staff member registered successfully.', timer: 1800, showConfirmButton: false });
      }
      cancelForm();
      fetchStaffData();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Please review the form data and try again.";
      Swal.fire({ icon: 'error', title: 'Unable to Save', text: errorMsg, confirmButtonColor: '#ef4444' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const removeStaff = async (staff: Staff) => {
    const staffLabel = `${staff.first_name} ${staff.last_name}`;
    const result = await Swal.fire({
      title: 'Remove Staff Profile?',
      text: `This will permanently remove ${staffLabel} from the system.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Remove'
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/staff/${staff.id}`);
      Swal.fire({ icon: 'success', title: 'Removed', text: 'The staff profile has been removed.', timer: 1500, showConfirmButton: false });
      fetchStaffData();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "We could not remove this staff profile. Please try again.";
      Swal.fire({ icon: 'error', title: 'Unable to Remove', text: errorMsg });
    }
  };

  const generateStaffLogin = async (staff: Staff) => {
    try {
      setLoading(true);
      const response = await api.post(`/staff/${staff.id}/generate-account`);
      Swal.fire({
        icon: 'success',
        title: 'Account Configured',
        html: `
          <div class="text-left mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p class="mb-2"><span class="font-bold text-gray-700 dark:text-gray-300">Email/Username:</span> <span class="font-mono text-brand-600 dark:text-brand-400">${response.data.username}</span></p>
            <p><span class="font-bold text-gray-700 dark:text-gray-300">Password:</span> <span class="font-mono text-brand-600 dark:text-brand-400">${response.data.password}</span></p>
            <p class="text-xs text-gray-500 mt-4">Please securely share these credentials with the staff member.</p>
          </div>
        `,
        confirmButtonColor: '#2563eb'
      });
      fetchStaffData();
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

  const filteredStaff = useMemo(() => {
    if (activeTab === 'all') return staffList;
    if (activeTab === 'inactive') return staffList.filter(s => !s.is_active);
    return staffList.filter(s => s.is_active && (s.staff_type === activeTab || (activeTab === 'Teaching' && (!s.staff_type || s.staff_type === 'Teaching'))));
  }, [staffList, activeTab]);

  const columns = useMemo<ColumnDef<Staff>[]>(
    () => [
      {
        accessorFn: row => `${row.first_name} ${row.last_name}`,
        id: 'fullName',
        header: 'Faculty / Staff Member',
        cell: info => {
          const staff = info.row.original;
          const fullName = info.getValue() as string;
          
          return (
            <div className="flex items-center gap-3">
              {staff.profile_picture_url ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 shrink-0">
                  <img 
                    src={getFileBaseUrl(staff.profile_picture_url)} 
                    alt={fullName} 
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                  />
                </div>
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getAvatarGradient(fullName)} shrink-0`}>
                  {getInitials(staff.first_name, staff.last_name)}
                </div>
              )}
              <div>
                <div 
                  className="text-sm font-semibold text-gray-800 dark:text-white/90 hover:text-brand-500 cursor-pointer transition-colors"
                  onClick={() => setDrawerStaff(staff)}
                >
                  {fullName}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">CNIC: {staff.cnic || 'N/A'}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'designation',
        header: 'Designation & Qual.',
        cell: info => {
          const staff = info.row.original;
          return (
            <div>
              <div className="text-sm font-medium text-brand-600 dark:text-brand-400">{staff.designation}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{staff.qualification}</div>
            </div>
          );
        }
      },
      {
        accessorKey: 'staff_type',
        header: 'Category',
        cell: info => {
          const cat = (info.getValue() as string) || 'Teaching';
          return (
            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {cat}
            </span>
          );
        }
      },
      {
        accessorKey: 'basic_salary',
        header: 'Basic Salary',
        cell: info => (
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            Rs. {Number(info.getValue() || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        )
      },
      {
        accessorKey: 'phone',
        header: 'Contact Info',
        cell: info => {
          const staff = info.row.original;
          return (
            <div>
              <div className="text-sm text-gray-900 dark:text-gray-200 font-mono">{staff.phone}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[170px]">{staff.email}</div>
            </div>
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
            <StaffActionMenu 
              onView={() => setDrawerStaff(info.row.original)}
              onEdit={() => openEditView(info.row.original)}
              onDelete={() => removeStaff(info.row.original)}
              onGenerateLogin={() => generateStaffLogin(info.row.original)}
              onAttendance={() => navigate(`/StaffAttendance?search=${encodeURIComponent(info.row.original.first_name)}`)}
              onSalarySlip={() => navigate(`/SalarySlipsManager?search=${encodeURIComponent(info.row.original.first_name)}`)}
            />
          </div>
        ),
      },
    ],
    [navigate]
  );

  // Calculate Stats
  const activeCount = staffList.filter(s => s.is_active).length;
  const avgSalary = staffList.length > 0 
    ? staffList.reduce((acc, curr) => acc + (Number(curr.basic_salary) || 0), 0) / staffList.length 
    : 0;

  // ─── LIST VIEW ────────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="w-full space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Directory</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Search, view and manage restaurant staff credentials and payroll baselines.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="outline" onClick={handleImportCsv} startIcon={<Upload className="w-4 h-4" />}>
              Import CSV
            </Button>
            <Button variant="outline" onClick={handleExportCsv} startIcon={<Download className="w-4 h-4" />}>
              Export CSV
            </Button>
            <Button variant="primary" onClick={openAddView} startIcon={<Plus className="w-4 h-4" />}>
              + Add Staff Member
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <StaffStats 
          totalStaff={staffList.length}
          activeStaff={activeCount}
          inactiveStaff={staffList.length - activeCount}
          avgSalary={avgSalary}
          loading={loading}
        />

        {/* Actionable Empty State Card or TanStack DataTable */}
        {staffList.length === 0 && !loading ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center shadow-sm">
            <div className="max-w-md mx-auto flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 border border-brand-100 dark:border-brand-800">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-800 dark:text-white mb-2">
                No Faculty or Staff Members Registered Yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                Start building your restaurant staff roster by adding teachers, administrative staff, or importing staff records via CSV.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button variant="primary" onClick={openAddView} startIcon={<Plus className="w-4 h-4" />}>
                  + Add First Staff Member
                </Button>
                <Button variant="outline" onClick={handleImportCsv} startIcon={<Upload className="w-4 h-4" />}>
                  Import Staff CSV
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <DataTable
            loading={loading}
            data={filteredStaff}
            columns={columns}
            searchPlaceholder="Search faculty & staff directory..."
            emptyMessage="No staff members found in this category."
            leftActions={
              <div className="flex p-1 space-x-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl overflow-x-auto">
                {[
                  { id: 'all', label: 'All Staff' },
                  { id: 'Teaching', label: 'Teaching Faculty' },
                  { id: 'Non-Teaching', label: 'Non-Teaching Staff' },
                  { id: 'inactive', label: 'Inactive / Former' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                      activeTab === tab.id
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
            exportFilename="staff_directory"
          />
        )}

        {/* Slide-Over Profile Drawer */}
        <StaffDrawer 
          isOpen={!!drawerStaff} 
          staff={drawerStaff} 
          onClose={() => setDrawerStaff(null)} 
        />

      </div>
    );
  }

  // ─── FORM VIEW ────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleFormSubmit} className="w-full space-y-6">

      <div className="flex justify-between items-center p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            {editingStaff ? 'Edit Staff Profile' : 'Register New Staff Member'}
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

        {/* Card 1: Personal Profile */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <span className="text-brand-500">👤</span> Personal Information
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <ImageUpload 
              label="Staff Profile Picture" 
              currentImageUrl={formData.profile_picture_url} 
              onUploadSuccess={(url) => setFormData({ ...formData, profile_picture_url: url })} 
            />
            <div className="grid grid-cols-2 gap-5">
              <div>
                <Label required>First Name</Label>
                <Input type="text" required placeholder="e.g. Tariq" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
              </div>
              <div>
                <Label required>Last Name</Label>
                <Input type="text" required placeholder="e.g. Mahmood" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
              </div>
            </div>
            <div>
              <Label required>CNIC Number</Label>
              <Input 
                type="text" 
                required 
                placeholder="42101-1234567-1" 
                value={formData.cnic} 
                onChange={(e) => setFormData({ ...formData, cnic: formatCnic(e.target.value) })} 
              />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <Label required>Phone Number</Label>
                <Input type="text" required placeholder="03001234567" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <Label required>Email Address</Label>
                <Input type="email" required placeholder="staff@restaurant.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Employment & Category */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <span className="text-emerald-500">💼</span> Employment & Designation
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <SearchableSelect 
                  label="Staff Category *"
                  options={[
                    { value: 'Teaching', label: 'Teaching Faculty' },
                    { value: 'Non-Teaching', label: 'Non-Teaching Staff' },
                    { value: 'Management', label: 'Management Staff' }
                  ]}
                  value={formData.staff_type || 'Teaching'}
                  onChange={(val) => setFormData({ ...formData, staff_type: val as any })}
                />
              </div>
              <div>
                <SearchableSelect 
                  label="Designation *"
                  options={designations.map(d => ({ value: d, label: d }))}
                  value={formData.designation}
                  onChange={(val) => setFormData({ ...formData, designation: val as string })}
                  placeholder="Select Designation"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <Label required>Qualification</Label>
                <Input type="text" required placeholder="e.g. M.Sc / M.Phil" value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} />
              </div>
              <div>
                <Label required>Basic Salary (PKR)</Label>
                <Input type="number" required min="0" placeholder="e.g. 65000" value={formData.basic_salary || ''} onChange={(e) => setFormData({ ...formData, basic_salary: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <DatePicker 
                  label="Joining Date *"
                  value={formData.joining_date}
                  onChange={(e: any) => setFormData({ ...formData, joining_date: e.target.value })}
                  placeholder="Select Joining Date"
                />
              </div>
              <div>
                <SearchableSelect 
                  label="Employment Status *"
                  options={[
                    { value: 'true', label: 'Active (Currently Employed)' },
                    { value: 'false', label: 'Inactive (Left / Suspended)' }
                  ]}
                  value={String(formData.is_active)}
                  onChange={(val) => setFormData({ ...formData, is_active: val === 'true' })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Contract & Document Vault */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <span className="text-brand-500">📁</span> Contract & Document Vault
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Digital Credentials & Archive</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <Label>CNIC Document URL</Label>
                <Input 
                  type="text" 
                  placeholder="https://.../cnic_copy.pdf" 
                  value={formData.cnic_doc_url || ''} 
                  onChange={(e) => setFormData({ ...formData, cnic_doc_url: e.target.value })} 
                />
              </div>
              <div>
                <Label>Degree Certificate URL</Label>
                <Input 
                  type="text" 
                  placeholder="https://.../degree_cert.pdf" 
                  value={formData.degree_doc_url || ''} 
                  onChange={(e) => setFormData({ ...formData, degree_doc_url: e.target.value })} 
                />
              </div>
              <div>
                <Label>Contract Agreement URL</Label>
                <Input 
                  type="text" 
                  placeholder="https://.../appointment_letter.pdf" 
                  value={formData.contract_doc_url || ''} 
                  onChange={(e) => setFormData({ ...formData, contract_doc_url: e.target.value })} 
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Action Bar */}
      <div className="flex justify-end items-center space-x-4 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        <Button type="button" variant="outline" onClick={cancelForm}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={submitLoading}
          loadingText="Saving Profile..."
        >
          Save Staff Record
        </Button>
      </div>

    </form>
  );
}