// Story scenes for "Every Deep Sea Predator Explained". SC.name(ctx, t, o): t = seconds since the scene started, o = options from build.py.
// Heroes are real animal photo cut-outs (img ids) animated by DP.beast; feature points (lure, eye, jaw) are fractions of the photo.
const SC = (() => {
  const { W, H, clamp, lerp, smooth, ease, easeIn, rng, rgb } = DP;
  const S = {};

  // position of a hero at time t from a path [[t, x, y], ...] (or fixed x, y), with gentle drift
  function pos(h, t) {
    if (h.path) {
      const p = OC.path(h.path, t);
      return { x: p.x, y: p.y + Math.sin(t * 0.7 + (h.seed || 0)) * (h.drift ?? 6), a: p.a * (h.tilt ?? 0.4) };
    }
    return { x: (h.x ?? 960) + Math.sin(t * 0.3 + (h.seed || 0)) * (h.drift ?? 10), y: (h.y ?? 540) + Math.cos(t * 0.4 + (h.seed || 0)) * (h.drift ?? 10) * 0.6, a: h.angle || 0 };
  }
  // draw a hero and its glowing features. h.glows = [[u, v, radius, [r,g,b], pulse Hz, base 0..1, t0]]
  function hero(ctx, t, h, d) {
    const p = pos(h, t);
    const sc = lerp(h.s0 ?? 1, h.s1 ?? (h.s0 ?? 1), smooth(0, d || 1, t));
    const al = (h.alpha ?? 1) * (h.in ? smooth(h.in[0], h.in[1], t) : 1) * (h.out ? 1 - smooth(h.out[0], h.out[1], t) : 1);
    if (al <= 0.001) return p;
    const o = { ...h, x: p.x, y: p.y, angle: (h.flip ? -p.a : p.a) + (h.angle || 0), scale: sc, alpha: al, key: h.key || h.img };
    DP.beast(ctx, t, o);
    for (const g of h.glows || []) {
      if (g[6] !== undefined && t < g[6]) continue;
      const q = DP.at(o, g[0], g[1]), k = (g[5] ?? 0.7) + (1 - (g[5] ?? 0.7)) * (0.5 + 0.5 * Math.sin(t * 6.283 * (g[4] ?? 0.8)));
      DP.glow(ctx, q.x, q.y, g[2] * sc, g[3], k * al * (g[6] !== undefined ? smooth(g[6], g[6] + 0.6, t) : 1));
    }
    return { ...p, o };
  }
  // shared environment: water, floor, snow, sparks
  function env(ctx, t, o) {
    DP.bg(ctx, t, { depth: o.depth ?? 0.7, surfaceY: o.surfaceY, haze: o.haze, top: o.top, bot: o.bot, rays: o.rays });
    if (o.biolum) DP.biolum(ctx, t, { count: o.biolum, seed: 31 });
    if (o.floor) DP.floor(ctx, t, o.floor);
  }
  function fx(ctx, t, o) {
    DP.snow(ctx, t, { count: o.snow ?? 240, rise: o.rise ?? 5, drift: o.driftX ?? 5, light: o.lamp, near: o.near ?? 10, alpha: o.snowA ?? 1, seed: o.seed ?? 11 });
  }
  function grade(ctx, o) {
    DP.vignette(ctx, o.vig ?? 0.6);
    if (o.tint) { ctx.fillStyle = rgb(o.tint, o.tint[3]); ctx.fillRect(0, 0, W, H); }
  }

  // ---------- generic: one or more heroes in a place, with optional school / shrimp / lamp ----------
  // o: {depth, heroes: [...], back: [... blurred far animals], school, shrimp, lamp: [x,y,r], torch: [x,y,r,k], cam}
  S.swim = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    env(ctx, t, o);
    for (const h of o.back || []) hero(ctx, t, { blur: 5, fog: [8, 30, 46, 0.5], ...h }, o.d);
    if (o.school) DP.school(ctx, t, o.school);
    if (o.shrimp) DP.shrimp(ctx, t, o.shrimp);
    for (const h of o.heroes || []) hero(ctx, t, h, o.d);
    if (o.shrimp2) DP.shrimp(ctx, t, o.shrimp2);
    fx(ctx, t, o);
    if (o.torch) DP.torch(ctx, ...o.torch);
    ctx.restore(); grade(ctx, o);
  };

  // ---------- a dive: the camera sinks fast, light fades; big depth number is an HTML overlay ----------
  S.descend = (ctx, t, o) => {
    const k = smooth(0, o.d, t), depth = lerp(o.d0 ?? 0.2, o.d1 ?? 0.6, k);
    DP.bg(ctx, t, { depth, rays: depth < 0.45 });
    DP.biolum(ctx, t, { count: Math.round(lerp(0, 50, clamp((depth - 0.5) * 2))), seed: 33 });
    DP.snow(ctx, t, { count: 320, rise: o.rise ?? 40, drift: 3, near: 16, seed: 17 });
    if (o.silhouette) hero(ctx, t, o.silhouette, o.d);
    DP.vignette(ctx, 0.5 + depth * 0.35);
  };

  // ---------- swordfish: warm eyes and brain under a thermal view ----------
  // o.hero; o.heat = [u, v] of the heater organ; o.tHeat when the thermal look switches on
  S.heater = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    env(ctx, t, o);
    const th = smooth(o.tHeat ?? 2, (o.tHeat ?? 2) + 0.8, t);
    const r = hero(ctx, t, { ...o.hero, dark: lerp(o.hero.dark ?? 0, 0.3, th), tintCol: th > 0 ? [30, 60, 150, 0.3 * th] : undefined }, o.d);
    if (r.o && th > 0) {
      const q = DP.at(r.o, o.heat[0], o.heat[1]), R = o.hero.len * 0.028 * (r.o.scale ?? 1);
      const pulse = 0.85 + 0.15 * Math.sin(t * 3);
      DP.glow(ctx, q.x, q.y, R * 1.2, [255, 110, 20], 0.8 * th * pulse);
      DP.glow(ctx, q.x, q.y, R * 0.6, [255, 220, 120], th * pulse);
      const e = DP.at(r.o, o.eye[0], o.eye[1]); DP.glow(ctx, e.x, e.y, R * 0.5, [255, 200, 60], th);
    }
    fx(ctx, t, o);
    ctx.restore();
    if (th > 0) { ctx.fillStyle = `rgba(10,0,40,${0.12 * th})`; ctx.fillRect(0, 0, W, H); }
    grade(ctx, o);
  };

  // ---------- Humboldt squid pack: a group closing on a school, skin flashing red and white ----------
  S.pack = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    env(ctx, t, o);
    DP.school(ctx, t, o.school);
    const r = rng(9);
    for (let i = 0; i < (o.n ?? 5); i++) {
      const h = o.heroes[i % o.heroes.length];
      const fl = 0.5 + 0.5 * Math.sin(t * (5 + r() * 4) + r() * 6);      // the flashing
      const strike = o.tStrike ?? 99;
      const on = t > strike - 0.6 ? clamp(Math.sin(t * 14 + i) * 0.5 + 0.5) : fl * 0.35;
      hero(ctx, t, { ...h, key: "sq" + i, tintCol: [on > 0.5 ? 255 : 150, on > 0.5 ? 245 : 20, on > 0.5 ? 240 : 20, 0.18 + 0.32 * on] }, o.d);
    }
    fx(ctx, t, o);
    ctx.restore(); grade(ctx, o);
  };

  // ---------- lure and strike: viperfish / anglerfish. o.lure = [u, v, r, col]; small fish come close, then a lunge ----------
  S.lure = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, { ...o.cam, shake: [[o.tStrike ?? 99, 10, 0.5]] });
    env(ctx, t, o);
    const ts = o.tStrike ?? 99, lunge = ease(ts, ts + 0.25, t) - ease(ts + 0.35, ts + 1.4, t) * 0.6;
    const h = { ...o.hero, glows: [], x: (o.hero.x ?? 960) + (o.lungeDx ?? 160) * lunge, y: (o.hero.y ?? 540) + (o.lungeDy ?? 0) * lunge, beat: t > ts && t < ts + 0.5 ? 2 : o.hero.beat };
    const r = hero(ctx, t, h, o.d);
    const L = DP.at(r.o, o.lure[0], o.lure[1]);
    if (o.fil) {     // the lure's stalk: a fine curved filament from the back to the light
      const F = DP.at(r.o, o.fil[0], o.fil[1]);
      ctx.save(); ctx.strokeStyle = "rgba(170,190,200,0.55)"; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(F.x, F.y);
      ctx.quadraticCurveTo((F.x + L.x) / 2 + Math.sin(t * 1.3) * 12, Math.min(F.y, L.y) - 120, L.x, L.y); ctx.stroke(); ctx.restore();
    }
    const flick = 0.8 + 0.2 * Math.sin(t * 2.4) + 0.08 * Math.sin(t * 13);
    DP.glow(ctx, L.x, L.y, o.lure[2], o.lure[3] || [120, 230, 255], flick);
    DP.snow(ctx, t, { count: 90, rise: 2, drift: 3, near: 0, light: [L.x, L.y, 260], alpha: 0.7, seed: 61 });
    // prey: small fish drawn toward the light, then gone
    const mouth = DP.at(r.o, o.mouth[0], o.mouth[1]);
    for (const [i, f] of (o.prey || []).entries()) {
      const k = smooth(f.t0, ts, t);
      if (t > ts + 0.15 && f.eat) continue;
      const fl = t > ts && !f.eat;
      const x = fl ? lerp(f.x1, f.x1 + (f.flee ?? 600), ease(ts, ts + 1.2, t)) : lerp(f.x0, f.eat ? mouth.x + (f.dx ?? 30) : f.x1, k);
      const y = fl ? f.y1 - 200 * ease(ts, ts + 1.2, t) : lerp(f.y0, f.eat ? mouth.y : f.y1, k);
      DP.beast(ctx, t, { img: o.preyImg || "img_lantern", key: "pr" + i, x, y, len: f.len ?? 70, beat: 2, amp: 0.08, bend: 0.35, headRight: false, flip: f.flip, fog: [10, 30, 40, 0.25], hi: 0.3, alpha: smooth(0, 0.6, t) });
    }
    fx(ctx, t, { ...o, lamp: [L.x, L.y, 300] });
    ctx.restore(); grade(ctx, o);
  };

  // ---------- stoplight loosejaw: a red beam only it can see ----------
  // o.organ = [u, v]; o.tBeam; o.preyView: [t0, t1] when we see what the prey sees (no beam)
  S.redbeam = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    env(ctx, t, o);
    const pv = o.preyView ? smooth(o.preyView[0], o.preyView[0] + 0.4, t) * (1 - smooth(o.preyView[1], o.preyView[1] + 0.4, t)) : 0;
    const kb = smooth(o.tBeam ?? 1, (o.tBeam ?? 1) + 0.8, t) * (1 - pv);
    // prey shrimp lit red by the beam
    const r = hero(ctx, t, o.hero, o.d);
    const q = DP.at(r.o, o.organ[0], o.organ[1]);
    const ang = (o.hero.flip ? Math.PI : 0) + (o.beamAng ?? 0) + Math.sin(t * 0.6) * 0.06;
    DP.beam(ctx, q.x, q.y, ang, o.beamLen ?? 1300, 0.16, [255, 20, 10], kb * 0.9);
    DP.glow(ctx, q.x, q.y, 16, [255, 40, 20], 0.3 + 0.7 * kb);
    if (o.shrimp) {
      DP.shrimp(ctx, t, o.shrimp);
      // tint the shrimp red where the beam falls
      if (kb > 0) { ctx.save(); ctx.globalCompositeOperation = "source-atop"; ctx.restore(); }
    }
    fx(ctx, t, { ...o, lamp: kb > 0.1 ? [q.x + Math.cos(ang) * 500, q.y + Math.sin(ang) * 500, 520] : undefined });
    ctx.restore();
    if (kb > 0.05) {   // red cast over everything the beam touches
      ctx.save(); ctx.globalCompositeOperation = "multiply"; ctx.fillStyle = `rgba(255,${Math.round(lerp(255, 120, kb))},${Math.round(lerp(255, 110, kb))},1)`; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
    grade(ctx, o);
  };

  // ---------- black dragonfish: a lamp sweeps across, the fish is a hole in the lit snow ----------
  S.ultrablack = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    env(ctx, t, o);
    const lx = lerp(o.lamp0[0], o.lamp1[0], smooth(0, o.d, t)), ly = lerp(o.lamp0[1], o.lamp1[1], smooth(0, o.d, t));
    const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, o.lampR ?? 420);
    g.addColorStop(0, "rgba(140,190,215,0.42)"); g.addColorStop(1, "rgba(140,190,215,0)");
    ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
    DP.snow(ctx, t, { count: 900, rise: 3, drift: 4, near: 16, light: [lx, ly, o.lampR ?? 420], seed: 71, alpha: 1.3 });
    hero(ctx, t, { ...o.hero, sil: o.sil ?? 0.97, rim: o.rim ?? [60, 90, 110, 0.18] }, o.d);
    ctx.restore(); grade(ctx, o);
  };

  // ---------- black swallower: swallows a bigger fish, its stomach balloons, the prey shows through ----------
  // o.hero (swallower), o.prey {img, len}, o.belly = [u, v] where the stomach hangs, tGulp
  S.swallow = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    env(ctx, t, o);
    const tg = o.tGulp ?? 3, k = smooth(tg, tg + 2.2, t);
    const r0 = { ...o.hero };
    // prey: approaches, then is pulled in head first and shrinks into the belly
    const hp = pos(r0, t), mouthX = hp.x + (o.hero.flip ? 1 : -1) * o.hero.len * 0.45;
    if (k < 1) {
      const px = lerp(o.prey.x0, mouthX + (o.hero.flip ? 1 : -1) * o.prey.len * 0.5, smooth(0, tg, t));
      DP.beast(ctx, t, { img: o.prey.img, key: "prey", x: px - (o.hero.flip ? 1 : -1) * o.prey.len * 0.4 * k, y: hp.y + 10, len: o.prey.len * (1 - 0.55 * k), beat: 0.9, amp: 0.05, headRight: o.prey.headRight ?? false, flip: o.prey.flip, alpha: 1 - k, fog: [8, 24, 34, 0.25] });
    }
    // the stomach: a thin dark sac that swells under the body (drawn first, so the body sits on top), the curled prey dimly visible inside
    if (k > 0) {
      const o2 = { ...o.hero, x: hp.x, y: hp.y, angle: o.hero.angle || 0, scale: o.hero.s0 ?? 1 };
      const b = DP.at(o2, o.belly[0], o.belly[1]), R = o.hero.len * lerp(0.04, o.bellyR ?? 0.3, ease(tg, tg + 2.2, t)) * (o2.scale ?? 1);
      const bx = b.x, by = b.y + R * 0.6;
      ctx.save();
      ctx.beginPath(); ctx.ellipse(bx, by, R * 1.45, R, 0, 0, 6.283); ctx.clip();
      const base = ctx.createRadialGradient(bx, by - R * 0.3, R * 0.2, bx, by, R * 1.5);
      base.addColorStop(0, "rgba(46,36,40,0.97)"); base.addColorStop(1, "rgba(8,6,9,0.98)");
      ctx.fillStyle = base; ctx.fillRect(bx - R * 2, by - R * 2, R * 4, R * 4);
      const pim = DP.im(o.prey.img);
      if (pim) {   // the prey, folded to fit
        ctx.globalAlpha = 0.2 * k; ctx.globalCompositeOperation = "screen"; ctx.translate(bx, by); ctx.rotate(0.25);
        const pw = R * 2.5, ph = pw * pim.naturalHeight / pim.naturalWidth; ctx.drawImage(pim, -pw / 2, -ph / 2, pw, ph);
      }
      ctx.restore();
      ctx.save();   // stretched skin: a soft highlight on top, veins of light, dark rim
      const sg = ctx.createRadialGradient(bx - R * 0.45, by - R * 0.55, 0, bx, by, R * 1.5);
      sg.addColorStop(0, "rgba(200,210,225,0.14)"); sg.addColorStop(0.45, "rgba(100,110,130,0.03)"); sg.addColorStop(1, "rgba(0,0,0,0.6)");
      ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(bx, by, R * 1.45, R, 0, 0, 6.283); ctx.fill();
      ctx.strokeStyle = "rgba(150,160,175,0.3)"; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
    }
    hero(ctx, t, o.hero, o.d);
    fx(ctx, t, o);
    ctx.restore(); grade(ctx, o);
  };
  // ---------- the meal rots: the swollen fish drifts up, belly-up, toward the light ----------
  S.floatup = (ctx, t, o) => {
    const k = smooth(0, o.d, t);
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    DP.bg(ctx, t, { depth: lerp(0.75, 0.2, k), rays: true });
    DP.snow(ctx, t, { count: 220, rise: -18, drift: 2, near: 8, seed: 81 });
    const y = lerp(820, 360, k), x = 960 + Math.sin(t * 0.4) * 40;
    const h = { ...o.hero, x, y, angle: Math.PI + 0.1 + Math.sin(t * 0.5) * 0.08, beat: 0.05, amp: 0.01, fog: [20, 60, 80, lerp(0.4, 0.1, k)] };
    const r = hero(ctx, t, h, o.d);
    if (r.o && (o.bellyR ?? 0.3) > 0) {
      const b = DP.at(r.o, o.belly[0], o.belly[1]), R = o.hero.len * (o.bellyR ?? 0.3);
      const sg = ctx.createRadialGradient(b.x, b.y - R * 0.55, 0, b.x, b.y - R * 0.55, R * 1.4);
      sg.addColorStop(0, "rgba(200,190,170,0.85)"); sg.addColorStop(1, "rgba(60,50,45,0.9)");
      ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(b.x, b.y - R * 0.55, R * 1.35, R, 0, 0, 6.283); ctx.fill();
      OC.bubbles(ctx, t, b.x, b.y - R * 1.2, { t0: 0, span: o.d, count: 60, w: 50, seed: 4 });
    }
    ctx.restore(); grade(ctx, { vig: 0.5 });
  };

  // ---------- gulper eel: the mouth opens into a huge net and scoops shrimp ----------
  // o.hero; o.jaw = [u, v] hinge point; tOpen
  S.gulper = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    env(ctx, t, o);
    const to = o.tOpen ?? 1.5, open = smooth(to, to + 1.2, t) * (1 - smooth(to + 3.2, to + 3.8, t));
    const r = hero(ctx, t, o.hero, o.d);
    if (r.o) {
      const j = DP.at(r.o, o.jaw[0], o.jaw[1]), L = o.hero.len * (r.o.scale ?? 1);
      const dir = o.hero.flip ? 1 : -1;
      if (o.noPouch) { if (o.shrimp) DP.shrimp(ctx, t, { ...o.shrimp, suck: [0.8, j.x, j.y, 280] }); fx(ctx, t, o); ctx.restore(); grade(ctx, o); return; }
      // the pouch: a thin dark membrane between the long jaws
      const tipX = j.x + dir * L * lerp(0.08, 0.26, open), up = L * lerp(0.02, 0.2, open), dn = L * lerp(0.02, 0.24, open);
      ctx.save();
      const g = ctx.createRadialGradient(j.x, j.y, 0, j.x, j.y, L * 0.3);
      g.addColorStop(0, "rgba(10,8,10,0.95)"); g.addColorStop(1, "rgba(40,36,44,0.75)");
      ctx.fillStyle = g; ctx.strokeStyle = "rgba(170,160,175,0.45)"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(j.x, j.y);
      ctx.quadraticCurveTo(j.x + dir * L * 0.1, j.y - up * 1.2, tipX, j.y - up);
      ctx.quadraticCurveTo(tipX + dir * L * 0.06 * open, j.y + (dn - up) * 0.5, tipX, j.y + dn);
      ctx.quadraticCurveTo(j.x + dir * L * 0.12, j.y + dn * 1.25, j.x, j.y + L * 0.02);
      ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      if (o.shrimp) DP.shrimp(ctx, t, { ...o.shrimp, suck: [to + 0.6, tipX - dir * 30, j.y + (dn - up) * 0.3, 260] });
    }
    fx(ctx, t, o);
    ctx.restore(); grade(ctx, o);
  };

  // ---------- goblin shark: the jaw launches out of the face, grabs, snaps back ----------
  // o.hero; o.jaw = [u0, v0, u1, v1] the jaw region in the photo; tStrike; slow (time scale for the strike)
  S.slingshot = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, { ...o.cam, shake: [[o.tStrike ?? 99, 8, 0.4]] });
    env(ctx, t, o);
    const ts = o.tStrike ?? 3, sl = o.slow ?? 1;
    const out = ease(ts, ts + 0.12 * sl, t) * (1 - smooth(ts + 0.25 * sl, ts + 0.6 * sl, t));
    const h = o.hero, p = pos(h, t), img = DP.im(h.img);
    // prey fish in front of the snout
    if (o.prey && t < ts + 0.2 * sl) DP.beast(ctx, t, { img: o.preyImg || "img_lantern", key: "gp", x: o.prey[0] + Math.sin(t * 2) * 20, y: o.prey[1], len: o.prey[2] ?? 110, beat: 2.2, amp: 0.08, headRight: false, flip: !h.flip, fog: [10, 30, 40, 0.2], hi: 0.3 });
    if (img) {
      const len = h.len, sc = len / img.naturalWidth, w = img.naturalWidth * sc, hh = img.naturalHeight * sc;
      const [u0, v0, u1, v1] = o.jaw, dir = h.flip ? -1 : 1;
      // body without the jaw
      const B = DP.buf("gob", w + 4, hh + 4), c = B.getContext("2d");
      c.globalCompositeOperation = "source-over"; c.clearRect(0, 0, B.width, B.height); c.drawImage(img, 2, 2, w, hh);
      c.globalCompositeOperation = "destination-out"; c.fillStyle = "#000";
      c.fillRect(2 + u0 * w, 2 + v0 * hh, (u1 - u0) * w, (v1 - v0) * hh);
      c.globalCompositeOperation = "source-atop";
      const lg = c.createLinearGradient(0, 0, 0, hh); lg.addColorStop(0, "rgba(220,235,245,0.12)"); lg.addColorStop(0.5, "rgba(0,0,0,0)"); lg.addColorStop(1, "rgba(0,6,12,0.4)");
      c.fillStyle = lg; c.fillRect(0, 0, B.width, B.height);
      // the jaw on its own
      const J = DP.buf("gobj", w + 4, hh + 4), jc = J.getContext("2d");
      jc.globalCompositeOperation = "source-over"; jc.clearRect(0, 0, J.width, J.height);
      jc.save(); jc.beginPath(); jc.rect(2 + u0 * w, 2 + v0 * hh, (u1 - u0) * w, (v1 - v0) * hh); jc.clip(); jc.drawImage(img, 2, 2, w, hh); jc.restore();
      // the jaw rests folded up under the snout; on the strike it stretches out forward and down to its full (photo) reach, then folds back
      ctx.save(); ctx.translate(p.x, p.y); ctx.scale(dir, 1);
      ctx.drawImage(B, -B.width / 2, -B.height / 2);
      const ax = -w / 2 + (u0 + u1) / 2 * w, ay = -hh / 2 + v0 * hh;          // hinge: top of the jaw region
      ctx.translate(ax + lerp(w * 0.03, -w * (o.jawOut ?? 0.07), out), ay + hh * 0.04 * out);
      ctx.scale(lerp(0.85, 1.1, out), lerp(0.3, 1.2, out)); ctx.rotate(lerp(0, -0.06, out));
      ctx.drawImage(J, -B.width / 2 - ax, -B.height / 2 - ay);
      ctx.restore();
    }
    fx(ctx, t, o);
    ctx.restore(); grade(ctx, o);
  };

  // ---------- Greenland shark under the ice ----------
  S.ice = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#5d8d9b"); g.addColorStop(0.25, "#1f4652"); g.addColorStop(1, "#04121a");
    ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
    // the underside of the sea ice: pale, cracked, with light leaking through the cracks
    const r = rng(5);
    ctx.fillStyle = "rgba(210,235,240,0.85)"; ctx.beginPath(); ctx.moveTo(-200, -200);
    for (let x = -200; x <= W + 200; x += 60) ctx.lineTo(x, 110 + Math.sin(x * 0.006) * 30 + r() * 26);
    ctx.lineTo(W + 200, -200); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 6; i++) OC.rays(ctx, t + i, 0.5, 120, 300 + i * 260);
    ctx.restore();
    for (const h of o.heroes || []) hero(ctx, t, h, o.d);
    DP.snow(ctx, t, { count: 260, rise: 2, drift: 6, near: 12, seed: 91 });
    ctx.restore(); grade(ctx, o);
  };

  // ---------- giant squid and the glowing jellyfish lure (an electronic jelly on a camera rig) ----------
  S.ejelly = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    env(ctx, t, o);
    const [jx, jy] = o.jelly;
    // a ring of blue LEDs flashing in sequence, like a jelly's alarm display
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * 6.283, ph = (t * 1.8 - i / 16) % 1, k = Math.max(0, 1 - Math.abs(ph - 0.5) * 4);
      DP.glow(ctx, jx + Math.cos(a) * 60, jy + Math.sin(a) * 60, 10, [80, 170, 255], 0.25 + 0.75 * k);
    }
    DP.glow(ctx, jx, jy, 26, [60, 140, 255], 0.5 + 0.2 * Math.sin(t * 3));
    for (const h of o.heroes || []) hero(ctx, t, h, o.d);
    fx(ctx, t, { ...o, lamp: [jx, jy, 380] });
    ctx.restore(); grade(ctx, o);
  };

  // ---------- sperm whale hunting by sound: click arcs fly out, echoes come back off a squid ----------
  S.clicks = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    env(ctx, t, o);
    for (const h of o.back || []) hero(ctx, t, { blur: 4, ...h }, o.d);
    const r = hero(ctx, t, o.hero, o.d);
    if (r.o) {
      const m = DP.at(r.o, o.head[0], o.head[1]);
      const dir = o.hero.flip ? Math.PI : 0;
      for (let i = 0; i < 40; i++) {
        const t0 = (o.c0 ?? 0.6) + i * (o.every ?? 0.45);
        OC.click(ctx, t, m.x, m.y, t0, { dir: dir + (o.aim ?? 0), spread: 0.35, speed: 900, life: 1.4, width: 4 });
        if (o.target) OC.click(ctx, t, o.target[0], o.target[1], t0 + 0.9, { dir: dir + Math.PI + (o.aim ?? 0), spread: 0.5, speed: 600, life: 1.0, width: 2, color: "rgba(255,210,140,0.6)" });
      }
    }
    fx(ctx, t, o);
    ctx.restore(); grade(ctx, o);
  };

  // ---------- predatory tunicate: a hooded mouth on a stalk that snaps shut on drifting prey ----------
  // o.hero = still cut-out {img, x, y, h}; o.hood = v (fraction of height) where the hood hinges; tSnap
  S.tunicate = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    env(ctx, t, o);
    const ts = o.tSnap ?? 3, shut = ease(ts, ts + 0.25, t) * (1 - smooth(ts + 2.2, ts + 3.4, t));
    const h = o.hero, img = DP.im(h.img);
    if (img) {
      const hh = h.h, w = hh * img.naturalWidth / img.naturalHeight, x0 = h.x - w / 2, y0 = h.y - hh / 2, hv = o.hood ?? 0.45;
      // prey copepod drifting into the open hood
      const px = lerp(h.x + 500, h.x + w * 0.05, smooth(0.3, ts, t)), py = lerp(y0 - 120, y0 + hh * hv * 0.5, smooth(0.3, ts, t));
      if (t < ts + 0.1) DP.shrimp(ctx, t, { n: 1, cx: px, cy: py, rx: 0, ry: 0, size: 12, seed: 3 });
      ctx.save(); ctx.globalAlpha = 1;
      ctx.drawImage(img, 0, img.naturalHeight * hv, img.naturalWidth, img.naturalHeight * (1 - hv), x0, y0 + hh * hv, w, hh * (1 - hv));      // stalk and body
      ctx.translate(x0 + w * 0.5, y0 + hh * hv); ctx.scale(1, lerp(1, 0.35, shut));                                                       // the hood folds down
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight * hv, -w / 2, -hh * hv, w, hh * hv);
      ctx.restore();
    }
    DP.shrimp(ctx, t, { n: 14, cx: 960, cy: 400, rx: 900, ry: 300, size: 6, seed: 12 });
    fx(ctx, t, o);
    ctx.restore(); grade(ctx, o);
  };

  // ---------- harp sponge: tiny crustaceans drift in and stick to the hooked branches ----------
  S.harp = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    env(ctx, t, o);
    DP.still(ctx, { ...o.hero, fog: [6, 20, 30, 0.15] });
    DP.shrimp(ctx, t, { n: o.stick.length, cx: o.hero.x + 700, cy: o.hero.y - 150, rx: 300, ry: 260, size: 8, seed: 14, drift: -40, stick: o.stick });
    fx(ctx, t, { ...o, driftX: -12 });
    ctx.restore(); grade(ctx, o);
  };

  // ---------- the unknown: something big passes in the dark, only a glow and an eye ----------
  S.unknown = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    DP.bg(ctx, t, { depth: 1 });
    DP.biolum(ctx, t, { count: 30, seed: 35 });
    DP.snow(ctx, t, { count: 200, rise: 2, drift: 3, near: 6, alpha: 0.6, seed: 37 });
    const x = lerp(-600, W + 600, smooth(0, o.d, t)), y = 560 + Math.sin(t * 0.5) * 30;
    if (o.hero) hero(ctx, t, { ...o.hero, path: undefined, x, y, sil: 0.92, rim: [60, 120, 160, 0.25], drift: 0 }, o.d);
    DP.glow(ctx, x + (o.eyeDx ?? 260), y - 20, 9, [180, 255, 220], 0.6 + 0.4 * Math.sin(t * 2));
    ctx.restore(); grade(ctx, { vig: 0.7 });
  };
  return S;
})();
