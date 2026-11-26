// Grab full composited frames from a part page without rendering: node tools/framegrab.cjs <part 1-4> <out_prefix> <t1,t2,...>
// Times are FILM seconds. Emulates clip windows (data-start/duration), seeks GSAP + pixel engine + videos.
const path = require("path");
const pptr = require(path.resolve(__dirname, "../../../node_modules/puppeteer-core"));
const PARTS = [0.0, 133.58, 281.50, 429.78];
(async () => {
  const [k, out, ts] = process.argv.slice(2);
  const off = PARTS[+k - 1];
  const b = await pptr.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: "new", args: ["--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"] });
  const p = await b.newPage();
  await p.setViewport({ width: 1920, height: 1080 });
  p.on("pageerror", (e) => console.log("PAGEERR", e.message)); p.on("console", (m) => m.type() === "error" && console.log("CONSOLE", m.text()));
  const root = path.resolve(__dirname, ".."), g = path.join(root, `_grab${k}.html`);
  require("fs").copyFileSync(path.join(root, "parts", `p${k}.html`), g);
  await p.goto("file:///" + g.replace(/\\/g, "/"), { waitUntil: "load" });
  await p.evaluate(() => window.__hf && window.__hf.buildReady && window.__hf.buildReady.px);
  for (const ft of ts.split(",").map(Number)) {
    const t = ft - off;
    await p.evaluate(async (t) => {
      for (const el of document.querySelectorAll(".clip")) {
        const a = +el.dataset.start, d = +el.dataset.duration, on = t >= a && t < a + d;
        el.style.display = on ? "" : "none";
        if (el.tagName === "VIDEO" && on) { el.pause(); el.currentTime = Math.max(0, t - a); await new Promise((r) => { el.onseeked = r; setTimeout(r, 1500); }); }
      }
      window.__timelines.main.seek(t, false);
      window.PX_draw(t);
    }, t);
    await new Promise((r) => setTimeout(r, 150));
    const f = `${out}_${ft.toFixed(2)}.png`;
    await p.screenshot({ path: f });
    console.log("wrote", f);
  }
  await b.close();
})();
