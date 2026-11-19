/**
 * Content tool.
 *   npm run content:check            validate every exercise file, print a summary
 *   npm run content:sql [-- out.sql] print (or write) the SQL that imports topics + exercises
 *
 * The SQL is applied to Supabase by Claude through the Supabase connection (or pasted into the SQL editor).
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { loadContent } from "../src/lib/content/load";
import { exerciseSql, topicsSql } from "../src/lib/content/sql";

const root = path.resolve(__dirname, "../content");
const [cmd, out] = process.argv.slice(2);
const { topics, exercises, errors } = loadContent(root);

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}

if (cmd === "check") {
  const byStatus = { draft: 0, published: 0 } as Record<string, number>;
  const review = exercises.filter((x) => x.exercise.needsReview);
  for (const { exercise } of exercises) byStatus[exercise.status]++;
  console.log(`✓ ${exercises.length} exercise file(s) valid · ${byStatus.published} published · ${byStatus.draft} draft · ${review.length} marked for review`);
  for (const r of review) console.log(`  ⚑ ${r.file}: ${r.exercise.reviewNotes}`);
} else if (cmd === "sql") {
  const sql = ["begin;", topicsSql(topics), ...exercises.map((x) => exerciseSql(x.exercise, x.svg)), "commit;"].join("\n\n") + "\n";
  if (out) {
    writeFileSync(out, sql);
    console.error(`wrote ${out} (${exercises.length} exercises)`);
  } else process.stdout.write(sql);
} else {
  console.error("usage: content.ts check | sql [out.sql]");
  process.exit(2);
}
