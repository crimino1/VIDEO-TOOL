"""After the HyperFrames render: measure loudness and set the film to -14 LUFS (video stream copied).
Usage: finish.py <rendered.mp4> <final.mp4>"""
import re, subprocess, sys
FF = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe"
src, dst = sys.argv[1:3]


def loud(path, af=""):
    e = subprocess.run([FF, "-hide_banner", "-i", path, "-af", (af + "," if af else "") + "ebur128=peak=true:framelog=quiet", "-vn", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    return float(re.findall(r"I:\s+([-\d.]+) LUFS", e)[-1]), float(re.findall(r"Peak:\s+([-\d.]+) dBFS", e)[-1])


i0, p0 = loud(src)
gain = -14.0 - i0
af = f"volume={gain:.2f}dB"
if p0 + gain > -1.0:
    af += ",alimiter=limit=0.84:attack=5:release=60:level=disabled"
print(f"render {i0} LUFS peak {p0}; gain {gain:+.2f} dB")
subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-i", src, "-map", "0:v", "-map", "0:a", "-c:v", "copy", "-af", af,
                "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-movflags", "+faststart", dst], check=True)
print("final", loud(dst))
