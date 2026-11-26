// Scenes for the hunt, the senses, the data, real places, the den and the ice.
const proj = (m, lon, lat) => { const M = MAPS[m]; if (M.type === "polar") { const r = ((90 - lat) / (90 - M.latEdge)) * M.R, a = rad(lon - M.lon0); return [960 + r * Math.sin(a), 540 + r * Math.cos(a)]; } return [960 + (lon - M.cx) * M.k * M.s, 540 - (lat - M.cy) * M.s]; };
function mapBase(root, name, opts = {}) {
  const cam = el("g", {}, root), w = el("g", {}, cam);
  el("rect", { x: -600, y: -600, width: 3200, height: 2400, fill: "url(#mapSea)" }, w);
  if (opts.ice) el("circle", { cx: 960, cy: 540, r: opts.ice, fill: "#dcecf1", opacity: 0.9 }, w);
  el("path", { d: MAPS[name].d, fill: "#c8d2c2", stroke: "#2c3a33", "stroke-width": 2 / (opts.z || 1), "fill-rule": "evenodd" }, w);
  return { cam, w };
}
function pin(parent, x, y, text, size = 62, side = "left") {
  const g = el("g", { opacity: 0 }, parent);
  ink(g, `M${x} ${y} C${x - 22} ${y - 30} ${x - 26} ${y - 58} ${x} ${y - 66} C${x + 26} ${y - 58} ${x + 22} ${y - 30} ${x} ${y} Z`, "#e8261c", 3);
  el("circle", { cx: x, cy: y - 42, r: 9, fill: "#fff" }, g);
  if (text) label(g, x + (side === "left" ? 42 : -42), y - 26, text, size, { anchor: side === "left" ? "start" : "end" });
  return g;
}
const nf = (n) => n.toLocaleString("en-US");
const count = (node, t, a, b, to, suffix = "") => { node.textContent = nf(Math.round(to * easeOut(a, b, t))) + suffix; };

// Ice section: bear above, seal below
function iceSection(root, surface = 500) {
  const cam = el("g", {}, root), w = el("g", {}, cam);
  sky(w, "day", { x: 1400, y: surface - 120, r: 560 });
  ridge(w, 80, surface, 300, 44, 3); ridge(w, 1450, surface, 340, 60, 7);
  el("rect", { x: -400, y: surface, width: 2720, height: 1400, fill: "url(#water)" }, w);
  return { cam, w };
}
function iceLayer(w, surface, thick, holes) {
  let x = -400, d = "";
  holes = holes.slice().sort((a, b) => a - b);
  for (const h of holes.concat([2400])) {
    d += `M${x} ${surface} L${h - 50} ${surface} C${h - 40} ${surface + thick * 0.5} ${h - 36} ${surface + thick * 0.8} ${h - 44} ${surface + thick} L${x} ${surface + thick + 10} Z`;
    x = h + 50;
    if (h < 2400) d += `M${h + 44} ${surface + thick} C${h + 36} ${surface + thick * 0.8} ${h + 40} ${surface + thick * 0.5} ${h + 50} ${surface} L${h + 50} ${surface} Z`;
  }
  el("path", { d, fill: "url(#iceBlock)", stroke: INK, "stroke-width": 2.4 }, w);
  el("line", { x1: -400, y1: surface, x2: 2320, y2: surface, stroke: INK, "stroke-width": 2.4, opacity: 0.55 }, w);
  holes.forEach((h) => { el("rect", { x: h - 44, y: surface, width: 88, height: thick + 4, fill: "#123a52" }, w); el("ellipse", { cx: h, cy: surface, rx: 50, ry: 8, fill: "#0e2f42", stroke: INK, "stroke-width": 2 }, w); });
}

SCENES.underIce = (root, p, dur) => {
  const { cam, w } = iceSection(root, 300);
  iceLayer(w, 300, 130, [460, 1000, 1560]);
  const R = rays(el("g", {}, w), 6, 4, 430, 700);
  const seal = new Seal(w);
  const lb = label(root, 960, 960, "IT'S A MAMMAL. IT HAS TO BREATHE.", 86); lb.setAttribute("opacity", 0);
  const lb2 = pointer(root, 1060, 268, "BREATHING HOLE", "left", 56); lb2.setAttribute("opacity", 0);
  const scr = el("g", {}, root);
  return (t) => {
    camera(cam, 960, 540, 1); R(t);
    const u = clamp(t / 5.8), sx = lerp(180, 960, smooth(0, 1, u)), sy = lerp(760, 480, smooth(0.65, 1, u)), rot = lerp(0, -62, smooth(0.65, 1, u));
    seal.set({ x: sx, y: sy, s: 1, rot, t });
    fadeIn(lb, t, 0.5); lb.setAttribute("opacity", smooth(0.1, 0.4, t) * (1 - smooth(2.6, 2.9, t))); fadeIn(lb2, t, 2.9);
  };
};

// Bear lying low beside a breathing hole
function lying(b, q) {
  const pawX = q.x0 || 0;
  b.set(Object.assign({ walk: 0, drop: 62, torsoPitch: 3, headPitch: 15, feet: { rn: { x: -150, y: -22, p: 0 }, rf: { x: -126, y: -22, p: 0 }, fn: { x: 196, y: -22, p: 0 }, ff: { x: 218, y: -22, p: 0 } } }, q));
}
SCENES.findHole = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 440, snow: 44, wind: 46 });
  el("ellipse", { cx: 1520, cy: 860, rx: 110, ry: 26, fill: "#0e2f42", stroke: INK, "stroke-width": 3 }, fg);
  el("ellipse", { cx: 1520, cy: 866, rx: 86, ry: 16, fill: "#1a4a63" }, fg);
  const sh = shadow(fg, 0, 0, 1, 1), b = new Bear(fg);
  const a = label(root, 960, 200, "IT DOESN'T PACE. IT DOESN'T CIRCLE.", 92); a.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t);
    const stop = 3.1, lay = smooth(6.2, 8, t);
    const x = lerp(250, 860, easeOut(0, stop, t));
    const moving = 1 - smooth(stop - 0.6, stop, t);
    if (lay > 0) lying(b, { x: x, y: 880, s: 1.55, drop: 62 * lay, headPitch: 15 * lay, blink: t > 8 });
    else b.set({ x, y: 880, s: 1.55, phase: Math.min(t, stop) / 1.7, walk: moving, headPitch: 10 + 6 * smooth(stop - 1, stop, t) });
    sh.setAttribute("cx", x); sh.setAttribute("cy", 884); sh.setAttribute("rx", 430); sh.setAttribute("ry", 36);
    fadeIn(a, t, 3.9);
  };
};

SCENES.stillHunt = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 420, snow: 130, wind: 240, seed: 12, mood: p.mood || "day" });
  el("ellipse", { cx: 1570, cy: 830, rx: 130, ry: 30, fill: "#0e2f42", stroke: INK, "stroke-width": 3 }, fg); el("ellipse", { cx: 1570, cy: 838, rx: 100, ry: 18, fill: "#1a4a63" }, fg);
  shadow(fg, 880, 884, 470, 36);
  const b = new Bear(fg); const br = new Breath(fg, 4);
  const clk = el("g", {}, root);
  const words = [["TEN MINUTES", 0], ["AN HOUR", 1], ["SOMETIMES FAR LONGER", 2]].map(([w]) => { const l = label(root, 760, 220, w, 118); l.setAttribute("opacity", 0); return l; });
  const cold = label(root, 760, 220, "COLD THAT FREEZES SKIN IN MINUTES", 78, { fill: "#bfe6f2" }); cold.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, lerp(1, 1.1, t / dur)); snow.set(t);
    lying(b, { x: 880, y: 880, s: 1.62, blink: true, headPitch: 15 + Math.sin(t * 0.5) * 0.3 });
    br.set(t, 880 + 300 * 1.62, 880 - 120 * 1.62, 1, 4.5, 0.9);
    while (clk.firstChild) clk.removeChild(clk.firstChild);
    clockDial(clk, 1660, 240, 110, t / 8);
    [[0, 1], [1, 2], [2, 4]].forEach(([a, e], i) => words[i].setAttribute("opacity", smooth(a, a + 0.2, t) * (1 - smooth(e - 0.15, e, t))));
    fadeIn(cold, t, 4);
  };
};

SCENES.listen = (root, p, dur) => {
  const { cam, w } = iceSection(root, 500);
  iceLayer(w, 500, 150, [1240]);
  const b = new Bear(w), seal = new Seal(w);
  const ring = el("g", {}, w), Rg = [0, 1, 2].map(() => el("ellipse", { fill: "none", stroke: "#e4f6fa", "stroke-width": 4 }, ring));
  const lb = label(root, 650, 200, "ONE SOUND. A BREATH.", 118); lb.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1);
    lying(b, { x: 760, y: 500, s: 1.4, blink: t < dur - 1.2, headPitch: 18 });
    const up = smooth(0.6, dur - 0.2, t); seal.set({ x: 1240, y: lerp(980, 648, up), s: 0.92, rot: -82, t });
    Rg.forEach((e, i) => { const u = (t * 0.7 + i / 3) % 1; e.setAttribute("cx", 1240); e.setAttribute("cy", 500); e.setAttribute("rx", 30 + u * 150); e.setAttribute("ry", 6 + u * 20); e.setAttribute("opacity", (1 - u) * smooth(dur - 2.2, dur - 1.6, t)); });
    fadeIn(lb, t, 0.1);
  };
};

// Lunge: head drives into the hole, then the seal comes up. Kept wide, no injury shown.
SCENES.lunge = (root, p, dur) => {
  const { cam, w } = iceSection(root, 620);
  iceLayer(w, 620, 150, [1250]);
  const splash = el("g", {}, w), Dr = []; const R = rng(4); for (let i = 0; i < 22; i++) Dr.push({ a: -Math.PI * (0.1 + R() * 0.8), v: 200 + R() * 360, r: 3 + R() * 9, e: el("circle", { fill: "#d9f0f6", stroke: "#0e2f42", "stroke-width": 1.2 }, splash) });
  const seal = new Seal(w); const b = new Bear(w); const sh = shadow(w, 780, 622, 400, 26);
  const a1 = label(root, 960, 210, "IT DRIVES ITS HEAD DOWN INTO THE HOLE", 88); a1.setAttribute("opacity", 0);
  const a2 = label(root, 960, 210, "A 60 KG ANIMAL, STRAIGHT UP THROUGH THE ICE", 82); a2.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 560, 1);
    const hit = easeOut(0, 0.45, t), pull = smooth(4.8, 6.6, t);
    const x = lerp(860, 900, hit) - pull * 80;
    b.set({ x, y: 620, s: 1.45, walk: 0, torsoPitch: lerp(0, 16, hit) * (1 - pull) - pull * 6, pivotX: -124, pivotY: -168, headPitch: lerp(0, 42, hit) * (1 - pull) - pull * 6, feet: { rn: { x: -112, y: -22, p: 0 }, rf: { x: -92, y: -22, p: 0 }, fn: { x: 150, y: -22, p: 0 }, ff: { x: 186, y: -22, p: 0 } } });
    sh.setAttribute("cx", x);
    const sy = lerp(790, 490, smooth(4.8, 6.6, t)); seal.set({ x: 1250, y: sy, s: 0.85, rot: -85, t: t < 4.8 ? t : 0 });
    seal.g.setAttribute("opacity", 1);
    const u = clamp((t - 0.3) / 1.4);
    Dr.forEach((d) => { d.e.setAttribute("cx", f1(1250 + Math.cos(d.a) * d.v * u)); d.e.setAttribute("cy", f1(620 + Math.sin(d.a) * d.v * u + 420 * u * u)); d.e.setAttribute("r", d.r); d.e.setAttribute("opacity", u >= 1 || u <= 0 ? 0 : 1); });
    a1.setAttribute("opacity", smooth(0.3, 0.6, t) * (1 - smooth(4.4, 4.7, t))); fadeIn(a2, t, 4.9);
  };
};

SCENES.fatFirst = (root, p, dur) => {
  el("rect", { width: 1920, height: 1080, fill: "url(#cardBg)" }, root);
  const g = el("g", { transform: "translate(960 560)" }, root);
  const outer = "M-520 20 C-400 -130 -180 -220 40 -224 C260 -226 420 -170 520 -92 C580 -60 600 -20 590 30 C560 90 470 120 360 130 C160 170 -160 170 -350 130 C-420 110 -470 80 -520 20 Z";
  const inner = "M-430 20 C-340 -80 -170 -150 40 -156 C240 -158 390 -110 470 -60 C500 -40 510 -10 500 20 C470 60 400 76 330 80 C150 110 -150 110 -310 76 C-370 62 -400 44 -430 20 Z";
  ink(g, outer, "url(#fat)", 5); const fl = ink(g, inner, "#8e4a42", 4);
  const a = label(root, 960, 150, "IT EATS THE FAT FIRST", 130), b = label(root, 960, 900, "THE BLUBBER IS WHERE THE ENERGY IS", 86, { fill: "#ffe089" });
  a.setAttribute("opacity", 0); b.setAttribute("opacity", 0);
  const s1 = pointer(root, 1440, 450, "BLUBBER", "left", 70); s1.setAttribute("opacity", 0);
  return (t) => { fadeIn(a, t, 0.1); fadeIn(s1, t, 1.6); fadeIn(b, t, 2); fl.setAttribute("opacity", 1); g.setAttribute("transform", `translate(960 ${f1(560 + Math.sin(t * 0.8) * 3)}) scale(${(1 + t * 0.006).toFixed(3)})`); };
};

SCENES.scavenge = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 420, snow: 24 });
  const m = ink(fg, "M760 800 C780 760 900 740 1020 750 C1120 760 1170 780 1180 802 Z", "#8e6a62", 3); shadow(fg, 970, 806, 260, 18);
  const sh = shadow(fg, 0, 0, 1, 1), b = new Bear(fg);
  const fx = new Fox(fg), fx2 = new Fox(fg); const gl = el("g", {}, root);
  const t1 = label(root, 960, 190, "ARCTIC FOXES AND GULLS FOLLOW FOR THE LEFTOVERS", 80); t1.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t);
    const x = lerp(1450, 1980, t / dur); b.set({ x, y: 760, s: 0.9, phase: walkPh(t, 1.8) });
    sh.setAttribute("cx", x); sh.setAttribute("cy", 762); sh.setAttribute("rx", 250); sh.setAttribute("ry", 22);
    fx.set({ x: lerp(-40, 610, easeOut(0, 2, t)), y: 830, s: 1.25 }); fx2.set({ x: lerp(1960, 1270, easeOut(0.2, 2.4, t)), y: 880, s: 1.05, flip: true });
    while (gl.firstChild) gl.removeChild(gl.firstChild);
    [[500, 300], [800, 240], [1200, 330], [1400, 260], [1020, 420]].forEach(([gx, gy], i) => gull(gl, gx + Math.sin(t * 0.8 + i) * 80, gy + Math.cos(t + i) * 26, t, 1, i));
    fadeIn(t1, t, 0.3);
  };
};

SCENES.patience = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 520, mood: "dusk", snow: 26, sun: { x: 500, y: 510, r: 700 } });
  shadow(fg, 1120, 842, 420, 30);
  const b = new Bear(fg);
  const ws = ["PATIENT", "QUIET", "WAITING LONGER THAN ITS PREY CAN"].map((w, i) => { const l = label(root, 960, 200, w, i === 2 ? 90 : 170); l.setAttribute("opacity", 0); return l; });
  const at = p.at || [1, 3, 5.2];
  return (t) => { camera(cam, 960, 540, lerp(1, 1.08, t / dur)); snow.set(t); lying(b, { x: 1120, y: 840, s: 1.5, blink: blinkAt(t * 0.4), headPitch: 14 }); ws.forEach((n, i) => { const a = at[i], e = i + 1 < ws.length ? at[i + 1] : dur + 1; n.setAttribute("opacity", smooth(a, a + 0.25, t) * (1 - smooth(e - 0.15, e, t))); }); };
};

SCENES.nosePow = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 520, snow: 30, sun: { x: 300, y: 500, r: 640 } });
  const b = new Bear(fg); const wv = el("g", {}, root), W2 = [0, 1, 2, 3, 4, 5].map(() => el("path", { fill: "none", stroke: "#ffd76a", "stroke-width": 7, "stroke-linecap": "round" }, wv));
  const t1 = label(root, 700, 170, p.text || "AN EXTRAORDINARY NOSE", 110); t1.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t);
    b.set({ x: -250, y: 1560, s: 3.3, walk: 0, headPitch: -5 + Math.sin(t * 1.7) * 4, blink: blinkAt(t) });
    W2.forEach((e, i) => { const u = (t * 0.35 + i / 6) % 1, r = lerp(620, 50, u), nx = 1120, ny = 830; e.setAttribute("d", `M${f1(nx + r * Math.cos(-0.7))} ${f1(ny + r * Math.sin(-0.7))} A${f1(r)} ${f1(r)} 0 0 1 ${f1(nx + r * Math.cos(0.7))} ${f1(ny + r * Math.sin(0.7))}`); e.setAttribute("opacity", (Math.sin(u * Math.PI) * 0.9).toFixed(2)); });
    fadeIn(t1, t, 0.3);
  };
};

SCENES.smellRange = (root, p, dur) => {
  const cam = el("g", {}, root);
  el("rect", { width: 1920, height: 1080, fill: "url(#iceDay)" }, cam);
  const R = rng(3); let d = ""; for (let i = 0; i < 40; i++) { const x = R() * 1920, y = R() * 1080, l = 60 + R() * 160; d += `M${f1(x)} ${f1(y)} l${f1(l * 0.5)} ${f1(R() * 30 - 15)} l${f1(l * 0.5)} ${f1(R() * 30 - 15)}`; } el("path", { d, stroke: "#8fb3c2", "stroke-width": 2.2, fill: "none" }, cam);
  el("ellipse", { cx: 1500, cy: 450, rx: 30, ry: 22, fill: "#0e2f42", stroke: INK, "stroke-width": 3 }, cam);
  const wv = el("g", {}, cam), Wv = [0, 1, 2, 3, 4].map(() => el("circle", { cx: 1500, cy: 450, fill: "none", stroke: "#d47f18", "stroke-width": 5 }, wv));
  el("path", { d: "M430 800 L1470 480", stroke: "#14181d", "stroke-width": 5, "stroke-dasharray": "14 12" }, cam);
  const b = new Bear(cam, { ticks: 0.4 }); b.set({ x: 380, y: 860, s: 0.55, walk: 0 });
  const t1 = label(root, 960, 440, "WELL OVER HALF A KILOMETER", 96); t1.setAttribute("opacity", 0);
  const sec = el("g", { opacity: 0 }, root);
  el("rect", { width: 1920, height: 1080, fill: "url(#skyBlue)" }, sec);
  el("path", { d: "M-20 360 C420 320 760 330 1000 300 C1300 280 1560 330 1950 320 L1950 1100 L-20 1100 Z", fill: "#f1f7f8", stroke: INK, "stroke-width": 3 }, sec);
  el("rect", { y: 800, width: 1920, height: 300, fill: "url(#iceBlock)" }, sec);
  el("rect", { x: 880, y: 620, width: 460, height: 190, rx: 90, fill: "#3a4f5a", stroke: INK, "stroke-width": 3 }, sec);
  const seal = new Seal(sec); seal.set({ x: 1110, y: 740, s: 0.95 });
  const bb = new Bear(sec, { ticks: 0.5 }); bb.set({ x: 420, y: 345, s: 0.95, walk: 0, headPitch: 22 });
  const wv2 = el("g", {}, sec), W2 = [0, 1, 2, 3].map(() => el("path", { fill: "none", stroke: "#d47f18", "stroke-width": 6, "stroke-linecap": "round" }, wv2));
  el("path", { d: "M1420 330 V800 M1400 330 H1440 M1400 800 H1440", stroke: INK, "stroke-width": 6, fill: "none" }, sec);
  label(sec, 1460, 580, "ABOUT 1 M", 92, { anchor: "start" }); label(sec, 1460, 660, "OF PACKED SNOW", 58, { anchor: "start" });
  return (t) => {
    Wv.forEach((c, i) => { const u = (t * 0.35 + i / 5) % 1; c.setAttribute("r", 30 + u * 400); c.setAttribute("opacity", (1 - u) * 0.8); });
    fadeIn(t1, t, 0.5);
    const k = smooth(6.2, 6.5, t); sec.setAttribute("opacity", k);
    W2.forEach((e, i) => { const u = (t * 0.45 + i / 4) % 1, x = lerp(960, 620, u), y = lerp(620, 300, u); e.setAttribute("d", `M${f1(x - 50)} ${f1(y + 16)} Q${f1(x)} ${f1(y - 14)} ${f1(x + 50)} ${f1(y + 16)}`); e.setAttribute("opacity", Math.sin(u * Math.PI) * k); });
  };
};

SCENES.camp = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 420, snow: 18 });
  tent(fg, 960, 640, 2); shadow(fg, 960, 648, 240, 22);
  const it = [];
  const add = (x, y, name, at, draw) => { const g = el("g", { opacity: 0 }, fg); draw(g, x, y); label(g, x, y + 70, name, 66); it.push({ g, at }); };
  add(340, 800, "YOUR STOVE", 2.1, (g, x, y) => { ink(g, `M${x - 66} ${y} h132 v-46 h-132 Z`, "#6d767c", 3); ink(g, `M${x - 36} ${y - 46} v-52 h72 v52 Z`, "#ad5a2e", 3); });
  add(760, 880, "YOUR FOOD", 3.3, (g, x, y) => { ink(g, `M${x - 80} ${y} h160 v-60 h-160 Z`, "#d9c28b", 3); ink(g, `M${x - 42} ${y - 60} v-46 h84 v46 Z`, "#9d3f30", 3); });
  add(1170, 880, "YOUR SWEAT", 4.4, (g, x, y) => { ink(g, `M${x - 66} ${y} l10 -92 h20 l10 16 h52 l10 -16 h20 l10 92 Z`, "#e4572e", 3); });
  add(1590, 800, "YOUR TRASH", 5.4, (g, x, y) => { ink(g, `M${x - 60} ${y} C${x - 80} ${y - 70} ${x - 40} ${y - 110} ${x} ${y - 120} C${x + 40} ${y - 110} ${x + 80} ${y - 70} ${x + 60} ${y} Z`, "#2d3238", 3); });
  return (t) => { camera(cam, 960, 540, lerp(1.02, 1.08, t / dur)); snow.set(t); it.forEach((o) => o.g.setAttribute("opacity", smooth(o.at, o.at + 0.3, t))); };
};

SCENES.campWind = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 500, snow: 40, wind: -60 });
  tent(fg, 280, 760, 1.2); shadow(fg, 280, 764, 150, 14);
  const sh = shadow(fg, 0, 0, 1, 1), b = new Bear(fg);
  const lg = el("g", {}, root), R = rng(8), L = []; for (let i = 0; i < 22; i++) L.push({ y: 620 + R() * 150, ph: R(), l: 80 + R() * 120, e: el("path", { fill: "none", stroke: i % 2 ? "#ffd76a" : "#fff", "stroke-width": 4.5, "stroke-linecap": "round" }, lg) });
  const sign = label(root, 760, 330, "\"SOMETHING HERE\"", 150); sign.setAttribute("opacity", 0);
  const tx = label(root, 960, 1000, "IT CAN SIMPLY FOLLOW THE AIR", 78); tx.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t);
    const bx = lerp(1700, 1120, smooth(4, dur, t));
    b.set({ x: bx, y: 780, s: 0.95, flip: true, phase: walkPh(t, 1.8), walk: t > 3.6 ? 1 : 0, headPitch: -14 + Math.sin(t * 1.6) * 5 });
    sh.setAttribute("cx", bx); sh.setAttribute("cy", 784); sh.setAttribute("rx", 260); sh.setAttribute("ry", 24);
    L.forEach((o) => { const u = (t * 0.3 + o.ph) % 1, x = lerp(360, 1900, u); o.e.setAttribute("d", `M${f1(x)} ${f1(o.y)} q${f1(o.l / 2)} ${f1(Math.sin(t * 2 + o.ph * 6) * 10)} ${f1(o.l)} 0`); o.e.setAttribute("opacity", (Math.sin(u * Math.PI) * 0.8).toFixed(2)); });
    sign.setAttribute("opacity", smooth(3, 3.4, t) * (1 - smooth(7.4, 7.7, t))); fadeIn(tx, t, 10.4);
  };
};

// Route of the collared bear across the Beaufort Sea
SCENES.swimMap = (root, p, dur) => {
  const { cam, w } = mapBase(root, "beaufort");
  const A = proj("beaufort", -148, 71), B = proj("beaufort", -146, 74.2), C = proj("beaufort", -135, 75.5), D = proj("beaufort", -129, 75);
  const route = `M${A[0]} ${A[1]} C${B[0]} ${B[1]} ${C[0]} ${C[1]} ${D[0]} ${D[1]}`;
  const r = el("path", { d: route, fill: "none", stroke: "#ffd21f", "stroke-width": 9, "stroke-linecap": "round" }, w);
  const L = pathOf(route).getTotalLength(); r.setAttribute("stroke-dasharray", L); const mp = pathOf(route);
  const dot = el("circle", { r: 15, fill: "#fff", stroke: INK, "stroke-width": 4 }, w);
  label(w, proj("beaufort", -150, 69.6)[0], proj("beaufort", -150, 69.6)[1], "ALASKA", 72); const bs = proj("beaufort", -140, 72.6); label(w, bs[0], bs[1], "BEAUFORT SEA", 62, { fill: "#bcd9e3" });
  const box = el("g", {}, root); ink(box, "M1250 760 h600 v250 h-600 Z", "#0e1a22", 4);
  const days = label(box, 1550, 880, "0 DAYS", 130, { sw: 0, fill: "#fff" }), km = label(box, 1550, 980, "0 KM", 92, { sw: 0, fill: "#ffd21f" });
  return (t) => {
    const u = smooth(2.2, dur - 1, t); r.setAttribute("stroke-dashoffset", L * (1 - u));
    const pa = (mp.setAttribute("d", route), mp.getPointAtLength(L * u)); dot.setAttribute("cx", pa.x); dot.setAttribute("cy", pa.y);
    const dn = Math.round(9 * u); days.textContent = dn + (dn === 1 ? " DAY" : " DAYS"); km.textContent = Math.round(687 * u) + " KM";
    camera(cam, 960, 540, lerp(1, 1.05, t / dur));
  };
};

SCENES.weightBar = (root, p, dur) => {
  el("rect", { width: 1920, height: 1080, fill: "url(#cardBg)" }, root);
  const bg = el("rect", { x: 260, y: 300, width: 1400, height: 130, fill: "#22313b", stroke: "#fff", "stroke-width": 4 }, root);
  const fill = el("rect", { x: 260, y: 300, height: 130, fill: "#f6efdc" }, root);
  const lose = el("rect", { y: 300, height: 130, fill: "#e8261c", opacity: 0.85 }, root);
  const t1 = label(root, 960, 230, "SHE LOST MORE THAN A FIFTH OF HER BODY WEIGHT", 86);
  t1.setAttribute("opacity", 0);
  const mom = new Bear(root, { ticks: 0.6, thin: 0.8 }); const cub = new Bear(root, { ticks: 0.4, seed: 22 });
  const t2 = label(root, 960, 1000, "SHE ARRIVED ALONE", 110); t2.setAttribute("opacity", 0);
  return (t) => {
    const u = smooth(0.2, 2.2, t), w = 1400 * (1 - 0.22 * u);
    fill.setAttribute("width", w); lose.setAttribute("x", 260 + w); lose.setAttribute("width", 1400 - w);
    fadeIn(t1, t, 0.1);
    mom.set({ x: 760, y: 850, s: 1.05, phase: walkPh(t, 1.9), thin: 0.8, blink: blinkAt(t) });
    cub.set({ x: 1240, y: 850, s: 0.36, phase: walkPh(t, 1.2) }); cub.g.setAttribute("opacity", 1 - smooth(2.5, 5, t));
    fadeIn(t2, t, 5.2);
  };
};

SCENES.nightCamp = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 560, mood: "night", snow: 30 });
  const R = rng(4), st = el("g", {}, cam); for (let i = 0; i < 120; i++) el("circle", { cx: R() * 1920, cy: R() * 520, r: 0.8 + R() * 1.8, fill: "#e8f0f8", opacity: 0.4 + R() * 0.6 }, st);
  tent(fg, 880, 780, 1.7, "#b7792d");
  const glow = el("ellipse", { cx: 880, cy: 740, rx: 240, ry: 110, fill: "url(#sunGlow)", opacity: 0.45 }, fg);
  const h = new Human(fg); h.set({ x: 1290, y: 850, s: 1.6, walk: 0, look: 2 });
  ink(fg, "M1320 760 l90 -22", "none", 6);
  const beam = el("path", { fill: "#fbf3cf", opacity: 0.22 }, fg);
  const tx = label(root, 960, 200, "WHAT KEEPS ARCTIC RESEARCHERS AWAKE AT NIGHT?", 88); tx.setAttribute("opacity", 0);
  return (t) => { camera(cam, 960, 540, lerp(1, 1.06, t / dur)); snow.set(t); const a = Math.sin(t * 0.7) * 0.2; beam.setAttribute("d", `M1400 742 L${f1(1920)} ${f1(600 + a * 400)} L${f1(1920)} ${f1(860 + a * 400)} Z`); fadeIn(tx, t, 2.6); glow.setAttribute("opacity", 0.4 + Math.sin(t * 3) * 0.03); };
};

// Brown bear on a forest trail: the defensive kind of encounter
SCENES.trail = (root, p, dur) => {
  if (!document.getElementById("brownTint")) { const f = el("filter", { id: "brownTint" }, document.getElementById("gDefs")); el("feColorMatrix", { type: "matrix", values: "0.56 0 0 0 0.02  0 0.40 0 0 0  0 0 0.28 0 0  0 0 0 1 0" }, f); }
  const cam = el("g", {}, root), w = el("g", {}, cam);
  el("rect", { x: -200, y: -100, width: 2320, height: 800, fill: "#a8c6b4" }, w);
  el("rect", { x: -200, y: 640, width: 2320, height: 500, fill: "#6d7f4e" }, w);
  el("path", { d: "M-200 900 C400 760 1300 760 2100 860 L2100 1040 C1300 930 400 940 -200 1060 Z", fill: "#b59d76" }, w);
  const R = rng(5); for (let i = 0; i < 22; i++) shrub(w, R() * 2200 - 140, 660 + R() * 40, 1.2 + R() * 1.1);
  const sh = shadow(w, 1320, 918, 380, 30); const b = new Bear(w, { ticks: 0.7 }); b.g.setAttribute("filter", "url(#brownTint)");
  const h = new Human(w, { coat: "#3f6e8c" }); shadow(w, 480, 902, 60, 9);
  const t1 = label(root, 960, 170, p.text1 || "MOST BEAR ATTACKS ARE DEFENSIVE", 100); t1.setAttribute("opacity", 0);
  const t2 = label(root, 960, 170, "STOP BEING A THREAT AND IT VERY OFTEN LEAVES", 86); t2.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1);
    const leave = smooth(dur - 5.6, dur - 2, t), back = smooth(dur - 7, dur - 5, t);
    const x = lerp(1320, 2200, leave);
    b.set({ x, y: 912, s: 1.25, flip: leave <= 0, walk: leave > 0 ? 1 : 0.15, phase: walkPh(t, 1.7), torsoPitch: leave > 0 ? 0 : -3 - Math.sin(t * 3) });
    sh.setAttribute("cx", x);
    h.set({ x: 480 - back * 90, y: 900, s: 1.55, walk: back > 0 && back < 1 ? 0.5 : 0, phase: -t * 0.7, arm: -40, armF: -40, look: 2 });
    t1.setAttribute("opacity", smooth(0.1, 0.4, t) * (1 - smooth(dur - 7, dur - 6.7, t))); fadeIn(t2, t, dur - 6.5);
  };
};

SCENES.foodLook = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 520, mood: "dusk", snow: 26 });
  shadow(fg, 300, 824, 60, 9); const h = new Human(fg); h.set({ x: 300, y: 820, s: 1.5, walk: 0 });
  shadow(fg, 1320, 874, 430, 34); const b = new Bear(fg);
  const tx = label(root, 960, 210, "FAR MORE LIKELY TO BE ABOUT FOOD", 112); tx.setAttribute("opacity", 0);
  return (t) => { camera(cam, 960, 540, lerp(1, 1.05, t / dur)); snow.set(t); b.set({ x: 1320, y: 870, s: 1.55, flip: true, walk: 0.2, phase: t * 0.2, headPitch: -4, blink: blinkAt(t) }); fadeIn(tx, t, 0.2); };
};

SCENES.studyMap = (root, p, dur) => {
  const { cam, w } = mapBase(root, "polar");
  const pins = [["CANADA", -100, 62, "left"], ["USA", -152, 66, "right"], ["GREENLAND", -41, 72, "left"], ["NORWAY", 16, 74, "left"], ["RUSSIA", 100, 68, "right"]].map(([n, lo, la, s]) => { const q = proj("polar", lo, la); return pin(w, q[0], q[1], n, 58, s); });
  const yr = label(root, 960, 110, "EVERY ATTACK THEY COULD FIND", 92); yr.setAttribute("opacity", 0);
  const yr2 = label(root, 960, 1040, "RECORDS BACK TO 1870", 80, { fill: "#ffe089" }); yr2.setAttribute("opacity", 0);
  const at = [6.74, 7.66, 9.14, 10.12, 11];
  return (t) => { camera(cam, 960, 540, lerp(0.96, 1.02, t / dur)); pins.forEach((g, i) => g.setAttribute("opacity", smooth(at[i], at[i] + 0.2, t))); fadeIn(yr, t, 0.3); fadeIn(yr2, t, 12); };
};

SCENES.stats = (root, p, dur) => {
  el("rect", { width: 1920, height: 1080, fill: "url(#cardBg)" }, root);
  const mk = (x, name, color, at) => { const g = el("g", { opacity: 0 }, root); const n = label(g, x, 560, "0", 300, { fill: color, sw: 0 }); label(g, x, 690, name, 74, { fill: "#dfeaee" }); return { g, n, at }; };
  const c = [mk(380, "ATTACKS", "#ffffff", 0.1), mk(960, "KILLED", "#ff5a3c", 2), mk(1540, "INJURED", "#ffd21f", 3.8)];
  const to = [73, 20, 63];
  return (t) => c.forEach((o, i) => { o.g.setAttribute("opacity", smooth(o.at, o.at + 0.2, t)); o.n.textContent = Math.round(to[i] * easeOut(o.at, o.at + 1, t)); });
};

SCENES.thinBear = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 520, mood: "dusk", snow: 46, wind: 70 });
  const sh = shadow(fg, 0, 0, 1, 1); const b = new Bear(fg, { thin: 1 });
  const ws = (p.words || ["POOR CONDITION", "THIN", "HUNGRY"]).map((w) => { const l = label(root, 960, 200, w, p.words ? 118 : 150); l.setAttribute("opacity", 0); return l; });
  return (t) => {
    camera(cam, 960, 540, lerp(1, 1.06, t / dur)); snow.set(t);
    const x = lerp(520, 1020, t / dur); b.set({ x, y: 880, s: 1.55, thin: 1, phase: walkPh(t, 2.1), headPitch: 12, blink: blinkAt(t) });
    sh.setAttribute("cx", x); sh.setAttribute("cy", 884); sh.setAttribute("rx", 410); sh.setAttribute("ry", 32);
    const at = p.at || [0.1, 2.1, 4];
    ws.forEach((n, i) => { const e = i + 1 < ws.length ? at[i + 1] : dur + 1; n.setAttribute("opacity", smooth(at[i], at[i] + 0.2, t) * (1 - smooth(e - 0.12, e, t))); });
  };
};

SCENES.pushedOff = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 460, snow: 26 });
  el("ellipse", { cx: 900, cy: 760, rx: 110, ry: 24, fill: "#0e2f42", stroke: INK, "stroke-width": 3 }, fg);
  shadow(fg, 700, 860, 480, 40); const big = new Bear(fg, { fat: 1 }); big.set({ x: 610, y: 850, s: 1.7, walk: 0, fat: 1 });
  const shs = shadow(fg, 0, 0, 1, 1); const y = new Bear(fg, { thin: 0.75, seed: 19 });
  const tx = label(root, 960, 180, "YOUNG MALES, STILL LEARNING TO HUNT", 94); tx.setAttribute("opacity", 0);
  const tx2 = label(root, 960, 180, "PUSHED OFF THE BEST SPOTS BY BIGGER BEARS", 84); tx2.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t);
    big.set({ x: 610, y: 850, s: 1.7, walk: 0, fat: 1, jaw: t > 3.4 ? 5 : 0, blink: blinkAt(t) });
    const x = lerp(1250, 1700, smooth(3.6, dur, t));
    y.set({ x, y: 880, s: 0.95, thin: 0.75, phase: walkPh(t, 1.4), walk: t < 3.6 ? 0.2 : 1, flip: t < 3.6 });
    shs.setAttribute("cx", x); shs.setAttribute("cy", 884); shs.setAttribute("rx", 260); shs.setAttribute("ry", 24);
    tx.setAttribute("opacity", smooth(0.1, 0.4, t) * (1 - smooth(3.3, 3.6, t))); fadeIn(tx2, t, 3.7);
  };
};

SCENES.fedVsHungry = (root, p, dur) => {
  const a = el("g", {}, root), c = el("g", {}, root);
  const cp1 = el("clipPath", { id: "lftClip" }, root); el("rect", { width: 958, height: 1080 }, cp1); const cp2 = el("clipPath", { id: "rgtClip" }, root); el("rect", { x: 962, width: 958, height: 1080 }, cp2);
  a.setAttribute("clip-path", "url(#lftClip)"); c.setAttribute("clip-path", "url(#rgtClip)");
  const lw = el("g", {}, a); sky(lw, "day", { x: 500, y: 560, r: 520 }); icePlain(lw, 590, "day", 4);
  const rw = el("g", {}, c); sky(rw, "dusk", { x: 1500, y: 560, r: 500 }); icePlain(rw, 590, "dusk", 9);
  el("rect", { x: 958, width: 4, height: 1080, fill: INK }, root);
  const h = new Human(lw), h2 = new Human(rw);
  const f = new Bear(lw, { fat: 1 }), tn = new Bear(rw, { thin: 1, seed: 16 });
  label(root, 480, 180, "WELL FED", 120); label(root, 1440, 180, "STARVING", 120, { fill: "#ff8a6c" });
  const l1 = label(root, 480, 1010, "LITTLE REASON TO BOTHER YOU", 58), l2 = label(root, 1440, 1010, "YOU MAY BE THE BEST MEAL IN WEEKS", 54);
  l1.setAttribute("opacity", 0); l2.setAttribute("opacity", 0);
  return (t) => {
    h.set({ x: 110, y: 800, s: 1.05, walk: 0 }); h2.set({ x: 1060, y: 800, s: 1.05, walk: 0 });
    f.set({ x: lerp(560, 760, t / dur), y: 850, s: 0.95, fat: 1, phase: walkPh(t, 1.9) });
    tn.set({ x: lerp(1800, 1540, t / dur), y: 850, s: 0.95, thin: 1, flip: true, phase: walkPh(t, 2), headPitch: -6, blink: blinkAt(t) });
    fadeIn(l1, t, 0.8); fadeIn(l2, t, 3.6);
  };
};

SCENES.timeline = (root, p, dur) => {
  el("rect", { width: 1920, height: 1080, fill: "url(#cardBg)" }, root);
  const D = []; for (let i = 0; i < 73; i++) { const c = i % 19, r = Math.floor(i / 19); D.push({ x: 240 + c * 80, y: 480 + r * 86, at: 0.3 + i * 0.035, e: el("circle", { cx: 240 + c * 80, cy: 480 + r * 86, r: 28, fill: "#ff5a3c", opacity: 0 }, root) }); }
  label(root, 960, 240, "73 ATTACKS", 170); label(root, 960, 345, "ACROSS NEARLY 150 YEARS", 88, { fill: "#ffe089" });
  return (t) => D.forEach((d) => d.e.setAttribute("opacity", smooth(d.at, d.at + 0.1, t)));
};

SCENES.fewPeople = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 460, snow: 24 });
  const it = []; const add = (x, y, name, at, fn) => { const g = el("g", { opacity: 0 }, fg); fn(g, x, y); label(g, x, y + 60, name, 62); it.push({ g, at }); };
  add(350, 690, "SMALL TOWNS", 0.1, (g, x, y) => { house(g, x - 150, y, 130, 90, "url(#houseA)"); house(g, x + 10, y, 120, 80, "url(#houseB)"); });
  add(860, 780, "HUNTERS", 1.1, (g, x, y) => { [-50, 40].forEach((d) => { const h = new Human(g, { coat: "#5b6d58" }); h.set({ x: x + d, y, s: 1.1, walk: 0 }); }); });
  add(1320, 700, "RESEARCH CAMPS", 2.1, (g, x, y) => { tent(g, x, y, 1.1); });
  add(1680, 840, "A FEW TOURISTS", 3.3, (g, x, y) => { [-40, 40].forEach((d) => { const h = new Human(g, { coat: "#3d76a8" }); h.set({ x: x + d, y, s: 0.95, walk: 0 }); }); });
  const tx = label(root, 960, 190, "THE NUMBER OF MEETINGS IS SMALL", 110); tx.setAttribute("opacity", 0);
  return (t) => { camera(cam, 960, 540, 1); snow.set(t); it.forEach((o) => o.g.setAttribute("opacity", smooth(o.at, o.at + 0.3, t))); fadeIn(tx, t, 4.6); };
};

// ---- Real incidents: told with place, date and aftermath only. Nobody is shown being hurt. ----
SCENES.placeCard = (root, p, dur) => {
  const { cam, w } = mapBase(root, p.map);
  const q = proj(p.map, p.lon, p.lat), g = pin(w, q[0], q[1], "", 60);
  const t1 = label(root, 960, 250, p.place, 150), t2 = label(root, 960, 350, p.date, 80, { fill: "#ffe089" });
  t1.setAttribute("opacity", 0); t2.setAttribute("opacity", 0);
  const zoom = p.zoom || 1.5;
  return (t) => { camera(cam, q[0], q[1], lerp(1, zoom, smooth(0, dur, t))); g.setAttribute("opacity", smooth(0.3, 0.5, t)); fadeIn(t1, t, 0.3); fadeIn(t2, t, 0.8); };
};

SCENES.glacierCamp = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 430, mood: "dusk", snow: 40, sun: { x: 1500, y: 430, r: 620 } });
  [[-30, 60], [200, 110], [600, 70], [1100, 130], [1500, 80]].forEach(([x, h], i) => ridge(fg, x, 432, 420, h, i + 2));
  const ts = [[660, 650, "#d9772c"], [930, 610, "#5f8197"], [1180, 660, "#d9772c"], [900, 730, "#7f9e62"]]; ts.forEach(([x, y, c]) => tent(fg, x, y, 1, c));
  const wire = el("path", { d: "M420 800 L560 560 L1400 560 L1520 800 Z", fill: "none", stroke: "#3a4750", "stroke-width": 3, "stroke-dasharray": "2 8" }, fg);
  [[420, 800], [560, 560], [1400, 560], [1520, 800]].forEach(([x, y]) => ink(fg, `M${x} ${y} v-40`, "none", 5));
  const fl = ink(fg, "M1400 520 l0 -30", "none", 8, { stroke: "#b5261c" });
  const lb = pointer(root, 1420, 500, "TRIPWIRE FLARE", "left", 60); lb.setAttribute("opacity", 0);
  const sh = shadow(fg, 0, 0, 1, 1), b = new Bear(fg);
  const tx = label(root, 960, 960, p.text || "", 72); tx.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t); fadeIn(lb, t, 0.4); lb.setAttribute("opacity", smooth(0.4, 0.7, t) * (p.bear ? 1 - smooth(1.6, 2, t) : 1));
    if (p.bear) { const x = lerp(1880, 1460, t / dur); b.set({ x, y: 830, s: 0.72, flip: true, phase: walkPh(t, 1.9), headPitch: 6 }); sh.setAttribute("cx", x); sh.setAttribute("cy", 832); sh.setAttribute("rx", 200); sh.setAttribute("ry", 20); } else { b.g.setAttribute("opacity", 0); }
    if (p.text) fadeIn(tx, t, 0.6);
  };
};

SCENES.islandKids = (root, p, dur) => {
  const cam = el("g", {}, root), w = el("g", {}, cam);
  sky(w, "dusk", { x: 1560, y: 520, r: 600 });
  el("rect", { x: -300, y: 520, width: 2520, height: 640, fill: "url(#waterLit)" }, w);
  el("path", { d: "M-300 760 C200 660 780 660 1160 720 C1280 744 1340 790 1400 860 L1400 1180 L-300 1180 Z", fill: "#7a8675", stroke: INK, "stroke-width": 3 }, w);
  ink(w, "M1500 830 C1580 860 1740 860 1820 820 L1790 880 C1720 900 1580 900 1520 880 Z", "#a93c26", 3);
  const k1 = new Human(w, { coat: "#d9a12c" }), k2 = new Human(w, { coat: "#3d76a8" }), dad = new Human(w, { coat: "#3c5244" });
  const far = new Bear(w, { ticks: 0.4 });
  const tx = label(root, 960, 170, p.text || "HE TOLD HIS CHILDREN TO RUN FOR THE BOAT", 88); tx.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1);
    const u = smooth(0, dur, t);
    k1.set({ x: lerp(760, 1400, u), y: lerp(780, 840, u), s: 0.82, phase: t / 0.5, stride: 36 }); k2.set({ x: lerp(660, 1330, u), y: lerp(790, 850, u), s: 0.78, phase: t / 0.46 + 0.3, stride: 36 });
    dad.set({ x: 560, y: 830, s: 1.2, walk: 0, flip: true, arm: 30, armF: 30 });
    far.set({ x: 180, y: 810, s: 0.5, phase: walkPh(t, 1.8) }); far.g.setAttribute("opacity", 0.85);
    fadeIn(tx, t, 0.2);
  };
};

SCENES.boatDawn = (root, p, dur) => {
  const cam = el("g", {}, root), w = el("g", {}, cam);
  sky(w, "dusk", { x: 960, y: 520, r: 780 });
  el("rect", { x: -300, y: 520, width: 2520, height: 700, fill: "url(#waterLit)" }, w);
  const bt = el("g", {}, w);
  ink(bt, "M-150 0 C-70 34 90 34 170 -6 L140 56 C70 76 -80 76 -120 56 Z", "#a93c26", 3);
  const a = new Human(bt, { coat: "#d9a12c" }), c = new Human(bt, { coat: "#3d76a8" }); a.set({ x: -40, y: 10, s: 0.6, walk: 0 }); c.set({ x: 40, y: 10, s: 0.56, walk: 0 });
  const ripple = el("g", {}, w), Rr = [0, 1, 2, 3].map(() => el("path", { fill: "none", stroke: "#cfe7ef", "stroke-width": 3, opacity: 0.5 }, ripple));
  return (t) => { camera(cam, 960, 540, lerp(1, 1.08, t / dur)); bt.setAttribute("transform", `translate(${f1(960 + t * 16)} ${f1(700 + Math.sin(t * 1.2) * 6)}) rotate(${f1(Math.sin(t * 1.2) * 1.6)})`); Rr.forEach((e, i) => { const y = 780 + i * 60; e.setAttribute("d", `M${200 + i * 60} ${y} q300 ${f1(Math.sin(t + i) * 10)} 600 0 t600 0`); }); };
};

SCENES.school = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 540, mood: "night", snow: 70, wind: 60 });
  house(fg, 620, 720, 680, 190, "url(#houseC)");
  el("rect", { x: 880, y: 450, width: 160, height: 40, fill: "#14181d" }, fg);
  [[250, 690, 140, 90], [1480, 700, 160, 100]].forEach(([x, y, w2, h]) => house(fg, x, y, w2, h, "url(#houseA)"));
  ink(fg, "M1400 720 V420", "none", 6); const flag = ink(fg, "M1400 420 h70 v42 h-70 Z", "#3d76a8", 2.4);
  const tx = label(root, 960, 210, p.text || "", 86); tx.setAttribute("opacity", 0);
  return (t) => { camera(cam, 960, 560, lerp(1.0, 1.08, t / dur)); snow.set(t); if (p.text) fadeIn(tx, t, 0.3); };
};

SCENES.threePlaces = (root, p, dur) => {
  const { cam, w } = mapBase(root, "polar");
  const ps = [["SVALBARD, 2011", 16, 78, "left"], ["NUNAVUT, 2018", -94, 61, "left"], ["ALASKA, 2023", -168, 65.6, "right"]].map(([n, lo, la, s]) => { const q = proj("polar", lo, la); return pin(w, q[0], q[1], n, 62, s); });
  const tx = label(root, 960, 110, "IT WASN'T CORNERED. IT CAME IN.", 110); tx.setAttribute("opacity", 0);
  return (t) => { camera(cam, 960, 540, lerp(0.94, 1, t / dur)); ps.forEach((g, i) => g.setAttribute("opacity", smooth(i * 0.5, i * 0.5 + 0.3, t))); fadeIn(tx, t, 4.6); };
};

function churchillTown(fg, y = 700) {
  house(fg, 180, y, 190, 110, "url(#houseA)"); house(fg, 420, y + 10, 150, 96, "url(#houseB)"); house(fg, 640, y - 10, 210, 130, "url(#houseC)"); house(fg, 910, y + 6, 170, 104, "url(#houseA)"); house(fg, 1150, y, 200, 120, "url(#houseB)"); house(fg, 1420, y + 8, 160, 100, "url(#houseC)");
}
SCENES.gather = (root, p, dur) => {
  const { cam, w } = mapBase(root, "hudson");
  const q = proj("hudson", -94.2, 58.77); const g = pin(w, q[0], q[1], "CHURCHILL", 66);
  const hb = proj("hudson", -86, 60); label(w, hb[0], hb[1], "HUDSON BAY", 74, { fill: "#bcd9e3" });
  const R = rng(9), D = []; for (let i = 0; i < 90; i++) { const lat = 57.2 + R() * 3.4, lon = -94.7 + (lat - 58.8) * -0.6 + R() * 1.4 - 0.2, p2 = proj("hudson", lon, lat); D.push({ x: p2[0], y: p2[1], at: 10.2 + R() * 3.4, e: el("circle", { r: 6, fill: "#fff8e4", stroke: INK, "stroke-width": 1.4, opacity: 0 }, w) }); }
  const tx = label(root, 960, 110, "HUNDREDS OF BEARS, WAITING FOR THE BAY TO FREEZE", 80); tx.setAttribute("opacity", 0);
  return (t) => { camera(cam, q[0] + 80, q[1] - 60, lerp(1, 1.5, smooth(0, dur, t))); g.setAttribute("opacity", smooth(0.2, 0.4, t)); D.forEach((d) => { d.e.setAttribute("cx", d.x); d.e.setAttribute("cy", d.y); d.e.setAttribute("opacity", smooth(d.at, d.at + 0.3, t)); }); fadeIn(tx, t, 10.4); };
};

SCENES.town = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 460, mood: p.mood || "dusk", snow: 40 });
  churchillTown(fg, 660);
  const bs = (p.bears || []).map(([x, y, s, flip], i) => ({ b: new Bear(fg, { seed: 40 + i, ticks: 0.6 }), x, y, s, flip, sh: shadow(fg, x, y + 2, 280 * s, 28 * s) }));
  const tr = p.truck ? el("g", {}, fg) : null; if (tr) truck(tr, 1);
  const ppl = (p.people || []).map(([x, y, s, coat]) => { const h = new Human(fg, { coat }); h.set({ x, y, s, walk: 0 }); return h; });
  const tx = p.text ? label(root, 960, p.textY || 180, p.text, p.size || 96) : null; if (tx) tx.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, lerp(1, 1.05, t / dur)); snow.set(t);
    bs.forEach((o, i) => { const dir = o.flip ? -1 : 1, x = o.x + dir * t * 48 * o.s * 1.4; o.b.set({ x, y: o.y, s: o.s, flip: o.flip, phase: walkPh(t + i * 0.3, 1.8) }); o.sh.setAttribute("cx", x); });
    if (tr) tr.setAttribute("transform", `translate(${f1(lerp(-200, 2200, t / (dur * 1.05)))} 890) scale(1.1)`);
    if (tx) fadeIn(tx, t, 0.3);
  };
};

SCENES.jail = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 480, mood: "day", snow: 26 });
  ink(fg, "M320 760 L320 390 L1620 390 L1620 760 Z", "#7c8a8e", 4); ink(fg, "M300 390 L960 300 L1640 390 Z", "#39424a", 4);
  const sg = ink(fg, "M740 440 h440 v100 h-440 Z", "#f2c230", 4);
  label(fg, 960, 515, "HOLDING FACILITY", 62, { fill: INK, stroke: "none", sw: 0 });
  ink(fg, "M430 760 V560 h160 v200 Z M1330 760 V560 h160 v200 Z", "#3b4449", 3);
  const inside = el("g", { opacity: 0 }, root);
  el("rect", { width: 1920, height: 1080, fill: "#2d3338" }, inside); el("rect", { y: 830, width: 1920, height: 250, fill: "#494f53" }, inside);
  const b = new Bear(inside); shadow(inside, 860, 880, 440, 36);
  for (let x = 40; x < 1920; x += 120) ink(inside, `M${x} 0 V840`, "none", 14, { stroke: "#15181b" });
  ink(inside, "M0 40 H1920 M0 800 H1920", "none", 16, { stroke: "#15181b" });
  const a1 = label(root, 960, 200, "\"POLAR BEAR JAIL\"", 170), a2 = label(root, 960, 200, "HELD WITHOUT FOOD", 130), a3 = label(root, 960, 1000, "SO THEY DON'T LEARN THAT TOWN MEANS FOOD", 72, { fill: "#ffe089" });
  [a1, a2, a3].forEach((n) => n.setAttribute("opacity", 0));
  return (t) => {
    camera(cam, 960, 540, lerp(1, 1.06, t / 7)); snow.set(t);
    a1.setAttribute("opacity", smooth(2.3, 2.6, t) * (1 - smooth(4.8, 5, t)));
    const k = smooth(5, 5.2, t); inside.setAttribute("opacity", k);
    b.set({ x: 860, y: 876, s: 1.6, walk: 0.45, phase: walkPh(t, 2.6), headPitch: 12, blink: blinkAt(t) });
    fadeIn(a2, t, 10.2); fadeIn(a3, t, 12);
  };
};

// The helicopter lift: a sleeping bear in a net under a helicopter, as in the reference image
SCENES.heliNet = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 780, snow: 30, sun: { x: 900, y: 520, r: 720 } });
  const hg = el("g", {}, fg), hc = helicopter(hg, 1.05);
  const rope = el("line", { stroke: INK, "stroke-width": 5 }, fg); const net = el("g", {}, fg);
  const b = new Bear(net, { ticks: 0.7 }); b.set({ x: 0, y: 40, s: 0.72, walk: 0, drop: 60, blink: true, torsoPitch: -5, headPitch: 28, feet: { rn: { x: -130, y: -60, p: 40 }, rf: { x: -96, y: -48, p: 40 }, fn: { x: 110, y: -60, p: 40 }, ff: { x: 140, y: -50, p: 40 } } });
  const m = el("g", {}, net); let d = ""; for (let a = -170; a <= 170; a += 34) d += `M${a} ${-210 + Math.abs(a) * 0.4} L${a * 0.9} 66 `; for (let y = -180; y <= 60; y += 34) { const r = 170 * (1 - Math.pow((y + 60) / 130, 2) * 0.1); d += `M${-r} ${y} L${r} ${y} `; }
  el("path", { d, stroke: "#2a3138", "stroke-width": 3.2, fill: "none" }, m);
  const tx = label(root, 960, 1000, "ASLEEP IN A NET, FLOWN FAR FROM THE HOUSES", 72); tx.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t);
    const x = lerp(240, 1280, t / dur), y = 220 + Math.sin(t * 1.1) * 10;
    hg.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(-3)`);
    hc.rotor.setAttribute("rx", 130 + Math.sin(t * 40) * 14);
    const sway = Math.sin(t * 1.3) * 16, nx = x - 10 + sway, ny = y + 440;
    net.setAttribute("transform", `translate(${f1(nx)} ${f1(ny)}) rotate(${f1(sway * -0.2)})`);
    rope.setAttribute("x1", f1(x - 8)); rope.setAttribute("y1", f1(y + 30)); rope.setAttribute("x2", f1(nx)); rope.setAttribute("y2", f1(ny - 200));
    fadeIn(tx, t, 0.5);
  };
};

SCENES.carDoor = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 520, mood: "dusk", snow: 36 });
  house(fg, 260, 640, 240, 150, "url(#houseA)"); house(fg, 620, 650, 200, 130, "url(#houseB)");
  const cg = el("g", { transform: "translate(1010 880) scale(1.5)" }, fg); car(cg); shadow(fg, 1010, 884, 240, 18);
  const door = ink(fg, "M980 760 h100 v96 h-100 Z", "#4e6f8d", 3);
  const sh = shadow(fg, 0, 0, 1, 1), b = new Bear(fg), h = new Human(fg);
  const tx = label(root, 960, 180, "MANY PEOPLE LEAVE THEIR CAR DOORS UNLOCKED", 88), t2 = label(root, 960, 180, "ANY CAR MIGHT BE THE CLOSEST DOOR", 96);
  tx.setAttribute("opacity", 0); t2.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t);
    const run = smooth(7.7, 11, t);
    h.set({ x: lerp(440, 920, run), y: 906, s: 1.5, phase: t / 0.55, walk: run > 0 && run < 1 ? 1 : 0, stride: 40, lean: 8 });
    const x = lerp(2100, 1640, smooth(5.4, dur, t)); b.set({ x, y: 880, s: 1.2, flip: true, phase: walkPh(t, 1.7) }); sh.setAttribute("cx", x); sh.setAttribute("cy", 884); sh.setAttribute("rx", 320); sh.setAttribute("ry", 28);
    const open = smooth(10.8, 11.4, t); door.setAttribute("transform", `translate(980 0) scale(${1 - open * 0.7} 1) translate(-980 0)`);
    tx.setAttribute("opacity", smooth(0.3, 0.6, t) * (1 - smooth(7.3, 7.6, t))); fadeIn(t2, t, 7.8);
  };
};

SCENES.halloween = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 460, mood: "night", snow: 46 });
  churchillTown(fg, 650);
  [[300, 680], [840, 670], [1270, 680]].forEach(([x, y]) => { ink(fg, `M${x - 22} ${y} C${x - 34} ${y - 34} ${x + 34} ${y - 34} ${x + 22} ${y} Z`, "#df7a1c", 2.4); el("path", { d: `M${x - 9} ${y - 16} l4 -5 l4 5 Z M${x + 3} ${y - 16} l4 -5 l4 5 Z`, fill: "#ffd76a" }, fg); });
  const kids = [["#7a3fa0", 0.72], ["#fff", 0.66], ["#2f9e6a", 0.7]].map(([c]) => new Human(fg, { coat: c, pants: "#1d1b24" }));
  const tr = el("g", {}, fg); truck(tr); const beam = el("path", { fill: "#fbf3cf", opacity: 0.18 }, fg);
  const tx = label(root, 960, 190, "TRICK-OR-TREATING, WITH PATROL TRUCKS WATCHING", 84); tx.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t);
    kids.forEach((k, i) => k.set({ x: 320 + i * 110 + t * 60, y: 800 + i * 8, s: [0.72, 0.66, 0.7][i], phase: t * 1.2 + i * 0.3 }));
    const x = lerp(1950, 1440, smooth(0, dur, t)); tr.setAttribute("transform", `translate(${f1(x)} 900) scale(-1.1 1.1)`);
    beam.setAttribute("d", `M${f1(x - 110)} 850 L${f1(x - 720)} 760 L${f1(x - 720)} 960 Z`); fadeIn(tx, t, 0.4);
  };
};

SCENES.signRifle = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 640, snow: 40, sun: { x: 500, y: 560, r: 700 } });
  [[100, 60, 620], [700, 100, 560], [1240, 80, 680]].forEach(([x, h, w], i) => ridge(fg, x, 642, w, h * 2.2, i + 4));
  ink(fg, "M1296 1090 V680 h28 V1090 Z", "#4a4f54", 3);
  const sg = el("g", { transform: "translate(1310 420)" }, fg);
  ink(sg, "M0 -260 L250 180 L-250 180 Z", "#f2c230", 10); ink(sg, "M0 -214 L210 156 L-210 156 Z", "none", 8);
  const sil = new Bear(sg, { ticks: 0 }); silhouette(sil); sil.set({ x: -30, y: 120, s: 0.5, walk: 0 });
  const t1 = el("g", { opacity: 0 }, root); label(t1, 610, 440, "BEYOND THIS POINT", 90); label(t1, 610, 560, "YOU'RE IN THEIR TERRITORY", 86, { fill: "#ffe089" });
  const h = new Human(fg); h.set({ x: 500, y: 980, s: 2, walk: 0, look: 2 });
  ink(fg, "M516 760 L560 836", "none", 0);
  const rf = ink(fg, "M446 640 L532 830", "none", 8, { stroke: "#2a2017" });
  const r2 = label(root, 610, 200, "NOT FOR HUNTING", 110); r2.setAttribute("opacity", 0);
  const hidePerson = p.part === 1; if (hidePerson) { h.g.setAttribute("opacity", 0); rf.setAttribute("opacity", 0); }
  return (t) => { camera(cam, 960, 540, lerp(1, 1.04, t / dur)); snow.set(t); if (p.part === 0) fadeIn(r2, t, 3.5); else { r2.setAttribute("opacity", 0); fadeIn(t1, t, 8.5); } };
};

SCENES.emergency = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 470, mood: "dusk", snow: 44, wind: 60 });
  const bl = (x, w, h, f) => { ink(fg, `M${x} 700 V${700 - h} H${x + w} V700 Z`, f, 3); for (let i = 0; i < Math.floor(h / 70); i++) for (let j = 0; j < Math.floor(w / 60); j++) ink(fg, `M${x + 16 + j * 60} ${700 - h + 18 + i * 70} h28 v30 h-28 Z`, "#e7d88f", 1.6); };
  bl(120, 330, 300, "#7f8d86"); bl(520, 300, 240, "#8a7a6a"); bl(1000, 360, 290, "#71808a"); bl(1460, 300, 250, "#8a8571");
  ink(fg, "M900 720 h120 v-70 h-120 Z", "#35464f", 3); ink(fg, "M1100 760 h80 l-10 -60 h-60 Z", "#3a4750", 3);
  const R = rng(4), bs = []; for (let i = 0; i < 9; i++) bs.push({ b: new Bear(fg, { seed: 50 + i, ticks: 0.4, thin: 0.5 }), x: 90 + R() * 1740, y: 730 + i * 34, s: 0.34 + i * 0.05, flip: R() > 0.5, ph: R() * 3 });
  const st = el("g", { opacity: 0, transform: "rotate(-5 960 300)" }, root);
  ink(st, "M360 200 h1200 v190 h-1200 Z", "none", 14, { stroke: "#e8261c" }); label(st, 960, 340, "STATE OF EMERGENCY", 150, { fill: "#e8261c", stroke: "#fff", sw: 6 });
  const tx = label(root, 960, 200, p.text || "", 96); tx.setAttribute("opacity", 0);
  return (t) => { camera(cam, 960, 540, 1); snow.set(t); bs.forEach((o, i) => o.b.set({ x: o.x + (o.flip ? -1 : 1) * t * 26, y: o.y, s: o.s, flip: o.flip, phase: walkPh(t + o.ph, 1.7), thin: 0.5 })); if (p.stampAt !== undefined) { st.setAttribute("opacity", smooth(p.stampAt, p.stampAt + 0.1, t)); } if (p.text) tx.setAttribute("opacity", smooth(0.4, 0.8, t) * (p.stampAt !== undefined ? 1 - smooth(p.stampAt - 0.2, p.stampAt, t) : 1)); };
};

SCENES.checklist = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 400, snow: 18 });
  tent(fg, 940, 560, 1.3);
  const it = [];
  const add = (x, y, name, at, fn) => { const g = el("g", { opacity: 0 }, fg); fn(g, x, y); label(g, x, y + 66, name, 60); it.push({ g, at }); };
  add(300, 760, "FOOD SEALED, FAR AWAY", 1.4, (g, x, y) => { ink(g, `M${x - 70} ${y} h140 v-90 h-140 Z`, "#5b6d58", 3); ink(g, `M${x - 74} ${y - 90} h148 v-20 h-148 Z`, "#3e4d3b", 3); });
  add(780, 880, "BEAR GUARDS", 6, (g, x, y) => { const h = new Human(g, { coat: "#d9a12c" }); h.set({ x, y, s: 1.3, walk: 0 }); });
  add(1250, 790, "FLARES, NOISEMAKERS, SPRAY", 7.9, (g, x, y) => { ink(g, `M${x - 90} ${y} v-90 h28 v90 Z`, "#d4322a", 3); ink(g, `M${x - 40} ${y} v-110 h40 v110 Z`, "#f2c230", 3); ink(g, `M${x + 30} ${y} v-100 h40 v100 Z`, "#2d7a6c", 3); });
  add(1660, 870, "OFTEN A FIREARM", 13.7, (g, x, y) => { ink(g, `M${x - 110} ${y - 30} L${x + 60} ${y - 44} L${x + 110} ${y - 20} L${x + 60} ${y - 20} L${x - 110} ${y - 20} Z`, "#2a2017", 2.4); });
  return (t) => { camera(cam, 960, 540, 1); snow.set(t); it.forEach((o) => o.g.setAttribute("opacity", smooth(o.at, o.at + 0.3, t))); };
};

SCENES.dontRun = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 500, snow: 30 });
  const ppl = [-150, 0, 150].map((d, i) => { const h = new Human(fg, { coat: ["url(#parka)", "#3d76a8", "#d9a12c"][i] }); shadow(fg, 360 + d, 868, 56, 8); return { h, d }; });
  const sh = shadow(fg, 0, 0, 1, 1), b = new Bear(fg);
  const a = label(root, 960, 190, "DON'T RUN", 190, { fill: "#fff" }), c = label(root, 960, 190, "STAY TOGETHER. LOOK BIG. MAKE NOISE.", 104);
  a.setAttribute("opacity", 0); c.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t); const up = smooth(7.3, 8.3, t);
    ppl.forEach((o, i) => o.h.set({ x: 360 + o.d, y: 864, s: 1.6, walk: 0, arm: -150 * up - Math.sin(t * 7 + i) * 18 * up, armF: 150 * up + Math.sin(t * 7 + i) * 18 * up }));
    const stop = smooth(9, dur, t), x = lerp(1560, 1660, stop);
    b.set({ x, y: 880, s: 1.35, flip: stop < 0.15, walk: stop > 0 ? 1 : 0.3, phase: walkPh(t, 1.8) });
    sh.setAttribute("cx", x); sh.setAttribute("cy", 884); sh.setAttribute("rx", 360); sh.setAttribute("ry", 30);
    a.setAttribute("opacity", smooth(2.9, 3.2, t) * (1 - smooth(7, 7.3, t))); fadeIn(c, t, 7.4);
  };
};

SCENES.fightBack = (root, p, dur) => {
  el("rect", { width: 1920, height: 1080, fill: "url(#cardBg)" }, root);
  const sil = new Bear(root, { thin: 0.5 }); sil.set({ x: 1500, y: 880, s: 1.35, flip: true, walk: 0, headPitch: -4 });
  const l1 = label(root, 720, 340, "PLAYING DEAD CAN WORK", 90, { fill: "#a7b6bd" }); const l2 = label(root, 720, 450, "WITH SOME BEARS", 74, { fill: "#a7b6bd" });
  const l3 = label(root, 720, 700, "POLAR BEAR ATTACKING?", 88, { fill: "#ffe089" }); const l4 = label(root, 720, 880, "FIGHT BACK", 230, { fill: "#ff5a3c" });
  [l1, l2, l3, l4].forEach((n) => n.setAttribute("opacity", 0));
  const strike = el("line", { x1: 180, y1: 370, x2: 1260, y2: 370, stroke: "#ff5a3c", "stroke-width": 12, opacity: 0 }, root);
  return (t) => { fadeIn(l1, t, 0.1); fadeIn(l2, t, 0.3); fadeIn(strike, t, p.strike || 6); fadeIn(l3, t, p.q || 7); fadeIn(l4, t, p.f || 11); };
};

// The den cutaway: a snowdrift, a mother, two tiny cubs
SCENES.den = (root, p, dur) => {
  const cam = el("g", {}, root), w = el("g", {}, cam);
  sky(w, p.mood || "night");
  const R = rng(5); for (let i = 0; i < 90; i++) el("circle", { cx: R() * 1920, cy: R() * 400, r: 0.8 + R() * 1.8, fill: "#e8f0f8", opacity: 0.7 }, w);
  el("path", { d: "M-100 700 C200 500 640 240 1100 250 C1500 260 1800 500 2020 680 L2020 1180 L-100 1180 Z", fill: "#eef5f6", stroke: INK, "stroke-width": 3 }, w);
  el("rect", { x: -100, y: 980, width: 2120, height: 200, fill: "#c7d6da" }, w);
  const c = el("path", { d: "M480 960 C460 760 640 560 960 550 C1280 556 1460 760 1440 960 Z", fill: "#3a5062", stroke: INK, "stroke-width": 4 }, w);
  el("path", { d: "M480 960 C460 760 640 560 960 550", fill: "none", stroke: "#8ba7b6", "stroke-width": 8, opacity: 0.5 }, w);
  const mom = new Bear(w, { thin: p.thin || 0.15 });
  const cubs = [new Bear(w, { seed: 21, ticks: 0.5 }), new Bear(w, { seed: 22, ticks: 0.5 })];
  const nums = el("g", {}, root); const cnt = p.months ? label(nums, 1640, 200, "0 MONTHS", 110) : null;
  const sub = p.months ? label(nums, 1640, 290, "NO FOOD. NO WATER.", 58, { fill: "#ffe089" }) : null;
  const tx = p.text ? label(root, 960, 150, p.text, 92) : null; if (tx) tx.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, lerp(p.z0 || 1, p.z1 || 1.06, t / dur));
    lying(mom, { x: 880, y: 960, s: 1.15, blink: true, thin: p.thin || 0.15, headPitch: 14 });
    cubs.forEach((b, i) => { b.set({ x: [1160, 1250][i], y: 960, s: p.cubScale || 0.22, walk: 0.3, phase: t * 0.2 + i, blink: true, drop: 40 }); b.g.setAttribute("opacity", p.cubs === false ? 0 : smooth(p.cubAt || 0, (p.cubAt || 0) + 0.4, t)); });
    if (cnt) cnt.textContent = Math.round(8 * smooth(0.5, dur - 1.5, t)) + " MONTHS";
    if (tx) fadeIn(tx, t, 0.3);
  };
};

SCENES.cubHand = (root, p, dur) => {
  el("rect", { width: 1920, height: 1080, fill: "#2c3f4d" }, root);
  const cam = el("g", {}, root);
  const SK = "#e6bd9d", SH = "#c9956f", HI = "#f3d5bc", NAIL = "#f6e3d6";
  // bent finger: ink tube, skin tube, lit edge, nail
  const tube = (d, w) => {
    el("path", { d, fill: "none", stroke: INK, "stroke-width": w + 9, "stroke-linecap": "round" }, cam);
    el("path", { d, fill: "none", stroke: SK, "stroke-width": w, "stroke-linecap": "round" }, cam);
  };
  const crease = (d, o = 0.75) => el("path", { d, fill: "none", stroke: "#9a6a4c", "stroke-width": 3.4, "stroke-linecap": "round", opacity: o }, cam);
  const nail = (x, y, r) => { const n = el("ellipse", { cx: x, cy: y, rx: 17, ry: 12, fill: NAIL, stroke: "#9a6a4c", "stroke-width": 2.6, transform: `rotate(${r} ${x} ${y})` }, cam); return n; };
  // parka sleeve, same jacket as the person in the rest of the film
  ink(cam, "M600 800 C640 860 650 980 610 1060 L560 1180 L-60 1180 L-60 960 C120 880 400 800 600 800 Z", "url(#parka)", 5);
  el("path", { d: "M90 1180 C150 1040 250 950 400 880", fill: "none", stroke: "#e8e4dc", "stroke-width": 15, opacity: 0.85 }, cam);
  // palm outline first, fingers over it, palm fill last so the joins merge
  const palm = "M585 842 C700 826 860 848 1000 844 C1085 842 1140 880 1138 932 C1136 992 1050 1026 940 1036 C800 1048 670 1036 585 1016 Z";
  ink(cam, palm, SK, 5);
  tube("M1030 858 Q1245 806 1322 660", 60); nail(1322, 642, -24);
  tube("M1030 880 Q1285 842 1398 690", 68); nail(1402, 672, -30);
  tube("M1030 905 Q1318 886 1458 742", 72); nail(1466, 724, -38);
  tube("M1030 938 Q1318 950 1482 826", 72); nail(1494, 810, -48);
  crease("M1216 842 q14 -18 34 -26"); crease("M1262 866 q14 -20 36 -28"); crease("M1300 906 q16 -16 36 -24"); crease("M1322 930 q16 -12 34 -18");
  el("path", { d: palm, fill: SK }, cam);
  el("path", { d: "M640 858 C760 846 900 862 1010 858", fill: "none", stroke: HI, "stroke-width": 8, "stroke-linecap": "round", opacity: 0.6 }, cam);
  // contact shadow under the cub
  el("ellipse", { cx: 990, cy: 882, rx: 240, ry: 16, fill: "#8d5f43", opacity: 0.5 }, cam);
  // newborn: pink skin showing through thin short fur, head distinct from body
  const cub = el("g", {}, cam);
  const FUR = "#f1e0d4", FS = "#d8b7a6";
  const body = "M-235 55 C-255 -35 -175 -118 -60 -122 C40 -126 120 -95 165 -45 C185 -20 185 40 150 70 C90 96 -30 98 -120 96 C-180 96 -225 90 -235 55 Z";
  const head = "M95 -30 C110 -90 190 -105 240 -70 C268 -52 300 -30 322 -8 C338 8 328 30 305 34 C270 44 225 62 170 58 C120 54 85 20 95 -30 Z";
  ink(cub, "M-180 78 C-196 112 -150 126 -112 112 C-92 104 -92 84 -110 74 Z", FUR, 4.5);
  el("path", { d: "M-160 118 v8 M-140 120 v8 M-122 116 v8", stroke: "#7a5a4c", "stroke-width": 3, "stroke-linecap": "round" }, cub);
  el("circle", { cx: 172, cy: -82, r: 24, fill: FUR, stroke: INK, "stroke-width": 4.5 }, cub);
  el("circle", { cx: 172, cy: -82, r: 11, fill: "#c99c8c" }, cub);
  el("path", { d: furry(body, 5, 1.6, 12), fill: INK, stroke: INK, "stroke-width": 5 }, cub);
  el("path", { d: furry(body, 5, 1.6, 12), fill: FUR }, cub);
  el("path", { d: "M-225 62 C-160 96 60 100 150 66 C176 40 178 10 168 -10 C120 40 -60 66 -225 62 Z", fill: FS, opacity: 0.6 }, cub);
  Bear.prototype._ticks.call({}, cub, body, 34, 4, 150, "#b9a093");
  el("path", { d: furry(head, 5, 1.4, 10), fill: INK, stroke: INK, "stroke-width": 5 }, cub);
  el("path", { d: furry(head, 5, 1.4, 10), fill: FUR }, cub);
  el("path", { d: "M100 10 C130 50 240 60 310 32 C250 30 160 26 100 10 Z", fill: FS, opacity: 0.55 }, cub);
  el("path", { d: "M226 -30 Q244 -18 262 -30", fill: "none", stroke: INK, "stroke-width": 4.5, "stroke-linecap": "round" }, cub);
  el("path", { d: "M232 -25 l-5 7 M244 -21 l0 8 M256 -25 l5 7", stroke: INK, "stroke-width": 2.6, "stroke-linecap": "round" }, cub);
  el("ellipse", { cx: 322, cy: 3, rx: 14, ry: 11, fill: "#7d5550", stroke: INK, "stroke-width": 3 }, cub);
  el("path", { d: "M316 18 Q298 32 272 28", fill: "none", stroke: INK, "stroke-width": 3.4, "stroke-linecap": "round" }, cub);
  ink(cub, "M112 58 C112 96 158 108 192 92 C212 80 206 58 182 50 C160 44 128 44 112 58 Z", FUR, 4.5);
  el("path", { d: "M160 102 v8 M178 98 v8 M194 90 l3 8", stroke: "#7a5a4c", "stroke-width": 3, "stroke-linecap": "round" }, cub);
  // thumb in front of the cub, base merged into the palm
  tube("M772 962 Q924 950 1012 826", 84); nail(1024, 806, -38);
  el("ellipse", { cx: 760, cy: 966, rx: 66, ry: 54, fill: SK }, cam);
  el("path", { d: "M1120 950 C1090 1000 1020 1022 930 1032 C800 1044 670 1034 590 1014 L590 980 C720 1004 900 1006 1010 980 C1060 968 1100 950 1120 950 Z", fill: SH, opacity: 0.55 }, cam);
  el("path", { d: "M792 930 Q910 918 990 824", fill: "none", stroke: HI, "stroke-width": 9, "stroke-linecap": "round", opacity: 0.65 }, cam);
  // cuff over the wrist
  ink(cam, "M566 812 C612 806 640 820 650 840 C672 900 668 980 640 1040 C625 1056 590 1060 560 1050 C590 960 590 880 566 812 Z", "#26323b", 5);
  crease("M902 900 q20 8 30 26"); crease("M940 860 q18 8 28 24");
  const a = label(root, 960, 210, "UNDER A KILOGRAM", 170), b = label(root, 960, 320, "BLIND. ALMOST BARE.", 86, { fill: "#ffe089" }), c = label(root, 960, 210, "SMALL ENOUGH TO HOLD IN ONE HAND", 112);
  a.setAttribute("opacity", 0); b.setAttribute("opacity", 0); c.setAttribute("opacity", 0);
  return (t) => {
    const br = Math.sin(t * 2.1);
    cub.setAttribute("transform", `translate(1010 ${f1(788 - br * 1.6)}) scale(${(1 + br * 0.006).toFixed(4)} ${(1 + br * 0.014).toFixed(4)})`);
    const z = lerp(1, 1.05, t / dur);
    cam.setAttribute("transform", `translate(1000 860) scale(${z.toFixed(4)}) translate(-1000 -860)`);
    a.setAttribute("opacity", smooth(0.1, 0.3, t) * (1 - smooth(5.8, 6.1, t))); b.setAttribute("opacity", smooth(2.4, 2.7, t) * (1 - smooth(5.8, 6.1, t))); fadeIn(c, t, 6.2);
  };
};

SCENES.copyMom = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 480, snow: 24, sun: { x: 1500, y: 470, r: 600 } });
  el("ellipse", { cx: 1560, cy: 790, rx: 110, ry: 24, fill: "#0e2f42", stroke: INK, "stroke-width": 3 }, fg);
  shadow(fg, 1030, 838, 380, 30); const m = new Bear(fg);
  const c1 = new Bear(fg, { seed: 25, ticks: 0.5 }), c2 = new Bear(fg, { seed: 26, ticks: 0.5 }); shadow(fg, 350, 884, 120, 12); shadow(fg, 590, 930, 120, 12);
  const tx = label(root, 960, 190, "EVERYTHING THEY LEARN, THEY LEARN BY COPYING HER", 82); tx.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, lerp(1, 1.05, t / dur)); snow.set(t);
    lying(m, { x: 1030, y: 834, s: 1.3, blink: t > 3, headPitch: 14 });
    lying(c1, { x: 350, y: 880, s: 0.42, blink: false, headPitch: 12 }); c2.set({ x: 590, y: 926, s: 0.44, walk: 0, drop: 38, phase: 0, headPitch: 8, blink: blinkAt(t, 2) });
    fadeIn(tx, t, p.at || 4);
  };
};

SCENES.ashore = (root, p, dur) => {
  const cam = el("g", {}, root), w = el("g", {}, cam); sky(w, "dusk", { x: 1560, y: 520, r: 620 });
  el("rect", { x: -300, y: 520, width: 2520, height: 300, fill: "url(#waterLit)" }, w);
  el("path", { d: "M-300 640 C300 590 1000 650 2300 620 L2300 1180 L-300 1180 Z", fill: "#7a7366", stroke: INK, "stroke-width": 3 }, w);
  const R = rng(4); for (let i = 0; i < 60; i++) { const x = R() * 2200 - 140, y = 680 + R() * 400, r = 8 + R() * 30; ink(w, `M${f1(x - r)} ${f1(y)} C${f1(x - r)} ${f1(y - r)} ${f1(x + r)} ${f1(y - r)} ${f1(x + r)} ${f1(y)} Z`, i % 3 ? "#8d8675" : "#5f5b50", 2); }
  const sh = shadow(w, 0, 0, 1, 1), b = new Bear(w);
  const bg = el("g", {}, root); ink(bg, "M1310 80 h520 v70 h-520 Z", "#0e1a22", 4);
  const fat = el("rect", { x: 1316, y: 86, height: 58, fill: "#e0b857" }, bg); label(bg, 1570, 134, "FAT RESERVES", 48);
  const ws = (p.words || ["THEY WAIT", "THEY FAST"]).map((v, i) => { const l = label(root, 660, 210, v, 150); l.setAttribute("opacity", 0); return l; });
  return (t) => {
    camera(cam, 960, 540, lerp(1, 1.05, t / dur));
    const th = smooth(0, dur, t) * 0.8, x = lerp(620, 1060, t / dur);
    b.set({ x, y: 880, s: 1.45, thin: th, phase: walkPh(t, 2.2), headPitch: 12, blink: blinkAt(t) });
    sh.setAttribute("cx", x); sh.setAttribute("cy", 884); sh.setAttribute("rx", 380); sh.setAttribute("ry", 32);
    fat.setAttribute("width", 508 * (1 - 0.72 * t / dur));
    const at = p.at || [0.6, 2.2];
    ws.forEach((n, i) => { const e = i + 1 < ws.length ? at[i + 1] : dur + 1; n.setAttribute("opacity", smooth(at[i], at[i] + 0.2, t) * (1 - smooth(e - 0.12, e, t))); });
  };
};

// Hudson Bay: the ice season shrinks. Shows the direction only; no invented numbers.
SCENES.iceSeason = (root, p, dur) => {
  el("rect", { width: 1920, height: 1080, fill: "url(#cardBg)" }, root);
  label(root, 960, 150, "HUDSON BAY", 120);
  const mon = ["JUL", "AUG", "SEP", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR", "APR", "MAY", "JUN"];
  mon.forEach((m, i) => label(root, 230 + i * 130, 830, m, 44, { fill: "#a7b6bd", sw: 0 }));
  const rowLab = (y, s) => label(root, 1000, y - 60, s, 62, { fill: "#fff", sw: 0 });
  rowLab(340, "THE ICE SEASON, THEN"); rowLab(610, "THE ICE SEASON, NOW");
  el("rect", { x: 180, y: 340, width: 1560, height: 120, fill: "#0f2e40" }, root); el("rect", { x: 180, y: 610, width: 1560, height: 120, fill: "#0f2e40" }, root);
  el("rect", { x: 180 + 130 * 4 - 60, y: 340, width: 130 * 8 + 60, height: 120, fill: "#e4f1f4" }, root);
  const nowB = el("rect", { y: 610, height: 120, fill: "#e4f1f4" }, root);
  const a = label(root, 960, 960, "BREAKING UP EARLIER. FORMING LATER.", 92, { fill: "#ffe089" }); a.setAttribute("opacity", 0);
  label(root, 1740, 1040, "DIAGRAM, NOT TO SCALE", 34, { anchor: "end", fill: "#a7b6bd", sw: 0 });
  return (t) => { const u = smooth(0.8, 4.5, t); const start = 180 + 130 * 4 - 60 + 130 * 0.9 * u, end = 180 + 130 * 12 - 130 * 0.9 * u; nowB.setAttribute("x", start); nowB.setAttribute("width", end - start); fadeIn(a, t, 0.8); };
};

SCENES.chain = (root, p, dur) => {
  el("rect", { width: 1920, height: 1080, fill: "url(#cardBg)" }, root);
  const steps = p.steps || ["LONGER FASTS", "THINNER BEARS", "MORE ATTACKS ON PEOPLE"]; const at = p.at || [0, 1.6, 3.4]; const y0 = p.y0 || 260, gap = p.gap || 270, sz = p.size || 130;
  const G = steps.map((s, i) => { const g = el("g", { opacity: 0 }, root); const y = y0 + i * gap; label(g, 960, y, s, sz, { fill: i === steps.length - 1 ? "#ff5a3c" : "#fff" }); if (i) ink(g, `M960 ${y - 190} v90 m-30 -30 l30 30 l30 -30`, "none", 8, { stroke: "#ffe089" }); return g; });
  return (t) => G.forEach((g, i) => g.setAttribute("opacity", smooth(at[i], at[i] + 0.3, t)));
};

SCENES.population = (root, p, dur) => {
  const { cam, w } = mapBase(root, "polar", { ice: 300 * (p.iceK || 1) });
  el("path", { d: MAPS.polar.d, fill: "#7c8c80", stroke: "#26342d", "stroke-width": 2, "fill-rule": "evenodd" }, w);
  const R = rng(6), D = []; for (let i = 0; i < 260; i++) { const a = R() * 6.28, r = 170 + R() * 150; D.push({ x: 960 + Math.cos(a) * r, y: 540 + Math.sin(a) * r, at: 0.3 + R() * 3, e: el("circle", { r: 3.8, fill: "#fff8e4", stroke: INK, "stroke-width": 0.8, opacity: 0 }, w) }); }
  const n = label(root, 960, 200, "0", 200), u = label(root, 960, 300, "POLAR BEARS LEFT", 80); n.setAttribute("opacity", 0); u.setAttribute("opacity", 0);
  const vu = el("g", { opacity: 0 }, root); label(vu, 960, 980, "IUCN: VULNERABLE", 110, { fill: "#ff8a6c" });
  return (t) => { camera(cam, 960, 540, 1); D.forEach((d) => { d.e.setAttribute("cx", d.x); d.e.setAttribute("cy", d.y); d.e.setAttribute("opacity", smooth(d.at, d.at + 0.3, t)); }); fadeIn(n, t, 0.2); fadeIn(u, t, 0.2); n.textContent = "≈" + nf(Math.round(26000 * easeOut(0.2, 2.4, t) / 100) * 100); fadeIn(vu, t, p.vu || 7); };
};

SCENES.iceShrink = (root, p, dur) => {
  const { cam, w } = mapBase(root, "polar", { ice: 410 });
  const ic = w.querySelector("circle");
  el("path", { d: MAPS.polar.d, fill: "#7c8c80", stroke: "#26342d", "stroke-width": 2, "fill-rule": "evenodd" }, w);
  const tx = label(root, 960, 110, p.text || "WHETHER THE SEA ICE KEEPS FORMING EACH WINTER", 80); tx.setAttribute("opacity", 0);
  const t2 = label(root, 960, 1030, p.text2 || "", 70, { fill: "#ffe089" }); t2.setAttribute("opacity", 0);
  return (t) => { ic.setAttribute("r", f1(lerp(410, 250, smooth(0, dur, t)))); camera(cam, 960, 540, 1); fadeIn(tx, t, 0.2); };
};

SCENES.worthIt = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 520, mood: "dusk", snow: 34, sun: { x: 300, y: 500, r: 700 } });
  const b = new Bear(fg, { thin: p.thin || 0 }); const br = new Breath(fg, 5);
  const q = label(root, 1000, 320, p.text || "IS THIS WORTH IT?", p.size || 180); q.setAttribute("opacity", 0);
  return (t) => { camera(cam, 960, 540, lerp(1, 1.12, t / dur)); snow.set(t); b.set({ x: -60, y: 1510, s: 3.1, walk: 0, headPitch: -2 + Math.sin(t * 1.4) * 3, blink: blinkAt(t, 5), thin: p.thin || 0 }); br.set(t, -60 + 316 * 3.1, 1510 - 204 * 3.1, 1, 3, 3); fadeIn(q, t, p.at === undefined ? 0.9 : p.at); };
};

SCENES.walkAway = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 520, snow: 26, sun: { x: 1700, y: 500, r: 620 } });
  shadow(fg, 240, 826, 56, 8); const h = new Human(fg); h.set({ x: 240, y: 822, s: 1.4, walk: 0 });
  const sh = shadow(fg, 0, 0, 1, 1), b = new Bear(fg, { fat: 1 });
  const t1 = label(root, 960, 180, "FOR A FAT, HEALTHY BEAR, OFTEN NO", 100); t1.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t);
    const go = smooth(3.2, 6.8, t), x = lerp(1000, 1700, go), s = lerp(1.35, 0.9, go);
    b.set({ x, y: lerp(880, 800, go), s, fat: 1, flip: t < 3.2, walk: t < 3.2 ? 0.1 : 1, phase: walkPh(t, 1.8), headPitch: t < 3 ? -8 + Math.sin(t * 2.3) * 4 : 6, blink: blinkAt(t) });
    sh.setAttribute("cx", x); sh.setAttribute("cy", lerp(884, 803, go)); sh.setAttribute("rx", 360 * s / 1.35); sh.setAttribute("ry", 30 * s / 1.35);
    fadeIn(t1, t, 0.3);
  };
};

SCENES.endCard = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 560, mood: "dusk", snow: 40, sun: { x: 960, y: 560, r: 820 } });
  const b = new Bear(fg); shadow(fg, 1050, 874, 420, 34);
  const a = label(root, 960, 230, "WHICH ANIMAL SHOULD WE MEET NEXT?", 120), c = label(root, 960, 340, "TELL ME IN THE COMMENTS", 76, { fill: "#ffe089" });
  a.setAttribute("opacity", 0); c.setAttribute("opacity", 0);
  return (t) => { camera(cam, 960, 540, 1); snow.set(t); b.set({ x: 1050, y: 870, s: 1.45, phase: walkPh(t, 1.9), walk: 0.5, blink: blinkAt(t) }); fadeIn(a, t, 0.4); fadeIn(c, t, 1.4); };
};
