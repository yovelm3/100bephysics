import { body, type Story } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1998 q5: spring A stretches 0.4 m under 20 N (k = 50 N/m); spring B 0.5 m under 20 N (k = 40 N/m). A hand pulls the
 * free end slowly (5 cm/s) until the pull is 20 N. Build 1: the time from the stretch; build 2: the force is computed
 * from the stretch at every step. Runs: A alone, and A and B one after the other. The model's h.x is the stretch.
 */
const kA = 50, kB = 40, F = 20, u = 0.05;
const pull = (k: number): Story => ({
  init: { h: body(0, 0, u, 0) },
  phases: [{ end: "F20", acc: {}, dur: () => F / k / u, force: () => ({}), until: (s) => k * s.h.x >= F }],
  record: { x: ["F20", (s) => s.h.x], W: ["F20", (s) => 0.5 * k * s.h.x ** 2] },
});
const kS = 1 / (1 / kA + 1 / kB);
export const spec = storySpec({
  id: "bagrut-1998-q5",
  view: { x0: -0.1, x1: 2.3, y0: -0.4, y1: 0.8 },
  scale: 1,
  scenarios: { A: pull(kA), AB: pull(kS) },
  order: { A: ["F20"], AB: ["F20"] },
  answers: { "A.x": [0.4, 1e-9], "A.W": [4, 1e-9], "AB.x": [0.9, 1e-9] },
  parts: [
    { to: (m) => m.events["A.F20"], pace: 0.6, caption: "הנער מושך את קפיץ A, והכוח גדל מאפס עד 20 N. איך נראה הגרף של הכוח כפונקציה של ההתארכות?" },
    { to: (m) => m.events["A.F20"], pace: 0.6, caption: "לפי הגרף: מה העבודה שעשה הנער כשמתח את הקפיץ?" },
    { to: (m) => m.events["A.F20"], pace: 0.6, caption: "שני נערים מושכים את שני הקצוות, כל אחד ב-20 N. האם ההתארכות שונה?" },
    { to: (m) => m.events["AB.F20"], pace: 0.6, caption: "קפיץ B מחובר לקצה של A, והנער מושך את B ב-20 N. מה ההתארכות של שני הקפיצים יחד?" },
  ],
  draw: (P, m, t, part) => {
    P.wall(0, -0.2, 0.6, "left");
    const L0 = 0.6, series = part === 3;
    const s = m.state(t)[series ? "AB.h" : "A.h"].x;
    const f = (series ? kS : kA) * s;
    if (!series) { P.spring(0, 0.2, L0 + s, 0.2, { coils: 10, ampPx: 7 }); }
    else { const xa = f / kA, xb = f / kB; P.spring(0, 0.2, L0 + xa, 0.2, { coils: 10, ampPx: 7 }); P.spring(L0 + xa, 0.2, 2 * L0 + xa + xb, 0.2, { coils: 10, ampPx: 5 }); P.mono(L0 / 2, 0.2, "A", { tone: "data", size: 11, dyPx: -14 }); P.mono(1.5 * L0, 0.2, "B", { tone: "data", size: 11, dyPx: -14 }); }
    const end = series ? 2 * L0 + s : L0 + s;
    P.circle(end, 0.2, 6, { fill: "runner" });
    P.arrowPx(end, 0.2, 14 + f * 2.4, 0, { tone: "force", label: "F" });
    if (part === 2) { P.arrowPx(0.05, 0.2, -30, 0, { tone: "force", label: "20 N" }); }
    if (part === 0) askLabel(P, 1.2, 0.6, "F(Δℓ) ?", 0, 0);
    if (part === 1 && t >= m.events["A.F20"] - 1e-9) askLabel(P, 1.2, 0.6, "W = ?", 0, 0);
    if (part === 2) askLabel(P, 1.2, 0.6, "Δℓ ?", 0, 0);
    if (part === 3 && t >= m.events["AB.F20"] - 1e-9) askLabel(P, 1.2, 0.6, "Δℓ = ?", 0, 0);
  },
});
