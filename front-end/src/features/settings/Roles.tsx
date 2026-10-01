import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { createPortal } from 'react-dom';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { PlusCircle, Key, Edit2, Trash2, Users, Shield, ShieldCheck, ShieldAlert, X, MoreVertical } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../components/ui/table/DataTable';
import StatCards, { StatCardItem } from '../../components/ui/UIDesigns/StatCards';
import Button from '../../components/ui/button/Button';
import PageMeta from '../../components/common/PageMeta';

interface Role {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  is_system_role: boolean;
  users_count: number;
  created_at: string;
  updated_at?: string;
}

interface Permission {
  id: string;
  name: string;
  description?: string;
  module_name: string;
}

export default function Roles() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);

  // Data States
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [assignedPermissionIds, setAssignedPermissionIds] = useState<string[]>([]);

  // Drawer States
  const [isRoleDrawerOpen, setIsRoleDrawerOpen] = useState(false);
  const [isPermissionDrawerOpen, setIsPermissionDrawerOpen] = useState(false);

  // Deep linking: Open drawer if action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new' || searchParams.get('action') === 'create') {
      setRoleForm({ name: '', description: '' });
      setEditingRoleId(null);
      setIsRoleDrawerOpen(true);
    }
  }, [searchParams]);

  // Form State for Add/Edit Role
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  // For Permissions
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<Role | null>(null);

  // Actions Dropdown Portal
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const tenantId = localStorage.getItem('tenantId') || '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permissionsRes] = await Promise.all([
        api.get<Role[]>(`/roles/tenant/${tenantId}`),
        api.get<Permission[]>('/permissions')
      ]);
      setRoles(rolesRes.data);
      setPermissions(permissionsRes.data);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to load roles data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (roleId: string) => {
    try {
      setBtnLoading(true);
      const res = await api.get<Permission[]>(`/permissions/role/${roleId}`);
      setAssignedPermissionIds(res.data.map(p => p.id));
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to load permissions for this role.', 'error');
    } finally {
      setBtnLoading(false);
    }
  };

  const groupedPermissions = useMemo(() => {
    const groups: { [key: string]: Permission[] } = {};
    permissions.forEach(p => {
      if (!groups[p.module_name]) groups[p.module_name] = [];
      groups[p.module_name].push(p);
    });
    return groups;
  }, [permissions]);

  // Actions
  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) return;

    try {
      setBtnLoading(true);
      if (editingRoleId) {
        await api.put(`/roles/${editingRoleId}`, {
          id: editingRoleId,
          tenant_id: tenantId,
          name: roleForm.name,
          description: roleForm.description
        });
        Swal.fire({ icon: 'success', title: 'Role updated successfully', timer: 1500, showConfirmButton: false });
      } else {
        await api.post('/roles', {
          tenant_id: tenantId,
          name: roleForm.name,
          description: roleForm.description
        });
        Swal.fire({ icon: 'success', title: 'Role added successfully', timer: 1500, showConfirmButton: false });
      }
      setIsRoleDrawerOpen(false);
      const rolesRes = await api.get<Role[]>(`/roles/tenant/${tenantId}`);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to save role data.', 'error');
    } finally {
      setBtnLoading(false);
    }
  };

  const openAddRoleDrawer = () => {
    setEditingRoleId(null);
    setRoleForm({ name: '', description: '' });
    setIsRoleDrawerOpen(true);
  };

  const openEditRoleDrawer = (role: Role) => {
    if (role.is_system_role) {
      Swal.fire('Restricted', 'System roles cannot be modified.', 'warning');
      return;
    }
    setEditingRoleId(role.id);
    setRoleForm({ name: role.name, description: role.description || '' });
    setIsRoleDrawerOpen(true);
    setActiveDropdown(null);
  };

  const handleDeleteRole = async (role: Role) => {
    setActiveDropdown(null);
    if (role.is_system_role) {
      Swal.fire('Forbidden', 'System roles cannot be deleted.', 'error');
      return;
    }

    if (role.users_count > 0) {
      Swal.fire('Warning', `Cannot delete role. There are ${role.users_count} users assigned to it.`, 'warning');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: "This role will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#465fff',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/roles/${role.id}`);
          Swal.fire('Deleted!', 'Role has been removed.', 'success');
          setRoles(roles.filter(r => r.id !== role.id));
        } catch (error) {
          console.error(error);
          Swal.fire('Error', 'Cannot delete role.', 'error');
        }
      }
    });
  };

  const openManagePermissionsDrawer = async (role: Role) => {
    setActiveDropdown(null);
    setSelectedRoleForPermissions(role);
    await fetchRolePermissions(role.id);
    setIsPermissionDrawerOpen(true);
  };

  const handlePermissionCheckboxChange = (permissionId: string) => {
    setAssignedPermissionIds(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAllInModule = (modulePermissions: Permission[], checkAll: boolean) => {
    const ids = modulePermissions.map(p => p.id);
    if (checkAll) {
      setAssignedPermissionIds(prev => Array.from(new Set([...prev, ...ids])));
    } else {
      setAssignedPermissionIds(prev => prev.filter(id => !ids.includes(id)));
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleForPermissions) return;
    try {
      setBtnLoading(true);
      await api.post(`/permissions/role/${selectedRoleForPermissions.id}/assign`, {
        permission_ids: assignedPermissionIds
      });
      Swal.fire({ icon: 'success', title: 'Permissions saved.', timer: 1500, showConfirmButton: false });
      setIsPermissionDrawerOpen(false);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to save permissions configuration.', 'error');
    } finally {
      setBtnLoading(false);
    }
  };

  // Portal Dropdown Logic
  const handleDropdownClick = (e: React.MouseEvent, roleId: string) => {
    e.stopPropagation();
    if (activeDropdown === roleId) {
      setActiveDropdown(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuHeight = 160; // approximate height of the menu

    setDropdownPosition({
      top: spaceBelow < menuHeight ? rect.top + window.scrollY - menuHeight : rect.bottom + window.scrollY,
      left: rect.left + window.scrollX - 120, // offset to align right
    });
    
    setActiveDropdown(roleId);
  };

  useEffect(() => {
    const closeDropdown = () => setActiveDropdown(null);
    window.addEventListener('click', closeDropdown);
    window.addEventListener('scroll', closeDropdown, true);
    return () => {
      window.removeEventListener('click', closeDropdown);
      window.removeEventListener('scroll', closeDropdown, true);
    };
  }, []);

  // Stats
  const totalRoles = roles.length;
  const systemRoles = roles.filter(r => r.is_system_role).length;
  const customRoles = totalRoles - systemRoles;

  // --- COLUMN DEFINITIONS ---
  const columns = React.useMemo<ColumnDef<Role>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Role Name',
      cell: info => <span className="font-bold text-gray-900 dark:text-white">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: info => <div className="text-gray-600 dark:text-gray-400 truncate max-w-xs">{info.getValue() as string || '-'}</div>,
    },
    {
      accessorKey: 'is_system_role',
      header: () => <div className="text-center">Type</div>,
      cell: info => {
        const isSystem = info.getValue() as boolean;
        return (
          <div className="text-center">
            {isSystem ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                System
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                Custom
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'users_count',
      header: () => <div className="text-center">Users</div>,
      cell: info => (
        <div className="flex items-center justify-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
          <Users className="w-4 h-4 text-gray-400" /> {info.getValue() as number}
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: () => <div className="text-center">Created</div>,
      cell: info => (
        <div className="text-center text-gray-500 dark:text-gray-400">
          {new Date(info.getValue() as string).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: info => (
        <div className="text-right relative">
          <button
            onClick={(e) => handleDropdownClick(e, info.row.original.id)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-white/10 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ], []);

  const statCardsData: StatCardItem[] = [
    { title: 'Total Roles', value: totalRoles.toString(), icon: <Shield className="w-5 h-5 text-brand-500" />, theme: 'brand' },
    { title: 'System Roles', value: systemRoles.toString(), icon: <ShieldAlert className="w-5 h-5 text-amber-500" />, theme: 'warning' },
    { title: 'Custom Roles', value: customRoles.toString(), icon: <ShieldCheck className="w-5 h-5 text-success-500" />, theme: 'success' },
  ];

  return (
    <>
      <PageMeta title="Roles & Permissions | EduERP" description="Manage system roles and access control" />

      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage access control and define responsibilities for all system users.</p>
        </div>

        {/* KPI Stats */}
        <StatCards stats={statCardsData} loading={loading} />

        {/* Data Grid */}
        <DataTable
          loading={loading}
          data={roles}
          columns={columns}
          searchPlaceholder="Search roles..."
          emptyMessage="No roles found."
          exportable={true}
          exportFilename="roles_directory"
          leftActions={
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Role Directory</h2>
          }
          rightActions={
            <Button
              variant="primary"
              onClick={openAddRoleDrawer}
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Add Custom Role
            </Button>
          }
        />

      </div>

      {/* Actions Portal Menu */}
      {activeDropdown && createPortal(
        <div
          className="absolute z-[1000] w-48 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden py-1"
          style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
        >
          <button
            onClick={() => {
              const role = roles.find(r => r.id === activeDropdown);
              if(role) openManagePermissionsDrawer(role);
            }}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
          >
            <Key className="w-4 h-4 text-brand-500" /> Manage Permissions
          </button>
          
          <div className="h-px bg-gray-100 dark:bg-white/10 my-1" />
          
          <button
            onClick={() => {
              const role = roles.find(r => r.id === activeDropdown);
              if(role) openEditRoleDrawer(role);
            }}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4 text-gray-400" /> Edit Role
          </button>
          <button
            onClick={() => {
              const role = roles.find(r => r.id === activeDropdown);
              if(role) handleDeleteRole(role);
            }}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-500/10 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete Role
          </button>
        </div>,
        document.body
      )}

      {/* Add/Edit Role Slide-Over Drawer */}
      {isRoleDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[999] transition-opacity" onClick={() => setIsRoleDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-[1000] transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-100 dark:border-white/10">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingRoleId ? 'Edit Custom Role' : 'Create Custom Role'}
              </h2>
              <button onClick={() => setIsRoleDrawerOpen(false)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="role-form" onSubmit={handleRoleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Role Name <span className="text-error-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    placeholder="e.g. IT Administrator"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-theme-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Description</label>
                  <textarea
                    rows={4}
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    placeholder="Describe the purpose of this role..."
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-theme-xs resize-none"
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRoleDrawerOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                form="role-form"
                type="submit"
                variant="primary"
                loading={btnLoading}
                loadingText="Saving..."
                className="flex-1"
              >
                Save Role
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Manage Permissions Slide-Over Drawer */}
      {isPermissionDrawerOpen && selectedRoleForPermissions && (
        <>
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[999] transition-opacity" onClick={() => setIsPermissionDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-4xl bg-white dark:bg-slate-900 shadow-2xl z-[1000] transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-100 dark:border-white/10">
            
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-brand-500" /> Permissions Matrix
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Modifying access control for: <strong className="text-gray-900 dark:text-white">{selectedRoleForPermissions.name}</strong>
                </p>
              </div>
              <button onClick={() => setIsPermissionDrawerOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 dark:bg-black/10">
              {btnLoading && !assignedPermissionIds.length ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.keys(groupedPermissions).map((moduleName) => {
                    const modulePerms = groupedPermissions[moduleName];
                    const allChecked = modulePerms.every(p => assignedPermissionIds.includes(p.id));

                    return (
                      <div key={moduleName} className="rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
                        
                        {/* Module Header */}
                        <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-white/5 flex items-center justify-between">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                            {moduleName}
                          </h3>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Select All</span>
                            <input
                              type="checkbox"
                              checked={allChecked}
                              onChange={(e) => handleSelectAllInModule(modulePerms, e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                            />
                          </label>
                        </div>
                        
                        {/* Permissions Grid */}
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {modulePerms.map((permission) => {
                            const isChecked = assignedPermissionIds.includes(permission.id);
                            return (
                              <label
                                key={permission.id}
                                className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                                  isChecked 
                                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10 dark:border-brand-500/50' 
                                    : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'
                                }`}
                              >
                                <div className="flex-shrink-0 mt-0.5">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handlePermissionCheckboxChange(permission.id)}
                                    className="w-4.5 h-4.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">{permission.name}</p>
                                  {permission.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{permission.description}</p>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPermissionDrawerOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={handleSavePermissions}
                loading={btnLoading}
                loadingText="Applying..."
              >
                Apply Permissions
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}