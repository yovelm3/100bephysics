from mk import *
import math

def fig():
    g = Fig(780, 300, "נדנדה ענקית בקנה מידה: מגדל בגובה 46 מטר, והנקודה A בראשו. הנערים קשורים בכבלים באורך 50 מטר לנקודה O, ונעים בקשת ABC. B הנקודה הנמוכה, 1 מטר מעל הקרקע. משמאל: הקשת ABC, ועליה הנקודה M ושמונה כיוונים I עד VIII")
    k = 4.0  # px per metre
    gy = 284; O = (250, gy - k * 51); R = 50 * k
    th = math.acos(5 / 50)  # A is 45 m above B
    A = (O[0] - R * math.sin(th), O[1] + R * math.cos(th)); C = (O[0] + R * math.sin(th), A[1]); B = (O[0], O[1] + R)
    g.ground(10, 480, gy)
    g.dot(*O); g.text(O[0], O[1] - 8, "O")
    g.path(f"M {A[0]:.1f},{A[1]:.1f} A {R} {R} 0 0 0 {C[0]:.1f},{C[1]:.1f}", stroke="var(--d-dim)", width=1.5, dash="6 5")
    g.line(*O, *B, stroke="var(--d-dim)", width=1, dash="3 3"); g.text(O[0] + 8, O[1] + 110, "50 m", cls="dim", anchor="start")
    g.dot(*A); g.text(A[0] + 8, A[1] - 8, "A", anchor="start"); g.dot(*B); g.text(B[0] + 10, B[1] - 2, "B", anchor="start"); g.dot(*C); g.text(C[0] - 8, C[1] - 8, "C", anchor="end")
    g.poly([(A[0], A[1]), (A[0] - 14, gy), (A[0] + 14, gy)], fill="none", width=1.5); g.heb(A[0] + 22, gy - 60, "מגדל", anchor="start")
    g.dim(14, A[1], 14, gy, "46 m"); g.dim(B[0] + 40, B[1], B[0] + 40, gy, "1 m", offset=0)
    # second panel (as in the original, for part ד): the arc ABC, the point M and the eight directions
    P0 = (640, 40); r2 = 130
    pt = lambda deg: (P0[0] + r2 * math.cos(math.radians(deg)), P0[1] - r2 * math.sin(math.radians(deg)))
    a2, c2, b2 = pt(186), pt(354), pt(270)
    g.path(f"M {a2[0]:.1f},{a2[1]:.1f} A {r2} {r2} 0 0 0 {c2[0]:.1f},{c2[1]:.1f}", stroke="var(--d-dim)", width=1.5, dash="6 5")
    g.dot(*P0); g.text(P0[0], P0[1] - 8, "O")
    for p, t, dy in ((a2, "A", -8), (b2, "B", 20), (c2, "C", -8)):
        g.dot(*p); g.text(p[0], p[1] + dy, t)
    M = pt(222); g.dot(*M); g.text(M[0] + 8, M[1] + 16, "M", anchor="start")
    labs = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]
    for i, lab in enumerate(labs):
        ang = math.radians(90 - 45 * i); r = 30
        g.arrow(M[0], M[1], M[0] + r * math.cos(ang), M[1] - r * math.sin(ang), None, width=1.5)
        g.text(M[0] + (r + 14) * math.cos(ang), M[1] - (r + 14) * math.sin(ang) + 5, lab, cls="dim")
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
