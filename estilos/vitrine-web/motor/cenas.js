// Vitrine Web: sites e landing pages como showreel. Cada ato é uma tela de site em tela cheia com objeto central vivo,
// título gigante e cursor que passa pelo botão. Cenas: hero, palavra, grade.
// O objeto central pode ser código (particulas, medusa, orbe) ou uma imagem/recorte da Higgsfield (tela.imagem).

const V = { escuro: "#050507", claroA: "#c9c4f0", claroB: "#f3dfe8", roxo: "#7b5cff" };
function vCursor(c, x, y, aperta = 0, s = 1) {
  c.save(); c.translate(x, y); c.scale(s * (1 - 0.15 * aperta), s * (1 - 0.15 * aperta));
  c.fillStyle = "#111"; c.strokeStyle = "#fff"; c.lineWidth = 3.5; c.lineJoin = "round";
  c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 46); c.lineTo(12, 35); c.lineTo(22, 56); c.lineTo(31, 52); c.lineTo(21, 31); c.lineTo(37, 31); c.closePath(); c.fill(); c.stroke(); c.restore();
}
function vNav(c, W, marca, menu, claro) {
  const cor = claro ? "#1b1b22" : "#fff";
  texto(c, "● " + (marca || ""), 60, 44, { tam: 26, peso: 700, alinha: "left", cor });
  (menu || []).forEach((s, i) => texto(c, s, W - 640 + i * 150, 44, { tam: 22, alinha: "left", cor: claro ? "#555" : "#bbb" }));
  c.fillStyle = claro ? "#1b1b22" : "#fff"; rr(c, W - 170, 22, 120, 44, 22); c.fill(); texto(c, "Entrar", W - 110, 45, { tam: 20, peso: 600, cor: claro ? "#fff" : "#111" });
}
function vParticulas(c, cx, cy, R, u, k = 1) {
  const r = rng(2), rot = u * 0.5;
  for (let i = 0; i < 2600 * k; i++) { const a = r() * 7 + rot, b = r() * 3.14, rr2 = R * (0.85 + 0.15 * Math.sin(a * 5 + b * 3));
    const x = Math.cos(a) * Math.sin(b) * rr2 * 1.15, y = Math.cos(b) * rr2 * 0.85, z = Math.sin(a) * Math.sin(b);
    c.fillStyle = `hsla(${30 + 260 * r()},80%,${50 + 20 * z}%,${0.3 + 0.6 * (z + 1) / 2})`; c.fillRect(cx + x, cy + y, 3, 3); }
}
function vMedusa(c, cx, cy, u, s = 1) {
  c.save(); c.translate(cx, cy + 30 * Math.sin(u * 1.3)); c.scale(s, s);
  for (let i = 0; i < 9; i++) { c.strokeStyle = "rgba(240,90,170,.55)"; c.lineWidth = 8; c.beginPath(); const x0 = -130 + i * 32; c.moveTo(x0, 50); for (let k = 0; k < 12; k++) c.lineTo(x0 + 18 * Math.sin(k * 0.8 + u * 3 + i), 50 + k * 42); c.stroke(); }
  const g = c.createRadialGradient(-40, -60, 10, 0, 0, 190); g.addColorStop(0, "rgba(255,160,210,.95)"); g.addColorStop(1, "rgba(220,60,150,.85)");
  c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, 175, 140, 0, Math.PI, 0); c.quadraticCurveTo(175, 60, 0, 50); c.quadraticCurveTo(-175, 60, -175, 0); c.fill(); c.restore();
}
function vObjeto(c, tl, cx, cy, u, W, H) {
  const ob = tl.objeto || "particulas";
  if (tl.imagem && IMG[tl.imagem]) { const im = IMG[tl.imagem], s = Math.min(W * 0.45 / im.width, H * 0.7 / im.height); c.drawImage(im, cx - im.width * s / 2, cy - im.height * s / 2 + 15 * Math.sin(u), im.width * s, im.height * s); }
  else if (ob === "medusa") vMedusa(c, cx, cy - 120, u);
  else if (ob === "orbe") { const g = c.createRadialGradient(cx - 80, cy - 80, 20, cx, cy, 300); g.addColorStop(0, "#fff"); g.addColorStop(0.4, tl.cor || "#ff8a5c"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, 300 + 10 * Math.sin(u * 2), 0, 7); c.fill(); }
  else vParticulas(c, cx, cy, 330, u, sai(fase(u, 0, 1)));
}

const CENAS = {
  hero(c, u, d, W, H, a) {
    const tl = a.tela || {}, claro = tl.tema === "claro";
    if (claro) { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, V.claroA); g.addColorStop(1, V.claroB); c.fillStyle = g; } else c.fillStyle = V.escuro;
    c.fillRect(0, 0, W, H);
    vObjeto(c, tl, W * 0.66, H * 0.52, u, W, H);
    vNav(c, W, tl.marca, tl.menu, claro);
    const k = sai(fase(u, 0.1, 0.5));
    (tl.titulo || []).forEach((s, i) => { c.save(); c.beginPath(); c.rect(120, 330 + i * 115 - 72, 1000, 144); c.clip();
      texto(c, s, 130, 330 + i * 115 + 115 * (1 - k), { tam: 104, peso: 400, alinha: "left", cor: claro ? "#1b1b22" : "#fff" }); c.restore(); });
    const yb = 330 + (tl.titulo || []).length * 115;
    texto(c, tl.sub || "", 130, yb, { tam: 30, alinha: "left", cor: claro ? "#555" : "#9b9ba6", alpha: fase(u, 0.4, 0.8) });
    const hover = fase(u, d * 0.55, d * 0.62);
    c.fillStyle = mistura(tl.cor || V.roxo, "#ffffff", hover * 0.2); rr(c, 130, yb + 50, 240, 68, 34); c.fill();
    texto(c, tl.botao || "Começar", 250, yb + 85, { tam: 28, peso: 600, cor: "#fff" });
    const m = sai(fase(u, d * 0.2, d * 0.6)); vCursor(c, lerp(W * 0.55, 300, m) + Math.sin(m * Math.PI) * 100, lerp(H * 0.9, yb + 92, m), fase(u, d * 0.75, d * 0.8) - fase(u, d * 0.8, d * 0.88));
  },
  palavra(c, u, d, W, H, a) {
    const tl = a.tela || {}, ps = tl.palavras || ["CRIAR"], i = Math.min(ps.length - 1, Math.floor((u / d) * ps.length));
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, tl.corA || V.claroA); g.addColorStop(1, tl.corB || V.claroB); c.fillStyle = g; c.fillRect(0, 0, W, H);
    texto(c, ps[i], W / 2, H / 2, { tam: 300, fonte: GROSSA, cor: "#1b1b22", larg: W * 0.92 });
    vObjeto(c, { ...tl, objeto: tl.objeto || "medusa" }, W / 2, H / 2 + 80, u, W, H);
    texto(c, ps[i], W / 2, H / 2, { tam: 300, fonte: GROSSA, cor: "rgba(27,27,34,.12)", larg: W * 0.92 });
    vNav(c, W, tl.marca, tl.menu, true);
  },
  grade(c, u, d, W, H, a) {
    const tl = a.tela || {}, itens = tl.itens || ["Projeto 1", "Projeto 2", "Projeto 3", "Projeto 4"];
    c.fillStyle = V.escuro; c.fillRect(0, 0, W, H);
    const z = lerp(1.15, 1, sai(fase(u, 0, d))), cores = ["#d97757", "#6a9bcc", "#788c5d", "#e9b949", "#8e7cc3", "#c96a8b"];
    c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
    itens.forEach((s, i) => { const col = i % 3, lin = Math.floor(i / 3), x = 150 + col * 560, y = 170 + lin * 420, k = entra(u, 0.1 + i * 0.12, 0.4);
      c.save(); c.translate(x + 240, y + 170); c.scale(k, k); c.fillStyle = "#16161b"; rr(c, -240, -170, 480, 340, 16); c.fill();
      c.fillStyle = cores[i % cores.length]; rr(c, -220, -120, 440, 220, 10); c.fill(); texto(c, s, -220, 140, { tam: 30, peso: 600, alinha: "left", cor: "#fff" }); c.restore(); });
    c.restore();
    texto(c, tl.titulo || "", 150, 100, { tam: 34, peso: 600, alinha: "left", cor: "#fff", alpha: fase(u, 0.2, 0.6) });
  },
};
CENAS.padrao = CENAS.hero;
const FUNDE = 0.12;
