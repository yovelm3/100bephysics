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
- circular: DONE 26/26 (not yet imported)
- momentum: DONE 28/28. Known mismatches: 1992 Q2 ג1 (key 39.6, calc 36.9); 2013 Q4 ב (key 0.2, graph and ג give 2)
- energy: DONE 16/16. Note 1987 Q3 ג key lacks factor 3
- gravitation: DONE 32/32. Mismatches: 1992 Q5 ב1 (key 2.5N vs 50N); 2003 Q5 ב (key 4.4e7, calc 4.23e7; ג in key fits 4.23e7); 2009 Q5 ד (key 38, calc 39, tol 3%)
- harmonic: DONE 20/20, all match the key
- Second pass DONE: scripts/verify/consistency.py (466/466 numeric answers agree with their final text), katex-check.mjs (6017 formulas, 0 errors), figure-check.cjs (180 figures, 0 cut/overlap after fixes), unkeyed answers recomputed by hand
- Then: re-import, delete the temporary admin user, summary for owner.
