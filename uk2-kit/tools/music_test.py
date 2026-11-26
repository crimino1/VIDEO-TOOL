"""Tests every candidate track against this film, since I can't listen.
For each track: loudness and range, how bright it is, how busy it is (note onsets per second), how much it fills
the speech band (1-4 kHz) when mixed at our level under the voice, and its sudden swells. Writes sheets/music_test.md."""
import os, glob, subprocess, json
import numpy as np, soundfile as sf
from scipy import signal
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
SR = 16000


def load(p, ss=0, d=None):
    args = [FF, "-hide_banner", "-loglevel", "error", "-ss", str(ss)] + (["-t", str(d)] if d else []) + ["-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(args, capture_output=True).stdout, dtype=np.float32)


def band(x, lo, hi):
    return signal.sosfilt(signal.butter(4, [lo, hi], "band", fs=SR, output="sos"), x)


def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)


voice = load(os.path.join(H, "assets", "vo.mp3"), 60, 120)
v_sp = rms_db(band(voice, 1000, 4000)); v_all = rms_db(voice)
rows = []
for p in sorted(glob.glob(os.path.join(H, "assets", "music", "*.mp3"))):
    x = load(p)
    if len(x) < SR * 30: continue
    dur = len(x) / SR
    # loudness contour in 3 s windows
    win = SR * 3; env = np.array([rms_db(x[i:i + win]) for i in range(0, len(x) - win, win)])
    env = env[env > -60]
    spread = float(np.percentile(env, 95) - np.percentile(env, 10)) if len(env) else 0
    jumps = float(np.max(np.diff(env))) if len(env) > 2 else 0
    f, t, Z = signal.stft(x, SR, nperseg=1024, noverlap=512)
    mag = np.abs(Z) + 1e-9
    centroid = float(np.sum(f[:, None] * mag, 0).sum() / mag.sum())
    flux = np.maximum(0, np.diff(np.log(mag), axis=1)).sum(0)
    thr = np.median(flux) + 2.5 * np.std(flux)
    peaks, _ = signal.find_peaks(flux, height=thr, distance=6)
    onsets = len(peaks) / dur
    # mixed at our level (music 19 dB under the voice on average): how loud is it in the speech band relative to the voice?
    gain = (v_all - 19) - rms_db(x)
    m_sp = rms_db(band(x, 1000, 4000)) + gain
    rows.append(dict(track=os.path.basename(p)[:-4], minutes=round(dur / 60, 1), centroid=int(centroid), onsets=round(onsets, 2),
                     spread=round(spread, 1), jump=round(jumps, 1), speech_snr=round(v_sp - m_sp, 1)))
# simple fit scores: calm/wonder wants dark, sparse, steady; tension wants a bit more movement but still clear of the voice
for r in rows:
    clear = min(1, max(0, (r["speech_snr"] - 14) / 10))
    dark = min(1, max(0, (1600 - r["centroid"]) / 1000))
    sparse = min(1, max(0, (1.6 - r["onsets"]) / 1.4))
    steady = min(1, max(0, (16 - r["spread"]) / 12)) * min(1, max(0, (9 - r["jump"]) / 6))
    busy = min(1, r["onsets"] / 1.5)
    r["calm_fit"] = round(100 * (0.3 * clear + 0.25 * dark + 0.25 * sparse + 0.2 * steady))
    r["tension_fit"] = round(100 * (0.35 * clear + 0.2 * dark + 0.25 * busy + 0.2 * steady))
rows.sort(key=lambda r: -r["calm_fit"])
L = ["| Track | Min | Brightness Hz | Onsets/s | Swell range dB | Biggest jump dB | Voice clear by dB | Calm fit | Tension fit |", "|---|---|---|---|---|---|---|---|---|"]
for r in rows:
    L.append(f"| {r['track']} | {r['minutes']} | {r['centroid']} | {r['onsets']} | {r['spread']} | {r['jump']} | {r['speech_snr']} | {r['calm_fit']} | {r['tension_fit']} |")
open(os.path.join(H, "sheets", "music_test.md"), "w").write("\n".join(L) + "\n")
json.dump(rows, open(os.path.join(H, "sheets", "music_test.json"), "w"), indent=1)
print("\n".join(L))
