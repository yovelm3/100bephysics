import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

/** Top bar. Shows login links or account links; does not register the device (protected pages do). */
export async function SiteHeader() {
  const supabase = await createClient();
  let loggedIn = false;
  let isAdmin = false;
  if (supabase) {
    const { data } = await supabase.auth.getClaims();
    loggedIn = !!data?.claims?.sub;
    if (loggedIn) {
      const { data: admin } = await supabase.rpc("is_admin");
      isAdmin = admin === true;
    }
  }
  return (
    <header className="bg-accent text-on-accent">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-on-accent">
          <span className="ltr">100</span> בפיזיקה
        </Link>
        <nav className="flex items-center gap-4 text-sm font-semibold">
          {isAdmin && <Link href="/admin" className="text-on-accent hover:underline">ניהול</Link>}
          {loggedIn ? (
            <Link href="/account" className="text-on-accent hover:underline">החשבון שלי</Link>
          ) : (
            <>
              <Link href="/login" className="text-on-accent hover:underline">התחברות</Link>
              <Link href="/signup" className="rounded-lg bg-cta px-3 py-1.5 text-on-cta">הרשמה</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

/** Static version shown while the session is read. */
export function SiteHeaderShell() {
  return (
    <header className="bg-accent text-on-accent">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-on-accent">
          <span className="ltr">100</span> בפיזיקה
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-4xl flex-wrap gap-4 px-4 py-4 text-xs text-muted">
        <Link href="/terms">תקנון</Link>
        <Link href="/privacy">מדיניות פרטיות</Link>
      </div>
    </footer>
  );
}
