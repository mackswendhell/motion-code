// Grupo Produto e interface: lançamento, app, site, ficha técnica.

function uiJanela(c, x, y, w, h, { escuro = false, titulo = "" } = {}) {
  c.save(); c.shadowColor = "rgba(0,0,0,.22)"; c.shadowBlur = 40; c.shadowOffsetY = 16;
  c.fillStyle = escuro ? "#1d1c1a" : "#fff"; rr(c, x, y, w, h, 18); c.fill(); c.shadowColor = "transparent";
  c.fillStyle = escuro ? "#2a2926" : "#f1efe9"; rr(c, x, y, w, 52, [18, 18, 0, 0]); c.fill();
  ["#e0796a", "#e9b949", "#8fb07a"].forEach((cor, i) => { c.fillStyle = cor; c.beginPath(); c.arc(x + 30 + i * 26, y + 26, 8, 0, 7); c.fill(); });
  if (titulo) texto(c, titulo, x + w / 2, y + 27, { tam: 22, peso: 500, cor: escuro ? "#aaa59a" : "#8a8577" });
  c.restore();
}
function uiCursor(c, x, y, aperta = 0) {
  c.save(); c.translate(x, y); const s = 1 - 0.15 * aperta; c.scale(s, s);
  c.fillStyle = "#111"; c.strokeStyle = "#fff"; c.lineWidth = 3.5; c.lineJoin = "round";
  c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 46); c.lineTo(12, 35); c.lineTo(22, 56); c.lineTo(31, 52); c.lineTo(21, 31); c.lineTo(37, 31); c.closePath(); c.fill(); c.stroke();
  c.restore();
}
function uiRobo(c, cx, cy, s, t, explode = 0) { // um robô-aranha de produto, desenhado em código
  c.save(); c.translate(cx, cy); c.scale(s, s);
  c.fillStyle = "rgba(0,0,0,.12)"; c.beginPath(); c.ellipse(0, 210, 330, 50, 0, 0, 7); c.fill();
  for (let i = 0; i < 8; i++) {
    const lado = i < 4 ? -1 : 1, k = i % 4, a = (k - 1.5) * 0.45, passo = 14 * Math.sin(t * 6 + i * 1.7), ex = explode * (60 + k * 20) * lado;
    const jx = lado * (150 + 60 * Math.cos(a)) + ex, jy = -60 + k * 30 - 70, px = lado * (300 + 40 * Math.cos(a)) + ex * 1.5, py = 200 + passo * (k % 2 ? 1 : -1);
    c.strokeStyle = "#3b3a37"; c.lineWidth = 22; c.lineCap = "round"; c.beginPath(); c.moveTo(lado * 90, k * 25 - 20); c.lineTo(jx, jy); c.lineTo(px, py); c.stroke();
    c.strokeStyle = "#e6e2da"; c.lineWidth = 12; c.beginPath(); c.moveTo(lado * 90, k * 25 - 20); c.lineTo(jx, jy); c.stroke();
    c.fillStyle = CLAUDE.terracota; c.beginPath(); c.arc(jx, jy, 14, 0, 7); c.fill();
  }
  const g = c.createRadialGradient(-60, -120, 20, 0, -20, 220); g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#bdb8ae");
  c.fillStyle = g; c.beginPath(); c.ellipse(0, -30 - explode * 80, 190, 150, 0, Math.PI, 0); c.lineTo(190, 40); c.quadraticCurveTo(0, 110, -190, 40); c.fill();
  c.fillStyle = CLAUDE.terracota; c.fillRect(-120, -110 - explode * 80, 240, 22);
  [-70, 70].forEach((x) => { c.fillStyle = "#222"; c.beginPath(); c.arc(x, 20, 52, 0, 7); c.fill(); c.fillStyle = "#555"; c.beginPath(); c.arc(x, 20, 30, 0, 7); c.fill(); c.fillStyle = "rgba(255,255,255,.7)"; c.beginPath(); c.arc(x - 14, 6, 9, 0, 7); c.fill(); });
  c.restore();
}

semente({
  id: "ficha-tecnica", estilo: "ficha-tecnica", nome: "Ficha técnica HUD", grupo: "produto", formato: "16:9",
  resumo: "Produto 3D no centro, painéis de dados creme e laranja em volta, modo em letras grandes. Lançamento com cara de engenharia.",
  receita: `Vídeo 16:9 de produto como simulador técnico. É o estilo "Ficha Técnica" do estúdio (estilos/ficha-tecnica/).
Estrutura: o produto em 3D no centro sobre fundo creme claro; à esquerda e à direita, colunas de painéis finos (números grandes com unidade pequena, barras listradas, medidores, listas de subsistemas com status verde/laranja); no topo, nome do produto com ícone laranja e barra de progresso; embaixo, uma linha do tempo de "operação" com marcadores.
Ação: o produto passa por modos (andar, agachar, abrir, desmontar, remontar); cada modo aparece em letras laranja grandes no canto inferior esquerdo do palco e os painéis reagem (números mudam, barras enchem).
Visual: creme #f3efe8, tinta grafite, um só acento laranja #e5532d, tipografia mono pequena em caixa alta, linhas de 1 px.
Movimento: câmera lenta orbitando o produto; desmontagem em vista explodida com peças flutuando e linhas de cota.
Use para: lançamento de hardware, app com "motor" por trás, apresentação de produto premium.`,
  higgsfield: "O produto em 3D pode vir da Higgsfield (imagem → modelo 3D GLB, como no estilo Higgsfield variação motion-pro); a interface e a animação ficam no código.",
  cena(c, t, W, H) {
    fundo(c, W, H, "#f3efe8", { grao: 0.06, vinheta: 0.12 });
    const L = "#e5532d", G = "#3b3a37", modos = ["ANDAR", "AGACHAR", "DESMONTAR", "REMONTAR"], m = Math.floor((t / DUR) * 4), explode = m === 2 ? sai(fase(t % 1.25, 0, 0.8)) : m === 3 ? 1 - sai(fase(t % 1.25, 0, 0.8)) : 0;
    c.fillStyle = L; rr(c, 40, 30, 70, 50, 8); c.fill(); texto(c, "JS-8", 75, 56, { tam: 20, peso: 800, cor: "#fff" });
    texto(c, "Saltador JS-8 /", 130, 56, { tam: 34, peso: 700, alinha: "left", cor: G });
    c.fillStyle = G; for (let i = 0; i < 40; i++) if (i < 40 * ((t / DUR) % 1) + 8) c.fillRect(620 + i * 9, 44, 5, 22);
    const painel = (x, y, w, h, rot, val, uni) => { c.strokeStyle = "rgba(59,58,55,.25)"; c.lineWidth = 1.5; c.strokeRect(x, y, w, h);
      texto(c, rot, x + 14, y + 22, { tam: 15, fonte: MONO, peso: 600, alinha: "left", cor: "#8b877e" }); texto(c, val, x + 14, y + 72, { tam: 52, peso: 500, alinha: "left", cor: G });
      texto(c, uni, x + 14 + val.length * 30, y + 80, { tam: 18, fonte: MONO, alinha: "left", cor: "#8b877e" }); };
    painel(40, 120, 330, 250, "MARCHA", (2.7 * (m === 1 ? 0 : 1)).toFixed(1), "Hz");
    for (let i = 0; i < 10; i++) { c.fillStyle = i % 2 ? L : "rgba(229,83,45,.35)"; c.fillRect(54, 210 + i * 14, 300 * (0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i))), 6); }
    painel(40, 390, 330, 200, "ZOOM", (-1 + 2 * ciclo01(t)).toFixed(1), "×");
    painel(40, 610, 330, 300, "CARGA DAS PERNAS", "", "");
    for (let i = 0; i < 8; i++) { texto(c, "L" + (i + 1), 56, 670 + i * 28, { tam: 15, fonte: MONO, alinha: "left", cor: "#8b877e" }); c.fillStyle = i === m * 2 ? L : G; c.fillRect(100, 662 + i * 28, 150 + 100 * Math.abs(Math.sin(t * 2 + i)), 10); }
    painel(W - 370, 120, 330, 200, "ÓPTICA", (2.4 + 0.2 * ciclo(t)).toFixed(1), "lx");
    painel(W - 370, 340, 330, 330, "SUBSISTEMAS", "", "");
    ["óptica", "rede neural", "ataque", "pernas", "salto"].forEach((s, i) => { texto(c, s.toUpperCase(), W - 356, 410 + i * 50, { tam: 16, fonte: MONO, alinha: "left", cor: G });
      const ok = !(m === 2 && i === 3); c.fillStyle = ok ? "#58a55c" : L; rr(c, W - 130, 397 + i * 50, 76, 26, 4); c.fill(); texto(c, ok ? "OK" : "SOLTO", W - 92, 411 + i * 50, { tam: 13, fonte: MONO, peso: 700, cor: "#fff" }); });
    uiRobo(c, W / 2, H / 2 + 40, 1.05, t, explode);
    if (explode > 0.3) { c.strokeStyle = "rgba(59,58,55,.4)"; c.setLineDash([6, 6]); c.beginPath(); c.arc(W / 2, H / 2, 380, -0.5, 0.8); c.stroke(); c.setLineDash([]); }
    texto(c, modos[m], 440, 880, { tam: 60, peso: 600, alinha: "left", cor: L });
    texto(c, "MODO DE OPERAÇÃO", 440, 830, { tam: 16, fonte: MONO, alinha: "left", cor: "#8b877e" });
    c.strokeStyle = "rgba(59,58,55,.3)"; c.strokeRect(440, 950, W - 880, 80);
    c.fillStyle = L; c.beginPath(); c.arc(480, 990, 20, 0, 7); c.fill();
    c.fillStyle = G; c.fillRect(520, 988, (W - 1000) * (t / DUR), 4); c.fillStyle = L; c.beginPath(); c.arc(520 + (W - 1000) * (t / DUR), 990, 9, 0, 7); c.fill();
  },
});

semente({
  id: "vitrine-web", estilo: "vitrine-web", nome: "Vitrine de site", grupo: "produto", formato: "16:9",
  resumo: "Hero de landing page com tipografia enorme, objeto em partículas e cursor navegando. Mostra um site como showreel.",
  receita: `Vídeo 16:9 que apresenta sites e landing pages como showreel. É o estilo "Vitrine Web" do estúdio (estilos/vitrine-web/).
Estrutura: cada corte é uma tela de site em tela cheia (2 a 3 s): barra de navegação fina no topo, título gigante de 2 ou 3 palavras, subtítulo pequeno, botão de ação, e um objeto central forte (nuvem de partículas, produto 3D, criatura flutuando, foto com profundidade); o cursor entra, passa sobre o botão (hover) e a tela troca.
Visual: alterna sites escuros (preto com partículas coloridas) e claros (céu lavanda, branco), tipografia sans grande e fina ou condensada pesada, muito respiro.
Movimento: objeto central sempre vivo (partículas girando, flutuar), título com máscara de entrada, trocas por corte seco ou wipe; parallax leve com o cursor.
Use para: portfólio de designer/dev, lançamento de site, agência mostrando trabalhos.`,
  higgsfield: "Os objetos centrais (criatura, casa, produto) podem ser imagens ou vídeos da Higgsfield em fundo neutro; a página, o texto e o cursor ficam no código.",
  cena(c, t, W, H) {
    const tela = Math.floor(t / 2.5), u = (t % 2.5) / 2.5;
    if (tela === 0) {
      c.fillStyle = "#050507"; c.fillRect(0, 0, W, H);
      const r = rng(2), cx = 1260, cy = 560, rot = t * 0.6;
      for (let i = 0; i < 2200; i++) { const a = r() * 7 + rot, b = r() * 3.14, rr2 = 330 * (0.85 + 0.15 * Math.sin(a * 5 + b * 3));
        const x = Math.cos(a) * Math.sin(b) * rr2 * 1.15, y = Math.cos(b) * rr2 * 0.85, z = Math.sin(a) * Math.sin(b);
        c.fillStyle = `hsla(${30 + 260 * r()},80%,${50 + 20 * z}%,${0.3 + 0.6 * (z + 1) / 2})`; c.fillRect(cx + x, cy + y, 3, 3); }
      const k = sai(fase(u, 0, 0.3));
      ["Unir o que", "a equipe sabe."].forEach((s, i) => { c.save(); c.beginPath(); c.rect(120, 330 + i * 110, 900, 110); c.clip(); texto(c, s, 130, 390 + i * 110 + 110 * (1 - k), { tam: 100, peso: 400, alinha: "left", cor: "#fff" }); c.restore(); });
      texto(c, "Decisões com contexto, em segundos.", 130, 640, { tam: 30, peso: 400, alinha: "left", cor: "#9b9ba6" });
      c.fillStyle = "#7b5cff"; rr(c, 130, 700, 220, 64, 32); c.fill(); texto(c, "Começar", 240, 733, { tam: 28, peso: 600, cor: "#fff" });
      texto(c, "● Mente", 60, 40, { tam: 24, peso: 700, alinha: "left", cor: "#fff" });
      ["Produto", "Preço", "Blog"].forEach((s, i) => texto(c, s, 1300 + i * 150, 40, { tam: 22, alinha: "left", cor: "#bbb" }));
      uiCursor(c, lerp(900, 250, sai(fase(u, 0.3, 0.8))), lerp(900, 735, sai(fase(u, 0.3, 0.8))), fase(u, 0.85, 0.9));
    } else {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#c9c4f0"); g.addColorStop(1, "#f3dfe8"); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const pal = ["CRIAR", "MOVER", "ENCANTAR"][Math.floor(u * 3)];
      texto(c, pal, W / 2, H / 2, { tam: 300, fonte: GROSSA, cor: "#1b1b22" });
      const cy = H / 2 - 40 + 30 * ciclo(t, 2);
      c.fillStyle = "rgba(240,90,170,.85)"; c.beginPath(); c.ellipse(W / 2, cy - 120, 170, 130, 0, Math.PI, 0); c.quadraticCurveTo(W / 2 + 170, cy - 60, W / 2, cy - 70); c.quadraticCurveTo(W / 2 - 170, cy - 60, W / 2 - 170, cy - 120); c.fill();
      for (let i = 0; i < 9; i++) { c.strokeStyle = "rgba(240,90,170,.6)"; c.lineWidth = 8; c.beginPath(); const x0 = W / 2 - 130 + i * 32; c.moveTo(x0, cy - 70);
        for (let k = 0; k < 10; k++) c.lineTo(x0 + 18 * Math.sin(k * 0.8 + t * 4 + i), cy - 70 + k * 40); c.stroke(); }
      texto(c, "● Medusa Lab", 60, 40, { tam: 24, peso: 700, alinha: "left", cor: "#1b1b22" });
    }
  },
});

semente({
  id: "terminal-digitando", nome: "Terminal ao vivo", grupo: "produto", formato: "16:9",
  resumo: "Janela de terminal escura, comando digitado, saída rolando em cores e um ✓ verde no fim. Para ferramentas de dev.",
  receita: `Vídeo 16:9 de terminal (ferramenta de linha de comando, agente de código, deploy).
Estrutura: janela de terminal escura centralizada sobre fundo claro; o prompt digita o comando com cursor em bloco; a saída rola linha a linha com cores (cinza para log, terracota para destaque, verde para sucesso), barra de progresso em texto, e termina com ✓.
Visual: fonte mono, fundo #1d1c1a, cantos arredondados, sombra longa; o fundo do vídeo em creme com grão.
Movimento: digitação com ritmo humano (pausas irregulares), saída em rajadas; zoom de 5% no final para o ✓.
Use para: tutorial de CLI, lançamento de ferramenta dev, "eu rodei isso e olha".`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.creme, { grao: 0.12, vinheta: 0.2 });
    const z = 1 + 0.05 * fase(t, 3.4, 4.2);
    c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
    uiJanela(c, 260, 140, 1400, 800, { escuro: true, titulo: "~/projeto" });
    const cmd = "claude \"organiza os vídeos por data\"", k = fase(t, 0.2, 1.4);
    texto(c, "$ ", 310, 250, { tam: 32, fonte: MONO, alinha: "left", cor: CLAUDE.terracota });
    const dig = digita(cmd, k); texto(c, dig, 350, 250, { tam: 32, fonte: MONO, alinha: "left", cor: "#f0eee6" });
    if (k < 1 && Math.floor(t * 4) % 2 === 0) { c.font = `32px ${MONO}`; c.fillStyle = "#f0eee6"; c.fillRect(350 + c.measureText(dig).width + 4, 232, 18, 36); }
    const saida = [["lendo 128 arquivos…", "#8a877f"], ["agrupando por mês", "#8a877f"], ["2026-09/  41 arquivos", "#f0eee6"], ["2026-10/  57 arquivos", "#f0eee6"], ["2026-11/  30 arquivos", "#f0eee6"], ["[██████████████░░░░] 78%", CLAUDE.terracota], ["✓ pronto em 4,2 s", "#9fd18b"]];
    saida.forEach(([s, cor], i) => { const ti = 1.6 + i * 0.25; if (t < ti) return;
      let txt = s; if (i === 5) { const p = Math.min(18, Math.floor((t - ti) * 30)); txt = "[" + "█".repeat(p) + "░".repeat(18 - p) + "] " + Math.round((p / 18) * 100) + "%"; }
      texto(c, txt, 310, 320 + i * 56, { tam: 30, fonte: MONO, alinha: "left", cor, alpha: 1 - fase(t, 4.6, 4.95) }); });
    c.restore();
  },
});

semente({
  id: "cursor-clique", nome: "Cursor que clica", grupo: "produto", formato: "16:9",
  resumo: "Interface limpa, o cursor viaja, clica no botão com onda, e a tela responde com um toast de sucesso.",
  receita: `Vídeo 16:9 de demonstração de interface (SaaS, recurso novo).
Estrutura: a interface reconstruída em camadas (barra lateral, cabeçalho, cartões); o cursor percorre um caminho curvo até o botão; clique com onda circular e botão afundando; a interface responde (item adicionado, toast no canto, número muda).
Visual: UI clara, cantos de 14 px, sombra mínima, um só acento; cursor preto com borda branca, um pouco maior que o real.
Movimento: cursor com aceleração e frenagem (nada linear), leve zoom de câmera na área do clique e volta.
Use para: demo de produto, onboarding, anúncio de recurso.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#e9e6df", { grao: 0.06, vinheta: 0.12 });
    const zoom = 1 + 0.12 * (fase(t, 1.2, 1.8) - fase(t, 3.2, 3.9)), fx = 1350, fy = 300;
    c.save(); c.translate(fx, fy); c.scale(zoom, zoom); c.translate(-fx, -fy);
    uiJanela(c, 160, 90, 1600, 900, { titulo: "Projetos" });
    c.fillStyle = "#f6f4ef"; c.fillRect(160, 142, 300, 848);
    ["Início", "Projetos", "Equipe", "Ajustes"].forEach((s, i) => { if (i === 1) { c.fillStyle = "#ebe5da"; rr(c, 180, 190 + i * 70, 260, 54, 10); c.fill(); } texto(c, s, 210, 217 + i * 70, { tam: 28, peso: i === 1 ? 700 : 500, alinha: "left" }); });
    texto(c, "Projetos", 520, 210, { tam: 52, fonte: SERIF, peso: 600, alinha: "left" });
    const clicou = t > 1.8, n = clicou ? 4 : 3;
    for (let i = 0; i < n; i++) { const k = i === 3 ? entra(t, 1.9, 0.35) : 1; c.save(); c.translate(520 + i * 300 + 130, 480); c.scale(k, k);
      c.fillStyle = "#fff"; c.strokeStyle = "#e3dfd5"; c.lineWidth = 2; rr(c, -130, -130, 260, 300, 16); c.fill(); c.stroke();
      c.fillStyle = [CLAUDE.terracota, CLAUDE.oliva, CLAUDE.ceu, "#e9b949"][i]; rr(c, -110, -110, 220, 140, 10); c.fill();
      texto(c, ["Lançamento", "Podcast", "Curso", "Novo vídeo"][i], -110, 80, { tam: 26, peso: 700, alinha: "left" }); c.restore(); }
    const ap = fase(t, 1.6, 1.68) - fase(t, 1.75, 1.85);
    c.fillStyle = mistura("#d97757", "#b5583b", ap); rr(c, 1440, 175, 240, 64, 12); c.fill(); texto(c, "+ Novo", 1560, 208, { tam: 28, peso: 700, cor: "#fff" });
    if (t > 1.7 && t < 2.4) { const o = fase(t, 1.7, 2.4); c.strokeStyle = `rgba(217,119,87,${1 - o})`; c.lineWidth = 6; c.beginPath(); c.arc(1560, 208, 30 + 120 * o, 0, 7); c.stroke(); }
    const u = sai(fase(t, 0.3, 1.5)); uiCursor(c, lerp(700, 1570, u) + Math.sin(u * Math.PI) * 80, lerp(800, 212, u), ap);
    c.restore();
    const ts = fase(t, 2.2, 2.5) * (1 - fase(t, 4.2, 4.6));
    c.save(); c.globalAlpha = ts; c.translate(0, 40 * (1 - ts)); c.fillStyle = CLAUDE.tinta; rr(c, W - 560, H - 170, 480, 90, 16); c.fill();
    texto(c, "✓  Projeto criado", W - 520, H - 124, { tam: 30, peso: 600, alinha: "left", cor: "#fff" }); c.restore();
  },
});

semente({
  id: "unboxing-caixa", nome: "Caixa que abre", grupo: "produto", formato: "1:1",
  resumo: "Caixa fechada balança, as abas se abrem e o produto sobe com raios de luz e confete. Revelação de lançamento.",
  receita: `Vídeo 1:1 de revelação (unboxing ilustrado).
Estrutura: caixa de papelão no centro com fita; balança duas vezes (expectativa); as abas abrem em sequência; o produto sobe de dentro girando devagar, raios de luz atrás e confete leve; nome e data embaixo.
Visual: caixa em kraft com sombra, produto em cor forte, raios em creme sobre fundo terracota.
Movimento: balanço com rotação pequena, abas com dobra (escala vertical), subida com mola, confete com gravidade.
Use para: lançamento de produto, anúncio de novidade, sorteio.`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.terracota, { grao: 0.2, vinheta: 0.35 });
    const abre = fase(t, 1.2, 1.7), sobe = sai(fase(t, 1.6, 2.5)), cx = W / 2, cy = 720, v = 1 - fase(t, 4.6, 4.95);
    c.save(); c.globalAlpha = v;
    if (sobe > 0) { c.save(); c.translate(cx, cy - 250); c.rotate(t * 0.4); for (let i = 0; i < 14; i++) { c.rotate(Math.PI / 7); c.fillStyle = `rgba(250,249,245,${0.18 * sobe})`; c.beginPath(); c.moveTo(0, 0); c.lineTo(-60, -900); c.lineTo(60, -900); c.fill(); } c.restore(); }
    const bal = t < 1.2 ? 0.08 * Math.sin(t * 14) * Math.sin((t / 1.2) * Math.PI) : 0;
    c.save(); c.translate(cx, cy); c.rotate(bal);
    if (sobe > 0) { c.save(); c.translate(0, -60 - 330 * sobe); c.rotate(0.2 * ciclo(t)); c.fillStyle = CLAUDE.tinta; rr(c, -110, -170, 220, 340, 40); c.fill(); c.fillStyle = CLAUDE.creme; rr(c, -90, -140, 180, 250, 20); c.fill();
      c.fillStyle = CLAUDE.terracota; c.beginPath(); c.arc(0, -20, 50, 0, 7); c.fill(); c.restore(); }
    c.fillStyle = "#b98a57"; c.fillRect(-230, -60, 460, 300); c.fillStyle = "#a57746"; c.fillRect(-230, -60, 460, 40);
    c.fillStyle = "rgba(255,255,255,.35)"; c.fillRect(-40, -60, 80, 300);
    [[-1, 0], [1, 0.1]].forEach(([lado, atraso]) => { const a = fase(abre, atraso, atraso + 0.8); c.save(); c.translate(lado * 230, -60); c.scale(1, 1);
      c.fillStyle = "#c79a66"; c.beginPath(); c.moveTo(0, 0); c.lineTo(-lado * 230, 0); c.lineTo(-lado * 230, -120 * (1 - 2 * a) ); c.lineTo(0, -120 * (1 - 2 * a) + (a > 0.5 ? 0 : 0)); c.fill(); c.restore(); });
    c.restore();
    const r = rng(4); if (sobe > 0) for (let i = 0; i < 60; i++) { const tt = t - 1.8 - r() * 0.3; if (tt < 0) continue; const vx = (r() - 0.5) * 900, vy = -700 - r() * 500;
      c.fillStyle = [CLAUDE.creme, "#e9b949", CLAUDE.oliva, "#fff"][i % 4]; c.save(); c.translate(cx + vx * tt, cy - 200 + vy * tt + 900 * tt * tt); c.rotate(tt * 8 + i); c.fillRect(-8, -4, 16, 8); c.restore(); }
    texto(c, "Chegou.", cx, 960, { tam: 80, fonte: SERIF, peso: 600, cor: CLAUDE.papel, alpha: fase(t, 2.6, 3) });
    c.restore();
  },
});

semente({
  id: "recursos-grade", nome: "Grade de recursos", grupo: "produto", formato: "16:9",
  resumo: "Três cartões de recurso viram como cartas, ícone desenhado, título e frase. Página de recursos em vídeo.",
  receita: `Vídeo 16:9 que lista recursos de um produto (3 a 6).
Estrutura: título da seção no topo; cartões em grade viram de costas para frente (flip 3D em Y) um por vez; cada um com ícone de linha que se desenha, título curto e uma frase.
Visual: fundo creme, cartões brancos com borda fina, ícones em traço terracota, números grandes discretos no canto (01, 02, 03).
Movimento: flip com perspectiva e sombra que muda; depois o cartão em foco sobe 10 px e os outros escurecem 10%.
Use para: página de vendas, resumo de lançamento, "3 coisas que o app faz".`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.creme, { grao: 0.1, vinheta: 0.15 });
    texto(c, "O que muda no seu dia", W / 2, 160, { tam: 66, fonte: SERIF, peso: 600 });
    const rec = [["Grava", "fala e ele corta os silêncios"], ["Edita", "legenda e zoom no ritmo"], ["Publica", "o corte certo para cada rede"]];
    const foco = Math.floor(((t - 2) / 3) * 3);
    rec.forEach(([tit, f], i) => {
      const x = 360 + i * 600, y = 600, fl = fase(t, 0.3 + i * 0.35, 0.9 + i * 0.35), sx = Math.abs(Math.cos(fl * Math.PI)), frente = fl > 0.5, v = 1 - fase(t, 4.6, 4.95);
      const sobe = t > 2 && foco === i ? -16 : 0;
      c.save(); c.globalAlpha = v; c.translate(x, y + sobe); c.scale(Math.max(0.02, sx), 1);
      c.shadowColor = "rgba(0,0,0,.15)"; c.shadowBlur = 30; c.shadowOffsetY = 12;
      c.fillStyle = frente ? "#fff" : CLAUDE.terracota; rr(c, -250, -280, 500, 560, 24); c.fill(); c.shadowColor = "transparent";
      if (frente) {
        texto(c, "0" + (i + 1), 200, -230, { tam: 40, fonte: SERIF, cor: "#d6d1c6" });
        c.strokeStyle = CLAUDE.terracota; c.lineWidth = 8; c.lineCap = "round";
        const ic = [[...Array(20)].map((_, j) => [-160 + Math.cos(j * 0.33) * 60, -130 + Math.sin(j * 0.33) * 60]), [[-220, -100], [-160, -180], [-100, -100], [-160, -100]], [[-220, -90], [-100, -150], [-160, -190], [-200, -130]]][i];
        tracar(c, ic, fase(t, 0.9 + i * 0.35, 1.5 + i * 0.35), i !== 0);
        texto(c, tit, -200, 20, { tam: 60, fonte: SERIF, peso: 600, alinha: "left" });
        texto(c, f, -200, 100, { tam: 28, peso: 400, alinha: "left", cor: "#6f6a5c", larg: 420 });
      } else texto(c, "✱", 0, 0, { tam: 160, cor: CLAUDE.papel });
      c.restore();
    });
  },
});

semente({
  id: "planos-preco", nome: "Planos e preço", grupo: "produto", formato: "16:9",
  resumo: "Três cartões de plano sobem, o do meio cresce com selo MAIS ESCOLHIDO e o preço conta. Oferta clara.",
  receita: `Vídeo 16:9 de apresentação de oferta/planos.
Estrutura: três cartões lado a lado (básico, pro, equipe); sobem em cascata; o do meio cresce 8%, ganha borda na cor de acento e o selo "mais escolhido" que cai girando; os preços contam do zero; a lista de itens de cada cartão marca ✓ em sequência.
Visual: fundo escuro quente para contraste, cartões claros, plano em destaque em terracota.
Movimento: cascata 120 ms, destaque com mola, contagem em 0,8 s.
Use para: vendas, lançamento com preço, comparação de planos.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#23211e", { grao: 0.2, vinheta: 0.4 });
    const pl = [["Básico", 0, ["1 projeto", "exportar em HD"]], ["Pro", 49, ["projetos ilimitados", "4K", "voz por IA"]], ["Equipe", 129, ["tudo do Pro", "5 pessoas", "marca própria"]]];
    pl.forEach(([n, p, it], i) => {
      const k = sai(fase(t, 0.2 + i * 0.12, 0.7 + i * 0.12)), dest = i === 1 ? entra(t, 1.2, 0.4) : 0, s = 1 + 0.08 * dest, x = 440 + i * 520, v = 1 - fase(t, 4.6, 4.95);
      c.save(); c.globalAlpha = k * v; c.translate(x, 560 + 80 * (1 - k)); c.scale(s, s);
      c.fillStyle = i === 1 ? CLAUDE.terracota : CLAUDE.papel; rr(c, -220, -330, 440, 660, 26); c.fill();
      const cor = i === 1 ? "#fff" : CLAUDE.tinta;
      texto(c, n, -170, -250, { tam: 44, fonte: SERIF, peso: 600, alinha: "left", cor });
      texto(c, "R$ " + Math.round(p * sai(fase(t, 0.8, 1.6))), -170, -140, { tam: 90, peso: 800, alinha: "left", cor });
      texto(c, "/mês", 120, -125, { tam: 26, alinha: "left", cor, alpha: 0.7 });
      it.forEach((s2, j) => { const m = fase(t, 1.6 + j * 0.2 + i * 0.1, 1.8 + j * 0.2 + i * 0.1); texto(c, "✓", -170, -10 + j * 70, { tam: 34, peso: 900, cor: i === 1 ? "#fff" : CLAUDE.oliva, alpha: m }); texto(c, s2, -120, -10 + j * 70, { tam: 30, alinha: "left", cor }); });
      c.restore();
    });
    if (t > 1.3) { const k = entra(t, 1.3, 0.4); c.save(); c.translate(960, 180); c.rotate(-0.05 + (1 - k) * 0.6); c.scale(k, k); c.fillStyle = "#e9b949"; rr(c, -170, -32, 340, 64, 32); c.fill();
      texto(c, "MAIS ESCOLHIDO", 0, 2, { tam: 26, peso: 900, espaco: 2 }); c.restore(); }
  },
});

semente({
  id: "busca-sugestoes", nome: "Busca com sugestões", grupo: "produto", formato: "16:9",
  resumo: "Barra de busca centralizada, a pergunta é digitada e as sugestões caem embaixo. Abre vídeo sobre dúvidas comuns.",
  receita: `Vídeo 16:9 de busca (abre o tema mostrando o que as pessoas pesquisam).
Estrutura: uma barra de busca grande e genérica no centro (sem marca de buscador); a frase é digitada; sugestões descem uma a uma embaixo; a sugestão escolhida acende e a tela "entra" nela (zoom).
Visual: fundo claro e limpo, barra arredondada com lupa, sugestões em lista com ícone de relógio.
Movimento: digitação com cursor, sugestões em cascata, zoom de transição no final.
Use para: abrir vídeo com "as pessoas pesquisam X", FAQ, SEO.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#fbfaf7", { grao: 0.04, vinheta: 0.06 });
    const z = 1 + 2.5 * Math.pow(fase(t, 3.9, 4.6), 2), v = 1 - fase(t, 4.5, 4.9);
    c.save(); c.globalAlpha = v; c.translate(W / 2, 560); c.scale(z, z); c.translate(-W / 2, -560);
    texto(c, "o que as pessoas perguntam", W / 2, 240, { tam: 40, fonte: SERIF, peso: 500, cor: "#8a8577" });
    c.shadowColor = "rgba(0,0,0,.12)"; c.shadowBlur = 24; c.fillStyle = "#fff"; rr(c, 360, 300, 1200, 110, 55); c.fill(); c.shadowColor = "transparent";
    c.strokeStyle = "#8a8577"; c.lineWidth = 6; c.beginPath(); c.arc(430, 350, 22, 0, 7); c.stroke(); c.beginPath(); c.moveTo(446, 366); c.lineTo(466, 386); c.stroke();
    const q = digita("como começar um canal sem aparecer", fase(t, 0.2, 1.8));
    texto(c, q, 500, 357, { tam: 40, alinha: "left" });
    if (Math.floor(t * 3) % 2 === 0 && t < 2) { c.font = `40px ${SANS}`; c.fillStyle = CLAUDE.tinta; c.fillRect(504 + c.measureText(q).width, 330, 3, 52); }
    const sug = ["como começar um canal sem aparecer em 2026", "como começar um canal sem aparecer com IA", "como começar um canal sem aparecer e ganhar dinheiro", "como começar um canal sem aparecer no TikTok"];
    sug.forEach((s, i) => { const k = fase(t, 1.9 + i * 0.12, 2.1 + i * 0.12); if (k <= 0) return; const y = 440 + i * 86, sel = t > 3.2 && i === 1;
      c.globalAlpha = k * v; if (sel) { c.fillStyle = "#f6e4da"; rr(c, 380, y, 1160, 76, 12); c.fill(); }
      texto(c, "↺", 430, y + 40, { tam: 30, cor: "#a8a396" }); texto(c, s, 490, y + 40, { tam: 32, alinha: "left", cor: sel ? CLAUDE.argila : CLAUDE.tinta, peso: sel ? 700 : 400 }); });
    c.restore();
  },
});

semente({
  id: "celular-feed", nome: "Celular com feed", grupo: "produto", formato: "9:16",
  resumo: "Um celular ilustrado com o feed rolando sozinho, curtidas pulando e um post em destaque. Mostra app ou redes.",
  receita: `Vídeo 9:16 com mockup de celular genérico (sem marca) mostrando um feed ou app.
Estrutura: o aparelho ocupa 80% da altura, levemente inclinado; o conteúdo rola de baixo para cima em velocidade constante; em um post a rolagem para, o coração pulsa e o contador sobe; bolhas de reação sobem pela lateral.
Visual: corpo do celular em grafite com reflexo suave, tela com posts em cards (imagem de cor + linhas de texto), fundo creme com sombra longa do aparelho.
Movimento: rolagem com inércia, pausa, coração com escala 1→1.4→1, partículas.
Use para: mostrar app, social media, "meu post viralizou".`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#efe9df", { grao: 0.12, vinheta: 0.2 });
    c.save(); c.translate(W / 2, H / 2); c.rotate(-0.04);
    c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 60; c.shadowOffsetX = 30; c.shadowOffsetY = 40;
    c.fillStyle = "#2b2a28"; rr(c, -380, -780, 760, 1560, 90); c.fill(); c.shadowColor = "transparent";
    c.save(); rr(c, -350, -750, 700, 1500, 70); c.clip(); c.fillStyle = "#fff"; c.fillRect(-350, -750, 700, 1500);
    const rol = t < 2 ? sai(fase(t, 0, 2)) * 1200 : 1200, ss = rol;
    for (let i = 0; i < 6; i++) { const y = -700 + i * 600 - ss; c.fillStyle = [CLAUDE.ceu, CLAUDE.oliva, CLAUDE.terracota, "#e9b949", "#8e7cc3", CLAUDE.ceu][i]; rr(c, -320, y + 80, 640, 400, 20); c.fill();
      c.fillStyle = "#ddd"; c.beginPath(); c.arc(-290, y + 40, 24, 0, 7); c.fill(); rr(c, -250, y + 30, 200, 20, 10); c.fill();
      const dest = i === 3, pul = dest ? 1 + 0.4 * (fase(t, 2.3, 2.45) - fase(t, 2.45, 2.7)) : 1;
      c.save(); c.translate(-290, y + 530); c.scale(pul, pul); c.fillStyle = dest && t > 2.3 ? "#e0475b" : "#bbb"; c.beginPath(); c.moveTo(0, 12); c.bezierCurveTo(-30, -10, -16, -30, 0, -14); c.bezierCurveTo(16, -30, 30, -10, 0, 12); c.fill(); c.restore();
      texto(c, dest ? Math.round(1200 + 8000 * fase(t, 2.3, 4)).toLocaleString("pt-BR") : "312", -250, y + 530, { tam: 28, peso: 700, alinha: "left" }); }
    c.restore(); c.restore();
    const r = rng(6); for (let i = 0; i < 14; i++) { const tt = t - 2.4 - r() * 1.5; if (tt < 0 || tt > 1.6) continue; c.globalAlpha = 1 - tt / 1.6; texto(c, "♥", W - 140 + 40 * Math.sin(tt * 5 + i), 1500 - tt * 600, { tam: 50 + r() * 30, cor: "#e0475b" }); c.globalAlpha = 1; }
  },
});

semente({
  id: "depoimento-estrelas", nome: "Depoimento com estrelas", grupo: "produto", formato: "1:1",
  resumo: "Cartão de depoimento com aspas grandes, cinco estrelas que se enchem e o nome de quem falou. Prova social.",
  receita: `Vídeo 1:1 de depoimento de cliente (prova social).
Estrutura: aspas enormes na cor de acento caem primeiro; a frase entra palavra por palavra em serifa; 5 estrelas se enchem da esquerda para a direita; avatar genérico com nome e cargo.
Visual: cartão de papel sobre fundo creme, aspas grandes como elemento gráfico, estrelas em âmbar.
Movimento: aspas com peso (queda e assentamento), estrelas com pop em sequência, leve balanço do cartão.
Use para: depoimentos, avaliações, resultados de alunos.`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.creme, { grao: 0.12, vinheta: 0.2 });
    const v = 1 - fase(t, 4.6, 4.95);
    c.save(); c.globalAlpha = v; c.translate(W / 2, H / 2); c.rotate(0.01 * ciclo(t));
    recorte(c, -420, -360, 840, 720, "#fffdf8", { seed: 7, amp: 3 });
    const q = sai(fase(t, 0.1, 0.5)); texto(c, "“", -300, -240 - 100 * (1 - q), { tam: 300, fonte: SERIF, cor: CLAUDE.terracota, alpha: q });
    const pal = "Em uma semana eu fiz o que levava um mês inteiro.".split(" "), n = Math.floor(pal.length * fase(t, 0.5, 2.0));
    const linhas = [pal.slice(0, 5), pal.slice(5)];
    let idx = 0; linhas.forEach((l, li) => { const s = l.filter(() => idx++ < n).join(" "); texto(c, s, -340, -90 + li * 80, { tam: 54, fonte: SERIF, peso: 500, alinha: "left" }); });
    for (let i = 0; i < 5; i++) { const k = entra(t, 2.1 + i * 0.12, 0.3); c.save(); c.translate(-310 + i * 80, 110); c.scale(k, k); c.fillStyle = "#e9b949";
      c.beginPath(); for (let j = 0; j < 10; j++) { const r = j % 2 ? 14 : 32, a = -Math.PI / 2 + (j / 10) * Math.PI * 2; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill(); c.restore(); }
    c.fillStyle = CLAUDE.oliva; c.beginPath(); c.arc(-300, 240, 45, 0, 7); c.fill();
    texto(c, "Ana, criadora de conteúdo", -235, 225, { tam: 32, peso: 700, alinha: "left", alpha: fase(t, 2.6, 3) });
    texto(c, "12 mil seguidores", -235, 265, { tam: 26, alinha: "left", cor: "#8a8577", alpha: fase(t, 2.7, 3.1) });
    c.restore();
  },
});

semente({
  id: "integracoes-pacotes", nome: "Integrações com pacotes", grupo: "produto", formato: "16:9",
  resumo: "Ícones de apps em volta, o produto no centro, pacotes de dados viajando pelas linhas. Mostra que tudo conversa.",
  receita: `Vídeo 16:9 de integrações (o produto conecta com outros).
Estrutura: o produto em destaque no centro; ícones genéricos de apps (quadrados arredondados com símbolo simples, sem marca real) em arco ao redor; linhas finas ligam cada um ao centro; pacotes (pontos de luz) viajam nas linhas nos dois sentidos.
Visual: fundo claro com grade de pontos, ícones em cores suaves, linhas pontilhadas que ficam sólidas quando ativas.
Movimento: cada ícone acende e conecta em sequência; os pacotes seguem em loop perfeito.
Use para: automação, "conecta com tudo que você usa", fluxo de dados.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#f7f5f0", { grao: 0.05, vinheta: 0.1 });
    c.fillStyle = "rgba(61,57,41,.1)"; for (let x = 40; x < W; x += 48) for (let y = 40; y < H; y += 48) c.fillRect(x, y, 3, 3);
    const cx = W / 2, cy = H / 2 + 40, apps = [["✉", CLAUDE.ceu], ["▦", CLAUDE.oliva], ["✎", "#e9b949"], ["☁", "#8e7cc3"], ["◷", CLAUDE.terracota], ["♫", "#6b9e9a"]];
    apps.forEach(([ic, cor], i) => {
      const a = Math.PI + (i / (apps.length - 1)) * Math.PI, x = cx + Math.cos(a) * 620, y = cy + Math.sin(a) * 380 + 120, on = fase(t, 0.2 + i * 0.2, 0.5 + i * 0.2);
      c.strokeStyle = on > 0.9 ? cor : "rgba(61,57,41,.2)"; c.lineWidth = 4; c.setLineDash(on > 0.9 ? [] : [8, 10]);
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo((x + cx) / 2, y, cx, cy); c.stroke(); c.setLineDash([]);
      if (on > 0.9) for (let p = 0; p < 2; p++) { const u = ((t / DUR) * 2 + p * 0.5 + i * 0.13) % 1, uu = p ? 1 - u : u;
        const bx = (1 - uu) * (1 - uu) * x + 2 * (1 - uu) * uu * ((x + cx) / 2) + uu * uu * cx, by = (1 - uu) * (1 - uu) * y + 2 * (1 - uu) * uu * y + uu * uu * cy;
        c.fillStyle = cor; c.beginPath(); c.arc(bx, by, 10, 0, 7); c.fill(); }
      const k = entra(t, 0.1 + i * 0.2, 0.3); c.save(); c.translate(x, y); c.scale(k, k); c.shadowColor = "rgba(0,0,0,.15)"; c.shadowBlur = 20;
      c.fillStyle = "#fff"; rr(c, -60, -60, 120, 120, 28); c.fill(); c.shadowColor = "transparent"; texto(c, ic, 0, 4, { tam: 60, cor }); c.restore();
    });
    c.save(); c.translate(cx, cy); const p = 1 + 0.04 * ciclo(t, 4); c.scale(p, p); c.fillStyle = CLAUDE.tinta; rr(c, -110, -110, 220, 220, 50); c.fill();
    texto(c, "✱", 0, 6, { tam: 130, cor: CLAUDE.terracota }); c.restore();
  },
});

semente({
  id: "carrinho-total", nome: "Carrinho somando", grupo: "produto", formato: "1:1",
  resumo: "Itens voam para o carrinho, o total soma, o desconto risca o preço e o selo de economia aparece. Oferta e combo.",
  receita: `Vídeo 1:1 de oferta (combo, bônus, "tudo isso por").
Estrutura: itens (ícones em cartões) aparecem em cima com o preço de cada um; um a um voam em arco para dentro de um carrinho ilustrado; o total soma em tempo real; no fim o total é riscado e o preço da oferta entra grande, com selo "economize X".
Visual: fundo creme, cartões brancos, preço riscado em cinza com risco vermelho, preço final em terracota.
Movimento: arco com rotação, carrinho dá um pulinho a cada item, risco se desenha.
Use para: lançamento com bônus, combo, Black Friday.`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.creme, { grao: 0.12, vinheta: 0.2 });
    const itens = [["Curso", 297], ["Templates", 97], ["Comunidade", 197]], cx = W / 2, cy = 720;
    let tot = 0;
    itens.forEach(([n, p], i) => {
      const t0 = 0.4 + i * 0.6, u = sai(fase(t, t0, t0 + 0.5)), x0 = 220 + i * 320, y0 = 230;
      if (u >= 1) tot += p; else tot += 0;
      if (u >= 1) return;
      const x = lerp(x0, cx, u), y = lerp(y0, cy - 60, u) - Math.sin(u * Math.PI) * 160, s = 1 - 0.6 * u;
      c.save(); c.translate(x, y); c.rotate(u * 2); c.scale(s, s); c.fillStyle = "#fff"; rr(c, -130, -70, 260, 140, 18); c.fill();
      texto(c, n, 0, -18, { tam: 34, peso: 700 }); texto(c, "R$ " + p, 0, 30, { tam: 30, cor: "#8a8577" }); c.restore();
    });
    const pulo = itens.reduce((a, _, i) => a + (fase(t, 0.9 + i * 0.6, 0.95 + i * 0.6) - fase(t, 0.95 + i * 0.6, 1.1 + i * 0.6)), 0) * 20;
    c.save(); c.translate(cx, cy - pulo); c.strokeStyle = CLAUDE.tinta; c.lineWidth = 14; c.lineJoin = "round";
    c.beginPath(); c.moveTo(-220, -110); c.lineTo(-160, -110); c.lineTo(-120, 80); c.lineTo(160, 80); c.lineTo(200, -60); c.lineTo(-140, -60); c.stroke();
    c.fillStyle = CLAUDE.tinta; [-90, 130].forEach((x) => { c.beginPath(); c.arc(x, 130, 22, 0, 7); c.fill(); }); c.restore();
    texto(c, "R$ " + tot, cx, 930, { tam: 70, peso: 800, cor: t > 2.6 ? "#a8a396" : CLAUDE.tinta });
    if (t > 2.6) { c.strokeStyle = "#c0392b"; c.lineWidth = 7; c.beginPath(); c.moveTo(cx - 140, 935); c.lineTo(cx - 140 + 280 * fase(t, 2.6, 2.9), 925); c.stroke();
      texto(c, "R$ 297", cx, 1020, { tam: 96 * entra(t, 3.0, 0.35), peso: 900, cor: CLAUDE.argila }); }
  },
});

semente({
  id: "telas-responsivas", nome: "Telas responsivas", grupo: "produto", formato: "16:9",
  resumo: "O mesmo site se rearranja no notebook, no tablet e no celular, blocos deslizando para o lugar. Para sites e apps.",
  receita: `Vídeo 16:9 que mostra um site ou app em vários aparelhos.
Estrutura: notebook, tablet e celular genéricos lado a lado; o mesmo layout aparece em cada um, e os blocos (cabeçalho, imagem, texto, botão) deslizam e se reorganizam para caber em cada tela.
Visual: aparelhos em contorno grafite com sombra, blocos em cores suaves e chapadas, fundo creme.
Movimento: os blocos começam soltos no ar e encaixam em cada aparelho com mola, em cascata.
Use para: portfólio de site, entrega para cliente, "funciona em qualquer tela".`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#ece8e0", { grao: 0.08, vinheta: 0.15 });
    const ap = [[180, 300, 860, 540, 0], [1110, 340, 380, 500, 0.3], [1560, 400, 200, 400, 0.6]];
    ap.forEach(([x, y, w, h, at]) => {
      c.shadowColor = "rgba(0,0,0,.2)"; c.shadowBlur = 30; c.shadowOffsetY = 14; c.fillStyle = "#2f2e2b"; rr(c, x - 16, y - 16, w + 32, h + 32, w > 600 ? 16 : 28); c.fill(); c.shadowColor = "transparent";
      if (w > 600) { c.fillStyle = "#3b3a37"; rr(c, x - 80, y + h + 16, w + 160, 30, [0, 0, 16, 16]); c.fill(); }
      c.fillStyle = "#fff"; c.fillRect(x, y, w, h);
      const largo = w > 600, blocos = largo ? [[0, 0, 1, 0.12, "#3d3929"], [0.05, 0.2, 0.45, 0.5, CLAUDE.terracota], [0.55, 0.22, 0.4, 0.08, "#ddd"], [0.55, 0.34, 0.35, 0.06, "#e6e3dc"], [0.55, 0.5, 0.18, 0.1, CLAUDE.oliva], [0.05, 0.76, 0.9, 0.16, "#f0ede6"]]
        : [[0, 0, 1, 0.1, "#3d3929"], [0.08, 0.14, 0.84, 0.32, CLAUDE.terracota], [0.08, 0.5, 0.84, 0.06, "#ddd"], [0.08, 0.6, 0.6, 0.05, "#e6e3dc"], [0.08, 0.7, 0.4, 0.08, CLAUDE.oliva], [0.08, 0.83, 0.84, 0.12, "#f0ede6"]];
      blocos.forEach(([bx, by, bw, bh, cor], i) => { const k = sai(fase(t, 0.3 + at + i * 0.1, 0.9 + at + i * 0.1)) * (1 - fase(t, 4.5, 4.95)), oy = (1 - k) * -300;
        c.globalAlpha = k; c.fillStyle = cor; rr(c, x + bx * w, y + by * h + oy, bw * w, bh * h, 6); c.fill(); c.globalAlpha = 1; });
    });
  },
});

semente({
  id: "produto-giratorio", nome: "Produto no giratório", grupo: "produto", formato: "1:1",
  resumo: "O produto gira num pedestal com luz de estúdio, chamadas de benefício saem dele em linhas e o preço entra no fim. Anúncio de loja.",
  receita: `Anúncio 1:1 (ou 9:16) de produto físico.
Estrutura: o produto em cima de um pedestal redondo que gira devagar, com luz de estúdio de cima e reflexo no chão; 3 benefícios saem do produto em linhas finas com ponto na ponta, um por vez; no fim, etiqueta de preço com parcelamento e selo de frete.
Visual: fundo em gradiente da cor da marca, pedestal claro, sombra de contato macia, tipografia sans limpa.
Movimento: giro contínuo (loop exato), chamadas com linha que se estende e texto que digita, etiqueta com balanço de pendurada.
Use para: loja online, lançamento de produto, anúncio de marketplace e Meta Ads.`,
  higgsfield: "Foto do produto em fundo transparente (ou vistas de vários ângulos para o giro) pela Higgsfield, como no estilo Higgsfield; pedestal, luz, chamadas e preço ficam no código.",
  cena(c, t, W, H) {
    const g = c.createRadialGradient(W / 2, H * 0.4, 50, W / 2, H * 0.5, 800); g.addColorStop(0, "#f6e3d6"); g.addColorStop(1, "#d99a7c"); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const cx = W / 2, cy = 760, a = (t / DUR) * Math.PI * 2;
    c.fillStyle = "rgba(0,0,0,.15)"; c.beginPath(); c.ellipse(cx, cy + 70, 330, 50, 0, 0, 7); c.fill();
    c.fillStyle = "#efe9e1"; c.beginPath(); c.ellipse(cx, cy + 40, 300, 60, 0, 0, 7); c.fill(); c.fillRect(cx - 300, cy - 20, 600, 60);
    c.fillStyle = "#fbf8f4"; c.beginPath(); c.ellipse(cx, cy - 20, 300, 60, 0, 0, 7); c.fill();
    const w = 150 * (0.75 + 0.25 * Math.abs(Math.cos(a))), lado = Math.sin(a);
    c.fillStyle = "#3d3929"; rr(c, cx - w, cy - 420, 2 * w, 400, 50); c.fill();
    c.fillStyle = mistura("#3d3929", "#ffffff", 0.18); rr(c, cx - w + w * 0.2 * (1 + lado), cy - 400, w * 0.35, 360, 30); c.fill();
    c.fillStyle = CLAUDE.terracota; rr(c, cx - w * 0.8, cy - 260, w * 1.6, 90, 12); c.fill();
    c.fillStyle = "#c9c2b6"; rr(c, cx - 50, cy - 470, 100, 60, 14); c.fill();
    const ch = [["mantém quente 12 h", 160, 300, 0.4], ["aço inox", 900, 420, 1.1], ["cabe no porta-copos", 180, 620, 1.8]];
    ch.forEach(([s, x, y, t0]) => { const k = fase(t, t0, t0 + 0.4), v = 1 - fase(t, 4.5, 4.9); if (k <= 0) return; const px = cx + (x < cx ? -120 : 120), py = y + 40;
      c.save(); c.globalAlpha = v; c.strokeStyle = CLAUDE.tinta; c.lineWidth = 2.5; c.beginPath(); c.moveTo(px, py); c.lineTo(lerp(px, x + (x < cx ? 200 : -10), k), lerp(py, y, k)); c.stroke();
      c.fillStyle = CLAUDE.tinta; c.beginPath(); c.arc(px, py, 7, 0, 7); c.fill();
      texto(c, digita(s, fase(t, t0 + 0.3, t0 + 0.8)), x + (x < cx ? 190 : 0), y - 24, { tam: 34, peso: 700, alinha: x < cx ? "right" : "left" }); c.restore(); });
    if (t > 2.6) { const k = entra(t, 2.6, 0.4), bal = 0.08 * Math.sin((t - 2.6) * 6) * Math.exp(-(t - 2.6) * 1.5); c.save(); c.translate(820, 120); c.rotate(bal); c.scale(k, k);
      c.strokeStyle = CLAUDE.tinta; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 60); c.stroke(); c.fillStyle = "#fff"; rr(c, -110, 60, 220, 150, 16); c.fill();
      texto(c, "R$ 149", 0, 120, { tam: 56, peso: 900 }); texto(c, "ou 3× de R$ 49,67", 0, 170, { tam: 22, cor: "#6f6a5c" }); c.restore(); }
  },
});
