# בדיקה מקצה לקצה (שלב 2)

בודק בדפדפן אמיתי: דפים לאורח, התחברות, מגבלת 5 מכשירים ונעילה, לוח ניהול (שחרור, מנוי, מסלול, חיפוש), התנתקות.

1. ליצור משתמשי בדיקה: `create-test-users.sql` (עם סיסמה)
2. להריץ: `E2E_BASE=https://100bephysics.vercel.app E2E_PASSWORD=... node e2e/stage2.cjs`
3. למחוק אותם: `delete-test-users.sql`

הערה: מחשב של Claude Code צריך `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt` כדי שהשרת המקומי יגיע ל-Supabase.

## שלב 3 (דף תרגיל)
`e2e/stage3.cjs` צריך בנוסף 3 תרגילים זמניים שפורסמו, `e2e-test-1..3` (סעיף אחד, תשובה 12.5 m), ב-`kin-straight-line`. למחוק אחרי הבדיקה: `delete from public.exercises where id like 'e2e-test-%';`
