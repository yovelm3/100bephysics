"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/access";

function uuid(v: FormDataEntryValue | null) {
  const s = String(v ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(s)) throw new Error("bad id");
  return s;
}

export async function grantSubscription(form: FormData) {
  const { supabase } = await requireAdmin("/admin");
  const { error } = await supabase.rpc("admin_grant_subscription", { p_user: uuid(form.get("user")) });
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function unlockUser(form: FormData) {
  const { supabase } = await requireAdmin("/admin");
  const { error } = await supabase.rpc("admin_unlock_user", {
    p_user: uuid(form.get("user")),
    p_clear_devices: form.get("clear") === "on",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function removeDevice(form: FormData) {
  const { supabase } = await requireAdmin("/admin");
  const { error } = await supabase.rpc("admin_remove_device", { p_device: uuid(form.get("device")) });
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
