// Bit by Bit mascot: pixel-cube head on a hand-drawn stick body.
// mascotSVG(pose, {blink}) -> SVG string. Poses swap by hard cut (channel rule).
const ARMS = {
  idle:    [[120, 250, 110, 295], [180, 250, 190, 295]],
  tada:    [[90, 185, 52, 125],   [210, 185, 255, 125]],
  point:   [[125, 250, 118, 295], [220, 200, 292, 192]],
  scratch: [[120, 250, 110, 295], [240, 210, 252, 132]],
  shrug:   [[105, 222, 78, 178],  [195, 222, 222, 178]],
  think:   [[120, 250, 110, 295], [205, 235, 172, 172]],
};
const CELL = 15, X0 = 90, Y0 = 40; // 8x8 front face, 120px square

function cube(blink) {
  let px = '';
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const shade = (r + c) % 2 ? '#5FE3E8' : '#57D6DC';
      px += `<rect x="${X0 + c * CELL}" y="${Y0 + r * CELL}" width="${CELL}" height="${CELL}" fill="${shade}"/>`;
    }
  const eyeH = blink ? CELL / 3 : CELL * 2, eyeY = blink ? Y0 + 3.4 * CELL : Y0 + 2 * CELL;
  const eyes = [2, 5].map(c => `<rect x="${X0 + c * CELL}" y="${eyeY}" width="${CELL}" height="${eyeH}" fill="#06121A"/>`).join('');
  const mouth = [[2, 5], [3, 6], [4, 6], [5, 5]].map(([c, r]) => `<rect x="${X0 + c * CELL}" y="${Y0 + r * CELL}" width="${CELL}" height="${CELL}" fill="#06121A"/>`).join('');
  return `<g shape-rendering="crispEdges" filter="url(#bbGlow)">
    <polygon points="90,40 115,20 235,20 210,40" fill="#B4F7F9"/>
    <polygon points="210,40 235,20 235,140 210,160" fill="#2A9FAD"/>
    ${px}${eyes}${mouth}
  </g>`;
}

function mascotSVG(pose = 'idle', { blink = false } = {}) {
  const [[lex, ley, lhx, lhy], [rex, rey, rhx, rhy]] = ARMS[pose] || ARMS.idle;
  const line = d => `<path d="${d}" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420" width="300" height="420">
  <defs>
    <filter id="bbRough"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
    <filter id="bbGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" result="b"/><feColorMatrix in="b" values="0 0 0 0 0.37  0 0 0 0 0.89  0 0 0 0 0.91  0 0 0 0.55 0"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <g filter="url(#bbRough)">
    ${line('M150 160 L150 300')}
    ${line('M150 300 L115 405 M150 300 L185 405')}
    ${line(`M150 195 L${lex} ${ley} L${lhx} ${lhy}`)}
    ${line(`M150 195 L${rex} ${rey} L${rhx} ${rhy}`)}
  </g>
  ${cube(blink)}
</svg>`;
}

if (typeof module !== 'undefined') module.exports = { mascotSVG, POSES: Object.keys(ARMS) };
else window.BitMascot = { mascotSVG, POSES: Object.keys(ARMS) };
