import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../utils/axiosConfig';
import { toast } from '../../components/ui/Toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { DebouncedSearch } from '../../components/form/DebouncedSearch';
import Badge from '../../components/ui/badge/Badge';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, getFilteredRowModel, flexRender,
  ColumnDef
} from '@tanstack/react-table';

interface DefaulterDto {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  parentPhone: string;
  pendingAmount: number;
  agingCategory: string;
  overdueChallansCount: number;
}

interface DefaulterReportDto {
  totalPendingAmount: number;
  totalDefaulters: number;
  agingSummary: Record<string, number>;
  defaulters: DefaulterDto[];
}

export default function FeeDefaultersReport() {
  const [defaulterReport, setDefaulterReport] = useState<DefaulterReportDto | null>(null);
  const [loadingDefaulters, setLoadingDefaulters] = useState(false);
  const [defaulterSearch, setDefaulterSearch] = useState('');

  const fetchDefaulters = useCallback(async () => {
    setLoadingDefaulters(true);
    try {
      const res = await api.get<DefaulterReportDto>('/financereports/defaulters');
      setDefaulterReport(res.data);
    } catch {
      toast.error('Failed to load defaulter list.');
    } finally {
      setLoadingDefaulters(false);
    }
  }, []);

  useEffect(() => {
    fetchDefaulters();
  }, [fetchDefaulters]);

  const defaulterColumns = useMemo<ColumnDef<DefaulterDto>[]>(() => [
    {
      accessorKey: 'studentName', header: 'Student',
      cell: (info) => (
        <div>
          <p className="font-bold text-gray-900 dark:text-white text-sm">{info.getValue() as string}</p>
          <p className="text-xs text-gray-500">Adm: {info.row.original.admissionNumber}</p>
        </div>
      )
    },
    {
      accessorKey: 'className', header: 'Class',
      cell: (info) => <Badge variant="light" color="info">{info.getValue() as string}</Badge>
    },
    {
      accessorKey: 'parentPhone', header: 'Parent Contact',
      cell: (info) => <span className="text-xs text-gray-600 dark:text-gray-400">{info.getValue() as string}</span>
    },
    {
      accessorKey: 'overdueChallansCount', header: 'Challans',
      cell: (info) => <Badge variant="light" color="warning">{info.getValue() as number} unpaid</Badge>
    },
    {
      accessorKey: 'agingCategory', header: 'Aging',
      cell: (info) => {
        const cat = info.getValue() as string;
        const color = cat === '90+ Days' ? 'danger' : cat === '61-90 Days' ? 'warning' : 'primary';
        return <Badge variant="solid" color={color}>{cat}</Badge>;
      }
    },
    {
      accessorKey: 'pendingAmount', header: 'Total Dues',
      cell: (info) => <span className="font-black text-rose-600 dark:text-rose-400">Rs. {Number(info.getValue()).toLocaleString()}</span>
    },
    {
      id: 'action', header: 'Action',
      cell: ({ row }) => (
        <button
          onClick={async () => {
            try {
              await api.post(`/feechallans/send-reminder-by-student/${row.original.studentId}`);
              toast.success(`Reminder sent to ${row.original.studentName}'s guardian.`);
            } catch (err: any) {
              toast.error(err.response?.data?.message || 'Could not send reminder.');
            }
          }}
          className="px-3 py-1.5 text-xs font-bold rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors flex items-center gap-1.5"
        >
          📲 WhatsApp
        </button>
      )
    }
  ], []);

  const filteredDefaulters = useMemo(() => {
    if (!defaulterReport) return [];
    const q = defaulterSearch.toLowerCase();
    if (!q) return defaulterReport.defaulters;
    return defaulterReport.defaulters.filter(d =>
      d.studentName.toLowerCase().includes(q) ||
      d.className.toLowerCase().includes(q) ||
      d.admissionNumber.toLowerCase().includes(q)
    );
  }, [defaulterReport, defaulterSearch]);

  const defaulterTable = useReactTable({
    data: filteredDefaulters,
    columns: defaulterColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  });

  return (
    <div className="w-full space-y-6">
      <Breadcrumb items={[{ label: 'Reports & Analytics' }, { label: 'Fee Defaulters Aging Report' }]} />

      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-7 h-7 text-rose-600" /> Fee Defaulters Aging Report
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track overdue fee balances, aging buckets (1-30, 31-60, 90+ days), and send automated WhatsApp reminders.
        </p>
      </div>

      {loadingDefaulters && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      )}

      {!loadingDefaulters && defaulterReport && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Pending Dues', value: `Rs. ${defaulterReport.totalPendingAmount.toLocaleString()}`, sub: `${defaulterReport.totalDefaulters} Defaulters`, color: 'rose' },
              { label: '1–30 Days', value: `Rs. ${(defaulterReport.agingSummary['1-30 Days'] || 0).toLocaleString()}`, sub: 'Recent', color: 'amber' },
              { label: '31–60 Days', value: `Rs. ${(defaulterReport.agingSummary['31-60 Days'] || 0).toLocaleString()}`, sub: 'Moderate', color: 'orange' },
              { label: '90+ Days Critical', value: `Rs. ${(defaulterReport.agingSummary['90+ Days'] || 0).toLocaleString()}`, sub: 'Critical', color: 'red' },
            ].map((card, i) => (
              <div key={i} className={`p-5 rounded-2xl border bg-${card.color}-50 dark:bg-${card.color}-900/20 border-${card.color}-100 dark:border-${card.color}-900/30`}>
                <p className={`text-xs font-bold text-${card.color}-600 uppercase`}>{card.label}</p>
                <h3 className={`text-xl font-black text-${card.color}-700 dark:text-${card.color}-400 mt-1`}>{card.value}</h3>
                <p className={`text-xs text-${card.color}-500 mt-1`}>{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="text-base font-bold text-gray-800 dark:text-white">Defaulter List</h4>
              <div className="w-full sm:w-72">
                <DebouncedSearch value={defaulterSearch} onChange={setDefaulterSearch} placeholder="Search by name, class, admission no..." />
              </div>
            </div>
            <div className="overflow-x-auto min-h-[250px] rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800">
                  {defaulterTable.getHeaderGroups().map(hg => (
                    <tr key={hg.id}>
                      {hg.headers.map(h => (
                        <th key={h.id} className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          {flexRender(h.column.columnDef.header, h.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {defaulterTable.getRowModel().rows.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-sm text-gray-400 italic">No defaulters found. 🎉</td></tr>
                  ) : defaulterTable.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-4 py-3 whitespace-nowrap">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
