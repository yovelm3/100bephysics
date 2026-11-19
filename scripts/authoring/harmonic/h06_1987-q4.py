from mk import *
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
  stem=r"גוף שמסתו $0.8\,\text{kg}$ המחובר לקפיץ נע בתנועה הרמונית פשוטה על פני משטח אופקי חלק. זמן המחזור של התנועה הוא שנייה אחת. האנרגיה הכוללת של המערכת היא $1\,\text{J}$.",
  parts=[
    P("א", r"חשב את מהירותו המקסימלית של הגוף.", num(v, "m/s", tol=1), ["principle", "algebra"], [
        S(r"בשיווי המשקל כל האנרגיה קינטית", r"הקפיץ רפוי שם", r"\frac{1}{2}mv_{\max}^2 = E"),
        S(r"מציבים", r"$E = 1\,\text{J}$", r"v_{\max} = \sqrt{\frac{2 \cdot 1}{0.8}} \approx 1.58\,\text{m/s}"),
    ], r"$\approx 1.58\,\text{m/s}$", key=r"1.58 m/s"),
    P("ב", r"חשב את קבוע הקפיץ בתנועה ההרמונית.", num(k, "N/m", tol=1), ["principle", "algebra"], [
        S(r"זמן מחזור של מתנד קפיץ", r"$T = 2\pi\sqrt{m/k}$", r"k = \frac{4\pi^2 m}{T^2} = \frac{4\pi^2 \cdot 0.8}{1^2} \approx 31.6\,\text{N/m}"),
    ], r"$\approx 31.6\,\text{N/m}$", key=r"31.6 N/m"),
    P("ג", r"חשב את משרעת התנודה.", num(A, "m", tol=1), ["principle", "algebra"], [
        S(r"בקצה כל האנרגיה בקפיץ", r"המהירות שם אפס", r"\frac{1}{2}kA^2 = E \Rightarrow A = \sqrt{\frac{2 \cdot 1}{31.6}} \approx 0.25\,\text{m}"),
        C(r"בדיקה בדרך אחרת", r"$v_{\max} = A\omega$, $\omega = 2\pi$", r"A = \frac{1.58}{2\pi} \approx 0.25\,\text{m}"),
    ], r"$\approx 0.25\,\text{m}$", key=r"0.25 m"),
    P("ד", r"באיזה מרחק מנקודת שיווי-המשקל שווה האנרגיה הקינטית של הגוף לאנרגיה הפוטנציאלית האגורה במערכת?", num(x, "m", tol=1), ["principle", "algebra"], [
        S(r"חצי מהאנרגיה בקפיץ", r"$E_k = E_p$ ו-$E_k + E_p = E$", r"\frac{1}{2}kx^2 = \frac{1}{2}E"),
        S(r"פותרים", r"$x^2 = A^2/2$", r"x = \frac{A}{\sqrt{2}} = \frac{0.25}{\sqrt{2}} \approx 0.18\,\text{m}"),
    ], r"$\approx 0.18\,\text{m}$", key=r"0.18 m"),
  ],
  concepts=["אנרגיה בתנועה הרמונית", "קבוע קפיץ מזמן מחזור", "משרעת"],
  summary=r"מאנרגיה כוללת וזמן מחזור: מהירות מרבית, קבוע הקפיץ, משרעת, והנקודה שבה האנרגיה מתחלקת חצי-חצי.")
