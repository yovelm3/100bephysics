from mk import *
import math
H = 0.2; v = math.sqrt(10 * H); r = H * math.tan(math.radians(30)); T = 2 * math.pi * r / v

def fig():
    g = Fig(560, 260, "חרוט הפוך שזווית הפתיחה שלו 2 אלפא. חרוז נע במעגל אופקי בתוך החרוט, בגובה H מעל קודקוד החרוט")
    g.ground(80, 480, 240)
    apex = (280, 240)
    g.poly([apex, (140, 20), (420, 20)], fill="var(--d-fill)")
    g.add('<ellipse cx="280" cy="20" rx="140" ry="16" fill="var(--d-fill)" stroke="var(--d-line)" stroke-width="2"/>')
    y = 110; half = (240 - y) * 140 / 220
    g.add(f'<ellipse cx="280" cy="{y}" rx="{half:.0f}" ry="10" fill="none" stroke="var(--d-dim)" stroke-width="1.4" stroke-dasharray="5 4"/>')
    g.ball(280 - half + 4, y, 7)
    g.line(280, 240, 280, 20, stroke="var(--d-dim)", width=1, dash="3 3")
    g.angle(*apex, 40, 90, 122.5, "α", lr=56); g.angle(*apex, 40, 57.5, 90, "α", lr=56)
    g.dim(440, y, 440, 240, "H")
    return g

E(id="bagrut-2010-q2", year=2010, label="2010 שאלה 2", topic="circular", sub="circ-horizontal", diff=3, fig=fig,
  stem=r"חרוז קטן נע בתנועה מעגלית קצובה במישור אופקי בתוך חרוט שזווית הפתיחה שלו $2\alpha$. כוחות החיכוך זניחים.",
  parts=[
    P("א", r"בנה תרשים של כל הכוחות שפועלים על החרוז, ורשום ליד כל חץ את שם הכוח. ציין מי מפעיל כל כוח.", OPEN, ["fbd"], [
        S(r"שני כוחות", r"כובד (כדור הארץ). נורמלי (דופן החרוט), בניצב לדופן, כלפי פנים ולמעלה", r"mg\downarrow,\quad N"),
    ], r"כובד ונורמלי"),
    P("ב", r"השתמש בחוקי ניוטון כדי לכתוב את שתי המשוואות שקובעות את תנועת החרוז: משוואה אחת לכיוון הרדיאלי ומשוואה אחת לכיוון האנכי.", OPEN, ["fbd", "principle"], [
        S(r"זווית הנורמלי", r"הדופן נוטה בזווית $\alpha$ מהאנך, והנורמלי ניצב לה, ולכן נוטה בזווית $\alpha$ מהאופק", r"N_x = N\cos\alpha,\ N_y = N\sin\alpha"),
        S(r"המשוואות", r"רדיאלית: תאוצה מרכזית. אנכית: אין תאוצה", r"N\cos\alpha = m a_R,\quad N\sin\alpha = mg"),
    ], r"$N\cos\alpha = m a_R$, $N\sin\alpha = mg$", key=r"Ncosα = m·ar ; Nsinα = mg"),
    P("ג", r"נתונה המהירות הקווית של החרוז, $v$. בטא בעזרתה את גובה מישור התנועה של החרוז, $H$.", OPEN, ["principle", "algebra"], [
        S(r"מחלקים", r"N ו-m מתבטלים", r"a_R = \frac{g}{\tan\alpha}"),
        S(r"רדיוס המעגל", r"מהגיאומטריה", r"r = H\tan\alpha"),
        S(r"מציבים", r"$a_R = v^2/r$", r"\frac{v^2}{H\tan\alpha} = \frac{g}{\tan\alpha} \Rightarrow H = \frac{v^2}{g}"),
    ], r"$H = \frac{v^2}{g}$", key=r"H = v²/g"),
    P("ד", r"הראה כי אם החרוז יאבד (מסיבה כלשהי) אנרגיה קינטית, מישור התנועה שלו בתוך החרוט יהיה נמוך יותר ($H$ קטן).", OPEN, ["principle"], [
        S(r"הקשר", r"מסעיף ג", r"H = \frac{v^2}{g} = \frac{2E_k}{mg}"),
    ], r"$H$ פרופורציוני לאנרגיה הקינטית"),
    P("ה1", r"החרוז נע בתוך החרוט כאשר $\alpha = 30^\circ$ ו-$H = 20\,\text{cm}$. חשב את המהירות הקווית של החרוז.", num(v, "m/s"), ["algebra"], [
        S(r"מציבים", r"H = 0.2 m", r"v = \sqrt{gH} = \sqrt{10 \cdot 0.2} \approx 1.41\,\text{m/s}"),
    ], r"$\approx 1.41\,\text{m/s}$", key=r"v≈1.41 m/s"),
    P("ה2", r"חשב את זמן המחזור של תנועת החרוז.", num(T, "s"), ["algebra"], [
        S(r"הרדיוס", r"r = H tan α", r"r = 0.2\tan 30^\circ \approx 0.115\,\text{m}"),
        S(r"זמן מחזור", r"היקף חלקי מהירות", r"T = \frac{2\pi r}{v} = \frac{2\pi \cdot 0.115}{1.41} \approx 0.51\,\text{s}"),
    ], r"$\approx 0.51\,\text{s}$", key=r"T≈0.51 s"),
  ],
  concepts=["תנועה מעגלית אופקית", "כוח נורמלי בחרוט", "מהירות וגובה", "זמן מחזור"],
  summary=r"חרוז בחרוט: הנורמלי מספק גם את התמיכה וגם את הכוח הצנטריפטלי, והגובה תלוי רק במהירות, $H = v^2/g$.")
