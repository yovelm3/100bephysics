import { beforeEach, describe, expect, it } from "vitest";
import { asUser, createTestDb, createUser, type TestDb } from "./db";

let db: TestDb;
const status = async (id: string) => (await db.query<{ s: string; r: boolean }>(`select status::text as s, needs_review as r from public.exercises where id = $1`, [id])).rows[0];

beforeEach(async () => {
  db = await createTestDb();
  await db.exec(`insert into public.topics (id, name, position) values ('kinematics', 'קינמטיקה', 1);
    insert into public.subtopics (id, topic_id, name, position) values ('kin-line', 'kinematics', 'קו ישר', 1);
    insert into public.exercises (id, pool, subtopic_id, difficulty, status, needs_review, stem, position)
    values ('bagrut-1-q1', 'bagrut', 'kin-line', 2, 'draft', true, 'x', 1);`);
});

describe("admin_set_exercise_status", () => {
  it("a student cannot publish", async () => {
    const u = await createUser(db, "s@x.com");
    await expect(asUser(db, u, () => db.query(`select public.admin_set_exercise_status('bagrut-1-q1', 'published')`))).rejects.toThrow(/forbidden/);
    expect((await status("bagrut-1-q1")).s).toBe("draft");
  });

  it("a guest cannot call it at all", async () => {
    await expect(asUser(db, null, () => db.query(`select public.admin_set_exercise_status('bagrut-1-q1', 'published')`))).rejects.toThrow();
  });

  it("an admin publishes and returns to draft", async () => {
    const a = await createUser(db, "a@x.com", { admin: true });
    await asUser(db, a, () => db.query(`select public.admin_set_exercise_status('bagrut-1-q1', 'published')`));
    expect(await status("bagrut-1-q1")).toEqual({ s: "published", r: false });
    await asUser(db, a, () => db.query(`select public.admin_set_exercise_status('bagrut-1-q1', 'draft')`));
    expect(await status("bagrut-1-q1")).toEqual({ s: "draft", r: true });
  });

  it("an unknown exercise is an error", async () => {
    const a = await createUser(db, "a@x.com", { admin: true });
    await expect(asUser(db, a, () => db.query(`select public.admin_set_exercise_status('nope', 'published')`))).rejects.toThrow(/not found/);
  });
});
