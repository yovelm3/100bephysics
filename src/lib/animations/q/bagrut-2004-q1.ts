import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/** 2004 q1: an arrow shot horizontally at 20 m/s toward an apple 6 m away, both 1.8 m high; the apple is released at the same moment. Part ד: the arrow at (20, 20) m/s and the apple thrown up. */
const g = 10, D = 6, H = 1.8;
const hit = (vy: number, appleVy: number) => ({
  init: { ar: body(0, H, 20, vy), ap: body(D, H, 0, appleVy) },
  phases: [{ end: "hit", acc: { ar: [0, -g] as [number, number], ap: [0, -g] as [number, number] }, dur: () => D / 20, force: () => ({ ar: [0, -g] as [number, number], ap: [0, -g] as [number, number] }), until: (s: Record<string, { x: number }>) => s.ar.x >= s.ap.x }],
  record: { yHit: ["hit", (s: Record<string, { y: number }>) => s.ar.y] as [string, (s: never) => number], yApple: ["hit", (s: Record<string, { y: number }>) => s.ap.y] as [string, (s: never) => number], v: ["hit", (s: Record<string, { vx: number; vy: number }>) => Math.hypot(s.ar.vx, s.ar.vy)] as [string, (s: never) => number] },
});
export const spec = storySpec({
  id: "bagrut-2004-q1",
  view: { x0: -0.8, x1: 7, y0: -0.3, y1: 2.6 },
  views: [0, 1, 2].map(() => ({ x0: -0.8, x1: 7, y0: -0.3, y1: 2.6 })).concat([{ x0: -1.5, x1: 7.5, y0: -0.3, y1: 8.5 }]),
  scale: 8,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scenarios: { flat: hit(0, 0) as any, up: hit(20, 20) as any },
  order: { flat: ["hit"], up: ["hit"] },
  answers: { "flat.hit": [0.3, 1e-9], "flat.v": [Math.hypot(20, 3), 1e-9] },
  tolValue: { "flat.yHit": 3e-3, "up.yHit": 3e-3, "flat.yApple": 3e-3, "up.yApple": 3e-3 },
  parts: [
    { to: (m) => m.events["flat.hit"], pace: 6, caption: "החץ נורה והתפוח משתחרר באותו רגע. האם החץ מגיע לתפוח לפני שהתפוח מגיע לקרקע?" },
    { to: (m) => m.events["flat.hit"], pace: 6, caption: "גם החץ וגם התפוח יורדים בזמן שהחץ עף. למה החץ בכל זאת פוגע בתפוח?" },
    { to: (m) => m.events["flat.hit"], pace: 6, caption: "מה גודל המהירות של החץ ברגע הפגיעה, ומה הזווית שלה מתחת לאופק?" },
    { to: (m) => m.events["up.hit"], pace: 6, caption: "עכשיו החץ נורה באלכסון כלפי מעלה, והתפוח נזרק כלפי מעלה באותו רגע. באיזו מהירות צריך לזרוק את התפוח?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -0.7, 6.9);
    P.line(0, H - 0.4, 0, H + 0.4, { tone: "line", w: 1.6 });
    const key = part === 3 ? "up" : "flat";
    const s = m.state(t), ar = s[`${key}.ar`], ap = s[`${key}.ap`];
    const ang = Math.atan2(ar.vy, ar.vx);
    P.line(ar.x - 0.45 * Math.cos(ang), ar.y - 0.45 * Math.sin(ang), ar.x, ar.y, { tone: "text", w: 2.4 });
    P.circle(ap.x, ap.y, 8, { fill: "ask" });
    if (t < 0.02) P.dim(0, H, D, H, "6 m", { offPx: -24 });
    if (part === 2 && t >= m.events["flat.hit"] - 1e-9) { P.arrowPx(ar.x, ar.y, ar.vx * 2.2, -ar.vy * 2.2, { tone: "ask" }); askLabel(P, ar.x, ar.y, "v = ?, θ = ?", -150, 30); }
    if (part === 3) { P.arrowPx(ap.x, ap.y, 0, -40, { tone: "ask" }); askLabel(P, ap.x, ap.y, "v = ?", 12, -30); }
  },
});
