// Reads search params on every request.
export const instant = false;

import type { Metadata } from "next";
import { Card, Page, TextLink } from "@/components/ui";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "הרשמה | 100 בפיזיקה" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const t = (await searchParams).track;
  const track = t === "mechina" || t === "highschool" ? t : undefined;
  return (
    <Page title="הרשמה">
      <Card>
        <SignupForm track={track} />
      </Card>
      <p className="text-sm text-muted">
        כבר יש לך חשבון? <TextLink href="/login">להתחברות</TextLink>
      </p>
    </Page>
  );
}
