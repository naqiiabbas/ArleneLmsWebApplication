"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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

  useEffect(() => {
    let active = true;
    getMyPermissions()
      .then(({ keys, role }) => {
        if (!active) return;
        setKeys(new Set(keys));
        setRole(role);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const can = (key: string) => keys.has(key);
  const isAdminTier = role === "super_admin" || role === "admin";

  return (
    <Ctx.Provider value={{ keys, role, loading, can, isAdminTier }}>
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
