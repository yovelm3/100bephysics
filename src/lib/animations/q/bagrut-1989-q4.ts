import { shmSpec } from "./_shm";

/** 1989 q4: 0.4 kg on a track; the net force grows linearly with the displacement (F = −40x, from the graph). At t = 0 it stands at x = 0.2 m. */
export const spec = shmSpec({
  id: "bagrut-1989-q4",
  k: 40, m: 0.4, A: 0.2, periods: 1,
  answers: { vmax: [2, 1e-3] },
  parts: [
    { caption: "איזו תנועה עושה הגוף?", ask: "?" },
    { caption: "כמה זמן עד שהגוף מגיע בפעם הראשונה ל-x = 0?", ask: "t = ?", until: 0.25, clock: false },
    { caption: "מה גודל המהירות ב-x = 0?", ask: "v = ?", until: 0.25 },
    { caption: "מה התאוצה בנקודה x = −0.2 m?", ask: "a = ?", until: 0.5 },
    { caption: "מה מייצג השטח שבין גרף הכוח לציר x, מ-0.2 עד 0? מה ערכו?", ask: "∫F dx = ?", until: 0.25 },
  ],
});
