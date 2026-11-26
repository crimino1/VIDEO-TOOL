"""Join the per-paragraph voice files into assets/vo.mp3 with natural pauses, and write paragraphs.json
(start/end of each paragraph in the joined file). Section turns get a longer pause.
Usage: python tools/assemble_vo.py"""
import json, re, subprocess, wave
from pathlib import Path
import numpy as np

FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
H = Path(__file__).resolve().parent.parent
VO = H / "assets" / "vo"
SR = 48000
# a longer pause before these paragraphs: they open a new section of the video
TURNS = {"p02", "p03", "p04", "p07", "p08", "p17", "p23", "p30", "p32"}
GAP, TURN_GAP = .35, .75
TRIM_HEAD = {}


def load(p):
    raw = subprocess.run([FF, "-v", "error", "-i", str(p), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.int16).astype(np.float32)
    # trim leading/trailing near-silence so the pauses we add are the only pauses
    env = np.abs(a) > 300
    idx = np.flatnonzero(env)
    if len(idx):
        a = a[max(0, idx[0] - int(.03 * SR)): idx[-1] + int(.08 * SR)]
    return level(a)


def level(a):
    """Bring every paragraph to the same speech level, so no paragraph comes out louder (shouty) than the rest."""
    fr = int(.05 * SR)
    n = len(a) // fr
    rms = np.sqrt((a[:n * fr].reshape(n, fr) ** 2).mean(1) + 1e-9)
    speech = rms[rms > np.percentile(rms, 40)]
    return a * (2600 / np.median(speech))


parts, meta, t = [], [], 0.0
files = sorted(VO.glob("p*.mp3"), key=lambda p: int(re.findall(r"\d+", p.stem)[0]))
for i, f in enumerate(files):
    pid = f.stem
    if i:
        g = TURN_GAP if pid in TURNS else GAP
        parts.append(np.zeros(int(g * SR), np.float32)); t += g
    a = load(f)
    if pid in TRIM_HEAD:
        a = a[int(TRIM_HEAD[pid] * SR):]
        a[:int(.01 * SR)] *= np.linspace(0, 1, int(.01 * SR))
    meta.append({"id": pid, "start": round(t, 3), "end": round(t + len(a) / SR, 3), "text": (VO / f"{pid}.txt").read_text(encoding="utf-8")})
    parts.append(a); t += len(a) / SR
y = np.concatenate(parts).clip(-32768, 32767).astype(np.int16)
tmp = H / "assets" / "_vo.wav"
with wave.open(str(tmp), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", str(tmp), "-af", "highpass=f=75,equalizer=f=250:t=q:w=1:g=-1.5,equalizer=f=3200:t=q:w=1.2:g=1.5,deesser=i=0.35,acompressor=threshold=-22dB:ratio=2.5:attack=8:release=150,loudnorm=I=-15:TP=-1.5:LRA=6", "-ar", "48000", "-c:a", "libmp3lame", "-b:a", "256k",
                str(H / "assets" / "vo.mp3")], check=True)
tmp.unlink()
(H / "paragraphs.json").write_text(json.dumps(meta, indent=1, ensure_ascii=False), encoding="utf-8")
print(f"{len(meta)} paragraphs, {t:.2f}s ({t / 60:.1f} min)")
