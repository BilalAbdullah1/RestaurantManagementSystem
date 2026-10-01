import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import Input from '../../components/form/input/InputField';
import SearchableSelect, { SearchableSelectOption } from '../../components/form/select/SearchableSelect';
import { DataTable } from '../../components/ui/table/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import { X, LifeBuoy, AlertCircle, CheckCircle } from 'lucide-react';

interface HelpdeskTicket {
  id: string;
  tenant_id: string;
  ticket_number: string;
  raised_by_name: string;
  raised_by_role: string;
  category: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  resolution_remarks?: string;
  created_at: string;
}

export default function HelpdeskTicketsManager() {
  const tenantId = localStorage.getItem("tenantId") || "";
  const [searchParams] = useSearchParams();

  const [tickets, setTickets] = useState<HelpdeskTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<HelpdeskTicket | null>(null);

  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    raised_by_name: '',
    raised_by_role: 'Parent',
    category: 'Facilities',
    subject: '',
    description: '',
    priority: 'Medium'
  });

  const [resolveData, setResolveData] = useState({
    status: 'Resolved',
    resolution_remarks: ''
  });

  const fetchTickets = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await api.get<HelpdeskTicket[]>(`/helpdesk/tenant/${tenantId}`);
      setTickets(res.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to load helpdesk complaint tickets.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [tenantId]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setDrawerOpen(true);
    }
  }, [searchParams]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) {
      Swal.fire('Required', 'Subject and Description are required.', 'warning');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/helpdesk', {
        tenant_id: tenantId,
        raised_by_name: formData.raised_by_name || 'Parent User',
        raised_by_role: formData.raised_by_role,
        category: formData.category,
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority
      });

      Swal.fire('Ticket Submitted!', 'Complaint ticket submitted to admin desk.', 'success');
      setDrawerOpen(false);
      setFormData({
        raised_by_name: '',
        raised_by_role: 'Parent',
        category: 'Facilities',
        subject: '',
        description: '',
        priority: 'Medium'
      });
      fetchTickets();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Could not submit ticket.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setSubmitLoading(true);
    try {
      await api.put(`/helpdesk/${selectedTicket.id}/status`, {
        status: resolveData.status,
        resolution_remarks: resolveData.resolution_remarks
      });

      Swal.fire('Updated!', `Ticket ${selectedTicket.ticket_number} updated to ${resolveData.status}.`, 'success');
      setResolveModalOpen(false);
      setSelectedTicket(null);
      fetchTickets();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Could not update ticket status.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const categoryOptions: SearchableSelectOption[] = [
    { value: 'Facilities', label: '🛠️ Campus Facilities & Maintenance' },
    { value: 'Academic', label: '📖 Academic & Curriculum Issues' },
    { value: 'Fee Billing', label: '💳 Fee Voucher & Payment Queries' },
    { value: 'IT / Portal', label: '💻 Mobile App & Portal Tech Support' },
  ];

  const priorityOptions: SearchableSelectOption[] = [
    { value: 'Low', label: '🟢 Low Priority' },
    { value: 'Medium', label: '🟡 Medium Priority' },
    { value: 'High', label: '🟠 High Priority' },
    { value: 'Urgent', label: '🔴 Urgent Priority' },
  ];

  // KPIs
  const openCount = useMemo(() => tickets.filter(t => t.status === 'Open').length, [tickets]);
  const inProgressCount = useMemo(() => tickets.filter(t => t.status === 'In Progress').length, [tickets]);
  const resolvedCount = useMemo(() => tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length, [tickets]);

  const columns = useMemo<ColumnDef<HelpdeskTicket>[]>(
    () => [
      {
        accessorKey: 'ticket_number',
        header: 'Ticket #',
        cell: (info) => <span className="font-bold text-brand-600 dark:text-brand-400">{info.getValue() as string}</span>,
      },
      {
        accessorKey: 'subject',
        header: 'Subject & Description',
        cell: (info) => (
          <div>
            <p className="font-bold text-gray-900 dark:text-white mb-0.5">{info.getValue() as string}</p>
            <p className="text-xs text-gray-500 line-clamp-1">{info.row.original.description}</p>
          </div>
        ),
      },
      {
        accessorKey: 'raised_by_name',
        header: 'Raised By',
        cell: (info) => (
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-0.5">{info.getValue() as string}</p>
            <span className="text-[11px] font-bold text-gray-500">{info.row.original.raised_by_role}</span>
          </div>
        ),
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: (info) => {
          const p = info.getValue() as string;
          const color = p === 'Urgent' ? 'error' : p === 'High' ? 'warning' : p === 'Medium' ? 'primary' : 'light';
          return <Badge variant="light" color={color as any}>{p}</Badge>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const st = info.getValue() as string;
          const color = st === 'Resolved' || st === 'Closed' ? 'success' : st === 'In Progress' ? 'warning' : 'error';
          return <Badge variant="light" color={color as any}>{st.toUpperCase()}</Badge>;
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <ActionMenu 
              items={[
                {
                  label: 'Update Status & Resolve',
                  icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
                  onClick: () => {
                    setSelectedTicket(row.original);
                    setResolveData({ status: row.original.status, resolution_remarks: row.original.resolution_remarks || '' });
                    setResolveModalOpen(true);
                  }
                }
              ]}
            />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="w-full space-y-6">
      
      {/* BREADCRUMB & HEADER */}
      <div>
        <Breadcrumb items={[{ label: 'Communication & Helpdesk', href: '#' }, { label: 'Helpdesk & Ticketing System' }]} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Helpdesk Complaints & Ticketing System</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Parent & Staff complaint ticketing desk for facilities, academic, and portal support issues.</p>
          </div>
          <Button variant="primary" onClick={() => setDrawerOpen(true)}>
            + Raise Helpdesk Ticket
          </Button>
        </div>
      </div>

      {/* KPI CARDS */}
      <StatCards
        loading={loading}
        stats={[
          { title: 'Open Tickets', value: openCount.toString(), icon: <AlertCircle className="w-5 h-5 text-rose-600" />, theme: 'error' },
          { title: 'In Progress', value: inProgressCount.toString(), icon: <LifeBuoy className="w-5 h-5 text-amber-600" />, theme: 'warning' },
          { title: 'Resolved Tickets', value: resolvedCount.toString(), icon: <CheckCircle className="w-5 h-5 text-emerald-600" />, theme: 'success' },
        ]}
      />

      {/* DATA TABLE */}
      <DataTable
        loading={loading}
        data={tickets}
        columns={columns}
        searchPlaceholder="Search complaint tickets by subject or ticket number..."
        emptyMessage="No helpdesk tickets found. Click + Raise Helpdesk Ticket to submit a complaint."
        exportable={true}
        exportFilename="helpdesk_tickets"
      />

      {/* FIXED SLIDE-OVER DRAWER FOR RAISING TICKET */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[999]" onClick={() => setDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[1000] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-brand-500" />
                Raise Helpdesk Complaint Ticket
              </h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="ticketForm" onSubmit={handleCreateTicket} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Complainant Name *</label>
                  <Input 
                    type="text"
                    required
                    placeholder="e.g. Mrs. Fatima Sheikh (Parent)"
                    value={formData.raised_by_name}
                    onChange={(e) => setFormData({ ...formData, raised_by_name: e.target.value })}
                  />
                </div>

                <div>
                  <SearchableSelect
                    label="Complaint Category *"
                    options={categoryOptions}
                    value={formData.category}
                    onChange={(val) => setFormData({ ...formData, category: val })}
                  />
                </div>

                <div>
                  <SearchableSelect
                    label="Priority Level"
                    options={priorityOptions}
                    value={formData.priority}
                    onChange={(val) => setFormData({ ...formData, priority: val })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Subject Title *</label>
                  <Input 
                    type="text"
                    required
                    placeholder="e.g. Fan in Class 5-B is not functioning properly"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Detailed Complaint Description *</label>
                  <textarea 
                    rows={4}
                    required
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    placeholder="Describe the complaint in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                form="ticketForm"
                variant="primary"
                loading={submitLoading}
                loadingText="Submitting..."
              >
                Submit Ticket
              </Button>
            </div>
          </div>
        </>
      )}

      {/* RESOLUTION STATUS MODAL FOR ADMIN */}
      {resolveModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Update Ticket #{selectedTicket.ticket_number}</h3>
              <button onClick={() => setResolveModalOpen(false)} className="text-gray-500 hover:bg-gray-100 rounded-full p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <SearchableSelect 
                  label="Update Ticket Status *"
                  options={[
                    { value: 'Open', label: '🔴 Open' },
                    { value: 'In Progress', label: '🟡 In Progress' },
                    { value: 'Resolved', label: '🟢 Resolved' },
                    { value: 'Closed', label: '⚪ Closed' },
                  ]}
                  value={resolveData.status}
                  onChange={(val) => setResolveData({ ...resolveData, status: val })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Resolution Remarks / Action Taken</label>
                <textarea 
                  rows={3}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                  placeholder="e.g. Electrician repaired the ceiling fan in Class 5-B."
                  value={resolveData.resolution_remarks}
                  onChange={(e) => setResolveData({ ...resolveData, resolution_remarks: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setResolveModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-700" disabled={submitLoading}>
                  {submitLoading ? 'Updating...' : 'Save Resolution'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
