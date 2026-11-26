#!/bin/sh
# Render finished sections at 1080p one at a time. Add a section with: echo 06 >> work/render_queue.txt
# Done sections go to work/render_done.txt. Exits when the queue has been empty for 3 h.
cd "$(dirname "$0")/.."
PY=../.venv/Scripts/python.exe
touch work/render_queue.txt work/render_done.txt
idle=0
while [ $idle -lt 1080 ]; do
  nn=$(grep -vxF -f work/render_done.txt work/render_queue.txt | head -1)
  if [ -z "$nn" ]; then idle=$((idle+1)); sleep 10; continue; fi
  idle=0
  names=$($PY -c "from shots import SHOTS; print(' '.join(s['name'] for s in SHOTS if s['kind']=='m' and s['name'].startswith('K${nn}_')))")
  $PY tools/render_manim.py --jobs 2 $names > work/render_K$nn.log 2>&1
  echo "$nn" >> work/render_done.txt
done
