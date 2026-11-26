// Geometry check: at the end of every scene (all items in), report any two visible items whose boxes intersect,
// and any item that leaves the frame or its scene body. Usage: node tools/overlap.mjs  (reads index.html)
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
const require = createRequire(path.resolve("C:/Users/daggu222105/VIDEO-TOOL/node_modules/x.js"));
const puppeteer = require("puppeteer-core");
function findChrome() {  // same lookup as ../tools/capture.mjs
  const hits = [];
  const walk = (d, depth = 0) => {
    if (depth > 6 || !fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p, depth + 1);
      else if (/^(chrome|chrome-headless-shell)\.exe$/i.test(e.name)) hits.push(p);
    }
  };
  [path.join(os.homedir(), ".cache/hyperframes/chrome"), path.join(os.homedir(), ".cache/puppeteer")].forEach((r) => walk(r));
  return hits.sort().pop();
}

const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, args: ["--no-sandbox", "--allow-file-access-from-files"] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
await page.goto("file:///" + path.resolve("index.html").replace(/\\/g, "/"), { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const times = await page.evaluate(() => [...document.querySelectorAll(".scene")].map((s) => {
  const a = +s.dataset.start, d = +s.dataset.duration;
  return [s.id, a + d - 0.35];
}));
let bad = 0;
for (const [sid, t] of times) {
  const res = await page.evaluate((sid, t) => {
    window.__timelines.main.seek(t, false);
    const vis = (el) => { for (let e = el; e && e.id !== "root"; e = e.parentElement) if (+getComputedStyle(e).opacity < 0.5) return false; return true; };
    const host = document.getElementById(sid);
    const items = [...host.querySelectorAll(".a")].filter((e) => vis(e) && !e.parentElement.closest(".a"));
    const caps = [...document.querySelectorAll(".vwrap .a")].filter(vis);
    const all = items.concat(caps);
    const box = (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, r: r.right, b: r.bottom, n: (e.id || e.className) + " “" + e.innerText.slice(0, 40).replace(/\n/g, " ") + "”" }; };
    const B = all.map(box), out = [];
    for (let i = 0; i < B.length; i++) {
      const p = B[i];
      if (p.x < 0 || p.y < 0 || p.r > 1920 || p.b > 1080) out.push(`off-frame ${p.n} [${p.x | 0},${p.y | 0},${p.r | 0},${p.b | 0}]`);
      for (let j = i + 1; j < B.length; j++) {
        const q = B[j], ox = Math.min(p.r, q.r) - Math.max(p.x, q.x), oy = Math.min(p.b, q.b) - Math.max(p.y, q.y);
        if (ox > 2 && oy > 2) out.push(`overlap ${p.n}  ×  ${q.n}  (${ox | 0}×${oy | 0}px)`);
      }
    }
    for (const e of all) {  // text spilling out of its own card or bar label
      for (const c of e.querySelectorAll("*")) {
        if (!c.childElementCount && c.textContent.trim() && (c.scrollWidth > c.clientWidth + 2 && getComputedStyle(c).overflow !== "visible")) out.push(`clipped text “${c.textContent.slice(0, 30)}”`);
      }
      const r = e.getBoundingClientRect();
      for (const c of e.querySelectorAll("div,span,b,img:not([id^=k])")) {
        const q = c.getBoundingClientRect();
        if (q.width && (q.right > r.right + 2 || q.bottom > r.bottom + 2 || q.left < r.left - 2)) { out.push(`spills out of its card by ${Math.round(Math.max(q.right - r.right, q.bottom - r.bottom, r.left - q.left))}px (card ${Math.round(r.width)}x${Math.round(r.height)}): “${(c.textContent || c.tagName).slice(0, 30)}” in ${box(e).n}`); break; }
      }
      for (const c of e.querySelectorAll(".blab span, .slab, .pill, .cap")) {
        const lh = parseFloat(getComputedStyle(c).lineHeight) || parseFloat(getComputedStyle(c).fontSize) * 1.25;
        if (c.getBoundingClientRect().height > lh * 1.6) out.push(`wraps to 2+ lines: “${c.textContent.slice(0, 30)}”`);
      }
    }
    const body = host.querySelector(".body");
    if (body && body.scrollHeight > body.clientHeight + 2) out.push(`body overflows by ${body.scrollHeight - body.clientHeight}px`);
    return out;
  }, sid, t);
  if (res.length) { bad++; console.log(`@${t.toFixed(2)}s ${sid}`); res.forEach((r) => console.log("   " + r)); }
}
console.log(bad ? `${bad} scene(s) with problems` : "no overlaps, nothing off-frame");
await browser.close();
