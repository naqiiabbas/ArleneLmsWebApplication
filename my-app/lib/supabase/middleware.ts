// Session refresh + user/role lookup used by the root middleware. Keeps the
// auth cookies fresh on every request and reports who is signed in.
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@/lib/database.types"
import type { UserRole } from "@/lib/auth/config"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: do not run code between createServerClient and getUser().
  // getUser() revalidates the token and refreshes cookies when needed.
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  let user = authUser
  let role: UserRole | null = null
  let roleLookupFailed = false
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single()

    // Deactivated mid-session: status is otherwise only checked at sign-in, so
    // without this an inactive user keeps full access for as long as their
    // refresh token lives. signOut() revokes every session for the account
    // server-side and clears the cookies on supabaseResponse (via setAll), so
    // the caller then treats this request as signed out.
    if (profile && profile.status !== "active") {
      await supabase.auth.signOut()
      user = null
    } else {
      role = profile?.role ?? null
      // A transient query failure (slow network, timeout) is not "no role".
      // Treating it as one sent the user to the login page, which then bounced
      // them to their dashboard — a random jump away from the page they clicked.
      roleLookupFailed = !profile && !!profileError && profileError.code !== "PGRST116"
    }
  }

  return { supabaseResponse, user, role, roleLookupFailed }
}
