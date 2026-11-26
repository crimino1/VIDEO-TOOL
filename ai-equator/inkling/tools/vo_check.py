"""Check one voiced paragraph against its text: word-count ratio and repeated 5-word runs (engine loops).
Usage: vo_check.py <pNN.txt> <pNN.mp3>   exit 1 if it looks wrong."""
import re, sys
from collections import Counter
from faster_whisper import WhisperModel
txt, mp3 = sys.argv[1:3]
want = re.findall(r"[a-z0-9']+", open(txt, encoding="utf-8").read().lower())
segs, info = WhisperModel("base.en", compute_type="int8").transcribe(mp3)
got = re.findall(r"[a-z0-9']+", " ".join(s.text for s in segs).lower())
grams = Counter(tuple(got[i:i + 5]) for i in range(len(got) - 4))
rep = [" ".join(g) for g, n in grams.items() if n >= 3]
ratio = len(got) / max(1, len(want))
print(f"{mp3}: {info.duration:.1f}s, words {len(got)}/{len(want)} ({ratio:.2f}), repeats {rep[:2]}")
sys.exit(1 if rep or not .8 <= ratio <= 1.25 else 0)
