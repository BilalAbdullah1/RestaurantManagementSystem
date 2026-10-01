import React, { useEffect, useState } from 'react';
import { User, Activity, Clock, CheckCircle, Calendar, MessageSquare, FileText, Briefcase, ChevronRight, ShieldCheck, HeartHandshake, HelpCircle } from 'lucide-react';
import { Link } from 'react-router';
import api from '../../utils/axiosConfig';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import Badge from '../../components/ui/badge/Badge';
import Button from '../../components/ui/button/Button';
import { getAvatarGradient, getInitials } from '../../utils/avatarUtils';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function StaffDashboard() {
  const [loading, setLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const userId = localStorage.getItem('userId') || '';
  const tenantId = localStorage.getItem('tenantId') || '';
  const userRole = localStorage.getItem('roleName') || 'Staff';

  useEffect(() => {
    fetchDashboardData();
  }, [userId, tenantId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (userId) {
        const userRes = await api.get(`/users/${userId}`).catch(() => ({ data: null }));
        if (userRes.data) {
          setUserInfo(userRes.data);
        }
      }

      if (tenantId) {
        const noticeRes = await api.get(`/notices/tenant/${tenantId}`).catch(() => ({ data: [] }));
        setAnnouncements(Array.isArray(noticeRes.data) ? noticeRes.data.slice(0, 5) : []);
      }
    } catch (error) {
      console.error('Error fetching staff dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const displayName = userInfo ? `${userInfo.first_name} ${userInfo.last_name}` : 'Staff Member';
  const email = userInfo?.email || 'staff@restaurant.com';
  const initials = getInitials(userInfo?.first_name || 'Staff', userInfo?.last_name || 'Member');
  const avatarGradient = getAvatarGradient(userId || '1');

  // KPI Stats
  const stats: StatCardData[] = [
    { title: 'Attendance This Month', value: '96%', icon: <Activity className="w-5 h-5 text-emerald-500" />, theme: 'success' },
    { title: 'Available Leave Days', value: '14 Days', icon: <Clock className="w-5 h-5 text-amber-500" />, theme: 'warning' },
    { title: 'Payroll Salary Slip', value: 'Processed 🟢', icon: <CheckCircle className="w-5 h-5 text-brand-500" />, theme: 'indigo' },
    { title: 'Role Access Level', value: userRole, icon: <Briefcase className="w-5 h-5 text-indigo-500" />, theme: 'brand' },
  ];

  // Quick Action Shortcuts
  const quickLinks = [
    { label: 'Apply Staff Leave', path: '/StaffLeaveApplication', icon: <Clock className="w-5 h-5 text-amber-500" />, desc: 'Submit leave request for approval' },
    { label: 'Staff Attendance', path: '/StaffAttendance', icon: <Activity className="w-5 h-5 text-emerald-500" />, desc: 'Check daily attendance register' },
    { label: 'Internal Staff Chat', path: '/StaffChat', icon: <MessageSquare className="w-5 h-5 text-brand-500" />, desc: 'Connect with staff & colleagues' },
    { label: 'Notice Board', path: '/Noticeboard', icon: <FileText className="w-5 h-5 text-purple-500" />, desc: 'View school notices & updates' },
    { label: 'Restaurant Calendar', path: '/EventCalendar', icon: <Calendar className="w-5 h-5 text-blue-500" />, desc: 'Upcoming school events & holidays' },
    { label: 'Helpdesk & Support', path: '/HelpdeskTickets', icon: <HelpCircle className="w-5 h-5 text-rose-500" />, desc: 'Raise support ticket or inquiry' },
  ];

  return (
    <div className="w-full space-y-6">
      <Breadcrumb items={[{ label: 'Staff Portal' }, { label: 'Executive Staff Dashboard' }]} />

      {/* Profile Header Banner */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-md flex-shrink-0"
            style={{ background: avatarGradient }}
          >
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {displayName}! 👋</h1>
              <Badge variant="light" color="primary">{userRole}</Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <span>📧 {email}</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">Active Account</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/StaffLeaveApplication">
            <Button variant="primary" size="sm" className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> Apply Leave
            </Button>
          </Link>
          <Link to="/StaffChat">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-500" /> Staff Chat
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <StatCards stats={stats} />

      {/* Quick Action Shortcuts Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-brand-600" /> Quick Workspace Shortcuts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, idx) => (
            <Link 
              key={idx} 
              to={link.path}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:border-brand-300 dark:hover:border-brand-800 group flex items-start justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/20 transition-colors">
                  {link.icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {link.label}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {link.desc}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors mt-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* Announcements & Recent Notices Feed */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" /> Staff Circulars & Announcements
          </h3>
          <Link to="/Noticeboard" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            View All Circulars →
          </Link>
        </div>

        {announcements.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            No active announcements today.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {announcements.map((notice) => (
              <div key={notice.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{notice.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{notice.content}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap font-mono">
                  {new Date(notice.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
