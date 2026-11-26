#!/bin/bash
# cut every listed photo that exists and has no cut-out yet
cd "$(dirname "$0")/.."
for n in vraptor2_1 vraptor2_2 direwolf_3 direwolf_1 kelenken_1 kelenken_4 smilodon_0 piano_0 utah_3 arctodus_5 titanoboa_0 trex_1 trex_4 giga_3 spino_5 deino_1 mosa_3 meg_1 cavelion_3 cavelion_5 mammoth_0; do
  ls assets/photo/$n.* >/dev/null 2>&1 || continue
  [ -f assets/cut/$n.png ] && continue
  echo "cut $n"; ../.venv/Scripts/python.exe tools/cut.py $n || echo "FAILED $n"
done
