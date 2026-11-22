from mk import *
STRICT["on"] = True

def fig():
    g = Fig(560, 330, "מקומו של גוף א' בזמנים 0 עד 4 שניות: (0,0), (3,1), (6,4), (9,9), (12,16) מטר. ציר x אופקי וציר y כלפי מטה")
    ox, oy, sx, sy = 70, 40, 16, 15
    for i in range(0, 27):
        g.line(ox + i * sx, oy, ox + i * sx, oy + 18 * sy, stroke="var(--d-hatch)", width=0.8)
    for j in range(0, 19):
        g.line(ox, oy + j * sy, ox + 26 * sx, oy + j * sy, stroke="var(--d-hatch)", width=0.8)
    g.add(f'<line x1="{ox}" y1="{oy}" x2="{ox + 26 * sx + 20}" y2="{oy}" stroke="var(--d-line)" stroke-width="1.8" marker-end="url(#f-axis)"/>')
    g.add(f'<line x1="{ox}" y1="{oy}" x2="{ox}" y2="{oy + 18 * sy + 20}" stroke="var(--d-line)" stroke-width="1.8" marker-end="url(#f-axis)"/>')
    for i in range(2, 27, 4):
        g.text(ox + i * sx, oy - 8, str(i), cls="dim")
    for j in range(2, 19, 4):
        g.text(ox - 8, oy + j * sy + 4, str(j), cls="dim", anchor="end")
    g.text(ox + 26 * sx + 24, oy + 4, "x (m)", anchor="start")
    g.text(ox + 10, oy + 18 * sy + 18, "y (m)", anchor="start")
    for t in range(5):
        x, y = 3 * t, t * t
        g.circle(ox + x * sx, oy + y * sy, 5.5, fill="var(--d-label)")
        g.text(ox + x * sx + 9, oy + y * sy + 17, f"t={t}s", cls="dim", anchor="start")
    return g

def answer_fig():
    g = Fig(600, 340, "גרף התשובה: מקומות שלושת הגופים בזמנים 0 עד 4 שניות. גוף ב' על ציר y בנקודות 0, 1, 4, 9, 16 מטר. גוף א' בנקודות x שווה 0, 3, 6, 9, 12. גוף ג' בנקודות x שווה 0, 6, 12, 18, 24. בכל רגע שלושת הגופים באותו גובה")
    ox, oy, sx, sy = 70, 40, 17, 15
    for i in range(0, 27):
        g.line(ox + i * sx, oy, ox + i * sx, oy + 18 * sy, stroke="var(--d-hatch)", width=0.8)
    for j in range(0, 19):
        g.line(ox, oy + j * sy, ox + 26 * sx, oy + j * sy, stroke="var(--d-hatch)", width=0.8)
    g.add(f'<line x1="{ox}" y1="{oy}" x2="{ox + 26 * sx + 20}" y2="{oy}" stroke="var(--d-line)" stroke-width="1.8" marker-end="url(#f-axis)"/>')
    g.add(f'<line x1="{ox}" y1="{oy}" x2="{ox}" y2="{oy + 18 * sy + 20}" stroke="var(--d-line)" stroke-width="1.8" marker-end="url(#f-axis)"/>')
    for i in range(2, 27, 4):
        g.text(ox + i * sx, oy - 8, str(i), cls="dim")
    for j in range(2, 19, 4):
        g.text(ox - 8, oy + j * sy + 4, str(j), cls="dim", anchor="end")
    g.text(ox + 26 * sx + 24, oy + 4, "x (m)", anchor="start")
    g.text(ox + 10, oy + 18 * sy + 18, "y (m)", anchor="start")
    for t in range(1, 5):  # same height at the same moment: a dashed line through all three
        g.line(ox, oy + t * t * sy, ox + 6 * t * sx, oy + t * t * sy, stroke="var(--d-dim)", width=1, dash="4 3")
    for t in range(5):
        y = oy + t * t * sy
        g.circle(ox, y, 6, fill="var(--d-ask)")                       # body B
        g.circle(ox + 3 * t * sx, y, 6, fill="var(--d-label)")        # body A
        g.circle(ox + 6 * t * sx, y, 6, fill="none", stroke="var(--d-body)", width=2.6)  # body C
    g.heb(ox + 4 * 3 * sx, oy + 16 * sy + 24, "א'")
    g.heb(ox + 18, oy + 16 * sy + 24, "ב'")
    g.heb(ox + 24 * sx, oy + 16 * sy + 24, "ג'")
    return g

E(id="bagrut-1993-q1", year=1993, label="1993 שאלה 1", topic="kinematics", sub="kin-projectile", diff=3, fig=fig,
  stem=r"בניסוי על פני כוכב לכת דמיוני זורקים גוף א' אופקית, בכיוון ציר $x$. התרשים מראה את מקומו של גוף א' במישור התנועה ברגעים $t = 0, 1, 2, 3, 4\,\text{s}$. ציר $x$ אופקי, וציר $y$ אנכי וכיוונו כלפי מטה. אפשר להזניח את השפעת האוויר.",
  parts=[
    P("א", r"מה גודל המהירות האופקית שבה נזרק גוף א'? מה תאוצת הנפילה החופשית על פני כוכב הלכת?", multi((r"המהירות האופקית", 3, "m/s"), (r"תאוצת הנפילה", 2, "m/s^2")), ["graph", "principle", "algebra"], [
        X(r"הכיוונים נקבעו בשאלה: ציר האורך ימינה, וציר הגובה כלפי מטה. בציר האופקי לא פועל כוח, ולכן הגוף מתקדם אותו מרחק בכל שנייה. בציר האנכי הגוף יוצא בלי מהירות ומאיץ בתאוצת הנפילה של הכוכב."),
        S(r"קוראים את המקומות האופקיים מהתרשים", r"בכל שנייה הגוף מתקדם אותו מרחק", r"x = 0,\ 3,\ 6,\ 9,\ 12\ \text{m}"),
        S(r"המהירות האופקית", r"מהירות קבועה היא העתק חלקי זמן", r"v_x = \frac{12 - 0}{4 - 0} = 3\,\text{m/s}", eq=r"\bar v = \frac{\Delta x}{\Delta t}"),
        S(r"קוראים את המקומות האנכיים", r"המרחקים הם ריבועי הזמנים", r"y = 0,\ 1,\ 4,\ 9,\ 16\ \text{m} \;\Rightarrow\; y = 1 \cdot t^2"),
        S(r"משוואת המקום בציר האנכי", r"המהירות האנכית בהתחלה אפס, והתאוצה היא תאוצת הנפילה של הכוכב", r"y = 0 + 0 \cdot t + \tfrac{1}{2} g' t^2", eq=r"x = x_0 + v_0 t + \tfrac{1}{2}at^2"),
        S(r"משווים את המקדמים", r"שתי המשוואות מתארות את אותה תנועה, ולכן המקדם של ריבוע הזמן שווה", r"\tfrac{1}{2} g' = 1 \;\Rightarrow\; g' = 2\,\text{m/s}^2"),
        C(r"בדיקה ברגע האחרון", r"מציבים ארבע שניות ובודקים מול התרשים", r"\tfrac{1}{2} \cdot 2 \cdot 4^2 = 16\,\text{m} \;\checkmark"),
    ], r"$3\,\text{m/s}$ ו-$2\,\text{m/s}^2$", key=r"3 m/s ; 2 m/s^2"),
    P("ב", r"מאותה נקודה, ובאותו רגע שבו נזרק גוף א', משחררים את גוף ב' לנפילה חופשית, וזורקים את גוף ג' אופקית בכיוון ציר $x$ במהירות כפולה מזו של גוף א'. העתיקו את התרשים, והוסיפו את המקומות של גופים ב' ו-ג' ברגעים $t = 0, 1, 2, 3, 4\,\text{s}$.", OPEN, ["understanding", "graph", "principle"], [
        X(r"התנועה האנכית זהה לשלושת הגופים: כולם יוצאים בלי מהירות אנכית, ובאותה תאוצה. ההבדל הוא רק בציר האופקי."),
        S(r"גוף ב'", r"אין לו מהירות אופקית, ולכן הוא נשאר על ציר הגובה, ובכל רגע באותו גובה כמו גוף א'", r"(0,0),\ (0,1),\ (0,4),\ (0,9),\ (0,16)"),
        S(r"גוף ג'", r"המהירות האופקית שלו כפולה, ובציר הגובה הוא נמצא כמו גוף א'", r"v_x = 2 \cdot 3 = 6\,\text{m/s}:\quad (0,0),\ (6,1),\ (12,4),\ (18,9),\ (24,16)"),
        D(r"התרשים המלא: שלושת הגופים", answer_fig),
    ], r"גוף ב' על ציר הגובה, וגוף ג' רחוק פי שניים מגוף א' בציר האופקי. בכל רגע שלושת הגופים באותו גובה"),
    P("ג", r"גוף נזרק אופקית. $\vec v_1$ ו-$\vec v_2$ הם וקטורי המהירות שלו ברגעים $t_1$ ו-$t_2$, כאשר $t_2 > t_1$. הסבירו מדוע הווקטור $\Delta\vec v = \vec v_2 - \vec v_1$ מכוון כלפי מטה.", OPEN, ["understanding", "principle"], [
        X(r"משווים את שני וקטורי המהירות, רכיב אחרי רכיב."),
        S(r"הרכיב האופקי", r"לא פועל כוח אופקי, ולכן הרכיב האופקי זהה בשני הרגעים ומתבטל בהפרש", r"\Delta v_x = v_x - v_x = 0"),
        S(r"הרכיב האנכי", r"התאוצה היחידה היא תאוצת הכובד, כלפי מטה", r"\Delta v_y = g\,(t_2 - t_1) > 0", eq=r"v = v_0 + at"),
        S(r"מסקנה", r"שינוי המהירות הוא בכיוון התאוצה, והתאוצה כלפי מטה", r"\Delta\vec v = \vec g\,\Delta t"),
    ], r"$\Delta\vec v = \vec g\,\Delta t$: הרכיב האופקי לא משתנה, ולכן ההפרש כולו אנכי כלפי מטה"),
  ],
  concepts=["זריקה אופקית", "קריאת נתונים מתרשים", "תאוצת נפילה בכוכב אחר", "שינוי מהירות כווקטור"],
  summary=r"מוצאים מהירות אופקית ותאוצת נפילה ממקומות של גוף בזמנים שווים, ומשווים לנפילה חופשית ולזריקה מהירה יותר.",
  note=r"בזמנים שווים: מרווחים שווים פירושם מהירות קבועה, ומרווחים שגדלים כמו $1, 3, 5, 7$ פירושם תאוצה קבועה ממנוחה.",
  review="הנחה שלי.\nסעיף א הוא סעיף אחד, כמו במקור, עם שתי תיבות.\nמה לבדוק: רק לאשר.")
