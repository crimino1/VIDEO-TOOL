// Downloads chosen candidates through the LOR-TOOLS MCP server into stock/raw/<key>_<i>.mp4
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import readline from "node:readline";

const pick = process.argv.slice(2);
const cands = JSON.parse(readFileSync("stock/pin_cands.json", "utf8"));
mkdirSync("stock/raw", { recursive: true });
const srv = spawn("node", ["C:/Users/daggu222105/LOR-TOOLS/scripts/lor-mcp.mjs"], { stdio: ["pipe", "pipe", "ignore"], cwd: "C:/Users/daggu222105/LOR-TOOLS" });
const waiting = new Map();
let id = 0;
readline.createInterface({ input: srv.stdout }).on("line", (l) => { const m = JSON.parse(l); waiting.get(m.id)?.(m); waiting.delete(m.id); });
const rpc = (method, params) => new Promise((res) => { const i = ++id; waiting.set(i, res); srv.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: i, method, params }) + "\n"); });
await rpc("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "sharks", version: "1" } });

const sources = existsSync("stock/sources.json") ? JSON.parse(readFileSync("stock/sources.json", "utf8")) : {};
let next = 0;
async function worker() {
  while (next < pick.length) {
    const p = pick[next++];
    const [key, i] = p.split("#");
    const v = cands[key]?.[+i];
    const out = `stock/raw/${key}_${i}.mp4`;
    if (!v) { console.log(p, "no such candidate"); continue; }
    if (existsSync(out)) { console.log(p, "already have"); continue; }
    const r = await rpc("tools/call", { name: "download_video", arguments: { url: v.url } });
    if (r.result?.isError) { console.log(p, "FAILED", r.result.content[0].text.slice(0, 120)); continue; }
    copyFileSync(JSON.parse(r.result.content[0].text).filepath, out);
    sources[`${key}_${i}`] = { pin: v.pin_url, title: v.title };
    console.log(p, "ok");
  }
}
await Promise.all([worker(), worker(), worker()]);
writeFileSync("stock/sources.json", JSON.stringify(sources, null, 1));
srv.kill();
