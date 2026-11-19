# בדיקה מקצה לקצה (שלב 2)

בודק בדפדפן אמיתי: דפים לאורח, התחברות, מגבלת 5 מכשירים ונעילה, לוח ניהול (שחרור, מנוי, מסלול, חיפוש), התנתקות.

1. ליצור משתמשי בדיקה: `create-test-users.sql` (עם סיסמה)
2. להריץ: `E2E_BASE=https://100bephysics.vercel.app E2E_PASSWORD=... node e2e/stage2.cjs`
3. למחוק אותם: `delete-test-users.sql`

הערה: מחשב של Claude Code צריך `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt` כדי שהשרת המקומי יגיע ל-Supabase.
