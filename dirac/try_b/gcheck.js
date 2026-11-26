const console2=console;
  const Cx = (re, im) => [re, im || 0], Z = Cx(0), O = Cx(1), N1 = Cx(-1), I_ = Cx(0, 1), NI = Cx(0, -1);
  const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]], cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const mmul = (A, B) => A.map((r, i) => B[0].map((_, j) => r.reduce((s, _, k) => cadd(s, cmul(A[i][k], B[k][j])), Z)));
  const G = [
    [[O, Z, Z, Z], [Z, O, Z, Z], [Z, Z, N1, Z], [Z, Z, Z, N1]],          // γ⁰ = diag(1, 1, −1, −1)
    [[Z, Z, Z, O], [Z, Z, O, Z], [Z, N1, Z, Z], [N1, Z, Z, Z]],          // γ¹ = [[0, σ1], [−σ1, 0]]
    [[Z, Z, Z, NI], [Z, Z, I_, Z], [Z, I_, Z, Z], [NI, Z, Z, Z]],        // γ² = [[0, σ2], [−σ2, 0]], σ2 = [[0, −i], [i, 0]]
    [[Z, Z, O, Z], [Z, Z, Z, N1], [N1, Z, Z, Z], [Z, O, Z, Z]],          // γ³ = [[0, σ3], [−σ3, 0]]
  ];
  const fmt = (c) => { const r = Math.round(c[0]), m = Math.round(c[1]); if (m === 0) return r < 0 ? "−" + -r : "" + r; if (r === 0) return m === 1 ? "i" : m === -1 ? "−i" : m + "i"; return r + (m > 0 ? "+" : "−") + Math.abs(m) + "i"; };
  (() => { // self-check: {γμ, γν} = 2 ημν I
    const eta = [1, -1, -1, -1];
    for (let m = 0; m < 4; m++) for (let n = 0; n < 4; n++) {
      const a = mmul(G[m], G[n]), b = mmul(G[n], G[m]);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const s = cadd(a[i][j], b[i][j]), want = m === n && i === j ? 2 * eta[m] : 0; if (Math.abs(s[0] - want) > 1e-9 || Math.abs(s[1]) > 1e-9) (()=>{throw new Error("gamma fail")})("k_math gamma check failed", m, n, i, j); }
    }
  })();
  const AB = mmul(G[0], G[1]), BA = mmul(G[1], G[0]);   // computed products: γ⁰γ¹ and γ¹γ⁰ = −γ⁰γ¹
console.log("gamma ok", AB.map(r=>r.map(fmt).join(" ")).join(" | "), "||", BA.map(r=>r.map(fmt).join(" ")).join(" | "));
