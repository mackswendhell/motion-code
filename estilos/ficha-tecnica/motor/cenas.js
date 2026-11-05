// Ficha Técnica: produto no centro de um simulador técnico. Painéis finos creme/grafite com um só acento laranja,
// o modo de operação em letras grandes, linha do tempo de operação embaixo. Cenas: modo, explodida.
// O produto vem de tela.imagem (vista pintada ou render 3D da Higgsfield, fundo transparente) ou, sem imagem, do robô em código (uiRobo).

const F = { fundo: "#f3efe8", tinta: "#3b3a37", fraco: "#8b877e", laranja: "#e5532d", ok: "#58a55c" };

function fPainel(c, x, y, w, h, rot, val, uni, u) {
  c.strokeStyle = "rgba(59,58,55,.25)"; c.lineWidth = 1.5; c.strokeRect(x, y, w, h);
  texto(c, rot.toUpperCase(), x + 14, y + 22, { tam: 15, fonte: MONO, peso: 600, alinha: "left", cor: F.fraco });
  if (val !== "") { c.font = `500 52px ${SANS}`; const vw = c.measureText(val).width;
    texto(c, val, x + 14, y + 72, { tam: 52, peso: 500, alinha: "left", cor: F.tinta }); texto(c, uni || "", x + 22 + vw, y + 82, { tam: 18, fonte: MONO, alinha: "left", cor: F.fraco }); }
}
function fBarras(c, x, y, w, n, u, destaque = -1) {
  for (let i = 0; i < n; i++) { c.fillStyle = i === destaque ? F.laranja : F.tinta; c.fillRect(x, y + i * 26, w * (0.35 + 0.65 * Math.abs(Math.sin(u * 1.5 + i * 1.3))), 9); }
}
function fProduto(c, tl, W, H, u, explode) {
  if (tl.imagem && IMG[tl.imagem]) { const im = IMG[tl.imagem], s = Math.min(820 / im.width, 640 / im.height), gira = 1 + 0.02 * Math.sin(u * 0.8);
    c.fillStyle = "rgba(0,0,0,.1)"; c.beginPath(); c.ellipse(W / 2, H / 2 + 300, 300, 40, 0, 0, 7); c.fill();
    c.save(); c.translate(W / 2, H / 2 + 20); c.scale(gira, gira); c.drawImage(im, -im.width * s / 2, -im.height * s / 2 - explode * 40, im.width * s, im.height * s); c.restore(); }
  else uiRobo(c, W / 2, H / 2 + 40, 1.05, u, explode);
}
function fHud(c, u, d, W, H, tl) {
  const p = tl.paineis || [];
  c.fillStyle = F.laranja; rr(c, 40, 30, 74, 50, 8); c.fill(); texto(c, tl.codigo || "JS-8", 77, 56, { tam: 20, peso: 800, cor: "#fff" });
  texto(c, (tl.produto || "Produto") + " /", 134, 56, { tam: 34, peso: 700, alinha: "left", cor: F.tinta });
  texto(c, (tl.linha || "SIMULADOR DE CAMPO").toUpperCase(), 134, 92, { tam: 14, fonte: MONO, alinha: "left", cor: F.fraco });
  c.fillStyle = F.tinta; const prog = tl.progresso ?? 0.5; for (let i = 0; i < 44; i++) if (i < 44 * prog + 3 * Math.sin(u)) c.fillRect(640 + i * 9, 44, 5, 22);
  fPainel(c, 40, 120, 330, 250, p[0]?.[0] || "marcha", p[0]?.[1] ?? "2.7", p[0]?.[2] || "Hz", u); fBarras(c, 54, 225, 300, 5, u, 2);
  fPainel(c, 40, 390, 330, 200, p[1]?.[0] || "zoom", p[1]?.[1] ?? "0.0", p[1]?.[2] || "×", u);
  fPainel(c, 40, 610, 330, 300, p[2]?.[0] || "carga", "", "", u); fBarras(c, 100, 662, 230, 8, u, tl.destaqueCarga ?? -1);
  fPainel(c, W - 370, 120, 330, 200, p[3]?.[0] || "óptica", p[3]?.[1] ?? "2.4", p[3]?.[2] || "lx", u);
  fPainel(c, W - 370, 340, 330, 330, "subsistemas", "", "", u);
  (tl.subsistemas || [["óptica", 1], ["rede neural", 1], ["pernas", 1], ["salto", 1]]).forEach(([s, ok], i) => {
    texto(c, s.toUpperCase(), W - 356, 410 + i * 50, { tam: 16, fonte: MONO, alinha: "left", cor: F.tinta });
    c.fillStyle = ok ? F.ok : F.laranja; rr(c, W - 130, 397 + i * 50, 76, 26, 4); c.fill(); texto(c, ok ? "OK" : "SOLTO", W - 92, 411 + i * 50, { tam: 13, fonte: MONO, peso: 700, cor: "#fff" }); });
  texto(c, "MODO DE OPERAÇÃO", 440, 830, { tam: 16, fonte: MONO, alinha: "left", cor: F.fraco });
  c.save(); c.beginPath(); c.rect(430, 840, 900, 90); c.clip();
  texto(c, (tl.modo || "").toUpperCase(), 440, 880 + 60 * (1 - sai(fase(u, 0.05, 0.35))), { tam: 64, peso: 600, alinha: "left", cor: F.laranja }); c.restore();
  c.strokeStyle = "rgba(59,58,55,.3)"; c.strokeRect(440, 950, W - 880, 80);
  c.fillStyle = F.laranja; c.beginPath(); c.arc(480, 990, 20, 0, 7); c.fill();
  const t0 = tl.linhaInicio ?? 0, t1 = tl.linhaFim ?? 1, pos = lerp(t0, t1, u / d);
  c.fillStyle = F.tinta; c.fillRect(520, 988, (W - 1000) * pos, 4); c.fillStyle = F.laranja; c.beginPath(); c.arc(520 + (W - 1000) * pos, 990, 9, 0, 7); c.fill();
}

const CENAS = {
  modo(c, u, d, W, H, a) {
    const tl = a.tela || {};
    fundo(c, W, H, F.fundo, { grao: 0.06, vinheta: 0.12 });
    fProduto(c, tl, W, H, u, 0);
    fHud(c, u, d, W, H, tl);
  },
  explodida(c, u, d, W, H, a) {
    const tl = a.tela || {}, ex = sai(fase(u, 0.1, d * 0.5)) * (tl.volta ? 1 - fase(u, d * 0.6, d) : 1);
    fundo(c, W, H, F.fundo, { grao: 0.06, vinheta: 0.12 });
    fProduto(c, tl, W, H, u, ex);
    if (ex > 0.3) { c.strokeStyle = "rgba(59,58,55,.4)"; c.setLineDash([6, 6]); c.beginPath(); c.arc(W / 2, H / 2, 380, -0.5, 0.8); c.stroke(); c.setLineDash([]);
      (tl.cotas || []).forEach(([s, x, y], i) => { const k = fase(u, d * 0.3 + i * 0.2, d * 0.45 + i * 0.2); c.strokeStyle = F.tinta; c.lineWidth = 1.5; c.beginPath(); c.moveTo(W / 2 + x * 0.5, H / 2 + y * 0.5); c.lineTo(W / 2 + x, H / 2 + y); c.stroke();
        texto(c, s, W / 2 + x + (x > 0 ? 10 : -10), H / 2 + y, { tam: 18, fonte: MONO, alinha: x > 0 ? "left" : "right", cor: F.tinta, alpha: k }); }); }
    fHud(c, u, d, W, H, tl);
  },
};
CENAS.padrao = CENAS.modo;
const FUNDE = 0.15;
