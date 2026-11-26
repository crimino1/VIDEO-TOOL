// People, animals and props, in the same ink-and-gradient style as the bear.
function ink(parent, d, fill, w = 3, extra = {}) { return el("path", Object.assign({ d, fill, stroke: INK, "stroke-width": w, "stroke-linejoin": "round", "stroke-linecap": "round" }, extra), parent); }

// A person drawn in the same ink-and-paint style as the bear: side view, about 212 tall at scale 1, feet on y=0.
// Cut-out parts share one outline, so overlapping limbs merge the way the bear's do.
const SHADE = { "url(#parka)": "#97321a", "url(#houseA)": "#54707f", "url(#houseB)": "#8a5f3e" };
function darken(c) {
  if (SHADE[c]) return SHADE[c];
  if (c[0] !== "#") return "#55606a";
  let h = c.slice(1); if (h.length === 3) h = h.split("").map((x) => x + x).join("");
  const v = [0, 2, 4].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * 0.66).toString(16).padStart(2, "0"));
  return "#" + v.join("");
}
const HUMAN = {
  thigh: "M-15 -8 C-18 14 -16 38 -11 58 L11 58 C16 38 18 14 14 -8 Z",
  shin: "M-11 -5 C-13 14 -11 34 -8 52 L8 52 C11 34 13 14 11 -5 Z",
  boot: "M-10 -8 L10 -8 C10 -2 12 2 19 4 C28 7 33 9 33 13 L33 17 C20 18 -2 18 -12 17 L-12 6 Z",
  torso: "M-22 18 C-26 -8 -26 -42 -21 -60 C-17 -74 14 -77 21 -64 C27 -48 28 -10 25 18 C10 22 -8 22 -22 18 Z",
  armU: "M-10 -8 C-12 10 -11 26 -8 40 L8 40 C11 26 12 10 10 -8 Z",
  armL: "M-8 -4 C-10 10 -9 24 -6 34 L7 34 C9 24 10 10 8 -4 Z",
  mitt: "M-7 -2 C-10 6 -9 15 -4 19 C2 22 8 18 9 10 C9 5 8 2 7 -2 Z",
  hood: "M-16 6 C-28 -6 -28 -34 -10 -44 C6 -52 22 -44 26 -30 C28 -20 25 -6 18 4 C8 10 -8 10 -16 6 Z",
};
const L_H = { th: 56, sh: 50, u: 38, l: 32 };

class Human {
  constructor(parent, o = {}) {
    this.g = el("g", {}, parent);
    this.o = o;
    const coat = o.coat || "url(#parka)", pants = o.pants || "#2a3640", boots = o.boots || "#191d22", far = darken(coat), farP = darken(pants);
    this.parts = {};
    this.farInk = el("g", {}, this.g); this.farFill = el("g", {}, this.g); this.inkG = el("g", {}, this.g); this.fillG = el("g", {}, this.g);
    const P = (name, d, fill, isFar) => {
      const a = el("g", {}, isFar ? this.farInk : this.inkG), b = el("g", {}, isFar ? this.farFill : this.fillG);
      el("path", { d, fill: INK, stroke: INK, "stroke-width": 4.4, "stroke-linejoin": "round" }, a);
      el("path", { d, fill }, b);
      this.parts[name] = [a, b];
      return b;
    };
    P("fTh", HUMAN.thigh, farP, true); P("fSh", HUMAN.shin, farP, true); P("fBt", HUMAN.boot, "#101317", true);
    P("fAU", HUMAN.armU, far, true); P("fAL", HUMAN.armL, far, true); P("fMt", HUMAN.mitt, "#1b2329", true);
    const nTh = P("nTh", HUMAN.thigh, pants), nSh = P("nSh", HUMAN.shin, pants), nBt = P("nBt", HUMAN.boot, boots);
    const tors = P("torso", HUMAN.torso, coat);
    // trouser and boot detail
    el("path", { d: "M-6 6 C-8 22 -6 36 -3 48 M6 12 C7 24 6 36 5 46", stroke: "#10161b", "stroke-width": 1.5, fill: "none", opacity: 0.55 }, nTh);
    el("path", { d: "M-7 6 Q2 12 9 6 M-7 16 Q1 21 8 16", stroke: "#10161b", "stroke-width": 1.5, fill: "none", opacity: 0.5 }, nSh);
    el("path", { d: "M-12 13 C0 15 20 15 33 13", stroke: "#4d5660", "stroke-width": 3, fill: "none" }, nBt);
    el("path", { d: "M2 -3 l8 3 M4 -6 l8 3 M0 0 l8 3", stroke: "#8f8a7c", "stroke-width": 1.4 }, nBt);
    el("path", { d: "M-10 -8 L10 -8", stroke: "#e6e0cf", "stroke-width": 4, "stroke-linecap": "round" }, nBt);
    // parka detail: shaded back, zip, hem, pocket and cloth folds
    el("path", { d: "M-22 18 C-26 -8 -26 -42 -21 -60 C-17 -70 -8 -73 -2 -72 C-12 -40 -12 -10 -8 20 C-14 20 -18 19 -22 18 Z", fill: "#000", opacity: 0.16 }, tors);
    if (!o.bare) {
      el("path", { d: "M18 -66 C24 -44 25 -12 22 18", stroke: "#000", "stroke-width": 1.6, fill: "none", opacity: 0.4 }, tors);
      el("path", { d: "M-23 6 C-8 10 10 10 25 6 M-23 16 C-8 20 10 20 25 16", stroke: "#000", "stroke-width": 1.6, fill: "none", opacity: 0.35 }, tors);
      el("path", { d: "M-24 -22 C-8 -18 10 -18 26 -22", stroke: "#000", "stroke-width": 2, fill: "none", opacity: 0.3 }, tors);
      el("path", { d: "M-23 -37 C-8 -33 10 -33 26 -37", stroke: "#f2efe4", "stroke-width": 3.4, fill: "none", opacity: 0.75 }, tors);
      el("path", { d: "M2 -10 h15 v12 h-15 Z", fill: "none", stroke: "#000", "stroke-width": 1.5, opacity: 0.4 }, tors);
      el("path", { d: "M-6 -52 q6 8 3 16 M6 -6 q4 8 2 18", stroke: "#000", "stroke-width": 1.3, fill: "none", opacity: 0.28 }, tors);
    }
    this.headG = el("g", {}, this.g);
    if (o.bare) {
      ink(this.headG, "M-13 2 C-22 -8 -20 -32 -4 -36 C10 -40 22 -32 22 -20 L27 -13 L22 -10 C23 -4 20 2 14 2 C8 2 -6 8 -13 2 Z", "#dcae8b", 2.6);
      ink(this.headG, "M-14 -4 C-24 -14 -20 -36 -2 -39 C10 -41 20 -36 22 -27 C14 -28 8 -26 4 -20 C2 -14 -4 -8 -14 -4 Z", "#2d2622", 2);
      el("circle", { cx: 14, cy: -20, r: 2, fill: INK }, this.headG);
    } else {
      const hoodFill = o.hood || coat;
      el("path", { d: HUMAN.hood, fill: INK, stroke: INK, "stroke-width": 4.4, "stroke-linejoin": "round" }, this.headG);
      el("path", { d: HUMAN.hood, fill: hoodFill }, this.headG);
      el("path", { d: "M-16 6 C-28 -6 -28 -34 -10 -44 C-16 -30 -14 -8 -6 8 Z", fill: "#000", opacity: 0.18 }, this.headG);
      // face in profile, set back inside the hood
      ink(this.headG, "M6 -33 C13 -35 20 -32 21 -25 L26 -18 L21.5 -16 C23 -12 22 -7 18 -5 C12 -2 5 -5 3 -13 C2 -21 2 -28 6 -33 Z", "#e2b897", 2);
      el("path", { d: "M3 -13 C5 -6 12 -3 18 -5 C20 -6 21 -8 21.5 -10 C14 -8 8 -10 3 -13 Z", fill: "#000", opacity: 0.1 }, this.headG);
      this.eyeH = el("circle", { cx: 14.5, cy: -24, r: 1.9, fill: INK }, this.headG);
      el("path", { d: "M10.5 -28 Q15 -30 19 -27", stroke: "#3a2a20", "stroke-width": 2, fill: "none", "stroke-linecap": "round" }, this.headG);
      el("path", { d: "M18 -13 L13 -12", stroke: "#8f5a48", "stroke-width": 1.6, "stroke-linecap": "round" }, this.headG);
      // fur ruff around the face opening
      const ruff = "M2 -40 C-5 -30 -6 -14 1 -2 C4 2 9 5 14 5 L18 -1 C10 0 6 -5 4 -13 C2 -21 3 -30 9 -36 Z";
      const fr = furry(ruff, 5, 2.6, 6);
      el("path", { d: fr, fill: INK, stroke: INK, "stroke-width": 2.6, "stroke-linejoin": "round" }, this.headG);
      el("path", { d: fr, fill: "#efe7d4" }, this.headG);
      el("path", { d: "M-1 -30 l4 4 M-3 -20 l5 2 M-2 -10 l5 0 M3 -2 l3 -3", stroke: "#a39b84", "stroke-width": 1.4, "stroke-linecap": "round" }, this.headG);
    }
    this.nearArm = el("g", {}, this.g);
    const arm = (d, fill) => { const g = el("g", {}, this.nearArm); el("path", { d, fill, stroke: INK, "stroke-width": 2.2, "stroke-linejoin": "round" }, g); return g; };
    this.aU = arm(HUMAN.armU, coat); this.aL = arm(HUMAN.armL, coat); this.mt = arm(HUMAN.mitt, "#22303a");
    el("path", { d: "M-9 2 Q0 7 9 2", stroke: "#000", "stroke-width": 1.4, fill: "none", opacity: 0.35 }, this.aL);
    el("path", { d: "M-8 28 Q0 33 7 28", stroke: "#f2efe4", "stroke-width": 2.6, fill: "none", opacity: 0.7 }, this.aL);
    el("path", { d: "M6 6 C12 6 13 12 8 14", fill: "#22303a", stroke: INK, "stroke-width": 1.8 }, this.mt);
  }
  _place(name, x, y, r) { this.parts[name].forEach((g) => g.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(r)})`)); }
  _leg(names, hip, foot) {
    const k = twoBone(hip.x, hip.y, foot.x, foot.y, L_H.th, L_H.sh, -1); // knee bends forward
    this._place(names[0], hip.x, hip.y, angFromDown(hip.x, hip.y, k.kx, k.ky));
    this._place(names[1], k.kx, k.ky, angFromDown(k.kx, k.ky, k.fx, k.fy));
    this._place(names[2], k.fx, k.fy, foot.p || 0);
  }
  // deg follows the old meaning: 0 hangs down, positive swings back
  _armTarget(sx, sy, degr) { const a = rad(degr), L = (L_H.u + L_H.l) * 0.97; return { x: sx - Math.sin(a) * L, y: sy + Math.cos(a) * L }; }
  set(q) {
    const s = q.s || 1, ph = q.phase || 0, w = q.walk === undefined ? 1 : q.walk;
    this.g.setAttribute("transform", `translate(${f1(q.x)} ${f1(q.y)}) scale(${(q.flip ? -s * 0.9 : s * 0.9).toFixed(3)} ${(s * 0.9).toFixed(3)})`);
    if (q.opacity !== undefined) this.g.setAttribute("opacity", q.opacity);
    const stride = (q.stride || 26) * 1.5 * w, lean = (q.lean || 0) + 2 * w;
    const u0 = ((ph % 1) + 1) % 1;
    const bob = (Math.abs(Math.sin(u0 * 2 * Math.PI)) - 0.5) * 3.4 * w;
    const hip = { x: 0, y: -116 + bob - 2.5 * (1 - w) };
    const foot = (p, restX) => {
      const u = ((p % 1) + 1) % 1, stance = 0.6;
      if (w < 0.02) return { x: restX * 1.5, y: -14, p: 0 };
      if (u < stance) { const v = u / stance; const heel = smooth(0.72, 1, v); return { x: restX * (1 - w) + stride * (1 - 2 * v), y: -14 - heel * 8, p: heel * 26 - smooth(0, 0.14, 0.14 - v) * 14 }; }
      const v = (u - stance) / (1 - stance);
      return { x: restX * (1 - w) + stride * (2 * v - 1), y: -14 - Math.sin(Math.PI * v) * 15 * Math.min(1, w + 0.2), p: 18 * Math.sin(Math.PI * v) - 14 * v * v };
    };
    this._leg(["fTh", "fSh", "fBt"], { x: hip.x - 2, y: hip.y }, foot(ph + 0.5, -9));
    this._leg(["nTh", "nSh", "nBt"], { x: hip.x + 2, y: hip.y }, foot(ph, 7));
    const lr = rad(lean);
    this._place("torso", hip.x, hip.y, lean);
    const up = (d) => ({ x: hip.x + Math.sin(lr) * d, y: hip.y - Math.cos(lr) * d });
    const sh = up(62), neck = up(76);
    this.headG.setAttribute("transform", `translate(${f1(neck.x + 1)} ${f1(neck.y)}) rotate(${f1((q.look || 0) + lean * 0.3)}) scale(0.9)`);
    const swing = q.arm === undefined ? Math.sin(ph * 2 * Math.PI) * 26 * w : q.arm;
    const fDeg = (q.armF === undefined ? swing : q.armF) + (w < 0.02 && q.armF === undefined ? -4 : 0);
    const nDeg = -swing + (w < 0.02 && q.arm === undefined ? 5 : 0);
    const fH = this._armTarget(sh.x + 4, sh.y, fDeg);
    const fE = twoBone(sh.x + 4, sh.y, fH.x, fH.y, L_H.u, L_H.l, 1);
    this._place("fAU", sh.x + 4, sh.y, angFromDown(sh.x + 4, sh.y, fE.kx, fE.ky));
    this._place("fAL", fE.kx, fE.ky, angFromDown(fE.kx, fE.ky, fE.fx, fE.fy));
    this._place("fMt", fE.fx, fE.fy, angFromDown(fE.kx, fE.ky, fE.fx, fE.fy));
    const nH = this._armTarget(sh.x - 3, sh.y, nDeg);
    const nE = twoBone(sh.x - 3, sh.y, nH.x, nH.y, L_H.u, L_H.l, 1);
    const tr = (g, x, y, r) => g.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(r)})`);
    tr(this.aU, sh.x - 3, sh.y, angFromDown(sh.x - 3, sh.y, nE.kx, nE.ky));
    tr(this.aL, nE.kx, nE.ky, angFromDown(nE.kx, nE.ky, nE.fx, nE.fy));
    tr(this.mt, nE.fx, nE.fy, angFromDown(nE.kx, nE.ky, nE.fx, nE.fy));
  }
}

// Ringed seal, side view, about 300 long at scale 1, facing right. Origin at its belly centre.
class Seal {
  constructor(parent, seed = 4) {
    this.g = el("g", {}, parent);
    const d = "M-150 8 C-132 -30 -72 -68 -4 -70 C60 -72 108 -60 128 -44 C150 -40 170 -22 168 2 C164 20 136 30 98 36 C40 50 -52 50 -106 32 C-126 26 -142 18 -150 8 Z";
    this.flipT = ink(this.g, "M-142 6 C-164 -2 -186 -6 -206 -4 C-200 2 -194 6 -190 12 C-196 16 -202 22 -206 28 C-186 30 -162 26 -140 18 Z", "#565d60", 2.6);
    ink(this.g, d, "url(#seal)", 3);
    const r = rng(seed); let s = "";
    for (let i = 0; i < 46; i++) {
      const x = -120 + r() * 230, y = -44 + r() * 44, rr = 3 + r() * 5;
      s += `M${f1(x - rr)} ${f1(y)}a${f1(rr)} ${f1(rr * 0.7)} 0 1 1 ${f1(rr * 2)} 0a${f1(rr)} ${f1(rr * 0.7)} 0 1 1 ${f1(-rr * 2)} 0`;
    }
    el("path", { d: s, fill: "none", stroke: "#3f4547", "stroke-width": 2, opacity: 0.65 }, this.g);
    this.flip = ink(this.g, "M0 0 C8 -6 14 -6 20 -2 C28 12 28 28 16 40 C2 34 -4 16 0 0 Z", "#6a7072", 2.6);
    el("ellipse", { cx: 122, cy: -28, rx: 9, ry: 8, fill: "#07090b" }, this.g);
    el("circle", { cx: 125, cy: -31, r: 2.4, fill: "#fff" }, this.g);
    el("ellipse", { cx: 164, cy: -8, rx: 7, ry: 5.5, fill: "#0b0d10" }, this.g);
    el("path", { d: "M158 4 C146 14 130 16 118 13 M150 0 l26 -9 M150 3 l28 1 M148 6 l25 10", stroke: INK, "stroke-width": 1.6, fill: "none", "stroke-linecap": "round" }, this.g);
  }
  set(q) {
    const s = q.s || 1;
    this.g.setAttribute("transform", `translate(${f1(q.x)} ${f1(q.y)}) rotate(${f1(q.rot || 0)}) scale(${(q.flipX ? -s : s).toFixed(3)} ${s.toFixed(3)})`);
    const w = q.t === undefined ? 0 : Math.sin(q.t * 5) * 14;
    this.flipT.setAttribute("transform", `rotate(${f1(w)} -140 4)`);
    this.flip.setAttribute("transform", `rotate(${f1(w * 0.5)} 10 0)`);
  }
}

class Fox {
  constructor(parent) {
    this.g = el("g", {}, parent);
    ink(this.g, "M-46 -38 C-82 -46 -96 -22 -86 -6 C-74 -10 -62 -20 -46 -26 Z", "#f5f2e8", 2.4);
    ink(this.g, "M-48 -22 L-44 0 L-36 0 L-34 -18 Z M22 -18 L24 0 L32 0 L34 -22 Z", "#dfe3e0", 2.2);
    ink(this.g, "M-50 -26 C-52 -44 -24 -50 8 -48 C24 -48 34 -44 40 -36 L36 -14 C10 -8 -32 -8 -50 -26 Z", "#f7f4ea", 2.6);
    ink(this.g, "M30 -46 L34 -66 L44 -54 L52 -66 L54 -50 L74 -38 L52 -28 C42 -26 32 -32 30 -46 Z", "#faf7ee", 2.6);
    el("circle", { cx: 50, cy: -44, r: 2, fill: INK }, this.g); el("circle", { cx: 74, cy: -38, r: 2.6, fill: INK }, this.g);
  }
  set(q) { this.g.setAttribute("transform", `translate(${f1(q.x)} ${f1(q.y)}) scale(${q.flip ? -(q.s || 1) : q.s || 1} ${q.s || 1})`); }
}

function gull(parent, x, y, t, s = 1, ph = 0) {
  const a = Math.sin(t * 7 + ph) * 16;
  return el("path", { d: `M${x - 26 * s} ${y - a * s * 0.7} Q${x - 12 * s} ${y - 8 * s} ${x} ${y} Q${x + 12 * s} ${y - 8 * s} ${x + 26 * s} ${y - a * s * 0.7}`, fill: "none", stroke: INK, "stroke-width": 3 * s, "stroke-linecap": "round" }, parent);
}

function tent(parent, x, y, s = 1, color = "#d9772c") {
  const g = el("g", { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  ink(g, "M-72 0 L-6 -80 L74 0 Z", color, 3);
  ink(g, "M-72 0 L-6 -80 L-22 0 Z", "#a95518", 3);
  ink(g, "M-40 0 L-20 -44 L-6 0 Z", "#2a2017", 2.4);
  el("line", { x1: -6, y1: -80, x2: 96, y2: 0, stroke: INK, "stroke-width": 1.5 }, g);
  return g;
}

function house(parent, x, y, w, h, fill = "url(#houseA)", s = 1) {
  const g = el("g", { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  ink(g, `M0 0 L0 ${-h} L${w} ${-h} L${w} 0 Z`, fill, 3);
  ink(g, `M-10 ${-h} L${w / 2} ${-h - w * 0.42} L${w + 10} ${-h} Z`, "#39424a", 3);
  el("path", { d: `M-2 ${-h - 2} L${w / 2} ${-h - w * 0.42 - 3} L${w + 2} ${-h - 2}`, stroke: "#f4f8f8", "stroke-width": 7, fill: "none", "stroke-linecap": "round" }, g);
  const win = (wx, wy) => { ink(g, `M${wx} ${wy} h26 v26 h-26 Z`, "#e7d88f", 2.2); el("path", { d: `M${wx + 13} ${wy} v26 M${wx} ${wy + 13} h26`, stroke: INK, "stroke-width": 1.5 }, g); };
  win(w * 0.18, -h * 0.72); if (w > 110) win(w * 0.62, -h * 0.72);
  ink(g, `M${w * 0.42} 0 v${-h * 0.4} h${w * 0.2} v${h * 0.4} Z`, "#2c343b", 2.2);
  el("rect", { x: -14, y: -8, width: w + 28, height: 14, rx: 7, fill: "#f4f8f8" }, g);
  return g;
}

function truck(parent, s = 1, color = "#2e6f4e", text = "") {
  const g = el("g", {}, parent);
  ink(g, "M-120 -22 L-120 -74 L14 -74 L14 -22 Z", color, 3);
  ink(g, "M14 -22 L14 -74 L62 -74 L90 -44 L104 -40 L104 -22 Z", color, 3);
  ink(g, "M24 -66 L56 -66 L76 -44 L24 -44 Z", "#bcd9e3", 2.4);
  for (const x of [-70, 62]) { ink(g, `M${x - 22} -14 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0`, "#14181d", 2); el("circle", { cx: x, cy: -14, r: 9, fill: "#8b949b" }, g); }
  ink(g, "M-40 -82 h44 v8 h-44 Z", "#e8261c", 2);
  if (text) { const t = el("text", { x: -52, y: -40, "font-family": "League Gothic", "font-size": 22, fill: "#fff", "text-anchor": "middle" }, g); t.textContent = text; }
  return g;
}

function car(parent) {
  const g = el("g", {}, parent);
  ink(g, "M-120 -24 C-120 -44 -96 -48 -74 -52 L-44 -84 L52 -84 L88 -52 C108 -50 124 -44 124 -26 L124 -14 L-120 -14 Z", "#3d5a73", 3);
  ink(g, "M-36 -78 L0 -78 L0 -52 L-60 -52 Z M8 -78 L46 -78 L72 -52 L8 -52 Z", "#bcd9e3", 2.4);
  for (const x of [-72, 76]) { ink(g, `M${x - 22} -12 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0`, "#14181d", 2); el("circle", { cx: x, cy: -12, r: 9, fill: "#8b949b" }, g); }
  return g;
}

function helicopter(parent, s = 1) {
  const g = el("g", { transform: `scale(${s})` }, parent);
  ink(g, "M40 -10 C96 -10 180 -6 216 -6 L250 -40 L262 -40 L256 6 L216 12 C170 14 100 22 50 26 Z", "#2c6a86", 3);
  ink(g, "M-96 8 C-96 -30 -56 -46 -8 -46 C34 -46 66 -24 66 8 C66 30 30 42 -16 42 C-64 42 -96 32 -96 8 Z", "#f0f3f1", 3);
  ink(g, "M-82 -4 C-74 -30 -46 -38 -20 -38 L-20 -2 Z", "#2a3b47", 2.4);
  el("path", { d: "M-68 -12 C-62 -24 -48 -30 -36 -30", stroke: "#8ba4b1", "stroke-width": 4, fill: "none", "stroke-linecap": "round" }, g);
  ink(g, "M-70 62 L60 62 M-46 42 L-54 62 M26 42 L34 62", "none", 4);
  ink(g, "M-8 -46 L-8 -66", "none", 4);
  const tail = ink(g, "M256 -46 L256 16", "none", 3, { opacity: 0.5 });
  const rotor = el("ellipse", { cx: -8, cy: -68, rx: 140, ry: 5, fill: "#3a4750", opacity: 0.55 }, g);
  return { g, rotor };
}

function clockDial(parent, x, y, r, frac) {
  const g = el("g", {}, parent);
  ink(g, `M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`, "#f4f8f8", 4);
  const a = frac * 2 * Math.PI, a2 = frac * 2 * Math.PI * 12;
  el("line", { x1: x, y1: y, x2: x + Math.sin(a) * r * 0.5, y2: y - Math.cos(a) * r * 0.5, stroke: INK, "stroke-width": 6, "stroke-linecap": "round" }, g);
  el("line", { x1: x, y1: y, x2: x + Math.sin(a2) * r * 0.8, y2: y - Math.cos(a2) * r * 0.8, stroke: "#e8261c", "stroke-width": 4, "stroke-linecap": "round" }, g);
  el("circle", { cx: x, cy: y, r: 6, fill: INK }, g);
  return g;
}
