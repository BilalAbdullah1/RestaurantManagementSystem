import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import Input from '../../components/form/input/InputField';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { toast } from '../../components/ui/Toast';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { Trophy, Award, Flag, Plus, Shield, Medal, Star } from 'lucide-react';
import { DataTable } from '../../components/ui/table/DataTable';

interface HouseSummary {
  house_name: string;
  total_points: number;
  student_count: number;
}

interface HousePointLog {
  id?: string;
  tenant_id: string;
  house_name: string;
  student_id?: string;
  points: number;
  reason: string;
  awarded_by?: string;
  student_name?: string;
  created_at?: string;
}

interface Student { id: string; first_name: string; last_name: string; house_name?: string; }

const HOUSE_OPTIONS = [
  { value: 'Red', label: '🔴 Red House (Gryffindor)' },
  { value: 'Blue', label: '🔵 Blue House (Ravenclaw)' },
  { value: 'Green', label: '🟢 Green House (Slytherin)' },
  { value: 'Yellow', label: '🟡 Yellow House (Hufflepuff)' },
];

const HOUSE_COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  Red: { bg: 'from-rose-500 to-red-600', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-900', badge: 'bg-rose-100 text-rose-800' },
  Blue: { bg: 'from-blue-500 to-indigo-600', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900', badge: 'bg-blue-100 text-blue-800' },
  Green: { bg: 'from-emerald-500 to-teal-600', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-900', badge: 'bg-emerald-100 text-emerald-800' },
  Yellow: { bg: 'from-amber-400 to-yellow-500', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900', badge: 'bg-amber-100 text-amber-800' },
};

export default function HouseSystemDashboard() {
  const tenantId = localStorage.getItem('tenantId') || '';
  const [houseSummary, setHouseSummary] = useState<HouseSummary[]>([]);
  const [pointLogs, setPointLogs] = useState<HousePointLog[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<HousePointLog>({
    tenant_id: tenantId,
    house_name: 'Red',
    student_id: '',
    points: 10,
    reason: '',
    awarded_by: 'House Master',
  });

  useEffect(() => {
    if (!tenantId) return;
    fetchData();
  }, [tenantId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [houseRes, studentsRes] = await Promise.all([
        api.get(`/housepoints/tenant/${tenantId}`).catch(() => ({ data: { summary: [], logs: [] } })),
        api.get(`/students/tenant/${tenantId}`).catch(() => ({ data: [] })),
      ]);
      setHouseSummary(Array.isArray(houseRes.data?.summary) ? houseRes.data.summary : []);
      setPointLogs(Array.isArray(houseRes.data?.logs) ? houseRes.data.logs : []);
      const stList = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      setStudents(stList.filter((s: any) => s?.is_active));
    } catch (err) {
      console.error('Failed to load house system data', err);
    } finally {
      setLoading(false);
    }
  };

  const openAwardDrawer = () => {
    setFormData({
      tenant_id: tenantId,
      house_name: 'Red',
      student_id: '',
      points: 10,
      reason: '',
      awarded_by: 'House Master',
    });
    setDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/housepoints', formData);
      toast.success(`${formData.points} Points awarded to ${formData.house_name} House!`);
      setDrawerOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to award points.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (log: HousePointLog) => {
    const res = await Swal.fire({
      title: 'Revoke Points?',
      text: `Remove ${log.points} points from ${log.house_name} House?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
    });
    if (!res.isConfirmed) return;
    try {
      await api.delete(`/housepoints/${log.id}`);
      toast.success('House points revoked successfully.');
      fetchData();
    } catch (err) {
      toast.error('Failed to revoke points.');
    }
  };

  // Find Leader House
  const leadingHouse = useMemo(() => {
    if (!houseSummary.length) return null;
    return [...houseSummary].sort((a, b) => b.total_points - a.total_points)[0];
  }, [houseSummary]);

  const stats: StatCardData[] = [
    { title: 'Leader House 🏆', value: leadingHouse ? `${leadingHouse.house_name} House` : 'N/A', icon: <Trophy className="w-5 h-5 text-amber-500" />, theme: 'warning' },
    { title: 'Total Award Logs', value: pointLogs.length, icon: <Medal className="w-5 h-5 text-indigo-500" />, theme: 'indigo' },
    { title: 'Red House Points', value: houseSummary.find(h => h.house_name === 'Red')?.total_points || 0, icon: <Flag className="w-5 h-5 text-rose-500" />, theme: 'error' },
    { title: 'Blue House Points', value: houseSummary.find(h => h.house_name === 'Blue')?.total_points || 0, icon: <Flag className="w-5 h-5 text-blue-500" />, theme: 'brand' },
  ];

  const columns = useMemo<ColumnDef<HousePointLog>[]>(() => [
    {
      accessorKey: 'house_name',
      header: 'House',
      cell: info => {
        const hName = info.getValue() as string;
        const style = HOUSE_COLOR_MAP[hName] || HOUSE_COLOR_MAP.Red;
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${style.badge}`}>
            {hName} House
          </span>
        );
      },
    },
    {
      accessorKey: 'points',
      header: 'Points',
      cell: info => {
        const pts = info.getValue() as number;
        return (
          <span className={`font-mono font-bold text-sm ${pts >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {pts >= 0 ? `+${pts}` : pts} Pts
          </span>
        );
      },
    },
    {
      accessorKey: 'reason',
      header: 'Reason / Award Description',
      cell: info => <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'student_name',
      header: 'Recipient Student',
      cell: info => <span className="text-sm text-gray-600 dark:text-gray-300">{info.getValue() as string || 'Whole House'}</span>,
    },
    {
      accessorKey: 'created_at',
      header: 'Award Date',
      cell: info => <span className="text-xs font-mono text-gray-500">{new Date(info.getValue() as string).toLocaleDateString()}</span>,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: info => (
        <div className="flex justify-end">
          <ActionMenu
            groups={[
              [
                { label: 'Revoke Points', icon: <Trophy className="w-4 h-4" />, onClick: () => handleDelete(info.row.original), isDanger: true }
              ]
            ]}
          />
        </div>
      ),
    },
  ], []);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Co-Curricular & House System Leaderboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track Red, Blue, Green, and Yellow house points, sports, and academic achievements.</p>
        </div>
        <Button variant="primary" onClick={openAwardDrawer}>
          <Plus className="w-4 h-4 mr-2" /> Award House Points
        </Button>
      </div>

      {/* House Leaderboard Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {['Red', 'Blue', 'Green', 'Yellow'].map(hName => {
          const summary = houseSummary.find(h => h.house_name === hName);
          const style = HOUSE_COLOR_MAP[hName];
          const isLeader = leadingHouse?.house_name === hName && (leadingHouse?.total_points || 0) > 0;
          return (
            <div
              key={hName}
              className={`relative rounded-2xl p-6 border ${style.border} bg-white dark:bg-gray-900 shadow-xl overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 left-0 h-2 bg-gradient-to-r ${style.bg}`} />
              {isLeader && (
                <div className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Trophy className="w-3 h-3 text-amber-500" /> LEADER
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.bg} flex items-center justify-center text-white font-bold shadow-md`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{hName} House</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{summary?.student_count || 0} Enrolled</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-baseline">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Points</span>
                <span className={`text-3xl font-extrabold font-mono ${style.text}`}>
                  {summary?.total_points || 0}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stat Cards */}
      <StatCards stats={stats} loading={loading} />

      {/* Table */}
      <DataTable
        loading={loading}
        data={pointLogs}
        columns={columns}
        searchPlaceholder="Search point logs by house, reason, or student..."
        emptyMessage="No house points awarded yet."
        exportable={true}
        exportFilename="house_points_log"
      />

      {/* Drawer */}
      <ProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Award House Points"
        subtitle="Recognize sports, debate, discipline or academic victories"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <SearchableSelect
              label="Select House *"
              options={HOUSE_OPTIONS}
              value={formData.house_name}
              onChange={val => setFormData({ ...formData, house_name: val as string })}
            />
          </div>

          <div>
            <Label>Points Amount * (e.g. 10 for Win, -5 for Penalty)</Label>
            <Input
              type="number"
              required
              value={formData.points}
              onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label>Reason / Achievement Description *</Label>
            <textarea
              rows={3}
              required
              placeholder="e.g. 1st Place in Annual Science Quiz Competition"
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 resize-none"
            />
          </div>

          <div>
            <SearchableSelect
              label="Individual Student Recipient (Optional)"
              options={[{ value: '', label: 'Entire House (Collective)' }, ...students.map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name}` }))]}
              value={formData.student_id || ''}
              onChange={val => setFormData({ ...formData, student_id: val as string })}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              loadingText="Awarding..."
              className="flex-1"
            >
              Award Points
            </Button>
          </div>
        </form>
      </ProfileDrawer>
    </div>
  );
}
