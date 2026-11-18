import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * In-memory Postgres with a minimal stand-in for Supabase's `auth` schema and roles,
 * so migrations and RLS policies can be tested without a real Supabase project.
 */
const AUTH_STUB = `
create role anon nologin;
create role authenticated nologin;
create schema auth;
grant usage on schema auth to anon, authenticated;
create table auth.users (
  id uuid primary key,
  email text,
  raw_user_meta_data jsonb default '{}'::jsonb
);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant execute on function auth.uid() to anon, authenticated;
`;

// Supabase grants table privileges to these roles by default; RLS does the filtering.
const SUPABASE_DEFAULT_GRANTS = `
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
`;

export async function createTestDb() {
  const db = new PGlite();
  await db.exec(AUTH_STUB);
  const dir = path.resolve(__dirname, "../../supabase/migrations");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(path.join(dir, file), "utf8"));
  }
  await db.exec(SUPABASE_DEFAULT_GRANTS);
  return db;
}

export type TestDb = Awaited<ReturnType<typeof createTestDb>>;

/** Creates an auth user (fires the profile trigger) and returns its id. */
export async function createUser(
  db: TestDb,
  email: string,
  opts: { admin?: boolean; terms?: boolean; track?: "highschool" | "mechina" } = {},
) {
  const res = await db.query<{ id: string }>(
    `insert into auth.users (id, email, raw_user_meta_data)
     values (gen_random_uuid(), $1, $2) returning id`,
    [email, JSON.stringify({ terms_accepted: opts.terms ?? true, track: opts.track })],
  );
  const id = res.rows[0].id;
  if (opts.admin) await db.query(`update public.profiles set role = 'admin' where id = $1`, [id]);
  return id;
}

/** Runs `fn` as the given user (role `authenticated`), or as `anon` when userId is null. */
export async function asUser<T>(db: TestDb, userId: string | null, fn: () => Promise<T>): Promise<T> {
  await db.exec(`set role ${userId ? "authenticated" : "anon"}`);
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [userId ?? ""]);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role`);
    await db.query(`select set_config('request.jwt.claim.sub', '', false)`);
  }
}
