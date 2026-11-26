"""Fetch a meme clip found with the pinterest_search tool: meme.py <name> <video url (.mp4 or .m3u8)> <pin_url> [start] [length]
Writes assets/memes/<name>.mp4 (h264, 30 fps, silent) and assets/memes/credits/<name>.json. Thumbnails: look before choosing."""
import json, os, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FF = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"
name, url, pin = sys.argv[1:4]
ss = sys.argv[4] if len(sys.argv) > 4 else "0"
ln = sys.argv[5] if len(sys.argv) > 5 else "12"
os.makedirs(os.path.join(ROOT, "assets", "memes", "credits"), exist_ok=True)
out = os.path.join(ROOT, "assets", "memes", name + ".mp4")
subprocess.run([FF, "-v", "error", "-y", "-ss", ss, "-i", url, "-t", ln, "-an", "-vf", "scale=-2:'min(720,ih)',fps=30", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", out], check=True)
json.dump(dict(source="Pinterest", pin=pin, video=url, note="meme clip, rights not cleared (fair-use commentary)"), open(os.path.join(ROOT, "assets", "memes", "credits", name + ".json"), "w"), indent=1)
d = subprocess.run([FF.replace("ffmpeg.exe", "ffprobe.exe"), "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], capture_output=True, text=True).stdout.strip()
print("ok", name, d, "s")
