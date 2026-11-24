import { simulate, body, type AnimSpec, type Model, type State } from "../engine";
import { askLabel } from "../kits";

/**
 * 1996 q4: a board M hangs on a spring K (stretched d = Mg/K at rest). Pulled down A and let go, it oscillates; as it
 * passes the rest point on its way down, a bullet going up hits it and passes through, and the board stops there.
 * Drawn: M = 1 kg, K = 100 N/m, A = 0.1 m. Build 1: y = −A·cos(ωt); build 2: the spring's pull minus the weight.
 * The model's b.y is the board's place relative to the rest point (up positive).
 */
const M = 1, K = 100, A = 0.1, g = 10;
const w = Math.sqrt(K / M), T = (2 * Math.PI) / w, tHit = (3 * T) / 4;
const formula = (): Model => {
  const state = (t: number): State => {
    const tt = Math.max(0, t);
    if (tt >= tHit) return { b: body(0, 0, 0, 0) };
    return { b: body(0, -A * Math.cos(w * tt), 0, A * w * Math.sin(w * tt)) };
  };
  return { state, events: { up: T / 4, hit: tHit, end: tHit + 0.4 }, values: { vHit: -A * w } };
};
const simulation = (): Model => {
  let stopped = false;
  const res = simulate({
    init: { b: body(0, -A, 0, 0) },
    // spring stretched d − y (d = Mg/K), weight down
    accel: (s) => (stopped ? { b: { ax: 0, ay: 0 } } : { b: { ax: 0, ay: (K * ((M * g) / K - s.b.y) - M * g) / M } }),
    events: [
      { name: "up", when: (s) => s.b.y >= 0 && s.b.vy > 0 },
      { name: "hit", when: (s, _t, f) => f.has("up") && s.b.y <= 0 && s.b.vy < 0, record: (s) => ({ vHit: s.b.vy }), then: (s) => { s.b.vy = 0; s.b.y = 0; stopped = true; } },
      { name: "end", when: (_s, t) => t >= tHit + 0.4, stop: true },
    ],
    tMax: tHit + 1,
    dt: 1e-5,
  });
  return res.model;
};
export const spec: AnimSpec = {
  id: "bagrut-1996-q4",
  view: { x0: -0.4, x1: 0.4, y0: -0.22, y1: 0.18 },
  formula,
  simulation,
  order: ["up", "hit", "end"],
  scale: 0.2,
  answers: { vHit: [-A * w, 1e-9] },
  parts: [
    { to: () => 0.4, pace: 1, caption: "הלוח תלוי על הקפיץ במנוחה, והקפיץ ארוך ב-d מהאורך הרפוי. מה d לפי M ו-K?" },
    { to: (m) => m.events.end, pace: 2, caption: "הלוח מתנודד. כשהוא עובר בנקודת שיווי המשקל בדרכו מטה, קליע עובר דרכו מלמטה, והלוח נעצר. מה v − u?" },
    { to: (m) => m.events.end, pace: 2, caption: "קליע אחר פוגע בלוח כשהוא רחוק מנקודת שיווי המשקל. למה הלוח לא יכול להיעצר ולהישאר במנוחה?" },
  ],
  draw: (P, m, t, part) => {
    P.line(-0.3, 0.16, 0.3, 0.16, { tone: "line", w: 3 });
    const y = part === 0 ? 0 : m.state(t).b.y;
    P.spring(0, 0.16, 0, y + 0.01, { coils: 10, ampPx: 8 });
    P.block(0, y, { wPx: 120, hPx: 10, base: false, tone: "b2" });
    P.line(-0.35, 0, 0.35, 0, { tone: "idle", w: 1, dash: "4 4" });
    if (part === 0) askLabel(P, 0.1, 0.08, "d = ?", 0, 0);
    if (part >= 1) {
      // the bullet comes up from below and meets the board at the rest point
      const tb = m.events.hit, dtb = t - tb;
      if (dtb > -0.03 && dtb < 0.03) P.block(0.08, dtb < 0 ? dtb * 7 : dtb * 4, { wPx: 4, hPx: 12, base: false, tone: "line" });
      if (part === 1 && t >= tb) askLabel(P, 0.08, 0.05, "v − u = ?", 10, 0);
      if (part === 2) askLabel(P, 0.15, y, "?", 10, 0);
    }
  },
};
