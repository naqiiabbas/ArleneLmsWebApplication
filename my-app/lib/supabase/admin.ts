// Service-role Supabase client — SERVER ONLY. Bypasses Row Level Security.
// NEVER import this into a client component or expose the service-role key to
// the browser. Use it in trusted backend code (Route Handlers, Server Actions,
// cron/webhooks) that performs privileged, already-authorized operations.
import "server-only"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
