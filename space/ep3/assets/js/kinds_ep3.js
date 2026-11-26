/* EP3 kinds: black holes. Loaded after space.js + kinds_ep2.js; uses window.SPK.
   The hero is K.bh: a full-screen ray tracer of Schwarzschild light paths (units: Schwarzschild radius = 1)
   with a thin accretion disk (Keplerian swirl, Doppler beaming, gravitational redshift), optional jets and a lensed sky. */
(function () {
  const { THREE, K, W, H, D2R, rnd, lerp, clamp, smooth, ease, V, KF, tex } = window.SPK;

  const BH_VS = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;
  const BH_FS = `
  precision highp float;
  uniform vec2 res; uniform vec3 camPos; uniform mat3 camRot; uniform float tanHalf; uniform float time;
  uniform sampler2D sky; uniform float skyK; uniform float skyRot;
  uniform vec3 diskN; uniform float diskIn; uniform float diskOut; uniform float diskK; uniform float diskTemp; uniform float dopK;
  uniform float jetK; uniform float exposure; uniform float horizonGlow; uniform float bhOn; uniform float spinK;
  uniform vec3 tint; uniform float shiftX; uniform float shiftY; uniform float aa;
  uniform vec3 starDir; uniform float starK; uniform vec3 starCol;
  uniform vec3 compPos; uniform float compR; uniform vec3 compCol;
  varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
  float fbm(vec2 p){ float a=0.5, s=0.; for(int i=0;i<5;i++){ s+=a*noise(p); p*=2.03; a*=0.5; } return s; }
  vec3 blackbody(float t){ // cool deep orange -> amber -> white-hot -> faint blue
    vec3 c = mix(vec3(0.75, 0.10, 0.01), vec3(1.0, 0.33, 0.04), smoothstep(0.05, 0.35, t));
    c = mix(c, vec3(1.0, 0.62, 0.22), smoothstep(0.35, 0.75, t));
    c = mix(c, vec3(1.0, 0.93, 0.80), smoothstep(0.70, 1.10, t));
    c = mix(c, vec3(0.86, 0.91, 1.0), smoothstep(1.10, 1.60, t));
    return c; }
  vec3 skyCol(vec3 d){
    float u = atan(d.z, d.x)/6.2831853 + 0.5 + skyRot; float v = acos(clamp(d.y,-1.,1.))/3.1415926;
    vec3 c = pow(texture2D(sky, vec2(u, v)).rgb, vec3(2.2))*skyK;
    float cs = dot(d, starDir); c += starCol*starK*(exp(-(1.0-cs)*9.0e5) + 0.06*exp(-(1.0-cs)*6.0e4));
    return c; }
  vec3 trace(vec2 fc){
    vec2 uv = (fc - 0.5*res - vec2(shiftX, shiftY))/res.y;
    vec3 dir = normalize(camRot*vec3(uv*2.0*tanHalf, -1.0));
    vec3 p = camPos, v = dir;
    vec3 col = vec3(0.); float trans = 1.;
    if (bhOn < 0.5) return skyCol(dir);
    vec3 hv = cross(p, v); float h2 = dot(hv, hv);
    bool escaped = false; float rmin = 1e9; float cmin = 1e9; bool hitComp = false;
    for (int i = 0; i < 520; i++) {
      float r = length(p); rmin = min(rmin, r);
      if (r < 1.0) break;
      float dt = clamp(0.045*r*r/(r+2.0), 0.012, 2.5);
      vec3 acc = -1.5*h2*p/pow(r, 5.0);
      vec3 vn = v + acc*dt; vec3 pn = p + vn*dt;
      // accretion disk crossing
      float s0 = dot(p, diskN), s1 = dot(pn, diskN);
      if (diskK > 0.0 && s0*s1 < 0.0) {
        vec3 q = mix(p, pn, s0/(s0-s1)); float rq = length(q);
        if (rq > diskIn && rq < diskOut) {
          vec3 e1 = normalize(cross(diskN, abs(diskN.y) < 0.9 ? vec3(0,1,0) : vec3(1,0,0)));
          vec3 e2 = cross(diskN, e1);
          float ang = atan(dot(q, e2), dot(q, e1));
          float om = pow(rq, -1.5)*1.6;                   // Keplerian swirl
          float lr = log(rq);
          float tw = (ang + 3.14159265)/6.2831853, sw = om*time;
          float nA = fbm(vec2(lr*7.0, (ang - sw)*2.2))*0.75 + 0.25*fbm(vec2(lr*21.0, (ang - sw)*7.0));
          float nB = fbm(vec2(lr*7.0, (ang - 6.2831853 - sw)*2.2))*0.75 + 0.25*fbm(vec2(lr*21.0, (ang - 6.2831853 - sw)*7.0));
          float n = mix(nA, nB, tw);   // seamless across the +-pi cut
          float rings = 0.5 + 0.5*sin(lr*46.0 + n*16.0 + fbm(vec2(lr*3.0 + cos(ang)*1.6, sin(ang)*1.6))*9.0);
          float n2 = clamp(n*(0.7 + 0.4*rings), 0.0, 1.2);
          float x = diskIn/rq;
          float temp = pow(x, 0.75)*pow(max(1.0 - sqrt(x), 0.0), 0.25)*diskTemp*2.0;
          // Doppler: orbital velocity (units of c) along +phi
          vec3 u = normalize(cross(diskN, q)) * sqrt(0.5/rq) * spinK;
          float beta = length(u); float gam = 1.0/sqrt(1.0 - beta*beta);
          float D = 1.0/(gam*(1.0 + dot(u, normalize(v))));
          float gr = sqrt(max(1.0 - 1.0/rq, 0.0));
          float boost = pow(clamp(mix(1.0, D, dopK)*gr, 0.2, 1.7), 3.0);
          float edge = smoothstep(diskIn, diskIn*1.25, rq) * (1.0 - smoothstep(diskOut*0.65, diskOut, rq));
          float a = clamp(edge*(0.12 + 1.05*n2), 0.0, 1.0)*0.9;
          vec3 c = blackbody(temp*mix(1.0, D, dopK*0.5)) * (0.2 + 1.9*n2*n2) * temp * boost * diskK * tint;
          col += trans*c*a*1.3; trans *= (1.0 - a);
          if (trans < 0.02) break;
        }
      }
      if (compR > 0.0) { vec3 dc = pn - compPos; float dd = length(dc); cmin = min(cmin, dd); if (dd < compR) {
          vec3 nrm = dc/dd; float mu = clamp(dot(nrm, -normalize(vn)), 0.0, 1.0);
          float gran = 0.88 + 0.24*fbm(vec2(atan(nrm.z, nrm.x)*6.0, nrm.y*9.0) + time*0.05);
          col += trans*compCol*(0.25 + 1.6*pow(mu, 0.5))*gran*1.8; trans = 0.0; hitComp = true; break; } }
      // relativistic jets along the disk axis
      if (jetK > 0.0) {
        float z = dot(pn, diskN); vec3 rad = pn - z*diskN; float d2 = dot(rad, rad);
        float az = abs(z), w = 0.16 + 0.03*az;
        float knots = 0.55 + 0.45*noise(vec2(az*0.55 - time*2.6, 0.0)) * (0.7 + 0.3*noise(vec2(az*2.1 - time*5.0, 3.0)));
        float core = exp(-d2/(w*w)), sheath = exp(-d2/(9.0*w*w));
        vec3 jc = mix(vec3(0.45, 0.62, 1.0), vec3(0.92, 0.95, 1.0), core);
        col += trans * jc * jetK * (1.3*core + 0.18*sheath) * knots * min(dt, 0.6) * 0.45 / (1.0 + az*0.02) * smoothstep(1.4, 3.0, az);
      }
      p = pn; v = vn;
      if (r > 80.0 && dot(p, v) > 0.0) { escaped = true; break; }
    }
    if (escaped) col += trans*skyCol(normalize(v));
    // faint photon-ring glow hugging the shadow
    col += trans*vec3(1.0, 0.8, 0.6)*horizonGlow*exp(-pow((rmin-1.5)*6.0, 2.0))*0.25;
    if (compR > 0.0 && !hitComp) col += compCol*0.45*exp(-max(cmin - compR, 0.0)/(0.1*compR));
    return col;
  }
  void main(){
    vec3 col;
    if (aa > 1.5) { col = 0.25*(trace(gl_FragCoord.xy + vec2(-0.25, -0.25)) + trace(gl_FragCoord.xy + vec2(0.25, -0.25)) + trace(gl_FragCoord.xy + vec2(-0.25, 0.25)) + trace(gl_FragCoord.xy + vec2(0.25, 0.25))); }
    else col = trace(gl_FragCoord.xy);
    // hue-preserving tone map: compress luminance, keep colour ratios (avoids clipped-red yellowing)
    float L = dot(col, vec3(0.2126,0.7152,0.0722)) + 1e-6; float Lt = 1.0 - exp(-L*exposure);
    col = col*(Lt/L); float mx = max(col.r, max(col.g, col.b)); if (mx > 1.0) col = mix(col/mx, vec3(1.0), clamp((mx-1.0)*0.35, 0.0, 1.0));
    gl_FragColor = vec4(pow(col, vec3(1.0/2.2)), 1.0);
  }`;

  // camera helper: orbit around the hole; el is measured from the disk plane
  function bhCam(dist, el, az, roll, look) {
    const e = el * D2R, a = az * D2R;
    const pos = new THREE.Vector3(dist * Math.cos(e) * Math.sin(a), dist * Math.sin(e), dist * Math.cos(e) * Math.cos(a));
    const tgt = look ? new THREE.Vector3(...look) : new THREE.Vector3();
    const f = tgt.sub(pos).normalize();
    let up = new THREE.Vector3(0, 1, 0);
    const rgt = new THREE.Vector3().crossVectors(f, up).normalize(); up = new THREE.Vector3().crossVectors(rgt, f).normalize();
    if (roll) { const q = new THREE.Quaternion().setFromAxisAngle(f, roll * D2R); rgt.applyQuaternion(q); up.applyQuaternion(q); }
    const m = new THREE.Matrix3().set(rgt.x, up.x, -f.x, rgt.y, up.y, -f.y, rgt.z, up.z, -f.z);
    return [pos, m];
  }

  // K.bh options: dist, el, az, roll (K-able), fov, disk (0..1), diskIn/diskOut, temp, dop, jet, sky, exposure, spin, tint, shiftX (screen px)
  K.bh = (o) => {
    const S = new THREE.Scene(), C = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const st = tex(o.sky || "8k_stars_milky_way.jpg", true); st.wrapS = THREE.RepeatWrapping; st.minFilter = THREE.LinearFilter;
    const U = {
      res: { value: new THREE.Vector2(W, H) }, camPos: { value: new THREE.Vector3() }, camRot: { value: new THREE.Matrix3() }, tanHalf: { value: Math.tan((o.fov || 40) * D2R / 2) },
      time: { value: 0 }, sky: { value: st }, skyK: { value: o.skyK !== undefined ? o.skyK : 0.55 }, skyRot: { value: o.skyRot || 0 },
      diskN: { value: new THREE.Vector3(0, 1, 0) }, diskIn: { value: o.diskIn || 3.0 }, diskOut: { value: o.diskOut || 14 }, diskK: { value: 1 }, diskTemp: { value: o.temp || 1.0 },
      dopK: { value: o.dop !== undefined ? o.dop : 1 }, jetK: { value: 0 }, exposure: { value: o.exposure || 1.05 }, horizonGlow: { value: o.glow !== undefined ? o.glow : 1 },
      bhOn: { value: 1 }, spinK: { value: o.spin || 1 }, tint: { value: new THREE.Color(...(o.tint || [1, 1, 1])) },
      shiftX: { value: o.shiftX || 0 }, shiftY: { value: o.shiftY || 0 }, aa: { value: o.aa !== undefined ? o.aa : 2 },
      starDir: { value: new THREE.Vector3(...(o.starDir || [0, 0, -1])).normalize() }, starK: { value: 0 }, starCol: { value: new THREE.Color(...(o.starCol || [1.0, 0.9, 0.75])) },
      compPos: { value: new THREE.Vector3() }, compR: { value: 0 }, compCol: { value: new THREE.Color(...(o.compCol || [1.0, 0.86, 0.6])) },
    };
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader: BH_VS, fragmentShader: BH_FS, uniforms: U, depthTest: false, depthWrite: false }));
    quad.frustumCulled = false; S.add(quad);
    const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler((o.tilt || 0) * D2R, 0, (o.tiltZ || 0) * D2R));
    return (t, d) => {
      const p = ease(t / d, o.ease);
      const dist = o.distK ? KF(o.distK, t) : V(o, "dist", p, 30), el = o.elK ? KF(o.elK, t) : V(o, "el", p, 8), az = o.azK ? KF(o.azK, t) : V(o, "az", p, 0);
      const look = o.look0 ? [0, 1, 2].map((i) => lerp(o.look0[i], (o.look1 || o.look0)[i], p)) : o.look;
      const [pos, m] = bhCam(dist, el, az, o.rollK ? KF(o.rollK, t) : V(o, "roll", p, 0), look);
      U.camPos.value.copy(pos); U.camRot.value.copy(m);
      U.time.value = (o.t0 || 0) + t * (o.speed || 1);
      U.skyRot.value = (o.skyRot || 0) + (o.skyRotSp || 0) * t;
      U.diskN.value.set(0, 1, 0).applyQuaternion(tilt);
      U.diskK.value = o.diskK ? KF(o.diskK, t) : (o.disk !== undefined ? o.disk : 1);
      U.jetK.value = o.jetK ? KF(o.jetK, t) : (o.jet || 0);
      U.bhOn.value = o.bhK ? KF(o.bhK, t) : 1;
      if (o.fovK) U.tanHalf.value = Math.tan(KF(o.fovK, t) * D2R / 2);
      if (o.expK) U.exposure.value = KF(o.expK, t);
      if (o.shiftK) U.shiftX.value = KF(o.shiftK, t); else if (o.shiftX0 !== undefined) U.shiftX.value = V(o, "shiftX", p, 0);
      U.starK.value = o.starKK ? KF(o.starKK, t) : (o.star || 0);
      if (o.comp) { const c = o.comp, a = (c.ph || 0) + (c.sp || 20) * t * D2R; U.compR.value = c.r || 0.8;
        U.compPos.value.set(c.a * Math.cos(a), 0, c.a * Math.sin(a)).applyQuaternion(tilt); }
      return [S, C];
    };
  };
})();
