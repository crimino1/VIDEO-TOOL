// Explainer scenes for "Why Are So Many Penguins Gay?". Animation is used only where footage can't show the idea.
(() => {
  const { W, H, clamp, lerp, smooth, rng, trace, fill, vgrad, ell, circ, line, band, cloud, water, sky, snow, screen } = FL;
  const TAU = Math.PI * 2, RAW = FL.RAW;
  // species colours: back, head, belly, accent, bill, feet
  const SP = {
    chinstrap: { back: "#26303b", head: "#26303b", belly: "#f6f8fa", face: "#f6f8fa", bill: "#1c2229", feet: "#e7a3a3", strap: true },
    gentoo: { back: "#2a3440", head: "#2a3440", belly: "#f6f8fa", bill: "#f26b2a", feet: "#f3a03a", band: true },
    king: { back: "#5d6b78", head: "#1d232b", belly: "#f6f8fa", bill: "#1d232b", feet: "#1d232b", patch: "#f7a63a", chest: "#ffe7a8" },
    emperor: { back: "#4b5866", head: "#1d232b", belly: "#f6f8fa", bill: "#1d232b", feet: "#1d232b", patch: "#ffd36b", chest: "#fff1c4" },
    adelie: { back: "#1f262e", head: "#1f262e", belly: "#f6f8fa", bill: "#1f262e", feet: "#f3b3a8", ring: true },
    humboldt: { back: "#2c343d", head: "#2c343d", belly: "#f6f8fa", bill: "#1f262e", feet: "#2c343d", hband: true, pink: true },
  };
  // a standing penguin, three-quarter view, facing dir (+1 right). h = height in px.
  FL.penguin = (ctx, t, o) => {
    const S = SP[o.sp || "chinstrap"], h = o.h ?? 300, k = h / 1000, dir = o.dir ?? 1;
    const wad = o.waddle ? Math.sin(t * TAU * (o.waddle)) : 0, bob = Math.abs(wad) * 10;
    ctx.save(); ctx.translate(o.x, o.y - bob * k * 3); ctx.scale(dir * k, k); ctx.rotate(wad * 0.06 + (o.lean ?? 0));
    // feet
    ell(ctx, -70 + wad * 20, -10, 80, 26, 0, S.feet); ell(ctx, 70 - wad * 20, -10, 80, 26, 0, shadeC(S.feet));
    // far flipper
    ctx.save(); ctx.translate(-130, -560); ctx.rotate(0.15 + (o.flap ? Math.sin(t * 12) * 0.4 : 0)); fill(ctx, "M 0 0 C -60 120 -70 260 -40 360 C -10 260 10 120 20 0 Z", shadeC(S.back)); ctx.restore();
    // body
    const body = "M 0 -1000 C 120 -1000 190 -900 190 -780 C 190 -700 230 -600 250 -460 C 270 -280 220 -60 0 -30 C -220 -60 -270 -280 -250 -460 C -230 -600 -190 -700 -190 -780 C -190 -900 -120 -1000 0 -1000 Z";
    fill(ctx, body, S.back);
    ctx.save(); trace(ctx, body); ctx.clip();
    fill(ctx, "M 40 -760 C 200 -700 250 -480 230 -260 C 210 -90 120 -40 20 -36 C -80 -40 -140 -120 -150 -280 C -160 -480 -120 -680 40 -760 Z", S.belly);
    if (S.chest) fill(ctx, "M 40 -760 C 180 -720 230 -620 228 -540 C 120 -560 20 -620 -60 -640 C -40 -700 0 -740 40 -760 Z", S.chest);
    ctx.restore();
    // head
    ctx.save(); ctx.translate(20, -820); ctx.rotate(o.look ?? 0);
    fill(ctx, "M -130 0 C -140 -140 -60 -210 30 -205 C 130 -200 180 -120 170 -10 C 160 60 100 100 20 100 C -60 100 -125 70 -130 0 Z", S.head);
    if (S.face) fill(ctx, "M -40 -40 C -20 -110 80 -130 150 -80 C 180 -30 170 40 120 80 C 60 100 -10 80 -40 -40 Z", S.face);
    if (S.strap) { ctx.beginPath(); ctx.moveTo(-20, 40); ctx.quadraticCurveTo(80, 100, 165, 20); ctx.lineWidth = 12; ctx.strokeStyle = "#26303b"; ctx.stroke(); }
    if (S.band) { ctx.beginPath(); ctx.moveTo(10, -180); ctx.quadraticCurveTo(70, -150, 110, -80); ctx.lineWidth = 34; ctx.strokeStyle = "#f6f8fa"; ctx.lineCap = "round"; ctx.stroke(); }
    if (S.hband) { ctx.beginPath(); ctx.moveTo(-60, -170); ctx.quadraticCurveTo(140, -200, 120, 40); ctx.lineWidth = 26; ctx.strokeStyle = "#f6f8fa"; ctx.stroke(); }
    if (S.pink) ell(ctx, 120, -60, 34, 22, 0.3, "#ef9aa0");
    if (S.patch) fill(ctx, "M -90 -30 C -120 -90 -80 -150 -30 -130 C 0 -110 -10 -40 -40 20 Z", S.patch);
    if (S.ring) { circ(ctx, 100, -80, 26, "#f6f8fa"); }
    // eye and bill
    circ(ctx, 100, -80, 14, "#0b0f14"); circ(ctx, 96, -84, 5, "#fff");
    fill(ctx, "M 150 -40 C 210 -40 270 -20 300 0 C 260 16 200 20 150 14 Z", S.bill);
    if (S.patch) fill(ctx, "M 160 4 C 210 8 250 4 280 0 C 250 12 200 16 160 14 Z", "#f7a63a");
    ctx.restore();
    // near flipper
    ctx.save(); ctx.translate(150, -560); ctx.rotate(-0.12 - (o.flap ? Math.sin(t * 12 + 1) * 0.4 : 0) - (o.wing ?? 0)); fill(ctx, "M 0 0 C 50 120 60 260 30 360 C 0 260 -20 120 -20 0 Z", shadeC(S.back, -0.05)); ctx.restore();
    // egg or stone balanced at the feet
    if (o.egg) ell(ctx, 60, -60, 70, 90, 0, "#f3efe6");
    if (o.stone) ell(ctx, 60, -50, 90, 60, 0.1, "#8b9096");
    ctx.restore();
  };
  function shadeC(hex, k = -0.2) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const f = (c) => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k); return `rgb(${f(r)},${f(g)},${f(b)})`; }
  const P = FL.penguin;
  const icy = (ctx, t, hz = 760) => {   // a flat icy shore backdrop
    sky(ctx, "day", hz); cloud(ctx, 300 + t * 6, 160, 1.3); cloud(ctx, 1500 - t * 4, 110, 1);
    fill(ctx, `M -300 ${hz} L 300 ${hz - 140} L 520 ${hz - 60} L 820 ${hz - 220} L 1100 ${hz - 90} L 1400 ${hz - 180} L 1700 ${hz - 70} L 2220 ${hz - 160} L 2220 ${hz} Z`, "#dfeef6");
    fill(ctx, `M -300 ${hz} L 2220 ${hz} L 2220 1400 L -300 1400 Z`, "#eef6fa");
    ctx.fillStyle = "rgba(160,200,220,0.35)"; for (let i = 0; i < 12; i++) ctx.fillRect(-300, hz + 40 + i * 30, W + 600, 2);
  };
  const card = (ctx, x, y, w, h, col = "rgba(10,40,60,0.78)") => { ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x, y, w, h, 28); ctx.fill(); };
  const txt = (ctx, s, x, y, size = 48, col = "#fff", al = "center", wt = 700) => { ctx.font = `${wt} ${size}px Fredoka, sans-serif`; ctx.fillStyle = col; ctx.textAlign = al; ctx.fillText(s, x, y); ctx.textAlign = "start"; };

  // Male or female? Two identical penguins; question marks; then a feather goes to a DNA helix.
  RAW.sexing = (ctx, t, o) => {
    icy(ctx, t);
    P(ctx, t, { x: 700, y: 900, h: 520, sp: o.sp || "chinstrap", dir: 1, look: Math.sin(t) * 0.05 });
    P(ctx, t, { x: 1220, y: 900, h: 520, sp: o.sp || "chinstrap", dir: -1, look: Math.sin(t + 1) * 0.05 });
    const q = smooth(0.6, 1.2, t) * (1 - smooth(o.dna ?? 99, (o.dna ?? 99) + 0.5, t));
    if (q > 0) { ctx.save(); ctx.globalAlpha = q; txt(ctx, "?", 700, 330, 160, "#ff8a6b"); txt(ctx, "?", 1220, 330, 160, "#ff8a6b"); ctx.restore(); }
    if (o.dna !== undefined && t > o.dna) {
      const u = smooth(o.dna, o.dna + 1.2, t), fx = lerp(760, 960, u), fy = lerp(560, 300, u);
      ctx.save(); ctx.translate(fx, fy); ctx.rotate(-0.6 + u); fill(ctx, "M 0 -60 C 20 -30 22 30 0 60 C -22 30 -20 -30 0 -60 Z", "#3a4450"); line(ctx, [[0, -60], [0, 70]], 4, "#d0d6dc"); ctx.restore();
      const a = smooth(o.dna + 1.0, o.dna + 1.8, t);
      if (a > 0) { ctx.save(); ctx.globalAlpha = a; for (let i = 0; i < 24; i++) { const y = 120 + i * 18, ph = t * 2 + i * 0.5, x1 = 960 + Math.sin(ph) * 60, x2 = 960 - Math.sin(ph) * 60; line(ctx, [[x1, y], [x2, y]], 4, "rgba(255,255,255,0.5)"); circ(ctx, x1, y, 8, "#6be3a4"); circ(ctx, x2, y, 8, "#ff8fb8"); } ctx.restore(); }
    }
  };

  // If pairing were random: 40 couples, about half the same sex. What was seen: about a quarter.
  RAW.odds = (ctx, t, o) => {
    ctx.fillStyle = vgrad(ctx, 0, H, ["#2b9fd6", "#176fae", "#0c477c"]); ctx.fillRect(-300, -300, W + 600, H + 600); snow(ctx, t, 30, 4);
    const mode = t < (o.swap ?? 99) ? "random" : "real", r = rng(mode === "random" ? 3 : 8), n = 40, sameP = mode === "random" ? 0.5 : 0.28;
    const shown = Math.floor(smooth(0.3, 2.5, t - (mode === "real" ? (o.swap ?? 0) : 0)) * n); let same = 0;
    for (let i = 0; i < shown; i++) { const col = i % 10, row = Math.floor(i / 10), x = 330 + col * 140, y = 300 + row * 150, s = r() < sameP || (mode === "real" && i < 11 && false); if (s) same++;
      const c1 = "#6be3a4", c2 = s ? (r() < 0.8 ? "#6be3a4" : "#ff8fb8") : "#ff8fb8"; const ca = s && c2 === "#ff8fb8" ? "#ff8fb8" : c1;
      card(ctx, x - 58, y - 56, 116, 112, s ? "rgba(255,214,102,0.25)" : "rgba(255,255,255,0.12)"); circ(ctx, x - 24, y, 22, ca); circ(ctx, x + 24, y, 22, c2); }
    screen(ctx, () => { card(ctx, 640, 900, 640, 120); txt(ctx, (mode === "random" ? "IF RANDOM: " : "OBSERVED: ") + Math.round(100 * same / Math.max(1, shown)) + "% SAME-SEX", 960, 978, 50, "#ffd166"); });
  };

  // Levick's notebook: English lines, then Greek, a 1915 pamphlet stamped NOT FOR PUBLICATION, copies vanishing, a museum drawer in 2012.
  RAW.levick = (ctx, t, o) => {
    ctx.fillStyle = "#3b2a20"; ctx.fillRect(-300, -300, W + 600, H + 600);
    const stage = o.stage || "notebook";
    if (stage === "notebook") {
      ctx.save(); ctx.translate(960, 560); ctx.rotate(-0.03);
      ctx.fillStyle = "#efe4c8"; ctx.fillRect(-620, -420, 1240, 840); ctx.fillStyle = "#e3d5b3"; ctx.fillRect(-14, -420, 28, 840);
      ctx.strokeStyle = "rgba(90,120,150,0.35)"; ctx.lineWidth = 2; for (let y = -340; y < 400; y += 54) { ctx.beginPath(); ctx.moveTo(-580, y); ctx.lineTo(-40, y); ctx.moveTo(40, y); ctx.lineTo(580, y); ctx.stroke(); }
      txt(ctx, "Cape Adare, 1911", -310, -360, 40, "#3a2a1a", "center", 600);
      const en = ["Adelie penguins arrive", "in their thousands.", "Nests of small stones.", "Pairs call to each other", "and guard their nests."];
      const gr = ["Ταῦτα ὁρῶ ἀνήθη...", "οἱ νέοι ἄρρενες", "ἀλλήλους ἐπιβαίνουσι", "καὶ τὰς θηλείας", "καὶ τοὺς νεκρούς..."];
      const k1 = clamp(t / 3.0), k2 = clamp((t - (o.greek ?? 3.5)) / 3.0);
      en.forEach((s, i) => { const vis = clamp(k1 * en.length - i); if (vis > 0) { ctx.save(); ctx.beginPath(); ctx.rect(-580, -320 + i * 54 - 46, 540 * vis, 60); ctx.clip(); txt(ctx, s, -560, -320 + i * 54, 38, "#2c2014", "left", 600); ctx.restore(); } });
      gr.forEach((s, i) => { const vis = clamp(k2 * gr.length - i); if (vis > 0) { ctx.save(); ctx.beginPath(); ctx.rect(60, -320 + i * 54 - 46, 540 * vis, 60); ctx.clip(); txt(ctx, s, 70, -320 + i * 54, 38, "#5a1c14", "left", 600); ctx.restore(); } });
      ctx.restore();
    } else if (stage === "pamphlet") {
      const n = 12, gone = o.vanish !== undefined ? smooth(o.vanish, o.vanish + 2.5, t) : 0;
      for (let i = n - 1; i >= 0; i--) { const a = i === 0 ? 1 : 1 - clamp(gone * 1.3 - i * 0.05); if (a <= 0.01) continue; ctx.save(); ctx.globalAlpha = a; ctx.translate(960 + (i - n / 2) * 30 * (1 + gone), 540 + Math.sin(i) * 20); ctx.rotate((i - n / 2) * 0.03);
        ctx.fillStyle = i === 0 ? "#f3ead2" : "#e8dcbc"; ctx.fillRect(-300, -400, 600, 800); if (i === 0) { txt(ctx, "THE SEXUAL HABITS", 0, -260, 40, "#2c2014"); txt(ctx, "OF THE ADÉLIE PENGUIN", 0, -205, 40, "#2c2014"); txt(ctx, "G. Murray Levick, 1915", 0, -130, 32, "#4a3a2a", "center", 600); for (let j = 0; j < 8; j++) line(ctx, [[-220, -40 + j * 40], [200 - (j % 3) * 40, -40 + j * 40]], 6, "rgba(60,40,20,0.3)"); }
        ctx.restore(); }
      const st = smooth(o.stamp ?? 1.0, (o.stamp ?? 1.0) + 0.25, t);
      if (st > 0) { ctx.save(); ctx.translate(960, 640); ctx.rotate(-0.18); ctx.scale(lerp(1.6, 1, st), lerp(1.6, 1, st)); ctx.globalAlpha = st; ctx.lineWidth = 10; ctx.strokeStyle = "#c0392b"; ctx.strokeRect(-290, -60, 580, 120); txt(ctx, "NOT FOR PUBLICATION", 0, 22, 56, "#c0392b"); ctx.restore(); }
      if (o.count !== undefined && t > o.count) screen(ctx, () => { card(ctx, 1460, 80, 380, 130); txt(ctx, "~100 COPIES", 1650, 165, 56, "#ffd166"); });
    } else {   // museum drawer
      ctx.fillStyle = "#6b4a32"; ctx.fillRect(160, 160, 1600, 760); ctx.fillStyle = "#5a3d29"; ctx.fillRect(200, 200, 1520, 680);
      const op = smooth(0.4, 1.8, t); ctx.fillStyle = "#7a5638"; ctx.fillRect(200, 200 + 680 * (1 - op) * 0, 1520, 120);
      for (let i = 0; i < 5; i++) { ctx.fillStyle = "#efe6d0"; ctx.fillRect(280 + i * 290, 380, 230, 140); circ(ctx, 300 + i * 290, 450, 6, "#c0392b"); }
      const r = smooth(1.6, 2.8, t); ctx.save(); ctx.translate(960, lerp(700, 560, r)); ctx.rotate(lerp(0.05, -0.04, r)); ctx.fillStyle = "#f3ead2"; ctx.fillRect(-200, -260, 400, 520); txt(ctx, "NOT FOR PUBLICATION", 0, 120, 30, "#c0392b"); txt(ctx, "Levick, 1915", 0, -150, 30, "#2c2014", "center", 600); ctx.restore();
      if (o.year !== undefined && t > o.year) screen(ctx, () => { card(ctx, 760, 900, 400, 120); txt(ctx, "PUBLISHED 2012", 960, 980, 52, "#ffd166"); });
    }
  };

  // A colony of identical penguins; two of them find each other by voice.
  RAW.voice = (ctx, t, o) => {
    icy(ctx, t, 420);
    const r = rng(5), A = [560, 760], B = [1380, 700];
    const rows = [];
    for (let i = 0; i < 90; i++) rows.push([r() * 2100 - 90, 460 + r() * 600, i]);
    rows.sort((a, b) => a[1] - b[1]);
    for (const [x, y, i] of rows) P(ctx, t, { x, y, h: 120 + (y - 460) * 0.35, sp: o.sp || "king", dir: i % 2 ? 1 : -1, look: Math.sin(t + i) * 0.05 });
    ctx.fillStyle = "rgba(20,40,60,0.38)"; ctx.fillRect(-300, -300, W + 600, H + 600);
    for (const [x, y] of [A, B]) { ell(ctx, x, y + 6, 150, 34, 0, "rgba(255,214,102,0.55)"); P(ctx, t, { x, y, h: 300, sp: o.sp || "king", dir: x < 960 ? 1 : -1, look: -0.2 }); }
    for (let k = 0; k < 4; k++) { const u = (t * 0.6 + k / 4) % 1; for (const [x, y, d] of [[A[0] + 40, A[1] - 200, 1], [B[0] - 40, B[1] - 200, -1]]) { ctx.beginPath(); ctx.arc(x, y, 30 + u * 260, d > 0 ? -0.6 : Math.PI - 0.6, d > 0 ? 0.6 : Math.PI + 0.6); ctx.lineWidth = 7; ctx.strokeStyle = `rgba(255,214,102,${0.9 * (1 - u)})`; ctx.stroke(); } }
    if (o.link !== undefined && t > o.link) { const a = smooth(o.link, o.link + 0.8, t); ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([20, 14]); ctx.lineWidth = 8; ctx.strokeStyle = "#ffd166"; ctx.beginPath(); ctx.moveTo(A[0] + 60, A[1] - 220); ctx.quadraticCurveTo(960, 300, B[0] - 60, B[1] - 220); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
  };

  // Shift work at the nest: one parent sits and burns fat while the other feeds at sea; then they swap.
  RAW.shifts = (ctx, t, o) => {
    icy(ctx, t, 600);
    // sea at right, the hunting parent swims there
    fill(ctx, "M 1300 600 L 2220 600 L 2220 1400 L 1150 1400 C 1250 1100 1260 800 1300 600 Z", "#3fa9d6");
    const per = o.period ?? 8, u = (t % per) / per, swap = Math.floor(t / per) % 2;
    const fat = 1 - (u < 0.85 ? u / 0.85 : 1) * 0.7;
    P(ctx, t, { x: 700, y: 900, h: 460, sp: o.sp || "gentoo", dir: 1, egg: true, look: Math.sin(t * 0.7) * 0.05 });
    // swimming partner (a dark shape with white belly) and fish
    const sx = 1500 + Math.sin(t * 1.4) * 220, sy = 820 + Math.cos(t * 1.1) * 80;
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(Math.cos(t * 1.4) * 0.3); ell(ctx, 0, 0, 90, 34, 0, "#2a3440"); ell(ctx, 6, 12, 70, 18, 0, "#f6f8fa"); fill(ctx, "M 80 -10 L 120 0 L 80 8 Z", "#f26b2a"); ctx.restore();
    for (let i = 0; i < 8; i++) { const fx = 1350 + ((i * 140 + t * 60) % 800), fy = 720 + (i % 4) * 70; ell(ctx, fx, fy, 22, 8, 0, "#cfe6ef"); }
    screen(ctx, () => { card(ctx, 380, 120, 640, 150); txt(ctx, o.label || "ON THE NEST: NO FOOD", 700, 180, 42, "#bfe9f7"); ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.beginPath(); ctx.roundRect(420, 205, 560, 44, 22); ctx.fill(); ctx.fillStyle = fat > 0.55 ? "#6be3a4" : (fat > 0.4 ? "#ffd166" : "#ff7b6b"); ctx.beginPath(); ctx.roundRect(420, 205, Math.max(44, 560 * fat), 44, 22); ctx.fill(); });
  };

  // Emperor in winter: the egg on his feet under a fold of skin, a blizzard, a day counter.
  RAW.winter = (ctx, t, o) => {
    ctx.fillStyle = vgrad(ctx, 0, H, ["#1b2a44", "#2c4466", "#6c8bb0"]); ctx.fillRect(-300, -300, W + 600, H + 600);
    fill(ctx, "M -300 820 L 2220 820 L 2220 1400 L -300 1400 Z", "#dfe9f2");
    for (let i = 0; i < 6; i++) P(ctx, t, { x: 200 + i * 300, y: 820, h: 330, sp: "emperor", dir: i % 2 ? 1 : -1, lean: 0.03 });
    P(ctx, t, { x: 960, y: 980, h: 600, sp: "emperor", dir: 1, egg: true, lean: 0.02 });
    const r = rng(9); ctx.fillStyle = "rgba(255,255,255,0.8)"; for (let i = 0; i < 260; i++) { const x = ((r() * 2400 + t * (500 + r() * 300)) % 2400) - 240, y = ((r() * 1300 + t * (120 + r() * 80)) % 1300) - 110; ctx.beginPath(); ctx.arc(x, y, 2 + r() * 3, 0, TAU); ctx.fill(); }
    screen(ctx, () => { card(ctx, 70, 70, 420, 140); txt(ctx, "DAYS WITHOUT FOOD", 280, 120, 34, "#bfe9f7"); txt(ctx, String(Math.floor(lerp(1, 65, smooth(0.5, (o.d ?? 6) - 0.5, t)))), 280, 192, 64, "#ffffff"); });
  };

  // Sex ratio: a scale tipped by more males; the extra males pair with each other.
  RAW.ratio = (ctx, t, o) => {
    icy(ctx, t, 520);
    const males = 12, females = 8;
    for (let i = 0; i < males; i++) { const pairWith = i < females, x = 260 + i * 120, y = 760 + (i % 2) * 40; const lift = smooth(1.5 + i * 0.05, 2.2 + i * 0.05, t);
      P(ctx, t, { x: pairWith ? lerp(x, 260 + i * 120, lift) : x, y, h: 200, sp: o.sp || "king", dir: 1, look: Math.sin(t + i) * 0.04 });
      if (pairWith) P(ctx, t, { x: x + 50, y: y + lerp(260, 0, lift), h: 190, sp: o.sp || "king", dir: -1 }); }
    const extra = smooth(3.2, 4.0, t); if (extra > 0) { ctx.save(); ctx.globalAlpha = extra; ctx.lineWidth = 8; ctx.strokeStyle = "#ffd166"; ctx.beginPath(); ctx.roundRect(260 + females * 120 - 70, 520, (males - females) * 120 + 40, 330, 30); ctx.stroke(); ctx.restore(); }
    screen(ctx, () => { card(ctx, 1460, 80, 400, 170); txt(ctx, "♂ " + males, 1560, 180, 64, "#6be3a4"); txt(ctx, "♀ " + females, 1760, 180, 64, "#ff8fb8"); });
  };

  // A donut chart with a percentage (Laysan albatross female-female pairs).
  RAW.donut = (ctx, t, o) => {
    ctx.fillStyle = vgrad(ctx, 0, H, ["#2b9fd6", "#176fae", "#0c477c"]); ctx.fillRect(-300, -300, W + 600, H + 600); snow(ctx, t, 30, 8);
    const v = o.v ?? 0.31, u = smooth(o.t0 ?? 0.4, (o.t0 ?? 0.4) + 1.6, t), cx = 960, cy = 520, R = 280;
    ctx.lineWidth = 110; ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    ctx.strokeStyle = o.col || "#ff8fb8"; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + TAU * v * u); ctx.stroke();
    txt(ctx, Math.round(100 * v * u) + "%", cx, cy + 40, 120, "#fff");
    screen(ctx, () => { if (o.label) { card(ctx, 560, 900, 800, 110); txt(ctx, o.label, 960, 972, 46, "#ffd166"); } });
  };

  // Species row: six penguin species drawn side by side, each popping in.
  RAW.species = (ctx, t, o) => {
    icy(ctx, t, 640);
    const L = o.list || ["chinstrap", "humboldt", "gentoo", "king", "adelie", "humboldt"], names = o.names || ["CHINSTRAP", "HUMBOLDT", "GENTOO", "KING", "ADÉLIE", "AFRICAN"];
    L.forEach((sp, i) => { const a = smooth(0.2 + i * 0.9, 0.6 + i * 0.9, t), x = 210 + i * 300; if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; P(ctx, t, { x, y: 900 - (1 - a) * 40, h: sp === "king" ? 400 : 320, sp, dir: 1, look: Math.sin(t + i) * 0.05 }); txt(ctx, names[i], x, 990, 40, "#173a55"); ctx.restore(); });
  };

  // A big counter for the number of species with recorded same-sex behaviour.
  RAW.counter = (ctx, t, o) => {
    ctx.fillStyle = vgrad(ctx, 0, H, ["#2b9fd6", "#176fae", "#0c477c"]); ctx.fillRect(-300, -300, W + 600, H + 600); snow(ctx, t, 40, 3);
    const v = Math.floor(lerp(0, o.n ?? 1500, smooth(0.3, 2.6, t)));
    txt(ctx, v.toLocaleString("en-US") + (v >= (o.n ?? 1500) ? "+" : ""), 960, 560, 230, "#fff");
    txt(ctx, o.label || "KINDS OF ANIMALS", 960, 680, 60, "#ffd166");
    const sp = ["chinstrap", "gentoo", "king", "adelie", "humboldt"]; sp.forEach((s, i) => { const a = smooth(1.5 + i * 0.25, 2 + i * 0.25, t); if (a > 0) { ctx.save(); ctx.globalAlpha = a; P(ctx, t, { x: 560 + i * 200, y: 1010, h: 200, sp: s, dir: 1 }); ctx.restore(); } });
  };

  // Two penguins on a pebble nest, sitting on a stone, then an egg, then a chick (Roy and Silo style).
  RAW.nest = (ctx, t, o) => {
    icy(ctx, t, 600);
    const r = rng(2); for (let i = 0; i < 60; i++) { const a = r() * TAU, rr = 120 + r() * 120; ell(ctx, 960 + Math.cos(a) * rr * 1.6, 900 + Math.sin(a) * rr * 0.4, 22, 14, a, ["#8b9096", "#9aa0a6", "#757b82"][i % 3]); }
    const sp = o.sp || "chinstrap", sit = o.chick ? false : true;
    P(ctx, t, { x: 760, y: 900, h: 480, sp, dir: 1, look: Math.sin(t * 0.8) * 0.06 + (o.twine ? Math.sin(t * 2) * 0.2 : 0) });
    P(ctx, t, { x: 1160, y: 900, h: 470, sp, dir: -1, look: Math.sin(t * 0.8 + 1) * 0.06 + (o.twine ? Math.sin(t * 2 + 1) * 0.2 : 0) });
    if (o.item === "stone") ell(ctx, 960, 880, 70, 46, 0.1, "#8b9096");
    if (o.item === "egg") { const sw = o.swap !== undefined ? smooth(o.swap, o.swap + 0.6, t) : 0; ell(ctx, 960, 860 + sw * 0, 52, 66, 0, "#f3efe6"); }
    if (o.item === "chick") { const g = smooth(0.3, 1.2, t); ctx.save(); ctx.translate(960, 900); ctx.scale(g, g); ell(ctx, 0, -60, 70, 80, 0, "#9aa3ab"); circ(ctx, 0, -150, 46, "#9aa3ab"); circ(ctx, 18, -160, 8, "#111"); fill(ctx, "M 40 -150 L 70 -144 L 40 -138 Z", "#333"); ctx.restore(); }
    if (o.hearts !== undefined && t > o.hearts) for (let i = 0; i < 4; i++) { const u = ((t - o.hearts) * 0.5 + i / 4) % 1; ctx.save(); ctx.globalAlpha = 1 - u; ctx.translate(960 + Math.sin(i * 2 + t) * 60, 420 - u * 200); ctx.scale(1.2, 1.2); fill(ctx, "M 0 10 C -30 -20 -20 -40 0 -24 C 20 -40 30 -20 0 10 Z", "#ff8fb8"); ctx.restore(); }
  };

  // End card backdrop: an icy shore with a line of penguins along the bottom.
  RAW.endpeng = (ctx, t, o) => {
    icy(ctx, t, 640);
    const L = ["chinstrap", "gentoo", "king", "adelie", "humboldt", "chinstrap", "gentoo"];
    L.forEach((sp, i) => P(ctx, t, { x: 180 + i * 260, y: 1020, h: sp === "king" ? 300 : 240, sp, dir: i % 2 ? -1 : 1, look: Math.sin(t + i) * 0.06, waddle: 0 }));
  };

  FL.wrapScenes();
})();
