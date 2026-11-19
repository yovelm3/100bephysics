import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-12">
      <h1 className="text-2xl font-bold text-accent">הדף לא נמצא</h1>
      <p className="text-muted">ייתכן שהקישור שגוי, או שהדף הועבר.</p>
      <Link href="/" className="self-start rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold text-on-cta">
        לדף הבית
      </Link>
    </main>
  );
}
