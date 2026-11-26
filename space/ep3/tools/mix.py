"""Final sound: voice -> -14 LUFS (light compression), Kevin MacLeod music per section ducked under the voice, whoosh/boom cues from sfx.json.
Usage: mix.py <picture.mp4> <out.mp4>"""
import json, math, os, re, subprocess, sys
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
END = 873.61
VOICE, MUSIC_UNDER, SFX_UNDER = -14.0, 15.0, 12.0
M = os.path.join(H, "assets", "music")
def _s(t): m, x = t.split(":"); return int(m) * 60 + float(x)
PLAN = [("0:00.00", "Lightless Dawn"), ("1:23.62", "Long Note Two"), ("2:58.08", "Night Vigil"), ("4:31.90", "Echoes of Time v2"), ("5:54.96", "Spacial Harvest"),
        ("7:26.18", "Long Note Three"), ("8:52.22", "Dreams Become Real"), ("10:17.12", "Reawakening"), ("11:28.32", "Long Note Four")]
MUSIC = []
for k, (t, name) in enumerate(PLAN):
    t0 = _s(t); t1 = _s(PLAN[k + 1][0]) if k + 1 < len(PLAN) else END
    MUSIC.append((max(0, t0 - 2 if k else 0), name, 0.0, t1 - t0 + (2 if k else 0)))
FAM = {"whoosh": ("swell", 6, 2.0), "boom": ("boom", 4, 3.0)}
TMP = os.path.join(H, ".mix"); os.makedirs(TMP, exist_ok=True)


def run(a): subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y"] + a, check=True)


def lufs(p):
    e = subprocess.run([FF, "-hide_banner", "-i", p, "-af", "ebur128=peak=true:framelog=quiet", "-vn", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    return float(re.findall(r"I:\s+([-\d.]+) LUFS", e)[-1]), float(re.findall(r"Peak:\s+([-\d.]+) dBFS", e)[-1])


pic, out = sys.argv[1:3]
src_vo = os.path.join(H, "public", "voice.mp3")
v_i, _ = lufs(src_vo)
vo = os.path.join(TMP, "voice.wav")
run(["-i", src_vo, "-af", f"aresample=48000,volume={VOICE - v_i + 1:.2f}dB,acompressor=threshold=-18dB:ratio=2.5:attack=8:release=120:makeup=1,alimiter=limit=0.89:attack=4:release=60:level=disabled",
     "-ac", "2", "-c:a", "pcm_s24le", vo])
v_i, _ = lufs(vo)
vo2 = os.path.join(TMP, "voice2.wav")
run(["-i", vo, "-af", f"volume={VOICE - v_i:.2f}dB,alimiter=limit=0.89:attack=3:release=60:level=disabled", "-c:a", "pcm_s24le", vo2])
vo = vo2; v_i, v_p = lufs(vo); print("voice", v_i, v_p)

segs = []
for k, (t0, name, ss, d) in enumerate(MUSIC):
    p = os.path.join(TMP, f"m{k}.wav"); src = os.path.join(M, name + ".mp3")
    m_i, _ = lufs(src)
    run(["-stream_loop", "-1", "-ss", f"{ss}", "-t", f"{d + 4}", "-i", src, "-af", f"aresample=48000,volume={(v_i - MUSIC_UNDER) - m_i:.2f}dB,afade=t=in:d=3,afade=t=out:st={d}:d=4,adelay={int(t0 * 1000)}:all=1",
         "-ac", "2", "-c:a", "pcm_s24le", p])
    segs.append(p)
raw = os.path.join(TMP, "music_raw.wav")
run(sum([["-i", p] for p in segs], []) + ["-filter_complex", "".join(f"[{i}:a]" for i in range(len(segs))) + f"amix=inputs={len(segs)}:normalize=0:duration=longest,atrim=0:{END}[m]", "-map", "[m]", "-c:a", "pcm_s24le", raw])
mus = os.path.join(TMP, "music.wav")
run(["-i", raw, "-i", vo, "-filter_complex", "[0:a][1:a]sidechaincompress=threshold=0.03:ratio=2:attack=80:release=900:knee=6:makeup=1[d]", "-map", "[d]", "-c:a", "pcm_s24le", mus])
print("music", lufs(mus))

cues, last, cnt = [], {}, {}
for t, name, vol in json.load(open(os.path.join(H, "sfx.json"))):
    fam, n, gap = FAM[name]
    if t - last.get(fam, -99) < gap: continue
    last[fam] = t; cnt[fam] = cnt.get(fam, 0) % n + 1
    cues.append((t, f"{fam}_{cnt[fam]}", vol))
SFX = os.path.join(H, "assets", "sfx"); norm = {}
args, fc, labels = [], [], []
for i, (t, name, vol) in enumerate(cues):
    if name not in norm: norm[name] = (v_p - SFX_UNDER) - lufs(os.path.join(SFX, name + ".wav"))[1]
    args += ["-i", os.path.join(SFX, name + ".wav")]
    fc.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={norm[name] + 20 * math.log10(vol):.2f}dB,adelay={int(max(0, t) * 1000)}:all=1[f{i}]"); labels.append(f"[f{i}]")
fx = os.path.join(TMP, "fx.wav")
run(args + ["-filter_complex", ";".join(fc) + ";" + "".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=longest,apad=whole_dur={END},atrim=0:{END}[x]", "-map", "[x]", "-c:a", "pcm_s24le", fx])
print("effects", len(cues))

mix = os.path.join(TMP, "mix.wav")
run(["-i", vo, "-i", fx, "-i", mus, "-filter_complex", f"[0:a][1:a][2:a]amix=inputs=3:normalize=0:duration=first,atrim=0:{END},alimiter=limit=0.89:attack=3:release=50:level=disabled[o]",
     "-map", "[o]", "-c:a", "pcm_s24le", "-ar", "48000", mix])
m_i, _ = lufs(mix)
mix2 = os.path.join(TMP, "mix2.wav")
run(["-i", mix, "-af", f"volume={-14.0 - m_i:.2f}dB,alimiter=limit=0.8:attack=2:release=50:level=disabled", "-c:a", "pcm_s24le", mix2])
print("mix", lufs(mix2))
run(["-i", pic, "-i", mix2, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", "-shortest", out])
print("final", lufs(out))
