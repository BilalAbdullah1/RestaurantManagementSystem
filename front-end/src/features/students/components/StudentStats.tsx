import React from 'react';
import { Users, UserCheck, UserMinus, UserCircle } from 'lucide-react';
import StatCards, { StatCardData } from '../../../components/ui/UIDesigns/StatCards';

interface StudentStatsProps {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  boysCount: number;
  girlsCount: number;
  loading?: boolean;
}

export default function StudentStats({
  totalStudents,
  activeStudents,
  inactiveStudents,
  boysCount,
  girlsCount,
  loading = false,
}: StudentStatsProps) {
  const stats: StatCardData[] = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: <Users className="w-6 h-6 text-brand-500" />,
      theme: 'brand',
    },
    {
      title: 'Active Enrolled',
      value: activeStudents,
      icon: <UserCheck className="w-6 h-6 text-success-500" />,
      theme: 'success',
    },
    {
      title: 'Inactive / Alumni',
      value: inactiveStudents,
      icon: <UserMinus className="w-6 h-6 text-error-500" />,
      theme: 'error',
    },
    {
      title: 'Boys / Girls',
      value: `${boysCount} / ${girlsCount}`,
      icon: <UserCircle className="w-6 h-6 text-indigo-500" />,
      theme: 'indigo',
    },
  ];

  return <StatCards stats={stats} loading={loading} count={4} />;
}
