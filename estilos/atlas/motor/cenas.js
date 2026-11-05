// Atlas: atlas científico ilustrado. Cada fase é uma faixa de papel rasgado com cor própria; um fio trançado amarelo
// percorre as etiquetas do fluxograma; o caminho errado é um fio vermelho. Fecho num painel escuro com o resumo.
// Cenas: abertura (papel claro com tecido de células e legenda), faixa (uma fase), resumo (painel escuro).

const A = { papel: "#f4efe2", tinta: "#3b362c", fio: "#e2b93b", erro: "#c8432b", etiqueta: "#fbf8f1", borda: "#9a937f" };
const FAIXA = { salvia: "#cfdcc6", areia: "#d8b98f", ameixa: "#3c3150", noite: "#1f2a44", rosa: "#e9c9c4", cobre: "#c88a5a", creme: "#efe6d4" };
const escuro = (cor) => ["#3c3150", "#1f2a44"].includes(cor);

function aEtiqueta(c, x, y, linhas, k, { erro = false, tam = 30 } = {}) {
  if (k <= 0) return;
  c.save(); c.translate(x, y); c.scale(k, k);
  c.font = `500 ${tam}px ${MONO}`; const w = Math.max(...linhas.map((l) => c.measureText(l).width)) + tam * 1.4, h = linhas.length * tam * 1.25 + tam;
  c.shadowColor = "rgba(0,0,0,.2)"; c.shadowBlur = 10; c.shadowOffsetY = 3; c.fillStyle = A.etiqueta; c.fillRect(-w / 2, -h / 2, w, h); c.shadowColor = "transparent";
  c.strokeStyle = A.borda; c.lineWidth = 2; c.strokeRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12);
  if (erro) { c.fillStyle = A.erro; c.fillRect(-w / 2 + 12, -h / 2 + 12, 7, h - 24); }
  linhas.forEach((l, i) => texto(c, l, 0, -h / 2 + tam * 1.1 + i * tam * 1.25, { tam, fonte: MONO, peso: 500, cor: A.tinta }));
  c.restore();
}
function aNota(c, s, x, y, cor, alpha, alinha = "left") { texto(c, s, x, y, { tam: 26, fonte: MONO, peso: 400, alinha, cor, alpha }); }
function aFio(c, pts, k, cor = A.fio, larg = 14) {
  c.save(); c.lineCap = "round"; c.lineJoin = "round";
  c.strokeStyle = cor; c.lineWidth = larg; c.setLineDash([16, 9]); tracar(c, pts, k, false);
  c.setLineDash([]); c.strokeStyle = "rgba(90,60,10,.45)"; c.lineWidth = 3; tracar(c, pts, k, false); c.restore();
}
function aCelula(c, x, y, r, t, i, noite) {
  const rr2 = r * (1 + 0.04 * Math.sin(t * 2 + i));
  c.fillStyle = noite ? "rgba(230,140,170,.8)" : "rgba(232,160,170,.6)"; c.beginPath(); c.ellipse(x, y, rr2 * 1.25, rr2, i, 0, 7); c.fill();
  c.strokeStyle = noite ? "#f1d9e2" : "#7a4a52"; c.lineWidth = 3; c.stroke();
  c.fillStyle = "#8a6fb3"; c.beginPath(); c.arc(x + rr2 * 0.1, y, rr2 * 0.42, 0, 7); c.fill();
  c.fillStyle = "rgba(200,60,70,.6)"; for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(x + Math.cos(k * 1.7 + i) * rr2 * 0.75, y + Math.sin(k * 1.7 + i) * rr2 * 0.6, rr2 * 0.16, rr2 * 0.07, k, 0, 7); c.fill(); }
}
function aDna(c, x0, y0, w, t, alpha) {
  c.save(); c.globalAlpha = alpha;
  for (let i = 0; i < 40; i++) { const x = x0 + (i / 39) * w, f = Math.sin(i * 0.5 + t * 2), y1 = y0 + f * 40, y2 = y0 - f * 40;
    c.strokeStyle = ["#e0796a", "#e9b949", "#6a9bcc", "#8fb07a"][i % 4]; c.lineWidth = 6; c.beginPath(); c.moveTo(x, y1); c.lineTo(x, y2); c.stroke();
    c.fillStyle = "#6b4a8c"; c.beginPath(); c.arc(x, y1, 7, 0, 7); c.arc(x, y2, 7, 0, 7); c.fill(); }
  c.restore();
}

const CENAS = {
  abertura(c, u, d, W, H, a) {
    const tl = a.tela || {};
    fundo(c, W, H, A.papel, { grao: 0.18, vinheta: 0.15 });
    (tl.linhas || []).forEach((s, i) => texto(c, digita(s, fase(u, 0.2 + i * 0.4, 0.8 + i * 0.4)), 70, 90 + i * 46, { tam: 30, fonte: MONO, peso: 400, alinha: "left", cor: A.tinta }));
    (tl.legenda || []).forEach(([cor, s], i) => { const y = 120 + ((tl.linhas || []).length) * 46 + i * 40; aFio(c, [[70, y], [160, y]], fase(u, 1.2, 1.6), cor === "erro" ? A.erro : A.fio, 10); aNota(c, s, 190, y, A.tinta, fase(u, 1.4, 1.8)); });
    const y0 = H * 0.55, r = rng(2);
    caminho(c, retRasgado(-20, y0, W + 40, H, 8, 4)); c.fillStyle = "#f2d9df"; c.fill();
    for (let yy = y0 + 40; yy < H + 60; yy += 78) for (let xx = (yy / 78) % 2 ? 0 : 39; xx < W + 60; xx += 78) {
      const rr2 = 30 + r() * 6; c.fillStyle = r() < 0.5 ? "#e7a9bb" : "#efc79f"; c.strokeStyle = "#a86b7a"; c.lineWidth = 2;
      c.beginPath(); c.ellipse(xx + r() * 8, yy + r() * 8, rr2 * 1.1, rr2, r(), 0, 7); c.fill(); c.stroke(); c.fillStyle = "#9b6fb0"; c.beginPath(); c.arc(xx, yy, 10, 0, 7); c.fill(); }
    const k = fase(u, 1.8, 2.4); c.strokeStyle = A.fio; c.lineWidth = 8; c.globalAlpha = k; c.beginPath(); c.arc(W / 2, y0 + 270, 48, 0, 7); c.stroke(); c.globalAlpha = 1;
  },
  faixa(c, u, d, W, H, a) {
    const tl = a.tela || {}, cor = FAIXA[tl.cor] || tl.cor || FAIXA.salvia, noite = escuro(cor), notaCor = noite ? "#e8e0f0" : "#4b4636";
    const cam = 60 * (u / d);
    c.fillStyle = mistura(cor, "#000000", 0.08); c.fillRect(0, 0, W, H);
    c.save(); c.translate(0, -cam);
    caminho(c, retRasgado(-20, -20, W + 40, H + 120, 10, (tl.titulo || "").length)); c.fillStyle = cor; c.fill();
    c.save(); c.globalAlpha = 0.16; c.globalCompositeOperation = "multiply"; c.fillStyle = padraoGrao(c); c.fill(); c.restore();
    if (tl.grade) { c.strokeStyle = noite ? "rgba(255,255,255,.08)" : "rgba(60,80,110,.15)"; c.lineWidth = 1.5; for (let x = 0; x < W; x += 36) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H + 100); c.stroke(); } for (let y = 0; y < H + 100; y += 36) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } }
    const des = tl.desenho || "celulas";
    if (des === "celulas" || des === "divisao") [[W * 0.2, H * 0.3, 90], [W * 0.82, H * 0.24, 70], [W * 0.78, H * 0.72, 60]].forEach(([x, y, r], i) => {
      if (des === "divisao" && i === 0) { const s = sai(fase(u, 0.6, d - 0.5)) * 70; aCelula(c, x - s, y, r * 0.8, u, i, noite); aCelula(c, x + s, y, r * 0.8, u, i + 1, noite); } else aCelula(c, x, y, r, u, i, noite); });
    if (des === "dna") aDna(c, W * 0.08, H * 0.2, W * 0.84, u, 0.9);
    const ca = tl.certo || [], er = tl.errado || [];
    const fio = [[W * 0.5, -40], [W * 0.5, H * 0.18], ...ca.map((_, i) => [W * 0.5 + (i % 2 ? 40 : -40), H * (0.38 + i * 0.22)]), [W * 0.5, H + 120]];
    aFio(c, fio, sai(fase(u, 0.1, d * 0.8)));
    if (er.length) aFio(c, [[W * 0.5, H * 0.18], [W * 0.75, H * 0.32], [W * 0.82, H * 0.62]], fase(u, d * 0.4, d * 0.8), A.erro, 10);
    aEtiqueta(c, W / 2, H * 0.18, (tl.titulo || "").split("\n"), entra(u, 0.15, 0.35), { tam: 36 });
    ca.forEach((s, i) => aEtiqueta(c, W * 0.5 + (i % 2 ? 40 : -40), H * (0.38 + i * 0.22), s.split("\n"), entra(u, 0.5 + i * 0.5, 0.3), { tam: 28 }));
    er.forEach((s, i) => aEtiqueta(c, W * 0.82, H * (0.62 + i * 0.16), s.split("\n"), entra(u, d * 0.6 + i * 0.3, 0.3), { tam: 26, erro: true }));
    (tl.notas || []).forEach((s, i) => aNota(c, s, i % 2 ? W - 60 : 60, H * (0.5 + i * 0.12), notaCor, fase(u, 0.8 + i * 0.4, 1.2 + i * 0.4), i % 2 ? "right" : "left"));
    if (tl.fase) texto(c, tl.fase, 60, H - 140, { tam: 64, fonte: SANS, peso: 300, alinha: "left", cor: noite ? "#f0eaf5" : A.tinta, alpha: fase(u, 0.3, 0.8) });
    c.restore();
  },
  resumo(c, u, d, W, H, a) {
    const tl = a.tela || {};
    fundo(c, W, H, "#1f2a44", { grao: 0.2, vinheta: 0.3 });
    caminho(c, retRasgado(-20, -40, W + 40, 90, 8, 3)); c.fillStyle = "#cfdcc6"; c.fill();
    texto(c, tl.titulo || "O que vimos", 70, 170, { tam: 54, fonte: SANS, peso: 400, alinha: "left", cor: "#f0eee6", alpha: fase(u, 0.1, 0.5) });
    (tl.itens || []).forEach((s, i) => { const k = fase(u, 0.4 + i * 0.35, 0.7 + i * 0.35);
      c.fillStyle = i === (tl.destaque ?? -1) ? A.erro : A.fio; c.globalAlpha = k; c.beginPath(); c.arc(84, 270 + i * 74, 9, 0, 7); c.fill(); c.globalAlpha = 1;
      texto(c, s, 110, 270 + i * 74, { tam: 32, fonte: MONO, peso: 400, alinha: "left", cor: "#e9e6dd", alpha: k, larg: W - 420 }); });
    const cx = W - 180, cy = 300, cores = ["#cfdcc6", "#d8b98f", "#6a9bcc", "#8e7cc3"], g = fase(u, 0.3, 1.5);
    let ini = -Math.PI / 2; [0.45, 0.3, 0.15, 0.1].forEach((p, i) => { c.strokeStyle = cores[i]; c.lineWidth = 34; c.beginPath(); c.arc(cx, cy, 100, ini, ini + p * Math.PI * 2 * g - 0.04); c.stroke(); ini += p * Math.PI * 2 * g; });
    texto(c, "um ciclo", cx, cy, { tam: 26, fonte: MONO, cor: "#e9e6dd" });
  },
};
CENAS.padrao = CENAS.faixa;
const FUNDE = 0.45;
