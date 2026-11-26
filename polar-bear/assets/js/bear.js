// The side-view polar bear: a cut-out puppet with an ink outline that merges across overlapping parts.
// Local space: feet on y=0, facing +x, about 430 wide and 270 tall.
function twoBone(hx, hy, fx, fy, l1, l2, bend) {
  const dx = fx - hx, dy = fy - hy, d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.5) || 1;
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(l1 * l1 - a * a, 0));
  const ux = dx / (Math.hypot(dx, dy) || 1), uy = dy / (Math.hypot(dx, dy) || 1);
  return { kx: hx + ux * a - uy * h * bend, ky: hy + uy * a + ux * h * bend, fx: hx + ux * d, fy: hy + uy * d };
}
const angFromDown = (x0, y0, x1, y1) => deg(Math.atan2(-(x1 - x0), y1 - y0));

const BEAR = {
  torso: "M-196 -128 C-226 -196 -178 -278 -92 -280 C-34 -282 14 -256 66 -260 C112 -263 150 -250 176 -224 L196 -182 C176 -140 128 -122 62 -118 C-16 -112 -104 -106 -152 -112 C-176 -116 -190 -120 -196 -128 Z",
  tail: "M-192 -196 C-214 -200 -222 -182 -212 -170 C-204 -164 -194 -170 -190 -176 Z",
  neck: "M70 -262 C118 -268 170 -248 208 -216 L222 -160 C196 -134 150 -122 92 -118 Z",
  head: "M-52 -34 C-34 -58 8 -62 44 -48 C70 -38 96 -24 124 -16 C138 -12 144 -2 138 6 L126 12 C104 16 84 18 62 20 C34 30 -18 40 -56 30 Z",
  jaw: "M-8 8 L114 8 C118 14 116 20 106 23 C80 30 44 36 10 34 Z",
  frontUpper: "M-38 -36 C-44 20 -36 66 -26 94 L26 94 C38 62 44 18 36 -36 Z",
  frontLower: "M-26 -10 C-27 28 -25 58 -21 86 L23 86 C25 56 27 26 26 -10 Z",
  frontPaw: "M-23 -14 C-30 0 -30 12 -20 20 C-6 24 28 24 42 22 C54 20 55 9 45 2 C34 -5 25 -9 23 -14 Z",
  rearUpper: "M-60 -50 C-68 8 -50 60 -29 88 L29 88 C48 58 60 8 56 -50 Z",
  rearLower: "M-29 -12 C-29 20 -25 48 -21 74 L23 74 C25 48 27 20 27 -12 Z",
  rearPaw: "M-25 -14 C-32 0 -32 12 -22 20 C-6 24 36 24 50 22 C62 20 63 9 53 2 C41 -5 29 -9 26 -14 Z",
};
const L = { fu: 92, fl: 84, ru: 84, rl: 72 };

class Bear {
  constructor(parent, opts = {}) {
    this.o = Object.assign({ seed: 7, thin: 0, fat: 0, ticks: 1, blink: 0, dark: 0 }, opts);
    this.g = el("g", {}, parent);
    this.parts = {};
    const seed = this.o.seed;
    this.farInk = el("g", {}, this.g);
    this.farFill = el("g", {}, this.g);
    this.inkG = el("g", {}, this.g);
    this.fillG = el("g", {}, this.g);
    this.topG = el("g", {}, this.g);
    const P = (name, d, fill, furSeed, amp = 2.2, step = 16, layer = "near") => {
      const shape = furSeed ? furry(d, seed + furSeed, amp, step) : d;
      if (layer === "far") {
        const a = el("g", {}, this.farInk), b = el("g", {}, this.farFill);
        el("path", { d: shape, fill: INK, stroke: INK, "stroke-width": 6.6, "stroke-linejoin": "round" }, a);
        el("path", { d: shape, fill }, b);
        this.parts[name] = [a, b];
      } else {
        const a = el("g", {}, this.inkG), b = el("g", {}, this.fillG);
        el("path", { d: shape, fill: INK, stroke: INK, "stroke-width": 6.6, "stroke-linejoin": "round" }, a);
        el("path", { d: shape, fill }, b);
        this.parts[name] = [a, b];
      }
    };
    // far legs, in cool shade
    P("fFarU", BEAR.frontUpper, "url(#furFar)", 0, 0, 0, "far"); P("fFarL", BEAR.frontLower, "url(#furFar)", 0, 0, 0, "far"); P("fFarP", BEAR.frontPaw, "url(#furFar)", 0, 0, 0, "far");
    P("rFarU", BEAR.rearUpper, "url(#furFar)", 0, 0, 0, "far"); P("rFarL", BEAR.rearLower, "url(#furFar)", 0, 0, 0, "far"); P("rFarP", BEAR.rearPaw, "url(#furFar)", 0, 0, 0, "far");
    // near parts, back to front
    P("rearU", BEAR.rearUpper, "url(#furLeg)", 11); P("rearL", BEAR.rearLower, "url(#furLeg)", 12); P("rearP", BEAR.rearPaw, "url(#furLeg)", 0);
    P("tail", BEAR.tail, "url(#furLeg)", 18);
    P("torso", BEAR.torso, "url(#fur)", 13, 2.6, 17);
    P("neck", BEAR.neck, "url(#fur)", 14, 2.2, 17);
    P("frontU", BEAR.frontUpper, "url(#furLeg)", 15); P("frontL", BEAR.frontLower, "url(#furLeg)", 16); P("frontP", BEAR.frontPaw, "url(#furLeg)", 0);
    P("jaw", BEAR.jaw, "url(#furHead)", 0);
    P("head", BEAR.head, "url(#furHead)", 17, 1.4, 16);
    this._details();
    this.set({ x: 0, y: 0, s: 1, phase: 0 });
  }

  _ticks(g, d, n, seed, angle, color = "#8f8a7c") {
    const p = pathOf(d), r = rng(seed), bb = p.getBBox();
    let drawn = 0, tries = 0, s = "";
    while (drawn < n && tries++ < n * 30) {
      const x = bb.x + r() * bb.width, y = bb.y + r() * bb.height;
      if (!p.isPointInFill(new DOMPoint(x, y))) continue;
      const a = rad(angle + (r() - 0.5) * 28), len = 9 + r() * 15;
      const cx = x + Math.cos(a) * len * 0.5 + (r() - 0.5) * 3, cy = y + Math.sin(a) * len * 0.5 + 2;
      s += `M${f1(x)} ${f1(y)}Q${f1(cx)} ${f1(cy)} ${f1(x + Math.cos(a) * len)} ${f1(y + Math.sin(a) * len)}`;
      drawn++;
    }
    el("path", { d: s, fill: "none", stroke: color, "stroke-width": 1.5, "stroke-linecap": "round", opacity: 0.62 }, g);
  }

  _details() {
    const seed = this.o.seed, T = this.o.ticks;
    const fillLayer = (name) => this.parts[name][1];
    // torso: warm back, cool belly, fur strokes
    const t = fillLayer("torso");
    el("ellipse", { cx: -80, cy: -214, rx: 120, ry: 58, fill: "url(#warmPatch)" }, t);
    el("ellipse", { cx: -20, cy: -126, rx: 175, ry: 26, fill: "url(#coolPatch)" }, t);
    this._ticks(t, BEAR.torso, 62 * T, seed + 21, 168);
    this._ticks(t, BEAR.torso, 10 * T, seed + 22, 150, "#6f6c61");
        el("path", { d: "M-150 -116 l-4 10 M-118 -112 l-3 11 M-86 -110 l-2 11 M-52 -111 l-1 12 M-18 -113 l0 11 M16 -116 l1 11 M44 -118 l2 10", stroke: INK, "stroke-width": 2.2, "stroke-linecap": "round", fill: "none", opacity: 0.8 }, t);
    this.ribs = el("path", { d: "M-40 -222 C-46 -190 -46 -160 -40 -134 M-5 -226 C-12 -192 -12 -160 -6 -132 M28 -228 C22 -194 22 -162 28 -130 M-74 -226 C-78 -194 -78 -160 -72 -136", stroke: "#7a7a72", "stroke-width": 3, fill: "none", opacity: 0 }, t);
    const n = fillLayer("neck");
    this._ticks(n, BEAR.neck, 24 * T, seed + 23, 165);
        // legs
    for (const [name, d, c] of [["frontU", BEAR.frontUpper, 16], ["frontL", BEAR.frontLower, 8], ["rearU", BEAR.rearUpper, 22], ["rearL", BEAR.rearLower, 8]]) this._ticks(fillLayer(name), d, c * T, seed + 30 + c, 95);
    el("path", { d: "M-30 -30 C-36 10 -30 46 -24 80", stroke: "#8f8a7c", "stroke-width": 2.5, fill: "none", opacity: 0.45 }, fillLayer("frontU"));
    // paws: toes and claws
    const toes = (name, x0) => {
      const g = fillLayer(name);
      el("path", { d: `M${x0} 13 Q${x0 + 1} 18 ${x0} 22 M${x0 + 13} 11 Q${x0 + 15} 17 ${x0 + 14} 22 M${x0 + 26} 10 Q${x0 + 29} 16 ${x0 + 28} 22`, stroke: INK, "stroke-width": 2, fill: "none", "stroke-linecap": "round" }, g);
      el("path", { d: `M${x0 + 8} 22 l5 3 M${x0 + 22} 22 l5 3 M${x0 + 36} 21 l6 3`, stroke: INK, "stroke-width": 2.8, "stroke-linecap": "round" }, g);
    };
    toes("frontP", 6); toes("rearP", 12);
    // head
    const h = fillLayer("head");
    this._ticks(h, BEAR.head, 16 * T, seed + 41, 175);
    el("ellipse", { cx: 0, cy: 28, rx: 50, ry: 8, fill: "url(#coolPatch)" }, h);
    // the ear goes behind the crown line, so it is drawn on the head layer with its own ink
    const ear = el("g", {}, this.parts["head"][1]);
    el("path", { d: "M-16 -46 C-22 -66 -2 -80 14 -70 C28 -62 26 -46 18 -38", fill: "#efe9d8", stroke: INK, "stroke-width": 4.5, "stroke-linejoin": "round" }, ear);
    el("path", { d: "M-8 -48 C-10 -60 0 -68 9 -63 C16 -58 16 -48 11 -43", fill: "#8d9aa3" }, ear);
    this.eyeOpen = el("g", {}, h);
    el("ellipse", { cx: 60, cy: -16, rx: 6, ry: 5.4, fill: "#0c0f12" }, this.eyeOpen);
    el("circle", { cx: 62, cy: -18, r: 1.7, fill: "#fff" }, this.eyeOpen);
    el("path", { d: "M50 -22 Q60 -28 72 -19", stroke: INK, "stroke-width": 2.2, fill: "none", "stroke-linecap": "round", opacity: 0.8 }, h);
    this.eyeShut = el("path", { d: "M52 -16 Q60 -12 69 -16", stroke: INK, "stroke-width": 3, fill: "none", "stroke-linecap": "round", opacity: 0 }, h);
    el("path", { d: "M118 -18 C130 -22 144 -14 146 -3 C146 6 136 9 128 6 C120 3 114 -8 118 -18 Z", fill: "#0c0f12" }, h);
    el("ellipse", { cx: 130, cy: -12, rx: 6, ry: 2.4, fill: "#5d6871", transform: "rotate(14 130 -12)" }, h);
    el("path", { d: "M128 8 C116 13 96 14 74 14", stroke: INK, "stroke-width": 2.8, fill: "none", "stroke-linecap": "round" }, h);
    el("path", { d: "M82 4 l1 0 M92 2 l1 0 M100 5 l1 0", stroke: INK, "stroke-width": 2.6, "stroke-linecap": "round", opacity: 0.6 }, h);
    this.tongue = el("path", { d: "M60 14 C80 16 100 16 108 18 C106 28 80 30 58 26 Z", fill: "#a8434f", opacity: 0 }, fillLayer("jaw"));
  }

  _place(name, x, y, rot, sx = 1, sy = 1) {
    const tr = `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})` + (sx !== 1 || sy !== 1 ? ` scale(${sx} ${sy})` : "");
    this.parts[name].forEach((g) => g.setAttribute("transform", tr));
  }

  _leg(names, hip, foot, l1, l2, bend, pawPitch, thick) {
    const k = twoBone(hip.x, hip.y, foot.x, foot.y, l1, l2, bend);
    this._place(names[0], hip.x, hip.y, angFromDown(hip.x, hip.y, k.kx, k.ky), thick, 1);
    this._place(names[1], k.kx, k.ky, angFromDown(k.kx, k.ky, k.fx, k.fy), thick, 1);
    this._place(names[2], k.fx, k.fy, pawPitch);
    return k;
  }

  // q: {x,y,s,flip, phase (walk cycle 0..1), walk(0..1 amount), run, stride, torsoPitch, drop (lower the body), headPitch, headX, jaw, thin, blink, feet overrides}
  set(q) {
    const thin = q.thin === undefined ? this.o.thin : q.thin, fat = q.fat === undefined ? this.o.fat : q.fat;
    const sc = q.s === undefined ? 1 : q.s, flip = q.flip ? -1 : 1;
    this.g.setAttribute("transform", `translate(${f1(q.x || 0)} ${f1(q.y || 0)}) scale(${(sc * flip).toFixed(3)} ${sc.toFixed(3)})` + (q.rotate ? ` rotate(${q.rotate})` : ""));
    if (q.opacity !== undefined) this.g.setAttribute("opacity", q.opacity);
    const phase = q.phase || 0, walk = q.walk === undefined ? 1 : q.walk, stride = (q.stride || 118) * walk, lift = q.lift === undefined ? 26 : q.lift;
    const drop = q.drop || 0;
    const bob = walk * Math.sin(phase * 4 * Math.PI) * 3.2 + drop;
    const pitch = (q.torsoPitch || 0) + walk * Math.sin(phase * 2 * Math.PI) * 0.7;
    const pr = rad(pitch), cs = Math.cos(pr), sn = Math.sin(pr);
    const pivot = { x: q.pivotX || 0, y: q.pivotY || -170 };
    const T = (x, y) => ({ x: pivot.x + (x - pivot.x) * cs - (y - pivot.y) * sn, y: pivot.y + (x - pivot.x) * sn + (y - pivot.y) * cs + bob });
    const belly = 1 - thin * 0.16 + fat * 0.1, thick = 1 - thin * 0.14 + fat * 0.05;
    const to = T(0, 0);
    // torso squash for thin or fat, keeping the back line
    const tr = `translate(${f1(to.x)} ${f1(to.y)}) rotate(${f1(pitch)}) translate(0 -265) scale(1 ${belly.toFixed(3)}) translate(0 265)`;
    this.parts.torso.forEach((g) => g.setAttribute("transform", tr));
    this.ribs.setAttribute("opacity", thin * 0.7);
    this._place("neck", to.x, to.y, pitch, 1, belly < 1 ? 1 - thin * 0.08 : 1);

    const foot = (ph, baseX, over) => {
      if (over) return over;
      const stance = 0.66, u = ((ph % 1) + 1) % 1;
      if (u < stance) return { x: baseX + stride * (0.5 - u / stance), y: -22, p: 0 };
      const v = (u - stance) / (1 - stance);
      return { x: baseX + stride * (-0.5 + v), y: -22 - lift * walk * Math.sin(Math.PI * v), p: walk * (18 * Math.sin(Math.PI * v) - 10 * Math.sin(2 * Math.PI * v)) };
    };
    const f = q.feet || {};
    const hipN = T(-124, -166), shN = T(110, -192), hipF = T(-104, -170), shF = T(128, -196);
    this._place("tail", to.x, to.y, pitch);
    const rn = foot(phase, -118, f.rn), fn = foot(phase + 0.25, 118, f.fn), rf = foot(phase + 0.5, -96, f.rf), ff = foot(phase + 0.75, 138, f.ff);
    this._leg(["rFarU", "rFarL", "rFarP"], hipF, rf, L.ru, L.rl, 1, rf.p, thick);
    this._leg(["fFarU", "fFarL", "fFarP"], shF, ff, L.fu, L.fl, -1, ff.p, thick);
    this._leg(["rearU", "rearL", "rearP"], hipN, rn, L.ru, L.rl, 1, rn.p, thick);
    this._leg(["frontU", "frontL", "frontP"], shN, fn, L.fu, L.fl, -1, fn.p, thick);

    const np = T(178, -210);
    const nod = walk * Math.sin(phase * 4 * Math.PI + 1) * 2.6;
    const hp = (q.headPitch || 0) + pitch + nod;
    this._place("head", np.x, np.y + 6, hp);
    const jr = q.jaw || 0, ha = rad(hp);
    this._place("jaw", np.x + Math.cos(ha) * 0 - Math.sin(ha) * 6, np.y + 6 + Math.cos(ha) * 6, hp + jr);
    this.tongue.setAttribute("opacity", jr > 4 ? 1 : 0);
    const shut = q.blink ? 1 : 0;
    this.eyeOpen.setAttribute("opacity", 1 - shut); this.eyeShut.setAttribute("opacity", shut);
    this.headPos = { x: np.x, y: np.y };
  }
}
const blinkAt = (t, seed = 1) => { const c = (t + seed * 1.7) % 4.3; return c < 0.14; };

// Head-on bear walking at the viewer: the shot that makes the threat real.
class FrontBear {
  constructor(parent, seed = 3) {
    this.g = el("g", {}, parent);
    const legFar = "M-42 -210 C-48 -130 -44 -60 -40 -14 C-46 2 -36 12 -6 12 C22 12 38 4 36 -14 C40 -60 44 -130 40 -210 Z";
    const leg = "M-58 -240 C-62 -150 -54 -70 -46 -18 C-58 0 -48 16 -8 16 C30 16 50 2 42 -18 C50 -70 58 -150 56 -240 Z";
    const body = "M-214 -330 C-232 -430 -120 -486 0 -486 C120 -486 232 -430 214 -330 C204 -262 168 -214 118 -188 L-118 -188 C-168 -214 -204 -262 -214 -330 Z";
    const head = "M-82 -46 C-92 -92 -58 -126 0 -126 C58 -126 92 -92 82 -46 C76 -18 54 8 40 40 C32 62 16 72 0 72 C-16 72 -32 62 -40 40 C-54 8 -76 -18 -82 -46 Z";
    const ear = "M-74 -92 C-96 -106 -94 -140 -68 -138 C-48 -136 -42 -118 -46 -106 Z", earIn = "M-70 -106 C-80 -114 -78 -130 -66 -128 C-58 -126 -54 -116 -58 -110 Z";
    this.farG = el("g", {}, this.g); this.inkG = el("g", {}, this.g); this.fillG = el("g", {}, this.g);
    const far = () => { const g = el("g", {}, this.farG); el("path", { d: legFar, fill: "url(#furFar)", stroke: INK, "stroke-width": 3.4, "stroke-linejoin": "round" }, g); return g; };
    this.lF = far(); this.rF = far();
    const two = (d, fill, amp, sa) => {
      const shape = amp ? furry(d, seed + sa, amp, 17) : d;
      const a = el("g", {}, this.inkG), b = el("g", {}, this.fillG);
      el("path", { d: shape, fill: INK, stroke: INK, "stroke-width": 6.6, "stroke-linejoin": "round" }, a);
      el("path", { d: shape, fill }, b);
      return [a, b];
    };
    const tick = (g, d, n, s, ang) => Bear.prototype._ticks.call(this, g, d, n, s, ang);
    this.body = two(body, "url(#furLeg)", 2.8, 3);
    el("ellipse", { cx: 0, cy: -225, rx: 150, ry: 42, fill: "url(#coolPatch)" }, this.body[1]);
    el("ellipse", { cx: 0, cy: -410, rx: 165, ry: 58, fill: "url(#warmPatch)" }, this.body[1]);
    tick(this.body[1], body, 90, seed + 5, 90);
    this.lN = two(leg, "url(#furLeg)", 2.2, 6); this.rN = two(leg, "url(#furLeg)", 2.2, 7);
    [this.lN, this.rN].forEach((p, i) => {
      tick(p[1], leg, 20, seed + 8 + i, 90);
      el("path", { d: "M-36 4 q2 6 1 12 M-16 6 q1 6 1 10 M4 6 q0 6 0 10 M24 3 q-1 6 -2 12", stroke: INK, "stroke-width": 2.6, "stroke-linecap": "round", fill: "none" }, p[1]);
      el("path", { d: "M-28 15 l2 7 M-8 16 l1 7 M12 16 l-1 7 M31 12 l-3 7", stroke: INK, "stroke-width": 3, "stroke-linecap": "round" }, p[1]);
    });
    this.hd = el("g", {}, this.g);
    for (const f of [1, -1]) {
      const e = el("g", { transform: `scale(${f} 1)` }, this.hd);
      el("path", { d: ear, fill: "#efe9d8", stroke: INK, "stroke-width": 3.4 }, e);
      el("path", { d: earIn, fill: "#8d9aa3" }, e);
    }
    el("path", { d: furry(head, seed + 9, 1.6, 15), fill: INK, stroke: INK, "stroke-width": 6.6, "stroke-linejoin": "round" }, this.hd);
    const h = el("g", {}, this.hd);
    el("path", { d: furry(head, seed + 9, 1.6, 15), fill: "url(#furHead)" }, h);
    tick(h, head, 46, seed + 11, 90);
    el("ellipse", { cx: 0, cy: 34, rx: 36, ry: 34, fill: "#faf5e6" }, h);
    el("ellipse", { cx: -52, cy: -20, rx: 18, ry: 44, fill: "url(#coolPatch)", transform: "rotate(-22 -52 -20)", opacity: 0.6 }, h);
    el("ellipse", { cx: 52, cy: -20, rx: 18, ry: 44, fill: "url(#coolPatch)", transform: "rotate(22 52 -20)", opacity: 0.6 }, h);
    el("path", { d: "M-20 18 C-14 6 14 6 20 18 C22 30 10 40 0 40 C-10 40 -22 30 -20 18 Z", fill: "#0c0f12" }, h);
    el("ellipse", { cx: -5, cy: 15, rx: 7, ry: 2.6, fill: "#59646d" }, h);
    el("path", { d: "M0 40 L0 52 M-15 58 Q0 54 15 58", stroke: INK, "stroke-width": 2.6, fill: "none", "stroke-linecap": "round" }, h);
    for (const sx of [-1, 1]) {
      el("ellipse", { cx: sx * 27, cy: -34, rx: 12, ry: 7, fill: "url(#coolPatch)" }, h);
      el("ellipse", { cx: sx * 27, cy: -30, rx: 5.5, ry: 5, fill: "#0c0f12" }, h);
      el("circle", { cx: sx * 27 + 1.6, cy: -32, r: 1.5, fill: "#fff" }, h);
    }
  }
  set(q) {
    const s = q.s || 1, ph = q.phase || 0, walk = q.walk === undefined ? 1 : q.walk;
    this.g.setAttribute("transform", `translate(${f1(q.x)} ${f1(q.y)}) scale(${s.toFixed(3)})`);
    const a = Math.sin(ph * 2 * Math.PI) * walk;
    const liftL = Math.max(0, a) * 38, liftR = Math.max(0, -a) * 38;
    const setBoth = (p, tr) => p.forEach((g) => g.setAttribute("transform", tr));
    setBoth(this.lN, `translate(-116 ${f1(-liftL)}) scale(1 ${(1 - liftL * 0.0012).toFixed(3)})`);
    setBoth(this.rN, `translate(116 ${f1(-liftR)}) scale(1 ${(1 - liftR * 0.0012).toFixed(3)})`);
    this.lF.setAttribute("transform", `translate(-62 ${f1(-26 - liftR * 0.5)}) scale(0.84)`);
    this.rF.setAttribute("transform", `translate(62 ${f1(-26 - liftL * 0.5)}) scale(0.84)`);
    const roll = Math.sin(ph * 2 * Math.PI + 0.6) * 2.2 * walk;
    setBoth(this.body, `translate(${f1(a * 6)} ${f1(Math.abs(a) * -3)}) rotate(${f1(roll)} 0 -190)`);
    const sw = q.swing === undefined ? Math.sin(ph * Math.PI) : q.swing;
    const hx = sw * 42, hy = -190 + (q.headDrop || 0);
    this.hd.setAttribute("transform", `translate(${f1(hx)} ${f1(hy)}) rotate(${f1(sw * -8)}) scale(${q.headScale || 1})`);
  }
}
