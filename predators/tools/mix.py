"""Final sound for the colossal squid film, then muxed onto the rendered picture.
Levels follow the user's numbers read as loudness steps under the voice (voice "107" = loudest):
  voice   -> -14 LUFS, lifted, lightly compressed and limited (loud and clear)
  music   -> 12 dB under the voice in pauses, ducked to about 20 dB under while the voice speaks ("95 to 85")
  effects -> 9 to 12 dB under the voice ("98 to 95"), scaled by each cue's weight
  water bed and real sperm whale clicks sit low underneath.
Usage: mix.py <picture.mp4> <out.mp4> [--no-music]"""
import json, os, re, subprocess, sys
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe"
END = 553.26
VOICE = -14.0
MUSIC_UNDER = 14.0   # in pauses; the sidechain duck adds about 8 dB more under speech
SFX_UNDER = 10.0
BED_UNDER = 27.0
M = os.path.join(H, "assets", "music")
# (film start, track, track in-point, length)
def _s(t):
    m, x = t.split(":"); return int(m) * 60 + float(x)
# (film start, track, in-point, length) -- picked by tools/music_test.py, one mood per section
_PLAN = [("0:00.00", "Ossuary 6 - Air"), ("0:30.68", "Spacial Harvest"), ("2:26.40", "Ossuary 5 - Rest"), ("4:21.88", "Echoes of Time v2"),
         ("5:33.22", "Dreams Become Real"), ("6:29.88", "Long Note Two"), ("7:50.03", "Bittersweet"), ("8:24.27", "Long Note Four")]
MUSIC = []
for k, (t, name) in enumerate(_PLAN):
    t0 = _s(t); t1 = _s(_PLAN[k + 1][0]) if k + 1 < len(_PLAN) else END
    MUSIC.append((max(0, t0 - 2), name, 0.0, t1 - t0 + (2 if k else 0)))
# real sperm whale clicks (Ocean Networks Canada) under the echolocation scenes: (film time, length)
CLICKS = []
TMP = os.path.join(H, ".mix"); os.makedirs(TMP, exist_ok=True)


def run(args):
    subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y"] + args, check=True)


def lufs(p):
    e = subprocess.run([FF, "-hide_banner", "-i", p, "-af", "ebur128=peak=true:framelog=quiet", "-vn", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    return float(re.findall(r"I:\s+([-\d.]+) LUFS", e)[-1]), float(re.findall(r"Peak:\s+([-\d.]+) dBFS", e)[-1])


pic, out = sys.argv[1:3]
no_music = "--no-music" in sys.argv

# 1. voice: lift to about -14 LUFS with a gentle compressor and a true-peak limiter
vo = os.path.join(TMP, "voice.wav")
v_i, _ = lufs(os.path.join(H, "assets", "vo.wav"))
pre = VOICE - v_i + 1.0
run(["-i", os.path.join(H, "assets", "vo.wav"), "-af", f"aresample=48000,volume={pre:.2f}dB,acompressor=threshold=-18dB:ratio=2.5:attack=8:release=120:makeup=1,"
     "alimiter=limit=0.89:attack=4:release=60:level=disabled", "-ac", "2", "-c:a", "pcm_s24le", vo])
v_i, v_p = lufs(vo)
# second pass: the compressor eats level, so correct to the target and limit again
vo2 = os.path.join(TMP, "voice2.wav")
run(["-i", vo, "-af", f"volume={VOICE - v_i:.2f}dB,alimiter=limit=0.89:attack=3:release=60:level=disabled", "-c:a", "pcm_s24le", vo2])
vo = vo2
v_i, v_p = lufs(vo)
print(f"voice {v_i} LUFS, peak {v_p}")

# 2. music: segments with 4 s crossfades, each normalised, then ducked under the voice
mus = os.path.join(TMP, "music.wav")
if not no_music:
    segs = []
    for k, (t0, name, ss, d) in enumerate(MUSIC):
        p = os.path.join(TMP, f"m{k}.wav")
        src = os.path.join(M, name + ".mp3")
        m_i, _ = lufs(src)
        g = (v_i - MUSIC_UNDER) - m_i
        run(["-ss", f"{ss}", "-t", f"{d + 4}", "-i", src, "-af", f"aresample=48000,volume={g:.2f}dB,afade=t=in:d=3,afade=t=out:st={d}:d=4,adelay={int(t0 * 1000)}:all=1",
             "-ac", "2", "-c:a", "pcm_s24le", p])
        segs.append(p)
    ins = sum([["-i", p] for p in segs], [])
    run(ins + ["-filter_complex", "".join(f"[{i}:a]" for i in range(len(segs))) + f"amix=inputs={len(segs)}:normalize=0:duration=longest,atrim=0:{END}[m]", "-map", "[m]", "-c:a", "pcm_s24le", os.path.join(TMP, "music_raw.wav")])
    # duck under the voice: about 8 dB less while it speaks, back up in the pauses
    run(["-i", os.path.join(TMP, "music_raw.wav"), "-i", vo, "-filter_complex",
         "[1:a]asplit=1[sc];[0:a][sc]sidechaincompress=threshold=0.03:ratio=2:attack=80:release=900:knee=6:makeup=1[d]", "-map", "[d]", "-c:a", "pcm_s24le", mus])
    print("music", lufs(mus))

# 3. effects from sfx.json, each normalised so its loudness sits SFX_UNDER under the voice, times its weight
cues = [c for c in json.load(open(os.path.join(H, "sfx.json"))) if c[2] > 0]
SFX = os.path.join(H, "assets", "sfx")
norm = {}
for _, name, _ in cues:
    if name in norm: continue
    _, f_p = lufs(os.path.join(SFX, name + ".wav"))
    norm[name] = (v_p - SFX_UNDER) - f_p   # effect peaks sit 9-12 dB under the voice peaks
import math
args, fc, labels = [], [], []
for i, (t, name, vol) in enumerate(cues):
    args += ["-i", os.path.join(SFX, name + ".wav")]
    g = norm[name] + 20 * math.log10(vol)
    fc.append(f"[{i}:a]aresample=48000,volume={g:.2f}dB,adelay={int(max(0, t) * 1000)}:all=1[f{i}]")
    labels.append(f"[f{i}]")
n = len(cues)
c_p = lufs(os.path.join(H, "assets", "raw", "onc_clicks.wav"))[1] if CLICKS else 0
for j, (ct, cd) in enumerate(CLICKS):
    args += ["-i", os.path.join(H, "assets", "raw", "onc_clicks.wav")]
    fc.append(f"[{n + j}:a]aresample=48000,atrim=0:{min(cd, 28)},volume={(v_p - 11) - c_p:.2f}dB,afade=t=in:d=0.8,afade=t=out:st={max(0.5, min(cd, 28) - 1.5)}:d=1.5,adelay={int(ct * 1000)}:all=1[clk{j}]")
    labels.append(f"[clk{j}]")
n += len(CLICKS) - 1
# water bed under everything
args += ["-stream_loop", "-1", "-i", os.path.join(SFX, "deep_bed.wav")]
b_i, _ = lufs(os.path.join(SFX, "deep_bed.wav"))
fc.append(f"[{n + 1}:a]atrim=0:{END},volume={(v_i - BED_UNDER) - b_i:.2f}dB,afade=t=in:d=3,afade=t=out:st={END - 4}:d=4[bed]")
labels.append("[bed]")
fx = os.path.join(TMP, "fx.wav")
run(args + ["-filter_complex", ";".join(fc) + ";" + "".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=longest,atrim=0:{END}[x]", "-map", "[x]", "-c:a", "pcm_s24le", fx])
print("effects", lufs(fx))

# 4. final mix
ins = ["-i", vo, "-i", fx] + ([] if no_music else ["-i", mus])
k = 2 if no_music else 3
mix = os.path.join(TMP, "mix.wav")
run(ins + ["-filter_complex", "".join(f"[{i}:a]" for i in range(k)) + f"amix=inputs={k}:normalize=0:duration=first,atrim=0:{END},alimiter=limit=0.89:attack=3:release=50:level=disabled[o]",
           "-map", "[o]", "-c:a", "pcm_s24le", "-ar", "48000", mix])
m_i, _ = lufs(mix)
mix2 = os.path.join(TMP, "mix2.wav")
run(["-i", mix, "-af", f"volume={-14.0 - m_i:.2f}dB,alimiter=limit=0.8:attack=2:release=50:level=disabled", "-c:a", "pcm_s24le", mix2])
mix = mix2
print("mix", lufs(mix))
run(["-i", pic, "-i", mix, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", "-shortest", out])
print("final", lufs(out))
