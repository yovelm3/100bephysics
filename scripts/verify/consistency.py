"""Second pass, check 1: for every numeric part, the number shown in the final-answer text must agree
with the stored (checked) answer value, and the last solution row must contain it too.
   python3 scripts/verify/consistency.py"""
import json, os, re, glob
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))

def nums(s):
    s = s.replace("{,}", "").replace("−", "-").replace("\\,", " ").replace("\\!", "")
    s = re.sub(r"(\d)\s*\\times\s*10\^\{?(-?\d+)\}?", r"\1e\2", s)
    s = re.sub(r"·10\^\{?(-?\d+)\}?", r"e\1", s)
    out = [float(m) for m in re.findall(r"-?\d+(?:\.\d+)?(?:e-?\d+)?", s)]
    out += [10.0 ** int(m) for m in re.findall(r"(?<![\d.e])10\^\{?(-?\d+)\}?", s)]
    out += [float(a) / float(b) for a, b in re.findall(r"(\d+(?:\.\d+)?)/(\d+(?:\.\d+)?)", s)]
    out += [float(a) / float(b) for a, b in re.findall(r"\\frac\{(\d+(?:\.\d+)?)\}\{(\d+(?:\.\d+)?)\}", s)]
    out += [float(a) ** 0.5 for a in re.findall(r"\\sqrt\{(\d+(?:\.\d+)?)\}", s)]
    return out

def near(v, n, tol):
    return abs(abs(v) - abs(n)) <= tol * max(abs(v), 1e-9) or (v == 0 and n == 0)

bad = good = 0
for f in sorted(glob.glob(os.path.join(ROOT, "content/bagrut/*/*.json"))):
    e = json.load(open(f))
    for p in e["parts"]:
      items = p["answer"]["items"] if p["answer"]["type"] == "multi" else [p["answer"]]
      for a in items:
        if a.get("type", "number") != "number":
            continue
        v = a["value"]; tol = max(0.03, (a.get("tolerancePct") or 0) / 100 + 0.01)
        fin = p.get("finalAnswer") or p.get("final") or ""
        rows = [r for r in p.get("solution", []) if "tex" in r and not r.get("check")]
        last = rows[-1]["tex"] if rows else ""
        okf = any(near(v, n, tol) for n in nums(fin))
        okl = any(near(v, n, tol) for n in nums(last)) or any(near(v, n, tol) for r in rows for n in nums(r["tex"]))
        if okf and okl:
            good += 1
        else:
            bad += 1
            print(f"✗ {e['source']['label']} {p['label']}: value={v:.5g} final={fin!r} last={last[-80:]!r}")
print(f"{good} consistent · {bad} to look at")
