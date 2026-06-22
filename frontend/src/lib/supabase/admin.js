import { createClient } from '@supabase/supabase-js'

/**
 * Admin client dengan service role key — HANYA untuk API routes server-side.
 * JANGAN pernah expose ke client/browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
