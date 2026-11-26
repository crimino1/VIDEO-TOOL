/* EP3 Builder A: the database story. founder_desk, freeze, goodnight, db_gone, confession, checker, typing_race.
   Full illustrated environments, native-resolution characters (founder, dev, AI agent), 3 depth layers, glow + vignette. */
(function () {
  const { K } = PX;
  const R = PX.rect, T = PX.text, OT = PX.otext, W = 640, H = 360, cl = PX.clamp, lerp = PX.lerp;

  // ---------------- helpers ----------------
  const opt = (o, k, def) => (o[k] !== undefined ? o[k] : def);
  const ell = (g, cx, cy, rx, ry, col) => {
    g.fillStyle = col;
    for (let y = -ry; y <= ry; y++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry)))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); }
  };
  const thick = (g, x1, y1, x2, y2, w, col) => {
    const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1))); g.fillStyle = col;
    for (let i = 0; i <= n; i++) { const x = x1 + ((x2 - x1) * i) / n, y = y1 + ((y2 - y1) * i) / n; g.fillRect(Math.round(x - w / 2), Math.round(y - w / 2), w, w); }
  };
  const rr = (g, x, y, w, h, col) => { R(g, x + 1, y, w - 2, h, col); R(g, x, y + 1, w, h - 2, col); };
  const rr2 = (g, x, y, w, h, col) => { R(g, x + 2, y, w - 4, h, col); R(g, x + 1, y + 1, w - 2, h - 2, col); R(g, x, y + 2, w, h - 4, col); };
  const clip = (g, x, y, w, h, fn) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); };
  const A = (g, a, fn) => PX.alpha(g, a, fn);
  const pop = (t, t0, d) => PX.p(t, t0, d || 0.35, "back");
  const poly = (g, pts, col) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
  const star4 = (g, x, y, r, col) => { R(g, x, y - r, 1, 2 * r + 1, col); R(g, x - r, y, 2 * r + 1, 1, col); if (r > 2) R(g, x - 1, y - 1, 3, 3, col); };
  const tick = (g, x, y, s, col) => { const w = Math.max(2, Math.round(s / 6)); thick(g, x, y + s * 0.5, x + s * 0.35, y + s * 0.85, w, col); thick(g, x + s * 0.35, y + s * 0.85, x + s, y, w, col); };
  const sweat = (g, x, y, t, ph) => {
    const k = (t * 1.4 + (ph || 0)) % 1, yy = y + k * 12;
    A(g, 1 - k * 0.6, () => { R(g, x, yy, 3, 4, "#7fd6f0"); R(g, x + 1, yy - 2, 1, 2, "#7fd6f0"); R(g, x, yy, 1, 1, "#d8f6ff"); });
  };
  // sparkles burst around (x, y) starting at t0
  const sparkles = (g, x, y, t, t0, n, rad, seed) => {
    if (t < t0 || t > t0 + 0.9) return;
    const r = PX.rnd(seed || 3), k = (t - t0) / 0.9;
    for (let i = 0; i < n; i++) { const a = r() * 6.283, d0 = rad * (0.4 + 0.6 * r()) * PX.ease(k, "out"), s = Math.round(3 * (1 - k)) + (i % 2);
      star4(g, Math.round(x + Math.cos(a) * d0), Math.round(y + Math.sin(a) * d0 * 0.7), s, i % 3 ? "#fff3b0" : "#5fe3e8"); }
  };
  // speech bubble with tail to (tx, ty)
  const bubble = (g, x, y, w, h, tx, ty, fill, edge) => {
    fill = fill || "#dfe6ee"; edge = edge || "#0b0f1a";
    const bx = cl(tx, x + 6, x + w - 10), by = ty < y ? y : y + h - 1;
    const TN = Math.max(6, Math.ceil(Math.hypot(tx - bx, ty - by)));
    for (let i = 0; i < TN; i++) { const k = i / TN, cx = lerp(bx + 3, tx, k), cy = lerp(by, ty, k), ww = Math.round(6 * (1 - k)) + 1; R(g, cx - ww / 2 - 1, cy - 1, ww + 2, 3, edge); }
    rr2(g, x - 1, y - 1, w + 2, h + 2, edge); rr2(g, x, y, w, h, fill); R(g, x + 2, y + h - 2, w - 4, 1, "rgba(0,0,0,.14)");
    for (let i = 0; i < TN; i++) { const k = i / TN, cx = lerp(bx + 3, tx, k), cy = lerp(by, ty, k), ww = Math.round(6 * (1 - k)); if (ww > 0) R(g, cx - ww / 2, cy, ww, 1, fill); }
  };
  // rotated rubber stamp (border + text), a = 0..1 alpha, rot radians
  const stamp = (g, cx, cy, txt, col, size, rot, a) => {
    if (a <= 0) return;
    const w = PX.tw(g, txt, { size }) + 16, h = size + 14;
    g.save(); g.translate(Math.round(cx), Math.round(cy)); g.rotate(rot || 0);
    A(g, a, () => {
      R(g, -w / 2 - 2, -h / 2 - 2, w + 4, h + 4, "rgba(10,4,6,.55)");
      R(g, -w / 2, -h / 2, w, 3, col); R(g, -w / 2, h / 2 - 3, w, 3, col); R(g, -w / 2, -h / 2, 3, h, col); R(g, w / 2 - 3, -h / 2, 3, h, col);
      R(g, -w / 2 + 5, -h / 2 + 5, w - 10, 1, col); R(g, -w / 2 + 5, h / 2 - 6, w - 10, 1, col);
      T(g, txt, 0, -size / 2, { size, col, align: "center" });
    });
    g.restore();
  };
  // pixel padlock: (x,y) top-left of body w=12 h=10; shut 0..1 (shackle drops)
  const padlock = (g, x, y, shut, col) => {
    const dy = Math.round((1 - shut) * 5);
    R(g, x + 2, y - 8 - dy, 8, 2, "#c9ced8"); R(g, x + 2, y - 8 - dy, 2, 9, "#c9ced8"); R(g, x + 8, y - 8 - dy, 2, 9 + (shut > 0.95 ? 0 : -3), "#9aa0ac");
    R(g, x, y, 12, 10, col || "#f7c948"); R(g, x, y, 12, 2, "#ffe08a"); R(g, x, y + 8, 12, 2, "#b8860b"); R(g, x + 5, y + 3, 2, 4, "#3a2a10");
  };

  // ---------------- palette for the cast ----------------
  const NAVY = { l: "#4a62a8", b: "#2e3f74", d: "#1d2850" };          // founder hoodie
  const FSK = { l: "#f8d9bf", b: "#e9b996", d: "#c28a68" };           // founder skin (light)
  const GREY = { l: "#c4c9d2", b: "#959ba6", d: "#5f6572" };          // founder hair
  const GRN = { l: "#5cc46a", b: "#3a9a4e", d: "#26683a" };           // dev hoodie
  const DSK = { l: "#c08a5c", b: "#9a6640", d: "#71472a" };           // dev skin (medium brown)
  const DHAIR = { b: "#1a120c", l: "#3a2a1c" };
  const BOT = { o: "#142230", d: "#5c8191", b: "#8cb0bf", l: "#bfdce6", face: "#132230", eye: "#5fe3e8", led: "#f25ca8" };

  // ---------------- the AI agent: rounded cyan-grey box head, square eyes, antenna with pink LED ----------------
  // s = head width in px (12..80); o.ex = "neutral" | "happy" | "wide" | "worry"; o.nod = vertical offset; o.look = -1..1
  const bot = (g, cx, cy, s, t, o) => {
    o = o || {};
    const w = Math.round(s), h = Math.round(s * 0.8), x = Math.round(cx - w / 2), y = Math.round(cy - h / 2 + (o.nod || 0));
    const big = s >= 28, ex = o.ex || "neutral";
    // antenna
    const ah = Math.max(3, Math.round(s * 0.24)), aw = big ? 2 : 1, lr = Math.max(1, Math.round(s * 0.07));
    R(g, Math.round(cx) - (aw >> 1), y - ah, aw, ah, BOT.d);
    const on = PX.blink(t, 1.1, 0.55) || o.ledOn;
    PX.circle(g, Math.round(cx), y - ah - lr, lr, on ? BOT.led : "#7a2a58"); if (big) R(g, Math.round(cx) - 1, y - ah - lr - 1, 1, 1, "#ffd0ea");
    if (on) PX.glow(g, cx, y - ah - lr, 6 + s * 0.25, "rgba(242,92,168,0.8)", 0.6);
    // ear bolts
    const eh = Math.max(2, Math.round(h * 0.3));
    R(g, x - Math.max(1, Math.round(s * 0.06)), y + Math.round(h * 0.36), Math.max(1, Math.round(s * 0.06)) + 1, eh, BOT.d);
    R(g, x + w - 1, y + Math.round(h * 0.36), Math.max(1, Math.round(s * 0.06)) + 1, eh, BOT.o);
    // head
    if (big) { rr2(g, x - 1, y - 1, w + 2, h + 2, BOT.o); rr2(g, x, y, w, h, BOT.b); R(g, x + 3, y + 1, w - 6, 2, BOT.l); R(g, x + 1, y + 3, 2, h - 8, BOT.l); R(g, x + 3, y + h - 3, w - 6, 2, BOT.d); R(g, x + w - 3, y + 3, 2, h - 6, BOT.d); }
    else { rr(g, x - 1, y - 1, w + 2, h + 2, BOT.o); rr(g, x, y, w, h, BOT.b); R(g, x + 1, y, w - 2, 1, BOT.l); R(g, x + 1, y + h - 1, w - 2, 1, BOT.d); }
    // face screen
    const k = Math.max(2, Math.round(s * 0.13)), fx = x + k, fy = y + k, fw = w - 2 * k, fh = h - 2 * k;
    (big ? rr2 : rr)(g, fx, fy, fw, fh, BOT.face);
    // eyes
    const es = Math.max(2, Math.round(s * (ex === "wide" ? 0.24 : 0.19))), lk = Math.round((o.look || 0) * s * 0.05);
    const ey = Math.round(fy + fh * 0.42 - es / 2), exs = [Math.round(cx - s * 0.2 - es / 2) + lk, Math.round(cx + s * 0.2 - es / 2) + lk];
    const blink = !o.noBlink && PX.blink(t + (o.ph || 0), 3.3, 0.05);
    for (const ex0 of exs) {
      if (ex === "happy") { R(g, ex0, ey + Math.round(es * 0.4), es, Math.max(1, Math.round(es / 3)), BOT.eye); R(g, ex0 + Math.round(es * 0.25), ey + Math.round(es * 0.15), Math.max(1, es - Math.round(es * 0.5)), Math.max(1, Math.round(es / 4)), BOT.eye); }
      else if (blink) R(g, ex0, ey + Math.round(es / 2), es, 1, BOT.eye);
      else if (ex === "wide") { R(g, ex0, ey, es, es, "#d8f8fa"); const ps = Math.max(1, Math.round(es * 0.35)); R(g, ex0 + Math.round((es - ps) / 2), ey + Math.round((es - ps) / 2), ps, ps, "#0b1620"); }
      else { R(g, ex0, ey, es, es, BOT.eye); if (es >= 4) R(g, ex0, ey, Math.max(1, Math.round(es / 3)), Math.max(1, Math.round(es / 3)), "#d8fbfc"); }
      if (ex === "worry" && es >= 3) thick(g, ex0 - 1, ey - 2 - (ex0 < cx ? 0 : 1), ex0 + es, ey - 2 - (ex0 < cx ? 1 : 0), 1, BOT.eye);
    }
    if (big) PX.glow(g, cx, ey + es / 2, s * 0.5, "rgba(95,227,232,0.5)", 0.45);
    // mouth
    const my = Math.round(fy + fh * 0.76), mw = Math.max(2, Math.round(s * 0.18));
    if (ex === "wide" || ex === "worry") { const mh = Math.max(1, Math.round(s * 0.07)); R(g, Math.round(cx - mw / 4), my - (mh >> 1), Math.max(1, Math.round(mw / 2)), mh + 1, BOT.eye); }
    else if (ex === "happy" || o.smile) { R(g, Math.round(cx - mw / 2), my - 1, 1, 1, BOT.eye); R(g, Math.round(cx - mw / 2) + 1, my, mw - 2, 1, BOT.eye); R(g, Math.round(cx + mw / 2) - 1, my - 1, 1, 1, BOT.eye); }
    else R(g, Math.round(cx - mw / 2), my, mw, 1, o.talk && PX.blink(t, 0.18) ? "#2a5a66" : BOT.eye);
  };

  // founder head in profile facing right, centre (hx, hy). o.ex: "talk" | "smile" | "wide"; o.brow raise
  const founderHead = (g, hx, hy, t, o) => {
    o = o || {};
    R(g, hx - 4, hy + 9, 9, 9, FSK.d); R(g, hx + 1, hy + 9, 4, 7, FSK.b);
    ell(g, hx, hy, 12, 13, FSK.d); ell(g, hx + 1, hy, 11, 12, FSK.b); R(g, hx + 10, hy - 5, 2, 10, FSK.l);
    for (let i = 0; i < 9; i++) R(g, hx + 1 + i, hy + 8 + (i % 2), 1, 1, "#c49a82");                 // stubble
    R(g, hx + 12, hy - 2, 2, 5, FSK.b); R(g, hx + 12, hy - 2, 1, 1, FSK.l); R(g, hx + 11, hy + 3, 2, 1, FSK.d);   // nose
    clip(g, hx - 14, hy - 16, 28, 9, () => ell(g, hx - 1, hy - 1, 12, 14, GREY.b));                 // hair top
    clip(g, hx - 14, hy - 8, 10, 15, () => ell(g, hx - 1, hy, 12, 13, GREY.b));                     // hair back
    R(g, hx - 7, hy - 13, 12, 2, GREY.l); R(g, hx - 10, hy - 10, 3, 2, GREY.l); R(g, hx - 13, hy + 1, 3, 5, GREY.d); R(g, hx + 5, hy - 9, 4, 1, GREY.d);
    R(g, hx + 1, hy - 7, 3, 6, GREY.b); R(g, hx + 1, hy - 7, 1, 6, GREY.d);                          // sideburn
    ell(g, hx - 1, hy + 1, 3, 4, FSK.d); R(g, hx - 1, hy, 1, 3, "#a8705a"); R(g, hx, hy - 2, 1, 1, FSK.l);   // ear
    R(g, hx + 4, hy - 10, 6, 1, "#d8a888");                                                         // forehead line
    const ex = o.ex, br = o.brow ? 2 : 0;
    if (ex === "smile") { R(g, hx + 6, hy - 3, 4, 1, "#2a1a14"); R(g, hx + 5, hy - 2, 1, 1, "#2a1a14"); R(g, hx + 10, hy - 2, 1, 1, "#2a1a14"); }
    else if (ex === "wide") { R(g, hx + 6, hy - 5, 4, 5, "#f2f4f8"); R(g, hx + 8, hy - 4, 2, 3, "#1a120c"); }
    else if (PX.blink(t + (o.ph || 0.4), 3.4, 0.05)) R(g, hx + 6, hy - 2, 4, 1, "#2a1a14");
    else { R(g, hx + 7, hy - 4, 3, 4, "#2a1a14"); R(g, hx + 7, hy - 4, 1, 1, "#f2f4f8"); }
    R(g, hx + 5, hy - 7 - br, 6, 2, GREY.d); R(g, hx + 4, hy - 1, 1, 2, "#c4927a");                 // brow, crow's feet
    if (ex === "smile") { R(g, hx + 6, hy + 5, 1, 1, "#7a2e22"); R(g, hx + 7, hy + 6, 5, 2, "#7a2e22"); R(g, hx + 8, hy + 6, 3, 1, "#f2ece2"); }
    else if (ex === "wide") { R(g, hx + 7, hy + 5, 4, 4, "#4a1610"); }
    else if (ex === "talk" && Math.floor(t * 9) % 3 !== 0) { R(g, hx + 7, hy + 5, 5, 3, "#5a1e18"); R(g, hx + 7, hy + 5, 5, 1, "#f2ece2"); }
    else R(g, hx + 7, hy + 6, 4, 1, "#8a3e30");
  };

  // ---------------- the founder: seated, profile facing right, leaning back ----------------
  // (x, y) = hip on the seat, fy = floor. o.talk, o.raise 0..1 (mug up), o.smile
  const founderSit = (g, x, y, fy, t, o) => {
    o = o || {};
    const br = Math.round(Math.sin(t * 2.1) * 0.8), rz = o.raise || 0;
    const sx = x - 10, sy = y - 42 + br;                     // shoulder
    const hx = sx + 9, hy = sy - 18;                         // head centre
    // far leg (darker)
    thick(g, x + 2, y - 2, x + 30, y - 6, 9, "#2a2e3a"); thick(g, x + 30, y - 6, x + 36, fy - 6, 8, "#2a2e3a");
    R(g, x + 31, fy - 6, 13, 5, "#16181e");
    // far arm on the armrest
    thick(g, sx + 2, sy + 4, sx + 6, sy + 24, 7, NAVY.d); thick(g, sx + 6, sy + 24, sx + 22, sy + 28, 6, NAVY.d); R(g, sx + 21, sy + 25, 5, 5, FSK.d);
    // torso (leaning back)
    for (let i = 0; i <= 40; i++) { const k = i / 40, cx = lerp(x, sx, k), w = Math.round(lerp(20, 18, k)); R(g, cx - w / 2, y - i, w, 1, NAVY.b); R(g, cx - w / 2, y - i, 3, 1, NAVY.d); R(g, cx + w / 2 - 2, y - i, 2, 1, NAVY.l); }
    R(g, x - 10, y - 2, 21, 4, NAVY.d);                                         // hem
    R(g, sx + 2, sy + 10, 8, 9, NAVY.d); R(g, sx + 3, sy + 10, 6, 1, NAVY.l);   // pocket
    ell(g, sx - 3, sy + 1, 7, 5, NAVY.d); ell(g, sx - 2, sy, 5, 3, NAVY.b);      // hood bunched behind the neck
    thick(g, sx + 6, sy + 1, sx + 7, sy + 12, 1, "#c9ced8");                     // drawstring
    // near leg
    thick(g, x + 2, y + 1, x + 32, y - 2, 10, "#3a4050"); thick(g, x + 2, y - 3, x + 32, y - 6, 1, "#565e72");
    thick(g, x + 32, y - 2, x + 38, fy - 6, 9, "#3a4050"); R(g, x + 36, y + 2, 2, fy - y - 8, "#565e72");
    R(g, x + 33, fy - 7, 15, 5, "#20232a"); R(g, x + 33, fy - 7, 15, 1, "#4a505c"); R(g, x + 33, fy - 3, 15, 2, "#c9ced8");
    founderHead(g, hx, hy, t, { ex: o.smile ? "smile" : o.talk ? "talk" : o.ex });
    // near arm with the mug (raise lifts it)
    const ex = sx + 7, ey = sy + 18 - rz * 10;
    const hx2 = lerp(sx + 18, sx + 20, rz), hy2 = lerp(sy + 6, sy - 26, rz);
    thick(g, sx + 1, sy + 3, ex, ey, 8, NAVY.b); thick(g, sx - 1, sy + 2, ex - 2, ey, 1, NAVY.l);
    thick(g, ex, ey, hx2, hy2, 7, NAVY.b); thick(g, ex, ey - 3, hx2, hy2 - 3, 1, NAVY.l);
    R(g, hx2 - 2, hy2 - 2, 5, 3, NAVY.d);                                        // cuff
    // mug
    const mx = Math.round(hx2 - 1), my = Math.round(hy2 - 9);
    R(g, mx, my, 8, 9, "#e9e4da"); R(g, mx, my, 8, 1, "#ffffff"); R(g, mx + 6, my + 1, 2, 8, "#b9b2a6"); R(g, mx + 8, my + 2, 3, 5, "#e9e4da"); R(g, mx + 9, my + 3, 1, 3, "#3a2a20");
    R(g, mx + 1, my + 3, 5, 3, "#d0563a"); R(g, mx + 1, my + 1, 6, 1, "#5a3420");
    R(g, hx2 - 3, hy2 - 3, 4, 5, FSK.b); R(g, hx2 - 3, hy2 - 3, 4, 1, FSK.l);       // hand
    for (let i = 0; i < 3; i++) { const k = (t * 0.6 + i / 3) % 1; A(g, 0.45 * (1 - k), () => R(g, mx + 2 + Math.round(Math.sin(k * 6 + i) * 2), my - 3 - k * 12, 2, 3, "#d8dee9")); }
    return { mx: hx + 14, my: hy + 4 };
  };

  // ---------------- the founder standing/walking side view (facing right), feet at (x, fy) ----------------
  // ph = walk phase (rad), walking = 0..1 amplitude, o.arm = "torch" (arm forward holding a flashlight) | "type"
  const founderWalk = (g, x, fy, ph, t, o) => {
    o = o || {};
    const amp = o.walking === undefined ? 1 : o.walking;
    const bob = -Math.round(Math.abs(Math.sin(ph)) * 2 * amp), hip = fy - 42 + bob, sh = fy - 72 + bob;
    const leg = (p, dark) => {
      const th = Math.sin(p) * 0.5 * amp, kn = (Math.max(0, -Math.cos(p)) * 0.8 + 0.1) * amp;
      const kx = x + Math.sin(th) * 21, ky = hip + Math.cos(th) * 21, fx = kx + Math.sin(th - kn) * 20, fyy = Math.min(fy - 2, ky + Math.cos(th - kn) * 20);
      thick(g, x, hip, kx, ky, 8, dark ? "#262a34" : "#3a4050"); thick(g, kx, ky, fx, fyy, 7, dark ? "#262a34" : "#3a4050");
      if (!dark) thick(g, x + 3, hip, kx + 3, ky, 1, "#565e72");
      R(g, fx - 4, fyy - 1, 12, 5, dark ? "#3a2e2a" : "#6a4e3e"); R(g, fx - 4, fyy + 3, 12, 2, dark ? "#1a1412" : "#3a2a20"); if (!dark) R(g, fx - 4, fyy - 1, 12, 1, "#9a7a62");   // slippers
    };
    leg(ph + Math.PI, true);
    // far arm
    if (o.arm === "type" || o.farType) { const tq = o.farType && !o.typing ? 0 : 1; thick(g, x - 1, sh + 4, x + 12, sh + 20, 7, NAVY.d); thick(g, x + 12, sh + 20, x + 30, sh + 22, 6, NAVY.d); R(g, x + 29, sh + 20 + (tq && Math.sin(t * 20) > 0 ? 1 : 0), 5, 4, FSK.d); }
    else { const a = Math.sin(ph) * 0.5 * amp; thick(g, x - 1, sh + 4, x + Math.sin(a) * 14, sh + 4 + Math.cos(a) * 15, 7, NAVY.d); thick(g, x + Math.sin(a) * 14, sh + 4 + Math.cos(a) * 15, x + Math.sin(a + 0.4) * 26, sh + 4 + Math.cos(a + 0.4) * 27, 6, NAVY.d); }
    leg(ph, false);
    // torso
    R(g, x - 10, sh, 21, hip - sh + 5, NAVY.b); R(g, x - 10, sh, 3, hip - sh + 5, NAVY.d); R(g, x + 8, sh, 3, hip - sh + 5, NAVY.l);
    R(g, x - 10, hip + 1, 21, 4, NAVY.d); R(g, x + 1, sh + 16, 9, 9, NAVY.d); R(g, x + 2, sh + 16, 7, 1, NAVY.l);
    ell(g, x - 8, sh + 2, 6, 5, NAVY.d); thick(g, x + 7, sh + 2, x + 8, sh + 13, 1, "#c9ced8");
    founderHead(g, x + 3, sh - 16, t, { ex: o.smile ? "smile" : o.ex, brow: o.brow });
    // near arm
    if (o.arm === "torch") {
      const aim = o.aim || 0;                                     // radians below horizontal
      const ex = x + 6, ey = sh + 18, hx2 = ex + Math.cos(aim) * 16, hy2 = ey + Math.sin(aim) * 16 - 6;
      thick(g, x + 1, sh + 4, ex, ey, 8, NAVY.b); thick(g, ex, ey, hx2, hy2, 7, NAVY.b); thick(g, ex, ey - 3, hx2, hy2 - 3, 1, NAVY.l);
      R(g, hx2 - 2, hy2 - 3, 5, 5, FSK.b);
      // flashlight body
      const fx2 = hx2 + Math.cos(aim) * 9, fy2 = hy2 + Math.sin(aim) * 9;
      thick(g, hx2 - 2, hy2 - 1, fx2, fy2 - 1, 4, "#2a2e38"); thick(g, hx2, hy2 - 2, fx2, fy2 - 2, 1, "#6a7080");
      R(g, fx2 - 1, fy2 - 4, 3, 6, "#9aa0ac"); R(g, fx2 + 1, fy2 - 3, 1, 4, "#fff6d8");
      return { tx: fx2 + 2, ty: fy2 - 1 };
    }
    if (o.arm === "type") { const tp = Math.sin(t * 22) > 0 ? 1 : 0; thick(g, x + 1, sh + 4, x + 12, sh + 22, 8, NAVY.b); thick(g, x + 12, sh + 22, x + 27, sh + 25, 7, NAVY.b); thick(g, x + 12, sh + 19, x + 27, sh + 22, 1, NAVY.l); R(g, x + 26, sh + 23 + tp, 5, 4, FSK.b); return {}; }
    const a = -Math.sin(ph) * 0.5 * amp; thick(g, x + 1, sh + 4, x + Math.sin(a) * 14, sh + 4 + Math.cos(a) * 15, 8, NAVY.b); thick(g, x + Math.sin(a) * 14, sh + 4 + Math.cos(a) * 15, x + Math.sin(a + 0.4) * 26, sh + 4 + Math.cos(a + 0.4) * 27, 7, NAVY.b);
    return {};
  };

  // ---------------- shared room pieces ----------------
  // monitor bezel with stand, content fn clipped to the screen
  const monitor = (g, x, y, w, h, t, fn, o) => {
    o = o || {};
    if (o.glow !== null) PX.glow(g, x + w / 2, y + h / 2, Math.max(w, h) * 0.9, o.glow || "rgba(90,170,255,0.22)");
    const sx = x + w / 2, sb = o.base || y + h + 24;
    R(g, sx - 5, y + h, 10, sb - y - h - 3, "#22262f"); R(g, sx - 5, y + h, 2, sb - y - h - 3, "#3a3f4b");
    R(g, sx - 20, sb - 4, 40, 4, "#262a33"); R(g, sx - 20, sb - 4, 40, 1, "#4a505e"); A(g, 0.5, () => R(g, sx - 22, sb, 44, 1, "#000"));
    R(g, x - 5, y - 5, w + 10, h + 11, "#1a1d25"); R(g, x - 5, y - 5, w + 10, 1, "#4e5564"); R(g, x - 5, y - 5, 1, h + 11, "#383e4c");
    R(g, x + w + 4, y - 5, 1, h + 11, "#101218"); R(g, x - 5, y + h + 5, w + 10, 1, "#0c0e13");
    R(g, x + w - 7, y + h + 2, 3, 1, PX.blink(t, 2.4, 0.9) ? "#3df56b" : "#1a4a28");
    R(g, x, y, w, h, "#0d1117");
    clip(g, x, y, w, h, () => fn(x, y, w, h));
    A(g, 0.025, () => { for (let i = 0; i < 3; i++) thick(g, x + w * 0.6 + i * 7, y, x + w * 0.6 + i * 7 - h * 0.6, y + h, 3 - i, "#dfe8ff"); });
  };
  const plant = (g, x, y, t, s) => {       // potted plant, base at (x, y)
    s = s || 1;
    R(g, x - 9 * s, y - 12 * s, 18 * s, 12 * s, "#7a4a2c"); R(g, x - 10 * s, y - 14 * s, 20 * s, 3 * s, "#8e5a36"); R(g, x - 9 * s, y - 12 * s, 2, 12 * s, "#9a6440"); R(g, x + 5 * s, y - 12 * s, 4 * s, 12 * s, "#5c361f");
    const sw = Math.sin(t * 1.3) * 1.5;
    [[-30, -9], [-38, 2], [-28, 10], [-24, -6], [-34, 6], [-20, 12], [-22, -12]].forEach(([h, dx], i) => {
      const tx = x + dx * s + sw * (i % 2 ? 1 : -0.6), ty = y + h * s; thick(g, x + dx * 0.2 * s, y - 14 * s, tx, ty, 1, "#2f5e3a");
      ell(g, tx, ty, 4 * s, 2 * s, i % 2 ? "#3d7a4a" : "#4f9a5c"); R(g, tx - 3 * s, ty - 2 * s, 3 * s, 1, "#7fcf8a");
    });
  };
  // chat app (shared look across founder_desk / freeze / confession)
  const chatTop = (g, x, y, w, title, t) => {
    R(g, x, y, w, 14, "#1c2130"); R(g, x, y + 14, w, 1, "#0a0c12");
    bot(g, x + 10, y + 8, 11, t, {}); T(g, title || "AGENT", x + 20, y + 1, { font: "v", size: 13, col: "#c9d1d9" });
    PX.circle(g, x + 20 + PX.tw(g, title || "AGENT", { font: "v", size: 13 }) + 6, y + 7, 2, "#3df56b");
  };
  // fake code line widths (scrolling code panels)
  const codeLines = (g, x, y, w, h, t, seed, scroll, dim) => {
    const cols = ["#ff7b72", "#d2a8ff", "#a5d6ff", "#c9d1d9", "#7d8590", "#79c0ff"], lh = 6;
    const off = scroll || 0, first = Math.floor(off / lh);
    clip(g, x, y, w, h, () => {
      for (let i = first; i < first + Math.ceil(h / lh) + 1; i++) {
        const rr0 = PX.rnd(seed * 31 + i * 7), ind = Math.floor(rr0() * 4) * 6, yy = y + i * lh - off;
        let lx = x + 14 + ind; R(g, x + 2, yy + 2, 6, 1, "#30363d");
        const n = 1 + Math.floor(rr0() * 4);
        for (let k = 0; k < n && lx < x + w - 6; k++) { const ww = 6 + Math.floor(rr0() * 26); R(g, lx, yy + 2, Math.min(ww, x + w - 6 - lx), 2, dim ? "#3a4450" : cols[Math.floor(rr0() * cols.length)]); lx += ww + 4; }
      }
    });
  };

  // =====================================================================
  // founder_desk (7.0): home office at evening; he talks, bubbles fly to the monitor, the agent answers and an
  // app builds itself block by block. o.at [1.1, 2.1, 3.1] block snaps, o.great 4.5 DEPLOYED + mug raise,
  // o.say ["BUILD AN APP", "ADD A LOGIN", "SHOW A TABLE"]
  // =====================================================================
  K.founder_desk = (o) => (g, t, d, c) => {
    const sc = d / 7, great = opt(o, "great", 4.5 * sc), at = opt(o, "at", [1.1, 2.1, 3.1].map((v) => v * sc));
    const say = opt(o, "say", ["BUILD AN APP", "ADD A LOGIN", "SHOW A TABLE"]), sayT = at.map((v) => v - 0.9 * Math.min(1, sc + 0.2));
    const FY = 322, DY = 236;
    // ---- wall (warm evening tones near the window)
    PX.vgrad(g, 0, 0, W, FY, "2a2550", "16142e", 10);
    A(g, 0.05, () => { for (let x = 0; x < W; x += 16) R(g, x, 0, 6, FY, "#c8a0ff"); });
    // ---- window with dusk city (far layer)
    PX.par(g, c, 0.4, () => {
      const wx = 24, wy = 26, ww = 262, wh = 178;
      R(g, wx - 6, wy - 6, ww + 12, wh + 12, "#2c2440");
      PX.vgrad(g, wx, wy, ww, wh, "2a2a66", "e0786a", 9);
      // sun glow at the horizon
      PX.glow(g, wx + 70, wy + wh - 30, 110, "rgba(255,150,90,0.55)");
      PX.circle(g, wx + 70, wy + wh - 40, 11, "#ffcf8a"); PX.circle(g, wx + 70, wy + wh - 40, 9, "#ffe2b0");
      // clouds drifting
      for (let i = 0; i < 4; i++) { const cx = wx + ((i * 83 + t * (3 + i)) % (ww + 80)) - 40, cy = wy + 22 + i * 18;
        ell(g, cx, cy, 22 - i * 2, 3, i % 2 ? "#6a4a8a" : "#8a5a8a"); ell(g, cx + 8, cy - 2, 12, 3, i % 2 ? "#8a5a9a" : "#b06a8a"); R(g, cx - 14, cy - 3, 18, 1, "#f0a0a0"); }
      // plane with blinking light
      const px = wx + ((t * 14) % (ww + 40)) - 20; R(g, px, wy + 34, 5, 1, "#2a2440"); if (PX.blink(t, 0.8, 0.3)) { R(g, px + 5, wy + 34, 1, 1, "#ff5c5c"); PX.glow(g, px + 5, wy + 34, 4, "rgba(255,92,92,0.9)"); }
      // far skyline (dusk silhouettes) then nearer buildings with lit windows
      const r = PX.rnd(17); let bx = wx;
      while (bx < wx + ww) { const bw = 10 + Math.floor(r() * 18), bh = 40 + r() * 50; R(g, bx, wy + wh - bh, bw, bh, "#5a3a6a"); R(g, bx, wy + wh - bh, bw, 1, "#c07a8a"); bx += bw; }
      bx = wx - 4;
      while (bx < wx + ww) { const bw = 14 + Math.floor(r() * 22), bh = 22 + r() * 46, top = wy + wh - bh;
        R(g, bx, top, bw, bh, r() < 0.5 ? "#231a3c" : "#2a1f46"); R(g, bx, top, bw, 1, "#7a4a6a"); R(g, bx + bw - 2, top, 2, bh, "#1a1430");
        if (r() < 0.3) { R(g, bx + bw / 2, top - 6, 1, 6, "#231a3c"); if (PX.blink(t + bx, 1.4, 0.4)) { R(g, bx + bw / 2, top - 7, 1, 1, "#ff5c5c"); PX.glow(g, bx + bw / 2, top - 7, 4, "rgba(255,92,92,.9)"); } }
        for (let yy = top + 4; yy < wy + wh - 3; yy += 5) for (let xx = bx + 2; xx < bx + bw - 3; xx += 4) { const on = r(); if (on < 0.32) R(g, xx, yy, 2, 2, Math.sin(t * 0.6 + xx * 0.3 + yy) > -0.7 ? "#f7c948" : "#4a3a28"); }
        bx += bw + 1; }
      // frame + mullions
      R(g, wx + ww / 2 - 2, wy, 4, wh, "#2c2440"); R(g, wx, wy + 70, ww, 3, "#2c2440"); R(g, wx + ww / 2 - 2, wy, 1, wh, "#4a3e60");
      R(g, wx - 10, wy + wh + 4, ww + 20, 6, "#3e3456"); R(g, wx - 10, wy + wh + 4, ww + 20, 1, "#8a6a8a");
      // window sill plant + light spill on wall
      plant(g, wx + 20, wy + wh + 4, t, 0.7);
    });
    // warm light projected onto the right wall
    PX.par(g, c, 0.55, () => {
      // shelf, picture frame, clock
      R(g, 470, 66, 130, 4, "#5a3e2b"); R(g, 470, 66, 130, 1, "#8a6446"); R(g, 470, 70, 130, 2, "#22180f");
      const bk = ["#8e3b46", "#2f6690", "#3a7d5c", "#6a4c93", "#b8642f", "#2a8a86"]; let bx = 476;
      bk.forEach((col, i) => { const h = 15 + (i * 5) % 7, w = 5 + (i % 2); R(g, bx, 66 - h, w, h, col); R(g, bx, 66 - h, 1, h, "rgba(255,255,255,.22)"); bx += w + 1; });
      R(g, 540, 52, 22, 14, "#1b1e26"); R(g, 542, 54, 18, 10, "#d8c8a0"); R(g, 544, 56, 14, 6, "#6a8aa8");   // photo frame
      plant(g, 584, 66, t, 0.7);
      R(g, 360, 46, 60, 44, "#1b1830"); R(g, 362, 48, 56, 40, "#2c2a50"); PX.vgrad(g, 364, 50, 52, 24, "3a2a6a", "f2a05c", 5);
      for (let i = 0; i < 5; i++) R(g, 366 + i * 10, 64 - (i * 7) % 12, 8, 10 + (i * 7) % 12, "#1b1830");
      R(g, 364, 74, 52, 12, "#14122a"); T(g, "SHIP IT", 390, 76, { size: 8, col: "#f7c948", align: "center" });
    });
    // ---- floor
    PX.vgrad(g, 0, FY, W, H - FY, "3a2a24", "1e1612", 4);
    for (let i = 0; i < 9; i++) R(g, 0, FY + 4 + i * 5 + i * i * 0.6, W, 1, "#2a1e18");
    const r2 = PX.rnd(5); for (let i = 0; i < 24; i++) R(g, Math.floor(r2() * W), FY + 6 + Math.floor(r2() * 36), 1, 4, "#2a1e18");
    R(g, 0, FY, W, 2, "#120c0a");
    ell(g, 200, FY + 18, 120, 12, "#2a1c34"); ell(g, 200, FY + 17, 114, 10, "#3e2848"); ell(g, 200, FY + 17, 100, 7, "#342240"); for (let i = 0; i < 12; i++) R(g, 110 + i * 15, FY + 16, 6, 1, "#5a3a5a");   // rug
    // sunset light on the floor through the window
    A(g, 0.12, () => poly(g, [[60, FY + 4], [250, FY + 4], [300, H], [80, H]], "#ffb070"));
    // ---- desk
    R(g, 290, DY, 360, 10, "#6a4a33"); R(g, 290, DY, 360, 1, "#9a7050"); R(g, 290, DY + 10, 360, 3, "#3a281b");
    R(g, 300, DY + 13, 8, FY - DY - 13, "#3a281b"); R(g, 300, DY + 13, 2, FY - DY - 13, "#5a3e2b");
    R(g, 600, DY + 13, 8, FY - DY - 13, "#2a1d14");
    R(g, 330, DY + 13, 120, 30, "#4a3424"); R(g, 330, DY + 13, 120, 1, "#6a4a33"); R(g, 384, DY + 26, 14, 2, "#9a7a5a");   // drawer
    // PC tower under the desk with LEDs
    R(g, 520, DY + 30, 34, FY - DY - 30, "#1a1d25"); R(g, 520, DY + 30, 34, 1, "#3a3f4b"); R(g, 520, DY + 30, 1, FY - DY - 30, "#2e333e");
    for (let i = 0; i < 3; i++) { const on = PX.blink(t + i * 0.37, 0.9 + i * 0.3, 0.5); R(g, 526, DY + 38 + i * 5, 2, 2, on ? ["#3df56b", "#5fe3e8", "#f25ca8"][i] : "#2a2f3a"); }
    for (let i = 0; i < 5; i++) R(g, 532, DY + 40 + i * 6, 18, 2, "#11141a");
    PX.glow(g, 536, DY + 50, 30, "rgba(95,227,232,0.25)");
    // ---- monitors
    const bubT = (i) => sayT[i] + 0.85;
    // left: chat with the agent
    monitor(g, 306, 116, 124, 86, t, (x, y, w, h) => {
      R(g, x, y, w, h, "#11141d"); chatTop(g, x, y, w, "AGENT", t);
      let yy = y + 17;
      for (let i = 0; i < say.length; i++) {
        if (t < bubT(i)) break;
        const k = pop(t, bubT(i), 0.25), tw0 = Math.min(w - 30, PX.tw(g, say[i], { font: "v", size: 10 }) + 8);
        PX.zoom(g, Math.max(0.05, k), x + w - 4, yy + 4, () => { rr(g, x + w - 4 - tw0, yy, tw0, 10, "#2e3f74"); T(g, say[i], x + w - tw0, yy, { font: "v", size: 10, col: "#e6edf3" }); });
        yy += 11;
        if (t >= bubT(i) + 0.3) { const ok = i === say.length - 1 ? "DONE!" : "ON IT!", k2 = pop(t, bubT(i) + 0.3, 0.25);
          PX.zoom(g, Math.max(0.05, k2), x + 16, yy + 4, () => { bot(g, x + 8, yy + 4, 8, t, { ex: "happy", noBlink: true }); rr(g, x + 15, yy, 32, 10, "#1f2a36"); T(g, ok, x + 18, yy, { font: "v", size: 10, col: "#5fe3e8" }); });
          yy += 11; }
      }
    }, { glow: "rgba(95,200,255,0.22)" });
    // right: the app building itself
    monitor(g, 444, 110, 140, 92, t, (x, y, w, h) => {
      R(g, x, y, w, h, "#1a2136"); R(g, x, y, w, 8, "#262f4a"); R(g, x + 3, y + 2, 3, 3, "#ff5c5c"); R(g, x + 8, y + 2, 3, 3, "#f7c948"); R(g, x + 13, y + 2, 3, 3, "#3df56b"); rr(g, x + 22, y + 2, 70, 4, "#3a4566");
      // ghost outline placeholders
      A(g, 0.5, () => { for (let yy = y + 12; yy < y + h - 4; yy += 4) for (let xx = x + 4; xx < x + w - 4; xx += 4) R(g, xx, yy, 1, 1, "#2e3858"); });
      const blk = (i, fn, by) => { if (t < at[i]) return; const k = PX.p(t, at[i], 0.35, "back"); g.save(); g.translate(0, Math.round((1 - k) * -18)); A(g, cl((t - at[i]) / 0.12, 0, 1), fn); g.restore(); };
      blk(0, () => { R(g, x + 4, y + 12, w - 8, 14, "#2e3f74"); R(g, x + 4, y + 12, w - 8, 1, "#4a62a8"); PX.circle(g, x + 12, y + 19, 4, "#5fe3e8"); R(g, x + 20, y + 16, 36, 3, "#c9d6ff"); R(g, x + 20, y + 21, 22, 2, "#7a8ac0"); for (let i = 0; i < 3; i++) R(g, x + w - 44 + i * 13, y + 18, 10, 2, "#9aaad8"); });
      blk(1, () => { [["#c2457f", 0], ["#3466c8", 1], ["#2a3352", 2]].forEach(([col, i]) => { rr(g, x + 6 + i * 30, y + 30, 26, 10, col); R(g, x + 7 + i * 30, y + 30, 24, 1, i === 2 ? "#4a5578" : "#ffffff55"); R(g, x + 11 + i * 30, y + 34, 16, 2, i === 2 ? "#8a96b8" : "#f0f4ff"); });
        rr(g, x + 98, y + 30, w - 104, 10, "#232b45"); R(g, x + 98, y + 39, w - 104, 1, "#3a4566"); R(g, x + 101, y + 34, 18, 2, "#6a7698"); });
      blk(2, () => { R(g, x + 6, y + 44, w - 12, 42, "#20283f"); R(g, x + 6, y + 44, w - 12, 7, "#2e3858"); for (let cI = 0; cI < 4; cI++) R(g, x + 10 + cI * 32, y + 46, 18, 2, "#9aa6c8");
        for (let rI = 0; rI < 5; rI++) { R(g, x + 6, y + 51 + rI * 7, w - 12, 1, "#2a3350"); for (let cI = 0; cI < 4; cI++) R(g, x + 10 + cI * 32, y + 54 + rI * 7, 8 + ((rI * 5 + cI * 3) % 14), 2, cI === 3 ? (rI % 2 ? "#3df56b" : "#f7c948") : "#6a7698"); } });
      // deploying progress strip
      if (t >= at[2] + 0.5 && t < great) { const k = cl((t - at[2] - 0.5) / Math.max(0.3, great - at[2] - 0.5), 0, 1); R(g, x + 6, y + h - 4, w - 12, 2, "#2e3858"); R(g, x + 6, y + h - 4, Math.round((w - 12) * k), 2, "#3d7cf5"); }
    }, { glow: "rgba(110,150,255,0.26)" });
    // sparkles on each snap (in screen space, above the monitor content)
    at.forEach((a, i) => sparkles(g, 514 + (i - 1) * 30, 128 + i * 24, t, a + 0.1, 8, 26, 11 + i));
    // keyboard + mouse + lamp + mug-stand clutter
    R(g, 380, DY - 4, 80, 5, "#2b2f38"); R(g, 380, DY - 4, 80, 1, "#5a6070"); for (let kx = 0; kx < 12; kx++) R(g, 383 + kx * 6, DY - 3, 5, 2, "#4a505c");
    R(g, 470, DY - 3, 7, 4, "#3a3f4b"); R(g, 470, DY - 3, 7, 1, "#6a7080");
    R(g, 560, DY - 6, 22, 6, "#d8c8a0"); R(g, 562, DY - 9, 18, 3, "#e8dcc0"); R(g, 560, DY - 6, 22, 1, "#fff0d0");   // papers
    // desk lamp (right)
    R(g, 600, DY - 3, 16, 3, "#2b2f38"); thick(g, 608, DY - 3, 616, DY - 40, 2, "#3a3f4b"); thick(g, 616, DY - 40, 600, DY - 54, 2, "#3a3f4b");
    poly(g, [[592, DY - 58], [606, DY - 52], [602, DY - 44], [590, DY - 50]], "#3a3f4b"); R(g, 591, DY - 50, 8, 2, "#ffd28a");
    PX.glow(g, 594, DY - 40, 70, "rgba(255,190,110,0.45)", 0.9 + 0.1 * Math.sin(t * 17));
    // ---- the chair + founder
    const cx0 = 196, seatY = 262;
    // chair back (reclined) behind him
    thick(g, cx0 - 16, seatY - 2, cx0 - 30, seatY - 52, 9, "#23262e"); thick(g, cx0 - 14, seatY - 4, cx0 - 27, seatY - 52, 1, "#4a505c");
    const raise = t >= great ? PX.p(t, great, 0.5, "back") : 0;
    const talking = t < at[2] + 0.2;
    const mouth = founderSit(g, cx0, seatY, FY, t, { talk: talking, raise, smile: t >= great - 0.2 || (t > at[0] + 0.3 && t < at[0] + 0.9) });
    // seat + base
    R(g, cx0 - 18, seatY + 1, 40, 7, "#2a2d36"); R(g, cx0 - 18, seatY + 1, 40, 1, "#4a505c");
    R(g, cx0 - 2, seatY + 8, 4, FY - seatY - 16, "#3a3f4b"); R(g, cx0 - 2, seatY + 8, 1, FY - seatY - 16, "#6a7080");
    R(g, cx0 - 24, FY - 9, 48, 3, "#2a2d36"); for (const wx of [-24, 0, 21]) { R(g, cx0 + wx, FY - 6, 4, 4, "#16181e"); }
    // armrest
    R(g, cx0 - 8, seatY - 16, 26, 3, "#2a2d36"); R(g, cx0 + 6, seatY - 13, 3, 14, "#2a2d36");
    // ---- speech bubbles flying from his mouth to the left monitor
    say.forEach((s, i) => {
      const t0 = sayT[i]; if (t < t0 || t > t0 + 0.9) return;
      const k = PX.ease((t - t0) / 0.9, "io"), x0 = mouth.mx + 6, y0 = mouth.my - 18, x1 = 380, y1 = 150;
      const bx = lerp(x0, x1, k), by = lerp(y0, y1, k) - Math.sin(k * 3.14) * 26, bw = PX.tw(g, s, { font: "v", size: 12 }) + 10;
      const a = k < 0.8 ? 1 : 1 - (k - 0.8) / 0.2, sca = k < 0.15 ? pop(t, t0, 0.15) : 1;
      A(g, a, () => PX.zoom(g, Math.max(0.05, sca), bx, by, () => { bubble(g, bx - bw / 2, by - 7, bw, 13, bx - bw / 2 + 4 - k * 10, by + 10, "#f2ecdf"); T(g, s, bx, by - 6, { font: "v", size: 12, col: "#1a1830", align: "center" }); }));
    });
    // ---- DEPLOYED badge
    if (t >= great) {
      const k = pop(t, great, 0.4), bx = 514, by = 98;
      PX.glow(g, bx, by + 6, 60, "rgba(61,245,107,0.5)", 0.6 + 0.2 * Math.sin(t * 6));
      PX.zoom(g, Math.max(0.05, k), bx, by + 6, () => {
        rr2(g, bx - 46, by - 2, 92, 18, "#0b2a14"); rr2(g, bx - 45, by - 1, 90, 16, "#1f8a40"); R(g, bx - 42, by, 84, 1, "#7affa0");
        tick(g, bx - 40, by + 2, 10, "#eaffef"); T(g, "DEPLOYED", bx + 6, by + 3, { size: 8, col: "#eaffef", align: "center" });
      });
      sparkles(g, bx, by + 6, t, great, 14, 60, 41);
      // little confetti burst
      const r = PX.rnd(23), tt = t - great;
      for (let i = 0; i < 26; i++) { const a = r() * 6.283, v = 40 + r() * 70, x = bx + Math.cos(a) * v * Math.min(tt, 0.6), y = by + Math.sin(a) * v * Math.min(tt, 0.6) + 30 * Math.max(0, tt - 0.3) ** 2 * 3;
        if (tt < 2.2) R(g, x, y, 2, (Math.floor(tt * 10 + i) % 2) + 1, ["#f7c948", "#f25ca8", "#5fe3e8", "#3df56b"][i % 4]); }
    }
    // dust in the evening light + vignette
    PX.particles(g, 31, 30, t, [40, 60, 260, 240], { vy: -2, vx: 3, col: "#ffd8b0", a: 0.55 });
    PX.vignette(g, 0.5);
  };

  // tiny founder portrait for chat (12x12)
  const founderIcon = (g, x, y) => {
    rr(g, x, y, 12, 12, "#2a3350"); R(g, x + 2, y + 9, 8, 3, NAVY.b); R(g, x + 4, y + 3, 5, 6, FSK.b); R(g, x + 3, y + 2, 7, 2, GREY.b); R(g, x + 3, y + 2, 2, 4, GREY.b); R(g, x + 7, y + 5, 1, 1, "#2a1a14");
  };
  // frost over a rect: k = 0..1 coverage, crystals grow from the edges
  const frost = (g, x, y, w, h, k, t, seed) => {
    if (k <= 0) return;
    const r = PX.rnd(seed || 5), md = Math.min(w, h) / 2;
    for (let yy = 0; yy < h; yy += 3) for (let xx = 0; xx < w; xx += 3) {
      const ed = Math.min(xx, yy, w - xx, h - yy) / md, th = ed * 0.85 + r() * 0.3;
      if (th < k * 0.95) { const a = cl((k * 0.95 - th) * 3, 0, 1); g.globalAlpha = 0.10 + 0.22 * a; R(g, x + xx, y + yy, 3, 3, th < k * 0.5 ? "#8cc4e0" : "#5a9cc4"); if (a > 0.6 && ((xx + yy) / 3) % 2 === 0) R(g, x + xx + 1, y + yy + 1, 1, 1, "#d8f4ff"); }
    }
    g.globalAlpha = 1;
    const N = Math.round((w + h) / 9);
    for (let i = 0; i < N; i++) {
      const side = Math.floor(r() * 4), u = r(), len0 = (14 + r() * 34) * k * (0.6 + 0.4 * Math.min(1, k * 2));
      let ox, oy, ang;
      if (side === 0) { ox = x + u * w; oy = y; ang = 1.57; } else if (side === 1) { ox = x + u * w; oy = y + h; ang = -1.57; }
      else if (side === 2) { ox = x; oy = y + u * h; ang = 0; } else { ox = x + w; oy = y + u * h; ang = 3.14; }
      ang += (r() - 0.5) * 0.9;
      const ex = ox + Math.cos(ang) * len0, ey = oy + Math.sin(ang) * len0;
      A(g, 0.85, () => PX.line(g, ox, oy, ex, ey, "#d8f4ff"));
      for (let s2 = 5; s2 < len0; s2 += 5) {
        const bx = ox + Math.cos(ang) * s2, by = oy + Math.sin(ang) * s2, bl = (len0 - s2) * 0.35;
        A(g, 0.7, () => { PX.line(g, bx, by, bx + Math.cos(ang + 1.05) * bl, by + Math.sin(ang + 1.05) * bl, "#bfe8ff"); PX.line(g, bx, by, bx + Math.cos(ang - 1.05) * bl, by + Math.sin(ang - 1.05) * bl, "#bfe8ff"); });
      }
      if (len0 > 6 && PX.blink(t + i * 0.37, 1.7, 0.2)) R(g, ex, ey, 1, 1, "#ffffff");
    }
  };

  // =====================================================================
  // freeze (9.0): close on the monitor: chat + code panels. The founder types "CODE FREEZE." / "NO MORE CHANGES" /
  // "WITHOUT MY PERMISSION" (big, red flash at o.caps 5.0); frost creeps over the code from o.ice 1.0; padlock clicks
  // shut on the PROD tab at o.lock (ice+1.4); the agent nods "OK" at o.ok (caps+1.6). o.l1 0.3 / o.l2 2.4 line starts.
  // =====================================================================
  K.freeze = (o) => (g, t, d, c) => {
    const sc = d / 9, s1 = Math.min(1, sc + 0.2), ice = opt(o, "ice", 1.0 * sc), caps = opt(o, "caps", 5.0 * sc), lock = opt(o, "lock", ice + 1.4 * s1), okT = opt(o, "ok", caps + 1.6 * s1);
    const L = opt(o, "lines", ["CODE FREEZE.", "NO MORE CHANGES", "WITHOUT MY PERMISSION"]);
    const l1 = opt(o, "l1", 0.3 * sc), l2 = opt(o, "l2", 2.4 * sc);
    // ---- back wall (far)
    PX.vgrad(g, 0, 0, W, H, "1a1f3e", "0c0f20", 9);
    PX.par(g, c, 0.4, () => {
      A(g, 0.06, () => { for (let x = 0; x < W; x += 12) R(g, x, 0, 4, H, "#9aa8ff"); });
      R(g, 8, 30, 64, 84, "#2a2236"); R(g, 12, 34, 56, 76, "#3a2e4e"); PX.vgrad(g, 14, 36, 52, 40, "2a2a66", "c8607a", 5); for (let i = 0; i < 5; i++) R(g, 16 + i * 10, 60 - (i * 5) % 10, 8, 16 + (i * 5) % 10, "#1e1830");
      R(g, 570, 40, 60, 46, "#1e2236"); R(g, 572, 42, 56, 42, "#2a3a5a"); for (let i = 0; i < 4; i++) R(g, 576, 48 + i * 8, 30 + (i * 13) % 18, 2, "#6a7aa8");
    });
    PX.glow(g, 20, 20, 160, "rgba(255,190,110,0.30)");
    // ---- desk (mid)
    PX.par(g, c, 0.8, () => {
      R(g, 0, 300, W, 60, "#4a3424"); R(g, 0, 300, W, 1, "#7a573d");
      const r = PX.rnd(21); for (let i = 0; i < 30; i++) R(g, Math.floor(r() * W), 304 + Math.floor(r() * 50), 14 + Math.floor(r() * 40), 1, r() < 0.5 ? "#3e2c1e" : "#56402c");
    });
    // ---- the monitor
    const X = 96, Y = 26, MW = 448, MH = 252;
    PX.glow(g, X + MW / 2, Y + MH / 2, 330, "rgba(90,170,255,0.18)");
    const iceK = cl((t - ice) / 3.2, 0, 1);
    R(g, X + MW / 2 - 14, Y + MH + 8, 28, 20, "#22262f"); R(g, X + MW / 2 - 14, Y + MH + 8, 3, 20, "#3a3f4b"); R(g, X + MW / 2 - 60, Y + MH + 26, 120, 6, "#262a33"); R(g, X + MW / 2 - 60, Y + MH + 26, 120, 1, "#4a505e");
    R(g, X - 9, Y - 9, MW + 18, MH + 20, "#1a1d25"); R(g, X - 9, Y - 9, MW + 18, 1, "#4e5564"); R(g, X - 9, Y - 9, 1, MH + 20, "#3a404e"); R(g, X + MW + 8, Y - 9, 1, MH + 20, "#0e1016"); R(g, X - 9, Y + MH + 10, MW + 18, 1, "#0a0b10");
    R(g, X + MW - 12, Y + MH + 4, 4, 2, PX.blink(t, 2.4, 0.9) ? "#3df56b" : "#1a4a28");
    clip(g, X, Y, MW, MH, () => {
      R(g, X, Y, MW, MH, "#0f131c");
      // tab bar
      R(g, X, Y, MW, 14, "#161b26"); R(g, X, Y + 14, MW, 1, "#0a0c12");
      [["app.py", 0], ["db.sql", 1], ["PROD", 2]].forEach(([nm, i]) => { const tx = X + 4 + i * 66, prod = i === 2, locked = prod && t >= lock;
        R(g, tx, Y + 2, 62, 12, i === 0 ? "#0f131c" : prod ? (locked ? "#1e3446" : "#3a1a22") : "#1b2130"); R(g, tx, Y + 2, 62, 1, prod ? (locked ? "#8ad0f0" : "#ff5c5c") : i === 0 ? "#5fe3e8" : "#2a3142");
        T(g, nm, tx + (prod ? 22 : 6), Y + 3, { font: "v", size: 11, col: prod ? (locked ? "#bfe8ff" : "#ff9a9a") : "#9aa4b2" });
        if (prod && t >= lock - 0.6) { const pk = t < lock ? 0 : PX.p(t, lock, 0.18, "back"); padlock(g, tx + 6, Y + 5 - Math.round((1 - Math.min(1, pk)) * 2), Math.min(1, pk), "#f7c948");
          if (t >= lock && t < lock + 0.5) { PX.glow(g, tx + 12, Y + 9, 24, "rgba(255,230,140,0.9)", 1 - (t - lock) / 0.5); star4(g, tx + 20, Y + 3, 2, "#fff3b0"); } } });
      // code panels (left)
      const CX = X + 2, CW = 228, scroll = Math.min(t, ice + iceK * 1.5) * 9;
      for (const [py, ph, seed, nm] of [[Y + 18, 112, 7, "routes.py"], [Y + 134, 114, 13, "models.py"]]) {
        R(g, CX, py, CW, ph, "#0d1117"); R(g, CX, py, CW, 9, "#161b22"); T(g, nm, CX + 4, py, { font: "v", size: 10, col: "#8b949e" });
        R(g, CX, py + 9, 12, ph - 9, "#0b0f14");
        codeLines(g, CX, py + 11, CW - 4, ph - 13, t, seed, scroll + seed * 6);
        frost(g, CX, py, CW, ph, iceK * (seed === 7 ? 1 : 0.95), t, seed + 50);
      }
      if (iceK > 0) { PX.particles(g, 77, 30, t, [CX, Y + 18, CW, 230], { vy: 4, vx: -2, col: "#e8f8ff", a: 0.7 * iceK }); PX.glow(g, CX + CW / 2, Y + 130, 140, "rgba(150,210,255,0.25)", iceK * 0.5); }
      // chat (right)
      const QX = X + 234, QW = MW - 236;
      R(g, QX, Y + 15, QW, MH - 15, "#121722"); R(g, QX, Y + 15, 1, MH - 15, "#0a0c12");
      chatTop(g, QX + 1, Y + 15, QW - 1, "AGENT", t);
      const split = (txt) => { const i = txt.lastIndexOf(" ", 12); return txt.length > 12 && i > 0 ? [txt.slice(0, i), txt.slice(i + 1)] : [txt]; };
      const msg = (txt, t0, yy, big) => {
        if (t < t0) return 0;
        const lines = big ? split(txt) : [txt], sz = big ? 16 : 8, lh = big ? 20 : 12, cps = big ? 9 : 14;
        const bw = Math.max(...lines.map((s0) => PX.tw(g, s0, { size: sz }))) + 12, bh = lines.length * lh + 6, bx = QX + QW - bw - 20;
        const k = pop(t, t0, 0.25), flash = big && t < t0 + 1.6 && PX.blink(t - t0, 0.24, 0.5);
        PX.zoom(g, Math.max(0.05, k), bx + bw, yy, () => {
          if (big) PX.glow(g, bx + bw / 2, yy + bh / 2, bw * 0.8, "rgba(255,80,80,0.6)", flash ? 0.9 : 0.25);
          rr2(g, bx - 2, yy - 2, bw + 4, bh + 4, big ? (flash ? "#ff5c5c" : "#a83a3a") : "#0a0c12");
          rr2(g, bx, yy, bw, bh, big ? "#3a1a26" : "#2e3f74"); R(g, bx + 2, yy, bw - 4, 1, big ? "#7a3a4a" : "#4a62a8");
          let used = Math.floor((t - t0) * cps);
          lines.forEach((ln, i) => { T(g, ln.slice(0, cl(used, 0, ln.length)), bx + 6, yy + 4 + i * lh, { size: sz, col: big ? "#ffe0e0" : "#e6edf3" }); used -= ln.length + 1; });
          founderIcon(g, QX + QW - 16, yy + bh - 12);
        });
        return bh + 8;
      };
      let yy = Y + 36;
      yy += msg(L[0], l1, yy, false);
      yy += msg(L[1], l2, yy, false);
      yy += msg(L[2], caps, yy, true);
      // agent reply: typing dots then a nodding "OK"
      if (t >= okT - 0.8) {
        const ay = Math.max(yy + 4, Y + 150), nod = t >= okT ? Math.round(Math.abs(Math.sin((t - okT) * 7)) * 4 * cl(1 - (t - okT) / 2.2, 0, 1)) : 0, bw = 46;
        bot(g, QX + 22, ay + 14, 28, t, { nod, ex: t >= okT ? "happy" : "neutral", noBlink: t >= okT });
        rr2(g, QX + 42, ay + 4, bw, 22, "#1f2a36"); R(g, QX + 44, ay + 4, bw - 4, 1, "#2e4050");
        if (t < okT) for (let i = 0; i < 3; i++) R(g, QX + 52 + i * 9, ay + 13 + (Math.floor(t * 8 + i) % 2), 4, 4, "#9aa4b2");
        else { const k = pop(t, okT, 0.3); PX.zoom(g, Math.max(0.05, k), QX + 65, ay + 15, () => T(g, "OK", QX + 66, ay + 8, { size: 16, col: "#3df56b", align: "center" })); }
      }
      // input box with a blinking caret
      R(g, QX + 6, Y + MH - 18, QW - 12, 13, "#0c1018"); R(g, QX + 6, Y + MH - 18, QW - 12, 1, "#2a3142");
      if (PX.blink(t, 1, 0.5)) R(g, QX + 10, Y + MH - 15, 1, 8, "#c9d1d9");
      A(g, 0.03, () => { for (let i = 0; i < 3; i++) thick(g, X + MW * 0.62 + i * 10, Y, X + MW * 0.62 + i * 10 - 160, Y + MH, 4 - i, "#dfe8ff"); });
    });
    // frost creeping onto the bezel corner
    // sticky notes on the bezel
    const note = (x, y, col, dk, rot, seed) => { g.save(); g.translate(x, y); g.rotate(rot + Math.sin(t * 1.7 + seed) * 0.015);
      R(g, -14, -12, 30, 28, "rgba(0,0,0,.35)"); R(g, -15, -14, 30, 28, col); R(g, -15, -14, 30, 4, dk); R(g, -15, 13, 30, 1, dk);
      const r = PX.rnd(seed); for (let i = 0; i < 3; i++) R(g, -11, -6 + i * 6, 12 + Math.floor(r() * 10), 1, "#4a3a20"); g.restore(); };
    note(X - 2, Y + 8, "#f2d36b", "#d8b440", -0.12, 3);
    note(X + MW + 4, Y + MH - 24, "#f29ac0", "#d86a98", 0.1, 8);
    note(X + MW + 2, Y + MH - 52, "#9ad8f2", "#6ab0d8", -0.06, 12);
    // ---- foreground: keyboard edge, mug, plant (closer than the world)
    PX.par(g, c, 1.15, () => {
      R(g, 190, 326, 260, 40, "#23262e"); R(g, 190, 326, 260, 2, "#4a505c");
      for (let ky = 0; ky < 3; ky++) for (let kx = 0; kx < 20; kx++) { const press = t > l1 && t < caps + 2.5 && (Math.floor(t * 16) + kx * 3 + ky * 7) % 19 === 0; R(g, 194 + kx * 13, 331 + ky * 10 + (press ? 1 : 0), 11, 7, press ? "#8a92a2" : "#3a3f4b"); R(g, 194 + kx * 13, 331 + ky * 10 + (press ? 1 : 0), 11, 1, "#5a6070"); }
      const mx = 40, my = 298; R(g, mx, my, 20, 24, "#c94a3a"); R(g, mx, my, 20, 2, "#e86a5a"); R(g, mx + 15, my + 2, 5, 22, "#9a3428"); R(g, mx + 20, my + 6, 6, 12, "#c94a3a"); R(g, mx + 22, my + 9, 2, 6, "#4a3424"); R(g, mx + 2, my + 2, 15, 3, "#3a2416");
      for (let i = 0; i < 4; i++) { const k = (t * 0.5 + i / 4) % 1; A(g, 0.4 * (1 - k), () => R(g, mx + 6 + Math.round(Math.sin(k * 6 + i) * 3), my - 4 - k * 26, 3, 4, "#d8dee9")); }
      plant(g, 604, 352, t, 2);
    });
    PX.vignette(g, 0.55);
  };

  // =====================================================================
  // goodnight (3.0): night street; the founder's window light goes off at o.off 0.6; across the street a small
  // data-centre box keeps blinking, one LED turns from green to red at o.red 2.2.
  // =====================================================================
  K.goodnight = (o) => {
    const SR = PX.rnd(404), STARS = [];
    for (let i = 0; i < 90; i++) STARS.push([SR() * W, SR() * 170, SR() < 0.15 ? 2 : 1, SR() * 6.28]);
    return (g, t, d, c) => {
      const sc = d / 3, off = opt(o, "off", 0.6 * sc), red = opt(o, "red", 2.2 * sc);
      // ---- sky
      PX.vgrad(g, 0, 0, W, 230, "080b20", "232a5a", 10);
      for (const [x, y, s, ph] of STARS) { g.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.2 + ph)); R(g, x, y, s, s, "#dfe6ff"); }
      g.globalAlpha = 1;
      PX.par(g, c, 0.15, () => {
        PX.glow(g, 498, 58, 90, "rgba(200,210,255,0.35)");
        PX.circle(g, 498, 58, 15, "#c9cbb0"); PX.circle(g, 496, 56, 14, "#f2f0d6"); PX.circle(g, 502, 62, 3, "#d8d6bc"); PX.circle(g, 491, 52, 2, "#d8d6bc"); PX.circle(g, 494, 64, 2, "#e0dec4");
        for (let i = 0; i < 5; i++) { const cx = ((i * 157 + t * (5 + i * 1.5)) % (W + 160)) - 80, cy = 34 + i * 22;
          A(g, 0.75, () => { ell(g, cx, cy, 30 - i * 2, 5, "#2a3060"); ell(g, cx + 12, cy - 3, 16, 5, "#343a70"); R(g, cx - 20, cy - 5, 26, 1, "#6a70a8"); }); }
      });
      // ---- far city
      PX.par(g, c, 0.3, () => {
        const r = PX.rnd(9); let bx = -10;
        while (bx < W + 10) { const bw = 14 + Math.floor(r() * 24), bh = 20 + r() * 44; R(g, bx, 214 - bh, bw, bh + 20, "#151a3a");
          for (let k = 0; k < 4; k++) if (r() < 0.6) R(g, bx + 3 + Math.floor(r() * (bw - 6)), 214 - bh + 4 + Math.floor(r() * bh * 0.7), 1, 1, Math.sin(t + k + bx) > -0.5 ? "#c8a050" : "#3a3020");
          bx += bw; }
      });
      // ---- far side of the street (mid layer): houses, trees, the founder's house
      PX.par(g, c, 0.6, () => {
        R(g, -20, 214, W + 40, 40, "#141a30");                                 // lawns
        // neighbour houses (dark)
        const house = (x, w, hgt, roof, col, win) => {
          R(g, x, 250 - hgt, w, hgt, col); R(g, x, 250 - hgt, 2, hgt, "#2a3050");
          poly(g, [[x - 6, 250 - hgt], [x + w / 2, 250 - hgt - roof], [x + w + 6, 250 - hgt]], "#1a1e36"); thick(g, x - 6, 250 - hgt, x + w / 2, 250 - hgt - roof, 1, "#3a4070");
          win.forEach(([wx, wy, cl0]) => { R(g, x + wx - 1, 250 - hgt + wy - 1, 12, 12, "#0c0f1e"); R(g, x + wx, 250 - hgt + wy, 10, 10, cl0); R(g, x + wx + 4, 250 - hgt + wy, 1, 10, "#0c0f1e"); });
        };
        house(-10, 90, 50, 26, "#20253f", [[14, 14, "#141a32"], [56, 14, "#141a32"]]);
        house(400, 100, 54, 28, "#1e2340", [[16, 14, "#141a32"], [70, 14, PX.blink(t, 0.37, 0.6) ? "#2a4a8a" : "#24407a"]]);   // TV glow
        house(530, 120, 48, 24, "#20253f", [[20, 14, "#141a32"], [86, 14, "#141a32"]]);
        // trees
        for (const [tx, s] of [[96, 1], [372, 0.9], [612, 1.1]]) { R(g, tx - 2, 226, 4, 24, "#1a1410"); ell(g, tx, 214, 18 * s, 22 * s, "#12221e"); ell(g, tx - 4, 208, 12 * s, 14 * s, "#183028"); R(g, tx - 10, 198, 8, 1, "#2a4a3a"); }
        // the founder's house: two storeys, chimney, porch
        const hx = 150, hw = 180;
        R(g, hx + 130, 128, 14, 30, "#2a2236"); R(g, hx + 128, 126, 18, 4, "#3a3048");
        poly(g, [[hx - 10, 162], [hx + hw / 2, 112], [hx + hw + 10, 162]], "#22213c"); thick(g, hx - 10, 162, hx + hw / 2, 112, 2, "#4a4878"); thick(g, hx + hw / 2, 112, hx + hw + 10, 162, 1, "#141428");
        for (let i = 0; i < 6; i++) R(g, hx + 10 + i * 4, 156 - i * 6, hw - 20 - i * 8, 1, "#2c2b4a");
        R(g, hx, 162, hw, 90, "#252a48"); R(g, hx, 162, 2, 90, "#4a5078"); R(g, hx + hw - 3, 162, 3, 90, "#1c2038");
        for (let yy = 168; yy < 250; yy += 6) R(g, hx + 2, yy, hw - 5, 1, "#1f2340");          // siding
        R(g, hx, 204, hw, 3, "#22263e");
        // upstairs windows: left one = his bedroom
        const lit = t < off || (t < off + 0.18 && PX.blink(t, 0.06, 0.5));
        const wlx = hx + 30, wly = 172, wW = 26, wH = 22;
        if (t < off + 0.6) PX.glow(g, wlx + wW / 2, wly + wH / 2, 60, "rgba(255,190,110,0.7)", lit ? 1 : cl(1 - (t - off) / 0.6, 0, 1) * 0.2);
        R(g, wlx - 2, wly - 2, wW + 4, wH + 4, "#1a1c30"); R(g, wlx, wly, wW, wH, lit ? "#ffcf8a" : "#141a34");
        if (lit) { R(g, wlx, wly, wW, 4, "#ffe2b0"); R(g, wlx + 16, wly + 8, 6, 14, "#c08850"); R(g, wlx + 17, wly + 5, 4, 4, "#c08850"); }   // his silhouette
        else { R(g, wlx + 3, wly + 3, 2, 2, "#3a4680"); R(g, wlx + 18, wly + 2, 1, 1, "#5a68a8"); }
        R(g, wlx + wW / 2, wly, 1, wH, "#1a1c30"); R(g, wlx, wly + wH / 2, wW, 1, "#1a1c30");
        R(g, wlx - 4, wly + wH + 2, wW + 8, 3, "#3a3e5a");
        const wrx = hx + 120; R(g, wrx - 2, wly - 2, wW + 4, wH + 4, "#1a1c30"); R(g, wrx, wly, wW, wH, "#141a34"); R(g, wrx + wW / 2, wly, 1, wH, "#1a1c30"); R(g, wrx, wly + wH / 2, wW, 1, "#1a1c30"); R(g, wrx + 4, wly + 3, 2, 2, "#3a4680");
        // light spill on the lawn below his window
        if (lit) A(g, 0.18, () => poly(g, [[wlx - 4, 252], [wlx + wW + 4, 252], [wlx + wW + 22, 262], [wlx - 18, 262]], "#ffcf8a"));
        // ground floor: door + porch lamp + window
        R(g, hx + 80, 214, 22, 38, "#3a2a2a"); R(g, hx + 80, 214, 22, 2, "#5a4040"); R(g, hx + 97, 232, 2, 2, "#c8a050");
        R(g, hx + 72, 208, 38, 4, "#3a3e5a"); R(g, hx + 74, 212, 2, 40, "#3a3e5a"); R(g, hx + 106, 212, 2, 40, "#3a3e5a");
        R(g, hx + 110, 218, 3, 4, "#ffcf8a"); PX.glow(g, hx + 111, 220, 18, "rgba(255,200,120,0.6)", 0.8 + 0.2 * Math.sin(t * 9));
        R(g, hx + 22, 218, 34, 22, "#1a1c30"); R(g, hx + 24, 220, 30, 18, "#121830"); R(g, hx + 38, 220, 1, 18, "#1a1c30");
        // picket fence + cat
        for (let x = hx - 30; x < hx + hw + 30; x += 6) { R(g, x, 238, 3, 14, "#3a4060"); R(g, x, 237, 3, 1, "#5a6090"); }
        R(g, hx - 30, 242, hw + 60, 2, "#3a4060");
        const cx2 = hx + 150, cy2 = 237; R(g, cx2, cy2 - 6, 9, 6, "#0a0c16"); R(g, cx2 + 6, cy2 - 10, 5, 5, "#0a0c16"); R(g, cx2 + 6, cy2 - 11, 1, 1, "#0a0c16"); R(g, cx2 + 10, cy2 - 11, 1, 1, "#0a0c16");
        thick(g, cx2, cy2 - 3, cx2 - 5, cy2 - 8 + Math.round(Math.sin(t * 3) * 2), 1, "#0a0c16");
        if (!PX.blink(t + 0.5, 2.6, 0.08)) { R(g, cx2 + 7, cy2 - 8, 1, 1, "#d8f05a"); R(g, cx2 + 9, cy2 - 8, 1, 1, "#d8f05a"); }
        // parked car
        const vx = 30; R(g, vx, 240, 70, 12, "#3a2a4a"); R(g, vx + 12, 230, 40, 11, "#3a2a4a"); R(g, vx + 15, 232, 16, 7, "#1a2040"); R(g, vx + 34, 232, 15, 7, "#1a2040"); R(g, vx, 240, 70, 1, "#6a5a8a");
        R(g, vx + 16, 232, 4, 1, "#5a68a8"); PX.circle(g, vx + 14, 252, 5, "#0c0c12"); PX.circle(g, vx + 56, 252, 5, "#0c0c12"); PX.circle(g, vx + 14, 252, 2, "#3a3a4a"); PX.circle(g, vx + 56, 252, 2, "#3a3a4a");
        // far sidewalk
        R(g, -20, 252, W + 40, 6, "#2a2e44"); R(g, -20, 252, W + 40, 1, "#4a5070");
      });
      // ---- street (world)
      PX.vgrad(g, 0, 258, W, 50, "1a1c2a", "22243a", 4);
      for (let x = -20; x < W; x += 40) R(g, x + ((c.x - 320) * 0) , 282, 20, 2, "#7a7650");
      R(g, 0, 306, W, 4, "#4a5070"); R(g, 0, 310, W, 14, "#2e3248"); for (let x = 0; x < W; x += 24) R(g, x, 310, 1, 14, "#24283c");
      // streetlamp on the near sidewalk: cone + pool
      const LX = 300;
      PX.glow(g, LX + 14, 300, 120, "rgba(255,200,120,0.32)");
      A(g, 0.12, () => poly(g, [[LX + 10, 196], [LX + 20, 196], [LX + 80, 308], [LX - 50, 308]], "#ffd08a"));
      A(g, 0.25, () => ell(g, LX + 15, 300, 60, 8, "#ffd08a"));
      R(g, LX - 2, 192, 4, 130, "#2a2e3e"); R(g, LX - 2, 192, 1, 130, "#4a5068"); thick(g, LX, 194, LX + 14, 190, 2, "#2a2e3e"); R(g, LX + 8, 190, 14, 5, "#3a3e50"); R(g, LX + 10, 195, 10, 2, "#ffe2b0");
      PX.glow(g, LX + 15, 197, 26, "rgba(255,226,170,0.9)", 0.92 + 0.08 * Math.sin(t * 31));
      for (let i = 0; i < 4; i++) { const a = t * (3 + i) + i * 2; R(g, LX + 15 + Math.cos(a) * (8 + i * 3), 206 + Math.sin(a * 1.3) * 6, 1, 1, "#fff0c8"); }   // moths
      // ---- the data-centre box (near side, right)
      const BX = 440, BY = 232, BW = 120, BH = 80;
      // utility pole + cable across to the house
      R(g, 600, 120, 5, 196, "#2a2420"); R(g, 600, 120, 1, 196, "#4a3e34"); R(g, 590, 130, 26, 3, "#2a2420");
      PX.par(g, c, 0.8, () => { g.strokeStyle = "#0a0c16"; g.lineWidth = 1; g.beginPath(); g.moveTo(592, 131); g.quadraticCurveTo(450, 175, 300, 150); g.stroke(); });
      thick(g, 602, 133, BX + BW - 10, BY, 1, "#0a0c16");
      // chain-link fence behind
      A(g, 0.5, () => { for (let x = BX - 20; x < BX + BW + 30; x += 4) { PX.line(g, x, 216, x + 10, 312, "#3a4058"); PX.line(g, x + 10, 216, x, 312, "#3a4058"); } });
      R(g, BX - 20, 214, BW + 50, 2, "#4a5070");
      // box body
      R(g, BX - 2, BY + BH, BW + 8, 3, "#0a0c14");
      R(g, BX, BY, BW, BH, "#3a4258"); R(g, BX, BY, BW, 2, "#6a7494"); R(g, BX, BY, 2, BH, "#566080"); R(g, BX + BW - 4, BY, 4, BH, "#262c3e");
      R(g, BX - 4, BY - 6, BW + 8, 6, "#2e3448"); R(g, BX - 4, BY - 6, BW + 8, 1, "#5a6488");
      // vent fan (spinning)
      const fx = BX + 92, fy = BY + 22; PX.circle(g, fx, fy, 12, "#1a1e2a"); PX.circle(g, fx, fy, 11, "#2a3040");
      for (let i = 0; i < 4; i++) { const a = t * 9 + i * 1.57; thick(g, fx, fy, fx + Math.cos(a) * 9, fy + Math.sin(a) * 9, 3, "#4a5268"); }
      PX.circle(g, fx, fy, 2, "#6a7490"); for (let i = -10; i <= 10; i += 4) R(g, fx - 11, fy + i, 22, 1, "#1a1e2a");
      // louvres
      for (let i = 0; i < 6; i++) { R(g, BX + 10, BY + 46 + i * 5, 60, 2, "#262c3e"); R(g, BX + 10, BY + 46 + i * 5, 60, 1, "#4a5470"); }
      // LED panel
      const PXX = BX + 10, PY = BY + 12;
      R(g, PXX - 2, PY - 2, 64, 24, "#0a0c14"); R(g, PXX, PY, 60, 20, "#121622");
      for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) {
        const idx = i + j * 8, isRed = idx === 5 && t >= red;
        const on = isRed ? PX.blink(t - red, 0.5, 0.65) || t < red + 0.3 : PX.blink(t + idx * 0.23, 0.6 + (idx % 5) * 0.17, 0.6);
        const col = isRed ? (on ? "#ff4d4d" : "#6a1a1a") : on ? "#3df56b" : "#1a4a28";
        R(g, PXX + 4 + i * 7, PY + 4 + j * 8, 4, 4, col); if (on) R(g, PXX + 4 + i * 7, PY + 4 + j * 8, 1, 1, isRed ? "#ffc0c0" : "#c0ffd0");
        if (on && !isRed) PX.glow(g, PXX + 6 + i * 7, PY + 6 + j * 8, 5, "rgba(61,245,107,0.6)", 0.5);
      }
      if (t >= red) {
        const k = cl((t - red) / 0.25, 0, 1), pul = 0.6 + 0.4 * Math.sin((t - red) * 10);
        PX.glow(g, PXX + 41, PY + 6, 34 + (1 - k) * 30, "rgba(255,60,60,0.9)", pul);
        A(g, 0.35 * pul, () => ell(g, PXX + 41, BY + BH + 6, 30, 4, "#ff4d4d"));          // red reflection on the pavement
        if (t < red + 0.4) { A(g, 1 - (t - red) / 0.4, () => { PX.circle(g, PXX + 41, PY + 6, Math.round(4 + (t - red) * 40), "rgba(255,120,120,0.35)"); }); }
      }
      R(g, BX + 76, BY + 46, 30, 28, "#2e3448"); R(g, BX + 76, BY + 46, 30, 1, "#5a6488"); R(g, BX + 100, BY + 58, 3, 4, "#8a92a8");   // access door
      // ---- foreground: near grass + bushes
      PX.par(g, c, 1.2, () => {
        R(g, -30, 324, W + 60, 40, "#0c1416");
        for (let x = -30; x < W + 30; x += 3) R(g, x, 322 - ((x * 7) % 5), 1, 4, "#14221e");
        ell(g, 20, 344, 60, 26, "#0a120f"); ell(g, 30, 334, 36, 16, "#10201a"); R(g, 6, 322, 30, 1, "#203a2e");
        ell(g, 640, 350, 70, 28, "#0a120f"); ell(g, 622, 338, 30, 14, "#10201a");
      });
      PX.particles(g, 61, 14, t, [0, 150, W, 160], { vy: -1, vx: 4, col: "#c8d8ff", a: 0.35 });
      PX.vignette(g, 0.55);
    };
  };

  // =====================================================================
  // db_gone (9.0): cold server aisle; a glowing database cylinder full of record cards. At o.wipe 1.5 the cards peel
  // off and blow at the camera as dust, the cylinder drains; the hanging screen counts "1,200+" / "1,000+" down to a
  // red "0" (o.count 4.0 -> o.countEnd 7.0). o.empty true = start empty. o.restore (time|null): VHS rewind, cards fly
  // back, counters climb back, green "RESTORED" stamp at restore + 3.5.
  // =====================================================================
  K.db_gone = (o) => {
    const VX = 320, VY = 138, F = 320;
    const sx = (X, z) => VX + (X * F) / z, sy = (Y, z) => VY + (Y * F) / z;
    // record cards inside the cylinder
    const CR = PX.rnd(77), CARDS = [], CTOP = 132, CBOT = 278, CXr = 50;
    for (let row = 0; row < 9; row++) for (let col = 0; col < 7; col++) {
      const x = VX - CXr + 6 + col * 14 + (row % 2) * 4 + CR() * 2, y = CTOP + 6 + row * 15 + CR() * 3;
      const ang = Math.atan2(y - 200, x - VX + (CR() - 0.5) * 30), sp = 160 + CR() * 200;
      CARDS.push({ x, y, ang, sp, dy: (CR() - 0.5) * 60, rot: CR() * 6, k: CR(), col: ["#bff6fa", "#d8e8ff", "#c8f0d8"][Math.floor(CR() * 3)] });
    }
    const fmt = (n) => (n >= 1000 ? Math.floor(n / 1000) + "," + String(n % 1000).padStart(3, "0") : String(n));
    return (g, t, d, c) => {
      const sc = d / 9, wipe = opt(o, "wipe", 1.5 * sc), c0 = opt(o, "count", 4.0 * sc), c1 = opt(o, "countEnd", 7.0 * sc);
      const rest = opt(o, "restore", null), DRAIN = 1.9, END = Math.max(c1, wipe + DRAIN + 1.6) + 0.5;
      // virtual story time (rewinds after o.restore)
      let e = o.empty ? END : t, rew = false, rk = 0;
      if (rest !== null && t >= rest) {
        const e0 = o.empty ? END : rest, dur = 3.5; rk = cl((t - rest) / dur, 0, 1);
        e = lerp(e0, wipe - 0.05, PX.ease(rk, "io")); rew = rk < 1;
      }
      const restored = rest !== null && t >= rest + 3.5;
      const lev = 1 - cl((e - wipe) / DRAIN, 0, 1);              // fill level of the cylinder
      const cK = cl((e - c0) / (c1 - c0), 0, 1), gone = lev <= 0;
      const alarm = e > c0 - 0.5 && !restored ? cl((e - c0 + 0.5) / 0.5, 0, 1) : 0;
      // ---- aisle (far + mid)
      PX.par(g, c, 0.6, () => {
        PX.vgrad(g, 0, 0, W, H, "0a1020", "0e1626", 6);
        // ceiling
        poly(g, [[0, 0], [W, 0], [sx(1.6, 1), sy(-1, 1)], [sx(1.6, 14), sy(-1, 14)], [sx(-1.6, 14), sy(-1, 14)], [sx(-1.6, 1), sy(-1, 1)]], "#0b111c");
        for (let z = 1.2; z < 14; z += 0.9) { const x0 = sx(-0.5, z), x1 = sx(0.5, z), y0 = sy(-1, z); R(g, x0, y0, x1 - x0, Math.max(1, 3 / z), "#151d2c"); }
        // far wall + door
        const fz = 14; R(g, sx(-1.6, fz), sy(-1, fz), sx(1.6, fz) - sx(-1.6, fz), sy(1, fz) - sy(-1, fz), "#0c1220");
        R(g, VX - 6, sy(1, fz) - 26, 12, 26, "#1c3a4a"); PX.glow(g, VX, sy(1, fz) - 14, 30, "rgba(95,227,232,0.35)");
        // floor
        poly(g, [[sx(-1.6, 1), sy(1, 1)], [sx(-1.6, 14), sy(1, 14)], [sx(1.6, 14), sy(1, 14)], [sx(1.6, 1), sy(1, 1)]], "#0e1520");
        for (let X = -1.6; X <= 1.61; X += 0.4) PX.line(g, sx(X, 1), sy(1, 1), sx(X, 14), sy(1, 14), "#18212e");
        for (let z = 1.5; z < 14; z *= 1.22) R(g, 0, Math.round(sy(1, z)), W, 1, "#18212e");
        // upper wall strips above the racks + cable trays
        for (const side of [-1, 1]) poly(g, [[sx(side * 1.6, 1), sy(-1, 1)], [sx(side * 1.6, 14), sy(-1, 14)], [sx(side * 1.6, 14), sy(-0.55, 14)], [sx(side * 1.6, 1), sy(-0.55, 1)]], "#0c121e");
        for (const X of [-1.1, 1.1]) { poly(g, [[sx(X - 0.12, 1.2), sy(-0.82, 1.2)], [sx(X + 0.12, 1.2), sy(-0.82, 1.2)], [sx(X + 0.12, 14), sy(-0.82, 14)], [sx(X - 0.12, 14), sy(-0.82, 14)]], "#161e2c");
          for (let z = 1.3; z < 14; z += 0.5) PX.line(g, sx(X - 0.12, z), sy(-0.82, z), sx(X + 0.12, z), sy(-0.82, z), "#222c3e");
          PX.line(g, sx(X - 0.05, 1.2), sy(-0.78, 1.2), sx(X - 0.05, 14), sy(-0.78, 14), "#c2457f"); PX.line(g, sx(X + 0.04, 1.2), sy(-0.79, 1.2), sx(X + 0.04, 14), sy(-0.79, 14), "#3466c8"); }
        // racks on both walls: front plane X = +-1.45, gaps show the end caps
        for (const side of [-1, 1]) {
          for (let z = 13; z >= 1.05; z -= 0.75) {
            const z0 = z, z1 = Math.max(1.02, z - 0.64), X = side * 1.45;
            const xa = sx(X, z0), xb = sx(X, z1), ta = sy(-0.55, z0), tb = sy(-0.55, z1), ba = sy(1, z0), bb = sy(1, z1);
            const fog = cl((z - 1) / 12, 0, 1);
            // end cap (faces the camera)
            const xc = sx(side * 1.6, z1); poly(g, [[xb, tb], [xc, sy(-0.55, z1)], [xc, sy(1, z1)], [xb, bb]], "#0a0f18");
            poly(g, [[xa, ta], [xb, tb], [xb, bb], [xa, ba]], "#151f30");
            const U = 12;
            for (let u = 0; u < U; u++) {
              const v0 = u / U + 0.012, v1 = (u + 1) / U - 0.012;
              const q = [[xa, lerp(ta, ba, v0)], [xb, lerp(tb, bb, v0)], [xb, lerp(tb, bb, v1)], [xa, lerp(ta, ba, v1)]];
              poly(g, q, u % 3 === 1 ? "#1c2840" : "#1a2438");
              PX.line(g, q[0][0], q[0][1], q[1][0], q[1][1], "#2a3a56");
              if (z < 6) { const vm = (v0 + v1) / 2; PX.line(g, lerp(xa, xb, 0.1), lerp(lerp(ta, ba, vm), lerp(tb, bb, vm), 0.1), lerp(xa, xb, 0.45), lerp(lerp(ta, ba, vm), lerp(tb, bb, vm), 0.45), "#111826"); }
            }
            // front post, lit by the cylinder glow on its inner edge
            PX.line(g, xb, tb, xb, bb, lev > 0.05 ? "#3a6a80" : "#2e3a52"); if (z1 < 4) PX.line(g, xb + side, tb, xb + side, bb, "#22304a");
            PX.line(g, xa, ta, xb, tb, "#2e3a56");
            // LEDs
            for (let u = 0; u < U; u++) for (let j = 0; j < 4; j++) {
              const v = (u + 0.5) / U, f = 0.55 + j * 0.1, lx = lerp(xa, xb, f), ly = lerp(lerp(ta, ba, v), lerp(tb, bb, v), f);
              const seed = Math.floor(z * 10) * 31 + u * 7 + j + (side > 0 ? 500 : 0);
              const wave = e - wipe - (13 - z) * 0.16;                            // red wave rolls from the cylinder outward
              const isRed = !restored && ((wave > 0 && lev < 1) || alarm > 0);
              if (!PX.blink(t + seed * 0.13, 0.4 + (seed % 7) * 0.13, isRed ? 0.7 : 0.55)) continue;
              const s0 = z < 2.2 ? 2 : 1, col = isRed ? "#ff4d4d" : seed % 5 === 0 ? "#5fe3e8" : seed % 11 === 0 ? "#f7c948" : "#3df56b";
              R(g, lx, ly, s0, s0, col);
              if (z < 3 && j === 0) PX.glow(g, lx, ly, 6, isRed ? "rgba(255,77,77,0.6)" : "rgba(61,245,107,0.5)", 0.6);
              const ry = 2 * sy(1, lerp(z0, z1, f)) - ly; if (ry < H) A(g, 0.2, () => R(g, lx, ry, s0, s0, col));
            }
            A(g, fog * 0.65, () => poly(g, [[xa, ta], [xb, tb], [xb, bb], [xa, ba]], "#0a1020"));
          }
        }
        // ceiling strip lights (cold) over both rack rows, one flickering
        for (let z = 12; z >= 1.5; z -= 1.3) for (const X of [-0.85, 0.85]) {
          const z2 = z - 0.7, xa = sx(X - 0.07, z), xb = sx(X + 0.07, z), ya = sy(-0.95, z), yb = sy(-0.95, z2), xc = sx(X - 0.07, z2), xd = sx(X + 0.07, z2);
          const fl = z > 5 && z < 6.5 && X > 0 ? (PX.blink(t, 0.13, 0.7) ? 1 : 0.25) : 1;
          A(g, 0.9 * fl, () => poly(g, [[xa, ya], [xb, ya], [xd, yb], [xc, yb]], "#9ccbe8"));
          PX.glow(g, (xa + xd) / 2, (ya + yb) / 2 + 3, Math.min(70, 120 / z), "rgba(150,200,255,0.55)", 0.55 * fl);
          A(g, 0.045 * fl, () => poly(g, [[xa, ya], [xb, ya], [sx(X + 0.5, z), sy(1, z)], [sx(X - 0.5, z), sy(1, z)]], "#a8d4f0"));   // light falling
        }
        // cold haze down the aisle
        PX.glow(g, VX, VY + 30, 220, "rgba(80,140,220,0.18)");
      });
      // ---- alarm wash
      if (alarm > 0) { const pul = 0.5 + 0.5 * Math.sin(t * 6); PX.glow(g, VX, 40, 360, "rgba(255,40,40,0.35)", alarm * pul); }
      // ---- the database cylinder (world)
      const cyl = () => {
        const cx = VX, top = 120, bot = 286, rx = 62, ry = 13;
        const glowA = 0.15 + 0.85 * lev;
        PX.glow(g, cx, 210, 170, "rgba(95,227,232,0.45)", glowA * (0.9 + 0.1 * Math.sin(t * 3)));
        // floor reflection of the glow + base
        A(g, 0.35 * glowA, () => ell(g, cx, bot + 22, rx + 20, 10, "#3fb8c8"));
        ell(g, cx, bot + 6, rx + 8, ry + 3, "#0a0e16"); ell(g, cx, bot + 4, rx + 6, ry + 2, "#1a2232"); ell(g, cx, bot + 3, rx + 6, ry + 1, "#2a3448");
        // glass body (dark) with liquid light inside up to the level
        R(g, cx - rx, top, rx * 2 + 1, bot - top, "#0e1a26"); ell(g, cx, bot, rx, ry, "#0e1a26");
        const ly = Math.round(lerp(bot, top + 4, lev));
        if (lev > 0) {
          PX.vgrad(g, cx - rx, ly, rx * 2 + 1, bot - ly, "1f6a7a", "123c50", 5); ell(g, cx, bot, rx, ry, "#123c50");
          ell(g, cx, ly, rx, ry, "#2a8a9a"); ell(g, cx, ly, rx - 4, ry - 3, "#3fb0c0");
          for (let i = 0; i < 6; i++) { const bxx = cx - 40 + ((i * 17 + t * 9) % 80), byy = bot - ((t * 20 + i * 23) % Math.max(1, bot - ly)); R(g, bxx, byy, 1, 1, "#9ff4f8"); }
        }
        // cards still inside (not peeled yet) or flying
        for (const cd of CARDS) {
          const tp = wipe + (1 - (CBOT - cd.y) / (CBOT - CTOP)) * DRAIN;
          const dt = e - tp;
          if (dt < 0) {
            if (cd.y < ly - 2) continue;
            const bob = Math.round(Math.sin(t * 2 + cd.k * 6) * 1);
            R(g, cd.x, cd.y + bob, 9, 6, "#0e2a36"); R(g, cd.x + 1, cd.y + bob + 1, 7, 4, cd.col); R(g, cd.x + 2, cd.y + bob + 2, 4, 1, "#3a6a7a"); R(g, cd.x + 2, cd.y + bob + 4, 3, 1, "#6a9aaa");
          }
        }
        // glass highlights + disc rims (stacked discs look)
        R(g, cx - rx, top, 3, bot - top, "#2a4a5a"); R(g, cx - rx + 6, top + 4, 2, bot - top - 10, "rgba(200,240,255,0.18)"); R(g, cx + rx - 3, top, 3, bot - top, "#08121c");
        for (const yy of [top + 54, top + 110]) { g.globalAlpha = 0.9; ell(g, cx, yy, rx + 1, ry, "#0a1420"); ell(g, cx, yy - 1, rx, ry - 1, lev > (bot - yy) / (bot - top) ? "#2a7a8a" : "#162434"); g.globalAlpha = 1;
          thick(g, cx - rx, yy, cx - rx + 10, yy + 6, 1, "#4a8a9a"); }
        // top lid
        ell(g, cx, top, rx + 1, ry + 1, "#0a1420"); ell(g, cx, top, rx, ry, lev >= 0.98 ? "#3a9aaa" : "#1a2a3a"); ell(g, cx, top - 1, rx - 6, ry - 4, lev >= 0.98 ? "#5fd0dc" : "#223448");
        R(g, cx - rx + 10, top - 6, 30, 1, "rgba(200,240,255,0.35)");
        // pipes into the floor
        R(g, cx - 40, bot + 8, 6, 20, "#1a2232"); R(g, cx + 34, bot + 8, 6, 20, "#1a2232"); R(g, cx - 40, bot + 8, 1, 20, "#3a4a5a");
      };
      cyl();
      // flying cards (in front of everything, coming at the camera)
      for (const cd of CARDS) {
        const tp = wipe + (1 - (CBOT - cd.y) / (CBOT - CTOP)) * DRAIN, dt = e - tp;
        if (dt < 0 || dt > 1.8) continue;
        const k = Math.pow(dt, 1.5), x = cd.x + Math.cos(cd.ang) * cd.sp * k, y = cd.y + Math.sin(cd.ang) * cd.sp * k * 0.8 + cd.dy * dt - 30 * dt;
        if (dt < 0.9) {
          const s = 1 + dt * 2.2, w = Math.round(9 * s), h = Math.max(1, Math.round(6 * s * Math.abs(Math.cos(cd.rot + dt * 7))));
          A(g, 1, () => { R(g, x - w / 2, y - h / 2, w, h, "#0e2a36"); R(g, x - w / 2 + 1, y - h / 2 + 1, w - 2, Math.max(1, h - 2), cd.col); if (h > 4) { R(g, x - w / 2 + 2, y - h / 2 + 2, w * 0.5, 1, "#3a6a7a"); R(g, x - w / 2 + 2, y - h / 2 + 4, w * 0.35, 1, "#6a9aaa"); } });
        }
        if (dt > 0.6) {     // dissolve into pixel dust
          const r = PX.rnd(Math.floor(cd.k * 9999)), dk = (dt - 0.6) / 1.2;
          for (let i = 0; i < 7; i++) { const a = cd.ang + (r() - 0.5) * 1.6, v = 30 + r() * 120, sz = r() < 0.3 ? 2 : 1;
            A(g, 1 - dk, () => R(g, x + Math.cos(a) * v * dk * 1.3, y + Math.sin(a) * v * dk - 20 * dk, sz, sz, r() < 0.5 ? "#9ff4f8" : cd.col)); }
        }
      }
      // ---- hanging screen with the counters
      PX.par(g, c, 0.9, () => {
        const sx0 = 196, sy0 = 22, sw = 248, sh = 76;
        R(g, sx0 + 30, 0, 2, sy0, "#2a3040"); R(g, sx0 + sw - 32, 0, 2, sy0, "#2a3040");
        R(g, sx0 - 4, sy0 - 4, sw + 8, sh + 8, "#141820"); R(g, sx0 - 4, sy0 - 4, sw + 8, 1, "#3a4258"); R(g, sx0, sy0, sw, sh, "#070b12");
        const rowv = (lbl, full, yy) => {
          const n = Math.round(full * (1 - PX.ease(cK, "in"))), zero = n === 0 && cK > 0;
          const txt = cK <= 0 ? fmt(full) + "+" : fmt(n), col = cK <= 0 ? (restored ? "#3df56b" : "#5fe3e8") : zero ? "#ff4d4d" : cK > 0.6 ? "#ff7b5c" : "#f7c948";
          T(g, lbl, sx0 + 10, yy + 5, { size: 8, col: "#7d8ca8" });
          if (!(zero && !PX.blink(t, 0.5, 0.7))) T(g, txt, sx0 + sw - 10, yy, { size: 16, col, align: "right" });
          if (zero || (cK > 0 && cK < 1)) PX.glow(g, sx0 + sw - 40, yy + 8, 40, zero ? "rgba(255,60,60,0.6)" : "rgba(247,201,72,0.35)", 0.6);
        };
        rowv("EXECUTIVES", 1200, sy0 + 10); rowv("COMPANIES", 1000, sy0 + 44);
        R(g, sx0 + 6, sy0 + 37, sw - 12, 1, "#1a2232");
        A(g, 0.06, () => { for (let yy = sy0; yy < sy0 + sh; yy += 2) R(g, sx0, yy, sw, 1, "#5fe3e8"); });
        PX.glow(g, sx0 + sw / 2, sy0 + sh / 2, 120, gone && !restored ? "rgba(255,80,80,0.18)" : "rgba(95,227,232,0.15)");
      });
      // ---- foreground dust + cold mist
      PX.par(g, c, 1.1, () => { PX.particles(g, 5, 40, t, [0, 0, W, H], { vy: -3, vx: 2, col: "#a8d8ff", a: 0.35 }); });
      // ---- restored stamp
      if (restored) {
        const k = cl((t - rest - 3.5) / 0.15, 0, 1);
        PX.glow(g, VX, 200, 140, "rgba(61,245,107,0.5)", 0.6 * k);
        stamp(g, VX, 200, "RESTORED", "#3df56b", 24, -0.1, k);
      }
      PX.vignette(g, 0.55);
      // ---- VHS rewind look
      if (rew) {
        A(g, 0.12, () => R(g, 0, 0, W, H, "#4a6aa8"));
        const by = ((t * 260) % (H + 40)) - 20;
        A(g, 0.5, () => { const r = PX.rnd(Math.floor(t * 30)); for (let i = 0; i < 80; i++) R(g, r() * W, by + r() * 10, 2 + r() * 8, 1, r() < 0.5 ? "#ffffff" : "#8aa0c8"); });
        PX.glitch(g, 0.35, Math.floor(t * 24) + 1);
        if (PX.blink(t, 0.6, 0.7)) OT(g, "<<", 24, 20, { size: 24, col: "#e8f1f2" });
        T(g, "REW", 92, 28, { size: 8, col: "#e8f1f2" });
      }
    };
  };

  // =====================================================================
  // confession (8.0): the chat app glowing in the dark office (only the screen lights the room); the founder seen
  // from behind. Agent replies type: "I deleted the database." (o.m1 0.5) / "I panicked." (o.m2 1.8, eyes wide,
  // sweat); o.score 3.0 severity meter fills to "95/100" (red, shakes); o.never 5.0 red stamp "CAN'T BE RECOVERED".
  // =====================================================================
  K.confession = (o) => (g, t, d, c) => {
    const sc = d / 8, m1 = opt(o, "m1", 0.5 * sc), m2 = opt(o, "m2", 1.8 * sc), score = opt(o, "score", 3.0 * sc), never = opt(o, "never", 5.0 * sc);
    const M = opt(o, "lines", ["I deleted the database.", "I panicked."]);
    // slam shake
    const sk = t >= never && t < never + 0.35 ? (1 - (t - never) / 0.35) * 4 : 0;
    g.save(); if (sk) g.translate(Math.round(Math.sin(t * 90) * sk), Math.round(Math.cos(t * 77) * sk * 0.6));
    // ---- dark room (far)
    PX.vgrad(g, -8, -8, W + 16, H + 16, "0b1020", "05070e", 8);
    PX.par(g, c, 0.4, () => {
      // window with blinds: faint moonlight
      R(g, 20, 40, 110, 150, "#0e1424"); R(g, 24, 44, 102, 142, "#121a30");
      for (let i = 0; i < 18; i++) { R(g, 24, 46 + i * 8, 102, 5, "#141c32"); R(g, 24, 46 + i * 8, 102, 1, "#22304e"); }
      R(g, 74, 40, 1, 150, "#0a0e1a");
      A(g, 0.07, () => { for (let i = 0; i < 9; i++) poly(g, [[130, 60 + i * 14], [130, 64 + i * 14], [210, 230 + i * 10], [210, 224 + i * 10]], "#8aa8e8"); });
      // shelf silhouettes right
      R(g, 540, 70, 100, 4, "#141a28"); R(g, 540, 150, 100, 4, "#141a28");
      for (let i = 0; i < 9; i++) R(g, 548 + i * 9, 50 + (i * 7) % 8, 7, 20 - (i * 7) % 8, i % 3 ? "#0e1320" : "#121a2a");
      R(g, 560, 128, 22, 22, "#0e1320"); R(g, 596, 136, 30, 14, "#121a2a");
    });
    // screen light spilling on the wall
    PX.glow(g, 340, 140, 300, "rgba(80,170,240,0.22)", 0.92 + 0.08 * Math.sin(t * 13) * Math.sin(t * 3.7));
    // ---- desk
    const DY = 270;
    R(g, -8, DY, W + 16, 100, "#0e0c12"); R(g, -8, DY, W + 16, 2, "#2a2a38");
    A(g, 0.22, () => poly(g, [[170, DY + 2], [510, DY + 2], [600, H + 8], [80, H + 8]], "#4a8ab8"));   // screen light on the desk
    // phone buzzing with notifications
    const ph = PX.blink(t, 1.3, 0.25), pjx = ph ? Math.round(Math.sin(t * 80)) : 0;
    R(g, 540 + pjx, DY + 14, 30, 16, "#0a0a10"); R(g, 541 + pjx, DY + 15, 28, 14, ph ? "#3a5a8a" : "#141a26"); if (ph) { PX.glow(g, 555, DY + 22, 30, "rgba(120,170,255,0.5)"); R(g, 545 + pjx, DY + 19, 16, 2, "#c9d6ff"); R(g, 545 + pjx, DY + 23, 10, 2, "#8aa0d0"); }
    // cold coffee + papers
    R(g, 120, DY + 6, 14, 16, "#2a2e3a"); R(g, 120, DY + 6, 14, 1, "#5a6a80"); R(g, 134, DY + 10, 4, 8, "#2a2e3a"); R(g, 121, DY + 7, 12, 2, "#1a1210");
    R(g, 470, DY + 8, 40, 26, "#3a4a5a"); R(g, 474, DY + 4, 40, 26, "#56687a"); for (let i = 0; i < 4; i++) R(g, 478, DY + 9 + i * 5, 26, 1, "#2a3a4a");
    // ---- the monitor
    const X = 168, Y = 34, MW = 344, MH = 214;
    R(g, X + MW / 2 - 10, Y + MH + 8, 20, DY - Y - MH - 8, "#14161e"); R(g, X + MW / 2 - 40, DY - 4, 80, 4, "#1a1d26"); R(g, X + MW / 2 - 40, DY - 4, 80, 1, "#4a5a70");
    R(g, X - 8, Y - 8, MW + 16, MH + 18, "#12141c"); R(g, X - 8, Y - 8, MW + 16, 1, "#3a4a60"); R(g, X - 8, Y - 8, 1, MH + 18, "#2a3446");
    R(g, X + MW - 10, Y + MH + 4, 3, 2, PX.blink(t, 2.4, 0.9) ? "#3df56b" : "#1a4a28");
    clip(g, X, Y, MW, MH, () => {
      R(g, X, Y, MW, MH, "#10141e");
      chatTop(g, X, Y, MW, "AGENT", t);
      // avatar pane
      const AX = X + 6, AW = 92;
      R(g, AX, Y + 20, AW, MH - 26, "#0c1018"); R(g, AX, Y + 20, AW, 1, "#1c2434");
      const wide = t >= m2, ex = t >= never ? "worry" : wide ? "wide" : t >= m1 ? "worry" : "neutral";
      const jit = wide && t < never ? Math.round(Math.sin(t * 40) * 0.6) : 0;
      bot(g, AX + AW / 2 + jit, Y + 82, 58, t, { ex, look: -0.2, noBlink: wide });
      if (wide) { sweat(g, AX + AW / 2 + 30, Y + 54, t, 0); sweat(g, AX + AW / 2 - 34, Y + 62, t, 0.45); }
      T(g, "AGENT", AX + AW / 2, Y + 128, { font: "v", size: 12, col: "#5a6a80", align: "center" });
      R(g, AX + 10, Y + 142, AW - 20, 2, "#1a2232"); R(g, AX + 10, Y + 148, AW - 34, 2, "#1a2232");
      // messages
      const QX = X + 106;
      const msg = (txt, t0, yy) => {
        if (t < t0 - 0.5) return;
        const bw = PX.tw(g, txt, { font: "v", size: 18 }) + 14;
        rr2(g, QX, yy, t < t0 ? 34 : bw, 20, "#1f2a38"); R(g, QX + 2, yy, (t < t0 ? 34 : bw) - 4, 1, "#33465c");
        if (t < t0) { for (let i = 0; i < 3; i++) R(g, QX + 8 + i * 8, yy + 8 + (Math.floor(t * 8 + i) % 2), 4, 4, "#9aa4b2"); return; }
        T(g, PX.typed(txt, t, t0, 22), QX + 7, yy + 1, { font: "v", size: 18, col: "#e6edf3" });
      };
      msg(M[0], m1, Y + 26);
      msg(M[1], m2, Y + 52);
      // severity meter
      if (t >= score) {
        const k = pop(t, score, 0.3), fk = PX.ease((t - score - 0.2) / 1.0, "out"), full = fk >= 1;
        const shake = full ? Math.round(Math.sin(t * 60) * 1.5) : 0, my = Y + 84;
        PX.zoom(g, Math.max(0.05, k), QX + 110, my + 22, () => {
          rr2(g, QX, my, 228, 50, "#1c1018"); R(g, QX + 2, my, 224, 1, "#5a2a34");
          T(g, "SEVERITY", QX + 8, my + 6, { size: 8, col: "#ff9a9a" });
          const bx = QX + 8 + shake, by = my + 30, bw = 212;
          R(g, bx - 1, by - 1, bw + 2, 14, "#05060a"); R(g, bx, by, bw, 12, "#2a1a20");
          const fw = Math.round(bw * 0.95 * cl(fk, 0, 1));
          for (let i = 0; i < fw; i++) R(g, bx + i, by, 1, 12, i < bw * 0.4 ? "#f7c948" : i < bw * 0.7 ? "#ff8a3c" : "#ff4d4d");
          R(g, bx, by, fw, 2, "rgba(255,255,255,.35)");
          for (let i = 1; i < 10; i++) R(g, bx + Math.round(i * bw / 10), by, 1, 12, "rgba(0,0,0,.35)");
          R(g, bx + Math.round(bw * 0.95), by - 3, 1, 18, "#ffd0d0");
          if (fk > 0) T(g, full ? "95/100" : Math.round(95 * fk) + "/100", QX + 220 + shake, my + 5, { size: 16, col: "#ff4d4d", align: "right" });
          if (full) PX.glow(g, QX + 170, my + 14, 50, "rgba(255,60,60,0.6)", 0.6 + 0.4 * Math.sin(t * 14));
        });
      }
      // input box
      R(g, QX, Y + MH - 18, MW - 112, 12, "#0c1018"); if (PX.blink(t, 1, 0.5)) R(g, QX + 4, Y + MH - 16, 1, 8, "#c9d1d9");
      A(g, 0.03, () => { for (let i = 0; i < 3; i++) thick(g, X + MW * 0.65 + i * 10, Y, X + MW * 0.65 + i * 10 - 140, Y + MH, 4 - i, "#dfe8ff"); });
    });
    // ---- the stamp
    if (t >= never) {
      const k = cl((t - never) / 0.12, 0, 1), s = lerp(1.7, 1, PX.ease(k, "in"));
      if (k >= 1) PX.glow(g, X + MW / 2, Y + 160, 160, "rgba(255,50,50,0.5)", 0.5 + 0.2 * Math.sin(t * 5));
      PX.zoom(g, s, X + MW / 2 + 20, Y + 162, () => stamp(g, X + MW / 2 + 20, Y + 162, "CAN'T BE RECOVERED", "#ff4d4d", 16, -0.12, k));
      if (t < never + 0.6) { const r = PX.rnd(5), dk = (t - never) / 0.6; for (let i = 0; i < 18; i++) { const a = r() * 6.28, v = 60 + r() * 90; A(g, 1 - dk, () => R(g, X + MW / 2 + 20 + Math.cos(a) * v * dk, Y + 162 + Math.sin(a) * v * dk * 0.5, 2, 2, "#ff9a9a")); } }
    }
    // ---- the founder from behind (foreground), rim-lit by the screen; hands to the head after the stamp
    PX.par(g, c, 1.2, () => {
      const fx = 112, fy = 316 + Math.round(Math.sin(t * 1.8) * 1), grab = t >= never ? PX.p(t, never + 0.15, 0.35, "back") : 0;
      ell(g, fx, fy + 66, 96, 52, "#080b16"); ell(g, fx, fy + 60, 90, 46, "#0c1222");
      for (let i = 0; i < 46; i++) R(g, fx + 40 + i * 0.9, fy + 22 + i, 2, 1, "#2a4a62");      // rim on the right shoulder
      ell(g, fx, fy + 24, 40, 14, "#0a0f1e"); ell(g, fx, fy + 20, 32, 10, "#101830");          // hood
      R(g, fx - 12, fy - 2, 24, 18, "#1a1412");
      // head (back): grey hair, rim light on the right + top
      ell(g, fx, fy - 30, 34, 38, "#14161c"); ell(g, fx - 3, fy - 32, 31, 35, "#1c1f26");
      for (let yy = -62; yy < 2; yy += 5) for (let xx = -30; xx < 30; xx += 4) { const ins = (xx * xx) / (31 * 31) + ((yy + 32) * (yy + 32)) / (35 * 35); if (ins < 0.9) R(g, fx + xx + ((yy / 5) % 2 ? 2 : 0), fy + yy, 1, 3, ins < 0.5 ? "#2a2e38" : "#22252e"); }
      for (let a = -1.5; a < 0.7; a += 0.05) R(g, fx + Math.cos(a) * 33, fy - 30 + Math.sin(a) * 37, 2, 2, a < -1.1 ? "#4a7a90" : "#7fb0c4");
      ell(g, fx - 35, fy - 26, 5, 9, "#16100e"); ell(g, fx + 35, fy - 26, 5, 9, "#2a201c"); R(g, fx + 38, fy - 32, 2, 10, "#9ac8d8");   // ears
      if (grab > 0) {
        for (const s of [-1, 1]) {
          const sx2 = fx + s * 70, sy2 = fy + 34, hx = lerp(sx2, fx + s * 36, grab), hy = lerp(sy2 + 30, fy - 40, grab), ex = lerp(sx2 + s * 10, fx + s * 62, grab), ey = lerp(sy2 + 40, fy, grab);
          thick(g, sx2, sy2, ex, ey, 18, "#0c1222"); thick(g, ex, ey, hx, hy, 15, "#0c1222"); if (s > 0) thick(g, ex + 7, ey, hx + 6, hy, 2, "#2e4a6a");
          ell(g, hx, hy, 8, 9, "#2a1e1a"); if (s > 0) R(g, hx + 6, hy - 6, 2, 10, "#9ac8d8");
        }
      }
    });
    PX.particles(g, 33, 26, t, [160, 40, 360, 240], { vy: -2, vx: 1, col: "#a8d8ff", a: 0.4 });
    PX.vignette(g, 0.6);
    g.restore();
  };

  // =====================================================================
  // checker (4.5): night server room; the founder with a flashlight walks to a laptop on a cart (o.walk 1.3), types
  // "ROLLBACK" (o.type 1.5), a progress bar fills, green check + "DATA BACK" at o.ok 2.8; rack LEDs turn green.
  // =====================================================================
  K.checker = (o) => (g, t, d, c) => {
    const sc = d / 4.5, walk = opt(o, "walk", 1.3 * sc), typ = opt(o, "type", 1.5 * sc), ok = opt(o, "ok", 2.8 * sc), go = typ + 0.65;
    const FY = 322, CX = 420;
    const okd = t >= ok;
    // ---- back wall + rack row (far)
    PX.vgrad(g, 0, 0, W, H, "0a0e1a", "06080e", 8);
    PX.par(g, c, 0.5, () => {
      R(g, 0, 0, W, 22, "#080b12"); for (let x = 0; x < W; x += 30) R(g, x, 14, 20, 3, "#141a26");                  // cable tray
      thick(g, 0, 18, W, 20, 1, "#2a3a5a");
      for (let i = 0; i < 12; i++) {
        const rx = -20 + i * 58, ry = 70, rw = 52, rh = 216;
        R(g, rx, ry, rw, rh, "#121826"); R(g, rx, ry, rw, 2, "#2a3448"); R(g, rx, ry, 2, rh, "#222c40"); R(g, rx + rw - 2, ry, 2, rh, "#0a0e16");
        for (let u = 0; u < 14; u++) {
          const uy = ry + 6 + u * 15; R(g, rx + 4, uy, rw - 8, 12, u % 4 === 1 ? "#1a2438" : "#161f30"); R(g, rx + 4, uy, rw - 8, 1, "#26324a");
          for (let k = 0; k < 6; k++) R(g, rx + 22 + k * 4, uy + 5, 2, 1, "#0c1018");
          for (let j = 0; j < 3; j++) {
            const seed = i * 97 + u * 13 + j, green = okd && t - ok > Math.abs(rx + rw / 2 - CX) / 600;
            if (!PX.blink(t + seed * 0.11, 0.35 + (seed % 6) * 0.15, green ? 0.6 : 0.5)) continue;
            const col = green ? (seed % 4 ? "#3df56b" : "#5fe3e8") : seed % 3 ? "#ff4d4d" : "#6a1a1a";
            R(g, rx + 7 + j * 4, uy + 5, 2, 2, col);
          }
        }
      }
      A(g, 0.5, () => R(g, 0, 70, W, 216, "#06080e"));                                      // darkness over the racks
      // red ambient (alarm) before, green after
      PX.glow(g, CX, 120, 320, okd ? "rgba(61,245,107,0.18)" : "rgba(255,60,60,0.14)", okd ? cl((t - ok) / 0.6, 0, 1) : 0.6 + 0.4 * Math.sin(t * 4));
    });
    // ---- raised floor
    PX.vgrad(g, 0, 286, W, H - 286, "141a26", "0a0e16", 5);
    for (let i = 0; i < 6; i++) R(g, 0, 290 + i * i * 2.4 + i * 4, W, 1, "#1c2434");
    for (let x = -200; x < W + 200; x += 46) PX.line(g, 320 + (x - 320) * 0.5, 287, x, H, "#1a2230");
    R(g, 0, 286, W, 2, "#22304a");
    // ---- cart + laptop (world)
    const LX = CX - 40, LY = 202, LW2 = 84, LH2 = 54;
    R(g, CX - 46, 262, 96, 6, "#3a4254"); R(g, CX - 46, 262, 96, 1, "#6a7488"); R(g, CX - 44, 268, 4, 52, "#2a3040"); R(g, CX + 42, 268, 4, 52, "#1e2430");
    R(g, CX - 44, 300, 90, 4, "#2a3040"); R(g, CX - 30, 288, 40, 12, "#2a2a22"); R(g, CX - 30, 288, 40, 1, "#4a4a3a");   // cable box
    for (let i = 0; i < 3; i++) thick(g, CX - 26 + i * 12, 290, CX - 20 + i * 12, 286, 2, ["#c2457f", "#3466c8", "#f7c948"][i]);
    for (const wx of [CX - 42, CX + 44]) { PX.circle(g, wx, FY - 1, 3, "#0c0e14"); PX.circle(g, wx, FY - 1, 1, "#4a5060"); }
    A(g, 0.5, () => ell(g, CX, FY + 2, 56, 4, "#000"));
    // laptop base + keyboard
    R(g, LX - 4, 256, LW2 + 8, 6, "#2a2e38"); R(g, LX - 4, 256, LW2 + 8, 1, "#6a7080");
    for (let kx = 0; kx < 12; kx++) R(g, LX + 2 + kx * 7, 258, 5, 2, t >= typ && t < go && (Math.floor(t * 18) + kx * 5) % 7 === 0 ? "#9aa4b2" : "#4a505c");
    // screen
    const scol = okd ? "rgba(61,245,107,0.55)" : t >= typ ? "rgba(95,200,255,0.5)" : "rgba(95,200,255,0.3)";
    PX.glow(g, LX + LW2 / 2, LY + LH2 / 2, 120, scol);
    R(g, LX - 3, LY - 3, LW2 + 6, LH2 + 6, "#1a1d25"); R(g, LX - 3, LY - 3, LW2 + 6, 1, "#4a5060");
    R(g, LX, LY, LW2, LH2, "#0a0f14");
    clip(g, LX, LY, LW2, LH2, () => {
      T(g, "$ db", LX + 4, LY + 2, { font: "v", size: 10, col: "#5a6a7a" });
      const typed = PX.typed("ROLLBACK", t, typ, 14);
      T(g, ">", LX + 4, LY + 13, { size: 8, col: "#5fe3e8" }); T(g, typed, LX + 14, LY + 13, { size: 8, col: "#e6edf3" });
      if (t < go && PX.blink(t, 0.5, 0.5)) R(g, LX + 15 + PX.tw(g, typed, { size: 8 }), LY + 13, 6, 8, "#e6edf3");
      if (t >= go) {
        const pk = cl((t - go) / Math.max(0.2, ok - go), 0, 1);
        R(g, LX + 4, LY + 28, LW2 - 8, 8, "#1a2230"); for (let i = 0; i < Math.floor((LW2 - 10) * pk / 4); i++) R(g, LX + 5 + i * 4, LY + 29, 3, 6, okd ? "#3df56b" : "#5fe3e8");
        if (okd) { tick(g, LX + 6, LY + 39, 11, "#3df56b"); T(g, "OK", LX + 22, LY + 41, { size: 8, col: "#3df56b" }); }
      }
    });
    // ---- the founder walking in with the flashlight
    const wk = cl(t / walk, 0, 1), fx = lerp(70, CX - 76, PX.ease(wk, "out")), walking = wk < 1 ? 1 - Math.pow(wk, 4) : 0;
    const ph = t * 9 * (wk < 1 ? 1 : 0) + (wk >= 1 ? Math.PI : 0);
    const aim = wk < 1 ? 0.5 : lerp(0.5, 0.3, cl((t - walk) / 0.3, 0, 1)) - (okd ? 0.35 * PX.p(t, ok, 0.4, "back") : 0);
    // the cone first (light lands on the floor and the cart), then the man in front of it
    const shoulderY = FY - 72, sx0 = fx + 6, sy0 = shoulderY + 12;
    const tx0 = sx0 + Math.cos(aim) * 25, ty0 = sy0 + Math.sin(aim) * 25 - 7, L2 = 300, spr = 0.24;
    const op = g.globalCompositeOperation; g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 4; i++) { const s = spr * (1 - i * 0.22);
      A(g, 0.07 + i * 0.03, () => poly(g, [[tx0, ty0], [tx0 + Math.cos(aim - s) * L2, ty0 + Math.sin(aim - s) * L2], [tx0 + Math.cos(aim + s) * L2, ty0 + Math.sin(aim + s) * L2]], "#ffe8b8")); }
    g.globalCompositeOperation = op;
    const hitX = tx0 + Math.cos(aim) * Math.min(L2, (FY - ty0) / Math.max(0.1, Math.sin(aim))), hitY = Math.min(FY, ty0 + Math.sin(aim) * L2);
    PX.glow(g, hitX, hitY, 60, "rgba(255,230,180,0.55)");
    if (wk >= 1) { R(g, CX - 44, 268, 1, 52, "#c8b890"); R(g, CX - 46, 262, 40, 1, "#fff0c8"); R(g, CX - 44, 300, 40, 1, "#c8b890"); }
    const torch = founderWalk(g, fx, FY, ph, t, { walking, arm: "torch", aim, farType: wk >= 1, typing: t >= typ && t < go, smile: okd, brow: t >= go && !okd });
    PX.glow(g, torch.tx, torch.ty, 14, "rgba(255,250,220,0.95)");
    // screen light on his face once he is at the laptop
    if (wk >= 1) PX.glow(g, fx + 10, shoulderY - 16, 30, okd ? "rgba(61,245,107,0.35)" : "rgba(95,200,255,0.25)");
    // ---- DATA BACK
    if (okd) {
      const k = pop(t, ok, 0.4);
      PX.glow(g, CX, 170, 90, "rgba(61,245,107,0.5)", 0.7);
      PX.zoom(g, Math.max(0.05, k), CX, 172, () => {
        PX.circle(g, CX - 74, 172, 11, "#0a2a14"); PX.circle(g, CX - 74, 172, 10, "#1f8a40"); tick(g, CX - 80, 166, 12, "#eaffef");
        OT(g, "DATA BACK", CX + 12, 164, { size: 16, col: "#3df56b", align: "center" });
      });
      sparkles(g, CX, 172, t, ok, 14, 70, 9);
    }
    // ---- foreground: rack edge silhouette + dust in the beam
    PX.par(g, c, 1.2, () => {
      R(g, -10, 0, 44, H, "#06080c"); R(g, 33, 0, 2, H, "#1a2232");
      for (let u = 0; u < 24; u++) { R(g, 6, 10 + u * 15, 24, 1, "#10141c"); if (PX.blink(t + u * 0.3, 0.7, 0.4)) R(g, 26, 14 + u * 15, 2, 2, okd && t - ok > 0.6 ? "#3df56b" : "#ff4d4d"); }
      R(g, 600, 300, 60, 70, "#06080c"); R(g, 600, 300, 60, 1, "#1a2232");
    });
    PX.particles(g, 71, 40, t, [Math.min(tx0, hitX) - 20, Math.min(ty0, hitY) - 30, Math.abs(hitX - tx0) + 60, Math.abs(hitY - ty0) + 60], { vy: -2, vx: 3, col: "#fff0c8", a: 0.55 });
    PX.vignette(g, 0.6);
  };

  // ---------------- the dev: seated, side view facing right ----------------
  // (x, y) hip on the seat, fy floor. o.typing, o.ex "focus" | "grin", o.point {x, y} = near hand with magnifier
  const devSit = (g, x, y, fy, t, o) => {
    o = o || {};
    const br = Math.round(Math.sin(t * 2.3) * 0.8), sx = x + 4, sy = y - 40 + br, hx = sx + 5, hy = sy - 19;
    const tp = o.typing ? (Math.sin(t * 24) > 0 ? 1 : 0) : 0, tq = o.typing ? (Math.sin(t * 21 + 1) > 0 ? 1 : 0) : 0;
    // far leg + far arm (typing)
    thick(g, x, y - 2, x + 26, y - 4, 9, "#1e2638"); thick(g, x + 26, y - 4, x + 30, fy - 6, 8, "#1e2638"); R(g, x + 26, fy - 6, 13, 5, "#1a1a20");
    thick(g, sx, sy + 4, sx + 12, sy + 22, 7, GRN.d); thick(g, sx + 12, sy + 22, sx + 30, sy + 22, 6, GRN.d); R(g, sx + 29, sy + 20 + tq, 5, 4, DSK.d);
    // torso
    for (let i = 0; i <= 40; i++) { const k = i / 40, cx = lerp(x, sx, k), w = Math.round(lerp(20, 19, k)); R(g, cx - w / 2, y - i, w, 1, GRN.b); R(g, cx - w / 2, y - i, 3, 1, GRN.d); R(g, cx + w / 2 - 2, y - i, 2, 1, GRN.l); }
    R(g, x - 10, y - 2, 21, 4, GRN.d); R(g, sx + 2, sy + 12, 8, 9, GRN.d); R(g, sx + 3, sy + 12, 6, 1, GRN.l);
    ell(g, sx - 6, sy + 2, 7, 5, GRN.d); ell(g, sx - 5, sy + 1, 5, 3, GRN.b);
    // near leg
    thick(g, x + 2, y + 1, x + 28, y - 1, 10, "#2d3b55"); thick(g, x + 2, y - 3, x + 28, y - 5, 1, "#4a5a7a"); thick(g, x + 28, y - 1, x + 32, fy - 6, 9, "#2d3b55");
    R(g, x + 28, fy - 7, 15, 5, "#e6e1d6"); R(g, x + 28, fy - 3, 15, 2, "#8a8478");
    // neck + headphones around the neck
    R(g, hx - 4, hy + 10, 9, 9, DSK.d); R(g, hx, hy + 10, 4, 7, DSK.b);
    // head
    ell(g, hx, hy, 12, 13, DSK.d); ell(g, hx + 1, hy, 11, 12, DSK.b); R(g, hx + 10, hy - 5, 2, 10, DSK.l);
    R(g, hx + 12, hy - 2, 2, 5, DSK.b); R(g, hx + 12, hy - 2, 1, 1, DSK.l); R(g, hx + 11, hy + 3, 2, 1, DSK.d);
    // messy dark hair with spikes
    clip(g, hx - 16, hy - 20, 32, 13, () => ell(g, hx - 1, hy - 1, 13, 15, DHAIR.b));
    clip(g, hx - 16, hy - 8, 12, 16, () => ell(g, hx - 1, hy, 13, 14, DHAIR.b));
    g.fillStyle = DHAIR.b; for (let i = 0; i < 6; i++) { const bx = hx - 12 + i * 5; g.beginPath(); g.moveTo(bx - 3, hy - 9); g.lineTo(bx + 4, hy - 10); g.lineTo(bx + (i % 2 ? 3 : -3), hy - 17 - (i % 3) * 2); g.fill(); }
    g.beginPath(); g.moveTo(hx + 2, hy - 9); g.lineTo(hx + 12, hy - 8); g.lineTo(hx + 9, hy - 3); g.fill();   // fringe
    R(g, hx - 7, hy - 14, 8, 1, DHAIR.l); R(g, hx + 2, hy - 12, 6, 1, DHAIR.l);
    ell(g, hx - 2, hy + 1, 2, 3, DSK.b); R(g, hx - 2, hy, 1, 2, DSK.d);
    // face
    const ex = o.ex;
    if (ex === "grin") { R(g, hx + 6, hy - 3, 4, 1, "#140c08"); R(g, hx + 5, hy - 2, 1, 1, "#140c08"); R(g, hx + 10, hy - 2, 1, 1, "#140c08");
      R(g, hx + 6, hy + 4, 7, 4, "#4a1610"); R(g, hx + 6, hy + 4, 7, 1, "#f2ece2"); }
    else { if (PX.blink(t + 0.7, 2.9, 0.05)) R(g, hx + 6, hy - 2, 4, 1, "#140c08"); else { R(g, hx + 7, hy - 4, 3, 4, "#140c08"); R(g, hx + 7, hy - 4, 1, 1, "#f2f4f8"); }
      R(g, hx + 7, hy + 6, 4, 1, "#5a2418"); }
    R(g, hx + 5, hy - 7 + (ex === "focus" ? 1 : 0), 6, 2, DHAIR.b);
    // headphones (band around the neck, cup at the side)
    thick(g, hx - 6, hy + 12, hx + 6, hy + 15, 2, "#2a2e38"); PX.circle(g, hx - 4, hy + 13, 4, "#2a2e38"); PX.circle(g, hx - 4, hy + 13, 2, "#3a4050"); R(g, hx - 5, hy + 11, 2, 1, "#5fe3e8");
    // near arm
    if (o.point) {
      const px = o.point.x, py = o.point.y, ex2 = lerp(sx + 4, px, 0.45), ey2 = lerp(sy + 8, py, 0.45) + 4;
      thick(g, sx + 1, sy + 4, ex2, ey2, 8, GRN.b); thick(g, ex2, ey2, px - 8, py - 6, 7, GRN.b); thick(g, ex2, ey2 - 3, px - 8, py - 9, 1, GRN.l);
      R(g, px - 11, py - 9, 5, 5, DSK.b);
      thick(g, px - 8, py - 6, px - 3, py - 1, 3, "#6a4a2a");                                       // handle
      PX.circle(g, px + 4, py + 6, 10, "#c9ced8"); PX.circle(g, px + 4, py + 6, 8, "#2a4a5a");
      return { lens: { x: px + 4, y: py + 6, r: 8 } };
    }
    thick(g, sx + 1, sy + 3, sx + 12, sy + 22, 8, GRN.b); thick(g, sx - 1, sy + 2, sx + 10, sy + 20, 1, GRN.l);
    thick(g, sx + 12, sy + 22, sx + 30, sy + 24, 7, GRN.b); R(g, sx + 29, sy + 22 + tp, 5, 4, DSK.b);
    return {};
  };
  // red bug 11x7 crawling (frame by t), facing left; s = 1 or 2 (lens view)
  const bug = (g, x, y, t, s) => {
    s = s || 1; const f = Math.floor(t * 12) % 2;
    const P = (dx, dy, w, h, col) => R(g, x + dx * s, y + dy * s, w * s, h * s, col);
    for (let i = 0; i < 3; i++) { P(2 + i * 3, 5 + (f ^ (i % 2)), 1, 2, "#3a0a0a"); P(3 + i * 3, 0 - (f ^ (i % 2)), 1, 2, "#3a0a0a"); }
    P(3, 1, 8, 5, "#2a0606"); P(4, 1, 7, 4, "#ff4d4d"); P(5, 1, 3, 1, "#ff9a9a"); P(7, 2, 1, 3, "#7a1a1a");
    P(0, 2, 4, 3, "#2a0606"); P(1, 2, 3, 2, "#c83030"); P(1, 2, 1, 1, "#ffffff");
    P(-2, 0, 2, 1, "#3a0a0a"); P(-2, 4, 2, 1, "#3a0a0a");
  };

  // =====================================================================
  // typing_race (5.0): fighting-game split arena. Left the dev at a keyboard, right the AI agent with 8 arms; its WPM
  // bar rockets off the scale ("9999+"), code flies out; o.bug 2.5 a red bug crawls out of its output; the dev points
  // a magnifying glass, "FOUND IT"; o.win 3.5 the dev's side lights gold.
  // =====================================================================
  K.typing_race = (o) => {
    const GL = ["{", "}", ";", "=", "()", "=>", "#", "[]", "if", "&&"];
    return (g, t, d, c) => {
      const sc = d / 5, bugT = opt(o, "bug", 2.5 * sc), win = opt(o, "win", 3.5 * sc), rocket = opt(o, "rocket", 0.4 * sc);
      const FY = 300, won = t >= win, wk = won ? PX.p(t, win, 0.5, "out") : 0;
      // ---- arena background (far): crowd tiers + big screens
      PX.vgrad(g, 0, 0, W, FY, "140e2a", "0a0816", 8);
      PX.par(g, c, 0.35, () => {
        R(g, 40, 30, 200, 70, "#0e0c1c"); R(g, 42, 32, 196, 66, "#1a1430"); R(g, 400, 30, 200, 70, "#0e0c1c"); R(g, 402, 32, 196, 66, "#101a30");
        for (let i = 0; i < 6; i++) { R(g, 50 + i * 30, 90 - ((i * 13 + Math.floor(t * 4)) % 40), 20, ((i * 13 + Math.floor(t * 4)) % 40), "#3a2a5a"); R(g, 410 + i * 30, 90 - ((i * 29 + Math.floor(t * 9)) % 50), 20, ((i * 29 + Math.floor(t * 9)) % 50), "#1a4a6a"); }
        const r = PX.rnd(12);
        for (let row = 0; row < 4; row++) for (let x = -10; x < W + 10; x += 9) {
          const yy = 120 + row * 22 + Math.round(Math.sin(t * 6 + x * 0.3 + row) * (r() < 0.4 ? 2 : 0)), sh = row % 2 ? "#1a1430" : "#221a3a";
          PX.circle(g, x + (row % 2) * 4, yy, 4, sh); R(g, x + (row % 2) * 4 - 5, yy + 4, 11, 10, sh);
          if (r() < 0.06 && PX.blink(t + x, 1.3, 0.5)) { R(g, x + (row % 2) * 4 + 3, yy - 8, 2, 3, "#e8f0ff"); PX.glow(g, x + (row % 2) * 4 + 4, yy - 7, 6, "rgba(220,230,255,0.7)"); }
        }
        A(g, 0.6, () => R(g, 0, 110, W, 100, "#0a0816"));
      });
      // ---- light beams (mid)
      PX.par(g, c, 0.55, () => {
        const op = g.globalCompositeOperation; g.globalCompositeOperation = "lighter";
        for (const [bx, col, ph] of [[120, "#ffb060", 0], [200, "#ffb060", 2], [440, "#5fe3e8", 1], [520, "#5fe3e8", 3]]) {
          const a = Math.sin(t * 0.9 + ph) * 0.35, ex = bx + Math.sin(a) * 300;
          A(g, 0.08, () => poly(g, [[bx - 4, 0], [bx + 4, 0], [ex + 50, FY], [ex - 50, FY]], col));
        }
        if (won) A(g, 0.25 * wk, () => poly(g, [[150, 0], [170, 0], [230, FY + 30], [60, FY + 30]], "#f7c948"));
        g.globalCompositeOperation = op;
      });
      // ---- stage floor
      PX.vgrad(g, 0, FY, W, H - FY, "1e1832", "0c0a16", 5);
      R(g, 0, FY, W, 2, "#3a2e5a");
      for (let i = 0; i < 5; i++) R(g, 0, FY + 6 + i * i * 3, W, 1, "#241e3a");
      // side tints
      A(g, 0.10, () => R(g, 0, 0, 320, H, won ? "#f7c948" : "#ff9a50"));
      A(g, 0.08 * (1 - wk * 0.6), () => R(g, 320, 0, 320, H, "#5fe3e8"));
      // ---- the dev's side
      R(g, 166, 248, 106, 6, "#3a3048"); R(g, 166, 248, 106, 1, "#6a5a88"); R(g, 172, 254, 4, FY - 254, "#2a2236"); R(g, 262, 254, 4, FY - 254, "#2a2236");
      R(g, 176, 244, 42, 4, "#2b2f38"); for (let kx = 0; kx < 7; kx++) R(g, 178 + kx * 6, 245, 5, 2, t < bugT && (Math.floor(t * 14) + kx * 3) % 5 === 0 ? "#9aa4b2" : "#5a6270");
      R(g, 246, 206, 4, 38, "#1a1d24"); R(g, 242, 202, 12, 40, "#22262f"); R(g, 243, 204, 2, 36, won ? "#ffe08a" : "#5fe3e8"); R(g, 238, 244, 20, 4, "#22262f");   // monitor (side)
      PX.glow(g, 240, 222, 40, won ? "rgba(255,210,100,0.5)" : "rgba(95,200,255,0.35)");
      R(g, 132, 262, 36, 6, "#2a2d36"); R(g, 132, 262, 36, 1, "#4a505c"); R(g, 148, 268, 4, FY - 276, "#3a3f4b"); R(g, 136, FY - 8, 30, 3, "#2a2d36");    // stool
      // output pile (the AI dumps its code next to the dev's desk)
      const pileH = Math.min(26, Math.floor(cl(t - 0.1, 0, 4) * 10)), pileTop = FY - 4 - pileH * 2;
      for (let i = 0; i < pileH; i++) { const r = PX.rnd(400 + i); R(g, 274 + Math.floor(r() * 8) - 4, FY - 4 - i * 2, 30 + Math.floor(r() * 8), 2, ["#3a4a6a", "#4a5a7a", "#2e3a56"][i % 3]); R(g, 278 + Math.floor(r() * 6), FY - 4 - i * 2, 8 + Math.floor(r() * 12), 1, ["#ff7b72", "#d2a8ff", "#a5d6ff", "#79c0ff"][i % 4]); }
      const pointK = t >= bugT + 0.3 ? PX.p(t, bugT + 0.3, 0.35, "back") : 0;
      const bugX = lerp(278, 197, PX.ease((t - bugT) / 0.9, "io")), bugY = 241;
      const dev = devSit(g, 150, 262, FY, t, { typing: t < bugT + 0.3, ex: won ? "grin" : t >= bugT ? "focus" : undefined, point: pointK > 0 ? { x: lerp(184, 196, pointK), y: lerp(228, 238, pointK) } : null });
      if (won) { PX.glow(g, 160, 216, 90, "rgba(247,201,72,0.55)", wk); sparkles(g, 160, 206, t, win, 16, 70, 3); }
      // ---- the AI side: desk with two keyboards
      R(g, 392, 252, 150, 6, "#24304a"); R(g, 392, 252, 150, 1, "#4a6a9a"); R(g, 400, 258, 4, FY - 258, "#1a2236"); R(g, 532, 258, 4, FY - 258, "#1a2236");
      for (const kx0 of [398, 468]) { R(g, kx0, 247, 64, 5, "#1b1d22"); for (let kx = 0; kx < 10; kx++) R(g, kx0 + 2 + kx * 6, 248, 5, 2, `hsl(${Math.round((t * 200 + kx * 30 + kx0) % 360)},80%,60%)`); }
      // robot: head + collar + 8 arms
      const HX = 476, HY = 172 + Math.round(Math.sin(t * 2.5) * 3), fast = won ? 0.2 : 1;
      PX.glow(g, HX, HY, 80, "rgba(95,227,232,0.35)", 1 - wk * 0.6);
      R(g, HX - 14, HY + 26, 28, 10, BOT.d); R(g, HX - 14, HY + 26, 28, 2, BOT.l); R(g, HX - 10, HY + 36, 20, 8, BOT.o);
      for (let i = 0; i < 8; i++) {
        const side = i < 4 ? -1 : 1, n = i % 4, sxA = HX + side * (6 + n * 2), syA = HY + 30 + n * 3;
        const tx = side < 0 ? 404 + n * 16 : 486 + n * 16, ty = 246 - Math.round(Math.abs(Math.sin(t * 28 * fast + i * 1.7)) * 5 * fast);
        const elx = sxA + side * (22 + n * 7), ely = syA - 6 + n * 5;
        thick(g, sxA, syA, elx, ely, 4, BOT.d); thick(g, sxA, syA - 1, elx, ely - 1, 1, BOT.l); thick(g, elx, ely, tx, ty, 3, BOT.b); PX.circle(g, elx, ely, 2, BOT.o); R(g, tx - 2, ty - 1, 4, 3, BOT.l);
      }
      bot(g, HX, HY, 62, t, { ex: won ? "worry" : t >= bugT ? "wide" : "happy", look: -0.8, noBlink: !won && t < bugT });
      // code flying out to the pile
      if (!won) for (let i = 0; i < 26; i++) {
        const r = PX.rnd(900 + i), per = 0.9, ph = (t * (1 + r()) + r()) % per / per;
        const x0 = 420 + r() * 100, y0 = 240, x1 = 280 + r() * 24, y1 = pileTop - 4;
        const x = lerp(x0, x1, ph), y = lerp(y0, y1, ph) - Math.sin(ph * 3.14) * (60 + r() * 50);
        const s = GL[i % GL.length], col = ["#ff7b72", "#d2a8ff", "#a5d6ff", "#79c0ff", "#3df56b"][i % 5];
        if (i % 3) T(g, s, x, y, { font: "v", size: 14, col }); else R(g, x, y, 10 + (i % 4) * 3, 2, col);
      }
      // the bug: out of the pile, across the dev's desk
      if (t >= bugT) {
        if (t < bugT + 0.4) { const k = (t - bugT) / 0.4; A(g, 1 - k, () => { star4(g, 290, pileTop - 10, 4, "#ff9a9a"); OT(g, "!", 296, pileTop - 30, { size: 16, col: "#ff4d4d" }); }); }
        bug(g, Math.round(bugX), bugY, t);
        PX.glow(g, bugX + 5, bugY + 3, 16, "rgba(255,60,60,0.6)", 0.7 + 0.3 * Math.sin(t * 10));
      }
      // magnified bug inside the lens
      if (dev.lens && t >= bugT) { const L0 = dev.lens; g.save(); g.beginPath(); g.arc(L0.x, L0.y, 8, 0, 6.283); g.clip();
        R(g, L0.x - 8, L0.y - 8, 17, 17, "#24404e"); bug(g, Math.round(L0.x - 10 + (bugX - L0.x + 5) * 2), L0.y - 6, t, 2); R(g, L0.x - 5, L0.y - 6, 3, 1, "#d8f4ff"); g.restore(); }
      // FOUND IT
      if (t >= bugT + 0.6) {
        const k = pop(t, bugT + 0.6, 0.3);
        PX.zoom(g, Math.max(0.05, k), 156, 160, () => { bubble(g, 102, 148, 108, 22, 160, 184, won ? "#fff0b8" : "#f2ecdf"); T(g, "FOUND IT", 156, 155, { size: 8, col: "#1a1830", align: "center" }); });
      }
      // ---- HUD (screen-fixed): WPM bars
      const hud = () => {
        R(g, 46, 24, 244, 14, "#05060a"); R(g, 48, 26, 240, 10, "#2a1a1a");
        const lf = 0.34 + 0.03 * Math.sin(t * 3) + (won ? 0.66 * wk : 0);
        R(g, 48, 26, Math.round(240 * lf), 10, won ? "#f7c948" : "#ffb060"); R(g, 48, 26, Math.round(240 * lf), 2, won ? "#fff0b8" : "#ffd8a0");
        OT(g, "DEV", 48, 42, { size: 8, col: won ? "#f7c948" : "#ffd8a0" }); T(g, "WPM", 288, 42, { size: 8, col: "#8a7a9a", align: "right" });
        if (won) PX.glow(g, 168, 31, 140, "rgba(247,201,72,0.5)", wk * 0.8);
        R(g, 350, 24, 244, 14, "#05060a"); R(g, 352, 26, 240, 10, "#1a1a2a");
        const rf = PX.ease((t - rocket) / 0.6, "in"), over = t > rocket + 0.6, rw = Math.round(240 * rf);
        R(g, 592 - rw, 26, rw, 10, "#5fe3e8"); R(g, 592 - rw, 26, rw, 2, "#d8fbfc");
        if (over) {
          const ow = 40 + Math.round(Math.sin(t * 30) * 6 + Math.sin(t * 13) * 4);
          R(g, 352 - ow, 26, ow, 10, PX.blink(t, 0.1) ? "#ff4d4d" : "#f7c948"); R(g, 349, 22, 3, 18, "#ffffff");
          for (let i = 0; i < 6; i++) { const k = (t * 3 + i / 6) % 1; R(g, 352 - ow - k * 30, 30 + Math.sin(i * 3 + t * 9) * 8 * k, 2, 2, "#f7c948"); }
          PX.glow(g, 352 - ow / 2, 31, 40, "rgba(255,90,60,0.7)");
          const k = pop(t, rocket + 0.6, 0.3);
          PX.zoom(g, Math.max(0.05, k), 540, 50, () => OT(g, "9999+", 592, 44, { size: 16, col: PX.blink(t, 0.2) ? "#ff4d4d" : "#f7c948", align: "right" }));
        }
        OT(g, "AI", 354, 42, { size: 8, col: "#bff6fa" }); T(g, "WPM", 402, 42, { size: 8, col: "#5a7a8a" });
        PX.circle(g, 320, 31, 13, "#05060a"); PX.circle(g, 320, 31, 12, "#2a1a3a"); OT(g, "VS", 321, 24, { size: 8, col: "#f25ca8", align: "center" });
      };
      // split seam
      A(g, 0.5, () => { for (let y = 44; y < FY; y += 4) R(g, 319 + Math.round(Math.sin(y * 0.2 + t * 8) * 1), y, 2, 2, "#f25ca8"); });
      PX.glow(g, 320, 160, 30, "rgba(242,92,168,0.4)");
      // dim the AI side after the win
      if (won) A(g, 0.35 * wk, () => R(g, 322, 40, 318, H, "#05040c"));
      PX.vignette(g, 0.5);
      PX.par(g, c, 0, hud);
    };
  };
})();
