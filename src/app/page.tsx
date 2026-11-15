import { Math } from "@/components/Math";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
      <h1 className="text-3xl font-bold text-accent">
        <span className="ltr">100</span> בפיזיקה
      </h1>
      <p className="text-lg text-muted">
        מאגר תרגילים בפיזיקה לבגרות: תרגילים לפי נושאים, בדיקת תשובה ופתרון מלא שלב אחר שלב.
      </p>
      <div className="rounded-xl border border-line bg-white p-5">
        <p className="mb-2 text-sm text-muted">בדיקת נוסחאות:</p>
        <Math tex={"v^2 = v_0^2 - 2gh"} block />
      </div>
      <p className="text-sm text-muted">האתר בבנייה. בקרוב: הרשמה, מנוי ומאגר התרגילים במכניקה.</p>
    </main>
  );
}
