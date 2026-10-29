// Histórias Reais: o traço (lápis de cor sobre papel) e as pessoas, desenhadas sentadas de frente na cadeira, como no vídeo real.
// Coordenadas da pessoa: origem no meio do assento, y para baixo. Cabeça grande (proporção de livro infantil).

const LINHA = "#3a2216";
let LAPIS; // padrão de lápis de cor, multiplicado por cima de toda cor chapada

function fazerLapis() {
  const s = 220, g = tela(s, s), c = g.getContext("2d"), r = rng(11);
  c.lineCap = "round";
  for (let i = 0; i < 1400; i++) {
    const x = r() * s, y = r() * s, a = -0.9 + (r() - 0.5) * 0.5, l = 6 + r() * 18;
    c.strokeStyle = r() < 0.55 ? `rgba(40,20,10,${0.05 + r() * 0.08})` : `rgba(255,250,235,${0.08 + r() * 0.12})`;
    c.lineWidth = 0.8 + r() * 1.6;
    for (const dx of [-s, 0, s]) for (const dy of [-s, 0, s]) {
      c.beginPath(); c.moveTo(x + dx, y + dy); c.lineTo(x + dx + Math.cos(a) * l, y + dy + Math.sin(a) * l); c.stroke();
    }
  }
  return ctx.createPattern(g, "repeat");
}

const elip = (cx, cy, rx, ry, n = 18, rot = 0) => [...Array(n)].map((_, i) => {
  const a = (i / n) * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
  return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
});
function mexe(pts, amp, rnd) { return pts.map(([x, y]) => [x + (rnd() - 0.5) * amp, y + (rnd() - 0.5) * amp]); }
// curva suave que passa pelos pontos (Catmull-Rom)
function curva(c, p, fechado = true) {
  const n = p.length, q = (i) => p[fechado ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  c.beginPath(); c.moveTo(...p[0]);
  for (let i = 0; i < (fechado ? n : n - 1); i++) {
    const [a, b, d, e] = [q(i - 1), q(i), q(i + 1), q(i + 2)];
    c.bezierCurveTo(b[0] + (d[0] - a[0]) / 6, b[1] + (d[1] - a[1]) / 6, d[0] - (e[0] - b[0]) / 6, d[1] - (e[1] - b[1]) / 6, d[0], d[1]);
  }
  if (fechado) c.closePath();
}
// forma chapada + lápis por cima + contorno tremido (o contorno "ferve" a 12 por segundo)
function forma(c, pts, cor, R, o = {}) {
  const p = mexe(pts, o.amp ?? 2.2, R);
  curva(c, p);
  c.fillStyle = cor; c.fill();
  c.save(); c.clip(); c.fillStyle = LAPIS; c.fill(); if (o.dentro) o.dentro(); c.restore();
  if (o.linha === 0) return;
  c.strokeStyle = o.cor || LINHA; c.lineWidth = o.linha || 3.2; c.lineJoin = c.lineCap = "round";
  curva(c, mexe(p, 1.2, R)); c.stroke();
}
function risco(c, pts, R, larg = 3, cor = LINHA, alpha = 1) {
  c.save(); c.globalAlpha = alpha; c.strokeStyle = cor; c.lineWidth = larg; c.lineCap = c.lineJoin = "round";
  curva(c, mexe(pts, 1.4, R), false); c.stroke(); c.restore();
}
// braço, perna: um tubo com contorno
function tubo(c, pts, larg, cor, R) {
  const p = mexe(pts, 1.5, R);
  c.save(); c.lineCap = c.lineJoin = "round";
  c.strokeStyle = LINHA; c.lineWidth = larg + 6; curva(c, p, false); c.stroke();
  c.strokeStyle = cor; c.lineWidth = larg; curva(c, p, false); c.stroke();
  c.globalCompositeOperation = "source-atop"; c.strokeStyle = LAPIS; c.stroke();
  c.restore();
}

// ---------- o elenco (cores e roupas tiradas dos quadros do vídeo) ----------
const PESSOAS = {
  nikolas: { pele: "#e7b08a", cabelo: { tipo: "topete", cor: "#4a3022" }, blusa: { tipo: "camiseta", cor: "#232022" }, baixo: { tipo: "calca", cor: "#8eaacb" }, pe: { tipo: "tenis", cor: "#1d1b1c" }, idade: 0 },
  dona: { pele: "#c88a62", cabelo: { tipo: "ondulado", cor: "#a29a90", luz: "#cfc8bd" }, blusa: { tipo: "blusa", cor: "#eba63a" }, baixo: { tipo: "saia-longa", cor: "#e6dbbf", estampa: ["#6c6a37", "#2a2620", "#a69a52"] }, pe: { tipo: "chinelo", cor: "#3a3530" }, idade: 2, largura: 1.12 },
  seu: { pele: "#6c432c", cabelo: { tipo: "calvo", cor: "#1c1512" }, bigode: true, blusa: { tipo: "brasil", cor: "#f4c534", gola: "#1f8a4c" }, baixo: { tipo: "bermuda", cor: "#5c7a98" }, pe: { tipo: "chinelo", cor: "#2c3a52" }, idade: 2, largura: 0.94 },
  polo: { pele: "#b67a52", cabelo: { tipo: "curto", cor: "#2a1d16" }, blusa: { tipo: "polo", cor: "#93a596", gola: "#6e8273" }, baixo: { tipo: "calca", cor: "#3f5069" }, pe: { tipo: "bota", cor: "#5a3e2a" }, idade: 0, largura: 1.02 },
  rosa: { pele: "#8a5436", cabelo: { tipo: "preso", cor: "#1a1210" }, blusa: { tipo: "regata", cor: "#e2457c" }, baixo: { tipo: "calca", cor: "#93b3cb" }, pe: { tipo: "chinelo", cor: "#3a2a22" }, idade: 0, largura: 0.9, mulher: true },
  azul: { pele: "#a46c48", cabelo: { tipo: "calvo", cor: "#211814" }, barba: true, blusa: { tipo: "social", cor: "#3c5f92" }, baixo: { tipo: "calca-dobra", cor: "#29324a" }, pe: { tipo: "chinelo", cor: "#2a2a2a" }, idade: 0, largura: 1.04 },
  vovo: { pele: "#cb9272", cabelo: { tipo: "branco", cor: "#efebe3", luz: "#ffffff" }, oculos: true, blusa: { tipo: "renda", cor: "#f1b53a" }, baixo: { tipo: "saia-jeans", cor: "#a3c6cb" }, pe: { tipo: "chinelo", cor: "#d9707e" }, idade: 3, largura: 1.06, mulher: true },
  vermelho: { pele: "#e0a882", cabelo: { tipo: "careca", cor: "#e8e4dc" }, blusa: { tipo: "polo", cor: "#c9333c", gola: "#a5262e" }, baixo: { tipo: "calca", cor: "#6e90b6" }, pe: { tipo: "bota", cor: "#6b4a32" }, idade: 3, largura: 0.98 },
};
const escurece = (hex, k) => "#" + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * k).toString(16).padStart(2, "0")).join("");

function cadeira(c, R) {
  const M = "#7a5a3c", E = "#5e432c";
  forma(c, [[-100, -250], [-82, -250], [-82, 10], [-100, 10]], E, R); // espaldar: fica escondido atrás de quem senta
  forma(c, [[82, -250], [100, -250], [100, 10], [82, 10]], E, R);
  forma(c, [[-100, -262], [100, -262], [100, -222], [-100, -222]], M, R);
  forma(c, [[-56, -222], [-28, -222], [-6, -90], [-22, -90]], E, R); // o V do encosto
  forma(c, [[56, -222], [28, -222], [6, -90], [22, -90]], E, R);
  forma(c, [[-98, 300], [-84, 300], [-86, 20], [-98, 20]], E, R); // pernas de trás
  forma(c, [[98, 300], [84, 300], [86, 20], [98, 20]], E, R);
  forma(c, [[-130, -6], [130, -6], [126, 26], [-126, 26]], M, R); // assento
  forma(c, [[-128, 26], [-108, 26], [-110, 335], [-126, 335]], M, R); // pernas da frente
  forma(c, [[128, 26], [108, 26], [110, 335], [126, 335]], M, R);
  forma(c, [[-118, 200], [118, 200], [118, 214], [-118, 214]], E, R, { linha: 2 });
}

// s: { boca 0..1, olho 0..1 (1 aberto), triste 0..1, firme 0..1, lagrima 0..1 ou -1, fala (inclinação), resp }
function pessoa(c, P, s, R) {
  const L = P.largura || 1, pele = P.pele, sombra = escurece(pele, 0.82);
  c.save();
  c.scale(1, 1 + s.resp * 0.006);
  // --- pernas ---
  const curtas = ["bermuda", "saia-jeans"].includes(P.baixo.tipo);
  const canela = (lado) => {
    const x = lado * 62 * L;
    if (P.baixo.tipo !== "saia-longa") tubo(c, [[x, 50], [x + lado * 6, 170], [x + lado * 2, 296]], 50 * L, curtas ? pele : P.baixo.cor, R);
    if (P.baixo.tipo === "calca-dobra") forma(c, [[x - 24, 262], [x + 24, 262], [x + 25, 290], [x - 25, 290]], escurece(P.baixo.cor, 1.25), R, { linha: 2.4 });
    pe(c, P, lado, R);
  };
  canela(-1); canela(1);
  if (P.baixo.tipo === "saia-longa") {
    const pts = [[-108 * L, -40], [108 * L, -40], [128 * L, 120], [146 * L, 286], [70, 298], [0, 290], [-70, 298], [-146 * L, 286], [-128 * L, 120]];
    forma(c, pts, P.baixo.cor, R, { dentro: () => estampa(c, P.baixo.estampa) });
    risco(c, [[-30, 60], [-40, 180], [-46, 280]], R, 2, LINHA, 0.5);
    risco(c, [[34, 60], [42, 180], [50, 284]], R, 2, LINHA, 0.5);
  } else {
    for (const lado of [-1, 1]) { // coxas de frente, encurtadas
      const x = lado * 62 * L;
      forma(c, [[lado * 6, -36], [lado * 118 * L, -38], [lado * 126 * L, 30], [x + lado * 36 * L, 74], [x, 84], [x - lado * 34 * L, 74], [lado * 6, 34]], P.baixo.cor, R);
      if (P.baixo.tipo !== "saia-jeans") forma(c, elip(x, 66, 34 * L, 22, 14), escurece(P.baixo.cor, 1.06), R, { linha: 2.2 }); // joelho
    }
    if (P.baixo.tipo === "saia-jeans") forma(c, [[-118 * L, -36], [118 * L, -36], [128 * L, 84], [0, 92], [-128 * L, 84]], P.baixo.cor, R);
    risco(c, [[0, -30], [0, 34]], R, 2.2, LINHA, 0.6);
  }
  // --- tronco ---
  const ombro = 108 * L, cint = 100 * L;
  const camisa = P.blusa.cor;
  const bar = P.mulher || P.idade >= 2 ? 1.06 : 1; // barriga e quadril um pouco mais cheios
  const tronco = [[-ombro * 0.92, -296], [-ombro * 0.5, -310], [0, -306], [ombro * 0.5, -310], [ombro * 0.92, -296], [ombro * 1.08, -262], [ombro * 1.06, -190], [cint * bar, -100], [cint * 1.08 * bar, -30], [0, -16], [-cint * 1.08 * bar, -30], [-cint * bar, -100], [-ombro * 1.06, -190], [-ombro * 1.08, -262]];
  forma(c, tronco, camisa, R, { dentro: () => detalheBlusa(c, P, R) });
  if (P.mulher || P.idade >= 2) risco(c, [[-cint * 0.7, -70], [0, -62], [cint * 0.7, -70]], R, 2, LINHA, 0.35);
  // --- braços: ombro, cotovelo, mão no joelho ---
  for (const lado of [-1, 1]) {
    const a = [lado * ombro * 0.98, -268], b = [lado * (ombro + 22), -126], m = [lado * 74 * L, 30];
    const manga = P.blusa.tipo === "social" ? 1 : P.blusa.tipo === "regata" ? 0 : 0.45;
    tubo(c, [a, b, m], 46 * L, pele, R);
    if (manga === 1) tubo(c, [a, b, [lerp(b[0], m[0], 0.75), lerp(b[1], m[1], 0.75)]], 52 * L, camisa, R);
    else if (manga > 0) tubo(c, [a, [lerp(a[0], b[0], 0.55) + lado * 4, lerp(a[1], b[1], 0.55)]], (P.mulher ? 58 : 52) * L, camisa, R);
    forma(c, elip(m[0], m[1] + 6, 32, 24, 12), pele, R, { linha: 2.6 });
    risco(c, [[m[0] - 10, m[1] + 14], [m[0] - 4, m[1] + 22]], R, 1.6, LINHA, 0.6);
  }
  if (P.blusa.tipo === "social") forma(c, [[-14, -300], [14, -300], [10, -30], [-10, -30]], escurece(camisa, 0.9), R, { linha: 2 });
  // --- pescoço e cabeça ---
  const inc = s.fala; // a cabeça acompanha a fala
  forma(c, [[-26, -340], [26, -340], [28, -290], [-28, -290]], sombra, R, { linha: 2.6 });
  gola(c, P, R);
  c.translate(0, -420); c.rotate(inc * 0.05); c.translate(0, 420);
  cabeca(c, P, s, R);
  c.restore();
}

function pe(c, P, lado, R) {
  const x = lado * 64 * (P.largura || 1), y = 316;
  if (P.pe.tipo === "chinelo") {
    forma(c, elip(x + lado * 4, y + 8, 38, 13), P.pe.cor, R, { linha: 2.4 });
    forma(c, elip(x + lado * 2, y - 2, 28, 12), P.pele, R, { linha: 2.4 });
    risco(c, [[x - 12, y - 6], [x + lado * 2, y + 2], [x + 14, y - 6]], R, 3, P.pe.cor);
  } else {
    forma(c, [[x - 26, y - 14], [x + 26, y - 14], [x + 34 + lado * 6, y + 10], [x - 34 + lado * 6, y + 12]], P.pe.cor, R, { linha: 2.6 });
  }
}

function estampa(c, cores) { // a saia da dona: formas geométricas grandes, como no tecido real
  const r = rng(5);
  for (let i = 0; i < 26; i++) {
    const x = -160 + (i % 5) * 72 + (r() - 0.5) * 20, y = -30 + Math.floor(i / 5) * 66 + (r() - 0.5) * 16;
    c.fillStyle = cores[i % cores.length];
    c.globalAlpha = 0.85;
    if (i % 3 === 0) { c.beginPath(); c.arc(x, y, 18 + r() * 8, 0, Math.PI * 2); c.fill(); }
    else c.fillRect(x - 22, y - 16, 34 + r() * 14, 26 + r() * 10);
  }
  c.globalAlpha = 1;
}

function detalheBlusa(c, P, R) {
  const t = P.blusa.tipo;
  if (t === "brasil") { // gola e mangas verdes, escudo
    c.fillStyle = P.blusa.gola;
    c.fillRect(-150, -300, 300, 10);
    c.strokeStyle = P.blusa.gola; c.lineWidth = 3;
    c.beginPath(); c.arc(42, -220, 14, 0, Math.PI * 2); c.stroke();
    c.fillStyle = "#2f6db3"; c.beginPath(); c.arc(42, -220, 8, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#1f8a4c"; c.lineWidth = 4; c.beginPath(); c.moveTo(-58, -224); c.quadraticCurveTo(-40, -212, -26, -232); c.stroke();
  }
  if (t === "renda") { // a gola rendada da vovó
    c.strokeStyle = "#7a4a1a"; c.lineWidth = 2;
    for (let i = 0; i < 14; i++) { const a = Math.PI * (0.15 + 0.7 * (i / 13)); c.beginPath(); c.arc(Math.cos(a) * -58, -300 + Math.sin(a) * 70, 3, 0, Math.PI * 2); c.stroke(); }
  }
  if (t === "camiseta" || t === "blusa") { c.globalAlpha = 0.18; c.fillStyle = "#000"; c.fillRect(-150, -100, 300, 90); c.globalAlpha = 1; }
}
function gola(c, P, R) {
  const t = P.blusa.tipo, cor = P.blusa.gola || escurece(P.blusa.cor, 0.85);
  if (t === "polo" || t === "social") {
    forma(c, [[-40, -306], [-4, -300], [-10, -262]], cor, R, { linha: 2.4 });
    forma(c, [[40, -306], [4, -300], [10, -262]], cor, R, { linha: 2.4 });
    if (t === "polo") for (const y of [-280, -258]) { c.fillStyle = LINHA; c.beginPath(); c.arc(0, y, 3, 0, 7); c.fill(); }
  } else risco(c, [[-32, -302], [0, -288 + (t === "renda" ? 14 : 0)], [32, -302]], R, 3);
}

function cabeca(c, P, s, R) {
  const cy = -420, pele = P.pele, cab = P.cabelo;
  // cabelo de trás
  if (cab.tipo === "ondulado") forma(c, [[-112, -470], [-128, -380], [-118, -300], [-80, -300], [0, -330], [80, -300], [118, -300], [128, -380], [112, -470], [0, -528]], cab.cor, R, { dentro: () => mechas(c, cab.luz, R) });
  if (cab.tipo === "preso") forma(c, elip(0, cy - 104, 40, 30, 12), cab.cor, R);
  for (const lado of [-1, 1]) forma(c, elip(lado * 90, cy + 6, 16, 24, 10), escurece(pele, 0.92), R, { linha: 2.6 });
  forma(c, elip(0, cy, 90, 102, 22), pele, R);
  // bochechas
  c.save(); c.globalAlpha = 0.22; c.fillStyle = "#e0606a";
  for (const lado of [-1, 1]) { c.beginPath(); c.ellipse(lado * 48, cy + 30, 18, 11, 0, 0, Math.PI * 2); c.fill(); }
  c.restore();
  if (P.barba) { c.save(); curva(c, elip(0, cy, 90, 102, 22)); c.clip(); c.globalAlpha = 0.45; c.fillStyle = escurece(cab.cor, 1.4); curva(c, [[-88, cy + 4], [-60, cy + 74], [0, cy + 104], [60, cy + 74], [88, cy + 4], [60, cy + 40], [0, cy + 52], [-60, cy + 40]]); c.fill(); c.restore(); }
  // olhos
  const oy = cy - 4, aberto = Math.max(0.08, s.olho);
  for (const lado of [-1, 1]) {
    const ox = lado * 33;
    c.fillStyle = "#fffaf0"; c.beginPath(); c.ellipse(ox, oy, 13, 11 * aberto, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#2a1a12"; c.beginPath(); c.ellipse(ox, oy + 1, 8, 9 * aberto, 0, 0, Math.PI * 2); c.fill();
    if (aberto > 0.4) { c.fillStyle = "#fff"; c.beginPath(); c.arc(ox + 3, oy - 3, 2.6 + s.triste * 1.2, 0, 7); c.fill(); }
    c.strokeStyle = LINHA; c.lineWidth = 2.6; c.beginPath(); c.ellipse(ox, oy, 13, 11 * aberto, 0, Math.PI, 0); c.stroke();
    // sobrancelha: triste sobe a ponta de dentro, firme desce
    const dentro = -32 - s.triste * 10 + s.firme * 8, fora = -26 + s.triste * 4 - s.firme * 3;
    risco(c, [[ox + lado * 20, oy + fora], [ox + lado * 4, oy - 30 - s.triste * 4], [ox - lado * 12, oy + dentro]], R, 4.2, escurece(cab.cor === "#efebe3" || cab.cor === "#e8e4dc" ? "#8a8070" : cab.cor, 1));
    if (P.idade >= 2) risco(c, [[ox + lado * 16, oy + 14], [ox + lado * 24, oy + 8]], R, 1.6, LINHA, 0.5);
  }
  if (P.oculos) {
    c.save(); c.strokeStyle = "#2a1d18"; c.lineWidth = 4;
    for (const lado of [-1, 1]) { c.beginPath(); c.roundRect(lado * 33 - 26, oy - 19, 52, 38, 12); c.stroke(); }
    c.beginPath(); c.moveTo(-7, oy - 4); c.quadraticCurveTo(0, oy - 9, 7, oy - 4); c.stroke(); c.restore();
  }
  // lágrima escorrendo
  if (s.lagrima >= 0) {
    const k = s.lagrima, x = -40, y = oy + 14 + k * 70;
    c.save(); c.globalAlpha = 0.85 * Math.min(1, k * 4) * Math.min(1, (1 - k) * 4 + 0.3);
    c.fillStyle = "#cfe9f5"; c.strokeStyle = "#6a9ab8"; c.lineWidth = 2;
    c.beginPath(); c.moveTo(x, y - 14); c.quadraticCurveTo(x + 8, y, x, y + 6); c.quadraticCurveTo(x - 8, y, x, y - 14); c.fill(); c.stroke();
    c.globalAlpha *= 0.4; c.strokeStyle = "#9cc7de"; c.lineWidth = 3; c.beginPath(); c.moveTo(x, oy + 14); c.lineTo(x, y - 12); c.stroke();
    c.restore();
  }
  // nariz
  risco(c, [[-4, cy + 6], [-10, cy + 28], [2, cy + 34], [10, cy + 30]], R, 2.6);
  if (P.idade >= 2) { risco(c, [[-28, cy + 36], [-36, cy + 58]], R, 1.6, LINHA, 0.45); risco(c, [[28, cy + 36], [36, cy + 58]], R, 1.6, LINHA, 0.45); }
  // boca: abre com a voz; fechada vira uma linha (para baixo quando triste)
  const my = cy + 56, ab = s.boca;
  if (P.bigode) forma(c, [[-34, my - 14], [0, my - 22], [34, my - 14], [30, my - 4], [0, my - 10], [-30, my - 4]], cab.cor, R, { linha: 2 });
  if (ab > 0.06) {
    forma(c, [[-20 - ab * 4, my], [0, my - 4 - ab * 3], [20 + ab * 4, my], [0, my + 4 + ab * 20]], "#7a2a26", R, { linha: 2.6 });
    c.save(); c.fillStyle = "#e07a7a"; c.beginPath(); c.ellipse(0, my + 2 + ab * 13, 9, 3 + ab * 3, 0, 0, Math.PI * 2); c.fill(); c.restore();
  } else risco(c, [[-20, my + s.triste * 4], [0, my - 1 + s.firme * 2], [20, my + s.triste * 4]], R, 3.2);
  // cabelo da frente
  const C = cab.cor;
  if (cab.tipo === "topete") forma(c, [[-90, cy - 20], [-94, cy - 70], [-60, cy - 112], [10, cy - 130], [70, cy - 112], [94, cy - 64], [90, cy - 20], [70, cy - 72], [20, cy - 86], [-40, cy - 78], [-74, cy - 60]], C, R);
  if (cab.tipo === "curto") forma(c, [[-90, cy - 18], [-90, cy - 76], [-40, cy - 108], [40, cy - 108], [90, cy - 76], [90, cy - 18], [74, cy - 62], [0, cy - 74], [-74, cy - 62]], C, R);
  if (cab.tipo === "calvo") forma(c, [[-90, cy - 16], [-88, cy - 70], [-56, cy - 98], [-30, cy - 86], [30, cy - 86], [56, cy - 98], [88, cy - 70], [90, cy - 16], [78, cy - 54], [0, cy - 72], [-78, cy - 54]], C, R);
  if (cab.tipo === "preso") forma(c, [[-91, cy - 6], [-88, cy - 70], [-40, cy - 104], [40, cy - 104], [88, cy - 70], [91, cy - 6], [72, cy - 58], [10, cy - 74], [-60, cy - 62]], C, R);
  if (cab.tipo === "careca") {
    for (const lado of [-1, 1]) forma(c, [[lado * 90, cy - 40], [lado * 100, cy - 10], [lado * 94, cy + 16], [lado * 82, cy - 6], [lado * 82, cy - 36]], C, R, { linha: 2 });
    c.save(); c.globalAlpha = 0.5; c.fillStyle = "#fff4e6"; c.beginPath(); c.ellipse(-26, cy - 74, 22, 10, -0.4, 0, Math.PI * 2); c.fill(); c.restore();
  }
  if (cab.tipo === "ondulado") forma(c, [[-96, cy + 10], [-100, cy - 64], [-60, cy - 112], [0, cy - 120], [60, cy - 112], [100, cy - 64], [96, cy + 10], [80, cy - 40], [40, cy - 80], [0, cy - 70], [-40, cy - 80], [-80, cy - 40]], C, R, { dentro: () => mechas(c, cab.luz, R) });
  if (cab.tipo === "branco") { // cachinhos curtos
    const bolas = [[-84, -30], [-80, -66], [-58, -96], [-24, -112], [12, -114], [46, -102], [74, -78], [86, -40], [-40, -82], [0, -90], [40, -84]];
    for (const [x, y] of bolas) forma(c, elip(x, cy + y, 24, 22, 10), C, R, { linha: 2.2, cor: "#a59c8e" });
  }
}
function mechas(c, cor, R) {
  c.strokeStyle = cor; c.lineWidth = 3; c.globalAlpha = 0.7;
  for (let i = 0; i < 9; i++) {
    const x = -100 + i * 25;
    c.beginPath(); c.moveTo(x, -520); c.bezierCurveTo(x + 14, -470, x - 14, -420, x + 6, -300); c.stroke();
  }
  c.globalAlpha = 1;
}
