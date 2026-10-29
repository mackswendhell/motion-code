// Excel Desenhado: uma planilha inteira desenhada à mão (papel com aguada, grade torta, letra de mão, aquarela),
// usada como palco de motion graphics: o cursor clica, digita fórmula, arrasta, cria e redimensiona gráficos, rabisca.
// O roteiro é uma lista de ações; a direção (câmera, caminho do cursor, sons) sai delas sozinha.
// Carregado depois de nucleo/2d/base.js. iniciar(tempo) uma vez (assíncrona: fonte), quadro(t) por quadro, eventos() para o som.

const COR = {
  papel: "#efede4", tinta: "#3b3a36", apagada: "#8f8b80", azul: "#4a69b0", vermelho: "#b5483f", verde: "#5b8a66", ocre: "#b88a3e",
  grade: "rgba(105,135,190,0.40)", gradeForte: "rgba(105,135,190,0.62)", cab: "#dfd0b4", cabVerde: "#cfdcc9", selec: "#4f73c4",
};
const G = { x0: 110, y0: 330, lh: 58, colA: 250, col: 150, ncol: 13, nlin: 13 }; // a grade, em pixels do mundo
const MUNDO = { w: 2500, h: 1350 }; // folha maior que o quadro: o plano geral precisa caber
let R, ACOES, CAM = [], CUR = [], PAPEL, GRANULO;

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const fase = (t, a, b) => ease(clamp((t - a) / (b - a)));
const suave3 = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2); // começa e para devagar
const letra = (i) => String.fromCharCode(65 + i);
const colX = (i) => (i === 0 ? G.x0 : G.x0 + G.colA + (i - 1) * G.col);
const colW = (i) => (i === 0 ? G.colA : G.col);
function cel(ref) { // "E2" -> retângulo no mundo
  const c = ref.charCodeAt(0) - 65, l = parseInt(ref.slice(1), 10);
  return { x: colX(c), y: G.y0 + (l - 1) * G.lh, w: colW(c), h: G.lh, c, l };
}
function faixa(a, b) { const p = cel(a), q = cel(b); return { x: p.x, y: p.y, w: q.x + q.w - p.x, h: q.y + q.h - p.y }; }
const centro = (r) => [r.x + r.w / 2, r.y + r.h / 2];
const inflar = (r, m) => ({ x: r.x - m, y: r.y - m, w: r.w + 2 * m, h: r.h + 2 * m });
const uniao = (a, b) => { const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y); return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }; };
const BOTOES = { grafico: { x: 1010, y: 168, w: 140, h: 50 }, rabiscos: { x: 1170, y: 168, w: 160, h: 50 } };

// ---------- traço de mão: linhas levemente tortas, sempre as mesmas (sem tremer entre quadros) ----------
function torta(c, x0, y0, x1, y1, seed, amp = 1.0, k = 1) {
  const r = rng(seed), n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 36)), f1 = r() * 6, f2 = r() * 6;
  const nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny) || 1;
  c.beginPath();
  for (let i = 0; i <= n * k; i++) {
    const q = i / n, d = amp * (Math.sin(q * 5.1 + f1) * 0.7 + Math.sin(q * 13.7 + f2) * 0.3);
    const x = lerp(x0, x1, q) + (nx / l) * d, y = lerp(y0, y1, q) + (ny / l) * d;
    i ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.stroke();
}
function retTorto(c, r, seed, amp = 1) {
  torta(c, r.x, r.y, r.x + r.w, r.y, seed, amp); torta(c, r.x + r.w, r.y, r.x + r.w, r.y + r.h, seed + 1, amp);
  torta(c, r.x + r.w, r.y + r.h, r.x, r.y + r.h, seed + 2, amp); torta(c, r.x, r.y + r.h, r.x, r.y, seed + 3, amp);
}
function aguada(c, r, cor, alpha = 0.55, seed = 1) { // mancha de aquarela: cor transparente, borda mais escura, granulação
  const g = rng(seed), d = () => (g() - 0.5) * 3;
  const pts = [[r.x + d(), r.y + d()], [r.x + r.w + d(), r.y + d()], [r.x + r.w + d(), r.y + r.h + d()], [r.x + d(), r.y + r.h + d()]];
  const forma = () => { c.beginPath(); tremido(pts, 0.8, rng(seed + 7), Math.max(4, Math.round((r.w + r.h) / 30))).forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); };
  c.save();
  forma(); c.globalAlpha = alpha; c.fillStyle = cor; c.fill();
  c.clip();
  c.globalAlpha = alpha * 0.55; c.globalCompositeOperation = "multiply";
  const p = c.createPattern(GRANULO, "repeat"); p.setTransform(new DOMMatrix().translate(g() * 300, g() * 300)); c.fillStyle = p; c.fillRect(r.x, r.y, r.w, r.h);
  c.globalCompositeOperation = "source-over"; c.globalAlpha = alpha * 0.5; c.strokeStyle = cor; c.lineWidth = 3.5; forma(); c.stroke();
  c.restore();
}
function texto(c, s, x, y, tam, cor, al = "left", alpha = 1) {
  c.save(); c.font = `${tam}px "Patrick Hand"`; c.fillStyle = cor; c.textAlign = al; c.textBaseline = "middle"; c.globalAlpha *= alpha;
  c.fillText(s, x, y); c.restore();
}
function pincel(c, pts, k, cor, larg) { // pincelada de rabisco: mais grossa no meio, transparente como aquarela
  const n = Math.max(2, Math.floor(pts.length * k));
  c.save(); c.strokeStyle = cor; c.lineCap = "round"; c.globalAlpha = 0.85;
  for (let i = 1; i < n; i++) {
    const q = i / pts.length; c.lineWidth = larg * (0.45 + 0.55 * Math.sin(Math.PI * Math.min(1, q * 1.1)));
    c.beginPath(); c.moveTo(...pts[i - 1]); c.lineTo(...pts[i]); c.stroke();
  }
  c.restore();
}

// ---------- texturas, uma vez ----------
function fazerPapel() { // ladrilho do papel: creme com manchas de aguada e grão, que anda com a câmera
  const n = 640, t = tela(n, n), c = t.getContext("2d"), r = rng(4);
  c.fillStyle = COR.papel; c.fillRect(0, 0, n, n);
  for (let i = 0; i < 70; i++) {
    const x = r() * n, y = r() * n, rr = 40 + r() * 180, g = c.createRadialGradient(x, y, 0, x, y, rr), tom = r() < 0.5 ? "120,100,60" : "255,255,245";
    g.addColorStop(0, `rgba(${tom},${0.008 + r() * 0.014})`); g.addColorStop(1, `rgba(${tom},0)`);
    for (const dx of [-n, 0, n]) for (const dy of [-n, 0, n]) { c.save(); c.translate(dx, dy); c.fillStyle = g; c.fillRect(x - rr, y - rr, rr * 2, rr * 2); c.restore(); }
  }
  const img = c.getImageData(0, 0, n, n);
  for (let i = 0; i < img.data.length; i += 4) { const v = (r() - 0.5) * 9; img.data[i] += v; img.data[i + 1] += v; img.data[i + 2] += v; }
  c.putImageData(img, 0, 0);
  return t;
}
function fazerGranulo() { // granulação da aquarela, usada em multiply dentro das manchas
  const n = 300, t = tela(n, n), c = t.getContext("2d"), r = rng(9);
  c.fillStyle = "#fff"; c.fillRect(0, 0, n, n);
  for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(90,80,70,${r() * 0.18})`; c.beginPath(); c.arc(r() * n, r() * n, 0.6 + r() * 2.2, 0, Math.PI * 2); c.fill(); }
  for (let i = 0; i < 26; i++) { const x = r() * n, y = r() * n, rr = 20 + r() * 60, g = c.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, "rgba(80,70,60,0.10)"); g.addColorStop(1, "rgba(80,70,60,0)"); c.fillStyle = g; c.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
  return t;
}

// ---------- o estado da planilha no instante t (recalculado a cada quadro: nada acumula) ----------
function estado(t) {
  const cels = {}, graficos = {}, rabiscos = [];
  for (const [ref, v] of Object.entries(R.planilha.celulas)) cels[ref] = { txt: v, cor: R.planilha.cores?.[ref] || "tinta", desde: -1 };
  let edicao = null, selecao = null, barra = "";
  for (const a of ACOES) {
    if (t < a.em) continue;
    const k = clamp((t - a.em) / (a.dura || 1e-6));
    if (a.tipo === "clicar" && a.cel) { selecao = { r: cel(a.cel) }; barra = cels[a.cel]?.txt || ""; }
    if (a.tipo === "digitar") {
      const n = Math.floor(k * a.texto.length + 1e-6);
      if (k < 1) { edicao = { r: cel(a.cel), txt: a.texto.slice(0, n) }; barra = a.texto.slice(0, n); selecao = { r: cel(a.cel) }; }
      else { cels[a.cel] = { txt: a.resultado, cor: a.cor || "tinta", desde: a.em + a.dura }; edicao = null; barra = a.texto; }
    }
    if (a.tipo === "preencher" || a.tipo === "selecionar") {
      const ini = cel(a.de), fim = cel(a.ate), linhas = fim.l - ini.l, ate = Math.round(k * linhas);
      const r = faixa(a.de, `${a.ate[0]}${ini.l + ate}`);
      selecao = { r, arrasto: k < 1, faixa: a.tipo === "selecionar" };
      if (a.tipo === "preencher") (a.valores || []).forEach((v, i) => { if (i && i <= ate) cels[`${a.de[0]}${ini.l + i}`] = { txt: v, cor: a.cor || "tinta", desde: a.em + (a.dura * i) / linhas }; });
    }
    if (a.tipo === "grafico") graficos[a.id] = { ...a, area: a.area, desde: a.em };
    if (a.tipo === "redimensionar" && graficos[a.id]) {
      const g = graficos[a.id], de = g.area, e = suave3(k);
      g.area = de.map((v, i) => lerp(v, a.area[i], e)); g.mexendo = k < 1;
    }
    if (a.tipo === "seta" || a.tipo === "circulo" || a.tipo === "sublinhar") rabiscos.push({ ...a, k: suave3(k) });
  }
  return { cels, graficos, rabiscos, edicao, selecao, barra };
}

// ---------- direção: o caminho do cursor e da câmera saem das ações ----------
function alvoDoCursor(a) { // onde o cursor precisa estar no começo da ação, e para onde vai se arrastar
  if (a.tipo === "clicar") return a.cel ? centro(cel(a.cel)) : centro(BOTOES[a.botao]);
  if (a.tipo === "digitar") return null; // digitando, a mão sai do mouse
  if (a.tipo === "preencher") { const r = cel(a.de), f = cel(a.ate); return { de: [r.x + r.w - 2, r.y + r.h - 2], para: [f.x + f.w - 2, f.y + f.h - 2] }; }
  if (a.tipo === "selecionar") { const r = cel(a.de), f = cel(a.ate); return { de: [r.x + r.w * 0.4, r.y + r.h * 0.5], para: [f.x + f.w * 0.6, f.y + f.h * 0.5] }; }
  if (a.tipo === "redimensionar") { const g = ACOES.find((b) => b.id === a.id && b.tipo === "grafico"), ant = areaAntes(a); return { de: [ant[0] + ant[2], ant[1] + ant[3]], para: [a.area[0] + a.area[2], a.area[1] + a.area[3]] }; }
  if (a.tipo === "seta" || a.tipo === "circulo" || a.tipo === "sublinhar") { const p = caminhoRabisco(a); return { de: p[0], para: p[p.length - 1], traco: p }; }
  return null;
}
function areaAntes(a) { let ar = null; for (const b of ACOES) { if (b.em >= a.em) break; if (b.id === a.id && (b.tipo === "grafico" || b.tipo === "redimensionar")) ar = b.area; } return ar; }
function caminhoRabisco(a) {
  const pts = [], r = rng(Math.round(a.em * 100));
  if (a.tipo === "seta") { // curva em arco, como mão solta
    const [x0, y0] = a.de, [x1, y1] = a.para, mx = (x0 + x1) / 2 - (y1 - y0) * 0.35, my = (y0 + y1) / 2 + (x1 - x0) * 0.35;
    for (let i = 0; i <= 40; i++) { const q = i / 40, m = 1 - q; pts.push([m * m * x0 + 2 * m * q * mx + q * q * x1, m * m * y0 + 2 * m * q * my + q * q * y1]); }
  } else if (a.tipo === "circulo") { // oval que passa do ponto de partida, como quem circula à mão
    const [x, y, w, h] = a.alvo, cx = x + w / 2, cy = y + h / 2;
    for (let i = 0; i <= 50; i++) { const q = i / 50, ang = -2.2 + q * Math.PI * 2.25, rr = 1 + (r() - 0.5) * 0.03 + q * 0.06; pts.push([cx + Math.cos(ang) * (w / 2 + 18) * rr, cy + Math.sin(ang) * (h / 2 + 14) * rr]); }
  } else { const [x, y, w] = a.alvo; for (let i = 0; i <= 24; i++) pts.push([x + (w * i) / 24, y + Math.sin(i * 0.6) * 3]); }
  return pts;
}
function focoDe(a) { // o que a câmera precisa mostrar em cada ação
  const perto = (p) => ({ x: p[0] - 600, y: p[1] - 330, w: 1200, h: 660 });
  if (a.tipo === "geral") return conteudo(a.em);
  if (a.foco) return { x: a.foco[0], y: a.foco[1], w: a.foco[2], h: a.foco[3] };
  if (a.tipo === "clicar" && a.botao) return { x: 300, y: 20, w: 1500, h: 840 };
  if (a.tipo === "clicar" || a.tipo === "digitar") return perto(centro(cel(a.cel)));
  if (a.tipo === "preencher" || a.tipo === "selecionar") return inflar(faixa(a.de, a.ate), 260);
  if (a.tipo === "grafico") { const [x, y, w, h] = a.area; return inflar({ x, y, w, h }, 120); }
  if (a.tipo === "redimensionar") { const p = areaAntes(a), q = a.area; return inflar(uniao({ x: p[0], y: p[1], w: p[2], h: p[3] }, { x: q[0], y: q[1], w: q[2], h: q[3] }), 110); }
  const p = caminhoRabisco(a), xs = p.map((v) => v[0]), ys = p.map((v) => v[1]);
  return inflar({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }, 260);
}
function conteudo(t) { // tudo o que existe na folha até t: o plano geral mostra isso, não a folha inteira
  let r = { x: 20, y: 20, w: colX(5) + 40, h: G.y0 + 8 * G.lh };
  for (const a of ACOES) {
    if (a.em > t) break;
    if (a.area) r = uniao(r, inflar({ x: a.area[0], y: a.area[1], w: a.area[2], h: a.area[3] }, 50));
    if (["seta", "circulo", "sublinhar"].includes(a.tipo)) { const p = caminhoRabisco(a), xs = p.map((v) => v[0]), ys = p.map((v) => v[1]); r = uniao(r, inflar({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }, 40)); }
  }
  return r;
}
function enquadrar(r) { // centro e zoom para caber o retângulo, sem sair do mundo
  const z = clamp(Math.min(W / r.w, H / r.h) * 0.94, Math.max(W / MUNDO.w, H / MUNDO.h) * 1.0, (W / 1920) * 1.9);
  const vw = W / z / 2, vh = H / z / 2;
  return { x: clamp(r.x + r.w / 2, vw, MUNDO.w - vw), y: clamp(r.y + r.h / 2, vh, MUNDO.h - vh), z };
}
function montarDirecao() {
  // câmera: chega 0,1 s antes de cada ação; não se mexe se o que importa já está em quadro com zoom parecido
  CAM = [{ t0: 0, t1: 0, ...enquadrar(conteudo(0)) }];
  for (const a of ACOES) {
    const alvo = enquadrar(focoDe(a)), ant = CAM[CAM.length - 1], vw = W / ant.z / 2, vh = H / ant.z / 2, f = focoDe(a);
    const cabe = f.x > ant.x - vw && f.x + f.w < ant.x + vw && f.y > ant.y - vh && f.y + f.h < ant.y + vh && Math.abs(Math.log(alvo.z / ant.z)) < 0.25;
    if (cabe && a.tipo !== "geral") continue;
    const dur = clamp(0.55 + Math.hypot(alvo.x - ant.x, alvo.y - ant.y) / 2400 + Math.abs(Math.log(alvo.z / ant.z)) * 0.4, 0.6, 1.1);
    const t1 = Math.max(ant.t1 + 0.25, a.em - 0.1), t0 = Math.max(ant.t1 + 0.15, t1 - dur);
    CAM.push({ t0, t1, ...alvo });
  }
  // cursor: viaja em curva até cada alvo, chega um instante antes; nos arrastos, segue o caminho
  CUR = [];
  let pos = [MUNDO.w * 0.55, MUNDO.h * 0.62], livre = 0;
  for (const a of ACOES) {
    const al = alvoDoCursor(a);
    if (a.tipo === "digitar") { const p = [pos[0] + 70, pos[1] + 90]; CUR.push({ t0: a.em + 0.05, t1: a.em + 0.45, de: pos, para: p }); pos = p; livre = a.em + 0.45; continue; }
    if (!al) continue;
    const chegada = Array.isArray(al) ? al : al.de, d = Math.hypot(chegada[0] - pos[0], chegada[1] - pos[1]);
    const viagem = clamp(0.3 + d / 1600, 0.35, 0.85), t1 = a.em - 0.08, t0 = Math.max(livre, t1 - viagem);
    if (d > 2) CUR.push({ t0, t1, de: pos, para: chegada, curva: true });
    if (Array.isArray(al)) { CUR.push({ clique: a.em }); pos = chegada; livre = a.em + 0.15; }
    else { CUR.push({ aperta: a.em, solta: a.em + a.dura }); CUR.push({ t0: a.em, t1: a.em + a.dura, de: al.de, para: al.para, traco: al.traco }); pos = al.para; livre = a.em + a.dura + 0.1; }
  }
}
function camera(t) {
  let i = 0;
  while (i + 1 < CAM.length && t >= CAM[i + 1].t0) i++;
  const b = CAM[i], a = CAM[Math.max(0, i - 1)], k = i ? suave3(clamp((t - b.t0) / (b.t1 - b.t0))) : 1;
  const z = Math.exp(lerp(Math.log(a.z), Math.log(b.z), k)), resp = 1 + 0.008 * Math.sin(t * 0.7); // respira de leve
  return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: z * resp };
}
function cursor(t) {
  let p = CUR.find((s) => s.t0 !== undefined)?.de || [MUNDO.w * 0.55, MUNDO.h * 0.62], aperto = 0;
  for (const s of CUR) {
    if (s.clique !== undefined) { aperto = Math.max(aperto, 1 - Math.abs(t - s.clique - 0.05) / 0.09); continue; }
    if (s.aperta !== undefined) { if (t >= s.aperta && t <= s.solta) aperto = 1; continue; }
    if (t < s.t0) break;
    const k = clamp((t - s.t0) / (s.t1 - s.t0));
    if (s.traco) { const q = suave3(k) * (s.traco.length - 1), i = Math.floor(q); p = s.traco[Math.min(i, s.traco.length - 1)]; continue; }
    const e = s.curva ? suave3(k) : ease(k), [x0, y0] = s.de, [x1, y1] = s.para;
    const mx = (x0 + x1) / 2 + (y1 - y0) * 0.12, my = (y0 + y1) / 2 - (x1 - x0) * 0.12, m = 1 - e; // arco leve, como mão de verdade
    p = s.curva ? [m * m * x0 + 2 * m * e * mx + e * e * x1, m * m * y0 + 2 * m * e * my + e * e * y1] : [lerp(x0, x1, e), lerp(y0, y1, e)];
  }
  return { x: p[0] + Math.sin(t * 1.3) * 1.2, y: p[1] + Math.cos(t * 1.1) * 1.2, aperto: clamp(aperto) };
}

// ---------- desenho ----------
function interface_(c, est) {
  c.save(); c.strokeStyle = COR.tinta; c.lineWidth = 1.6; c.globalAlpha = 0.7; // logo: uma gradezinha
  for (let i = 0; i <= 3; i++) { torta(c, 60 + i * 10, 62, 60 + i * 10, 92, 50 + i, 0.4); torta(c, 60, 62 + i * 10, 90, 62 + i * 10, 60 + i, 0.4); }
  c.restore();
  texto(c, "planilha", 104, 78, 34, COR.apagada);
  texto(c, R.planilha.titulo, 300, 76, 50, COR.tinta);
  c.strokeStyle = "rgba(60,58,54,0.35)"; c.lineWidth = 1.4; torta(c, 296, 112, 300 + R.planilha.titulo.length * 22, 112, 70, 0.8);
  const y = 168; // barra de ferramentas: lápis de cor no lugar dos ícones
  texto(c, "↶", 70, y + 25, 40, COR.tinta); texto(c, "↷", 120, y + 25, 40, "#c8c4b8");
  [COR.tinta, COR.azul, COR.vermelho, COR.verde, COR.ocre].forEach((cor, i) => aguada(c, { x: 210 + i * 58, y: y + 12, w: 38, h: 24 }, cor, 0.85, 80 + i));
  texto(c, "B", 535, y + 25, 38, COR.tinta); texto(c, "123   R$   %   ,00", 640, y + 25, 32, COR.tinta);
  const bt = (b, rot, kk) => { const r = BOTOES[b]; texto(c, rot, r.x + 12, r.y + r.h / 2, 34, COR.azul); if (kk > 0) { c.save(); c.strokeStyle = COR.selec; c.globalAlpha = kk; c.lineWidth = 2; retTorto(c, r, 90, 0.6); c.restore(); } };
  const clicouGraf = ACOES.find((a) => a.botao === "grafico");
  bt("grafico", "▥ gráfico", clicouGraf ? fase(est.t, clicouGraf.em - 0.05, clicouGraf.em + 0.1) * (1 - fase(est.t, clicouGraf.em + 0.6, clicouGraf.em + 1.0)) : 0);
  bt("rabiscos", "☆ rabiscos", 0);
  c.strokeStyle = COR.grade; c.lineWidth = 1.3; torta(c, 40, 236, MUNDO.w - 40, 236, 71, 0.8);
  texto(c, est.selecao ? `${letra(est.selecao.r.x === G.x0 ? 0 : Math.round((est.selecao.r.x - G.x0 - G.colA) / G.col) + 1)}${Math.round((est.selecao.r.y - G.y0) / G.lh) + 1}` : "A1", 120, 262, 32, COR.azul, "center");
  texto(c, "=", 210, 262, 32, COR.apagada);
  texto(c, est.barra.startsWith("=") ? est.barra.slice(1) : est.barra, 240, 262, 32, COR.tinta);
  if (est.edicao && Math.floor(est.t * 2.4) % 2 === 0) { c.save(); c.font = '32px "Patrick Hand"'; const w = c.measureText(est.barra.slice(1)).width; c.fillStyle = COR.azul; c.fillRect(244 + w, 246, 2, 32); c.restore(); }
}
function grade(c) {
  c.lineWidth = 1.2; c.strokeStyle = COR.grade;
  const yFim = G.y0 + G.nlin * G.lh;
  for (let i = 0; i <= G.ncol; i++) { const x = colX(i); c.strokeStyle = i === 0 ? COR.gradeForte : COR.grade; torta(c, x, G.y0 - 4, x, yFim, 100 + i, 0.9); }
  for (let l = 0; l <= G.nlin; l++) { const y = G.y0 + l * G.lh; c.strokeStyle = l === 0 ? COR.gradeForte : COR.grade; torta(c, G.x0 - 50, y, colX(G.ncol), y, 200 + l, 0.9); }
  for (let i = 0; i < G.ncol; i++) texto(c, letra(i), colX(i) + colW(i) / 2, G.y0 - 30, 30, COR.apagada, "center");
  for (let l = 1; l <= G.nlin; l++) texto(c, String(l), G.x0 - 24, G.y0 + (l - 0.5) * G.lh, 26, COR.apagada, "center");
}
function celulas(c, est) {
  for (const ref of R.planilha.cabecalho || []) { const r = cel(ref); aguada(c, { x: r.x + 4, y: r.y + 6, w: r.w - 8, h: r.h - 12 }, ref.startsWith(R.planilha.colunaVerde || "#") ? COR.cabVerde : COR.cab, 0.75, 300 + r.c * 7 + r.l); }
  for (const [ref, v] of Object.entries(est.cels)) {
    if (est.edicao && cel(ref).x === est.edicao.r.x && cel(ref).y === est.edicao.r.y) continue;
    const r = cel(ref), num = /^[R$\d.,%-]/.test(v.txt), a = v.desde < 0 ? 1 : fase(est.t, v.desde, v.desde + 0.22);
    if (a <= 0) continue;
    c.save(); c.translate(0, (1 - a) * 6); // o valor entra como tinta: aparece e assenta
    texto(c, v.txt, num ? r.x + r.w - 16 : r.x + 16, r.y + r.h / 2 + 1, 36, COR[v.cor] || COR.tinta, num ? "right" : "left", a);
    c.restore();
  }
  const s = est.selecao; // a seleção: retângulo azul torto, aguada leve e a alça do canto
  if (s) {
    aguada(c, s.r, COR.selec, s.faixa ? 0.16 : 0.08, 400);
    c.save(); c.strokeStyle = COR.selec; c.lineWidth = 2.6; retTorto(c, s.r, 410, 0.7); c.fillStyle = COR.selec; c.fillRect(s.r.x + s.r.w - 6, s.r.y + s.r.h - 6, 11, 11); c.restore();
  }
  if (est.edicao) { // editando: a fórmula em vermelho dentro da célula, com o cursor de texto piscando
    const r = est.edicao.r; c.save(); c.font = '36px "Patrick Hand"'; const w = c.measureText(est.edicao.txt).width; c.restore();
    const larg = Math.max(r.w, w + 40);
    c.save(); c.fillStyle = "rgba(239,237,228,0.92)"; c.fillRect(r.x + 2, r.y + 2, larg - 4, r.h - 4); c.strokeStyle = COR.selec; c.lineWidth = 2; retTorto(c, { x: r.x, y: r.y, w: larg, h: r.h }, 420, 0.6); c.restore();
    texto(c, est.edicao.txt, r.x + 14, r.y + r.h / 2 + 1, 36, COR.vermelho);
    if (Math.floor(est.t * 2.4) % 2 === 0) { c.fillStyle = COR.azul; c.fillRect(r.x + 18 + w, r.y + 12, 2, r.h - 24); }
  }
}
const passoEixo = (v) => { const p = Math.pow(10, Math.floor(Math.log10(v / 4))), m = v / 4 / p; return (m < 1.5 ? 1 : m < 3.5 ? 2.5 : m < 7.5 ? 5 : 10) * p; }; // números redondos no eixo
function grafico(c, g, t) {
  const [x, y, w, h] = g.area, k = (a, b) => fase(t, g.desde + a, g.desde + b);
  if (g.mexendo || t - g.desde < 0.5) { c.save(); c.strokeStyle = COR.selec; c.setLineDash([10, 8]); c.lineWidth = 2; c.globalAlpha = g.mexendo ? 0.8 : 1 - k(0.2, 0.5); retTorto(c, { x: x - 14, y: y - 14, w: w + 28, h: h + 28 }, 500, 0.5); c.setLineDash([]); c.fillStyle = COR.selec; c.fillRect(x + w + 8, y + h + 8, 12, 12); c.restore(); }
  texto(c, g.titulo, x, y + 20, 42, COR.tinta, "left", k(0.05, 0.4));
  const vmax = Math.max(...g.valores) * 1.12, base = y + h - 46, topo = y + 80, cores = (g.cores || ["azul"]).map((n) => COR[n] || n);
  if (g.forma === "rosca") {
    const cx = x + w * 0.3, cy = (topo + base) / 2, rr = Math.min(w * 0.26, (base - topo) / 2), soma = g.valores.reduce((p, q) => p + q, 0);
    let a0 = -Math.PI / 2;
    g.valores.forEach((v, i) => { const da = (v / soma) * Math.PI * 2 * k(0.3 + i * 0.12, 1.1 + i * 0.12); c.save(); c.beginPath(); c.arc(cx, cy, rr, a0, a0 + da); c.arc(cx, cy, rr * 0.58, a0 + da, a0, true); c.closePath(); c.clip(); aguada(c, { x: cx - rr, y: cy - rr, w: rr * 2, h: rr * 2 }, cores[i % cores.length], 0.62, 600 + i); c.restore(); a0 += (v / soma) * Math.PI * 2; });
    return;
  }
  c.save(); c.strokeStyle = "rgba(60,58,54,0.55)"; c.lineWidth = 1.8; // eixos que se traçam
  const ke = k(0.15, 0.55); torta(c, x + 70, base, x + 70 + (w - 90) * ke, base, 510, 0.9); torta(c, x + 70, base, x + 70, base - (base - topo) * ke, 511, 0.9);
  c.strokeStyle = "rgba(105,135,190,0.25)"; c.lineWidth = 1;
  for (let v = passoEixo(vmax), i = 1; v * i <= vmax; i++) { const yy = base - ((base - topo) * v * i) / vmax; torta(c, x + 70, yy, x + 70 + (w - 90) * ke, yy, 520 + i, 0.6); texto(c, (v * i).toLocaleString("pt-BR"), x + 58, yy, 24, COR.apagada, "right", ke); }
  c.restore();
  const n = g.valores.length, passo = (w - 110) / n, bw = Math.min(70, passo * 0.42);
  g.valores.forEach((v, i) => { // barras de aquarela crescendo, cada uma um pouco depois, com um leve passar do ponto
    const kb = k(0.45 + i * 0.13, 1.15 + i * 0.13), sobe = kb < 1 ? kb * (1 + 0.06 * Math.sin(kb * Math.PI)) : 1;
    const bh = ((base - topo) * v) / vmax * sobe, bx = x + 90 + passo * i + (passo - bw) / 2;
    if (bh > 1) aguada(c, { x: bx, y: base - bh, w: bw, h: bh }, cores[i % cores.length], 0.62, 700 + i);
    texto(c, g.rotulos[i], bx + bw / 2, base + 26, 28, COR.tinta, "center", k(0.5 + i * 0.13, 0.9 + i * 0.13));
  });
}
function rabisco(c, rb) {
  const cor = COR[rb.cor || "ocre"] || rb.cor, p = caminhoRabisco(rb);
  pincel(c, p, rb.k, cor, rb.tipo === "circulo" ? 5 : 6);
  if (rb.tipo === "seta" && rb.k > 0.92) { // a ponta da seta: dois toques rápidos no fim
    const [x1, y1] = p[p.length - 1], [x0, y0] = p[p.length - 4], a = Math.atan2(y1 - y0, x1 - x0), kk = clamp((rb.k - 0.92) / 0.08);
    for (const s of [-1, 1]) pincel(c, [[x1, y1], [x1 - Math.cos(a + s * 0.5) * 34 * kk, y1 - Math.sin(a + s * 0.5) * 34 * kk]], 1, cor, 6);
  }
}
function desenharCursor(c, cur) { // seta de mouse comum, preta de borda branca; aperta de leve no clique
  c.save(); c.translate(cur.x, cur.y); const s = 1.25 * (1 - 0.1 * cur.aperto); c.scale(s, s);
  const p = [[0, 0], [0, 26], [7, 20], [12, 31], [17, 29], [12, 18], [21, 18]];
  c.beginPath(); p.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath();
  c.shadowColor = "rgba(0,0,0,0.18)"; c.shadowBlur = 4; c.shadowOffsetY = 2;
  c.fillStyle = "#1e1e1e"; c.fill(); c.shadowColor = "transparent"; c.lineWidth = 1.6; c.strokeStyle = "#fbfaf5"; c.stroke();
  c.restore();
}

async function iniciar(tempo) {
  TEMPO = tempo; R = tempo.roteiro; ACOES = [...R.acoes].sort((a, b) => a.em - b.em);
  [W, H] = TAM[tempo.formato];
  const el = document.getElementById("c"); el.width = W; el.height = H;
  ctx = el.getContext("2d");
  PAPEL = fazerPapel(); GRANULO = fazerGranulo(); GRAO = fazerGrao();
  montarDirecao();
  await document.fonts.load('40px "Patrick Hand"');
}
function quadro(t) {
  const cam = camera(t), est = { ...estado(t), t }, c = ctx;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = "#d9d6cb"; c.fillRect(0, 0, W, H);
  c.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.x * cam.z, H / 2 - cam.y * cam.z);
  const pp = c.createPattern(PAPEL, "repeat"); c.fillStyle = pp; c.fillRect(0, 0, MUNDO.w, MUNDO.h);
  grade(c); celulas(c, est); interface_(c, est);
  for (const g of Object.values(est.graficos)) grafico(c, g, t);
  for (const rb of est.rabiscos) rabisco(c, rb);
  desenharCursor(c, cursor(t));
  c.setTransform(1, 0, 0, 1, 0, 0); // grão do papel, fixo na tela, bem leve
  c.save(); c.globalCompositeOperation = "soft-light"; c.globalAlpha = 0.12; c.drawImage(GRAO, 0, 0); c.restore();
}
function eventos() { // para o som.py: cada clique, cada tecla, cada arrasto, cada rabisco, cada gráfico
  const ev = [];
  for (const a of ACOES) {
    if (a.tipo === "clicar") ev.push({ t: a.em, tipo: "clique" });
    if (a.tipo === "digitar") { [...a.texto].forEach((_, i) => ev.push({ t: a.em + (a.dura * (i + 0.5)) / a.texto.length, tipo: "tecla" })); ev.push({ t: a.em + a.dura, tipo: "enter" }); }
    if (["preencher", "selecionar", "redimensionar"].includes(a.tipo)) { ev.push({ t: a.em, tipo: "clique" }); ev.push({ t: a.em, tipo: "arrasto", dura: a.dura }); ev.push({ t: a.em + a.dura, tipo: "solta" }); }
    if (["seta", "circulo", "sublinhar"].includes(a.tipo)) ev.push({ t: a.em, tipo: "lapis", dura: a.dura });
    if (a.tipo === "grafico") ev.push({ t: a.em + 0.2, tipo: "papel" });
  }
  return ev.sort((p, q) => p.t - q.t);
}
