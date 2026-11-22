from mk import *
from lib import fbd
STRICT["on"] = True
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

A = 30
E(id="bagrut-1983-q1", year=1983, label="1983 שאלה 1", topic="momentum", sub="mom-collisions", diff=3, fig=fig,
  stem=r"גוף יוצא ממנוחה ומחליק במורד מדרון בזווית $\alpha$. בתחתית המדרון הוא מתנגש התנגשות אלסטית בקיר שניצב למדרון, ועולה בחזרה.",
  parts=[
    P("א1", r"מה היחס בין זמן הירידה לזמן העלייה (מרגע ההתנגשות עד שהגוף נעצר), כשהמדרון חלק?", num(1, ""), ["principle"], [
        X(r"בכל שלב בוחרים את כיוון התנועה כחיובי. השאלה לא קבעה כיוון."),
        S(r"התנגשות אלסטית בקיר", r"הקיר לא זז, ולכן בהתנגשות אלסטית גודל המהירות לא משתנה, רק הכיוון", r"u = v"),
        S(r"משוואת כוחות לאורך המדרון", r"בלי חיכוך, הכוח היחיד לאורך המדרון הוא רכיב הכובד. מחלקים במסה", r"mg\sin\alpha = ma \;\Rightarrow\; a = g\sin\alpha", eq=r"\Sigma\vec F = m\vec a"),
        S(r"הזמנים", r"בירידה המהירות גדלה מאפס ל-v, ובעלייה קטנה מ-v לאפס, באותו גודל של תאוצה", r"t_\downarrow = \frac{v}{a} = t_\uparrow \;\Rightarrow\; \frac{t_\downarrow}{t_\uparrow} = 1", eq=r"v = v_0 + at"),
    ], r"$1$", key=r"1"),
    P("א2", r"מה היחס כשמקדם החיכוך בין הגוף למדרון הוא $\mu$?", choice([r"$\frac{\sin\alpha + \mu\cos\alpha}{\sin\alpha - \mu\cos\alpha}$", r"$\frac{\sin\alpha - \mu\cos\alpha}{\sin\alpha + \mu\cos\alpha}$", r"$\sqrt{\frac{\sin\alpha + \mu\cos\alpha}{\sin\alpha - \mu\cos\alpha}}$", r"$1$"], 0), ["fbd", "principle", "algebra"], [
        D(r"בירידה: תרשים הכוחות על הגוף", lambda: fbd([("mg", -90, 1.0), ("N", 90 - A, 0.9), ("fₖ", 180 - A, 0.4)],
            "תרשים כוחות בירידה: כוח הכובד, הכוח הנורמלי ניצב למדרון, וחיכוך קינטי במעלה המדרון, נגד התנועה. הכיוון החיובי במורד",
            positive=-A, body="block", tilt=-A, surface="below", note="יורד")),
        S(r"משוואת כוחות בירידה", r"בכיוון החיובי, במורד, רכיב הכובד. נגדו החיכוך", r"mg\sin\alpha - f_k = m\,a_\downarrow", eq=r"\Sigma\vec F = m\vec a"),
        S(r"מציבים את החיכוך ומחלקים במסה", r"הכוח הנורמלי מאזן את רכיב הכובד שבניצב למדרון", r"f_k = \mu N = \mu mg\cos\alpha \;\Rightarrow\; a_\downarrow = g(\sin\alpha - \mu\cos\alpha)", eq=r"f_k = \mu_k N"),
        D(r"בעלייה: תרשים הכוחות על הגוף", lambda: fbd([("mg", -90, 1.0), ("N", 90 - A, 0.9), ("fₖ", -A, 0.4)],
            "תרשים כוחות בעלייה: כוח הכובד, הכוח הנורמלי, וחיכוך קינטי במורד המדרון, נגד התנועה. הכיוון החיובי במעלה",
            positive=180 - A, body="block", tilt=-A, surface="below", note="עולה")),
        S(r"משוואת כוחות בעלייה", r"עכשיו הכיוון החיובי במעלה. בכיוון הזה לא פועל אף כוח. נגדו רכיב הכובד והחיכוך", r"0 - mg\sin\alpha - f_k = m\,a", eq=r"\Sigma\vec F = m\vec a"),
        S(r"מציבים את החיכוך ומחלקים במסה", r"גודל ההאטה בעלייה", r"|a_\uparrow| = g(\sin\alpha + \mu\cos\alpha)"),
        S(r"הזמנים", r"הגוף מגיע לקיר במהירות v, ויוצא ממנו באותה מהירות", r"t_\downarrow = \frac{v}{a_\downarrow},\qquad t_\uparrow = \frac{v}{|a_\uparrow|}", eq=r"v = v_0 + at"),
        S(r"היחס", r"המהירות מצטמצמת, וגם תאוצת הכובד", r"\frac{t_\downarrow}{t_\uparrow} = \frac{|a_\uparrow|}{a_\downarrow} = \frac{\sin\alpha + \mu\cos\alpha}{\sin\alpha - \mu\cos\alpha}"),
    ], r"$\frac{\sin\alpha + \mu\cos\alpha}{\sin\alpha - \mu\cos\alpha}$", key=r"(sinα+μcosα)/(sinα−μcosα)"),
    P("ב", r"הראו שהתשובה בסעיף א1 היא מקרה פרטי של התשובה בסעיף א2.", OPEN, ["algebra"], [
        S(r"מציבים מקדם חיכוך אפס", r"בלי חיכוך האיברים עם מקדם החיכוך נעלמים", r"\mu = 0:\quad \frac{\sin\alpha + 0}{\sin\alpha - 0} = 1"),
    ], r"כשאין חיכוך היחס הוא $1$"),
  ],
  concepts=["התנגשות אלסטית", "מישור משופע עם חיכוך", "זמני תנועה"],
  summary=r"גוף שיורד במדרון, ניתר מקיר ועולה: היחס בין זמני הירידה והעלייה, עם חיכוך ובלי.",
  review="הנחה שלי.\nבמקור סעיף א הוא (1) ו-(2), וכך גם אצלנו. בסעיף א(2) התלמיד בוחר את הביטוי הנכון מתוך ארבעה.\nמה לבדוק: רק לאשר.")
