import { shmSpec } from "./_shm";

/** 2017 q7: a 1.2 kg cart on a spring of 30 N/m, pulled 10 cm to A and let go (ω = 5 s⁻¹). */
export const spec = shmSpec({
  id: "bagrut-2017-q7",
  k: 30, m: 1.2, A: 0.1, periods: 1,
  answers: { vmax: [0.5, 1e-3] },
  parts: [
    { caption: "איזו תנועה עושה הקרונית בדרך מ-A ל-O?", ask: "?", until: 0.25 },
    { caption: "כמה זמן עד שהקרונית עוברת בפעם הראשונה ב-O?", ask: "t = ?", until: 0.25, clock: false },
    { caption: "בדרך חזרה מ-B אל O: מה הכיוון של המהירות ושל התאוצה?", ask: "v, a ?", from: 0.5, until: 0.75 },
    { caption: "מה המהירות ומה התאוצה ברגע שהיא עוברת ב-O?", ask: "v, a = ?", until: 0.25 },
    { caption: "האם יכול להיות שהמהירות אפס והתאוצה לא אפס?", ask: "?", until: 0.5 },
  ],
});
