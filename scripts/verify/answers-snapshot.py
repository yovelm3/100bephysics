"""Rewrite guard: saves every answer value (snapshot), and later compares the current content with it.
   python3 scripts/verify/answers-snapshot.py save            -> scripts/verify/answers-before-rewrite.json
   python3 scripts/verify/answers-snapshot.py check [topic]   -> every number in the snapshot must still exist in the same exercise"""
import json, glob, os, sys
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
SNAP = os.path.join(ROOT, "scripts", "verify", "answers-before-rewrite.json")

def collect(topic=None):
    out = {}
    for f in sorted(glob.glob(os.path.join(ROOT, "content/bagrut/*/*.json"))):
        if topic and f.split(os.sep)[-2] != topic:
            continue
        e = json.load(open(f))
        vals = []
        for p in e["parts"]:
            a = p["answer"]
            if a["type"] == "number": vals.append(a["value"])
            elif a["type"] == "multi": vals += [i["value"] for i in a["items"]]
            elif a["type"] == "choice": vals.append(("choice", a["choices"][a["correct"]]))
        out[e["id"]] = {"label": e["source"]["label"], "topic": f.split(os.sep)[-2], "values": vals, "stem_numbers": sorted(set(__import__("re").findall(r"\d+(?:\.\d+)?", e["stem"])))}
    return out

if sys.argv[1] == "save":
    json.dump(collect(), open(SNAP, "w"), ensure_ascii=False, indent=1); print("saved", SNAP)
else:
    topic = sys.argv[2] if len(sys.argv) > 2 else None
    before = json.load(open(SNAP)); now = collect(topic); bad = 0
    for k, n in now.items():
        b = before.get(k)
        if not b: print("new:", n["label"]); continue
        nums_now = [v for v in n["values"] if not isinstance(v, list)]
        for v in b["values"]:
            if isinstance(v, list):  # choice answers may be re-worded; checked by hand
                continue
            if not any(abs(v - w) <= 1e-6 * max(1, abs(v)) for w in nums_now):
                bad += 1; print(f"✗ {n['label']}: the answer {v:.6g} is gone")
        lost = set(b["stem_numbers"]) - set(n["stem_numbers"])
        if lost: bad += 1; print(f"✗ {n['label']}: numbers missing from the reworded stem: {sorted(lost)}")
    print(f"{len(now)} exercises checked · {bad} problems")
