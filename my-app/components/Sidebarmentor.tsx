"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { signOut } from '@/lib/auth/actions';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  sidebarItems?: {
    id: string;
    label: string;
    icon: string;
  }[];
  isMobileDrawer?: boolean;
}

const defaultItems = [
    { id: '/mentorshippanel', label: 'Dashboard', icon: 'dashboard' },
    { id: '/mentorshippanel/asignstudent', label: 'Assigned Students', icon: 'assigned' },
    { id: '/mentorshippanel/attendancemen', label: 'Attendance', icon: 'attendance' },
    { id: '/mentorshippanel/notesandreport', label: 'Notes & Reports', icon: 'notes' },
    { id: '/mentorshippanel/message', label: 'Messages', icon: 'messages' },
    { id: '/mentorshippanel/calendarmen', label: 'Calendar', icon: 'calendar' },
    { id: '/mentorshippanel/documentmen', label: 'Documents', icon: 'documents' },
    { id: '/mentorshippanel/resourcemen', label: 'Resource', icon: 'resource' },
    { id: '/mentorshippanel/blogsmen', label: 'Blogs', icon: 'blogs' },
    { id: '/mentorshippanel/settings', label: 'Settings', icon: 'settings' },
];

const iconAssets: Record<string, string> = {
  dashboard: "/images/mentor-sidebar-dashboard.svg",
  assigned: "/images/mentor-sidebar-assigned.svg",
  attendance: "/images/mentor-sidebar-attendance.svg",
  notes: "/images/mentor-sidebar-notes.svg",
  messages: "/images/mentor-sidebar-messages.svg",
  calendar: "/images/mentor-sidebar-calendar.svg",
  documents: "/images/mentor-sidebar-documents.svg",
  resource: "/images/mentor-sidebar-resource.svg",
  blogs: "/images/mentor-sidebar-blogs.svg",
  settings: "/images/mentor-sidebar-settings.svg",
};

const MaskIcon = ({ src }: { src: string }) => (
  <span
    aria-hidden="true"
    className="block h-[22px] w-[22px] bg-current"
    style={{
      WebkitMaskImage: `url(${src})`,
      maskImage: `url(${src})`,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskSize: "contain",
      maskSize: "contain",
    }}
  />
);

const SidebarItem = ({ item }: { item: any }) => {
  const pathname = usePathname();
  const isActive = pathname === item.id;
  const iconSrc = iconAssets[item.icon];

  return (
    <Link href={item.id}>
      <div className={`flex h-[56px] items-center gap-[18px] border-b border-[#d6d6d6] border-r-[3px] px-[24px] cursor-pointer transition-all ${
        isActive ? 'border-r-[#ffa313] bg-[#fff1d9] text-[#ff9f0f]' : 'border-r-transparent bg-white text-[#666666] hover:bg-[#fff8ef] hover:text-[#ff9f0f]'
      }`}>
        <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center leading-none">
          {iconSrc ? <MaskIcon src={iconSrc} /> : null}
        </span>
        <span className="text-[16px] font-medium leading-none">{item.label}</span>
      </div>
    </Link>
  );
};

const Sidebar = ({ sidebarItems = defaultItems, isMobileDrawer = false }: SidebarProps) => {

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const logoutButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!showLogoutModal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      logoutButtonRef.current?.focus();
    };
  }, [showLogoutModal]);

  const handleLogout = async () => {
    await signOut("mentor");
  };

  return (
    <>
      <aside className={`${isMobileDrawer ? 'flex' : 'hidden lg:flex'} sticky top-0 h-screen w-[260px] shrink-0 flex-col overflow-hidden border-r border-[#d6d6d6] bg-white`}>

        <div className="bg-[#ffa313] px-[42px] py-0 flex items-center justify-center h-[104px] border-b border-[#d6d6d6]">
          <div className="relative h-[88px] w-[132px]">
            <Image src="/images/mentor-sidebar-logo.svg" alt="Logo" fill className="object-contain" />
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto py-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {sidebarItems.map(item => (
            <SidebarItem key={item.id} item={item} />
          ))}
        </nav>

        <div className="mt-auto shrink-0 bg-white pt-[22px]">
          <button 
            ref={logoutButtonRef}
            onClick={() => setShowLogoutModal(true)}
            className="group flex h-[56px] w-full items-center justify-center gap-[14px] border-y border-[#d6d6d6] text-[16px] font-medium text-[#666666] transition-all hover:bg-[#fff8ef] hover:text-[#ff9f0f]"
          >
            <img src="/images/logout-round.svg" alt="" aria-hidden="true" className="h-[22px] w-[22px] shrink-0 object-contain" />
            Logout
          </button>

          <div className="space-y-[5px] py-[18px] text-center">
            <p className="text-[12px] font-normal leading-none text-[#9a9a9a]">Version 1.0.0</p>
            <p className="text-[12px] font-normal leading-none text-[#9a9a9a]">(c) 2025 Mentorship</p>
          </div>
        </div>
      </aside>

      {isMounted && showLogoutModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[320px] rounded-xl bg-white p-6 text-center shadow-2xl">
            <h2 className="text-lg font-bold mb-4">Are you sure?</h2>
            <div className="flex gap-3 justify-center">
              <button onClick={handleLogout} className="px-4 py-2 bg-[#F4A11D] text-white rounded-lg hover:bg-[#e0911a] transition-colors">
                Yes
              </button>
              <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                No
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Sidebar;


