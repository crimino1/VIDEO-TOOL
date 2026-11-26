// 2D senior figure poses. Every pose is a pure function of p (0..1), driven by timeline tweens, so any frame renders alone.
const SKIN = "#f1c7a3", SHIRT = "#2f7dd1", PANTS = "#5b6573", SHOE = "#2b2b2b", HAIR = "#ededed";
function seg(id, a, b, c, w) {
  const e = document.getElementById(id);
  if (!e) return;
  e.setAttribute("x1", a[0]); e.setAttribute("y1", a[1]); e.setAttribute("x2", b[0]); e.setAttribute("y2", b[1]);
  e.setAttribute("stroke", c); e.setAttribute("stroke-width", w);
}
function pol(o, len, deg) { const r = deg * Math.PI / 180; return [o[0] + len * Math.cos(r), o[1] - len * Math.sin(r)]; }
function drawFig(f, hip, knee, ankle, toe, sh, elbow, hand, lean) {
  seg(f + "sh", knee, ankle, PANTS, 30);
  seg(f + "th", hip, knee, PANTS, 36);
  seg(f + "ft", ankle, toe, SHOE, 22);
  seg(f + "to", hip, sh, SHIRT, 54);
  seg(f + "ua", sh, elbow, SHIRT, 25);
  seg(f + "fa", elbow, hand, SKIN, 20);
  const hd = pol(sh, 44, lean);
  const c = document.getElementById(f + "hd");
  if (c) { c.setAttribute("cx", hd[0]); c.setAttribute("cy", hd[1]); c.setAttribute("r", 30); c.setAttribute("fill", SKIN); }
  const h = document.getElementById(f + "hair");
  if (h) { h.setAttribute("d", `M${hd[0] - 29},${hd[1] - 2} A29,29 0 0,1 ${hd[0] + 29},${hd[1] - 2} Q${hd[0]},${hd[1] - 12} ${hd[0] - 29},${hd[1] - 2}Z`); h.setAttribute("fill", HAIR); }
}
// Sit to stand from a chair whose seat is behind (left of) the knee.
function sitStand(f, p, x0, floor) {
  const ankle = [x0, floor - 12], toe = [x0 + 38, floor - 8], knee = [x0, floor - 102];
  const hip = pol(knee, 90, 180 - 90 * p);
  const lean = 84 - 34 * Math.sin(Math.PI * p);
  const sh = pol(hip, 105, lean);
  const elbow = [sh[0] + 34, sh[1] + 46], hand = [elbow[0] + 46, elbow[1] - 6];
  drawFig(f, hip, knee, ankle, toe, sh, elbow, hand, lean);
}
// Heel raise holding a counter on the right.
function heelRaise(f, p, x0, floor) {
  const lift = 18 * p;
  const toe = [x0 + 38, floor - 6], ankle = [x0 + 2, floor - 12 - lift];
  const knee = [x0, ankle[1] - 90], hip = [x0, knee[1] - 90], sh = [x0 + 4, hip[1] - 105];
  const hand = [x0 + 96, 226], elbow = [sh[0] + 44, sh[1] + 58];
  drawFig(f, hip, knee, ankle, toe, sh, elbow, hand, 88);
}
// Standing band row: band tied to a post on the right, hands pull it back.
function bandPull(f, p, x0, floor) {
  const ankle = [x0, floor - 12], toe = [x0 + 38, floor - 8], knee = [x0 - 4, floor - 102], hip = [x0, floor - 192];
  const sh = [x0 + 2, hip[1] - 105];
  const elbow = [sh[0] + 66 - 100 * p, sh[1] + 40 + 16 * p], hand = [sh[0] + 132 - 92 * p, sh[1] + 44 + 4 * p];
  drawFig(f, hip, knee, ankle, toe, sh, elbow, hand, 90);
  const b = document.getElementById("band2");
  if (b) { b.setAttribute("d", `M${hand[0]},${hand[1]} L364,${sh[1] + 40}`); b.setAttribute("stroke-width", 10 - 4 * p); }
}
