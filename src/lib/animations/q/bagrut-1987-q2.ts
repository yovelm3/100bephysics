import { body, type Phase, type Story } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1987 q2: dragging experiments with different forces F; the a–F graph starts at F = 2 N and rises 1 m/s² per 4 N
 * (m = 4 kg, friction 2 N, μ = 0.05). Each experiment is shown for 2 s. Part ג: a second body of mass m glued on.
 */
const g = 10, m = 4, mu = 0.05, Fs = [4, 6, 8, 10];
const run = (F: number, mass: number): Story => {
  const a = (F - mu * mass * g) / mass;
  const ph: Phase = {
    end: "end",
    acc: { b: [a, 0] },
    dur: () => 2,
    force: (s) => ({ b: [(F - (s.b.vx > 0 ? mu * mass * g : 0)) / mass, 0] }),
    until: (_s, t) => t >= 2 - 1e-12,
  };
  return { init: { b: body(0, 0, 0, 0) }, phases: [ph], record: { x: ["end", (s) => s.b.x] } };
};
const scen = Object.fromEntries([...Fs.map((F) => [`f${F}`, run(F, m)]), ...Fs.map((F) => [`d${F}`, run(F, 2 * m)])]);
export const spec = storySpec({
  id: "bagrut-1987-q2",
  view: { x0: -0.6, x1: 5.4, y0: -2.9, y1: 0.1 },
  scale: 4,
  scenarios: scen,
  order: Object.fromEntries(Object.keys(scen).map((k) => [k, ["end"]])),
  answers: { "f10.x": [4, 1e-9], "f6.x": [2, 1e-9], "d10.x": [1.5, 1e-9] },
  parts: [
    { to: () => 2, pace: 1.4, caption: "גוררים את הגוף בכוחות שונים, ומודדים את התאוצה. מה המסה של הגוף?" },
    { to: () => 2, pace: 1.4, caption: "עד כוח של 2 N הגוף לא מאיץ. מה מקדם החיכוך בין הגוף לשולחן?" },
    { to: () => 2, pace: 1.4, caption: "מדביקים גוף נוסף באותה מסה. איך ייראה עכשיו גרף התאוצה כפונקציה של הכוח?" },
  ],
  draw: (P, mm, t, part) => {
    const G = P.graph({ xPx: 470, yPx: 16, wPx: 220, hPx: 120, tMax: 11, vMin: 0, vMax: 2.6, xLabel: "F (N)", yLabel: "a (m/s²)" });
    P.path([[G.gx(2), G.gy(0)], [G.gx(10.4), G.gy(2.1)]], { tone: "body", w: 2.2 });
    for (const f of [2, 4, 6, 8, 10]) P.textPx(G.gx(f), G.gy(0) + 13, String(f), { tone: "data", size: 10 });
    for (const a of [1, 2]) P.textPx(466, G.gy(a) + 4, String(a), { tone: "data", size: 10, anchor: "end" });
    const s = mm.state(t);
    Fs.forEach((F, i) => {
      const y = -0.7 * i - 0.6;
      P.line(-0.5, y, 5.3, y, { tone: "line", w: 1 });
      const b = s[`${part === 2 ? "d" : "f"}${F}.b`];
      P.block(b.x + 0.2, y, { wPx: part === 2 ? 46 : 24, hPx: 16, tone: part === 2 ? "b2" : "body" });
      P.arrowPx(b.x + 0.2, y + 0.12, 16 + F * 3, 0, { tone: "force", label: `${F} N` });
    });
    if (part === 0) askLabel(P, 2.5, -0.2, "m = ?", 0, 0);
    if (part === 1) askLabel(P, 2.5, -0.2, "μ = ?", 0, 0);
    if (part === 2) askLabel(P, 2.5, -0.2, "a(F) ?", 0, 0);
  },
});
