import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client with the secret key. Bypasses RLS, so use it only in trusted server code
 * (cron jobs, payment webhooks). Never import it into anything that runs in the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return null;
  return createSupabaseClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}
