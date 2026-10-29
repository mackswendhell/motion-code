// Fantasia: lenda contada em ilustração vetorial chapada com grão de papel, luz em raios, névoa e profundidade de campo.
// Cada cena é um conjunto de camadas com profundidade (d): a câmera aproxima, as camadas andam em paralaxe e
// desfocam quanto mais longe do foco. Camadas paradas são pintadas uma vez (com margem M, para o desfoque não
// escurecer as bordas); o que mexe é desenhado a cada quadro.

const M = 80;           // margem das camadas em cache
const LINHA = "#1a1012"; // contorno dos personagens e objetos
let S, SC, BUF, BC, RUIDO, MANCHAS;
// o mundo é um quadrado de 1080 no centro da tela; no 16:9 sobra dos lados (OX), no 9:16 em cima e embaixo (OY).
// EL/ER/ET/EB são as bordas da tela em coordenadas do mundo; X0/X1/Y0/Y1, as mesmas com a margem M.
let OX, OY, EL, ER, ET, EB, X0, X1, Y0, Y1;
const larg = (n) => Math.round(n * (X1 - X0) / 1240), area = (n) => Math.round(n * (X1 - X0) * (Y1 - Y0) / 1240 / 1240);
const CACHE = {};

// ---------- utilidades ----------
function cache(nome, desenha) {
  if (!CACHE[nome]) {
    const c = tela(W + 2 * M, H + 2 * M), g = c.getContext("2d");
    g.translate(M + OX, M + OY);
    desenha(g);
    CACHE[nome] = c;
  }
  return CACHE[nome];
}
function borrado(nome, px) {
  return cache(nome + "~" + px, (g) => { g.filter = `blur(${px}px)`; g.drawImage(CACHE[nome], X0, Y0); });
}
// põe uma camada na tela: d = profundidade (0 parado, 1 anda com a câmera, >1 à frente), blur em px
function poe(alvo, img, d, C, blur = 0, alpha = 1) {
  const s = 1 + (C.z - 1) * d;
  alvo.save();
  alvo.globalAlpha = alpha;
  if (blur > 0.4) alvo.filter = `blur(${blur.toFixed(1)}px)`;
  alvo.translate(C.cx + OX, C.cy + OY); alvo.scale(s, s); alvo.translate(-C.cx - OX + C.px * d, -C.cy - OY + C.py * d);
  alvo.drawImage(img, -M, -M);
  alvo.restore();
}
// desenha algo que mexe na mesma camada/câmera; com desfoque passa por uma tela de rascunho
function vivo(alvo, d, C, blur, desenha, modo) {
  if (blur > 0.4 || modo) {
    SC.setTransform(1, 0, 0, 1, 0, 0); SC.clearRect(0, 0, S.width, S.height); SC.translate(M + OX, M + OY);
    desenha(SC);
    alvo.save(); if (modo) alvo.globalCompositeOperation = modo;
    poe(alvo, S, d, C, blur);
    alvo.restore();
    return;
  }
  const s = 1 + (C.z - 1) * d;
  alvo.save();
  alvo.translate(C.cx + OX, C.cy + OY); alvo.scale(s, s); alvo.translate(-C.cx + C.px * d, -C.cy + C.py * d);
  desenha(alvo);
  alvo.restore();
}
const grad = (g, x0, y0, x1, y1, paradas) => { const k = g.createLinearGradient(x0, y0, x1, y1); paradas.forEach(([o, c]) => k.addColorStop(o, c)); return k; };
const radial = (g, x, y, r, paradas) => { const k = g.createRadialGradient(x, y, 0, x, y, r); paradas.forEach(([o, c]) => k.addColorStop(o, c)); return k; };
function poli(g, pts, cor, contorno = 0, corLinha = LINHA) {
  caminho(g, pts); g.fillStyle = cor; g.fill();
  if (contorno) { g.lineWidth = contorno; g.strokeStyle = corLinha; g.lineJoin = "round"; g.stroke(); }
}
// forma com luz de borda: a cor da luz aparece só no lado de onde a luz vem (lx, ly = deslocamento)
function forma(g, pts, cor, luz, lx = 5, ly = 0, contorno = 3.5) {
  g.save();
  caminho(g, pts); g.clip();
  g.fillStyle = luz || cor; g.fill();
  g.translate(-lx, -ly); caminho(g, pts); g.fillStyle = cor; g.fill();
  g.restore();
  caminho(g, pts); g.lineWidth = contorno; g.strokeStyle = LINHA; g.lineJoin = "round"; g.stroke();
}
function elipse(g, x, y, rx, ry, cor, contorno = 0) {
  g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = cor; g.fill();
  if (contorno) { g.lineWidth = contorno; g.strokeStyle = LINHA; g.stroke(); }
}
function brilho(g, x, y, r, cor, a = 1) {
  g.save(); g.globalCompositeOperation = "screen"; g.globalAlpha = a;
  g.fillStyle = radial(g, x, y, r, [[0, cor], [1, "rgba(0,0,0,0)"]]);
  g.fillRect(x - r, y - r, 2 * r, 2 * r); g.restore();
}
function estrela(g, x, y, r, a) { // cintilância de quatro pontas
  g.save(); g.globalAlpha = a; g.fillStyle = "#fffbe8";
  g.beginPath();
  for (let i = 0; i < 8; i++) { const ang = i * Math.PI / 4, rr = i % 2 ? r * 0.18 : r; g.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr); }
  g.fill(); g.restore();
  brilho(g, x, y, r * 1.6, "rgba(255,240,190,0.9)", a);
}
// partículas que flutuam (pó na luz, vaga-lumes, brasas): posição determinística por índice e tempo
function particulas(g, n, seed, t, caixa, op) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x0 = r(), y0 = r(), v = r(), f = r(), tam = r();
    op(g, i, x0, y0, v, f, tam, t, caixa);
  }
}

// ---------- textura do papel ----------
function fazerRuido() {
  const c = tela(W, H), g = c.getContext("2d"), img = g.createImageData(W, H), r = rng(3);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (r() + r() - 1) * 70;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}
function fazerManchas() { // variação grande e mole, como tinta guache que não assentou por igual
  const c = tela(W, H), g = c.getContext("2d"), r = rng(11);
  g.fillStyle = "#808080"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 140; i++) {
    const x = r() * W, y = r() * H, rr = 40 + r() * 220, v = Math.floor(100 + r() * 56);
    g.fillStyle = radial(g, x, y, rr, [[0, `rgba(${v},${v},${v},0.5)`], [1, `rgba(${v},${v},${v},0)`]]);
    g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr);
  }
  return c;
}
function textura(t) {
  ctx.save();
  ctx.globalCompositeOperation = "soft-light"; ctx.globalAlpha = 0.55;
  ctx.drawImage(MANCHAS, 0, 0);
  ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = 0.16 * tw("grao");
  const j = Math.floor(t * 12) % 4;
  ctx.drawImage(RUIDO, (j % 2) * 2 - 1, (j >> 1) * 2 - 1);
  ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha = 1;
  ctx.fillStyle = radial(ctx, W / 2, H / 2, Math.hypot(W, H) * 0.62, [[0.55, "rgba(255,255,255,0)"], [1, `rgba(40,30,40,${0.5 * tw("vinheta")})`]]);
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ---------- FLORESTA ----------
function samambaia(g, x, y, ang, comp, cor, r) {
  const n = 16, cx = Math.cos(ang), cy = Math.sin(ang), curva = (r() - 0.5) * 0.6;
  let px = x, py = y, a = ang;
  g.strokeStyle = cor; g.fillStyle = cor; g.lineWidth = 3; g.lineCap = "round";
  for (let i = 0; i < n; i++) {
    const k = i / n, passo = comp / n;
    a += curva / n;
    const nx = px + Math.cos(a) * passo, ny = py + Math.sin(a) * passo;
    g.beginPath(); g.moveTo(px, py); g.lineTo(nx, ny); g.stroke();
    const fol = comp * 0.28 * (1 - k * 0.85);
    for (const lado of [-1, 1]) {
      const fa = a + lado * 1.05;
      g.beginPath(); g.moveTo(px, py);
      g.lineTo(px + Math.cos(fa) * fol + Math.cos(a) * fol * 0.35, py + Math.sin(fa) * fol + Math.sin(a) * fol * 0.35);
      g.lineTo(nx, ny); g.fill();
    }
    px = nx; py = ny;
  }
  void cx; void cy;
}
function tufo(g, x, y, h, cor, r) {
  g.strokeStyle = cor; g.lineWidth = 2; g.lineCap = "round";
  g.lineWidth = 1.6;
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (r() - 0.5) * 1.3, b = x + (r() - 0.5) * 8;
    g.beginPath(); g.moveTo(b, y); g.quadraticCurveTo(b + Math.cos(a) * h * 0.3, y - h * 0.6, b + Math.cos(a) * h, y + Math.sin(a) * h); g.stroke();
  }
}
function moitinha(g, x, y, s, cor, r) {
  g.strokeStyle = cor; g.lineWidth = 2.2;
  for (let i = 0; i < 11; i++) {
    const a = -Math.PI + 0.15 + (i / 10) * (Math.PI - 0.3), l = s * (0.6 + r() * 0.5);
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5, y + Math.sin(a) * l * 0.7 - 4, x + Math.cos(a) * l, y + Math.sin(a) * l * 0.8); g.stroke();
    for (let k = 0.3; k < 1; k += 0.18) {
      const fx = x + Math.cos(a) * l * k, fy = y + Math.sin(a) * l * 0.8 * k;
      g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + Math.cos(a - 0.9) * 6, fy + Math.sin(a - 0.9) * 6); g.moveTo(fx, fy); g.lineTo(fx + Math.cos(a + 0.9) * 6, fy + Math.sin(a + 0.9) * 6); g.stroke();
    }
  }
}
function pedra(g, x, y, w, h) {
  const top = [[x - w / 2 + 6, y - h], [x + w / 2 - 6, y - h], [x + w / 2 + 4, y - h + 16], [x - w / 2 - 4, y - h + 16]];
  const frente = [[x - w / 2 - 4, y - h + 16], [x + w / 4, y - h + 16], [x + w / 4 + 2, y + 6], [x - w / 2 + 2, y + 2]];
  const lado = [[x + w / 4, y - h + 16], [x + w / 2 + 4, y - h + 16], [x + w / 2, y], [x + w / 4 + 2, y + 6]];
  elipse(g, x + 10, y + 6, w * 0.62, 16, "rgba(40,80,30,0.35)");
  poli(g, frente, "#b9beb7"); poli(g, lado, "#9ba19a"); poli(g, top, "#d9ddd5");
  const r = rng(5); g.fillStyle = "#7fa76a";
  for (let i = 0; i < 12; i++) { g.beginPath(); g.ellipse(x - w / 2 + r() * w, y - h + 2 + r() * 14, 6 + r() * 6, 2, 0, 0, 7); g.fill(); }
}
function fazerFloresta() {
  cache("fl-fundo", (g) => {
    g.fillStyle = grad(g, 0, Y0, 0, 660, [[0, "#d7e8c4"], [0.45, "#a9d0a6"], [1, "#7fb889"]]);
    g.fillRect(X0, Y0, X1 - X0, 760 - Y0);
    g.fillStyle = radial(g, 300, 120, 520, [[0, "rgba(255,252,220,0.95)"], [0.4, "rgba(240,248,210,0.4)"], [1, "rgba(240,248,210,0)"]]);
    g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    const r = rng(2);
    for (const [cor, n, w0, a] of [["#bcdcbd", 16, 10, 0.7], ["#94c39f", 11, 20, 0.85]]) {
      g.globalAlpha = a;
      for (let i = 0; i < larg(n); i++) {
        const x = X0 + r() * (X1 - X0), w = w0 + r() * w0;
        g.fillStyle = cor; g.fillRect(x, Y0, w, 700 - Y0);
        g.fillStyle = "rgba(255,255,240,0.35)"; g.fillRect(x, Y0, w * 0.28, 700 - Y0);
      }
    }
    g.globalAlpha = 1;
    g.fillStyle = grad(g, 0, 420, 0, 700, [[0, "rgba(235,248,225,0)"], [0.75, "rgba(235,248,225,0.85)"], [1, "rgba(220,240,200,0.6)"]]);
    g.fillRect(X0, 420, X1 - X0, 280);
  });
  cache("fl-clareira", (g) => {
    g.fillStyle = grad(g, 0, 640, 0, Math.max(1100, EB), [[0, "#b8de8e"], [0.35, "#8cc463"], [1, "#4e8c3c"]]);
    caminho(g, [[X0, 650], [X1, 650], [X1, Y1], [X0, Y1]]); g.fill();
    g.fillStyle = grad(g, 0, 636, 0, 662, [[0, "rgba(230,248,210,0.9)"], [1, "rgba(230,248,210,0)"]]);
    g.fillRect(X0, 636, X1 - X0, 26);
    for (const [rx, ry, a] of [[380, 108, 0.25], [300, 82, 0.3], [210, 56, 0.35]]) elipse(g, 540, 770, rx, ry, `rgba(236,250,180,${a})`);
    const r = rng(9);
    for (let i = 0; i < 9; i++) moitinha(g, 150 + r() * 780, 655 + r() * 18, 26 + r() * 14, "#5e9a52", r);
    for (let i = 0; i < area(160); i++) { const y = 680 + Math.pow(r(), 0.8) * (EB - 660); tufo(g, X0 + r() * (X1 - X0), y, 6 + (y - 660) * 0.05, r() < 0.5 ? "#5f9e47" : "#a5d67a", r); }
    pedra(g, 540, 770, 230, 86);
    // o anel sobre a pedra
    elipse(g, 541, 690, 22, 9, "#b8741c", 2.5); elipse(g, 541, 687, 22, 9, "#f2b440", 2.5); elipse(g, 541, 687, 14, 5, "#8f6a2a");
  });
  cache("fl-troncos", (g) => {
    const tronco = (x, w, cor, luz) => {
      poli(g, [[x, Y0], [x + w, Y0], [x + w + 8, Y1], [x - 8, Y1]], cor);
      g.fillStyle = luz; g.fillRect(x + w * 0.62, Y0, w * 0.12, Y1 - Y0);
    };
    tronco(EL - 60, 210, "#2f6b4a", "rgba(140,200,150,0.35)");
    tronco(ER - 150, 220, "#2b6345", "rgba(140,200,150,0.25)");
    g.fillStyle = "#3d7d55"; g.fillRect(EL + 150, Y0, 22, 760 - Y0); g.fillRect(ER - 175, Y0, 26, 720 - Y0);
    const r = rng(4);
    for (let i = 0; i < larg(26); i++) { // copa
      const x = X0 + r() * (X1 - X0), y = ET - 40 + r() * 90, rr = 60 + r() * 90;
      elipse(g, x, y, rr, rr * 0.55, i % 3 ? "#245a3a" : "#2e6c47");
    }
    g.strokeStyle = "#5c9a6a"; g.lineWidth = 3;
    for (let i = 0; i < larg(60); i++) { const x = X0 + r() * (X1 - X0), y = ET + r() * 90; g.beginPath(); g.ellipse(x, y, 9, 3, r() * 3, 0, 7); g.stroke(); }
  });
  cache("fl-frente", (g) => {
    const r = rng(14);
    for (let i = 0; i < 9; i++) samambaia(g, EL - 40 + r() * 120, EB + 40, -1.2 + r() * 0.9, 260 + r() * 140, i % 2 ? "#173d24" : "#22522f", r);
    for (let i = 0; i < 9; i++) samambaia(g, ER + 40 - r() * 120, EB + 40, -Math.PI + 1.2 - r() * 0.9, 260 + r() * 140, i % 2 ? "#173d24" : "#22522f", r);
  });
}
function raios(g, t, x0, y0, lista, cor, forca = 1) {
  const recua = OY / 0.85; // no 9:16 o céu continua para cima: o raio nasce mais atrás, na mesma direção
  g.save(); g.globalCompositeOperation = "screen";
  lista.forEach(([ang, larg, alcance, a], i) => {
    const pul = 0.75 + 0.25 * Math.sin(t * 0.7 + i * 1.7);
    const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
    const ox = x0 - dx * recua, oy = y0 - dy * recua, fx = x0 + dx * alcance, fy = y0 + dy * alcance;
    g.fillStyle = grad(g, ox, oy, fx, fy, [[0, cor + (a * pul * forca) + ")"], [1, cor + "0)"]]);
    caminho(g, [[ox + nx * larg * 0.2, oy + ny * larg * 0.2], [ox - nx * larg * 0.2, oy - ny * larg * 0.2], [fx - nx * larg, fy - ny * larg], [fx + nx * larg, fy + ny * larg]]);
    g.fill();
  });
  g.restore();
}
function cenaFloresta(alvo, u, ato) {
  const dur = ato.t1 - ato.t0, k = ease(u / dur);
  const C = { z: 1 + 0.14 * k, cx: 540, cy: 720, px: 0, py: 0 };
  poe(alvo, CACHE["fl-fundo"], 0.3, C, 1.5);
  vivo(alvo, 0.35, C, 0, (g) => raios(g, u, 250, -60, [[1.08, 70, 900, 0.32], [1.22, 40, 860, 0.25], [0.98, 30, 820, 0.2], [1.35, 55, 780, 0.18]], "rgba(255,255,220,"));
  poe(alvo, CACHE["fl-clareira"], 0.6, C);
  vivo(alvo, 0.6, C, 0, (g) => {
    const brilhoAnel = seg(u, 1.4, 2.2) * (1 - seg(u, 3.0, 3.8));
    brilho(g, 541, 687, 60, "rgba(255,220,140,0.8)", 0.5 + 0.5 * brilhoAnel);
    estrela(g, 556, 682, 16, brilhoAnel);
  });
  vivo(alvo, 0.55, C, 0, (g) => particulas(g, 40, 6, u, null, (g, i, x0, y0, v, f, tam, t) => {
    const x = 120 + x0 * 840 + Math.sin(t * (0.4 + v) + f * 6) * 20, y = 120 + y0 * 560 - t * (6 + v * 10) % 560;
    const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * (1 + v * 2) + f * 9));
    brilho(g, x, y, 4 + tam * 6, "rgba(255,255,210,0.9)", a);
  }));
  poe(alvo, CACHE["fl-troncos"], 0.85, C, 2 + 3 * k);
  poe(alvo, CACHE["fl-frente"], 1.4, C, 2.5 + 3 * k);
}

// ---------- ANEL (close) ----------
function fazerAnel() {
  cache("an-fundo", (g) => {
    g.fillStyle = grad(g, 0, Y0, 0, 640, [[0, "#3f7c5a"], [0.6, "#6aa27d"], [1, "#a9cf9a"]]);
    g.fillRect(X0, Y0, X1 - X0, 700 - Y0);
    const r = rng(8);
    for (let i = 0; X0 + i * 135 < X1; i++) {
      const x = X0 + 20 + i * 135 + r() * 40, w = 70 + r() * 90;
      g.fillStyle = i % 2 ? "#2c6448" : "#3a7656"; g.fillRect(x, Y0, w, 720 - Y0);
    }
    g.fillStyle = grad(g, 0, 380, 0, 640, [[0, "rgba(220,240,210,0)"], [1, "rgba(220,240,210,0.75)"]]);
    g.fillRect(X0, 380, X1 - X0, 300);
    raios(g, 1.5, 420, -120, [[1.25, 140, 900, 0.45], [1.45, 90, 850, 0.35], [1.6, 60, 800, 0.3]], "rgba(240,255,220,");
  });
  borrado("an-fundo", 22);
  cache("an-chao", (g) => {
    g.fillStyle = grad(g, 0, 600, 0, Math.max(1100, EB), [[0, "#a8d878"], [0.3, "#86c25a"], [1, "#4f8f3a"]]);
    caminho(g, [[X0, 606], [X1, 600], [X1, Y1], [X0, Y1]]); g.fill();
    const r = rng(12);
    for (let i = 0; i < area(110); i++) { // musgo em manchas, menores perto do horizonte
      const y = 610 + Math.pow(r(), 1.3) * (EB + 40 - 610), s = 0.25 + (y - 600) / 480, x = X0 + r() * (X1 - X0);
      const pts = [...Array(7)].map((_, k) => [x + Math.cos(k * 0.9) * (30 + r() * 30) * s, y + Math.sin(k * 0.9) * (12 + r() * 10) * s]);
      poli(g, pts, ["#6fae4f", "#5d9c43", "#93cb66", "#b9e08a"][i % 4]);
    }
    for (let i = 0; i < area(4000); i++) { // pontinhos de grama
      const y = 606 + Math.pow(r(), 1.1) * (EB + 40 - 606), s = 0.4 + (y - 600) / 380;
      g.fillStyle = r() < 0.5 ? "rgba(200,240,150,0.55)" : "rgba(50,100,40,0.35)";
      g.fillRect(X0 + r() * (X1 - X0), y, 1.4 * s, 3.5 * s);
    }
    for (let i = 0; i < area(20); i++) { // pedrinhas
      const y = 640 + Math.pow(r(), 0.9) * (EB - 620), s = 0.4 + (y - 600) / 400, x = X0 + r() * (X1 - X0);
      if (Math.abs(x - 540) < 200 && y < 780) continue;
      elipse(g, x + 2, y + 5 * s, 22 * s, 7 * s, "rgba(40,70,30,0.35)");
      elipse(g, x, y, 22 * s, 11 * s, "#c9ccc4"); elipse(g, x - 4 * s, y - 3 * s, 12 * s, 5 * s, "#e6e8e0");
    }
  });
  borrado("an-chao", 9);
}
function anelGrande(g, x, y, rx, ry, h, quente = 0) {
  elipse(g, x + 10, y + h + 16, rx * 1.02, ry * 0.9, "rgba(30,60,20,0.35)");
  // faixa de baixo e lados
  g.beginPath(); g.ellipse(x, y + h, rx, ry, 0, 0, Math.PI); g.lineTo(x - rx, y); g.ellipse(x, y, rx, ry, 0, Math.PI, 0, true); g.closePath();
  g.fillStyle = grad(g, x - rx, 0, x + rx, 0, [[0, "#d98f22"], [0.55, "#e8a032"], [0.6, "#c27a1c"], [1, "#a8661a"]]); g.fill();
  g.lineWidth = 4; g.strokeStyle = "#4a2a10"; g.stroke();
  // topo
  elipse(g, x, y, rx, ry, "#f5b84a", 4);
  g.save(); g.beginPath(); g.ellipse(x, y, rx * 0.78, ry * 0.7, 0, 0, Math.PI * 2); g.clip();
  g.fillStyle = "#9c5e17"; g.fillRect(x - rx, y - ry, 2 * rx, 2 * ry); // parede de dentro, ao fundo
  g.fillStyle = "#7aa54e"; g.beginPath(); g.ellipse(x, y + h * 0.75, rx * 0.78, ry * 0.7, 0, 0, Math.PI * 2); g.fill(); // o musgo pelo buraco
  g.fillStyle = "rgba(255,230,160,0.35)"; g.beginPath(); g.ellipse(x - rx * 0.1, y - ry * 0.15, rx * 0.55, ry * 0.25, 0, 0, Math.PI * 2); g.fill();
  g.restore();
  g.beginPath(); g.ellipse(x, y, rx * 0.78, ry * 0.7, 0, 0, Math.PI * 2); g.lineWidth = 3.5; g.strokeStyle = "#4a2a10"; g.stroke();
  g.strokeStyle = "rgba(255,240,200,0.8)"; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, rx * 0.89, ry * 0.85, 0, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
  if (quente) brilho(g, x, y + h / 2, rx * 2, "rgba(255,150,40,1)", quente);
}
function joaninha(g, x, y, t) {
  const pe = Math.sin(t * 22) * 3;
  g.strokeStyle = LINHA; g.lineWidth = 2;
  for (const [a, b] of [[-8, 8], [0, 10], [8, 8]]) { g.beginPath(); g.moveTo(x + a, y + 3); g.lineTo(x + a + (a ? pe : -pe), y + b); g.stroke(); }
  elipse(g, x - 15, y - 2, 8, 7, "#20161a", 2);
  g.beginPath(); g.ellipse(x, y - 4, 16, 13, 0, 0, Math.PI * 2); g.fillStyle = "#d9302b"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINHA; g.stroke();
  g.beginPath(); g.moveTo(x - 10, y - 4); g.lineTo(x + 14, y - 4); g.stroke();
  for (const [a, b] of [[-4, -10], [6, -9], [0, 2], [9, 1]]) elipse(g, x + a, y + b, 2.6, 2.6, LINHA);
  elipse(g, x - 3, y - 11, 4, 2, "rgba(255,255,255,0.6)");
  elipse(g, x - 18, y - 4, 1.6, 1.6, "#fff");
}
function cenaAnel(alvo, u, ato) {
  const dur = ato.t1 - ato.t0, k = ease(u / dur);
  const C = { z: 1.02 + 0.08 * k, cx: 540, cy: 680, px: 0, py: 0 };
  poe(alvo, CACHE["an-fundo~22"], 0.2, C);
  poe(alvo, CACHE["an-chao"], 0.6, C);
  vivo(alvo, 0.6, C, 0, (g) => { // a parte de baixo do chão, perto da câmera, fora de foco
    g.save(); g.globalCompositeOperation = "source-over";
    g.drawImage(CACHE["an-chao~9"], X0, Y0);
    g.globalCompositeOperation = "destination-in";
    g.fillStyle = grad(g, 0, 840, 0, 980, [[0, "rgba(0,0,0,0)"], [1, "rgba(0,0,0,1)"]]); g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    g.restore();
  }, "source-over");
  vivo(alvo, 0.6, C, 0, (g) => {
    raios(g, u, 300, -100, [[1.1, 170, 900, 0.28]], "rgba(255,250,215,");
    anelGrande(g, 540, 640, 150, 58, 50);
    const xj = 840 - Math.min(1, u / 2.4) * 110;
    joaninha(g, xj, 712, u < 2.4 ? u : 0);
    const cint = seg(u, 0.9, 1.2) * (1 - seg(u, 1.6, 2.1));
    estrela(g, 668, 604, 30, cint);
    estrela(g, 420, 620, 18, seg(u, 1.9, 2.2) * (1 - seg(u, 2.4, 2.9)));
  });
  vivo(alvo, 1.3, C, 10, (g) => particulas(g, 14, 31, u, null, (g, i, x0, y0, v, f, tam, t) => {
    const x = X0 + x0 * (X1 - X0) + Math.sin(t * 0.5 + f * 6) * 30, y = ET + y0 * (EB - ET) * 0.8 - t * 8;
    brilho(g, x, y, 14 + tam * 22, "rgba(255,255,220,0.8)", 0.35 + 0.3 * Math.sin(t + f * 7));
  }));
}

// ---------- FORJA ----------
function fazerForja() {
  cache("fo-caverna", (g) => {
    g.fillStyle = grad(g, 0, Y0, 0, Y1, [[0, "#170e0f"], [0.5, "#2a1715"], [1, "#3a1d15"]]);
    g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    const r = rng(17);
    for (let i = 0, y = 545; y > ET - 60; i++, y -= 85) { // degraus de rocha ao fundo
      g.fillStyle = i % 2 ? "#241413" : "#2c1916"; g.fillRect(EL + 180, y, ER - EL - 360, 60);
      g.fillStyle = "rgba(255,120,50,0.08)"; g.fillRect(EL + 180, y + 56, ER - EL - 360, 4);
    }
    g.fillStyle = radial(g, 260, 820, 620, [[0, "rgba(255,110,40,0.55)"], [0.5, "rgba(190,60,25,0.25)"], [1, "rgba(120,30,20,0)"]]);
    g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    for (let i = 0; i < Math.round(26 * (EB - ET) / 1080); i++) { // lascas de rocha nas paredes
      const lado = i % 2, x = lado ? ER - 220 + r() * 260 : EL - 60 + r() * 240, y = ET + r() * (EB - ET - 180), s = 30 + r() * 50;
      const pts = [[x, y], [x + s, y + s * 0.2], [x + s * 0.8, y + s], [x - s * 0.1, y + s * 0.8]];
      poli(g, pts, ["#2e1a17", "#3a221d", "#26150f"][i % 3]);
      g.strokeStyle = "rgba(255,130,60,0.18)"; g.lineWidth = 2; g.beginPath(); g.moveTo(...pts[3]); g.lineTo(...pts[2]); g.stroke();
    }
    poli(g, [[X0, Y0], [EL + 190, Y0], [EL + 150, 380], [EL + 210, 900], [EL + 130, Y1], [X0, Y1]], "#1b100f");
    poli(g, [[X1, Y0], [ER - 200, Y0], [ER - 160, 420], [ER - 220, 860], [ER - 140, Y1], [X1, Y1]], "#1b100f");
    for (let i = 0; i < larg(12); i++) { const x = EL + 160 + r() * (ER - EL - 320), w = 20 + r() * 30, h = 50 + r() * 110; poli(g, [[x, Y0], [x + w, Y0], [x + w / 2, ET + h]], "#140b0c"); }
  });
  cache("fo-chao", (g) => {
    poli(g, [[X0, 905], [X1, 890], [X1, Y1], [X0, Y1]], "#1d1210");
    g.fillStyle = "rgba(255,140,60,0.35)"; g.fillRect(X0, 900, X1 - X0, 4);
    poli(g, [[600, 900], [612, 760], [800, 760], [826, 900]], "#3b2520", 3); // bloco de pedra sob a bigorna
    g.fillStyle = "rgba(255,140,60,0.25)"; g.fillRect(612, 760, 188, 5);
    // bigorna
    forma(g, [[640, 640], [770, 640], [790, 655], [770, 668], [740, 668], [735, 700], [770, 740], [770, 762], [640, 762], [640, 740], [670, 700], [665, 668], [640, 668], [590, 652]], "#2a2a33", "#7a3a24", 6, 0, 4);
    g.fillStyle = "#e07a3a"; g.fillRect(640, 640, 130, 4);
  });
  cache("fo-frente", (g) => {
    poli(g, [[X0, EB - 120], [EL + 140, EB - 90], [EL + 230, Y1], [X0, Y1]], "#0f0909");
    poli(g, [[X1, EB - 130], [ER - 120, EB - 80], [ER - 200, Y1], [X1, Y1]], "#0f0909");
  });
}
function chama(g, x, y, w, h, t, f) {
  const tremor = (k) => Math.sin(t * (9 + k) + f * 3 + k) * w * 0.12 + Math.sin(t * (14 + k * 2) + f) * w * 0.06;
  for (const [cor, s] of [["#c9351f", 1], ["#ee6a24", 0.78], ["#ffb43a", 0.55], ["#fff0b8", 0.3]]) {
    const ww = w * s, hh = h * s;
    g.beginPath(); g.moveTo(x - ww / 2, y);
    const pontas = 3;
    for (let i = 0; i < pontas; i++) {
      const ax = x - ww / 2 + (ww / pontas) * (i + 0.5), alt = hh * (i === 1 ? 1 : 0.68 + 0.08 * Math.sin(t * 7 + i));
      g.quadraticCurveTo(x - ww / 2 + (ww / pontas) * i, y - alt * 0.4, ax + tremor(i), y - alt);
      g.quadraticCurveTo(x - ww / 2 + (ww / pontas) * (i + 1), y - alt * 0.45, x - ww / 2 + (ww / pontas) * (i + 1), y - hh * 0.15);
    }
    g.quadraticCurveTo(x + ww / 2, y + ww * 0.18, x, y + ww * 0.18);
    g.quadraticCurveTo(x - ww / 2, y + ww * 0.18, x - ww / 2, y);
    g.fillStyle = cor; g.fill();
  }
}
function lava(g, t) {
  const pts = [[EL - 90, 960], [80, 925], [230, 905], [330, 898], [400, 897]];
  const at = (k) => { const i = Math.min(pts.length - 2, Math.floor(k * (pts.length - 1))), f = k * (pts.length - 1) - i; return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]; };
  brilho(g, 160, 950, 380, "rgba(255,120,40,0.7)", 0.7 + 0.1 * Math.sin(t * 2));
  const borda = (lado) => [...Array(21)].map((_, i) => { const k = i / 20, [x, y] = at(k), w = lerp(46, 14, k); return [x, y + lado * w]; });
  const cima = borda(-1), baixo = borda(1).reverse();
  caminho(g, [...cima, ...baixo]);
  g.fillStyle = grad(g, 0, 860, 0, 1060, [[0, "#ff8a2a"], [0.45, "#ffd56a"], [1, "#e0521f"]]); g.fill();
  g.lineWidth = 4; g.strokeStyle = "#5a1d10"; g.stroke();
  for (let i = 0; i < 9; i++) { // crostas que descem com a lava
    const k = ((i / 9 + t * 0.035) % 1), [x, y] = at(1 - k), w = lerp(46, 14, 1 - k);
    elipse(g, x, y + Math.sin(i * 3) * w * 0.3, w * 0.5, w * 0.22, "#3a1d14");
  }
}
const OMBRO = [527, 440], BATIDA = 0.845, ALTO = -2.15, PERIODO = 1.45;
function anguloMartelo(u) {
  const p = ((u - 0.25) % PERIODO + PERIODO) % PERIODO / PERIODO;
  if (u < 0.25) return BATIDA;
  return p < 0.72 ? lerp(BATIDA, ALTO, ease(p / 0.72)) : lerp(ALTO, BATIDA, Math.pow((p - 0.72) / 0.28, 2));
}
function batidas(ato) { // momentos (no vídeo) em que o martelo bate na bigorna
  const out = [];
  for (let u = 0.25 + PERIODO; ato.t0 + u < ato.t1 - 0.2; u += PERIODO) out.push(ato.t0 + u);
  return out;
}
function braco(g, pts, larg, cor, luz) {
  g.lineCap = g.lineJoin = "round";
  caminho(g, pts, false); g.strokeStyle = LINHA; g.lineWidth = larg + 8; g.stroke();
  caminho(g, pts, false); g.strokeStyle = luz; g.lineWidth = larg; g.stroke();
  g.save(); g.translate(-3, 0); caminho(g, pts, false); g.strokeStyle = cor; g.lineWidth = larg - 6; g.stroke(); g.restore();
}
function senhor(g, u, poder, o = {}) { // o.martelo === false: sem martelo nem tenaz (guerra); o.braco: ângulo do braço livre
  const martelo = o.martelo !== false;
  const ARM = "#2b2a36", PLACA = "#383749", LUZ = "#d9672e", CAPA = "#1c1a23";
  const resp = Math.sin(u * 1.6) * 3;
  g.save(); g.translate(0, resp * 0.3);
  // capa
  forma(g, [[340, 420], [545, 420], [600, 640], [640, 930], [585, 915], [540, 935], [470, 918], [400, 938], [330, 915], [255, 935], [300, 640]], CAPA, "#6a2a1c", 7, 0, 4);
  // pernas
  forma(g, [[385, 760], [432, 760], [430, 905], [440, 935], [370, 935], [382, 905]], ARM, LUZ, 4);
  forma(g, [[452, 760], [500, 760], [505, 905], [530, 935], [462, 935], [455, 905]], ARM, LUZ, 4);
  forma(g, [[378, 840], [436, 840], [434, 860], [380, 860]], PLACA, LUZ, 3, 0, 3);
  forma(g, [[456, 840], [503, 840], [505, 860], [458, 860]], PLACA, LUZ, 3, 0, 3);
  // saiote de placas
  for (let i = 0; i < 4; i++) { const x = 370 + i * 36; forma(g, [[x, 622], [x + 38, 622], [x + 40, 770], [x + 2, 775]], PLACA, LUZ, 4, 0, 3); }
  // tronco
  forma(g, [[365, 430], [512, 430], [522, 520], [500, 620], [380, 620], [356, 520]], ARM, LUZ, 6);
  g.strokeStyle = LINHA; g.lineWidth = 3;
  for (const y of [540, 565, 590]) { g.beginPath(); g.moveTo(380, y); g.quadraticCurveTo(440, y + 8, 500, y); g.stroke(); }
  forma(g, [[372, 612], [508, 612], [508, 636], [372, 636]], "#1f1e28", LUZ, 3, 0, 3);
  poli(g, [[440, 615], [452, 624], [440, 633], [428, 624]], "#55536a", 2);
  // a joia no peito: acende quando ele põe a si mesmo no anel
  brilho(g, 440, 480, 40 + 30 * poder, "rgba(255,110,40,1)", 0.6 + 0.4 * poder);
  elipse(g, 440, 480, 13, 17, "#e2502a", 3); elipse(g, 437, 474, 5, 6, "#ffc07a");
  // braço da tenaz (cruza o corpo até a bigorna)
  braco(g, [[350, 450], [450, 580], [632, 646]], 38, ARM, LUZ);
  if (martelo) {
    g.strokeStyle = "#151318"; g.lineWidth = 6; g.lineCap = "round";
    g.beginPath(); g.moveTo(640, 646); g.lineTo(700, 636); g.moveTo(640, 652); g.lineTo(700, 642); g.stroke();
  }
  elipse(g, 450, 580, 19, 19, PLACA, 3);
  elipse(g, 630, 648, 20, 17, PLACA, 3);
  // ombreiras com espinhos
  forma(g, [[300, 420], [340, 395], [395, 400], [400, 470], [345, 485], [305, 470]], PLACA, LUZ, 5);
  poli(g, [[312, 418], [205, 380], [300, 455]], ARM, 3);
  forma(g, [[480, 400], [540, 392], [578, 420], [575, 468], [520, 478], [478, 465]], PLACA, LUZ, 6);
  poli(g, [[560, 405], [600, 340], [575, 430]], ARM, 3);
  g.strokeStyle = LINHA; g.lineWidth = 3;
  for (const dy of [22, 42]) { g.beginPath(); g.moveTo(305, 420 + dy); g.quadraticCurveTo(350, 405 + dy, 398, 412 + dy); g.stroke(); g.beginPath(); g.moveTo(480, 412 + dy); g.quadraticCurveTo(530, 402 + dy, 576, 420 + dy); g.stroke(); }
  // elmo e coroa de espinhos
  for (let i = 0; i < 11; i++) {
    const a = -Math.PI / 2 + (i - 5) * 0.16, h = 70 + (i % 3) * 22 - Math.abs(i - 5) * 7, bx = 438 + (i - 5) * 8;
    poli(g, [[bx - 7, 310], [bx + Math.cos(a) * h, 300 + Math.sin(a) * h], [bx + 7, 310]], i % 2 ? "#26252f" : "#33323f", 2.5);
  }
  forma(g, [[396, 310], [482, 310], [490, 360], [478, 405], [438, 418], [398, 405], [388, 360]], ARM, LUZ, 5);
  poli(g, [[398, 345], [480, 345], [474, 372], [404, 372]], "#0d0b0f");
  for (const ex of [420, 458]) { brilho(g, ex, 358, 22 + 10 * poder, "rgba(255,120,40,1)", 0.9); poli(g, [[ex - 14, 354], [ex + 14, 354], [ex + 10, 362], [ex - 10, 362]], "#ffb04a"); }
  g.strokeStyle = LINHA; g.lineWidth = 3; g.beginPath(); g.moveTo(438, 372); g.lineTo(438, 412); g.stroke();
  // braço do martelo
  const a = martelo ? anguloMartelo(u) : (o.braco ?? -1.2), dx = Math.cos(a), dy = Math.sin(a);
  const cot = [OMBRO[0] + dx * 90 - dy * 14, OMBRO[1] + dy * 90 + dx * 14], mao = [OMBRO[0] + dx * 165, OMBRO[1] + dy * 165];
  const ponta = [OMBRO[0] + dx * 226, OMBRO[1] + dy * 226];
  if (martelo) {
    g.strokeStyle = "#5a3a22"; g.lineWidth = 11; g.lineCap = "round"; g.beginPath(); g.moveTo(...mao); g.lineTo(...ponta); g.stroke();
    g.save(); g.translate(...ponta); g.rotate(a);
    forma(g, [[-20, -50], [34, -50], [34, 50], [-20, 50]], "#3a3946", "#d9672e", 0, 6, 3.5);
    g.fillStyle = "#c9a04a"; g.fillRect(22, -50, 12, 100);
    g.restore();
  }
  braco(g, [OMBRO, cot, mao], 40, ARM, LUZ);
  elipse(g, cot[0], cot[1], 19, 19, PLACA, 3);
  elipse(g, mao[0], mao[1], 21, 18, PLACA, 3);
  g.restore();
}
function cenaForja(alvo, u, ato) {
  const dur = ato.t1 - ato.t0, k = ease(u / dur);
  const f = ato.fala, poder = f ? seg(u, (f.t1 - ato.t0) * 0.55, (f.t1 - ato.t0) * 0.85) : 0;
  const C = { z: 1 + 0.12 * k, cx: 600, cy: 560, px: 0, py: 0 };
  poe(alvo, CACHE["fo-caverna"], 0.3, C, 3);
  poe(alvo, CACHE["fo-chao"], 0.6, C);
  vivo(alvo, 0.6, C, 0, (g) => lava(g, u));
  vivo(alvo, 0.6, C, 0, (g) => {
    // o anel na bigorna, em brasa; cada batida solta faíscas
    const desde = ((u - 0.25) % PERIODO + PERIODO) % PERIODO, bateu = u > 0.25 + PERIODO * 0.99 ? Math.max(0, 1 - desde / 0.45) : 0;
    brilho(g, 702, 636, 70 + 60 * poder + 40 * bateu, "rgba(255,170,60,1)", 0.7 + 0.3 * poder);
    elipse(g, 702, 640, 22, 8, "#c75a1a", 2.5); elipse(g, 702, 637, 22, 8, poder > 0.5 ? "#ffe08a" : "#ffb347", 2.5); elipse(g, 702, 637, 13, 4, "#7a2e12");
    if (bateu > 0) {
      const r = rng(Math.floor((u - 0.25) / PERIODO) * 7 + 1);
      g.strokeStyle = "#ffd78a"; g.lineCap = "round";
      for (let i = 0; i < 26; i++) {
        const a = -Math.PI * (0.05 + r() * 0.9), v = 120 + r() * 260, d = (1 - bateu) * v, x = 702 + Math.cos(a) * d, y = 630 + Math.sin(a) * d + (1 - bateu) ** 2 * 120;
        g.globalAlpha = bateu; g.lineWidth = 2 + r() * 2;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.cos(a) * 14, y - Math.sin(a) * 14); g.stroke();
      }
      g.globalAlpha = 1;
      brilho(g, 702, 630, 220, "rgba(255,200,120,1)", bateu * 0.8);
    }
    senhor(g, u, poder);
    if (poder > 0) { // fios de sombra e brasa saem da joia do peito para o anel
      g.save(); g.lineCap = "round"; g.shadowColor = "rgba(255,110,40,0.9)"; g.shadowBlur = 14;
      for (let i = 0; i < 5; i++) {
        const fase = u * 1.3 + i * 0.37;
        g.strokeStyle = i % 2 ? "rgba(255,120,40,0.75)" : "rgba(30,10,25,0.85)"; g.lineWidth = 5 - i * 0.5;
        g.setLineDash([26, 18]); g.lineDashOffset = -fase * 120;
        g.globalAlpha = poder;
        g.beginPath(); g.moveTo(440, 480); g.bezierCurveTo(520 + i * 12, 420 - i * 20, 640 - i * 10, 520 + i * 18, 702, 636); g.stroke();
      }
      g.restore();
    }
    chama(g, 960, 905, 110, 230, u, 0);
    brilho(g, 960, 820, 260, "rgba(255,120,40,1)", 0.55 + 0.08 * Math.sin(u * 11));
  });
  vivo(alvo, 0.9, C, 0, (g) => particulas(g, 70, 44, u, null, (g, i, x0, y0, v, f, tam, t) => {
    const y = EB - ((y0 * (EB - ET) + t * (40 + v * 90)) % (EB - ET + 100)), x = X0 + x0 * (X1 - X0) + Math.sin(t * (1 + v) + f * 9) * 25;
    const a = 0.4 + 0.6 * Math.abs(Math.sin(t * 3 + f * 11));
    g.fillStyle = `rgba(255,${150 + Math.floor(v * 80)},70,${a})`; g.fillRect(x, y, 2 + tam * 3, 2 + tam * 3);
  }));
  poe(alvo, CACHE["fo-frente"], 1.4, C, 8);
}

// ---------- legenda ----------
function legenda(t) {
  const ato = TEMPO.atos.find((a) => a.fala && t >= a.fala.t0 - 0.15 && t < a.fala.t1 + 0.5);
  if (!ato) return;
  const f = ato.fala, a = seg(t, f.t0 - 0.15, f.t0 + 0.1) * (1 - seg(t, f.t1 + 0.2, f.t1 + 0.5));
  ctx.save();
  ctx.globalAlpha = a; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  const L = Math.min(W, H);
  ctx.font = `600 ${Math.round(L * (H > W ? 0.046 : 0.041))}px Lora`;
  // quebra em linhas que caibam em 86% da largura
  const linhas = [], max = L * 0.86;
  let atual = "";
  for (const p of f.texto.split(" ")) { const c = atual ? atual + " " + p : p; if (ctx.measureText(c).width > max && atual) { linhas.push(atual); atual = p; } else atual = c; }
  linhas.push(atual);
  const lh = L * (H > W ? 0.058 : 0.052), y0 = (H > W ? H * 0.8 : OY + 1080 * 0.94) - (linhas.length - 1) * lh;
  linhas.forEach((l, i) => {
    ctx.shadowColor = "rgba(0,0,0,0.85)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 2;
    ctx.lineWidth = 5; ctx.strokeStyle = "rgba(20,12,10,0.55)"; ctx.strokeText(l, W / 2, y0 + i * lh);
    ctx.shadowBlur = 0; ctx.fillStyle = "#fbf6ea"; ctx.fillText(l, W / 2, y0 + i * lh);
  });
  ctx.restore();
}

// ---------- montagem ----------
const CENAS = { floresta: cenaFloresta, anel: cenaAnel, forja: cenaForja };
const PREPARA = { floresta: fazerFloresta, anel: fazerAnel, forja: fazerForja }; // camadas em cache de cada cena
const FUNDE = 0.35; // dissolve entre cenas

function desenhaAto(alvo, ato, t) {
  alvo.save(); alvo.fillStyle = "#000"; alvo.fillRect(0, 0, W, H);
  const z = H > W ? 1.22 : 1; // no 9:16 o quadro aperta nos lados, para o assunto não ficar pequeno
  alvo.translate(W / 2, H / 2); alvo.scale(z, z); alvo.translate(-W / 2, -H / 2);
  (CENAS[ato.cena] || (() => {}))(alvo, t - ato.t0, ato);
  alvo.restore();
}
function eventos() {
  const quando = (cena, f) => TEMPO.atos.filter((a) => a.cena === cena).map((a) => a.t0 + f(a));
  return {
    batidas: TEMPO.atos.filter((a) => a.cena === "forja").flatMap(batidas),
    corte: quando("guerra", (a) => naFala(a, 0.6)),
    queda: quando("queda", (a) => quedaTempo(a) + 0.85),
  };
}
async function iniciar(tempo) {
  TEMPO = tempo;
  [W, H] = TAM[tempo.formato || "1:1"];
  const c = document.getElementById("c"); c.width = W; c.height = H;
  OX = (W - 1080) / 2; OY = (H - 1080) / 2;
  EL = -OX; ER = 1080 + OX; ET = -OY; EB = 1080 + OY;
  X0 = EL - M; X1 = ER + M; Y0 = ET - M; Y1 = EB + M;
  ctx = c.getContext("2d");
  S = tela(W + 2 * M, H + 2 * M); SC = S.getContext("2d");
  BUF = tela(W, H); BC = BUF.getContext("2d");
  AUX = tela(W + 2 * M, H + 2 * M); AC = AUX.getContext("2d");
  RUIDO = fazerRuido(); MANCHAS = fazerManchas();
  await document.fonts.load("600 40px Lora");
  const usadas = new Set(tempo.atos.map((a) => a.cena));
  for (const c of new Set([...usadas].map((c) => PREPARA[c]))) if (c) c();
}
function quadro(t) {
  const i = Math.max(0, TEMPO.atos.findIndex((a) => t < a.t1)), ato = TEMPO.atos[i === -1 ? TEMPO.atos.length - 1 : i];
  desenhaAto(ctx, ato, t);
  const ant = TEMPO.atos[i - 1];
  if (ant && t < ato.t0 + FUNDE) {
    desenhaAto(BC, ant, t);
    ctx.save(); ctx.globalAlpha = 1 - ease((t - ato.t0) / FUNDE); ctx.drawImage(BUF, 0, 0); ctx.restore();
  }
  textura(t);
  ctx.save(); ctx.globalAlpha = Math.max(1 - seg(t, 0, 0.8), seg(t, TEMPO.total - 1.4, TEMPO.total - 0.1)); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H); ctx.restore(); // abre do preto e apaga no fim
  legenda(t);
}
