import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseSecretKey, supabaseUrl } from "./env";

/**
 * Supabase client with the secret key. Bypasses RLS, so use it only in trusted server code
 * (cron jobs, payment webhooks). Never import it into anything that runs in the browser.
 */
export function createAdminClient() {
  const url = supabaseUrl();
  const secret = supabaseSecretKey();
  if (!url || !secret) return null;
  return createSupabaseClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}
