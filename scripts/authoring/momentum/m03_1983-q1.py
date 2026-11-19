from mk import *
import math

def fig():
    g = Fig(560, 220, "גוף מחליק ממנוחה במורד מדרון בזווית אלפא. בתחתית המדרון קיר שניצב למדרון")
    g.poly([(120, 190), (500, 190), (120, 60)], fill="var(--d-fill)"); g.ground(60, 520, 190)
    g.angle(500, 190, 50, 180 - 18.9, 180, "α", lr=66)
    g.line(120, 60, 80, 176, width=3); g.rect(70, 60, 10, 120, fill="url(#f-hatch)", stroke="none", width=0)
    g.block(330, 105, 40, 24, None, angle=-18.9)
    g.arrow(300, 104, 260, 118, None)
    return g

E(id="bagrut-1983-q1", year=1983, label="1983 שאלה 1", topic="momentum", sub="mom-collisions", diff=3, fig=fig,
  stem=r"גוף מחליק, ממצב של מנוחה, במורד מדרון שזווית שיפועו $\alpha$. בהגיעו לתחתית המדרון הוא מתנגש התנגשות אלסטית בקיר שנטוי בזווית $90^\circ$ למדרון, ועולה שוב.",
  parts=[
    P("א1", r"מהו היחס בין זמן הירידה לזמן העלייה (מרגע ההתנגשות ועד רגע העצירה), כאשר המדרון חלק?", num(1, ""), ["principle"], [
        S(r"התנגשות אלסטית בקיר", r"גודל המהירות לא משתנה, רק הכיוון", r"v' = v"),
        S(r"התאוצה", r"בלי חיכוך, אותה תאוצה בירידה ובעלייה", r"a = g\sin\alpha"),
        S(r"הזמנים", r"מאפס עד $v$ ומ-$v$ עד אפס באותה תאוצה", r"t_\downarrow = t_\uparrow = \frac{v}{a} \Rightarrow \frac{t_\downarrow}{t_\uparrow} = 1"),
    ], r"$1$", key=r"1"),
    P("א2", r"מהו היחס, כאשר מקדם החיכוך בין הגוף למדרון הוא $\mu$?", OPEN, ["fbd", "principle", "algebra"], [
        S(r"תאוצות", r"החיכוך נגד התנועה בשני הכיוונים", r"a_\downarrow = g(\sin\alpha - \mu\cos\alpha),\quad a_\uparrow = g(\sin\alpha + \mu\cos\alpha)"),
        S(r"הזמנים", r"הגוף מגיע לקיר במהירות $v$ ויוצא ממנו ב-$v$", r"t_\downarrow = \frac{v}{a_\downarrow},\quad t_\uparrow = \frac{v}{a_\uparrow}"),
        S(r"היחס", r"v מתבטל", r"\frac{t_\downarrow}{t_\uparrow} = \frac{\sin\alpha + \mu\cos\alpha}{\sin\alpha - \mu\cos\alpha}"),
    ], r"$\frac{\sin\alpha + \mu\cos\alpha}{\sin\alpha - \mu\cos\alpha}$", key=r"(sinα+μcosα)/(sinα−μcosα)"),
    P("ב", r"הראה כי התשובה בסעיף א1 היא מקרה פרטי של התשובה בסעיף א2.", OPEN, ["algebra"], [
        S(r"מציבים $\mu = 0$", r"החיכוך נעלם", r"\frac{\sin\alpha}{\sin\alpha} = 1"),
    ], r"ב-$\mu = 0$ היחס הוא $1$"),
  ],
  concepts=["התנגשות אלסטית", "מישור משופע עם חיכוך", "זמני תנועה"],
  summary=r"גוף שיורד במדרון, ניתר מקיר ועולה: היחס בין זמני הירידה והעלייה, עם חיכוך ובלי.")
