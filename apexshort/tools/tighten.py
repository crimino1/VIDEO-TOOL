"""Cut long pauses from assets/vo_raw.mp3 -> assets/vo.wav. Pause kept: 0.15 s; 0.3 s at section turns; 0.42 s before the verdict lines."""
import json, subprocess, sys, numpy as np, soundfile as sf, os
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
tmp = os.path.join(H, "assets", "vo_raw.wav")
subprocess.run([FF, "-v", "error", "-y", "-i", os.path.join(H, "assets", "vo_raw.mp3"), "-ac", "1", "-ar", "48000", tmp], check=True)
x, sr = sf.read(tmp)
hop = sr // 100
rms = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2) + 1e-12) for i in range(0, len(x) - hop, hop)])
db = 20 * np.log10(rms); quiet = db < db.max() - 38
TURN = [5.7, 14.8, 22.4, 32.4, 38.4, 53.3]          # starts of section-turn words
VERDICT = [13.2, 21.0, 31.2, 36.7, 49.2, 50.2, 51.5]  # starts of the verdict lines
keep_for = lambda nxt: 0.42 if any(abs(nxt - v) < 0.35 for v in VERDICT) else 0.3 if any(abs(nxt - v) < 0.35 for v in TURN) else 0.15
segs, i, n = [], 0, len(quiet)
while i < n:
    if quiet[i]:
        j = i
        while j < n and quiet[j]: j += 1
        a, b = i / 100, j / 100
        if b - a > 0.2 and i > 0 and j < n: segs.append((a, b))
        i = j
    else: i += 1
out, pos, fade = [], 0, int(0.012 * sr)
for a, b in segs:
    k = keep_for(b)
    if b - a <= k: continue
    cut0, cut1 = a + k / 2, b - k / 2
    out.append(x[int(pos * sr):int(cut0 * sr)]); pos = cut1
out.append(x[int(pos * sr):])
y = out[0]
for seg in out[1:]:   # 12 ms crossfades
    r = np.linspace(0, 1, fade); y = np.concatenate([y[:-fade], y[-fade:] * (1 - r) + seg[:fade] * r, seg[fade:]])
sf.write(os.path.join(H, "assets", "vo.wav"), y, sr)
print(f"{len(x) / sr:.2f}s -> {len(y) / sr:.2f}s, {len(segs)} pauses")
