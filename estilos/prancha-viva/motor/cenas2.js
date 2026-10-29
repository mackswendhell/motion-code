// Prancha Viva, atos 4 a 13 do ciclo da abelha. Carregado depois de cena.js; usa as peças de lá.

let MAPA, CEU, GALHO, TRONCO, FAVOMEL;
const FLORES = [[0.47, 0.5], [0.6, 0.4], [0.74, 0.31], [0.34, 0.62], [0.86, 0.22], [0.54, 0.6]];

function mix(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const x = p(a), y = p(b);
  return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], k))).join(",")})`;
}
function sombra(c, desenha, blur = 12, cor = "rgba(70,30,0,0.35)") {
  c.save(); c.filter = `blur(${blur}px)`; c.fillStyle = cor; desenha(); c.restore();
}
// centro da fala dividido em n batidas (para sincronizar com palavras)
function batida(a, u, n) {
  const f = a.fala, f0 = f.t0 - a.t0, f1 = f.t1 - a.t0;
  return Math.max(0, Math.min(n - 1, Math.floor(((u - f0) / (f1 - f0)) * n)));
}

// ---------- larva em C ----------
function larvaC(c, x, y, s, curva, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const N = 13, R = 70, a0 = -curva / 2;
  const pts = [...Array(N)].map((_, i) => { const a = a0 + (curva * i) / (N - 1); return [Math.cos(a) * R, Math.sin(a) * R, a]; });
  sombra(c, () => pts.forEach(([px, py]) => { c.beginPath(); c.arc(px + 8, py + 10, 30, 0, Math.PI * 2); c.fill(); }), 10);
  pts.forEach(([px, py, a], i) => {
    const rr = 20 + 16 * Math.sin((Math.PI * (i + 0.5)) / N);
    const g = c.createRadialGradient(px - rr * 0.35, py - rr * 0.4, 2, px, py, rr);
    g.addColorStop(0, "#fffdf6"); g.addColorStop(0.7, "#f3e8d2"); g.addColorStop(1, "#d6c09a");
    c.fillStyle = g;
    c.beginPath(); c.arc(px, py, rr, 0, Math.PI * 2); c.fill();
    const nx = Math.cos(a), ny = Math.sin(a), tx = -ny, ty = nx;
    c.strokeStyle = "rgba(150,112,64,0.55)"; c.lineWidth = 1.5; // dobra entre os anéis
    c.beginPath(); c.moveTo(px - nx * rr * 0.85, py - ny * rr * 0.85);
    c.quadraticCurveTo(px + tx * 7, py + ty * 7, px + nx * rr * 0.85, py + ny * rr * 0.85); c.stroke();
    c.fillStyle = "rgba(170,120,60,0.6)"; // espiráculo
    c.beginPath(); c.arc(px + nx * rr * 0.55, py + ny * rr * 0.55, 1.8, 0, Math.PI * 2); c.fill();
  });
  const [hx, hy] = pts[N - 1];
  c.fillStyle = "#e9d6b0";
  c.beginPath(); c.arc(hx, hy, 16, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#8a5a2a";
  c.beginPath(); c.arc(hx + 6, hy + 6, 3, 0, Math.PI * 2); c.fill();
  c.restore();
}

// ---------- pupa de lado (cabeça para cima), k de 0 (pré-pupa) a 1 (abelha formada) ----------
function pupa(c, x, y, s, k, fantasma = false) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const m = seg(k, 0.25, 0.65);
  const corpo = k < 0.75 ? mix("#f8efdc", "#e6dccb", k / 0.75) : mix("#e6dccb", "#b9ad9a", (k - 0.75) / 0.25);
  const contorno = fantasma ? "rgba(246,233,201,0.5)" : "rgba(120,90,55,0.7)";
  const forma = (desenha) => {
    if (fantasma) { c.strokeStyle = contorno; c.lineWidth = 2; desenha(); c.stroke(); return; }
    c.fillStyle = corpo; desenha(); c.fill(); c.strokeStyle = contorno; c.lineWidth = 1.6; c.stroke();
  };
  // abdômen em anéis, afinando
  for (let i = 6; i >= 0; i--) {
    const yy = lerp(-120, 40, m) + i * lerp(42, 36, m), w = lerp(66, 74 - i * 7, m);
    forma(() => { c.beginPath(); c.ellipse(0, yy, w, 28, 0, 0, Math.PI * 2); });
    if (!fantasma && k > 0.85) { c.fillStyle = `rgba(90,60,30,${(k - 0.85) * 2})`; c.beginPath(); c.ellipse(0, yy + 8, w * 0.95, 9, 0, 0, Math.PI); c.fill(); }
  }
  if (m > 0) {
    c.globalAlpha = fantasma ? 1 : m;
    forma(() => { c.beginPath(); c.ellipse(0, -90, 72, 70, 0, 0, Math.PI * 2); }); // tórax
    forma(() => { c.beginPath(); c.ellipse(0, -200, 58, 54, 0, 0, Math.PI * 2); }); // cabeça
    if (!fantasma) {
      c.strokeStyle = mix("#d8ccb6", "#7a6a55", k); c.lineWidth = 7; c.lineCap = "round"; // pernas dobradas na frente
      for (let p = 0; p < 3; p++) { c.beginPath(); c.moveTo(40, -100 + p * 22); c.quadraticCurveTo(84, -40 + p * 30, 52, 60 + p * 40); c.stroke(); }
      c.fillStyle = "rgba(255,255,255,0.35)"; c.strokeStyle = contorno; c.lineWidth = 1.2; // broto da asa
      c.beginPath(); c.ellipse(-46, -20, 26, 80, 0.15, 0, Math.PI * 2); c.fill(); c.stroke();
      const olho = k < 0.5 ? "#f4efe6" : k < 0.65 ? mix("#f4efe6", "#e383bd", (k - 0.5) / 0.15) : k < 0.8 ? mix("#e383bd", "#7a4a9a", (k - 0.65) / 0.15) : mix("#7a4a9a", "#3a2414", (k - 0.8) / 0.2);
      c.fillStyle = olho;
      c.beginPath(); c.ellipse(18, -206, 26, 36, 0.2, 0, Math.PI * 2); c.fill();
      c.fillStyle = "rgba(255,255,255,0.45)";
      c.beginPath(); c.ellipse(12, -218, 7, 10, 0.2, 0, Math.PI * 2); c.fill();
      c.strokeStyle = contorno; c.lineWidth = 4; // antena colada no rosto
      c.beginPath(); c.moveTo(30, -236); c.quadraticCurveTo(70, -230, 62, -150); c.stroke();
    }
    c.globalAlpha = 1;
  }
  c.restore();
}

// ---------- flor de macieira ----------
function flor(c, x, y, s, rot, petala, fruto, seed) {
  const r = rng(seed);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5, q = petala[i];
    if (q.alpha <= 0) continue;
    c.save();
    c.translate(q.dx, q.dy); c.rotate(a + q.giro); c.globalAlpha = q.alpha;
    c.beginPath(); c.moveTo(0, 0);
    c.bezierCurveTo(-30, -20, -34, -62, 0, -70); c.bezierCurveTo(34, -62, 30, -20, 0, 0);
    const g = c.createLinearGradient(0, 0, 0, -70);
    g.addColorStop(0, "#fff6f2"); g.addColorStop(0.7, "#ffffff"); g.addColorStop(1, "#f6b6c9");
    c.fillStyle = g; c.fill();
    c.strokeStyle = "rgba(170,110,120,0.45)"; c.lineWidth = 1.2; c.stroke();
    c.strokeStyle = "rgba(200,150,160,0.35)"; c.lineWidth = 0.8;
    for (let v = -2; v <= 2; v++) { c.beginPath(); c.moveTo(0, -6); c.quadraticCurveTo(v * 6, -36, v * 10, -60); c.stroke(); }
    c.restore();
  }
  if (fruto > 0) { // o centro incha e vira maçã
    const fr = 10 + 30 * fruto;
    const g = c.createRadialGradient(-fr * 0.3, -fr * 0.35, 2, 0, 0, fr);
    g.addColorStop(0, mix("#c8e07a", "#ffb08a", fruto)); g.addColorStop(0.6, mix("#8fbf4a", "#d9503a", fruto)); g.addColorStop(1, mix("#5f8f2a", "#9a2a1a", fruto));
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, fr, 0, Math.PI * 2); c.fill();
    c.fillStyle = "rgba(255,255,255,0.45)"; c.beginPath(); c.ellipse(-fr * 0.35, -fr * 0.4, fr * 0.22, fr * 0.12, -0.6, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#5a3a1a"; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -fr * 0.8); c.lineTo(2, -fr * 1.1); c.stroke();
  } else {
    c.fillStyle = "#d9e27a"; c.beginPath(); c.arc(0, 0, 12, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 16; i++) { // estames
      const a = r() * Math.PI * 2, l = 16 + r() * 10;
      c.strokeStyle = "#e9e0a0"; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * l, Math.sin(a) * l); c.stroke();
      c.fillStyle = "#f2b42a"; c.beginPath(); c.arc(Math.cos(a) * l, Math.sin(a) * l, 2.6, 0, Math.PI * 2); c.fill();
    }
  }
  c.restore();
}
function folha(c, x, y, s, rot, r) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-26, -30, -20, -80, 0, -100); c.bezierCurveTo(20, -80, 26, -30, 0, 0);
  const g = c.createLinearGradient(-20, 0, 20, -100);
  g.addColorStop(0, "#4f8f3a"); g.addColorStop(1, "#9ccf5a");
  c.fillStyle = g; c.fill();
  c.strokeStyle = "rgba(30,60,20,0.5)"; c.lineWidth = 1.2; c.stroke();
  c.strokeStyle = "rgba(220,240,180,0.6)"; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -96); c.stroke();
  for (let v = 1; v < 6; v++) { c.beginPath(); c.moveTo(0, -v * 15); c.lineTo(-14, -v * 15 - 10); c.moveTo(0, -v * 15); c.lineTo(14, -v * 15 - 10); c.stroke(); }
  c.restore();
}

// ---------- cenários pré-pintados ----------
function fazerMapa() {
  const m = tela(W, H), c = m.getContext("2d"), r = rng(41);
  const g = c.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#b8d98a"); g.addColorStop(1, "#8fbf68");
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  aquarela(c, W, H, ["#a7cf72", "#cfe39a", "#7fae58", "#d9d98a"], 30, 0.3, r);
  c.save(); c.globalAlpha = 0.18; // fileiras de plantação
  for (let i = 0; i < 40; i++) { c.strokeStyle = "#5f8f3a"; c.lineWidth = 2; c.beginPath(); c.moveTo(W * 0.05, H * 0.7 + i * 9); c.lineTo(W * 0.4, H * 0.62 + i * 9); c.stroke(); }
  c.restore();
  c.lineCap = "round"; // rio
  c.strokeStyle = "#5fa6cf"; c.lineWidth = 46;
  c.beginPath(); c.moveTo(W * 0.92, -20); c.bezierCurveTo(W * 0.78, H * 0.3, W * 0.98, H * 0.6, W * 0.82, H + 20); c.stroke();
  c.strokeStyle = "#9fd0ea"; c.lineWidth = 14; c.stroke();
  for (let i = 0; i < 26; i++) { // capões de árvore
    const x = r() * W * 0.75, y = r() * H, rr = 18 + r() * 34;
    sombra(c, () => { c.beginPath(); c.arc(x + 8, y + 10, rr, 0, Math.PI * 2); c.fill(); }, 6, "rgba(30,60,10,0.35)");
    c.fillStyle = ["#4f8f3a", "#3f7a30", "#5f9f42"][i % 3]; c.beginPath(); c.arc(x, y, rr, 0, Math.PI * 2); c.fill();
    for (let p = 0; p < 40; p++) { c.fillStyle = r() < 0.5 ? "rgba(200,240,150,0.35)" : "rgba(20,50,10,0.3)"; c.beginPath(); c.arc(x + (r() - 0.5) * rr * 1.6, y + (r() - 0.5) * rr * 1.6, 2, 0, Math.PI * 2); c.fill(); }
  }
  const manchas = [[0.72, 0.3, "#ffffff"], [0.6, 0.18, "#e383bd"], [0.5, 0.42, "#f2c94b"], [0.66, 0.55, "#9a7ad0"], [0.38, 0.22, "#e8775a"]];
  manchas.forEach(([fx, fy, cor]) => { // canteiros de flor: pontinhos coloridos
    for (let p = 0; p < 160; p++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 60;
      c.fillStyle = cor; c.beginPath(); c.arc(W * fx + Math.cos(a) * d, H * fy + Math.sin(a) * d * 0.7, 2.5 + r() * 2, 0, Math.PI * 2); c.fill();
    }
  });
  // colmeia: caixa de madeira vista de cima
  const hx = W * 0.2, hy = H * 0.66;
  sombra(c, () => c.fillRect(hx - 40 + 10, hy - 30 + 12, 80, 60), 6, "rgba(30,40,10,0.45)");
  c.fillStyle = "#c98a42"; c.fillRect(hx - 40, hy - 30, 80, 60);
  c.strokeStyle = "#7a4a1a"; c.lineWidth = 2;
  for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(hx - 40, hy - 30 + i * 15); c.lineTo(hx + 40, hy - 30 + i * 15); c.stroke(); }
  c.strokeRect(hx - 40, hy - 30, 80, 60);
  return m;
}
function fazerCeu() {
  const m = tela(W, H), c = m.getContext("2d"), r = rng(51);
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#8fc6e6"); g.addColorStop(0.62, "#d8eef0"); g.addColorStop(0.75, "#e9f2dc");
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 7; i++) { // nuvens de aquarela
    const x = r() * W, y = H * (0.08 + r() * 0.3);
    for (let b = 0; b < 6; b++) {
      const bx = x + (b - 3) * 40 + r() * 20, by = y + (r() - 0.5) * 22, br = 30 + r() * 40;
      c.fillStyle = "rgba(255,255,255,0.75)";
      caminho(c, tremido([...Array(10)].map((_, k) => [bx + Math.cos(k * 0.628) * br, by + Math.sin(k * 0.628) * br * 0.6]), 3, r, 3)); c.fill();
    }
  }
  c.fillStyle = "#a7c98a"; // morros ao longe
  c.beginPath(); c.moveTo(0, H * 0.72);
  for (let x = 0; x <= W; x += 40) c.lineTo(x, H * 0.7 - Math.sin(x / 210) * 18 - Math.sin(x / 77) * 6);
  c.lineTo(W, H); c.lineTo(0, H); c.fill();
  for (let i = 0; i < 90; i++) { c.fillStyle = r() < 0.5 ? "#6f9f5a" : "#8ab36a"; c.beginPath(); c.arc(r() * W, H * (0.7 + r() * 0.04), 5 + r() * 7, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = "#8fbf62"; c.fillRect(0, H * 0.78, W, H * 0.22);
  aquarela(c, W, H * 0.25, ["#7fb052", "#a6cf6a", "#c9d97a"], 20, 0.25, r);
  return m;
}
function fazerGalho() {
  const m = tela(W, H), c = m.getContext("2d"), r = rng(61);
  const p0 = [-40, H * 0.86], p1 = [W * 0.45, H * 0.5], p2 = [W + 40, H * 0.12];
  c.lineCap = "round";
  for (const [larg, cor] of [[48, "#5a3a20"], [40, "#7a5232"], [10, "#a07a52"]]) {
    c.strokeStyle = cor; c.lineWidth = larg;
    c.beginPath(); c.moveTo(...p0); c.quadraticCurveTo(...p1, ...p2); c.stroke();
  }
  for (let i = 0; i < 500; i++) { // casca: risquinhos ao longo do galho
    const k = r(), x = (1 - k) ** 2 * p0[0] + 2 * (1 - k) * k * p1[0] + k * k * p2[0], y = (1 - k) ** 2 * p0[1] + 2 * (1 - k) * k * p1[1] + k * k * p2[1];
    c.strokeStyle = r() < 0.5 ? "rgba(40,20,5,0.5)" : "rgba(200,170,130,0.4)"; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(x + (r() - 0.5) * 30, y + (r() - 0.5) * 30); c.lineTo(x + 14, y - 8); c.stroke();
  }
  FLORES.forEach(([fx, fy], i) => { // raminhos e folhas de cada flor
    c.strokeStyle = "#6a4a2a"; c.lineWidth = 7;
    c.beginPath(); c.moveTo(W * fx - 20, H * fy + 40); c.lineTo(W * fx, H * fy); c.stroke();
    folha(c, W * fx + 30, H * fy + 30, 0.7, 1.9 + i * 0.3, r);
    folha(c, W * fx - 40, H * fy + 20, 0.6, -1.4 - i * 0.2, r);
  });
  return m;
}
function fazerTronco() {
  const m = tela(W, H), c = m.getContext("2d"), r = rng(71);
  const x0 = W * 0.16, x1 = W * 0.48;
  const g = c.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, "#5a3e28"); g.addColorStop(0.4, "#8a6a4a"); g.addColorStop(1, "#4a3220");
  c.fillStyle = g; c.fillRect(x0, 0, x1 - x0, H);
  for (let i = 0; i < 260; i++) { // casca: sulcos verticais ondulados
    const x = x0 + r() * (x1 - x0), y = r() * H, l = 40 + r() * 140;
    c.strokeStyle = r() < 0.6 ? "rgba(30,15,5,0.45)" : "rgba(220,190,150,0.3)"; c.lineWidth = 1 + r() * 2;
    c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 8, y + l * 0.3, x - 8, y + l * 0.6, x + 3, y + l); c.stroke();
  }
  const hx = (x0 + x1) / 2, hy = H * 0.45; // a toca da colmeia
  c.fillStyle = "#c9a37a"; c.beginPath(); c.ellipse(hx, hy, 86, 108, 0, 0, Math.PI * 2); c.fill();
  const gh = c.createRadialGradient(hx + 10, hy + 14, 10, hx, hy, 92);
  gh.addColorStop(0, "#4a2a12"); gh.addColorStop(1, "#24140a");
  c.fillStyle = gh; c.beginPath(); c.ellipse(hx, hy, 70, 92, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "rgba(250,220,170,0.4)"; c.lineWidth = 3; c.beginPath(); c.ellipse(hx, hy, 78, 100, 0, Math.PI * 0.9, Math.PI * 1.6); c.stroke();
  return m;
}
const MEL_R = 130;
function fazerFavoMel() { // favo cheio de mel, com as células conhecidas para animar por cima
  const f = tela(W * 1.15, H * 1.15), c = f.getContext("2d"), r = rng(81);
  c.fillStyle = COR.parede[0]; c.fillRect(0, 0, f.width, f.height);
  aquarela(c, f.width, f.height, ["#f7d98a", "#c98a32", "#e8b04e"], 30, 0.25, r);
  const R = MEL_R, dx = R * 1.5, dy = R * Math.sqrt(3);
  for (let q = -1; q * dx < f.width + R; q++) for (let k = -1; k * dy < f.height + R; k++) {
    const x = q * dx, y = k * dy + (q % 2 ? dy / 2 : 0), rr = rng(q * 77 + k * 13 + 5);
    celula(c, x, y, R, rr, rr() < 0.7 ? "mel" : "tampa");
  }
  return f;
}

// ---------- cenas ----------
Object.assign(CENAS, {
  larva(u, d) {
    ctx.save();
    ctx.translate(W / 2, H / 2); ctx.scale(2.2, 2.2);
    ctx.drawImage(FAVO, -FAVO.width / 2, -FAVO.height / 2);
    ctx.restore();
    ctx.fillStyle = "rgba(90,40,0,0.3)"; ctx.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, R = 400, r = rng(91);
    ctx.save(); // célula grande vista de cima
    caminho(ctx, hexPts(cx, cy, R)); ctx.fillStyle = COR.parede[0]; ctx.fill();
    caminho(ctx, hexPts(cx, cy, R * 0.86)); ctx.clip();
    const g = ctx.createRadialGradient(cx - 60, cy - 80, 20, cx, cy, R);
    g.addColorStop(0, "#c98a3a"); g.addColorStop(1, "#6a3a10");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    hachura(ctx, cx, cy - R, R, R * 2, 6, 0.8, "rgba(40,15,0,0.2)", 1, r);
    ctx.fillStyle = "rgba(255,248,225,0.85)"; // geleia: a cama de comida
    ctx.beginPath(); ctx.ellipse(cx + 10, cy + 20, 290, 260, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath(); ctx.ellipse(cx - 50, cy - 40, 50, 18, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    tinta(ctx, () => { caminho(ctx, hexPts(cx, cy, R * 0.86)); ctx.stroke(); }, "#5a3410", 4);
    const cresce = seg(u, 0, d);
    larvaC(ctx, cx + 10, cy + 20, lerp(1.5, 2.4, cresce), lerp(3.4, 4.6, cresce), u * 0.08);
    // as irmãs entram e saem para alimentar, alternando os lados
    for (let v = 0; v < 4; v++) {
      const t0 = 0.3 + v * 0.95, k = Math.sin(Math.PI * Math.min(1, Math.max(0, (u - t0) / 1.1)));
      if (k <= 0) continue;
      const lado = v % 2 ? 1 : -1; // uma entra pela direita de cima, a outra pela esquerda de baixo
      const ox = cx + lado * lerp(900, 470, k), oy = cy - lado * lerp(380, 230, k);
      abelha(ctx, ox, oy, Math.atan2(cy - oy, cx - ox) + Math.PI / 2, 1.0, u + v, 5 + v);
    }
  },

  pupa(u, d) {
    ctx.drawImage(DIAGRAMA, 0, 0);
    const cx = W / 2, top = H * 0.1, bot = H * 0.92, lw = 210;
    for (const lado of [-1, 1]) { // paredes de cera em corte
      const x = cx + lado * lw;
      ctx.save();
      ctx.fillStyle = "rgba(242,184,75,0.55)";
      ctx.fillRect(lado < 0 ? x - 46 : x, top, 46, bot - top);
      hachura(ctx, lado < 0 ? x - 46 : x, top, 46, bot - top, 7, -0.8, "rgba(120,70,20,0.35)", 1, rng(lado + 3));
      ctx.restore();
      tinta(ctx, () => { ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bot); ctx.stroke(); }, COR.creme, 2.4);
    }
    tinta(ctx, () => { ctx.beginPath(); ctx.moveTo(cx - lw, bot); ctx.quadraticCurveTo(cx, bot + 60, cx + lw, bot); ctx.stroke(); }, COR.creme, 2.4);
    const kt = seg(u, 0.4, 1.8); // a tampa de cera fecha a célula, das bordas para o centro
    if (kt > 0) {
      ctx.fillStyle = "#e6c27a";
      for (const lado of [-1, 1]) ctx.fillRect(lado < 0 ? cx - lw : cx + lw - lw * kt, top - 14, lw * kt, 30);
      tinta(ctx, () => { ctx.beginPath(); ctx.moveTo(cx - lw, top - 14); ctx.lineTo(cx - lw + lw * kt, top - 14); ctx.moveTo(cx + lw, top - 14); ctx.lineTo(cx + lw - lw * kt, top - 14); ctx.stroke(); }, "#8a5a2a", 2);
    }
    const k = seg(u, 2.0, d - 0.3);
    const alto = Math.min(1.6, Math.max(1, H / W * 0.9)); // em 16:9 e 1:1 fica 1; em 9:16 aproveita a altura
    pupa(ctx, W * 0.17, H * 0.55, 0.62 * alto, 0.1, true); // silhuetas-fantasma: de onde veio, para onde vai
    pupa(ctx, W * 0.83, H * 0.55, 0.62 * alto, 1, true);
    pupa(ctx, cx, H * 0.55, 1.15 * alto, k);
  },

  nascimento(u, d) {
    const z = lerp(2.4, 1.0, seg(u, 0.2, d));
    ctx.save();
    ctx.translate(W / 2, H / 2); ctx.scale(z, z);
    ctx.drawImage(FAVO, -FAVO.width / 2, -FAVO.height / 2);
    const R = FAVO_R * 0.83, r = rng(101);
    ctx.save(); // tampa nova na célula do meio
    caminho(ctx, hexPts(0, 0, R)); ctx.clip();
    const g = ctx.createRadialGradient(-20, -24, 4, 0, 0, R);
    g.addColorStop(0, "#fff1c8"); g.addColorStop(1, "#c99a4a");
    ctx.fillStyle = g; ctx.fillRect(-R, -R, R * 2, R * 2);
    const kb = seg(u, 0.3, 1.8); // ela rói a tampa por dentro
    if (kb > 0) {
      ctx.fillStyle = "#3a200a";
      caminho(ctx, tremido([...Array(10)].map((_, i) => [Math.cos(i * 0.628) * R * 0.85 * kb, Math.sin(i * 0.628) * R * 0.85 * kb]), 6 * kb, r, 3)); ctx.fill();
    }
    ctx.restore();
    const ks = seg(u, 1.2, 3.2); // sai: primeiro as antenas e a cabeça, depois o corpo todo
    if (ks > 0) {
      ctx.save();
      if (ks < 0.5) { caminho(ctx, hexPts(0, 0, R * 0.85)); ctx.clip(); }
      abelha(ctx, lerp(0, 40, seg(ks, 0.5, 1)), lerp(150, -60, ks), 0.2, lerp(0.42, 0.62, ks), u, 9);
      ctx.restore();
    }
    for (let i = 0; i < 18; i++) { // farelos de cera
      const a = i * 2.1, dd = 30 + seg(u, 0.5, 2.5) * (40 + (i % 5) * 18);
      ctx.fillStyle = "rgba(250,225,160,0.9)";
      ctx.fillRect(Math.cos(a) * dd, Math.sin(a) * dd, 3, 3);
    }
    ctx.restore();
  },

  trabalho(u, d, a) {
    const b = u < a.fala.t0 - a.t0 ? 0 : batida(a, u, 4);
    const alvos = [[-260, -120], [240, -80], [-200, 160], [260, 170]];
    const fu0 = a.fala.t0 - a.t0, fd = (a.fala.t1 - a.fala.t0) / 4, tb = fu0 + b * fd;
    const ant = alvos[Math.max(0, b - 1)], al = alvos[b], kp = b ? seg(u, tb, tb + 0.3) : 1;
    const cam = [lerp(ant[0], al[0], kp), lerp(ant[1], al[1], kp)];
    ctx.save();
    ctx.translate(W / 2, H / 2); ctx.scale(1.5, 1.5); ctx.translate(-cam[0], -cam[1]);
    ctx.drawImage(FAVO, -FAVO.width / 2, -FAVO.height / 2);
    const [bx, by] = al, du = u - tb;
    if (b === 0) { // limpa: farelos voando da célula
      for (let i = 0; i < 24; i++) {
        const ang = i * 0.9, dd = ((du * 120 + i * 17) % 160);
        ctx.fillStyle = `rgba(90,50,15,${1 - dd / 160})`; ctx.fillRect(bx + 40 + Math.cos(ang) * dd, by - 40 + Math.sin(ang) * dd, 4, 4);
      }
    } else if (b === 1) larvaC(ctx, bx + 70, by - 80, 0.45, 4, 0); // alimenta
    else if (b === 2) { // constrói: células novas se traçando em cera
      [[150, 0], [150 + FAVO_R * 1.5, FAVO_R * 0.87], [150 + FAVO_R * 1.5, -FAVO_R * 0.87]].forEach(([ox, oy], i) => {
        const k = seg(du, i * 0.2, i * 0.2 + 0.6);
        if (k > 0) tinta(ctx, () => tracar(ctx, hexPts(bx + ox, by + oy, FAVO_R * 0.9), k), "#fff3c8", 5);
      });
    } else { // vigia: ondas de alerta
      for (let i = 0; i < 3; i++) {
        const rr = 120 + ((du * 140 + i * 60) % 180);
        ctx.strokeStyle = `rgba(232,119,90,${1 - (rr - 120) / 180})`; ctx.lineWidth = 4; ctx.setLineDash([14, 10]);
        ctx.beginPath(); ctx.arc(bx, by, rr, -1.2, 1.2); ctx.stroke(); ctx.setLineDash([]);
      }
    }
    abelha(ctx, bx, by, [0.9, -0.8, 1.57, 1.57][b], 0.75, u * 2, 11);
    ctx.restore();
  },

  voo(u, d) {
    const hx = W * 0.2, hy = H * 0.66, fx = W * 0.72, fy = H * 0.3;
    const z = lerp(1, 4.5, seg(u, d - 1.0, d)); // no fim mergulha no canteiro de flores
    ctx.save();
    ctx.translate(fx, fy); ctx.scale(z, z); ctx.translate(-fx, -fy);
    ctx.drawImage(MAPA, 0, 0);
    const k = seg(u, 0.5, d - 0.8);
    const pt = (q) => { const c1 = [W * 0.3, H * 0.15], c2 = [W * 0.55, H * 0.75];
      return [0, 1].map((i) => (1 - q) ** 3 * [hx, hy][i] + 3 * (1 - q) ** 2 * q * c1[i] + 3 * (1 - q) * q * q * c2[i] + q ** 3 * [fx, fy][i]); };
    ctx.strokeStyle = COR.coral; ctx.lineWidth = 4; ctx.setLineDash([16, 12]); ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(hx, hy);
    for (let q = 0; q <= k; q += 0.01) ctx.lineTo(...pt(q));
    ctx.stroke(); ctx.setLineDash([]);
    if (k > 0) {
      const [x, y] = pt(k), [x2, y2] = pt(Math.min(1, k + 0.01));
      abelha(ctx, x, y, Math.atan2(y2 - y, x2 - x) + Math.PI / 2, 0.16, u * 6, 13);
    }
    ctx.restore();
  },

  flor(u, d, a) {
    ctx.drawImage(CEU, 0, 0);
    ctx.drawImage(GALHO, 0, 0);
    const tl = seg(u, 2.8, d - 0.8); // timelapse: pétalas caem, centro vira fruto
    FLORES.forEach(([fx, fy], i) => {
      const r = rng(200 + i), atraso = i * 0.06;
      const queda = seg(tl, 0.05 + atraso, 0.45 + atraso);
      const pet = [...Array(5)].map((_, p) => ({ dx: queda * (30 + r() * 80) * (p % 2 ? 1 : -1), dy: queda * (200 + r() * 260), giro: queda * (r() - 0.5) * 4, alpha: 1 - queda }));
      flor(ctx, W * fx, H * fy, 1.6, i * 0.7, pet, seg(tl, 0.35 + atraso, 0.95), 300 + i);
    });
    // a abelha visita três flores antes do timelapse
    const rota = [[0.3, 0.75], FLORES[0], FLORES[1], FLORES[2], [1.1, 0.0]];
    const kv = Math.min(rota.length - 1.001, lerp(0, rota.length - 1, seg(u, 0.1, 3.4)));
    const s0 = Math.floor(kv), f = ease(kv - s0);
    const [ax, ay] = rota[s0], [bx2, by2] = rota[s0 + 1];
    const pousa = Math.sin(Math.PI * f) < 0.5 ? 0 : 1;
    abelha(ctx, W * lerp(ax, bx2, f), H * lerp(ay, by2, f) - 40 + Math.sin(u * 9) * 4 * (1 - pousa), Math.atan2(by2 - ay, bx2 - ax) + Math.PI / 2, 0.6, u * (pousa ? 3 : 40), 17);
    // lupa: o pólen passando de flor em flor
    const kl = seg(u, 0.8, 1.4) * (1 - seg(u, 3.0, 3.5));
    if (kl > 0) {
      const em_pe = H > W, lr = 220 * kl;
      const lx = em_pe ? W * 0.36 : Math.max(260, W * 0.17), ly = em_pe ? H * 0.15 : H * 0.3;
      ctx.save();
      tinta(ctx, () => { ctx.beginPath(); ctx.moveTo(lx + lr * 0.7, ly + lr * 0.7); ctx.lineTo(W * FLORES[0][0], H * FLORES[0][1]); ctx.stroke(); }, COR.creme, 1.5, 0.8 * kl);
      ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fillStyle = "#fbf3df"; ctx.fill(); ctx.clip();
      ctx.translate(lx, ly + 50); ctx.scale(1.25, 1.25);
      ctx.fillStyle = "#f6c6d6"; // corte da flor
      ctx.beginPath(); ctx.ellipse(-90, -20, 70, 26, -0.5, 0, Math.PI * 2); ctx.ellipse(90, -20, 70, 26, 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#9cc95a"; ctx.beginPath(); ctx.moveTo(-26, 60); ctx.quadraticCurveTo(-30, 0, -6, -40); ctx.lineTo(6, -40); ctx.quadraticCurveTo(30, 0, 26, 60); ctx.fill();
      ctx.strokeStyle = "#7a9a3a"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(0, -110); ctx.stroke();
      for (const lado of [-1, 1]) { ctx.strokeStyle = "#d9cf8a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lado * 20, 10); ctx.lineTo(lado * 60, -80); ctx.stroke(); ctx.fillStyle = "#f2b42a"; ctx.beginPath(); ctx.arc(lado * 60, -84, 9, 0, Math.PI * 2); ctx.fill(); }
      for (let p = 0; p < 10; p++) { // grãos subindo do estame ao estigma
        const q = (u * 0.8 + p / 10) % 1, lado = p % 2 ? 1 : -1;
        ctx.fillStyle = "#f2a020"; ctx.beginPath(); ctx.arc(lerp(lado * 60, 0, q), lerp(-84, -110, q) - Math.sin(q * Math.PI) * 30, 4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      tinta(ctx, () => { ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2); ctx.stroke(); }, "#5a3a20", 6, kl);
    }
  },

  danca(u, d) {
    ctx.save();
    ctx.translate(W / 2, H / 2); ctx.scale(1.2, 1.2);
    ctx.drawImage(FAVO, -FAVO.width / 2, -FAVO.height / 2);
    ctx.restore();
    ctx.fillStyle = "rgba(70,35,10,0.5)"; ctx.fillRect(0, 0, W, H);
    const sx = W / 2, sy = 100, cx = W / 2, cy = H * 0.6, th = 0.62, L = 300;
    ctx.fillStyle = COR.ouro; ctx.beginPath(); ctx.arc(sx, sy, 34, 0, Math.PI * 2); ctx.fill(); // sol
    for (let i = 0; i < 12; i++) { const a = i * 0.5236; tinta(ctx, () => { ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * 44, sy + Math.sin(a) * 44); ctx.lineTo(sx + Math.cos(a) * 62, sy + Math.sin(a) * 62); ctx.stroke(); }, COR.ouro, 4); }
    ctx.setLineDash([10, 12]); tinta(ctx, () => { ctx.beginPath(); ctx.moveTo(sx, sy + 70); ctx.lineTo(cx, cy); ctx.stroke(); }, COR.creme, 2, 0.7); ctx.setLineDash([]);
    const dir = [Math.sin(th), -Math.cos(th)], A = [cx - dir[0] * L * 0.4, cy - dir[1] * L * 0.4], B = [cx + dir[0] * L * 0.6, cy + dir[1] * L * 0.6];
    const pos = (t) => { // corrida reta requebrando, volta por um lado, depois pelo outro
      const P = 2.1, n = Math.floor(t / P), p = (t % P) / P, lado = n % 2 ? 1 : -1;
      if (p < 0.45) { const q = p / 0.45, w = Math.sin(q * Math.PI * 12) * 16; return [lerp(A[0], B[0], q) - dir[1] * w, lerp(A[1], B[1], q) + dir[0] * w]; }
      const q = (p - 0.45) / 0.55, M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], ang = Math.atan2(dir[1], dir[0]) + lado * Math.PI * q;
      return [M[0] + Math.cos(ang) * L / 2, M[1] + Math.sin(ang) * L / 2];
    };
    ctx.strokeStyle = COR.coral; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.globalAlpha = 0.85;
    ctx.beginPath(); for (let t = Math.max(0, u - 4); t <= u; t += 0.02) { const [x, y] = pos(t); t === Math.max(0, u - 4) ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
    ctx.globalAlpha = 1;
    const ka = seg(u, 1.0, 1.8); // o ângulo entre o sol e a corrida
    if (ka > 0) tinta(ctx, () => { ctx.beginPath(); ctx.arc(cx, cy, 110, -Math.PI / 2, -Math.PI / 2 + th * ka); ctx.stroke(); }, COR.ouro, 4);
    const kr = seg(u, d - 1.8, d - 0.6); // a direção vira caminho até as flores
    if (kr > 0) {
      const E = [cx + dir[0] * 900 * kr, cy + dir[1] * 900 * kr];
      tinta(ctx, () => { ctx.beginPath(); ctx.moveTo(...B); ctx.lineTo(...E); ctx.stroke(); }, COR.ouro, 5);
      flor(ctx, E[0], E[1], 0.6 * kr, 0, [...Array(5)].map(() => ({ dx: 0, dy: 0, giro: 0, alpha: 1 })), 0, 7);
    }
    const [x, y] = pos(u), [x2, y2] = pos(u + 0.02);
    abelha(ctx, x, y, Math.atan2(y2 - y, x2 - x) + Math.PI / 2, 0.72, u * 4, 19);
  },

  mel(u, d) {
    const z = 1 + 0.05 * (u / d);
    ctx.save();
    ctx.translate(W / 2, H / 2); ctx.scale(z, z);
    ctx.drawImage(FAVOMEL, -FAVOMEL.width / 2, -FAVOMEL.height / 2);
    const R = MEL_R, dx = R * 1.5, dy = R * Math.sqrt(3);
    const ox = -FAVOMEL.width / 2, oy = -FAVOMEL.height / 2; // células reais do favo, perto do centro de baixo
    const cel = [];
    for (let q = 0; q * dx < FAVOMEL.width; q++) for (let k = 0; k * dy < FAVOMEL.height; k++) {
      const x = ox + q * dx, y = oy + k * dy + (q % 2 ? dy / 2 : 0);
      if (y > 150 && y < 420 && Math.abs(x) < 420) cel.push([x, y]);
    }
    cel.slice(0, 4).forEach(([x, y], i) => { // enchem de mel e ganham tampa de cera
      const kf = seg(u, 1.0 + i * 0.3, 2.4 + i * 0.3), kc = seg(u, 2.4 + i * 0.3, 3.4 + i * 0.3);
      ctx.save(); caminho(ctx, hexPts(x, y, R * 0.83)); ctx.clip();
      ctx.fillStyle = "#7a4614"; ctx.fillRect(x - R, y - R, R * 2, R * 2);
      const g = ctx.createRadialGradient(x - 30, y - 30, 5, x, y, R * kf + 1);
      g.addColorStop(0, COR.mel[0]); g.addColorStop(1, COR.mel[1]);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R * kf, 0, Math.PI * 2); ctx.fill();
      if (kc > 0) { ctx.fillStyle = "#f2dca0"; ctx.globalAlpha = 0.95; ctx.beginPath(); ctx.arc(x, y, R * kc, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    });
    abelha(ctx, -175, -120, Math.PI / 2, 0.85, u, 23); // boca a boca
    abelha(ctx, 175, -120, -Math.PI / 2, 0.85, u + 1, 29);
    const gx = Math.sin(u * 3) * 34;
    const gg = ctx.createRadialGradient(gx - 5, -126, 1, gx, -120, 16);
    gg.addColorStop(0, "#fff0a0"); gg.addColorStop(1, "#e0901a");
    ctx.fillStyle = gg; ctx.beginPath(); ctx.ellipse(gx, -120, 24, 19, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.beginPath(); ctx.ellipse(gx - 8, -127, 7, 4, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  },

  dias(u, d) {
    const nd = 6, kd = lerp(0, nd, seg(u, 0.2, d - 1.6)), dia = Math.min(nd - 1, Math.floor(kd)), fr = kd - Math.floor(kd);
    const n = fr > 0.5 && u < d - 1.6 // segunda metade de cada ciclo é noite
      ? Math.sin(Math.PI * (fr - 0.5) * 2) : 0;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, mix("#8fc6e6", "#2b3a6b", n)); g.addColorStop(0.75, mix("#e9f2dc", "#4a4f80", n));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (n > 0.2) for (let i = 0; i < 60; i++) { const r = rng(i + 400); ctx.fillStyle = `rgba(255,250,220,${(n - 0.2) * r()})`; ctx.fillRect(W * (0.5 + r() * 0.5), H * r() * 0.6, 2.5, 2.5); }
    const arco = (q, cor, raio) => { const x = W * lerp(0.55, 0.98, q), y = H * (0.6 - Math.sin(Math.PI * q) * 0.45); ctx.fillStyle = cor; ctx.beginPath(); ctx.arc(x, y, raio, 0, Math.PI * 2); ctx.fill(); };
    if (u < d - 1.6) fr <= 0.5 ? arco(fr * 2, COR.ouro, 40) : arco((fr - 0.5) * 2, "#f4f0dc", 30);
    else arco(0.5, COR.ouro, 40);
    ctx.fillStyle = mix("#8fbf62", "#3a4a5a", n); ctx.fillRect(0, H * 0.82, W, H * 0.18);
    for (let i = 0; i < 70; i++) { const r = rng(i + 500); ctx.fillStyle = mix(["#e8775a", "#f2c94b", "#e383bd", "#ffffff"][i % 4], "#3a4a5a", n * 0.7); ctx.beginPath(); ctx.arc(W * r(), H * (0.84 + r() * 0.14), 5, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1 - n * 0.4; ctx.drawImage(TRONCO, 0, 0); ctx.globalAlpha = 1;
    ctx.fillStyle = `rgba(30,30,70,${n * 0.35})`; ctx.fillRect(0, 0, W, H);
    // risquinhos: sete por semana
    const marcas = Math.min(42, Math.floor(kd * 7));
    for (let m = 0; m < marcas; m++) {
      const porLinha = Math.max(1, Math.floor((W - W * 0.56) / 92)), grupo = Math.floor(m / 5), dentro = m % 5;
      const x = W * 0.56 + (grupo % porLinha) * 92 + dentro * 14, y = H * 0.1 + Math.floor(grupo / porLinha) * 70;
      tinta(ctx, () => { ctx.beginPath(); dentro === 4 ? (ctx.moveTo(x - 64, y + 34), ctx.lineTo(x + 6, y - 4)) : (ctx.moveTo(x, y - 6), ctx.lineTo(x + 3, y + 40)); ctx.stroke(); }, n > 0.5 ? COR.creme : "#4a3220", 3.5);
    }
    // a abelha sai de manhã e volta; na última semana, não volta
    const hx = W * 0.32, hy = H * 0.45;
    if (u < d - 1.6 && fr < 0.5 && dia < nd - 1) {
      const q = Math.sin(Math.PI * fr * 2);
      abelha(ctx, hx + q * W * 0.45, hy - q * 120 + Math.sin(u * 20) * 6, fr < 0.25 ? 1.3 : -1.8, 0.22, u * 40, 31);
    }
    const kc = seg(u, d - 1.4, d - 0.6); // uma pontinha de colher de mel
    if (kc > 0) {
      ctx.save(); ctx.globalAlpha = kc; ctx.translate(W * 0.72, H * 0.6); ctx.rotate(-0.3);
      ctx.fillStyle = "#c9945a"; ctx.fillRect(0, -9, 260, 18);
      ctx.beginPath(); ctx.ellipse(-50, 0, 62, 38, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#7a4a1a"; ctx.lineWidth = 2.5; ctx.stroke();
      const gg = ctx.createRadialGradient(-50, -3, 1, -50, 0, 7);
      gg.addColorStop(0, "#fff0a0"); gg.addColorStop(1, "#d98a1a");
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(-50, 0, 6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  },

  fim(u, d) {
    // a geometria volta, a rainha deixa um ovo novo, e a íris abre de novo no favo: o começo
    CENAS.geometria(lerp(1.5, 3.4, seg(u, 0, 1.4)));
    const ke = seg(u, 0.6, 1.2);
    if (ke > 0) {
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(-0.35); ctx.scale(ke * 0.45, ke * 0.45);
      ctx.beginPath(); ctx.ellipse(0, 0, 112, 270, 0, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(-30, -70, 10, 0, 0, 270);
      g.addColorStop(0, "#fff8e8"); g.addColorStop(1, "#cfa978");
      ctx.fillStyle = g; ctx.fill();
      ctx.restore();
    }
    const ki = seg(u, 1.8, d - 0.1);
    if (ki > 0) {
      const R = lerp(60, Math.hypot(W, H) * 0.6, ki);
      ctx.save(); ctx.beginPath(); ctx.arc(W / 2, H / 2, R, 0, Math.PI * 2); ctx.clip();
      CENAS.favo(0, 4);
      ctx.restore();
      tinta(ctx, () => { ctx.beginPath(); ctx.arc(W / 2, H / 2, R, 0, Math.PI * 2); ctx.stroke(); }, COR.creme, 3, 1 - ki);
    }
  },
});

// ---------- passagens ----------
function funde(ant, u, a) { // a cena nova aparece por baixo da anterior, que se dissolve
  CENAS[a.cena](u, a.t1 - a.t0, a);
  const k = seg(u, 0, 0.8);
  if (k >= 1) return;
  ctx.save(); ctx.globalAlpha = 1 - k;
  CENAS[ant.cena](ant.t1 - ant.t0 + u, ant.t1 - ant.t0, ant);
  ctx.restore();
}
function afasta(ant, u, a) { // a anterior encolhe até virar um ponto no mapa
  const k = seg(u, 0, 1.0);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(lerp(1.3, 1, k), lerp(1.3, 1, k)); ctx.translate(-W / 2, -H / 2);
  CENAS[a.cena](u, a.t1 - a.t0, a);
  ctx.restore();
  if (k >= 1) return;
  ctx.save(); ctx.globalAlpha = 1 - k;
  ctx.translate(W * 0.2, H * 0.66); ctx.scale(lerp(1, 0.05, k), lerp(1, 0.05, k)); ctx.translate(-W * 0.2, -H * 0.66);
  CENAS[ant.cena](ant.t1 - ant.t0, ant.t1 - ant.t0, ant);
  ctx.restore();
}
Object.assign(PASSAGENS, { funde, afasta });

function iniciar2() {
  MAPA = fazerMapa();
  CEU = fazerCeu();
  GALHO = fazerGalho();
  TRONCO = fazerTronco();
  FAVOMEL = fazerFavoMel();
}
