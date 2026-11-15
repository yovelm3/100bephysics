import type { Metadata } from "next";
import { Suspense } from "react";
import { IBM_Plex_Sans_Hebrew, JetBrains_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { SiteFooter, SiteHeader, SiteHeaderShell } from "@/components/SiteHeader";

const plex = IBM_Plex_Sans_Hebrew({
  variable: "--font-hebrew",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "100 בפיזיקה",
  description: "מאגר תרגילים בפיזיקה לבגרות, עם בדיקת תשובות ופתרונות מלאים",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${plex.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Suspense fallback={<SiteHeaderShell />}>
          <SiteHeader />
        </Suspense>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
