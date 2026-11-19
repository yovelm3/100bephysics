import { beforeEach, describe, expect, it } from "vitest";
import { asUser, createTestDb, createUser, visibleRows, type TestDb } from "./db";

let db: TestDb;

type Ex = { id: string; pool?: "bagrut" | "mechina"; open?: boolean; status?: "draft" | "published"; difficulty?: number; sub?: string };

async function seed(exs: Ex[]) {
  await db.exec(`
    insert into public.topics (id, name, position) values ('kinematics', 'קינמטיקה', 1), ('dynamics', 'דינמיקה', 2);
    insert into public.subtopics (id, topic_id, name, position) values
      ('kin-projectile', 'kinematics', 'זריקה אופקית', 1),
      ('dyn-friction', 'dynamics', 'חיכוך', 1);
  `);
  for (const e of exs) {
    await db.query(
      `insert into public.exercises (id, pool, open_to_highschool, source_label, subtopic_id, difficulty, status, stem)
       values ($1, $2, $3, $4, $5, $6, $7, 'נוסח')`,
      [e.id, e.pool ?? "bagrut", e.open ?? false, e.pool === "mechina" ? null : "1987 שאלה 1", e.sub ?? "kin-projectile", e.difficulty ?? 3, e.status ?? "published"],
    );
    await db.query(
      `insert into public.exercise_parts (id, exercise_id, position, label, question, answer_type, unit) values ($1, $2, 1, 'א', 'שאלה', 'number', 'm/s')`,
      [`${e.id}-1`, e.id],
    );
    await db.query(
      `insert into public.part_answers (part_id, correct_value, final_answer, solution) values ($1, 25, '25 m/s', '[{"what":"x"}]')`,
      [`${e.id}-1`],
    );
  }
}

const EXS: Ex[] = [
  { id: "b1" },
  { id: "b2" },
  { id: "b3" },
  { id: "draft1", status: "draft" },
  { id: "m-closed", pool: "mechina", difficulty: 4 },
  { id: "m-open", pool: "mechina", open: true, difficulty: 5 },
  { id: "b-dyn", sub: "dyn-friction" },
];

async function grantSub(admin: string, user: string) {
  await asUser(db, admin, () => db.query(`select public.admin_grant_subscription($1)`, [user]));
}
async function ids(user: string | null, sql = `select id from public.exercises order by id`) {
  return asUser(db, user, async () => (await db.query<{ id: string }>(sql)).rows.map((r) => r.id));
}

beforeEach(async () => {
  db = await createTestDb();
  await seed(EXS);
});

describe("who can open exercise content", () => {
  it("an anonymous visitor cannot read exercises, parts or answers at all", async () => {
    await asUser(db, null, async () => {
      expect(await visibleRows(db, `select * from public.exercises`)).toBe(0);
      expect(await visibleRows(db, `select * from public.exercise_parts`)).toBe(0);
      expect(await visibleRows(db, `select * from public.part_answers`)).toBe(0);
    });
  });

  it("a registered student without subscription sees no content until they unlock a trial exercise", async () => {
    const s = await createUser(db, "s@x.com", { track: "highschool" });
    expect(await ids(s)).toEqual([]);
  });

  it("a subscribed high-school student sees published bagrut + mechina marked open, not drafts or closed mechina", async () => {
    const admin = await createUser(db, "a@x.com", { admin: true });
    const s = await createUser(db, "s@x.com", { track: "highschool" });
    await grantSub(admin, s);
    expect(await ids(s)).toEqual(["b-dyn", "b1", "b2", "b3", "m-open"]);
  });

  it("a subscribed mechina student sees all published exercises from both pools", async () => {
    const admin = await createUser(db, "a@x.com", { admin: true });
    const s = await createUser(db, "s@x.com", { track: "mechina" });
    await grantSub(admin, s);
    expect(await ids(s)).toEqual(["b-dyn", "b1", "b2", "b3", "m-closed", "m-open"]);
  });

  it("an admin sees everything, including drafts", async () => {
    const admin = await createUser(db, "a@x.com", { admin: true });
    expect((await ids(admin)).length).toBe(EXS.length);
  });

  it("parts follow the same rules as their exercise", async () => {
    const admin = await createUser(db, "a@x.com", { admin: true });
    const s = await createUser(db, "s@x.com", { track: "highschool" });
    await grantSub(admin, s);
    const parts = await ids(s, `select exercise_id as id from public.exercise_parts order by exercise_id`);
    expect(parts).toEqual(["b-dyn", "b1", "b2", "b3", "m-open"]);
  });

  it("correct answers are never readable by students, even subscribed ones", async () => {
    const admin = await createUser(db, "a@x.com", { admin: true });
    const s = await createUser(db, "s@x.com", { track: "mechina" });
    await grantSub(admin, s);
    await asUser(db, s, async () => {
      expect(await visibleRows(db, `select * from public.part_answers`)).toBe(0);
    });
  });

  it("a locked account sees nothing even with a subscription", async () => {
    const admin = await createUser(db, "a@x.com", { admin: true });
    const s = await createUser(db, "s@x.com", { track: "mechina" });
    await grantSub(admin, s);
    await db.query(`update public.profiles set locked = true where id = $1`, [s]);
    expect(await ids(s)).toEqual([]);
  });

  it("an expired subscription closes access", async () => {
    const s = await createUser(db, "s@x.com", { track: "mechina" });
    await db.query(
      `insert into public.subscriptions (user_id, starts_at, ends_at, source) values ($1, now() - interval '4 months', now() - interval '1 month', 'manual')`,
      [s],
    );
    expect(await ids(s)).toEqual([]);
  });
});

describe("free trial (2 exercises of the student's choice)", () => {
  async function unlock(u: string, id: string) {
    return asUser(db, u, async () => (await db.query<{ r: string }>(`select public.unlock_trial($1) as r`, [id])).rows[0].r);
  }

  it("unlocks 2 exercises, refuses the 3rd, and opening the same one again is free", async () => {
    const s = await createUser(db, "s@x.com", { track: "highschool" });
    expect(await unlock(s, "b1")).toBe("ok");
    expect(await unlock(s, "b1")).toBe("ok");
    expect(await unlock(s, "b2")).toBe("ok");
    expect(await unlock(s, "b3")).toBe("limit");
    expect(await ids(s)).toEqual(["b1", "b2"]);
    const left = await asUser(db, s, async () => (await db.query<{ n: number }>(`select public.trial_remaining() as n`)).rows[0].n);
    expect(left).toBe(0);
  });

  it("cannot unlock drafts or exercises outside the student's track", async () => {
    const s = await createUser(db, "s@x.com", { track: "highschool" });
    expect(await unlock(s, "draft1")).toBe("not_found");
    expect(await unlock(s, "m-closed")).toBe("not_found");
    expect(await unlock(s, "nope")).toBe("not_found");
    expect(await unlock(s, "m-open")).toBe("ok");
  });

  it("a subscribed student does not use trial slots", async () => {
    const admin = await createUser(db, "a@x.com", { admin: true });
    const s = await createUser(db, "s@x.com");
    await grantSub(admin, s);
    expect(await unlock(s, "b1")).toBe("subscribed");
    const n = await db.query(`select 1 from public.trial_unlocks where user_id = $1`, [s]);
    expect(n.rows.length).toBe(0);
  });

  it("a student cannot insert trial unlocks directly", async () => {
    const s = await createUser(db, "s@x.com");
    await expect(
      asUser(db, s, () => db.query(`insert into public.trial_unlocks (user_id, exercise_id) values ($1, 'b3')`, [s])),
    ).rejects.toThrow();
  });

  it("anonymous visitors cannot unlock", async () => {
    await expect(asUser(db, null, () => db.query(`select public.unlock_trial('b1')`))).rejects.toThrow();
  });
});

describe("solutions", () => {
  async function solution(u: string, part: string) {
    return asUser(db, u, async () => (await db.query<{ s: unknown }>(`select public.get_solution($1) as s`, [part])).rows[0].s);
  }

  it("is returned only for exercises the student may open", async () => {
    const s = await createUser(db, "s@x.com", { track: "highschool" });
    expect(await solution(s, "b1-1")).toBeNull();
    await asUser(db, s, () => db.query(`select public.unlock_trial('b1')`));
    expect(await solution(s, "b1-1")).toMatchObject({ final_answer: "25 m/s" });
    expect(await solution(s, "b2-1")).toBeNull();
  });
});

describe("catalog counts (never leak the other track's numbers)", () => {
  async function counts(u: string | null, track: "highschool" | "mechina") {
    return asUser(db, u, async () => {
      const r = await db.query<{ subtopic_id: string; exercise_count: number }>(`select subtopic_id, exercise_count from public.catalog($1)`, [track]);
      return Object.fromEntries(r.rows.map((x) => [x.subtopic_id, x.exercise_count]));
    });
  }

  it("anonymous visitors get counts for the track chosen on the landing page", async () => {
    expect(await counts(null, "highschool")).toEqual({ "kin-projectile": 4, "dyn-friction": 1 });
    expect(await counts(null, "mechina")).toEqual({ "kin-projectile": 5, "dyn-friction": 1 });
  });

  it("a logged-in high-school student always gets high-school counts, whatever they ask for", async () => {
    const s = await createUser(db, "s@x.com", { track: "highschool" });
    expect(await counts(s, "mechina")).toEqual({ "kin-projectile": 4, "dyn-friction": 1 });
  });

  it("drafts are never counted", async () => {
    const mech = await counts(null, "mechina");
    expect(mech["kin-projectile"]).toBe(5); // b1,b2,b3,m-closed,m-open (draft1 excluded)
  });
});

describe("exercise list (metadata only)", () => {
  it("shows the student's track only, hides mechina source labels, and marks what is unlocked", async () => {
    const s = await createUser(db, "s@x.com", { track: "highschool" });
    await asUser(db, s, () => db.query(`select public.unlock_trial('b2')`));
    const rows = await asUser(db, s, async () =>
      (await db.query<{ id: string; source_label: string | null; unlocked: boolean; difficulty: number }>(`select * from public.list_exercises('kin-projectile')`)).rows,
    );
    expect(rows.map((r) => r.id).sort()).toEqual(["b1", "b2", "b3", "m-open"]);
    expect(rows.find((r) => r.id === "m-open")!.source_label).toBeNull();
    expect(rows.find((r) => r.id === "m-open")!.difficulty).toBeGreaterThanOrEqual(4);
    expect(rows.find((r) => r.id === "b2")!.unlocked).toBe(true);
    expect(rows.find((r) => r.id === "b1")!.unlocked).toBe(false);
  });
});

describe("content rules in the database", () => {
  it("only mechina exercises can be open to high school, and only at difficulty 4-5", async () => {
    await expect(
      db.query(`insert into public.exercises (id, pool, open_to_highschool, subtopic_id, difficulty, stem) values ('x', 'bagrut', true, 'kin-projectile', 4, 's')`),
    ).rejects.toThrow();
    await expect(
      db.query(`insert into public.exercises (id, pool, open_to_highschool, subtopic_id, difficulty, stem) values ('y', 'mechina', true, 'kin-projectile', 3, 's')`),
    ).rejects.toThrow();
  });

  it("students cannot write content", async () => {
    const admin = await createUser(db, "a@x.com", { admin: true });
    const s = await createUser(db, "s@x.com", { track: "mechina" });
    await grantSub(admin, s);
    await expect(asUser(db, s, () => db.query(`update public.exercises set status = 'published' where id = 'draft1'`))).rejects.toThrow();
    await expect(asUser(db, s, () => db.query(`delete from public.exercise_parts`))).rejects.toThrow();
  });
});
