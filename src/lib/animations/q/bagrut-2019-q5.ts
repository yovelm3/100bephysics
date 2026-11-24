import { shmSpec } from "./_shm";

/** 2019 q5: a mass meter: a platform A (1 kg) on a spring (K = 39.5 N/m), with body B on it (drawn 1 kg), oscillating up and down. */
export const spec = shmSpec({
  id: "bagrut-2019-q5",
  k: 39.47841760435743, m: 2, A: 0.06, vertical: true, below: true, periods: 1.5,
  parts: [
    { caption: "מה היתרון במדידה של עשרה מחזורים?", ask: "10T ?", clock: false },
    { caption: "כתבו את mB כפונקציה של זמן המחזור.", ask: "mB(T) = ?", clock: false },
    { caption: "למה במערכת הזו אי אפשר למדוד זמן מחזור קטן משנייה?", ask: "T < 1 s ?", clock: false },
    { caption: "mA = 1 ק\"ג. מה קבוע הקפיץ?", ask: "K = ?" },
    { caption: "בתרשים (1): איפה המסה ביחס לשיווי המשקל?", ask: "?" },
    { caption: "בתרשים (2): איפה המסה?", ask: "?" },
    { caption: "בתרשים (3): איפה המסה?", ask: "?" },
    { caption: "בתרשים (4): איפה המסה?", ask: "?" },
  ],
});
