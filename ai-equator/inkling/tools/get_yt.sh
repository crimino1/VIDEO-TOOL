#!/bin/bash
# Remaining YouTube test sections, as single-file mp4 (no keyframe re-encode, so ffmpeg can seek over HTTP).
cd "$(dirname "$0")/.."
YT=/c/Users/daggu222105/VIDEO-TOOL/.venv/Scripts/yt-dlp.exe
FFD=/c/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links
sec() { [ -f assets/raw/yt/$3.mp4 ] && { echo "have $3"; return; }; timeout 600 $YT -4 -q --no-warnings --js-runtimes node --ffmpeg-location $FFD -f "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[ext=mp4]" --merge-output-format mp4 --download-sections "*$2" -o "assets/raw/yt/$3.%(ext)s" "$1" && echo "ok $3" || echo "FAIL $3"; }
sec https://www.youtube.com/watch?v=TmsF-1t_ej8 4:24-6:58 yt_rit_vision_fail
sec https://www.youtube.com/watch?v=u-VvvCmyr-E 5:44-7:40 yt_otis_coaster
sec https://www.youtube.com/watch?v=u-VvvCmyr-E 14:25-16:00 yt_otis_fishing
sec https://www.youtube.com/watch?v=RyZDSKOwCZ0 2:14-3:01 yt_sq_pagoda
