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


def S(what, why, tex):
    assert why.strip(), f"empty why: {what}"
    assert not HEB.search(tex), f"Hebrew inside a formula (KaTeX cannot lay it out): {tex}"
    return {"what": what, "why": why, "tex": tex}


def C(what, why, tex):
    assert not HEB.search(tex), f"Hebrew inside a formula: {tex}"
    return {"what": what, "why": why, "tex": tex, "check": True}


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
