from mk import *

def fig():
    g = Fig(560, 200, "גוף m על מדרון בזווית אלפא עם חיכוך. כוח F אופקי דוחף אותו")
    g.poly([(100, 170), (480, 170), (480, 50)], fill="var(--d-fill)"); g.ground(60, 520, 170)
    g.angle(100, 170, 50, 0, 17.5, "α", lr=66)
    g.block(290, 108, 50, 30, "m", angle=17.5)
    g.arrow(200, 118, 262, 118, "F", lx=196, ly=122, anchor="end")
    return g

E(id="bagrut-1987-q3", year=1987, label="1987 שאלה 3", topic="energy", sub="en-work", diff=4, fig=fig,
  stem=r"גוף שמסתו $m$ מונח על מדרון שזווית שיפועו $\alpha$. מקדם החיכוך בינו ובין המדרון הוא $\mu$. מפעילים כוח אופקי קבוע $F$ על הגוף.",
  parts=[
    P("א", r"מהו גודל הכוח המינימלי, $F_{\min}$, שדרוש כדי לדחוף את הגוף במעלה המדרון? האם תמיד קיים כוח $F$ כזה? נמק.", OPEN, ["fbd", "principle", "algebra"], [
        X(r"הכוח המינימלי מזיז את הגוף במהירות קבועה. החיכוך במורד, והכוח האופקי לוחץ גם על המדרון ומגדיל את הנורמלי."),
        S(r"בניצב למדרון", r"אין תאוצה בניצב", r"N = mg\cos\alpha + F\sin\alpha"),
        S(r"לאורך המדרון", r"מהירות קבועה: השקול אפס", r"F\cos\alpha = mg\sin\alpha + \mu(mg\cos\alpha + F\sin\alpha)"),
        S(r"מבודדים", r"מעבירים את F לצד אחד", r"F_{\min} = mg\frac{\sin\alpha + \mu\cos\alpha}{\cos\alpha - \mu\sin\alpha}"),
        S(r"תנאי לקיום", r"המכנה חייב להיות חיובי. אחרת שום כוח אופקי לא מספיק, כי הוא מגדיל את החיכוך מהר יותר משהוא דוחף", r"\cos\alpha > \mu\sin\alpha \iff \mu < \cot\alpha"),
    ], r"$F_{\min} = mg\frac{\sin\alpha + \mu\cos\alpha}{\cos\alpha - \mu\sin\alpha}$, ורק כש-$\mu < \cot\alpha$", key=r"mg(sinα+μcosα)/(cosα−μsinα)"),
    P("ב", r"כאשר מתקיים $F = 3F_{\min}$, מהו גודל התאוצה שבה נע הגוף במעלה המדרון?", OPEN, ["principle", "algebra"], [
        S(r"החוק השני לאורך המדרון", r"חיובי במעלה", r"ma = F(\cos\alpha - \mu\sin\alpha) - mg(\sin\alpha + \mu\cos\alpha)"),
        S(r"מציבים $F = 3F_{\min}$", r"$F_{\min}(\cos\alpha - \mu\sin\alpha) = mg(\sin\alpha + \mu\cos\alpha)$", r"a = 2g(\sin\alpha + \mu\cos\alpha)"),
    ], r"$a = 2g(\sin\alpha + \mu\cos\alpha)$", key=r"2g(sinα+μcosα)"),
    P("ג", r"בתנאי סעיף ב, הגוף עובר בזמן מסוים מרחק $\ell$ מטרים לאורך המדרון. איזו עבודה עבד הכוח $F$ לאורך דרך זו?", OPEN, ["principle", "algebra"], [
        S(r"עבודה של כוח קבוע", r"הזווית בין הכוח האופקי לתזוזה לאורך המדרון היא $\alpha$", r"W = F\ell\cos\alpha"),
        S(r"מציבים", r"F = 3F_min", r"W = 3mg\ell\cos\alpha\,\frac{\sin\alpha + \mu\cos\alpha}{\cos\alpha - \mu\sin\alpha}"),
    ], r"$W = 3mg\ell\cos\alpha\frac{\sin\alpha + \mu\cos\alpha}{\cos\alpha - \mu\sin\alpha}$", key=r"mgℓ·cosα·(sinα+μcosα)/(cosα−μsinα)"),
  ],
  concepts=["מישור משופע", "חיכוך", "כוח אופקי על מדרון", "עבודה של כוח קבוע"],
  summary=r"דחיפה אופקית במעלה מדרון עם חיכוך: הכוח המינימלי, מתי הוא לא קיים, התאוצה בכוח משולש, והעבודה.",
  review='צריך החלטה שלך, בסעיף ג (העבודה של הכוח F).\nבדף התשובות: הביטוי בלי המקדם 3.\nאצלי: עם המקדם 3.\nלמה: סעיף ג אומר "בתנאי סעיף ב", ובסעיף ב הכוח הוא פי 3 מהכוח המינימלי. לכן לדעתי העבודה היא פי 3. בדף התשובות כנראה חישבו עם הכוח המינימלי.\nמה לבדוק: איך אתה מבין את הנוסח. אם אתה רוצה בלי 3, כתוב לי.')
