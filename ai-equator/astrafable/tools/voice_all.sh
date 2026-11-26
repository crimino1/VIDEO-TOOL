#!/bin/bash
# Generate the voice one paragraph at a time (user's rule), skipping paragraphs already done; stops on the first error.
cd "$(dirname "$0")/.."
PY=/c/Users/daggu222105/VIDEO-TOOL/.venv/Scripts/python.exe
for f in assets/vo/p*.txt; do
  o="${f%.txt}.mp3"
  [ -s "$o" ] && continue
  $PY ../../tools/aieq_tts.py . "$f" "$o" || { echo "STOPPED at $f"; exit 1; }
done
$PY ../../tools/aieq_tts.py . --usage
