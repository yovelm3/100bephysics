# חיבור Supabase (שלב 2) – מדריך לבעלים

## 1. פתיחת חשבון ופרויקט
1. https://supabase.com → **Start your project** → התחברות עם GitHub.
2. **New project**: שם `100bephysics`, סיסמה חזקה למסד הנתונים (לשמור במקום בטוח), אזור **Central EU (Frankfurt)**, תוכנית Free.

## 2. יצירת הטבלאות
1. בתפריט הצד: **SQL Editor** → **New query**.
2. להעתיק את כל התוכן של `supabase/migrations/20261115000001_accounts.sql` מ-GitHub, להדביק וללחוץ **Run**.
3. צריך להופיע `Success. No rows returned`.
4. לפתוח שאילתה חדשה (**New query**) ולעשות אותו דבר עם `supabase/migrations/20261118000001_tracks.sql`.
5. בהמשך יתווספו קבצים נוספים לתיקייה הזאת. מריצים כל קובץ פעם אחת בלבד, לפי הסדר.

## 3. הגדרות התחברות
**Authentication** → **URL Configuration**:
- Site URL: `https://100bephysics.vercel.app`
- Redirect URLs: להוסיף `https://100bephysics.vercel.app/**` ו-`http://localhost:3000/**`

**Authentication** → **Emails** (Templates):
- Confirm signup: נושא `אימות המייל ב-100 בפיזיקה`, תוכן מ-`supabase/email-templates/confirm-signup.html`
- Reset password: נושא `בחירת סיסמה חדשה ב-100 בפיזיקה`, תוכן מ-`supabase/email-templates/reset-password.html`

## 4. מפתחות ל-Vercel
ב-Supabase: **Project Settings** → **API Keys** (ו-**Data API** בשביל הכתובת).
ב-Vercel: הפרויקט → **Settings** → **Environment Variables**:

| שם | ערך |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (נראה כמו `https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_...`) |
| `SUPABASE_SECRET_KEY` | Secret key (`sb_secret_...`) – סודי! |
| `NEXT_PUBLIC_SITE_URL` | `https://100bephysics.vercel.app` |
| `CRON_SECRET` | מחרוזת אקראית ארוכה |

אחרי השמירה: **Deployments** → שלוש נקודות ליד הפריסה האחרונה → **Redeploy**.

## 5. להפוך את עצמך למנהל
1. להירשם באתר עם המייל שלך ולאמת אותו.
2. ב-Supabase → **SQL Editor**:
   ```sql
   update public.profiles set role = 'admin' where email = 'המייל-שלך';
   ```
3. להתנתק ולהתחבר מחדש. בראש האתר יופיע הקישור **ניהול**.

## 6. לפני ההשקה (לא דחוף עכשיו)
- **מיילים לתלמידים:** שירות המייל המובנה של Supabase שולח רק לחברי הצוות של הפרויקט, ובכמות קטנה. לפני שתלמידים נרשמים צריך דומיין (למשל `100bephysics.co.il`) וחשבון ב-Resend, ולחבר אותו ב-Supabase תחת Authentication → Emails → SMTP Settings. אותו חשבון ישמש גם למייל התזכורת (`RESEND_API_KEY`, `EMAIL_FROM`).
- **תקנון ומדיניות פרטיות:** למלא את הפרטים בסוגריים המרובעים ולבדוק עם עורך דין (קטינים ותשלום).
