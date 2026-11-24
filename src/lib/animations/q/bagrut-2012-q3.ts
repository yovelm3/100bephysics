import { body, type Story } from "../engine";
import { askLabel, askWidth, fallPhase, storySpec } from "../kits";

/**
 * 2012 q3: a ball shot down a smooth track at v0 = 2 m/s from h above a table (H = 1.25 m); it leaves level at the
 * edge B and lands x from it: x² = (2H/g)v0² + 4Hh. Runs drawn for h = 0, 0.5, 1 m; the story starts at B.
 */
const g = 10, H = 1.25, v0 = 2;
const run = (h: number): Story => ({ init: { b: body(0, H, Math.sqrt(v0 * v0 + 2 * g * h), 0) }, phases: [fallPhase({ end: "land", body: "b", toY: 0 })], record: { x2: ["land", (s) => s.b.x ** 2] } });
export const spec = storySpec({
  id: "bagrut-2012-q3",
  view: { x0: -1.2, x1: 2.4, y0: -0.15, y1: 1.65 },
  scale: 2,
  scenarios: { h0: run(0), h5: run(0.5), h10: run(1) },
  order: { h0: ["land"], h5: ["land"], h10: ["land"] },
  answers: { "h0.x2": [((2 * H) / g) * v0 * v0, 1e-9], "h10.x2": [((2 * H) / g) * v0 * v0 + 4 * H, 1e-9] },
  parts: [
    { to: (m) => m.events["h10.land"], pace: 2, caption: "הוכיחו ש-x² = (2H/g)v0² + 4Hh." },
    { to: (m) => m.events["h10.land"], pace: 2, caption: "למה 4H הוא השיפוע של הגרף של x² כפונקציה של h?" },
    { to: (m) => m.events["h10.land"], pace: 2, caption: "לפי הגרף: מה גובה השולחן H?" },
    { to: (m) => m.events["h10.land"], pace: 2, caption: "לפי הגרף: מה המהירות ההתחלתית v0?" },
    { to: (m) => m.events["h5.land"], pace: 2, caption: "h = 0.5 m. כשהכדור עוזב את המסילה, משחררים כדור שני מאותו גובה. מי מגיע לרצפה קודם?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -1.1, 2.3);
    P.poly([[-1.0, 0], [0, 0], [0, H - 0.01], [-1.0, H - 0.01]]);
    P.poly([[-0.8, H + 0.35], [-0.4, H + 0.04], [0, H + 0.01]], { close: false, fill: "none", tone: "line", w: 2.4 });
    const keys = part === 4 ? ["h5"] : ["h0", "h5", "h10"];
    keys.forEach((k, i) => {
      const b = m.state(Math.min(t, m.events[`${k}.land`]))[`${k}.b`];
      P.circle(b.x, b.y + 0.03, 6, { fill: (["body", "b2", "runner"] as const)[part === 4 ? 1 : i] });
      if (t >= m.events[`${k}.land`] - 1e-9 && part === 0) askWidth(P, 0, b.x, 0, "x", 18 + i * 14);
    });
    if (part === 4) { const y2 = Math.max(0, H - 0.5 * g * t * t); P.circle(1.6, y2 + 0.03, 6, { fill: "runner" }); askLabel(P, 1.0, 1.4, "?", 0, 0); }
    if (part === 1) askLabel(P, 1.0, 1.4, "slope = 4H ?", 0, 0);
    if (part === 2) askLabel(P, 0, H / 2, "H = ?", 20, 0);
    if (part === 3) askLabel(P, 0, H, "v0 = ?", 20, -20);
  },
});
