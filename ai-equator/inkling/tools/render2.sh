#!/bin/bash
# Render parts/p1.html and parts/p2.html one after another (each plan stays under HyperFrames' 2 GB cap and C:'s free space),
# then join them losslessly. index.html is restored afterwards, whatever happens.
cd "$(dirname "$0")/.."
FF=/c/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe
cp index.html index_full.html
trap 'cp index_full.html index.html' EXIT
for k in ${@:-1 2}; do
  cp parts/p$k.html index.html
  echo "== part $k start $(date +%T)"
  npx hyperframes render --quiet -o renders/p$k.mp4 > renders/p$k.log 2>&1 || { echo "FAIL part $k"; tail -20 renders/p$k.log; exit 1; }
  echo "== part $k done $(date +%T)"
done
printf "file 'p1.mp4'\nfile 'p2.mp4'\n" > renders/list.txt
$FF -hide_banner -loglevel error -y -f concat -safe 0 -i renders/list.txt -an -c:v copy renders/picture.mp4 && echo "== joined renders/picture.mp4"
