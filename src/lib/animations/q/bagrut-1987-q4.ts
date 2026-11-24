import { shmSpec } from "./_shm";

/** 1987 q4: 0.8 kg on a spring, T = 1 s, total energy 1 J (k = 31.6 N/m, A = 0.252 m). */
export const spec = shmSpec({
  id: "bagrut-1987-q4",
  k: 4 * Math.PI ** 2 * 0.8, m: 0.8, A: Math.sqrt(2 / (4 * Math.PI ** 2 * 0.8)), periods: 1.5,
  answers: { vmax: [1.5811388300841898, 1e-3] },
  parts: [
    { caption: "מה המהירות המרבית של הגוף?", ask: "v max = ?" },
    { caption: "מה קבוע הקפיץ?", ask: "k = ?", at: "spring" },
    { caption: "מה המשרעת?", ask: "A = ?", until: 0.01 },
    { caption: "באיזה מרחק משיווי המשקל האנרגיה הקינטית שווה לאנרגיה שבקפיץ?", ask: "x = ?" },
  ],
});
