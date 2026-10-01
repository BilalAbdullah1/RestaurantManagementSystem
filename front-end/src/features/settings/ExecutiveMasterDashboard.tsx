import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Building, DollarSign, Users, Award, ShieldCheck, TrendingUp, Activity, CheckCircle2, Search, ExternalLink } from 'lucide-react';
import { activeClientConfig } from '../../config/clientConfig';
import { Navigate, useSearchParams } from 'react-router';

interface BranchKpi {
  id: string;
  name: string;
  code: string;
  studentsCount: number;
  staffCount: number;
  revenueCollected: number;
  pendingDues: number;
  status: string;
}

export default function ExecutiveMasterDashboard() {
  if (activeClientConfig.lockToSingleSchool) {
    return <Navigate to="/" replace />;
  }

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || searchParams.get('campus') || '');

  const [branches, setBranches] = useState<BranchKpi[]>([
    { id: '1', name: 'Divisional Public School (Main Campus)', code: 'DPS-01', studentsCount: 1250, staffCount: 85, revenueCollected: 5625000, pendingDues: 340000, status: 'Active' },
    { id: '2', name: 'Army Public School (City Branch)', code: 'APS-02', studentsCount: 980, staffCount: 62, revenueCollected: 4410000, pendingDues: 210000, status: 'Active' },
    { id: '3', name: 'Beaconhouse School System (Girls Wing)', code: 'BSS-03', studentsCount: 750, staffCount: 48, revenueCollected: 3375000, pendingDues: 180000, status: 'Active' },
  ]);

  useEffect(() => {
    const q = searchParams.get('search') || searchParams.get('campus');
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

  const totalStudents = branches.reduce((sum, b) => sum + b.studentsCount, 0);
  const totalStaff = branches.reduce((sum, b) => sum + b.staffCount, 0);
  const totalRevenue = branches.reduce((sum, b) => sum + b.revenueCollected, 0);

  const handleBranchDrilldown = (branch: BranchKpi) => {
    Swal.fire({
      title: `${branch.name}`,
      html: `
        <div class="text-left text-sm space-y-2 p-2">
          <p><strong>Campus Code:</strong> <span class="font-mono">${branch.code}</span></p>
          <p><strong>Enrolled Students:</strong> ${branch.studentsCount}</p>
          <p><strong>Teaching Staff:</strong> ${branch.staffCount}</p>
          <p><strong>Total Revenue:</strong> Rs. ${branch.revenueCollected.toLocaleString()}</p>
          <p><strong>Outstanding Balance:</strong> Rs. ${branch.pendingDues.toLocaleString()}</p>
          <p><strong>Operational Status:</strong> <span class="text-emerald-600 font-bold">${branch.status}</span></p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Switch Tenant Session',
      showCancelButton: true,
      cancelButtonText: 'Close',
      confirmButtonColor: '#4f46e5'
    }).then(result => {
      if (result.isConfirmed) {
        localStorage.setItem('tenantId', branch.code);
        Swal.fire('Session Switched! 🔄', `Super Admin active tenant context set to ${branch.name}.`, 'success');
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
              <Building className="w-7 h-7 text-indigo-600" />
              Executive Master Dashboard & Multi-Branch Super Admin
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Super Admin high-level analytics across all school campuses, total revenue, & multi-tenant subscriptions.</p>
          </div>
          <Badge variant="light" color="purple" className="text-xs px-3 py-1 font-bold">
            👑 Super Admin License: ACTIVE
          </Badge>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <StatCards
        stats={[
          { title: 'Total Enrolled Students', value: totalStudents.toLocaleString(), icon: <Users className="w-5 h-5" />, theme: 'brand' },
          { title: 'Cumulative Revenue Collected', value: `Rs. ${totalRevenue.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, theme: 'success' },
          { title: 'Total Teaching & Staff', value: totalStaff.toLocaleString(), icon: <ShieldCheck className="w-5 h-5" />, theme: 'indigo' },
        ]}
      />

      {/* BRANCHES COMPARATIVE TABLE */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600" />
              Multi-Campus Performance & Financial Matrix
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Showing {filteredBranches.length} of {branches.length} registered campuses</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search campus name or code..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearchParams(e.target.value ? { search: e.target.value } : {});
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs font-bold uppercase text-gray-500">
              <tr>
                <th className="p-4">Campus Name & Code</th>
                <th className="p-4">Total Students</th>
                <th className="p-4">Staff Count</th>
                <th className="p-4">Revenue Collected</th>
                <th className="p-4">Pending Dues</th>
                <th className="p-4 text-center">Tenant Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
              {filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mb-3">
                        <Building className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                        No Campuses Matched
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        No school campus found matching "{searchTerm}". Try clearing your search term.
                      </p>
                      <Button variant="outline" onClick={() => { setSearchTerm(''); setSearchParams({}); }} className="text-xs">
                        Clear Filter
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBranches.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="p-4 font-bold text-gray-900 dark:text-white">
                      {b.name} <span className="text-xs text-indigo-600 font-mono">({b.code})</span>
                    </td>
                    <td className="p-4 text-gray-700 dark:text-gray-300 font-bold">{b.studentsCount} Students</td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">{b.staffCount} Staff</td>
                    <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">Rs. {b.revenueCollected.toLocaleString()}</td>
                    <td className="p-4 font-bold text-rose-600 dark:text-rose-400">Rs. {b.pendingDues.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <Badge variant="light" color="success">● {b.status}</Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="outline"
                        onClick={() => handleBranchDrilldown(b)}
                        className="text-xs border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" /> Inspect
                      </Button>
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
