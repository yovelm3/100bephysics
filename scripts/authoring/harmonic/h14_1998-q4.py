from mk import *
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

E(id="bagrut-1998-q4", year=1998, label="1998 שאלה 4", topic="harmonic", sub="harm-pendulum", diff=3, fig=fig,
  stem=r"תלמיד מדד את זמני המחזור ($T$) של מטוטלות פשוטות בעלות אורכים שונים ($\ell$). כל אחת מן המטוטלות התנודדה בזווית קטנה. תוצאות המדידות רשומות בטבלה.",
  parts=[
    P("א", r"סרטט גרף מתאים, שבעזרתו תוכל לחשב את תאוצת הנפילה החופשית. רשום בטבלה את שיעורי הנקודות שעל פיהן סרטטת את הגרף.", OPEN, ["graph", "principle"], [
        S(r"ליניאריזציה", r"$T^2$ פרופורציוני ל-$\ell$, ולכן גרף $T^2(\ell)$ הוא קו ישר דרך הראשית", r"T^2 = \frac{4\pi^2}{g}\ell"),
        S(r"הנקודות", r"מעלים את $T$ בריבוע", r"T^2 \approx 0.81,\ 1.56,\ 2.40,\ 3.24,\ 4.00\,\text{s}^2"),
    ], r"גרף $T^2$ כפונקציה של $\ell$"),
    P("ב", r"חשב על פי הגרף את תאוצת הנפילה החופשית.", num(g_, "m/s^2", tol=2), ["graph", "algebra"], [
        S(r"שיפוע הגרף", r"הקו הטוב ביותר דרך הראשית", r"s = \frac{4.00}{1.0} \approx 4.0\,\text{s}^2/\text{m}"),
        S(r"משווים לתאוריה", r"השיפוע הוא $4\pi^2/g$", r"g = \frac{4\pi^2}{4.0} \approx 9.87\,\text{m/s}^2"),
    ], r"$g \approx 9.87\,\text{m/s}^2$", key=r"9.87 m/s²"),
    P("ג", r"עבור המטוטלת שאורכה $1.0\,\text{m}$ וזמן המחזור שלה הוא $2.0\,\text{s}$, מדד התלמיד את הרכיב האנכי $y$ של מקום המשקולת כפונקציה של הזמן. התלמיד גילה כי מתקבלת פונקציה מחזורית. מהו זמן המחזור של פונקציה זו? הסבר.", num(1, "s"), ["principle"], [
        S(r"הגובה במחזור אחד", r"המשקולת מגיעה לגובה מרבי בשני הקצוות, ולגובה מזערי פעמיים בנקודה הנמוכה", r"y = y_{\max}:\ t = 0,\ \frac{T}{2},\ T"),
        S(r"זמן המחזור של $y$", r"חצי מזמן המחזור של המטוטלת", r"T_y = \frac{T}{2} = 1\,\text{s}"),
    ], r"$1\,\text{s}$", key=r"period is 1 s"),
  ],
  concepts=["מטוטלת מתמטית", "מדידת g", "ליניאריזציה של גרף"],
  summary=r"מדידת $g$ מגרף $T^2(\ell)$ של מטוטלות, ולמה הגובה של המשקולת חוזר פעמיים בכל מחזור.")
