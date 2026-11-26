/* Math film, Builder C: anxiety and working memory. Documentary palette PX.D only (no hex literals except black shadows).
   Kinds: scanner, waiting, mental_desk, phone_apps, write_worry, exam_hall.
   The learner (viewer stand-in): teen, dark curly hair, teal sweater, medium skin. Small (wide shots) + big (close shots). */
(function () {
  const { K, D } = PX;
  const R = PX.rect, clamp = PX.clamp, lerp = PX.lerp, P = PX.p, E = PX.ease;
  const TAU = Math.PI * 2, BLK = "#000000";

  // ---------- helpers ----------
  const hx = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const MC = new Map();
  const mix = (a, b, k) => {
    k = clamp(k, 0, 1); const key = a + b + Math.round(k * 255); let v = MC.get(key);
    if (!v) { const A0 = hx(a), B0 = hx(b); v = "#" + A0.map((x, i) => Math.round(x + (B0[i] - x) * k).toString(16).padStart(2, "0")).join(""); MC.set(key, v); }
    return v;
  };
  const sh3 = (c) => [mix(c, D.cream, 0.25), c, mix(c, D.n0, 0.4)];
  const ell = (g, cx, cy, rx, ry, col) => {
    if (rx <= 0 || ry <= 0) return; g.fillStyle = col;
    for (let y = -ry; y <= ry; y++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); }
  };
  const poly = (g, pts, col) => {
    let y0 = Infinity, y1 = -Infinity;
    for (const [, y] of pts) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    g.fillStyle = col;
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const xs = [], yc = y + 0.5;
      for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax)); }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) { const a = Math.round(xs[i]), b = Math.round(xs[i + 1]); if (b > a) g.fillRect(a, y, b - a, 1); }
    }
  };
  // thick segment (limb)
  const seg = (g, x1, y1, x2, y2, w, col) => {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = (-dy / L) * w / 2, ny = (dx / L) * w / 2;
    poly(g, [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]], col);
  };
  const A = (g, a, fn) => { if (a <= 0) return; const o = g.globalAlpha; g.globalAlpha = o * clamp(a, 0, 1); fn(); g.globalAlpha = o; };
  const frac = (x) => x - Math.floor(x);
  const hash = (i, j) => frac(Math.sin(i * 127.1 + j * 311.7) * 43758.5453);
  const clip = (g, x, y, w, h, fn) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); };
  const clipPoly = (g, pts, fn) => { g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip(); fn(); g.restore(); };
  // option time: o[k] if a number, else default scaled to the shot length
  const tm = (o, d, typ) => (k, def) => (typeof o[k] === "number" ? o[k] : (def * d) / typ);
  const dust = (g, seed, n, t, box, col, a) => PX.particles(g, seed, n, t, box, { vy: -1.5, vx: 1.2, col: col || D.lamp, a: a === undefined ? 0.4 : a, tw: 1.3 });
  const wood = (k) => { const w = mix(mix(D.rust[2], D.amber[2], 0.45), D.n2, k === undefined ? 0.35 : k); return [mix(w, D.lamp, 0.25), w, mix(w, D.n0, 0.4)]; };

  // ---------- people ----------
  const LRN = () => ({ skin: mix(D.lampD, D.rust[2], 0.42), hair: mix(D.n0, D.rust[2], 0.16), top: mix(D.teal[1], D.n3, 0.1), pants: mix(D.steel[2], D.n1, 0.35), curly: true });
  const SKINS = () => [mix(D.rose[0], D.lampD, 0.3), mix(D.lampD, D.rust[2], 0.5), mix(D.rust[2], D.n1, 0.4), mix(D.rose[0], D.paper, 0.45), mix(D.lampD, D.paper, 0.35)];
  const HAIRS = () => [mix(D.n0, D.rust[2], 0.25), D.n0, mix(D.rust[2], D.n1, 0.25), mix(D.paperD, D.amber[2], 0.35), mix(D.rust[1], D.rust[2], 0.6), mix(D.n1, D.n3, 0.5)];
  const TOPS = () => [mix(D.steel[2], D.n3, 0.2), mix(D.moss[2], D.n2, 0.2), mix(D.rust[2], D.n2, 0.25), mix(D.paperD, D.n3, 0.4), D.n4, mix(D.plum[2], D.n3, 0.3), mix(D.rose[2], D.n2, 0.3), mix(D.amber[2], D.n3, 0.4)];

  // small front-view head (wide shots), x = centre, hy = top of hair. ex: "worry" | "calm" | "focus"; look [dx, dy]
  const headF = (g, x, hy, v, ex, look, t, ph) => {
    x = Math.round(x); hy = Math.round(hy);
    const sk = v.skin, skL = mix(sk, D.cream, 0.22), skD = mix(sk, D.n0, 0.3), [hL, hr, hD] = [mix(v.hair, D.paperD, 0.3), v.hair, mix(v.hair, D.n0, 0.5)];
    R(g, x - 3, hy + 19, 7, 6, skD); R(g, x - 3, hy + 19, 7, 1, mix(skD, D.n0, 0.35));
    R(g, x - 10, hy + 10, 2, 5, sk); R(g, x - 10, hy + 11, 1, 3, skD); R(g, x + 9, hy + 10, 2, 5, skD);
    R(g, x - 7, hy + 5, 15, 14, sk); R(g, x - 8, hy + 7, 17, 9, sk); R(g, x - 6, hy + 19, 13, 1, sk); R(g, x - 4, hy + 20, 9, 1, sk);
    R(g, x + 6, hy + 8, 2, 9, skD); R(g, x + 4, hy + 18, 3, 1, skD); R(g, x - 7, hy + 12, 1, 3, skL);
    if (v.curly) {
      for (const [dx, dy, r] of [[-9, 8, 3], [9, 8, 3], [-6, 4, 4], [6, 4, 4], [-2, 2, 4], [3, 2, 4], [0, 0, 3], [-8, 3, 3], [8, 3, 3]]) PX.circle(g, x + dx, hy + dy + 1, r, hr);
      for (const [dx, dy] of [[-6, 1], [-2, -1], [3, -1], [7, 1], [-9, 5], [9, 5], [0, -2]]) { R(g, x + dx - 1, hy + dy + 1, 2, 1, hL); R(g, x + dx + 1, hy + dy + 2, 1, 1, hD); }
      for (const [dx, dy] of [[-4, 4], [1, 4], [5, 6], [-7, 7], [8, 9]]) R(g, x + dx, hy + dy + 1, 1, 1, hD);
    } else {
      R(g, x - 8, hy + 2, 17, 5, hr); R(g, x - 6, hy + 1, 13, 1, hr); R(g, x - 9, hy + 5, 2, 5, hr); R(g, x + 8, hy + 5, 2, 5, hD); R(g, x - 5, hy + 2, 7, 1, hL);
    }
    const ey = hy + 11, dx = look ? clamp(Math.round(look[0]), -1, 1) : 0;
    const blink = PX.blink(t + (ph || 0), 3.9, 0.035);
    for (const cx of [x - 4, x + 4]) {
      if (blink) { R(g, cx - 1, ey + 1, 3, 1, mix(skD, D.n0, 0.3)); continue; }
      R(g, cx - 1, ey, 3, 2, mix(D.cream, sk, 0.15)); R(g, cx + (dx > 0 ? 0 : dx < 0 ? -1 : 0), ey, 2, 2, D.n0);
    }
    const br = hD, by = ey - 3;
    if (ex === "worry") { for (const s of [-1, 1]) { R(g, x + s * 5, by, 1, 1, br); R(g, x + s * 4, by, 1, 1, br); R(g, x + s * 3, by - 1, 1, 1, br); } }
    else if (ex === "focus") { for (const s of [-1, 1]) { R(g, x + s * 5, by - 1, 1, 1, br); R(g, x + s * 4, by, 1, 1, br); R(g, x + s * 3, by, 1, 1, br); } }
    else { R(g, x - 5, by - 1, 3, 1, br); R(g, x + 3, by - 1, 3, 1, br); }
    R(g, x, ey + 2, 1, 3, skD); R(g, x + 1, ey + 4, 1, 1, skD);
    const my = hy + 17, mc = mix(skD, D.rust[2], 0.45);
    if (ex === "worry") { R(g, x - 1, my - 1, 3, 1, mc); R(g, x - 2, my, 1, 1, mc); R(g, x + 2, my, 1, 1, mc); }
    else if (ex === "calm") { R(g, x - 2, my, 5, 1, mc); R(g, x - 3, my - 1, 1, 1, mc); R(g, x + 3, my - 1, 1, 1, mc); }
    else R(g, x - 1, my, 3, 1, mc);
    if (ex === "worry") { const k = frac((t + (ph || 0)) / 2.4); if (k < 0.7) { const yy = hy + 6 + Math.round(k * 7); R(g, x + 9, yy, 1, 2, D.glass); } }
  };
  // small front-view torso (sweater), shoulder line sy, height h
  const torsoF = (g, x, sy, v, h) => {
    x = Math.round(x); sy = Math.round(sy);
    const [tL, tp, tD] = sh3(v.top);
    for (let r = 0; r < h; r++) { const w = r < 1 ? 11 : r < 2 ? 14 : r < 4 ? 16 : 17; R(g, x - w, sy + r, 2 * w + 1, 1, tp); R(g, x - w, sy + r, 2, 1, tL); R(g, x + w - 4, sy + r, 5, 1, tD); }
    R(g, x - 13, sy + 1, 10, 1, tL); R(g, x - 12, sy + 7, 1, h - 7, tD); R(g, x + 12, sy + 7, 1, h - 7, tD);
    for (let k = -8; k <= 8; k += 4) R(g, x + k, sy + 6, 1, h - 6, mix(tp, tD, 0.25));
    R(g, x - 4, sy, 9, 1, tD); R(g, x - 3, sy + 1, 7, 1, tD); R(g, x - 3, sy, 7, 1, mix(v.skin, D.n0, 0.3));
  };
  const armF = (g, ex, ey, hx2, hy2, v) => {
    const [tL, tp, tD] = sh3(v.top), sk = v.skin;
    seg(g, ex, ey + 1, hx2, hy2 + 1, 7, tD); seg(g, ex, ey, hx2, hy2, 6, tp); seg(g, ex, ey - 2, hx2, hy2 - 2, 2, tL);
    R(g, hx2 - 3, hy2 - 3, 6, 5, sk); R(g, hx2 - 3, hy2 + 1, 6, 1, mix(sk, D.n0, 0.3));
  };

  // BIG learner for close shots (head ~44 px). x centre, hy top of hair
  const bigHead = (g, x, hy, v, ex, look, t, ph) => {
    x = Math.round(x); hy = Math.round(hy);
    const sk = v.skin, skL = mix(sk, D.cream, 0.2), skD = mix(sk, D.n0, 0.28), skDD = mix(sk, D.n0, 0.48);
    const hr = v.hair, hL = mix(hr, D.paperD, 0.38), hD = mix(hr, D.n0, 0.55);
    // neck, ears, face
    R(g, x - 6, hy + 38, 13, 16, skD); R(g, x - 6, hy + 38, 13, 4, skDD); R(g, x + 3, hy + 42, 4, 12, skDD);
    ell(g, x - 16, hy + 27, 3, 5, skD); R(g, x - 17, hy + 25, 2, 4, sk); ell(g, x + 16, hy + 27, 3, 5, skDD); R(g, x + 16, hy + 25, 1, 4, skD);
    ell(g, x, hy + 26, 15, 17, skD); ell(g, x - 1, hy + 25, 14, 16, sk);
    R(g, x - 13, hy + 22, 1, 8, skL); R(g, x - 12, hy + 19, 1, 3, skL);
    R(g, x - 5, hy + 41, 11, 1, skD); R(g, x + 6, hy + 37, 4, 3, skD);
    // hair: a cloud of curls
    const curls = [[-15, 17, 5], [-14, 10, 6], [-9, 5, 6], [-3, 3, 6], [3, 3, 6], [9, 5, 6], [14, 10, 6], [15, 17, 5], [0, 7, 6], [-7, 11, 4], [1, 11, 4], [8, 11, 4], [-16, 23, 3], [16, 23, 3], [-11, 1, 4], [11, 1, 4], [-5, -1, 4], [5, -1, 4]];
    for (const [dx, dy, r] of curls) PX.circle(g, x + dx, hy + dy + 2, r, hr);
    for (const [dx, dy, r] of curls) { R(g, x + dx - 2, hy + dy + 3 - r, 3, 1, hL); R(g, x + dx - 3, hy + dy + 4 - r, 1, 1, hL); R(g, x + dx + r - 2, hy + dy + 3, 1, 2, hD); }
    for (const [dx, dy] of [[-12, 13], [-4, 14], [5, 14], [12, 13], [-1, 9]]) R(g, x + dx, hy + dy, 2, 1, hD);
    // eyes
    const ey = hy + 25, dx = look ? clamp(Math.round(look[0]), -1, 1) : 0, dy = look ? clamp(Math.round(look[1]), -1, 1) : 0;
    const blink = PX.blink(t + (ph || 0), 4.1, 0.03), down = ex === "focus" || ex === "write";
    for (const s of [-1, 1]) {
      const cx = x + s * 6 - (s > 0 ? 0 : 1);
      if (blink || ex === "relief") { R(g, cx - 2, ey + 1, 5, 1, skDD); R(g, cx - 3, ey + (ex === "relief" ? 0 : 1), 1, 1, skDD); continue; }
      if (down) { R(g, cx - 2, ey + 1, 5, 2, mix(D.cream, sk, 0.2)); R(g, cx - 1 + dx, ey + 1, 3, 2, mix(D.n0, D.rust[2], 0.25)); R(g, cx - 3, ey, 7, 1, skDD); }
      else {
        R(g, cx - 2, ey, 5, 3, mix(D.cream, sk, 0.12)); R(g, cx - 1 + dx, ey + (dy < 0 ? -1 : 0), 3, 3, mix(D.n0, D.rust[2], 0.25)); R(g, cx + dx, ey + (dy < 0 ? -1 : 0), 1, 1, D.cream);
        R(g, cx - 3, ey - 1, 7, 1, skDD);
        if (ex === "worry") R(g, cx - 2, ey + 3, 5, 1, skD);
      }
    }
    // brows: inner/outer offsets by expression
    const bro = ex === "worry" ? [-3, 0] : ex === "focus" || ex === "write" ? [-1, -1] : ex === "calm" || ex === "relief" ? [-2, -1] : [-1, -1];
    for (const s of [-1, 1]) for (let i = 0; i < 7; i++) { const px = x + s * (2 + i) - (s < 0 ? 1 : 0), py = ey - 5 + Math.round(lerp(bro[0], bro[1], i / 6)); R(g, px, py, 1, 2, hD); }
    // nose
    R(g, x + 1, ey + 3, 1, 6, skD); R(g, x - 1, ey + 4, 1, 4, skL); R(g, x - 2, ey + 9, 5, 1, skD); R(g, x - 3, ey + 8, 1, 1, skD); R(g, x + 3, ey + 8, 1, 1, skDD);
    // mouth
    const my = ey + 14, mc = mix(skDD, D.rust[2], 0.4), lip = mix(sk, D.rose[1], 0.35);
    if (ex === "calm" || ex === "relief") { R(g, x - 3, my, 7, 1, mc); R(g, x - 4, my - 1, 1, 1, mc); R(g, x + 4, my - 1, 1, 1, mc); R(g, x - 2, my + 1, 5, 1, lip); }
    else if (ex === "worry") { R(g, x - 2, my - 1, 5, 1, mc); R(g, x - 3, my, 1, 1, mc); R(g, x + 3, my, 1, 1, mc); R(g, x - 1, my + 1, 3, 1, lip); }
    else { R(g, x - 2, my, 5, 1, mc); R(g, x - 1, my + 1, 3, 1, lip); }
    // worry sweat drop at the temple
    if (ex === "worry") { const k = frac((t + (ph || 0)) / 2.6); if (k < 0.75) { const yy = hy + 16 + Math.round(k * 10); R(g, x + 13, yy, 2, 3, D.glass); R(g, x + 13, yy, 1, 1, D.cream); R(g, x + 14, yy + 2, 1, 1, mix(D.glass, D.steel[1], 0.5)); } }
  };
  // big torso (sweater) with upper arms hanging to the elbows at the desk: shoulder line sy, elbows at y = ely
  const bigTorso = (g, x, sy, v, ely, br) => {
    x = Math.round(x); sy = Math.round(sy + (br || 0));
    const [tL, tp, tD] = sh3(v.top), tDD = mix(v.top, D.n0, 0.55), h = ely - sy + 4;
    // upper arms (sleeves) from the shoulders down to the elbows, slightly out from the body
    for (const s of [-1, 1]) {
      const x0 = x + s * 27, x1 = x + s * 40;
      seg(g, x0, sy + 8, x1, ely, 15, s < 0 ? tp : tD); seg(g, x0 + s * 4, sy + 9, x1 + s * 4, ely, 5, s < 0 ? tL : tDD);
      seg(g, x0 - s * 6, sy + 14, x1 - s * 6, ely, 2, mix(tD, D.n0, 0.3));
    }
    // body: rounded shoulders, slight taper to the waist
    for (let r = 0; r < h; r++) {
      const w = r < 2 ? 16 + r * 5 : r < 7 ? 26 + Math.round((r - 2) * 0.8) : Math.round(30 - Math.min(4, (r - 7) * 0.08));
      R(g, x - w, sy + r, 2 * w + 1, 1, tp); R(g, x - w, sy + r, 3, 1, tL); R(g, x + w - 6, sy + r, 7, 1, tD);
    }
    R(g, x - 22, sy + 1, 16, 1, tL); R(g, x - 27, sy + 3, 8, 1, tL);
    for (let k = -15; k <= 15; k += 5) for (let r = 12; r < h; r += 3) R(g, x + k, sy + r, 1, 2, mix(tp, tD, 0.28));
    R(g, x - 20, sy + h - 10, 40, 1, mix(tp, tD, 0.35));   // fold where the sweater meets the desk
    // crew neck
    ell(g, x, sy + 1, 9, 4, tD); ell(g, x, sy, 7, 3, mix(v.skin, D.n0, 0.3)); R(g, x - 9, sy + 1, 19, 1, tD); R(g, x - 8, sy + 3, 17, 1, mix(tp, tL, 0.5));
  };
  // big forearm from elbow to hand; pen = pencil in hand
  const bigArm = (g, ex, ey, hx2, hy2, v, pen, side) => {
    const [tL, tp, tD] = sh3(v.top), sk = v.skin, skD = mix(sk, D.n0, 0.3);
    seg(g, ex, ey + 2, hx2, hy2 + 2, 13, mix(tD, D.n0, 0.3)); seg(g, ex, ey, hx2, hy2, 12, tp); seg(g, ex, ey - 4, hx2, hy2 - 4, 3, tL);
    const cx = lerp(ex, hx2, 0.82), cy = lerp(ey, hy2, 0.82); seg(g, cx, cy, lerp(ex, hx2, 0.9), lerp(ey, hy2, 0.9), 13, tD);
    ell(g, hx2, hy2, 6, 5, skD); ell(g, hx2 - 1, hy2 - 1, 5, 4, sk); R(g, hx2 - 4, hy2 - 4, 4, 1, mix(sk, D.cream, 0.2));
    for (let k = 0; k < 3; k++) R(g, hx2 - 3 + k * 2 * (side || 1), hy2 + 3, 1, 1, skD);
    if (pen) { PX.line(g, hx2 + 2, hy2 + 3, hx2 + 8, hy2 - 10, D.amber[1]); PX.line(g, hx2 + 3, hy2 + 3, hx2 + 9, hy2 - 10, D.amber[2]); R(g, hx2 + 8, hy2 - 13, 2, 3, D.rose[1]); R(g, hx2 + 2, hy2 + 3, 1, 2, D.ink); }
  };
  // big desk: near edge y, top 62 deep; content() draws on the desk top
  const bigDesk = (g, x, y, content) => {
    const wd = wood(0.28);
    poly(g, [[x - 150, y - 62], [x + 150, y - 62], [x + 166, y], [x - 166, y]], wd[1]);
    for (let k = 0; k < 9; k++) { const yy = y - 58 + k * 7; PX.line(g, x - 150 - k * 2 + (k * 37) % 60, yy, x + 60 + (k * 53) % 90, yy, mix(wd[1], wd[2], 0.22)); }
    R(g, x - 150, y - 62, 300, 1, wd[0]);
    content(g);
    R(g, x - 166, y, 332, 6, wd[0]); R(g, x - 166, y + 6, 332, 2, wd[2]);
    R(g, x - 160, y + 8, 320, 80, mix(wd[2], D.n1, 0.3)); R(g, x - 160, y + 8, 320, 2, mix(wd[2], D.n0, 0.4));
  };
  // big sheet with printed question bars + handwriting that fills to p (0..1)
  const bigSheet = (g, x, y, w, h, p, t) => {
    R(g, x + 2, y + 2, w, h, mix(D.paperD, D.n2, 0.55)); R(g, x, y, w, h, D.cream); R(g, x, y, w, 1, mix(D.cream, D.n7, 0.08)); R(g, x, y + h - 1, w, 1, D.paperD);
    R(g, x + 4, y + 4, w * 0.45, 2, mix(D.ink, D.paper, 0.35));
    for (let l = 0; l < 5; l++) {
      const yy = y + 11 + l * 8;
      if (yy > y + h - 5) break;
      R(g, x + 4, yy, 4, 1, mix(D.ink, D.paper, 0.4)); R(g, x + 10, yy, 18 + (l * 7) % 12, 1, mix(D.ink, D.paper, 0.55));
      const lw = Math.round((w - 16) * clamp(p * 5 - l, 0, 1));
      for (let i = 0; i < lw; i++) R(g, x + 10 + i, yy + 3 + (Math.sin(i * 1.1 + l * 2) > 0.2 ? 0 : 1), 1, 1, mix(D.ink, D.steel[2], 0.25));
    }
  };

  // small front-view student behind a desk (background), x centre, y = desk top edge
  const kidF = (g, x, y, s, v, t, w) => {
    const [tL, tp, tD] = sh3(v.top), sk = v.skin, hr = v.hair, hr2 = Math.max(3, Math.round(7 * s));
    const bw = Math.round(15 * s), sy = Math.round(y - 20 * s), jit = w ? Math.round(Math.sin(t * 8 + v.ph) * s) : 0;
    R(g, x - bw, sy + 2, 2 * bw, Math.round(20 * s), tp); R(g, x - bw + 2, sy, 2 * bw - 4, 2, tp); R(g, x - bw, sy + 2, 2, Math.round(20 * s), tL); R(g, x + bw - 3, sy + 2, 3, Math.round(20 * s), tD);
    const hy = sy - hr2 - Math.round(2 * s) + (w ? 1 : 0);
    R(g, x - 2, sy - 3, 4, 3, mix(sk, D.n0, 0.3));
    PX.circle(g, x, hy, hr2, sk); R(g, x + hr2 - 2, hy - 2, 2, hr2, mix(sk, D.n0, 0.25));
    PX.circle(g, x, hy - Math.round(hr2 * 0.45), hr2, hr); R(g, x - hr2, hy - Math.round(hr2 * 0.45), 2 * hr2 + 1, Math.round(hr2 * 0.6), hr);
    if (v.hs === "long") { R(g, x - hr2 - 1, hy - 2, 3, hr2 + 4, hr); R(g, x + hr2 - 1, hy - 2, 3, hr2 + 4, mix(hr, D.n0, 0.35)); }
    R(g, x - hr2 + 2, hy - hr2 - 1, hr2, 1, mix(hr, D.paperD, 0.3));
    const ey = hy + Math.round(hr2 * 0.3) + (w ? 1 : 0);
    R(g, x - 3, ey, 1, w ? 1 : 2, D.n0); R(g, x + 2, ey, 1, w ? 1 : 2, D.n0);
    R(g, x - bw - 1, y - 4, bw - 2, 4, tp); R(g, x + 3 + jit, y - 4, bw - 2, 4, tp); R(g, x - 4, y - 4, 4, 3, sk); R(g, x + 1 + jit, y - 4, 4, 3, sk);
  };
  // back-view student at a desk, x centre, y = desk edge (nearest to us), s scale, w writing 0..1, up looks up 0..1
  const kidB = (g, x, y, s, v, t, w, up) => {
    const [tL, tp, tD] = sh3(v.top), [hL, hr, hD] = sh3(v.hair), sk = v.skin;
    const bw = Math.max(4, Math.round(11 * s)), sy = Math.round(y - 15 * s), hr2 = Math.max(2, Math.round(6 * s)), th = Math.round(19 * s);
    const jx = w > 0 ? Math.round(Math.sin(t * 9 + v.ph) * s * w) : 0;
    if (s > 0.35) { R(g, x + bw - 2 + jx, sy + 2, Math.max(2, Math.round(5 * s)), Math.max(2, Math.round(9 * s)), tp); R(g, x + bw + 2 + jx, sy + 3, 1, Math.max(1, Math.round(7 * s)), tD); }
    R(g, x - bw, sy + 1, 2 * bw, th, tp); R(g, x - bw + 1, sy, 2 * bw - 2, 1, tp);
    R(g, x - bw, sy + 1, Math.max(1, Math.round(3 * s)), th, tD); R(g, x - bw + 1, sy, 2 * bw - 3, 1, tL);
    if (s > 0.6) R(g, x, sy + 4, 1, th - 5, tD);
    if (s > 1.2) { R(g, x - bw + 2, sy + 1, 2 * bw - 5, 1, tL); for (let k = -bw + 5; k < bw - 3; k += 5) R(g, x + k, sy + 6, 1, th - 8, mix(tp, tD, 0.3)); }
    const hy = Math.round(sy - hr2 + 1 - up * 2 * s + (1 - up) * s);
    R(g, x - Math.max(1, Math.round(s)), sy - Math.round(2 * s), Math.max(3, Math.round(3 * s)), Math.round(3 * s), mix(sk, D.n0, 0.3));
    if (s > 0.45) { R(g, x - hr2 - 1, hy, Math.max(1, Math.round(s)), Math.max(2, Math.round(2 * s)), sk); R(g, x + hr2, hy, Math.max(1, Math.round(s)), Math.max(2, Math.round(2 * s)), mix(sk, D.n0, 0.25)); }
    PX.circle(g, x, hy, hr2, hr);
    if (v.hs === "long") { R(g, x - hr2, hy, 2 * hr2 + 1, Math.round(hr2 + 5 * s), hr); R(g, x - hr2, hy, Math.max(1, Math.round(s)), Math.round(hr2 + 5 * s), hD); }
    if (v.hs === "bun") { PX.circle(g, x, hy - hr2, Math.max(1, Math.round(2.5 * s)), hD); R(g, x - 1, hy - hr2 - Math.round(2 * s), 2, 1, hL); }
    R(g, x - hr2 + 1, hy - hr2 + 1, Math.max(1, hr2 - 1), 1, hL); R(g, x - hr2 + 1, hy - hr2 + 2, Math.max(1, Math.round(hr2 * 0.5)), 1, hL); R(g, x + 1, hy + hr2 - 1, Math.max(1, hr2 - 2), 1, hD);
    if (s > 1.2) for (let k = 0; k < 4; k++) R(g, x - hr2 + 2 + Math.floor(hash(v.ph, k) * (2 * hr2 - 3)), hy - 2 + Math.floor(hash(k, v.ph) * hr2), 1, Math.round(2 * s), mix(hr, hD, 0.55));
  };
  // side-view walking adult (teacher), feet at (x, y), faces right if f = 1; ph = walk phase (radians)
  const walker = (g, x, y, v, ph, f) => {
    x = Math.round(x); y = Math.round(y);
    const fr = (dx, dy, w, h, col) => R(g, f > 0 ? x + dx : x - dx - w + 1, y + dy, w, h, col);
    const [tL, tp, tD] = sh3(v.top), [pL, pa, pD] = sh3(v.pants), sk = v.skin, skD = mix(sk, D.n0, 0.3), [hL, hr, hD] = sh3(v.hair);
    const sw = Math.sin(ph), bob = Math.round(Math.abs(Math.cos(ph)) * 1);
    A(g, 0.4, () => ell(g, x, y, 11, 2, BLK));
    const leg = (s2, col, sh) => { const fx = Math.round(s2 * 6); seg(g, x, y - 26 - bob, x + f * fx, y - 2, 5, col); fr(fx - 2, -3, 7, 3, sh); };
    leg(-sw, pD, D.n1); leg(sw, pa, mix(D.n1, D.n3, 0.5));
    // long skirt
    poly(g, [[x - 6, y - 32 - bob], [x + 6, y - 32 - bob], [x + 8 + Math.round(sw * 1.5), y - 14], [x - 8 + Math.round(sw * 1.5), y - 14]], pa);
    poly(g, [[x - 6, y - 32 - bob], [x - 3, y - 32 - bob], [x - 5 + Math.round(sw * 1.5), y - 14], [x - 8 + Math.round(sw * 1.5), y - 14]], pD);
    seg(g, x, y - 52 - bob, x + f * Math.round(sw * 5), y - 34 - bob, 4, tD);
    fr(-6, -55 - bob, 13, 25, tp); fr(-6, -55 - bob, 3, 25, tD); fr(5, -54 - bob, 2, 23, tL); fr(-5, -56 - bob, 11, 1, tp);
    fr(1, -54 - bob, 2, 22, mix(tp, tD, 0.4));
    const ax = Math.round(-sw * 5);
    seg(g, x + f, y - 52 - bob, x + f * (2 + ax), y - 35 - bob, 4, tp);
    // clipboard in the front hand
    fr(ax + 1, -42 - bob, 7, 9, D.paper); fr(ax + 1, -42 - bob, 7, 1, D.n3); fr(ax, -36 - bob, 4, 3, sk);
    fr(-1, -59 - bob, 4, 4, skD);
    fr(-4, -70 - bob, 10, 12, sk); fr(5, -66 - bob, 2, 4, sk); fr(6, -63 - bob, 1, 1, skD);
    fr(-5, -72 - bob, 10, 4, hr); fr(-5, -69 - bob, 4, 7, hr); fr(-3, -73 - bob, 7, 1, hr); fr(-2, -73 - bob, 5, 1, hL); fr(-5, -64 - bob, 2, 2, hD);
    fr(-8, -72 - bob, 4, 4, hr); fr(-8, -72 - bob, 2, 1, hL);
    fr(2, -66 - bob, 1, 1, D.n0); fr(1, -68 - bob, 3, 1, hD);
    fr(0, -67 - bob, 5, 1, D.n2); fr(0, -66 - bob, 1, 1, D.n2); fr(4, -66 - bob, 1, 1, D.n2);
    fr(2, -61 - bob, 3, 1, skD);
  };

  // wall clock: no digits, tick marks only; sec = clock time in seconds (second hand ticks)
  const wallClock = (g, x, y, r, sec, o) => {
    o = o || {}; x = Math.round(x); y = Math.round(y);
    A(g, 0.35, () => PX.circle(g, x + 2, y + 2, r + 2, BLK));
    PX.circle(g, x, y, r + 2, o.rim || D.n2); PX.circle(g, x, y, r + 1, mix(o.rim || D.n2, D.n5, 0.5));
    PX.circle(g, x, y, r, o.face || mix(D.cream, D.paper, 0.4));
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU, r0 = r - (i % 3 === 0 ? 3 : 2); PX.line(g, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * (r - 1), y + Math.sin(a) * (r - 1), D.ink); }
    const s = Math.floor(sec), m = sec / 60, h = sec / 3600;
    const hand = (a, l, col) => PX.line(g, x, y, x + Math.cos(a - Math.PI / 2) * l, y + Math.sin(a - Math.PI / 2) * l, col);
    hand((h / 12) * TAU, r * 0.5, D.ink); hand(((m % 60) / 60) * TAU, r * 0.78, D.ink);
    hand(((s % 60) / 60) * TAU, r * 0.85, D.rust[1]);
    R(g, x, y, 1, 1, D.rust[2]);
    R(g, x - Math.round(r * 0.5), y - r + 2, Math.round(r * 0.6), 1, mix(D.cream, D.n7, 0.1));
  };

  // storm cloud of worry. k = size, br = break-apart 0..1 (puffs drift up, thin out, lighten)
  const CPUFF = [[-20, 2, 11], [-8, -6, 14], [8, -8, 13], [21, 0, 11], [0, 4, 13], [-28, 7, 7], [29, 7, 7], [14, 6, 10], [-14, 7, 10]];
  const cloud = (g, x, y, k, t, br, o) => {
    o = o || {}; br = br || 0; if (k <= 0.02 || br >= 1) return;
    const a = (1 - br) * (1 - br) * clamp(k * 3, 0, 1);
    const flash = !o.calm && br < 0.1 && PX.blink(t + 0.4, 2.7, 0.05) && k > 0.6 ? 1 : 0;
    const body = mix(mix(D.n3, D.steel[2], 0.25), D.n6, br * 0.7), top = mix(mix(D.n4, D.steel[2], 0.2), D.n7, br * 0.6), under = mix(D.n2, D.n6, br * 0.7);
    A(g, a, () => {
      const ps = CPUFF.map(([dx, dy, r], i) => {
        const wob = Math.sin(t * 1.3 + i * 1.7) * 1.2, ex = br * (dx * 0.8 + (hash(i, 3) - 0.5) * 26), ey = -br * (10 + hash(i, 5) * 16);
        return [x + (dx + ex) * k, y + (dy + ey + wob * 0.6) * k, Math.max(1, Math.round((r + wob) * k * (1 - br * 0.55)))];
      });
      if (!o.norain && k > 0.35 && br < 0.2) for (let i = 0; i < 12; i++) {
        const ph = frac(t * 1.5 + hash(i, 1)), rx = x + (hash(i, 2) - 0.5) * 46 * k, ry = y + 10 * k + ph * 26 * k;
        A(g, (1 - ph) * 0.7, () => R(g, rx, ry, 1, Math.max(2, Math.round(3 * k)), mix(D.steel[1], D.n5, 0.2)));
      }
      if (flash) { const bx = Math.round(x + 4 * k); PX.line(g, bx, y + 10 * k, bx - 3 * k, y + 17 * k, D.lamp); PX.line(g, bx - 3 * k, y + 17 * k, bx + k, y + 19 * k, D.lamp); PX.line(g, bx + k, y + 19 * k, bx - 2 * k, y + 27 * k, D.lamp); }
      for (const [px, py, r] of ps) PX.circle(g, px, py + Math.max(2, Math.round(3 * k)), r, under);
      for (const [px, py, r] of ps) PX.circle(g, px, py, r, flash ? mix(body, D.n6, 0.4) : body);
      for (const [px, py, r] of ps) PX.circle(g, px - 1, py - Math.round(r * 0.35), Math.max(1, r - Math.round(3 * k)), flash ? D.n6 : top);
      for (const [px, py, r] of ps) R(g, px - Math.round(r * 0.5), py - r + 1, Math.max(1, Math.round(r * 0.6)), 1, mix(D.n6, D.n7, 0.3));
    });
  };

  // ======================= scanner =======================
  // an MRI room seen through the control-room window. o.slide (0.5): the patient slides in; o.signal (4.0): the in-bore
  // screen + operator's stimulus monitor show a clock with a plus; o.light (5.0): amber-rust activation on the brain monitor.
  K.scanner = (o) => {
    const SW = 112, SH = 84, AW = 64, AH = 60;
    const sag = [], axl = [];
    const inE = (u, v, cx, cy, rx, ry) => ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2 <= 1;
    const sagIn = (u, v) => inE(u, v, -4, -6, 46, 29) || inE(u, v, 22, -2, 26, 25) || inE(u, v, 8, 10, 30, 14) || inE(u, v, -30, 18, 15, 9) ||
      (v > 10 && v < 38 && Math.abs(u - (-12 - (v - 10) * 0.25)) < 4.5);
    const isCb = (u, v) => inE(u, v, -30, 18, 15, 9) && !inE(u, v, -4, -6, 46, 29);
    for (let j = 0; j < SH; j++) for (let i = 0; i < SW; i++) {
      const u = i - SW / 2, v = j - SH / 2;
      const head = inE(u, v, 2, -4, 55, 41) && !inE(u, v, 2, -4, 52, 38);
      if (!sagIn(u, v)) { sag.push(head ? 1 : 0); continue; }
      const edge = !sagIn(u + 1, v) || !sagIn(u - 1, v) || !sagIn(u, v + 1) || !sagIn(u, v - 1);
      const cc = inE(u, v, 2, -1, 22, 7) && !inE(u, v, 2, 1, 21, 7) && v < 0;
      let c = 3;
      if (isCb(u, v)) c = ((v * 1.3 + u * 0.35) % 3 + 3) % 3 < 1 ? 2 : 3;
      else { const s = Math.sin(u * 0.42 + 3 * Math.sin(v * 0.17 + u * 0.03)) * Math.cos(v * 0.36 + 2 * Math.sin(u * 0.11)); if (s > 0.5) c = 2; else if (s < -0.75) c = 4; }
      sag.push(edge ? 5 : cc ? 4 : c);
    }
    for (let j = 0; j < AH; j++) for (let i = 0; i < AW; i++) {
      const u = i - AW / 2, v = j - AH / 2, inA = inE(u, v, 0, 0, 25, 28);
      const head = inE(u, v, 0, 0, 30, 29.5) && !inE(u, v, 0, 0, 28, 27.5);
      if (!inA) { axl.push(head ? 1 : 0); continue; }
      const edge = !inE(u + 1, v, 0, 0, 25, 28) || !inE(u - 1, v, 0, 0, 25, 28) || !inE(u, v + 1, 0, 0, 25, 28) || !inE(u, v - 1, 0, 0, 25, 28);
      const mid = Math.abs(u) < 1 && Math.abs(v) > 6;
      const vent = inE(Math.abs(u), v, 3, 0, 2.2, 8) && Math.abs(u) > 0.5;
      const s = Math.sin(Math.abs(u) * 0.55 + 2.5 * Math.sin(v * 0.2)) * Math.cos(v * 0.45 + Math.abs(u) * 0.1);
      axl.push(edge ? 5 : mid ? 2 : vent ? 1 : s > 0.5 ? 2 : s < -0.75 ? 4 : 3);
    }
    const GREY = () => [null, mix(D.n3, D.n2, 0.3), mix(D.n4, D.n5, 0.3), mix(D.n5, D.n6, 0.45), D.n6, D.n7];
    const BLOBS_S = [[8, 3, 9], [-6, -14, 7], [24, 6, 5]], BLOBS_A = [[-10, 4, 6], [10, 4, 6], [0, -10, 5]];
    const hot = (f) => (f > 0.72 ? D.amber[0] : f > 0.5 ? D.amber[1] : f > 0.3 ? D.rust[1] : D.rust[2]);
    const paint = (g, mask, W, H, x0, y0, blobs, act, t) => {
      const G = GREY();
      for (let j = 0; j < H; j++) {
        let run = null, rx = 0;
        for (let i = 0; i <= W; i++) {
          let col = null;
          if (i < W) {
            const m = mask[j * W + i];
            if (m) {
              col = G[m];
              if (act > 0 && m > 1) {
                const u = i - W / 2, v = j - H / 2; let f = 0;
                for (const [bx, by, br] of blobs) { const dd = Math.hypot(u - bx, v - by) / (br * (0.85 + 0.3 * hash(Math.floor(u / 2), Math.floor(v / 2)))); f = Math.max(f, (1 - dd) * act); }
                if (f > 0.12) col = hot(f * (0.92 + 0.08 * Math.sin(t * 3.1)));
              }
            }
          }
          if (col !== run) { if (run) R(g, x0 + rx, y0 + j, i - rx, 1, run); run = col; rx = i; }
        }
      }
    };
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 10), tS = T("slide", 0.5), tG = T("signal", 4.0), tL = T("light", 5.0);
      const sl = P(t, tS, Math.min(2.8, d * 0.3), "io"), sig = P(t, tG, 0.35, "out"), act = P(t, tL, 1.4, "out");
      const FX = 318, FY = 128;
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: the MRI room (cool clinical light) ----
      PX.par(g, c, 0.45, () => {
        PX.vgrad(g, 20, 20, 600, 160, mix(D.n6, D.steel[0], 0.25), mix(D.n5, D.steel[1], 0.2), 7);
        R(g, 20, 20, 600, 22, mix(D.n4, D.steel[2], 0.2)); R(g, 20, 42, 600, 1, mix(D.n6, D.steel[0], 0.4));
        for (const lx of [120, 260, 400, 520]) { R(g, lx, 28, 60, 6, mix(D.cream, D.steel[0], 0.35)); R(g, lx, 33, 60, 1, mix(D.n6, D.steel[0], 0.3)); PX.glow(g, lx + 30, 40, 50, D.steel[0], 0.12); }
        for (let x = 60; x < 620; x += 46) R(g, x, 43, 1, 125, mix(D.n5, D.steel[1], 0.3));
        R(g, 20, 168, 600, 3, mix(D.n5, D.steel[2], 0.3));
        PX.vgrad(g, 20, 171, 600, 70, mix(D.n5, D.steel[1], 0.25), mix(D.n6, D.steel[0], 0.2), 5);
        for (let k = 0; k < 4; k++) R(g, 20, 178 + k * k * 4, 600, 1, mix(D.n5, D.steel[2], 0.25));
        for (let k = -8; k <= 8; k++) PX.line(g, 320 + k * 30, 171, 320 + k * 70, 240, mix(D.n5, D.steel[2], 0.15));
        // cabinet with head coils, warning sign, linen shelf
        R(g, 470, 96, 78, 74, mix(D.n5, D.steel[2], 0.3)); R(g, 470, 96, 78, 1, mix(D.n7, D.steel[0], 0.3)); R(g, 470, 130, 78, 2, mix(D.n4, D.steel[2], 0.3));
        for (const cx2 of [486, 512, 536]) { ell(g, cx2, 120, 9, 7, mix(D.n6, D.cream, 0.3)); ell(g, cx2, 121, 6, 4, mix(D.n4, D.steel[2], 0.3)); R(g, cx2 - 9, 125, 18, 2, mix(D.n5, D.steel[2], 0.3)); }
        for (let k = 0; k < 3; k++) { R(g, 476 + k * 24, 140, 18, 24, mix(D.n5, D.steel[1], 0.3 + k * 0.05)); R(g, 476 + k * 24 + 15, 150, 2, 4, D.n3); }
        poly(g, [[430, 76], [446, 76], [438, 62]], D.amber[1]); poly(g, [[432, 75], [444, 75], [438, 65]], D.amber[0]); R(g, 437, 67, 2, 5, D.ink); R(g, 437, 73, 2, 1, D.ink);
        R(g, 70, 112, 40, 56, mix(D.n6, D.cream, 0.2)); R(g, 70, 112, 40, 1, D.cream); R(g, 108, 112, 2, 56, mix(D.n5, D.steel[2], 0.3));
        for (const yy of [122, 140]) { R(g, 74, yy, 32, 2, mix(D.n5, D.steel[1], 0.3)); R(g, 76, yy - 6, 26, 6, mix(D.cream, D.steel[0], 0.2)); R(g, 76, yy - 6, 26, 1, D.cream); }
        A(g, 0.18, () => ell(g, FX - 40, 214, 110, 10, mix(D.n4, D.steel[2], 0.3)));
        // housing: cylinder seen three-quarter (body to the left, round face with the bore to the right)
        const bodyL = mix(D.cream, D.steel[0], 0.18), body = mix(D.paper, D.n6, 0.3), bodyD = mix(D.n5, D.steel[2], 0.25);
        ell(g, 206, FY, 24, 64, bodyD);
        const bands = [bodyL, bodyL, mix(bodyL, body, 0.5), body, body, body, body, mix(body, bodyD, 0.3), mix(body, bodyD, 0.6), bodyD];
        for (let y = FY - 64; y <= FY + 64; y++) { const k = (y - (FY - 64)) / 129; R(g, 206, y, FX - 206, 1, bands[Math.min(9, Math.floor(k * 10))]); }
        R(g, 226, FY - 64, 70, 1, D.cream); R(g, 206, FY - 30, FX - 206, 1, mix(body, bodyD, 0.25));
        R(g, FX - 30, FY - 64, 5, 129, mix(D.teal[1], D.n5, 0.35)); R(g, FX - 30, FY - 64, 1, 129, mix(D.teal[0], D.n6, 0.3));
        R(g, 196, FY + 58, 130, 14, mix(D.n4, D.steel[2], 0.3)); R(g, 196, FY + 58, 130, 1, mix(D.n6, D.steel[0], 0.3));
        ell(g, FX, FY, 25, 65, mix(D.n6, D.steel[1], 0.2)); ell(g, FX, FY, 24, 64, mix(D.cream, D.paper, 0.4));
        ell(g, FX + 1, FY + 6, 22, 56, mix(D.paper, D.n6, 0.25));
        ell(g, FX, FY, 15, 36, mix(D.n6, D.steel[1], 0.3)); ell(g, FX, FY, 13, 34, mix(D.n4, D.steel[2], 0.3)); ell(g, FX - 2, FY, 10, 31, D.n3); ell(g, FX - 4, FY + 1, 6, 27, mix(D.n2, D.steel[2], 0.3));
        R(g, FX - 6, FY - 28, 6, 2, mix(D.cream, D.steel[0], 0.4)); PX.glow(g, FX - 3, FY - 24, 14, D.steel[0], 0.2);
        for (let k = 0; k < 3; k++) R(g, FX + 10, FY - 46 + k * 4, 3, 2, k === 1 && PX.blink(t, 1.2, 0.5) ? D.moss[0] : mix(D.n5, D.steel[2], 0.3));
        // cradle table (base fixed, top slides) + patient
        const TY = FY + 20, slide = Math.round(-46 * sl);
        R(g, 372, TY + 8, 60, FY + 70 - TY - 8, mix(D.n5, D.steel[2], 0.25)); R(g, 372, TY + 8, 60, 1, mix(D.n6, D.steel[0], 0.3)); R(g, 428, TY + 8, 4, FY + 70 - TY - 8, mix(D.n4, D.steel[2], 0.3));
        R(g, 364, FY + 66, 76, 6, mix(D.n4, D.steel[2], 0.3));
        R(g, FX + 8, TY + 6, 150, 3, mix(D.n4, D.steel[2], 0.3));
        const person = (dark) => {
          const X = FX + 22 + slide, cr = dark ? (col) => mix(col, D.n1, 0.65) : (col) => col;
          const skin = mix(D.rose[0], D.lampD, 0.35), gown = mix(D.teal[0], D.steel[0], 0.45), blanket = mix(D.steel[1], D.n5, 0.35);
          R(g, X - 14, TY, 150, 5, cr(mix(D.n5, D.steel[2], 0.3))); R(g, X - 14, TY, 150, 1, cr(mix(D.n6, D.steel[0], 0.3)));
          PX.circle(g, X, TY - 6, 6, cr(skin)); R(g, X - 6, TY - 12, 4, 4, cr(D.n2));
          for (const cx2 of [X - 8, X - 1, X + 4]) R(g, cx2, TY - 13, 2, 12, cr(mix(D.n6, D.cream, 0.3)));
          R(g, X - 8, TY - 13, 14, 2, cr(mix(D.n6, D.cream, 0.3)));
          R(g, X + 6, TY - 4, 2, 2, cr(skin));
          R(g, X + 8, TY - 9, 30, 9, cr(gown)); R(g, X + 8, TY - 9, 30, 1, cr(mix(gown, D.cream, 0.4))); R(g, X + 8, TY - 2, 30, 2, cr(mix(D.teal[1], D.steel[1], 0.4)));
          R(g, X + 16, TY - 11, 12, 3, cr(skin)); R(g, X + 16, TY - 11, 12, 1, cr(mix(skin, D.cream, 0.3)));
          R(g, X + 34, TY - 8, 40, 8, cr(blanket)); R(g, X + 34, TY - 8, 40, 1, cr(mix(blanket, D.cream, 0.35))); R(g, X + 34, TY - 2, 40, 2, cr(mix(blanket, D.n2, 0.4)));
          for (let k = 0; k < 3; k++) R(g, X + 42 + k * 11, TY - 7, 1, 5, cr(mix(blanket, D.n2, 0.3)));
          R(g, X + 72, TY - 14, 5, 14, cr(blanket)); R(g, X + 72, TY - 14, 5, 1, cr(mix(blanket, D.cream, 0.35))); R(g, X + 75, TY - 13, 2, 13, cr(mix(blanket, D.n2, 0.35)));
        };
        clip(g, FX, 0, 400, 260, () => person(false));
        clip(g, FX - 10, FY - 30, 10, 60, () => person(true));
        // in-bore screen on an arm over the opening
        const scx = FX + 28, scy = 64;
        R(g, FX + 4, 52, 2, 12, mix(D.n5, D.steel[2], 0.3)); R(g, FX + 4, 52, 26, 2, mix(D.n5, D.steel[2], 0.3)); R(g, FX + 4, 52, 26, 1, mix(D.n6, D.steel[0], 0.3));
        R(g, scx - 2, scy - 2, 34, 24, mix(D.n3, D.steel[2], 0.3)); R(g, scx - 2, scy - 2, 34, 1, mix(D.n6, D.steel[0], 0.2));
        R(g, scx, scy, 30, 20, mix(D.n1, D.steel[2], 0.3 + 0.2 * sig));
        if (sig > 0) A(g, sig, () => stimIcon(g, scx + 13, scy + 10, 6));
        else if (PX.blink(t, 1.6, 0.6)) R(g, scx + 14, scy + 9, 2, 2, mix(D.n5, D.steel[1], 0.3));
        if (sig > 0) PX.glow(g, scx + 15, scy + 10, 22, D.cream, 0.12 * sig);
      });
      // ---- glass + control-room wall ----
      PX.par(g, c, 0.8, () => {
        A(g, 0.16, () => R(g, 56, 30, 528, 196, mix(D.steel[2], D.n1, 0.3)));
        A(g, 0.05, () => { poly(g, [[140, 30], [200, 30], [110, 226], [50, 226]], D.glass); poly(g, [[230, 30], [250, 30], [170, 226], [150, 226]], D.glass); poly(g, [[490, 30], [530, 30], [470, 226], [430, 226]], D.glass); });
        const wl = mix(D.n2, D.rust[2], 0.1), wlD = mix(D.n1, D.rust[2], 0.08);
        PX.vgrad(g, -40, -40, 720, 70, mix(D.n1, D.n2, 0.3), wl, 4);
        R(g, -40, 30, 96, 300, wl); R(g, 584, 30, 96, 300, wl); R(g, -40, 226, 720, 140, wlD);
        R(g, 52, 26, 536, 4, D.n3); R(g, 52, 26, 4, 204, D.n3); R(g, 584, 26, 4, 204, D.n3); R(g, 52, 26, 536, 1, D.n4);
        R(g, 48, 226, 544, 8, mix(D.n3, D.rust[2], 0.12)); R(g, 48, 226, 544, 1, mix(D.n5, D.lampD, 0.2)); R(g, 48, 233, 544, 1, D.n1);
        R(g, 456, 30, 3, 196, D.n3); R(g, 456, 30, 1, 196, D.n4);
        R(g, 14, 120, 22, 34, D.n3); R(g, 14, 120, 22, 1, D.n4); for (let k = 0; k < 4; k++) R(g, 18, 126 + k * 4, 14, 1, D.n2); R(g, 22, 146, 6, 4, PX.blink(t, 2, 0.15) ? D.moss[1] : D.n2);
        R(g, 606, 40, 34, 260, mix(D.n2, D.rust[2], 0.15)); R(g, 606, 40, 2, 260, D.n3);
      });
      // ---- near: desk, monitors, operator ----
      const wd = wood(0.55);
      R(g, -40, 298, 720, 30, wd[1]); R(g, -40, 298, 720, 1, wd[0]); for (let k = 0; k < 5; k++) R(g, -40 + k * 150 + (k % 2) * 40, 304 + (k * 7) % 18, 70, 1, mix(wd[1], wd[2], 0.4));
      R(g, -40, 328, 720, 4, wd[2]); R(g, -40, 332, 720, 40, D.n1);
      R(g, 340, 310, 74, 10, D.n2); R(g, 340, 310, 74, 1, D.n4); for (let k = 0; k < 3; k++) for (let i = 0; i < 12; i++) R(g, 343 + i * 6, 312 + k * 3, 5, 2, D.n3);
      R(g, 424, 312, 8, 6, D.n3); R(g, 424, 312, 8, 1, D.n4);
      R(g, 200, 306, 12, 13, mix(D.cream, D.n6, 0.3)); R(g, 212, 309, 3, 6, mix(D.cream, D.n6, 0.3)); R(g, 201, 307, 10, 2, mix(D.rust[2], D.n1, 0.5));
      for (let i = 0; i < 3; i++) { const k = frac(t * 0.5 + i / 3); A(g, 0.35 * (1 - k), () => R(g, 204 + Math.round(Math.sin(k * 6 + i) * 2), 302 - k * 16, 2, 3, D.n6)); }
      R(g, 476, 304, 46, 20, D.paper); R(g, 476, 304, 46, 1, D.cream); R(g, 494, 302, 10, 4, D.n4); for (let k = 0; k < 4; k++) R(g, 480, 310 + k * 3, 30 - k * 4, 1, mix(D.ink, D.paper, 0.5));
      // stimulus monitor (left)
      const S0x = 60, S0y = 212;
      R(g, S0x - 6, S0y - 6, 122, 82, D.n2); R(g, S0x - 6, S0y - 6, 122, 1, D.n4); R(g, S0x + 50, S0y + 76, 10, 10, D.n2); R(g, S0x + 36, S0y + 85, 38, 3, D.n3);
      R(g, S0x, S0y, 110, 70, mix(D.n1, D.steel[2], 0.25 + 0.2 * sig));
      if (sig > 0) A(g, sig, () => stimIcon(g, S0x + 50, S0y + 33, 18));
      else if (PX.blink(t, 1.6, 0.6)) R(g, S0x + 53, S0y + 33, 4, 4, mix(D.n5, D.steel[1], 0.3));
      R(g, S0x + 4, S0y + 4, 22, 3, mix(D.n3, D.steel[2], 0.4)); R(g, S0x + 4, S0y + 62, 102, 2, mix(D.n3, D.steel[2], 0.4));
      if (sig > 0) R(g, S0x + 4, S0y + 62, Math.round(102 * clamp((t - tG) / 3, 0, 1)), 2, mix(D.amber[1], D.n4, 0.3));
      PX.glow(g, S0x + 55, S0y + 35, 70, D.steel[0], 0.08 + 0.08 * sig);
      // brain monitor (right)
      const Mx = 378, My = 180, Mw = 210, Mh = 112;
      R(g, Mx - 7, My - 7, Mw + 14, Mh + 14, D.n2); R(g, Mx - 7, My - 7, Mw + 14, 1, D.n4); R(g, Mx + Mw + 5, My - 6, 2, Mh + 12, D.n1);
      R(g, Mx + Mw / 2 - 6, My + Mh + 7, 12, 8, D.n2); R(g, Mx + Mw / 2 - 24, My + Mh + 14, 48, 3, D.n3);
      R(g, Mx, My, Mw, Mh, mix(D.n0, D.steel[2], 0.12));
      R(g, Mx, My, Mw, 7, mix(D.n2, D.steel[2], 0.3)); for (let k = 0; k < 5; k++) R(g, Mx + 4 + k * 14, My + 2, 10, 3, mix(D.n4, D.steel[2], 0.3)); R(g, Mx + Mw - 8, My + 2, 4, 3, PX.blink(t, 1, 0.5) ? D.rust[1] : D.n4);
      R(g, Mx + 4, My + 10, 120, 98, D.n0); R(g, Mx + 128, My + 10, 78, 62, D.n0); R(g, Mx + 128, My + 75, 78, 33, D.n0);
      paint(g, sag, SW, SH, Mx + 8, My + 18, BLOBS_S, act, t);
      paint(g, axl, AW, AH, Mx + 135, My + 11, BLOBS_A, act, t);
      const sx = Mx + 8 + Math.round(frac(t / 4) * SW);
      A(g, 0.22, () => R(g, sx, My + 12, 1, 94, D.teal[0]));
      A(g, 0.35, () => { R(g, Mx + 8 + SW / 2 + 8, My + 12, 1, 4, D.moss[0]); R(g, Mx + 8 + SW / 2 + 8, My + 100, 1, 4, D.moss[0]); });
      let prev = null;
      for (let i = 0; i < 70; i++) {
        const tt = t - (69 - i) * 0.07, a2 = P(tt, tL, 1.4, "out"), y2 = My + 100 - Math.round(4 + 15 * a2 + Math.sin(tt * 7 + i) * 1.2 * (0.4 + a2));
        const xx = Mx + 132 + i;
        if (prev !== null) PX.line(g, xx - 1, prev, xx, y2, a2 > 0.15 ? D.amber[1] : mix(D.teal[0], D.n5, 0.4));
        prev = y2;
      }
      R(g, Mx + 132, My + 102, 70, 1, D.n3);
      if (sig > 0) A(g, sig, () => R(g, Mx + 132 + Math.max(0, 69 - Math.round((t - tG) / 0.07)), My + 79, 1, 24, mix(D.cream, D.n5, 0.5)));
      PX.glow(g, Mx + 70, My + 60, 150, D.steel[0], 0.07);
      PX.glow(g, Mx + 60, My + 58, 120, D.amber[1], 0.1 * act);
      PX.glow(g, Mx + 100, 312, 120, act > 0 ? D.amber[2] : D.steel[1], 0.08 + 0.06 * act);
      // operator in a chair (back view), leans toward the brain monitor when it lights
      const lean = P(t, tL + 0.3, 0.8, "io"), ox = 270 + Math.round(5 * lean), oy = 244 + Math.round(2 * lean);
      operator(g, ox, oy, t, lean);
      PX.particles(g, 33, 18, t, [120, 40, 400, 180], { vy: -1, vx: 0.6, col: D.steel[0], a: 0.25, tw: 1.1 });
      PX.vignette(g, 0.55);
    };
  };
  // "math is coming" symbol: a clock face with a small plus badge
  const stimIcon = (g, x, y, r) => {
    x = Math.round(x); y = Math.round(y);
    const ln = D.cream;
    PX.circle(g, x, y, r, ln); PX.circle(g, x, y, Math.max(1, r - Math.max(1, Math.round(r / 7))), mix(D.n1, D.steel[2], 0.4));
    if (r > 8) for (let i = 0; i < 12; i += 3) { const a = (i / 12) * TAU; R(g, x + Math.round(Math.cos(a) * (r - 4)), y + Math.round(Math.sin(a) * (r - 4)), 1, 1, ln); }
    PX.line(g, x, y, x, y - Math.round(r * 0.65), ln); PX.line(g, x, y, x + Math.round(r * 0.45), y, ln);
    const bx = x + Math.round(r * 0.95), by = y + Math.round(r * 0.75), br = Math.max(3, Math.round(r * 0.5)), bw = Math.max(1, Math.round(br / 3));
    PX.circle(g, bx, by, br + 1, mix(D.n1, D.steel[2], 0.4)); PX.circle(g, bx, by, br, D.amber[1]);
    R(g, bx - br + 2, by - Math.floor(bw / 2), 2 * br - 3, bw, D.n1); R(g, bx - Math.floor(bw / 2), by - br + 2, bw, 2 * br - 3, D.n1);
  };
  // seated operator seen from behind in an office chair, shoulder centre (x, y)
  const operator = (g, x, y, t, lean) => {
    const scr = mix(D.steel[2], D.n2, 0.3), sL = mix(scr, D.steel[0], 0.3), sD = mix(scr, D.n0, 0.4), hair = mix(D.n2, D.n4, 0.5), sk = mix(D.lampD, D.rust[2], 0.3);
    const br = Math.round(Math.sin(t * 1.6) * 0.6);
    // torso: rounded shoulders tapering to the waist
    for (let r = 0; r < 70; r++) { const w = r < 3 ? 17 + r * 2 : r < 30 ? 23 : 23 - Math.round((r - 30) * 0.12); R(g, x - w, y + r + br, 2 * w, 1, scr); R(g, x - w, y + r + br, 4, 1, sD); R(g, x + w - 3, y + r + br, 3, 1, sL); }
    R(g, x - 20, y + br, 30, 1, sL); R(g, x - 1, y + 6, 1, 26, sD);
    // arms toward the keyboard
    R(g, x + 20, y + 8 + br, 8, 34, scr); R(g, x + 25, y + 8 + br, 3, 34, sL); R(g, x - 28, y + 8 + br, 8, 32, sD);
    // chair back in front of the lower torso
    const cb = mix(D.n2, D.n1, 0.3);
    R(g, x - 20, y + 34, 40, 46, cb); R(g, x - 19, y + 33, 38, 1, D.n3); R(g, x - 20, y + 34, 2, 46, D.n3); R(g, x + 18, y + 34, 2, 46, D.n0);
    for (let k = 0; k < 4; k++) R(g, x - 15, y + 40 + k * 9, 30, 1, mix(cb, D.n3, 0.4));
    R(g, x - 3, y + 80, 6, 20, D.n2);
    // neck + head (turns slightly toward the right monitor)
    R(g, x - 5, y - 7, 10, 9, mix(sk, D.n0, 0.35));
    const hx2 = x + Math.round(lean * 2);
    PX.circle(g, hx2, y - 19, 13, hair); PX.circle(g, hx2 - 2, y - 22, 10, mix(hair, D.n5, 0.35)); PX.circle(g, hx2, y - 20, 10, hair);
    R(g, hx2 - 14, y - 19, 3, 7, mix(sk, D.n0, 0.4)); R(g, hx2 + 12, y - 19, 3, 7, mix(sk, D.amber[1], 0.12 * lean));
    R(g, hx2 + 7, y - 31, 6, 2, mix(hair, D.steel[0], 0.35)); R(g, hx2 + 12, y - 26, 2, 8, mix(hair, lean > 0.3 ? D.amber[1] : D.steel[0], 0.3));
    R(g, x + 16, y - 1 + br, 7, 3, mix(scr, D.steel[0], 0.4));
  };

  // shared classroom seen from the front (the back wall behind the students): windows, cork board, shelves, clock.
  // haze 0..1 pushes it out of focus for close shots
  const exRoom = (g, t, c, haze, row) => {
    PX.par(g, c, 0.35, () => {
      PX.vgrad(g, -40, -40, 720, 280, mix(D.paper, D.n4, 0.55), mix(D.paperD, D.n3, 0.55), 6);
      R(g, -40, 196, 720, 50, mix(D.moss[2], D.n3, 0.45)); R(g, -40, 196, 720, 2, mix(D.moss[1], D.n4, 0.45));
      for (const wx of [-10, 106]) {
        R(g, wx, 34, 80, 140, mix(D.n3, D.paperD, 0.3)); PX.vgrad(g, wx + 4, 38, 72, 132, mix(D.cream, D.steel[0], 0.25), mix(D.lamp, D.cream, 0.5), 5);
        for (const [cx, cy, r] of [[wx + 20, 150, 12], [wx + 34, 142, 14], [wx + 52, 152, 12], [wx + 66, 146, 10], [wx + 12, 164, 10], [wx + 44, 164, 12]]) { PX.circle(g, cx, cy + 2, r, mix(D.moss[2], D.paperD, 0.35)); PX.circle(g, cx - 1, cy, r - 2, mix(D.moss[1], D.cream, 0.35)); }
        for (let k = 1; k < 3; k++) R(g, wx + 4 + k * 24, 38, 2, 132, mix(D.n4, D.paperD, 0.3)); for (let k = 1; k < 4; k++) R(g, wx + 4, 38 + k * 33, 72, 2, mix(D.n4, D.paperD, 0.3));
        R(g, wx - 4, 172, 88, 4, mix(D.paperD, D.n4, 0.2));
      }
      // cork board with pinned sheets
      R(g, 236, 62, 170, 96, mix(D.amber[2], D.n2, 0.45)); R(g, 240, 66, 162, 88, mix(D.rust[2], D.amber[2], 0.55));
      for (const [px, py, pw, ph, col] of [[248, 72, 30, 38, D.cream], [284, 76, 34, 26, mix(D.teal[0], D.cream, 0.5)], [324, 70, 26, 36, D.cream], [356, 78, 38, 28, mix(D.amber[0], D.cream, 0.5)], [252, 116, 40, 30, mix(D.rose[0], D.cream, 0.4)], [300, 110, 30, 36, D.cream], [340, 114, 52, 30, D.cream]]) {
        R(g, px + 1, py + 1, pw, ph, mix(D.rust[2], D.n1, 0.4)); R(g, px, py, pw, ph, mix(col, D.paperD, 0.25)); R(g, px + pw / 2 - 1, py, 2, 2, D.rust[1]);
        for (let l = 0; l < ph / 6 - 1; l++) R(g, px + 3, py + 6 + l * 5, pw - 7 - ((l * 5) % 9), 1, mix(D.ink, D.paper, 0.6));
      }
      // shelves with books, a globe
      R(g, 430, 120, 150, 76, wood(0.45)[2]); for (const sy of [120, 146, 172]) R(g, 430, sy, 150, 3, wood(0.45)[1]);
      let bx = 436; for (let i = 0; i < 22; i++) { const w = 4 + (i * 3) % 4, h = 14 + (i * 7) % 8, cc = [D.rust[2], D.steel[2], D.moss[2], D.paperD, D.teal[2], D.amber[2]][i % 6], sy = i < 11 ? 146 : 172; if (i === 11) bx = 436; R(g, bx, sy - h, w, h, mix(cc, D.n3, 0.35)); R(g, bx, sy - h, 1, h, mix(cc, D.n6, 0.3)); bx += w + 1; }
      PX.circle(g, 548, 108, 9, mix(D.teal[1], D.n4, 0.3)); R(g, 544, 104, 6, 3, mix(D.moss[1], D.n4, 0.3)); R(g, 546, 117, 4, 3, D.n3);
      wallClock(g, 492, 72, 14, 10 * 3600 + 12 * 60 + t, {});
      R(g, 600, 30, 60, 210, mix(D.paperD, D.n4, 0.65));
    });
    PX.par(g, c, 0.6, () => {
      const wd = wood(0.5);
      for (const [x, i] of [[60, 0], [190, 1], [460, 2], [585, 3]]) {
        const v = { skin: SKINS()[i % 5], hair: HAIRS()[(i + 2) % 6], top: TOPS()[(i * 3 + 1) % 8], hs: i % 2 ? "long" : "", ph: i };
        kidF(g, x, 206, 0.7, v, t, 1);
        R(g, x - 22, 204, 44, 5, wd[1]); R(g, x - 22, 204, 44, 1, wd[0]); R(g, x - 20, 209, 3, 30, wd[2]); R(g, x + 17, 209, 3, 30, wd[2]);
        R(g, x - 8, 203, 14, 2, mix(D.paper, D.n6, 0.2));
      }
      R(g, -40, 239, 720, 130, mix(wood(0.62)[1], D.n2, 0.3));
      for (let k = 0; k < 6; k++) R(g, -40, 244 + k * k * 3, 720, 1, mix(wood(0.62)[2], D.n2, 0.3));
      if (row) row(g);
    });
    if (haze > 0) A(g, haze, () => R(g, -40, -40, 720, 440, mix(D.paperD, D.n3, 0.45)));
    A(g, 0.07, () => { poly(g, [[0, 40], [76, 40], [300, 360], [130, 360]], D.lamp); poly(g, [[110, 40], [180, 40], [420, 360], [270, 360]], D.lamp); });
    dust(g, 41, 34, t, [40, 60, 340, 260], D.lamp, 0.4);
  };

  // ======================= waiting =======================
  // a school corridor: the learner on a bench outside the exam room watches the clock; a storm cloud of dread grows
  // over their head (o.dread 0.5). At o.doing (5.0) the view slides into the exam room: a closer shot, working calmly,
  // the cloud breaks up and is gone.
  K.waiting = (o) => {
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 9), tD = T("dread", 0.5), tW = T("doing", 5.0);
      const k = P(t, tW, 0.9, "io"), grow = P(t, tD, 3.6, "out");
      const v = LRN();
      R(g, 0, 0, 640, 360, D.n1);
      // ---------------- corridor ----------------
      if (k < 1) {
        g.save(); g.translate(Math.round(-640 * k), 34);
        PX.par(g, c, 0.4, () => {
          const VX = 92;
          PX.vgrad(g, 30, 50, 130, 200, mix(D.n4, D.steel[2], 0.25), mix(D.n3, D.steel[2], 0.15), 5);
          poly(g, [[30, 212], [160, 212], [104, 166], [80, 166]], mix(D.n4, D.steel[1], 0.25));
          poly(g, [[30, 50], [160, 50], [104, 134], [80, 134]], mix(D.n3, D.steel[2], 0.2));
          R(g, 80, 134, 24, 32, mix(D.cream, D.steel[0], 0.35)); PX.glow(g, 92, 150, 50, D.steel[0], 0.22);
          R(g, 91, 134, 1, 32, mix(D.n6, D.steel[1], 0.3)); R(g, 80, 149, 24, 1, mix(D.n6, D.steel[1], 0.3));
          for (const z of [0.25, 0.5, 0.75]) { const y2 = lerp(50, 134, z * z), w2 = lerp(64, 10, z); R(g, VX - w2 / 2, y2 + 2, w2, 2, mix(D.cream, D.steel[0], 0.4)); }
          for (const z of [0.2, 0.45, 0.7]) { const x0 = lerp(30, 80, z), y0 = lerp(70, 140, z), h2 = lerp(90, 20, z); R(g, x0, y0, Math.max(2, 10 * (1 - z)), h2, mix(D.steel[2], D.n3, 0.3)); }
          A(g, 0.1, () => poly(g, [[80, 166], [104, 166], [150, 212], [40, 212]], D.steel[0]));
        });
        PX.par(g, c, 0.8, () => {
          const up = mix(D.paperD, D.n4, 0.55), lo = mix(D.teal[2], D.n3, 0.35);
          R(g, -40, -40, 70, 292, up); R(g, 160, -40, 520, 292, up);
          R(g, -40, -80, 720, 110, mix(D.n3, D.n2, 0.4)); R(g, -40, 30, 720, 2, mix(D.n4, D.paperD, 0.2));
          R(g, -40, 150, 70, 102, lo); R(g, 160, 150, 520, 102, lo); R(g, -40, 148, 70, 3, mix(D.n5, D.paperD, 0.25)); R(g, 160, 148, 520, 3, mix(D.n5, D.paperD, 0.25));
          R(g, -40, 246, 720, 6, mix(D.n2, D.teal[2], 0.3));
          R(g, 24, 44, 6, 208, mix(D.n4, D.paperD, 0.3)); R(g, 160, 44, 6, 208, mix(D.n3, D.paperD, 0.2)); R(g, 24, 44, 142, 6, mix(D.n4, D.paperD, 0.3));
          // fluorescent tubes (one flickers)
          for (const [lx, fl] of [[60, 0], [250, 0], [430, 1], [600, 0]]) {
            const on = fl ? (PX.blink(t, 2.3, 0.82) || PX.blink(t + 0.1, 0.13, 0.5) ? 1 : 0.45) : 1;
            R(g, lx - 30, 14, 60, 6, D.n2); R(g, lx - 28, 19, 56, 2, mix(D.n4, D.cream, 0.6 * on));
            PX.glow(g, lx, 24, 90, D.cream, 0.07 * on);
          }
          for (let i = 0; i < 4; i++) {
            const lx = 176 + i * 24, col = mix(D.steel[2], D.n3, 0.2 + (i % 2) * 0.06);
            R(g, lx, 92, 23, 156, col); R(g, lx, 92, 23, 1, mix(D.steel[1], D.n5, 0.4)); R(g, lx, 92, 1, 156, mix(D.steel[1], D.n4, 0.3)); R(g, lx + 22, 92, 1, 156, D.n2);
            for (let k2 = 0; k2 < 4; k2++) R(g, lx + 6, 100 + k2 * 3, 11, 1, D.n2);
            R(g, lx + 17, 160, 2, 8, mix(D.n6, D.steel[0], 0.3)); R(g, lx + 4, 236, 15, 1, D.n2);
          }
          R(g, 174, 88, 100, 4, mix(D.n3, D.steel[2], 0.25));
          R(g, 548, 70, 80, 58, mix(D.rust[2], D.amber[2], 0.5)); R(g, 548, 70, 80, 2, wood(0.3)[0]); R(g, 548, 126, 80, 2, wood(0.3)[2]);
          for (const [px, py, pw, ph] of [[554, 76, 22, 28], [580, 78, 20, 18], [604, 74, 18, 26], [582, 100, 24, 20]]) {
            R(g, px, py, pw, ph, mix(D.paper, D.n6, 0.25)); R(g, px + pw, py + 1, 1, ph, D.n2); R(g, px + pw / 2 - 1, py, 2, 2, D.rust[1]);
            for (let l = 0; l < ph / 5 - 1; l++) R(g, px + 3, py + 5 + l * 4, pw - 6 - ((l * 5) % 7), 1, mix(D.ink, D.paper, 0.55));
          }
          // door to the exam room (window lit warm: heads of students inside)
          const dX = 452;
          R(g, dX - 4, 112, 86, 140, mix(D.n3, D.paperD, 0.2)); R(g, dX, 116, 78, 136, wood(0.4)[1]); R(g, dX, 116, 78, 1, wood(0.4)[0]); R(g, dX + 76, 116, 2, 136, wood(0.4)[2]);
          R(g, dX + 18, 128, 42, 34, D.n2); R(g, dX + 20, 130, 38, 30, mix(D.lamp, D.paper, 0.4));
          for (let i = 0; i < 3; i++) { const hx3 = dX + 26 + i * 13; R(g, hx3 - 4, 150, 9, 10, mix(D.lampD, D.n3, 0.45)); PX.circle(g, hx3, 145, 3, mix(D.n2, D.lampD, 0.3)); }
          R(g, dX + 20, 157, 38, 3, mix(D.rust[2], D.n3, 0.3));
          PX.glow(g, dX + 39, 145, 30, D.lamp, 0.18);
          R(g, dX + 64, 186, 8, 3, mix(D.n6, D.lampD, 0.4)); R(g, dX + 64, 189, 3, 4, mix(D.n5, D.lampD, 0.3));
          R(g, dX + 22, 170, 34, 9, mix(D.paper, D.cream, 0.4)); R(g, dX + 22, 178, 34, 1, D.paperD);
          PX.text(g, "EXAM", dX + 39, 171, { font: "p", size: 8, col: D.ink, align: "center" });
          wallClock(g, dX + 39, 84, 15, 9 * 3600 + 58 * 60 + t, { rim: D.n2 });
          const by = 226;
          A(g, 0.4, () => R(g, 270, 250, 160, 4, BLK));
          R(g, 276, by - 2, 148, 7, wood(0.35)[1]); R(g, 276, by - 2, 148, 1, wood(0.35)[0]); R(g, 276, by + 5, 148, 1, wood(0.35)[2]);
          for (const lx of [284, 410]) { R(g, lx, by + 6, 4, 20, D.n2); R(g, lx, by + 6, 1, 20, D.n3); }
          R(g, 396, by - 18, 18, 16, mix(D.rust[2], D.n2, 0.3)); R(g, 396, by - 18, 18, 2, mix(D.rust[1], D.n3, 0.4)); R(g, 399, by - 12, 12, 7, mix(D.rust[2], D.n1, 0.5)); R(g, 402, by - 22, 6, 4, mix(D.rust[2], D.n2, 0.4));
        });
        // floor
        PX.vgrad(g, -40, 252, 720, 120, mix(D.n4, D.teal[2], 0.15), mix(D.n2, D.teal[2], 0.1), 5);
        for (let k2 = 0; k2 < 5; k2++) R(g, -40, 262 + k2 * k2 * 4, 720, 1, mix(D.n3, D.teal[2], 0.2));
        A(g, 0.12, () => { ell(g, 92, 268, 40, 5, D.steel[0]); ell(g, 490, 266, 40, 4, D.lamp); });
        // the learner on the bench
        const sx = 344, sy = 186, bounce = Math.round(Math.abs(Math.sin(t * 13)) * 1.6 * (0.3 + 0.7 * grow));
        const [pL, pa, pD] = sh3(v.pants);
        A(g, 0.4, () => ell(g, sx, 253, 22, 2, BLK));
        R(g, sx - 15, sy + 38, 30, 6, pa); R(g, sx - 15, sy + 38, 30, 1, pL);
        R(g, sx - 14, sy + 41, 12, 7, pa); R(g, sx - 14, sy + 41, 12, 1, pL); R(g, sx - 3, sy + 42, 2, 6, pD);
        R(g, sx - 13, sy + 48, 9, 17, pD); R(g, sx - 13, sy + 48, 2, 17, pa);
        R(g, sx - 15, sy + 64, 12, 4, D.n1); R(g, sx - 15, sy + 64, 12, 1, D.n4); R(g, sx - 15, sy + 67, 12, 1, mix(D.cream, D.n5, 0.5));
        R(g, sx + 2, sy + 41 - bounce, 12, 7, pa); R(g, sx + 2, sy + 41 - bounce, 12, 1, pL); R(g, sx + 12, sy + 42 - bounce, 2, 6, pD);
        R(g, sx + 4, sy + 48 - bounce, 9, 17, pD); R(g, sx + 4, sy + 48 - bounce, 2, 17, pa);
        R(g, sx + 3, sy + 64 - bounce, 12, 4, D.n1); R(g, sx + 3, sy + 64 - bounce, 12, 1, D.n4); R(g, sx + 3, sy + 67 - bounce, 12, 1, mix(D.cream, D.n5, 0.5));
        torsoF(g, sx, sy, v, 40);
        armF(g, sx - 17, sy + 28, sx - 3, sy + 40, v); armF(g, sx + 17, sy + 28, sx + 3, sy + 40, v);
        R(g, sx - 1 + Math.round(Math.sin(t * 6)), sy + 36, 2, 2, mix(v.skin, D.cream, 0.2));
        const glance = frac(t / 3.1) > 0.82;
        headF(g, sx, sy - 25, v, t >= tD ? "worry" : "focus", glance ? [0, 0] : [1, -1], t, 0.3);
        if (t >= tD) cloud(g, sx + 4, sy - 50 - 10 * grow, lerp(0.3, 1.45, grow), t, 0);
        // near: plant at the left and a pillar edge at the right
        PX.par(g, c, 1.15, () => {
          R(g, 4, 280, 34, 52, mix(D.n2, D.rust[2], 0.25)); R(g, 2, 278, 38, 4, mix(D.n3, D.rust[2], 0.25)); R(g, 4, 282, 34, 1, D.n1);
          for (let i = 0; i < 11; i++) { const a = -2.5 + i * 0.2 + Math.sin(t * 0.8 + i) * 0.03, l = 40 + (i % 3) * 12; seg(g, 21, 280, 21 + Math.cos(a) * l, 280 + Math.sin(a) * l, 4, i % 2 ? mix(D.moss[2], D.n1, 0.4) : mix(D.moss[2], D.n2, 0.15)); }
          R(g, 618, -40, 30, 400, mix(D.n2, D.paperD, 0.15)); R(g, 618, -40, 2, 400, mix(D.n4, D.paperD, 0.25));
        });
        dust(g, 21, 18, t, [40, 60, 560, 180], D.cream, 0.18);
        g.restore();
      }
      // ---------------- exam room: closer shot ----------------
      if (k > 0) {
        g.save(); g.translate(Math.round(640 * (1 - k)), 0);
        exRoom(g, t, c, 0.35);
        workingLearner(g, t, v, "focus", (gg, x, y) => {
          bigSheet(gg, x - 46, y - 56, 92, 48, clamp((t - tW) / 3.5, 0.08, 1), t);
          R(gg, x - 140, y - 46, 70, 4, mix(D.steel[2], D.n2, 0.2)); R(gg, x - 140, y - 46, 70, 1, mix(D.steel[1], D.n4, 0.3));   // pencil case
          R(gg, x + 84, y - 50, 48, 36, mix(D.paper, D.paperD, 0.4)); R(gg, x + 86, y - 48, 48, 36, D.paper);   // spare sheets
        }, [[-30, -40], [12 + Math.round(Math.sin(t * 2.2) * 14), -28 + Math.round(frac(t / 1.4) * 10)]], [false, true]);
        const brk = P(t, tW + 0.2, 1.8, "io");
        if (t >= tD) cloud(g, 330, 54, lerp(0.3, 1.45, grow), t, brk, { norain: true });
        PX.vignette(g, 0.5);
        g.restore();
      }
      if (k < 1) PX.vignette(g, 0.58 * (1 - k));
    };
  };
  // big learner at a big desk (close shot): head, torso, desk (content), forearms to hand offsets from (x, deskNear)
  const workingLearner = (g, t, v, ex, content, hands, pens, o) => {
    o = o || {};
    const x = 320, y = 290, hy = 112 + (o.dy || 0), br = Math.round(Math.sin(t * 1.5) * 0.7), ely = y - 58;
    bigTorso(g, x, hy + 50, v, ely, br);
    bigHead(g, x, hy + br + (ex === "focus" || ex === "write" ? 2 : 0), v, ex, o.look || [0, 0], t, 0.4);
    bigDesk(g, x, y, (gg) => content(gg, x, y));
    bigArm(g, x - 40, ely, x + hands[0][0], y + hands[0][1], v, pens[0], -1);
    bigArm(g, x + 40, ely, x + hands[1][0], y + hands[1][1], v, pens[1], 1);
  };

  // ======================= mental_desk =======================
  // a big head in profile with the skull cut away: a small wooden desk floats inside in warm lamp light. o.cards (0.5):
  // six symbol cards land neatly; o.label (1.0): a hanging sign "WORKING MEMORY"; o.worry (3.5): crumpled worry notes
  // drop in one after another and push the cards off the edge.
  K.mental_desk = (o) => {
    const N = 6, NW = 9;
    const DX = 236, DW = 240, DY = 204;   // desk near edge
    const slotX = (i) => DX + 13 + i * 36;
    const HIT = [2, 4, 0, 5, 1, 3, -1, -1, -1];
    const LAND = [[slotX(2) + 14, 0], [slotX(4) + 14, 0], [slotX(0) + 14, 0], [slotX(5) + 14, 0], [slotX(1) + 14, 0], [slotX(3) + 14, 0], [slotX(2) + 30, 1], [slotX(0) + 30, 1], [slotX(4) + 30, 1]];
    const GLY = [
      ["...##...", "...##...", "...##...", "########", "########", "...##...", "...##...", "...##..."],
      ["##....##", ".##..##.", "..####..", "...##...", "..####..", ".##..##.", "##....##", "........"],
      ["........", "########", "########", "........", "........", "########", "########", "........"],
      ["...##...", "...##...", "........", "########", "########", "........", "...##...", "...##..."],
      ["........", "........", "........", "########", "########", "........", "........", "........"],
      ["##....##", ".##..##.", "..####..", "...##...", "...##...", "..##....", ".##.....", "##......"],
    ];
    // head in profile facing right (top cropped by the frame), neck, cut-away cranium
    const HEAD = [[350, 362], [344, 312], [290, 300], [250, 290], [206, 262], [180, 210], [170, 150], [178, 90], [204, 36], [244, -4], [300, -30], [380, -36], [450, -20], [500, 14], [526, 56], [536, 100],
      [540, 128], [542, 142], [536, 152], [540, 164], [556, 188], [552, 194], [542, 197], [545, 206], [539, 211], [543, 218], [536, 226], [540, 244], [528, 262], [488, 276], [460, 284], [454, 362]];
    const FACE0 = 15;   // HEAD index where the face profile starts (forehead)
    const HAIR = [[300, 300], [250, 290], [206, 262], [180, 210], [170, 150], [178, 90], [204, 36], [244, -4], [300, -30], [380, -36], [450, -20], [500, 14], [526, 56], [532, 78],
      [500, 44], [440, 14], [370, 6], [300, 14], [244, 44], [214, 96], [204, 150], [212, 206], [240, 252], [290, 284]];
    // smooth, slightly irregular opening (rounded-rect-ish superellipse)
    const CUT = [...Array(56)].map((_, i) => {
      const a = (i / 56) * TAU, ca = Math.cos(a), sa = Math.sin(a), e = 0.8;
      const rr = 1 + 0.025 * Math.sin(a * 3 + 1) + 0.015 * Math.sin(a * 7);
      return [360 + Math.sign(ca) * Math.pow(Math.abs(ca), e) * 150 * rr, 128 + Math.sign(sa) * Math.pow(Math.abs(sa), e) * 108 * rr];
    });
    const grow = (pts, k) => pts.map(([x, y]) => [360 + (x - 360) * k, 130 + (y - 130) * k]);
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 10), tC = T("cards", 0.5), tLb = T("label", 1.0), tW = T("worry", 3.5);
      const gap = Math.max(0.35, 0.68 * d / 10);
      const bob = Math.round(Math.sin(t * 1.1) * 1.5);
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: dark warm backdrop with faint bokeh ----
      PX.par(g, c, 0.3, () => {
        PX.vgrad(g, -40, -40, 720, 440, mix(D.n3, D.steel[2], 0.25), mix(D.n2, D.steel[2], 0.15), 8);
        for (let i = 0; i < 12; i++) A(g, 0.05, () => PX.circle(g, -20 + hash(i, 1) * 680, hash(i, 2) * 360, 12 + hash(i, 3) * 26, mix(D.n3, D.lampD, 0.35)));
      });
      // ---- the head: dark profile, rim-lit face, curly hair, the cut-away skull ----
      PX.par(g, c, 0.65, () => {
        const sk = mix(D.lampD, D.rust[2], 0.42), skB = mix(sk, D.n0, 0.5), skM = mix(sk, D.n0, 0.3), rim = mix(sk, D.lamp, 0.35), hair = mix(D.n1, D.rust[2], 0.2), hairL = mix(hair, D.paperD, 0.32);
        // shoulders (teal sweater) + neck
        poly(g, [[120, 380], [170, 342], [300, 326], [470, 326], [600, 350], [640, 380]], mix(D.teal[2], D.n2, 0.3));
        poly(g, [[170, 342], [300, 326], [470, 326], [520, 334], [300, 338]], mix(D.teal[1], D.n2, 0.35));
        poly(g, [[296, 326], [460, 326], [446, 342], [312, 342]], mix(D.teal[2], D.n1, 0.4));
        poly(g, HEAD, skB);
        // soft key light down the face side, rim along the profile
        const face = HEAD.slice(FACE0, HEAD.length - 1);
        clipPoly(g, HEAD, () => { PX.glow(g, 530, 190, 90, D.lampD, 0.14); PX.glow(g, 520, 120, 60, D.lampD, 0.08); });
        poly(g, [[344, 304], [400, 292], [460, 284], [456, 330], [348, 330]], mix(skB, D.n0, 0.3));   // shadow under the jaw        for (let i = 0; i < face.length - 1; i++) { const [ax, ay] = face[i], [bx, by] = face[i + 1]; PX.line(g, ax - 1, ay, bx - 1, by, rim); }
        R(g, 516, 142, 12, 2, mix(skB, D.n0, 0.45)); R(g, 518, 144, 7, 1, mix(rim, D.cream, 0.15)); R(g, 514, 134, 14, 2, hair);   // closed eye, lash, brow
        R(g, 530, 214, 8, 1, mix(skB, D.rust[2], 0.35)); R(g, 524, 236, 10, 1, mix(skB, D.n0, 0.3)); R(g, 536, 176, 2, 12, mix(rim, skM, 0.5));
        poly(g, [[454, 284], [460, 284], [456, 330], [452, 330]], mix(skB, D.n0, 0.25));
        // curly hair: a dark mass over the crown and the back, a bumpy curl silhouette with lit tops
        poly(g, HAIR, hair);
        for (let i = 0; i < 90; i++) {
          const k = i / 89, n = 13, idx = Math.min(n - 1, Math.floor(k * n)), [ax, ay] = HAIR[idx], [bx, by] = HAIR[idx + 1], f = k * n - idx;
          const x = lerp(ax, bx, f) + (hash(i, 1) - 0.5) * 6, y = lerp(ay, by, f) + (hash(i, 2) - 0.5) * 6, r = 6 + Math.floor(hash(i, 3) * 4);
          PX.circle(g, x, y, r, hair);
          if (i % 2 === 0) { R(g, x - 3, y - r + 1, 4, 1, hairL); R(g, x - 4, y - r + 2, 1, 2, hairL); }
        }
        for (let i = 0; i < 40; i++) { const x = 200 + hash(i, 7) * 300, y = 4 + hash(i, 8) * 70; R(g, x, y, 3, 1, mix(hair, hairL, 0.6)); R(g, x - 1, y + 1, 1, 1, mix(hair, hairL, 0.6)); }
        // bone rim + interior
        poly(g, grow(CUT, 1.05), mix(D.paperD, D.n4, 0.45));
        poly(g, grow(CUT, 1.035), mix(D.paper, D.paperD, 0.35));
        poly(g, grow(CUT, 1.018), mix(D.paperD, D.rust[2], 0.25));
        poly(g, CUT, mix(D.n2, D.rust[2], 0.3));
        poly(g, grow(CUT, 0.92), mix(D.n2, D.rust[2], 0.38));
        poly(g, grow(CUT, 0.7).map(([x, y]) => [x - 26, y - 4]), mix(D.n3, D.rust[2], 0.4));
        clipPoly(g, CUT, () => {
          PX.glow(g, 300, 130, 170, D.lampD, 0.2);
          for (let i = 0; i < 7; i++) A(g, 0.13, () => { const yy = 44 + i * 28; for (let x = 210; x < 512; x += 2) R(g, x, yy + Math.round(Math.sin(x * 0.045 + i * 1.3) * 7), 2, 1, mix(D.rose[2], D.lampD, 0.3)); });
        });
      });
      // ---- inside the cut-away: sign, lamp, desk, cards, worries ----
      clipPoly(g, CUT, () => {
        const wd = wood(0.22), y = DY + bob;
        A(g, 0.32, () => ell(g, DX + DW / 2, 232, 96, 4, BLK));
        const drawSign = () => {
          if (t < tLb) return;
          const k = P(t, tLb, 0.7, "back"), sw = Math.sin(t * 1.4) * 1.5 * (1 - 0.5 * k), sy2 = Math.round(lerp(10, 50, k)), sx2 = 360 + Math.round(sw);
          A(g, clamp((t - tLb) / 0.2, 0, 1), () => {
            PX.line(g, sx2 - 50, 10, sx2 - 50, sy2, mix(D.paperD, D.n4, 0.3)); PX.line(g, sx2 + 50, 10, sx2 + 50, sy2, mix(D.paperD, D.n4, 0.3));
            R(g, sx2 - 64, sy2 + 3, 130, 24, BLK); R(g, sx2 - 66, sy2, 132, 24, wd[2]); R(g, sx2 - 65, sy2 + 1, 130, 22, wd[1]); R(g, sx2 - 65, sy2 + 1, 130, 1, wd[0]);
            R(g, sx2 - 51, sy2 - 1, 3, 3, D.n4); R(g, sx2 + 49, sy2 - 1, 3, 3, D.n4);
            PX.text(g, "WORKING MEMORY", sx2, sy2 + 5, { font: "v", size: 16, col: D.cream, align: "center" });
          });
        };
        PX.glow(g, DX + 34, y - 48, 130, D.lamp, 0.24);
        R(g, DX + 10, y + 4, 6, 24, wd[2]); R(g, DX + DW - 16, y + 4, 6, 24, wd[2]); R(g, DX + 10, y + 4, 2, 24, wd[1]); R(g, DX + DW - 16, y + 4, 2, 24, wd[1]);
        R(g, DX + 30, y + 4, 4, 18, mix(wd[2], D.n0, 0.35)); R(g, DX + DW - 34, y + 4, 4, 18, mix(wd[2], D.n0, 0.35));
        R(g, DX + 16, y + 16, DW - 32, 3, mix(wd[2], D.n0, 0.2));
        poly(g, [[DX + 10, y - 34], [DX + DW - 10, y - 34], [DX + DW, y], [DX, y]], wd[1]);
        for (let k = 0; k < 4; k++) PX.line(g, DX + 12 + k * 3, y - 29 + k * 8, DX + DW - 40 + k * 7, y - 29 + k * 8, mix(wd[1], wd[2], 0.22));
        R(g, DX + 10, y - 34, DW - 20, 1, wd[0]);
        R(g, DX, y, DW, 5, wd[0]); R(g, DX, y + 5, DW, 2, wd[2]);
        // lamp
        const lx = DX + 24;
        R(g, lx - 7, y - 30, 16, 4, D.n2); R(g, lx, y - 58, 2, 29, D.n3); PX.line(g, lx + 1, y - 58, lx + 16, y - 70, D.n3);
        poly(g, [[lx + 8, y - 72], [lx + 26, y - 72], [lx + 31, y - 62], [lx + 3, y - 62]], mix(D.moss[2], D.n2, 0.3)); R(g, lx + 5, y - 62, 24, 1, D.lamp); R(g, lx + 9, y - 71, 10, 1, mix(D.moss[1], D.n3, 0.3));
        A(g, 0.07, () => poly(g, [[lx + 5, y - 62], [lx + 29, y - 62], [lx + 80, y - 6], [lx - 18, y - 6]], D.lamp));
        // cards: land neatly in a row, get pushed off by worries
        const ink = mix(D.ink, D.steel[2], 0.2);
        for (let i = 0; i < N; i++) {
          const t0 = tC + i * 0.22, inK = P(t, t0, 0.45, "out");
          if (t < t0) continue;
          let cx = slotX(i), cy = y - 28, tilt = 0, a = 1;
          const w = HIT.indexOf(i);
          if (w >= 0) {
            const dt = t - (tW + w * gap + 0.55);
            if (dt > 0) {
              // knocked: hops up and out toward the nearer edge, tumbling, then drops off the desk
              const dir = cx + 14 > DX + DW / 2 ? 1 : -1, edge = dir > 0 ? DX + DW + 4 - cx : DX - 32 - cx, u = clamp(dt / 0.45, 0, 1);
              cx += E(u, "out") * edge; cy -= Math.round(Math.sin(u * Math.PI) * 18);
              const fall = Math.max(0, dt - 0.45);
              cy += 140 * fall * fall + 30 * fall; tilt = clamp(u * 0.6 + fall * 3, 0, 1) * dir;
              a = 1 - clamp((fall - 0.5) / 0.3, 0, 1);
            }
          }
          cy -= Math.round((1 - inK) * 36); a *= clamp(inK * 2, 0, 1);
          A(g, a, () => {
            const cw = 30, ch = 22;
            for (const [dxs, dys, col] of [[1, 1, mix(D.paperD, D.n2, 0.55)], [0, 0, null]]) for (let r = 0; r < ch; r++) {
              const off = Math.round(tilt * (r - ch / 2) * 0.9), dd = Math.round(Math.abs(tilt) * r * 0.3);
              R(g, cx + off + dxs, cy + r + dd + dys, cw, 1, col || (r === 0 ? D.cream : r === ch - 1 ? D.paperD : mix(D.cream, D.paper, 0.15)));
            }
            if (Math.abs(tilt) < 0.2) { PX.sprite(g, GLY[i], cx + 11, cy + 7, { "#": ink }); R(g, cx + 2, cy + 2, 4, 1, D.amber[1]); R(g, cx + 2, cy + 3, 1, 2, D.amber[1]); }
          });
        }
        // worries: crumpled grey notes with dark scribbles, dropping in from the top
        for (let w = 0; w < NW; w++) {
          const t0 = tW + w * gap, dt = t - t0; if (dt < 0) continue;
          const [lxw, layer] = LAND[w], fallT = 0.55, ly = y - 20 - layer * 12;
          const yy = dt < fallT ? lerp(24, ly, (dt / fallT) ** 2) : ly - (dt < fallT + 0.14 ? Math.round(Math.sin(((dt - fallT) / 0.14) * Math.PI) * 4) : 0);
          const xx = lxw + (dt < fallT ? Math.round(Math.sin(dt * 9 + w) * 3 * (1 - dt / fallT)) : 0);
          A(g, clamp(dt / 0.1, 0, 1), () => worryBall(g, xx, yy, w, dt < fallT ? dt * 8 : 0));
          if (dt >= fallT && dt < fallT + 0.25) A(g, 1 - (dt - fallT) / 0.25, () => { for (const s of [-1, 1]) R(g, xx + s * (12 + (dt - fallT) * 36), yy + 10, 2, 1, mix(D.paperD, D.n5, 0.3)); });
        }
        drawSign();
        dust(g, 71, 26, t, [220, 30, 280, 200], D.lamp, 0.35);
      });
      PX.vignette(g, 0.6);
    };
  };
  // crumpled worry note ~22 px, centre (x, y)
  const worryBall = (g, x, y, i, spin) => {
    x = Math.round(x); y = Math.round(y);
    // faceted crumpled paper: light facets up-left (lamp side), dark facets down-right, ink scribbles showing through
    const lt = mix(D.paper, D.cream, 0.3), mid = mix(D.paper, D.n6, 0.45), dk = mix(D.paperD, D.n4, 0.55), dd = mix(D.n4, D.n2, 0.4);
    const r = PX.rnd(300 + i), rot = (Math.floor(spin || 0) % 4) * 0.8;
    A(g, 0.35, () => ell(g, x + 1, y + 11, 10, 2, BLK));
    const pts = []; for (let k = 0; k < 10; k++) { const a = (k / 10) * TAU + rot, rr = 9 + r() * 3.5; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.9]); }
    poly(g, pts.map(([px, py]) => [px + 1, py + 1]), dd); poly(g, pts, mid);
    const c0 = [x + (r() - 0.5) * 4, y + (r() - 0.5) * 4];
    for (let k = 0; k < 10; k++) {
      const p1 = pts[k], p2 = pts[(k + 1) % 10], mx = (p1[0] + p2[0]) / 2 - x, my = (p1[1] + p2[1]) / 2 - y, lit = -(mx + my) / 12 + (r() - 0.5) * 0.6;
      if (lit > 0.35) poly(g, [c0, p1, p2], lt); else if (lit < -0.35) poly(g, [c0, p1, p2], dk);
    }
    for (let k = 0; k < 5; k++) { const a = r() * TAU, l = 5 + r() * 5; PX.line(g, c0[0], c0[1], c0[0] + Math.cos(a) * l, c0[1] + Math.sin(a) * l, dk); }
    // dark ink scrawl, irregular per note (never a face)
    const sc = mix(D.n1, D.rust[2], 0.35);
    let qx = x - 6 + Math.floor(r() * 3), qy = y + 3 - Math.floor(r() * 6);
    for (let k = 0; k < 5; k++) { const nx = qx + 2 + Math.floor(r() * 3), ny = y - 4 + Math.floor(r() * 9); PX.line(g, qx, qy, nx, ny, sc); qx = nx; qy = ny; }
  };

  // ======================= phone_apps =======================
  // a phone on a stand on a wooden table at dusk, running a little runner game. o.apps (0.5): a fan of open app cards
  // spreads out behind it, with a paper tag "40 APPS" (o.tag, default apps + 0.8); o.lag (1.5): the game stutters.
  K.phone_apps = (o) => {
    const NC = 13;
    // two accents only (teal, amber) plus neutral greys: no rainbow
    const APPC = () => { const N3 = [D.n7, D.n6, D.n5]; return [D.teal, N3, D.amber, N3, D.teal, D.amber, N3, D.teal, N3, D.amber, D.teal, N3, D.amber]; };
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 5), tA = T("apps", 0.5), tLg = T("lag", 1.5), tT = typeof o.tag === "number" ? o.tag : tA + (0.8 * d) / 5;
      const PXc = 320, TOP = 250;
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: dusk window + room wall ----
      PX.par(g, c, 0.35, () => {
        PX.vgrad(g, -40, -40, 720, 320, mix(D.n2, D.rust[2], 0.15), mix(D.n2, D.n1, 0.4), 6);
        R(g, 380, 30, 230, 170, mix(D.n3, D.rust[2], 0.2));
        PX.vgrad(g, 386, 36, 218, 158, mix(D.steel[2], D.plum[2], 0.3), mix(D.rust[1], D.amber[1], 0.35), 7);
        for (let i = 0; i < 6; i++) { const bx = 386 + i * 38, bh = 30 + hash(i, 4) * 50; R(g, bx, 194 - bh, 34, bh, mix(D.n2, D.plum[2], 0.2)); for (let k = 0; k < 6; k++) if (hash(i, k) > 0.55) R(g, bx + 5 + (k % 3) * 9, 194 - bh + 6 + Math.floor(k / 3) * 9, 3, 3, PX.blink(t + k, 3 + i, 0.92) ? D.lamp : mix(D.n3, D.lampD, 0.3)); }
        R(g, 494, 36, 4, 158, mix(D.n3, D.rust[2], 0.2)); R(g, 386, 112, 218, 3, mix(D.n3, D.rust[2], 0.2)); R(g, 374, 196, 242, 6, mix(D.n4, D.rust[2], 0.2));
        R(g, 40, 92, 170, 5, wood(0.5)[1]); R(g, 40, 92, 170, 1, wood(0.5)[0]);
        let bx = 50; for (let i = 0; i < 12; i++) { const w = 5 + (i * 3) % 4, h = 22 + (i * 7) % 12, cc = [D.rust[2], D.steel[2], D.moss[2], D.paperD, D.teal[2]][i % 5]; R(g, bx, 92 - h, w, h, mix(cc, D.n2, 0.45)); R(g, bx, 92 - h, 1, h, mix(cc, D.n5, 0.3)); bx += w + 1; }
        PX.circle(g, 186, 76, 10, mix(D.moss[2], D.n2, 0.3)); R(g, 180, 80, 12, 12, mix(D.rust[2], D.n2, 0.3));
      });
      // ---- mid: lamp + table ----
      PX.par(g, c, 0.7, () => {
        PX.glow(g, 110, 190, 200, D.lamp, 0.22);
        R(g, 90, 244, 30, 6, D.n2); R(g, 103, 136, 4, 110, D.n3); poly(g, [[78, 104], [130, 104], [140, 136], [68, 136]], mix(D.paper, D.lampD, 0.4)); R(g, 70, 135, 70, 1, D.lamp);
        A(g, 0.06, () => poly(g, [[70, 136], [140, 136], [230, 250], [-20, 250]], D.lamp));
        const wd = wood(0.3);
        R(g, -40, TOP, 720, 120, wd[1]); R(g, -40, TOP, 720, 2, wd[0]);
        for (let k = 0; k < 9; k++) PX.line(g, -40, TOP + 8 + k * 11, 680, TOP + 6 + k * 11 + (k % 3), mix(wd[1], wd[2], 0.2 + (k % 2) * 0.1));
        R(g, 520, 236, 18, 22, mix(D.cream, D.paperD, 0.3)); R(g, 538, 241, 5, 10, mix(D.cream, D.paperD, 0.3)); R(g, 522, 237, 14, 3, mix(D.rust[2], D.n1, 0.5)); R(g, 520, 256, 18, 2, mix(D.paperD, D.n3, 0.4));
        for (let i = 0; i < 3; i++) { const k = frac(t * 0.6 + i / 3); A(g, 0.35 * (1 - k), () => R(g, 526 + Math.round(Math.sin(k * 6 + i) * 2), 230 - k * 18, 2, 3, D.n6)); }
        poly(g, [[110, 270], [196, 266], [204, 292], [114, 298]], mix(D.moss[2], D.n2, 0.3)); poly(g, [[112, 270], [194, 266], [196, 270], [113, 274]], D.paper);
        // charging cable from the stand curling off the table
        let px0 = PXc + 22, py0 = TOP + 8;
        for (let i = 1; i <= 40; i++) { const u = i / 40, x2 = PXc + 22 + u * 150 + Math.sin(u * 5) * 26, y2 = TOP + 8 + u * 104 - Math.sin(u * 3.1) * 20; PX.line(g, px0, py0, x2, y2, mix(D.n6, D.cream, 0.3)); PX.line(g, px0, py0 + 1, x2, y2 + 1, mix(D.n4, wd[2], 0.4)); px0 = x2; py0 = y2; }
      });
      // ---- app cards fanning out behind the phone (kept above the table top) ----
      const pivotY = 262, fan = P(t, tA, 0.9, "out");
      let tagPt = null;
      clip(g, -40, -40, 720, TOP + 40, () => {
        for (const i of [0, 12, 1, 11, 2, 10, 3, 9, 4, 8, 5, 7, 6]) {
          const side = (i - (NC - 1) / 2) / ((NC - 1) / 2), k2 = clamp(fan * 1.5 - Math.abs(side) * 0.5, 0, 1);
          if (k2 <= 0) continue;
          const ang = side * 1.12 * E(k2, "out") + Math.sin(t * 0.8 + i) * 0.008;
          const cw = 62, ch = 112, vb = 34, vt = vb + ch, ca = Math.cos(ang), sa = Math.sin(ang);
          const pt = (u, v) => [PXc + u * ca + v * sa, pivotY + u * sa - v * ca];
          const col = APPC()[i], dim = 0.15 + 0.35 * Math.abs(side);
          const body = mix(mix(D.n6, D.paper, 0.25), D.n3, dim), head = mix(col[1], D.n3, 0.25 + dim * 0.4), img = mix(col[0], D.n4, 0.35 + dim * 0.3), ln = mix(D.n4, D.n3, dim);
          poly(g, [pt(-cw / 2 + 3, vb - 3), pt(cw / 2 + 3, vb - 3), pt(cw / 2 + 3, vt - 3), pt(-cw / 2 + 3, vt - 3)], mix(D.n0, D.n1, 0.5));
          poly(g, [pt(-cw / 2, vb), pt(cw / 2, vb), pt(cw / 2, vt), pt(-cw / 2, vt)], mix(body, D.n2, 0.25));
          poly(g, [pt(-cw / 2 + 1, vb + 1), pt(cw / 2 - 1, vb + 1), pt(cw / 2 - 1, vt - 1), pt(-cw / 2 + 1, vt - 1)], body);
          poly(g, [pt(-cw / 2 + 1, vt - 16), pt(cw / 2 - 1, vt - 16), pt(cw / 2 - 1, vt - 1), pt(-cw / 2 + 1, vt - 1)], head);
          poly(g, [pt(-cw / 2 + 6, vt - 22), pt(cw / 2 - 6, vt - 22), pt(cw / 2 - 6, vt - 52), pt(-cw / 2 + 6, vt - 52)], img);
          for (let l = 0; l < 4; l++) { const p1 = pt(-cw / 2 + 6, vt - 60 - l * 8), p2 = pt(-cw / 2 + 6 + 24 + ((l * 11 + i * 7) % 22), vt - 60 - l * 8); PX.line(g, p1[0], p1[1], p2[0], p2[1], ln); }
          const ic = pt(-cw / 2 + 9, vt - 8); R(g, ic[0] - 3, ic[1] - 3, 6, 6, mix(col[0], D.cream, 0.2));
          if (i === 10) tagPt = pt(cw / 2 - 5, vt - 5);
        }
      });
      // ---- the phone on a stand ----
      const fw = 92, fh = 170, fx = PXc - fw / 2, fy = TOP - fh + 2;
      A(g, 0.45, () => ell(g, PXc + 6, TOP + 10, 70, 6, BLK));
      poly(g, [[PXc - 30, TOP + 10], [PXc + 30, TOP + 10], [PXc + 20, TOP - 14], [PXc - 20, TOP - 14]], D.n2); R(g, PXc - 30, TOP + 9, 60, 2, D.n3);
      const warm = P(t, tLg, 2.5, "lin");
      R(g, fx - 1, fy - 1, fw + 2, fh + 2, D.n0); R(g, fx, fy, fw, fh, mix(D.n2, D.rust[2], 0.15 * warm)); R(g, fx + 1, fy, fw - 2, 1, D.n4); R(g, fx, fy + 1, 1, fh - 2, D.n3);
      R(g, PXc - 10, fy + 3, 20, 2, D.n1);
      const sx = fx + 5, sy = fy + 8, sw = fw - 10, shh = fh - 16;
      // game time: smooth, then after the lag it advances in uneven jumps (some steps frozen)
      let gt = t, step = -1, frozen = false;
      if (t > tLg) {
        const dt = t - tLg; step = Math.floor(dt / 0.32);
        let acc = 0; for (let s = 0; s < Math.min(step, 60); s++) acc += hash(s, 9) < 0.35 ? 0 : 0.32 * (0.4 + hash(s, 8) * 0.6);
        gt = tLg + acc; frozen = hash(step, 9) < 0.35;
      }
      clip(g, sx, sy, sw, shh, () => {
        PX.vgrad(g, sx, sy, sw, shh, mix(D.teal[2], D.steel[2], 0.3), mix(D.teal[0], D.cream, 0.3), 6);
        PX.circle(g, sx + sw - 20, sy + 40, 8, mix(D.lamp, D.cream, 0.4));
        for (let i = 0; i < 3; i++) { const cx2 = sx + ((((i * 40 - gt * 6) % (sw + 30)) + sw + 30) % (sw + 30)) - 15; ell(g, cx2, sy + 26 + i * 12, 9, 3, mix(D.cream, D.teal[0], 0.2)); }
        for (let x = 0; x < sw; x++) { const wx = x + gt * 14, hh = 18 + Math.sin(wx * 0.05) * 7 + Math.sin(wx * 0.11) * 3; R(g, sx + x, sy + shh - 40 - hh, 1, hh, mix(D.moss[2], D.teal[2], 0.35)); }
        const gy = sy + shh - 40;
        R(g, sx, gy, sw, 40, mix(D.moss[1], D.moss[2], 0.4)); R(g, sx, gy, sw, 2, D.moss[0]);
        for (let i = 0; i < 10; i++) R(g, sx + ((((i * 13 - gt * 40) % sw) + sw) % sw), gy + 8 + (i % 3) * 9, 3, 1, D.moss[2]);
        for (let i = 0; i < 4; i++) {
          const ox = sx + ((((i * 52 + 70 - gt * 40) % 208) + 208) % 208) - 20;
          R(g, ox, gy - 10, 7, 10, mix(D.rust[1], D.rust[2], 0.3)); R(g, ox, gy - 10, 7, 1, D.rust[0]); R(g, ox + 5, gy - 9, 2, 9, D.rust[2]);
        }
        const jp = frac(gt / 1.3), jump = jp < 0.4 ? Math.sin((jp / 0.4) * Math.PI) * 18 : 0, rx = sx + 22, ry = Math.round(gy - 12 - jump);
        const lp = Math.floor(gt * 10) % 2;
        R(g, rx, ry, 8, 8, D.amber[1]); R(g, rx, ry, 8, 1, D.amber[0]); R(g, rx + 5, ry + 2, 2, 2, D.n0); R(g, rx + 7, ry + 5, 2, 1, D.amber[2]);
        R(g, rx + 1 + lp, ry + 8, 2, 4 - (jump > 0 ? 2 : 0), D.amber[2]); R(g, rx + 5 - lp, ry + 8, 2, 4 - (jump > 0 ? 2 : 0), D.amber[2]);
        // status bar (signal + battery, no digits) + coin row
        R(g, sx, sy, sw, 9, mix(D.n1, D.teal[2], 0.3));
        for (let i = 0; i < 3; i++) R(g, sx + 4 + i * 4, sy + 6 - i * 2, 2, 2 + i * 2, D.cream);
        R(g, sx + sw - 16, sy + 2, 11, 5, D.cream); R(g, sx + sw - 5, sy + 3, 1, 3, D.cream);
        const bat = clamp(1 - warm * 0.85, 0.12, 1); R(g, sx + sw - 15, sy + 3, Math.max(1, Math.round(9 * bat)), 3, bat < 0.3 ? D.rust[1] : D.moss[1]);
        for (let i = 0; i < Math.floor(clamp(gt, 0, 8) * 1.5) % 9; i++) R(g, sx + 6 + i * 6, sy + 14, 4, 4, D.amber[0]);
        if (step >= 0) {
          if (frozen) A(g, 0.25, () => R(g, sx, sy, sw, shh, D.n1));
          const spx = sx + sw / 2, spy = sy + shh / 2 - 10, a0 = Math.floor(t * 8);
          A(g, 0.55, () => PX.circle(g, spx, spy, 13, D.n1));
          for (let k = 0; k < 8; k++) { const a = ((a0 + k) / 8) * TAU; R(g, spx + Math.round(Math.cos(a) * 8) - 1, spy + Math.round(Math.sin(a) * 8) - 1, 3, 3, mix(D.n4, D.cream, k / 7)); }
        }
      });
      // tearing: a strip of the screen slips sideways on some stutter steps
      if (step >= 0 && hash(step, 7) < 0.4) { const ty = sy + 24 + Math.floor(hash(step, 6) * (shh - 50)), dx = 3 + Math.floor(hash(step, 5) * 6); const img = g.getImageData(sx, ty, sw - dx, 7); g.putImageData(img, sx + dx, ty); R(g, sx, ty, dx, 7, mix(D.teal[2], D.n1, 0.4)); }
      A(g, 0.07, () => poly(g, [[fx + 10, fy + 8], [fx + 34, fy + 8], [fx + 4, fy + 70], [fx + 4, fy + 30]], D.cream));
      R(g, PXc - 14, fy + fh - 5, 28, 2, D.n4);
      PX.glow(g, PXc, TOP + 18, 80, D.teal[0], 0.1);
      if (warm > 0) A(g, 0.5 * warm, () => { R(g, fx - 2, fy + fh - 40, 2, 30, D.rust[2]); R(g, fx + fw, fy + fh - 40, 2, 30, D.rust[2]); });
      // paper tag "40 APPS" hanging from the outermost card on the right
      if (tagPt && t >= tT) {
        const k = P(t, tT, 0.5, "back"), sw2 = Math.round(Math.sin(t * 2.2) * 2), tx = Math.round(tagPt[0]) + 26, ty = Math.round(tagPt[1]) + 22 + sw2;
        A(g, clamp((t - tT) / 0.15, 0, 1), () => {
          PX.line(g, tagPt[0], tagPt[1], tx + 5, ty + 8, D.paperD);
          PX.zoom(g, k, tx, ty + 8, () => {
            R(g, tx + 3, ty + 3, 76, 18, BLK);
            poly(g, [[tx, ty + 5], [tx + 7, ty - 1], [tx + 76, ty - 1], [tx + 76, ty + 17], [tx + 7, ty + 17], [tx, ty + 11]], D.cream);
            R(g, tx + 7, ty + 16, 69, 1, D.paperD); R(g, tx + 4, ty + 7, 3, 3, D.n3);
            PX.text(g, "40 APPS", tx + 43, ty + 5, { font: "p", size: 8, col: D.ink, align: "center" });
          });
        });
      }
      dust(g, 81, 20, t, [60, 120, 240, 140], D.lamp, 0.3);
      PX.vignette(g, 0.55);
    };
  };

  // ======================= write_worry =======================
  // an exam hall before the exam (close shot): the anxious learner writes on a sheet headed "WORRIES" (o.write 0.5); dark
  // scribbles flow from the cloud over their head down onto the paper (o.flow 3.0); at o.calm (7.0) the sheet is folded and
  // slid away, the cloud is gone, and the learner turns the exam paper over and starts calmly.
  K.write_worry = (o) => {
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 11), tWr = T("write", 0.5), tF = T("flow", 3.0), tCl = T("calm", 7.0);
      const v = LRN();
      const sc = clamp(d / 11, 0.6, 1);   // post-calm choreography tightens a little in short shots
      const flowSpan = clamp(tCl - tF - 0.4, 0.5, (4 * d) / 11), flow = clamp((t - tF) / flowSpan, 0, 1), flowing = t >= tF && t < tCl;
      const fold = P(t, tCl, 0.6 * sc, "io"), away = P(t, tCl + 0.6 * sc, 0.6 * sc, "io"), flip = clamp((t - tCl - 1.1 * sc) / (0.6 * sc), 0, 1), calm = t >= tCl;
      const writing = t >= tWr && !calm;
      R(g, 0, 0, 640, 360, D.n1);
      exRoom(g, t, c, 0.3);
      const X = 320, Y = 292;
      const wx0 = X - 140, wy0 = Y - 58, ww = 100, wh = 50;       // worry sheet (left)
      const ex0 = X + 40, ey0 = Y - 56, ew = 96, eh = 48;          // exam paper (right)
      const ex = calm ? (flip >= 1 ? "focus" : "relief") : writing ? (flow > 0.55 ? "write" : "worry") : "worry";
      // hands: our-left hand writes on the worry sheet; our-right hand rests by the exam paper, then flips it and writes
      let L, Rh, penL = false, penR = false;
      if (!calm) {
        const wr = writing ? 1 : 0;
        L = [wx0 - X + 30 + Math.round((Math.sin(t * 2.4) * 0.5 + 0.5) * 40 * wr), wy0 - Y + 28 + Math.round(frac(t / 1.7) * 12 * wr)]; penL = true;
        Rh = [56, -24];
      } else {
        L = away < 1 ? [Math.round(lerp(wx0 - X + 30, -40, away)), Math.round(lerp(-30, -24, away))] : [-40, -24];
        if (flip < 1) Rh = [ex0 - X + 50, -30 + Math.round(Math.sin(flip * Math.PI) * -6)];
        else { Rh = [ex0 - X + 24 + Math.round(Math.sin(t * 2.1) * 16), ey0 - Y + 22 + Math.round(frac(t / 1.5) * 12)]; penR = true; }
      }
      workingLearner(g, t, v, ex, (gg, x, y) => {
        // exam paper: face down until flipped
        if (flip <= 0) { R(gg, ex0 + 2, ey0 + 2, ew, eh, mix(D.paperD, D.n2, 0.55)); R(gg, ex0, ey0, ew, eh, mix(D.paper, D.paperD, 0.25)); R(gg, ex0, ey0, ew, 1, D.paper); for (let i = 0; i < 4; i++) R(gg, ex0 + ew - 8 + i, ey0 + eh - 3 - i, 1, 1, D.paperD); }
        else {
          const sc = Math.abs(Math.cos(flip * Math.PI)), w2 = Math.max(1, Math.round(ew * sc)), cx2 = ex0 + ew / 2;
          if (flip >= 1) bigSheet(gg, ex0, ey0, ew, eh, clamp((t - tCl - 1.9 * sc) / 4, 0, 1), t);
          else { R(gg, cx2 - w2 / 2 + 2, ey0 + 2, w2, eh, mix(D.paperD, D.n2, 0.55)); R(gg, cx2 - w2 / 2, ey0 - Math.round(Math.sin(flip * Math.PI) * 6), w2, eh, flip > 0.5 ? D.cream : mix(D.paper, D.paperD, 0.25)); }
        }
        // the worry sheet: header, lines, dark scribbles; folds twice and slides away to the left
        if (away < 1) {
          const fw = Math.round(ww * (1 - 0.5 * clamp(fold * 2, 0, 1))), fh = Math.round(wh * (1 - 0.5 * clamp(fold * 2 - 1, 0, 1))), fx = wx0 - Math.round(away * 90), fy = wy0 + (wh - fh);
          A(gg, 1 - away, () => {
            R(gg, fx + 2, fy + 2, fw, fh, mix(D.paperD, D.n2, 0.55)); R(gg, fx, fy, fw, fh, D.cream); R(gg, fx, fy, fw, 1, mix(D.cream, D.n7, 0.08));
            if (fold <= 0) {
              PX.text(gg, "WORRIES", fx + 5, fy + 4, { font: "p", size: 8, col: mix(D.ink, D.rust[2], 0.3) });
              R(gg, fx + 5, fy + 13, 56, 1, mix(D.ink, D.rust[2], 0.3));
              const lines = clamp((t - tWr) / 2.4, 0, 1) * 3 + flow * 2;
              for (let l = 0; l < 5; l++) {
                const lw = Math.round((ww - 12) * clamp(lines - l, 0, 1) * (l === 4 ? 0.6 : 1));
                for (let i = 0; i < lw; i++) R(gg, fx + 5 + i, fy + 19 + l * 6 + (Math.sin(i * 1.5 + l * 2) > 0.2 ? 0 : 1), 1, 1, l < 3 ? mix(D.ink, D.steel[2], 0.2) : mix(D.n1, D.rust[2], 0.25));
              }
              for (let k = 0; k < Math.floor(flow * 10); k++) { const sx2 = fx + 8 + Math.floor(hash(k, 1) * (ww - 20)), sy2 = fy + 18 + Math.floor(hash(k, 2) * 26); PX.line(gg, sx2, sy2, sx2 + 3, sy2 - 2, D.n1); PX.line(gg, sx2 + 3, sy2 - 2, sx2 + 5, sy2 + 1, D.n1); PX.line(gg, sx2 + 5, sy2 + 1, sx2 + 7, sy2 - 1, D.n1); }
            } else {
              R(gg, fx + Math.floor(fw / 2), fy, 1, fh, D.paperD); if (fold > 0.5) R(gg, fx, fy + Math.floor(fh / 2), fw, 1, D.paperD);
              R(gg, fx + 2, fy + 2, fw - 4, 1, mix(D.ink, D.rust[2], 0.2));
            }
          });
        }
      }, [L, Rh], [penL, penR], { look: [0, 0] });
      // the cloud, shrinking as the scribbles flow out of it; gone once the sheet is folded
      const cx = 330, cy = 56, ck = 1.5 * (1 - 0.75 * flow);
      cloud(g, cx, cy + Math.round(flow * 10), ck, t, calm ? P(t, tCl, 0.9 * sc, "io") : 0, { norain: calm });
      if (flowing) {
        // three wavy ink strands pouring from the cloud, around the head, down onto the sheet
        const px = wx0 + 50, py = wy0 + 26, env = clamp((t - tF) * 2, 0, 1) * clamp((tCl - t) * 2.5, 0, 1);
        const path = (u) => [lerp(lerp(cx - 24, cx - 150, u), lerp(cx - 150, px, u), u), lerp(lerp(cy + 12, cy + 64, u), lerp(cy + 64, py, u), u)];
        for (let s = 0; s < 3; s++) for (let i = 0; i < 140; i++) {
          const u = i / 140;
          if (frac(u * 4 - t * 1.4 + s * 0.33) > 0.7) continue;
          const [qx, qy] = path(u), w = Math.sin(u * 22 - t * 7 + s * 2) * (3 + 2 * Math.sin(u * 3)), nx = (s - 1) * 5, th = s === 1 ? 3 : 2;
          A(g, env * Math.sin(Math.min(1, u * 1.1 + 0.05) * Math.PI), () => R(g, qx + w + nx, qy + w * 0.4, th, th, s === 1 ? mix(D.n1, D.rust[2], 0.3) : mix(D.n1, D.n3, 0.3)));
        }
      }
      PX.vignette(g, 0.5);
    };
  };

  // ======================= exam_hall =======================
  // a school gym set up as an exam hall: rows of desks with ninth graders writing (seen from the back), a clock on the
  // wall, a teacher walking slowly across between the rows. Calm, focused, daylight from high windows.
  // o.walk = [start, end] seconds of the teacher's walk (default the whole shot).
  K.exam_hall = (o) => {
    const HZ = 120, ZS = [1.25, 1.7, 2.25, 3.0, 4.0, 5.3], TZ = 1.45;
    const rows = ZS.map((z, k) => {
      const s = 1.75 / z, y = HZ + 230 / z, people = [];
      for (let i = -5; i <= 5; i++) {
        if (i === 0) continue;
        const x = 320 + (i * 92 - Math.sign(i) * 20) / z; if (x < -30 || x > 670) continue;
        const r = PX.rnd(500 + k * 31 + (i + 7) * 7);
        people.push({ x, skin: SKINS()[Math.floor(r() * 5)], hair: HAIRS()[Math.floor(r() * 6)], top: TOPS()[Math.floor(r() * 8)], hs: ["", "long", "bun", ""][Math.floor(r() * 4)], ph: r() * 9, up: r() });
      }
      return { z, s, y, people };
    });
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const wk = Array.isArray(o.walk) && o.walk.length >= 2 ? o.walk : typeof o.walk === "number" ? [o.walk, o.walk + d] : [0, d];
      const wp = clamp((t - wk[0]) / Math.max(0.5, wk[1] - wk[0]), 0, 1);
      const floorC = mix(wood(0.4)[1], D.paperD, 0.25), floorD = mix(floorC, D.n2, 0.3);
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: gym end wall, high windows, folded hoop, clock, bleachers ----
      PX.par(g, c, 0.35, () => {
        PX.vgrad(g, -40, -40, 720, 180, mix(D.paperD, D.n4, 0.55), mix(D.paper, D.n4, 0.5), 6);
        for (let i = -4; i <= 4; i++) PX.line(g, 320 + i * 80, -10, 320 + i * 60, 30, mix(D.n3, D.paperD, 0.2));
        R(g, -40, 28, 720, 3, mix(D.n3, D.paperD, 0.25));
        for (let i = 0; i < 6; i++) {
          const wx = 52 + i * 92;
          R(g, wx - 2, 34, 64, 30, mix(D.n3, D.paperD, 0.3)); PX.vgrad(g, wx, 36, 60, 26, mix(D.cream, D.steel[0], 0.3), mix(D.cream, D.lamp, 0.4), 4);
          for (let k = 1; k < 4; k++) R(g, wx + k * 15, 36, 1, 26, mix(D.n4, D.paperD, 0.3)); R(g, wx, 48, 60, 1, mix(D.n4, D.paperD, 0.3));
          PX.glow(g, wx + 30, 50, 30, D.cream, 0.1);
        }
        R(g, -40, 70, 720, HZ - 70, mix(D.paperD, D.n4, 0.45));
        for (let r2 = 0; r2 < 7; r2++) { R(g, -40, 76 + r2 * 7, 720, 1, mix(D.paperD, D.n4, 0.58)); for (let i = 0; i < 46; i++) R(g, -40 + i * 16 + (r2 % 2) * 8, 70 + r2 * 7, 1, 6, mix(D.paperD, D.n4, 0.58)); }
        for (let i = 0; i < 10; i++) { const mx = 18 + i * 62; R(g, mx, 96, 56, 24, mix(D.steel[2], D.n3, 0.3)); R(g, mx, 96, 56, 1, mix(D.steel[1], D.n4, 0.35)); R(g, mx + 27, 97, 1, 23, mix(D.steel[2], D.n2, 0.35)); }
        R(g, 300, 30, 40, 4, D.n3); R(g, 318, 34, 4, 16, D.n3);
        R(g, 296, 48, 48, 30, mix(D.cream, D.n6, 0.4)); R(g, 296, 48, 48, 1, D.cream); R(g, 310, 60, 20, 14, mix(D.rust[1], D.n5, 0.35)); R(g, 312, 62, 16, 10, mix(D.cream, D.n6, 0.4));
        R(g, 312, 78, 16, 2, mix(D.rust[1], D.n5, 0.2)); for (let k = 0; k < 4; k++) PX.line(g, 313 + k * 4, 80, 314 + k * 3, 88, mix(D.cream, D.n6, 0.35));
        wallClock(g, 420, 58, 12, 9 * 3600 + 20 * 60 + t, { rim: D.n2 });
        for (const [x0, w] of [[-40, 140], [540, 140]]) for (let k = 0; k < 6; k++) { R(g, x0, 78 + k * 7, w, 6, mix(wood(0.4)[1], D.n4, 0.35 + k * 0.03)); R(g, x0, 78 + k * 7, w, 1, mix(wood(0.4)[0], D.n4, 0.35)); }
        // floor (court), muted
        PX.vgrad(g, -40, HZ, 720, 260, mix(floorC, D.paper, 0.15), floorC, 7);
        for (let k = -14; k <= 14; k++) PX.line(g, 320 + k * 16, HZ, 320 + k * 90, 380, mix(floorC, floorD, 0.3));
        const lc = mix(D.cream, floorC, 0.55);
        R(g, -40, HZ + 5, 720, 1, lc); PX.line(g, 120, HZ + 5, -80, 380, lc); PX.line(g, 520, HZ + 5, 720, 380, lc);
        A(g, 0.08, () => { for (let i = 0; i < 4; i++) poly(g, [[60 + i * 150, HZ + 10], [110 + i * 150, HZ + 10], [150 + i * 170, 360], [60 + i * 170, 360]], D.lamp); });
        // proctor's table at the front: stacks of papers, a water bottle, a chair
        const pt = mix(D.n4, D.paperD, 0.3);
        A(g, 0.3, () => R(g, 268, 140, 108, 3, BLK));
        R(g, 270, 124, 104, 5, pt); R(g, 270, 124, 104, 1, mix(D.n6, D.paperD, 0.3)); R(g, 274, 129, 2, 12, D.n3); R(g, 368, 129, 2, 12, D.n3);
        for (const [px, h] of [[282, 6], [298, 4], [340, 7]]) { R(g, px, 124 - h, 12, h, D.cream); for (let k = 0; k < h; k += 2) R(g, px, 124 - h + k, 12, 1, D.paper); }
        R(g, 360, 115, 3, 9, mix(D.teal[0], D.n5, 0.3)); R(g, 360, 114, 3, 1, D.n3);
        R(g, 318, 116, 8, 8, mix(D.steel[2], D.n3, 0.3)); R(g, 316, 122, 2, 12, D.n3);
      });
      // ---- rows (far to near); the teacher walks across between row 1 and row 2 ----
      const wd = wood(0.4);
      const tv = { skin: SKINS()[0], hair: mix(D.n4, D.n6, 0.5), top: mix(D.plum[2], D.n3, 0.3), pants: mix(D.n3, D.steel[2], 0.3) };
      const tx = lerp(110, 530, E(wp, "io")), tY = HZ + 230 / TZ, walking = wp > 0 && wp < 1;
      for (let k = ZS.length - 1; k >= 0; k--) {
        const row = rows[k], s = row.s, y = row.y, dep = lerp(1, 0.55, k / (ZS.length - 1));
        PX.par(g, c, dep, () => {
          const fog = (col) => mix(col, mix(D.paperD, D.n4, 0.45), k * 0.09);
          for (const v of row.people) {
            const up = v.up > 0.8 && frac(t / 4.5 + v.ph) < 0.3 ? 1 : 0;
            const dw = Math.round(30 * s), dh = Math.max(2, Math.round(6 * s)), lg = Math.round(14 * s), th = Math.max(1, Math.round(s));
            A(g, 0.28, () => R(g, v.x - dw / 2 - 2, y + lg, dw + 6, Math.max(1, Math.round(2 * s)), BLK));
            // desk: far legs, top, near edge, paper
            R(g, v.x - dw / 2 + 1, y, Math.max(1, Math.round(1.5 * s)), lg, fog(D.n3)); R(g, v.x + dw / 2 - 2, y, Math.max(1, Math.round(1.5 * s)), lg, fog(D.n3));
            R(g, v.x - dw / 2, y - dh, dw, dh, fog(wd[1])); R(g, v.x - dw / 2, y - dh, dw, th, fog(wd[0])); R(g, v.x - dw / 2, y, dw, Math.max(1, Math.round(1.5 * s)), fog(wd[2]));
            R(g, v.x - Math.round(9 * s), y - dh + th, Math.round(15 * s), Math.max(1, dh - 2 * th), fog(D.cream));
            const vv = k ? { ...v, top: fog(v.top), hair: fog(v.hair), skin: fog(v.skin) } : v;
            kidB(g, Math.round(v.x), y + Math.round(5 * s), s, vv, t, up ? 0 : 1, up);
            // chair back + legs
            R(g, v.x - Math.round(9 * s), y + Math.round(9 * s), Math.round(18 * s), Math.max(2, Math.round(5 * s)), fog(mix(D.steel[2], D.n2, 0.35)));
            R(g, v.x - Math.round(9 * s), y + Math.round(9 * s), Math.round(18 * s), th, fog(mix(D.steel[1], D.n3, 0.35)));
            R(g, v.x - Math.round(8 * s), y + Math.round(14 * s), th, Math.round(9 * s), fog(D.n2)); R(g, v.x + Math.round(7 * s), y + Math.round(14 * s), th, Math.round(9 * s), fog(D.n2));
          }
          if (k === 1) walker(g, tx, tY, tv, walking ? t * 3.0 : 0, 1);
        });
      }
      A(g, 0.05, () => { for (let i = 0; i < 6; i++) poly(g, [[52 + i * 92, 36], [112 + i * 92, 36], [150 + i * 110, 360], [70 + i * 110, 360]], D.cream); });
      dust(g, 91, 40, t, [20, 40, 600, 280], D.cream, 0.3);
      PX.vignette(g, 0.5);
    };
  };
})();
