import dynamic from "next/dynamic";
import { createElement, type ComponentType } from "react";
import { SPECS } from "@/lib/animations/q";
import { SceneAnimation } from "./SceneAnimation";

type Props = { part: number };

/** Animated figures by exercise id. Each receives the part index (0 = א). */
export const ANIMATIONS: Record<string, ComponentType<Props>> = {
  "bagrut-1987-q1": dynamic(() => import("./Bagrut1987Q1")),
  ...Object.fromEntries(
    Object.entries(SPECS).map(([id, load]) => [
      id,
      dynamic(() => load().then(({ spec }) => (props: Props) => createElement(SceneAnimation, { spec, part: props.part }))),
    ]),
  ),
};
