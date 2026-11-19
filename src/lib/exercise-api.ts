import "server-only";
import { getAccess } from "@/lib/access";

/** Common guard for exercise API routes: a logged-in user on an allowed device, not locked. */
export async function apiUser() {
  const access = await getAccess();
  if (access.state !== "ok") return null;
  return access;
}

export function bad(status: number, error: string) {
  return Response.json({ error }, { status, headers: { "Cache-Control": "private, no-store" } });
}

export const PART_ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
