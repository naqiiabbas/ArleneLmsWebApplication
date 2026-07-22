"use client";

import React, { useEffect, useState } from 'react';
import { Poppins } from 'next/font/google';
import {
  Check,
  Trash2,
  MessageSquare,
  Calendar,
  AlertCircle,
  FileText,
  UserPlus,
  Bell,
  SlidersHorizontal
} from 'lucide-react';
import {
  listMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '@/lib/data/notifications';
import type { UINotification } from '@/lib/data/notifications.types';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

/**
 * DATA
 */
const NOTIFICATIONS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'message', label: 'Messages' },
  { id: 'session', label: 'Sessions' },
  { id: 'alert', label: 'Alerts' },
  { id: 'document', label: 'Documents' },
  { id: 'student', label: 'Students' },
];

// Icon + colour per notification type (matches the DB notification_type enum).
const TYPE_ICONS: Record<string, { icon: React.ReactNode; iconBg: string }> = {
  message: { icon: <MessageSquare size={18} className="text-blue-500" />, iconBg: 'bg-blue-50' },
  session: { icon: <Calendar size={18} className="text-green-500" />, iconBg: 'bg-green-50' },
  alert: { icon: <AlertCircle size={18} className="text-red-500" />, iconBg: 'bg-red-50' },
  document: { icon: <FileText size={18} className="text-purple-500" />, iconBg: 'bg-purple-50' },
  student: { icon: <UserPlus size={18} className="text-orange-500" />, iconBg: 'bg-orange-50' },
};

const iconFor = (type: string) => TYPE_ICONS[type] ?? { icon: <Bell size={18} className="text-[#F9A618]" />, iconBg: 'bg-[#fff4df]' };

/**
 * COMPONENTS
 */
const FilterButton = ({ id, label, count, active, onClick }: { id: string; label: string; count: number; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all border ${
      active
      ? 'bg-[#F9A618] border-[#F9A618] text-white'
      : 'bg-white border-gray-100 text-slate-600 hover:border-[#F9A618]'
    }`}
  >
    {id === 'all' && (
      <div className={`w-3 h-3 rounded-full border-2 ${active ? 'border-white bg-white' : 'border-[#F9A618]'}`} />
    )}
    {label}
    <span className={`ml-1 ${active ? 'text-white/80' : 'text-slate-400'}`}>{count}</span>
  </button>
);

const NotificationItem = ({ item, onDelete, onRead }: { item: UINotification; onDelete: (id: string) => void; onRead: (id: string) => void }) => {
  const { icon, iconBg } = iconFor(item.type);
  const borderColor = item.unread ? 'border-[#F9A618]' : 'border-transparent';
  return (
  <div className={`relative flex items-start gap-4 p-5 mb-4 bg-white rounded-xl border-l-[3px] shadow-sm transition-all hover:shadow-md ${borderColor}`}>

    <div className={`flex items-center justify-center min-w-[44px] h-[44px] rounded-lg ${iconBg}`}>
      {icon}
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="text-[15px] font-bold text-slate-800 truncate">{item.title}</h3>
        <div className="flex items-center gap-4 shrink-0">

          {item.unread && (
            <Check
              size={18}
              onClick={() => onRead(item.id)}
              className="text-green-500 cursor-pointer hover:scale-110 transition-transform"
            />
          )}

          <Trash2
            size={18}
            onClick={() => onDelete(item.id)}
            className="text-red-400 cursor-pointer hover:scale-110 transition-transform"
          />
        </div>
      </div>

      <p className="text-[14px] text-slate-500 mb-2 line-clamp-1">{item.description}</p>

      <div className="flex items-center gap-2 text-[12px] text-slate-400">
        <span>{item.time}</span>
        {item.sender && (
          <>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span>{item.sender}</span>
          </>
        )}
      </div>
    </div>
  </div>
  );
};

/**
 * MAIN
 */
const NotificationPanel = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState<UINotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    listMyNotifications()
      .then(setNotifications)
      .catch((e) => setNotice((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeFilter);

  const getFilterCount = (id: string) =>
    id === 'all' ? notifications.length : notifications.filter(n => n.type === id).length;

  const handleDelete = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const res = await deleteNotification(id);
    if (res.error) setNotice(res.error);
  };

  const handleRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    const res = await markNotificationRead(id);
    if (res.error) setNotice(res.error);
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    const res = await markAllNotificationsRead();
    if (res.error) setNotice(res.error);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <section className={`${poppins.variable} font-sans bg-[#F8FAFC] p-8 min-h-screen`}>
      
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-[28px] font-bold text-slate-800">Notifications</h1>
          <p className="text-[14px] text-slate-500 mt-1">{unreadCount} unread notifications</p>
        </div>

        <button 
          onClick={markAllRead}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-600 hover:bg-white transition-colors bg-transparent"
        >
          <Check size={16} />
          Mark All as Read
        </button>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 mb-8 shadow-sm overflow-x-auto no-scrollbar">
        <div className="px-2 text-slate-400 border-r border-slate-100 mr-1 shrink-0">
          <SlidersHorizontal size={18} />
        </div>

        {NOTIFICATIONS_FILTERS.map((filter) => (
          <FilterButton
            key={filter.id}
            id={filter.id}
            label={filter.label}
            count={getFilterCount(filter.id)}
            active={activeFilter === filter.id}
            onClick={() => setActiveFilter(filter.id)}
          />
        ))}
      </div>

      {notice && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">{notice}</div>
      )}

      <div className="max-w-full">
        {loading && (
          <p className="py-6 text-center text-[14px] text-slate-500">Loading notifications…</p>
        )}
        {!loading && filteredNotifications.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center text-[14px] text-slate-500">
            No notifications{activeFilter === 'all' ? '' : ' in this category'}.
          </p>
        )}
        {filteredNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            item={notification}
            onDelete={handleDelete}
            onRead={handleRead}
          />
        ))}
      </div>
    </section>
  );
};

export default NotificationPanel;