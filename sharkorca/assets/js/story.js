// Scenes for "The Great White Shark Has One Weakness. Orcas Found It" in the flat cartoon style.
// Every scene is a pure function of t (seconds from the scene start). SC wraps each one with a documentary camera (o.cam).
const SC = {};
(() => {
  const { W, H, clamp, lerp, smooth, rng, trace, fill, vgrad, ell, circ, line, band, rays, bubbles, cloud, gull, kelp, rock, fish, person, orca, orcaPt, shark, sharkPt, shade } = FL;
  const TAU = Math.PI * 2;
  // keyed value: a number, or [[t, v], ...] eased between keys
  const K = (v, t) => {
    if (!Array.isArray(v)) return v;
    if (t <= v[0][0]) return v[0][1];
    for (let i = 0; i < v.length - 1; i++) if (t < v[i + 1][0]) { const k = smooth(v[i][0], v[i + 1][0], t); return lerp(v[i][1], v[i + 1][1], k); }
    return v[v.length - 1][1];
  };
  // integrated phase for a keyed beat rate, so slowing a tail never jumps
  const phase = (beat, t) => { if (!Array.isArray(beat)) return t * beat * TAU; let p = 0; for (let x = 0; x < t; x += 0.05) p += K(beat, x) * Math.min(0.05, t - x); return p * TAU; };
  // position on a path [[t, x, y], ...] (Catmull-Rom through the keys), with heading
  function P(path, t) {
    if (!Array.isArray(path[0])) return { x: path[0], y: path[1], a: 0 };
    const at = (tt) => {
      if (tt <= path[0][0]) return [path[0][1], path[0][2]];
      const n = path.length; if (tt >= path[n - 1][0]) return [path[n - 1][1], path[n - 1][2]];
      let i = 0; while (i < n - 2 && tt >= path[i + 1][0]) i++;
      const p0 = path[Math.max(0, i - 1)], p1 = path[i], p2 = path[i + 1], p3 = path[Math.min(n - 1, i + 2)];
      const u = (tt - p1[0]) / (p2[0] - p1[0]), u2 = u * u, u3 = u2 * u;
      const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      return [cr(p0[1], p1[1], p2[1], p3[1]), cr(p0[2], p1[2], p2[2], p3[2])];
    };
    const [x, y] = at(t), [x2, y2] = at(t + 0.06), [x1, y1] = at(t - 0.06);
    return { x, y, vx: x2 - x1, vy: y2 - y1 };
  }
  const screen = (ctx, f) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); f(); ctx.restore(); };
  const bufs = {};
  function buf(key) { let c = bufs[key]; if (!c) { c = document.createElement("canvas"); c.width = W; c.height = H; bufs[key] = c; } const x = c.getContext("2d"); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H); return [c, x]; }
  // draw f into a layer, then lay it down faded toward a water colour (distance haze)
  function fogged(ctx, key, fog, col, f) {
    if (!fog) { f(ctx); return; }
    const [c, x] = buf(key); f(x);
    x.globalCompositeOperation = "source-atop"; x.fillStyle = col; x.globalAlpha = fog; x.fillRect(0, 0, W, H); x.globalAlpha = 1; x.globalCompositeOperation = "source-over";
    ctx.drawImage(c, 0, 0);
  }

  // ---------- backgrounds ----------
  const TONE = { blue: ["#36b4e6", "#1a80c2", "#0c4f88"], dark: ["#1d6ea6", "#0e426f", "#06203d"], murky: ["#4aa9b3", "#24727e", "#0f4350"], green: ["#58b6a2", "#2b7f78", "#124a4c"] };
  const FOG = { blue: "#1f86c4", dark: "#0f4573", murky: "#26737f", green: "#2b7f78" };
  function water(ctx, t, o) {
    const tone = o.tone || "blue";
    ctx.fillStyle = vgrad(ctx, 0, H, TONE[tone]); ctx.fillRect(-300, -300, W + 600, H + 600);
    if (o.surface !== false) {   // underside of the surface: a light, rippling band
      const sy = o.sy ?? 0;
      ctx.fillStyle = "rgba(190,240,255,0.35)"; ctx.beginPath(); ctx.moveTo(-300, sy - 400);
      for (let x = -300; x <= W + 300; x += 20) ctx.lineTo(x, sy + 26 + Math.sin(x * 0.012 + t * 1.4) * 8 + Math.sin(x * 0.031 - t * 2.1) * 4);
      ctx.lineTo(W + 300, sy - 400); ctx.closePath(); ctx.fill();
      const r = rng(5); for (let i = 0; i < 18; i++) { const x = ((r() * 2400 + t * 20) % 2400) - 240, y = sy + 50 + r() * 70; line(ctx, [[x, y], [x + 34, y - 6], [x + 68, y]], 4, "rgba(255,255,255,0.22)"); }
      rays(ctx, t, 6, 200, 300, -220, tone === "dark" ? 0.12 : 0.2, H * 0.9);
    }
    snow(ctx, t, o.snow ?? 50, 3);
  }
  function snow(ctx, t, n, seed) {
    const r = rng(seed); ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (let i = 0; i < n; i++) { const x = ((r() * 2200 - t * (6 + r() * 10)) % 2200 + 2200) % 2200 - 140, y = ((r() * 1300 + t * (3 + r() * 5)) % 1300) - 110, s = 1.5 + r() * 2.5; ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill(); }
  }
  function sky(ctx, kind, hz) {
    const S = { day: ["#7fd2ef", "#b9ebf8", "#e4f8fc"], dawn: ["#f39a64", "#f9c98e", "#fde7c2"], grey: ["#8ea3b0", "#b9c7cf", "#dbe3e7"], dusk: ["#5b6fa8", "#c9839a", "#f6c08a"] }[kind] || ["#7fd2ef", "#b9ebf8", "#e4f8fc"];
    ctx.fillStyle = vgrad(ctx, 0, hz, S); ctx.fillRect(-300, -300, W + 600, hz + 300);
  }
  function sea(ctx, t, kind, hz) {
    const S = { day: ["#4fc4dd", "#2aa3c8", "#167fae"], dawn: ["#e7a676", "#7f9fb3", "#3d6f8f"], grey: ["#7c98a6", "#557b8c", "#365c6e"], dusk: ["#a07c96", "#566f99", "#2e4570"] }[kind] || ["#4fc4dd", "#2aa3c8", "#167fae"];
    ctx.fillStyle = vgrad(ctx, hz, H, S); ctx.fillRect(-300, hz, W + 600, H - hz + 300);
    const r = rng(17); for (let i = 0; i < 40; i++) { const y = hz + 10 + Math.pow(r(), 1.6) * (H - hz), k = (y - hz) / (H - hz), x = ((r() * 2400 + t * (10 + 30 * k)) % 2400) - 240, w = 20 + 70 * k; line(ctx, [[x, y], [x + w / 2, y - 3 - 3 * k], [x + w, y]], 2 + 3 * k, "rgba(255,255,255,0.35)"); }
  }

  // ---------- small actors ----------
  FL.seal = (ctx, t, o) => {   // side view, facing left in a 1000-unit body
    const k = (o.len ?? 200) / 1000, dir = o.dir ?? 1, ph = t * TAU * (o.beat ?? 1.4);
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.ang ?? 0); ctx.scale(-dir * k, k); ctx.translate(-480, 0);
    const sil = o.sil, body = sil || "#6d5a4c", belly = sil || "#a48c75", dark = sil || "#4c3e34";
    const fl = Math.sin(ph) * 0.4;
    ctx.save(); ctx.translate(850, 0); ctx.rotate(fl * 0.5); fill(ctx, "M 0 0 L 140 -70 L 120 0 L 140 70 Z", dark); ctx.restore();
    fill(ctx, "M 0 0 C 20 -66 120 -116 270 -118 C 440 -120 620 -80 780 -34 L 880 -18 L 880 18 L 780 34 C 620 80 440 112 270 108 C 120 104 20 64 0 0 Z", body);
    if (!sil) { ctx.save(); trace(ctx, "M 0 0 C 20 -66 120 -116 270 -118 C 440 -120 620 -80 780 -34 L 880 -18 L 880 18 L 780 34 C 620 80 440 112 270 108 C 120 104 20 64 0 0 Z"); ctx.clip(); fill(ctx, "M -20 30 C 200 60 500 70 900 10 L 900 200 L -20 200 Z", belly); ctx.restore(); }
    ctx.save(); ctx.translate(300, 60); ctx.rotate(0.6 + fl); fill(ctx, "M 0 0 C 40 60 80 130 60 190 C 20 150 -10 80 -20 10 Z", dark); ctx.restore();
    if (!sil) { circ(ctx, 90, -40, 16, "#120c08"); circ(ctx, 85, -45, 5, "#fff"); for (let i = 0; i < 3; i++) line(ctx, [[30, 10 + i * 10], [-50, 0 + i * 18]], 3, "rgba(255,255,255,0.6)"); circ(ctx, 18, -2, 9, "#2a1f18"); }
    ctx.restore();
  };
  // top-down shapes for maps and the drone view (facing +x, 1000 units long)
  function topOrca(ctx, t, x, y, len, ang, seed = 0) {
    const k = len / 1000, ph = t * 5 + seed;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(k, k); ctx.translate(-500, 0);
    ctx.save(); ctx.translate(90, 0); ctx.rotate(Math.sin(ph) * 0.15); fill(ctx, "M 20 0 L -90 -120 C -60 -40 -60 40 -90 120 Z", "#151c26"); ctx.restore();
    for (const s of [-1, 1]) fill(ctx, `M 700 ${s * 100} L 590 ${s * 250} L 640 ${s * 90} Z`, "#151c26");
    fill(ctx, "M 1000 0 C 985 -62 900 -112 760 -122 C 560 -130 360 -100 200 -50 L 80 -20 L 80 20 L 200 50 C 360 100 560 130 760 122 C 900 112 985 62 1000 0 Z", "#1b2433");
    ell(ctx, 470, 0, 120, 40, 0, "rgba(170,186,204,0.6)");
    for (const s of [-1, 1]) ell(ctx, 840, s * 92, 46, 14, s * 0.2, "#f4f8fb");
    ctx.restore();
  }
  function topShark(ctx, t, x, y, len, ang, o = {}) {
    const k = len / 1000, ph = t * (o.beat ?? 7) + (o.seed || 0), amp = o.amp ?? 40;
    const wv = (px, py) => { const u = 1 - px / 1000; return [px, py + amp * Math.sin(ph + u * 3) * u * u]; };
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(k, k); ctx.translate(-500, 0);
    for (const s of [-1, 1]) fill(ctx, `M 720 ${s * 70} L 520 ${s * 250} L 600 ${s * 75} Z`, o.col2 || "#4b5f70", wv);
    fill(ctx, "M 1000 0 C 990 -42 930 -72 820 -82 C 620 -96 400 -80 230 -40 L 110 -14 L 20 -24 L 50 0 L 20 24 L 110 14 L 230 40 C 400 80 620 96 820 82 C 930 72 990 42 1000 0 Z", o.col || "#6f8597", wv);
    trace(ctx, "M 420 -10 C 470 -20 520 -20 560 -8 L 560 8 C 520 20 470 20 420 10 Z", wv); ctx.fillStyle = "#566b7c"; ctx.fill();
    ctx.restore();
  }
  function liverChunk(ctx, x, y, s, a = 1) {
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
    fill(ctx, "M -50 -10 C -40 -36 10 -40 44 -24 C 66 -12 62 18 36 28 C 6 40 -38 34 -52 14 C -58 6 -56 -2 -50 -10 Z", "#e7883f");
    fill(ctx, "M -20 -20 C 0 -30 30 -28 44 -18 C 30 -10 6 -8 -20 -20 Z", "#f6b56d"); ctx.restore();
  }
  // a set of actors (sharks and orcas) on paths, with holding, carrying, rolling and going limp
  function actors(ctx, t, list, fogCol) {
    const done = {};
    const pose = (a, i) => {
      if (done[i]) return done[i];
      const len = a.len ?? 600, beat = a.beat ?? (a.k === "orca" ? 0.7 : 0.9);
      let p;
      if (a.heldBy !== undefined && K(a.heldOn ?? 1, t) > 0.5) {
        const h = pose(list[a.heldBy], a.heldBy), mp = (h.k === "orca" ? orcaPt : sharkPt)(h, 40, 70);
        const dir = h.dir, ang = h.ang + (a.holdAng ?? 0.12) * dir;
        const off = (300 - 470) * (len / 1000) * -dir;   // the shark's pectoral area sits in the orca's mouth
        p = { x: mp[0] - off * Math.cos(ang), y: mp[1] - off * Math.sin(ang) + h.len * 0.08 + len * 0.05, ang, dir };
      } else {
        const q = P(a.path, t), dir = a.dir ?? (q.vx === undefined ? 1 : (Math.abs(q.vx) > 0.5 ? Math.sign(q.vx) : (a.dir0 ?? 1)));
        const ang = (a.ang !== undefined ? K(a.ang, t) : (q.vx === undefined ? 0 : clamp(Math.atan2(q.vy, Math.abs(q.vx) + 1e-3) * dir, -0.5, 0.5) * dir));
        p = { x: q.x, y: q.y, ang, dir };
      }
      const limp = K(a.limp ?? 0, t);
      const ph = phase(Array.isArray(beat) ? beat : (limp ? beat : beat), t) * (1 - limp) + (a.ph0 ?? i * 1.3);
      return (done[i] = { ...p, k: a.k, len, beat: 0, ph, amp: (a.amp ?? (a.k === "orca" ? 0.045 : 0.03)) * (1 - limp * 0.85), roll: K(a.roll ?? 0, t), open: K(a.open ?? 0, t), liver: K(a.liver ?? 0, t), pec: a.pec, top: a.top, base: a.base, bend: a.bend });
    };
    list.forEach((a, i) => pose(a, i));
    const order = list.map((a, i) => i).sort((x, y) => (list[x].z ?? (list[x].heldBy !== undefined ? -1 : 0)) - (list[y].z ?? (list[y].heldBy !== undefined ? -1 : 0)));
    for (const i of order) {
      const a = list[i], p = done[i];
      if (a.show && (t < a.show[0] || t > a.show[1])) continue;
      fogged(ctx, "a" + i, K(a.fog ?? 0, t), fogCol, (c) => {
        if (a.k === "orca") orca(c, t, p); else shark(c, t, p);
        if (a.carry !== undefined && t >= a.carry) { const m = orcaPt(p, 10, 50); liverChunk(c, m[0], m[1], p.len / 700); }
        if (a.tag) { const fp = sharkPt(p, 450, -230); c.fillStyle = "#ffcc33"; c.beginPath(); c.arc(fp[0], fp[1], 8 * p.len / 600, 0, TAU); c.fill(); const age = (t * 0.8) % 1; c.beginPath(); c.arc(fp[0], fp[1], 10 + age * 70, 0, TAU); c.lineWidth = 4; c.strokeStyle = `rgba(255,214,90,${1 - age})`; c.stroke(); }
      });
    }
    return done;
  }

  // ================= SCENES =================
  const RAW = {};

  // Open water with sharks and orcas (o.actors), oil drops rising from a bite (o.oil = [t0, actorIndex]), optional silhouettes far off.
  RAW.deep = (ctx, t, o) => {
    water(ctx, t, o);
    const fc = FOG[o.tone || "blue"];
    if (o.kelp) { for (let i = 0; i < 9; i++) kelp(ctx, t, 60 + i * 230 + (i % 2) * 60, H + 40, 500 + (i % 3) * 140, 30, "rgba(44,120,90,0.55)", "rgba(30,90,70,0.5)", i, 12); }
    if (o.school) { for (let i = 0; i < 30; i++) { const r = rng(200 + i); const fx = ((r() * 900 + t * 80) % 2700) - 400, fy = (o.school ?? 300) + Math.sin(t + i * 0.5) * 30 + r() * 140; fish(ctx, t, fx, fy, 0.45, "#cfe6ef", "#8fb6c8", 1, i); } }
    const P_ = actors(ctx, t, o.actors || [], fc);
    if (o.oil) {
      const [t0, ai] = o.oil, s0 = P_[ai], src = s0 && s0.k === "orca" ? (([x, y]) => ({ x, y }))(orcaPt(s0, 30, 40)) : s0; if (src && t > t0) {
        const r = rng(9);
        for (let i = 0; i < 40; i++) { const st = t0 + r() * 6, age = t - st; if (age < 0) continue; const x = src.x + (r() - 0.5) * 160 + Math.sin(age * 2 + i) * 14, y = src.y - age * (60 + r() * 50); if (y < -20) continue; const s = 4 + r() * 8; ctx.fillStyle = "rgba(255,206,92,0.85)"; ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.beginPath(); ctx.arc(x - s * 0.3, y - s * 0.3, s * 0.3, 0, TAU); ctx.fill(); }
      }
    }
    if (o.bubbles) bubbles(ctx, t, o.bubbles, 31);
    if (o.vignette !== false) { const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, H * 0.95); g.addColorStop(0, "rgba(0,20,40,0)"); g.addColorStop(1, "rgba(0,20,40,0.35)"); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600); }
  };

  // The Farallon Islands from the surface: islands, gulls, a whale-watching boat, fins, the orca surfacing with a shark, an oil slick.
  RAW.farallon = (ctx, t, o) => {
    const hz = o.hz ?? 520, kind = o.sky || "grey";
    sky(ctx, kind, hz);
    if (kind !== "grey") { cloud(ctx, 300 + t * 6, 160, 1.3, "rgba(255,255,255,0.8)"); cloud(ctx, 1500 - t * 4, 110, 0.9, "rgba(255,255,255,0.7)"); }
    else { for (let i = 0; i < 4; i++) cloud(ctx, ((i * 600 + t * 8) % 2400) - 200, 120 + i * 40, 1.6, "rgba(235,240,243,0.55)"); }
    // islands
    const isx = o.isx ?? 1250, iss = o.iss ?? 1;
    ctx.save(); ctx.translate(isx, hz + 4); ctx.scale(iss, iss);
    const R = kind === "dawn" ? ["#a0715a", "#7c5444", "#f2d9c4"] : ["#857467", "#615349", "#ece6dc"];
    fill(ctx, "M -620 0 L -560 -60 L -520 -40 L -470 -110 L -430 -90 L -380 -170 L -330 -150 L -300 -230 L -240 -260 L -200 -200 L -150 -210 L -100 -150 L -40 -160 L 20 -90 L 80 -100 L 140 -40 L 200 -50 L 260 0 Z", R[0]);
    fill(ctx, "M -300 -230 L -240 -260 L -200 -200 L -150 -210 L -100 -150 L -40 -160 L 20 -90 L 80 -100 L 140 -40 L 200 -50 L 260 0 L -120 0 L -170 -120 Z", R[1]);
    for (const [x, y, w] of [[-260, -235, 40], [-420, -100, 30], [-120, -150, 34], [40, -92, 26]]) ell(ctx, x, y, w, 8, -0.2, R[2]);
    // lighthouse on the peak
    ctx.fillStyle = "#f4f1ea"; ctx.fillRect(-252, -320, 24, 64); ctx.fillStyle = "#c94a3d"; ctx.fillRect(-256, -334, 32, 16); circ(ctx, -240, -340, 9, "#ffe27a");
    fill(ctx, "M 380 0 L 420 -50 L 470 -30 L 520 -80 L 570 -40 L 620 0 Z", R[1]); fill(ctx, "M 700 0 L 730 -26 L 770 -14 L 800 0 Z", R[0]);
    if (o.seals) { for (let i = 0; i < 6; i++) ell(ctx, -560 + i * 50, -8 - (i % 2) * 6, 18, 7, 0.1, "#3d332c"); }
    ctx.restore();
    sea(ctx, t, kind, hz);
    // slick: iridescent rings spreading on the water
    if (o.slick !== undefined && t > o.slick) {
      const age = t - o.slick, sx = o.slickX ?? 1000, sy = o.slickY ?? 760, R0 = Math.min(560, 60 + age * 110);
      const hues = ["rgba(255,214,90,0.30)", "rgba(240,120,200,0.22)", "rgba(110,220,240,0.25)", "rgba(180,255,150,0.18)"];
      for (let i = 0; i < 9; i++) { const rr = R0 * (1 - i * 0.1) + Math.sin(t * 2 + i) * 6; ctx.beginPath(); ctx.ellipse(sx + Math.sin(i * 1.7) * 20, sy, rr, rr * 0.18, 0, 0, TAU); ctx.lineWidth = 10; ctx.strokeStyle = hues[i % 4]; ctx.stroke(); }
      ctx.beginPath(); ctx.ellipse(sx, sy, R0 * 0.7, R0 * 0.12, 0, 0, TAU); ctx.fillStyle = "rgba(255,240,190,0.15)"; ctx.fill();
    }
    // fins: shark fins cruise, orca fins roll
    for (const f of o.fins || []) {
      const u = t - f.t0; if (u < 0 || (f.t1 !== undefined && t > f.t1)) continue;
      const x = f.x0 + f.vx * u, y = f.y ?? 700, s = f.s ?? 1, up = f.k === "orca" ? Math.max(0, Math.sin(clamp(u / (f.roll ?? 3.5)) * Math.PI)) : smooth(0, 0.6, u) * (f.t1 !== undefined ? 1 - smooth(f.t1 - 0.6, f.t1, t) : 1);
      if (f.k === "orca") { ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, y + 300); ctx.clip(); orca(ctx, t, { x, y: y + 60 * s - up * 50 * s, len: 460 * s, dir: Math.sign(f.vx) || 1, ang: lerp(-0.15, 0.18, clamp(u / (f.roll ?? 3.5))) * (Math.sign(f.vx) || 1), beat: 0.3, amp: 0.02 }); ctx.restore(); }
      else { const d = Math.sign(f.vx) || 1; ctx.save(); ctx.translate(x, y); ctx.scale(d * s, s); fill(ctx, `M -40 0 C -20 ${-60 * up} 10 ${-100 * up} 30 ${-110 * up} C 26 ${-70 * up} 34 ${-30 * up} 50 0 Z`, "#5d7284"); ctx.restore(); }
      line(ctx, [[x - 120 * s * Math.sign(f.vx || 1), y + 10], [x, y + 2], [x - 120 * s * Math.sign(f.vx || 1), y + 18]], 4, "rgba(255,255,255,0.6)");
      ell(ctx, x, y + 3, 60 * s, 6, 0, "rgba(255,255,255,0.7)");
    }
    // the orca surfacing with a great white held belly-up across its mouth
    if (o.hold) {
      const h = o.hold, u = clamp((t - (h.t0 ?? 0)) / 1.5), y = h.y + (1 - smooth(0, 1, u)) * 80 + Math.sin(t * 1.3) * 6, wl = h.wl ?? h.y + 30;
      ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, wl + 300); ctx.clip();
      shark(ctx, t, { x: h.x - 60 * (h.s ?? 1), y: y + 30 * (h.s ?? 1), len: 520 * (h.s ?? 1), dir: -1, roll: Math.PI, ang: -0.05, beat: 0, amp: 0.004 });
      orca(ctx, t, { x: h.x + 120 * (h.s ?? 1), y: y + 50 * (h.s ?? 1), len: 600 * (h.s ?? 1), dir: -1, ang: 0.08, beat: 0.2, amp: 0.01 });
      ctx.restore();
      ell(ctx, h.x, wl + 4, 340 * (h.s ?? 1), 12, 0, "rgba(255,255,255,0.8)");
      const r = rng(4); for (let i = 0; i < 10; i++) { const a2 = (t * 0.7 + i / 10) % 1; circ(ctx, h.x + (r() - 0.5) * 500 * (h.s ?? 1), wl - a2 * 30, 5 * (1 - a2), `rgba(255,255,255,${0.8 * (1 - a2)})`); }
    }
    // the whale-watching boat and its passengers
    if (o.boat) {
      const b = o.boat, bx = b.x + (b.vx || 0) * t, by = b.y + Math.sin(t * 1.2) * 5, bs = b.s ?? 1;
      ctx.save(); ctx.translate(bx, by); ctx.rotate(Math.sin(t) * 0.015); ctx.scale(bs * (b.dir || 1), bs);
      // upper deck and cabin
      ctx.fillStyle = "#e9eef1"; ctx.fillRect(-260, -230, 380, 110); ctx.fillStyle = "#cfd8de"; ctx.fillRect(40, -230, 80, 110); ctx.fillStyle = "#2f8fb8"; ctx.fillRect(-270, -246, 400, 18);
      for (let i = 0; i < 5; i++) { ctx.fillStyle = "#33505f"; ctx.fillRect(-240 + i * 62, -205, 44, 34); }
      line(ctx, [[-60, -246], [-60, -330]], 6, "#7a8794"); circ(ctx, -60, -334, 8, "#ff6b5b");
      const pt = b.point !== undefined ? smooth(b.point, b.point + 0.5, t) : 0, bn = b.binoc !== undefined ? smooth(b.binoc, b.binoc + 0.6, t) : 0;
      const ppl = [["#f2c39b", "#ff6b6b", "#3b2416", "short"], ["#d9a074", "#ffd166", "#22140c", "long"], ["#a86d45", "#5fb3e6", "#1c120c", "short"], ["#f1c7a0", "#9b6ade", "#5a3a22", "long"], ["#e8b48b", "#4fbf8f", "#2a1b12", "short"]];
      ppl.forEach(([sk, sh, hr, hs], i) => person(ctx, t, { x: -320 + i * 70, y: -100, h: 120, skin: sk, shirt: sh, hair: hr, hairStyle: hs, pants: "#3b4a63", skirt: hs === "long" ? "#3b4a63" : undefined, shoe: "#222", w: 0, ph: i * 1.7, point: i % 2 ? pt : 0, binoc: i % 2 ? 0 : bn, look: 0.15 }));
      fill(ctx, "M -420 -110 L 330 -100 C 350 -70 340 -30 300 10 L -340 14 C -390 -20 -415 -70 -420 -110 Z", "#f5f7f9");
      fill(ctx, "M -420 -110 L 330 -100 L 332 -84 L -414 -92 Z", "#2f8fb8");
      fill(ctx, "M -372 -20 L 322 -26 C 316 -10 308 0 300 10 L -340 14 C -354 4 -364 -8 -372 -20 Z", "#1f4f7a");
      line(ctx, [[-410, -140], [320, -130]], 4, "#a7b4bd"); for (let i = 0; i < 12; i++) line(ctx, [[-400 + i * 62, -140], [-400 + i * 62, -106]], 3, "#a7b4bd");
      ctx.restore();
      ell(ctx, bx, by + 12 * bs, 400 * bs, 12 * bs, 0, "rgba(255,255,255,0.55)");
    }
    for (let i = 0; i < (o.gulls ?? 3); i++) { const r = rng(60 + i); gull(ctx, t, ((r() * 1800 + t * (30 + r() * 30)) % 2200) - 150, 120 + r() * 200 + Math.sin(t + i) * 15, 0.7 + r() * 0.5, i * 2); }
  };

  // Ambush from below: a seal on the surface, the shark waiting in the dark, then the rush and the breach.
  RAW.ambush = (ctx, t, o) => {
    const wl = o.wl ?? 330, go = o.go ?? 99, sealX0 = o.sealX ?? 600;
    sky(ctx, o.sky || "day", wl); ctx.fillStyle = "#cdeffa"; ctx.fillRect(-300, wl - 4, W + 600, 6);
    ctx.fillStyle = vgrad(ctx, wl, H, ["#3ab4e0", "#14639a", "#04182c"]); ctx.fillRect(-300, wl, W + 600, H - wl + 300);
    rays(ctx, t, 5, 300, 320, -200, 0.14, H * 0.8); snow(ctx, t, 40, 7);
    // the seal at the surface (its outline is what the shark sees)
    const breach = smooth(go + 1.0, go + 1.25, t), tFly = t - (go + 1.15);
    let sx = sealX0 + t * 40, sy = wl + 18;
    if (tFly > 0) { sx = o.hitX ?? 1150; }
    const glow = o.outline !== undefined ? smooth(o.outline, o.outline + 0.6, t) * (1 - breach) : 0;
    if (glow > 0.01) { ctx.save(); ctx.globalAlpha = glow * (0.6 + 0.4 * Math.sin(t * 6)); ell(ctx, sx, sy, 150, 50, 0, "rgba(255,240,150,0.45)"); ctx.restore(); }
    // shark path: cruising deep, then a near-vertical rush
    const hx = o.hitX ?? 1150;
    let shx = lerp(300, 1000, clamp(t / Math.max(1, go))) , shy = wl + 520 + Math.sin(t * 0.7) * 20, ang = 0, dir = 1;
    if (t > go) {
      const u = clamp((t - go) / 1.15);
      shx = lerp(Math.min(1000, lerp(300, 1000, 1)), hx, u); shy = lerp(wl + 520, wl - 10, u * u); ang = -lerp(0, 1.2, smooth(0, 0.3, u));
    }
    let flyY = 0;
    if (tFly > 0) { const v = 900, g = 1500; flyY = Math.max(-1e9, v * tFly - 0.5 * g * tFly * tFly); shy = wl - 10 - flyY; shx = hx + tFly * 60; ang = -1.2 + tFly * 1.6; }
    const caught = tFly > -0.05;
    if (!caught) FL.seal(ctx, t, { x: sx, y: sy, len: 170, dir: 1, beat: 1.6, sil: "#16303f" });
    shark(ctx, t, { x: shx, y: shy, len: 620, dir, ang, beat: t > go ? 2.4 : 0.8, amp: 0.035, open: t > go ? smooth(go + 0.7, go + 1.0, t) : 0 });
    if (caught && flyY > -400) { const m = sharkPt({ x: shx, y: shy, len: 620, dir, ang }, 60, 30); FL.seal(ctx, t, { x: m[0], y: m[1], len: 150, dir: -1, ang: ang + 1.2, beat: 3 }); }
    // splash rings and spray where it broke the surface
    if (tFly > 0) {
      for (const [t0, x0] of [[0, hx], [Math.max(0.01, (900 / 1500) * 2 - 0.05), hx + 2 * 0.6 * 60]]) {
        const a = tFly - t0; if (a < 0 || a > 1.6) continue;
        const r = rng(Math.floor(x0)); for (let i = 0; i < 26; i++) { const an = -Math.PI / 2 + (r() - 0.5) * 1.6, v = 200 + r() * 260; circ(ctx, x0 + Math.cos(an) * v * a, wl - Math.sin(-an) * v * a * 1.2 + 500 * a * a, (8 + r() * 10) * (1 - a / 1.6), `rgba(255,255,255,${0.9 * (1 - a / 1.6)})`); }
        ell(ctx, x0, wl + 2, 120 + a * 200, 12 + a * 6, 0, `rgba(255,255,255,${0.85 * (1 - a / 1.6)})`);
      }
    }
  };

  // Tracking map: islands (or a coast), receivers that ping, tagged sharks wandering; orcas arrive and the sharks flee off the map.
  RAW.tracker = (ctx, t, o) => {
    ctx.fillStyle = "#3aaedb"; ctx.fillRect(-300, -300, W + 600, H + 600);
    ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 2; for (let x = 0; x <= W; x += 160) { ctx.beginPath(); ctx.moveTo(x, -300); ctx.lineTo(x, H + 300); ctx.stroke(); } for (let y = 60; y <= H; y += 160) { ctx.beginPath(); ctx.moveTo(-300, y); ctx.lineTo(W + 300, y); ctx.stroke(); }
    const r0 = rng(2); for (let i = 0; i < 50; i++) { const x = ((r0() * 2200 + t * 8) % 2200) - 140, y = r0() * H; line(ctx, [[x, y], [x + 20, y - 4], [x + 40, y]], 3, "rgba(255,255,255,0.2)"); }
    const land = (d, c1, c2) => { ctx.save(); ctx.translate(8, 10); fill(ctx, d, "rgba(0,60,90,0.25)"); ctx.restore(); fill(ctx, d, c1); ctx.lineWidth = 6; ctx.strokeStyle = c2; trace(ctx, d); ctx.stroke(); };
    if (o.place === "coast") {
      land("M -300 -300 L 2220 -300 L 2220 160 C 1900 200 1700 120 1500 220 C 1300 320 1150 260 960 300 C 760 340 640 250 460 300 C 300 340 120 260 -300 300 Z", "#f3d9a0", "#e2bf7d");
      ctx.fillStyle = "#7fbf6a"; trace(ctx, "M -300 -300 L 2220 -300 L 2220 100 C 1900 140 1700 60 1500 160 C 1300 260 1150 200 960 240 C 760 280 640 190 460 240 C 300 280 120 200 -300 240 Z"); ctx.fill();
    } else {
      land("M 820 470 C 860 420 940 400 1000 430 C 1060 450 1110 440 1130 490 C 1150 540 1100 590 1040 600 C 980 610 900 600 860 570 C 820 545 800 500 820 470 Z", "#e7cf9b", "#c9a96b");
      land("M 1180 520 C 1200 505 1230 508 1238 525 C 1244 542 1226 556 1206 552 C 1186 548 1172 535 1180 520 Z", "#e7cf9b", "#c9a96b");
      land("M 700 380 C 712 370 728 372 732 384 C 734 396 722 402 710 400 C 698 398 694 390 700 380 Z", "#e7cf9b", "#c9a96b");
    }
    // receivers
    const recv = o.recv || [[700, 520], [980, 330], [1260, 470], [1100, 700], [820, 690]];
    for (const [x, y] of recv) { circ(ctx, x, y, 12, "#ffd84a"); circ(ctx, x, y, 5, "#c48a10"); const a = (t * 0.6 + x * 0.001) % 1; ctx.beginPath(); ctx.arc(x, y, 14 + a * 60, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255,224,110,${0.8 * (1 - a)})`; ctx.stroke(); }
    // sharks
    const n = o.n ?? 12, flee = o.flee ?? 1e9, cx = o.cx ?? 980, cy = o.cy ?? 520, rad = o.rad ?? 330;
    let alive = 0;
    for (let i = 0; i < n; i++) {
      const r = rng(40 + i), a0 = r() * TAU, rr = rad * (0.5 + r() * 0.6), sp = (0.15 + r() * 0.12) * (r() < 0.5 ? -1 : 1);
      let a = a0 + t * sp, x = cx + Math.cos(a) * rr * 1.3, y = cy + Math.sin(a) * rr * 0.8;
      let ang = a + Math.PI / 2 * Math.sign(sp);
      if (t > flee + r() * 0.8) {
        const u = t - flee - r() * 0.8, out = o.fleeDir !== undefined ? o.fleeDir + (r() - 0.5) * 0.9 : Math.atan2(y - cy, x - cx);
        x += Math.cos(out) * u * (350 + r() * 200); y += Math.sin(out) * u * (350 + r() * 200); ang = out;
      }
      if (x < -100 || x > W + 100 || y < -100 || y > H + 100) continue;
      alive++;
      topShark(ctx, t, x, y, 70, ang, { seed: i, amp: 30 });
      circ(ctx, x, y - 34, 6, "#ffcc33");
    }
    // orcas
    for (const [t0, x0, y0, vx, vy] of o.orcas || []) { const u = t - t0; if (u < 0) continue; topOrca(ctx, t, x0 + vx * u, y0 + vy * u, 120, Math.atan2(vy, vx), t0); }
    // HUD
    if (o.hud !== false) screen(ctx, () => {
      ctx.fillStyle = "rgba(10,40,60,0.75)"; const bx = 60, by = 60; ctx.beginPath(); ctx.roundRect(bx, by, 520, 120, 24); ctx.fill();
      ctx.font = "600 34px Fredoka, sans-serif"; ctx.fillStyle = "#bfe9f7"; ctx.fillText(o.hudLabel || "TAGGED SHARKS DETECTED", bx + 30, by + 48);
      ctx.font = "700 52px Fredoka, sans-serif"; ctx.fillStyle = alive ? "#ffffff" : "#ff7b6b"; ctx.fillText(String(alive), bx + 30, by + 100);
      if (o.days) { const d = Math.floor(K(o.days, t)); ctx.fillStyle = "#ffd84a"; ctx.fillText((o.dayLabel || "DAY ") + d, bx + 150, by + 100); }
    });
  };

  // Researchers alongside a boat hold a shark; it is rolled belly-up and goes still. o.flip = t, o.timer = t (a stopwatch).
  RAW.flip = (ctx, t, o) => {
    const wl = o.wl ?? 470, fl = o.flip ?? 99;
    sky(ctx, "day", wl); cloud(ctx, 300, 150, 1.2); cloud(ctx, 1500, 110, 0.9);
    ctx.fillStyle = vgrad(ctx, wl, H, ["#41bde3", "#1f86c0", "#0d548c"]); ctx.fillRect(-300, wl, W + 600, H - wl + 300);
    rays(ctx, t, 5, 300, 330, -200, 0.16, H); snow(ctx, t, 30, 4);
    const roll = smooth(fl, fl + 1.4, t) * Math.PI, calm = smooth(fl + 0.6, fl + 2.6, t);
    const fight = 1 - smooth(fl - 0.4, fl + 0.6, t);
    const sx = o.sx ?? 1000, sy = wl + 78 + Math.sin(t * 7) * 8 * fight;
    shark(ctx, t, { x: sx + Math.sin(t * 5) * 14 * fight, y: sy, len: o.len ?? 760, dir: -1, roll, ang: Math.sin(t * 6) * 0.08 * fight, beat: 0, ph: phase([[0, 2.2], [fl, 2.2], [fl + 1, 0.2], [fl + 3, 0]], t), amp: lerp(0.05, 0.004, calm) });
    // the boat hull at the surface, and the researchers leaning over the side
    ctx.save(); ctx.translate(o.bx ?? 760, wl - 20 + Math.sin(t * 1.3) * 4);
    person(ctx, t, { x: -40, y: -10, h: 300, skin: "#e9b98f", hair: "#3a2416", hairStyle: "short", shirt: "#ff8a3d", pants: "#2d3e55", shoe: "#222", w: 0, reach: 1, look: -0.4 });
    person(ctx, t, { x: 140, y: -10, h: 290, skin: "#a86d45", hair: "#1c120c", hairStyle: "long", shirt: "#2f8fb8", pants: "#2d3e55", skirt: undefined, shoe: "#222", w: 0, reach: 1, ph: 2, look: -0.4 });
    fill(ctx, "M -380 -40 L 420 -40 C 430 0 410 50 360 80 L -300 80 C -350 40 -380 0 -380 -40 Z", "#f4f6f8");
    fill(ctx, "M -380 -40 L 420 -40 L 418 -20 L -378 -20 Z", "#e4574a");
    fill(ctx, "M -330 40 L 400 40 C 390 60 376 72 360 80 L -300 80 C -312 66 -322 54 -330 40 Z", "#1f4f7a");
    ctx.font = "700 34px Fredoka, sans-serif"; ctx.fillStyle = "#1f4f7a"; ctx.fillText("RESEARCH", -200, 20);
    ctx.restore();
    ell(ctx, o.bx ?? 760, wl + 2, 420, 10, 0, "rgba(255,255,255,0.6)");
    { const so = { x: sx, y: sy, len: o.len ?? 760, dir: -1, roll }, bx = o.bx ?? 760, by = wl - 20; const a1 = sharkPt(so, 250, 0), a2 = sharkPt(so, 840, 0);
      for (const [hx, tgt] of [[bx + 30, a1], [bx + 200, a2]]) { ctx.beginPath(); ctx.moveTo(hx, by - 120); ctx.quadraticCurveTo((hx + tgt[0]) / 2, Math.max(by - 40, tgt[1] - 60), tgt[0], tgt[1]); ctx.lineWidth = 6; ctx.strokeStyle = "#f2d27a"; ctx.stroke(); } }
    // breathing / calm meter
    if (o.meter !== false && t > fl - 0.5) screen(ctx, () => {
      const x0 = 1340, y0 = 120; ctx.fillStyle = "rgba(10,40,60,0.75)"; ctx.beginPath(); ctx.roundRect(x0, y0, 500, 150, 26); ctx.fill();
      ctx.font = "600 30px Fredoka, sans-serif"; ctx.fillStyle = "#bfe9f7"; ctx.fillText(o.meterLabel || "MUSCLE TENSION", x0 + 28, y0 + 44);
      const v = lerp(1, 0.08, calm); ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.beginPath(); ctx.roundRect(x0 + 28, y0 + 70, 444, 44, 22); ctx.fill();
      ctx.fillStyle = v > 0.5 ? "#ff7b6b" : "#6be3a4"; ctx.beginPath(); ctx.roundRect(x0 + 28, y0 + 70, Math.max(44, 444 * v), 44, 22); ctx.fill();
    });
    if (o.timer !== undefined && t > o.timer) screen(ctx, () => {
      const u = t - o.timer, x0 = 1640, y0 = 420; circ(ctx, x0, y0, 90, "#fffdf6"); circ(ctx, x0, y0, 78, "#e8f4f8");
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.arc(x0, y0, 70, -Math.PI / 2, -Math.PI / 2 + (u * 0.5) % TAU); ctx.closePath(); ctx.fillStyle = "rgba(255,138,61,0.6)"; ctx.fill();
      line(ctx, [[x0, y0], [x0 + Math.cos(-Math.PI / 2 + u * 0.5) * 66, y0 + Math.sin(-Math.PI / 2 + u * 0.5) * 66]], 8, "#173a55"); circ(ctx, x0, y0, 10, "#173a55");
      ctx.fillStyle = "#173a55"; ctx.fillRect(x0 - 14, y0 - 118, 28, 22);
    });
  };

  // Ram ventilation: water streams into the mouth and out of the gills while the shark swims; when it stops, the flow and oxygen fade.
  RAW.gills = (ctx, t, o) => {
    water(ctx, t, { tone: o.tone || "blue", sy: -60, snow: 0 });
    const stop = o.stop ?? 1e9, mv = 1 - smooth(stop, stop + 1.2, t);
    // drifting particles show the shark moving (or not)
    const r = rng(3); let shift = 0; for (let x = 0; x < t; x += 0.05) shift += (1 - smooth(stop, stop + 1.2, x)) * 0.05 * 220;
    ctx.fillStyle = "rgba(255,255,255,0.45)"; for (let i = 0; i < 90; i++) { const x = ((r() * 2400 - shift * (0.6 + r())) % 2400 + 2400) % 2400 - 240, y = r() * H, s = 2 + r() * 3; ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill(); }
    const so = { x: o.x ?? 960, y: o.y ?? 560, len: o.len ?? 1300, dir: 1, roll: K(o.roll ?? 0, t), beat: 0, ph: phase([[0, 1], [stop, 1], [stop + 1.2, 0]], t), amp: 0.03 * (0.3 + 0.7 * mv), open: 0.15 };
    shark(ctx, t, so);
    // flow streaks: into the mouth, along the gill slits, out behind
    const flow = mv * (o.flow ?? 1);
    if (flow > 0.02) {
      for (let i = 0; i < 16; i++) {
        const u = ((t * 0.9 + i / 16) % 1), lane = (i % 4) - 1.5;
        const pts = [[-200, 40 + lane * 18], [30, 36 + lane * 6], [180, 30 + lane * 6], [270, lane * 30], [420, 20 + lane * 40]];
        const k = u * (pts.length - 1), j = Math.min(pts.length - 2, Math.floor(k)), f = k - j;
        const bx = lerp(pts[j][0], pts[j + 1][0], f), by = lerp(pts[j][1], pts[j + 1][1], f), wp = sharkPt(so, bx, by), wq = sharkPt(so, bx - 40, by);
        ctx.globalAlpha = flow * Math.sin(u * Math.PI); line(ctx, [wq, wp], 7, "#e9fbff"); circ(ctx, wp[0], wp[1], 6, "#ffffff"); ctx.globalAlpha = 1;
      }
    }
    if (o.o2 !== false) screen(ctx, () => {
      let o2 = 1; for (let x = stop; x < t; x += 0.05) o2 -= 0.05 * 0.11; o2 = clamp(o2, 0.12, 1);
      const x0 = 70, y0 = 70; ctx.fillStyle = "rgba(10,40,60,0.75)"; ctx.beginPath(); ctx.roundRect(x0, y0, 470, 140, 26); ctx.fill();
      ctx.font = "600 32px Fredoka, sans-serif"; ctx.fillStyle = "#bfe9f7"; ctx.fillText("OXYGEN", x0 + 28, y0 + 46);
      ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.beginPath(); ctx.roundRect(x0 + 28, y0 + 66, 414, 44, 22); ctx.fill();
      ctx.fillStyle = o2 > 0.55 ? "#6be3a4" : (o2 > 0.3 ? "#ffd166" : "#ff7b6b"); ctx.beginPath(); ctx.roundRect(x0 + 28, y0 + 66, Math.max(44, 414 * o2), 44, 22); ctx.fill();
    });
  };

  // A fish that pumps water over its gills while resting on the bottom, for comparison.
  RAW.pump = (ctx, t, o) => {
    water(ctx, t, { tone: "blue", sy: -60 });
    band(ctx, 880, 20, [[0.004, 1], [0.01, 0.4]], 0.4, H + 10, "#e8c486"); band(ctx, 900, 20, [[0.004, 1]], 1.2, H + 10, "#f5d9a2");
    rock(ctx, 300, 900, 120, 50, "#3f5466", "#5b7387"); rock(ctx, 1600, 910, 90, 40, "#3f5466", "#5b7387");
    kelp(ctx, t, 1750, 900, 300, 26, "#4fbf63", "#3a9c4c", 2);
    const x = 960, y = 760, s = 2.4, op = 0.5 + 0.5 * Math.sin(t * 3);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    fill(ctx, "M 120 0 L 170 -40 L 160 0 L 170 40 Z", "#c96f3b");
    fill(ctx, "M -120 0 C -110 -50 -40 -70 30 -64 C 90 -58 130 -30 130 0 C 130 30 90 56 30 60 C -40 66 -110 50 -120 0 Z", "#e58a4a");
    fill(ctx, "M -110 10 C -60 40 40 50 120 16 C 110 40 70 58 30 60 C -40 66 -100 46 -110 10 Z", "#f6c48e");
    fill(ctx, "M -40 -60 C -10 -100 50 -100 80 -58 Z", "#c96f3b");
    // gill cover opening and closing
    ctx.save(); ctx.translate(-50, -6); ctx.rotate(-0.15 * op); fill(ctx, "M 0 -40 C 30 -30 34 30 0 40 C 10 10 10 -10 0 -40 Z", "#c96f3b"); ctx.restore();
    circ(ctx, -86, -18, 9, "#fff"); circ(ctx, -84, -18, 5, "#1a1a1a");
    fill(ctx, `M -118 6 Q -100 ${10 + op * 10} -86 8 Z`, "#7a2f22");
    ctx.restore();
    for (let i = 0; i < 6; i++) { const u = (t * 0.7 + i / 6) % 1; const px = x - 420 + u * 380, py = y + 10 + (i % 3 - 1) * 14; ctx.globalAlpha = Math.sin(u * Math.PI); circ(ctx, px, py, 7, "#ffffff"); ctx.globalAlpha = 1; }
    for (let i = 0; i < 6; i++) { const u = (t * 0.7 + i / 6) % 1; const px = x - 110 + u * 160, py = y - 10 + (i % 3 - 1) * 40 + u * 30 * (i % 2 ? 1 : -1); ctx.globalAlpha = Math.sin(u * Math.PI) * op; circ(ctx, px, py, 6, "#e9fbff"); ctx.globalAlpha = 1; }
  };

  // X-ray views of the shark: the liver, its share of body weight, a person for scale, oil, the missing swim bladder, the wound.
  RAW.xray = (ctx, t, o) => {
    ctx.fillStyle = vgrad(ctx, 0, H, ["#123e5c", "#0c2c45", "#071a2b"]); ctx.fillRect(-300, -300, W + 600, H + 600);
    ctx.strokeStyle = "rgba(120,200,240,0.08)"; ctx.lineWidth = 2; for (let x = 0; x <= W; x += 80) { ctx.beginPath(); ctx.moveTo(x, -300); ctx.lineTo(x, H + 300); ctx.stroke(); } for (let y = 0; y <= H; y += 80) { ctx.beginPath(); ctx.moveTo(-300, y); ctx.lineTo(W + 300, y); ctx.stroke(); }
    const so = { x: o.x ?? 900, y: o.y ?? 520, len: o.len ?? 1350, dir: 1, beat: o.still ? 0 : 0.5, amp: o.still ? 0.004 : 0.015, liver: smooth(o.liverT ?? 0, (o.liverT ?? 0) + 0.8, t) * (o.noLiver ? 0 : 1) };
    ctx.save(); ctx.globalAlpha = o.ghost ?? 0.55; shark(ctx, t, { ...so, liver: 0 }); ctx.restore();
    if (so.liver > 0) { const p = { ...so }; ctx.save(); ctx.globalAlpha = 1; shark(ctx, t, { ...p, top: "rgba(0,0,0,0)", base: "rgba(0,0,0,0)", under: "rgba(0,0,0,0)" }); ctx.restore(); }
    // outline glow for the liver
    if (so.liver > 0.05) { ctx.save(); ctx.shadowColor = "rgba(255,170,80,0.9)"; ctx.shadowBlur = 40 * so.liver; shark(ctx, t, { ...so, top: "rgba(0,0,0,0)", base: "rgba(0,0,0,0)", under: "rgba(0,0,0,0)" }); ctx.restore(); }
    if (o.ghostLiver !== undefined && t > o.ghostLiver) {   // the liver's outline, dashed: something removed
      const k = so.len / 1000, a = smooth(o.ghostLiver, o.ghostLiver + 0.6, t);
      ctx.save(); ctx.translate(so.x, so.y); ctx.scale(-k * -1, k); ctx.translate(-470, 0); ctx.scale(-1, 1); ctx.translate(-940, 0);
      ctx.restore();
      const pts = [[240, 10], [300, -20], [420, -26], [520, -6], [560, 25], [520, 56], [420, 76], [300, 70], [250, 50]].map(([bx, by]) => sharkPt(so, bx, by));
      ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.setLineDash([18, 14]); ctx.lineWidth = 6; ctx.strokeStyle = `rgba(255,170,80,${a})`; ctx.stroke(); ctx.setLineDash([]);
    }
    if (o.wound !== undefined && t > o.wound) { const p = sharkPt(so, 300, 70), a = smooth(o.wound, o.wound + 0.4, t), pu = 1 + 0.1 * Math.sin(t * 6); ctx.beginPath(); ctx.arc(p[0], p[1], 70 * pu, 0, TAU); ctx.lineWidth = 8; ctx.strokeStyle = `rgba(255,90,80,${a})`; ctx.stroke(); }
    // share of body weight
    if (o.pct !== undefined && t > o.pct) {
      const u = smooth(o.pct, o.pct + 1.5, t), x0 = 1300, y0 = 820; ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.beginPath(); ctx.roundRect(x0, y0, 520, 60, 30); ctx.fill();
      ctx.fillStyle = "#f08c3c"; ctx.beginPath(); ctx.roundRect(x0, y0, Math.max(60, 520 * 0.25 * u), 60, 30); ctx.fill();
      ctx.font = "700 44px Fredoka, sans-serif"; ctx.fillStyle = "#ffd9a8"; ctx.fillText("UP TO ~25% OF BODY WEIGHT", x0 - 20, y0 - 24);
    }
    // a person beside the liver, for weight
    if (o.human !== undefined && t > o.human) {
      const a = smooth(o.human, o.human + 0.6, t); ctx.save(); ctx.globalAlpha = a;
      person(ctx, t, { x: 1620, y: 1000, h: 380, skin: "#f1c7a0", hair: "#3a2416", hairStyle: "short", shirt: "#5fb3e6", pants: "#3b4a63", shoe: "#222", w: 0 });
      // scale pan
      line(ctx, [[1380, 1010], [1860, 1010]], 10, "#cfd8de"); ctx.restore();
    }
    // swim bladder comparison: a fish with an air sac, at lower left
    if (o.bladder !== undefined && t > o.bladder) {
      const a = smooth(o.bladder, o.bladder + 0.6, t), x = 380, y = 880; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(1.6, 1.6);
      fill(ctx, "M 120 0 L 170 -40 L 160 0 L 170 40 Z", "#c96f3b");
      fill(ctx, "M -120 0 C -110 -50 -40 -70 30 -64 C 90 -58 130 -30 130 0 C 130 30 90 56 30 60 C -40 66 -110 50 -120 0 Z", "#e58a4a");
      const b = 1 + 0.05 * Math.sin(t * 3); ell(ctx, 10, -8, 60 * b, 22 * b, 0, "rgba(220,245,255,0.95)"); ctx.restore();
    }
    // oil droplets shimmering inside the liver
    if (o.oil !== undefined && t > o.oil) { const r = rng(5); for (let i = 0; i < 26; i++) { const bx = 260 + r() * 280, by = -10 + r() * 60, p = sharkPt(so, bx, by), s = 5 + r() * 9; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3 + i); circ(ctx, p[0], p[1], s, "#ffe08a"); ctx.globalAlpha = 1; } }
    // the liver as a block of fuel
    if (o.fuel !== undefined && t > o.fuel) {
      const a = smooth(o.fuel, o.fuel + 0.6, t), x0 = 1480, y0 = 640; ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = "#f08c3c"; ctx.beginPath(); ctx.roundRect(x0, y0, 300, 200, 26); ctx.fill(); ctx.fillStyle = "#c86a22"; ctx.fillRect(x0 + 110, y0 - 30, 80, 34);
      for (let i = 0; i < 4; i++) { ctx.fillStyle = i < Math.floor(1 + (t - o.fuel) * 2) % 5 ? "#ffe08a" : "rgba(255,255,255,0.25)"; ctx.beginPath(); ctx.roundRect(x0 + 24 + i * 66, y0 + 50, 54, 100, 12); ctx.fill(); }
      ctx.restore();
    }
    if (o.icons !== undefined && t > o.icons) {   // no armour, no spines, no poison
      const names = ["shield", "spines", "poison"];
      names.forEach((nm, i) => {
        const tt = o.icons + i * 0.9; if (t < tt) return; const a = smooth(tt, tt + 0.4, t), x = 1260 + i * 200, y = 230;
        ctx.save(); ctx.globalAlpha = a; circ(ctx, x, y, 80, "rgba(255,255,255,0.12)");
        if (nm === "shield") fill(ctx, `M ${x} ${y - 50} L ${x + 42} ${y - 34} C ${x + 42} ${y + 10} ${x + 24} ${y + 40} ${x} ${y + 54} C ${x - 24} ${y + 40} ${x - 42} ${y + 10} ${x - 42} ${y - 34} Z`, "#bcd3e0");
        if (nm === "spines") for (let k = -2; k <= 2; k++) fill(ctx, `M ${x + k * 18 - 9} ${y + 40} L ${x + k * 18} ${y - 40 + Math.abs(k) * 10} L ${x + k * 18 + 9} ${y + 40} Z`, "#bcd3e0");
        if (nm === "poison") { fill(ctx, `M ${x - 20} ${y - 50} L ${x + 20} ${y - 50} L ${x + 20} ${y - 20} C ${x + 50} ${y} ${x + 50} ${y + 50} ${x} ${y + 54} C ${x - 50} ${y + 50} ${x - 50} ${y} ${x - 20} ${y - 20} Z`, "#bcd3e0"); circ(ctx, x, y + 20, 14, "#7bd389"); }
        const k2 = smooth(tt + 0.3, tt + 0.6, t); line(ctx, [[x - 60, y - 60], [x - 60 + 120 * k2, y - 60 + 120 * k2]], 12, "#ff6b5b");
        ctx.restore();
      });
    }
    if (o.q !== undefined && t > o.q) { const a = smooth(o.q, o.q + 0.5, t), p = sharkPt(so, 400, 20); ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = "#ffd27a"; ctx.shadowBlur = 40; ctx.font = "700 220px Fredoka, sans-serif"; ctx.fillStyle = "#ffd27a"; ctx.textAlign = "center"; ctx.fillText("?", p[0], p[1] + 80); ctx.restore(); }
  };

  // Rows of teeth moving forward like a conveyor: when a front tooth breaks off, the next one rises.
  RAW.jaw = (ctx, t, o) => {
    ctx.fillStyle = vgrad(ctx, 0, H, ["#1a5f8f", "#0d3a5e", "#061d33"]); ctx.fillRect(-300, -300, W + 600, H + 600);
    // jaw cross-section: gum band curving
    const cx = 960, cy = 1180, R = 760;
    ctx.beginPath(); ctx.arc(cx, cy, R + 90, Math.PI * 1.08, Math.PI * 1.92); ctx.arc(cx, cy, R - 150, Math.PI * 1.92, Math.PI * 1.08, true); ctx.closePath(); ctx.fillStyle = "#c9636e"; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, R - 40, Math.PI * 1.08, Math.PI * 1.92); ctx.arc(cx, cy, R - 150, Math.PI * 1.92, Math.PI * 1.08, true); ctx.closePath(); ctx.fillStyle = "#a94a57"; ctx.fill();
    const speed = o.speed ?? 0.25;
    for (let row = 0; row < 4; row++) {
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * (1.14 + i * 0.09);
        const prog = (t * speed + row * 0.25) % 1;   // a tooth moves from the back row (inside) to the front (rim)
        const rr = lerp(R - 130, R + 40, (row + ((t * speed) % 1)) / 4), up = clamp(((row + ((t * speed) % 1)) / 4 - 0.2) / 0.8);
        if (row === 3 && ((t * speed) % 1) > 0.6 && i === 4) continue;   // the broken front tooth falls away
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr, h = lerp(30, 120, up), w = lerp(20, 70, up);
        ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2 - lerp(1.2, 0, up));
        fill(ctx, `M ${-w / 2} 0 L 0 ${-h} L ${w / 2} 0 Z`, "#f6f2e6");
        for (let k = 0; k < 5; k++) line(ctx, [[-w / 2 + k * w / 10, -k * h / 5 - 4], [-w / 2 + k * w / 10 + 5, -k * h / 5 - 10]], 2, "#d8cfb8");
        fill(ctx, `M ${w * 0.1} 0 L 0 ${-h} L ${w / 2} 0 Z`, "#e3dccb");
        ctx.restore();
      }
    }
    // falling broken tooth
    const ph = (t * speed) % 1; if (ph > 0.6) { const u = (ph - 0.6) / 0.4, a = Math.PI * (1.14 + 4 * 0.09), x = cx + Math.cos(a) * (R + 40), y = cy + Math.sin(a) * (R + 40) + u * u * 600; ctx.save(); ctx.translate(x + u * 80, y); ctx.rotate(u * 3); fill(ctx, "M -35 0 L 0 -120 L 35 0 Z", `rgba(246,242,230,${1 - u})`); ctx.restore(); }
  };

  // The shark's senses: electric pores on the snout (o.mode "electric"), smell ("smell") and vibrations ("vibe").
  RAW.senses = (ctx, t, o) => {
    const mode = o.mode || "electric";
    water(ctx, t, { tone: mode === "vibe" ? "dark" : "blue", sy: -40 });
    const so = { x: 520, y: 600, len: 1800, dir: 1, beat: 0.4, amp: 0.01 };
    shark(ctx, t, so);
    if (mode === "electric") {
      const r = rng(8); for (let i = 0; i < 40; i++) { const bx = 10 + r() * 150, by = -50 + r() * 70, p = sharkPt(so, bx, by); const lit = 0.5 + 0.5 * Math.sin(t * 5 - bx * 0.05); circ(ctx, p[0], p[1], 6, "#1b2633"); ctx.globalAlpha = lit * smooth(0.5, 1.5, t); circ(ctx, p[0], p[1], 10, "rgba(120,220,255,0.7)"); ctx.globalAlpha = 1; }
      FL.seal(ctx, t, { x: 1650, y: 380, len: 260, dir: -1, beat: 1.2 });
      for (let i = 0; i < 6; i++) { const u = (t * 0.5 + i / 6) % 1; ctx.beginPath(); ctx.arc(1650, 380, 40 + u * 900, Math.PI * 0.6, Math.PI * 1.25); ctx.lineWidth = 5; ctx.strokeStyle = `rgba(255,230,120,${0.8 * (1 - u)})`; ctx.stroke(); }
    } else if (mode === "smell") {
      const nose = sharkPt(so, 30, -6); ctx.lineCap = "round";
      for (let i = 0; i < 60; i++) { const u = i / 60, x = lerp(W + 100, nose[0], u) , y = lerp(300, nose[1], u) + Math.sin(u * 14 - t * 3) * 40 * (1 - u); const a = ((u * 3 - t * 0.6) % 1 + 1) % 1; circ(ctx, x, y, 10 * (1 - u * 0.5), `rgba(220,80,90,${0.25 + 0.5 * a})`); }
    } else {
      const r = rng(4); for (let i = 0; i < 7; i++) { const u = (t * 0.6 + i / 7) % 1; ctx.beginPath(); ctx.arc(1600, 420, 30 + u * 800, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = `rgba(200,240,255,${0.6 * (1 - u)})`; ctx.stroke(); }
      fish(ctx, t * 3, 1600 + Math.sin(t * 12) * 12, 420 + Math.cos(t * 9) * 10, 1.6, "#cfe6ef", "#8fb6c8", -1, 1);
      const lp = [...Array(10)].map((_, i) => sharkPt(so, 200 + i * 60, -10)); line(ctx, lp, 4, `rgba(140,230,255,${0.4 + 0.4 * Math.sin(t * 4)})`);
    }
  };

  // Size: a 5-metre shark beside a person, over a metre ruler.
  RAW.size = (ctx, t, o) => {
    water(ctx, t, { tone: "blue" });
    const m = 270, x0 = 260, y0 = 900;   // px per metre
    shark(ctx, t, { x: x0 + 2.5 * m, y: 560, len: 5 * m, dir: 1, beat: 0.5, amp: 0.02 });
    ctx.save(); ctx.translate(x0 + 5.6 * m, 0); person(ctx, t, { x: 0, y: 900, h: 1.75 * m, skin: "#f1c7a0", hair: "#3a2416", hairStyle: "short", shirt: "#ff8a3d", pants: "#2d3e55", shoe: "#222", w: 0 }); ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fillRect(x0, y0 + 30, 5 * m * smooth(0.4, 1.8, t), 10);
    for (let i = 0; i <= 5; i++) if (t > 0.4 + i * 0.28) { ctx.fillRect(x0 + i * m - 3, y0 + 14, 6, 42); ctx.font = "700 40px Fredoka, sans-serif"; ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.fillText(i + " m", x0 + i * m, y0 + 104); ctx.textAlign = "start"; ctx.fillStyle = "rgba(255,255,255,0.9)"; }
  };

  // A beach with dead sharks washed up and researchers examining them.
  RAW.beach = (ctx, t, o) => {
    const hz = 430;
    sky(ctx, "grey", hz); for (let i = 0; i < 3; i++) cloud(ctx, ((i * 700 + t * 6) % 2400) - 200, 140 + i * 40, 1.8, "rgba(235,240,243,0.6)");
    band(ctx, hz - 40, 30, [[0.003, 1], [0.008, 0.4]], 0.6, hz + 2, "#8aa08a", -100, 900);
    sea(ctx, t, "grey", hz);
    // wet and dry sand; waves washing up and back
    const sw = Math.sin(t * 0.9);
    band(ctx, 640 + sw * 20, 14, [[0.004, 1], [0.011, 0.4]], t * 0.2, H + 10, "#cdb68f");
    band(ctx, 690 + sw * 14, 10, [[0.005, 1]], 1 + t * 0.2, H + 10, "#e6d2a8");
    ctx.save(); ctx.globalAlpha = 0.8; band(ctx, 636 + sw * 24, 8, [[0.006, 1], [0.017, 0.4]], t * 0.5, 650 + sw * 24, "#ffffff"); ctx.restore();
    const sharks = o.sharks ?? [[900, 820, 900, 0]];
    for (const [x, y, len, tin] of sharks) {
      if (t < (tin ?? 0)) continue; const a = smooth(tin ?? 0, (tin ?? 0) + 0.8, t);
      ctx.save(); ctx.globalAlpha = a; shark(ctx, 0, { x, y: y + (1 - a) * -40, len, dir: x > 960 ? 1 : -1, beat: 0, amp: 0, ang: 0.04 }); ctx.restore();
      ell(ctx, x, y + len * 0.1, len * 0.48, 14, 0, "rgba(120,96,64,0.25)");
      if (o.wound !== undefined && t > o.wound && len >= 800) { const so = { x, y, len, dir: x > 960 ? 1 : -1 }, p = sharkPt(so, 300, 60), pu = 1 + 0.08 * Math.sin(t * 6); ctx.beginPath(); ctx.arc(p[0], p[1], 64 * pu, 0, TAU); ctx.lineWidth = 8; ctx.strokeStyle = `rgba(255,90,80,${smooth(o.wound, o.wound + 0.4, t)})`; ctx.stroke(); }
    }
    for (const pp of o.people || []) person(ctx, t, { h: 300, w: 0, shoe: "#2a2a2a", pants: "#3b4a63", ...pp });
    gull(ctx, t, 300 + t * 30, 220, 0.9, 1); gull(ctx, t, 1500 - t * 20, 180, 0.7, 3);
  };

  // Port and Starboard: two orcas seen from behind at the surface, their dorsal fins collapsed one to each side; a ship shows the names.
  RAW.portstar = (ctx, t, o) => {
    const hz = 420; sky(ctx, o.sky || "day", hz); cloud(ctx, 400 + t * 8, 150, 1.2); cloud(ctx, 1500 - t * 6, 110, 1.0);
    sea(ctx, t, o.sky || "day", hz);
    const k = o.scale ?? 1;
    for (const [x0, side, ph] of [[700, -1, 0], [1220, 1, 1.4]]) {
      const bob = Math.sin(t * 0.9 + ph) * 18, up = 0.75 + 0.25 * Math.sin(t * 0.9 + ph);
      const x = x0, y = 760 + bob;
      ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
      fill(ctx, `M -170 30 C -150 ${-40 * up} -60 ${-80 * up} 0 ${-84 * up} C 60 ${-80 * up} 150 ${-40 * up} 170 30 Z`, "#1d2633");
      fill(ctx, `M -120 10 C -80 ${-30 * up} 80 ${-30 * up} 120 10 Z`, "rgba(170,186,204,0.45)");
      // the collapsed fin flops to its side
      const s = side; fill(ctx, `M -26 ${-76 * up} C -10 ${-200 * up} ${s * 40} ${-300 * up} ${s * 190} ${-290 * up} C ${s * 120} ${-260 * up} ${s * 60} ${-180 * up} 26 ${-76 * up} Z`, "#1d2633");
      fill(ctx, `M 0 ${-100 * up} C ${s * 30} ${-220 * up} ${s * 90} ${-270 * up} ${s * 170} ${-282 * up}`, "rgba(0,0,0,0)");
      ctx.restore();
      ell(ctx, x, y + 32 * k, 210 * k, 14, 0, "rgba(255,255,255,0.7)");
    }
    if (o.ship !== undefined && t > o.ship) {   // a little ship diagram, port (left, red) and starboard (right, green)
      const a = smooth(o.ship, o.ship + 0.6, t), x = 960, y = 230; ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(10,40,60,0.75)"; ctx.beginPath(); ctx.roundRect(x - 330, y - 150, 660, 300, 30); ctx.fill();
      fill(ctx, `M ${x} ${y - 120} C ${x + 70} ${y - 60} ${x + 70} ${y + 60} ${x + 60} ${y + 110} L ${x - 60} ${y + 110} C ${x - 70} ${y + 60} ${x - 70} ${y - 60} ${x} ${y - 120} Z`, "#f4f6f8");
      circ(ctx, x - 64, y, 16, "#ff5b4f"); circ(ctx, x + 64, y, 16, "#4fdc7a");
      ctx.font = "700 46px Fredoka, sans-serif"; ctx.fillStyle = "#ff8a80"; ctx.textAlign = "right"; ctx.fillText("PORT", x - 100, y + 16); ctx.fillStyle = "#7df0a0"; ctx.textAlign = "left"; ctx.fillText("STARBOARD", x + 100, y + 16); ctx.textAlign = "start";
      ctx.restore();
    }
  };

  // Cage diving: a boat, a cage half under the surface with divers; below, the water either has sharks or is empty.
  RAW.cage = (ctx, t, o) => {
    const wl = o.wl ?? 380;
    sky(ctx, "day", wl); cloud(ctx, 300 + t * 6, 140, 1.2); cloud(ctx, 1450, 100, 0.9);
    ctx.fillStyle = vgrad(ctx, wl, H, ["#3cb6dc", "#1b77ad", "#0b4373"]); ctx.fillRect(-300, wl, W + 600, H - wl + 300);
    rays(ctx, t, 5, 400, 300, -200, 0.16, H); snow(ctx, t, 30, 9);
    // empty-water sharks, if any
    for (const s of o.sharks || []) { const u = t - s.t0; if (u < 0) continue; shark(ctx, t, { x: s.x0 + s.vx * u, y: s.y, len: s.len ?? 700, dir: Math.sign(s.vx), beat: 0.8, amp: 0.03 }); }
    // boat at left
    const by = wl - 10 + Math.sin(t * 1.2) * 5;
    ctx.save(); ctx.translate(420, by);
    ctx.fillStyle = "#e9eef1"; ctx.fillRect(-200, -170, 260, 90); ctx.fillStyle = "#2f8fb8"; ctx.fillRect(-210, -184, 280, 16);
    for (let i = 0; i < 3; i++) { ctx.fillStyle = "#33505f"; ctx.fillRect(-180 + i * 70, -150, 50, 34); }
    fill(ctx, "M -330 -80 L 330 -70 C 346 -40 336 -10 300 20 L -260 24 C -306 -10 -326 -46 -330 -80 Z", "#f5f7f9"); fill(ctx, "M -260 0 L 316 -4 C 310 8 305 14 300 20 L -260 24 Z", "#1f4f7a");
    ctx.restore();
    // cage: frame and bars, top above the waterline
    const cx = 960, cy = wl + 40 + Math.sin(t * 1.2 + 0.5) * 6;
    ctx.fillStyle = "rgba(200,220,230,0.25)"; ctx.fillRect(cx - 260, cy - 120, 520, 420);
    for (let i = 0; i <= 10; i++) line(ctx, [[cx - 260 + i * 52, cy - 120], [cx - 260 + i * 52, cy + 300]], 7, "#c9d3da");
    for (const yy of [cy - 120, cy + 90, cy + 300]) line(ctx, [[cx - 270, yy], [cx + 270, yy]], 12, "#aab6be");
    for (let i = 0; i < 3; i++) {   // divers: heads in masks inside the cage
      const dx = cx - 160 + i * 160, dy = cy + 120 + Math.sin(t * 1.5 + i) * 8;
      ell(ctx, dx, dy + 60, 44, 90, 0, "#1f2a36"); circ(ctx, dx, dy - 40, 40, "#1f2a36");
      ctx.fillStyle = "#9fe3ff"; ctx.beginPath(); ctx.roundRect(dx - 30, dy - 56, 60, 30, 12); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = "#ffcc33"; ctx.stroke();
      const r = rng(i); for (let k = 0; k < 4; k++) { const u = (t * 0.8 + k / 4 + i * 0.3) % 1; circ(ctx, dx + 20 + Math.sin(u * 6) * 6, dy - 70 - u * (dy - 70 - wl), 6 + k, `rgba(255,255,255,${0.7 * (1 - u)})`); }
    }
    ell(ctx, cx, wl + 4, 300, 10, 0, "rgba(255,255,255,0.6)");
  };

  // Drone view: aerial sea, top-down orcas circling and taking turns at a shark, inside a camera viewfinder.
  RAW.drone = (ctx, t, o) => {
    ctx.fillStyle = vgrad(ctx, 0, H, ["#2f9fbf", "#1f86a8", "#166f8f"]); ctx.fillRect(-300, -300, W + 600, H + 600);
    const r = rng(6); for (let i = 0; i < 90; i++) { const x = ((r() * 2400 + t * 14) % 2400) - 240, y = r() * H, w = 30 + r() * 50; line(ctx, [[x, y], [x + w / 2, y - 4], [x + w, y]], 3, "rgba(255,255,255,0.18)"); }
    const cx = 960 + Math.sin(t * 0.3) * 60, cy = 560;
    const sx = cx + Math.sin(t * 0.9) * 140, sy = cy + Math.cos(t * 0.7) * 80, sang = Math.atan2(-Math.sin(t * 0.7) * 0.7 * 80, Math.cos(t * 0.9) * 0.9 * 140);
    const n = o.n ?? 5;
    for (let i = 0; i < n; i++) {
      const a = t * 0.5 + i * TAU / n, dart = Math.max(0, Math.sin(t * 0.8 - i * 1.3)) ** 6;   // one at a time darts in
      const rr = lerp(330, 60, dart), x = sx + Math.cos(a) * rr * 1.2, y = sy + Math.sin(a) * rr * 0.9;
      const ang = dart > 0.3 ? Math.atan2(sy - y, sx - x) : a + Math.PI / 2;
      topOrca(ctx, t, x, y, 300, ang, i);
      ell(ctx, x - Math.cos(ang) * 150, y - Math.sin(ang) * 150, 60, 14, ang, "rgba(255,255,255,0.25)");
    }
    topShark(ctx, t, sx, sy, 300, sang, { beat: 9, amp: 50, col: "#8aa0b2", col2: "#5f7587" });
    // viewfinder
    screen(ctx, () => {
    ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 6;
    for (const [x, y, dx, dy] of [[80, 80, 1, 1], [W - 80, 80, -1, 1], [80, H - 80, 1, -1], [W - 80, H - 80, -1, -1]]) { ctx.beginPath(); ctx.moveTo(x, y + dy * 90); ctx.lineTo(x, y); ctx.lineTo(x + dx * 90, y); ctx.stroke(); }
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W / 2 - 40, H / 2); ctx.lineTo(W / 2 + 40, H / 2); ctx.moveTo(W / 2, H / 2 - 40); ctx.lineTo(W / 2, H / 2 + 40); ctx.stroke();
    if (Math.floor(t * 1.5) % 2 === 0) circ(ctx, 150, 140, 16, "#ff4b3e");
    ctx.font = "700 40px Fredoka, sans-serif"; ctx.fillStyle = "#fff"; ctx.fillText("REC", 180, 154); ctx.fillText(o.hudText || "ALT 120 M", W - 360, 154);
    });
  };

  // Orca family: a mother, a big male and calves; o.teach makes a calf copy an adult's roll.
  RAW.pod = (ctx, t, o) => {
    water(ctx, t, { tone: o.tone || "blue" });
    const base = [[-0.0, 640, 600, 820, 0], [0.5, 1180, 330, 1000, 1], [1.0, 980, 800, 420, 2], [1.4, 1420, 760, 380, 3], [0.3, 300, 430, 600, 4]];
    const vx = o.vx ?? 30;
    for (const [d, x, y, len, i] of base) {
      if (i >= (o.n ?? 5)) continue;
      let roll = 0; if (o.teach !== undefined) { const tt = o.teach + (i === 2 ? 1.6 : 0); if (i === 1 || i === 2) roll = Math.sin(clamp((t - tt) / 1.4) * Math.PI) * 0.9; }
      orca(ctx, t, { x: x + vx * t + Math.sin(t * 0.5 + d) * 20, y: y + Math.sin(t * 0.7 + d * 3) * 18, len, dir: 1, ang: roll * 0.4, beat: 0.6 + d * 0.1, ph: d * 4, amp: 0.045 });
    }
    if (o.teach !== undefined && t > o.teach + 1.2) { const a = smooth(o.teach + 1.2, o.teach + 1.8, t); ctx.setLineDash([16, 16]); ctx.lineWidth = 6; ctx.strokeStyle = `rgba(255,236,150,${a})`; ctx.beginPath(); ctx.moveTo(1150 + vx * t, 520); ctx.quadraticCurveTo(1100 + vx * t, 640, 960 + vx * t, 700); ctx.stroke(); ctx.setLineDash([]); }
  };

  // Ecosystem cards: orca, great white, seals, bronze whalers, sevengills; the white's card greys out and the others shift.
  RAW.web = (ctx, t, o) => {
    ctx.fillStyle = vgrad(ctx, 0, H, ["#2b9fd6", "#176fae", "#0c477c"]); ctx.fillRect(-300, -300, W + 600, H + 600); snow(ctx, t, 40, 2);
    const card = (x, y, w, h, a, draw, dim = 0) => {
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = "rgba(255,253,246,0.95)"; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 28); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 28); ctx.clip(); ctx.fillStyle = "#bfe9f7"; ctx.fillRect(x - w / 2, y - h / 2, w, h * 0.75); draw(); ctx.restore();
      if (dim) { ctx.fillStyle = `rgba(30,40,50,${0.6 * dim})`; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 28); ctx.fill(); }
      ctx.restore();
    };
    const gone = o.gone !== undefined ? smooth(o.gone, o.gone + 0.8, t) : 0;
    card(960, 200, 400, 240, smooth(0, 0.5, t), () => orca(ctx, t, { x: 960, y: 180, len: 300, dir: 1, amp: 0.03 }));
    card(960, 520, 400, 240, smooth(0.4, 0.9, t), () => shark(ctx, t, { x: 960, y: 500, len: 300, dir: 1 }), gone);
    if (gone > 0) { line(ctx, [[790, 400], [790 + 340 * gone, 400 + 240 * gone]], 14, "#ff6b5b"); }
    const third = [[460, 850, () => FL.seal(ctx, t, { x: 460, y: 830, len: 200, dir: 1 }), "seal"], [960, 850, () => shark(ctx, t, { x: 960, y: 830, len: 260, dir: 1, top: "#b08b5e", base: "#8f6d47", under: "#efe2cc" }), "bronze"], [1460, 850, () => shark(ctx, t, { x: 1460, y: 830, len: 260, dir: 1, top: "#8a9196", base: "#6c7378", under: "#e7eaec" }), "seven"]];
    third.forEach(([x, y, d, nm], i) => {
      const a = smooth(0.8 + i * 0.3, 1.3 + i * 0.3, t); let dy = 0, dm = 0;
      if (o.shift !== undefined) { const k = smooth(o.shift, o.shift + 1, t); if (nm === "bronze") dy = -50 * k; if (nm === "seven") dm = k * 0.5; if (nm === "seal") dy = -60 * k; }
      card(x, y + dy, 380, 220, a, () => { ctx.save(); ctx.translate(0, dy); d(); ctx.restore(); }, dm);
    });
    ctx.lineWidth = 8; ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.setLineDash([14, 12]); for (const [x1, y1, x2, y2] of [[960, 330, 960, 390], [900, 650, 520, 730], [960, 650, 960, 730], [1020, 650, 1400, 730]]) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); } ctx.setLineDash([]);
  };

  // Flat world map with a camera that flies to a focus point; pins drop at their times.
  let LAND;
  RAW.map = (ctx, t, o) => {
    ctx.fillStyle = "#58c3e8"; ctx.fillRect(-300, -300, W + 600, H + 600);
    if (!LAND && window.WORLD_LAND) LAND = new Path2D(window.WORLD_LAND);
    const P2 = (lon, lat) => [(lon + 180) / 360 * 1920, (90 - lat) / 180 * 960 + 60];
    const f0 = o.from || [0, 20, 1], f1 = o.to || f0, k = smooth(o.t0 ?? 0.2, o.t1 ?? 2.4, t);
    const lon = lerp(f0[0], f1[0], k), lat = lerp(f0[1], f1[1], k), z = Math.exp(lerp(Math.log(f0[2]), Math.log(f1[2]), k));
    const [fx, fy] = P2(lon, lat);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-fx, -fy);
    ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 2 / z; for (let g = -180; g <= 180; g += 15) { const [x] = P2(g, 0); ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, 1020); ctx.stroke(); } for (let g = -75; g <= 75; g += 15) { const [, y] = P2(0, g); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1920, y); ctx.stroke(); }
    if (LAND) { ctx.save(); ctx.translate(3 / z, 5 / z); ctx.translate(0, 60); ctx.fillStyle = "rgba(0,60,100,0.25)"; ctx.fill(LAND); ctx.restore(); ctx.save(); ctx.translate(0, 60); ctx.fillStyle = "#f6dca4"; ctx.fill(LAND); ctx.lineWidth = 2.5 / z; ctx.strokeStyle = "#dcb36f"; ctx.stroke(LAND); ctx.restore(); }
    ctx.restore();
    for (const [plon, plat, tt, col] of o.pins || []) {
      if (t < tt) continue; const [px, py] = P2(plon, plat), sx = (px - fx) * z + W / 2, sy = (py - fy) * z + H / 2, u = clamp((t - tt) / 0.5), drop = (1 - u) * -120 + Math.sin(u * Math.PI) * -20;
      ctx.save(); ctx.translate(sx, sy + drop);
      fill(ctx, "M 0 0 C -14 -24 -34 -44 -34 -66 C -34 -90 -18 -104 0 -104 C 18 -104 34 -90 34 -66 C 34 -44 14 -24 0 0 Z", col || "#ff5b4f"); circ(ctx, 0, -68, 13, "#fff");
      ctx.restore(); const a = ((t - tt) * 0.8) % 1; ctx.beginPath(); ctx.ellipse(sx, sy, 20 + a * 60, (20 + a * 60) * 0.4, 0, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = `rgba(255,255,255,${1 - a})`; ctx.stroke();
    }
  };

  // Simple bar chart: o.bars = [[label, value 0..1, colour]], drawn in at o.t0
  RAW.bars = (ctx, t, o) => {
    ctx.fillStyle = vgrad(ctx, 0, H, ["#2b9fd6", "#176fae", "#0c477c"]); ctx.fillRect(-300, -300, W + 600, H + 600); snow(ctx, t, 30, 4);
    const bars = o.bars || [], n = bars.length, bw = 300, gap = 160, x0 = W / 2 - (n * bw + (n - 1) * gap) / 2, base = 820, hmax = 520;
    line(ctx, [[x0 - 60, base], [x0 + n * bw + (n - 1) * gap + 60, base]], 6, "rgba(255,255,255,0.8)");
    bars.forEach(([lab, v, col], i) => {
      const k = smooth((o.t0 ?? 0.6) + i * 0.8, (o.t0 ?? 0.6) + i * 0.8 + 1.0, t), x = x0 + i * (bw + gap), h = hmax * v * k;
      ctx.fillStyle = "rgba(0,30,60,0.25)"; ctx.beginPath(); ctx.roundRect(x + 10, base - h + 10, bw, h, 24); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x, base - h, bw, h, 24); ctx.fill();
      ctx.font = "700 44px Fredoka, sans-serif"; ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.fillText(lab, x + bw / 2, base + 70); ctx.textAlign = "start";
      if (o.seal && k > 0.9) FL.seal(ctx, t, { x: x + bw / 2, y: base - h - 50, len: 170, dir: 1, beat: 1 });
    });
  };

  // End card
  RAW.end = (ctx, t, o) => {
    water(ctx, t, { tone: "blue" });
    orca(ctx, t, { x: 520 + t * 25, y: 900, len: 640, dir: 1, beat: 0.6 });
    shark(ctx, t, { x: 1500 - t * 10, y: 940, len: 500, dir: -1, beat: 0.8, ang: 0.02 });
    bubbles(ctx, t, 20, 5);
  };

  // documentary camera on every scene: o.cam = {z0, z1, x0, x1, y0, y1, ease}, keyed over the scene; plus a gentle handheld drift
  for (const [name, f] of Object.entries(RAW)) {
    SC[name] = (ctx, t, o) => {
      const c = o.cam || {}, d = o.d || 6, k = c.ease === "in" ? smooth(0, d * 0.6, t) : (t / d);
      const z = lerp(c.z0 ?? 1.0, c.z1 ?? 1.04, k), x = lerp(c.x0 ?? 0, c.x1 ?? 0, k) + (c.hand === false ? 0 : Math.sin(t * 0.7) * 6), y = lerp(c.y0 ?? 0, c.y1 ?? 0, k) + (c.hand === false ? 0 : Math.cos(t * 0.53) * 5);
      ctx.setTransform(z, 0, 0, z, W / 2 * (1 - z) + x * z, H / 2 * (1 - z) + y * z);
      f(ctx, t, o);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };
  }
})();
