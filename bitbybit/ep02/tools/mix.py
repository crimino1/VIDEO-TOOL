"""Final sound: voice -> -14 LUFS, Pixabay music per section ducked under the voice, Pixabay SFX from sfx.json.
Usage: mix.py <picture.mp4> <out.mp4>"""
import json, math, os, re, subprocess, sys
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
END = 545.72
VOICE, MUSIC_UNDER, SFX_UNDER, SFX_LOUD_UNDER = -14.0, 18.0, 16.0, 16.0   # EP2: SFX peaks 16 dB under voice peaks AND loudness 16 dB under voice (user: EP1 SFX too loud)
M, SFXD = os.path.join(H, "assets", "music"), os.path.join(H, "assets", "sfx")
# (start, track, offset into track)
PLAN = [(0.0, "tutorial_explainer", 0.0), (179.51, "digital_technology", 0.0), (322.45, "corporate_explainer", 0.0), (448.67, "think_bright", 0.0)]
TMP = os.path.join(H, ".mix"); os.makedirs(TMP, exist_ok=True)
FAM = {}
for f in sorted(os.listdir(SFXD)):
    m = re.match(r"([a-z]+)_(\d+)\.mp3$", f)
    if m: FAM.setdefault(m.group(1), []).append(f)


def run(a): subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y"] + a, check=True)


def lufs(p):
    e = subprocess.run([FF, "-hide_banner", "-i", p, "-af", "ebur128=peak=true:framelog=quiet", "-vn", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    return float(re.findall(r"I:\s+([-\d.]+) LUFS", e)[-1]), float(re.findall(r"Peak:\s+([-\d.]+) dBFS", e)[-1])


pic, out = sys.argv[1:3]
src_vo = os.path.join(H, "public", "vo.mp3")
v_i, _ = lufs(src_vo)
vo = os.path.join(TMP, "voice.wav")
run(["-i", src_vo, "-af", f"aresample=48000,volume={VOICE - v_i + 1:.2f}dB,acompressor=threshold=-18dB:ratio=2.5:attack=8:release=120:makeup=1,alimiter=limit=0.89:attack=4:release=60:level=disabled",
     "-ac", "2", "-c:a", "pcm_s24le", vo])
v_i, _ = lufs(vo)
vo2 = os.path.join(TMP, "voice2.wav")
run(["-i", vo, "-af", f"volume={VOICE - v_i:.2f}dB,alimiter=limit=0.89:attack=3:release=60:level=disabled", "-c:a", "pcm_s24le", vo2])
vo = vo2; v_i, v_p = lufs(vo); print("voice", v_i, v_p)

MUSIC = False   # user 2026-11-13: no background music (voice + effects only)
if MUSIC:
    segs = []
    for k, (t0, name, ss) in enumerate(PLAN):
        t1 = PLAN[k + 1][0] if k + 1 < len(PLAN) else END
        lead = 1.5 if k else 0.0                      # crossfade overlap into the previous section
        d = t1 - t0 + lead
        p = os.path.join(TMP, f"m{k}.wav"); src = os.path.join(M, name + ".mp3")
        m_i, _ = lufs(src)
        run(["-stream_loop", "-1", "-ss", f"{ss}", "-t", f"{d + 3}", "-i", src, "-af",
             f"aresample=48000,volume={(v_i - MUSIC_UNDER) - m_i:.2f}dB,afade=t=in:d={2.5 if k else 0.4},afade=t=out:st={d}:d=3,adelay={int(max(0, t0 - lead) * 1000)}:all=1",
             "-ac", "2", "-c:a", "pcm_s24le", p])
        segs.append(p)
    raw = os.path.join(TMP, "music_raw.wav")
    run(sum([["-i", p] for p in segs], []) + ["-filter_complex", "".join(f"[{i}:a]" for i in range(len(segs))) + f"amix=inputs={len(segs)}:normalize=0:duration=longest,atrim=0:{END}[m]", "-map", "[m]", "-c:a", "pcm_s24le", raw])
    mus = os.path.join(TMP, "music.wav")
    run(["-i", raw, "-i", vo, "-filter_complex", "[0:a][1:a]sidechaincompress=threshold=0.03:ratio=2.5:attack=60:release=700:knee=6:makeup=1[d]", "-map", "[d]", "-c:a", "pcm_s24le", mus])
    print("music", lufs(mus))

# effects: rotate takes per family, drop repeats closer than 0.25 s in the same family
cues, last, cnt = [], {}, {}
for cue in json.load(open(os.path.join(H, "sfx.json"))):
    t, name, vol = cue[:3]; dur = cue[3] if len(cue) > 3 else 4.0
    if name not in FAM: print("no sfx family", name); continue
    if t - last.get(name, -99) < 0.25: continue
    last[name] = t; cnt[name] = cnt.get(name, -1) + 1
    cues.append((t, FAM[name][cnt[name] % len(FAM[name])], vol, dur))
norm, args, fc, labels = {}, [], [], []
for i, (t, f, vol, dur) in enumerate(cues):
    if f not in norm:
        li, lp = lufs(os.path.join(SFXD, f))
        norm[f] = min((v_p - SFX_UNDER) - lp, (v_i - SFX_LOUD_UNDER) - li)   # quieter of: peak rule, loudness rule
    args += ["-i", os.path.join(SFXD, f)]
    fc.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{dur:.2f},afade=t=out:st={max(0, dur - 0.4):.2f}:d=0.4,volume={norm[f] + 20 * math.log10(vol):.2f}dB,adelay={int(max(0, t) * 1000)}:all=1[f{i}]")
    labels.append(f"[f{i}]")
fx = os.path.join(TMP, "fx.wav")
# amix in chunks (ffmpeg has input limits per graph)
chunks = []
for c in range(0, len(cues), 60):
    part = os.path.join(TMP, f"fx{c}.wav")
    idx = range(c, min(c + 60, len(cues)))
    a2 = sum([["-i", os.path.join(SFXD, cues[i][1])] for i in idx], [])
    f2 = [fc[i].replace(f"[{i}:a]", f"[{j}:a]").replace(f"[f{i}]", f"[g{j}]") for j, i in enumerate(idx)]
    run(a2 + ["-filter_complex", ";".join(f2) + ";" + "".join(f"[g{j}]" for j in range(len(idx))) + f"amix=inputs={len(idx)}:normalize=0:duration=longest,apad,atrim=0:{END}[x]", "-map", "[x]", "-c:a", "pcm_s24le", part])
    chunks.append(part)
run(sum([["-i", p] for p in chunks], []) + ["-filter_complex", "".join(f"[{i}:a]" for i in range(len(chunks))) + f"amix=inputs={len(chunks)}:normalize=0:duration=longest,atrim=0:{END}[x]", "-map", "[x]", "-c:a", "pcm_s24le", fx])
print("effects", len(cues))

mix = os.path.join(TMP, "mix.wav")
ins = ["-i", vo, "-i", fx] + (["-i", mus] if MUSIC else [])
run(ins + ["-filter_complex", "".join(f"[{i}:a]" for i in range(len(ins) // 2)) + f"amix=inputs={len(ins) // 2}:normalize=0:duration=first,atrim=0:{END},alimiter=limit=0.89:attack=3:release=50:level=disabled[o]",
     "-map", "[o]", "-c:a", "pcm_s24le", "-ar", "48000", mix])
m_i, _ = lufs(mix)
mix2 = os.path.join(TMP, "mix2.wav")
run(["-i", mix, "-af", f"volume={-14.0 - m_i:.2f}dB,alimiter=limit=0.84:attack=2:release=50:level=disabled", "-c:a", "pcm_s24le", mix2])
print("mix", lufs(mix2))
run(["-i", pic, "-i", mix2, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", "-shortest", out])
print("final", lufs(out))
