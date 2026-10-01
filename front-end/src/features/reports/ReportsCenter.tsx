import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { motion } from 'framer-motion';
import PageMeta from '../../components/common/PageMeta';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import { 
  FileText, 
  Award, 
  Receipt, 
  GraduationCap, 
  DollarSign, 
  IdCard, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  Scale, 
  BookOpen, 
  Users,
  ChevronRight,
  Search,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  CalendarDays,
  FileSpreadsheet,
  ArrowUpRight
} from 'lucide-react';

interface ReportItem {
  id: string;
  title: string;
  category: 'Academic' | 'Financial' | 'Certificates & Student';
  description: string;
  path: string;
  icon: React.ReactNode;
  badge: string;
  color: string;
  gradient: string;
}

export default function ReportsCenter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Academic' | 'Financial' | 'Certificates & Student'>(
    (searchParams.get('category') as any) || 'All'
  );

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && ['All', 'Academic', 'Financial', 'Certificates & Student'].includes(cat)) {
      setSelectedCategory(cat as any);
    }
  }, [searchParams]);

  const reportsList: ReportItem[] = [
    {
      id: 'broadsheet',
      title: 'Class Broadsheet Result',
      category: 'Academic',
      description: 'Comprehensive exam broadsheet matrix, score ratio, percentage, and candidate rankings.',
      path: '/reports/broadsheet',
      icon: <Award className="w-6 h-6 text-indigo-500" />,
      badge: 'Academic Broadsheet',
      color: 'border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-500',
      gradient: 'from-indigo-500/10 to-indigo-600/5',
    },
    {
      id: 'fee-voucher',
      title: '3-Copy Fee Voucher Slip',
      category: 'Financial',
      description: 'Official A4 3-part printable fee collection vouchers (Bank, School, and Parent copy).',
      path: '/reports/fee-voucher',
      icon: <Receipt className="w-6 h-6 text-emerald-500" />,
      badge: '3-Copy Printable',
      color: 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-500',
      gradient: 'from-emerald-500/10 to-teal-600/5',
    },
    {
      id: 'slc-certificate',
      title: 'School Leaving Certificate (SLC)',
      category: 'Certificates & Student',
      description: 'Generate and print official School Leaving & Character Certificates with school seal.',
      path: '/reports/slc-certificate',
      icon: <GraduationCap className="w-6 h-6 text-amber-500" />,
      badge: 'Official SLC PDF',
      color: 'border-amber-200 dark:border-amber-900/60 hover:border-amber-500',
      gradient: 'from-amber-500/10 to-orange-600/5',
    },
    {
      id: 'staff-payroll',
      title: 'Staff Payroll Summary',
      category: 'Financial',
      description: 'Monthly staff salary summaries, base pay breakdowns, net payable calculations.',
      path: '/reports/staff-payroll',
      icon: <DollarSign className="w-6 h-6 text-purple-500" />,
      badge: 'HR & Salaries',
      color: 'border-purple-200 dark:border-purple-900/60 hover:border-purple-500',
      gradient: 'from-purple-500/10 to-violet-600/5',
    },
    {
      id: 'student-id-cards',
      title: 'Bulk Student ID Cards Sheet',
      category: 'Certificates & Student',
      description: 'Printable grid layout of official Student Identification Cards filtered by class.',
      path: '/reports/student-id-cards',
      icon: <IdCard className="w-6 h-6 text-blue-500" />,
      badge: 'Bulk ID Printable',
      color: 'border-blue-200 dark:border-blue-900/60 hover:border-blue-500',
      gradient: 'from-blue-500/10 to-sky-600/5',
    },
    {
      id: 'attendance',
      title: 'Student Attendance Heatmap',
      category: 'Academic',
      description: 'Daily class attendance heatmap grid, low attendance alerts, and student roll summary.',
      path: '/reports/attendance',
      icon: <Calendar className="w-6 h-6 text-teal-500" />,
      badge: 'Analytics Heatmap',
      color: 'border-teal-200 dark:border-teal-900/60 hover:border-teal-500',
      gradient: 'from-teal-500/10 to-emerald-600/5',
    },
    {
      id: 'fee-defaulters',
      title: 'Fee Defaulters Aging Report',
      category: 'Financial',
      description: 'Track overdue fee balances, aging buckets (1-30, 31-60, 90+ days), and send WhatsApp alerts.',
      path: '/reports/fee-defaulters',
      icon: <AlertTriangle className="w-6 h-6 text-rose-500" />,
      badge: 'Aging Buckets',
      color: 'border-rose-200 dark:border-rose-900/60 hover:border-rose-500',
      gradient: 'from-rose-500/10 to-red-600/5',
    },
    {
      id: 'profit-loss',
      title: 'Profit & Loss Statement',
      category: 'Financial',
      description: 'Income vs Expenditure calculation, itemized revenue/expense breakdown, and PDF export.',
      path: '/reports/profit-loss',
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      badge: 'Income Statement',
      color: 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-600',
      gradient: 'from-emerald-600/10 to-teal-700/5',
    },
    {
      id: 'daily-collection',
      title: 'Daily Collection Report',
      category: 'Financial',
      description: 'Monitor daily cash and bank fee collections, transaction volume, and receipt logs.',
      path: '/reports/daily-collection',
      icon: <CalendarDays className="w-6 h-6 text-sky-500" />,
      badge: 'Cash & Bank Log',
      color: 'border-sky-200 dark:border-sky-900/60 hover:border-sky-500',
      gradient: 'from-sky-500/10 to-blue-600/5',
    },
    {
      id: 'balance-sheet',
      title: 'Balance Sheet Statement',
      category: 'Financial',
      description: 'Financial Position Statement enforcing Assets = Liabilities + Equity accounting equation.',
      path: '/reports/balance-sheet',
      icon: <Scale className="w-6 h-6 text-indigo-600" />,
      badge: 'Financial Audit',
      color: 'border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-600',
      gradient: 'from-indigo-600/10 to-blue-700/5',
    },
    {
      id: 'trial-balance',
      title: 'Trial Balance Statement',
      category: 'Financial',
      description: 'Double-entry ledger balances audit verifying Total Debits equal Total Credits.',
      path: '/reports/trial-balance',
      icon: <BookOpen className="w-6 h-6 text-cyan-600" />,
      badge: 'Ledger Audit',
      color: 'border-cyan-200 dark:border-cyan-900/60 hover:border-cyan-600',
      gradient: 'from-cyan-600/10 to-teal-700/5',
    },
    {
      id: 'report-cards',
      title: 'Academic Report Cards & Transcripts',
      category: 'Academic',
      description: 'Compile cumulative class results, process grade thresholds, and print transcripts.',
      path: '/reports/report-cards',
      icon: <Users className="w-6 h-6 text-violet-600" />,
      badge: 'Transcripts & GPA',
      color: 'border-violet-200 dark:border-violet-900/60 hover:border-violet-600',
      gradient: 'from-violet-600/10 to-purple-700/5',
    },
    {
      id: 'student-certificates',
      title: 'Student Certificates (TC / Bonafide / Conduct)',
      category: 'Certificates & Student',
      description: 'Generate Transfer Certificates (TC), Bonafide Certificates, and Character Certificates.',
      path: '/reports/student-certificates',
      icon: <ShieldCheck className="w-6 h-6 text-amber-500" />,
      badge: 'Certificates Desk',
      color: 'border-amber-200 dark:border-amber-900/60 hover:border-amber-500',
      gradient: 'from-amber-500/10 to-orange-600/5',
    }
  ];

  const filteredReports = useMemo(() => {
    return reportsList.filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            report.badge.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || report.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <>
      <PageMeta title="Master Reports & Analytics Hub" description="Centralized School Reports Desk" />

      <div className="w-full space-y-8 animate-in fade-in duration-300 max-w-[1600px] mx-auto pb-12">
        {/* BREADCRUMB */}
        <Breadcrumb items={[{ label: 'Management' }, { label: 'Reports & Analytics Hub' }]} />

        {/* HERO BANNER WITH GRADIENT BLOBS */}
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#0A0F24] via-[#111836] to-[#0A0F24] p-8 md:p-10 shadow-2xl border border-gray-800/80">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-brand-500/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-[20%] right-[10%] w-[35%] h-[90%] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 text-brand-300 text-xs font-bold mb-4 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Screen-by-Screen Navigation Gateway
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Master Reports & Analytics Hub 📊
              </h1>
              <p className="text-gray-300 text-sm md:text-base font-medium mt-2 leading-relaxed">
                Centralized hub for all 13 school management reports. Instantly generate printable fee vouchers, academic broadsheets, profit & loss audit statements, attendance heatmaps, and official student certificates.
              </p>
            </div>

            {/* QUICK SEARCH INPUT IN HERO */}
            <div className="w-full md:w-80">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search 13 reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>

        {/* KPI STAT CARDS */}
        <StatCards
          stats={[
            { title: 'Total Available Reports', value: '13 Reports', icon: <FileText className="w-5 h-5" />, theme: 'brand' },
            { title: 'Printable Vouchers & Slips', value: '3-Part A4', icon: <Receipt className="w-5 h-5" />, theme: 'success' },
            { title: 'Financial Audit Statements', value: 'Double Entry', icon: <Scale className="w-5 h-5" />, theme: 'indigo' },
            { title: 'Academic Transcripts & SLC', value: 'PDF Printable', icon: <GraduationCap className="w-5 h-5" />, theme: 'warning' },
          ]}
        />

        {/* CATEGORY FILTER TABS */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-4">
          {(['All', 'Academic', 'Financial', 'Certificates & Student'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25 scale-[1.02]'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              {cat === 'All' ? 'All Reports (13)' : cat}
            </button>
          ))}
        </div>

        {/* REPORTS GRID */}
        {filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
            <Search className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-base font-bold text-gray-700 dark:text-gray-300">No matching reports found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search query or filter category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((rep, idx) => (
              <motion.div
                key={rep.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
              >
                <Link
                  to={rep.path}
                  className={`relative p-6 rounded-3xl bg-white dark:bg-gray-900 border ${rep.color} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full group overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${rep.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800/80 flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-sm group-hover:scale-110 transition-transform duration-300">
                        {rep.icon}
                      </div>
                      <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/40 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {rep.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors flex items-center justify-between">
                        {rep.title}
                        <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-brand-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-2">
                        {rep.description}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400">
                    <span>Open Screen Component</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
