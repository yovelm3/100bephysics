import { beforeEach, describe, expect, it } from "vitest";
import { asUser, attempt, createTestDb, createUser, visibleRows, type TestDb } from "./db";

const key = (n: number) => `device-key-number-${String(n).padStart(4, "0")}`;

let db: TestDb;
beforeEach(async () => {
  db = await createTestDb();
});

async function register(userId: string, deviceKey: string) {
  return asUser(db, userId, async () => {
    const r = await db.query<{ s: string }>(`select public.register_device($1, 'Chrome', 'Android', 'ua') as s`, [deviceKey]);
    return r.rows[0].s;
  });
}

async function isLocked(userId: string) {
  const r = await db.query<{ locked: boolean }>(`select locked from public.profiles where id = $1`, [userId]);
  return r.rows[0].locked;
}

describe("signup", () => {
  it("creates a student profile and records terms acceptance", async () => {
    const id = await createUser(db, "a@x.com", { terms: true });
    const r = await db.query<{ role: string; terms_accepted_at: string | null }>(
      `select role, terms_accepted_at from public.profiles where id = $1`,
      [id],
    );
    expect(r.rows[0].role).toBe("student");
    expect(r.rows[0].terms_accepted_at).not.toBeNull();
  });
});

describe("device limit", () => {
  it("allows up to 5 devices", async () => {
    const u = await createUser(db, "s@x.com");
    for (let i = 1; i <= 5; i++) expect(await register(u, key(i))).toBe("ok");
    expect(await isLocked(u)).toBe(false);
  });

  it("re-using a known device does not count as a new one", async () => {
    const u = await createUser(db, "s@x.com");
    for (let i = 1; i <= 5; i++) await register(u, key(i));
    for (let i = 0; i < 10; i++) expect(await register(u, key(3))).toBe("ok");
    expect(await isLocked(u)).toBe(false);
  });

  it("locks the account on the 6th device, and blocks all devices after that", async () => {
    const u = await createUser(db, "s@x.com");
    for (let i = 1; i <= 5; i++) await register(u, key(i));
    expect(await register(u, key(6))).toBe("locked");
    expect(await isLocked(u)).toBe(true);
    expect(await register(u, key(1))).toBe("locked");
    expect(await register(u, key(7))).toBe("locked");
  });

  it("the 6th device is saved so the admin can see it", async () => {
    const u = await createUser(db, "s@x.com");
    for (let i = 1; i <= 6; i++) await register(u, key(i));
    const r = await db.query(`select 1 from public.devices where user_id = $1`, [u]);
    expect(r.rows.length).toBe(6);
  });

  it("devices of one user do not affect another user", async () => {
    const a = await createUser(db, "a@x.com");
    const b = await createUser(db, "b@x.com");
    for (let i = 1; i <= 5; i++) await register(a, key(i));
    for (let i = 1; i <= 5; i++) expect(await register(b, key(i))).toBe("ok");
    expect(await isLocked(a)).toBe(false);
    expect(await isLocked(b)).toBe(false);
  });

  it("rejects malformed device keys and anonymous callers", async () => {
    const u = await createUser(db, "s@x.com");
    await expect(register(u, "short")).rejects.toThrow();
    await expect(register(u, "bad key with spaces!!!!!")).rejects.toThrow();
    await expect(
      asUser(db, null, () => db.query(`select public.register_device($1)`, [key(1)])),
    ).rejects.toThrow();
  });

  it("a student cannot unlock themselves", async () => {
    const u = await createUser(db, "s@x.com");
    for (let i = 1; i <= 6; i++) await register(u, key(i));
    await expect(asUser(db, u, () => db.query(`select public.admin_unlock_user($1)`, [u]))).rejects.toThrow(/forbidden/);
    await attempt(() => asUser(db, u, () => db.query(`update public.profiles set locked = false where id = $1`, [u])));
    expect(await isLocked(u)).toBe(true);
  });

  it("an admin can unlock, optionally clearing the device list", async () => {
    const admin = await createUser(db, "admin@x.com", { admin: true });
    const u = await createUser(db, "s@x.com");
    for (let i = 1; i <= 6; i++) await register(u, key(i));

    await asUser(db, admin, () => db.query(`select public.admin_unlock_user($1, true)`, [u]));
    expect(await isLocked(u)).toBe(false);
    const r = await db.query(`select 1 from public.devices where user_id = $1`, [u]);
    expect(r.rows.length).toBe(0);
    expect(await register(u, key(9))).toBe("ok");
  });
});

describe("admin and device limit", () => {
  it("an admin is never locked by the device limit", async () => {
    const admin = await createUser(db, "admin@x.com", { admin: true });
    for (let i = 1; i <= 8; i++) expect(await register(admin, key(i))).toBe("ok");
    expect(await isLocked(admin)).toBe(false);
  });
});

describe("payments", () => {
  async function pendingPayment(u: string, product = "subscription_3m") {
    const r = await db.query<{ id: string }>(
      `insert into public.payments (user_id, product, amount_agorot, provider) values ($1, $2, 15000, 'test') returning id`,
      [u, product],
    );
    return r.rows[0].id;
  }

  it("a paid subscription payment opens 3 months of access, only once", async () => {
    const u = await createUser(db, "s@x.com");
    const pay = await pendingPayment(u);
    expect((await db.query<{ r: string }>(`select public.apply_payment($1) as r`, [pay])).rows[0].r).toBe("applied");
    expect((await db.query<{ r: string }>(`select public.apply_payment($1) as r`, [pay])).rows[0].r).toBe("already_paid");
    const subs = await db.query(`select 1 from public.subscriptions where user_id = $1`, [u]);
    expect(subs.rows.length).toBe(1);
  });

  it("a student cannot mark their own payment as paid", async () => {
    const u = await createUser(db, "s@x.com");
    const pay = await pendingPayment(u);
    await expect(asUser(db, u, () => db.query(`select public.apply_payment($1)`, [pay]))).rejects.toThrow();
    await attempt(() => asUser(db, u, () => db.query(`update public.payments set status = 'paid' where id = $1`, [pay])));
    const r = await db.query<{ status: string }>(`select status from public.payments where id = $1`, [pay]);
    expect(r.rows[0].status).toBe("pending");
  });
});

describe("row level security", () => {
  it("a student sees only their own profile, devices and subscriptions", async () => {
    const a = await createUser(db, "a@x.com");
    const b = await createUser(db, "b@x.com");
    await register(a, key(1));
    await register(b, key(2));
    await asUser(db, a, async () => {
      const p = await db.query<{ email: string }>(`select email from public.profiles`);
      expect(p.rows.map((x) => x.email)).toEqual(["a@x.com"]);
      const d = await db.query(`select * from public.devices`);
      expect(d.rows.length).toBe(1);
    });
  });

  it("anonymous visitors see nothing", async () => {
    const a = await createUser(db, "a@x.com");
    await register(a, key(1));
    await asUser(db, null, async () => {
      expect(await visibleRows(db, `select * from public.profiles`)).toBe(0);
      expect(await visibleRows(db, `select * from public.devices`)).toBe(0);
      expect(await visibleRows(db, `select * from public.subscriptions`)).toBe(0);
    });
  });

  it("a student cannot make themselves admin or insert a subscription", async () => {
    const a = await createUser(db, "a@x.com");
    await attempt(() => asUser(db, a, () => db.query(`update public.profiles set role = 'admin' where id = $1`, [a])));
    await asUser(db, a, async () => {
      await expect(
        db.query(`insert into public.subscriptions (user_id, ends_at, source) values ($1, now() + interval '1 year', 'manual')`, [a]),
      ).rejects.toThrow();
      await expect(db.query(`select public.admin_grant_subscription($1)`, [a])).rejects.toThrow(/forbidden/);
    });
    const r = await db.query<{ role: string }>(`select role from public.profiles where id = $1`, [a]);
    expect(r.rows[0].role).toBe("student");
  });

  it("an admin sees all students", async () => {
    const admin = await createUser(db, "admin@x.com", { admin: true });
    await createUser(db, "a@x.com");
    await createUser(db, "b@x.com");
    await asUser(db, admin, async () => {
      expect((await db.query(`select * from public.profiles`)).rows.length).toBe(3);
    });
  });
});

describe("subscriptions and access", () => {
  async function hasAccess(u: string) {
    return asUser(db, u, async () => (await db.query<{ a: boolean }>(`select public.has_access() as a`)).rows[0].a);
  }

  it("no subscription means no access", async () => {
    const u = await createUser(db, "s@x.com");
    expect(await hasAccess(u)).toBe(false);
  });

  it("admin grants 3 months starting today", async () => {
    const admin = await createUser(db, "admin@x.com", { admin: true });
    const u = await createUser(db, "s@x.com");
    await asUser(db, admin, () => db.query(`select public.admin_grant_subscription($1)`, [u]));
    expect(await hasAccess(u)).toBe(true);
    const r = await db.query<{ d: number }>(
      `select extract(day from (ends_at - starts_at))::int as d from public.subscriptions where user_id = $1`,
      [u],
    );
    expect(r.rows[0].d).toBeGreaterThanOrEqual(89);
    expect(r.rows[0].d).toBeLessThanOrEqual(92);
  });

  it("an expired subscription gives no access", async () => {
    const u = await createUser(db, "s@x.com");
    await db.query(
      `insert into public.subscriptions (user_id, starts_at, ends_at, source)
       values ($1, now() - interval '4 months', now() - interval '1 month', 'manual')`,
      [u],
    );
    expect(await hasAccess(u)).toBe(false);
  });

  it("a locked account has no access even with a subscription", async () => {
    const admin = await createUser(db, "admin@x.com", { admin: true });
    const u = await createUser(db, "s@x.com");
    await asUser(db, admin, () => db.query(`select public.admin_grant_subscription($1)`, [u]));
    for (let i = 1; i <= 6; i++) await register(u, key(i));
    expect(await hasAccess(u)).toBe(false);
  });

  it("a student cannot read another student's subscription end date", async () => {
    const admin = await createUser(db, "admin@x.com", { admin: true });
    const a = await createUser(db, "a@x.com");
    const b = await createUser(db, "b@x.com");
    await asUser(db, admin, () => db.query(`select public.admin_grant_subscription($1)`, [b]));
    const r = await asUser(db, a, () => db.query<{ e: string | null }>(`select public.subscription_ends_at($1) as e`, [b]));
    expect(r.rows[0].e).toBeNull();
  });
});

describe("table privileges (new Supabase projects grant nothing by default)", () => {
  it("a logged-in student can read their own profile, devices and subscriptions", async () => {
    const u = await createUser(db, "s@x.com");
    await register(u, key(1));
    await asUser(db, u, async () => {
      expect((await db.query(`select id from public.profiles where id = $1`, [u])).rows.length).toBe(1);
      expect((await db.query(`select id from public.devices`)).rows.length).toBe(1);
      expect((await db.query(`select id from public.subscriptions`)).rows.length).toBe(0);
      expect((await db.query(`select id from public.payments`)).rows.length).toBe(0);
    });
  });
});
