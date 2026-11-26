// Shared drawing helpers. Everything is a pure function of time, so any frame renders on its own.
const NS = "http://www.w3.org/2000/svg";
const INK = "#14181d";
function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (a, b, t) => { const u = clamp((t - a) / (b - a || 1e-6)); return u * u * (3 - 2 * u); };
const easeOut = (a, b, t) => { const u = clamp((t - a) / (b - a || 1e-6)); return 1 - Math.pow(1 - u, 3); };
const easeIn = (a, b, t) => { const u = clamp((t - a) / (b - a || 1e-6)); return u * u * u; };
function rng(seed) { let s = seed >>> 0 || 1; return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const f1 = (v) => (Math.round(v * 10) / 10).toString();

let measurePath = null;
function pathOf(d) {
  if (!measurePath) { const s = el("svg", { width: 0, height: 0, style: "position:absolute" }, document.body); measurePath = el("path", {}, s); }
  measurePath.setAttribute("d", d);
  return measurePath;
}

// Turns a smooth outline into a furry one: small tufts that lean along the line.
function furry(d, seed = 1, amp = 3.4, step = 11) {
  const p = pathOf(d), L = p.getTotalLength(), r = rng(seed);
  let out = "", s = 0, i = 0;
  while (s < L) {
    const a = p.getPointAtLength(s), b = p.getPointAtLength(Math.min(L, s + 1));
    let tx = b.x - a.x, ty = b.y - a.y; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
    const nx = ty, ny = -tx, h = amp * (0.35 + 0.65 * r());
    out += (i ? "L" : "M") + f1(a.x - nx * 0.5) + " " + f1(a.y - ny * 0.5);
    out += "L" + f1(a.x + tx * step * 0.62 + nx * h) + " " + f1(a.y + ty * step * 0.62 + ny * h);
    s += step * (0.75 + r() * 0.5); i++;
  }
  return out + "Z";
}

function defs() {
  if (document.getElementById("gDefs")) return;
  const d = el("defs", { id: "gDefs" }, document.getElementById("stage"));
  const lin = (id, stops, x2 = 0, y2 = 1, units) => {
    const g = el("linearGradient", { id, x1: 0, y1: 0, x2, y2 }, d);
    stops.forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a === undefined ? 1 : a }, g));
  };
  const radg = (id, stops) => {
    const g = el("radialGradient", { id }, d);
    stops.forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a === undefined ? 1 : a }, g));
  };
  const furG = el("linearGradient", { id: "fur", gradientUnits: "userSpaceOnUse", x1: 0, y1: -282, x2: 0, y2: -108 }, d);
  [[0, "#fdf8ea"], [0.5, "#f6efdc"], [0.82, "#e6e4d8"], [1, "#bcc6c8"]].forEach(([o, c]) => el("stop", { offset: o, "stop-color": c }, furG));
  lin("furLeg", [[0, "#f6efdc"], [0.7, "#f1ecdf"], [1, "#d5d9d6"]]);
  lin("furFar", [[0, "#aab6bc"], [1, "#8d9ba3"]]);
  lin("furHead", [[0, "#f8f2e1"], [0.72, "#f6efdc"], [1, "#dcdcd2"]]);
  radg("warmPatch", [[0, "#e9cf9b", 0.55], [0.6, "#eedcb4", 0.25], [1, "#f6efdc", 0]]);
  radg("coolPatch", [[0, "#9fb2bb", 0.55], [1, "#b5c4cb", 0]]);
  radg("sunGlow", [[0, "#fbf3cf", 0.95], [0.35, "#eeeec2", 0.55], [1, "#c6dbd6", 0]]);
  radg("groundShadow", [[0, "#5d7686", 0.55], [0.7, "#6d8592", 0.3], [1, "#7c92a0", 0]]);
  lin("skyDay", [[0, "#5f8b9a"], [0.42, "#94b4b4"], [0.72, "#c7d6c6"], [1, "#dfe5d2"]]);
  lin("skyDusk", [[0, "#30485e"], [0.5, "#6a8498"], [0.8, "#d3a98c"], [1, "#efcfa8"]]);
  lin("skyNight", [[0, "#0b1725"], [0.6, "#1a2e45"], [1, "#2e4a63"]]);
  lin("skyBlue", [[0, "#7fb2cc"], [0.6, "#b6d4df"], [1, "#e2eeee"]]);
  lin("iceDay", [[0, "#e8f0ee"], [0.35, "#d7e5e8"], [1, "#b9cfd8"]]);
  lin("iceDusk", [[0, "#e9d7c6"], [0.4, "#b9c5cc"], [1, "#7f97a6"]]);
  lin("iceNight", [[0, "#3c566c"], [1, "#1c3044"]]);
  lin("water", [[0, "#1c4a63"], [0.35, "#0f2d43"], [1, "#040e18"]]);
  lin("waterLit", [[0, "#3f8aa6"], [0.4, "#1f5b7a"], [1, "#0a2438"]]);
  lin("iceBlock", [[0, "#f2f8f9"], [0.5, "#c8dde4"], [1, "#8fb3c2"]]);
  lin("ridge", [[0, "#dfe9ea"], [1, "#a9bdc6"]]);
  lin("ridgeShade", [[0, "#9fb4bf"], [1, "#b9cbd2"]]);
  lin("parka", [[0, "#e4572e"], [1, "#b53a1a"]]);
  lin("seal", [[0, "#6d7274"], [0.55, "#8d9192"], [1, "#c7c6bd"]]);
  lin("wood", [[0, "#6d5642"], [1, "#4a3a2c"]]);
  lin("houseA", [[0, "#7f9eb1"], [1, "#5f7f94"]]);
  lin("houseB", [[0, "#c98f5f"], [1, "#a06f46"]]);
  lin("houseC", [[0, "#b9c0a6"], [1, "#8e9880"]]);
  lin("fat", [[0, "#f3d77e"], [1, "#e0b857"]]);
  lin("cardBg", [[0, "#0f2433"], [1, "#071621"]]);
  lin("mapSea", [[0, "#17384e"], [1, "#0d2536"]]);
  lin("land", [[0, "#7b8b7a"], [1, "#5f6f60"]]);
  lin("ice2", [[0, "#eef5f6"], [1, "#c9dde4"]]);
}

// A soft contact shadow
function shadow(parent, cx, cy, rx, ry, o = 1) { return el("ellipse", { cx, cy, rx, ry, fill: "url(#groundShadow)", opacity: o }, parent); }

// Text in the channel's type: white heavy condensed with a black outline
function label(parent, x, y, text, size = 48, opts = {}) {
  const t = el("text", { x, y, "font-family": "League Gothic", "font-size": size, "text-anchor": opts.anchor || "middle", fill: opts.fill || "#ffffff", stroke: opts.stroke || "#000000", "stroke-width": opts.sw === undefined ? size * 0.09 : opts.sw, "paint-order": "stroke", "stroke-linejoin": "round", "letter-spacing": opts.ls || 0.5 }, parent);
  t.textContent = text;
  return t;
}
function pointer(parent, x, y, text, side = "left", size = 44) {
  const g = el("g", {}, parent);
  const dir = side === "left" ? 1 : -1; // triangle tip points at x,y
  el("path", { d: `M${x} ${y} L${x + dir * 26} ${y - 15} L${x + dir * 26} ${y + 15} Z`, fill: "#e8261c", stroke: "#000", "stroke-width": 1.5 }, g);
  label(g, x + dir * 38, y + size * 0.36, text, size, { anchor: dir > 0 ? "start" : "end" });
  return g;
}
