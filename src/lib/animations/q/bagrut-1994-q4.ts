import { shmSpec } from "./_shm";

/** 1994 q4: 0.6 kg stretches a spring 15 cm (k = 40 N/m); pulled down to M (10 cm more, where the spring pulls 10 N) and let go: T = 0.77 s. */
export const spec = shmSpec({
  id: "bagrut-1994-q4",
  k: 40, m: 0.6, A: -0.1, vertical: true, periods: 1.5,
  answers: { T: [0.7695298980971184, 1e-3] },
  parts: [
    { caption: "מה זו תנועה הרמונית?", ask: "?" },
    { caption: "האם כל תנועה מחזורית היא הרמונית?", ask: "?" },
    { caption: "מה זמן המחזור?", ask: "T = ?", clock: false },
    { caption: "מה הכוח שהקפיץ מפעיל על המשקולת בנקודה M?", ask: "F = ?", until: 0.01 },
    { caption: "מה העבודה שהתלמיד עשה כשמשך את המשקולת מ-O ל-M?", ask: "W = ?", until: 0.01 },
  ],
});
