#!/bin/bash
# snapshot mid-shot frames of every part (one at a time: index.html is shared)
cd "$(dirname "$0")/.."
for k in ${@:-1 2 3 4 5}; do
  T=$(../../.venv/Scripts/python.exe tools/midtimes.py $k ${FRAC:-0.6} 2>/dev/null | tail -1)
  cp parts/p$k.html index.html
  rm -rf renders/snap/p$k
  npx hyperframes snapshot --at "$T" --no-end --timeout 120000 -o renders/snap/p$k > renders/snap_p$k.log 2>&1
  echo "part $k snap exit $?"
done
