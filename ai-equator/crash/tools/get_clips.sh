#!/bin/sh
# Real news and podcast footage: short sections only, 1080p where available. Audio is dropped at edit time.
cd "$(dirname "$0")/../assets/raw" || exit 1
Y=../../../../.venv/Scripts/yt-dlp.exe
FFB="/c/Users/daggu222105/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin"
F='bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080]/b'
get() { # name url [section]
  if [ -n "$3" ]; then
    $Y --no-warnings --no-playlist --ffmpeg-location "$FFB" -f "$F" --merge-output-format mp4 --download-sections "*$3" --force-keyframes-at-cuts -o "$1.%(ext)s" "$2" 2>&1 | tail -1 | cut -c1-110
  else
    $Y --no-warnings --no-playlist --ffmpeg-location "$FFB" -f "$F" --merge-output-format mp4 -o "$1.%(ext)s" "$2" 2>&1 | tail -1 | cut -c1-110
  fi
}
get yt_nbc "https://www.youtube.com/watch?v=R1vmfCfNXb8" &
get yt_abc "https://www.youtube.com/watch?v=RArUX9EPas8" &
get yt_arirang "https://www.youtube.com/watch?v=nLsLmKydAJY" &
get yt_bloom "https://www.youtube.com/watch?v=rlOAaC-6uyc" "0:00-3:00" &
get yt_paper "https://www.youtube.com/watch?v=TSPyllkCuC8" &
get yt_cheeky "https://www.youtube.com/watch?v=iMsUcCYNKqY" "0:00-2:30" &
get x_morqon "https://x.com/morqon/status/2115838856524120128" &
wait
ls -la | awk '{print $5,$9}' | grep -E "yt_|x_"
