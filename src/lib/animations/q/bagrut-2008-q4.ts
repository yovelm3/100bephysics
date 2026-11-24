import { body, type Phase, type Story } from "../engine";
import { askLabel, askSpan, askWidth, fallPhase, storySpec } from "../kits";

/**
 * 2008 q4: a smooth track from A (45 cm above the table) to B, horizontal at its end; the table is 80 cm high.
 * Ball 1 leaves B at 3 m/s and lands at D (1.2 m from C); it bounces elastically back up to 0.8 m.
 * Part ד: an equal ball 2 at B, plastic: 1.5 m/s. Part ה: an equal ball 3, elastic head-on: ball 3 leaves at 3 m/s.
 * The story starts at B.
 */
const g = 10, H = 0.8, v = 3;
const top: Phase = { end: "top", acc: { b: [0, -g] }, dur: (s) => s.b.vy / g, force: () => ({ b: [0, -g] }), until: (s) => s.b.vy <= 0 };
const flight = (v0: number, bounce: boolean): Story => ({
  init: { b: body(0, H, v0, 0) },
  phases: [
    { ...fallPhase({ end: "land", body: "b", toY: 0 }), jump: bounce ? (s) => { s.b.vy = -s.b.vy; } : (s) => { s.b.vx = 0; s.b.vy = 0; } },
    ...(bounce ? [top] : []),
  ],
  record: bounce ? { d: ["land", (s) => s.b.x], h: ["top", (s) => s.b.y] } : { d: ["land", (s) => s.b.x] },
});
export const spec = storySpec({
  id: "bagrut-2008-q4",
  view: { x0: -1.0, x1: 3.0, y0: -0.1, y1: 1.9 },
  scale: 2,
  scenarios: { one: flight(v, true), two: flight(v / 2, false), three: flight(v, false) },
  order: { one: ["land", "top"], two: ["land"], three: ["land"] },
  answers: { "one.d": [1.2, 1e-9], "one.h": [0.8, 1e-9], "two.d": [0.6, 1e-9] },
  parts: [
    { to: (m) => m.events["one.land"], pace: 2, caption: "מ-B עד D: איזו תנועה יש לכדור בכיוון האופקי, ואיזו בכיוון האנכי?" },
    { to: (m) => m.events["one.land"], pace: 2, caption: "מה המרחק CD?" },
    { to: (m) => m.events["one.top"], pace: 2, caption: "הכדור מתנגש ברצפה התנגשות אלסטית. לאיזה גובה מרבי הוא עולה?" },
    { to: (m) => m.events["two.land"], pace: 2, caption: "כדור 2 עומד ב-B, וההתנגשות פלסטית. מה המרחק מ-C לנקודה שבה הכדורים פוגעים ברצפה?" },
    { to: () => 0.02, pace: 2, caption: "כדור 3 עומד ב-B, וההתנגשות חזיתית ואלסטית. האם ייתכן שכדור 3 ינחת רחוק יותר מ-D?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -0.9, 2.9);
    P.poly([[-0.9, 0], [0, 0], [0, H], [-0.9, H]]);
    P.poly([[-0.8, H + 0.45], [-0.45, H + 0.06], [0, H + 0.02]], { close: false, fill: "none", tone: "line", w: 2.4 });
    P.mono(-0.8, H + 0.45, "A", { tone: "data", size: 12, dxPx: -10 }); P.mono(0, H, "B", { tone: "data", size: 12, dyPx: -14 });
    P.mono(0, 0, "C", { tone: "data", size: 12, dyPx: 16 }); P.mono(1.2, 0, "D", { tone: "data", size: 12, dyPx: 16 });
    const key = part === 3 ? "two" : part === 4 ? "three" : "one";
    const b = m.state(t)[`${key}.b`];
    P.circle(b.x, b.y + 0.03, 6, { fill: part === 3 ? "b2" : "body" });
    if (part === 0) { P.arrowPx(b.x, b.y, b.vx * 14, 0, { tone: "vel", label: "vx" }); P.arrowPx(b.x, b.y, 0, -b.vy * 14, { tone: "vel", label: "vy" }); askLabel(P, b.x, b.y, "?", 20, -20); }
    if (part === 1 && t >= m.events["one.land"] - 1e-9) askWidth(P, 0, b.x, 0, "CD = ?", 30);
    if (part === 2 && t >= m.events["one.top"] - 1e-9) askSpan(P, b.x + 0.15, 0, b.y, "h = ?", 0);
    if (part === 3 && t >= m.events["two.land"] - 1e-9) askWidth(P, 0, b.x, 0, "d = ?", 30);
    if (part === 4) askLabel(P, 1.2, 0, "d > CD ?", 0, -30);
  },
});
