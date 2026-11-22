"""
Shared drawing helpers for exercise figures (SVG), in the approved sample style.
Colours come from CSS variables defined under `.fig` in src/app/globals.css.

Usage: each topic file (e.g. kinematics.py) defines FIGURES = {exercise_id: fn}, where fn() returns a Fig.
Run:   python3 scripts/figures/build.py            (writes content/bagrut/<topic>/<id>.svg)
"""
import math

def f(x):
    """Compact number for SVG coordinates."""
    s = f"{x:.1f}"
    return s[:-2] if s.endswith(".0") else s

def esc(t):
    return str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

DEFS = """<defs>
<pattern id="f-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="var(--d-hatch)" stroke-width="2"/></pattern>
<marker id="f-dim" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9" fill="none" stroke="var(--d-dim)" stroke-width="1.5"/></marker>
<marker id="f-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--d-label)"/></marker>
<marker id="f-force" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="13" markerHeight="13" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0.5 L12,6 L0,11.5 L3,6 z" fill="var(--d-force, var(--d-label))"/></marker>
<marker id="f-axis" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,1 L9,5 L0,9" fill="none" stroke="var(--d-line)" stroke-width="1.5"/></marker>
</defs>"""


class Fig:
    def __init__(self, w=560, h=300, alt=""):
        self.w, self.h, self.alt, self.items = w, h, alt, []

    def add(self, s):
        self.items.append(s)
        return self

    # ---- primitives -------------------------------------------------
    def line(self, x1, y1, x2, y2, stroke="var(--d-line)", width=2, dash=None, arrow=False, arrow_start=False, cls=None):
        a = f' stroke-dasharray="{dash}"' if dash else ""
        if arrow:
            a += ' marker-end="url(#f-arr)"'
        if arrow_start:
            a += ' marker-start="url(#f-arr)"'
        return self.add(f'<line x1="{f(x1)}" y1="{f(y1)}" x2="{f(x2)}" y2="{f(y2)}" stroke="{stroke}" stroke-width="{width}"{a} stroke-linecap="round"/>')

    def poly(self, pts, fill="var(--d-fill)", stroke="var(--d-line)", width=2, close=True, dash=None):
        p = " ".join(f"{f(x)},{f(y)}" for x, y in pts)
        tag = "polygon" if close else "polyline"
        d = f' stroke-dasharray="{dash}"' if dash else ""
        return self.add(f'<{tag} points="{p}" fill="{fill if close else "none"}" stroke="{stroke}" stroke-width="{width}" stroke-linejoin="round"{d}/>')

    def path(self, d, fill="none", stroke="var(--d-line)", width=2, dash=None, arrow=False):
        a = f' stroke-dasharray="{dash}"' if dash else ""
        if arrow:
            a += ' marker-end="url(#f-arr)"'
        return self.add(f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{width}" stroke-linejoin="round"{a}/>')

    def rect(self, x, y, w, h, fill="var(--d-fill)", stroke="var(--d-line)", width=2, rx=0):
        return self.add(f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>')

    def circle(self, cx, cy, r, fill="var(--d-body)", stroke="none", width=2, dash=None):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        return self.add(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r)}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"{d}/>')

    def dot(self, cx, cy, r=3.5):
        return self.circle(cx, cy, r, fill="var(--d-label)")

    def text(self, x, y, t, cls="label", anchor="middle", rotate=None, color=None):
        tr = f' transform="rotate({rotate} {f(x)} {f(y)})"' if rotate is not None else ""
        st = f' style="fill:{color}"' if color else ""
        return self.add(f'<text class="{cls}" x="{f(x)}" y="{f(y)}" text-anchor="{anchor}"{tr}{st}>{esc(t)}</text>')

    def heb(self, x, y, t, anchor="middle"):
        # direction="rtl" mirrors text-anchor; flip it so "start"/"end" mean left/right edge at x, as in text()
        anchor = {"start": "end", "end": "start"}.get(anchor, anchor)
        return self.add(f'<text class="heb" x="{f(x)}" y="{f(y)}" text-anchor="{anchor}" direction="rtl">{esc(t)}</text>')

    # ---- composites -------------------------------------------------
    def ground(self, x1, x2, y, depth=12):
        self.rect(x1, y, x2 - x1, depth, fill="url(#f-hatch)", stroke="none", width=0)
        return self.line(x1, y, x2, y)

    def wall(self, x, y1, y2, side="left", depth=12):
        self.rect(x - depth if side == "left" else x, y1, depth, y2 - y1, fill="url(#f-hatch)", stroke="none", width=0)
        return self.line(x, y1, x, y2)

    def ceiling(self, x1, x2, y, depth=12):
        self.rect(x1, y - depth, x2 - x1, depth, fill="url(#f-hatch)", stroke="none", width=0)
        return self.line(x1, y, x2, y)

    def dim(self, x1, y1, x2, y2, label, offset=0, side=1, ext=True, label_dx=0, label_dy=0):
        """Dimension line with arrows at both ends. offset shifts it perpendicular to the segment."""
        dx, dy = x2 - x1, y2 - y1
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L * side, dx / L * side
        ax1, ay1, ax2, ay2 = x1 + nx * offset, y1 + ny * offset, x2 + nx * offset, y2 + ny * offset
        if ext and offset:
            self.line(x1, y1, ax1 + nx * 5, ay1 + ny * 5, stroke="var(--d-dim)", width=1, dash="3 3")
            self.line(x2, y2, ax2 + nx * 5, ay2 + ny * 5, stroke="var(--d-dim)", width=1, dash="3 3")
        self.add(f'<line x1="{f(ax1)}" y1="{f(ay1)}" x2="{f(ax2)}" y2="{f(ay2)}" stroke="var(--d-dim)" stroke-width="1.3" marker-start="url(#f-dim)" marker-end="url(#f-dim)"/>')
        mx, my = (ax1 + ax2) / 2 + nx * 14 + label_dx, (ay1 + ay2) / 2 + ny * 14 + 4 + label_dy
        ang = math.degrees(math.atan2(dy, dx))
        if ang > 90 or ang < -90:
            ang += 180
        rot = ang if abs(ang) > 1 else None
        return self.text(mx, my, label, cls="dim", rotate=rot)

    def arrow(self, x1, y1, x2, y2, label=None, lx=None, ly=None, color="var(--d-label)", width=2.4, anchor="middle"):
        self.add(f'<line x1="{f(x1)}" y1="{f(y1)}" x2="{f(x2)}" y2="{f(y2)}" stroke="{color}" stroke-width="{width}" marker-end="url(#f-arr)"/>')
        if label is not None:
            self.text(lx if lx is not None else (x1 + x2) / 2, ly if ly is not None else (y1 + y2) / 2 - 8, label, anchor=anchor)
        return self

    def angle(self, cx, cy, r, a1, a2, label=None, lr=None):
        """Arc from angle a1 to a2 (degrees, math convention, y up)."""
        p1 = (cx + r * math.cos(math.radians(a1)), cy - r * math.sin(math.radians(a1)))
        p2 = (cx + r * math.cos(math.radians(a2)), cy - r * math.sin(math.radians(a2)))
        large = 1 if abs(a2 - a1) > 180 else 0
        sweep = 0 if a2 > a1 else 1
        self.path(f"M {f(p1[0])},{f(p1[1])} A {f(r)} {f(r)} 0 {large} {sweep} {f(p2[0])},{f(p2[1])}", width=1.5)
        if label:
            m = math.radians((a1 + a2) / 2)
            rr = lr or r + 14
            self.text(cx + rr * math.cos(m), cy - rr * math.sin(m) + 5, label)
        return self

    def block(self, cx, cy, w, h, label=None, angle=0, fill="var(--d-body)", text_color="#ffffff"):
        """Block centred at (cx, cy) rotated by angle degrees (math convention)."""
        t = f' transform="rotate({f(-angle)} {f(cx)} {f(cy)})"' if angle else ""
        self.add(f'<rect x="{f(cx - w / 2)}" y="{f(cy - h / 2)}" width="{f(w)}" height="{f(h)}" rx="2" fill="{fill}" stroke="var(--d-line)" stroke-width="1.5"{t}/>')
        if label:
            self.text(cx, cy + 5, label, color=text_color)
        return self

    def ball(self, cx, cy, r=9, label=None, ldx=0, ldy=-16):
        self.circle(cx, cy, r)
        if label:
            self.text(cx + ldx, cy + ldy, label)
        return self

    def spring(self, x1, y1, x2, y2, coils=8, amp=7, lead=10):
        dx, dy = x2 - x1, y2 - y1
        L = math.hypot(dx, dy)
        ux, uy = dx / L, dy / L
        nx, ny = -uy, ux
        pts = [(x1, y1), (x1 + ux * lead, y1 + uy * lead)]
        n = coils * 2
        for i in range(1, n):
            s = lead + (L - 2 * lead) * i / n
            sg = amp if i % 2 else -amp
            pts.append((x1 + ux * s + nx * sg, y1 + uy * s + ny * sg))
        pts += [(x2 - ux * lead, y2 - uy * lead), (x2, y2)]
        return self.poly(pts, close=False, width=1.8)

    def pulley(self, cx, cy, r=14):
        self.circle(cx, cy, r, fill="var(--d-fill)", stroke="var(--d-line)", width=2)
        return self.circle(cx, cy, 2.5, fill="var(--d-line)")

    def person(self, x, y_feet, s=1.0):
        g = lambda v: f(v)
        h = 44 * s
        self.add(
            f'<g stroke="var(--d-line)" stroke-width="2.4" fill="none" stroke-linecap="round">'
            f'<circle cx="{g(x)}" cy="{g(y_feet - h)}" r="{g(8 * s)}"/>'
            f'<line x1="{g(x)}" y1="{g(y_feet - h + 8 * s)}" x2="{g(x)}" y2="{g(y_feet - 16 * s)}"/>'
            f'<line x1="{g(x)}" y1="{g(y_feet - 16 * s)}" x2="{g(x - 9 * s)}" y2="{g(y_feet)}"/>'
            f'<line x1="{g(x)}" y1="{g(y_feet - 16 * s)}" x2="{g(x + 9 * s)}" y2="{g(y_feet)}"/>'
            f'<line x1="{g(x - 12 * s)}" y1="{g(y_feet - 28 * s)}" x2="{g(x + 12 * s)}" y2="{g(y_feet - 28 * s)}"/></g>'
        )
        return self

    def motorcycle(self, x, y_ground, w=64, rider=True, flip=False):
        """Motorcycle facing right (left if flip), with an optional rider."""
        d = -1 if flip else 1
        X = lambda u: x + d * u * w / 64
        r = 9 * w / 64; yw = y_ground - r
        self.add(f'<g stroke="var(--d-line)" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">'
                 f'<path d="M {f(X(-24))},{f(yw)} L {f(X(-8))},{f(yw - 14)} L {f(X(12))},{f(yw - 14)} L {f(X(24))},{f(yw)}"/>'
                 f'<path d="M {f(X(18))},{f(yw - 10)} L {f(X(14))},{f(yw - 24)} L {f(X(20))},{f(yw - 26)}"/></g>')
        self.add(f'<path d="M {f(X(-16))},{f(yw - 14)} Q {f(X(-4))},{f(yw - 26)} {f(X(12))},{f(yw - 18)} L {f(X(12))},{f(yw - 12)} L {f(X(-16))},{f(yw - 12)} Z" fill="var(--d-body)" stroke="var(--d-line)" stroke-width="1.5"/>')
        for u in (-24, 24):
            self.circle(X(u), yw, r, fill="none", stroke="var(--d-label)", width=3)
            self.circle(X(u), yw, 2.2, fill="var(--d-label)")
        if rider:
            self.add(f'<g stroke="var(--d-line)" stroke-width="2.4" fill="none" stroke-linecap="round">'
                     f'<circle cx="{f(X(0))}" cy="{f(yw - 50)}" r="{f(6.5 * w / 64)}" fill="var(--d-fill)"/>'
                     f'<path d="M {f(X(-2))},{f(yw - 43)} L {f(X(-8))},{f(yw - 22)} L {f(X(4))},{f(yw - 12)}"/>'
                     f'<path d="M {f(X(-4))},{f(yw - 36)} L {f(X(16))},{f(yw - 26)}"/></g>')
        return self

    def car(self, x, y_ground, w=70, label=None, flip=False):
        h = 22
        self.add(f'<rect x="{f(x - w/2)}" y="{f(y_ground - 8 - h)}" width="{f(w)}" height="{f(h)}" rx="6" fill="var(--d-body)" stroke="var(--d-line)" stroke-width="1.5"/>')
        cab = (x - w * 0.05, x + w * 0.3) if not flip else (x - w * 0.3, x + w * 0.05)
        self.add(f'<rect x="{f(cab[0])}" y="{f(y_ground - 8 - h - 14)}" width="{f(cab[1]-cab[0])}" height="16" rx="4" fill="var(--d-body)" stroke="var(--d-line)" stroke-width="1.5"/>')
        for wx in (x - w * 0.3, x + w * 0.3):
            self.circle(wx, y_ground - 8, 8, fill="var(--d-label)")
        if label:
            self.text(x, y_ground - 8 - h - 22, label)
        return self

    def graph(self, ox, oy, w, h, xlabel, ylabel, xticks=(), yticks=(), xmax=1, ymin=0, ymax=1, grid=True, xmin=0):
        """Axes with origin at value (xmin, 0) placed at pixel (ox, y(0)). Returns mapping functions X(v), Y(v)."""
        X = lambda v: ox + (v - xmin) / (xmax - xmin) * w
        Y = lambda v: oy - (v - ymin) / (ymax - ymin) * h
        y0 = Y(0) if ymin <= 0 <= ymax else oy
        if grid:
            for v, _ in xticks:
                self.line(X(v), Y(ymin), X(v), Y(ymax), stroke="var(--d-hatch)", width=1)
            for v, _ in yticks:
                self.line(X(xmin), Y(v), X(xmax), Y(v), stroke="var(--d-hatch)", width=1)
        self.add(f'<line x1="{f(ox)}" y1="{f(y0)}" x2="{f(ox + w + 18)}" y2="{f(y0)}" stroke="var(--d-line)" stroke-width="1.8" marker-end="url(#f-axis)"/>')
        self.add(f'<line x1="{f(ox)}" y1="{f(Y(ymin) + (6 if ymin < 0 else 0))}" x2="{f(ox)}" y2="{f(oy - h - 18)}" stroke="var(--d-line)" stroke-width="1.8" marker-end="url(#f-axis)"/>')
        for v, t in xticks:
            self.line(X(v), y0 - 4, X(v), y0 + 4, stroke="var(--d-line)", width=1.5)
            self.text(X(v), y0 + 18, t, cls="dim")
        for v, t in yticks:
            self.line(ox - 4, Y(v), ox + 4, Y(v), stroke="var(--d-line)", width=1.5)
            self.text(ox - 8, Y(v) + 4, t, cls="dim", anchor="end")
        self.text(ox + w + 16, y0 - 10, xlabel, anchor="end")
        self.text(ox + 10, oy - h - 6, ylabel, anchor="start")
        return X, Y

    def plot(self, X, Y, pts, width=2.6, dash=None, stroke="var(--d-body)"):
        return self.poly([(X(a), Y(b)) for a, b in pts], close=False, width=width, stroke=stroke, dash=dash)

    def curve(self, X, Y, fn, a, b, n=60, width=2.6, stroke="var(--d-body)", dash=None):
        pts = [(a + (b - a) * i / n, fn(a + (b - a) * i / n)) for i in range(n + 1)]
        return self.plot(X, Y, pts, width=width, stroke=stroke, dash=dash)

    def guide(self, X, Y, xv, yv):
        """Dashed guide from a point to both axes."""
        self.line(X(xv), Y(yv), X(xv), Y(0), stroke="var(--d-dim)", width=1, dash="4 3")
        return self.line(X(xv), Y(yv), X(0), Y(yv), stroke="var(--d-dim)", width=1, dash="4 3")

    def svg(self):
        alt = esc(self.alt).replace('"', "&quot;")
        body = "\n".join(self.items)
        # Figures are shown at the column's full width, so a narrow or tall drawing would come out huge.
        # Pad the view box at the sides so it is at least 480 wide and about 1.3 times as wide as it is tall.
        W = max(self.w, 480, min(1.3 * self.h, 720)); x0 = -(W - self.w) / 2
        return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{f(x0)} 0 {f(W)} {self.h}" role="img" aria-label="{alt}">\n{DEFS}\n{body}\n</svg>\n'


def mini(g, ox, oy, w, h, fn=None, label="", xl="t", yl="v", neg=False, pts=None, segs=None, n=40):
    """Small option graph. Origin at (ox, oy); unit box w x h (values in [0,1] on x, [-1,1] or [0,1] on y)."""
    y0 = oy
    g.line(ox, y0, ox + w + 10, y0, width=1.4)
    g.line(ox, y0 + (h * 0.75 if neg else 0), ox, y0 - h - 10, width=1.4)
    g.text(ox + w + 12, y0 + 14, xl, cls="dim", anchor="end")
    g.text(ox - 6, y0 - h - 6, yl, cls="dim", anchor="end")
    P_ = lambda a, b: (ox + a * w, y0 - b * h)
    if fn is not None:
        g.path("M " + " L ".join("%.1f,%.1f" % P_(i / n, fn(i / n)) for i in range(n + 1)), stroke="var(--d-body)", width=2.2)
    if pts is not None:
        g.poly([P_(a, b) for a, b in pts], close=False, stroke="var(--d-body)", width=2.2)
    for sg in segs or []:
        if callable(sg[0]):
            f_, a0, a1 = sg
            g.path("M " + " L ".join("%.1f,%.1f" % P_(a0 + (a1 - a0) * i / n, f_(a0 + (a1 - a0) * i / n)) for i in range(n + 1)), stroke="var(--d-body)", width=2.2)
        else:
            g.poly([P_(a, b) for a, b in sg], close=False, stroke="var(--d-body)", width=2.2)
    if label:
        g.text(ox + w / 2, y0 + (h * 0.75 if neg else 0) + 22, label, cls="label")
    return P_


def fbd(forces, alt, positive=None, body="block", tilt=0, surface=None, w=420, h=300, body_label=None, note=None):
    """
    A force diagram (תרשים כוחות) for the solution, in one consistent, sharp style.
      forces:   [(label, angle_deg, size)]  angle in math convention (0 = right, 90 = up), size 0.4..1.6 (relative length)
      positive: angle of the chosen positive direction (drawn as a dashed arrow marked "+"), or None
      body:     "block" or "ball";  tilt: rotation of the block and of the surface line (degrees, e.g. an incline)
      surface:  None, "below" (a surface under the body, along the tilt) or "wall-left"/"wall-right"
    """
    g = Fig(w, h, alt)
    cx, cy = w / 2, h / 2
    t = math.radians(tilt)
    if surface == "below":
        dx, dy = math.cos(t), -math.sin(t)            # along the surface (screen coordinates)
        sx, sy = cx + 22 * math.sin(t), cy + 22 * math.cos(t)  # the contact point under the body
        g.line(sx - 150 * dx, sy - 150 * dy, sx + 150 * dx, sy + 150 * dy, width=2.4)
        for k in range(-7, 8):                        # hatching on the far side of the surface
            px, py = sx + k * 20 * dx, sy + k * 20 * dy
            g.line(px, py, px + 9 * math.sin(t) - 7 * dx, py + 9 * math.cos(t) - 7 * dy, stroke="var(--d-hatch)", width=1.4)
    elif surface in ("wall-left", "wall-right"):
        x = cx - 30 if surface == "wall-left" else cx + 30
        g.line(x, cy - 90, x, cy + 90, width=2.4)
    if body == "ball":
        g.circle(cx, cy, 16, fill="var(--d-body)")
    else:  # the block sits on the surface, rotated with it (drawn as a polygon so the tilt is exact)
        hw, hh = 28, 19
        ux, uy = math.cos(t), -math.sin(t)
        vx, vy = math.sin(t), math.cos(t)
        pts = [(cx + sx_ * hw * ux + sy_ * hh * vx, cy + sx_ * hw * uy + sy_ * hh * vy) for sx_, sy_ in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
        g.poly(pts, fill="var(--d-body)", stroke="var(--d-line)", width=1.5)
        if body_label:
            g.text(cx, cy + 5, body_label, color="#ffffff")
    for label, ang, size in forces:
        a = math.radians(ang)
        L = 46 + 50 * size
        x2, y2 = cx + L * math.cos(a), cy - L * math.sin(a)
        g.add(f'<line x1="{f(cx)}" y1="{f(cy)}" x2="{f(x2)}" y2="{f(y2)}" stroke="var(--d-force, var(--d-label))" stroke-width="3" stroke-linecap="round" marker-end="url(#f-force)"/>')
        lx, ly = cx + (L + 18) * math.cos(a), cy - (L + 18) * math.sin(a) + 6
        g.text(lx, ly, label, cls="force", anchor="middle")
    g.circle(cx, cy, 3.2, fill="var(--d-label)")
    if positive is not None:
        a = math.radians(positive)
        mx, my = 66, h - 58  # arrow centred here, so it never runs into the caption below
        ox, oy = mx - 20 * math.cos(a), my + 20 * math.sin(a)
        x2, y2 = mx + 20 * math.cos(a), my - 20 * math.sin(a)
        g.line(ox, oy, x2, y2, stroke="var(--d-dim)", width=1.8, dash="5 4", arrow=True)
        if abs(math.cos(a)) < 0.3:  # vertical: "+" beside the tip
            g.text(x2 + 12, y2 + 6, "+", cls="label")
        else:
            g.text(x2 + 12 * math.cos(a), y2 - 12 * math.sin(a) - 6, "+", cls="label", anchor="middle")
        g.heb(mx + 2, h - 12, "כיוון חיובי", anchor="middle")
    if note:  # bottom-right corner, away from the arrows
        g.heb(w - 12, h - 10, note, anchor="end")
    return g
