from mk import *
from lib import fbd
STRICT["on"] = True
import math

def fig():
    g = Fig(560, 280, "תרשים א: כביש מעגלי משופע, ומכונית בזווית אלפא. תרשים ב: חתך של הכביש הנטוי עם המכונית, הכוח הנורמלי N, כוח הכובד mg, וצירי x ו-y")
    g.add('<ellipse cx="150" cy="120" rx="130" ry="60" fill="var(--d-fill)" stroke="var(--d-line)" stroke-width="2"/>')
    g.add('<ellipse cx="150" cy="120" rx="80" ry="34" fill="#ffffff" stroke="var(--d-line)" stroke-width="2"/>')
    g.dot(150, 120); g.heb(150, 220, "תרשים א")
    a = math.radians(25)
    g.poly([(320, 250), (540, 250), (540, 250 - 220 * math.tan(a))], fill="var(--d-fill)")
    g.angle(320, 250, 50, 0, 25, "α", lr=64)
    cx, cy = 440, 250 - 120 * math.tan(a) - 14
    g.block(cx, cy, 40, 24, None, angle=25)
    g.arrow(cx, cy, cx - 80 * math.sin(a), cy - 80 * math.cos(a), "N", lx=cx - 46, ly=cy - 80, anchor="end")
    g.arrow(cx, cy, cx, cy + 70, "mg", lx=cx + 8, ly=cy + 64, anchor="start")
    g.arrow(cx + 40, cy - 30, cx + 40 - 60 * math.sin(a), cy - 30 - 60 * math.cos(a), "y", lx=cx + 6, ly=cy - 92, anchor="start")
    g.heb(430, 272, "תרשים ב")
    return g

E(id="bagrut-2000-q2", year=2000, label="2000 שאלה 2", topic="circular", sub="circ-horizontal", diff=3, fig=fig,
  stem=r"מכונית נוסעת על כביש אופקי (לא נטוי), במסלול מעגלי שרדיוסו $R$, במהירות שגודלה קבוע. מקדם החיכוך הסטטי בין הצמיגים לכביש הוא $\mu_s$.",
  parts=[
    P("א", r"מה המהירות הגדולה ביותר שבה המכונית יכולה לנסוע על הכביש בלי להחליק, לפי נתוני השאלה?", choice([r"$v_{\max} = \sqrt{\mu_s g R}$", r"$v_{\max} = \mu_s g R$", r"$v_{\max} = \sqrt{\frac{g R}{\mu_s}}$", r"$v_{\max} = \sqrt{2\mu_s g R}$"], 0), ["fbd", "principle", "algebra"], [
        X(r"בוחרים כחיובי את הכיוון אל מרכז המעגל, וכלפי מעלה בציר האנכי. השאלה לא קבעה כיוונים."),
        D(r"תרשים הכוחות על המכונית, במבט מאחור", lambda: fbd([("fₛ", 180, 0.7), ("N", 90, 1.0), ("mg", -90, 1.0)],
            "תרשים כוחות על המכונית במבט מאחור: חיכוך סטטי אופקי אל מרכז המעגל, הכוח הנורמלי כלפי מעלה וכוח הכובד כלפי מטה. הכיוון החיובי אל המרכז",
            positive=180, body="block", surface="below", note="המרכז משמאל")),
        S(r"משוואת כוחות בציר האנכי", r"המכונית לא עולה ולא יורדת", r"N - mg = 0 \;\Rightarrow\; N = mg", eq=r"\Sigma\vec F = m\vec a"),
        S(r"משוואת כוחות בכיוון המרכז", r"בכביש לא נטוי הכוח האופקי היחיד הוא החיכוך הסטטי", r"f_s = m\,\frac{v^2}{R}", eq=r"a_R = \frac{v^2}{r}"),
        S(r"המהירות הגדולה ביותר", r"החיכוך הסטטי יכול להגיע לכל היותר למקדם החיכוך כפול הכוח הנורמלי", r"f_s = \mu_s N = \mu_s mg \;\Rightarrow\; \mu_s mg = m\,\frac{v_{\max}^2}{R}", eq=r"f_s \le \mu_s N"),
        S(r"מחלקים במסה ומבודדים", r"המסה מצטמצמת", r"v_{\max} = \sqrt{\mu_s g R}"),
    ], r"$v_{\max} = \sqrt{\mu_s g R}$", key=r"√(μs·g·r)"),
    P("ב", r"מכונית נוסעת בכביש שצד אחד שלו מוגבה, והוא נטוי בזווית $\alpha$, במסלול מעגלי אופקי שרדיוסו $R$. אפשר להזניח את החיכוך. תלמיד שרטט את הכוחות על המכונית (תרשים ב), וכתב משוואה לרכיבי הכוחות בציר $y$: $\sum F_y = 0 \Rightarrow N - mg\cos\alpha = 0$. הסבירו מדוע המשוואה של התלמיד לא נכונה.", OPEN, ["fbd", "principle"], [
        D(r"תרשים הכוחות על המכונית בכביש הנטוי", lambda: fbd([("N", 90 + 20, 1.1), ("mg", -90, 1.0)],
            "תרשים כוחות על המכונית בכביש הנטוי: הכוח הנורמלי ניצב לכביש, נוטה אל מרכז המעגל, וכוח הכובד כלפי מטה. הכיוון החיובי אופקית אל מרכז המעגל",
            positive=180, body="block", tilt=-20, surface="below", note="אין חיכוך")),
        S(r"כיוון התאוצה", r"התאוצה אופקית, אל מרכז המעגל. ציר y של התלמיד ניצב לכביש, ולכן יש לתאוצה רכיב גם בכיוון הזה", r"a_y = a_R\sin\alpha \ne 0"),
        S(r"הדרך הנכונה", r"נוח לבחור ציר אופקי, אל המרכז, וציר אנכי. בציר האנכי אין תאוצה, ובציר האופקי יש תאוצה רדיאלית", r"N\cos\alpha - mg = 0 \qquad N\sin\alpha = m\,\frac{v^2}{R}", eq=r"\Sigma\vec F = m\vec a"),
    ], r"התאוצה הרדיאלית אופקית ויש לה רכיב בציר $y$, ולכן $\sum F_y \ne 0$"),
    P("ג", r"מה המהירות של המכונית בכביש הנטוי, בעזרת $R$ ו-$\alpha$?", choice([r"$v = \sqrt{gR\tan\alpha}$", r"$v = \sqrt{gR\sin\alpha}$", r"$v = \sqrt{\frac{gR}{\tan\alpha}}$", r"$v = gR\tan\alpha$"], 0), ["fbd", "principle", "algebra"], [
        S(r"מחלקים את שתי המשוואות", r"את המשוואה האופקית במשוואה האנכית. הכוח הנורמלי והמסה מצטמצמים", r"\frac{N\sin\alpha}{N\cos\alpha} = \frac{m v^2 / R}{mg} \;\Rightarrow\; \tan\alpha = \frac{v^2}{gR}"),
        S(r"המהירות", r"מבודדים ומוציאים שורש", r"v = \sqrt{gR\tan\alpha}"),
    ], r"$v = \sqrt{gR\tan\alpha}$", key=r"√(g·r·tanα)"),
  ],
  concepts=["תנועה מעגלית אופקית", "חיכוך סטטי ככוח צנטריפטלי", "כביש משופע", "בחירת צירים"],
  summary=r"מכונית בסיבוב: המהירות הגדולה ביותר בכביש שטוח, ולמה בכביש נטוי בוחרים צירים אופקי ואנכי.",
  review="הנחה שלי.\nבסעיפים א ו-ג התלמיד בוחר את הביטוי הנכון מתוך ארבעה.\nמה לבדוק: רק לאשר.")
