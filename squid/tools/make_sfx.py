"""Deep-sea sound effects made from scratch (no licensing questions): writes assets/sfx/*.wav at 48 kHz stereo.
Each one is shaped to sit under a voice: no hard clicks, soft attack, long natural tails."""
import os
import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sfx")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def t_(d): return np.arange(int(d * SR)) / SR


def lp(x, f, o=4): return signal.sosfilt(signal.butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, f1, f2, o=2): return signal.sosfilt(signal.butter(o, [f1, f2], "band", fs=SR, output="sos"), x)


def reverb(x, secs=2.5, mix=0.35, damp=3000):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * secs / 6))
    ir = lp(ir, damp)
    ir /= np.abs(ir).sum() ** 0.5 * 8
    wet = np.zeros(len(x) + n); c = signal.fftconvolve(x, ir)[: len(x) + n]; wet[: len(c)] = c
    dry = np.concatenate([x, np.zeros(n)])
    return dry * (1 - mix) + wet * mix


def stereo(x, width=0.3):
    d = int(0.011 * SR)
    l = x; r = np.concatenate([np.zeros(d), x[:-d]])
    return np.stack([l * (1 - width / 2) + r * width / 2, r * (1 - width / 2) + l * width / 2], 1)


def fade(x, a=0.02, b=0.3):
    n = len(x); e = np.ones(n)
    na, nb = int(a * SR), int(b * SR)
    if na: e[:na] = np.linspace(0, 1, na) ** 2
    if nb: e[-nb:] = np.linspace(1, 0, nb) ** 2
    return x * e


def save(name, x, peak=0.89):
    if x.ndim == 1: x = stereo(x)
    x = x / (np.abs(x).max() + 1e-9) * peak
    sf.write(os.path.join(OUT, name + ".wav"), x.astype(np.float32), SR)
    print(name, f"{len(x) / SR:.1f}s")


# deep water bed: brown noise, very low, slow swells; loops cleanly (crossfaded ends)
d = 64
n = rng.standard_normal(int(d * SR))
brown = np.cumsum(n); brown = hp(brown, 18); brown = lp(brown, 260, 6)
sw = 0.65 + 0.35 * np.sin(2 * np.pi * t_(d) / 16) * np.sin(2 * np.pi * t_(d) / 7.1)
bed = brown * sw
hiss = bp(rng.standard_normal(len(bed)), 900, 2600) * 0.02 * (0.5 + 0.5 * np.sin(2 * np.pi * t_(d) / 9))
x = bed / np.abs(bed).max() + hiss
k = int(4 * SR); x[:k] = x[:k] * np.linspace(0, 1, k) + x[-k:] * np.linspace(1, 0, k); x = x[:-k]
save("deep_bed", stereo(x, 0.6))

# sonar ping: two partials, exponential decay, long underwater tail
tt = t_(0.9)
p = (np.sin(2 * np.pi * 1250 * tt) + 0.3 * np.sin(2 * np.pi * 2500 * tt)) * np.exp(-tt * 9) * (1 - np.exp(-tt * 800))
save("sonar_ping", reverb(p, 3.5, 0.55, 2500))

# hull creak / groan: slow pitch-wandering friction tone with resonances
d = 3.2; tt = t_(d)
f0 = 55 + 25 * np.sin(2 * np.pi * 0.35 * tt) + 12 * np.sin(2 * np.pi * 1.3 * tt)
ph = 2 * np.pi * np.cumsum(f0) / SR
saw = signal.sawtooth(ph) * (0.6 + 0.4 * rng.standard_normal(len(tt)).clip(-1, 1) * 0.3)
grit = (rng.random(len(tt)) < 0.004).astype(float) * rng.standard_normal(len(tt))
x = bp(saw, 70, 900) + lp(grit, 1500) * 2
for fr in (180, 330, 610):
    x += bp(saw, fr * 0.95, fr * 1.05, 2) * 1.5
env = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 1.5
save("hull_creak", reverb(fade(x * env, 0.2, 0.6), 2.2, 0.4, 1800))

# metal stress: deeper, shorter groan
d = 2.0; tt = t_(d)
f0 = 38 + 14 * np.sin(2 * np.pi * 0.6 * tt)
x = bp(signal.sawtooth(2 * np.pi * np.cumsum(f0) / SR), 40, 500)
x += bp(signal.square(2 * np.pi * np.cumsum(f0 * 3.01) / SR), 200, 700) * 0.4
save("hull_groan", reverb(fade(x * np.sin(np.pi * tt / d), 0.3, 0.5), 2.6, 0.45, 1500))

# bubbles: many short rising chirps
d = 2.5; x = np.zeros(int(d * SR))
for _ in range(70):
    s0 = rng.uniform(0, d - 0.15); f = rng.uniform(300, 1400); L = rng.uniform(0.02, 0.07)
    tb = t_(L); ch = np.sin(2 * np.pi * (f * tb + f * 3 * tb ** 2)) * np.exp(-tb * 60)
    i = int(s0 * SR); x[i:i + len(ch)] += ch * rng.uniform(0.2, 1)
save("bubbles", reverb(lp(x, 3000), 1.2, 0.3))

# heartbeat (lub-dub), used under the three hearts
d = 1.0; tt = t_(d); x = np.zeros(len(tt))
for s0, a in ((0.0, 1.0), (0.22, 0.7)):
    tb = t_(0.18); th = np.sin(2 * np.pi * (52 * tb - 40 * tb ** 2)) * np.exp(-tb * 22) * (1 - np.exp(-tb * 300))
    i = int(s0 * SR); x[i:i + len(th)] += th * a
save("heartbeat", lp(x, 200))

# deep boom for chapter cards and reveals
d = 4.0; tt = t_(d)
x = np.sin(2 * np.pi * (34 * tt - 2 * tt ** 2)) * np.exp(-tt * 1.4) * (1 - np.exp(-tt * 60))
x += lp(rng.standard_normal(len(tt)), 120) * np.exp(-tt * 3) * 0.6
save("deep_boom", reverb(x, 4, 0.4, 900))

# low drone swell (tension under the approach / battle), 8 s
d = 8.0; tt = t_(d)
x = sum(np.sin(2 * np.pi * f * tt + rng.uniform(0, 6)) for f in (41.2, 61.7, 82.4, 87.3)) / 4
x += bp(rng.standard_normal(len(tt)), 200, 800) * 0.05
env = (tt / d) ** 2
save("drone_swell", fade(x * env, 0.5, 0.25))

# underwater whoosh: filtered noise sweep with a soft body
d = 1.6; tt = t_(d)
nz = rng.standard_normal(len(tt))
fc = 200 + 1800 * np.sin(np.pi * tt / d) ** 2
x = np.zeros(len(tt)); blk = 512
for i in range(0, len(tt), blk):
    seg = nz[i:i + blk]
    f = fc[i]
    x[i:i + blk] = bp(seg, max(60, f * 0.5), min(20000, f * 1.6), 1)[: len(seg)]
x = lp(x, 2500) * np.sin(np.pi * tt / d) ** 2
save("water_whoosh", reverb(x, 1.5, 0.35))

# tentacle strike: fast water rush + low thump
d = 1.4; tt = t_(d)
rush = lp(rng.standard_normal(len(tt)), 1800) * np.exp(-((tt - 0.25) / 0.12) ** 2)
th = np.sin(2 * np.pi * (60 * tt - 30 * tt ** 2)) * np.exp(-np.maximum(0, tt - 0.3) * 9) * (tt > 0.3)
save("strike", reverb(rush * 0.8 + th, 1.6, 0.3, 1500))

# glow shimmer: soft high glass tones (bioluminescence)
d = 3.0; tt = t_(d); x = np.zeros(len(tt))
for _ in range(14):
    s0 = rng.uniform(0, 2.2); f = rng.choice([1568, 1760, 2093, 2349, 2637])
    tb = t_(0.8); tone = np.sin(2 * np.pi * f * tb) * np.exp(-tb * 5) * (1 - np.exp(-tb * 200))
    i = int(s0 * SR); x[i:i + len(tone)] += tone * rng.uniform(0.2, 0.6)
save("glow_shimmer", reverb(x, 3, 0.6, 6000))
