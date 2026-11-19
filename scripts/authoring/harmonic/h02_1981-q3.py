from mk import *
import math
g0 = 10; L = 1; m = 0.1; th = math.radians(5)
T = 2 * math.pi * math.sqrt(L / g0); tq = T / 4
v = math.sqrt(2 * g0 * L * (1 - math.cos(th)))
Tmax = m * g0 + m * v ** 2 / L
T2 = 2 * T

def fig():
    g = Fig(360, 260, "מטוטלת: חוט באורך l תלוי מהתקרה, ובקצהו מסה נקודתית m. החוט מוסט בזווית קטנה θ מהאנך")
    cx, cy = 180, 30
    g.ceiling(120, 240, cy)
    g.line(cx, cy, cx, cy + 200, width=1, dash="4 4")
    a = math.radians(14); bx, by = cx + 190 * math.sin(a), cy + 190 * math.cos(a)
    g.line(cx, cy, bx, by, width=1.8); g.ball(bx, by, r=9); g.text(bx + 18, by + 4, "m", anchor="start")
    g.angle(cx, cy, 50, -90, -76, "θ", lr=64)
    g.text(cx + 34, cy + 110, "ℓ", anchor="start")
    return g

E(id="bagrut-1981-q3", year=1981, label="1981 שאלה 3", topic="harmonic", sub="harm-pendulum", diff=3, fig=fig,
  stem=r"מסה נקודתית $m$ תלויה בקצהו של חוט חסר מסה שאורכו $\ell$. מסיטים את המסה ממצב שיווי המשקל שלה כך שהחוט יוצר זווית קטנה $\theta$ ($\sin\theta \approx \theta$) עם האנך. מרפים מן המסה $m$, והיא מתחילה להתנודד בקצה החוט (מטוטלת מתמטית).",
  parts=[
    P("א", r"הראה כי תנועת המטוטלת היא תנועה הרמונית, ופתח את הנוסחה עבור זמן המחזור של התנודות.", OPEN, ["fbd", "principle", "algebra"], [
        S(r"הכוח המחזיר", r"רכיב הכובד המשיק למסלול", r"F = -mg\sin\theta \approx -mg\theta"),
        S(r"העתק לאורך הקשת", r"$x = \ell\theta$", r"F \approx -\frac{mg}{\ell}x"),
        S(r"כמו קפיץ עם $k = mg/\ell$", r"הכוח פרופורציוני להעתק ומכוון אל שיווי המשקל", r"T = 2\pi\sqrt{\frac{m}{k}} = 2\pi\sqrt{\frac{\ell}{g}}"),
    ], r"$T = 2\pi\sqrt{\ell/g}$"),
    P("ב", r"אם המסה הנקודתית $m = 100\,\text{g}$, אורך החוט $\ell = 1\,\text{m}$, והזווית בין החוט לאנך היא $\theta = 5^\circ$, כמה זמן יעבור מרגע שחרור המסה $m$ עד שהיא תגיע בפעם הראשונה למהירותה המקסימלית?", num(tq, "s", tol=2), ["principle", "algebra"], [
        S(r"זמן מחזור", r"מטוטלת מתמטית", r"T = 2\pi\sqrt{\frac{1}{10}} \approx 1.99\,\text{s}"),
        S(r"מהקצה לנקודה הנמוכה", r"רבע מחזור", r"t = \frac{T}{4} \approx 0.5\,\text{s}"),
    ], r"$\approx 0.5\,\text{s}$", key=r"≈0.5 s"),
    P("ג", r"מה גודלה של המהירות המקסימלית?", num(v, "m/s", tol=2), ["principle", "algebra"], [
        S(r"שימור אנרגיה", r"גובה ההתחלה מעל הנקודה הנמוכה", r"h = \ell(1 - \cos 5^\circ) \approx 3.8 \times 10^{-3}\,\text{m}"),
        S(r"מהירות בנקודה הנמוכה", r"פוטנציאלית לקינטית", r"v = \sqrt{2gh} = \sqrt{2 \cdot 10 \cdot 3.8 \times 10^{-3}} \approx 0.28\,\text{m/s}"),
        C(r"בדיקה בדרך אחרת", r"$A = \ell\theta$ ו-$\omega = \sqrt{g/\ell}$", r"v = A\omega = 0.0873 \cdot 3.16 \approx 0.28\,\text{m/s}"),
    ], r"$\approx 0.28\,\text{m/s}$", key=r"≈0.28 m/s"),
    P("ד", r"מהי מתיחות החוט, כאשר למסה $m$ המהירות המקסימלית?", num(Tmax, "N", tol=1), ["fbd", "algebra"], [
        S(r"בנקודה הנמוכה: תנועה מעגלית", r"השקול כלפי מעלה הוא הכוח הצנטריפטלי", r"T - mg = \frac{mv^2}{\ell}"),
        S(r"מציבים", r"$v^2 \approx 0.076$", r"T = 0.1 \cdot 10 + \frac{0.1 \cdot 0.28^2}{1} \approx 1.008\,\text{N}"),
    ], r"$\approx 1.008\,\text{N}$", key=r"≈1.008 N"),
    P("ה", r"מעלים את המטוטלת המתמטית הנ\"ל לגובה $h$ מעל פני כדור הארץ. אם $h$ שווה לרדיוס של כדור הארץ, מה זמן המחזור של המטוטלת?", num(T2, "s", tol=2), ["principle", "algebra"], [
        S(r"תאוצת הכובד בגובה $R$", r"המרחק מהמרכז כפול", r"g' = g\left(\frac{R}{2R}\right)^2 = \frac{g}{4}"),
        S(r"זמן המחזור", r"$T \propto 1/\sqrt{g}$", r"T' = 2\pi\sqrt{\frac{\ell}{g/4}} = 2T \approx 3.97\,\text{s}"),
    ], r"$\approx 4\,\text{s}$ (פי שניים)"),
  ],
  concepts=["מטוטלת מתמטית", "זמן מחזור", "שימור אנרגיה", "מתיחות בנקודה הנמוכה"],
  summary=r"מטוטלת בזווית קטנה: למה היא הרמונית, רבע מחזור, מהירות ומתיחות בנקודה הנמוכה, ומה קורה בגובה רדיוס כדור הארץ.")
