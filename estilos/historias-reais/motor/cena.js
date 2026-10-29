// Histórias Reais: um vídeo real recontado em desenho. Mesma cadeira, mesmo muro, mesmas pessoas, a mesma voz delas;
// o desenho é de livro infantil (lápis de cor, cabeça grande), para uma criança de 5 anos sentir o que o adulto sentiu.
// tempo.json (montar.py): segs = falas {quem, t0, t1, palavras, boca, plano, inserto}, cenas sem fala e o final narrado.

const ASSENTO = [540, 1310]; // onde fica o meio do assento no plano geral
const CHAO = 1170;           // pé do muro
let SEGS, FPS, FUNDO = {};

// ---------- cenários (pintados uma vez, em 2x, para a câmera poder chegar perto) ----------
function cenario(nome, borrado) {
  const k = 2, g = tela(W * k, H * k), c = g.getContext("2d"), R = rng(nome === "muro" ? 3 : 4);
  c.scale(k, k);
  chao(c, R);
  if (nome === "muro") muro(c, R); else pano(c, R);
  c.globalCompositeOperation = "multiply"; c.globalAlpha = 0.5;
  c.drawImage(MANCHA, 0, 0, W, H);
  c.globalCompositeOperation = "source-over"; c.globalAlpha = 1;
  if (!borrado) return g;
  const b = tela(W * k, H * k), bc = b.getContext("2d");
  bc.filter = `blur(${borrado * k}px)`; bc.drawImage(g, 0, 0);
  return b;
}
function chao(c, R) {
  const g = c.createLinearGradient(0, CHAO, 0, H);
  g.addColorStop(0, "#c89a66"); g.addColorStop(1, "#b9804c");
  c.fillStyle = g; c.fillRect(0, CHAO - 20, W, H);
  c.fillStyle = LAPIS; c.fillRect(0, CHAO - 20, W, H);
  for (let i = 0; i < 70; i++) { // manchas e pedrinhas da terra
    const x = R() * W, y = CHAO + R() * (H - CHAO), r = 20 + R() * 90;
    c.globalAlpha = 0.12; c.fillStyle = R() < 0.5 ? "#8a5a32" : "#e2bf8c";
    c.beginPath(); c.ellipse(x, y, r, r * 0.3, 0, 0, 7); c.fill();
  }
  c.globalAlpha = 1;
  for (let i = 0; i < 160; i++) {
    const x = R() * W, y = CHAO + 10 + R() * (H - CHAO), r = 2 + R() * 5;
    c.fillStyle = R() < 0.5 ? "#7a5236" : "#ead1a8"; c.beginPath(); c.ellipse(x, y, r, r * 0.6, 0, 0, 7); c.fill();
  }
}
function muro(c, R) {
  // céu e árvore no alto à direita: o muro desce em diagonal
  c.fillStyle = "#e8e0c8"; c.fillRect(0, 0, W, 300);
  forma(c, [[880, 0], [1100, 0], [1100, 230], [1010, 200], [940, 120], [900, 60]], "#3f5a32", R, { linha: 2.4 });
  const topo = (x) => 30 + x * 0.12;
  c.save();
  c.beginPath(); c.moveTo(0, topo(0)); c.lineTo(W, topo(W)); c.lineTo(W, CHAO); c.lineTo(0, CHAO); c.closePath(); c.clip();
  c.fillStyle = "#d8b79a"; c.fillRect(0, 0, W, CHAO);
  const cores = ["#c56a45", "#b65b39", "#cf7a52", "#a9512f", "#c9714a", "#bb6340"];
  for (let y = 0, l = 0; y < CHAO; y += 46, l++) {
    for (let x = -((l % 2) * 56); x < W; x += 112) {
      c.fillStyle = cores[Math.floor(R() * cores.length)];
      c.beginPath(); c.roundRect(x + 3 + (R() - 0.5) * 3, y + 3, 105, 40, 3); c.fill();
      if (R() < 0.35) { c.fillStyle = "rgba(60,25,10,0.35)"; c.fillRect(x + 10 + R() * 70, y + 12, 14, 14); } // furos do tijolo
    }
  }
  c.fillStyle = LAPIS; c.fillRect(0, 0, W, CHAO);
  c.restore();
  risco(c, [[0, topo(0)], [W, topo(W)]], R, 3);
  // coluna de concreto com mofo, à esquerda, e a porta escura
  forma(c, [[-10, 120], [52, 120], [52, CHAO + 6], [-10, CHAO + 6]], "#2b241f", R);
  forma(c, [[52, 60], [210, 70], [214, CHAO + 8], [48, CHAO + 8]], "#a19a8b", R, {
    dentro: () => { c.fillStyle = "rgba(45,42,32,0.6)"; for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(130 + Math.sin(i) * 20, 320 + i * 60, 26 - i, 70, 0.1, 0, 7); c.fill(); } },
  });
  // poste de madeira
  forma(c, [[588, -20], [612, -20], [616, 1060], [592, 1060]], "#6d5c4a", R);
  // sofá velho com pano de franja, atrás à direita
  forma(c, [[640, 980], [1100, 960], [1100, CHAO + 4], [640, CHAO + 4]], "#7b7166", R);
  forma(c, [[660, 1040], [1100, 1030], [1100, 1100], [660, 1110]], "#8a8074", R);
  forma(c, [[700, 1070], [1000, 1062], [990, 1130], [710, 1136]], "#cdb57c", R, { dentro: () => { c.strokeStyle = "#8a7448"; c.lineWidth = 2; for (let x = 710; x < 1000; x += 12) { c.beginPath(); c.moveTo(x, 1128); c.lineTo(x + 2, 1146); c.stroke(); } } });
  // sombra na base do muro
  const s = c.createLinearGradient(0, CHAO - 30, 0, CHAO + 40);
  s.addColorStop(0, "rgba(60,30,15,0)"); s.addColorStop(0.5, "rgba(60,30,15,0.35)"); s.addColorStop(1, "rgba(60,30,15,0)");
  c.fillStyle = s; c.fillRect(0, CHAO - 30, W, 70);
}
function pano(c, R) {
  c.fillStyle = "#1c1a1b"; c.fillRect(0, 0, W, CHAO + 40);
  for (let i = 0; i < 26; i++) { // dobras do pano preto
    const x = i * 44 + (R() - 0.5) * 20;
    c.strokeStyle = R() < 0.5 ? "rgba(70,64,62,0.55)" : "rgba(0,0,0,0.6)"; c.lineWidth = 6 + R() * 10;
    c.beginPath(); c.moveTo(x, 0); c.bezierCurveTo(x + 14, 400, x - 14, 800, x + 6, CHAO + 40); c.stroke();
  }
  c.fillStyle = LAPIS; c.fillRect(0, 0, W, CHAO + 40);
}

// ---------- câmera ----------
const PLANOS = { geral: [1.38, 540, 1090], medio: [1.55, 540, 1110], close: [2.35, 540, 905] };
function camera(seg, t) {
  const [z0, fx, fy] = PLANOS[seg.plano] || PLANOS.geral;
  const k = (t - seg.t0) / Math.max(0.5, seg.t1 - seg.t0);
  let z = z0 * (1 + 0.035 * Math.min(1.2, Math.max(0, k))); // aproxima devagar enquanto a pessoa fala
  if (seg.musica === "chega") z *= 0.93 + 0.07 * ease((t - seg.t0) / 0.18); // o "chega" chega num tranco
  return { z, fx, fy };
}
function aplicar(c, cam) { c.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.fx * cam.z, H / 2 - cam.fy * cam.z); }
function fundo(c, nome, cam) {
  const nitido = FUNDO[nome], borrado = FUNDO[nome + "-b"];
  const b = Math.min(1, Math.max(0, (cam.z - 1) / 1.2)); // profundidade de campo: quanto mais perto, mais o muro desfoca
  aplicar(c, cam);
  c.drawImage(nitido, 0, 0, W, H);
  if (b > 0) { c.globalAlpha = b; c.drawImage(borrado, 0, 0, W, H); c.globalAlpha = 1; }
}

// ---------- a pessoa na cadeira ----------
function estadoFala(seg, t) {
  const f = Math.floor((t - seg.t0) * FPS), falando = t >= seg.t0 && t < seg.t1;
  const bo = falando ? (seg.boca[Math.min(seg.boca.length - 1, Math.max(0, f))] || 0) : 0;
  const sd = [...seg.quem].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const fase = (t + sd * 0.37) % 3.7; // piscar a cada ~3,7 s, cada um no seu ritmo
  return {
    boca: bo, olho: fase < 0.12 ? Math.abs(fase - 0.06) / 0.06 : 1,
    triste: seg.musica === "doi" ? 1 : seg.inserto === "calendario" || seg.inserto === "remedio" ? 0.5 : 0.15,
    firme: seg.musica === "chega" || seg.musica === "ergue" ? 1 : 0,
    lagrima: seg.lagrima ? Math.min(1, (t - seg.t0) / (seg.t1 - seg.t0 + 0.4)) : -1,
    fala: Math.sin(t * 5.3 + sd) * bo, resp: Math.sin(t * 2.2 + sd),
  };
}
function sentado(c, quem, s, t, cam) {
  const R = rng(Math.floor(t * 12) * 7919 + (quem || "").length * 31);
  c.save(); aplicar(c, cam); c.translate(...ASSENTO);
  c.save(); c.globalAlpha = 0.28; c.fillStyle = "#4a2a14"; c.beginPath(); c.ellipse(0, 330, 210, 34, 0, 0, 7); c.fill(); c.restore();
  cadeira(c, R);
  if (quem) pessoa(c, PESSOAS[quem], s, R);
  c.restore();
}

// ---------- legenda: palavra por palavra, manuscrita, em blocos curtos como no vídeo ----------
function blocos(palavras) {
  const out = []; let cur = [];
  for (const w of palavras) {
    cur.push(w);
    if (cur.map((x) => x[2]).join(" ").length > 16 || /[.,?!]$/.test(w[2])) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  return out;
}
function legenda(c, seg, t) {
  if (!seg.palavras || !seg.palavras.length || t > seg.t1 + 0.25) return;
  const bl = blocos(seg.palavras), atual = bl.filter((b) => b[0][0] - 0.05 <= t).pop();
  if (!atual) return;
  const vis = atual.filter((w) => w[0] - 0.05 <= t).map((w) => w[2]).join(" ");
  texto(c, vis, W / 2, H * 0.79, 84);
}
function texto(c, s, x, y, tam, alpha = 1, larg = W - 140) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = alpha;
  c.font = `${tam}px "Patrick Hand"`; c.textAlign = "center"; c.textBaseline = "middle"; c.lineJoin = "round";
  const linhas = [];
  for (const par of s.split("\n")) {
    let l = "";
    for (const w of par.split(" ")) { if (c.measureText(l + " " + w).width > larg && l) { linhas.push(l); l = w; } else l = l ? l + " " + w : w; }
    linhas.push(l);
  }
  linhas.forEach((ln, i) => {
    const yy = y + (i - (linhas.length - 1) / 2) * tam * 1.08;
    c.strokeStyle = "rgba(40,20,10,0.85)"; c.lineWidth = tam * 0.16; c.strokeText(ln, x, yy);
    c.fillStyle = "#fffaf0"; c.fillText(ln, x, yy);
  });
  c.restore();
}

// ---------- insertos ----------
function calendario(c, seg, t, cam) { // na parede: a folhinha do ano vai caindo a cada "envelheci"
  const ordem = SEGS.filter((s) => s.inserto === "calendario"), i = ordem.indexOf(seg);
  const anos = [2006, 2014, 2022, 2026], ano = anos[Math.min(i, anos.length - 1)];
  const R = rng(Math.floor(t * 12) * 13 + 5);
  c.save(); aplicar(c, cam); c.translate(830, 560); c.rotate(0.04);
  forma(c, [[-80, -110], [80, -110], [80, 110], [-80, 110]], "#f4ecd8", R);
  forma(c, [[-80, -110], [80, -110], [80, -60], [-80, -60]], "#c8453a", R, { linha: 2.4 });
  c.font = `64px "Patrick Hand"`; c.textAlign = "center"; c.fillStyle = "#3a2216"; c.fillText(String(ano), 0, 40);
  const k = (t - seg.t0) / 0.5; // a folha anterior cai
  if (i > 0 && k < 1) {
    c.save(); c.translate(-60 + k * 40, k * k * 420); c.rotate(k * 1.2); c.globalAlpha = 1 - k;
    forma(c, [[-20, -110], [140, -110], [140, 110], [-20, 110]], "#f4ecd8", R);
    c.fillStyle = "#3a2216"; c.fillText(String(anos[i - 1]), 60, 40); c.restore();
  }
  c.restore();
}
function remedio(c, seg, t, cam) { // um balão: o vidro de remédio e as moedas que não dão
  const k = seg0(t, seg.t0 + 0.2, seg.t0 + 0.8), R = rng(Math.floor(t * 12) * 17 + 3);
  if (k <= 0) return;
  c.save(); aplicar(c, cam); c.translate(735, 770); c.scale(k * 0.78, k * 0.78);
  forma(c, elip(0, 0, 150, 120, 20), "#fffaf0", R);
  for (const [x, y, r] of [[-120, 120, 18], [-150, 160, 10]]) forma(c, elip(x, y, r, r, 10), "#fffaf0", R, { linha: 2.4 });
  forma(c, [[-80, -60], [-20, -60], [-16, 60], [-84, 60]], "#d98a3a", R); // vidro
  forma(c, [[-86, -84], [-14, -84], [-14, -60], [-86, -60]], "#f4f0e8", R, { linha: 2.4 });
  forma(c, [[-74, -20], [-26, -20], [-26, 20], [-74, 20]], "#fffaf0", R, { linha: 1.6 });
  const fim = seg.t1 - 0.6, n = Math.max(1, Math.round(lerp(5, 1, seg0(t, seg.t0 + 1.4, fim)))); // as moedas acabam
  for (let i = 0; i < n; i++) forma(c, elip(60, 50 - i * 18, 40, 12, 14), "#e6c04a", R, { linha: 2.2 });
  c.restore();
}
const seg0 = (t, a, b) => ease((t - a) / (b - a));
function estrada(c, seg, t) { // o filho partindo: a mãe de costas acena, ele some na estrada
  const ini = seg.inserto_em ?? seg.t0, fim = seg.t1 + 0.35;
  if (t < ini - 0.25 || t > fim + 0.25) return;
  const a = Math.min(seg0(t, ini - 0.25, ini), 1 - seg0(t, fim, fim + 0.25));
  const k = (t - ini) / (fim - ini + 0.5), R = rng(Math.floor(t * 12) * 23 + 9);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a;
  const ceu = c.createLinearGradient(0, 0, 0, 900);
  ceu.addColorStop(0, "#c9607a"); ceu.addColorStop(0.55, "#e9805a"); ceu.addColorStop(1, "#f5c27a");
  c.fillStyle = ceu; c.fillRect(0, 0, W, 920);
  c.fillStyle = "#fbe3a4"; c.beginPath(); c.arc(700, 900, 120, Math.PI, 0); c.fill();
  c.fillStyle = "#c08a55"; c.fillRect(0, 900, W, H);
  c.fillStyle = LAPIS; c.fillRect(0, 0, W, H);
  forma(c, [[548, 904], [572, 904], [900, H + 10], [180, H + 10]], "#ddb487", R, { linha: 2.4 });
  for (const [x, h] of [[120, 260], [930, 200], [300, 120], [820, 90]]) { // mandacarus
    forma(c, [[x - 18, 930 - h], [x + 18, 930 - h], [x + 18, 930], [x - 18, 930]], "#4f6b3a", R, { linha: 2.4 });
    forma(c, [[x + 18, 930 - h * 0.55], [x + 54, 930 - h * 0.55], [x + 54, 930 - h * 0.85], [x + 36, 930 - h * 0.85], [x + 36, 930 - h * 0.45], [x + 18, 930 - h * 0.45]], "#4f6b3a", R, { linha: 2.4 });
  }
  // o filho, de costas, com a mochila, ficando pequeno
  const d = ease(Math.min(1, k * 1.15)), fy = lerp(1500, 960, d), fs = lerp(1.0, 0.16, d);
  c.save(); c.translate(560, fy); c.scale(fs, fs);
  const passo = Math.sin(t * 9) * 14;
  tubo(c, [[-18, 0], [-18 + passo, 120]], 26, "#3a4a66", R); tubo(c, [[18, 0], [18 - passo, 120]], 26, "#3a4a66", R);
  forma(c, [[-52, -170], [52, -170], [46, 10], [-46, 10]], "#4f78a8", R);
  forma(c, [[-40, -150], [40, -150], [36, -30], [-36, -30]], "#7a5236", R);
  forma(c, elip(0, -220, 46, 50, 16), "#2a1a12", R);
  c.restore();
  // a mãe de costas, perto da lente, acenando
  c.save(); c.translate(250, 1720);
  const ac = Math.sin(t * 4.5) * 0.22;
  forma(c, [[-260, 0], [-200, -230], [200, -230], [260, 0], [300, 260], [-300, 260]], "#f1b53a", R);
  for (const [x, y] of [[-110, -330], [-60, -390], [0, -410], [60, -392], [110, -340], [-90, -270], [90, -272], [0, -330], [-40, -260], [40, -262]]) forma(c, elip(x, y, 62, 56, 12), "#efebe3", R, { cor: "#a59c8e" });
  c.save(); c.translate(190, -210); c.rotate(0.35 + ac); // o braço levantado, acenando
  tubo(c, [[0, 0], [60, -190], [70, -360]], 64, "#cb9272", R); tubo(c, [[0, 0], [40, -110]], 92, "#f1b53a", R);
  forma(c, elip(72, -392, 40, 50, 14), "#cb9272", R);
  for (const d of [-24, -8, 8, 24]) tubo(c, [[72 + d, -420], [72 + d * 1.3, -462]], 16, "#cb9272", R);
  c.restore();
  c.restore();
  c.restore();
}

// ---------- o final: a cadeira vazia, frases e desenhos de giz no muro ----------
function giz(c, pts, k, R, larg = 7, fechado = false) {
  if (k <= 0) return;
  c.save(); c.lineCap = c.lineJoin = "round";
  for (let i = 0; i < 3; i++) {
    c.strokeStyle = `rgba(252,248,238,${i ? 0.35 : 0.8})`; c.lineWidth = larg * (i ? 0.6 : 1);
    tracar(c, mexe(pts, 3, R), k, fechado);
  }
  c.restore();
}
function desenhosGiz(c, fin, t, cam) {
  const R = rng(Math.floor(t * 12) * 41 + 2), q = (il) => fin.frases.find((f) => f.ilustra === il);
  c.save(); aplicar(c, cam);
  const fe = q("esgoto"), fa = q("torneira"), fc = q("cidades");
  if (fe) { const k = seg0(t, fe.t0, fe.t0 + 1.4); c.save(); c.translate(860, 930); // o balde
    giz(c, [[-60, -60], [60, -60], [44, 70], [-44, 70]], k, R, 7, true); giz(c, [[-60, -60], [0, -130], [60, -60]], seg0(t, fe.t0 + 0.6, fe.t0 + 1.6), R); c.restore(); }
  if (fa) { const k = seg0(t, fa.t0, fa.t0 + 1.2); c.save(); c.translate(300, 860); // a torneira seca e a única gota
    giz(c, [[-70, 0], [40, 0], [40, 50], [70, 50], [70, 90]], k, R); giz(c, [[-30, 0], [-30, -40], [-60, -40], [0, -40]], k, R);
    const g = (t - fa.t0 - 1.2) % 1.6; if (g > 0) giz(c, elip(70, 110 + g * g * 120, 7, 11, 8), 1, R, 5, true); c.restore(); }
  if (fc) for (let i = 0; i < 10; i++) { // as dez cidades, casinha por casinha
    const k = seg0(t, fc.t0 + i * 0.28, fc.t0 + i * 0.28 + 0.5), x = 110 + i * 96, y = 1060;
    giz(c, [[x - 30, y], [x - 30, y - 50], [x, y - 80], [x + 30, y - 50], [x + 30, y], [x - 30, y]], k, R, 5);
  }
  c.restore();
}
function final(c, fin, t) {
  const cam = { z: 1 + 0.06 * Math.min(1, (t - fin.t0) / (fin.t1 - fin.t0)), fx: 540, fy: 960 };
  fundo(c, "muro", cam); sentado(c, null, null, t, cam); desenhosGiz(c, fin, t, cam);
  const fr = fin.frases.filter((f) => f.t0 - 0.15 <= t).pop();
  const an = fin.frases.find((f) => f.ilustra === "anos");
  if (an && t > an.t0 && t < an.t1 + 0.4) { // vinte anos passando no muro, em giz
    const ano = Math.round(lerp(2002, 2026, seg0(t, an.t0 + 0.3, an.t1 - 0.4)));
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = Math.min(1, (an.t1 + 0.4 - t) / 0.4);
    c.font = `230px "Patrick Hand"`; c.textAlign = "center"; c.fillStyle = "rgba(252,248,238,0.85)"; c.fillText(String(ano), W / 2, 820);
    c.restore();
  }
  const esc = fin.frases.find((f) => f.escuro);
  const e = esc ? seg0(t, esc.t0 - 0.9, esc.t0 + 0.2) : 0;
  if (e > 0) { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(18,11,8,${0.9 * e})`; c.fillRect(0, 0, W, H); }
  if (fr) {
    const k = seg0(t, fr.t0 - 0.15, fr.t0 + 0.25);
    const y = fr.escuro ? H * 0.47 : H * 0.2;
    if (fr.escuro) { // as duas últimas ficam juntas na tela escura
      const es = fin.frases.filter((f) => f.escuro && f.t0 - 0.15 <= t);
      es.forEach((f, i) => texto(c, f.texto.replace(", ", ",\n"), W / 2, H * 0.42 + i * 210, 82, seg0(t, f.t0 - 0.15, f.t0 + 0.3)));
    } else texto(c, fr.texto, W / 2, y, 78, k);
  }
  if (fin.aviso && e > 0.5) texto(c, fin.aviso, W / 2, H - 70, 30, 0.55 * e);
}

// ---------- abertura: o pano preto cai e revela o muro ----------
function cortina(c, seg, t) {
  const k = seg0(t, seg.t0, seg.t1 - 0.2), cam = { z: 1, fx: 540, fy: 960 };
  fundo(c, "muro", cam);
  c.save(); aplicar(c, cam); c.beginPath();
  c.moveTo(0, 0); c.lineTo(W, 0); c.lineTo(W, lerp(CHAO + 40, 0, k) + 30 * Math.sin(k * 6)); c.lineTo(0, lerp(CHAO + 40, 0, k)); c.closePath();
  c.clip(); c.translate(0, -k * (CHAO + 40)); c.drawImage(FUNDO.pano, 0, 0, W, H); c.restore();
  sentado(c, null, null, t, cam);
  const n = seg.textos.length, d = (seg.t1 - seg.t0) / n;
  seg.textos.forEach((s, i) => { const a = seg0(t, seg.t0 + i * d, seg.t0 + i * d + 0.15) * (i === n - 1 ? 1 : 1 - seg0(t, seg.t0 + (i + 1) * d, seg.t0 + (i + 1) * d + 0.1)); if (a > 0) texto(c, s, W / 2, H * 0.16, 80, a); });
}

// ---------- contrato ----------
async function iniciar(tempo) {
  TEMPO = tempo; FPS = tempo.fps; SEGS = tempo.segs;
  [W, H] = TAM[tempo.formato];
  const cv = document.getElementById("c"); cv.width = W; cv.height = H; ctx = cv.getContext("2d");
  await document.fonts.load('80px "Patrick Hand"');
  LAPIS = fazerLapis(); GRAO = fazerGrao(); MANCHA = fazerMancha();
  for (const n of ["muro", "pano"]) { FUNDO[n] = cenario(n, 0); FUNDO[n + "-b"] = cenario(n, 7); }
}
function quadro(t) {
  const c = ctx;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = "#000"; c.fillRect(0, 0, W, H);
  // o corte vem 2 quadros antes da fala, como na edição original
  const seg = SEGS.filter((s) => s.t0 - 0.07 <= t).pop() || SEGS[0];
  if (seg.tipo === "fala") {
    const cam = camera(seg, t);
    fundo(c, seg.fundo, cam);
    if (seg.inserto === "calendario") calendario(c, seg, t, cam);
    sentado(c, seg.quem, estadoFala(seg, t), t, cam);
    if (seg.inserto === "remedio") remedio(c, seg, t, cam);
    if (seg.inserto === "estrada") estrada(c, seg, t);
    legenda(c, seg, t);
  } else if (seg.tipo === "cortina") cortina(c, seg, t);
  else if (seg.tipo === "final") final(c, seg, t);
  c.setTransform(1, 0, 0, 1, 0, 0);
  papel(t);
}
