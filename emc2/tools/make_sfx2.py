"""Documentary sound design for the Black Holes film, made from scratch (no licence questions). Writes assets/sfx/sd_*.wav (48 kHz stereo).
Everything is soft-attack and sits under a voice."""
import os
import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sfx")
rng = np.random.default_rng(23)


def t_(d): return np.arange(int(d * SR)) / SR
def lp(x, f, o=4): return signal.sosfilt(signal.butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, f1, f2, o=2): return signal.sosfilt(signal.butter(o, [f1, f2], "band", fs=SR, output="sos"), x)
def noise(d): return rng.standard_normal(int(round(d * SR)))
def pink(d):
    w = noise(d); b, a = [0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400]
    return signal.lfilter(b, a, w)


def env(n, a, r):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na) ** 2
    if nr: e[-nr:] = np.linspace(1, 0, nr) ** 2
    return e


def save(name, x, peak=0.85, width=0.35, mono=False):
    if x.ndim == 1:
        if mono:
            x = np.stack([x, x], 1)
        else:
            d = int(0.013 * SR); r = np.concatenate([np.zeros(d), x[:-d]])
            x = np.stack([x * (1 - width / 2) + r * width / 2, r * (1 - width / 2) + x * width / 2], 1)
    x = x / (np.abs(x).max() + 1e-9) * peak
    sf.write(os.path.join(OUT, "sd_" + name + ".wav"), x.astype(np.float32), SR)
    print(name, f"{len(x) / SR:.1f}s")


# ---- beds (loopable-ish, long) ----
d = 60; t = t_(d)
drone = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * a * (0.6 + 0.4 * np.sin(2 * np.pi * m * t)) for f, a, m in [(55, 1, 0.031), (82.4, 0.6, 0.047), (110, 0.35, 0.023), (164.8, 0.18, 0.061)])
drone += lp(pink(d), 400) * 0.25
save("drone", lp(drone, 900) * env(len(t), 2, 2))
save("wind", bp(pink(40), 150, 1800) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t_(40))) * env(int(40 * SR), 1.5, 1.5))
w = pink(40); save("water", (lp(w, 3500) + 0.5 * bp(rng.standard_normal(int(40 * SR)), 2000, 7000)) * env(len(w), 1, 1))
x = lp(pink(30), 1200) * 0.5
for k in range(260):
    s = int(rng.uniform(0, 29.9) * SR); n = int(rng.uniform(0.002, 0.012) * SR)
    x[s:s + n] += hp(rng.standard_normal(n), 1500) * rng.uniform(0.3, 1.2)
save("fire", x * env(len(x), 0.8, 0.8))
t = t_(30); cr = np.zeros(len(t))
for k in range(9):
    f = rng.uniform(3800, 5200); ph = rng.uniform(0, 1); rate = rng.uniform(1.6, 2.6)
    gate = (np.sin(2 * np.pi * rate * t + ph * 6) > 0.6).astype(float) * (np.sin(2 * np.pi * 28 * t) > 0)
    cr += np.sin(2 * np.pi * f * t) * lp(gate, 200) * rng.uniform(0.2, 0.5)
save("crickets", cr * env(len(t), 1, 1) + lp(pink(30), 600) * 0.05)
save("sea", lp(pink(30), 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.12 * t_(30)) ** 2) * env(int(30 * SR), 1, 1))
t = t_(20); save("sunroar", lp(pink(20), 220) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.2 * t)) * env(len(t), 1, 1.5))
t = t_(12); save("cabin", (lp(pink(12), 300) + 0.15 * np.sin(2 * np.pi * 118 * t)) * env(len(t), 0.5, 0.5))
t = t_(14); save("rocket", (lp(pink(14), 900) * 1.0 + 0.4 * bp(rng.standard_normal(int(14 * SR)), 60, 160)) * np.minimum(1, t / 1.2) * env(len(t), 0.05, 3))

# ---- one-shots ----
t = t_(1.2); x = np.zeros(len(t))
for k in range(5):
    s = int(rng.uniform(0, 0.8) * SR); n = int(rng.uniform(0.05, 0.2) * SR)
    x[s:s + n] += bp(rng.standard_normal(n), 800, 6000) * np.hanning(n) * rng.uniform(0.4, 1)
save("paper", x)
t = t_(4.0); x = bp(rng.standard_normal(int(4.0 * SR)), 2500, 9000) * 0.6
gate = np.clip(np.sin(2 * np.pi * 3.1 * t) * 0.5 + 0.5 + 0.3 * np.sin(2 * np.pi * 7.3 * t), 0, 1) ** 2
save("pen", x * lp(gate, 30) * env(len(t), 0.2, 0.4))
t = t_(0.35); x = bp(rng.standard_normal(len(t)), 1500, 8000) * np.exp(-t / 0.02); m = len(t) - int(0.12 * SR); x[int(0.12 * SR):] += bp(rng.standard_normal(m), 1200, 6000) * np.exp(-t[:m] / 0.03)
save("shutter", x, peak=0.7)
t = t_(7); bell = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / dd) for f, a, dd in [(392, 1, 3.5), (783, 0.5, 2.2), (1046, 0.25, 1.6), (196, 0.4, 4.0), (1567, 0.12, 1.0)])
save("bell", lp(bell, 4000) * env(len(t), 0.005, 1.5), peak=0.6)
t = t_(4.5); horn = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(98, 1), (196, 0.5), (147, 0.4), (294, 0.15)]) * np.minimum(1, t / 0.3) * env(len(t), 0.02, 1.2)
save("horn", lp(horn, 1200), peak=0.6)
t = t_(12); x = np.zeros(len(t))
for k in range(int(12 / 1.337) + 1):
    s = int(k * 1.337 * SR); n = int(0.035 * SR)
    if s + n < len(t): x[s:s + n] += bp(rng.standard_normal(n), 300, 2500) * np.hanning(n)
save("pulsar", x + bp(rng.standard_normal(int(12 * SR)), 400, 3000) * 0.04)
t = t_(1.0); f = 40 + 260 * (t / 1.0) ** 6; ph = np.cumsum(2 * np.pi * f / SR); amp = np.clip((t / 0.95) ** 3, 0, 1) * (t < 0.97)
save("chirp", np.sin(ph) * amp * env(len(t), 0.01, 0.03), peak=0.75, mono=True)
t = t_(6.5); tc = 3.0; fr = np.where(t < tc, 1.25, 0.8) * (1 + 0.04 * np.tanh((t - tc) * 3))
fr = 1.25 - 0.45 * (1 / (1 + np.exp(-(t - tc) * 4)))
ph = np.cumsum(2 * np.pi * 95 * fr / SR)
eng = sum(np.sign(np.sin(ph * k)) / k for k in range(1, 5))
amp = 1 / (1 + ((t - tc) / 0.9) ** 2)
save("motorbike", lp(eng * amp + 0.3 * lp(rng.standard_normal(int(6.5 * SR)), 800) * amp, 2500) * env(len(t), 0.3, 0.6), width=0.6)
t = t_(10.5); rate = 2 + 14 * (t / 10.5) ** 2; ph = np.cumsum(rate / SR)
roll = bp(rng.standard_normal(int(10.5 * SR)), 300, 2500) * (0.6 + 0.4 * np.sin(2 * np.pi * ph)) + 0.25 * np.sin(2 * np.pi * (180 + 500 * (t / 10.5) ** 2) * t) * 0.3
save("coinroll", roll * env(len(t), 0.4, 0.4))
t = t_(5.0); f = 50 + 140 * (t / 5) ** 2; riser = np.sin(np.cumsum(2 * np.pi * f / SR)) * (t / 5) ** 2 + lp(pink(5), 2000) * (t / 5) ** 3 * 0.4
save("riser", riser * env(len(t), 0.5, 0.05))
t = t_(3.0); boom = np.sin(2 * np.pi * (45 * np.exp(-t / 1.5)) * t) * np.exp(-t / 0.9) + lp(rng.standard_normal(int(3.0 * SR)), 200) * np.exp(-t / 0.3) * 0.6
save("boom", boom * env(len(t), 0.003, 0.6))
t = t_(2.5); save("rumble", lp(rng.standard_normal(int(2.5 * SR)), 120) * np.exp(-t / 0.8) * env(len(t), 0.05, 0.5))
t = t_(0.25); save("beep", np.sin(2 * np.pi * 1760 * t) * np.exp(-t / 0.06), peak=0.4)
t = t_(1.6); save("hum", sum(np.sin(2 * np.pi * 120 * k * t) / k for k in range(1, 5)) * env(len(t), 0.4, 0.6), peak=0.5)
t = t_(2.0); save("drive", (bp(rng.standard_normal(int(2.0 * SR)), 2000, 8000) * np.exp(-t / 0.05) * 0.8 + 0.3 * np.sin(2 * np.pi * 7200 * t) * np.minimum(1, t / 0.5) * 0.05 + 0.2 * lp(rng.standard_normal(int(2.0 * SR)), 400) * np.minimum(1, t / 0.6)) * env(len(t), 0.003, 0.4))
t = t_(4.5); f = 150 + 900 * (t / 4.5); save("sweep", np.sin(np.cumsum(2 * np.pi * f / SR)) * np.sin(np.pi * t / 4.5) ** 2 * 0.6)
t = t_(1.2); save("air", bp(rng.standard_normal(int(1.2 * SR)), 200, 3000) * np.sin(np.pi * t / 1.2) ** 2)
