import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Service-role Supabase client (server-side only). The `decks` table has RLS
 * enabled with no policies, so only the service role can touch it — which is
 * exactly what we want: all deck access flows through this app, never the
 * anon/publishable key.
 */
export function serviceClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (see .env.example)",
    );
  }
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}
