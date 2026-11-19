import { type NextRequest } from "next/server";
import { apiUser, bad, PART_ID_RE } from "@/lib/exercise-api";
import { createAdminClient } from "@/lib/supabase/admin";

/** Returns the full solution of a part (only if the user may open the exercise) and records that it was opened. */
export async function POST(request: NextRequest) {
  const user = await apiUser();
  if (!user) return bad(401, "unauthenticated");
  let partId: unknown;
  try {
    partId = (await request.json())?.partId;
  } catch {
    return bad(400, "bad json");
  }
  if (typeof partId !== "string" || !PART_ID_RE.test(partId)) return bad(400, "bad part");

  const { data, error } = await user.supabase.rpc("get_solution", { p_part: partId });
  if (error || !data) return bad(403, "not allowed");

  const { data: part } = await user.supabase.from("exercise_parts").select("exercise_id").eq("id", partId).maybeSingle();
  const admin = createAdminClient();
  if (admin && part) await admin.from("attempts").insert({ user_id: user.profile.id, exercise_id: part.exercise_id, part_id: partId, kind: "solution" });

  return Response.json(data, { headers: { "Cache-Control": "private, no-store" } });
}
