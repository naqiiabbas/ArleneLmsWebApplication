// Shared auth routing config (importable from client & server).
import type { Database } from "@/lib/database.types"

export type UserRole = Database["public"]["Enums"]["user_role"]
export type Portal = "admin" | "mentor" | "sponsor" | "student"

// Which DB roles may sign in through each portal.
export const PORTAL_ROLES: Record<Portal, UserRole[]> = {
  admin: ["super_admin", "admin", "manager"],
  mentor: ["mentor"],
  sponsor: ["sponsor"],
  student: ["student"],
}

// Landing route for each portal / role.
export const PORTAL_HOME: Record<Portal, string> = {
  admin: "/adminpanel",
  mentor: "/mentorshippanel",
  sponsor: "/sponsorshippanel",
  student: "/studentpanel",
}

export const LOGIN_ROUTE: Record<Portal, string> = {
  admin: "/adminpanel/loginform",
  mentor: "/mentorshippanel/loginform",
  sponsor: "/sponsorshippanel/loginform",
  student: "/studentpanel/loginform",
}

export const ROLE_HOME: Record<UserRole, string> = {
  super_admin: "/adminpanel",
  admin: "/adminpanel",
  manager: "/adminpanel",
  mentor: "/mentorshippanel",
  student: "/studentpanel",
  sponsor: "/sponsorshippanel",
  parent: "/studentpanel",
}

export function homeForRole(role: UserRole | null | undefined): string {
  return (role && ROLE_HOME[role]) || "/"
}
