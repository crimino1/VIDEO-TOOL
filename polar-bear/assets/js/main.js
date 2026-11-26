// Runs the film: finds the shot for time t, builds it once, then draws it as a pure function of local time.
defs();
const stage = document.getElementById("stage");
let current = -1, updateFn = null, rootG = null;
const shotIndex = (t) => { let lo = 0, hi = SHOTS.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (SHOTS[m][0] <= t) lo = m; else hi = m - 1; } return lo; };
function drawFilm(t) {
  const i = shotIndex(t), s = SHOTS[i];
  if (s[1][0] === "@") { if (rootG) rootG.setAttribute("opacity", 0); current = -1; return; }
  const end = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : FILM_END;
  if (i !== current) {
    if (rootG) rootG.remove();
    rootG = el("g", {}, stage);
    updateFn = SCENES[s[1]](rootG, s[2] || {}, end - s[0]);
    current = i;
  }
  rootG.setAttribute("opacity", 1);
  updateFn(t - s[0]);
}
const state = { t: 0 };
tl.to(state, { t: FILM_END, duration: FILM_END, ease: "none", onUpdate: () => drawFilm(state.t) }, 0);
drawFilm(0);
window.__jump = drawFilm;
