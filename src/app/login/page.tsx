// Reads the session / search params on every request.
export const instant = false;

import type { Metadata } from "next";
import { Card, Notice, Page, TextLink } from "@/components/ui";
import { safeNext } from "@/lib/site";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "התחברות | 100 בפיזיקה" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  return (
    <Page title="התחברות">
      {sp.confirmed === "1" && <Notice tone="ok">המייל אומת. אפשר להתחבר.</Notice>}
      {sp.error === "link" && <Notice tone="warn">הקישור לא תקין או שפג תוקפו. נסה להתחבר, ואם צריך בקש קישור חדש.</Notice>}
      <Card>
        <LoginForm next={next} />
      </Card>
      <div className="flex flex-col gap-1 text-sm text-muted">
        <p>
          אין לך חשבון? <TextLink href="/signup">להרשמה</TextLink>
        </p>
        <p>
          שכחת סיסמה? <TextLink href="/forgot-password">לבחירת סיסמה חדשה</TextLink>
        </p>
      </div>
    </Page>
  );
}
