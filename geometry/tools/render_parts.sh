#!/bin/bash
# Renders the parts one after another (one HyperFrames render at a time), then joins them losslessly.
cd "$(dirname "$0")/.."
FF=/c/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe
for k in ${@:-1 2 3 4 5 6 7}; do
  cp parts/p$k.html index.html
  echo "== part $k start $(date +%T)"
  npx hyperframes render --quality delivery -o renders/p$k.mp4 > renders/p$k.log 2>&1 && echo "render exit 0" >> renders/p$k.log || { echo "FAIL part $k"; tail -20 renders/p$k.log; exit 1; }
  echo "== part $k done $(date +%T)"
done
: > renders/list.txt
for k in 1 2 3 4 5 6 7; do echo "file 'p$k.mp4'" >> renders/list.txt; done
$FF -hide_banner -loglevel error -y -f concat -safe 0 -i renders/list.txt -an -c:v copy renders/picture.mp4 && echo "== joined renders/picture.mp4"
