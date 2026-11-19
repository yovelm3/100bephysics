from mk import *
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
  stem=r"מכונית נוסעת על כביש (לא נטוי) במישור אופקי במסלול מעגלי שרדיוסו $R$. גודל המהירות של המכונית קבוע. מקדם החיכוך הסטטי בין צמיגי המכונית לבין הכביש הוא $\mu_s$.",
  parts=[
    P("א", r"בטא באמצעות נתוני השאלה את המהירות המרבית שבה המכונית יכולה לנסוע על הכביש בלי להחליק.", OPEN, ["fbd", "principle", "algebra"], [
        S(r"הכוח הצנטריפטלי", r"על כביש לא נטוי רק החיכוך הסטטי אופקי", r"f_s = \frac{m v^2}{R}"),
        S(r"מהירות מרבית", r"כשהחיכוך מקסימלי", r"\mu_s mg = \frac{m v_{\max}^2}{R} \Rightarrow v_{\max} = \sqrt{\mu_s g R}"),
    ], r"$v_{\max} = \sqrt{\mu_s g R}$", key=r"√(μs·g·r)"),
    P("ב", r"מכונית נוסעת בכביש שצדו האחד מוגבה, והוא נטוי בזווית $\alpha$, במסלול מעגלי אופקי שרדיוסו $R$. הנח כי החיכוך שהכביש מפעיל על המכונית ניתן להזנחה. תלמיד סרטט את הכוחות שפועלים על המכונית (תרשים ב), ורשם משוואה עבור רכיבי הכוחות בכיוון ציר $y$: $\sum F_y = 0 \Rightarrow N - mg\cos\alpha = 0$. הסבר מדוע משוואת התלמיד אינה נכונה.", OPEN, ["fbd", "principle"], [
        S(r"כיוון התאוצה", r"התאוצה אופקית, כלפי מרכז המעגל. יש לה רכיב בכיוון ציר $y$ (בניצב לכביש)", r"a_y = a_R\sin\alpha \ne 0"),
        S(r"הנכון", r"נוח לבחור צירים אופקי ואנכי", r"N\cos\alpha = mg,\quad N\sin\alpha = \frac{mv^2}{R}"),
    ], r"התאוצה הרדיאלית אופקית ויש לה רכיב בציר $y$, ולכן $\sum F_y \ne 0$"),
    P("ג", r"בטא, באמצעות $R$ ו-$\alpha$, את מהירות המכונית שנוסעת בכביש הנטוי.", OPEN, ["fbd", "principle", "algebra"], [
        S(r"מחלקים את שתי המשוואות", r"N ו-m מתבטלים", r"\tan\alpha = \frac{v^2}{gR}"),
        S(r"המהירות", r"מבודדים את v", r"v = \sqrt{gR\tan\alpha}"),
    ], r"$v = \sqrt{gR\tan\alpha}$", key=r"√(g·r·tanα)"),
  ],
  concepts=["תנועה מעגלית אופקית", "חיכוך סטטי ככוח צנטריפטלי", "כביש משופע", "בחירת צירים"],
  summary=r"מכונית בסיבוב: המהירות המרבית בכביש שטוח, ולמה בכביש נטוי בוחרים צירים אופקי ואנכי.")
