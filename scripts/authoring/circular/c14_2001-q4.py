from mk import *
import math

def fig():
    g = Fig(560, 300, "נדנדה ענקית: מגדל בגובה 46 מטר, ומתקן קשתי. הנערים קשורים בכבלים באורך 50 מטר לנקודה O, מורמים ל-A ומשוחררים, ונעים בקשת ABC. B הנקודה הנמוכה, 1 מטר מעל הקרקע. בנקודה M שבין A ל-B שמונה כיוונים I עד VIII")
    O = (300, 20); R = 230
    g.ground(20, 540, 280)
    g.dot(*O); g.text(O[0], O[1] - 6, "O")
    aA = math.radians(-35 - 90); aC = math.radians(35 - 90)
    A = (O[0] + R * math.cos(math.radians(235)), O[1] - R * math.sin(math.radians(235)))
    C = (O[0] + R * math.cos(math.radians(305)), O[1] - R * math.sin(math.radians(305)))
    B = (O[0], O[1] + R)
    g.path(f"M {A[0]:.1f},{A[1]:.1f} A {R} {R} 0 0 0 {C[0]:.1f},{C[1]:.1f}", stroke="var(--d-dim)", width=1.5, dash="6 5")
    g.line(*O, *B, stroke="var(--d-dim)", width=1, dash="3 3"); g.text(O[0] + 8, O[1] + 120, "50 m", cls="dim", anchor="start")
    g.dot(*A); g.text(A[0] - 8, A[1] - 6, "A", anchor="end"); g.dot(*B); g.text(B[0] + 10, B[1] + 4, "B", anchor="start"); g.dot(*C); g.text(C[0] + 8, C[1] - 6, "C", anchor="start")
    g.poly([(A[0] - 6, A[1] + 4), (A[0] - 24, 280), (A[0] + 12, 280)], fill="none", width=1.5)
    g.dim(30, A[1], 30, 280, "46 m"); g.dim(B[0] + 40, B[1], B[0] + 40, 280, "1 m", offset=0)
    am = math.radians(255); M = (O[0] + R * math.cos(am), O[1] - R * math.sin(am))
    g.dot(*M); g.text(M[0] + 6, M[1] + 16, "M", anchor="start")
    labs = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]
    for i, lab in enumerate(labs):
        ang = math.radians(90 - 45 * i); r = 28
        g.arrow(M[0], M[1], M[0] + r * math.cos(ang), M[1] - r * math.sin(ang), None, width=1.5)
        g.text(M[0] + (r + 12) * math.cos(ang), M[1] - (r + 12) * math.sin(ang) + 5, lab, cls="dim")
    return g

E(id="bagrut-2001-q4", year=2001, label="2001 שאלה 4", topic="circular", sub="circ-vertical", diff=3, fig=fig,
  stem=r"התרשים מתאר מתקן של נדנדת ענק בלונה פארק. הנדנדה מורכבת ממוטות ברזל שקשורים למתקן קשתי ענקי. שלושה נערים, שמסתם הכוללת $200\,\text{kg}$, נקשרים לנדנדה בנקודה $B$, שנמצאת בגובה $1\,\text{m}$ מעל הקרקע. הם מובלים לנקודה $A$, שנמצאת בראש מגדל בגובה $46\,\text{m}$ מעל הקרקע, משוחררים, ומתנדנדים לאורך קשת מעגלית $ABC$ שרדיוסה $50\,\text{m}$. הנח כי במהלך התנועה החוטים אינם מתארכים, ומסתם ניתנת להזנחה. הזנח גם את החיכוך עם האוויר.",
  parts=[
    P("א", r"חשב את גודל המהירות של הנערים כאשר הם חולפים בנקודה $B$, אחרי ששוחררו מנקודה $A$.", num(30, "m/s"), ["principle"], [
        S(r"הפרש גבהים", r"מ-$46$ ל-$1\,\text{m}$", r"\Delta h = 45\,\text{m}"),
        S(r"שימור אנרגיה", r"משוחררים ממנוחה", r"v_B = \sqrt{2g\Delta h} = \sqrt{900} = 30\,\text{m/s}"),
    ], r"$30\,\text{m/s}$", key=r"vB=30 m/s"),
    P("ב", r"חשב את התאוצה הצנטריפטלית של הנערים ברגע שבו הם חולפים בנקודה $B$ במהלך תנועתם.", num(18, "m/s^2"), ["principle"], [
        S(r"תאוצה רדיאלית", r"R = 50 m", r"a_R = \frac{v_B^2}{R} = \frac{900}{50} = 18\,\text{m/s}^2"),
    ], r"$18\,\text{m/s}^2$", key=r"aR=18 m/s^2"),
    P("ג", r"חשב את גודל שקול הכוחות שהחוטים מפעילים על שלושת הנערים, כאשר הם חולפים בנקודה $B$.", num(5600, "N"), ["fbd", "principle"], [
        S(r"החוק השני ב-$B$", r"השקול כלפי מעלה (המרכז)", r"T - Mg = M a_R"),
        S(r"מציבים", r"המסה הכוללת 200 kg", r"T = 200 \cdot (10 + 18) = 5600\,\text{N}"),
    ], r"$5600\,\text{N}$", key=r"TB=5600 N"),
    P("ד", r"על המסלול שמתאר את מסלול התנועה של הנערים המתנדנדים מסומנת נקודה $M$ (בין $A$ ל-$B$), ושמונה כיוונים I-VIII. איזה מבין הכיוונים יכול לתאר את כיוון התאוצה שיש לנערים בנקודה $M$?", choice(["I", "II", "III", "IV", "V", "VI", "VII", "VIII"], 2), ["principle"], [
        S(r"רכיב רדיאלי", r"כלפי $O$: מעלה וימינה (כיוון II)", r"\vec a_R \to O"),
        S(r"רכיב משיקי", r"הנערים מאיצים בדרך למטה, ולכן קדימה במשיק: מטה וימינה (כיוון IV)", r"\vec a_t \parallel \vec v"),
        S(r"הסכום", r"בין שני הרכיבים", r"\vec a = \vec a_R + \vec a_t"),
    ], r"כיוון III", key=r"כיוון III"),
  ],
  concepts=["מעגל אנכי", "שימור אנרגיה", "תאוצה צנטריפטלית", "תאוצה משיקית ורדיאלית"],
  summary=r"נדנדת ענק: מהירות בתחתית, תאוצה, הכוח בכבלים, ולמה התאוצה בדרך למטה לא מכוונת למרכז.")
