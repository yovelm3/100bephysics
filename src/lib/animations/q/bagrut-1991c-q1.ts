import { shmSpec } from "./_shm";

/** 1991c q1: a particle in harmonic motion (drawn T = 4 s); its velocity graph is given. */
export const spec = shmSpec({
  id: "bagrut-1991c-q1",
  k: (Math.PI / 2) ** 2, m: 1, A: 0.5, periods: 1.25,
  parts: [
    { caption: "איזה מהמשפטים על הרגע t = 1 s לא נכון?", ask: "?" },
  ],
});
