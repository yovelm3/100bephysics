// Reads settings on every request.
export const instant = false;

import { connection } from "next/server";
import { Card, Page } from "@/components/ui";
import { missingSupabaseSettings } from "@/lib/supabase/env";

export default async function SetupNeededPage() {
  await connection(); // read settings at request time, not at build time
  const missing = missingSupabaseSettings();
  return (
    <Page title="האתר בהקמה">
      <Card>
        <p>ההרשמה וההתחברות עוד לא פעילות. נסה שוב בקרוב.</p>
        {missing.length > 0 && (
          <div className="text-sm text-muted">
            <p>למנהל האתר: חסרים המשתנים האלה בהגדרות של Vercel:</p>
            <ul className="mt-1 list-disc ps-5">
              {missing.map((m) => (
                <li key={m} className="ltr">{m}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </Page>
  );
}
