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
