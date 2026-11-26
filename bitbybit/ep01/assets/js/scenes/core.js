/* Core scene kinds (reference quality for the other scene files). */
(function () {
  const { K, C } = PX;

  // bars: vertical bar chart inside a CRT panel.
  // o: title, items:[{label, v, col, show?}] (show = second-from-shot-start the bar starts growing),
  //    max, fmt ("%" | "$k" | ""), dec, hi (index to pulse), panel (bool, default true)
  K.bars = (o) => {
    const items = o.items || [], n = items.length, max = o.max || Math.max(...items.map((i) => i.v)) * 1.15;
    const fmt = (v) => (o.fmt === "$k" ? "$" + Math.round(v) + "K" : (o.dec ? v.toFixed(o.dec) : Math.round(v)) + (o.fmt === "%" ? "%" : ""));
    return (g, t, d) => {
      const x0 = 60, y0 = 34, w = 360, h = 206;
      if (o.panel !== false) PX.panel(g, x0, y0, w, h, C.cyan);
      if (o.title) PX.text(g, o.title, 240, 14, { col: C.yellow, align: "center" });
      const base = y0 + h - 30, top = y0 + 30, bw = Math.min(56, Math.floor((w - 40) / n) - 18);
      const gap = (w - n * bw) / (n + 1);
      // baseline
      PX.rect(g, x0 + 10, base, w - 20, 1, C.dim);
      items.forEach((it, i) => {
        const st = it.show !== undefined ? it.show : 0.3 + i * 0.5;
        const p = PX.q(PX.p(t, st, 0.9, "out"), 24);
        const bh = Math.round((base - top) * (it.v / max) * p);
        const x = x0 + gap + i * (bw + gap), col = it.col || C.cyan;
        // bar body with a lighter top row and darker right column (pixel shading)
        PX.rect(g, x, base - bh, bw, bh, col);
        if (bh > 2) { PX.rect(g, x, base - bh, bw, 2, "rgba(255,255,255,.45)"); PX.rect(g, x + bw - 3, base - bh, 3, bh, "rgba(0,0,0,.25)"); }
        if (o.hi === i && t > st + 1 && PX.blink(t, 0.5)) PX.box(g, x - 3, base - bh - 3, bw + 6, bh + 6, C.white);
        if (p > 0.05) PX.text(g, fmt(it.v * p), x + bw / 2, base - bh - 18, { font: "v", size: 20, col: C.white, align: "center" });
        PX.text(g, it.label, x + bw / 2, base + 8, { font: "v", size: 14, col: col, align: "center" });
      });
    };
  };

  // title: big pixel words centred (for testing / simple cards). o: lines:[{s, col, at}]
  K.title = (o) => (g, t) => {
    (o.lines || []).forEach((l, i) => { if (t >= (l.at || 0)) PX.text(g, l.s, 240, 110 + i * 22 - (o.lines.length - 1) * 11, { col: l.col || C.yellow, align: "center", size: l.size || 16 }); });
  };
})();
