/* EP4 Builder B: Physarum polycephalum (slime mould) and the 2010 Tokyo rail experiment.
   Documentary palette PX.D only (shades derived with mix()). One shared slime renderer:
   a jittered node graph + Dijkstra arrival distance (growth is parametric in t), a shortest-path tree whose
   subtree sizes give vein thickness (thick trunks, fine tips), a lobed lace "fan" sheet at the front,
   and tubes stamped in passes (shadow, rim, body, light core) with peristaltic pulses travelling along them. */
(function () {
  const { K, D } = PX;
  const R = PX.rect, P = PX.p, clamp = PX.clamp, lerp = PX.lerp, AM = D.amber;
  const TAU = Math.PI * 2;

  // ---------- colour + noise ----------
  const hx = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const MC = new Map();
  const mix = (a, b, k) => {
    k = Math.round(clamp(k, 0, 1) * 100) / 100; const key = a + b + k; let v = MC.get(key);
    if (!v) { const A = hx(a), B = hx(b); v = "#" + A.map((x, i) => Math.round(x + (B[i] - x) * k).toString(16).padStart(2, "0")).join(""); MC.set(key, v); }
    return v;
  };
  const mixv = (A, B, k) => [A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k];
  const hash = (x, y, s) => { let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul((s | 0) + 1, 1442695041); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  const vn = (x, y, s) => { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    return lerp(lerp(hash(ix, iy, s), hash(ix + 1, iy, s), u), lerp(hash(ix, iy + 1, s), hash(ix + 1, iy + 1, s), u), v); };
  const fbm = (x, y, s) => 0.55 * vn(x, y, s) + 0.3 * vn(x * 2.1, y * 2.1, s + 7) + 0.15 * vn(x * 4.3, y * 4.3, s + 13);
  const fm = (x, m) => ((x % m) + m) % m;
  // default beat time(s) scaled by k = d / typical length, so '{}' fits any shot length
  const dflt = (v, def, k) => (v === undefined ? (Array.isArray(def) ? def.map((x) => x * k) : def * k) : v);

  // ---------- offscreen baking ----------
  const cv = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  const bake = (w, h, fn) => { const c = cv(w, h); fn(c.getContext("2d"), c); return c; };
  // per-pixel texture: fn(x, y) -> [r,g,b] | [r,g,b,a] | null
  const pix = (w, h, fn) => {
    const c = cv(w, h), x2 = c.getContext("2d"), id = x2.createImageData(w, h), dd = id.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = fn(x, y); if (!v) continue; const i = (y * w + x) * 4; dd[i] = v[0]; dd[i + 1] = v[1]; dd[i + 2] = v[2]; dd[i + 3] = v.length > 3 ? v[3] : 255; }
    x2.putImageData(id, 0, 0); return c;
  };
  let SH = null, LY = null; const shadowCv = () => (SH = SH || cv(640, 360));
  // shared scratch layer: draw into it, mask it (destination-in), then composite
  const layer = () => { LY = LY || cv(640, 360); const lg = LY.getContext("2d"); lg.clearRect(0, 0, 640, 360); return lg; };
  const masked = (g, lg, mask) => { lg.globalCompositeOperation = "destination-in"; lg.drawImage(mask, 0, 0); lg.globalCompositeOperation = "source-over"; g.drawImage(LY, 0, 0); };

  // pixel disc (fillStyle set by caller), integer centre so it stays symmetric
  const disc = (g, x, y, r) => {
    const cx = Math.round(x), cy = Math.round(y);
    if (r < 0.75) { g.fillRect(cx, cy, 1, 1); return; }
    const ri = Math.ceil(r);
    for (let dy = -ri; dy <= ri; dy++) { const w2 = r * r - dy * dy; if (w2 < 0) continue; const w = Math.floor(Math.sqrt(w2) + 0.25); g.fillRect(cx - w, cy + dy, 2 * w + 1, 1); }
  };
  // scanline polygon fill
  const poly = (g, pts, col) => {
    let y0 = 1e9, y1 = -1e9; for (const [, y] of pts) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    g.fillStyle = col;
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const xs = [], yc = y + 0.5;
      for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax)); }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) g.fillRect(Math.round(xs[i]), y, Math.round(xs[i + 1]) - Math.round(xs[i]), 1);
    }
  };
  const chaikin = (pts, it) => { // pts [[x,y,s],...]
    for (let k = 0; k < (it || 2); k++) { const o = [pts[0]]; for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i], b = pts[i + 1]; o.push(a.map((v, j) => v * 0.75 + b[j] * 0.25), a.map((v, j) => v * 0.25 + b[j] * 0.75)); } o.push(pts[pts.length - 1]); pts = o; }
    return pts;
  };

  // ---------- slime tubes ----------
  // segs: [x1,y1,r1,s1, x2,y2,r2,s2] (s = arc distance, drives pulses). o: {t, col:[light,base,shadow], sh, flow:{v,lam,col}, pul:{a,k,w}, wob}
  function tubes(g, segs, o) {
    const t = o.t || 0, pul = o.pul, wob = o.wob || 0, fl = o.flow, col = o.col || AM, st = [];
    for (const q of segs) {
      const [x1, y1, r1, s1, x2, y2, r2, s2] = q, n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1)));
      for (let i = 0; i <= n; i++) {
        const k = i / n, s = s1 + (s2 - s1) * k; let r = r1 + (r2 - r1) * k; if (r <= 0.15) continue;
        if (pul) r *= 1 + pul.a * Math.sin(s * pul.k - t * pul.w);
        if (wob) r += wob * Math.sin(s * 0.55 + t * 1.1 + (q[8] || 0)) * Math.min(1, r / 2);
        st.push(x1 + (x2 - x1) * k, y1 + (y2 - y1) * k, r, s);
      }
    }
    if (o.sh !== 0) {
      const S = shadowCv(), sg = S.getContext("2d"); sg.clearRect(0, 0, 640, 360); sg.fillStyle = "#000";
      for (let i = 0; i < st.length; i += 4) disc(sg, st[i], st[i + 1], st[i + 2] + 0.8);
      g.globalAlpha = o.sh || 0.4; g.drawImage(S, o.sx || 1, o.sy || 2); g.globalAlpha = 1;
    }
    g.fillStyle = col[2]; for (let i = 0; i < st.length; i += 4) if (st[i + 2] >= 1.4) disc(g, st[i], st[i + 1], st[i + 2]);
    g.fillStyle = mix(col[1], col[2], 0.35); for (let i = 0; i < st.length; i += 4) if (st[i + 2] < 1.4) disc(g, st[i], st[i + 1], st[i + 2]);
    g.fillStyle = col[1]; for (let i = 0; i < st.length; i += 4) if (st[i + 2] >= 1.4) disc(g, st[i], st[i + 1], st[i + 2] - 1);
    g.fillStyle = col[0]; for (let i = 0; i < st.length; i += 4) { const r = st[i + 2]; if (r >= 2.3) disc(g, st[i] - r * 0.3, st[i + 1] - r * 0.32, r * 0.34); }
    if (fl) {
      g.fillStyle = fl.col || D.cream; const lam = fl.lam || 22;
      for (let i = 0; i < st.length; i += 4) { const r = st[i + 2]; if (r < (fl.min || 1.8)) continue; if (fm(st[i + 3] - t * fl.v, lam) < 1.1) disc(g, st[i] - r * 0.25, st[i + 1] - r * 0.25, Math.max(0.5, r * 0.3)); }
    }
  }

  // ---------- slime network: nodes on a jittered grid, Dijkstra arrival distance, shortest-path tree ----------
  // o: {seed, box:[x,y,w,h], sp, ok(x,y), wall (edges must stay inside ok), src:[[x,y],..], wj, cost(x,y), lobe}
  function mknet(o) {
    const r = PX.rnd(o.seed || 1), sp = o.sp || 5, [bx, by, bw, bh] = o.box, ok = o.ok || (() => true);
    const C = Math.ceil(bw / sp), RW = Math.ceil(bh / sp), G = new Int32Array(C * RW).fill(-1), N = [];
    for (let j = 0; j < RW; j++) for (let i = 0; i < C; i++) {
      const x = bx + (i + 0.5) * sp + (r() - 0.5) * sp * (o.jit || 0.8), y = by + (j + 0.5) * sp + (r() - 0.5) * sp * (o.jit || 0.8), h = r();
      if (ok(x, y)) { G[j * C + i] = N.length; N.push({ x, y, i, j, h, d: 1e9, p: -1, n: 1, e: [], id: N.length }); }
    }
    const NB = [[1, 0], [0, 1], [1, 1], [1, -1], [2, 1], [1, 2], [2, -1], [1, -2]];
    for (const a of N) for (const [di, dj] of NB) {
      const i = a.i + di, j = a.j + dj; if (i < 0 || j < 0 || i >= C || j >= RW) continue; const bi = G[j * C + i]; if (bi < 0) continue; const b = N[bi];
      if (o.wall) { let bad = false; for (const k of [0.25, 0.5, 0.75]) if (!ok(lerp(a.x, b.x, k), lerp(a.y, b.y, k))) bad = true; if (bad) continue; }
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const w = Math.hypot(b.x - a.x, b.y - a.y) * (1 + (o.wj === undefined ? 0.45 : o.wj) * hash(a.id, bi, o.seed || 1) + (o.cost ? o.cost(mx, my) : 0));
      a.e.push([bi, w]); b.e.push([a.id, w]);
    }
    const near = (x, y) => { let best = 0, bd = 1e18; for (const a of N) { const dd = (a.x - x) ** 2 + (a.y - y) ** 2; if (dd < bd) { bd = dd; best = a.id; } } return best; };
    const dijk = (srcs, key, par) => { // multi-source; writes a[key] (and a.p when par)
      for (const a of N) { a[key] = 1e9; if (par) a.p = -1; }
      const H = []; const push = (d, i) => { H.push([d, i]); let k = H.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (H[p][0] <= H[k][0]) break; [H[p], H[k]] = [H[k], H[p]]; k = p; } };
      const pop = () => { const top = H[0], last = H.pop(); if (H.length) { H[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, rr = l + 1; let m = k; if (l < H.length && H[l][0] < H[m][0]) m = l; if (rr < H.length && H[rr][0] < H[m][0]) m = rr; if (m === k) break; [H[m], H[k]] = [H[k], H[m]]; k = m; } } return top; };
      for (const s of srcs) { N[s][key] = 0; push(0, s); }
      while (H.length) { const [dd, i] = pop(); const a = N[i]; if (dd > a[key]) continue; for (const [bi, w] of a.e) { const nd = dd + w; if (nd < N[bi][key]) { N[bi][key] = nd; if (par) N[bi].p = i; push(nd, bi); } } }
    };
    const srcs = (o.src || [[bx + bw / 2, by + bh / 2]]).map(([x, y]) => near(x, y));
    dijk(srcs, "d", true);
    let dmax = 0; for (const a of N) if (a.d < 1e8) dmax = Math.max(dmax, a.d);
    const ord = N.filter((a) => a.d < 1e8).sort((a, b) => b.d - a.d);
    for (const a of ord) if (a.p >= 0) { N[a.p].n += a.n; (N[a.p].k = N[a.p].k || []).push(a); }
    for (const a of N) { // light smoothing toward parent and main child (kills the grid zigzag)
      const p = a.p >= 0 ? N[a.p] : a, kids = a.k || []; let c = a; for (const k of kids) if (k.n > c.n || c === a) c = k;
      a.sx = a.x * 0.5 + p.x * 0.25 + c.x * 0.25; a.sy = a.y * 0.5 + p.y * 0.25 + c.y * 0.25;
      a.nz = -(o.lobe === undefined ? 10 : o.lobe) * fbm(a.x / 11, a.y / 11, (o.seed || 1) + 3);
      a.ph = hash(a.id, 7, 3) * TAU;
    }
    return { N, sp, dmax, near, dijk, srcs, G, C, RW, bx, by };
  }
  // vein radius of node a at front F
  const vr = (a, F, o) => Math.min(o.rmax || 4, (o.r0 || 0.35) + (o.rk || 0.32) * Math.sqrt(a.n)) * clamp((F - a.d) / (o.G || 45), 0.3, 1);
  // network veins -> tube segments. o: {F, T, r0, rk, rmax, G, m(a) multiplier, skip(a)}
  function netSegs(nt, o) {
    const N = nt.N, F = o.F, segs = [], T = o.T || 3;
    for (const a of N) {
      if (a.p < 0 || a.n < T || (o.skip && o.skip(a))) continue; const b = N[a.p]; if (b.d >= F) continue;
      const m = o.m ? o.m(a) : 1; if (m <= 0.02) continue;
      const r = vr(a, F, o) * m, rb = Math.min(vr(b, F, o) * (o.m ? o.m(b) : 1), r * 1.5 + 0.3);
      let x2 = a.sx, y2 = a.sy, s2 = a.d;
      if (a.d > F) { const k = (F - b.d) / (a.d - b.d); x2 = lerp(b.sx, a.sx, k); y2 = lerp(b.sy, a.sy, k); s2 = F; }
      segs.push([b.sx, b.sy, Math.max(r, rb * 0.8), b.d, x2, y2, r, s2, a.ph]);
    }
    return segs;
  }
  // ---------- fan field: per-pixel arrival distance -> solid fan front opening into a reticulate lace ----------
  // Precompute once per kind: nearest-node arrival distance per pixel (+ lobed noise) and a Voronoi "lace" value.
  // o: {box, ok(x,y), lobe, cell (lace cell px), seed}
  function mkfan(nt, o) {
    const x0 = Math.max(0, Math.floor(o.box[0])), y0 = Math.max(0, Math.floor(o.box[1])), x1 = Math.min(640, Math.ceil(o.box[0] + o.box[2])), y1 = Math.min(360, Math.ceil(o.box[1] + o.box[3]));
    const W = x1 - x0, H = y1 - y0, n = W * H, dP = new Float32Array(n).fill(1e9), nI = new Int32Array(n).fill(-1), lv = new Float32Array(n), pn = new Uint8Array(n);
    const { G, C, RW, sp, bx, by } = nt, N = nt.N, ok = o.ok || (() => true), lobe = o.lobe === undefined ? 10 : o.lobe, cell = o.cell || 7, sd = o.seed || 3;
    const jit = (i, j, k) => hash(i, j, sd + k);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const p = (y - y0) * W + (x - x0);
      // lace: distance gap between the two nearest jittered seeds (0 on cell borders)
      const ci = Math.floor(x / cell), cj = Math.floor(y / cell); let f1 = 1e9, f2 = 1e9;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const ii = ci + di, jj = cj + dj, sx = (ii + 0.15 + 0.7 * jit(ii, jj, 1)) * cell, sy = (jj + 0.15 + 0.7 * jit(ii, jj, 2)) * cell, dd = Math.hypot(x - sx, y - sy);
        if (dd < f1) { f2 = f1; f1 = dd; } else if (dd < f2) f2 = dd; }
      lv[p] = f2 - f1; pn[p] = fbm(x / 22, y / 22, sd + 4) > 0.47 ? 1 : 0;
      if (!ok(x, y)) continue;
      const gi = Math.floor((x - bx) / sp), gj = Math.floor((y - by) / sp); let best = -1, bd = 1e9;
      for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) { const ii = gi + di, jj = gj + dj; if (ii < 0 || jj < 0 || ii >= C || jj >= RW) continue; const q = G[jj * C + ii]; if (q < 0 || N[q].d > 1e8) continue;
        const dd = Math.hypot(x - N[q].x, y - N[q].y); if (dd < bd) { bd = dd; best = q; } }
      if (best < 0) continue;
      nI[p] = best; dP[p] = N[best].d + bd * 0.8 - lobe * fbm(x / 13, y / 13, sd + 9);
    }
    const c = cv(W, H);
    return { x0, y0, W, H, dP, nI, lv, pn, cell, c, cg: c.getContext("2d"), id: c.getContext("2d").createImageData(W, H), mc: new Float32Array(N.length) };
  }
  // draw the fan at front F. o: {W (band width), lace (alpha of lace left behind, 0 = none), m(node) multiplier, ghost, a (overall alpha)}
  function drawFan(g, nt, fan, F, o) {
    const { W, H, dP, nI, lv, pn, cell, id, mc } = fan, dd8 = id.data, Wd = o.W || 34, lace = o.lace || 0, ga = o.a === undefined ? 1 : o.a;
    if (o.m) nt.N.forEach((a, i) => (mc[i] = o.m(a)));
    const cR = hx(AM[0]), cB = hx(AM[1]), cS = hx(AM[2]), cL = hx(mix(AM[1], AM[2], 0.5));
    dd8.fill(0);
    const solidAt = (p) => { const dd = dP[p]; if (dd > F) return 0; const k = (F - dd) / Wd; if (o.m && mc[nI[p]] <= 0.05) return 0;
      if (k < 1) return lv[p] < lerp(cell, cell * 0.1, PX.smooth(k * 1.15)) ? 1 : 0; return lace > 0 && pn[p] && lv[p] < cell * 0.1 ? 1 : 0; };
    for (let y = 1; y < H; y++) for (let x = 1; x < W; x++) {
      const p = y * W + x, dd = dP[p]; if (dd > F) continue;
      const k = (F - dd) / Wd, m = o.m ? mc[nI[p]] : 1; let col, a;
      if (m <= 0.05) { if (o.ghost && lv[p] < cell * 0.18) { col = cS; a = o.ghost; } else continue; }
      else if (k < 1) {
        const thr = lerp(cell, cell * 0.1, PX.smooth(k * 1.15));
        if (lv[p] < thr) { const lit = !solidAt(p - W - 1); col = k < 0.05 || lit ? cR : k < 0.35 ? cB : mixv(cB, cS, clamp((k - 0.35) * 1.3, 0, 1)); a = lerp(0.95, 0.7, k) * Math.min(1, m * 1.2); }
        else { col = cS; a = 0.22 * (1 - k) * m; }
      } else if (lace > 0 && pn[p] && lv[p] < cell * 0.1) { col = cL; a = lace * m; }
      else continue;
      const q = p * 4; dd8[q] = col[0]; dd8[q + 1] = col[1]; dd8[q + 2] = col[2]; dd8[q + 3] = 255 * a * ga;
    }
    fan.cg.putImageData(id, 0, 0); g.drawImage(fan.c, fan.x0, fan.y0);
  }

  // ---------- shared props ----------
  // dark lab-bench surface lit by a lamp at (lx, ly): returns baked canvas (w x h) placed at (ox, oy)
  const benchTex = (w, h, ox, oy, lx, ly, seed) => {
    const c0 = hx(D.n1), c1 = hx(D.n3), cl = hx(D.lampD);
    return pix(w, h, (x, y) => {
      const X = x + ox, Y = y + oy, L = clamp(1 - Math.hypot(X - lx, Y - ly) / 560, 0, 1);
      const n = fbm(X / 40, Y / 9, seed) * 0.5 + hash(X, Y, seed) * 0.12;
      let c = mixv(c0, c1, clamp(L * L * 0.95 + n * 0.35, 0, 1)); c = mixv(c, cl, L * L * 0.18);
      return c;
    });
  };
  // oat flake (rolled oat): irregular rounded polygon with ridges. size s (px), angle a
  const oat = (g, x, y, s, a, seed, k) => {
    if (s < 1) return; k = k === undefined ? 1 : k;
    const r = PX.rnd(seed), pts = [];
    for (let i = 0; i < 11; i++) { const th = (i / 11) * TAU, rr = s * (0.82 + r() * 0.3) * (1 + 0.25 * Math.cos(2 * th)); pts.push([x + Math.cos(th + a) * rr, y + Math.sin(th + a) * rr * 0.78]); }
    poly(g, pts.map(([px, py]) => [px + 1, py + 1.5]), mix(D.n0, D.n1, 0.5));
    poly(g, pts, mix(D.paperD, D.lampD, 0.25));
    poly(g, pts.map(([px, py]) => [lerp(px, x, 0.25) - s * 0.08, lerp(py, y, 0.25) - s * 0.1]), mix(D.paper, D.lamp, 0.2));
    if (s >= 4) { g.fillStyle = mix(D.paperD, D.ink, 0.25); for (let i = -1; i <= 1; i++) { const ox = Math.cos(a + 1.57) * i * s * 0.35, oy = Math.sin(a + 1.57) * i * s * 0.35 * 0.78;
      for (let j = -3; j <= 3; j++) { const t = j / 3 * s * 0.45; if (r() < 0.7) g.fillRect(Math.round(x + ox + Math.cos(a) * t), Math.round(y + oy + Math.sin(a) * t * 0.78), 1, 1); } } }
    if (s >= 10) { const rr = PX.rnd(seed + 5); for (let i = 0; i < s * 1.2; i++) { const u = (rr() * 2 - 1) * s * 0.7, v = (rr() * 2 - 1) * s * 0.45, l = s * (0.15 + rr() * 0.3);
        g.globalAlpha = 0.5; PX.line(g, x + Math.cos(a) * u - Math.sin(a) * v * 0.78, y + Math.sin(a) * u * 0.78 + Math.cos(a) * v * 0.78, x + Math.cos(a) * (u + l) - Math.sin(a) * v * 0.78, y + Math.sin(a) * (u + l) * 0.78 + Math.cos(a) * v * 0.78, rr() < 0.5 ? mix(D.paperD, D.lampD, 0.4) : D.cream); } g.globalAlpha = 1; }
    if (s >= 3) { g.fillStyle = D.cream; g.fillRect(Math.round(x - s * 0.4), Math.round(y - s * 0.45), Math.max(1, Math.round(s * 0.3)), 1); }
  };
  // glass dish rim ring (top-down) + lamp reflections, drawn over the agar
  const dishRim = (g, cx, cy, RD, t) => {
    g.globalAlpha = 0.55; g.fillStyle = D.glass;
    for (let i = 0; i < 360; i++) { const th = (i / 360) * TAU, lit = Math.cos(th - 3.93); if (lit < -0.2) continue;
      const rr = RD + 2, x = cx + Math.cos(th) * rr, y = cy + Math.sin(th) * rr; g.globalAlpha = 0.18 + 0.5 * Math.max(0, lit); g.fillRect(Math.round(x), Math.round(y), 1, 1); }
    g.globalAlpha = 0.25; g.fillStyle = D.cream;
    for (let i = 0; i < 360; i++) { const th = (i / 360) * TAU, lit = Math.cos(th - 0.79); if (lit < 0.5) continue; const x = cx + Math.cos(th) * (RD + 5), y = cy + Math.sin(th) * (RD + 5); g.fillRect(Math.round(x), Math.round(y), 1, 1); }
    g.globalAlpha = 1;
  };
  // the dish body baked: shadow on the bench, glass wall, agar (agar(x,y) returns rgb or null for default)
  const dishBake = (g, cx, cy, RD) => {
    const sh = g.createRadialGradient(cx + 10, cy + 14, RD * 0.9, cx + 10, cy + 14, RD + 22); sh.addColorStop(0, "rgba(0,0,0,0.55)"); sh.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = sh; g.fillRect(0, 0, 640, 360);
    g.fillStyle = mix(D.n2, D.teal[2], 0.25); disc(g, cx, cy, RD + 6);
    g.fillStyle = mix(D.n3, D.glass, 0.18); disc(g, cx, cy, RD + 4);
    g.fillStyle = mix(D.n1, D.teal[2], 0.15); disc(g, cx, cy, RD + 1);
  };

  // ---------- stylised Tokyo-area dataset (normalised: Tokyo at 0,0, y down, |u|,|v| <~ 1) ----------
  // Not real geography: a simplified bay-and-peninsula coast so the experiment reads at a glance.
  const LAND = [[-4, -4], [4, -4], [4, -0.78], [0.94, -0.46], [0.87, -0.12], [0.8, 0.16], [0.65, 0.4], [0.5, 0.58], [0.33, 0.76], [0.19, 0.93], [0.1, 0.84],
    [0.13, 0.63], [0.08, 0.47], [0.12, 0.32], [0.07, 0.17], [0.0, 0.11], [-0.08, 0.17], [-0.13, 0.31], [-0.1, 0.46], [-0.15, 0.64], [-0.22, 0.6], [-0.24, 0.5],
    [-0.42, 0.46], [-0.62, 0.5], [-0.82, 0.57], [-4, 0.63]];
  const COAST = LAND.slice(2, LAND.length); // open polyline along the shore
  const LIGHTS = [[-0.8, -0.12, 0.25], [-0.46, -0.68, 0.2], [-0.74, 0.33, 0.13], [0.56, -0.47, 0.12]];
  const inPoly = (pts, x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
  const inLight = (u, v, m) => LIGHTS.some(([x, y, r]) => Math.hypot(u - x, v - y) < r + (m || 0));
  const landOK = (u, v, m) => inPoly(LAND, u, v) && !inLight(u, v, m);
  const TOKYO = (() => {
    const r = PX.rnd(2010), C = [[0, 0]];
    for (let k = 0; k < 60000 && C.length < 36; k++) {
      const u = (r() * 2 - 1) * 0.97, v = (r() * 2 - 1) * 0.97, rr = Math.hypot(u, v); if (rr > 0.96 || !landOK(u, v, 0.05)) continue;
      let shore = false; for (let a = 0; a < 6; a++) if (!inPoly(LAND, u + Math.cos(a) * 0.05, v + Math.sin(a) * 0.05)) shore = true; if (shore) continue;
      const dm = 0.12 + 0.09 * rr; if (C.some(([x, y]) => Math.hypot(x - u, y - v) < dm)) continue; C.push([u, v]);
    }
    if (C.length !== 36) console.error("slime.js: city count", C.length);
    const n = C.length, dist = (i, j) => Math.hypot(C[i][0] - C[j][0], C[i][1] - C[j][1]);
    const clear = (i, j) => { for (let k = 1; k < 12; k++) { const u = lerp(C[i][0], C[j][0], k / 12), v = lerp(C[i][1], C[j][1], k / 12); if (!landOK(u, v, 0.0)) return false; } return true; };
    const cand = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (dist(i, j) < 0.9 && clear(i, j)) cand.push([i, j, dist(i, j)]);
    // relative neighbourhood graph (efficient web with some loops) + MST guarantee
    const rng = cand.filter(([i, j, dd]) => { if (dd > 0.62) return false; for (let k = 0; k < n; k++) if (k !== i && k !== j && Math.max(dist(i, k), dist(j, k)) < dd) return false; return true; });
    const par = [...Array(n).keys()], fd = (x) => (par[x] === x ? x : (par[x] = fd(par[x])));
    const E = new Map(), ek = (i, j) => (i < j ? i * 100 + j : j * 100 + i);
    for (const [i, j, dd] of [...cand].sort((a, b) => a[2] - b[2])) if (fd(i) !== fd(j)) { par[fd(i)] = fd(j); E.set(ek(i, j), [i, j]); }
    for (const [i, j] of rng) E.set(ek(i, j), [i, j]);
    // Gabriel extras (denser mesh for the model sim) = edges with no city inside their diameter circle
    const gab = cand.filter(([i, j, dd]) => { if (dd > 0.62) return false; const mx = (C[i][0] + C[j][0]) / 2, my = (C[i][1] + C[j][1]) / 2; for (let k = 0; k < n; k++) if (k !== i && k !== j && Math.hypot(C[k][0] - mx, C[k][1] - my) < dd / 2) return false; return true; }).map(([i, j]) => [i, j]);
    const edges = [...E.values()];
    // usage: how many city->Tokyo shortest paths run along each edge (trunk lines thicker)
    const adj = [...Array(n)].map(() => []); edges.forEach(([i, j], e) => { adj[i].push([j, e]); adj[j].push([i, e]); });
    const dT = Array(n).fill(1e9), pe = Array(n).fill(-1); dT[0] = 0; const Q = [0];
    while (Q.length) { Q.sort((a, b) => dT[a] - dT[b]); const i = Q.shift(); for (const [j, e] of adj[i]) { const nd = dT[i] + dist(i, j); if (nd < dT[j]) { dT[j] = nd; pe[j] = e; Q.push(j); } } }
    const use = Array(edges.length).fill(0);
    for (let i = 1; i < n; i++) { let k = i; while (k !== 0 && pe[k] >= 0) { const e = pe[k]; use[e]++; k = edges[e][0] === k ? edges[e][1] : edges[e][0]; } }
    // organic route of each edge (normalised), oriented from the end nearer to Tokyo
    const routes = edges.map(([i, j], e) => {
      if (dT[j] < dT[i]) [i, j] = [j, i];
      const [ax, ay] = C[i], [bx, by] = C[j], L = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / L, ny = (bx - ax) / L, pts = [];
      for (let k = 0; k <= 5; k++) { const f = k / 5, w = k === 0 || k === 5 ? 0 : (fbm(e * 3.1 + f * 2.2, 5.5, 77) - 0.5) * 0.24 * L; pts.push([lerp(ax, bx, f) + nx * w, lerp(ay, by, f) + ny * w]); }
      return { a: i, b: j, pts: chaikin(pts, 2), use: use[e], dA: dT[i] };
    });
    return { C, edges, routes, gab, dT, adj, use };
  })();

  // shared drawing of a light patch (soft projected light, dithered core)
  const lightPatch = (g, x, y, r, a, seed) => {
    if (a <= 0) return;
    PX.glow(g, x, y, r * 1.7, D.lamp, 0.12 * a);
    g.fillStyle = D.cream;
    for (let k = 0; k < 5; k++) { g.globalAlpha = a * 0.07; const rr = r * (1.05 - k * 0.17); for (let yy = -Math.ceil(rr); yy <= rr; yy++) { const w = Math.sqrt(Math.max(0, rr * rr - yy * yy)) * (1 + 0.06 * Math.sin(yy * 0.4 + seed + k)); g.fillRect(Math.round(x - w), Math.round(y + yy), Math.round(2 * w), 1); } }
    const q = PX.rnd(seed); g.globalAlpha = a * 0.18; for (let k = 0; k < r * 5; k++) { const th = q() * TAU, d2 = r * (0.9 + q() * 0.25); g.fillRect(Math.round(x + Math.cos(th) * d2), Math.round(y + Math.sin(th) * d2), 1, 1); }
    g.globalAlpha = 1;
  };
  // small dial clock with no numerals; turns = hour-hand turns
  const dial = (g, x, y, rad, turns, a) => {
    g.globalAlpha = a; g.fillStyle = mix(D.n0, D.n1, 0.5); disc(g, x + 1, y + 2, rad + 2);
    g.fillStyle = D.lampD; disc(g, x, y, rad + 2); g.fillStyle = mix(D.lampD, D.n2, 0.5); disc(g, x, y, rad + 1);
    g.fillStyle = mix(D.paper, D.n4, 0.25); disc(g, x, y, rad);
    // swept sector of the day
    g.globalAlpha = a * 0.3; g.fillStyle = AM[1];
    for (let k = 0; k < 160 * Math.min(1, turns / 2); k++) { const q = -Math.PI / 2 + (k / 160) * TAU; for (let rr = 2; rr < rad - 1; rr += 1) g.fillRect(Math.round(x + Math.cos(q) * rr), Math.round(y + Math.sin(q) * rr), 1, 1); }
    g.globalAlpha = a;
    for (let i = 0; i < 12; i++) { const th = (i / 12) * TAU; R(g, x + Math.cos(th) * (rad - 2.5), y + Math.sin(th) * (rad - 2.5), i % 3 ? 1 : 2, i % 3 ? 1 : 2, D.ink); }
    const th = turns * TAU - Math.PI / 2, tm = turns * 12 * TAU - Math.PI / 2;
    PX.line(g, x, y, x + Math.cos(tm) * (rad - 3), y + Math.sin(tm) * (rad - 3), mix(D.ink, D.n4, 0.3));
    PX.line(g, x, y, x + Math.cos(th) * (rad - 6), y + Math.sin(th) * (rad - 6), D.ink); PX.line(g, x + 1, y, x + 1 + Math.cos(th) * (rad - 6), y + Math.sin(th) * (rad - 6), D.ink);
    g.fillStyle = D.ink; disc(g, x, y, 1.2); g.globalAlpha = 1;
  };

  // ======================================================================================
  // oat_map (16.0): wet black-agar dish on a light table over a faint printed coast; 36 oats, slime from TOKYO,
  // light patches (mountains/lakes) it avoids, then a rail-like web grows in a day.
  // o.oats [0.5, 5.0], o.slime 5.5, o.lights 7.0, o.grow 8.5 (null = no growth), o.state "net", o.build (time): finale self-drawing
  K.oat_map = (o) => {
    const cx = 320, cy = 180, RD = 164, S = 146, TK = TOKYO, T = (u, v) => [cx + u * S, cy + v * S];
    const okp = (x, y) => Math.hypot(x - cx, y - cy) < RD - 5 && landOK((x - cx) / S, (y - cy) / S, 0.02);
    const nt = mknet({ seed: 23, box: [cx - RD, cy - RD, RD * 2, RD * 2], sp: 5, ok: okp, wall: true, src: [T(0, 0)], wj: 0.8, lobe: 12, cost: (x, y) => 1.6 * fbm(x / 26, y / 26, 31) });
    let nmax = 1; for (const a of nt.N) nmax = Math.max(nmax, a.n);
    for (const a of nt.N) a.rk = 0.8 * Math.min(1, Math.sqrt(a.n / nmax) * 1.6) + 0.12 * a.h;
    const routes = TK.routes.map((rt) => { const pts = rt.pts.map(([u, v]) => { const [x, y] = T(u, v), nd = nt.N[nt.near(x, y)]; return [x, y, nd.d < 1e8 ? nd.d : 1e4]; });
      for (let i = 1; i < pts.length; i++) pts[i][2] = Math.max(pts[i][2], pts[i - 1][2] + 0.5); return { ...rt, P: pts }; });
    const order = TK.C.map((c, i) => i).sort((a, b) => Math.hypot(...TK.C[a]) - Math.hypot(...TK.C[b]));
    const oatAt = []; order.forEach((ci, k) => (oatAt[ci] = k));
    const cityD = TK.C.map(([u, v]) => nt.N[nt.near(cx + u * S, cy + v * S)].d);
    const bOrder = routes.map((r, i) => i).sort((a, b) => routes[a].dA - routes[b].dA || routes[a].P[routes[a].P.length - 1][2] - routes[b].P[routes[b].P.length - 1][2]);
    const bRank = []; bOrder.forEach((ri, k) => (bRank[ri] = k));
    // static art: light table + printed map paper + dish
    const paperC = hx(mix(D.paperD, D.n2, 0.72)), paperL = hx(mix(D.paperD, D.n4, 0.35)), ink = hx(mix(D.ink, D.n4, 0.35)), frame0 = hx(D.n1), frame1 = hx(D.n3);
    const coastPix = new Set(); for (let i = 0; i + 1 < COAST.length; i++) { const [a, b] = [T(...COAST[i]), T(...COAST[i + 1])], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])); for (let k = 0; k <= n; k++) coastPix.add(Math.round(lerp(a[0], b[0], k / n)) + Math.round(lerp(a[1], b[1], k / n)) * 640); }
    const base = pix(640, 360, (x, y) => {
      const inFrame = x > 18 && x < 622 && y > 10 && y < 350;
      if (!inFrame) { const n = hash(x, y, 4) * 0.15; return mixv(frame0, frame1, 0.2 + n); }
      const L = clamp(1 - Math.hypot(x - 320, y - 180) / 420, 0, 1), u = (x - cx) / S, v = (y - cy) / S;
      let c = mixv(paperC, paperL, L * 0.55 + fbm(x / 30, y / 30, 2) * 0.12);
      if (!inPoly(LAND, u, v)) { c = mixv(c, hx(D.teal[2]), 0.18); if ((x + y) % 4 === 0) c = mixv(c, ink, 0.12); }
      if (coastPix.has(x + y * 640)) c = mixv(c, ink, 0.55);
      if (x === 19 || y === 11) c = mixv(c, hx(D.cream), 0.3);
      return c;
    });
    const agar0 = hx(D.n0), agar1 = hx(mix(D.n1, D.teal[2], 0.15)), lineC = hx(mix(D.n3, D.paperD, 0.15));
    const art = bake(640, 360, (g) => {
      g.drawImage(base, 0, 0);
      R(g, 500, 300, 118, 12, mix(D.paper, D.n4, 0.3)); R(g, 500, 300, 118, 1, D.cream); for (let i = 0; i < 24; i++) R(g, 503 + i * 5, 300, 1, i % 2 ? 2 : 4, D.ink);
      g.save(); g.translate(40, 70); g.rotate(-0.9); R(g, 0, 0, 70, 4, mix(D.lampD, D.n3, 0.2)); R(g, 0, 0, 70, 1, D.lamp); R(g, 70, 0, 6, 4, D.paper); R(g, 76, 1, 3, 2, D.n2); g.restore();
      dishBake(g, cx, cy, RD);
      g.drawImage(pix(640, 360, (x, y) => { const rr = Math.hypot(x - cx, y - cy); if (rr > RD) return null;
        let c = mixv(agar0, agar1, fbm(x / 18, y / 18, 6) * 0.6 + (1 - rr / RD) * 0.25);
        if (coastPix.has(x + y * 640)) c = mixv(c, lineC, 0.5);
        if (rr > RD - 2) c = mixv(c, hx(D.glass), 0.25); return c; }), 0, 0);
    });
    const mask = pix(640, 360, (x, y) => (Math.hypot(x - cx, y - cy) < RD - 2 ? [255, 255, 255] : null));
    const fan = mkfan(nt, { box: [cx - RD, cy - RD, RD * 2, RD * 2], ok: okp, lobe: 14, cell: 7, seed: 5 });

    return (g, t, d, c) => {
      const build = typeof o.build === "number", net = o.state === "net", pre = build || net, k = d / 16;
      const oa = o.oats || (pre ? [-2, -1] : [0.5 * k, 5.0 * k]), ts = o.slime === undefined ? (pre ? -1 : 5.5 * k) : o.slime;
      const tl = o.lights === undefined ? (pre ? -1 : 7.0 * k) : o.lights, G = pre ? null : o.grow === undefined ? 8.5 * k : o.grow, gk = Math.min(1, k);
      g.drawImage(art, 0, 0);
      PX.glow(g, 320, 180, 260, D.lamp, 0.06);
      const la = P(t, tl, 0.9, "io");
      const lg = layer();
      let F = -1, rf = 0;
      if (net) { F = 1e7; rf = 1; } else if (G !== null && t >= G) { F = P(t, G, 3.6 * gk, "io") * (nt.dmax + 40); rf = P(t, G + 2.2 * gk, 3.6 * gk, "io"); }
      const mT = (a) => 1 - clamp((rf - a.rk) / 0.25, 0, 1);
      if (F > 0 && rf < 1) {
        drawFan(lg, nt, fan, F, { W: 34, lace: 0.3, m: mT });
        tubes(lg, netSegs(nt, { F, T: 5, r0: 0.3, rk: 0.24, rmax: 2.4, G: 60, m: mT }), { t, sh: 0.45, wob: 0.25, pul: { a: 0.1, k: 0.1, w: 3 } });
      }
      const segs = [];
      routes.forEach((rt, ri) => {
        const full = Math.min(4.2, 1.1 + 0.55 * Math.sqrt(rt.use + 1));
        let rev = 1, rr;
        if (build) { const n = routes.length, span = Math.max(1, d - 0.8 - o.build); rev = clamp((t - o.build - (bRank[ri] * span) / n) / ((span / n) * 1.6), 0, 1); rr = full * (0.55 + 0.45 * rev); if (rev <= 0) return; }
        else { if (F <= 0) return; rr = full * (0.35 + 0.65 * rf); }
        const Pp = rt.P, Ln = Pp.length - 1;
        for (let i = 0; i < Ln; i++) {
          const A = Pp[i], B = Pp[i + 1]; let k = 1;
          if (build) { const f0 = i / Ln, f1 = (i + 1) / Ln; if (rev <= f0) break; k = clamp((rev - f0) / (f1 - f0), 0, 1); }
          else { if (A[2] >= F) break; if (B[2] > F) k = (F - A[2]) / (B[2] - A[2]); }
          const ramp = build ? 1 : clamp((F - A[2]) / 60, 0.3, 1);
          segs.push([A[0], A[1], rr * ramp, A[2], lerp(A[0], B[0], k), lerp(A[1], B[1], k), rr * ramp, lerp(A[2], B[2], k), ri]);
        }
      });
      tubes(lg, segs, { t, sh: 0.5, wob: 0.2, pul: { a: 0.12, k: 0.08, w: 2.6 }, flow: { v: 18, lam: 30, col: D.lamp, min: 1.6 } });
      const [tx, ty] = T(0, 0), ib = P(t, ts, 0.6, "out");
      if (ib > 0) { lg.fillStyle = AM[2]; disc(lg, tx, ty, 6 * ib + 0.5); lg.fillStyle = AM[1]; disc(lg, tx, ty, 5 * ib); lg.fillStyle = AM[0]; disc(lg, tx - 2, ty - 2, 1.6 * ib); }
      masked(g, lg, mask);
      // oats (engulfed ones get a slime coat)
      TK.C.forEach(([u, v], i) => {
        const [x, y] = T(u, v), k = P(t, oa[0] + (oatAt[i] / 36) * (oa[1] - oa[0]), 0.25, "back"); if (k <= 0 || (i === 0 && ib > 0.3)) return; // the inoculum sits on Tokyo's oat
        oat(g, x, y, 3.2 * k + (i === 0 ? 0.6 : 0), hash(i, 1, 2) * 3, 100 + i);
        const cov = net ? 1 : build ? clamp((t - o.build) * 2, 0, 1) : F > 0 ? clamp((F - cityD[i]) / 25, 0, 1) : 0;
        if (cov > 0) { g.globalAlpha = 0.55 * cov; g.fillStyle = AM[1]; disc(g, x, y, 3.2); g.globalAlpha = 0.9 * cov; g.fillStyle = AM[0]; g.fillRect(Math.round(x - 1), Math.round(y - 2), 2, 1); g.globalAlpha = 1; }
      });
      LIGHTS.forEach(([u, v, r], i) => { const [x, y] = T(u, v); lightPatch(g, x, y, r * S, la * (0.92 + 0.08 * Math.sin(t * 1.3 + i)), 50 + i); });
      dishRim(g, cx, cy, RD, t);
      PX.par(g, c, 1.12, () => { PX.glow(g, 236, 92, 44, D.cream, 0.06); g.globalAlpha = 0.2; g.fillStyle = D.cream; for (let i = 0; i < 70; i++) { const th = 3.45 + i * 0.012; g.fillRect(Math.round(cx + Math.cos(th) * (RD - 8)), Math.round(cy + Math.sin(th) * (RD - 8)), 2, 1); } g.globalAlpha = 1; });
      // labels: TOKYO, 36, the day clock
      const tka = P(t, ts, 0.5) * (G !== null ? 1 - P(t, G + 1.5 * gk, 0.6, "io") : pre ? 0 : 1);
      if (tka > 0) { g.globalAlpha = tka; PX.otext(g, "TOKYO", tx, ty - 17, { col: D.cream, align: "center" }); R(g, tx, ty - 8, 1, 3, D.cream); g.globalAlpha = 1; }
      const ca = pre ? 0 : P(t, oa[1] + 0.2, 0.5) * (G !== null ? 1 - P(t, G + 6.2 * gk, 0.6, "io") : 1);
      if (ca > 0) { g.globalAlpha = ca; R(g, 54, 296, 46, 26, mix(D.paper, D.n4, 0.2)); R(g, 54, 296, 46, 1, D.cream); R(g, 55, 322, 46, 1, D.n1); oat(g, 66, 309, 3.5, 0.5, 9); PX.text(g, "36", 76, 305, { col: D.ink }); g.globalAlpha = 1; }
      if (G !== null && t > G - 0.4) {
        const ka = P(t, G - 0.4, 0.4) * (1 - P(t, d - 0.35, 0.3, "in"));
        dial(g, 566, 52, 18, 2 * P(t, G, 6 * gk, "io"), ka);
        g.globalAlpha = ka; PX.otext(g, "1 DAY", 566, 76, { col: D.cream, align: "center" }); g.globalAlpha = 1;
      }
      PX.particles(g, 61, 18, t, [60, 20, 520, 320], { vy: -2, vx: 1, col: D.lamp, a: 0.25 });
      PX.vignette(g, 0.5);
    };
  };

  // ======================================================================================
  // maze_solve (13.0): agar maze in a petri dish; slime floods every corridor, retracts from dead ends, one tube remains.
  // o.start (0.5) inoculum, o.spread [1.0, 5.5], o.retract [6.5, 10.5], o.state "end" = start finished
  K.maze_solve = (o) => {
    const MCo = 10, MRo = 8, CS = 24, WT = 6, cx = 320, cy = 182, RD = 168;
    const mx0 = cx - (MCo * CS) / 2, my0 = cy - (MRo * CS) / 2;
    // perfect maze (seeded DFS) + a few loops so there is a real choice of route
    const r = PX.rnd(41), open = new Set(), key = (a, b) => (a < b ? a + "-" + b : b + "-" + a), isOpen = (a, b) => open.has(key(a, b));
    { const vis = new Uint8Array(MCo * MRo), st = [0]; vis[0] = 1;
      while (st.length) { const c = st[st.length - 1], ci = c % MCo, cj = (c / MCo) | 0, nb = [];
        if (ci > 0 && !vis[c - 1]) nb.push(c - 1); if (ci < MCo - 1 && !vis[c + 1]) nb.push(c + 1); if (cj > 0 && !vis[c - MCo]) nb.push(c - MCo); if (cj < MRo - 1 && !vis[c + MCo]) nb.push(c + MCo);
        if (!nb.length) { st.pop(); continue; } const n = nb[Math.floor(r() * nb.length)]; vis[n] = 1; open.add(key(c, n)); st.push(n); }
      for (let k = 0; k < 4; k++) { const ci = 2 + Math.floor(r() * (MCo - 4)), cj = 1 + Math.floor(r() * (MRo - 2)), c = cj * MCo + ci; open.add(key(c, r() < 0.5 ? c + 1 : c + MCo)); } }
    const h = WT / 2;
    const corr = (x, y) => {
      const lx = x - mx0, ly = y - my0; if (lx < h || ly < h || lx > MCo * CS - h || ly > MRo * CS - h) return false;
      const ci = Math.floor(lx / CS), cj = Math.floor(ly / CS), fx = lx - ci * CS, fy = ly - cj * CS, inX = fx >= h && fx <= CS - h, inY = fy >= h && fy <= CS - h;
      if (inX && inY) return true;
      if (inY) { const nb = fx < h ? ci - 1 : ci + 1; return nb >= 0 && nb < MCo && isOpen(cj * MCo + ci, cj * MCo + nb); }
      if (inX) { const nb = fy < h ? cj - 1 : cj + 1; return nb >= 0 && nb < MRo && isOpen(cj * MCo + ci, nb * MCo + ci); }
      return false;
    };
    const S0 = [mx0 + CS / 2, my0 + CS / 2], OAT = [mx0 + (MCo - 0.5) * CS, my0 + (MRo - 0.5) * CS];
    const nt = mknet({ seed: 5, box: [mx0, my0, MCo * CS, MRo * CS], sp: 4, ok: corr, wall: true, src: [S0], wj: 0.6, lobe: 7 });
    const N = nt.N, goal = nt.near(OAT[0], OAT[1]);
    // the route the slime keeps = tree path from the oat back to the start (Dijkstra = shortest)
    const keep = new Set(), path = []; for (let i = goal; i >= 0; i = N[i].p) { keep.add(i); path.push([N[i].x, N[i].y, N[i].d]); }
    path.reverse(); const pathS = chaikin(path, 3);
    nt.dijk([...keep], "dp", false); let dpm = 1; for (const a of N) if (a.dp < 1e8) dpm = Math.max(dpm, a.dp);
    for (const a of N) a.rk = 0.8 * (1 - Math.min(1, a.dp / dpm)) + 0.05 * a.h;
    const dReach = N[goal].d; let dAll = 0; for (const a of N) if (a.d < 1e8) dAll = Math.max(dAll, a.d);

    // static art: bench + dish + maze relief
    const bench = benchTex(640, 360, 0, 0, 90, -60, 11);
    const agL = hx(mix(D.n4, D.paperD, 0.3)), agD = hx(mix(D.n2, D.lampD, 0.14)), wet = hx(D.n1), wetD = hx(D.n0), hiC = hx(mix(D.n6, D.paper, 0.3));
    const dish = bake(640, 360, (g) => {
      g.drawImage(bench, 0, 0);
      // props on the bench: notebook corner, pencil, the dish lid at the right edge
      g.save(); g.translate(-30, 300); g.rotate(-0.12); R(g, 0, 0, 150, 90, mix(D.paperD, D.n2, 0.55)); R(g, 0, 0, 150, 1, mix(D.paper, D.n3, 0.4));
      for (let i = 1; i < 6; i++) R(g, 8, 10 + i * 9, 130, 1, mix(D.paperD, D.teal[2], 0.35)); g.restore();
      g.save(); g.translate(70, 64); g.rotate(0.5); R(g, 0, 0, 74, 4, mix(D.lampD, D.n2, 0.35)); R(g, 0, 0, 74, 1, mix(D.lamp, D.n3, 0.35)); R(g, 74, 0, 6, 4, mix(D.paper, D.n3, 0.4)); R(g, -8, 1, 8, 2, D.n2); g.restore();
      g.globalAlpha = 0.5; g.fillStyle = mix(D.n3, D.glass, 0.2); disc(g, 650, 70, 70); g.fillStyle = mix(D.n2, D.n3, 0.5); disc(g, 650, 70, 66); g.globalAlpha = 1;
      dishBake(g, cx, cy, RD);
      const tex = pix(640, 360, (x, y) => {
        const dx = x - cx, dy = y - cy, rr = Math.hypot(dx, dy); if (rr > RD) return null;
        const L = clamp(1 - Math.hypot(x - 150, y - 40) / 420, 0, 1), n = fbm(x / 13, y / 13, 4) * 0.35 + hash(x, y, 9) * 0.08;
        if (corr(x, y)) { // wet corridor: dark, shadowed under the wall on the lamp side
          const shd = !corr(x - 2, y - 2) || !corr(x - 1, y - 1); let c = mixv(wet, agD, 0.15 + n * 0.5 + L * 0.2);
          if (shd) c = mixv(c, wetD, 0.7); if (hash(x, y, 21) < 0.004 && !shd) c = mixv(c, hiC, 0.35); return c; }
        let c = mixv(agD, agL, clamp(L * 0.75 + n - 0.1, 0, 1)); // raised agar
        if (corr(x + 1, y + 1) || corr(x + 1, y) || corr(x, y + 1)) c = mixv(c, wetD, 0.45);
        else if (corr(x - 1, y - 1) || corr(x - 1, y) || corr(x, y - 1)) c = mixv(c, hiC, 0.55);
        if (rr > RD - 3) c = mixv(c, hiC, 0.35);
        return c;
      });
      g.drawImage(tex, 0, 0);
    });
    const mask = pix(640, 360, (x, y) => (corr(x, y) ? [255, 255, 255] : null));
    const fan = mkfan(nt, { box: [mx0, my0, MCo * CS, MRo * CS], ok: corr, lobe: 8, cell: 6, seed: 7 });

    return (g, t, d, c) => {
      const k = d / 13, t0 = dflt(o.start, 0.5, k), sp = dflt(o.spread, [1.0, 5.5], k), rt0 = dflt(o.retract, [6.5, 10.5], k), end = o.state === "end";
      const sp1 = Math.min(sp[1], d), F = end ? 1e7 : P(t, sp[0], sp1 - sp[0], "io") * (dAll + 40);
      const rt = end ? 1 : P(t, rt0[0], rt0[1] - rt0[0], "io");
      g.drawImage(dish, 0, 0);
      // lamp warmth over the scene
      PX.glow(g, 150, 40, 330, D.lampD, 0.16);
      const mN = (a) => (keep.has(a.id) ? 1 : 1 - clamp((rt - a.rk) / 0.16, 0, 1));
      // inoculum blob
      const ib = end ? 1 : P(t, t0, 0.5, "out");
      if (ib > 0) { g.globalAlpha = ib; g.fillStyle = AM[2]; disc(g, S0[0], S0[1], 6); g.fillStyle = AM[1]; disc(g, S0[0], S0[1], 5); g.fillStyle = AM[0]; disc(g, S0[0] - 2, S0[1] - 2, 1.5); g.globalAlpha = 1; }
      if (F > 0) {
        const lg = layer();
        drawFan(lg, nt, fan, F, { ghost: 0.1, W: 40, lace: 0.45, m: (a) => (keep.has(a.id) ? 1 - clamp(rt * 1.4, 0, 1) : mN(a)) });
        const segs = netSegs(nt, { F, T: 3, r0: 0.4, rk: 0.3, rmax: 2.6, G: 50, m: mN, skip: (a) => keep.has(a.id) });
        // the route: smoothed, thickens as the rest retracts
        for (let i = 0; i + 1 < pathS.length; i++) { const A = pathS[i], B = pathS[i + 1]; if (A[2] >= F) break;
          const k = B[2] > F ? (F - A[2]) / (B[2] - A[2]) : 1, rr = (1.6 + 2.6 * rt) * clamp((F - A[2]) / 50, 0.35, 1);
          segs.push([A[0], A[1], rr, A[2], lerp(A[0], B[0], k), lerp(A[1], B[1], k), rr, lerp(A[2], B[2], k), 0]); }
        tubes(lg, segs, { t, sh: 0.5, pul: { a: 0.08 + 0.12 * rt, k: 0.09, w: 3.2 }, wob: 0.25, flow: { v: 16 + 10 * rt, lam: 26, col: D.lamp } });
        masked(g, lg, mask);
      }
      // oat flake at the exit (slime gathers over it at the end)
      oat(g, OAT[0] + 1, OAT[1] + 1, 6, 0.4, 3);
      const arrive = end ? 1 : clamp((F - dReach) / 30, 0, 1);
      if (arrive > 0) { g.globalAlpha = 0.55 * arrive; g.fillStyle = AM[1]; disc(g, OAT[0] - 2, OAT[1] - 1, 4 + 2 * arrive); g.globalAlpha = 1; }
      dishRim(g, cx, cy, RD, t);
      // lamp reflection on the lid (moves a touch more than the dish: glass sits above)
      PX.par(g, c, 1.15, () => {
        PX.glow(g, 232, 100, 40, D.cream, 0.07);
        g.globalAlpha = 0.22; g.fillStyle = D.cream; for (let i = 0; i < 60; i++) { const th = 3.5 + i * 0.012; g.fillRect(Math.round(cx + Math.cos(th) * (RD - 9)), Math.round(cy + Math.sin(th) * (RD - 9)), 2, 1); }
        g.globalAlpha = 1;
      });
      PX.particles(g, 31, 22, t, [40, 0, 300, 200], { vy: -2, vx: 1.5, col: D.lamp, a: 0.35 });
      PX.vignette(g, 0.55);
    };
  };
  // routes of the Tokyo slime web as tube segments in a frame (x0, y0, scale S); s = distance from Tokyo (pulses flow outward)
  const webSegs = (x0, y0, S, rmul, rev) => {
    const segs = [];
    TOKYO.routes.forEach((rt, ri) => {
      const r = Math.min(3.4, 0.8 + 0.42 * Math.sqrt(rt.use + 1)) * rmul; let s = rt.dA * S; const P2 = rt.pts, Ln = P2.length - 1;
      for (let i = 0; i < Ln; i++) {
        const [au, av] = P2[i], [bu, bv] = P2[i + 1], ax = x0 + au * S, ay = y0 + av * S, bx = x0 + bu * S, by = y0 + bv * S, L = Math.hypot(bx - ax, by - ay);
        let k = 1; if (rev) { const rv = rev(ri), f0 = i / Ln; if (rv <= f0) break; k = clamp((rv - f0) * Ln, 0, 1); }
        segs.push([ax, ay, r, s, lerp(ax, bx, k), lerp(ay, by, k), r, s + L * k, ri]); s += L;
      }
    });
    return segs;
  };
  // dark wood table with lamp falloff (baked)
  const woodTex = (w, h, lx, ly, seed) => {
    const w0 = hx(mix(D.n1, D.lampD, 0.12)), w1 = hx(mix(D.n3, D.lampD, 0.3)), gr = hx(mix(D.n0, D.lampD, 0.08));
    return pix(w, h, (x, y) => {
      const L = clamp(1 - Math.hypot(x - lx, y - ly) / 520, 0, 1), plank = Math.floor((y + 3) / 46), py = (y + 3) % 46;
      const g2 = fbm(x / 90 + plank * 7, y / 3.5, seed + plank) * 0.6 + 0.4 * Math.sin(x / 23 + fbm(x / 40, y / 8, seed) * 6 + plank);
      let c = mixv(w0, w1, clamp(L * L * 1.1 + g2 * 0.12, 0, 1)); if (py === 0) c = mixv(c, gr, 0.8); if (py === 1) c = mixv(c, w1, 0.25 * L);
      return c;
    });
  };

  // ======================================================================================
  // rail_compare (12.0): map table. Left the slime web in its dish, right a schematic rail map of the same area.
  // o.overlay 2.0 a tracing of the web slides over the map; bars SLIME vs RAIL fill: o.m1 5.5 COST, o.m2 7.5 EFFICIENCY,
  // o.m3 9.0 SURVIVES A BROKEN LINK; o.cut 9.0 one rail link breaks (spark) and traffic reroutes.
  K.rail_compare = (o) => {
    const TK = TOKYO, C = TK.C, S = 88, DX = 160, DY = 132, MX = 470, MY = 132, RD = 104;
    const key = (i, j) => (i < j ? i * 100 + j : j * 100 + i);
    // rail graph = slime graph with a few differences (nearly the same web)
    const r = PX.rnd(77), have = new Set(TK.edges.map(([i, j]) => key(i, j)));
    const bridge = (e) => { const [a, b] = TK.edges[e], seen = new Set([a]), st = [a];
      while (st.length) { const x = st.pop(); for (const [y, f] of TK.adj[x]) if (f !== e && !seen.has(y)) { seen.add(y); st.push(y); } } return !seen.has(b); };
    const drop = new Set(); for (let k = 0; k < 40 && drop.size < 2; k++) { const e = Math.floor(r() * TK.edges.length); if (TK.use[e] <= 2 && !bridge(e)) drop.add(e); }
    const extra = TK.gab.filter(([i, j]) => !have.has(key(i, j))).slice(0, 2);
    const rail = TK.edges.filter((e, k) => !drop.has(k)).concat(extra);
    // the link that breaks: a busy-ish non-bridge edge kept in both graphs, plus its detour (BFS without it)
    let cutE = -1, best = -1; TK.edges.forEach((e, k) => { if (drop.has(k) || bridge(k)) return; const L = Math.hypot(C[e[0]][0] - C[e[1]][0], C[e[0]][1] - C[e[1]][1]), sc = L * Math.min(3, TK.use[k]) * (C[e[0]][0] + C[e[1]][0] > 0 ? 1.4 : 1); if (sc > best) { best = sc; cutE = k; } });
    const [ca, cb] = TK.edges[cutE];
    const detour = (() => { const prev = Array(C.length).fill(-1), q = [ca], seen = new Set([ca]);
      while (q.length) { const x = q.shift(); if (x === cb) break; for (const [i, j] of rail) { const y = i === x ? j : j === x ? i : -1; if (y < 0 || seen.has(y) || (x === ca && y === cb) || (x === cb && y === ca)) continue; seen.add(y); prev[y] = x; q.push(y); } }
      const p = []; for (let x = cb; x >= 0; x = prev[x]) p.push(x); return p.reverse(); })();
    // muted line colours by direction from Tokyo
    const LC = [D.steel[1], D.rust[1], D.moss[1], D.teal[1], D.plum[1], D.lampD].map((cc) => mix(cc, D.n5, 0.2));
    const lineCol = ([i, j]) => { const mx = (C[i][0] + C[j][0]) / 2, my = (C[i][1] + C[j][1]) / 2; return LC[Math.floor(fm(Math.atan2(my, mx) + 0.3, TAU) / (TAU / 6)) % 6]; };
    const wood = woodTex(700, 400, 60, -20, 5);
    const art = bake(640, 360, (g) => {
      g.drawImage(wood, -30, -20);
      // map paper (shadow, sheet, faint coast print, pins)
      R(g, 336, 18, 270, 232, "rgba(0,0,0,0.4)");
      g.drawImage(pix(266, 228, (x, y) => { const L = clamp(1 - Math.hypot(x + 330 - 120, y + 14 + 40) / 620, 0, 1), n = fbm(x / 20, y / 20, 3) * 0.08 + hash(x, y, 1) * 0.04;
        let cc = mixv(hx(mix(D.paperD, D.n3, 0.5)), hx(mix(D.paper, D.paperD, 0.4)), clamp(L * 0.85 + n, 0, 1)); const u = (x + 332 - MX) / S, v = (y + 14 - MY) / S;
        if (!inPoly(LAND, u, v)) cc = mixv(cc, hx(D.teal[0]), 0.16); return cc; }), 332, 14);
      for (let i = 0; i + 1 < COAST.length; i++) { const [au, av] = COAST[i], [bu, bv] = COAST[i + 1]; const ax = MX + au * S, ay = MY + av * S, bx = MX + bu * S, by = MY + bv * S;
        if (Math.max(ax, bx) < 332 || Math.min(ax, bx) > 598 || Math.max(ay, by) < 14 || Math.min(ay, by) > 242) continue;
        g.save(); g.beginPath(); g.rect(332, 14, 266, 228); g.clip(); PX.line(g, ax, ay, bx, by, mix(D.teal[2], D.paperD, 0.45)); g.restore(); }
      R(g, 332, 14, 266, 1, D.cream); R(g, 332, 241, 266, 1, mix(D.paperD, D.n3, 0.5));
      for (const [px, py] of [[338, 20], [592, 20], [338, 235], [592, 235]]) { g.fillStyle = D.rust[2]; disc(g, px, py, 2); g.fillStyle = D.rust[0]; g.fillRect(px - 1, py - 1, 1, 1); }
      // rail lines (schematic) + stations
      for (const e of rail) { const [i, j] = e, ax = MX + C[i][0] * S, ay = MY + C[i][1] * S, bx = MX + C[j][0] * S, by = MY + C[j][1] * S, col = lineCol(e);
        for (const [ox, oy] of [[0, 0], [1, 0], [0, 1], [1, 1], [-1, 0], [0, -1]]) PX.line(g, ax + ox, ay + oy, bx + ox, by + oy, col); }
      C.forEach(([u, v], i) => { const x = MX + u * S, y = MY + v * S; g.fillStyle = D.ink; disc(g, x + 0.5, y + 0.5, i ? 2.2 : 3.2); g.fillStyle = D.cream; disc(g, x + 0.5, y + 0.5, i ? 1.2 : 2.2); });
      // dish
      dishBake(g, DX, DY, RD);
      g.drawImage(pix(640, 360, (x, y) => { const rr = Math.hypot(x - DX, y - DY); if (rr > RD) return null; let cc = mixv(hx(D.n0), hx(mix(D.n1, D.teal[2], 0.15)), fbm(x / 16, y / 16, 8) * 0.6 + (1 - rr / RD) * 0.2);
        if (rr > RD - 2) cc = mixv(cc, hx(D.glass), 0.25); return cc; }), 0, 0);
      // brass meter plaque
      R(g, 22, 254, 596, 86, "rgba(0,0,0,0.45)");
      R(g, 20, 250, 596, 86, mix(D.n2, D.lampD, 0.18)); R(g, 20, 250, 596, 1, mix(D.lampD, D.n3, 0.3)); R(g, 20, 335, 596, 1, D.n0);
      for (let i = 0; i < 3; i++) { const x0 = 30 + i * 196; R(g, x0, 256, 186, 74, mix(D.n1, D.lampD, 0.08)); R(g, x0, 256, 186, 1, D.n0); R(g, x0, 329, 186, 1, mix(D.lampD, D.n3, 0.35));
        for (const yy of [282, 302]) { R(g, x0 + 44, yy, 132, 9, D.n0); R(g, x0 + 44, yy + 9, 132, 1, mix(D.lampD, D.n3, 0.4)); }
        for (const [sx, sy] of [[x0 + 3, 259], [x0 + 182, 259], [x0 + 3, 326], [x0 + 182, 326]]) { R(g, sx - 1, sy - 1, 3, 3, D.lampD); R(g, sx - 1, sy - 1, 2, 1, D.lamp); } }
      // magnifier + pencil on the table
      g.fillStyle = mix(D.n0, D.n1, 0.5); disc(g, 300, 222, 15); g.fillStyle = D.lampD; disc(g, 298, 219, 14); g.fillStyle = mix(D.n2, D.glass, 0.25); disc(g, 298, 219, 12);
      g.globalAlpha = 0.35; g.fillStyle = D.cream; disc(g, 294, 215, 4); g.globalAlpha = 1;
      g.save(); g.translate(306, 231); g.rotate(0.8); R(g, 0, -2, 22, 5, mix(D.n2, D.lampD, 0.4)); R(g, 0, -2, 22, 1, D.lampD); g.restore();
    });
    const labels = [["COST", "m1", 5.5, 0.74, 0.78], ["EFFICIENCY", "m2", 7.5, 0.83, 0.8], ["SURVIVES A BROKEN LINK", "m3", 9.0, 0.71, 0.74]];
    const pathPts = (ids) => ids.map((i) => [MX + C[i][0] * S, MY + C[i][1] * S]);
    const along = (pts, f) => { let L = 0; const seg = []; for (let i = 0; i + 1 < pts.length; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); seg.push(l); L += l; }
      let q = fm(f, 1) * L; for (let i = 0; i < seg.length; i++) { if (q <= seg[i]) { const k = q / seg[i]; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; } q -= seg[i]; } return pts[pts.length - 1]; };

    return (g, t, d, c) => {
      const k = d / 12, tov = dflt(o.overlay, 2.0, k), tcut = dflt(o.cut, 9.0, k);
      g.drawImage(art, 0, 0);
      PX.glow(g, 120, 30, 300, D.lamp, 0.1);
      // live slime in the dish
      const lg = layer();
      tubes(lg, webSegs(DX, DY, S, 1, null), { t, sh: 0.5, wob: 0.2, pul: { a: 0.14, k: 0.1, w: 2.6 }, flow: { v: 14, lam: 26, col: D.lamp, min: 1.5 } });
      C.forEach(([u, v], i) => { const x = DX + u * S, y = DY + v * S; lg.globalAlpha = 0.7; lg.fillStyle = AM[1]; disc(lg, x, y, 2.6); lg.fillStyle = D.paper; disc(lg, x, y, 1); lg.globalAlpha = 1; });
      g.drawImage(LY, 0, 0);
      dishRim(g, DX, DY, RD, t);
      // the tracing (acetate) sliding from the dish onto the map
      const sl = P(t, tov, 1.8, "io"), ox = lerp(DX, MX, sl), oy = lerp(DY, MY, sl), lift = Math.sin(sl * Math.PI) * 3;
      PX.par(g, c, 1.06, () => {
        g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(Math.round(ox - 104 + 3 + lift), Math.round(oy - 104 + 4 + lift), 208, 208);
        g.globalAlpha = 0.06; g.fillStyle = D.glass; g.fillRect(Math.round(ox - 104), Math.round(oy - 104 - lift), 208, 208); g.globalAlpha = 0.5;
        PX.box(g, ox - 104, oy - 104 - lift, 208, 208, mix(D.glass, D.n4, 0.3)); g.globalAlpha = 1;
        g.fillStyle = D.cream; g.globalAlpha = 0.25; for (let i = 0; i < 40; i++) g.fillRect(Math.round(ox - 100 + i), Math.round(oy - 100 - lift + i * 0.5), 1, 1); g.globalAlpha = 1;
        const tg = layer(); tubes(tg, webSegs(ox, oy - lift, S, 0.42, null), { t, sh: 0, col: [AM[0], AM[1], AM[1]] });
        g.globalAlpha = 0.8; g.drawImage(LY, 0, 0); g.globalAlpha = 1;
        // corner tab
        R(g, ox + 84, oy - 104 - lift, 20, 6, mix(D.paper, D.n4, 0.3)); R(g, ox + 84, oy - 104 - lift, 20, 1, D.cream);
      });
      // the rail link breaking: spark, gap, rerouted traffic
      const [ax, ay] = [MX + C[ca][0] * S, MY + C[ca][1] * S], [bx, by] = [MX + C[cb][0] * S, MY + C[cb][1] * S], mxc = (ax + bx) / 2, myc = (ay + by) / 2;
      if (t >= tcut) { // gap in the line
        const k = P(t, tcut, 0.3); g.fillStyle = mix(D.paper, D.paperD, 0.4);
        const ux = (bx - ax) / Math.hypot(bx - ax, by - ay), uy = (by - ay) / Math.hypot(bx - ax, by - ay);
        for (let s2 = -4 * k; s2 <= 4 * k; s2 += 0.5) g.fillRect(Math.round(mxc + ux * s2) - 2, Math.round(myc + uy * s2) - 2, 5, 5);
        g.fillStyle = D.rust[1]; for (const sg of [-1, 1]) { const ex = mxc + ux * sg * (4 * k + 2), ey = myc + uy * sg * (4 * k + 2); g.fillRect(Math.round(ex) - 1, Math.round(ey) - 1, 3, 3); }
        const sp = t - tcut; if (sp < 0.9) { const rr = PX.rnd(5); for (let i = 0; i < 14; i++) { const th = rr() * TAU, v = 10 + rr() * 22, life = 0.4 + rr() * 0.5; if (sp > life) continue;
          g.globalAlpha = 1 - sp / life; R(g, mxc + Math.cos(th) * v * sp, myc + Math.sin(th) * v * sp + 18 * sp * sp, 1, 1, i % 3 ? D.lamp : D.cream); } g.globalAlpha = 1; if (sp < 0.12) { g.fillStyle = D.cream; disc(g, mxc, myc, 2); } }
      }
      if (t > tcut - 1.6) { // traffic: little cars of light along the link, then along the detour
        const pre = t < tcut, pts = pre ? [[ax, ay], [bx, by]] : pathPts(detour), a = P(t, tcut - 1.6, 0.4) * (1 - P(t, d - 0.5, 0.4));
        for (let i = 0; i < (pre ? 3 : 5); i++) { const f = (t - tcut) * (pre ? 0.5 : 0.22) + i / (pre ? 3 : 5); if (pre && fm(f, 1) > 0.42 && fm(f, 1) < 0.58 && t > tcut - 0.15) continue; const [x, y] = along(pts, f);
          g.globalAlpha = a; g.fillStyle = D.ink; disc(g, x, y, 2.2); g.fillStyle = D.cream; disc(g, x, y, 1.2); g.globalAlpha = 1; }
        if (!pre) { const ka = P(t, tcut + 0.3, 0.6) * a * 0.5; g.globalAlpha = ka; const pp = pathPts(detour); for (let i = 0; i + 1 < pp.length; i++) PX.line(g, pp[i][0], pp[i][1] - 3, pp[i + 1][0], pp[i + 1][1] - 3, D.cream); g.globalAlpha = 1; }
      }
      // meters
      labels.forEach(([lab, kk, def, vs, vr], i) => {
        const t0 = dflt(o[kk], def, k), x0 = 30 + i * 196, a = P(t, t0 - 0.6, 0.5), f = P(t, t0, 1.6, "out");
        g.globalAlpha = 0.35 + 0.65 * a; PX.text(g, lab, x0 + 93, 261, { font: "v", size: 16, col: a > 0.5 ? D.cream : D.n6, align: "center" });
        PX.text(g, "SLIME", x0 + 40, 281, { font: "v", size: 12, col: AM[1], align: "right" }); PX.text(g, "RAIL", x0 + 40, 301, { font: "v", size: 12, col: D.steel[0], align: "right" }); g.globalAlpha = 1;
        const w1 = Math.round(130 * vs * f), w2 = Math.round(130 * vr * PX.ease(clamp((t - t0 - 0.15) / 1.6, 0, 1), "out"));
        if (w1 > 0) { R(g, x0 + 45, 283, w1, 7, AM[1]); R(g, x0 + 45, 283, w1, 1, AM[0]); R(g, x0 + 45, 289, w1, 1, AM[2]); }
        if (w2 > 0) { R(g, x0 + 45, 303, w2, 7, D.steel[1]); R(g, x0 + 45, 303, w2, 1, D.steel[0]); R(g, x0 + 45, 309, w2, 1, D.steel[2]); }
      });
      PX.particles(g, 71, 20, t, [40, 10, 300, 220], { vy: -2, vx: 1.2, col: D.lamp, a: 0.3 });
      PX.vignette(g, 0.5);
    };
  };
  // mug with steam (side view), x,y = top-left of the body
  const mug = (g, x, y, t, col) => {
    col = col || D.steel;
    R(g, x, y, 11, 13, col[1]); R(g, x, y, 2, 13, col[0]); R(g, x + 9, y, 2, 13, col[2]); R(g, x + 11, y + 3, 3, 1, col[1]); R(g, x + 13, y + 3, 1, 6, col[1]); R(g, x + 11, y + 8, 3, 1, col[2]);
    R(g, x + 1, y, 9, 2, mix(D.ink, D.lampD, 0.3)); R(g, x, y + 13, 11, 1, D.n0);
    for (let i = 0; i < 4; i++) { const k = fm(t * 0.45 + i / 4, 1); g.globalAlpha = 0.28 * Math.sin(k * Math.PI); R(g, x + 4 + Math.round(Math.sin(k * 7 + i) * 2), y - 3 - k * 18, 2, 3, D.cream); }
    g.globalAlpha = 1;
  };
  // chalk stroke (slightly broken line)
  const chalk = (g, pts, a, seed) => { const r = PX.rnd(seed); g.fillStyle = D.cream;
    for (let i = 0; i + 1 < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n = Math.ceil(Math.hypot(bx - ax, by - ay));
      for (let k = 0; k <= n; k++) { if (r() < 0.12) continue; g.globalAlpha = a * (0.55 + r() * 0.45); g.fillRect(Math.round(lerp(ax, bx, k / n)), Math.round(lerp(ay, by, k / n)), 1, 1); } }
    g.globalAlpha = 1; };

  // ======================================================================================
  // model_sim (6.5): a researcher's monitor at night running the flow model: city dots, a dense mesh thinning to an
  // efficient web (o.run [0.6, 5.6]); chalkboard behind with flow/thickness doodles.
  K.model_sim = (o) => {
    const TK = TOKYO, C = TK.C, SX = 318, SY = 134, S = 70, key = (i, j) => (i < j ? i * 100 + j : j * 100 + i);
    const keep = new Set(TK.edges.map(([i, j]) => key(i, j)));
    const all = [...TK.edges.map((e, k) => ({ e, keep: true, use: TK.use[k] }))];
    TK.gab.forEach((e) => { if (!keep.has(key(...e))) all.push({ e, keep: false, use: 0 }); });
    // extra long-range "trial" links so the start looks really dense
    const rr = PX.rnd(9); for (let k = 0; k < 40; k++) { const i = Math.floor(rr() * C.length), j = Math.floor(rr() * C.length); if (i === j || keep.has(key(i, j))) continue;
      const L = Math.hypot(C[i][0] - C[j][0], C[i][1] - C[j][1]); if (L < 0.62 && L > 0.2) all.push({ e: [i, j], keep: false, use: 0 }); }
    all.forEach((a, k) => (a.rk = a.keep ? 1 : 0.05 + 0.75 * hash(k, 3, 5)));
    const wall = pix(700, 400, (x, y) => { const n = fbm(x / 50, y / 50, 3) * 0.12 + hash(x, y, 2) * 0.05, L = clamp(1 - Math.hypot(x - 560, y - 120) / 520, 0, 1); return mixv(hx(D.n1), hx(mix(D.n3, D.lampD, 0.25)), clamp(L * 0.6 + n, 0, 1)); });
    const board = pix(300, 150, (x, y) => { const n = fbm(x / 18, y / 9, 7) * 0.25 + hash(x, y, 4) * 0.08; return mixv(hx(mix(D.n1, D.moss[2], 0.3)), hx(mix(D.n3, D.moss[2], 0.35)), clamp(n + 0.1, 0, 1)); });
    const bench = benchTex(640, 120, 0, 240, 520, 200, 17);
    const back = bake(700, 400, (g) => {
      g.drawImage(wall, 0, 0);
      // chalkboard (frame, eraser smears, doodles in the visible left part)
      const bx = 52, by = 30; R(g, bx - 5, by - 5, 250, 160, mix(D.n2, D.lampD, 0.35)); R(g, bx - 5, by - 5, 250, 1, mix(D.lampD, D.n4, 0.4)); g.drawImage(board, bx, by, 240, 150);
      R(g, bx - 5, by + 152, 250, 4, mix(D.n2, D.lampD, 0.4)); R(g, bx + 20, by + 150, 10, 2, D.cream); R(g, bx + 36, by + 150, 7, 2, mix(D.cream, D.rust[0], 0.3));
      g.globalAlpha = 0.035; g.fillStyle = D.cream; for (let i = 0; i < 4; i++) for (let yy = 0; yy < 9; yy++) for (let xx = 0; xx < 70; xx += 2) g.fillRect(bx + 10 + i * 30 + xx + (yy % 2), by + 74 + i * 17 + yy, 1, 1); g.globalAlpha = 1;
      // 1: thin tube, one arrow  ->  thick tube, three arrows
      const tube = (x, y, w, h, n, sd) => { chalk(g, [[x, y], [x + w, y]], 0.9, sd); chalk(g, [[x, y + h], [x + w, y + h]], 0.9, sd + 1);
        for (let k = 0; k < n; k++) { const yy = y + ((k + 1) * h) / (n + 1); chalk(g, [[x + w * 0.3, yy], [x + w * 0.7, yy]], 0.8, sd + 2 + k); chalk(g, [[x + w * 0.7 - 3, yy - 2], [x + w * 0.7, yy], [x + w * 0.7 - 3, yy + 2]], 0.8, sd + 9 + k); } };
      tube(bx + 10, by + 22, 44, 6, 1, 1); chalk(g, [[bx + 62, by + 25], [bx + 80, by + 25]], 0.9, 30); chalk(g, [[bx + 76, by + 22], [bx + 80, by + 25], [bx + 76, by + 28]], 0.9, 31);
      tube(bx + 90, by + 13, 70, 24, 3, 40);
      // 2: quiet tube thinning away to dots
      chalk(g, [[bx + 10, by + 62], [bx + 60, by + 63]], 0.85, 60); chalk(g, [[bx + 10, by + 68], [bx + 60, by + 65.5]], 0.85, 61); chalk(g, [[bx + 60, by + 63], [bx + 84, by + 64]], 0.6, 62);
      for (let i = 0; i < 4; i++) { g.globalAlpha = 0.75 - i * 0.16; R(g, bx + 92 + i * 9, by + 64, 2, 1, D.cream); } g.globalAlpha = 1;
      // 3: a little network, one link crossed out; loop arrow
      const nd = [[96, 100], [128, 92], [158, 108], [140, 132], [104, 136], [176, 140]];
      [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [2, 5], [0, 3]].forEach(([a, b], k) => chalk(g, [[bx + nd[a][0], by + nd[a][1]], [bx + nd[b][0], by + nd[b][1]]], k === 6 ? 0.4 : 0.85, 70 + k));
      nd.forEach(([x, y]) => { g.fillStyle = D.cream; g.globalAlpha = 0.85; disc(g, bx + x, by + y, 2.4); }); g.globalAlpha = 1;
      chalk(g, [[bx + 116, by + 110], [bx + 126, by + 120]], 0.9, 90); chalk(g, [[bx + 126, by + 110], [bx + 116, by + 120]], 0.9, 91);
      const lp = []; for (let i = 0; i <= 22; i++) { const th = 0.6 + (i / 22) * 5.2; lp.push([bx + 40 + Math.cos(th) * 18, by + 118 + Math.sin(th) * 14]); } chalk(g, lp, 0.85, 95);
      chalk(g, [[lp[22][0] - 4, lp[22][1] - 4], lp[22], [lp[22][0] + 2, lp[22][1] - 5]], 0.85, 96);
      // pinned print of a network on the wall
      g.save(); g.translate(500, 104); g.rotate(0.04); R(g, 2, 3, 74, 58, "rgba(0,0,0,0.35)"); R(g, 0, 0, 74, 58, mix(D.paperD, D.n3, 0.4)); R(g, 0, 0, 74, 1, mix(D.paper, D.n4, 0.3));
      const pr = PX.rnd(12), pp = []; for (let i = 0; i < 9; i++) pp.push([10 + pr() * 54, 8 + pr() * 42]);
      g.globalAlpha = 0.7; for (let i = 0; i < 9; i++) for (let j = i + 1; j < 9; j++) if (Math.hypot(pp[i][0] - pp[j][0], pp[i][1] - pp[j][1]) < 22) PX.line(g, pp[i][0], pp[i][1], pp[j][0], pp[j][1], mix(AM[2], D.n3, 0.3));
      for (const [x, y] of pp) R(g, x - 1, y - 1, 2, 2, D.ink); g.globalAlpha = 1; g.fillStyle = D.rust[2]; disc(g, 37, 3, 2); g.restore();
      // shelf with jars on the right
      R(g, 430, 70, 220, 5, mix(D.n3, D.lampD, 0.35)); R(g, 430, 70, 220, 1, mix(D.lampD, D.n4, 0.3)); R(g, 430, 75, 220, 2, D.n0);
      [[446, 44, 16, 26, D.glass], [470, 52, 12, 18, D.glass], [490, 38, 18, 32, D.glass], [520, 50, 22, 20, D.paperD], [560, 46, 14, 24, D.glass]].forEach(([x, y, w, h, cc], k) => {
        g.globalAlpha = 0.35; R(g, x, y, w, h, mix(cc, D.n2, 0.4)); g.globalAlpha = 0.6; R(g, x, y, 1, h, cc); R(g, x, y - 3, w, 3, mix(D.n3, D.lampD, 0.3)); g.globalAlpha = 1;
        if (k === 2) { R(g, x + 3, y + 18, w - 6, 12, mix(AM[2], D.n2, 0.4)); } });
    });
    const front = bake(640, 360, (g) => {
      g.drawImage(bench, 0, 240); R(g, 0, 240, 640, 2, mix(D.n4, D.lampD, 0.25)); R(g, 0, 242, 640, 1, D.n0);
      // monitor: chunky grey CRT-era body on a stand
      R(g, 300, 222, 40, 6, D.n3); R(g, 286, 228, 68, 12, D.n4); R(g, 286, 228, 68, 1, D.n6); R(g, 288, 240, 66, 2, D.n0);
      R(g, 206, 56, 228, 168, D.n4); R(g, 206, 56, 228, 2, D.n6); R(g, 206, 56, 2, 168, D.n5); R(g, 432, 56, 2, 168, D.n3); R(g, 206, 222, 228, 2, D.n2);
      R(g, 214, 64, 212, 152, D.n1); R(g, 214, 64, 212, 1, D.n0);
      R(g, 410, 216, 6, 3, D.n2); g.fillStyle = D.moss[1]; g.fillRect(412, 217, 2, 1);
      // keyboard, notebook, pencil
      R(g, 250, 262, 140, 18, D.n3); R(g, 250, 262, 140, 1, D.n5); for (let j = 0; j < 3; j++) for (let i = 0; i < 18; i++) R(g, 254 + i * 7.4, 265 + j * 5, 6, 3, D.n4);
      R(g, 252, 280, 136, 2, D.n0);
      g.save(); g.translate(64, 270); g.rotate(-0.08); R(g, 0, 0, 120, 70, mix(D.paperD, D.n3, 0.45)); R(g, 0, 0, 120, 1, D.paper); R(g, 60, 0, 1, 70, mix(D.paperD, D.n2, 0.5));
      for (let i = 0; i < 6; i++) { R(g, 8, 10 + i * 9, 44, 1, mix(D.paperD, D.n3, 0.6)); R(g, 68, 10 + i * 9, 44, 1, mix(D.paperD, D.n3, 0.6)); }
      g.globalAlpha = 0.6; g.fillStyle = mix(D.ink, D.n4, 0.2); disc(g, 30, 34, 6); disc(g, 42, 30, 4); g.globalAlpha = 1; g.restore();
      // desk lamp on the right
      R(g, 520, 236, 40, 6, D.n2); R(g, 520, 236, 40, 1, D.n4); R(g, 538, 176, 4, 60, D.n3); R(g, 539, 176, 1, 60, D.n5);
      poly(g, [[520, 150], [566, 150], [576, 176], [510, 176]], D.n3); R(g, 512, 150, 54, 1, D.n5); R(g, 512, 176, 64, 2, D.lamp);
    });
    return (g, t, d, c) => {
      const run = dflt(o.run, [0.6, 5.6], d / 6.5), p = P(t, run[0], run[1] - run[0], "io");
      PX.par(g, c, 0.55, () => g.drawImage(back, -30, -20));
      g.drawImage(front, 0, 0);
      // lamp light pool + monitor light on the bench
      PX.glow(g, 543, 200, 150, D.lamp, 0.22); PX.glow(g, 320, 250, 120, D.teal[0], 0.08);
      // screen content
      const lg = layer();
      lg.fillStyle = mix(D.n1, D.teal[2], 0.3); lg.fillRect(216, 66, 208, 148);
      lg.globalAlpha = 0.1; lg.fillStyle = D.teal[0]; for (let x = 224; x < 420; x += 16) lg.fillRect(x, 66, 1, 148); for (let y = 72; y < 214; y += 16) lg.fillRect(216, y, 208, 1); lg.globalAlpha = 1;
      const segs = [];
      all.forEach((a, k) => {
        const [i, j] = a.e, w = a.keep ? 0.7 + 1.5 * p * Math.min(1, 0.4 + Math.sqrt(a.use) * 0.25) : 1.0 * (1 - clamp((p - a.rk) / 0.18, 0, 1)); if (w <= 0.05) return;
        const ax = SX + C[i][0] * S, ay = SY + C[i][1] * S, bx = SX + C[j][0] * S, by = SY + C[j][1] * S;
        segs.push([ax, ay, w, TK.dT[i] * S, bx, by, w, TK.dT[i] * S + Math.hypot(bx - ax, by - ay), k]);
      });
      tubes(lg, segs, { t, sh: 0, col: [AM[0], AM[1], mix(AM[2], D.n2, 0.2)], pul: { a: 0.15 * p, k: 0.15, w: 3 }, flow: { v: 14, lam: 22, col: D.cream, min: 1.5 } });
      C.forEach(([u, v], i) => { const x = SX + u * S, y = SY + v * S; lg.fillStyle = D.n0; disc(lg, x, y, 2.2); lg.fillStyle = i ? D.cream : AM[0]; disc(lg, x, y, i ? 1.2 : 1.8); });
      // progress strip (no numbers)
      lg.fillStyle = D.n3; lg.fillRect(226, 204, 188, 3); lg.fillStyle = D.teal[1]; lg.fillRect(226, 204, Math.round(188 * p), 3);
      lg.fillStyle = D.teal[0]; lg.fillRect(226 + Math.round(188 * p), 203, 1, 5);
      // scanlines + glass glare on the tube
      lg.globalAlpha = 0.18; lg.fillStyle = D.n0; for (let y = 66; y < 214; y += 2) lg.fillRect(216, y, 208, 1);
      lg.globalAlpha = 0.06; lg.fillStyle = D.cream; poly(lg, [[222, 70], [300, 70], [250, 130], [222, 150]], D.cream); lg.globalAlpha = 1;
      g.drawImage(LY, 0, 0);
      PX.glow(g, 320, 140, 140, D.teal[0], 0.07);
      mug(g, 410, 252, t, [D.n7, D.n6, D.n4]);
      PX.particles(g, 81, 22, t, [470, 150, 150, 100], { vy: -2.5, vx: -1, col: D.lamp, a: 0.45 });
      PX.vignette(g, 0.55);
    };
  };
  // dense polyline with cumulative length: [[x,y,s],...]
  const dense = (ctrl, it) => { const p = chaikin(ctrl.map(([x, y]) => [x, y]), it || 3); let s = 0; return p.map((q, i) => { if (i) s += Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]); return [q[0], q[1], s]; }); };
  const at = (pl, s) => { if (s <= 0) return pl[0]; for (let i = 1; i < pl.length; i++) if (pl[i][2] >= s) { const a = pl[i - 1], b = pl[i], k = (s - a[2]) / Math.max(1e-6, b[2] - a[2]); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), s, Math.atan2(b[1] - a[1], b[0] - a[0])]; } const z = pl[pl.length - 1]; return [z[0], z[1], z[2], 0]; };
  // a big cutaway slime tube: translucent wall, flowing lumen, granules streaming. o: {r(f) radius, len (visible length from start), flow (px/s), dens, t, seed, osc}
  const pipe = (g, pl, o) => {
    const L = Math.min(o.len === undefined ? 1e9 : o.len, pl[pl.length - 1][2]); if (L <= 0.5) return;
    const st = []; for (let s = 0; s <= L; s += 1) { const [x, y, , a] = at(pl, s), f = s / pl[pl.length - 1][2]; let r = o.r(f, s); r *= 1 + 0.06 * Math.sin(s * 0.08 - o.t * 2.6); if (r > 0.3) st.push(x, y, r, a); }
    const S = shadowCv(), sg = S.getContext("2d"); sg.clearRect(0, 0, 640, 360); sg.fillStyle = "#000";
    for (let i = 0; i < st.length; i += 4) disc(sg, st[i], st[i + 1], st[i + 2] + 1.5);
    g.globalAlpha = 0.45; g.drawImage(S, 2, 4); g.globalAlpha = 1;
    g.fillStyle = mix(AM[2], D.n1, 0.25); for (let i = 0; i < st.length; i += 4) disc(g, st[i], st[i + 1], st[i + 2] + 1);
    g.globalAlpha = 0.8; g.fillStyle = mix(AM[2], AM[1], 0.3); for (let i = 0; i < st.length; i += 4) disc(g, st[i], st[i + 1], st[i + 2]);
    g.globalAlpha = 1; g.fillStyle = mix(AM[2], AM[1], 0.65); for (let i = 0; i < st.length; i += 4) disc(g, st[i], st[i + 1], st[i + 2] * 0.62);
    g.fillStyle = AM[1]; for (let i = 0; i < st.length; i += 4) if (st[i + 2] > 4) disc(g, st[i], st[i + 1], st[i + 2] * 0.3);
    // glassy top highlight + soft lower rim light
    for (let i = 0; i < st.length; i += 4) { const r = st[i + 2]; if (r < 2) continue; const a = st[i + 3], nx = Math.sin(a), ny = -Math.cos(a), sgn = ny < 0 ? 1 : -1;
      g.fillStyle = AM[0]; g.fillRect(Math.round(st[i] + nx * sgn * (r - 1.5)), Math.round(st[i + 1] + ny * sgn * (r - 1.5)), 1, 1);
      if (r > 5) { g.globalAlpha = 0.5; g.fillRect(Math.round(st[i] + nx * sgn * (r * 0.35)), Math.round(st[i + 1] + ny * sgn * (r * 0.35)), 1, 1); g.globalAlpha = 1; }
      g.globalAlpha = 0.35; g.fillStyle = D.lamp; g.fillRect(Math.round(st[i] - nx * sgn * (r - 1)), Math.round(st[i + 1] - ny * sgn * (r - 1)), 1, 1); g.globalAlpha = 1; }
    // granules (endoplasm) streaming along
    const rr = PX.rnd(o.seed || 1), n = Math.round((L / 6) * (o.dens || 1)), disp = o.flow * o.t + (o.osc || 0) * Math.sin(o.t * 1.1);
    for (let k = 0; k < n; k++) {
      const u0 = rr() * L, lat = rr() * 2 - 1, sz = rr() < 0.25 ? 2 : 1, sp = 0.7 + rr() * 0.6, s = fm(u0 + disp * sp, L);
      const [x, y, , a] = at(pl, s), r = o.r(s / pl[pl.length - 1][2], s); if (r < 2.5) continue;
      const nx = Math.sin(a), ny = -Math.cos(a), off = lat * r * 0.5;
      g.fillStyle = sz > 1 ? mix(D.cream, AM[0], 0.4) : AM[0]; g.fillRect(Math.round(x + nx * off), Math.round(y + ny * off), sz, sz);
    }
  };
  // round "local rule" marker: a soft ring with four tiny in/out ticks
  const ruleMark = (g, x, y, k, t) => {
    if (k <= 0) return; const r = 9 + Math.sin(t * 2.2) * 0.6;
    g.globalAlpha = 0.85 * k; g.fillStyle = D.cream;
    for (let i = 0; i < 48; i++) { const th = (i / 48) * TAU; if (i % 12 === 5) continue; g.fillRect(Math.round(x + Math.cos(th) * r * k), Math.round(y + Math.sin(th) * r * k), 1, 1); }
    for (let i = 0; i < 4; i++) { const th = (i / 4) * TAU + 0.785; R(g, x + Math.cos(th) * (r + 3) * k, y + Math.sin(th) * (r + 3) * k, 1, 1, D.cream); R(g, x + Math.cos(th) * (r + 5) * k, y + Math.sin(th) * (r + 5) * k, 1, 1, D.cream); }
    g.globalAlpha = 1;
  };

  // ======================================================================================
  // tube_rule (13.0): macro cutaway of a few slime tubes like glass pipes with streaming granules between two oats.
  // o.thick 1.0 the busy tube thickens ("MORE FLOW = THICKER"); o.thin 4.0 a quiet tube narrows, o.gone 7.0 it fades away
  // ("LESS FLOW = THINNER"); o.local 9.0 "local rule" rings on every junction.
  K.tube_rule = (o) => {
    const J1 = [222, 182], J2 = [384, 198], J3 = [474, 276], A = [84, 188], B = [560, 172];
    const busy = dense([A, [150, 176], J1, [300, 202], J2, [470, 196], B]);
    const quiet = dense([J1, [236, 140], [262, 104], [250, 66], [228, 38]]);
    const side = dense([J2, [410, 250], J3, [530, 262], [552, 204], B]);
    const stub = dense([J3, [470, 310], [492, 342]]);
    const bgNet = mknet({ seed: 44, box: [-40, -30, 720, 420], sp: 9, src: [[320, 180]], wj: 0.9, cost: (x, y) => 1.5 * fbm(x / 40, y / 40, 9), lobe: 0 });
    const back = bake(720, 420, (g) => {
      g.drawImage(pix(720, 420, (x, y) => { const L = clamp(1 - Math.hypot(x - 150, y - 40) / 600, 0, 1), n = fbm(x / 22, y / 22, 12) * 0.35 + hash(x, y, 2) * 0.05;
        return mixv(hx(D.n0), hx(mix(D.n2, D.lampD, 0.18)), clamp(L * 0.7 + n * 0.6, 0, 1)); }), 0, 0);
      g.translate(40, 30);
      // out-of-focus older network far below (dim, soft)
      g.globalAlpha = 0.28; tubes(g, netSegs(bgNet, { F: 1e7, T: 6, r0: 0.6, rk: 0.35, rmax: 5 }), { t: 0, sh: 0, col: [mix(AM[2], D.n2, 0.35), mix(AM[2], D.n2, 0.55), mix(AM[2], D.n1, 0.7)] }); g.globalAlpha = 1;
      g.translate(-40, -30);
      g.globalAlpha = 0.35; g.fillStyle = D.n0; g.fillRect(0, 0, 720, 420); g.globalAlpha = 1;
    });
    return (g, t, d, c) => {
      const k = d / 13, tk = dflt(o.thick, 1.0, k), tn = dflt(o.thin, 4.0, k), tg = dflt(o.gone, 7.0, k), tl = dflt(o.local, 9.0, k);
      PX.par(g, c, 0.5, () => g.drawImage(back, -40, -30));
      PX.glow(g, 150, 40, 320, D.lamp, 0.1);
      // agar sheen + faint mucus trail where the quiet tube used to be
      const thick = P(t, tk, 2.6, "io"), thin = P(t, tn, 2.4, "io"), gone = P(t, tg, 1.8, "io");
      if (gone > 0) { g.globalAlpha = 0.12 * gone; g.fillStyle = AM[2]; for (let s = 0; s < quiet[quiet.length - 1][2]; s += 1) { const [x, y] = at(quiet, s); disc(g, x, y, 3); } g.globalAlpha = 1; }
      const Lq = quiet[quiet.length - 1][2];
      pipe(g, stub, { r: (f) => 6 * (1 - f * 0.55), t, flow: 6, dens: 0.6, seed: 4 });
      pipe(g, side, { r: (f) => 7 + Math.sin(f * 9) * 0.4, t, flow: 12, dens: 0.9, seed: 3, osc: 6 });
      pipe(g, quiet, { r: (f) => lerp(7.5, 2.6, thin) * (1 - f * 0.35) * (f > 0.96 ? 0.7 : 1), t, flow: lerp(9, 2, thin), dens: lerp(0.9, 0.25, thin), seed: 2, len: Lq * (1 - gone) });
      pipe(g, busy, { r: (f) => lerp(8, 13.5, thick) * (1 - 0.12 * Math.abs(f - 0.5)), t, flow: lerp(14, 34, thick), dens: lerp(1, 1.9, thick), seed: 1, osc: 5 });
      // junction swellings
      // the two oats being digested, slime fans around them
      for (const [[x, y], sd, a] of [[A, 7, 0.4], [B, 8, -0.7]]) {
        for (let i = 0; i < 9; i++) { const th = (i / 9) * TAU + sd, l = 14 + 5 * Math.sin(i * 2.3 + sd + t * 0.6); g.globalAlpha = 0.35; g.fillStyle = AM[2]; disc(g, x + Math.cos(th) * l, y + Math.sin(th) * l * 0.8, 9);
          g.globalAlpha = 0.5; g.fillStyle = mix(AM[1], AM[2], 0.3); disc(g, x + Math.cos(th) * l * 0.8, y + Math.sin(th) * l * 0.65, 6); }
        g.globalAlpha = 0.8; g.fillStyle = mix(AM[1], AM[2], 0.35); disc(g, x, y, 16); g.globalAlpha = 1; oat(g, x, y, 13, a, 30 + sd); g.globalAlpha = 0.35; g.fillStyle = AM[1]; disc(g, x + 4, y + 3, 9); g.globalAlpha = 1;
      }
      // rule markers on every junction
      const lk = P(t, tl, 0.6, "back"); [J1, J2, J3].forEach(([x, y], i) => ruleMark(g, x, y, P(t, tl + i * 0.25, 0.6, "back"), t + i));
      // labels
      const a1 = P(t, tk + 0.4, 0.5) * (1 - 0.45 * P(t, tn, 0.5)), a2 = P(t, tn + 0.4, 0.5) * (1 - 0.45 * P(t, tl, 0.5));
      if (a1 > 0) { g.globalAlpha = a1; PX.otext(g, "MORE FLOW = THICKER", 140, 230, { col: AM[0] }); g.globalAlpha = 1; }
      if (a2 > 0) { g.globalAlpha = a2; PX.otext(g, "LESS FLOW = THINNER", 270, 52, { col: D.cream }); g.globalAlpha = 1; }
      if (lk > 0) { g.globalAlpha = clamp(lk, 0, 1); PX.otext(g, "LOCAL RULE", J2[0] + 16, J2[1] - 30, { col: D.cream }); PX.line(g, J2[0] + 14, J2[1] - 20, J2[0] + 8, J2[1] - 11, D.cream); g.globalAlpha = 1; }
      PX.particles(g, 91, 30, t, [0, 0, 640, 360], { vy: -1.5, vx: 1, col: D.lamp, a: 0.3 });
      PX.vignette(g, 0.55);
    };
  };
  // ======================================================================================
  // oat_gag (4.0): macro on the dish. The slime front flows over a big oat flake, the oat shrinks to nothing while the
  // blob pulses contentedly; then, without a pause, a thin arm sets off toward the next oat. No text.
  // o.reach 0.8 front reaches the oat, o.eat [0.9, 3.3] oat shrinks, o.next 3.2 the arm toward the next oat
  K.oat_gag = (o) => {
    const OX = 352, OY = 190, N2 = [612, 70];
    const nt = mknet({ seed: 61, box: [-30, -30, 700, 420], sp: 9, src: [[-40, 200]], wj: 0.7, cost: (x, y) => 1.3 * fbm(x / 50, y / 50, 4), lobe: 22 });
    const dO = nt.N[nt.near(OX, OY)].d;
    const fan = mkfan(nt, { box: [0, 0, 640, 360], lobe: 22, cell: 11, seed: 9 });
    const arm = dense([[OX + 30, OY - 14], [420, 168], [470, 118], [520, 120], [566, 84], [N2[0] - 14, N2[1] + 4]], 3);
    const agar = pix(720, 420, (x, y) => { const L = clamp(1 - Math.hypot(x - 200, y - 60) / 640, 0, 1), n = fbm(x / 30, y / 30, 14) * 0.4 + hash(x, y, 3) * 0.05;
      let c = mixv(hx(D.n0), hx(mix(D.n2, D.teal[2], 0.2)), clamp(L * 0.55 + n * 0.5, 0, 1)); if (hash(x, y, 8) < 0.002) c = mixv(c, hx(D.n6), 0.5); return c; });
    return (g, t, d, c) => {
      const k = d / 4, tr = dflt(o.reach, 0.8, k), eat = dflt(o.eat, [0.9, 3.3], k), tn = dflt(o.next, 3.2, k);
      PX.par(g, c, 1, () => {
        g.drawImage(agar, -40, -30);
        // dish wall, out of focus, top-right
        g.globalAlpha = 0.09; g.fillStyle = D.glass; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(940, -330, 640 - k * 3, 0, TAU); g.arc(940, -330, 628 - k * 3, 0, TAU, true); g.fill(); } g.globalAlpha = 1;
      });
      PX.glow(g, 200, 60, 340, D.lamp, 0.1);
      const F = dO - 50 + ((t - tr) * 30) / k + 50 * P(t, tr - 0.8 * k, 0.9 * k, "out");
      // the oat (shrinking) under the slime and a contented, slowly breathing coat
      const e = P(t, eat[0], eat[1] - eat[0], "io"), sz = 48 * (1 - e), cov = P(t, tr, 0.7, "io"), breath = 1 + 0.06 * Math.sin(t * lerp(3.2, 1.6, e));
      if (sz > 0.8) oat(g, OX, OY, sz, 0.35, 12);
      const lg = layer();
      drawFan(lg, nt, fan, F, { W: 70, lace: 0.4 });
      tubes(lg, netSegs(nt, { F, T: 5, r0: 0.6, rk: 0.42, rmax: 6, G: 110 }), { t, sh: 0.5, wob: 0.4, pul: { a: 0.12, k: 0.06, w: 2.2 }, flow: { v: 22, lam: 30, col: D.lamp, min: 2.2 } });
      g.drawImage(LY, 0, 0);
      if (cov > 0) {
        const br = (14 + 34 * (1 - e)) * breath;
        // lumpy coat over the oat
        for (let i = 0; i < 12; i++) { const th = (i / 12) * TAU + 0.3, l = br * (0.55 + 0.25 * Math.sin(i * 1.7 + t * 0.8)); g.globalAlpha = 0.3 * cov; g.fillStyle = AM[2]; disc(g, OX + Math.cos(th) * l + 1, OY + Math.sin(th) * l * 0.8 + 2, br * 0.5);
          g.globalAlpha = 0.32 * cov; g.fillStyle = mix(AM[1], AM[2], 0.2); disc(g, OX + Math.cos(th) * l, OY + Math.sin(th) * l * 0.8, br * 0.42); }
        g.globalAlpha = 1;
        g.globalAlpha = 0.55 * cov; g.fillStyle = AM[0]; disc(g, OX - br * 0.3, OY - br * 0.35, 2); g.globalAlpha = 1;
        // digested crumbs drifting into the veins
        for (let i = 0; i < 12; i++) { const k = fm(t * 0.35 + i / 12, 1), th = i * 2.4; g.globalAlpha = 0.6 * cov * (1 - k) * (sz > 2 ? 1 : 0.4); R(g, OX + Math.cos(th) * (6 + k * 40), OY + Math.sin(th) * (4 + k * 26), 1, 1, D.paper); }
        g.globalAlpha = 1;
      }
      // the next oat at the edge, and the arm that sets off for it
      oat(g, N2[0], N2[1], 13, -0.4, 21);
      const ak = P(t, tn, Math.max(0.5, d - tn - 0.1), "io");
      if (ak > 0) { const L = arm[arm.length - 1][2] * ak, segs = []; for (let i = 0; i + 1 < arm.length; i++) { if (arm[i][2] >= L) break; const b = arm[i + 1][2] > L ? at(arm, L) : arm[i + 1];
        segs.push([arm[i][0], arm[i][1], 3, arm[i][2], b[0], b[1], 2.6, L, 0]); } tubes(g, segs, { t, sh: 0.4, wob: 0.3, flow: { v: 26, lam: 14, col: D.lamp, min: 1.4 } });
        const tip = at(arm, L), th = tip[3] || -0.3; for (let i = -3; i <= 3; i++) { const a2 = th + i * 0.28, l = 7 + 2 * Math.cos(i * 1.3 + t * 2); g.globalAlpha = 0.55; g.fillStyle = i % 2 ? AM[1] : mix(AM[1], AM[0], 0.4); disc(g, tip[0] + Math.cos(a2) * l, tip[1] + Math.sin(a2) * l, 2.6); } g.globalAlpha = 1; }
      // lid reflection drifting a little in front
      PX.par(g, c, 1.2, () => { g.globalAlpha = 0.05; g.fillStyle = D.cream; poly(g, [[60, 0], [150, 0], [70, 120], [20, 120]], D.cream); g.globalAlpha = 1; });
      PX.vignette(g, 0.55);
    };
  };

  // ======================================================================================
  // one_cell (4.2): microscope eyepiece view of the plasmodium edge: many nuclei drifting in one shared membrane,
  // cytoplasm shuttle-streaming along channels (it reverses). o.label 1.5 "ONE CELL" + the membrane traced in cream.
  K.one_cell = (o) => {
    const CX = 320, CY = 180, FR = 164;
    const edgeX = (y, t) => 404 + 26 * Math.sin(y * 0.034 + 0.6) + 14 * Math.sin(y * 0.09 + 2.1) + 3 * Math.sin(y * 0.21 + t * 0.9) + 2 * Math.sin(t * 0.7 + y * 0.05);
    const holes = [[250, 120, 14, 9], [318, 252, 18, 11], [196, 230, 10, 8], [356, 96, 9, 7], [150, 150, 12, 8]];
    const inHole = (x, y, t) => holes.some(([hx2, hy, rx, ry], i) => ((x - hx2) / (rx * (1 + 0.06 * Math.sin(t + i)))) ** 2 + ((y - hy) / ry) ** 2 < 1);
    const channels = [dense([[110, 180], [180, 172], [250, 186], [320, 170], [380, 160]], 3), dense([[180, 172], [214, 130], [262, 96], [330, 70]], 3),
      dense([[250, 186], [270, 230], [320, 292], [372, 322]], 3), dense([[120, 260], [176, 240], [250, 186]], 3), dense([[320, 170], [360, 210], [396, 226]], 3)];
    const r = PX.rnd(31), nuc = []; for (let i = 0; i < 140; i++) { const x = 70 + r() * 360, y = 20 + r() * 320; if (Math.hypot(x - CX, y - CY) > FR - 4) continue; nuc.push([x, y, r() * TAU, 2.1 + r() * 1.3, r()]); }
    const bg = pix(640, 360, (x, y) => { const n = fbm(x / 9, y / 9, 5) * 0.3 + hash(x, y, 6) * 0.08, L = clamp(1 - Math.hypot(x - CX, y - CY) / 190, 0, 1); return mixv(hx(mix(D.n2, D.paperD, 0.15)), hx(mix(D.n5, D.paperD, 0.35)), clamp(n * 0.6 + L * 0.6, 0, 1)); });
    const gran = pix(640, 360, (x, y) => { const v = hash(x, y, 11), n = fbm(x / 7, y / 7, 2), m = fbm(x / 26, y / 26, 9), L = clamp(1 - Math.hypot(x - CX, y - CY) / 200, 0, 1);
      let cc = mixv(hx(mix(AM[2], D.n2, 0.35)), hx(mix(AM[1], AM[2], 0.35)), clamp(m * 0.9 + L * 0.35 - 0.15, 0, 1)); if (n > 0.6) cc = mixv(cc, hx(AM[1]), 0.3); if (n < 0.33) cc = mixv(cc, hx(D.n1), 0.25);
      if (v < 0.05) cc = mixv(cc, hx(D.n1), 0.5); else if (v > 0.975) cc = mixv(cc, hx(AM[0]), 0.6); return cc; });
    const cell = cv(640, 360), cg = cell.getContext("2d");
    const ring = pix(640, 360, (x, y) => { const rr = Math.hypot(x - CX, y - CY); if (rr < FR - 26) return null; if (rr < FR) { const k = (rr - (FR - 26)) / 26; return [0, 0, 0, Math.round(255 * k * k * 0.85)]; }
      const base = hx(D.n0); if (rr < FR + 2) return hx(mix(D.n2, D.n3, 0.5)); if (rr < FR + 5 && Math.cos(Math.atan2(y - CY, x - CX) - 3.9) > 0.4) return hx(D.n2); return base; });
    return (g, t, d, c) => {
      const tl = dflt(o.label, 1.5, d / 4.2);
      g.drawImage(bg, 0, 0);
      // streaming displacement: shuttle flow reverses every few seconds
      const disp = 26 * (1 - Math.cos(t * 1.25)) - 6 * t;
      // cell body (rows up to a wobbling membrane edge, minus holes)
      cg.clearRect(0, 0, 640, 360); cg.fillStyle = mix(AM[2], AM[1], 0.55);
      for (let y = 0; y < 360; y++) { const ex = Math.round(edgeX(y, t)); cg.fillRect(0, y, ex, 1); }
      cg.globalCompositeOperation = "destination-out"; for (const [hx2, hy, rx, ry] of holes) for (let yy = -ry; yy <= ry; yy++) { const w = rx * Math.sqrt(1 - (yy / ry) ** 2); cg.fillRect(Math.round(hx2 - w), hy + yy, Math.round(2 * w), 1); }
      cg.globalCompositeOperation = "source-atop"; cg.drawImage(gran, Math.round(disp * 0.15), 0);
      // a soft halo of cytoplasm thinning toward the edge
      cg.globalAlpha = 0.35; cg.fillStyle = mix(AM[1], AM[0], 0.2); for (let y = 0; y < 360; y++) { const ex = Math.round(edgeX(y, t)); cg.fillRect(ex - 14, y, 10, 1); } cg.globalAlpha = 1;
      // ectoplasm rim: lighter band inside the membrane
      cg.fillStyle = mix(AM[1], AM[0], 0.3); for (let y = 0; y < 360; y++) { const ex = Math.round(edgeX(y, t)); cg.fillRect(ex - 4, y, 3, 1); }
      cg.globalCompositeOperation = "source-over";
      g.globalAlpha = 0.95; g.drawImage(cell, 0, 0); g.globalAlpha = 1;
      // membrane line
      g.fillStyle = AM[2]; for (let y = 0; y < 360; y++) g.fillRect(Math.round(edgeX(y, t)), y, 1, 1);
      // channels with granules streaming (direction flips)
      for (const ch of channels) { const L = ch[ch.length - 1][2];
        for (let s = 0; s < L; s += 1) { const [x, y] = at(ch, s); g.fillStyle = mix(AM[2], D.n1, 0.25); disc(g, x, y, 5.2 - s / L * 1.5); }
        for (let s = 0; s < L; s += 1) { const [x, y] = at(ch, s); g.fillStyle = mix(AM[1], AM[2], 0.25); disc(g, x, y, 3.4 - s / L * 1.2); }
        for (let s = 0; s < L; s += 1) { const [x, y] = at(ch, s); g.fillStyle = mix(AM[1], AM[0], 0.3); g.fillRect(Math.round(x), Math.round(y) - 1, 1, 1); }
        const rr2 = PX.rnd(Math.round(L)); for (let k = 0; k < L / 3; k++) { const s = fm(rr2() * L + disp * (0.8 + rr2() * 0.5), L), [x, y, , a] = at(ch, s), off = (rr2() * 2 - 1) * 2;
          R(g, x + Math.sin(a) * off, y - Math.cos(a) * off, 1, 1, rr2() < 0.3 ? D.cream : AM[0]); } }
      // nuclei: round, translucent, slightly irregular, drifting with the flow
      for (const [x0, y0, ph, rad, q] of nuc) {
        const x = x0 + Math.sin(t * 0.5 + ph) * 2 + disp * 0.12 * (q - 0.3), y = y0 + Math.cos(t * 0.4 + ph) * 1.5;
        if (x > edgeX(y, t) - 5 || inHole(x, y, t)) continue;
        g.globalAlpha = 0.9; g.fillStyle = mix(AM[2], D.n1, 0.55); disc(g, x, y, rad + 0.9); g.globalAlpha = 0.85; g.fillStyle = mix(D.paper, AM[0], 0.35); disc(g, x, y - 0.3, rad - 0.2);
        g.globalAlpha = 1; g.fillStyle = mix(AM[2], D.ink, 0.5); g.fillRect(Math.round(x), Math.round(y), 1, 1); g.fillStyle = D.cream; g.fillRect(Math.round(x - rad * 0.45), Math.round(y - rad * 0.55), 1, 1);
      }
      // the label beat: the whole membrane traced in cream
      const lk = P(t, tl, 1.2, "io");
      if (lk > 0) {
        g.fillStyle = D.cream; const yMax = 360 * lk;
        for (let y = 0; y < yMax; y++) { if (Math.hypot(edgeX(y, t) - CX, y - CY) > FR - 6) continue; g.fillRect(Math.round(edgeX(y, t)) + 2, y, 1, 1); }
        for (const [hx2, hy, rx, ry] of holes) for (let i = 0; i < 40 * lk; i++) { const th = (i / 40) * TAU; g.fillRect(Math.round(hx2 + Math.cos(th) * (rx + 1)), Math.round(hy + Math.sin(th) * (ry + 1)), 1, 1); }
        g.globalAlpha = P(t, tl + 0.3, 0.5); PX.otext(g, "ONE CELL", 300, 300, { col: D.cream, align: "center" }); g.globalAlpha = 1;
      }
      // reticle: faint crosshair with ticks
      g.globalAlpha = 0.22; g.fillStyle = D.ink; g.fillRect(CX - FR, CY, FR * 2, 1); g.fillRect(CX, CY - FR, 1, FR * 2);
      for (let i = -8; i <= 8; i++) { g.fillRect(CX + i * 18, CY - (i % 2 ? 2 : 4), 1, i % 2 ? 5 : 9); g.fillRect(CX - (i % 2 ? 2 : 4), CY + i * 18, i % 2 ? 5 : 9, 1); }
      g.globalAlpha = 1;
      g.drawImage(ring, 0, 0);
      PX.vignette(g, 0.3);
    };
  };
  // ======================================================================================
  // log_macro (4.0): low macro view of a rotting log in a dim forest at dusk; moss, droplets, a beetle on top;
  // yellow slime fans creep slowly across the bark. o.drip 2.2 a drop falls from a fern.
  K.log_macro = (o) => {
    const top = (x) => 150 + 7 * Math.sin(x * 0.011 + 0.4) + 3 * Math.sin(x * 0.037), BOT = 338, END = 560;
    const onFace = (x, y) => x < END - 4 + 6 * Math.sin(y * 0.05) && y > top(x) + 4 && y < BOT - 4;
    const nt = mknet({ seed: 81, box: [-20, 140, 600, 210], sp: 6, ok: onFace, wall: true, src: [[-14, 250]], wj: 0.8, cost: (x, y) => 1.4 * fbm(x / 40, y / 22, 6), lobe: 16 });
    const fan = mkfan(nt, { box: [0, 140, 580, 210], ok: onFace, lobe: 16, cell: 8, seed: 12 });
    const bark0 = hx(mix(D.n1, D.lampD, 0.12)), bark1 = hx(mix(D.n3, D.lampD, 0.3)), barkHi = hx(mix(D.n5, D.lampD, 0.35)), mossD = hx(mix(D.moss[2], D.n1, 0.35)), mossM = hx(mix(D.moss[1], D.n3, 0.5)), mossL = hx(mix(D.moss[0], D.n4, 0.3));
    // far forest (trunks in mist), mid ferns, the log
    const far = pix(760, 300, (x, y) => { const sky = mixv(hx(mix(D.n2, D.steel[2], 0.35)), hx(mix(D.n4, D.lampD, 0.3)), clamp(1 - Math.abs(y - 150) / 130, 0, 1) * 0.8);
      const tr = fbm(x / 26, 0.5, 3), trunk = tr > 0.58 || fbm(x / 9, 3.5, 8) > 0.74; let c = trunk ? mixv(hx(D.n1), sky, 0.25 + 0.4 * clamp(1 - Math.abs(y - 140) / 160, 0, 1) * (tr > 0.66 ? 0.3 : 1)) : sky;
      return mixv(c, hx(D.n1), clamp((y - 180) / 120, 0, 1) * 0.6); });
    const litter = pix(760, 200, (x, y) => { const n = fbm(x / 7, y / 4, 31), m = hash(x >> 1, y >> 1, 4); let cc = mixv(hx(mix(D.n0, D.lampD, 0.1)), hx(mix(D.n2, D.lampD, 0.3)), clamp(n * 0.9 - y / 400, 0, 1));
      if (m > 0.93) cc = mixv(cc, hx(mix(D.rust[2], D.n2, 0.4)), 0.6); else if (m < 0.05) cc = mixv(cc, hx(D.moss[2]), 0.6); return cc; });
    const mid = bake(760, 420, (g) => {
      const r = PX.rnd(5), col = mix(D.n1, D.moss[2], 0.45), colL = mix(D.n2, D.moss[2], 0.7);
      for (let f = 0; f < 9; f++) { const bx = 30 + f * 86 + r() * 30, by = 200 + r() * 20, h = 60 + r() * 50, lean = (r() - 0.5) * 1.2;
        for (let k = 0; k < 3; k++) { const ang = -1.57 + lean + (k - 1) * 0.55, pts = []; for (let i = 0; i <= 14; i++) { const q = i / 14; pts.push([bx + Math.cos(ang + q * 0.9 * (k - 1 || 0.4)) * h * q, by + Math.sin(ang) * h * q + q * q * 22]); }
          for (let i = 0; i < 14; i++) { PX.line(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], col); PX.line(g, pts[i][0] + 1, pts[i][1], pts[i + 1][0] + 1, pts[i + 1][1], col); const l = 12 * (1 - i / 14) + 3; PX.line(g, pts[i][0], pts[i][1], pts[i][0] - l, pts[i][1] + l * 0.6, i % 3 ? col : colL); PX.line(g, pts[i][0], pts[i][1], pts[i][0] + l, pts[i][1] + l * 0.5, col); PX.line(g, pts[i][0], pts[i][1] + 1, pts[i][0] - l, pts[i][1] + l * 0.6 + 1, col); } } }
      g.drawImage(litter, 0, 224); g.fillStyle = mix(D.n1, D.moss[2], 0.3); g.fillRect(0, 222, 760, 3);
      // a little cluster of pale mushrooms
      for (const [x, s2] of [[520, 7], [532, 5], [512, 4]]) { R(g, x - 1, 226 - s2 * 2, 2, s2 * 2, mix(D.paperD, D.n3, 0.5)); g.fillStyle = mix(D.paperD, D.n3, 0.35); for (let yy = 0; yy < s2; yy++) g.fillRect(x - s2 + yy * 0.6, 226 - s2 * 2 - s2 + yy, (s2 - yy * 0.6) * 2, 1); }
    });
    const log = pix(640, 360, (x, y) => {
      const ty = top(x);
      if (x >= END + 30 || y < ty - 2 || y > BOT + 22) return null;
      if (y > BOT) return [0, 0, 0, Math.round(170 * (1 - (y - BOT) / 22))];
      // cut end of the log (rings, rotten heart)
      const ex = END + 6 * Math.sin(y * 0.05), cyE = (ty + BOT) / 2, ry = (BOT - ty) / 2;
      if (x >= ex - 26) { const u = (x - ex) / 26, v = (y - cyE) / ry, rr = Math.hypot(u, v); if (rr > 1) { if (x >= ex) return null; } else {
        const ring = Math.sin(rr * 30 + fbm(x / 6, y / 6, 4) * 4) > 0.3; let c = mixv(hx(mix(D.paperD, D.n3, 0.55)), hx(mix(D.lampD, D.n2, 0.45)), ring ? 0.7 : 0.2);
        if (rr < 0.35) c = mixv(c, hx(D.n1), 0.7 - rr); if (rr > 0.9) c = mixv(c, bark0, 0.8); if (rr > 0.84 && rr <= 0.9 && u < 0) c = mixv(c, barkHi, 0.5); return mixv(c, hx(D.n1), clamp(v * 0.4 + 0.1, 0, 0.45)); } }
      const v = (y - ty) / (BOT - ty), L = clamp(1 - v * 1.2, 0, 1) * (0.6 + 0.4 * clamp(1 - x / 700, 0, 1));
      const furrow = fbm(x / 70 + fbm(x / 90, y / 30, 2) * 2, y / 2.6, 7), knot = fbm(x / 30, y / 30, 19);
      let c = mixv(bark0, bark1, clamp(L * 0.85 + (furrow - 0.5) * 0.7 + (knot - 0.5) * 0.3, 0, 1));
      if (furrow < 0.34) c = mixv(c, hx(D.n0), 0.4); else if (furrow > 0.66) c = mixv(c, barkHi, 0.3 * L + 0.08);
      if (y < ty + 2) c = mixv(c, barkHi, 0.8);
      const mz = fbm(x / 18, y / 12, 21) - v * 2.2; // moss creeping down from the top
      if (mz > 0.3) { const k = clamp((mz - 0.3) * 4, 0, 1); c = mixv(mossD, mossM, clamp(k * 0.6 + L * 0.3 + (hash(x, y, 6) - 0.5) * 0.3, 0, 1)); if (mz > 0.46 && hash(x, y, 5) < 0.12) c = mixv(c, mossL, 0.35); c = mixv(c, hx(D.n1), 0.25 * (1 - L)); }
      if (hash(x >> 1, y >> 1, 77) < 0.004 && v > 0.3) c = mixv(c, hx(D.paperD), 0.5); // lichen specks
      return c;
    });
    const drops = [[140, 162], [236, 156], [318, 160], [402, 158], [470, 166], [90, 214], [520, 248], [300, 300], [196, 276]];
    const beetle = (g, x, y, t) => {
      const st = Math.floor(t * 10) % 2; g.fillStyle = D.n0;
      for (let i = 0; i < 3; i++) { R(g, x - 4 + i * 4, y + 3, 1, 2 + ((i + st) % 2), D.n0); R(g, x - 5 + i * 4 + ((i + st) % 2), y + 5, 1, 1, D.n0); }
      g.fillStyle = mix(D.n1, D.plum[2], 0.4); for (let yy = 0; yy < 5; yy++) { const w = Math.round(Math.sqrt(1 - ((yy - 2.5) / 3) ** 2) * 7); g.fillRect(x - w, y - 2 + yy, 2 * w, 1); }
      R(g, x - 9, y, 3, 3, D.n0); R(g, x - 11, y - 1, 2, 1, D.n1); R(g, x - 4, y - 2, 6, 1, mix(D.teal[1], D.n3, 0.4)); R(g, x, y - 2, 1, 5, D.n0);
    };
    return (g, t, d, c) => {
      const k = d / 4, drip = dflt(o.drip, 2.2, k);
      PX.par(g, c, 0.35, () => { g.drawImage(far, -60, -20); PX.glow(g, 120, 90, 160, D.lamp, 0.12); PX.particles(g, 3, 30, t, [0, 40, 640, 160], { vy: -1, vx: 2, col: D.cream, a: 0.18 }); });
      // soft bokeh in the far canopy
      PX.par(g, c, 0.4, () => { const r = PX.rnd(7); for (let i = 0; i < 9; i++) { const x = r() * 640, y = 30 + r() * 110, rr = 6 + r() * 10; g.globalAlpha = 0.06 + 0.03 * Math.sin(t + i); g.fillStyle = i % 3 ? D.lamp : D.glass; disc(g, x, y, rr); } g.globalAlpha = 1; });
      PX.par(g, c, 0.65, () => g.drawImage(mid, -60, -40));
      g.drawImage(log, 0, 0);
      // slime creeping across the bark
      const F = 370 + (22 * t) / k;
      const lg = layer();
      drawFan(lg, nt, fan, F, { W: 46, lace: 0.25 });
      tubes(lg, netSegs(nt, { F, T: 4, r0: 0.4, rk: 0.33, rmax: 4, G: 90 }), { t, sh: 0.55, wob: 0.35, pul: { a: 0.12, k: 0.08, w: 2.4 }, flow: { v: 16, lam: 26, col: D.lamp } });
      g.drawImage(LY, 0, 0);
      // light from the low sun across the top of the log
      PX.glow(g, 60, 120, 260, D.lamp, 0.1);
      // droplets
      drops.forEach(([x, y], i) => { const yy = i < 5 ? top(x) - 2 : y, r = i % 3 ? 1.6 : 2.4, tw = 0.6 + 0.4 * Math.sin(t * 1.4 + i);
        g.globalAlpha = 0.55; g.fillStyle = mix(D.glass, D.n3, 0.4); disc(g, x, yy, r); g.globalAlpha = 0.9 * tw; g.fillStyle = D.cream; g.fillRect(Math.round(x - r * 0.4), Math.round(yy - r * 0.5), 1, 1); g.globalAlpha = 1; });
      // a drop falls from a fern tip onto the log
      const fk = t - drip; if (fk > -0.6 && fk < 0.9) { const fx = 182, fy0 = 104, swell = clamp((fk + 0.6) / 0.6, 0, 1), yy = fk < 0 ? fy0 : fy0 + 260 * fk * fk;
        if (yy < top(fx) - 2) { g.fillStyle = mix(D.glass, D.n3, 0.3); disc(g, fx, yy, 1 + swell); R(g, fx, yy - 1, 1, 1, D.cream); }
        else { const sp = clamp((yy - top(fx)) / 40, 0, 1); g.globalAlpha = 1 - sp; for (const s2 of [-1, 1]) R(g, fx + s2 * (2 + sp * 6), top(fx) - 2 - sp * 4 + sp * sp * 6, 1, 1, D.cream); g.globalAlpha = 1; } }
      // beetle trundling along the top
      const bx = 470 - (9 * t) / k; beetle(g, bx, top(bx) - 5, t);
      // out-of-focus foreground moss and a leaf (depth)
      PX.par(g, c, 1.35, () => { g.fillStyle = mix(D.n0, D.moss[2], 0.25); for (let i = 0; i < 9; i++) disc(g, -10 + i * 16, 372 - Math.abs(Math.sin(i * 1.3)) * 30, 16);
        g.fillStyle = mix(D.n0, D.moss[2], 0.35); poly(g, [[560, 360], [610, 300], [660, 290], [650, 360]], mix(D.n0, D.moss[2], 0.35)); });
      PX.vignette(g, 0.6);
    };
  };

  // ======================================================================================
  // no_brain (5.6): a lab notebook on the bench. Left page: a pencil sketch of the yellow blob. Right page: a checklist
  // BRAIN / NEURONS / EYES, each struck through by the pencil at o.x [0.8, 1.6, 2.4]; o.maze 4.0 a small maze sketch + tick.
  K.no_brain = (o) => {
    const PX0 = 92, PY0 = 34, PW = 456, PH = 292, MIDX = PX0 + PW / 2;
    const bench = benchTex(640, 360, 0, 0, 60, -40, 33);
    const items = ["BRAIN", "NEURONS", "EYES"], IX = MIDX + 44, IY = [84, 120, 156];
    const blob = []; { const r = PX.rnd(14); for (let i = 0; i < 26; i++) { const th = (i / 26) * TAU, rr = 54 * (0.75 + 0.3 * fbm(Math.cos(th) * 2 + 3, Math.sin(th) * 2 + 3, 2)) * (1 + 0.25 * Math.sin(th * 3 + 1)); blob.push([PX0 + 116 + Math.cos(th) * rr * 1.15, PY0 + 150 + Math.sin(th) * rr * 0.85]); } }
    const blobVeins = [[[PX0 + 70, PY0 + 160], [PX0 + 110, PY0 + 150], [PX0 + 150, PY0 + 120], [PX0 + 168, PY0 + 108]], [[PX0 + 110, PY0 + 150], [PX0 + 140, PY0 + 176], [PX0 + 170, PY0 + 190]], [[PX0 + 90, PY0 + 154], [PX0 + 96, PY0 + 120], [PX0 + 118, PY0 + 100]]];
    const mz = [[10, 0, 40, 0], [0, 0, 0, 30], [40, 0, 40, 22], [0, 30, 28, 30], [10, 8, 10, 22], [10, 8, 30, 8], [20, 16, 33, 16], [20, 16, 20, 30], [30, 22, 30, 30]];
    const MX0 = MIDX + 70, MY0 = PY0 + 196, MZP = dense([[5, -4], [5, 26], [15, 26], [15, 12], [37, 12], [37, 26], [46, 26]].map(([x, y]) => [MX0 + x * 1.4, MY0 + y * 1.4]), 1), MZL = MZP[MZP.length - 1][2];
    const page = bake(640, 360, (g) => {
      g.drawImage(bench, 0, 0);
      R(g, PX0 + 6, PY0 + 8, PW, PH, "rgba(0,0,0,0.45)");
      g.drawImage(pix(PW, PH, (x, y) => { const X = x + PX0, Y = y + PY0, L = clamp(1 - Math.hypot(X - 150, Y - 20) / 560, 0, 1), sp = Math.abs(X - MIDX), n = hash(X, Y, 2) * 0.05 + fbm(X / 30, Y / 30, 8) * 0.06;
        let cc = mixv(hx(mix(D.paperD, D.n3, 0.55)), hx(mix(D.paper, D.paperD, 0.25)), clamp(L * 0.95 + n - 0.1, 0, 1)); if (sp < 10) cc = mixv(cc, hx(D.n2), (1 - sp / 10) * 0.45);
        if ((y - 30) % 18 === 0 && y > 20 && Math.abs(X - MIDX) > 14) cc = mixv(cc, hx(D.teal[1]), 0.18);
        if (x === 0 || x === PW - 1 || y === PH - 1) cc = mixv(cc, hx(D.paperD), 0.6); return cc; }), PX0, PY0);
      // the culture itself, in a dish at the corner of the bench
      g.fillStyle = "rgba(0,0,0,0.45)"; disc(g, 612, 30, 50); g.fillStyle = mix(D.n3, D.glass, 0.2); disc(g, 606, 24, 48); g.fillStyle = mix(D.n1, D.teal[2], 0.15); disc(g, 606, 24, 45);
      { const dn = mknet({ seed: 91, box: [560, -24, 92, 92], sp: 4, ok: (x, y) => Math.hypot(x - 606, y - 24) < 42, src: [[640, 10]], wj: 0.8, lobe: 6 });
        tubes(g, netSegs(dn, { F: 1e7, T: 3, r0: 0.4, rk: 0.35, rmax: 3 }), { t: 0, sh: 0.4 }); }
      g.globalAlpha = 0.4; g.fillStyle = D.glass; for (let i = 0; i < 40; i++) { const th = 2.2 + i * 0.03; g.fillRect(Math.round(606 + Math.cos(th) * 46), Math.round(24 + Math.sin(th) * 46), 1, 1); } g.globalAlpha = 1;
      // coffee ring on the right page
      g.globalAlpha = 0.28; g.fillStyle = mix(D.lampD, D.rust[2], 0.4); for (let i = 0; i < 160; i++) { const th = (i / 160) * TAU, rr = 24 + Math.sin(th * 3) * 0.8; disc(g, PX0 + PW - 70 + Math.cos(th) * rr, PY0 + PH - 64 + Math.sin(th) * rr, i % 5 ? 0.6 : 1.2); }
      g.globalAlpha = 0.08; disc(g, PX0 + PW - 70, PY0 + PH - 64, 22); g.globalAlpha = 1;
      // the sketch: yellow pencil fill (hatching) + graphite outline + veins
      g.save(); g.beginPath(); blob.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
      for (let k = -120; k < 160; k += 3) PX.line(g, PX0 + 40 + k, PY0 + 230, PX0 + 140 + k, PY0 + 70, k % 2 ? mix(AM[1], D.paper, 0.35) : mix(AM[0], D.paper, 0.3)); g.restore();
      for (let i = 0; i < blob.length; i++) { const [ax, ay] = blob[i], [bx, by] = blob[(i + 1) % blob.length]; PX.line(g, ax, ay, bx, by, mix(D.ink, D.n4, 0.25)); if (i % 3) PX.line(g, ax + 1, ay, bx + 1, by, mix(D.ink, D.paper, 0.5)); }
      for (const v of blobVeins) { const pl = chaikin(v, 2); for (let i = 0; i + 1 < pl.length; i++) { PX.line(g, pl[i][0], pl[i][1], pl[i + 1][0], pl[i + 1][1], AM[2]); PX.line(g, pl[i][0], pl[i][1] + 1, pl[i + 1][0], pl[i + 1][1] + 1, mix(AM[2], D.paper, 0.4)); } }
      // checklist boxes + handwritten words
      items.forEach((w, i) => PX.box(g, IX - 22, IY[i] + 3, 10, 10, mix(D.ink, D.paper, 0.2)));
    });
    return (g, t, d, c) => {
      const k = d / 5.6, xs = dflt(o.x, [0.8, 1.6, 2.4], k), tm = dflt(o.maze, 4.0, k);
      g.drawImage(page, 0, 0);
      PX.glow(g, 150, 30, 340, D.lamp, 0.12);
      let pen = [MIDX + 150, 300, 0.2];  // pencil tip position
      items.forEach((w, i) => PX.text(g, w, IX, IY[i] - 2, { font: "v", size: 20, col: mix(D.ink, D.n4, 0.15) }));
      items.forEach((w, i) => {
        const k = P(t, xs[i], 0.35, "io"), wd = PX.tw(g, w, { font: "v", size: 20 }), y = IY[i] + 8;
        if (k > 0) { PX.line(g, IX - 3, y + 1, IX - 3 + (wd + 6) * k, y - 1, D.ink); PX.line(g, IX - 3, y + 2, IX - 3 + (wd + 6) * k, y, mix(D.ink, D.paper, 0.4));
          const kb = P(t, xs[i] + 0.35, 0.2); if (kb > 0) { PX.line(g, IX - 21, IY[i] + 4, IX - 21 + 8 * kb, IY[i] + 4 + 8 * kb, D.rust[2]); PX.line(g, IX - 13, IY[i] + 4, IX - 13 - 8 * kb, IY[i] + 4 + 8 * kb, D.rust[2]); } }
        if (t > xs[i] - 0.3 && t < xs[i] + 0.6) pen = t < xs[i] ? [lerp(pen[0], IX - 3, P(t, xs[i] - 0.3, 0.3, "io")), lerp(pen[1], y, P(t, xs[i] - 0.3, 0.3, "io")), 0.2] : t < xs[i] + 0.35 ? [IX - 3 + (wd + 6) * k, y - 1 + k * -2, 0.2] : [IX - 21 + 8 * P(t, xs[i] + 0.35, 0.2), IY[i] + 8, 0.2];
      });
      // the maze sketch draws itself, then a tick
      const mk = P(t, tm, 0.9, "io");
      if (mk > 0) { const n = mz.length * mk; mz.forEach(([x1, y1, x2, y2], i) => { const f = clamp(n - i, 0, 1); if (f > 0) { PX.line(g, MX0 + x1 * 1.4, MY0 + y1 * 1.4, MX0 + lerp(x1, x2, f) * 1.4, MY0 + lerp(y1, y2, f) * 1.4, mix(D.ink, D.n4, 0.2)); } });
        if (mk >= 1) { const sk = P(t, tm + 0.9, 0.5, "io"); g.fillStyle = AM[1]; for (let s = 0; s < MZL * sk; s++) { const [x, y] = at(MZP, s); disc(g, x, y, 1); } }
        if (t > tm - 0.3 && t < tm + 0.9) pen = [MX0 + 56 * mk, MY0 + 20 + Math.sin(mk * 20) * 14, 0.2];
        const tk = P(t, tm + 1.3, 0.35, "io"); if (tk > 0) { const ax = MX0 + 72, ay = MY0 + 22; PX.line(g, ax, ay, ax + 5 * Math.min(1, tk * 2), ay + 6 * Math.min(1, tk * 2), D.moss[2]); if (tk > 0.5) PX.line(g, ax + 5, ay + 6, ax + 5 + 12 * (tk - 0.5) * 2, ay + 6 - 16 * (tk - 0.5) * 2, D.moss[2]);
          PX.line(g, ax + 1, ay, ax + 6 * Math.min(1, tk * 2), ay + 6 * Math.min(1, tk * 2), D.moss[1]); if (tk > 0.5) PX.line(g, ax + 6, ay + 6, ax + 6 + 12 * (tk - 0.5) * 2, ay + 6 - 16 * (tk - 0.5) * 2, D.moss[1]);
          if (t < tm + 1.7) pen = [ax + 17 * tk, ay + 6 - 10 * tk, 0.2]; }
      }
      // the pencil (hexagonal, yellow-ochre paint, graphite tip), tip at pen
      const [px, py] = pen, ang = -0.75, L = 74, ca = Math.cos(ang), sa = Math.sin(ang), ex = px + ca * L, ey = py + sa * L;
      PX.par(g, c, 1, () => {
        const nx = -sa * 3.5, ny = ca * 3.5, bx2 = px + ca * 10, by2 = py + sa * 10;
        const sh = [[px + 4, py + 6], [ex + 12 + nx * 0.8, ey + 12 + ny * 0.8], [ex + 12 - nx * 0.8, ey + 12 - ny * 0.8]]; g.globalAlpha = 0.3; poly(g, sh, D.n0); g.globalAlpha = 1;
        poly(g, [[px, py], [bx2 + nx, by2 + ny], [bx2 - nx, by2 - ny]], mix(D.paper, D.lampD, 0.3)); R(g, px, py, 2, 2, D.ink);
        poly(g, [[bx2 + nx, by2 + ny], [ex + nx, ey + ny], [ex - nx, ey - ny], [bx2 - nx, by2 - ny]], mix(AM[2], D.lampD, 0.5));
        PX.line(g, bx2 + nx * 0.4, by2 + ny * 0.4, ex + nx * 0.4, ey + ny * 0.4, mix(AM[1], D.lamp, 0.4));
        poly(g, [[ex + nx, ey + ny], [ex + ca * 4 + nx, ey + sa * 4 + ny], [ex + ca * 4 - nx, ey + sa * 4 - ny], [ex - nx, ey - ny]], D.n6);
        poly(g, [[ex + ca * 4 + nx, ey + sa * 4 + ny], [ex + ca * 10 + nx, ey + sa * 10 + ny], [ex + ca * 10 - nx, ey + sa * 10 - ny], [ex + ca * 4 - nx, ey + sa * 4 - ny]], mix(D.rose[1], D.n4, 0.3));
      });
      PX.particles(g, 41, 18, t, [60, 0, 300, 200], { vy: -2, vx: 1, col: D.lamp, a: 0.3 });
      PX.vignette(g, 0.5);
    };
  };
  // the researcher, seated in profile facing right (lab coat, dark hair in a bun, glasses, medium skin).
  // x,y = seat centre. pose: k (0 typing .. 1 chin-on-hand), tp = typing phase
  const SK = [mix(D.lampD, D.rose[0], 0.35), mix(D.lampD, D.rose[2], 0.5), mix(D.rose[2], D.ink, 0.4)];
  const COAT = [mix(D.cream, D.lamp, 0.3), mix(D.paperD, D.n5, 0.3), mix(D.paperD, D.n3, 0.55)];
  const researcher = (g, x, y, k, tp, t) => {
    const br = Math.sin(t * 1.6) * 0.6, slump = k * 3;
    // stool
    R(g, x - 22, y, 44, 4, D.n4); R(g, x - 22, y, 44, 1, D.n6); R(g, x - 18, y + 4, 3, 74, D.n3); R(g, x + 15, y + 4, 3, 74, D.n3); R(g, x - 16, y + 50, 32, 2, D.n3);
    // legs (dark trousers) + shoes
    poly(g, [[x - 10, y - 12], [x + 40, y - 12], [x + 44, y - 1], [x - 8, y]], mix(D.n3, D.steel[2], 0.3));
    R(g, x - 8, y - 12, 50, 2, mix(D.n4, D.steel[2], 0.3));
    poly(g, [[x + 32, y - 10], [x + 44, y - 8], [x + 50, y + 56], [x + 40, y + 56]], mix(D.n2, D.steel[2], 0.3));
    R(g, x + 38, y + 56, 20, 6, D.n1); R(g, x + 38, y + 56, 20, 1, D.n4);
    // torso (lab coat), slightly hunched; drapes over the thigh
    const sx = x + 10 + slump, sy = y - 76 + slump + br;
    poly(g, [[x - 14, y + 2], [x + 22, y + 2], [x + 30, y - 16], [sx + 16, sy + 6], [sx - 8, sy + 2], [x - 16, y - 30]], COAT[1]);
    poly(g, [[x - 14, y + 2], [x - 4, y + 2], [sx - 4, sy + 8], [sx - 8, sy + 2], [x - 16, y - 30]], COAT[2]);
    PX.line(g, sx + 15, sy + 7, x + 29, y - 15, COAT[0]); PX.line(g, sx + 14, sy + 8, x + 28, y - 14, COAT[0]);
    R(g, sx + 6, sy + 12, 1, 40, COAT[2]); R(g, sx + 9, sy + 26, 2, 2, D.n5); R(g, sx + 9, sy + 40, 2, 2, D.n5); // placket + buttons
    poly(g, [[sx + 8, sy + 4], [sx + 16, sy + 6], [sx + 10, sy + 14]], COAT[0]); // collar
    // neck + head
    const hx2 = sx + 12 + k * 2, hy = sy - 16 + k * 2;
    R(g, sx + 6, sy - 6, 9, 10, SK[1]); R(g, sx + 6, sy - 6, 3, 10, SK[2]);
    // hair mass (back + top) and the bun, then the face on top of it
    g.fillStyle = D.n0; disc(g, hx2 - 2, hy - 2, 12); g.fillStyle = mix(D.n0, D.n3, 0.35); disc(g, hx2 - 14, hy - 9, 6); g.fillStyle = D.n0; disc(g, hx2 - 14, hy - 9, 5);
    R(g, hx2 - 17, hy - 12, 3, 1, mix(D.n2, D.lampD, 0.6)); R(g, hx2 - 4, hy - 14, 12, 1, mix(D.n2, D.lampD, 0.6));
    g.fillStyle = SK[1]; disc(g, hx2 + 4, hy + 2, 8.5); g.fillStyle = SK[0]; disc(g, hx2 + 6, hy + 1, 6.5);
    R(g, hx2 + 12, hy - 1, 3, 5, SK[1]); R(g, hx2 + 13, hy - 1, 2, 3, SK[0]); // nose
    R(g, hx2 + 8, hy + 7, 4, 1, SK[2]); R(g, hx2 + 1, hy + 9, 8, 1, SK[2]); // mouth, jaw shadow
    R(g, hx2 - 3, hy - 9, 12, 4, D.n0); R(g, hx2 + 6, hy - 8, 6, 2, D.n0); R(g, hx2 - 3, hy - 9, 10, 1, mix(D.n2, D.lampD, 0.6)); // hairline / fringe
    g.fillStyle = SK[1]; disc(g, hx2 - 1, hy + 2, 2.5); R(g, hx2 - 1, hy + 2, 1, 1, SK[2]); // ear
    // glasses
    PX.box(g, hx2 + 6, hy - 3, 7, 5, D.n6); R(g, hx2, hy - 2, 6, 1, D.n6); R(g, hx2 + 7, hy - 2, 2, 1, D.cream);
    R(g, hx2 + 10, hy - 1, 1, 2, D.ink); // eye
    // arms
    if (k < 0.5) { // typing: upper arm down, forearm forward to the keys
      const bob = Math.round(Math.sin(tp * 19)) , bob2 = Math.round(Math.sin(tp * 17 + 1.2));
      poly(g, [[sx + 2, sy + 10], [sx + 14, sy + 12], [sx + 18, sy + 42], [sx + 6, sy + 44]], COAT[2]);
      poly(g, [[sx + 6, sy + 34], [sx + 18, sy + 38], [x + 64, y - 25 + bob], [x + 64, y - 33 + bob]], COAT[1]); PX.line(g, sx + 10, sy + 34, x + 63, y - 33 + bob, COAT[0]); R(g, x + 62, y - 31 + bob, 8, 4, SK[1]); R(g, x + 66, y - 29 + bob2, 6, 3, SK[0]);
    } else { // waiting: elbow on the bench, chin on the hand
      poly(g, [[sx + 2, sy + 10], [sx + 14, sy + 12], [x + 50, y - 22], [x + 40, y - 18]], COAT[2]);
      poly(g, [[x + 40, y - 24], [x + 52, y - 22], [hx2 + 8, hy + 12], [hx2 + 2, hy + 10]], COAT[1]); g.fillStyle = SK[1]; disc(g, hx2 + 6, hy + 11, 4); R(g, hx2 + 6, hy + 8, 3, 2, SK[0]);
    }
  };
  const snail = (g, x, y, t) => {
    const st = Math.sin(t * 3) * 0.6; // body stretch
    R(g, x - 14, y - 2, 24 + st, 3, mix(D.paperD, D.n4, 0.35)); R(g, x - 14, y - 2, 24 + st, 1, mix(D.paper, D.n5, 0.3)); R(g, x - 16, y, 4, 1, mix(D.paperD, D.n4, 0.5));
    R(g, x + 8 + st, y - 7, 1, 6, mix(D.paperD, D.n4, 0.35)); R(g, x + 11 + st, y - 6, 1, 5, mix(D.paperD, D.n4, 0.35)); R(g, x + 8 + st, y - 8, 1, 1, D.ink); R(g, x + 11 + st, y - 7, 1, 1, D.ink);
    g.fillStyle = mix(D.n2, D.lampD, 0.35); disc(g, x - 4, y - 8, 7); g.fillStyle = mix(D.n4, D.lampD, 0.55); disc(g, x - 4, y - 8, 5); g.fillStyle = mix(D.n2, D.lampD, 0.4); disc(g, x - 3, y - 8, 2.5); g.fillStyle = mix(D.n4, D.lampD, 0.55); disc(g, x - 3, y - 8, 1);
    g.fillStyle = D.lamp; g.fillRect(x - 3, y - 15, 3, 1); g.fillRect(x + 1, y - 13, 1, 2);
    g.globalAlpha = 0.25; R(g, x - 40, y, 24, 1, D.glass); g.globalAlpha = 1; // slime trail of its own
  };

  // ======================================================================================
  // slime_slow (5.5): gag. The researcher types on a keyboard plugged into a petri dish of slime. Nothing happens;
  // the wall clock spins through hours; a snail on the bench overtakes the slime's creeping front.
  // o.wait 2.6 she stops typing and props her chin on her hand.
  K.slime_slow = (o) => {
    const BY = 236, DX0 = 300, DX1 = 356;
    const wall = pix(700, 330, (x, y) => { const L = clamp(1 - Math.hypot(x - 600, y - 170) / 560, 0, 1), n = fbm(x / 60, y / 60, 4) * 0.1 + hash(x, y, 1) * 0.04; let c = mixv(hx(D.n1), hx(mix(D.n3, D.lampD, 0.3)), clamp(L * 0.75 + n, 0, 1));
      if (y > 236) c = mixv(c, hx(D.n1), 0.3); if (y === 236) c = mixv(c, hx(D.n4), 0.4); return c; });
    const back = bake(700, 330, (g) => {
      g.drawImage(wall, 0, 0);
      // pinboard with notes on the left
      R(g, 60, 50, 150, 96, mix(D.lampD, D.n2, 0.6)); R(g, 60, 50, 150, 2, mix(D.lampD, D.n3, 0.4)); PX.box(g, 59, 49, 152, 98, D.n1);
      [[72, 60, 40, 30, 0.05], [122, 58, 34, 44, -0.06], [166, 66, 32, 26, 0.08], [86, 100, 50, 34, -0.03], [150, 104, 44, 30, 0.04]].forEach(([x, y, w, h, a], i) => {
        g.save(); g.translate(x, y); g.rotate(a); R(g, 2, 2, w, h, "rgba(0,0,0,0.3)"); R(g, 0, 0, w, h, mix(D.paperD, D.n3, 0.35)); for (let k = 0; k < h / 6 - 1; k++) R(g, 4, 6 + k * 6, w - 8 - (k % 2) * 8, 1, mix(D.ink, D.paperD, 0.6));
        if (i === 3) { g.fillStyle = mix(AM[2], D.paperD, 0.3); disc(g, w * 0.7, h * 0.55, 6); } g.fillStyle = D.rust[2]; disc(g, w / 2, 2, 1.5); g.restore(); });
      // shelf with brown bottles
      R(g, 540, 92, 140, 4, mix(D.n3, D.lampD, 0.35)); R(g, 540, 92, 140, 1, mix(D.lampD, D.n4, 0.4));
      [[552, 70, 12, 22], [570, 64, 14, 28], [592, 74, 10, 18], [610, 66, 16, 26]].forEach(([x, y, w, h]) => { R(g, x, y, w, h, mix(D.rust[2], D.n1, 0.45)); R(g, x + 1, y, 1, h, mix(D.rust[1], D.n3, 0.5)); R(g, x + w / 2 - 2, y - 5, 4, 5, D.n2); R(g, x + 2, y + h / 2 - 3, w - 4, 6, mix(D.paperD, D.n3, 0.4)); });
    });
    const bench = bake(640, 360, (g) => {
      R(g, 0, 296, 640, 64, D.n1); // floor
      R(g, 186, BY - 6, 454, 6, mix(D.n3, D.lampD, 0.2)); R(g, 186, BY - 6, 454, 1, mix(D.n5, D.lampD, 0.3)); R(g, 186, BY, 454, 9, D.n2); R(g, 186, BY + 9, 454, 1, D.n0);
      R(g, 196, BY + 10, 6, 90, D.n2); R(g, 600, BY + 10, 6, 90, D.n2); R(g, 196, BY + 10, 1, 90, D.n3); R(g, 400, BY + 10, 240, 64, mix(D.n1, D.n2, 0.5)); R(g, 400, BY + 10, 240, 1, D.n3); R(g, 516, BY + 40, 6, 2, D.n4);
      // monitor (old, generic) showing only a cursor
      R(g, 232, 222, 28, 8, D.n4); R(g, 238, 216, 16, 8, D.n3);
      R(g, 214, 158, 64, 58, D.n4); R(g, 214, 158, 64, 2, D.n6); R(g, 276, 158, 2, 58, D.n3); R(g, 220, 164, 52, 44, D.n1);
      // desk lamp at the right end
      R(g, 560, BY - 10, 36, 4, D.n3); R(g, 576, 160, 3, 70, D.n4); poly(g, [[548, 140], [590, 140], [600, 164], [540, 164]], D.n3); R(g, 540, 164, 60, 2, D.lamp);
      // a beaker and a notebook on the bench
      g.globalAlpha = 0.5; R(g, 470, BY - 34, 22, 28, mix(D.glass, D.n3, 0.4)); g.globalAlpha = 0.8; R(g, 470, BY - 34, 1, 28, D.glass); R(g, 491, BY - 34, 1, 28, D.glass); R(g, 470, BY - 7, 22, 1, D.glass);
      g.globalAlpha = 0.6; R(g, 471, BY - 18, 20, 11, mix(D.teal[1], D.n3, 0.3)); g.globalAlpha = 1;
      R(g, 504, BY - 9, 46, 3, mix(D.paperD, D.n3, 0.3)); R(g, 504, BY - 9, 46, 1, D.paper);
    });
    const cab = dense([[268, BY - 8], [282, BY - 6.5], [292, BY - 8.5], [DX0 - 2, BY - 7]], 2);
    return (g, t, d, c) => {
      const ks = d / 5.5, tw = dflt(o.wait, 2.6, ks), k = P(t, tw, 0.5, "io");
      PX.par(g, c, 0.5, () => {
        g.drawImage(back, -30, -10);
        // wall clock spinning through the hours (no numerals)
        dial(g, 424, 76, 24, (0.55 * t) / d + 0.3, 1);
      });
      g.drawImage(bench, 0, 0);
      PX.glow(g, 570, 190, 170, D.lamp, 0.22);
      // screen: nothing happens, only a cursor blinking
      PX.glow(g, 246, 186, 40, D.teal[0], 0.05); if (PX.blink(t, 1.0, 0.55)) R(g, 226, 170, 5, 2, D.teal[0]);
      // keyboard + cable into the dish
      R(g, 206, BY - 10, 62, 4, D.n4); R(g, 206, BY - 10, 62, 1, D.n6); for (let i = 0; i < 12; i++) { const pr = t < tw && (Math.floor(t * 16) + i * 5) % 7 === 0; R(g, 208 + i * 5, BY - 12 + (pr ? 1 : 0), 4, 2, pr ? D.n5 : D.n6); }
      for (let i = 0; i + 1 < cab.length; i++) PX.line(g, cab[i][0], cab[i][1], cab[i + 1][0], cab[i + 1][1], D.n0);
      R(g, DX0 - 4, BY - 9, 4, 3, D.n5);
      // the dish (side view): agar, slime, glass, lid ajar
      R(g, DX0, BY - 9, DX1 - DX0, 3, mix(D.n3, D.teal[2], 0.3));
      const lg = layer(); lg.fillStyle = AM[2];
      for (let x = DX0 + 1; x < DX1 - 1; x++) { const h = 2 + Math.round(1.2 + Math.sin(x * 0.5 + t * 1.2) * 0.8 + Math.sin(x * 0.23) * 1); lg.fillRect(x, BY - 9 - h, 1, h); lg.fillStyle = AM[1]; lg.fillRect(x, BY - 9 - h, 1, 1); lg.fillStyle = AM[2]; }
      // over the rim and along the bench: a thin vein with a tiny fan, creeping at slime speed
      const fx = DX1 + 12 + (2.4 * t) / ks, sg = [[DX1 - 3, BY - 12, 1.4, 0, DX1 + 2, BY - 10, 1.2, 6, 0], [DX1 + 2, BY - 10, 1.2, 6, DX1 + 4, BY - 7, 1.1, 10, 0], [DX1 + 4, BY - 7, 1.1, 10, fx, BY - 7, 1, fx - DX1, 0]];
      tubes(lg, sg, { t, sh: 0.3, flow: { v: 3, lam: 8, col: D.lamp, min: 0.9 } });
      for (let i = -2; i <= 2; i++) { lg.globalAlpha = 0.7; lg.fillStyle = i % 2 ? AM[1] : AM[0]; lg.fillRect(Math.round(fx + 1 + Math.abs(i) * -0.6 + Math.cos(i * 0.5) * 2.5), Math.round(BY - 7 + i * 0.9), 2, 1); }
      lg.globalAlpha = 1; g.drawImage(LY, 0, 0);
      g.globalAlpha = 0.5; R(g, DX0 - 1, BY - 16, 1, 10, D.glass); R(g, DX1, BY - 16, 1, 10, D.glass); R(g, DX0 - 1, BY - 7, DX1 - DX0 + 2, 1, D.glass); g.globalAlpha = 0.7;
      g.save(); g.translate(DX0 - 3, BY - 18); g.rotate(-0.12); R(g, 0, 0, DX1 - DX0 + 6, 2, mix(D.glass, D.n4, 0.3)); R(g, 0, 0, DX1 - DX0 + 6, 1, D.cream); g.restore(); g.globalAlpha = 1;
      // snail on the front edge of the bench, overtaking
      snail(g, Math.round(300 + (18 * t) / ks), BY - 2, t);
      researcher(g, 150, 264, k, t, t);
      // out-of-focus flask in the foreground
      PX.par(g, c, 1.3, () => { g.globalAlpha = 0.5; g.fillStyle = mix(D.n1, D.teal[2], 0.3); poly(g, [[600, 360], [612, 300], [626, 290], [640, 290], [660, 360]], mix(D.n1, D.teal[2], 0.3)); g.globalAlpha = 0.25; R(g, 616, 300, 2, 60, D.glass); g.globalAlpha = 1; });
      PX.particles(g, 51, 20, t, [480, 140, 160, 100], { vy: -2, vx: -1, col: D.lamp, a: 0.4 });
      PX.vignette(g, 0.55);
    };
  };
})();
