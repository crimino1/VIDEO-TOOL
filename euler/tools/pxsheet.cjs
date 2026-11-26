// Contact sheet of one pixel scene kind: node tools/pxsheet.cjs <kind> '<opts json>' <dur> <out.png> [frames=12] [cols=4]
// Renders frames evenly over [0, dur) with the real engine (stars + CRT composite), labelled with t.
// Also: node tools/pxsheet.cjs <kind> '<opts>' <dur> <out.png> --at 1.2,3.4  (exact times, full-size 1920 tiles if one time)
const path = require("path"), fs = require("fs");
const ROOT = path.resolve(__dirname, "..");
const pptr = require(path.resolve(ROOT, "../node_modules/puppeteer-core"));
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
(async () => {
  const [kind, optsJ, durS, out] = process.argv.slice(2);
  const rest = process.argv.slice(6);
  const dur = parseFloat(durS);
  let times;
  const atI = rest.indexOf("--at");
  if (atI >= 0) times = rest[atI + 1].split(",").map(Number);
  else { const n = parseInt(rest[0] || "12"); times = [...Array(n)].map((_, i) => +(dur * (i + 0.5) / n).toFixed(2)); }
  const cols = times.length === 1 ? 1 : parseInt((atI >= 0 ? rest[atI + 2] : rest[1]) || "4");
  const tileW = times.length === 1 ? 1920 : 480, tileH = tileW * 9 / 16;
  const scenes = fs.readdirSync(path.join(ROOT, "assets/js/scenes")).filter((f) => f.endsWith(".js")).sort();
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"Press Start 2P";src:url("assets/fonts/PressStart2P-Regular.ttf")}
@font-face{font-family:"VT323";src:url("assets/fonts/VT323-Regular.ttf")}
body{margin:0;background:#000}canvas{display:block}</style></head><body>
<canvas id="stars" width="1920" height="1080"></canvas><canvas id="crt" width="1920" height="1080"></canvas>
<script>window.PXS=${JSON.stringify([[0, dur, kind, JSON.parse(optsJ || "{}")]])};</script>
<script src="assets/js/px.js"></script>
${scenes.map((f) => `<script src="assets/js/scenes/${f}"></script>`).join("\n")}
<script>PX.start();</script></body></html>`;
  const tmp = path.join(ROOT, `_pxtest_${process.pid}.html`);
  fs.writeFileSync(tmp, html);
  const b = await pptr.launch({ executablePath: EDGE, headless: "new", args: ["--allow-file-access-from-files"] });
  try {
    const pg = await b.newPage();
    const errs = []; pg.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); }); pg.on("pageerror", (e) => errs.push(String(e)));
    await pg.setViewport({ width: 1920, height: 1080 });
    await pg.goto("file:///" + tmp.replace(/\\/g, "/"));
    await pg.evaluate(() => window.__hf.buildReady.px);
    const data = await pg.evaluate((times, cols, tileW, tileH) => {
      const rows = Math.ceil(times.length / cols), sh = document.createElement("canvas");
      sh.width = cols * tileW; sh.height = rows * tileH; const c = sh.getContext("2d");
      times.forEach((t, i) => {
        window.PX_draw(t);
        const x = (i % cols) * tileW, y = Math.floor(i / cols) * tileH;
        c.drawImage(document.getElementById("stars"), x, y, tileW, tileH); c.drawImage(document.getElementById("crt"), x, y, tileW, tileH);
        if (times.length > 1) { c.fillStyle = "rgba(0,0,0,.6)"; c.fillRect(x, y, 70, 18); c.fillStyle = "#fff"; c.font = "13px monospace"; c.fillText("t=" + t, x + 4, y + 13); }
      });
      return sh.toDataURL("image/png");
    }, times, cols, tileW, tileH);
    fs.writeFileSync(out, Buffer.from(data.split(",")[1], "base64"));
    if (errs.length) console.log("PAGE ERRORS:\n" + errs.join("\n"));
    console.log("wrote", out, times.length, "frames");
  } finally { await b.close(); fs.unlinkSync(tmp); }
})();
