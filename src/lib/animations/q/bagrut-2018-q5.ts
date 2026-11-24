import { shmSpec } from "./_shm";

/** 2018 q5: a cart on a spring compressed 20 cm, let go at B1; photographed every 0.1 s: T = 2 s (M = 3 kg, k = 29.6 N/m). */
export const spec = shmSpec({
  id: "bagrut-2018-q5",
  k: 4 * Math.PI ** 2 * 3 / 4, m: 3, A: -0.2, periods: 1.25,
  answers: { T: [2, 1e-3] },
  extra: (P, x, t) => { for (let k = 0; k <= Math.floor(t / 0.1 + 1e-9); k++) { const xx = 0.6 - 0.2 * Math.cos(Math.PI * k * 0.1); P.line(xx, -0.08, xx, -0.04, { tone: "idle", w: 1.2 }); } void x; },
  parts: [
    { caption: "מה זמן המחזור?", ask: "T = ?", clock: false },
    { caption: "מה המשרעת?", ask: "A = ?", until: 0.01 },
    { caption: "לפי הטבלה: מה המהירות המרבית?", ask: "v max = ?" },
    { caption: "M = 3 ק\"ג. מה קבוע הקפיץ?", ask: "k = ?" },
    { caption: "ב-t = 0.8 s העגלה בנקודה C. אילו כוחות פועלים עליה?", ask: "?", until: 0.4 },
    { caption: "מה גודל הכוח השקול בנקודה C?", ask: "ΣF = ?", until: 0.4 },
    { caption: "מתי שוב פועל אותו כוח שקול, בגודל ובכיוון?", ask: "t₂ = ?", until: 0.75, clock: false },
    { caption: "עגלה במסה כפולה: האם זמן המחזור משתנה?", ask: "T ?" },
    { caption: "כיווץ התחלתי של 10 ס\"מ: האם זמן המחזור משתנה?", ask: "T ?" },
    { caption: "קפיץ עם קבוע כפול: האם זמן המחזור משתנה?", ask: "T ?" },
  ],
});
