import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadContent } from "@/lib/content/load";
import { ExerciseSchema } from "@/lib/content/schema";
import { exerciseSql, lit, topicsSql } from "@/lib/content/sql";
import { asUser, createTestDb, createUser } from "./db";

const root = path.resolve(__dirname, "../../content");

describe("content files", () => {
  it("every file in content/ is valid", () => {
    const { errors, exercises } = loadContent(root);
    expect(errors).toEqual([]);
    expect(exercises.length).toBeGreaterThan(0);
  });

  it("the schema rejects broken exercises with clear messages", () => {
    const good = loadContent(root).exercises[0].exercise;
    const bad = (patch: object) => ExerciseSchema.safeParse({ ...good, ...patch }).success;
    expect(bad({ difficulty: 6 })).toBe(false);
    expect(bad({ id: "Bad Id" })).toBe(false);
    expect(bad({ pool: "bagrut", openToHighschool: true })).toBe(false);
    expect(bad({ status: "published", needsReview: true })).toBe(false);
    expect(bad({ parts: [] })).toBe(false);
    expect(bad({ parts: [{ ...good.parts[0], skills: ["magic"] }] })).toBe(false);
  });

  it("SQL literals escape quotes", () => {
    expect(lit("it's")).toBe("'it''s'");
    expect(lit(null)).toBe("null");
  });
});

describe("import into the database", () => {
  it("imports topics and exercises; content and answers are protected", async () => {
    const db = await createTestDb();
    const { topics, exercises } = loadContent(root);
    await db.exec(topicsSql(topics));
    for (const { exercise } of exercises) await db.exec(exerciseSql({ ...exercise, status: "published", needsReview: false }));
    // importing twice must not duplicate anything
    for (const { exercise } of exercises) await db.exec(exerciseSql({ ...exercise, status: "published", needsReview: false }));

    const t = await db.query<{ n: number }>(`select count(*)::int as n from public.subtopics`);
    expect(t.rows[0].n).toBe(26);
    const ex = exercises.find((x) => x.exercise.id === "bagrut-1987-q1")!.exercise;
    const parts = await db.query<{ n: number }>(`select count(*)::int as n from public.exercise_parts where exercise_id = 'bagrut-1987-q1'`);
    expect(parts.rows[0].n).toBe(ex.parts.length);

    const admin = await createUser(db, "a@x.com", { admin: true });
    const s = await createUser(db, "s@x.com", { track: "highschool" });
    await asUser(db, admin, () => db.query(`select public.admin_grant_subscription($1)`, [s]));
    await asUser(db, s, async () => {
      const r = await db.query<{ question: string }>(`select question from public.exercise_parts where exercise_id = 'bagrut-1987-q1' order by position`);
      expect(r.rows.map((x) => x.question)).toEqual(ex.parts.map((p) => p.question));
      await expect(db.query(`select * from public.part_answers`)).rejects.toThrow();
      const sol = await db.query<{ s: { final_answer: string } }>(`select public.get_solution('bagrut-1987-q1-2') as s`);
      expect(sol.rows[0].s.final_answer).toBe(ex.parts[1].finalAnswer);
    });
  });
});
