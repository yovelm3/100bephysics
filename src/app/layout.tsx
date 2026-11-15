import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

// Temporary font until a design direction is chosen.
const heebo = Heebo({
  variable: "--font-hebrew",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "100 בפיזיקה",
  description: "מאגר תרגילים בפיזיקה לבגרות, עם בדיקת תשובות ופתרונות מלאים",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
