#!/bin/bash
# One paragraph at a time; stop at once if a paragraph's pace looks like a loop or a cut (chars/s outside 10-19).
cd /c/Users/daggu222105/VIDEO-TOOL
FP=/c/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffprobe.exe
P=ai-equator/inkling
for n in ${@}; do
  t=$P/assets/vo/$n.txt; o=$P/assets/vo/$n.mp3
  [ -f $o ] && { echo "skip $n"; continue; }
  .venv/Scripts/python.exe tools/aieq_tts.py $P $t $o || exit 1
  d=$($FP -v error -show_entries format=duration -of csv=p=0 $o); c=$(wc -c < $t)
  cps=$(awk "BEGIN{printf \"%.1f\", $c/$d}"); echo "$n ${d}s ${cps} chars/s"
  awk "BEGIN{exit !($cps<10 || $cps>19)}" && { echo "STOP: $n pace off"; exit 2; }
  .venv/Scripts/python.exe $P/tools/vo_check.py $t $o || { echo "STOP: $n transcript off"; exit 3; }
done
echo all done
