import { askLabel, collision } from "../kits";

/** 2012 q4: cart 1 (2 kg) hits cart 2 at rest head-on, elastically; cart 2 leaves at 1.25 m/s (so m2 = 4 kg, v1 = 1.875 m/s). */
export const spec = collision({
  id: "bagrut-2012-q4",
  a: { m: 2, x: 0, v: 1.875, w: 0.4 },
  b: { m: 4, x: 1.5, v: 0, w: 0.4 },
  kind: "elastic",
  k: 2000,
  tEnd: 2.2,
  answers: { vb: [1.25, 1e-9], va: [-0.625, 1e-9] },
  view: { x0: -1.4, x1: 4.6, y0: -0.4, y1: 2.6 },
  parts: [
    { from: (m) => m.events.hit - 0.1, to: (m) => m.events.sep + 0.1, pace: 10, caption: "מה מייצג השטח שבין גרף הכוח לציר הזמן?" },
    { to: (m) => m.events.end, pace: 1, caption: "קרונית 2 נוסעת אחרי ההתנגשות ב-1.25 m/s. מה המסה שלה?" },
    { to: (m) => m.events.end, pace: 1, caption: "כתבו שתי משוואות שמהן אפשר לחשב את המהירות של קרונית 1 לפני ההתנגשות." },
    { from: (m) => m.events.hit - 0.1, to: (m) => m.events.sep + 0.1, pace: 10, caption: "הוסיפו לגרף את הכוח שקרונית 2 הפעילה על קרונית 1." },
    { to: (m) => m.events.end, pace: 1, caption: "קרונית 2 עולה בקטע BC וממשיכה ב-CD. איזה גרף מתאר את גודל המהירות שלה?" },
  ],
  draw: (P, m, t, part) => {
    P.line(-1.3, 0, 3.4, 0, { tone: "line", w: 2 });
    P.line(3.4, 0, 4.0, 0.5, { tone: "line", w: 2 }); P.line(4.0, 0.5, 4.5, 0.5, { tone: "line", w: 2 });
    for (const [l, x, y] of [["A", -1.3, 0], ["B", 3.4, 0], ["C", 4.0, 0.5], ["D", 4.5, 0.5]] as const) P.mono(x, y, l, { tone: "data", size: 11, dyPx: 16 });
    const s = m.state(t);
    P.cart(s.a.x, 0, { wPx: 50, label: "1" });
    P.cart(s.b.x, 0, { wPx: 60, label: "2", tone: "b2" });
    P.arrowPx(s.a.x, 0.7, s.a.vx * 40, 0, { tone: "vel" }); P.arrowPx(s.b.x, 1.1, s.b.vx * 40, 0, { tone: "vel" });
    const contact = t >= m.events.hit && t <= m.events.sep;
    if (contact) { P.arrowPx((s.a.x + s.b.x) / 2 + 0.05, 0.25, 40, 0, { tone: "force", label: "F" }); if (part === 3) P.arrowPx((s.a.x + s.b.x) / 2 - 0.05, 0.25, -40, 0, { tone: "ask", label: "?" }); }
    if (part === 0) askLabel(P, 1.5, 2.0, "∫F dt ?", 0, 0);
    if (part === 1 && t >= m.events.sep) askLabel(P, s.b.x, 1.1, "m₂ = ?", 20, -16);
    if (part === 2) askLabel(P, s.a.x, 0.7, "v₁ ?", 20, -16);
    if (part === 4) askLabel(P, 4.0, 0.5, "v(t) ?", 0, -40);
  },
});
