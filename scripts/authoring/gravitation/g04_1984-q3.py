from mk import *
from lib import fbd
STRICT["on"] = True

E(id="bagrut-1984-q3", year=1984, label="1984 שאלה 3", topic="gravitation", sub="grav-law", diff=4,
  stem=r"לשני כוכבים, $A$ ו-$B$, יש רדיוסים $R_A$ ו-$R_B$ וצפיפויות $\rho_A$ ו-$\rho_B$. הכוכבים אחידים, כלומר הצפיפות של כל אחד קבועה בכל מקום בו. כתבו את התשובות בעזרת ארבעת הגדלים האלה בלבד.",
  parts=[
    P("א", r"מה היחס $g_A/g_B$ בין תאוצות הנפילה החופשית על פני שני הכוכבים?", choice([r"$\frac{\rho_A R_A}{\rho_B R_B}$", r"$\frac{\rho_A R_A^2}{\rho_B R_B^2}$", r"$\frac{\rho_A R_B}{\rho_B R_A}$", r"$\frac{R_A}{R_B}$"], 0), ["principle", "algebra"], [
        S(r"מסת הכוכב", r"המסה היא הצפיפות כפול הנפח של כדור", r"M = \rho \cdot \tfrac{4}{3}\pi R^3"),
        S(r"תאוצת הנפילה על פני הכוכב", r"מציבים את המסה, ומצמצמים רדיוס בריבוע", r"g = \frac{GM}{R^2} = \tfrac{4}{3}\pi G\rho R", eq=r"g^* = \frac{GM}{r^2}"),
        S(r"היחס", r"מחלקים, והקבועים מצטמצמים", r"\frac{g_A}{g_B} = \frac{\rho_A R_A}{\rho_B R_B}"),
    ], r"$\frac{\rho_A R_A}{\rho_B R_B}$", key=r"ρA·RA/(ρB·RB)"),
    P("ב", r"קרוב לפני כל כוכב נע לוויין במסלול מעגלי. מה היחס $T_A/T_B$ בין זמני המחזור של שני הלוויינים?", choice([r"$\sqrt{\frac{\rho_B}{\rho_A}}$", r"$\sqrt{\frac{\rho_A}{\rho_B}}$", r"$\frac{R_A}{R_B}\sqrt{\frac{\rho_B}{\rho_A}}$", r"$\frac{\rho_B}{\rho_A}$"], 0), ["principle", "algebra"], [
        S(r"זמן מחזור ליד פני הכוכב", r"רדיוס המסלול בערך כמו רדיוס הכוכב. מבודדים את זמן המחזור ומציבים את המסה", r"T = 2\pi\sqrt{\frac{R^3}{GM}} = 2\pi\sqrt{\frac{R^3}{G\rho\,\tfrac{4}{3}\pi R^3}} = \sqrt{\frac{3\pi}{G\rho}}", eq=r"\frac{r^3}{T^2} = \frac{GM}{4\pi^2}"),
        S(r"היחס", r"הרדיוס מצטמצם, ונשארת רק הצפיפות", r"\frac{T_A}{T_B} = \sqrt{\frac{\rho_B}{\rho_A}}"),
    ], r"$\frac{T_A}{T_B} = \sqrt{\frac{\rho_B}{\rho_A}}$", key=r"√(ρA/ρB)"),
    P("ג", r"למה שווה היחס בין האנרגיות הכוללות (קינטית ועוד פוטנציאלית) של שני הלוויינים, אם המסות שלהם שוות? האנרגיה הפוטנציאלית אפס באינסוף.", choice([r"$\frac{\rho_A R_A^2}{\rho_B R_B^2}$", r"$\frac{\rho_A R_A}{\rho_B R_B}$", r"$\frac{\rho_A R_A^3}{\rho_B R_B^3}$", r"$\frac{\rho_B R_B^2}{\rho_A R_A^2}$"], 0), ["principle", "algebra"], [
        S(r"האנרגיה הכוללת", r"לוויין במסלול מעגלי. מציבים את המסה של הכוכב", r"E = -\frac{GMm}{2R} = -\frac{G m}{2R} \cdot \rho\,\tfrac{4}{3}\pi R^3 \;\propto\; \rho R^2", eq=r"U = -\frac{GMm}{r}"),
        S(r"היחס", r"מחלקים. האנרגיות שתיהן שליליות, והיחס חיובי", r"\frac{E_A}{E_B} = \frac{\rho_A R_A^2}{\rho_B R_B^2}"),
    ], r"$\frac{\rho_A R_A^2}{\rho_B R_B^2}$", key=r"ρA·RA²/(ρB·RB²)"),
    P("ד", r"מכל כוכב משגרים טיל אל מחוץ לתחום המשיכה שלו. מה היחס בין המהירויות ההתחלתיות המזעריות של הטילים? לכוכבים אין אטמוספרה.", choice([r"$\frac{R_A}{R_B}\sqrt{\frac{\rho_A}{\rho_B}}$", r"$\sqrt{\frac{\rho_A}{\rho_B}}$", r"$\frac{R_A}{R_B}$", r"$\frac{R_B}{R_A}\sqrt{\frac{\rho_A}{\rho_B}}$"], 0), ["principle", "algebra"], [
        S(r"מהירות מילוט", r"במהירות המזערית הטיל מגיע לאינסוף בלי מהירות, ולכן האנרגיה הכוללת שלו אפס", r"\tfrac{1}{2}mv^2 - \frac{GMm}{R} = 0 \;\Rightarrow\; v = \sqrt{\frac{2GM}{R}}", eq=r"U = -\frac{GMm}{r}"),
        S(r"מציבים את המסה", r"המסה פרופורציונית לצפיפות כפול הרדיוס בחזקה שלישית", r"v \propto \sqrt{\frac{\rho R^3}{R}} = R\sqrt{\rho}"),
        S(r"היחס", r"מחלקים", r"\frac{v_A}{v_B} = \frac{R_A}{R_B}\sqrt{\frac{\rho_A}{\rho_B}}"),
    ], r"$\frac{R_A}{R_B}\sqrt{\frac{\rho_A}{\rho_B}}$", key=r"(RA/RB)√(ρA/ρB)"),
  ],
  concepts=["חוק הכבידה", "צפיפות ומסה", "זמן מחזור של לוויין נמוך", "אנרגיה של לוויין", "מהירות מילוט"],
  summary=r"השוואה בין שני כוכבים לפי רדיוס וצפיפות: תאוצת הנפילה, זמן המחזור, האנרגיה ומהירות המילוט.",
  review='צריך החלטה שלך, בסעיף ב (היחס בין זמני המחזור).\nבדף התשובות: שורש של צפיפות A חלקי צפיפות B. זה היחס בין זמן המחזור של B לזה של A.\nאצלי: השאלה היא על זמן המחזור של A חלקי זה של B, ולכן התשובה הפוכה: שורש של צפיפות B חלקי צפיפות A.\nמה לבדוק: באיזה סדר לשאול. אם כמו בדף התשובות, כתוב לי ואהפוך את השאלה.')
