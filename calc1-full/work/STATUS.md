# Calc 1 full course - status

- 2026-11-24: project set up, kit added to common.py, BUILDERS.md written. User: no pilot, no approvals, deliver full render.
- Transcribing (words.json pending).
- Transcript done (words.json, script.txt). 14 chapters; 40 builder sections in work/sections.json (01-40, ~6 min each).
- Builders run 6 at a time. Track below: nn | builder | low ok | 1080p | reviewed

Placeholders shotlist/cNN.py (KNN_TODO) for unbuilt sections keep shot ends right.
Wave 1 launched: builders 01-06.
04 | done (14 m) | low ok | 1080p rendering | -
07 launched
06 | done (15 m) | low ok | queued 1080p
08 launched. 1080p via tools/render_queue.sh (work/render_queue.txt -> render_done.txt)
04 | 1080p ok | reviewed ok (sheet K04)
05 | done (18 m) | low ok | queued 1080p
09 launched
02 | done (15 m) | low ok | queued 1080p
19:10 network drop killed builders 01,03,07,08,09 mid-work -> resumed via SendMessage
05 | 1080p ok | reviewed ok
06 | 1080p ok | reviewed ok
10 launched
01 | done (23 m) | low ok | queued 1080p
11 launched
03 | done (20 m) | low ok | queued 1080p
12 launched
07 | done (14 m) | low ok | queued 1080p
13 launched
08 | done (20 m) | low ok | queued 1080p
14 launched
10 | done (13 m) | low ok | queued 1080p
15 launched
01 | 1080p ok | reviewed ok
02 | 1080p ok | reviewed ok
13 | done (14 m) | low ok | queued 1080p
16 launched
09 | done (17 m) | low ok | queued 1080p
17 launched

## PAUSED by user (2026-11-24) - resume when they say "resume"
- Built (low ok): 01-10, 13. 1080p done: see work/render_done.txt; rest of render_queue.txt still to render (09/13 were killed mid-render -> re-render).
- Builders stopped mid-work, resume with SendMessage (agent ids): 11=a229ceb5b2e73082a (nearly done, checking seams), 12=a40dae09f9a02a260, 14=a89252ee10faa7962, 15=a05ac305565a40fd2, 16=ae1fb96f817b1756e, 17=a2f42a45d53804fc8.
- Restart queue: sh tools/render_queue.sh (one copy only!). Next new builders: 18-40.
- Fixed render_done.txt: 1080p complete = 01-07. Still to render: 08 09 10 13 (killed by pause).
RESUMED 2026-11-25 04:33
11 | done (14 m) | low ok | queued 1080p
18 launched
12 | done (15 m) | low ok | queued 1080p
19 launched
14 | done (13 m) | low ok | queued 1080p
20 launched
15 | done (14 m) | low ok | queued 1080p
21 launched
18 | done (13 m) | low ok | queued 1080p
22 launched
19 | done (13 m) | low ok | queued 1080p
23 launched
03 | 1080p ok | reviewed ok
07 | 1080p ok | reviewed ok
16 | done (16 m) | low ok | queued 1080p (voice stutter 1:41:05-1:41:10 in source audio)
24 launched
17 | done (14 m) | low ok | queued 1080p (check gear motion at 30fps)
25 launched
20 | done (11 m) | low ok | queued 1080p
26 launched
21 | done (12 m) | low ok | queued 1080p
27 launched
22 | done (14 m) | low ok | queued 1080p
28 launched
23 | done (14 m) | low ok | queued 1080p
29 launched
26 | done (17 m) | low ok | queued 1080p (voice says 'local max' at 2:43:41, board shows min)
30 launched
24 | done (16 m) | low ok | queued 1080p (imports from s23)
31 launched
25 | done (16 m) | low ok | queued 1080p
32 launched
28 | done (12 m) | low ok | queued 1080p (check Ch10 card ô)
33 launched
27 | done (14 m) | low ok | queued 1080p
34 launched
29 | done (13 m) | low ok | queued 1080p (imports s28)
35 launched
31 | done (15 m) | low ok | queued 1080p (voice says e^x at 3:16:36, board shows -cos x)
36 launched
32 | done (18 m + Riemann photo) | low ok | queued 1080p
37 launched
30 | done (15 m) | low ok | queued 1080p
38 launched
34 | done (13 m) | low ok | queued 1080p
39 launched
Usage limit hit: builders 33=a323db637f7829987 35=a86578ef92e62cc01 36=af72246754302c04d 37=a5f23d33cc69bfdd6 38=a97c4915259b99c9d 39=a37bb1979f52b77a8 stopped -> resumed via SendMessage
40 launched (last). All 40 builders now started.
33 | done (21 m) | low ok | queued 1080p
35 | done (16 m) | low ok | queued 1080p (K34_Ex2 'bottom' label checked: inside frame, ok)
37 | done (18 m) | low ok | queued 1080p
36 | done (17 m) | low ok | queued 1080p
39 | done (12 m + card, Q1-Q11 part) | low ok | queued 1080p
38 | done (19 m) | low ok | queued 1080p
40 | done (13 m + p + s) | low ok | queued 1080p
ALL 40 BUILT.
Fixes: K35_SineDone EX->-2.4 (matches K34), K35_Tip note moved; K13_Shortcuts re-render (ParseError)
ALL 1080p rendered + reel ok. Assembling 11:49
DONE 2026-11-25 12:58: done\calculus1-full-course.mp4, 4:16:38, 1080p30, -14.0 LUFS, 3.5 GB. SEO in YOUTUBE-SEO.txt.
