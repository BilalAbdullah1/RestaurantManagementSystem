import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import Input from '../../form/input/InputField';
import SearchableSelect from '../../form/select/SearchableSelect';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, FileSpreadsheet } from 'lucide-react';

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  searchPlaceholder?: string;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  emptyMessage?: string;
  exportable?: boolean;
  exportFilename?: string;
  loading?: boolean;
}

export function DataTable<TData>({
  data,
  columns,
  searchPlaceholder,
  leftActions,
  rightActions,
  emptyMessage = 'No records found.',
  exportable = false,
  exportFilename = 'export_data',
  loading = false,
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const visibleColumns = table.getVisibleFlatColumns().filter(col => col.id !== 'actions');
    const head = [visibleColumns.map(col => typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id)];
    
    const body = table.getFilteredRowModel().rows.map(row => 
      visibleColumns.map(col => {
        const val = row.getValue(col.id);
        return typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '');
      })
    );

    doc.text(exportFilename.replace(/_/g, ' ').toUpperCase(), 14, 15);
    autoTable(doc, {
      startY: 20,
      head: head,
      body: body,
    });
    doc.save(`${exportFilename}.pdf`);
  };

  const handleExportCSV = () => {
    const visibleColumns = table.getVisibleFlatColumns().filter(col => col.id !== 'actions');
    const headers = visibleColumns.map(col => typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id);
    
    const csvData = table.getFilteredRowModel().rows.map(row => 
      visibleColumns.map(col => {
        const val = row.getValue(col.id);
        let strVal = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '');
        return `"${strVal.replace(/"/g, '""')}"`;
      }).join(",")
    );

    const csvContent = [headers.join(","), ...csvData].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${exportFilename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasToolbar = leftActions || rightActions || searchPlaceholder || exportable;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
      
      {/* Header Toolbar */}
      {hasToolbar && (
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1 w-full lg:w-auto">
            {leftActions}
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap">
            {searchPlaceholder && (
              <div className="w-full sm:w-64 shrink-0">
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
              </div>
            )}
            {exportable && (
              <div className="flex items-center gap-2">
                <button onClick={handleExportPDF} title="Export to PDF" className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={handleExportCSV} title="Export to CSV" className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors">
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
              </div>
            )}
            {rightActions}
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto min-h-[250px]">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none"
                  >
                    <div className={`flex items-center gap-1 ${header.id === 'actions' ? 'justify-end' : ''}`}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <span className="text-brand-500 text-[10px]">▲</span>,
                        desc: <span className="text-brand-500 text-[10px]">▼</span>,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="animate-pulse">
                  {columns.map((col, colIndex) => (
                    <td key={`skeleton-cell-${colIndex}`} className="px-6 py-4 whitespace-nowrap">
                      {colIndex === 0 ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-28" />
                        </div>
                      ) : colIndex === columns.length - 1 ? (
                        <div className="flex justify-end">
                          <div className="h-7 w-7 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                        </div>
                      ) : (
                        <div
                          className="h-4 bg-gray-200 dark:bg-gray-800 rounded"
                          style={{
                            width: `${Math.max(40, ((colIndex * 37 + rowIndex * 19) % 55) + 35)}%`,
                          }}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 text-sm border-2 border-dashed border-gray-100 dark:border-gray-800 m-4 rounded-xl">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors group">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Rows per page:</span>
          <div className="w-24">
            <SearchableSelect
              options={[
                { value: 10, label: '10' },
                { value: 20, label: '20' },
                { value: 50, label: '50' },
                { value: 100, label: '100' },
              ]}
              value={table.getState().pagination.pageSize}
              onChange={(val) => table.setPageSize(Number(val))}
            />
          </div>
        </div>

        {table.getPageCount() > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 transition-all"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium px-2">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
