"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Friendly Hebrew error page instead of the default English one. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-12">
      <h1 className="text-2xl font-bold text-accent">משהו השתבש</h1>
      <p className="text-muted">לא הצלחנו לטעון את הדף. נסה שוב, ואם זה חוזר, פנה למנהל האתר.</p>
      {error.digest && <p className="ltr self-end text-xs text-muted">קוד שגיאה: {error.digest}</p>}
      <div className="flex gap-3">
        <button onClick={reset} className="rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold text-on-cta">
          לנסות שוב
        </button>
        <Link href="/" className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-accent">
          לדף הבית
        </Link>
      </div>
    </main>
  );
}
