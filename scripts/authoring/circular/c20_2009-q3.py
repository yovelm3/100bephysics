from mk import *
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

E(id="bagrut-2009-q3", year=2009, label="2009 שאלה 3", topic="circular", sub="circ-horizontal", diff=4, fig=fig,
  stem=r"אסף ערך ניסוי עם מנוע חשמלי שעל ציר אנכי. הוא חיבר לראש הציר חוט שאורכו $L$, ולקצה החוט קשר כדור קטן בעל מסה $m$. רדיוס הכדור קטן מאוד ביחס לאורך החוט. כאשר המנוע פועל, הכדור נע בתנועה מעגלית אופקית. אסף שינה כמה פעמים את תדירות הסיבוב $f$ של הציר, ומדד עבור כל תדירות את זווית הפריסה $\alpha$ של החוט. תוצאות המדידות מוצגות בטבלה.",
  parts=[
    P("א", r"סרטט תרשים הכוחות שפועלים על הכדור, ופתח בעזרתו ביטוי שמתאר את $\cos\alpha$ כפונקציה של $1/f^2$.", OPEN, ["fbd", "principle", "algebra"], [
        S(r"הכוחות", r"כובד ומתיחות", r"T\cos\alpha = mg,\quad T\sin\alpha = m(2\pi f)^2 L\sin\alpha"),
        S(r"מבודדים", r"מהשנייה $T = 4\pi^2 f^2 m L$, ומציבים בראשונה", r"\cos\alpha = \frac{g}{4\pi^2 L} \cdot \frac{1}{f^2}"),
    ], r"$\cos\alpha = \frac{g}{4\pi^2 L} \cdot \frac{1}{f^2}$"),
    P("ב", r"העתק את הטבלה למחברתך, השלם אותה עם $1/f^2$ ו-$\cos\alpha$ (עגל את תוצאות החישוב עד שתי ספרות אחרי הנקודה העשרונית), וסרטט גרף של $\cos\alpha$ כפונקציה של $1/f^2$.", OPEN, ["graph", "algebra"], [
        S(r"$1/f^2$", r"מחשבים לכל תדירות", r"5.67,\ 4.94,\ 4.00,\ 2.78,\ 2.04,\ 1.00\,\text{s}^2"),
        S(r"$\cos\alpha$", r"מחשבים לכל זווית", r"0.95,\ 0.85,\ 0.71,\ 0.45,\ 0.34,\ 0.17"),
        S(r"הגרף", r"קו ישר שעובר קרוב לראשית", r"\cos\alpha \approx 0.17 \cdot \frac{1}{f^2}"),
    ], r"קו ישר דרך הראשית"),
    P("ג", r"חשב בעזרת שיפוע הגרף את אורך החוט, $L$.", num(L, "m", tol=4), ["graph", "algebra"], [
        S(r"השיפוע", r"מקו המגמה", r"s \approx 0.17\,\text{s}^{-2}"),
        S(r"משווים לביטוי", r"השיפוע הוא $g/(4\pi^2 L)$", r"L = \frac{g}{4\pi^2 \cdot 0.17} \approx 1.5\,\text{m}"),
    ], r"$L \approx 1.5\,\text{m}$", key=r"L=1.47 m"),
    P("ד", r"קבע על פי הגרף מהי התדירות המינימלית של סיבוב הציר שבה ינוע הכדור בתנועה מעגלית.", num(fmin, "Hz", tol=4), ["graph", "algebra"], [
        S(r"גבול", r"$\cos\alpha$ לא יכול לעבור את $1$", r"\cos\alpha = 1 \Rightarrow \frac{1}{f^2} = \frac{1}{s}"),
        S(r"התדירות", r"שורש השיפוע", r"f_{\min} = \sqrt{s} \approx 0.41\,\text{Hz}"),
    ], r"$\approx 0.41\,\text{Hz}$", key=r"fmin=0.41 Hz"),
  ],
  concepts=["מטוטלת קונית", "לינאריזציה של גרף", "שיפוע", "תדירות מינימלית"],
  summary=r"מטוטלת קונית במנוע: גרף של $\cos\alpha$ מול $1/f^2$ הוא קו ישר, ומהשיפוע מוצאים את אורך החוט ואת התדירות המינימלית.")
