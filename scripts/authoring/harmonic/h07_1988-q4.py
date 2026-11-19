from mk import *
import math
R = 0.3; th = math.radians(30); w = math.sqrt(10 / (R * math.cos(th)))

def fig():
    g = Fig(300, 290, "חישוק אנכי שמרכזו O ורדיוסו R. B בראש החישוק ו-C בתחתיתו. חרוז בנקודה A על החישוק, כשהרדיוס אליה יוצר זווית θ עם האנך")
    cx, cy, r = 150, 140, 115
    g.circle(cx, cy, r, fill="none", stroke="var(--d-line)", width=2)
    g.line(cx, cy - r, cx, cy + r, width=1, dash="5 4")
    g.text(cx, cy - r - 8, "B"); g.text(cx, cy + r + 20, "C")
    a = math.radians(30); ax_, ay_ = cx - r * math.sin(a), cy + r * math.cos(a)
    g.line(cx, cy, ax_, ay_, width=1.6); g.ball(ax_, ay_, r=7); g.text(ax_ - 14, ay_ + 16, "A")
    g.angle(cx, cy, 34, -120, -90, "θ", lr=48)
    g.text((cx + ax_) / 2 - 14, (cy + ay_) / 2, "R")
    g.dot(cx, cy); g.text(cx + 10, cy - 6, "O", anchor="start")
    return g

E(id="bagrut-1988-q4", year=1988, label="1988 שאלה 4", topic="harmonic", sub="harm-pendulum", diff=3, fig=fig,
  stem=r"על חישוק אנכי ברדיוס $R$ מושחל חרוז קטן. החרוז יכול לנוע על גבי החישוק ללא חיכוך. מרימים את החרוז לנקודה $A$ ומרפים ממנו (ראה תרשים).",
  parts=[
    P("א", r"מהו אופי תנועת החרוז (תנועה קצובה, שווה תאוצה, תאוצה משתנה) כאשר הזווית $\theta$ גדולה? נמק.", choice(["תנועה קצובה", "תנועה שוות תאוצה", "תנועה בתאוצה משתנה"], 2), ["principle", "fbd"], [
        S(r"רכיב הכובד המשיק", r"תלוי בזווית, והזווית משתנה בזמן התנועה", r"a_t = g\sin\theta"),
        S(r"גם כיוון התנועה משתנה", r"יש גם תאוצה צנטריפטלית שתלויה במהירות", r"a_c = \frac{v^2}{R}"),
    ], r"תאוצה משתנה"),
    P("ב", r"כמה זמן דרוש לחרוז כדי לבצע תנודה שלמה, כשהזווית $\theta$ קטנה? (בטא את תשובתך באמצעות $R$.)", OPEN, ["principle"], [
        S(r"כמו מטוטלת באורך $R$", r"החישוק מכריח מסלול מעגלי כמו חוט; הנורמל מאונך לתנועה", r"F_t = -mg\sin\theta \approx -mg\theta"),
        S(r"זמן מחזור", r"זווית קטנה", r"T = 2\pi\sqrt{\frac{R}{g}}"),
    ], r"$T = 2\pi\sqrt{R/g}$", key=r"2π√(R/g)"),
    P("ג", r"נתון שרדיוס החישוק $R = 30\,\text{cm}$ והחרוז עולה לנקודה $A$ כך ש-$\theta = 30^\circ$. אין תנועה יחסית בין החרוז לחישוק. באיזו מהירות זוויתית, $\omega$, מסובבים את החישוק סביב צירו האנכי $BC$?", num(w, "rad/s", tol=1), ["fbd", "algebra"], [
        S(r"רדיוס הסיבוב של החרוז", r"המרחק מהציר $BC$", r"r = R\sin\theta"),
        S(r"כוחות", r"נורמל לאורך הרדיוס אל $O$, וכובד", r"N\cos\theta = mg,\quad N\sin\theta = m\omega^2 R\sin\theta"),
        S(r"מחלקים", r"$N$ מצטמצם", r"\omega^2 = \frac{g}{R\cos\theta} = \frac{10}{0.3 \cdot 0.866} \approx 38.5"),
        S(r"תוצאה", r"שורש", r"\omega \approx 6.2\,\text{rad/s}"),
    ], r"$\omega \approx 6.2\,\text{rad/s}$", key=r"6.2 rad/s"),
  ],
  concepts=["מטוטלת", "תאוצה משתנה", "תנועה מעגלית אופקית"],
  summary=r"חרוז על חישוק: כמו מטוטלת באורך $R$, ובסיבוב החישוק החרוז נשאר בזווית קבועה.")
