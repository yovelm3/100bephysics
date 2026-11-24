import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1997 q3: a 0.46 kg cart hits a force sensor at the end of the table and comes back: 3.0 cm in 0.090 s before,
 * 3.0 cm in 0.102 s after. The sensor's force graph (data from the question, in ms) is drawn beside it.
 * The bounce is drawn as instant at the sensor (it lasts a few ms).
 */
const m = 0.46, v1 = 0.03 / 0.09, v2 = 0.03 / 0.102;
export const spec = storySpec({
  id: "bagrut-1997-q3",
  view: { x0: -0.05, x1: 0.35, y0: -0.07, y1: 0.13 },
  scale: 0.3,
  story: {
    init: { c: body(0, 0, v1, 0) },
    phases: [
      { end: "hit", acc: {}, dur: () => 0.25 / v1, force: () => ({}), until: (s) => s.c.x >= 0.25, jump: (s) => { s.c.vx = -v2; } },
      { end: "end", acc: {}, dur: () => 0.5, force: () => ({}), until: (_s, t, t0) => t - t0 >= 0.5 - 1e-12 },
    ],
    record: { dp: ["hit", (s) => m * (v1 - s.c.vx)] },
  },
  order: ["hit", "end"],
  answers: { dp: [0.28862745098039216, 1e-9] },
  parts: [
    { to: (mm) => mm.events.end, pace: 2, caption: "לפי הגרף של הכוח: מה המתקף שהחיישן הפעיל על הקרונית?" },
    { to: (mm) => mm.events.end, pace: 2, caption: "בלי הגרף: מה השינוי בתנע של הקרונית, לפי המהירויות לפני ואחרי?" },
    { to: (mm) => mm.events.end, pace: 2, caption: "מה יכולות להיות שתי סיבות לאי-הדיוק בתוצאות?" },
    { to: (mm) => mm.events.end, pace: 2, caption: "האם בזמן שבגרף הייתה רגע שבו מהירות הקרונית אפס?" },
  ],
  draw: (P, mm, t, part) => {
    P.line(-0.04, 0, 0.29, 0, { tone: "line", w: 2 });
    P.block(0.29, 0, { wPx: 14, hPx: 40, base: true, tone: "line" });
    P.heb(0.29, 0.07, "חיישן", { tone: "data", size: 10 });
    const c = mm.state(t).c;
    P.cart(c.x - 0.02, 0, { wPx: 50 });
    P.arrowPx(c.x - 0.02, 0.05, c.vx * 180, 0, { tone: "vel", label: "v" });
    // the force graph of the question (a hump over ~40 ms), shown as given
    const G = P.graph({ xPx: 60, yPx: 210, wPx: 260, hPx: 110, tMax: 50, vMin: 0, vMax: 12, xLabel: "t (ms)", yLabel: "F (N)" });
    P.path(Array.from({ length: 41 }, (_, i) => { const tt = 5 + i; return [G.gx(tt), G.gy(10 * Math.sin((Math.PI * i) / 40) ** 2)] as [number, number]; }), { tone: "body", w: 2.2 });
    if (part === 0) askLabel(P, 0.08, -0.05, "J = ?", 0, 0);
    if (part === 1 && t >= mm.events.hit) askLabel(P, c.x, 0.05, "Δp = ?", 20, -16);
    if (part === 2) askLabel(P, 0.15, 0.1, "?", 0, 0);
    if (part === 3) askLabel(P, 0.27, 0.05, "v = 0 ?", -20, -16);
  },
});
