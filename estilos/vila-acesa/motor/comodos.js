// Vila Acesa, cômodos dos atos 5 a 8 (lanchonete, oficina, correio, rádio) e o final.
// Carregado depois de cena.js: usa as peças de lá e acrescenta em MOBILIA, VIDA, ACAO e DETALHE.

// ---------- quem fica atrás do balcão aparece só da cintura para cima ----------
function atrasDe(c, yTampo, desenha) { c.save(); c.beginPath(); c.rect(-1e5, -1e5, 2e5, 1e5 + yTampo); c.clip(); desenha(); c.restore(); }
const tampo = (nome, k) => noChao(caixaQ(COMODO[nome]), 0.5, k)[1] - 166;

// ---------- peças novas ----------
function banqueta(c, x, y, s, rnd) {
  bloco(c, x - 4 * s, y - 120 * s, 8 * s, 120 * s, "#8a8a90", rnd, 1);
  bloco(c, x - 34 * s, y - 132 * s, 68 * s, 18 * s, "#c94a3a", rnd, 2, 8);
  c.fillStyle = "#6a6a72"; c.beginPath(); c.ellipse(x, y - 4, 30 * s, 8 * s, 0, 0, Math.PI * 2); c.fill();
}
function gavetas(c, x, y, w, h, rnd) { // armário de gavetinhas do chão ao teto, como na oficina da referência
  bloco(c, x - 10, y - 10, w + 20, h + 20, "#5a3420", rnd, 4);
  const cw = 46, ch = 34;
  for (let j = 0; (j + 1) * ch <= h; j++) for (let i = 0; (i + 1) * cw <= w; i++) {
    const gx = x + i * cw, gy = y + j * ch, aberta = rnd() < 0.08;
    c.fillStyle = aberta ? "#2a160a" : ["#d8b07a", "#c9a06a", "#e2bc86", "#b8905a"][Math.floor(rnd() * 4)];
    c.fillRect(gx + 2, gy + 2, cw - 4, ch - 4);
    if (!aberta) { c.fillStyle = "#f4ead8"; c.fillRect(gx + 12, gy + 8, 22, 8); c.fillStyle = "#3a2214"; c.beginPath(); c.arc(gx + cw / 2, gy + ch - 9, 2.5, 0, Math.PI * 2); c.fill(); }
  }
}
function escada(c, x, y, h, rnd) {
  c.strokeStyle = "#8a5a32"; c.lineWidth = 9;
  c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30, y - h); c.moveTo(x + 70, y); c.lineTo(x + 100, y - h); c.stroke();
  c.lineWidth = 6; for (let i = 1; i < 10; i++) { const k = i / 10; c.beginPath(); c.moveTo(x + 30 * k, y - h * k); c.lineTo(x + 70 + 30 * k, y - h * k); c.stroke(); }
}
function painelFerramentas(c, x, y, w, h, rnd) {
  bloco(c, x, y, w, h, "#e8dcc0", rnd, 6);
  c.fillStyle = "rgba(90,60,30,0.35)"; for (let j = 0; j * 20 < h; j++) for (let i = 0; i * 20 < w; i++) { c.beginPath(); c.arc(x + 10 + i * 20, y + 10 + j * 20, 2, 0, Math.PI * 2); c.fill(); }
  for (let i = 0; i < 10; i++) { // martelos, chaves e serrotes pendurados
    const fx = x + 30 + (i % 5) * (w - 60) / 4, fy = y + 40 + Math.floor(i / 5) * h * 0.45;
    c.strokeStyle = ["#c94a3a", "#5a7ab8", "#e2a73a", "#3a3a40"][i % 4]; c.lineWidth = 8; c.lineCap = "round";
    c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx, fy + 70); c.stroke();
    c.fillStyle = "#8a8a90"; i % 2 ? c.fillRect(fx - 18, fy - 6, 36, 14) : (c.beginPath(), c.arc(fx, fy - 4, 12, 0, Math.PI * 2), c.fill());
  }
}
function barril(c, x, y, s, rnd) {
  c.save(); c.translate(x, y); c.scale(s, s);
  poligono(c, [[-46, 0], [-54, -60], [-46, -120], [46, -120], [54, -60], [46, 0]], "#8a5a32", rnd, 6);
  c.strokeStyle = "#5a5a62"; c.lineWidth = 6; c.beginPath(); c.moveTo(-50, -26); c.lineTo(50, -26); c.moveTo(-50, -96); c.lineTo(50, -96); c.stroke();
  c.restore();
}
function escaninhos(c, x, y, w, h, rnd) { // o paredão de escaninhos de cartas do correio
  bloco(c, x - 10, y - 10, w + 20, h + 20, "#6a4022", rnd, 4);
  const cw = 58, ch = 44;
  for (let j = 0; (j + 1) * ch <= h; j++) for (let i = 0; (i + 1) * cw <= w; i++) {
    const gx = x + i * cw, gy = y + j * ch;
    c.fillStyle = "#3a2214"; c.fillRect(gx + 3, gy + 3, cw - 6, ch - 6);
    if (rnd() < 0.7) { const n = 1 + Math.floor(rnd() * 3); for (let k = 0; k < n; k++) { c.fillStyle = ["#f4ead8", "#e8d8b0", "#f2c9b0", "#cfe0e8"][Math.floor(rnd() * 4)]; c.fillRect(gx + 8 + k * 6, gy + 12 - k * 3, cw - 22, ch - 18); } }
  }
}
function sacoCorreio(c, x, y, s, rnd) {
  c.save(); c.translate(x, y); c.scale(s, s);
  poligono(c, [[-56, 0], [-62, -90], [-40, -130], [40, -130], [62, -90], [56, 0]], "#5a7ab8", rnd, 6);
  c.fillStyle = "#f2c94b"; c.fillRect(-30, -80, 60, 26);
  for (let i = 0; i < 3; i++) { c.fillStyle = "#f4ead8"; c.save(); c.translate(-20 + i * 20, -140); c.rotate((i - 1) * 0.3); c.fillRect(-16, -22, 32, 26); c.restore(); }
  c.restore();
}
function balanca(c, x, y, s, rnd) {
  c.save(); c.translate(x, y); c.scale(s, s);
  bloco(c, -40, -20, 80, 20, "#3a3a40", rnd, 2); bloco(c, -6, -90, 12, 70, "#8a8a90", rnd, 1);
  c.strokeStyle = "#c98a3a"; c.lineWidth = 5; c.beginPath(); c.moveTo(-70, -90); c.lineTo(70, -90); c.stroke();
  for (const lx of [-70, 70]) { c.beginPath(); c.ellipse(lx, -60, 30, 8, 0, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.moveTo(lx, -90); c.lineTo(lx - 24, -62); c.moveTo(lx, -90); c.lineTo(lx + 24, -62); c.stroke(); }
  c.restore();
}
function discos(c, x, y, w, h, rnd) { // parede de discos de ouro e de vinil
  for (let j = 0; j < 3; j++) for (let i = 0; i < 5; i++) {
    const dx = x + i * w / 5 + w / 10, dy = y + j * h / 3 + h / 6, r = Math.min(w / 12, h / 7);
    c.fillStyle = (i + j) % 3 ? "#1e1a24" : "#d9a441"; c.beginPath(); c.arc(dx, dy, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = ["#c94a3a", "#3f8a8a", "#f2c94b"][(i + j) % 3]; c.beginPath(); c.arc(dx, dy, r * 0.35, 0, Math.PI * 2); c.fill();
    bloco(c, dx - r * 1.25, dy - r * 1.25, r * 2.5, 6, "#6a4022", rnd, 1);
  }
}
function mesaSom(c, x, y, w, h, rnd) {
  bloco(c, x, y, w, h, "#4a2a18", rnd, 8);
  bloco(c, x + 20, y - 60, w - 40, 60, "#3a3a40", rnd, 6);
  for (let i = 0; i < 12; i++) { c.fillStyle = ["#e8e0c8", "#c94a3a", "#f2c94b"][i % 3]; c.beginPath(); c.arc(x + 50 + i * (w - 100) / 11, y - 30, 9, 0, Math.PI * 2); c.fill(); }
  for (let i = 0; i < 2; i++) { const vx = x + 60 + i * (w - 220); bloco(c, vx, y + 30, 100, 70, "#e8dcc0", rnd, 2); } // mostradores do volume (o ponteiro mexe na VIDA)
}

// ---------- cômodos detalhados ----------
Object.assign(MOBILIA, {
  lanchonete(c, g, r) {
    quarto(c, g, (cc, x, y, w, h) => azulejos(cc, x, y, w, h, "#bfe3d8", r), r, "#f0ece0", "#c94a3a", "xadrez");
    for (let i = 0; i < 2; i++) janelaQ(c, ...naParede(g, 0.08 + i * 0.66, 0.1), 260, 230, ["#a8d8f0", "#e8f4f0"], r, false);
    const [mx, my] = naParede(g, 0.36, 0.06); // cardápio pendurado
    bloco(c, mx, my, g.bw * 0.28, 120, "#2f4a3a", r, 4);
    c.strokeStyle = "rgba(240,235,220,0.85)"; c.lineWidth = 2.4; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(mx + 20, my + 24 + i * 24); c.lineTo(mx + g.bw * 0.18, my + 24 + i * 24); c.stroke(); }
    relogioQ(c, ...naParede(g, 0.7, 0.06), 34, r);
    const [kx, ky] = naParede(g, 0.05, 0.6); // a bancada do fundo: máquina de café, vitrine de tortas, xícaras
    bloco(c, kx, ky, g.bw * 0.9, g.chaoY - ky, "#e2e8e4", r, 10);
    c.fillStyle = "#c9c4b8"; c.fillRect(kx - 8, ky - 12, g.bw * 0.9 + 16, 16);
    bloco(c, kx + 40, ky - 150, 110, 140, "#a8a8b0", r, 4); c.fillStyle = "#3a3a40"; c.fillRect(kx + 60, ky - 60, 30, 40);
    for (let i = 0; i < 3; i++) { bloco(c, kx + 220 + i * 120, ky - 110, 100, 100, "rgba(220,240,240,0.6)", r, 2, 10); tigela(c, kx + 270 + i * 120, ky - 30, 0.6, ["#e8775a", "#f2c94b", "#8a5a9a"][i], r); }
    for (let i = 0; i < 6; i++) itPrato(c, kx + g.bw * 0.6 + i * 40, ky - 4, r);
    prateleiraQ(c, ...naParede(g, 0.58, 0.32), 260, r, [itPote, itPote, itPrato, itPote, itPrato]);
    // o balcão da frente com as banquetas vermelhas
    const [b0x, b0y] = noChao(g, 0.12, 0.5), [b1x] = noChao(g, 0.88, 0.5);
    bloco(c, b0x, b0y - 150, b1x - b0x, 150, "#3f8a8a", r, 10); bloco(c, b0x - 10, b0y - 166, b1x - b0x + 20, 20, "#e8e0d0", r, 3);
    for (let i = 0; i < 5; i++) { const [sx, sy, ss] = noChao(g, 0.2 + i * 0.15, 0.68); banqueta(c, sx, sy, ss, r); }
    for (let i = 0; i < 4; i++) { const [px, py] = noChao(g, 0.2 + i * 0.18, 0.5); chaleira(c, px, py - 166, 0.35, r); }
    const [p1x, p1y, p1s] = noChao(g, 0.04, 0.92); plantaQ(c, p1x, p1y - 60 * p1s, 1.3 * p1s, r);
    const [ax, ay, as] = noChao(g, 0.95, 0.95); aboboraQ(c, ax, ay - 30, 40 * as, r, true);
    portaParada(c, "lanchonete", r);
  },
  oficina(c, g, r) {
    quarto(c, g, (cc, x, y, w, h) => tabuasVerticais(cc, x, y, w, h, "#3f7a5a", r), r, "#d8cdbc", "#e2a73a");
    gavetas(c, ...naParede(g, 0.08, 0.05), g.bw * 0.3, g.bh * 0.92, r);
    escada(c, ...naParede(g, 0.22, 0.97), g.bh * 0.85, r);
    painelFerramentas(c, ...naParede(g, 0.62, 0.18), g.bw * 0.22, g.bh * 0.4, r);
    janelaQ(c, ...naParede(g, 0.88, 0.2), 150, 220, ["#a8d0e8", "#f2e0c0"], r, false);
    relogioQ(c, ...naParede(g, 0.9, 0.06), 30, r);
    prateleiraQ(c, ...naParede(g, 0.42, 0.06), 220, r, [itPote, itPote, itPote, itPote]);
    const [bx, by] = naParede(g, 0.6, 0.68); bloco(c, bx, by, g.bw * 0.3, g.chaoY - by, "#a8643a", r, 8); // bancada
    c.fillStyle = "#c98a5a"; c.fillRect(bx - 8, by - 12, g.bw * 0.3 + 16, 16);
    for (let i = 0; i < 3; i++) { const [px, py, ps] = noChao(g, 0.08 + i * 0.08, 0.9); barril(c, px, py, ps, r); }
    for (let i = 0; i < 2; i++) { const [sx, sy, ss] = noChao(g, 0.86 + i * 0.07, 0.86); saco(c, sx, sy, ss, r); }
    const [ax, ay, as] = noChao(g, 0.78, 0.97); aboboraQ(c, ax, ay - 34, 52 * as, r); const [a2x, a2y, a2s] = noChao(g, 0.7, 0.98); aboboraQ(c, a2x, a2y - 26, 34 * a2s, r);
    tapeteQ(c, g, 0.48, 0.74, 300, ["#c94a3a", "#f2c94b", "#3f6a8a"]);
    portaParada(c, "oficina", r);
  },
  correio(c, g, r) {
    quarto(c, g, (cc, x, y, w, h) => papelParede(cc, x, y, w, h, "#ead8b0", ["#5a7ab8", "#c94a3a"], r), r, "#cfe0e8", "#5a7ab8");
    escaninhos(c, ...naParede(g, 0.04, 0.06), g.bw * 0.42, g.bh * 0.62, r);
    janelaQ(c, ...naParede(g, 0.56, 0.12), 230, 260, ["#f6c8a0", "#e8a8b8", "#8a90c8"], r, true);
    for (let i = 0; i < 3; i++) quadroQ(c, ...naParede(g, 0.78 + i * 0.07, 0.1), 50, 64, r); // cartazes de selo
    relogioQ(c, ...naParede(g, 0.86, 0.36), 32, r);
    const [b0x, b0y] = noChao(g, 0.08, 0.42), [b1x] = noChao(g, 0.6, 0.42); // o balcão de atendimento
    bloco(c, b0x, b0y - 150, b1x - b0x, 150, "#8a5a32", r, 8); bloco(c, b0x - 10, b0y - 166, b1x - b0x + 20, 20, "#c99a5a", r, 3);
    balanca(c, b0x + 120, b0y - 166, 0.8, r);
    for (let i = 0; i < 5; i++) { c.fillStyle = ["#f4ead8", "#f2c9b0", "#cfe0e8"][i % 3]; c.save(); c.translate(b0x + 260 + i * 40, b0y - 172); c.rotate((r() - 0.5) * 0.4); c.fillRect(-24, -16, 48, 32); c.restore(); }
    for (let i = 0; i < 3; i++) { const [sx, sy, ss] = noChao(g, 0.7 + i * 0.1, 0.82 + (i % 2) * 0.08); sacoCorreio(c, sx, sy, ss, r); }
    const [p1x, p1y, p1s] = noChao(g, 0.96, 0.8); plantaQ(c, p1x, p1y - 60 * p1s, 1.2 * p1s, r);
    tapeteQ(c, g, 0.4, 0.78, 320, ["#5a7ab8", "#f2c94b", "#c94a3a"]);
  },
  radio(c, g, r) {
    quarto(c, g, (cc, x, y, w, h) => papelParede(cc, x, y, w, h, "#4a3a6a", ["#d9a441", "#8a6ab8"], r), r, "#3a3058", "#d9a441");
    janelaQ(c, ...naParede(g, 0.36, 0.08), 300, 250, ["#0e1230", "#22285a", "#3a3a78"], r, false);
    discos(c, ...naParede(g, 0.7, 0.04), g.bw * 0.28, g.bh * 0.42, r);
    prateleiraQ(c, ...naParede(g, 0.02, 0.2), 240, r, [itLivro, itLivro, itLivro, itPlanta]);
    prateleiraQ(c, ...naParede(g, 0.02, 0.4), 240, r, [itLivro, itPote, itLivro, itLivro]);
    for (let i = 0; i < 4; i++) quadroQ(c, ...naParede(g, 0.08 + i * 0.06, 0.02), 40, 48, r);
    const [mx, my] = naParede(g, 0.3, 0.68); mesaSom(c, mx, my, g.bw * 0.4, g.chaoY - my, r);
    bloco(c, ...naParede(g, 0.75, 0.6), 140, g.bh * 0.4, "#2a2a30", r, 4); // caixa de som
    for (let i = 0; i < 2; i++) { const [sx, sy] = naParede(g, 0.75, 0.6); c.fillStyle = "#4a4a54"; c.beginPath(); c.arc(sx + 70, sy + 50 + i * 90, 34, 0, Math.PI * 2); c.fill(); }
    tapeteQ(c, g, 0.5, 0.78, 360, ["#8a2a3a", "#d9a441", "#3a3058"]);
    const [p1x, p1y, p1s] = noChao(g, 0.05, 0.88); plantaQ(c, p1x, p1y - 60 * p1s, 1.3 * p1s, r);
  },
});

// ---------- vida de fundo de cada um ----------
const JUCA = { pele: COR.pele[1], cabelo: "curto", roupa: "#f4ead8", calca: "#3a3a40", avental: true, bigode: "#3a2214", seed: 41 };
const LIA = { pele: COR.pele[0], cabelo: "ruivo", roupa: "#e2a73a", calca: "#3f6a9a", seed: 42 };
const CARTEIRO = { pele: COR.pele[3], cabelo: "curto", roupa: "#5a7ab8", calca: "#2a3a5a", bone: "#3a4a8a", seed: 43 };
const CIDA = { pele: COR.pele[1], cabelo: "coque", roupa: "#c94a6a", saia: "#5a2a3a", oculos: true, seed: 44 };
const OPERADOR = { pele: COR.pele[2], cabelo: "curto", roupa: "#3f7a5a", calca: "#2a2a3a", fone: true, seed: 45 };
const CLIENTES = [0, 1, 2, 3].map((k) => ({ pele: COR.pele[(k + 1) % 4], cabelo: ["liso", "curto", "cacho", "coque"][k], roupa: GENTE[k + 1], calca: "#3a4a6a", seed: 50 + k }));
Object.assign(VIDA, {
  lanchonete(c, g, t, cena) {
    ventilador(c, g.x + g.w * 0.5, g.by - 20, t * 1.3);
    ponteiros(c, ...naParede(g, 0.7, 0.06), 34, t);
    lampadaQ(c, ...naParede(g, 0.25, 0.3), 140, t, "#c94a3a"); lampadaQ(c, ...naParede(g, 0.75, 0.3), 140, t, "#c94a3a");
    const [kx, ky] = naParede(g, 0.05, 0.6); vapor(c, kx + 95, ky - 160, t, 5, 120);
    for (let i = 0; i < 4; i++) { const [px, py] = noChao(g, 0.2 + i * 0.18, 0.5); vapor(c, px + 10, py - 190, t + i, 3, 70); }
    const [jx, jy, js] = noChao(g, 0.5, 0.25);
    if (cena !== "lanchonete") atrasDe(c, tampo("lanchonete", 0.5), () => pessoa(c, jx + Math.sin(t * 0.7) * 120, jy, js, { ...JUCA, vira: Math.cos(t * 0.7) > 0 ? 1 : -1, bracos: (q) => [0.8 + Math.sin(q * 5) * 0.4, -0.6 - Math.sin(q * 4) * 0.4] }, t));
    CLIENTES.forEach((o, k) => { const [sx, sy, ss] = noChao(g, 0.275 + k * 0.15 + (k > 1 ? 0.15 : 0), 0.72); pessoa(c, sx, sy, ss * 0.95, { ...o, vira: -1, bracos: (q) => [0.4, -1.3 + Math.sin(q * 3 + k) * 0.3], cabeca: (q) => Math.sin(q * 2 + k) * 0.1 }, t); });
  },
  oficina(c, g, t, cena) {
    lampadaQ(c, ...naParede(g, 0.4, 0.3), 160, t, "#e2a73a"); lampadaQ(c, ...naParede(g, 0.72, 0.1), 60, t);
    ponteiros(c, ...naParede(g, 0.9, 0.06), 30, t);
    poeiraNaLuz(c, ...naParede(g, 0.9, 0.3), 140, 420, t);
    const [bx, by, bs] = noChao(g, 0.45, 0.55); // a bicicleta voadora no meio da oficina
    bicicleta(c, bx, by, bs * 1.4, rng(9));
    c.save(); c.translate(bx, by - 230 * bs); // hélice girando em cima
    c.strokeStyle = "#5a3420"; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 30 * bs); c.lineTo(0, 0); c.stroke();
    for (let i = 0; i < 2; i++) { const a = t * 9 + i * Math.PI; c.fillStyle = "#c94a3a"; c.beginPath(); c.ellipse(Math.cos(a) * 60 * bs, 0, Math.abs(Math.cos(a)) * 60 * bs + 6, 10 * bs, 0, 0, Math.PI * 2); c.fill(); }
    c.restore();
    for (const lado of [-1, 1]) { c.fillStyle = "#f4ead8"; c.beginPath(); c.moveTo(bx + lado * 30, by - 150 * bs); c.lineTo(bx + lado * (170 + Math.sin(t * 6) * 10) * bs, by - (190 + Math.sin(t * 6) * 20) * bs); c.lineTo(bx + lado * 160 * bs, by - 140 * bs); c.fill(); c.strokeStyle = COR.tinta; c.lineWidth = 2; c.stroke(); } // asinhas batendo
    const [vx, vy, vs] = noChao(g, 0.76, 0.3); pessoa(c, vx, vy, vs * 0.9, { pele: COR.pele[0], cabelo: "coque", roupa: "#8ab89a", calca: "#3a3a40", oculos: true, vira: -1, bracos: (q) => [1.5 + Math.sin(q * 8) * 0.2, -1.5 - Math.sin(q * 8 + 1) * 0.2], seed: 47 }, t); // o seu Nico na bancada
    const [gx, gy, gs] = noChao(g, 0.66, 0.6); gato(c, gx, gy - 160 * gs, gs * 0.9, t, "#c97a3a");
    if (cena !== "oficina") { const [lx, ly, ls] = noChao(g, 0.25, 0.7); pessoa(c, lx, ly, ls * 0.75, { ...LIA }, t); }
  },
  correio(c, g, t, cena) {
    lampadaQ(c, ...naParede(g, 0.3, 0.3), 160, t, "#5a7ab8"); lampadaQ(c, ...naParede(g, 0.7, 0.3), 160, t, "#e2a73a");
    ponteiros(c, ...naParede(g, 0.86, 0.36), 32, t);
    poeiraNaLuz(c, ...naParede(g, 0.58, 0.3), 200, 460, t);
    const [ax, ay, as] = noChao(g, 0.3, 0.22); atrasDe(c, tampo("correio", 0.42), () => pessoa(c, ax, ay, as, { pele: COR.pele[1], cabelo: "liso", roupa: "#e8775a", calca: "#3a3a40", oculos: true, bracos: (q) => [1.0 + Math.sin(q * 6) * 0.3, -0.4], seed: 48 }, t)); // a atendente carimbando
    const [fx, fy, fs] = noChao(g, 0.82, 0.62); pessoa(c, fx + Math.sin(t * 0.5) * 60, fy, fs * 0.9, { pele: COR.pele[0], cabelo: "coque", roupa: "#8a5a9a", saia: "#4a3a5a", vira: -1, anda: true, seed: 49 }, t);
    if (cena !== "correio") { const [cx, cy, cs] = noChao(g, 0.66, 0.7); pessoa(c, cx, cy, cs, { ...CARTEIRO }, t); }
  },
  radio(c, g, t, cena) {
    const [jx, jy] = naParede(g, 0.36, 0.08);
    c.fillStyle = "#f4f0dc"; c.beginPath(); c.arc(jx + 220, jy + 70, 30, 0, Math.PI * 2); c.fill(); // a lua na janela
    for (let i = 0; i < 12; i++) { const r = rng(600 + i); c.fillStyle = `rgba(255,250,220,${0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))})`; c.fillRect(jx + 10 + r() * 280, jy + 10 + r() * 150, 3, 3); }
    lampadaQ(c, ...naParede(g, 0.2, 0.3), 160, t, "#d9a441"); lampadaQ(c, ...naParede(g, 0.62, 0.36), 200, t, "#8a2a3a");
    luzPoca(c, ...naParede(g, 0.5, 0.8), 500, "255,200,140", 0.25);
    const [mx, my] = naParede(g, 0.3, 0.68), mw = g.bw * 0.4;
    for (let i = 0; i < 2; i++) { const vx = mx + 60 + i * (mw - 220) + 50, vy = my + 92, a = -2.2 + Math.abs(Math.sin(t * 7 + i * 2)) * 1.4; c.strokeStyle = "#c94a3a"; c.lineWidth = 3; c.beginPath(); c.moveTo(vx, vy); c.lineTo(vx + Math.cos(a) * 44, vy + Math.sin(a) * 44); c.stroke(); } // ponteiros do volume
    for (let i = 0; i < 12; i++) { c.fillStyle = Math.sin(t * 5 + i) > 0.3 ? "#7aff9a" : "#2a5a3a"; c.fillRect(mx + 40 + i * 30, my - 80, 12, 8); } // luzinhas do painel
    const [ox, oy, os] = noChao(g, 0.66, 0.4); pessoa(c, ox, oy, os * 0.95, { ...OPERADOR, vira: -1, bracos: (q) => [1.2 + Math.sin(q * 4) * 0.2, -1.0 - Math.sin(q * 3) * 0.2], cabeca: (q) => Math.sin(q * 4) * 0.08 }, t);
    const [gx, gy, gs] = noChao(g, 0.9, 0.9); gato(c, gx, gy - 30, gs, t, "#3a3a40");
    if (cena !== "radio") { const [cx, cy, cs] = noChao(g, 0.42, 0.5); pessoa(c, cx, cy, cs, { ...CIDA }, t); }
  },
});

// ---------- o que cada ato acrescenta ----------
function icone(c, tipo, x, y, s, k) { // ícones de luz dentro dos balões de pedido
  if (tipo === "cafe") { neon(c, [[x - 20 * s, y - 14 * s], [x + 20 * s, y - 14 * s], [x + 14 * s, y + 18 * s], [x - 14 * s, y + 18 * s]], k, 5, true); neon(c, circ(x + 26 * s, y, 9 * s, 12), k, 4); }
  if (tipo === "ovo") { neon(c, elipse(x, y, 26 * s, 18 * s, 20), k, 5); neon(c, circ(x, y, 8 * s, 12), k, 5); }
  if (tipo === "pao") { neon(c, elipse(x, y, 28 * s, 14 * s, 20), k, 5); neon(c, [[x - 10 * s, y - 6 * s], [x - 4 * s, y + 6 * s]], k, 4); neon(c, [[x + 6 * s, y - 6 * s], [x + 12 * s, y + 6 * s]], k, 4); }
  if (tipo === "bolo") { neon(c, [[x - 24 * s, y + 16 * s], [x + 24 * s, y + 16 * s], [x + 24 * s, y - 6 * s], [x - 24 * s, y - 6 * s]], k, 5, true); neon(c, [[x, y - 6 * s], [x, y - 24 * s]], k, 4); }
}
Object.assign(ACAO, {
  lanchonete(c, u, d, a) {
    const g = caixaQ(COMODO.lanchonete), f0 = a.fala.t0 - a.t0;
    const [jx, jy, js] = noChao(g, 0.5, 0.25);
    atrasDe(c, tampo("lanchonete", 0.5), () => pessoa(c, jx, jy, js, { ...JUCA, bracos: (q) => [1.4 + Math.sin(q * 6) * 0.3, -1.6 - Math.sin(q * 5) * 0.3], cabeca: (q) => Math.sin(q * 3) * 0.15 }, u));
    const tipos = ["cafe", "ovo", "pao", "bolo"];
    CLIENTES.forEach((o, k) => {
      const [sx, sy, ss] = noChao(g, 0.275 + k * 0.15 + (k > 1 ? 0.15 : 0), 0.72), bx = sx, by = sy - 470 * ss;
      const kb = seg(u, f0 + 0.6 + k * 0.4, f0 + 1.1 + k * 0.4); // um balão de pedido por cliente
      neon(c, [...elipse(bx, by, 70, 52, 28)], kb, 6); neon(c, [[bx - 20, by + 50], [bx - 34, by + 90], [bx + 4, by + 52]], kb, 5);
      icone(c, tipos[k], bx, by, 1.2, seg(u, f0 + 0.9 + k * 0.4, f0 + 1.4 + k * 0.4));
      const kl = seg(u, f0 + 3.0 + k * 0.2, f0 + 3.5 + k * 0.2); // agora cada pedido vira uma linha na lista do seu Juca
      if (kl > 0) { const lx = jx + 160, ly = jy - 470 + k * 50; neon(c, [[bx + 40, by + 30], [lerp(bx + 40, lx, 0.5), lerp(by, ly, 0.5) - 60], [lx, ly]], kl, 3); }
    });
    const lx = jx + 160, ly = jy - 500;
    neon(c, [[lx, ly], [lx + 180, ly], [lx + 180, ly + 230], [lx, ly + 230]], seg(u, f0 + 2.6, f0 + 3.1), 6, true);
    for (let k = 0; k < 4; k++) neon(c, [[lx + 20, ly + 40 + k * 50], [lx + 32, ly + 54 + k * 50], [lx + 52, ly + 26 + k * 50]], seg(u, f0 + 3.7 + k * 0.25, f0 + 4.0 + k * 0.25), 5);
    const pos = (q) => [lx + 260 + Math.cos(q * 1.6) * 50, ly + 80 + Math.sin(q * 2.2) * 40];
    rastro(c, pos, u); faisca(c, ...pos(u), 0.85, u);
    if (u > f0 + 4.6) brilhinhos(c, lx + 90, ly + 115, u, 12, 180);
  },
  oficina(c, u, d, a) {
    const g = caixaQ(COMODO.oficina), f0 = a.fala.t0 - a.t0;
    const [lx, ly, ls] = noChao(g, 0.25, 0.7), ri = seg(u, f0 + 1.0, f0 + 1.6);
    pessoa(c, lx, ly, ls * 0.75, { ...LIA, bracos: (q) => [lerp(0.3, 2.7, ri) + Math.sin(q * 6) * 0.2 * ri, lerp(-0.3, -2.7, ri)], cabeca: (q) => Math.sin(q * 5) * 0.1 * ri }, u);
    // a planta da invenção: hélice, engrenagem girando, mola, roda e asas, uma peça sobre a outra
    const [px, py] = naParede(g, 0.47, 0.06), s = 1.1;
    neon(c, [[px - 90 * s, py + 20], [px + 90 * s, py + 20]], seg(u, f0 + 2.0, f0 + 2.3), 7); neon(c, circ(px, py + 20, 12, 10), seg(u, f0 + 2.0, f0 + 2.3), 5);
    neon(c, [[px, py + 32], [px, py + 70]], seg(u, f0 + 2.2, f0 + 2.4), 5);
    const kg = seg(u, f0 + 2.3, f0 + 2.8), giro = u * 1.5;
    neon(c, [...Array(25)].map((_, i) => { const a2 = giro + (i / 24) * Math.PI * 2, rr = i % 2 ? 56 : 70; return [px + Math.cos(a2) * rr, py + 140 + Math.sin(a2) * rr]; }), kg, 6, true);
    neon(c, circ(px, py + 140, 20, 12), kg, 5);
    neon(c, [...Array(9)].map((_, i) => [px + (i % 2 ? 40 : -40), py + 220 + i * 14]), seg(u, f0 + 2.7, f0 + 3.1), 5);
    neon(c, circ(px, py + 400, 70, 30), seg(u, f0 + 3.0, f0 + 3.5), 6);
    neon(c, [[px - 80, py + 300], [px - 200, py + 250], [px - 150, py + 320]], seg(u, f0 + 3.3, f0 + 3.7), 6, true);
    neon(c, [[px + 80, py + 300], [px + 200, py + 250], [px + 150, py + 320]], seg(u, f0 + 3.4, f0 + 3.8), 6, true);
    for (let i = 0; i < 3; i++) neon(c, [[px + 130, py + 80 + i * 110], [px + 170, py + 80 + i * 110]], seg(u, f0 + 3.6 + i * 0.1, f0 + 3.9 + i * 0.1), 3); // cotas
    const pos = (q) => [px - 260 + Math.cos(q * 1.4) * 60, py + 200 + Math.sin(q * 2) * 60];
    rastro(c, pos, u); faisca(c, ...pos(u), 0.85, u);
    if (u > f0 + 4.0) brilhinhos(c, px, py + 200, u, 12, 220);
  },
  correio(c, u, d, a) {
    const g = caixaQ(COMODO.correio), f0 = a.fala.t0 - a.t0;
    const [cx, cy, cs] = noChao(g, 0.66, 0.7), olha = seg(u, f0 + 0.5, f0 + 1.0);
    pessoa(c, cx, cy, cs, { ...CARTEIRO, bracos: (q) => [1.8, -0.4 - 0.5 * olha], cabeca: (q) => -0.15 * olha + Math.sin(q * 2) * 0.05 }, u);
    const ex = cx - 70 * cs, ey = cy - 300 * cs; // a carta sem endereço, na mão
    c.fillStyle = "#f4ead8"; c.fillRect(ex - 34, ey - 22, 68, 44); c.strokeStyle = COR.tinta; c.lineWidth = 2; c.strokeRect(ex - 34, ey - 22, 68, 44); c.beginPath(); c.moveTo(ex - 34, ey - 22); c.lineTo(ex, ey + 4); c.lineTo(ex + 34, ey - 22); c.stroke();
    // a carta de luz, o caminho tracejado pela parede e a casinha que se acende no fim
    const [hx, hy] = naParede(g, 0.88, 0.62), [sx, sy] = [ex, ey - 120];
    neon(c, [[sx - 50, sy - 32], [sx + 50, sy - 32], [sx + 50, sy + 32], [sx - 50, sy + 32]], seg(u, f0 + 1.2, f0 + 1.7), 6, true);
    neon(c, [[sx - 50, sy - 32], [sx, sy + 4], [sx + 50, sy - 32]], seg(u, f0 + 1.5, f0 + 1.8), 5);
    const caminho2 = [...Array(41)].map((_, i) => { const q = i / 40; return [lerp(sx + 60, hx, q), lerp(sy, hy - 60, q) - Math.sin(q * Math.PI) * 260 + Math.sin(q * 12) * 30]; });
    const kc = seg(u, f0 + 2.0, f0 + 3.6);
    c.save(); c.setLineDash([18, 16]); neon(c, caminho2, kc, 5); c.restore();
    const kh = seg(u, f0 + 3.4, f0 + 4.0);
    neon(c, [[hx - 70, hy], [hx - 70, hy - 90], [hx, hy - 150], [hx + 70, hy - 90], [hx + 70, hy]], kh, 7, true);
    neon(c, [[hx - 18, hy], [hx - 18, hy - 46], [hx + 18, hy - 46], [hx + 18, hy]], seg(u, f0 + 3.8, f0 + 4.1), 5);
    if (u > f0 + 4.1) { luzPoca(c, hx, hy - 60, 160, "255,170,110", 0.4 + 0.1 * Math.sin(u * 6)); brilhinhos(c, hx, hy - 60, u, 10, 150); }
    const [qx, qy] = kc > 0 && kc < 1 ? caminho2[Math.min(40, Math.floor(kc * 40))] : kc >= 1 ? [hx + 120, hy - 140] : [sx + 140, sy - 40];
    const pos = (q) => [qx + Math.cos(q * 2) * 20, qy - 60 + Math.sin(q * 2.4) * 20];
    rastro(c, pos, u); faisca(c, ...pos(u), 0.8, u);
  },
  radio(c, u, d, a) {
    const g = caixaQ(COMODO.radio), f0 = a.fala.t0 - a.t0;
    const [cx, cy, cs] = noChao(g, 0.42, 0.5), canta = seg(u, f0 + 3.4, f0 + 4.0);
    pessoa(c, cx, cy, cs, { ...CIDA, bracos: (q) => [lerp(1.4, 2.6, canta) + Math.sin(q * 3) * 0.2 * canta, lerp(-0.4, -2.6, canta) - Math.sin(q * 3) * 0.2 * canta], cabeca: (q) => Math.sin(q * 2) * 0.12 }, u);
    c.strokeStyle = "#2a2a30"; c.lineWidth = 6; c.beginPath(); c.moveTo(cx + 60 * cs, cy - 160 * cs); c.lineTo(cx + 60 * cs, cy - 300 * cs); c.stroke(); // o microfone
    c.fillStyle = "#8a8a90"; c.beginPath(); c.ellipse(cx + 60 * cs, cy - 316 * cs, 16 * cs, 22 * cs, 0, 0, Math.PI * 2); c.fill();
    // o bolo de luz, com oitenta anos de velinhas: quatro fileiras de vinte, piscando
    const [bx, by] = naParede(g, 0.5, 0.36), kb = seg(u, f0 + 1.2, f0 + 2.0);
    neon(c, [[bx - 180, by + 120], [bx + 180, by + 120], [bx + 180, by + 20], [bx - 180, by + 20]], kb, 7, true);
    neon(c, [[bx - 130, by + 20], [bx + 130, by + 20], [bx + 130, by - 60], [bx - 130, by - 60]], seg(u, f0 + 1.6, f0 + 2.3), 7, true);
    neon(c, [[bx - 180, by + 70], [bx - 120, by + 50], [bx - 60, by + 74], [bx, by + 50], [bx + 60, by + 74], [bx + 120, by + 50], [bx + 180, by + 70]], seg(u, f0 + 2.0, f0 + 2.4), 4);
    const kv = seg(u, f0 + 2.2, f0 + 3.2);
    for (let i = 0; i < 8; i++) { // oito velinhas grandes (uma para cada dez anos)
      if (kv * 8 <= i) break;
      const vx = bx - 112 + i * 32;
      neon(c, [[vx, by - 60], [vx, by - 110]], 1, 4);
      const ch = 14 + Math.sin(u * 14 + i * 2) * 4;
      c.fillStyle = "#ffd88a"; c.beginPath(); c.ellipse(vx, by - 120 - ch * 0.4, 6, ch * 0.7, 0, 0, Math.PI * 2); c.fill();
      luzPoca(c, vx, by - 124, 40, "255,200,120", 0.5);
    }
    if (u > f0 + 3.4) for (let i = 0; i < 9; i++) { // as notas saem pela janela: a vila inteira cantando
      const q = ((u - f0 - 3.4) * 0.35 + i / 9) % 1, [jx, jy] = naParede(g, 0.36, 0.08);
      const nx = lerp(cx + 80, jx + 260 + q * 500, q), ny = lerp(cy - 340, jy - 120, q) + Math.sin(q * 9 + i) * 40;
      neon(c, [...circ(nx, ny, 12, 10)], 1, 4); neon(c, [[nx + 12, ny], [nx + 12, ny - 50], [nx + 34, ny - 40]], 1, 4);
    }
    const pos = (q) => [bx + 260 + Math.cos(q * 1.5) * 50, by - 40 + Math.sin(q * 2) * 40];
    rastro(c, pos, u); faisca(c, ...pos(u), 0.9, u);
    if (u > f0 + 3.0) brilhinhos(c, bx, by, u, 14, 240);
  },
  final(c, u, d, a) {
    // a faísca sai da rádio, sobe pelo céu da noite e vira estrela; a cidade inteira aparece
    const g = caixaQ(COMODO.radio), [x0, y0] = naParede(g, 0.7, 0.3), x1 = 8600, y1 = 260;
    const k = seg(u, 0.6, d - 2.6), pos = (q) => { const kk = seg(q, 0.6, d - 2.6); return [lerp(x0, x1, kk) - Math.sin(kk * Math.PI) * 600, lerp(y0, y1, kk)]; };
    if (k < 1) { rastro(c, pos, u, 18); faisca(c, ...pos(u), lerp(0.9, 2.4, k), u); }
    else { const brilho = 0.6 + 0.4 * Math.sin(u * 4); luzPoca(c, x1, y1, 420 * brilho, "255,230,180", 0.6); faisca(c, x1, y1, 1.6 + 0.3 * brilho, u * 0.3); }
  },
});

Object.assign(DETALHE, {
  lanchonete: { ret: () => { const [x, y] = naParede(caixaQ(COMODO.lanchonete), 0.2, 0.05); return [x, y, 1100, 620]; }, de: 2.4, peso: 0.4 },
  oficina: { ret: () => { const [x, y] = naParede(caixaQ(COMODO.oficina), 0.47, 0.06); return [x - 380, y - 40, 760, 560]; }, de: 2.0, peso: 0.5 },
  correio: { ret: () => { const [x, y] = naParede(caixaQ(COMODO.correio), 0.55, 0.2); return [x - 400, y - 160, 900, 560]; }, de: 2.4, peso: 0.35 },
  radio: { ret: () => { const [x, y] = naParede(caixaQ(COMODO.radio), 0.5, 0.36); return [x - 320, y - 220, 640, 420]; }, de: 1.6, peso: 0.55 },
});
