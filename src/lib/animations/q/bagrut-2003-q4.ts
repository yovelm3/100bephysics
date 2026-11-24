import { body, type Phase } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2003 q4: three experiments, energy conserved in all: (1) a ball rolling at 1 m/s between walls 2 m apart (period 4 s);
 * (2) a ball bouncing straight up and down off the floor, 2 s up (20 m/s, 20 m; period 4 s); (3) a ball on a spring,
 * period 2 s, amplitude 0.1 m (vmax 0.314 m/s). The spring ball's motion is drawn from x = A·cos(πt) (its own two builds
 * are those of the other harmonic questions); experiments 1 and 2 are the story here.
 */
const g = 10, T = 8;
const run: Phase[] = [1, 2, 3, 4].map((k) => ({ end: `wall${k}`, acc: {}, dur: () => 2, force: () => ({}), until: (s) => (k % 2 ? s.r.x >= 2 : s.r.x <= 0), jump: (s) => { s.r.vx = -s.r.vx; } }));
const bounce: Phase[] = [1, 2].flatMap((k) => [
  { end: `top${k}`, acc: { b: [0, -g] }, dur: (s) => s.b.vy / g, force: () => ({ b: [0, -g] }), until: (s) => s.b.vy <= 0 } as Phase,
  { end: `floor${k}`, acc: { b: [0, -g] }, dur: (s) => Math.sqrt((2 * s.b.y) / g), force: () => ({ b: [0, -g] }), until: (s) => s.b.y <= 0, jump: (s) => { s.b.vy = -s.b.vy; s.b.y = 0; } } as Phase,
]);
export const spec = storySpec({
  id: "bagrut-2003-q4",
  view: { x0: -4, x1: 12, y0: -1, y1: 23 },
  scale: 20,
  scenarios: {
    run: { init: { r: body(0, 0, 1, 0) }, phases: run },
    bounce: { init: { b: body(0, 0, 0, 20) }, phases: bounce, record: { h: ["top1", (s) => s.b.y] } },
  },
  order: { run: ["wall1", "wall2", "wall3", "wall4"], bounce: ["top1", "floor1", "top2", "floor2"] },
  answers: { "run.wall2": [4, 1e-9], "bounce.floor1": [4, 1e-9], "bounce.h": [20, 1e-9] },
  parts: [
    { to: () => T, pace: 0.6, caption: "איזה גרף מתאר את ניסוי 1, הכדור שרץ בין הקירות?" },
    { to: () => T, pace: 0.6, caption: "איזה גרף מתאר את ניסוי 2, הכדור שקופץ?" },
    { to: () => T, pace: 0.6, caption: "איזה גרף מתאר את ניסוי 3, הכדור על הקפיץ?" },
    { to: () => T, pace: 0.6, hideClock: true, caption: "מה זמן המחזור בניסוי 1?" },
    { to: () => T, pace: 0.6, hideClock: true, caption: "מה זמן המחזור בניסוי 2?" },
    { to: () => T, pace: 0.6, hideClock: true, caption: "מה זמן המחזור בניסוי 3?" },
    { to: () => T, pace: 0.6, caption: "מה המהירות המרבית בניסוי 1?" },
    { to: () => T, pace: 0.6, caption: "מה המהירות המרבית בניסוי 2?" },
    { to: () => T, pace: 0.6, caption: "מה המהירות המרבית בניסוי 3?" },
    { to: () => T, pace: 0.6, caption: "תנו דוגמאות לרגעים שבהם המהירות אפס והתאוצה לא אפס, משני ניסויים שונים." },
  ],
  draw: (P, m, t, part) => {
    const s = m.state(t), exp = part === 9 ? -1 : part % 3;
    if (exp === 0 || exp === -1) {
      P.line(-3.6, 1, -0.4, 1, { tone: "line", w: 2 }); P.wall(-3.6, 1, 2.2, "left"); P.wall(-0.4, 1, 2.2, "right");
      P.circle(-3.4 + s["run.r"].x * 1.4, 1.25, 7, { fill: "body" }); P.heb(-2, 3, "ניסוי 1", { tone: "data", size: 11 });
    }
    if (exp === 1 || exp === -1) {
      P.ground(0, 2.5, 5.5); P.circle(4, s["bounce.b"].y + 0.3, 7, { fill: "b2" }); P.heb(4, 22, "ניסוי 2", { tone: "data", size: 11 });
    }
    if (exp === 2 || exp === -1) {
      const y = 12 + 3 * Math.cos(Math.PI * t);
      P.line(7.5, 20, 10.5, 20, { tone: "line", w: 3 }); P.spring(9, 20, 9, y + 0.5, { coils: 10, ampPx: 6 }); P.circle(9, y, 7, { fill: "runner" });
      P.heb(9, 22, "ניסוי 3 (המשרעת מוגדלת בציור)", { tone: "data", size: 10 });
    }
    const asks = ["?", "?", "?", "T = ?", "T = ?", "T = ?", "v max = ?", "v max = ?", "v max = ?", "v = 0, a ≠ 0 ?"];
    askLabel(P, 4, 10, asks[part], 0, 0);
  },
});
