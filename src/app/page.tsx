import { SolutionSteps, type SolutionStep } from "@/components/SolutionSteps";

// Demo of the solution format. Not a real exercise from the bank.
const demo: SolutionStep[] = [
  { kind: "explain", text: "לא נתון זמן ולא מבקשים זמן, ולכן בוחרים במשוואה שלא תלויה בזמן." },
  { kind: "step", what: "משוואה בלי זמן", tex: "v^2 = v_0^2 - 2gh" },
  { kind: "step", what: "בשיא הגובה המהירות אפס", tex: "v = 0", highlight: "warn" },
  { kind: "step", what: "הצבה", tex: "0 = 20^2 - 2\\cdot 10\\cdot h" },
  { kind: "step", what: "העברת אגפים", tex: "20h = 400" },
  { kind: "step", what: "חילוק ב-20", tex: "h = 20\\ \\text{m}", highlight: "key" },
  { kind: "explain", text: "בדיקה בדרך אחרת: מוצאים את זמן העלייה ומציבים במשוואת המקום." },
  { kind: "step", what: "זמן העלייה", tex: "t = \\frac{v_0}{g} = \\frac{20}{10} = 2\\ \\text{s}" },
  { kind: "step", what: "הצבה במשוואת המקום", tex: "h = 20\\cdot 2 - \\tfrac{1}{2}\\cdot 10\\cdot 2^2 = 20\\ \\text{m}", highlight: "key" },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-accent">
          <span className="ltr">100</span> בפיזיקה
        </h1>
        <p className="text-lg text-muted">
          מאגר תרגילים בפיזיקה לבגרות: תרגילים לפי נושאים, בדיקת תשובה ופתרון מלא שלב אחר שלב.
        </p>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
        <p className="text-sm text-muted">דוגמה לפורמט הפתרון</p>
        <h2 className="text-lg font-bold">
          כדור נזרק אנכית כלפי מעלה במהירות <span className="ltr">20 m/s</span>. מהו הגובה המרבי?
        </h2>
        <SolutionSteps steps={demo} />
      </section>

      <p className="text-sm text-muted">האתר בבנייה. בקרוב: הרשמה, מנוי ומאגר התרגילים במכניקה.</p>
    </main>
  );
}
