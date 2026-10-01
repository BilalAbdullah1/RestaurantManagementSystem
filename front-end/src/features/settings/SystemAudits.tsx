import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../components/ui/table/DataTable';
import PageMeta from '../../components/common/PageMeta';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import { toast } from '../../components/ui/Toast';
import Swal from 'sweetalert2';
import { ShieldCheck, Activity, Database, Server, Download, Copy, Eye, Clock, FileText } from 'lucide-react';


interface AuditLog {
  id: string;
  tenant_id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string;
  old_values: string | null;
  new_values: string | null;
  ip_address: string | null;
  created_at: string;
}

export default function SystemAudits() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tenantId = localStorage.getItem('tenantId') || '';
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState(searchParams.get('action') || 'ALL');
  
  // Drawer state for inspecting JSON Diff
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const act = searchParams.get('action');
    if (act && act !== actionFilter) {
      setActionFilter(act);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!tenantId) return;
    fetchLogs();
  }, [tenantId]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/AuditLogs/tenant/${tenantId}`);
      setLogs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      toast.error('Failed to load system audit trail.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    if (actionFilter === 'ALL') return logs;
    return logs.filter(l => l.action?.toUpperCase() === actionFilter.toUpperCase());
  }, [logs, actionFilter]);

  const inspectLog = (log: AuditLog) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const exportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['Timestamp', 'Action', 'Table Name', 'Record ID', 'IP Address'];
    const rowsList = filteredLogs.map(l => [
      new Date(l.created_at).toLocaleString(),
      l.action,
      l.table_name,
      l.record_id,
      l.ip_address || 'N/A'
    ]);
    const csvContent = [headers.join(','), ...rowsList.map(e => e.map(field => `"${field}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `System_Audit_Logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit logs exported to CSV');
  };

  // KPI Summary
  const stats: StatCardData[] = useMemo(() => {
    const total = logs.length;
    const added = logs.filter(l => l.action === 'Added' || l.action === 'INSERT').length;
    const modified = logs.filter(l => l.action === 'Modified' || l.action === 'UPDATE').length;
    const deleted = logs.filter(l => l.action === 'Deleted' || l.action === 'DELETE').length;

    return [
      { title: 'Total Audit Events', value: total, icon: <Activity className="w-5 h-5 text-indigo-500" />, theme: 'indigo' },
      { title: 'Database Inserts', value: added, icon: <Database className="w-5 h-5 text-emerald-500" />, theme: 'success' },
      { title: 'Record Updates', value: modified, icon: <Server className="w-5 h-5 text-amber-500" />, theme: 'warning' },
      { title: 'Record Deletions', value: deleted, icon: <ShieldCheck className="w-5 h-5 text-rose-500" />, theme: 'error' },
    ];
  }, [logs]);

  const columns: ColumnDef<AuditLog>[] = useMemo(() => [
    {
      accessorKey: 'created_at',
      header: 'Timestamp',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span>{new Date(row.original.created_at).toLocaleString()}</span>
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => {
        const act = (row.original.action || '').toUpperCase();
        let color: 'success' | 'warning' | 'error' | 'primary' = 'primary';
        if (act === 'ADDED' || act === 'INSERT') color = 'success';
        else if (act === 'MODIFIED' || act === 'UPDATE') color = 'warning';
        else if (act === 'DELETED' || act === 'DELETE') color = 'error';

        return (
          <Badge variant="light" color={color}>
            {row.original.action}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'table_name',
      header: 'Target Table',
      cell: ({ row }) => (
        <span className="font-semibold text-gray-800 dark:text-gray-200">
          {row.original.table_name}
        </span>
      ),
    },
    {
      accessorKey: 'record_id',
      header: 'Record ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
          {row.original.record_id}
        </span>
      ),
    },
    {
      accessorKey: 'ip_address',
      header: 'IP Address',
      cell: ({ row }) => (
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          {row.original.ip_address || '127.0.0.1'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ActionMenu
            groups={[
              [
                {
                  label: 'Inspect Change Diff',
                  icon: <Eye className="w-4 h-4 text-indigo-500" />,
                  onClick: () => inspectLog(row.original)
                },
                {
                  label: 'Copy Record ID',
                  icon: <Copy className="w-4 h-4 text-gray-500" />,
                  onClick: () => copyToClipboard(row.original.record_id, 'Record ID')
                }
              ]
            ]}
          />
        </div>
      ),
    }
  ], []);

  const renderPrettyJson = (jsonStr: string | null) => {
    if (!jsonStr) return <span className="text-gray-400 italic">None</span>;
    try {
      const parsed = JSON.parse(jsonStr);
      return (
        <pre className="text-xs font-mono bg-slate-950 text-emerald-400 p-4 rounded-xl overflow-x-auto border border-slate-800 shadow-inner max-h-80">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch {
      return <span className="text-xs font-mono text-gray-300">{jsonStr}</span>;
    }
  };

  return (
    <>
      <PageMeta title="System Audit Logs" description="View and monitor system data changes" />

      <div className="w-full space-y-6">
        <Breadcrumb items={[{ label: 'System Settings' }, { label: 'System Audit Logs' }]} />

        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-600" /> System Audit Trail & Logs
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time audit log tracking all database CRUD mutations, IP addresses, and user activity.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-44">
              <SearchableSelect
                options={[
                  { value: 'ALL', label: 'All Actions' },
                  { value: 'Added', label: '🟢 Inserts (Added)' },
                  { value: 'Modified', label: '🟡 Updates (Modified)' },
                  { value: 'Deleted', label: '🔴 Deletions (Deleted)' },
                ]}
                value={actionFilter}
                onChange={(val) => setActionFilter(val as string)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={exportCSV} className="flex items-center gap-2">
              <Download className="w-4 h-4" /> CSV Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <StatCards stats={stats} loading={loading} />

        {/* Table Container */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm overflow-x-auto min-h-[250px]">
          <DataTable 
            columns={columns} 
            data={filteredLogs} 
            searchPlaceholder="Search by table name, record ID, or action..." 
            loading={loading}
          />
        </div>
      </div>

      {/* Profile Drawer for inspecting JSON Diff */}
      <ProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Audit Log Change Inspector"
        subtitle={`Record ID: ${selectedLog?.record_id || ''}`}
      >
        {selectedLog && (
          <div className="space-y-6 p-2">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Mutation Action</span>
                <span className="font-bold text-gray-900 dark:text-white text-sm">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Target Table</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{selectedLog.table_name}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">IP Address</span>
                <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{selectedLog.ip_address || '127.0.0.1'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Timestamp</span>
                <span className="text-xs text-gray-700 dark:text-gray-300">{new Date(selectedLog.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">New / Current State (JSON)</h4>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(selectedLog.new_values || '', 'New Values JSON')}>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy JSON
                </Button>
              </div>
              {renderPrettyJson(selectedLog.new_values)}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Previous State (JSON)</h4>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(selectedLog.old_values || '', 'Old Values JSON')}>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy JSON
                </Button>
              </div>
              {renderPrettyJson(selectedLog.old_values)}
            </div>
          </div>
        )}
      </ProfileDrawer>
    </>
  );
}
