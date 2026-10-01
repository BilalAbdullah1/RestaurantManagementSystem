import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import {
  Bell, BellOff, CheckCheck, Filter,
  CreditCard, BookOpen, ClipboardList, Settings, Star, AlertCircle,
  Inbox, RefreshCw
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────
interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;      // Fee, Attendance, Homework, Result, System, Exam
  isRead: boolean;
  createdAt: string;
  targetRole?: string;
  targetUserId?: string;
}

// ─── Helpers ────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  Fee:        { icon: <CreditCard className="w-4 h-4" />, color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-500/10',  label: 'Fee'        },
  Attendance: { icon: <ClipboardList className="w-4 h-4" />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/10',    label: 'Attendance' },
  Homework:   { icon: <BookOpen className="w-4 h-4" />, color: 'text-purple-600 dark:text-purple-400',  bg: 'bg-purple-100 dark:bg-purple-500/10', label: 'Homework'   },
  Result:     { icon: <Star className="w-4 h-4" />, color: 'text-amber-600 dark:text-amber-400',        bg: 'bg-amber-100 dark:bg-amber-500/10',   label: 'Result'     },
  Exam:       { icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-100 dark:bg-red-500/10',       label: 'Exam'       },
  System:     { icon: <Settings className="w-4 h-4" />, color: 'text-gray-600 dark:text-gray-400',      bg: 'bg-gray-100 dark:bg-gray-500/10',     label: 'System'     },
};

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] || TYPE_CONFIG['System'];
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Main Component ────────────────────────────────────────────
export default function NotificationsInbox() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [markingAll, setMarkingAll] = useState(false);
  const [searchParams] = useSearchParams();

  // ── Fetch ──────────────────────────────────────────────────
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get<Notification[]>('/notification/my-notifications');
      setNotifications(res.data);
    } catch {
      Swal.fire('Error', 'Could not load notifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam && FILTER_TABS.some(t => t.toLowerCase() === typeParam.toLowerCase())) {
      const match = FILTER_TABS.find(t => t.toLowerCase() === typeParam.toLowerCase());
      if (match) setActiveFilter(match);
    }
  }, [searchParams]);

  // ── Stats ──────────────────────────────────────────────────
  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);
  const todayCount  = useMemo(() => {
    const today = new Date().toDateString();
    return notifications.filter(n => new Date(n.createdAt).toDateString() === today).length;
  }, [notifications]);

  // ── Filter ─────────────────────────────────────────────────
  const FILTER_TABS = ['All', 'Fee', 'Attendance', 'Homework', 'Result', 'Exam', 'System'];

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return notifications;
    return notifications.filter(n => n.type === activeFilter);
  }, [notifications, activeFilter]);

  // ── Mark Read ──────────────────────────────────────────────
  const handleMarkRead = async (notification: Notification) => {
    if (notification.isRead) return;
    try {
      await api.put(`/notification/mark-read/${notification.id}`);
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
    } catch {
      // silent fail — not critical
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await api.put('/notification/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      Swal.fire({ icon: 'success', title: 'All Marked as Read ✓', timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire('Error', 'Could not mark all as read.', 'error');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="w-full space-y-6">

      {/* BREADCRUMB & HEADER */}
      <div>
        <Breadcrumb items={[{ label: 'Front Office', href: '#' }, { label: 'Notifications Inbox' }]} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-7 h-7 text-brand-500" />
              Notifications Inbox
              {unreadCount > 0 && (
                <span className="relative flex">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex w-3 h-3 rounded-full bg-red-500" />
                </span>
              )}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              All your system, academic, and finance notifications in one place.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchNotifications}>
              <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
            </Button>
            {unreadCount > 0 && (
              <Button variant="primary" onClick={handleMarkAllRead} disabled={markingAll}>
                <CheckCheck className="w-4 h-4 mr-1.5" />
                {markingAll ? 'Marking...' : 'Mark All Read'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <StatCards
        stats={[
          { title: 'Total Notifications', value: notifications.length, icon: <Bell className="w-5 h-5" />, theme: 'brand' },
          { title: 'Unread', value: unreadCount, icon: <BellOff className="w-5 h-5" />, theme: 'warning' },
          { title: "Today's Alerts", value: todayCount, icon: <AlertCircle className="w-5 h-5" />, theme: 'indigo' },
          { title: 'Read', value: notifications.length - unreadCount, icon: <CheckCheck className="w-5 h-5" />, theme: 'success' },
        ]}
      />

      {/* TYPE FILTER TABS */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-500 uppercase">Filter by Type</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === tab
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab === 'All' ? `All (${notifications.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            <Inbox className="w-14 h-14 text-indigo-400 mx-auto mb-3 opacity-70" />
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">All Clear!</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto mb-4">You have zero unread or pending broadcast alerts for this channel.</p>
            <Button variant="outline" size="sm" onClick={fetchNotifications} className="inline-flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4" /> Check for New Alerts
            </Button>
          </div>
        ) : (
          filtered.map((n) => {
            const config = getTypeConfig(n.type);
            return (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n)}
                className={`group flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                  n.isRead
                    ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                    : 'bg-blue-50/60 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20'
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.color} flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform`}>
                  {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-bold line-clamp-1 ${n.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                      {n.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 animate-pulse" />
                      )}
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${config.bg} ${config.color}`}>
                      {config.icon}
                      {n.type}
                    </span>
                    {n.isRead && (
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <CheckCheck className="w-3 h-3" /> Read
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
