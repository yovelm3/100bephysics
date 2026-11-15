"use client";

import { useActionState } from "react";
import { signIn, type FormState } from "@/app/auth/actions";
import { Button, Field, Notice } from "@/components/ui";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <Field label="מייל" name="email" type="email" autoComplete="email" required dir="ltr" />
      <Field label="סיסמה" name="password" type="password" autoComplete="current-password" required dir="ltr" />
      {state?.error && <Notice tone="warn">{state.error}</Notice>}
      <Button type="submit" disabled={pending}>{pending ? "מתחבר…" : "התחברות"}</Button>
    </form>
  );
}
