import { type NextRequest } from "next/server";
import { checkChoice, checkNumber, COUNTED, MESSAGES, type CheckResult } from "@/lib/answer-check";
import { apiUser, bad, PART_ID_RE } from "@/lib/exercise-api";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Checks one answer on the server. The correct answer is read with the secret key and never sent back.
 * Body: { partId, input } for numbers, { partId, choice } for multiple choice.
 */
export async function POST(request: NextRequest) {
  const user = await apiUser();
  if (!user) return bad(401, "unauthenticated");

  let body: { partId?: unknown; input?: unknown; choice?: unknown };
  try {
    body = await request.json();
  } catch {
    return bad(400, "bad json");
  }
  const partId = typeof body.partId === "string" && PART_ID_RE.test(body.partId) ? body.partId : null;
  if (!partId) return bad(400, "bad part");

  // RLS: the part is returned only if this user may open its exercise.
  const { data: part } = await user.supabase.from("exercise_parts").select("id, exercise_id, answer_type").eq("id", partId).maybeSingle();
  if (!part) return bad(403, "not allowed");
  if (part.answer_type === "open") return bad(400, "not checked automatically");

  const admin = createAdminClient();
  if (!admin) return bad(503, "server not configured");
  const { data: ans } = await admin.from("part_answers").select("correct_value, correct_choice, tolerance_pct").eq("part_id", partId).maybeSingle();
  if (!ans) return bad(500, "answer missing");

  let result: CheckResult;
  let input: string;
  if (part.answer_type === "choice") {
    const choice = Number(body.choice);
    input = String(choice);
    result = checkChoice(choice, ans.correct_choice);
  } else {
    input = typeof body.input === "string" ? body.input.slice(0, 60) : "";
    result = checkNumber(input, ans.correct_value, ans.tolerance_pct == null ? null : Number(ans.tolerance_pct));
  }

  if (COUNTED.includes(result)) {
    await admin.from("attempts").insert({ user_id: user.profile.id, exercise_id: part.exercise_id, part_id: partId, kind: "answer", input, result });
  }
  return Response.json({ result, message: MESSAGES[result] }, { headers: { "Cache-Control": "private, no-store" } });
}
