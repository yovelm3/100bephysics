import type { AnimSpec } from "../engine";
import { arc, askLabel, collision, joinSpecs } from "../kits";

/**
 * 1986 q3: A (60 g) slides from rest down a smooth quarter circle of r = 20 cm, so it reaches the straight part at
 * √(2gr) = 2 m/s, and hits B (20 g) at rest at S. Two runs side by side: plastic (1.5 m/s together) and elastic
 * head-on (A 1 m/s, B 3 m/s). The story starts at Q, the bottom of the quarter circle.
 */
const r = 0.2, v = Math.sqrt(2 * 10 * r);
const hit = (kind: "elastic" | "plastic") => collision({
  id: "bagrut-1986-q3",
  a: { m: 0.06, x: 0, v, w: 0.04 },
  b: { m: 0.02, x: 0.5, v: 0, w: 0.03 },
  kind,
  k: 4000,
  tEnd: 0.42,
  view: { x0: 0, x1: 1, y0: 0, y1: 1 },
  parts: [{ to: (m) => m.events.end, pace: 5, caption: "" }],
  draw: () => {},
});
const both = joinSpecs("bagrut-1986-q3", [{ key: "p", spec: hit("plastic"), parts: [0] }, { key: "e", spec: hit("elastic"), parts: [0] }]);
const rows = { p: 0.45, e: 0 };
export const spec: AnimSpec = {
  ...both,
  answers: { "p:va": [1.5, 1e-9], "e:va": [1, 1e-9], "e:vb": [3, 1e-9] },
  view: { x0: -0.32, x1: 1.0, y0: -0.12, y1: 0.66 },
  views: undefined,
  parts: [
    { to: (m) => m.events["e:end"], pace: 5, caption: "A מגיע לקטע הישר ופוגע ב-B. מה המהירויות אחרי התנגשות פלסטית (למעלה), ואחרי התנגשות אלסטית מצחית (למטה)?" },
    { to: (m) => m.events["e:end"], pace: 5, caption: "ההתנגשות אלסטית אבל לא מצחית, ו-A ממשיך בזווית α לכיוון שלו. מה אפשר לומר על התנועה של B?" },
  ],
  draw: (P, m, t, part) => {
    const s = m.state(t);
    for (const [k, y] of Object.entries(rows)) {
      if (part === 1 && k === "p") continue;
      P.poly(arc(0, y + r, r, -Math.PI / 2, 0, 40), { close: false, fill: "none", tone: "line", w: 2.2 });
      P.line(0, y, 0.98, y, { tone: "line", w: 2.2 });
      const a = s[`${k}:a`], b = s[`${k}:b`];
      P.circle(a.x, y + 0.02, 7, { fill: "body" }); P.mono(a.x, y + 0.02, "A", { tone: "body", size: 11, dyPx: -12 });
      P.circle(b.x, y + 0.015, 5, { fill: "b2" }); P.mono(b.x, y + 0.015, "B", { tone: "b2", size: 11, dyPx: -10 });
      P.heb(0.75, y + 0.2, k === "p" ? "פלסטית" : "אלסטית", { tone: "data", size: 11 });
      if (t >= m.events[`${k}:end`] - 1e-9) { askLabel(P, a.x, y, "u = ?", -10, -26); if (k === "e") askLabel(P, b.x, y, part === 1 ? "θ ?" : "u = ?", 10, -26); }
    }
  },
};
