// Elenco do 003: bonecos articulados de livro ilustrado, pintados em aquarela com contorno de tinta que "ferve" a 8 por segundo.
// figura(c, nome, st, t): origem nos pés, olhando para +x (st.f = -1 espelha). Devolve pontos do mundo (peito, mãos, cabeça).
// st (ver POSE): x, y, s, f, incl (tronco), cab (cabeça), vira, bf/bt (braço da frente/de trás: [ombro, cotovelo], 0 = para baixo,
// + para a frente), agacha (0 em pé, 1 ajoelhado/sentado), sobr (+ espanto, - aflição), sorri, olhos, olhar, fala (boca),
// andar/passo (caminhada), barriga, colo (bebê no colo), segura ("cajado", "tabuinha", "rolo"), escrita, asa, alpha.

const POSE = { x: 0, y: 0, s: 1, f: 1, incl: 0, cab: 0, vira: 0.5, bf: [0.12, 0.25], bt: [-0.08, 0.2], agacha: 0, sobr: 0, sorri: 0.25,
  olhos: 1, olhar: 0, olharY: 0, fala: 0, andar: 0, passo: 0, barriga: 0, colo: 0, escrita: 0, asa: 1, alpha: 1, brilho: 0 };

const ELENCO = {
  maria: { pele: "#dba57f", tunica: "#c57b6c", manto: "#46708f", veu: true, cabelo: "#3a2418" },
  mariaVelha: { pele: "#d29e7e", tunica: "#b48176", manto: "#557891", veu: true, cabelo: "#cfc8bc", velho: 1 },
  jose: { pele: "#bd845c", tunica: "#b88a4e", manto: "#6f7148", pano: "#d9c7a0", barba: "#4a3022", barbaL: 6, cabelo: "#4a3022" },
  zacarias: { pele: "#cc9574", tunica: "#ece2c8", faixa: "#4f7aa0", turbante: "#f3ecda", barba: "#ebe6dc", barbaL: 36, velho: 1, cabelo: "#e6e0d4" },
  isabel: { pele: "#d4a07e", tunica: "#8b5a76", manto: "#d8c6a4", veu: true, cabelo: "#9d9286", velho: 0.7 },
  gabriel: { pele: "#efcfae", tunica: "#f6eedb", faixa: "#d9a84a", cabelo: "#b78a4a", anjo: true, h: 1.08 },
  simeao: { pele: "#c8987a", tunica: "#a9b6b5", manto: "#5f7f8c", pano: "#e6dcc6", barba: "#f1ede4", barbaL: 44, velho: 1, cabelo: "#efebe2" },
  jesus: { pele: "#d39a72", tunica: "#efe3c8", faixa: "#b5533f", cabelo: "#4a2e1e", crianca: true, h: 0.74 },
  jovem: { pele: "#d39a72", tunica: "#efe3c8", faixa: "#b5533f", manto: "#9a6a4a", cabelo: "#4a2e1e", barba: "#4a2e1e", barbaL: 0 },
  pastor1: { pele: "#b07a55", tunica: "#8f7a5a", la: "#e3dccb", pano: "#c4a46c", barba: "#6d6458", barbaL: 18, velho: 0.6, cabelo: "#6d6458" },
  pastor2: { pele: "#a87250", tunica: "#6f6a55", pano: "#a8704a", barba: "#3e2a1e", barbaL: 8, cabelo: "#3e2a1e" },
  pastor3: { pele: "#c08a62", tunica: "#a86b4a", la: "#d9cfba", pano: "#d8c49a", cabelo: "#3a2418", h: 0.9 },
  doutor1: { pele: "#c9946f", tunica: "#d8cdb2", manto: "#7d6a8a", turbante: "#efe6d2", barba: "#cfc9bf", barbaL: 34, velho: 1, cabelo: "#cfc9bf" },
  doutor2: { pele: "#b98260", tunica: "#b48a5a", manto: "#556b6e", turbante: "#d9c28e", barba: "#5a4636", barbaL: 22, velho: 0.5, cabelo: "#5a4636" },
  doutor3: { pele: "#c58e68", tunica: "#8c5a48", turbante: "#e8dcc2", barba: "#9b8f84", barbaL: 28, velho: 0.8, cabelo: "#9b8f84" },
};
// o povo: variações simples para multidões
const POVO = ["#9b7a58", "#7b6a5a", "#a8846a", "#6f7a6c", "#8a6070", "#b49a72", "#6c5c4c", "#937f63"].map((tunica, i) => ({
  pele: ["#c0895f", "#b07a55", "#d1a07a", "#a87250"][i % 4], tunica, pano: ["#d8c8a4", "#c4a46c", "#e2d6bc", "#b89870"][i % 4],
  veu: i % 3 === 1, manto: i % 3 === 1 ? ["#7a6a8a", "#5d7a80", "#9a6a5a"][i % 3] : null, barba: i % 3 === 1 ? null : "#4a3424", barbaL: i % 2 ? 10 : 4, cabelo: "#3a2a1e",
}));
POVO.forEach((p, i) => (ELENCO["povo" + i] = p));

const hashNome = (n) => n.split("").reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) | 0, 7);

function piscada(t, seed) { // fecha os olhos um instante a cada 3 a 5 s
  const per = 3.2 + (Math.abs(seed) % 17) / 10, l = (t + (Math.abs(seed) % 50) / 10) % per;
  return l < 0.12 ? 0.08 : 1;
}

function figura(c, nome, st0, t) {
  const E = ELENCO[nome], st = { ...POSE, ...st0 }, f = st.f, sd = hashNome(nome);
  const fer = Math.floor(t * 8); // contorno que ferve
  const so = (k) => ({ seed: sd + k * 101 + fer * 7, trem: st.simples ? 0.6 : 1.1, hach: st.simples ? 0 : 7, larg: st.simples ? 1.8 : 2.6 });
  const hs = (E.h || 1) * st.s;
  c.save();
  c.translate(st.x, st.y); c.scale(hs * f, hs);
  c.globalAlpha *= st.alpha;
  const ag = st.agacha, resp = onda(t, 4.2, sd) * 2.2;
  const passo = st.passo, anda = st.andar, bob = anda * Math.abs(Math.sin(passo)) * 7;
  const flut = E.anjo ? onda(t, 3.4, 1) * 8 : 0;
  const sy = -400 + ag * 150 - bob + resp * 0.5 + flut, lx = Math.sin(st.incl) * 250 * (1 - ag * 0.4);
  const hw = 86 + ag * 30, fx = ag * 60, sway = anda * Math.sin(passo) * 8 + (E.anjo ? onda(t, 2.6) * 6 : 0);
  const cabCh = (E.crianca ? 1.2 : 1) * 1.2;
  const out = {};
  const W2 = (px, py) => [st.x + px * hs * f, st.y + py * hs];

  // asas, atrás de tudo
  if (E.anjo) {
    brilho(c, lx, sy + 60, 420, "#fff3d2", 0.45 + st.brilho * 0.3);
    for (const lado of [0, 1]) asa(c, lx - 18, sy + 46, st.asa * (0.9 + 0.1 * onda(t, 2.8, lado)), lado, t, sd + lado);
  }
  // pés (somem sob a túnica quando ajoelha)
  if (ag < 0.6 && !E.anjo) {
    for (const k of [-1, 1]) {
      const ph = Math.sin(passo + (k > 0 ? 0 : Math.PI)), px = k * 16 + ph * 26 * anda + 10, py = -Math.max(0, Math.cos(passo + (k > 0 ? 0 : Math.PI))) * 10 * anda;
      pinta(c, [[px - 16, py - 6], [px + 26, py - 9], [px + 30, py + 2], [px - 18, py + 3]], k > 0 ? "#6b4a32" : "#5a3e2a", { ...so(20 + k), hach: 0, larg: 2 });
    }
  }
  // braço de trás
  out.maoT = braco(c, [lx - 22, sy + 20], st.bt[0] - anda * Math.sin(passo) * 0.35, st.bt[1], esc(E.manto && !E.veu ? E.manto : E.tunica, 0.18), E.pele, so(30), st.simples);
  // túnica
  const barr = st.barriga * 46;
  const tun = [[lx - 38, sy + 4], [lx - 54, sy + 60], [-50 + lx * 0.5, sy + 190 * (1 - ag * 0.4)], [-hw - 6 + sway, -40], [-hw - 4 + sway, -2], [-40, 5], [0, 2], [40, 5],
    [hw + fx + sway, -2], [hw + fx + sway, -40], [52 + lx * 0.5 + barr + fx * 0.5, sy + 210 * (1 - ag * 0.3)], [lx + 50 + barr * 0.4, sy + 80], [lx + 38, sy + 4], [lx, sy - 8]];
  if (E.anjo) {
    c.save();
    const g = c.createLinearGradient(0, sy, 0, 0); g.addColorStop(0, E.tunica); g.addColorStop(0.7, rgba(E.tunica, 0.9)); g.addColorStop(1, rgba(E.tunica, 0));
    suave(c, tun); c.fillStyle = g; c.fill(); c.clip();
    c.globalCompositeOperation = "multiply"; c.globalAlpha = 0.25; c.fillStyle = TEXP; c.fillRect(-200, sy, 400, -sy); c.restore();
    c.save(); const gi = c.createLinearGradient(0, sy, 0, -60); gi.addColorStop(0, rgba(INK, 0.8)); gi.addColorStop(1, rgba(INK, 0));
    suave(c, tremido(tun, 1.1, rng(sd + fer), 2)); c.strokeStyle = gi; c.lineWidth = 2.4; c.stroke(); c.restore();
  } else pinta(c, tun, E.tunica, so(1));
  // dobras do pano
  if (!st.simples) for (let i = 0; i < 4; i++) {
    const x0 = lx * 0.8 - 26 + i * 18, x1 = -60 + i * 40 + sway * 0.6 + fx * 0.3 * i / 3;
    linha(c, [[x0, sy + 150], [lerp(x0, x1, 0.5) + 6, sy * 0.4], [x1, -12]], esc(E.tunica, 0.4), 1.3, 0.5);
  }
  if (E.la) pinta(c, [[lx - 44, sy + 6], [lx + 44, sy + 6], [lx * 0.6 + 54, sy + 170], [lx * 0.6 - 52, sy + 180]], E.la, { ...so(3), hach: 0 });
  if (E.faixa) linha(c, [[-56 + lx * 0.45, sy + 170], [lx * 0.45, sy + 176], [58 + lx * 0.45 + barr * 0.6, sy + 168]], E.faixa, 13, 0.95);
  // manto caindo pelas costas (e sobre a cabeça, nas mulheres)
  const hx = lx + 8 + Math.sin(st.cab) * 30, hy = sy - 52 * cabCh;
  if (E.manto) {
    const capa = E.veu
      ? [[hx - 8, hy - 56 * cabCh], [hx - 50, hy - 20], [lx - 66, sy + 50], [-70 + lx * 0.3 - sway * 0.3, sy + 250 * (1 - ag * 0.3)], [-hw + 4 + sway, -26], [-hw * 0.2 + sway * 0.5, -40], [lx * 0.3 - 4, sy + 230], [lx + 6, sy + 70], [hx - 6, hy + 40]]
      : [[lx - 40, sy + 2], [lx - 64, sy + 54], [-68 + lx * 0.3 - sway * 0.3, sy + 250], [-hw + 6 + sway, -30], [-hw * 0.3 + sway * 0.5, -46], [lx * 0.2 - 10, sy + 220], [lx - 8, sy + 60], [lx + 10, sy + 6]];
    pinta(c, capa, E.manto, so(4));
  }
  // bebê no colo
  if (st.colo > 0.01) { c.save(); c.globalAlpha *= st.colo; out.bebe = [lx + 44, sy + 120]; bebe(c, lx + 46, sy + 122, 1, t, { rot: -0.3, f: 1 }); c.restore(); }
  // cabeça
  c.save();
  c.translate(lx, sy - 6); c.rotate(st.cab + onda(t, 5.1, sd) * 0.015); c.translate(-lx, -(sy - 6));
  if (!E.crianca || true) pinta(c, [[lx - 14, sy + 2], [lx + 16, sy + 2], [lx + 14, sy - 30], [lx - 10, sy - 30]], esc(E.pele, 0.1), { ...so(5), hach: 0, larg: 2 });
  cabeca(c, hx, hy, cabCh, E, st, t, so, sd);
  c.restore();
  // braço da frente (por cima do corpo e do bebê)
  out.maoF = braco(c, [lx + 26, sy + 22], st.bf[0] + anda * Math.sin(passo) * 0.35, st.bf[1], E.manto && !E.veu ? E.manto : E.tunica, E.pele, so(40), st.simples);
  if (st.segura) objeto(c, st.segura, out.maoF, st, t);
  out.peito = W2(lx + 16, sy + 70);
  out.cabeca = W2(hx, hy);
  out.mao = W2(...out.maoF);
  out.maoTras = W2(...out.maoT);
  if (out.bebe) out.bebe = W2(...out.bebe);
  c.restore();
  return out;
}

function braco(c, S, a1, a2, cor, pele, o, simples) {
  const L1 = 108, L2 = 94;
  const E = [S[0] + Math.sin(a1) * L1, S[1] + Math.cos(a1) * L1];
  const a = a1 + a2, P = [E[0] + Math.sin(a) * L2, E[1] + Math.cos(a) * L2];
  const nrm = (p, q, w) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; return [-dy / l * w, dx / l * w]; };
  const n1 = nrm(S, E, 20), n2 = nrm(E, P, 18), n3 = nrm(E, P, 25);
  const manga = [[S[0] + n1[0], S[1] + n1[1]], [E[0] + n1[0] * 0.9, E[1] + n1[1] * 0.9], [P[0] + n3[0], P[1] + n3[1]], [P[0] - n3[0], P[1] - n3[1]], [E[0] - n2[0], E[1] - n2[1]], [S[0] - n1[0], S[1] - n1[1]]];
  const M = [P[0] + Math.sin(a) * 14, P[1] + Math.cos(a) * 14];
  elip(c, M[0], M[1], 12, 15, pele, -a);
  c.save(); c.beginPath(); c.ellipse(M[0], M[1], 12, 15, -a, 0, Math.PI * 2); c.strokeStyle = INK; c.globalAlpha = 0.7; c.lineWidth = 2; c.stroke(); c.restore();
  if (!simples) linha(c, [[M[0] + Math.cos(a) * 7, M[1] - Math.sin(a) * 7], [M[0] + Math.cos(a) * 9 + Math.sin(a) * 9, M[1] - Math.sin(a) * 9 + Math.cos(a) * 9]], INK, 1.4, 0.5);
  pinta(c, manga, cor, { ...o, hach: 0 });
  return M;
}

function cabeca(c, hx, hy, k, E, st, t, so, sd) {
  const rx = 40 * k, ry = 47 * k, v = st.vira, fx = (8 + v * 8) * k;
  // cabelo atrás / turbante / pano
  if (E.anjo || E.crianca || (!E.veu && !E.pano && !E.turbante)) {
    const r = rng(sd);
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (0.92 + (i / 12) * 1.12), rr = (44 + r() * 5) * k;
      elip(c, hx + Math.cos(a) * rr - 4, hy + Math.sin(a) * rr - 4, 15 * k, 14 * k, i % 2 ? E.cabelo : esc(E.cabelo, 0.15));
    }
  }
  if (E.pano || E.veu) pinta(c, [[hx - 48 * k, hy + 48 * k], [hx - 54 * k, hy - 6 * k], [hx - 30 * k, hy - 52 * k], [hx + 10 * k, hy - 58 * k], [hx + 30 * k, hy - 40 * k], [hx - 6 * k, hy + 30 * k], [hx - 20 * k, hy + 70 * k]], E.veu ? E.manto : E.pano, so(6));
  // rosto
  pinta(c, circulo(hx, hy, 1, 16).map(([x, y]) => [hx + (x - hx) * rx, hy + (y - hy) * ry]), E.pele, { ...so(7), hach: 0, sombra: 0.18 });
  brilho(c, hx + fx + 26 * k, hy + 14 * k, 18 * k, "#e07a6a", 0.22, "source-over");
  brilho(c, hx + fx - 14 * k, hy + 12 * k, 14 * k, "#e07a6a", 0.16, "source-over");
  // barba: do queixo para baixo, deixando a boca à mostra
  if (E.barba && E.barbaL !== undefined) {
    const L = E.barbaL * k;
    pinta(c, [[hx - 36 * k, hy + 2 * k], [hx - 34 * k, hy + 34 * k], [hx - 12 * k, hy + 58 * k + L], [hx + fx + 10 * k, hy + 62 * k + L], [hx + fx + 30 * k, hy + 46 * k + L * 0.6], [hx + fx + 34 * k, hy + 24 * k], [hx + fx + 24 * k, hy + 36 * k], [hx + fx + 6 * k, hy + 38 * k], [hx - 8 * k, hy + 26 * k], [hx - 22 * k, hy + 8 * k]], E.barba, { ...so(8), hach: 0 });
    if (L > 10) for (let i = 0; i < 5; i++) linha(c, [[hx - 18 * k + i * 11 * k, hy + 40 * k], [hx - 14 * k + i * 12 * k, hy + 52 * k + L * 0.8]], esc(E.barba, 0.35), 1.2, 0.5);
  }
  // olhos
  const ab = st.olhos * piscada(t, sd), ox = st.olhar * 3 * k, oy = st.olharY * 3 * k;
  for (const [ex, esc_] of [[fx + 16 * k, 1], [fx - 12 * k, 0.86]]) {
    const x = hx + ex + ox, y = hy - 2 * k + oy;
    if (ab < 0.25) linha(c, [[x - 6 * k, y], [x, y + 3 * k], [x + 6 * k, y]], INK, 2.2, 0.9);
    else {
      elip(c, x, y, 5.4 * k * esc_, 6.8 * k * ab * esc_, INK);
      elip(c, x + 1.6 * k, y - 2.2 * k, 1.7 * k, 1.7 * k, "rgba(255,250,235,0.95)");
    }
    // sobrancelhas: + espanto (sobem), - aflição (sobe o lado de dentro)
    const s = st.sobr, dentro = s > 0 ? s * 6 : -s * 6, fora = s > 0 ? s * 5 : s * 2;
    const ladoDentro = ex > fx ? -1 : 1;
    linha(c, [[x + ladoDentro * 6 * k, y - 13 * k - dentro * k], [x - ladoDentro * 7 * k, y - 12 * k - fora * k]], E.velho ? esc(E.cabelo, 0.3) : INK, 2.6 * k, 0.85, false);
  }
  if (E.velho) {
    const x = hx + fx + 24 * k, y = hy - 2 * k;
    linha(c, [[x, y - 3 * k], [x + 6 * k, y - 5 * k]], INK, 1, 0.4); linha(c, [[x, y + 2 * k], [x + 6 * k, y + 4 * k]], INK, 1, 0.4);
    linha(c, [[hx + fx + 24 * k, hy + 14 * k], [hx + fx + 22 * k, hy + 26 * k]], INK, 1, 0.35);
    if (E.veu) linha(c, [[hx + fx - 6 * k, hy - 22 * k], [hx + fx + 14 * k, hy - 23 * k]], INK, 1, 0.3);
  }
  // nariz
  linha(c, [[hx + fx + 27 * k, hy - 3 * k], [hx + fx + 34 * k, hy + 11 * k], [hx + fx + 26 * k, hy + 15 * k]], esc(E.pele, 0.5), 2, 0.8);
  // boca
  const mx = hx + fx + 15 * k, my = hy + (E.barba ? 31 : 27) * k, ab2 = clamp(st.fala), sr = st.sorri;
  if (ab2 > 0.06) {
    c.save(); c.beginPath(); c.ellipse(mx, my + 1 * k, 7.5 * k, (1.5 + ab2 * 7) * k, 0, 0, Math.PI * 2); c.fillStyle = "#6b2a25"; c.fill();
    c.strokeStyle = INK; c.globalAlpha = 0.7; c.lineWidth = 1.6; c.stroke(); c.restore();
  } else linha(c, [[mx - 9 * k, my - sr * 2 * k], [mx, my + sr * 5 * k], [mx + 9 * k, my - sr * 3 * k]], E.barba ? "#6b2a25" : esc(E.pele, 0.6), 2.4, 0.85);
  // véu por cima (moldura do rosto) / pano com cordão / turbante
  if (E.veu) {
    pinta(c, [[hx - 50 * k, hy + 50 * k], [hx - 52 * k, hy - 10 * k], [hx - 34 * k, hy - 52 * k], [hx + 6 * k, hy - 62 * k], [hx + 40 * k, hy - 46 * k], [hx + 48 * k, hy - 26 * k], [hx + 30 * k, hy - 34 * k], [hx + 2 * k, hy - 36 * k], [hx - 16 * k, hy - 22 * k], [hx - 22 * k, hy + 16 * k], [hx - 26 * k, hy + 54 * k]], E.manto, so(9));
    linha(c, [[hx - 12 * k, hy - 26 * k], [hx + 10 * k, hy - 33 * k], [hx + 32 * k, hy - 30 * k]], E.cabelo, 4 * k, 0.9);
  } else if (E.pano) {
    pinta(c, [[hx - 48 * k, hy + 46 * k], [hx - 50 * k, hy - 12 * k], [hx - 32 * k, hy - 54 * k], [hx + 8 * k, hy - 60 * k], [hx + 42 * k, hy - 44 * k], [hx + 46 * k, hy - 22 * k], [hx + 20 * k, hy - 30 * k], [hx - 20 * k, hy - 20 * k], [hx - 24 * k, hy + 40 * k]], E.pano, so(9));
    linha(c, [[hx - 44 * k, hy - 22 * k], [hx, hy - 34 * k], [hx + 44 * k, hy - 30 * k]], esc(E.pano, 0.6), 5 * k, 0.9);
  } else if (E.turbante) {
    pinta(c, [[hx - 44 * k, hy - 14 * k], [hx - 48 * k, hy - 48 * k], [hx - 20 * k, hy - 82 * k], [hx + 22 * k, hy - 84 * k], [hx + 48 * k, hy - 54 * k], [hx + 44 * k, hy - 18 * k], [hx, hy - 26 * k]], E.turbante, so(9));
    for (let i = 0; i < 3; i++) linha(c, [[hx - 42 * k, hy - (30 + i * 16) * k], [hx, hy - (40 + i * 18) * k], [hx + 44 * k, hy - (34 + i * 14) * k]], esc(E.turbante, 0.3), 1.4, 0.6);
  }
}

function asa(c, x, y, abre, longe, t, sd) {
  const r = rng(sd), n = 9;
  c.save(); c.translate(x, y);
  if (longe) { c.translate(-26, 10); c.scale(0.88, 0.92); }
  for (const [fila, L0, L1, larg, cor] of [[0, 330, 200, 22, "#f9f1dc"], [1, 210, 150, 26, "#fffaf0"]]) {
    for (let i = 0; i < n - fila * 2; i++) {
      const k = i / (n - 1), an = lerp(-2.75, -1.7, k) * (0.55 + 0.45 * abre) + (longe ? 0.18 : 0), L = lerp(L0, L1, k) * (0.7 + 0.3 * abre);
      const cx = Math.cos(an) * L * 0.5, cy = Math.sin(an) * L * 0.5;
      c.save(); c.translate(cx, cy); c.rotate(an);
      const pts = [[-L / 2, 0], [-L / 4, -larg], [L / 4, -larg * 0.9], [L / 2, -2], [L / 4, larg * 0.7], [-L / 4, larg * 0.8]];
      pinta(c, pts, longe ? mist(cor, "#d9c49a", 0.35) : cor, { seed: sd + i + fila * 20 + Math.floor(t * 8), hach: 0, larg: 1.6, alpha: 0.6, luz: 0.3, sombra: 0.12 });
      linha(c, [[-L / 2 + 10, 0], [L / 2 - 8, -2]], "#d9a84a", 1.2, 0.5);
      c.restore();
    }
  }
  c.restore();
}

function objeto(c, tipo, M, st, t) {
  const [x, y] = M;
  if (tipo === "cajado") linha(c, [[x + 4, y - 150], [x + 2, y - 40], [x + 8, y + 260 - (st.agacha || 0) * 150]], "#7a5636", 7, 0.95, false);
  else if (tipo === "tabuinha") {
    pinta(c, [[x - 10, y - 66], [x + 70, y - 76], [x + 76, y + 14], [x - 4, y + 22]], "#c9a46a", { seed: 3, hach: 0, larg: 2 });
    pinta(c, [[x + 2, y - 56], [x + 62, y - 64], [x + 66, y + 4], [x + 6, y + 10]], "#8e6a3e", { seed: 4, hach: 0, larg: 1.2, luz: 0.1 });
    // as letras aparecem traço a traço (escrita de 0 a 1)
    const r = rng(12);
    c.save(); c.strokeStyle = "#f1dfb6"; c.lineWidth = 3; c.lineCap = "round";
    for (let i = 0; i < 4; i++) {
      const k = clamp(st.escrita * 4 - i);
      if (k <= 0) break;
      const bx = x + 54 - i * 14, by = y - 40;
      const pts = [[bx, by], [bx - 8, by + 2 + r() * 4], [bx - 6, by + 14 + r() * 6], [bx + 1, by + 26]];
      tracar(c, pts, k, false);
    }
    c.restore();
  } else if (tipo === "rolo") {
    pinta(c, [[x - 40, y - 14], [x + 50, y - 20], [x + 52, y + 8], [x - 38, y + 14]], "#eadcb8", { seed: 6, hach: 0, larg: 1.8 });
    elip(c, x - 42, y, 8, 16, "#a87a4a"); elip(c, x + 52, y - 6, 8, 16, "#a87a4a");
  }
}

function bebe(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s * (o.f || 1), s);
  const r = 1 + onda(t, 2.4) * 0.015;
  c.scale(r, r);
  pinta(c, [[-62, -4], [-50, -26], [10, -30], [46, -20], [52, 4], [30, 22], [-40, 24]], "#f1e6cf", { seed: 31 + Math.floor(t * 8), hach: 0, luz: 0.3 });
  for (let i = 0; i < 4; i++) linha(c, [[-40 + i * 18, -24], [-30 + i * 18, 22]], "#cdbb98", 1.6, 0.7);
  pinta(c, circulo(52, -6, 24, 12), "#e2ad88", { seed: 33 + Math.floor(t * 8), hach: 0, sombra: 0.12 });
  linha(c, [[54, -10], [58, -8], [62, -10]], INK, 1.6, 0.8); linha(c, [[44, -10], [48, -8], [52, -10]], INK, 1.4, 0.7);
  brilho(c, 62, 2, 7, "#e07a6a", 0.3, "source-over");
  linha(c, [[54, 6], [57, 7], [60, 6]], esc("#e2ad88", 0.6), 1.4, 0.8);
  linha(c, [[36, -28], [52, -32], [70, -24]], "#5a3a26", 3, 0.6);
  const m = clamp(onda(t, 6.3, 1) * 2 - 1.2);
  if (m > 0) elip(c, 20 + m * 10, -26 - m * 8, 8, 7, "#e2ad88");
  c.restore();
}

// ---------- bichos ----------
function ovelha(c, x, y, s, t, o = {}) {
  const sd = o.seed || 1, come = o.come ?? clamp(onda(t, 7 + (sd % 4), sd) * 1.6), anda = o.anda || 0, ph = o.passo || 0;
  c.save(); c.translate(x, y); c.scale(s * (o.f || 1), s);
  elip(c, 0, 2, 92, 14, "rgba(40,30,20,0.16)");
  for (const [i, lx] of [[0, -50], [1, -26], [2, 30], [3, 52]].map(([i, v]) => [i, v])) {
    const sw = Math.sin(ph + (i % 2) * Math.PI) * 14 * anda;
    linha(c, [[lx, -40], [lx + sw, -2]], "#4e4436", 9, 0.95, false);
  }
  const r = rng(sd), nuvem = [];
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; nuvem.push([Math.cos(a) * (66 + r() * 8), -72 + Math.sin(a) * (34 + r() * 6)]); }
  pinta(c, nuvem, o.cor || "#e4dcc6", { seed: sd + Math.floor(t * 8), hach: 0, luz: 0.3, sombra: 0.22 });
  for (let i = 0; i < 9; i++) { const a = r() * 6.28; linha(c, [[Math.cos(a) * 40 - 6, -72 + Math.sin(a) * 18], [Math.cos(a) * 40 + 6, -70 + Math.sin(a) * 18]], "#b9ae94", 2, 0.6); }
  const hy = lerp(-88, -40, come), hxx = 76 + come * 6;
  pinta(c, [[hxx - 20, hy - 18], [hxx + 18, hy - 22], [hxx + 34, hy + 6], [hxx + 10, hy + 24], [hxx - 18, hy + 14]], "#6e624f", { seed: sd + 5, hach: 0, larg: 2 });
  elip(c, hxx - 14, hy - 14, 16, 7, "#5a4f40", -0.5);
  elip(c, hxx + 10, hy - 6, 3, 3, INK);
  c.restore();
}
function burro(c, x, y, s, t, o = {}) {
  const anda = o.anda || 0, ph = o.passo || 0;
  c.save(); c.translate(x, y); c.scale(s * (o.f || 1), s);
  elip(c, 0, 2, 150, 16, "rgba(40,30,20,0.18)");
  for (const [i, lx] of [[0, -100], [1, -74], [2, 70], [3, 96]]) {
    const sw = Math.sin(ph + (i % 2) * Math.PI + (i > 1 ? 0.6 : 0)) * 20 * anda;
    linha(c, [[lx, -120], [lx + sw * 0.5, -60], [lx + sw, -4]], i % 2 ? "#6d5d50" : "#7c6b5c", 15, 1, false);
  }
  pinta(c, [[-130, -150], [-60, -176], [60, -178], [120, -150], [118, -104], [60, -92], [-80, -92], [-132, -110]], "#8d7b69", { seed: 41 + Math.floor(t * 8), hach: 7 });
  linha(c, [[-128, -140], [-152, -110 + onda(t, 1.4) * 8], [-150, -84 + onda(t, 1.4) * 12]], "#6d5d50", 6, 0.9);
  const cab = onda(t, 3.1) * 4 + anda * Math.sin(ph * 2) * 4;
  pinta(c, [[100, -160], [150, -236 + cab], [196, -250 + cab], [222, -204 + cab], [182, -186 + cab], [140, -126]], "#8d7b69", { seed: 43 + Math.floor(t * 8), hach: 0 });
  pinta(c, [[160, -244 + cab], [148, -300 + cab], [172, -246 + cab]], "#7c6b5c", { seed: 44, hach: 0, larg: 2 });
  pinta(c, [[178, -248 + cab], [180, -306 + cab], [196, -250 + cab]], "#8d7b69", { seed: 45, hach: 0, larg: 2 });
  elip(c, 196, -228 + cab, 3.4, 3.4, INK);
  elip(c, 220, -206 + cab, 12, 10, "#bfb2a2");
  linha(c, [[106, -170], [150, -240 + cab]], "#4a3c30", 5, 0.8);
  c.restore();
}
function boi(c, x, y, s, t, o = {}) { // deitado, ruminando
  c.save(); c.translate(x, y); c.scale(s * (o.f || 1), s);
  const r = onda(t, 3.6) * 3, mast = Math.abs(onda(t, 0.9)) * 3;
  pinta(c, [[-170, -40], [-150, -140 - r], [-40, -170 - r], [90, -160 - r], [140, -110], [150, -30], [80, 0], [-140, 0]], "#a88a6a", { seed: 51 + Math.floor(t * 8), hach: 7 });
  pinta(c, [[110, -150], [180, -176], [230, -150], [236, -96 + mast], [196, -70 + mast], [140, -96]], "#9a7d60", { seed: 52 + Math.floor(t * 8), hach: 0 });
  linha(c, [[160, -170], [140, -206], [126, -210]], "#efe2c4", 7, 0.95); linha(c, [[204, -172], [226, -206], [244, -206]], "#efe2c4", 7, 0.95);
  elip(c, 188, -136, 3.6, 3.6, INK); elip(c, 226, -94 + mast, 14, 10, "#c9a98a");
  c.restore();
}
function pomba(c, x, y, s, t, o = {}) {
  const bate = o.voa ? onda(t, 0.28, o.seed || 0) : 0;
  c.save(); c.translate(x, y); c.scale(s * (o.f || 1), s);
  pinta(c, [[-30, 0], [-10, -18], [20, -16], [34, -6], [20, 8], [-20, 10]], "#f2efe6", { seed: 61 + (o.seed || 0), hach: 0, larg: 1.6 });
  elip(c, 30, -16, 10, 9, "#f2efe6"); elip(c, 33, -18, 1.8, 1.8, INK);
  pinta(c, [[-8, -10], [-30 + bate * 6, -38 - bate * 26], [12, -18]], "#e6e1d4", { seed: 62 + (o.seed || 0), hach: 0, larg: 1.4 });
  linha(c, [[39, -16], [45, -14]], "#c08a5a", 2.4, 1);
  c.restore();
}
