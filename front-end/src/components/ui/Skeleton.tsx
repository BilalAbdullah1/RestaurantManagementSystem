import React from "react";
import { twMerge } from "tailwind-merge";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      style={style}
      className={twMerge(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-800",
        className
      )}
    />
  );
}

export function FormFieldSkeleton() {
  return (
    <div className="space-y-1.5 animate-pulse">
      <div className="h-3.5 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="h-11 w-full bg-gray-100 dark:bg-gray-800/70 rounded-xl" />
    </div>
  );
}

export function DrawerSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-800" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-3.5 w-24 bg-gray-100 dark:bg-gray-800/60 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        <FormFieldSkeleton />
      </div>
    </div>
  );
}

export default Skeleton;
