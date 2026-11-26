// Talks to the LOR-TOOLS MCP server over stdio. Usage: node tools/lor_search.mjs queries.txt out.json [concurrency]
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import readline from "node:readline";

const SERVER = "C:/Users/daggu222105/LOR-TOOLS/scripts/lor-mcp.mjs";
const [, , qFile, outFile, conc = "3"] = process.argv;
const srv = spawn("node", [SERVER], { stdio: ["pipe", "pipe", "ignore"], cwd: "C:/Users/daggu222105/LOR-TOOLS" });
const waiting = new Map();
let id = 0;
readline.createInterface({ input: srv.stdout }).on("line", (l) => {
  const m = JSON.parse(l);
  waiting.get(m.id)?.(m);
  waiting.delete(m.id);
});
const rpc = (method, params) => new Promise((res) => { const i = ++id; waiting.set(i, res); srv.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: i, method, params }) + "\n"); });
await rpc("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "sharks", version: "1" } });

const lines = readFileSync(qFile, "utf8").split("\n").map((s) => s.trim()).filter(Boolean); // key|query
const results = {};
let next = 0;
async function worker() {
  while (next < lines.length) {
    const [key, query] = lines[next++].split("|");
    const d = { scanned: 0, videos: [] };
    for (const aspect of ["16:9"]) {
      const r = await rpc("tools/call", { name: "pinterest_search", arguments: { query, aspect, min_height: 480, limit: 20 } });
      if (r.result?.isError) { console.log(key, aspect, "ERROR", r.result.content[0].text.slice(0, 80)); continue; }
      const x = JSON.parse(r.result.content[0].text);
      d.scanned = Math.max(d.scanned, x.scanned);
      d.videos.push(...x.videos.map((v) => ({ ...v, aspect })));
    }
    results[key] = { query, ...d };
    console.log(key.padEnd(12), "scanned", String(d.scanned).padStart(3), "found", d.videos.length);
  }
}
await Promise.all(Array.from({ length: +conc }, worker));
writeFileSync(outFile, JSON.stringify(results, null, 1));
srv.kill();
