import { body } from "../engine";
import { askLabel, askWidth, storySpec } from "../kits";

/**
 * 2016 q1: the cat accelerates at 1 m/s² for 2 s, runs at 2 m/s for 5 s, then stops in 1 s at B (13 m from A).
 * The toy starts at A at the same moment, slides with friction only, and stops at B 1.5 s before the cat (at 6.5 s): v0 = 4 m/s.
 * Part ה: twice the friction coefficient.
 */
const g = 10;
const tToy = 6.5, dAB = 13;
const v0 = (2 * dAB) / tToy;
const mu = v0 / tToy / g;
const toyStop = (end: string, k: number) => ({
  end,
  acc: { toy: [-k * mu * g, 0] as [number, number] },
  dur: (s: Record<string, { vx: number }>) => s.toy.vx / (k * mu * g),
  force: () => ({ toy: [-k * mu * g, 0] as [number, number] }),
  until: (s: Record<string, { vx: number }>) => s.toy.vx <= 0,
  jump: (s: Record<string, { vx: number }>) => { s.toy.vx = 0; },
});
export const spec = storySpec({
  id: "bagrut-2016-q1",
  view: { x0: -1.2, x1: 15.2, y0: -3.6, y1: 4 },
  scale: 13,
  scenarios: {
    base: {
      init: { cat: body(0, 0, 0, 0), toy: body(0, 1.8, v0, 0) },
      phases: [
        { end: "catTop", acc: { cat: [1, 0], toy: [-mu * g, 0] }, dur: () => 2, force: () => ({ cat: [1, 0], toy: [-mu * g, 0] }), until: (s) => s.cat.vx >= 2 },
        { ...toyStop("toyStop", 1), acc: { toy: [-mu * g, 0] } },
        { end: "catBrake", acc: {}, dur: (s) => (dAB - 1 - s.cat.x) / 2, force: () => ({}), until: (s) => s.cat.x >= dAB - 1 },
        { end: "catStop", acc: { cat: [-2, 0] }, dur: () => 1, force: () => ({ cat: [-2, 0] }), until: (s) => s.cat.vx <= 0, jump: (s) => { s.cat.vx = 0; } },
      ],
      record: { xB: ["catStop", (s) => s.cat.x], xToy: ["toyStop", (s) => s.toy.x] },
    },
    double: {
      init: { toy: body(0, 1.8, v0, 0) },
      phases: [toyStop("toyStop", 2)],
    },
  },
  order: { base: ["catTop", "toyStop", "catBrake", "catStop"], double: ["toyStop"] },
  answers: { "base.xB": [13, 1e-6], "base.toyStop": [6.5, 1e-9], "base.xToy": [13, 1e-6], "base.catBrake": [7, 1e-9], "base.catStop": [8, 1e-9] },
  parts: [
    { to: (m) => m.events["base.catStop"], pace: 0.7, caption: "החתול מאיץ 2 שניות, רץ במהירות קבועה 5 שניות, ונעצר בשנייה אחת. איך נראה גרף המהירות שלו?" },
    { to: (m) => m.events["base.catStop"], pace: 0.7, caption: "החתול נעצר בנקודה B. מה המרחק בין A ל-B?" },
    { to: (m) => m.events["base.catStop"], pace: 0.7, caption: "הצעצוע מחליק עד B ונעצר בה, שנייה וחצי לפני החתול. מה המהירות ההתחלתית שלו?" },
    { to: (m) => m.events["base.toyStop"], pace: 0.7, caption: "על הצעצוע פועל רק חיכוך בכיוון התנועה. אילו כוחות פועלים עליו, ומה מקדם החיכוך?" },
    { to: (m) => m.events["base.toyStop"], pace: 0.7, caption: "אותה מהירות התחלתית, אבל מקדם חיכוך גדול פי שניים (הצעצוע הכתום). איזה גודל לא משתנה?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -0.8, 14.8);
    for (const [x, lab] of [[0, "A"], [dAB, "B"]] as const) { P.line(x, 0, x, -0.5, { tone: "data", w: 1.2 }); P.mono(x, -0.5, lab, { tone: "data", size: 13, dyPx: 16 }); }
    const s = m.state(t);
    const cat = s["base.cat"], toy = s["base.toy"];
    if (part !== 3) {
      P.ball(cat.x, 0, { rPx: 9, tone: "runner" });
      P.heb(cat.x, 0, "חתול", { tone: "runner", size: 11, dyPx: -26 });
      if (cat.vx > 0.05) P.arrowPx(cat.x, -1.4, cat.vx * 22, 0, { tone: "vel", label: "v" });
    }
    if (part >= 2) {
      P.line(-0.6, 1.8, 14.6, 1.8, { tone: "line", w: 1 });
      P.block(toy.x, 1.8, { wPx: 26, hPx: 16 });
      P.heb(toy.x, 1.8, "צעצוע", { tone: "body", size: 11, dyPx: -24 });
      if (toy.vx > 0.05) P.arrowPx(toy.x, 3.2, toy.vx * 22, 0, { tone: "vel", label: "v" });
    }
    if (part === 4) {
      const d2 = s["double.toy"];
      P.block(d2.x, 1.8, { wPx: 26, hPx: 16, tone: "ask" });
    }
    if (part === 0) askLabel(P, cat.x, 0, "v(t) ?", 16, -50);
    if (part === 1 && t >= m.events["base.catStop"] - 1e-9) askWidth(P, 0, dAB, 0, "d = ?", 46);
    if (part === 2) { P.arrowPx(0, 1.8, 40, 0, { tone: "ask" }); askLabel(P, 0, 1.8, "v₀ = ?", 10, -66); }
    if (part === 3) { P.arrowPx(toy.x, 2.3, 0, 36, { tone: "ask", label: "?" }); askLabel(P, toy.x, 1.8, "μ = ?", 30, -76); }
    if (part === 4) askLabel(P, 6, 1.8, "?", 0, -60);
  },
});
