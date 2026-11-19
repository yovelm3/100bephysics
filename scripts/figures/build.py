"""Writes every figure defined in scripts/figures/<topic>.py to content/bagrut/<topic>/<id>.svg."""
import importlib, os, sys
here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, here)
root = os.path.join(here, "..", "..", "content", "bagrut")
TOPICS = ["kinematics", "dynamics", "circular", "momentum", "energy", "gravitation", "harmonic"]
only = sys.argv[1:]
n = 0
for t in TOPICS:
    if only and t not in only:
        continue
    if not os.path.exists(os.path.join(here, f"{t}.py")):
        continue
    mod = importlib.import_module(t)
    os.makedirs(os.path.join(root, t), exist_ok=True)
    for ex_id, fn in mod.FIGURES.items():
        svg = fn().svg()
        with open(os.path.join(root, t, f"{ex_id}.svg"), "w") as fh:
            fh.write(svg)
        n += 1
print(f"wrote {n} figure(s)")
