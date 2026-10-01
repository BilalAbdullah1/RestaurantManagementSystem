import React, { useState, useMemo, useEffect } from 'react';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import Badge from '../../components/ui/badge/Badge';
import { Building, DollarSign, Users, Search, ArrowUpRight, ShieldCheck, Utensils } from 'lucide-react';
import Swal from 'sweetalert2';
import { useSearchParams, Navigate } from 'react-router';
import { activeClientConfig } from '../../config/clientConfig';

interface BranchKpi {
  id: string;
  name: string;
  code: string;
  ordersCount: number;
  staffCount: number;
  revenueCollected: number;
  activeTables: number;
  status: string;
}

export default function ExecutiveMasterDashboard() {
  if (activeClientConfig.lockToSingleSchool) {
    return <Navigate to="/" replace />;
  }

  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || searchParams.get('branch') || '');

  const [branches] = useState<BranchKpi[]>([
    { id: '1', name: 'Voke Gourmet (Main Boulevard, Gulberg)', code: 'RMS-01', ordersCount: 4250, staffCount: 35, revenueCollected: 8625000, activeTables: 28, status: 'Active' },
    { id: '2', name: 'Urban Bistro & Cafe (DHA Phase 5)', code: 'RMS-02', ordersCount: 3180, staffCount: 24, revenueCollected: 5410000, activeTables: 18, status: 'Active' },
    { id: '3', name: 'Royal Steakhouse & Grill (MM Alam Road)', code: 'RMS-03', ordersCount: 2750, staffCount: 22, revenueCollected: 7375000, activeTables: 20, status: 'Active' },
  ]);

  useEffect(() => {
    const q = searchParams.get('search') || searchParams.get('branch');
    if (q !== null && q !== searchTerm) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const filteredBranches = useMemo(() => {
    if (!searchTerm.trim()) return branches;
    const term = searchTerm.toLowerCase();
    return branches.filter(b => 
      b.name.toLowerCase().includes(term) || 
      b.code.toLowerCase().includes(term)
    );
  }, [branches, searchTerm]);

  const totalOrders = branches.reduce((sum, b) => sum + b.ordersCount, 0);
  const totalStaff = branches.reduce((sum, b) => sum + b.staffCount, 0);
  const totalRevenue = branches.reduce((sum, b) => sum + b.revenueCollected, 0);

  const handleBranchDrilldown = (branch: BranchKpi) => {
    Swal.fire({
      title: `${branch.name}`,
      html: `
        <div class="text-left text-sm space-y-2 p-2">
          <p><strong>Branch Code:</strong> <span class="font-mono">${branch.code}</span></p>
          <p><strong>Total Orders Fulfilled:</strong> ${branch.ordersCount.toLocaleString()}</p>
          <p><strong>Active Dining Tables:</strong> ${branch.activeTables}</p>
          <p><strong>Restaurant Staff:</strong> ${branch.staffCount}</p>
          <p><strong>Total Sales Revenue:</strong> Rs. ${branch.revenueCollected.toLocaleString()}</p>
          <p><strong>Operational Status:</strong> <span class="text-emerald-600 font-bold">${branch.status}</span></p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Switch Branch Context',
      showCancelButton: true,
      cancelButtonText: 'Close',
      confirmButtonColor: '#ea580c'
    }).then(result => {
      if (result.isConfirmed) {
        localStorage.setItem('tenantId', branch.code);
        Swal.fire('Branch Switched! 🔄', `Executive active branch context set to ${branch.name}.`, 'success');
      }
    });
  };

  return (
    <div className="w-full space-y-6">
      
      {/* BREADCRUMB & HEADER */}
      <div>
        <Breadcrumb items={[{ label: 'Executive Control', href: '#' }, { label: 'Multi-Branch Master KPI Aggregator' }]} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building className="w-7 h-7 text-orange-600" />
              Executive Master Dashboard & Multi-Branch Enterprise
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enterprise high-level analytics across all dining branches, total revenue, & POS subscriptions.</p>
          </div>
          <Badge variant="light" color="purple" className="text-xs px-3 py-1 font-bold">
            👑 Enterprise RMS License: ACTIVE
          </Badge>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <StatCards
        stats={[
          { title: 'Total Orders Fulfilled', value: totalOrders.toLocaleString(), icon: <Utensils className="w-5 h-5" />, theme: 'brand' },
          { title: 'Cumulative Restaurant Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, theme: 'success' },
          { title: 'Active Kitchen & Service Staff', value: totalStaff.toLocaleString(), icon: <Users className="w-5 h-5" />, theme: 'indigo' },
        ]}
      />

      {/* BRANCHES LIST & SEARCH */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Restaurant Branches</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">Select any branch to inspect floor metrics and POS revenue.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search branch name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Branch Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Branch Code</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Orders</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Tables</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Staff</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Sales Revenue</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No restaurant branch found matching "{searchTerm}". Try clearing your search term.
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs">
                        {branch.code.slice(0, 3)}
                      </div>
                      {branch.name}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-slate-400">{branch.code}</td>
                    <td className="px-6 py-4 text-sm text-center font-semibold text-gray-700 dark:text-slate-300">{branch.ordersCount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-center font-semibold text-gray-700 dark:text-slate-300">{branch.activeTables} Tables</td>
                    <td className="px-6 py-4 text-sm text-center font-semibold text-gray-700 dark:text-slate-300">{branch.staffCount}</td>
                    <td className="px-6 py-4 text-sm text-right font-black text-emerald-600 dark:text-emerald-400">Rs. {branch.revenueCollected.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                        {branch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleBranchDrilldown(branch)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1 text-xs font-bold"
                      >
                        Drilldown <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
