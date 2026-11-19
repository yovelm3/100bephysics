import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { ExerciseSchema, TopicsSchema, type Exercise, type Topics } from "./schema";

export type LoadResult = { topics: Topics; exercises: { file: string; exercise: Exercise; svg: string | null }[]; errors: string[] };

/** Our own SVG drawings only: no scripts, event handlers, external references or foreign objects. */
export function checkSvg(svg: string): string | null {
  if (!/^\s*<svg[\s>]/.test(svg)) return "must start with <svg";
  if (/<script|<foreignObject|\son[a-z]+\s*=|javascript:|xlink:href\s*=\s*["']https?:|href\s*=\s*["']https?:/i.test(svg)) return "contains scripts, handlers or external links";
  if (!/viewBox=/.test(svg)) return "needs a viewBox";
  return null;
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : name.endsWith(".json") ? [p] : [];
  });
}

/** Reads and validates content/topics.json and every exercise file under content/<pool>/<topic>/. */
export function loadContent(root: string): LoadResult {
  const errors: string[] = [];
  const topics = TopicsSchema.parse(JSON.parse(readFileSync(path.join(root, "topics.json"), "utf8")));
  const subtopicTopic = new Map<string, string>();
  for (const t of topics.topics) for (const s of t.subtopics) subtopicTopic.set(s.id, t.id);

  const exercises: LoadResult["exercises"] = [];
  const seen = new Map<string, string>();
  for (const pool of ["bagrut", "mechina"]) {
    for (const file of walk(path.join(root, pool))) {
      const rel = path.relative(root, file);
      let raw: unknown;
      try {
        raw = JSON.parse(readFileSync(file, "utf8"));
      } catch (e) {
        errors.push(`${rel}: invalid JSON (${(e as Error).message})`);
        continue;
      }
      const r = ExerciseSchema.safeParse(raw);
      if (!r.success) {
        for (const issue of r.error.issues) errors.push(`${rel}: ${issue.path.join(".") || "(file)"}: ${issue.message}`);
        continue;
      }
      const e = r.data;
      const [dirPool, dirTopic] = rel.split(path.sep);
      if (e.pool !== dirPool) errors.push(`${rel}: pool "${e.pool}" does not match folder "${dirPool}"`);
      if (e.topic !== dirTopic) errors.push(`${rel}: topic "${e.topic}" does not match folder "${dirTopic}"`);
      if (subtopicTopic.get(e.subtopic) !== e.topic) errors.push(`${rel}: subtopic "${e.subtopic}" is not part of topic "${e.topic}"`);
      if (seen.has(e.id)) errors.push(`${rel}: id "${e.id}" already used in ${seen.get(e.id)}`);
      seen.set(e.id, rel);
      let svg: string | null = null;
      if (e.figure) {
        const fp = path.join(path.dirname(file), e.figure.file);
        if (!existsSync(fp)) errors.push(`${rel}: figure file "${e.figure.file}" not found`);
        else if (e.figure.type === "svg") {
          svg = readFileSync(fp, "utf8");
          const bad = checkSvg(svg);
          if (bad) errors.push(`${rel}: figure ${e.figure.file}: ${bad}`);
        }
      }
      exercises.push({ file: rel, exercise: e, svg });
    }
  }
  return { topics, exercises, errors };
}
