"""Health-channel voiceover through the user's ai33.pro key. STRICT RULES (from the user, 2026-11-10):
  - only for the health channel: refuses unless --channel health is given
  - at most 5,000 characters per day (local date), counted with the [emotion] tags; a request that would pass it is refused
  - voice elevenlabs_1qz7q3ZW54FIyiWDvo33, model eleven_v3 (supports [emotion] tags), speed 0.94
Usage: .venv\\Scripts\\python.exe tools\\health_tts.py --channel health <text-file> <out.mp3>
       .venv\\Scripts\\python.exe tools\\health_tts.py --usage
"""
import datetime as dt, json, sys, time
from pathlib import Path
import subprocess
import requests

ROOT = Path(__file__).resolve().parents[1]
LEDGER = ROOT / "health-voice" / "usage.json"
API = "https://api.ai33.pro"
VOICE, MODEL, SPEED = "elevenlabs_1qz7q3ZW54FIyiWDvo33", "eleven_v3", 0.94
DAILY_CAP, MIN_GAP_S = 5000, 10
FFMPEG = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"

def key():
    for line in (ROOT / ".env").read_text().splitlines():
        if line.startswith("AI33_API_KEY="):
            return line.split("=", 1)[1].strip()
    sys.exit("AI33_API_KEY missing from .env")

def ledger():
    return json.loads(LEDGER.read_text()) if LEDGER.exists() else {"days": {}, "last_request": 0, "log": []}

def save(d):
    LEDGER.parent.mkdir(exist_ok=True)
    LEDGER.write_text(json.dumps(d, indent=1))

def today():
    return dt.date.today().isoformat()

def check(d, n):
    """Raise if this request would break a limit. Pure, so it can be tested."""
    if n == 0:
        raise ValueError("text is empty")
    used = d["days"].get(today(), 0)
    if used + n > DAILY_CAP:
        raise ValueError(f"daily limit: {used} of {DAILY_CAP} characters used today, this request needs {n}. Try tomorrow or shorten it.")
    wait = MIN_GAP_S - (time.time() - d["last_request"])
    if wait > 0:
        time.sleep(wait)

def speak(text, out):
    d = ledger()
    check(d, len(text))
    H = {"xi-api-key": key(), "Content-Type": "application/json", "User-Agent": "video-tool/1.0"}
    body = {"text": text, "model_id": MODEL, "voice_id": VOICE}  # the API ignores speed fields; speed is applied after download
    # reserve the characters before sending, so a crash can never let usage go over the cap
    d["days"][today()] = d["days"].get(today(), 0) + len(text)
    d["last_request"] = time.time()
    save(d)
    r = requests.post(f"{API}/v3/text-to-speech", headers=H, json=body, timeout=120)
    j = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
    if r.status_code >= 400 or j.get("success") is False:
        d["days"][today()] -= len(text)  # rejected before generation: give the characters back
        save(d)
        sys.exit(f"API refused ({r.status_code}): {r.text[:300]}")
    tid = j.get("task_id") or j.get("id") or (j.get("data") or {}).get("id")
    d["log"].append({"time": dt.datetime.now().isoformat(timespec="seconds"), "chars": len(text), "task": tid, "out": str(out)})
    save(d)
    if not tid:
        sys.exit(f"No task id in response: {json.dumps(j)[:300]}")
    for _ in range(100):  # poll up to ~5 minutes
        time.sleep(3)
        t = requests.get(f"{API}/v1/task/{tid}", headers=H, timeout=60).json()
        if t.get("status") == "done":
            url = (t.get("metadata") or {}).get("audio_url")
            raw = Path(out).with_suffix(".raw.mp3")
            raw.write_bytes(requests.get(url, timeout=120).content)
            # speed 0.94 with pitch kept (same as the site's "post-process speed")
            subprocess.run([FFMPEG, "-v", "error", "-y", "-i", str(raw), "-filter:a", f"atempo={SPEED}", "-b:a", "192k", str(out)], check=True)
            raw.unlink()
            return t
        if t.get("status") in ("failed", "error"):
            sys.exit(f"Task failed: {json.dumps(t)[:300]}")
    sys.exit(f"Timed out waiting for task {tid}")

def demo():
    d = {"days": {today(): 4990}, "last_request": 0, "log": []}
    try:
        check(d, 11); raise AssertionError("cap not enforced")
    except ValueError:
        pass
    check(d, 10)  # exactly at the cap is allowed
    try:
        check({"days": {}, "last_request": 0}, 0); raise AssertionError("empty text allowed")
    except ValueError:
        pass
    print("limit checks ok")

if __name__ == "__main__":
    a = sys.argv[1:]
    if a == ["--test"]:
        demo()
    elif a == ["--usage"]:
        d = ledger(); print(f"{today()}: {d['days'].get(today(), 0)} of {DAILY_CAP} characters used")
    elif len(a) == 4 and a[:2] == ["--channel", "health"]:
        text = Path(a[2]).read_text(encoding="utf-8").strip()
        t = speak(text, a[3])
        print(f"saved {a[3]} ({len(text)} chars); credit_cost {t.get('credit_cost')}; today {ledger()['days'][today()]} of {DAILY_CAP}")
    else:
        sys.exit("Refused: this voice key is only for the health channel. Use --channel health <text-file> <out.mp3>")
