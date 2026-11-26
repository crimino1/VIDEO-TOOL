// "You vs 5 Apex Predators": one 1080x1920 overlay canvas drawn from the film time T.
// Calm palette: off-white ink, dark glass panels with a 1px border, one muted accent per verdict. No glow, no bounce.
const HUD = {};
(() => {
  const VW = 1080, VH = 1920, TAU = Math.PI * 2;
  const INK = "#F4F1EA", MUTE = "rgba(244,241,234,0.62)", PANEL = "rgba(22,24,28,0.80)", EDGE = "rgba(244,241,234,0.16)";
  const RED = "#D7835F", OCHRE = "#D9A441", SAGE = "#8DB59A";
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const sm = (a, b, t) => { const k = clamp((t - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
  const win = (t, a, b, f = 0.25) => sm(a, a + f, t) * (1 - sm(b - f, b, t));   // fade in at a, out at b
  const F = (w, s, fam = "Inter") => `${w} ${s}px "${fam}", sans-serif`;
  const IMG = {}; for (const k of ["orca", "diver"]) { IMG[k] = new Image(); IMG[k].src = `assets/gen/hud_${k}.png`; }

  function panel(ctx, x, y, w, h, r = 28, a = 1) {
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = PANEL; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
    ctx.strokeStyle = EDGE; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  }
  function text(ctx, s, x, y, font, col = INK, align = "left", track = 0) {
    ctx.font = font; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = "alphabetic";
    if (track) { ctx.letterSpacing = `${track}px`; }
    ctx.fillText(s, x, y); ctx.letterSpacing = "0px";
  }
  function mono(ctx, str, cx, y, size, col, cell = 0.62) {
    ctx.font = F(700, size); ctx.fillStyle = col; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    const cw = size * cell, nw = (c) => (c === ":" || c === ".") ? cw * 0.45 : cw;
    let w = 0; for (const c of str) w += nw(c);
    let x = cx - w / 2; for (const c of str) { const k = nw(c); ctx.fillText(c, x + k / 2, y); x += k; }
  }
  const shadowed = (ctx, f) => { ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = 18; ctx.shadowOffsetY = 3; f(); ctx.restore(); };

  // ---------------- the five rounds ----------------
  const R = [
    { name: "BOX JELLYFISH", a: 5.06, v: 11.30, b: 12.58, sec: 180, say: "A FEW MINUTES", col: RED },
    { name: "POLAR BEAR", a: 12.58, v: 17.56, b: 18.68, sec: 60, say: "ABOUT 1 MINUTE", col: RED },
    { name: "SALTWATER CROCODILE", a: 18.68, v: 26.56, b: 27.58, sec: 2, say: "2 SECONDS", col: RED },
    { name: "TIGER", a: 27.58, v: 31.26, b: 32.52, sec: 0, say: "0 SECONDS", col: RED },
    { name: "ORCA", a: 32.52, v: 42.68, b: 45.40, sec: -1, say: "YOU LIVE", col: SAGE },
  ];
  const clockStr = (s) => { const m = Math.floor(s / 60), r = s - m * 60; return `${String(m).padStart(2, "0")}:${r.toFixed(2).padStart(5, "0")}`; };

  function clock(ctx, T) {
    const i = R.findIndex(r => T >= r.a && T < r.b); if (i < 0) return;
    const r = R[i];
    const al = i === 0 ? sm(r.a, r.a + 0.3, T) : 1, out = i === R.length - 1 ? 1 - sm(r.b - 0.3, r.b, T) : 1;
    ctx.save(); ctx.globalAlpha = al * out;
    const x = 110, y = 150, w = 860, h = 262;
    panel(ctx, x, y, w, h, 30);
    // round pips + name
    for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(x + 46 + k * 26, y + 52, 7, 0, TAU); ctx.fillStyle = k < i ? "rgba(244,241,234,0.35)" : k === i ? INK : "rgba(244,241,234,0.14)"; ctx.fill(); }
    const nameIn = sm(r.a, r.a + 0.35, T);
    ctx.save(); ctx.globalAlpha *= nameIn; text(ctx, r.name, x + 190, y + 62, F(700, 34), INK, "left", 2); ctx.restore();
    text(ctx, "SURVIVAL TIME", VW / 2, y + 110, F(600, 22), MUTE, "center", 4);
    // readout
    const cy = y + 214;
    if (T < r.v) {
      let s;
      if (r.sec < 0) s = Math.max(0, (T - r.a - 0.3)) * 41.7;                                     // orca: keeps running
      else s = r.sec * Math.pow(clamp((T - r.a - 0.3) / (r.v - r.a - 0.3), 0, 1), r.sec > 30 ? 1.6 : 1);
      const blink = r.sec === 0 && Math.floor(T * 3) % 2 === 0 ? 0.45 : 1;
      ctx.save(); ctx.globalAlpha *= blink; mono(ctx, clockStr(s), VW / 2, cy, 100, INK); ctx.restore();
    } else {
      const k = sm(r.v, r.v + 0.28, T);
      ctx.save(); ctx.globalAlpha *= k; ctx.translate(0, (1 - k) * 14);
      text(ctx, r.say, VW / 2, cy - 6, F(800, r.say.length > 12 ? 82 : 96), r.col, "center", 1);
      ctx.fillStyle = r.col; const uw = lerp(0, 420, sm(r.v + 0.1, r.v + 0.5, T)); ctx.fillRect(VW / 2 - uw / 2, cy + 18, uw, 4);
      ctx.restore();
    }
    ctx.restore();
  }

  // ---------------- hook title ----------------
  function title(ctx, T) {
    const a = win(T, 0.15, 4.95, 0.35); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    shadowed(ctx, () => {
      text(ctx, "YOU", VW / 2, 1160, F(800, 150), INK, "center", 4);
      text(ctx, "vs", VW / 2, 1250, F(500, 60), MUTE, "center", 2);
      text(ctx, "5 APEX PREDATORS", VW / 2, 1360, F(800, 92), INK, "center", 2);
    });
    const k = sm(3.2, 3.6, T);
    ctx.save(); ctx.globalAlpha *= k; ctx.translate(0, (1 - k) * 12);
    panel(ctx, 210, 1420, 660, 96, 48);
    text(ctx, "ONLY ONE LETS YOU LIVE", VW / 2, 1482, F(700, 40), INK, "center", 2);
    ctx.restore();
    ctx.restore();
  }

  // ---------------- 1. heart rhythm ----------------
  function ecg(ctx, T) {
    const a = win(T, 9.14, 12.5, 0.3); if (a <= 0) return;
    const x0 = 90, y0 = 1270, w = 820, h = 250, bad = sm(10.3, 10.7, T);
    ctx.save(); ctx.globalAlpha = a; panel(ctx, x0, y0, w, h, 26);
    text(ctx, "HEART RHYTHM", x0 + 34, y0 + 52, F(600, 26), MUTE, "left", 3);
    text(ctx, bad > 0.5 ? "IRREGULAR" : "72 BPM", x0 + w - 34, y0 + 52, F(700, 30, "JetBrains Mono"), bad > 0.5 ? RED : INK, "right");
    // trace: a normal PQRST beat that turns fast and irregular after "heart"
    const base = y0 + 170, sweep = (T - 9.14) * 420;
    ctx.save(); ctx.beginPath(); ctx.rect(x0 + 20, y0 + 70, w - 40, h - 80); ctx.clip();
    ctx.beginPath();
    for (let px = 0; px <= w - 40; px += 2) {
      const X = x0 + 20 + px, u = (sweep - (w - 40) + px);   // trace time in px
      const tt = 9.14 + u / 420, b2 = sm(10.3, 10.7, tt);
      const per = 230, ph = ((u % per) + per) % per;
      let n = 0;   // normal beat shape
      n += -14 * Math.exp(-(((ph - 40) / 10) ** 2));
      n += 8 * Math.exp(-(((ph - 70) / 5) ** 2)) - 92 * Math.exp(-(((ph - 80) / 4) ** 2)) + 26 * Math.exp(-(((ph - 89) / 5) ** 2));
      n += -22 * Math.exp(-(((ph - 140) / 16) ** 2));
      const ir = 26 * Math.sin(u * 0.11) + 18 * Math.sin(u * 0.27 + 1.3) + 12 * Math.sin(u * 0.53 + 0.4);   // fibrillating line
      const Y = base + lerp(n, ir, b2);
      if (u < 0) continue;
      if (px === 0 || u - 2 < 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
    }
    ctx.lineWidth = 4; ctx.lineJoin = "round"; ctx.strokeStyle = bad > 0.5 ? RED : INK; ctx.stroke();
    ctx.restore(); ctx.restore();
  }

  // ---------------- 2. one mile of scent ----------------
  function smell(ctx, T) {
    const a = win(T, 13.4, 15.12, 0.25); if (a <= 0) return;
    const you = [540, 1560], bear = [560, 560], k = sm(13.5, 14.4, T);
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = "rgba(10,14,18,0.25)"; ctx.fillRect(0, 0, VW, VH);
    // dashed range line drawing up from you to the bear
    const ey = lerp(you[1], bear[1], k);
    ctx.setLineDash([16, 14]); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(you[0], you[1] - 40); ctx.lineTo(lerp(you[0], bear[0], k), ey + 40); ctx.stroke(); ctx.setLineDash([]);
    // scent arcs drifting toward the bear
    for (let i = 0; i < 6; i++) {
      const p = ((T - 13.4) * 0.9 + i / 6) % 1, y = lerp(you[1] - 60, bear[1] + 60, p), r = 60 + p * 160;
      ctx.beginPath(); ctx.arc(lerp(you[0], bear[0], p), y + r, r, -Math.PI * 0.75, -Math.PI * 0.25); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(244,241,234,${0.55 * Math.sin(p * Math.PI) * k})`; ctx.stroke();
    }
    const marker = (x, y, label, col, aa) => { ctx.save(); ctx.globalAlpha *= aa; ctx.beginPath(); ctx.arc(x, y, 18, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = "#16181c"; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 34 + 6 * Math.sin(T * 4), 0, TAU); ctx.lineWidth = 2; ctx.strokeStyle = col; ctx.globalAlpha *= 0.6; ctx.stroke(); ctx.restore();
      panel(ctx, x - 90, y + 50, 180, 64, 32, aa); text(ctx, label, x, y + 93, F(700, 30), INK, "center", 2); };
    marker(...you, "YOU", INK, sm(13.4, 13.6, T));
    marker(...bear, "BEAR", RED, sm(14.2, 14.5, T));
    const lk = sm(14.25, 14.6, T); panel(ctx, 600, 980, 330, 120, 26, lk);
    ctx.save(); ctx.globalAlpha *= lk; text(ctx, "1 MILE", 765, 1042, F(800, 50), INK, "center", 1); text(ctx, "1.6 KM", 765, 1082, F(600, 26), MUTE, "center", 3); ctx.restore();
    ctx.restore();
  }

  // ---------------- 3. can't outrun, can't outswim ----------------
  function strike(ctx, T) {
    const a = win(T, 15.12, 17.5, 0.25); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    const rows = [["OUTRUN IT", 15.16, 15.88], ["OUTSWIM IT", 16.2, 16.94]];
    rows.forEach(([s, t0, t1], i) => {
      const k = sm(t0, t0 + 0.25, T); if (k <= 0) return;
      const y = 1300 + i * 150; ctx.save(); ctx.globalAlpha *= k; ctx.translate(0, (1 - k) * 12);
      panel(ctx, 190, y, 700, 120, 60);
      text(ctx, s, 540, y + 80, F(800, 58), INK, "center", 2);
      const sw = sm(t1, t1 + 0.25, T); ctx.fillStyle = RED; ctx.fillRect(250, y + 58, 580 * sw, 7);
      ctx.restore();
    });
    ctx.restore();
  }

  // ---------------- 4. bite force ----------------
  function bite(ctx, T) {
    const a = win(T, 22.5, 24.36, 0.25); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    const x0 = 90, y0 = 1250, w = 820, h = 330; panel(ctx, x0, y0, w, h, 28);
    text(ctx, "BITE FORCE", x0 + 36, y0 + 58, F(600, 26), MUTE, "left", 3);
    const k = sm(22.7, 23.7, T), max = 3700, bw = w - 72;
    const bar = (y, label, v, col, kk) => {
      text(ctx, label, x0 + 36, y, F(700, 30), INK);
      ctx.fillStyle = "rgba(244,241,234,0.12)"; ctx.beginPath(); ctx.roundRect(x0 + 36, y + 18, bw, 34, 17); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x0 + 36, y + 18, Math.max(34, bw * v / max * kk), 34, 17); ctx.fill();
      text(ctx, `${Math.round(v * kk).toLocaleString("en-US")} LB`, x0 + w - 36, y, F(700, 30, "JetBrains Mono"), INK, "right");
    };
    bar(y0 + 120, "YOU", 160, "rgba(244,241,234,0.7)", sm(22.6, 22.9, T));
    bar(y0 + 220, "SALTWATER CROCODILE", 3700, OCHRE, k);
    const sk = sm(23.4, 23.7, T); ctx.save(); ctx.globalAlpha *= sk; text(ctx, "STRONGEST BITE EVER MEASURED", x0 + 36, y0 + h - 22, F(600, 24), OCHRE, "left", 2); ctx.restore();
    ctx.restore();
  }

  // ---------------- 5. blind spot ----------------
  function blind(ctx, T) {
    const a = win(T, 28.7, 31.2, 0.3); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = "rgba(10,12,14,0.42)"; ctx.fillRect(0, 0, VW, VH);
    const cx = 540, cy = 1080, R1 = 430;
    // field of view: about 200 degrees ahead (up); the wedge behind is blind
    const fov = 200 * Math.PI / 180, up = -Math.PI / 2, k = sm(28.8, 29.2, T);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R1 * k, up - fov / 2, up + fov / 2); ctx.closePath();
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R1); g.addColorStop(0, "rgba(244,241,234,0.30)"); g.addColorStop(1, "rgba(244,241,234,0.04)"); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = "rgba(244,241,234,0.45)"; ctx.stroke();
    const bk = sm(29.1, 29.5, T);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R1 * bk, up + fov / 2, up - fov / 2 + TAU); ctx.closePath(); ctx.fillStyle = `rgba(215,131,95,${0.32 * bk})`; ctx.fill();
    ctx.setLineDash([12, 10]); ctx.strokeStyle = `rgba(215,131,95,${0.9 * bk})`; ctx.stroke(); ctx.setLineDash([]);
    // you, seen from above
    ctx.beginPath(); ctx.arc(cx, cy, 34, 0, TAU); ctx.fillStyle = INK; ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - 12, cy - 30); ctx.lineTo(cx, cy - 48); ctx.lineTo(cx + 12, cy - 30); ctx.fillStyle = INK; ctx.fill();
    // the tiger closes in from behind, inside the blind wedge
    const tk = sm(29.3, 31.0, T), ty = lerp(cy + 600, cy + 90, tk);
    ctx.beginPath(); ctx.arc(cx, ty, 22, 0, TAU); ctx.fillStyle = RED; ctx.fill();
    for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(cx, ty + i * 46, 6, 0, TAU); ctx.fillStyle = `rgba(215,131,95,${0.5 / i})`; ctx.fill(); }
    panel(ctx, cx - 150, cy - R1 - 110, 300, 70, 35, k); ctx.save(); ctx.globalAlpha *= k; text(ctx, "WHAT YOU SEE", cx, cy - R1 - 64, F(700, 28), INK, "center", 3); ctx.restore();
    panel(ctx, cx + 70, cy + 230, 300, 70, 35, bk); ctx.save(); ctx.globalAlpha *= bk; text(ctx, "BLIND SPOT", cx + 220, cy + 276, F(700, 28), RED, "center", 3); ctx.restore();
    ctx.restore();
  }

  // ---------------- 6. six tons ----------------
  function size(ctx, T) {
    const a = win(T, 33.36, 34.36, 0.18); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, "rgba(14,38,56,0.86)"); g.addColorStop(1, "rgba(6,16,26,0.94)"); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    const k = sm(33.4, 33.9, T);
    const o = IMG.orca, d = IMG.diver;
    if (o.complete && o.naturalWidth) { const w = 980, h = w * o.naturalHeight / o.naturalWidth; ctx.drawImage(o, 50 + (1 - k) * 60, 930 - h / 2, w, h); }
    if (d.complete && d.naturalWidth) { const w = 210, h = w * d.naturalHeight / d.naturalWidth; ctx.drawImage(d, 430, 1330, w, h); }
    // length bars: orca ~8 m, person ~1.8 m (same scale)
    const ow = 900, pw = ow * 1.8 / 8;
    ctx.fillStyle = INK; ctx.fillRect(90, 1190, ow * k, 3); ctx.fillRect(90, 1180, 3, 23); ctx.fillRect(90 + ow * k, 1180, 3, 23);
    text(ctx, "ABOUT 8 M", 90, 1245, F(700, 30), MUTE, "left", 2);
    ctx.fillRect(430, 1560, pw * k, 3); text(ctx, "1.8 M", 430, 1610, F(700, 28), MUTE, "left", 2);
    shadowed(ctx, () => text(ctx, "6 TONS", VW / 2, 560, F(800, 150), INK, "center", 3));
    text(ctx, "ABOUT 75 PEOPLE", VW / 2, 630, F(600, 34), MUTE, "center", 4);
    ctx.restore();
  }

  // ---------------- 7. what it kills ----------------
  function tally(ctx, T) {
    const a = win(T, 34.5, 37.62, 0.25); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    [["GREAT WHITE SHARKS", 34.86], ["BLUE WHALES", 36.62]].forEach(([s, t0], i) => {
      const k = sm(t0, t0 + 0.25, T); if (k <= 0) return;
      const y = 1330 + i * 130; ctx.save(); ctx.globalAlpha *= k; ctx.translate((1 - k) * -20, 0);
      panel(ctx, 90, y, 760, 104, 52);
      ctx.beginPath(); ctx.moveTo(140, y + 54); ctx.lineTo(160, y + 74); ctx.lineTo(196, y + 34); ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = RED; ctx.stroke();
      text(ctx, s, 226, y + 68, F(800, 44), INK, "left", 1);
      ctx.restore();
    });
    ctx.restore();
  }

  // ---------------- 8. zero recorded kills ----------------
  function zero(ctx, T) {
    const a = win(T, 38.0, 41.66, 0.3); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    const k = sm(38.1, 38.5, T);
    panel(ctx, 140, 1150, 800, 470, 34);
    shadowed(ctx, () => text(ctx, "0", VW / 2, 1440, F(800, 260), INK, "center"));
    text(ctx, "WILD ORCAS · RECORDED", VW / 2, 1522, F(600, 30), MUTE, "center", 3);
    text(ctx, "HUMAN DEATHS", VW / 2, 1572, F(800, 40), INK, "center", 3);
    ctx.restore();
  }

  // ---------------- end: which one ----------------
  const NAMES = ["BOX JELLYFISH", "POLAR BEAR", "SALTWATER CROC", "TIGER", "ORCA"];
  function ending(ctx, T) {
    if (T < 45.4) return;
    const k = sm(45.45, 45.75, T);
    ctx.save();
    NAMES.forEach((n, i) => {
      const y = i * 384, kk = sm(45.45 + i * 0.08, 45.75 + i * 0.08, T);
      ctx.fillStyle = "rgba(10,12,14,0.35)"; ctx.fillRect(0, y + 384 - 2, VW, 4);
      ctx.save(); ctx.globalAlpha = kk; ctx.translate((1 - kk) * -24, 0);
      shadowed(ctx, () => { text(ctx, String(i + 1), 60, y + 80, F(800, 48), i === 4 ? SAGE : RED); text(ctx, n, 112, y + 80, F(800, 42), INK, "left", 2); });
      ctx.restore();
    });
    ctx.globalAlpha = k; panel(ctx, 140, 880, 800, 200, 40);
    text(ctx, "WHICH ONE", VW / 2, 965, F(800, 64), INK, "center", 2);
    text(ctx, "WOULD YOU FIGHT?", VW / 2, 1042, F(800, 64), INK, "center", 2);
    ctx.restore();
  }

  HUD.draw = (ctx, T) => {
    ctx.clearRect(0, 0, VW, VH);
    title(ctx, T); ecg(ctx, T); smell(ctx, T); strike(ctx, T); bite(ctx, T); blind(ctx, T); size(ctx, T); tally(ctx, T); zero(ctx, T);
    clock(ctx, T); ending(ctx, T);
  };
})();
