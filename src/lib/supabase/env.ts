/**
 * Supabase settings. Accepts our names and the names created by the Vercel ↔ Supabase integration.
 * Returns null until the owner fills them in (Vercel / .env.local).
 */
function first(...names: string[]) {
  for (const n of names) {
    const v = process.env[n];
    if (v && v.trim()) return v.trim();
  }
  return undefined;
}

export function supabaseUrl() {
  return first("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
}

export function supabasePublishableKey() {
  return first(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_ANON_KEY",
  );
}

export function supabaseSecretKey() {
  return first("SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY");
}

export function supabaseEnv() {
  const url = supabaseUrl();
  const key = supabasePublishableKey();
  if (!url || !key) return null;
  return { url, key };
}

/** Names (never values) of required settings that are missing, for the setup page. */
export function missingSupabaseSettings() {
  const missing: string[] = [];
  if (!supabaseUrl()) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabasePublishableKey()) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  if (!supabaseSecretKey()) missing.push("SUPABASE_SECRET_KEY");
  return missing;
}
