// Scenes for the hook and "what's walking toward you". Each returns an update(t) function of local time.
const SCENES = {};
const fadeIn = (node, t, a, d = 0.4) => node.setAttribute("opacity", smooth(a, a + d, t).toFixed(3));
const fadeWin = (node, t, a, b, d = 0.35) => node.setAttribute("opacity", (smooth(a, a + d, t) * (1 - smooth(b - d, b, t))).toFixed(3));
function W(root, o = {}) {
  const cam = el("g", {}, root), w = el("g", {}, cam);
  const horizon = o.horizon === undefined ? 620 : o.horizon;
  sky(w, o.mood || "day", o.sun);
  icePlain(w, horizon, o.mood || "day", o.seed || 5, o);
  const fg = el("g", {}, cam);
  const snow = o.snow === 0 ? null : new Snow(root, o.snow || 60, (o.seed || 5) + 2, o.wind === undefined ? 30 : o.wind, 18, o.mood === "night" ? "#cfe0ee" : "#fff");
  return { cam, w, fg, snow, horizon };
}
const walkPh = (t, T = 1.7) => t / T;
const camTo = (g, t, dur, a, b) => { const k = smooth(0, dur, t); camera(g, lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)); };
function silhouette(b, color = INK) { b.fillG.setAttribute("opacity", 0); b.farFill.setAttribute("opacity", 0); b.topG.setAttribute("opacity", 0); }
function shrub(g, x, y, s = 1) { const c = el("g", { transform: `translate(${x} ${y}) scale(${s})` }, g); ink(c, "M-6 0 L-6 -30 L6 -30 L6 0 Z", "#3a2c20", 2); for (let i = 0; i < 4; i++) { const w = 62 - i * 12, h = -26 - i * 30; ink(c, `M${-w} ${h} L0 ${h - 62} L${w} ${h} Z`, i % 2 ? "#2a4a3f" : "#335a4b", 2.4); } return c; }

// ---- HOOK ----
SCENES.alone = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 600 });
  shadow(fg, 960, 766, 60, 8);
  const h = new Human(fg); h.set({ x: 960, y: 764, s: 0.95, walk: 0 });
  const br = new Breath(fg, 4); const a1 = el("g", { opacity: 0 }, root);
  el("path", { d: "M130 900 H840 M1080 900 H1790 M130 884 V916 M1790 884 V916", stroke: "#fff", "stroke-width": 5, fill: "none", "stroke-linecap": "round" }, a1);
  el("path", { d: "M130 900 l26 -14 v28 Z M1790 900 l-26 -14 v28 Z", fill: "#fff" }, a1);
  label(a1, 960, 924, "100 KM", 72);
  return (t) => { camTo(cam, t, dur, [960, 640, 1.45], [960, 610, 1.05]); snow.set(t); br.set(t, 985, 590, 1, 3, 0.55); fadeIn(a1, t, 0.6); };
};

SCENES.crossSection = (root, p, dur) => {
  const cam = el("g", {}, root), w = el("g", {}, cam);
  sky(w, "day", { x: 1240, y: 260, r: 520 });
  ridge(w, 200, 300, 280, 50, 3); ridge(w, 1200, 300, 340, 70, 8);
  el("rect", { x: -400, y: 300, width: 2720, height: 3200, fill: "url(#water)" }, w);
  el("rect", { x: -400, y: 300, width: 2720, height: 190, fill: "url(#iceBlock)" }, w);
  const r = rng(6); let cr = "";
  for (let i = 0; i < 26; i++) { const x = r() * 2400 - 240, y = 330 + r() * 130, l = 40 + r() * 120; cr += `M${f1(x)} ${f1(y)} l${f1(l * 0.5)} ${f1(r() * 16 - 8)} l${f1(l * 0.5)} ${f1(r() * 16 - 8)}`; }
  el("path", { d: cr, stroke: "#6f9bb0", "stroke-width": 2, fill: "none", opacity: 0.7 }, w);
  el("path", { d: "M-400 490 " + Array.from({ length: 34 }, (_, i) => `L${-400 + i * 84} ${490 + (i % 2 ? 14 : 2) + (i % 5)}`).join(" ") + " L2320 470 L-400 470 Z", fill: "url(#iceBlock)" }, w);
  el("line", { x1: -400, y1: 300, x2: 2320, y2: 300, stroke: INK, "stroke-width": 2.6 }, w);
  const h = new Human(w); h.set({ x: 960, y: 300, s: 1, walk: 0 });
  // depth ruler
  const a1 = el("g", { opacity: 0 }, w);
  el("path", { d: "M1180 305 V485 M1160 305 H1200 M1160 485 H1200", stroke: "#0d2e40", "stroke-width": 5, fill: "none" }, a1);
  label(a1, 1215, 415, "A FEW METERS OF ICE", 62, { anchor: "start" });
  const a2 = el("g", { opacity: 0 }, w);
  el("path", { d: "M600 505 V1880 M580 505 H620 M580 1880 H620", stroke: "#bcd9e3", "stroke-width": 5, fill: "none" }, a2);
  label(a2, 640, 900, "2 TO 3 KM DEEP", 96, { anchor: "start" });
  label(a2, 640, 1010, "ARCTIC OCEAN", 72, { anchor: "start", fill: "#bcd9e3" });
  const fish = el("g", { opacity: 0.25 }, w); for (let i = 0; i < 12; i++) el("path", { d: `M${300 + i * 130} ${1320 + (i % 3) * 90} q18 -10 34 0 q-16 10 -34 0 Z`, fill: "#7fb0c6" }, fish);
  return (t) => {
    const k = smooth(4.5, 8.2, t);
    camera(cam, 960, lerp(360, 1120, k), lerp(1.25, 0.8, k));
    a1.setAttribute("opacity", smooth(0.2, 0.7, t) * (1 - smooth(5, 6, t)));
    fadeIn(a2, t, 5.2);
  };
};

SCENES.heart = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 690, wind: 0, snow: 26, sun: { x: 1400, y: 640, r: 500 } });
  shadow(fg, 760, 1014, 120, 18);
  const h = new Human(fg); h.set({ x: 760, y: 1010, s: 2.5, walk: 0, look: 4 });
  const br = new Breath(fg, 5);
  const temp = label(root, 1460, 500, "-30°C", 170); temp.setAttribute("opacity", 0);
  const line = el("path", { fill: "none", stroke: "#e8261c", "stroke-width": 6, "stroke-linejoin": "round", opacity: 0 }, root);
  return (t) => {
    camTo(cam, t, dur, [900, 660, 1.0], [860, 700, 1.1]); snow.set(t); br.set(t, 830, 560, 1, 3.4, 1.3);
    fadeIn(temp, t, 0.1, 0.5);
    let d = "";
    for (let x = 1120; x <= 1800; x += 8) { const u = ((x - 1120) / 680 - t * 0.45) % 0.5; const v = (u + 0.5) % 0.5; const y = v < 0.03 ? -8 : v < 0.05 ? 56 : v < 0.07 ? -72 : v < 0.09 ? 24 : 0; d += (d ? "L" : "M") + x + " " + f1(640 + y); }
    line.setAttribute("d", d); fadeIn(line, t, 2.9, 0.6);
    const pulse = 1 + (((t * 0.9) % 1) < 0.08 ? 0.004 : 0); root.setAttribute("transform", `translate(960 540) scale(${pulse}) translate(-960 -540)`);
  };
};

SCENES.smudge = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 560, wind: 0, snow: 22, mood: "day" });
  const far = new Bear(fg, { ticks: 0 }); far.g.setAttribute("opacity", 0);
  shadow(fg, 300, 1050, 170, 22);
  const h = new Human(fg); h.set({ x: 300, y: 1040, s: 3, walk: 0, look: -2 });
  return (t) => {
    camTo(cam, t, dur, [960, 540, 1], [1120, 540, 1.16]); snow.set(t);
    far.set({ x: 1450, y: 566, s: 0.05, walk: 0.8, phase: walkPh(t, 1.7), flip: true });
    far.g.setAttribute("opacity", smooth(1.9, 3, t) * (0.65 + Math.sin(t * 6) * 0.1));
  };
};

SCENES.blink = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 560, wind: 0, snow: 26 });
  const b = new Bear(fg); const sh = shadow(fg, 0, 0, 1, 1);
  const lidA = el("rect", { x: 0, y: -600, width: 1920, height: 600, fill: "#050608" }, root), lidB = el("rect", { x: 0, y: 1080, width: 1920, height: 600, fill: "#050608" }, root);
  const b1 = 4.99, b2 = 7.31; // the two blinks, on "you blink"
  const lid = (t) => { let v = 0; for (const c of [b1, b2]) v = Math.max(v, smooth(c - 0.1, c + 0.05, t) * (1 - smooth(c + 0.16, c + 0.42, t))); return v; };
  return (t) => {
    camera(cam, 1100, 560, 1.2); snow.set(t);
    const stage = t < b1 + 0.1 ? 0 : t < b2 + 0.1 ? 1 : 2;
    const scale = stage === 0 ? lerp(0.05, 0.09, t / 5) : stage === 2 ? lerp(0.4, 0.5, (t - b2) / 3) : 0;
    b.g.setAttribute("opacity", stage === 1 ? 0 : 1);
    const gy = 566 + scale * 480;
    b.set({ x: 1240, y: gy, s: scale, phase: walkPh(t, 1.6), flip: true });
    sh.setAttribute("cx", 1240); sh.setAttribute("cy", gy + 2); sh.setAttribute("rx", 300 * scale); sh.setAttribute("ry", 40 * scale); sh.setAttribute("opacity", stage === 1 ? 0 : 1);
    const v = lid(t); lidA.setAttribute("y", -600 + 1140 * v); lidB.setAttribute("y", 1080 - 1140 * v);
  };
};

SCENES.front = (root, p, dur) => {
  const { cam, fg, snow, w } = W(root, { horizon: 470, mood: p.mood || "day", wind: 12, snow: 50, sun: { x: 1300, y: 420, r: 620 } });
  const trk = el("g", {}, fg); const r = rng(4); let d = "";
  for (let i = 0; i < 18; i++) { const u = i / 18, y = 480 + u * u * 620, sx = (i % 2 ? 1 : -1) * (6 + u * 90), rx = 3 + u * 24; d += `M${f1(960 + sx - rx)} ${f1(y)}a${f1(rx)} ${f1(rx * 0.45)} 0 1 0 ${f1(rx * 2)} 0a${f1(rx)} ${f1(rx * 0.45)} 0 1 0 ${f1(-rx * 2)} 0`; }
  el("path", { d, fill: "#9fb6c2", opacity: 0.8 }, trk);
  const sh = shadow(fg, 960, 900, 320, 44);
  const b = new FrontBear(fg, p.seed || 3); const br = new Breath(fg, 5);
  return (t) => {
    const k = (p.from === undefined ? 0.5 : p.from) + ((p.to === undefined ? 1.05 : p.to) - (p.from === undefined ? 0.5 : p.from)) * (t / dur);
    const y = 480 + k * 560;
    b.set({ x: 960, y, s: k, phase: walkPh(t, 1.9), headDrop: 8 + (p.headDrop || 0), swing: Math.sin(t * 1.25) * (p.still ? 0.3 : 1), walk: p.still ? 0.15 : 1 });
    sh.setAttribute("cy", y + 8); sh.setAttribute("rx", 300 * k); sh.setAttribute("ry", 44 * k);
    camera(cam, 960, 540, 1); snow.set(t);
    br.set(t, 960 + Math.sin(t * 1.25) * 42 * k, y + (-190 + 60) * k, 0.2, 3, k);
  };
};

SCENES.scent = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 560, wind: -70, snow: 40 });
  shadow(fg, 290, 836, 70, 10);
  const h = new Human(fg); h.set({ x: 290, y: 832, s: 1.5, walk: 0 });
  const b = new Bear(fg); const sh = shadow(fg, 0, 0, 1, 1);
  const tr = el("path", { d: "M1860 742 H1240", stroke: "#8ba2ae", "stroke-width": 8, "stroke-dasharray": "4 44", "stroke-linecap": "round", fill: "none" }, fg);
  const lines = el("g", {}, root); const r = rng(11); const L = [];
  for (let i = 0; i < 16; i++) L.push({ y: 610 + r() * 190, ph: r(), w: 90 + r() * 120, e: el("path", { fill: "none", stroke: i % 3 ? "#ffffff" : "#ffd76a", "stroke-width": 4, "stroke-linecap": "round", opacity: 0 }, lines) });
  const windL = label(root, 700, 500, "THE WIND BLOWS FROM YOU TO IT", 70); windL.setAttribute("opacity", 0);
  const tr2 = label(root, 960, 1010, "IT HAS NOT CHANGED DIRECTION ONCE", 62); tr2.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t);
    const bx = lerp(1540, 1180, t / dur);
    b.set({ x: bx, y: 742, s: 0.72, phase: walkPh(t, 1.7), flip: true, headPitch: -6 + Math.sin(t * 1.3) * 5, blink: blinkAt(t) });
    sh.setAttribute("cx", bx); sh.setAttribute("cy", 744); sh.setAttribute("rx", 220); sh.setAttribute("ry", 26);
    L.forEach((l) => {
      const u = (t * 0.28 + l.ph) % 1, x = lerp(340, bx - 90, u);
      l.e.setAttribute("d", `M${f1(x)} ${f1(l.y)} q${f1(l.w * 0.5)} ${f1(Math.sin(t * 2 + l.ph * 6) * 10)} ${f1(l.w)} 0`);
      l.e.setAttribute("opacity", (Math.sin(u * Math.PI) * 0.8).toFixed(3));
    });
    fadeIn(windL, t, 0.1); windL.setAttribute("opacity", smooth(0.1, 0.5, t) * (1 - smooth(5, 5.4, t))); fadeIn(tr2, t, 5.6);
  };
};

SCENES.eye = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 520, mood: p.mood || "dusk", snow: 30, sun: { x: 300, y: 520, r: 700 } });
  const b = new Bear(fg, { thin: p.thin || 0 }); const br = new Breath(fg, 5);
  const lbl = p.text ? label(root, 1000, 260, p.text, 130) : null; if (lbl) lbl.setAttribute("opacity", 0);
  return (t) => {
    const z = lerp(p.z0 || 1, p.z1 || 1.16, t / dur);
    camera(cam, 960, 540, z); snow.set(t);
    b.set({ x: -100, y: 1500, s: 3.1, walk: 0, headPitch: Math.sin(t * 0.8) * 2.4 + (p.pitch || 0), blink: blinkAt(t, 3), thin: p.thin || 0 });
    br.set(t, -100 + (178 + 138) * 3.1, 1500 + (-204) * 3.1, 1, 3.2, 3);
    if (lbl) fadeIn(lbl, t, 0.2);
  };
};

SCENES.nothing = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 600, wind: 0, snow: 26 });
  shadow(fg, 960, 898, 70, 10);
  const h = new Human(fg); h.set({ x: 960, y: 896, s: 1.6, walk: 0, look: 4 });
  const items = [];
  const mk = (x, y, build, word, at) => {
    const g = el("g", { opacity: 0 }, fg); const inner = el("g", { transform: `translate(${x} ${y})`, opacity: 0.85 }, g); build(inner);
    const xm = el("path", { d: `M${x - 110} ${y - 220} L${x + 110} ${y + 10} M${x + 110} ${y - 220} L${x - 110} ${y + 10}`, stroke: "#e8261c", "stroke-width": 14, "stroke-linecap": "round", opacity: 0 }, g);
    label(g, x, y + 80, word, 62);
    items.push({ g, xm, at });
  };
  mk(370, 840, (g) => shrub(g, 0, 0, 1.3), "NO TREES", 0.2);
  mk(1540, 840, (g) => { const c = car(g); c.setAttribute("transform", "scale(1.1)"); }, "NO CAR", 1.6);
  mk(960, 590, (g) => { ink(g, "M-120 0 C-110 -70 -60 -110 0 -120 C70 -110 110 -60 120 0 Z", "#7a858c", 3); ink(g, "M-40 -30 L10 -96 L60 -20", "none", 2.5, { opacity: 0.6 }); }, "NO ROCK", 3.6);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t);
    items.forEach((i) => { i.g.setAttribute("opacity", smooth(i.at, i.at + 0.3, t)); i.xm.setAttribute("opacity", smooth(i.at + 0.45, i.at + 0.6, t)); });
  };
};

SCENES.justYou = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 540, wind: 18, snow: 36 });
  shadow(fg, 230, 836, 60, 9);
  const h = new Human(fg); h.set({ x: 230, y: 832, s: 1.35, walk: 0 });
  const sh = shadow(fg, 0, 0, 1, 1);
  const b = new Bear(fg);
  const lb1 = pointer(root, 310, 720, "YOU", "left", 58);
  const lb2 = label(root, 1250, 300, "THE BIGGEST LAND PREDATOR ALIVE", 78); lb2.setAttribute("opacity", 0); lb1.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t);
    const x = lerp(1660, 1260, t / dur);
    b.set({ x, y: 880, s: 1.55, flip: true, phase: walkPh(t, 1.9), blink: blinkAt(t) });
    sh.setAttribute("cx", x); sh.setAttribute("cy", 884); sh.setAttribute("rx", 420); sh.setAttribute("ry", 40);
    fadeIn(lb1, t, 0.2); fadeIn(lb2, t, 2.1);
  };
};

SCENES.lineup = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 560, snow: 20 });
  const mk = (x, s, fill, name, at) => {
    const g = el("g", { opacity: 0 }, fg);
    const b = new Bear(g, { ticks: fill ? 1 : 0 }); if (!fill) silhouette(b);
    shadow(g, x, 882, 300 * s, 22 * s);
    b.set({ x, y: 880, s, walk: 0 });
    label(g, x, 960, name, 58);
    return { g, at };
  };
  const list = [mk(330, 0.6, false, "BLACK BEAR", 0.1), mk(860, 0.9, false, "BROWN BEAR", 0.5), mk(1450, 1.25, true, "POLAR BEAR", 0.9)];
  return (t) => { camera(cam, 960, 540, lerp(1, 1.04, t / dur)); snow.set(t); list.forEach((i) => i.g.setAttribute("opacity", smooth(i.at, i.at + 0.35, t))); };
};

function coastVillage(fg, mood, x0 = 60) {
  house(fg, x0 + 60, 620, 170, 110, "url(#houseA)");
  house(fg, x0 + 300, 650, 130, 90, "url(#houseB)");
  house(fg, x0 + 490, 610, 190, 120, "url(#houseC)");
  house(fg, x0 + 740, 640, 140, 92, "url(#houseA)");
  house(fg, x0 + 930, 612, 170, 104, "url(#houseB)");
}
SCENES.village = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 540, mood: p.mood || "dusk", snow: 44, sun: { x: 1500, y: 540, r: 600 } });
  coastVillage(fg, "dusk");
  const people = [];
  [[520, 700, 0.8], [640, 716, 0.8], [760, 696, 0.72]].forEach(([x, y, s]) => { const h = new Human(fg, { coat: "url(#houseA)" }); h.set({ x, y, s, walk: 0 }); people.push(h); });
  const sh = shadow(fg, 0, 0, 1, 1); const b = new Bear(fg);
  const txt = label(root, 960, 960, p.text || "THEY TREAT IT WITH MORE RESPECT THAN ALMOST ANY OTHER ANIMAL", 62); txt.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, lerp(1, 1.06, t / dur)); snow.set(t);
    const x = lerp(1740, 1430, t / dur); b.set({ x, y: 780, s: 0.72, flip: true, phase: walkPh(t, 1.9) });
    sh.setAttribute("cx", x); sh.setAttribute("cy", 782); sh.setAttribute("rx", 190); sh.setAttribute("ry", 20); fadeIn(txt, t, 0.5);
  };
};

SCENES.moreCommon = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 500, mood: "dusk", snow: 30 });
  coastVillage(fg, "dusk", 460);
  const r = rng(12), bs = [];
  for (let i = 0; i < 7; i++) { const s = 0.22 + i * 0.05; const b = new Bear(fg, { ticks: 0, seed: 20 + i }); bs.push({ b, x: 130 + r() * 1700, y: 690 + i * 44, s, at: 0.2 + i * 0.5 }); }
  const txt = label(root, 960, 200, p.text || "MORE COMMON. NOT LESS.", 118); txt.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t); fadeIn(txt, t, 0.3);
    bs.forEach((o, i) => { o.b.g.setAttribute("opacity", smooth(o.at, o.at + 0.4, t)); o.b.set({ x: o.x + t * (i % 2 ? 14 : -14), y: o.y, s: o.s, phase: walkPh(t + i, 1.8), flip: i % 2 === 0 }); });
  };
};

// ---- Chapter card: huge white title on darkened, blurred scenery ----
SCENES.chapter = (root, p, dur) => {
  if (!document.getElementById("softBlur")) { const f = el("filter", { id: "softBlur", x: "-5%", y: "-5%", width: "110%", height: "110%" }, document.getElementById("gDefs")); el("feGaussianBlur", { stdDeviation: 9 }, f); }
  const back = el("g", { filter: "url(#softBlur)" }, root); sky(back, p.mood || "day"); icePlain(back, 600, p.mood || "day", p.seed || 3);
  el("rect", { width: 1920, height: 1080, fill: "#06141d", opacity: 0.55 }, root);
  const g = el("g", {}, root);
  const lines = p.title.split("|");
  const size = p.size || 190; const top = 540 - ((lines.length - 1) * size * 0.98) / 2 + size * 0.2 - (p.sub ? 60 : 0);
  lines.forEach((l, i) => label(g, 960, top + i * size * 0.98, l, size, { sw: size * 0.1 }));
  const s = el("g", { opacity: 0 }, root);
  if (p.sub) label(s, 960, top + lines.length * size * 0.8 + 40, p.sub, 62);
  return (t) => { g.setAttribute("opacity", smooth(0, 0.35, t) * (1 - smooth(dur - 0.55, dur - 0.1, t))); fadeIn(s, t, Math.min(1.1, dur * 0.35)); s.setAttribute("opacity", smooth(Math.min(1.1, dur * 0.35), Math.min(1.1, dur * 0.35) + 0.4, t) * (1 - smooth(dur - 0.55, dur - 0.1, t))); };
};

// ---- WHAT'S WALKING TOWARD YOU ----
SCENES.weigh = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 520, snow: 20 });
  ink(fg, "M380 860 L1400 860 L1440 900 L340 900 Z", "#59666e", 3); ink(fg, "M340 900 L1440 900 L1440 924 L340 924 Z", "#3a454c", 3);
  const b = new Bear(fg); b.set({ x: 880, y: 860, s: 1.55, walk: 0 });
  const box = ink(root, "M1340 200 h440 v190 h-440 Z", "#0e1a22", 4);
  const num = el("text", { x: 1560, y: 340, "font-family": "League Gothic", "font-size": 150, fill: "#8ff0a4", "text-anchor": "middle" }, root);
  const half = label(root, 620, 220, "WELL OVER HALF A TON", 86); half.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t);
    b.set({ x: 880, y: 860 + Math.sin(t * 1.2) * 1.2, s: 1.55, walk: 0, headPitch: Math.sin(t * 0.9) * 3, blink: blinkAt(t) });
    const v = Math.round(700 * easeOut(0.5, 4.2, t));
    num.textContent = v + " KG"; fadeIn(half, t, 0.4);
  };
};

// Standing bear pose: pivots up on its hind feet
function standPose(b, q) {
  const rise = q.rise === undefined ? 1 : q.rise, pitch = -62 * rise;
  const fr = { rn: { x: -112, y: -22, p: 0 }, rf: { x: -86, y: -22, p: 0 } };
  fr.fn = rise > 0.1 ? { x: lerp(118, -6, rise), y: lerp(-22, -285, rise), p: 40 * rise } : undefined;
  fr.ff = rise > 0.1 ? { x: lerp(138, 12, rise), y: lerp(-22, -315, rise), p: 40 * rise } : undefined;
  b.set(Object.assign({ walk: 0, torsoPitch: pitch, pivotX: -124, pivotY: -168, feet: fr, headPitch: -pitch * 0.92 + (q.nod || 0), drop: lerp(0, -18, rise) }, q));
}
SCENES.upright = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 720, snow: 22, noRidges: false });
  // hoop drawn to the same scale: 3.05 m rim at 200 px per metre
  const PX = 200, base = 930, hx = 1380;
  ink(fg, `M${hx + 150} ${base} L${hx + 150} ${base - 3.3 * PX} L${hx + 40} ${base - 3.3 * PX}`, "none", 12);
  ink(fg, `M${hx + 40} ${base - 3.5 * PX} L${hx + 56} ${base - 3.5 * PX} L${hx + 56} ${base - 2.9 * PX} L${hx + 40} ${base - 2.9 * PX} Z`, "#f4f8f8", 3);
  ink(fg, `M${hx + 40} ${base - 3.05 * PX} a55 12 0 1 1 -110 0 a55 12 0 1 1 110 0`, "none", 5, { stroke: "#e2601e" });
  ink(fg, `M${hx - 62} ${base - 3.05 * PX} l14 60 h66 l14 -60`, "none", 2.5, { stroke: "#f4f8f8", "stroke-dasharray": "6 5" });
  // ruler
  el("path", { d: `M300 ${base} V${base - 3 * PX} M280 ${base} H320 M280 ${base - PX} H320 M280 ${base - 2 * PX} H320 M280 ${base - 3 * PX} H320`, stroke: "#14181d", "stroke-width": 6, fill: "none" }, fg);
  ["1 M", "2 M", "3 M"].forEach((s, i) => label(fg, 268, base - (i + 1) * PX + 16, s, 50, { anchor: "end" }));
  shadow(fg, 830, base + 2, 240, 22);
  const h = new Human(fg); h.set({ x: 500, y: base, s: 1.7 * PX / 212, walk: 0, look: -14 });
  const b = new Bear(fg);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t);
    const rise = easeOut(0.3, 1.9, t);
    standPose(b, { x: 860, y: base, s: 1.32, rise, blink: blinkAt(t), nod: Math.sin(t * 1.1) * 3 });
  };
};

SCENES.room = (root, p, dur) => {
  const g = el("g", {}, root);
  el("rect", { width: 1920, height: 1080, fill: "#e9dcc4" }, g);
  el("rect", { y: 880, width: 1920, height: 200, fill: "#8f6f4e" }, g);
  el("rect", { y: 0, width: 1920, height: 200, fill: "#f6efdf" }, g); el("line", { x1: 0, y1: 200, x2: 1920, y2: 200, stroke: INK, "stroke-width": 5 }, g);
  el("line", { x1: 0, y1: 880, x2: 1920, y2: 880, stroke: INK, "stroke-width": 4 }, g);
  ink(g, "M170 300 h280 v240 h-280 Z", "#a9cbd7", 5); el("path", { d: "M310 300 v240 M170 420 h280", stroke: INK, "stroke-width": 4 }, g);
  ink(g, "M1320 880 v-150 c0 -40 30 -60 70 -60 h280 c40 0 70 20 70 60 v150 Z", "#4f6f83", 4); ink(g, "M1360 880 v-90 h300 v90 Z", "#5f8197", 3);
  ink(g, "M1700 880 l10 -300 h40 l10 300 Z", "#3a3a3a", 3); ink(g, "M1680 580 l30 -80 h40 l30 80 Z", "#efdca0", 3);
  ink(g, "M560 880 v-70 h130 v70 Z", "#7a5a3c", 3); ink(g, "M600 810 c-14 -40 10 -70 26 -74 c14 6 36 34 22 74 Z", "#4e7a56", 2.4);
  const sh = shadow(g, 930, 884, 250, 22);
  const b = new Bear(g);
  const txt = label(root, 960, 150, "IT WOULD HAVE TO DUCK", 90); txt.setAttribute("opacity", 0);
  return (t) => { const rise = easeOut(0.1, 1.2, t); standPose(b, { x: 870, y: 880, s: 1.32, rise: rise * 0.86, blink: blinkAt(t), nod: 28 }); fadeIn(txt, t, 1); };
};

SCENES.paw = (root, p, dur) => {
  el("rect", { width: 1920, height: 1080, fill: "url(#ice2)" }, root);
  const r = rng(3); let d = ""; for (let i = 0; i < 40; i++) { const x = r() * 1920, y = r() * 1080, l = 30 + r() * 110; d += `M${f1(x)} ${f1(y)}q${f1(l / 2)} ${f1(r() * 6 - 3)} ${f1(l)} 0`; } el("path", { d, stroke: "#fff", "stroke-width": 3, fill: "none" }, root);
  const cam = el("g", {}, root);
  const pl = el("g", { transform: "translate(1320 560)" }, cam);
  ink(pl, "M-300 0 a300 300 0 1 0 600 0 a300 300 0 1 0 -600 0", "#ffffff", 5); ink(pl, "M-200 0 a200 200 0 1 0 400 0 a200 200 0 1 0 -400 0", "#f2f5f4", 3);
  const paw = el("g", { transform: "translate(600 560)" }, cam);
  const padD = "M-260 40 C-280 -100 -180 -230 0 -240 C180 -230 280 -100 260 40 C250 170 150 280 0 280 C-150 280 -250 170 -260 40 Z";
  el("path", { d: furry(padD, 5, 6, 22), fill: INK, stroke: INK, "stroke-width": 8 }, paw); el("path", { d: furry(padD, 5, 6, 22), fill: "url(#furLeg)" }, paw);
  Bear.prototype._ticks.call({}, paw, padD, 70, 8, 90);
  [[-180, -200], [-90, -252], [12, -268], [112, -248], [196, -188]].forEach(([x, y], i) => {
    ink(paw, `M${x - 32} ${y + 40} C${x - 40} ${y - 10} ${x + 40} ${y - 10} ${x + 32} ${y + 40} Z`, "#f6efdc", 4);
    ink(paw, `M${x - 11} ${y - 2} C${x - 8} ${y - 50} ${x + 2} ${y - 74} ${x + 3} ${y - 80} C${x + 10} ${y - 60} ${x + 14} ${y - 24} ${x + 11} ${y - 2} Z`, "#1a1d20", 2);
  });
  const ruler = el("g", { opacity: 0 }, root);
  el("path", { d: "M330 950 H870 M330 930 V970 M870 930 V970", stroke: INK, "stroke-width": 6, fill: "none" }, ruler);
  label(ruler, 600, 1030, "30 CM ACROSS", 66);
  const plate = label(root, 1320, 150, "AS WIDE AS A DINNER PLATE", 78); plate.setAttribute("opacity", 0);
  return (t) => { const z = lerp(0.98, 1.04, t / dur); cam.setAttribute("transform", `translate(960 540) scale(${z}) translate(-960 -540)`); fadeIn(ruler, t, 0.4); fadeIn(plate, t, 3); };
};

SCENES.iceSpread = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 430, snow: 20 });
  const sh = shadow(fg, 0, 0, 1, 1);
  const b = new Bear(fg); const arrows = el("g", {}, root);
  const txt = label(root, 960, 200, "SPREADS ITS WEIGHT LIKE SNOWSHOES", 86); txt.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t);
    const x = lerp(560, 1080, t / dur); b.set({ x, y: 860, s: 1.6, phase: walkPh(t, 1.9), blink: blinkAt(t) });
    sh.setAttribute("cx", x); sh.setAttribute("cy", 864); sh.setAttribute("rx", 440); sh.setAttribute("ry", 40); fadeIn(txt, t, 0.3);
    while (arrows.firstChild) arrows.removeChild(arrows.firstChild);
    [[-118, 0], [118, 0.25], [-96, 0.5], [138, 0.75]].forEach(([ox, phs]) => {
      const u = ((walkPh(t, 1.9) + phs) % 1 + 1) % 1; if (u > 0.66) return;
      const fx = x + (ox + 118 * (0.5 - u / 0.66)) * 1.6, o = Math.sin((u / 0.66) * Math.PI);
      for (const dir of [-1, 1]) el("path", { d: `M${f1(fx + dir * 56)} 888 l${dir * 92} 10 m${-dir * 22} -14 l${dir * 22} 14 l${-dir * 26} 8`, stroke: "#c9301f", "stroke-width": 6, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round", opacity: o.toFixed(2) }, arrows);
    });
  };
};

// Underwater: bear swimming, seen from the side
function bubbles(g, n, seed, bx, by, w) { const r = rng(seed), b = []; for (let i = 0; i < n; i++) b.push({ x: r() * w, ph: r(), s: 2 + r() * 6, e: el("circle", { fill: "#d7ecf4", opacity: 0 }, g) }); return (t) => b.forEach((o) => { const u = (t * 0.5 + o.ph) % 1; o.e.setAttribute("cx", f1(bx + o.x + Math.sin(t * 2 + o.ph * 6) * 8)); o.e.setAttribute("cy", f1(by - u * 500)); o.e.setAttribute("r", o.s); o.e.setAttribute("opacity", (0.55 * Math.sin(u * Math.PI)).toFixed(2)); }); }
function rays(g, n, seed, top, h) { const r = rng(seed), R = []; for (let i = 0; i < n; i++) R.push({ x: r() * 2200 - 140, w: 60 + r() * 150, ph: r() * 6, e: el("path", { fill: "#bfe6f2", opacity: 0.1 }, g) }); return (t) => R.forEach((o) => { const dx = Math.sin(t * 0.25 + o.ph) * 60; o.e.setAttribute("d", `M${f1(o.x + dx)} ${top} L${f1(o.x + o.w + dx)} ${top} L${f1(o.x + o.w * 2.4 + dx * 2 + 120)} ${top + h} L${f1(o.x - o.w + dx * 2 + 120)} ${top + h} Z`); o.e.setAttribute("opacity", (0.07 + 0.05 * Math.sin(t * 0.6 + o.ph)).toFixed(3)); }); }
function underwaterBase(root, surface = 150) {
  const cam = el("g", {}, root), w = el("g", {}, cam);
  el("rect", { x: -400, y: -400, width: 2720, height: surface + 400, fill: "url(#skyBlue)" }, w);
  el("rect", { x: -400, y: surface, width: 2720, height: 2000, fill: "url(#waterLit)" }, w);
  const r = el("g", {}, w), ry = rays(r, 12, 5, surface, 1000);
  const line = el("path", { fill: "none", stroke: "#e4f6fa", "stroke-width": 5, opacity: 0.8 }, w);
  return { cam, w, ry, setSurface: (t) => { let d = ""; for (let x = -300; x <= 2300; x += 40) d += (d ? "L" : "M") + x + " " + f1(surface + Math.sin(x * 0.012 + t * 1.3) * 7); line.setAttribute("d", d); } };
}
function swimFeet(t, T = 2.1) {
  const a = (t / T) * 2 * Math.PI;
  const paddle = (ph) => ({ x: 170 + 80 * Math.cos(a + ph), y: -50 + 58 * Math.sin(a + ph), p: 40 });
  const kick = (ph) => ({ x: -216 + 36 * Math.sin(a + ph), y: -60 + 20 * Math.cos(a + ph), p: 60 });
  return { fn: paddle(0), ff: paddle(Math.PI), rn: kick(Math.PI), rf: kick(0) };
}
SCENES.swim = (root, p, dur) => {
  const { cam, w, ry, setSurface } = underwaterBase(root, p.surface || 150);
  const blG = el("g", {}, w), bl = bubbles(blG, 22, 3, 400, 900, 1300);
  const b = new Bear(w);
  const txt = p.text ? label(root, 960, 1000, p.text, 76) : null; if (txt) txt.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, lerp(1, 1.05, t / dur)); ry(t); setSurface(t); bl(t);
    b.set({ x: 780 + Math.sin(t * 0.7) * 12, y: 520 + Math.sin(t * 1.2) * 6, s: 1.6, walk: 0, feet: swimFeet(t), torsoPitch: -6, pivotY: -190, headPitch: -8 + Math.sin(t * 1.2) * 2 });
    if (txt) fadeIn(txt, t, 0.6);
  };
};

SCENES.sole = (root, p, dur) => {
  el("rect", { width: 1920, height: 1080, fill: "url(#ice2)" }, root);
  const pw = el("g", { transform: "translate(640 540)" }, root);
  const padD = "M-250 -30 C-260 -170 -130 -260 0 -260 C130 -260 260 -170 250 -30 C240 120 150 240 0 240 C-150 240 -240 120 -250 -30 Z";
  el("path", { d: furry(padD, 9, 7, 16), fill: INK, stroke: INK, "stroke-width": 7 }, pw); el("path", { d: furry(padD, 9, 7, 16), fill: "#e9e1ca" }, pw);
  Bear.prototype._ticks.call({}, pw, padD, 120, 12, 90, "#8f8a7c");
  const pad = "M-150 40 C-160 -30 -90 -70 0 -70 C90 -70 160 -30 150 40 C150 120 80 170 0 170 C-80 170 -150 120 -150 40 Z";
  ink(pw, pad, "#26292c", 4);
  const R = rng(5); let bumps = ""; for (let i = 0; i < 140; i++) { const x = -150 + R() * 300, y = -70 + R() * 240; if (Math.hypot(x / 150, (y - 50) / 120) < 0.96) bumps += `M${f1(x - 5)} ${f1(y)}a5 5 0 1 0 10 0a5 5 0 1 0 -10 0`; }
  el("path", { d: bumps, fill: "#4a4f54" }, pw);
  [[-180, -210], [-90, -258], [10, -272], [110, -252], [190, -200]].forEach(([x, y]) => { ink(pw, `M${x - 38} ${y + 50} C${x - 46} ${y - 12} ${x + 46} ${y - 12} ${x + 38} ${y + 50} C${x + 20} ${y + 66} ${x - 20} ${y + 66} ${x - 38} ${y + 50} Z`, "#26292c", 3); });
  const cl = el("g", { transform: "translate(1420 560)", opacity: 0 }, root);
  ink(cl, "M-110 -280 C-60 -310 60 -310 110 -280 C130 -120 110 40 100 150 C90 240 -90 240 -100 150 C-110 40 -130 -120 -110 -280 Z", "#3c3f44", 4);
  [[-60, -220], [50, -220], [-70, -110], [60, -110], [-50, 0], [50, 0], [-50, 130], [50, 130]].forEach(([x, y]) => ink(cl, `M${x - 16} ${y} L${x} ${y - 26} L${x + 16} ${y} L${x} ${y + 18} Z`, "#e8e8e8", 2.5));
  label(cl, 0, 330, "FOOTBALL CLEATS", 62);
  const a = pointer(root, 790, 620, "SMALL BUMPS", "left", 58), b = pointer(root, 860, 340, "TUFTS OF FUR", "left", 58);
  a.setAttribute("opacity", 0); b.setAttribute("opacity", 0);
  return (t) => { fadeIn(a, t, 0.3); fadeIn(b, t, 2.1); fadeIn(cl, t, 4.4); };
};

SCENES.shuffle = (root, p, dur) => {
  const { cam, w, fg, snow } = W(root, { horizon: 500, snow: 30, wind: 40 });
  const h = new Human(fg);
  const sh = shadow(fg, 0, 0, 1, 1); const b = new Bear(fg);
  const a = pointer(root, 640, 470, "AFRAID TO FALL", "left", 60), c = label(root, 1420, 300, "IT RUNS ON THIS", 92); a.setAttribute("opacity", 0); c.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t);
    const slip = Math.sin(t * 5) * 6;
    h.set({ x: 400 + t * 12, y: 720, s: 1.9, phase: t * 0.9, walk: 0.45, lean: 6 + slip * 0.6, arm: 34 + slip * 3, armF: -34 - slip * 3, stride: 14 });
    const x = lerp(2200, 1290, easeOut(2.6, 8, t));
    b.set({ x, y: 900, s: 1.4, flip: true, phase: t / 0.85, stride: 170, lift: 40, torsoPitch: Math.sin(t * 7.4) * 1.5 });
    sh.setAttribute("cx", x); sh.setAttribute("cy", 904); sh.setAttribute("rx", 380); sh.setAttribute("ry", 34);
    fadeIn(a, t, 0.5); a.setAttribute("opacity", smooth(0.5, 0.9, t) * (1 - smooth(3.4, 3.8, t))); fadeIn(c, t, 5);
  };
};

// A bear at a run: ground scrolls, speed lines, huge number
SCENES.speed = (root, p, dur) => {
  const cam = el("g", {}, root); const bg = el("g", {}, cam); sky(bg, "day");
  const far = el("g", {}, cam); icePlain(far, 560, "day", 8);
  const lines = el("g", {}, root); const R = rng(3), L = []; for (let i = 0; i < 24; i++) L.push({ y: 610 + R() * 460, l: 90 + R() * 300, ph: R(), e: el("path", { stroke: "#fff", "stroke-width": 2 + R() * 4, "stroke-linecap": "round", opacity: 0.8 }, lines) });
  const sh = shadow(root, 860, 894, 460, 40); const b = new Bear(root);
  const num = label(root, 1430, 330, "0", 240); const un = label(root, 1430, 430, "KM/H", 90);
  const spray = el("g", {}, root), S = []; for (let i = 0; i < 16; i++) S.push({ ph: R(), e: el("circle", { fill: "#fff", opacity: 0 }, spray) });
  return (t) => {
    const x = (t * 1400) % 2400; far.setAttribute("transform", `translate(${f1(-x * 0.14)} 0)`);
    L.forEach((o) => { const u = (t * 1.5 + o.ph) % 1, sx = 2000 - u * 2400; o.e.setAttribute("d", `M${f1(sx)} ${f1(o.y)} h${f1(o.l)}`); });
    b.set({ x: 860, y: 890, s: 1.6, phase: t / 0.56, stride: 230, lift: 66, torsoPitch: Math.sin((t / 0.56) * 4 * Math.PI) * 3, headPitch: 6 + Math.sin((t / 0.56) * 4 * Math.PI) * 4 });
    S.forEach((o) => { const u = (t * 2 + o.ph) % 1; o.e.setAttribute("cx", f1(500 - u * 400 + o.ph * 200)); o.e.setAttribute("cy", f1(880 - Math.sin(u * Math.PI) * 60)); o.e.setAttribute("r", f1(2 + o.ph * 6)); o.e.setAttribute("opacity", (1 - u).toFixed(2)); });
    num.textContent = Math.round(40 * easeOut(0.2, 1.6, t));
  };
};

SCENES.sprinter = (root, p, dur) => {
  const top = el("g", {}, root), low = el("g", {}, root);
  el("rect", { width: 1920, height: 520, fill: "#7fb2cc" }, top); el("rect", { y: 260, width: 1920, height: 260, fill: "#c35a3c" }, top);
  for (let i = 0; i < 4; i++) el("line", { x1: 0, y1: 290 + i * 62, x2: 1920, y2: 290 + i * 62, stroke: "#fff", "stroke-width": 5 }, top);
  const crowd = el("g", {}, top); el("rect", { y: 150, width: 1920, height: 110, fill: "#55636e" }, crowd);
  const R = rng(4); let dots = ""; for (let i = 0; i < 240; i++) dots += `M${f1(R() * 1920)} ${f1(160 + R() * 92)}h3`; el("path", { d: dots, stroke: "#d8d3c8", "stroke-width": 3 }, crowd);
  const run = new Human(top, { coat: "#f2c230", pants: "#22303a", boots: "#e8261c", bare: true });
  el("line", { x1: 0, y1: 520, x2: 1920, y2: 520, stroke: INK, "stroke-width": 8 }, root);
  const lw = el("g", {}, low); sky(lw, "day", { x: 1300, y: 640, r: 400 });
  el("rect", { x: -100, y: 760, width: 2100, height: 330, fill: "url(#iceDay)" }, lw); ridge(lw, 100, 760, 300, 60, 2); ridge(lw, 1400, 760, 380, 70, 5);
  const you = new Human(low);
  const clipId = "lowClip"; const cp = el("clipPath", { id: clipId }, root); el("rect", { y: 524, width: 1920, height: 556 }, cp); low.setAttribute("clip-path", `url(#${clipId})`);
  label(root, 60, 100, "THE FASTEST HUMANS EVER", 72, { anchor: "start" }); label(root, 60, 180, "A DRY TRACK, RUNNING SHOES", 54, { anchor: "start", fill: "#ffe089" });
  const y1 = label(root, 60, 640, "YOU", 92, { anchor: "start" }), y2 = label(root, 60, 720, "HEAVY BOOTS ON ICE", 62, { anchor: "start", fill: "#bfe6f2" }); y1.setAttribute("opacity", 0); y2.setAttribute("opacity", 0);
  return (t) => {
    run.set({ x: (t * 560) % 2300 - 200, y: 470, s: 1.3, phase: t / 0.46, stride: 40, lean: 14, arm: Math.sin((t / 0.46) * 2 * Math.PI) * 62 });
    you.set({ x: 800 + t * 28, y: 1000, s: 1.8, phase: t * 0.8, walk: 0.5, stride: 14, lean: 8 });
    fadeIn(y1, t, p.you || 3.2); fadeIn(y2, t, (p.you || 3.2) + 0.4);
  };
};

SCENES.overheat = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 520, snow: 18 });
  const heatG = el("g", {}, fg), H = []; const R = rng(3);
  for (let i = 0; i < 9; i++) H.push({ x: 420 + R() * 700, y: 260 + R() * 420, r: 120 + R() * 170, ph: R() * 6, e: el("ellipse", { fill: i % 2 ? "url(#heatA)" : "url(#heatB)" }, heatG) });
  if (!document.getElementById("heatA")) { const d = document.getElementById("gDefs"); const a = el("radialGradient", { id: "heatA" }, d); el("stop", { offset: 0, "stop-color": "#ff5a2c", "stop-opacity": 0.6 }, a); el("stop", { offset: 1, "stop-color": "#ff5a2c", "stop-opacity": 0 }, a); const b = el("radialGradient", { id: "heatB" }, d); el("stop", { offset: 0, "stop-color": "#ffb42c", "stop-opacity": 0.6 }, b); el("stop", { offset: 1, "stop-color": "#ffb42c", "stop-opacity": 0 }, b); }
  const sh = shadow(fg, 780, 874, 420, 36); const b = new Bear(fg); const br = new Breath(fg, 6);
  const tg = el("g", { transform: "translate(1560 200)" }, root);
  ink(tg, "M-22 0 V360 a42 42 0 1 0 44 0 V0 a22 22 0 0 0 -44 0 Z", "#f4f8f8", 5);
  const fill = el("rect", { x: -12, width: 24, fill: "#e8261c" }, tg); el("circle", { cx: 0, cy: 395, r: 30, fill: "#e8261c" }, tg);
  const t1 = label(root, 620, 170, "IT OVERHEATS FAST", 104); t1.setAttribute("opacity", 0);
  const t2 = label(root, 620, 170, "BUILT TO STAY WARM", 104), t3 = label(root, 620, 290, "NOT TO CHASE FOR LONG", 76, { fill: "#ffd76a" }); t2.setAttribute("opacity", 0); t3.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t);
    const slow = 1 - smooth(1.6, 4, t);
    const ph = 1.1 * t - 0.2 * t * t * 0 + (t < 4 ? 0 : 0);
    b.set({ x: 800, y: 870, s: 1.6, walk: 0.4 + slow * 0.6, phase: ph, stride: 118 + slow * 60, jaw: 10 + Math.sin(t * 8) * 4, headPitch: 6 + Math.sin(t * 8) * 1.6, blink: blinkAt(t) });
    br.set(t, 800 + 310 * 1.6, 870 - 190 * 1.6, 1, 0.8, 1.2);
    H.forEach((o) => { o.e.setAttribute("cx", f1(o.x + Math.sin(t + o.ph) * 30)); o.e.setAttribute("cy", f1(o.y - t * 4)); o.e.setAttribute("rx", f1(o.r)); o.e.setAttribute("ry", f1(o.r * 0.8)); o.e.setAttribute("opacity", smooth(0, 3, t).toFixed(2)); });
    const lvl = lerp(60, 330, smooth(0, 4, t)); fill.setAttribute("y", f1(370 - lvl)); fill.setAttribute("height", f1(lvl));
    t1.setAttribute("opacity", smooth(0, 0.4, t) * (1 - smooth(6.6, 6.9, t))); fadeIn(t2, t, 7); fadeIn(t3, t, 8);
  };
};

SCENES.hair = (root, p, dur) => {
  el("rect", { width: 1920, height: 1080, fill: "url(#mapSea)" }, root);
  el("rect", { y: 860, width: 1920, height: 220, fill: "#15181c" }, root);
  const hairD = (x, w) => `M${x - w} 860 C${x - w - 8} 600 ${x - w + 30} 330 ${x + 80} 90 C${x + 92} 80 ${x + 106} 90 ${x + 104} 104 C${x + w} 340 ${x + w} 620 ${x + w} 860 Z`;
  [[420, 60], [1520, 62]].forEach(([x, w]) => el("path", { d: hairD(x, w), fill: "#dfeef2", opacity: 0.32, stroke: "#eef6f8", "stroke-width": 3 }, root));
  const main = el("g", {}, root);
  el("path", { d: hairD(920, 130), fill: "#e8f4f6", opacity: 0.32, stroke: "#f4fbfc", "stroke-width": 6 }, main);
  el("path", { d: hairD(920, 70), fill: "#0d2738", opacity: 0.85, stroke: "#bcd9e3", "stroke-width": 3 }, main);
  label(main, 920, 620, "HOLLOW", 60, { fill: "#e4f6fa" });
  const rg = el("g", {}, root), R = rng(4), raysL = [];
  for (let i = 0; i < 16; i++) raysL.push({ x: 120 + R() * 1700, ang: (R() - 0.5) * 2, ph: R(), e: el("path", { stroke: "#fff4c8", "stroke-width": 4, fill: "none", "stroke-linecap": "round" }, rg) });
  const a = pointer(root, 1080, 300, "CLEAR, NOT WHITE", "left", 62); a.setAttribute("opacity", 0);
  const b = label(root, 960, 1000, "IT LOOKS WHITE FOR THE SAME REASON SNOW DOES: IT SCATTERS LIGHT", 56); b.setAttribute("opacity", 0);
  return (t) => {
    fadeIn(a, t, 0.5); fadeIn(b, t, 5.7);
    raysL.forEach((o) => {
      const u = (t * 0.35 + o.ph) % 1, hitY = 430;
      if (u < 0.5) { const y = lerp(-40, hitY, u * 2); o.e.setAttribute("d", `M${f1(o.x)} ${f1(y - 70)} L${f1(o.x)} ${f1(y)}`); }
      else { const v = (u - 0.5) * 2, x = o.x + o.ang * v * 480, y = hitY - Math.abs(o.ang) * 0 - v * 300 + Math.abs(o.ang) * v * 120; o.e.setAttribute("d", `M${f1(o.x + o.ang * (v - 0.14) * 480)} ${f1(hitY - (v - 0.14) * 300)} L${f1(x)} ${f1(hitY - v * 300)}`); }
      o.e.setAttribute("opacity", (Math.sin(u * Math.PI) * 0.9).toFixed(2));
    });
  };
};

SCENES.layers = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 300, snow: 0, sun: { x: 1400, y: 200, r: 500 } });
  const blk = el("g", {}, root);
  el("rect", { x: 300, y: 380, width: 1320, height: 170, fill: "#f2eedf" }, blk);
  const R = rng(9); let hs = ""; for (let i = 0; i < 180; i++) { const x = 300 + i * 7.3 + R() * 4; hs += `M${f1(x)} 550 q${f1(R() * 12 - 2)} -90 ${f1(R() * 22 - 6)} ${f1(-150 - R() * 40)}`; }
  el("path", { d: hs, stroke: "#c9c4ae", "stroke-width": 2.4, fill: "none" }, blk);
  el("rect", { x: 300, y: 550, width: 1320, height: 60, fill: "#191c20" }, blk);
  el("rect", { x: 300, y: 610, width: 1320, height: 210, fill: "url(#fat)" }, blk);
  el("rect", { x: 300, y: 820, width: 1320, height: 140, fill: "#7d3f39" }, blk);
  ink(blk, "M300 380 H1620 V960 H300 Z", "none", 5);
  const a = label(root, 1660, 480, "FUR", 74, { anchor: "start" }), b = label(root, 1660, 600, "BLACK SKIN", 58, { anchor: "start" }), c = label(root, 1660, 730, "THICK FAT", 62, { anchor: "start", fill: "#ffe089" });
  [a, b, c].forEach((n) => n.setAttribute("opacity", 0));
  const rg = el("g", {}, root), L = []; for (let i = 0; i < 12; i++) L.push(el("path", { stroke: "#ffe7a0", "stroke-width": 7, "stroke-linecap": "round", opacity: 0 }, rg));
  return (t) => {
    camera(cam, 960, 540, 1); fadeIn(a, t, 0.1); fadeIn(b, t, 1.3); fadeIn(c, t, 6.7);
    L.forEach((e, i) => { const u = (t * 0.5 + i / 12) % 1, x = 380 + i * 100, y = lerp(40, 540, u); e.setAttribute("d", `M${x + (540 - y) * 0.22} ${f1(y - 60)} L${x + (540 - y) * 0.22 - 14} ${f1(y)}`); e.setAttribute("opacity", smooth(1.5, 2.4, t) * Math.sin(u * Math.PI)); });
  };
};

SCENES.vanish = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 540, mood: "blue", snow: 80, wind: 60, sun: { x: 960, y: 540, r: 900 } });
  const sh = shadow(fg, 0, 0, 1, 1); const b = new Bear(fg);
  const fog = el("rect", { x: 0, y: 0, width: 1920, height: 1080, fill: "#edf4f5", opacity: 0 }, root);
  const t1 = label(root, 960, 200, "BUILT TO VANISH", 130); t1.setAttribute("opacity", 0);
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t);
    const x = lerp(560, 1240, t / dur); b.set({ x, y: 820, s: 1.2, phase: walkPh(t, 1.9) });
    sh.setAttribute("cx", x); sh.setAttribute("cy", 824); sh.setAttribute("rx", 340); sh.setAttribute("ry", 30);
    fog.setAttribute("opacity", smooth(0.5, dur - 0.5, t) * 0.8); fadeIn(t1, t, 1);
  };
};

function walrus(g, x, y, s = 1) { const c = el("g", { transform: `translate(${x} ${y}) scale(${s})` }, g); ink(c, "M-150 0 C-170 -40 -110 -110 -30 -120 C40 -126 90 -110 104 -76 C112 -46 100 -20 84 -8 L44 0 Z", "#b07d58", 3); ink(c, "M86 -60 C102 -54 112 -40 106 -28 C92 -20 78 -24 72 -32 Z", "#d1a57f", 2.4); ink(c, "M84 -26 L78 34 L92 -24 M100 -26 L100 32 L110 -30", "#f0ead9", 2.4); el("circle", { cx: 80, cy: -74, r: 3.5, fill: INK }, c); return c; }
function whale(g, x, y, s = 1) { const c = el("g", { transform: `translate(${x} ${y}) scale(${s})` }, g); ink(c, "M-250 -36 C-180 -92 -40 -112 80 -100 C160 -92 230 -66 240 -30 C210 -6 110 12 0 10 C-90 8 -170 -6 -250 -36 Z", "#39596e", 3); ink(c, "M-240 -40 L-310 -92 L-286 -38 L-322 -2 L-246 -30 Z", "#2c485b", 3); ink(c, "M90 -6 C80 40 40 60 10 56 C20 30 40 10 60 -2 Z", "#2c485b", 2.4); el("circle", { cx: 190, cy: -56, r: 4, fill: INK }, c); return c; }
SCENES.family = (root, p, dur) => {
  const cam = el("g", {}, root), w = el("g", {}, cam);
  el("rect", { x: 0, y: 0, width: 1920, height: 1080, fill: "url(#cardBg)" }, w); el("ellipse", { cx: 960, cy: 836, rx: 420, ry: 34, fill: "#27465a" }, w); const ry = () => {};
  const items = [];
  const add = (fn, at, name, x, y) => { const g = el("g", { opacity: 0 }, w); fn(g); label(g, x, y, name, 58); items.push({ g, at }); };
  add((g) => { const s = new Seal(g); s.set({ x: 420, y: 330, s: 1.1 }); }, 6.4, "SEALS", 420, 450);
  add((g) => walrus(g, 1000, 400, 1.15), 8.1, "WALRUSES", 1000, 470);
  add((g) => whale(g, 1500, 360, 1), 8.9, "WHALES", 1500, 470);
  const bg = el("g", { opacity: 0 }, w); const b = new Bear(bg); b.set({ x: 960, y: 900, s: 1.05, walk: 0 });
  const name = el("g", { opacity: 0 }, root); label(name, 960, 980, "URSUS MARITIMUS", 110, { fill: "#fff" }); label(name, 960, 1056, "\"SEA BEAR\"", 62, { fill: "#ffe089" });
  const tag = label(root, 960, 120, "MARINE MAMMAL", 118); tag.setAttribute("opacity", 0);
  return (t) => { ry(t); camera(cam, 960, 540, 1); items.forEach((i) => i.g.setAttribute("opacity", smooth(i.at, i.at + 0.3, t))); fadeIn(tag, t, 2.8); fadeIn(bg, t, 0.1); b.set({ x: 960, y: 830, s: 1.05, walk: 0, blink: blinkAt(t), headPitch: Math.sin(t) * 2 }); fadeIn(name, t, 9.9); };
};

SCENES.iceHome = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 500, snow: 34, sun: { x: 1500, y: 480, r: 600 } });
  const sh = shadow(fg, 0, 0, 1, 1), b = new Bear(fg);
  const ws = (p.words || ["ITS HUNTING GROUND", "ITS HIGHWAY", "ITS HOME"]).map((w) => { const l = label(root, 960, 240, w, 130); l.setAttribute("opacity", 0); return l; });
  const at = p.at || [0, 1.5, 2.8];
  return (t) => {
    camera(cam, 960, 540, 1); snow.set(t);
    const x = lerp(300, 1320, t / dur); b.set({ x, y: 860, s: 1.5, phase: walkPh(t, 1.8), blink: blinkAt(t) });
    sh.setAttribute("cx", x); sh.setAttribute("cy", 864); sh.setAttribute("rx", 400); sh.setAttribute("ry", 34);
    ws.forEach((n, i) => { const a = at[i], e = i + 1 < ws.length ? at[i + 1] : dur + 1; n.setAttribute("opacity", smooth(a, a + 0.25, t) * (1 - smooth(e - 0.15, e, t))); });
  };
};

SCENES.kitchen = (root, p, dur) => {
  const { cam, fg, snow } = W(root, { horizon: 400, snow: 26 });
  tent(fg, 880, 640, 1.4); shadow(fg, 880, 645, 170, 16);
  const h = new Human(fg); h.set({ x: 620, y: 660, s: 1.1, walk: 0 }); shadow(fg, 620, 662, 50, 7);
  const bs = [0, 1, 2].map((i) => ({ b: new Bear(fg, { seed: 30 + i, ticks: 0.5 }), x: [1500, 240, 1460][i], y: [520, 560, 860][i], s: [0.4, 0.5, 0.72][i], flip: [true, false, true][i] }));
  const t1 = label(root, 960, 200, "THE MIDDLE OF ITS KITCHEN", 118); t1.setAttribute("opacity", 0);
  return (t) => { camera(cam, 960, 540, lerp(1.08, 1, t / dur)); snow.set(t); bs.forEach((o, i) => o.b.set({ x: o.x + t * (o.flip ? -22 : 22), y: o.y, s: o.s, flip: o.flip, phase: walkPh(t + i, 1.8) })); fadeIn(t1, t, p.t1 === undefined ? 3.6 : p.t1); };
};
