import React, { useState, useMemo } from 'react';
import PageMeta from '../../components/common/PageMeta';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import { toast } from '../../components/ui/Toast';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  Sparkles, 
  ShoppingBag, 
  Star,
  Edit3
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpend: number;
  favoriteDish?: string;
  lastVisit: string;
}

export default function CustomerDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  const [customers, setCustomers] = useState<Customer[]>([
    { id: '1', name: 'Zubair Ahmed', phone: '0300-1122334', email: 'zubair@gmail.com', address: 'House 14, Street 8, F-7/2, Islamabad', loyaltyPoints: 450, totalOrders: 18, totalSpend: 54000, favoriteDish: 'Royal Mutton Karahi', lastVisit: 'Yesterday' },
    { id: '2', name: 'Sara Ali', phone: '0321-5566778', email: 'sara.ali@yahoo.com', address: 'Apartment 4B, Silver Oaks, Islamabad', loyaltyPoints: 210, totalOrders: 8, totalSpend: 19500, favoriteDish: 'Thin Crust Pepperoni Pizza', lastVisit: '3 days ago' },
    { id: '3', name: 'Khurram Shehzad', phone: '0333-9988112', email: 'khurram@hotmail.com', address: 'Plot 45, Phase 4, Bahria Town', loyaltyPoints: 890, totalOrders: 32, totalSpend: 112000, favoriteDish: 'Grilled Chicken Steak', lastVisit: 'Today' },
    { id: '4', name: 'Dr. Ayesha Malik', phone: '0315-7766554', email: 'ayesha.doc@gmail.com', address: 'Sector G-10/4, Islamabad', loyaltyPoints: 120, totalOrders: 4, totalSpend: 12800, favoriteDish: 'Paneer Makhani Handi', lastVisit: '1 week ago' },
  ]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.phone.includes(searchQuery) ||
                          (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchQuery;
    });
  }, [customers, searchQuery]);

  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpend, 0);
    const totalPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);
    return { totalCustomers, totalRevenue, totalPoints };
  }, [customers]);

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Customer name and phone number are required');
      return;
    }

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      loyaltyPoints: 50,
      totalOrders: 1,
      totalSpend: 0,
      lastVisit: 'Today',
    };

    setCustomers(prev => [newCustomer, ...prev]);
    setIsDrawerOpen(false);
    toast.success(`Customer ${newCustomer.name} added to CRM`);
  };

  return (
    <>
      <PageMeta title="Customer & CRM Hub" description="Restaurant Customer Directory & Loyalty Rewards" />

      <div className="w-full space-y-6 animate-in fade-in duration-300 max-w-[1700px] mx-auto pb-12">
        <Breadcrumb items={[{ label: 'Management' }, { label: 'Customers & Loyalty CRM' }]} />

        {/* TOP STAT CARDS */}
        <StatCards
          stats={[
            { title: 'Registered Guests', value: `${stats.totalCustomers} Guests`, icon: <Users className="w-5 h-5" />, theme: 'brand' },
            { title: 'Customer Lifetime Spend', value: `PKR ${stats.totalRevenue.toLocaleString()}`, icon: <ShoppingBag className="w-5 h-5" />, theme: 'success' },
            { title: 'Active Loyalty Points', value: `${stats.totalPoints} Pts`, icon: <Award className="w-5 h-5" />, theme: 'warning' },
            { title: 'Customer Retention Rate', value: '78% Repeat', icon: <Sparkles className="w-5 h-5" />, theme: 'indigo' },
          ]}
        />

        {/* TOOLBAR */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customer name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setFormData({ name: '', phone: '', email: '', address: '' });
              setIsDrawerOpen(true);
            }}
            className="w-full md:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        </div>

        {/* CUSTOMERS TABLE */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Contact Information</th>
                  <th className="px-6 py-4">Orders & Spend</th>
                  <th className="px-6 py-4">Loyalty Balance</th>
                  <th className="px-6 py-4">Favorite Dish</th>
                  <th className="px-6 py-4">Last Visit</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white text-sm block">
                            {customer.name}
                          </span>
                          <span className="text-[11px] text-gray-400 truncate block max-w-xs">
                            {customer.address || 'No address saved'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {customer.phone}
                        </span>
                        {customer.email && (
                          <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 dark:text-white block">
                        PKR {customer.totalSpend.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {customer.totalOrders} total orders
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-extrabold text-xs inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {customer.loyaltyPoints} Pts
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">
                      {customer.favoriteDish || '—'}
                    </td>

                    <td className="px-6 py-4 text-gray-400 text-[11px]">
                      {customer.lastVisit}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <ActionMenu
                        actions={[
                          {
                            label: 'Customer Profile',
                            icon: <Edit3 className="w-4 h-4" />,
                            onClick: () => {
                              setSelectedCustomer(customer);
                              toast.info(`Viewing profile for ${customer.name}`);
                            },
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

        {/* ADD CUSTOMER DRAWER */}
        <ProfileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title="Add Customer Profile"
          subtitle="Register guests for loyalty rewards and delivery"
        >
          <form onSubmit={handleSaveCustomer} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Zubair Ahmed"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g. 0300-1234567"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="e.g. guest@example.com"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                Delivery Address
              </label>
              <textarea
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Full street and apartment address..."
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
                Save Customer
              </button>
            </div>
          </form>
        </ProfileDrawer>

      </div>
    </>
  );
}
