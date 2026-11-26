// Orca film scenes: real orca photo cut-outs (img_orca_a..c) animated on canvas with the DP rig.
// SC.name(ctx, t, o): t = seconds since the scene started, o = options from build.py. Fluke beats are up-down (side view), as in real orcas.
const SC = (() => {
  const { W, H, clamp, lerp, smooth, ease, easeIn, rng, rgb } = DP;
  const S = {};
  const ORC = { a: "img_orca_a", b: "img_orca_b", c: "img_orca_c" };

  function pos(h, t) {
    if (h.path) { const p = OC.path(h.path, t); return { x: p.x, y: p.y + Math.sin(t * 0.8 + (h.seed || 0)) * (h.drift ?? 5), a: p.a * (h.tilt ?? 0.5) }; }
    return { x: (h.x ?? 960) + Math.sin(t * 0.3 + (h.seed || 0)) * (h.drift ?? 8), y: (h.y ?? 540) + Math.cos(t * 0.4 + (h.seed || 0)) * (h.drift ?? 8) * 0.6, a: 0 };
  }
  // an orca: o = {v: "a"|"b"|"c", len, path or x/y, flip (swim left), angle, beat, fog, dark, sil, rim, alpha, scale}
  function orca(ctx, t, h, d) {
    const p = pos(h, t);
    const sc = lerp(h.s0 ?? 1, h.s1 ?? (h.s0 ?? 1), smooth(0, d || 1, t));
    const al = (h.alpha ?? 1) * (h.in ? smooth(h.in[0], h.in[1], t) : 1) * (h.out ? 1 - smooth(h.out[0], h.out[1], t) : 1);
    if (al < 0.002) return { ...p, o: null };
    const o = { img: h.img || ORC[h.v || "b"], key: h.key || (h.v || "b") + (h.len | 0), len: h.len ?? 900, headRight: true, bend: h.bend ?? 0.42, amp: h.amp ?? 0.045,
      beat: h.beat ?? 0.55, waves: 1.6, phase: h.phase ?? (h.seed || 0), x: p.x, y: p.y, angle: (h.flip ? -p.a : p.a) + (h.angle || 0), flip: h.flip, scale: sc, alpha: al,
      fog: h.fog, dark: h.dark, sil: h.sil, rim: h.rim, hi: h.hi ?? 0.16, lo: h.lo ?? 0.38, blur: h.blur, bob: h.bob ?? 3, tintCol: h.tintCol, shadowY: h.shadowY };
    DP.beast(ctx, t, o);
    return { ...p, o };
  }
  function grade(ctx, o) {
    DP.vignette(ctx, o.vig ?? 0.5);
    if (o.tint) { ctx.fillStyle = rgb(o.tint, o.tint[3]); ctx.fillRect(0, 0, W, H); }
  }
  // open-water underwater backdrop (shallow, blue, with rays) — o.depth 0..1
  function sea(ctx, t, o) {
    DP.bg(ctx, t, { depth: o.depth ?? 0.25, surfaceY: o.surfaceY, sunX: o.sunX ?? 1100, rays: o.rays ?? true });
  }
  const snow = (ctx, t, o) => DP.snow(ctx, t, { count: o.snow ?? 160, rise: o.rise ?? 2, drift: o.driftX ?? 10, near: o.near ?? 8, alpha: o.snowA ?? 0.7, seed: o.seed ?? 11 });

  // ================= SPLIT LEVEL: half above, half below the surface =================
  // the surface line at x, with a travelling wave bump (xw, A) and small ripples
  function surfY(x, t, base, wv) {
    let y = base + Math.sin(x * 0.012 + t * 1.4) * 4 + Math.sin(x * 0.031 - t * 2.3) * 2;
    if (wv && wv.A > 0) y -= wv.A * Math.exp(-Math.pow((x - wv.x) / wv.w, 2));
    return y;
  }
  function surfPath(ctx, t, base, wv, top) {
    ctx.beginPath(); ctx.moveTo(-200, top);
    for (let x = -200; x <= W + 200; x += 16) ctx.lineTo(x, surfY(x, t, base, wv));
    ctx.lineTo(W + 200, top); ctx.closePath();
  }
  // o: {wl (waterline y), floe: {x, w, h} , seal: true, sealFall: [t0, t1], fins: [{x0, x1, t0, t1, h}], orcas: [...], dive: [t0, t1], wave: [t0, t1, A], sky: "polar"|"day", cam}
  S.split = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    const wl = o.wl ?? 520;
    // the wave: grows as the orcas dive and runs at the floe
    let wv = null;
    if (o.wave) {
      const [w0, w1, A] = o.wave, k = clamp((t - w0) / (w1 - w0));
      if (k > 0 && k < 1.2) wv = { x: lerp(o.wave[3] ?? 300, (o.floe?.x ?? 1300) + 200, ease(0, 1, k)), w: 260, A: A * Math.sin(Math.PI * Math.min(1, k * 1.1)) };
    }
    // ---------- below the surface ----------
    const g = ctx.createLinearGradient(0, wl, 0, H);
    g.addColorStop(0, o.sky === "day" ? "#2f86a8" : "#2a6f86"); g.addColorStop(0.5, "#0f3a4d"); g.addColorStop(1, "#04141c");
    ctx.fillStyle = g; ctx.fillRect(-200, wl - 260, W + 400, H - wl + 600);
    ctx.save(); ctx.globalCompositeOperation = "lighter"; OC.rays(ctx, t, 0.7, wl, 1100); ctx.restore();
    // underside of the floe (most of the ice is under water)
    if (o.floe) {
      const f = o.floe, tilt = o.sealFall ? Math.sin(Math.PI * clamp((t - o.sealFall[0]) / (o.sealFall[1] - o.sealFall[0] + 0.6))) * 0.06 : 0;
      ctx.save(); ctx.translate(f.x, wl); ctx.rotate(tilt);
      const ug = ctx.createLinearGradient(0, 0, 0, f.h * 2.6);
      ug.addColorStop(0, "rgba(190,235,245,0.85)"); ug.addColorStop(1, "rgba(80,160,190,0.35)");
      ctx.fillStyle = ug; ctx.beginPath(); ctx.moveTo(-f.w / 2, 0);
      ctx.lineTo(-f.w / 2 + 40, f.h * 2.2); ctx.lineTo(f.w / 2 - 70, f.h * 2.5); ctx.lineTo(f.w / 2, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    const dv = o.dive ? ease(o.dive[0], o.dive[1], t) : 0;
    const drawOrcas = (part) => {
      for (const h of o.orcas || []) {
        const hh = { ...h, path: h.path, y: h.y };
        const p = pos(hh, t);
        // during the dive everyone drops under together and speeds up
        const yy = p.y + dv * (h.diveDy ?? 120), xx = p.x + dv * (h.diveDx ?? 160);
        ctx.save();
        ctx.beginPath();
        if (part === "under") { ctx.rect(-300, surfY(xx, t, wl, wv) - 2, W + 600, H + 300); }
        else { ctx.rect(-300, -300, W + 600, surfY(xx, t, wl, wv) + 300); }
        ctx.clip();
        const r = orca(ctx, t, { ...h, path: undefined, x: xx, y: yy, angle: (h.angle || 0) + dv * (h.diveA ?? 0.25), fog: part === "under" ? (h.fog ? [20, 80, 100, 0.3 + h.fog[3]] : [20, 80, 100, 0.3]) : h.fog, dark: part === "over" ? 0.15 : 0, drift: 0 }, o.d);
        if (h.bigFin && r.o) {     // a tall male dorsal fin standing out of the back
          const q = DP.at(r.o, 0.5, 0.12), fh = (h.len ?? 600) * (h.bigFin === true ? 0.2 : h.bigFin) * (r.o.scale ?? 1), fw = fh * 0.36;
          ctx.fillStyle = part === "over" ? "#14181b" : "rgba(20,40,50,0.9)";
          ctx.beginPath(); ctx.moveTo(q.x - fw, q.y + 6); ctx.quadraticCurveTo(q.x - fw * 0.3, q.y - fh * 0.5, q.x + fw * 0.15, q.y - fh); ctx.quadraticCurveTo(q.x + fw * 0.25, q.y - fh * 0.45, q.x + fw * 0.9, q.y + 6); ctx.closePath(); ctx.fill();
          if (part === "over") { ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.beginPath(); ctx.moveTo(q.x - fw * 0.6, q.y); ctx.quadraticCurveTo(q.x - fw * 0.2, q.y - fh * 0.5, q.x + fw * 0.12, q.y - fh * 0.96); ctx.lineTo(q.x - fw * 0.1, q.y - fh * 0.5); ctx.closePath(); ctx.fill(); }
        }
        ctx.restore();
      }
    };
    drawOrcas("under");
    // the seal falling through the water
    if (o.seal && o.sealFall && t > o.sealFall[1]) {
      const k = clamp((t - o.sealFall[1]) / 1.6);
      DP.beast(ctx, t, { img: "img_seal_floe", key: "sealw", x: (o.floe.x) + 260 + 120 * k, y: wl + 40 + 260 * ease(0, 1, k), len: 300, headRight: true, amp: 0.03, beat: 1.5, angle: 0.6 * k, fog: [20, 80, 100, 0.3], hi: 0.1 });
      OC.bubbles(ctx, t, o.floe.x + 280, wl + 60, { t0: o.sealFall[1], span: 0.8, count: 40, w: 80, seed: 9 });
    }
    DP.snow(ctx, t, { count: 120, rise: 1, drift: 12, near: 4, alpha: 0.5, seed: 13 });
    // ---------- above the surface ----------
    ctx.save(); surfPath(ctx, t, wl, wv, -400); ctx.clip();
    const sg = ctx.createLinearGradient(0, -100, 0, wl);
    if (o.sky === "day") { sg.addColorStop(0, "#7fb6d8"); sg.addColorStop(1, "#d8ecf5"); }
    else { sg.addColorStop(0, "#8aa6b8"); sg.addColorStop(0.6, "#c9d8e0"); sg.addColorStop(1, "#e8eef0"); }
    ctx.fillStyle = sg; ctx.fillRect(-200, -400, W + 400, wl + 400);
    // distant icebergs on the horizon
    const hz = wl - 90;
    ctx.fillStyle = "rgba(235,244,248,0.95)";
    for (const [x, w, hh] of [[180, 300, 60], [620, 180, 34], [1500, 380, 80], [1820, 200, 40]]) { ctx.beginPath(); ctx.moveTo(x - w / 2, hz); ctx.lineTo(x - w * 0.2, hz - hh); ctx.lineTo(x + w * 0.25, hz - hh * 0.8); ctx.lineTo(x + w / 2, hz); ctx.fill(); }
    // the sea surface seen at a low angle: dark water with glints, getting closer toward the lens
    const wg = ctx.createLinearGradient(0, hz, 0, wl);
    wg.addColorStop(0, "#3c5a66"); wg.addColorStop(1, "#1d3a46");
    ctx.fillStyle = wg; ctx.fillRect(-200, hz, W + 400, wl - hz + 40);
    const r = rng(17);
    for (let i = 0; i < 90; i++) {
      const yy = hz + Math.pow(r(), 1.6) * (wl - hz), xx = (r() * W + t * 12 * (1 + (yy - hz) / 60)) % W;
      ctx.fillStyle = `rgba(230,245,250,${0.12 + 0.2 * r()})`; ctx.fillRect(xx, yy, 10 + r() * 40 * (yy - hz) / 90, 1.5);
    }
    // the floe and the seal on it
    if (o.floe) {
      const f = o.floe;
      const tilt = o.sealFall ? Math.sin(Math.PI * clamp((t - o.sealFall[0]) / (o.sealFall[1] - o.sealFall[0] + 0.6))) * 0.06 : 0;
      const lift = wv ? Math.max(0, wv.A * Math.exp(-Math.pow((f.x - wv.x) / wv.w, 2))) * 0.35 : 0;
      ctx.save(); ctx.translate(f.x, wl - lift); ctx.rotate(tilt);
      ctx.fillStyle = "#f4fafc"; ctx.beginPath(); ctx.moveTo(-f.w / 2, 0); ctx.lineTo(-f.w / 2 + 30, -f.h); ctx.lineTo(f.w / 2 - 50, -f.h * 1.1); ctx.lineTo(f.w / 2, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(150,200,220,0.6)"; ctx.beginPath(); ctx.moveTo(f.w / 2 - 50, -f.h * 1.1); ctx.lineTo(f.w / 2, 0); ctx.lineTo(f.w / 2 - 90, 0); ctx.closePath(); ctx.fill();
      if (o.seal) {
        const fk = o.sealFall ? ease(o.sealFall[0], o.sealFall[1], t) : 0;
        if (!o.sealFall || t <= o.sealFall[1] + 0.05) {
          const sx = lerp(-40, f.w / 2 + 60, fk), sy = -f.h - 28 + fk * 80;
          DP.beast(ctx, t, { img: "img_seal_floe", key: "seal", x: sx, y: sy, len: 300, headRight: true, amp: 0.01, beat: 0.3, angle: fk * 0.5, hi: 0.15, lo: 0.25 });
        }
      }
      ctx.restore();
    }
    drawOrcas("over");
    // white water over the wave crest and where fins cut the surface
    if (wv && wv.A > 10) {
      const rr = rng(23);
      for (let i = 0; i < 70; i++) {
        const xx = wv.x + (rr() - 0.5) * wv.w * 1.4, yy = surfY(xx, t, wl, wv) - rr() * 14;
        ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.4 * rr()})`; ctx.beginPath(); ctx.arc(xx, yy, 3 + rr() * 9, 0, 6.283); ctx.fill();
      }
    }
    if (o.splash) for (const [st, sx, sz] of o.splash) {      // splash plumes (a leap, a tail slap)
      const age = t - st; if (age < 0 || age > 1.6) continue;
      const rr = rng(Math.round(sx));
      for (let i = 0; i < 90; i++) {
        const a = -Math.PI / 2 + (rr() - 0.5) * 1.6, v = (200 + rr() * 500) * (sz ?? 1);
        const xx = sx + Math.cos(a) * v * age, yy = wl + Math.sin(a) * v * age + 600 * age * age;
        if (yy > wl + 6) continue;
        ctx.fillStyle = `rgba(255,255,255,${0.7 * (1 - age / 1.6)})`; ctx.beginPath(); ctx.arc(xx, yy, 2 + rr() * 6, 0, 6.283); ctx.fill();
      }
    }
    ctx.restore();
    // the surface line itself: bright meniscus
    ctx.strokeStyle = "rgba(230,248,255,0.85)"; ctx.lineWidth = 3; ctx.beginPath();
    for (let x = -200; x <= W + 200; x += 16) { const y = surfY(x, t, wl, wv); x === -200 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();
    ctx.restore(); grade(ctx, { vig: 0.42 });
  };

  // ================= the pod: a family swimming in formation =================
  // o.members = [{v, len, x, y, phase, label?}], o.leader index glows softly; o.path moves the whole group; o.calls = [[t, idx]] sound rings
  S.pod = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    sea(ctx, t, o);
    if (o.school) DP.school(ctx, t, o.school);
    const gp = o.path ? OC.path(o.path, t) : { x: 0, y: 0 };
    const ms = [...(o.members || [])].map((m, i) => ({ ...m, i })).sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
    for (const m of ms) {
      const far = (m.z ?? 0) < 0;
      const r = orca(ctx, t, { ...m, x: (m.x ?? 960) + gp.x, y: (m.y ?? 540) + gp.y, seed: m.i * 1.7, phase: m.i * 1.3, flip: o.flip ?? m.flip,
        fog: far ? [25, 85, 110, 0.35 + 0.1 * -(m.z)] : m.fog, blur: far ? 2.5 : undefined }, o.d);
      if (o.leader === m.i && r.o && o.leadGlow !== false) {
        const k = smooth(o.tLead ?? 0, (o.tLead ?? 0) + 0.8, t);
        if (k > 0) { ctx.save(); ctx.globalCompositeOperation = "lighter"; const gg = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, m.len * 0.6); gg.addColorStop(0, `rgba(255,220,140,${0.18 * k})`); gg.addColorStop(1, "rgba(255,220,140,0)"); ctx.fillStyle = gg; ctx.fillRect(r.x - m.len, r.y - m.len, m.len * 2, m.len * 2); ctx.restore(); }
      }
      for (const [ct, ci] of o.calls || []) if (ci === m.i && r.o) {
        const q = DP.at(r.o, 0.93, 0.3);
        for (let k = 0; k < 3; k++) OC.click(ctx, t, q.x, q.y, ct + k * 0.25, { dir: o.flip ? Math.PI : 0, spread: 0.6, speed: 500, life: 1.6, width: 3, color: o.muted ? "rgba(255,120,110,0.5)" : undefined });
      }
    }
    snow(ctx, t, o);
    ctx.restore(); grade(ctx, o);
  };

  // ================= sharing a salmon: catch, carry, tear in two =================
  // o.hunter, o.mother (orca specs); tCatch, tTear
  S.share = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    sea(ctx, t, { depth: 0.3 });
    const tc = o.tCatch ?? 1.2, tt = o.tTear ?? 4.2;
    const hp = pos(o.hunter, t), mp = pos(o.mother, t);
    // salmon: flees, is caught at the hunter's mouth, later two halves
    const hr = orca(ctx, t, o.mother, o.d);
    const r = orca(ctx, t, o.hunter, o.d);
    if (r.o) {
      const mouth = DP.at(r.o, o.hunter.flip ? 0.03 : 0.97, 0.55);
      if (t < tc) {
        const k = smooth(0, tc, t);
        DP.beast(ctx, t, { img: "img_salmon2", key: "sal", x: lerp(mouth.x + (o.hunter.flip ? -500 : 500), mouth.x + (o.hunter.flip ? -40 : 40), k), y: mouth.y + Math.sin(t * 6) * 20, len: 230, headRight: false, flip: !o.hunter.flip, beat: 3, amp: 0.08, hi: 0.2 });
      } else if (t < tt) {
        DP.beast(ctx, t, { img: "img_salmon2", key: "sal", x: mouth.x, y: mouth.y + 8, len: 220, headRight: false, flip: !o.hunter.flip, beat: 2, amp: 0.06, angle: 0.5 });
      } else if (hr.o) {
        const k = ease(tt, tt + 0.8, t), mm = DP.at(hr.o, o.mother.flip ? 0.03 : 0.97, 0.55);
        const im = DP.im("img_salmon2");
        if (im) for (const [half, x0] of [[0, mouth.x], [1, mm.x]]) {    // the two halves, one per orca
          const sw = im.naturalWidth / 2;
          ctx.save(); ctx.translate(lerp((mouth.x + mm.x) / 2, x0, k), lerp((mouth.y + mm.y) / 2, half ? mm.y : mouth.y, k) + 8);
          ctx.rotate((half ? -0.4 : 0.4) * k);
          ctx.drawImage(im, half * sw, 0, sw, im.naturalHeight, -55, -38, 110, 76);
          ctx.restore();
        }
        // a small cloud where it tore
        ctx.fillStyle = `rgba(150,30,30,${0.25 * (1 - k)})`; ctx.beginPath(); ctx.arc((mouth.x + mm.x) / 2, (mouth.y + mm.y) / 2, 30 + 60 * k, 0, 6.283); ctx.fill();
      }
    }
    snow(ctx, t, o);
    ctx.restore(); grade(ctx, o);
  };

  // ================= carousel feeding: herring ball, circling orcas, bubbles, tail slap =================
  // o: tTight (ball tightens), tSlap, n orcas circling; the ball rises toward the surface (top of frame)
  S.carousel = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    sea(ctx, t, { depth: 0.35, surfaceY: o.surfaceY ?? -40 });
    const ts = o.tSlap ?? 99, kt = smooth(0, o.tTight ?? o.d, t);
    const cx = 960, cy = lerp(o.cy0 ?? 600, o.cy1 ?? 380, kt), R = lerp(o.r0 ?? 360, o.r1 ?? 170, kt);
    // the herring ball: hundreds of small fish circling a common centre
    const im = DP.im("img_herring"), rr = rng(5), N = o.fish ?? 320;
    const shock = t > ts ? ease(ts, ts + 0.5, t) : 0;
    for (let i = 0; i < N; i++) {
      const ang = rr() * 6.283 + t * (0.6 + rr() * 0.5) * (rr() < 0.5 ? 1 : 1), rad = Math.sqrt(rr()) * R, zz = rr();
      let x = cx + Math.cos(ang) * rad * 1.3, y = cy + Math.sin(ang) * rad * 0.8;
      let stunned = false;
      if (shock > 0 && rr() < 0.4) { stunned = true; y += 60 * shock * rr(); }
      const s = (26 + zz * 30) * (o.fishScale ?? 1);
      if (!im) continue;
      ctx.save(); ctx.translate(x, y); ctx.rotate(stunned ? 1.2 + i : ang + Math.PI / 2); ctx.globalAlpha = 0.55 + 0.45 * zz;
      ctx.drawImage(im, -s / 2, -s * 0.13, s, s * 0.26); ctx.restore();
    }
    // a silver glint over the ball
    ctx.save(); ctx.globalCompositeOperation = "lighter"; const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4); gg.addColorStop(0, "rgba(220,240,255,0.12)"); gg.addColorStop(1, "rgba(220,240,255,0)"); ctx.fillStyle = gg; ctx.fillRect(cx - R * 2, cy - R * 2, R * 4, R * 4); ctx.restore();
    // orcas circling: alternating behind and in front of the ball, flashing white bellies (banked cut-out)
    const n = o.n ?? 4;
    for (let k = 0; k < n; k++) {
      const a = t * (o.spin ?? 0.5) + k * 6.283 / n, front = Math.sin(a) > 0;
      const x = cx + Math.cos(a) * (R + 330), y = cy + Math.sin(a) * (R * 0.35 + 90);
      const slap = t > ts && k === 0 ? 1 : 0;
      const spec = { v: k % 2 ? "b" : "c", len: 620 * (front ? 1.1 : 0.85), x, y, flip: Math.cos(a + Math.PI / 2) < 0, drift: 0, seed: k, beat: slap ? 2.2 : 0.7, amp: slap ? 0.12 : 0.05,
        fog: front ? undefined : [30, 90, 120, 0.35], blur: front ? undefined : 2, angle: slap ? -0.5 * Math.sin(Math.min(1, (t - ts) * 4) * Math.PI) : 0 };
      if (!front) orca(ctx, t, spec, o.d);
      else { ctx.save(); orca(ctx, t, spec, o.d); ctx.restore(); }
      // bubble bursts from the circling orcas
      if ((o.bubbles ?? []).some((bt) => bt === k)) OC.bubbles(ctx, t, x, y - 40, { t0: 0.5 + k, span: o.d, count: 140, w: 120, seed: k + 3 });
    }
    // the tail slap shockwave
    if (shock > 0 && shock < 1) {
      ctx.strokeStyle = `rgba(255,255,255,${0.7 * (1 - shock)})`; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.4 * shock + 40, R * 0.9 * shock + 30, 0, 0, 6.283); ctx.stroke();
    }
    snow(ctx, t, o);
    ctx.restore(); grade(ctx, o);
  };

  // ================= gray whale mother and calf, orcas working in shifts =================
  // o.tSplit: when the calf is pulled away from the mother
  S.graycalf = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    sea(ctx, t, { depth: 0.3, surfaceY: 60 });
    const ks = smooth(o.tSplit ?? 99, (o.tSplit ?? 99) + 3, t);
    const mx = 900 + Math.sin(t * 0.3) * 30, my = 420;
    // mother (big) and calf (small, close at her side, drifting apart as the orcas wedge in)
    DP.beast(ctx, t, { img: "img_gray", key: "gm", x: mx, y: my, len: 1300, headRight: false, beat: 0.3, amp: 0.035, fog: [30, 90, 110, 0.15] });
    DP.beast(ctx, t, { img: "img_gray", key: "gc", x: mx - 80 + ks * 260, y: my + 190 + ks * 260, len: 520, headRight: false, beat: 0.6, amp: 0.05, fog: [30, 90, 110, 0.1] });
    for (const h of o.orcas || []) orca(ctx, t, h, o.d);
    snow(ctx, t, o);
    ctx.restore(); grade(ctx, o);
  };

  // ================= the blue whale hunt: every orca has a job =================
  S.bluewhale = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    sea(ctx, t, { depth: 0.28, surfaceY: 90 });
    const bx = 1000 + Math.sin(t * 0.25) * 20 - t * (o.drift ?? 6), by = 470;
    DP.beast(ctx, t, { img: "img_blue", key: "bw", x: bx, y: by, len: o.blueLen ?? 1700, headRight: true, beat: 0.18, amp: 0.025, fog: [30, 90, 120, 0.2], dark: o.weak ? 0.25 * smooth(0, o.d, t) : 0 });
    for (const h of o.orcas || []) orca(ctx, t, { ...h, x: (h.x ?? 0) + bx - 1000, y: h.y }, o.d);
    snow(ctx, t, o);
    ctx.restore(); grade(ctx, o);
  };

  // ================= the beach: an orca rides a wave up onto the sand, then wriggles back =================
  // side view: sand slope from the right, surf line; o.tUp, o.tBack; o.calf = second smaller orca pushed by the mother
  S.beach = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    const sky = ctx.createLinearGradient(0, 0, 0, 420);
    sky.addColorStop(0, "#9cc3dc"); sky.addColorStop(1, "#e6eef0"); ctx.fillStyle = sky; ctx.fillRect(-200, -200, W + 400, 700);
    // high view along a Patagonian beach: sea fills the top-left, a pebbly shore curves across the lower right
    const sea = ctx.createLinearGradient(0, 380, 0, H);
    sea.addColorStop(0, "#3d6f7e"); sea.addColorStop(1, "#1f4a58"); ctx.fillStyle = sea; ctx.fillRect(-200, 380, W + 400, 900);
    const shoreY = (x) => 1150 - (x - 300) * 0.42 + Math.sin(x * 0.004) * 30;      // the waterline across the frame
    const surge = 40 * Math.sin(t * 1.1);
    const sg = ctx.createLinearGradient(900, 500, 1500, 1080);
    sg.addColorStop(0, "#a9987a"); sg.addColorStop(1, "#d6cab0");
    ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(300, H + 200);
    for (let x = 300; x <= W + 200; x += 20) ctx.lineTo(x, shoreY(x) - surge * 0.3);
    ctx.lineTo(W + 200, H + 200); ctx.closePath(); ctx.fill();
    // wet sand band and pebbles
    ctx.fillStyle = "rgba(90,78,60,0.28)"; ctx.beginPath(); ctx.moveTo(300, H + 200);
    for (let x = 300; x <= W + 200; x += 20) ctx.lineTo(x, shoreY(x) + 10); for (let x = W + 200; x >= 300; x -= 20) ctx.lineTo(x, shoreY(x) + 90); ctx.fill();
    const r = rng(8);
    for (let i = 0; i < 320; i++) { const x = 300 + r() * 1700, y = shoreY(x) + 20 + r() * 700; ctx.fillStyle = `rgba(70,62,50,${0.2 + 0.3 * r()})`; ctx.beginPath(); ctx.ellipse(x, y, 2 + r() * 7, 1 + r() * 3.5, 0, 0, 6.283); ctx.fill(); }
    // surf: foam that runs up the shore and drains back
    for (let k = 0; k < 4; k++) {
      const ph = ((t * 0.3 + k / 4) % 1), off = lerp(-60, 50, Math.sin(ph * Math.PI));
      ctx.strokeStyle = `rgba(255,255,255,${0.75 * (1 - ph)})`; ctx.lineWidth = 6 - k; ctx.beginPath();
      for (let x = 300; x <= W + 200; x += 24) { const y = shoreY(x) - off - k * 26; x === 300 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
    }
    for (const h of o.orcas || []) {
      const up = ease(h.tUp ?? 1, (h.tUp ?? 1) + 1.0, t) * (1 - ease(h.tBack ?? 99, (h.tBack ?? 99) + 2.2, t));
      const x = lerp(h.x0 ?? 300, h.x1 ?? 900, up), y = lerp(h.y0 ?? 560, h.y1 ?? 500, up);
      const wr = t > (h.tBack ?? 99) ? Math.sin(t * 9) * 0.06 : 0;        // the wriggle back
      orca(ctx, t, { ...h, x, y, angle: -0.12 * up + wr, drift: 0, beat: up > 0.5 ? 0.15 : h.beat }, o.d);
      if (up > 0.2) {   // wash of water around the stranded body
        ctx.fillStyle = `rgba(255,255,255,${0.45 * up})`; for (let i = 0; i < 30; i++) { const rr = rng(i + 1); ctx.beginPath(); ctx.arc(x - h.len * 0.5 + rr() * h.len, y + h.len * 0.12 + Math.sin(t * 3 + i) * 6, 4 + rr() * 8, 0, 6.283); ctx.fill(); }
      }
    }
    ctx.restore(); grade(ctx, { vig: 0.35 });
  };

  // ================= Eden, 1900s: sepia film look, whaleboat, orcas herding a whale =================
  S.eden = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    const wl = o.wl ?? 560;
    const sky = ctx.createLinearGradient(0, 0, 0, wl); sky.addColorStop(0, "#cfc3a8"); sky.addColorStop(1, "#ece2cc"); ctx.fillStyle = sky; ctx.fillRect(-200, -200, W + 400, wl + 200);
    // headland of Twofold Bay
    ctx.fillStyle = "#8d826c"; ctx.beginPath(); ctx.moveTo(-200, wl); ctx.quadraticCurveTo(300, wl - 170, 760, wl - 40); ctx.lineTo(760, wl); ctx.fill();
    const sea = ctx.createLinearGradient(0, wl, 0, H); sea.addColorStop(0, "#9c937d"); sea.addColorStop(1, "#5d5546"); ctx.fillStyle = sea; ctx.fillRect(-200, wl, W + 400, H);
    const r = rng(3); for (let i = 0; i < 80; i++) { ctx.fillStyle = `rgba(240,230,205,${0.15 + 0.2 * r()})`; ctx.fillRect((r() * W + t * 8) % W, wl + Math.pow(r(), 1.5) * (H - wl), 20 + r() * 50, 2); }
    // the whale (baleen whale back) and orcas' fins herding it
    const wx = lerp(o.whale0 ?? 1500, o.whale1 ?? 1100, smooth(0, o.d, t));
    ctx.fillStyle = "#2e2a24"; ctx.beginPath(); ctx.ellipse(wx, wl + 6, 230, 34, 0, Math.PI, 0); ctx.fill();
    if (Math.sin(t * 1.2) > 0.7) { ctx.fillStyle = "rgba(240,235,220,0.7)"; ctx.beginPath(); ctx.ellipse(wx - 120, wl - 60, 18, 50, -0.2, 0, 6.283); ctx.fill(); }
    for (const [i, dx] of [[0, -320], [1, 300], [2, -150]]) {
      const fx = wx + dx + Math.sin(t * 1.5 + i) * 30, fy = wl + 4 + Math.sin(t * 2 + i) * 8, hh = i === 0 ? 120 : 80;
      ctx.fillStyle = "#1f1b16"; ctx.beginPath(); ctx.moveTo(fx - 22, fy); ctx.quadraticCurveTo(fx - 4, fy - hh * 0.6, fx + 6, fy - hh); ctx.quadraticCurveTo(fx + 8, fy - hh * 0.4, fx + 34, fy); ctx.fill();
    }
    // the whaleboat with six oarsmen
    if (o.boat) {
      const bx = lerp(o.boat[0], o.boat[1], smooth(0, o.d, t)), by = wl + 10 + Math.sin(t * 1.4) * 5;
      ctx.fillStyle = "#3a3127"; ctx.beginPath(); ctx.moveTo(bx - 170, by - 20); ctx.quadraticCurveTo(bx, by + 30, bx + 170, by - 24); ctx.lineTo(bx + 150, by - 4); ctx.quadraticCurveTo(bx, by + 18, bx - 150, by - 2); ctx.fill();
      for (let k = 0; k < 6; k++) {
        const px = bx - 110 + k * 44, sw = Math.sin(t * 2.4 + k * 0.2) * 0.5;
        ctx.fillStyle = "#2a241d"; ctx.fillRect(px - 6, by - 52, 12, 34); ctx.beginPath(); ctx.arc(px, by - 58, 8, 0, 6.283); ctx.fill();
        ctx.strokeStyle = "#2a241d"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, by - 24); ctx.lineTo(px - 60 * Math.cos(sw) , by + 26 + 20 * Math.sin(sw)); ctx.stroke();
      }
      if (o.rope) { ctx.strokeStyle = "#3a3127"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx + 160, by - 20); ctx.quadraticCurveTo((bx + wx) / 2, wl + 40, wx - 330, wl); ctx.stroke(); }
    }
    ctx.restore();
    // old film: grain, flicker, scratches, sepia vignette
    const fl = 0.04 * Math.sin(t * 37) + 0.03 * Math.sin(t * 91);
    ctx.fillStyle = `rgba(40,30,15,${0.12 + fl})`; ctx.fillRect(0, 0, W, H);
    const rs = rng(Math.floor(t * 12));
    for (let i = 0; i < 700; i++) { ctx.fillStyle = `rgba(${rs() < 0.5 ? "255,250,235" : "20,15,8"},${0.08 * rs()})`; ctx.fillRect(rs() * W, rs() * H, 2, 2); }
    if (rs() < 0.5) { ctx.fillStyle = "rgba(255,250,235,0.25)"; ctx.fillRect(rs() * W, 0, 1.5, H); }
    DP.vignette(ctx, 0.75);
  };

  // ================= Luna: a lone young orca among boat hulls seen from below =================
  S.luna = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    sea(ctx, t, { depth: 0.35, surfaceY: 80 });
    for (const [bx, bw, sp] of o.boats || [[600, 520, 10], [1500, 380, -6]]) {    // hulls on the surface, from below
      const x = bx + t * sp;
      ctx.fillStyle = "rgba(10,20,26,0.85)"; ctx.beginPath(); ctx.moveTo(x - bw / 2, 80); ctx.quadraticCurveTo(x, 80 + bw * 0.22, x + bw / 2, 80); ctx.fill();
      if (o.prop) { ctx.fillStyle = "rgba(10,20,26,0.9)"; ctx.fillRect(x + bw * 0.35, 80 + bw * 0.1, 10, 40); }
    }
    orca(ctx, t, o.hero, o.d);
    snow(ctx, t, o);
    ctx.restore(); grade(ctx, { vig: 0.6, tint: o.cold ? [10, 30, 50, 0.25] : undefined });
  };

  // a generic swim scene with any cut-outs (heroes are orcas unless img given)
  S.swim = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    sea(ctx, t, o);
    if (o.school) DP.school(ctx, t, o.school);
    for (const h of o.heroes || []) orca(ctx, t, h, o.d);
    snow(ctx, t, o);
    ctx.restore(); grade(ctx, o);
  };
  // the dive / descend shot reused for transitions
  S.descend = (ctx, t, o) => {
    const k = smooth(0, o.d, t), depth = lerp(o.d0 ?? 0.15, o.d1 ?? 0.45, k);
    DP.bg(ctx, t, { depth, rays: true, sunX: 1000 });
    DP.snow(ctx, t, { count: 220, rise: o.rise ?? 20, drift: 4, near: 10, seed: 17 });
    for (const h of o.heroes || []) orca(ctx, t, h, o.d);
    DP.vignette(ctx, 0.45);
  };
  return S;
})();
