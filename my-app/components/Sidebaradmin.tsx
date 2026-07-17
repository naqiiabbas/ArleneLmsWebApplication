"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { signOut } from '@/lib/auth/actions';
import { usePermissions } from '@/components/PermissionsProvider';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

type NavItem = {
  id: string;
  label: string;
  icon: string;
  permission?: string; // shown if the user holds this permission
  adminOnly?: boolean; // shown only to super_admin / admin (no catalog permission)
};

interface SidebarProps {
  sidebarItems?: NavItem[];
  isMobileDrawer?: boolean;
}

const defaultItems: NavItem[] = [
    { id: '/adminpanel', label: 'Dashboard', icon: 'dashboard', permission: 'dashboard.view' },
    { id: '/adminpanel/usermanagment', label: 'User Management', icon: 'userManagement', permission: 'users.view' },
    { id: '/adminpanel/mentormanagment', label: 'Mentor Management', icon: 'mentorManagement', permission: 'mentors.view' },
    { id: '/adminpanel/studentmanagment', label: 'Student Management', icon: 'studentManagement', permission: 'students.view' },
    { id: '/adminpanel/organization', label: 'Organizations/Pro..', icon: 'organizations', adminOnly: true },
    { id: '/adminpanel/attencont', label: 'Attendance Control', icon: 'attendance', permission: 'attendance.view' },
    { id: '/adminpanel/notesmod', label: 'Notes Moderation', icon: 'notes', adminOnly: true },
    { id: '/adminpanel/message', label: 'Messaging System', icon: 'messaging', adminOnly: true },
    { id: '/adminpanel/calendar', label: 'Calendar Systems', icon: 'calendar', adminOnly: true },
    { id: '/adminpanel/documents', label: 'Documents', icon: 'documents', permission: 'documents.view' },
    { id: '/adminpanel/resource', label: 'Resource', icon: 'resource', adminOnly: true },
    { id: '/adminpanel/blogsad', label: 'Blogs', icon: 'blogs', adminOnly: true },
    { id: '/adminpanel/reports', label: 'Reports & Analytics', icon: 'reports', permission: 'reports.view' },
    { id: '/adminpanel/billing', label: 'Billing and Plans', icon: 'billing', permission: 'billing.manage' },
    { id: '/adminpanel/settings', label: 'Settings', icon: 'settings', adminOnly: true },
    { id: '/adminpanel/roles', label: 'Roles and Permissions', icon: 'roles', permission: 'roles.manage' },
    { id: '/adminpanel/activity', label: 'Activity Logs', icon: 'activity', permission: 'activity.view' },
];

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

  const icons: Record<string, string> = {
    dashboard: "/images/admin-icon-2.svg",
    userManagement: "/images/admin-icon-3.svg",
    mentorManagement: "/images/admin-icon-4.svg",
    studentManagement: "/images/admin-icon-5.svg",
    organizations: "/images/admin-icon-6.svg",
    attendance: "/images/admin-icon-7.svg",
    notes: "/images/admin-icon-8.svg",
    messaging: "/images/admin-icon-9.svg",
    calendar: "/images/admin-icon-10.svg",
    documents: "/images/admin-icon-11.svg",
    resource: "/images/admin-icon-12.svg",
    blogs: "/images/admin-icon-13.svg",
    reports: "/images/admin-icon-14.svg",
    billing: "/images/admin-icon-13.svg",
    settings: "/images/admin-icon-14.svg",
    roles: "/images/admin-icon-15.svg",
    activity: "/images/admin-icon-16.svg"
  };

  return (
    <Link href={item.id}>
      <div className={`flex h-[56px] items-center gap-[18px] border-b border-[#d6d6d6] border-r-[3px] px-[24px] cursor-pointer transition-all ${
        isActive ? 'border-r-[#ffa313] bg-[#fff1d9] text-[#ff9f0f]' : 'border-r-transparent bg-white text-[#666666] hover:bg-[#fff8ef] hover:text-[#ff9f0f]'
      }`}>
        <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center leading-none">
          <MaskIcon src={icons[item.icon]} />
        </span>
        <span className="truncate text-[16px] font-medium leading-none">{item.label}</span>
      </div>
    </Link>
  );
};

const Sidebar = ({ sidebarItems = defaultItems, isMobileDrawer = false }: SidebarProps) => {

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const logoutButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { can, isAdminTier, loading } = usePermissions();

  const visibleItems = loading
    ? sidebarItems
    : sidebarItems.filter((item) => {
        if (item.permission) return can(item.permission);
        if (item.adminOnly) return isAdminTier;
        return true;
      });

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
    await signOut("admin");
  };

  return (
    <>
      <aside className={`${isMobileDrawer ? 'flex' : 'hidden lg:flex'} sticky top-0 h-screen w-[260px] shrink-0 flex-col overflow-hidden border-r border-[#d6d6d6] bg-white`}>

        <div className="flex h-[104px] items-center justify-center border-b border-[#d6d6d6] bg-[#ffa313]">
          <img src="/images/admin-sidebar-logo.svg" alt="100 Black Men of Orange County" className="h-[92px] w-auto object-contain" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <nav className="py-0">
            {visibleItems.map(item => (
              <SidebarItem key={item.id} item={item} />
            ))}
          </nav>

          <div className="bg-white pt-[210px]">
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


