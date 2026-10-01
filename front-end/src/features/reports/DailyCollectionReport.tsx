import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import { toast } from '../../components/ui/Toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import DatePicker from '../../components/form/date-picker';
import Label from '../../components/form/Label';
import Badge from '../../components/ui/badge/Badge';
import { Calendar, Wallet, Building, Loader2 } from 'lucide-react';
import {
  useReactTable, getCoreRowModel,
  getPaginationRowModel, flexRender,
  ColumnDef
} from '@tanstack/react-table';

interface DailyCollectionTransactionDto {
  receiptNumber: string;
  studentName: string;
  className: string;
  amount: number;
  paymentMode: string;
  paymentTime: string;
}

interface DailyCollectionDto {
  date: string;
  totalCollected: number;
  totalTransactions: number;
  cashCollection: number;
  bankCollection: number;
  transactions: DailyCollectionTransactionDto[];
}

export default function DailyCollectionReport() {
  const [dailyReport, setDailyReport] = useState<DailyCollectionDto | null>(null);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchDaily = useCallback(async () => {
    setLoadingDaily(true);
    try {
      const res = await api.get<DailyCollectionDto>(`/financereports/daily-collection?date=${dailyDate}`);
      setDailyReport(res.data);
    } catch {
      toast.error('Failed to load daily collection.');
    } finally {
      setLoadingDaily(false);
    }
  }, [dailyDate]);

  useEffect(() => {
    fetchDaily();
  }, [fetchDaily]);

  const dailyColumns = useMemo<ColumnDef<DailyCollectionTransactionDto>[]>(() => [
    {
      accessorKey: 'paymentTime', header: 'Time',
      cell: (info) => <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{new Date(info.getValue() as string).toLocaleTimeString()}</span>
    },
    {
      accessorKey: 'receiptNumber', header: 'Receipt #',
      cell: (info) => <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{info.getValue() as string}</span>
    },
    {
      accessorKey: 'studentName', header: 'Student',
      cell: (info) => (
        <div>
          <p className="font-bold text-sm text-gray-900 dark:text-white">{info.getValue() as string}</p>
          <p className="text-xs text-gray-500">{info.row.original.className}</p>
        </div>
      )
    },
    {
      accessorKey: 'paymentMode', header: 'Mode',
      cell: (info) => {
        const mode = info.getValue() as string;
        return <Badge variant="light" color={mode.toLowerCase().includes('bank') ? 'primary' : 'success'}>{mode}</Badge>;
      }
    },
    {
      accessorKey: 'amount', header: 'Amount',
      cell: (info) => <span className="font-black text-emerald-600 dark:text-emerald-400">+ Rs. {Number(info.getValue()).toLocaleString()}</span>
    }
  ], []);

  const dailyTable = useReactTable({
    data: dailyReport?.transactions || [],
    columns: dailyColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } }
  });

  return (
    <div className="w-full space-y-6">
      <Breadcrumb items={[{ label: 'Reports & Analytics' }, { label: 'Daily Collection Report' }]} />

      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-7 h-7 text-indigo-600" /> Daily Collection Report
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor daily cash and bank fee collections, transaction volume, and receipt logs.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-end gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex-1">
          <Label>Select Date</Label>
          <DatePicker value={dailyDate} onChange={(e: any) => setDailyDate(e.target?.value || e)} />
        </div>
        <button onClick={fetchDaily} disabled={loadingDaily} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl flex items-center gap-2 h-10 cursor-pointer">
          {loadingDaily ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
          View Collection
        </button>
      </div>

      {loadingDaily && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      )}

      {!loadingDaily && dailyReport && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-2xl text-white">
              <p className="text-sm font-bold text-emerald-100 uppercase">Total Collection</p>
              <h3 className="text-4xl font-black mt-1">Rs. {dailyReport.totalCollected.toLocaleString()}</h3>
              <p className="text-sm mt-2 opacity-90">{dailyReport.totalTransactions} Transactions</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Cash Collection</p>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Rs. {dailyReport.cashCollection.toLocaleString()}</h3>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Bank / Online</p>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Rs. {dailyReport.bankCollection.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[250px] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800">
                {dailyTable.getHeaderGroups().map(hg => (
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
                {dailyTable.getRowModel().rows.length === 0
                  ? <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400 italic">No collections on this date.</td></tr>
                  : dailyTable.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-4 py-3 whitespace-nowrap">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
