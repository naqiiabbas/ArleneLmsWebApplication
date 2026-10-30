"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { Bell, Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import ProfileMenu from './ProfileMenu';
import { HeaderAvatar, HeaderName, NotificationDot, useHeaderInfo } from './HeaderProfile';

type NavbarProps = {
  isSidebarOpen?: boolean;
  onMenuClick?: () => void;
};

const Navbar = ({ isSidebarOpen = false, onMenuClick }: NavbarProps) => {
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(false);
  const router = useRouter();
  const me = useHeaderInfo();
  const sidebarOpen = onMenuClick ? isSidebarOpen : internalSidebarOpen;
  const toggleSidebar = () => {
    if (onMenuClick) {
      onMenuClick();
      return;
    }
    setInternalSidebarOpen((open) => !open);
  };
  const closeSidebar = () => setInternalSidebarOpen(false);

  // Navigation handler
  const goToNotification = () => {
    router.push("/studentpanel/notification"); // Aapka notification page path
  };

  return (
    <>
    <header className="shrink-0 fixed left-0 right-0 top-0 z-[100] bg-[#F4A11D] px-4 md:px-8 h-[96px] flex items-center justify-between text-white shadow-md lg:static">
      
      {/* Left: User Welcome */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-white/10 lg:hidden"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? <X size={24} strokeWidth={2.4} /> : <Menu size={24} strokeWidth={2.4} />}
        </button>
        <div className="flex flex-col">
        {/* Changed Hussain to Alex as requested */}
          <h2 className="text-[22px] font-bold tracking-tight leading-none md:text-[26px]">Hi, Alex</h2>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 md:gap-6">
        
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={goToNotification}
            className="relative p-2 hover:bg-white/10 rounded-full transition-all"
            aria-label="Notifications"
          >
            <Bell size={26} strokeWidth={2.2} />
            <NotificationDot info={me} />
          </button>
        </div>

        {/* User Profile Card */}
        <ProfileMenu portal="student" className="bg-white/15 p-1.5 pl-2.5 pr-3 md:pr-6 rounded-xl flex items-center gap-3.5 border border-white/20 backdrop-blur-sm shadow-sm">
          <div className="w-11 h-11 rounded-lg bg-gray-200 overflow-hidden relative border-[1.5px] border-white/30 shadow-inner">
            <HeaderAvatar info={me} />
          </div>
          <div className="hidden text-left sm:block">
            <HeaderName info={me} className="text-[15px] font-extrabold leading-none mb-1.5" />
            <p className="text-[11px] font-bold opacity-90 uppercase tracking-[0.1em]">Online</p>
          </div>
        </ProfileMenu>
      </div>
    </header>
    <div className="h-[96px] lg:hidden" />
    {sidebarOpen && !onMenuClick && (
      <button
        type="button"
        aria-label="Close sidebar"
        className="fixed inset-0 z-[150] bg-black/40 lg:hidden"
        onClick={closeSidebar}
      />
    )}
    {!onMenuClick && (
      <div className={`fixed left-0 top-0 z-[200] h-screen transition-transform duration-300 ease-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar isMobileDrawer />
      </div>
    )}
    </>
  );
};

export default Navbar;
