"""List Mixkit free SFX (title + preview mp3) for category pages. Mixkit Sound Effects Free License: free for video, no attribution needed."""
import re, sys, json, subprocess, time
cats = sys.argv[1:]
out = {}
for c in cats:
    for page in ("", "?page=2"):
        h = subprocess.run(["curl", "-s", "-4", "-A", "Mozilla/5.0", f"https://mixkit.co/free-sound-effects/{c}/{page}"], capture_output=True, text=True, encoding="utf-8", errors="replace").stdout
        for url, title in re.findall(r'data-audio-player-preview-url-value="([^"]+\.mp3)".*?item-grid-card__title">\s*([^<]+?)\s*</h2>', h, re.S):
            out[url] = (c, title.strip())
        time.sleep(0.5)
json.dump(out, open("assets/sfx_raw/mixkit.json", "w", encoding="utf-8"), indent=0)
for u, (c, t) in out.items(): print(f"{c:12s} {u.split('/')[-2]:>5s}  {t}")
