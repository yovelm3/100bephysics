import { orbitSpec } from "./_space";

/** 1980w q3: a satellite above the equator that turns with the Earth (period one day); g = 10 m/s², R = 6400 km. */
export const spec = orbitSpec({
  id: "bagrut-1980w-q3",
  R: 6.4e6,
  r: Math.cbrt((10 * 6.4e6 ** 2 * 86400 ** 2) / (4 * Math.PI ** 2)),
  gm: 10 * 6.4e6 ** 2,
  laps: 1,
  extra: (P, _c, t) => { const a = (2 * Math.PI * t) / 86400; P.line(0, 0, 6.4e6 * Math.cos(a), 6.4e6 * Math.sin(a), { tone: "line", w: 2 }); },
  parts: [
    { caption: "הלוויין מקיף את כדור הארץ באותה מהירות זוויתית שבה כדור הארץ מסתובב. מה המרחק שלו ממרכז כדור הארץ?", ask: "r = ?", at: "orbit" },
  ],
});
