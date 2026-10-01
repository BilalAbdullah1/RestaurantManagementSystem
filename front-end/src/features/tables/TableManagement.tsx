import React, { useState, useMemo } from 'react';
import PageMeta from '../../components/common/PageMeta';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import { toast } from '../../components/ui/Toast';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import { 
  UtensilsCrossed, 
  Users, 
  Clock, 
  Plus, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Search, 
  Receipt,
  User,
  Coffee,
  RotateCcw
} from 'lucide-react';

interface DiningTable {
  id: string;
  tableNumber: string;
  zone: 'GroundFloor' | 'FirstFloor' | 'OutdoorLawn' | 'Rooftop' | 'VIPLounge';
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Billing';
  activeOrder?: {
    orderNumber: string;
    serverName: string;
    guestCount: number;
    amount: number;
    durationMinutes: number;
  };
}

export default function TableManagement() {
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<DiningTable | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isAddTableOpen, setIsAddTableOpen] = useState<boolean>(false);

  // New Table Form state
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newZone, setNewZone] = useState('GroundFloor');
  const [newCapacity, setNewCapacity] = useState('4');

  // Sample Dining Tables
  const [tables, setTables] = useState<DiningTable[]>([
    { id: 't-1', tableNumber: 'T-01', zone: 'GroundFloor', capacity: 4, status: 'Occupied', activeOrder: { orderNumber: '#RMS-1024', serverName: 'Ali Raza', guestCount: 3, amount: 4850, durationMinutes: 35 } },
    { id: 't-2', tableNumber: 'T-02', zone: 'GroundFloor', capacity: 2, status: 'Available' },
    { id: 't-3', tableNumber: 'T-03', zone: 'GroundFloor', capacity: 6, status: 'Occupied', activeOrder: { orderNumber: '#RMS-1028', serverName: 'Hamza Khan', guestCount: 5, amount: 8200, durationMinutes: 50 } },
    { id: 't-4', tableNumber: 'T-04', zone: 'GroundFloor', capacity: 4, status: 'Billing', activeOrder: { orderNumber: '#RMS-1019', serverName: 'Ali Raza', guestCount: 4, amount: 6400, durationMinutes: 65 } },
    { id: 't-5', tableNumber: 'T-05', zone: 'FirstFloor', capacity: 8, status: 'Reserved' },
    { id: 't-6', tableNumber: 'T-06', zone: 'FirstFloor', capacity: 4, status: 'Available' },
    { id: 't-7', tableNumber: 'T-07', zone: 'FirstFloor', capacity: 4, status: 'Occupied', activeOrder: { orderNumber: '#RMS-1031', serverName: 'Bilal Malik', guestCount: 4, amount: 5100, durationMinutes: 20 } },
    { id: 't-8', tableNumber: 'T-08', zone: 'OutdoorLawn', capacity: 4, status: 'Available' },
    { id: 't-9', tableNumber: 'T-09', zone: 'OutdoorLawn', capacity: 6, status: 'Available' },
    { id: 't-10', tableNumber: 'T-10', zone: 'Rooftop', capacity: 2, status: 'Occupied', activeOrder: { orderNumber: '#RMS-1033', serverName: 'Usman Tariq', guestCount: 2, amount: 2900, durationMinutes: 15 } },
    { id: 't-11', tableNumber: 'T-11', zone: 'Rooftop', capacity: 4, status: 'Reserved' },
    { id: 't-12', tableNumber: 'VIP-01', zone: 'VIPLounge', capacity: 10, status: 'Occupied', activeOrder: { orderNumber: '#RMS-1015', serverName: 'Zubair Shah', guestCount: 8, amount: 24500, durationMinutes: 80 } },
  ]);

  const zones = [
    { id: 'All', name: 'All Zones' },
    { id: 'GroundFloor', name: 'Ground Floor' },
    { id: 'FirstFloor', name: 'First Floor' },
    { id: 'OutdoorLawn', name: 'Outdoor Lawn' },
    { id: 'Rooftop', name: 'Rooftop Sky' },
    { id: 'VIPLounge', name: 'VIP Private Lounge' },
  ];

  const zoneSelectOptions = [
    { value: 'GroundFloor', label: 'Ground Floor' },
    { value: 'FirstFloor', label: 'First Floor' },
    { value: 'OutdoorLawn', label: 'Outdoor Lawn' },
    { value: 'Rooftop', label: 'Rooftop Sky' },
    { value: 'VIPLounge', label: 'VIP Private Lounge' },
  ];

  // Filtered tables
  const filteredTables = useMemo(() => {
    return tables.filter(t => {
      const matchZone = selectedZone === 'All' || t.zone === selectedZone;
      const matchStatus = selectedStatus === 'All' || t.status === selectedStatus;
      const matchQuery = t.tableNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchZone && matchStatus && matchQuery;
    });
  }, [tables, selectedZone, selectedStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = tables.length;
    const available = tables.filter(t => t.status === 'Available').length;
    const occupied = tables.filter(t => t.status === 'Occupied').length;
    const reserved = tables.filter(t => t.status === 'Reserved').length;
    return { total, available, occupied, reserved };
  }, [tables]);

  const handleTableClick = (table: DiningTable) => {
    setSelectedTable(table);
    setIsDrawerOpen(true);
  };

  const handleStatusChange = (newStatus: DiningTable['status']) => {
    if (!selectedTable) return;
    setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, status: newStatus } : t));
    setSelectedTable(prev => prev ? { ...prev, status: newStatus } : null);
    toast.success(`Table ${selectedTable.tableNumber} status changed to ${newStatus}`);
  };

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) {
      toast.error('Please enter a valid table number');
      return;
    }
    const newEntry: DiningTable = {
      id: `t-${Date.now()}`,
      tableNumber: newTableNumber.toUpperCase().trim(),
      zone: newZone as any,
      capacity: parseInt(newCapacity, 10) || 4,
      status: 'Available'
    };
    setTables(prev => [...prev, newEntry]);
    setIsAddTableOpen(false);
    setNewTableNumber('');
    toast.success(`New table ${newEntry.tableNumber} added to ${newEntry.zone}`);
  };

  return (
    <>
      <PageMeta title="Table & Floor Plan Management" description="Live Restaurant Dining Tables & Seating" />

      <div className="w-full space-y-6 animate-in fade-in duration-300 max-w-[1700px] mx-auto pb-12">
        <Breadcrumb items={[{ label: 'Operations' }, { label: 'Dining Tables & Floor Plan' }]} />

        {/* TOP STAT CARDS */}
        <StatCards
          stats={[
            { title: 'Total Dining Tables', value: `${stats.total} Tables`, icon: <Layers className="w-5 h-5" />, theme: 'brand' },
            { title: 'Available For Seating', value: `${stats.available} Vacant`, icon: <CheckCircle2 className="w-5 h-5" />, theme: 'success' },
            { title: 'Currently Occupied', value: `${stats.occupied} Dining`, icon: <UtensilsCrossed className="w-5 h-5" />, theme: 'indigo' },
            { title: 'Reserved Tables', value: `${stats.reserved} Booked`, icon: <Clock className="w-5 h-5" />, theme: 'warning' },
          ]}
        />

        {/* TOOLBAR & CONTROLS */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* SEARCH */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search table number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* STATUS FILTER */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold">
              {(['All', 'Available', 'Occupied', 'Reserved', 'Billing'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedStatus === st
                      ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* ADD TABLE BUTTON */}
          <button
            type="button"
            onClick={() => setIsAddTableOpen(true)}
            className="w-full md:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Table
          </button>
        </div>

        {/* ZONE TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {zones.map(z => (
            <button
              key={z.id}
              onClick={() => setSelectedZone(z.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedZone === z.id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-gray-300'
              }`}
            >
              {z.name}
            </button>
          ))}
        </div>

        {/* TABLES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredTables.map(table => {
            const isAvailable = table.status === 'Available';
            const isOccupied = table.status === 'Occupied';
            const isReserved = table.status === 'Reserved';
            const isBilling = table.status === 'Billing';

            return (
              <div
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between h-48 relative overflow-hidden group shadow-sm hover:shadow-xl ${
                  isAvailable
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-500'
                    : isOccupied
                    ? 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800/60 hover:border-amber-500'
                    : isReserved
                    ? 'bg-purple-50/40 dark:bg-purple-950/10 border-purple-200 dark:border-purple-800/60 hover:border-purple-500'
                    : 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-200 dark:border-rose-800/60 hover:border-rose-500'
                }`}
              >
                {/* STATUS BADGE & CAPACITY */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg ${
                    isAvailable
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : isOccupied
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                      : isReserved
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                  }`}>
                    {table.status}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                    <Users className="w-3.5 h-3.5" />
                    {table.capacity}
                  </span>
                </div>

                {/* TABLE NUMBER HERO */}
                <div className="text-center my-auto">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:scale-105 transition-transform">
                    {table.tableNumber}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium capitalize mt-0.5">
                    {table.zone.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>

                {/* ACTIVE ORDER FOOTER */}
                <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800/80 text-[11px]">
                  {table.activeOrder ? (
                    <div className="flex items-center justify-between text-gray-700 dark:text-gray-300 font-bold">
                      <span className="truncate">{table.activeOrder.orderNumber}</span>
                      <span className="text-brand-600 dark:text-brand-400">PKR {table.activeOrder.amount}</span>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 dark:text-gray-500 font-medium">
                      Ready for Seating
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* TABLE DETAILS PROFILE DRAWER */}
        <ProfileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={selectedTable ? `Table ${selectedTable.tableNumber} Details` : 'Table Details'}
          subtitle={selectedTable?.zone.replace(/([A-Z])/g, ' $1').trim()}
        >
          {selectedTable && (
            <div className="space-y-6">
              
              {/* CURRENT STATUS SELECTOR */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Quick Change Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Available', 'Occupied', 'Reserved', 'Billing'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedTable.status === st
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* TABLE METRICS */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 text-xs">
                  <span className="text-gray-400">Seating Capacity:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedTable.capacity} Persons</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 text-xs">
                  <span className="text-gray-400">Floor Zone:</span>
                  <span className="font-bold text-gray-900 dark:text-white capitalize">
                    {selectedTable.zone.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              </div>

              {/* ACTIVE ORDER OVERVIEW */}
              {selectedTable.activeOrder ? (
                <div className="p-4 bg-brand-50/50 dark:bg-brand-950/20 rounded-2xl border border-brand-200 dark:border-brand-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                      Active Order Ticket
                    </span>
                    <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                      {selectedTable.activeOrder.orderNumber}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Server / Waiter:</span>
                      <span className="font-bold text-gray-900 dark:text-white">{selectedTable.activeOrder.serverName}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Seated Guests:</span>
                      <span className="font-bold text-gray-900 dark:text-white">{selectedTable.activeOrder.guestCount} Guests</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Dining Duration:</span>
                      <span className="font-bold text-gray-900 dark:text-white">{selectedTable.activeOrder.durationMinutes} mins</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-brand-200 dark:border-brand-800 text-sm font-extrabold text-gray-900 dark:text-white">
                      <span>Running Bill Total:</span>
                      <span className="text-brand-600 dark:text-brand-400">
                        PKR {selectedTable.activeOrder.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  <UtensilsCrossed className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-300">No active dining session</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Use POS terminal to punch an order to this table.</p>
                </div>
              )}

            </div>
          )}
        </ProfileDrawer>

        {/* ADD TABLE MODAL */}
        {isAddTableOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800 space-y-6">
              
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-brand-500" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Dining Table</h3>
                </div>
                <button
                  onClick={() => setIsAddTableOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddTable} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                    Table Number / Code (e.g. T-15, VIP-02)
                  </label>
                  <input
                    type="text"
                    required
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    placeholder="Enter table code..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                    Floor Zone
                  </label>
                  <SearchableSelect
                    options={zoneSelectOptions}
                    value={newZone}
                    onChange={(val) => setNewZone(val)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                    Seating Capacity (Number of Chairs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddTableOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/25 cursor-pointer"
                  >
                    Save Table
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </>
  );
}
