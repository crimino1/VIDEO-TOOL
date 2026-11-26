"""Transcribe the voiceover with word timings: words.json + transcript.txt (phrase lines with m:ss)."""
import json, sys
from faster_whisper import WhisperModel
m = WhisperModel("base.en", compute_type="int8")
segs, _ = m.transcribe(sys.argv[1], word_timestamps=True, vad_filter=False, beam_size=5)
words, lines = [], []
for s in segs:
    for w in s.words:
        words.append({"t": round(w.start, 2), "e": round(w.end, 2), "w": w.word.strip()})
    lines.append(f"({int(s.start // 60)}:{s.start % 60:05.2f}) {s.text.strip()}")
    print(lines[-1], flush=True)
json.dump(words, open("words.json", "w"), indent=0)
open("transcript.txt", "w", encoding="utf-8").write("\n".join(lines))
