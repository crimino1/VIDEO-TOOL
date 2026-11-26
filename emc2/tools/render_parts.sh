#!/bin/bash
# Renders the parts one after another (one HyperFrames render at a time), then joins them losslessly (picture only).
cd "$(dirname "$0")/.."
FF=/c/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe
mkdir -p renders
N=$(ls parts/p*.html | wc -l)
for k in ${@:-$(seq 1 $N)}; do
  cp parts/p$k.html index.html
  echo "== part $k start $(date +%T)"
  npx --yes hyperframes@0.9.16 render --quality delivery -o renders/p$k.mp4 > renders/p$k.log 2>&1 || { echo "FAIL part $k"; tail -20 renders/p$k.log; exit 1; }
  echo "== part $k done $(date +%T)"
done
: > renders/list.txt
for k in $(seq 1 $N); do echo "file 'p$k.mp4'" >> renders/list.txt; done
echo "== list ready: renders/list.txt (mix.py reads it directly)"
