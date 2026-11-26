#!/bin/bash
cd "$(dirname "$0")/.."
CAP="node ../tools/capture.mjs"
tw() { $CAP tweet $1 assets/raw/web/tw_$2.png --light >/dev/null 2>&1 && echo "ok tw_$2" || echo "FAIL tw_$2"; }
tw 2123792743503933774 glazer
tw 2123796489197514945 bloom
tw 2123773647919661288 armstrong
tw 2123955141019586980 kimmonismus
tw 2123896220733370686 scitech
s() { $CAP shot "$1" assets/raw/web/$2.png --mac --until=load --wait=3500 ${3:+"--highlight=$3"} >/dev/null 2>&1 && echo "ok $2" || echo "FAIL $2"; }
s "https://terrytao.wordpress.com/2026/11/20/unforced-euler-singularity-unforced-navier-stokes-singularity-and-the-generalized-riemann-hypothesis/" b_tao "has generated an (enormous) Lean-only proof"
s "https://math216.wordpress.com/2026/11/20/hurried-announcement-alessandro-masullo-grh/" b_vakil "so far looking good"
s "https://math.mit.edu/~drew/grh/" b_sutherland "propext"
s "https://www.claymath.org/millennium/riemann-hypothesis/" b_clay
s "https://www.anthropic.com/research/riemann-zeta" b_anthropic "67.2%"
s "https://www.scientificamerican.com/article/anthropic-mathematician-claims-to-prove-riemann-hypothesis-most-famous-problem-in-all-of-math/" b_sciam
s "https://www.aljazeera.com/economy/2026/11/19/anthropic-starts-trading-in-the-us-after-blockbuster-ipo" b_ipo
s "https://www.claymath.org/collections/riemanns-1859-manuscript/" b_manuscript
s "https://github.com/Deicyde/riemann-hypothesis" gh_mirror
s "https://alpo.ge/" b_alpoge
