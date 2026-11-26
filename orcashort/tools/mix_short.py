"""Short-form mix: voice to -14 LUFS; one music bed about 12 dB under it, ducked under speech, quick fade in, 1.5 s fade out. Usage: mix_short.py picture.mp4 out.mp4 [track] [in-point]"""
import os, re, subprocess, sys
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe"
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
pic, out = sys.argv[1:3]
track = sys.argv[3] if len(sys.argv) > 3 else "Hiding Your Reality"
ss = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
END = 50.57
T = os.path.join(H, ".mix"); os.makedirs(T, exist_ok=True)
run = lambda a: subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y"] + a, check=True)


def lufs(p):
    e = subprocess.run([FF, "-hide_banner", "-i", p, "-af", "ebur128=peak=true:framelog=quiet", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    return float(re.findall(r"I:\s+([-\d.]+) LUFS", e)[-1]), float(re.findall(r"Peak:\s+([-\d.]+) dBFS", e)[-1])


vo = os.path.join(T, "vo.wav")
run(["-i", os.path.join(H, "assets", "vo.wav"), "-af", "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,loudnorm=I=-13.3:TP=-1.5:LRA=8", "-ar", "48000", "-ac", "2", vo])
mus = os.path.join(T, "mus.wav")
run(["-ss", f"{ss}", "-t", f"{END + 0.5}", "-i", os.path.join(H, "assets", "music", track + ".mp3"), "-af", "loudnorm=I=-26:TP=-6:LRA=11", "-ar", "48000", "-ac", "2", mus])
mix = os.path.join(T, "mix.wav")
run(["-i", mus, "-i", vo, "-filter_complex",
     f"[0:a]afade=t=in:d=0.4,afade=t=out:st={END - 1.5}:d=1.5[m];[1:a]asplit[v1][v2];[m][v1]sidechaincompress=threshold=0.04:ratio=5:attack=25:release=350:makeup=1[md];"
     f"[md][v2]amix=inputs=2:normalize=0:duration=longest,atrim=0:{END},alimiter=limit=0.89:level=disabled[o]", "-map", "[o]", mix])
run(["-i", pic, "-i", mix, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", out])
print("voice", lufs(vo), "music", lufs(mus), "final", lufs(out))
