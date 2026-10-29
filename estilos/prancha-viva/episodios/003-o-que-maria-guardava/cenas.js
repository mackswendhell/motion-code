// Cenários (pintados uma vez, em camadas) e encenação das 15 cenas do 003.
// Toda marcação de tempo sai das falas do ato (F = começo, FE = fim), então a cena acompanha a voz se uma tomada mudar.

const CHAO = 960;

// ---------- pintura dos cenários ----------
function ceuPintado(c, x, y, w, h, cores, seed, nuvens = 0) {
  const g = c.createLinearGradient(0, y, 0, y + h);
  cores.forEach((cor, i) => g.addColorStop(i / (cores.length - 1), cor));
  c.fillStyle = g; c.fillRect(x, y, w, h);
  if (nuvens) {
    const r = rng(seed);
    c.save(); c.translate(x, y);
    aquarela(c, w, h * 0.55, [cla(cores[0], 0.5), cla(cores[1] || cores[0], 0.35)], nuvens, 0.18, r);
    c.restore();
  }
}
function colina(c, x0, x1, base, amp, cor, seed, o = {}) {
  const r = rng(seed), pts = [[x0, base + 600]];
  const n = Math.max(4, Math.round((x1 - x0) / 260));
  for (let i = 0; i <= n; i++) pts.push([lerp(x0, x1, i / n), base - amp * (0.4 + 0.6 * r()) * (i % 2 ? 1 : 0.55)]);
  pts.push([x1, base + 600]);
  pinta(c, pts, cor, { seed, hach: o.hach ?? 0, tinta: o.tinta ?? true, larg: 2, alpha: 0.5, luz: 0.18, sombra: 0.2 });
}
function oliveira(c, x, y, s, seed, cor = "#7f8a6a") {
  const r = rng(seed);
  c.save(); c.translate(x, y); c.scale(s, s);
  pinta(c, [[-26, 0], [-14, -90], [-34, -170], [-8, -200], [10, -150], [30, -210], [44, -190], [22, -110], [30, 0]], "#6e5a44", { seed, hach: 6 });
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (r() - 0.5) * 2.4, d = 90 + r() * 90, cx = Math.cos(a) * d, cy = -210 + Math.sin(a) * d * 0.6;
    pinta(c, circulo(cx, cy, 52 + r() * 34, 12, 0.35, r), i % 3 ? cor : cla(cor, 0.18), { seed: seed + i, hach: 0, larg: 1.6, alpha: 0.6, luz: 0.25 });
  }
  for (let i = 0; i < 40; i++) { const a = r() * 6.28, d = r() * 150; elip(c, Math.cos(a) * d, -230 + Math.sin(a) * d * 0.6, 9, 3, rgba(cla(cor, 0.4), 0.7), r() * 3); }
  c.restore();
}
function casa(c, x, y, w, h, cor, seed, o = {}) { // casinha de pedra de teto chato
  const r = rng(seed);
  pinta(c, [[x, y], [x, y - h], [x + w, y - h - 4], [x + w, y]], cor, { seed, hach: 7, liso: false });
  pinta(c, [[x - 10, y - h + 4], [x - 6, y - h - 14], [x + w + 8, y - h - 18], [x + w + 12, y - h]], esc(cor, 0.25), { seed: seed + 1, hach: 0, liso: false, larg: 2 });
  for (let i = 0; i < w * h / 2600; i++) { const px = x + r() * w, py = y - r() * h; linha(c, [[px, py], [px + 14 + r() * 16, py + (r() - 0.5) * 3]], esc(cor, 0.3), 1.2, 0.35); }
  if (o.porta !== false) {
    const pw = Math.min(70, w * 0.3), px = x + (o.portaX ?? 0.35) * w;
    pinta(c, [[px, y], [px, y - h * 0.62], [px + pw / 2, y - h * 0.7], [px + pw, y - h * 0.62], [px + pw, y]], o.luz ? "#f2c46e" : "#5a4030", { seed: seed + 2, hach: 0, liso: false });
  }
  for (const jx of o.janelas || []) pinta(c, retang(x + jx * w, y - h * 0.78, 26, 30), o.luz ? "#f7d58a" : "#4a3628", { seed: seed + 3 + jx * 10, hach: 0, liso: false, larg: 1.8 });
}
function coluna(c, x, y, w, h, cor, seed) {
  pinta(c, [[x, y], [x + 4, y - h], [x + w - 4, y - h], [x + w, y]], cor, { seed, hach: 7, liso: false });
  for (let i = 1; i < 4; i++) linha(c, [[x + (w * i) / 4, y - 10], [x + (w * i) / 4, y - h + 10]], esc(cor, 0.3), 1.2, 0.5, false);
  pinta(c, [[x - 18, y - h], [x - 12, y - h - 36], [x + w + 12, y - h - 36], [x + w + 18, y - h]], cla(cor, 0.1), { seed: seed + 1, hach: 0, liso: false });
  pinta(c, [[x - 14, y + 4], [x - 10, y - 22], [x + w + 10, y - 22], [x + w + 14, y + 4]], cla(cor, 0.1), { seed: seed + 2, hach: 0, liso: false });
}
function muroPedras(c, x, y, w, h, cor, seed, tam = 70) {
  const r = rng(seed);
  pinta(c, retang(x, y, w, h), cor, { seed, hach: 0, liso: false, tinta: false });
  for (let yy = y; yy < y + h; yy += tam * 0.55) {
    let xx = x - r() * tam;
    while (xx < x + w) {
      const bw = tam * (0.7 + r() * 0.6);
      c.save(); c.globalAlpha = 0.5; caminho(c, tremido(retang(xx + 3, yy + 3, bw - 6, tam * 0.55 - 6), 1.4, r, 3));
      c.fillStyle = rgba(r() < 0.5 ? cla(cor, 0.12) : esc(cor, 0.1), 0.6); c.fill(); c.strokeStyle = rgba(esc(cor, 0.45), 0.7); c.lineWidth = 1.4; c.stroke(); c.restore();
      xx += bw;
    }
  }
}
function palha(c, x, y, w, h, seed, cor = "#d8b46a") {
  const r = rng(seed);
  pinta(c, [[x, y + h], [x + w * 0.1, y + h * 0.2], [x + w * 0.5, y], [x + w * 0.9, y + h * 0.2], [x + w, y + h]], cor, { seed, hach: 0, larg: 1.6, alpha: 0.5 });
  for (let i = 0; i < w * h / 90; i++) {
    const px = x + r() * w, py = y + h * 0.15 + r() * h * 0.85, a = (r() - 0.5) * 1.6, l = 12 + r() * 26;
    linha(c, [[px, py], [px + Math.cos(a) * l, py + Math.sin(a) * l * 0.4]], r() < 0.5 ? "#b68a42" : "#f0d48e", 1.3, 0.8, false);
  }
}
function capim(c, x0, x1, y, seed, cor, alt = 30) {
  const r = rng(seed);
  for (let x = x0; x < x1; x += 7 + r() * 10) {
    const h = alt * (0.4 + r()), a = (r() - 0.5) * 0.6;
    linha(c, [[x, y + r() * 20], [x + Math.sin(a) * h, y - h]], r() < 0.5 ? cor : cla(cor, 0.2), 1.6, 0.8, false);
  }
}
function chaoTerra(c, x, y, w, h, cor, seed) {
  pinta(c, [[x, y + 12], [x + w * 0.3, y], [x + w * 0.7, y + 8], [x + w, y], [x + w, y + h], [x, y + h]], cor, { seed, hach: 0, larg: 2, alpha: 0.6 });
  const r = rng(seed + 9);
  for (let i = 0; i < w * h / 1800; i++) { const px = x + r() * w, py = y + 20 + r() * h; linha(c, [[px, py], [px + 10 + r() * 30, py + (r() - 0.5) * 4]], esc(cor, 0.25), 1, 0.35); }
}
function camada(w, h, ox, oy, desenha) { const img = pinturaFixa(w, h, (c) => { c.translate(-ox, -oy); desenha(c); }); return { img, x: ox, y: oy }; }
const poe = (c, L) => c.drawImage(L.img, L.x, L.y);
function escuro(c, x, y, r, a, cor = "#121a2c") { // noite: tudo escurece fora do círculo de luz
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createRadialGradient(x, y, r * 0.15, x, y, r);
  g.addColorStop(0, rgba(cor, 0)); g.addColorStop(1, rgba(cor, a));
  c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
}
function vela(c, cor, a) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = "multiply"; c.fillStyle = rgba(cor, a); c.fillRect(0, 0, W, H); c.restore(); }

// ---------- cenários ----------
const M = 360; // margem das camadas: espaço para a câmera andar e o zoom
const CENARIOS = {
  quarto: () => ({
    fundo: camada(W + 2 * M, H + 2 * M, -M, -M, (c) => {
      muroPedras(c, -M, -M, W + 2 * M, H + 2 * M, "#7a6248", 11, 90);
      vela(c, "#6f7fa0", 0.0);
      pinta(c, [[260, 210], [260, 610], [640, 610], [640, 210]], "#5a4330", { seed: 12, liso: false, hach: 0 }); // moldura da janela
      c.save(); c.globalCompositeOperation = "destination-out"; c.fillStyle = "#000"; c.fillRect(286, 236, 328, 348); c.restore();
      pinta(c, [[-M, 760], [W + M, 740], [W + M, H + M], [-M, H + M]], "#6a523c", { seed: 13, hach: 0, liso: false }); // chão
      pinta(c, [[1380, 300], [1820, 300], [1820, 322], [1380, 322]], "#6a4a32", { seed: 14, liso: false, hach: 0 }); // prateleira
      for (const [jx, jc] of [[1420, "#a8673f"], [1520, "#8c6a4a"], [1640, "#b07a52"], [1740, "#7a5a40"]]) pinta(c, [[jx, 300], [jx - 8, 250], [jx + 6, 220], [jx + 40, 220], [jx + 52, 250], [jx + 44, 300]], jc, { seed: jx, hach: 5 });
      pinta(c, [[520, 760], [520, 700], [960, 690], [970, 760], [940, 960], [910, 960], [900, 770], [580, 776], [568, 960], [540, 960]], "#6b4c34", { seed: 15, hach: 6, liso: false }); // mesa
      pinta(c, [[1060, 960], [1070, 860], [1300, 856], [1310, 960]], "#5e4430", { seed: 16, hach: 6, liso: false }); // banquinho
    }),
  }),
  santuario: () => ({
    fundo: camada(W + 2 * M, H + 2 * M, -M, -M, (c) => {
      muroPedras(c, -M, -M, W + 2 * M, H + 2 * M, "#c9a874", 21, 110);
      // o véu do Santo dos Santos
      const r = rng(22);
      const cort = [[560, 40], [1360, 40], [1380, 900], [540, 900]];
      pinta(c, cort, "#8a3a3a", { seed: 23, liso: false, hach: 0 });
      c.save(); suave(c, cort); c.clip();
      for (let i = 0; i < 18; i++) { const x = 560 + i * 46; c.fillStyle = rgba(["#3f5f8a", "#6a3a6a", "#a8483a"][i % 3], 0.35); c.fillRect(x, 40, 30, 860); linha(c, [[x + 15, 50], [x + 22, 880]], esc("#8a3a3a", 0.4), 2, 0.5); }
      for (let i = 0; i < 30; i++) { const x = 600 + r() * 720, y = 100 + r() * 700; linha(c, [[x - 10, y], [x, y - 10], [x + 10, y], [x, y + 10], [x - 10, y]], "#e0b45a", 1.4, 0.5, false); }
      c.restore();
      pinta(c, [[520, 30], [1400, 30], [1400, 56], [520, 56]], "#d9a84a", { seed: 24, liso: false, hach: 0 });
      coluna(c, 150, 960, 120, 900, "#d9c39a", 25); coluna(c, 1660, 960, 120, 900, "#d9c39a", 26);
      pinta(c, [[-M, 900], [W + M, 890], [W + M, H + M], [-M, H + M]], "#b89a6a", { seed: 27, hach: 0, liso: false });
      // castiçal de sete braços
      const mx = 400, my = 900;
      linha(c, [[mx, my], [mx, my - 330]], "#d9a84a", 12, 1, false);
      for (let i = 1; i <= 3; i++) linha(c, [[mx - i * 46, my - 330], [mx - i * 46, my - 240 + i * 10], [mx, my - 140 - i * 30], [mx + i * 46, my - 240 + i * 10], [mx + i * 46, my - 330]], "#d9a84a", 9, 1);
      pinta(c, [[mx - 60, my], [mx - 30, my - 40], [mx + 30, my - 40], [mx + 60, my]], "#c4913a", { seed: 28, hach: 0 });
      // altar do incenso
      pinta(c, [[860, 900], [860, 700], [1060, 700], [1060, 900]], "#d8a64a", { seed: 29, hach: 6, liso: false });
      pinta(c, [[840, 712], [850, 680], [1070, 680], [1080, 712]], "#e9c56a", { seed: 30, hach: 0, liso: false });
      for (const hx of [850, 1070]) pinta(c, [[hx - 12, 682], [hx - 4, 650], [hx + 8, 652], [hx + 12, 682]], "#e9c56a", { seed: hx, hach: 0, larg: 1.6 });
      for (let i = 0; i < 4; i++) linha(c, [[880 + i * 50, 720], [880 + i * 50, 880]], "#a87a2a", 2, 0.5, false);
    }),
    frente: camada(600, 1200, 1500, -80, (c) => coluna(c, 1700, 1100, 150, 1150, "#cdb68c", 31)),
  }),
  patio: () => ({
    fundo: camada(W + 2 * M, H + 2 * M, -M, -M, (c) => {
      ceuPintado(c, -M, -M, W + 2 * M, 700, ["#c9d6cf", "#efe2c2"], 41, 14);
      muroPedras(c, 300, 60, 1320, 760, "#d9c29a", 42, 100);
      coluna(c, 380, 820, 100, 700, "#e8d8b4", 43); coluna(c, 1440, 820, 100, 700, "#e8d8b4", 44);
      pinta(c, [[760, 820], [760, 330], [960, 230], [1160, 330], [1160, 820]], "#3e2e24", { seed: 45, hach: 0 }); // porta grande
      for (let i = 0; i < 5; i++) pinta(c, [[300 - i * 60, 820 + i * 34], [1620 + i * 60, 820 + i * 34], [1620 + i * 60, 854 + i * 34], [300 - i * 60, 854 + i * 34]], mist("#d9c29a", "#b89a6a", i / 5), { seed: 46 + i, hach: 0, liso: false, larg: 1.8 });
      pinta(c, [[-M, 990], [W + M, 990], [W + M, H + M], [-M, H + M]], "#b89a6a", { seed: 52, hach: 0, liso: false });
    }),
  }),
  casaN: () => ({
    fora: camada(1400, 1000, 1000, 100, (c) => {
      ceuPintado(c, 1000, 100, 1400, 700, ["#cfe0dc", "#f1e4c4"], 61, 10);
      colina(c, 1000, 2400, 560, 80, "#a9b48e", 62);
      colina(c, 1000, 2400, 680, 60, "#8f9e76", 63);
      oliveira(c, 1760, 760, 0.7, 64);
    }),
    fundo: camada(W + 2 * M, H + 2 * M, -M, -M, (c) => {
      pinta(c, retang(-M, -M, W + 2 * M, H + 2 * M), "#d9b88e", { seed: 65, hach: 0, liso: false, tinta: false });
      aquarela(c, W + 2 * M, H + 2 * M, ["#c9a47a", "#e2c49c", "#d1a982"], 40, 0.35, rng(66));
      pinta(c, [[1280, 220], [1280, 700], [1700, 700], [1700, 220]], "#8a6a4a", { seed: 67, liso: false, hach: 0 });
      c.save(); c.globalCompositeOperation = "destination-out"; c.fillStyle = "#000"; c.fillRect(1306, 246, 368, 428); c.restore();
      pinta(c, [[-M, 860], [W + M, 850], [W + M, H + M], [-M, H + M]], "#b48e64", { seed: 68, hach: 0, liso: false });
      pinta(c, [[200, 860], [190, 780], [230, 700], [300, 690], [330, 760], [320, 860]], "#b0703f", { seed: 69, hach: 6 }); // jarro
      pinta(c, [[380, 960], [390, 900], [700, 896], [710, 960]], "#8c6a44", { seed: 70, hach: 0, liso: false }); // mesa baixa
      for (let i = 0; i < 4; i++) pinta(c, [[420 + i * 60, 900], [430 + i * 60, 870], [470 + i * 60, 870], [474 + i * 60, 900]], ["#e9dcc0", "#c98a6a", "#d9c6a0", "#9a7a9a"][i], { seed: 71 + i, hach: 0, liso: false, larg: 1.6 });
      pinta(c, [[40, 180], [40, 120], [500, 120], [500, 180]], "#7a5a40", { seed: 75, liso: false, hach: 0 });
    }),
  }),
  colinas: () => ({
    longe: camada(3600, 1500, -600, -300, (c) => {
      colina(c, -600, 3000, 560, 120, "#b9bfa2", 81, { tinta: false });
    }),
    meio: camada(5200, 1500, -600, -300, (c) => {
      colina(c, -600, 4600, 700, 110, "#a2ac84", 82);
      for (let i = 0; i < 12; i++) oliveira(c, -300 + i * 410, 760 + (i % 3) * 20, 0.5 + (i % 2) * 0.12, 83 + i);
    }),
    perto: camada(7000, 1500, -600, -300, (c) => {
      chaoTerra(c, -600, 860, 7000, 940, "#c8ad80", 84);
      pinta(c, [[-600, 960], [6400, 940], [6400, 1010], [-600, 1030]], "#d9c19a", { seed: 85, hach: 0, alpha: 0.4 });
      casa(c, 4380, 960, 520, 360, "#d7c09a", 86, { portaX: 0.12, janelas: [0.6] });
      pinta(c, [[4380, 600], [4300, 560], [4420, 520], [4560, 590]], "#7f8a5a", { seed: 87, hach: 0 }); // parreira
      capim(c, -600, 6400, 880, 88, "#8f9a6a", 26);
    }),
    frente: camada(9000, 400, -600, 900, (c) => capim(c, -600, 8400, 1060, 89, "#6f7a52", 70)),
  }),
  patioZ: () => ({
    fundo: camada(W + 2 * M, H + 2 * M, -M, -M, (c) => {
      ceuPintado(c, -M, -M, W + 2 * M, 600, ["#d6e0d2", "#f2e6c8"], 91, 8);
      casa(c, -M, 860, 900, 620, "#d9c3a0", 92, { portaX: 0.6, janelas: [0.25] });
      casa(c, 1340, 860, 940, 560, "#cfb48c", 93, { portaX: 0.3, janelas: [0.7] });
      for (let i = 0; i < 6; i++) linha(c, [[500 + i * 180, 300], [520 + i * 180, 860]], "#6e5a44", 6, 0.9, false);
      for (let i = 0; i < 30; i++) { const r = rng(94 + i); pinta(c, circulo(480 + r() * 1100, 240 + r() * 120, 40 + r() * 30, 10, 0.4, r), i % 3 ? "#7f8a5a" : "#93a06a", { seed: 95 + i, hach: 0, larg: 1.4, alpha: 0.5 }); }
      pinta(c, [[-M, 860], [W + M, 850], [W + M, H + M], [-M, H + M]], "#c8ad80", { seed: 96, hach: 0, liso: false });
    }),
  }),
  estradaB: () => ({
    longe: camada(3600, 1500, -600, -300, (c) => colina(c, -600, 3000, 620, 140, "#6f6a7a", 101, { tinta: false })),
    meio: camada(5200, 1500, -600, -300, (c) => {
      colina(c, -600, 4600, 760, 100, "#6f7462", 102);
      for (let i = 0; i < 9; i++) oliveira(c, -200 + i * 520, 800, 0.45, 103 + i, "#5f6a55");
    }),
    perto: camada(7400, 1500, -600, -300, (c) => {
      chaoTerra(c, -600, 870, 7400, 900, "#a08a6a", 104);
      // Belém no alto do caminho
      const r = rng(105);
      for (let i = 0; i < 9; i++) casa(c, 4200 + i * 260 + r() * 40, 900 - (i % 3) * 20, 220 + r() * 60, 220 + r() * 160, mist("#c8aa80", "#9a8466", r()), 106 + i, { luz: true, janelas: [0.6], portaX: 0.2 });
      capim(c, -600, 6600, 890, 107, "#6f6a4a", 24);
    }),
  }),
  estabulo: () => ({
    fundo: camada(W + 2 * M, H + 2 * M, -M, -M, (c) => {
      pinta(c, retang(-M, -M, W + 2 * M, H + 2 * M), "#5e4a3a", { seed: 111, hach: 0, liso: false, tinta: false });
      aquarela(c, W + 2 * M, H + 2 * M, ["#6a5444", "#4e3e32", "#7a6250"], 50, 0.5, rng(112));
      // abertura da gruta para a noite
      const boca = [[1240, 860], [1250, 420], [1420, 260], [1640, 300], [1760, 520], [1770, 860]];
      pinta(c, boca, "#2e3a4e", { seed: 113, hach: 0 });
      c.save(); suave(c, boca); c.globalCompositeOperation = "destination-out"; c.fillStyle = "#000"; c.fill(); c.restore();
      const r = rng(114);
      for (let i = 0; i < 26; i++) { const x = -M + r() * (W + 2 * M), y = -M + r() * 700; pinta(c, circulo(x, y, 60 + r() * 90, 10, 0.4, r), r() < 0.5 ? "#6e5848" : "#54443a", { seed: 115 + i, hach: 0, larg: 1.6, alpha: 0.4 }); }
      pinta(c, [[-M, 840], [W + M, 830], [W + M, H + M], [-M, H + M]], "#7a6248", { seed: 116, hach: 0, liso: false });
      palha(c, -M, 820, W + 2 * M, 200, 117, "#b89458");
      // manjedoura
      pinta(c, [[860, 930], [840, 820], [1140, 820], [1120, 930]], "#7a5a3a", { seed: 118, hach: 6, liso: false });
      for (const lx of [860, 1110]) linha(c, [[lx, 930], [lx - 10, 990]], "#5e4430", 10, 1, false);
      palha(c, 840, 790, 300, 40, 119);
    }),
    noite: camada(800, 900, 1200, 200, (c) => ceuPintado(c, 1200, 200, 800, 900, ["#1f3048", "#3e5466"], 120, 0)),
  }),
  campo: () => ({
    ceu: camada(W + 2 * M, 1300, -M, -700, (c) => ceuPintado(c, -M, -700, W + 2 * M, 1300, ["#0f1c30", "#1f3550", "#3a5466"], 121, 0)),
    longe: camada(W + 2 * M, 1100, -M, 300, (c) => colina(c, -M, W + M, 600, 120, "#2e4652", 122, { tinta: false })),
    meio: camada(W + 2 * M, 1100, -M, 300, (c) => { colina(c, -M, W + M, 760, 90, "#334a48", 123); oliveira(c, 1700, 790, 0.55, 124, "#3e5048"); oliveira(c, 150, 800, 0.45, 125, "#3e5048"); }),
    perto: camada(W + 2 * M, 900, -M, 600, (c) => { chaoTerra(c, -M, 860, W + 2 * M, 700, "#4a5444", 126); capim(c, -M, W + M, 880, 127, "#5c6a52", 30); }),
  }),
  atrio: () => ({
    fundo: camada(W + 2 * M, H + 2 * M, -M, -M, (c) => {
      ceuPintado(c, -M, -M, W + 2 * M, 500, ["#e6eee2", "#f6ecd2"], 131, 6);
      muroPedras(c, -M, 80, W + 2 * M, 820, "#e2cfa6", 132, 110);
      for (let i = 0; i < 6; i++) coluna(c, -120 + i * 400, 900, 110, 760, "#efe2c2", 133 + i);
      pinta(c, [[-M, 120], [W + M, 120], [W + M, 150], [-M, 150]], "#d9c194", { seed: 140, liso: false, hach: 0 });
      pinta(c, [[-M, 900], [W + M, 890], [W + M, H + M], [-M, H + M]], "#d6c3a0", { seed: 141, hach: 0, liso: false });
      const r = rng(142);
      for (let i = 0; i < 12; i++) { const y = 920 + i * 14; linha(c, [[-M, y + r() * 6], [W + M, y + r() * 6]], "#bfa77e", 1.2, 0.4); }
    }),
  }),
  jerus: () => ({
    longe: camada(4200, 1500, -600, -300, (c) => {
      colina(c, -600, 3600, 640, 100, "#b7b496", 151, { tinta: false });
      const r = rng(152);
      muroPedras(c, 200, 420, 1300, 230, "#d6c09a", 153, 60);
      for (let i = 0; i < 6; i++) pinta(c, retang(200 + i * 240, 360, 80, 70), "#cdb58c", { seed: 154 + i, liso: false, hach: 0 });
      for (let i = 0; i < 14; i++) casa(c, 260 + i * 90 + r() * 20, 420, 70 + r() * 30, 60 + r() * 60, mist("#d8c4a0", "#bfa57e", r()), 160 + i, { porta: false });
      pinta(c, [[700, 300], [700, 200], [980, 200], [980, 300]], "#efe2c2", { seed: 175, liso: false, hach: 0 }); // o Templo
    }),
    meio: camada(5600, 1500, -600, -300, (c) => { colina(c, -600, 5000, 760, 90, "#a9ae88", 176); for (let i = 0; i < 10; i++) oliveira(c, -200 + i * 520, 800, 0.5, 177 + i); }),
    perto: camada(7400, 1500, -600, -300, (c) => { chaoTerra(c, -600, 870, 7400, 900, "#cdb48a", 188); capim(c, -600, 6800, 890, 189, "#8f9a6a", 24); }),
  }),
  portico: () => ({
    fundo: camada(W + 2 * M, H + 2 * M, -M, -M, (c) => {
      muroPedras(c, -M, -M, W + 2 * M, 1260, "#e0cca2", 191, 110);
      for (let i = 0; i < 5; i++) coluna(c, -60 + i * 480, 900, 130, 900, "#efe2c2", 192 + i);
      pinta(c, [[-M, 900], [W + M, 890], [W + M, H + M], [-M, H + M]], "#d2bd96", { seed: 198, hach: 0, liso: false });
      pinta(c, [[640, 930], [660, 880], [1500, 880], [1520, 930]], "#c9b48c", { seed: 199, hach: 0, liso: false }); // banco de pedra
    }),
  }),
  nazareExt: () => ({
    ceu: camada(W + 2 * M, H + 2 * M, -M, -M, (c) => ceuPintado(c, -M, -M, W + 2 * M, 900, ["#c98a6a", "#e8b07a", "#f2d6a0"], 201, 10)),
    fundo: camada(W + 2 * M, H + 2 * M, -M, -M, (c) => {
      colina(c, -M, W + M, 640, 90, "#a88a6a", 202, { tinta: false });
      oliveira(c, 1650, 840, 0.75, 203, "#7a7f5a");
      casa(c, 160, 880, 760, 520, "#d9b88e", 204, { portaX: 0.55, janelas: [0.15] });
      pinta(c, [[-M, 860], [W + M, 850], [W + M, H + M], [-M, H + M]], "#c49c70", { seed: 205, hach: 0, liso: false });
      pinta(c, [[1060, 860], [1060, 780], [1500, 770], [1500, 860]], "#8c6a44", { seed: 206, hach: 6, liso: false }); // bancada
      for (const lx of [1080, 1480]) linha(c, [[lx, 860], [lx, 960]], "#6e5236", 12, 1, false);
      for (let i = 0; i < 3; i++) pinta(c, retang(1100 + i * 20, 740 - i * 16, 360, 14), "#c9a46a", { seed: 207 + i, liso: false, hach: 0, larg: 1.6 });
    }),
  }),
};
const FOCO = { lamparina: [W / 2, 300], manjedoura: [990, 640], anunciacao: [900, 400] };

// ---------- ator: chaves de pose + caminhada automática + boca pela voz ----------
function ator(c, nome, chaves, u, t, A, o = {}) {
  const s = anima(chaves, u), s2 = anima(chaves, u + 0.06);
  const vx = ((s2.x ?? 0) - (s.x ?? 0)) / 0.06;
  if (o.anda !== false) {
    s.andar = Math.max(s.andar || 0, clamp(Math.abs(vx) / 150));
    s.passo = (s.x || 0) / (34 * (s.s || 1));
  }
  if (o.voz) { const b = voz(A, o.voz, u); s.fala = Math.max(s.fala || 0, b); s.cab = (s.cab || 0) - b * 0.03; }
  return figura(c, nome, s, t);
}
const K0 = (st) => [0, st, 0];

// ---------- cenas ----------
const CENAS = {
  lamparina(c, u, A) {
    const L = camadas("quarto"), fim = DUR(A);
    const cam = anima([[0, { x: 960, y: 560, z: 1.02 }, 0], [F(A, 0) + 3, { x: 1000, y: 540, z: 1.16 }, F(A, 0) + 3], [fim - 3.2, { x: 1080, y: 520, z: 1.3 }, 4], [fim, { x: 1100, y: 360, z: 1.45 }, 3]], u);
    c.fillStyle = "#1d2a40"; c.fillRect(0, 0, W, H);
    vista(c, cam, 1);
    ceuPintado(c, 280, 230, 340, 360, ["#14223a", "#2c4058"], 1, 0);
    estrelas(c, 3, 40, [286, 236, 328, 348], u, 1);
    elip(c, 520, 320, 22, 22, "#e9e2c4"); elip(c, 532, 312, 20, 20, "#22344c");
    poe(c, L.fundo);
    const maos = seg(u, F(A, 1), F(A, 1) + 1.5), abre = seg(u, fim - 3.6, fim - 2.6);
    const st = { x: 1170, y: 958, s: 0.98, f: -1, agacha: 0.72, cab: 0.08 - maos * 0.05, olharY: 0.6 - abre * 1.2, olhar: -0.5,
      bf: [lerp(0.5, 1.15, maos) + abre * 0.25, lerp(0.9, 1.7, maos) - abre * 0.6], bt: [lerp(0.4, 0.9, maos), lerp(0.9, 1.6, maos)], sorri: 0.2 + maos * 0.25, olhos: 1 - maos * 0.25 };
    const P = figura(c, "mariaVelha", st, u);
    lamparina(c, 760, 690, 1.3, u);
    // a lembrança que ela guarda nas mãos sobe e vira a chama da próxima cena
    const m = P.mao, sobe = seg(u, fim - 2.8, fim);
    orbe(c, m[0] + 10, lerp(m[1] - 20, 260, ease(sobe)), 6 + abre * 3, u, abre);
    c.setTransform(1, 0, 0, 1, 0, 0);
    const [lx, ly] = noMundo(cam, 820, 670);
    escuro(c, lx, ly, 1050, 0.82);
    brilho(c, lx, ly, 520, "#ffcf7a", 0.28);
    poeira(c, 4, 26, u, [0, 0, W, H], "#ffe3a8", 0.35, 6);
  },

  zacarias(c, u, A) {
    const L = camadas("santuario");
    const surge = F(A, 2) + 2.6, ajoelha = surge + 0.6;
    const cam = anima([[0, { x: 900, y: 560, z: 1.08 }, 0], [F(A, 1), { x: 820, y: 520, z: 1.3 }, 3], [FE(A, 1), { x: 760, y: 420, z: 1.55 }, 4], [surge, { x: 1000, y: 540, z: 1.05 }, 2],
      [F(A, 3) + 3, { x: 1060, y: 500, z: 1.2 }, 3], [F(A, 4) + 1, { x: 840, y: 470, z: 1.45 }, 2.5], [DUR(A), { x: 820, y: 460, z: 1.5 }, 4]], u);
    c.fillStyle = "#c9a874"; c.fillRect(0, 0, W, H);
    vista(c, cam, 1); poe(c, L.fundo);
    for (let i = 0; i < 7; i++) chama(c, 400 + (i - 3) * 46, 570, 0.5, u, i);
    const inc = seg(u, 7.0, 8.5);
    fumaca(c, 960, 670, u, 0.6 + inc * 0.8, 5, 640);
    chama(c, 960, 684, 0.55 + inc * 0.4, u, 9);
    // o anjo chega na luz, à direita do altar
    const luz = seg(u, F(A, 2) + 1.2, surge), vai = seg(u, FE(A, 3) + 0.3, FE(A, 3) + 2.4);
    raios(c, 1330, 300, Math.PI * 0.5, 1.4, 900, luz * (1 - vai) * 0.7, u, 8);
    brilho(c, 1330, 520, 600, "#fff3cf", luz * (1 - vai) * 0.7);
    ator(c, "gabriel", [K0({ x: 1360, y: 930, s: 0.92, f: -1, alpha: 0, asa: 0.2, bf: [0.3, 0.4] }), [surge, { alpha: 1, asa: 1 }, 2.2], [F(A, 3) + 0.6, { bf: [1.3, -0.2], cab: 0.05 }, 0.8],
      [F(A, 3) + 5, { bf: [1.6, -0.3] }, 1.2], [FE(A, 3), { bf: [0.5, 0.3] }, 1], [FE(A, 3) + 2.4, { alpha: 0, asa: 0.5 }, 2]], u, u, A, { voz: "gabriel", anda: false });
    poeira(c, 6, 30, u, [1100, 200, 500, 700], "#fff1c4", luz * (1 - vai) * 0.8, 14);
    ator(c, "zacarias", [K0({ x: -120, y: 960, s: 0.96, f: 1, bf: [0.8, 0.7], bt: [0.5, 0.8] }), [6.2, { x: 740 }, 6], [7.4, { bf: [1.2, 0.2], incl: 0.08 }, 1], [9.4, { bf: [0.9, 1.2], bt: [0.7, 1.3], incl: 0, cab: 0.12, olharY: 0.8, sobr: -0.6, sorri: -0.2 }, 1.4],
      [FE(A, 1), { cab: -0.12, olharY: -0.6, bf: [2.0, 0.4], bt: [1.8, 0.4] }, 1.6], [surge - 0.2, { cab: -0.1, olharY: 0, olhar: 1 }, 1], [surge + 0.3, { incl: -0.16, bf: [2.4, 0.9], bt: [2.2, 1.0], sobr: 1, sorri: -0.4 }, 0.4],
      [ajoelha + 0.8, { agacha: 0.85, incl: 0.05, bf: [1.4, 1.2], bt: [1.2, 1.3] }, 0.9], [F(A, 3) + 3, { sobr: 0.4, sorri: 0 }, 1.2],
      [F(A, 4) + 0.6, { bf: [1.2, -0.6], bt: [0.9, -0.4], sobr: -0.8, cab: 0.1, olharY: 0.4 }, 0.8], [F(A, 4) + 2.2, { cab: -0.08 }, 0.5], [F(A, 4) + 2.8, { cab: 0.1 }, 0.5],
      [FE(A, 4) - 1.2, { bf: [1.6, -2.3], bt: [0.6, 1.0], sobr: -1, olhos: 0.8 }, 0.6]], u, u, A);
    c.setTransform(1, 0, 0, 1, 0, 0);
    vista(c, cam, 1.18); poe(c, L.frente);
    c.setTransform(1, 0, 0, 1, 0, 0);
    vela(c, "#f0d8b0", 0.25);
    escuro(c, W / 2, H / 2, 1300, 0.4, "#3a2416");
  },

  patio(c, u, A) {
    const L = camadas("patio");
    const cam = anima([[0, { x: 960, y: 560, z: 1.12 }, 0], [DUR(A), { x: 960, y: 500, z: 1.28 }, DUR(A)]], u);
    c.fillStyle = "#e9e0c8"; c.fillRect(0, 0, W, H);
    vista(c, cam, 1); poe(c, L.fundo);
    ator(c, "zacarias", [K0({ x: 960, y: 822, s: 0.9, f: 1, bf: [1.8, 0.9], bt: [1.6, 1.0], sobr: 0.6 }), [1.6, { bf: [2.4, -0.4], bt: [0.8, 1.6], cab: 0.1 }, 0.5], [2.4, { bf: [1.0, 1.6], bt: [2.3, -0.3], cab: -0.1 }, 0.5],
      [3.3, { bf: [2.6, 1.8], bt: [0.4, 0.4], sobr: 1 }, 0.5], [4.2, { bf: [1.6, -0.6], bt: [1.6, -0.6], sobr: -0.6, cab: 0.06 }, 0.5], [5.2, { bf: [2.2, 0.2], bt: [1.2, 1.2], sobr: 0.4 }, 0.5], [6.3, { bf: [2.8, 1.6], bt: [2.8, 1.6], sobr: 1 }, 0.6], [7.3, { bf: [0.8, 0.9], bt: [0.6, 0.9], sobr: -0.5 }, 0.6]], u, u, A, { anda: false });
    const r = rng(9);
    for (let i = 0; i < 9; i++) {
      const x = 140 + i * 210 + (i % 2) * 40, y = 1180 + (i % 3) * 26, ve = clamp(onda(u, 2.5 + r(), r() * 6));
      figura(c, "povo" + (i % 8), { x, y, s: 0.78, f: x < 960 ? 1 : -1, cab: -0.1 + onda(u, 3 + i * 0.3, i) * 0.06, olharY: -0.8, sobr: 0.3 + ve * 0.5, bf: [0.3 + (i % 3 === 0 ? ve * 1.4 : 0), 0.4], simples: true }, u);
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
  },

  anunciacao(c, u, A) {
    const L = camadas("casaN");
    const luz = seg(u, F(A, 1) - 2.2, F(A, 1) - 0.6), surge = F(A, 1) - 0.4, vai = seg(u, FE(A, 5) + 0.4, FE(A, 5) + 2.4);
    const sim = seg(u, F(A, 5) - 0.6, F(A, 5) + 0.4);
    const cam = anima([[0, { x: 900, y: 560, z: 1.1 }, 0], [F(A, 0) + 6, { x: 820, y: 560, z: 1.2 }, 6], [surge + 0.5, { x: 1040, y: 560, z: 1.05 }, 2.5], [F(A, 2) + 1, { x: 840, y: 520, z: 1.3 }, 2.5],
      [F(A, 3) + 2, { x: 1000, y: 520, z: 1.2 }, 2.5], [F(A, 4) + 0.5, { x: 760, y: 420, z: 1.75 }, 3], [FE(A, 5), { x: 760, y: 430, z: 1.85 }, 4], [DUR(A), { x: 820, y: 360, z: 1.6 }, 2.5]], u);
    c.fillStyle = "#e9dcbc"; c.fillRect(0, 0, W, H);
    vista(c, cam, 0.7); poe(c, L.fora);
    vista(c, cam, 0.7); for (let i = 0; i < 3; i++) { const bx = 1300 + ((u * 40 + i * 140) % 500), by = 360 + i * 30 + onda(u, 1.2, i) * 8; linha(c, [[bx - 10, by - 4], [bx, by], [bx + 10, by - 4]], INK, 2, 0.6); }
    vista(c, cam, 1); poe(c, L.fundo);
    raios(c, 1490, 200, Math.PI * 0.72, 0.9, 1300, luz * (1 - vai * 0.6) * 0.8, u, 7);
    brilho(c, 1300, 520, 620, "#fff4d4", luz * (1 - vai) * 0.6);
    poeira(c, 11, 46, u, [900, 200, 900, 800], "#fff6dc", luz * 0.9, 10);
    const G = ator(c, "gabriel", [K0({ x: 1330, y: 880, s: 0.9, f: -1, alpha: 0, asa: 0.1, bf: [0.4, 0.3] }), [surge + 1.2, { alpha: 1, asa: 1 }, 1.6], [F(A, 1) + 0.2, { bf: [1.4, -0.1] }, 0.9],
      [FE(A, 1) + 0.4, { bf: [0.7, 0.6] }, 1], [F(A, 3) + 0.2, { bf: [1.2, -0.2], bt: [0.6, 0.4] }, 0.9], [F(A, 3) + 4.2, { bf: [1.7, -0.6] }, 1.2], [FE(A, 3), { bf: [0.6, 0.6], bt: [0.2, 0.3], cab: 0.08 }, 1.2],
      [FE(A, 5) + 2.2, { alpha: 0, asa: 1.15 }, 1.8]], u, u, A, { voz: "gabriel", anda: false });
    const P = ator(c, "maria", [K0({ x: 560, y: 900, s: 0.93, f: 1, bf: [0.9, 1.0], bt: [0.8, 1.2], cab: 0.12, olharY: 0.7 }),
      [surge - 1.0, { cab: 0, olharY: 0, olhar: 1 }, 0.8], [surge + 0.3, { x: 520, incl: -0.12, sobr: 1, bf: [0.5, -2.4], bt: [0.4, 0.5], sorri: -0.1 }, 0.5],
      [F(A, 2) + 0.4, { incl: 0, bf: [0.35, -2.6], sobr: -0.9, olharY: 0.8, cab: 0.1, sorri: -0.2 }, 1.2], [F(A, 3) + 1, { olharY: 0, cab: 0, sobr: 0.4, sorri: 0 }, 1.2],
      [F(A, 3) + 5, { x: 600, sobr: 0.1 }, 1.6], [F(A, 4) + 0.3, { olharY: 0.9, cab: 0.14, sobr: -0.6, bf: [1.2, 1.4], bt: [1.0, 1.5] }, 1.4],
      [F(A, 5), { olharY: -0.2, cab: -0.05, sobr: 0.2, sorri: 0.45, bf: [1.3, -0.5], bt: [1.0, -0.4] }, 1.4], [FE(A, 5) + 0.8, { cab: 0.12, olhos: 0.3, bf: [0.35, -2.6], bt: [0.5, -2.4], sorri: 0.6 }, 1.4]], u, u, A, { voz: "maria" });
    brilho(c, P.peito[0], P.peito[1] - 60, 260, "#fff0c8", sim * (1 - vai * 0.3) * 0.45);
    voaOrbe(c, [1240, 520], P.peito, u, FE(A, 5) + 0.3, FE(A, 5) + 2.2, u);
    for (let i = 0; i < 7; i++) { const r = rng(300 + i), k = seg(u, FE(A, 5) + 1 + r(), FE(A, 5) + 4 + r()); if (k > 0 && k < 1) pinta(c, [[0, 0], [16, -6], [30, 0], [16, 5]].map(([a, b]) => [1260 + r() * 200 + Math.sin(k * 8 + i) * 30 + a, 420 + k * 420 + b]), "#fffaf0", { seed: i, hach: 0, larg: 1, alpha: 0.5 * (1 - k) }); }
    c.setTransform(1, 0, 0, 1, 0, 0);
    vela(c, "#f2d6aa", 0.18);
  },

  visitacao(c, u, A) {
    const L = camadas("colinas");
    const chega = F(A, 1) - 0.7;
    const mx = anima([[0, { x: 200 }, 0], [chega - 0.4, { x: 4040 }, chega - 0.4]], u).x;
    const cam = anima([[0, { x: 520, y: 560, z: 1.1 }, 0], [chega - 0.4, { x: 4100, y: 560, z: 1.1 }, chega - 0.4], [chega + 1.2, { x: 4130, y: 540, z: 1.3 }, 1.6], [F(A, 2) + 1, { x: 4100, y: 470, z: 1.45 }, 3], [DUR(A), { x: 4100, y: 420, z: 1.35 }, 3]], u);
    c.setTransform(1, 0, 0, 1, 0, 0);
    ceuPintado(c, 0, 0, W, H, ["#cfdcd4", "#f3e6c6"], 1, 0);
    vista(c, cam, 0.15); poe(c, L.longe);
    vista(c, cam, 0.5); poe(c, L.meio);
    vista(c, cam, 1); poe(c, L.perto);
    const P = ator(c, "maria", [K0({ x: 200, y: 960, s: 0.92, f: 1, bt: [0.2, 0.3], bf: [0.4, 0.5] }), [chega - 0.4, { x: 4040 }, chega - 0.4], [chega + 0.4, { bf: [1.2, 0.5], bt: [1.0, 0.6], incl: 0.06, sorri: 0.6 }, 0.6],
      [F(A, 2), { x: 3940, incl: -0.06, bf: [1.3, 0.3], bt: [1.1, 0.4] }, 1], [F(A, 2) + 1.6, { incl: -0.1, cab: -0.16, bf: [2.6, 0.1], bt: [2.4, 0.1], sorri: 0.8, olhos: 0.5 }, 1.6]], u, u, A, { voz: "maria" });
    const I = ator(c, "isabel", [K0({ x: 4460, y: 960, s: 0.92, f: -1, barriga: 1, alpha: 0 }), [chega - 3.8, { alpha: 1 }, 0.6], [chega - 0.2, { x: 4200, bf: [1.2, 0.5], bt: [1.0, 0.6], sorri: 0.6, sobr: 0.6 }, 2.6],
      [F(A, 1) + 3.2, { bf: [0.25, 0.2], bt: [1.0, 0.6], sobr: 1, sorri: 0.8 }, 0.6], [F(A, 2) + 0.5, { bf: [0.25, 0.2], bt: [0.4, 0.6], sobr: 0.2 }, 1]], u, u, A, { voz: "isabel" });
    const pulo = seg(u, F(A, 1) + 3.0, F(A, 1) + 3.6) * (1 - seg(u, F(A, 1) + 4.2, F(A, 1) + 6));
    brilho(c, I.peito[0] + 30, I.peito[1] + 90, 140, "#fff0c0", pulo * 0.8);
    for (let i = 0; i < 6; i++) { const k = seg(u, F(A, 2) + 1.4 + i * 0.2, F(A, 2) + 4 + i * 0.2), bx = 4000 + i * 60 + k * 300, by = 640 - k * 420 + Math.sin(i) * 30; if (k > 0 && k < 1) linha(c, [[bx - 12, by - 6 + onda(u, 0.3, i) * 6], [bx, by], [bx + 12, by - 6 + onda(u, 0.3, i) * 6]], INK, 2.4, 0.7 * (1 - k)); }
    voaOrbe(c, [4120, 620], P.peito, u, FE(A, 2) + 0.1, FE(A, 2) + 1.8, u);
    vista(c, cam, 1.25); poe(c, L.frente);
    c.setTransform(1, 0, 0, 1, 0, 0);
  },

  joao(c, u, A) {
    const L = camadas("patioZ");
    const esc0 = F(A, 1) - 3.2, esc1 = F(A, 1) - 0.3, volta = F(A, 2) + 1.2;
    const cam = anima([[0, { x: 960, y: 560, z: 1.08 }, 0], [esc0, { x: 1080, y: 560, z: 1.12 }, 2], [esc0 + 1.6, { x: 1290, y: 520, z: 1.85 }, 1.6], [F(A, 2), { x: 1290, y: 520, z: 1.85 }, 0.5], [volta, { x: 1040, y: 520, z: 1.15 }, 1.6], [DUR(A), { x: 1080, y: 470, z: 1.3 }, 4]], u);
    c.fillStyle = "#efe4cc"; c.fillRect(0, 0, W, H);
    vista(c, cam, 1); poe(c, L.fundo);
    figura(c, "povo0", { x: 240, y: 960, s: 0.9, f: 1, bf: [lerp(0.3, 1.6, seg(u, 2, 2.6)) * (1 - seg(u, esc0, esc0 + 1)), -0.1], sobr: u > volta ? 1 : 0.2, fala: u > 2 && u < 4 ? Math.abs(onda(u, 0.3)) * 0.6 : 0 }, u);
    figura(c, "povo3", { x: 420, y: 980, s: 0.92, f: 1, cab: onda(u, 2.6) * 0.04, sobr: u > volta ? 1 : 0, bf: [u > volta ? 2.2 : 0.4, 0.4] }, u);
    ator(c, "isabel", [K0({ x: 700, y: 960, s: 0.92, f: 1, colo: 1, bf: [0.9, 1.3], bt: [0.6, 1.4], olharY: 0.8, cab: 0.12, sorri: 0.6 }), [esc0, { olharY: 0, cab: 0, olhar: 1 }, 1], [volta, { sorri: 0.9, sobr: 0.6 }, 1]], u, u, A);
    const Z = ator(c, "zacarias", [K0({ x: 1180, y: 960, s: 0.94, f: 1, bf: [0.5, 0.5], bt: [0.3, 0.5], sobr: -0.3 }), [esc0, { f: 1, bf: [1.35, 1.35], segura: "tabuinha", cab: 0.16, olharY: 0.9 }, 1.2],
      [volta - 1, { bf: [0.6, 0.8], cab: 0.1 }, 0.8], [volta, { bf: [2.6, 0.3], bt: [2.4, 0.3], cab: -0.14, olharY: -0.8, sobr: 0.8, sorri: 0.8, fala: 0.8, segura: null }, 0.7]], u, u, A);
    if (u > esc0 - 0.4 && u < volta - 0.6) {
      const st = { escrita: seg(u, esc0 + 0.6, esc1) };
      c.save(); c.globalAlpha = seg(u, esc0 - 0.4, esc0 + 0.3) * (1 - seg(u, volta - 1.2, volta - 0.6));
      objeto(c, "tabuinha", [Z.mao[0] - 10, Z.mao[1] - 10], st, u); c.restore();
    }
    if (u > volta) for (let i = 0; i < 5; i++) { // a voz que volta, subindo em fios dourados
      const k = ((u - volta) * 0.35 + i / 5) % 1, x = Z.cabeca[0] + 40 + Math.sin(k * 9 + i) * 40, y = Z.cabeca[1] + 20 - k * 420;
      orbe(c, x, y, 3, u, Math.sin(Math.PI * k) * 0.8 * seg(u, volta, volta + 1));
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
  },

  estrada(c, u, A) {
    const L = camadas("estradaB"), d = DUR(A);
    const ch = F(A, 1) - 1.2, x0 = 200, x1 = 3900;
    const cam = anima([[0, { x: 600, y: 560, z: 1.12 }, 0], [ch, { x: 3950, y: 540, z: 1.12 }, ch], [d, { x: 4120, y: 500, z: 1.3 }, d - ch]], u);
    const k = u / d;
    c.setTransform(1, 0, 0, 1, 0, 0);
    ceuPintado(c, 0, 0, W, H, [mist("#d99a6a", "#1f2c44", k), mist("#f0c890", "#46506a", k), mist("#f2dcb0", "#7a6a6a", k)], 1, 0);
    const sx = lerp(1500, 1700, k), sy = lerp(520, 900, k);
    brilho(c, sx, sy, 400, "#ffd690", 0.5 * (1 - k)); elip(c, sx, sy, 50, 50, rgba("#ffe6b0", 1 - k));
    estrelas(c, 7, 80, [0, 0, W, 600], u, seg(k, 0.5, 1));
    vista(c, cam, 0.15); poe(c, L.longe);
    vista(c, cam, 0.5); poe(c, L.meio);
    vista(c, cam, 1); poe(c, L.perto);
    const jx = anima([[0, { x: x0 }, 0], [ch, { x: x1 }, ch]], u).x;
    const bph = jx / 30;
    burro(c, jx - 260, 960, 0.92, u, { anda: clamp(1 - seg(u, ch - 0.6, ch + 0.2)), passo: bph });
    figura(c, "maria", { x: jx - 300, y: 790 + Math.abs(Math.sin(bph)) * 4, s: 0.86, f: 1, agacha: 0.62, barriga: 1, bf: [0.9, 1.4], bt: [0.6, 1.2], cab: u > ch ? 0.1 : 0, olharY: u > ch ? 0.8 : 0, sobr: u > ch ? -0.6 : 0 }, u);
    ator(c, "jose", [K0({ x: x0, y: 960, s: 0.95, f: 1, bt: [1.2, 0.2], segura: "cajado", bf: [0.4, 0.4] }), [ch, { x: x1 }, ch], [ch + 0.8, { bf: [2.2, 0.6], f: 1, sobr: 0.2 }, 0.6], [ch + 1.6, { bf: [2.2, 1.0] }, 0.3], [ch + 2.0, { bf: [2.2, 0.6] }, 0.3],
      [F(A, 1) + 1.6, { bf: [0.5, 0.4], sobr: -0.8, cab: 0.1 }, 0.8]], u, u, A);
    // a porta da hospedaria se fecha
    const fecha = seg(u, F(A, 1) + 0.6, F(A, 1) + 1.6);
    pinta(c, [[4230, 960], [4230, 790], [4230 + 70 * fecha, 784], [4230 + 70 * fecha, 960]], "#5a4030", { seed: 2, hach: 0, liso: false });
    c.setTransform(1, 0, 0, 1, 0, 0);
    vela(c, mist("#ffffff", "#7a8aaa", k), 0.35 * k);
  },

  manjedoura(c, u, A) {
    const L = camadas("estabulo"), d = DUR(A);
    const deita = F(A, 1) + 1.4;
    const cam = anima([[0, { x: 960, y: 560, z: 1.08 }, 0], [F(A, 1), { x: 900, y: 560, z: 1.2 }, F(A, 1)], [deita + 1.5, { x: 960, y: 600, z: 1.35 }, 2], [F(A, 2) + 2, { x: 990, y: 650, z: 1.9 }, 3.5], [d, { x: 990, y: 650, z: 2.0 }, 2]], u);
    c.fillStyle = "#3e3028"; c.fillRect(0, 0, W, H);
    vista(c, cam, 1);
    poe(c, L.noite); estrelas(c, 21, 40, [1240, 260, 540, 600], u, 1);
    const ex = 1560, ey = 380;
    brilho(c, ex, ey, 200, "#f6efc8", 0.6); orbe(c, ex, ey, 9, u, 1);
    poe(c, L.fundo);
    raios(c, ex, ey, Math.PI * 0.82, 0.25, 900, 0.35, u, 3, "#f6efc8");
    boi(c, 330, 930, 0.9, u);
    burro(c, 1500, 900, 0.75, u, { f: -1 });
    lamparina(c, 640, 600, 1.1, u);
    const bebeNaManj = u > deita;
    if (bebeNaManj) { bebe(c, 990, 800, 1.05, u, { rot: 0 }); brilho(c, 990, 790, 220, "#ffe2a0", 0.45); }
    ator(c, "jose", [K0({ x: 1300, y: 960, s: 0.95, f: -1, segura: "cajado", bf: [0.6, 0.5], sorri: 0.4, olharY: 0.6 }), [deita, { agacha: 0.7, bf: [1.0, 0.8], segura: null }, 1.6]], u, u, A);
    ator(c, "maria", [K0({ x: 700, y: 960, s: 0.95, f: 1, agacha: 0.75, colo: 1, bf: [0.9, 1.3], bt: [0.6, 1.4], cab: 0.14, olharY: 0.9, sorri: 0.5 }),
      [deita - 0.5, { incl: 0.22, bf: [1.4, 0.5], bt: [1.2, 0.6], colo: 1 }, 1.2], [deita, { colo: 0 }, 0.01], [deita + 1.2, { incl: 0.08, bf: [1.2, 1.0], bt: [0.9, 1.2] }, 1]], u, u, A);
    if (!bebeNaManj && u > deita - 1.7) bebe(c, lerp(840, 990, seg(u, deita - 1.7, deita)), lerp(700, 800, seg(u, deita - 1.7, deita)), 1.05, u, { rot: lerp(-0.3, 0, seg(u, deita - 1.7, deita)) });
    c.setTransform(1, 0, 0, 1, 0, 0);
    const [lx, ly] = noMundo(cam, 900, 760);
    escuro(c, lx, ly, 1100, 0.65, "#1a1626");
    brilho(c, lx, ly, 600, "#ffcf7a", 0.2);
  },

  pastores(c, u, A) {
    const L = camadas("campo"), d = DUR(A);
    const acende = FE(A, 0) - 0.9, coro = F(A, 2) - 1.4, saem = FE(A, 2) - 0.4;
    const cam = anima([[0, { x: 900, y: 600, z: 1.25 }, 0], [acende, { x: 860, y: 620, z: 1.32 }, acende], [acende + 1.4, { x: 1000, y: 520, z: 1.05 }, 1.2], [F(A, 1) + 6, { x: 1060, y: 520, z: 1.15 }, 4],
      [coro + 1.6, { x: 1000, y: 260, z: 1.05 }, 2.4], [saem, { x: 1000, y: 300, z: 1.08 }, 3], [d, { x: 1200, y: 520, z: 1.08 }, 2]], u);
    const luz = seg(u, acende - 0.3, acende + 0.6), ceu = seg(u, coro - 0.5, coro + 2);
    c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = "#0f1c30"; c.fillRect(0, 0, W, H);
    vista(c, cam, 0.25); poe(c, L.ceu); estrelas(c, 31, 160, [-M, -700, W + 2 * M, 1100], u, 1 - luz * 0.6);
    brilho(c, 1300, 200, 1200, "#ffe9b0", luz * 0.55 + ceu * 0.2);
    raios(c, 1300, 160, Math.PI * 0.55, 2.2, 1400, luz * 0.55, u, 11, "#fff0c4");
    for (let i = 0; i < 16; i++) { // a multidão de anjos
      const r = rng(400 + i), ax = -100 + r() * 2100, ay = -520 + r() * 520, k = seg(u, coro + r() * 1.6, coro + 1.2 + r() * 1.6);
      if (k > 0) figura(c, "gabriel", { x: ax, y: ay + onda(u, 3 + r(), i) * 14, s: 0.22 + r() * 0.12, f: r() < 0.5 ? 1 : -1, alpha: k * 0.85, bf: [2.4, 0.2], bt: [2.2, 0.2], cab: -0.2, olhos: 0.4, sorri: 0.8, simples: true }, u);
    }
    vista(c, cam, 0.5); poe(c, L.longe); poe(c, L.meio);
    vista(c, cam, 1); poe(c, L.perto);
    // fogueira
    const fx = 760, fy = 940;
    for (let i = 0; i < 5; i++) linha(c, [[fx - 50 + i * 24, fy + 10], [fx - 30 + i * 14, fy - 14]], "#5a3e2a", 8, 1, false);
    chama(c, fx, fy, 2.0, u, 2); chama(c, fx - 22, fy + 4, 1.4, u + 0.3, 3); chama(c, fx + 24, fy + 2, 1.3, u + 0.6, 4);
    for (let i = 0; i < 10; i++) { const k = ((u * 0.6 + i / 10) % 1); elip(c, fx + Math.sin(k * 6 + i) * 30, fy - 40 - k * 260, 2, 2, rgba("#ffd08a", 1 - k)); }
    for (let i = 0; i < 6; i++) { const r = rng(500 + i); ovelha(c, 1100 + i * 140 + r() * 40 + (u > saem ? 0 : 0), 900 + (i % 2) * 70, 0.6 + r() * 0.15, u, { seed: i + 1, f: r() < 0.5 ? 1 : -1, come: luz > 0.5 ? 0 : undefined }); }
    const pula = acende + 0.1;
    const reac = (x, f, nome, sd) => ator(c, nome, [K0({ x, y: 965, s: 0.9, f, agacha: 0.7, bf: [1.2, 1.2], bt: [0.9, 1.3], olharY: 0.7, sorri: 0.3, segura: nome === "pastor1" ? "cajado" : null }),
      [pula, { agacha: 0.15, incl: -0.14, bf: [2.6, 1.9], bt: [2.2, 1.4], cab: -0.2, olharY: -1, sobr: 1, sorri: -0.3 }, 0.35],
      [F(A, 1) + 2.2 + sd, { incl: -0.04, bf: [1.4, 1.2], bt: [1.0, 1.2], sobr: 0.7, sorri: 0.1 }, 1.4],
      [coro + 0.4 + sd * 0.5, { bf: [2.3, 0.3], bt: [2.0, 0.4], cab: -0.24, sorri: 0.8, sobr: 0.6 }, 1.2],
      [saem, { agacha: 0, incl: 0.1, f: 1 }, 0.4], [d, { x: x + 1300 }, d - saem]], u, u, A);
    reac(560, 1, "pastor1", 0); reac(960, -1, "pastor2", 0.3); reac(1180, -1, "pastor3", 0.6);
    ator(c, "gabriel", [K0({ x: 1360, y: 640, s: 0.85, f: -1, alpha: 0, asa: 0.2 }), [acende + 1.2, { alpha: 1, asa: 1, bf: [1.6, -0.2] }, 1.4], [FE(A, 1), { bf: [2.3, 0.1], bt: [2.0, 0.2] }, 1.4], [saem + 1, { alpha: 0 }, 1.6]], u, u, A, { voz: "gabriel", anda: false });
    c.setTransform(1, 0, 0, 1, 0, 0);
    const [lx, ly] = noMundo(cam, fx, fy - 60);
    escuro(c, lx, ly, 900, 0.5 * (1 - luz * 0.8), "#0a1222");
    brilho(c, lx, ly, 380, "#ffb060", 0.25 * (1 - luz * 0.5));
  },

  adoracao(c, u, A) {
    const L = camadas("estabulo"), d = DUR(A);
    const guarda = F(A, 1);
    const cam = anima([[0, { x: 1000, y: 560, z: 1.06 }, 0], [FE(A, 0) - 1, { x: 1060, y: 560, z: 1.12 }, 4], [guarda + 1.5, { x: 800, y: 470, z: 1.95 }, 3], [d, { x: 800, y: 460, z: 2.05 }, 3]], u);
    c.fillStyle = "#3e3028"; c.fillRect(0, 0, W, H);
    vista(c, cam, 1); poe(c, L.noite); estrelas(c, 21, 40, [1240, 260, 540, 600], u, 1);
    brilho(c, 1560, 380, 200, "#f6efc8", 0.6); orbe(c, 1560, 380, 9, u, 1);
    poe(c, L.fundo);
    boi(c, 330, 930, 0.9, u); lamparina(c, 640, 600, 1.1, u);
    bebe(c, 990, 800, 1.05, u); brilho(c, 990, 790, 240, "#ffe2a0", 0.5);
    const conta = (x, nome, sd, f) => ator(c, nome, [K0({ x: 2100 + sd * 120, y: 965, s: 0.88, f: -1 }), [2.6 + sd * 0.4, { x }, 2.4], [3.4 + sd * 0.4, { agacha: 0.75, bf: [1.4, 1.0], bt: [1.0, 1.2], sobr: 0.6, sorri: 0.7, olharY: 0.4 }, 0.8],
      [5 + sd, { bf: [2.2, -0.2], fala: 0.4, olharY: 0, cab: -0.05 }, 0.6], [6.4 + sd, { bf: [1.0, 1.0], fala: 0 }, 0.6], [7.6 + sd * 0.7, { bf: [2.0, 0.4] }, 0.5], [9 + sd * 0.5, { bf: [1.3, 1.1], olharY: 0.6 }, 0.8]], u, u, A);
    conta(1250, "pastor3", 0, -1); conta(1420, "pastor1", 1, -1); conta(1560, "pastor2", 2, -1);
    ator(c, "jose", [K0({ x: 1160, y: 950, s: 0.9, f: -1, sorri: 0.5, olharY: 0.4, bf: [0.6, 0.6] }), [3, { f: 1, olhar: 1 }, 0.8], [guarda, { f: -1, olharY: 0.8 }, 1]], u, u, A);
    const P = ator(c, "maria", [K0({ x: 760, y: 960, s: 0.95, f: 1, agacha: 0.75, bf: [1.2, 1.0], bt: [0.9, 1.2], cab: 0.1, olharY: 0.6, sorri: 0.5 }), [3.2, { olharY: 0, cab: 0, sobr: 0.3 }, 0.8],
      [guarda - 0.6, { olharY: 0.9, cab: 0.16, sobr: 0, sorri: 0.4 }, 1.4], [guarda + 2.6, { bf: [0.35, -2.6], bt: [0.5, -2.4], olhos: 0.55, sorri: 0.6 }, 1.6]], u, u, A);
    for (let i = 0; i < 3; i++) voaOrbe(c, [1300 + i * 160, 620], P.peito, u, guarda + 0.5 + i * 0.7, guarda + 2.6 + i * 0.7, u);
    c.setTransform(1, 0, 0, 1, 0, 0);
    const [lx, ly] = noMundo(cam, 960, 760);
    escuro(c, lx, ly, 1200, 0.6, "#1a1626");
    brilho(c, lx, ly, 640, "#ffcf7a", 0.22);
  },

  simeao(c, u, A) {
    const L = camadas("atrio"), d = DUR(A);
    const pega = F(A, 1) + 0.6, devolve = F(A, 3) - 0.2, espada = F(A, 3) + 3.6;
    const cam = anima([[0, { x: 700, y: 560, z: 1.12 }, 0], [F(A, 0) + 8, { x: 960, y: 560, z: 1.08 }, 8], [pega + 0.8, { x: 1020, y: 470, z: 1.5 }, 2], [F(A, 2) + 1, { x: 1060, y: 420, z: 1.75 }, 2.4],
      [devolve + 0.5, { x: 960, y: 480, z: 1.4 }, 1.8], [espada, { x: 860, y: 440, z: 1.7 }, 2.4], [d, { x: 860, y: 440, z: 1.75 }, 2]], u);
    c.fillStyle = "#efe4cc"; c.fillRect(0, 0, W, H);
    vista(c, cam, 1); poe(c, L.fundo);
    const sol = seg(u, F(A, 2), F(A, 2) + 2) * (1 - seg(u, FE(A, 2) + 0.5, FE(A, 2) + 2));
    raios(c, 1500, -100, Math.PI * 0.62, 0.7, 1400, 0.45 + sol * 0.5, u, 6);
    for (let i = 0; i < 5; i++) { const k = (u * 0.07 + i / 5) % 1; pomba(c, -100 + k * 2200, 220 + Math.sin(k * 12 + i) * 50, 0.9, u, { voa: true, seed: i }); }
    const transf = (a, b) => (u < a ? 1 : u < b ? 1 - seg(u, a, b) : 0);
    const comMaria = u < pega ? 1 : u > devolve + 0.6 ? 1 : 0;
    ator(c, "jose", [K0({ x: -200, y: 960, s: 0.95, f: 1, bf: [1.3, 1.2], bt: [0.4, 0.4] }), [6, { x: 560 }, 6], [pega, { olharY: 0.2, sorri: 0.5 }, 1]], u, u, A);
    const P = ator(c, "maria", [K0({ x: -40, y: 960, s: 0.94, f: 1, colo: 1, bf: [0.9, 1.3], bt: [0.6, 1.4], olharY: 0.6, cab: 0.1, sorri: 0.4 }), [6.6, { x: 800, olharY: 0, cab: 0 }, 6.6],
      [pega - 0.6, { bf: [1.5, 0.6], bt: [1.3, 0.7], incl: 0.08 }, 0.8], [pega, { colo: 0 }, 0.01], [pega + 0.8, { bf: [0.6, 0.9], bt: [0.4, 0.9], incl: 0, sorri: 0.6 }, 0.8],
      [devolve, { bf: [1.5, 0.6], bt: [1.3, 0.7] }, 0.6], [devolve + 0.6, { colo: 1, bf: [0.9, 1.3], bt: [0.6, 1.4] }, 0.01], [espada - 0.6, { sobr: -1, sorri: -0.1, olharY: 0.3 }, 1.2], [espada + 1.8, { bf: [0.35, -2.6], olharY: 0.8, cab: 0.12 }, 1.4]], u, u, A);
    const S = ator(c, "simeao", [K0({ x: 1800, y: 960, s: 0.94, f: -1, incl: 0.16, segura: "cajado", bf: [0.6, 0.4], olharY: 0.3 }), [F(A, 0) + 9, { x: 1080 }, 7],
      [pega - 0.5, { bf: [1.5, 0.6], bt: [1.3, 0.7], segura: null }, 0.8], [pega, { colo: 1 }, 0.01], [pega + 0.8, { bf: [0.9, 1.3], bt: [0.6, 1.4], incl: 0.06, olharY: 0.8, cab: 0.12 }, 0.8],
      [F(A, 2) - 0.2, { cab: -0.26, olharY: -1, olhos: 0.3, sorri: 0.6, incl: -0.04 }, 1.6], [FE(A, 2) + 0.2, { cab: 0.1, olhos: 1, olharY: 0.6 }, 1],
      [devolve, { bf: [1.5, 0.6], bt: [1.3, 0.7] }, 0.6], [devolve + 0.6, { colo: 0, bf: [0.7, 0.8], bt: [0.5, 0.8], olharY: 0, olhar: 1, sobr: -0.5, sorri: 0.2 }, 0.01]], u, u, A, { voz: u > F(A, 2) - 0.1 && u < FE(A, 2) + 0.1 ? "narrador" : null });
    if (u > F(A, 2) && u < FE(A, 2) + 1.5) { const k = seg(u, F(A, 2) + 2, FE(A, 2) + 1.5); elip(c, S.cabeca[0] - 28, S.cabeca[1] + 10 + k * 60, 3, 4.5, rgba("#e8f4ff", Math.sin(Math.PI * k) * 0.9)); }
    brilho(c, S.cabeca[0], S.cabeca[1], 300, "#fff3cf", sol * 0.5);
    voaOrbe(c, [S.peito[0], S.peito[1] + 40], P.peito, u, FE(A, 2) + 0.4, FE(A, 2) + 2.4, u);
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (u > espada - 1) { // a sombra que atravessa
      const k = seg(u, espada - 1, espada + 2.2), x = lerp(-400, W + 400, k);
      c.save(); c.globalCompositeOperation = "multiply";
      const g = c.createLinearGradient(x - 400, 0, x + 400, 0); g.addColorStop(0, "rgba(60,70,90,0)"); g.addColorStop(0.5, "rgba(60,70,90,0.45)"); g.addColorStop(1, "rgba(60,70,90,0)");
      c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
    }
    vela(c, "#f6e6c8", 0.12);
  },

  procura(c, u, A) {
    const L = camadas("jerus"), d = DUR(A);
    const para = F(A, 0) + 9.8, tres = F(A, 2) - 0.6;
    const cam = anima([[0, { x: 700, y: 560, z: 1.1 }, 0], [para, { x: 2500, y: 560, z: 1.1 }, para], [F(A, 1) + 0.6, { x: 2440, y: 470, z: 1.6 }, 1.4], [tres + 0.6, { x: 2300, y: 520, z: 1.05 }, 1.2], [d, { x: 2200, y: 520, z: 1.05 }, 1]], u);
    // três dias: o céu gira três vezes (sol, lua, sol...)
    const dias = seg(u, tres, d - 0.6) * 3, ang = dias * Math.PI * 2, noite = u > tres ? (1 - Math.cos(ang)) / 2 : 0;
    c.setTransform(1, 0, 0, 1, 0, 0);
    ceuPintado(c, 0, 0, W, H, [mist("#c9dcd8", "#1f2c44", noite), mist("#f2e6c6", "#46506a", noite)], 1, 0);
    if (u > tres) {
      const sx = W / 2 + Math.sin(ang) * 900, sy = 820 - Math.cos(ang) * 700, lx = W / 2 - Math.sin(ang) * 900, ly = 820 + Math.cos(ang) * 700;
      elip(c, sx, sy, 46, 46, "#ffe6a8"); brilho(c, sx, sy, 300, "#ffd690", 0.5);
      elip(c, lx, ly, 34, 34, "#eae4cc"); estrelas(c, 41, 80, [0, 0, W, 600], u, noite);
      for (let i = 0; i < Math.floor(dias + 0.05); i++) { c.save(); c.strokeStyle = rgba(INK, 0.7); c.lineWidth = 4; c.lineCap = "round"; tracar(c, [[1640 + i * 34, 120], [1650 + i * 34, 210]], 1, false); c.restore(); }
    } else { elip(c, 1500, 260, 46, 46, "#fff2c8"); brilho(c, 1500, 260, 300, "#ffe6a8", 0.4); }
    vista(c, cam, 0.15); poe(c, L.longe);
    vista(c, cam, 0.5); poe(c, L.meio);
    vista(c, cam, 1); poe(c, L.perto);
    for (let i = 0; i < 9; i++) { // a caravana
      const r = rng(600 + i), x0 = -200 + i * 230, vel = 230 + r() * 30;
      const x = x0 + Math.min(u, tres) * vel + (u > tres ? (u - tres) * vel * 3 : 0);
      if (i === 3) burro(c, x, 960, 0.8, u, { anda: 1, passo: x / 30 });
      else figura(c, "povo" + (i % 8), { x, y: 950 + (i % 3) * 18, s: 0.86, f: 1, andar: 1, passo: x / 32, simples: true, bf: [0.3, 0.3] }, u);
    }
    const vai = anima([[0, { x: 380 }, 0], [para, { x: 2400 }, para]], u).x;
    const busca = u > tres ? 2300 + Math.sin((u - tres) * 1.6) * 380 : vai;
    const fBusca = u > tres ? (Math.cos((u - tres) * 1.6) >= 0 ? 1 : -1) : 1;
    figura(c, "jose", { x: busca - 170, y: 960, s: 0.95, f: u > tres ? fBusca : 1, andar: u < para || u > tres ? 1 : 0, passo: busca / 34, segura: "cajado", sobr: u > F(A, 1) ? -0.7 : 0, olharY: 0 }, u);
    const M = anima([[0, { f: 1, sobr: 0 }, 0], [para - 0.2, { f: -1, sobr: 0.3, cab: -0.05 }, 0.4], [para + 0.8, { f: 1, cab: 0.05 }, 0.4], [F(A, 1), { sobr: -1, bf: [1.6, -2.3], sorri: -0.4, olhos: 1.1 }, 0.5], [tres, { bf: [0.6, 0.6] }, 0.8]], u);
    figura(c, "maria", { ...M, x: busca, y: 960, s: 0.93, f: u > tres ? fBusca : M.f, andar: u < para || u > tres ? 1 : 0, passo: busca / 34 }, u);
    c.setTransform(1, 0, 0, 1, 0, 0);
    vela(c, "#6a7aa0", noite * 0.4);
  },

  doutores(c, u, A) {
    const L = camadas("portico"), d = DUR(A);
    const chega = F(A, 1) - 0.4;
    const cam = anima([[0, { x: 1080, y: 560, z: 1.25 }, 0], [chega - 2, { x: 960, y: 560, z: 1.05 }, 2.5], [F(A, 1) + 1.5, { x: 960, y: 500, z: 1.45 }, 2], [F(A, 3), { x: 1050, y: 520, z: 1.7 }, 2], [F(A, 4), { x: 900, y: 500, z: 1.35 }, 1.6], [d, { x: 880, y: 480, z: 1.45 }, 2]], u);
    c.fillStyle = "#efe4cc"; c.fillRect(0, 0, W, H);
    vista(c, cam, 1); poe(c, L.fundo);
    raios(c, 1300, -100, Math.PI * 0.6, 0.6, 1300, 0.35, u, 5);
    const ouvindo = (x, nome, sd, f) => figura(c, nome, { x, y: 935, s: 0.9, f, agacha: 0.72, segura: sd === 1 ? "rolo" : null, bf: sd === 1 ? [1.2, 0.6] : [1.0, 1.1], bt: [0.8, 1.2],
      incl: 0.08 + onda(u, 4 + sd, sd) * 0.02, cab: Math.max(0, onda(u, 2.2 + sd * 0.3, sd)) * 0.05, sobr: 0.6 + onda(u, 3, sd) * 0.3, sorri: 0.3, olhar: 0.5 }, u);
    ouvindo(720, "doutor1", 0, 1); ouvindo(1440, "doutor2", 1, -1); ouvindo(1640, "doutor3", 2, -1);
    const jFala = u > F(A, 3) && u < FE(A, 3) ? voz(A, "narrador", u) : 0;
    const J = figura(c, "jesus", { ...anima([[0, { x: 1080, y: 935, s: 1, f: -1, agacha: 0.66, bf: [1.4, 0.2], bt: [0.6, 0.8], sorri: 0.4, olhar: 0.3 }, 0], [2.4, { bf: [1.0, 1.0] }, 0.7], [4.2, { bf: [1.6, -0.2], f: 1 }, 0.7],
      [chega, { f: -1, bf: [0.8, 1.0], olharY: -0.3, sobr: 0.4 }, 0.8], [F(A, 3), { bf: [1.4, -0.1], sorri: 0.3, sobr: 0 }, 0.8], [FE(A, 3), { bf: [1.0, 0.9] }, 1]], u), fala: jFala }, u);
    ator(c, "jose", [K0({ x: -200, y: 960, s: 0.95, f: 1, sobr: -0.6 }), [chega - 0.4, { x: 600 }, 4], [chega + 1, { sobr: 0.2, sorri: 0.3 }, 1], [F(A, 4), { f: 1, olhar: 1, sobr: 0.5, sorri: 0 }, 0.8]], u, u, A);
    const P = ator(c, "maria", [K0({ x: -40, y: 960, s: 0.94, f: 1, sobr: -1, incl: 0.1 }), [chega - 0.2, { x: 880, incl: 0.12 }, 3.6], [chega + 0.6, { incl: 0.2, bf: [0.9, 0.4], bt: [0.7, 0.5], sobr: -0.8, sorri: 0.2 }, 0.8],
      [FE(A, 1), { incl: 0.06, bf: [0.8, 0.6], bt: [0.6, 0.7] }, 1], [F(A, 4), { sobr: 0.4, olharY: 0.4, cab: 0.08, incl: 0, bf: [0.35, -2.6], bt: [0.5, -2.4] }, 1.2]], u, u, A, { voz: "maria" });
    voaOrbe(c, [J.cabeca[0], J.cabeca[1]], P.peito, u, F(A, 4) + 0.2, FE(A, 4) + 1.2, u);
    c.setTransform(1, 0, 0, 1, 0, 0);
    vela(c, "#f2e2c2", 0.12);
  },

  crescer(c, u, A) {
    const L = camadas("nazareExt"), d = DUR(A);
    const cam = anima([[0, { x: 900, y: 560, z: 1.08 }, 0], [d, { x: 1000, y: 520, z: 1.22 }, d]], u);
    c.fillStyle = "#e8c090"; c.fillRect(0, 0, W, H);
    vista(c, cam, 1); poe(c, L.ceu);
    const sx = 1400, sy = lerp(420, 640, u / d);
    brilho(c, sx, sy, 500, "#ffd090", 0.45); elip(c, sx, sy, 54, 54, "#ffe6b0");
    poe(c, L.fundo);
    figura(c, "maria", { x: 560, y: 900, s: 0.92, f: 1, bf: [0.9, 1.4], bt: [0.6, 1.4], sorri: 0.7, olharY: 0.2, cab: 0.05 }, u);
    const plaina = onda(u, 1.1);
    figura(c, "jose", { x: 1600, y: 960, s: 0.95, f: -1, incl: 0.14, bf: [1.5 + plaina * 0.25, 0.4 - plaina * 0.2], bt: [1.3 + plaina * 0.25, 0.5], olharY: 0.7, sorri: 0.4 }, u);
    // o menino cresce no mesmo lugar, deixando a silhueta de cada idade
    const k = seg(u, F(A, 0) + 2.5, FE(A, 0) + 1.6);
    for (let i = 0; i < 4; i++) {
      const ki = i / 3;
      if (k > ki + 0.02) { c.save(); c.globalAlpha = 0.22 * (1 - (k - ki)); figura(c, "jesus", { x: 1160, y: 960, s: lerp(1, 1.32, ki), f: 1, bf: [1.2, 0.6], simples: true }, u); c.restore(); }
    }
    c.save(); c.globalAlpha = 1 - seg(k, 0.75, 1);
    figura(c, "jesus", { x: 1160, y: 960, s: lerp(1, 1.32, k), f: 1, bf: [1.3, 0.6], bt: [1.2, 0.6], olharY: 0.4, sorri: 0.4 }, u);
    c.restore();
    if (k > 0.75) { c.save(); c.globalAlpha = seg(k, 0.75, 1); figura(c, "jovem", { x: 1160, y: 960, s: 0.97, f: 1, bf: [1.3, 0.6], bt: [1.2, 0.6], olharY: 0.4, sorri: 0.4, olhar: -0.4 }, u); c.restore(); }
    c.setTransform(1, 0, 0, 1, 0, 0);
    vela(c, "#f0b080", 0.15);
  },

  fecho(c, u, A) {
    const L = camadas("quarto"), d = DUR(A);
    const junta = F(A, 1) + 0.6;
    const cam = anima([[0, { x: 1120, y: 460, z: 1.6 }, 0], [F(A, 1), { x: 1120, y: 520, z: 1.4 }, F(A, 1)], [d, { x: 960, y: 560, z: 1.05 }, d - F(A, 1)]], u);
    c.fillStyle = "#1d2a40"; c.fillRect(0, 0, W, H);
    vista(c, cam, 1);
    ceuPintado(c, 280, 230, 340, 360, ["#14223a", "#2c4058"], 1, 0);
    estrelas(c, 3, 40, [286, 236, 328, 348], u, 1);
    elip(c, 520, 320, 22, 22, "#e9e2c4"); elip(c, 532, 312, 20, 20, "#22344c");
    poe(c, L.fundo);
    const fecha = seg(u, junta + 1.2, junta + 2.6);
    const P = figura(c, "mariaVelha", { x: 1170, y: 958, s: 0.98, f: -1, agacha: 0.72, cab: 0.04 - fecha * 0.06, olharY: lerp(-0.6, 0.5, seg(u, junta, junta + 1.4)), olhar: -0.4,
      bf: [lerp(1.3, 0.35, fecha), lerp(1.1, -2.6, fecha)], bt: [lerp(1.0, 0.5, fecha), lerp(1.2, -2.4, fecha)], sorri: 0.4 + fecha * 0.4, olhos: 1 - fecha * 0.6 }, u);
    lamparina(c, 760, 690, 1.3, u);
    // as lembranças voltam, uma a cada imagem dita, e se juntam nas mãos dela
    const tempos = [F(A, 0) + 2.6, F(A, 0) + 4.2, F(A, 0) + 5.8, F(A, 0) + 7.6, F(A, 0) + 0.6];
    tempos.forEach((t0, i) => {
      const a = (i / 5) * Math.PI * 2 + u * 0.35, rx = 300, ry = 160;
      const livre = [P.cabeca[0] + Math.cos(a) * rx, P.cabeca[1] - 60 + Math.sin(a) * ry], k = seg(u, junta, junta + 1.6 + i * 0.15);
      const x = lerp(livre[0], P.mao[0], ease(k)), y = lerp(livre[1], P.mao[1] - 20, ease(k));
      orbe(c, x, y, 7, u + i, seg(u, t0, t0 + 0.8) * (1 - seg(u, junta + 1.6, junta + 2.4)));
    });
    brilho(c, P.peito[0], P.peito[1], 300, "#ffe0a0", 0.32 * seg(u, junta + 1.4, junta + 2.6));
    c.setTransform(1, 0, 0, 1, 0, 0);
    const [lx, ly] = noMundo(cam, 900, 640);
    escuro(c, lx, ly, 1100, 0.78);
    brilho(c, lx, ly, 560, "#ffcf7a", 0.3);
    poeira(c, 4, 26, u, [0, 0, W, H], "#ffe3a8", 0.35, 6);
  },
};
