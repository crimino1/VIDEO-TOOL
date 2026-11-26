// Screen capture for AI Equator: real pages rendered in headless Chrome at 1920x1080.
//   node capture.mjs shot   <url> <out.png> [--until=load] [--wait=ms] [--dark] [--full] [--selector=css]
//   node capture.mjs scroll <url> <out.mp4> [--seconds=8] [--px=1400] [--wait=ms] [--dark] [--highlight=text]
//   node capture.mjs tweet  <tweet-id> <out.png> [--light]
// scroll renders frame by frame, so the motion is perfectly smooth and needs no live screen recorder.
import { createRequire } from "node:module";
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const require = createRequire(path.resolve("C:/Users/daggu222105/VIDEO-TOOL/node_modules/x.js"));
const puppeteer = require("puppeteer-core");
const FF = "C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe";
const [mode, target, out, ...rest] = process.argv.slice(2);
const opt = Object.fromEntries(rest.map((a) => { const t = a.replace(/^--/, ""), i = t.indexOf("="); return i < 0 ? [t, true] : [t.slice(0, i), t.slice(i + 1)]; }));

function findChrome() {
  const roots = [path.join(os.homedir(), ".cache/hyperframes/chrome"), path.join(os.homedir(), ".cache/puppeteer")];
  const hits = [];
  const walk = (d, depth = 0) => {
    if (depth > 6 || !fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p, depth + 1);
      else if (/^(chrome|chrome-headless-shell)\.exe$/i.test(e.name)) hits.push(p);
    }
  };
  roots.forEach((r) => walk(r));
  hits.push("C:/Program Files/Google/Chrome/Application/chrome.exe");
  const found = hits.find((h) => fs.existsSync(h));
  if (!found) throw new Error("no Chrome found");
  return found;
}

const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, args: ["--no-sandbox", "--hide-scrollbars", "--window-size=1920,1080"] });
const page = await browser.newPage();
const W0 = opt.mac ? 1440 : 1920, H0 = opt.mac ? 860 : 1080;
await page.setViewport({ width: W0, height: H0, deviceScaleFactor: mode === "shot" || mode === "tweet" ? 2 : (opt.mac ? 1.5 : 1) });
await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36");
if (opt.dark) await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
const settle = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });

try {
  if (mode === "tweet") {
    const theme = opt.light ? "light" : "dark";
    await page.goto(`https://platform.twitter.com/embed/Tweet.html?id=${target}&theme=${theme}&dnt=true`, { waitUntil: "networkidle2", timeout: 60000 });
    await settle(1500);
    const el = (await page.$("article")) || (await page.$("#app"));
    await el.screenshot({ path: out, omitBackground: true });
  } else {
    await page.goto(target, { waitUntil: opt.until || "networkidle2", timeout: 90000 });
    await settle(Number(opt.wait || 1500));
    if (opt.rm) {
      await page.evaluate((q) => { document.querySelectorAll(q).forEach((e) => e.remove()); document.documentElement.style.cssText += ";overflow:auto!important"; document.body.style.cssText += ";overflow:auto!important;position:static!important"; }, opt.rm);
      await settle(300);
    }
    if (opt.mac && !opt.keep) {
      await page.evaluate(() => {
        const bad = /(^|[-_ ])(ad|ads|advert|advertisement|banner|cookie|consent|newsletter|promo|sponsor|paywall|subscribe|outbrain|taboola|sticky)([-_ ]|$)/i;
        document.querySelectorAll("iframe, ins, aside, [aria-modal=true], [role=dialog]").forEach((e) => e.remove());
        document.querySelectorAll("body *").forEach((e) => {
          const c = (e.id || "") + " " + (typeof e.className === "string" ? e.className : "");
          if (bad.test(c)) e.remove();
          else { const st = getComputedStyle(e); if ((st.position === "fixed" || st.position === "sticky") && e.tagName !== "HEADER" && e.tagName !== "NAV") e.remove(); }
        });
        document.documentElement.style.overflow = "auto"; document.body.style.overflow = "auto";
      });
      await settle(300);
    }
    if (opt.highlight) {
      await page.evaluate((txt) => {
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = w.nextNode()); ) {
          const i = n.textContent.indexOf(txt);
          if (i < 0) continue;
          const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + txt.length);
          const m = document.createElement("mark"); m.style.cssText = "background:#fa9432;color:#111;padding:0 2px";
          r.surroundContents(m); m.scrollIntoView({ block: "center" });
          return;
        }
      }, opt.highlight);
      await settle(400);
    }
    if (mode === "text") {
      fs.writeFileSync(out, await page.evaluate(() => document.body.innerText));
    } else if (mode === "shot") {
      if (opt.selector) await (await page.$(opt.selector)).screenshot({ path: out });
      else await page.screenshot({ path: out, fullPage: !!opt.full });
    } else if (mode === "scroll") {
      const fps = 30, secs = Number(opt.seconds || 8), px = Number(opt.px || 1400);
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cap-"));
      const y0 = await page.evaluate(() => window.scrollY);
      const n = Math.round(secs * fps);
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1), e = u * u * (3 - 2 * u);
        await page.evaluate((y) => window.scrollTo(0, y), y0 + px * e);
        await settle(15);
        await page.screenshot({ path: path.join(tmp, `f${String(i).padStart(5, "0")}.jpg`), type: "jpeg", quality: 92 });
      }
      execFileSync(FF, ["-hide_banner", "-loglevel", "error", "-y", "-framerate", String(fps), "-i", path.join(tmp, "f%05d.jpg"), "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", out]);
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  }
  console.log("ok", out, (fs.statSync(out).size / 1024 / 1024).toFixed(2) + " MB");
} finally {
  await browser.close();
}
