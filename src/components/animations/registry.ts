import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/** Animated figures by exercise id. Each receives the part index (0 = א). */
export const ANIMATIONS: Record<string, ComponentType<{ part: number }>> = {
  "bagrut-1987-q1": dynamic(() => import("./Bagrut1987Q1")),
};
