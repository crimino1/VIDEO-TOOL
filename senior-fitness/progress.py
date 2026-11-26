"""Live render progress page. Run: python progress.py, then open http://localhost:3010"""
import json, re, sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
FRAMES = HERE / "blender" / "frames"
LOG = HERE / "final_render.log"
OUT = HERE.parent / "done" / "senior-fitness-final.mp4"
PARTS = [("sit_to_stand", "Sit to stand", 120), ("seated_march", "Seated marching", 58), ("shoulder_rolls", "Shoulder rolls", 58),
         ("arm_circles", "Arm circles", 29), ("wall_pushup", "Wall push-ups", 96), ("heel_raises", "Heel raises", 96),
         ("side_leg_raise", "Side leg raises", 96), ("knee_extension", "Knee extensions", 120), ("heel_to_toe", "Heel-to-toe walk", 154),
         ("heel_toe_feet", "Heel-to-toe, feet close-up", 77), ("chair_still", "Chair shot", 1)]
CLIPS = 12
WEIGHT = {"frames": 70, "clips": 5, "final": 25}

def status():
    parts, times = [], []
    for folder, name, need in PARTS:
        files = list((FRAMES / folder).glob("*.png")) if (FRAMES / folder).exists() else []
        times += [f.stat().st_mtime for f in files]
        parts.append({"name": name, "done": len(files), "need": need})
    done, total = sum(p["done"] for p in parts), sum(p["need"] for p in parts)
    times = sorted(times)[-13:]
    rate = (times[-1] - times[0]) / (len(times) - 1) if len(times) > 1 else 0
    clips = len([p for p in (HERE / "assets" / "anim").glob("*.mp4")]) if (HERE / "assets" / "anim").exists() else 0
    log = LOG.read_text(encoding="utf-8", errors="ignore") if LOG.exists() else ""
    found = re.findall(r"(\d{1,3})%", log)
    final = 100 if "Render complete" in log else (int(found[-1]) if found else 0)
    overall = done / total * WEIGHT["frames"] + min(clips, CLIPS) / CLIPS * WEIGHT["clips"] + final / 100 * WEIGHT["final"]
    stage = "Finished" if final == 100 else "Final video render" if log else "Building clips" if done == total else "Rendering exercises"
    return {"overall": round(overall, 1), "stage": stage, "done": done, "total": total, "minutes": round((total - done) * rate / 60),
            "clips": min(clips, CLIPS), "clipsTotal": CLIPS, "final": final, "parts": parts, "out": str(OUT) if final == 100 else ""}

PAGE = """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Render Progress</title>
<style>:root{--bg:#f4f7f5;--ink:#10291f;--mute:#55695f;--bar:#d9e4de;--fill:#0f7a4d;--card:#fff}
@media(prefers-color-scheme:dark){:root{--bg:#0f1714;--ink:#eef5f1;--mute:#a3b5ab;--bar:#2a3a33;--fill:#39c684;--card:#18231e}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:18px/1.4 system-ui,sans-serif;padding:24px 16px}main{max-width:720px;margin:auto}
h1{font-size:22px;margin:0 0 4px}.big{font-size:88px;font-weight:800;line-height:1.05;font-variant-numeric:tabular-nums}.mute{color:var(--mute)}
.bar{height:14px;background:var(--bar);border-radius:8px;overflow:hidden}.bar i{display:block;height:100%;background:var(--fill);transition:width .6s}
.main .bar{height:24px;border-radius:12px;margin:12px 0}section{background:var(--card);border-radius:12px;padding:16px;margin-top:16px}
.row{display:grid;grid-template-columns:minmax(0,1fr) 88px;gap:2px 12px;margin:12px 0;font-variant-numeric:tabular-nums}.row span:nth-child(2){text-align:right;color:var(--mute)}.row .bar{grid-column:1/3;height:10px}
#err{color:#c0392b}</style></head><body><main><h1>Senior fitness video</h1><div class="main"><div class="big"><span id="pct">0</span>%</div><div class="bar"><i id="fill"></i></div>
<div><b id="stage"></b> <span class="mute" id="eta"></span></div><div id="err"></div></div>
<section><h1>Steps</h1><div id="steps"></div></section><section><h1>Exercises</h1><div id="parts"></div></section></main>
<script>const row=(n,d,t,l)=>`<div class="row"><span>${n}</span><span>${l||d+" / "+t}</span><div class="bar"><i style="width:${t?d/t*100:0}%"></i></div></div>`;
async function tick(){try{const s=await(await fetch("/status")).json();pct.textContent=s.overall;fill.style.width=s.overall+"%";stage.textContent=s.stage;
eta.textContent=s.done<s.total?`about ${s.minutes} min left for exercises, then the final video`:s.out?"Saved: "+s.out:"";err.textContent="";
steps.innerHTML=row("Exercise frames",s.done,s.total)+row("Exercise clips",s.clips,s.clipsTotal)+row("Final video render",s.final,100,s.final+"%");
parts.innerHTML=s.parts.map(p=>row(p.name,p.done,p.need)).join("")}catch(e){err.textContent="Can't reach the progress server."}}
tick();setInterval(tick,3000)</script></body></html>"""

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        body, kind = (json.dumps(status()).encode(), "application/json") if self.path == "/status" else (PAGE.encode(), "text/html; charset=utf-8")
        self.send_response(200); self.send_header("Content-Type", kind); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)
    def log_message(self, *a): pass

if __name__ == "__main__":
    port = next((int(a.split("=")[1]) for a in sys.argv[1:] if a.startswith("--port=")), 3010)
    HTTPServer(("127.0.0.1", port), Handler).serve_forever()
