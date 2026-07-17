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
  { id: 'all', label: 'All', count: null, active: true },
  { id: 'message', label: 'Messages', count: 3, active: false },
  { id: 'session', label: 'Sessions', count: 2, active: false },
  { id: 'alert', label: 'Alerts', count: 1, active: false },
  { id: 'document', label: 'Documents', count: 1, active: false },
  { id: 'student', label: 'Students', count: 1, active: false },
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
    borderColor: 'border-transparent',
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
    borderColor: 'border-transparent',
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
    borderColor: 'border-transparent',
  },
];

/**
 * COMPONENTS
 */
const FilterButton = ({ filter, onClick }: { filter: any; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all border ${
      filter.active 
      ? 'bg-[#F9A618] border-[#F9A618] text-white' 
      : 'bg-white border-gray-100 text-slate-600 hover:border-[#F9A618]'
    }`}
  >
    {filter.id === 'all' && (
      <div className={`w-3 h-3 rounded-full border-2 ${filter.active ? 'border-white bg-white' : 'border-[#F9A618]'}`} />
    )}
    {filter.label}
    {filter.count !== null && (
      <span className={`ml-1 ${filter.active ? 'text-white/80' : 'text-slate-400'}`}>
        {filter.count}
      </span>
    )}
  </button>
);

const NotificationItem = ({ item, onDelete, onRead }: any) => (
  <div className={`relative flex items-start gap-4 p-5 mb-4 bg-white rounded-xl border-l-[3px] shadow-sm transition-all hover:shadow-md ${item.borderColor}`}>
    
    <div className={`flex items-center justify-center min-w-[44px] h-[44px] rounded-lg ${item.iconBg}`}>
      {item.icon}
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

/**
 * MAIN
 */
const NotificationPanel = () => {
  const [filters, setFilters] = useState(NOTIFICATIONS_FILTERS);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);

  const activeFilter = filters.find(f => f.active)?.id;

  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeFilter);

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

  const handleFilterClick = (id: string) => {
    setFilters(filters.map(f => ({ ...f, active: f.id === id })));
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

        {filters.map((filter) => (
          <FilterButton 
            key={filter.id} 
            filter={filter} 
            onClick={() => handleFilterClick(filter.id)} 
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