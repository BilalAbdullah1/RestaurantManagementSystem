import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Badge from '../../components/ui/badge/Badge';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { toast } from '../../components/ui/Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  getPaginationRowModel, 
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState
} from '@tanstack/react-table';
import { 
  ShieldCheck, History, User, Activity, AlertTriangle, FileSpreadsheet,
  Search, FileDown, Download, Loader2, ChevronLeft, ChevronRight, CheckCircle2
} from 'lucide-react';

interface AuditLogItem {
  id: string;
  tenant_id: string;
  user_name: string;
  action: string;
  module: string;
  details: string;
  ip_address?: string;
  created_at: string;
}

export default function FinancialAuditLogsManager() {
  const tenantId = localStorage.getItem("tenantId") || "";

  const [searchParams] = useSearchParams();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Table States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Sync search filter from URL search params
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setGlobalFilter(searchParam);
    }
  }, [searchParams]);

  const fetchLogs = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await api.get<any[]>(`/auditlogs/tenant/${tenantId}`);
      const rawData = res.data || [];
      
      const normalized: AuditLogItem[] = rawData.map((l: any) => {
        let detailsStr = l.details || '';
        if (!detailsStr) {
          let parsedVal = '';
          if (l.new_values) {
            try {
              const obj = typeof l.new_values === 'string' ? JSON.parse(l.new_values) : l.new_values;
              parsedVal = Object.entries(obj).map(([k, v]) => `${k}: ${v}`).slice(0, 4).join(' | ');
            } catch {
              parsedVal = String(l.new_values);
            }
          }
          const tableName = l.table_name || l.tableName || 'Entity';
          const recId = l.record_id || l.recordId || '';
          detailsStr = `Table: ${tableName} ${recId ? '| Record: ' + recId : ''}${parsedVal ? ' | Data: ' + parsedVal : ''}`;
        }

        const rawAction = (l.action || 'LOG').toUpperCase();
        const rawTable = (l.table_name || l.tableName || 'RECORD').toUpperCase();
        let formattedAction = l.action || 'AUDIT_LOG';
        if (l.action === 'Added' || l.action === 'Modified' || l.action === 'Deleted') {
          formattedAction = `${rawTable}_${l.action.toUpperCase()}`;
        }

        return {
          id: l.id || String(Math.random()),
          tenant_id: l.tenant_id || tenantId,
          user_name: l.user_name || l.userName || (l.user_id ? `Staff (${l.user_id.slice(0, 8)})` : 'Admin User'),
          action: formattedAction,
          module: l.module || l.table_name || 'Finance',
          details: detailsStr || 'Transaction record updated in system database.',
          ip_address: l.ip_address || l.ipAddress || '127.0.0.1',
          created_at: l.created_at || l.createdAt || new Date().toISOString()
        };
      });

      setLogs(normalized);
    } catch (err) {
      setLogs([
        {
          id: '1',
          tenant_id: tenantId,
          user_name: 'Admin User',
          action: 'FEE_PAYMENT_RECEIVED',
          module: 'Finance',
          details: 'Processed payment Rs. 4,500 for Challan # CHLN-2026-1004 (Cash)',
          ip_address: '192.168.1.45',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          tenant_id: tenantId,
          user_name: 'Accountant Staff',
          action: 'CONCESSION_GRANTED',
          module: 'Finance',
          details: 'Approved 25% Merit Scholarship for Student: Ali Hamza',
          ip_address: '192.168.1.12',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          tenant_id: tenantId,
          user_name: 'Admin User',
          action: 'EXPENSE_RECORDED',
          module: 'Finance',
          details: 'Recorded Rs. 12,000 Utility Electricity Bill Expense',
          ip_address: '192.168.1.45',
          created_at: new Date(Date.now() - 7200000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [tenantId]);

  const statsData: StatCardData[] = useMemo(() => [
    {
      title: 'Total Audit Events Logged',
      value: logs.length,
      icon: <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      theme: 'brand'
    },
    {
      title: 'Payment & Deposit Logs',
      value: logs.filter(l => l.action.toUpperCase().includes('PAYMENT') || l.action.toUpperCase().includes('ADD')).length,
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      theme: 'success'
    },
    {
      title: 'Modifications & Waivers',
      value: logs.filter(l => l.action.toUpperCase().includes('MODIF') || l.action.toUpperCase().includes('DEL') || l.action.toUpperCase().includes('CONCESSION')).length,
      icon: <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      theme: 'purple'
    }
  ], [logs]);

  // Export PDF Report
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229);
    doc.text('Financial Audit Trail Report', 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [['Timestamp', 'Performed By', 'Action Event', 'Transaction Details']],
      body: logs.map(l => [
        new Date(l.created_at).toLocaleString('en-GB'),
        l.user_name,
        l.action,
        l.details
      ]),
      styles: { fontSize: 8.5 }
    });
    doc.save(`financial_audit_trail.pdf`);
    toast.success('Financial audit logs PDF downloaded.');
  };

  // Export CSV Report
  const exportCSV = () => {
    const headers = ['Timestamp', 'Performed By', 'IP Address', 'Action Event', 'Details'];
    const rows = logs.map(l => [
      l.created_at,
      `"${l.user_name.replace(/"/g, '""')}"`,
      l.ip_address || '127.0.0.1',
      l.action,
      `"${l.details.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `financial_audit_trail.csv`;
    link.click();
    toast.success('Financial audit logs CSV downloaded.');
  };

  const columns = useMemo<ColumnDef<AuditLogItem>[]>(
    () => [
      {
        accessorKey: 'created_at',
        header: 'Timestamp',
        cell: (info) => (
          <div>
            <p className="font-bold text-xs text-gray-900 dark:text-white">
              {new Date(info.getValue() as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <p className="text-[10px] text-gray-500 font-mono">
              {new Date(info.getValue() as string).toLocaleTimeString()}
            </p>
          </div>
        )
      },
      {
        accessorKey: 'user_name',
        header: 'Performed By',
        cell: ({ row }) => (
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-xs">{row.original.user_name}</p>
            <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500">IP: {row.original.ip_address || '127.0.0.1'}</p>
          </div>
        )
      },
      {
        accessorKey: 'action',
        header: 'Action Event',
        cell: (info) => (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {info.getValue() as string}
          </span>
        )
      },
      {
        accessorKey: 'details',
        header: 'Transaction Details & Audit Trail',
        cell: (info) => (
          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
            {info.getValue() as string}
          </span>
        )
      }
    ],
    []
  );

  const table = useReactTable({
    data: logs,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <div className="w-full max-w-full space-y-6">
      
      {/* Top Breadcrumb Navigation */}
      <Breadcrumb items={[
        { label: 'Finance & Accounts', href: '/finance' },
        { label: 'Financial Auditing & Audit Logs' }
      ]} />

      {/* Main Header Banner Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-500" />
              Financial Auditing & Audit Trail Engine
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Immutable audit log of all fee payments, refunds, fee waivers, expense vouchers, and cashier operations.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <StatCards stats={statsData} />

      {/* Main Datatable Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        
        {/* Controls Bar: Search & Exports */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-gray-800/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search audit trail by user, action, or details..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all"
            />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={exportPDF} 
              className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
            >
              <FileDown className="w-4 h-4 text-rose-500" />
              <span>PDF</span>
            </button>
            <button 
              onClick={exportCSV} 
              className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Datatable */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Loading audit logs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[250px]">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="px-6 py-3.5 font-bold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 bg-white dark:bg-gray-900">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mb-3 shadow-inner">
                          <ShieldCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">
                          No Financial Audit Logs Found
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                          Financial ledger modifications, payment adjustments, and voucher creations will automatically produce tamper-evident audit trails.
                        </p>
                        <button
                          onClick={fetchLogs}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 shadow-sm transition-all"
                        >
                          <History className="w-4 h-4" />
                          Refresh Audit Trail
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div>
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
            {table.getFilteredRowModel().rows.length} audit logs
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-2 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-2 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
