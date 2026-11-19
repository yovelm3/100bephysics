from mk import *
import math
k = 10 * 10 / 0.1 / 6; M = 30
T = 2 * math.pi * math.sqrt(M / (6 * k)); T4 = 2 * math.pi * math.sqrt(M / (4 * k))

def fig():
    g = Fig(460, 250, "לוח מלבני מונח על שישה קפיצים זהים בנקודות A, B, C, D, E ו-F: ארבעה בפינות ושניים באמצע הצלעות הארוכות")
    gy = 220
    g.ground(30, 430, gy)
    pts = {"A": (70, 150), "F": (200, 150), "E": (330, 150), "B": (130, 100), "C": (260, 100), "D": (390, 100)}
    back = [l for l in pts if pts[l][1] == 100]; front = [l for l in pts if pts[l][1] == 150]
    for lab in back:
        x, y = pts[lab]; g.spring(x, y, x, gy - 30, coils=6, amp=6, lead=6)
    g.poly([(70, 150), (330, 150), (390, 100), (130, 100)], fill="var(--d-fill)", stroke="var(--d-line)")
    for lab in front:
        x, y = pts[lab]; g.spring(x, y, x, gy, coils=6, amp=6, lead=6)
    for lab, (x, y) in pts.items():
        g.text(x - 12 if lab in "AB" else x + 12, y - 8, lab, anchor="end" if lab in "AB" else "start")
    return g

E(id="bagrut-1985-q2", year=1985, label="1985 שאלה 2", topic="harmonic", sub="harm-spring", diff=2, fig=fig,
  stem=r"גוף מלבני, שמסתו $20\,\text{kg}$, נשען על $6$ קפיצים זהים, כמתואר בתרשים. כאשר מניחים במרכזו של הגוף המלבני גוף נוסף, שמסתו $10\,\text{kg}$, הוא שוקע בשיעור של $10\,\text{cm}$.",
  parts=[
    P("א", r"מהו קבוע הכוח של כל אחד משישת הקפיצים?", num(k, "N/m", tol=1), ["fbd", "algebra"], [
        S(r"הכוח הנוסף", r"משקל הגוף הנוסף", r"\Delta F = 10 \cdot 10 = 100\,\text{N}"),
        S(r"שישה קפיצים במקביל", r"כל אחד מתכווץ $0.1\,\text{m}$", r"6k \cdot 0.1 = 100 \Rightarrow k \approx 167\,\text{N/m}"),
    ], r"$k \approx 167\,\text{N/m}$", key=r"167 N/m"),
    P("ב", r"הגוף המלבני העמוס מתחיל להתנודד מעלה-מטה (אך הוא נשאר כל הזמן במצב מאוזן). מהו זמן המחזור של התנודות?", num(T, "s", tol=1), ["principle", "algebra"], [
        S(r"קבוע שקול", r"קפיצים במקביל", r"K = 6k = 1000\,\text{N/m}"),
        S(r"מתנד קפיץ", r"המסה המתנודדת: $20 + 10 = 30\,\text{kg}$", r"T = 2\pi\sqrt{\frac{30}{1000}} \approx 1.09\,\text{s}"),
    ], r"$\approx 1.09\,\text{s}$", key=r"1.09 s"),
    P("ג", r"הנח כי הקפיצים המחוברים לנקודות $C$ ו-$F$ נשברו. כיצד ישפיע הדבר על זמן המחזור של תנודות הלוח? נמק.", choice(["זמן המחזור יגדל", "זמן המחזור יקטן", "זמן המחזור לא ישתנה"], 0), ["principle"], [
        S(r"קבוע שקול קטן", r"נשארים ארבעה קפיצים", r"K' = 4k \approx 667\,\text{N/m}"),
        S(r"זמן מחזור", r"$T \propto 1/\sqrt{K}$", r"T' = 2\pi\sqrt{\frac{30}{667}} \approx 1.33\,\text{s} > T"),
    ], r"זמן המחזור יגדל (לכ-$1.33\,\text{s}$)"),
  ],
  concepts=["קפיצים במקביל", "מתנד קפיץ", "זמן מחזור"],
  summary=r"לוח על שישה קפיצים: קבוע של קפיץ אחד מהשקיעה, זמן המחזור, ומה קורה כששני קפיצים נשברים.")
