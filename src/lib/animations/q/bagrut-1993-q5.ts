import { shmSpec } from "./_shm";

/** 1993 q5: 0.8 kg on a vertical spring, pulled down A = 15 cm and let go; T = 1.2 s (k = 21.9 N/m). y up, from equilibrium. */
export const spec = shmSpec({
  id: "bagrut-1993-q5",
  k: 4 * Math.PI ** 2 * 0.8 / 1.2 ** 2, m: 0.8, A: -0.15, vertical: true, periods: 1.25,
  answers: { T: [1.2, 1e-3] },
  parts: [
    { caption: "מה A?", ask: "A = ?", until: 0.01 },
    { caption: "מה זמן המחזור?", ask: "T = ?", clock: false },
    { caption: "מה קבוע הקפיץ?", ask: "k = ?" },
    { caption: "מתי, בין 0.1 ל-1.4 שניות, המהירות אפס?", ask: "v = 0 ?" },
    { caption: "מתי, בין 0.1 ל-1.4 שניות, התאוצה אפס?", ask: "a = 0 ?" },
    { caption: "מה הכיוון של הכוח השקול ב-t = 1 s?", ask: "ΣF ?", until: 0.8333333333333334 },
  ],
});
