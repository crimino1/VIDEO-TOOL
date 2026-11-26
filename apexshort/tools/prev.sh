#!/bin/bash
# 360p previews for picking in-points: tools/prev.sh key id [section]
cd "$(dirname "$0")/.."
key=$1; id=$2; sec=${3:-0-900}
[ -f assets/prev/$key.mp4 ] && exit 0
timeout 500 ../.venv/Scripts/yt-dlp.exe --force-ipv4 --socket-timeout 30 --js-runtimes node -f "bv*[height<=360][ext=mp4]/bv*[height<=360]" --download-sections "*$sec" -o "assets/prev/$key.%(ext)s" --no-playlist -q "https://www.youtube.com/watch?v=$id" && echo "ok $key" || echo "FAIL $key"
