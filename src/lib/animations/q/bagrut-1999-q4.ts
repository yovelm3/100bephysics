import { arc, askLabel, seg, trackMotion } from "../kits";

/**
 * 1999 q4: a roller coaster from A (H = 45 m, from rest); BCD a circular dip (R = 10 m) with C on the ground;
 * EFG a hill with its top F lower than A (drawn: F at 25 m, radius 12 m). The slopes between them are drawn at 45°.
 */
const R = 10, Rh = 12, hF = 25, s2 = Math.SQRT1_2;
const cx = 7.07 + 42.07, B: [number, number] = [cx - R * s2, R - R * s2];
const A: [number, number] = [B[0] - (45 - B[1]), 45];
const D: [number, number] = [cx + R * s2, R - R * s2];
const fx = D[0] + (hF - Rh + Rh * s2 - D[1]) + Rh * s2, E: [number, number] = [fx - Rh * s2, hF - Rh + Rh * s2];
const path: [number, number][] = [A, ...seg(A, B, 60), ...arc(cx, R, R, -Math.PI / 4, Math.PI / 4, 200).slice(1), ...seg(D, E, 60), ...arc(fx, hF - Rh, Rh, (5 * Math.PI) / 4, (3 * Math.PI) / 4, 200).slice(1)];
const iC = 60 + 100, iF = 60 + 200 + 60 + 100; // the middle of each arc
export const spec = trackMotion({
  id: "bagrut-1999-q4",
  path,
  points: { C: iC, F: iF },
  view: { x0: -4, x1: 100, y0: -3, y1: 49 },
  answers: { "v@C": [30, 1e-3] },
  parts: [
    { to: () => 0.5, pace: 1, caption: "אבן ששוחררה מגובה A הגיעה לקרקע אחרי 3 שניות. מה הגובה H?" },
    { to: (m) => m.events.C, pace: 0.6, caption: "הקרונית יוצאת מ-A בלי מהירות התחלתית. מה המהירות שלה בנקודה C?" },
    { to: (m) => m.events.C, pace: 0.6, caption: "בנקודה C המאזניים מראים 10mg. מה הרדיוס R של הקשת BCD?" },
    { to: (m) => m.events.F, pace: 0.6, caption: "בנקודה F, בראש הגבעה: האם המאזניים מראים יותר מ-mg, פחות או בדיוק mg?" },
  ],
  extra: (P, m, t, part) => {
    P.ground(0, -3, 99);
    for (const [lab, p] of [["A", A], ["C", [cx, 0]], ["F", [fx, hF]]] as const) P.mono(p[0], p[1], lab, { tone: "data", size: 12, dyPx: lab === "C" ? 16 : -12 });
    const b = m.state(t).b;
    if (part === 0) askLabel(P, A[0], 22, "H = ?", 16, 0);
    if (part === 1 && t >= m.events.C - 1e-9) askLabel(P, b.x, b.y, "v = ?", 14, -24);
    if (part === 2 && t >= m.events.C - 1e-9) askLabel(P, cx, R, "R = ?", 0, -10);
    if (part === 3 && t >= m.events.F - 1e-9) askLabel(P, b.x, b.y, "N ? mg", 14, -24);
  },
});
