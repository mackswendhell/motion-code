// Vila Acesa: a cidade é uma faixa de prédios em corte, em coordenadas próprias; a câmera passeia por ela.
// Cômodos em perspectiva de um ponto, pintados em guache uma vez (2x); por cima, tudo o que se mexe.
// Carregado depois de nucleo2d/base.js. iniciar(tempo) uma vez, quadro(t) por quadro.

const MUNDO = { w: 9200, h: 3000, chao: 2500 };
const ANDAR = { terreo: [1580, 900], primeiro: [620, 920] }; // y do topo e altura de cada andar
const K = 2; // os cômodos detalhados são pintados em 2x
const COR = {
  tijolo: ["#9c4a32", "#ab573a", "#8a3f2a", "#b8643f", "#7f3826"], tinta: "rgba(40,20,10,0.78)",
  coral: "#f07a4a", neon: "#ff7a4a", creme: "#f4e6c8",
  pele: ["#f2c9a0", "#d9a074", "#a8704a", "#7a4a2e"],
};
// a cidade: cada prédio tem dois cômodos (térreo e primeiro andar)
const PREDIOS = [
  { x: 250, w: 1500, cor: "#9c4a32", tijolo: true, telhado: "empena", comodos: { terreo: "padaria", primeiro: "casa" } },
  { x: 1870, w: 2100, cor: "#4f9a9a", telhado: "plano", placa: "xicara", comodos: { terreo: "lanchonete", primeiro: "escola" } },
  { x: 4180, w: 1300, cor: "#3f7a5a", telhado: "cornija", comodos: { terreo: "oficina", primeiro: "correio" } },
  { x: 5900, w: 2100, cor: "#d9b884", telhado: "torre", comodos: { terreo: "biblioteca", primeiro: "salao" } },
  { x: 8180, w: 900, cor: "#7a6aa0", telhado: "mansarda", comodos: { terreo: "petshop", primeiro: "radio" } },
];
const COMODO = {}; // nome -> [x, y, w, h], preenchido em iniciar()
let FUNDO, TELAS = {};

// ---------- geometria do cômodo em perspectiva ----------
function caixaQ([x, y, w, h]) {
  const dx = w * 0.11, top = h * 0.09, bh = h * 0.6;
  return { x, y, w, h, bx: x + dx, by: y + top, bw: w - 2 * dx, bh, chaoY: y + top + bh };
}
function noChao(g, f, k) { // ponto no piso: f de 0 a 1 na largura, k de 0 (fundo) a 1 (frente)
  const x = lerp(lerp(g.bx, g.bx + g.bw, f), lerp(g.x, g.x + g.w, f), k);
  return [x, lerp(g.chaoY, g.y + g.h, k), lerp(0.74, 1.0, k)];
}
function naParede(g, f, v) { return [g.bx + g.bw * f, g.by + g.bh * v]; } // ponto na parede do fundo

// ---------- pintura: guache manchado, nanquim tremido ----------
function guache(c, forma, cor, rnd, bx, n = 30, forte = 1) {
  c.save();
  forma(); c.fillStyle = cor; c.fill();
  forma(); c.clip();
  const [x, y, w, h] = bx, m = Math.max(w, h);
  for (let i = 0; i < n; i++) { // manchas claras e escuras: a tinta nunca é lisa
    const px = x + rnd() * w, py = y + rnd() * h, r = m * (0.05 + rnd() * 0.25);
    const g = c.createRadialGradient(px, py, 0, px, py, r);
    const claro = rnd() < 0.5;
    g.addColorStop(0, claro ? `rgba(255,240,215,${0.12 * forte})` : `rgba(50,20,5,${0.14 * forte})`); g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g; c.fillRect(px - r, py - r, r * 2, r * 2);
  }
  for (let i = 0; i < n * 6; i++) { // salpicos e desgaste
    c.fillStyle = rnd() < 0.5 ? "rgba(255,245,225,0.35)" : "rgba(40,15,5,0.3)";
    c.fillRect(x + rnd() * w, y + rnd() * h, 1 + rnd() * 2.5, 1 + rnd() * 2.5);
  }
  c.lineWidth = 1.2;
  for (let i = 0; i < n * 3; i++) { // traço de pincel seco
    const px = x + rnd() * w, py = y + rnd() * h, l = 6 + rnd() * 18, a = -0.5 + (rnd() - 0.5) * 0.4;
    c.strokeStyle = rnd() < 0.5 ? "rgba(255,240,210,0.2)" : "rgba(40,15,5,0.2)";
    c.beginPath(); c.moveTo(px, py); c.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); c.stroke();
  }
  c.restore();
}
function nanquim(c, pts, rnd, larg = 2.4, fechado = true) { // dois traços de caneta, nunca iguais
  c.save(); c.lineJoin = c.lineCap = "round";
  for (const [l, a] of [[larg, 0.8], [larg * 0.5, 0.45]]) {
    c.strokeStyle = `rgba(40,20,10,${a})`; c.lineWidth = l;
    caminho(c, tremido(pts, 1.6, rnd, 4), fechado); c.stroke();
  }
  c.restore();
}
const ret = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
function bloco(c, x, y, w, h, cor, rnd, n = 6, raio = 0) { // objeto simples: guache leve + nanquim
  guache(c, () => { c.beginPath(); raio ? c.roundRect(x, y, w, h, raio) : c.rect(x, y, w, h); }, cor, rnd, [x, y, w, h], n);
  nanquim(c, ret(x, y, w, h), rnd, 2);
}
function poligono(c, pts, cor, rnd, n = 10, contorno = true) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const bx = [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
  guache(c, () => caminho(c, pts), cor, rnd, bx, n);
  if (contorno) nanquim(c, pts, rnd, 2);
}

// ---------- texturas de parede e piso ----------
function tijolosEm(c, x, y, w, h, rnd, cores = COR.tijolo) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = "#d8b896"; c.fillRect(x, y, w, h);
  const bw = 44, bh = 19;
  for (let j = 0; j * bh < h + bh; j++) for (let i = -1; i * bw < w + bw; i++) {
    const bx = x + i * bw + (j % 2 ? bw / 2 : 0), by = y + j * bh;
    c.fillStyle = cores[Math.floor(rnd() * cores.length)];
    c.beginPath(); c.roundRect(bx + 2 + rnd(), by + 2, bw - 4 - rnd() * 2, bh - 4, 2); c.fill();
  }
  c.restore();
}
function tabuasVerticais(c, x, y, w, h, cor, rnd) {
  c.fillStyle = cor; c.fillRect(x, y, w, h);
  for (let i = 0; i * 34 < w; i++) {
    c.fillStyle = rnd() < 0.5 ? "rgba(255,240,210,0.08)" : "rgba(30,15,5,0.1)"; c.fillRect(x + i * 34, y, 34, h);
    c.strokeStyle = "rgba(30,15,5,0.45)"; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x + i * 34, y); c.lineTo(x + i * 34 + (rnd() - 0.5) * 3, y + h); c.stroke();
    for (let k = 0; k < 2; k++) { const ky = y + rnd() * h; c.fillStyle = "rgba(30,15,5,0.3)"; c.beginPath(); c.ellipse(x + i * 34 + 17, ky, 4, 7, 0, 0, Math.PI * 2); c.fill(); }
  }
}
function papelParede(c, x, y, w, h, cor, motivo, rnd) {
  c.fillStyle = cor; c.fillRect(x, y, w, h);
  for (let j = 0; j * 60 < h; j++) for (let i = 0; i * 60 < w; i++) {
    const px = x + i * 60 + (j % 2 ? 30 : 0), py = y + j * 60;
    c.fillStyle = motivo[(i + j) % motivo.length];
    c.beginPath(); c.arc(px, py, 4, 0, Math.PI * 2); c.fill();
    c.fillStyle = "rgba(90,130,80,0.6)"; c.beginPath(); c.ellipse(px + 7, py + 5, 5, 2.5, 0.6, 0, Math.PI * 2); c.fill();
  }
}
function azulejos(c, x, y, w, h, cor, rnd) {
  c.fillStyle = cor; c.fillRect(x, y, w, h);
  c.strokeStyle = "rgba(120,110,100,0.45)"; c.lineWidth = 1.2;
  for (let i = 0; i * 34 < w; i++) { c.beginPath(); c.moveTo(x + i * 34, y); c.lineTo(x + i * 34, y + h); c.stroke(); }
  for (let j = 0; j * 26 < h; j++) { c.beginPath(); c.moveTo(x, y + j * 26); c.lineTo(x + w, y + j * 26); c.stroke(); }
}
// o cômodo inteiro: parede do fundo, paredes laterais, piso e teto em perspectiva
function quarto(c, g, parede, rnd, rodape = "#e9e4d8", faixa = "#3f8a8a", piso0 = "madeira") {
  const { x, y, w, h, bx, by, bw, bh, chaoY } = g;
  poligono(c, [[x, y], [x + w, y], [bx + bw, by], [bx, by]], "#5a3a24", rnd, 12, false); // teto com vigas
  c.strokeStyle = "rgba(20,10,5,0.5)"; c.lineWidth = 3;
  for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(lerp(x, x + w, i / 8), y); c.lineTo(lerp(bx, bx + bw, i / 8), by); c.stroke(); }
  c.save(); c.beginPath(); c.rect(bx, by, bw, bh); c.clip(); // parede do fundo
  parede(c, bx, by, bw, bh);
  azulejos(c, bx, by + bh * 0.74, bw, bh * 0.26, rodape, rnd);
  c.fillStyle = faixa; c.fillRect(bx, by + bh * 0.72, bw, bh * 0.03);
  guache(c, () => c.rect(bx, by, bw, bh), "rgba(0,0,0,0)", rnd, [bx, by, bw, bh], 40, 1.3);
  c.restore();
  for (const lado of [0, 1]) { // paredes laterais: a mesma parede, mais escura, com as fiadas fugindo para o fundo
    const pts = lado ? [[x + w, y], [bx + bw, by], [bx + bw, chaoY], [x + w, y + h]] : [[x, y], [bx, by], [bx, chaoY], [x, y + h]];
    c.save(); caminho(c, pts); c.clip();
    parede(c, x - 10, y, w + 20, h);
    const gs = c.createLinearGradient(lado ? x + w : x, 0, lado ? bx + bw : bx, 0);
    gs.addColorStop(0, "rgba(30,12,4,0.45)"); gs.addColorStop(1, "rgba(30,12,4,0.25)");
    c.fillStyle = gs; c.fillRect(x, y, w, h);
    c.strokeStyle = "rgba(30,12,4,0.25)"; c.lineWidth = 2;
    for (let i = 1; i < 14; i++) { const v = i / 14; c.beginPath(); c.moveTo(lado ? x + w : x, lerp(y, y + h, v)); c.lineTo(lado ? bx + bw : bx, lerp(by, chaoY, v)); c.stroke(); }
    c.restore();
    nanquim(c, pts, rnd, 2.2);
  }
  const piso = [[bx, chaoY], [bx + bw, chaoY], [x + w, y + h], [x, y + h]]; // piso de tábuas fugindo para o fundo
  poligono(c, piso, "#8a5a32", rnd, 30, false);
  c.save(); caminho(c, piso); c.clip();
  if (piso0 === "xadrez") { // piso de lanchonete: xadrez preto e branco em perspectiva
    const n = 18, m = 7;
    for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) {
      const q = [noChao(g, i / n, j / m), noChao(g, (i + 1) / n, j / m), noChao(g, (i + 1) / n, (j + 1) / m), noChao(g, i / n, (j + 1) / m)].map((v) => v.slice(0, 2));
      caminho(c, q); c.fillStyle = (i + j) % 2 ? "#2a2a30" : "#ece6d8"; c.fill();
    }
  } else for (let i = 0; i <= 22; i++) { c.strokeStyle = "rgba(30,12,4,0.45)"; c.lineWidth = 2; c.beginPath(); c.moveTo(lerp(bx, bx + bw, i / 22), chaoY); c.lineTo(lerp(x, x + w, i / 22), y + h); c.stroke(); }
  for (let j = 0; j < 40; j++) { const k = rnd(), f = rnd(), [px, py] = noChao(g, f, k); c.strokeStyle = "rgba(30,12,4,0.35)"; c.beginPath(); c.moveTo(px - 18 * lerp(0.7, 1, k), py); c.lineTo(px + 18 * lerp(0.7, 1, k), py); c.stroke(); }
  const gp = c.createLinearGradient(0, chaoY, 0, y + h);
  gp.addColorStop(0, "rgba(30,12,4,0.35)"); gp.addColorStop(1, "rgba(30,12,4,0)");
  c.fillStyle = gp; c.fillRect(x, chaoY, w, y + h - chaoY);
  c.restore();
  nanquim(c, [[bx, by], [bx + bw, by], [bx + bw, chaoY], [bx, chaoY]], rnd, 2.6);
}

// ---------- portas laterais (cenário) ----------
const PORTAS = { casa: 1, escola: 0, lanchonete: 1, oficina: 0 }; // 1 = parede direita, 0 = esquerda
function portaQuad(nome) {
  const g = caixaQ(COMODO[nome]), lado = PORTAS[nome];
  const ponto = (k) => lado ? [lerp(g.bx + g.bw, g.x + g.w, k), lerp(g.chaoY, g.y + g.h, k)] : [lerp(g.bx, g.x, k), lerp(g.chaoY, g.y + g.h, k)];
  const k0 = 0.28, k1 = 0.62, alt = (k) => g.h * 0.44 * lerp(0.74, 1, k);
  const b0 = ponto(k0), b1 = ponto(k1);
  return [b0, b1, [b1[0], b1[1] - alt(k1)], [b0[0], b0[1] - alt(k0)]];
}
function retDe(pts) { const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)]; }
function portaParada(c, nome, rnd) { // o vão da porta, com a luz do cômodo vizinho escapando
  const q = portaQuad(nome), [x, y, w, h] = retDe(q);
  caminho(c, q); const g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, "#7a4a24"); g.addColorStop(1, "#f2c070"); c.fillStyle = g; c.fill();
  c.save(); c.strokeStyle = "#c98a4a"; c.lineWidth = 14; caminho(c, q); c.stroke(); c.restore();
  nanquim(c, q, rnd, 2.4);
}
function folhaPorta(c, nome, abre) { // a folha de madeira gira na dobradiça da frente
  const [b0, b1, t1, t0] = portaQuad(nome), lado = PORTAS[nome], dx = (b1[0] - b0[0]);
  const fx = lerp(b0[0], b1[0] + (lado ? -1 : 1) * Math.abs(dx) * 0.2 - dx * 0.15, abre), alt = t0[1] - b0[1];
  const pts = [[fx, lerp(b0[1], b1[1], abre * 0.85)], b1, t1, [fx, lerp(b0[1], b1[1], abre * 0.85) + alt * lerp(1, 1.12, abre)]];
  caminho(c, pts); c.fillStyle = mix2("#8a5a32", "#a8743e", abre); c.fill();
  c.strokeStyle = COR.tinta; c.lineWidth = 2.4; c.stroke();
  c.fillStyle = "#e2b84a"; c.beginPath(); c.arc(lerp(fx, b1[0], 0.2), lerp(pts[0][1], b1[1], 0.2) + alt * 0.5, 6, 0, Math.PI * 2); c.fill(); // maçaneta
}
function mix2(a, b, k) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)), x = p(a), y = p(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], k))).join(",")})`; }

// ---------- objetos da vila ----------
function janelaQ(c, x, y, w, h, ceu, rnd, arco = true) {
  const forma = () => { c.beginPath(); if (arco) { c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath(); } else c.rect(x, y, w, h); };
  c.save(); forma();
  const g = c.createLinearGradient(0, y, 0, y + h);
  ceu.forEach((cor, i) => g.addColorStop(i / (ceu.length - 1), cor));
  c.fillStyle = g; c.fill(); c.clip();
  c.fillStyle = "rgba(80,60,100,0.55)"; // silhueta da cidade lá fora
  for (let i = 0; i < 6; i++) { const hx = x + i * w / 6, hh = h * (0.18 + rnd() * 0.2); c.fillRect(hx, y + h * 0.78 - hh, w / 6 - 4, hh + h); }
  c.strokeStyle = "rgba(60,40,30,0.6)"; c.lineWidth = 2; // galho seco cruzando
  c.beginPath(); c.moveTo(x, y + h * 0.5); c.quadraticCurveTo(x + w * 0.4, y + h * 0.4, x + w * 0.7, y + h * 0.15); c.stroke();
  c.restore();
  c.strokeStyle = "#f4ead8"; c.lineWidth = 8;
  c.beginPath(); c.moveTo(x + w / 2, y + (arco ? 4 : 0)); c.lineTo(x + w / 2, y + h); for (let i = 1; i < 4; i++) { c.moveTo(x, y + h * i / 4 + (arco ? h * 0.1 : 0)); c.lineTo(x + w, y + h * i / 4 + (arco ? h * 0.1 : 0)); } c.stroke();
  c.lineWidth = 16; c.strokeStyle = "#f0e6d6"; forma(); c.stroke();
  nanquim(c, arco ? [[x - 8, y + h + 8], [x - 8, y + w / 2], [x + w / 2, y - 8], [x + w + 8, y + w / 2], [x + w + 8, y + h + 8]] : ret(x - 8, y - 8, w + 16, h + 16), rnd, 2.2);
  c.fillStyle = "#e6dcc8"; c.fillRect(x - 24, y + h, w + 48, 16); // parapeito
}
function relogioQ(c, x, y, r, rnd) {
  c.fillStyle = "#c98a3a"; c.beginPath(); c.arc(x, y, r + 8, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#fbf3e0"; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "#3a2214"; c.lineWidth = 2;
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.beginPath(); c.moveTo(x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78); c.lineTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9); c.stroke(); }
  nanquim(c, circ(x, y, r + 8, 24), rnd, 2);
}
function paoQ(c, x, y, w, h, rnd) {
  const g = c.createRadialGradient(x - w * 0.2, y - h * 0.3, 2, x, y, w * 0.6);
  g.addColorStop(0, "#f6c878"); g.addColorStop(0.6, "#c47a32"); g.addColorStop(1, "#8a4a1a");
  c.fillStyle = g; c.beginPath(); c.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "rgba(255,235,190,0.85)"; c.lineWidth = 2;
  for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(x + i * w * 0.22 - 5, y - h * 0.22); c.quadraticCurveTo(x + i * w * 0.22, y, x + i * w * 0.22 + 5, y + h * 0.2); c.stroke(); }
  c.strokeStyle = "rgba(60,25,5,0.6)"; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2); c.stroke();
}
function prateleiraQ(c, x, y, w, rnd, itens) {
  bloco(c, x, y, w, 12, "#6a4022", rnd, 3);
  c.strokeStyle = "#3a2214"; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 16, y + 12); c.lineTo(x + 30, y + 40); c.moveTo(x + w - 16, y + 12); c.lineTo(x + w - 30, y + 40); c.stroke();
  let px = x + 12;
  for (const it of itens) { it(c, px, y, rnd); px += (w - 24) / itens.length; }
}
const itPao = (c, x, y, r) => paoQ(c, x + 22, y - 14, 44, 26, r);
const itPote = (c, x, y, r) => { const ph = 30 + r() * 22; c.fillStyle = "rgba(210,230,235,0.75)"; c.beginPath(); c.roundRect(x + 4, y - ph, 30, ph, 6); c.fill(); c.fillStyle = ["#e2a73a", "#c94a3a", "#7aa04a", "#8a5a32"][Math.floor(r() * 4)]; c.fillRect(x + 7, y - ph * 0.62, 24, ph * 0.62 - 3); c.fillStyle = "#c94a3a"; c.fillRect(x + 2, y - ph - 6, 34, 8); nanquim(c, ret(x + 4, y - ph, 30, ph), r, 1.4); };
const itLivro = (c, x, y, r) => { for (let i = 0; i < 4; i++) { const lh = 34 + r() * 22, lw = 9 + r() * 6; c.fillStyle = ["#c94a3a", "#3f7a5a", "#e2a73a", "#5a7ab8", "#8a5a9a"][Math.floor(r() * 5)]; c.fillRect(x + i * 12, y - lh, lw, lh); } };
const itPrato = (c, x, y, r) => { c.fillStyle = "#f4f0e6"; c.beginPath(); c.ellipse(x + 20, y - 26, 20, 26, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = "#5a8ac8"; c.lineWidth = 2; c.beginPath(); c.ellipse(x + 20, y - 26, 14, 19, 0, 0, Math.PI * 2); c.stroke(); };
const itPlanta = (c, x, y, r) => plantaQ(c, x + 20, y - 30, 0.6, r);
function plantaQ(c, x, y, s, rnd) {
  c.fillStyle = "#b8643f"; c.beginPath(); c.moveTo(x - 22 * s, y); c.lineTo(x + 22 * s, y); c.lineTo(x + 16 * s, y + 36 * s); c.lineTo(x - 16 * s, y + 36 * s); c.fill();
  for (let i = 0; i < 11; i++) {
    const a = -Math.PI / 2 + (rnd() - 0.5) * 2.4, l = (30 + rnd() * 38) * s;
    c.strokeStyle = "#3f6a32"; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * l * 0.5, y + Math.sin(a) * l * 0.4, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
    c.fillStyle = rnd() < 0.5 ? "#6faa52" : "#4f8a3a"; c.beginPath(); c.ellipse(x + Math.cos(a) * l, y + Math.sin(a) * l, 10 * s, 5 * s, a, 0, Math.PI * 2); c.fill();
  }
}
function aboboraQ(c, x, y, r, rnd, cara = false) {
  for (let i = -2; i <= 2; i++) { c.fillStyle = Math.abs(i) % 2 ? "#d9702a" : "#e8843a"; c.beginPath(); c.ellipse(x + i * r * 0.28, y, r * 0.45, r * 0.78, 0, 0, Math.PI * 2); c.fill(); }
  c.strokeStyle = COR.tinta; c.lineWidth = 1.8; c.beginPath(); c.ellipse(x, y, r * 1.05, r * 0.8, 0, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = "#4a6a2a"; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y - r * 0.7); c.quadraticCurveTo(x + 2, y - r * 1.1, x + 10, y - r * 1.15); c.stroke();
  if (cara) { c.fillStyle = "#3a1a08"; c.beginPath(); c.moveTo(x - r * 0.5, y - r * 0.1); c.lineTo(x - r * 0.25, y - r * 0.35); c.lineTo(x - r * 0.1, y - r * 0.1); c.moveTo(x + r * 0.1, y - r * 0.1); c.lineTo(x + r * 0.25, y - r * 0.35); c.lineTo(x + r * 0.5, y - r * 0.1); c.fill(); c.beginPath(); c.arc(x, y + r * 0.15, r * 0.4, 0.2, Math.PI - 0.2); c.fill(); }
}
function saco(c, x, y, s, rnd) {
  c.save(); c.translate(x, y); c.scale(s, s);
  poligono(c, [[-40, 0], [-46, -70], [-28, -96], [0, -88], [28, -96], [46, -70], [40, 0]], "#e2d2ae", rnd, 6);
  c.strokeStyle = "#5a7ab8"; c.lineWidth = 3; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(i * 10, -58); c.lineTo(i * 10 + 6, -30); c.stroke(); }
  c.restore();
}
function bicicleta(c, x, y, s, rnd) {
  c.save(); c.translate(x, y); c.scale(s, s); c.lineCap = "round";
  for (const rx of [-70, 70]) { c.strokeStyle = "#2a1a10"; c.lineWidth = 5; c.beginPath(); c.arc(rx, -50, 48, 0, Math.PI * 2); c.stroke(); c.lineWidth = 1; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.beginPath(); c.moveTo(rx, -50); c.lineTo(rx + Math.cos(a) * 46, -50 + Math.sin(a) * 46); c.stroke(); } }
  c.strokeStyle = "#3f7a5a"; c.lineWidth = 7; c.beginPath(); c.moveTo(-70, -50); c.lineTo(-10, -110); c.lineTo(50, -110); c.lineTo(70, -50); c.moveTo(-10, -110); c.lineTo(0, -50); c.lineTo(-70, -50); c.moveTo(50, -110); c.lineTo(46, -140); c.stroke();
  bloco(c, 30, -130, 60, 34, "#c98a4a", rnd, 3); // cesta
  c.restore();
}
function boloAndares(c, x, y, s, rnd) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (let i = 0; i < 4; i++) { const w = 110 - i * 24, hh = 34; bloco(c, -w / 2, -hh * (i + 1), w, hh, "#f8f2ea", rnd, 3, 6); c.strokeStyle = "#5a8ac8"; c.lineWidth = 2; for (let q = 0; q < 8; q++) { c.beginPath(); c.arc(-w / 2 + (q + 0.5) * w / 8, -hh * i - 30, w / 16, 0, Math.PI); c.stroke(); } }
  c.fillStyle = "#e8775a"; c.beginPath(); c.arc(0, -142, 8, 0, Math.PI * 2); c.fill();
  c.restore();
}
function chaleira(c, x, y, s, rnd) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = "#5a8ac8"; c.beginPath(); c.ellipse(0, -30, 40, 30, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "#5a8ac8"; c.lineWidth = 8; c.beginPath(); c.moveTo(34, -36); c.lineTo(62, -54); c.stroke(); c.beginPath(); c.arc(0, -62, 24, Math.PI, 0); c.stroke();
  nanquim(c, circ(0, -30, 38, 16), rnd, 1.6);
  c.restore();
}
function tigela(c, x, y, s, cor, rnd) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = cor; c.beginPath(); c.moveTo(-60, -40); c.quadraticCurveTo(-56, 6, 0, 8); c.quadraticCurveTo(56, 6, 60, -40); c.closePath(); c.fill();
  c.fillStyle = "#f4ead8"; c.beginPath(); c.ellipse(0, -40, 60, 14, 0, 0, Math.PI * 2); c.fill();
  nanquim(c, [[-60, -40], [-50, -5], [0, 8], [50, -5], [60, -40]], rnd, 1.8, false);
  c.restore();
}
function rackPaes(c, x, y, s, rnd) { // carrinho de assadeiras cheio de pão
  c.save(); c.translate(x, y); c.scale(s, s);
  c.strokeStyle = "#8a8a90"; c.lineWidth = 5; c.strokeRect(-70, -330, 140, 320);
  for (let i = 0; i < 7; i++) { const yy = -310 + i * 44; c.fillStyle = "#6a6a72"; c.fillRect(-66, yy + 26, 132, 5); for (let p = 0; p < 4; p++) paoQ(c, -48 + p * 32, yy + 16, 26, 16, rnd); }
  c.fillStyle = "#2a1a10"; c.beginPath(); c.arc(-56, 0, 8, 0, Math.PI * 2); c.arc(56, 0, 8, 0, Math.PI * 2); c.fill();
  c.restore();
}
function quadroQ(c, x, y, w, h, rnd) {
  bloco(c, x - 6, y - 6, w + 12, h + 12, "#6a4022", rnd, 2);
  c.fillStyle = ["#e9d8a8", "#cfe0e8", "#f2c9b0", "#dde8c8"][Math.floor(rnd() * 4)]; c.fillRect(x, y, w, h);
  c.fillStyle = ["#d9702a", "#3f7a5a", "#5a7ab8", "#c94a3a"][Math.floor(rnd() * 4)];
  if (rnd() < 0.5) { c.beginPath(); c.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.28, 0, Math.PI * 2); c.fill(); }
  else { c.beginPath(); c.moveTo(x + 4, y + h - 4); c.lineTo(x + w * 0.5, y + h * 0.3); c.lineTo(x + w - 4, y + h - 4); c.fill(); }
}
function lousaQ(c, x, y, w, h, rnd) {
  bloco(c, x - 10, y - 10, w + 20, h + 20, "#6a4022", rnd, 2);
  c.fillStyle = "#2f4a3a"; c.fillRect(x, y, w, h);
  c.strokeStyle = "rgba(240,235,220,0.85)"; c.lineWidth = 2.4;
  for (let i = 0; i < 4; i++) { const yy = y + 26 + i * (h - 34) / 4; for (let p = 0; p < 3; p++) { c.beginPath(); c.ellipse(x + 22 + p * 30, yy, 11, 7, 0, 0, Math.PI * 2); c.stroke(); } c.beginPath(); c.moveTo(x + w - 60, yy); c.lineTo(x + w - 18, yy); c.stroke(); }
}
function guirlanda(c, x, y, w, rnd) {
  c.strokeStyle = "#5a3420"; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + w / 2, y + 40, x + w, y); c.stroke();
  for (let i = 0; i < 16; i++) { const q = (i + 0.5) / 16, gx = x + q * w, gy = y + Math.sin(q * Math.PI) * 38; c.fillStyle = ["#e8843a", "#c94a3a", "#f2b84b", "#8a6a3a"][i % 4]; c.beginPath(); c.ellipse(gx, gy + 6, 9, 5, i, 0, Math.PI * 2); c.fill(); }
}
function espiga(c, x, y, rnd) {
  c.fillStyle = "#e2b84a"; c.beginPath(); c.ellipse(x, y + 40, 14, 40, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#c9a888"; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - 30, y + 30, x - 16, y + 70); c.lineTo(x, y + 20); c.quadraticCurveTo(x + 30, y + 30, x + 16, y + 70); c.fill();
}
function tapeteQ(c, g, f, k, rx, cores) {
  const [x, y, s] = noChao(g, f, k);
  cores.forEach((cor, i) => { c.fillStyle = cor; c.beginPath(); c.ellipse(x, y, rx * s * (1 - i * 0.16), rx * s * 0.2 * (1 - i * 0.16), 0, 0, Math.PI * 2); c.fill(); });
}
function mesa(c, g, f, k, w, cor, rnd, sobre) {
  const [x, y, s] = noChao(g, f, k), tw = w * s, th = 26 * s, ah = 150 * s;
  bloco(c, x - tw / 2 + 10 * s, y - ah, 16 * s, ah, "#6a4022", rnd, 2); bloco(c, x + tw / 2 - 26 * s, y - ah, 16 * s, ah, "#6a4022", rnd, 2);
  bloco(c, x - tw / 2 + 20 * s, y - ah * 0.35, tw - 40 * s, 10 * s, "#7a4a26", rnd, 2); // travessa de baixo
  bloco(c, x - tw / 2, y - ah - th, tw, th, cor, rnd, 6);
  if (sobre) sobre(c, x, y - ah - th, s);
}

// ---------- os cômodos ----------
const CEU_MANHA = ["#f6c8a0", "#e8a8b8", "#a890c8", "#6a6aa8"];
const MOBILIA = {
  padaria(c, g, r) {
    quarto(c, g, (cc, x, y, w, h) => tijolosEm(cc, x, y, w, h, r), r);
    const [fx, fy] = naParede(g, 0.14, 0.12), fw = g.bw * 0.24;
    // coifa e forno de tijolo claro com a boca em arco
    poligono(c, [[fx + fw * 0.3, g.by], [fx + fw * 0.7, g.by], [fx + fw * 0.7, fy + 120], [fx + fw * 1.05, fy + 300], [fx - fw * 0.05, fy + 300], [fx + fw * 0.3, fy + 120]], "#a8a49a", r, 14);
    bloco(c, fx - fw * 0.02, fy + 300, fw * 1.04, g.chaoY - fy - 300, "#d8cdbc", r, 14);
    tijolosEm(c, fx + 4, fy + 304, fw * 1.04 - 8, g.chaoY - fy - 308, r, ["#e2d6c4", "#cfc2ae", "#d9ccb8"]);
    const ox = fx + fw * 0.5, oy = g.chaoY - 60;
    c.fillStyle = "#1e1008"; c.beginPath(); c.moveTo(ox - 90, oy); c.lineTo(ox - 90, oy - 110); c.arc(ox, oy - 110, 90, Math.PI, 0); c.lineTo(ox + 90, oy); c.fill();
    c.strokeStyle = "#a8442a"; c.lineWidth = 16; c.beginPath(); c.moveTo(ox - 100, oy); c.lineTo(ox - 100, oy - 110); c.arc(ox, oy - 110, 100, Math.PI, 0); c.lineTo(ox + 100, oy); c.stroke();
    bloco(c, ox - 150, oy - 40, 40, 60, "#3a3a40", r, 2); // portinhola aberta
    janelaQ(c, ...naParede(g, 0.66, 0.16), 220, 360, CEU_MANHA, r);
    relogioQ(c, ...naParede(g, 0.42, 0.14), 40, r);
    lousaQ(c, ...naParede(g, 0.02, 0.36), 120, 150, r);
    for (let i = 0; i < 3; i++) prateleiraQ(c, ...naParede(g, 0.83, 0.24 + i * 0.17), 150, r, [itPao, itPao, itPao]);
    prateleiraQ(c, ...naParede(g, 0.83, 0.75), 150, r, [itPote, itPote, itPote]);
    prateleiraQ(c, ...naParede(g, 0.02, 0.2), 120, r, [itPrato, itPote]);
    guirlanda(c, ...naParede(g, 0.6, 0.06), 300, r);
    espiga(c, ...naParede(g, 0.94, 0.05), r);
    for (let i = 0; i < 4; i++) quadroQ(c, ...naParede(g, 0.94 + (i % 2) * 0.03, 0.3 + i * 0.12), 40, 50, r);
    const [kx, ky] = naParede(g, 0.6, 0.66); // balcão de azulejo rosado no fundo, com bolo e chaleira
    bloco(c, kx, ky, g.bw * 0.34, g.chaoY - ky, "#e6c8c8", r, 8);
    c.fillStyle = "#e9e0d0"; c.fillRect(kx - 6, ky - 10, g.bw * 0.34 + 12, 14);
    boloAndares(c, kx + g.bw * 0.27, ky - 10, 0.9, r);
    chaleira(c, kx + g.bw * 0.17, ky - 10, 0.7, r);
    for (let i = 0; i < 5; i++) paoQ(c, kx + 40 + i * 34, ky - 22, 30, 20, r);
    // o meio do cômodo: mesa grande de sovar, rack de pães, bicicleta, sacos, abóboras
    tapeteQ(c, g, 0.55, 0.78, 360, ["#3f6a8a", "#e2a73a", "#c94a3a", "#7aa88a", "#f4e6c8"]);
    const [rkx, rky, rks] = noChao(g, 0.08, 0.55); rackPaes(c, rkx, rky, rks, r);
    mesa(c, g, 0.58, 0.6, 560, "#c99a5a", r, (cc, x, y, s) => { tigela(cc, x - 120 * s, y, s, "#e9d2a0", r); for (let i = 0; i < 3; i++) paoQ(cc, x + (40 + i * 60) * s, y - 14 * s, 50 * s, 26 * s, r); cc.fillStyle = "#f8f2e6"; cc.beginPath(); cc.ellipse(x + 220 * s, y - 4, 60 * s, 12 * s, 0, 0, Math.PI * 2); cc.fill(); });
    const [bx, by, bs] = noChao(g, 0.12, 0.95); bicicleta(c, bx, by, bs * 1.1, r);
    for (let i = 0; i < 3; i++) { const [sx, sy, ss] = noChao(g, 0.86 + i * 0.05, 0.8 + (i % 2) * 0.1); saco(c, sx, sy, ss, r); }
    const [ax, ay, as] = noChao(g, 0.3, 0.98); aboboraQ(c, ax, ay - 30, 46 * as, r, true);
    const [a2x, a2y, a2s] = noChao(g, 0.66, 0.97); aboboraQ(c, a2x, a2y - 30, 40 * a2s, r);
    for (let i = 0; i < 3; i++) { const [px, py, ps] = noChao(g, 0.76 + i * 0.04, 0.9); aboboraQ(c, px, py - 24, 30 * ps, r); }
    const [tx, ty, ts] = noChao(g, 0.46, 0.99); tigela(c, tx, ty - 10, ts * 0.9, "#cfc6b8", r);
  },
  casa(c, g, r) {
    quarto(c, g, (cc, x, y, w, h) => papelParede(cc, x, y, w, h, "#f0dfb8", ["#e8a87a", "#9ab88a", "#e8c870"], r), r, "#d8e8d8", "#c94a3a");
    janelaQ(c, ...naParede(g, 0.42, 0.14), 240, 290, ["#ffe0b8", "#f6c8a8", "#c8b0d0"], r, false);
    c.fillStyle = "#e8a8b8"; const [cwx, cwy] = naParede(g, 0.4, 0.1); c.fillRect(cwx - 30, cwy, 40, 340); c.fillRect(cwx + 240 + 30, cwy, 40, 340); // cortinas
    const [vx, vy] = naParede(g, 0.05, 0.06); // varal de roupinhas
    c.strokeStyle = "#5a3420"; c.lineWidth = 2; c.beginPath(); c.moveTo(vx, vy); c.quadraticCurveTo(vx + 260, vy + 50, vx + 520, vy); c.stroke();
    for (let i = 0; i < 10; i++) { const q = (i + 0.5) / 10, px = vx + q * 520, py = vy + Math.sin(q * Math.PI) * 46; bloco(c, px - 16, py, 32, 34 + (i % 3) * 6, ["#5a8ac8", "#e8775a", "#f2c94b", "#7aa88a", "#c94a3a"][i % 5], r, 2); }
    relogioQ(c, ...naParede(g, 0.78, 0.12), 34, r);
    const [gx, gy] = naParede(g, 0.02, 0.32); bloco(c, gx, gy, 130, g.chaoY - gy, "#8ac0b8", r, 8, 14); // geladeira com desenhos
    for (let i = 0; i < 6; i++) quadroQ(c, gx + 14 + (i % 2) * 56, gy + 30 + Math.floor(i / 2) * 64, 42, 48, r);
    const [bx, by] = naParede(g, 0.2, 0.62); bloco(c, bx, by, 230, g.chaoY - by, "#6aa0a8", r, 8); c.fillStyle = "#e9d8b8"; c.fillRect(bx - 4, by - 10, 238, 14);
    plantaQ(c, bx + 50, by - 40, 0.8, r); chaleira(c, bx + 170, by - 8, 0.6, r);
    prateleiraQ(c, ...naParede(g, 0.74, 0.32), 200, r, [itLivro, itLivro, itPlanta, itLivro]);
    prateleiraQ(c, ...naParede(g, 0.74, 0.48), 200, r, [itPote, itLivro, itPrato]);
    for (let i = 0; i < 4; i++) quadroQ(c, ...naParede(g, 0.68 + i * 0.07, 0.04), 44, 54, r);
    for (let i = 0; i < 7; i++) { const [dx, dy] = naParede(g, 0.2 + i * 0.03, 0.34 + (i % 2) * 0.08); c.save(); c.translate(dx, dy); c.rotate((r() - 0.5) * 0.3); c.fillStyle = "#fbf6ea"; c.fillRect(-15, -18, 30, 36); c.strokeStyle = ["#e8775a", "#5a8ac8", "#3f7a5a"][i % 3]; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 8, 0, Math.PI * 2); c.stroke(); c.restore(); }
    const [sx, sy, ss] = noChao(g, 0.8, 0.2); // sofá, tapete, brinquedos espalhados
    bloco(c, sx - 200 * ss, sy - 150 * ss, 400 * ss, 90 * ss, "#4f9a9a", r, 8, 20); bloco(c, sx - 210 * ss, sy - 70 * ss, 420 * ss, 70 * ss, "#3f8a8a", r, 8, 16);
    bloco(c, sx - 150 * ss, sy - 140 * ss, 80 * ss, 60 * ss, "#f2c94b", r, 3, 14); bloco(c, sx + 60 * ss, sy - 140 * ss, 80 * ss, 60 * ss, "#e8775a", r, 3, 14);
    tapeteQ(c, g, 0.5, 0.72, 420, ["#5a8ac8", "#f2c94b", "#e8775a", "#7aa88a", "#f4e6c8"]);
    for (let i = 0; i < 8; i++) { const [px, py, ps] = noChao(g, 0.26 + i * 0.05, 0.85 + (i % 3) * 0.05); bloco(c, px, py - 30 * ps, 30 * ps, 30 * ps, ["#e8775a", "#5a8ac8", "#f2c94b", "#3f7a5a"][i % 4], r, 2); }
    const [dx2, dy2, ds2] = noChao(g, 0.14, 0.9); // dinossauro de pelúcia
    c.fillStyle = "#8a6ab8"; c.beginPath(); c.ellipse(dx2, dy2 - 34 * ds2, 64 * ds2, 30 * ds2, 0, 0, Math.PI * 2); c.ellipse(dx2 + 56 * ds2, dy2 - 70 * ds2, 24 * ds2, 30 * ds2, 0.4, 0, Math.PI * 2); c.fill();
    const [mx, my, ms] = noChao(g, 0.62, 0.92); bloco(c, mx - 8, my - 90 * ms, 110 * ms, 90 * ms, "#c94a3a", r, 4, 18); // mochila aberta
    bloco(c, mx + 8 * ms, my - 70 * ms, 78 * ms, 36 * ms, "#a83a2a", r, 2, 8);
    const [ax, ay, as] = noChao(g, 0.92, 0.97); aboboraQ(c, ax, ay - 30, 40 * as, r, true);
    portaParada(c, "casa", r);
  },
};
// os cômodos da cidade que ainda não ganharam detalhe completo: perspectiva, cor e alguns objetos
const GENERICO = {
  lanchonete: ["#bfe0d8", "#e8e2d0"], escola: ["#f2deb0", "#d8e8f0"], oficina: ["#3f7a5a", "#d8cdbc"], correio: ["#e8d8b0", "#cfe0e8"],
  biblioteca: ["#e8d0a8", "#c8d8c0"], salao: ["#d8c0a0", "#e8e0c8"], petshop: ["#c8c0e0", "#e8e0f0"], radio: ["#4a3a6a", "#3a3058"],
};
function comodoGenerico(c, g, nome, r) {
  const [cor, rod] = GENERICO[nome];
  quarto(c, g, (cc, x, y, w, h) => (nome === "oficina" ? tabuasVerticais(cc, x, y, w, h, cor, r) : papelParede(cc, x, y, w, h, cor, ["#e8a87a", "#9ab88a"], r)), r, rod);
  janelaQ(c, ...naParede(g, 0.4 + r() * 0.2, 0.14), 200, 260, nome === "radio" ? ["#141838", "#2a2a68"] : ["#a8d0e8", "#e8f0f0"], r, nome !== "lanchonete");
  for (let i = 0; i < 3; i++) prateleiraQ(c, ...naParede(g, 0.05 + i * 0.32, 0.3 + (i % 2) * 0.12), 170, r, [itLivro, itPote, itPlanta]);
  for (let i = 0; i < 5; i++) quadroQ(c, ...naParede(g, 0.1 + i * 0.17, 0.06), 46, 56, r);
  relogioQ(c, ...naParede(g, 0.86, 0.2), 30, r);
  tapeteQ(c, g, 0.5, 0.75, 380, ["#c94a3a", "#f2c94b", "#3f7a5a", "#f4e6c8"]);
  mesa(c, g, 0.5, 0.55, 520, "#c99a5a", r, (cc, x, y, s) => { tigela(cc, x - 80 * s, y, s * 0.7, "#e9d2a0", r); itLivro(cc, x + 60 * s, y, r); });
  for (let i = 0; i < 3; i++) { const [ax, ay, as] = noChao(g, 0.15 + i * 0.35, 0.95); aboboraQ(c, ax, ay - 26, 34 * as, r, i === 1); }
  for (let i = 0; i < 4; i++) prateleiraQ(c, ...naParede(g, 0.03 + i * 0.25, 0.52), 150, r, [itPote, itLivro, itPrato]);
  const [kx, ky] = naParede(g, 0.62, 0.68); bloco(c, kx, ky, g.bw * 0.3, g.chaoY - ky, ["#c94a3a", "#e2a73a", "#5a8ac8", "#7aa88a"][Math.floor(r() * 4)], r, 6);
  for (let i = 0; i < 4; i++) { const [px, py] = naParede(g, 0.64 + i * 0.07, 0.62); plantaQ(c, px, py, 0.5, r); }
  for (let i = 0; i < 4; i++) { const [cx, cy, cs] = noChao(g, 0.2 + i * 0.2, 0.7 + (i % 2) * 0.1); bloco(c, cx - 22 * cs, cy - 90 * cs, 44 * cs, 10 * cs, "#8a5a32", r, 2); bloco(c, cx - 22 * cs, cy - 160 * cs, 8 * cs, 160 * cs, "#6a4022", r, 1); bloco(c, cx + 14 * cs, cy - 90 * cs, 8 * cs, 90 * cs, "#6a4022", r, 1); }
  const [p1x, p1y, p1s] = noChao(g, 0.04, 0.9); plantaQ(c, p1x, p1y - 60 * p1s, 1.3 * p1s, r);
  const [p2x, p2y, p2s] = noChao(g, 0.96, 0.9); plantaQ(c, p2x, p2y - 60 * p2s, 1.3 * p2s, r);
  if (PORTAS[nome] !== undefined) portaParada(c, nome, r);
}

// ---------- prédios: fachada, telhado, lajes ----------
function pintarPredio(c, p, r) {
  const topo = ANDAR.primeiro[0] - 40, x = p.x, w = p.w;
  if (p.tijolo) tijolosEm(c, x, topo, w, MUNDO.chao - topo, r); else bloco(c, x, topo, w, MUNDO.chao - topo, p.cor, r, 40);
  for (const [y0] of Object.values(ANDAR)) { bloco(c, x - 10, y0 - 40, w + 20, 40, "#4a2a18", r, 4); for (let i = 0; i * 40 < w; i++) { c.fillStyle = i % 2 ? "#f0dcb4" : "#2a160a"; c.fillRect(x + i * 40 + 4, y0 - 30, 32, 20); } }
  if (p.telhado === "empena") {
    const pts = [[x, topo], [x, topo - 140], [x + w * 0.1, topo - 140], [x + w * 0.1, topo - 260], [x + w * 0.2, topo - 260], [x + w * 0.2, topo - 370], [x + w * 0.3, topo - 370], [x + w * 0.3, topo - 460], [x + w * 0.7, topo - 460], [x + w * 0.7, topo - 370], [x + w * 0.8, topo - 370], [x + w * 0.8, topo - 260], [x + w * 0.9, topo - 260], [x + w * 0.9, topo - 140], [x + w, topo - 140], [x + w, topo]];
    c.save(); caminho(c, pts); c.clip(); tijolosEm(c, x, topo - 470, w, 470, r); c.restore(); nanquim(c, pts, r, 2.6);
    janelaQ(c, x + w * 0.46, topo - 400, 110, 160, ["#f6c8a8", "#c9a8d8"], r, true);
    tijolosEm(c, x + w * 0.82, topo - 640, 100, 400, r); nanquim(c, ret(x + w * 0.82, topo - 640, 100, 400), r);
  } else if (p.telhado === "plano") {
    bloco(c, x - 20, topo - 80, w + 40, 80, "#2f6a6a", r, 8);
    if (p.placa === "xicara") { // placa da lanchonete: uma xícara enorme no telhado
      const cx = x + w * 0.3, cy = topo - 260;
      c.strokeStyle = "#5a3420"; c.lineWidth = 6; c.beginPath(); c.moveTo(cx - 80, cy + 90); c.lineTo(cx - 80, topo - 80); c.moveTo(cx + 80, cy + 90); c.lineTo(cx + 80, topo - 80); c.stroke();
      poligono(c, [[cx - 110, cy - 90], [cx + 110, cy - 90], [cx + 80, cy + 90], [cx - 80, cy + 90]], "#f4ead8", r, 8);
      c.strokeStyle = "#f4ead8"; c.lineWidth = 26; c.beginPath(); c.arc(cx + 120, cy, 52, -1.3, 1.3); c.stroke();
      c.fillStyle = "#c94a3a"; c.fillRect(cx - 100, cy - 40, 200, 30);
    }
  } else if (p.telhado === "cornija") {
    bloco(c, x - 30, topo - 120, w + 60, 120, "#2f5a44", r, 8);
    for (let i = 0; i < 14; i++) bloco(c, x - 20 + i * (w + 40) / 14, topo - 30, 30, 30, "#e8dcc0", r, 1);
  } else if (p.telhado === "torre") {
    poligono(c, [[x - 40, topo], [x + w * 0.5, topo - 200], [x + w + 40, topo]], "#4f8a7a", r, 14);
    const tx = x + w * 0.5 - 150;
    bloco(c, tx, topo - 620, 300, 460, "#e8d8b8", r, 12);
    relogioQ(c, tx + 150, topo - 470, 100, r);
    poligono(c, [[tx - 30, topo - 620], [tx + 150, topo - 820], [tx + 330, topo - 620]], "#3f7a6a", r, 6);
  } else if (p.telhado === "mansarda") {
    poligono(c, [[x - 40, topo], [x + 40, topo - 220], [x + w - 40, topo - 220], [x + w + 40, topo]], "#3a3a5a", r, 12);
    for (let i = 0; i < 2; i++) janelaQ(c, x + w * 0.25 + i * w * 0.4, topo - 190, 90, 120, ["#ffe0a8", "#f2c88a"], r, true);
  }
  for (const nome of Object.values(p.comodos)) if (!MOBILIA[nome]) comodoGenerico(c, caixaQ(COMODO[nome]), nome, r); // os detalhados vão em tela própria
  const ty = ANDAR.terreo[0] - 4, n = Math.round(w / 110), lw = (w + 40) / n; // toldo listrado entre os andares
  for (let i = 0; i < n; i++) { const tx = x - 20 + i * lw; poligono(c, [[tx, ty], [tx + lw, ty], [tx + lw, ty + 60], [tx + lw / 2, ty + 84], [tx, ty + 60]], i % 2 ? "#f2e6c8" : p.tijolo ? "#3f7a5a" : "#c94a3a", r, 4); }
  nanquim(c, ret(x, topo, w, MUNDO.chao - topo), r, 3);
}

// ---------- céu, morros, rua (do amanhecer à noite) ----------
function fazerFundo() {
  const k = 0.5, f = tela(MUNDO.w * k, MUNDO.h * k), c = f.getContext("2d"), r = rng(7);
  c.scale(k, k);
  const g = c.createLinearGradient(0, 0, MUNDO.w, 0);
  g.addColorStop(0, "#f6b890"); g.addColorStop(0.12, "#d8a8c0"); g.addColorStop(0.3, "#8cc4e8"); g.addColorStop(0.62, "#7ab0e0"); g.addColorStop(0.8, "#5a5a9a"); g.addColorStop(1, "#1a1e48");
  c.fillStyle = g; c.fillRect(0, 0, MUNDO.w, MUNDO.h);
  for (let i = 0; i < 300; i++) { const x = MUNDO.w * (0.78 + r() * 0.22); c.fillStyle = `rgba(255,250,220,${r() * 0.8})`; c.fillRect(x, r() * 900, 3, 3); } // estrelas do lado da noite
  for (const [cor, base, amp, per] of [["#8a7ab0", 1200, 110, 700], ["#7a9a6a", 1450, 70, 420], ["#c98a4a", 1650, 50, 300]]) {
    c.fillStyle = cor; c.beginPath(); c.moveTo(0, MUNDO.h);
    for (let x = 0; x <= MUNDO.w; x += 50) c.lineTo(x, base - Math.sin(x / per) * amp - Math.sin(x / 130) * 12);
    c.lineTo(MUNDO.w, MUNDO.h); c.fill();
  }
  for (let i = 0; i < 260; i++) { // árvores de outono atrás dos prédios
    const x = r() * MUNDO.w, y = 1640 + r() * 300, rr = 40 + r() * 70;
    c.fillStyle = "#5a3420"; c.fillRect(x - 6, y, 12, 120);
    c.fillStyle = ["#e8843a", "#d9542a", "#f2b84b", "#a8442a", "#6f8a3a", "#c96a2a"][i % 6];
    caminho(c, tremido([...Array(10)].map((_, q) => [x + Math.cos(q * 0.628) * rr, y + Math.sin(q * 0.628) * rr * 0.85]), rr * 0.12, r, 3)); c.fill();
  }
  bloco(c, 5560, 1500, 120, 160, "#f4f0e6", r, 3); poligono(c, [[5540, 1500], [5620, 1400], [5700, 1500]], "#c94a3a", r, 2); c.fillStyle = "#f4f0e6"; c.fillRect(5612, 1300, 16, 110); // igrejinha
  c.strokeStyle = "#2a2a48"; c.lineWidth = 6; c.beginPath(); c.moveTo(8880, 1500); c.lineTo(8950, 900); c.lineTo(9020, 1500); c.moveTo(8900, 1300); c.lineTo(9000, 1300); c.moveTo(8920, 1100); c.lineTo(8980, 1100); c.stroke(); // torre de rádio
  for (const p of PREDIOS) pintarPredio(c, p, r);
  bloco(c, 0, MUNDO.chao, MUNDO.w, 90, "#b8ab98", r, 60); // calçada e rua
  bloco(c, 0, MUNDO.chao + 90, MUNDO.w, MUNDO.h, "#5a5a62", r, 80);
  c.fillStyle = "#f2c94b"; for (let x = 0; x < MUNDO.w; x += 200) c.fillRect(x, MUNDO.chao + 270, 100, 10);
  for (const zx of [1810, 4060, 5700]) for (let i = 0; i < 6; i++) { c.fillStyle = "#f4f0e6"; c.fillRect(zx + i * 26, MUNDO.chao + 110, 16, 300); } // faixas de pedestre
  return f;
}

// ---------- gente, bichos, carros ----------
function pessoa(c, x, y, s, o, t) {
  c.save(); c.translate(x, y); c.scale(s * (o.vira || 1), s);
  const resp = Math.sin(t * 2 + (o.seed || 0)) * 2;
  const passo = o.anda ? Math.sin(t * 7 + (o.seed || 0)) : 0;
  c.lineCap = "round";
  for (const [lado, fase] of [[-1, passo], [1, -passo]]) { // pernas e sapatos
    c.strokeStyle = o.calca || "#4a5a8a"; c.lineWidth = 24;
    c.beginPath(); c.moveTo(lado * 14, -140); c.lineTo(lado * 14 + fase * 22, -14); c.stroke();
    c.fillStyle = "#3a2214"; c.beginPath(); c.ellipse(lado * 14 + fase * 22 + 8, -8, 20, 9, 0, 0, Math.PI * 2); c.fill();
  }
  const corpo = () => { c.beginPath(); c.moveTo(-34, -262 + resp); c.quadraticCurveTo(0, -276 + resp, 34, -262 + resp); c.lineTo(o.saia ? 52 : 40, -130); c.lineTo(o.saia ? -52 : -40, -130); c.closePath(); };
  if (o.saia) { c.fillStyle = o.saia; c.beginPath(); c.moveTo(-48, -150); c.lineTo(48, -150); c.lineTo(58, -40); c.lineTo(-58, -40); c.fill(); c.strokeStyle = COR.tinta; c.lineWidth = 1.6; c.stroke(); }
  corpo(); c.fillStyle = o.roupa || "#c94a3a"; c.fill();
  c.save(); corpo(); c.clip(); c.fillStyle = "rgba(40,15,5,0.18)"; c.fillRect(8, -280, 60, 160); c.restore();
  if (o.avental) { c.fillStyle = "#f2ead8"; c.beginPath(); c.roundRect(-30, -232 + resp, 60, 170, 10); c.fill(); c.strokeStyle = COR.tinta; c.lineWidth = 1.5; c.stroke(); }
  c.strokeStyle = COR.tinta; c.lineWidth = 2; corpo(); c.stroke();
  const [ae, ad] = o.bracos ? o.bracos(t) : [0.25, -0.25];
  for (const [lado, a] of [[-1, ae], [1, ad]]) {
    const ox = lado * 32, oy = -254 + resp, L = 104;
    const hx = ox + Math.sin(a) * L * lado, hy = oy + Math.cos(a) * L;
    c.strokeStyle = o.roupa || "#c94a3a"; c.lineWidth = 19;
    c.beginPath(); c.moveTo(ox, oy); c.quadraticCurveTo(ox + Math.sin(a) * L * 0.5 * lado + lado * 8, oy + Math.cos(a) * L * 0.5, hx, hy); c.stroke();
    c.fillStyle = o.pele; c.beginPath(); c.arc(hx, hy, 10, 0, Math.PI * 2); c.fill();
  }
  const cab = o.cabeca ? o.cabeca(t) : 0;
  c.save(); c.translate(0, -290 + resp); c.rotate(cab);
  c.fillStyle = o.pele; c.fillRect(-8, 6, 16, 16); // pescoço
  if (o.cabelo === "lenco") { c.fillStyle = "#3f8a9a"; c.beginPath(); c.arc(16, -34, 10, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = o.pele; c.beginPath(); c.ellipse(0, 0, 26, 30, 0, 0, Math.PI * 2); c.fill();
  const corCab = { coque: "#c8c4c0", cacho: "#2a1a10", curto: "#5a3418", liso: "#3a2214", ruivo: "#b8542a" }[o.cabelo];
  if (o.cabelo === "lenco") { c.fillStyle = "#3f8a9a"; c.beginPath(); c.arc(0, -8, 28, Math.PI * 1.05, Math.PI * 1.95); c.fill(); }
  else if (o.cabelo === "cacho") { c.fillStyle = corCab; for (let i = 0; i < 14; i++) { const a = Math.PI * 0.95 + (i / 13) * Math.PI * 1.1; c.beginPath(); c.arc(Math.cos(a) * 24, Math.sin(a) * 24 - 6, 10, 0, Math.PI * 2); c.fill(); } }
  else { c.fillStyle = corCab; c.beginPath(); c.arc(0, -6, 28, Math.PI * 1.02, Math.PI * 1.98); c.quadraticCurveTo(8, -22, -27, -2); c.fill(); if (o.cabelo === "liso") c.fillRect(-28, -6, 12, 46); if (o.cabelo === "coque") { c.beginPath(); c.arc(0, -36, 13, 0, Math.PI * 2); c.fill(); } }
  c.fillStyle = "#2a1a10"; c.beginPath(); c.arc(-9, 2, 2.6, 0, Math.PI * 2); c.arc(9, 2, 2.6, 0, Math.PI * 2); c.fill();
  c.fillStyle = "rgba(220,100,90,0.35)"; c.beginPath(); c.arc(-15, 12, 5, 0, Math.PI * 2); c.arc(15, 12, 5, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "#5a2a18"; c.lineWidth = 2; c.beginPath(); c.arc(0, 12, 6, 0.3, Math.PI - 0.3); c.stroke();
  if (o.oculos) { c.strokeStyle = "#5a3418"; c.lineWidth = 1.8; c.beginPath(); c.arc(-9, 2, 7, 0, Math.PI * 2); c.moveTo(16, 2); c.arc(9, 2, 7, 0, Math.PI * 2); c.stroke(); }
  if (o.bigode) { c.fillStyle = o.bigode; c.beginPath(); c.ellipse(-7, 9, 9, 4, 0.2, 0, Math.PI * 2); c.ellipse(7, 9, 9, 4, -0.2, 0, Math.PI * 2); c.fill(); }
  if (o.fone) { c.strokeStyle = "#2a2a30"; c.lineWidth = 5; c.beginPath(); c.arc(0, -4, 31, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); c.fillStyle = "#2a2a30"; c.beginPath(); c.ellipse(-28, 2, 8, 12, 0, 0, Math.PI * 2); c.ellipse(28, 2, 8, 12, 0, 0, Math.PI * 2); c.fill(); }
  if (o.bone) { c.fillStyle = o.bone; c.beginPath(); c.arc(0, -10, 28, Math.PI, 0); c.fill(); c.fillRect(0, -14, 38, 7); }
  c.strokeStyle = COR.tinta; c.lineWidth = 1.6; c.beginPath(); c.ellipse(0, 0, 26, 30, 0, 0, Math.PI * 2); c.stroke();
  c.restore();
  c.restore();
}
function gato(c, x, y, s, t, cor = "#d9883a") {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = cor; c.beginPath(); c.ellipse(0, 0, 64, 30, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(-60, -10, 26, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.moveTo(-80, -24); c.lineTo(-76, -50); c.lineTo(-62, -30); c.moveTo(-52, -30); c.lineTo(-42, -50); c.lineTo(-38, -24); c.fill();
  c.strokeStyle = cor; c.lineWidth = 11; c.lineCap = "round";
  c.beginPath(); c.moveTo(60, 0); c.quadraticCurveTo(96, -10 + Math.sin(t * 2) * 16, 88, -44 + Math.sin(t * 2) * 12); c.stroke();
  c.strokeStyle = "rgba(120,50,10,0.55)"; c.lineWidth = 4; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-26 + i * 16, -26); c.lineTo(-20 + i * 16, -4); c.stroke(); }
  c.strokeStyle = COR.tinta; c.lineWidth = 2; c.beginPath(); c.arc(-68, -10, 4, 0, Math.PI); c.stroke(); c.beginPath(); c.arc(-52, -10, 4, 0, Math.PI); c.stroke();
  c.beginPath(); c.ellipse(0, 0, 64, 30, 0, 0, Math.PI * 2); c.stroke();
  c.restore();
}
function cachorro(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = "#c98a5a"; c.beginPath(); c.ellipse(0, -44, 62, 32, 0, 0, Math.PI * 2); c.fill();
  c.fillRect(-46, -30, 14, 34); c.fillRect(30, -30, 14, 34);
  c.beginPath(); c.arc(-64, -70, 27, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#7a4a26"; c.beginPath(); c.ellipse(-82, -64, 10, 22, 0.3 + Math.sin(t * 3) * 0.1, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#2a1a10"; c.beginPath(); c.arc(-72, -74, 3.5, 0, Math.PI * 2); c.arc(-90, -64, 4, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "#c98a5a"; c.lineWidth = 9; c.lineCap = "round"; c.beginPath(); c.moveTo(58, -50); c.lineTo(86 + Math.sin(t * 10) * 12, -82); c.stroke();
  c.strokeStyle = COR.tinta; c.lineWidth = 2; c.beginPath(); c.ellipse(0, -44, 62, 32, 0, 0, Math.PI * 2); c.stroke();
  c.restore();
}
function carro(c, x, y, cor, tipo, t, dir) {
  c.save(); c.translate(x, y); c.scale(dir, 1);
  const L = tipo === "onibus" ? 420 : 240, A = tipo === "onibus" ? 150 : 90;
  c.fillStyle = "rgba(20,10,5,0.25)"; c.beginPath(); c.ellipse(0, 6, L * 0.55, 14, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = cor; c.beginPath(); c.roundRect(-L / 2, -A - 10, L, A, 24); c.fill();
  if (tipo !== "onibus") { c.beginPath(); c.roundRect(-L * 0.3, -A - 60, L * 0.55, 60, 22); c.fill(); }
  c.fillStyle = "#cfe6f0";
  if (tipo === "onibus") for (let i = 0; i < 6; i++) c.fillRect(-L / 2 + 20 + i * 64, -A + 4, 48, 44);
  else { c.fillRect(-L * 0.26, -A - 50, L * 0.22, 40); c.fillRect(0, -A - 50, L * 0.2, 40); }
  if (tipo === "policia") { c.fillStyle = "#2a2a3a"; c.fillRect(-L / 2, -A + 20, L, 26); c.fillStyle = Math.sin(t * 12) > 0 ? "#e83a3a" : "#3a6ae8"; c.fillRect(-14, -A - 74, 28, 14); }
  c.strokeStyle = COR.tinta; c.lineWidth = 2.5; c.beginPath(); c.roundRect(-L / 2, -A - 10, L, A, 24); c.stroke();
  for (const rx of [-L * 0.32, L * 0.32]) { c.fillStyle = "#2a1a10"; c.beginPath(); c.arc(rx, -10, 26, 0, Math.PI * 2); c.fill(); c.strokeStyle = "#c8c0b0"; c.lineWidth = 4; const a = t * 8; c.beginPath(); c.moveTo(rx + Math.cos(a) * 16, -10 + Math.sin(a) * 16); c.lineTo(rx - Math.cos(a) * 16, -10 - Math.sin(a) * 16); c.stroke(); }
  c.fillStyle = "#fff2b0"; c.beginPath(); c.arc(L / 2 - 8, -A + 30, 10, 0, Math.PI * 2); c.fill();
  c.restore();
}
function passaros(c, t, x0, y0) {
  c.strokeStyle = "rgba(40,30,30,0.8)"; c.lineWidth = 3; c.lineCap = "round";
  for (let i = 0; i < 6; i++) {
    const x = x0 + ((t * 60 + i * 70) % 2400), y = y0 + Math.sin(t + i) * 30 + i * 18, b = Math.sin(t * 10 + i) * 10;
    c.beginPath(); c.moveTo(x - 16, y - b); c.quadraticCurveTo(x - 6, y - 4, x, y); c.quadraticCurveTo(x + 6, y - 4, x + 16, y - b); c.stroke();
  }
}
function nuvens(c, t) {
  for (let i = 0; i < 18; i++) {
    const r = rng(500 + i), x = (r() * MUNDO.w + t * (8 + r() * 10)) % (MUNDO.w + 600) - 300, y = 180 + r() * 600;
    for (let b = 0; b < 5; b++) {
      const bx = x + (b - 2) * 80, by = y + Math.sin(b * 1.7) * 18, br = 60 + (b % 3) * 18;
      c.fillStyle = "rgba(255,250,240,0.85)"; c.beginPath(); c.ellipse(bx, by, br, br * 0.55, 0, 0, Math.PI * 2); c.fill();
    }
    c.strokeStyle = "rgba(120,100,120,0.35)"; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y + 10, 230, 50, 0, 0.1, Math.PI - 0.1); c.stroke();
  }
}

// ---------- fogo, fumaça, vapor, poeira, folhas, lâmpadas ----------
function fogo(c, x, y, t) {
  const g = c.createRadialGradient(x, y, 10, x, y, 320);
  g.addColorStop(0, `rgba(255,170,80,${0.5 + Math.sin(t * 9) * 0.06})`); g.addColorStop(1, "rgba(255,120,40,0)");
  c.fillStyle = g; c.beginPath(); c.arc(x, y, 320, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 9; i++) {
    const fx = x - 70 + i * 18, h = 60 + Math.sin(t * 8 + i * 1.7) * 22 + (i % 3) * 16;
    c.fillStyle = ["#ffd24a", "#ff9a2a", "#ff6a1a"][i % 3];
    c.beginPath(); c.moveTo(fx - 14, y + 40); c.quadraticCurveTo(fx - 18, y + 40 - h * 0.6, fx + Math.sin(t * 6 + i) * 8, y + 40 - h); c.quadraticCurveTo(fx + 18, y + 40 - h * 0.6, fx + 14, y + 40); c.fill();
  }
  for (let i = 0; i < 8; i++) { const q = (t * 0.8 + i / 8) % 1; c.fillStyle = `rgba(255,200,100,${1 - q})`; c.fillRect(x - 40 + i * 12 + Math.sin(q * 8) * 10, y - q * 160, 3, 3); } // fagulhas
}
function vapor(c, x, y, t, n = 5, alt = 140) {
  for (let i = 0; i < n; i++) { const q = (t * 0.35 + i / n) % 1; c.fillStyle = `rgba(255,250,240,${0.38 * (1 - q)})`; c.beginPath(); c.arc(x + Math.sin(q * 6 + i) * 18, y - q * alt, 10 + q * 22, 0, Math.PI * 2); c.fill(); }
}
function poeiraNaLuz(c, x, y, w, h, t) { // feixe de luz da janela com poeirinha boiando
  c.save();
  const g = c.createLinearGradient(x, y, x - w * 0.4, y + h);
  g.addColorStop(0, "rgba(255,235,190,0.28)"); g.addColorStop(1, "rgba(255,235,190,0)");
  c.fillStyle = g; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w * 0.6, y + h); c.lineTo(x - w * 0.6, y + h); c.fill();
  for (let i = 0; i < 30; i++) { const r = rng(700 + i), px = x - w * 0.4 + r() * w * 1.6 + Math.sin(t * 0.5 + i) * 20, py = y + ((r() * h + t * 12) % h); c.fillStyle = `rgba(255,245,215,${0.6 * r()})`; c.beginPath(); c.arc(px, py, 2 + r() * 2, 0, Math.PI * 2); c.fill(); }
  c.restore();
}
function luzPoca(c, x, y, r, cor = "255,225,160", a = 0.3) { const g = c.createRadialGradient(x, y, 5, x, y, r); g.addColorStop(0, `rgba(${cor},${a})`); g.addColorStop(1, `rgba(${cor},0)`); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
function lampadaQ(c, x, y, fio, t, cor = "#3f7a5a") {
  c.save(); c.translate(x, y - fio); c.rotate(Math.sin(t * 1.4 + x) * 0.05);
  c.strokeStyle = "#2a1a10"; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, fio); c.stroke();
  c.fillStyle = cor; c.beginPath(); c.moveTo(-40, fio + 34); c.quadraticCurveTo(0, fio - 18, 40, fio + 34); c.fill();
  c.strokeStyle = COR.tinta; c.lineWidth = 2; c.stroke();
  c.fillStyle = "#fff4c0"; c.beginPath(); c.arc(0, fio + 34, 10, 0, Math.PI * 2); c.fill();
  luzPoca(c, 0, fio + 60, 260);
  c.restore();
}
function ventilador(c, x, y, t) {
  c.strokeStyle = "#3a2214"; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 40); c.lineTo(x, y); c.stroke();
  for (let i = 0; i < 4; i++) { const a = t * 4 + i * Math.PI / 2; c.fillStyle = "#8a5a32"; c.beginPath(); c.ellipse(x + Math.cos(a) * 70, y + Math.sin(a) * 9, 66 * Math.abs(Math.cos(a)) + 10, 9, 0, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = "#f2e2bc"; c.beginPath(); c.arc(x, y + 8, 12, 0, Math.PI * 2); c.fill();
}
function ponteiros(c, x, y, r, t) {
  c.strokeStyle = "#3a2214"; c.lineCap = "round";
  c.lineWidth = 3.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(t * 0.05) * r * 0.5, y - Math.cos(t * 0.05) * r * 0.5); c.stroke();
  c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(t * 0.6) * r * 0.75, y - Math.cos(t * 0.6) * r * 0.75); c.stroke();
  c.strokeStyle = "#c94a3a"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(Math.floor(t) * 0.1047) * r * 0.85, y - Math.cos(Math.floor(t) * 0.1047) * r * 0.85); c.stroke();
}
function folhas(c, t, x0, x1, y0, y1) {
  for (let i = 0; i < 40; i++) {
    const r = rng(900 + i), per = 7 + r() * 5, q = ((t + r() * per) % per) / per;
    const x = lerp(x0, x1, r()) + Math.sin(q * 9 + i) * 70, y = lerp(y0 - 100, y1, q);
    c.save(); c.translate(x, y); c.rotate(q * 12 + i); c.fillStyle = ["#e8843a", "#d9542a", "#f2b84b", "#a8442a"][i % 4];
    c.beginPath(); c.moveTo(-14, 0); c.quadraticCurveTo(0, -9, 14, 0); c.quadraticCurveTo(0, 9, -14, 0); c.fill(); c.restore();
  }
}

// ---------- a faísca e os desenhos de luz ----------
function faisca(c, x, y, s, t) {
  c.save(); c.translate(x, y + Math.sin(t * 2.4) * 8); c.rotate(Math.sin(t * 1.3) * 0.3 + t * 0.4); c.scale(s, s);
  const halo = c.createRadialGradient(0, 0, 4, 0, 0, 140);
  halo.addColorStop(0, "rgba(255,235,190,0.95)"); halo.addColorStop(0.25, "rgba(255,150,90,0.5)"); halo.addColorStop(1, "rgba(255,120,70,0)");
  c.fillStyle = halo; c.beginPath(); c.arc(0, 0, 140, 0, Math.PI * 2); c.fill();
  c.fillStyle = COR.coral; c.beginPath();
  for (let i = 0; i < 16; i++) { const a = (i * Math.PI) / 8, rr = i % 4 === 0 ? 70 : i % 2 === 0 ? 40 : 14; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  c.closePath(); c.fill();
  c.strokeStyle = "rgba(255,240,215,0.95)"; c.lineWidth = 3; c.lineJoin = "round"; c.stroke();
  c.fillStyle = "#fff8e8"; c.beginPath(); c.arc(0, 0, 14, 0, Math.PI * 2); c.fill();
  c.restore();
}
function rastro(c, pos, u, n = 14) { // pinceladas claras atrás da faísca, como na referência
  c.save(); c.lineCap = "round";
  for (let i = 1; i < n; i++) {
    const [x0, y0] = pos(u - i * 0.035), [x1, y1] = pos(u - (i - 1) * 0.035);
    c.strokeStyle = `rgba(255,230,190,${0.55 * (1 - i / n)})`; c.lineWidth = 26 * (1 - i / n) + 3;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    c.strokeStyle = `rgba(240,140,90,${0.4 * (1 - i / n)})`; c.lineWidth = 6 * (1 - i / n) + 1;
    c.beginPath(); c.moveTo(x0 + 10, y0 + 6); c.lineTo(x1 + 10, y1 + 6); c.stroke();
  }
  c.restore();
}
function neon(c, pts, k, larg = 7, fechado = false) { // traço de luz coral, rabiscado em dois traços
  if (k <= 0) return;
  c.save(); c.lineCap = c.lineJoin = "round";
  c.shadowColor = "rgba(255,110,60,0.95)"; c.shadowBlur = 26;
  c.strokeStyle = COR.neon; c.lineWidth = larg; tracar(c, pts, k, fechado);
  c.shadowBlur = 0; c.globalAlpha = 0.6; c.translate(3, -2); c.lineWidth = larg * 0.45; tracar(c, pts, k, fechado);
  c.globalAlpha = 1; c.translate(-3, 2); c.strokeStyle = "#ffe8d6"; c.lineWidth = larg * 0.3; tracar(c, pts, k, fechado);
  c.restore();
}
const circ = (x, y, r, n = 40, a0 = -Math.PI / 2) => [...Array(n + 1)].map((_, i) => [x + Math.cos(a0 + (i / n) * Math.PI * 2) * r, y + Math.sin(a0 + (i / n) * Math.PI * 2) * r]);
const elipse = (x, y, rx, ry, n = 30) => [...Array(n + 1)].map((_, i) => [x + Math.cos((i / n) * Math.PI * 2) * rx, y + Math.sin((i / n) * Math.PI * 2) * ry]);
function brilhinhos(c, x, y, t, n = 10, raio = 140) {
  for (let i = 0; i < n; i++) { const q = (t * 0.6 + i / n) % 1, a = i * 2.4; c.fillStyle = `rgba(255,220,170,${1 - q})`; c.beginPath(); c.arc(x + Math.cos(a) * raio * q, y + Math.sin(a) * raio * q - q * 40, 5 * (1 - q) + 1, 0, Math.PI * 2); c.fill(); }
}

// ---------- quem mora em cada cômodo e o que se mexe ali o tempo todo ----------
const ROSA = { pele: COR.pele[2], cabelo: "lenco", roupa: "#e2a73a", saia: "#6a4a5a", avental: true, seed: 3 };
const ZE = { pele: COR.pele[1], cabelo: "curto", roupa: "#8ab89a", calca: "#3f5a8a", seed: 4 };
const THEO = { pele: COR.pele[2], cabelo: "cacho", roupa: "#f2c94b", calca: "#3f6a9a", seed: 5 };
const MAE = { pele: COR.pele[2], cabelo: "liso", roupa: "#3f7a5a", calca: "#2a3a5a", seed: 8 };
const VIDA = {}; // a vida de fundo dos cômodos detalhados em comodos.js
const GENTE = ["#c94a3a", "#5a7ab8", "#3f7a5a", "#e2a73a", "#8a5a9a", "#d9702a"];
function vidaComodo(c, nome, t, cena) {
  const g = caixaQ(COMODO[nome]);
  if (GENERICO[nome] && !MOBILIA[nome]) {
    lampadaQ(c, ...naParede(g, 0.3, 0.3), 170, t, "#e2a73a"); lampadaQ(c, ...naParede(g, 0.7, 0.3), 170, t);
    ponteiros(c, ...naParede(g, 0.86, 0.2), 30, t);
    for (let k = 0; k < (cena === nome ? 0 : 4); k++) { // moradores indo e vindo, cada um no seu ritmo
      const r = rng(nome.length * 31 + k), fase = r() * 6, vai = Math.sin(t * (0.25 + r() * 0.2) + fase);
      const [px, py, ps] = noChao(g, 0.15 + k * 0.23 + vai * 0.06, 0.45 + r() * 0.4);
      pessoa(c, px, py, ps * (r() < 0.3 ? 0.7 : 0.95), { pele: COR.pele[Math.floor(r() * 4)], cabelo: ["curto", "liso", "cacho", "coque"][Math.floor(r() * 4)], roupa: GENTE[Math.floor(r() * 6)], calca: "#3a4a6a", vira: Math.cos(t * 0.3 + fase) > 0 ? 1 : -1, anda: Math.abs(Math.cos(t * 0.3 + fase)) > 0.3, bracos: (q) => [0.3 + Math.sin(q * 3 + fase) * 0.3, -0.3 - Math.sin(q * 2 + fase) * 0.4], seed: k + 20 }, t);
    }
  }
  if (nome === "padaria") {
    const [fx] = naParede(g, 0.14, 0.12), fw = g.bw * 0.24;
    fogo(c, fx + fw * 0.5, g.chaoY - 120, t);
    poeiraNaLuz(c, ...naParede(g, 0.68, 0.3), 180, 520, t);
    lampadaQ(c, ...naParede(g, 0.62, 0.36), 220, t); lampadaQ(c, ...naParede(g, 0.34, 0.3), 160, t, "#c94a3a");
    ponteiros(c, ...naParede(g, 0.42, 0.14), 40, t);
    const [vx, vy] = noChao(g, 0.44, 0.6); vapor(c, vx, vy - 190, t, 5);
    const [kx, ky] = naParede(g, 0.6, 0.66); vapor(c, kx + g.bw * 0.17 + 40, ky - 60, t, 4, 100);
    const [zx, zy, zs] = noChao(g, 0.22, 0.3); pessoa(c, zx, zy, zs * 0.95, { ...ZE, vira: -1, bracos: (q) => [1.6 + Math.sin(q * 2) * 0.15, -1.5 - Math.sin(q * 2 + 1) * 0.15] }, t); // seu Zé no forno
    const [gx, gy, gs] = noChao(g, 0.86, 0.96); gato(c, gx, gy - 30, gs * 1.1, t);
    if (cena !== "abertura" && cena !== "padaria") { const [rx, ry, rs] = noChao(g, 0.5, 0.58); pessoa(c, rx, ry, rs * 1.05, { ...ROSA, bracos: (q) => [0.9 + Math.sin(q * 4) * 0.25, -0.9 - Math.sin(q * 4 + 1) * 0.25] }, t); }
  }
  if (nome === "casa") {
    ventilador(c, g.x + g.w * 0.5, g.by - 20, t);
    ponteiros(c, ...naParede(g, 0.78, 0.12), 34, t);
    poeiraNaLuz(c, ...naParede(g, 0.47, 0.3), 200, 480, t);
    lampadaQ(c, ...naParede(g, 0.2, 0.3), 160, t, "#e2a73a");
    const [dx, dy, ds] = noChao(g, 0.76, 0.85); cachorro(c, dx, dy, ds, t);
    const [mx, my, ms] = noChao(g, 0.3, 0.42); pessoa(c, mx, my, ms, { ...MAE, bracos: (q) => [0.4, -1.2 + Math.sin(q * 3) * 0.2] }, t);
    if (cena !== "casa") { const [tx, ty, ts] = noChao(g, 0.52, 0.8); pessoa(c, tx, ty, ts * 0.72, { ...THEO, bracos: (q) => [0.4 + Math.sin(q * 5) * 0.3, -0.4 - Math.sin(q * 5) * 0.3] }, t); }
  }
  if (VIDA[nome]) VIDA[nome](c, g, t, cena);
}

// ---------- o que cada ato acrescenta: a pessoa da vez, a faísca e o desenho de luz ----------
const ACAO = {
  abertura(c, u, d) {
    const g = caixaQ(COMODO.padaria);
    const [rx, ry, rs] = noChao(g, 0.5, 0.58); pessoa(c, rx, ry, rs * 1.05, { ...ROSA, bracos: (q) => [0.9 + Math.sin(q * 4) * 0.25, -0.9 - Math.sin(q * 4 + 1) * 0.25] }, u);
    const [jx, jy] = naParede(g, 0.66, 0.16), A = [jx + 110, jy + 170], B = naParede(g, 0.5, 0.25);
    const pos = (q) => { const k = seg(q, 0.8, d - 0.2); return [lerp(A[0], B[0] + 220, k) + Math.sin(k * 7) * 90 * (1 - k), lerp(A[1], B[1] + 140, k) - Math.sin(k * Math.PI) * 160]; };
    if (u > 0.6) { rastro(c, pos, u); const [x, y] = pos(u); faisca(c, x, y, lerp(0.25, 0.9, seg(u, 0.8, d - 0.2)), u); }
  },
  padaria(c, u, d, a) {
    const g = caixaQ(COMODO.padaria), f0 = a.fala.t0 - a.t0;
    const olha = seg(u, f0 + 2.6, f0 + 3.2);
    const [rx, ry, rs] = noChao(g, 0.5, 0.58);
    pessoa(c, rx, ry, rs * 1.05, { ...ROSA, bracos: (q) => [lerp(0.9 + Math.sin(q * 4) * 0.25, 2.3, olha), lerp(-0.9 - Math.sin(q * 4 + 1) * 0.25, -0.6, olha)], cabeca: () => -0.2 * olha }, u);
    const C = naParede(g, 0.5, 0.25), cx = C[0] - 40, cy = C[1] + 20;
    const pos = (q) => [cx + 260 + Math.cos(q * 1.6) * 60, cy + 120 + Math.sin(q * 2.1) * 40];
    rastro(c, pos, u); faisca(c, ...pos(u), 0.9, u);
    // o desenho de luz: reloginho com sininhos, ponteiro girando, e três pães saindo na hora certa
    const kr = seg(u, f0 + 2.2, f0 + 3.4);
    neon(c, circ(cx, cy, 100), kr);
    neon(c, [[cx - 78, cy - 104], [cx - 108, cy - 134], [cx - 60, cy - 128]], seg(u, f0 + 3.2, f0 + 3.6), 6, true);
    neon(c, [[cx + 78, cy - 104], [cx + 108, cy - 134], [cx + 60, cy - 128]], seg(u, f0 + 3.3, f0 + 3.7), 6, true);
    if (kr >= 1) {
      const gira = (u - f0 - 3.4) * 2.4;
      neon(c, [[cx, cy], [cx + Math.sin(gira) * 74, cy - Math.cos(gira) * 74]], 1, 6);
      neon(c, [[cx, cy], [cx + 44, cy + 10]], 1, 6);
      neon(c, [[cx + 130, cy], [cx + 210, cy]], seg(u, f0 + 3.8, f0 + 4.2), 6); neon(c, [[cx + 190, cy - 16], [cx + 210, cy], [cx + 190, cy + 16]], seg(u, f0 + 4.1, f0 + 4.3), 6);
      for (let i = 0; i < 3; i++) neon(c, elipse(cx + 270, cy - 70 + i * 70, 46, 24), seg(u, f0 + 4.2 + i * 0.25, f0 + 4.6 + i * 0.25), 6);
      brilhinhos(c, cx, cy, u, 12, 170);
    }
  },
  casa(c, u, d, a) {
    const g = caixaQ(COMODO.casa), f0 = a.fala.t0 - a.t0;
    const pega = seg(u, f0 + 3.4, f0 + 3.8);
    const [tx, ty, ts] = noChao(g, 0.52, 0.8);
    pessoa(c, tx, ty, ts * 0.72, { ...THEO, bracos: (q) => [lerp(0.4 + Math.sin(q * 5) * 0.3, 2.6, pega), lerp(-0.4 - Math.sin(q * 5) * 0.3, -2.6, pega)], cabeca: (q) => Math.sin(q * 3) * 0.12 * (1 - pega) }, u);
    const L = naParede(g, 0.12, 0.12), lx = L[0], ly = L[1];
    const pos = (q) => [lx + 330 + Math.cos(q * 1.4) * 50, ly + 220 + Math.sin(q * 2) * 30];
    if (u > 2.4) { rastro(c, pos, u); faisca(c, ...pos(u), 0.85, u); }
    const kl = seg(u, f0 + 2.4, f0 + 3.3); // a listinha de luz e as coisas voando para a mochila
    neon(c, [[lx, ly], [lx + 220, ly - 10], [lx + 230, ly + 290], [lx + 6, ly + 300]], kl, 7, true);
    for (let i = 0; i < 4; i++) {
      const yy = ly + 64 + i * 60;
      neon(c, [[lx + 80, yy], [lx + 120, yy - 3], [lx + 190, yy + 2]], seg(u, f0 + 3.0 + i * 0.15, f0 + 3.4 + i * 0.15), 5);
      neon(c, [[lx + 24, yy - 4], [lx + 38, yy + 12], [lx + 62, yy - 18]], seg(u, f0 + 3.9 + i * 0.3, f0 + 4.2 + i * 0.3), 6);
    }
    const [mx, my, ms] = noChao(g, 0.62, 0.92), alvo = [mx + 40 * ms, my - 80 * ms];
    for (let i = 0; i < 3; i++) { // livro, maçã e garrafinha entrando na mochila
      const q = seg(u, f0 + 4.0 + i * 0.35, f0 + 4.6 + i * 0.35); if (q <= 0 || q >= 1) continue;
      const sx = lx + 120, sy = ly + 120 + i * 60, x = lerp(sx, alvo[0], q), y = lerp(sy, alvo[1], q) - Math.sin(q * Math.PI) * 160;
      neon(c, i === 0 ? [[x - 22, y - 16], [x + 22, y - 16], [x + 22, y + 16], [x - 22, y + 16]] : i === 1 ? circ(x, y, 18, 16) : [[x - 10, y - 24], [x + 10, y - 24], [x + 10, y + 24], [x - 10, y + 24]], 1, 5, true);
    }
    if (u > f0 + 5.2) brilhinhos(c, alvo[0], alvo[1], u, 12, 160);
  },
};

ACAO.escola = (c, u, d, a) => {
  const g = caixaQ(COMODO.escola), f0 = a.fala.t0 - a.t0;
  const [px, py, ps] = noChao(g, 0.3, 0.35);
  pessoa(c, px, py, ps, { pele: COR.pele[1], cabelo: "coque", roupa: "#5a7ab8", saia: "#3a4a6a", oculos: true, seed: 12, bracos: (q) => [1.9, -1.9 + Math.sin(q * 2) * 0.1] }, u);
  const lx = px, ly = py - 252 * ps; // o livro aberto nas mãos
  bloco(c, lx - 50 * ps, ly - 30 * ps, 100 * ps, 60 * ps, "#c94a3a", rng(5), 2); c.fillStyle = "#f8f2e6"; c.fillRect(lx - 44 * ps, ly - 26 * ps, 88 * ps, 52 * ps); c.strokeStyle = COR.tinta; c.lineWidth = 2; c.beginPath(); c.moveTo(lx, ly - 26 * ps); c.lineTo(lx, ly + 26 * ps); c.stroke();
  for (let k = 0; k < 7; k++) { // a roda de crianças ouvindo
    const r = rng(80 + k), [kx, ky, ks] = noChao(g, 0.36 + k * 0.08, 0.66 + Math.sin(k * 0.9) * 0.12);
    pessoa(c, kx, ky, ks * 0.62, { pele: COR.pele[k % 4], cabelo: ["cacho", "liso", "curto", "coque"][k % 4], roupa: GENTE[k % 6], calca: "#3a4a6a", vira: -1, cabeca: (q) => Math.sin(q * 2 + k) * 0.08 - 0.15 * seg(u, f0 + 2.0, f0 + 2.6), bracos: (q) => k % 3 === 0 && u > f0 + 2.6 ? [2.6 + Math.sin(q * 6) * 0.2, -0.3] : [0.3, -0.3], seed: 30 + k }, u + r());
  }
  // a baleia: nasce do livro, cresce e nada pela parede do fundo
  const kb = seg(u, f0 + 1.6, f0 + 2.8), nada = Math.max(0, u - f0 - 2.0);
  if (kb > 0) {
    const [bx0, by0] = naParede(g, 0.42, 0.42), bx = lerp(lx, bx0 + nada * 60, kb), by = lerp(ly - 40, by0 + Math.sin(nada * 1.5) * 30, kb), s = lerp(0.2, 1, kb);
    const corpo = [...Array(31)].map((_, i) => { const q = i / 30, a2 = q * Math.PI * 2; return [bx + Math.cos(a2) * 170 * s, by + Math.sin(a2) * 70 * s * (Math.cos(a2) > 0 ? 1 : 0.8)]; });
    neon(c, corpo, seg(u, f0 + 1.6, f0 + 2.6), 7);
    const cauda = [[bx - 160 * s, by], [bx - 250 * s, by - 60 * s + Math.sin(nada * 3) * 20 * s], [bx - 230 * s, by + 10 * s], [bx - 260 * s, by + 70 * s + Math.sin(nada * 3) * 20 * s], [bx - 160 * s, by + 10 * s]];
    neon(c, cauda, seg(u, f0 + 2.2, f0 + 2.8), 6);
    neon(c, circ(bx + 110 * s, by - 18 * s, 9 * s, 10), seg(u, f0 + 2.6, f0 + 2.8), 5);
    neon(c, [[bx - 40 * s, by + 30 * s], [bx + 60 * s, by + 34 * s], [bx + 140 * s, by + 20 * s]], seg(u, f0 + 2.6, f0 + 3.0), 4);
    for (let j = 0; j < 3; j++) neon(c, [[bx + 70 * s, by - 70 * s], [bx + (40 + j * 30) * s, by - (140 + Math.sin(nada * 4 + j) * 20) * s]], seg(u, f0 + 2.8, f0 + 3.2), 4); // o esguicho
    for (let j = 0; j < 8; j++) { const q = (nada * 0.4 + j / 8) % 1; c.strokeStyle = `rgba(255,190,150,${1 - q})`; c.lineWidth = 2; c.beginPath(); c.arc(bx - 60 * s + j * 30 * s, by - q * 200, 6 + q * 6, 0, Math.PI * 2); c.stroke(); } // bolhas
    brilhinhos(c, bx, by, u, 10, 220);
  }
  const pos = (q) => [lx + 200 + Math.cos(q * 1.5) * 50, ly - 120 + Math.sin(q * 2) * 30];
  if (u > 1.6) { rastro(c, pos, u); faisca(c, ...pos(u), 0.8, u); }
};

// ---------- a vista de fora: o que se vê ao atravessar uma janela ----------
function vistaDeFora(c, k, t) { // k de 0 a 1: a câmera sobe do quintal até a janela de cima
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#9cc8e8"); g.addColorStop(0.6, "#f6d0b0"); g.addColorStop(1, "#f6c0a0");
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const base = Math.min(W, H), sobe = k * H * 0.5;
  c.fillStyle = "#f8e0a0"; c.beginPath(); c.arc(W * 0.75, H * 0.35 + sobe * 0.2, base * 0.09, 0, Math.PI * 2); c.fill(); // o sol nascendo
  luzPoca(c, W * 0.75, H * 0.35 + sobe * 0.2, base * 0.5, "255,230,170", 0.5);
  for (let i = 0; i < 4; i++) { const r = rng(300 + i), x = ((r() * W + t * 30) % (W + 400)) - 200, y = H * (0.1 + r() * 0.3) + sobe * 0.4; c.fillStyle = "rgba(255,250,240,0.9)"; for (let b = 0; b < 4; b++) { c.beginPath(); c.ellipse(x + b * base * 0.06, y + Math.sin(b) * 10, base * 0.07, base * 0.04, 0, 0, Math.PI * 2); c.fill(); } }
  c.fillStyle = "#c98a4a"; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 20) c.lineTo(x, H * 0.8 + sobe - Math.sin(x / (W / 5)) * H * 0.05); c.lineTo(W, H); c.fill();
  const tx = W * 0.22, ty = H * 0.95 + sobe; // a árvore do quintal e o varal de lençóis
  c.strokeStyle = "#5a3420"; c.lineWidth = base * 0.03; c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx + base * 0.02, ty - H * 0.5); c.stroke();
  for (let i = 0; i < 14; i++) { const r = rng(40 + i); c.fillStyle = ["#e8843a", "#d9542a", "#f2b84b", "#c96a2a"][i % 4]; c.beginPath(); c.arc(tx + (r() - 0.5) * base * 0.35, ty - H * 0.5 - r() * base * 0.2, base * (0.05 + r() * 0.05), 0, Math.PI * 2); c.fill(); }
  c.strokeStyle = "#5a3420"; c.lineWidth = 3; c.beginPath(); c.moveTo(tx, ty - H * 0.32); c.quadraticCurveTo(W * 0.55, ty - H * 0.26, W * 0.95, ty - H * 0.34); c.stroke();
  for (let i = 0; i < 4; i++) { const q = 0.2 + i * 0.2, x = lerp(tx, W * 0.95, q), y = ty - H * 0.3 + Math.sin(q * Math.PI) * H * 0.04; c.fillStyle = ["#f4f0e6", "#e8a8b8", "#a8c8e8", "#f2e2a0"][i]; c.beginPath(); c.moveTo(x - base * 0.05, y); c.lineTo(x + base * 0.05, y); c.lineTo(x + base * 0.05 + Math.sin(t * 2 + i) * 6, y + base * 0.12); c.lineTo(x - base * 0.05 + Math.sin(t * 2 + i) * 6, y + base * 0.12); c.fill(); }
  passaros(c, t, -200, H * 0.25);
  folhas(c, t, 0, W, 0, H);
}

// ---------- câmera ----------
// Regras (direção de cena da Vila Acesa): começa dentro de um cômodo; passa para o próximo sempre afastando e
// aproximando (vê os dois cômodos no meio do caminho); dentro do cômodo nunca para,
// aproxima quase imperceptível, e chega mais perto do detalhe que a narração cita; o final abre na cidade inteira.
function enquadrar(r4, folga = 1.08) {
  const [x, y, w, h] = r4, corte = H > W ? 0.72 : 1; // no quadro em pé pode cortar as laterais
  return { cx: x + w / 2, cy: y + h / 2, s: Math.min(W / (w * folga * corte), H / (h * folga)) };
}
const mixCam = (A, B, k) => ({ cx: lerp(A.cx, B.cx, k), cy: lerp(A.cy, B.cy, k), s: Math.exp(lerp(Math.log(A.s), Math.log(B.s), k)) });
const uniao = (a, b) => { const x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]); return [x, y, Math.max(a[0] + a[2], b[0] + b[2]) - x, Math.max(a[1] + a[3], b[1] + b[3]) - y]; };
const PANORAMA = () => enquadrar([0, 0, MUNDO.w, MUNDO.h], 1.04);
const comodoDo = (cena) => (cena === "abertura" ? "padaria" : cena);
const DETALHE = { // o que a narração cita: a câmera chega mais perto (de = segundos depois do começo da fala)
  padaria: { ret: () => { const [x, y] = naParede(caixaQ(COMODO.padaria), 0.5, 0.25); return [x - 240, y - 200, 640, 420]; }, de: 2.0, peso: 0.55 },
  casa: { ret: () => { const [x, y] = naParede(caixaQ(COMODO.casa), 0.12, 0.12); return [x - 80, y - 60, 820, 560]; }, de: 2.2, peso: 0.5 },
  escola: { ret: () => { const [x, y] = naParede(caixaQ(COMODO.escola), 0.42, 0.42); return [x - 360, y - 300, 900, 600]; }, de: 2.0, peso: 0.45 },
};
function idx(t) { const i = TEMPO.atos.findIndex((a) => t >= a.t0 && t < a.t1); return i < 0 ? TEMPO.atos.length - 1 : i; }
function noComodo(i, t) { // dentro do cômodo: respira devagar; atos seguidos no mesmo cômodo emendam sem pulo
  const atos = TEMPO.atos, a = atos[i];
  let j = i; while (j > 0 && !atos[j].entrada && comodoDo(atos[j - 1].cena) === comodoDo(atos[j].cena)) j--;
  const t0 = atos[j].t0, d = a.t1 - t0, u = t - t0, base = enquadrar(COMODO[comodoDo(a.cena)]);
  let cam = { ...base, s: base.s * (1 + 0.035 * Math.min(1, u / d)) };
  const D = DETALHE[a.cena];
  if (D && a.fala) { const f0 = a.fala.t0, w = D.peso * tw("detalhe") * seg(t, f0 + D.de, f0 + D.de + 1.4); if (w > 0) cam = mixCam(cam, enquadrar(D.ret(), 1.0), w); }
  return cam;
}
function prender(cam) { // dentro da cidade a câmera nunca mostra o papel de fora (só o final abre tudo)
  const hw = W / 2 / cam.s, hh = H / 2 / cam.s;
  if (hw * 2 < MUNDO.w) cam.cx = Math.min(Math.max(cam.cx, hw), MUNDO.w - hw);
  if (hh * 2 < MUNDO.h) cam.cy = Math.min(Math.max(cam.cy, hh), MUNDO.h - hh);
  return cam;
}
function camera(t) {
  const cam = camera0(t), a = TEMPO.atos[idx(t)];
  cam.s *= tw("zoom");
  return a.cena === "final" ? cam : prender(cam);
}
function camera0(t) {
  const atos = TEMPO.atos, i = idx(t), a = atos[i], u = t - a.t0, d = a.t1 - a.t0;
  if (i === 0 || !a.entrada) return noComodo(i, t);
  const ant = noComodo(i - 1, a.t0 - 1e-3), de = comodoDo(atos[i - 1].cena);
  if (a.cena === "final") return mixCam(ant, PANORAMA(), seg(u, 0.3, d - 1.6));
  const alvo = noComodo(i, t);
  if (a.entrada === "zoom") { // afasta até ver os dois cômodos juntos, depois mergulha no novo
    const T = 2.8, U = enquadrar(uniao(COMODO[de], COMODO[a.cena]), 1.15);
    if (u < T / 2) return mixCam(ant, U, seg(u, 0, T / 2));
    return mixCam(U, alvo, seg(u, T / 2, T));
  }
  return alvo;
}
// ---------- entrada ----------
function iniciar(tempo) {
  TEMPO = tempo;
  [W, H] = TAM[tempo.formato];
  const el = document.getElementById("c");
  el.width = W; el.height = H;
  ctx = el.getContext("2d");
  for (const p of PREDIOS) for (const [andar, nome] of Object.entries(p.comodos)) COMODO[nome] = [p.x + 40, ANDAR[andar][0], p.w - 80, ANDAR[andar][1] - 40];
  GRAO = fazerGrao();
  MANCHA = fazerMancha();
  FUNDO = fazerFundo();
  for (const nome of Object.keys(MOBILIA)) { // cômodos detalhados: tela própria em 2x
    const [x, y, w, h] = COMODO[nome], t0 = tela(w * K, h * K), c = t0.getContext("2d");
    c.scale(K, K); c.translate(-x, -y);
    MOBILIA[nome](c, caixaQ(COMODO[nome]), rng(nome.length * 97));
    TELAS[nome] = t0;
  }
}

const TRAFEGO = [["#c94a3a", "carro", 1], ["#3f7a5a", "carro", -1], ["#f2c94b", "onibus", 1], ["#f4f0e6", "policia", -1], ["#e2a73a", "carro", 1], ["#5a7ab8", "carro", -1]];
function quadro(t) {
  const atos = TEMPO.atos, cam = camera(t), i = idx(t);
  const a = atos[i], u = t - a.t0;
  ctx.save();
  ctx.fillStyle = "#efe4cc"; ctx.fillRect(0, 0, W, H); // papel creme em volta da cidade
  ctx.setTransform(cam.s, 0, 0, cam.s, W / 2 - cam.cx * cam.s, H / 2 - cam.cy * cam.s);
  ctx.save(); ctx.shadowColor = "rgba(60,30,10,0.45)"; ctx.shadowBlur = 40; ctx.fillStyle = "#efe4cc"; ctx.fillRect(-40, -40, MUNDO.w + 80, MUNDO.h + 80); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, MUNDO.w, MUNDO.h); ctx.clip();
  ctx.drawImage(FUNDO, 0, 0, MUNDO.w, MUNDO.h);
  nuvens(ctx, t);
  passaros(ctx, t, 600, 500); passaros(ctx, t + 9, 4200, 380);
  for (const nome of Object.keys(TELAS)) { const [x, y, w, h] = COMODO[nome]; ctx.drawImage(TELAS[nome], x, y, w, h); }
  const vx0 = cam.cx - W / 2 / cam.s, vx1 = cam.cx + W / 2 / cam.s, vy0 = cam.cy - H / 2 / cam.s, vy1 = cam.cy + H / 2 / cam.s;
  for (const nome of Object.keys(COMODO)) { const [x, y, w, h] = COMODO[nome]; if (x < vx1 && x + w > vx0 && y < vy1 && y + h > vy0) vidaComodo(ctx, nome, t, a.cena); }
  for (const nome of Object.keys(PORTAS)) folhaPorta(ctx, nome, 0); // portas fechadas, só cenário
  if (ACAO[a.cena]) ACAO[a.cena](ctx, u, a.t1 - a.t0, a);
  for (const p of PREDIOS) vapor(ctx, p.x + p.w * 0.87, ANDAR.primeiro[0] - 680, t, 6, 260); // fumaça dos telhados
  TRAFEGO.forEach(([cor, tipo, dir], k) => { const x = ((t * 130 * ((k % 3) + 1) + k * 1700) % (MUNDO.w + 800)) - 400; carro(ctx, dir > 0 ? x : MUNDO.w - x, MUNDO.chao + (dir > 0 ? 400 : 260), cor, tipo, t, dir); });
  for (let k = 0; k < 10; k++) { const r = rng(60 + k), dir = r() < 0.5 ? 1 : -1, x = (t * 70 + r() * MUNDO.w) % MUNDO.w; pessoa(ctx, dir > 0 ? x : MUNDO.w - x, MUNDO.chao + 86, 0.55, { pele: COR.pele[k % 4], cabelo: ["curto", "liso", "cacho", "coque"][k % 4], roupa: ["#c94a3a", "#5a7ab8", "#3f7a5a", "#e2a73a", "#8a5a9a"][k % 5], vira: dir, anda: true, seed: k }, t); }
  folhas(ctx, t, vx0, vx1, vy0, vy1);
  ctx.restore();
  ctx.restore();
  if (cam.fora > 0) { ctx.save(); ctx.globalAlpha = cam.fora; vistaDeFora(ctx, cam.k || 0, t); ctx.restore(); }
  papel(t);
}
