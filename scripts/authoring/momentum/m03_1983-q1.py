from mk import *
import math

def fig():
    g = Fig(560, 220, "מדרון שעולה ימינה בזווית אלפא. הגוף מחליק ממנוחה מראש המדרון כלפי מטה, לעבר קיר שנמצא בתחתית המדרון וניצב לו")
    al = math.radians(18.9); ca, sa = math.cos(al), math.sin(al)
    L0 = (110, 190); top = (500, 190 - 390 * math.tan(al))
    g.poly([L0, (500, 190), top], fill="var(--d-fill)"); g.ground(40, 520, 190)
    g.angle(L0[0], L0[1], 56, 0, 18.9, "α", lr=72)
    w = (L0[0] - 70 * sa, L0[1] - 70 * ca)  # wall perpendicular to the slope
    g.line(*L0, *w, width=3)
    for k in range(1, 7):
        p = (L0[0] - 10 * k * sa, L0[1] - 10 * k * ca); g.line(*p, p[0] - 9 * ca, p[1] + 9 * sa, stroke="var(--d-hatch)", width=1.4)
    g.heb(w[0] - 6, w[1] - 8, "קיר")
    s0 = 300; c = (L0[0] + s0 * ca - 13 * sa, L0[1] - s0 * sa - 13 * ca)
    g.block(*c, 40, 24, None, angle=-18.9)
    g.arrow(c[0] - 30 * ca - 8 * sa, c[1] + 30 * sa - 8 * ca, c[0] - 80 * ca - 8 * sa, c[1] + 80 * sa - 8 * ca, None)
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
