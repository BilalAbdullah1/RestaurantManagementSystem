import React from 'react';

export type StatColorTheme = 'brand' | 'success' | 'error' | 'indigo' | 'warning' | 'sky' | 'purple';
export interface StatCardData {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  theme: StatColorTheme;
}

interface StatCardsProps {
  stats: StatCardData[];
  loading?: boolean;
  count?: number;
}

const themeClasses: Record<StatColorTheme, { bg: string, border: string }> = {
  brand: { bg: 'bg-brand-50 dark:bg-brand-500/10', border: 'border-brand-100 dark:border-brand-500/20' },
  success: { bg: 'bg-success-50 dark:bg-success-500/10', border: 'border-success-100 dark:border-success-500/20' },
  error: { bg: 'bg-error-50 dark:bg-error-500/10', border: 'border-error-100 dark:border-error-500/20' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-100 dark:border-indigo-500/20' },
  warning: { bg: 'bg-warning-50 dark:bg-warning-500/10', border: 'border-warning-100 dark:border-warning-500/20' },
  sky: { bg: 'bg-sky-50 dark:bg-sky-500/10', border: 'border-sky-100 dark:border-sky-500/20' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-100 dark:border-purple-500/20' }
};

export default function StatCards({ stats, loading = false, count }: StatCardsProps) {
  const cardCount = count || (stats && stats.length > 0 ? stats.length : 4);
  
  // FIX: Provide explicit class names so Tailwind doesn't purge them during build.
  const gridColsClass = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
  }[Math.min(cardCount, 4)] || 'lg:grid-cols-4';

  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridColsClass} gap-4 mb-6`}>
        {Array.from({ length: cardCount }).map((_, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm animate-pulse"
          >
            <div className="flex items-center justify-between z-10 relative">
              <div className="space-y-2 flex-1">
                <div className="h-3.5 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-7 w-20 bg-gray-300 dark:bg-gray-700 rounded-lg mt-1" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0 ml-3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridColsClass} gap-4 mb-6`}>
      {stats.map((stat, idx) => {
        const style = themeClasses[stat.theme] || themeClasses.brand;
        
        return (
          <div 
            key={idx} 
            className={`relative overflow-hidden p-5 rounded-2xl border ${style.border} ${style.bg} backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between z-10 relative">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h4>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
            {/* Decorative background circle */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/40 dark:bg-white/5 blur-xl pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
}