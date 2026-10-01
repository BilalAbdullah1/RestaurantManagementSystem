import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import Input from '../../components/form/input/InputField';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import { DataTable } from '../../components/ui/table/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import {
  X, UserCheck, LogOut, Printer, Users, ClipboardList,
  CheckCircle, Clock, Plus, Eye
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────
interface Visitor {
  id: string;
  tenant_id: string;
  visitor_name: string;
  phone_number?: string;
  purpose: string;
  host_name?: string;
  host_department?: string;
  vehicle_number?: string;
  id_card_type?: string;
  id_card_number?: string;
  status: 'Checked In' | 'Checked Out';
  check_in_time: string;
  check_out_time?: string | null;
  remarks?: string;
}

const initialForm = {
  visitor_name: '',
  phone_number: '',
  purpose: '',
  host_name: '',
  host_department: '',
  vehicle_number: '',
  id_card_type: 'CNIC',
  id_card_number: '',
  remarks: '',
};

// ─── Gate Pass Print Component ────────────────────────────────
function printGatePass(visitor: Visitor) {
  const schoolName = localStorage.getItem('schoolName') || 'School Management System';
  const printHtml = `
    <html>
    <head>
      <title>Gate Pass — ${visitor.visitor_name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #111; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 20px; }
        .header h1 { font-size: 20px; margin: 0; }
        .header p  { font-size: 12px; margin: 4px 0; color: #555; }
        .title { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 20px; letter-spacing: 2px; color: #1e40af; }
        .row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #ddd; padding-bottom: 8px; }
        .label { font-size: 11px; font-weight: bold; color: #666; text-transform: uppercase; }
        .value { font-size: 13px; font-weight: 600; color: #111; }
        .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #888; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-weight: bold; font-size: 11px; background: #dcfce7; color: #166534; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${schoolName}</h1>
        <p>Visitor Management System</p>
      </div>
      <div class="title">VISITOR GATE PASS</div>
      <div class="row"><span class="label">Visitor Name</span><span class="value">${visitor.visitor_name}</span></div>
      <div class="row"><span class="label">Phone Number</span><span class="value">${visitor.phone_number || '—'}</span></div>
      <div class="row"><span class="label">Purpose of Visit</span><span class="value">${visitor.purpose}</span></div>
      <div class="row"><span class="label">Host / Meeting With</span><span class="value">${visitor.host_name || '—'}</span></div>
      <div class="row"><span class="label">Department</span><span class="value">${visitor.host_department || '—'}</span></div>
      <div class="row"><span class="label">ID Card</span><span class="value">${visitor.id_card_type || '—'}: ${visitor.id_card_number || '—'}</span></div>
      <div class="row"><span class="label">Vehicle No.</span><span class="value">${visitor.vehicle_number || '—'}</span></div>
      <div class="row"><span class="label">Check-In Time</span><span class="value">${new Date(visitor.check_in_time).toLocaleString()}</span></div>
      <div class="row"><span class="label">Status</span><span class="value"><span class="badge">${visitor.status}</span></span></div>
      <div class="footer">This gate pass is valid for one visit only. — ${schoolName}</div>
    </body>
    </html>
  `;
  const win = window.open('', '_blank');
  if (win) { win.document.write(printHtml); win.document.close(); win.print(); }
}

// ─── Main Component ───────────────────────────────────────────
export default function VisitorsLog() {
  const tenantId = localStorage.getItem('tenantId') || '';
  const [searchParams] = useSearchParams();

  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'today' | 'all'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState(initialForm);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────
  const fetchVisitors = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const endpoint = viewMode === 'today'
        ? `/visitors/today/${tenantId}`
        : `/visitors/tenant/${tenantId}`;
      const res = await api.get<Visitor[]>(endpoint);
      setVisitors(res.data);
    } catch {
      Swal.fire('Error', 'Failed to load visitor records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVisitors(); }, [tenantId, viewMode]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setDrawerOpen(true);
    }
  }, [searchParams]);

  // ── Stats ─────────────────────────────────────────────────
  const todayCheckedIn  = useMemo(() => visitors.filter(v => v.status === 'Checked In').length, [visitors]);
  const todayCheckedOut = useMemo(() => visitors.filter(v => v.status === 'Checked Out').length, [visitors]);

  // ── Filtered List ─────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!searchQuery) return visitors;
    const q = searchQuery.toLowerCase();
    return visitors.filter(v =>
      v.visitor_name.toLowerCase().includes(q) ||
      (v.host_name || '').toLowerCase().includes(q) ||
      v.purpose.toLowerCase().includes(q) ||
      (v.phone_number || '').includes(q)
    );
  }, [visitors, searchQuery]);

  // ── Check-Out ─────────────────────────────────────────────
  const handleCheckOut = async (visitor: Visitor) => {
    const result = await Swal.fire({
      title: 'Confirm Check-Out?',
      text: `Mark ${visitor.visitor_name} as Checked Out?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      confirmButtonText: 'Yes, Check Out',
    });
    if (!result.isConfirmed) return;
    try {
      await api.put(`/visitors/${visitor.id}/checkout`);
      Swal.fire({ icon: 'success', title: 'Checked Out!', timer: 1500, showConfirmButton: false });
      fetchVisitors();
    } catch {
      Swal.fire('Error', 'Could not check out visitor.', 'error');
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (visitor: Visitor) => {
    const result = await Swal.fire({
      title: 'Delete Record?',
      text: `Remove ${visitor.visitor_name}'s visitor log permanently?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Delete',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/visitors/${visitor.id}`);
      setVisitors(prev => prev.filter(v => v.id !== visitor.id));
      Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire('Error', 'Could not delete record.', 'error');
    }
  };

  // ── Create Visitor ────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.visitor_name || !formData.purpose) {
      Swal.fire('Required', 'Visitor name and purpose are required.', 'warning');
      return;
    }
    setSubmitLoading(true);
    try {
      await api.post('/visitors', { ...formData, tenant_id: tenantId });
      Swal.fire({ icon: 'success', title: 'Visitor Checked In! 👋', timer: 1500, showConfirmButton: false });
      setDrawerOpen(false);
      setFormData(initialForm);
      fetchVisitors();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Could not register visitor.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Table Columns ─────────────────────────────────────────
  const columns: ColumnDef<Visitor>[] = [
    {
      accessorKey: 'visitor_name',
      header: 'Visitor Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {row.original.visitor_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{row.original.visitor_name}</p>
            <p className="text-xs text-gray-500">{row.original.phone_number || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'purpose',
      header: 'Purpose',
      cell: ({ row }) => (
        <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1 max-w-[180px]">{row.original.purpose}</span>
      ),
    },
    {
      accessorKey: 'host_name',
      header: 'Meeting With',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{row.original.host_name || '—'}</p>
          {row.original.host_department && (
            <p className="text-xs text-gray-500">{row.original.host_department}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'check_in_time',
      header: 'Check-In Time',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(row.original.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          <br />
          <span className="text-xs text-gray-400">{new Date(row.original.check_in_time).toLocaleDateString()}</span>
        </span>
      ),
    },
    {
      accessorKey: 'check_out_time',
      header: 'Check-Out',
      cell: ({ row }) => (
        row.original.check_out_time
          ? <span className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(row.original.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          : <span className="text-xs text-gray-400 italic">Still inside</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="light" color={row.original.status === 'Checked In' ? 'success' : 'warning'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <ActionMenu
          items={[
            {
              label: 'View Details',
              icon: <Eye className="w-4 h-4" />,
              onClick: () => { setSelectedVisitor(row.original); setDetailOpen(true); },
            },
            {
              label: 'Print Gate Pass',
              icon: <Printer className="w-4 h-4" />,
              onClick: () => printGatePass(row.original),
            },
            ...(row.original.status === 'Checked In' ? [{
              label: 'Mark Check-Out',
              icon: <LogOut className="w-4 h-4" />,
              onClick: () => handleCheckOut(row.original),
            }] : []),
            {
              label: 'Delete Record',
              icon: <X className="w-4 h-4" />,
              onClick: () => handleDelete(row.original),
              isDanger: true,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="w-full space-y-6">

      {/* BREADCRUMB & HEADER */}
      <div>
        <Breadcrumb items={[{ label: 'Front Office', href: '#' }, { label: 'Visitors Log & Gate Pass' }]} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-7 h-7 text-indigo-600" />
              Visitors Log & Gate Pass
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Track all school visitors, manage check-in/check-out, and print gate passes.
            </p>
          </div>
          <Button variant="primary" onClick={() => setDrawerOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4 mr-1.5" /> Check-In Visitor
          </Button>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <StatCards
        loading={loading}
        stats={[
          {
            title: 'Total Visitors',
            value: visitors.length.toString(),
            icon: <Users className="w-5 h-5" />,
            theme: 'brand',
          },
          {
            title: 'Currently Inside',
            value: todayCheckedIn.toString(),
            icon: <UserCheck className="w-5 h-5" />,
            theme: 'success',
          },
          {
            title: 'Checked Out',
            value: todayCheckedOut.toString(),
            icon: <LogOut className="w-5 h-5" />,
            theme: 'warning',
          },
          {
            title: 'Log View',
            value: viewMode === 'today' ? "Today's Log" : 'All Records',
            icon: <ClipboardList className="w-5 h-5" />,
            theme: 'indigo',
          },
        ]}
      />

      {/* FILTER TOOLBAR */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {(['today', 'all'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                viewMode === mode
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {mode === 'today' ? "Today's Log" : 'All Records'}
            </button>
          ))}
        </div>
        <div className="flex-1 w-full">
          <Input
            type="text"
            placeholder="Search by name, purpose, or host..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden p-6">
        <DataTable
          loading={loading}
          columns={columns}
          data={filtered}
          searchPlaceholder="Search visitors..."
          emptyMessage="No visitor logs recorded. Click + Check-In Visitor to register a new entry gate pass."
          exportable={true}
          exportFilename="visitors_log"
        />
      </div>

      {/* ── CHECK-IN DRAWER ───────────────────────────────────────── */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[999]" onClick={() => setDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[1000] flex flex-col">
            
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Check-In New Visitor</h2>
                <p className="text-xs text-indigo-100 mt-0.5">Fill details to register visitor entry</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form id="visitorForm" onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Visitor Full Name *</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Bilal"
                    value={formData.visitor_name}
                    onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Phone Number</label>
                  <Input
                    type="text"
                    placeholder="e.g. 0300-1234567"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Purpose of Visit *</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Meeting with Principal, Fee Submission"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Meeting With (Host)</label>
                    <Input
                      type="text"
                      placeholder="e.g. Mr. Ahmed"
                      value={formData.host_name}
                      onChange={(e) => setFormData({ ...formData, host_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Department</label>
                    <Input
                      type="text"
                      placeholder="e.g. Administration"
                      value={formData.host_department}
                      onChange={(e) => setFormData({ ...formData, host_department: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <SearchableSelect
                      label="ID Card Type"
                      options={[
                        { value: 'CNIC', label: 'CNIC' },
                        { value: 'Passport', label: 'Passport' },
                        { value: 'Driving License', label: 'Driving License' },
                        { value: 'Other', label: 'Other' },
                      ]}
                      value={formData.id_card_type}
                      onChange={(val) => setFormData({ ...formData, id_card_type: val })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">ID Card No.</label>
                    <Input
                      type="text"
                      placeholder="e.g. 35201-1234567-1"
                      value={formData.id_card_number}
                      onChange={(e) => setFormData({ ...formData, id_card_number: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Vehicle Number (Optional)</label>
                  <Input
                    type="text"
                    placeholder="e.g. LHR-123"
                    value={formData.vehicle_number}
                    onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Remarks</label>
                  <Input
                    type="text"
                    placeholder="Any additional notes..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  />
                </div>

              </form>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                form="visitorForm"
                variant="primary"
                loading={submitLoading}
                loadingText="Registering..."
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                ✓ Check In Visitor
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ── DETAIL MODAL ──────────────────────────────────────────── */}
      {detailOpen && selectedVisitor && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800 overflow-hidden">
            
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedVisitor.visitor_name}</h3>
                <p className="text-xs text-indigo-100 mt-0.5">{selectedVisitor.purpose}</p>
              </div>
              <button onClick={() => setDetailOpen(false)} className="text-white/70 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {[
                { label: 'Phone', value: selectedVisitor.phone_number },
                { label: 'Host / Meeting With', value: selectedVisitor.host_name },
                { label: 'Department', value: selectedVisitor.host_department },
                { label: 'Vehicle', value: selectedVisitor.vehicle_number },
                { label: 'ID Card', value: selectedVisitor.id_card_type ? `${selectedVisitor.id_card_type}: ${selectedVisitor.id_card_number || '—'}` : undefined },
                { label: 'Check-In', value: new Date(selectedVisitor.check_in_time).toLocaleString() },
                { label: 'Check-Out', value: selectedVisitor.check_out_time ? new Date(selectedVisitor.check_out_time).toLocaleString() : 'Still Inside' },
                { label: 'Remarks', value: selectedVisitor.remarks },
              ].map(({ label, value }) => value ? (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="text-xs font-bold text-gray-500 uppercase">{label}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white text-right max-w-[220px]">{value}</span>
                </div>
              ) : null)}

              <div className="pt-2">
                <Badge variant="light" color={selectedVisitor.status === 'Checked In' ? 'success' : 'warning'}>
                  {selectedVisitor.status}
                </Badge>
              </div>
            </div>

            <div className="px-6 pb-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
              <Button variant="primary" onClick={() => printGatePass(selectedVisitor)} className="bg-indigo-600 hover:bg-indigo-700">
                <Printer className="w-4 h-4 mr-1.5" /> Print Gate Pass
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
