// Painted Arctic backgrounds in the same ink-and-gradient look as the bear.
function sky(g, mood = "day", sun = { x: 1240, y: 520, r: 620 }) {
  const fill = { day: "url(#skyDay)", dusk: "url(#skyDusk)", night: "url(#skyNight)", blue: "url(#skyBlue)" }[mood];
  el("rect", { x: -400, y: -200, width: 2720, height: 1100, fill }, g);
  if (mood !== "night") el("circle", { cx: sun.x, cy: sun.y, r: sun.r, fill: "url(#sunGlow)" }, g);
}
function ridge(g, x, horizon, w, h, seed = 1) {
  const r = rng(seed);
  const peak = x + w * (0.35 + r() * 0.3);
  el("path", { d: `M${x} ${horizon} L${peak} ${horizon - h} L${x + w} ${horizon} Z`, fill: "url(#ridge)" }, g);
  el("path", { d: `M${peak} ${horizon - h} L${peak - w * 0.06} ${horizon} L${x + w} ${horizon} Z`, fill: "url(#ridgeShade)", opacity: 0.8 }, g);
  el("path", { d: `M${x} ${horizon} L${peak} ${horizon - h} L${x + w} ${horizon}`, fill: "none", stroke: INK, "stroke-width": 2.2, "stroke-linejoin": "round" }, g);
}
function icePlain(g, horizon = 640, mood = "day", seed = 5, opts = {}) {
  const fill = { day: "url(#iceDay)", dusk: "url(#iceDusk)", night: "url(#iceNight)", blue: "url(#iceDay)" }[mood];
  const r = rng(seed);
  if (!opts.noRidges) {
    let x = -300;
    while (x < 2300) { const w = 110 + r() * 230, h = 18 + r() * r() * 92; ridge(g, x, horizon + 1, w, h, seed + x); x += w + r() * 170; }
  }
  el("rect", { x: -400, y: horizon, width: 2720, height: 1200, fill }, g);
  el("line", { x1: -400, y1: horizon, x2: 2320, y2: horizon, stroke: "#4d6470", "stroke-width": 1.5, opacity: 0.45 }, g);
  let s = "";
  for (let i = 0; i < 46; i++) {
    const depth = r(), y = horizon + 18 + depth * depth * (1080 - horizon), x = r() * 2400 - 200, len = 30 + depth * 240;
    s += `M${f1(x)} ${f1(y)}q${f1(len / 2)} ${f1((r() - 0.5) * 6)} ${f1(len)} 0`;
  }
  el("path", { d: s, fill: "none", stroke: mood === "night" ? "#6e8aa0" : "#fbfdfd", "stroke-width": 2.4, opacity: 0.8, "stroke-linecap": "round" }, g);
  let s2 = "";
  for (let i = 0; i < 26; i++) {
    const depth = r(), y = horizon + 26 + depth * depth * (1080 - horizon), x = r() * 2400 - 200, len = 24 + depth * 170;
    s2 += `M${f1(x)} ${f1(y)}q${f1(len / 2)} ${f1((r() - 0.5) * 5)} ${f1(len)} 0`;
  }
  el("path", { d: s2, fill: "none", stroke: "#7f98a6", "stroke-width": 1.8, opacity: 0.4, "stroke-linecap": "round" }, g);
}
// Drifting snow: position is a function of time, with wrap-around
class Snow {
  constructor(parent, n = 70, seed = 9, wind = 34, fall = 22, color = "#ffffff") {
    this.g = el("g", {}, parent); const r = rng(seed); this.f = [];
    this.wind = wind; this.fall = fall;
    for (let i = 0; i < n; i++) {
      const z = r();
      this.f.push({ x: r() * 2200, y: r() * 1240, z, ph: r() * 6, e: el("ellipse", { rx: 1.4 + z * 2.8, ry: 1 + z * 1.4, fill: color, opacity: 0.35 + z * 0.55 }, this.g) });
    }
  }
  set(t) {
    for (const p of this.f) {
      const x = ((p.x - this.wind * (0.4 + p.z) * t + Math.sin(t * 0.7 + p.ph) * 12) % 2200 + 2200) % 2200 - 140;
      const y = ((p.y + this.fall * (0.4 + p.z) * t) % 1240 + 1240) % 1240 - 80;
      p.e.setAttribute("cx", f1(x)); p.e.setAttribute("cy", f1(y));
    }
  }
}
// Breath vapour: puffs that rise and fade, function of time
class Breath {
  constructor(parent, n = 5, color = "#ffffff") { this.g = el("g", {}, parent); this.p = []; for (let i = 0; i < n; i++) this.p.push(el("circle", { fill: color, opacity: 0 }, this.g)); this.n = n; }
  set(t, x, y, dir = 1, period = 2.6, scale = 1) {
    this.p.forEach((c, i) => {
      const u = ((t / period + i / this.n) % 1);
      const on = u < 0.55 ? u / 0.55 : 0;
      c.setAttribute("cx", f1(x + dir * (on * 60 + i * 3) * scale)); c.setAttribute("cy", f1(y - on * 36 * scale - i)); c.setAttribute("r", f1((5 + on * 20) * scale));
      c.setAttribute("opacity", u < 0.55 ? (0.32 * (1 - on)).toFixed(3) : 0);
    });
  }
}
// Camera group: push and pan for the shot
function camera(g, x, y, z) { g.setAttribute("transform", `translate(960 540) scale(${z.toFixed(4)}) translate(${f1(-x)} ${f1(-y)})`); }
