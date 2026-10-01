import React, { useEffect } from 'react';
import { loadingManager } from '../../utils/loadingManager';

export const PageSkeletonLoader: React.FC = () => {
  useEffect(() => {
    loadingManager.startLoading();
    return () => {
      loadingManager.stopLoading();
    };
  }, []);

  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Top Header / Breadcrumb Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="h-4 w-72 bg-gray-100 dark:bg-gray-800/60 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-10 w-36 bg-brand-200/50 dark:bg-brand-900/30 rounded-xl" />
        </div>
      </div>

      {/* KPI StatCards Skeleton (4 Cards matching standard StatCards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 shadow-sm flex items-center justify-between"
          >
            <div className="space-y-2 w-2/3">
              <div className="h-3.5 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-7 w-16 bg-gray-300 dark:bg-gray-700 rounded-lg" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0" />
          </div>
        ))}
      </div>

      {/* Main Content / Table Skeleton Box */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden p-5 space-y-4">
        {/* Table Toolbar Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="h-10 w-64 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />
            <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />
            <div className="h-10 w-32 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          </div>
        </div>

        {/* Table Header Skeleton */}
        <div className="grid grid-cols-5 gap-4 py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          {[1, 2, 3, 4, 5].map((col) => (
            <div key={col} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          ))}
        </div>

        {/* Table Rows Skeleton */}
        {[1, 2, 3, 4, 5].map((row) => (
          <div
            key={row}
            className="grid grid-cols-5 gap-4 py-4 px-4 border-b border-gray-100 dark:border-gray-800/60 items-center"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
            <div className="h-4 w-20 bg-gray-100 dark:bg-gray-800/80 rounded" />
            <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800/80 rounded" />
            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageSkeletonLoader;
