import { Target, Users, CheckCircle, TrendingUp } from 'lucide-react';

interface EnquiryStatsProps {
  totalLeads: number;
  inPipeline: number;
  converted: number;
  loading?: boolean;
}

export default function EnquiryStats({ totalLeads, inPipeline, converted, loading = false }: EnquiryStatsProps) {
  const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;

  const stats = [
    {
      title: 'Total Leads',
      value: totalLeads,
      icon: <Users className="w-6 h-6 text-brand-500" />,
      bg: 'bg-brand-50 dark:bg-brand-500/10',
      border: 'border-brand-100 dark:border-brand-500/20'
    },
    {
      title: 'Active Pipeline',
      value: inPipeline,
      icon: <Target className="w-6 h-6 text-orange-500" />,
      bg: 'bg-orange-50 dark:bg-orange-500/10',
      border: 'border-orange-100 dark:border-orange-500/20'
    },
    {
      title: 'Converted (Reg.)',
      value: converted,
      icon: <CheckCircle className="w-6 h-6 text-success-500" />,
      bg: 'bg-success-50 dark:bg-success-500/10',
      border: 'border-success-100 dark:border-success-500/20'
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: <TrendingUp className="w-6 h-6 text-indigo-500" />,
      bg: 'bg-indigo-50 dark:bg-indigo-500/10',
      border: 'border-indigo-100 dark:border-indigo-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className={`relative overflow-hidden p-5 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1`}
        >
          <div className="flex items-center justify-between z-10 relative">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700/60 rounded-lg animate-pulse my-1" />
              ) : (
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h4>
              )}
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              {stat.icon}
            </div>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/20 dark:bg-white/5 blur-xl pointer-events-none" />
        </div>
      ))}
    </div>
  );
}
