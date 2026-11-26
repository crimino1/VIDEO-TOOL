#!/bin/bash
# Downloads every verified source for the Riemann-claim video into assets/raw.
cd "$(dirname "$0")/.."
YT=/c/Users/daggu222105/VIDEO-TOOL/.venv/Scripts/yt-dlp.exe
FFD=/c/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links
CAP="node ../tools/capture.mjs"
dl() { curl -4 -sL --max-time 180 -o "$2" "$1" && echo "ok $2 $(du -h "$2" | cut -f1)"; }
dl https://alpo.ge/remark.pdf assets/raw/web/remark.pdf
dl https://math216.wordpress.com/wp-content/uploads/2026/11/the-music-of-the-primes.pdf assets/raw/web/masullo.pdf
dl https://raw.githubusercontent.com/vincitamore/riemann-lean-account/main/README.md assets/raw/code/lean_account_README.md
dl https://raw.githubusercontent.com/Deicyde/riemann-hypothesis/main/README.md assets/raw/code/mirror_README.md
dl "https://video.twimg.com/amplify_video/2123872524266020864/vid/avc1/1920x1080/lLsQepDZOpABYIyc.mp4" assets/raw/x/x_tao_clip.mp4
pbs() { curl -4 -sL --max-time 60 -o "assets/raw/web/$2" "https://pbs.twimg.com/media/$1?name=orig" && echo "ok $2"; }
pbs HXkoiilWgAAAeN1.jpg p_armstrong.jpg
pbs HXmYWajbYAA7i_r.jpg p_scitech.jpg
$YT -4 -q --no-warnings --js-runtimes node --ffmpeg-location $FFD -f "bv*[height<=1080]+ba/b" --merge-output-format mp4 --download-sections "*955-1065" -o "assets/raw/x/yt_numberphile.%(ext)s" "https://www.youtube.com/watch?v=bAnwMdfcMVw" && echo ok yt_numberphile
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
