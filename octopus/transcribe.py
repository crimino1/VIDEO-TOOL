import json, sys
from faster_whisper import WhisperModel
m = WhisperModel("medium.en", device="cpu", compute_type="int8")
segs, info = m.transcribe("assets/audio/vo.wav", word_timestamps=True, vad_filter=False)
words=[]; text=[]
for s in segs:
    text.append(f"[{s.start:7.2f}] {s.text.strip()}")
    for w in s.words: words.append({"word":w.word.strip(),"start":round(w.start,2),"end":round(w.end,2)})
json.dump({"duration":info.duration,"words":words},open("words.json","w"),indent=1)
open("script.txt","w",encoding="utf-8").write("\n".join(text))
print(len(words),"words")
