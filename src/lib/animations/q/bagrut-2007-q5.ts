import { shmSpec } from "./_shm";

/** 2007 q5: a weight on a vertical spring; the velocity graph (up positive) gives f = 1/12 Hz and vmax = 0.1 m/s, so A = 0.19 m; at t = 0 it passes equilibrium going up. */
export const spec = shmSpec({
  id: "bagrut-2007-q5",
  k: (2 * Math.PI / 12) ** 2, m: 1, A: 0.19098593171027445, vertical: true, fromEq: true, periods: 2,
  answers: { vmax: [0.1, 1e-4] },
  parts: [
    { caption: "מה מצב הקפיץ ברגע t = 0: הכי ארוך, הכי קצר, או בשיווי משקל?", ask: "?", until: 0.02 },
    { caption: "מה התדירות של התנודות?", ask: "f = ?", clock: false },
    { caption: "מה המשרעת?", ask: "A = ?" },
    { caption: "איך נראה גרף המקום כפונקציה של הזמן, לשתי תנודות?", ask: "y(t) ?" },
    { caption: "איך מחשבים מהירות בנקודה אחרת לפי v0 ו-a?", ask: "v₁ = ?" },
  ],
});
