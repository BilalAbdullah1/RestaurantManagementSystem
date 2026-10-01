import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Badge from '../../components/ui/badge/Badge';
import SearchableSelect, { SearchableSelectOption } from '../../components/form/select/SearchableSelect';
import { DebouncedSearch } from '../../components/form/DebouncedSearch';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { toast } from '../../components/ui/Toast';
import {
  ShieldCheck, Lock, Key, Users, CheckSquare, Square, Save,
  RotateCcw, Sparkles, CheckCheck, XCircle, Search, Layers,
  ChevronDown, ChevronUp, AlertCircle, Info, FileSpreadsheet
} from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';

interface RoleItem {
  id: string;
  name: string;
  description?: string;
  is_system_role?: boolean;
}

interface PermissionItem {
  id: string;
  name: string;
  description?: string;
  module_name: string;
}

interface MatrixResponse {
  roles: RoleItem[];
  permissions: PermissionItem[];
  rolePermissions: Record<string, string[]>;
}

export default function PermissionsMatrixManager() {
  const tenantId = localStorage.getItem('tenantId') || '';

  const [searchParams] = useSearchParams();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [matrixMap, setMatrixMap] = useState<Record<string, Set<string>>>({});
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seedingPreset, setSeedingPreset] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  // Fetch Matrix bundle from API
  const fetchMatrix = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await api.get<MatrixResponse>(`/permissions/tenant/${tenantId}/matrix`);
      const data = res.data;
      setRoles(data.roles || []);
      setPermissions(data.permissions || []);

      // Convert arrays to Set for O(1) lookups
      const parsedMap: Record<string, Set<string>> = {};
      if (data.rolePermissions) {
        Object.entries(data.rolePermissions).forEach(([roleId, permIds]) => {
          parsedMap[roleId] = new Set(permIds || []);
        });
      }
      setMatrixMap(parsedMap);

      // Auto-select first role if not selected
      if (data.roles && data.roles.length > 0) {
        setSelectedRoleId(prev => {
          const exists = data.roles.some(r => r.id === prev);
          return exists ? prev : data.roles[0].id;
        });
      }
    } catch (err: any) {
      toast.error('Failed to load Permissions Matrix.');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix]);

  // Deep linking: Handle URL query params
  useEffect(() => {
    const r = searchParams.get('role');
    if (r) setSelectedRoleId(r);
    const q = searchParams.get('search');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const activeRole = useMemo(() => {
    return roles.find(r => r.id === selectedRoleId) || null;
  }, [roles, selectedRoleId]);

  const activeAssignedSet = useMemo(() => {
    if (!selectedRoleId || !matrixMap[selectedRoleId]) return new Set<string>();
    return matrixMap[selectedRoleId];
  }, [matrixMap, selectedRoleId]);

  // Group permissions by module_name
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionItem[]> = {};
    permissions.forEach(p => {
      const mod = p.module_name || 'General Operations';
      if (!groups[mod]) groups[mod] = [];
      groups[mod].push(p);
    });
    return groups;
  }, [permissions]);

  // Filtered grouped permissions
  const filteredGroupedPermissions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return groupedPermissions;

    const filtered: Record<string, PermissionItem[]> = {};
    Object.entries(groupedPermissions).forEach(([mod, perms]) => {
      const matched = perms.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        mod.toLowerCase().includes(q)
      );
      if (matched.length > 0) {
        filtered[mod] = matched;
      }
    });
    return filtered;
  }, [groupedPermissions, searchQuery]);

  // Toggle single permission for current role
  const handleTogglePermission = (permissionId: string) => {
    if (!selectedRoleId) return;

    setMatrixMap(prev => {
      const currentSet = new Set(prev[selectedRoleId] || []);
      if (currentSet.has(permissionId)) {
        currentSet.delete(permissionId);
      } else {
        currentSet.add(permissionId);
      }
      return {
        ...prev,
        [selectedRoleId]: currentSet
      };
    });
  };

  // Toggle all permissions within a specific module
  const handleToggleModule = (modulePermissions: PermissionItem[]) => {
    if (!selectedRoleId) return;

    const modPermIds = modulePermissions.map(p => p.id);
    const allSelected = modPermIds.every(id => activeAssignedSet.has(id));

    setMatrixMap(prev => {
      const currentSet = new Set(prev[selectedRoleId] || []);
      if (allSelected) {
        modPermIds.forEach(id => currentSet.delete(id));
      } else {
        modPermIds.forEach(id => currentSet.add(id));
      }
      return {
        ...prev,
        [selectedRoleId]: currentSet
      };
    });
  };

  // Grant all permissions to current role
  const handleGrantAll = () => {
    if (!selectedRoleId) return;
    setMatrixMap(prev => ({
      ...prev,
      [selectedRoleId]: new Set(permissions.map(p => p.id))
    }));
    toast.info(`Granted all permissions to "${activeRole?.name}". Remember to click Save.`);
  };

  // Revoke all permissions for current role
  const handleRevokeAll = () => {
    if (!selectedRoleId) return;
    setMatrixMap(prev => ({
      ...prev,
      [selectedRoleId]: new Set<string>()
    }));
    toast.info(`Revoked all permissions from "${activeRole?.name}". Remember to click Save.`);
  };

  // Toggle collapse state for a module section
  const toggleCollapseModule = (modName: string) => {
    setCollapsedModules(prev => ({
      ...prev,
      [modName]: !prev[modName]
    }));
  };

  // Save current role's assigned permissions to backend
  const handleSaveMatrix = async () => {
    if (!selectedRoleId || !activeRole) {
      toast.error('No role selected.');
      return;
    }

    const assignedIds = Array.from(activeAssignedSet);
    setSaving(true);
    try {
      await api.post(`/permissions/role/${selectedRoleId}/assign`, {
        permission_ids: assignedIds
      });

      toast.success(`Permissions Matrix for "${activeRole.name}" updated successfully!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save permissions matrix.');
    } finally {
      setSaving(false);
    }
  };

  // Reset to recommended system presets
  const handleSeedPresets = async () => {
    const result = await Swal.fire({
      title: 'Reset to Standard RBAC Presets?',
      text: 'This will ensure all standard system permissions are loaded and reset standard roles to recommended role-permission assignments.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      confirmButtonText: 'Yes, Apply Recommended Presets'
    });

    if (!result.isConfirmed) return;

    setSeedingPreset(true);
    try {
      const res = await api.post(`/permissions/tenant/${tenantId}/seed-preset`);
      toast.success(res.data?.message || 'Standard matrix presets applied successfully.');
      fetchMatrix();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to seed matrix presets.');
    } finally {
      setSeedingPreset(false);
    }
  };

  // Options for SearchableSelect
  const roleOptions: SearchableSelectOption[] = useMemo(() => {
    return roles.map(r => ({
      value: r.id,
      label: `🛡️ ${r.name} ${r.is_system_role ? '(System Role)' : '(Custom Role)'}`
    }));
  }, [roles]);

  // Coverage Stats Calculation
  const totalPermCount = permissions.length;
  const assignedPermCount = activeAssignedSet.size;
  const coveragePercent = totalPermCount > 0 ? Math.round((assignedPermCount / totalPermCount) * 100) : 0;

  const statCardsData: StatCardData[] = useMemo(() => [
    {
      title: 'Configured System Roles',
      value: `${roles.length} Roles`,
      icon: <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      theme: 'brand'
    },
    {
      title: 'Total Permissions Catalog',
      value: `${totalPermCount} Directives`,
      icon: <Key className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      theme: 'brand'
    },
    {
      title: `Granted to ${activeRole?.name || 'Selected'}`,
      value: `${assignedPermCount} Granted (${coveragePercent}%)`,
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      theme: coveragePercent > 80 ? 'success' : coveragePercent > 30 ? 'purple' : 'warning'
    },
    {
      title: 'Security Access Level',
      value: activeRole?.name === 'Admin' ? 'Full SuperAdmin (Root)' : coveragePercent > 50 ? 'High Functional (Staff)' : 'Restricted (End-User)',
      icon: <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      theme: activeRole?.name === 'Admin' ? 'success' : 'brand'
    }
  ], [roles.length, totalPermCount, activeRole?.name, assignedPermCount, coveragePercent]);

  return (
    <div className="w-full max-w-full space-y-6">

      {/* Top Breadcrumb Navigation */}
      <Breadcrumb items={[
        { label: 'System Settings', href: '/settings' },
        { label: 'Permissions Matrix & Role-Based Access Control (RBAC)' }
      ]} />

      {/* Main Header Banner Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Role-Based Access Control (RBAC) & Permissions Matrix
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure granular security policies, view module permissions, and control operational capabilities for each system role.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSeedPresets}
              disabled={seedingPreset}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl transition-all h-11 flex items-center gap-2 shadow-sm disabled:opacity-50"
              title="Reset matrix to standard recommended school role permissions"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{seedingPreset ? 'Applying Presets...' : 'Recommended Presets'}</span>
            </button>

            <button
              onClick={handleSaveMatrix}
              disabled={saving || !selectedRoleId}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all h-11 flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Security Matrix...' : `Save "${activeRole?.name || 'Role'}" Matrix`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <StatCards stats={statCardsData} />

      {/* Role Selection Toolbar & Filter Control */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Role Dropdown */}
          <div className="w-full lg:w-96">
            <SearchableSelect
              label="Select Role to Configure Permissions *"
              options={roleOptions}
              value={selectedRoleId}
              onChange={(val) => setSelectedRoleId(val)}
              placeholder="Select a system role..."
            />
          </div>

          {/* Search Filter */}
          <div className="w-full lg:w-80">
            <DebouncedSearch
              value={searchQuery}
              onChange={(val) => setSearchQuery(val)}
              placeholder="Search permission or module..."
            />
          </div>

          {/* Quick Action Bulk Buttons */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <button
              onClick={handleGrantAll}
              className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              title="Grant all permissions in the system to this role"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Grant All</span>
            </button>
            <button
              onClick={handleRevokeAll}
              className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              title="Revoke all permissions from this role"
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Revoke All</span>
            </button>
          </div>
        </div>

        {/* Role Active Coverage Progress Bar */}
        {activeRole && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700 dark:text-gray-300">
                Active Role: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{activeRole.name}</span>
              </span>
              {activeRole.is_system_role && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                  SYSTEM
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${coveragePercent}%` }}
                />
              </div>
              <span className="font-bold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {assignedPermCount} / {totalPermCount} ({coveragePercent}%)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Permissions Matrix Grouped by Modules */}
      {loading ? (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      ) : Object.keys(filteredGroupedPermissions).length === 0 ? (
        <div className="bg-white dark:bg-gray-900 p-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-800 dark:text-white">No Permissions Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {searchQuery ? `No permissions matched "${searchQuery}". Try a different keyword.` : 'Click "Recommended Presets" above to seed standard system permissions.'}
          </p>
          <button
            onClick={handleSeedPresets}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>Load Standard System Permissions</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(filteredGroupedPermissions).map(([modName, modPerms]) => {
            const isCollapsed = !!collapsedModules[modName];
            const modPermIds = modPerms.map(p => p.id);
            const selectedInModCount = modPermIds.filter(id => activeAssignedSet.has(id)).length;
            const isAllModSelected = modPerms.length > 0 && selectedInModCount === modPerms.length;
            const isPartialModSelected = selectedInModCount > 0 && !isAllModSelected;

            return (
              <div
                key={modName}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-all"
              >
                {/* Module Header Strip */}
                <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCollapseModule(modName)}
                      className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition"
                      title={isCollapsed ? 'Expand module permissions' : 'Collapse module'}
                    >
                      {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">
                        {modName}
                      </h3>
                      <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {selectedInModCount} / {modPerms.length} Enabled
                      </span>
                    </div>
                  </div>

                  {/* Module Toggle All Checkbox */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleToggleModule(modPerms)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-xs"
                    >
                      {isAllModSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : isPartialModSelected ? (
                        <div className="w-4 h-4 rounded border-2 border-indigo-600 bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black">
                          -
                        </div>
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                      <span>{isAllModSelected ? 'Deselect All' : 'Select All in Module'}</span>
                    </button>
                  </div>
                </div>

                {/* Module Permissions Grid */}
                {!isCollapsed && (
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {modPerms.map(perm => {
                      const isGranted = activeAssignedSet.has(perm.id);

                      return (
                        <div
                          key={perm.id}
                          onClick={() => handleTogglePermission(perm.id)}
                          className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 select-none ${
                            isGranted
                              ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800/80 shadow-xs'
                              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800/40'
                          }`}
                        >
                          <div className="space-y-1 pr-2">
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                              {perm.name}
                            </p>
                            {perm.description && (
                              <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900 inline-block">
                                {perm.description}
                              </span>
                            )}
                          </div>

                          <div className="pt-0.5">
                            {isGranted ? (
                              <div className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                <CheckSquare className="w-4 h-4" />
                              </div>
                            ) : (
                              <Square className="w-5 h-5 text-gray-400 dark:text-gray-600 hover:text-gray-600" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating / Bottom Sticky Action Bar */}
      <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Info className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span>
            Changes made in the matrix apply dynamically to all users assigned to{' '}
            <strong className="text-gray-800 dark:text-white">{activeRole?.name || 'this role'}</strong>.
          </span>
        </div>

        <button
          onClick={handleSaveMatrix}
          disabled={saving || !selectedRoleId}
          className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Security Policy...' : `Save "${activeRole?.name || 'Role'}" Permissions`}</span>
        </button>
      </div>

    </div>
  );
}
