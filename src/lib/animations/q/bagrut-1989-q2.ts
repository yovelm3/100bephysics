import type { AnimSpec } from "../engine";
import { askLabel, collision, joinSpecs } from "../kits";

/**
 * 1989 q2: a 60 kg man runs at 8 m/s and jumps onto an 80 kg cart moving at 3 m/s (plastic). Second run: he runs
 * toward the cart. Parts ג–ד (wheat falling in, wheat pouring out) are asked about the moving cart.
 */
const run = (toward: boolean) => collision({
  id: "bagrut-1989-q2",
  a: toward ? { m: 80, x: 0, v: 3, w: 1.6 } : { m: 60, x: 0, v: 8, w: 0.4 },
  b: toward ? { m: 60, x: 9.5, v: -8, w: 0.4 } : { m: 80, x: 4, v: 3, w: 1.6 },
  kind: "plastic",
  k: 2e5,
  tEnd: 2.4,
  view: { x0: 0, x1: 1, y0: 0, y1: 1 },
  parts: [{ to: (m) => m.events.end, pace: 1, caption: "" }],
  draw: () => {},
});
const both = joinSpecs("bagrut-1989-q2", [{ key: "same", spec: run(false), parts: [0] }, { key: "toward", spec: run(true), parts: [0] }]);
export const spec: AnimSpec = {
  ...both,
  answers: { "same:va": [5.142857142857143, 1e-9], "toward:va": [-1.7142857142857142, 1e-9] },
  view: { x0: -1, x1: 17, y0: -0.6, y1: 8.4 },
  views: undefined,
  parts: [
    { to: (m) => m.events["same:end"], pace: 1, caption: "האדם רץ באותו כיוון כמו הקרונית, משיג אותה וקופץ עליה. מה המהירות שלהם יחד?" },
    { to: (m) => m.events["toward:end"], pace: 1, caption: "ומה המהירות אם האדם רץ לקראת הקרונית?" },
    { to: (m) => m.events["same:end"], pace: 1, caption: "חיטה נופלת אנכית לתוך הקרונית. האם המהירות שלה קטנה, לא משתנה או גדלה?" },
    { to: (m) => m.events["same:end"], pace: 1, caption: "נפתח חור ברצפה, והחיטה נשפכת תוך כדי נסיעה. האם המהירות קטנה, לא משתנה או גדלה?" },
  ],
  draw: (P, m, t, part) => {
    const key = part === 1 ? "toward" : "same";
    const s = m.state(t), cart = key === "same" ? s["same:b"] : s["toward:a"], man = key === "same" ? s["same:a"] : s["toward:b"];
    const on = t >= m.events[`${key}:stick`] - 1e-9;
    P.ground(0, -0.8, 16.8);
    P.cart(cart.x, 0, { wPx: 70, tone: "b2" });
    P.person(on ? cart.x : man.x, on ? 0.55 : 0, t, { tone: "runner", moving: !on, facing: man.vx >= 0 ? 1 : -1 });
    P.arrowPx(cart.x, 3, cart.vx * 9, 0, { tone: "vel", label: "v" });
    if (!on) P.arrowPx(man.x, 2.4, man.vx * 9, 0, { tone: "vel", label: "8 m/s" });
    if (part < 2 && on) askLabel(P, cart.x, 3, "V = ?", 20, -24);
    if (part === 2) { for (let i = 0; i < 8; i++) P.line(8 + i * 0.25, 7.5 - ((t * 2 + i * 0.3) % 1) * 3, 8 + i * 0.25, 7.3 - ((t * 2 + i * 0.3) % 1) * 3, { tone: "data", w: 1.4 }); askLabel(P, cart.x, 3, "v ?", 20, -24); }
    if (part === 3) { for (let i = 0; i < 5; i++) P.line(cart.x - 0.3, 0.3 - i * 0.12, cart.x - 0.3, 0.22 - i * 0.12, { tone: "data", w: 1.4 }); askLabel(P, cart.x, 3, "v ?", 20, -24); }
  },
};
