/* Builds the shot list from window.LAB and draws the active 3D shot on every seek. Load last.
   A kind's frame function returns [scene, camera] or [scene, camera, pins].
   pins = [[text, x, y, z, opacity], ...]: documentary labels (thin leader line + small caps) pinned to 3D points. */
(function () {
  const { R, THREE, W, H } = window.L3;
  const SHOTS = (window.LAB || []).map(([a, b, k, o]) => {
    o = Object.assign({ T0: a, dur: b - a }, o || {});
    if (o.FT0 !== undefined) o.T0 = o.FT0;   // film time of the shot start (builder passes it; parts start at 0)
    if (!window.LABK[k]) { console.error("unknown 3D kind", k); return { a, b, f: null }; }
    return { a, b, f: window.LABK[k](o) };
  });
  const _render = R.render.bind(R);
  R.render = (S, C) => { if (!S.userData.nc) { S.traverse((m) => { m.frustumCulled = false; }); S.userData.nc = 1; } _render(S, C); };
  const box = document.getElementById("pins");
  const pool = [];
  function pin(i) {
    while (pool.length <= i) { const d = document.createElement("div"); d.className = "pin3"; d.innerHTML = "<div></div>"; box.appendChild(d); pool.push(d); }
    return pool[i];
  }
  const v = new THREE.Vector3();
  function draw(t) {
    window.__labT = t;
    let s = null;
    for (const x of SHOTS) if (t >= x.a && t < x.b) s = x;
    let pins = [];
    if (!s || !s.f) R.clear();
    else {
      const out = s.f(t - s.a, s.b - s.a), S = out[0], C = out[1];
      pins = out[2] || [];
      S.traverse((m) => { if (m.userData.update) m.userData.update(); });
      R.render(S, C);
      if (box) pins.forEach(([text, x, y, z, op], i) => {
        const d = pin(i); v.set(x, y, z).project(C);
        d.style.left = ((v.x + 1) / 2 * W).toFixed(1) + "px"; d.style.top = ((1 - v.y) / 2 * H).toFixed(1) + "px";
        d.style.opacity = v.z < 1 ? (op === undefined ? 1 : op).toFixed(3) : 0; d.firstChild.textContent = text;
      });
    }
    for (let i = pins.length; i < pool.length; i++) pool[i].style.opacity = 0;
  }
  window.addEventListener("hf-seek", (e) => draw(e.detail.time));
  window.LAB_draw = draw;
  draw(0);
  window.L3.booting();
})();
