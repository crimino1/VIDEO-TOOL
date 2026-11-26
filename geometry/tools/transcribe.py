"""public/vo.mp3 -> words.json (word timings) + transcript.txt (timestamped lines), faster-whisper small, CPU."""
import json, os
from faster_whisper import WhisperModel
H = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
segs, info = WhisperModel("small", device="cpu", compute_type="int8").transcribe(os.path.join(H, "public", "vo.mp3"), word_timestamps=True, language="en")
words, lines = [], []
for sg in segs:
    m, s = divmod(sg.start, 60)
    lines.append(f"[{int(m)}:{s:05.2f}] {sg.text.strip()}")
    words += [{"word": w.word.strip(), "start": round(w.start, 2), "end": round(w.end, 2)} for w in sg.words]
json.dump({"duration": info.duration, "words": words}, open(os.path.join(H, "words.json"), "w", encoding="utf-8"), indent=1)
open(os.path.join(H, "transcript.txt"), "w", encoding="utf-8").write("\n".join(lines))
print(len(words), "words,", f"{info.duration:.2f}s")
