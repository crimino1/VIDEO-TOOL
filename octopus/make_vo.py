"""Voice for the blue-ringed octopus film: clean, high-quality and without long silences.
1. Find silences (below -42 dB for 0.55 s or more) and shrink each to KEEP seconds, with 15 ms fades at every join.
2. Polish: 70 Hz high-pass, a little low-mid cleanup, presence and air, gentle de-ess, two-stage compression, 48 kHz.
Writes assets/audio/vo.wav (loudness is set in the final mix)."""
import re, subprocess
import numpy as np, soundfile as sf
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
SRC, SR, KEEP = "assets/audio/voice_raw.mp3", 48000, 0.36

raw = subprocess.run([FF, "-v", "error", "-i", SRC, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, dtype=np.float32).copy()
log = subprocess.run([FF, "-hide_banner", "-i", SRC, "-af", "silencedetect=n=-42dB:d=0.55", "-f", "null", "-"], capture_output=True, text=True, errors="replace").stderr
st = [float(v) for v in re.findall(r"silence_start: ([\d.]+)", log)]
en = [float(v) for v in re.findall(r"silence_end: ([\d.]+)", log)]
keep, pos, cut = [], 0, 0.0
fade = int(0.015 * SR)
for a, b in zip(st, en):
    if a < 0.05: continue                      # leave the very start alone
    mid_a, mid_b = int((a + KEEP / 2) * SR), int((b - KEEP / 2) * SR)
    if mid_b <= mid_a: continue
    keep.append(x[pos:mid_a]); pos = mid_b; cut += (mid_b - mid_a) / SR
keep.append(x[pos:])
for k in range(len(keep) - 1):                   # tiny fades so joins never click
    if len(keep[k]) > fade: keep[k][-fade:] *= np.linspace(1, 0, fade)
    if len(keep[k + 1]) > fade: keep[k + 1][:fade] *= np.linspace(0, 1, fade)
y = np.concatenate(keep)
sf.write("assets/audio/_tight.wav", y, SR, subtype="FLOAT")
chain = ("highpass=f=70,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3200:t=q:w=1.0:g=2,equalizer=f=9000:t=q:w=0.8:g=1.5,"
         "deesser=i=0.35:m=0.5:f=0.5,acompressor=threshold=-22dB:ratio=2:attack=10:release=150:makeup=2,"
         "acompressor=threshold=-12dB:ratio=3:attack=3:release=60:makeup=1,alimiter=limit=0.9:level=disabled")
subprocess.run([FF, "-v", "error", "-y", "-i", "assets/audio/_tight.wav", "-af", chain, "-ar", str(SR), "-c:a", "pcm_s24le", "assets/audio/vo.wav"], check=True)
print(f"silences shortened: {len([1 for a in st if a >= 0.05])}, removed {cut:.1f}s, voice now {len(y) / SR:.1f}s (was {len(x) / SR:.1f}s)")
