// Kraft: papel kraft, cantos rasgados, etiqueta laranja, recortes que caem com fita, legenda amarela.
// Cenas: abertura (pergunta + comentários), analogia (recortes "X = Y"), veredito (carimbo), lista (itens marcados).

const K = { kraft: "#c9a97c", laranja: "#e8692c", papel: "#f4efe4", tinta: "#2a2116", amarelo: "#ffe14d" };

function kraftFundo(c, W, H, seed = 1) {
  fundo(c, W, H, K.kraft, { grao: 0.32, vinheta: 0.22 });
  c.save(); c.globalAlpha = 0.1; c.strokeStyle = "#6b5233"; c.lineWidth = 1.5; const r = rng(seed);
  for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, a = r() * 3, l = 10 + r() * 30; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
  c.restore();
  recorte(c, -60, -50, 430, 270, "#e8e1d0", { seed: 3, amp: 9, rot: -0.15 });
  recorte(c, 120, -40, 220, 160, "#d9d2c2", { seed: 4, amp: 8, rot: 0.1 });
  c.save(); c.globalAlpha = 0.5; c.fillStyle = "#555"; for (let i = 0; i < 6; i++) c.fillRect(150, 10 + i * 18, 120 + (i * 37) % 60, 6); c.restore();
  recorte(c, W - 300, -30, 380, 300, "#d7cfbd", { seed: 5, amp: 9, rot: 0.2 });
  recorte(c, W - 170, 30, 220, 170, K.laranja, { seed: 6, amp: 11, rot: 0.5 });
  fita(c, 330, 160, 160, -0.6); fita(c, W - 330, 220, 140, 0.7);
}
function etiqueta(c, s, x, y, k, { cor = K.laranja, tam = 66, rot = -0.03 } = {}) {
  if (k <= 0) return;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(k, k);
  c.font = `800 ${tam}px ${SANS}`; const w = c.measureText(s).width + tam * 1.1;
  recorte(c, -w / 2, -tam * 0.95, w, tam * 1.9, cor, { seed: s.length, amp: 2, sombra: 8 });
  texto(c, s, 0, 2, { tam, peso: 800, cor: cor === K.laranja ? "#fff" : K.tinta });
  c.restore();
}
const tremor = (u) => (rng(Math.floor(u * 8) + 3)() - 0.5) * 3; // stop motion: 8 poses por segundo

const CENAS = {
  abertura(c, u, d, W, H, a) {
    const tl = a.tela || {};
    kraftFundo(c, W, H, 1);
    if (tl.topo) etiqueta(c, tl.topo, W / 2, 330, entra(u, 0.05, 0.3), { cor: "#9ad0f5", tam: 46 });
    (tl.titulo || []).forEach((s, i) => { const k = entra(u, 0.15 + i * 0.15, 0.3); c.save(); c.translate(W / 2, 470 + i * 120); c.scale(k, k);
      c.lineJoin = "round"; c.font = `900 96px ${SANS}`; c.textAlign = "center"; c.textBaseline = "middle"; c.strokeStyle = K.tinta; c.lineWidth = 14;
      c.strokeText(s, 0, 0); c.fillStyle = i ? K.laranja : "#fff"; c.fillText(s, 0, 0); c.restore(); });
    (tl.comentarios || []).forEach((s, i) => { const t0 = 0.6 + i * Math.min(0.5, (d - 1.2) / Math.max(1, tl.comentarios.length)), k = entra(u, t0, 0.25); if (k <= 0) return;
      c.save(); c.translate(W / 2 + (i % 2 ? 30 : -20) + tremor(u + i), 760 + i * 190); c.rotate(i % 2 ? 0.03 : -0.025); c.scale(k, k);
      recorte(c, -420, -75, 840, 150, "#fbfaf6", { seed: 30 + i, amp: 2.5, sombra: 10 });
      c.fillStyle = "#cfcac0"; c.beginPath(); c.arc(-360, -20, 26, 0, 7); c.fill(); c.fillStyle = "#e3dfd6"; rr(c, -320, -36, 160, 16, 8); c.fill();
      texto(c, s, -320, 25, { tam: 38, peso: 500, alinha: "left", cor: "#2b2b2b", larg: 720 }); c.restore(); });
  },
  analogia(c, u, d, W, H, a) {
    const tl = a.tela || {}, itens = tl.itens || [];
    kraftFundo(c, W, H, 2);
    etiqueta(c, tl.etiqueta || "Pensa assim", W / 2, 300, entra(u, 0.05, 0.3));
    const passo = Math.max(0.5, (d - 1) / Math.max(1, itens.length));
    itens.forEach(([x1, x2], i) => {
      const t0 = 0.4 + i * passo, k = entra(u, t0, 0.25); if (k <= 0) return;
      const y = 620 + i * (900 / Math.max(3, itens.length)), x = W / 2 + (i % 2 ? 120 : -100);
      c.save(); c.translate(x + tremor(u + i), y + tremor(u - i)); c.rotate(i % 2 ? 0.04 : -0.035); c.scale(k, k);
      recorte(c, -240, -120, 520, 240, K.papel, { seed: 20 + i, amp: 4 });
      if (tl.imagens && IMG[tl.imagens[i]]) { const im = IMG[tl.imagens[i]], s = Math.min(180 / im.width, 180 / im.height); c.drawImage(im, -210, -im.height * s / 2, im.width * s, im.height * s); }
      else { c.strokeStyle = K.tinta; c.lineWidth = 6; c.beginPath(); c.arc(-120, 0, 62, 0, 7); c.stroke(); c.fillStyle = K.laranja; c.beginPath(); c.arc(-120, 0, 26, 0, 7); c.fill(); }
      texto(c, x1, 40, -30, { tam: 54, peso: 800, alinha: "left", cor: K.tinta, larg: 220 });
      texto(c, "= " + x2, 40, 38, { tam: 40, peso: 500, alinha: "left", cor: K.tinta, larg: 220 });
      if (u > t0 + 0.2) fita(c, 0, -120, 140, 0.08);
      c.restore();
    });
  },
  veredito(c, u, d, W, H, a) {
    const tl = a.tela || {};
    kraftFundo(c, W, H, 3);
    if (tl.texto) etiqueta(c, tl.texto, W / 2, 620, entra(u, 0.1, 0.3), { cor: "#fbfaf6", tam: 56 });
    const k = lerp(2.4, 1, fase(u, 0.5, 0.62)), tr = u > 0.5 && u < 0.7 ? 10 * Math.sin(u * 90) : 0;
    if (u > 0.5) { c.save(); c.translate(W / 2 + tr, 1050); c.rotate(-0.18); c.scale(k, k); c.globalAlpha = 0.92;
      c.strokeStyle = K.laranja; c.lineWidth = 16; c.beginPath(); c.arc(0, 0, 230, 0, 7); c.stroke(); c.lineWidth = 6; c.beginPath(); c.arc(0, 0, 196, 0, 7); c.stroke();
      const ps = (tl.carimbo || "OK").split(" "); ps.forEach((p, i) => texto(c, p, 0, (i - (ps.length - 1) / 2) * 92, { tam: 84, peso: 900, fonte: GROSSA, cor: K.laranja }));
      c.restore(); }
  },
  lista(c, u, d, W, H, a) {
    const tl = a.tela || {}, itens = tl.itens || [];
    kraftFundo(c, W, H, 4);
    etiqueta(c, tl.etiqueta || "Na prática", W / 2, 300, entra(u, 0.05, 0.3));
    c.save(); c.translate(W / 2, 960); c.rotate(-0.02); recorte(c, -420, -480, 840, 960, "#fbfaf6", { seed: 9, amp: 3 }); fita(c, 0, -480, 200, -0.05);
    const passo = Math.max(0.5, (d - 1) / Math.max(1, itens.length));
    itens.forEach((s, i) => { const t0 = 0.4 + i * passo, y = -330 + i * (660 / Math.max(3, itens.length - 1 || 1));
      texto(c, s, -260, y, { tam: 50, peso: 600, alinha: "left", cor: K.tinta, alpha: fase(u, t0, t0 + 0.2), larg: 600 });
      c.strokeStyle = K.laranja; c.lineWidth = 12; c.lineCap = "round"; tracar(c, borda([[-360, y - 5], [-335, y + 25], [-290, y - 40]], 2, i + 7, 6).slice(0, 13), fase(u, t0 + 0.2, t0 + 0.45), false); });
    c.restore();
  },
};
CENAS.padrao = CENAS.analogia;

function legenda(c, a, u, W, H, t) {
  const s = trechoDaFala(a, t, 4);
  c.lineJoin = "round"; c.font = `800 62px ${SANS}`; c.textAlign = "center"; c.textBaseline = "middle";
  c.strokeStyle = K.tinta; c.lineWidth = 12; c.strokeText(s, W / 2, H - 250, W - 120);
  c.fillStyle = K.amarelo; c.fillText(s, W / 2, H - 250, W - 120);
}
