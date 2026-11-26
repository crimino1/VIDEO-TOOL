#!/usr/bin/env python3
"""Measure a reference video's editing: cuts, pacing, loudness, plus contact sheets to look at.

  python analyze_reference.py <youtube-url-or-file> --out <folder>
  python analyze_reference.py --check     # self-test on a generated clip

Needs ffmpeg and ffprobe on PATH. URLs also need yt-dlp (LOR-TOOLS/bin, or PATH).
Writes report.md, analysis.json, reference.mp4 (URLs only), overview-N.jpg, hook.jpg.
"""
import argparse
import json
import math
import re
import shutil
import statistics
import subprocess
import sys
import tempfile
from pathlib import Path

YTDLP = Path.home() / "LOR-TOOLS" / "bin" / "yt-dlp.exe"
HOOK_SEC = 30
SHEET_COLS, SHEET_ROWS = 4, 4
OVERVIEW_FRAMES = 48


def run(*args):
    return subprocess.run([str(a) for a in args], capture_output=True, text=True, encoding="utf-8", errors="replace")


def fetch(url, out):
    ytdlp = YTDLP if YTDLP.exists() else shutil.which("yt-dlp")
    if not ytdlp:
        sys.exit("yt-dlp not found")
    # 720p is plenty to judge editing, and keeps long documentaries quick to analyse.
    r = run(ytdlp, "--no-playlist", "--no-warnings", "-f", "bv*[height<=720]+ba/b[height<=720]/b",
            "--merge-output-format", "mp4", "--force-overwrites", "-o", out / "reference.mp4", url)
    target = out / "reference.mp4"
    if r.returncode or not target.exists():
        sys.exit(f"Download failed: {r.stderr.strip()[-400:]}")
    return target


def probe(path):
    r = run("ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", path)
    if r.returncode:
        sys.exit(f"ffprobe failed: {r.stderr.strip()[-400:]}")
    data = json.loads(r.stdout)
    video = next((s for s in data["streams"] if s["codec_type"] == "video"), None)
    if not video:
        sys.exit("No video stream")
    num, _, den = video.get("avg_frame_rate", "0/1").partition("/")
    return {
        "duration": float(data["format"]["duration"]),
        "width": video["width"],
        "height": video["height"],
        "fps": round(float(num) / float(den or 1), 2) if float(den or 1) else 0,
        "has_audio": any(s["codec_type"] == "audio" for s in data["streams"]),
    }


def detect_cuts(path, threshold):
    # Scaling first makes this several times faster and does not change what counts as a cut.
    r = run("ffmpeg", "-hide_banner", "-i", path, "-an", "-vf",
            f"scale=320:-2,select='gt(scene,{threshold})',showinfo", "-f", "null", "-")
    return [float(t) for t in re.findall(r"pts_time:([\d.]+)", r.stderr)]


def pacing(cuts, duration):
    """Shot lengths overall, plus cuts per minute for the windows that matter to retention."""
    edges = [0.0] + cuts + [duration]
    shots = [b - a for a, b in zip(edges, edges[1:]) if b > a]
    windows = [("first 30s", 0, 30), ("30s-2m", 30, 120), ("2m-5m", 120, 300), ("after 5m", 300, duration)]
    per_min = {}
    for name, start, end in windows:
        end = min(end, duration)
        if end > start:
            per_min[name] = round(sum(start <= c < end for c in cuts) / ((end - start) / 60), 1)
    return {
        "shots": len(shots),
        "avg_shot_sec": round(statistics.mean(shots), 2),
        "median_shot_sec": round(statistics.median(shots), 2),
        "shortest_shot_sec": round(min(shots), 2),
        "longest_shot_sec": round(max(shots), 2),
        "cuts_per_minute": per_min,
    }


def loudness(path):
    r = run("ffmpeg", "-hide_banner", "-nostats", "-i", path, "-vn", "-af", "ebur128", "-f", "null", "-")
    summary = r.stderr[r.stderr.rfind("Summary:"):]
    found = re.search(r"I:\s*(-?[\d.]+) LUFS", summary)
    lra = re.search(r"LRA:\s*([\d.]+) LU", summary)
    return {"integrated_lufs": float(found[1]) if found else None, "range_lu": float(lra[1]) if lra else None}


def sheet(path, out_file, start, every, count, cols, rows):
    """A grid of frames. Labels are in report.md because drawtext needs font setup on Windows."""
    # select, not fps=1/N: fps samples half an interval late, which would make the labels in report.md wrong.
    pick = f"select='isnan(prev_selected_t)+gte(t-prev_selected_t,{every})'"
    r = run("ffmpeg", "-hide_banner", "-y", "-ss", start, "-i", path, "-an", "-vf",
            f"{pick},scale=480:-2,tile={cols}x{rows}", "-fps_mode", "passthrough",
            "-frames:v", math.ceil(count / (cols * rows)), "-q:v", 3, out_file)
    return r.returncode == 0


def contact_sheets(path, out, duration):
    every = max(duration / OVERVIEW_FRAMES, 1)
    pages = math.ceil(OVERVIEW_FRAMES / (SHEET_COLS * SHEET_ROWS))
    made = []
    for page in range(pages):
        start = page * SHEET_COLS * SHEET_ROWS * every
        if start >= duration:
            break
        name = f"overview-{page + 1}.jpg"
        if sheet(path, out / name, start, every, SHEET_COLS * SHEET_ROWS, SHEET_COLS, SHEET_ROWS):
            made.append({"file": name, "first_frame_sec": round(start, 1), "sec_between_frames": round(every, 1)})
    hook_len = min(HOOK_SEC, int(duration))
    if sheet(path, out / "hook.jpg", 0, 1, hook_len, 6, 5):
        made.append({"file": "hook.jpg", "first_frame_sec": 0, "sec_between_frames": 1})
    return made


def report(meta, stats, cuts, loud, sheets, source):
    m, s = divmod(int(meta["duration"]), 60)
    lines = [
        f"# Reference analysis: {source}", "",
        f"- Length {m}:{s:02d}, {meta['width']}x{meta['height']}, {meta['fps']} fps",
        f"- Shots {stats['shots']}: average {stats['avg_shot_sec']}s, median {stats['median_shot_sec']}s, "
        f"shortest {stats['shortest_shot_sec']}s, longest {stats['longest_shot_sec']}s",
        f"- Cuts per minute: " + ", ".join(f"{k} {v}" for k, v in stats["cuts_per_minute"].items()),
        f"- Loudness: {loud['integrated_lufs']} LUFS, range {loud['range_lu']} LU",
        "", "Soft dissolves and fades are undercounted, so check the frames before calling this straight cuts only.",
        "", "## Contact sheets (read left to right, top to bottom)", "",
    ]
    lines += [f"- `{x['file']}`: starts at {x['first_frame_sec']}s, one frame every {x['sec_between_frames']}s" for x in sheets]
    lines += ["", "## First cuts (seconds)", "", ", ".join(f"{c:.2f}" for c in cuts[:40]) or "none"]
    return "\n".join(lines) + "\n"


def analyze(source, out, threshold):
    out.mkdir(parents=True, exist_ok=True)
    path = fetch(source, out) if re.match(r"https?://", source, re.I) else Path(source)
    if not path.exists():
        sys.exit(f"File not found: {path}")
    meta = probe(path)
    cuts = detect_cuts(path, threshold)
    stats = pacing(cuts, meta["duration"])
    loud = loudness(path) if meta["has_audio"] else {"integrated_lufs": None, "range_lu": None}
    sheets = contact_sheets(path, out, meta["duration"])
    result = {"source": source, **meta, **stats, "loudness": loud, "cuts": cuts, "sheets": sheets}
    (out / "analysis.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
    (out / "report.md").write_text(report(meta, stats, cuts, loud, sheets, source), encoding="utf-8")
    return result


def check():
    stats = pacing([10.0, 40.0], 60.0)
    assert stats["shots"] == 3 and stats["longest_shot_sec"] == 30.0 and stats["cuts_per_minute"]["first 30s"] == 2.0
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        clip = tmp / "cuts.mp4"
        # Four solid colours, 2s each, means exactly three hard cuts at 2, 4 and 6 seconds.
        colours = ["red", "blue", "white", "black"]
        args = ["ffmpeg", "-y", "-hide_banner"]
        for c in colours:
            args += ["-f", "lavfi", "-t", "2", "-i", f"color=c={c}:s=320x180:r=25"]
        args += ["-f", "lavfi", "-t", "8", "-i", "sine=frequency=440",
                 "-filter_complex", "".join(f"[{i}:v]" for i in range(4)) + "concat=n=4:v=1[v]",
                 "-map", "[v]", "-map", "4:a", "-pix_fmt", "yuv420p", clip]
        r = run(*args)
        assert r.returncode == 0, r.stderr[-400:]
        result = analyze(str(clip), tmp / "out", 0.3)
        assert [round(c) for c in result["cuts"]] == [2, 4, 6], result["cuts"]
        assert result["shots"] == 4
        assert result["loudness"]["integrated_lufs"] is not None
        assert (tmp / "out" / "hook.jpg").exists() and (tmp / "out" / "overview-1.jpg").exists()
        # Sampling every 3s must hit 0s (red) and 3s (blue). A late sample lands on 4.5s, which is white.
        assert sheet(clip, tmp / "timing.jpg", 0, 3, 2, 2, 1)
        raw = run("ffmpeg", "-hide_banner", "-loglevel", "error", "-i", tmp / "timing.jpg", "-vf",
                  "format=gray,crop=1:1:720:135", "-f", "rawvideo", "pipe:1")
        assert raw.stdout and ord(raw.stdout[0]) < 100, f"frame timing is off: {raw.stdout!r}"
    print("ok")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("source", nargs="?", help="URL or local video file")
    parser.add_argument("--out", type=Path, help="Folder for results")
    parser.add_argument("--threshold", type=float, default=0.3, help="Scene change sensitivity, lower finds more cuts")
    parser.add_argument("--check", action="store_true", help="Run the self-test")
    a = parser.parse_args()
    if a.check:
        return check()
    if not a.source or not a.out:
        parser.error("source and --out are required")
    analyze(a.source, a.out, a.threshold)
    print((a.out / "report.md").read_text(encoding="utf-8"))


if __name__ == "__main__":
    main()
