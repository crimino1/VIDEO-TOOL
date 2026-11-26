// Smooth scroll recording of a web page -> mp4 (1920x1080, 30 fps).
// node tools/scroll_rec.cjs <name> <url> <seconds> <y0> <y1> [zoom=1.25] [hl=css selector to scroll to first]
// y0/y1 are page pixel offsets (y1 may be "sel:<css>" to end at an element). Output stock/raw/rec_<name>.mp4
const path = require("path"), fs = require("fs"), { execFileSync } = require("child_process");
const pptr = require(path.resolve(__dirname, "../../../node_modules/puppeteer-core"));
const FF = "C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe";
(async () => {
  const [name, url, secS, y0S, y1S, zoomS] = process.argv.slice(2);
  const sec = parseFloat(secS), zoom = parseFloat(zoomS || "1.25"), N = Math.round(sec * 30);
  const dir = path.resolve(__dirname, `../stock/rec_${name}`); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const b = await pptr.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: "new" });
  const pg = await b.newPage();
  await pg.setViewport({ width: Math.round(1920 / zoom), height: Math.round(1080 / zoom), deviceScaleFactor: zoom });
  await pg.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 Edg/130.0");
  await pg.emulateMediaFeatures([{ name: "prefers-color-scheme", value: process.env.DARK ? "dark" : "light" }]);
  await pg.goto(url, { waitUntil: "networkidle2", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 2500));
  // hide cookie banners / sticky headers that would cover content
  await pg.addStyleTag({ content: "#onetrust-banner-sdk,.cookie-banner,[class*=cookie],[id*=cookie],#siteNotice,.vector-sticky-header,#centralNotice{display:none!important}" });
  const pos = async (v) => v.startsWith("sel:") ? await pg.evaluate((s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().top + window.scrollY - 120 : 0; }, v.slice(4)) : parseFloat(v);
  const y0 = await pos(y0S), y1 = await pos(y1S);
  for (let i = 0; i < N; i++) {
    const p = i / Math.max(1, N - 1), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;   // ease in-out
    await pg.evaluate((y) => window.scrollTo(0, y), y0 + (y1 - y0) * e);
    await pg.screenshot({ path: path.join(dir, `f${String(i).padStart(4, "0")}.png`) });
  }
  await b.close();
  const out = path.resolve(__dirname, `../stock/raw/rec_${name}.mp4`);
  execFileSync(FF, ["-hide_banner", "-loglevel", "error", "-y", "-framerate", "30", "-i", path.join(dir, "f%04d.png"), "-vf", "scale=1920:1080:flags=lanczos,format=yuv420p", "-c:v", "libx264", "-crf", "16", "-preset", "fast", out]);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log("wrote", out, N, "frames", y0, "->", y1);
})();
