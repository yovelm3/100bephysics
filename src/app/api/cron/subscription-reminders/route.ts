import { NextResponse, type NextRequest } from "next/server";
import { rtlEmail, sendEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Daily job (see vercel.json): emails students whose subscription ends within 7 days.
 * Vercel sends `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = createAdminClient();
  if (!db) return NextResponse.json({ error: "unconfigured" }, { status: 503 });

  const now = new Date();
  const inWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data: due, error } = await db
    .from("subscriptions")
    .select("id, user_id, ends_at, profiles!subscriptions_user_id_fkey(email)")
    .is("reminder_sent_at", null)
    .gt("ends_at", now.toISOString())
    .lte("ends_at", inWeek.toISOString());
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://100bephysics.vercel.app";
  let sent = 0;
  for (const sub of due ?? []) {
    // Skip if the student already has a later subscription.
    const { data: later } = await db
      .from("subscriptions")
      .select("id")
      .eq("user_id", sub.user_id)
      .gt("ends_at", sub.ends_at)
      .limit(1);
    if (later?.length) {
      await db.from("subscriptions").update({ reminder_sent_at: now.toISOString() }).eq("id", sub.id);
      continue;
    }
    const email = (sub.profiles as unknown as { email: string } | null)?.email;
    if (!email) continue;
    const end = new Intl.DateTimeFormat("he-IL", { dateStyle: "long", timeZone: "Asia/Jerusalem" }).format(new Date(sub.ends_at));
    const ok = await sendEmail(
      email,
      "המנוי שלך ב-100 בפיזיקה מסתיים בעוד שבוע",
      rtlEmail(
        `<p>שלום,</p><p>המנוי שלך באתר 100 בפיזיקה מסתיים ב-${end}.</p>` +
          `<p>אחרי התאריך הזה הגישה לתרגילים תיסגר. ההתקדמות שלך נשמרת, ותחזור אליה כשתחדש את המנוי.</p>` +
          `<p><a href="${site}/subscribe">לחידוש המנוי</a></p>`,
      ),
    );
    if (ok) {
      await db.from("subscriptions").update({ reminder_sent_at: now.toISOString() }).eq("id", sub.id);
      sent++;
    }
  }
  return NextResponse.json({ checked: due?.length ?? 0, sent });
}
