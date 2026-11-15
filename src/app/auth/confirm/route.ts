import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/site";

/**
 * Landing page for links in Supabase emails (sign-up confirmation, password reset).
 * Supports both the token_hash links (our Hebrew templates) and the default ?code= links.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  const supabase = await createClient();
  if (!supabase) return NextResponse.redirect(new URL("/setup-needed", url));

  let ok = false;
  if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  } else if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  }

  if (ok) return NextResponse.redirect(new URL(`/device?next=${encodeURIComponent(next)}`, url));

  // A ?code= link opened in another browser fails the exchange, but the email is already confirmed by then.
  if (code && next === "/account") return NextResponse.redirect(new URL("/login?confirmed=1", url));
  return NextResponse.redirect(new URL("/login?error=link", url));
}
