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
const FilterButton = ({ filter, count, active, onClick }: { filter: any; count: number; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex h-[38px] items-center gap-[10px] rounded-[9px] border px-[15px] text-[14px] font-medium transition-all ${
      active
      ? 'border-[#F9A618] bg-[#F9A618] text-white'
      : 'border-[#d8dde3] bg-white text-[#243041] hover:border-[#F9A618]'
    }`}
  >
    {filter.label}
    <span className={`flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-[6px] text-[12px] font-semibold ${
      active ? 'bg-white text-[#667085]' : 'bg-[#f1f3f5] text-[#667085]'
    }`}>
        {count}
      </span>
  </button>
);

const NotificationItem = ({ item, onDelete, onRead }: { item: UINotification; onDelete: (id: string) => void; onRead: (id: string) => void }) => {
  const { icon, iconBg } = iconFor(item.type);
  const borderColor = item.unread ? 'border-[#F9A618]' : 'border-[#d8dde3]';
  return (
  <div className={`relative mb-[12px] flex min-h-[105px] items-start gap-[16px] rounded-[8px] border bg-white px-[17px] py-[17px] transition-all hover:shadow-sm ${borderColor}`}>

    <div className={`flex h-[48px] min-w-[48px] items-center justify-center rounded-[8px] ${iconBg}`}>
      {icon}
    </div>

    <div className="min-w-0 flex-1 pt-[1px]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-[19px] font-semibold leading-none text-[#243041]">{item.title}</h3>
          <p className="mt-[10px] line-clamp-1 text-[14px] text-[#667085]">{item.description}</p>
          <div className="mt-[8px] flex items-center gap-[9px] text-[13px] text-[#667085]">
            <span>{item.time}</span>
            {item.sender && (
              <>
                <span className="h-[4px] w-[4px] rounded-full bg-[#667085]" />
                <span>{item.sender}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-[24px] pt-[7px]">
          
          {item.unread && (
            <Check 
              size={17} 
              onClick={() => onRead(item.id)}
              className="cursor-pointer text-[#00a63e] transition-transform hover:scale-110" 
            />
          )}

          <Trash2 
            size={17} 
            onClick={() => onDelete(item.id)}
            className="cursor-pointer text-[#ff1f2d] transition-transform hover:scale-110" 
          />
        </div>
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

  const getFilterCount = (id: string) => {
    if (id === 'all') return notifications.length;
    return notifications.filter((notification) => notification.type === id).length;
  };

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
    <section className={`${poppins.variable} min-h-full bg-[#f4f4f4] px-4 pb-[28px] pt-[28px] font-sans md:px-6 lg:px-[24px]`}>
      
      <div className="mb-[8px] flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold leading-none tracking-[-0.02em] text-[#243041]">Notifications</h1>
          <p className="mt-[8px] max-w-[120px] text-[15px] leading-[1.3] text-[#667085]">{unreadCount} unread notifications</p>
        </div>

        <button 
          onClick={markAllRead}
          className="mt-[6px] flex h-[40px] items-center gap-2 rounded-[8px] border border-[#d8dde3] bg-transparent px-[15px] text-[14px] font-semibold text-[#243041] transition-colors hover:bg-white"
        >
          <Check size={16} />
          Mark All as Read
        </button>
      </div>

      <div className="mb-[24px] flex min-h-[74px] items-center gap-[8px] overflow-x-auto rounded-[8px] border border-[#d8dde3] bg-white px-[17px] py-[12px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="mr-[2px] shrink-0 text-[#667085]">
          <SlidersHorizontal size={18} />
        </div>

        {NOTIFICATIONS_FILTERS.map((filter) => (
          <FilterButton 
            key={filter.id} 
            filter={filter} 
            count={getFilterCount(filter.id)}
            active={activeFilter === filter.id}
            onClick={() => setActiveFilter(filter.id)} 
          />
        ))}
      </div>

      {notice && (
        <div className="mb-[16px] rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
          {notice}
        </div>
      )}

      <div className="max-w-full">
        {loading && (
          <p className="py-[24px] text-center text-[14px] text-[#667085]">Loading notifications…</p>
        )}
        {!loading && filteredNotifications.length === 0 && (
          <p className="rounded-[8px] border border-dashed border-[#d8dde3] bg-white py-[48px] text-center text-[14px] text-[#667085]">
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
