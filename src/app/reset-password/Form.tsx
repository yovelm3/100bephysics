"use client";

import { useActionState } from "react";
import { updatePassword, type FormState } from "@/app/auth/actions";
import { Button, Field, Notice } from "@/components/ui";

export function ResetForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(updatePassword, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="סיסמה חדשה (8 תווים לפחות)" name="password" type="password" autoComplete="new-password" minLength={8} required dir="ltr" />
      {state?.error && <Notice tone="warn">{state.error}</Notice>}
      <Button type="submit" disabled={pending}>שמירת הסיסמה</Button>
    </form>
  );
}
