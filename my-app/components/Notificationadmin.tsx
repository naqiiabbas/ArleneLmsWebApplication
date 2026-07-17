"use client";

import React, { useState } from 'react';
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

const NOTIFICATIONS_DATA = [
  {
    id: 1,
    type: 'message',
    title: 'New message from Marcus Johnson',
    description: 'Hi Mr. Mentor, I have a question about the math homework...',
    time: '5 minutes ago',
    sender: 'Marcus Johnson',
    unread: true,
    icon: <MessageSquare size={18} className="text-blue-500" />,
    iconBg: 'bg-blue-50',
    borderColor: 'border-[#F9A618]',
  },
  {
    id: 2,
    type: 'session',
    title: 'Upcoming session reminder',
    description: 'Math Tutoring session with David Williams starts in 1 hour',
    time: '1 hour ago',
    sender: 'David Williams',
    unread: true,
    icon: <Calendar size={18} className="text-green-500" />,
    iconBg: 'bg-green-50',
    borderColor: 'border-[#F9A618]',
  },
  {
    id: 3,
    type: 'alert',
    title: 'Attendance alert',
    description: 'James Brown has missed 3 consecutive sessions',
    time: '2 hours ago',
    sender: 'James Brown',
    unread: true,
    icon: <AlertCircle size={18} className="text-red-500" />,
    iconBg: 'bg-red-50',
    borderColor: 'border-[#F9A618]',
  },
  {
    id: 4,
    type: 'document',
    title: 'Document uploaded',
    description: 'Progress Report - Q1.pdf has been uploaded',
    time: '3 hours ago',
    unread: false,
    icon: <FileText size={18} className="text-purple-500" />,
    iconBg: 'bg-purple-50',
    borderColor: 'border-[#d8dde3]',
  },
  {
    id: 5,
    type: 'student',
    title: 'New student assigned',
    description: 'Christopher Garcia has been assigned to your mentorship group',
    time: '5 hours ago',
    sender: 'Christopher Garcia',
    unread: false,
    icon: <UserPlus size={18} className="text-orange-500" />,
    iconBg: 'bg-orange-50',
    borderColor: 'border-[#d8dde3]',
  },
  {
    id: 6,
    type: 'message',
    title: 'New message from Michael Davis',
    description: 'Thank you for the career advice session yesterday!',
    time: '1 day ago',
    sender: 'Michael Davis',
    unread: false,
    icon: <MessageSquare size={18} className="text-blue-500" />,
    iconBg: 'bg-blue-50',
    borderColor: 'border-[#d8dde3]',
  },
];

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

const NotificationItem = ({ item, onDelete, onRead }: any) => (
  <div className={`relative mb-[12px] flex min-h-[105px] items-start gap-[16px] rounded-[8px] border bg-white px-[17px] py-[17px] transition-all hover:shadow-sm ${item.borderColor}`}>
    
    <div className={`flex h-[48px] min-w-[48px] items-center justify-center rounded-[8px] ${item.iconBg}`}>
      {item.icon}
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

/**
 * MAIN
 */
const NotificationPanel = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);

  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeFilter);

  const getFilterCount = (id: string) => {
    if (id === 'all') return notifications.length;
    return notifications.filter((notification) => notification.type === id).length;
  };

  const handleDelete = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
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

      <div className="max-w-full">
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
