#!/bin/bash
cd "$(dirname "$0")/.."
PY=../.venv/Scripts/python.exe
$PY build.py > build.log 2>&1 || exit 1
bash tools/render_parts.sh || exit 1
echo "== mix $(date +%T)"
$PY tools/mix.py renders/picture.mp4 ../done/deep-sea-predators.mp4 || exit 1
echo "== FINISHED $(date +%T)"
