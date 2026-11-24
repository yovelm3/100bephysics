import { body, simulate, type AnimSpec, type Model, type State } from "../engine";
import { askLabel } from "../kits";

/**
 * 2013 q5: a rocket of 7.3·10⁵ kg lifts off with a constant thrust of 1.16·10⁷ N (a = 5.89 m/s² at first). It burns fuel
 * (drawn: 3000 kg/s), so the acceleration grows. Build 1: v = (F/q)·ln(M0/(M0 − q t)) − g t; build 2: a = F/m(t) − g.
 */
const g = 10, M0 = 7.3e5, F = 1.16e7, q = 3000, tEnd = 60;
const formula = (): Model => {
  const v = (t: number) => (F / q) * Math.log(M0 / (M0 - q * t)) - g * t;
  // height: the integral of v (by the closed form of ∫ln)
  const y = (t: number) => { const m = M0 - q * t; return (F / q) * (t + (m / q) * Math.log(m / M0)) - 0.5 * g * t * t; };
  return {
    state: (tq: number): State => { const t = Math.min(Math.max(tq, 0), tEnd); return { r: body(0, y(t), 0, v(t)) }; },
    events: { end: tEnd },
    values: { a0: F / M0 - g, aEnd: F / (M0 - q * tEnd) - g },
  };
};
const simulation = (): Model => {
  const res = simulate({
    init: { r: body(0, 0, 0, 0) },
    accel: (_s, t) => ({ r: { ax: 0, ay: F / (M0 - q * t) - g } }),
    events: [{ name: "end", when: (_s, t) => t >= tEnd - 1e-9, stop: true, record: (_s, t) => ({ aEnd: F / (M0 - q * t) - g }) }],
    tMax: tEnd + 1,
    dt: 1e-3,
  });
  res.model.values.a0 = F / M0 - g;
  return res.model;
};
export const spec: AnimSpec = {
  id: "bagrut-2013-q5",
  view: { x0: -26000, x1: 26000, y0: -1000, y1: 25000 },
  formula,
  simulation,
  order: ["end"],
  scale: 8000,
  answers: { a0: [5.890410958904109, 1e-9] },
  parts: [
    { to: () => 3, pace: 1, caption: "אילו כוחות פועלים על הרקטה בזמן השיגור?" },
    { to: () => 3, pace: 1, caption: "מה התאוצה של הרקטה ברגע שהיא עוזבת את כן השיגור?" },
    { to: () => tEnd, pace: 0.15, caption: "איך פועל מנוע של רקטה?" },
    { to: () => tEnd, pace: 0.15, caption: "הכוח F קבוע. האם התאוצה גדלה, קטנה או לא משתנה?" },
    { to: () => 3, pace: 1, caption: "הלוויין נפרד מהרקטה ונע רק בהשפעת הכבידה, במסלול שבתרשים. מה אפשר לומר על המסלול?" },
    { to: () => 3, pace: 1, caption: "באיזו נקודה מהירות הלוויין גדולה יותר: A או E?" },
  ],
  draw: (P, mm, t, part) => {
    P.ground(0, -25000, 25000);
    const r = mm.state(t).r;
    P.poly([[-400, r.y], [400, r.y], [400, r.y + 2000], [0, r.y + 2900], [-400, r.y + 2000]], { tone: "body", fill: "body" });
    if (part <= 1) { P.arrowPx(0, r.y + 2900, 0, -50, { tone: "force", label: "F" }); P.arrowPx(0, r.y + 900, 0, 40, { tone: "force", label: "Mg" }); }
    const asks = ["?", "a = ?", "?", "a(t) ?", "?", "vA ? vE"];
    askLabel(P, 0, r.y + 1400, asks[part], 30, 0);
  },
};
