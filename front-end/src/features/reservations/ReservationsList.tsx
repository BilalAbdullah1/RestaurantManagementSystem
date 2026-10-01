import React, { useState, useMemo } from 'react';
import PageMeta from '../../components/common/PageMeta';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import { toast } from '../../components/ui/Toast';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import { 
  Calendar, 
  Clock, 
  Users, 
  Phone, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  UtensilsCrossed, 
  User,
  MessageSquare
} from 'lucide-react';

interface Reservation {
  id: string;
  customerName: string;
  contactNumber: string;
  guestCount: number;
  reservationDate: string;
  timeSlot: string;
  tableNumber: string;
  status: 'Confirmed' | 'Seated' | 'Cancelled';
  specialNotes?: string;
}

export default function ReservationsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    contactNumber: '',
    guestCount: '4',
    reservationDate: new Date().toISOString().split('T')[0],
    timeSlot: '08:00 PM',
    tableNumber: 'T-05',
    specialNotes: '',
  });

  const [reservations, setReservations] = useState<Reservation[]>([
    { id: '1', customerName: 'Fahad Tariq', contactNumber: '0300-8451290', guestCount: 6, reservationDate: '2026-10-02', timeSlot: '08:30 PM', tableNumber: 'T-05', status: 'Confirmed', specialNotes: 'Birthday celebration setup' },
    { id: '2', customerName: 'Dr. Ayesha Malik', contactNumber: '0321-4567890', guestCount: 4, reservationDate: '2026-10-02', timeSlot: '09:00 PM', tableNumber: 'T-11', status: 'Confirmed', specialNotes: 'Quiet corner preferred' },
    { id: '3', customerName: 'Salman Enterprise', contactNumber: '0333-1122334', guestCount: 10, reservationDate: '2026-10-02', timeSlot: '07:30 PM', tableNumber: 'VIP-01', status: 'Seated', specialNotes: 'Corporate executive dinner' },
    { id: '4', customerName: 'Usman Ghani', contactNumber: '0315-9988776', guestCount: 2, reservationDate: '2026-10-02', timeSlot: '08:00 PM', tableNumber: 'T-02', status: 'Cancelled', specialNotes: 'Rescheduled by guest' },
  ]);

  const tableOptions = [
    { value: 'T-01', label: 'Table T-01 (4 Seats - Ground)' },
    { value: 'T-02', label: 'Table T-02 (2 Seats - Ground)' },
    { value: 'T-05', label: 'Table T-05 (8 Seats - First Floor)' },
    { value: 'T-11', label: 'Table T-11 (4 Seats - Rooftop)' },
    { value: 'VIP-01', label: 'VIP-01 Lounge (10 Seats - Private)' },
  ];

  const timeOptions = [
    { value: '06:00 PM', label: '06:00 PM - Early Dinner' },
    { value: '07:00 PM', label: '07:00 PM - Dinner' },
    { value: '07:30 PM', label: '07:30 PM - Dinner' },
    { value: '08:00 PM', label: '08:00 PM - Prime Dinner' },
    { value: '08:30 PM', label: '08:30 PM - Prime Dinner' },
    { value: '09:00 PM', label: '09:00 PM - Late Dinner' },
    { value: '09:30 PM', label: '09:30 PM - Late Dinner' },
    { value: '10:00 PM', label: '10:00 PM - Night Special' },
  ];

  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      const matchStatus = selectedStatus === 'All' || r.status === selectedStatus;
      const matchQuery = r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.contactNumber.includes(searchQuery) ||
                          r.tableNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [reservations, selectedStatus, searchQuery]);

  const stats = useMemo(() => {
    const total = reservations.length;
    const confirmed = reservations.filter(r => r.status === 'Confirmed').length;
    const seated = reservations.filter(r => r.status === 'Seated').length;
    return { total, confirmed, seated };
  }, [reservations]);

  const handleStatusChange = (id: string, newStatus: Reservation['status']) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    toast.success(`Reservation status updated to ${newStatus}`);
  };

  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.contactNumber.trim()) {
      toast.error('Customer name and contact number are required');
      return;
    }

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      customerName: formData.customerName,
      contactNumber: formData.contactNumber,
      guestCount: parseInt(formData.guestCount, 10) || 2,
      reservationDate: formData.reservationDate,
      timeSlot: formData.timeSlot,
      tableNumber: formData.tableNumber,
      status: 'Confirmed',
      specialNotes: formData.specialNotes,
    };

    setReservations(prev => [newRes, ...prev]);
    setIsDrawerOpen(false);
    toast.success(`Table ${newRes.tableNumber} reserved for ${newRes.customerName}!`);
  };

  return (
    <>
      <PageMeta title="Table Reservations" description="Manage Restaurant Table Bookings" />

      <div className="w-full space-y-6 animate-in fade-in duration-300 max-w-[1700px] mx-auto pb-12">
        <Breadcrumb items={[{ label: 'Operations' }, { label: 'Table Reservations' }]} />

        {/* TOP STAT CARDS */}
        <StatCards
          stats={[
            { title: 'Total Bookings Today', value: `${stats.total} Bookings`, icon: <Calendar className="w-5 h-5" />, theme: 'brand' },
            { title: 'Confirmed Upcoming', value: `${stats.confirmed} Guests`, icon: <CheckCircle2 className="w-5 h-5" />, theme: 'warning' },
            { title: 'Currently Seated', value: `${stats.seated} Dining`, icon: <UtensilsCrossed className="w-5 h-5" />, theme: 'success' },
            { title: 'Avg Party Size', value: '5 Persons', icon: <Users className="w-5 h-5" />, theme: 'indigo' },
          ]}
        />

        {/* TOOLBAR */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search guest or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold">
              {(['All', 'Confirmed', 'Seated', 'Cancelled'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedStatus === st
                      ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Book Table
            </button>
          </div>
        </div>

        {/* RESERVATIONS TABLE */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="px-6 py-4">Guest Information</th>
                  <th className="px-6 py-4">Reserved Table</th>
                  <th className="px-6 py-4">Party Size</th>
                  <th className="px-6 py-4">Date & Time Slot</th>
                  <th className="px-6 py-4">Special Requests</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                {filteredReservations.map(res => (
                  <tr key={res.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white text-sm block">
                          {res.customerName}
                        </span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {res.contactNumber}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-extrabold text-xs">
                        {res.tableNumber}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 font-bold text-gray-700 dark:text-gray-300">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {res.guestCount} Guests
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white block">{res.timeSlot}</span>
                        <span className="text-[11px] text-gray-400">{res.reservationDate}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-[11px] text-gray-500 italic">
                        {res.specialNotes || 'None'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                        res.status === 'Confirmed'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                          : res.status === 'Seated'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                      }`}>
                        {res.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <ActionMenu
                        actions={[
                          {
                            label: 'Mark as Seated',
                            icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
                            onClick: () => handleStatusChange(res.id, 'Seated'),
                          },
                          {
                            label: 'Cancel Reservation',
                            icon: <XCircle className="w-4 h-4 text-rose-500" />,
                            onClick: () => handleStatusChange(res.id, 'Cancelled'),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOOK TABLE PROFILE DRAWER */}
        <ProfileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title="New Table Reservation"
          subtitle="Reserve dining tables for guests in advance"
        >
          <form onSubmit={handleSaveBooking} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                Guest / Customer Name *
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="e.g. Tariq Mehmood"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                Contact Phone Number *
              </label>
              <input
                type="text"
                required
                value={formData.contactNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                placeholder="e.g. 0300-1234567"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                  Party Size (Guests)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.guestCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, guestCount: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                  Reservation Date
                </label>
                <input
                  type="date"
                  value={formData.reservationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, reservationDate: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                Time Slot
              </label>
              <SearchableSelect
                options={timeOptions}
                value={formData.timeSlot}
                onChange={(val) => setFormData(prev => ({ ...prev, timeSlot: val }))}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                Assign Dining Table
              </label>
              <SearchableSelect
                options={tableOptions}
                value={formData.tableNumber}
                onChange={(val) => setFormData(prev => ({ ...prev, tableNumber: val }))}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                Special Requests / Notes
              </label>
              <textarea
                rows={2}
                value={formData.specialNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, specialNotes: e.target.value }))}
                placeholder="e.g. Birthday cake candle, window side seating..."
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/25 cursor-pointer"
              >
                Confirm Booking
              </button>
            </div>
          </form>
        </ProfileDrawer>

      </div>
    </>
  );
}
