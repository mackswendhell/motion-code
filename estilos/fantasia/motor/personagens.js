// Elenco da Fantasia: cabeça grande, olhos pretos com brilho, contorno escuro, cor lisa.
// Cada função desenha com a origem nos pés (y para cima é negativo); s = escala, o = opções de pose e rosto.

const PELE = "#f6d6b4", PELE_SOMBRA = "#e3b994";
const ELENCO = {
  bilbo: { cabelo: "#8a5a2e", camisa: "#f3ece0", colete: "#c8342c", calca: "#7a5a3a", botao: "#f2c14e" },
  frodo: { cabelo: "#3a2a24", camisa: "#efe7d6", colete: "#3f5f8a", calca: "#5a4a3a", botao: "#c9b27a", mochila: true },
  sam: { cabelo: "#d9a441", camisa: "#efe2c4", colete: "#c9822e", calca: "#6d5a3c", botao: "#7a4a1e", mochila: true },
  bilboVelho: { cabelo: "#d8d4cc", camisa: "#f3ece0", colete: "#c8342c", calca: "#7a5a3a", botao: "#f2c14e" },
  rei: { cabelo: "#5a3a24", camisa: "#3f5f8a", colete: "#3f5f8a", calca: "#384a6a", botao: "#c9b27a", humano: true, barba: true, elmo: true, capa: "#b8322c" },
};

function tubo(g, a, b, larg, cor) {
  g.lineCap = "round";
  g.strokeStyle = LINHA; g.lineWidth = larg + 7; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke();
  g.strokeStyle = cor; g.lineWidth = larg; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke();
}
function olhos(g, dx, o) {
  for (const l of [-1, 1]) {
    const x = l * 22 + dx;
    if (o.olhos === "fechado") {
      g.strokeStyle = LINHA; g.lineWidth = 4; g.lineCap = "round";
      g.beginPath(); g.arc(x, 2, 11, 0.2, Math.PI - 0.2); g.stroke();
    } else {
      const ry = o.olhos === "baixo" ? 11 : 16;
      elipse(g, x, o.olhos === "baixo" ? 8 : 2, 12, ry, LINHA);
      elipse(g, x - 4, o.olhos === "baixo" ? 4 : -5, 4.5, 4.5, "#fff");
      elipse(g, x + 4, 9, 2, 2, "rgba(255,255,255,0.7)");
    }
  }
  if (o.sobrancelha) { // "triste" ou "brava"
    g.strokeStyle = LINHA; g.lineWidth = 4; g.lineCap = "round";
    const k = o.sobrancelha === "triste" ? 1 : -1;
    for (const l of [-1, 1]) { g.beginPath(); g.moveTo(l * 12 + dx, -20 - k * 5); g.lineTo(l * 32 + dx, -20 + k * 5); g.stroke(); }
  }
}
function boca(g, dx, tipo) {
  g.strokeStyle = LINHA; g.lineWidth = 3.5; g.lineCap = "round";
  const y = 38;
  if (tipo === "o") elipse(g, dx, y + 2, 6, 8, "#5a2422", 2.5);
  else if (tipo === "aberta") { g.beginPath(); g.ellipse(dx, y, 13, 10, 0, 0, Math.PI); g.closePath(); g.fillStyle = "#5a2422"; g.fill(); g.stroke(); }
  else if (tipo === "sorriso") { g.beginPath(); g.arc(dx, y - 8, 12, 0.35, Math.PI - 0.35); g.stroke(); }
  else if (tipo === "triste") { g.beginPath(); g.arc(dx, y + 10, 10, Math.PI + 0.5, -0.5); g.stroke(); }
  else if (tipo === "dor") { g.beginPath(); g.moveTo(dx - 12, y); for (let i = 1; i <= 4; i++) g.lineTo(dx - 12 + i * 6, y + (i % 2 ? -3 : 3)); g.stroke(); }
  else { g.beginPath(); g.moveTo(dx - 7, y); g.lineTo(dx + 7, y); g.stroke(); }
}
function cabeca(g, x, y, c, o) {
  g.save(); g.translate(x, y);
  const dx = (o.olhar || 0) * 8;
  for (const l of [-1, 1]) { // orelhas pontudas dos hobbits, redondas no humano
    const pts = c.humano ? [[l * 54, -8], [l * 66, 2], [l * 54, 16]] : [[l * 52, -12], [l * 84, -42], [l * 58, 16]];
    poli(g, pts, PELE, 3.5);
  }
  elipse(g, 0, 0, 62, 62, PELE, 3.5);
  elipse(g, dx - 34, 22, 9, 6, "rgba(230,120,110,0.35)"); elipse(g, dx + 34, 22, 9, 6, "rgba(230,120,110,0.35)");
  if (c.barba) {
    g.beginPath(); g.moveTo(-58, 10); g.quadraticCurveTo(-50, 80, 0, 92); g.quadraticCurveTo(50, 80, 58, 10); g.quadraticCurveTo(30, 40, 0, 46); g.quadraticCurveTo(-30, 40, -58, 10);
    g.fillStyle = c.cabelo; g.fill(); g.lineWidth = 3.5; g.strokeStyle = LINHA; g.stroke();
  }
  olhos(g, dx, o);
  elipse(g, dx, 20, 7, 5, PELE_SOMBRA, 2);
  boca(g, dx, o.boca);
  if (c.elmo) {
    g.beginPath(); g.moveTo(-64, -6); g.quadraticCurveTo(-62, -70, 0, -96); g.quadraticCurveTo(62, -70, 64, -6); g.closePath();
    g.fillStyle = "#c9ccd2"; g.fill(); g.lineWidth = 3.5; g.strokeStyle = LINHA; g.stroke();
    poli(g, [[-6, -94], [0, -122], [6, -94]], "#c9ccd2", 3);
    g.fillStyle = "#8d9099"; g.fillRect(-64, -16, 128, 10); g.strokeRect(-64, -16, 128, 10);
  } else { // cachos: bolinhas por cima da cabeça
    const r = rng(c.cabelo.length * 7 + 3);
    for (let i = 0; i <= 16; i++) {
      const a = Math.PI * (1.05 + i / 16 * 0.9), rr = 56 + r() * 6;
      elipse(g, Math.cos(a) * rr, Math.sin(a) * rr + 4, 17 + r() * 5, 16 + r() * 4, c.cabelo, 3);
    }
    elipse(g, 0, -38, 44, 22, c.cabelo);
  }
  g.restore();
}
// pessoa (hobbit ou humano): o = { vira, passo (fase da caminhada ou null), bracos [esq, dir] em rad (0 = para baixo, + para a frente),
// olhos, boca, olhar, sobrancelha, sentado, ajoelhado, segura (função que desenha na mão direita) }
function pessoa(g, x, y, s, nome, o = {}) {
  const c = ELENCO[nome], h = c.humano ? 1.35 : 1;
  g.save(); g.translate(x, y); g.scale(s * (o.vira || 1), s);
  const desce = o.sentado ? 48 : o.ajoelhado ? 62 : 0;
  const quadril = -95 * h + desce, ombro = -200 * h + desce, cab = -268 * h + desce;
  if (c.capa) poli(g, [[-48, ombro], [48, ombro], [70, -10], [-70, -10]], c.capa, 3.5);
  if (c.mochila) { forma(g, [[-62, ombro + 6], [-10, ombro], [-10, quadril - 4], [-66, quadril]], "#8a6a44", "#b08a5a", 4, 0, 3.5); elipse(g, -40, ombro - 6, 26, 12, "#d9cbb0", 3); }
  // pernas e pés
  const p = o.passo;
  for (const l of [-1, 1]) {
    const bal = p == null ? 0 : Math.sin(p + (l > 0 ? Math.PI : 0)), lev = p == null ? 0 : Math.max(0, Math.cos(p + (l > 0 ? Math.PI : 0))) * 10;
    const pe = o.sentado ? [l * 30, -6] : o.ajoelhado ? [l * 34, -4] : [l * 18 + bal * 26, -6 - lev];
    if (o.ajoelhado) { tubo(g, [l * 18, quadril], [l * 30, -16], 28, c.calca); }
    else if (o.sentado) { tubo(g, [l * 20, quadril], [l * 28, quadril + 14], 30, c.calca); tubo(g, [l * 28, quadril + 14], [l * 30, -18], 26, c.calca); }
    else tubo(g, [l * 16, quadril], [pe[0] * 0.9, pe[1] - 14], 28, c.calca);
    g.save(); g.translate(pe[0] + 10, pe[1]);
    elipse(g, 0, 0, 28, 12, PELE, 3.5);
    g.strokeStyle = c.cabelo; g.lineWidth = 2.5;
    for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(-6 + k * 8, -8); g.lineTo(-2 + k * 8, -15); g.stroke(); }
    g.restore();
  }
  // tronco
  const t = [[-46, ombro], [46, ombro], [56, ombro + 80 * h], [48, quadril + 8], [-48, quadril + 8], [-56, ombro + 80 * h]];
  forma(g, t, c.camisa, "#ffffff", -4, 0, 3.5);
  forma(g, [[-40, ombro + 10], [-8, ombro + 22], [-6, quadril + 4], [-46, quadril + 4], [-52, ombro + 80 * h]], c.colete, null, 0, 0, 3);
  forma(g, [[40, ombro + 10], [8, ombro + 22], [6, quadril + 4], [46, quadril + 4], [52, ombro + 80 * h]], c.colete, null, 0, 0, 3);
  for (let k = 0; k < 3; k++) elipse(g, 14, ombro + 40 + k * 22 * h, 4, 4, c.botao, 1.5);
  // braços
  const [ae, ad] = o.bracos || [-0.15, 0.15];
  const mao = [];
  for (const [l, a] of [[-1, ae], [1, ad]]) {
    const ox = l * 48, oy = ombro + 14, comp = 92 * h; // ângulo + gira o braço para a frente (para onde ele olha)
    const hx = ox + l * 6 + Math.sin(a) * comp, hy = oy + Math.cos(a) * comp;
    tubo(g, [ox, oy], [hx, hy], 24, c.camisa);
    elipse(g, hx, hy, 13, 13, PELE, 3);
    mao.push([hx, hy]);
  }
  if (o.segura) o.segura(g, mao[1][0], mao[1][1], mao[0]);
  cabeca(g, 0, cab, c, o);
  g.restore();
}

// Gollum: o = { pose: "agachado" | "danca", fase, olhos: "aberto"|"fechado"|"feliz", boca, anel, inclina }
function gollum(g, x, y, s, o = {}) {
  const PG = "#c5cda6", SG = "#9aa47f", f = o.fase || 0;
  g.save(); g.translate(x, y); g.scale(s * (o.vira || 1), s); g.rotate(o.inclina || 0);
  const membro = (a, b, w = 14) => tubo(g, a, b, w, PG);
  let cab, maoE, maoD;
  if (o.pose === "danca") {
    const pula = Math.abs(Math.sin(f * 2)) * 30, jL = Math.sin(f * 2) * 0.5;
    g.translate(0, -pula);
    membro([-10, -150], [-30 + jL * 30, -80]); membro([-30 + jL * 30, -80], [-34, -4]);
    membro([10, -150], [34 - jL * 30, -80]); membro([34 - jL * 30, -80], [40, -4]);
    elipse(g, -40, -2, 22, 8, PG, 3); elipse(g, 46, -2, 22, 8, PG, 3);
    forma(g, [[-32, -250], [32, -250], [36, -170], [22, -140], [-22, -140], [-36, -170]], PG, "#e3e8cc", -4, 0, 3.5);
    poli(g, [[-24, -158], [24, -158], [18, -128], [-18, -128]], "#6b5a3e", 3);
    g.strokeStyle = SG; g.lineWidth = 2.5; for (const yy of [-225, -210, -195]) { g.beginPath(); g.moveTo(-20, yy); g.quadraticCurveTo(0, yy + 5, 20, yy); g.stroke(); }
    maoE = [-70 + Math.sin(f * 4) * 10, -330]; maoD = [64, -340 + Math.cos(f * 4) * 10];
    membro([-28, -240], [-60, -290]); membro([-60, -290], maoE);
    membro([28, -240], [56, -290]); membro([56, -290], maoD);
    cab = [0, -305];
  } else {
    membro([-20, -60], [-46, -100]); membro([-46, -100], [-50, -6]);
    membro([20, -60], [44, -100]); membro([44, -100], [52, -6]);
    elipse(g, -56, -3, 24, 8, PG, 3); elipse(g, 60, -3, 24, 8, PG, 3);
    g.save(); g.rotate(0.15);
    forma(g, [[-34, -160], [30, -160], [40, -100], [26, -50], [-26, -50], [-40, -100]], PG, "#e3e8cc", -4, 0, 3.5);
    poli(g, [[-26, -66], [26, -66], [22, -42], [-22, -42]], "#6b5a3e", 3);
    g.restore();
    maoE = [-12, -120]; maoD = [16, -116];
    membro([-28, -150], [-52, -110]); membro([-52, -110], maoE);
    membro([30, -148], [50, -104]); membro([50, -104], maoD);
    cab = [14, -210];
  }
  for (const m of [maoE, maoD]) elipse(g, m[0], m[1], 12, 11, PG, 3);
  if (o.anel) {
    const m = o.pose === "danca" ? maoD : [(maoE[0] + maoD[0]) / 2, (maoE[1] + maoD[1]) / 2 - 12];
    brilho(g, m[0], m[1] - 10, 50, "rgba(255,210,110,1)", 0.8);
    elipse(g, m[0], m[1] - 10, 13, 13, "#f2b440", 3); elipse(g, m[0], m[1] - 10, 7, 7, PG);
  }
  // cabeça: careca, orelhas compridas, olhos enormes
  g.save(); g.translate(...cab);
  for (const l of [-1, 1]) poli(g, [[l * 40, -16], [l * 104, -2], [l * 44, 18]], PG, 3.5);
  elipse(g, 0, 0, 56, 52, PG, 3.5);
  g.strokeStyle = LINHA; g.lineWidth = 2;
  for (const k of [-1, 0, 1]) { g.beginPath(); g.moveTo(k * 10, -50); g.quadraticCurveTo(k * 18 + 6, -70, k * 26 + 10, -64); g.stroke(); }
  for (const l of [-1, 1]) {
    if (o.olhos === "fechado" || o.olhos === "feliz") {
      g.strokeStyle = LINHA; g.lineWidth = 4; g.beginPath();
      if (o.olhos === "feliz") g.arc(l * 22, 4, 12, Math.PI + 0.3, -0.3); else g.arc(l * 22, 0, 12, 0.3, Math.PI - 0.3);
      g.stroke();
    } else {
      elipse(g, l * 22, -2, 18, 21, "#f4f6ea", 3);
      elipse(g, l * 22 + 3, 0, 10, 12, "#5e8fa0"); elipse(g, l * 22 + 3, 1, 5, 6, LINHA); elipse(g, l * 22, -6, 3.5, 3.5, "#fff");
    }
  }
  if (o.boca === "aberta") { g.beginPath(); g.ellipse(0, 28, 16, 10, 0, 0, Math.PI); g.closePath(); g.fillStyle = "#4a2a2a"; g.fill(); g.lineWidth = 3; g.strokeStyle = LINHA; g.stroke(); g.fillStyle = "#fff"; g.fillRect(-8, 28, 6, 5); g.fillRect(4, 28, 6, 5); }
  else { g.strokeStyle = LINHA; g.lineWidth = 3; g.beginPath(); g.moveTo(-14, 28); g.quadraticCurveTo(0, o.olhos === "feliz" ? 36 : 30, 14, 28); g.stroke(); }
  g.restore();
  g.restore();
}

// águia de lado, virada para a esquerda; t = tempo (bate as asas)
function aguia(g, x, y, s, t, passageiros) {
  const MAR = "#8a5a2b", CLARO = "#b07a40", ESC = "#5e3a1c";
  const bat = Math.sin(t * 3.2);
  g.save(); g.translate(x, y); g.scale(s, s);
  const asa = (ang, cor, luz, dx = 0) => { // asa larga com penas na ponta; ang 0 = erguida, + = desce para trás
    g.save(); g.translate(20 + dx, -40); g.rotate(ang);
    forma(g, [[-30, 0], [10, -70], [80, -170], [180, -250], [225, -245], [205, -212], [250, -205], [222, -172], [255, -160], [218, -132], [240, -108], [185, -98], [120, -50], [70, 10]], cor, luz, 0, 6, 3.5);
    g.strokeStyle = "rgba(40,20,10,0.45)"; g.lineWidth = 2.5;
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(40 + k * 30, -40 - k * 30); g.lineTo(110 + k * 30, -90 - k * 32); g.stroke(); }
    g.restore();
  };
  asa(0.25 + bat * 0.55, ESC, "#7a4e26", 30);
  forma(g, [[-150, -10], [-60, -60], [80, -55], [170, -30], [260, -40], [250, 0], [270, 30], [160, 30], [40, 50], [-90, 40]], MAR, CLARO, 0, -6, 3.5);
  g.strokeStyle = ESC; g.lineWidth = 2.5;
  for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(-40 + k * 40, -30); g.quadraticCurveTo(-25 + k * 40, -10, -40 + k * 40, 10); g.stroke(); }
  // cabeça e bico
  forma(g, [[-120, -30], [-190, -70], [-235, -60], [-250, -30], [-220, 0], [-150, 20]], "#a06a34", "#c58a4c", 0, -5, 3.5);
  poli(g, [[-240, -52], [-285, -40], [-292, -18], [-276, -22], [-262, -12], [-236, -16]], "#f2b43a", 3);
  elipse(g, -215, -45, 7, 7, LINHA); elipse(g, -217, -47, 2.5, 2.5, "#fff");
  if (passageiros) passageiros(g);
  asa(0.15 + bat * 0.65, MAR, CLARO);
  g.restore();
}
