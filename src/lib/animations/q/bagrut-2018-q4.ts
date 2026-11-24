import type { AnimSpec } from "../engine";
import { arc, askLabel, collision, joinSpecs, trackMotion } from "../kits";

/**
 * 2018 q4: a ballistic pendulum: a 15 g bullet stops inside a 4.985 kg block on a 0.6 m string; the block swings up
 * to 12°. Two stories: the very short hit (plastic) and the swing (energy along the arc).
 */
const L = 0.6, th = (12 * Math.PI) / 180, g = 10;
const V = Math.sqrt(2 * g * L * (1 - Math.cos(th)));
const v0 = (V * 5) / 0.015;
const hit = collision({
  id: "bagrut-2018-q4",
  a: { m: 0.015, x: -0.4, v: v0, w: 0.02 },
  b: { m: 4.985, x: 0, v: 0, w: 0.16 },
  kind: "plastic",
  k: 2e6,
  tEnd: 0.003,
  answers: { vb: [V, 1e-9] },
  view: { x0: -0.5, x1: 0.3, y0: -0.2, y1: 0.2 },
  parts: [{ to: (m) => m.events.end, pace: 1500, hideClock: true, caption: "מהרגע שהקליע פוגע ועד שהוא נעצר בגוש: האם התנע נשמר? והאנרגיה המכנית?" }],
  draw: (P, m, t) => {
    const s = m.state(t);
    P.line(s.b.x, 0.2, s.b.x, 0.08, { tone: "line", w: 1.4 });
    P.block(s.b.x, 0, { wPx: 50, hPx: 50, base: false, tone: "b2" });
    if (t < m.events.stick) P.block(s.a.x, 0, { wPx: 12, hPx: 5, base: false, tone: "line" });
    askLabel(P, 0.15, 0.1, "p, E ?", 0, -10);
  },
});
const swing = trackMotion({
  id: "bagrut-2018-q4",
  path: arc(0, L, L, 0, 0.995 * th, 300),
  v0: V,
  dt: 2e-5,
  view: { x0: -0.45, x1: 0.45, y0: -0.08, y1: 0.67 },
  bare: true,
  parts: [
    { to: (m) => m.events.end, pace: 2, caption: "מהרגע שהגוש עם הקליע מתחיל לזוז ועד שהוא נעצר לרגע ב-B: האם התנע נשמר? והאנרגיה המכנית?" },
    { to: (m) => m.events.end, pace: 2, caption: "ℓ = 0.6 m, θ = 12°. מה האנרגיה הקינטית מיד אחרי שהגוש מתחיל לזוז?" },
    { to: (m) => m.events.end, pace: 2, caption: "מה המהירות v0 של הקליע?" },
    { to: (m) => m.events.end, pace: 2, caption: "כמה אנרגיה מכנית אבדה בחדירה?" },
  ],
  extra: (P, m, t, part) => {
    P.line(-0.2, L, 0.2, L, { tone: "line", w: 3 });
    const b = m.state(t).b;
    P.line(0, L, b.x, b.y, { tone: "line", w: 1.4 });
    P.line(0, L, 0, 0, { tone: "idle", w: 1, dash: "3 3" });
    P.block(b.x, b.y, { wPx: 34, hPx: 34, base: false, tone: "b2" });
    P.mono(0, 0, "A", { tone: "data", size: 12, dyPx: 24 });
    if (t >= m.events.end - 1e-9) { P.mono(b.x, b.y, "B", { tone: "data", size: 12, dxPx: 22 }); P.mono(0.03, L - 0.2, "θ", { tone: "data", size: 12, anchor: "start" }); }
    const asks = ["p, E ?", "K = ?", "v0 = ?", "ΔE = ?"];
    askLabel(P, -0.25, 0.3, asks[part], 0, 0);
  },
});
export const spec: AnimSpec = joinSpecs("bagrut-2018-q4", [{ key: "hit", spec: hit, parts: [0] }, { key: "swing", spec: swing, parts: [0, 1, 2, 3] }]);
