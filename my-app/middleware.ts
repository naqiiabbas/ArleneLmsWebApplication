import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import {
  PORTAL_ROLES,
  LOGIN_ROUTE,
  homeForRole,
  type Portal,
} from "@/lib/auth/config"

// Panel prefixes that require authentication.
const PANELS: { prefix: string; portal: Portal }[] = [
  { prefix: "/adminpanel", portal: "admin" },
  { prefix: "/mentorshippanel", portal: "mentor" },
  { prefix: "/sponsorshippanel", portal: "sponsor" },
  { prefix: "/studentpanel", portal: "student" },
]

// Auth pages inside the panels: reachable while signed out, and signed-in
// users are bounced away from them to their home.
const AUTH_EXEMPT = [
  "/adminpanel/loginform",
  "/mentorshippanel/loginform",
  "/sponsorshippanel/loginform",
  "/studentpanel/loginform",
  "/studentpanel/studentverify",
  "/studentpanel/createpass",
  "/studentpanel/forgetpassword",
  "/studentpanel/passsuccessful",
]

// Fully public panel routes: no auth required, and NOT bounced for signed-in
// users. The iPad attendance kiosk has no login — the 4-digit code is the credential.
const PUBLIC_EXEMPT = ["/studentpanel/attendancewrk"]

function matches(path: string, base: string) {
  return path === base || path.startsWith(base + "/")
}

function redirectWithCookies(url: URL, from: NextResponse) {
  const res = NextResponse.redirect(url)
  from.cookies.getAll().forEach((c) => res.cookies.set(c))
  return res
}

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, role } = await updateSession(request)
  const path = request.nextUrl.pathname

  const isAuthRoute = AUTH_EXEMPT.some((p) => matches(path, p))
  const isPublicRoute = PUBLIC_EXEMPT.some((p) => matches(path, p))

  // Signed-in users shouldn't sit on a login page — send them to their home.
  if (isAuthRoute && user) {
    return redirectWithCookies(
      new URL(homeForRole(role), request.url),
      supabaseResponse,
    )
  }

  const panel = PANELS.find((p) => matches(path, p.prefix))
  if (!panel || isAuthRoute || isPublicRoute) return supabaseResponse

  // Protected panel route.
  if (!user) {
    return redirectWithCookies(
      new URL(LOGIN_ROUTE[panel.portal], request.url),
      supabaseResponse,
    )
  }
  if (!role || !PORTAL_ROLES[panel.portal].includes(role)) {
    // Authenticated but wrong role for this panel → their own home.
    return redirectWithCookies(
      new URL(homeForRole(role), request.url),
      supabaseResponse,
    )
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
