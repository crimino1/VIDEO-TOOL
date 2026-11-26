"""Live progress page for the colossal squid film. Run: python progress.py, then open http://localhost:3011"""
import json, re, time
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
FRAMES = HERE / "blender" / "frames"
OUT = HERE.parent / "done" / "colossal-squid.mp4"
PLATES = [("eye_reveal", "The eye", 240), ("hover", "Squid hanging in the dark", 300), ("swim", "Squid swimming", 240), ("hooks", "Swivel hooks", 180),
          ("beak", "The beak", 150), ("sub_dark", "Submarine, lights off", 270), ("sub_lights", "Submarine, lights on", 180), ("glow_wake", "Whale's glowing trail", 240),
          ("whale_dive", "Sperm whale dive", 240), ("strike", "Tentacle strike", 180), ("battle", "Whale vs squid fight", 420), ("descent", "Sinking into the dark", 300)]
PARTS = [("0:00 – 4:48", 288.1), ("4:48 – 9:47", 299.1), ("9:47 – 14:30", 283.1), ("14:30 – 20:05", 335.0)]
W_3D, W_FILM, W_MIX = 35, 60, 5


def part_pct(k):
    log = HERE / "renders" / f"p{k}.log"
    if (HERE / "renders" / f"p{k}.mp4").exists() and log.exists() and "render exit 0" in log.read_text(errors="ignore"): return 100
    if not log.exists(): return 0
    found = re.findall(r"(\d{1,3}(?:\.\d)?)%", log.read_text(encoding="utf-8", errors="ignore")[-4000:])
    return min(99, float(found[-1])) if found else 0


def status():
    plates, times = [], []
    for folder, name, need in PLATES:
        files = list((FRAMES / folder).glob("*.png")) if (FRAMES / folder).exists() else []
        times += [f.stat().st_mtime for f in files]
        plates.append({"name": name, "done": min(len(files), need), "need": need})
    done, total = sum(p["done"] for p in plates), sum(p["need"] for p in plates)
    times = sorted(times)[-25:]
    rate = (times[-1] - times[0]) / (len(times) - 1) if len(times) > 1 else 4
    parts = [{"name": n, "pct": part_pct(k + 1)} for k, (n, _) in enumerate(PARTS)]
    film = sum(p["pct"] * PARTS[k][1] for k, p in enumerate(parts)) / sum(d for _, d in PARTS)
    mixed = OUT.exists()
    overall = done / total * W_3D + film / 100 * W_FILM + (W_MIX if mixed else 0)
    left3d = (total - done) * rate / 60
    leftfilm = (100 - film) / 100 * 55
    mins = 0 if mixed else round(left3d + leftfilm + 6)
    stage = "Finished" if mixed else "Mixing sound" if film >= 100 else "Rendering the film" if film > 0 else "Rendering 3D scenes" if done < total else "Starting the film render"
    return {"overall": round(overall, 1), "stage": stage, "done": done, "total": total, "film": round(film, 1), "minutes": mins,
            "plates": plates, "parts": parts, "out": str(OUT) if mixed else "", "time": time.strftime("%H:%M:%S")}


PAGE = """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Squid Film Progress</title>
<style>:root{--bg:#f3f6f8;--ink:#0d1b24;--mute:#566874;--bar:#d6e0e6;--fill:#0f6fa8;--card:#fff}
@media(prefers-color-scheme:dark){:root{--bg:#070d12;--ink:#e8f1f6;--mute:#9db0bc;--bar:#1d2b35;--fill:#3fb6ff;--card:#101a22}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:18px/1.4 system-ui,sans-serif;padding:24px 16px}main{max-width:760px;margin:auto}
h1{font-size:22px;margin:0 0 4px}h2{font-size:18px;margin:0 0 4px}.big{font-size:96px;font-weight:800;line-height:1.05;font-variant-numeric:tabular-nums}.mute{color:var(--mute)}
.bar{height:14px;background:var(--bar);border-radius:8px;overflow:hidden}.bar i{display:block;height:100%;background:var(--fill);transition:width .6s}
.main .bar{height:26px;border-radius:13px;margin:12px 0}section{background:var(--card);border-radius:12px;padding:16px;margin-top:16px}
.row{display:grid;grid-template-columns:minmax(0,1fr) 96px;gap:2px 12px;margin:12px 0;font-variant-numeric:tabular-nums}.row span:nth-child(2){text-align:right;color:var(--mute)}.row .bar{grid-column:1/3;height:10px}
#err{color:#c0392b}</style></head><body><main><h1>Why You'd Never Want To Meet A Colossal Squid</h1><div class="main"><div class="big"><span id="pct">0</span>%</div><div class="bar"><i id="fill"></i></div>
<div><b id="stage"></b> <span class="mute" id="eta"></span></div><div class="mute" id="upd"></div><div id="err"></div></div>
<section><h2>Steps</h2><div id="steps"></div></section><section><h2>Film render</h2><div id="parts"></div></section><section><h2>3D scenes</h2><div id="plates"></div></section></main>
<script>const row=(n,d,t,l)=>`<div class="row"><span>${n}</span><span>${l||d+" / "+t}</span><div class="bar"><i style="width:${t?Math.min(100,d/t*100):0}%"></i></div></div>`;
async function tick(){try{const s=await(await fetch("/status")).json();pct.textContent=s.overall;fill.style.width=s.overall+"%";stage.textContent=s.stage;
eta.textContent=s.out?"Saved: "+s.out:`about ${s.minutes} min left`;upd.textContent="Updated "+s.time+", refreshes every 5 seconds";err.textContent="";
steps.innerHTML=row("3D frames",s.done,s.total)+row("Film render",s.film,100,s.film+"%")+row("Sound mix",s.out?1:0,1,s.out?"done":"waiting");
parts.innerHTML=s.parts.map(p=>row("Part "+p.name,p.pct,100,p.pct+"%")).join("");plates.innerHTML=s.plates.map(p=>row(p.name,p.done,p.need)).join("")}
catch(e){err.textContent="Can't reach the progress server."}}tick();setInterval(tick,5000)</script></body></html>"""


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        body, kind = (json.dumps(status()).encode(), "application/json") if self.path == "/status" else (PAGE.encode(), "text/html; charset=utf-8")
        self.send_response(200); self.send_header("Content-Type", kind); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)

    def log_message(self, *a): pass


if __name__ == "__main__":
    HTTPServer(("127.0.0.1", 3011), Handler).serve_forever()
