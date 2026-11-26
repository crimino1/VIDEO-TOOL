"""Several different takes of each sound family, so no effect is heard twice in a row.
Writes assets/sfx/<family>_<n>.wav. Families: swell (transition), boom, drone, bubbles, sonar, thud, wave."""
import os
import numpy as np, soundfile as sf
from scipy import signal
SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sfx")


def t_(d): return np.arange(int(d * SR)) / SR
def lp(x, f, o=4): return signal.sosfilt(signal.butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, f1, f2, o=2): return signal.sosfilt(signal.butter(o, [f1, f2], "band", fs=SR, output="sos"), x)


def reverb(x, rng, secs=2.0, mix=0.3, damp=3000):
    n = int(secs * SR)
    ir = lp(rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * secs / 6)), damp)
    ir /= np.abs(ir).sum() ** 0.5 * 8
    wet = np.zeros(len(x) + n); c = signal.fftconvolve(x, ir)[: len(x) + n]; wet[: len(c)] = c
    return np.concatenate([x, np.zeros(n)]) * (1 - mix) + wet * mix


def save(name, x, width=0.4):
    d = int(0.012 * SR)
    st = np.stack([x, np.concatenate([np.zeros(d), x[:-d]]) * (1 - width) + x * width], 1)
    st = st / (np.abs(st).max() + 1e-9) * 0.89
    sf.write(os.path.join(OUT, name + ".wav"), st.astype(np.float32), SR)
    print(name, f"{len(x) / SR:.1f}s")


def sweep(rng, d, f0, f1, q=1.6, shape=2.0):
    """Noise through a moving band: f0 -> peak -> f1."""
    tt = t_(d); nz = rng.standard_normal(len(tt)); out = np.zeros(len(tt)); blk = 1024
    for i in range(0, len(tt), blk):
        u = i / len(tt); f = f0 + (f1 - f0) * u if f1 else f0 * (1 + np.sin(np.pi * u))
        seg = nz[max(0, i - 2048): i + blk]
        y = bp(seg, max(40, f / q), min(20000, f * q), 2)
        out[i:i + blk] = y[-len(nz[i:i + blk]):]
    return out * np.sin(np.pi * np.clip(tt / d, 0, 1)) ** shape


# swells: six different transition textures
specs = [(1.8, 150, 1400, 1.8, 2.0, 0.25), (2.4, 90, 700, 1.5, 1.6, 0.4), (1.4, 400, 2600, 2.0, 2.4, 0.2),
         (2.8, 60, 400, 1.4, 1.2, 0.5), (2.0, 1800, 300, 1.7, 2.0, 0.3), (1.6, 250, 0, 1.6, 2.2, 0.35)]
for k, (d, f0, f1, q, sh, mx) in enumerate(specs):
    rng = np.random.default_rng(100 + k)
    x = sweep(rng, d, f0, f1, q, sh)
    if k in (1, 3):    # add a few bubbles to the deeper ones
        tt = t_(d)
        for _ in range(25):
            s0 = rng.uniform(0.2, d - 0.2); f = rng.uniform(300, 1100); L = rng.uniform(0.02, 0.06)
            tb = t_(L); ch = np.sin(2 * np.pi * (f * tb + f * 3 * tb ** 2)) * np.exp(-tb * 60); i = int(s0 * SR)
            x[i:i + len(ch)] += ch * 0.15
    save(f"swell_{k + 1}", reverb(lp(x, 4000), rng, 1.5, mx))

# booms: four pitches and decays
for k, (f, dec, rumble) in enumerate([(34, 1.4, 0.6), (28, 1.0, 0.9), (42, 1.9, 0.4), (24, 0.8, 1.1)]):
    rng = np.random.default_rng(200 + k); tt = t_(4.0)
    x = np.sin(2 * np.pi * (f * tt - 1.5 * tt ** 2)) * np.exp(-tt * dec) * (1 - np.exp(-tt * 50))
    x += lp(rng.standard_normal(len(tt)), 140) * np.exp(-tt * 2.5) * rumble
    save(f"boom_{k + 1}", reverb(x, rng, 3.5, 0.4, 900))

# low drones that swell up
for k, chord in enumerate([(41.2, 61.7, 82.4), (36.7, 55.0, 73.4, 77.8), (49.0, 73.4, 98.0)]):
    rng = np.random.default_rng(300 + k); d = 7.0; tt = t_(d)
    x = sum(np.sin(2 * np.pi * f * tt + rng.uniform(0, 6)) * (1 + 0.2 * np.sin(2 * np.pi * 0.2 * tt + i)) for i, f in enumerate(chord)) / len(chord)
    x += bp(rng.standard_normal(len(tt)), 150, 700) * 0.04
    save(f"drone_{k + 1}", x * (tt / d) ** 1.8 * np.minimum(1, (d - tt) / 0.3))

# bubble streams
for k in range(3):
    rng = np.random.default_rng(400 + k); d = 2.0 + k * 0.6; x = np.zeros(int(d * SR))
    for _ in range(50 + 30 * k):
        s0 = rng.uniform(0, d - 0.12); f = rng.uniform(250 + 100 * k, 1300); L = rng.uniform(0.02, 0.08)
        tb = t_(L); ch = np.sin(2 * np.pi * (f * tb + f * 2.5 * tb ** 2)) * np.exp(-tb * 55); i = int(s0 * SR)
        x[i:i + len(ch)] += ch * rng.uniform(0.2, 1)
    save(f"bubbles_{k + 1}", reverb(lp(x, 3200), rng, 1.2, 0.3))

# sonar pings at three pitches
for k, f in enumerate([1250, 950, 1600]):
    rng = np.random.default_rng(500 + k); tt = t_(0.9)
    p = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt * 9) * (1 - np.exp(-tt * 800))
    save(f"sonar_{k + 1}", reverb(p, rng, 3.5, 0.55, 2500))

# body thuds for rams and impacts
for k, (f, d) in enumerate([(55, 1.2), (70, 0.9), (45, 1.5)]):
    rng = np.random.default_rng(600 + k); tt = t_(d)
    x = np.sin(2 * np.pi * (f * tt - 25 * tt ** 2)) * np.exp(-tt * 7) + lp(rng.standard_normal(len(tt)), 900) * np.exp(-tt * 14) * 0.7
    save(f"thud_{k + 1}", reverb(x, rng, 2.0, 0.35, 1500))

# breaking wave / wash
rng = np.random.default_rng(700); d = 3.5; tt = t_(d)
x = lp(rng.standard_normal(len(tt)), 2500) * np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 0.8 * (0.6 + 0.4 * np.sin(2 * np.pi * 1.3 * tt))
save("wave_1", reverb(x, rng, 1.5, 0.25))
