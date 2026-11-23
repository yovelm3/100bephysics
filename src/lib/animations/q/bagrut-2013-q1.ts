import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/** 2013 q1: boat B at 20 m/s to 3 km at 150 s, then slows at 0.1875 m/s² until 230 s (4 km); boat A: 1 km at 150 s, then 4 km at 230 s. */
const aB = 0.1875;
export const spec = storySpec({
  id: "bagrut-2013-q1",
  view: { x0: -230, x1: 4430, y0: -420, y1: 1900 },
  scale: 4000,
  story: {
    init: { a: body(0, 0, 1000 / 150, 0), b: body(0, 260, 20, 0) },
    phases: [
      { end: "change", acc: {}, dur: () => 150, force: () => ({}), until: (s) => s.b.x >= 3000, jump: (s) => { s.a.vx = 3000 / 80; } },
      { end: "end", acc: { b: [-aB, 0] }, dur: () => 80, force: () => ({ b: [-aB, 0] }), until: (s) => s.a.x >= 4000 },
    ],
    record: { xA: ["end", (s) => s.a.x], xB: ["end", (s) => s.b.x], vB: ["end", (s) => s.b.vx] },
  },
  order: ["change", "end"],
  answers: { xA: [4000, 1e-6], xB: [4000, 1e-6], change: [150, 1e-9], end: [230, 1e-9] },
  parts: [
    { to: (m) => m.events.end, pace: 0.035, caption: "שתי הסירות שטות 230 שניות. מהי מהירות ממוצעת?" },
    { to: (m) => m.events.end, pace: 0.035, caption: "בסוף שתי הסירות באותו מקום. של איזו סירה המהירות הממוצעת גדולה יותר?" },
    { from: (m) => m.events.change, to: (m) => m.events.end, pace: 0.05, caption: "מ-150 שניות סירה ב נעה בתאוצה קבועה. האם התאוצה חיובית או שלילית?" },
    { from: (m) => m.events.change, to: (m) => m.events.end, pace: 0.05, caption: "מה גודל התאוצה של סירה ב?" },
    { to: (m) => m.events.end, pace: 0.035, caption: "איך נראה גרף המהירות של סירה ב בכל 230 השניות?" },
  ],
  draw: (P, m, t, part) => {
    // the question's position-time graph
    const G = P.graph({ xPx: 150, yPx: 22, wPx: 420, hPx: 150, tMax: 250, vMin: 0, vMax: 4300, xLabel: "t (s)", yLabel: "x (km)" });
    for (const tt of [50, 100, 150, 200, 250]) P.textPx(G.gx(tt), G.gy(0) + 13, String(tt), { tone: "data", size: 10 });
    for (const km of [1, 2, 3, 4]) P.textPx(146, G.gy(km * 1000) + 4, String(km), { tone: "data", size: 10, anchor: "end" });
    const F = m;
    const end = m.events.end;
    const curve = (k: "a" | "b", until: number) => Array.from({ length: 61 }, (_, i) => { const u = (until * i) / 60; return [G.gx(u), G.gy(F.state(u)[k].x)] as [number, number]; });
    P.path(curve("a", end), { tone: "soft", w: 2, dash: "6 4" });
    P.path(curve("b", end), { tone: "soft", w: 2 });
    const tc = Math.min(t, end);
    P.path(curve("a", tc), { tone: "b2", w: 2.6, dash: "6 4" });
    P.path(curve("b", tc), { tone: "body", w: 2.6 });
    // the two lanes
    const s = m.state(tc);
    P.line(-150, -60, 4350, -60, { tone: "line", w: 1 });
    P.line(-150, 200, 4350, 200, { tone: "line", w: 1 });
    P.line(-150, 460, 4350, 460, { tone: "line", w: 1 });
    for (const km of [0, 1, 2, 3, 4]) P.mono(km * 1000, -60, `${km} km`, { tone: "data", size: 10, dyPx: 14 });
    P.block(s.a.x, 0, { wPx: 34, hPx: 16, tone: "b2", label: "א" });
    P.block(s.b.x, 260, { wPx: 34, hPx: 16, label: "ב" });
    if (part >= 2) P.arrowPx(s.b.x, 330, s.b.vx * 2.2, 0, { tone: "vel", label: "v" });
    if (part === 1 && t >= end - 1e-9) P.heb(2000, 130, "המהירות הממוצעת של מי גדולה יותר?", { tone: "ask", size: 14 });
    if (part === 2) askLabel(P, s.b.x, 260, "a > 0 ?", -20, -44);
    if (part === 3) askLabel(P, s.b.x, 260, "a = ?", -20, -44);
    if (part === 4) askLabel(P, s.b.x, 260, "v(t) ?", -20, -44);
  },
});
