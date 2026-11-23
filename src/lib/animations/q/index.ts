import type { AnimSpec } from "../engine";

/** Animated figures built on the shared engine, by exercise id. Each file exports `spec`. */
export const SPECS: Record<string, () => Promise<{ spec: AnimSpec }>> = {
  "bagrut-1980w-q2": () => import("./bagrut-1980w-q2"),
  "bagrut-1981-q1": () => import("./bagrut-1981-q1"),
  "bagrut-1984c-q2": () => import("./bagrut-1984c-q2"),
  "bagrut-1984-q1": () => import("./bagrut-1984-q1"),
  "bagrut-1988-q1": () => import("./bagrut-1988-q1"),
  "bagrut-1990-q1": () => import("./bagrut-1990-q1"),
  "bagrut-1992-q1": () => import("./bagrut-1992-q1"),
  "bagrut-1993-q1": () => import("./bagrut-1993-q1"),
  "bagrut-1994-q1": () => import("./bagrut-1994-q1"),
  "bagrut-1995-q1": () => import("./bagrut-1995-q1"),
  "bagrut-1996-q1": () => import("./bagrut-1996-q1"),
  "bagrut-1998-q1": () => import("./bagrut-1998-q1"),
  "bagrut-1999-q1": () => import("./bagrut-1999-q1"),
  "bagrut-2000-q1": () => import("./bagrut-2000-q1"),
  "bagrut-2001-q1": () => import("./bagrut-2001-q1"),
  "bagrut-2001-q2": () => import("./bagrut-2001-q2"),
};
