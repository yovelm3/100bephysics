import { joinSpecs } from "../kits";
import { orbitSpec, radialSpec } from "./_space";

/**
 * 1981 q2: a 500 kg satellite in a circular orbit 3r above the Earth (radius 4r, 4000 m/s); a 100 kg meteorite hits it
 * and both stop, then fall straight down to A (9.8 km/s if nothing slowed them). g = 10 m/s², r = 6400 km.
 */
const R = 6.4e6, gm = 10 * R * R;
const orbit = orbitSpec({
  id: "bagrut-1981-q2", R, r: 4 * R, gm, laps: 1, answers: { v: [4000, 1e-6] },
  parts: [
    { caption: "מה הייתה מהירות הלוויין לפני שהמטאוריט פגע בו?", ask: "v = ?", until: 0.25 },
    { caption: "הלוויין והמטאוריט נעצרו בפגיעה. מה הייתה מהירות המטאוריט?", ask: "u = ?", until: 0.25 },
    { caption: "כמה חום נוצר בהתנגשות?", ask: "Q = ?", until: 0.25 },
  ],
  extra: (P, _c, _t, part) => { P.mono(0, R, "A", { tone: "data", size: 12, dyPx: -8 }); void part; },
});
const fall = radialSpec({
  id: "bagrut-1981-q2", R, gm, r0: 4 * R, v0: 0, r1: R, answers: { vEnd: [9797.958971132713, 1] },
  parts: [{ caption: "הלוויין והמטאוריט נופלים ישר אל A. באיזו מהירות היו פוגעים בה, בלי חיכוך?", ask: "v = ?", at: "planet" }],
});
export const spec = joinSpecs("bagrut-1981-q2", [{ key: "orbit", spec: orbit, parts: [0, 1, 2] }, { key: "fall", spec: fall, parts: [0] }]);
