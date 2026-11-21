// Reads the session on every request.
export const instant = false;

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card, Page } from "@/components/ui";
import { requireUser } from "@/lib/access";
import { isKeyMismatch, reviewNote } from "@/lib/review";
import { setExerciseStatus, unlockTrial } from "./actions";
import { ExercisePlayer, type PlayerExercise, type PlayerPart } from "./ExercisePlayer";

export const metadata: Metadata = { title: "תרגיל | 100 בפיזיקה" };

export default async function ExercisePage({ params }: PageProps<"/exercise/[id]">) {
  const { id } = await params;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) notFound();
  const { supabase, profile } = await requireUser(`/exercise/${id}`);

  const { data: access } = await supabase.rpc("exercise_access", { p_id: id });
  if (access === "not_found" || !access) notFound();
  if (access !== "view") return <Locked id={id} access={access as string} />;

  const { data: ex } = await supabase
    .from("exercises")
    .select("id, pool, source_label, subtopic_id, difficulty, status, stem, figure, author_note, open_to_highschool")
    .eq("id", id)
    .single();
  if (!ex) notFound();

  const [{ data: parts }, { data: sub }, { data: list }, { data: attempts }] = await Promise.all([
    supabase.from("exercise_parts").select("id, position, label, question, answer_type, unit, choices").eq("exercise_id", id).order("position"),
    supabase.from("subtopics").select("id, name, topics(name)").eq("id", ex.subtopic_id).single(),
    supabase.rpc("list_exercises", { p_subtopic: ex.subtopic_id }),
    supabase.from("attempts").select("part_id, result").eq("user_id", profile.id).eq("exercise_id", id).eq("result", "correct"),
  ]);

  const ids = ((list ?? []) as { id: string }[]).map((r) => r.id);
  const index = ids.indexOf(id);
  const solved = new Set((attempts ?? []).map((a) => a.part_id as string));
  const difficulty = ex.pool === "mechina" && ex.open_to_highschool && profile.track === "highschool" ? Math.max(ex.difficulty, 4) : ex.difficulty;

  const exercise: PlayerExercise = {
    id: ex.id,
    sourceLabel: ex.pool === "bagrut" ? ex.source_label : null,
    difficulty,
    stem: ex.stem,
    figure: (ex.figure as { svg?: string | null; alt?: string; provisional?: boolean } | null)?.svg
      ? { svg: (ex.figure as { svg: string }).svg, alt: (ex.figure as { alt?: string }).alt ?? "", provisional: !!(ex.figure as { provisional?: boolean }).provisional }
      : null,
    authorNote: ex.author_note,
    isDraft: ex.status === "draft",
    topicName: (sub?.topics as unknown as { name: string } | null)?.name ?? "",
    subtopicName: sub?.name ?? "",
    subtopicId: ex.subtopic_id,
    nav: { index: index >= 0 ? index + 1 : 1, total: ids.length || 1, prev: index > 0 ? ids[index - 1] : null, next: index >= 0 && index < ids.length - 1 ? ids[index + 1] : null },
  };
  const playerParts: PlayerPart[] = (parts ?? []).map((p) => ({
    id: p.id,
    label: p.label,
    question: p.question,
    answerType: p.answer_type,
    unit: p.unit,
    choices: (p.choices as string[] | null) ?? null,
    solved: solved.has(p.id),
  }));

  let adminPanel = null;
  if (profile.role === "admin") {
    const { data: rv } = await supabase.from("exercises").select("review_notes").eq("id", id).single();
    adminPanel = <ReviewPanel id={id} draft={ex.status === "draft"} notes={rv?.review_notes ?? null} next={exercise.nav.next} />;
  }

  return <ExercisePlayer exercise={exercise} parts={playerParts} adminPanel={adminPanel} />;
}

/** Owner review, visible to admins only: Claude's note on this exercise, and approve/publish. */
function ReviewPanel({ id, draft, notes, next }: { id: string; draft: boolean; notes: string | null; next: string | null }) {
  const note = reviewNote(notes);
  const mismatch = isKeyMismatch(notes);
  return (
    <section aria-label="בדיקת הבעלים" className={`flex flex-col gap-3 rounded-2xl border-2 p-4 ${mismatch ? "border-warn bg-warn-soft" : "border-caution bg-caution-soft"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold">{mismatch ? "לבדיקה: אי-התאמה לדף התשובות" : "בדיקת הבעלים"}</h2>
        <Link href="/admin/review" className="text-sm font-semibold text-accent underline">כל הטיוטות</Link>
      </div>
      <p className="leading-relaxed">{note || "אין הערות מיוחדות. בדוק נוסח, ציור ופתרון."}</p>
      <form action={setExerciseStatus} className="flex flex-wrap gap-2">
        <input type="hidden" name="id" value={id} />
        {draft ? (
          <>
            <input type="hidden" name="status" value="published" />
            <Button type="submit">אשר ופרסם</Button>
            {next && (
              <Button type="submit" variant="ghost" name="next" value={next}>אשר ועבור לשאלה הבאה</Button>
            )}
          </>
        ) : (
          <>
            <span className="self-center rounded-full bg-key-soft px-3 py-1 text-sm font-bold text-key">פורסם: תלמידים רואים את השאלה</span>
            <input type="hidden" name="status" value="draft" />
            <Button type="submit" variant="danger">החזר לטיוטה</Button>
          </>
        )}
      </form>
    </section>
  );
}

function Locked({ id, access }: { id: string; access: string }) {
  return (
    <Page title="התרגיל נעול">
      <Card>
        {access === "trial_available" && (
          <>
            <p>אפשר לפתוח את התרגיל הזה כאחד משני התרגילים החינמיים שלך, כולל ההנפשות והפתרון המלא.</p>
            <form action={unlockTrial}>
              <input type="hidden" name="id" value={id} />
              <button className="min-h-12 w-full rounded-xl bg-cta px-5 text-lg font-bold text-on-cta">פתיחת התרגיל בחינם</button>
            </form>
          </>
        )}
        {access === "trial_used_up" && (
          <>
            <p>השתמשת בשני התרגילים החינמיים. כדי להמשיך לתרגל את כל המאגר צריך מנוי.</p>
            <Link href="/subscribe" className="min-h-12 rounded-xl bg-cta px-5 py-3 text-center text-lg font-bold text-on-cta">למנוי</Link>
          </>
        )}
        {access === "locked" && <p className="text-warn">החשבון נעול. פנה למנהל האתר.</p>}
      </Card>
    </Page>
  );
}
