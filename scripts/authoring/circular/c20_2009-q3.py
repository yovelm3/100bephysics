from mk import *
from lib import fbd
STRICT["on"] = True
import math
F = [0.42, 0.45, 0.5, 0.6, 0.7, 1]; A = [18, 32, 45, 63, 70, 80]
X_ = [1 / f ** 2 for f in F]; Y_ = [math.cos(math.radians(a)) for a in A]
n = 6; xm = sum(X_) / n; ym = sum(Y_) / n
slope = sum((x - xm) * (y - ym) for x, y in zip(X_, Y_)) / sum((x - xm) ** 2 for x in X_)
L = 10 / (4 * math.pi ** 2 * slope); fmin = math.sqrt(slope)

def fig():
    g = Fig(560, 230, "ציר אנכי שמסובב מנוע. בראשו חוט באורך L ובקצהו כדור m שנע במעגל אופקי. החוט נוטה בזווית אלפא מהאנך. וטבלה: תדירות ומידת הזווית בשש מדידות")
    g.poly([(30, 200), (200, 200), (240, 180), (70, 180)], fill="var(--d-fill)"); g.rect(115, 165, 40, 22, fill="var(--d-label)")
    g.line(135, 165, 135, 40, width=3)
    a = math.radians(40); L_ = 90
    g.line(135, 44, 135 - L_ * math.sin(a), 44 + L_ * math.cos(a), width=1.5); g.ball(135 - L_ * math.sin(a), 44 + L_ * math.cos(a), 7)
    g.angle(135, 44, 26, 230, 270, "α", lr=38); g.text(90, 86, "L", anchor="end"); g.text(60, 130, "m", anchor="end")
    g.add(f'<ellipse cx="135" cy="{44 + L_ * math.cos(a):.0f}" rx="{L_ * math.sin(a):.0f}" ry="12" fill="none" stroke="var(--d-dim)" stroke-width="1.2" stroke-dasharray="5 4"/>')
    x0, y0 = 270, 40
    g.rect(x0, y0, 270, 78, fill="none", width=1.5)
    for r in (26, 52): g.line(x0, y0 + r, x0 + 270, y0 + r, width=1)
    g.line(x0 + 60, y0, x0 + 60, y0 + 78, width=1)
    g.heb(x0 + 30, y0 + 18, "מדידה"); g.text(x0 + 30, y0 + 44, "f (Hz)"); g.text(x0 + 30, y0 + 70, "α (°)")
    for i, (f_, a_) in enumerate(zip(F, A)):
        cx = x0 + 60 + 17 + i * 35
        g.text(cx, y0 + 18, str(i + 1), cls="dim"); g.text(cx, y0 + 44, f"{f_:g}", cls="dim"); g.text(cx, y0 + 70, str(a_), cls="dim")
    return g

def cgraph():
    g = Fig(560, 300, "גרף התשובה: הקוסינוס של הזווית כפונקציה של אחד חלקי ריבוע התדירות. שש נקודות כמעט על קו ישר שעובר קרוב לראשית, בשיפוע של כ-0.17")
    X, Y = g.graph(70, 260, 420, 220, "1/f² (s²)", "cos α", xticks=[(v, str(v)) for v in (1, 2, 3, 4, 5, 6)], yticks=[(v, f"{v:g}") for v in (0.2, 0.4, 0.6, 0.8, 1.0)], xmax=6.3, ymax=1.08)
    b = ym - slope * xm
    g.plot(X, Y, [(0, b), (6.1, b + slope * 6.1)])
    for x, y in zip(X_, Y_):
        g.circle(X(x), Y(y), 5, fill="var(--d-label)")
    return g

E(id="bagrut-2009-q3", year=2009, label="2009 שאלה 3", topic="circular", sub="circ-horizontal", diff=4, fig=fig,
  stem=r"אסף ערך ניסוי עם מנוע חשמלי שמסובב ציר אנכי. הוא חיבר לראש הציר חוט באורך $L$, וקשר לקצה החוט כדור קטן שמסתו $m$. רדיוס הכדור קטן מאוד לעומת אורך החוט. כשהמנוע פועל, הכדור נע במעגל אופקי. אסף שינה כמה פעמים את תדירות הסיבוב $f$ של הציר, ובכל פעם מדד את הזווית $\alpha$ בין החוט לאנך. התוצאות בטבלה.",
  parts=[
    P("א", r"שרטטו תרשים של הכוחות על הכדור, ובעזרתו מצאו ביטוי ל-$\cos\alpha$ כפונקציה של $1/f^2$.", choice([r"$\cos\alpha = \frac{g}{4\pi^2 L} \cdot \frac{1}{f^2}$", r"$\cos\alpha = \frac{4\pi^2 L}{g} \cdot \frac{1}{f^2}$", r"$\cos\alpha = \frac{g}{2\pi L} \cdot \frac{1}{f^2}$", r"$\cos\alpha = \frac{g}{4\pi^2} \cdot \frac{1}{f^2}$"], 0), ["fbd", "principle", "algebra"], [
        X(r"בוחרים כחיובי את הכיוון האופקי אל מרכז המעגל, וכלפי מעלה בציר האנכי. רדיוס המעגל הוא הרכיב האופקי של החוט."),
        D(r"תרשים הכוחות על הכדור", lambda: fbd([("T", 90 + 40, 1.2), ("mg", -90, 0.9)],
            "תרשים כוחות על הכדור: מתיחות החוט לאורך החוט, למעלה ואל הציר, וכוח הכובד כלפי מטה. הכיוון החיובי אופקית אל מרכז המעגל",
            positive=180, body="ball", note="המרכז משמאל")),
        S(r"משוואת כוחות בציר האנכי", r"הכדור לא עולה ולא יורד", r"T\cos\alpha - mg = 0", eq=r"\Sigma\vec F = m\vec a"),
        S(r"משוואת כוחות בכיוון המרכז", r"בכיוון החיובי פועל רק הרכיב האופקי של המתיחות", r"T\sin\alpha = m\,(2\pi f)^2\,L\sin\alpha", eq=r"a_R = \omega^2 r"),
        S(r"מצמצמים", r"הסינוס מופיע בשני האגפים", r"T = 4\pi^2 f^2 m L", eq=r"\omega = 2\pi f"),
        S(r"מציבים במשוואה האנכית", r"מבודדים את הקוסינוס. המסה מצטמצמת", r"\cos\alpha = \frac{mg}{T} = \frac{g}{4\pi^2 L} \cdot \frac{1}{f^2}"),
    ], r"$\cos\alpha = \frac{g}{4\pi^2 L} \cdot \frac{1}{f^2}$"),
    P("ב", r"העתיקו את הטבלה, הוסיפו לה את $1/f^2$ ואת $\cos\alpha$ (עיגול לשתי ספרות אחרי הנקודה), ושרטטו גרף של $\cos\alpha$ כפונקציה של $1/f^2$.", OPEN, ["graph", "algebra"], [
        S(r"אחד חלקי ריבוע התדירות", r"מחשבים לכל תדירות", r"\frac{1}{f^2}:\ 5.67,\ 4.94,\ 4.00,\ 2.78,\ 2.04,\ 1.00\ \text{s}^2"),
        S(r"הקוסינוס של הזווית", r"מחשבים לכל זווית", r"\cos\alpha:\ 0.95,\ 0.85,\ 0.71,\ 0.45,\ 0.34,\ 0.17"),
        TBL(r"הטבלה המלאה", [r"$f\,(\text{Hz})$", r"$\alpha$", r"$1/f^2\,(\text{s}^2)$", r"$\cos\alpha$"], [[f"{f:g}", f"{a}°", f"{1/f**2:.2f}", f"{math.cos(math.radians(a)):.2f}"] for f, a in zip(F, A)]),
        S(r"הגרף", r"הנקודות כמעט על קו ישר שעובר קרוב לראשית, כמו שהביטוי מסעיף א צופה", r"\cos\alpha \approx 0.17 \cdot \frac{1}{f^2}"),
        D(r"הגרף: הקוסינוס של הזווית כפונקציה של אחד חלקי ריבוע התדירות", cgraph),
    ], r"קו ישר דרך הראשית"),
    P("ג", r"מה אורך החוט $L$, לפי שיפוע הגרף?", num(L, "m", tol=4), ["graph", "algebra"], [
        S(r"השיפוע", r"מקו המגמה", r"s \approx 0.17\,\text{s}^{-2}"),
        S(r"משווים לביטוי", r"לפי סעיף א, השיפוע הוא תאוצת הכובד חלקי ארבעה פאי בריבוע כפול אורך החוט", r"\frac{g}{4\pi^2 L} = s \;\Rightarrow\; L = \frac{10}{4\pi^2 \cdot 0.17} \approx 1.5\,\text{m}"),
    ], r"$L \approx 1.5\,\text{m}$", key=r"L=1.47 m"),
    P("ד", r"לפי הגרף, מה התדירות הקטנה ביותר של סיבוב הציר שבה הכדור ינוע במעגל?", num(fmin, "Hz", tol=4), ["graph", "algebra"], [
        S(r"הגבול", r"הקוסינוס לא יכול להיות גדול מאחד. כשהוא אחד, החוט אנכי והכדור לא מסתובב במעגל", r"\cos\alpha = 1 \;\Rightarrow\; s \cdot \frac{1}{f^2} = 1"),
        S(r"התדירות", r"מבודדים ומוציאים שורש", r"f_{\min} = \sqrt{s} \approx 0.41\,\text{Hz}"),
    ], r"$\approx 0.41\,\text{Hz}$", key=r"fmin=0.41 Hz"),
  ],
  concepts=["מטוטלת קונית", "לינאריזציה של גרף", "שיפוע", "תדירות מינימלית"],
  summary=r"מטוטלת קונית במנוע: גרף של $\cos\alpha$ מול $1/f^2$ הוא קו ישר, ומהשיפוע מוצאים את אורך החוט ואת התדירות הקטנה ביותר.",
  review="הנחה שלי.\nבסעיף א התלמיד בוחר את הביטוי הנכון מתוך ארבעה. הטבלה והגרף מופיעים בפתרון.\nמה לבדוק: רק לאשר.")
