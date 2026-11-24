import { shmSpec } from "./_shm";

/** 1985 q2: a 20 kg board on 6 identical springs; 10 kg more on it sinks it 10 cm (k = 166.7 N/m each). The loaded board (30 kg on 1000 N/m) oscillates: T = 1.09 s. */
export const spec = shmSpec({
  id: "bagrut-1985-q2",
  k: 1000,
  m: 30,
  A: 0.05,
  vertical: true,
  below: true,
  L0: 0.4,
  periods: 2,
  answers: { T: [1.0882796185405306, 1e-3] },
  parts: [
    { caption: "גוף של 10 ק\"ג על הלוח מוריד אותו 10 ס\"מ. מה קבוע הקפיץ של כל אחד מששת הקפיצים?", ask: "k = ?", until: 0.02 },
    { caption: "הלוח העמוס מתנודד למעלה ולמטה. מה זמן המחזור?", ask: "T = ?", clock: false },
    { caption: "שני קפיצים נשברו. איך זה משפיע על זמן המחזור?", ask: "T ?", clock: false },
  ],
});
