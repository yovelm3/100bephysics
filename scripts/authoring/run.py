"""Regenerates content/bagrut/<topic>/*.json (+ .svg) from scripts/authoring/<topic>/*.py, in file order (= position)."""
import os, runpy, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import mk  # noqa: E402

topics = sys.argv[1:] or sorted(d for d in os.listdir(HERE) if os.path.isdir(os.path.join(HERE, d)) and not d.startswith("_"))
total = 0
for t in topics:
    d = os.path.join(HERE, t)
    files = sorted(f for f in os.listdir(d) if f.endswith(".py"))
    for i, f in enumerate(files):
        mk.REGISTRY.clear()
        mk.STRICT["on"] = False  # each file opts in to the strict rules
        mk.CURRENT_POS = int(f.split("_")[0][1:]) if f[1:3].isdigit() else i + 1
        g = runpy.run_path(os.path.join(d, f), init_globals={})
        total += len(mk.REGISTRY)
print(f"generated {total} exercise(s)")
