import { shmSpec } from "./_shm";

/**
 * 1983 q3: A (2m) on a spring with B (m) hanging from it on a string; at rest the spring is d longer than relaxed.
 * The string breaks: A oscillates about its new rest point, d/3 higher, with amplitude d/3. Drawn: m = 1 kg, d = 0.3 m
 * (k = 3mg/d = 100 N/m). B falls away (drawn: free fall).
 */
export const spec = shmSpec({
  id: "bagrut-1983-q3",
  k: 100,
  m: 2,
  A: -0.1,
  vertical: true,
  L0: 0.5,
  periods: 1.5,
  parts: [
    { caption: "החוט נקרע ו-B נופל. מה המשרעת של התנודות של A?", ask: "A = ?" },
    { caption: "מה זמן המחזור של התנודות?", ask: "T = ?", clock: false },
    { caption: "מה המהירות המרבית של A?", ask: "v max = ?" },
    { caption: "מה הכוח השקול המרבי על A?", ask: "ΣF max = ?" },
  ],
  extra: (P, y, t) => { const yb = -0.5 - 0.1 - 0.2 - 5 * t * t; if (yb > -1.2) P.block(0, yb, { wPx: 22, hPx: 20, base: false, tone: "b2", label: "B" }); P.mono(0, y, "A", { tone: "text", size: 11 }); },
});
