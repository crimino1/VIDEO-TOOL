/* EP2 reference scene (quality bar for every other scene): a full illustrated environment, 3 depth layers,
   light sources with glow, particles, a moving camera, characters that move. */
(function () {
  const { K, C } = PX;
  const R = PX.rect;

  // ---- shared pieces other scene files may reuse via PX.core ----
  const core = (PX.core = {});
  // city skyline seen through a window (lit windows twinkle)
  core.skyline = (g, x, y, w, h, t, seed) => {
    const r = PX.rnd(seed || 3);
    PX.vgrad(g, x, y, w, h, "1a1f4a", "3b2a5c", 7);
    for (let i = 0; i < 40; i++) { const sx = x + r() * w, sy = y + r() * h * 0.5; g.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + i)); R(g, sx, sy, 1, 1, "#fff"); }
    g.globalAlpha = 1;
    PX.circle(g, x + w * 0.78, y + h * 0.22, 9, "#f4f1d0"); PX.circle(g, x + w * 0.78 + 3, y + h * 0.22 - 2, 8, "#e4e0b8");
    let bx = x - 4;
    while (bx < x + w) {
      const bw = 12 + Math.floor(r() * 22), bh = h * (0.25 + r() * 0.5), top = y + h - bh;
      R(g, bx, top, bw, bh, r() < 0.5 ? "#141833" : "#191d3d");
      for (let wy = top + 4; wy < y + h - 3; wy += 5) for (let wx = bx + 2; wx < bx + bw - 2; wx += 4) {
        const on = r(); if (on < 0.3) R(g, wx, wy, 2, 2, (Math.sin(t * 0.5 + wx * 0.3 + wy) > -0.8) ? "#f7c948" : "#3a3a20"); }
      bx += bw + 1;
    }
  };
  // code editor screen content
  core.editor = (g, x, y, w, h, t, o) => {
    o = o || {};
    R(g, x, y, w, h, "#0d1117"); R(g, x, y, w, 9, "#161b22");
    R(g, x + 3, y + 2, 34, 7, "#0d1117"); PX.text(g, o.file || "main.py", x + 5, y + 1, { font: "v", size: 9, col: "#c9d1d9" });
    R(g, x, y + 9, 14, h - 9, "#0d1117");
    const lines = o.lines || [], lh = 7, maxL = Math.floor((h - 12) / lh);
    const shown = Math.max(1, Math.min(maxL, lines.length + 1));
    for (let i = 0; i < shown; i++) PX.text(g, String(i + 1), x + 11, y + 11 + i * lh, { font: "v", size: 8, col: "#484f58", align: "right" });
    let cx = x + 18, cy = y + 11;
    lines.forEach((ln, i) => {
      let lx = x + 18 + (ln.ind || 0) * 6;
      for (const [txt, col] of ln.seg) { lx += PX.text(g, txt, lx, y + 11 + i * lh, { font: "v", size: 8, col }); }
      cx = lx; cy = y + 11 + i * lh;
    });
    if (lines.length === 0) { cx = x + 18; cy = y + 11; }
    if (PX.blink(t, 1.05, 0.55) || o.solid) R(g, Math.round(cx + 1), cy + 1, 2, 6, "#e6edf3");
  };
  // code lines typed progressively: returns line objects visible at time t
  const CODE = [
    { seg: [["import", "#ff7b72"], [" os", "#c9d1d9"]] },
    { seg: [["", "#000"]] },
    { seg: [["def", "#ff7b72"], [" tidy", "#d2a8ff"], ["(path):", "#c9d1d9"]] },
    { ind: 1, seg: [["for", "#ff7b72"], [" f ", "#c9d1d9"], ["in", "#ff7b72"], [" os.listdir(path):", "#c9d1d9"]] },
    { ind: 2, seg: [["ext", "#c9d1d9"], [" = ", "#ff7b72"], ["f.split(", "#c9d1d9"], ["'.'", "#a5d6ff"], [")[-1]", "#c9d1d9"]] },
    { ind: 2, seg: [["move", "#d2a8ff"], ["(f, ext)", "#c9d1d9"]] },
  ];
  core.typed = (t, t0, cps) => {
    if (t < t0) return [];
    let n = Math.floor((t - t0) * (cps || 14)), out = [];
    for (const ln of CODE) {
      const segs = []; let used = 0;
      for (const [txt, col] of ln.seg) { if (n <= 0) break; const k = Math.min(txt.length, n); segs.push([txt.slice(0, k), col]); n -= k; used += k; }
      out.push({ ind: ln.ind, seg: segs }); n -= 1; if (n < 0) break;
    }
    return out;
  };
  // seated person seen from behind (hoodie), native resolution (~100 px tall), anchor = shoulder line centre
  core.coder = (g, x, y, t, o) => {
    o = o || {};
    const hood = o.col || "#2f4a86", hl = o.hl || "#3f5fa3", dark = o.dark || "#22356a", hair = o.hair || "#1a120c", hairHl = "#3a2a1c", skin = o.skin || "#c98a5a";
    const typing = !!o.typing, tp = typing ? Math.round(Math.sin(t * 21)) : 0, tq = typing ? Math.round(Math.sin(t * 18 + 1.3)) : 0;
    // chair back (behind torso)
    R(g, x - 40, y + 18, 80, 70, "#23262e"); R(g, x - 40, y + 18, 80, 3, "#3a3f4b"); R(g, x - 40, y + 18, 3, 70, "#2d313a"); R(g, x + 37, y + 18, 3, 70, "#1a1c22");
    // arms reaching forward to the keyboard
    R(g, x - 46, y + 6 + tp, 14, 30, hood); R(g, x - 46, y + 6 + tp, 4, 30, dark); R(g, x - 44, y + 2 + tp, 10, 6, hl);
    R(g, x + 32, y + 6 + tq, 14, 30, hood); R(g, x + 42, y + 6 + tq, 4, 30, dark); R(g, x + 34, y + 2 + tq, 10, 6, hl);
    // torso: widening trapezoid with side shading
    for (let r = 0; r < 70; r++) { const w = Math.round(64 + r * 0.25); R(g, x - w / 2, y + r, w, 1, hood); R(g, x - w / 2, y + r, 5, 1, dark); R(g, x + w / 2 - 5, y + r, 5, 1, dark); }
    R(g, x - 30, y, 60, 3, hl);                                  // light on the shoulders from the screen
    // hood folded on the back + strings shadow
    PX.circle(g, x, y + 4, 15, dark); PX.circle(g, x, y + 2, 12, hood); R(g, x - 12, y - 2, 24, 3, hl);
    R(g, x - 1, y + 14, 2, 40, dark);                            // centre seam
    // neck + head
    R(g, x - 6, y - 8, 12, 10, skin); R(g, x - 6, y - 8, 12, 2, "#a8704a");
    PX.circle(g, x, y - 22, 16, hair); PX.circle(g, x - 2, y - 26, 12, hairHl); PX.circle(g, x + 1, y - 24, 12, hair);
    R(g, x - 17, y - 22, 4, 8, skin); R(g, x + 13, y - 22, 4, 8, skin);   // ears
    R(g, x - 8, y - 38, 16, 2, hairHl);                                    // rim light from the screen
  };
  core.monitor = (g, x, y, w, h, t, o) => {
    o = o || {};
    R(g, x - 3, y - 3, w + 6, h + 6, "#1a1d24"); R(g, x - 3, y - 3, w + 6, 1, "#3a3f4b");
    core.editor(g, x, y, w, h, t, o);
    R(g, x + w / 2 - 4, y + h + 3, 8, 10, "#1a1d24"); R(g, x + w / 2 - 14, y + h + 12, 28, 3, "#22262f");
  };
  core.mug = (g, x, y, t) => {
    R(g, x, y, 9, 10, "#d8dee9"); R(g, x + 9, y + 2, 3, 5, "#d8dee9"); R(g, x + 1, y + 1, 7, 2, "#6b4226"); R(g, x, y + 9, 9, 1, "#9aa4b2");
    for (let i = 0; i < 3; i++) { const k = ((t * 0.7 + i / 3) % 1); g.globalAlpha = 0.5 * (1 - k); R(g, x + 3 + Math.round(Math.sin(k * 6 + i) * 2), y - 3 - k * 14, 2, 3, "#c9d1d9"); }
    g.globalAlpha = 1;
  };

  // room: the night desk. o.mode = "plain" | "setup" (3 monitors, RGB keyboard, LED strip)
  // o.typing (s): typing starts; o.quiet (s): "..." thought bubble; o.lines (bool): show typed code
  K.room = (o) => {
    const rgbT = (t, i) => `hsl(${Math.round((t * 90 + i * 25) % 360)},90%,60%)`;
    return (g, t, d, c) => {
      // wall
      PX.vgrad(g, 0, 0, 640, 300, "151b33", "0c1020", 10);
      // window (far layer, parallax)
      PX.par(g, c, 0.55, () => {
        R(g, 54, 36, 190, 128, "#2a2f45"); core.skyline(g, 60, 42, 178, 116, t, 5);
        R(g, 146, 42, 4, 116, "#2a2f45"); R(g, 60, 98, 178, 4, "#2a2f45"); R(g, 50, 162, 198, 6, "#363c55");
      });
      // shelf + books
      PX.par(g, c, 0.75, () => {
        R(g, 448, 70, 150, 5, "#4a3626"); R(g, 448, 75, 150, 2, "#2c1f15");
        const bk = ["#c0392b", "#2980b9", "#27ae60", "#8e44ad", "#d35400", "#16a085", "#f1c40f", "#7f8c8d"];
        let bx = 454; bk.forEach((col, i) => { const h = 18 + (i * 7) % 9, w = 6 + (i % 3); R(g, bx, 70 - h, w, h, col); R(g, bx, 70 - h, 1, h, "rgba(255,255,255,.25)"); bx += w + 1; });
        R(g, 560, 50, 16, 20, "#3d6b4a"); R(g, 556, 64, 24, 6, "#7a4a2c");   // plant
        R(g, 470, 110, 60, 40, "#1e2438"); R(g, 472, 112, 56, 36, "#2d3a66"); PX.text(g, "</>", 500, 122, { size: 8, col: "#5fe3e8", align: "center" });   // poster
      });
      // lamp cone + light
      PX.glow(g, 120, 205, 120, "rgba(255,190,110,0.55)", 1);
      // desk
      R(g, 0, 250, 640, 12, "#5a3e2b"); R(g, 0, 250, 640, 2, "#7a573d"); R(g, 0, 262, 640, 98, "#1a1410"); R(g, 30, 262, 10, 98, "#2a1f17"); R(g, 600, 262, 10, 98, "#2a1f17");
      // lamp
      R(g, 96, 244, 26, 6, "#2b2f38"); R(g, 106, 196, 4, 48, "#3a3f4b"); R(g, 98, 186, 26, 12, "#3a3f4b"); R(g, 100, 197, 22, 2, "#ffd28a");
      const setup = o.mode === "setup";
      const typing = o.typing !== undefined && t >= o.typing;
      const lines = o.lines === false ? [] : (o.typing !== undefined ? core.typed(t, o.typing, 16) : []);
      // monitors
      if (setup) {
        core.monitor(g, 128, 132, 100, 66, t, { file: "init.lua", lines: [{ seg: [["-- 412 plugins", "#7d8590"]] }] });
        core.monitor(g, 412, 132, 100, 66, t, { file: "theme.lua", lines: [{ seg: [["colorscheme", "#ff7b72"], [" dark", "#a5d6ff"]] }] });
      }
      PX.glow(g, 320, 170, 170, "rgba(90,170,255,0.22)", 1);
      core.monitor(g, 248, 104, 144, 96, t, { file: o.file || "main.py", lines });
      PX.glow(g, 320, 250, 90, "rgba(90,170,255,0.18)", 1);   // screen light on the desk
      // keyboard
      R(g, 270, 238, 100, 12, setup ? "#1b1d22" : "#2b2f38"); R(g, 270, 238, 100, 1, "#4a505c");
      for (let ky = 0; ky < 3; ky++) for (let kx = 0; kx < 16; kx++) {
        const press = typing && ((Math.floor(t * 18) + kx * 3 + ky * 5) % 23 === 0);
        R(g, 273 + kx * 6, 240 + ky * 3 + (press ? 1 : 0), 5, 2, setup ? rgbT(t, kx + ky * 4) : press ? "#9aa4b2" : "#5a6270");
      }
      R(g, 384, 242, 8, 6, "#3a3f4b");   // mouse
      core.mug(g, 210, 238, t);
      if (setup) { for (let i = 0; i < 64; i++) R(g, i * 10, 261, 10, 2, rgbT(t, i)); PX.glow(g, 320, 268, 260, "rgba(160,90,255,0.25)", 1); }
      // the coder
      core.coder(g, 320, 266, t, { typing });
      // thought bubble "..." when the brain goes quiet
      if (o.quiet !== undefined && t >= o.quiet) {
        const k = PX.p(t, o.quiet, 0.35, "back");
        PX.zoom(g, k, 362, 214, () => { PX.circle(g, 362, 214, 12, "#e6edf3"); PX.circle(g, 346, 228, 3, "#e6edf3"); PX.circle(g, 340, 236, 2, "#e6edf3");
          const dots = Math.floor((t - o.quiet) * 2) % 4; for (let i = 0; i < 3; i++) R(g, 355 + i * 6, 213, 3, 3, i < dots ? "#0d1117" : "#9aa4b2"); });
      }
      // dust in the lamp light + vignette
      PX.particles(g, 11, 26, t, [40, 120, 180, 120], { vy: -3, vx: 2, col: "#ffe2b0", a: 0.7 });
      PX.vignette(g, 0.6);
    };
  };
})();
