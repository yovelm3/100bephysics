import { NextResponse, type NextRequest } from "next/server";
import { DEVICE_COOKIE, DEVICE_COOKIE_MAX_AGE, describeUserAgent, resolveDeviceKey } from "@/lib/device";
import { createClient } from "@/lib/supabase/server";

/**
 * Registers the current browser as a device of the logged-in user.
 * The key comes from the httpOnly cookie, or from the localStorage backup if the cookie was cleared.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "unconfigured" }, { status: 503 });

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let backup: unknown;
  try {
    backup = (await request.json())?.backup;
  } catch {
    backup = undefined;
  }

  const { key } = resolveDeviceKey(request.cookies.get(DEVICE_COOKIE)?.value, backup);
  const ua = request.headers.get("user-agent");
  const { browser, os } = describeUserAgent(ua);

  const { data: status, error } = await supabase.rpc("register_device", {
    p_device_key: key,
    p_browser: browser,
    p_os: os,
    p_user_agent: ua ?? "",
  });
  if (error) return NextResponse.json({ error: "failed" }, { status: 500 });

  const res = NextResponse.json({ status, deviceKey: key });
  res.cookies.set(DEVICE_COOKIE, key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DEVICE_COOKIE_MAX_AGE,
  });
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}
