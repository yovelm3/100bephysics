import { askLabel, collision } from "../kits";

/**
 * 2016 q4: m = 0.5 kg at 2 m/s hits M at rest, elastically; the graph (in ms) shows m going back at 1.2 m/s and M going on
 * at 0.8 m/s (M = 2 kg); the contact lasts about 2 ms. The contact stiffness is chosen so it lasts 2 ms.
 * Time is in seconds here (the clock shows thousandths).
 */
const mu = (0.5 * 2) / 2.5, tau = 0.002;
const k = mu * (Math.PI / tau) ** 2;
export const spec = collision({
  id: "bagrut-2016-q4",
  a: { m: 0.5, x: -0.0021, v: 2, w: 0.002 },
  b: { m: 2, x: 0, v: 0, w: 0.002 },
  kind: "elastic",
  k,
  tEnd: 0.0035,
  answers: { va: [-1.2, 1e-9], vb: [0.8, 1e-9] },
  view: { x0: -0.004, x1: 0.004, y0: -0.0012, y1: 0.0028 },
  parts: [
    { to: (m) => m.events.end, pace: 2000, hideClock: true, caption: "איך נעה התיבה m בזמן שבגרף?" },
    { to: (m) => m.events.end, pace: 2000, hideClock: true, caption: "מה המסה של התיבה M?" },
    { to: (m) => m.events.end, pace: 2000, hideClock: true, caption: "מה הכוח השקול הממוצע על M בזמן ההתנגשות?" },
    { to: (m) => m.events.end, pace: 2000, hideClock: true, caption: "למה השיפועים של שתי העקומות שונים בגודל ובסימן בזמן ההתנגשות?" },
    { to: (m) => m.events.end, pace: 2000, hideClock: true, caption: "הוכיחו שההתנגשות אלסטית." },
    { to: (m) => m.events.end, pace: 2000, hideClock: true, caption: "מה המסה המרבית של M′, כך ש-m לא תשנה את כיוון התנועה שלה?" },
  ],
  draw: (P, m, t, part) => {
    P.line(-0.0039, 0, 0.0039, 0, { tone: "line", w: 2 });
    const s = m.state(t);
    P.block(s.a.x, 0, { wPx: 40, hPx: 30, label: "m" });
    P.block(s.b.x, 0, { wPx: 60, hPx: 44, label: "M", tone: "b2" });
    P.arrowPx(s.a.x, 0.0012, s.a.vx * 30, 0, { tone: "vel" }); P.arrowPx(s.b.x, 0.0017, s.b.vx * 30, 0, { tone: "vel" });
    const done = t >= m.events.sep - 1e-9;
    const asks = ["?", "M = ?", "F̄ = ?", "?", "K = const ?", "M′ max = ?"];
    if (part === 0 || done) askLabel(P, part === 0 ? s.a.x : 0, 0.0023, asks[part].replace("F̄", "F avg"), 0, 0);
  },
});
