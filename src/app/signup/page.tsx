import type { Metadata } from "next";
import { Card, Page, TextLink } from "@/components/ui";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "הרשמה | 100 בפיזיקה" };

export default function SignupPage() {
  return (
    <Page title="הרשמה">
      <Card>
        <SignupForm />
      </Card>
      <p className="text-sm text-muted">
        כבר יש לך חשבון? <TextLink href="/login">להתחברות</TextLink>
      </p>
    </Page>
  );
}
