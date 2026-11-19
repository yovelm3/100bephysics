// End-to-end walk-through of stage 2 against the real Supabase project, using temporary test users.
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
  await p.goto(BASE + '/login?next=/account');
  await p.fill('input[name=email]', email);
  await p.fill('input[name=password]', PW);
  await p.click('button[type=submit]');
  await p.waitForURL(u => u.pathname === '/account' || u.pathname === '/locked', { timeout: 30000 }).catch(() => {});
  await p.waitForLoadState('networkidle').catch(() => {});
  return p;
}

(async () => {
  const b = await chromium.launch();
  const errors = [];

  // ---------- A. anonymous visitor
  {
    const ctx = await b.newContext();
    const p = await ctx.newPage();
    p.on('pageerror', e => errors.push('anon: ' + e.message));
    for (const path of ['/', '/signup', '/login', '/subscribe', '/terms', '/privacy', '/forgot-password', '/locked']) {
      const r = await p.goto(BASE + path);
      check(`anon ${path} loads`, r.status() === 200, String(r.status()));
    }
    await p.goto(BASE + '/signup');
    check('signup shows red device warning', await p.locator('text=אפשר להתחבר מ-5 מכשירים שונים לכל היותר').isVisible());
    check('signup has track choice', (await p.locator('input[name=track]').count()) === 2);
    check('signup has agree checkbox (required)', await p.locator('input[name=agree][required]').count() === 1);
    await p.goto(BASE + '/account');
    await p.waitForURL(u => u.pathname === '/login', { timeout: 15000 }).catch(() => {});
    check('anon /account → login', p.url().includes('/login'), p.url());
    await p.goto(BASE + '/admin');
    await p.waitForURL(u => u.pathname === '/login', { timeout: 15000 }).catch(() => {});
    check('anon /admin → login', p.url().includes('/login'), p.url());
    const r404 = await p.goto(BASE + '/no-such-page');
    check('unknown page → Hebrew 404', r404.status() === 404 && await p.locator('text=הדף לא נמצא').isVisible());
    // wrong password
    await p.goto(BASE + '/login');
    await p.fill('input[name=email]', STUDENT);
    await p.fill('input[name=password]', 'wrong-password-123');
    await p.click('button[type=submit]');
    check('wrong password shows Hebrew error', await p.locator('text=המייל או הסיסמה לא נכונים').waitFor({ timeout: 10000 }).then(() => true, () => false));
    await ctx.close();
  }

  // ---------- B. student logs in on device 1
  const studentCtxs = [];
  {
    const ctx = await b.newContext();
    studentCtxs.push(ctx);
    const p = await login(ctx, STUDENT);
    p.on('pageerror', e => errors.push('student: ' + e.message));
    check('student login → /account', p.url().endsWith('/account'), p.url());
    check('account shows email', await p.locator(`text=${STUDENT}`).isVisible());
    check('account shows no subscription', await p.locator('text=אין לך עדיין מנוי').isVisible());
    check('account shows 1/5 devices', await p.locator('text=(1/5)').isVisible());
    const cookies = await ctx.cookies();
    const dev = cookies.find(c => c.name === 'bp_device');
    check('device cookie is httpOnly', !!dev && dev.httpOnly, dev ? 'httpOnly=' + dev.httpOnly : 'missing');
    const backup = await p.evaluate(() => localStorage.getItem('bp_device'));
    check('device key backed up in localStorage', !!dev && backup === dev.value);
    check('student has no admin link', (await p.locator('header >> text=ניהול').count()) === 0);
    await p.goto(BASE + '/admin');
    check('student /admin → "page not found"', await p.locator('text=הדף לא נמצא').waitFor({ timeout: 15000 }).then(() => true, () => false));
    // cookie cleared but localStorage kept → same device, not a new one
    await ctx.clearCookies({ name: 'bp_device' });
    await p.goto(BASE + '/device?next=/account');
    await p.waitForURL(u => u.pathname === '/account', { timeout: 15000 }).catch(() => {});
    check('cookie restored from localStorage, still 1/5', await p.locator('text=(1/5)').isVisible());
  }

  // ---------- C. devices 2..5 ok, device 6 locks
  for (let i = 2; i <= 6; i++) {
    const ctx = await b.newContext();
    studentCtxs.push(ctx);
    const p = await login(ctx, STUDENT);
    if (i < 6) check(`device ${i} allowed`, p.url().endsWith('/account'), p.url());
    else check('device 6 → /locked', p.url().endsWith('/locked'), p.url());
  }
  {
    const p = await studentCtxs[0].newPage();
    await p.goto(BASE + '/account');
    await p.waitForURL(u => u.pathname === '/locked', { timeout: 15000 }).catch(() => {});
    check('after lock, device 1 is also blocked', p.url().endsWith('/locked'), p.url());
  }

  // ---------- D. admin
  {
    const ctx = await b.newContext();
    const p = await login(ctx, ADMIN);
    p.on('pageerror', e => errors.push('admin: ' + e.message));
    check('admin login → /account', p.url().endsWith('/account'), p.url());
    check('admin header shows ניהול', await p.locator('header >> text=ניהול').isVisible());
    const r = await p.goto(BASE + '/admin');
    check('admin page loads', r.status() === 200, String(r.status()));
    const cardOf = () => p.locator('div.rounded-2xl', { hasText: STUDENT });
    const card = cardOf();
    check('admin sees student as locked', await card.locator('text=נעול').first().isVisible());
    await card.locator('details summary').click();
    check('admin sees 6 student devices', await card.locator('text=(6)').isVisible());
    await card.locator('button:has-text("שחרור נעילה")').click();
    await p.waitForLoadState('networkidle');
    await p.waitForTimeout(1500);
    const card2 = cardOf();
    check('after unlock, no lock badge', (await card2.locator('text=נעול מ-').count()) === 0);
    await card2.locator('button:has-text("הפעלת מנוי")').click();
    await p.waitForTimeout(2000);
    await p.reload();
    const card3 = cardOf();
    check('admin granted subscription', await card3.locator('text=מנוי עד').isVisible());
    await card3.locator('select[name=track]').selectOption('mechina');
    await card3.locator('button:has-text("שמירה")').click();
    await p.waitForTimeout(2000);
    await p.reload();
    const card4 = cardOf();
    check('admin changed track', (await card4.locator('select[name=track]').inputValue()) === 'mechina');
    // search
    await p.fill('input[name=q]', 'e2e-student');
    await p.click('button:has-text("חיפוש")');
    await p.waitForTimeout(1500);
    check('admin search filters', (await p.locator('text=e2e-admin@100bephysics.test').count()) === 0 && (await p.locator(`text=${STUDENT}`).count()) > 0);
    await ctx.close();
  }

  // ---------- E. student after unlock + subscription
  {
    const ctx = await b.newContext();
    const p = await login(ctx, STUDENT);
    check('student after unlock → /account', p.url().endsWith('/account'), p.url());
    check('student sees active subscription', await p.locator('text=המנוי פעיל עד').isVisible());
    check('student device list reset to 1/5', await p.locator('text=(1/5)').isVisible());
    // logout
    await p.click('button:has-text("התנתקות")');
    await p.waitForTimeout(1500);
    await p.goto(BASE + '/account');
    await p.waitForURL(u => u.pathname === '/login', { timeout: 15000 }).catch(() => {});
    check('logout works', p.url().includes('/login'), p.url());
    await ctx.close();
  }

  for (const c of studentCtxs) await c.close().catch(() => {});
  await b.close();
  check('no browser script errors', errors.length === 0, errors.join(' | '));
  const failed = results.filter(r => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})();
