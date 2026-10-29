// Higgsfield: a Higgsfield pinta as peças (fundo, personagem em partes, texturas) e o código as anima no tempo.
// A geometria vem do código antes da pintura (guias.py), então o motor sabe onde está cada célula pintada.
// Carregado depois de nucleo/2d/base.js; as cenas ficam em cenas.js. iniciar(tempo) uma vez (espera as imagens), quadro(t) por quadro.

const ATV = {};
let M, ALVO, CENA_C, ANT_C, TMP;
const TRANS = 0.8; // duração das passagens entre atos

const imagem = (src) => new Promise((ok, erro) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => erro(src); i.src = src; });
function json(src) { const x = new XMLHttpRequest(); x.open("GET", src, false); x.send(); return JSON.parse(x.responseText); } // fetch não lê file://
const clamp = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const fase = (u, a, b) => ease(clamp((u - a) / (b - a)));

// ---------- câmera sobre uma pintura: (x, y) da pintura no centro da tela; zoom 1 = a pintura cobre a tela ----------
function vista(c, img, x, y, zoom) {
  const s = Math.max(W / img.width, H / img.height) * zoom;
  c.setTransform(s, 0, 0, s, W / 2 - x * s, H / 2 - y * s);
  c.drawImage(img, 0, 0);
  return s;
}
const telaPara = (x, y, s, cx, cy) => [W / 2 + (x - cx) * s, H / 2 + (y - cy) * s];

// ---------- a abelha: corpo pintado, asas pintadas presas no tórax, sombra no chão ----------
const ABELHA = { cx: 1024, cy: 1000, comp: 1892, torax: [1024, 740], ombro: 120, raiz: [82, 650], asaComp: 2524 };
function asas(c, abertura, bate, t, alpha) { // abertura 0 = dobradas sobre o abdome, 1 = abertas para o voo
  const A = ABELHA, k = (0.62 * A.comp) / A.asaComp;
  for (const lado of [1, -1]) {
    const base = lerp(78, 22, abertura) * (Math.PI / 180), copias = bate ? 3 : 1;
    for (let i = 0; i < copias; i++) { // batendo rápido: três posições meio transparentes, como borrão de movimento
      const osc = bate ? Math.sin(t * 2 * Math.PI * 34 + i * 2.1) * 0.35 : 0;
      c.save();
      c.translate(A.torax[0] + lado * A.ombro, A.torax[1]); c.scale(lado, 1); c.rotate(base + osc);
      c.globalAlpha = alpha * (bate ? 0.38 : 0.85);
      c.drawImage(ATV.asa, -A.raiz[0] * k, -A.raiz[1] * k, ATV.asa.width * k, ATV.asa.height * k);
      c.restore();
    }
  }
}
function abelha(c, x, y, ang, tam, t, o = {}) { // tam = comprimento da abelha, nas unidades do contexto
  const A = ABELHA, k = tam / A.comp;
  c.save();
  c.translate(x, y); c.rotate(ang); c.scale(k, k); c.translate(-A.cx, -A.cy);
  if (o.alpha !== undefined) c.globalAlpha = o.alpha;
  if (o.sombra) {
    c.save(); c.filter = `blur(${Math.max(1, 6 / (k * 40))}px) brightness(0)`; c.globalAlpha *= 0.32;
    c.drawImage(ATV.abelha, 40 * (o.sombra || 1), 70 * (o.sombra || 1)); c.restore();
  }
  c.drawImage(ATV.abelha, 0, 0);
  asas(c, o.abertura || 0, o.bate, t, o.alpha ?? 1);
  c.restore();
}
function sprite(c, img, x, y, alt, ang = 0, alpha = 1) { // peça recortada centrada em (x, y), com altura alt
  const k = alt / img.height;
  c.save(); c.globalAlpha *= alpha; c.translate(x, y); c.rotate(ang);
  c.drawImage(img, (-img.width * k) / 2, (-img.height * k) / 2, img.width * k, img.height * k);
  c.restore();
}
function brilhoMel(c, cam, t, forca = 1) { // reflexo que corre na superfície do mel e anda com a câmera
  const R = M.r, x0 = cam.x - W / 2 / cam.s, x1 = cam.x + W / 2 / cam.s, y0 = cam.y - H / 2 / cam.s, y1 = cam.y + H / 2 / cam.s;
  c.save(); c.globalCompositeOperation = "screen";
  for (const [i, cel] of M.celulas.entries()) {
    if (cel.tipo !== "mel" || cel.x < x0 - R || cel.x > x1 + R || cel.y < y0 - R || cel.y > y1 + R) continue;
    const gx = cel.x - R * 0.3 - (cam.x - ALVO.x) * 0.05, gy = cel.y - R * 0.34 - (cam.y - ALVO.y) * 0.05, r = R * 0.26;
    const g = c.createRadialGradient(gx, gy, 0, gx, gy, r);
    g.addColorStop(0, `rgba(255,248,225,${forca * (0.32 + 0.18 * Math.sin(t * 1.4 + i))})`); g.addColorStop(1, "rgba(255,240,200,0)");
    c.fillStyle = g; c.fillRect(gx - r, gy - r, r * 2, r * 2);
  }
  c.restore();
}
const hexPts6 = (x, y, r, rot = -90) => [...Array(6)].map((_, j) => [x + r * Math.cos(((60 * j + rot) * Math.PI) / 180), y + r * Math.sin(((60 * j + rot) * Math.PI) / 180)]);
function hexLuz(c, pts, k, larg = 1) { // linha de luz do código: contorno quente por baixo, luz clara por cima
  c.save(); c.lineCap = c.lineJoin = "round";
  c.strokeStyle = "rgba(150,60,10,0.85)"; c.lineWidth = 16 * larg; tracar(c, pts, k);
  c.strokeStyle = "#fff4c8"; c.lineWidth = 7 * larg; c.shadowColor = "rgba(255,190,70,1)"; c.shadowBlur = 40 * larg; tracar(c, pts, k); tracar(c, pts, k);
  c.restore();
}
function linhaGiz(c, desenha, larg, alpha = 1) { // linhas do diagrama: creme com brilho, como na Prancha Viva
  c.save(); c.lineCap = c.lineJoin = "round"; c.globalAlpha = alpha;
  c.strokeStyle = "#f6e7c1"; c.lineWidth = larg; c.shadowColor = "rgba(255,220,150,0.8)"; c.shadowBlur = larg * 4;
  desenha(); c.restore();
}
function poeira(c, t, n = 70, cor = "255,236,190", dx = 0) { // pólen e poeira no ar, em várias distâncias
  const r = rng(11), sm = Math.min(W, H);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = "screen";
  for (let i = 0; i < n; i++) {
    const d = 0.3 + r() * 1.3, x = ((r() * W + t * (8 + r() * 14) / d - dx / d) % (W + 60) + W + 60) % (W + 60) - 30;
    const y = ((r() * H - t * (4 + r() * 8) / d) % (H + 60) + H + 60) % (H + 60) - 30, rr = (sm / 1080) * (2 + 6 / d);
    const g = c.createRadialGradient(x, y, 0, x, y, rr);
    g.addColorStop(0, `rgba(${cor},${(0.25 + 0.35 * r()) * (0.6 + 0.4 * Math.sin(t * 2 + i))})`); g.addColorStop(1, `rgba(${cor},0)`);
    c.fillStyle = g; c.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  c.restore();
}

// ---------- quadro ----------
async function iniciar(tempo) {
  TEMPO = tempo;
  [W, H] = TAM[tempo.formato];
  const el = document.getElementById("c");
  el.width = W; el.height = H;
  ctx = el.getContext("2d");
  const p = "file://" + tempo.ativos + "/";
  await Promise.all(tempo.pecas.map(async (n) => (ATV[n] = await imagem(p + n + ".png"))));
  M = json(p + "favo.json");
  ALVO = M.celulas.find((c) => c.alvo);
  GRAO = fazerGrao(); CENA_C = tela(W, H); ANT_C = tela(W, H); TMP = tela(W, H);
}
function idx(t) { const i = TEMPO.atos.findIndex((a) => t >= a.t0 && t < a.t1); return i < 0 ? TEMPO.atos.length - 1 : i; }
function desenharAto(c, i, t) {
  const a = TEMPO.atos[i];
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = "source-over"; c.filter = "none";
  c.clearRect(0, 0, W, H);
  const fala = a.fala ? { t0: a.fala.t0 - a.t0, t1: a.fala.t1 - a.t0 } : { t0: 0.4, t1: a.t1 - a.t0 - 0.7 };
  return CENAS[a.cena](c, t - a.t0, { dura: a.t1 - a.t0, fala }) || {};
}
function quadro(t) {
  const i = idx(t), a = TEMPO.atos[i], u = t - a.t0, c = CENA_C.getContext("2d");
  const o = desenharAto(c, i, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = "none";
  const k = ease(clamp(u / TRANS));
  if (i > 0 && a.entrada && k < 1) { // passagem: o ato anterior continua por baixo enquanto o novo entra
    desenharAto(ANT_C.getContext("2d"), i - 1, t);
    ctx.drawImage(ANT_C, 0, 0);
    ctx.save();
    if (a.entrada === "iris") { ctx.beginPath(); ctx.arc(W / 2, H / 2, k * Math.hypot(W, H) * 0.55, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(CENA_C, 0, 0); }
    else if (a.entrada === "afasta") { ctx.drawImage(CENA_C, 0, 0); ctx.globalAlpha = 1 - k; const z = 1 + k * 0.6; ctx.drawImage(ANT_C, W / 2 - (W * z) / 2, H / 2 - (H * z) / 2, W * z, H * z); }
    else { ctx.globalAlpha = k; ctx.drawImage(CENA_C, 0, 0); } // funde e forma
    ctx.restore();
  } else ctx.drawImage(CENA_C, 0, 0);
  if (o.macro !== false) { // lente macro: o centro nítido, as bordas fora de foco
    const tc = TMP.getContext("2d");
    tc.setTransform(1, 0, 0, 1, 0, 0); tc.globalCompositeOperation = "source-over"; tc.clearRect(0, 0, W, H); // a cena pode ter usado TMP com outra transformação
    tc.filter = `blur(${(W / 1920) * 7}px)`; tc.drawImage(ctx.canvas, 0, 0); tc.filter = "none";
    tc.globalCompositeOperation = "destination-in";
    const v = tc.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.32, W / 2, H / 2, Math.hypot(W, H) * 0.55);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,1)");
    tc.fillStyle = v; tc.fillRect(0, 0, W, H);
    ctx.drawImage(TMP, 0, 0);
  }
  if (o.perto) o.perto(ctx); // o que passa rente à lente, já desfocado
  if (o.poeira !== false) poeira(ctx, t, 70, o.poeira || "255,236,190");
  // passada final: o mesmo grão de risografia por cima da pintura e do código, para virar um material só
  ctx.save();
  ctx.globalCompositeOperation = "soft-light"; ctx.globalAlpha = 0.3;
  const j = Math.floor(t * 12) % 4;
  ctx.drawImage(GRAO, (j % 2) * 3 - 1.5, (j >> 1) * 3 - 1.5);
  ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha = 1;
  const vh = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.hypot(W, H) * 0.62);
  vh.addColorStop(0, "rgba(255,255,255,0)"); vh.addColorStop(1, "rgba(110,60,20,0.45)");
  ctx.fillStyle = vh; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
