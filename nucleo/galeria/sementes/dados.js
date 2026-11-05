// Grupo Dados e gráficos: números que contam a história sozinhos.

function dEsfera(c, cx, cy, R, t, { n = 700, cor = "200,210,220", giro = 1, seed = 1 } = {}) {
  const r = rng(seed), rot = (t / DUR) * Math.PI * 2 * giro;
  for (let i = 0; i < n; i++) {
    const u = r() * 2 - 1, a = r() * Math.PI * 2 + rot, s = Math.sqrt(1 - u * u);
    const x = Math.cos(a) * s, z = Math.sin(a) * s, y = u;
    const k = (z + 1) / 2;
    c.fillStyle = `rgba(${cor},${0.15 + 0.75 * k})`;
    c.fillRect(cx + x * R, cy + y * R, 2 + 2 * k, 2 + 2 * k);
  }
}

semente({
  id: "laboratorio-particulas", estilo: "laboratorio", nome: "Laboratório de partículas", grupo: "dados", formato: "1:1",
  resumo: "Fundo quase preto, esferas feitas de pontos, serifa no título e legenda curta embaixo. Ciência séria e bonita.",
  receita: `Explicador 1:1 (ou 16:9) de ciência e dados em tom sóbrio. É o estilo "Laboratório" do estúdio (estilos/laboratorio/).
Estrutura: uma ideia por cena; cada cena tem um objeto central feito de pontos (esfera de células, fita de DNA, nuvem de dados) e uma legenda de uma linha embaixo, centralizada; títulos de abertura em serifa grande com sobretítulo pequeno em sans.
Visual: fundo #0e0e12 com manchas de cor muito escuras e desfocadas (ameixa, azul-petróleo), pontos em cinza claro, acentos em magenta (#d04ad0), âmbar (#e8a33c) e verde-água (#4fd1c5).
Movimento: tudo lento e contínuo (esferas girando, fitas ondulando), rótulos finos com linha guia; comparações lado a lado com cabeçalhos "padrão" / "novo".
Voz: narrador calmo, frases curtas, uma informação por vez.
Use para: ciência, saúde, pesquisa, dados técnicos que precisam de credibilidade.`,
  cena(c, t, W, H) {
    c.fillStyle = "#0e0e12"; c.fillRect(0, 0, W, H);
    [[W * 0.2, H * 0.3, "80,30,90"], [W * 0.8, H * 0.7, "20,60,70"]].forEach(([x, y, cor]) => { const g = c.createRadialGradient(x, y, 0, x, y, 500); g.addColorStop(0, `rgba(${cor},.5)`); g.addColorStop(1, `rgba(${cor},0)`); c.fillStyle = g; c.fillRect(0, 0, W, H); });
    texto(c, "CÉLULA T  ·  REDESENHADA", 80, 110, { tam: 24, peso: 600, alinha: "left", cor: "#9a9aa6", espaco: 3 });
    texto(c, "Menor e mais forte", 80, 180, { tam: 66, fonte: SERIF, peso: 400, alinha: "left", cor: "#ecebf0" });
    const cx = W / 2 + 60, cy = H / 2 + 60, R = 260;
    dEsfera(c, cx, cy, R, t, { n: 1400 });
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + (t / DUR) * Math.PI * 2, z = Math.sin(a);
      if (z < -0.2) continue;
      const x = cx + Math.cos(a) * R, y = cy + Math.sin(a * 0.5) * 40 - 0, l = 50 * (0.6 + 0.4 * z);
      c.strokeStyle = `rgba(79,209,197,${0.4 + 0.6 * z})`; c.lineWidth = 3;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y - l * 0.3); c.stroke();
      c.beginPath(); c.arc(x + Math.cos(a) * l, y - l * 0.3, 8, 0, 7); c.stroke();
    }
    const fita = [...Array(40)].map((_, i) => [120 + i * 7, 420 + 14 * Math.sin(i * 0.9 + t * 6)]);
    fita.forEach(([x, y], i) => { c.fillStyle = i < 20 ? "#e8a33c" : "#d04ad0"; c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); });
    texto(c, "a instrução", 120, 380, { tam: 26, peso: 500, alinha: "left", cor: "#cfcfd8" });
    const leg = t < 2.5 ? "Eles cortaram setenta por cento —" : "e ela funcionou melhor.";
    texto(c, leg, W / 2, H - 90, { tam: 36, peso: 500, cor: "#f2f2f5", alpha: vida(t % 2.5, 0, 2.5, 0.3) });
  },
});

semente({
  id: "corrida-barras", nome: "Corrida de barras", grupo: "dados", formato: "16:9",
  resumo: "Barras horizontais disputam posição ao longo dos anos, trocam de lugar com suavidade, ano gigante no canto.",
  receita: `Gráfico 16:9 de corrida de barras (bar chart race).
Estrutura: 6 a 10 barras horizontais ordenadas por valor; o tempo avança (ano/mês grande no canto inferior direito); as barras crescem e trocam de posição deslizando; o valor corre na ponta de cada barra.
Visual: fundo claro, barras em cores suaves fixas por item, rótulo à esquerda, ícone redondo na ponta; grade vertical fina com escala que se ajusta.
Movimento: interpolação contínua de valor e posição (nunca pulo); a líder ganha um brilho.
Use para: rankings ao longo do tempo, evolução de mercado, popularidade.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#f6f3ec", { grao: 0.08, vinheta: 0.1 });
    c.globalAlpha = 1 - fase(t, 4.5, 4.95);
    const itens = [["Vídeo", CLAUDE.terracota, [20, 40, 70, 95, 120]], ["Texto", CLAUDE.ceu, [60, 70, 78, 85, 90]], ["Áudio", CLAUDE.oliva, [10, 25, 45, 60, 100]], ["Imagem", "#e9b949", [40, 60, 75, 80, 82]], ["Código", "#8e7cc3", [30, 35, 55, 90, 110]]];
    const u = fase(t, 0.2, 4.2) * 3.999, i0 = Math.floor(u), f = ease(u - i0);
    const vals = itens.map(([n, cor, v]) => [n, cor, lerp(v[i0], v[i0 + 1], f)]);
    const ord = [...vals].sort((a, b) => b[2] - a[2]), max = ord[0][2];
    c.strokeStyle = "rgba(61,57,41,.1)"; c.lineWidth = 2; for (let x = 0; x <= 5; x++) { const gx = 340 + x * 280; c.beginPath(); c.moveTo(gx, 140); c.lineTo(gx, 940); c.stroke(); }
    vals.forEach(([n, cor, v]) => {
      const pos = ord.findIndex((o) => o[0] === n), alvo = 200 + pos * 150;
      const y = alvo, w = (v / max) * 1300;
      texto(c, n, 310, y + 50, { tam: 40, peso: 700, alinha: "right" });
      c.fillStyle = cor; rr(c, 340, y, w, 100, 10); c.fill();
      texto(c, Math.round(v) + " mi", 340 + w + 20, y + 52, { tam: 36, peso: 600, alinha: "left", cor: "#6f6a5c" });
    });
    texto(c, String(2022 + Math.round(u)), W - 120, H - 110, { tam: 160, fonte: SERIF, peso: 600, alinha: "right", cor: "rgba(61,57,41,.2)" });
  },
});

semente({
  id: "contador-odometro", nome: "Contador odômetro", grupo: "dados", formato: "16:9",
  resumo: "Um número grande gira dígito por dígito como odômetro até o valor final, com a frase de impacto embaixo.",
  receita: `Cartela 16:9 de número de impacto.
Estrutura: um número enorme no centro formado por rolos de dígitos (odômetro) que giram em velocidades diferentes e travam da esquerda para a direita; unidade e frase curta embaixo.
Visual: fundo terracota chapado, dígitos em creme numa janela com sombra interna, linhas de corte acima e abaixo como num marcador mecânico.
Movimento: rolos com desfoque de movimento enquanto giram, travam com pequeno quique; ao final a frase entra por máscara.
Use para: estatística de impacto, resultado de cliente, marco de seguidores.`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.terracota, { grao: 0.25, vinheta: 0.35 });
    const alvo = "1.000.000", dig = alvo.split(""), larg = 150, x0 = W / 2 - (dig.length * larg) / 2, y = H / 2 - 40, v = 1 - fase(t, 4.6, 4.95);
    c.save(); c.globalAlpha = v;
    c.fillStyle = "rgba(0,0,0,.18)"; rr(c, x0 - 30, y - 140, dig.length * larg + 60, 280, 24); c.fill();
    let col = 0;
    dig.forEach((d, i) => {
      const x = x0 + i * larg + larg / 2;
      if (d === ".") { texto(c, ".", x, y + 40, { tam: 180, fonte: GROSSA, cor: CLAUDE.papel }); return; }
      const trava = 0.6 + col * 0.25, k = fase(t, 0.1, trava), giros = 3 + col, pos = Number(d) + giros * 10 * (1 - k);
      c.save(); c.beginPath(); c.rect(x - larg / 2 + 6, y - 120, larg - 12, 240); c.clip();
      for (let j = -1; j <= 1; j++) { const n = (Math.floor(pos) + j + 100) % 10;
        texto(c, String(n), x, y + 40 + (j - (pos - Math.floor(pos))) * 300, { tam: 200, fonte: GROSSA, cor: CLAUDE.papel, alpha: k < 1 ? 0.85 : 1 }); }
      c.restore(); col++;
    });
    c.fillStyle = "rgba(0,0,0,.25)"; c.fillRect(x0 - 30, y - 6, dig.length * larg + 60, 4);
    const m = sai(fase(t, 2.6, 3.1));
    c.save(); c.beginPath(); c.rect(0, y + 170, W, 120); c.clip();
    texto(c, "de visualizações no primeiro mês", W / 2, y + 230 + 100 * (1 - m), { tam: 56, fonte: SERIF, peso: 500, cor: CLAUDE.papel }); c.restore();
    c.restore();
  },
});

semente({
  id: "linha-anotada", nome: "Linha com anotação", grupo: "dados", formato: "16:9",
  resumo: "A linha do gráfico se desenha, um ponto viaja na ponta e para no momento importante com uma nota à mão.",
  receita: `Gráfico 16:9 de linha com narrativa.
Estrutura: eixos discretos; a linha se desenha da esquerda para a direita com um ponto luminoso na ponta e área preenchida suave embaixo; no evento-chave, a linha pausa, aparece uma linha vertical tracejada e uma anotação manuscrita com seta.
Visual: fundo creme, linha em terracota grossa, área em terracota 15%, anotação em caneta azul.
Movimento: desenho contínuo com desaceleração antes do evento, pausa, e segue até o fim; o número do último ponto conta junto.
Use para: crescimento, queda, "o que mudou quando".`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.creme, { grao: 0.1, vinheta: 0.15 });
    const x0 = 200, x1 = 1720, y0 = 900, y1 = 180, n = 60;
    const pts = [...Array(n)].map((_, i) => { const u = i / (n - 1), base = u < 0.55 ? 0.15 + u * 0.15 + 0.03 * Math.sin(i) : 0.23 + (u - 0.55) * 1.5 + 0.02 * Math.sin(i * 1.3); return [lerp(x0, x1, u), lerp(y0, y1, base)]; });
    c.strokeStyle = "rgba(61,57,41,.2)"; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y1 - 40); c.lineTo(x0, y0); c.lineTo(x1 + 40, y0); c.stroke();
    const k = t < 2 ? fase(t, 0.2, 2) * 0.55 : t < 2.8 ? 0.55 : 0.55 + 0.45 * fase(t, 2.8, 4.4);
    const v = 1 - fase(t, 4.6, 4.95), m = Math.max(1, Math.floor(k * (n - 1)));
    c.save(); c.globalAlpha = v;
    c.fillStyle = "rgba(217,119,87,.15)"; c.beginPath(); c.moveTo(x0, y0); pts.slice(0, m + 1).forEach(([x, y]) => c.lineTo(x, y)); c.lineTo(pts[m][0], y0); c.fill();
    P_LINHA2(c, pts.slice(0, m + 1));
    const [px, py] = pts[m]; const g = c.createRadialGradient(px, py, 0, px, py, 40); g.addColorStop(0, "rgba(217,119,87,.8)"); g.addColorStop(1, "rgba(217,119,87,0)");
    c.fillStyle = g; c.beginPath(); c.arc(px, py, 40, 0, 7); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.arc(px, py, 9, 0, 7); c.fill();
    const a = fase(t, 2.0, 2.4);
    if (a > 0) { const ex = pts[33][0]; c.setLineDash([10, 10]); c.strokeStyle = `rgba(61,57,41,${0.5 * a})`; c.beginPath(); c.moveTo(ex, y1); c.lineTo(ex, y0); c.stroke(); c.setLineDash([]);
      texto(c, digita("aqui começou o vídeo curto", fase(t, 2.2, 2.8)), ex - 40, 300, { tam: 50, fonte: MAO, cor: "#1f3b6e", alinha: "right" });
      c.strokeStyle = "#1f3b6e"; c.lineWidth = 5; tracar(c, borda([[ex - 120, 340], [ex - 30, 420], [ex - 8, pts[33][1] - 20]], 3, 2, 6).slice(0, 13), fase(t, 2.5, 2.8), false); }
    texto(c, Math.round(lerp(1200, 48000, Math.max(0, (k - 0.5) * 2))).toLocaleString("pt-BR"), px + 20, py - 50, { tam: 40, peso: 800, alinha: "left", cor: CLAUDE.argila });
    c.restore();
  },
});
function P_LINHA2(c, pts) { c.strokeStyle = CLAUDE.terracota; c.lineWidth = 10; c.lineCap = c.lineJoin = "round"; caminho(c, pts, false); c.stroke(); }

semente({
  id: "rosca-fatias", nome: "Rosca de fatias", grupo: "dados", formato: "1:1",
  resumo: "Gráfico de rosca que cresce fatia por fatia, a maior se destaca para fora com o percentual no centro.",
  receita: `Gráfico 1:1 de proporções (rosca/donut).
Estrutura: a rosca se forma fatia por fatia no sentido horário; cada fatia ganha rótulo com linha guia; no fim, a fatia principal se afasta do centro e o percentual dela aparece grande no meio.
Visual: fundo creme, fatias em paleta suave, espaços finos entre fatias, número central em serifa.
Movimento: crescimento angular com ease, destaque com mola, leve rotação contínua da rosca.
Use para: "para onde vai o seu tempo", composição de custos, divisão de público.`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.creme, { grao: 0.12, vinheta: 0.15 });
    const fat = [[0.42, CLAUDE.terracota, "editando"], [0.23, CLAUDE.oliva, "gravando"], [0.2, CLAUDE.ceu, "roteiro"], [0.15, "#e9b949", "postando"]];
    const cx = W / 2, cy = H / 2 + 30, R = 330, r = 190, cresce = fase(t, 0.2, 2.0), v = 1 - fase(t, 4.6, 4.95);
    texto(c, "Seu tempo num vídeo", cx, 110, { tam: 54, fonte: SERIF, peso: 600, alpha: v });
    let a = -Math.PI / 2 + 0.2 * ciclo(t) * 0.3;
    c.save(); c.globalAlpha = v;
    fat.forEach(([p, cor, nome], i) => {
      const da = p * Math.PI * 2 * cresce, meio = a + da / 2, sai2 = i === 0 ? 30 * entra(t, 2.2, 0.4) : 0;
      const ox = Math.cos(meio) * sai2, oy = Math.sin(meio) * sai2;
      c.fillStyle = cor; c.beginPath(); c.arc(cx + ox, cy + oy, R, a + 0.015, a + da - 0.015); c.arc(cx + ox, cy + oy, r, a + da - 0.015, a + 0.015, true); c.fill();
      if (cresce > 0.98) { const lx = cx + Math.cos(meio) * (R + 70), ly = cy + Math.sin(meio) * (R + 70);
        texto(c, nome, lx, ly, { tam: 34, peso: 700, cor, alpha: fase(t, 2, 2.4) }); }
      a += da;
    });
    texto(c, Math.round(42 * fase(t, 2.2, 3)) + "%", cx, cy - 10, { tam: 120, fonte: SERIF, peso: 600, cor: CLAUDE.argila });
    texto(c, "editando", cx, cy + 70, { tam: 34, peso: 500, alpha: fase(t, 2.6, 3) });
    c.restore();
  },
});

semente({
  id: "calendario-calor", nome: "Calendário de calor", grupo: "dados", formato: "16:9",
  resumo: "Uma grade de dias que acende quadrado por quadrado, mais forte nos dias de mais ação. Mostra constância.",
  receita: `Gráfico 16:9 de constância (heatmap de calendário).
Estrutura: grade de 52 colunas por 7 linhas (um ano); os quadrados acendem em onda da esquerda para a direita com intensidade conforme o valor; no fim, um contador de "dias seguidos" e um destaque na maior sequência.
Visual: quadrados arredondados em 5 tons da cor de acento (do creme ao terracota escuro), meses em cima, legenda "menos/mais".
Movimento: onda de acendimento rápida com pequeno pulso em cada quadrado; destaque com contorno que se desenha.
Use para: hábito, consistência de postagem, "1 ano fazendo X".`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#faf8f3", { grao: 0.06, vinheta: 0.1 });
    texto(c, "365 dias postando", 160, 180, { tam: 64, fonte: SERIF, peso: 600, alinha: "left" });
    const tons = ["#ece7dc", "#f3cbb6", "#e9a283", "#d97757", "#a9472b"], r = rng(12), s = 26, g = 5, x0 = 150, y0 = 330;
    const onda = fase(t, 0.2, 3.0) * 60, v = 1 - fase(t, 4.6, 4.95);
    "jan fev mar abr mai jun jul ago set out nov dez".split(" ").forEach((m, i) => texto(c, m, x0 + i * 4.33 * (s + g), y0 - 30, { tam: 22, peso: 500, alinha: "left", cor: "#8a8577" }));
    for (let col = 0; col < 52; col++) for (let lin = 0; lin < 7; lin++) {
      const val = Math.min(4, Math.floor(r() * 5 * (0.4 + col / 70))), on = clamp(onda - col), p = 1 + 0.25 * (on > 0 && on < 1 ? Math.sin(on * Math.PI) : 0);
      const x = x0 + col * (s + g) + s / 2, y = y0 + lin * (s + g) + s / 2;
      c.save(); c.globalAlpha = v; c.translate(x, y); c.scale(p, p); c.fillStyle = on > 0 ? tons[val] : tons[0]; rr(c, -s / 2, -s / 2, s, s, 6); c.fill(); c.restore();
    }
    const dest = fase(t, 3.0, 3.6);
    if (dest > 0) { c.save(); c.globalAlpha = v; c.strokeStyle = CLAUDE.tinta; c.lineWidth = 4; c.setLineDash([2000]); c.lineDashOffset = 2000 * (1 - dest);
      rr(c, x0 + 38 * (s + g) - 8, y0 - 8, 12 * (s + g) + 10, 7 * (s + g) + 10, 10); c.stroke(); c.restore();
      texto(c, Math.round(84 * dest) + " dias seguidos", x0 + 44 * (s + g), y0 + 7 * (s + g) + 60, { tam: 40, peso: 800, cor: CLAUDE.argila, alpha: v }); }
  },
});

semente({
  id: "pictograma-pessoas", nome: "Pictograma de pessoas", grupo: "dados", formato: "1:1",
  resumo: "Cem bonequinhos em grade; os que representam o dado mudam de cor um a um. Porcentagem que se sente.",
  receita: `Gráfico 1:1 em pictograma (10 x 10 pessoas = 100%).
Estrutura: grade de 100 ícones de pessoa em cinza; a frase em cima ("7 em cada 10..."); os ícones do dado acendem na cor de acento em sequência (linha por linha ou espalhados); o percentual cresce ao lado.
Visual: ícones simples (cabeça redonda + corpo arredondado), fundo creme, número em serifa grande.
Movimento: cada ícone acende com um pulo pequeno; pausa no final com o número.
Use para: pesquisa, estatística de público, "quantas pessoas fazem X".`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.creme, { grao: 0.1, vinheta: 0.15 });
    texto(c, "7 em cada 10 desistem", W / 2, 110, { tam: 56, fonte: SERIF, peso: 600 });
    texto(c, "antes do décimo vídeo", W / 2, 175, { tam: 36, peso: 400, cor: "#6f6a5c" });
    const ordem = [...Array(100).keys()].sort((a, b) => rng(a + 3)() - rng(b + 3)()), acesos = Math.floor(70 * fase(t, 0.5, 3.0)), v = 1 - fase(t, 4.6, 4.95);
    for (let i = 0; i < 100; i++) {
      const col = i % 10, lin = Math.floor(i / 10), x = 190 + col * 78, y = 280 + lin * 74, on = ordem.indexOf(i) < acesos;
      const pulo = on ? 6 * Math.max(0, Math.sin((t - 0.5 - (ordem.indexOf(i) / 70) * 2.5) * 12)) * (t < 3.3 ? 1 : 0) : 0;
      c.save(); c.globalAlpha = v; c.fillStyle = on ? CLAUDE.terracota : "#cfcac0";
      c.beginPath(); c.arc(x, y - 18 - pulo, 12, 0, 7); c.fill(); rr(c, x - 17, y - 2 - pulo, 34, 34, [14, 14, 4, 4]); c.fill(); c.restore();
    }
  },
});

semente({
  id: "bolhas-tamanho", nome: "Bolhas de tamanho", grupo: "dados", formato: "16:9",
  resumo: "Círculos com áreas proporcionais se empacotam lado a lado; o gigante empurra os pequenos. Escala visível.",
  receita: `Gráfico 16:9 de comparação por área (bolhas empacotadas).
Estrutura: cada item é um círculo com área proporcional ao valor; eles nascem do centro e se empurram até se acomodar; o maior recebe o rótulo principal; os menores, rótulos curtos.
Visual: círculos em cores suaves com contorno fino, sombra interna leve, fundo escuro quente para contraste.
Movimento: crescimento com mola e física de repulsão simples; leve flutuação contínua.
Use para: "quanto X é maior que Y", orçamento, população, receita por fonte.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#26231f", { grao: 0.2, vinheta: 0.4 });
    const b = [[0, 0, 300, CLAUDE.terracota, "YouTube"], [430, -120, 150, CLAUDE.oliva, "Reels"], [400, 190, 120, CLAUDE.ceu, "TikTok"], [-410, 150, 110, "#e9b949", "Blog"], [-380, -170, 80, "#8e7cc3", "Podcast"], [600, 30, 50, "#cfcac0", "X"]];
    b.forEach(([x, y, r, cor, n], i) => {
      const k = entra(t, 0.2 + i * 0.25, 0.5) * (1 - fase(t, 4.6, 4.95)), fx = 8 * ciclo(t, 1 + (i % 2)), fy = 8 * ciclo(t + i, 1);
      if (k <= 0) return;
      const px = W / 2 + x + fx, py = H / 2 + y + fy;
      c.save(); c.translate(px, py); c.scale(k, k);
      const g = c.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r); g.addColorStop(0, mistura(cor, "#ffffff", 0.25)); g.addColorStop(1, cor);
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
      texto(c, n, 0, r > 100 ? -10 : 0, { tam: Math.max(22, r * 0.28), peso: 800, cor: "#fff" });
      if (r > 100) texto(c, ["62%", "15%", "10%"][i] || "", 0, r * 0.25, { tam: r * 0.22, fonte: SERIF, peso: 500, cor: "rgba(255,255,255,.85)" });
      c.restore();
    });
  },
});

semente({
  id: "escala-zoom", nome: "Escala em zoom", grupo: "dados", formato: "16:9",
  resumo: "Começa num ponto minúsculo e afasta a câmera até revelar o tamanho do todo. Comparação de ordem de grandeza.",
  receita: `Explicador 16:9 de ordem de grandeza (zoom out contínuo).
Estrutura: começa num objeto pequeno com rótulo; a câmera afasta em escala exponencial e cada novo nível revela algo 10x maior com seu rótulo e número; termina no todo.
Visual: fundo claro que escurece com a distância, objetos em silhueta simples, régua de escala no canto que muda de unidade.
Movimento: zoom exponencial suave (escala = 10^t), rótulos entram e saem pela distância.
Use para: "quanto é um bilhão", tamanho de dados, comparar escalas.`,
  cena(c, t, W, H) {
    const z = Math.pow(10, -3 * ciclo01(t, 1)), cx = W / 2, cy = H / 2;
    fundo(c, W, H, mistura("#f0eee6", "#1d2333", 1 - z), { grao: 0.12, vinheta: 0.3 });
    const niveis = [[1, "1 vídeo", CLAUDE.terracota], [10, "1 canal", CLAUDE.oliva], [100, "1 nicho", CLAUDE.ceu], [1000, "a plataforma", "#e9b949"]];
    niveis.forEach(([s, n, cor], i) => {
      const r = 80 * s * z * 2.2; if (r < 2 || r > W * 3) return;
      c.strokeStyle = cor; c.lineWidth = 6; c.globalAlpha = clamp(r / 60) * clamp(3 - r / 500);
      if (i === 0) { c.fillStyle = cor; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill(); }
      else { c.setLineDash([16, 12]); c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke(); c.setLineDash([]); const rq = rng(i); for (let k = 0; k < 40; k++) { c.fillStyle = cor; c.beginPath(); c.arc(cx + Math.cos(k * 2.4) * r * rq(), cy + Math.sin(k * 2.4) * r * rq(), Math.max(1, r * 0.03), 0, 7); c.fill(); } }
      texto(c, n, cx, cy - r - 30, { tam: 44, peso: 700, cor: z < 0.1 ? "#f0eee6" : CLAUDE.tinta });
      c.globalAlpha = 1;
    });
    c.fillStyle = z < 0.2 ? "#f0eee6" : CLAUDE.tinta; c.fillRect(80, H - 100, 200, 6);
    texto(c, "× " + Math.round(1 / z).toLocaleString("pt-BR"), 300, H - 96, { tam: 34, peso: 700, alinha: "left", cor: z < 0.2 ? "#f0eee6" : CLAUDE.tinta });
  },
});

semente({
  id: "painel-kpi", nome: "Painel de KPIs", grupo: "dados", formato: "16:9",
  resumo: "Cartões de métrica entram em cascata, números sobem, setas verdes e mini gráficos. Relatório que parece vivo.",
  receita: `Painel 16:9 de métricas (resultado do mês, relatório de cliente).
Estrutura: 4 a 6 cartões em grade; cada um com rótulo pequeno, número grande que conta até o valor, variação em pílula (verde ▲ / vermelho ▼) e um mini gráfico de linha (sparkline) que se desenha.
Visual: fundo claro, cartões brancos com sombra mínima e cantos de 20 px, tipografia sans, números tabulares.
Movimento: cartões em cascata (80 ms entre eles) com subida curta; contadores em 1 s; sparklines em seguida.
Use para: relatório mensal, resultado de campanha, prova social.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#f1efe9", { grao: 0.05, vinheta: 0.08 });
    texto(c, "Outubro", 120, 110, { tam: 54, fonte: SERIF, peso: 600, alinha: "left" });
    const kp = [["Visualizações", 482000, "+38%", 1], ["Seguidores", 12400, "+12%", 1], ["Retenção", 61, "+4 p.p.", 1], ["Custo por lead", 3.2, "-21%", 1], ["Vendas", 214, "+9%", 1], ["Rejeição", 34, "+2%", 0]];
    kp.forEach(([n, val, d, bom], i) => {
      const col = i % 3, lin = Math.floor(i / 3), x = 120 + col * 570, y = 200 + lin * 420, k = sai(fase(t, 0.2 + i * 0.08, 0.6 + i * 0.08)), v = 1 - fase(t, 4.6, 4.95);
      c.save(); c.globalAlpha = k * v; c.translate(0, 30 * (1 - k));
      c.shadowColor = "rgba(0,0,0,.08)"; c.shadowBlur = 20; c.fillStyle = "#fff"; rr(c, x, y, 520, 360, 20); c.fill(); c.shadowColor = "transparent";
      texto(c, n, x + 40, y + 60, { tam: 30, peso: 600, alinha: "left", cor: "#7a7568" });
      const cont = val * sai(fase(t, 0.5, 1.6));
      texto(c, val < 10 ? "R$ " + cont.toFixed(2).replace(".", ",") : Math.round(cont).toLocaleString("pt-BR") + (n === "Retenção" || n === "Rejeição" ? "%" : ""), x + 40, y + 150, { tam: 76, peso: 800, alinha: "left" });
      c.fillStyle = bom ? "#e3eedb" : "#f6ddd6"; rr(c, x + 40, y + 205, 150, 46, 23); c.fill();
      texto(c, (bom ? "▲ " : "▼ ") + d, x + 115, y + 229, { tam: 26, peso: 700, cor: bom ? "#4d6b35" : "#a8432c" });
      const sp = [...Array(16)].map((_, j) => [x + 260 + j * 15, y + 300 - (j * 4 + 18 * Math.sin(j * 1.3 + i)) * (bom ? 1 : -0.6) - (bom ? 0 : 60)]);
      c.strokeStyle = bom ? CLAUDE.oliva : "#c0533a"; c.lineWidth = 5; c.lineCap = "round"; tracar(c, sp, fase(t, 1.4, 2.2), false);
      c.restore();
    });
  },
});

semente({
  id: "velocimetro", nome: "Velocímetro", grupo: "dados", formato: "1:1",
  resumo: "Um medidor semicircular com o ponteiro que sobe, treme e para na zona certa. Nota, risco ou nível.",
  receita: `Gráfico 1:1 de medidor (gauge).
Estrutura: arco semicircular dividido em zonas (vermelho, amarelo, verde ou baixo, médio, alto); o ponteiro sai do zero, passa do ponto, volta e treme até parar; o valor aparece grande embaixo com o rótulo da zona.
Visual: arco grosso com marcas, ponteiro afiado com pino central, fundo creme, zonas em cores suaves.
Movimento: ponteiro com mola amortecida (passa e volta duas vezes), marcas acendem conforme ele passa.
Use para: nota de algo, nível de risco, "quão pronto você está", score.`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.creme, { grao: 0.12, vinheta: 0.2 });
    const cx = W / 2, cy = H / 2 + 120, R = 380, zonas = [["#d9826b", 0, 0.33], ["#e9c46a", 0.33, 0.66], [CLAUDE.oliva, 0.66, 1]];
    zonas.forEach(([cor, a, b]) => { c.strokeStyle = cor; c.lineWidth = 70; c.beginPath(); c.arc(cx, cy, R, Math.PI + a * Math.PI + 0.01, Math.PI + b * Math.PI - 0.01); c.stroke(); });
    for (let i = 0; i <= 20; i++) { const a = Math.PI + (i / 20) * Math.PI; c.strokeStyle = CLAUDE.tinta; c.lineWidth = i % 5 ? 3 : 6; c.beginPath(); c.moveTo(cx + Math.cos(a) * (R - 60), cy + Math.sin(a) * (R - 60)); c.lineTo(cx + Math.cos(a) * (R - (i % 5 ? 85 : 100)), cy + Math.sin(a) * (R - (i % 5 ? 85 : 100))); c.stroke(); }
    const u = clamp((t - 0.4) / 2.2), alvo = 0.82, mola = t < 0.4 ? 0 : alvo * (1 - Math.exp(-5 * u) * Math.cos(9 * u)), val = mola * (1 - fase(t, 4.4, 4.95));
    const a = Math.PI + val * Math.PI;
    c.save(); c.translate(cx, cy); c.rotate(a); c.fillStyle = CLAUDE.tinta; c.beginPath(); c.moveTo(R - 110, 0); c.lineTo(0, -16); c.lineTo(-40, 0); c.lineTo(0, 16); c.fill(); c.restore();
    c.fillStyle = CLAUDE.tinta; c.beginPath(); c.arc(cx, cy, 30, 0, 7); c.fill(); c.fillStyle = CLAUDE.terracota; c.beginPath(); c.arc(cx, cy, 12, 0, 7); c.fill();
    texto(c, Math.round(val * 100) + "", cx, cy + 140, { tam: 140, fonte: SERIF, peso: 600 });
    texto(c, "pronto para lançar", cx, cy + 230, { tam: 40, peso: 600, cor: CLAUDE.oliva, alpha: fase(t, 2.4, 2.8) * (1 - fase(t, 4.4, 4.9)) });
  },
});

semente({
  id: "inclinacao-antes-depois", nome: "Inclinação antes e depois", grupo: "dados", formato: "16:9",
  resumo: "Duas colunas de valores ligadas por linhas: quem subiu, quem caiu. Mudança de cenário num olhar.",
  receita: `Gráfico 16:9 de inclinação (slope chart): dois momentos, várias categorias.
Estrutura: coluna "antes" à esquerda e "depois" à direita, cada categoria um ponto nos dois lados ligado por linha; as linhas se desenham da esquerda para a direita; as que subiram em cor de acento, as que caíram em cinza.
Visual: fundo claro, rótulos nas pontas com valor, linhas grossas com pontas redondas.
Movimento: linhas uma a uma, ponto final com pop, destaque da maior virada com uma nota.
Use para: mudanças de comportamento, antes/depois de uma decisão, ranking que virou.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#f7f4ee", { grao: 0.06, vinheta: 0.1 });
    const xa = 560, xb = 1360, y = (v) => 900 - v * 7, cats = [["Vídeo curto", 30, 95], ["Blog", 80, 40], ["Podcast", 50, 60], ["Newsletter", 65, 70], ["Live", 38, 25]];
    texto(c, "2020", xa, 120, { tam: 50, fonte: SERIF, peso: 600 }); texto(c, "2026", xb, 120, { tam: 50, fonte: SERIF, peso: 600 });
    c.strokeStyle = "rgba(61,57,41,.15)"; c.lineWidth = 3; [xa, xb].forEach((x) => { c.beginPath(); c.moveTo(x, 160); c.lineTo(x, 920); c.stroke(); });
    cats.forEach(([n, a, b], i) => {
      const sobe = b > a, cor = sobe ? CLAUDE.terracota : "#a8a396", k = fase(t, 0.3 + i * 0.35, 0.8 + i * 0.35), v = 1 - fase(t, 4.6, 4.95);
      c.save(); c.globalAlpha = v; c.strokeStyle = cor; c.lineWidth = sobe ? 9 : 5; c.lineCap = "round";
      c.beginPath(); c.moveTo(xa, y(a)); c.lineTo(lerp(xa, xb, k), lerp(y(a), y(b), k)); c.stroke();
      c.fillStyle = cor; c.beginPath(); c.arc(xa, y(a), 12, 0, 7); c.fill();
      texto(c, `${n} ${a}`, xa - 30, y(a), { tam: 32, peso: 600, alinha: "right", cor: sobe ? CLAUDE.argila : "#6f6a5c" });
      if (k >= 1) { c.beginPath(); c.arc(xb, y(b), 12 * entra(t, 0.8 + i * 0.35, 0.3), 0, 7); c.fill(); texto(c, `${b} ${n}`, xb + 30, y(b), { tam: 32, peso: 600, alinha: "left", cor: sobe ? CLAUDE.argila : "#6f6a5c" }); }
      c.restore();
    });
  },
});

semente({
  id: "dispersao-grupos", nome: "Dispersão em grupos", grupo: "dados", formato: "16:9",
  resumo: "Pontos caem espalhados, depois migram e formam grupos com nome. Mostra padrão escondido nos dados.",
  receita: `Gráfico 16:9 de dispersão que revela agrupamentos.
Estrutura: dezenas de pontos caem e ficam espalhados (o caos); depois cada um migra para o seu grupo; os grupos ganham uma mancha de fundo, contorno e nome.
Visual: fundo escuro azul, pontos em 3 cores suaves, manchas translúcidas desfocadas, eixos discretos.
Movimento: queda com dispersão, pausa, migração com caminhos curvos e velocidades levemente diferentes.
Use para: segmentação de público, "existem 3 tipos de criador", análise de dados.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#162030", { grao: 0.18, vinheta: 0.4 });
    const grupos = [[560, 420, CLAUDE.terracota, "os que testam"], [1300, 360, "#7fb3d5", "os que planejam"], [960, 760, "#a6c48a", "os que desistem"]];
    const m = sai(fase(t, 1.4, 2.8)) * (1 - fase(t, 4.3, 4.95)), r = rng(5);
    grupos.forEach(([gx, gy, cor, n]) => { const g = c.createRadialGradient(gx, gy, 0, gx, gy, 240); g.addColorStop(0, cor + "55"); g.addColorStop(1, cor + "00"); c.globalAlpha = m; c.fillStyle = g; c.beginPath(); c.arc(gx, gy, 240, 0, 7); c.fill();
      texto(c, n, gx, gy - 200, { tam: 36, peso: 700, cor }); c.globalAlpha = 1; });
    for (let i = 0; i < 120; i++) {
      const [gx, gy, cor] = grupos[i % 3], sx = 200 + r() * (W - 400), sy = 160 + r() * (H - 320), ang = r() * 7, d = r() * 150;
      const tx = gx + Math.cos(ang) * d, ty = gy + Math.sin(ang) * d * 0.8, q = clamp(m * 1.1 - r() * 0.1);
      const queda = sai(fase(t, (i / 120) * 0.8, (i / 120) * 0.8 + 0.4));
      const x = lerp(sx, tx, q) + Math.sin(q * Math.PI) * 60, y = lerp(sy, ty, q) - (1 - queda) * 300;
      c.globalAlpha = queda; c.fillStyle = m > 0.2 ? cor : "#d8dde4"; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill();
    }
    c.globalAlpha = 1;
  },
});
