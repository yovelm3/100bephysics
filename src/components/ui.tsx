import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Page({ title, children, narrow = true }: { title: string; children: ReactNode; narrow?: boolean }) {
  return (
    <main className={`mx-auto flex w-full ${narrow ? "max-w-md" : "max-w-4xl"} flex-1 flex-col gap-5 px-4 py-8`}>
      <h1 className="text-2xl font-bold text-accent">{title}</h1>
      {children}
    </main>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 ${className}`}>{children}</div>;
}

export function Field({ label, ...props }: { label: string } & ComponentProps<"input">) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      <input
        {...props}
        className="rounded-lg border border-line bg-background px-3 py-2.5 text-base font-normal outline-none focus:border-accent"
      />
    </label>
  );
}

export function Button({ children, variant = "primary", ...props }: { variant?: "primary" | "ghost" | "danger" } & ComponentProps<"button">) {
  const styles = {
    primary: "bg-accent text-surface hover:opacity-90",
    ghost: "border border-line text-accent hover:bg-accent-soft",
    danger: "border border-warn text-warn hover:bg-warn-soft",
  }[variant];
  return (
    <button
      {...props}
      className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${styles} ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "ok" | "warn"; children: ReactNode }) {
  const styles = {
    info: "bg-accent-soft text-accent",
    ok: "bg-key-soft text-key",
    warn: "bg-warn-soft text-warn",
  }[tone];
  return <div className={`rounded-lg px-4 py-3 text-sm ${styles}`}>{children}</div>;
}

export function TextLink(props: ComponentProps<typeof Link>) {
  return <Link {...props} className={`font-semibold text-accent underline-offset-4 hover:underline ${props.className ?? ""}`} />;
}

export function formatDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeZone: "Asia/Jerusalem" }).format(new Date(d));
}

export function formatDateTime(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Jerusalem" }).format(new Date(d));
}
