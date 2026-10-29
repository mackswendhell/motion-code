// Fantasia, cenas 4 a 13 do Anel: guerra, rio, gollum, bilbo, toca, jornada, beira, queda, aguias, casa.
// Mesmo esquema do cena.js: camadas paradas em cache (fazer...), o que mexe em vivo(), câmera C por cena.

let AUX, AC;
// momento (no tempo da cena) em que a fala chega à fração k: para casar a ação com a palavra
const naFala = (ato, k) => (ato.fala ? ato.fala.t0 - ato.t0 + (ato.fala.t1 - ato.fala.t0) * k : 0);
// desenha um grupo inteiro com transparência (sem as partes de dentro aparecerem umas pelas outras)
function translucido(g, a, desenha) {
  if (a >= 0.999) return desenha(g);
  if (a <= 0.001) return;
  const t = g.getTransform();
  AC.setTransform(1, 0, 0, 1, 0, 0); AC.clearRect(0, 0, AUX.width, AUX.height); AC.setTransform(t);
  desenha(AC);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.drawImage(AUX, 0, 0); g.restore();
}
function anelPeq(g, x, y, r, quente = 0, cor = "rgba(255,210,110,1)") {
  brilho(g, x, y, r * 4 + quente * r * 4, cor, 0.6 + 0.4 * quente);
  elipse(g, x, y + r * 0.25, r, r * 0.42, "#b8741c", 2.5); elipse(g, x, y, r, r * 0.42, "#f5b84a", 2.5); elipse(g, x, y, r * 0.62, r * 0.22, "#7a4a18");
}
function fumaca(g, x, y, r, cor, a = 1) { // as bolas viram um contorno só: transparente sem marcar as sobreposições
  g.save(); g.globalAlpha = a; g.fillStyle = cor; g.beginPath();
  for (const [dx, dy, k] of [[0, 0, 1], [-0.7, 0.2, 0.75], [0.7, 0.25, 0.8], [-0.3, -0.5, 0.7], [0.4, -0.45, 0.65]]) { g.moveTo(x + dx * r + r * k, y + dy * r); g.ellipse(x + dx * r, y + dy * r, r * k, r * k, 0, 0, Math.PI * 2); }
  g.fill();
  g.globalAlpha = a * 0.3; g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x - r * 0.25, y - r * 0.3, r * 0.5, r * 0.4, 0, 0, Math.PI * 2); g.fill();
  g.restore();
}
function rochas(g, n, seed, area, cores) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = area[0] + r() * (area[2] - area[0]), y = area[1] + r() * (area[3] - area[1]), s = 14 + r() * 30;
    poli(g, [[x - s, y], [x - s * 0.6, y - s * 0.7], [x + s * 0.5, y - s * 0.8], [x + s, y]], cores[i % cores.length], 2.5);
  }
}

// ---------- GUERRA ----------
function fazerGuerra() {
  cache("gu-fundo", (g) => {
    g.fillStyle = grad(g, 0, Y0, 0, 660, [[0, "#4a2234"], [0.55, "#a8443a"], [1, "#f0a05a"]]); g.fillRect(X0, Y0, X1 - X0, 700 - Y0);
    brilho(g, 540, 560, 460, "rgba(255,210,150,1)", 0.5); elipse(g, 540, 560, 120, 120, "#f7d3a4");
    poli(g, [[ER - 460, 662], [ER - 290, 410], [ER - 240, 400], [ER - 60, 662]], "#5a2a36");
    for (let i = 0; i < 6; i++) fumaca(g, ER - 270 + i * 18, 380 - i * 55, 40 + i * 10, "#6a3442", 0.8);
    const r = rng(23);
    g.strokeStyle = "#3a1d28"; g.lineWidth = 3;
    for (let x = X0; x < X1; x += 9 + r() * 10) { const h = 30 + r() * 30; g.beginPath(); g.moveTo(x, 662); g.lineTo(x, 662 - h); g.stroke(); if (r() < 0.12) poli(g, [[x, 662 - h], [x + 26, 662 - h + 7], [x, 662 - h + 14]], "#7a2d34"); }
    g.fillStyle = grad(g, 0, 650, 0, Math.max(1100, EB), [[0, "#a4847a"], [1, "#4e3a3e"]]); g.fillRect(X0, 655, X1 - X0, Y1 - 655);
    rochas(g, larg(14), 9, [X0, 700, X1, EB], ["#6e5558", "#5a4548"]);
  });
  cache("gu-frente", (g) => {
    poli(g, [[X0, EB - 90], [EL + 120, EB - 120], [EL + 260, Y1], [X0, Y1]], "#2a1c22");
    poli(g, [[X1, EB - 100], [ER - 160, EB - 70], [ER - 260, Y1], [X1, Y1]], "#2a1c22");
    g.strokeStyle = "#2a1c22"; g.lineWidth = 7; g.beginPath(); g.moveTo(EL + 80, EB - 60); g.lineTo(EL + 180, EB - 330); g.stroke();
  });
}
function cenaGuerra(alvo, u, ato) {
  const dur = ato.t1 - ato.t0, k = ease(u / dur), tc = naFala(ato, 0.6);
  const treme = u > tc && u < tc + 0.35 ? Math.sin(u * 90) * 8 * (1 - (u - tc) / 0.35) : 0;
  const C = { z: 1.02 + 0.1 * k, cx: 560, cy: 640, px: treme, py: 0 };
  poe(alvo, CACHE["gu-fundo"], 0.25, C, 2.5);
  vivo(alvo, 0.35, C, 0, (g) => { for (let i = 0; i < 5; i++) fumaca(g, EL + 60 + i * 120 + u * 12, 240 + (i % 2) * 70, 50 + i * 8, "#3b2b33", 0.55); });
  const depois = Math.max(0, u - tc);
  vivo(alvo, 0.65, C, 0, (g) => {
    // o Senhor do Escuro some em fumaça depois do corte
    g.save(); g.translate(-170, 40);
    translucido(g, 1 - seg(depois, 0.1, 0.9), (h) => senhor(h, u, 0.3, { martelo: false, braco: -1.25 }));
    if (u < tc) anelPeq(g, 632, 648, 16, 0.4);
    if (depois > 0) {
      const r = rng(4);
      for (let i = 0; i < 22; i++) {
        const x = 300 + r() * 320, y = 260 + r() * 640, cresce = seg(depois, r() * 0.3, 1.2 + r() * 0.5);
        fumaca(g, x + (r() - 0.5) * 120 * cresce, y - 140 * cresce, 30 + 60 * cresce, i % 2 ? "#1d1820" : "#2c2530", (1 - seg(depois, 1.0, 2.2)) * Math.min(1, cresce * 3));
      }
    }
    g.restore();
    // o anel voa da mão e cai no chão
    if (depois > 0) {
      const e = Math.min(1, depois / 0.9), x = lerp(462, 680, e), y = 688 - 260 * Math.sin(e * Math.PI) + 210 * e;
      anelPeq(g, x, y, 15, 0.6);
      estrela(g, x + 10, y - 8, 26, e >= 1 ? 0.5 + 0.5 * Math.sin(u * 8) : 0.8);
    }
    // o rei com a espada: levanta e corta na palavra
    const a = u < tc - 0.28 ? lerp(2.6, 3.4, seg(u, 0, tc - 0.3)) : u < tc ? lerp(3.4, 1.35, Math.pow((u - tc + 0.28) / 0.28, 2)) : 1.35;
    pessoa(g, 790, 935, 0.92, "rei", {
      vira: -1, bracos: [0.3, a], olhos: depois > 0 ? "aberto" : "aberto", sobrancelha: "brava", boca: depois > 0 && depois < 1 ? "aberta" : "reto",
      segura: (h, x, y) => {
        const dx = Math.sin(a), dy = Math.cos(a);
        h.strokeStyle = LINHA; h.lineCap = "round"; h.lineWidth = 16; h.beginPath(); h.moveTo(x, y); h.lineTo(x + dx * 190, y + dy * 190); h.stroke();
        h.strokeStyle = "#e6e9ee"; h.lineWidth = 9; h.beginPath(); h.moveTo(x, y); h.lineTo(x + dx * 186, y + dy * 186); h.stroke();
        h.strokeStyle = "#c9a04a"; h.lineWidth = 10; h.beginPath(); h.moveTo(x - dy * 26, y + dx * 26); h.lineTo(x + dy * 26, y - dx * 26); h.stroke();
      },
    });
    if (depois > 0 && depois < 0.25) { // rastro do golpe
      g.save(); g.globalAlpha = 1 - depois / 0.25; g.strokeStyle = "#fff6e0"; g.lineWidth = 14; g.lineCap = "round";
      g.beginPath(); g.arc(735, 600, 190, Math.PI * 1.05, Math.PI * 1.55); g.stroke(); g.restore();
      brilho(g, 470, 660, 200, "rgba(255,230,180,1)", 1 - depois / 0.25);
    }
  });
  poe(alvo, CACHE["gu-frente"], 1.35, C, 6);
}

// ---------- RIO ----------
function alga(g, x, base, alt, t, f, cor) {
  g.strokeStyle = cor; g.lineCap = "round"; g.lineWidth = 9;
  g.beginPath(); g.moveTo(x, base);
  for (let i = 1; i <= 10; i++) { const k = i / 10; g.lineTo(x + Math.sin(t * 1.3 + f + k * 3) * 16 * k, base - alt * k); }
  g.stroke();
}
function peixe(g, x, y, s, cor) {
  g.save(); g.translate(x, y); g.scale(s, s);
  poli(g, [[30, 0], [44, -12], [44, 12]], cor, 2.5);
  g.beginPath(); g.ellipse(0, 0, 34, 14, 0, 0, Math.PI * 2); g.fillStyle = cor; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINHA; g.stroke();
  elipse(g, -20, -3, 3.5, 3.5, LINHA);
  g.restore();
}
function fazerRio() {
  cache("ri-fundo", (g) => {
    g.fillStyle = grad(g, 0, Y0, 0, Y1, [[0, "#6fb8b0"], [0.35, "#3d8a8c"], [0.75, "#1f5a66"], [1, "#163e4a"]]); g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    g.fillStyle = "rgba(220,255,240,0.5)"; g.fillRect(X0, ET + 40, X1 - X0, 6);
    const r = rng(31);
    for (let x = X0; x < X1; x += 60) { g.fillStyle = "rgba(220,255,240,0.25)"; g.beginPath(); g.ellipse(x + r() * 30, ET + 52 + r() * 10, 30, 3, 0, 0, 7); g.fill(); }
    for (let i = 0; i < larg(7); i++) { const x = X0 + r() * (X1 - X0), w = 120 + r() * 160; poli(g, [[x - w, 900], [x - w * 0.4, 700 - r() * 120], [x + w * 0.5, 720 - r() * 100], [x + w, 900]], "rgba(25,70,80,0.55)"); }
  });
  cache("ri-leito", (g) => {
    g.fillStyle = grad(g, 0, 860, 0, Y1, [[0, "#b9a27a"], [1, "#7a6a4e"]]);
    caminho(g, [[X0, 880], [EL + 300, 860], [ER - 300, 870], [X1, 860], [X1, Y1], [X0, Y1]]); g.fill();
    const r = rng(41), cores = ["#9a9a94", "#7f8c7a", "#b8a27a", "#6e7f86", "#a07a5a", "#c9c3b0", "#5f7a5a"];
    for (let i = 0; i < area(260); i++) {
      const x = X0 + r() * (X1 - X0), y = 870 + Math.pow(r(), 0.9) * (EB + 40 - 870), s = 0.6 + (y - 860) / 260;
      elipse(g, x, y, (8 + r() * 14) * s, (5 + r() * 7) * s, cores[i % cores.length], 2);
    }
    for (const [x, w] of [[EL + 160, 120], [ER - 180, 150], [EL + 420, 70]]) { poli(g, [[x - w, 900], [x - w * 0.6, 820], [x + w * 0.3, 800], [x + w, 900]], "#6a7472", 3); poli(g, [[x - w * 0.6, 820], [x + w * 0.3, 800], [x + w * 0.1, 830]], "#8a9492"); }
  });
}
function cenaRio(alvo, u, ato) {
  const dur = ato.t1 - ato.t0, k = ease(u / dur), pousa = 1.9;
  const C = { z: 1 + 0.08 * k, cx: 540, cy: 860, px: 0, py: 0 };
  poe(alvo, CACHE["ri-fundo"], 0.2, C, 2);
  vivo(alvo, 0.3, C, 0, (g) => raios(g, u, 380, ET + 40, [[1.25, 60, 900, 0.3], [1.4, 40, 850, 0.25], [1.15, 30, 800, 0.2], [1.55, 50, 820, 0.2]], "rgba(220,255,235,"));
  vivo(alvo, 0.5, C, 1.5, (g) => { for (let i = 0; i < larg(10); i++) alga(g, X0 + 40 + i * 130, 880, 220 + (i % 3) * 60, u, i, "#2f6a4e"); });
  poe(alvo, CACHE["ri-leito"], 0.6, C);
  vivo(alvo, 0.6, C, 0, (g) => {
    const e = Math.min(1, u / pousa), y = lerp(ET - 30, 890, 1 - Math.pow(1 - e, 1.6)), x = 560 + Math.sin(u * 4) * 30 * (1 - e);
    if (e < 1) for (let i = 0; i < 4; i++) elipse(g, x + Math.sin(u * 6 + i) * 10, y - 30 - i * 26, 4 + i, 4 + i, "rgba(230,255,250,0.6)");
    anelPeq(g, x, y, 22, 0.2);
    for (let i = 0; i < 7; i++) alga(g, 300 + i * 80 + (i > 3 ? 120 : 0), 905, 140 + (i % 3) * 50, u, i * 2, i % 2 ? "#4f8a3e" : "#3c7a44");
    const px = lerp(ER + 80, EL - 80, ((u - 0.5) / 3.8)), py = 640 + Math.sin(u * 2) * 10; // um peixe passa
    g.save(); g.translate(px, py); g.scale(1, 1); peixe(g, 0, 0, 1, "#d8c27a"); g.restore();
  });
  // o tempo passando: a luz da água muda de cor depois que o anel pousa
  vivo(alvo, 0, C, 0, (g) => {
    const tt = seg(u, pousa + 0.3, dur), cores = ["rgba(40,90,40,", "rgba(110,90,30,", "rgba(20,40,90,", "rgba(30,80,70,"];
    const i = Math.min(3, Math.floor(tt * 4)), f = tt * 4 - i;
    g.save(); g.globalCompositeOperation = "multiply";
    g.fillStyle = cores[i] + (0.35 * Math.sin(f * Math.PI) * (tt > 0 ? 1 : 0)) + ")"; g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    g.restore();
  });
  vivo(alvo, 1.3, C, 7, (g) => { alga(g, EL + 60, EB + 40, 520, u, 3, "#1f4a36"); alga(g, EL + 110, EB + 40, 420, u, 5, "#2a5a40"); alga(g, ER - 70, EB + 40, 560, u, 1, "#1f4a36"); });
}

// ---------- GOLLUM ----------
function fazerGollum() {
  cache("go-fundo", (g) => {
    g.fillStyle = grad(g, 0, Y0, 0, Y1, [[0, "#0b1126"], [0.6, "#18224a"], [1, "#0e1430"]]); g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    brilho(g, 540, 640, 520, "rgba(70,110,170,1)", 0.35);
    const r = rng(51);
    for (let i = 0; i < larg(16); i++) { const x = X0 + r() * (X1 - X0), w = 30 + r() * 50, h = 80 + r() * 200; poli(g, [[x, Y0], [x + w, Y0], [x + w / 2, ET + h]], "#0c1022"); }
    poli(g, [[X0, Y0], [EL + 160, Y0], [EL + 110, 500], [EL + 200, 780], [X0, 800]], "#0a0e1e");
    poli(g, [[X1, Y0], [ER - 170, Y0], [ER - 120, 520], [ER - 210, 790], [X1, 800]], "#0a0e1e");
    g.fillStyle = grad(g, 0, 760, 0, Y1, [[0, "#1d2c52"], [1, "#0a1024"]]); g.fillRect(X0, 760, X1 - X0, Y1 - 760);
    g.strokeStyle = "rgba(140,190,230,0.18)"; g.lineWidth = 2;
    for (let i = 0; i < area(40); i++) { const x = X0 + r() * (X1 - X0), y = 780 + r() * (EB - 780); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 30 + r() * 50, y); g.stroke(); }
    poli(g, [[370, 860], [400, 815], [560, 800], [700, 820], [720, 862], [540, 880]], "#3e4a6a", 3.5);
    poli(g, [[400, 815], [560, 800], [700, 820], [550, 830]], "#56638a");
  });
}
function cristal(g, x, y, s, t, f) {
  brilho(g, x, y - 20 * s, 70 * s, "rgba(90,230,210,1)", 0.5 + 0.3 * Math.sin(t * 2 + f));
  for (const [dx, h, a] of [[-10, 50, -0.3], [0, 70, 0], [12, 44, 0.35]]) {
    g.save(); g.translate(x + dx * s, y); g.rotate(a);
    poli(g, [[-7 * s, 0], [0, -h * s], [7 * s, 0]], "#7ff0dc", 2.5); g.restore();
  }
}
function cenaGollum(alvo, u, ato) {
  const dur = ato.t1 - ato.t0, k = ease(u / dur), feliz = u > naFala(ato, 0.45);
  const C = { z: 1.06 + 0.1 * k, cx: 540, cy: 720, px: 0, py: 0 };
  poe(alvo, CACHE["go-fundo"], 0.4, C, 1);
  vivo(alvo, 0.45, C, 0, (g) => {
    for (const [x, y, s, f] of [[EL + 210, 790, 1, 0], [ER - 230, 800, 0.8, 2], [300, 770, 0.6, 4], [800, 775, 0.7, 1]]) cristal(g, x, y, s, u, f);
    for (let i = 0; i < 3; i++) { const e = ((u * 0.5 + i / 3) % 1); g.strokeStyle = `rgba(160,210,240,${0.5 * (1 - e)})`; g.lineWidth = 2.5; g.beginPath(); g.ellipse(545, 870, 200 + e * 260, 24 + e * 34, 0, 0, Math.PI * 2); g.stroke(); }
    gollum(g, 545, 822, 1.15, { pose: "agachado", anel: true, olhos: feliz ? "feliz" : "aberto", inclina: Math.sin(u * 2.4) * 0.04 });
  });
}

// ---------- BILBO ----------
function fazerBilbo() {
  cache("bi-fundo", (g) => {
    g.fillStyle = grad(g, 0, Y0, 0, Y1, [[0, "#1c2236"], [0.5, "#2e3550"], [1, "#1c2030"]]); g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    for (const [r, cor] of [[480, "#323a56"], [380, "#3a4362"], [290, "#424c6e"], [205, "#4b5679"], [130, "#2a3048"]]) {
      g.beginPath(); g.moveTo(540 - r, 800); g.lineTo(540 - r, 560); g.ellipse(540, 560, r, r * 0.95, 0, Math.PI, 0); g.lineTo(540 + r, 800); g.closePath(); g.fillStyle = cor; g.fill();
    }
    g.fillStyle = grad(g, 0, 780, 0, Y1, [[0, "#3c4562"], [1, "#22283c"]]); g.fillRect(X0, 790, X1 - X0, Y1 - 790);
    rochas(g, area(18), 61, [X0, 820, X1, EB], ["#4a5474", "#3a4260"]);
    const r = rng(62);
    for (let i = 0; i < larg(20); i++) { const x = X0 + r() * (X1 - X0), y = ET + r() * 700, s = 20 + r() * 40; poli(g, [[x, y], [x + s, y + 6], [x + s * 0.8, y + s], [x, y + s * 0.8]], "rgba(90,100,140,0.35)"); }
  });
}
function cenaBilbo(alvo, u, ato) {
  const dur = ato.t1 - ato.t0, k = ease(u / dur), para = 2.3, andando = u < para;
  const C = { z: 1.03 + 0.08 * k, cx: 560, cy: 760, px: 0, py: 0 };
  poe(alvo, CACHE["bi-fundo"], 0.35, C, 2);
  vivo(alvo, 0.6, C, 0, (g) => {
    g.save(); g.globalCompositeOperation = "screen"; g.fillStyle = radial(g, 650, 900, 260, [[0, "rgba(170,200,255,0.5)"], [1, "rgba(0,0,0,0)"]]); g.fillRect(380, 700, 540, 400); g.restore();
    anelPeq(g, 660, 902, 15, 0.3);
    estrela(g, 672, 896, 24, seg(u, para, para + 0.3) * (1 - seg(u, para + 0.8, para + 1.3)) + 0.25 * Math.max(0, Math.sin(u * 3)));
    const x = lerp(170, 470, ease(Math.min(1, u / para)));
    pessoa(g, x, 930, 0.9, "bilbo", {
      vira: 1, passo: andando ? u * 7.5 : null, olhar: andando ? 0 : 1,
      olhos: andando ? "aberto" : "baixo", boca: andando ? "reto" : "o",
      bracos: andando ? [Math.sin(u * 7.5) * 0.4, -Math.sin(u * 7.5) * 0.4] : [0.5, 0.9],
    });
  });
  vivo(alvo, 1.3, C, 6, (g) => { rochas(g, 4, 71, [EL - 40, EB - 60, EL + 260, EB + 40], ["#151a28"]); rochas(g, 4, 72, [ER - 260, EB - 60, ER + 40, EB + 40], ["#151a28"]); });
}

// ---------- TOCA ----------
function fazerToca() {
  cache("to-fundo", (g) => {
    g.fillStyle = grad(g, 0, Y0, 0, 560, [[0, "#3a3852"], [1, "#55526e"]]); g.fillRect(X0, Y0, X1 - X0, 560 - Y0);
    g.fillStyle = "#4a3428"; g.fillRect(X0, 560, X1 - X0, Y1 - 560);
    g.strokeStyle = "rgba(20,10,8,0.5)"; g.lineWidth = 3;
    for (let x = X0; x < X1; x += 54) { g.beginPath(); g.moveTo(x, 560); g.lineTo(x, Y1); g.stroke(); }
    g.fillStyle = "#5e4230"; g.fillRect(X0, 548, X1 - X0, 16);
    // janela redonda com a noite
    g.save(); g.beginPath(); g.arc(EL + 230, 270, 105, 0, Math.PI * 2); g.clip();
    g.fillStyle = grad(g, 0, 165, 0, 375, [[0, "#141c3c"], [1, "#3a3060"]]); g.fillRect(EL + 120, 160, 220, 220);
    const r = rng(81); for (let i = 0; i < 30; i++) elipse(g, EL + 130 + r() * 200, 170 + r() * 120, 1.4, 1.4, "#fff");
    poli(g, [[EL + 120, 380], [EL + 160, 320], [EL + 230, 335], [EL + 300, 310], [EL + 340, 380]], "#1a1830");
    g.restore();
    g.lineWidth = 16; g.strokeStyle = "#6a4a32"; g.beginPath(); g.arc(EL + 230, 270, 112, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 3; g.strokeStyle = LINHA; g.beginPath(); g.arc(EL + 230, 270, 120, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(EL + 230, 270, 104, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 8; g.strokeStyle = "#6a4a32"; g.beginPath(); g.moveTo(EL + 230, 166); g.lineTo(EL + 230, 374); g.moveTo(EL + 126, 270); g.lineTo(EL + 334, 270); g.stroke();
    // lareira
    g.beginPath(); g.moveTo(330, 980); g.lineTo(330, 760); g.ellipse(540, 760, 210, 190, 0, Math.PI, 0); g.lineTo(750, 980); g.closePath(); g.fillStyle = "#cfc8bc"; g.fill(); g.lineWidth = 4; g.strokeStyle = LINHA; g.stroke();
    g.beginPath(); g.moveTo(400, 980); g.lineTo(400, 790); g.ellipse(540, 790, 140, 130, 0, Math.PI, 0); g.lineTo(680, 980); g.closePath(); g.fillStyle = "#1a1012"; g.fill(); g.stroke();
    g.strokeStyle = "rgba(60,50,45,0.45)"; g.lineWidth = 2.5;
    for (let a = Math.PI; a <= Math.PI * 2.01; a += Math.PI / 7) { g.beginPath(); g.moveTo(540 + Math.cos(a) * 145, 790 + Math.sin(a) * 135); g.lineTo(540 + Math.cos(a) * 205, 760 + Math.sin(a) * 185); g.stroke(); }
    // prateleira da lareira, relógio, vela
    forma(g, [[270, 580], [810, 580], [820, 604], [260, 604]], "#7a5236", "#a87a50", 0, -4, 3.5);
    g.fillStyle = "#6a4a32"; g.fillRect(340, 604, 16, 40); g.fillRect(724, 604, 16, 40);
    forma(g, [[350, 580], [350, 500], [380, 470], [410, 500], [410, 580]], "#6a4028", "#8a5a3a", 0, -3, 3);
    elipse(g, 380, 515, 24, 24, "#f2ead8", 3); g.strokeStyle = LINHA; g.lineWidth = 3; g.beginPath(); g.moveTo(380, 515); g.lineTo(380, 498); g.moveTo(380, 515); g.lineTo(392, 520); g.stroke();
    g.fillStyle = "#f2ead8"; g.fillRect(712, 520, 18, 60); g.strokeRect(712, 520, 18, 60); elipse(g, 721, 582, 22, 6, "#c9a04a", 2.5);
    elipse(g, 540, 1020, 330, 50, "#7a2a2a"); elipse(g, 540, 1020, 260, 36, "#2f6a54");
  });
}
function cenaToca(alvo, u, ato) {
  const dur = ato.t1 - ato.t0, k = ease(u / dur), chama_ = seg(u, naFala(ato, 0.35), naFala(ato, 0.75));
  const C = { z: 1 + 0.2 * k, cx: 540, cy: 590, px: 0, py: 0 };
  poe(alvo, CACHE["to-fundo"], 0.6, C);
  vivo(alvo, 0.6, C, 0, (g) => {
    chama(g, 540, 950, 170, 170, u, 0); chama(g, 490, 955, 90, 110, u * 1.2, 2); chama(g, 600, 955, 80, 95, u * 1.1, 4);
    brilho(g, 540, 880, 380, "rgba(255,140,60,1)", 0.55 + 0.08 * Math.sin(u * 9));
    chama(g, 721, 516, 12, 30, u * 2, 1); brilho(g, 721, 500, 60, "rgba(255,200,120,1)", 0.7);
    // o olho na janela, quando o anel quer voltar
    g.save(); g.beginPath(); g.arc(EL + 230, 270, 104, 0, Math.PI * 2); g.clip();
    g.globalAlpha = chama_;
    brilho(g, EL + 230, 285, 90, "rgba(255,90,30,1)", 1);
    g.beginPath(); g.ellipse(EL + 230, 285, 34, 16, 0, 0, Math.PI * 2); g.fillStyle = "#ff9a3a"; g.fill();
    g.beginPath(); g.ellipse(EL + 230, 285, 4, 15, 0, 0, Math.PI * 2); g.fillStyle = "#1a0606"; g.fill();
    g.restore();
    const pul = 0.5 + 0.5 * Math.sin(u * 6);
    anelPeq(g, 545, 574, 17, chama_ * (0.6 + 0.4 * pul), chama_ > 0.3 ? "rgba(255,70,30,1)" : "rgba(255,210,110,1)");
  });
  vivo(alvo, 0, C, 0, (g) => { // o quarto fica vermelho
    g.save(); g.globalCompositeOperation = "multiply"; g.fillStyle = `rgba(200,60,50,${0.35 * chama_})`; g.fillRect(X0, Y0, X1 - X0, Y1 - Y0); g.restore();
  });
}

// ---------- JORNADA ----------
const ESTRADA = () => [[EL - 40, 1060], [EL + 260, 990], [420, 930], [300, 860], [470, 800], [700, 760], [600, 720], [ER - 300, 668], [ER - 210, 640]];
function naEstrada(k) {
  const p = ESTRADA(), i = Math.min(p.length - 2, Math.floor(k * (p.length - 1))), f = k * (p.length - 1) - i;
  return [lerp(p[i][0], p[i + 1][0], f), lerp(p[i][1], p[i + 1][1], f)];
}
function fazerJornada() {
  cache("jo-ceu", (g) => {
    g.fillStyle = grad(g, 0, Y0, 0, 650, [[0, "#7fb9e0"], [0.7, "#cfe2df"], [1, "#f3e4bc"]]); g.fillRect(X0, Y0, X1 - X0, 700 - Y0);
    const r = rng(91);
    for (let i = 0; i < larg(6); i++) { const x = X0 + r() * (X1 - X0), y = ET + 80 + r() * 260; for (let j = 0; j < 5; j++) elipse(g, x + j * 34 - 70, y - (j % 2) * 18, 40, 22, "rgba(255,255,255,0.85)"); }
  });
  cache("jo-longe", (g) => {
    const r = rng(92);
    for (let x = X0 - 100; x < X1; x += 180 + r() * 80) {
      const h = 160 + r() * 140, w = 160 + r() * 80;
      poli(g, [[x - w, 660], [x, 660 - h], [x + w, 660]], "#8a92b8");
      poli(g, [[x - w * 0.28, 660 - h * 0.72], [x, 660 - h], [x + w * 0.28, 660 - h * 0.72], [x + w * 0.1, 660 - h * 0.66], [x - w * 0.08, 660 - h * 0.7]], "#f2f2f6");
    }
    poli(g, [[ER - 420, 670], [ER - 230, 470], [ER - 190, 465], [ER - 20, 670]], "#3a2a34");
    g.fillStyle = "#ff7a3a"; g.beginPath(); g.ellipse(ER - 210, 468, 22, 6, 0, 0, 7); g.fill();
  });
  cache("jo-colinas", (g) => {
    g.fillStyle = "#a8c870"; caminho(g, [[X0, 700], [EL + 300, 650], [600, 690], [ER - 200, 660], [X1, 690], [X1, Y1], [X0, Y1]]); g.fill();
    g.fillStyle = "#8fb85c"; caminho(g, [[X0, 800], [EL + 200, 740], [540, 780], [ER - 260, 730], [X1, 770], [X1, Y1], [X0, Y1]]); g.fill();
    g.fillStyle = grad(g, 0, 850, 0, Y1, [[0, "#7aa84f"], [1, "#4f7f38"]]); caminho(g, [[X0, 900], [EL + 300, 860], [700, 880], [X1, 850], [X1, Y1], [X0, Y1]]); g.fill();
    // a estrada, mais larga perto
    const p = ESTRADA();
    for (let i = 0; i < p.length - 1; i++) { g.strokeStyle = "#e9dcb4"; g.lineCap = "round"; g.lineWidth = lerp(46, 6, i / (p.length - 2)); g.beginPath(); g.moveTo(...p[i]); g.lineTo(...p[i + 1]); g.stroke(); }
    const r = rng(93);
    for (let i = 0; i < larg(14); i++) { const x = X0 + r() * (X1 - X0), y = 700 + r() * 140, s = 0.4 + (y - 700) / 200; g.fillStyle = "#5e7a3a"; g.fillRect(x - 2 * s, y - 20 * s, 4 * s, 22 * s); elipse(g, x, y - 26 * s, 20 * s, 18 * s, i % 2 ? "#4f7a3a" : "#6a9a46", 2); }
  });
  cache("jo-frente", (g) => { const r = rng(94); for (let i = 0; i < larg(40); i++) tufo(g, X0 + r() * (X1 - X0), EB + 10, 50 + r() * 60, r() < 0.5 ? "#3f6a2a" : "#5a8a3a", r); });
}
function cenaJornada(alvo, u, ato) {
  const dur = ato.t1 - ato.t0, k = ease(u / dur);
  const C = { z: 1.04 + 0.06 * k, cx: 540, cy: 700, px: 40 - 90 * k, py: 0 };
  poe(alvo, CACHE["jo-ceu"], 0.1, C);
  poe(alvo, CACHE["jo-longe"], 0.25, C, 1.5);
  vivo(alvo, 0.25, C, 1.5, (g) => { for (let i = 0; i < 6; i++) fumaca(g, ER - 210 + i * 14 + u * 4, 440 - i * 40, 22 + i * 7, "#4a3a44", 0.7); brilho(g, ER - 210, 470, 90, "rgba(255,110,40,1)", 0.6); });
  poe(alvo, CACHE["jo-colinas"], 0.6, C);
  vivo(alvo, 0.6, C, 0, (g) => {
    for (const [atraso, nome] of [[0.035, "sam"], [0, "frodo"]]) {
      const kk = 0.3 + 0.22 * (u / dur) - atraso * 1.4, [x, y] = naEstrada(kk), s = lerp(0.36, 0.18, Math.min(1, (kk - 0.25) / 0.35));
      pessoa(g, x + (nome === "sam" ? -10 : 10), y, s, nome, { vira: 1, passo: u * 7 + (nome === "sam" ? 1 : 0), bracos: [Math.sin(u * 7) * 0.35, -Math.sin(u * 7) * 0.35], olhar: 1 });
    }
    for (let i = 0; i < 3; i++) { const x = 300 + i * 70 + u * 60, y = 260 + i * 20 + Math.sin(u * 3 + i) * 6; g.strokeStyle = LINHA; g.lineWidth = 3; const a = Math.sin(u * 10 + i) * 6; g.beginPath(); g.moveTo(x - 12, y - a); g.quadraticCurveTo(x - 4, y - 6, x, y); g.quadraticCurveTo(x + 4, y - 6, x + 12, y - a); g.stroke(); }
  });
  vivo(alvo, 0, C, 0, (g) => { // a tarde cai enquanto eles andam
    g.save(); g.globalCompositeOperation = "multiply"; g.fillStyle = `rgba(255,150,110,${0.4 * k})`; g.fillRect(X0, Y0, X1 - X0, Y1 - Y0); g.restore();
  });
  poe(alvo, CACHE["jo-frente"], 1.4, C, 6);
}

// ---------- BEIRA e QUEDA (dentro da montanha) ----------
function fazerBeira() {
  cache("be-fundo", (g) => {
    g.fillStyle = grad(g, 0, Y0, 0, Y1, [[0, "#1a0808"], [0.6, "#3a1210"], [1, "#5a1a10"]]); g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    brilho(g, 820, EB, 700, "rgba(255,120,30,1)", 0.75);
    const r = rng(101);
    for (let i = 0; i < Math.round(30 * (EB - ET) / 1080 * (X1 - X0) / 1240); i++) {
      const x = X0 + r() * (X1 - X0), y = ET + r() * (EB - ET - 300), s = 40 + r() * 90;
      poli(g, [[x, y], [x + s, y + s * 0.2], [x + s * 0.8, y + s], [x - s * 0.1, y + s * 0.8]], ["#2a0e0c", "#341210", "#220a09"][i % 3]);
      g.strokeStyle = "rgba(255,120,50,0.2)"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x + s, y + s * 0.2); g.lineTo(x + s * 0.8, y + s); g.stroke();
    }
    poli(g, [[X0, Y0], [EL + 140, Y0], [EL + 90, 600], [EL + 160, EB], [X0, Y1]], "#140606");
  });
  cache("be-borda", (g) => {
    poli(g, [[X0, 760], [520, 752], [700, 770], [730, 800], [690, 900], [620, Y1], [X0, Y1]], "#241010", 4);
    g.fillStyle = "#e0703a"; caminho(g, [[520, 752], [700, 770], [730, 800], [720, 790], [700, 780]]); g.fill();
    g.strokeStyle = "rgba(255,130,60,0.6)"; g.lineWidth = 4; g.beginPath(); g.moveTo(X0, 760); g.lineTo(520, 752); g.lineTo(700, 770); g.stroke();
    rochas(g, 10, 105, [X0, 800, 600, EB], ["#30140f", "#3a1812"]);
  });
}
function lavaFundo(g, u) {
  g.fillStyle = grad(g, 0, 940, 0, Y1, [[0, "#ffd36a"], [0.3, "#ff8a2a"], [1, "#c8301a"]]);
  caminho(g, [[640, 960], [ER, 930], [X1, 930], [X1, Y1], [640, Y1]]); g.fill();
  for (let i = 0; i < 8; i++) { const x = 700 + ((i * 97 + u * 30) % (ER - 680)), y = 980 + (i % 3) * 30; elipse(g, x, y, 34 - (i % 3) * 6, 9, "#5a1a10"); }
}
function brasas(g, u, seed, n) {
  particulas(g, n, seed, u, null, (g, i, x0, y0, v, f, tam, t) => {
    const y = EB - ((y0 * (EB - ET) + t * (60 + v * 120)) % (EB - ET + 100)), x = X0 + x0 * (X1 - X0) + Math.sin(t * (1 + v) + f * 9) * 25;
    g.fillStyle = `rgba(255,${150 + Math.floor(v * 80)},70,${0.4 + 0.6 * Math.abs(Math.sin(t * 3 + f * 11))})`; g.fillRect(x, y, 2 + tam * 3, 2 + tam * 3);
  });
}
function cenaBeira(alvo, u, ato) {
  const dur = ato.t1 - ato.t0, k = ease(u / dur), venceu = seg(u, naFala(ato, 0.62), naFala(ato, 0.62) + 0.6);
  const C = { z: 1.04 + 0.12 * k, cx: 600, cy: 640, px: 0, py: 0 };
  poe(alvo, CACHE["be-fundo"], 0.3, C, 3);
  vivo(alvo, 0.5, C, 1.5, (g) => lavaFundo(g, u));
  poe(alvo, CACHE["be-borda"], 0.6, C);
  vivo(alvo, 0.6, C, 0, (g) => {
    pessoa(g, 230, 770, 0.72, "sam", { vira: 1, sobrancelha: "triste", boca: "triste", olhar: 1, bracos: [0.6, 0.9] });
    const ad = lerp(1.55, 0.35, venceu), ae = lerp(0.2, 0.55, venceu);
    pessoa(g, 610, 775, 0.82, "frodo", {
      vira: 1, bracos: [ae, ad], olhos: venceu > 0.5 ? "baixo" : "aberto", boca: venceu > 0.5 ? "dor" : "reto", sobrancelha: venceu > 0.5 ? "brava" : "triste", olhar: venceu > 0.5 ? 0 : 1,
      segura: (h, x, y) => anelPeq(h, x + 4, y - 14, 14, 0.4 + 0.6 * venceu * (0.6 + 0.4 * Math.sin(u * 7)), venceu > 0.3 ? "rgba(255,60,30,1)" : "rgba(255,210,110,1)"),
    });
  });
  vivo(alvo, 0.9, C, 0, (g) => brasas(g, u, 111, 60));
  vivo(alvo, 0, C, 0, (g) => { g.save(); g.globalCompositeOperation = "multiply"; g.fillStyle = `rgba(190,40,30,${0.4 * venceu})`; g.fillRect(X0, Y0, X1 - X0, Y1 - Y0); g.restore(); });
}
function quedaTempo(ato) { return naFala(ato, 0.74); }
function cenaQueda(alvo, u, ato) {
  const dur = ato.t1 - ato.t0, k = ease(u / dur), tq = quedaTempo(ato), cai = Math.max(0, u - tq);
  const treme = cai > 0.9 && cai < 1.6 ? Math.sin(u * 70) * 10 * (1 - (cai - 0.9) / 0.7) : 0;
  const C = { z: 1.04 + 0.08 * k, cx: 600, cy: 660, px: treme, py: treme * 0.5 };
  poe(alvo, CACHE["be-fundo"], 0.3, C, 3);
  vivo(alvo, 0.5, C, 1.5, (g) => {
    lavaFundo(g, u);
    if (cai > 0.85) { // o anel cai no fogo: a lava explode em luz
      const e = cai - 0.85, r = rng(5);
      brilho(g, 820, 960, 300 + 500 * Math.min(1, e), "rgba(255,230,140,1)", Math.max(0, 1 - e / 2.2));
      g.fillStyle = "#ffcf6a";
      for (let i = 0; i < 40; i++) { const a = -Math.PI * (0.1 + r() * 0.8), v = 300 + r() * 500; const x = 820 + Math.cos(a) * v * e, y = 960 + Math.sin(a) * v * e + 500 * e * e; g.globalAlpha = Math.max(0, 1 - e / 1.6); g.beginPath(); g.arc(x, y, 4 + r() * 6, 0, 7); g.fill(); }
      g.globalAlpha = 1;
    }
  });
  poe(alvo, CACHE["be-borda"], 0.6, C);
  vivo(alvo, 0.6, C, 0, (g) => {
    pessoa(g, 300, 780, 0.8, "frodo", { vira: 1, ajoelhado: true, sobrancelha: "triste", boca: cai > 0.6 ? "o" : "triste", olhos: "aberto", olhar: 1, bracos: [0.7, 0.4] });
    if (cai < 1.4) {
      const e = Math.min(1, cai / 1.1);
      gollum(g, 600 + 160 * e, 765 + 700 * e * e, 0.95, { pose: "danca", fase: u * 2.2, anel: true, olhos: cai > 0.15 ? "aberto" : "feliz", boca: "aberta", inclina: 2.2 * e * e });
    }
  });
  vivo(alvo, 0.9, C, 0, (g) => brasas(g, u, 121, 70));
  vivo(alvo, 0, C, 0, (g) => { // o clarão
    const e = cai - 0.85;
    if (e > 0) { g.save(); g.globalCompositeOperation = "screen"; g.fillStyle = `rgba(255,220,170,${0.75 * Math.max(0, 1 - e / 0.8)})`; g.fillRect(X0, Y0, X1 - X0, Y1 - Y0); g.restore(); }
  });
}

// ---------- ÁGUIAS ----------
function nuvem(g, x, y, s, cor, sombra) {
  for (const [dx, dy, r] of [[0, 0, 70], [-70, 20, 50], [70, 18, 55], [-30, -30, 50], [35, -28, 45], [120, 30, 38], [-120, 34, 36]]) elipse(g, x + dx * s, y + dy * s + 8 * s, r * s, r * s, sombra);
  for (const [dx, dy, r] of [[0, 0, 70], [-70, 20, 50], [70, 18, 55], [-30, -30, 50], [35, -28, 45], [120, 30, 38], [-120, 34, 36]]) elipse(g, x + dx * s, y + dy * s, r * s, r * s, cor);
}
function fazerAguias() {
  cache("ag-ceu", (g) => {
    g.fillStyle = grad(g, 0, Y0, 0, 780, [[0, "#2e2350"], [0.5, "#9a4f7a"], [1, "#f4a46a"]]); g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    brilho(g, EL + 300, 700, 420, "rgba(255,220,170,1)", 0.7); elipse(g, EL + 300, 700, 110, 110, "#fde3b4");
    for (let i = 0; i < 5; i++) { g.fillStyle = "rgba(255,190,150,0.35)"; g.fillRect(X0, 520 + i * 40, X1 - X0, 4); }
  });
  cache("ag-vulcao", (g) => {
    poli(g, [[ER - 470, 820], [ER - 280, 520], [ER - 230, 515], [ER - 40, 820]], "#5a3d7a");
    poli(g, [[X0, 820], [X1, 820], [X1, Y1], [X0, Y1]], "#4a3a6e");
  });
  cache("ag-nuvens", (g) => { const r = rng(131); for (let i = 0; i < larg(8); i++) nuvem(g, X0 + r() * (X1 - X0), 780 + r() * 120, 0.9 + r() * 0.6, "#f2b8c6", "#c98aa8"); });
  cache("ag-perto", (g) => { nuvem(g, EL + 80, EB - 40, 1.8, "#f6c8d2", "#d89ab4"); nuvem(g, ER - 60, EB + 10, 2.1, "#f6c8d2", "#d89ab4"); });
}
function cenaAguias(alvo, u, ato) {
  const dur = ato.t1 - ato.t0, k = ease(u / dur);
  const C = { z: 1.02 + 0.06 * k, cx: 540, cy: 560, px: 0, py: 0 };
  poe(alvo, CACHE["ag-ceu"], 0.05, C);
  poe(alvo, CACHE["ag-vulcao"], 0.15, { ...C, px: -u * 6 }, 1.5);
  vivo(alvo, 0.15, { ...C, px: -u * 6 }, 1.5, (g) => { for (let i = 0; i < 7; i++) fumaca(g, ER - 255 + i * 22, 490 - i * 55, 30 + i * 10, "#3d2b52", 0.75); });
  poe(alvo, CACHE["ag-nuvens"], 0.35, { ...C, px: 60 - u * 30 }, 2.5);
  vivo(alvo, 0.6, C, 0, (g) => {
    aguia(g, ER - 220 - u * 10, 260 + Math.sin(u * 2) * 8, 0.35, u + 1);
    aguia(g, 640 - 120 * k, 520 + Math.sin(u * 1.7) * 14, 1.05, u, (h) => {
      pessoa(h, -40, -40, 0.3, "frodo", { sentado: true, olhos: "fechado", boca: "sorriso" });
      pessoa(h, 40, -44, 0.3, "sam", { sentado: true, olhos: "fechado", boca: "reto" });
    });
  });
  poe(alvo, CACHE["ag-perto"], 1.4, { ...C, px: 80 - u * 50 }, 8);
}

// ---------- CASA ----------
function flores(g, n, seed, area) {
  const r = rng(seed), cores = ["#f2c14e", "#e86a6a", "#f6f0e4", "#c08ae0", "#ff9a5a"];
  for (let i = 0; i < n; i++) { const x = area[0] + r() * (area[2] - area[0]), y = area[1] + r() * (area[3] - area[1]); g.strokeStyle = "#4f7a3a"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y + 12); g.lineTo(x, y); g.stroke(); elipse(g, x, y, 5, 5, cores[i % cores.length], 1.5); }
}
function fazerCasa() {
  cache("ca-ceu", (g) => {
    g.fillStyle = grad(g, 0, Y0, 0, 640, [[0, "#9fc3d8"], [0.6, "#f6dcae"], [1, "#fbe9c4"]]); g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    brilho(g, ER - 220, 420, 480, "rgba(255,235,180,1)", 0.8);
    const r = rng(141);
    for (let i = 0; i < larg(4); i++) { const x = X0 + r() * (X1 - X0), y = ET + 90 + r() * 200; for (let j = 0; j < 4; j++) elipse(g, x + j * 34 - 50, y - (j % 2) * 14, 36, 18, "rgba(255,240,220,0.85)"); }
    g.fillStyle = "#b8cf86"; caminho(g, [[X0, 640], [EL + 260, 590], [520, 620], [ER - 300, 580], [X1, 620], [X1, Y1], [X0, Y1]]); g.fill();
  });
  cache("ca-colina", (g) => {
    g.fillStyle = grad(g, 0, 380, 0, 900, [[0, "#9ccc64"], [1, "#6a9e44"]]);
    g.beginPath(); g.moveTo(X0, 900); g.bezierCurveTo(100, 380, 980, 380, X1, 900); g.lineTo(X1, Y1); g.lineTo(X0, Y1); g.closePath(); g.fill();
    g.fillStyle = "#5e9a3a"; g.fillRect(X0, 880, X1 - X0, Y1 - 880);
    poli(g, [[640, 470], [640, 400], [676, 400], [676, 470]], "#9a8a7a", 3); g.fillStyle = "#7a6a5a"; g.fillRect(636, 392, 44, 12);
    // porta redonda, verde, maçaneta no meio
    elipse(g, 540, 700, 112, 112, "#8a6a44", 4);
    g.save(); g.beginPath(); g.arc(540, 700, 96, 0, Math.PI * 2); g.clip();
    g.fillStyle = "#3f7a3a"; g.fillRect(440, 600, 200, 200);
    g.strokeStyle = "rgba(20,40,20,0.5)"; g.lineWidth = 3; for (let x = 450; x < 640; x += 24) { g.beginPath(); g.moveTo(x, 600); g.lineTo(x, 800); g.stroke(); }
    g.restore();
    g.lineWidth = 4; g.strokeStyle = LINHA; g.beginPath(); g.arc(540, 700, 96, 0, Math.PI * 2); g.stroke();
    elipse(g, 540, 700, 11, 11, "#f2c14e", 3);
    for (const x of [330, 750]) { elipse(g, x, 650, 46, 46, "#8a6a44", 3.5); elipse(g, x, 650, 36, 36, "#fbe9a8", 3); g.strokeStyle = "#8a6a44"; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 36, 650); g.lineTo(x + 36, 650); g.moveTo(x, 614); g.lineTo(x, 686); g.stroke(); }
    // caminho de pedras, cerca, flores
    for (let i = 0; i < 7; i++) elipse(g, 540 + Math.sin(i) * 20, 830 + i * 38, 30 + i * 6, 10 + i * 2, "#d9cdb0", 2);
    for (let x = EL - 20; x < 330; x += 34) { g.fillStyle = "#f2ead8"; g.fillRect(x, 770, 14, 70); g.strokeStyle = LINHA; g.lineWidth = 2.5; g.strokeRect(x, 770, 14, 70); }
    g.fillStyle = "#f2ead8"; g.fillRect(EL - 20, 790, 350, 10); g.strokeRect(EL - 20, 790, 350, 10);
    flores(g, larg(160), 142, [X0, 800, X1, Math.max(1000, EB - 60)]);
    // banco
    forma(g, [[360, 836], [720, 836], [720, 858], [360, 858]], "#8a5a34", "#b07a4a", 0, -3, 3.5);
    g.fillStyle = "#6a4428"; g.fillRect(380, 858, 16, 52); g.fillRect(684, 858, 16, 52);
  });
}
function borboleta(g, x, y, t, cor) {
  const a = Math.abs(Math.sin(t * 14));
  for (const l of [-1, 1]) { g.beginPath(); g.ellipse(x + l * 8 * a, y, 9 * a + 2, 7, l * 0.4, 0, Math.PI * 2); g.fillStyle = cor; g.fill(); g.lineWidth = 1.5; g.strokeStyle = LINHA; g.stroke(); }
}
function cenaCasa(alvo, u, ato) {
  const dur = ato.t1 - ato.t0, k = ease(u / dur);
  const C = { z: 1.02 + 0.08 * k, cx: 540, cy: 760, px: 0, py: 0 };
  poe(alvo, CACHE["ca-ceu"], 0.2, C, 2);
  vivo(alvo, 0.6, C, 0, (g) => { for (let i = 0; i < 6; i++) { const e = (u * 0.25 + i / 6) % 1; elipse(g, 658 + Math.sin(e * 8) * 14 + e * 30, 390 - e * 260, 14 + e * 30, 14 + e * 30, `rgba(240,240,240,${0.6 * (1 - e)})`); } });
  poe(alvo, CACHE["ca-colina"], 0.6, C);
  vivo(alvo, 0.6, C, 0, (g) => {
    raios(g, u, ER - 200, 380, [[2.6, 90, 700, 0.18], [2.75, 60, 650, 0.14]], "rgba(255,240,200,");
    const pisca = (f) => ((u + f) % 3.1) < 0.15 ? "fechado" : "aberto";
    pessoa(g, 445, 908, 0.5, "frodo", { sentado: true, olhos: pisca(0.4), boca: "sorriso", olhar: 0.5 });
    pessoa(g, 540, 908, 0.5, "bilboVelho", { sentado: true, olhos: "fechado", boca: "sorriso" });
    pessoa(g, 635, 908, 0.5, "sam", { sentado: true, olhos: pisca(1.7), boca: "sorriso", olhar: -0.5 });
    borboleta(g, 300 + Math.sin(u * 0.9) * 80, 760 + Math.sin(u * 2.1) * 30, u, "#f2c14e");
    borboleta(g, 800 + Math.cos(u * 0.7) * 70, 800 + Math.sin(u * 1.6) * 30, u + 0.3, "#f6f0e4");
  });
  vivo(alvo, 0.6, C, 0, (g) => particulas(g, 30, 151, u, null, (g, i, x0, y0, v, f, tam, t) => {
    const x = 100 + x0 * 880 + Math.sin(t * (0.4 + v) + f * 6) * 20, y = 500 + y0 * 400 - t * (5 + v * 8);
    brilho(g, x, y, 4 + tam * 6, "rgba(255,240,180,0.9)", 0.3 + 0.6 * Math.max(0, Math.sin(t * (1 + v * 2) + f * 9)));
  }));
}

Object.assign(CENAS, { guerra: cenaGuerra, rio: cenaRio, gollum: cenaGollum, bilbo: cenaBilbo, toca: cenaToca, jornada: cenaJornada, beira: cenaBeira, queda: cenaQueda, aguias: cenaAguias, casa: cenaCasa });
Object.assign(PREPARA, { guerra: fazerGuerra, rio: fazerRio, gollum: fazerGollum, bilbo: fazerBilbo, toca: fazerToca, jornada: fazerJornada, beira: fazerBeira, queda: fazerBeira, aguias: fazerAguias, casa: fazerCasa });
