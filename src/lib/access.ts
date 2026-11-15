import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { DEVICE_COOKIE, describeUserAgent, isValidDeviceKey } from "@/lib/device";
import { createClient, type ServerSupabase } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  email: string;
  role: "student" | "admin";
  locked: boolean;
  locked_at: string | null;
  daily_chat_limit: number;
  created_at: string;
};

export type Access =
  | { state: "unconfigured" }
  | { state: "anon" }
  | { state: "needs-device"; userId: string }
  | { state: "locked"; userId: string; supabase: ServerSupabase }
  | {
      state: "ok";
      supabase: ServerSupabase;
      profile: Profile;
      subscriptionEndsAt: Date | null;
      hasActiveSubscription: boolean;
    };

/**
 * Who is visiting, and may they continue? Registers this device on every call,
 * so the device limit is enforced on the server for every protected page.
 */
export async function getAccess(): Promise<Access> {
  const supabase = await createClient();
  if (!supabase) return { state: "unconfigured" };

  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return { state: "anon" };

  const deviceKey = (await cookies()).get(DEVICE_COOKIE)?.value;
  if (!isValidDeviceKey(deviceKey)) return { state: "needs-device", userId };

  const ua = (await headers()).get("user-agent");
  const { browser, os } = describeUserAgent(ua);
  const { data: status, error } = await supabase.rpc("register_device", {
    p_device_key: deviceKey,
    p_browser: browser,
    p_os: os,
    p_user_agent: ua ?? "",
  });
  if (error) throw new Error(`register_device failed: ${error.message}`);
  if (status === "locked") return { state: "locked", userId, supabase };

  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("id, email, role, locked, locked_at, daily_chat_limit, created_at")
    .eq("id", userId)
    .single<Profile>();
  if (pErr || !profile) throw new Error(`profile not found: ${pErr?.message}`);

  const { data: endsAt } = await supabase.rpc("subscription_ends_at", { p_user: userId });
  const subscriptionEndsAt = endsAt ? new Date(endsAt as string) : null;

  return {
    state: "ok",
    supabase,
    profile,
    subscriptionEndsAt,
    hasActiveSubscription: profile.role === "admin" || (!!subscriptionEndsAt && subscriptionEndsAt > new Date()),
  };
}

/** For pages that need a logged-in user on an allowed device. Redirects otherwise. */
export async function requireUser(currentPath: string) {
  const access = await getAccess();
  switch (access.state) {
    case "unconfigured":
      redirect("/setup-needed");
    case "anon":
      redirect(`/login?next=${encodeURIComponent(currentPath)}`);
    case "needs-device":
      redirect(`/device?next=${encodeURIComponent(currentPath)}`);
    case "locked":
      redirect("/locked");
    case "ok":
      return access;
  }
}

/** For admin pages. Anyone else gets a 404, so the page's existence is not revealed. */
export async function requireAdmin(currentPath: string) {
  const access = await requireUser(currentPath);
  if (access.profile.role !== "admin") {
    const { notFound } = await import("next/navigation");
    notFound();
  }
  return access;
}
