"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { Bell, Menu, Search, X } from 'lucide-react';
import Sidebaradmin from './Sidebaradmin';

type NavbarProps = {
  isSidebarOpen?: boolean;
  onMenuClick?: () => void;
};

const searchItems = [
  { label: "Dashboard", path: "/adminpanel", keywords: "overview home" },
  { label: "User Management", path: "/adminpanel/usermanagment", keywords: "users accounts roles" },
  { label: "Mentor Management", path: "/adminpanel/mentormanagment", keywords: "mentors management" },
  { label: "Student Management", path: "/adminpanel/studentmanagment", keywords: "students management" },
  { label: "Organizations", path: "/adminpanel/organization", keywords: "providers organizations programs" },
  { label: "Attendance Control", path: "/adminpanel/attencont", keywords: "attendance control present absent" },
  { label: "Notes Moderation", path: "/adminpanel/notesmod", keywords: "notes moderation reports" },
  { label: "Messaging System", path: "/adminpanel/message", keywords: "messages chat conversation" },
  { label: "Calendar Systems", path: "/adminpanel/calendar", keywords: "calendar sessions schedule" },
  { label: "Documents", path: "/adminpanel/documents", keywords: "documents files upload" },
  { label: "Resource", path: "/adminpanel/resource", keywords: "resources learning" },
  { label: "Blogs", path: "/adminpanel/blogsad", keywords: "blog posts articles" },
  { label: "Reports & Analytics", path: "/adminpanel/reports", keywords: "reports analytics charts" },
  { label: "Billing and Plans", path: "/adminpanel/billing", keywords: "billing plans payments" },
  { label: "Settings", path: "/adminpanel/settings", keywords: "settings account preferences" },
  { label: "Roles and Permissions", path: "/adminpanel/roles", keywords: "roles permissions access" },
  { label: "Activity Logs", path: "/adminpanel/activity", keywords: "activity logs audit" },
  { label: "Notifications", path: "/adminpanel/notification", keywords: "alerts notification" },
];

const Navbar = ({ isSidebarOpen = false, onMenuClick }: NavbarProps) => {
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();
  const sidebarOpen = onMenuClick ? isSidebarOpen : internalSidebarOpen;
  const trimmedSearch = searchQuery.trim().toLowerCase();
  const filteredSearchItems = trimmedSearch
    ? searchItems.filter((item) => `${item.label} ${item.keywords}`.toLowerCase().includes(trimmedSearch)).slice(0, 6)
    : [];
  const toggleSidebar = () => {
    if (onMenuClick) {
      onMenuClick();
      return;
    }
    setInternalSidebarOpen((open) => !open);
  };
  const closeSidebar = () => setInternalSidebarOpen(false);

  const goToNotification = () => {
    router.push("/adminpanel/notification");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const firstResult = filteredSearchItems[0];
    if (!firstResult) return;
    setSearchQuery("");
    setIsSearchOpen(false);
    router.push(firstResult.path);
  };

  const goToSearchResult = (path: string) => {
    setSearchQuery("");
    setIsSearchOpen(false);
    router.push(path);
  };

  return (
    <>
    <header className="fixed left-0 right-0 top-0 z-[100] bg-[#F4A11D] px-4 md:px-8 h-[104px] flex items-center justify-between text-white border-b border-white/10 lg:static">
      
      {/* Left: Search Bar - Flexible width with max limit to prevent crowding */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all hover:bg-white/10 lg:hidden"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? <X size={24} strokeWidth={2.4} /> : <Menu size={24} strokeWidth={2.4} />}
        </button>
      <form onSubmit={handleSearch} className="relative flex-1 max-w-[400px]">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80">
          <Search size={18} strokeWidth={2.5} />
        </div>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchOpen(true);
          }}
          onFocus={() => setIsSearchOpen(true)}
          onBlur={() => setTimeout(() => setIsSearchOpen(false), 120)}
          placeholder="Search students, notes, sessions..."
          className="w-full bg-white/15 border border-white/20 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder:text-white/70 outline-none focus:bg-white/25 transition-all text-sm"
        />
        {isSearchOpen && trimmedSearch && (
          <div className="absolute left-0 right-0 top-[48px] z-[120] overflow-hidden rounded-xl border border-[#e0e0e0] bg-white py-2 text-[#1f1f1f] shadow-[0_10px_30px_rgba(0,0,0,0.14)]">
            {filteredSearchItems.length > 0 ? (
              filteredSearchItems.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => goToSearchResult(item.path)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-[14px] font-medium transition hover:bg-[#fff1d9] hover:text-[#ff9f0f]"
                >
                  <Search size={16} strokeWidth={2.2} />
                  {item.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-[14px] font-medium text-[#777777]">No section found</div>
            )}
          </div>
        )}
      </form>
      </div>

      {/* Right: Actions (Notification + Profile) */}
      <div className="flex items-center gap-4 ml-4 shrink-0">
        
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={goToNotification}
            className="relative p-2 hover:bg-white/10 rounded-full transition-all"
            aria-label="Notifications"
          >
            <Bell size={24} strokeWidth={2} />
            <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#F4A11D]" />
          </button>
        </div>

        {/* User Profile Card - Styled exactly like the screenshot */}
        <div className="bg-transparent p-1 px-3 rounded-xl flex items-center gap-3 border border-white/40 shadow-sm min-w-[140px]">
          <div className="w-9 h-9 rounded-lg overflow-hidden relative border border-white/30 shrink-0">
            <Image 
              src="/images/avatar1.png" 
              alt="Profile" 
              fill 
              className="object-cover" 
            />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[13px] font-bold leading-none mb-1">Esther Howard</p>
            <p className="text-[9px] font-medium opacity-90 uppercase tracking-wider">Online</p>
          </div>
        </div>
      </div>

    </header>
    <div className="h-[104px] lg:hidden" />
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
        <Sidebaradmin isMobileDrawer />
      </div>
    )}
    </>
  );
};

export default Navbar;
