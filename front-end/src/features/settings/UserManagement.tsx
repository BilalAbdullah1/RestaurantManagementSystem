import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Input from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import SearchableSelect, { SearchableSelectOption } from '../../components/form/select/SearchableSelect';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import ImageUpload from '../../components/form/ImageUpload';
import { getAvatarGradient, getInitials } from '../../utils/avatarUtils';
import { getFileBaseUrl } from '../../utils/apiConfig';
import { Eye, EyeOff, Users, ShieldCheck, UserCheck, UserX, Plus } from 'lucide-react';

interface User {
  id?: string;
  tenant_id: string;
  role_id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string; 
  phone_number: string;
  is_active: boolean;
  profile_picture_url?: string | null;
  created_at?: string;
}

interface Role {
  id: string;
  name: string;
}

const nativeSelect = "w-full h-11 px-4 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600";

const initialFormState = (tenantId: string): User => ({
  tenant_id: tenantId,
  role_id: '',
  first_name: '',
  last_name: '',
  email: '',
  password_hash: '',
  phone_number: '',
  is_active: true,
  profile_picture_url: null
});

export default function UserManagement() {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const [activeTab, setActiveTab] = useState<'directory' | 'form'>('directory');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const tenantId = localStorage.getItem("tenantId") || "";
  const [formData, setFormData] = useState<User>(initialFormState(tenantId));
  const [showPassword, setShowPassword] = useState(false);

  // Deep linking: Handle URL query params
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openAddTab();
    }
    const r = searchParams.get('role');
    if (r) {
      setFilterRole(r);
    }
    const q = searchParams.get('search');
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const roleFilterOptions: SearchableSelectOption[] = useMemo(() => [
    { value: 'all', label: 'All Roles' },
    ...roles.map(r => ({ value: r.id, label: r.name }))
  ], [roles]);

  const roleFormOptions: SearchableSelectOption[] = useMemo(() => [
    ...roles.map(r => ({ value: r.id, label: r.name }))
  ], [roles]);

  const statsData: StatCardData[] = useMemo(() => [
    {
      title: 'Total System Users',
      value: users.length,
      icon: <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      theme: 'brand'
    },
    {
      title: 'Active Accounts',
      value: users.filter(u => u.is_active).length,
      icon: <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      theme: 'success'
    },
    {
      title: 'Deactivated / Suspended',
      value: users.filter(u => !u.is_active).length,
      icon: <UserX className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      theme: 'error'
    },
    {
      title: 'Configured Roles',
      value: roles.length,
      icon: <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      theme: 'indigo'
    }
  ], [users, roles]);

  // Fetch initial data
  useEffect(() => {
    if (!tenantId) {
      Swal.fire('Error', 'Tenant ID missing. Please login again.', 'error');
      return;
    }
    fetchData();
  }, [tenantId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        api.get<User[]>(`/users/tenant/${tenantId}`),
        api.get<Role[]>(`/roles/tenant/${tenantId}`) // Ensure this endpoint exists in your RolesController
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (err) {
      console.error("Failed to load users or roles.");
    } finally {
      setLoading(false);
    }
  };

  // Map role_id to role name for table display
  const roleMap = useMemo(() => {
    const map: Record<string, string> = {};
    roles.forEach(r => { map[r.id] = r.name; });
    return map;
  }, [roles]);

  // Filtered dataset
  const filteredUsers = useMemo(() => {
    const keyword = searchQuery.toLowerCase();
    return users.filter(user => {
      const matchesSearch = 
        user.first_name.toLowerCase().includes(keyword) ||
        user.last_name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword);
      
      const matchesRole = filterRole === 'all' || user.role_id === filterRole;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, filterRole]);

  const openAddTab = () => {
    setEditingUser(null);
    setFormData(initialFormState(tenantId));
    setActiveTab('form');
  };

  const openEditTab = (user: User) => {
    setEditingUser(user);
    setFormData({ 
        ...user, 
        password_hash: '' // Never show hashed password. Leave blank.
    });
    setActiveTab('form');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.role_id) {
      Swal.fire('Warning', 'Please assign a role to this user.', 'warning');
      return;
    }

    setSubmitLoading(true);
    try {
      if (editingUser && editingUser.id) {
        // Edit mode: api.put
        await api.put(`/users/${editingUser.id}`, { ...formData, id: editingUser.id });
        Swal.fire({ icon: 'success', title: 'User Updated', text: 'Profile modifications saved.', timer: 2000, showConfirmButton: false });
      } else {
        // Create mode: Uses your existing register endpoint
        await api.post('/users/register', formData);
        Swal.fire({ icon: 'success', title: 'User Created', text: 'New system user registered.', timer: 2000, showConfirmButton: false });
      }
      
      setActiveTab('directory');
      fetchData();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to process user data.";
      Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteUser = async (user: User) => {
    const result = await Swal.fire({
      title: 'Delete User?',
      text: `Are you sure you want to permanently remove ${user.first_name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete'
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/users/${user.id}`);
      Swal.fire({ icon: 'success', title: 'Deleted', text: 'User removed from system.', timer: 1500, showConfirmButton: false });
      fetchData();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Delete Failed', text: err.response?.data?.message || 'Error executing delete.' });
    }
  };

  return (
    <div className="w-full space-y-6">
      <Breadcrumb items={[{ label: 'System Settings', href: '#' }, { label: 'User Accounts & Access Control' }]} />

      <StatCards stats={statsData} loading={loading} />

      {/* ----------------- TAB BAR ----------------- */}
      <div className="flex items-center gap-1 border-b border-gray-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-5 py-3 text-sm font-bold transition-colors border-b-2 -mb-px 
            ${activeTab === 'directory' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          User Directory
        </button>
        <button
          onClick={openAddTab}
          className={`px-5 py-3 text-sm font-bold transition-colors border-b-2 -mb-px 
            ${activeTab === 'form' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          {editingUser ? 'Edit User' : '+ Add New User'}
        </button>
      </div>

      {/* ----------------- TAB 1: DIRECTORY ----------------- */}
      {activeTab === 'directory' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm">
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-xs font-bold mb-2 text-gray-500 dark:text-slate-400 uppercase tracking-wider">Search</label>
              <Input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            <div className="w-full sm:w-64">
              <label className="block text-xs font-bold mb-2 text-gray-500 dark:text-slate-400 uppercase tracking-wider">Filter by Role</label>
              <SearchableSelect
                options={roleFilterOptions}
                value={filterRole}
                onChange={(val) => setFilterRole(val as string || 'all')}
                placeholder="All Roles"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, rowIndex) => (
                    <tr key={`skeleton-${rowIndex}`} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32" />
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-40" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" /></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-16" /></td>
                      <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center mb-3 shadow-inner">
                          <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">
                          No User Accounts Found
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                          No staff or administrative user profiles matched your current search filters.
                        </p>
                        <Button variant="primary" onClick={openAddTab} className="bg-blue-600 hover:bg-blue-700">
                          + Add New System User
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          {user.profile_picture_url ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 shrink-0">
                              <img 
                                src={getFileBaseUrl(user.profile_picture_url)} 
                                alt={`${user.first_name} ${user.last_name}`} 
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                              />
                            </div>
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getAvatarGradient(`${user.first_name} ${user.last_name}`)} shrink-0`}>
                              {getInitials(user.first_name, user.last_name)}
                            </div>
                          )}
                          <span>{user.first_name} {user.last_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{user.email}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {roleMap[user.role_id] || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-4">
                        <button onClick={() => openEditTab(user)} className="text-blue-600 hover:underline font-semibold text-sm">Edit</button>
                        <button onClick={() => deleteUser(user)} className="text-rose-600 hover:underline font-semibold text-sm">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: FORM ----------------- */}
      {activeTab === 'form' && (
        <form onSubmit={handleFormSubmit} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 space-y-6">
          <ImageUpload 
            label="User Profile Picture" 
            currentImageUrl={formData.profile_picture_url} 
            onUploadSuccess={(url) => setFormData({ ...formData, profile_picture_url: url })} 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-slate-300">First Name *</label>
              <Input type="text" required value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-slate-300">Last Name *</label>
              <Input type="text" required value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-slate-300">Email *</label>
              <Input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-slate-300">Phone Number</label>
              <Input type="text" value={formData.phone_number || ''} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-slate-300">Assign Role *</label>
              <SearchableSelect
                options={roleFormOptions}
                value={formData.role_id}
                onChange={(val) => setFormData({ ...formData, role_id: val as string || '' })}
                placeholder="Select a role..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-slate-300">
                Password {editingUser ? '(Leave blank to keep current)' : '*'}
              </label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  required={!editingUser} 
                  placeholder={editingUser ? "••••••••" : "Enter secure password"} 
                  value={formData.password_hash} 
                  onChange={(e) => setFormData({...formData, password_hash: e.target.value})} 
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 py-4">
             <input 
               type="checkbox" 
               checked={formData.is_active} 
               onChange={(e) => setFormData({...formData, is_active: e.target.checked})} 
               className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
             />
             <label className="text-sm font-bold text-gray-700 dark:text-slate-300 cursor-pointer">Account is Active</label>
          </div>

          <div className="flex justify-end gap-4 border-t border-gray-100 dark:border-slate-800 pt-6">
            <Button type="button" variant="outline" onClick={() => setActiveTab('directory')}>Cancel</Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitLoading}
              loadingText={editingUser ? 'Updating User...' : 'Creating User...'}
            >
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}