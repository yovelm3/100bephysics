// End-to-end walk-through of stage 3B (exercise page, answer checking, solution, animation, free trial).
// Needs the temporary users from e2e/create-test-users.sql and three temporary published exercises
// e2e-test-1..3 (one number part, answer 12.5 m) — see e2e/README.md.
const { chromium } = require('playwright');

const BASE = process.env.E2E_BASE || 'http://localhost:3000';
const PW = process.env.E2E_PASSWORD;
if (!PW) throw new Error('Set E2E_PASSWORD (see e2e/README.md)');
const STUDENT = 'e2e-student@100bephysics.test';
const ADMIN = 'e2e-admin@100bephysics.test';

const results = [];
function check(name, ok, info = '') {
  results.push({ name, ok, info });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`);
}

async function login(ctx, email) {
  const p = await ctx.newPage();
  await p.goto(BASE + '/login?next=/practice');
  await p.fill('input[name=email]', email);
  await p.fill('input[name=password]', PW);
  await p.click('button[type=submit]');
  await p.waitForURL((u) => u.pathname === '/practice', { timeout: 30000 }).catch(() => {});
  await p.waitForLoadState('networkidle').catch(() => {});
  return p;
}

async function answer(p, value) {
  const input = p.locator('input[inputmode=decimal]');
  await input.fill(value);
  const resp = p.waitForResponse((r) => r.url().endsWith('/api/answer'), { timeout: 20000 });
  await p.locator('form button:has-text("בדיקה")').click();
  const r = await resp;
  const body = await r.json().catch(() => ({}));
  await p.waitForTimeout(200);
  return (body.message || `HTTP ${r.status()}`).trim();
}

(async () => {
  const b = await chromium.launch();
  const errors = [];

  // ---------- admin: the draft 1987 exercise
  {
    const ctx = await b.newContext();
    const p = await login(ctx, ADMIN);
    p.on('pageerror', (e) => errors.push('admin: ' + e.message));
    check('admin reaches /practice', p.url().endsWith('/practice'), p.url());
    check('practice lists the 7 topics', (await p.locator('h2').count()) === 7, String(await p.locator('h2').count()));
    await p.goto(BASE + '/exercise/bagrut-1987-q1');
    await p.waitForLoadState('networkidle');
    check('draft exercise opens for admin', await p.locator('text=טיוטה: רק מנהל רואה').isVisible());
    check('source header "1987 שאלה 1"', await p.locator('h1:has-text("1987 שאלה 1")').isVisible());
    check('stem shown as one block', (await p.locator('section[aria-label="נוסח השאלה"] p').first().innerText()).includes('האדם מתחיל לרוץ ממנוחה'));
    check('3 part tabs', (await p.locator('[role=tab]').count()) === 3);
    check('author note shown', await p.locator('text=דגש מהמחבר').isVisible());
    const svg = p.locator('svg[role=img]');
    check('animation rendered', (await svg.count()) === 1);
    const clock = p.locator('text=/t = \\d/');
    const before = await clock.innerText();
    await p.click('button:has-text("הפעלת ההנפשה")');
    await p.waitForTimeout(1500);
    const after = await clock.innerText();
    check('animation plays (clock moves)', before !== after, `${before} → ${after}`);
    await p.waitForTimeout(2500);
    const labels = (await svg.locator('text').allTextContents()).join(' | ');
    check('animation never shows the answer', !/25\s*m\/s|v = 25/.test(labels) && labels.includes('v = ?'), labels);

    check('"3" → asks for 2 significant figures', (await answer(p, '3')).includes('לפחות 2 ספרות'));
    await p.click('[role=tab]:has-text("סעיף א")');
    { const m = await answer(p, '-25'); check('"-25" → check the direction', m.includes('בדוק את הכיוון'), m); }
    { const m = await answer(p, '2500'); check('"2500" → check the units', m.includes('בדוק את היחידות'), m); }
    check('"26" → wrong', (await answer(p, '26')).includes('לא נכון'));
    { const m = await answer(p, '25'); check('"25" → correct', m.includes('נכון!'), m); }
    check('next-part button after correct', await p.locator('button:has-text("לסעיף ב")').isVisible());
    await p.click('button:has-text("לסעיף ב")');
    check('moved to part ב', (await p.locator('[role=tab][aria-selected=true]').innerText()).includes('ב'));
    check('part ב: "5,19" → correct', (await answer(p, '5,19')).includes('נכון!'));
    const solResp = p.waitForResponse((r) => r.url().endsWith('/api/solution'), { timeout: 20000 });
    await p.click('button:has-text("לפתרון המלא של סעיף ב")');
    const sr = await solResp;
    check('solution API answers 200', sr.status() === 200, String(sr.status()) + ' ' + (await sr.text()).slice(0, 120));
    await p.locator('h2:has-text("פתרון מלא")').waitFor({ timeout: 15000 });
    check('solution shown with "why" column', await p.locator('text=הזמן הוא הנעלם, והוא משותף לכדור ולרץ').isVisible());
    check('final answer shown', (await p.locator('section[aria-label="פתרון סעיף ב"]').innerText()).includes('5.19'));
    await ctx.close();
  }

  // ---------- student without subscription: drafts hidden, free trial
  {
    const ctx = await b.newContext();
    const p = await login(ctx, STUDENT);
    p.on('pageerror', (e) => errors.push('student: ' + e.message));
    await p.goto(BASE + '/exercise/bagrut-1987-q1');
    check('draft exercise hidden from students', await p.locator('text=הדף לא נמצא').waitFor({ timeout: 15000 }).then(() => true, () => false));
    await p.goto(BASE + '/practice/kin-straight-line');
    check('subtopic lists the 3 test exercises', (await p.locator('a[href^="/exercise/e2e-test-"]').count()) === 3);
    check('locked exercises show a lock', (await p.locator('[aria-label="נעול"]').count()) === 3);

    await p.goto(BASE + '/exercise/e2e-test-1');
    const html1 = await p.content();
    check('locked page offers the free trial', await p.locator('button:has-text("פתיחת התרגיל בחינם")').isVisible());
    check('locked page does not contain the exercise text', !html1.includes('מה הדרך שעבר הגוף'));
    await p.click('button:has-text("פתיחת התרגיל בחינם")');
    await p.waitForURL(/\/exercise\/e2e-test-1$/);
    await p.locator('input[inputmode=decimal]').waitFor({ timeout: 15000 });
    const html2 = await p.content();
    check('unlocked exercise opens', await p.locator('text=מה הדרך שעבר הגוף').first().isVisible());
    check('correct answer is not in the page', !html2.includes('12.5'), 'page HTML must not contain 12.5');
    check('trial exercise: "12.5" → correct', (await answer(p, '12.5')).includes('נכון!'));

    await p.goto(BASE + '/exercise/e2e-test-2');
    await p.click('button:has-text("פתיחת התרגיל בחינם")');
    await p.waitForURL(/\/exercise\/e2e-test-2$/);
    check('second trial exercise opens', await p.locator('input[inputmode=decimal]').waitFor({ timeout: 15000 }).then(() => true, () => false));

    await p.goto(BASE + '/exercise/e2e-test-3');
    check('third exercise → invitation to subscribe', await p.locator('text=השתמשת בשני התרגילים החינמיים').isVisible());

    // direct API calls cannot bypass the lock
    const r403 = await p.evaluate(async () => (await fetch('/api/answer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ partId: 'e2e-test-3-1', input: '12.5' }) })).status);
    check('API refuses answers for a locked exercise', r403 === 403, String(r403));
    const sol403 = await p.evaluate(async () => (await fetch('/api/solution', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ partId: 'e2e-test-3-1' }) })).status);
    check('API refuses the solution of a locked exercise', sol403 === 403, String(sol403));
    const draft403 = await p.evaluate(async () => (await fetch('/api/solution', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ partId: 'bagrut-1987-q1-1' }) })).status);
    check('API refuses the solution of a draft', draft403 === 403, String(draft403));
    await ctx.close();
  }

  // ---------- anonymous
  {
    const ctx = await b.newContext();
    const p = await ctx.newPage();
    await p.goto(BASE + '/');
    const r = await p.evaluate(async () => (await fetch('/api/answer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ partId: 'e2e-test-1-1', input: '12.5' }) })).status);
    check('anonymous API call → 401', r === 401, String(r));
    await p.goto(BASE + '/exercise/e2e-test-1');
    await p.waitForURL((u) => u.pathname === '/login', { timeout: 15000 }).catch(() => {});
    check('anonymous exercise page → login', p.url().includes('/login'), p.url());
    await ctx.close();
  }

  await b.close();
  check('no browser script errors', errors.length === 0, errors.join(' | '));
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})();
