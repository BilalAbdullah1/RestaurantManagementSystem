import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Input from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import { MoreVertical, Eye, Trash2, Download, UserCheck } from 'lucide-react';
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
  SortingState,
} from '@tanstack/react-table';

// Premium Components
import EnquiryStats from './components/EnquiryStats';
import EnquiryDetails from './components/EnquiryDetails';
import CaptureLeadDrawer from './components/CaptureLeadDrawer';
import Select from '../../components/form/Select';
import { getAvatarGradient, getInitials } from '../../utils/avatarUtils';

// --- TYPES ---
export interface AdmissionEnquiry {
  id: string;
  tenant_id: string;
  child_name: string;
  father_name: string;
  phone_number: string;
  class_id: string;
  class_name: string;
  status: 'Enquiry' | 'Follow-Up' | 'Registered' | 'Closed';
  remarks: string;
  created_at: string;
}

interface LookupItem {
  id: string;
  name: string;
}

const STATUS_OPTIONS = ['Enquiry', 'Follow-Up', 'Registered', 'Closed'] as const;

import KanbanBoard from './components/KanbanBoard';
import { toast } from '../../components/ui/Toast';

export default function AdmissionEnquiries() {
  const tenantId = localStorage.getItem("tenantId") || "";

  // --- STATES ---
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [classes, setClasses] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [globalFilter, setGlobalFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'closed'>('all');
  const [sorting, setSorting] = useState<SortingState>([]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerEnquiry, setDrawerEnquiry] = useState<AdmissionEnquiry | null>(null);

  // Action Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  // --- FETCH DATA ---
  const fetchData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [enquiriesRes, classesRes] = await Promise.all([
        api.get<AdmissionEnquiry[]>(`/admissionenquiries/tenant/${tenantId}`),
        api.get<LookupItem[]>(`/classes/tenant/${tenantId}`)
      ]);
      setEnquiries(enquiriesRes.data);
      setClasses(classesRes.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to load admission enquiries.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  // Handle clicking outside to close action menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.action-menu-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      if (newStatus === 'Registered') {
        const res = await api.post(`/admissionenquiries/${id}/convert`);
        toast.success(res.data?.message || 'Lead converted to Registered student!');
      } else {
        await api.put(`/admissionenquiries/${id}/status`, { status: newStatus, remarks: '' });
        toast.success(`Status updated to ${newStatus}`);
      }
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus as any } : e));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to update status.';
      toast.error(errorMsg);
      fetchData(); // Revert on failure
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setActiveMenuId(null);
    const result = await Swal.fire({
      title: 'Delete Lead?',
      text: `Are you sure you want to delete the enquiry for "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Delete'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admissionenquiries/${id}`);
        setEnquiries(prev => prev.filter(e => e.id !== id));
        Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Lead has been removed.', timer: 1500, showConfirmButton: false });
      } catch (err) {
        Swal.fire('Error', 'Failed to delete enquiry.', 'error');
      }
    }
  };

  // --- EXPORT ---
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Admission Enquiries', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Child Name', 'Father', 'Phone', 'Class', 'Status', 'Date']],
      body: filteredEnquiries.map(e => [
        e.child_name,
        e.father_name,
        e.phone_number,
        e.class_name,
        e.status,
        new Date(e.created_at).toLocaleDateString()
      ]),
    });
    doc.save('enquiries.pdf');
  };

  const exportCSV = () => {
    const headers = ['Child Name', 'Father Name', 'Phone', 'Class', 'Status', 'Date'];
    const csvData = filteredEnquiries.map(e => [
      e.child_name,
      e.father_name,
      e.phone_number,
      e.class_name,
      e.status,
      new Date(e.created_at).toLocaleDateString()
    ]);
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "enquiries.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- UI HELPERS ---
  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'Enquiry': return 'info';
      case 'Follow-Up': return 'warning';
      case 'Registered': return 'success';
      case 'Closed': return 'error';
      default: return 'gray';
    }
  };

  const classOptions = useMemo(() => classes.map(c => ({ value: c.id, label: c.name })), [classes]);

  // Derived Stats
  const activePipeline = enquiries.filter(e => e.status === 'Enquiry' || e.status === 'Follow-Up').length;
  const registered = enquiries.filter(e => e.status === 'Registered').length;

  // --- TANSTACK TABLE CONFIGURATION ---
  const filteredEnquiries = useMemo(() => {
    if (activeTab === 'all') return enquiries;
    if (activeTab === 'active') return enquiries.filter(e => e.status === 'Enquiry' || e.status === 'Follow-Up');
    if (activeTab === 'closed') return enquiries.filter(e => e.status === 'Closed' || e.status === 'Registered');
    return enquiries;
  }, [enquiries, activeTab]);

  const columns = useMemo<ColumnDef<AdmissionEnquiry>[]>(
    () => [
      {
        accessorKey: 'child_name',
        header: 'Child / Lead Name',
        cell: info => {
          const name = info.getValue() as string;
          return (
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getAvatarGradient(name)} shrink-0`}>
                {getInitials(name, '')}
              </div>
              <div
                className="text-sm font-semibold text-gray-800 dark:text-white/90 hover:text-brand-500 cursor-pointer transition-colors"
                onClick={() => setDrawerEnquiry(info.row.original)}
              >
                {name}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'father_name',
        header: "Father's Name",
      },
      {
        accessorKey: 'phone_number',
        header: 'Phone Number',
        cell: info => <span className="font-mono text-gray-500 dark:text-gray-400">{info.getValue() as string}</span>,
      },
      {
        accessorKey: 'class_name',
        header: 'Target Class',
      },
      {
        accessorKey: 'created_at',
        header: 'Date',
        cell: info => <span className="text-gray-500">{new Date(info.getValue() as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: info => {
          const status = info.getValue() as string;
          return (
            <div className="w-32">
              <Select
                value={status}
                onChange={(newStatus) => handleStatusChange(info.row.original.id, newStatus)}
                options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
                className={`!py-1 !h-8 text-xs font-bold border-none ${status === 'Enquiry' ? '!bg-blue-50 !text-blue-700 dark:!bg-blue-900/30 dark:!text-blue-300' :
                    status === 'Follow-Up' ? '!bg-orange-50 !text-orange-700 dark:!bg-orange-900/30 dark:!text-orange-300' :
                      status === 'Registered' ? '!bg-emerald-50 !text-emerald-700 dark:!bg-emerald-900/30 dark:!text-emerald-300' :
                        '!bg-gray-50 !text-gray-700 dark:!bg-gray-800 dark:!text-gray-300'
                  }`}
              />
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: info => {
          const id = info.row.original.id;
          const name = info.row.original.child_name;

          return (
            <div className="flex justify-end action-menu-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeMenuId === id) {
                    setActiveMenuId(null);
                  } else {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const menuHeight = 100;
                    const spaceBelow = window.innerHeight - rect.bottom;
                    const showAbove = spaceBelow < menuHeight && rect.top > menuHeight;

                    setMenuPosition({
                      top: showAbove ? rect.top - menuHeight - 4 : rect.bottom + 4,
                      right: window.innerWidth - rect.right,
                    });
                    setActiveMenuId(id);
                  }
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-gray-700 transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {activeMenuId === id && createPortal(
                <div
                  className="fixed w-36 rounded-xl shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-800 z-[99999] animate-in fade-in zoom-in duration-150"
                  style={{ top: menuPosition.top, right: menuPosition.right }}
                >
                  <div className="py-1">
                    <button
                      onClick={() => { setActiveMenuId(null); setDrawerEnquiry(info.row.original); }}
                      className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Eye className="w-4 h-4 mr-3 text-gray-400 group-hover:text-brand-500" /> View
                    </button>
                  </div>
                  {info.row.original.status !== 'Registered' && info.row.original.status !== 'Closed' && (
                    <div className="py-1">
                      <button
                        onClick={() => { setActiveMenuId(null); handleStatusChange(id, 'Registered'); }}
                        className="group flex items-center w-full px-4 py-2 text-sm text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/10"
                      >
                        <UserCheck className="w-4 h-4 mr-3 text-teal-400 group-hover:text-teal-500" /> Convert
                      </button>
                    </div>
                  )}
                  <div className="py-1">
                    <button
                      onClick={() => handleDelete(id, name)}
                      className="group flex items-center w-full px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-3 text-error-400 group-hover:text-error-500" /> Delete
                    </button>
                  </div>
                </div>,
                document.body
              )}
            </div>
          );
        },
      },
    ],
    [activeMenuId, menuPosition]
  );

  const table = useReactTable({
    data: filteredEnquiries,
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

  return (
    <div className="w-full space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admission Leads CRM</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track and convert prospective student inquiries into successful admissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.open(`/PublicAdmissionPortal/${tenantId}`, '_blank')}>
            🌐 Open Public Portal
          </Button>
          <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
            + Capture New Lead
          </Button>
        </div>
      </div>

      {/* KPI STATS */}
      <EnquiryStats
        totalLeads={enquiries.length}
        inPipeline={activePipeline}
        converted={registered}
        loading={loading}
      />

      {/* Main Table Container */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">

        {/* Tabs & Controls Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">

          {/* Sleek Tabs */}
          <div className="flex p-1 space-x-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
            {[
              { id: 'all', label: 'All Leads' },
              { id: 'active', label: 'Active Pipeline' },
              { id: 'closed', label: 'Converted / Closed' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Actions: Search & Export */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>List</button>
              <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Board</button>
            </div>
            <div className="w-full lg:w-64">
              <Input
                type="text"
                placeholder="Search by name or phone..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>
            <button onClick={exportPDF} title="Export to PDF" className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={exportCSV} title="Export to CSV" className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors">
              CSV
            </button>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'kanban' ? (
          <div className="p-4">
            <KanbanBoard
              enquiries={filteredEnquiries}
              onStatusChange={handleStatusChange}
              onView={(enquiry) => { setActiveMenuId(null); setDrawerEnquiry(enquiry); }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[250px]">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none"
                      >
                        <div className={`flex items-center ${header.id === 'actions' ? 'justify-end' : ''}`}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <span className="ml-1 text-brand-500">▲</span>,
                            desc: <span className="ml-1 text-brand-500">▼</span>,
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
                      {columns.map((_, colIndex) => (
                        <td key={`skeleton-cell-${colIndex}`} className="px-6 py-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 text-sm border-2 border-dashed border-gray-100 dark:border-gray-800 m-4 rounded-xl">
                      No admission enquiries found.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                      {row.getVisibleCells().map(cell => (
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
        )}

        {/* Table Footer Controls */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Rows per page:</span>
            <div className="w-24">
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onChange={val => table.setPageSize(Number(val))}
                options={[10, 20, 50].map(size => ({ value: size.toString(), label: size.toString() }))}
                className="!h-9 !py-1"
              />
            </div>
          </div>

          {table.getPageCount() > 1 && (
            <div className="flex items-center gap-2">
              <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 transition-all">
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium px-2">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 transition-all">
                Next
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Slide-over Profile Drawer */}
      {drawerEnquiry && (
        <EnquiryDetails
          enquiry={drawerEnquiry}
          onClose={() => setDrawerEnquiry(null)}
        />
      )}

      {/* Capture Lead Drawer */}
      {isDrawerOpen && (
        <CaptureLeadDrawer
          onClose={() => setIsDrawerOpen(false)}
          classes={classes}
          tenantId={tenantId}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}