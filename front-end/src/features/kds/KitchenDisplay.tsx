import React, { useState, useEffect } from 'react';
import PageMeta from '../../components/common/PageMeta';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import { toast } from '../../components/ui/Toast';
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  UtensilsCrossed, 
  Check, 
  RotateCcw,
  Sparkles,
  Volume2
} from 'lucide-react';

interface KdsItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  isCompleted: boolean;
  station: 'Grill' | 'Fryer' | 'MainKitchen' | 'Beverages';
}

interface KdsTicket {
  id: string;
  ticketNumber: string;
  orderType: 'DineIn' | 'Takeaway' | 'Delivery';
  tableNumber?: string;
  serverName: string;
  elapsedMinutes: number;
  status: 'Cooking' | 'Ready' | 'Served';
  items: KdsItem[];
}

export default function KitchenDisplay() {
  const [selectedStation, setSelectedStation] = useState<string>('All');

  const [tickets, setTickets] = useState<KdsTicket[]>([
    {
      id: 'k-1',
      ticketNumber: '#KOT-104',
      orderType: 'DineIn',
      tableNumber: 'T-01',
      serverName: 'Ali Raza',
      elapsedMinutes: 14,
      status: 'Cooking',
      items: [
        { id: 'i-1', name: 'Crispy Buffalo Wings (8 Pcs)', quantity: 2, isCompleted: true, station: 'Fryer', notes: 'Extra spicy ranch' },
        { id: 'i-2', name: 'Royal Mutton Karahi (Full)', quantity: 1, isCompleted: false, station: 'MainKitchen', notes: 'Low ginger, mild green chilies' },
        { id: 'i-3', name: 'Roghni Naan', quantity: 4, isCompleted: false, station: 'MainKitchen' },
      ],
    },
    {
      id: 'k-2',
      ticketNumber: '#KOT-105',
      orderType: 'Takeaway',
      serverName: 'Hamza Khan',
      elapsedMinutes: 8,
      status: 'Cooking',
      items: [
        { id: 'i-4', name: 'Double Smash Beef Burger', quantity: 2, isCompleted: false, station: 'Grill', notes: 'No pickles' },
        { id: 'i-5', name: 'Garlic Parmesan Fries', quantity: 1, isCompleted: true, station: 'Fryer' },
        { id: 'i-6', name: 'Mint Lemonade Chiller', quantity: 2, isCompleted: false, station: 'Beverages' },
      ],
    },
    {
      id: 'k-3',
      ticketNumber: '#KOT-106',
      orderType: 'DineIn',
      tableNumber: 'VIP-01',
      serverName: 'Zubair Shah',
      elapsedMinutes: 22,
      status: 'Cooking',
      items: [
        { id: 'i-7', name: 'Grilled Chicken Steak (Mushroom Sauce)', quantity: 3, isCompleted: false, station: 'Grill', notes: 'Medium rare' },
        { id: 'i-8', name: 'Thin Crust Pepperoni Pizza (Large)', quantity: 1, isCompleted: false, station: 'MainKitchen' },
        { id: 'i-9', name: 'Blue Lagoon Mocktails', quantity: 4, isCompleted: true, station: 'Beverages' },
      ],
    },
    {
      id: 'k-4',
      ticketNumber: '#KOT-102',
      orderType: 'Delivery',
      serverName: 'Cashier Desk',
      elapsedMinutes: 4,
      status: 'Ready',
      items: [
        { id: 'i-10', name: 'Classic Margherita Pizza', quantity: 2, isCompleted: true, station: 'MainKitchen' },
        { id: 'i-11', name: 'Loaded Beef Nachos', quantity: 1, isCompleted: true, station: 'Fryer' },
      ],
    },
  ]);

  const stations = ['All', 'Grill', 'Fryer', 'MainKitchen', 'Beverages'];

  const toggleItemDone = (ticketId: string, itemId: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const updatedItems = t.items.map(item => item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item);
        const allDone = updatedItems.every(i => i.isCompleted);
        return {
          ...t,
          items: updatedItems,
          status: allDone ? 'Ready' : 'Cooking',
        };
      }
      return t;
    }));
  };

  const markTicketReady = (ticketId: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const updatedItems = t.items.map(i => ({ ...i, isCompleted: true }));
        return { ...t, status: 'Ready', items: updatedItems };
      }
      return t;
    }));
    toast.success('KOT Ticket marked as READY for serving!');
  };

  const markTicketServed = (ticketId: string) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
    toast.success('KOT Ticket served & cleared from kitchen screen!');
  };

  const cookingCount = tickets.filter(t => t.status === 'Cooking').length;
  const readyCount = tickets.filter(t => t.status === 'Ready').length;

  return (
    <>
      <PageMeta title="Kitchen Display System (KDS)" description="Real-time Chef & Kitchen Screen" />

      <div className="w-full space-y-6 animate-in fade-in duration-300 max-w-[1700px] mx-auto pb-12">
        <Breadcrumb items={[{ label: 'Operations' }, { label: 'Kitchen Display System (KDS)' }]} />

        {/* TOP STAT CARDS */}
        <StatCards
          stats={[
            { title: 'Orders In Kitchen', value: `${tickets.length} Tickets`, icon: <Flame className="w-5 h-5" />, theme: 'brand' },
            { title: 'Currently Cooking', value: `${cookingCount} In Prep`, icon: <Clock className="w-5 h-5" />, theme: 'warning' },
            { title: 'Ready For Pick Up', value: `${readyCount} Plated`, icon: <CheckCircle2 className="w-5 h-5" />, theme: 'success' },
            { title: 'Avg Preparation Time', value: '14 Mins', icon: <Sparkles className="w-5 h-5" />, theme: 'indigo' },
          ]}
        />

        {/* STATION FILTERS */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {stations.map(st => (
              <button
                key={st}
                onClick={() => setSelectedStation(st)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedStation === st
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {st === 'All' ? '👨‍🍳 All Stations' : st === 'MainKitchen' ? '🍲 Main Kitchen' : `🍳 ${st}`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <Volume2 className="w-4 h-4 text-brand-500 animate-pulse" />
            <span>Live KOT Feed</span>
          </div>
        </div>

        {/* KDS TICKETS CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          {tickets.map(ticket => {
            const isDelayed = ticket.elapsedMinutes > 18;
            const isReady = ticket.status === 'Ready';

            const filteredItems = ticket.items.filter(i => {
              if (selectedStation === 'All') return true;
              return i.station === selectedStation;
            });

            if (filteredItems.length === 0) return null;

            return (
              <div
                key={ticket.id}
                className={`rounded-3xl border shadow-lg overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                  isReady
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                    : isDelayed
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800 animate-pulse'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                }`}
              >
                {/* TICKET HEADER */}
                <div className={`p-4 border-b ${
                  isReady
                    ? 'bg-emerald-500 text-white'
                    : isDelayed
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-900 text-white dark:bg-gray-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-black tracking-wide block">
                        {ticket.ticketNumber}
                      </span>
                      <span className="text-[11px] opacity-90 font-medium">
                        {ticket.orderType} {ticket.tableNumber ? `• Table ${ticket.tableNumber}` : ''}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="flex items-center gap-1 text-xs font-extrabold">
                        <Clock className="w-3.5 h-3.5" />
                        {ticket.elapsedMinutes} mins
                      </span>
                      <span className="text-[10px] opacity-80 block">
                        Server: {ticket.serverName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ITEMS CHECKLIST */}
                <div className="p-4 space-y-3 divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleItemDone(ticket.id, item.id)}
                      className={`pt-2.5 first:pt-0 flex items-start gap-3 cursor-pointer group select-none transition-opacity ${
                        item.isCompleted ? 'opacity-40 line-through' : 'opacity-100'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                        item.isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 group-hover:border-brand-500'
                      }`}>
                        {item.isCompleted && <Check className="w-3.5 h-3.5" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400">
                            {item.quantity}x
                          </span>
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {item.name}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5 italic">
                            ⚠️ Note: {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* TICKET FOOTER ACTIONS */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                  {!isReady ? (
                    <button
                      type="button"
                      onClick={() => markTicketReady(ticket.id)}
                      className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Ready
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markTicketServed(ticket.id)}
                      className="flex-1 py-2.5 px-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UtensilsCrossed className="w-4 h-4" />
                      Serve & Bump
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </>
  );
}
