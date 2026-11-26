#!/bin/bash
# Supporting media for the Astra vs Fable video (all verified by the research brief).
cd "$(dirname "$0")/.."
YT=/c/Users/daggu222105/VIDEO-TOOL/.venv/Scripts/yt-dlp.exe
FFD=/c/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links
CAP="node ../tools/capture.mjs"
vid() { $YT -4 -q --no-warnings --js-runtimes node --ffmpeg-location $FFD -f "bv*[height<=1080]+ba/b" --merge-output-format mp4 -o "assets/raw/x/$2.%(ext)s" "$1" && echo "ok $2" || echo "FAIL $2"; }
vid https://x.com/claudeai/status/2119867114450268322 x_fable_launch
vid https://x.com/OpenAI/status/2122750124543926515 x_astra_launch
vid https://x.com/DilumSanjaya/status/2120561077385867663 x_rover
vid https://x.com/HashemGhaili/status/2120202746121085321 x_xray
vid https://x.com/mattshumer_/status/2119877065701036047 x_weather
vid https://x.com/emollick/status/2122755693191287009 x_elevator
vid https://x.com/AngryTomtweets/status/2122816282986738029 x_carsolver
vid https://x.com/AmirMushich/status/2122815524124152216 x_blender
tw() { $CAP tweet $1 assets/raw/web/tw_$2.png --light >/dev/null 2>&1 && echo "ok tw_$2" || echo "FAIL tw_$2"; }
tw 2122929243260608651 sokrypton
tw 2122815524124152216 amir
tw 2119867138987176141 fable_price
s() { $CAP shot "$1" assets/raw/web/$2.png --mac --until=load --wait=3500 ${3:+"--highlight=$3"} >/dev/null 2>&1 && echo "ok $2" || echo "FAIL $2"; }
s "https://artificialanalysis.ai/models/comparisons/claude-fable-5-2-vs-gpt-6-2-astra" aa_compare
s "https://dev.to/otterdev3/we-gave-claude-fable-52-and-gpt-62-the-same-game-prompt-results-1k81" devto
s "https://xinmingtu.cn/blog/2026/claude-opus-5-5-protein-sequences/" protein "54%"
s "https://www.anthropic.com/research/claude-black-hole-physics" blackhole
s "https://www.geeky-gadgets.com/astra-6-2-vs-fable-5-2/" nateherk
