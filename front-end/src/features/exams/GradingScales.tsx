import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { ColumnDef } from '@tanstack/react-table';

// Components
import Input from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import Label from '../../components/form/Label';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import ActionMenu, { ActionMenuItem } from '../../components/ui/UIDesigns/ActionMenu';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import { DataTable } from '../../components/ui/table/DataTable';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Skeleton } from '../../components/ui/Skeleton';
import { toast } from '../../components/ui/Toast';

// Icons
import { Plus, Edit, Trash2, Award, List, Star, TrendingUp, CheckCircle, AlertTriangle, Sparkles, Layers, ShieldCheck } from 'lucide-react';

// --- TYPES ---
interface GradingScale {
  id: string;
  tenant_id: string;
  grade_name: string;
  min_percentage: number;
  max_percentage: number;
  gpa_point: number;
  remarks: string;
  is_passing_grade?: boolean;
  badge_color?: string;
  education_level?: string;
}

export default function GradingScales() {
  const tenantId = localStorage.getItem("tenantId") || "";

  // --- STATES ---
  const [scales, setScales] = useState<GradingScale[]>([]);
  const [loading, setLoading] = useState(true);
  const [presetLoading, setPresetLoading] = useState(false);
  
  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form State
  const initialForm: Partial<GradingScale> = {
    tenant_id: tenantId,
    grade_name: '',
    min_percentage: 0,
    max_percentage: 100,
    gpa_point: 0.0,
    remarks: '',
    is_passing_grade: true,
    badge_color: 'success',
    education_level: 'General'
  };
  const [formData, setFormData] = useState<any>(initialForm);

  // --- FETCH DATA ---
  const fetchScales = async () => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (!activeTenant) return;
    setLoading(true);
    try {
      const res = await api.get<GradingScale[]>(`/gradingscales/tenant/${activeTenant}`);
      setScales(res.data);
    } catch (err) {
      toast.error('Failed to load grading scales from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScales();
  }, [tenantId]);

  // --- COVERAGE AUDIT & GAPS COMPUTATION ---
  const coverageAudit = useMemo(() => {
    if (scales.length === 0) {
      return { isFullyCovered: false, hasGaps: true, message: 'No grading rules created yet.' };
    }

    const sorted = [...scales].sort((a, b) => a.min_percentage - b.min_percentage);
    const minBound = sorted[0].min_percentage;
    const maxBound = sorted[sorted.length - 1].max_percentage;

    let hasGap = false;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].max_percentage < sorted[i + 1].min_percentage - 0.01) {
        hasGap = true;
        break;
      }
    }

    const covers100 = minBound <= 0 && maxBound >= 99.9;
    if (covers100 && !hasGap) {
      return { isFullyCovered: true, hasGaps: false, message: '100% Percentage Scale Covered (0% to 100%) with 0 Gaps!' };
    } else if (hasGap) {
      return { isFullyCovered: false, hasGaps: true, message: 'Warning: Percentage gap detected between grading rules.' };
    } else {
      return { isFullyCovered: false, hasGaps: false, message: `Partial Coverage: Scale spans ${minBound}% to ${maxBound}%.` };
    }
  }, [scales]);

  // --- STATS DATA ---
  const stats: StatCardData[] = useMemo(() => {
    if (scales.length === 0) return [
      { title: 'Active Rules', value: 0, icon: <List className="w-6 h-6 text-brand-500" />, theme: 'brand' },
      { title: 'Highest Grade', value: 'N/A', icon: <Star className="w-6 h-6 text-success-500" />, theme: 'success' },
      { title: 'Max GPA', value: '0.00', icon: <TrendingUp className="w-6 h-6 text-indigo-500" />, theme: 'indigo' },
    ];
    
    const sorted = [...scales].sort((a, b) => b.gpa_point - a.gpa_point);
    return [
      { title: 'Active Rules', value: scales.length, icon: <List className="w-6 h-6 text-brand-500" />, theme: 'brand' },
      { title: 'Highest Grade', value: sorted[0].grade_name, icon: <Star className="w-6 h-6 text-success-500" />, theme: 'success' },
      { title: 'Max GPA', value: Number(sorted[0].gpa_point).toFixed(2), icon: <TrendingUp className="w-6 h-6 text-indigo-500" />, theme: 'indigo' },
    ];
  }, [scales]);

  // --- ACTIONS ---
  const handleAddNew = () => {
    setFormData({
      ...initialForm,
      tenant_id: tenantId || localStorage.getItem("tenantId") || ""
    });
    setIsEditing(false);
    setIsDrawerOpen(true);
  };

  const handleEdit = (record: GradingScale) => {
    setFormData({ ...record });
    setIsEditing(true);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string, grade: string) => {
    const result = await Swal.fire({
      title: 'Delete Rule?',
      text: `Are you sure you want to delete the rule for Grade "${grade}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Delete'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/gradingscales/${id}`);
        setScales(prev => prev.filter(s => s.id !== id));
        toast.success(`Grading rule for ${grade} deleted successfully.`);
      } catch (err) {
        toast.error('Failed to delete grading rule.');
      }
    }
  };

  const handleSeedPreset = async (presetType: string) => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    const res = await Swal.fire({
      title: `Populate ${presetType === 'GPA4' ? '4.0 GPA System' : 'Cambridge O/A-Levels'}?`,
      text: 'This will auto-populate pre-configured standard grade rules.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Populate Preset',
      confirmButtonColor: '#3b82f6'
    });

    if (res.isConfirmed) {
      setPresetLoading(true);
      try {
        await api.post(`/gradingscales/tenant/${activeTenant}/seed-preset?presetType=${presetType}`);
        toast.success(`Preset '${presetType}' populated successfully!`);
        fetchScales();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to seed preset template.');
      } finally {
        setPresetLoading(false);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const minPct = Number(formData.min_percentage);
    const maxPct = Number(formData.max_percentage);
    const gpa = Number(formData.gpa_point);

    if (isNaN(minPct) || isNaN(maxPct) || minPct >= maxPct) {
      toast.error('Minimum percentage must be less than Maximum percentage.');
      return;
    }

    const currentTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (!currentTenant) {
      toast.error('Session expired or Tenant ID missing. Please log in again.');
      return;
    }

    const payload = {
      tenant_id: currentTenant,
      grade_name: formData.grade_name,
      min_percentage: minPct,
      max_percentage: maxPct,
      gpa_point: isNaN(gpa) ? 0 : gpa,
      remarks: formData.remarks || '',
      is_passing_grade: formData.is_passing_grade !== false,
      badge_color: formData.badge_color || 'success',
      education_level: formData.education_level || 'General'
    };

    setSubmitLoading(true);
    try {
      if (isEditing) {
        await api.put(`/gradingscales/${formData.id}`, payload);
        toast.success('Grading scale updated successfully!');
      } else {
        await api.post('/gradingscales', payload);
        toast.success('New grading scale created!');
      }
      setIsDrawerOpen(false);
      fetchScales();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save grading scale.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- TABLE COLUMNS ---
  const columns = useMemo<ColumnDef<GradingScale>[]>(() => [
    {
      header: 'Grade Name',
      accessorKey: 'grade_name',
      cell: (info: any) => (
        <Badge variant="solid" color={(info.row.original.badge_color || 'primary') as any} size="md">
          {info.getValue()}
        </Badge>
      ),
    },
    {
      header: 'Level Scope',
      accessorKey: 'education_level',
      cell: (info: any) => (
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
          {info.getValue() || 'General'}
        </span>
      )
    },
    {
      header: 'Percentage Range',
      id: 'range',
      accessorFn: (row: GradingScale) => `${row.min_percentage} - ${row.max_percentage}`,
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 dark:text-gray-200">{row.min_percentage}%</span>
            <span className="text-gray-400">to</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">{row.max_percentage}%</span>
          </div>
        );
      }
    },
    {
      header: 'GPA Point',
      accessorKey: 'gpa_point',
      cell: (info: any) => (
        <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-black px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
          {Number(info.getValue()).toFixed(2)}
        </span>
      )
    },
    {
      header: 'Evaluation',
      id: 'pass_fail',
      cell: (info: any) => {
        const isPass = info.row.original.is_passing_grade !== false;
        return isPass ? (
          <Badge variant="light" color="success" size="sm" className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Passing Grade
          </Badge>
        ) : (
          <Badge variant="solid" color="error" size="sm" className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Fail / Re-sit
          </Badge>
        );
      }
    },
    {
      header: 'Remarks',
      accessorKey: 'remarks',
      cell: (info: any) => <span className="text-gray-600 dark:text-gray-400 font-medium">{info.getValue() || '-'}</span>
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (info: any) => {
        const row = info.row.original;
        const groups: ActionMenuItem[][] = [
          [
            { label: 'Edit Rule', icon: <Edit className="w-4 h-4" />, onClick: () => handleEdit(row) },
            { label: 'Delete Rule', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(row.id, row.grade_name), isDanger: true }
          ]
        ];
        return (
          <div className="flex justify-end">
            <ActionMenu groups={groups} />
          </div>
        );
      }
    }
  ], []);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      <Breadcrumb items={[{ label: 'Examinations', href: '#' }, { label: 'Grading Scales' }]} />
      
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Grading Scale Engine</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure global grade rules, GPA allocations, pass/fail thresholds, and level scopes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => handleSeedPreset('GPA4')} disabled={presetLoading} className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" /> Load 4.0 GPA Preset
          </Button>
          <Button variant="outline" onClick={() => handleSeedPreset('CAMBRIDGE')} disabled={presetLoading} className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-500" /> Load Cambridge Preset
          </Button>
          <Button variant="primary" onClick={handleAddNew} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Grading Rule
          </Button>
        </div>
      </div>

      {/* Dynamic Coverage Audit Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
        coverageAudit.isFullyCovered 
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
          : coverageAudit.hasGaps 
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
      }`}>
        <div className="flex items-center gap-3">
          {coverageAudit.isFullyCovered ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          )}
          <div>
            <div className="font-semibold text-sm">Scale Coverage Audit</div>
            <div className="text-xs opacity-90">{coverageAudit.message}</div>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/70 dark:bg-black/30 border border-current">
          {coverageAudit.isFullyCovered ? '100% Validated' : 'Audit Notice'}
        </span>
      </div>

      {/* STATS */}
      <StatCards stats={stats} loading={loading} />

      {/* DATA TABLE SECTION */}
      <DataTable
        loading={loading}
        data={scales}
        columns={columns}
        searchPlaceholder="Search grades or remarks..."
        emptyMessage="No grading rules found."
        exportable={true}
        exportFilename="GradingScales"
      />

      {/* DRAWER FORM (Add/Edit) using ProfileDrawer */}
      <ProfileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={isEditing ? 'Update Grading Rule' : 'New Grading Rule'}
        subtitle="Configure grade boundaries, GPA allocation, and badge colors"
      >
        <form id="gradingForm" onSubmit={handleFormSubmit} className="space-y-6 pt-4">
          <div>
            <Label required>Grade Name</Label>
            <Input 
              type="text" 
              placeholder="e.g. A+, B..." 
              value={formData.grade_name} 
              onChange={(e: any) => setFormData({...formData, grade_name: e.target.value.toUpperCase()})} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <SearchableSelect
                label="Education Level Scope *"
                options={[
                  { value: 'General', label: 'General / All Levels' },
                  { value: 'Primary', label: 'Primary Level' },
                  { value: 'Middle', label: 'Middle Level' },
                  { value: 'High School', label: 'High School / Secondary' },
                ]}
                value={formData.education_level || 'General'}
                onChange={(val) => setFormData({ ...formData, education_level: val as string })}
              />
            </div>
            <div>
              <SearchableSelect
                label="Badge Color Theme *"
                options={[
                  { value: 'success', label: 'Green (Success)' },
                  { value: 'primary', label: 'Blue (Primary)' },
                  { value: 'info', label: 'Sky Blue (Info)' },
                  { value: 'warning', label: 'Yellow (Warning)' },
                  { value: 'error', label: 'Red (Error)' },
                  { value: 'purple', label: 'Purple' },
                ]}
                value={formData.badge_color || 'success'}
                onChange={(val) => setFormData({ ...formData, badge_color: val as string })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Min %</Label>
              <Input 
                type="number" 
                step={0.01} min="0" max="100"
                placeholder="0" 
                value={formData.min_percentage} 
                onChange={(e: any) => setFormData({...formData, min_percentage: e.target.value})} 
                required 
              />
            </div>
            <div>
              <Label required>Max %</Label>
              <Input 
                type="number" 
                step={0.01} min="0" max="100"
                placeholder="100" 
                value={formData.max_percentage} 
                onChange={(e: any) => setFormData({...formData, max_percentage: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>GPA Point</Label>
              <Input 
                type="number" 
                step={0.01} min="0" max="5"
                placeholder="4.0" 
                value={formData.gpa_point} 
                onChange={(e: any) => setFormData({...formData, gpa_point: e.target.value})} 
                required 
              />
            </div>
            <div>
              <SearchableSelect
                label="Evaluation Type *"
                options={[
                  { value: 'true', label: 'Passing Grade' },
                  { value: 'false', label: 'Failing Grade / Re-sit' },
                ]}
                value={formData.is_passing_grade !== false ? 'true' : 'false'}
                onChange={(val) => setFormData({ ...formData, is_passing_grade: val === 'true' })}
              />
            </div>
          </div>

          <div>
            <Label>Remarks</Label>
            <Input 
              type="text" 
              placeholder="e.g. Outstanding, Excellent, Fail..." 
              value={formData.remarks} 
              onChange={(e: any) => setFormData({...formData, remarks: e.target.value})} 
            />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitLoading}
              loadingText="Saving..."
              disabled={!formData.grade_name}
            >
              Save Rule
            </Button>
          </div>
        </form>
      </ProfileDrawer>
    </div>
  );
}
