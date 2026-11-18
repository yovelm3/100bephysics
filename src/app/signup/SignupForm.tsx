"use client";

import { useActionState } from "react";
import { signUp, type FormState } from "@/app/auth/actions";
import { Button, Field, Notice } from "@/components/ui";

export function SignupForm({ track }: { track?: "highschool" | "mechina" }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signUp, undefined);
  if (state?.done) return <Notice tone="ok">{state.done}</Notice>;
  return (
    <form action={action} className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">אני</legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["highschool", "תלמיד תיכון"],
            ["mechina", "תלמיד מכינה"],
          ].map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-3 has-[:checked]:border-accent has-[:checked]:bg-accent-soft">
              <input type="radio" name="track" value={value} defaultChecked={track === value} required className="size-4" />
              <span className="font-semibold">{label}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted">אי אפשר לשנות את הבחירה אחרי ההרשמה בלי פנייה למנהל האתר.</p>
      </fieldset>

      <Field label="מייל" name="email" type="email" autoComplete="email" required dir="ltr" />
      <Field label="סיסמה (8 תווים לפחות)" name="password" type="password" autoComplete="new-password" minLength={8} required dir="ltr" />

      <div role="alert" className="rounded-xl border-2 border-warn bg-warn-soft p-4 text-warn">
        <p className="text-base font-bold">שים לב: אפשר להתחבר מ-5 מכשירים שונים לכל היותר.</p>
        <p className="mt-1 text-sm font-semibold">
          בכניסה ממכשיר שישי החשבון ננעל לצמיתות, וכל הגישה נחסמת. דפדפן אחר או מצב גלישה בסתר באותו מכשיר נחשבים מכשיר חדש.
        </p>
      </div>

      <label className="flex items-start gap-2 text-sm font-medium">
        <input type="checkbox" name="agree" required className="mt-1 size-4 accent-[var(--accent)]" />
        <span>קראתי את האזהרה ואני מסכים, וכן ל<a href="/terms" className="underline">תקנון</a> ול<a href="/privacy" className="underline">מדיניות הפרטיות</a>.</span>
      </label>

      {state?.error && <Notice tone="warn">{state.error}</Notice>}
      <Button type="submit" disabled={pending}>{pending ? "נרשם…" : "הרשמה"}</Button>
    </form>
  );
}
