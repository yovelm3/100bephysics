import { z } from "zod";

/**
 * Format of one exercise file in content/<pool>/<topic>/<name>.json.
 * Text fields may contain inline formulas as $...$ (KaTeX).
 */

/** Skills (also the fixed list of mistake types) used for the personal plan. */
export const SKILLS = ["understanding", "principle", "fbd", "signs", "algebra", "units", "graph"] as const;
export const SKILL_NAMES: Record<(typeof SKILLS)[number], string> = {
  understanding: "הבנת השאלה",
  principle: "בחירת עיקרון או נוסחה",
  fbd: "תרשים כוחות",
  signs: "כיוונים וסימנים",
  algebra: "אלגברה",
  units: "יחידות",
  graph: "קריאת גרף",
};

const text = z.string().trim().min(1);

export const SolutionStepSchema = z.union([
  z.object({ explain: text }).strict(),
  z.object({ what: text, why: text, tex: text, check: z.boolean().optional() }).strict(),
]);

const NumberAnswer = z
  .object({
    type: z.literal("number"),
    value: z.number().finite(),
    unit: z.string().trim(),
    /** null/absent = exact check by significant figures. Only for parts with a real reason (graph reading, rounded intermediate). */
    tolerancePct: z.number().positive().max(10).nullable().optional(),
  })
  .strict();

const ChoiceAnswer = z
  .object({
    type: z.literal("choice"),
    choices: z.array(text).min(2).max(8),
    correct: z.number().int().min(0),
  })
  .strict()
  .refine((a) => a.correct < a.choices.length, { message: "correct must point at one of the choices" });

const OpenAnswer = z.object({ type: z.literal("open") }).strict(); // drawing / explanation, not checked automatically

export const PartSchema = z
  .object({
    label: text,
    question: text,
    answer: z.union([NumberAnswer, ChoiceAnswer, OpenAnswer]),
    skills: z.array(z.enum(SKILLS)).min(1),
    solution: z.array(SolutionStepSchema).min(1),
    finalAnswer: text,
    /** The final answer as printed in the source answer key (for comparison), or null if the key has none. */
    keyAnswer: z.string().trim().nullable().default(null),
    animation: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const ExerciseSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "id: lowercase letters, digits and dashes"),
    pool: z.enum(["bagrut", "mechina"]),
    openToHighschool: z.boolean().default(false),
    source: z.object({ year: z.number().int().min(1950).max(2100).nullable(), label: z.string().trim().nullable() }).strict(),
    topic: text,
    subtopic: text,
    group: z.string().uuid().nullable().default(null),
    difficulty: z.number().int().min(1).max(5),
    status: z.enum(["draft", "published"]),
    needsReview: z.boolean().default(false),
    reviewNotes: z.string().default(""),
    stem: text,
    figure: z
      .object({ type: z.enum(["svg", "image"]), file: text, alt: text, provisional: z.boolean().default(false) })
      .strict()
      .nullable()
      .default(null),
    authorNote: z.string().trim().nullable().default(null),
    concepts: z.array(text).default([]),
    summary: z.string().trim().default(""),
    position: z.number().int().default(0),
    parts: z.array(PartSchema).min(1),
  })
  .strict()
  .superRefine((e, ctx) => {
    if (e.pool === "bagrut" && e.openToHighschool) ctx.addIssue({ code: "custom", message: "only mechina exercises can be open to high school" });
    if (e.openToHighschool && e.difficulty < 4) ctx.addIssue({ code: "custom", message: "mechina exercises open to high school must be difficulty 4 or 5" });
    if (e.pool === "bagrut" && !e.source.label) ctx.addIssue({ code: "custom", message: "bagrut exercises need a source label like '1987 שאלה 1'" });
    if (e.status === "published" && e.needsReview) ctx.addIssue({ code: "custom", message: "an exercise marked for review cannot be published" });
    const labels = e.parts.map((p) => p.label);
    if (new Set(labels).size !== labels.length) ctx.addIssue({ code: "custom", message: "part labels must be unique" });
  });

export type Exercise = z.infer<typeof ExerciseSchema>;
export type Part = z.infer<typeof PartSchema>;
export type SolutionStep = z.infer<typeof SolutionStepSchema>;

export const TopicsSchema = z.object({
  _comment: z.string().optional(),
  topics: z.array(
    z.object({ id: text, name: text, subtopics: z.array(z.object({ id: text, name: text }).strict()).min(1) }).strict(),
  ),
});
export type Topics = z.infer<typeof TopicsSchema>;
