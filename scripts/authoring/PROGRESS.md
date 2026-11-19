# Mechanics import – progress (for Claude, survives context resets)

- Source PDFs: /root/.claude/uploads/1ef12d14-56cf-53e9-ae87-f9fc8c92ae73/*.pdf (questions pp. 1–18ish; shared answer key "תשובות סופיות" at the end, transcribed in _key/key.md)
- Page images: scratchpad/pg/<kin|dyn|...>-NN.png (75 dpi). Preview figures: `node scratchpad/preview.js <topic> [regex]`
- Write one file per question: scripts/authoring/<topic>/<letter><NN>_<id>.py, then `python3 scripts/authoring/run.py <topic>`
  and `python3 scripts/authoring/compare_key.py <topic>`
- Upload to the site: admin panel button "טעינת התרגילים מהמאגר" (after push + deploy). Script: scratchpad/imp.js
  (temporary admin user e2e-admin@100bephysics.test exists in Supabase — DELETE at the end: e2e/delete-test-users.sql)
- Rules: no Hebrew inside tex; every "why" filled; split multi-answer parts (ב1, ב2...); g = 10; drafts only.

## Status
- kinematics: DONE 37/37 (imported to site). Known key mismatches: 1995 Q1 (key used x/t), 1999 Q1 ב3 (key typo 0.96).
- dynamics: DONE 39/39 (imported)
- circular: in progress (c01–c24 = PDF pages 1–10; questions end at p12, key from p13)
- momentum, energy, gravitation, harmonic: not started
- Then: second independent pass (recompute every numeric answer in a separate script; check figures), re-import, summary for owner.
