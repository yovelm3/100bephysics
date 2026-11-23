import { body, simulate, type AnimSpec, type Model, type State } from "../engine";
import { askLabel } from "../kits";

/**
 * 2013 q2: a 10 kg body falls from rest from a tall tower; air drag f = k·v², k = 0.25, so the speed approaches 20 m/s.
 * The tower height is not given; 100 m is drawn. Build 1: v = vT·tanh(g t / vT), y = H − (vT²/g)·ln cosh(g t / vT).
 * Build 2: a = g − k v² / m, step by step.
 */
const g = 10, m = 10, k = 0.25, H = 100;
const vT = Math.sqrt((m * g) / k);

const formula = (): Model => {
  const at = (t: number) => ({ y: H - ((vT * vT) / g) * Math.log(Math.cosh((g * t) / vT)), v: vT * Math.tanh((g * t) / vT) });
  const tHalf = (vT / g) * Math.atanh(0.5);
  const tHit = (vT / g) * Math.acosh(Math.exp((H * g) / (vT * vT)));
  const state = (t: number): State => { const tt = Math.min(Math.max(t, 0), tHit), s = at(tt); return { b: body(0, s.y, 0, -s.v) }; };
  return { state, events: { half: tHalf, hit: tHit }, values: { vT, vHit: at(tHit).v } };
};

const simulation = (): Model => {
  const res = simulate({
    init: { b: body(0, H, 0, 0) },
    accel: (s) => ({ b: { ax: 0, ay: -g + (k * s.b.vy * s.b.vy) / m } }),
    events: [
      { name: "half", when: (s) => -s.b.vy >= vT / 2 },
      { name: "hit", when: (s) => s.b.y <= 0, stop: true, record: (s) => ({ vHit: -s.b.vy }) },
    ],
    tMax: 20,
    dt: 1e-5,
  });
  // the speed that the fall settles at: where the drag equals the weight (the acceleration is zero)
  res.model.values.vT = Math.sqrt((m * g) / k);
  return res.model;
};

export const spec: AnimSpec = {
  id: "bagrut-2013-q2",
  view: { x0: -60, x1: 60, y0: -6, y1: 112 },
  formula,
  simulation,
  order: ["half", "hit"],
  scale: H,
  answers: { vT: [20, 1e-9] },
  parts: [
    { to: (mm) => mm.events.hit, pace: 0.8, caption: "על הגוף פועלים כוח הכובד וכוח החיכוך עם האוויר, f = kv². מה היחידות של k?" },
    { to: (mm) => mm.events.hit, pace: 0.8, caption: "המהירות גדלה פחות ופחות. מהי מהירות סופית?" },
    { to: (mm) => mm.events.hit, pace: 0.8, caption: "אילו כוחות פועלים על הגוף? למה ייתכן שמרגע מסוים הוא נופל במהירות קבועה?" },
    { to: (mm) => mm.events.hit, pace: 0.8, caption: "k = 0.25, m = 10 kg. מה המהירות הקבועה שהגוף מגיע אליה?" },
    { to: (mm) => mm.events.hit, pace: 0.8, caption: "איך נראה גרף המהירות כפונקציה של הזמן, מהשחרור עד הפגיעה?" },
  ],
  draw: (P, mm, t, part) => {
    P.ground(0, -55, 55);
    P.poly([[-40, 0], [-12, 0], [-12, H], [-40, H]]);
    const s = mm.state(t).b, v = -s.vy;
    P.ball(0, s.y, { rPx: 9 });
    const c = s.y + 1.2;
    if (part === 2) {
      P.arrowPx(0, c, 0, 46, { tone: "ask", label: "?" });
      P.arrowPx(0, c + 2, 0, -46, { tone: "ask", label: "?" });
    } else {
      P.arrowPx(0, c, 0, 46, { tone: "force", label: "mg" });
      const fPx = (46 * (k * v * v)) / (m * g);
      if (fPx > 4) P.arrowPx(0, c + 2, 0, -fPx, { tone: "force", label: "f" });
    }
    if (v > 0.3) P.arrowPx(16, c, 0, v * 2.6, { tone: "vel", label: "v" });
    if (part === 0) askLabel(P, 0, s.y, "[k] = ?", 60, -10);
    if (part === 1) askLabel(P, 0, s.y, "?", 60, -10);
    if (part === 3) askLabel(P, 16, s.y, "v = ?", 40, 40);
    if (part === 4) askLabel(P, 16, s.y, "v(t) ?", 40, 40);
  },
};
