"""Build a real-recording SFX library from Openverse: CC0 and public-domain sounds only (no credit needed),
sorted by category, with a catalog.json that keeps every file's title, creator, license and source page.
Usage: python tools/build_sfx_library.py [--per 12]   ->  sfx-library/openverse/<category>/*.mp3 + catalog.json
Openverse's anonymous API allows about 20 requests a minute, so the script paces itself."""
import argparse, json, re, time, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "sfx-library" / "openverse"
UA = {"User-Agent": "VideoToolSFXLibrary/1.0"}
# category: (search terms, min seconds, max seconds)
CATS = {
    "whoosh": (["whoosh", "swoosh"], .2, 4), "swipe": (["swipe", "swish"], .1, 2), "riser": (["riser", "rising tension"], 1.5, 12),
    "impact": (["cinematic impact", "cinematic hit"], .3, 8), "boom": (["boom", "sub drop"], .5, 10), "thud": (["thud", "body fall"], .1, 3),
    "pop": (["pop", "bubble pop"], .05, 1.5), "click": (["mouse click", "button click"], .02, 1), "tick": (["tick", "clock tick"], .02, 2),
    "chime": (["chime", "notification ding"], .2, 4), "bell": (["bell ding", "small bell"], .2, 5), "typing": (["keyboard typing"], 1, 20),
    "shutter": (["camera shutter"], .1, 2), "paper": (["paper rustle", "page turn"], .2, 5), "glitch": (["glitch", "digital glitch"], .1, 4),
    "reverse": (["reverse cymbal", "reverse swell"], .8, 8), "coin": (["coin", "cash register"], .2, 3), "success": (["success", "achievement"], .3, 4),
    "error": (["error buzz", "wrong buzzer"], .2, 3), "heartbeat": (["heartbeat"], 1, 20), "water": (["water drop", "splash"], .1, 4),
    "underwater": (["underwater ambience"], 10, 180), "ocean": (["ocean waves"], 10, 180), "wind": (["wind ambience"], 10, 180),
    "roomtone": (["room tone"], 10, 180), "crowd": (["crowd murmur"], 10, 180), "rumble": (["low rumble", "drone"], 3, 120),
    "rocket": (["rocket launch", "rocket engine"], 3, 90), "thruster": (["thruster", "jet engine burst"], .5, 15), "beep": (["radio beep", "electronic beep"], .05, 3),
    "static": (["radio static", "radio noise"], .5, 20), "alarm": (["alarm beep", "warning alarm"], .5, 15), "hiss": (["air hiss", "pressure release"], .3, 8),
    "creak": (["metal creak", "metal stress"], .5, 12), "breath": (["breathing", "heavy breathing"], 1, 20), "hatch": (["metal door", "hatch close"], .3, 6),
    "clock": (["clock ticking", "ticking clock"], 2, 30), "deepimpact": (["deep impact", "sub boom"], .5, 10), "radio": (["radio transmission", "walkie talkie"], .5, 20),
    "servo": (["servo motor", "mechanical motor"], .3, 8), "door": (["door open close", "sliding door"], .3, 6), "spacewind": (["space wind", "dark ambience drone"], 3, 60),
    "splash": (["splash", "water splash", "jump in water"], .2, 5), "wade": (["wading water", "walking in water"], .5, 15),
    "digging": (["digging", "shovel dirt", "pickaxe"], .2, 12), "dogsniff": (["dog sniffing", "dog sniff"], .3, 10),
    "cough": (["cough", "coughing"], .2, 6), "chisel": (["chisel", "hammer chisel", "stone hit metal"], .1, 8),
    "campfire": (["campfire", "fire crackling"], 2, 60), "snore": (["snore", "snoring"], .5, 15),
    "waterfall": (["waterfall"], 3, 60), "otter": (["otter", "animal splash"], .3, 8),
    "snowsteps": (["footsteps snow", "walking in snow"], 1, 20), "snowdig": (["shovel snow", "digging snow"], .5, 15),
    "windgust": (["wind gust", "blizzard"], 1.5, 20), "woodknock": (["wood knock", "wood hit"], .1, 3),
    "snowcrunch": (["snow crunch", "snowball"], .1, 4),
}


def get(url, tries=6):
    """GET with polite back-off: on HTTP 429/401/5xx wait (Retry-After if given, else 30 s, 60 s, ...) and try again."""
    import urllib.error
    for k in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code not in (401, 429, 500, 502, 503) or k == tries - 1:
                raise
            wait = int(e.headers.get("Retry-After") or 0) or 30 * (k + 1)
            print(f"    HTTP {e.code}, waiting {wait}s", flush=True)
            time.sleep(min(wait, 600))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--per", type=int, default=12, help="files per category")
    ap.add_argument("--only", default="", help="comma list of categories to fill (default: all)")
    a = ap.parse_args()
    only = set(filter(None, a.only.split(",")))
    cat_path = ROOT / "catalog.json"
    catalog = json.loads(cat_path.read_text(encoding="utf-8")) if cat_path.exists() else {}
    for cat, (terms, lo, hi) in CATS.items():
        if only and cat not in only:
            continue
        d = ROOT / cat
        d.mkdir(parents=True, exist_ok=True)
        have = len(list(d.glob("*.mp3")))
        for term in terms:
            if have >= a.per:
                break
            q = urllib.parse.urlencode({"q": term, "license": "cc0,pdm", "page_size": 20})  # anonymous limit: more than 20 per page returns 401
            try:
                res = json.loads(get(f"https://api.openverse.org/v1/audio/?{q}"))["results"]
            except Exception as e:
                print(f"  {cat}/{term}: search failed ({e})")
                time.sleep(5)
                continue
            time.sleep(8)  # stay well under the anonymous rate limit
            for r in res:
                if have >= a.per:
                    break
                dur = (r.get("duration") or 0) / 1000
                if not (lo <= dur <= hi) or r["id"] in catalog or not r.get("url", "").endswith(".mp3"):
                    continue
                slug = re.sub(r"[^a-z0-9]+", "-", r["title"].lower()).strip("-")[:40] or "sound"
                out = d / f"{slug}_{r['id'][:8]}.mp3"
                try:
                    out.write_bytes(get(r["url"]))
                except Exception as e:
                    print(f"  skip {r['title'][:30]} ({e})")
                    continue
                catalog[r["id"]] = {"file": str(out.relative_to(ROOT)).replace("\\", "/"), "category": cat, "title": r["title"],
                                    "creator": r.get("creator"), "license": r["license"], "source": r.get("foreign_landing_url"),
                                    "duration_s": round(dur, 2), "tags": [t["name"] for t in (r.get("tags") or [])][:12]}
                have += 1
        print(f"{cat:11s} {have} files")
        cat_path.write_text(json.dumps(catalog, indent=1, ensure_ascii=False), encoding="utf-8")
    print(f"done: {len(catalog)} sounds in {ROOT}")


if __name__ == "__main__":
    main()
