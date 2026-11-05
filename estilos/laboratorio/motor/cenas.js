// Laboratório: ciência em tom sóbrio. Fundo quase preto com manchas escuras de cor, objetos feitos de pontos,
// serifa nos títulos, legenda curta centralizada. Acentos: magenta, âmbar, verde-água.
// Cenas: titulo, esfera, fita, comparacao, ciclo.

const L = { fundo: "#0e0e12", ponto: "200,206,216", mag: "#d04ad0", amb: "#e8a33c", agua: "#4fd1c5", texto: "#ecebf0", fraco: "#9a9aa6", verm: "200,90,90" };

function lFundo(c, W, H, u) {
  c.fillStyle = L.fundo; c.fillRect(0, 0, W, H);
  [[0.18, 0.3, "80,30,90"], [0.82, 0.72, "20,60,70"], [0.6, 0.15, "40,30,70"]].forEach(([x, y, cor], i) => {
    const g = c.createRadialGradient(W * x + 30 * Math.sin(u * 0.3 + i), H * y, 0, W * x, H * y, Math.max(W, H) * 0.45);
    g.addColorStop(0, `rgba(${cor},.45)`); g.addColorStop(1, `rgba(${cor},0)`); c.fillStyle = g; c.fillRect(0, 0, W, H); });
  fundo(c, W, H, "rgba(0,0,0,0)", { grao: 0.18, vinheta: 0.5 });
}
function lEsfera(c, cx, cy, R, u, { n = 1600, cor = L.ponto, seed = 1, giro = 0.25, receptores = 0, k = 1 } = {}) {
  const r = rng(seed), rot = u * giro;
  for (let i = 0; i < n * k; i++) { const v = r() * 2 - 1, a = r() * Math.PI * 2 + rot, s = Math.sqrt(1 - v * v), z = Math.sin(a) * s, p = (z + 1) / 2;
    c.fillStyle = `rgba(${cor},${0.12 + 0.75 * p})`; c.fillRect(cx + Math.cos(a) * s * R, cy + v * R, 1.5 + 2 * p, 1.5 + 2 * p); }
  for (let i = 0; i < receptores; i++) { const a = (i / receptores) * Math.PI * 2 + rot, z = Math.sin(a); if (z < -0.1) continue;
    const ex = Math.cos(a), ey = -0.25 + 0.5 * ((i * 37) % 10) / 10, x = cx + ex * R * 0.98, y = cy + ey * R, l = 46 * (0.6 + 0.4 * z);
    c.strokeStyle = `rgba(79,209,197,${0.35 + 0.65 * z})`; c.lineWidth = 3;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + ex * l, y - l * 0.2); c.moveTo(x + ex * l, y - l * 0.2); c.lineTo(x + ex * l * 1.3, y - l * 0.55); c.moveTo(x + ex * l, y - l * 0.2); c.lineTo(x + ex * l * 1.35, y + l * 0.1); c.stroke(); }
}
function lRotulo(c, s, x, y, alpha, { tam = 28, cor = L.texto, alinha = "left", sub = "" } = {}) {
  texto(c, s, x, y, { tam, peso: 500, alinha, cor, alpha });
  if (sub) texto(c, sub, x, y + tam * 0.95, { tam: tam * 0.75, peso: 400, alinha, cor: L.fraco, alpha: alpha * 0.7 });
}
const esc = (W, H) => Math.min(W, H) / 1080;

const CENAS = {
  titulo(c, u, d, W, H, a) {
    const tl = a.tela || {}, s = esc(W, H), m = 80 * s;
    lFundo(c, W, H, u);
    texto(c, tl.sobre || "", m, 110 * s, { tam: 24 * s, peso: 600, alinha: "left", cor: L.fraco, alpha: fase(u, 0.1, 0.6) });
    texto(c, tl.titulo || "", m, 190 * s, { tam: 72 * s, fonte: SERIF, peso: 400, alinha: "left", cor: L.texto, alpha: fase(u, 0.2, 0.9) });
    texto(c, tl.titulo2 || "", m, 270 * s, { tam: 66 * s, peso: 700, alinha: "left", cor: L.texto, alpha: fase(u, 0.4, 1.1) });
    texto(c, tl.sub || "", m, 335 * s, { tam: 26 * s, peso: 400, alinha: "left", cor: "#cfcfd8", alpha: fase(u, 0.7, 1.3) });
    lEsfera(c, W * 0.62, H * 0.6, 220 * s, u, { receptores: 14, k: sai(fase(u, 0.3, 1.6)) });
  },
  esfera(c, u, d, W, H, a) {
    const tl = a.tela || {}, s = esc(W, H);
    lFundo(c, W, H, u);
    lEsfera(c, W / 2, H * 0.45, 300 * s, u, { receptores: tl.receptores ?? 20, k: sai(fase(u, 0, 0.8)), cor: tl.alvo ? L.verm : L.ponto });
    if (tl.rotulo) { c.strokeStyle = "rgba(236,235,240,.5)"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(W / 2 + 230 * s, H * 0.45 - 200 * s); c.lineTo(W / 2 + 330 * s, H * 0.45 - 260 * s); c.stroke();
      lRotulo(c, tl.rotulo, W / 2 + 340 * s, H * 0.45 - 265 * s, fase(u, 0.6, 1.0), { tam: 28 * s, sub: tl.subrotulo || "" }); }
  },
  fita(c, u, d, W, H, a) {
    const tl = a.tela || {}, s = esc(W, H), n = 90, k = sai(fase(u, 0, d * 0.6)), corte = tl.corte ?? 1;
    lFundo(c, W, H, u);
    for (let i = 0; i < n * k; i++) { const f = i / n, ang = f * Math.PI * 4 + u * 0.4, r = (380 - f * 230) * s;
      const x = W / 2 + Math.cos(ang) * r, y = H * 0.45 + Math.sin(ang) * r * 0.9, sai2 = f > corte ? fase(u, d * 0.5, d * 0.9) : 0;
      c.globalAlpha = 1 - sai2; c.fillStyle = f < 0.35 ? L.amb : L.mag; c.beginPath(); c.arc(x, y + sai2 * 80, 7 * s, 0, 7); c.fill(); }
    c.globalAlpha = 1;
    lRotulo(c, tl.rotulo || "a instrução", W / 2 - 120 * s, 120 * s, fase(u, 0.3, 0.8), { tam: 30 * s });
  },
  comparacao(c, u, d, W, H, a) {
    const tl = a.tela || {}, s = esc(W, H);
    lFundo(c, W, H, u);
    c.strokeStyle = "rgba(255,255,255,.08)"; c.beginPath(); c.moveTo(W / 2, 140 * s); c.lineTo(W / 2, H - 200 * s); c.stroke();
    [[tl.esq || { rotulo: "padrão", n: 8 }, W * 0.25, false], [tl.dir || { rotulo: "novo", n: 4 }, W * 0.75, true]].forEach(([lado, cx, novo]) => {
      lRotulo(c, lado.rotulo, cx, 160 * s, fase(u, 0.1, 0.5), { tam: 30 * s, alinha: "center" });
      const n = lado.n || 4, col = Math.min(4, n);
      for (let i = 0; i < n; i++) { const kk = entra(u, 0.3 + i * 0.12, 0.4); if (kk <= 0) continue; const x = cx + ((i % col) - (col - 1) / 2) * 105 * s, y = 290 * s + Math.floor(i / col) * 115 * s;
        lEsfera(c, x, y, 40 * s * kk, u, { n: 260, seed: i + (novo ? 50 : 0), receptores: novo ? 10 : 2, giro: 0.6 }); }
      for (let i = 0; i < 3; i++) { const x = cx + (i - 1) * 130 * s, y = H * 0.68 + (i % 2) * 40 * s, morto = novo && u > d * 0.6;
        lEsfera(c, x, y + (morto ? fase(u, d * 0.6, d) * 60 : 0), 52 * s, u, { n: 300, seed: i + 90, cor: L.verm, k: morto ? 1 - fase(u, d * 0.6, d) * 0.8 : 1 }); }
    });
  },
  ciclo(c, u, d, W, H, a) {
    const tl = a.tela || {}, s = esc(W, H), cx = W * 0.32, cy = H * 0.45, R = 160 * s, ang = -Math.PI / 2 + (u / 1.2) * Math.PI * 2;
    lFundo(c, W, H, u);
    c.strokeStyle = "rgba(236,235,240,.6)"; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
    c.fillStyle = "#8e7cff"; c.beginPath(); c.arc(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R, 14 * s, 0, 7); c.fill();
    c.fillStyle = L.agua; c.beginPath(); c.arc(cx + Math.cos(ang + Math.PI) * R, cy + Math.sin(ang + Math.PI) * R, 14 * s, 0, 7); c.fill();
    texto(c, String(1 + Math.floor(u / 1.2)), cx, cy, { tam: 80 * s, peso: 500, cor: L.texto });
    lRotulo(c, tl.cima || "desenho", cx - R - 20 * s, cy - R - 30 * s, fase(u, 0.2, 0.6), { tam: 28 * s });
    lRotulo(c, tl.baixo || "medida", cx - R - 20 * s, cy + R + 30 * s, fase(u, 0.3, 0.7), { tam: 28 * s, sub: tl.subbaixo || "" });
  },
};
CENAS.padrao = CENAS.esfera;
const FUNDE = 0.5;

function legenda(c, a, u, W, H, t) {
  const s = esc(W, H);
  texto(c, trechoDaFala(a, t, 7), W / 2, H - 110 * s, { tam: 38 * s, peso: 500, cor: "#f2f2f5", larg: W - 160 * s });
}
