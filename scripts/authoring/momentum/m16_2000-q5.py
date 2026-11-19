from mk import *
import math
px, py = 10 - 4 * 0.5, 4 * math.sin(math.radians(60))

def fig():
    g = Fig(560, 200, "מבט מלמעלה על שולחן: תרשים א: דסקית I במסה 1 קילוגרם נעה במהירות 10 מטר לשנייה לעבר דסקית II במנוחה בראשית. תרשים ב: אחרי ההתנגשות דסקית II נעה במהירות 4 מטר לשנייה בזווית 60 מעלות מתחת לציר x, ברביע הרביעי")
    for ox, title in ((300, "תרשים א"), (40, "תרשים ב")):
        g.rect(ox, 20, 220, 150, fill="none", width=1)
        g.add(f'<line x1="{ox+10}" y1="95" x2="{ox+210}" y2="95" stroke="var(--d-line)" stroke-width="1.4" marker-end="url(#f-axis)"/>')
        g.add(f'<line x1="{ox+110}" y1="160" x2="{ox+110}" y2="28" stroke="var(--d-line)" stroke-width="1.4" marker-end="url(#f-axis)"/>')
        g.text(ox + 206, 112, "x", cls="dim"); g.text(ox + 118, 34, "y", cls="dim", anchor="start"); g.heb(ox + 110, 190, title)
    g.circle(340, 95, 9, fill="var(--d-body)"); g.arrow(352, 82, 392, 82, "v₁", lx=372, ly=72); g.heb(340, 120, "I")
    g.circle(410, 95, 9, fill="var(--d-body)"); g.heb(410, 120, "II")
    g.circle(150, 95, 9, fill="var(--d-body)"); g.heb(136, 82, "II")
    g.arrow(150, 95, 150 + 50 * 0.5, 95 + 50 * math.sin(math.radians(60)), "u₂", lx=184, ly=140, anchor="start")
    g.angle(150, 95, 30, -60, 0, "α", lr=42); g.heb(200, 160, "רביע רביעי")
    return g

E(id="bagrut-2000-q5", year=2000, label="2000 שאלה 5", topic="momentum", sub="mom-collisions", diff=3, fig=fig,
  stem=r"בתרשים א מתואר במבט מלמעלה משטח של שולחן חלק ועליו שתי דסקיות: דסקית I שמסתה $m_1 = 1\,\text{kg}$ נעה בכיוון החיובי של ציר $x$ במהירות שגודלה $v_1 = 10\,\text{m/s}$, ודסקית II שמסתה $m_2 = 1\,\text{kg}$ נחה בראשית של מערכת צירים שנמצאת במישור השולחן. אחרי התנגשות הדסקיות זו בזו, נעה דסקית II בזווית $\alpha = 60^\circ$ עם הציר $x$, במהירות שגודלה $u_2 = 4\,\text{m/s}$, כמתואר בתרשים ב. (תנועת דסקית I אחרי ההתנגשות אינה מתוארת בתרשים ב.)",
  parts=[
    P("א", r"מהו התנע הכולל של מערכת שתי הדסקיות אחרי ההתנגשות (ציין גודל וכיוון)?", num(10, "kg·m/s"), ["principle"], [
        S(r"שימור תנע", r"אין כוחות חיצוניים אופקיים", r"\vec p' = \vec p = 1 \cdot 10\,\hat x"),
    ], r"$10\,\text{kg}\cdot\text{m/s}$ בכיוון ציר $x$", key=r"10 kg·m/s"),
    P("ב", r"הסבר במילים מדוע לא ייתכן ששתי הדסקיות ינועו אחרי ההתנגשות ברביע הרביעי של מערכת הצירים.", OPEN, ["principle"], [
        S(r"רכיב $y$ של התנע", r"לפני ההתנגשות הוא אפס, ולכן גם אחריה", r"p_y' = 0"),
        S(r"ברביע הרביעי", r"שתי הדסקיות היו עם רכיב $y$ שלילי, והסכום לא יכול להיות אפס", r"p_{y1} + p_{y2} < 0"),
    ], r"רכיב $y$ של התנע חייב להישאר אפס"),
    P("ג1", r"חשב את גודל המהירות של דסקית I אחרי ההתנגשות.", num(math.hypot(px, py), "m/s"), ["principle", "algebra"], [
        S(r"רכיב $x$", r"שימור תנע בציר x, המסות שוות", r"10 = u_{1x} + 4\cos 60^\circ \Rightarrow u_{1x} = 8\,\text{m/s}"),
        S(r"רכיב $y$", r"שימור תנע בציר y", r"0 = u_{1y} - 4\sin 60^\circ \Rightarrow u_{1y} \approx 3.46\,\text{m/s}"),
        S(r"גודל", r"פיתגורס", r"u_1 = \sqrt{64 + 12} \approx 8.72\,\text{m/s}"),
    ], r"$\approx 8.72\,\text{m/s}$", key=r"u1=8.72 m/s"),
    P("ג2", r"מה הזווית בין כיוון התנועה של דסקית I אחרי ההתנגשות לבין ציר $x$?", num(math.degrees(math.atan(py / px)), "°"), ["algebra"], [
        S(r"טנגנס", r"y חלקי x", r"\tan\beta = \frac{3.46}{8} \Rightarrow \beta \approx 23.4^\circ"),
    ], r"$\approx 23.4^\circ$ מעל ציר $x$", key=r"β=23.4°"),
  ],
  concepts=["שימור תנע ברכיבים", "התנגשות בשני ממדים"],
  summary=r"שתי דסקיות שמתנגשות על שולחן: התנע הכולל, למה שתיהן לא יכולות לנוע לאותו רביע, והמהירות של הדסקית הראשונה.")
