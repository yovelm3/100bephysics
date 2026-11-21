"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/access";

/** Opens an exercise as one of the 2 free-trial exercises. */
export async function unlockTrial(form: FormData) {
  const id = String(form.get("id") ?? "");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) throw new Error("bad id");
  const { supabase } = await requireUser(`/exercise/${id}`);
  const { error } = await supabase.rpc("unlock_trial", { p_id: id });
  if (error) throw new Error(error.message);
  redirect(`/exercise/${id}`);
}

/** Owner review: publish an exercise, or return it to draft. Admin only (checked again in SQL). */
export async function setExerciseStatus(form: FormData) {
  const id = String(form.get("id") ?? "");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) throw new Error("bad id");
  const status = form.get("status");
  if (status !== "published" && status !== "draft") throw new Error("bad status");
  const { requireAdmin } = await import("@/lib/access");
  const { supabase } = await requireAdmin(`/exercise/${id}`);
  const { error } = await supabase.rpc("admin_set_exercise_status", { p_id: id, p_status: status });
  if (error) throw new Error(error.message);
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/admin/review");
  const next = String(form.get("next") ?? "");
  redirect(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(next) ? `/exercise/${next}` : `/exercise/${id}`);
}
