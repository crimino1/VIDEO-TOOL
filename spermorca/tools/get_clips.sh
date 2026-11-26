#!/bin/bash
cd "$(dirname "$0")/.."
Y=../.venv/Scripts/yt-dlp.exe
FFB="/c/Users/daggu222105/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin"
while read -r key id; do
  [ -z "$key" ] && continue
  ls assets/raw/yt/$key.* >/dev/null 2>&1 && continue
  $Y --js-runtimes node --ffmpeg-location "$FFB" -f "bv*[height<=1080][ext=mp4]/bv*[height<=1080]" -o "assets/raw/yt/$key.%(ext)s" --no-playlist -q "https://www.youtube.com/watch?v=$id" && echo "ok $key" || echo "FAIL $key"
done < tools/clips.txt
