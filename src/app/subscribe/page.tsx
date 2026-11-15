import { Card, Notice, Page } from "@/components/ui";

export default function SubscribePage() {
  return (
    <Page title="מנוי">
      <Card>
        <p className="text-3xl font-bold text-accent">
          <span className="ltr">150 ₪</span>
        </p>
        <p>
          גישה מלאה למאגר התרגילים ל-<span className="ltr">3</span> חודשים. תשלום חד-פעמי, בלי חידוש אוטומטי.
        </p>
        <ul className="list-disc ps-5 text-sm text-muted">
          <li>כל התרגילים לפי נושאים, עם בדיקת תשובה</li>
          <li>פתרון מלא ומפורט לכל סעיף</li>
          <li>שבוע לפני סוף המנוי נשלח אליך מייל תזכורת</li>
        </ul>
        <Notice>התשלום באתר יופעל בקרוב. בינתיים אפשר לפנות למנהל האתר, והוא יפעיל לך את המנוי.</Notice>
      </Card>
    </Page>
  );
}
