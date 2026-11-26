"""Insert silent gaps for round title cards into the voice. Writes assets/audio/vo.wav, words2.json (shifted) and cards.json."""
import json, subprocess
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
CARD = 3.2
GAPS = [3.4, 3.4, 5.6, 5.6, 5.6, 5.6, 6.6, 6.6, 3.4, 3.4, 3.4, 3.4]   # extra beyond the card is the tier-board drop before it
# (word that opens the round, its original start time, card title, sub line)
CARDS = [("Here", 38.24, "Could 100 Men Beat Every Prehistoric Predator?", ""),
         ("First", 64.72, "Velociraptor", "75 - 71 Million Years Ago"),
         ("Next,", 107.42, "Dire Wolf", "Until About 13,000 Years Ago"),
         ("Meet", 160.08, "Kelenken", "15 Million Years Ago"),
         ("Then", 191.12, "Smilodon Populator", "1 Million - 10,000 Years Ago"),
         ("Before", 242.86, "The Half-Ton Hunters", "Utahraptor / Short-Faced Bear / Titanoboa"),
         ("Now", 332.86, "Tyrannosaurus Rex", "68 - 66 Million Years Ago"),
         ("And", 421.92, "Into the Water", "Deinosuchus / Mosasaurus / Megalodon"),
         ("Yet", 469.78, "The Mistake", ""),
         ("Decades", 496.98, "The Siegsdorf Lion", "48,000 Years Ago"),
         ("So", 578.74, "Round Two: Spears and Fire", ""),
         ("So,", 672.08, "The Verdict", "")]
W = json.load(open("words.json"))
words = W["words"]
cuts = []
for wd, t0, title, sub in CARDS:
    i = min(range(len(words)), key=lambda k: abs(words[k]["start"] - t0))
    assert words[i]["word"] == wd, (wd, words[i])
    cuts.append(round((words[i - 1]["end"] + words[i]["start"]) / 2, 3))
# build audio: segments with silence between
segs, prev = [], 0.0
for c in cuts: segs.append((prev, c)); prev = c
segs.append((prev, W["duration"]))
inputs, fc, n = ["-i", "assets/audio/voice.mp3"], [], 0
parts = []
for k, (a, b) in enumerate(segs):
    fc.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=mono[s{k}]"); parts.append(f"[s{k}]")
    if k < len(cuts):
        fc.append(f"anullsrc=r=48000:cl=mono,atrim=0:{GAPS[k]}[z{k}]"); parts.append(f"[z{k}]")
fc.append("".join(parts) + f"concat=n={len(parts)}:v=0:a=1[out]")
subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", *inputs, "-filter_complex", ";".join(fc), "-map", "[out]", "assets/audio/vo.wav"], check=True)
def shift(t): return round(t + sum(g for c, g in zip(cuts, GAPS) if c <= t), 3)
for w in words: w["start"], w["end"] = shift(w["start"]), shift(w["end"])
json.dump({"duration": W["duration"] + sum(GAPS), "words": words}, open("words2.json", "w"), indent=0)
json.dump([{"gap": round(c + sum(GAPS[:k]), 3), "len": GAPS[k], "card": round(c + sum(GAPS[:k + 1]) - CARD, 3), "title": t, "sub": s} for k, (c, (_, _, t, s)) in enumerate(zip(cuts, CARDS))], open("cards.json", "w"), indent=0)
print("duration", W["duration"] + sum(GAPS))
