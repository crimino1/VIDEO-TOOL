/* Black Holes film: the view through an amateur telescope's eyepiece at night.
   LABK.eyepiece modes: "open" (3.60-6.50) stars + faint Milky Way; "m87" (1310.20-1312.00) faint elliptical galaxy,
   then a push-in through the eyepiece circle that hands over to eht/orange (galaxy centred, same size and M87 pin at 1312.00).
   Pure function of film time ft = o.T0 + t. */
(function () {
  const { THREE, seg, smooth, clamp, lerp, rnd, canvasTex, glowSprite, cam } = L3;
  const TAU = Math.PI * 2;
  const once = (f) => { let v; return () => v || (v = f()); };
  const PL = 9.945;            // sky plane distance from the camera at the hand-over (= eht/orange camera distance at 1312.00)

  // stars: soft gaussian points, slow atmospheric twinkle (< 2 Hz), raw (not tone-mapped) output
  function starField(seed, n, band) {
    const r = rnd(seed), pos = [], col = [], att = [];
    const add = (x, y, b, ph, c) => { pos.push(x, y, 0); col.push(...c); att.push(b, ph); };
    const tint = () => { const k = r(); return k < 0.14 ? [1, 0.8, 0.6] : k < 0.4 ? [1, 0.93, 0.83] : k < 0.86 ? [0.95, 0.97, 1] : [0.8, 0.87, 1]; };
    for (let i = 0; i < n; i++) add((r() - 0.5) * 50, (r() - 0.5) * 30, Math.pow(r(), 3.7), r(), tint());
    if (band) for (let i = 0; i < band; i++) {   // unresolved faint stars crowding along the Milky Way
      const u = (r() - 0.5) * 56, g = (r() + r() + r() - 1.5) * 2.4;
      add(u * 0.87 - g * 0.5, u * 0.5 + g * 0.87 - 1.5, 0.05 * Math.pow(r(), 2), r(), tint());
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setAttribute("bp", new THREE.Float32BufferAttribute(att, 2));
    return new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, k: { value: 1 } }, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
      vertexShader: "attribute vec3 color; attribute vec2 bp; uniform float time; varying vec3 vC; varying float vS;\nvoid main(){ float b=bp.x, ph=bp.y; float tw=1.0+(0.12+0.25*b)*sin(time*6.2832*(0.6+1.1*ph)+ph*40.0)*(0.6+0.4*sin(time*2.3+ph*17.0)); float s=1.7+7.5*pow(b,1.3); vS=s; vC=color*(0.28+1.6*b)*tw; gl_PointSize=s; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader: "uniform float k; varying vec3 vC; varying float vS;\nvoid main(){ vec2 q=gl_PointCoord-0.5; float d2=dot(q,q)*4.0; float a=exp(-d2*(vS<3.0?3.0:9.0))+0.18*exp(-d2*2.5)*step(3.0,vS); gl_FragColor=vec4(vC*a*k,1.0); }",
    }));
  }
  // faint Milky Way smudge: clumpy band with a dark lane
  const mwTex = once(() => canvasTex(1024, 512, (g, w, h) => {
    const r = rnd(83); g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      const x = r() * w, off = (r() + r() + r() - 1.5) * h * 0.22, y = h / 2 + off + 30 * Math.sin(x / w * 5), s = 8 + r() * 46, a = 0.05 * (1 - Math.abs(off) / (h * 0.36));
      const gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, `rgba(${215 + r() * 40 | 0},${210 + r() * 30 | 0},${200 + r() * 40 | 0},${Math.max(a, 0)})`); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - s, y - s, 2 * s, 2 * s);
    }
    g.globalCompositeOperation = "multiply";
    for (let i = 0; i < 500; i++) { const x = r() * w, y = h / 2 - 6 + 18 * Math.sin(x / w * 7 + 1) + (r() - 0.5) * 20, s = 6 + r() * 22; const gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, "rgba(60,60,60,1)"); gr.addColorStop(1, "rgba(255,255,255,1)"); g.fillStyle = gr; g.fillRect(x - s, y - s, 2 * s, 2 * s); }
  }));
  // M87 as in eht/orange (same profile so the hand-over matches): de Vaucouleurs glow, faint jet
  const galTex = once(() => canvasTex(512, 512, (g, w, h) => {
    const id = g.createImageData(w, h), d = id.data, sm = (p) => { p = clamp(p, 0, 1); return p * p * (3 - 2 * p); };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dx = (x + 0.5) / w - 0.5, dy = ((y + 0.5) / h - 0.5) / 0.86, rr = Math.hypot(dx, dy) / 0.5;
      let v = Math.exp(-7.67 * (Math.pow(rr / 0.2 + 1e-4, 0.25) - 1)) / 2140;
      v = clamp(v, 0, 1) * Math.pow(1 - sm(rr), 3);
      const i = (y * w + x) * 4, k = Math.pow(v, 0.2);
      d[i] = 255; d[i + 1] = 238 - 18 * (1 - k); d[i + 2] = 214 - 40 * (1 - k); d[i + 3] = clamp(255 * 1.5 * k, 0, 255);
    }
    g.putImageData(id, 0, 0);
    g.translate(w / 2, h / 2); g.rotate(-0.42);
    for (let i = 0; i < 40; i++) { const s = i / 40; g.fillStyle = `rgba(205,222,255,${0.05 * (1 - s)})`; g.beginPath(); g.ellipse(14 + s * 84, 0, 5 + 3 * s, 2.2, 0, 0, TAU); g.fill(); }
  }));
  // eyepiece field stop: clip-space quad, black outside radius R (frame-height units), soft edge, faint colour fringe, sky glow inside
  function maskQuad() {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms: { R: { value: 0.35 }, soft: { value: 0.012 }, ring: { value: 1 }, sky: { value: 1 } }, transparent: true, depthTest: false, depthWrite: false,
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,   // premultiplied: rgb is added, alpha darkens
      vertexShader: "varying vec2 vP; void main(){ vP=vec2(position.x*0.8889, position.y*0.5); gl_Position=vec4(position.xy,0.0,1.0); }",
      fragmentShader: "uniform float R; uniform float soft; uniform float ring; uniform float sky; varying vec2 vP;\nvoid main(){ float r=length(vP); float outA=smoothstep(R-soft, R+soft*0.5, r); float vig=0.3*smoothstep(R*0.25, R*1.02, r)*smoothstep(R*0.25, R*1.02, r); float a=clamp(max(outA, vig),0.0,1.0);\n vec3 fr=vec3(0.55,0.32,0.2)*exp(-pow((r-R-0.6*soft)/(0.5*soft+0.002),2.0)) + vec3(0.16,0.26,0.5)*exp(-pow((r-R+1.4*soft)/(0.6*soft+0.002),2.0));\n vec3 c=fr*0.11*ring + vec3(0.010,0.012,0.018)*sky*(1.0-outA)*(1.0-vig);\n gl_FragColor=vec4(c, a); }",
    }));
    m.renderOrder = 999; return m;
  }

  LABK.eyepiece = (o) => {
    const m87 = o.mode === "m87", S = new THREE.Scene(); S.background = new THREE.Color(0x000000);
    const C = cam(32), sky = new THREE.Group(); sky.position.z = -PL; S.add(sky);
    const stars = starField(m87 ? 87 : 36, m87 ? 2300 : 2900, m87 ? 0 : 9000); sky.add(stars);
    let mw = null, gal = null, core = null, gcs = null;
    if (!m87) {
      mw = new THREE.Mesh(new THREE.PlaneGeometry(64, 32), new THREE.MeshBasicMaterial({ map: mwTex(), transparent: true, opacity: 0.55, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, color: 0xb8b4ac }));
      mw.rotation.z = 0.52; mw.position.set(-2, -1.5, 0); sky.add(mw);
    } else {
      gal = new THREE.Sprite(new THREE.SpriteMaterial({ map: galTex(), transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); gal.scale.setScalar(1.9 * 1.28); sky.add(gal);
      core = glowSprite(0xfff0dc, 0.09 * 1.28, 0.75); core.material.depthTest = false; sky.add(core);
      // M87's globular clusters: same seed/profile as eht/orange's cloud so the 1312.00 cut matches
      const r = rnd(5), p = new Float32Array(900 * 3), gss = () => (r() + r() + r() + r() - 2) * 0.87, sg = 0.45 * 1.28;
      for (let i = 0; i < 900; i++) p.set([gss() * sg, gss() * sg * 0.86, gss() * sg * 0.3], i * 3);
      const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.BufferAttribute(p, 3));
      gcs = new THREE.Points(gg, new THREE.PointsMaterial({ color: 0xffe2c4, size: 1.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); sky.add(gcs);
    }
    const mask = maskQuad(); S.add(mask);
    const U = mask.material.uniforms, D0 = 2.7;
    return (t) => {
      const ft = o.T0 + t;
      stars.material.uniforms.time.value = ft;
      let L, grow = 0;
      if (!m87) {
        // telescope tracking: slow diagonal drift and a very slow creep in
        L = Math.log(D0) - 0.035 * t;
        sky.position.x = 1.5 - 0.42 * t; sky.position.y = -0.5 + 0.18 * t; sky.rotation.z = 0.05 - 0.016 * t;
      } else {
        // 1310.9: push in through the eyepiece toward the galaxy core; galaxy glides to exact centre by 1312.00
        const v0 = -0.08, base = Math.log(D0) + v0 * 1.8, s = clamp((ft - 1310.9) / 1.1, 0, 1);
        L = Math.log(D0) + v0 * (ft - 1310.2) - base * s * s * (3 - 2 * s);
        grow = Math.log(D0) + v0 * 0.7 - L;
        const left = Math.max(0, 1312.0 - ft);
        sky.position.x = 0.22 * left; sky.position.y = -0.1 * left;
        gal.material.opacity = lerp(0.8, 1, seg(ft, 1310.9, 1311.9)); core.material.opacity = lerp(0.35, 0.75, seg(ft, 1310.9, 1311.9)); gcs.material.opacity = 0.3 * seg(ft, 1311.0, 1311.95);
      }
      const D = PL * Math.exp(L);
      C.position.set(0, 0, D - PL); C.lookAt(0, 0, -PL); C.updateProjectionMatrix();
      const R = 0.35 * Math.exp(1.4 * grow);
      U.R.value = R; U.soft.value = 0.012 * Math.pow(R / 0.35, 1.6); U.ring.value = 1 - smooth((R - 0.4) / 0.5); U.sky.value = 1 - smooth((R - 0.4) / 0.6);
      mask.visible = R < 1.3;
      stars.material.uniforms.k.value = m87 ? lerp(1, 0.75, smooth(grow / 1.5)) : 1;
      const pins = [];
      if (m87) { const op = seg(ft, 1310.6, 1311.1) * (1 - 0.1 * seg(ft, 1311.6, 1312.0)); pins.push(["M87", sky.position.x + 0.22, sky.position.y + 0.14, -PL, op]); }
      return [S, C, pins];
    };
  };
})();
