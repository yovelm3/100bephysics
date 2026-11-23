import { body, type Story } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2011 q2: a student pulls a box through a spring (K = 12 N/m) slowly (2 cm/s at the end of the spring). The box starts
 * to slide when K·Δℓ reaches μ·(M + n·m)·g (μ = 0.3, M = 0.2 kg, m = 80 g). Runs with n = 0…3 cylinders inside.
 */
const g = 10, K = 12, mu = 0.3, M = 0.2, m = 0.08, u = 0.02;
const run = (n: number): Story => ({
  init: { h: body(0, 0, u, 0) },
  phases: [{
    end: "slip",
    acc: {},
    dur: () => (mu * (M + n * m) * g) / K / u,
    until: (s) => K * s.h.x >= mu * (M + n * m) * g,
    force: () => ({}),
  }],
  record: { dl: ["slip", (s) => s.h.x] },
});
const scen = Object.fromEntries([0, 1, 2, 3].map((n) => [`n${n}`, run(n)]));
export const spec = storySpec({
  id: "bagrut-2011-q2",
  view: { x0: -0.06, x1: 0.26, y0: -0.13, y1: 0.03 },
  scale: 0.2,
  scenarios: scen,
  order: Object.fromEntries(Object.keys(scen).map((k) => [k, ["slip"]])),
  answers: { "n0.dl": [0.05, 1e-9], "n1.dl": [0.07, 1e-9] },
  parts: [
    { to: () => 1, pace: 2, caption: "הקפיץ מושך את הקופסה הריקה, והיא במנוחה. אילו כוחות פועלים עליה?" },
    { to: (mm) => mm.events["n3.slip"], pace: 2, caption: "בכל ניסוי מוסיפים גליל, ומודדים את ההתארכות כשהקופסה על סף תנועה. מה השיפוע של הגרף, ומה המשמעות שלו?" },
    { to: (mm) => mm.events["n3.slip"], pace: 2, caption: "הוכיחו את הקשר בין ההתארכות למספר הגלילים." },
    { to: (mm) => mm.events["n3.slip"], pace: 2, caption: "K = 12 N/m, מסת גליל 80 g. מה מקדם החיכוך הסטטי?" },
    { to: (mm) => mm.events["n3.slip"], pace: 2, caption: "מה המסה של הקופסה הריקה, לפי הגרף?" },
    { to: () => 1, pace: 2, caption: "הקופסה הריקה, וההתארכות 2 ס\"מ. מה כוח החיכוך עליה?" },
  ],
  draw: (P, mm, t, part) => {
    const rows = part === 0 || part === 5 ? [0] : [0, 1, 2, 3];
    rows.forEach((n, i) => {
      const y = -0.035 * i;
      const h = mm.state(Math.min(t, mm.events[`n${n}.slip`]))[`n${n}.h`];
      P.line(-0.05, y, 0.25, y, { tone: "line", w: 1 });
      P.block(0, y, { wPx: 44, hPx: 22 });
      for (let c = 0; c < n; c++) P.circle(-0.012 + c * 0.008, y + 0.008, 3, { fill: "b2" });
      // the spring from the box's side (natural length 6 cm) to the student's hand
      P.spring(0.014, y + 0.008, 0.074 + h.x, y + 0.008, { coils: 7, ampPx: 4 });
      P.circle(0.074 + h.x, y + 0.008, 4, { fill: "runner" });
      if (t >= mm.events[`n${n}.slip`] - 1e-9) P.heb(0.2, y + 0.008, "סף תנועה", { tone: "data", size: 10 });
    });
    if (part === 0) askLabel(P, 0, 0.01, "?", 0, -16);
    if (part === 1) askLabel(P, 0.12, 0.02, "slope = ?", 0, 0);
    if (part === 2) askLabel(P, 0.12, 0.02, "Δℓ(n) ?", 0, 0);
    if (part === 3) askLabel(P, 0.12, 0.02, "μ = ?", 0, 0);
    if (part === 4) askLabel(P, 0.12, 0.02, "M = ?", 0, 0);
    if (part === 5) askLabel(P, 0, 0.01, "f = ?", 0, -16);
  },
});
