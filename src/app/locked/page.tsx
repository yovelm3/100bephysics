import { Card, Page } from "@/components/ui";

export default function LockedPage() {
  return (
    <Page title="החשבון נעול">
      <Card>
        <p className="font-semibold text-warn">החשבון נכנס מיותר מ-5 מכשירים שונים, ולכן הוא ננעל והגישה נחסמה.</p>
        <p className="text-sm text-muted">
          רק מנהל האתר יכול לשחרר את הנעילה. אם לדעתך זו טעות, פנה למנהל האתר. ההתקדמות שלך שמורה ולא נמחקת.
        </p>
        <form action="/auth/signout" method="post">
          <button className="text-sm font-semibold text-accent underline">התנתקות</button>
        </form>
      </Card>
    </Page>
  );
}
