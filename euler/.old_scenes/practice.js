/* Math film, Builder E: desirable difficulty. Documentary palette PX.D only (every shade derived with mix()).
   Kinds: reread, recall, week_later, ebbinghaus, cram, classroom7, gym.
   Cast: THE LEARNER (curly dark hair, teal sweater, medium skin) = the re-reader; THE TESTER (auburn bun, mustard
   cardigan, light skin) = the self-tester. No digits anywhere: calendars, clocks and plates carry ticks only. */
(function () {
  const { K, D } = PX;
  const R = PX.rect, A = PX.alpha, clamp = PX.clamp, lerp = PX.lerp, E = PX.ease;
  const TAU = Math.PI * 2;

  // ---------- colour + shape helpers ----------
  const H2 = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const mix = (a, b, k) => { const P = H2(a), Q = H2(b); return "#" + P.map((v, i) => Math.round(v + (Q[i] - v) * clamp(k, 0, 1)).toString(16).padStart(2, "0")).join(""); };
  const dk = (c, k) => mix(c, D.n0, k), lt = (c, k) => mix(c, D.cream, k);
  const SHD = (a) => `rgba(0,0,0,${a})`;
  const frac = (x) => x - Math.floor(x);
  const hash = (i, j) => frac(Math.sin(i * 127.1 + j * 311.7) * 43758.5453);
  const ell = (g, cx, cy, rx, ry, col) => { rx = Math.max(0, rx); ry = Math.max(0.5, ry); g.fillStyle = col; for (let y = -Math.round(ry); y <= Math.round(ry); y++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); } };
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
  const limb = (g, x1, y1, x2, y2, w, col) => { const h = w >> 1; for (let i = 0; i < w; i++) for (let j = 0; j < w; j++) PX.line(g, x1 + i - h, y1 + j - h, x2 + i - h, y2 + j - h, col); };
  const clip = (g, x, y, w, h, fn) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); };
  const clipP = (g, pts, fn) => { g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip(); fn(); g.restore(); };

  // ---------- beats ----------
  const tm = (o, key, def, d, typ) => (typeof o[key] === "number" ? o[key] : (def * d) / typ);
  const pr = (t, a, b) => clamp((t - a) / Math.max(b - a, 1e-6), 0, 1);
  const label = (g, s, x, y, t, t0, o) => {
    o = o || {}; if (t < t0) return;
    let a = PX.p(t, t0, 0.4, "out"); if (o.out !== undefined && t > o.out) a *= 1 - clamp((t - o.out) / 0.4, 0, 1);
    if (a <= 0) return;
    A(g, a, () => PX.otext(g, s, x, y + Math.round(3 * (1 - PX.p(t, t0, 0.4, "out"))), { align: "center", col: o.col || D.cream, outline: D.n0, size: o.size || 8, font: o.font }));
  };

  // ---------- materials ----------
  const WOOD = [mix(D.lampD, D.rust[2], 0.45), mix(D.rust[2], D.amber[2], 0.4), mix(D.rust[2], D.n1, 0.5), mix(D.rust[2], D.n0, 0.72)];
  const OAK = [mix(D.paperD, D.lampD, 0.4), mix(D.paperD, D.rust[2], 0.4), mix(D.rust[2], D.n2, 0.35)];
  const SKIN = {
    light: [mix(D.rose[0], D.paper, 0.35), mix(D.rose[1], D.paperD, 0.45), mix(D.rose[2], D.paperD, 0.35)],
    medium: [mix(D.rose[0], D.amber[1], 0.35), mix(D.rose[1], D.amber[2], 0.5), mix(D.rose[2], D.amber[2], 0.6)],
    tan: [mix(D.paperD, D.rose[1], 0.4), mix(D.rust[2], D.paperD, 0.55), mix(D.rust[2], D.n2, 0.15)],
    deep: [mix(D.rust[2], D.paperD, 0.45), mix(D.rust[2], D.n2, 0.25), mix(D.rust[2], D.n1, 0.55)],
  };
  const HAIR = {
    black: [mix(D.n3, D.steel[2], 0.3), D.n1, D.n0],
    brown: [mix(D.rust[2], D.paperD, 0.35), mix(D.rust[2], D.n1, 0.45), mix(D.rust[2], D.n0, 0.7)],
    auburn: [mix(D.rust[1], D.amber[1], 0.25), mix(D.rust[2], D.rust[1], 0.35), mix(D.rust[2], D.n1, 0.4)],
    grey: [D.n7, D.n6, D.n5],
    sand: [mix(D.paper, D.amber[0], 0.3), mix(D.paperD, D.amber[2], 0.3), mix(D.amber[2], D.n2, 0.4)],
  };
  const TEAL = [mix(D.teal[1], D.teal[0], 0.45), D.teal[1], D.teal[2]];
  const MUST = [mix(D.amber[1], D.paper, 0.35), mix(D.amber[2], D.paperD, 0.25), mix(D.amber[2], D.n2, 0.45)];
  const LEARNER = { skin: SKIN.medium, hair: HAIR.black, hs: "curly", top: TEAL };
  const TESTER = { skin: SKIN.light, hair: HAIR.auburn, hs: "bun", top: MUST, collar: D.cream };

  // ---------- a person ----------
  // x = body centre, y = seat line (seated: hips hidden by the desk) or feet (o.stand). o: skin/hair/top/bot [l,b,s],
  // hs curly|bun|short|bob|pony|beard, s scale, lean (shoulder x shift), dip (+ = hunch down), face (-1..1 turn),
  // nod (head y), eyes open|half|down|closed|squint|blank|up|wide, brow calm|knit|worry|raise|puzzle|strain,
  // mouth flat|smile|grin|frown|o|talk|grit|side|yawn, look [-1..1, -1..1], hl/hr hand targets [x,y] (null = hang),
  // hlBack/hrBack (arm drawn behind the head), itemL/itemR(g, hx, hy) drawn under the hand, sweat, bags, flush,
  // short (short sleeves) + flex (bicep), shake, glasses, waist (waistcoat colour), sleeve (shirt colour for arms).
  const fig = (g, x, y, t, o) => {
    const s = o.s || 1, P = (v) => Math.round(v * s), sk = o.skin, tp = o.top, hr = o.hair;
    const br = Math.sin(t * 1.5 + (o.seed || 0) * 3) > 0.25 ? 1 : 0;
    const LL = P(36), TL = P(26), lean = Math.round(o.lean || 0), dip = Math.round(o.dip || 0);
    const hipY = o.stand ? y - LL : y, shX = x + lean, shY = hipY - TL + dip - br;
    const lineC = dk(hr[2], 0.2);
    // legs (standing only)
    if (o.stand) {
      const bt = o.bot || [D.n4, D.n3, D.n2], kn = o.knee || 0;
      for (const side of [-1, 1]) {
        const hx = x + side * P(5), kx = hx + side * kn * P(4), ky = hipY + LL * 0.5, fx = x + side * P(6);
        limb(g, hx, hipY + 2, kx, ky, P(8), side < 0 ? bt[1] : bt[2]); limb(g, kx, ky, fx, y - P(3), P(7), side < 0 ? bt[1] : bt[2]);
        R(g, hx - P(3) + (side < 0 ? 0 : 1), hipY + 2, P(2), LL * 0.45, side < 0 ? bt[0] : bt[1]);
        if (o.shorts) { R(g, kx - P(3), ky + P(2), P(6), y - ky - P(5), sk[1]); R(g, kx - P(3), ky + P(2), P(2), y - ky - P(5), sk[0]); R(g, kx + P(2), ky + P(2), P(1), y - ky - P(5), sk[2]); R(g, kx - P(3), y - P(6), P(6), P(3), D.cream); }
        R(g, fx - P(4) + side * P(1), y - P(3), P(9), P(3), D.n1); R(g, fx - P(4) + side * P(1), y - P(3), P(9), 1, D.n4); R(g, fx - P(4) + side * P(1), y - 1, P(9), 1, D.n0);
      }
    }
    // arm helper (two-bone IK, elbow pushed outward / down)
    const SHO = (side) => [shX + side * P(9), shY + P(4)];
    const arm = (side, tgt, front) => {
      const [sx, sy] = SHO(side), la = P(o.arm || 15), lb = P(o.arm || 15);
      let hx, hy;
      if (tgt) { hx = tgt[0]; hy = tgt[1]; } else { hx = sx + side * P(2); hy = sy + la + lb - 2; }
      if (o.shake) { hx += Math.round(Math.sin(t * 41 + side) * o.shake); hy += Math.round(Math.sin(t * 37 + side * 2) * o.shake * 0.6); }
      let dx = hx - sx, dy = hy - sy, dd = Math.hypot(dx, dy);
      if (dd > la + lb - 0.5) { const k = (la + lb - 0.5) / dd; dx *= k; dy *= k; hx = sx + dx; hy = sy + dy; dd = la + lb - 0.5; }
      dd = Math.max(dd, 1);
      const a0 = Math.atan2(dy, dx), ca = clamp((la * la + dd * dd - lb * lb) / (2 * la * dd), -1, 1), al = Math.acos(ca);
      const c1 = [sx + Math.cos(a0 + al) * la, sy + Math.sin(a0 + al) * la], c2 = [sx + Math.cos(a0 - al) * la, sy + Math.sin(a0 - al) * la];
      const score = (p) => (o.elbowDown ? 0 : side * p[0] * (o.elbowIn ? -1 : 1) * 0.5) + p[1];
      const eo = side < 0 ? o.eL : o.eR, [ex, ey] = eo ? eo : score(c1) > score(c2) ? c1 : c2;
      const cS = front ? tp[1] : tp[2], cL = front ? tp[0] : tp[1], sl = o.sleeve;
      if (o.short) {
        const mxp = lerp(sx, ex, 0.45), myp = lerp(sy, ey, 0.45);
        limb(g, sx, sy, mxp, myp, P(6), cS);
        limb(g, mxp, myp, ex, ey, P(5), sk[1]); limb(g, ex, ey, hx, hy, P(4), sk[1]);
        if (o.flex) { const bx = lerp(sx, ex, 0.62), by = lerp(sy, ey, 0.62), ang = Math.atan2(ey - sy, ex - sx); const nx = Math.round(-Math.sin(ang) * o.flex * P(1.5)), ny = Math.round(Math.cos(ang) * o.flex * P(1.5));
          const rx = P(2.6) + o.flex * 0.7, ry = P(1.8) + o.flex * 0.5, ox = bx + side * Math.round(o.flex * 0.6), oy = by;
          ell(g, ox, oy, rx, ry, sk[1]); R(g, ox - 1, oy - Math.round(ry) + 1, P(2), 1, sk[0]); R(g, ox - P(1.5), oy + Math.round(ry) - 1, P(3), 1, sk[2]); if (o.flex > 1.5) PX.line(g, ox - P(1), oy, ox + P(1), oy - 1, sk[2]); }
        PX.line(g, ex, ey, hx, hy, sk[0]);
      } else {
        limb(g, sx, sy, ex, ey, P(6), sl ? sl[1] : cS); limb(g, ex, ey, hx, hy, P(5), sl ? sl[1] : cS);
        PX.line(g, sx - side, sy - 2, ex - side, ey - 2, sl ? sl[0] : cL); PX.line(g, ex - side, ey - 2, hx - side, hy - 2, sl ? sl[0] : cL);
        const cx = lerp(ex, hx, 0.86), cy = lerp(ey, hy, 0.86); R(g, cx - P(2.5), cy - P(2), P(5), P(3), sl ? sl[2] : tp[2]);
      }
      const item = side < 0 ? o.itemL : o.itemR; if (item) item(g, Math.round(hx), Math.round(hy));
      R(g, hx - P(2), hy - P(2), P(4), P(4), sk[1]); R(g, hx - P(2), hy - P(2), P(4), 1, sk[0]); R(g, hx - P(2), hy + P(2) - 1, P(4), 1, sk[2]);
      return [hx, hy];
    };
    // torso
    const tL = Math.max(1, hipY - shY);
    for (let r = 0; r <= tL; r++) {
      const k = r / tL, cx = lerp(shX, x, k), w = Math.round(lerp(P(22), P(18), k)), yy = shY + r;
      const sl = P(5), top = r < sl ? Math.round(w * (0.62 + 0.38 * Math.sqrt(r / sl))) : w;
      R(g, cx - top / 2, yy, top, 1, tp[1]); R(g, cx - top / 2, yy, P(2), 1, tp[0]); R(g, cx + top / 2 - P(4), yy, P(4), 1, tp[2]);
    }
    if (s > 1.3) { // sweater folds
      for (const [a, b, k] of [[0.45, 0.8, -0.28], [0.55, 0.9, 0.3], [0.7, 0.95, -0.05]]) { const y1 = shY + tL * a, y2 = shY + tL * b; PX.line(g, lerp(shX, x, a) + k * P(18), y1, lerp(shX, x, b) + k * P(14), y2, mix(tp[1], tp[2], 0.6)); }
    }
    if (o.waist) { // waistcoat over a shirt
      for (let r = P(2); r <= tL; r++) { const k = r / tL, cx = lerp(shX, x, k), w = Math.round(lerp(P(20), P(18), k)); R(g, cx - w / 2, shY + r, w, 1, o.waist[1]); R(g, cx - w / 2, shY + r, P(1), 1, o.waist[0]); R(g, cx + w / 2 - P(3), shY + r, P(3), 1, o.waist[2]); }
      for (let r = 0; r < P(14); r++) { const ww = Math.max(1, Math.round(P(8) - r * 0.55 * s)); R(g, shX - ww / 2, shY + r, ww, 1, tp[0]); }
      R(g, shX - 1, shY + P(1), 2, P(6), D.n1);   // tie
      for (let k = 0; k < 4; k++) R(g, lerp(shX, x, 0.6) - 1, shY + P(15) + k * P(4), 1, 1, D.paperD);
      R(g, shX + P(3), shY + P(16), P(3), 1, D.paperD); PX.line(g, shX + P(5), shY + P(16), shX + P(8), shY + P(20), D.amber[2]);   // watch chain
    } else {
      // crew-neck collar band (+ shirt collar if o.collar)
      R(g, shX - P(5), shY - 1, P(10), P(2), tp[2]);
      if (o.collar) { poly(g, [[shX - P(5), shY - 1], [shX, shY + P(4)], [shX - P(1), shY - 1]], o.collar); poly(g, [[shX + P(5), shY - 1], [shX, shY + P(4)], [shX + P(1), shY - 1]], o.collar);
        for (let r = P(4); r < tL - P(2); r += P(5)) R(g, shX + Math.round((r / tL) * (x - shX)), shY + r, 1, 1, tp[2]); }
      R(g, lerp(shX, x, 0.95) - P(9), hipY - P(3), P(18), P(3), tp[2]);
    }
    if (o.hlBack) arm(-1, o.hl, false); if (o.hrBack) arm(1, o.hr, false);
    // neck + head
    const f = clamp(o.face || 0, -1, 1), fo = Math.round(f * P(2));
    const HW = P(15), HH = P(17), hcx = shX + fo, hy = shY - P(2.2) - HH + Math.round(o.nod || 0);
    R(g, hcx - P(3), shY - P(5), P(6), P(6), sk[2]); R(g, hcx - P(3), shY - P(5), P(6), 1, dk(sk[2], 0.2));
    for (let r = 0; r < HH; r++) {
      const u = r / HH, w = Math.round(HW * (u < 0.14 ? 0.72 + (u / 0.14) * 0.28 : u > 0.68 ? 1 - ((u - 0.68) / 0.32) * 0.42 : 1));
      R(g, hcx - w / 2, hy + r, w, 1, sk[1]); R(g, hcx - w / 2, hy + r, 1, 1, sk[0]); R(g, hcx + w / 2 - P(2), hy + r, P(2), 1, sk[2]);
    }
    R(g, hcx - HW / 2 - P(1) + Math.max(0, fo), hy + P(7), P(2), P(4), f > 0.3 ? sk[2] : sk[1]); R(g, hcx + HW / 2 - P(1) + Math.min(0, fo), hy + P(7), P(2), P(4), sk[2]);
    // face
    const ey = hy + P(8), ew = s >= 1.35 ? 4 : 3, eh = s >= 1.35 ? 3 : 2, pw = s >= 1.35 ? 2 : 1;
    const look = o.look || [0, 0], lx = Math.round(clamp(look[0], -1, 1) * (ew - pw) / 2), lyU = look[1] < -0.3;
    let ev = o.eyes || "open"; if ((ev === "open" || ev === "half" || ev === "wide") && PX.blink(t + (o.seed || 0) * 1.7, 3.9, 0.04)) ev = "shut";
    const sclera = mix(D.cream, sk[1], 0.25), pup = D.ink, lid = dk(sk[2], 0.15);
    const exs = [hcx - P(4) - Math.floor(ew / 2) + fo, hcx + P(4) - Math.ceil(ew / 2) + fo];
    exs.forEach((ex, i) => {
      const side = i ? 1 : -1;
      if (o.bags) A(g, o.bags, () => R(g, ex, ey + eh, ew, 1, mix(sk[2], D.plum[2], 0.35)));
      if (ev === "open" || ev === "wide" || ev === "up" || ev === "blank") {
        const eh2 = ev === "wide" ? eh + 1 : eh;
        R(g, ex, ey - (ev === "wide" ? 1 : 0), ew, eh2, sclera);
        if (ev === "blank") R(g, ex + Math.floor((ew - 1) / 2), ey + 1, 1, 1, mix(pup, sclera, 0.25));
        else R(g, ex + Math.floor((ew - pw) / 2) + lx, ey - (ev === "up" || lyU ? 1 : 0) + (ev === "wide" ? -1 : 0), pw, ev === "up" || lyU ? eh - 1 : eh2, pup);
        R(g, ex, ey - 1 - (ev === "wide" ? 1 : 0), ew, 1, lineC);
      } else if (ev === "half" || ev === "down") {
        R(g, ex, ey + 1, ew, eh - 1, sclera); R(g, ex + Math.floor((ew - pw) / 2) + lx, ey + 1, pw, eh - 1, pup);
        R(g, ex, ey, ew, 1, lineC); R(g, ex, ey - 1, ew, 1, lid);
      } else if (ev === "closed") { // content, happy-closed arcs
        R(g, ex, ey + 1, 1, 1, lineC); R(g, ex + 1, ey, ew - 2, 1, lineC); R(g, ex + ew - 1, ey + 1, 1, 1, lineC);
      } else if (ev === "squint") {
        R(g, ex, ey + 1, ew, 1, lineC); R(g, side < 0 ? ex + ew - 1 : ex, ey, 1, 1, lineC);
      } else { R(g, ex, ey + 1, ew, 1, lineC); }
    });
    // brows
    const bw = ew + 1, by = ey - P(3) - (o.brow === "raise" ? 1 : 0);
    const bt = o.brow || "calm";
    exs.forEach((ex, i) => {
      const side = i ? 1 : -1, x0 = ex - (side < 0 ? 1 : 0);
      for (let k = 0; k < bw; k++) {
        const inner = side < 0 ? k / (bw - 1) : 1 - k / (bw - 1);
        let dy = 0;
        if (bt === "knit") dy = Math.round(inner * 1.4);
        else if (bt === "strain") dy = Math.round(inner * 2.2) - 1;
        else if (bt === "worry") dy = -Math.round(inner * 1.5);
        else if (bt === "puzzle") dy = side < 0 ? -1 - Math.round((1 - inner) * 1) : Math.round(inner * 1.4);
        R(g, x0 + k, by + dy, 1, s >= 1.35 ? 2 : 1, lineC);
      }
    });
    { const nx = hcx + fo + (f >= 0 ? 0 : -1); R(g, nx, ey + P(2), 1, P(2.5), mix(sk[1], sk[2], 0.6)); R(g, nx - 1, ey + P(4.5), P(2.5), 1, sk[2]); R(g, nx - 2, ey + P(2), 1, P(2), sk[0]); }   // nose
    if (o.flush) A(g, o.flush * 0.45, () => { R(g, exs[0] - 1, ey + eh + 1, ew, 2, D.rose[1]); R(g, exs[1] + 1, ey + eh + 1, ew, 2, D.rose[1]); });
    const my = hy + P(13), mx = hcx + fo, mc = mix(sk[2], D.n0, 0.5), mw = P(5);
    let mo = o.mouth || "flat"; if (mo === "talk") mo = Math.sin(t * 13 + (o.seed || 0)) > 0.1 ? "o" : "flat";
    if (mo === "smile") { R(g, mx - mw / 2 + 1, my, mw - 2, 1, mc); R(g, mx - mw / 2, my - 1, 1, 1, mc); R(g, mx + mw / 2 - 1, my - 1, 1, 1, mc); }
    else if (mo === "grin") { R(g, mx - mw / 2, my - 1, mw, 2, mc); R(g, mx - mw / 2 + 1, my - 1, mw - 2, 1, D.cream); }
    else if (mo === "frown") { R(g, mx - mw / 2 + 1, my - 1, mw - 2, 1, mc); R(g, mx - mw / 2, my, 1, 1, mc); R(g, mx + mw / 2 - 1, my, 1, 1, mc); }
    else if (mo === "o") R(g, mx - 1, my - 1, P(2), P(2), mc);
    else if (mo === "grit") { R(g, mx - mw / 2 - 1, my - 2, mw + 2, 4, mc); R(g, mx - mw / 2, my - 1, mw, 2, D.cream); R(g, mx - 1, my - 1, 1, 2, D.paperD); R(g, mx + 1, my - 1, 1, 2, D.paperD); }
    else if (mo === "side") { R(g, mx - 1, my, P(3), 1, mc); R(g, mx + P(3) - 1, my - 1, 1, 1, mc); }
    else if (mo === "yawn") { ell(g, mx, my, P(2), P(2.5), mc); R(g, mx - 1, my - P(2), P(2), 1, dk(mc, 0.3)); }
    else R(g, mx - Math.floor(mw / 2) + 1, my, mw - 2, 1, mc);
    if (o.glasses) { for (const ex of exs) { PX.box(g, ex - 1, ey - 2, ew + 2, eh + 3, D.n5); } R(g, exs[0] + ew + 1, ey - 1, exs[1] - exs[0] - ew - 2, 1, D.n5); A(g, 0.35, () => { for (const ex of exs) R(g, ex, ey - 1, 1, 1, D.cream); }); }
    // hair
    const hs = o.hs || "short", HX = hcx, top = hy;
    if (hs === "curly") {
      ell(g, HX, top + P(2), HW / 2 + P(2), P(3.5), hr[1]);
      R(g, HX - HW / 2 - P(2), top + P(2), P(3.5), P(7), hr[1]); R(g, HX + HW / 2 - P(1.5), top + P(2), P(3.5), P(7), hr[2]);
      const bumps = 11;
      for (let i = 0; i < bumps; i++) {
        const an = Math.PI * (1.05 + (i / (bumps - 1)) * 0.9), bx = HX + Math.cos(an) * (HW / 2 + P(1.5)), byy = top + P(4) + Math.sin(an) * P(5.5);
        PX.circle(g, bx, byy, Math.max(1, P(2.2)), i % 3 === 2 ? hr[2] : hr[1]); R(g, bx - 1, byy - P(1), P(1.5), 1, hr[0]);
      }
      for (let i = 0; i < 6; i++) { const bx = HX - HW / 2 + P(2) + i * P(2.2), byy = top + P(3.2) + (i % 2) * P(0.8); PX.circle(g, bx, byy, Math.max(1, P(1.4)), i % 2 ? hr[2] : hr[1]); R(g, bx, byy - 1, 1, 1, hr[0]); }
      for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) PX.circle(g, HX + sd * (HW / 2 + P(0.5)), top + P(5) + k * P(2.5), Math.max(1, P(1.6)), sd < 0 ? hr[1] : hr[2]);
    } else if (hs === "bun") {
      PX.circle(g, HX + P(1), top - P(2), P(4), hr[1]); R(g, HX - P(1), top - P(5), P(3), 1, hr[0]); R(g, HX + P(3), top - P(1), P(2), P(2), hr[2]);
      ell(g, HX, top + P(2), HW / 2 + P(1), P(3.5), hr[1]);
      R(g, HX - HW / 2 - P(1), top + P(2), P(3), P(8), hr[1]); R(g, HX + HW / 2 - P(2), top + P(2), P(3), P(7), hr[2]);
      for (let k = 0; k < 2; k++) PX.line(g, HX - P(1), top + P(0.5), HX - HW / 2 + P(1) + k * P(2.5), top + P(4) - k, mix(hr[0], hr[1], 0.4));
      PX.line(g, HX - P(1), top - P(1), HX - P(1), top + P(3), hr[2]);
    } else if (hs === "beard") {
      // balding crown, grey-brown fringe, full beard + moustache
      R(g, HX - HW / 2 - P(1), top + P(3), P(3), P(8), hr[1]); R(g, HX + HW / 2 - P(2), top + P(3), P(3), P(8), hr[2]);
      R(g, HX - HW / 2 + P(1), top + P(1), P(3), P(3), hr[1]); R(g, HX + HW / 2 - P(4), top + P(1), P(3), P(3), hr[2]);
      R(g, HX - P(3), top, P(5), 1, sk[0]);
      const bt2 = hy + P(11), BH = P(10);
      for (let r = 0; r < BH; r++) { const u = r / BH, w = Math.round(HW * (1.0 - u * u * 0.6)); R(g, HX - w / 2, bt2 + r, w, 1, hr[1]); R(g, HX + w / 2 - P(3), bt2 + r, P(3), 1, hr[2]); R(g, HX - w / 2, bt2 + r, 1, 1, hr[0]); }
      R(g, HX - P(4) + fo, bt2, P(8), P(1.5), sk[1]);
      for (let i = 0; i < 40; i++) { const xx = HX - HW / 2 + 2 + hash(i, 4) * (HW - 4), yy = bt2 + P(2) + hash(i, 5) * (BH - P(3)); R(g, xx, yy, 1, 1, i % 2 ? hr[0] : hr[2]); }
      R(g, HX - HW / 2, bt2 - P(3), P(2), P(4), hr[1]); R(g, HX + HW / 2 - P(2), bt2 - P(3), P(2), P(4), hr[2]);   // sideburns
      R(g, mx - P(4), my - P(2), P(8), P(2), hr[0]); R(g, mx - P(4), my - P(1), P(8), 1, hr[1]);
      if (o.mouth === "talk" && Math.sin(t * 13 + (o.seed || 0)) > 0.1) R(g, mx - 1, my, P(2), P(2), mc); else R(g, mx - P(2), my + 1, P(4), 1, mc);
    } else if (hs === "bob") {
      ell(g, HX, top + P(2), HW / 2 + P(1.5), P(3.5), hr[1]); R(g, HX - HW / 2 - P(2), top + P(3), P(4), P(12), hr[1]); R(g, HX + HW / 2 - P(2), top + P(3), P(4), P(12), hr[2]);
      R(g, HX - HW / 2, top + P(4), HW * 0.6, P(2), hr[1]); R(g, HX - P(3), top, P(5), 1, hr[0]);
    } else if (hs === "pony") {
      ell(g, HX, top + P(2), HW / 2 + P(1), P(3.5), hr[1]); R(g, HX - HW / 2 - P(1), top + P(3), P(3), P(6), hr[1]); R(g, HX + HW / 2 - P(2), top + P(3), P(3), P(6), hr[2]);
      R(g, HX + HW / 2, top + P(5), P(3), P(10), hr[2]); R(g, HX - P(4), top + 1, P(6), 1, hr[0]);
    } else { // short
      ell(g, HX, top + P(2.5), HW / 2 + P(1), P(4), hr[1]); R(g, HX - HW / 2 - P(1), top + P(2), P(3), P(6), hr[1]); R(g, HX + HW / 2 - P(2), top + P(2), P(3), P(5), hr[2]);
      R(g, HX - P(4), top, P(7), 1, hr[0]); R(g, HX - HW / 2 + P(2), top + P(4), HW * 0.55, 1, hr[1]);
    }
    if (o.sweat) A(g, o.sweat, () => { const k = frac(t * 0.55 + (o.seed || 0)), sx = hcx + HW / 2 - P(2), sy = hy + P(4) + Math.round(E(k, "in") * P(9)); R(g, sx, sy, 2, 3, D.glass); R(g, sx, sy + 1, 1, 1, D.cream); R(g, sx + 1, sy - 1, 1, 1, D.glass); });
    const hands = { l: null, r: null };
    if (!o.hlBack) hands.l = arm(-1, o.hl, true); if (!o.hrBack) hands.r = arm(1, o.hr, true);
    return { hx: hcx, hy, HW, HH, shX, shY, hipY, ey, hands };
  };

  // ---------- props ----------
  // handwriting: a wobbly ink line of "words" from x, length w, revealed up to prog (0..1); returns the pen point
  const scrawl = (g, x, y, w, col, seed, prog) => {
    const n = Math.round(w * clamp(prog === undefined ? 1 : prog, 0, 1)); let lastY = y;
    for (let i = 0; i < n; i++) {
      const word = Math.floor((i + seed * 7) / 6.5);
      if (hash(word, seed) < 0.2 || frac((i + seed * 7) / 6.5) > 0.86) continue;
      const yy = y + Math.round(Math.sin(i * 1.7 + seed) * 0.8 + Math.sin(i * 0.43 + seed * 2.3) * 0.5);
      R(g, x + i, yy, 1, 1, col); if (hash(i, seed + 3) < 0.18) R(g, x + i, yy - 1, 1, 1, col);
      lastY = yy;
    }
    return [x + n, lastY];
  };
  // book spines along a shelf from x0..x1 standing on y; seed; fog 0..1
  const BOOKC = [D.rust[2], D.moss[2], D.steel[2], D.paperD, D.plum[2], D.teal[2], D.amber[2], D.n4];
  const books = (g, x0, x1, y, hMax, seed, fog) => {
    const r = PX.rnd(seed); let x = x0;
    while (x < x1 - 2) {
      const w = 3 + Math.floor(r() * 4), h = Math.round(hMax * (0.62 + r() * 0.38)), c0 = mix(BOOKC[Math.floor(r() * BOOKC.length)], D.n1, 0.25 + fog);
      if (r() < 0.06 && x + 9 < x1) { poly(g, [[x, y], [x + 4, y], [x + 10, y - h + 3], [x + 6, y - h]], c0); x += 11; continue; }
      if (r() < 0.07) { x += 3 + Math.floor(r() * 6); continue; }
      R(g, x, y - h, Math.min(w, x1 - x), h, c0); R(g, x, y - h, 1, h, mix(c0, D.cream, 0.12)); R(g, x + w - 1, y - h, 1, h, dk(c0, 0.3));
      if (h > 12 && r() < 0.7) { R(g, x, y - h + 3, w, 1, mix(c0, D.lampD, 0.35)); if (r() < 0.5) R(g, x, y - 5, w, 1, mix(c0, D.lampD, 0.3)); }
      x += w;
    }
  };
  // bookcase unit
  const bookcase = (g, x, y, w, h, seed, fog, shelfH) => {
    const wd = (k) => mix(WOOD[k], D.n1, fog);
    R(g, x, y, w, h, wd(3)); R(g, x, y, 4, h, wd(1)); R(g, x + w - 4, y, 4, h, wd(2)); R(g, x, y, w, 5, wd(1)); R(g, x, y + 5, w, 1, wd(3));
    shelfH = shelfH || 34;
    for (let sy = y + 6 + shelfH, k = 0; sy < y + h - 4; sy += shelfH, k++) {
      books(g, x + 4, x + w - 4, sy, shelfH - 7, seed + k * 13, fog);
      R(g, x + 4, sy, w - 8, 3, wd(0)); R(g, x + 4, sy + 3, w - 8, 1, wd(3));
      A(g, 0.4, () => R(g, x + 4, sy - shelfH + 1, w - 8, 3, D.n0));
    }
  };
  // wall clock: tick marks only, hands at angle hm (minute) and hh (hour), radians from 12
  const clock = (g, cx, cy, r, hm, hh, o) => {
    o = o || {};
    PX.circle(g, cx, cy, r + 2, o.rim || D.n4); PX.circle(g, cx, cy, r + 1, o.rimD || D.n3); PX.circle(g, cx, cy, r, o.face || D.paper);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU, k = i % 3 === 0 ? 2.2 : 1.2; PX.line(g, cx + Math.sin(a) * (r - 1), cy - Math.cos(a) * (r - 1), cx + Math.sin(a) * (r - k - 0.5), cy - Math.cos(a) * (r - k - 0.5), o.tick || D.n4); }
    const hand = (a, L, col, w) => { for (let k = 0; k < (w || 1); k++) PX.line(g, cx + k * 0, cy + k * 0, cx + Math.sin(a) * L, cy - Math.cos(a) * L, col); };
    hand(hh, r * 0.5, o.hand || D.ink, 1); PX.line(g, cx + 1, cy, cx + 1 + Math.sin(hh) * r * 0.5, cy - Math.cos(hh) * r * 0.5, o.hand || D.ink);
    hand(hm, r * 0.8, o.hand || D.ink, 1);
    R(g, cx, cy, 1, 1, D.n0);
    A(g, 0.25, () => poly(g, [[cx - r * 0.6, cy - r * 0.5], [cx - r * 0.1, cy - r * 0.85], [cx + r * 0.1, cy - r * 0.8], [cx - r * 0.5, cy - r * 0.3]], D.cream));
  };
  // wall calendar: header band (colour), ring binding, grid cols x rows with blank cells; cell(i, cx, cy, cw, ch) for marks
  const calendar = (g, x, y, w, h, cols, rows, o) => {
    o = o || {};
    A(g, 0.4, () => R(g, x + 2, y + 2, w, h, SHD(1)));
    R(g, x, y, w, h, D.paper); R(g, x, y, w, 1, D.cream); R(g, x + w - 1, y, 1, h, D.paperD); R(g, x, y + h - 1, w, 1, D.paperD);
    const hh = o.head || Math.round(h * 0.24), hc = o.col || D.rust;
    R(g, x, y, w, hh, hc[1]); R(g, x, y, w, 1, hc[0]); R(g, x, y + hh - 1, w, 1, hc[2]);
    if (o.picture) o.picture(x + 2, y + 2, w - 4, hh - 4);
    for (let k = 0; k < 5; k++) { const rx = x + Math.round(w * (0.15 + k * 0.175)); R(g, rx, y - 3, 2, 5, D.n5); R(g, rx, y - 3, 1, 1, D.n7); }
    const gx = x + 3, gy = y + hh + 4, gw = w - 6, gh = h - hh - 7, cw = gw / cols, ch = gh / rows;
    for (let c2 = 0; c2 < cols; c2++) R(g, gx + Math.round(c2 * cw) + 1, gy - 3, Math.max(1, Math.round(cw) - 3), 1, D.paperD);
    for (let i = 0; i <= rows; i++) R(g, gx, gy + Math.round(i * ch), gw, 1, mix(D.paperD, D.paper, 0.4));
    for (let i = 0; i <= cols; i++) R(g, gx + Math.round(i * cw), gy, 1, gh, mix(D.paperD, D.paper, 0.4));
    if (o.cell) for (let r2 = 0; r2 < rows; r2++) for (let c2 = 0; c2 < cols; c2++) o.cell(r2 * cols + c2, gx + Math.round(c2 * cw), gy + Math.round(r2 * ch), Math.round(cw), Math.round(ch));
    return { gx, gy, cw, ch };
  };
  // a cross drawn in red pencil within a cell, progress p
  const cross = (g, x, y, w, h, p, col) => {
    if (p <= 0) return; const a = clamp(p * 2, 0, 1), b = clamp(p * 2 - 1, 0, 1);
    PX.line(g, x + 1, y + 1, x + 1 + (w - 3) * a, y + 1 + (h - 3) * a, col);
    if (b > 0) PX.line(g, x + w - 2, y + 1, x + w - 2 - (w - 3) * b, y + 1 + (h - 3) * b, col);
  };
  // circle mark in a cell, progress p
  const ring = (g, cx, cy, rx, ry, p, col) => { const n = Math.round(40 * clamp(p, 0, 1)); for (let i = 0; i < n; i++) { const a = -2 + (i / 40) * TAU * 1.08; R(g, Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), 1, 1, col); } };
  const dust = (g, t, box, seed, n, a, col) => PX.particles(g, seed || 5, n || 22, t, box, { vy: -2, vx: 1.6, col: col || D.lamp, a: a === undefined ? 0.4 : a, tw: 1.2 });
  // sunbeam: soft polygon of light with dust inside
  const beam = (g, pts, t, a, seed, col) => {
    A(g, a, () => poly(g, pts, col || D.lamp));
    A(g, a * 0.6, () => poly(g, [pts[0], lerpP(pts[0], pts[1], 0.35), lerpP(pts[3], pts[2], 0.35), pts[3]], col || D.lamp));
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    clipP(g, pts, () => dust(g, t, [x0, y0, x1 - x0, y1 - y0], seed, 46, 0.55, D.cream));
  };
  const lerpP = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  // highlighter (held): body + cap; ang 0 = pointing right
  const marker = (g, x, y, col) => { R(g, x - 2, y - 1, 9, 3, D.cream); R(g, x - 2, y + 1, 9, 1, D.paperD); R(g, x + 5, y - 1, 4, 3, col[1]); R(g, x + 5, y - 1, 4, 1, col[0]); R(g, x - 4, y, 2, 1, col[2]); };
  const pencil = (g, x, y, dx, dy) => { // pencil from tip (x,y) back along (dx,dy)
    const L = 12; PX.line(g, x, y, x + dx * 2, y + dy * 2, D.ink); limb(g, x + dx * 2, y + dy * 2, x + dx * L, y + dy * L, 2, D.amber[1]); PX.line(g, x + dx * 3, y + dy * 3 - 1, x + dx * L, y + dy * L - 1, D.amber[0]); R(g, x + dx * L - 1, y + dy * L - 1, 2, 2, D.rose[1]); };

  // ======================= reread =======================
  // a quiet old library in the afternoon: the learner at a long oak table re-reads a highlighted handout, highlighter
  // in hand, flipping the page back and forth; at o.relax (2.0) leans back, one hand behind the head, smiling, the
  // handout held up casually (page flips continue).
  K.reread = (o) => {
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const tR = tm(o, "relax", 2.0, d, 6.0), rp = PX.p(t, tR, 0.8, "io");
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: library wall, tall window, bookcases, a far reader ----
      PX.par(g, c, 0.4, () => {
        PX.vgrad(g, -40, -40, 720, 330, mix(D.n2, WOOD[2], 0.35), mix(D.n1, WOOD[3], 0.5), 8);
        // window (arched) with pale afternoon sky + far trees
        const wx = 150, wy = 34, ww = 74, wh = 150;
        R(g, wx - 7, wy - 4, ww + 14, wh + 12, mix(WOOD[2], D.n1, 0.35));
        clipP(g, [[wx, wy + 30], [wx + 8, wy + 10], [wx + ww / 2, wy], [wx + ww - 8, wy + 10], [wx + ww, wy + 30], [wx + ww, wy + wh], [wx, wy + wh]], () => {
          PX.vgrad(g, wx, wy, ww, wh, mix(D.steel[0], D.cream, 0.45), mix(D.paper, D.lamp, 0.5), 6);
          for (let i = 0; i < 9; i++) ell(g, wx + 4 + i * 9, wy + wh - 18 + (i % 3) * 3, 9, 14, mix(D.moss[1], D.cream, 0.35 - (i % 2) * 0.1));
          R(g, wx, wy + wh - 8, ww, 8, mix(D.moss[2], D.cream, 0.3));
        });
        R(g, wx + ww / 2 - 1, wy, 3, wh, mix(WOOD[2], D.n1, 0.2)); for (let k = 1; k < 5; k++) R(g, wx, wy + 30 + k * 26, ww, 2, mix(WOOD[2], D.n1, 0.2));
        R(g, wx - 10, wy + wh + 6, ww + 20, 4, WOOD[1]); R(g, wx - 10, wy + wh + 6, ww + 20, 1, WOOD[0]);
        PX.glow(g, wx + ww / 2, wy + wh * 0.5, 120, D.lamp, 0.16);
        // bookcases
        bookcase(g, -30, 20, 168, 260, 11, 0.35);
        bookcase(g, 238, 20, 200, 260, 23, 0.35);
        bookcase(g, 444, 20, 230, 260, 37, 0.35);
        // rolling ladder against the right case
        for (const lx of [520, 548]) { PX.line(g, lx, 24, lx - 16, 262, mix(WOOD[0], D.n1, 0.3)); PX.line(g, lx + 1, 24, lx - 15, 262, mix(WOOD[1], D.n1, 0.3)); }
        for (let k = 0; k < 11; k++) { const yy = 40 + k * 21, sh = ((yy - 24) / 238) * 16; R(g, 520 - sh, yy, 29, 2, mix(WOOD[0], D.n1, 0.25)); }
        R(g, 518, 20, 34, 3, D.n4);
        // far reading table + reader silhouette + small green lamp
        R(g, 300, 236, 150, 4, mix(WOOD[1], D.n1, 0.45)); R(g, 300, 240, 150, 26, mix(WOOD[3], D.n1, 0.3));
        ell(g, 340, 220, 7, 8, mix(D.n3, D.steel[2], 0.25)); R(g, 330, 226, 20, 12, mix(D.n3, D.steel[2], 0.3)); R(g, 334, 214, 13, 4, mix(D.n2, D.steel[2], 0.2));
        R(g, 402, 226, 2, 10, D.n3); poly(g, [[394, 222], [412, 222], [410, 216], [396, 216]], mix(D.moss[2], D.n2, 0.4)); PX.glow(g, 403, 226, 24, D.lamp, 0.25);
        // floor
        R(g, -40, 266, 720, 100, mix(WOOD[3], D.n1, 0.25));
        for (let k = 0; k < 6; k++) R(g, -40, 270 + k * 9, 720, 1, mix(WOOD[3], D.n0, 0.3));
      });
      // pendant lamps (mid)
      PX.par(g, c, 0.6, () => {
        for (const lx of [90, 560]) { R(g, lx, -10, 1, 62, D.n4); poly(g, [[lx - 12, 64], [lx + 13, 64], [lx + 6, 52], [lx - 5, 52]], mix(D.moss[2], D.n2, 0.3)); R(g, lx - 12, 64, 25, 1, mix(D.moss[1], D.n2, 0.2)); R(g, lx - 7, 65, 15, 1, D.lamp); PX.glow(g, lx, 68, 46, D.lamp, 0.22); }
      });
      // sunbeam from the window falling across the table
      beam(g, [[160, 70], [226, 60], [470, 290], [330, 310]], t, 0.07, 9, D.lamp);
      // ---- the table (top surface; front edge below frame) ----
      const TY = 262;
      poly(g, [[-40, TY], [680, TY], [680, 370], [-40, 370]], OAK[1]);
      R(g, -40, TY, 720, 3, OAK[0]);
      for (let k = 0; k < 6; k++) { const yy = TY + 12 + k * 17; A(g, 0.3, () => R(g, -40, yy, 720, 1, OAK[2])); }
      A(g, 0.16, () => poly(g, [[200, TY], [380, TY], [470, 370], [250, 370]], D.lamp));     // sun on the table
      // green banker's lamp (right)
      const LX = 486;
      A(g, 0.4, () => ell(g, LX, 290, 40, 6, SHD(1)));
      R(g, LX - 16, 282, 32, 7, D.amber[2]); R(g, LX - 16, 282, 32, 2, D.amber[0]); R(g, LX - 2, 226, 4, 57, D.amber[2]); R(g, LX - 2, 226, 1, 57, D.amber[0]);
      poly(g, [[LX - 36, 226], [LX + 36, 226], [LX + 28, 206], [LX - 28, 206]], mix(D.moss[2], D.teal[2], 0.25)); PX.line(g, LX - 28, 206, LX + 28, 206, mix(D.moss[1], D.teal[1], 0.3));
      PX.line(g, LX - 32, 217, LX + 32, 217, mix(D.moss[1], D.cream, 0.15)); R(g, LX - 34, 226, 68, 2, D.lamp); R(g, LX - 26, 228, 52, 1, D.cream);
      R(g, LX + 30, 226, 1, 10, D.amber[2]); R(g, LX + 29, 236, 3, 3, D.amber[1]);   // pull chain
      PX.glow(g, LX, 238, 90, D.lamp, 0.32);
      A(g, 0.2, () => ell(g, LX - 14, 292, 90, 14, D.lamp));
      // book stack (left) + water bottle + pencil case
      for (const [bx, by, bw, bc] of [[96, 296, 92, D.rust], [102, 282, 84, D.steel], [94, 269, 88, D.moss]]) { A(g, 0.4, () => R(g, bx + 4, by + 4, bw, 13, SHD(1))); R(g, bx, by, bw, 13, mix(bc[2], D.n1, 0.1)); R(g, bx, by, bw, 2, bc[1]); R(g, bx + bw - 9, by + 2, 8, 10, D.paper); R(g, bx + bw - 9, by + 5, 8, 1, D.paperD); R(g, bx + bw - 9, by + 8, 8, 1, D.paperD); }
      R(g, 566, 236, 14, 42, mix(D.teal[2], D.glass, 0.35)); R(g, 566, 236, 3, 42, D.glass); R(g, 567, 228, 12, 8, D.n4); R(g, 567, 228, 12, 1, D.n6); A(g, 0.3, () => ell(g, 573, 279, 12, 2, SHD(1)));
      R(g, 176, 322, 52, 13, mix(D.n3, D.plum[2], 0.35)); R(g, 176, 322, 52, 2, mix(D.n5, D.plum[1], 0.3)); R(g, 200, 322, 1, 13, D.n2);
      // ---- the learner ----
      const S = 2.4, lean = Math.round(lerp(0, -6, rp)), dip = Math.round(lerp(9, -4, rp)), cx = 318, seatY = TY + 3;
      const flipT = (t0, per) => { const k = (t - t0) / per; return { n: Math.floor(k), u: frac(k) }; };
      const held = rp > 0.45, lift = E(clamp((rp - 0.12) / 0.55, 0, 1), "io"), taken = rp > 0.12;
      const sw = frac(Math.max(0, t) / 0.9), lineIdx = Math.floor(Math.max(0, t) / 0.9);
      const pageX = 256, pageY = TY + 4, pw = 124, ph = 44;
      const relaxR = [cx + 30, 244], relaxL = [cx - 14, 158];
      const ly0 = pageY + 9 + (lineIdx % 4) * 9, writeR = [lerp(pageX + pw / 2 + 10, pageX + pw - 10, E(Math.min(1, sw * 1.4), "io")), ly0], restL = [pageX + 16, pageY + ph - 14];
      const er = E(rp, "io");
      const hrT = [lerp(writeR[0], relaxR[0], er), lerp(writeR[1], relaxR[1], er) + (held ? Math.round(Math.sin(t * 1.2)) : 0)], hlT = [lerp(restL[0], relaxL[0], er), lerp(restL[1], relaxL[1], er)];
      const hi = mix(D.amber[0], D.paper, 0.3);
      const lines = (x0, y0, w, side, passes, cur) => {
        for (let k = 0; k < 4; k++) {
          const lx = x0 + 7, ly = y0 + 9 + k * 9, lw = w - 14 - ((k + side) % 3) * 5, isCur = cur && k === lineIdx % 4;
          if (side === 0 || k < passes - 1 || isCur) A(g, 0.8, () => R(g, lx - 2, ly - 2, isCur ? clamp(hrT[0] - lx, 0, lw + 4) : lw + 4, 5, hi));
          scrawl(g, lx, ly, lw, D.ink, k * 3 + side * 11, 1); scrawl(g, lx, ly + 3, lw - 6, mix(D.ink, D.paper, 0.4), k * 5 + side * 7 + 1, 1);
        }
      };
      const passes = Math.min(4, Math.floor(Math.max(0, t) / 0.9) + 1);
      // the spread on the table (the right-hand sheet is the loose handout that gets picked up)
      A(g, 0.45, () => R(g, pageX + 4, pageY + 4, taken ? pw / 2 : pw, ph, SHD(1)));
      R(g, pageX, pageY, pw / 2, ph, D.paper); R(g, pageX, pageY, pw / 2, 1, D.cream); R(g, pageX + pw / 2 - 1, pageY, 1, ph, D.paperD);
      lines(pageX, pageY, pw / 2, 0, passes, false);
      if (!taken) {
        R(g, pageX + pw / 2, pageY, pw / 2, ph, D.paper); R(g, pageX + pw / 2, pageY, pw / 2, 1, D.cream); R(g, pageX + pw / 2 + 1, pageY, 2, ph, mix(D.paper, D.paperD, 0.4));
        lines(pageX + pw / 2, pageY, pw / 2, 1, passes, rp <= 0);
        const fp = flipT(0.6, 1.8), u = clamp(fp.u / 0.32, 0, 1);
        if (t > 0.6 && u < 1 && rp <= 0) { const dir = fp.n % 2 ? -1 : 1, k = Math.cos(u * Math.PI) * dir, wv = Math.round((pw / 2) * Math.abs(k)), lf = Math.round(Math.sin(u * Math.PI) * 14);
          const sx0 = pageX + pw / 2, x2 = k > 0 ? sx0 + wv : sx0 - wv;
          poly(g, [[sx0, pageY], [x2, pageY - lf], [x2, pageY + ph - lf], [sx0, pageY + ph]], mix(D.cream, D.paper, 0.4)); PX.line(g, x2, pageY - lf, x2, pageY + ph - lf, D.paperD);
          if (wv > 12) for (let q = 0; q < 3; q++) A(g, 0.5, () => PX.line(g, sx0 + (x2 - sx0) * 0.15, pageY + 10 + q * 9 - lf * 0.5, sx0 + (x2 - sx0) * 0.8, pageY + 10 + q * 9 - lf, hi)); }
      }
      const P = fig(g, cx, seatY, t, {
        ...LEARNER, s: S, lean, dip, seed: 0.3, face: lerp(0.0, 0.25, rp),
        eyes: held ? (frac(t / 2.4) < 0.45 ? "closed" : "down") : "down", brow: held ? "raise" : "calm", mouth: held ? "smile" : (frac(t / 1.8) < 0.5 ? "flat" : "smile"),
        nod: held ? Math.round(Math.sin(t * 2.1) * 1.4) : 0, look: [0.4, 0], hl: hlT, hr: hrT, hlBack: rp > 0.5,
        itemR: rp < 0.5 ? (g2, hx, hy) => marker(g2, hx + 2, hy + 2, D.amber) : null,
      });
      // the handout travels from the table into the hand and turns upright; held, we see its back (faint show-through)
      if (taken) {
        const [hx, hy] = P.hands.r, bw = Math.round(lerp(pw / 2, 38, lift)), bh = Math.round(lerp(ph, 48, lift));
        const bx = Math.round(lerp(pageX + pw / 2, hx - bw + 6, lift)), by = Math.round(lerp(pageY, hy - bh + 14, lift));
        A(g, 0.35, () => R(g, bx + 3, by + 3, bw, bh, SHD(1)));
        R(g, bx, by, bw, bh, D.paper); R(g, bx, by, bw, 1, D.cream); R(g, bx + bw - 1, by, 1, bh, D.paperD); R(g, bx, by + bh - 1, bw, 1, D.paperD);
        if (lift < 0.5) { for (let k = 0; k < 4; k++) { A(g, 0.8, () => R(g, bx + 5, by + 7 + k * Math.round(bh / 5), bw - 14, 4, hi)); scrawl(g, bx + 6, by + 8 + k * Math.round(bh / 5), bw - 16, D.ink, k * 3 + 11, 1); } }
        else for (let k = 0; k < 7; k++) A(g, 0.3, () => R(g, bx + 5 + (k % 2) * 4, by + 6 + k * 6, bw - 14, 3, mix(D.amber[0], D.paper, 0.3)));
        R(g, bx + 2, by + 2, 3, 2, D.n5);
        const fp = flipT(tR + 0.8, 1.5), u = clamp(fp.u / 0.32, 0, 1);
        if (lift >= 1 && u < 1 && t > tR + 0.8) { const yb = by + bh - Math.round(E(u, "io") * bh * 1.5), lf = Math.round(Math.sin(u * Math.PI) * 6);
          poly(g, [[bx, by], [bx + bw, by], [bx + bw + lf, Math.max(by - bh * 0.5, yb)], [bx + lf, Math.max(by - bh * 0.5, yb)]], u < 0.5 ? D.cream : mix(D.paper, D.amber[0], 0.15)); }
        const sk = LEARNER.skin;
        R(g, hx - 5, hy - 5, 10, 10, sk[1]); R(g, hx - 5, hy - 5, 10, 2, sk[0]); R(g, hx - 5, hy + 3, 10, 2, sk[2]);
        if (rp >= 0.5) { const ang = t * 2.6; limb(g, hx + 4 - Math.cos(ang) * 9, hy - Math.sin(ang) * 4, hx + 4 + Math.cos(ang) * 9, hy + Math.sin(ang) * 4, 3, D.amber[1]); }
        else marker(g, hx + 2, hy + 2, D.amber);
      }
      PX.glow(g, P.hx - 40, P.hy + 14, 70, D.cream, 0.07); PX.glow(g, LX - 30, 236, 60, D.lamp, 0.1);
      // foreground: out-of-focus book spines bottom-left, chair top bottom-right
      PX.par(g, c, 1.18, () => {
        for (let k = 0; k < 6; k++) { const bc = BOOKC[(k * 3) % 8]; R(g, -24 + k * 16, 306 - (k % 3) * 9, 15, 80, mix(bc, D.n0, 0.55)); R(g, -24 + k * 16, 306 - (k % 3) * 9, 15, 2, mix(bc, D.n2, 0.4)); }
        R(g, 556, 326, 120, 9, mix(WOOD[3], D.n0, 0.4)); R(g, 556, 326, 120, 1, mix(WOOD[1], D.n1, 0.5)); R(g, 572, 335, 7, 40, mix(WOOD[3], D.n0, 0.5));
      });
      PX.vignette(g, 0.5);
    };
  };
  // ======================= recall =======================
  // the tester's bedroom desk at dusk: she reads a textbook, closes it (o.close 0.5, a soft puff of dust), slides it
  // away and writes from memory on a blank sheet, frowning with effort; o.pause (2.4) pencil to the chin, eyes up,
  // thinking; o.resume (3.6) writes again, faster.
  K.recall = (o) => {
    const city = []; { const r = PX.rnd(71); let x = 372; while (x < 640) { const w = 14 + r() * 26, h = 20 + r() * 50; city.push([x, w, h, r()]); x += w + 1; } }
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const tC = tm(o, "close", 0.5, d, 6.0), tP = tm(o, "pause", 2.4, d, 6.0), tW = tm(o, "resume", 3.6, d, 6.0);
      const closeP = PX.p(t, tC, 0.45, "io"), slide = PX.p(t, tC + 0.45, 0.5, "io"), sheetIn = PX.p(t, tC + 0.6, 0.45, "out");
      // writing schedule: line progress (lines of 0.55 s) during [tC+1.0, tP] and [tW, end]
      const w1 = tC + 1.0, LS = 0.55, NL = 7;
      const writeT = Math.max(0, Math.min(t, Math.max(w1, tP)) - w1) + Math.max(0, t - Math.max(tW, w1)) * 1.25;
      const writing = t > w1 && (t < tP || t > tW), thinking = t >= tP && t < tW && t > w1;
      const lineF = clamp(writeT / LS, 0, NL), li = Math.min(NL - 1, Math.floor(lineF)), lp = lineF >= NL ? 1 : frac(lineF);
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: bedroom wall, window at dusk, corkboard, shelf ----
      PX.par(g, c, 0.45, () => {
        const wall = mix(D.n3, D.steel[2], 0.35);
        PX.vgrad(g, -40, -40, 720, 330, mix(wall, D.n2, 0.2), dk(wall, 0.35), 8);
        // window
        const wx = 392, wy = 40, ww = 190, wh = 170;
        R(g, wx - 8, wy - 8, ww + 16, wh + 16, mix(D.n4, D.paperD, 0.25)); R(g, wx - 8, wy - 8, ww + 16, 2, mix(D.n6, D.paper, 0.3));
        PX.vgrad(g, wx, wy, ww, wh, mix(D.steel[2], D.n1, 0.35), mix(D.rose[2], D.paperD, 0.45), 7);
        PX.glow(g, wx + ww * 0.3, wy + wh, 120, D.lampD, 0.12);
        for (let i = 0; i < 14; i++) A(g, 0.5 + 0.4 * hash(i, 2), () => R(g, wx + hash(i, 1) * ww, wy + hash(i, 3) * wh * 0.4, 1, 1, D.cream));
        clip(g, wx, wy, ww, wh, () => {
          for (const [bx, bw, bh, k] of city) { const top = wy + wh - bh; R(g, bx, top, bw, bh, mix(D.n1, D.steel[2], 0.25)); R(g, bx, top, bw, 1, mix(D.n2, D.steel[1], 0.2));
            if (k > 0.5) { R(g, bx + bw / 2 - 1, top - 6, 2, 6, D.n1); }
            for (let yy = top + 5; yy < wy + wh - 4; yy += 7) for (let xx = bx + 3; xx < bx + bw - 3; xx += 6) if (hash(xx, yy) < 0.32) A(g, 0.6 + 0.3 * Math.sin(t * 0.4 + xx), () => R(g, xx, yy, 2, 3, D.lampD)); }
        });
        R(g, wx + ww / 2 - 2, wy, 4, wh, mix(D.n4, D.paperD, 0.25)); R(g, wx, wy + wh * 0.45, ww, 3, mix(D.n4, D.paperD, 0.25));
        R(g, wx - 14, wy + wh + 8, ww + 28, 5, mix(D.n5, D.paperD, 0.25)); R(g, wx - 14, wy + wh + 8, ww + 28, 1, mix(D.n7, D.paper, 0.2));
        // curtain on the right, breathing
        for (let k = 0; k < 6; k++) { const xx = wx + ww - 10 + k * 7 + (k === 0 ? Math.round(Math.sin(t * 0.7) * 2) : 0); R(g, xx, wy - 14, 7, wh + 40, k % 2 ? mix(D.moss[2], D.n2, 0.55) : mix(D.moss[2], D.n2, 0.4)); }
        R(g, wx - 24, wy - 16, ww + 70, 3, D.n5);
        // plant on the sill
        R(g, wx + 20, wy + wh - 4, 18, 14, mix(D.rust[2], D.paperD, 0.3)); R(g, wx + 20, wy + wh - 4, 18, 2, mix(D.rust[1], D.paperD, 0.3));
        for (let i = 0; i < 9; i++) { const a = -2.6 + i * 0.32 + Math.sin(t * 0.8 + i) * 0.04, L = 14 + (i % 3) * 6; limb(g, wx + 29, wy + wh - 4, wx + 29 + Math.cos(a) * L, wy + wh - 4 + Math.sin(a) * L, 2, i % 2 ? D.moss[1] : D.moss[2]); }
        // corkboard with pinned notes (no writing that reads)
        const cbx = 40, cby = 54, cbw = 150, cbh = 104;
        R(g, cbx - 4, cby - 4, cbw + 8, cbh + 8, WOOD[1]); R(g, cbx - 4, cby - 4, cbw + 8, 1, WOOD[0]);
        R(g, cbx, cby, cbw, cbh, mix(D.paperD, D.amber[2], 0.35));
        for (let i = 0; i < 60; i++) R(g, cbx + hash(i, 5) * cbw, cby + hash(i, 6) * cbh, 1, 1, mix(D.paperD, D.amber[2], 0.6));
        for (const [nx, ny, nw, nh, col, pin] of [[10, 10, 34, 26, D.paper, D.rust[1]], [52, 6, 28, 34, mix(D.moss[0], D.paper, 0.5), D.steel[1]], [92, 14, 44, 30, D.cream, D.moss[1]], [16, 52, 40, 36, mix(D.steel[0], D.paper, 0.5), D.amber[1]], [70, 56, 30, 30, D.paper, D.rust[1]], [108, 54, 32, 40, mix(D.rose[0], D.paper, 0.5), D.teal[1]]]) {
          A(g, 0.35, () => R(g, cbx + nx + 2, cby + ny + 2, nw, nh, SHD(1))); R(g, cbx + nx, cby + ny, nw, nh, col); R(g, cbx + nx, cby + ny, nw, 1, lt(col, 0.3));
          for (let k = 0; k < Math.floor((nh - 8) / 5); k++) scrawl(g, cbx + nx + 4, cby + ny + 7 + k * 5, nw - 8 - (k % 2) * 6, mix(D.ink, col, 0.35), nx + k, 1);
          R(g, cbx + nx + nw / 2 - 1, cby + ny + 1, 3, 3, pin); R(g, cbx + nx + nw / 2 - 1, cby + ny + 1, 1, 1, lt(pin, 0.5));
        }
        // shelf with books + a small globe
        R(g, 206, 112, 150, 4, WOOD[1]); R(g, 206, 112, 150, 1, WOOD[0]); R(g, 206, 116, 150, 2, D.n1);
        books(g, 212, 300, 112, 30, 5, 0.25);
        PX.circle(g, 326, 96, 11, mix(D.teal[2], D.paperD, 0.3)); ell(g, 322, 92, 5, 4, mix(D.moss[2], D.paperD, 0.3)); R(g, 324, 107, 4, 5, D.amber[2]); R(g, 318, 111, 16, 2, D.amber[2]);
      });
      // ---- desk lamp (anglepoise, left) + desk ----
      const TY = 262;
      poly(g, [[-40, TY], [680, TY], [680, 370], [-40, 370]], mix(WOOD[1], D.n2, 0.3));
      R(g, -40, TY, 720, 3, mix(WOOD[0], D.n2, 0.25));
      for (let k = 0; k < 6; k++) A(g, 0.3, () => R(g, -40, TY + 12 + k * 17, 720, 1, WOOD[2]));
      const LX = 140;
      A(g, 0.45, () => ell(g, LX, 290, 30, 5, SHD(1)));
      ell(g, LX, 286, 22, 4, D.n2); R(g, LX - 22, 284, 44, 2, D.n4);
      limb(g, LX, 284, LX + 18, 214, 4, D.n3); limb(g, LX + 18, 214, LX + 62, 196, 4, D.n3); PX.line(g, LX + 1, 283, LX + 19, 213, D.n5); PX.line(g, LX + 19, 213, LX + 63, 195, D.n5);
      R(g, LX + 15, 211, 6, 6, D.n4);
      poly(g, [[LX + 54, 190], [LX + 74, 196], [LX + 86, 226], [LX + 52, 220]], mix(D.n3, D.moss[2], 0.3)); PX.line(g, LX + 54, 190, LX + 74, 196, D.n5);
      poly(g, [[LX + 53, 219], [LX + 86, 225], [LX + 84, 228], [LX + 54, 222]], D.lamp);
      PX.glow(g, LX + 70, 228, 90, D.lamp, 0.34);
      A(g, 0.22, () => poly(g, [[LX + 54, 222], [LX + 86, 227], [LX + 260, 330], [LX + 30, 340]], D.lamp));
      // mug + pencil cup (right)
      R(g, 520, 250, 26, 30, mix(D.teal[2], D.n3, 0.25)); R(g, 520, 250, 26, 2, mix(D.teal[1], D.n4, 0.2)); R(g, 520, 250, 3, 30, mix(D.teal[1], D.n3, 0.2));
      for (let k = 0; k < 4; k++) limb(g, 524 + k * 6, 250, 520 + k * 9, 222 + (k % 2) * 6, 2, [D.amber[1], D.steel[1], D.rust[1], D.moss[1]][k]);
      R(g, 560, 262, 24, 22, D.n6); R(g, 560, 262, 24, 2, D.n7); R(g, 584, 266, 5, 12, D.n6); R(g, 563, 263, 18, 3, mix(D.rust[2], D.n0, 0.4));
      for (let i = 0; i < 3; i++) { const k = frac(t * 0.45 + i / 3); A(g, 0.3 * (1 - k), () => R(g, 568 + Math.round(Math.sin(k * 6 + i) * 3), 256 - k * 20, 1, 4, D.cream)); }
      A(g, 0.4, () => { R(g, 524, 280, 26, 3, SHD(1)); R(g, 564, 284, 26, 3, SHD(1)); });
      // ---- the textbook: open, then closing, then slid to the left ----
      const bx0 = 262, by0 = TY + 6, bw = 116, bh = 44, bkX = Math.round(lerp(bx0, 196, slide)), bkY = Math.round(lerp(by0, TY + 18, slide));
      const COV = [mix(D.moss[1], D.paperD, 0.2), mix(D.moss[2], D.n2, 0.15), mix(D.moss[2], D.n0, 0.45)];
      if (closeP <= 0) {
        A(g, 0.45, () => R(g, bx0 + 4, by0 + 4, bw, bh, SHD(1)));
        R(g, bx0 - 2, by0 - 1, bw + 4, bh + 3, COV[2]);
        R(g, bx0, by0, bw, bh, D.paper); R(g, bx0 + bw / 2 - 1, by0, 2, bh, D.paperD); R(g, bx0, by0, bw, 1, D.cream);
        for (let k = 0; k < 4; k++) for (const sd of [0, 1]) scrawl(g, bx0 + 6 + sd * bw / 2, by0 + 7 + k * 9, bw / 2 - 12, mix(D.ink, D.paper, 0.25), k * 4 + sd * 9, 1);
        R(g, bx0 + 8, by0 + 7, 20, 14, mix(D.steel[0], D.paper, 0.4));   // a small figure on the page
      } else {
        const u = closeP, half = bw / 2;
        if (u < 1) {
          A(g, 0.45, () => R(g, bx0 + 4, by0 + 4, half, bh, SHD(1)));
          R(g, bx0 - 2, by0 - 1, half + 2, bh + 3, COV[2]); R(g, bx0, by0, half, bh, D.paper);
          for (let k = 0; k < 4; k++) scrawl(g, bx0 + 6, by0 + 7 + k * 9, half - 12, mix(D.ink, D.paper, 0.25), k * 4, 1);
          const k2 = Math.cos(u * Math.PI), wv = Math.round(half * Math.abs(k2)), lift = Math.round(Math.sin(u * Math.PI) * 22), sx0 = bx0 + half;
          const x2 = k2 > 0 ? sx0 + wv : sx0 - wv;
          poly(g, [[sx0, by0], [x2, by0 - lift], [x2, by0 + bh - lift], [sx0, by0 + bh]], k2 > 0 ? D.paper : COV[1]);
          if (k2 <= 0) PX.line(g, x2, by0 - lift, x2, by0 + bh - lift, COV[0]);
        } else {
          A(g, 0.45, () => R(g, bkX + 4, bkY + 4, half + 4, bh + 2, SHD(1)));
          R(g, bkX, bkY, half + 4, bh + 2, COV[1]); R(g, bkX, bkY, half + 4, 2, COV[0]); R(g, bkX, bkY, 4, bh + 2, COV[2]); R(g, bkX + half + 2, bkY + 2, 2, bh, D.paper);
          R(g, bkX + 12, bkY + 10, half - 18, 3, mix(COV[0], D.paper, 0.4)); R(g, bkX + 12, bkY + 16, half - 26, 2, mix(COV[0], D.paper, 0.2));
          PX.circle(g, bkX + half / 2 + 2, bkY + 31, 6, mix(COV[0], D.paper, 0.25));
        }
        // dust puff on the slam
        const pf = (t - tC - 0.42) / 0.7;
        if (pf > 0 && pf < 1) for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI + Math.PI, r2 = 6 + pf * 26 * (0.6 + hash(i, 2) * 0.6); A(g, 0.5 * (1 - pf), () => R(g, bx0 + half + Math.cos(a) * r2 * 1.6, by0 + bh / 2 + Math.sin(a) * r2 * 0.5 - pf * 6, 2, 2, D.cream)); }
      }
      // ---- the blank sheet slides in, filled with her writing ----
      const sx = Math.round(lerp(470, 286, sheetIn)), sy = TY + 6, sw2 = 96, sh2 = 60;
      if (sheetIn > 0) {
        A(g, 0.45, () => R(g, sx + 4, sy + 4, sw2, sh2, SHD(1)));
        R(g, sx, sy, sw2, sh2, D.cream); R(g, sx, sy, sw2, 1, lt(D.cream, 0.5)); R(g, sx + sw2 - 1, sy, 1, sh2, D.paper); R(g, sx, sy + sh2 - 1, sw2, 1, D.paper);
        for (let k = 0; k < NL; k++) R(g, sx + 4, sy + 7 + k * 7 + 2, sw2 - 8, 1, mix(D.steel[0], D.cream, 0.65));
        R(g, sx + 12, sy + 2, 1, sh2 - 4, mix(D.rose[0], D.cream, 0.5));
      }
      let pen = [sx + 18, sy + 7];
      if (sheetIn >= 1) for (let k = 0; k <= li; k++) {
        const lw = sw2 - 30 - (k % 3) * 8, p = k < li ? 1 : lp;
        const e = scrawl(g, sx + 16, sy + 7 + k * 7, lw, D.ink, 20 + k * 3, p);
        if (k === li) pen = e;
        if (k === 2 && p >= 1) { R(g, sx + 16 + lw - 18, sy + 7 + k * 7, 10, 1, D.ink); }   // a crossed-out word
      }
      // ---- the tester ----
      const cx = 330, sk = TESTER.skin;
      const tick = Math.round(Math.sin(t * 5) * 1.2);
      let hr2, hl2, look = [0, 0.4], eyes = "down", brow = "knit", mouth = "flat", dip = 6, face = 0.05, nod = 0;
      if (closeP < 1 && t < tC + 0.45) { hl2 = [bx0 + 18, by0 + bh - 12]; hr2 = closeP > 0 ? [lerp(bx0 + bw - 14, bx0 + 30, closeP), by0 + bh - 14 - Math.sin(closeP * Math.PI) * 18] : [bx0 + bw - 18, by0 + bh - 12]; eyes = "down"; brow = "calm"; dip = 6; }
      else {
        const sp = slide;
        hl2 = [lerp(bx0 + 22, sx + 10, sp), lerp(by0 + bh - 14, sy + sh2 - 14, sp)];
        hr2 = writing && sheetIn >= 1 ? [pen[0] + 1, pen[1] + 1 + (frac(t * 7) < 0.5 ? 0 : 1)] : sheetIn < 1 ? [lerp(sx + 60, sx + 30, sheetIn), sy + 30] : [pen[0], pen[1] + 2];
        if (thinking) {
          const k = PX.p(t, tP, 0.4, "io") * (1 - PX.p(t, tW - 0.3, 0.3, "io"));
          hr2 = [lerp(hr2[0], cx + 12, k), lerp(hr2[1], 214 + tick * 0, k)];
          look = [lerp(0, 0.7, k), lerp(0.4, -1, k)]; eyes = k > 0.5 ? "up" : "down"; brow = k > 0.4 ? "strain" : "knit"; mouth = k > 0.5 ? "side" : "flat"; dip = Math.round(lerp(6, 0, k)); face = lerp(0.05, 0.3, k); nod = Math.round(-k * 2);
        } else if (writing) { brow = "knit"; mouth = t > tW ? (frac(t / 1.6) < 0.3 ? "smile" : "flat") : "frown"; nod = Math.round(Math.sin(t * 3) * 0.6); }
      }
      const pt = thinking && PX.p(t, tP, 0.4, "io") > 0.6;
      fig(g, cx, TY + 3, t, {
        ...TESTER, s: 2.4, lean: 0, dip, face, nod, seed: 1.1, look, eyes, brow, mouth, hl: hl2, hr: hr2,
        itemR: (t > tC + 0.6) ? (g2, hx, hy) => (pt ? pencil(g2, hx - 1, hy - 6 + tick, 0.15, -1) : pencil(g2, hx - 2, hy + 2, 0.55, -0.85)) : null,
      });
      // lamp light on her and the page
      PX.glow(g, sx + 48, sy + 30, 70, D.lamp, 0.12); PX.glow(g, cx - 20, 200, 60, D.lamp, 0.08);
      // foreground: chair back + a stack of loose paper bottom-left (dark, out of focus)
      PX.par(g, c, 1.18, () => {
        R(g, -30, 318, 150, 60, mix(D.n0, D.steel[2], 0.15)); R(g, -30, 318, 150, 2, mix(D.n2, D.steel[2], 0.2));
        poly(g, [[520, 360], [548, 300], [600, 296], [600, 360]], mix(D.n0, WOOD[3], 0.4)); PX.line(g, 548, 300, 600, 296, mix(D.n2, WOOD[2], 0.3));
      });
      PX.particles(g, 13, 22, t, [LX + 40, 220, 220, 100], { vy: -1.5, vx: 1, col: D.lamp, a: 0.35 });
      PX.vignette(g, 0.55);
    };
  };
  // ======================= week_later =======================
  // a classroom a week later: a weekly wall calendar flips to the next week (o.flip 0.5) where the quiz day is circled
  // "QUIZ"; below it the two students sit side by side and turn their quiz sheets over. At o.result (3.0) the room
  // splits: the re-reader (learner, left) goes dim and cool, staring at a blank page, pencil hovering; the self-tester
  // (right) sits in warm window light and writes fluently.
  K.week_later = (o) => {
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const tF = tm(o, "flip", 0.5, d, 8.0), tRs = tm(o, "result", 3.0, d, 8.0);
      const fp = PX.p(t, tF, 0.7, "io"), turn = PX.p(t, Math.min(tF + 1.0, tRs - 0.9), 0.5, "io"), rk = PX.p(t, tRs, 1.0, "io");
      const wall = mix(D.paperD, D.n3, 0.55);
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: classroom wall, window (right), cupboard + map (left), clock, calendar ----
      PX.par(g, c, 0.45, () => {
        PX.vgrad(g, -40, -40, 720, 330, mix(wall, D.n2, 0.15), dk(wall, 0.35), 8);
        R(g, -40, 214, 720, 4, mix(wall, D.n1, 0.35)); R(g, -40, 214, 720, 1, mix(wall, D.cream, 0.15)); R(g, -40, 218, 720, 80, mix(wall, D.n1, 0.25));   // dado rail + lower wall
        for (let x = -30; x < 680; x += 58) { PX.box(g, x, 226, 48, 60, mix(wall, D.n1, 0.4)); R(g, x + 1, 227, 46, 1, mix(wall, D.n6, 0.12)); }
        A(g, 0.12, () => PX.vgrad(g, 300, -40, 340, 260, mix(wall, D.cream, 0.4), wall, 5));
        // children's drawings pinned between the map and the calendar
        for (const [px, py, col] of [[160, 104, D.moss], [204, 112, D.steel], [168, 150, D.rose]]) { R(g, px, py, 26, 20, D.cream); R(g, px, py, 26, 1, lt(D.cream, 0.5)); ell(g, px + 13, py + 12, 7, 5, mix(col[1], D.cream, 0.3)); R(g, px + 4, py + 16, 18, 1, mix(col[2], D.cream, 0.4)); R(g, px + 12, py, 2, 2, D.rust[1]); }
        // window (right) with a pale morning sky and a tree
        const wx = 470, wy = 36, ww = 150, wh = 168;
        R(g, wx - 8, wy - 8, ww + 16, wh + 16, mix(D.n5, D.paper, 0.2));
        PX.vgrad(g, wx, wy, ww, wh, mix(D.steel[0], D.cream, 0.4), mix(D.paper, D.lamp, 0.45), 6);
        ell(g, wx + 104, wy + 112, 44, 40, mix(D.moss[1], D.cream, 0.25)); ell(g, wx + 74, wy + 132, 34, 30, mix(D.moss[1], D.cream, 0.4)); R(g, wx + 100, wy + 140, 6, 30, mix(D.n4, D.paperD, 0.4));
        for (let k = 1; k < 3; k++) R(g, wx + k * ww / 3 - 1, wy, 3, wh, mix(D.n5, D.paper, 0.25)); R(g, wx, wy + 70, ww, 3, mix(D.n5, D.paper, 0.25));
        R(g, wx - 12, wy + wh + 6, ww + 24, 5, mix(D.n6, D.paper, 0.25));
        PX.glow(g, wx + ww / 2, wy + wh / 2, 140, D.lamp, 0.14 + 0.1 * rk);
        // cupboard + map (left)
        R(g, 24, 120, 112, 98, WOOD[2]); R(g, 24, 120, 112, 3, WOOD[0]); R(g, 78, 124, 2, 94, WOOD[3]); R(g, 70, 166, 3, 8, D.n5); R(g, 84, 166, 3, 8, D.n5);
        books(g, 30, 130, 120, 22, 77, 0.2);
        R(g, 28, 28, 120, 76, mix(D.paperD, D.amber[2], 0.25)); R(g, 28, 28, 120, 2, D.n5); R(g, 26, 26, 124, 2, WOOD[1]);
        PX.vgrad(g, 32, 34, 112, 66, mix(D.teal[0], D.paper, 0.4), mix(D.teal[1], D.paper, 0.5), 4);
        for (const [mx, my, rx, ry] of [[56, 58, 16, 12], [98, 52, 22, 14], [118, 80, 10, 9], [62, 84, 8, 7]]) ell(g, mx, my, rx, ry, mix(D.moss[1], D.paper, 0.35));
        // wall clock (ticks only), slowly moving
        clock(g, 196, 66, 15, (t / 60) * TAU + 1.0, 2.0 + t / 720 * TAU, { rim: D.n4, rimD: D.n3, face: D.cream });
      });
      // ---- the weekly calendar (mid layer, centre) ----
      PX.par(g, c, 0.6, () => {
        const cx0 = 262, cy0 = 34, cw = 136, ch = 92;
        const week = (col, marked, x, y) => calendar(g, x, y, cw, ch, 7, 1, { col, head: 26,
          picture: (px, py, pw2, ph2) => { for (let k = 0; k < 5; k++) R(g, px + 6 + k * 24, py + ph2 - 6 - (k % 2) * 3, 16, 2, lt(col[1], 0.35)); },
          cell: (i, x2, y2, w2, h2) => {
            if (!marked) { if (i < 5) { cross(g, x2 + 2, y2 + 6, w2 - 4, w2 - 4, 1, mix(D.ink, D.paper, 0.35)); } }
            else if (i === 3) {
              const rp2 = PX.p(t, tF + 0.75, 0.6, "out");
              PX.text(g, "QUIZ", x2 + w2 / 2, y2 + 22, { font: "v", size: 12, col: mix(D.rust[1], D.ink, 0.25), align: "center" });
              ring(g, x2 + w2 / 2, y2 + 28, w2 / 2 + 5, 14, rp2, D.rust[1]); ring(g, x2 + w2 / 2 + 1, y2 + 28, w2 / 2 + 5, 14, rp2, D.rust[1]);
            }
          } });
        A(g, 0.4, () => R(g, cx0 + 3, cy0 + 3, cw, ch, SHD(1)));
        week(D.moss, true, cx0, cy0);       // next week (underneath)
        if (fp < 1) {
          // the current week's page lifting up from the bottom and over the rings
          const yb = cy0 + ch - Math.round(fp * ch * 1.3), lift = Math.round(Math.sin(fp * Math.PI) * 10);
          clip(g, cx0 - 20, -20, cw + 40, Math.max(0, yb - (-20)), () => week(D.steel, false, cx0, cy0));
          if (fp > 0) { const ye = Math.max(cy0 - 18, yb); poly(g, [[cx0 - lift, ye], [cx0 + cw + lift, ye], [cx0 + cw, ye + 4 + lift * 0.6], [cx0, ye + 4 + lift * 0.6]], fp < 0.5 ? D.paperD : D.paper); }
        }
        R(g, cx0 + cw / 2 - 1, cy0 - 8, 2, 6, D.n5); PX.circle(g, cx0 + cw / 2, cy0 - 9, 2, D.n6);   // nail
      });
      // ---- floor + desks ----
      PX.par(g, c, 0.8, () => { R(g, -40, 296, 720, 80, mix(WOOD[3], D.n2, 0.35)); for (let k = 0; k < 5; k++) R(g, -40, 300 + k * 13, 720, 1, mix(WOOD[3], D.n0, 0.3)); });
      const TY = 270;
      const desk = (x0, w) => {
        A(g, 0.4, () => ell(g, x0 + w / 2, 352, w / 2 + 6, 5, SHD(1)));
        for (const lx of [x0 + 10, x0 + w - 14]) { R(g, lx, TY + 18, 4, 70, D.n4); R(g, lx, TY + 18, 1, 70, D.n6); }
        R(g, x0 + 6, TY + 38, w - 12, 3, D.n4);
        poly(g, [[x0 + 8, TY], [x0 + w - 8, TY], [x0 + w, TY + 16], [x0, TY + 16]], OAK[1]); R(g, x0 + 8, TY, w - 16, 1, OAK[0]); R(g, x0, TY + 16, w, 4, OAK[2]); R(g, x0, TY + 20, w, 1, dk(OAK[2], 0.4));
      };
      // ---- the two students ----
      const S = 2.05, LXc = 196, RXc = 446;
      const sheet = (x, y, w, h, lines, prog, faceUp) => {
        A(g, 0.4, () => R(g, x + 3, y + 3, w, h, SHD(1)));
        if (!faceUp) { R(g, x, y, w, h, D.paper); R(g, x, y, w, 1, D.cream); A(g, 0.25, () => { for (let k = 0; k < 4; k++) R(g, x + 6, y + 4 + k * 3, w - 12, 1, D.paperD); }); return [x + 8, y + 6]; }
        R(g, x, y, w, h, D.cream); R(g, x, y, w, 1, lt(D.cream, 0.5)); R(g, x, y + h - 1, w, 1, D.paper);
        R(g, x + 4, y + 2, w * 0.4, 2, mix(D.ink, D.cream, 0.4));
        let pen = [x + 6, y + 7];
        for (let k = 0; k < 3; k++) { R(g, x + 4, y + 7 + k * 5 - 1, 2, 2, mix(D.ink, D.cream, 0.5)); R(g, x + 8, y + 7 + k * 5 + 2, w - 14, 1, mix(D.steel[0], D.cream, 0.6)); }
        if (lines > 0) for (let k = 0; k < 3; k++) { const p = clamp(lines * prog - k, 0, 1); if (p <= 0) break; pen = scrawl(g, x + 9, y + 7 + k * 5, w - 18, D.ink, 40 + k * 5, p); }
        return pen;
      };
      // left desk + learner
      desk(LXc - 66, 132);
      const faceUp = turn > 0.5;
      const lp = sheet(LXc - 32, TY + 1, 64, 18, 0, 0, faceUp);
      const hover = rk > 0 ? [LXc + 10 + Math.round(Math.sin(t * 1.3) * 3), TY + 2 - Math.round(rk * 6) + Math.round(Math.sin(t * 2.7) * 1.5)] : [LXc + 12, TY + 6];
      fig(g, LXc, TY + 3, t, {
        ...LEARNER, s: S, seed: 0.3, dip: Math.round(lerp(3, 1, rk)), face: 0,
        eyes: rk > 0.5 ? (frac(t / 2.2) < 0.5 ? "blank" : "wide") : "down", look: [0, 0.6], brow: rk > 0.3 ? "worry" : "calm",
        mouth: rk > 0.5 ? (frac(t / 2.6) < 0.6 ? "flat" : "o") : "flat", sweat: rk > 0.6 ? 0.9 : 0,
        hl: turn > 0 && turn < 1 ? [LXc - 24 + turn * 10, TY + 4 - Math.sin(turn * Math.PI) * 10] : [LXc - 26, TY + 12], hr: hover,
        itemR: (g2, hx, hy) => pencil(g2, hx - 2, hy + 3, 0.5, -0.86),
      });
      // right desk + tester
      desk(RXc - 66, 132);
      const prog = rk > 0 ? clamp((t - tRs) / 3.2, 0, 1) : 0;
      const pen = faceUp ? sheet(RXc - 32, TY + 1, 64, 18, 3, prog, true) : sheet(RXc - 32, TY + 1, 64, 18, 0, 0, false);
      const wr = rk > 0 && prog < 1;
      fig(g, RXc, TY + 3, t, {
        ...TESTER, s: S, seed: 1.1, dip: 4, face: 0, eyes: "down", look: [0.1, 0.6], brow: rk > 0.3 ? "calm" : "calm",
        mouth: rk > 0.5 ? "smile" : "flat", nod: wr ? Math.round(Math.sin(t * 4) * 0.6) : 0,
        hl: turn > 0 && turn < 1 ? [RXc - 24 + turn * 10, TY + 4 - Math.sin(turn * Math.PI) * 10] : [RXc - 26, TY + 12],
        hr: rk > 0 ? [pen[0] + 1, pen[1] + (wr && frac(t * 7) < 0.5 ? 1 : 0)] : [RXc + 12, TY + 6],
        itemR: (g2, hx, hy) => pencil(g2, hx - 2, hy + 2, 0.5, -0.86),
      });
      // ---- the result light: cool dim on the left, warm window light on the right ----
      if (rk > 0) {
        for (let x = -40; x < 340; x += 4) { const k = clamp((340 - x) / 260, 0, 1); A(g, 0.52 * rk * k, () => R(g, x, -40, 4, 440, mix(D.n0, D.steel[2], 0.3))); }
        A(g, 0.12 * rk, () => poly(g, [[470, 40], [620, 40], [560, 300], [360, 300]], D.lamp));
        PX.glow(g, RXc, 240, 120, D.lamp, 0.1 * rk);
        clipP(g, [[470, 40], [620, 40], [560, 300], [360, 300]], () => dust(g, t, [360, 40, 260, 260], 21, 36, 0.5 * rk, D.cream));
      }
      // foreground: the back of an empty chair, bottom centre (out of focus)
      PX.par(g, c, 1.2, () => { R(g, 268, 334, 110, 10, mix(WOOD[3], D.n0, 0.4)); R(g, 268, 334, 110, 1, mix(WOOD[1], D.n1, 0.5)); R(g, 280, 344, 6, 30, D.n0); R(g, 360, 344, 6, 30, D.n0); });
      PX.vignette(g, 0.5);
    };
  };
  // ======================= ebbinghaus =======================
  // an 1880s study at night lit by one oil lamp: a bearded man in a waistcoat at a leather-topped desk; a metronome
  // ticks, an open pocket watch runs, stacks of small cards with nonsense syllables. o.cards (0.5): he lifts one card
  // after another and reads it aloud in time with the metronome; o.test (5.0): the stack goes face down, he looks up
  // to recall and writes the syllables in his ledger, checking each (ticks, one miss).
  const SYL = ["DAX", "BUP", "ZOL", "KEB", "VUM", "TOJ", "MEP", "GUX", "WOZ", "YIB", "SEJ", "RUV"];
  K.ebbinghaus = (o) => {
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const tC = tm(o, "cards", 0.5, d, 10.0), tT = tm(o, "test", 5.0, d, 10.0);
      const BEAT = 0.6, CARD = 2 * BEAT;                         // one card every two ticks
      const ci = Math.max(0, Math.floor((Math.min(t, tT) - tC) / CARD)), cu = frac((t - tC) / CARD);
      const reading = t >= tC && t < tT && ci < 10, testing = t >= tT;
      const fl = 0.92 + 0.05 * Math.sin(t * 7.3) + 0.03 * Math.sin(t * 17.1);   // lamp flicker
      R(g, 0, 0, 640, 360, D.n0);
      // ---- far: panelled wall, wallpaper, bookcase, window with a moonlit street ----
      PX.par(g, c, 0.4, () => {
        const wp = mix(D.moss[2], D.n1, 0.62);
        PX.vgrad(g, -40, -40, 720, 300, mix(wp, D.n0, 0.3), mix(wp, D.n0, 0.55), 7);
        for (let y = -30; y < 190; y += 14) for (let x = -40 + ((y / 14) % 2) * 9; x < 680; x += 18) { R(g, x, y, 2, 2, mix(wp, D.lampD, 0.12)); R(g, x - 2, y + 2, 1, 1, mix(wp, D.lampD, 0.08)); R(g, x + 3, y + 2, 1, 1, mix(wp, D.lampD, 0.08)); }
        R(g, -40, 190, 720, 6, WOOD[3]); R(g, -40, 190, 720, 1, mix(WOOD[1], D.n1, 0.4));
        R(g, -40, 196, 720, 110, mix(WOOD[3], D.n0, 0.3));
        for (let x = -30; x < 680; x += 64) { PX.box(g, x, 206, 54, 70, mix(WOOD[3], D.n0, 0.55)); R(g, x + 1, 207, 52, 1, mix(WOOD[2], D.n1, 0.5)); }
        // bookcase left (leather volumes)
        bookcase(g, -20, 16, 170, 250, 51, 0.5, 40);
        // window right: moon, rooftops, one gas lamp
        const wx = 452, wy = 30, ww = 128, wh = 150;
        R(g, wx - 10, wy - 10, ww + 20, wh + 20, WOOD[3]); R(g, wx - 10, wy - 10, ww + 20, 2, mix(WOOD[2], D.n1, 0.3));
        PX.vgrad(g, wx, wy, ww, wh, mix(D.steel[2], D.n0, 0.55), mix(D.steel[2], D.n1, 0.25), 6);
        for (let i = 0; i < 16; i++) A(g, 0.4 + 0.5 * hash(i, 9), () => R(g, wx + hash(i, 7) * ww, wy + hash(i, 8) * wh * 0.5, 1, 1, D.cream));
        PX.circle(g, wx + 92, wy + 34, 9, mix(D.cream, D.steel[0], 0.25)); PX.circle(g, wx + 95, wy + 31, 8, mix(D.steel[2], D.n0, 0.5)); PX.glow(g, wx + 92, wy + 34, 36, D.steel[0], 0.12);
        clip(g, wx, wy, ww, wh, () => {
          poly(g, [[wx - 4, wy + wh], [wx - 4, wy + 104], [wx + 30, wy + 86], [wx + 64, wy + 104], [wx + 64, wy + 96], [wx + 92, wy + 80], [wx + 132, wy + 100], [wx + 132, wy + wh]], mix(D.n0, D.steel[2], 0.25));
          R(g, wx + 40, wy + 76, 6, 14, mix(D.n0, D.steel[2], 0.25)); R(g, wx + 104, wy + 70, 5, 14, mix(D.n0, D.steel[2], 0.25));
          for (const [xx, yy] of [[wx + 14, wy + 112], [wx + 80, wy + 108], [wx + 110, wy + 118]]) A(g, 0.7, () => R(g, xx, yy, 3, 4, D.lampD));
          R(g, wx + 58, wy + 118, 2, 32, D.n0); R(g, wx + 55, wy + 112, 8, 6, D.n1); PX.glow(g, wx + 59, wy + 115, 18, D.lamp, 0.4);
        });
        R(g, wx + ww / 2 - 2, wy, 4, wh, WOOD[3]); for (let k = 1; k < 4; k++) R(g, wx, wy + k * wh / 4, ww, 2, WOOD[3]);
        // heavy curtains
        for (const [cx0, dir] of [[wx - 30, 1], [wx + ww + 4, -1]]) for (let k = 0; k < 4; k++) R(g, cx0 + k * 7, wy - 18, 7, wh + 60, k % 2 ? mix(D.rust[2], D.n0, 0.62) : mix(D.rust[2], D.n0, 0.5));
        R(g, wx - 36, wy - 22, ww + 72, 4, mix(D.amber[2], D.n1, 0.4));
        // a framed engraving between bookcase and window
        R(g, 250, 52, 70, 54, mix(D.amber[2], D.n1, 0.45)); R(g, 254, 56, 62, 46, mix(D.paper, D.n2, 0.55)); poly(g, [[254, 102], [276, 76], [292, 90], [316, 70], [316, 102]], mix(D.paperD, D.n2, 0.6));
        // floor
        R(g, -40, 290, 720, 90, mix(WOOD[3], D.n0, 0.45));
      });
      // ---- the oil lamp light: warm pool, everything else falls to dark ----
      const LX = 470, LY = 196;
      PX.glow(g, LX, LY + 10, 260, D.lampD, 0.22 * fl); PX.glow(g, LX, LY + 10, 120, D.lamp, 0.22 * fl);
      // ---- desk: dark wood with a green leather inlay ----
      const TY = 258;
      poly(g, [[-40, TY], [680, TY], [680, 370], [-40, 370]], WOOD[2]); R(g, -40, TY, 720, 3, mix(WOOD[0], D.n1, 0.3));
      poly(g, [[40, TY + 8], [600, TY + 8], [640, 360], [0, 360]], mix(D.moss[2], D.n1, 0.35)); R(g, 40, TY + 8, 560, 1, mix(D.amber[2], D.moss[2], 0.4));
      A(g, 0.22 * fl, () => ell(g, LX - 30, TY + 40, 220, 50, D.lamp));
      // metronome (left): wooden pyramid, pendulum swinging, tick flash
      const MX = 132, MY = TY + 28, ang = Math.sin((t / BEAT) * Math.PI) * 0.42, onTick = Math.abs(Math.cos((t / BEAT) * Math.PI)) > 0.97;
      A(g, 0.45, () => ell(g, MX, MY + 2, 26, 4, SHD(1)));
      poly(g, [[MX - 22, MY], [MX + 22, MY], [MX + 9, MY - 66], [MX - 9, MY - 66]], WOOD[1]); poly(g, [[MX + 6, MY], [MX + 22, MY], [MX + 9, MY - 66], [MX + 4, MY - 66]], WOOD[2]); PX.line(g, MX - 22, MY, MX - 9, MY - 66, WOOD[0]);
      poly(g, [[MX - 12, MY - 6], [MX + 12, MY - 6], [MX + 6, MY - 56], [MX - 6, MY - 56]], mix(D.paper, D.n2, 0.35));
      for (let k = 0; k < 6; k++) R(g, MX - 3, MY - 50 + k * 7, 6, 1, mix(D.ink, D.paper, 0.4));
      const pvx = MX, pvy = MY - 10, tipx = pvx + Math.sin(ang) * 58, tipy = pvy - Math.cos(ang) * 58;
      limb(g, pvx, pvy, tipx, tipy, 2, D.n6); PX.line(g, pvx, pvy, tipx, tipy, D.n7);
      const wx2 = pvx + Math.sin(ang) * 36, wy2 = pvy - Math.cos(ang) * 36; R(g, wx2 - 3, wy2 - 2, 7, 5, D.amber[2]); R(g, wx2 - 3, wy2 - 2, 7, 1, D.amber[0]);
      R(g, MX - 24, MY - 2, 48, 4, WOOD[3]); R(g, MX - 24, MY - 2, 48, 1, WOOD[1]);
      if (onTick && t > 0) PX.glow(g, tipx, tipy, 8, D.cream, 0.25);
      // pocket watch (front left), lid open, second hand ticking
      const PWx = 452, PWy = TY + 72;
      A(g, 0.45, () => ell(g, PWx + 3, PWy + 4, 16, 6, SHD(1)));
      ell(g, PWx - 26, PWy - 4, 14, 9, D.amber[2]); ell(g, PWx - 26, PWy - 5, 12, 7, mix(D.amber[1], D.amber[2], 0.4));
      PX.line(g, PWx - 13, PWy - 2, PWx - 10, PWy - 2, D.amber[2]);
      clock(g, PWx, PWy, 11, Math.floor(t) / 60 * TAU + 2, 1.2, { rim: D.amber[1], rimD: D.amber[2], face: D.cream, tick: D.n5 });
      R(g, PWx - 1, PWy - 15, 3, 3, D.amber[1]); for (let k = 0; k < 9; k++) R(g, PWx + 12 + k * 4, PWy - 12 + Math.round(Math.sin(k * 0.8) * 2), 2, 1, D.amber[2]);
      // ink pot + quill (right of the ledger)
      R(g, 540, TY + 30, 18, 14, mix(D.n1, D.steel[2], 0.3)); R(g, 540, TY + 30, 18, 2, D.n4); R(g, 544, TY + 26, 10, 4, D.n3);
      limb(g, 548, TY + 28, 572, TY - 18, 2, D.cream); for (let k = 0; k < 8; k++) PX.line(g, 562 + k * 1.2, TY - 2 - k * 2, 568 + k * 1.4, TY - 6 - k * 2, D.paper);
      // the oil lamp itself (brass base, glass chimney, flame)
      A(g, 0.45, () => ell(g, LX, TY + 12, 26, 4, SHD(1)));
      ell(g, LX, TY + 8, 18, 4, D.amber[2]); R(g, LX - 4, TY - 18, 8, 26, D.amber[2]); R(g, LX - 4, TY - 18, 2, 26, D.amber[0]);
      ell(g, LX, TY - 26, 16, 10, mix(D.teal[2], D.amber[2], 0.4)); ell(g, LX - 4, TY - 29, 6, 4, mix(D.teal[1], D.amber[0], 0.4));
      R(g, LX - 8, TY - 40, 16, 4, D.amber[1]);
      A(g, 0.45, () => { R(g, LX - 7, LY - 34, 14, 40, D.glass); }); R(g, LX - 7, LY - 34, 1, 40, D.cream); R(g, LX + 6, LY - 34, 1, 40, mix(D.glass, D.n3, 0.4));
      const fh = 12 + Math.round(Math.sin(t * 9) * 1.2); ell(g, LX, LY - 6 - fh / 2 + 6, 3, fh / 2, D.lamp); ell(g, LX, LY - 4, 2, 3, D.cream);
      PX.glow(g, LX, LY - 8, 40, D.lamp, 0.55 * fl);
      // card stacks (right): to-read stack, read pile
      const card = (x, y, w, h, word, faceDown) => {
        A(g, 0.4, () => R(g, x + 2, y + 2, w, h, SHD(1)));
        R(g, x, y, w, h, faceDown ? mix(D.paperD, D.amber[2], 0.25) : D.cream); R(g, x, y, w, 1, faceDown ? mix(D.paper, D.amber[2], 0.15) : lt(D.cream, 0.5)); R(g, x, y + h - 1, w, 1, D.paperD);
        if (word && !faceDown) PX.text(g, word, x + w / 2, y + Math.round(h / 2 - 6), { font: "v", size: Math.max(12, Math.round(h * 0.75)), col: D.ink, align: "center" });
        if (faceDown) for (let k = 0; k < 3; k++) R(g, x + 3, y + 3 + k * 3, w - 6, 1, mix(D.paperD, D.amber[2], 0.4));
      };
      const SX = 222, SY = TY + 26, SW = 30, SH2 = 18;
      const lifted = reading && PX.p(cu, 0, 0.25, "io") > 0.6, left = testing ? Math.max(0, 10 - Math.max(0, Math.floor((tT - tC) / CARD))) : Math.max(0, 10 - ci - (lifted ? 1 : 0));
      for (let k = 0; k < Math.min(left, 10); k++) card(SX + (k % 2), SY - k * 2, SW, SH2, null, true);
      if (left > 0 && !testing) card(SX + 1, SY - Math.min(left, 10) * 2 + 2, SW, SH2, SYL[(ci + (lifted ? 1 : 0)) % SYL.length], false);
      const readN = testing ? Math.min(10, Math.max(0, Math.floor((tT - tC) / CARD))) : Math.min(10, t >= tC ? ci : 0);
      for (let k = 0; k < readN; k++) card(170 - (k % 3), SY + 10 - k * 2, SW, SH2, testing ? null : SYL[(k) % SYL.length], testing);
      // ledger (open book) in front of him
      const LGx = 282, LGy = TY + 30, LGw = 136, LGh = 54;
      A(g, 0.45, () => R(g, LGx + 4, LGy + 4, LGw, LGh, SHD(1)));
      R(g, LGx - 3, LGy - 2, LGw + 6, LGh + 5, mix(D.rust[2], D.n1, 0.45));
      R(g, LGx, LGy, LGw, LGh, D.paper); R(g, LGx + LGw / 2 - 1, LGy, 2, LGh, D.paperD); R(g, LGx, LGy, LGw, 1, D.cream);
      for (let k = 0; k < 6; k++) { R(g, LGx + 4, LGy + 8 + k * 8, LGw / 2 - 8, 1, mix(D.steel[0], D.paper, 0.6)); R(g, LGx + LGw / 2 + 4, LGy + 8 + k * 8, LGw / 2 - 8, 1, mix(D.steel[0], D.paper, 0.6)); }
      // left page: earlier sessions (scribbled rows); right page: today's test, written one syllable at a time
      for (let k = 0; k < 6; k++) scrawl(g, LGx + 6, LGy + 6 + k * 8, LGw / 2 - 16, mix(D.ink, D.paper, 0.3), 60 + k, 1);
      const WT = 0.85, rawW = testing ? Math.floor((t - tT - 0.6) / WT) + 1 : 0, nW = clamp(rawW, 0, 6), wp = testing ? (rawW > 6 ? 1 : frac((t - tT - 0.6) / WT)) : 0;
      let penP = [LGx + LGw / 2 + 8, LGy + 6];
      for (let k = 0; k < nW; k++) {
        const done = k < nW - 1 || wp > 0.6, wx3 = LGx + LGw / 2 + 8, wy3 = LGy + 1 + k * 8;
        const str = SYL[k % SYL.length], shown = k < nW - 1 ? str : str.slice(0, clamp(Math.floor(wp * 5), 0, 3));
        PX.text(g, shown, wx3, wy3, { font: "v", size: 12, col: mix(D.ink, D.plum[2], 0.2) });
        if (k === nW - 1) penP = [wx3 + PX.tw(g, shown, { font: "v", size: 12 }) + 1, wy3 + 8];
        if (done && (k < nW - 1 || wp > 0.75)) { const mx = LGx + LGw - 14, my = wy3 + 4;
          if (k === 4) { PX.line(g, mx, my - 2, mx + 4, my + 2, D.rust[1]); PX.line(g, mx + 4, my - 2, mx, my + 2, D.rust[1]); }
          else { PX.line(g, mx, my, mx + 1, my + 2, D.moss[2]); PX.line(g, mx + 1, my + 2, mx + 5, my - 3, D.moss[2]); } }
      }
      // ---- the man ----
      const SHIRT = [mix(D.cream, D.paper, 0.35), mix(D.paper, D.paperD, 0.25), mix(D.paperD, D.n3, 0.3)], VEST = [mix(D.plum[2], D.rust[2], 0.4), mix(D.plum[2], D.n1, 0.35), mix(D.plum[2], D.n0, 0.6)];
      const cx = 318;
      let hl, hr, eyes = "down", look = [0, 0.5], mouth = "flat", brow = "calm", face = 0.15, nod = 0, item = null, itemL = null, dip = 4;
      const syllable = SYL[ci % SYL.length];
      if (reading) {
        // lift the next card from the stack, hold it up, read, drop it on the pile
        const up = PX.p(cu, 0, 0.25, "io"), down = PX.p(cu, 0.78, 0.22, "io");
        const sx0 = SX + 15, sy0 = SY - left * 2, hx = cx - 50, hy = 204;
        hl = up < 1 ? [lerp(sx0, hx, up), lerp(sy0, hy, up)] : down > 0 ? [lerp(hx, 185, down), lerp(hy, SY + 8, down)] : [hx, hy + Math.round(Math.sin(t * 2) * 1)];
        hr = [cx + 34, TY + 34];
        eyes = "open"; look = [-0.8, 0.2]; mouth = up >= 1 && down <= 0 ? "talk" : "flat"; brow = "raise"; face = -0.35; dip = 0;
        if (up > 0.6 && down < 0.4) itemL = (g2, x, y) => card(x - 18, y - 22, SW + 4, SH2 + 4, syllable, false);
      } else if (testing) {
        const k = PX.p(t, tT, 0.5, "io"), recallUp = wp < 0.45 || nW === 0;
        hl = [lerp(cx - 30, SX + 16, k), lerp(TY + 30, SY - Math.min(left, 10) * 2 + 6, k)];   // hand resting on the face-down stack
        hr = nW > 0 ? [penP[0], penP[1] + (frac(t * 6) < 0.5 ? 0 : 1)] : [LGx + LGw - 30, LGy + 20];
        eyes = recallUp ? "up" : "down"; look = recallUp ? [-0.4, -1] : [0.2, 0.6]; mouth = recallUp ? "talk" : "flat"; brow = recallUp ? "knit" : "calm"; face = recallUp ? -0.1 : 0.1; nod = recallUp ? -1 : 0;
        item = (g2, x, y) => { limb(g2, x, y, x + 10, y - 16, 2, D.cream); for (let q = 0; q < 4; q++) PX.line(g2, x + 6 + q, y - 8 - q * 2, x + 9 + q, y - 10 - q * 2, D.paper); PX.line(g2, x, y, x + 2, y - 3, D.ink); };
      } else { hl = [cx - 30, TY + 30]; hr = [cx + 30, TY + 34]; eyes = "down"; }
      const P = fig(g, cx, TY + 3, t, {
        skin: SKIN.light, hair: HAIR.brown, hs: "beard", top: SHIRT, waist: VEST, s: 2.3, seed: 2.2,
        lean: 0, dip, face, nod, eyes, look, mouth, brow, glasses: true, hl, hr, itemR: item, itemL,
      });
      // rim light on him from the lamp (right), deep shadow left
      PX.glow(g, P.hx + 30, P.hy + 20, 60, D.lamp, 0.12 * fl);
      for (let x = -40; x < 170; x += 4) A(g, 0.42 * clamp((170 - x) / 210, 0, 1), () => R(g, x, -40, 4, 440, D.n0));
      // foreground: the chair arm, bottom right, dark
      PX.par(g, c, 1.2, () => { poly(g, [[560, 360], [586, 312], [660, 306], [660, 360]], mix(D.n0, WOOD[3], 0.5)); PX.line(g, 586, 312, 660, 306, mix(WOOD[2], D.n1, 0.4)); });
      PX.particles(g, 17, 18, t, [380, 120, 180, 140], { vy: -1.2, vx: 0.6, col: D.lamp, a: 0.3 });
      PX.vignette(g, 0.62);
    };
  };
  // ======================= cram =======================
  // split frame, same student both sides. Left "CRAM": one long night at a desk, the wall clock racing, energy-drink cans
  // piling up, the window going from night to dawn, the student sinking from propped-up to nodding off. Right "SPACED":
  // a bright room, a week calendar on the wall; at each of o.sessions (2.0, 4.0, 6.0; or [start, end], or three times)
  // the day changes, an hourglass flips for a short session and one more day gets a ring. The student stays fresh.
  const CRAMMER = { skin: SKIN.tan, hair: HAIR.brown, hs: "short", top: [mix(D.n6, D.steel[0], 0.25), mix(D.n5, D.steel[1], 0.2), mix(D.n4, D.steel[2], 0.3)] };
  const sessTimes = (o, d) => {
    const v = o.sessions, dd = d / 10;
    if (Array.isArray(v) && v.length >= 3) return v.slice(0, 3).map(Number);
    if (Array.isArray(v) && v.length === 2) return [+v[0], (+v[0] + +v[1]) / 2, +v[1]];
    if (typeof v === "number") return [v, v + 2 * dd, v + 4 * dd];
    return [2 * dd, 4 * dd, 6 * dd];
  };
  const can = (g, x, y, k, down) => { // energy drink can (generic): steel body, coloured band, no text
    const band = k % 3 === 1 ? mix(D.teal[1], D.n4, 0.2) : mix(D.moss[1], D.n4, 0.2);
    A(g, 0.4, () => R(g, x - 5, y, down ? 20 : 12, 2, SHD(1)));
    if (down) { R(g, x - 7, y - 9, 20, 9, D.n6); R(g, x - 7, y - 9, 20, 2, D.n7); R(g, x - 7, y - 2, 20, 2, D.n5); R(g, x - 1, y - 9, 7, 9, band); R(g, x + 13, y - 8, 1, 7, D.n4); return; }
    R(g, x - 5, y - 20, 11, 20, k % 2 ? D.n6 : mix(D.n6, D.steel[1], 0.3)); R(g, x - 5, y - 20, 2, 20, D.n7); R(g, x + 3, y - 20, 3, 20, D.n5);
    R(g, x - 5, y - 14, 11, 7, band); R(g, x - 5, y - 14, 11, 1, lt(band, 0.3)); R(g, x - 4, y - 21, 9, 1, D.n7); R(g, x - 1, y - 22, 3, 1, D.n5);
  };
  const hourglass = (g, x, y, p, flipU) => { // p = sand run 0..1, flipU 0..1 rotation (drawn as a squash)
    const sq = Math.abs(Math.cos(flipU * Math.PI)), h = Math.max(2, Math.round(26 * sq));
    R(g, x - 9, y - h - 3, 18, 3, WOOD[1]); R(g, x - 9, y - 3, 18, 3, WOOD[1]); R(g, x - 9, y - h - 3, 18, 1, WOOD[0]);
    R(g, x - 8, y - h, 1, h - 3, WOOD[2]); R(g, x + 7, y - h, 1, h - 3, WOOD[2]);
    if (h < 8) return;
    const top = y - h, mid = y - 3 - Math.round((h - 3) / 2);
    A(g, 0.5, () => { poly(g, [[x - 6, top], [x + 6, top], [x + 1, mid], [x - 1, mid]], D.glass); poly(g, [[x - 1, mid], [x + 1, mid], [x + 6, y - 3], [x - 6, y - 3]], D.glass); });
    const s1 = Math.round((mid - top - 2) * (1 - p)), s2 = Math.round((y - 3 - mid - 2) * p);
    if (s1 > 0) poly(g, [[x - 5 + Math.round((1 - s1 / (mid - top)) * 4), mid - s1], [x + 5 - Math.round((1 - s1 / (mid - top)) * 4), mid - s1], [x + 1, mid], [x - 1, mid]], D.paper);
    if (s2 > 0) poly(g, [[x - 5, y - 3], [x + 5, y - 3], [x + 1, y - 3 - s2], [x - 1, y - 3 - s2]], D.paper);
    if (p > 0 && p < 1) R(g, x, mid, 1, y - 3 - mid - s2, D.paper);
  };
  K.cram = (o) => {
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const S3 = sessTimes(o, d), np = clamp(t / d, 0, 1);
      const nS = S3.filter((s) => t >= s).length, last = nS ? S3[nS - 1] : -99, since = t - last;
      R(g, 0, 0, 640, 360, D.n0);
      // =============== LEFT: the long night ===============
      clip(g, 0, 0, 318, 360, () => {
        const wall = mix(D.n2, D.steel[2], 0.3);
        PX.par(g, c, 0.45, () => {
          PX.vgrad(g, -40, -40, 400, 320, mix(wall, D.n1, 0.2), dk(wall, 0.5), 7);
          // window: night -> dawn
          const wx = 26, wy = 44, ww = 96, wh = 110, dawn = PX.smooth((np - 0.62) / 0.38);
          PX.vgrad(g, wx, wy, ww, wh, mix(mix(D.n0, D.steel[2], 0.3), mix(D.steel[1], D.cream, 0.2), dawn), mix(mix(D.n1, D.steel[2], 0.3), mix(D.rose[0], D.lamp, 0.4), dawn), 6);
          for (let i = 0; i < 10; i++) A(g, (0.4 + 0.5 * hash(i, 3)) * (1 - dawn), () => R(g, wx + hash(i, 1) * ww, wy + hash(i, 2) * wh * 0.5, 1, 1, D.cream));
          poly(g, [[wx, wy + wh], [wx, wy + 86], [wx + 22, wy + 80], [wx + 40, wy + 92], [wx + 64, wy + 78], [wx + 96, wy + 88], [wx + 96, wy + wh]], mix(D.n0, D.steel[2], 0.2 + 0.2 * dawn));
          R(g, wx + ww / 2 - 1, wy, 3, wh, D.n2); R(g, wx, wy + wh / 2, ww, 2, D.n2); PX.box(g, wx - 3, wy - 3, ww + 6, wh + 6, D.n3);
          // wall clock racing through the night (ticks only)
          const hrs = lerp(10.5, 18.0, np), mins = (t * 1.25) % 1;
          clock(g, 214, 70, 20, mins * TAU, (hrs / 12) * TAU, { rim: D.n5, rimD: D.n4, face: mix(D.paper, D.n4, 0.25) });
          for (let k = 0; k < 4; k++) A(g, 0.15 * (1 - k / 4), () => { const a = mins * TAU - (k + 1) * 0.35; PX.line(g, 214, 70, 214 + Math.sin(a) * 15, 70 - Math.cos(a) * 15, D.n6); });
          // poster + shelf
          R(g, 150, 108, 38, 50, mix(D.rust[2], D.n2, 0.4)); R(g, 154, 112, 30, 26, mix(D.plum[2], D.n2, 0.3)); R(g, 154, 142, 30, 2, mix(D.paper, D.n3, 0.4));
          R(g, 228, 132, 90, 4, WOOD[2]); books(g, 234, 300, 132, 22, 91, 0.4);
        });
        // desk
        const TY = 262;
        R(g, -40, TY, 400, 110, mix(WOOD[2], D.n1, 0.3)); R(g, -40, TY, 400, 3, mix(WOOD[0], D.n2, 0.4));
        // lamp (harsh little desk lamp, right)
        const LX = 268;
        R(g, LX - 12, TY + 6, 24, 4, D.n4); limb(g, LX, TY + 6, LX - 6, 214, 3, D.n4); limb(g, LX - 6, 214, LX - 34, 206, 3, D.n4);
        poly(g, [[LX - 46, 200], [LX - 26, 204], [LX - 30, 222], [LX - 52, 218]], D.n5); R(g, LX - 50, 218, 20, 2, D.lamp);
        PX.glow(g, LX - 40, 226, 130, D.lamp, 0.34);
        A(g, 0.18, () => poly(g, [[LX - 52, 219], [LX - 30, 222], [LX + 20, 330], [LX - 170, 330]], D.lamp));
        // cans piling up (some lying down)
        const nC = clamp(1 + Math.floor(np * 9), 1, 9);
        const CAN = [[222, TY + 26, 0], [238, TY + 30, 0], [214, TY + 44, 1], [254, TY + 36, 0], [232, TY + 52, 0], [204, TY + 30, 0], [262, TY + 56, 1], [216, TY + 68, 0], [246, TY + 72, 0]];
        for (let k = 0; k < nC; k++) can(g, CAN[k][0], CAN[k][1], k, CAN[k][2]);
        // papers scattered, a textbook
        for (let k = 0; k < 4; k++) { const px = 84 + k * 12, py = TY + 56 + (k % 2) * 8; poly(g, [[px, py], [px + 30, py - 3], [px + 33, py + 18], [px + 3, py + 21]], k % 2 ? D.paper : mix(D.paper, D.paperD, 0.4)); }
        const BX = 108, BY = TY + 14;
        R(g, BX - 2, BY - 1, 92, 40, mix(D.steel[2], D.n1, 0.2)); R(g, BX, BY, 88, 36, D.paper); R(g, BX + 43, BY, 2, 36, D.paperD);
        for (let k = 0; k < 4; k++) for (const sd of [0, 1]) scrawl(g, BX + 4 + sd * 46, BY + 6 + k * 7, 36, mix(D.ink, D.paper, 0.3), k + sd * 5, 1);
        // the crammer: propped up -> sinking -> nodding off
        const sink = np, nodOff = PX.smooth((np - 0.7) / 0.25), yawnOn = frac(t / 3.1) > 0.82 && np < 0.75;
        const cx = 156, dipL = Math.round(4 + sink * 10 + nodOff * 6 + Math.sin(t * 1.3) * nodOff * 3), head = fig(g, cx, TY + 3, t, {
          ...CRAMMER, s: 1.95, seed: 0.8, dip: dipL, lean: Math.round(sink * -4), face: -0.15, elbowIn: nodOff < 0.6,
          eyes: nodOff > 0.5 ? (frac(t / 1.7) < 0.7 ? "shut" : "half") : sink > 0.35 ? "half" : "down", brow: sink > 0.3 ? "worry" : "calm",
          mouth: yawnOn ? "yawn" : sink > 0.5 ? "frown" : "flat", bags: clamp(0.3 + sink, 0, 1), look: [0, 0.6],
          hl: nodOff < 0.6 ? [cx - 21 + Math.round(sink * -3), TY - 47 + dipL] : [cx - 34, TY + 10], hr: [BX + 66, BY + 20],
        });
        // the propping hand: drawn over the cheek while not nodded off
        PX.particles(g, 4, 10, t, [160, 190, 120, 70], { vy: -1, vx: 0.5, col: D.lamp, a: 0.25 });
        // foreground: a hoodie slung over a chair back, bottom left (dark, out of focus)
        PX.par(g, c, 1.2, () => { R(g, 40, 318, 90, 8, mix(D.n0, WOOD[3], 0.5)); R(g, 40, 318, 90, 1, mix(D.n2, WOOD[2], 0.4)); poly(g, [[56, 316], [92, 316], [98, 370], [50, 370]], mix(D.n1, D.plum[2], 0.4)); PX.line(g, 74, 318, 72, 370, D.n0); });
        // cool night tint on the whole panel
        A(g, 0.12 * (1 - PX.smooth((np - 0.7) / 0.3) * 0.6), () => R(g, 0, 0, 320, 360, mix(D.n0, D.steel[2], 0.35)));
        PX.vignette(g, 0.4);
      });
      // =============== RIGHT: three short sessions ===============
      clip(g, 322, 0, 318, 360, () => {
        g.save(); g.translate(322, 0);
        const day = nS, dk2 = PX.p(since, 0, 0.5, "io");
        const sunX = [210, 140, 250, 170][Math.min(day, 3)], prevX = [210, 210, 140, 250][Math.min(day, 3)];
        const wall = mix(D.paper, D.paperD, 0.55);
        PX.par(g, c, 0.45, () => {
          PX.vgrad(g, -40, -40, 400, 320, lt(wall, 0.1), mix(wall, D.n4, 0.35), 7);
          // window (right) with daylight, leaves
          const wx = 222, wy = 40, ww = 80, wh = 120;
          R(g, wx - 6, wy - 6, ww + 12, wh + 12, mix(D.cream, D.paperD, 0.3));
          PX.vgrad(g, wx, wy, ww, wh, mix(D.steel[0], D.cream, 0.45), mix(D.lamp, D.cream, 0.4), 5);
          for (let i = 0; i < 7; i++) ell(g, wx + 10 + i * 11, wy + wh - 20 + (i % 2) * 6, 10, 12, mix(D.moss[1], D.cream, 0.3));
          R(g, wx + ww / 2 - 1, wy, 3, wh, mix(D.cream, D.paperD, 0.3)); R(g, wx, wy + wh / 2, ww, 2, mix(D.cream, D.paperD, 0.3));
          // sun patch on the wall moves with each new day
          const spx = lerp(prevX, sunX, dk2);
          A(g, 0.16, () => poly(g, [[spx - 40, 90], [spx + 10, 80], [spx + 30, 200], [spx - 30, 210]], D.lamp));
          // the week calendar (one row, seven days)
          calendar(g, 40, 66, 140, 66, 7, 1, { col: D.moss, head: 22,
            picture: (px, py, pw2, ph2) => { for (let k = 0; k < 4; k++) R(g, px + 8 + k * 34, py + ph2 - 5, 22, 2, lt(D.moss[1], 0.35)); },
            cell: (i, x2, y2, w2, h2) => {
              const at = [0, 2, 5].indexOf(i); if (at < 0) return;
              const s = S3[at], rp = clamp((t - s - 0.2) / 0.5, 0, 1);
              if (rp > 0) { ring(g, x2 + w2 / 2, y2 + h2 / 2, w2 / 2 - 1, h2 / 2 - 4, rp, D.rust[1]); ring(g, x2 + w2 / 2 + 1, y2 + h2 / 2, w2 / 2 - 1, h2 / 2 - 4, rp, D.rust[1]); }
              if (t >= s + 0.75) { PX.line(g, x2 + 5, y2 + h2 / 2, x2 + 7, y2 + h2 / 2 + 3, D.moss[2]); PX.line(g, x2 + 7, y2 + h2 / 2 + 3, x2 + 12, y2 + h2 / 2 - 4, D.moss[2]); }
            } });
          // plant on a stand + shelf
          R(g, 10, 150, 22, 18, mix(D.rust[1], D.paperD, 0.4)); for (let i = 0; i < 8; i++) { const a = -2.7 + i * 0.32 + Math.sin(t * 0.7 + i) * 0.04; limb(g, 21, 150, 21 + Math.cos(a) * 18, 150 + Math.sin(a) * 18, 2, i % 2 ? D.moss[1] : D.moss[0]); }
          R(g, 0, 168, 50, 3, WOOD[1]);
        });
        const TY = 262;
        R(g, -40, TY, 400, 110, OAK[1]); R(g, -40, TY, 400, 3, OAK[0]);
        A(g, 0.2, () => poly(g, [[200, TY], [300, TY], [330, 360], [150, 360]], D.lamp));
        // hourglass: flips at each session, sand runs ~1.6 s
        const fu = nS ? clamp(since / 0.35, 0, 1) : 1, run = nS ? clamp((since - 0.35) / 1.6, 0, 1) : 1;
        A(g, 0.35, () => ell(g, 222, TY + 30, 12, 2, SHD(1)));
        hourglass(g, 222, TY + 30, nS ? (fu < 1 ? 1 : run) : 1, nS && fu < 1 ? fu : 0);
        // mug + flashcards (the session's tools)
        R(g, 30, TY + 14, 16, 18, mix(D.rose[1], D.paper, 0.3)); R(g, 30, TY + 14, 16, 2, mix(D.rose[0], D.cream, 0.3)); R(g, 46, TY + 18, 3, 9, mix(D.rose[1], D.paper, 0.3));
        for (let k = 0; k < 4; k++) { R(g, 56 + k, TY + 30 - k * 2, 22, 13, D.cream); R(g, 56 + k, TY + 30 - k * 2, 22, 1, lt(D.cream, 0.5)); R(g, 56 + k, TY + 42 - k * 2, 22, 1, D.paperD); }
        const BX = 104, BY = TY + 12;
        A(g, 0.35, () => R(g, BX + 3, BY + 3, 88, 36, SHD(1)));
        R(g, BX - 2, BY - 1, 92, 40, mix(D.moss[2], D.n2, 0.2)); R(g, BX, BY, 88, 36, D.cream); R(g, BX + 43, BY, 2, 36, D.paper);
        for (let k = 0; k < 4; k++) for (const sd of [0, 1]) scrawl(g, BX + 4 + sd * 46, BY + 6 + k * 7, 36, mix(D.ink, D.paper, 0.3), 30 + k + sd * 5 + day, 1);
        // the same student, fresh: different task each session (read, cards, self-quiz)
        const cx = 156, task = Math.max(0, nS - 1), active = nS > 0 && since < 2.2;
        const wr = frac(t * 0.9);
        const hr = task === 1 ? [70, TY + 22] : [BX + 58 + Math.round(wr * 20), BY + 12 + Math.floor(wr * 3) * 6];
        fig(g, cx, TY + 3, t, {
          ...CRAMMER, s: 1.95, seed: 0.8, dip: 3, lean: 0, face: task === 1 ? -0.3 : 0.05,
          eyes: active && frac(t / 2.4) < 0.25 ? "up" : "down", brow: "calm", mouth: active ? (task === 2 ? "talk" : "smile") : "smile", look: task === 1 ? [-0.6, 0.6] : [0.2, 0.6],
          hl: [BX + 14, BY + 24], hr, itemR: task !== 1 ? (g2, hx, hy) => pencil(g2, hx - 2, hy + 2, 0.5, -0.86) : null,
        });
        // foreground: a leafy plant edge, bottom right (out of focus)
        PX.par(g, c, 1.2, () => { for (let i = 0; i < 7; i++) { const a = -2.2 + i * 0.22 + Math.sin(t * 0.6 + i) * 0.03; limb(g, 300, 372, 300 + Math.cos(a) * 70, 372 + Math.sin(a) * 70, 6, i % 2 ? mix(D.moss[2], D.n1, 0.35) : mix(D.moss[2], D.n1, 0.5)); } });
        // the new-day wash
        if (nS && since < 0.5) A(g, 0.35 * (1 - since / 0.5), () => R(g, 0, 0, 320, 360, D.cream));
        PX.vignette(g, 0.3);
        g.restore();
      });
      // divider + labels
      R(g, 318, 0, 4, 360, D.n0); R(g, 319, 0, 1, 360, D.n3);
      label(g, "CRAM", 160, 46, t, 0.15, { size: 8 });
      label(g, "SPACED", 482, 46, t, 0.15, { size: 8, col: D.cream });
      PX.vignette(g, 0.3);
    };
  };
  // ======================= classroom7 =======================
  // a seventh-grade classroom seen from the teacher's desk, an aisle splitting it in two. Worksheets on every desk.
  // o.blocked (0.5): the left half's sheets fill with the same icon over and over ("BLOCKED"), the kids write fast;
  // o.mixed (3.0): the right half's sheets fill with mixed icons ("MIXED"), those kids stop, frown, scratch heads.
  const ICONS = {
    tri: { rows: ["...#...", "..#.#..", "..#.#..", ".#...#.", ".#...#.", "#######"], col: D.rust[2] },
    cir: { rows: [".###.", "#...#", "#...#", "#...#", ".###."], col: D.teal[2] },
    sq: { rows: ["#####", "#.#.#", "#####", "#.#.#", "#####"], col: D.steel[2] },
    div: { rows: ["..#..", ".....", "#####", ".....", "..#.."], col: D.moss[2] },
  };
  const MIXSEQ = ["tri", "cir", "sq", "div", "cir", "tri", "div", "sq", "tri", "sq", "cir", "div"];
  const KIDS = [
    { skin: SKIN.light, hair: HAIR.sand, hs: "bob", top: [mix(D.rose[1], D.paper, 0.3), mix(D.rose[2], D.paperD, 0.3), mix(D.rose[2], D.n2, 0.4)] },
    { skin: SKIN.deep, hair: HAIR.black, hs: "curly", top: [mix(D.moss[1], D.paper, 0.2), D.moss[2], dk(D.moss[2], 0.4)] },
    { skin: SKIN.tan, hair: HAIR.brown, hs: "pony", top: [mix(D.steel[1], D.paper, 0.25), D.steel[2], dk(D.steel[2], 0.4)] },
    { skin: SKIN.medium, hair: HAIR.black, hs: "short", top: [mix(D.amber[2], D.paper, 0.35), mix(D.amber[2], D.n3, 0.25), mix(D.amber[2], D.n1, 0.5)] },
    { skin: SKIN.light, hair: HAIR.auburn, hs: "short", top: [mix(D.teal[1], D.paper, 0.25), D.teal[2], dk(D.teal[2], 0.4)] },
    { skin: SKIN.deep, hair: HAIR.black, hs: "bob", top: [mix(D.plum[1], D.paper, 0.25), D.plum[2], dk(D.plum[2], 0.4)] },
    { skin: SKIN.medium, hair: HAIR.brown, hs: "curly", top: [mix(D.paperD, D.cream, 0.2), D.paperD, mix(D.paperD, D.n2, 0.4)] },
    { skin: SKIN.tan, hair: HAIR.black, hs: "pony", top: [mix(D.rust[1], D.paper, 0.35), mix(D.rust[2], D.paperD, 0.2), mix(D.rust[2], D.n1, 0.4)] },
  ];
  K.classroom7 = (o) => {
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const tB = tm(o, "blocked", 0.5, d, 9.0), tM = tm(o, "mixed", 3.0, d, 9.0);
      const wall = mix(D.paper, D.teal[2], 0.35);
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: back wall with cubbies, bulletin board, clock, door ----
      PX.par(g, c, 0.4, () => {
        PX.vgrad(g, -40, -40, 720, 300, lt(wall, 0.05), mix(wall, D.n3, 0.35), 7);
        // bulletin board (left) + door (right) + clock (centre)
        R(g, -10, 34, 118, 80, WOOD[1]); R(g, -6, 38, 110, 72, mix(D.paperD, D.amber[2], 0.3));
        for (const [bx, by, bw, bh, col] of [[2, 44, 34, 26, D.cream], [44, 48, 40, 30, mix(D.moss[0], D.paper, 0.4)], [88, 42, 14, 40, D.paper], [6, 78, 44, 26, mix(D.rose[0], D.paper, 0.4)], [56, 84, 40, 20, D.cream]]) {
          R(g, bx, by, bw, bh, col); R(g, bx, by, bw, 1, lt(col, 0.4)); R(g, bx + bw / 2 - 1, by + 1, 2, 2, D.rust[1]);
          for (let k = 0; k < Math.floor((bh - 6) / 6); k++) { const ic = Object.keys(ICONS)[(bx + k) % 4]; PX.sprite(g, ICONS[ic].rows, bx + 4, by + 5 + k * 7, { "#": mix(ICONS[ic].col, col, 0.3) }); R(g, bx + 12, by + 8 + k * 7, bw - 18, 1, mix(D.ink, col, 0.5)); }
        }
        clock(g, 320, 62, 16, (t / 60) * TAU + 0.4, 2.6, { rim: D.n5, rimD: D.n4, face: D.cream });
        R(g, 566, 26, 74, 150, mix(WOOD[2], D.n2, 0.2)); R(g, 570, 30, 66, 146, WOOD[1]); R(g, 580, 40, 46, 44, mix(D.steel[0], D.cream, 0.4)); R(g, 628, 106, 4, 8, D.amber[1]);
        // alphabet-free shape frieze above the cubbies
        for (let k = 0; k < 9; k++) { const ic = Object.keys(ICONS)[k % 4]; R(g, 130 + k * 48, 100, 30, 20, D.cream); PX.sprite(g, ICONS[ic].rows, 140 + k * 48, 106, { "#": mix(ICONS[ic].col, D.cream, 0.2) }); }
        // cubbies along the back
        R(g, -40, 128, 720, 64, mix(WOOD[2], D.n2, 0.3)); R(g, -40, 128, 720, 3, WOOD[0]);
        for (let x = -36; x < 680; x += 30) { R(g, x, 134, 26, 26, mix(WOOD[3], D.n1, 0.3)); R(g, x, 164, 26, 24, mix(WOOD[3], D.n1, 0.3));
          if (hash(x, 1) < 0.7) R(g, x + 3, 146 - Math.round(hash(x, 2) * 8), 20, 14 + Math.round(hash(x, 2) * 8), [D.rust[2], D.moss[2], D.steel[2], D.plum[2], D.amber[2]][Math.floor(hash(x, 3) * 5)]);
          if (hash(x, 4) < 0.6) R(g, x + 4, 170, 18, 18, mix([D.teal[2], D.paperD, D.rose[2]][Math.floor(hash(x, 5) * 3)], D.n2, 0.2)); }
        R(g, -40, 192, 720, 100, mix(D.paperD, D.n3, 0.5));
        for (let k = 0; k < 7; k++) R(g, -40, 196 + k * 14, 720, 1, mix(D.paperD, D.n2, 0.55));
      });
      // window light from the left: long sun stripes across the floor and desks
      for (let k = 0; k < 3; k++) A(g, 0.08, () => poly(g, [[-40, 120 + k * 60], [10, 110 + k * 60], [700, 300 + k * 30], [640, 330 + k * 30]], D.lamp));
      const sheetFill = (half, i, n) => { // which icon at slot n of kid i
        if (half === 0) return "tri";
        return MIXSEQ[(n + i * 5) % MIXSEQ.length];
      };
      // worksheet: x, y, w, h; half 0/1; reveal 0..1 (icons printed in), kid index, scale (1 front / 0.6 back)
      const sheet = (x, y, w, h, half, rv, i, big, prog) => {
        A(g, 0.4, () => R(g, x + 2, y + 2, w, h, SHD(1)));
        R(g, x, y, w, h, D.cream); R(g, x, y, w, 1, lt(D.cream, 0.5)); R(g, x, y + h - 1, w, 1, D.paper);
        if (!big) { // back row: tiny coloured dots only
          for (let n = 0; n < 6; n++) { if (n / 6 >= rv) break; const ic = ICONS[sheetFill(half, i, n)]; R(g, x + 2 + (n % 3) * 7, y + 3 + Math.floor(n / 3) * 6, 3, 3, ic.col); }
          return;
        }
        R(g, x + 3, y + 2, w * 0.45, 1, mix(D.ink, D.cream, 0.5));
        for (let n = 0; n < 6; n++) {
          const cx2 = x + 4 + (n % 2) * Math.round(w / 2), cy2 = y + 6 + Math.floor(n / 2) * 9;
          if (n / 6 < rv) { const ic = ICONS[sheetFill(half, i, n)]; PX.sprite(g, ic.rows, cx2, cy2 + (ic.rows.length === 6 ? 0 : 1), { "#": ic.col }); }
          R(g, cx2 + 9, cy2 + 6, Math.round(w / 2) - 14, 1, mix(D.steel[0], D.cream, 0.55));
          const pp = clamp(prog * 6 - n, 0, 1); if (pp > 0) scrawl(g, cx2 + 9, cy2 + 3, Math.round(w / 2) - 15, D.ink, n + i * 7, pp);
        }
      };
      // ---- back row (smaller, behind) ----
      const kid = (i, x, deskY, s, front) => {
        const half = x < 320 ? 0 : 1, tb = half === 0 ? tB : tM, rv = PX.p(t, tb, 0.8, "lin");
        const work = t > tb + 0.8, ph = hash(i, 9) * 6;
        const dw = Math.round(100 * s / 1.75), sw = Math.round(54 * s / 1.75), sh = Math.round(34 * s / 1.75);
        // writing progress: blocked kids write fast and steady; mixed kids slowly, stopping
        const prog = work ? clamp(half === 0 ? (t - tb - 0.8) / 2.6 : (t - tb - 0.8) / 9, 0, 1) : 0;
        const puzzled = half === 1 && work;
        const cyc = frac((t + ph) / 3.2), scratch = puzzled && cyc < 0.35, look = puzzled && cyc >= 0.35 && cyc < 0.6;
        // desk
        A(g, 0.35, () => ell(g, x, deskY + Math.round(70 * s / 1.75), dw / 2 + 4, 4, SHD(1)));
        for (const lx of [x - dw / 2 + 6, x + dw / 2 - 9]) { R(g, lx, deskY + 10, 3, Math.round(64 * s / 1.75), D.n4); R(g, lx, deskY + 10, 1, Math.round(64 * s / 1.75), D.n6); }
        const sx = x - sw / 2, sy = deskY + 2;
        const pen = [sx + sw * (0.55 + 0.3 * frac(t * (half === 0 ? 1.6 : 0.5) + ph)), sy + sh * (0.3 + 0.5 * frac(Math.floor(t * (half === 0 ? 1.6 : 0.5) + ph) / 3))];
        const head = { x: x, y: deskY + 3 - Math.round((26 + 2.2 + 17) * s) };
        const opts = {
          ...KIDS[i % KIDS.length], s, seed: i * 0.7, dip: Math.round(2 * s), face: (hash(i, 3) - 0.5) * 0.4,
          eyes: !work ? "open" : look ? "up" : "down", look: !work ? [0, -0.2] : look ? [hash(i, 4) - 0.5, -1] : [0, 0.6],
          brow: puzzled ? (scratch ? "puzzle" : "knit") : "calm", mouth: puzzled ? (look ? "side" : "frown") : work ? "flat" : "flat",
          hl: scratch ? [head.x - Math.round(8 * s), head.y + Math.round(2 * s)] : [sx + 4, sy + sh - 6],
          hr: work && !scratch && !look ? pen : [x + Math.round(12 * s), sy + sh - 4],
          itemR: front ? (g2, hx, hy) => pencil(g2, hx - 1, hy + 1, 0.5, -0.86) : null,
        };
        // desktop first (so the kid sits behind it), then sheet, then the kid (arms over the sheet)
        poly(g, [[x - dw / 2 + 4, deskY], [x + dw / 2 - 4, deskY], [x + dw / 2, deskY + Math.round(14 * s / 1.75)], [x - dw / 2, deskY + Math.round(14 * s / 1.75)]], OAK[1]);
        R(g, x - dw / 2 + 4, deskY, dw - 8, 1, OAK[0]); R(g, x - dw / 2, deskY + Math.round(14 * s / 1.75), dw, Math.max(2, Math.round(4 * s / 1.75)), OAK[2]);
        sheet(sx, sy, sw, sh, half, rv, i, front, prog);
        fig(g, x, deskY + 3, t, opts);
        if (scratch) { const hx = head.x - Math.round(8 * s), hy2 = head.y + Math.round(2 * s) + (frac(t * 4) < 0.5 ? 0 : 1); R(g, hx - 2, hy2 - 2, Math.round(4 * s), Math.round(4 * s), KIDS[i % KIDS.length].skin[1]); }
        if (puzzled && look && front) PX.otext(g, "?", head.x + Math.round(12 * s), head.y - 6, { font: "p", size: 8, col: D.cream, outline: D.n0 });
      };
      kid(4, 150, 214, 1.2, false); kid(5, 254, 214, 1.2, false); kid(6, 388, 214, 1.2, false); kid(7, 494, 214, 1.2, false);
      // ---- front row ----
      kid(0, 104, 282, 1.75, true); kid(1, 222, 282, 1.75, true); kid(2, 418, 282, 1.75, true); kid(3, 536, 282, 1.75, true);
      // labels
      label(g, "BLOCKED", 170, 64, t, tB + 0.2);
      label(g, "MIXED", 466, 64, t, tM + 0.2);
      // foreground: the teacher's desk edge with a stack of sheets + an apple-free coffee mug (bottom centre)
      PX.par(g, c, 1.2, () => {
        R(g, 230, 338, 180, 30, mix(WOOD[3], D.n0, 0.35)); R(g, 230, 338, 180, 2, mix(WOOD[1], D.n1, 0.4));
        for (let k = 0; k < 5; k++) R(g, 260 + k, 330 - k * 2, 50, 8, k % 2 ? D.paper : D.cream);
        R(g, 360, 320, 16, 18, mix(D.steel[2], D.n1, 0.3)); R(g, 360, 320, 16, 2, mix(D.steel[1], D.n2, 0.3));
      });
      PX.vignette(g, 0.45);
    };
  };
  // ======================= gym =======================
  // a brick-walled gym in morning light. o.easy (0.5): the learner curls a tiny dumbbell, effortless and bored (yawn);
  // around o.heavy - 0.9 the dumbbell goes down on the bench and the learner grips a loaded barbell resting on the rack
  // pins; o.heavy (4.0): slow heavy curls with real strain: sticking point, shaking arms, gritted teeth, sweat, biceps.
  K.gym = (o) => {
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const tE = tm(o, "easy", 0.5, d, 8.0), tH = tm(o, "heavy", 4.0, d, 8.0);
      const heavy = t >= tH - 0.5, swap = PX.p(t, tH - 0.9, 0.4, "io"), grip = PX.p(t, tH - 0.5, 0.5, "io");
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: brick wall, tall factory windows, dumbbell rack, plate tree ----
      const brick = mix(D.rust[2], D.n2, 0.45);
      PX.par(g, c, 0.4, () => {
        R(g, -40, -40, 720, 300, brick);
        for (let y = -40, row = 0; y < 260; y += 8, row++) { R(g, -40, y, 720, 1, mix(brick, D.n0, 0.35)); for (let x = -40 + (row % 2) * 9; x < 680; x += 18) { R(g, x, y, 1, 8, mix(brick, D.n0, 0.35)); if (hash(x, y) < 0.18) R(g, x + 1, y + 1, 17, 7, mix(brick, D.rust[1], 0.12)); } }
        // windows with daylight (left two)
        for (const wx of [20, 140]) {
          const wy = 26, ww = 96, wh = 120;
          R(g, wx - 5, wy - 5, ww + 10, wh + 10, D.n3);
          PX.vgrad(g, wx, wy, ww, wh, mix(D.steel[0], D.cream, 0.5), mix(D.cream, D.lamp, 0.35), 5);
          ell(g, wx + 60, wy + wh - 20, 40, 22, mix(D.moss[1], D.cream, 0.4));
          for (let k = 1; k < 4; k++) R(g, wx + (k * ww) / 4 - 1, wy, 2, wh, D.n3); for (let k = 1; k < 4; k++) R(g, wx, wy + (k * wh) / 4 - 1, ww, 2, D.n3);
          R(g, wx - 8, wy + wh + 5, ww + 16, 4, D.n4);
          PX.glow(g, wx + ww / 2, wy + wh / 2, 110, D.lamp, 0.14);
        }
        // mirror strip on the right with soft reflections
        R(g, 380, 40, 260, 140, mix(D.glass, D.n3, 0.55)); R(g, 380, 40, 260, 2, D.n5); R(g, 380, 178, 260, 2, D.n5);
        A(g, 0.12, () => { for (let k = 0; k < 6; k++) poly(g, [[400 + k * 44, 42], [414 + k * 44, 42], [394 + k * 44, 178], [380 + k * 44, 178]], D.cream); });
        // dumbbell rack along the wall (two tiers)
        R(g, 360, 196, 280, 6, D.n4); R(g, 360, 196, 280, 1, D.n6); R(g, 368, 222, 270, 6, D.n4); R(g, 368, 222, 270, 1, D.n6);
        for (const [ry, n, sz] of [[196, 14, 6], [222, 12, 8]]) for (let k = 0; k < n; k++) { const x = 372 + k * (sz * 2.6 + 4); R(g, x, ry - sz, sz, sz, D.n2); R(g, x + sz * 1.6 + 2, ry - sz, sz, sz, D.n2); R(g, x + sz - 1, ry - sz / 2 - 1, sz * 0.6 + 4, 2, D.n6); R(g, x, ry - sz, sz, 1, D.n4); R(g, x + sz * 1.6 + 2, ry - sz, sz, 1, D.n4); }
        for (const lx of [372, 630]) R(g, lx, 196, 4, 64, D.n3);
        // plate tree (left of the rack)
        R(g, 326, 150, 4, 106, D.n4); R(g, 314, 252, 28, 6, D.n3);
        for (const [py, r] of [[176, 18], [218, 22]]) { PX.circle(g, 328, py, r, D.n2); PX.circle(g, 328, py, r - 3, mix(D.n2, D.n3, 0.5)); PX.circle(g, 328, py, 3, D.n5); A(g, 0.3, () => { for (let a = 0; a < 10; a++) R(g, 328 + Math.cos(-2.4 + a * 0.1) * (r - 1), py + Math.sin(-2.4 + a * 0.1) * (r - 1), 1, 1, D.n6); }); }
        // a climbing rope hanging + chalk bucket
        for (let y = -20; y < 240; y += 2) R(g, 268 + Math.round(Math.sin(y * 0.05 + t * 0.6) * 1.5), y, 3, 2, (y / 2) % 2 ? D.paperD : mix(D.paperD, D.n3, 0.3));
        R(g, 252, 236, 26, 22, D.n6); R(g, 252, 236, 26, 2, D.n7); A(g, 0.6, () => R(g, 254, 234, 22, 3, D.cream));
      });
      // ---- floor: rubber tiles + a wooden lifting platform ----
      PX.par(g, c, 0.8, () => {
        R(g, -40, 256, 720, 120, mix(D.n2, D.steel[2], 0.15));
        for (let k = 0; k < 6; k++) R(g, -40, 262 + k * 18, 720, 1, D.n1);
        for (let x = -40; x < 680; x += 60) PX.line(g, x, 256, x - 80 + (x - 320) * 0.3, 370, D.n1);
      });
      poly(g, [[170, 296], [470, 296], [520, 370], [120, 370]], OAK[2]); poly(g, [[200, 296], [440, 296], [470, 370], [170, 370]], OAK[1]);
      R(g, 170, 296, 300, 2, OAK[0]); for (let k = 1; k < 4; k++) A(g, 0.4, () => PX.line(g, 200 + k * 60, 296, 170 + k * 75, 370, OAK[2]));
      // daylight shafts across the floor
      beam(g, [[30, 40], [110, 40], [330, 330], [190, 340]], t, 0.06, 31, D.lamp);
      beam(g, [[150, 40], [230, 40], [450, 330], [310, 340]], t, 0.05, 37, D.lamp);
      // the bench (right) where the little dumbbell goes down
      R(g, 470, 266, 110, 10, mix(D.n2, D.rust[2], 0.3)); R(g, 470, 266, 110, 2, mix(D.n4, D.rust[2], 0.3)); R(g, 484, 276, 6, 26, D.n4); R(g, 560, 276, 6, 26, D.n4); R(g, 478, 300, 94, 3, D.n3);
      A(g, 0.4, () => ell(g, 525, 306, 60, 4, SHD(1)));
      // rack uprights + safety pins behind the lifter (bar rests here before the heavy set)
      for (const ux of [176, 456]) { R(g, ux, 150, 8, 150, D.n3); R(g, ux, 150, 2, 150, D.n5); for (let y = 160; y < 296; y += 10) R(g, ux + 3, y, 2, 3, D.n1); R(g, ux - 6, 296, 20, 4, D.n4); R(g, ux < 320 ? ux + 8 : ux - 26, 290, 26, 3, D.n5); R(g, ux < 320 ? ux + 8 : ux - 26, 290, 26, 1, D.n7); }
      // tiny dumbbell (muted rose) + the barbell
      const tiny = (x, y) => { R(g, x - 7, y - 3, 4, 6, mix(D.rose[1], D.n3, 0.25)); R(g, x + 4, y - 3, 4, 6, mix(D.rose[1], D.n3, 0.25)); R(g, x - 7, y - 3, 4, 1, D.rose[0]); R(g, x + 4, y - 3, 4, 1, D.rose[0]); R(g, x - 3, y - 1, 7, 2, D.n6); };
      const S = 1.4, cx = 320, FY = 340;
      // heavy rep cycle: up slowly with a sticking point, short hold, controlled down
      const REP = 3.4, rt = Math.max(0, t - tH), ru = frac(rt / REP);
      let lift = 0;
      if (t >= tH) { if (ru < 0.62) { const u = ru / 0.62; lift = u < 0.45 ? E(u / 0.45, "out") * 0.5 : u < 0.7 ? 0.5 + (u - 0.45) * 0.12 : 0.53 + E((u - 0.7) / 0.3, "io") * 0.47; } else if (ru < 0.72) lift = 1; else lift = 1 - E((ru - 0.72) / 0.28, "io"); }
      const strain = t >= tH ? clamp(0.55 + 0.45 * Math.sin(clamp(lift, 0, 1) * Math.PI), 0, 1) : 0;
      // body geometry (mirrors fig's): shoulders + hip lines
      const P2 = (v) => Math.round(v * S), hipY = FY - P2(36), shYb = hipY - P2(26);
      const lean = heavy ? -Math.round(strain * 3) : 0, kn = heavy ? 0.3 + strain * 0.25 : 0;
      // hands
      const restY = 287, barDown = hipY + P2(6), barUp = shYb + P2(8);
      let barY = barDown, hl, hr, itemR = null, onBench = false;
      if (!heavy) {
        const curl = t >= tE ? 0.5 - 0.5 * Math.cos(((t - tE) / 0.85) * TAU) : 0;
        const ex = cx + P2(9) + 2, down = [ex + 3, hipY + P2(3)], up = [ex - 2, shYb + P2(9)];
        hr = swap > 0 ? [lerp(lerp(down[0], up[0], curl), 520, swap), lerp(lerp(down[1], up[1], curl), 262, swap)] : [lerp(down[0], up[0], curl), lerp(down[1], up[1], curl)];
        hl = [cx - P2(11), hipY - P2(1)];   // hand on the hip
        if (swap < 0.3) itemR = (g2, x, y) => tiny(x, y + 1); else if (swap >= 1) onBench = true;
      } else {
        onBench = true;
        barY = t < tH ? lerp(restY, barDown, grip) : lerp(barDown, barUp, lift);
        hl = [cx - P2(10), barY]; hr = [cx + P2(10), barY];
      }
      if (onBench) tiny(530, 262);
      // the bar resting on the pins before the set
      const bar = (y, bend) => {
        const L = 112, x0 = cx - L, x1 = cx + L, sag = Math.round(bend * 3);
        A(g, 0.35, () => R(g, x0, y + 30, x1 - x0, 2, SHD(1)));
        for (let i = 0; i < 3; i++) { const xa = [x0, cx - 50, cx + 50][i], xb = [cx - 50, cx + 50, x1][i], ya = i === 0 ? y + sag : y, yb = i === 2 ? y + sag : y; limb(g, xa, ya, xb, yb, 3, D.n6); PX.line(g, xa, ya - 1, xb, yb - 1, D.n7); }
        for (const sd of [-1, 1]) {
          const px = cx + sd * 86, py = y + sag;
          for (const [off, h, w] of [[0, 56, 8], [10, 48, 7], [19, 34, 5]]) { const xx = px + sd * off - (sd < 0 ? w : 0); R(g, xx, py - h / 2, w, h, D.n2); R(g, xx, py - h / 2, 1, h, D.n4); R(g, xx, py - h / 2, w, 1, D.n5); R(g, xx + w - 1, py - h / 2, 1, h, D.n0); }
          R(g, px - (sd < 0 ? 4 : 0) - sd * 4, py - 4, 4, 8, D.n5);   // collar
        }
      };
      if (!heavy || t < tH - 0.5 + 0.01) bar(restY, 0);
      fig(g, cx, FY, t, {
        ...LEARNER, top: TEAL, s: S, stand: true, short: true, shorts: false, bot: [mix(D.n4, D.steel[2], 0.3), mix(D.n3, D.steel[2], 0.3), D.n2],
        seed: 0.3, lean, knee: kn, eR: heavy || swap < 0.05 ? [cx + lean + P2(11), shYb + P2(15)] : null, eL: heavy ? [cx + lean - P2(11), shYb + P2(15)] : null, flex: heavy ? Math.round(1 + strain * 2) : 0, shake: heavy && t >= tH ? 0.4 + strain * 0.9 : 0,
        face: heavy ? 0 : (t >= tE ? 0.35 : 0), look: heavy ? [0, 0] : t >= tE ? [0.9, 0] : [0, 0],
        eyes: heavy ? (t >= tH ? "squint" : "open") : t >= tE ? (frac(t / 2.6) > 0.78 ? "closed" : "half") : "open",
        brow: heavy ? (t >= tH ? "strain" : "knit") : "calm",
        mouth: heavy ? (t >= tH ? (lift > 0.35 && lift < 0.75 ? "grit" : "o") : "flat") : t >= tE && frac(t / 2.6) > 0.78 ? "yawn" : "flat",
        sweat: heavy && t >= tH ? 0.5 + strain * 0.5 : 0, flush: heavy && t >= tH ? strain * 0.8 : 0,
        hl, hr, itemR,
      });
      if (!heavy && swap >= 0.3 && swap < 1) { const k = E((swap - 0.3) / 0.7, "io"), x0 = cx + P2(12), y0 = shYb + P2(12); tiny(lerp(x0, 530, k), lerp(y0, 262, k) - Math.sin(k * Math.PI) * 26); }
      if (heavy && t >= tH - 0.5 + 0.01) {
        const sh = t >= tH ? Math.round(Math.sin(t * 41) * strain * 0.9) : 0;
        bar(barY + sh, t >= tH ? strain : 0);
        // hands over the bar
        for (const sd of [-1, 1]) { const hx = cx + sd * P2(10), sk = LEARNER.skin; R(g, hx - 3, barY + sh - 3, 7, 6, sk[1]); R(g, hx - 3, barY + sh - 3, 7, 1, sk[0]); R(g, hx - 3, barY + sh + 2, 7, 1, sk[2]); }
        // effort lines at the sticking point (short, calm strokes)
        if (t >= tH && lift > 0.4 && lift < 0.7) for (const sd of [-1, 1]) for (let k = 0; k < 2; k++) PX.line(g, cx + sd * (34 + k * 5), shYb - 6 - k * 6, cx + sd * (40 + k * 5), shYb - 10 - k * 6, mix(D.cream, D.n4, 0.3));
      }
      PX.particles(g, 23, 26, t, [120, 60, 420, 220], { vy: -1.5, vx: 1.2, col: D.cream, a: 0.3 });
      PX.vignette(g, 0.5);
    };
  };
})();
