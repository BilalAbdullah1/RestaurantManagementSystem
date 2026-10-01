import React, { useState, useMemo } from 'react';
import PageMeta from '../../components/common/PageMeta';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import { toast } from '../../components/ui/Toast';
import { 
  Receipt, 
  Search, 
  Eye, 
  Printer, 
  Clock, 
  CheckCircle2, 
  UtensilsCrossed, 
  CreditCard, 
  Banknote,
  Sparkles,
  User,
  MapPin,
  Calendar
} from 'lucide-react';

interface OrderRecord {
  id: string;
  orderNumber: string;
  orderType: 'DineIn' | 'Takeaway' | 'Delivery';
  tableNumber?: string;
  customerName: string;
  customerPhone?: string;
  totalAmount: number;
  paymentMethod: 'Cash' | 'Card' | 'Online';
  paymentStatus: 'Paid' | 'Unpaid' | 'Refunded';
  orderStatus: 'Completed' | 'Cooking' | 'Ready' | 'Cancelled';
  itemsCount: number;
  createdAt: string;
}

export default function OrdersList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [orders] = useState<OrderRecord[]>([
    { id: '1', orderNumber: '#RMS-1028', orderType: 'DineIn', tableNumber: 'T-03', customerName: 'Zubair Ahmed', totalAmount: 8200, paymentMethod: 'Card', paymentStatus: 'Paid', orderStatus: 'Cooking', itemsCount: 5, createdAt: '10 mins ago' },
    { id: '2', orderNumber: '#RMS-1027', orderType: 'DineIn', tableNumber: 'T-01', customerName: 'Tariq Mehmood', totalAmount: 4850, paymentMethod: 'Cash', paymentStatus: 'Paid', orderStatus: 'Completed', itemsCount: 3, createdAt: '25 mins ago' },
    { id: '3', orderNumber: '#RMS-1026', orderType: 'Takeaway', customerName: 'Sara Ali', customerPhone: '0300-1234567', totalAmount: 2350, paymentMethod: 'Online', paymentStatus: 'Paid', orderStatus: 'Ready', itemsCount: 2, createdAt: '35 mins ago' },
    { id: '4', orderNumber: '#RMS-1025', orderType: 'Delivery', customerName: 'Khurram Shehzad', customerPhone: '0321-9876543', totalAmount: 3900, paymentMethod: 'Cash', paymentStatus: 'Paid', orderStatus: 'Completed', itemsCount: 4, createdAt: '1 hour ago' },
    { id: '5', orderNumber: '#RMS-1024', orderType: 'DineIn', tableNumber: 'VIP-01', customerName: 'Malik Enterprises', totalAmount: 24500, paymentMethod: 'Card', paymentStatus: 'Paid', orderStatus: 'Completed', itemsCount: 12, createdAt: '2 hours ago' },
    { id: '6', orderNumber: '#RMS-1023', orderType: 'DineIn', tableNumber: 'T-04', customerName: 'Walk-in Guest', totalAmount: 1850, paymentMethod: 'Cash', paymentStatus: 'Paid', orderStatus: 'Completed', itemsCount: 2, createdAt: '3 hours ago' },
  ]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchType = selectedType === 'All' || o.orderType === selectedType;
      const matchStatus = selectedStatus === 'All' || o.orderStatus === selectedStatus;
      const matchQuery = o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchStatus && matchQuery;
    });
  }, [orders, selectedType, selectedStatus, searchQuery]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const dineInCount = orders.filter(o => o.orderType === 'DineIn').length;
    const deliveryCount = orders.filter(o => o.orderType === 'Delivery').length;
    return { totalOrders, totalSales, dineInCount, deliveryCount };
  }, [orders]);

  const handleViewOrder = (order: OrderRecord) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handlePrintReceipt = (order: OrderRecord) => {
    toast.success(`Printing receipt for ${order.orderNumber}...`);
  };

  return (
    <>
      <PageMeta title="Orders & Billing History" description="Restaurant Orders, Invoices and Bills" />

      <div className="w-full space-y-6 animate-in fade-in duration-300 max-w-[1700px] mx-auto pb-12">
        <Breadcrumb items={[{ label: 'Operations' }, { label: 'Orders & Receipts History' }]} />

        {/* TOP STAT CARDS */}
        <StatCards
          stats={[
            { title: 'Total Shift Revenue', value: `PKR ${stats.totalSales.toLocaleString()}`, icon: <Receipt className="w-5 h-5" />, theme: 'brand' },
            { title: 'Total Billed Orders', value: `${stats.totalOrders} Invoices`, icon: <CheckCircle2 className="w-5 h-5" />, theme: 'success' },
            { title: 'Dine-in Sessions', value: `${stats.dineInCount} Tables`, icon: <UtensilsCrossed className="w-5 h-5" />, theme: 'indigo' },
            { title: 'Takeaway / Delivery', value: `${stats.deliveryCount} Dispatched`, icon: <Sparkles className="w-5 h-5" />, theme: 'warning' },
          ]}
        />

        {/* TOOLBAR */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search order number or guest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold">
              {(['All', 'DineIn', 'Takeaway', 'Delivery'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedType === type
                      ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ORDERS TABLE */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="px-6 py-4">Order #</th>
                  <th className="px-6 py-4">Type & Table</th>
                  <th className="px-6 py-4">Guest / Customer</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-brand-600 dark:text-brand-400 text-sm">
                        {order.orderNumber}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 font-bold text-[11px] text-gray-700 dark:text-gray-300">
                          {order.orderType}
                        </span>
                        {order.tableNumber && (
                          <span className="text-[11px] font-bold text-gray-500">
                            ({order.tableNumber})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 dark:text-white block">{order.customerName}</span>
                      {order.customerPhone && (
                        <span className="text-[11px] text-gray-400">{order.customerPhone}</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                        PKR {order.totalAmount.toLocaleString()}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-gray-700 dark:text-gray-300">
                        {order.paymentMethod === 'Cash' ? <Banknote className="w-3.5 h-3.5 text-emerald-500" /> : <CreditCard className="w-3.5 h-3.5 text-sky-500" />}
                        {order.paymentMethod}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                        order.orderStatus === 'Completed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                          : order.orderStatus === 'Cooking'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                          : 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-400 text-[11px]">
                      {order.createdAt}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <ActionMenu
                        actions={[
                          {
                            label: 'View Order Details',
                            icon: <Eye className="w-4 h-4" />,
                            onClick: () => handleViewOrder(order),
                          },
                          {
                            label: 'Print Thermal Receipt',
                            icon: <Printer className="w-4 h-4" />,
                            onClick: () => handlePrintReceipt(order),
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

        {/* ORDER DETAILS PROFILE DRAWER */}
        <ProfileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={selectedOrder ? `Order Details: ${selectedOrder.orderNumber}` : 'Order Details'}
          subtitle={selectedOrder ? `${selectedOrder.orderType} • ${selectedOrder.createdAt}` : ''}
        >
          {selectedOrder && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Status:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{selectedOrder.orderStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Guest Name:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{selectedOrder.customerName}</span>
                </div>
                {selectedOrder.tableNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Table:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{selectedOrder.tableNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment:</span>
                  <span className="font-bold text-emerald-600">{selectedOrder.paymentMethod} (Paid)</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700 text-sm font-extrabold">
                  <span>Grand Total:</span>
                  <span className="text-brand-600 dark:text-brand-400 text-base">
                    PKR {selectedOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => handlePrintReceipt(selectedOrder)}
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print Official Receipt
                </button>
              </div>
            </div>
          )}
        </ProfileDrawer>

      </div>
    </>
  );
}
