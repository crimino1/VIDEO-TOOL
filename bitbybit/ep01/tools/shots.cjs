// Screenshot web pages: node tools/shots.cjs name=url ...  -> assets/img/ss_<name>.png (1600x1000 viewport, top of page)
const path = require("path");
const pptr = require(path.resolve(__dirname, "../../../node_modules/puppeteer-core"));
(async () => {
  const b = await pptr.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: "new" });
  for (const a of process.argv.slice(2)) {
    const i = a.indexOf("="), name = a.slice(0, i), url = a.slice(i + 1);
    const pg = await b.newPage(); await pg.setViewport({ width: 1600, height: 1000 });
    await pg.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 Edg/130.0");
    try {
      await pg.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
      await new Promise((r) => setTimeout(r, 2500));
      const sel = url.split("#")[1]; if (sel) await pg.evaluate((s) => { const e = document.getElementById(s) || document.querySelector(`[name="${s}"]`); if (e) e.scrollIntoView(); }, sel);
      await new Promise((r) => setTimeout(r, 800));
      await pg.screenshot({ path: path.resolve(__dirname, `../assets/img/ss_${name}.png`) });
      console.log("ok", name, await pg.title());
    } catch (e) { console.log("FAIL", name, e.message); }
    await pg.close();
  }
  await b.close();
})();
