#!/bin/bash
# Media for the Seedance 2.5 video (links verified by the research brief, 2026-11-25).
cd "$(dirname "$0")/.."
YT=/c/Users/daggu222105/VIDEO-TOOL/.venv/Scripts/yt-dlp.exe
FFD=/c/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links
CAP="node ../tools/capture.mjs"
curl -s -4 -L --max-time 600 -o assets/raw/x/seed_film.mp4 https://lf3-static.bytednsdoc.com/obj/eden-cn/lapzild-tss/ljhwZthlaukjlkulzlp/user-upload/4xfa4ms89f0vl.mp4 && echo "ok seed_film"
vid() { timeout 600 $YT -4 -q --no-warnings --js-runtimes node --ffmpeg-location $FFD -f "bv*[height<=1080]+ba/b" --merge-output-format mp4 -o "assets/raw/x/$2.%(ext)s" "$1" && echo "ok $2" || echo "FAIL $2"; }
vid https://x.com/BytePlusGlobal/status/2122620646975005175 x_bp_4k
vid https://x.com/dreamina_ai/status/2121921158928851126 x_flash
vid https://x.com/dreamina_ai/status/2083056471147958714 x_dreamina_launch
vid https://x.com/matthieu_ai/status/2083102422705053781 x_matthieu
vid https://x.com/techhalla/status/2083389002552664385 x_diner
vid https://x.com/venturetwins/status/2083641481911492619 x_venture
vid https://x.com/AIFrontliner/status/2088302190905500085 x_14shots
vid https://x.com/Strength04_X/status/2121498278198194482 x_f1jet
vid https://x.com/Artedeingenio/status/2085689695854305524 x_kids
vid https://x.com/ChrisGPT/status/2086219750065967512 x_skin
vid https://x.com/AIwithkhan/status/2096156808415203761 x_vs_kling3_anime
vid https://x.com/UlisesDavid__/status/2113431478021288261 x_vs_kling4_chase
vid https://x.com/maxxmalist/status/2120604734981578776 x_vs_omni
vid https://x.com/johnmccoyx/status/2114466414551572626 x_fail_faceswap
vid https://x.com/PromptSin/status/2112499116995735950 x_fail_dogfight
vid https://x.com/AIWarper/status/2114736275794366467 x_fail_tattoo
full() { timeout 1800 $YT -4 -q --no-warnings --js-runtimes node -f "bv*[height<=720][ext=mp4]/bv*[height<=720]" -o "assets/raw/yt/full/$2.%(ext)s" "https://www.youtube.com/watch?v=$1" && echo "ok yt $2" || echo "FAIL yt $2"; }
full xjyuNokwAPw curious
full saUoEpQBVGk youri
full 6DZ2WST1Az4 jsfilmz
tw() { $CAP tweet $1 assets/raw/web/tw_$2.png --light >/dev/null 2>&1 && echo "ok tw_$2" || echo "FAIL tw_$2"; }
tw 2083053093646983463 seed_launch
tw 2122620646975005175 bp_4k
tw 2121921158928851126 flash
tw 2114466414551572626 faceswap
tw 2114736275794366467 tattoo
tw 2112499116995735950 dogfight
tw 2120604734981578776 omni
