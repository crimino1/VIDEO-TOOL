---
name: orcakill-project
description: "Unseen By Eye: 'Orcas Kill These Animals and Never Eat Them' (14:46), flat style, res.js scenes (porpoises, salmon, Salish split-level, salmon hat, Tahlequah carry)"
metadata:
  type: project
---

Started 2026-11-14 in VIDEO-TOOL/orcakill, built from a copy of sharkorca. Voice "There are 76 of thes-enhanced-v2.mp3" (881.5 s, padded to 886 s for the end card). It does not say a channel name. The user asked for "all same as previous, better quality".

What's new:
- assets/js/res.js adds porpoise (harbor, dall, bottlenose), Chinook salmon and a cat, plus these scenes:
  - split-level surface view with a Salish backdrop: conifer ridges, a snowy volcano, a whale-watch boat and a sailboat with a rudder
  - salish (stylised map with route and pods), records (incident dots), pods, diet, river (dam, town, boats), line, peanut, dronemeasure, calves, menus, kitchen (cat), hat (salmon hat), samesize, morph, four, compare, carousel, beachhunt, endres
- story.js actors now take a generic `hold` = [holder bx, by, angle, held sx, sy], plus heldOn keys and show windows.
- flat.js orca now has `thin` (peanut head) and `calf` (peach patches).

Gotchas:
- The first pass came out at 85% animation and had to be cut to about 70%. Measure the share before rendering.
- orcau_2 is clean only from 0 to 6 s; it overexposes after that.
- orcau_0 has a boat with "SURF" lettering at 16-22 s and 32-36 s, and a BREMER CANYON logo from about 39 s.
- The delivered shark film used both bad ranges (around 1:35, 10:22 and 15:46). That needs a re-render if the user agrees.

Related: [[sharkorca-project]], [[flat-style-test]].
