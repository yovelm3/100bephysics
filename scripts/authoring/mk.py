"""
Authoring helpers for bagrut exercises. Each question lives in scripts/authoring/<topic>/<id>.py
(raw strings, so LaTeX needs no double escaping) and writes content/bagrut/<topic>/<id>.json (+ .svg).

  python3 scripts/authoring/run.py [topic ...]   -> regenerate every JSON/SVG

Conventions (owner decisions, see CLAUDE.md):
  - status "draft", needsReview true: the owner approves before publishing
  - solution rows: X(explain) or S(what, why, tex) / C(...) for a check row. "why" is always filled
  - keyAnswer: the final answer as printed in the source answer key (None if the key has none)
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "figures"))
from lib import Fig  # noqa: E402,F401

SKILLS = {"understanding", "principle", "fbd", "signs", "algebra", "units", "graph"}
REGISTRY = []
CURRENT_POS = 0


def X(text):
    return {"explain": text}


HEB = re.compile("[\u0590-\u05ff]")


# Files rewritten under the owner's rules of 2026-11-22 set STRICT = True: "why" holds Hebrew words only,
# every formula goes to the calculation column (owner's decision on reading direction).
STRICT = {"on": False}


def S(what, why, tex, eq=None):
    """A solution row. `eq`: the formula-sheet equation used in this step, shown small under "what"."""
    assert why.strip(), f"empty why: {what}"
    assert not HEB.search(tex), f"Hebrew inside a formula (KaTeX cannot lay it out): {tex}"
    if STRICT["on"]:
        assert "$" not in why, f"'why' must be Hebrew words only (move the formula to the calculation): {why}"
    row = {"what": what, "why": why, "tex": tex}
    if eq:
        assert not HEB.search(eq), f"Hebrew inside an equation: {eq}"
        row["eq"] = eq
    return row


def multi(*items):
    """A part that asks for several numbers: multi(("label", value, "unit"), ("label", value, "unit", tolPct), ...)."""
    out = []
    for it in items:
        label, value, unit = it[:3]
        d = {"label": label, "value": float(value), "unit": unit}
        if len(it) > 3 and it[3]:
            d["tolerancePct"] = it[3]
        out.append(d)
    return {"type": "multi", "items": out}


def D(caption, fig):
    """A drawn answer (table / graph / diagram) for a part that asks to draw one. `fig` is a Fig or a function returning one."""
    g = fig() if callable(fig) else fig
    return {"draw": g.svg(), "caption": caption}


def table(cols, rows, alt="", colw=110, rowh=30):
    """A simple drawn table: cols = header strings, rows = lists of cell strings (left to right as in a physics table)."""
    W = colw * len(cols); H = rowh * (len(rows) + 1)
    g = Fig(W + 2, H + 2, alt or "טבלה")
    g.rect(1, 1, W, H, fill="none", width=1.3)
    g.rect(1, 1, W, rowh, fill="var(--d-fill)", stroke="none", width=0)
    for r in range(1, len(rows) + 1): g.line(1, 1 + r * rowh, 1 + W, 1 + r * rowh, width=0.9 if r > 1 else 1.3)
    for c in range(1, len(cols)): g.line(1 + c * colw, 1, 1 + c * colw, 1 + H, width=0.9)
    for c, h in enumerate(cols): g.text(1 + c * colw + colw / 2, 1 + rowh / 2 + 5, h)
    for r, row in enumerate(rows):
        for c, v in enumerate(row): g.text(1 + c * colw + colw / 2, 1 + (r + 1.5) * rowh + 5, v, cls="dim")
    return g


def TBL(caption, head, rows):
    """A table answer, shown as a real table in the solution. Cells may contain $formulas$."""
    return {"caption": caption, "head": list(head), "rows": [[str(c) for c in r] for r in rows]}


def C(what, why, tex, eq=None):
    row = S(what, why, tex, eq)
    row["check"] = True
    return row


def num(value, unit, tol=None):
    a = {"type": "number", "value": float(value), "unit": unit}
    if tol is not None:
        a["tolerancePct"] = tol
    return a


def choice(choices, correct):
    return {"type": "choice", "choices": choices, "correct": correct}


OPEN = {"type": "open"}


def P(label, question, answer, skills, sol, final, key=None):
    for s in skills:
        assert s in SKILLS, s
    assert sol and any("what" in r for r in sol) or answer["type"] != "number", f"part {label}: needs solution rows"
    return {"label": label, "question": question, "answer": answer, "skills": skills, "solution": sol, "finalAnswer": final, "keyAnswer": key}


def _clean(v):
    """Raw strings keep a backslash before quotes (r"\"..\""). Remove it: LaTeX never needs it."""
    if isinstance(v, str):
        return v.replace('\\"', '"')
    if isinstance(v, list):
        return [_clean(x) for x in v]
    if isinstance(v, dict):
        return {k: _clean(x) for k, x in v.items()}
    return v


def E(id, year, label, topic, sub, diff, stem, parts, concepts, summary, note=None, fig=None, alt="", review="", position=None):
    ex = {
        "id": id,
        "pool": "bagrut",
        "openToHighschool": False,
        "source": {"year": year, "label": label},
        "topic": topic,
        "subtopic": sub,
        "group": None,
        "difficulty": diff,
        "status": "draft",
        "needsReview": True,
        "reviewNotes": ("טיוטה: נוסח, פתרון וציור של Claude, ממתין לאישור הבעלים. " + review).strip(),
        "stem": stem,
        "figure": None,
        "authorNote": note,
        "concepts": concepts,
        "summary": summary,
        "position": position if position is not None else CURRENT_POS,
        "parts": parts,
    }
    out_dir = os.path.join(ROOT, "content", "bagrut", topic)
    os.makedirs(out_dir, exist_ok=True)
    if fig is not None:
        f = fig()
        f.alt = alt or f.alt
        with open(os.path.join(out_dir, f"{id}.svg"), "w") as fh:
            fh.write(f.svg())
        ex["figure"] = {"type": "svg", "file": f"{id}.svg", "alt": f.alt, "provisional": False}
    ex = _clean(ex)
    with open(os.path.join(out_dir, f"{id}.json"), "w") as fh:
        json.dump(ex, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    REGISTRY.append(ex)
    return ex
