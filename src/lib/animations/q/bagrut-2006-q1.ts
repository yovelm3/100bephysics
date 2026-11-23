import { body, type Model, type State } from "../engine";
import { askLabel, askWidth } from "../kits";
import { storyFormula, storySimulation, type AnimSpec, type Story } from "../engine";

/** 2006 q1: a race of two cars from rest; A by graph A to the finish at 60 s (450 m); B by graph B for 30 s, then constant acceleration, finishing 2 s before A. */
const aB = 40 / 392;
// each car: phases of constant acceleration (slopes of its graph)
const seg = (end: string, a: number, dur: number) => ({ end, acc: { c: [a, 0] as [number, number] }, dur: () => dur, force: () => ({ c: [a, 0] as [number, number] }), until: (_s: State, t: number, t0: number) => t - t0 >= dur - 1e-12 });
const A: Story = { init: { c: body(0, 0) }, phases: [seg("a1", 0.6, 10), seg("a30", 0.1, 20), seg("a2", 0.1, 20), seg("finish", 0, 10)], record: { x30: ["a30", (s) => s.c.x] } };
const B: Story = {
  init: { c: body(0, 0) },
  phases: [seg("b1", 0.2, 10), seg("b30", 0.4, 20), { end: "finish", acc: { c: [aB, 0] }, dur: () => 28, force: () => ({ c: [aB, 0] }), until: (s) => s.c.x >= 450 }],
  record: { x30: ["b30", (s) => s.c.x], xEnd: ["finish", (s) => s.c.x] },
};
const both = (f: (s: Story) => Model): Model => {
  const a = f(A), b = f(B);
  return {
    state: (t) => ({ a: a.state(t).c, b: b.state(t).c }),
    events: { ...Object.fromEntries(Object.entries(a.events).map(([k, v]) => [`A.${k}`, v])), ...Object.fromEntries(Object.entries(b.events).map(([k, v]) => [`B.${k}`, v])), ...(f === storyFormula ? { pass: passTime() } : {}) },
    values: { ...Object.fromEntries(Object.entries(a.values).map(([k, v]) => [`A.${k}`, v])), ...Object.fromEntries(Object.entries(b.values).map(([k, v]) => [`B.${k}`, v])) },
  };
};
// build 1 of the moment B passes A: closed form inside the last segments (B's third phase vs A's second/third)
function passTime() {
  // B after 30 s: x = 130 + 10 u + aB u²/2 ; A between 30 and 50 s: x = 170 + 8 u + 0.05 u²
  const qa = aB / 2 - 0.05, qb = 10 - 8, qc = 130 - 170;
  return 30 + (-qb + Math.sqrt(qb * qb - 4 * qa * qc)) / (2 * qa);
}
const sim = (): Model => {
  const m = both(storySimulation);
  // build 2 of the passing moment: from the two simulated tracks, where B gets ahead after the start
  let tp = NaN;
  for (let t = 1; t <= 58; t += 1e-3) { const s = m.state(t); if (s.b.x > s.a.x) { tp = t; break; } }
  m.events.pass = tp;
  return m;
};
export const spec: AnimSpec = {
  id: "bagrut-2006-q1",
  view: { x0: -15, x1: 470, y0: -40, y1: 60 },
  scale: 450,
  formula: () => both(storyFormula),
  simulation: sim,
  order: [["A.a1", "B.b1"], ["A.a30", "B.b30"], "pass", "A.a2", "B.finish", "A.finish"] as never,
  tolTime: 3e-3,
  answers: { "A.x30": [170, 1e-9], "B.x30": [130, 1e-9], "B.finish": [58, 1e-9] },
  parts: [
    { to: (m) => m.events["A.finish"], pace: 0.15, caption: "מכונית א' נוסעת לפי גרף א. מה התאוצה שלה בכל קטע?" },
    { to: (m) => m.events["A.finish"], pace: 0.15, caption: "מכונית א' מגיעה לקו הסיום. איזה מרחק היא עברה?" },
    { to: () => 30, pace: 0.15, caption: "שלושים השניות הראשונות: איזה מרחק עברה כל מכונית?" },
    { to: (m) => m.events["A.finish"], pace: 0.15, caption: "מכונית ב' מסיימת שתי שניות לפני א'. האם היה רגע שבו הן היו באותו מקום?" },
    { from: () => 30, to: (m) => m.events["B.finish"], pace: 0.15, caption: "מ-30 שניות ועד קו הסיום מכונית ב' מאיצה באופן קבוע. מה התאוצה שלה?" },
  ],
  draw: (P, m, t, part) => {
    P.line(-10, 0, 465, 0, { tone: "soft", w: 2 }); P.line(-10, 25, 465, 25, { tone: "soft", w: 2 });
    P.line(450, -10, 450, 40, { tone: "line", w: 3 }); P.heb(450, 40, "סיום", { size: 12, dyPx: -6 });
    const s = m.state(t);
    P.cart(s.a.x, 25, { label: "א'" });
    P.cart(s.b.x, 0, { label: "ב'", tone: "b2" });
    if (part === 0) askLabel(P, s.a.x, 25, "a = ?", -20, -34);
    if (part === 1 && t >= m.events["A.finish"] - 1e-9) askWidth(P, 0, 450, 25, "d = ?", -40);
    if (part === 2 && t >= 30 - 1e-9) { askWidth(P, 0, s.a.x, 25, "?", -30); askWidth(P, 0, s.b.x, 0, "?", 26); }
    if (part === 3) askLabel(P, 200, 0, "באותו מקום?", 0, 40);
    if (part === 4) askLabel(P, s.b.x, 0, "a = ?", -20, 34);
  },
};
