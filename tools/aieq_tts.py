"""AI Equator voiceover through the user's ai33.pro key (rules from the user, 2026-11-23):
  - voice Lucius, elevenlabs_3OjIrdtfNKDWeBUP0hIC, speed 1
  - generate one paragraph at a time
  - never spend more than the project's character budget (default 17,000), counted before sending
  - a project can set its own "budget" and "model" in assets/vo/usage.json (e.g. glm54: 4,900 chars, eleven_v3 for [emotion] tags)
Usage: .venv\\Scripts\\python.exe tools\\aieq_tts.py <project-dir> <text-file> <out.mp3>   (one paragraph)
       .venv\\Scripts\\python.exe tools\\aieq_tts.py <project-dir> --usage
       .venv\\Scripts\\python.exe tools\\aieq_tts.py --test
"""
import datetime as dt, json, sys, time
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parents[1]
API = "https://api.ai33.pro"
VOICE, MODEL = "elevenlabs_3OjIrdtfNKDWeBUP0hIC", "eleven_multilingual_v2"
BUDGET, MIN_GAP_S = 17000, 4


def key():
    for line in (ROOT / ".env").read_text(encoding="utf-8").splitlines():
        if line.startswith("AIEQ_TTS_KEY="):
            return line.split("=", 1)[1].strip()
    sys.exit("AIEQ_TTS_KEY missing from .env")


def ledger_path(proj):
    return Path(proj) / "assets" / "vo" / "usage.json"


def ledger(proj):
    p = ledger_path(proj)
    return json.loads(p.read_text()) if p.exists() else {"used": 0, "last_request": 0, "log": []}


def save(proj, d):
    p = ledger_path(proj)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(d, indent=1))


def check(d, n, budget=BUDGET):
    """Raise if this request would pass the budget. Pure, so it can be tested."""
    if n == 0:
        raise ValueError("text is empty")
    if d["used"] + n > budget:
        raise ValueError(f"budget: {d['used']} of {budget} characters used, this paragraph needs {n}.")


def speak(proj, text, out):
    d = ledger(proj)
    check(d, len(text), d.get("budget", BUDGET))
    wait = MIN_GAP_S - (time.time() - d["last_request"])
    if wait > 0:
        time.sleep(wait)
    H = {"xi-api-key": key(), "User-Agent": "video-tool/1.0"}
    d["used"] += len(text)  # reserve first: a crash can never push usage past the budget
    d["last_request"] = time.time()
    save(proj, d)
    r = requests.post(f"{API}/v3/text-to-speech", headers=H, timeout=120,
                      data={"text": text, "voice_id": d.get("voice", VOICE), "model_id": d.get("model", MODEL), "speed": "1", "with_transcript": "false"})
    j = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
    if r.status_code >= 400 or j.get("success") is False:
        d["used"] -= len(text)
        save(proj, d)
        sys.exit(f"API refused ({r.status_code}): {r.text[:300]}")
    tid = j.get("task_id") or j.get("id") or (j.get("data") or {}).get("id")
    d["log"].append({"time": dt.datetime.now().isoformat(timespec="seconds"), "chars": len(text), "task": tid, "out": str(out)})
    save(proj, d)
    if not tid:
        sys.exit(f"No task id in response: {json.dumps(j)[:300]}")
    for _ in range(100):
        time.sleep(3)
        t = requests.get(f"{API}/v1/task/{tid}", headers=H, timeout=60).json()
        if t.get("status") == "done":
            Path(out).write_bytes(requests.get((t.get("metadata") or {}).get("audio_url"), timeout=120).content)
            return t
        if t.get("status") in ("failed", "error"):
            sys.exit(f"Task failed: {json.dumps(t)[:300]}")
    sys.exit(f"Timed out waiting for task {tid}")


def demo():
    try:
        check({"used": 16990}, 11); raise AssertionError("budget not enforced")
    except ValueError:
        pass
    check({"used": 16990}, 10)
    try:
        check({"used": 0}, 0); raise AssertionError("empty text allowed")
    except ValueError:
        pass
    print("budget checks ok")


if __name__ == "__main__":
    a = sys.argv[1:]
    if a == ["--test"]:
        demo()
    elif len(a) == 2 and a[1] == "--usage":
        d = ledger(a[0]); print(f"{d['used']} of {d.get('budget', BUDGET)} characters used, model {d.get('model', MODEL)}")
    elif len(a) == 3:
        text = Path(a[1]).read_text(encoding="utf-8").strip()
        t = speak(a[0], text, a[2])
        d = ledger(a[0]); print(f"saved {a[2]} ({len(text)} chars); total {d['used']} of {d.get('budget', BUDGET)}; credit_cost {t.get('credit_cost')}")
    else:
        sys.exit(__doc__)
