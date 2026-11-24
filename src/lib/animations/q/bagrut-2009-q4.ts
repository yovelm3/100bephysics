import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2009 q4: a 0.5 kg box on a rough floor (μk = 0.1, friction 0.5 N). The Ek–x graph: 16 J from 0 to 20 m (so another
 * 0.5 N balances friction), then up to 40 J at 50 m (F1 = 1.3 N), then F1 stops and the box slides to rest after 80 m.
 */
const m = 0.5, f = 0.5, F1 = 1.3;
const v0 = Math.sqrt((2 * 16) / m);
export const spec = storySpec({
  id: "bagrut-2009-q4",
  view: { x0: -5, x1: 140, y0: -10, y1: 62 },
  scale: 130,
  story: {
    init: { b: body(0, 0, v0, 0) },
    phases: [
      { end: "x20", acc: {}, dur: () => 20 / v0, force: () => ({ b: [(f - f) / m, 0] }), until: (s) => s.b.x >= 20 },
      { end: "x50", acc: { b: [(F1 - f) / m, 0] }, dur: (s) => (-s.b.vx + Math.sqrt(s.b.vx ** 2 + 2 * ((F1 - f) / m) * 30)) / ((F1 - f) / m), force: () => ({ b: [(F1 - f) / m, 0] }), until: (s) => s.b.x >= 50 },
      { end: "stop", acc: { b: [-f / m, 0] }, dur: (s) => s.b.vx / (f / m), force: () => ({ b: [-f / m, 0] }), until: (s) => s.b.vx <= 0, jump: (s) => { s.b.vx = 0; } },
    ],
    record: { E50: ["x50", (s) => 0.5 * m * s.b.vx ** 2], Wf: ["stop", (s) => -f * s.b.x] },
  },
  order: ["x20", "x50", "stop"],
  answers: { E50: [40, 1e-9], Wf: [-65, 1e-9] },
  parts: [
    { to: (mm) => mm.events.x20, pace: 0.4, caption: "האנרגיה הקינטית לא משתנה ב-20 המטרים הראשונים. האם פועל עוד כוח אופקי מלבד החיכוך?" },
    { from: (mm) => mm.events.x20, to: (mm) => mm.events.x50, pace: 0.4, caption: "מ-20 עד 50 m פועל גם כוח קבוע F1. מה גודלו?" },
    { to: (mm) => mm.events.stop, pace: 0.4, caption: "ב-50 m הכוח F1 מפסיק. מה העבודה של החיכוך מ-0 עד שהתיבה נעצרת?" },
    { from: (mm) => mm.events.x20, to: (mm) => mm.events.x50, pace: 0.4, caption: "במקום F1 פועל כוח נטוי F2, עם אותו רכיב אופקי. האם העבודה של החיכוך שווה, גדולה או קטנה?" },
    { to: () => 0.5, pace: 0.4, caption: "גוף קטן נע על משטח כלשהו. איזה היגד מתאים לגרף של אנרגיית הגובה מול האנרגיה הקינטית?" },
  ],
  draw: (P, mm, t, part) => {
    const G = P.graph({ xPx: 140, yPx: 22, wPx: 420, hPx: 150, tMax: 135, vMin: 0, vMax: 45, xLabel: "x (m)", yLabel: "Ek (J)" });
    P.path([[G.gx(0), G.gy(16)], [G.gx(20), G.gy(16)], [G.gx(50), G.gy(40)]], { tone: "body", w: 2.2 });
    for (const x of [20, 50]) P.textPx(G.gx(x), G.gy(0) + 13, String(x), { tone: "data", size: 10 });
    for (const e of [16, 40]) P.textPx(136, G.gy(e) + 4, String(e), { tone: "data", size: 10, anchor: "end" });
    const b = mm.state(t).b;
    P.arrowScreen(G.gx(b.x), G.gy(0), G.gx(b.x), G.gy(44), { tone: "idle", w: 1 });
    P.ground(0, -4, 139);
    P.block(b.x, 0, { wPx: 22, hPx: 16 });
    const between = b.x >= 20 && b.x < 50 && b.vx > 0;
    if (between) P.arrowPx(b.x + 3, 3, part === 3 ? 30 : 34, part === 3 ? -18 : 0, { tone: "force", label: part === 3 ? "F2" : "F1" });
    if (b.vx > 0) P.arrowPx(b.x - 3, 3, -14, 0, { tone: "force", label: "f" });
    if (part === 1) askLabel(P, b.x, 0, "F1 = ?", 0, -50);
    if (part === 2 && t >= mm.events.stop - 1e-9) askLabel(P, b.x, 0, "W(f) = ?", 0, -50);
    if (part === 3) askLabel(P, b.x, 0, "W(f) ?", 0, -50);
    if (part === 4) askLabel(P, 60, 20, "(1) (2) (3) ?", 0, 0);
  },
});
