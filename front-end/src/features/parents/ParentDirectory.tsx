import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Input from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import Label from '../../components/form/Label';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../components/ui/table/DataTable';
import StatCards, { StatCardItem } from '../../components/ui/UIDesigns/StatCards';
import { Users, UserCheck, UserX, HeartHandshake, Eye, EyeOff } from 'lucide-react';
import { getAvatarGradient, getInitials } from '../../utils/avatarUtils';
import ParentProfileDrawer from './ParentProfileDrawer';
import ParentActionMenu from './components/ParentActionMenu';

interface ParentUser {
  id?: string;
  tenant_id: string;
  role_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
  password?: string;
  created_at?: string;
}

export default function ParentDirectory() {
  const [parents, setParents] = useState<ParentUser[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [parentRoleId, setParentRoleId] = useState<string>('');
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingParent, setEditingParent] = useState<ParentUser | null>(null);
  const [drawerParent, setDrawerParent] = useState<ParentUser | null>(null);

  const tenantId = localStorage.getItem('tenantId') || '';

  const initialFormState: ParentUser = {
    tenant_id: tenantId,
    role_id: parentRoleId,
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    is_active: true,
    password: ''
  };

  const [formData, setFormData] = useState<ParentUser>(initialFormState);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    fetchParentRoleAndUsers();
  }, [tenantId]);

  const fetchParentRoleAndUsers = async () => {
    setLoading(true);
    try {
      const rolesRes = await api.get(`/roles/tenant/${tenantId}`);
      const pRole = rolesRes.data.find((r: any) => r.name === 'Parent');
      
      if (!pRole) {
        Swal.fire('Warning', 'Parent role not found in the system. Please run the SQL script to insert the Parent role.', 'warning');
        setLoading(false);
        return;
      }
      setParentRoleId(pRole.id);

      const usersRes = await api.get(`/users/tenant/${tenantId}`);
      const parentUsers = usersRes.data.filter((u: any) => u.role_id === pRole.id);
      setParents(parentUsers);

      const studentsRes = await api.get(`/students/tenant/${tenantId}`);
      setAllStudents(studentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddView = () => {
    setEditingParent(null);
    setFormData({ ...initialFormState, role_id: parentRoleId });
    setView('form');
  };

  const openEditView = (parent: ParentUser) => {
    setEditingParent(parent);
    setFormData({ ...parent, password: '' }); 
    setView('form');
  };

  const cancelForm = () => {
    setView('list');
    setFormData({ ...initialFormState, role_id: parentRoleId });
    setEditingParent(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      if (editingParent) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await api.put(`/users/${editingParent.id}`, payload);

        Swal.fire({
          icon: 'success',
          title: 'Account Updated! 🎉',
          html: `<p class="text-sm text-gray-600">Parent account details updated successfully.</p>
                 ${formData.password ? `
                 <div style="background:#f3f4f6;padding:12px;border-radius:8px;margin-top:10px;text-align:left;font-family:monospace;">
                   <p><b>Login Email:</b> ${formData.email}</p>
                   <p><b>New Password:</b> ${formData.password}</p>
                 </div>` : ''}`,
        });
      } else {
        const passwordToUse = formData.password?.trim() ? formData.password.trim() : 'Parent@2026';
        await api.post(`/users/register`, {
          tenant_id: formData.tenant_id,
          role_name: 'Parent',
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: formData.phone_number,
          password: passwordToUse
        });

        Swal.fire({
          icon: 'success',
          title: 'Parent Account Created! 🎉',
          html: `<p class="text-sm text-gray-600">Parent login account generated successfully.</p>
                 <div style="background:#f3f4f6;padding:12px;border-radius:8px;margin-top:10px;text-align:left;font-family:monospace;">
                   <p><b>Login Email:</b> ${formData.email}</p>
                   <p><b>Password:</b> ${passwordToUse}</p>
                 </div>`,
        });
      }

      fetchParentRoleAndUsers();
      cancelForm();
    } catch (error: any) {
      console.error('Submit error:', error);
      Swal.fire('Error', error.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleResetPassword = async (parent: ParentUser) => {
    const defaultPassword = 'Parent@2026';
    const result = await Swal.fire({
      title: 'Generate / Reset Password?',
      text: `Reset login password to "${defaultPassword}" for ${parent.email}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, Reset Password',
    });

    if (!result.isConfirmed) return;

    try {
      await api.put(`/users/${parent.id}`, {
        ...parent,
        password: defaultPassword
      });

      Swal.fire({
        icon: 'success',
        title: 'Password Generated! 🔑',
        html: `<p class="text-sm text-gray-600">Login credentials updated successfully.</p>
               <div style="background:#f3f4f6;padding:12px;border-radius:8px;margin-top:10px;text-align:left;font-family:monospace;">
                 <p><b>Login Email:</b> ${parent.email}</p>
                 <p><b>New Password:</b> ${defaultPassword}</p>
               </div>`,
      });

      fetchParentRoleAndUsers();
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to reset password', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/users/${id}`);
        Swal.fire('Deleted!', 'Parent account has been deleted.', 'success');
        fetchParentRoleAndUsers();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete parent account', 'error');
      }
    }
  };

  const columns = useMemo<ColumnDef<ParentUser>[]>(
    () => [
      {
        accessorKey: 'first_name',
        header: 'Parent Name',
        cell: (info) => {
          const parent = info.row.original;
          const initials = getInitials(parent.first_name, parent.last_name);
          const gradient = getAvatarGradient(parent.id || '1');
          return (
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center text-white font-bold shadow-sm"
                style={{ background: gradient }}
              >
                {initials}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {parent.first_name} {parent.last_name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {parent.email}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'phone_number',
        header: 'Contact',
        cell: (info) => (
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {info.getValue() as string || 'N/A'}
          </span>
        ),
      },
      {
        id: 'linked_students',
        header: 'Linked Students',
        cell: (info) => {
          const count = allStudents.filter(s => s.parent_id === info.row.original.id).length;
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              {count} {count === 1 ? 'Child' : 'Children'}
            </span>
          );
        }
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: (info) => {
          const isActive = info.getValue() as boolean;
          return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isActive 
                ? 'bg-success-50 text-success-700 border-success-200 dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/20'
                : 'bg-error-50 text-error-700 border-error-200 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/20'
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <ParentActionMenu
              onView={() => setDrawerParent(row.original)}
              onEdit={() => openEditView(row.original)}
              onResetPassword={() => handleResetPassword(row.original)}
              onDelete={() => handleDelete(row.original.id!)}
            />
          </div>
        ),
      },
    ],
    [allStudents]
  );

  const statCardsData: StatCardItem[] = [
    { title: 'Total Parents', value: parents.length.toString(), icon: <Users className="w-5 h-5 text-brand-500" />, theme: 'brand' },
    { title: 'Active Accounts', value: parents.filter(p => p.is_active).length.toString(), icon: <UserCheck className="w-5 h-5 text-success-500" />, theme: 'success' },
    { title: 'Inactive Accounts', value: parents.filter(p => !p.is_active).length.toString(), icon: <UserX className="w-5 h-5 text-rose-500" />, theme: 'error' },
    { title: 'Linked Students', value: allStudents.filter(s => s.parent_id).length.toString(), icon: <HeartHandshake className="w-5 h-5 text-indigo-500" />, theme: 'indigo' },
  ];

  if (view === 'list') {
    return (
      <div className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Parent Directory</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage parent portal accounts and access.</p>
          </div>
          <Button variant="primary" onClick={openAddView} disabled={!parentRoleId}>+ Create Parent Account</Button>
        </div>

        {/* KPI Stats Panel (Agent 1 Rule 3) */}
        <StatCards stats={statCardsData} loading={loading} />

        <DataTable
          loading={loading}
          data={parents}
          columns={columns}
          searchPlaceholder="Search parents by name or email..."
          emptyMessage="No parent accounts found. Create one to get started."
          exportable={true}
          exportFilename="parents_directory"
        />

        <ParentProfileDrawer
          parent={drawerParent}
          isOpen={!!drawerParent}
          onClose={() => setDrawerParent(null)}
          allStudents={allStudents}
          onDataChange={fetchParentRoleAndUsers}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="w-full space-y-6">
      <div className="flex justify-between items-center p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editingParent ? 'Edit Parent Account' : 'Create New Parent Account'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {editingParent ? 'Update parent credentials and portal access.' : 'Add parent to the school system for portal login.'}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={cancelForm}>
          Back to Directory
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>First Name *</Label>
              <Input
                type="text"
                required
                placeholder="e.g. John"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input
                type="text"
                required
                placeholder="e.g. Doe"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email Address *</Label>
              <Input
                type="email"
                required
                placeholder="e.g. parent@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="e.g. +92 300 1234567"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
            {!editingParent && (
              <div>
                <Label>Account Password *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter secure password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
            <div>
              <SearchableSelect
                label="Account Status *"
                options={[
                  { value: true, label: 'Active' },
                  { value: false, label: 'Inactive' },
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
          loadingText={editingParent ? 'Saving Changes...' : 'Creating Account...'}
          className="min-w-[160px]"
        >
          {editingParent ? 'Save Changes' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
}
