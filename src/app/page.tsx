import Link from "next/link";
import { InlineText, SolutionSteps, type SolutionStep } from "@/components/SolutionSteps";

// Temporary home page: the approved solution format (1987, question 1, part A).
// The full landing page is built in stage 3.
const demo: SolutionStep[] = [
  {
    kind: "explain",
    text: "הכוח נתון לפי זמן, $0.01\\,\\text{s}$, ולכן פותרים בקינמטיקה. קודם מוצאים את התאוצה מהחוק השני של ניוטון, ואחר כך את המהירות ממשוואת המהירות.",
  },
  { kind: "step", what: "ממירים מסה לק״ג", why: "הכוח נתון בניוטון, וניוטון מוגדר על ק״ג. בגרמים התאוצה תצא גדולה פי 1000", tex: "m = 400\\,\\text{g} = 0.4\\,\\text{kg}" },
  { kind: "step", what: "כותבים את החוק השני של ניוטון בכיוון האופקי", why: "הכוח נתון לפי זמן, ולכן עובדים בקינמטיקה. החוק השני מחבר בין הכוח הנתון לתאוצה שצריך למצוא. בכיוון האופקי פועל רק כוח הדחיפה, כי הכובד אנכי", tex: "F = m \\cdot a" },
  { kind: "step", what: "מבודדים את $a$", why: "זה הנעלם היחיד במשוואה", tex: "a = \\frac{F}{m}" },
  { kind: "step", what: "מציבים $F = 1000$ ו-$m = 0.4$", why: "שני הנתונים כבר ביחידות הנכונות", tex: "a = \\frac{1000}{0.4}" },
  { kind: "step", what: "מחלקים", why: "התאוצה עצומה, אבל היא פועלת רק מאית שנייה", tex: "a = 2500\\,\\text{m/s}^2" },
  { kind: "step", what: "בוחרים את משוואת המהירות בתאוצה קבועה", why: "ידועים התאוצה, הזמן והמהירות ההתחלתית, ומחפשים מהירות. זו המשוואה שמקשרת בדיוק את ארבעתם, בלי מקום", tex: "v = v_0 + a \\cdot t" },
  { kind: "step", what: "מציבים $v_0 = 0$ ו-$t = 0.01$", why: "הכדור מונח לפני הדחיפה, והכוח פועל במשך $0.01\\,\\text{s}$", tex: "v = 0 + 2500 \\cdot 0.01" },
  { kind: "step", what: "כופלים", why: "זו המהירות ברגע שהכוח מפסיק, כלומר מהירות היציאה. מעכשיו היא קבועה בכיוון האופקי", tex: "v = 25\\,\\text{m/s}" },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10">
      <header className="flex flex-col items-center gap-4 text-center">
        <h1 className="max-w-[18ch] text-4xl leading-tight font-extrabold text-balance md:text-5xl">
          מאגר אחד, כל הנושאים, ותוכנית <span className="text-accent">שמכירה אותך.</span>
        </h1>
        <p className="max-w-[52ch] text-lg text-muted">
          האתר עוקב אחרי החומר שלמדת ואחרי המקומות שבהם נתקעת, ובונה לך מסלול תרגול שמוביל ל-<span className="ltr">100</span>.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/signup" className="rounded-xl bg-cta px-6 py-3 text-lg font-bold text-on-cta">להרשמה</Link>
          <Link href="/subscribe" className="rounded-xl border-2 border-accent px-6 py-3 text-lg font-bold">פרטים על המנוי</Link>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <p className="text-sm font-bold text-muted">דוגמה לפורמט הפתרון · בגרות <span className="ltr">1987</span>, שאלה <span className="ltr">1</span>, סעיף א</p>
        <p className="font-semibold">
          <InlineText text="מה מהירות היציאה של הכדור?" />
        </p>
        <SolutionSteps steps={demo} />
        <p className="flex justify-between border-t border-line pt-3 font-bold">
          <span>תשובה סופית</span>
          <span className="ltr">25 m/s</span>
        </p>
      </section>

      <p className="text-center text-sm text-muted">האתר בבנייה. בקרוב: מאגר התרגילים במכניקה.</p>
    </main>
  );
}
