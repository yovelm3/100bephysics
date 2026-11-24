import { askLabel, collision } from "../kits";

/** 1994 q3: A (2 kg, 10 m/s) catches up with B (6 kg, 4 m/s), which has a light spring (K = 800 N/m) at its back. */
export const spec = collision({
  id: "bagrut-1994-q3",
  a: { m: 2, x: 0, v: 10, w: 0.3 },
  b: { m: 6, x: 2.6, v: 4, w: 1.9 }, // B's width counts its 0.5 m spring
  kind: "elastic",
  k: 800,
  tEnd: 0.62,
  answers: { va: [1, 1e-9], vb: [7, 1e-9] },
  view: { x0: -0.4, x1: 7.4, y0: -0.8, y1: 3.1 },
  parts: [
    { to: (m) => m.events.end, pace: 6, caption: "A משיג את B ונתקל בקפיץ. מה המהירות של A אחרי ההתנגשות, כשהוא כבר לא נוגע בקפיץ?" },
    { to: (m) => m.events.end, pace: 6, caption: "מה המהירות של B אחרי ההתנגשות?" },
    { from: (m) => m.events.hit - 0.05, to: (m) => (m.events.hit + m.events.sep) / 2, pace: 12, caption: "עד שהקפיץ מכווץ ביותר: האם האנרגיה הקינטית של שני הגופים נשמרת?" },
    { from: (m) => m.events.hit - 0.05, to: (m) => (m.events.hit + m.events.sep) / 2, pace: 12, caption: "האם התנע של שני הגופים נשמר?" },
    { from: (m) => m.events.hit - 0.05, to: (m) => (m.events.hit + m.events.sep) / 2, pace: 12, caption: "כשהקפיץ מכווץ ביותר, לשני הגופים אותה מהירות. מה היא?" },
    { from: (m) => m.events.hit - 0.05, to: (m) => (m.events.hit + m.events.sep) / 2, pace: 12, caption: "מה הכיווץ המרבי של הקפיץ?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -0.3, 7.3);
    const s = m.state(t), a = s.a, b = s.b;
    // B's spring: from A's front when touching, or relaxed (natural length 0.5 m) in front of B
    const bBack = b.x - 0.45, springEnd = bBack - 0.5;
    const touching = a.x + 0.15 >= bBack - 0.5;
    P.spring(touching ? a.x + 0.15 : springEnd, 0.25, bBack, 0.25, { coils: 7, ampPx: 7 });
    P.block(a.x, 0, { wPx: 34, hPx: 30, label: "A" });
    P.block(b.x, 0, { wPx: 100, hPx: 42, label: "B", tone: "b2" });
    P.arrowPx(a.x, 0.75, a.vx * 9, 0, { tone: "vel", label: "vA" });
    P.arrowPx(b.x, 1.0, b.vx * 9, 0, { tone: "vel", label: "vB" });
    const end = t >= m.events.end - 1e-9;
    if (part === 0 && end) askLabel(P, a.x, 0.75, "vA = ?", 20, -20);
    if (part === 1 && end) askLabel(P, b.x, 1.0, "vB = ?", 20, -20);
    if (part === 2) askLabel(P, 3, 2.3, "K = const ?", 0, 0);
    if (part === 3) askLabel(P, 3, 2.3, "p = const ?", 0, 0);
    if (part === 4) askLabel(P, 3, 2.3, "v = ?", 0, 0);
    if (part === 5) askLabel(P, bBack - 0.25, 0.25, "Δx max = ?", 0, -30);
  },
});
