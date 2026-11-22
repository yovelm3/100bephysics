from mk import *
from lib import fbd
STRICT["on"] = True
import math
m = 0.8; T = 1; E0 = 1
v = math.sqrt(2 * E0 / m); k = 4 * math.pi ** 2 * m / T ** 2; A = math.sqrt(2 * E0 / k); x = A / math.sqrt(2)

def fig():
    g = Fig(480, 150, "גוף שמסתו 0.8 קילוגרם מחובר לקפיץ ונע על משטח אופקי חלק בין שני קצוות התנועה")
    gy = 110
    g.ground(40, 440, gy); g.wall(60, 40, gy)
    g.spring(60, gy - 20, 230, gy - 20, coils=9)
    g.block(260, gy - 20, 66, 40, "0.8 kg")
    g.line(255, gy - 56, 255, gy + 2, width=1, dash="4 4")
    g.arrow(200, gy - 50, 310, gy - 50); g.arrow(310, gy - 50, 200, gy - 50)
    return g

E(id="bagrut-1987-q4", year=1987, label="1987 שאלה 4", topic="harmonic", sub="harm-energy", diff=2, fig=fig,
  stem=r"גוף שמסתו $0.8\,\text{kg}$ מחובר לקפיץ, ונע בתנועה הרמונית על משטח אופקי חלק. זמן המחזור שנייה אחת, והאנרגיה הכוללת של המערכת $1\,\text{J}$.",
  parts=[
    P("א", r"מה המהירות המרבית של הגוף?", num(v, "m/s", tol=1), ["principle", "algebra"], [
        S(r"בשיווי המשקל כל האנרגיה קינטית", r"שם הקפיץ רפוי, ואין לו אנרגיה", r"\tfrac{1}{2}m\,v_{\max}^2 = E", eq=r"E_k = \tfrac{1}{2}mv^2"),
        S(r"מציבים", r"את המסה ואת האנרגיה", r"v_{\max} = \sqrt{\frac{2 \cdot 1}{0.8}} \approx 1.58\,\text{m/s}"),
    ], r"$\approx 1.58\,\text{m/s}$", key=r"1.58 m/s"),
    P("ב", r"מה קבוע הקפיץ?", num(k, "N/m", tol=1), ["principle", "algebra"], [
        S(r"זמן המחזור של מסה על קפיץ", r"מעלים בריבוע ומבודדים את הקבוע", r"K = \frac{4\pi^2 m}{T^2} = \frac{4\pi^2 \cdot 0.8}{1^2} \approx 31.6\,\text{N/m}", eq=r"T = 2\pi\sqrt{\frac{m}{K}}"),
    ], r"$\approx 31.6\,\text{N/m}$", key=r"31.6 N/m"),
    P("ג", r"מה המשרעת של התנודה?", num(A, "m", tol=1), ["principle", "algebra"], [
        S(r"בקצה כל האנרגיה בקפיץ", r"בקצה המהירות אפס", r"\tfrac{1}{2}K A^2 = E \;\Rightarrow\; A = \sqrt{\frac{2 \cdot 1}{31.6}} \approx 0.25\,\text{m}", eq=r"E = \tfrac{1}{2}KA^2"),
        C(r"בדיקה בדרך אחרת", r"המהירות המרבית היא המשרעת כפול המהירות הזוויתית", r"A = \frac{v_{\max}}{\omega} = \frac{1.58}{2\pi} \approx 0.25\,\text{m}", eq=r"v_{\max} = A\omega"),
    ], r"$\approx 0.25\,\text{m}$", key=r"0.25 m"),
    P("ד", r"באיזה מרחק מנקודת שיווי המשקל האנרגיה הקינטית של הגוף שווה לאנרגיה שאגורה בקפיץ?", num(x, "m", tol=1), ["principle", "algebra"], [
        S(r"חצי מהאנרגיה בקפיץ", r"שתי האנרגיות שוות, וביחד הן האנרגיה הכוללת. לכן בקפיץ יש חצי ממנה", r"\tfrac{1}{2}K x^2 = \tfrac{1}{2}E = \tfrac{1}{2} \cdot \tfrac{1}{2}KA^2", eq=r"U_{sp} = \tfrac{1}{2}K(\Delta\ell)^2"),
        S(r"פותרים", r"מצמצמים ומוציאים שורש", r"x^2 = \frac{A^2}{2} \;\Rightarrow\; x = \frac{0.25}{\sqrt{2}} \approx 0.18\,\text{m}"),
    ], r"$\approx 0.18\,\text{m}$", key=r"0.18 m"),
  ],
  concepts=["אנרגיה בתנועה הרמונית", "קבוע קפיץ מזמן מחזור", "משרעת"],
  summary=r"מהאנרגיה הכוללת ומזמן המחזור: המהירות המרבית, קבוע הקפיץ, המשרעת, והנקודה שבה האנרגיה מתחלקת חצי-חצי.",
  review="הנחה שלי.\nמה לבדוק: רק לאשר.")
