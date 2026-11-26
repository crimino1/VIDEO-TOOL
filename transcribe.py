"""Usage: .venv\\Scripts\\python.exe transcribe.py <audio-or-video> <words.json> [model]"""
import json
import sys
from pathlib import Path

from faster_whisper import WhisperModel

src, out = sys.argv[1:3]
model = WhisperModel(sys.argv[3] if len(sys.argv) > 3 else "base", device="cpu", compute_type="int8")
segments, info = model.transcribe(src, word_timestamps=True)
words = [{"word": w.word.strip(), "start": float(w.start), "end": float(w.end)} for s in segments for w in s.words]
Path(out).write_text(json.dumps({"duration": info.duration, "words": words}, indent=1), encoding="utf-8")
print(f"{len(words)} words, {info.duration:.2f}s -> {out}")
