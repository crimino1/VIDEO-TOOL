#!/bin/bash
# usage: run.sh kind mode T0 dur times  -> try_a/<mode>.jpg + luma
cd /c/Users/daggu222105/VIDEO-TOOL/dirac
../.venv/Scripts/python.exe -I tools/try.py try_a "$1" "$2" "$3" "$4" "$5" 2>&1 | tail -1
cp try_a/sheet.jpg "try_a/$2.jpg"
../.venv/Scripts/python.exe try_a/luma.py
for f in try_a/.hyperframes/artifacts/snapshots/*/frame-*.png; do b=$(basename "$f" .png); cp "$f" "try_a/full_$2_${b##*-at-}.png"; done
