import type { Metadata } from "next";
import Link from "next/link";
import exercise from "../../../content/bagrut/kinematics/bagrut-1987-q1.json";
import { Card, Page } from "@/components/ui";
import { InlineText } from "@/components/SolutionSteps";
import { DemoAnimation } from "./DemoAnimation";

export const metadata: Metadata = {
  title: "הנפשה לדוגמה | 100 בפיזיקה",
  robots: { index: false, follow: false },
};

/**
 * Public showcase link (owner's request): one exercise's animated figure, for showing people.
 * Only the stem and the part questions leave the server; no answers, no solutions.
 */
export default function DemoPage() {
  const parts = exercise.parts.map((p) => ({ label: p.label, question: p.question }));
  return (
    <Page title="ככה נראית שאלה אצלנו" narrow={false}>
      <Card>
        <h2 className="text-lg font-bold text-accent">{exercise.source.label}</h2>
        <p className="leading-relaxed">
          <InlineText text={exercise.stem} />
        </p>
      </Card>
      <DemoAnimation id={exercise.id} parts={parts} />
      <Card className="bg-accent-soft">
        <p>לכל סעיף יש ציור מונפש שמראה מה קורה ומה בדיוק צריך לחשב. הוא מסביר, ולא נותן את התשובה.</p>
        <Link href="/signup" className="self-start rounded-lg bg-cta px-4 py-2.5 font-semibold text-on-cta">להרשמה ולשני תרגילים בחינם</Link>
      </Card>
    </Page>
  );
}
