import { orbitSpec } from "./_space";

/** 1987c q27: a spacecraft in orbit; in it everything is weightless, so a mass cannot be weighed. */
export const spec = orbitSpec({
  id: "bagrut-1987c-q27",
  R: 6.4e6,
  r: 6.8e6,
  gm: 10 * 6.4e6 ** 2,
  laps: 1,
  parts: [
    { caption: "איך אפשר למדוד מסה של גוף במעבדה של חללית שמקיפה את כדור הארץ?", ask: "m = ?" },
  ],
});
