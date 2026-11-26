#!/bin/bash
# Media for the Inkling 2 Mini review (links verified by the research brief, 2026-11-24).
cd "$(dirname "$0")/.."
YT=/c/Users/daggu222105/VIDEO-TOOL/.venv/Scripts/yt-dlp.exe
FFD=/c/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links
CAP="node ../tools/capture.mjs"
vid() { $YT -4 -q --no-warnings --js-runtimes node --ffmpeg-location $FFD -f "bv*[height<=1080]+ba/b" --merge-output-format mp4 -o "assets/raw/x/$2.%(ext)s" "$1" && echo "ok $2" || echo "FAIL $2"; }
sec() { $YT -4 -q --no-warnings --js-runtimes node --ffmpeg-location $FFD -f "bv*[height<=1080]+ba/b" --merge-output-format mp4 --download-sections "*$2" --force-keyframes-at-cuts -o "assets/raw/yt/$3.%(ext)s" "$1" && echo "ok $3" || echo "FAIL $3"; }
mkdir -p assets/raw/yt
for f in planebench-demo3.FdsHOEHH thinkyville.CSVNowDo; do curl -s -4 -L --max-time 240 -o assets/raw/x/tm_${f%%.*}.mp4 "https://thinkingmachines.ai/_astro/$f.mp4" && echo "ok tm_${f%%.*}"; done
vid https://x.com/exolabs/status/2123953913342935486 x_exo
vid https://x.com/ollama/status/2123889582303281557 x_ollama2048
vid https://x.com/erhanmeydan/status/2124481057474965889 x_erhan4
vid https://x.com/ItsmeAjayKV/status/2124093650120687984 x_ajay_island
vid https://x.com/superalesha/status/2124102269138346409 x_alesha3090
vid https://x.com/analogalok/status/2124135141555720653 x_alok4060
vid https://x.com/sgl_project/status/2123874850200821970 x_sglang
vid https://x.com/DogukanUrker/status/2124072810431537504 x_dogukan3060
vid https://x.com/UnslothAI/status/2123937391421665610 x_unsloth_blender
sec https://www.youtube.com/watch?v=RyZDSKOwCZ0 1:23-3:01 yt_sq_pagoda
sec https://www.youtube.com/watch?v=RyZDSKOwCZ0 5:56-8:00 yt_sq_camel
sec https://www.youtube.com/watch?v=RyZDSKOwCZ0 10:43-11:57 yt_sq_acropolis
sec https://www.youtube.com/watch?v=u-VvvCmyr-E 5:44-8:30 yt_otis_coaster
sec https://www.youtube.com/watch?v=u-VvvCmyr-E 14:25-16:30 yt_otis_fishing
sec https://www.youtube.com/watch?v=IcjndezG9vE 0:48-1:29 yt_dark_speed
sec https://www.youtube.com/watch?v=TmsF-1t_ej8 3:47-4:59 yt_rit_speed_repo
sec https://www.youtube.com/watch?v=TmsF-1t_ej8 5:42-6:58 yt_rit_vision_fail
tw() { $CAP tweet $1 assets/raw/web/tw_$2.png --light >/dev/null 2>&1 && echo "ok tw_$2" || echo "FAIL tw_$2"; }
tw 2123871643797995872 tm_launch
tw 2123871645039464643 tm_loop
tw 2123871647371501591 tm_mac
tw 2124066983276654994 lasse
tw 2124165894188511501 jackson
tw 2124072810431537504 dogukan
tw 2123872482663039189 dummer
tw 2123903224344166906 adrgrondin
tw 2123877871316087012 aa_chart
tw 2123953913342935486 exo
tw 2124809679117389930 po3rin
s() { $CAP shot "$1" assets/raw/web/$2.png --until=load --wait=5000 ${3:+--full} >/dev/null 2>&1 && echo "ok $2" || echo "FAIL $2"; }
r() { $CAP scroll "$1" assets/raw/rec/$2.mp4 --seconds=${3:-10} --px=${4:-2200} --wait=5000 >/dev/null 2>&1 && echo "ok rec $2" || echo "FAIL rec $2"; }
s https://huggingface.co/thinkingmachines/Inkling-2-Mini hf full
r https://huggingface.co/thinkingmachines/Inkling-2-Mini hf_scroll 12 3000
s https://ollama.com/library/inkling-2-mini ollama full
r https://ollama.com/library/inkling-2-mini ollama_scroll 8 1600
s https://artificialanalysis.ai/models/inkling-2-mini aa_model full
r https://artificialanalysis.ai/models/inkling-2-mini aa_model_scroll 14 5000
s https://artificialanalysis.ai/models/comparisons/inkling-2-mini-vs-qwen3-8-27b aa_vs_qwen full
s https://artificialanalysis.ai/models/open-source/small aa_small full
r https://artificialanalysis.ai/models/open-source/small aa_small_scroll 12 3500
s https://unsloth.ai/docs/models/inkling-2-mini unsloth full
s https://huggingface.co/datasets/pratikgx/inkling-2-mini-m5-pro-mac-mini-bench macmini_bench full
s https://www.vals.ai/models/thinkingmachines_inkling-2-mini vals full
