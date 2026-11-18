"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNext, siteUrl } from "@/lib/site";

export type FormState = { error?: string; done?: string } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(form: FormData, name: string) {
  const v = form.get(name);
  return typeof v === "string" ? v.trim() : "";
}

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  const agreed = form.get("agree") === "on";
  const track = form.get("track");

  if (!EMAIL_RE.test(email)) return { error: "כתובת המייל לא תקינה." };
  if (password.length < 8) return { error: "הסיסמה צריכה להיות באורך 8 תווים לפחות." };
  if (track !== "highschool" && track !== "mechina") return { error: "בחר אם אתה תלמיד תיכון או תלמיד מכינה." };
  if (!agreed) return { error: "כדי להירשם צריך לסמן שקראת את האזהרה על מגבלת המכשירים ואתה מסכים לה." };

  const supabase = await createClient();
  if (!supabase) return { error: "האתר עדיין לא חובר למסד הנתונים." };

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await siteUrl()}/auth/confirm?next=/account`,
      data: { terms_accepted: true, track },
    },
  });
  if (error) {
    if (/already registered/i.test(error.message)) return { error: "כבר קיים חשבון עם המייל הזה. נסה להתחבר." };
    return { error: "ההרשמה נכשלה. נסה שוב בעוד כמה דקות." };
  }
  return { done: `שלחנו מייל אימות אל ${email}. לחץ על הקישור שבמייל כדי להפעיל את החשבון.` };
}

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = safeNext(form.get("next"));

  const supabase = await createClient();
  if (!supabase) return { error: "האתר עדיין לא חובר למסד הנתונים." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (/not confirmed/i.test(error.message)) return { error: "עוד לא אימתת את המייל. חפש את מייל האימות בתיבה (וגם בספאם)." };
    return { error: "המייל או הסיסמה לא נכונים." };
  }
  // Register this device before anything else.
  redirect(`/device?next=${encodeURIComponent(next)}`);
}

export async function requestPasswordReset(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "כתובת המייל לא תקינה." };
  const supabase = await createClient();
  if (!supabase) return { error: "האתר עדיין לא חובר למסד הנתונים." };
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteUrl()}/auth/confirm?next=/reset-password`,
  });
  // Same answer whether or not the address exists.
  return { done: "אם יש חשבון עם המייל הזה, שלחנו אליו קישור לבחירת סיסמה חדשה." };
}

export async function updatePassword(_: FormState, form: FormData): Promise<FormState> {
  const password = String(form.get("password") ?? "");
  if (password.length < 8) return { error: "הסיסמה צריכה להיות באורך 8 תווים לפחות." };
  const supabase = await createClient();
  if (!supabase) return { error: "האתר עדיין לא חובר למסד הנתונים." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "לא הצלחנו לעדכן את הסיסמה. בקש קישור חדש ונסה שוב." };
  redirect("/device?next=/account");
}
