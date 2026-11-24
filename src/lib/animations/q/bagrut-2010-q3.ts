import type { AnimSpec } from "../engine";
import { askLabel, collision, joinSpecs } from "../kits";

/** 2010 q3: an elastic head-on hit of a 25 g disk at 0.3 m/s on a 50 g disk at rest (u1 = −0.1, u2 = 0.2); and with m1 > m2 (drawn 100 g on 50 g). */
const hit = (m1: number) => collision({
  id: "bagrut-2010-q3",
  a: { m: m1, x: 0, v: 0.3, w: 0.05 },
  b: { m: 0.05, x: 0.25, v: 0, w: 0.05 },
  kind: "elastic",
  k: 50,
  tEnd: 1.6,
  view: { x0: 0, x1: 1, y0: 0, y1: 1 },
  parts: [{ to: (m) => m.events.end, pace: 1, caption: "" }],
  draw: () => {},
});
const both = joinSpecs("bagrut-2010-q3", [{ key: "s", spec: hit(0.025), parts: [0] }, { key: "h", spec: hit(0.1), parts: [0] }]);
export const spec: AnimSpec = {
  ...both,
  views: undefined,
  view: { x0: -0.3, x1: 0.75, y0: -0.08, y1: 0.42 },
  answers: { "s:va": [-0.1, 1e-9], "s:vb": [0.2, 1e-9] },
  parts: [
    { to: (m) => m.events["s:end"], pace: 1, caption: "הדסקית של 25 g פוגעת בדסקית של 50 g שעומדת. מה המהירות u1 של הדסקית הפוגעת אחרי ההתנגשות?" },
    { to: (m) => m.events["s:end"], pace: 1, caption: "מה המהירות u2 של הדסקית השנייה?" },
    { to: (m) => m.events["s:end"], pace: 1, caption: "מה הביטוי ל-u2 לפי m1, m2 ו-v?" },
    { to: (m) => m.events["h:end"], pace: 1, caption: "הראו שאם m1 > m2, הדסקית m2 נעה אחרי ההתנגשות מהר יותר מ-v." },
    { from: (m) => m.events["s:hit"] - 0.05, to: (m) => m.events["s:sep"] + 0.05, pace: 4, caption: "איזה גרף מראה את גודל הכוח על הדסקית השנייה, כש-m1 = m2?" },
    { from: (m) => m.events["h:hit"] - 0.05, to: (m) => m.events["h:sep"] + 0.05, pace: 4, caption: "ואיזה גרף מראה אותו כש-m1 > m2?" },
  ],
  draw: (P, m, t, part) => {
    const key = part === 3 || part === 5 ? "h" : "s";
    const s = m.state(t), a = s[`${key}:a`], b = s[`${key}:b`];
    P.line(-0.28, 0, 0.73, 0, { tone: "line", w: 2 });
    P.circle(a.x, 0.03, key === "h" ? 13 : 9, { fill: "body" }); P.mono(a.x, 0.03, "m1", { tone: "body", size: 11, dyPx: -18 });
    P.circle(b.x, 0.03, 11, { fill: "b2" }); P.mono(b.x, 0.03, "m2", { tone: "b2", size: 11, dyPx: -18 });
    P.arrowPx(a.x, 0.14, a.vx * 120, 0, { tone: "vel" }); P.arrowPx(b.x, 0.14, b.vx * 120, 0, { tone: "vel" });
    const done = t >= m.events[`${key}:sep`] - 1e-9;
    if (part === 0 && done) askLabel(P, a.x, 0.14, "u1 = ?", 0, -20);
    if ((part === 1 || part === 2) && done) askLabel(P, b.x, 0.14, part === 1 ? "u2 = ?" : "u2(m1, m2, v) ?", 0, -20);
    if (part === 3 && done) askLabel(P, b.x, 0.14, "u2 > v ?", 0, -20);
    if (part >= 4) askLabel(P, b.x, 0.03, "F(t) ?", 20, -30);
  },
};
