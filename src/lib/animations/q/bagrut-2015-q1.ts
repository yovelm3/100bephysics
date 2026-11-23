import { body, type Phase, type State } from "../engine";
import { askLabel, askWidth, storySpec } from "../kits";

/**
 * 2015 q1: GPS dots every 0.5 h (time in hours, distance in km; the clock is hidden). Truck B: 30 km per dot (60 km/h).
 * Truck A: dots at 0, 45.5, 90, 133.6, 149.8, 180 km. A's speed is constant inside each interval and changes smoothly
 * (a short ramp of 0.1 h around each dot), with the ramps' speeds chosen so that every interval covers exactly its distance.
 */
const D = 0.5, W = 0.1;
const xs = [0, 45.5, 90, 133.6, 149.8, 180];
const d = xs.slice(1).map((x, i) => x - xs[i]);
// constant speeds c_i: d_i = c_i·D + (c_{i−1} − c_i)·W/8 + (c_{i+1} − c_i)·W/8 (the ramp halves inside the interval)
let c = d.map((di) => di / D);
for (let it = 0; it < 200; it++) {
  c = c.map((_, i) => {
    let corr = 0, n = 0;
    if (i > 0) { corr += c[i - 1]; n++; }
    if (i < c.length - 1) { corr += c[i + 1]; n++; }
    return (d[i] - (W / 8) * corr) / (D - (W / 8) * n);
  });
}
const vB = 60;
const tick = (k: number) => (s: State) => s.B.x >= 30 * k - 1e-9;
const phases: Phase[] = [];
// the story is timed by truck B (constant speed): B's place tells the time of each dot and ramp
const at = (tq: number) => (s: State) => s.B.x >= vB * tq - 1e-9;
let t = 0;
const step = (end: string, until: number, aA: number, also?: string[]) => {
  const dur = until - t;
  phases.push({ end, acc: { A: [aA, 0] }, dur: () => dur, force: () => ({ A: [aA, 0] }), until: at(until), also });
  t = until;
};
for (let i = 0; i < c.length; i++) {
  const t1 = (i + 1) * D;
  if (i < c.length - 1) {
    step(`A${i}`, t1 - W / 2, 0);
    step(`dot${i + 1}`, t1, (c[i + 1] - c[i]) / W);
    step(`B${i}`, t1 + W / 2, (c[i + 1] - c[i]) / W);
  } else step("dot5", t1, 0);
}
phases[phases.length - 1].jump = (s) => { s.A.vx = 0; };
phases.push({ end: "dot6", acc: {}, dur: () => D, force: () => ({}), until: tick(6) });

const order = phases.map((p) => p.end);
export const spec = storySpec({
  id: "bagrut-2015-q1",
  view: { x0: -14, x1: 196, y0: -60, y1: 45 },
  scale: 180,
  story: {
    init: { A: body(0, 0, c[0], 0), B: body(0, 24, vB, 0) },
    phases,
    record: Object.fromEntries([1, 2, 3, 4, 5].map((k) => [`xA${k}`, [`dot${k}`, (s) => s.A.x]])),
  },
  order,
  answers: { xA1: [45.5, 1e-6], xA2: [90, 1e-6], xA3: [133.6, 1e-6], xA4: [149.8, 1e-6], xA5: [180, 1e-6], dot6: [3, 1e-9] },
  parts: [
    { to: (m) => m.events.dot6, pace: 3, hideClock: true, caption: "משאית B נוסעת מ-M ל-N שלוש שעות. מה המהירות הממוצעת שלה?" },
    { to: (m) => m.events.dot6, pace: 3, hideClock: true, caption: "הנקודות נרשמות בהפרשי זמן שווים. של איזו משאית המהירות הממוצעת בקטע MN גדולה יותר?" },
    { to: (m) => m.events.dot2, pace: 3, hideClock: true, caption: "מה המהירות הממוצעת של משאית A בקטע MP?" },
    { from: (m) => m.events.dot2, to: (m) => m.events.dot5, pace: 3, hideClock: true, caption: "מה המהירות הממוצעת של משאית A בקטע PN?" },
    { to: (m) => m.events.dot6, pace: 3, hideClock: true, caption: "האם יש רגע שבו המהירויות הרגעיות של שתי המשאיות שוות?" },
  ],
  draw: (P, m, tt, part) => {
    P.line(-10, -14, 190, -14, { tone: "line", w: 1 });
    P.line(-10, 12, 190, 12, { tone: "line", w: 1 });
    P.line(-10, 38, 190, 38, { tone: "line", w: 1 });
    for (const [x, lab] of [[0, "M"], [90, "P"], [180, "N"]] as const) { P.line(x, -20, x, 42, { tone: "data", w: 1, dash: "3 3" }); P.mono(x, -20, lab, { tone: "data", size: 13, dyPx: 16 }); }
    P.mono(90, -20, "180 km", { tone: "data", size: 11, dyPx: 34 });
    const s = m.state(tt);
    // the GPS dots recorded so far
    for (let k = 0; k <= 6; k++) {
      const tk = k * D;
      if (tk > tt + 1e-9) break;
      const q = m.state(tk);
      if (k <= 5) P.circle(q.A.x, 0, 4, { fill: "b2" });
      P.circle(q.B.x, 24, 4, { fill: "body" });
    }
    P.mono(-12, 0, "A", { tone: "b2", size: 13, anchor: "end", dyPx: -8 });
    P.mono(-12, 24, "B", { tone: "body", size: 13, anchor: "end", dyPx: -8 });
    P.block(s.A.x, 0, { wPx: 30, hPx: 14, tone: "b2", base: false });
    P.block(s.B.x, 24, { wPx: 30, hPx: 14, base: false });
    if (s.A.vx > 0) P.arrowPx(s.A.x, -8, s.A.vx * 0.6, 0, { tone: "vel", label: "v" });
    P.arrowPx(s.B.x, 32, s.B.vx * 0.6, 0, { tone: "vel", label: "v" });
    if (part === 0 && tt >= m.events.dot6 - 1e-9) askWidth(P, 0, 180, 24, "v̄B = ?", -30);
    if (part === 1 && tt >= m.events.dot6 - 1e-9) askLabel(P, 90, 30, "v̄A ? v̄B", 0, -60);
    if (part === 2 && tt >= m.events.dot2 - 1e-9) askWidth(P, 0, 90, 0, "v̄ = ?", 40);
    if (part === 3 && tt >= m.events.dot5 - 1e-9) askWidth(P, 90, 180, 0, "v̄ = ?", 40);
    if (part === 4) askLabel(P, 90, 30, "vA = vB ?", 0, -60);
  },
});
