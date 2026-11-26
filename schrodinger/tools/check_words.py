import json, re, sys
w = json.load(open(r"C:\Users\daggu222105\VIDEO-TOOL\schrodinger\words.json", encoding="utf-8"))
print(len(w["words"]), "words", w["duration"])
# print whisper words as compact lines every ~12 s so shot beats can be read off directly
line, t0 = [], None
for x in w["words"]:
    if t0 is None: t0 = x["start"]
    line.append(x["word"])
    if x["start"] - t0 > 11:
        print(f"{t0:7.2f} " + " ".join(line)); line, t0 = [], None
if line: print(f"{t0:7.2f} " + " ".join(line))
