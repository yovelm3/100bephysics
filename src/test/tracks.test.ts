import { beforeEach, describe, expect, it } from "vitest";
import { asUser, createTestDb, createUser, type TestDb } from "./db";

let db: TestDb;
beforeEach(async () => {
  db = await createTestDb();
});

async function track(id: string) {
  return (await db.query<{ track: string }>(`select track from public.profiles where id = $1`, [id])).rows[0].track;
}

describe("tracks", () => {
  it("saves the track chosen at signup", async () => {
    expect(await track(await createUser(db, "h@x.com", { track: "highschool" }))).toBe("highschool");
    expect(await track(await createUser(db, "m@x.com", { track: "mechina" }))).toBe("mechina");
  });

  it("defaults to high school when nothing valid was sent", async () => {
    expect(await track(await createUser(db, "x@x.com"))).toBe("highschool");
  });

  it("a student cannot change their own track", async () => {
    const u = await createUser(db, "s@x.com", { track: "highschool" });
    await asUser(db, u, () => db.query(`update public.profiles set track = 'mechina' where id = $1`, [u]));
    await expect(asUser(db, u, () => db.query(`select public.admin_set_track($1, 'mechina')`, [u]))).rejects.toThrow(/forbidden/);
    expect(await track(u)).toBe("highschool");
  });

  it("an admin can change a student's track", async () => {
    const admin = await createUser(db, "a@x.com", { admin: true });
    const u = await createUser(db, "s@x.com", { track: "highschool" });
    await asUser(db, admin, () => db.query(`select public.admin_set_track($1, 'mechina')`, [u]));
    expect(await track(u)).toBe("mechina");
  });

  it("my_track returns only the caller's own track", async () => {
    const u = await createUser(db, "s@x.com", { track: "mechina" });
    const r = await asUser(db, u, () => db.query<{ t: string }>(`select public.my_track() as t`));
    expect(r.rows[0].t).toBe("mechina");
  });
});
