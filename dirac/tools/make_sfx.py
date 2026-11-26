"""Extra sound effects made from scratch (no licence questions): record scratch, spark, ding, snap, shimmer, tick.
Writes assets/sfx/<name>.wav, 48 kHz stereo."""
import os
import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sfx")
rng = np.random.default_rng(11)


def t_(d): return np.arange(int(d * SR)) / SR
def bp(x, f1, f2, o=2): return signal.sosfilt(signal.butter(o, [f1, f2], "band", fs=SR, output="sos"), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "high", fs=SR, output="sos"), x)
def lp(x, f, o=4): return signal.sosfilt(signal.butter(o, f, "low", fs=SR, output="sos"), x)


def env(n, a, d):
    e = np.exp(-np.arange(n) / (d * SR))
    na = max(1, int(a * SR))
    e[:na] *= np.linspace(0, 1, na)
    return e


def save(name, x, peak=0.89, width=0.25):
    dly = int(0.009 * SR)
    r = np.concatenate([np.zeros(dly), x[:-dly]])
    st = np.stack([x * (1 - width / 2) + r * width / 2, r * (1 - width / 2) + x * width / 2], 1)
    st = st / (np.abs(st).max() + 1e-9) * peak
    sf.write(os.path.join(OUT, name + ".wav"), st.astype(np.float32), SR)
    print(name, f"{len(x) / SR:.2f}s")


# record scratch: band noise swept by a fast back-and-forth "platter" motion
t = t_(0.55)
speed = np.concatenate([np.linspace(0.2, 1.6, len(t) // 3), np.linspace(1.6, -0.9, len(t) // 3), np.linspace(-0.9, 0.1, len(t) - 2 * (len(t) // 3))])
phase = np.cumsum(np.abs(speed)) / SR
tone = np.sin(2 * np.pi * 380 * phase * 6) * 0.5 + np.sin(2 * np.pi * 760 * phase * 6) * 0.25
noise = bp(rng.standard_normal(len(t)), 700, 4500)
x = (tone + noise * 0.8) * np.abs(speed) * env(len(t), 0.005, 0.4)
save("scratch", x)

# spark: crackly bursts of high noise
t = t_(0.5)
x = np.zeros(len(t))
for k in range(9):
    s = int(rng.uniform(0, 0.28) * SR)
    n = int(rng.uniform(0.01, 0.05) * SR)
    x[s:s + n] += hp(rng.standard_normal(n), 2500) * rng.uniform(0.4, 1)
x = x * env(len(t), 0.001, 0.25) + bp(rng.standard_normal(len(t)), 3000, 9000) * 0.2 * env(len(t), 0.001, 0.08)
save("spark", x)

# ding: bright bell with soft decay
t = t_(1.8)
x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, a, d in [(1318.5, 1, 0.7), (2637, 0.4, 0.35), (3950, 0.15, 0.2), (659.3, 0.3, 0.9)])
x *= env(len(t), 0.002, 10)
save("ding", x, peak=0.7)

# snap: short crack plus low thump
t = t_(0.35)
x = hp(rng.standard_normal(len(t)), 1500) * env(len(t), 0.0005, 0.025) + np.sin(2 * np.pi * 90 * t) * env(len(t), 0.001, 0.08) * 0.8
save("snap", x)

# shimmer: rising airy glints for a reveal
t = t_(1.4)
x = np.zeros(len(t))
for k in range(14):
    f = 1800 + k * 180
    s = int(k * 0.06 * SR)
    seg = np.sin(2 * np.pi * f * t[: len(t) - s]) * np.exp(-t[: len(t) - s] / 0.3)
    x[s:] += seg * 0.3
x *= env(len(t), 0.05, 0.9)
save("shimmer", x, peak=0.6)

# tick: soft clock tick
t = t_(0.08)
x = bp(rng.standard_normal(len(t)), 2500, 6000) * env(len(t), 0.0005, 0.008)
save("tick", x, peak=0.6)

# hum: electric 100 Hz buzz swell for current turning on
t = t_(1.2)
x = sum(np.sin(2 * np.pi * 100 * k * t) / k for k in range(1, 7)) * (1 - np.exp(-t / 0.15)) * np.exp(-np.maximum(t - 0.6, 0) / 0.25)
save("hum", lp(x, 2000), peak=0.5)
