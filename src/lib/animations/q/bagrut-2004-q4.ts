import { body, simulate, type AnimSpec, type Model, type State } from "../engine";
import { askLabel } from "../kits";

/**
 * 2004 q4: two 2 kg carts held with a compressed spring between them (touching, not attached); let go, they leave the
 * spring. Drawn: k = 100 N/m, 4 cm compression (0.08 J), so 0.2 m/s each. Part ד: 1 kg more on cart 2.
 * Build 1: the compression is x0·cos(ωt), ω = √(k/μ), until it is zero; build 2: the spring force, step by step.
 */
const k = 100, x0 = 0.04, L0 = 0.3, tEnd = 1.6;
const run = (m1: number, m2: number) => {
  const mu = (m1 * m2) / (m1 + m2), w = Math.sqrt(k / mu), tau = Math.PI / (2 * w);
  const formula = (): Model => {
    const state = (tq: number): State => {
      const t = Math.min(Math.max(tq, 0), tEnd), u = Math.min(t, tau);
      const s = x0 * Math.cos(w * u), ds = -x0 * w * Math.sin(w * u); // compression, and its rate
      const d = L0 - s; // the gap between the carts' faces
      const xa = -(m2 / (m1 + m2)) * d, xb = (m1 / (m1 + m2)) * d;
      const va = (m2 / (m1 + m2)) * ds, vb = -(m1 / (m1 + m2)) * ds;
      const rest = t - u;
      return { a: body(xa + va * rest, 0, va, 0), b: body(xb + vb * rest, 0, vb, 0) };
    };
    const vSep = x0 * w;
    return { state, events: { free: tau, end: tEnd }, values: { v1: (m2 / (m1 + m2)) * vSep, v2: (m1 / (m1 + m2)) * vSep, K: 0.5 * k * x0 * x0 } };
  };
  const simulation = (): Model => {
    const comp = (s: State) => L0 - (s.b.x - s.a.x);
    const res = simulate({
      init: { a: body(-(m2 / (m1 + m2)) * (L0 - x0), 0, 0, 0), b: body((m1 / (m1 + m2)) * (L0 - x0), 0, 0, 0) },
      accel: (s) => { const F = Math.max(0, k * comp(s)); return { a: { ax: -F / m1, ay: 0 }, b: { ax: F / m2, ay: 0 } }; },
      events: [
        { name: "free", when: (s) => comp(s) <= 0, record: (s) => ({ v1: -s.a.vx, v2: s.b.vx, K: 0.5 * m1 * s.a.vx ** 2 + 0.5 * m2 * s.b.vx ** 2 }) },
        { name: "end", when: (_s, t) => t >= tEnd - 1e-12, stop: true },
      ],
      tMax: tEnd + 0.1,
      dt: 1e-5,
    });
    return res.model;
  };
  return { formula, simulation };
};
const eq = run(2, 2), heavy = run(2, 3);
const join = (b: "formula" | "simulation") => (): Model => {
  const A = eq[b](), B = heavy[b]();
  const pre = (o: Record<string, number>, p: string) => Object.fromEntries(Object.entries(o).map(([k2, v]) => [`${p}.${k2}`, v]));
  return {
    state: (t) => { const a = A.state(t), c = B.state(t); return { "eq.a": a.a, "eq.b": a.b, "hv.a": c.a, "hv.b": c.b }; },
    events: { ...pre(A.events, "eq"), ...pre(B.events, "hv") },
    values: { ...pre(A.values, "eq"), ...pre(B.values, "hv") },
  };
};
export const spec: AnimSpec = {
  id: "bagrut-2004-q4",
  view: { x0: -0.6, x1: 0.6, y0: -0.25, y1: 0.35 },
  formula: join("formula"),
  simulation: join("simulation"),
  order: ["eq.free", "hv.free", ["eq.end", "hv.end"]],
  scale: 0.4,
  answers: { "eq.v2": [0.2, 1e-9], "eq.K": [0.08, 1e-9], "hv.v2": [0.1460593486680443, 1e-9] },
  parts: [
    { to: (m) => m.events["eq.free"] + 0.2, pace: 6, caption: "משחררים את העגלות. אילו גדלים נשמרים, מהמצב ההתחלתי ועד שהעגלות עוזבות את הקפיץ?" },
    { to: () => tEnd, pace: 2, caption: "אחרי שעגלה 1 עוזבת את הקפיץ, המהירות שלה 0.2 m/s. מה המהירות של עגלה 2?" },
    { to: () => tEnd, pace: 2, caption: "מה האנרגיה הקינטית של שתי העגלות יחד אחרי שהן עוזבות את הקפיץ?" },
    { to: () => tEnd, pace: 2, caption: "מוסיפים לעגלה 2 משקולת של 1 ק\"ג. מה היחס בין המהירויות של העגלות?" },
    { to: () => tEnd, pace: 2, caption: "מה המהירות של עגלה 2 במקרה הזה?" },
  ],
  draw: (P, m, t, part) => {
    const key = part >= 3 ? "hv" : "eq";
    const s = m.state(t), a = s[`${key}.a`], b = s[`${key}.b`];
    P.line(-0.58, 0, 0.58, 0, { tone: "line", w: 2 });
    const free = t >= m.events[`${key}.free`] - 1e-9;
    P.spring(a.x + 0.06, 0.06, free ? a.x + 0.06 + L0 - 0.12 : b.x - 0.06, 0.06, { coils: 8, ampPx: 6 });
    P.cart(a.x - 0.02, 0, { wPx: 60, label: "1" });
    P.cart(b.x + 0.02, 0, { wPx: 60, label: "2", tone: "b2" });
    if (part >= 3) P.block(b.x + 0.02, 0.08, { wPx: 26, hPx: 14, tone: "runner" });
    if (free) { P.arrowPx(a.x, 0.18, a.vx * 300, 0, { tone: "vel", label: "v₁" }); P.arrowPx(b.x, 0.18, b.vx * 300, 0, { tone: "vel", label: "v₂" }); }
    if (part === 0) askLabel(P, 0, 0.25, "const ?", 0, 0);
    if ((part === 1 || part === 4) && free) askLabel(P, b.x, 0.18, "v₂ = ?", 20, -14);
    if (part === 2 && free) askLabel(P, 0, 0.28, "K = ?", 0, 0);
    if (part === 3 && free) askLabel(P, 0, 0.28, "v₂ / v₁ = ?", 0, 0);
  },
};
