// Reads the session / search params on every request.
export const instant = false;

import { redirect } from "next/navigation";
import { Card, Page } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { ResetForm } from "./Form";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = (await supabase?.auth.getClaims()) ?? { data: null };
  if (!data?.claims) redirect("/forgot-password");
  return (
    <Page title="בחירת סיסמה חדשה">
      <Card>
        <ResetForm />
      </Card>
    </Page>
  );
}
