# Hand-written earlier (with its verified animation). Here only the position and the answer-key values are kept in sync.
import json, os
import mk
p = os.path.join(mk.ROOT, "content", "bagrut", "kinematics", "bagrut-1987-q1.json")
ex = json.load(open(p))
ex["position"] = mk.CURRENT_POS
for part, key in zip(ex["parts"], ["25 m/s", "≈5.2 m/s^2", "30 m"]):
    part["keyAnswer"] = key
with open(p, "w") as fh:
    json.dump(ex, fh, ensure_ascii=False, indent=2)
    fh.write("\n")
mk.REGISTRY.append(ex)
