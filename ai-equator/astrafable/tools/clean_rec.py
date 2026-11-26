"""Clean the screen recordings before they go anywhere near the edit:
  - crop off the Windows taskbar (and, for the prompt recording, the Notepad tab bar whose tab names look like API keys)
  - blur private regions: the file path with the user's Windows name, the SnapIt recorder window, the account initials
  - crop to 16:9 so clip80() never has to stretch
Output: assets/raw/rec/clean/<name>.mp4 (silent; the recordings have no useful audio).
Usage: python tools/clean_rec.py"""
import subprocess
from pathlib import Path

FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
H = Path(__file__).resolve().parent.parent
SRC, OUT = H / "assets/raw/rec", H / "assets/raw/rec/clean"
OUT.mkdir(exist_ok=True)

SNAP_TR = (1210, 40, 710, 150)     # SnapIt window, top right (x, y, w, h)
AVATAR = (0, 960, 70, 60)          # Codex account initials, bottom left
PATH_BAR = (480, 120, 1360, 45)    # Codex browser address bar with C:/Users/<name>/...
TABS = (0, 0, 1920, 42, "fill")     # Notepad tab bar: tab names look like API keys, so solid fill, not blur

# name: (top, bottom) rows to keep, blur boxes in source pixels
JOBS = {
    "r1_prompt": ((50, 1020), []),                          # Notepad tab bar (y < 50) cropped off
    "r2_paste_claude": ((0, 1020), [SNAP_TR, TABS]),
    "r3_paste_codex": ((0, 1020), [SNAP_TR, AVATAR]),
    "r4_codex_building": ((0, 1020), [SNAP_TR, AVATAR]),
    "r5_both_a": ((0, 1020), [SNAP_TR, AVATAR, PATH_BAR]),
    "r6_both_b": ((0, 1020), [SNAP_TR, AVATAR]),
    "r7_both_c": ((0, 1020), [SNAP_TR, AVATAR, PATH_BAR]),
    "r8_chatgpt_result": ((0, 1020), [SNAP_TR, AVATAR, PATH_BAR]),
    "r9_snapit": ((0, 1020), [SNAP_TR, AVATAR, PATH_BAR]),
}


def graph(top, bottom, boxes, pad=False):
    h = bottom - top
    w = int(h * 16 / 9) // 2 * 2
    x0 = (1920 - w) // 2
    parts, last = [f"[0:v]scale=1920:1080,setsar=1,crop=1920:{h}:0:{top}[c0]"], "c0"  # some captures are 1918x1078
    for i, (x, y, bw, bh, *kind) in enumerate(boxes):
        y = max(0, y - top)
        if kind == ["fill"]:
            parts.append(f"[{last}]drawbox=x={x}:y={y}:w={bw}:h={bh}:color=0x1F1F1F:t=fill[c{i + 1}]")
            last = f"c{i + 1}"
            continue
        parts.append(f"[{last}]split[a{i}][b{i}];[b{i}]crop={bw}:{bh}:{x}:{y},boxblur=lr={min(18, min(bw, bh) // 4)}:lp=2:cr={min(9, min(bw, bh) // 8)}:cp=2[k{i}];[a{i}][k{i}]overlay={x}:{y}[c{i + 1}]")
        last = f"c{i + 1}"
    if pad:  # keep every column (text would be cut by a 16:9 crop): fit the width, pad top/bottom in the app's own grey
        nh = int(1920 * h / 1920) // 2 * 2
        parts.append(f"[{last}]scale=1920:{nh},pad=1920:1080:0:(oh-ih)/2:color=0x1F1F1F,fps=30[out]")
    else:
        parts.append(f"[{last}]crop={w}:{h}:{x0}:0,scale=1920:1080:flags=lanczos,fps=30[out]")
    return ";".join(parts)


for name, ((top, bottom), boxes) in JOBS.items():
    src, out = SRC / f"{name}.mp4", OUT / f"{name}.mp4"
    if out.exists() and out.stat().st_mtime > src.stat().st_mtime:
        continue
    subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-i", str(src), "-filter_complex", graph(top, bottom, boxes, name == "r1_prompt"),
                    "-map", "[out]", "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p", str(out)], check=True)
    print("cleaned", name)
