from mk import *
from lib import fbd
STRICT["on"] = True
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
  stem=r"לוח מלבני שמסתו $20\,\text{kg}$ מונח על $6$ קפיצים זהים, כמו בתרשים. כשמניחים במרכז הלוח גוף נוסף שמסתו $10\,\text{kg}$, הלוח שוקע $10\,\text{cm}$.",
  parts=[
    P("א", r"מה קבוע הקפיץ של כל אחד מששת הקפיצים?", num(k, "N/m", tol=1), ["fbd", "algebra"], [
        S(r"הכוח הנוסף", r"המשקל של הגוף הנוסף", r"\Delta F = 10 \cdot 10 = 100\,\text{N}", eq=r"F = mg"),
        S(r"שישה קפיצים זה ליד זה", r"הלוח נשאר מאוזן, ולכן כל קפיץ מתכווץ באותם עשרה סנטימטרים. הכוח הנוסף מתחלק בין ששת הקפיצים", r"6 \cdot K \cdot 0.1 = 100 \;\Rightarrow\; K \approx 167\,\text{N/m}", eq=r"F_{sp} = K\Delta\ell"),
    ], r"$K \approx 167\,\text{N/m}$", key=r"167 N/m"),
    P("ב", r"הלוח העמוס מתחיל להתנודד למעלה ולמטה, ונשאר כל הזמן מאוזן. מה זמן המחזור?", num(T, "s", tol=1), ["principle", "algebra"], [
        S(r"הקבוע השקול", r"כל הקפיצים מתכווצים באותו שיעור, ולכן הכוחות שלהם מתחברים", r"K_{\Sigma} = 6K = 1000\,\text{N/m}"),
        S(r"זמן המחזור", r"המסה שמתנודדת היא הלוח והגוף יחד, שלושים קילוגרם", r"T = 2\pi\sqrt{\frac{30}{1000}} \approx 1.09\,\text{s}", eq=r"T = 2\pi\sqrt{\frac{m}{K}}"),
    ], r"$\approx 1.09\,\text{s}$", key=r"1.09 s"),
    P("ג", r"הקפיצים בנקודות $C$ ו-$F$ נשברו. איך זה משפיע על זמן המחזור של הלוח? נמקו.", choice(["זמן המחזור יגדל", "זמן המחזור יקטן", "זמן המחזור לא ישתנה"], 0), ["principle"], [
        S(r"הקבוע השקול קטן", r"נשארו ארבעה קפיצים", r"K'_{\Sigma} = 4K \approx 667\,\text{N/m}"),
        S(r"זמן המחזור", r"זמן המחזור הפוך לשורש של הקבוע, ולכן הוא גדל", r"T' = 2\pi\sqrt{\frac{30}{667}} \approx 1.33\,\text{s} > T", eq=r"T = 2\pi\sqrt{\frac{m}{K}}"),
    ], r"זמן המחזור יגדל, לבערך $1.33\,\text{s}$"),
  ],
  concepts=["קפיצים זה ליד זה", "מתנד קפיץ", "זמן מחזור"],
  summary=r"לוח על שישה קפיצים: הקבוע של קפיץ אחד מהשקיעה, זמן המחזור, ומה קורה כששני קפיצים נשברים.",
  review="הנחה שלי.\nמה לבדוק: רק לאשר.")
