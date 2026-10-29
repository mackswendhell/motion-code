// Higgsfield · prancha: as 13 cenas do ciclo da abelha. Cada cena desenha o quadro inteiro em c, no tempo u do ato.
// d = { dura, fala: { t0, t1 } } (segundos desde o começo do ato). Pode devolver { macro, perto, poeira }.
// Posições nas pinturas em frações da imagem (PECA), medidas depois de pintar: a pintura é peça, o código manda no tempo.

const PECA = {
  celula: { cx: 0.5, cy: 0.48, borda: 0.33 }, // centro e raio da boca da célula, em frações da altura (medido na pintura)
  corte: { cx: 0.5, cy: 0.56, alt: 0.5 }, // onde a pupa cabe dentro do corte
  mapa: { casa: [0.1, 0.73], flores: [0.62, 0.22] },
  galho: { flores: [[0.38, 0.57], [0.51, 0.35], [0.69, 0.52]] },
};
let PERTO;
const P_ = (img, fx, fy) => [img.width * fx, img.height * fy];

function voando(g, u, a, b) { // outra abelha cruza rente à lente, grande e desfocada
  const kv = (u - a) / (b - a);
  if (kv <= 0 || kv >= 1) return;
  PERTO = PERTO || tela(W, H);
  const pc = PERTO.getContext("2d"); pc.setTransform(1, 0, 0, 1, 0, 0); pc.clearRect(0, 0, W, H);
  abelha(pc, lerp(W * 1.2, -W * 0.2, kv), H * (0.2 + 0.08 * Math.sin(kv * 6)), -Math.PI / 2 + 0.15 * Math.sin(kv * 5), H * 0.62, u, { abertura: 1, bate: true });
  g.save(); g.filter = `blur(${(W / 1920) * 18}px)`; g.drawImage(PERTO, 0, 0); g.restore();
}
function andar(u, T, P, ginga = true) { // caminho de curva com passadas: a velocidade pulsa a cada passo
  const v = clamp(u / T), p = clamp(v - Math.sin(v * 2 * Math.PI * 7) / (2 * Math.PI * 7) * 0.7);
  const b = (q) => { const m = 1 - q; return [0, 1].map((i) => m * m * m * P[0][i] + 3 * m * m * q * P[1][i] + 3 * m * q * q * P[2][i] + q * q * q * P[3][i]); };
  const [x, y] = b(p), [x2, y2] = b(Math.min(1, p + 0.01)), [x0, y0] = b(Math.max(0, p - 0.01));
  return { x, y, ang: Math.atan2(y2 - y0, x2 - x0) + Math.PI / 2 + (ginga && v < 1 ? Math.sin(u * 2 * Math.PI * 2.2) * 0.04 : 0) };
}
const perto = (tipo, x, y, n) => M.celulas.filter((c) => c.tipo === tipo && !c.alvo).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y)).slice(0, n);
function celulaVista(c, img, u, d, zoom = 1) { // a célula de perto: centro da boca no centro da tela
  const P = PECA.celula, z = zoom * (1 + 0.06 * (u / d.dura));
  const s = vista(c, img, img.width * P.cx, img.height * P.cy, z);
  return { s, x: img.width * P.cx, y: img.height * P.cy, r: img.height * P.borda };
}

const CENAS = {
  favo(c, u, d) {
    const k = u / d.dura, mergulho = fase(u, d.fala.t1 - 0.3, d.dura + 0.8);
    const cam = { x: lerp(ALVO.x - 420, ALVO.x, ease(clamp(k * 1.1))), y: lerp(ALVO.y - 170, ALVO.y, ease(clamp(k * 1.1))) };
    cam.s = vista(c, ATV.favo, cam.x, cam.y, 1.5 * (1 + 0.08 * k) * (1 + 1.1 * mergulho));
    brilhoMel(c, cam, u);
    const kh = fase(u, d.fala.t1 - 0.9, d.fala.t1 - 0.1);
    if (kh > 0) hexLuz(c, hexPts6(ALVO.x, ALVO.y, M.r * 0.97), kh);
    const b = andar(u, 2.6, [[ALVO.x - 980, ALVO.y + 520], [ALVO.x - 700, ALVO.y + 60], [ALVO.x - 360, ALVO.y + 120], [ALVO.x - 250, ALVO.y - 10]]);
    const zum = clamp((u - (d.fala.t1 - 0.5)) / 0.25);
    abelha(c, b.x, b.y, b.ang, 560, u, { sombra: 1, abertura: 0.35 * zum, bate: zum > 0.05 });
    return { perto: (g) => voando(g, u, 0.3, 2.3) };
  },

  geometria(c, u, d) { // diagrama: flor da vida -> hexágono -> prisma; o hexágono se enche de mel pintado
    const img = ATV.diagrama;
    vista(c, img, img.width / 2, img.height / 2, 1.05 + 0.05 * (u / d.dura));
    c.setTransform(1, 0, 0, 1, 0, 0);
    const cx = W / 2, cy = H / 2, R = H * 0.17, L = (H / 1080) * 3.2;
    const centros = [[cx, cy], ...[...Array(6)].map((_, j) => [cx + R * Math.cos((j * Math.PI) / 3 - Math.PI / 2), cy + R * Math.sin((j * Math.PI) / 3 - Math.PI / 2)])];
    const apaga = 1 - fase(u, 2.4, 3.0) * 0.75;
    centros.forEach(([x, y], j) => {
      const k = fase(u, 0.15 + j * 0.16, 0.6 + j * 0.16);
      if (k > 0) linhaGiz(c, () => { c.beginPath(); c.arc(x, y, R, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); c.stroke(); }, L, apaga);
    });
    const hex = hexPts6(cx, cy, R, -90), kh = fase(u, 1.5, 2.3);
    // a profundidade do prisma gira devagar: a célula é um tubo de seis lados
    const g = fase(u, 2.6, 3.6), ang = -0.9 + u * 0.35, prof = [Math.cos(ang) * R * 0.55 * g, -Math.sin(ang) * R * 0.32 * g];
    if (g > 0) {
      const tras = hex.map(([x, y]) => [x + prof[0], y + prof[1]]);
      linhaGiz(c, () => { c.beginPath(); tras.forEach(([x, y], j) => (j ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); hex.forEach(([x, y], j) => { c.moveTo(x, y); c.lineTo(...tras[j]); }); c.stroke(); }, L * 0.8, 0.75 * g);
    }
    const km = fase(u, 3.2, 4.4); // a pintura entra na forma do código: o hexágono se enche de mel
    if (km > 0) {
      const mel = perto("mel", ALVO.x, ALVO.y, 1)[0], rr = M.r * 0.86;
      c.save(); c.beginPath(); hex.forEach(([x, y], j) => (j ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
      c.globalAlpha = km; c.drawImage(ATV.favo, mel.x - rr, mel.y - rr, rr * 2, rr * 2, cx - R * 1.02, cy - R * 1.02, R * 2.04, R * 2.04);
      c.restore();
    }
    if (kh > 0) linhaGiz(c, () => tracar(c, hex, kh), L * 1.5);
    return { macro: false, poeira: "246,231,193" };
  },

  ovo(c, u, d) {
    const v = celulaVista(c, ATV.celula, u, d);
    const k = fase(u, 0.3, 1.2);
    sprite(c, ATV.ovo, v.x, v.y, v.r * 0.55 * (0.85 + 0.15 * k), 0.15, k);
    const ka = fase(u, d.fala.t0 + 1.4, d.fala.t0 + 2.2); // o grão de arroz chega ao lado, para dar a escala
    if (ka > 0) {
      c.save(); c.filter = "blur(14px) brightness(0)"; c.globalAlpha = 0.25 * ka;
      sprite(c, ATV.arroz, v.x + v.r * lerp(2.6, 1.55, ka) + 25, v.y + 40, v.r * 1.9, 0.35); c.restore();
      sprite(c, ATV.arroz, v.x + v.r * lerp(2.6, 1.55, ka), v.y, v.r * 1.9, 0.35, ka);
    }
  },

  larva(c, u, d) {
    const v = celulaVista(c, ATV.celula, u, d), k = u / d.dura;
    sprite(c, ATV.larva, v.x, v.y, v.r * lerp(0.75, 1.35, k) * (1 + 0.02 * Math.sin(u * 5)), u * 0.05);
    for (let i = 0; i < 6; i++) { // as irmãs: cabeças entrando e saindo da célula, cada uma de um lado, rápido como timelapse
      const t0 = 0.2 + i * 0.6, q = (u - t0) / 0.75;
      if (q <= 0 || q >= 1) continue;
      const th = i * 2.2 + 0.6, ida = Math.sin(q * Math.PI), dist = v.r * lerp(2.2, 1.25, ida);
      const x = v.x + Math.cos(th) * dist, y = v.y + Math.sin(th) * dist;
      abelha(c, x, y, Math.atan2(v.y - y, v.x - x) + Math.PI / 2, v.r * 2.6, u, { sombra: 0.6, alpha: Math.min(1, ida * 1.6) });
    }
  },

  pupa(c, u, d) {
    const fecha = fase(u, 0.3, 2.0), corte = fase(u, 2.3, 3.0);
    if (corte < 1) { // a célula fecha: a tampa de cera cresce da borda para o centro
      const v = celulaVista(c, ATV.celula, u, d);
      sprite(c, ATV.larva, v.x, v.y, v.r * 1.35, 0.2);
      c.save(); c.beginPath(); c.rect(0, 0, ATV.celula.width, ATV.celula.height); c.arc(v.x, v.y, v.r * 1.15 * (1 - fecha), 0, Math.PI * 2); c.clip("evenodd");
      c.drawImage(ATV["celula-fechada"], 0, 0); c.restore();
    }
    if (corte > 0) { // por dentro: o corte da célula e a pupa mudando no lugar
      c.save(); c.globalAlpha = corte;
      const img = ATV.corte, P = PECA.corte;
      vista(c, img, img.width * P.cx, img.height * P.cy, 1.02 + 0.04 * (u / d.dura));
      const x = img.width * P.cx, y = img.height * P.cy, alt = img.height * P.alt, km = fase(u, 3.6, 5.4);
      sprite(c, ATV.pupa, x, y, alt, 0, 1 - km);
      sprite(c, ATV["pupa-olhos"], x, y, alt, 0, km);
      c.restore();
    }
  },

  nascimento(c, u, d) {
    const v = celulaVista(c, ATV.celula, u, d), sai = fase(u, 1.0, 3.6), buraco = fase(u, 0.2, 1.6);
    const tam = v.r * lerp(1.6, 3.4, sai), y = v.y - v.r * lerp(-0.35, 1.6, fase(u, 2.2, 4.0)) - tam * 0.0;
    const cabeca = () => abelha(c, v.x, y + tam * 0.33, 0, tam, u, { sombra: 0.8, abertura: 0.1 * sai });
    if (u < 2.3) cabeca();
    // a tampa: um buraco roído que cresce de borda irregular
    const T = TMP.getContext("2d"); // tela de apoio do motor, livre durante a cena
    T.setTransform(c.getTransform()); T.globalCompositeOperation = "source-over";
    T.save(); T.setTransform(1, 0, 0, 1, 0, 0); T.clearRect(0, 0, W, H); T.restore();
    T.drawImage(ATV["celula-fechada"], 0, 0);
    if (buraco > 0) {
      const r = rng(5); T.globalCompositeOperation = "destination-out"; T.beginPath();
      for (let j = 0; j < 28; j++) { const a = (j / 28) * Math.PI * 2, rr = v.r * 1.12 * buraco * (0.82 + 0.25 * r()); j ? T.lineTo(v.x + Math.cos(a) * rr, v.y + Math.sin(a) * rr) : T.moveTo(v.x + Math.cos(a) * rr, v.y + Math.sin(a) * rr); }
      T.closePath(); T.fill(); T.globalCompositeOperation = "source-over";
    }
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(TMP, 0, 0); c.restore();
    if (u >= 2.3) cabeca();
  },

  trabalho(c, u, d) { // Limpa. Alimenta. Constrói. Vigia. — a câmera pula de tarefa em tarefa no ritmo das palavras
    const vazias = perto("vazia", ALVO.x, ALVO.y, 6), mel = perto("mel", ALVO.x + 700, ALVO.y, 1)[0];
    const pts = [[vazias[1].x, vazias[1].y], [vazias[3].x, vazias[3].y], [ALVO.x + 300, ALVO.y - 380], [mel.x, mel.y + 400]];
    const passo = (d.fala.t1 - d.fala.t0) / 4, i = Math.min(3, Math.max(0, Math.floor((u - d.fala.t0 + 0.3) / passo)));
    const q = fase(u, d.fala.t0 + i * passo - 0.3, d.fala.t0 + i * passo + 0.2), ant = pts[Math.max(0, i - 1)];
    const cam = { x: lerp(ant[0], pts[i][0], i ? q : 1), y: lerp(ant[1], pts[i][1], i ? q : 1) };
    cam.s = vista(c, ATV.favo, cam.x, cam.y, 2.0);
    brilhoMel(c, cam, u);
    const R = M.r;
    // constrói: o código levanta as paredes de cera novas, célula por célula
    const kc = fase(u, d.fala.t0 + 2 * passo - 0.2, d.fala.t0 + 3 * passo + 0.4);
    [[0, 0], [1, 0], [0.5, -1]].forEach(([dx, dy], j) => {
      const k = clamp(kc * 3 - j);
      if (k > 0) linhaGiz(c, () => tracar(c, hexPts6(pts[2][0] + dx * Math.sqrt(3) * R, pts[2][1] + dy * 1.5 * R, R * 0.95), k), 6, 0.9);
    });
    const bob = (f) => Math.sin(u * 2 * Math.PI * f) * 14;
    abelha(c, pts[0][0] - 60 + bob(3), pts[0][1] + 230, 0.25, 560, u, { sombra: 1 }); // limpa: cabeça dentro da célula vazia
    abelha(c, pts[1][0] + 220, pts[1][1] + 120 + bob(5), -1.0, 560, u, { sombra: 1 }); // alimenta
    abelha(c, pts[2][0] - 330, pts[2][1] + 200, 0.9, 560, u, { sombra: 1 }); // constrói
    abelha(c, pts[3][0], pts[3][1], Math.sin(u * 3) * 0.25, 560, u, { sombra: 1, abertura: 0.4, bate: true }); // vigia
  },

  voo(c, u, d) { // ela vê o céu: abre do quadradinho da colmeia para o mapa inteiro, e voa até as macieiras
    const img = ATV.mapa, P = PECA.mapa, k = fase(u, 0, d.dura);
    const casa = P_(img, ...P.casa), flores = P_(img, ...P.flores), meio = [img.width / 2, img.height / 2];
    const cam = { x: lerp(casa[0], meio[0], k), y: lerp(casa[1], meio[1], k) };
    const s = vista(c, img, cam.x, cam.y, lerp(3.2, 1.05, k));
    const kv = fase(u, 0.6, d.dura - 0.2), ctrl = [lerp(casa[0], flores[0], 0.25), flores[1] + img.height * 0.35];
    const curva = (q) => [0, 1].map((j) => (1 - q) * (1 - q) * casa[j] + 2 * (1 - q) * q * ctrl[j] + q * q * flores[j]);
    c.save(); c.setLineDash([18 / s, 14 / s]); c.lineWidth = 3.2 / s; c.strokeStyle = "rgba(255,244,210,0.9)"; c.lineCap = "round";
    c.beginPath(); for (let q = 0; q <= kv; q += 0.01) { const [x, y] = curva(q); q ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.restore();
    const [x, y] = curva(kv), [x2, y2] = curva(Math.min(1, kv + 0.01));
    abelha(c, x, y, Math.atan2(y2 - y, x2 - x) + Math.PI / 2, 54 / s, u, { abertura: 1, bate: true });
  },

  flor(c, u, d) { // polinização: pousa, o pólen voa; depois as pétalas caem e as flores viram fruto
    const img = ATV.galho, F = PECA.galho.flores.map((f) => P_(img, ...f));
    vista(c, img, img.width * lerp(0.47, 0.5, u / d.dura), img.height * 0.47, 1.12 + 0.05 * (u / d.dura));
    const ih = img.height, para = (i) => F[i];
    // a abelha: chega, paira na flor do meio, passa para a de cima
    const k1 = fase(u, 0, 1.5), k2 = fase(u, 2.6, 3.6), a = para(1), b = para(2);
    const x = k2 > 0 ? lerp(a[0], b[0], k2) : lerp(-img.width * 0.05, a[0], k1), y = (k2 > 0 ? lerp(a[1], b[1], k2) : lerp(ih * 0.3, a[1], k1)) - ih * 0.03 + Math.sin(u * 7) * ih * 0.006;
    const kfr = fase(u, 4.2, 6.6);
    if (u < 5.2) abelha(c, x, y, k2 > 0 && k2 < 1 ? 0.6 : 0.3 + Math.sin(u * 3) * 0.1, ih * 0.13, u, { abertura: 1, bate: true, alpha: 1 - fase(u, 4.6, 5.2) });
    const r = rng(8); // pólen: grãos amarelos que saltam da flor quando ela pousa
    for (let i = 0; i < 40; i++) {
      const t0 = 1.4 + r() * 1.6, q = (u - t0) / 1.2, ang = r() * Math.PI * 2, v = ih * (0.02 + r() * 0.05);
      if (q <= 0 || q >= 1) continue;
      c.fillStyle = `rgba(255,205,60,${1 - q})`; c.beginPath(); c.arc(a[0] + Math.cos(ang) * v * q, a[1] + Math.sin(ang) * v * q + q * q * ih * 0.03, ih * 0.004, 0, Math.PI * 2); c.fill();
    }
    for (let i = 0; i < 12; i++) { // pétalas caindo e girando
      const f = F[i % 3], t0 = 4.0 + r() * 1.4, q = (u - t0) / 2.2;
      if (q <= 0 || q >= 1) continue;
      sprite(c, ATV.petala, f[0] + Math.sin(q * 5 + i) * ih * 0.03 + q * ih * 0.05, f[1] + q * q * ih * 0.6, ih * 0.05, q * 6 + i, 1 - q * q);
    }
    F.forEach((f, i) => { const k = clamp(kfr * 1.3 - i * 0.15); if (k > 0) sprite(c, ATV.fruto, f[0], f[1] + ih * 0.01, ih * 0.09 * k, -0.3 + i * 0.2, k); });
    return { poeira: "255,250,235" };
  },

  danca(c, u, d) { // o requebrado: corre reto requebrando, volta em arco; a seta e o sol dizem a direção
    const th = -0.6, cx = ALVO.x + 500, cy = ALVO.y + 60, cam = { x: cx, y: cy };
    cam.s = vista(c, ATV.favo, cx, cy, 1.9);
    brilhoMel(c, cam, u, 0.7);
    const run = 520, ciclo = 1.5, q = (u % ciclo) / ciclo, lado = Math.floor(u / ciclo) % 2 ? 1 : -1;
    const dir = [Math.sin(th), -Math.cos(th)], ini = [cx - (dir[0] * run) / 2, cy - (dir[1] * run) / 2];
    let x, y, ang;
    if (q < 0.55) { const k = q / 0.55; x = ini[0] + dir[0] * run * k; y = ini[1] + dir[1] * run * k; ang = th + Math.sin(u * 2 * Math.PI * 13) * 0.3; }
    else { const k = (q - 0.55) / 0.45, a0 = Math.atan2(dir[1], dir[0]); const al = a0 + lado * Math.PI * k; x = cx + Math.cos(al) * run * 0.5 + lado * -dir[1] * run * 0.35 * Math.sin(Math.PI * k); y = cy + Math.sin(al) * run * 0.5 + lado * dir[0] * run * 0.35 * Math.sin(Math.PI * k); ang = al + Math.PI / 2 + lado * Math.PI / 2; }
    [0, 1, 2, 3, 4].forEach((i) => { const a = (i / 5) * Math.PI * 2 + 0.4, r = 620; const bx = cx + Math.cos(a) * r, by = cy + Math.sin(a) * r * 0.8; abelha(c, bx, by, Math.atan2(cy - by, cx - bx) + Math.PI / 2 + Math.sin(u * 2 + i) * 0.08, 540, u, { sombra: 1 }); });
    abelha(c, x, y, ang, 560, u, { sombra: 1, abertura: 0.3, bate: q < 0.55 });
    const ks = fase(u, d.fala.t0 + 1.3, d.fala.t0 + 2.3); // a seta da corrida e o ângulo com o "para cima" (o sol)
    if (ks > 0) {
      const fim = [ini[0] + dir[0] * run * 1.3, ini[1] + dir[1] * run * 1.3];
      hexLuz(c, [ini, fim, [fim[0] - 60 * Math.sin(th + 0.5), fim[1] + 60 * Math.cos(th + 0.5)], fim, [fim[0] - 60 * Math.sin(th - 0.5), fim[1] + 60 * Math.cos(th - 0.5)]], ks, 0.8);
      linhaGiz(c, () => { c.setLineDash([16, 14]); c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy - run * 0.9); c.stroke(); c.setLineDash([]); c.beginPath(); c.arc(cx, cy, run * 0.35, -Math.PI / 2, -Math.PI / 2 + th, true); c.stroke();
        c.beginPath(); c.arc(cx, cy - run * 1.05, 34, 0, Math.PI * 2); c.stroke(); for (let j = 0; j < 8; j++) { const a = (j * Math.PI) / 4; c.moveTo(cx + Math.cos(a) * 48, cy - run * 1.05 + Math.sin(a) * 48); c.lineTo(cx + Math.cos(a) * 66, cy - run * 1.05 + Math.sin(a) * 66); } c.stroke(); }, 5, ks);
    }
  },

  mel(c, u, d) { // o néctar passa de boca em boca; depois uma célula vazia se enche de mel
    const vazia = perto("vazia", ALVO.x + 400, ALVO.y - 300, 1)[0], fonte = perto("mel", vazia.x, vazia.y, 1)[0];
    const a = [ALVO.x - 150, ALVO.y - 250], k = fase(u, 2.0, 3.0);
    const cam = { x: lerp(a[0], vazia.x, k), y: lerp(a[1], vazia.y, k) };
    cam.s = vista(c, ATV.favo, cam.x, cam.y, 2.3);
    brilhoMel(c, cam, u);
    const enche = fase(u, 2.6, 4.2), R = M.r * 0.86;
    if (enche > 0) {
      c.save(); c.beginPath(); hexPts6(vazia.x, vazia.y, R).forEach(([x, y], j) => (j ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
      const e = R * lerp(0.4, 1, enche); c.globalAlpha = enche;
      c.drawImage(ATV.favo, fonte.x - R, fonte.y - R, R * 2, R * 2, vazia.x - e, vazia.y - e, e * 2, e * 2); c.restore();
    }
    abelha(c, a[0] - 300, a[1], Math.PI / 2, 560, u, { sombra: 1 });
    abelha(c, a[0] + 300, a[1], -Math.PI / 2, 560, u, { sombra: 1 });
    const gx = a[0], gy = a[1] + 0, pulso = 0.6 + 0.4 * Math.sin(u * 6), g = c.createRadialGradient(gx, gy, 0, gx, gy, 30); // a gota entre as bocas
    g.addColorStop(0, `rgba(255,220,120,${pulso})`); g.addColorStop(0.6, `rgba(230,150,30,${0.8 * pulso})`); g.addColorStop(1, "rgba(200,120,20,0)");
    c.fillStyle = g; c.beginPath(); c.arc(gx, gy, 30, 0, Math.PI * 2); c.fill();
  },

  dias(c, u, d) { // seis semanas: dia e noite girando atrás do tronco, os risquinhos contando os dias
    const ciclos = 6, f = (u / d.dura) * ciclos, luz = 0.5 + 0.5 * Math.cos(f * Math.PI * 2);
    c.setTransform(1, 0, 0, 1, 0, 0);
    const ceu = c.createLinearGradient(0, 0, 0, H);
    ceu.addColorStop(0, `rgb(${lerp(20, 120, luz)},${lerp(34, 175, luz)},${lerp(70, 220, luz)})`); ceu.addColorStop(1, `rgb(${lerp(40, 225, luz)},${lerp(55, 228, luz)},${lerp(90, 205, luz)})`);
    c.fillStyle = ceu; c.fillRect(0, 0, W, H);
    const r = rng(3);
    for (let i = 0; i < 120; i++) { c.fillStyle = `rgba(255,250,230,${(1 - luz) * (0.4 + 0.6 * r())})`; c.fillRect(r() * W, r() * H * 0.7, 2, 2); }
    const a = (f % 1) * Math.PI * 2, ax = W / 2 + Math.cos(a - Math.PI / 2) * W * 0.42, ay = H * 0.75 + Math.sin(a - Math.PI / 2) * H * 0.6; // sol e lua em arco
    c.fillStyle = luz > 0.5 ? "#ffd86a" : "#f4f0e0"; c.beginPath(); c.arc(ax, ay, H * 0.035, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(W - ax, H * 1.5 - ay, H * 0.03, 0, Math.PI * 2); c.fillStyle = "#f4f0e0"; c.fill();
    vista(c, ATV.tronco, ATV.tronco.width / 2, ATV.tronco.height / 2, 1.0 + 0.03 * (u / d.dura));
    c.setTransform(1, 0, 0, 1, 0, 0);
    const dias = Math.floor(clamp(u / (d.dura - 0.6)) * 42), L = (H / 1080) * 4; // 42 risquinhos em grupos de cinco
    linhaGiz(c, () => { c.beginPath(); for (let n = 0; n < dias; n++) { const g = Math.floor(n / 5), p = n % 5, x0 = W * 0.6 + (g % 5) * W * 0.07, y0 = H * 0.08 + Math.floor(g / 5) * H * 0.1;
      if (p < 4) { c.moveTo(x0 + p * W * 0.011, y0); c.lineTo(x0 + p * W * 0.011, y0 + H * 0.06); } else { c.moveTo(x0 - W * 0.006, y0 + H * 0.05); c.lineTo(x0 + W * 0.04, y0 + H * 0.01); } } c.stroke(); }, L);
    return { poeira: false };
  },

  fim(c, u, d) { // e tudo começa de novo: de volta à célula do começo, com o ovo
    const cam = { x: ALVO.x, y: ALVO.y }; cam.s = vista(c, ATV.favo, cam.x, cam.y, 2.6 + 0.6 * (u / d.dura));
    brilhoMel(c, cam, u);
    hexLuz(c, hexPts6(ALVO.x, ALVO.y, M.r * 0.97), fase(u, 0.4, 1.4));
    sprite(c, ATV.ovo, ALVO.x, ALVO.y, M.r * 0.55, 0.15, fase(u, 1.0, 1.8));
  },
};
