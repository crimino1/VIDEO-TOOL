"""Clean the voiceover: shorten long pauses (sentence-aware), then clarity EQ + de-ess + loudness.
Usage: clean_voice.py <in> <out.mp3>   (also writes cuts.json: list of [time_in_raw, seconds_removed])"""
import json, re, subprocess, sys, wave
import numpy as np

FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
SECTION = ("okay", "now", "so", "but", "and", "my")  # words that open a new beat after a full stop
src, out = sys.argv[1:3]
WORDS = json.load(open("words_raw.json"))


def target(s, e):
    """How long this pause should be: 0.25 mid-sentence, 0.4 after a full stop, 0.55 at a section turn."""
    prev = [w for w in WORDS if w["e"] <= s + .08]
    nxt = [w for w in WORDS if w["t"] >= e - .08]
    if not prev or prev[-1]["w"][-1:] not in ".?!":
        return .25
    first = nxt[0]["w"].lower().strip(",.") if nxt else ""
    return .55 if first in SECTION and e - s > .55 else .40

log = subprocess.run([FF, "-hide_banner", "-i", src, "-af", "silencedetect=n=-42dB:d=0.3", "-f", "null", "-"],
                     capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]

subprocess.run([FF, "-loglevel", "error", "-y", "-i", src, "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", "_raw.wav"], check=True)
with wave.open("_raw.wav") as w:
    sr, a = w.getframerate(), np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)

parts, cuts, pos = [], [], 0
fade = int(.01 * sr)
for s, e in zip(starts, ends):
    keep = target(s, e)
    if e - s < keep + .08:
        continue
    cs, ce = int((s + keep / 2) * sr), int((e - keep / 2) * sr)
    seg = a[pos:cs].copy()
    seg[-fade:] *= np.linspace(1, 0, fade)
    parts.append(seg)
    cuts.append([round(s + keep / 2, 3), round((ce - cs) / sr, 3)])
    pos = ce
    tail = a[pos:pos + fade]
    a[pos:pos + fade] = tail * np.linspace(0, 1, len(tail))
parts.append(a[pos:])
y = np.concatenate(parts).clip(-32768, 32767).astype(np.int16)
with wave.open("_cut.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(y.tobytes())

af = ("highpass=f=75,equalizer=f=250:t=q:w=1:g=-1.5,equalizer=f=3200:t=q:w=1.2:g=2,"
      "deesser=i=0.35,acompressor=threshold=-20dB:ratio=2:attack=8:release=120,loudnorm=I=-15:TP=-1.5:LRA=7")
subprocess.run([FF, "-loglevel", "error", "-y", "-i", "_cut.wav", "-af", af, "-ar", "48000", "-c:a", "libmp3lame", "-b:a", "256k", out], check=True)
json.dump(cuts, open("cuts.json", "w"))
print(f"{len(cuts)} pauses shortened, {sum(c[1] for c in cuts):.2f}s removed, {len(a) / sr:.2f}s -> {len(y) / sr:.2f}s")
