"""Studies a reference's sound from measurements: is music present, how loud under the voice, and where short non-speech sound events fall relative to picture cuts."""
import json, os, re, subprocess, sys, tempfile
import numpy as np
from scipy.io import wavfile
from scipy.signal import stft
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
FF = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe"
R = r"C:\Users\daggu222105\VIDEO-TOOL\style-refs\ai-equator"
D = r"C:\Users\daggu222105\Downloads"
REFS = {
    "bubble": "vidssave.com Did the AI bubble just pop_ 720P.mp4",
    "theorycs": "vidssave.com The one thing holding theoretical CS together just broke... kinda 720P.mp4",
    "ainews": "vidssave.com AI finally sleeps, Gemini 4 Carbon, ETH cracked, energy-based models, Anthropic IPO_ AI NEWS 360P.mp4",
}
for name, f in REFS.items():
    wav = os.path.join(tempfile.gettempdir(), name + ".wav")
    subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-i", os.path.join(D, f), "-ac", "1", "-ar", "22050", wav], check=True)
    sr, x = wavfile.read(wav)
    x = x.astype(np.float32) / 32768
    words = json.load(open(os.path.join(R, name + ".words.json"), encoding="utf-8"))["words"]
    an = json.load(open(os.path.join(R, name, "analysis.json"), encoding="utf-8"))
    cuts = np.array(an.get("cuts") or an.get("cut_times") or [])
    dur = len(x) / sr
    wps = len(words) / dur
    db = lambda a: 20 * np.log10(np.sqrt(np.mean(a * a)) + 1e-9)
    speech = np.concatenate([x[int(w["start"] * sr):int(w["end"] * sr)] for w in words if w["end"] - w["start"] > 0.1])
    gaps = [(a["end"] + 0.06, b["start"] - 0.06) for a, b in zip(words, words[1:]) if b["start"] - a["end"] > 0.28]
    glev = np.array([db(x[int(s * sr):int(e * sr)]) for s, e in gaps])
    print(f"\n== {name}: {dur:.0f}s, {wps * 60:.0f} words/min, speech {db(speech):.1f} dB")
    print(f"   gaps >0.28s: {len(gaps)}; level in gaps p10/p50/p90: {np.percentile(glev, 10):.1f} / {np.percentile(glev, 50):.1f} / {np.percentile(glev, 90):.1f} dB")
    # fraction of gaps close to digital silence says music on or off
    print(f"   gaps quieter than -55 dB: {np.mean(glev < -55):.0%} (near silence = no music there)")
    # the quiet gaps over time: music in or out by minute
    t = np.array([g[0] for g in gaps])
    mins = [f"{np.median(glev[(t >= m) & (t < m + 60)]):.0f}" if ((t >= m) & (t < m + 60)).any() else "." for m in range(0, min(int(dur) // 60 + 1, 12))]
    print("   median gap level by minute:", " ".join(mins))
    # transient events: sharp broadband rise while nobody is mid-word, or big jumps over the voice
    fr, tt, Z = stft(x, sr, nperseg=1024, noverlap=768)
    mag = np.abs(Z)
    flux = np.maximum(np.diff(np.log1p(mag * 40), axis=1), 0).sum(0)
    tf = tt[1:]
    thr = np.median(flux) + 5 * (np.percentile(flux, 75) - np.percentile(flux, 25))
    idx = []
    for i in np.where(flux > thr)[0]:
        if not idx or tf[i] - tf[idx[-1]] > 0.18:
            idx.append(i)
    ev = tf[idx]
    print(f"   sharp sound events: {len(ev)} ({len(ev) / dur * 60:.0f}/min)")
    if len(cuts):
        near = np.array([np.abs(cuts - e).min() < 0.12 for e in ev])
        c_near = np.array([np.abs(ev - c).min() < 0.12 for c in cuts]) if len(ev) else np.array([])
        print(f"   of {len(cuts)} picture cuts, {c_near.mean():.0%} have a sharp sound within 0.12 s; of the sounds, {near.mean():.0%} sit on a cut")
    # classify events by spectrum over the 0.25 s after onset
    kinds = {"low thump (<200 Hz)": 0, "mid pop/click (200 Hz-3 kHz)": 0, "bright hiss/whoosh (>3 kHz)": 0}
    for e in ev:
        a = x[int(e * sr):int((e + 0.25) * sr)]
        if len(a) < 512:
            continue
        S = np.abs(np.fft.rfft(a * np.hanning(len(a)))) ** 2
        fq = np.fft.rfftfreq(len(a), 1 / sr)
        lo, mi, hi = S[fq < 200].sum(), S[(fq >= 200) & (fq < 3000)].sum(), S[fq >= 3000].sum()
        # voice dominates mid, so only count bright or low when clearly strong
        if hi > 0.35 * (lo + mi + hi):
            kinds["bright hiss/whoosh (>3 kHz)"] += 1
        elif lo > 0.5 * (lo + mi + hi):
            kinds["low thump (<200 Hz)"] += 1
        else:
            kinds["mid pop/click (200 Hz-3 kHz)"] += 1
    print("   event types:", kinds)
    print("   first events (s):", " ".join(f"{e:.1f}" for e in ev[:30]))
    print("   first cuts   (s):", " ".join(f"{c:.1f}" for c in cuts[:24]))
    os.remove(wav)
