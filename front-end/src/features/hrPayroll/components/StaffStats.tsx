import { Users, UserCheck, UserMinus, Briefcase } from 'lucide-react';
import StatCards, { StatCardItem } from '../../../components/ui/UIDesigns/StatCards';

interface StaffStatsProps {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  avgSalary?: number;
  loading?: boolean;
}

export default function StaffStats({ totalStaff, activeStaff, inactiveStaff, avgSalary = 0, loading = false }: StaffStatsProps) {
  const stats: StatCardItem[] = [
    {
      title: 'Total Faculty & Staff',
      value: totalStaff.toString(),
      icon: <Users className="w-5 h-5 text-brand-500" />,
      theme: 'brand'
    },
    {
      title: 'Active Employees',
      value: activeStaff.toString(),
      icon: <UserCheck className="w-5 h-5 text-success-500" />,
      theme: 'success'
    },
    {
      title: 'Inactive / Former',
      value: inactiveStaff.toString(),
      icon: <UserMinus className="w-5 h-5 text-error-500" />,
      theme: 'error'
    },
    {
      title: 'Average Basic Salary',
      value: `Rs. ${Math.round(avgSalary).toLocaleString()}`,
      icon: <Briefcase className="w-5 h-5 text-indigo-500" />,
      theme: 'indigo'
    }
  ];

  return <StatCards stats={stats} loading={loading} />;
}
