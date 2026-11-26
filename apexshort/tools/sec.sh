#!/bin/bash
# Full-quality section download: tools/sec.sh key id start end  -> assets/raw/yt/key.mp4 (file time 0 = start)
cd "$(dirname "$0")/.."
key=$1; id=$2; a=$3; b=$4
[ -f assets/raw/yt/$key.mp4 ] && exit 0
FFB="/c/Users/daggu222105/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin"
timeout 500 ../.venv/Scripts/yt-dlp.exe --force-ipv4 --socket-timeout 30 --js-runtimes node --ffmpeg-location "$FFB" -f "bv*[height<=2160][ext=mp4]/bv*[height<=2160]" --download-sections "*$a-$b" --force-keyframes-at-cuts -o "assets/raw/yt/$key.%(ext)s" --no-playlist -q "https://www.youtube.com/watch?v=$id" && echo "ok $key" || echo "FAIL $key"
