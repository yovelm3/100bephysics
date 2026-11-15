"use client";

import { useActionState } from "react";
import { requestPasswordReset, type FormState } from "@/app/auth/actions";
import { Button, Field, Notice } from "@/components/ui";

export function ForgotForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(requestPasswordReset, undefined);
  if (state?.done) return <Notice tone="ok">{state.done}</Notice>;
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="מייל" name="email" type="email" autoComplete="email" required dir="ltr" />
      {state?.error && <Notice tone="warn">{state.error}</Notice>}
      <Button type="submit" disabled={pending}>שליחת קישור</Button>
    </form>
  );
}
