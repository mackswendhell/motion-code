// Grupo Texturas artesanais: giz, aquarela, risografia, papel e tinta.

semente({
  id: "giz-lousa", nome: "Giz na lousa", grupo: "artesanal", formato: "16:9",
  resumo: "Lousa verde-escura, traço de giz falhado com poeira, desenho e fórmula se construindo. Aula com cara de sala.",
  receita: `Explicador 16:9 em lousa com giz.
Estrutura: título escrito no topo e sublinhado; um desenho simples se constrói (traço por traço) e, ao lado, setas e anotações; um "apagado" antigo aparece ao fundo.
Visual: lousa verde-escura (#2f4a3c) com manchas de apagador, giz branco com falhas (o traço é feito de muitos pontos com opacidade variada), um giz amarelo para destaque; moldura de madeira.
Movimento: traços sempre em construção, poeira de giz caindo da ponta.
Use para: aula, matemática, explicar com cara de professor.`,
  cena(c, t, W, H) {
    c.fillStyle = "#6d4c33"; c.fillRect(0, 0, W, H); c.fillStyle = "#2f4a3c"; c.fillRect(40, 40, W - 80, H - 80);
    c.save(); c.globalAlpha = 0.25; c.globalCompositeOperation = "soft-light"; c.fillStyle = padraoGrao(c); c.fillRect(40, 40, W - 80, H - 80); c.restore();
    c.fillStyle = "rgba(255,255,255,.04)"; c.beginPath(); c.ellipse(1400, 700, 420, 120, -0.2, 0, 7); c.fill(); c.beginPath(); c.ellipse(500, 860, 300, 90, 0.1, 0, 7); c.fill();
    const giz = (pts, k, cor = "245,245,235", larg = 8) => {
      const p = pts.slice(0, Math.max(2, Math.ceil(pts.length * k))); const r = rng(pts.length);
      for (let i = 1; i < p.length; i++) { const [ax, ay] = p[i - 1], [bx, by] = p[i], n = Math.ceil(Math.hypot(bx - ax, by - ay) / 2);
        for (let j = 0; j < n; j++) { const u = j / n; if (r() < 0.2) continue; c.fillStyle = `rgba(${cor},${0.5 + r() * 0.5})`; c.fillRect(lerp(ax, bx, u) + (r() - 0.5) * larg, lerp(ay, by, u) + (r() - 0.5) * larg, 2 + r() * 2, 2 + r() * 2); } }
      return p[p.length - 1];
    };
    const v = 1 - fase(t, 4.6, 4.95); c.globalAlpha = v;
    texto(c, digita("Teorema de Pitágoras", fase(t, 0.1, 1.0)), 200, 170, { tam: 70, fonte: MAO, alinha: "left", cor: "rgba(245,245,235,.9)" });
    const lin = (a, b, n = 40) => [...Array(n + 1)].map((_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]);
    giz(lin([200, 220], [900, 225]), fase(t, 0.9, 1.2));
    const A = [400, 850], B = [1000, 850], C = [400, 400];
    let ponta = giz([...lin(A, B), ...lin(B, C), ...lin(C, A)], fase(t, 1.2, 2.6), "245,245,235", 6);
    giz(lin([400, 800], [450, 800], 10).concat(lin([450, 800], [450, 850], 10)), fase(t, 2.6, 2.8));
    texto(c, "a", 340, 625, { tam: 60, fonte: MAO, cor: "#f5f5eb", alpha: fase(t, 2.8, 3) }); texto(c, "b", 700, 910, { tam: 60, fonte: MAO, cor: "#f5f5eb", alpha: fase(t, 2.9, 3.1) }); texto(c, "c", 740, 590, { tam: 60, fonte: MAO, cor: "#f5f5eb", alpha: fase(t, 3, 3.2) });
    texto(c, digita("a² + b² = c²", fase(t, 3.2, 4.0)), 1200, 600, { tam: 96, fonte: MAO, alinha: "left", cor: "#f2d65a" });
    if (t > 1.2 && t < 2.6) { const r = rng(Math.floor(t * 20)); for (let i = 0; i < 6; i++) { c.fillStyle = "rgba(245,245,235,.6)"; c.fillRect(ponta[0] + (r() - 0.5) * 20, ponta[1] + r() * 80 * ((t * 10) % 1), 2, 2); } }
    c.globalAlpha = 1;
  },
});

semente({
  id: "aquarela-floresce", nome: "Aquarela que floresce", grupo: "artesanal", formato: "1:1",
  resumo: "Manchas de aquarela se espalham no papel molhado, as cores se misturam nas bordas e o título aparece em tinta.",
  receita: `Vídeo 1:1 em aquarela.
Estrutura: gotas de tinta caem no papel e florescem (manchas que crescem com borda mais escura e interior lavado); as cores se encontram e se misturam; por cima, uma ilustração em traço fino de nanquim e o título em letra cursiva.
Visual: papel de aquarela com textura de algodão, paleta de 3 cores (pêssego, sálvia, azul lavado), bordas irregulares com acúmulo de pigmento.
Movimento: crescimento orgânico e desacelerado, leve pulsação do pigmento, traço de nanquim por último.
Use para: temas delicados, bem-estar, natureza, histórias afetivas.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#faf6ee", { grao: 0.2, vinheta: 0.15 });
    const gotas = [[380, 420, "#e8a07a", 0.1], [640, 520, "#9cb58a", 0.6], [520, 700, "#86a8c9", 1.1], [760, 330, "#e9c27a", 1.5]];
    const v = 1 - fase(t, 4.5, 4.95);
    gotas.forEach(([x, y, cor, t0], i) => {
      const k = sai(fase(t, t0, t0 + 1.6)) * v; if (k <= 0) return; const R = 260 * k, r = rng(i + 5);
      for (let j = 0; j < 7; j++) { const pts = [...Array(30)].map((_, a) => { const an = (a / 30) * Math.PI * 2; return [x + Math.cos(an) * R * (0.75 + 0.3 * Math.sin(an * 3 + j + i)), y + Math.sin(an) * R * (0.75 + 0.3 * Math.cos(an * 2 + j))]; });
        caminho(c, tremido(pts, 10, r, 2)); c.globalAlpha = 0.12; c.fillStyle = cor; c.fill(); c.globalAlpha = 0.18; c.strokeStyle = cor; c.lineWidth = 3; c.stroke(); }
      c.globalAlpha = 1;
    });
    c.save(); c.globalAlpha = 0.1; c.globalCompositeOperation = "multiply"; c.fillStyle = padraoGrao(c); c.fillRect(0, 0, W, H); c.restore();
    c.strokeStyle = "#3a3632"; c.lineWidth = 3; c.lineCap = "round";
    const folha = [...Array(40)].map((_, i) => { const u = i / 39; return [400 + u * 300, 700 - Math.sin(u * Math.PI) * 120 - u * 200]; });
    c.globalAlpha = v; tracar(c, folha, fase(t, 2.2, 3.0), false);
    texto(c, "respira", W / 2, 900, { tam: 110, fonte: "Snell Roundhand, Brush Script MT, " + MAO, cor: "#3a3632", alpha: fase(t, 2.8, 3.5) * v });
    c.globalAlpha = 1;
  },
});

semente({
  id: "risografia", nome: "Risografia", grupo: "artesanal", formato: "1:1",
  resumo: "Duas cores de tinta fora de registro, retícula de pontos e grão de impressão. Cartaz de zine que se mexe.",
  receita: `Vídeo 1:1 com estética de risografia (impressão em 2 cores).
Estrutura: um cartaz: forma grande (sol, rosto, objeto), título em grotesca e pequenos detalhes; tudo impresso em 2 camadas de cor (rosa-fluor e azul) que se sobrepõem em multiply e ficam levemente desalinhadas.
Visual: retícula de pontos nas sombras, grão de tinta, falhas de impressão, papel off-white.
Movimento: as camadas "tremem" de registro (deslocamento de 3 a 6 px que muda 6 vezes por segundo), a forma gira devagar, retícula muda de densidade.
Use para: cultura, música, eventos, conteúdo com personalidade.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#f4efe4", { grao: 0.25, vinheta: 0.08 });
    const reg = Math.floor(t * 6), r = rng(reg), camada = (cor, dx, dy, f) => { c.save(); c.translate(dx, dy); c.globalCompositeOperation = "multiply"; c.fillStyle = cor; c.strokeStyle = cor; f(); c.restore(); };
    const sol = () => { c.save(); c.translate(W / 2, 470); c.rotate(t * 0.25); c.beginPath(); for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, rr2 = i % 2 ? 230 : 300; c.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } c.fill(); c.restore(); };
    const ret = () => { for (let y = 200; y < 760; y += 18) for (let x = 200; x < 880; x += 18) { const d = Math.hypot(x - W / 2 - 60, y - 520) / 380; const s = 7 * clamp(1 - d) * (0.8 + 0.2 * ciclo(t)); if (s > 0.5) { c.beginPath(); c.arc(x, y, s, 0, 7); c.fill(); } } };
    camada("#ff5c8a", (r() - 0.5) * 8, (r() - 0.5) * 8, sol);
    camada("#3d6ee0", (r() - 0.5) * 8 + 4, (r() - 0.5) * 8, ret);
    camada("#3d6ee0", (r() - 0.5) * 6, (r() - 0.5) * 6, () => { c.font = `900 150px ${GROSSA}`; c.textAlign = "center"; c.fillText("NOITE", W / 2, 930); });
    camada("#ff5c8a", 3 + (r() - 0.5) * 6, 3, () => { c.font = `700 40px ${MONO}`; c.textAlign = "center"; c.fillText("SEX · 22H · GALPÃO 4", W / 2, 1010); });
    c.save(); c.globalAlpha = 0.25; c.globalCompositeOperation = "screen"; const r2 = rng(reg + 9); for (let i = 0; i < 30; i++) { c.fillStyle = "#fff"; c.fillRect(r2() * W, r2() * H, 20 + r2() * 80, 2); } c.restore();
  },
});

semente({
  id: "planta-tecnica", nome: "Planta técnica", grupo: "artesanal", formato: "16:9",
  resumo: "Papel azul de projeto, linhas brancas finas com cotas e medidas se desenhando. Engenharia e construção de ideias.",
  receita: `Vídeo 16:9 em estilo blueprint (planta técnica).
Estrutura: grade fina sobre azul de projeto; o objeto é desenhado em linhas brancas (vista de frente e lateral), com cotas, setas de medida e notas em letra técnica; carimbo de projeto no canto inferior direito com título e data.
Visual: azul #1f4e8c com textura de papel, linhas brancas de 2 px, linhas de construção tracejadas mais fracas, círculos de detalhe ampliado.
Movimento: linhas de construção primeiro, depois contorno firme, depois cotas; pequena aproximação no detalhe.
Use para: explicar como algo é feito, arquitetura de sistema, "o projeto por trás".`,
  cena(c, t, W, H) {
    c.fillStyle = "#1f4e8c"; c.fillRect(0, 0, W, H);
    c.save(); c.globalAlpha = 0.15; c.globalCompositeOperation = "soft-light"; c.fillStyle = padraoGrao(c); c.fillRect(0, 0, W, H); c.restore();
    c.strokeStyle = "rgba(255,255,255,.08)"; c.lineWidth = 1; for (let x = 0; x < W; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    const v = 1 - fase(t, 4.6, 4.95), L = (pts, k, a = 0.95, larg = 3, tr = false) => { c.save(); c.globalAlpha = a * v; c.strokeStyle = "#fff"; c.lineWidth = larg; if (tr) c.setLineDash([10, 8]); tracar(c, pts, k, false); c.restore(); };
    L([[200, 820], [1700, 820]], fase(t, 0.1, 0.6), 0.4, 1.5, true); L([[960, 120], [960, 960]], fase(t, 0.2, 0.7), 0.4, 1.5, true);
    const casa = [[600, 820], [600, 520], [960, 280], [1320, 520], [1320, 820], [600, 820]];
    L(casa, fase(t, 0.7, 1.8));
    L([[880, 820], [880, 640], [1040, 640], [1040, 820]], fase(t, 1.6, 2.1));
    L([[680, 580], [800, 580], [800, 680], [680, 680], [680, 580]], fase(t, 1.9, 2.3)); L([[1120, 580], [1240, 580], [1240, 680], [1120, 680], [1120, 580]], fase(t, 2.0, 2.4));
    const cota = fase(t, 2.4, 2.9);
    L([[600, 900], [1320, 900]], cota, 0.9, 2); L([[600, 880], [600, 920]], cota); L([[1320, 880], [1320, 920]], cota);
    texto(c, "7,20 m", 960, 930, { tam: 30, fonte: MONO, cor: "#fff", alpha: cota * v });
    L([[1420, 280], [1420, 820]], fase(t, 2.6, 3.1), 0.9, 2); texto(c, "5,40 m", 1470, 550, { tam: 30, fonte: MONO, cor: "#fff", alinha: "left", alpha: fase(t, 2.8, 3.1) * v });
    c.save(); c.globalAlpha = fase(t, 3.1, 3.5) * v; c.strokeStyle = "#fff"; c.lineWidth = 2; c.strokeRect(W - 460, H - 210, 400, 150);
    texto(c, "CASA DO ESTÚDIO", W - 440, H - 170, { tam: 28, fonte: MONO, peso: 700, alinha: "left", cor: "#fff" });
    texto(c, "fachada · esc. 1:50 · 2026", W - 440, H - 110, { tam: 22, fonte: MONO, alinha: "left", cor: "#cfe0f5" }); c.restore();
  },
});

semente({
  id: "linogravura", nome: "Linogravura", grupo: "artesanal", formato: "1:1",
  resumo: "Preto chapado com sulcos brancos de goiva, um vermelho só, sol girando. Cordel e gravura popular.",
  receita: `Vídeo 1:1 em linogravura / xilogravura de cordel.
Estrutura: cena em silhueta preta (paisagem, figura, casa) recortada por sulcos brancos de goiva que fazem as texturas; um único elemento em vermelho (sol, coração, bandeira); moldura de linhas grossas e título em letras talhadas.
Visual: preto profundo sobre papel creme, sulcos em feixes paralelos, falhas de tinta nas bordas.
Movimento: elementos com movimento simples e mecânico (sol girando, pássaro de 2 quadros, fumaça em ciclo), 12 quadros por segundo para parecer impresso.
Use para: cultura popular, Nordeste, histórias, música regional.`,
  cena(c, t, W, H) {
    const tq = Math.floor(t * 12) / 12;
    fundo(c, W, H, "#efe5d0", { grao: 0.3, vinheta: 0.2 });
    c.fillStyle = "#151311"; c.fillRect(60, 60, W - 120, H - 120); c.fillStyle = "#efe5d0"; c.fillRect(80, 80, W - 160, H - 160);
    c.save(); c.translate(W / 2, 400); c.rotate(tq * 0.6); c.fillStyle = "#c0322b"; c.beginPath(); c.arc(0, 0, 120, 0, 7); c.fill();
    for (let i = 0; i < 16; i++) { c.rotate(Math.PI / 8); c.beginPath(); c.moveTo(-14, -150); c.lineTo(0, -230); c.lineTo(14, -150); c.fill(); } c.restore();
    c.fillStyle = "#151311"; c.beginPath(); c.moveTo(80, 760); c.bezierCurveTo(300, 560, 500, 700, 620, 620); c.bezierCurveTo(760, 540, 900, 640, W - 80, 560); c.lineTo(W - 80, H - 80); c.lineTo(80, H - 80); c.fill();
    c.strokeStyle = "#efe5d0"; c.lineWidth = 4; const r = rng(3);
    for (let i = 0; i < 60; i++) { const x = 100 + r() * (W - 200), y = 760 + r() * 220, l = 20 + r() * 50; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y - 6, x + l, y); c.stroke(); }
    c.fillStyle = "#151311"; c.fillRect(700, 560, 180, 160); c.beginPath(); c.moveTo(680, 570); c.lineTo(790, 480); c.lineTo(900, 570); c.fill();
    c.fillStyle = "#efe5d0"; c.fillRect(770, 640, 40, 80);
    for (let i = 0; i < 3; i++) { const k = ((tq + i * 0.33) % 1); c.globalAlpha = 1 - k; c.fillStyle = "#151311"; c.beginPath(); c.arc(840 + Math.sin(k * 6) * 15, 470 - k * 200, 14 + k * 20, 0, 7); c.fill(); } c.globalAlpha = 1;
    const asa = Math.floor(t * 6) % 2; c.strokeStyle = "#151311"; c.lineWidth = 8; c.beginPath(); const px = 300 + ((t / DUR) * 500), py = 300; c.moveTo(px - 40, py + (asa ? -20 : 10)); c.lineTo(px, py); c.lineTo(px + 40, py + (asa ? -20 : 10)); c.stroke();
    texto(c, "O SOL DO SERTÃO", W / 2, H - 140, { tam: 72, fonte: GROSSA, cor: "#efe5d0" });
  },
});

semente({
  id: "stop-motion-papel", nome: "Stop motion de papel", grupo: "artesanal", formato: "16:9",
  resumo: "Cenário de papel recortado em camadas, tudo se mexe a 8 quadros por segundo com tremidinho. Feito à mão de verdade.",
  receita: `Vídeo 16:9 em stop motion de papel recortado.
Estrutura: cenário em camadas de papel (céu, montanhas, chão, casa, árvore) com sombras entre as camadas; personagens e objetos se mexem em poses discretas; nuvens presas em "palitos" passam.
Visual: papéis coloridos foscos com borda levemente irregular e textura, sombra projetada curta, luz quente de cima.
Movimento: tudo a 8 quadros por segundo, com tremido de 1 a 2 px entre poses (cada pose é uma "foto"); câmera parada.
Use para: histórias infantis, explicadores afetivos, marca artesanal.`,
  cena(c, t, W, H) {
    const pose = Math.floor(t * 8), tr = () => (rng(pose * 7 + 1)() - 0.5) * 3;
    const camada = (cor, pts, seed, dy = 0) => { c.save(); c.translate(tr(), dy + tr()); c.shadowColor = "rgba(40,25,10,.3)"; c.shadowBlur = 14; c.shadowOffsetY = 6; caminho(c, tremido(pts, 3, rng(seed), 2)); c.fillStyle = cor; c.fill();
      c.shadowColor = "transparent"; c.globalAlpha = 0.15; c.globalCompositeOperation = "multiply"; c.fillStyle = padraoGrao(c); c.fill(); c.restore(); };
    c.fillStyle = "#bfe0e6"; c.fillRect(0, 0, W, H);
    const sx = 1500, sy = 220; camada("#f6c453", [...Array(16)].map((_, i) => [sx + Math.cos(i * 0.39) * 90, sy + Math.sin(i * 0.39) * 90]), 3);
    [[0, 260, 1], [0.5, 160, 2]].forEach(([fs, y, s]) => { const x = ((Math.floor((t / DUR) * 40) / 40 + fs) % 1) * (W + 400) - 200; c.fillStyle = "#8a7a62"; c.fillRect(x + 80, 0, 4, y);
      camada("#fff", [[x, y], [x + 60, y - 50], [x + 120, y - 60], [x + 180, y - 30], [x + 200, y + 10], [x, y + 10]], 9 + s); });
    camada("#7fa36a", [[0, 700], [300, 420], [600, 680], [900, 380], [1300, 700], [1600, 450], [W, 650], [W, H], [0, H]], 5);
    camada("#5f8a52", [[0, 820], [500, 700], [1100, 790], [W, 720], [W, H], [0, H]], 6);
    camada("#d97757", [[700, 820], [700, 640], [860, 520], [1020, 640], [1020, 820]], 7);
    camada("#3d3929", [[830, 820], [830, 720], [890, 720], [890, 820]], 8);
    const pul = pose % 4 < 2 ? 0 : -14, cx = 300 + Math.floor((t / DUR) * 30) * 22;
    camada("#3d3929", [[cx - 30, 900 + pul], [cx + 30, 900 + pul], [cx + 30, 820 + pul], [cx - 30, 820 + pul]], 11);
    camada("#f0d2b6", [...Array(10)].map((_, i) => [cx + Math.cos(i * 0.63) * 34, 780 + pul + Math.sin(i * 0.63) * 34]), 12);
  },
});

semente({
  id: "rabisco-margem", nome: "Rabiscos de caderno", grupo: "artesanal", formato: "9:16",
  resumo: "Caneta esferográfica azul rabiscando ícones, setas e balões na página quadriculada. Anotações de quem entende.",
  receita: `Vídeo vertical 9:16 de anotações em caderno quadriculado.
Estrutura: a página mostra uma ideia central escrita à mão; ao redor surgem rabiscos que explicam (ícones simples, setas curvas, balões, estrelas, sublinhados duplos, pequenos desenhos); cada rabisco aparece no ritmo da fala.
Visual: papel quadriculado claro, caneta esferográfica azul com pressão variável (traço mais grosso no meio), marca-texto laranja em uma palavra.
Movimento: traços se desenham com tremido de mão, câmera passeia levemente de um rabisco ao outro.
Use para: estudo, resumo, ideias, "minhas anotações sobre X".`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#fbfbf7", { grao: 0.08, vinheta: 0.15 });
    c.strokeStyle = "rgba(100,140,190,.18)"; c.lineWidth = 2; for (let x = 0; x < W; x += 54) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 54) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    const cam = 60 * ciclo(t), azul = "#1d3f91", v = 1 - fase(t, 4.6, 4.95);
    c.save(); c.translate(0, cam); c.globalAlpha = v;
    const bic = (pts, k, larg = 5) => { c.strokeStyle = azul; c.lineWidth = larg; c.lineCap = c.lineJoin = "round"; tracar(c, tremido(pts, 2.5, rng(pts.length), 2), k, false); };
    c.save(); c.globalCompositeOperation = "multiply"; c.fillStyle = "rgba(255,170,90,.6)"; c.fillRect(250, 900, 580 * fase(t, 1.0, 1.4), 90); c.restore();
    texto(c, "foco > tempo", W / 2, 950, { tam: 110, fonte: MAO, cor: azul, alpha: fase(t, 0.1, 0.8) });
    bic([[260, 1020], [820, 1010]], fase(t, 0.8, 1.0)); bic([[270, 1040], [800, 1035]], fase(t, 0.95, 1.1), 3);
    bic([...Array(24)].map((_, i) => [300 + Math.cos(i * 0.28) * 130, 560 + Math.sin(i * 0.28) * 100]), fase(t, 1.3, 1.9));
    texto(c, "1 tarefa", 300, 560, { tam: 50, fonte: MAO, cor: azul, alpha: fase(t, 1.8, 2.1) });
    bic([[400, 640], [470, 760], [520, 840]], fase(t, 1.9, 2.2)); bic([[490, 800], [522, 845], [470, 840]], fase(t, 2.2, 2.3));
    const est = [...Array(11)].map((_, i) => { const a = -Math.PI / 2 + (i / 10) * Math.PI * 2, r = i % 2 ? 30 : 70; return [800 + Math.cos(a) * r, 560 + Math.sin(a) * r]; });
    bic(est, fase(t, 2.3, 2.8));
    bic([[200, 1250], [880, 1250], [880, 1500], [420, 1500], [330, 1580], [350, 1500], [200, 1500], [200, 1250]], fase(t, 2.8, 3.6));
    texto(c, "sem celular perto", 540, 1375, { tam: 64, fonte: MAO, cor: azul, alpha: fase(t, 3.5, 3.9) });
    c.restore();
  },
});

semente({
  id: "carimbos", nome: "Carimbos", grupo: "artesanal", formato: "1:1",
  resumo: "Carimbos de borracha batem na folha formando padrão e palavra, com tinta falhada e sobreposição. Ritmo de batida.",
  receita: `Vídeo 1:1 feito de carimbadas.
Estrutura: um carimbo (forma simples: estrela, coração, letra) bate na folha no ritmo da música, deixando marcas; as marcas formam um padrão e, no fim, uma palavra carimbada letra por letra.
Visual: tinta com falhas e bordas mais carregadas, 2 cores de almofada (terracota e azul-marinho), leve desalinhamento e rotação em cada batida, papel kraft claro.
Movimento: o carimbo desce rápido (sombra crescendo), bate com micro tremor da tela e sobe; a marca aparece na batida.
Use para: vídeo de música, ritmo, marca artesanal, contagem.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#e8dcc4", { grao: 0.3, vinheta: 0.2 });
    const batidas = 12, passo = 4.2 / batidas, n = Math.min(batidas, Math.floor(t / passo) + 1), tr = (t % passo) < 0.05 ? 4 : 0;
    c.save(); c.translate(tr * (rng(n)() - 0.5), 0);
    const marca = (i) => { const r = rng(i + 3), x = i < 6 ? 180 + (i % 3) * 360 + r() * 40 : 0, y = i < 6 ? 220 + Math.floor(i / 3) * 260 : 0;
      c.save(); c.globalCompositeOperation = "multiply";
      if (i < 6) { c.translate(x, y); c.rotate((r() - 0.5) * 0.3); c.fillStyle = i % 2 ? "rgba(193,90,60,.85)" : "rgba(40,50,90,.8)"; c.beginPath(); for (let j = 0; j < 10; j++) { const rr2 = j % 2 ? 40 : 90, a = -Math.PI / 2 + (j / 10) * Math.PI * 2; c.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } c.fill(); }
      else { const L = "FEITO!"[i - 6]; c.translate(170 + (i - 6) * 150, 840); c.rotate((r() - 0.5) * 0.2); c.font = `900 160px ${GROSSA}`; c.textAlign = "center"; c.fillStyle = "rgba(193,90,60,.9)"; c.fillText(L, 0, 0); }
      c.globalCompositeOperation = "destination-out"; for (let k = 0; k < 40; k++) { c.fillStyle = "rgba(0,0,0,.6)"; c.fillRect((r() - 0.5) * 200, (r() - 0.5) * 200 - 40, 3 + r() * 6, 2); }
      c.restore(); };
    for (let i = 0; i < n; i++) marca(i);
    c.restore();
    const u = (t % passo) / passo, alt = u < 0.3 ? 1 - u / 0.3 : u > 0.6 ? (u - 0.6) / 0.4 : 0;
    if (n <= batidas && t < 4.2) { const i = n - 1, x = i < 6 ? 180 + (i % 3) * 360 : 170 + (i - 6) * 150, y = i < 6 ? 220 + Math.floor(i / 3) * 260 : 800;
      c.fillStyle = `rgba(0,0,0,${0.2 * (1 - alt)})`; c.beginPath(); c.ellipse(x + 20, y + 20, 90, 60, 0, 0, 7); c.fill();
      c.fillStyle = "#7a4e2d"; rr(c, x - 60, y - 220 - alt * 200, 120, 160, 20); c.fill(); c.fillStyle = "#333"; c.fillRect(x - 80, y - 70 - alt * 200, 160, 30); }
  },
});

semente({
  id: "ponto-cruz", nome: "Ponto cruz", grupo: "artesanal", formato: "1:1",
  resumo: "Um bordado em ponto cruz se forma X por X no tecido de trama, com a linha correndo. Delicado e paciente.",
  receita: `Vídeo 1:1 de bordado em ponto cruz.
Estrutura: tecido de trama (grade de furinhos) num bastidor redondo de madeira; o desenho (pixel art: coração, flor, palavra curta) aparece X por X na ordem em que se borda, cada cor por vez; a linha com a agulha acompanha a ponta.
Visual: X feitos com dois traços cruzados com brilho de fio, cores de meada suaves, sombra leve do fio sobre o tecido.
Movimento: cada X em 40 ms, a agulha subindo e descendo, o bastidor gira levemente.
Use para: temas afetivos, artesanato, maternidade, paciência e processo.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#d9c7a6", { grao: 0.25, vinheta: 0.3 });
    const cx = W / 2, cy = H / 2;
    c.save(); c.translate(cx, cy); c.rotate(0.03 * ciclo(t));
    c.fillStyle = "#a9773f"; c.beginPath(); c.arc(0, 0, 440, 0, 7); c.fill(); c.fillStyle = "#f4efe3"; c.beginPath(); c.arc(0, 0, 410, 0, 7); c.fill();
    c.save(); c.beginPath(); c.arc(0, 0, 410, 0, 7); c.clip();
    c.fillStyle = "rgba(0,0,0,.12)"; for (let x = -420; x < 420; x += 24) for (let y = -420; y < 420; y += 24) c.fillRect(x, y, 3, 3);
    const mapa = ["..XX...XX..", ".XXXX.XXXX.", "XXXXXXXXXXX", "XXXXXXXXXXX", ".XXXXXXXXX.", "..XXXXXXX..", "...XXXXX...", "....XXX....", ".....X....."];
    const pts = []; mapa.forEach((l, y) => [...l].forEach((ch, x) => ch === "X" && pts.push([x, y])));
    const n = Math.floor(pts.length * fase(t, 0.2, 4.0)), v = 1 - fase(t, 4.5, 4.95); let ultimo = null;
    pts.slice(0, n).forEach(([x, y], i) => { const px = (x - 5) * 48, py = (y - 4) * 48, cor = y < 2 ? "#e06c75" : "#c94a55";
      c.globalAlpha = v; c.strokeStyle = cor; c.lineWidth = 9; c.lineCap = "round"; c.beginPath(); c.moveTo(px - 18, py - 18); c.lineTo(px + 18, py + 18); c.moveTo(px + 18, py - 18); c.lineTo(px - 18, py + 18); c.stroke();
      c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 2; c.beginPath(); c.moveTo(px - 14, py - 16); c.lineTo(px + 14, py + 12); c.stroke(); ultimo = [px, py]; });
    c.restore();
    if (ultimo && t < 4.0) { const [px, py] = ultimo, sobe = 20 * ciclo01(t, 25); c.strokeStyle = "#c94a55"; c.lineWidth = 4; c.beginPath(); c.moveTo(px + 18, py - 18); c.quadraticCurveTo(px + 120, py - 140, px + 180, py - 200 - sobe); c.stroke();
      c.strokeStyle = "#ccc"; c.lineWidth = 6; c.beginPath(); c.moveTo(px + 170, py - 190 - sobe); c.lineTo(px + 260, py - 300 - sobe); c.stroke(); }
    c.restore();
  },
});

semente({
  id: "massinha", nome: "Massinha", grupo: "artesanal", formato: "1:1",
  resumo: "Formas de massinha gordinhas que amassam, esticam e pulam, com brilho e marquinhas de dedo. Fofo e tátil.",
  receita: `Vídeo 1:1 com estética de massinha (claymation).
Estrutura: personagens e objetos simples de massinha (bolinhas, cobrinhas, um bonequinho) numa mesa; eles se amassam ao pular (squash), esticam ao subir (stretch), e se transformam um no outro.
Visual: cores saturadas mas foscas, brilho especular largo e suave, pequenas marcas de dedo, sombra de contato escura e macia.
Movimento: 12 quadros por segundo, squash and stretch exagerado, tremidinho de superfície entre quadros.
Use para: conteúdo infantil, humor, marca simpática, explicação divertida.`,
  cena(c, t, W, H) {
    const tq = Math.floor(t * 12) / 12;
    fundo(c, W, H, "#e9e2d4", { grao: 0.12, vinheta: 0.3 });
    c.fillStyle = "#d6cbb5"; c.fillRect(0, 760, W, H - 760);
    const bola = (x, cor, fs) => {
      const u = ((tq / DUR) * 4 + fs) % 1, alt = Math.sin(u * Math.PI) * 360, chao = u < 0.08 || u > 0.92, sq = chao ? 1.35 : 1 - 0.2 * Math.sin(u * Math.PI) * 0.6, st = 1 / sq;
      const y = 760 - alt - 110 * st;
      c.fillStyle = `rgba(40,30,20,${0.35 - alt / 1500})`; c.beginPath(); c.ellipse(x, 765, 120 * (1 - alt / 900), 22, 0, 0, 7); c.fill();
      c.save(); c.translate(x + (rng(Math.floor(t * 12) + x)() - 0.5) * 2, y); c.scale(sq, st);
      const g = c.createRadialGradient(-40, -50, 10, 0, 0, 120); g.addColorStop(0, mistura(cor, "#ffffff", 0.35)); g.addColorStop(0.5, cor); g.addColorStop(1, mistura(cor, "#000000", 0.25));
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, 110, 0, 7); c.fill();
      c.fillStyle = "rgba(255,255,255,.5)"; c.beginPath(); c.ellipse(-40, -55, 30, 16, -0.5, 0, 7); c.fill();
      c.strokeStyle = "rgba(0,0,0,.08)"; c.lineWidth = 4; c.beginPath(); c.arc(30, 20, 26, 0.3, 2.4); c.stroke();
      c.fillStyle = "#222"; c.beginPath(); c.arc(-30, -10, 10, 0, 7); c.arc(30, -10, 10, 0, 7); c.fill();
      c.restore();
    };
    bola(300, "#e07a5f", 0); bola(W / 2, "#81b29a", 0.33); bola(W - 300, "#f2cc8f", 0.66);
  },
});

semente({
  id: "pixel-arte", nome: "Pixel arte", grupo: "artesanal", formato: "16:9",
  resumo: "Cena em pixels grandes com paleta curta: personagem andando, nuvens, moedas girando. Nostalgia de jogo antigo.",
  receita: `Vídeo 16:9 em pixel arte (sem copiar nenhum jogo existente: personagem, cenário e paleta próprios).
Estrutura: cenário em camadas com parallax (céu, morros, chão de blocos); um personagem original anda em ciclo de 4 quadros; itens giram (2 a 4 quadros); um balão de texto em fonte pixelada mostra a frase.
Visual: resolução baixa (ex.: 240 × 135) ampliada sem suavização, paleta de 12 a 16 cores, contornos de 1 pixel.
Movimento: tudo em degraus de pixel (nada em subpixel), animações a 8 a 12 quadros por segundo.
Use para: tecnologia com humor, games, nostalgia, explicar "fases" ou "níveis".`,
  preparar: () => tela(240, 135),
  cena(c, t, W, H, px) {
    const p = px.getContext("2d"), q = Math.floor(t * 10);
    p.fillStyle = "#8ecae6"; p.fillRect(0, 0, 240, 135);
    const nuv = (x, y) => { p.fillStyle = "#fff"; p.fillRect(x, y, 22, 6); p.fillRect(x + 4, y - 4, 12, 4); };
    nuv(Math.floor(240 - ((t / DUR) * 280) % 280), 20); nuv(Math.floor(320 - ((t / DUR) * 280 + 140) % 280), 35);
    p.fillStyle = "#6a994e"; for (let x = 0; x < 240; x++) { const h = Math.floor(18 + 10 * Math.sin((x + (t / DUR) * 240 * 0.3) / 18)); p.fillRect(x, 95 - h, 1, h); }
    const off = Math.floor((t / DUR) * 240) % 16;
    for (let x = -16; x < 256; x += 16) { p.fillStyle = "#bc6c25"; p.fillRect(x - off, 95, 16, 40); p.fillStyle = "#dda15e"; p.fillRect(x - off, 95, 16, 3); p.fillStyle = "#99582a"; p.fillRect(x - off + 15, 98, 1, 37); p.fillRect(x - off, 110, 16, 1); }
    [0, 1, 2].forEach((i) => { const x = ((i * 90 + 200 - Math.floor((t / DUR) * 240)) % 270 + 270) % 270 - 15, w = [6, 4, 2, 4][q % 4]; p.fillStyle = "#ffd60a"; p.fillRect(x + 3 - w / 2, 70, w, 8); p.fillStyle = "#c9a227"; p.fillRect(x + 3 - w / 2, 77, w, 1); });
    const f = q % 4, bx = 60, by = 79 - (f === 1 || f === 3 ? 1 : 0);
    p.fillStyle = "#3d3929"; p.fillRect(bx, by, 10, 16); p.fillStyle = "#d97757"; p.fillRect(bx + 1, by + 1, 8, 7); p.fillStyle = "#f4d6c0"; p.fillRect(bx + 2, by + 3, 6, 4); p.fillStyle = "#000"; p.fillRect(bx + 6, by + 4, 1, 1);
    p.fillStyle = "#264653"; p.fillRect(bx + 1, by + 8, 8, 5); p.fillStyle = "#3d3929"; p.fillRect(bx + (f < 2 ? 1 : 2), by + 13, 3, 3); p.fillRect(bx + (f < 2 ? 6 : 5), by + 13, 3, 3);
    p.fillStyle = "#fff"; p.fillRect(80, 48, 92, 18); p.fillRect(84, 66, 4, 3); p.fillStyle = "#3d3929"; p.fillRect(80, 48, 92, 1); p.fillRect(80, 65, 92, 1); p.fillRect(80, 48, 1, 18); p.fillRect(171, 48, 1, 18);
    c.imageSmoothingEnabled = false; c.drawImage(px, 0, 0, W, H);
    texto(c, "FASE 2: CONSTÂNCIA", 80 * 8 + 46 * 8, 57 * 8, { tam: 56, fonte: MONO, peso: 700, cor: "#3d3929" });
  },
});

semente({
  id: "nanquim-agua", nome: "Nanquim na água", grupo: "artesanal", formato: "9:16",
  resumo: "Gotas de tinta preta e vermelha se abrem em nuvens na água, e uma pincelada de sumi-ê escreve a palavra.",
  receita: `Vídeo 9:16 de tinta na água e pincel (sumi-ê).
Estrutura: gotas de nanquim caem de cima e se abrem em nuvens fluidas que descem e se enrolam; uma gota vermelha encontra a preta; por fim, uma pincelada larga atravessa a tela e a palavra aparece em pincel.
Visual: fundo branco leitoso, tinta preta com gradações de cinza, um só acento vermelho, traço de pincel com cerdas aparentes e final seco.
Movimento: fluidez lenta, volutas que crescem e se esgarçam, pincelada rápida no final.
Use para: calma, foco, filosofia, conteúdo contemplativo.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#f7f5f0", { grao: 0.1, vinheta: 0.25 });
    const nuvem = (x0, t0, cor, seed) => { const u = clamp((t - t0) / 3.2); if (u <= 0) return; const r = rng(seed);
      for (let i = 0; i < 70; i++) { const a = r() * Math.PI * 2, d = r() * 280 * sai(u), y = 300 + u * 700 + Math.sin(a) * d * 0.6 + r() * 200 * u, x = x0 + Math.cos(a) * d + Math.sin(u * 4 + i) * 30 * u;
        const rad = 20 + r() * 90 * u; const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, `rgba(${cor},${0.18 * (1 - u * 0.6)})`); g.addColorStop(1, `rgba(${cor},0)`); c.fillStyle = g; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill(); }
      if (u < 0.15) { c.fillStyle = `rgb(${cor})`; c.beginPath(); c.arc(x0, lerp(-40, 300, u / 0.15), 14, 0, 7); c.fill(); } };
    nuvem(420, 0.1, "20,20,24", 3); nuvem(680, 0.7, "180,40,40", 7);
    const k = sai(fase(t, 3.2, 3.7)), v = 1 - fase(t, 4.6, 4.95);
    if (k > 0) { c.save(); c.globalAlpha = v; const r = rng(2);
      for (let i = 0; i < 40; i++) { const off = (i - 20) * 3.2, seca = r(); c.strokeStyle = `rgba(15,15,18,${0.5 + 0.5 * r()})`; c.lineWidth = 3 + r() * 3;
        c.beginPath(); c.moveTo(120, 1420 + off); c.bezierCurveTo(400, 1340 + off, 700, 1480 + off, 120 + (W - 220) * k * (0.85 + 0.15 * seca), 1400 + off); c.stroke(); }
      texto(c, "calma", W / 2, 1650, { tam: 120, fonte: SERIF, peso: "italic 400", cor: "#141418", alpha: fase(t, 3.7, 4.1) });
      c.fillStyle = "#b42828"; rr(c, W / 2 + 190, 1600, 70, 70, 6); c.globalAlpha = fase(t, 4.0, 4.2) * v; c.fill(); c.restore(); }
  },
});

semente({
  id: "origami-dobra", nome: "Origami", grupo: "artesanal", formato: "1:1",
  resumo: "Uma folha quadrada se dobra em triângulos, vira e vira de novo até formar um barquinho. Processo em passos.",
  receita: `Vídeo 1:1 de dobradura (origami) para falar de processo em etapas.
Estrutura: uma folha quadrada colorida dobra ao meio (a aba gira em 3D com sombra da dobra), depois os cantos, até formar uma figura simples (barco, avião, coração); cada dobra é um passo numerado.
Visual: papel com face de cor e verso branco, vincos marcados por linhas mais claras, sombra suave na mesa, fundo neutro.
Movimento: cada dobra em 0,5 s com ease-in-out, a face de baixo aparece quando a aba vira; pequena pausa entre passos.
Use para: tutorial em etapas, "como transformamos X em Y", processo criativo.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#ece7de", { grao: 0.12, vinheta: 0.2 });
    const cx = W / 2, cy = H / 2 + 40, s = 300, f1 = fase(t, 0.4, 1.1), f2 = fase(t, 1.5, 2.2), f3 = fase(t, 2.6, 3.3), v = 1 - fase(t, 4.5, 4.95);
    c.save(); c.globalAlpha = v;
    c.fillStyle = "rgba(0,0,0,.12)"; c.beginPath(); c.ellipse(cx + 20, cy + s + 20, s * 1.1, 30, 0, 0, 7); c.fill();
    const cor = CLAUDE.terracota, verso = "#fbf7f0";
    c.fillStyle = cor; c.beginPath(); c.moveTo(cx - s, cy); c.lineTo(cx + s, cy); c.lineTo(cx + s, cy + s * (1 - f1 * 0) ); c.lineTo(cx - s, cy + s); c.fill();
    const topo = cy - s * Math.cos(f1 * Math.PI);
    if (f1 < 1) { c.fillStyle = f1 < 0.5 ? cor : verso; c.beginPath(); c.moveTo(cx - s, cy); c.lineTo(cx + s, cy); c.lineTo(cx + s, topo); c.lineTo(cx - s, topo); c.fill(); }
    else { c.fillStyle = verso; c.fillRect(cx - s, cy, 2 * s, s);
      const canto = (lado, k) => { if (k <= 0) return; c.fillStyle = mistura(verso, cor, k > 0.5 ? 1 : 0); c.beginPath(); c.moveTo(cx + lado * s, cy); c.lineTo(cx + lado * s * (1 - 0.5 * k), cy + 0); c.lineTo(cx + lado * s, cy + s * k * 0.5 + (k > 0.5 ? 0 : 0)); c.fill();
        c.fillStyle = cor; c.beginPath(); c.moveTo(cx + lado * s, cy); c.lineTo(cx + lado * (s - s * k * 0.5), cy); c.lineTo(cx + lado * s, cy + s * 0.5 * k); c.closePath(); c.fill(); };
      canto(-1, f2); canto(1, f2);
      if (f3 > 0) { c.fillStyle = mistura(verso, "#c96a4c", f3); c.beginPath(); c.moveTo(cx - s, cy + s); c.lineTo(cx + s, cy + s); c.lineTo(cx + s * (1 - 0.3 * f3), cy + s + 0); c.lineTo(cx + s * 0.7, cy + s * (1 - 0.5 * f3)); c.lineTo(cx - s * 0.7, cy + s * (1 - 0.5 * f3)); c.lineTo(cx - s * (1 - 0.3 * f3), cy + s); c.fill(); }
      c.strokeStyle = "rgba(0,0,0,.15)"; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - s, cy); c.lineTo(cx + s, cy); c.stroke(); }
    const passo = t < 1.3 ? 1 : t < 2.4 ? 2 : 3;
    texto(c, "passo " + passo, 120, 120, { tam: 44, fonte: SERIF, peso: 600, alinha: "left" });
    texto(c, ["dobre ao meio", "dobre os cantos", "abra a base"][passo - 1], 120, 180, { tam: 34, alinha: "left", cor: "#6f6a5c" });
    c.restore();
  },
});
