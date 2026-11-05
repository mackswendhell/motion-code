// Grupo Cenas e 3D: lugares em loop, isométrico, profundidade.

function cIso(x, y, z) { return [(x - y) * 0.866, (x + y) * 0.5 - z]; } // projeção isométrica simples
function cCubo(c, ox, oy, x, y, z, w, d, h, cor) {
  const p = (a, b, cc) => { const [px, py] = cIso(a, b, cc); return [ox + px, oy + py]; };
  c.fillStyle = mistura(cor, "#000000", 0.28); caminho(c, [p(x, y + d, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x, y + d, z + h)]); c.fill();
  c.fillStyle = mistura(cor, "#000000", 0.14); caminho(c, [p(x + w, y, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x + w, y, z + h)]); c.fill();
  c.fillStyle = cor; caminho(c, [p(x, y, z + h), p(x + w, y, z + h), p(x + w, y + d, z + h), p(x, y + d, z + h)]); c.fill();
}

semente({
  id: "quarto-lofi", estilo: "lofi", nome: "Quarto lofi", grupo: "cenas", formato: "16:9",
  resumo: "Quarto aconchegante à noite: chuva na janela, abajur, caneca soltando vapor, gato respirando. Loop para estudar.",
  receita: `Cena 16:9 em loop perfeito, sem fala, para fundo de estudo/trabalho (lofi). Combina com o estilo Lofi do estúdio (estilos/lofi/) e com a trilha de nucleo/lofi.py.
Estrutura: um canto de quarto à noite: janela com chuva e luzes da cidade desfocadas, escrivaninha com abajur quente, caneca com vapor, plantas, um gato dormindo que respira.
Visual: paleta de noite azul-violeta por fora e âmbar por dentro, luz do abajur como gradiente radial, grão leve.
Movimento: tudo muito sutil e periódico (gotas, vapor, respiração, piscar de luzes ao longe), loop de 5 s ou múltiplos.
Use para: lives, playlists, fundo de podcast, vídeos longos de foco.`,
  higgsfield: "O quarto pode ser pintado na Higgsfield como fundo em camadas (parede, mesa, janela separadas); chuva, vapor, luz e respiração ficam no código.",
  cena(c, t, W, H) {
    c.fillStyle = "#2b2236"; c.fillRect(0, 0, W, H);
    const jx = 980, jy = 120, jw = 760, jh = 560;
    const g = c.createLinearGradient(0, jy, 0, jy + jh); g.addColorStop(0, "#1b2340"); g.addColorStop(1, "#3c3460"); c.fillStyle = g; c.fillRect(jx, jy, jw, jh);
    const r = rng(4); for (let i = 0; i < 30; i++) { const x = jx + r() * jw, y = jy + jh * 0.5 + r() * jh * 0.5, s = 10 + r() * 30; c.fillStyle = `rgba(${r() < 0.5 ? "255,200,120" : "160,190,255"},${0.25 + 0.2 * ciclo(t + i, 1)})`; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill(); }
    c.save(); c.beginPath(); c.rect(jx, jy, jw, jh); c.clip(); c.strokeStyle = "rgba(200,210,255,.35)"; c.lineWidth = 2;
    for (let i = 0; i < 80; i++) { const x = jx + r() * jw, y = jy + ((r() * jh + t * 600) % jh); c.beginPath(); c.moveTo(x, y); c.lineTo(x - 6, y + 30); c.stroke(); } c.restore();
    c.strokeStyle = "#5a4636"; c.lineWidth = 24; c.strokeRect(jx, jy, jw, jh); c.lineWidth = 12; c.beginPath(); c.moveTo(jx + jw / 2, jy); c.lineTo(jx + jw / 2, jy + jh); c.stroke();
    const luz = c.createRadialGradient(420, 560, 0, 420, 560, 900); luz.addColorStop(0, `rgba(255,190,110,${0.45 + 0.02 * ciclo(t, 3)})`); luz.addColorStop(1, "rgba(255,190,110,0)"); c.fillStyle = luz; c.fillRect(0, 0, W, H);
    c.fillStyle = "#6b4a33"; c.fillRect(0, 780, W, 60); c.fillStyle = "#4a3324"; c.fillRect(0, 840, W, H - 840);
    c.fillStyle = "#3a2c25"; c.fillRect(400, 560, 18, 220); c.fillStyle = "#f1b067"; c.beginPath(); c.moveTo(330, 560); c.lineTo(490, 560); c.lineTo(450, 470); c.lineTo(370, 470); c.fill();
    c.fillStyle = "#e9e1d3"; rr(c, 620, 690, 90, 95, 12); c.fill(); c.strokeStyle = "#e9e1d3"; c.lineWidth = 10; c.beginPath(); c.arc(712, 735, 24, -1.2, 1.2); c.stroke();
    for (let i = 0; i < 3; i++) { const u = ((t / DUR) * 2 + i / 3) % 1; c.strokeStyle = `rgba(255,255,255,${0.25 * (1 - u)})`; c.lineWidth = 6; c.beginPath();
      for (let k = 0; k < 10; k++) c.lineTo(665 + Math.sin(k * 0.8 + i * 2 + u * 6) * 14, 680 - u * 120 - k * 12); c.stroke(); }
    const resp = 1 + 0.04 * ciclo(t, 1); c.save(); c.translate(1300, 780); c.scale(resp, 1 / resp); c.fillStyle = "#2a2220"; c.beginPath(); c.ellipse(0, -50, 150, 60, 0, Math.PI, 0); c.fill();
    c.beginPath(); c.arc(-130, -70, 46, 0, 7); c.fill(); c.beginPath(); c.moveTo(-160, -110); c.lineTo(-150, -150); c.lineTo(-130, -112); c.moveTo(-115, -112); c.lineTo(-100, -150); c.lineTo(-95, -105); c.fill(); c.restore();
    c.fillStyle = "#4f7a52"; for (let i = 0; i < 7; i++) { c.save(); c.translate(880, 700); c.rotate(-1.3 + i * 0.4 + 0.03 * ciclo(t + i)); c.beginPath(); c.ellipse(0, -70, 20, 70, 0, 0, 7); c.fill(); c.restore(); }
    c.fillStyle = "#a0603c"; c.fillRect(850, 700, 60, 80);
    fundo(c, W, H, "rgba(0,0,0,0)", { grao: 0.15, vinheta: 0.4 });
  },
});

semente({
  id: "mesa-isometrica", nome: "Mesa isométrica", grupo: "cenas", formato: "1:1",
  resumo: "Uma mesa de trabalho em isométrico: monitor com código rolando, planta, caneca, luz que pisca. Setup de criador.",
  receita: `Cena 1:1 isométrica (vista de 30°) de um espaço: mesa de trabalho, estúdio, cozinha, loja.
Estrutura: um bloco de chão flutuando sobre fundo liso; móveis e objetos feitos de caixas isométricas com 3 tons por cor (topo claro, lados escuros); pequenas animações em loop (tela com conteúdo rolando, luz piscando, planta balançando, vapor).
Visual: paleta pastel controlada, sombras como polígonos achatados, sem contorno.
Movimento: câmera parada ou girando 5° de ida e volta; objetos com animação periódica.
Use para: "meu setup", explicar um ambiente, cenário de marca.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#f1e9dc", { grao: 0.08, vinheta: 0.2 });
    const ox = W / 2, oy = H / 2 - 40 + 6 * ciclo(t);
    c.fillStyle = "rgba(0,0,0,.08)"; c.beginPath(); c.ellipse(ox, oy + 330, 420, 90, 0, 0, 7); c.fill();
    cCubo(c, ox, oy, -260, -260, -40, 520, 520, 40, "#d8c3a5");
    cCubo(c, ox, oy, -200, -200, 0, 400, 220, 140, "#a77b55");
    cCubo(c, ox, oy, -120, -190, 140, 220, 20, 150, "#3d3929");
    const [sx, sy] = cIso(-115, -170, 285), [ex, ey] = cIso(95, -170, 145);
    c.save(); c.beginPath(); const p = (a, b, z) => { const [x, y] = cIso(a, b, z); return [ox + x, oy + y]; };
    caminho(c, [p(-112, -169, 285), p(92, -169, 285), p(92, -169, 147), p(-112, -169, 147)]); c.clip();
    c.fillStyle = "#24304a"; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 12; i++) { const [lx, ly] = p(-100, -169, 280 - ((i * 14 + t * 40) % 140)); c.fillStyle = [CLAUDE.terracota, "#9fd18b", "#8ecae6"][i % 3]; c.fillRect(lx, ly, 40 + (i * 37) % 80, 4); }
    c.restore();
    cCubo(c, ox, oy, 80, -60, 140, 40, 40, 50, "#e9e1d3");
    for (let i = 0; i < 3; i++) { const u = ((t / DUR) * 2 + i / 3) % 1, [vx, vy] = cIso(100, -40, 200 + u * 80); c.fillStyle = `rgba(255,255,255,${0.5 * (1 - u)})`; c.beginPath(); c.arc(ox + vx + 6 * Math.sin(u * 8), oy + vy, 6, 0, 7); c.fill(); }
    cCubo(c, ox, oy, 150, 120, 0, 70, 70, 80, "#c9714f");
    c.fillStyle = "#5f8a52"; for (let i = 0; i < 6; i++) { const [px, py] = cIso(185, 155, 80); c.save(); c.translate(ox + px, oy + py); c.rotate(-1.2 + i * 0.45 + 0.05 * ciclo(t + i)); c.beginPath(); c.ellipse(0, -50, 14, 50, 0, 0, 7); c.fill(); c.restore(); }
    const pisca = Math.floor(t * 2) % 2; const [lx, ly] = cIso(-180, 0, 160); c.fillStyle = pisca ? "#ffd166" : "#b98f3a"; c.beginPath(); c.arc(ox + lx, oy + ly, 12, 0, 7); c.fill();
  },
});

semente({
  id: "cidade-diorama", nome: "Cidade diorama", grupo: "cenas", formato: "16:9",
  resumo: "Quarteirão isométrico de brinquedo com carrinhos dando a volta, janelas acendendo e nuvens passando.",
  receita: `Cena 16:9 de cidade em miniatura (diorama isométrico).
Estrutura: quarteirão sobre uma base, prédios de alturas variadas com janelas, rua em volta com carrinhos que circulam em loop, árvores redondas, nuvens baixas que passam por cima.
Visual: cores de brinquedo (pastéis com um acento), sombra suave de luz do fim de tarde, borda da base mostrando a "terra" em camadas.
Movimento: carros em velocidade constante no circuito, janelas acendendo aleatoriamente, nuvens com sombra que passa sobre os prédios.
Use para: cidades, negócios locais, logística, "como funciona um bairro", urbanismo.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#cfe3e6", { grao: 0.08, vinheta: 0.2 });
    const ox = W / 2, oy = H / 2 - 20;
    cCubo(c, ox, oy, -420, -300, -80, 840, 600, 80, "#8a6a4a");
    cCubo(c, ox, oy, -420, -300, 0, 840, 600, 4, "#6c6f73");
    cCubo(c, ox, oy, -320, -200, 4, 640, 400, 6, "#9cc18a");
    const pr = [[-280, -170, 120, 120, 260, "#e8d5c4"], [-120, -170, 140, 110, 380, "#d97757"], [80, -160, 120, 120, 200, "#6a9bcc"], [-260, 40, 160, 120, 180, "#e9c46a"], [-40, 30, 120, 140, 300, "#b8a9d9"], [140, 40, 140, 120, 230, "#f0eee6"]];
    pr.forEach(([x, y, w, d, h, cor], i) => { cCubo(c, ox, oy, x, y, 10, w, d, h, cor);
      for (let a = 0; a < Math.floor(h / 50); a++) for (let b = 0; b < 3; b++) { const on = rng(i * 50 + a * 3 + b + Math.floor(t * 1.2))() < 0.35; const [wx, wy] = cIso(x + w, y + 15 + b * (d / 3.2), 30 + a * 50);
        c.fillStyle = on ? "#ffe39a" : "rgba(0,0,0,.18)"; c.beginPath(); c.moveTo(ox + wx, oy + wy); c.lineTo(ox + wx + 14, oy + wy + 8); c.lineTo(ox + wx + 14, oy + wy - 14); c.lineTo(ox + wx, oy + wy - 22); c.fill(); } });
    for (let k = 0; k < 4; k++) { const u = ((t / DUR) + k / 4) % 1, per = 2 * (760 + 520); let d = u * per, x, y;
      if (d < 760) { x = -380 + d; y = -260; } else if ((d -= 760) < 520) { x = 380; y = -260 + d; } else if ((d -= 520) < 760) { x = 380 - d; y = 260; } else { d -= 760; x = -380; y = 260 - d; }
      cCubo(c, ox, oy, x - 18, y - 12, 4, 36, 24, 18, [CLAUDE.terracota, "#f2f2f2", "#3d6ee0", "#e9b949"][k]); }
    for (let i = 0; i < 2; i++) { const x = ((t / DUR) * 1400 + i * 700) % 1400 - 700, [nx, ny] = cIso(x, -100 + i * 200, 520);
      c.fillStyle = "rgba(0,0,0,.08)"; const [sx2, sy2] = cIso(x, -100 + i * 200, 20); c.beginPath(); c.ellipse(ox + sx2, oy + sy2, 110, 40, 0, 0, 7); c.fill();
      c.fillStyle = "rgba(255,255,255,.92)"; [[0, 0, 60], [50, 10, 46], [-50, 12, 44]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(ox + nx + dx, oy + ny + dy, r, 0, 7); c.fill(); }); }
  },
});

semente({
  id: "montanhas-paralaxe", nome: "Montanhas em paralaxe", grupo: "cenas", formato: "16:9",
  resumo: "Camadas de montanha em tons de névoa, o sol nasce atrás e a câmera desliza: profundidade com 6 planos.",
  receita: `Cena 16:9 de paisagem com profundidade por camadas (paralaxe).
Estrutura: 5 a 7 camadas de montanhas recortadas, das mais distantes (claras, quase céu) às mais próximas (escuras, com árvores); o sol ou a lua atrás; pássaros cruzando; névoa entre camadas.
Visual: perspectiva atmosférica (cada camada mais clara e mais azulada com a distância), gradiente de céu do amanhecer, grão.
Movimento: travelling lateral lento com velocidades proporcionais à distância (loop perfeito: camadas repetem), sol subindo devagar.
Use para: abertura contemplativa, viagens, natureza, transições de capítulo.`,
  cena(c, t, W, H) {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#f6c9a7"); g.addColorStop(0.55, "#f7e3c4"); g.addColorStop(1, "#e7d9c4"); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const sol = c.createRadialGradient(1300, 500, 0, 1300, 500, 260); sol.addColorStop(0, "rgba(255,240,200,1)"); sol.addColorStop(0.35, "rgba(255,220,170,.8)"); sol.addColorStop(1, "rgba(255,220,170,0)");
    c.fillStyle = sol; c.beginPath(); c.arc(1300, 500 - 20 * ciclo01(t), 260, 0, 7); c.fill();
    const cores = ["#e8c8b8", "#d6aea4", "#b98f92", "#8f6f7e", "#5e4b5e", "#3a2f3d"];
    cores.forEach((cor, i) => {
      const desl = ((t / DUR) * 1600 * Math.ceil((i + 1) / 2)) % 1600, y0 = 520 + i * 90, amp = 120 - i * 8, r = rng(i + 2);
      const fx = [...Array(4)].map(() => [0.5 + r() * 3, r() * 6]);
      c.fillStyle = cor; c.beginPath(); c.moveTo(0, H);
      for (let x = 0; x <= W; x += 16) { const xx = (x + desl) / 1600 * Math.PI * 2; let y = y0; fx.forEach(([f, p]) => (y -= (amp / 4) * Math.sin(xx * Math.round(f) + p))); c.lineTo(x, y); }
      c.lineTo(W, H); c.fill();
      if (i < 5) { const n = c.createLinearGradient(0, y0 - 40, 0, y0 + 120); n.addColorStop(0, "rgba(255,240,225,0)"); n.addColorStop(1, "rgba(255,240,225,.25)"); c.fillStyle = n; c.fillRect(0, y0 - 40, W, 160); }
    });
    for (let i = 0; i < 3; i++) { const x = ((t / DUR) * 2200 + i * 80) % 2400 - 200, y = 300 + i * 30 + 10 * Math.sin(t * 3 + i), a = Math.sin(t * 12 + i) * 10;
      c.strokeStyle = "#3a2f3d"; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 20, y - a); c.lineTo(x, y); c.lineTo(x + 20, y - a); c.stroke(); }
    fundo(c, W, H, "rgba(0,0,0,0)", { grao: 0.15, vinheta: 0.2 });
  },
});

semente({
  id: "planeta-orbita", nome: "Planeta e órbita", grupo: "cenas", formato: "1:1",
  resumo: "Planeta com anel girando no espaço, satélite passando na frente e atrás, estrelas cintilando. Ciência e grandeza.",
  receita: `Cena 1:1 espacial em loop.
Estrutura: um planeta com faixas e sombra do terminador, um anel inclinado que passa na frente e atrás dele, uma lua/satélite em órbita (some atrás do planeta), campo de estrelas com cintilação, uma estrela cadente ocasional.
Visual: fundo azul-noite com nebulosa suave, planeta com gradiente esférico e borda de atmosfera, anel em faixas translúcidas.
Movimento: rotação das faixas do planeta, órbita com período de 5 s (loop exato), cintilação aleatória.
Use para: ciência, curiosidades sobre o espaço, abertura épica, fundo de música.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#0b1022", { grao: 0.2, vinheta: 0.5 });
    const neb = c.createRadialGradient(300, 260, 0, 300, 260, 500); neb.addColorStop(0, "rgba(120,80,160,.25)"); neb.addColorStop(1, "rgba(120,80,160,0)"); c.fillStyle = neb; c.fillRect(0, 0, W, H);
    const r = rng(9); for (let i = 0; i < 160; i++) { const x = r() * W, y = r() * H, f = 0.4 + 0.6 * Math.abs(Math.sin(t * (1 + r() * 3) + i)); c.fillStyle = `rgba(255,255,255,${f * (0.3 + r() * 0.7)})`; c.fillRect(x, y, 2, 2); }
    const cx = W / 2, cy = H / 2, R = 230, inc = -0.35, a = (t / DUR) * Math.PI * 2;
    const anel = (frente) => { c.save(); c.translate(cx, cy); c.rotate(inc); for (let k = 0; k < 5; k++) { c.strokeStyle = `rgba(230,200,160,${0.12 + k * 0.05})`; c.lineWidth = 12; c.beginPath(); c.ellipse(0, 0, R * 1.6 + k * 14, (R * 1.6 + k * 14) * 0.22, 0, frente ? 0 : Math.PI, frente ? Math.PI : Math.PI * 2); c.stroke(); } c.restore(); };
    const lua = (frente) => { const z = Math.sin(a); if ((z > 0) !== frente) return; const x = cx + Math.cos(a) * 420, y = cy + Math.cos(a) * 420 * Math.sin(inc) * -1 + z * 40; c.fillStyle = "#cfcac0"; c.beginPath(); c.arc(x, y, 28 * (0.8 + 0.2 * z), 0, 7); c.fill(); };
    lua(false); anel(false);
    c.save(); c.beginPath(); c.arc(cx, cy, R, 0, 7); c.clip();
    c.fillStyle = "#d9935f"; c.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    for (let i = 0; i < 9; i++) { c.fillStyle = i % 2 ? "rgba(255,230,190,.35)" : "rgba(140,70,40,.25)"; const y = cy - R + i * 52 + 8 * Math.sin(a + i); c.beginPath(); for (let x = -R; x <= R; x += 20) c.lineTo(cx + x, y + 10 * Math.sin(x / 50 + a * 2 + i)); c.lineTo(cx + R, y + 40); c.lineTo(cx - R, y + 40); c.fill(); }
    const sh = c.createRadialGradient(cx - 90, cy - 90, 40, cx, cy, R * 1.15); sh.addColorStop(0, "rgba(255,255,255,.15)"); sh.addColorStop(0.6, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,20,.75)"); c.fillStyle = sh; c.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    c.restore();
    c.strokeStyle = "rgba(160,200,255,.3)"; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, R + 3, 0, 7); c.stroke();
    anel(true); lua(true);
  },
});

semente({
  id: "mar-por-do-sol", nome: "Mar no pôr do sol", grupo: "cenas", formato: "9:16",
  resumo: "Ondas em faixas que se movem, reflexo do sol tremendo na água e um barquinho balançando. Calmo e quente.",
  receita: `Cena vertical 9:16 de mar ao pôr do sol em loop.
Estrutura: céu em gradiente quente com sol grande baixo; mar em faixas horizontais de ondas que se movem em velocidades diferentes; reflexo do sol como traços quebrados na água; um barco à vela balançando; gaivotas.
Visual: ilustração plana com faixas de cor, sem contorno, paleta pêssego, coral, roxo e azul-petróleo.
Movimento: ondas periódicas (loop exato), reflexo tremulando, barco com balanço de 4°.
Use para: frases, reflexão, viagem, "fim de semana", música.`,
  cena(c, t, W, H) {
    const g = c.createLinearGradient(0, 0, 0, H * 0.55); g.addColorStop(0, "#5b4b8a"); g.addColorStop(0.5, "#e98b6d"); g.addColorStop(1, "#f9c784"); c.fillStyle = g; c.fillRect(0, 0, W, H * 0.55);
    c.fillStyle = "#fde3b1"; c.beginPath(); c.arc(W / 2, H * 0.5, 200, Math.PI, 0); c.fill();
    for (let i = 0; i < 14; i++) { const y = H * 0.55 + i * 70, vel = (i % 2 ? 1 : -1) * (1 + i * 0.2); c.fillStyle = mistura("#e98b6d", "#1f4e5f", i / 13);
      c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 20) c.lineTo(x, y + 8 * Math.sin(x / 70 + (t / DUR) * Math.PI * 2 * vel + i)); c.lineTo(W, H); c.fill();
      if (i < 9) { const w = 300 * (1 - i / 10); for (let k = 0; k < 3; k++) { const x = W / 2 - w / 2 + rng(i * 3 + k + Math.floor(t * 6))() * w; c.fillStyle = `rgba(255,236,190,${0.7 - i * 0.07})`; c.fillRect(x, y + 6, 40 + k * 20, 6); } } }
    const bx = W * 0.3, by = H * 0.68, rot = 0.07 * ciclo(t, 1);
    c.save(); c.translate(bx, by + 8 * ciclo(t, 1)); c.rotate(rot); c.fillStyle = "#2b2236"; c.beginPath(); c.moveTo(-90, 0); c.lineTo(90, 0); c.lineTo(60, 36); c.lineTo(-60, 36); c.fill();
    c.fillRect(-3, -220, 6, 220); c.beginPath(); c.moveTo(6, -210); c.lineTo(120, -20); c.lineTo(6, -20); c.fill(); c.beginPath(); c.moveTo(-6, -180); c.lineTo(-80, -20); c.lineTo(-6, -20); c.fill(); c.restore();
    for (let i = 0; i < 2; i++) { const x = ((t / DUR) * 1400 + i * 300) % 1500 - 200, y = 400 + i * 80, a = Math.sin(t * 10 + i) * 12; c.strokeStyle = "#2b2236"; c.lineWidth = 5; c.beginPath(); c.moveTo(x - 24, y - a); c.quadraticCurveTo(x - 10, y - 12, x, y); c.quadraticCurveTo(x + 10, y - 12, x + 24, y - a); c.stroke(); }
    fundo(c, W, H, "rgba(0,0,0,0)", { grao: 0.14, vinheta: 0.25 });
  },
});

semente({
  id: "floresta-vagalumes", nome: "Floresta com vaga-lumes", grupo: "cenas", formato: "16:9",
  resumo: "Floresta à noite em camadas de azul, vaga-lumes acendendo e flutuando, lua atrás das árvores. Mágico e calmo.",
  receita: `Cena 16:9 noturna em loop.
Estrutura: camadas de silhuetas de árvores (pinheiros e troncos) em azuis cada vez mais escuros; lua grande com halo atrás; neblina baixa; dezenas de vaga-lumes que acendem e apagam enquanto flutuam em curvas suaves.
Visual: paleta azul-noite com pontos de luz amarelo-esverdeados com brilho (glow), grão.
Movimento: vaga-lumes com trajetórias de Lissajous (loop exato), brilho pulsando defasado, neblina deslizando devagar.
Use para: histórias de dormir, fantasia, música calma, transição mágica.`,
  cena(c, t, W, H) {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0d1b2e"); g.addColorStop(1, "#1f3550"); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const lua = c.createRadialGradient(1300, 300, 0, 1300, 300, 300); lua.addColorStop(0, "rgba(240,240,220,1)"); lua.addColorStop(0.3, "rgba(240,240,220,.9)"); lua.addColorStop(0.32, "rgba(200,220,240,.25)"); lua.addColorStop(1, "rgba(200,220,240,0)");
    c.fillStyle = lua; c.fillRect(0, 0, W, H);
    [["#1c2f48", 0.55, 2], ["#152538", 0.65, 3], ["#0e1a29", 0.78, 4]].forEach(([cor, base, seed], li) => { const r = rng(seed); c.fillStyle = cor;
      for (let i = 0; i < 18; i++) { const x = r() * W, h = 200 + r() * 300 + li * 60, w = 60 + r() * 50, y = H * base + 80; c.beginPath(); c.moveTo(x, y - h); c.lineTo(x + w, y); c.lineTo(x - w, y); c.fill(); }
      c.fillRect(0, H * base + 70, W, H); });
    const n = c.createLinearGradient(0, H * 0.7, 0, H); n.addColorStop(0, "rgba(180,200,230,0)"); n.addColorStop(1, `rgba(180,200,230,${0.18 + 0.04 * ciclo(t)})`); c.fillStyle = n; c.fillRect(0, H * 0.7, W, H * 0.3);
    const r = rng(17);
    for (let i = 0; i < 45; i++) { const ax = r() * W, ay = 400 + r() * 600, fa = 1 + Math.floor(r() * 2), fb = 1 + Math.floor(r() * 3), ph = r() * 7;
      const x = ax + 60 * Math.sin((t / DUR) * Math.PI * 2 * fa + ph), y = ay + 40 * Math.sin((t / DUR) * Math.PI * 2 * fb + ph * 2), b = 0.5 + 0.5 * Math.sin((t / DUR) * Math.PI * 2 * 2 + ph);
      const gl = c.createRadialGradient(x, y, 0, x, y, 30); gl.addColorStop(0, `rgba(230,255,150,${0.9 * b})`); gl.addColorStop(1, "rgba(230,255,150,0)"); c.fillStyle = gl; c.beginPath(); c.arc(x, y, 30, 0, 7); c.fill(); }
    fundo(c, W, H, "rgba(0,0,0,0)", { grao: 0.18, vinheta: 0.35 });
  },
});

semente({
  id: "chuva-janela", nome: "Chuva na janela", grupo: "cenas", formato: "9:16",
  resumo: "Vidro molhado em primeiro plano, gotas escorrendo, luzes da cidade desfocadas atrás. Melancolia bonita.",
  receita: `Cena vertical 9:16 de chuva no vidro.
Estrutura: em primeiro plano, o vidro com gotas paradas (pequenas lentes que refletem o fundo) e gotas maiores que escorrem deixando rastro; atrás, a cidade à noite totalmente desfocada (bokeh de luzes quentes e frias); pode ter uma frase em cima.
Visual: paleta azul e âmbar, bokeh com círculos de borda suave, gotas com brilho especular e sombra.
Movimento: escorridas em tempos aleatórios mas periódicos (loop exato), bokeh piscando devagar, leve respiração de foco.
Use para: frases, saudade, música, histórias tristes ou introspectivas.`,
  cena(c, t, W, H) {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#14203a"); g.addColorStop(1, "#2a2a44"); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const r = rng(5); for (let i = 0; i < 40; i++) { const x = r() * W, y = H * 0.35 + r() * H * 0.6, s = 30 + r() * 90, quente = r() < 0.55;
      const gl = c.createRadialGradient(x, y, 0, x, y, s); const a = 0.25 + 0.12 * Math.sin((t / DUR) * Math.PI * 2 + i);
      gl.addColorStop(0, `rgba(${quente ? "255,180,100" : "120,170,255"},${a})`); gl.addColorStop(0.8, `rgba(${quente ? "255,180,100" : "120,170,255"},${a * 0.8})`); gl.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gl; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill(); }
    c.fillStyle = "rgba(200,210,230,.05)"; c.fillRect(0, 0, W, H);
    const r2 = rng(11); for (let i = 0; i < 220; i++) { const x = r2() * W, y = r2() * H, s = 2 + r2() * 7; c.fillStyle = "rgba(220,230,255,.18)"; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill(); c.fillStyle = "rgba(255,255,255,.5)"; c.fillRect(x - s * 0.3, y - s * 0.4, 2, 2); }
    for (let i = 0; i < 9; i++) { const x = 80 + r2() * (W - 160), t0 = r2() * DUR, u = ((t - t0 + DUR) % DUR) / DUR, y = -80 + u * (H + 160);
      c.strokeStyle = "rgba(220,230,255,.18)"; c.lineWidth = 8; c.beginPath(); c.moveTo(x, Math.max(0, y - 400)); for (let k = 0; k < 10; k++) c.lineTo(x + Math.sin(k + i) * 3, lerp(Math.max(0, y - 400), y, k / 9)); c.stroke();
      c.fillStyle = "rgba(230,240,255,.4)"; c.beginPath(); c.ellipse(x, y, 11, 15, 0, 0, 7); c.fill(); c.fillStyle = "rgba(255,255,255,.8)"; c.beginPath(); c.arc(x - 3, y - 5, 3, 0, 7); c.fill(); }
    texto(c, "algumas coisas", W / 2, H * 0.22, { tam: 76, fonte: SERIF, peso: "italic 400", cor: "rgba(240,236,228,.9)" });
    texto(c, "só passam devagar", W / 2, H * 0.22 + 90, { tam: 76, fonte: SERIF, peso: "italic 400", cor: "rgba(240,236,228,.9)" });
  },
});

semente({
  id: "ilha-low-poly", nome: "Ilha low-poly", grupo: "cenas", formato: "1:1",
  resumo: "Ilha flutuante em polígonos chapados girando devagar, cachoeira caindo no vazio e nuvens em volta. Mundo de jogo.",
  receita: `Cena 1:1 de ilha flutuante em low-poly (facetas chapadas, sem textura).
Estrutura: um pedaço de terra flutuando (topo de grama, raiz de rocha em pirâmide invertida), árvores em cones, uma casinha, cachoeira caindo da borda e se desfazendo em névoa; nuvens low-poly em volta.
Visual: cada face com um tom (luz direcional fixa), paleta clara de céu, sombra no "nada" embaixo.
Movimento: a ilha gira 360° em ciclo longo (ou balança ±10°), flutua para cima e para baixo, água em segmentos animados.
Use para: mundos de fantasia, metáforas ("sua ilha de produtividade"), abertura de jogo próprio.`,
  cena(c, t, W, H) {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#bfe3f0"); g.addColorStop(1, "#f3ead9"); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2 - 40 + 18 * ciclo(t), a = (t / DUR) * Math.PI * 2 * 0.25 + 0.3 * 0, n = 8, R = 300;
    const ang = (i) => a + (i / n) * Math.PI * 2, P = (i, r, z) => [cx + Math.cos(ang(i)) * r, cy + Math.sin(ang(i)) * r * 0.38 - z];
    for (let i = 0; i < n; i++) { const [x1, y1] = P(i, R, 0), [x2, y2] = P(i + 1, R, 0), [bx, by] = [cx, cy + 380], vis = Math.sin(ang(i + 0.5)) > -0.2;
      if (!vis) continue; const luz = 0.5 + 0.5 * Math.cos(ang(i + 0.5) - 0.8); c.fillStyle = mistura("#6f5a48", "#a88b6e", luz); caminho(c, [[x1, y1], [x2, y2], [bx, by]]); c.fill(); }
    const topo = [...Array(n)].map((_, i) => P(i, R, 0)); caminho(c, topo); c.fillStyle = "#86b45f"; c.fill();
    for (let i = 0; i < n; i++) { const [x1, y1] = P(i, R, 0), [x2, y2] = P(i + 1, R, 0); c.fillStyle = i % 2 ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.05)"; caminho(c, [[x1, y1], [x2, y2], [cx, cy]]); c.fill(); }
    const obj = [[0.3, 160, "arv"], [2.2, 180, "arv"], [4.1, 120, "casa"], [5.5, 200, "arv"], [6.6, 90, "arv"]].map(([i, r, tp]) => [...P(i, r, 0), tp, Math.sin(ang(i))]).sort((p, q) => p[3] - q[3]);
    obj.forEach(([x, y, tp]) => { if (tp === "arv") { c.fillStyle = "#4f7d3f"; caminho(c, [[x - 40, y], [x, y - 140], [x, y]]); c.fill(); c.fillStyle = "#3d6631"; caminho(c, [[x, y], [x, y - 140], [x + 40, y]]); c.fill(); }
      else { c.fillStyle = "#e8d5c4"; c.fillRect(x - 50, y - 70, 100, 70); c.fillStyle = CLAUDE.terracota; caminho(c, [[x - 62, y - 70], [x, y - 125], [x + 62, y - 70]]); c.fill(); } });
    const [wx, wy] = P(1.2, R, 0); if (Math.sin(ang(1.2)) > 0) for (let k = 0; k < 10; k++) { const u = ((t * 1.5 + k / 10) % 1); c.fillStyle = `rgba(160,210,240,${0.8 * (1 - u)})`; c.fillRect(wx - 12 + Math.sin(k) * 4, wy + u * 380, 24, 30); }
    for (let i = 0; i < 3; i++) { const x = ((t / DUR) * 600 + i * 400) % 1300 - 100, y = 200 + i * 300; c.fillStyle = "rgba(255,255,255,.85)"; caminho(c, [[x, y], [x + 60, y - 40], [x + 140, y - 30], [x + 180, y], [x + 90, y + 20]]); c.fill(); }
  },
});

semente({
  id: "tunel-aneis", nome: "Túnel de anéis", grupo: "cenas", formato: "16:9",
  resumo: "Anéis de luz vindo na direção da câmera em loop infinito, cores mudando. Transição, energia, velocidade.",
  receita: `Cena 16:9 abstrata de túnel em perspectiva (loop infinito).
Estrutura: anéis (círculos ou polígonos) nascem no ponto de fuga e crescem em direção à câmera, desaparecendo nas bordas; linhas radiais de velocidade; o ponto de fuga oscila levemente para dar curva.
Visual: fundo escuro, anéis em gradiente de cores (terracota, âmbar, roxo), brilho aditivo, partículas.
Movimento: velocidade constante com escala exponencial (o loop é exato porque cada anel substitui o seguinte), rotação lenta do conjunto.
Use para: transições, abertura energética, "entrando no assunto", música eletrônica.`,
  cena(c, t, W, H) {
    c.fillStyle = "#0d0b10"; c.fillRect(0, 0, W, H);
    const fx = W / 2 + 80 * ciclo(t), fy = H / 2 + 40 * ciclo(t, 2), n = 18, u = (t / DUR) * 4 % 1;
    c.save(); c.globalCompositeOperation = "lighter";
    for (let i = n - 1; i >= 0; i--) { const d = (i + 1 - u) / n, s = Math.pow(1 / d, 1.6) * 20, x = lerp(W / 2, fx, d), y = lerp(H / 2, fy, d);
      const cor = ["217,119,87", "233,185,73", "142,124,195"][(i + Math.floor((t / DUR) * 4 * 1)) % 3]; c.strokeStyle = `rgba(${cor},${clamp(1.2 - (1 - d) * 0.2) * clamp(2 - s / 1200)})`; c.lineWidth = Math.max(2, s * 0.04);
      c.save(); c.translate(x, y); c.rotate(t * 0.3 + i * 0.1); c.beginPath(); for (let k = 0; k <= 6; k++) { const a = (k / 6) * Math.PI * 2; c.lineTo(Math.cos(a) * s, Math.sin(a) * s); } c.stroke(); c.restore(); }
    const r = rng(3); for (let i = 0; i < 60; i++) { const a = r() * 7, v = ((r() + t * 0.8) % 1), d = Math.pow(v, 2) * 1200; c.strokeStyle = `rgba(255,240,220,${v * 0.6})`; c.lineWidth = 2;
      c.beginPath(); c.moveTo(fx + Math.cos(a) * d, fy + Math.sin(a) * d); c.lineTo(fx + Math.cos(a) * d * 1.15, fy + Math.sin(a) * d * 1.15); c.stroke(); }
    c.restore();
  },
});

semente({
  id: "jardim-crescendo", nome: "Jardim crescendo", grupo: "cenas", formato: "16:9",
  resumo: "Brotos saem da terra, caules sobem em curvas, folhas abrem e flores desabrocham. Crescimento em timelapse.",
  receita: `Cena 16:9 de crescimento em timelapse (metáfora de progresso).
Estrutura: corte do solo com terra em camadas; sementes germinam; caules crescem em curvas com folhas que se abrem em pares; botões desabrocham em flores de cores diferentes; um sol se move em arco.
Visual: ilustração plana com contornos suaves, verdes variados, céu claro, raízes visíveis no corte da terra.
Movimento: crescimento por traço (o caule se desenha), folhas com escala 0→1 a partir do nó, flores com rotação de pétalas; tudo volta à semente no fim para o loop.
Use para: crescimento de canal/negócio, aprendizado, paciência, sustentabilidade.`,
  cena(c, t, W, H) {
    const g = c.createLinearGradient(0, 0, 0, H * 0.7); g.addColorStop(0, "#cfe8f3"); g.addColorStop(1, "#f6efdc"); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const sa = Math.PI + (t / DUR) * Math.PI; c.fillStyle = "#f7d27a"; c.beginPath(); c.arc(W / 2 + Math.cos(sa) * 800, 760 + Math.sin(sa) * 600, 70, 0, 7); c.fill();
    c.fillStyle = "#7a5638"; c.fillRect(0, 760, W, H - 760); c.fillStyle = "#664530"; c.fillRect(0, 880, W, H - 880); c.fillStyle = "#8e6a48"; c.fillRect(0, 760, W, 16);
    const cresce = sai(fase(t, 0.2, 3.4)) * (1 - fase(t, 4.4, 4.95));
    [[400, 1.0, "#e07a5f", 0], [800, 1.3, "#e9b949", 0.3], [1200, 0.9, "#8e7cc3", 0.15], [1560, 1.15, "#f28fad", 0.4]].forEach(([x, alt, cor, at], i) => {
      const k = clamp((cresce - at * 0.3) / (1 - at * 0.3)); if (k <= 0) return; const r = rng(i + 3);
      c.strokeStyle = "#8a6a4a"; c.lineWidth = 4; for (let j = 0; j < 4; j++) { c.beginPath(); c.moveTo(x, 770); c.quadraticCurveTo(x + (r() - 0.5) * 80, 820, x + (r() - 0.5) * 120, 770 + 120 * k); c.stroke(); }
      const pts = [...Array(30)].map((_, j) => { const u = j / 29; return [x + Math.sin(u * 4 + i) * 40 * u, 770 - u * 480 * alt]; });
      c.strokeStyle = "#5f8a52"; c.lineWidth = 12; c.lineCap = "round"; tracar(c, pts, k, false);
      [0.35, 0.6, 0.8].forEach((pf, j) => { const fk = clamp((k - pf) / 0.2); if (fk <= 0) return; const [px, py] = pts[Math.floor(pf * 29)];
        [-1, 1].forEach((lado) => { c.save(); c.translate(px, py); c.rotate(lado * 0.9 + 0.08 * ciclo(t + j)); c.scale(fk, fk); c.fillStyle = j % 2 ? "#6fa05a" : "#7fb36a"; c.beginPath(); c.ellipse(lado * 40, 0, 44, 16, 0, 0, 7); c.fill(); c.restore(); }); });
      const fk = clamp((k - 0.9) / 0.1); if (fk > 0) { const [px, py] = pts[29]; c.save(); c.translate(px, py); c.rotate(t * 0.3); c.scale(fk, fk);
        for (let p = 0; p < 7; p++) { c.rotate((Math.PI * 2) / 7); c.fillStyle = cor; c.beginPath(); c.ellipse(0, -40, 22, 40, 0, 0, 7); c.fill(); } c.fillStyle = "#f6e27a"; c.beginPath(); c.arc(0, 0, 20, 0, 7); c.fill(); c.restore(); }
    });
  },
});

semente({
  id: "cabana-neve", nome: "Cabana na neve", grupo: "cenas", formato: "16:9",
  resumo: "Cabana iluminada no meio da neve, fumaça saindo da chaminé, flocos caindo em três profundidades. Inverno aconchegante.",
  receita: `Cena 16:9 de inverno em loop.
Estrutura: colinas nevadas em camadas, pinheiros com neve, uma cabana de madeira com janelas quentes e fumaça na chaminé, céu de fim de tarde azulado; neve caindo em três planos (perto: flocos grandes e desfocados; longe: pequenos e lentos).
Visual: contraste frio (azuis e brancos) contra o quente das janelas, brilho suave nas janelas refletido na neve.
Movimento: neve periódica (loop exato), fumaça em volutas que sobem e somem, luz da janela tremulando como lareira.
Use para: fim de ano, histórias, calma, fundo de música.`,
  cena(c, t, W, H) {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#5c6f9c"); g.addColorStop(0.6, "#b7c3dc"); g.addColorStop(1, "#e6ecf5"); c.fillStyle = g; c.fillRect(0, 0, W, H);
    [["#d7deec", 640, 1], ["#e9eef6", 760, 2]].forEach(([cor, y0, s]) => { c.fillStyle = cor; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 20) c.lineTo(x, y0 - 60 * Math.sin(x / 400 + s)); c.lineTo(W, H); c.fill(); });
    const r = rng(4); for (let i = 0; i < 12; i++) { const x = r() * W, y = 640 + r() * 120, h = 140 + r() * 120; c.fillStyle = "#3e5a52"; caminho(c, [[x, y - h], [x + h * 0.35, y], [x - h * 0.35, y]]); c.fill(); c.fillStyle = "#f4f7fb"; caminho(c, [[x, y - h], [x + h * 0.12, y - h * 0.65], [x - h * 0.12, y - h * 0.65]]); c.fill(); }
    const cx = 960, cy = 800, fogo = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 7);
    const brilho = c.createRadialGradient(cx, cy, 0, cx, cy, 380); brilho.addColorStop(0, `rgba(255,190,110,${0.35 * fogo})`); brilho.addColorStop(1, "rgba(255,190,110,0)"); c.fillStyle = brilho; c.fillRect(0, 0, W, H);
    c.fillStyle = "#6b4a33"; c.fillRect(cx - 200, cy - 180, 400, 180); c.fillStyle = "#4a3324"; c.fillRect(cx + 90, cy - 330, 50, 120);
    c.fillStyle = "#f4f7fb"; caminho(c, [[cx - 240, cy - 170], [cx, cy - 330], [cx + 240, cy - 170], [cx + 240, cy - 150], [cx, cy - 300], [cx - 240, cy - 150]]); c.fill();
    c.fillStyle = "#5a3d2a"; caminho(c, [[cx - 230, cy - 160], [cx, cy - 300], [cx + 230, cy - 160]]); c.fill();
    c.fillStyle = `rgba(255,200,110,${fogo})`; c.fillRect(cx - 150, cy - 130, 80, 70); c.fillRect(cx + 70, cy - 130, 80, 70); c.fillStyle = "#3a2618"; c.fillRect(cx - 30, cy - 110, 60, 110);
    for (let i = 0; i < 5; i++) { const u = ((t / DUR) * 2 + i / 5) % 1; c.fillStyle = `rgba(230,235,245,${0.5 * (1 - u)})`; c.beginPath(); c.arc(cx + 115 + Math.sin(u * 5 + i) * 30 + u * 60, cy - 340 - u * 300, 20 + u * 40, 0, 7); c.fill(); }
    c.fillStyle = "#f4f7fb"; c.fillRect(0, cy, W, H - cy);
    [[120, 3, 0.4, 60], [80, 6, 0.7, 120], [30, 12, 1, 220]].forEach(([qt, tam, al, vel], pl) => { const rr3 = rng(pl + 20); for (let i = 0; i < qt; i++) { const x0 = rr3() * W, y0 = rr3() * H, y = (y0 + (t / DUR) * H) % H, x = x0 + 20 * Math.sin((t / DUR) * Math.PI * 2 + i);
      c.fillStyle = `rgba(255,255,255,${al})`; c.beginPath(); c.arc(x, y, tam, 0, 7); c.fill(); } });
  },
});

semente({
  id: "trem-noturno", nome: "Trem noturno", grupo: "cenas", formato: "16:9",
  resumo: "Um trem com janelas acesas atravessa a ponte em silhueta contra o céu do anoitecer, reflexo no lago. Viagem e passagem.",
  receita: `Cena 16:9 em silhueta ao anoitecer.
Estrutura: céu em gradiente (laranja ao azul-escuro) com as primeiras estrelas, uma ponte em arcos sobre um lago, um trem longo com janelas iluminadas atravessando, reflexo de tudo na água com ondulação.
Visual: silhuetas chapadas em azul quase preto, janelas em amarelo quente, reflexo cortado por faixas horizontais de onda.
Movimento: trem em velocidade constante (os vagões se repetem: loop exato), reflexo ondulando, estrelas cintilando.
Use para: transições de capítulo, "a jornada", viagens, histórias, música.`,
  cena(c, t, W, H) {
    const hz = 680, g = c.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, "#1a2240"); g.addColorStop(0.6, "#7a4b6b"); g.addColorStop(1, "#f29e6d"); c.fillStyle = g; c.fillRect(0, 0, W, hz);
    const r = rng(2); for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(255,255,255,${(0.3 + 0.5 * Math.abs(Math.sin(t * 2 + i))) * (1 - r() * 0.5)})`; c.fillRect(r() * W, r() * hz * 0.5, 2, 2); }
    const cena = () => {
      c.fillStyle = "#151a2c"; c.beginPath(); c.moveTo(0, hz); for (let x = 0; x <= W; x += 30) c.lineTo(x, hz - 60 - 40 * Math.sin(x / 300)); c.lineTo(W, hz); c.fill();
      c.fillStyle = "#10142a"; c.fillRect(0, 470, W, 34);
      for (let i = 0; i < 6; i++) { const x = 60 + i * 320; c.beginPath(); c.moveTo(x, 504); c.lineTo(x + 40, 504); c.lineTo(x + 40, hz); c.lineTo(x, hz); c.fill(); c.beginPath(); c.moveTo(x + 40, 504); c.quadraticCurveTo(x + 160, 620, x + 280, 504); c.lineTo(x + 280, 520); c.quadraticCurveTo(x + 160, 640, x + 40, 520); c.fill(); }
      const vel = (W + 1200) / DUR, x0 = ((t * vel) % (W + 1200)) - 1200;
      for (let v = 0; v < 6; v++) { const x = x0 + v * 200; c.fillStyle = "#10142a"; rr(c, x, 380, 190, 90, v === 5 ? [10, 40, 10, 10] : 10); c.fill();
        for (let j = 0; j < 4; j++) { c.fillStyle = `rgba(255,214,140,${0.85 + 0.15 * Math.sin(t * 9 + v + j)})`; c.fillRect(x + 16 + j * 42, 400, 28, 26); } }
    };
    cena();
    c.save(); c.translate(0, hz * 2); c.scale(1, -1); c.beginPath(); c.rect(0, 0, W, hz); c.clip(); c.globalAlpha = 0.45; cena(); c.restore();
    c.fillStyle = "rgba(20,26,44,.55)"; c.fillRect(0, hz, W, H - hz);
    for (let y = hz + 6; y < H; y += 14) { c.fillStyle = `rgba(255,200,150,${0.06 + 0.04 * Math.sin(y + t * 6)})`; c.fillRect(0, y, W, 3); }
  },
});
