// Prancha Viva: cada quadro é função do tempo. iniciar(tempo) uma vez, depois quadro(t) por quadro.
// Regra do estilo: nada de preto chapado. Fundo é sempre papel com cor e mancha de aquarela.

const COR = {
  // modo diagrama: papel azul-petróleo, linha creme, acentos quentes
  fundo: ["#2f7271", "#1d4562"], manchas: ["#4a9a8c", "#27597a", "#6f9f6a", "#c98a52", "#3d7395", "#8a6aa0"],
  creme: "#f6e9c9", ouro: "#f2b84b", coral: "#e8775a", verde: "#7fd6a8", rosa: "#e383bd",
  // colmeia
  parede: ["#f2c968", "#d39a3e"], tintaFavo: "#5a3410",
  mel: ["#ffd36a", "#d88a1e", "#9a560c"], polen: ["#c4472f", "#e38a2c", "#e9bd3c", "#97963c", "#6f8a3a", "#b35a7a"],
};
let FAVO, DIAGRAMA;

// ---------- fundo do modo diagrama ----------
function fazerDiagrama() {
  const d = tela(W, H), c = d.getContext("2d"), r = rng(5);
  const g = c.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, COR.fundo[0]); g.addColorStop(1, COR.fundo[1]);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  aquarela(c, W, H, COR.manchas, 26, 0.16, r);
  for (let i = 0; i < 9000; i++) { // pontilhado claro, como tinta de risografia
    c.fillStyle = r() < 0.7 ? "rgba(246,233,201,0.07)" : "rgba(10,30,40,0.12)";
    c.fillRect(r() * W, r() * H, 1.5, 1.5);
  }
  // hachura leve nos cantos
  c.save();
  c.globalAlpha = 0.08;
  hachura(c, 0, 0, W * 0.35, H * 0.4, 9, -0.8, COR.creme, 1, r);
  hachura(c, W * 0.68, H * 0.6, W * 0.32, H * 0.4, 9, -0.8, COR.creme, 1, r);
  c.restore();
  return d;
}

// ---------- favo ----------
const FAVO_R = 96;
function fazerFavo() {
  const m = 1.15; // margem para o zoom lento
  const f = tela(W * m, H * m), c = f.getContext("2d"), r = rng(11);
  const g = c.createLinearGradient(0, 0, f.width, f.height);
  g.addColorStop(0, COR.parede[0]); g.addColorStop(1, COR.parede[1]);
  c.fillStyle = g; c.fillRect(0, 0, f.width, f.height);
  aquarela(c, f.width, f.height, ["#f7d98a", "#c98a32", "#e8b04e", "#b9782a"], 50, 0.25, r);
  const R = FAVO_R, dx = R * 1.5, dy = R * Math.sqrt(3);
  for (let q = -1; q * dx < f.width + R; q++) {
    for (let k = -1; k * dy < f.height + R; k++) {
      celula(c, q * dx, k * dy + (q % 2 ? dy / 2 : 0), R, rng(q * 1000 + k * 7 + 13));
    }
  }
  return f;
}
function celula(c, x, y, R, rnd, forca) {
  const s = rnd();
  const tipo = forca || (s < 0.34 ? "mel" : s < 0.62 ? "polen" : s < 0.76 ? "tampa" : "vazio");
  const dentro = tremido(hexPts(x, y, R * 0.83), 1.6, rnd);
  // parede de cera: hachura curta e brilho na quina
  c.save();
  caminho(c, hexPts(x, y, R)); c.clip();
  c.strokeStyle = "rgba(110,60,10,0.22)"; c.lineWidth = 1;
  for (let i = 0; i < 40; i++) {
    const a = rnd() * Math.PI * 2, d = R * (0.85 + rnd() * 0.13);
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
    c.beginPath(); c.moveTo(px, py); c.lineTo(px + 5, py - 6); c.stroke();
  }
  c.restore();
  c.save();
  caminho(c, dentro); c.clip();
  if (tipo === "mel") {
    const g = c.createRadialGradient(x - R * 0.3, y - R * 0.35, R * 0.05, x + R * 0.1, y + R * 0.1, R);
    g.addColorStop(0, COR.mel[0]); g.addColorStop(0.55, COR.mel[1]); g.addColorStop(1, COR.mel[2]);
    c.fillStyle = g; c.fill();
    for (let i = 0; i < 7; i++) { // bolhinhas presas no mel
      const bx = x + (rnd() - 0.5) * R, by = y + (rnd() - 0.5) * R, br = 1.5 + rnd() * 4;
      c.strokeStyle = "rgba(255,240,190,0.55)"; c.lineWidth = 1;
      c.beginPath(); c.arc(bx, by, br, 0, Math.PI * 2); c.stroke();
    }
    c.fillStyle = "rgba(255,252,230,0.45)";
    c.beginPath(); c.ellipse(x - R * 0.28, y - R * 0.34, R * 0.3, R * 0.1, -0.5, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "rgba(255,250,220,0.35)"; c.lineWidth = 2;
    c.beginPath(); c.arc(x, y, R * 0.62, 0.3, 1.3); c.stroke();
  } else if (tipo === "polen") {
    const base = COR.polen[Math.floor(rnd() * COR.polen.length)];
    c.fillStyle = base; c.fill();
    for (let i = 0; i < 140; i++) { // grãos de pólen compactados
      const gx = x + (rnd() - 0.5) * R * 1.7, gy = y + (rnd() - 0.5) * R * 1.7, gr = 1.2 + rnd() * 3;
      c.fillStyle = rnd() < 0.5 ? "rgba(255,240,200,0.3)" : "rgba(50,15,0,0.3)";
      c.beginPath(); c.ellipse(gx, gy, gr, gr * (0.6 + rnd() * 0.5), rnd() * 3, 0, Math.PI * 2); c.fill();
    }
    hachura(c, x - R, y - R, R * 0.9, R * 2, 5, 0.9, "rgba(60,20,0,0.18)", 1, rnd); // sombra na borda
  } else if (tipo === "tampa") {
    const g = c.createRadialGradient(x - R * 0.2, y - R * 0.28, R * 0.05, x, y, R * 0.9);
    g.addColorStop(0, "#fff1c8"); g.addColorStop(0.6, "#e6c27a"); g.addColorStop(1, "#b98838");
    c.fillStyle = g; c.fill();
    c.strokeStyle = "rgba(120,80,20,0.22)"; c.lineWidth = 1;
    for (let i = 0; i < 5; i++) caminho(c, tremido(hexPts(x, y, R * (0.18 + i * 0.13), 0.3 * i), 2.5, rnd, 3)), c.stroke();
    for (let i = 0; i < 60; i++) { c.fillStyle = "rgba(255,255,240,0.35)"; c.fillRect(x + (rnd() - 0.5) * R * 1.5, y + (rnd() - 0.5) * R * 1.5, 1.4, 1.4); }
  } else {
    const g = c.createLinearGradient(x - R, y - R, x + R, y + R);
    g.addColorStop(0, "#6a3a10"); g.addColorStop(1, "#b5772e");
    c.fillStyle = g; c.fill();
    const p = hexPts(x, y, R * 0.83);
    c.strokeStyle = "rgba(255,215,150,0.35)"; c.lineWidth = 1.5;
    [0, 2, 4].forEach((i) => { c.beginPath(); c.moveTo(x, y); c.lineTo(...p[i]); c.stroke(); }); // fundo piramidal
    hachura(c, x - R, y - R, R, R * 2, 4, 0.7, "rgba(40,15,0,0.25)", 1, rnd);
  }
  c.restore();
  // contorno de tinta: borda interna sombreada e luz na parede
  c.strokeStyle = "rgba(80,40,8,0.7)"; c.lineWidth = 2.6; c.lineJoin = "round";
  caminho(c, dentro); c.stroke();
  c.strokeStyle = "rgba(255,238,190,0.55)"; c.lineWidth = 1.4;
  caminho(c, tremido(hexPts(x, y, R * 0.97), 1, rnd)); c.stroke();
}

// ---------- abelha (vista de cima, cabeça para -y) ----------
function pelo(c, x, y, a, l, cor, larg) {
  c.strokeStyle = cor; c.lineWidth = larg;
  c.beginPath(); c.moveTo(x, y);
  c.quadraticCurveTo(x + Math.cos(a + 0.4) * l * 0.5, y + Math.sin(a + 0.4) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
  c.stroke();
}
function perna(c, pts, larg, r, cesta) {
  c.lineCap = c.lineJoin = "round";
  for (let i = 0; i < pts.length - 1; i++) { // segmento afinando, com brilho de quitina
    c.strokeStyle = "#2b1a0e"; c.lineWidth = larg[i];
    c.beginPath(); c.moveTo(...pts[i]); c.lineTo(...pts[i + 1]); c.stroke();
    c.strokeStyle = "rgba(170,120,70,0.6)"; c.lineWidth = Math.max(1, larg[i] * 0.25);
    c.beginPath(); c.moveTo(pts[i][0] - 1.5, pts[i][1] - 1.5); c.lineTo(pts[i + 1][0] - 1.5, pts[i + 1][1] - 1.5); c.stroke();
    for (let h = 0; h < 7; h++) { // pelinhos da perna
      const k = r(), px = lerp(pts[i][0], pts[i + 1][0], k), py = lerp(pts[i][1], pts[i + 1][1], k);
      pelo(c, px, py, r() * Math.PI * 2, 4 + r() * 6, "rgba(220,190,130,0.7)", 0.9);
    }
  }
  if (cesta) { // cestinha de pólen na perna de trás
    const [ax, ay] = pts[1], [bx, by] = pts[2], mx = (ax + bx) / 2, my = (ay + by) / 2;
    c.fillStyle = "#f0a030";
    c.beginPath(); c.ellipse(mx, my, 13, 19, Math.atan2(by - ay, bx - ax) + Math.PI / 2, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 25; i++) { c.fillStyle = r() < 0.5 ? "#ffd070" : "#b86a10"; c.fillRect(mx + (r() - 0.5) * 20, my + (r() - 0.5) * 30, 2, 2); }
  }
}
function abelha(c, x, y, ang, s, t, seed = 3) {
  const r = rng(seed);
  c.save();
  c.translate(x, y); c.rotate(ang); c.scale(s, s);
  // sombra
  c.save();
  c.filter = "blur(16px)";
  c.fillStyle = "rgba(60,25,0,0.42)";
  c.beginPath(); c.ellipse(16, 34, 105, 165, 0, 0, Math.PI * 2); c.fill();
  c.restore();
  // pernas: fêmur, tíbia e tarso, dobradas junto do corpo
  for (const lado of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const w = Math.sin(t * 5 + k * 2.1 + lado) * 4;
      const b = [lado * 24, -58 + k * 22];
      const j1 = [b[0] + lado * (48 + k * 6), b[1] + (k - 1) * 26 - 14 + w];
      const j2 = [j1[0] + lado * (16 + k * 4), j1[1] + 40 + k * 10];
      const f = [j2[0] + lado * (4 + k * 3), j2[1] + 26 + k * 6];
      perna(c, [b, j1, j2, f], [11, 8, 4.5], r, k === 2);
    }
  }
  // abdômen: anéis com pelo na borda de cada um
  c.save();
  c.beginPath(); c.ellipse(0, 82, 58, 96, 0, 0, Math.PI * 2);
  const g = c.createRadialGradient(-22, 50, 8, 0, 82, 104);
  g.addColorStop(0, "#f2c26a"); g.addColorStop(0.6, "#c88a32"); g.addColorStop(1, "#7a4a14");
  c.fillStyle = g; c.fill();
  c.clip();
  [34, 70, 106, 140, 172].forEach((yy, i) => {
    const gb = c.createLinearGradient(0, yy - 12, 0, yy + 14);
    gb.addColorStop(0, "#4a2c12"); gb.addColorStop(1, "#22140a");
    c.fillStyle = gb;
    c.beginPath(); c.ellipse(0, yy, 72, 12 + i * 2, 0, 0, Math.PI); c.fill();
    for (let h = 0; h < 40; h++) { // fileira de pelos claros no começo de cada anel
      const hx = (r() - 0.5) * 112;
      pelo(c, hx, yy - 14 + r() * 4, Math.PI / 2 + (r() - 0.5) * 0.6, 5 + r() * 6, "rgba(245,215,150,0.75)", 1);
    }
  });
  hachura(c, 10, -20, 60, 210, 4, 1.0, "rgba(40,20,0,0.22)", 1, r); // sombra do lado direito
  c.strokeStyle = "rgba(255,235,180,0.5)"; c.lineWidth = 3;
  c.beginPath(); c.ellipse(0, 82, 54, 92, 0, Math.PI * 0.6, Math.PI * 1.15); c.stroke();
  c.restore();
  // tórax: pelagem em três camadas, luz vindo de cima à esquerda
  c.fillStyle = "#5a3a1a";
  c.beginPath(); c.arc(0, -40, 47, 0, Math.PI * 2); c.fill();
  for (const [n, cor, l0, larg] of [[700, "#4a2e14", 16, 1.6], [1000, "#b8884a", 13, 1.3], [500, "#f4dca2", 9, 1.1]]) {
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 50;
      const px = Math.cos(a) * d, py = -40 + Math.sin(a) * d;
      if (cor === "#f4dca2" && px + py + 40 > 10) continue; // pontas claras só do lado da luz
      pelo(c, px, py, a + (r() - 0.5) * 0.8, l0 * (0.6 + r() * 0.7), cor, larg);
    }
  }
  // asas: membrana iridescente com nervuras
  const bate = Math.sin(t * 3) * 0.04;
  for (const lado of [-1, 1]) {
    for (const [rx, ry, rot, oy] of [[44, 108, 0.3, -30], [30, 74, 0.6, -18]]) {
      c.save();
      c.translate(lado * 20, oy);
      c.rotate(lado * (rot + bate));
      c.beginPath(); c.ellipse(lado * 8, ry * 0.9, rx, ry, 0, 0, Math.PI * 2);
      const ga = c.createLinearGradient(-rx, 0, rx, ry * 1.8);
      ga.addColorStop(0, "rgba(190,230,255,0.16)"); ga.addColorStop(0.5, "rgba(255,220,245,0.10)"); ga.addColorStop(1, "rgba(255,245,200,0.14)");
      c.fillStyle = ga; c.fill();
      c.strokeStyle = "rgba(255,255,255,0.65)"; c.lineWidth = 1.3; c.stroke();
      c.strokeStyle = "rgba(50,32,15,0.5)"; c.lineWidth = 1.1;
      c.beginPath(); c.moveTo(0, 4); c.quadraticCurveTo(-lado * rx * 0.7, ry * 0.6, -lado * rx * 0.55, ry * 1.25); c.stroke(); // nervura da borda
      c.beginPath(); c.moveTo(0, 4); c.quadraticCurveTo(lado * rx * 0.1, ry * 0.8, lado * rx * 0.2, ry * 1.5); c.stroke();
      for (let v = 0; v < 3; v++) { // nervuras transversais: as "celulinhas" da asa
        const yy = ry * (0.5 + v * 0.3);
        c.beginPath(); c.moveTo(-lado * rx * 0.62, yy); c.quadraticCurveTo(0, yy + 12, lado * rx * 0.15, yy + 18); c.stroke();
      }
      c.fillStyle = "rgba(255,255,255,0.25)";
      c.beginPath(); c.ellipse(-lado * rx * 0.25, ry * 0.5, rx * 0.25, ry * 0.12, 0.4, 0, Math.PI * 2); c.fill();
      c.restore();
    }
  }
  // cabeça: antenas segmentadas, rosto peludo, olhos compostos
  for (const lado of [-1, 1]) {
    const w = Math.sin(t * 2.3 + lado) * 8;
    const pts = [[lado * 10, -128], [lado * 22, -166], [lado * (40 + w * 0.5), -180 - w * 0.3], [lado * (58 + w), -190 - w * 0.5]];
    c.strokeStyle = "#2a1a0c"; c.lineWidth = 4.5; c.lineCap = "round";
    caminho(c, pts, false); c.stroke();
    c.fillStyle = "#6a4a2a";
    pts.slice(1).forEach(([px, py]) => { c.beginPath(); c.arc(px, py, 2.6, 0, Math.PI * 2); c.fill(); });
  }
  const gh = c.createRadialGradient(-10, -116, 4, 0, -106, 40);
  gh.addColorStop(0, "#5a3e24"); gh.addColorStop(1, "#24160a");
  c.fillStyle = gh;
  c.beginPath(); c.ellipse(0, -106, 37, 31, 0, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 160; i++) { // pelinhos do rosto
    const a = Math.PI / 2 + (r() - 0.5) * 2.2, d = r() * 26;
    pelo(c, Math.cos(a) * d * 0.7, -100 + Math.sin(a) * d * 0.5, a, 5 + r() * 5, "rgba(230,200,140,0.6)", 0.9);
  }
  for (const lado of [-1, 1]) {
    c.save();
    c.beginPath(); c.ellipse(lado * 27, -108, 17, 27, lado * 0.25, 0, Math.PI * 2);
    const go = c.createRadialGradient(lado * 22, -118, 2, lado * 27, -108, 28);
    go.addColorStop(0, "#5a4632"); go.addColorStop(1, "#140c06");
    c.fillStyle = go; c.fill();
    c.clip();
    c.strokeStyle = "rgba(255,240,210,0.12)"; c.lineWidth = 0.7; // facetas do olho composto
    for (let fy = -140; fy < -76; fy += 5.2) for (let fx = lado * 27 - 20; fx < lado * 27 + 20; fx += 6) {
      caminho(c, hexPts(fx + ((Math.round(fy) / 5.2) % 2) * 3, fy, 3)); c.stroke();
    }
    c.fillStyle = "rgba(255,255,255,0.4)";
    c.beginPath(); c.ellipse(lado * 22, -117, 5, 9, lado * 0.25, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  c.restore();
}

// ---------- cenas ----------
const CENAS = {
  favo(u, d) {
    const z = 1 + 0.06 * (u / Math.max(d, 1));
    ctx.save();
    ctx.translate(W / 2, H / 2); ctx.scale(z, z);
    ctx.drawImage(FAVO, -FAVO.width / 2, -FAVO.height / 2);
    abelha(ctx, -60 + u * 14, 40 - u * 6, 0.45, 1.55, u);
    ctx.restore();
  },

  geometria(u) {
    ctx.drawImage(DIAGRAMA, 0, 0);
    const cx = W / 2, cy = H / 2, r = 150;
    const fl = 1 - seg(u, 3.4, 4.2); // a flor some quando o favo aparece
    // pétalas pintadas da flor da vida
    const pet = seg(u, 2.2, 3.0) * fl;
    if (pet > 0) {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        ctx.fillStyle = [COR.ouro, COR.coral, COR.verde][i % 3];
        ctx.globalAlpha = 0.16 * pet;
        ctx.beginPath(); ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    tinta(ctx, () => { ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * seg(u, 0.6, 1.5)); ctx.stroke(); }, COR.creme, 3.6, lerp(0.35, 1, fl));
    if (u > 0.6 && u < 1.6) { // ponta do compasso
      ctx.fillStyle = COR.coral;
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3, k = seg(u, 1.4 + i * 0.18, 2.1 + i * 0.18);
      if (k <= 0) continue;
      const px = cx + r * Math.cos(a), py = cy + r * Math.sin(a);
      tinta(ctx, () => { ctx.beginPath(); ctx.arc(px, py, r, a + Math.PI, a + Math.PI + Math.PI * 2 * k); ctx.stroke(); }, COR.creme, 2.6, 0.85 * fl);
    }
    const hx = hexPts(cx, cy, r);
    const kh = seg(u, 2.6, 3.4);
    // o hexágono se repete: o favo inteiro sai da mesma forma, cada célula com uma aguada de cor
    const dv = r * Math.sqrt(3), tons = [COR.ouro, COR.coral, COR.verde, COR.rosa];
    const some = 1 - seg(u, 4.6, 5.3);
    const aneis = Math.max(3, Math.ceil(H / (2 * dv))); // em 16:9 são 3; o quadro alto pede mais
    for (let anel = 1; anel <= aneis; anel++) {
      for (let i = 0; i < 6 * anel; i++) {
        const lado = Math.floor(i / anel), passo = i % anel;
        const a0 = Math.PI / 6 + (lado * Math.PI) / 3, a1 = Math.PI / 6 + ((lado + 2) * Math.PI) / 3;
        const x = cx + dv * (anel * Math.cos(a0) + passo * Math.cos(a1));
        const y = cy + dv * (anel * Math.sin(a0) + passo * Math.sin(a1));
        const k = seg(u, 3.2 + anel * 0.25 + i * 0.012, 3.9 + anel * 0.25 + i * 0.012) * some;
        if (k <= 0) continue;
        ctx.save();
        ctx.globalAlpha = 0.2 * k;
        ctx.fillStyle = tons[(anel * 7 + i * 3) % 4];
        caminho(ctx, hexPts(x, y, r * 0.94)); ctx.fill();
        ctx.restore();
        tinta(ctx, () => tracar(ctx, hexPts(x, y, r), k), COR.creme, 2.4, 0.8);
      }
    }
    if (kh > 0) {
      ctx.save(); ctx.globalAlpha = 0.3 * kh; ctx.fillStyle = COR.ouro; caminho(ctx, hx); ctx.fill(); ctx.restore();
      tinta(ctx, () => tracar(ctx, hx, kh), COR.ouro, 4.5);
    }
    // ângulo de 120°: a marca do diagrama
    const ka = seg(u, 3.0, 3.6) * (1 - seg(u, 4.6, 5.0));
    if (ka > 0) tinta(ctx, () => { ctx.beginPath(); ctx.arc(hx[0][0], hx[0][1], 34, Math.PI * 2 / 3, Math.PI * 2 / 3 + (Math.PI * 2 / 3) * ka); ctx.stroke(); }, COR.coral, 2.6);
    prisma(cx, cy, r, seg(u, 4.4, 5.4));
  },

  ovo(u, d) {
    ctx.drawImage(DIAGRAMA, 0, 0);
    const cx = W / 2, cy = H / 2;
    const km = seg(u, 0, 1.1); // o prisma desce e vira a célula vista de cima
    const R = lerp(150, 470, km);
    prisma(cx, cy, R, 1 - km);
    if (km > 0) { // parede de cera da célula, com cor
      ctx.save();
      ctx.globalAlpha = 0.35 * km;
      ctx.fillStyle = COR.ouro;
      caminho(ctx, hexPts(cx, cy, R)); caminho(ctx, hexPts(cx, cy, R * 0.82).reverse()); ctx.fill("evenodd");
      ctx.beginPath(); caminho(ctx, hexPts(cx, cy, R)); ctx.moveTo(0, 0);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.22 * km;
      ctx.fillStyle = "#123247";
      caminho(ctx, hexPts(cx, cy, R * 0.82)); ctx.fill();
      ctx.restore();
    }
    tinta(ctx, () => { caminho(ctx, hexPts(cx, cy, R * 0.82)); ctx.stroke(); }, COR.creme, 2.6, 0.85 * km);
    for (let i = 0; i < 6; i++) {
      const a = hexPts(cx, cy, R)[i], b = hexPts(cx, cy, R * 0.82)[i];
      tinta(ctx, () => { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }, COR.creme, 2, 0.75 * km);
    }
    const ke = seg(u, 0.6, 1.5);
    if (ke <= 0) return;
    const zoom = (1 + 0.12 * (u / d)) * lerp(0.6, 1, ke);
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(-0.35); ctx.scale(zoom, zoom);
    const rx = 112, ry = 270, r = rng(31);
    ctx.globalAlpha = ke;
    ctx.save(); // sombra do ovo no fundo da célula
    ctx.filter = "blur(18px)"; ctx.fillStyle = "rgba(10,25,35,0.5)";
    ctx.beginPath(); ctx.ellipse(18, 22, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(-30, -70, 10, 0, 0, ry);
    g.addColorStop(0, "#fff8e8"); g.addColorStop(0.6, "#f1dcb8"); g.addColorStop(1, "#cfa978");
    ctx.fillStyle = g; ctx.fill();
    ctx.save();
    ctx.clip();
    hachura(ctx, 20, -ry, rx, ry * 2, 5, 1.1, "rgba(140,90,40,0.16)", 1, r); // sombra hachurada
    // divisão celular: 1, 2, 4... até centenas de núcleos
    const geracoes = 9, gt = lerp(0, geracoes, seg(u, 1.3, 3.6));
    const ger = Math.floor(gt), f = ease((gt - ger) / 0.5);
    const n = 2 ** ger, n2 = 2 ** Math.min(geracoes, ger + 1);
    const pos = (i, N) => { // espiral de girassol dentro da elipse
      const rr = Math.sqrt((i + 0.5) / N) * 0.86, a = i * 2.39996;
      return N === 1 ? [0, 0] : [Math.cos(a) * rr * rx, Math.sin(a) * rr * ry];
    };
    const tam = (N) => Math.max(2.4, 28 / Math.sqrt(N));
    const kseg = seg(u, 3.4, 4.3);
    for (let j = 0; j < n2; j++) {
      const [x0, y0] = pos(j >> 1, n), [x1, y1] = pos(j, n2);
      const x = lerp(x0, x1, f), y = lerp(y0, y1, f), s = lerp(tam(n), tam(n2), f);
      ctx.globalAlpha = ke * (1 - 0.5 * kseg);
      ctx.fillStyle = "rgba(232,119,90,0.28)";
      ctx.beginPath(); ctx.arc(x, y, s * 1.9, 0, Math.PI * 2); ctx.fill();
      const gn = ctx.createRadialGradient(x - s * 0.3, y - s * 0.3, 0, x, y, s);
      gn.addColorStop(0, "#ffd88a"); gn.addColorStop(1, "#d9802a");
      ctx.fillStyle = gn;
      ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
    }
    // faixas de segmentação: o corpo da abelha se organizando
    for (let b = 0; b < 8; b++) {
      const kb = seg(u, 3.4 + b * 0.08, 3.8 + b * 0.08);
      if (kb <= 0) continue;
      ctx.globalAlpha = 0.5 * kb;
      ctx.fillStyle = b === 0 ? COR.rosa : b % 2 ? "#4fbf8f" : "#5fd3a8";
      const yy = -ry * 0.75 + b * ry * 0.2;
      ctx.fillRect(-rx, yy, rx * 2, ry * 0.09 * kb);
    }
    ctx.restore();
    ctx.globalAlpha = ke;
    tinta(ctx, () => { ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.stroke(); }, "#8a5a2a", 2.6);
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(0, 0, rx - 10, ry - 10, 0, Math.PI * 1.1, Math.PI * 1.4); ctx.stroke();
    ctx.restore();
  },
};

function prisma(cx, cy, r, k) {
  if (k <= 0) return;
  const fundo = hexPts(cx + 70 * k, cy - 110 * k, r);
  const topo = hexPts(cx, cy, r);
  for (let i = 0; i < 6; i++) { // faces laterais com aguada
    ctx.save();
    ctx.globalAlpha = 0.14 * k;
    ctx.fillStyle = i % 2 ? COR.ouro : COR.coral;
    caminho(ctx, [topo[i], topo[(i + 1) % 6], fundo[(i + 1) % 6], fundo[i]]); ctx.fill();
    ctx.restore();
  }
  tinta(ctx, () => { caminho(ctx, fundo); ctx.stroke(); }, COR.creme, 2.6, 0.85 * k);
  for (let i = 0; i < 6; i++) tinta(ctx, () => { ctx.beginPath(); ctx.moveTo(...topo[i]); ctx.lineTo(...fundo[i]); ctx.stroke(); }, COR.creme, 2.2, 0.8 * k);
  tinta(ctx, () => { caminho(ctx, topo); ctx.stroke(); }, COR.ouro, 4.5);
}

// ---------- passagens ----------
function iris(ant, u, a) {
  const k = seg(u, 0, 1.0);
  CENAS[a.cena](u, a.t1 - a.t0, a);
  if (k >= 1) return;
  const R = lerp(Math.hypot(W, H) * 0.6, 150, k);
  ctx.save();
  ctx.globalAlpha = 1 - seg(u, 0.75, 1.0);
  ctx.beginPath(); ctx.arc(W / 2, H / 2, R, 0, Math.PI * 2); ctx.clip();
  CENAS[ant.cena](ant.t1 - ant.t0, ant.t1 - ant.t0, ant);
  ctx.restore();
  tinta(ctx, () => { ctx.beginPath(); ctx.arc(W / 2, H / 2, R, 0, Math.PI * 2); ctx.stroke(); }, COR.creme, 3, 1 - seg(u, 0.8, 1.0));
}
const PASSAGENS = { iris };

// ---------- entrada ----------
function iniciar(tempo) {
  TEMPO = tempo;
  [W, H] = TAM[tempo.formato];
  const c = document.getElementById("c");
  c.width = W; c.height = H;
  ctx = c.getContext("2d");
  GRAO = fazerGrao();
  MANCHA = fazerMancha();
  FAVO = fazerFavo();
  DIAGRAMA = fazerDiagrama();
  if (typeof iniciar2 === "function") iniciar2();
}

function quadro(t) {
  const atos = TEMPO.atos;
  let i = atos.findIndex((a) => t >= a.t0 && t < a.t1);
  if (i < 0) i = atos.length - 1;
  const a = atos[i], u = t - a.t0;
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  if (i > 0 && PASSAGENS[a.entrada]) PASSAGENS[a.entrada](atos[i - 1], u, a);
  else CENAS[a.cena](u, a.t1 - a.t0, a);
  ctx.restore();
  papel(t);
}
