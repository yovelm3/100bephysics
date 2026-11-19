"""Compares every numeric answer with the number printed in the source answer key (keyAnswer).
   python3 scripts/authoring/compare_key.py [topic]
Prints mismatches (>2.5% apart, after allowing sign and the key's rounding) and parts with no key value."""
import json, os, re, sys
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
base = os.path.join(ROOT, "content", "bagrut")

def key_numbers(k):
    k = k.replace("−", "-").replace("×", "x").replace(",", "")
    out = []
    for m in re.finditer(r"(-?\d+(?:\.\d+)?)(?:\s*x\s*10\^?(-?\d+))?", k):
        v = float(m.group(1)) * (10 ** int(m.group(2)) if m.group(2) else 1)
        out.append(v)
    return out

bad = nokey = ok = 0
for t in sorted(os.listdir(base)):
    if len(sys.argv) > 1 and t not in sys.argv[1:]:
        continue
    for f in sorted(os.listdir(os.path.join(base, t))):
        if not f.endswith(".json"):
            continue
        e = json.load(open(os.path.join(base, t, f)))
        for p in e["parts"]:
            a = p["answer"]
            if a["type"] != "number":
                continue
            k = p.get("keyAnswer")
            if not k:
                nokey += 1
                continue
            v = a["value"]
            nums = key_numbers(k)
            facs = [1] + ([1000] if re.search(r"\bkm\b", k) else []) + ([0.01] if re.search(r"\bcm\b", k) else []) + ([3600, 86400] if re.search(r"hr|hour|שעות|day|יממה", k) else [])
            hit = any((abs(abs(v) - abs(n * fc)) <= 0.025 * max(abs(v), 1e-12)) or (v == 0 and n == 0) for n in nums for fc in facs)
            if hit:
                ok += 1
            else:
                bad += 1
                print(f"✗ {e['source']['label']} {p['label']}: ours={v:.6g} {a['unit']}  key='{k}'")
print(f"{ok} match · {bad} mismatch · {nokey} numeric parts without a key value")
