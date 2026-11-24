import { shmSpec } from "./_shm";

/** 1980 q3: a spring stretched 10 cm by 20 N (k = 200 N/m) with 2 kg at its end, let go: ω = 10 s⁻¹, vmax = 1 m/s. */
export const spec = shmSpec({
  id: "bagrut-1980-q3",
  k: 200, m: 2, A: 0.1, periods: 1.25,
  answers: { vmax: [1, 1e-3] },
  parts: [
    { caption: "איזו תנועה עושה המסה אחרי השחרור?", ask: "?" },
    { caption: "מה המהירות הגדולה ביותר של המסה?", ask: "v max = ?" },
    { caption: "כמה זמן אחרי השחרור המהירות מגיעה בפעם הראשונה לגודל המרבי?", ask: "t = ?", until: 0.25, clock: false },
    { caption: "באיזה רגע התאוצה בפעם הראשונה הגדולה ביותר? מה המהירות אז?", ask: "a max ?", until: 0.25 },
  ],
});
