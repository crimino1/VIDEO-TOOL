"""Final sound with no music: voice + real SFX from sfx.json, mixed in numpy, then muxed onto the picture.
Levels (voice = -14 LUFS):
  hits  -> peaks HIT_UNDER dB under the voice peaks, times each cue's weight
  beds  -> ambience loudness BED_UNDER dB under the voice, times weight, 0.6 s fades
  the effects dip DUCK dB while the voice speaks (smooth), so words stay clear and effects are full in the pauses.
Usage: mix_sfx.py <picture.mp4> <out.mp4>"""
import json, os, re, subprocess, sys
import numpy as np
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
SR = 48000
VOICE, HIT_UNDER, BED_UNDER, DUCK = -14.0, 4.0, 17.0, 5.0
END = round(json.load(open(os.path.join(H, "words2.json")))["duration"] * 30) / 30
TMP = os.path.join(H, ".mix"); os.makedirs(TMP, exist_ok=True)


def run(a): subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y"] + a, check=True)


def lufs(p):
    e = subprocess.run([FF, "-hide_banner", "-i", p, "-af", "ebur128=peak=true:framelog=quiet", "-vn", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    return float(re.findall(r"I:\s+([-\d.]+) LUFS", e)[-1]), float(re.findall(r"Peak:\s+([-\d.]+) dBFS", e)[-1])


def load(p):
    raw = subprocess.run([FF, "-v", "error", "-i", p, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


pic, out = sys.argv[1:3]
# 1. voice to -14 LUFS, light compression and limiter (two passes)
vo = os.path.join(TMP, "voice.wav"); vsrc = os.path.join(H, "assets", "audio", "vo.wav")
v_i, _ = lufs(vsrc)
run(["-i", vsrc, "-af", f"aresample={SR},volume={VOICE - v_i + 1:.2f}dB,acompressor=threshold=-18dB:ratio=2.5:attack=8:release=120:makeup=1,alimiter=limit=0.89:attack=4:release=60:level=disabled", "-ac", "2", "-c:a", "pcm_s24le", vo])
v_i, _ = lufs(vo)
vo2 = os.path.join(TMP, "voice2.wav")
run(["-i", vo, "-af", f"volume={VOICE - v_i:.2f}dB,alimiter=limit=0.89:attack=3:release=60:level=disabled", "-c:a", "pcm_s24le", vo2])
v_i, v_p = lufs(vo2); print("voice", v_i, v_p)
V = load(vo2); N = int(END * SR); V = np.pad(V, ((0, max(0, N - len(V))), (0, 0)))[:N]

# 2. effects bus
info = json.load(open(os.path.join(H, "assets", "sfx", "info.json")))
cues = json.load(open(os.path.join(H, "sfx.json")))
cache = {}
fx = np.zeros((N, 2), np.float32)
for t, name, vol, dur, kind in cues:
    if name not in cache:
        x = load(os.path.join(H, "assets", "sfx", name + ".mp3"))
        pk = 20 * np.log10(np.abs(x).max() + 1e-9)
        cache[name] = (x, pk)
    x, pk = cache[name]
    if kind == "hit":
        g = 10 ** (((v_p - HIT_UNDER) - pk) / 20) * vol
        seg = x * g
    else:
        g = 10 ** (((v_i - BED_UNDER) - info[name]["lufs"]) / 20) * vol
        n = int(dur * SR)
        reps = int(np.ceil(n / len(x))) + 1
        seg = np.tile(x, (reps, 1))[:n] * g
        f = min(int(0.6 * SR), n // 3)
        if f > 0:
            ramp = np.linspace(0, 1, f, dtype=np.float32)[:, None]
            seg[:f] *= ramp; seg[-f:] *= ramp[::-1]
    i0 = int(t * SR)
    if i0 >= N: continue
    seg = seg[: N - i0]
    fx[i0:i0 + len(seg)] += seg

# 3. duck the effects under the voice: envelope of the voice, smoothed (attack ~80 ms, release ~600 ms)
env = np.abs(V).mean(axis=1)
hop = 480
e = env[: len(env) // hop * hop].reshape(-1, hop).max(axis=1)
act = (20 * np.log10(e + 1e-9) > v_p - 30).astype(np.float32)
sm = np.zeros_like(act); a_up, a_dn = 1 - np.exp(-1 / 8), 1 - np.exp(-1 / 60)
for k in range(1, len(act)):
    sm[k] = sm[k - 1] + (act[k] - sm[k - 1]) * (a_up if act[k] > sm[k - 1] else a_dn)
gain = 10 ** (-DUCK * sm / 20)
gain = np.repeat(gain, hop)[:N]; gain = np.pad(gain, (0, N - len(gain)), constant_values=1)
fx *= gain[:, None]
# and keep effects at least CLEAR dB under the voice, window by window, while it speaks (smoothed gain, fast down / slow up)
CLEAR = 7.0
w = 1200   # 25 ms
nw = N // w
vr = np.sqrt((V[: nw * w] ** 2).reshape(nw, w, 2).mean(axis=(1, 2))) + 1e-9
fr = np.sqrt((fx[: nw * w] ** 2).reshape(nw, w, 2).mean(axis=(1, 2))) + 1e-9
speaking = 20 * np.log10(vr) > v_p - 32
need = np.where(speaking, np.minimum(1.0, vr * 10 ** (-CLEAR / 20) / fr), 1.0)
# look ahead/behind 100 ms so the dip covers whole syllables
k = 4
need = np.array([need[max(0, i - k): i + k + 1].min() for i in range(nw)])
g2 = np.ones(nw); a_dn2, a_up2 = 1 - np.exp(-1 / 1.5), 1 - np.exp(-1 / 14)
for i in range(1, nw):
    g2[i] = g2[i - 1] + (need[i] - g2[i - 1]) * (a_dn2 if need[i] < g2[i - 1] else a_up2)
g2 = np.repeat(g2, w); g2 = np.pad(g2, (0, N - len(g2)), constant_values=1)
fx *= g2[:, None].astype(np.float32)
# soft-clip the bus so stacked hits never splatter
fx = np.tanh(fx * 1.2) / 1.2
mix = V + fx
fxp = os.path.join(TMP, "fx.wav"); mixp = os.path.join(TMP, "mix_raw.wav")
import soundfile as sf
sf.write(fxp, fx, SR, subtype="PCM_24"); sf.write(mixp, mix, SR, subtype="FLOAT")
print("effects", lufs(fxp))
m_i, _ = lufs(mixp)
fin = os.path.join(TMP, "mix_final.wav")
run(["-i", mixp, "-af", f"volume={VOICE - m_i:.2f}dB,alimiter=limit=0.85:attack=2:release=50:level=disabled", "-c:a", "pcm_s24le", fin])
m_i, _ = lufs(fin)
run(["-i", fin, "-af", f"volume={VOICE - m_i:.2f}dB,alimiter=limit=0.85:attack=2:release=50:level=disabled", "-c:a", "pcm_s24le", fin.replace(".wav", "2.wav")])
fin = fin.replace(".wav", "2.wav")
print("mix", lufs(fin))
run(["-i", pic, "-i", fin, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", "-shortest", out])
print("final", lufs(out))
