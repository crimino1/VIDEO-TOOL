#!/bin/bash
# Media for the Opus 5.6 leaks video (links verified by the research brief, 2026-11-25).
cd "$(dirname "$0")/.."
YT=/c/Users/daggu222105/VIDEO-TOOL/.venv/Scripts/yt-dlp.exe
FFD=/c/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links
CAP="node ../tools/capture.mjs"
vid() { timeout 600 $YT -4 -q --no-warnings --js-runtimes node --ffmpeg-location $FFD -f "bv*[height<=1080]+ba/b" --merge-output-format mp4 -o "assets/raw/x/$2.%(ext)s" "$1" && echo "ok $2" || echo "FAIL $2"; }
vid https://x.com/claudeai/status/2102435511222890900 x_opus55_launch
vid https://x.com/claudeai/status/2119867114450268322 x_fable52_launch
vid https://x.com/intheworldofai/status/2125101093860638931 x_stealth_cc
vid https://x.com/marcthecreatorr/status/2125254550416175477 x_svg_film
vid https://x.com/chetaslua/status/2125331978891461023 x_anime
vid https://x.com/chetaslua/status/2109290983896818132 x_oct_js
vid https://x.com/marmaduke091/status/2109396343114666207 x_oct_blender
tw() { $CAP tweet $1 assets/raw/web/tw_$2.png --light >/dev/null 2>&1 && echo "ok tw_$2" || echo "FAIL tw_$2"; }
tw 2117044265348211057 pirat
tw 2116940706753454266 arun
tw 2109288430857507154 kol
tw 2125018875217547382 synth
tw 2125175594681807308 kimmo
tw 2125138567617761702 codebynz
tw 2125215156380557656 legit
tw 2125301776106791103 berman
tw 2125111906436542525 pankaj
s() { $CAP shot "$1" assets/raw/web/$2.png --until=load --wait=6000 --full >/dev/null 2>&1 && echo "ok $2" || echo "FAIL $2"; }
s https://platform.claude.com/docs/en/about-claude/models/overview docs_models
s https://platform.claude.com/docs/en/about-claude/model-deprecations docs_deprec
s https://platform.claude.com/docs/en/release-notes/overview docs_notes
s https://www.anthropic.com/claude-opus-5-5 opus55
s https://artificialanalysis.ai/models/claude-opus-5-5 aa_opus55
s https://polymarket.com/event/next-claude-opus-released-byptptpt-20260923144500000 poly
s https://public.com/prediction-markets/when-will-anthropic-release-opus-5-6-6hknal4 kalshi_pub
s https://manifold.markets/Bayesian/claude-opus-56-anthropic-release-da manifold
s https://www.testingcatalog.com/anthropic-tests-new-model-opus-5-5-routing-opus-5-6-fable-5-5 testingcatalog
s https://9to5google.com/2026/11/18/gemini-4-neon/ neon
