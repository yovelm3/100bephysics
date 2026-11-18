// Reads the session / search params on every request.
export const instant = false;

import type { Metadata } from "next";
import { Button, Card, Page, formatDate, formatDateTime } from "@/components/ui";
import { requireAdmin } from "@/lib/access";
import { grantSubscription, removeDevice, setTrack, unlockUser } from "./actions";

export const metadata: Metadata = { title: "ניהול | 100 בפיזיקה" };

type Row = {
  id: string;
  email: string;
  role: "student" | "admin";
  track: "highschool" | "mechina";
  locked: boolean;
  locked_at: string | null;
  created_at: string;
  devices: { id: string; browser: string | null; os: string | null; last_seen_at: string }[];
  subscriptions: { ends_at: string; starts_at: string; source: string }[];
};

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const { supabase } = await requireAdmin("/admin");
  const q = String((await searchParams).q ?? "").trim().toLowerCase();

  let query = supabase
    .from("profiles")
    .select("id, email, role, track, locked, locked_at, created_at, devices(id, browser, os, last_seen_at), subscriptions(ends_at, starts_at, source)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (q) query = query.ilike("email", `%${q}%`);
  const { data, error } = await query.returns<Row[]>();
  if (error) throw new Error(error.message);

  const now = new Date();
  const rows = (data ?? []).map((r) => {
    const end = r.subscriptions.map((s) => new Date(s.ends_at)).sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
    return { ...r, subEnd: end, active: !!end && end > now };
  });
  const lockedCount = rows.filter((r) => r.locked).length;
  const activeCount = rows.filter((r) => r.active).length;

  return (
    <Page title="לוח ניהול" narrow={false}>
      <div className="grid grid-cols-3 gap-3 text-center">
        <Card className="gap-1 p-3"><span className="ltr text-2xl font-bold">{rows.length}</span><span className="text-xs text-muted">משתמשים</span></Card>
        <Card className="gap-1 p-3"><span className="ltr text-2xl font-bold text-key">{activeCount}</span><span className="text-xs text-muted">מנויים פעילים</span></Card>
        <Card className="gap-1 p-3"><span className="ltr text-2xl font-bold text-warn">{lockedCount}</span><span className="text-xs text-muted">חשבונות נעולים</span></Card>
      </div>

      <form className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="חיפוש לפי מייל" dir="ltr" className="flex-1 rounded-lg border border-line bg-surface px-3 py-2" />
        <Button variant="ghost" type="submit">חיפוש</Button>
      </form>

      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <Card key={r.id} className={r.locked ? "border-warn" : ""}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="ltr font-semibold">{r.email}</span>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                {r.role === "admin" && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-accent">מנהל</span>}
                {r.locked && <span className="rounded-full bg-warn-soft px-2 py-0.5 text-warn">נעול מ-{formatDate(r.locked_at)}</span>}
                <span className={`rounded-full px-2 py-0.5 ${r.active ? "bg-key-soft text-key" : "bg-caution-soft text-caution"}`}>
                  {r.active ? `מנוי עד ${formatDate(r.subEnd)}` : r.subEnd ? `מנוי הסתיים ${formatDate(r.subEnd)}` : "ללא מנוי"}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted">נרשם ב-{formatDate(r.created_at)}</p>
              <form action={setTrack} className="flex items-center gap-2 text-sm">
                <input type="hidden" name="user" value={r.id} />
                <label htmlFor={`track-${r.id}`}>מסלול:</label>
                <select id={`track-${r.id}`} name="track" defaultValue={r.track} className="rounded-md border border-line bg-surface px-2 py-1">
                  <option value="highschool">תיכון</option>
                  <option value="mechina">מכינה</option>
                </select>
                <button className="text-xs font-semibold text-accent underline">שמירה</button>
              </form>
            </div>

            <details>
              <summary className="cursor-pointer text-sm font-semibold">
                מכשירים <span className="ltr">({r.devices.length})</span>
              </summary>
              <ul className="mt-2 flex flex-col divide-y divide-line text-sm">
                {r.devices.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-1.5">
                    <span>{d.browser} · {d.os}</span>
                    <span className="flex items-center gap-3 text-muted">
                      כניסה אחרונה {formatDateTime(d.last_seen_at)}
                      <form action={removeDevice}>
                        <input type="hidden" name="device" value={d.id} />
                        <button className="text-xs text-warn underline">הסרה</button>
                      </form>
                    </span>
                  </li>
                ))}
              </ul>
            </details>

            <div className="flex flex-wrap gap-2">
              <form action={grantSubscription}>
                <input type="hidden" name="user" value={r.id} />
                <Button variant="ghost" type="submit">הפעלת מנוי ל-3 חודשים מהיום</Button>
              </form>
              {r.locked && (
                <form action={unlockUser} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="user" value={r.id} />
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" name="clear" defaultChecked /> למחוק גם את רשימת המכשירים
                  </label>
                  <Button variant="danger" type="submit">שחרור נעילה</Button>
                </form>
              )}
            </div>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-muted">לא נמצאו משתמשים.</p>}
      </div>
    </Page>
  );
}
