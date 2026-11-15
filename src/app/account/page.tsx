// Reads the session / search params on every request.
export const instant = false;

import type { Metadata } from "next";
import { Card, Notice, Page, TextLink, formatDate, formatDateTime } from "@/components/ui";
import { requireUser } from "@/lib/access";

export const metadata: Metadata = { title: "החשבון שלי | 100 בפיזיקה" };

export default async function AccountPage() {
  const { supabase, profile, subscriptionEndsAt, hasActiveSubscription } = await requireUser("/account");
  const { data: devices } = await supabase
    .from("devices")
    .select("id, browser, os, last_seen_at")
    .eq("user_id", profile.id)
    .order("first_seen_at");

  const deviceCount = devices?.length ?? 0;

  return (
    <Page title="החשבון שלי">
      <Card>
        <p className="text-sm text-muted">מחובר בתור</p>
        <p className="ltr self-end font-semibold">{profile.email}</p>
      </Card>

      <Card>
        <h2 className="font-bold">מנוי</h2>
        {profile.role === "admin" ? (
          <Notice tone="ok">אתה מנהל האתר, ויש לך גישה מלאה.</Notice>
        ) : hasActiveSubscription ? (
          <Notice tone="ok">המנוי פעיל עד {formatDate(subscriptionEndsAt)}.</Notice>
        ) : (
          <>
            <Notice tone="warn">
              {subscriptionEndsAt ? `המנוי הסתיים ב-${formatDate(subscriptionEndsAt)}. ההתקדמות שלך שמורה.` : "אין לך עדיין מנוי."}
            </Notice>
            <TextLink href="/subscribe">לפרטים על המנוי</TextLink>
          </>
        )}
      </Card>

      <Card>
        <h2 className="font-bold">
          מכשירים <span className="ltr font-normal text-muted">({deviceCount}/5)</span>
        </h2>
        <ul className="flex flex-col divide-y divide-line text-sm">
          {devices?.map((d) => (
            <li key={d.id} className="flex justify-between gap-2 py-2">
              <span>
                {d.browser} · {d.os}
              </span>
              <span className="text-muted">{formatDateTime(d.last_seen_at)}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-warn">כניסה ממכשיר שישי נועלת את החשבון לצמיתות.</p>
      </Card>

      <form action="/auth/signout" method="post">
        <button className="text-sm font-semibold text-accent underline">התנתקות</button>
      </form>
    </Page>
  );
}
