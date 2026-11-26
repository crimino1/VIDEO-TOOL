/* Group C kinds: grid (store, tug, cascade, mine, end) and indiamap (jul30, jul31, restore).
   Every frame is a pure function of t (film time ft = o.T0 + t). Heavy geometry/textures are cached at module level. */
(function () {
  const { THREE, M, W, H, seg, smooth, lerp, clamp, rnd, KF, tex, cam, orbit, canvasTex, glowSprite } = L3;
  const TAU = Math.PI * 2, V = (x, y, z) => new THREE.Vector3(x, y, z);
  const once = (f) => { let v; return () => v || (v = f()); };
  const hash1 = (n) => { let h = Math.imul(n | 0, 374761393) ^ 0x9e3779b9; h = Math.imul(h ^ (h >>> 15), 2246822519); h = Math.imul(h ^ (h >>> 13), 3266489917); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const hash2 = (x, y) => hash1(Math.imul(x | 0, 73856093) ^ Math.imul(y | 0, 19349663));
  const vnoise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
  const fbm = (x, y, o) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < (o || 5); i++) { s += a * vnoise(x * f + i * 17.3, y * f - i * 9.1); f *= 2.03; a *= 0.5; } return s; };
  // lights going out (or coming back): eased 0..1 over dur with a short irregular flicker in the middle
  const dim = (ft, a, dur, seed) => { const r = seg(ft, a, a + dur); if (r <= 0 || r >= 1) return r; const n = hash1(Math.floor(ft * 13) + (seed || 0) * 977); return clamp(r + (n - 0.5) * 0.7 * Math.sin(Math.PI * r), 0, 1); };
  const fade = (ft, a, b, f) => seg(ft, a, a + (f || 0.6)) * (1 - seg(ft, b - (f || 0.6), b));

  // =====================================================================================
  // INDIAMAP — NASA VIIRS night lights of India (Earth Observatory, 2012, public domain)
  // Georeference of assets/img/indianight.jpg (1920x2457) — least-squares fit (equirectangular + affine) on the light
  // centroids of 12 cities (Delhi, Mumbai, Kolkata, Chennai, Bangalore, Hyderabad, Karachi, Lahore, Ahmedabad,
  // Lucknow, Patna, Jaipur), rms 13 px; checked independently against the floodlit India-Pakistan border fence:
  //   x = -4844.317 + 74.962*lon - 0.3977*lat ;  y = 2784.342 + 0.4742*lon - 76.359*lat
  // Region outlines were written as state-border lon/lat points, projected with that fit, and the Rajasthan-Pakistan
  // stretch was replaced by the fence traced in the image. Pixel polygons (image space):
  const REG = {
    NH: [[689,177],[764,166],[839,178],[914,148],[974,110],[1011,179],[1064,203],[1042,271],[1095,333],[1046,378],[1046,416],[1073,424],[1095,455],[1155,478],[1208,513],[1171,562],[1145,619],[1111,615],[1066,604],[1021,577],[980,550],[961,504],[931,488],[916,473],[885,454],[870,427],[840,388],[821,369],[810,350],[787,357],[739,334],[735,304],[712,284],[686,242],[682,212],[685,177]],
    NP: [[787,357],[810,350],[821,369],[840,388],[870,427],[885,454],[916,473],[931,488],[961,504],[980,550],[1021,577],[1066,604],[1111,615],[1145,619],[1186,635],[1261,685],[1307,704],[1367,731],[1400,728],[1442,732],[1434,762],[1453,805],[1465,824],[1491,858],[1442,869],[1420,881],[1401,900],[1390,930],[1398,961],[1379,999],[1349,968],[1323,930],[1263,918],[1218,914],[1173,902],[1143,906],[1105,902],[1060,920],[1046,974],[1016,966],[1008,912],[1019,882],[1053,867],[1079,840],[1067,810],[1075,791],[1037,771],[1011,767],[940,832],[884,847],[906,885],[937,908],[929,942],[907,969],[858,999],[821,976],[768,941],[746,980],[739,1025],[720,1056],[682,1021],[641,979],[603,956],[573,944],[536,940],[476,936],[455,960],[467,955],[465,930],[440,882],[435,857],[407,855],[392,830],[397,805],[395,790],[370,784],[350,777],[347,760],[370,730],[410,682],[425,679],[437,685],[450,702],[520,687],[535,680],[555,645],[580,617],[620,590],[647,530],[683,502],[728,445],[732,407],[761,373]],
    ER: [[1442,732],[1487,740],[1532,775],[1584,794],[1644,806],[1689,810],[1742,806],[1742,749],[1749,688],[1786,681],[1809,734],[1817,772],[1880,784],[1881,826],[1817,841],[1779,814],[1772,849],[1780,902],[1757,925],[1795,975],[1799,1055],[1811,1078],[1826,1170],[1789,1177],[1751,1177],[1706,1176],[1669,1192],[1654,1214],[1658,1241],[1639,1275],[1609,1302],[1580,1313],[1550,1328],[1520,1351],[1501,1370],[1475,1381],[1438,1389],[1400,1419],[1325,1434],[1280,1456],[1251,1464],[1295,1403],[1317,1342],[1347,1281],[1324,1250],[1354,1205],[1391,1159],[1406,1121],[1473,1099],[1466,1053],[1413,1007],[1398,961],[1390,930],[1401,900],[1420,881],[1442,869],[1491,858],[1465,824],[1453,805],[1434,762]],
    // north-east lies mostly east of the VIIRS crop (it ends at ~90.2 E); there it falls on the 2k Black Marble extension
    NE: [[1881,895],[1880,784],[1929,781],[2004,781],[2049,778],[2015,728],[2026,697],[2079,694],[2176,645],[2288,592],[2363,585],[2446,677],[2386,746],[2296,791],[2267,852],[2237,920],[2204,1004],[2148,1004],[2126,1110],[2088,1152],[2062,1072],[2024,1075],[1979,1025],[2005,980],[2065,973],[2080,912],[1967,907]],
  };
  const PXS = 0.005;                                             // world units per image pixel
  const pxW = (u, v, z) => V((u - 960) * PXS, (1228.5 - v) * PXS, z || 0);
  const geoPx = (lo, la) => [-4844.317 + 74.962 * lo - 0.3977 * la, 2784.342 + 0.4742 * lo - 76.359 * la];
  const G = (lo, la, z) => { const p = geoPx(lo, la); return pxW(p[0], p[1], z); };
  // plane spanning image-pixel rect [u0,v0]-[u1,v1]
  function pxPlane(u0, v0, u1, v1, mat, ro) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry((u1 - u0) * PXS, (v1 - v0) * PXS), mat);
    m.position.copy(pxW((u0 + u1) / 2, (v0 + v1) / 2)); m.renderOrder = ro; return m;
  }
  const mapMat = (o) => new THREE.MeshBasicMaterial(Object.assign({ transparent: true, depthTest: false, depthWrite: false, toneMapped: false }, o));
  const india = once(() => {
    const G0 = new THREE.Group();
    // 1. base: land/ocean navy continued from the image's own edge colours, fading to space far out
    const rows = [[-800, [13, 25, 70]], [380, [12, 24, 69]], [450, [8, 16, 55]], [750, [7, 12, 44]], [900, [10, 17, 50]], [1050, [5, 9, 43]], [1150, [1, 2, 30]], [3300, [1, 2, 30]]];
    const U0 = -1600, U1 = 3600, V0 = -900, V1 = 3300;
    const baseT = canvasTex(256, 512, (g, w, h) => {
      for (let j = 0; j < h; j++) {
        const v = V0 + (V1 - V0) * j / h; let k = 1; while (k < rows.length - 1 && rows[k][0] < v) k++;
        const a = rows[k - 1], b = rows[k], p = clamp((v - a[0]) / (b[0] - a[0]), 0, 1), c = a[1].map((x, i) => x + (b[1][i] - x) * p);
        for (let i = 0; i < w; i++) {
          const ex = Math.min(i, w - 1 - i) / w, ey = Math.min(j, h - 1 - j) / h, e = smooth(ex / 0.12) * smooth(ey / 0.08);
          const n = 0.9 + 0.2 * fbm(i * 0.05, j * 0.05, 3);
          g.fillStyle = `rgb(${(c[0] * e * n) | 0},${(c[1] * e * n) | 0},${(c[2] * e * n) | 0})`; g.fillRect(i, j, 1, 1);
        }
      }
    });
    G0.add(pxPlane(U0, V0, U1, V1, mapMat({ map: baseT }), 10));
    // 2. east of the VIIRS crop (north-east, Bangladesh): light cells of the 2k Black Marble map (assets/tex/2k_earth_nightmap.jpg,
    //    pixels 12+ above background, lon 89.9-98.5, lat 20-31; [lon, lat, brightness]) drawn as small scattered lights inside each ~19 km cell
    const NEL = [91.14,29.79,0.06,90.97,29.62,0.1,91.14,29.62,0.32,90.62,29.44,0.06,90.62,29.27,0.07,95.01,27.51,0.14,95.19,27.51,0.12,95.36,27.51,0.18,95.54,27.51,0.23,96.06,27.51,0.1,95.01,27.33,0.15,95.19,27.33,0.64,95.36,27.33,0.83,95.54,27.33,0.26,95.71,27.33,0.1,95.01,27.16,0.16,95.19,27.16,0.12,94.66,26.98,0.15,94.83,26.98,0.47,94.13,26.81,0.1,94.31,26.81,0.09,94.66,26.81,0.36,92.72,26.63,0.1,90.44,26.46,0.1,90.62,26.46,0.17,92.72,26.46,0.06,91.67,26.28,0.1,91.85,26.28,0.11,92.72,26.28,0.08,91.67,26.1,0.32,91.85,26.1,0.31,93.96,26.1,0.09,93.78,25.93,0.19,90.26,25.58,0.08,91.85,25.58,0.3,90.09,25.05,0.07,91.67,25.05,0.06,98.53,25.05,0.16,89.91,24.87,0.12,91.85,24.87,0.29,92.02,24.87,0.14,92.55,24.87,0.09,92.72,24.87,0.14,92.9,24.87,0.06,93.96,24.87,0.33,90.44,24.7,0.2,93.96,24.7,0.1,98.0,24.7,0.09,90.79,24.52,0.05,91.85,24.52,0.08,98.53,24.52,0.08,92.2,24.35,0.07,93.78,24.35,0.05,98.53,24.35,0.08,89.91,24.17,0.09,97.82,24.17,0.08,90.26,23.99,0.41,90.44,23.99,0.33,90.62,23.99,0.17,90.79,23.99,0.06,90.97,23.99,0.18,91.14,23.99,0.18,97.82,23.99,0.22,90.26,23.82,0.35,90.44,23.82,0.8,90.62,23.82,0.06,91.32,23.82,0.28,92.72,23.82,0.15,89.91,23.64,0.12,90.44,23.64,0.68,90.62,23.64,0.2,91.14,23.64,0.08,91.14,23.47,0.34,90.62,23.29,0.1,91.32,23.12,0.06,91.14,22.94,0.2,97.82,22.94,0.08,90.44,22.76,0.15,91.14,22.76,0.05,90.26,22.59,0.05,91.67,22.59,0.08,91.85,22.59,0.08,92.2,22.59,0.11,91.67,22.41,0.17,91.85,22.41,0.86,91.85,22.24,0.37,92.02,22.24,0.07,95.19,22.24,0.14,95.19,22.06,0.16,96.06,22.06,0.2,96.42,22.06,0.08,95.89,21.88,0.05,96.06,21.88,0.38,92.02,21.53,0.14,96.42,21.53,0.06,92.02,21.36,0.09,94.83,21.36,0.05,95.19,21.36,0.05,96.42,21.36,0.06,94.83,21.18,0.16,94.83,21.01,0.05,94.83,20.83,0.15,95.19,20.83,0.06,95.89,20.83,0.13,96.06,20.83,0.11,96.94,20.83,0.11,97.12,20.83,0.11,96.59,20.65,0.05,94.83,20.48,0.11,94.83,20.3,0.07,95.71,20.3,0.1,95.89,20.3,0.06,92.9,20.13,0.05,94.83,20.13,0.21,95.01,20.13,0.14,95.71,20.13,0.06,95.01,19.95,0.11,95.54,19.95,0.07];
    {
      const r = rnd(77), pos = [], col = [];
      for (let i = 0; i < NEL.length; i += 3) {
        const b = NEL[i + 2], n = 2 + Math.floor(b * 26);
        for (let k = 0; k < n; k++) {
          const c = r() < b * 0.8 ? 0.35 * (r() - 0.5) * (r() - 0.5) * 4 : 0, lo = NEL[i] + (r() - 0.5) * 0.18 * (c ? 0.4 : 1), la = NEL[i + 1] + (r() - 0.5) * 0.18 * (c ? 0.4 : 1);
          if (lo < 90.05) continue;
          const p = G(lo, la, 0); pos.push(p.x, p.y, 0);
          const e = (0.35 + 0.65 * Math.pow(r(), 2)) * (0.9 + 1.4 * b); col.push(e, e * 0.8, e * 0.52);
        }
      }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      const dot = canvasTex(32, 32, (g2) => { const gr = g2.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g2.fillStyle = gr; g2.fillRect(0, 0, 32, 32); });
      const pts = new THREE.Points(g, new THREE.PointsMaterial({ map: dot, size: 0.07, vertexColors: true, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
      pts.renderOrder = 11; G0.add(pts);
    }
    // 3. the VIIRS image, edges feathered so it melts into the base
    const feather = canvasTex(512, 512, (g, w, h) => {
      const gx = g.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, "#000"); gx.addColorStop(0.025, "#fff"); gx.addColorStop(0.95, "#fff"); gx.addColorStop(1, "#000");
      g.fillStyle = gx; g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = "multiply";
      const gy = g.createLinearGradient(0, 0, 0, h); gy.addColorStop(0, "#000"); gy.addColorStop(0.02, "#fff"); gy.addColorStop(0.98, "#fff"); gy.addColorStop(1, "#000");
      g.fillStyle = gy; g.fillRect(0, 0, w, h);
    });
    G0.add(pxPlane(0, 0, 1920, 2457, mapMat({ map: tex("../img/indianight.jpg"), alphaMap: feather }), 12));
    // 4. one blackout plane per region: blurred polygon as alpha, colour a shade below the night land
    const masks = {};
    for (const k in REG) {
      const P = REG[k], m = 30, s = 0.5;
      let u0 = 1e9, v0 = 1e9, u1 = -1e9, v1 = -1e9; P.forEach(([u, v]) => { u0 = Math.min(u0, u); v0 = Math.min(v0, v); u1 = Math.max(u1, u); v1 = Math.max(v1, v); });
      u0 -= m; v0 -= m; u1 += m; v1 += m;
      const am = canvasTex(Math.ceil((u1 - u0) * s), Math.ceil((v1 - v0) * s), (g, w, h) => {
        g.fillStyle = "#000"; g.fillRect(0, 0, w, h); g.filter = "blur(3px)"; g.fillStyle = g.strokeStyle = "#fff"; g.lineWidth = 3; g.lineJoin = "round";
        g.beginPath(); P.forEach(([u, v], i) => (i ? g.lineTo : g.moveTo).call(g, (u - u0) * s, (v - v0) * s)); g.closePath(); g.fill(); g.stroke();
      });
      const mm = mapMat({ color: 0x060d2c, alphaMap: am, opacity: 0 });
      G0.add(pxPlane(u0, v0, u1, v1, mm, 13)); masks[k] = mm;
    }
    return { G0, masks };
  });

  LABK.indiamap = (o) => {
    const S = new THREE.Scene(); S.background = new THREE.Color(0x000000);
    const st = L3.stars(41, 2500); st.material.opacity = 0.5; st.material.transparent = true; st.renderOrder = 0; S.add(st);
    const I = india(); S.add(I.G0.clone());   // one parent per object: each shot gets its own copy (materials shared)
    const C = cam(30), mode = o.mode;
    const pinsAt = { N: G(76.8, 29.2), E: G(86.3, 23.4), NE: G(90.9, 25.7) };
    return (t) => {
      const ft = o.T0 + t; let dk = { NH: 0, NP: 0, ER: 0, NE: 0 }, pins = [], tg, dist, az, el;
      if (mode === "jul30") {
        const n = dim(ft, 657.2, 2.1, 1); dk.NH = dk.NP = n;
        const p = smooth(t / 16.14);
        tg = G(lerp(75.9, 76.3, p), lerp(28.4, 29.5, p)); dist = lerp(8.8, 7.3, p); az = lerp(-4, 3, p); el = lerp(-24, -19, p);
        pins.push(["Northern grid", pinsAt.N.x, pinsAt.N.y, 0, fade(ft, 657.6, 661.9, 0.7)]);
      } else if (mode === "jul31") {
        dk.NH = dk.NP = dim(ft, 665.7, 2.0, 2); dk.ER = dim(ft, 666.9, 1.9, 3); dk.NE = dim(ft, 668.0, 1.7, 4);
        const p = smooth(t / 14.42);
        tg = G(lerp(84.0, 84.6, p), lerp(25.0, 25.4, p)); dist = lerp(11.6, 10.6, p); az = lerp(3, -3, p); el = lerp(-31, -27, p);
        pins.push(["Northern", pinsAt.N.x, pinsAt.N.y, 0, fade(ft, 666.0, 668.4, 0.5)], ["Eastern", pinsAt.E.x, pinsAt.E.y, 0, fade(ft, 667.2, 669.5, 0.5)], ["North-eastern", pinsAt.NE.x, pinsAt.NE.y, 0, fade(ft, 668.3, 669.75, 0.45)]);
      } else { // restore: hydro first — north-east, then the Himalayan states, then the plains and the east
        dk.NE = 1 - dim(ft, 734.0, 1.3, 5); dk.NH = 1 - dim(ft, 734.7, 1.3, 6); dk.NP = 1 - dim(ft, 735.5, 1.5, 7); dk.ER = 1 - dim(ft, 736.4, 1.5, 8);
        const p = smooth(t / 6.7);
        tg = G(lerp(83.6, 82.8, p), lerp(25.9, 26.4, p)); dist = lerp(11.6, 10.6, p); az = lerp(-3, 2, p); el = lerp(-17, -21, p);
      }
      for (const k in dk) I.masks[k].opacity = 0.9 * dk[k];
      orbit(C, tg.x, tg.y, 0, dist, az, el);
      return [S, C, pins];
    };
  };

  // =====================================================================================
  // GRID — a dusk landscape, 1 unit ~ 10 m: lattice towers, sagging lines, a coal station with a cutaway generator, towns
  const SUN = V(-0.35, 0, -0.94).normalize();                        // azimuth of the (just set) sun: behind the station
  const SKY = {
    dusk: { zen: [14, 24, 46], mid: [46, 66, 98], hor: [152, 136, 134], sun: [255, 136, 66], glow: 1.0, cloud: 0.85, fog: 0x4d5468, fogN: 35, fogF: 240, sunI: 0.75, sunC: 0xffa868, sunEl: 5, hemiS: 0x8a9ac0, hemiG: 0x4a4034, hemiI: 1.9, env: 0.7 },
    blue: { zen: [9, 15, 32], mid: [30, 44, 74], hor: [96, 94, 114], sun: [210, 110, 76], glow: 0.6, cloud: 0.5, fog: 0x343e58, fogN: 30, fogF: 230, sunI: 1.0, sunC: 0xffa27a, sunEl: 3, hemiS: 0x7086b0, hemiG: 0x3c3732, hemiI: 1.9, env: 0.5 },
    night: { zen: [3, 5, 11], mid: [7, 10, 19], hor: [20, 23, 33], sun: [60, 46, 50], glow: 0.18, cloud: 0.3, fog: 0x0f121a, fogN: 25, fogF: 200, sunI: 0.3, sunC: 0x9fb4dc, sunEl: 35, hemiS: 0x2a3a58, hemiG: 0x0c0b0b, hemiI: 0.4, env: 0.3, stars: 1 },
  };
  const skyC = {};
  function skyFor(k) {
    if (skyC[k]) return skyC[k];
    const P = SKY[k];
    const map = canvasTex(1024, 512, (g, w, h) => {
      const img = g.createImageData(w, h), d = img.data, r = rnd(9);
      for (let j = 0; j < h; j++) {
        const el = (0.5 - (j + 0.5) / h) * Math.PI, e = Math.max(el, 0), ce = Math.cos(el), se = Math.sin(el);
        for (let i = 0; i < w; i++) {
          const ph = (i + 0.5) / w * TAU, dx = -Math.cos(ph), dz = Math.sin(ph), cs = Math.max(0, dx * SUN.x + dz * SUN.z);
          const a = smooth(e / 0.3), b = smooth((e - 0.1) / 1.1);
          let c = [0, 1, 2].map((q) => lerp(lerp(P.hor[q], P.mid[q], a), P.zen[q], b));
          const gl = P.glow * (Math.pow(cs, 7) * Math.exp(-e * 6) + 0.45 * Math.pow(cs, 2) * Math.exp(-e * 14));
          c = c.map((x, q) => x + P.sun[q] * gl);
          if (el > 0.004 && el < 0.55) {           // thin stratus streaks on a cloud plane, undersides warm toward the sun
            const k2 = ce / (se + 0.05), px = dx * k2, pz = dz * k2;
            const n = fbm(px * 0.35 + 3, pz * 1.6 - 7, 5);
            const cl = smooth((n - 0.5) / 0.17) * smooth((0.5 - el) / 0.3) * smooth(el / 0.025) * P.cloud;
            const lit = Math.pow(cs, 3) * Math.exp(-e * 4);
            c = c.map((x, q) => lerp(x, lerp(P.mid[q] * 0.5, P.sun[q] * 0.8 + 24, lit), cl * 0.85));
          }
          if (el < 0) c = c.map((x, q) => lerp(P.hor[q], P.hor[q] * 0.6, smooth(-el / 0.2)));
          const o = (j * w + i) * 4, dt = (r() - 0.5) * 2;
          d[o] = clamp(c[0] + dt, 0, 255); d[o + 1] = clamp(c[1] + dt, 0, 255); d[o + 2] = clamp(c[2] + dt, 0, 255); d[o + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(900, 64, 32), new THREE.MeshBasicMaterial({ map, side: THREE.BackSide, fog: false, depthWrite: false, toneMapped: false }));
    const es = new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(50, 48, 24), new THREE.MeshBasicMaterial({ map, side: THREE.BackSide })));
    const pm = new THREE.PMREMGenerator(L3.R), env = pm.fromScene(es, 0.02).texture; pm.dispose();
    return (skyC[k] = { dome, env, P });
  }

  // ---------- terrain ----------
  const GR = 900;
  const ground = (x, z) => { const r = Math.hypot(x, z); return 0.22 * (fbm(x * 0.06 + 11, z * 0.06 + 3, 3) - 0.5) + smooth((r - 70) / 120) * (fbm(x * 0.011 + 5, z * 0.011 - 2, 5) * 32 - 10); };
  const terrain = once(() => {
    const g = new THREE.PlaneGeometry(GR, GR, 300, 300); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, ground(p.getX(i), p.getZ(i)));
    g.computeVertexNormals();
    const map = canvasTex(2048, 2048, (c, w, h) => {
      const r = rnd(21), sc = w / GR;
      c.fillStyle = "#4b4934"; c.fillRect(0, 0, w, h);
      const cols = ["#5a5638", "#655d3d", "#4b5133", "#71664a", "#3d4a2c", "#5d5943", "#6c674b", "#525a37", "#7a6e50"];
      for (let i = 0; i < 14000; i++) {
        const x = r() * w, y = r() * h, a = (r() < 0.65 ? 0.32 : 1.9) + (r() - 0.5) * 0.12;
        c.save(); c.translate(x, y); c.rotate(a); c.globalAlpha = 0.8; c.fillStyle = cols[(r() * cols.length) | 0];
        const fw = sc * (3 + r() * 9), fh = sc * (2 + r() * 6); c.fillRect(-fw / 2, -fh / 2, fw, fh); c.restore();
      }
      c.globalAlpha = 1;
      for (let i = 0; i < 9000; i++) { c.fillStyle = r() < 0.5 ? "rgba(22,30,16,.5)" : "rgba(30,36,20,.4)"; const s = 1 + r() * 2.5; c.beginPath(); c.arc(r() * w, r() * h, s, 0, TAU); c.fill(); }
      for (let i = 0; i < 70000; i++) { c.fillStyle = r() < 0.5 ? "rgba(255,240,210,.05)" : "rgba(0,0,0,.08)"; c.fillRect(r() * w, r() * h, 1 + r() * 2, 1); }
      c.strokeStyle = "rgba(150,138,112,.55)"; c.lineWidth = 1.4;
      for (let i = 0; i < 26; i++) { c.beginPath(); let x = r() * w, y = r() * h, a = r() * TAU; c.moveTo(x, y); for (let k = 0; k < 40; k++) { a += (r() - 0.5) * 0.25; x += Math.cos(a) * 18; y += Math.sin(a) * 18; c.lineTo(x, y); } c.stroke(); }
    });
    map.anisotropy = 8;
    const bump = canvasTex(256, 256, (c, w, h) => { const r = rnd(5); c.fillStyle = "#808080"; c.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { const v = (r() * 255) | 0; c.fillStyle = `rgba(${v},${v},${v},.35)`; c.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 2); } });
    bump.wrapS = bump.wrapT = THREE.RepeatWrapping; bump.repeat.set(220, 220);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map, color: 0xd2cdc4, bumpMap: bump, bumpScale: 1.2, roughness: 1, metalness: 0, envMapIntensity: 0.4 }));
    m.receiveShadow = true; return m;
  });
  // scattered trees (neem/mango-like blobs) avoiding the given clear circles [[x,z,r],...]
  const treeGeo = once(() => { const g = new THREE.IcosahedronGeometry(1, 1); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = 0.82 + 0.3 * hash2(Math.round(x * 9) + 50, Math.round(y * 9 + z * 5) + 50); p.setXYZ(i, x * n, y * n * 0.8, z * n); } g.computeVertexNormals(); return g; });
  function trees(seed, n, clear, R0, R1) {
    const r = rnd(seed), im = new THREE.InstancedMesh(treeGeo(), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, envMapIntensity: 0.25 }), n);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color(); let k = 0;
    for (let i = 0; i < n * 4 && k < n; i++) {
      const a = r() * TAU, d = R0 + Math.sqrt(r()) * (R1 - R0), x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (clear.some(([cx, cz, cr]) => Math.hypot(x - cx, z - cz) < cr)) continue;
      if (fbm(x * 0.04, z * 0.04, 2) < 0.42) continue;          // clumps along field edges, not a carpet
      const s = 0.22 + r() * 0.3;
      m4.compose(V(x, ground(x, z) + s * 0.75, z), q.setFromAxisAngle(V(0, 1, 0), r() * TAU), V(s, s, s)); im.setMatrixAt(k, m4);
      c.setRGB(0.12 + r() * 0.05, 0.16 + r() * 0.06, 0.08 + r() * 0.03); im.setColorAt(k, c); k++;
    }
    im.count = k; return im;
  }

  // ---------- geometry helpers ----------
  const BOX = new THREE.BoxGeometry(1, 1, 1), YA = V(0, 1, 0);
  function merge(parts) {
    const gs = parts.map(([g, m]) => { const q = g.index ? g.toNonIndexed() : g.clone(); if (m) q.applyMatrix4(m); return q; });
    let n = 0; gs.forEach((q) => (n += q.attributes.position.count));
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
    gs.forEach((q) => { pos.set(q.attributes.position.array, o * 3); nor.set(q.attributes.normal.array, o * 3); o += q.attributes.position.count; q.dispose(); });
    const out = new THREE.BufferGeometry(); out.setAttribute("position", new THREE.BufferAttribute(pos, 3)); out.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); return out;
  }
  const beam = (a, b, t, t2) => { const d = b.clone().sub(a), L = d.length(); return [BOX, new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(YA, d.divideScalar(L)), V(t, L, t2 || t))]; };
  const boxAt = (x, y, z, w, h, d) => [BOX, new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion(), V(w, h, d))];
  // tubes along polylines (one merged geometry)
  function tubes(lines, rad, RS) {
    RS = RS || 4; const pos = [], nor = [], idx = []; let base = 0;
    for (const L of lines) {
      for (let i = 0; i < L.length; i++) {
        const t = (i < L.length - 1 ? L[i + 1].clone().sub(L[i]) : L[i].clone().sub(L[i - 1])).normalize();
        const b1 = (Math.abs(t.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0)).cross(t).normalize(), b2 = t.clone().cross(b1);
        for (let k = 0; k < RS; k++) { const a = k / RS * TAU, n = b1.clone().multiplyScalar(Math.cos(a)).addScaledVector(b2, Math.sin(a)); pos.push(L[i].x + n.x * rad, L[i].y + n.y * rad, L[i].z + n.z * rad); nor.push(n.x, n.y, n.z); }
      }
      for (let i = 0; i < L.length - 1; i++) for (let k = 0; k < RS; k++) { const a = base + i * RS + k, b = base + i * RS + ((k + 1) % RS); idx.push(a, a + RS, b, b, a + RS, b + RS); }
      base += L.length * RS;
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); g.setIndex(idx); return g;
  }
  const softDot = once(() => canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.18, "rgba(255,255,255,.8)"); gr.addColorStop(0.45, "rgba(255,255,255,.18)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }));
  const lampPoints = (pos, color, size) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); return new THREE.Points(g, new THREE.PointsMaterial({ map: softDot(), color, size, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false })); };

  // ---------- 400 kV double-circuit lattice tower (local: line along z, arms along x) ----------
  const tower = once(() => {
    const P = [], hw = (y) => (y < 2.2 ? lerp(0.44, 0.15, y / 2.2) : lerp(0.15, 0.11, (y - 2.2) / 1.35));
    const lv = [0, 0.42, 0.85, 1.3, 1.75, 2.2, 2.75, 3.3, 3.55], S4 = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
    const c = (y, sx, sz) => V(sx * hw(y), y, sz * hw(y));
    for (let i = 0; i < lv.length - 1; i++) {
      const y0 = lv[i], y1 = lv[i + 1];
      for (let k = 0; k < 4; k++) {
        const [ax, az] = S4[k], [bx, bz] = S4[(k + 1) % 4];
        P.push(beam(c(y0, ax, az), c(y1, ax, az), 0.05), beam(c(y1, ax, az), c(y1, bx, bz), 0.026), beam(c(y0, ax, az), c(y1, bx, bz), 0.02), beam(c(y0, bx, bz), c(y1, ax, az), 0.02));
      }
    }
    for (const [sx, sz] of S4) P.push(boxAt(sx * 0.44, 0.04, sz * 0.44, 0.16, 0.12, 0.16));
    const att = [];
    for (const [y, L] of [[2.2, 1.05], [2.75, 1.25], [3.3, 1.0]]) for (const s of [-1, 1]) {
      const w = hw(y), tip = V(s * L, y, 0);
      P.push(beam(V(s * w, y, w), tip, 0.028), beam(V(s * w, y, -w), tip, 0.028), beam(V(s * w, y + 0.3, 0), tip, 0.026), beam(V(s * w, y, w), V(s * w, y, -w), 0.022));
      P.push(beam(V(s * w, y, w), V(s * (w + L) / 2, y + 0.15, 0), 0.016), beam(V(s * w, y, -w), V(s * (w + L) / 2, y + 0.15, 0), 0.016));
      att.push(V(s * (L - 0.03), y - 0.36, 0));
    }
    for (const [sx, sz] of S4) P.push(beam(c(3.55, sx, sz), V(0, 3.92, 0), 0.026));
    att.push(V(0, 3.92, 0));
    const I = [], disc = new THREE.CylinderGeometry(0.042, 0.042, 0.022, 10);
    for (let a = 0; a < 6; a++) for (let k = 0; k < 9; k++) I.push([disc, new THREE.Matrix4().makeTranslation(att[a].x, att[a].y + 0.035 + k * 0.035, 0)]);
    return { geo: merge(P), ins: merge(I), att };
  });
  const steelMat = once(() => new THREE.MeshStandardMaterial({ color: 0x8d9298, metalness: 0.75, roughness: 0.48 }));
  const glassInsMat = once(() => new THREE.MeshStandardMaterial({ color: 0x5d7a74, metalness: 0.1, roughness: 0.15, envMapIntensity: 1.2 }));
  const wireMat = () => new THREE.MeshStandardMaterial({ color: 0x55585c, metalness: 0.8, roughness: 0.4, emissive: 0xff5a1e, emissiveIntensity: 0, side: THREE.DoubleSide });

  // a transmission line through waypoints [[x,z],...]: towers every ~spacing, conductors sag between them
  function line(pts, spacing) {
    const W2 = pts.map(([x, z]) => V(x, 0, z)), lens = [0];
    for (let i = 1; i < W2.length; i++) lens.push(lens[i - 1] + W2[i].distanceTo(W2[i - 1]));
    const L = lens[lens.length - 1], n = Math.max(1, Math.round(L / (spacing || 9))), T = [], tw = tower();
    const at = (s) => { let i = 1; while (i < lens.length - 1 && lens[i] < s) i++; const p = (s - lens[i - 1]) / (lens[i] - lens[i - 1]); return W2[i - 1].clone().lerp(W2[i], clamp(p, 0, 1)); };
    for (let i = 0; i <= n; i++) {
      const s = i / n * L, p = at(s), d = at(Math.min(L, s + 0.5)).sub(at(Math.max(0, s - 0.5))).normalize();
      p.y = ground(p.x, p.z) - 0.04; const yaw = Math.atan2(d.x, d.z), m = new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromAxisAngle(YA, yaw), V(1, 1, 1));
      T.push({ p, m, a: tw.att.map((v) => v.clone().applyMatrix4(m)) });
    }
    const wires = [], mid = [];
    for (let i = 0; i < T.length - 1; i++) {
      const A = T[i], B = T[i + 1], span = A.p.distanceTo(B.p);
      for (let k = 0; k < 7; k++) {
        const pl = []; for (let s = 0; s <= 12; s++) { const u = s / 12, q = A.a[k].clone().lerp(B.a[k], u); q.y -= (k === 6 ? 0.03 : 0.045) * span * 4 * u * (1 - u); pl.push(q); }
        wires.push(pl);
      }
      for (let s = i ? 1 : 0; s <= 8; s++) { const u = s / 8, q = A.p.clone().lerp(B.p, u); q.y = lerp(A.p.y, B.p.y, u) + 2.45 - 0.045 * span * 4 * u * (1 - u); mid.push(q); }
    }
    return { T, wires, mid, L };
  }
  // a set of lines -> instanced towers + one wire mesh per line (so each line can heat up on its own)
  function lineSet(lines) {
    const G = new THREE.Group(), tw = tower(), all = lines.flatMap((l) => l.T);
    const ti = new THREE.InstancedMesh(tw.geo, steelMat(), all.length), ii = new THREE.InstancedMesh(tw.ins, glassInsMat(), all.length);
    all.forEach((t, i) => { ti.setMatrixAt(i, t.m); ii.setMatrixAt(i, t.m); }); ti.castShadow = true; G.add(ti, ii);
    lines.forEach((l) => { l.mat = wireMat(); l.mesh = new THREE.Mesh(tubes(l.wires, 0.013), l.mat); G.add(l.mesh); });
    return G;
  }
  // energy in the space around a line: a soft camera-facing band whose brightness is set per point every frame
  const acrossTex = once(() => canvasTex(4, 128, (g, w, h) => { for (let j = 0; j < h; j++) { const v = Math.abs(j / (h - 1) * 2 - 1), a = Math.exp(-v * v * 5) * (1 - v * v); g.fillStyle = `rgb(${a * 255 | 0},${a * 255 | 0},${a * 255 | 0})`; g.fillRect(0, j, w, 1); } }));
  function ribbon(pts, width) {
    const n = pts.length, pos = new Float32Array(n * 6), col = new Float32Array(n * 6), uv = new Float32Array(n * 4), idx = [], us = [0];
    for (let i = 1; i < n; i++) us.push(us[i - 1] + pts[i].distanceTo(pts[i - 1]));
    for (let i = 0; i < n; i++) { uv[i * 4] = uv[i * 4 + 2] = us[i] / us[n - 1]; uv[i * 4 + 1] = 0; uv[i * 4 + 3] = 1; if (i < n - 1) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, alphaMap: acrossTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false, toneMapped: false }));
    const t = V(0, 0, 0), to = V(0, 0, 0), sd = V(0, 0, 0);
    m.userData.set = (C, fn) => {   // fn(s along the line) -> [r,g,b]
      for (let i = 0; i < n; i++) {
        const p = pts[i]; t.copy(pts[Math.min(n - 1, i + 1)]).sub(pts[Math.max(0, i - 1)]).normalize(); to.copy(C.position).sub(p);
        const dist = to.length(); sd.crossVectors(t, to).normalize().multiplyScalar(width / 2);
        pos.set([p.x + sd.x, p.y + sd.y, p.z + sd.z, p.x - sd.x, p.y - sd.y, p.z - sd.z], i * 6);
        const eo = Math.abs(t.dot(to)) / dist, c = fn(us[i]), f = (1 - eo * eo * eo) / (1 + dist * dist / 9000);
        col.set([c[0] * f, c[1] * f, c[2] * f, c[0] * f, c[1] * f, c[2] * f], i * 6);
      }
      g.attributes.position.needsUpdate = g.attributes.color.needsUpdate = true;
    };
    m.userData.len = us[n - 1]; return m;
  }

  // ---------- towns: flat-roofed concrete houses, water tanks, lit windows (warm bulbs and cool tube lights) ----------
  const houseTex = once(() => [1, 2, 3].map((s) => {
    const r0 = rnd(30 + s), wins = [];
    for (let f = 0; f < s; f++) for (let k = 0; k < 3; k++) wins.push([20 + k * 38, 128 - (f + 1) * (116 / s) + 14, 18, Math.min(24, 116 / s - 22)]);
    const map = canvasTex(128, 128, (g, w, h) => {
      g.fillStyle = "#d6cfc2"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 1400; i++) { g.fillStyle = r0() < 0.5 ? "rgba(80,70,55,.07)" : "rgba(255,255,255,.06)"; g.fillRect(r0() * w, r0() * h, 2 + r0() * 6, 1 + r0() * 3); }
      g.fillStyle = "rgba(60,50,40,.18)"; g.fillRect(0, h - 10, w, 10); g.fillRect(0, 0, w, 6);
      wins.forEach(([x, y, ww, hh]) => { g.fillStyle = "#77716a"; g.fillRect(x - 2, y - 2, ww + 4, hh + 4); g.fillStyle = "#30353c"; g.fillRect(x, y, ww, hh); g.fillStyle = "rgba(160,175,190,.25)"; g.fillRect(x, y, ww, 3); });
    });
    const em = [0, 1, 2].map((v) => canvasTex(128, 128, (g, w, h) => {
      const r = rnd(100 + s * 10 + v); g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
      wins.forEach(([x, y, ww, hh]) => { if (r() < 0.38) return; const cool = r() < 0.4; g.fillStyle = cool ? "#d9e6ff" : (r() < 0.5 ? "#ffc97e" : "#ffdca8"); g.globalAlpha = 0.55 + r() * 0.45; g.fillRect(x, y, ww, hh); g.globalAlpha = 1; });
    }));
    return { map, em };
  }));
  const houseGeo = once(() => { const g = new THREE.BoxGeometry(1, 1, 1); g.translate(0, 0.5, 0); const uv = g.attributes.uv; for (let i = 8; i < 16; i++) uv.setXY(i, 0.04, 0.5); return g; });
  const tankGeo = once(() => { const g = new THREE.CylinderGeometry(0.07, 0.07, 0.11, 12); g.translate(0, 0.055, 0); return g; });
  const PAINT = [0xe8e2d4, 0xe9dcc0, 0xd8c8b0, 0xcfd6d8, 0xe6d2c8, 0xd9d2a8, 0xc9c0b2, 0xeeeeea];
  const townPad = once(() => canvasTex(512, 512, (g, w, h) => {
    const r = rnd(12), gr = g.createRadialGradient(256, 256, 60, 256, 256, 256); gr.addColorStop(0, "rgba(96,88,74,1)"); gr.addColorStop(0.75, "rgba(92,84,68,.85)"); gr.addColorStop(1, "rgba(90,82,66,0)");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 6000; i++) { g.fillStyle = r() < 0.5 ? "rgba(40,36,30,.12)" : "rgba(160,150,130,.08)"; g.fillRect(r() * w, r() * h, 1 + r() * 4, 1 + r() * 4); }
  }));
  function town(o) {
    const r = rnd(o.seed), G = new THREE.Group(), ng = 3, lists = [], tanks = [], lamps = [], tex = houseTex();
    for (let i = 0; i < ng * 3; i++) lists.push([]);
    const cA = Math.cos(o.ang || 0), sA = Math.sin(o.ang || 0), cell = 1.05, N = Math.ceil(o.r / cell) + 1;
    for (let i = -N; i <= N; i++) for (let j = -N; j <= N; j++) {
      const lx = i * cell, lz = j * cell, wx = o.x + lx * cA - lz * sA, wz = o.z + lx * sA + lz * cA;
      const d = Math.hypot(lx, lz) / o.r * (0.8 + 0.4 * vnoise(i * 0.35 + o.seed, j * 0.35));
      if (d > 1) continue;
      if (i % 5 === 0 || j % 4 === 0) { if (r() < 0.45) lamps.push(wx + (r() - 0.5) * 0.4, ground(wx, wz) + 0.42, wz + (r() - 0.5) * 0.4); continue; }
      if (r() < 0.08 + d * 0.3) continue;
      const s = d < 0.4 && o.tall ? Math.min(2, (r() * 3) | 0) : (r() < 0.6 ? 0 : 1), w = 0.55 + r() * 0.4, dp = 0.55 + r() * 0.4, h = (s + 1) * 0.31 + 0.05;
      const x = wx + (r() - 0.5) * 0.12, z = wz + (r() - 0.5) * 0.12, y = ground(x, z) - 0.03;
      lists[((r() * ng) | 0) * 3 + s].push([x, y, z, w, h, dp, (o.ang || 0) + (r() - 0.5) * 0.08, PAINT[(r() * PAINT.length) | 0]]);
      if (r() < 0.55) tanks.push([x + (r() - 0.5) * w * 0.5, y + h, z + (r() - 0.5) * dp * 0.5]);
    }
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color(), mats = [];
    lists.forEach((L, k) => {
      const gi = (k / 3) | 0, s = k % 3, mat = new THREE.MeshStandardMaterial({ map: tex[s].map, emissiveMap: tex[s].em[(gi + o.seed) % 3], emissive: 0xffffff, emissiveIntensity: 1, roughness: 0.92, envMapIntensity: 0.5 });
      mats.push([gi, mat]);
      if (!L.length) return;
      const im = new THREE.InstancedMesh(houseGeo(), mat, L.length);
      L.forEach(([x, y, z, w, h, dp, a, col], i) => { m4.compose(V(x, y, z), q.setFromAxisAngle(YA, a), V(w, h, dp)); im.setMatrixAt(i, m4); im.setColorAt(i, c.setHex(col)); });
      im.castShadow = im.receiveShadow = true; G.add(im);
    });
    if (tanks.length) { const ti = new THREE.InstancedMesh(tankGeo(), new THREE.MeshStandardMaterial({ color: 0x1d1e20, roughness: 0.55 }), tanks.length); tanks.forEach(([x, y, z], i) => { ti.setMatrixAt(i, m4.makeTranslation(x, y, z)); }); G.add(ti); }
    const lp = lampPoints(lamps, 0xffb15a, o.lamp || 0.32); G.add(lp);
    const pad = new THREE.Mesh(new THREE.CircleGeometry(o.r * 1.12, 48), new THREE.MeshStandardMaterial({ map: townPad(), transparent: true, roughness: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    pad.rotation.x = -Math.PI / 2; pad.rotation.z = o.ang || 0; pad.position.set(o.x, ground(o.x, o.z) + 0.04, o.z); G.add(pad);
    return { G, o, set: (lv) => { mats.forEach(([gi, m]) => (m.emissiveIntensity = typeof lv === "number" ? lv : lv[gi])); lp.material.opacity = typeof lv === "number" ? lv : (lv[0] + lv[1] + lv[2]) / 3; } };
  }

  // ---------- turbo-generator, cutaway (local: radius 1, axis along x) ----------
  const genTex = once(() => ({
    rotor: canvasTex(512, 256, (g, w, h) => {            // u = around, v = along the axis
      const r = rnd(4); g.fillStyle = "#8e949b"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 2500; i++) { g.fillStyle = r() < 0.5 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.06)"; g.fillRect(r() * w, r() * h, 4 + r() * 30, 1); }
      for (let p = 0; p < 2; p++) for (let k = 0; k < 9; k++) { const u = (p * 0.5 + 0.085 + k * 0.037) * w; g.fillStyle = "#3a3c40"; g.fillRect(u - 2, h * 0.07, w * 0.022 + 4, h * 0.86); g.fillStyle = "#a9693b"; g.fillRect(u, h * 0.07, w * 0.022, h * 0.86); g.fillStyle = "rgba(255,210,170,.25)"; g.fillRect(u, h * 0.07, 2, h * 0.86); }
    }),
    bore: canvasTex(512, 256, (g, w, h) => {             // inside of the stator: copper slots along the axis, laminations across
      g.fillStyle = "#4a4d52"; g.fillRect(0, 0, w, h);
      for (let j = 0; j < h; j += 2) { g.fillStyle = j % 4 ? "rgba(0,0,0,.18)" : "rgba(255,255,255,.06)"; g.fillRect(0, j, w, 1); }
      for (let k = 0; k < 48; k++) { const u = k / 48 * w; g.fillStyle = "#9a5f36"; g.fillRect(u, 0, w / 48 * 0.42, h); g.fillStyle = "#23252a"; g.fillRect(u + w / 48 * 0.42, 0, 2, h); }
    }),
    cut: canvasTex(512, 128, (g, w, h) => {              // section through the stator: laminations, copper bars near the bore
      g.fillStyle = "#55595f"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < w; i += 2) { g.fillStyle = i % 4 ? "rgba(0,0,0,.2)" : "rgba(255,255,255,.07)"; g.fillRect(i, 0, 1, h); }
      g.fillStyle = "#26282c"; g.fillRect(0, h * 0.62, w, h * 0.38);
      for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? "#b8743f" : "#a6663a"; g.fillRect(0, h * (0.66 + k * 0.08), w, h * 0.065); }
      g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(0, h * 0.97, w, h * 0.03);
    }),
  }));
  function genSet(paintHex) {
    const T = genTex(), G = new THREE.Group(), rotor = new THREE.Group();
    const paint = new THREE.MeshStandardMaterial({ color: paintHex || 0x55675d, metalness: 0.3, roughness: 0.42, side: THREE.DoubleSide });
    const steel = new THREE.MeshStandardMaterial({ color: 0xb4b8be, metalness: 1, roughness: 0.22 });
    const copper = new THREE.MeshStandardMaterial({ color: 0xb8713f, metalness: 1, roughness: 0.33 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x2b2d31, metalness: 0.5, roughness: 0.5 });
    const gap = Math.PI / 2, th0 = Math.PI / 5 + gap / 2, thL = TAU - gap;
    const cyl = (r1, r2, l, open, mat, ts, tl, seg) => { const g = new THREE.CylinderGeometry(r1, r2, l, seg || 72, 1, open, ts, tl); g.rotateZ(Math.PI / 2); return new THREE.Mesh(g, mat); };
    G.add(cyl(1, 1, 3.2, true, paint, th0, thL));
    const bore = cyl(0.64, 0.64, 2.7, true, new THREE.MeshStandardMaterial({ map: T.bore, metalness: 0.7, roughness: 0.4, side: THREE.DoubleSide }), th0, thL); G.add(bore);
    G.add(cyl(0.97, 0.97, 2.7, true, dark, th0, thL));
    const cutM = new THREE.MeshStandardMaterial({ map: T.cut, metalness: 0.6, roughness: 0.45, side: THREE.DoubleSide });
    for (const th of [th0, th0 + thL]) {          // the two section faces, wall (housing to bore) and copper bars
      const rh = V(0, Math.sin(th), Math.cos(th)), pl = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 0.36), cutM);
      pl.matrix.makeBasis(V(1, 0, 0), rh.clone().negate(), V(1, 0, 0).cross(rh.clone().negate())); pl.matrix.setPosition(rh.clone().multiplyScalar(0.815)); pl.matrixAutoUpdate = false; G.add(pl);
      const sh = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.06), paint); sh.matrix.makeBasis(V(1, 0, 0), rh, V(1, 0, 0).cross(rh)); sh.matrix.setPosition(rh.clone().multiplyScalar(0.985)); sh.matrixAutoUpdate = false; G.add(sh);
    }
    for (const s of [-1, 1]) {
      const ring = new THREE.RingGeometry(0.64, 1.0, 72, 1, s > 0 ? Math.PI - th0 - thL : th0, thL); ring.rotateY(s * Math.PI / 2);
      const rm = new THREE.Mesh(ring, paint); rm.position.x = s * 1.6; G.add(rm);
      const tor = new THREE.TorusGeometry(0.79, 0.11, 10, 72, thL); tor.rotateZ(s > 0 ? Math.PI - th0 - thL : th0); tor.rotateY(s * Math.PI / 2);
      const tm = new THREE.Mesh(tor, copper); tm.position.x = s * 1.42; G.add(tm);
      const tor2 = new THREE.TorusGeometry(0.71, 0.05, 8, 72, thL); tor2.rotateZ(s > 0 ? Math.PI - th0 - thL : th0); tor2.rotateY(s * Math.PI / 2);
      const tm2 = new THREE.Mesh(tor2, copper); tm2.position.x = s * 1.55; G.add(tm2);
      const ped = new THREE.Mesh(BOX, paint); ped.scale.set(0.5, 0.95, 0.85); ped.position.set(s * 2.25, -0.62, 0); G.add(ped);
      const cap = cyl(0.3, 0.3, 0.42, false, paint); cap.position.set(s * 2.25, 0, 0); G.add(cap);
    }
    // rotor: forged steel body with copper field-winding slots, polished retaining rings, shaft and coupling
    rotor.add(cyl(0.585, 0.585, 2.75, false, new THREE.MeshStandardMaterial({ map: T.rotor, metalness: 0.9, roughness: 0.3 })));
    for (const s of [-1, 1]) { const rr = cyl(0.6, 0.6, 0.26, false, steel); rr.position.x = s * 1.42; rotor.add(rr); }
    rotor.add(cyl(0.22, 0.22, 5.4, false, steel));
    const fl = cyl(0.42, 0.42, 0.12, false, steel); fl.position.x = 2.62; rotor.add(fl);
    for (let k = 0; k < 10; k++) { const b = cyl(0.035, 0.035, 0.2, false, dark, 0, TAU, 8); const a = k / 10 * TAU; b.position.set(2.62, Math.sin(a) * 0.33, Math.cos(a) * 0.33); rotor.add(b); }
    G.add(rotor);
    const ex = cyl(0.42, 0.42, 0.8, false, paint); ex.position.x = -2.9; G.add(ex);
    const plinth = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x8b8880, roughness: 0.85 })); plinth.scale.set(6.6, 0.5, 2.4); plinth.position.y = -1.32; G.add(plinth);
    G.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    return { G, rotor };
  }
  // rotor angle from a speed curve (rad/s as a function of film time): integrated numerically so it stays a pure function of t
  const spin = (ft0, ft, w) => { let a = 0; const n = Math.max(1, Math.ceil((ft - ft0) * 30)), dt = (ft - ft0) / n; for (let i = 0; i < n; i++) a += w(ft0 + (i + 0.5) * dt) * dt; return a; };

  // ---------- coal power station (local: turbine hall along x, cutaway on +z) ----------
  const cladTex = once(() => canvasTex(256, 256, (g, w, h) => { const r = rnd(8); g.fillStyle = "#8a8f94"; g.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 8) { g.fillStyle = "rgba(0,0,0,.22)"; g.fillRect(i, 0, 2, h); g.fillStyle = "rgba(255,255,255,.08)"; g.fillRect(i + 2, 0, 1, h); } for (let i = 0; i < 900; i++) { g.fillStyle = "rgba(60,50,40,.06)"; g.fillRect(r() * w, r() * h, 1 + r() * 3, 4 + r() * 30); } }));
  const winTex = once(() => canvasTex(256, 256, (g, w, h) => { const r = rnd(18); g.fillStyle = "#000"; g.fillRect(0, 0, w, h); for (let y = 12; y < h; y += 26) for (let x = 6; x < w; x += 22) if (r() < 0.09) { g.fillStyle = r() < 0.6 ? "#ffc27a" : "#ffe6c0"; g.fillRect(x, y, 4, 3); } }));
  const chimTex = once(() => canvasTex(64, 512, (g, w, h) => { const r = rnd(3); g.fillStyle = "#9a958c"; g.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { g.fillStyle = "rgba(40,35,30,.08)"; g.fillRect(r() * w, r() * h, 1 + r() * 2, 6 + r() * 40); } for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? "#c9c4bb" : "#9b3b2c"; g.fillRect(0, k * 14, w, 14); } g.fillStyle = "rgba(20,18,16,.6)"; g.fillRect(0, 0, w, 6); }));
  const smokeTex = once(() => canvasTex(128, 128, (g, w, h) => { const r = rnd(66); for (let i = 0; i < 40; i++) { const x = 64 + (r() - 0.5) * 50, y = 64 + (r() - 0.5) * 50, rr = 18 + r() * 26, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(255,255,255,.22)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); } }));
  const ctTex = once(() => canvasTex(512, 256, (g, w, h) => { const r = rnd(31); g.fillStyle = "#c8c2b8"; g.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { g.fillStyle = r() < 0.6 ? "rgba(70,62,52,.08)" : "rgba(255,255,255,.06)"; g.fillRect(r() * w, r() * h * 0.3, 1 + r() * 3, 20 + r() * 160); } for (let y = 0; y < h; y += 16) { g.fillStyle = "rgba(0,0,0,.05)"; g.fillRect(0, y, w, 1); } }));
  function station(o) {
    const G = new THREE.Group(); G.position.set(o.x, ground(o.x, o.z) - 0.05, o.z); G.rotation.y = o.rot || 0;
    const clad = new THREE.MeshStandardMaterial({ map: cladTex(), color: 0xd4d6d8, roughness: 0.55, metalness: 0.15, emissiveMap: winTex(), emissive: 0xffffff, emissiveIntensity: 0.6 });
    const cladIn = new THREE.MeshStandardMaterial({ map: cladTex(), color: 0xb4b6b8, roughness: 0.6, metalness: 0.15, side: THREE.DoubleSide });
    const conc = new THREE.MeshStandardMaterial({ color: 0x8e8a82, roughness: 0.9 }), dark = M.paint(0x2c2e31, 0.6);
    const box = (mat, x, y, z, w, h, d) => { const m = new THREE.Mesh(BOX, mat); m.scale.set(w, h, d); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; G.add(m); return m; };
    // turbine hall x -4..8, z -2.2..2.2, h 3.4; front wall and front roof cut away over x -0.8..5.6
    box(conc, 2, 0.06, 0, 12.2, 0.16, 4.5);
    box(cladIn, 2, 1.7, -2.2, 12, 3.4, 0.12); box(cladIn, -4, 1.7, 0, 0.12, 3.4, 4.4); box(cladIn, 8, 1.7, 0, 0.12, 3.4, 4.4);
    box(cladIn, -2.4, 1.7, 2.2, 3.2, 3.4, 0.12); box(cladIn, 6.8, 1.7, 2.2, 2.4, 3.4, 0.12);
    box(cladIn, 2, 3.45, -1.1, 12.2, 0.1, 2.3); box(cladIn, -2.4, 3.45, 1.1, 3.4, 0.1, 2.3); box(cladIn, 6.85, 3.45, 1.1, 2.5, 0.1, 2.3);
    for (let x = -3.5; x <= 7.6; x += 1.4) { box(steelMat(), x, 3.3, 0, 0.08, 0.16, 4.4); box(steelMat(), x, 1.7, -2.12, 0.12, 3.4, 0.08); }
    box(M.paint(0xc29a2b, 0.5), 2.6, 2.95, 0, 0.22, 0.24, 4.3);                                  // overhead crane girder
    for (let x = -3.2; x <= 7.4; x += 2.1) box(M.light(0xfff0dc), x, 3.36, 0.6, 0.6, 0.03, 0.12);   // ceiling lamps
    const pl = new THREE.PointLight(0xffe3c4, 6, 9, 1.4); pl.position.set(1.2, 2.9, 0.9); G.add(pl);
    const pl2 = new THREE.PointLight(0xffe3c4, 3, 7, 1.4); pl2.position.set(5, 2.9, 0.6); G.add(pl2);
    const gen = genSet(); gen.G.scale.setScalar(0.55); gen.G.position.set(1.0, 1.05, 0.15); G.add(gen.G);
    const lag = M.paint(0x7c8792, 0.55);
    for (const [x, w, r] of [[3.75, 1.1, 0.6], [5.1, 1.1, 0.55], [6.4, 0.8, 0.42]]) {
      box(lag, x, 0.58, 0, w, 0.9, r * 2);
      const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 32, 1, false, -Math.PI / 2, Math.PI), lag); c.rotation.z = Math.PI / 2; c.position.set(x, 1.03, 0); c.castShadow = true; G.add(c);
    }
    box(steelMat(), 4.9, 1.05, 0, 3.6, 0.09, 0.09);                                                  // shaft line through the turbines
    // boiler house, bunker bay, chimney, cooling towers, coal heaps, transformers, switchyard
    box(clad, -7, 4.6, -0.5, 5.6, 9.2, 6); box(clad, -4.9, 3.0, -0.5, 1.6, 6, 6);
    box(dark, -7, 9.4, -0.5, 5.8, 0.4, 6.2);
    const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.9, 22, 32), new THREE.MeshStandardMaterial({ map: chimTex(), roughness: 0.85 })); ch.position.set(-11.5, 11, -6); ch.castShadow = true; G.add(ch);
    const avi = [V(-11.5, 21.7, -5.35), V(-11.5, 15, -5.25)].map((p) => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), M.light(0xff3b26)); s.position.copy(p); G.add(s); return s; });
    const ctProf = []; for (let i = 0; i <= 20; i++) { const y = i / 20 * 11, u = (y - 8) / 8; ctProf.push(new THREE.Vector2(3.0 + 0.55 * u * u * 4.2 * (y < 8 ? 1 : 0.35), y)); }
    const ctGeo = new THREE.LatheGeometry(ctProf, 64), ctMat = new THREE.MeshStandardMaterial({ color: 0xb3ada3, map: ctTex(), roughness: 0.92, side: THREE.DoubleSide });
    const tops = [];
    for (const [x, z] of o.ct || [[-18, -9], [-26, -3]]) { const m = new THREE.Mesh(ctGeo, ctMat); m.position.set(x, 0, z); m.castShadow = m.receiveShadow = true; G.add(m); tops.push(V(x, 11, z)); }
    const coal = new THREE.MeshStandardMaterial({ color: 0x1b1a19, roughness: 0.95 });
    for (const [x, z, r] of [[-14, 9, 3], [-8.5, 10.5, 2.2]]) { const m = new THREE.Mesh(new THREE.ConeGeometry(r, r * 0.55, 24), coal); m.position.set(x, r * 0.27, z); G.add(m); }
    for (const z of [-1.3, 1.3]) { box(M.paint(0x4d5a52, 0.55), 9.3, 0.55, z, 1.0, 1.0, 0.9); for (let k = 0; k < 5; k++) box(dark, 9.85, 0.55, z - 0.36 + k * 0.18, 0.1, 0.8, 0.05); }
    for (let x = 10.5; x <= 14.5; x += 2) for (const z of [-2.2, 0, 2.2]) { box(steelMat(), x, 1.2, z, 0.08, 2.4, 0.08); }
    for (let x = 10.5; x <= 14.5; x += 2) box(steelMat(), x, 2.4, 0, 0.08, 0.1, 4.6);
    const lamps = []; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; lamps.push(Math.cos(a) * 11 + 1, 0.9 + (i % 3) * 0.6, Math.sin(a) * 7); }
    const lp = lampPoints(lamps, 0xffc27a, 0.4); G.add(lp);
    // steam over the cooling towers: soft puffs rising and drifting, pure function of t
    const puffs = [];
    tops.forEach((tp, ti) => { for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex(), color: o.steam || 0xc9bfb8, transparent: true, depthWrite: false, fog: true })); G.add(s); puffs.push([s, tp, i / 14, ti]); } });
    G.updateMatrixWorld(true);
    const st = {
      G, gen, avi, lights: [clad.emissiveIntensity], clad, lp, pls: [pl, pl2],
      update(ft, on) {
        on = on === undefined ? 1 : on;
        puffs.forEach(([s, tp, ph, ti]) => { const u = (ft * 0.035 + ph + ti * 0.37) % 1; s.position.set(tp.x + u * 6 + Math.sin(u * 5 + ti) * 0.6, tp.y + 0.5 + u * 9, tp.z - u * 2.5); s.scale.setScalar(3 + u * 9); s.material.opacity = 0.75 * smooth(u / 0.12) * (1 - smooth((u - 0.45) / 0.55)); s.material.rotation = ph * 6 + u; });
        const b = 0.5 + 0.5 * Math.sin(ft * 3.1) > 0.5 ? 1 : 0.15; avi.forEach((a) => (a.material.opacity = b));
        clad.emissiveIntensity = 0.6 * on; lp.material.opacity = on; pl.intensity = 6 * on; pl2.intensity = 3 * on;
      },
      world: (x, y, z) => G.localToWorld(V(x, y, z)),
    };
    return st;
  }

  // ---------- shared scene: sky, fog, sun, terrain ----------
  const terrainGeoMat = once(() => { const m = terrain(); return [m.geometry, m.material]; });
  function landscape(sky, sh) {
    const S = new THREE.Scene(), K = skyFor(sky), P = K.P;
    S.background = new THREE.Color(P.fog); S.fog = new THREE.Fog(P.fog, P.fogN, P.fogF); S.environment = K.env;
    S.add(new THREE.Mesh(K.dome.geometry, K.dome.material));
    const [tg, tm] = terrainGeoMat(), T = new THREE.Mesh(tg, tm); T.receiveShadow = true; S.add(T);
    const el = P.sunEl * Math.PI / 180, sun = new THREE.DirectionalLight(P.sunC, P.sunI);
    sun.position.set(SUN.x * Math.cos(el) * 60, Math.sin(el) * 60 + 4, SUN.z * Math.cos(el) * 60);
    if (sky === "night") sun.position.set(30, 40, 20);
    S.add(sun, sun.target, new THREE.HemisphereLight(P.hemiS, P.hemiG, P.hemiI));
    if (sh) {                    // shadows around a focus point [x,z,half-size]
      sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
      const c = sun.shadow.camera; c.left = c.bottom = -sh[2]; c.right = c.top = sh[2]; c.near = 1; c.far = 160;
      sun.target.position.set(sh[0], 0, sh[1]); sun.position.add(sun.target.position);
    }
    if (P.stars) { const st = L3.stars(5, 3000); st.material.fog = false; S.add(st); }
    S.userData.sun = sun; return S;
  }
  const pin = (text, p, op) => [text, p.x, p.y, p.z, op];
  // camera through keyframes [[t, px,py,pz, lx,ly,lz, fov?], ...]: monotone cubic per component (Fritsch-Butland tangents),
  // smooth through the keys and never overshooting between them, plus a slow drift
  function camPath(C, K, t, drift) {
    let i = 0; while (i < K.length - 2 && t > K[i + 1][0]) i++;
    const h = K[i + 1][0] - K[i][0], u = clamp((t - K[i][0]) / h, 0, 1), k1 = K[i];
    const slope = (a, j) => (K[a + 1][j] - K[a][j]) / (K[a + 1][0] - K[a][0]);
    const tan = (a, j) => { if (a <= 0) return slope(0, j); if (a >= K.length - 1) return slope(K.length - 2, j); const d0 = slope(a - 1, j), d1 = slope(a, j); return d0 * d1 <= 0 ? 0 : 2 / (1 / d0 + 1 / d1); };
    const f = (j) => { const p0 = K[i][j], p1 = K[i + 1][j], m0 = tan(i, j) * h, m1 = tan(i + 1, j) * h, u2 = u * u, u3 = u2 * u; return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * m1; };
    const d = drift === undefined ? 0.12 : drift;
    C.position.set(f(1) + d * Math.sin(t * 0.21), f(2) + d * 0.4 * Math.sin(t * 0.17 + 1), f(3) + d * Math.cos(t * 0.19));
    C.lookAt(f(4), f(5), f(6));
    if (k1[7]) { C.fov = f(7); C.updateProjectionMatrix(); }
  }

  // ---------- analog frequency meter on a control desk (metres) ----------
  const dialTex = once(() => canvasTex(512, 512, (g, w, h) => {
    const r = rnd(2); g.fillStyle = "#ece5d2"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 3000; i++) { g.fillStyle = r() < 0.5 ? "rgba(120,100,70,.035)" : "rgba(255,255,255,.05)"; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3); }
    const cx = 256, cy = 400, ang = (hz) => (hz - 50) * 45 * Math.PI / 180;
    g.strokeStyle = "#1c1c1c"; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 300, -Math.PI / 2 - Math.PI / 4 - 0.02, -Math.PI / 2 + Math.PI / 4 + 0.02); g.stroke();
    for (let k = 0; k <= 20; k++) {
      const hz = 49 + k * 0.1, a = ang(hz), L = k % 5 === 0 ? 34 : 18;
      g.lineWidth = k % 5 === 0 ? 4 : 2; g.beginPath(); g.moveTo(cx + Math.sin(a) * 300, cy - Math.cos(a) * 300); g.lineTo(cx + Math.sin(a) * (300 + L), cy - Math.cos(a) * (300 + L)); g.stroke();
    }
    g.fillStyle = "#1c1c1c"; g.font = "600 30px Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    [[49, "49"], [49.5, "49.5"], [50, "50"], [50.5, "50.5"], [51, "51"]].forEach(([hz, s]) => { const a = ang(hz); g.fillText(s, cx + Math.sin(a) * 262, cy - Math.cos(a) * 262); });
    g.strokeStyle = "#a3291f"; g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, 292, -Math.PI / 2 - 0.006, -Math.PI / 2 + 0.006); g.stroke();
    g.fillStyle = "#a3291f"; g.fillRect(cx - 2, cy - 296, 4, 26);
    g.fillStyle = "#1c1c1c"; g.font = "500 50px Georgia, serif"; g.fillText("Hz", cx, 300);
    g.font = "400 16px Arial, sans-serif"; g.fillText("CL 1.5", 70, 470); g.fillText("∩  ⎓", 440, 470);
  }));
  const deskTex = once(() => canvasTex(256, 256, (g, w, h) => { const r = rnd(61); g.fillStyle = "#d8d6cc"; g.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { g.fillStyle = r() < 0.5 ? "rgba(0,0,0,.035)" : "rgba(255,255,255,.05)"; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); } g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 2; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = "#777"; for (const [x, y] of [[14, 14], [w - 14, 14], [14, h - 14], [w - 14, h - 14]]) { g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill(); } }));
  function meterDesk() {
    const G = new THREE.Group(), grey = new THREE.MeshStandardMaterial({ color: 0xb3b0a2, roughness: 0.5, metalness: 0.1, map: deskTex(), bumpMap: deskTex(), bumpScale: 0.3 }), black = new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.35, metalness: 0.2 });
    const box = (mat, x, y, z, w, h, d, rx) => { const m = new THREE.Mesh(BOX, mat); m.scale.set(w, h, d); m.position.set(x, y, z); if (rx) m.rotation.x = rx; m.castShadow = m.receiveShadow = true; G.add(m); return m; };
    box(grey, 0, 1.25, -0.24, 0.8, 0.72, 0.12); for (const x of [-0.28, 0.28]) { box(black, x, 0.84, -0.24, 0.05, 0.1, 0.08); box(black, x, 0.79, -0.24, 0.09, 0.03, 0.12); }   // clamped onto the gallery rail box(black, 0, 1.53, -0.175, 0.36, 0.05, 0.01);
    box(black, 0, 1.3, -0.17, 0.3, 0.3, 0.04);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.262, 0.262), new THREE.MeshStandardMaterial({ map: dialTex(), roughness: 0.6 })); face.position.set(0, 1.3, -0.148); G.add(face);
    const piv = new THREE.Group(); piv.position.set(0, 1.3 - 0.131 + 0.0745, -0.144); G.add(piv);    // pivot sits low on the dial
    const nd = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 })); nd.scale.set(0.0042, 0.17, 0.0015); nd.position.y = 0.075; piv.add(nd);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 16), black); cap.rotation.x = Math.PI / 2; cap.position.set(0, 1.3 - 0.131 + 0.0745, -0.142); G.add(cap);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(0.262, 0.262), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.07, roughness: 0.04, metalness: 0, envMapIntensity: 2.5, depthWrite: false })); gl.position.set(0, 1.3, -0.138); G.add(gl);
    for (const [x, c] of [[-0.3, 0x3d8a4a], [-0.24, 0xb02c22], [0.28, 0xc9a12b]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 16), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.6, roughness: 0.3 })); l.rotation.x = Math.PI / 2; l.position.set(x, 1.48, -0.17); G.add(l); }
    return { G, setHz: (hz) => (piv.rotation.z = -clamp(hz - 50, -1.05, 1.05) * Math.PI / 4), dialP: V(0, 1.3, -0.14) };
  }

  const plateTex = once(() => { const t = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#8d9296"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 ? 8 : 0; x < w; x += 16) { g.save(); g.translate(x + 4, y + 4); g.rotate(((x + y) / 16) % 2 ? 0.8 : -0.8); g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(-5, -1.2, 10, 2.4); g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(-5, 1.2, 10, 1); g.restore(); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6); return t; });
  // ---------- turbine hall interior (metres; the group is scaled 0.1 into the landscape) ----------
  function hall(night) {
    const G = new THREE.Group();
    const floorT = canvasTex(1024, 1024, (g, w, h) => {
      const r = rnd(41); g.fillStyle = "#6e7871"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 9000; i++) { g.fillStyle = r() < 0.5 ? "rgba(0,0,0,.05)" : "rgba(255,255,255,.04)"; g.fillRect(r() * w, r() * h, 2 + r() * 10, 2 + r() * 10); }
      g.strokeStyle = "rgba(30,34,30,.5)"; g.lineWidth = 2; for (let i = 0; i <= w; i += 128) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); }
      g.fillStyle = "#c9a52e"; g.fillRect(0, 700, w, 10); g.fillRect(0, 870, w, 10);
    });
    floorT.anisotropy = 8;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(32, 18), new THREE.MeshStandardMaterial({ map: floorT, color: 0x8a8f8a, roughness: 0.28, metalness: 0.05, envMapIntensity: 0.8 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; G.add(floor);
    const clad = new THREE.MeshStandardMaterial({ map: cladTex(), color: 0x6a6e74, roughness: 0.6, metalness: 0.15, side: THREE.DoubleSide });
    const steel = M.paint(0x5c6670, 0.5), frame = M.paint(0x3a3f45, 0.5), railM = M.paint(0x30353a, 0.45);
    const box = (mat, x, y, z, w, h, d) => { const m = new THREE.Mesh(BOX, mat); m.scale.set(w, h, d); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; G.add(m); return m; };
    // back wall: tall windows between columns (the landscape is outside)
    box(clad, 0, 1.5, -9, 32, 3, 0.3); box(clad, 0, 13.2, -9, 32, 2.4, 0.3);
    for (let x = -16; x <= 16; x += 4) { box(steel, x, 7, -8.7, 0.6, 14, 0.6); box(frame, x, 7.2, -9, 0.18, 9, 0.16); }
    for (let x = -14; x <= 14; x += 4) { box(frame, x, 7.2, -9, 0.08, 9, 0.1); }
    for (const y of [3, 6, 9, 12]) box(frame, 0, y, -9, 32, 0.12, 0.14);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(32, 9), new THREE.MeshStandardMaterial({ color: night ? 0x8899aa : 0xcfd8e0, transparent: true, opacity: night ? 0.05 : 0.08, roughness: 0.05, metalness: 0, envMapIntensity: 1.5, depthWrite: false }));
    glass.position.set(0, 7.5, -9.02); G.add(glass);
    for (const s of [-1, 1]) { box(clad, s * 16, 7, 0, 0.3, 14, 18); for (let z = -6; z <= 6; z += 4) box(steel, s * 15.7, 7, z, 0.6, 14, 0.6); }
    box(clad, 0, 14.2, 0, 32.4, 0.3, 18.4);
    for (let x = -14; x <= 14; x += 4) { box(steel, x, 13.4, 0, 0.35, 1.0, 18); box(steel, x, 12.6, 0, 0.2, 0.2, 18); }
    box(M.paint(0xc29a2b, 0.5), -1, 11.6, 0, 1.2, 1.3, 18); box(M.paint(0xc29a2b, 0.5), 3.5, 11.6, 0, 1.2, 1.3, 18);   // crane girders
    box(M.paint(0x8a8f94, 0.5), 1.2, 10.8, 0, 3.6, 0.6, 1.6);
    const lampM = M.light(0xfff2df), lights = [];
    for (let x = -12; x <= 12; x += 6) for (const z of [-4, 3]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.6, 0.35, 20), M.paint(0x30343a, 0.5)); l.position.set(x, 12.9, z); G.add(l); const d = new THREE.Mesh(new THREE.CircleGeometry(0.42, 20), lampM); d.rotation.x = Math.PI / 2; d.position.set(x, 12.72, z); G.add(d); }
    for (const [x, z, i] of [[-6, -2, 1], [4, 2, 0.9], [10, -3, 0.7], [12, 5, 0.6]]) { const p = new THREE.PointLight(0xffe7cc, i * (night ? 2.6 : 1.6), 4.2, 1.2); p.position.set(x, 11.5, z); G.add(p); lights.push(p); }
    // the machine: generator (cutaway) + turbine casings + exciter on a raised deck
    const gen = genSet(0x4f6359); gen.G.scale.setScalar(2.2); gen.G.position.set(-4.2, 3.2, -3.2); G.add(gen.G);
    const deck = M.paint(0x50544f, 0.6); box(deck, 4, 0.5, -3.2, 26, 1.0, 7.5);
    const lag = M.paint(0x2f353c, 0.55);
    for (const [x, w, r] of [[4.4, 3.6, 2.2], [8.6, 3.6, 2.0], [12.4, 2.8, 1.5]]) {
      box(lag, x, 2.2, -3.2, w, 2.4, r * 2);
      const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 40, 1, false, -Math.PI / 2, Math.PI), lag); c.rotation.z = Math.PI / 2; c.position.set(x, 3.4, -3.2); c.castShadow = true; G.add(c);
      for (const s of [-1, 1]) box(frame, x + s * w / 2, 3.2, -3.2, 0.12, 2.6, r * 2 + 0.1);
    }
    box(M.steel(), 6.8, 3.2, -3.2, 12, 0.3, 0.3);
    for (let x = -12; x <= 14; x += 2) box(railM, x, 1.55, 0.6, 0.06, 1.1, 0.06);  // deck railing
    box(railM, 1, 2.05, 0.6, 26, 0.06, 0.06); box(railM, 1, 1.6, 0.6, 26, 0.05, 0.05);
    box(M.paint(0x3d6f8f, 0.5), -12, 1.2, 5, 2.2, 2.4, 1.2); box(M.paint(0x3d6f8f, 0.5), -9.5, 0.9, 5.5, 1.6, 1.8, 1.0);   // pump skids, pipework
    for (const [y, c] of [[1.4, 0x6a7f5e], [1.9, 0x8f4b3a]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 30, 16), M.paint(c, 0.45)); p.rotation.z = Math.PI / 2; p.position.set(0, y, -8.3); G.add(p); }
    // operators' gallery on the right: steel deck, railing, the frequency meter desk
    box(new THREE.MeshStandardMaterial({ map: plateTex(), color: 0x6c7176, metalness: 0.6, roughness: 0.55 }), 12.5, 4.85, 5.5, 7, 0.3, 7); for (const [x, z] of [[9.2, 2.2], [15.8, 2.2], [9.2, 8.8]]) box(steel, x, 2.4, z, 0.3, 4.8, 0.3);
    box(railM, 12.5, 5.95, 2.1, 7, 0.06, 0.06); box(railM, 9.05, 5.95, 5.5, 0.06, 0.06, 7); box(railM, 12.5, 5.5, 2.1, 7, 0.05, 0.05);
    for (let x = 9.1; x <= 15.9; x += 1.1) box(railM, x, 5.5, 2.1, 0.05, 0.95, 0.05);
    for (let z = 2.1; z <= 8.9; z += 1.1) box(railM, 9.05, 5.5, z, 0.05, 0.95, 0.05);
    const desk = meterDesk(); desk.G.position.set(11.0, 5.15, 2.4); desk.G.rotation.y = 0.88; G.add(desk.G);
    const sp = new THREE.SpotLight(0xffe9d0, 2.2, 0, 0.75, 0.6, 1); sp.position.set(1, 13.5, 3); sp.target.position.set(-3, 0, -3); sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); sp.shadow.bias = -0.0004; G.add(sp, sp.target);
    const dl = new THREE.PointLight(0xffefdc, night ? 0.9 : 0.5, 1.2, 1.0); dl.position.set(12.6, 8.2, 5.4); G.add(dl);
    return { G, gen, desk, lights };
  }

  // ---------- grid / tug + end: inside the turbine hall; towns through the windows switch on and off ----------
  function buildHall(o, night) {
    const S = landscape(night ? "night" : "dusk"), C = cam(32);
    const H0 = hall(night); H0.G.scale.setScalar(0.1); H0.G.position.set(0, ground(0, 0) + 0.01, 0); S.add(H0.G); H0.G.updateMatrixWorld(true);
    const W = (x, y, z) => H0.G.localToWorld(V(x, y, z));
    const towns = [town({ x: -18, z: -17, r: 8, seed: 21, tall: true, ang: 0.2, lamp: 0.4 }), town({ x: -36, z: -36, r: 10, seed: 22, tall: true, ang: -0.4, lamp: 0.5 }), town({ x: -52, z: -20, r: 11, seed: 23, ang: 0.6, lamp: 0.55 }), town({ x: -22, z: -56, r: 12, seed: 24, ang: 0.1, lamp: 0.6 }), town({ x: -64, z: -60, r: 12, seed: 25, ang: -0.2, lamp: 0.6 })];
    towns.forEach((t) => S.add(t.G));
    const LB = line([[-6, -1.2], [-20, -5], [-42, -13]], 9), LC = line([[-1.2, -7], [-7, -24], [-15, -46]], 10);
    S.add(lineSet([LB, LC]));
    S.add(trees(8, 500, [[0, 0, 6], [-18, -17, 10], [-36, -36, 12], [-52, -20, 13], [-22, -56, 14], [-64, -60, 14]], 8, 160));
    const T0 = o.T0;
    let hz, lv, K;
    if (!night) {
      hz = (ft) => 50 + 0.005 * Math.sin(ft * 2.3) + KF([[570.4, 0], [573.8, -0.22], [576.3, -0.21], [578.0, 0.2], [580.6, 0.02], [584.6, 0.0], [586.8, -0.2], [587.9, -0.19], [589.4, 0.18], [591.1, 0.08]], ft);
      lv = (ft, k) => { const d = k * 0.35; return KF([[570.2 + d, 0.42], [571.6 + d, 1.0], [576.3 + d, 1.0], [577.2 + d, 0.3], [580.5, 0.5], [584.6 + d, 0.5], [585.6 + d, 1.0], [587.9 + d, 1.0], [588.8 + d, 0.32]], ft); };
      K = [[0, -5.6, 6.5, 1.5, -4.0, 3.4, -3.2, 34], [5, -1.8, 6.8, 2.6, -3.3, 3.6, -3.4, 34], [9.5, 5.5, 7.1, 5.4, -2.8, 4.0, -5.4, 34],
        [12.3, 12.3, 6.65, 5.0, -2.0, 2.0, -7.6, 33], [17.5, 12.55, 6.68, 5.3, -1.6, 2.1, -7.8, 33], [23.1, 12.85, 6.72, 5.65, -2.4, 3.2, -7.75, 33]];   // rotor slots -> along the machine -> the meter
    } else {
      hz = (ft) => 50 + KF([[764.1, 0.13], [766.0, 0.1], [767.8, -0.05], [769.4, 0.02], [770.6, 0.0]], ft) + 0.003 * Math.sin(ft * 2.1);
      lv = () => 0.85;
      K = [[0, -2.8, 6.5, 2.3, -3.8, 3.6, -3.2, 33], [3.8, 4.5, 7.0, 5.3, -2.4, 3.6, -5.2, 33], [7.8, 12.3, 6.65, 5.0, -0.8, 2.6, -7.6, 33]];
    }
    const w = (ft) => 2.1 * (1 + (hz(ft) - 50) * 1.6), fP = H0.desk.G.localToWorld(V(-0.5, 1.5, -0.2));
    return (t) => {
      const ft = T0 + t;
      const Kw = K.map((k) => { const p = W(k[1], k[2], k[3]), l = W(k[4], k[5], k[6]); return [k[0], p.x, p.y, p.z, l.x, l.y, l.z, k[7]]; });
      camPath(C, Kw, t, 0.004);
      H0.gen.rotor.rotation.x = spin(T0, ft, w);
      H0.desk.setHz(hz(ft));
      towns.forEach((tw, i) => tw.set([lv(ft, (i * 3) % 7 * 0.15), lv(ft, ((i * 3 + 1) % 7) * 0.15), lv(ft, ((i * 3 + 2) % 7) * 0.15)]));
      const pins = night ? [] : [pin("Generator", W(-5.2, 5.9, -2.0), fade(ft, 568.3, 573.8, 0.6)), pin("Frequency", fP, fade(ft, 579.0, 591.1, 0.7) * (1 - fade(ft, 580.2, 584.8, 0.4)))];
      return [S, C, pins];
    };
  }

  // ---------- grid / cascade: one line overloads and trips, its load shifts, generators drop out, a region goes dark ----------
  function spark(pos) {                    // a short arc flash and a few falling sparks at a tower
    const G = new THREE.Group(), fl = glowSprite(0xffc890, 2, 0); fl.position.copy(pos); G.add(fl);
    const n = 14, r = rnd(Math.round(pos.x * 7 + pos.z * 13) >>> 0), vel = [];
    for (let i = 0; i < n; i++) vel.push(V((r() - 0.5) * 1.4, 0.4 + r() * 1.2, (r() - 0.5) * 1.4));
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ map: softDot(), color: 0xffc98a, size: 0.3, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false })); G.add(pts);
    G.userData.set = (dt) => {               // dt = seconds since the trip
      const a = dt >= 0 && dt < 0.6 ? Math.exp(-dt * 7) * (0.7 + 0.3 * Math.sin(dt * 90)) : 0;
      fl.material.opacity = a * 0.55; fl.scale.setScalar(0.8 + 1.8 * a);
      const p = g.attributes.position;
      for (let i = 0; i < n; i++) { const tt = clamp(dt, 0, 1.4); p.setXYZ(i, pos.x + vel[i].x * tt, pos.y + vel[i].y * tt - 2.2 * tt * tt, pos.z + vel[i].z * tt); }
      p.needsUpdate = true; pts.material.opacity = dt >= 0 && dt < 1.4 ? 1 - dt / 1.4 : 0;
    };
    return G;
  }
  const oneWin = once(() => canvasTex(128, 128, (g) => { g.fillStyle = "#000"; g.fillRect(0, 0, 128, 128); g.fillStyle = "#ffc98a"; g.fillRect(58, 72, 18, 24); }));   // one bulb, one window
  function buildCascade(o) {
    const S = landscape("blue"), C = cam(32);
    const P1 = station({ x: -42, z: -32, rot: 0.35, steam: 0x8e8c92 }), P2 = station({ x: 46, z: -48, rot: -0.5, steam: 0x8e8c92 });
    S.add(P1.G, P2.G);
    const TW = [
      town({ x: 0, z: 12, r: 7, seed: 31, tall: true, ang: 0.1 , lamp: 0.55 }), town({ x: -24, z: -6, r: 6, seed: 32, ang: 0.5 , lamp: 0.55 }), town({ x: 25, z: 0, r: 6.5, seed: 33, ang: -0.3 , lamp: 0.55 }),
      town({ x: -10, z: -38, r: 7, seed: 34, ang: 0.25 , lamp: 0.55 }), town({ x: 30, z: -24, r: 5, seed: 35, ang: -0.6 , lamp: 0.55 }), town({ x: -46, z: 8, r: 5, seed: 36, ang: 0.8 , lamp: 0.55 }),
      town({ x: 54, z: 8, r: 5.5, seed: 37, ang: 0.2 , lamp: 0.55 }), town({ x: -30, z: -125, r: 12, seed: 38, ang: 0.4 , lamp: 0.55 }), town({ x: 40, z: -140, r: 12, seed: 39, ang: -0.2 , lamp: 0.55 })];
    TW.forEach((t) => S.add(t.G));
    const L = {
      A: line([[-33, -24], [-18, -8], [-4, 6.5]], 9), B: line([[-35, -22], [-29, -12], [-25, -7]], 8), E: line([[-9, -32], [-3, -14], [0, 5]], 9),
      C: line([[39, -42], [31, -18], [26, -5]], 9), D: line([[20, 1], [9, 9], [5.5, 10.5]], 8), F: line([[41, -46], [33, -29]], 8), G: line([[29, -20], [26, -6]], 8),
      H: line([[-29, -3], [-41, 6]], 8), I: line([[31, 2], [49, 7]], 9), J: line([[-44, -25], [-46, 2]], 9), K: line([[-36, -34], [-16, -38]], 9)};
    S.add(lineSet(Object.values(L)));
    const R = {}; for (const k in L) { R[k] = ribbon(L[k].mid, 1.3); S.add(R[k]); }
    // the hero house of the opening (one window, one bulb)
    const ht = houseTex()[1], hm = new THREE.Mesh(houseGeo(), new THREE.MeshStandardMaterial({ map: ht.map, color: 0xe6dcc6, emissiveMap: oneWin(), emissive: 0xffffff, emissiveIntensity: 1, roughness: 0.9 }));
    hm.scale.set(0.95, 0.67, 0.8); hm.position.set(7.4, ground(7.4, 18.2) - 0.03, 18.2); hm.rotation.y = 0.55; S.add(hm);
    const tank = new THREE.Mesh(tankGeo(), new THREE.MeshStandardMaterial({ color: 0x1d1e20, roughness: 0.55 })); tank.position.set(7.3, hm.position.y + 0.67, 18.1); S.add(tank);
    S.add(trees(12, 900, [[0, 12, 8.5], [-24, -6, 7.5], [25, 0, 8], [-10, -38, 8.5], [30, -24, 6.5], [-46, 8, 6.5], [54, 8, 7], [-42, -32, 30], [46, -48, 30], [7.4, 18.2, 2]], 4, 170));
    // timeline (film seconds): overload ramps, trips, station drop-outs, town blackouts
    const trip = { A: 617.1, B: 625.6, E: 626.6, K: 631.9, J: 632.2, H: 633.0, C: 635.8, D: 636.5, F: 638.4, G: 638.75, I: 639.1 };
    const over = { A: [612.2, 616.6], B: [622.0, 625.1], E: [622.3, 626.1], C: [633.4, 635.3], D: [634.2, 636.0] };
    const sparkAt = {}; for (const k of ["A", "B", "E", "C", "D", "F", "G", "I"]) { const T = L[k].T; sparkAt[k] = T[T.length - 1].a[1]; }
    const SP = {}; for (const k in sparkAt) { SP[k] = spark(sparkAt[k]); S.add(SP[k]); }
    const townOff = [636.7, 633.2, 638.6, 632.6, 638.9, 633.6, 639.2, 1e9, 1e9];
    const stOff = [631.7, 638.5];
    const K = [
      [0, 11.0, 0.75, 23.4, 6.6, 0.45, 17.0, 30], [3.3, 12.0, 1.8, 25.6, 5.6, 0.8, 14.5, 32], [7.5, 18, 8, 38, 0, 1, 0, 32], [11, 24, 13, 44, -8, 0, -14, 32],
      [16, 12, 11, 30, -16, 1, -8, 32], [21, 14, 14, 36, -12, 0, -12, 32], [27.5, 20, 18, 48, -2, 2, -24, 32], [36, 28, 21, 54, 2, 3, -30, 32], [45.6, 44, 20, 40, 0, 3, -34, 32]];
    const aMid = L.A.mid[(L.A.mid.length * 0.45) | 0];
    return (t) => {
      const ft = o.T0 + t;
      camPath(C, K, t, t < 4 ? 0.02 : 0.25);
      P1.update(ft, 1 - dim(ft, stOff[0], 1.0, 41)); P2.update(ft, 1 - dim(ft, stOff[1], 1.0, 42));
      P1.gen.rotor.rotation.x = spin(o.T0, ft, (f) => 2.4 * (1 - 0.9 * seg(f, stOff[0], stOff[0] + 6)));
      P2.gen.rotor.rotation.x = spin(o.T0, ft, (f) => 2.4 * (1 - 0.9 * seg(f, stOff[1], stOff[1] + 6)));
      TW.forEach((tw, i) => { const d = 1 - dim(ft, townOff[i], 1.3, 50 + i), fl = ft > townOff[i] - 3 && ft < townOff[i] ? 0.85 + 0.15 * Math.sin(ft * 23 + i) : 1; tw.set(1.9 * d * fl); });
      hm.material.emissiveIntensity = 1.6 * (1 - dim(ft, townOff[0], 1.3, 50));
      for (const k in L) {
        const ov = over[k] ? seg(ft, over[k][0], over[k][1]) : 0, live = trip[k] ? 1 - dim(ft, trip[k], 0.35, k.charCodeAt(0)) : 1;
        const flick = ov > 0 && live > 0 ? 0.9 + 0.1 * Math.sin(ft * 17 + k.charCodeAt(0)) : 1;
        L[k].mat.emissiveIntensity = 1.6 * ov * live * flick;
        R[k].userData.set(C, (s) => { const e = live * (0.018 + 0.01 * Math.sin(s * 0.4 - ft * 1.3) + 0.34 * ov * flick); return [e, e * (0.78 - 0.25 * ov), e * (0.55 - 0.3 * ov)]; });
        if (SP[k]) SP[k].userData.set(ft - trip[k]);
      }
      const pins = [pin("Power line", aMid, fade(ft, 612.4, 618.2, 0.6)), pin("Power station", P1.world(3, 4.2, 0), fade(ft, 628.0, 632.8, 0.6))];
      return [S, C, pins];
    };
  }

  // ---------- grid / mine: cutaway of a coal-mine shaft; a generator truck arrives, the cage lights up and climbs ----------
  const strataTex = once(() => canvasTex(1024, 1024, (g, w, h) => {      // covers x -12..12, y -14..2 (units)
    const r = rnd(71), Y = (y) => (2 - y) / 16 * h, X = (x) => (x + 12) / 24 * w;
    const bands = [[2, 0, "#3b3127"], [0, -0.7, "#5a4632"], [-0.7, -2.6, "#9a8262"], [-2.6, -3.4, "#7a6650"], [-3.4, -5.6, "#a88f6c"], [-5.6, -7.6, "#3b3e44"], [-7.6, -8.7, "#34363b"], [-8.7, -10.9, "#121212"], [-10.9, -14, "#76705f"]];
    bands.forEach(([a, b, c], k) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, Y(a)); for (let x = 0; x <= w; x += 16) g.lineTo(x, Y(a) + (k ? (fbm(x * 0.01, k * 3.1, 3) - 0.5) * 18 : 0)); for (let x = w; x >= 0; x -= 16) g.lineTo(x, Y(b) + (fbm(x * 0.01, (k + 1) * 3.1, 3) - 0.5) * 18); g.closePath(); g.fill(); });
    for (let i = 0; i < 26000; i++) { const x = r() * w, y = r() * h; g.fillStyle = r() < 0.5 ? "rgba(0,0,0,.12)" : "rgba(255,240,220,.06)"; g.fillRect(x, y, 1 + r() * 5, 1 + r() * 2); }
    for (let k = 0; k < 60; k++) { g.strokeStyle = r() < 0.5 ? "rgba(0,0,0,.18)" : "rgba(255,240,220,.07)"; g.lineWidth = 1 + r() * 1.5; g.beginPath(); let y = r() * h, x = 0; g.moveTo(x, y); while (x < w) { x += 20 + r() * 40; y += (r() - 0.5) * 6; g.lineTo(x, y); } g.stroke(); }
    for (let i = 0; i < 500; i++) { g.fillStyle = "rgba(255,255,255,.05)"; g.beginPath(); g.arc(r() * w, Y(-8.7) + r() * (Y(-10.9) - Y(-8.7)), 1 + r() * 3, 0, TAU); g.fill(); }   // glints in the coal
    g.fillStyle = "rgba(20,30,15,.5)"; for (let i = 0; i < 300; i++) g.fillRect(r() * w, Y(0.05) - r() * 6, 2, 4 + r() * 6);
  }));
  function truck() {
    const G = new THREE.Group(), white = M.paint(0xd9d6cc, 0.45), dark = M.paint(0x24262a, 0.6), green = M.paint(0x3e5a46, 0.5);
    const box = (mat, x, y, z, w, h, d) => { const m = new THREE.Mesh(BOX, mat); m.scale.set(w, h, d); m.position.set(x, y, z); m.castShadow = true; G.add(m); return m; };
    box(dark, 0, 0.16, 0, 1.5, 0.08, 0.36); box(white, 0.6, 0.34, 0, 0.36, 0.34, 0.36); box(M.glass(0x223344, 0.6), 0.78, 0.4, 0, 0.02, 0.15, 0.3);
    box(green, -0.2, 0.36, 0, 1.0, 0.38, 0.36); for (let k = 0; k < 7; k++) box(dark, -0.6 + k * 0.13, 0.38, 0.182, 0.06, 0.22, 0.004);
    box(dark, -0.62, 0.6, -0.08, 0.06, 0.08, 0.06);
    for (const x of [-0.5, -0.25, 0.6]) for (const z of [-0.19, 0.19]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16), dark); wh.rotation.x = Math.PI / 2; wh.position.set(x, 0.08, z); G.add(wh); }
    const hl = []; for (const z of [-0.12, 0.12]) { const s = glowSprite(0xfff1d8, 0.35, 0.9); s.position.set(0.79, 0.26, z); G.add(s); hl.push(s); }
    const spot = new THREE.SpotLight(0xfff0d8, 3, 6, 0.5, 0.6, 1.2); spot.position.set(0.8, 0.28, 0); spot.target.position.set(4, -0.2, 0); G.add(spot, spot.target);
    return G;
  }
  function buildMine(o) {
    const S = new THREE.Scene(), K0 = skyFor("night"), C = cam(30);
    S.background = new THREE.Color(0x050608); S.environment = K0.env;
    const dome = new THREE.Mesh(K0.dome.geometry, K0.dome.material); S.add(dome);
    const st = L3.stars(5, 3000); st.material.fog = false; S.add(st);
    S.add(new THREE.HemisphereLight(0x4a5a7a, 0x1a1714, 1.25));
    const key = new THREE.DirectionalLight(0xc4d2ea, 2.1); key.position.set(-14, 5, 7); S.add(key);
    const warm = new THREE.DirectionalLight(0xffd2a0, 0.18); warm.position.set(10, -2, 10); S.add(warm);
    // the cut face with openings for the shaft and the gallery
    const SX0 = 2.35, SX1 = 3.65, GY0 = -10.6, GY1 = -9.1, GX0 = -8.5, BOT = -10.75;
    const fs = new THREE.Shape(); fs.moveTo(-40, -30); fs.lineTo(40, -30); fs.lineTo(40, 0); fs.lineTo(SX1, 0); fs.lineTo(SX1, BOT); fs.lineTo(GX0, BOT); fs.lineTo(GX0, GY1 + 0.1); fs.quadraticCurveTo(GX0 + 0.1, GY1 + 0.25, GX0 + 0.4, GY1 + 0.25);
    fs.lineTo(SX0, GY1 + 0.25); fs.lineTo(SX0, 0); fs.lineTo(-40, 0); fs.closePath();
    const fg = new THREE.ShapeGeometry(fs, 8), uv = fg.attributes.uv, pp = fg.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (pp.getX(i) + 12) / 24, (pp.getY(i) + 14) / 16);
    const stx = strataTex(); stx.wrapS = THREE.MirroredRepeatWrapping;
    const rockM = new THREE.MeshStandardMaterial({ map: stx, bumpMap: stx, bumpScale: 4, roughness: 0.92 });
    S.add(new THREE.Mesh(fg, rockM));
    const inner = new THREE.MeshStandardMaterial({ color: 0x5a554d, roughness: 0.95, side: THREE.DoubleSide }), lining = new THREE.MeshStandardMaterial({ color: 0x8b877e, roughness: 0.9, side: THREE.DoubleSide });
    const plane = (mat, w, h, x, y, z, ry, rx) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); if (ry) m.rotation.y = ry; if (rx) m.rotation.x = rx; S.add(m); return m; };
    plane(lining, SX1 - SX0, -BOT, (SX0 + SX1) / 2, BOT / 2, -1.3);                          // shaft back wall
    plane(lining, 1.3, -BOT, SX0, BOT / 2, -0.65, Math.PI / 2); plane(lining, 1.3, -BOT, SX1, BOT / 2, -0.65, Math.PI / 2);
    plane(inner, SX0 - GX0, GY1 + 0.25 - BOT, (GX0 + SX0) / 2, (GY1 + 0.25 + BOT) / 2, -1.2);  // gallery back, roof, floor
    plane(inner, SX1 - GX0, 1.2, (GX0 + SX1) / 2, GY1 + 0.25, -0.6, 0, Math.PI / 2); plane(new THREE.MeshStandardMaterial({ color: 0x2c2925, roughness: 1, side: THREE.DoubleSide }), SX1 - GX0, 1.3, (GX0 + SX1) / 2, BOT, -0.6, 0, Math.PI / 2);
    plane(inner, 1.2, GY1 + 0.25 - BOT, GX0, (GY1 + 0.25 + BOT) / 2, -0.6, Math.PI / 2);
    const steel = M.paint(0x4a4e54, 0.5), timber = M.matte(0x5b4630);
    for (let x = GX0 + 0.6; x < SX0 - 0.2; x += 1.0) { const a = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.04, 6, 20, Math.PI), steel); a.position.set(x, BOT + 0.85, -0.6); a.rotation.y = Math.PI / 2; a.scale.set(1, 1.15, 1); S.add(a); }
    for (const z of [-0.85, -0.35]) { const r2 = new THREE.Mesh(BOX, M.steel()); r2.scale.set(SX1 - GX0, 0.03, 0.03); r2.position.set((GX0 + SX1) / 2, BOT + 0.03, z); S.add(r2); }
    for (let x = GX0 + 0.3; x < SX1; x += 0.35) { const sl = new THREE.Mesh(BOX, timber); sl.scale.set(0.08, 0.03, 0.75); sl.position.set(x, BOT + 0.01, -0.6); S.add(sl); }
    for (const x of [SX0 + 0.12, SX1 - 0.12]) { const gd = new THREE.Mesh(BOX, timber); gd.scale.set(0.06, -BOT + 6, 0.06); gd.position.set(x, (BOT + 6) / 2, -0.95); S.add(gd); }
    // surface slab behind the cut, the road, the headframe and winding house
    const soil = new THREE.Mesh(new THREE.PlaneGeometry(120, 60), new THREE.MeshStandardMaterial({ color: 0x2a2621, roughness: 1 })); soil.rotation.x = -Math.PI / 2; soil.position.set(0, 0, -30); S.add(soil);
    const top = new THREE.Mesh(new THREE.BoxGeometry(80, 0.06, 0.06), rockM); top.position.set(0, 0, 0); S.add(top);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(40, 1.1), new THREE.MeshStandardMaterial({ color: 0x3d3a36, roughness: 0.9 })); road.rotation.x = -Math.PI / 2; road.position.set(20, 0.01, -1.9); S.add(road);
    const HX = 3.0, hf = [];
    for (const z of [-0.35, -1.65]) { hf.push(beam(V(HX - 0.9, 0, z), V(HX - 0.15, 6.2, z), 0.12)); hf.push(beam(V(HX + 0.9, 0, z), V(HX + 0.15, 6.2, z), 0.12)); hf.push(beam(V(HX + 2.6, 0, z), V(HX + 0.2, 6.0, z), 0.12)); }
    for (const y of [1.5, 3.0, 4.5]) for (const z of [-0.35, -1.65]) { const w2 = lerp(0.9, 0.15, y / 6.2); hf.push(beam(V(HX - w2, y, z), V(HX + w2, y, z), 0.07)); }
    for (const y of [1.5, 3.0, 4.5, 6.1]) hf.push(beam(V(HX - lerp(0.9, 0.15, y / 6.2), y, -0.35), V(HX - lerp(0.9, 0.15, y / 6.2), y, -1.65), 0.06));
    hf.push(boxAt(HX, 6.2, -1.0, 0.8, 0.12, 1.5));
    const hfm = new THREE.Mesh(merge(hf), M.paint(0x6d4538, 0.55)); S.add(hfm);
    const wheels = [];
    for (const z of [-0.7, -1.3]) {
      const wg = new THREE.Group(); wg.position.set(HX, 6.55, z);
      wg.add(new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.04, 8, 32), M.steel()));
      for (let k = 0; k < 6; k++) { const sp = new THREE.Mesh(BOX, M.steel()); sp.scale.set(0.03, 1.1, 0.03); sp.rotation.z = k / 6 * Math.PI; wg.add(sp); }
      S.add(wg); wheels.push(wg);
    }
    const whM = new THREE.MeshStandardMaterial({ map: cladTex(), color: 0x9a7e6a, roughness: 0.7, emissiveMap: winTex(), emissive: 0xffffff, emissiveIntensity: 0 });
    const wh = new THREE.Mesh(BOX, whM); wh.scale.set(2.6, 1.8, 2.2); wh.position.set(9.2, 0.9, -3.2); S.add(wh);
    const roofM = new THREE.Mesh(BOX, M.paint(0x3a3c40, 0.6)); roofM.scale.set(2.8, 0.12, 2.4); roofM.position.set(9.2, 1.86, -3.2); S.add(roofM);
    const ropeM = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.6, roughness: 0.5 });
    const rope1 = new THREE.Mesh(tubes([[V(HX + 0.55, 6.55, -1.0), V(8.4, 1.6, -2.6)]], 0.025), ropeM); S.add(rope1);
    const rope = new THREE.Mesh(BOX, ropeM); S.add(rope);
    const yard = []; for (let i = 0; i < 10; i++) yard.push(-6 + i * 1.9 + (i % 2) * 0.3, 1.2, -4 - (i % 3) * 2.5);
    const yl = lampPoints(yard, 0xffbf73, 0.55); S.add(yl);
    const flood = []; [V(HX, 6.3, -0.3), V(9.2, 2.0, -2.0)].forEach((p) => { const s = glowSprite(0xffe7c4, 0.8, 0); s.position.copy(p); S.add(s); flood.push(s); });
    const fl = new THREE.SpotLight(0xffe2bc, 0, 16, 0.7, 0.7, 1.0); fl.position.set(HX + 0.5, 6.4, 1.5); fl.target.position.set(HX + 2, 0, -1.5); S.add(fl, fl.target);
    // cage, miners' lamps, generator truck
    const cage = new THREE.Group(), cageMat = new THREE.MeshStandardMaterial({ color: 0x6d7278, metalness: 0.7, roughness: 0.45 }), meshMat = new THREE.MeshStandardMaterial({ color: 0x3d4146, metalness: 0.6, roughness: 0.5, transparent: true, opacity: 0.55 });
    const cb = (mat, x, y, z, w, h, d) => { const m = new THREE.Mesh(BOX, mat); m.scale.set(w, h, d); m.position.set(x, y, z); cage.add(m); };
    cb(cageMat, 0, 0, 0, 1.0, 0.06, 0.9); cb(cageMat, 0, 1.1, 0, 1.0, 0.06, 0.9);
    for (const [x, z] of [[-0.48, -0.42], [0.48, -0.42], [-0.48, 0.42], [0.48, 0.42]]) cb(cageMat, x, 0.55, z, 0.05, 1.1, 0.05);
    cb(meshMat, 0, 0.55, -0.43, 0.96, 1.0, 0.01); cb(meshMat, 0.48, 0.55, 0, 0.01, 1.0, 0.84); cb(cageMat, 0, 0.22, 0.43, 0.96, 0.04, 0.01); cb(cageMat, 0, 0.6, 0.43, 0.96, 0.04, 0.01);
    const cageLamp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.1), M.light(0xfff2dc, 0)); cageLamp.position.set(0, 1.05, 0); cage.add(cageLamp);
    const cageL = new THREE.PointLight(0xffecd2, 0, 2.6, 1.3); cageL.position.set(0, 0.9, 0.3); cage.add(cageL);
    cage.position.set((SX0 + SX1) / 2, BOT + 0.04, -0.62); S.add(cage);
    const lamps = []; const lr = rnd(91);
    for (let i = 0; i < 9; i++) { const s = glowSprite(0xffd49a, 0.34, 0.95); S.add(s); lamps.push({ s, x0: SX0 - 0.6 - i * 0.55 - lr() * 0.25, z0: -0.35 - lr() * 0.5, ph: lr() * 6, y0: BOT + 0.95 + lr() * 0.12 }); }
    const lampL = new THREE.PointLight(0xffe2b8, 1.4, 4.5, 1.3); S.add(lampL);
    const T = truck(); S.add(T);
    const pinsP = { cage: V((SX0 + SX1) / 2, BOT + 1.2, -0.6) };
    const K = [[0, 3.8, -6.8, 19.5, -3.6, -7.1, -0.6, 30], [2.3, 4.3, -6.6, 19.7, -3.2, -6.95, -0.6, 30], [4.8, 9.0, -3.2, 25.5, 1.3, -3.9, -0.8, 30], [7.2, 9.8, -2.9, 25.4, 2.0, -3.6, -0.8, 30], [9.0, 10.2, -1.0, 23.2, 2.4, -2.4, -0.8, 30], [10.1, 10.4, -0.5, 23.0, 2.7, -1.9, -0.8, 30]];
    return (t) => {
      const ft = o.T0 + t;
      camPath(C, K, t, 0.06);
      const pw = seg(ft, 703.1, 703.6), lift = smooth(clamp((ft - 704.5) / 3.3, 0, 1)), cy = BOT + 0.04 + lift * (-BOT + 0.15);
      cage.position.y = cy; cageLamp.material.opacity = pw; cageL.intensity = 1.6 * pw;
      whM.emissiveIntensity = 0.9 * pw; yl.material.opacity = 0.25 + 0.75 * pw; flood.forEach((s) => (s.material.opacity = 0.7 * pw)); fl.intensity = 6 * pw;
      wheels.forEach((w, i) => (w.rotation.z = (i ? 1 : -1) * lift * (-BOT) / 0.55));
      rope.scale.set(0.025, 6.55 - (cy + 1.1), 0.025); rope.position.set(HX - 0.0, (6.55 + cy + 1.1) / 2, -0.62);
      const tx = lerp(15, 7.4, smooth(clamp((ft - 700.7) / 2.3, 0, 1)) * 0.6 + 0.4 * clamp((ft - 700.7) / 2.3, 0, 1));
      T.position.set(tx, 0.02, -1.9); T.rotation.y = Math.PI;
      let lx = 0, ly = 0, lz = 0;
      lamps.forEach((L, i) => {
        const go = smooth(clamp((ft - 703.6 - i * 0.09) / 0.8, 0, 1));
        const bx = L.x0 + 0.03 * Math.sin(ft * 0.9 + L.ph), by = L.y0 + 0.02 * Math.sin(ft * 1.7 + L.ph * 2), bz = L.z0;
        const cx = cage.position.x - 0.3 + (i % 3) * 0.3, cz = -0.9 + ((i / 3) | 0) * 0.28;
        L.s.position.set(lerp(bx, cx, go), lerp(by, cy + 0.85 + 0.02 * Math.sin(ft + i), go), lerp(bz, cz, go)); lx += L.s.position.x / 9; ly += L.s.position.y / 9; lz += L.s.position.z / 9;
        L.s.material.opacity = 0.9 * (ft > 707.6 ? 1 - 0.4 * seg(ft, 707.6, 708.2) : 1);
      });
      lampL.position.set(lx, ly + 0.2, 0.2);
      return [S, C, [pin("Lift cage", V(cage.position.x, cy + 1.2, -0.6), fade(ft, 698.6, 702.4, 0.6)), pin("Generator truck", V(T.position.x - 1.6, 0.7, -1.9), fade(ft, 702.6, 705.4, 0.5))]];
    };
  }

  // ---------- small props ----------
  function phoneBattery() {
    const G = new THREE.Group(), w = 0.24, h = 0.36, r0 = 0.018, s = new THREE.Shape();
    s.moveTo(-w / 2 + r0, -h / 2); s.lineTo(w / 2 - r0, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r0); s.lineTo(w / 2, h / 2 - r0); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r0, h / 2);
    s.lineTo(-w / 2 + r0, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r0); s.lineTo(-w / 2, -h / 2 + r0); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r0, -h / 2);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.018, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 3, curveSegments: 6 }); g.translate(0, 0, -0.009);
    const foil = canvasTex(256, 256, (c, W2, H2) => { const r = rnd(14); c.fillStyle = "#b7babd"; c.fillRect(0, 0, W2, H2); for (let i = 0; i < 260; i++) { c.strokeStyle = r() < 0.5 ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.12)"; c.lineWidth = 1 + r() * 2; c.beginPath(); const x = r() * W2, y = r() * H2; c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 60, y + (r() - 0.5) * 20); c.stroke(); } });
    foil.wrapS = foil.wrapT = THREE.RepeatWrapping; foil.repeat.set(4, 4);
    const body = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: foil, bumpMap: foil, bumpScale: 0.6, metalness: 0.85, roughness: 0.3 })); body.castShadow = true; G.add(body);
    const label = canvasTex(256, 320, (c, W2, H2) => {
      c.fillStyle = "#16171a"; c.fillRect(0, 0, W2, H2); c.fillStyle = "#cfd2d6";
      c.fillRect(22, 26, 150, 14); c.fillRect(22, 52, 96, 9); c.fillRect(22, 70, 120, 9); c.fillRect(22, 88, 70, 9);
      for (let i = 0; i < 9; i++) c.fillRect(22, 130 + i * 13, 120 + ((i * 37) % 80), 5);
      c.strokeStyle = "#cfd2d6"; c.lineWidth = 3; c.strokeRect(22, 262, 34, 34); c.strokeRect(68, 262, 34, 34); c.beginPath(); c.moveTo(126, 296); c.lineTo(143, 262); c.lineTo(160, 296); c.closePath(); c.stroke();
      for (let i = 0; i < 26; i++) c.fillRect(190 + (i % 2) * 2, 30 + i * 4, i % 3 ? 2 : 4, 3);
    });
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.25), new THREE.MeshStandardMaterial({ map: label, roughness: 0.45, metalness: 0.1 })); lab.position.set(0, -0.03, 0.0135); G.add(lab);
    const pcb = new THREE.Mesh(BOX, M.paint(0x1d3326, 0.5)); pcb.scale.set(0.2, 0.026, 0.016); pcb.position.set(0, h / 2 + 0.013, 0); G.add(pcb);
    for (const x of [-0.06, 0.06]) { const tb = new THREE.Mesh(BOX, M.steel()); tb.scale.set(0.03, 0.012, 0.004); tb.position.set(x, h / 2 + 0.004, 0.006); G.add(tb); }
    const flex = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0xb8692a, roughness: 0.35, metalness: 0.2 })); flex.scale.set(0.035, 0.06, 0.002); flex.position.set(0.03, h / 2 + 0.05, 0.004); flex.rotation.x = -0.4; G.add(flex);
    const con = new THREE.Mesh(BOX, M.brass()); con.scale.set(0.04, 0.012, 0.006); con.position.set(0.03, h / 2 + 0.078, -0.007); G.add(con);
    return G;
  }
  function bess(x, z, rot) {             // battery-storage yard: rows of white containers with cooling units
    const G = new THREE.Group(), n = 12, tex = canvasTex(128, 64, (c, W2, H2) => { c.fillStyle = "#e3e2dc"; c.fillRect(0, 0, W2, H2); for (let i = 0; i < W2; i += 4) { c.fillStyle = "rgba(0,0,0,.12)"; c.fillRect(i, 0, 1, H2); } c.fillStyle = "#8a8f94"; c.fillRect(10, 18, 12, 30); c.fillRect(106, 18, 12, 30); c.fillStyle = "#3c7a4e"; c.fillRect(56, 8, 16, 4); });
    const cm = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.2 }), n), um = new THREE.InstancedMesh(BOX, M.paint(0x6c7176, 0.5), n);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromAxisAngle(YA, rot);
    for (let i = 0; i < n; i++) { const a = (i % 4) * 1.45 - 2.2, b = ((i / 4) | 0) * 0.55 - 0.55, wx = x + a * Math.cos(rot) + b * Math.sin(rot), wz = z - a * Math.sin(rot) + b * Math.cos(rot), y = ground(wx, wz);
      m4.compose(V(wx, y + 0.14, wz), q, V(1.22, 0.26, 0.25)); cm.setMatrixAt(i, m4); m4.compose(V(wx, y + 0.3, wz), q, V(0.3, 0.06, 0.18)); um.setMatrixAt(i, m4); }
    cm.castShadow = cm.receiveShadow = true; G.add(cm, um);
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 2.4), new THREE.MeshStandardMaterial({ color: 0x77736a, roughness: 0.95 })); pad.rotation.x = -Math.PI / 2; pad.rotation.z = rot; pad.position.set(x, ground(x, z) + 0.03, z); G.add(pad);
    return G;
  }

  // ---------- grid / store: the battery, the city, the station; then energy pulses out along the lines ----------
  const BX = 9.2, BZ = 13.2;
  function buildStore(o) {
    const S = landscape("dusk"), C = cam(32);
    const st = station({ x: 0, z: -40, rot: 0 }); S.add(st.G);
    const city = town({ x: -3, z: 4, r: 8.5, seed: 3, tall: true, ang: 0.12 }), east = town({ x: 50, z: -18, r: 6, seed: 7, ang: -0.3 }), west = town({ x: -48, z: -26, r: 6.5, seed: 11, ang: 0.5 });
    [city, east, west].forEach((t) => S.add(t.G));
    const LA = line([[13, -37], [13.5, -28], [10.5, -17], [8, -8], [5.4, -1.5]], 9), LB = line([[15, -41], [26, -37], [37, -29], [45, -22]], 9), LC = line([[13.5, -43], [4, -52], [-14, -52], [-30, -44], [-42, -31]], 9);
    S.add(lineSet([LA, LB, LC]));
    const ribs = [LA, LB, LC].map((l) => { const r = ribbon(l.mid, 2.2); S.add(r); return r; });
    const bat = phoneBattery(); bat.position.set(BX, ground(BX, BZ) + 0.18 + 0.004, BZ); bat.rotation.set(-0.02, 0.72, 0.05); S.add(bat);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.4), new THREE.MeshBasicMaterial({ map: softDot(), color: 0x000000, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.NormalBlending })); sh.material.alphaMap = softDot(); sh.rotation.x = -Math.PI / 2; sh.rotation.z = 0.72; sh.position.set(BX, ground(BX, BZ) + 0.01, BZ); S.add(sh);
    const peb = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.02, 0), M.matte(0x6e6658), 70), rr = rnd(9), m4 = new THREE.Matrix4();
    for (let i = 0; i < 70; i++) { const a = rr() * TAU, d = 0.12 + rr() * 0.9, x = BX + Math.cos(a) * d, z = BZ + Math.sin(a) * d, s = 0.4 + rr() * 1.4; m4.compose(V(x, ground(x, z), z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rr() * 3, rr() * 3, 0)), V(s, s * 0.6, s)); peb.setMatrixAt(i, m4); }
    S.add(peb);
    S.add(bess(10.5, -3.2, 0.35));
    S.add(trees(5, 700, [[-3, 4, 11], [BX, BZ, 3], [0, -40, 30], [50, -18, 8], [-48, -26, 9], [10.5, -3.2, 4.5]], 6, 160));
    const K = [
      [0, 24, 7.5, 26, 0, 1, -16, 32], [4.4, 15, 2.6, 20, 4, 0.6, -2, 32], [8.2, 10.15, 0.4, 14.45, 8.4, 0.34, 11.9, 32], [11.6, 9.95, 0.34, 14.1, 8.45, 0.33, 11.95, 32],
      [16.5, 14.5, 4.6, 21, 4.5, 0.3, 4, 32], [19.6, -6, 7.5, 5, 6, 1.4, -28, 30], [24, -2, 5.6, -7, 3.5, 1.3, -38, 25], [28.2, 4, 4.4, -18, 1.8, 1.2, -40, 23]];
    const genP = st.world(1.0, 1.5, 0.5), batP = V(BX, ground(BX, BZ) + 0.4, BZ), bessP = V(10.5, 0.45, -3.2);
    return (t) => {
      const ft = o.T0 + t;
      camPath(C, K, t);
      st.update(ft); st.gen.rotor.rotation.x = ft * 2.4;
      [city, east, west].forEach((tw, i) => tw.set(0.95 + 0.05 * Math.sin(ft * 0.7 + i)));
      const on = seg(ft, 554.9, 556.2);
      ribs.forEach((rb, k) => rb.userData.set(C, (s) => {               // broad swells of energy travelling outward, never beads on a wire
        const ph = s / 7.5 - ft * 0.9 - k * 0.3, b = Math.pow(0.5 + 0.5 * Math.cos(ph * TAU), 4), e = on * (0.05 + 0.42 * b) * smooth(s / 3);
        return [e * 1.0, e * 0.82, e * 0.58];
      }));
      return [S, C, [pin("Phone battery", batP, fade(ft, 541.0, 546.6, 0.6)), pin("Grid batteries", bessP, fade(ft, 551.0, 554.9, 0.6)), pin("Generator", genP, fade(ft, 559.0, 563.9, 0.6))]];
    };
  }

  LABK.grid = (o) => {
    if (o.mode === "cascade") return buildCascade(o);
    if (o.mode === "mine") return buildMine(o);
    if (o.mode === "tug") return buildHall(o, false);
    if (o.mode === "end") return buildHall(o, true);
    return buildStore(o);
  };
})();
