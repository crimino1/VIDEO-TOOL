"""Word timings for the voiceover -> words_raw.json [{w,t,e}].  Usage: words.py <audio> <out.json>"""
import json, sys
from faster_whisper import WhisperModel
segs, _ = WhisperModel("base.en", compute_type="int8").transcribe(sys.argv[1], word_timestamps=True)
json.dump([{"w": w.word.strip(), "t": round(w.start, 3), "e": round(w.end, 3)} for s in segs for w in s.words], open(sys.argv[2], "w"))
