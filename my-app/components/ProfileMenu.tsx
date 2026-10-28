"use client";

import React, { useEffect, useRef, useState } from 'react';
import { signOut } from '@/lib/auth/actions';
import type { Portal } from '@/lib/auth/config';

type ProfileMenuProps = {
  portal: Portal;
  className?: string;
  children: React.ReactNode;
};

// Header profile card that opens a dropdown with a Logout option on click.
const ProfileMenu = ({ portal, className = '', children }: ProfileMenuProps) => {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut(portal);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${className} cursor-pointer transition-all hover:bg-white/20`}
      >
        {children}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[300] mt-2 min-w-[160px] overflow-hidden rounded-xl bg-white py-1.5 text-[#333333] shadow-lg ring-1 ring-black/5"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] font-medium hover:bg-[#FFF4E2] disabled:opacity-60"
          >
            <img src="/images/logout-round.svg" alt="" aria-hidden="true" className="h-[20px] w-[20px] shrink-0 object-contain" />
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
