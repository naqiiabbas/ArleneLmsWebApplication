"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Poppins } from 'next/font/google';
import {
  Check,
  Trash2,
  MessageSquare,
  Calendar,
  AlertCircle,
  FileText,
  UserPlus,
  SlidersHorizontal
} from 'lucide-react';
import {
  listMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '@/lib/data/notifications';
import type { UINotification } from '@/lib/data/notifications.types';
import { notifyNotificationsChanged } from './HeaderProfile';

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

const VISUALS: Record<string, { Icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string }> = {
  message: { Icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
  session: { Icon: Calendar, color: 'text-green-500', bg: 'bg-green-50' },
  alert: { Icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
  document: { Icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50' },
  student: { Icon: UserPlus, color: 'text-orange-500', bg: 'bg-orange-50' },
  default: { Icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
};

/**
 * COMPONENTS
 */
const FilterButton = ({ filter, count, active, onClick }: { filter: any; count: number; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex h-[38px] shrink-0 items-center gap-[10px] whitespace-nowrap rounded-[9px] border px-[15px] text-[14px] font-medium transition-all ${
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
  const v = VISUALS[item.type] ?? VISUALS.default;
  const borderColor = item.unread ? 'border-[#F9A618]' : 'border-[#d8dde3]';
  return (
  <div className={`relative mb-[12px] flex items-start gap-[12px] rounded-[8px] border bg-white p-[14px] transition-all hover:shadow-sm sm:gap-[16px] sm:p-[17px] ${borderColor}`}>

    <div className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[8px] sm:h-[48px] sm:w-[48px] ${v.bg}`}>
      <v.Icon size={18} className={v.color} />
    </div>

    <div className="min-w-0 flex-1">
      <h3 className="break-words text-[16px] font-semibold leading-[22px] text-[#243041] sm:text-[18px] sm:leading-[26px]">{item.title}</h3>
      <p className="mt-[4px] break-words text-[14px] leading-[20px] text-[#667085]">{item.description}</p>
      <div className="mt-[6px] flex flex-wrap items-center gap-x-[9px] gap-y-[2px] text-[13px] leading-[18px] text-[#667085]">
        <span>{item.time}</span>
        {item.sender && (
          <>
            <span className="h-[4px] w-[4px] rounded-full bg-[#667085]" aria-hidden="true" />
            <span className="break-words">{item.sender}</span>
          </>
        )}
      </div>
      {item.href && (
        <Link
          href={item.href}
          onClick={() => item.unread && onRead(item.id)}
          className="mt-[8px] inline-block text-[14px] font-semibold text-[#F9A618] hover:underline"
        >
          View request →
        </Link>
      )}
    </div>

    <div className="flex shrink-0 items-center gap-[4px] sm:gap-[8px]">
      {item.unread && (
        <button
          type="button"
          onClick={() => onRead(item.id)}
          aria-label="Mark as read"
          title="Mark as read"
          className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px] text-[#00a63e] transition-colors hover:bg-[#ecfdf3]"
        >
          <Check size={17} />
        </button>
      )}
      <button
        type="button"
        onClick={() => onDelete(item.id)}
        aria-label="Delete notification"
        title="Delete"
        className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px] text-[#ff1f2d] transition-colors hover:bg-[#fff1f2]"
      >
        <Trash2 size={17} />
      </button>
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

  const refresh = async () => {
    setLoading(true);
    try {
      setNotifications(await listMyNotifications());
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeFilter);

  const getFilterCount = (id: string) => {
    if (id === 'all') return notifications.length;
    return notifications.filter((notification) => notification.type === id).length;
  };

  const handleDelete = async (id: string) => {
    const res = await deleteNotification(id);
    if (res.error) { setNotice(res.error); return; }
    notifyNotificationsChanged(); // clear the header bell dot now
    await refresh();
  };

  const handleRead = async (id: string) => {
    const res = await markNotificationRead(id);
    if (res.error) { setNotice(res.error); return; }
    notifyNotificationsChanged(); // clear the header bell dot now
    await refresh();
  };

  const markAllRead = async () => {
    const res = await markAllNotificationsRead();
    if (res.error) { setNotice(res.error); return; }
    notifyNotificationsChanged(); // clear the header bell dot now
    await refresh();
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <section className={`${poppins.variable} min-h-full bg-[#f4f4f4] px-4 pb-[28px] pt-[28px] font-sans md:px-6 lg:px-[24px]`}>
      
      <div className="mb-[16px] flex flex-wrap items-start justify-between gap-[12px]">
        <div className="min-w-0">
          <h1 className="text-[26px] font-bold leading-[34px] tracking-[-0.02em] text-[#243041] sm:text-[30px] sm:leading-[38px]">Notifications</h1>
          <p className="mt-[4px] text-[15px] leading-[20px] text-[#667085]">
            {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
          </p>
        </div>

        <button 
          onClick={markAllRead}
          className="mt-[2px] flex h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-[8px] border border-[#d8dde3] bg-transparent px-[15px] text-[14px] font-semibold text-[#243041] transition-colors hover:bg-white"
        >
          <Check size={16} />
          Mark All as Read
        </button>
      </div>

      <div className="mb-[20px] flex min-h-[64px] items-center gap-[8px] overflow-x-auto rounded-[8px] border border-[#d8dde3] bg-white px-[14px] py-[12px] sm:px-[17px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
        <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
          {notice}
        </div>
      )}

      <div className="max-w-full">
        {loading && (
          <p className="rounded-[8px] border border-[#d8dde3] bg-white px-[17px] py-[24px] text-[14px] text-[#667085]">
            Loading notifications...
          </p>
        )}
        {!loading && filteredNotifications.length === 0 && (
          <p className="rounded-[8px] border border-[#d8dde3] bg-white px-[17px] py-[24px] text-[14px] text-[#667085]">
            No notifications.
          </p>
        )}
        {!loading && filteredNotifications.map((notification) => (
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
