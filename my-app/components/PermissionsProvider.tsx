"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getMyPermissions } from "@/lib/auth/permissions";

type PermissionsCtx = {
  keys: Set<string>;
  role: string | null;
  loading: boolean;
  can: (key: string) => boolean;
  isAdminTier: boolean; // super_admin | admin
};

const Ctx = createContext<PermissionsCtx>({
  keys: new Set(),
  role: null,
  loading: true,
  can: () => false,
  isAdminTier: false,
});

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Re-fetched on every navigation, not just on mount. This provider lives in
  // the /adminpanel layout, which also wraps the LOGIN page: it used to load
  // once while signed out (no permissions), then survive the client-side
  // redirect after sign-in, so the sidebar stayed empty until a manual refresh.
  // Re-fetching also drops a previous user's menu after switching accounts.
  useEffect(() => {
    let active = true;
    getMyPermissions()
      .then(({ keys, role }) => {
        if (!active) return;
        setKeys(new Set(keys));
        setRole(role);
      })
      .catch(() => {
        /* keep what we have; the server still enforces every permission */
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [pathname]);

  const can = (key: string) => keys.has(key);
  const isAdminTier = role === "super_admin" || role === "admin";

  return (
    // No role yet = the signed-out result from the login page; treat as still
    // loading so the sidebar never flashes empty between sign-in and re-fetch.
    <Ctx.Provider value={{ keys, role, loading: loading || role === null, can, isAdminTier }}>
      {children}
    </Ctx.Provider>
  );
}

export const usePermissions = () => useContext(Ctx);

/** Render children only if the current user holds `permission` (or is admin-tier). */
export function Can({
  permission,
  adminOnly,
  children,
  fallback = null,
}: {
  permission?: string;
  adminOnly?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can, isAdminTier, loading } = usePermissions();
  if (loading) return <>{fallback}</>;
  if (adminOnly) return <>{isAdminTier ? children : fallback}</>;
  if (permission) return <>{can(permission) ? children : fallback}</>;
  return <>{children}</>;
}
