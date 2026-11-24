import { shmSpec } from "./_shm";

/** 1992 q3: a basket on a spring with iron cylinders of 300 g; drawn with 3 cylinders in all (0.9 kg) and k = 39.7 N/m. */
export const spec = shmSpec({
  id: "bagrut-1992-q3",
  k: 39.70416413759692, m: 0.9, A: 0.08, vertical: true, periods: 2,
  parts: [
    { caption: "למה התלמיד מדד עשרה מחזורים?", ask: "10T ?", clock: false },
    { caption: "איך נראה הגרף של T² כפונקציה של מספר הגלילים?", ask: "T² (n) ?", clock: false },
    { caption: "האם הקו עובר בראשית? מה מייצגות נקודות החיתוך?", ask: "?", clock: false },
    { caption: "מה הקבוע של הקפיץ?", ask: "k = ?", clock: false },
  ],
});
