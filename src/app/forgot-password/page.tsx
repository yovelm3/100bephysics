import { Card, Page } from "@/components/ui";
import { ForgotForm } from "./Form";

export default function ForgotPasswordPage() {
  return (
    <Page title="שכחתי סיסמה">
      <Card>
        <p className="text-sm text-muted">נשלח לך מייל עם קישור לבחירת סיסמה חדשה.</p>
        <ForgotForm />
      </Card>
    </Page>
  );
}
