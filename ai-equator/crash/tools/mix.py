"""Final sound: the voice stays exactly as recorded, music and effects sit far below it. Then swaps this sound into the rendered picture.
Usage: mix.py <rendered.mp4> <out.mp4> [--no-music]"""
import os, re, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
B = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin"
FF = B + r"\ffmpeg.exe"
SK = r"C:\Users\daggu222105\.claude\skills\media-use\audio\assets\sfx"
END = 283.34
BED_UNDER_VOICE = 22.0  # dB below the voice


def sec(t):
    m, x = t.split(":")
    return int(m) * 60 + float(x)


def lufs(p):
    e = subprocess.run([FF, "-hide_banner", "-i", p, "-af", "ebur128=peak=true:framelog=quiet", "-vn", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    return float(re.findall(r"I:\s+([-\d.]+) LUFS", e)[-1]), float(re.findall(r"Peak:\s+([-\d.]+) dBFS", e)[-1])


# few and quiet: each one has a visible cause
SFX = [("0:04.40", "whoosh-short", .10), ("0:05.72", "impact-bass-2", .10), ("0:17.52", "pop", .12), ("0:22.24", "whoosh", .09), ("0:25.94", "impact-bass-2", .09),
       ("0:38.80", "impact-bass-2", .09), ("1:04.44", "whoosh", .09), ("1:18.06", "whoosh-short", .09), ("1:36.56", "pop", .08), ("1:38.36", "pop", .08), ("1:41.14", "pop", .08),
       ("1:56.19", "whoosh-short", .10), ("2:08.91", "pop", .10), ("2:14.95", "pop", .10), ("2:47.03", "whoosh-short", .09), ("3:08.61", "pop", .12), ("3:13.93", "pop", .12),
       ("3:38.74", "whoosh", .09), ("3:48.27", "whoosh-short", .09), ("4:11.35", "whoosh-short", .09), ("4:26.77", "impact-bass-2", .10), ("4:37.43", "whoosh", .09)]
pic, out = sys.argv[1:3]
no_music = "--no-music" in sys.argv
vo = os.path.join(ROOT, "assets", "vo.mp3")
tmp = os.path.join(ROOT, ".review_mix")
os.makedirs(tmp, exist_ok=True)
# music: two passes with a long crossfade so the 169 s track covers the film
bed = os.path.join(tmp, "bed.wav")
raw = os.path.join(ROOT, "assets", "raw", "bed_raw.wav")
subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-i", raw, "-i", raw, "-filter_complex", f"[0:a][1:a]acrossfade=d=6:c1=tri:c2=tri,atrim=0:{END},afade=t=in:d=1.5,afade=t=out:st={END - 3}:d=3", bed], check=True)
v_i, v_p = lufs(vo)
b_i, _ = lufs(bed)
gain = v_i - BED_UNDER_VOICE - b_i
print(f"voice {v_i} LUFS (peak {v_p}), music {b_i} LUFS, music gain {gain:.1f} dB")
args = [FF, "-hide_banner", "-loglevel", "error", "-y", "-i", vo]
fc, labels, n = [], ["[0:a]"], 1
if not no_music:
    args += ["-i", bed]
    fc.append(f"[1:a]aresample=44100,volume={gain:.2f}dB[bed]")
    labels.append("[bed]")
    n = 2
for i, (t, f, v) in enumerate(SFX):
    args += ["-i", os.path.join(SK, f + ".mp3")]
    fc.append(f"[{n + i}:a]aresample=44100,volume={v},adelay={int(sec(t) * 1000)}:all=1[f{i}]")
    labels.append(f"[f{i}]")
fc.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=longest,atrim=0:{END},alimiter=limit=0.97:attack=3:release=40:level=disabled[mix]")
wav = os.path.join(tmp, "mix.wav")
subprocess.run(args + ["-filter_complex", ";".join(fc), "-map", "[mix]", "-c:a", "pcm_s24le", "-ar", "44100", wav], check=True)
print("mix", lufs(wav))
subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-i", pic, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", out], check=True)
print("final", lufs(out))
