from mk import *
from lib import fbd
STRICT["on"] = True
import math
L = [0.2, 0.4, 0.6, 0.8, 1.0]; Tm = [0.90, 1.25, 1.55, 1.80, 2.00]
T2 = [t * t for t in Tm]
slope = sum(a * b for a, b in zip(L, T2)) / sum(a * a for a in L)
g_ = 4 * math.pi ** 2 / slope

def fig():
    g = Fig(560, 260, "שמאל: טבלה של אורך המטוטלת במטרים וזמן המחזור בשניות: 0.2 ו-0.90, 0.4 ו-1.25, 0.6 ו-1.55, 0.8 ו-1.80, 1.0 ו-2.00. ימין: מטוטלת מתנודדת, וציר y אנכי שמודד את גובה המשקולת, הגובה המרבי ymax בשני הקצוות")
    x0, y0 = 20, 20
    g.rect(x0, y0, 200, 216, fill="none", width=1.2); g.line(x0 + 100, y0, x0 + 100, y0 + 216, width=0.8); g.line(x0, y0 + 36, x0 + 200, y0 + 36, width=0.8)
    g.text(x0 + 50, y0 + 23, "T (s)"); g.text(x0 + 150, y0 + 23, "ℓ (m)")
    for i, (a, b) in enumerate(zip(L, Tm)):
        y = y0 + 36 + 36 * i + 23
        g.text(x0 + 50, y, f"{b:.2f}", cls="dim"); g.text(x0 + 150, y, f"{a:.1f}", cls="dim")
    cx, cy, r = 400, 40, 170
    g.ceiling(360, 440, cy)
    a = math.radians(32); bx, by = cx - r * math.sin(a), cy + r * math.cos(a)
    g.line(cx, cy, bx, by, width=1.8); g.ball(bx, by, r=7)
    g.path(f"M {bx} {by} A {r} {r} 0 0 0 {cx + r * math.sin(a)} {by}", width=1.2, dash="4 4")
    g.line(cx, cy, cx, cy + r + 30, width=1.4, arrow=False); g.line(cx, cy + r + 30, cx, cy - 20, width=1.4, arrow=True); g.text(cx - 10, cy - 12, "y", anchor="end")
    g.line(300, cy + r, 520, cy + r, width=1)
    g.line(bx - 14, by, bx - 14, cy + r, width=1, arrow=True, arrow_start=True); g.text(bx - 20, by + 18, "ymax", cls="dim", anchor="end")
    return g

def tl_fig():
    g = Fig(440, 280, "גרף ריבוע זמן המחזור כפונקציה של אורך המטוטלת: חמש נקודות על קו ישר שעובר בראשית")
    X, Y = g.graph(70, 240, 330, 200, "ℓ (m)", "T² (s²)", xticks=[(v / 10, f"{v / 10:g}") for v in (2, 4, 6, 8, 10)], yticks=[(v, str(v)) for v in (1, 2, 3, 4)], xmax=1.1, ymax=4.5)
    g.plot(X, Y, [(0, 0), (1.08, slope * 1.08)], width=2)
    for l, t2 in zip(L, T2): g.dot(X(l), Y(t2), 4)
    return g

E(id="bagrut-1998-q4", year=1998, label="1998 שאלה 4", topic="harmonic", sub="harm-pendulum", diff=3, fig=fig,
  stem=r"תלמיד מדד את זמן המחזור $T$ של מטוטלות פשוטות באורכים שונים $\ell$. כל מטוטלת התנודדה בזווית קטנה. הטבלה מראה את התוצאות.",
  parts=[
    P("א", r"שרטטו גרף מתאים, שבעזרתו אפשר לחשב את תאוצת הנפילה החופשית. כתבו בטבלה את הנקודות שלפיהן שרטטתם.", OPEN, ["graph", "principle"], [
        S(r"לינאריזציה", r"מעלים את הקשר בריבוע. ריבוע זמן המחזור פרופורציוני לאורך, ולכן הגרף שלו כפונקציה של האורך הוא קו ישר שעובר בראשית", r"T^2 = \frac{4\pi^2}{g}\,\ell", eq=r"T = 2\pi\sqrt{\frac{L}{g}}"),
        TBL(r"הנקודות", [r"$\ell\,(\text{m})$", r"$T\,(\text{s})$", r"$T^2\,(\text{s}^2)$"], [[f"{l:g}", f"{t:.2f}", f"{t * t:.2f}"] for l, t in zip(L, Tm)]),
        D(r"הגרף", tl_fig),
    ], r"גרף של $T^2$ כפונקציה של $\ell$: קו ישר דרך הראשית"),
    P("ב", r"לפי הגרף, מה תאוצת הנפילה החופשית?", num(g_, "m/s^2", tol=2), ["graph", "algebra"], [
        S(r"השיפוע של הגרף", r"בוחרים נקודה רחוקה על הקו, שעובר בראשית", r"s = \frac{4.00}{1.0} \approx 4.0\,\text{s}^2/\text{m}"),
        S(r"משווים לתיאוריה", r"לפי הקשר מהסעיף הקודם, השיפוע הוא ארבע פאי בריבוע חלקי תאוצת הנפילה", r"\frac{4\pi^2}{g} = 4.0 \;\Rightarrow\; g = \frac{4\pi^2}{4.0} \approx 9.87\,\text{m/s}^2"),
    ], r"$g \approx 9.87\,\text{m/s}^2$", key=r"9.87 m/s²"),
    P("ג", r"למטוטלת שאורכה $1.0\,\text{m}$ וזמן המחזור שלה $2.0\,\text{s}$, מדד התלמיד את הרכיב האנכי $y$ של מקום המשקולת כפונקציה של הזמן, וגילה שגם זו פונקציה מחזורית. מה זמן המחזור שלה? הסבירו.", num(1, "s"), ["principle"], [
        S(r"הגובה במחזור אחד", r"המשקולת מגיעה לגובה הגדול ביותר בשני הקצוות, ולנקודה הנמוכה פעמיים בכל מחזור", r"y = y_{\max}:\quad t = 0,\ \frac{T}{2},\ T"),
        S(r"זמן המחזור של הגובה", r"הגובה חוזר על עצמו פעמיים בכל מחזור של המטוטלת", r"T_y = \frac{T}{2} = 1\,\text{s}"),
    ], r"$1\,\text{s}$", key=r"period is 1 s"),
  ],
  concepts=["מטוטלת מתמטית", "מדידת תאוצת הנפילה", "לינאריזציה של גרף"],
  summary=r"מדידת תאוצת הנפילה מגרף של ריבוע זמן המחזור לפי האורך, ולמה הגובה של המשקולת חוזר פעמיים בכל מחזור.",
  review="הנחה שלי.\nבסעיף א יש בפתרון טבלה וציור של הגרף.\nמה לבדוק: רק לאשר.")
