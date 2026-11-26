"""Sound mix v2: polished voice + documentary sound design (tools/sounddesign.py), beds ducked under the voice; optional music bed.
Usage: mix2.py <renders/list.txt | picture.mp4> <out.mp4> [--music] [--range START END]   (range = film seconds, for samples)"""
import os, re, subprocess, sys
import numpy as np
import soundfile as sf
from scipy import signal

H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, H); sys.path.insert(0, os.path.dirname(__file__))
from shots import FILM_END as END
from sounddesign import BEDS, HITS
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
SR = 48000
args = sys.argv[1:]
pic, out = args[0], args[1]
music = "--music" in args
rng_ = None
if "--range" in args:
    i = args.index("--range"); rng_ = (float(args[i + 1]), float(args[i + 2]))
TMP = os.path.join(H, ".mix"); os.makedirs(TMP, exist_ok=True)
MUSIC = os.path.join(H, "..", "space", "ep1", "assets", "music")


def run(a): subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y"] + a, check=True)


def lufs(p):
    e = subprocess.run([FF, "-hide_banner", "-i", p, "-af", "ebur128=peak=true:framelog=quiet", "-vn", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    return float(re.findall(r"I:\s+([-\d.]+) LUFS", e)[-1]), float(re.findall(r"Peak:\s+([-\d.]+) dBFS", e)[-1])


def load(path):
    w = os.path.join(TMP, "x_" + os.path.basename(path) + ".wav")
    if not os.path.exists(w):
        run(["-i", path, "-ac", "2", "-ar", str(SR), "-c:a", "pcm_f32le", w])
    x, _ = sf.read(w, dtype="float32")
    return x


def sfx(name):
    for e in (".wav", ".mp3"):
        p = os.path.join(H, "assets", "sfx", name + e)
        if os.path.exists(p): return load(p)
    raise SystemExit("missing sfx " + name)


N = int(END * SR) + SR
# 1) voice: gentle, measurable polish (no fake top end)
vw = os.path.join(TMP, "voice.wav")
run(["-i", os.path.join(H, "assets", "vo.mp3"), "-af", "highpass=f=70,equalizer=f=300:t=q:w=1:g=-1.5,equalizer=f=3500:t=q:w=1.2:g=1.5,deesser=i=0.35,"
     "acompressor=threshold=-22dB:ratio=1.8:attack=15:release=180:makeup=1", "-ac", "2", "-ar", str(SR), "-c:a", "pcm_f32le", vw])
voice, _ = sf.read(vw, dtype="float32")
V = np.zeros((N, 2), np.float32); V[:min(N, len(voice))] = voice[:N]
# voice envelope for ducking (0 = silence, 1 = speaking)
mono = np.abs(V).mean(1)
envv = signal.sosfiltfilt(signal.butter(2, 3, "low", fs=SR, output="sos"), mono)
speak = np.clip((20 * np.log10(np.maximum(envv, 1e-6)) + 46) / 12, 0, 1).astype(np.float32)
speak = np.clip(signal.sosfiltfilt(signal.butter(1, 1.5, "low", fs=SR, output="sos"), speak), 0, 1).astype(np.float32)

B = np.zeros((N, 2), np.float32)  # beds (ducked)
X = np.zeros((N, 2), np.float32)  # hits
for t0, t1, name, g in BEDS:
    x = sfx(name); a, b = int(t0 * SR), min(N, int(t1 * SR)); n = b - a
    if n <= 0: continue
    reps = int(np.ceil(n / len(x)))
    seg = np.concatenate([x] * reps)[:n] if reps > 1 else x[:n]
    f = min(int(0.8 * SR), n // 3); e = np.ones(n, np.float32); e[:f] = np.linspace(0, 1, f); e[-f:] = np.linspace(1, 0, f)
    B[a:b] += seg * (g * e)[:, None]
for t, name, g in HITS:
    x = sfx(name); a = int(t * SR); b = min(N, a + len(x))
    X[a:b] += x[:b - a] * g
duck = (1 - 0.6 * speak)[:, None]  # about -8 dB under speech
mix = V + B * duck + X * (1 - 0.3 * speak)[:, None]
if music:
    plan = [(0.0, "Long Note Two"), (360.0, "Night Vigil"), (720.0, "Long Note Three"), (1080.0, "Lightless Dawn"), (1300.0, "Long Note Four")]
    M = np.zeros((N, 2), np.float32)
    for k, (t0, name) in enumerate(plan):
        t1 = plan[k + 1][0] + 3 if k + 1 < len(plan) else END
        x = load(os.path.join(MUSIC, name + ".mp3")); a, b = int(t0 * SR), min(N, int(t1 * SR)); n = b - a
        seg = np.concatenate([x] * int(np.ceil(n / len(x))))[:n]
        f = int(3 * SR); e = np.ones(n, np.float32); e[:f] = np.linspace(0, 1, f); e[-f:] = np.linspace(1, 0, f)
        M[a:b] += seg * e[:, None]
    M *= 0.045 / (np.sqrt((M ** 2).mean()) + 1e-9)  # quiet bed, about 18 dB under the mix
    mix += M * (1 - 0.7 * speak)[:, None]
if rng_:
    mix = mix[int(rng_[0] * SR):int(rng_[1] * SR)]
else:
    mix = mix[:int(END * SR)]
raw = os.path.join(TMP, "mix2_raw.wav"); sf.write(raw, mix, SR, subtype="FLOAT")
i0, p0 = lufs(raw)
fin = os.path.join(TMP, "mix2.flac")
run(["-i", raw, "-af", f"volume={-14.0 - i0:.2f}dB,alimiter=limit=0.8:attack=2:release=60:level=disabled", "-c:a", "flac", fin])
print("mix", lufs(fin))
vin = (["-f", "concat", "-safe", "0", "-i", pic] if pic.endswith(".txt") else ["-i", pic])
if rng_:
    vin = (["-f", "concat", "-safe", "0", "-ss", f"{rng_[0]}", "-t", f"{rng_[1] - rng_[0]}", "-i", pic] if pic.endswith(".txt") else ["-ss", f"{rng_[0]}", "-t", f"{rng_[1] - rng_[0]}", "-i", pic])
    run(vin + ["-i", fin, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "20", "-preset", "fast", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", "-shortest", out])
else:
    run(vin + ["-i", fin, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", "-shortest", out])
print("final", lufs(out))
for f in (raw, fin):
    os.remove(f)
