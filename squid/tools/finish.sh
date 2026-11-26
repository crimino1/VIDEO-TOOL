#!/bin/bash
# Waits for every 3D frame, then: plate clips -> build -> four-part render -> sound mix -> done/colossal-squid.mp4
cd "$(dirname "$0")/.."
PY=../.venv/Scripts/python.exe
need() { case $1 in eye_reveal) echo 240;; hover) echo 300;; swim) echo 240;; hooks) echo 180;; beak) echo 150;; sub_dark) echo 270;; sub_lights) echo 180;;
  glow_wake) echo 240;; whale_dive) echo 240;; strike) echo 180;; battle) echo 420;; descent) echo 300;; esac; }
while true; do
  ok=1
  for p in eye_reveal hover swim hooks beak sub_dark sub_lights glow_wake whale_dive strike battle descent; do
    n=$(ls blender/frames/$p 2>/dev/null | wc -l); [ "$n" -lt "$(need $p)" ] && ok=0
  done
  [ $ok = 1 ] && break
  sleep 30
done
sleep 20   # let the last PNG finish writing
echo "== plates $(date +%T)"
$PY tools/plates_to_mp4.py descent strike battle whale_dive glow_wake sub_lights sub_dark beak || exit 1
echo "== build $(date +%T)"
rm -f assets/clips/*_*.mp4.tmp
$PY build.py || exit 1
$PY tools/credits.py > /dev/null
bash tools/render_parts.sh || exit 1
echo "== mix $(date +%T)"
$PY tools/mix.py renders/picture.mp4 ../done/colossal-squid.mp4 || exit 1
echo "== FINISHED $(date +%T)"
