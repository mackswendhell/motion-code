// Rabisco: peças de desenho e as cenas. Tudo em unidades do palco (0 a 1000; VIS diz o que mais aparece em cada formato).
// Uma cena devolve { fundo: "papel" | "noite", objetos, faisca?, cam?, foco?, dof? }.
// Objeto: { formas, z (1 = assunto, < 1 perto, > 1 longe), em, dura, ate, guia, vibra, move }; tempos em segundos desde o começo do ato.

const F = (pts, cor = null, o = {}) => ({ pts, cor, fechado: true, ...o });
const L = (pts, o = {}) => ({ pts, cor: null, fechado: false, ...o });
const ob = (formas, o = {}) => ({ formas, ...o });
const rad = (g) => (g * Math.PI) / 180;
function rr(x, y, w, h, r = 12) {
  const out = [];
  for (const [cx, cy, a0] of [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]])
    for (let k = 0; k <= 4; k++) out.push([cx + Math.cos(rad(a0 + k * 22.5)) * r, cy + Math.sin(rad(a0 + k * 22.5)) * r]);
  return out;
}
const arco = (cx, cy, r, a0, a1, n = 18) => [...Array(n + 1)].map((_, i) => [cx + Math.cos(rad(lerp(a0, a1, i / n))) * r, cy + Math.sin(rad(lerp(a0, a1, i / n))) * r]);
const onda = (x, y, w, n = 3) => [...Array(n * 4 + 1)].map((_, i) => [x + (w * i) / (n * 4), y + Math.sin((i * Math.PI) / 2) * 5]);
const raio = (cx, cy, g, r0, r1) => L([[cx + Math.cos(rad(g)) * r0, cy + Math.sin(rad(g)) * r0], [cx + Math.cos(rad(g)) * r1, cy + Math.sin(rad(g)) * r1]]);

// ---------- peças ----------
const CH = () => (LARGO ? [-220, 1220] : [120, 880]); // largura do chão: no quadro largo ele atravessa a cena
function chao(y, x0, x1) { // linha do chão com a hachura curta embaixo
  const f = [L([[x0, y], [x1, y]])];
  for (let x = x0 + 16; x < x1; x += 36) f.push(L([[x, y + 9], [x - 13, y + 21]], { larg: 3 }));
  return f;
}
function livro(x, y, w, h, cor) {
  return [F(rr(x, y, w, h, 8), cor), L([[x + w - 34, y + 4], [x + w - 34, y + h - 4]]), L([[x + 24, y + 4], [x + 24, y + h - 4]], { larg: 5 }),
    F(rr(x + w * 0.36, y + h * 0.24, w * 0.3, h * 0.52, 6), COR.tela), L(onda(x + w * 0.41, y + h * 0.5, w * 0.2), { larg: 4 })];
}
function caneca(x, y, s, cor) {
  return [L(arco(x + 150 * s, y + 70 * s, 42 * s, -80, 80), { larg: 10 }), F(rr(x, y, 150 * s, 150 * s, 22 * s), cor),
    F(rr(x + 34 * s, y + 52 * s, 72 * s, 44 * s, 6 * s), COR.tela), L(onda(x + 44 * s, y + 74 * s, 50 * s, 2), { larg: 4 })];
}
function vaso(x, y, s) {
  return [F(circulo(x + 30 * s, y - 50 * s, 46 * s, 18), COR.verde), F(circulo(x + 80 * s, y - 80 * s, 40 * s, 18), COR.verde),
    F(rr(x, y, 110 * s, 90 * s, 10 * s), COR.bege)];
}
function relogio(cx, cy, R, hora) { // despertador vermelho: sinos, corpo, mostrador, ponteiros, pés
  const ang = rad(hora * 30), marcas = [...Array(12)].map((_, i) => raio(cx, cy, i * 30, R * 0.68, R * 0.76));
  marcas.forEach((m) => (m.larg = 4));
  return {
    sinos: [F([...arco(cx - R * 0.62, cy - R * 0.78, R * 0.3, 160, 340)], COR.amarelo), F([...arco(cx + R * 0.62, cy - R * 0.78, R * 0.3, 200, 380)], COR.amarelo),
      L([[cx, cy - R], [cx, cy - R * 1.12]]), L([[cx - R * 0.12, cy - R * 1.12], [cx + R * 0.12, cy - R * 1.12]])],
    corpo: [F(circulo(cx, cy, R, 48), COR.vermelho), F(circulo(cx, cy, R * 0.8, 48), COR.tela), ...marcas,
      L([[cx, cy], [cx, cy - R * 0.6]], { larg: 6 }), L([[cx, cy], [cx + Math.sin(ang) * R * 0.42, cy - Math.cos(ang) * R * 0.42]], { larg: 7 }),
      L([[cx - R * 0.55, cy + R * 0.82], [cx - R * 0.75, cy + R * 1.1]]), L([[cx + R * 0.55, cy + R * 0.82], [cx + R * 0.75, cy + R * 1.1]])],
    toque: [L(arco(cx, cy, R * 1.25, 150, 210, 8)), L(arco(cx, cy, R * 1.4, 155, 205, 8)), L(arco(cx, cy, R * 1.25, -30, 30, 8)), L(arco(cx, cy, R * 1.4, -25, 25, 8))],
  };
}

// ---------- cenas ----------
const CENAS = {
  livros(r, a) {
    const fim = a.t1 - a.t0, ch = 790, h = 64, cores = [COR.vermelho, COR.bege, COR.amarelo, COR.verde, COR.rosa, COR.bege, COR.azul];
    const topo = ch - cores.length * h, sol = 500;
    const objetos = [
      ob([F(arco(sol, topo + 4, 92, 180, 360), COR.amarelo), ...[205, 230, 255, 270, 285, 310, 335].map((g) => raio(sol, topo + 4, g, 122, 162))], { em: 0.1, dura: 1.1, guia: true, ate: fim - SAI - 0.2 }),
      ob(chao(ch, ...CH()), { em: 0, dura: 0.6 }),
      ...cores.map((cor, i) => ob(livro(500 - 220 + (r() - 0.5) * 50, ch - (i + 1) * h, 420 + r() * 50, h, cor), { em: 0.25 + i * 0.12, dura: 0.9, ate: fim - SAI - (cores.length - i) * 0.04 })),
      ob(caneca(VIS.x0 - 110, 560, 1.6, COR.azul), { z: 0.6, em: 0.4, dura: 0.8 }), // perto: sai desfocada
      ob(vaso(VIS.x1 - 200, 200, 1.1), { z: 2.4, em: 0.5, dura: 0.8 }), // longe: também desfocado
    ];
    return { fundo: "papel", objetos, faisca: [[0, 870, ch - 14, 0], [1.6, 870, ch - 14, 0], [2.2, 870, ch - 14, 1]] };
  },
  despertador(r, a) {
    const ch = 780, rel = relogio(500, 520, 190, 7);
    const objetos = [
      ob(chao(ch, ...CH()), { em: 0, dura: 0.5 }),
      ob(rel.corpo, { em: 0.15, dura: 1.0, vibra: 3, guia: true }),
      ob(rel.sinos, { em: 0.5, dura: 0.6, vibra: 3 }),
      ob(rel.toque, { em: 1.1, dura: 0.4, vibra: 5 }),
      ob(caneca(VIS.x0 - 120, 560, 2, COR.azul), { z: 0.6, em: 0, dura: 0.6 }),
    ];
    // o foco começa na caneca de perto e corre para o relógio
    return { fundo: "papel", objetos, faisca: [[0, 860, ch - 14, 0]], foco: [[0, 0.6], [0.9, 0.6], [1.8, 1]], dof: 12 };
  },
  noite(r, a) {
    const fim = a.t1 - a.t0, mesa = 715, g = [[300, 410]];
    for (let x = 320; x <= 700; x += 14) g.push([x, x < 440 ? 410 + (x - 300) * 0.9 : 540 - r() * 150 + (x - 440) * 0.1]);
    const objetos = [
      ob([L([[VIS.x0, mesa], [VIS.x1, mesa]])], { em: 1.0, dura: 0.5 }),
      ob([F(rr(250, 300, 500, 340, 22)), F(rr(282, 332, 436, 276, 10)),
        L([[470, 640], [470, mesa - 12]]), L([[530, 640], [530, mesa - 12]]), L([[400, mesa - 10], [600, mesa - 10]])], { em: 1.1, dura: 1.0, guia: true }),
      ob([L(g, { tinta: COR.vermelho, larg: 5 })], { em: 2.1, dura: 1.6 }),
      ob([L([[830, mesa - 6], [870, 330], [770, 290]]), F([[700, 270], [790, 240], [810, 320]], COR.amarelo)], { em: 1.4, dura: 0.8 }),
      ob([...[0, 1, 2, 3, 4].map((i) => L([[740 - i * 40, 330 + i * 8], [560 - i * 50, 560]], { tinta: COR.amarelo, larg: 3 }))], { em: 2.0, dura: 0.6 }),
      ob([...caneca(VIS.x0 + 70, mesa - 105, 0.7, COR.azul), ...caneca(VIS.x0 + 70, mesa - 210, 0.7, COR.azul)], { em: 1.6, dura: 0.6 }),
      ob([F(circulo(170, 130, 70), null), L([[170, 130], [170, 82]]), L([[170, 130], [205, 150]])], { z: 1.8, em: 1.2, dura: 0.7 }),
    ];
    return { fundo: "noite", objetos, faisca: [[0, 715, 335, 0], [2.4, 715, 335, 0], [3.0, 715, 335, 1]], cam: [[0, 0, 0, 1], [fim, 0, -30, 1.09]] };
  },
  manha(r, a) {
    const hz = 640;
    const objetos = [
      ob([L([[VIS.x0 + 40, hz], [VIS.x1 - 40, hz]])], { em: 1.0, dura: 0.6 }),
      ob([F(arco(500, hz, 150, 180, 360), COR.amarelo), ...[200, 225, 250, 270, 290, 315, 340].map((g) => raio(500, hz, g, 185, 240))], { em: 1.4, dura: 1.4, guia: true }),
    ];
    return { fundo: "papel", objetos, faisca: [[0, VIS.x0 + 60, hz - 14, 0], [2.0, 330, hz - 14, 0], [2.6, 330, hz - 14, 1]] };
  },
};

// ---------- 001 · A lista ----------
const girar = (pts, g, cx, cy) => pts.map(([x, y]) => [cx + (x - cx) * Math.cos(rad(g)) - (y - cy) * Math.sin(rad(g)), cy + (x - cx) * Math.sin(rad(g)) + (y - cy) * Math.cos(rad(g))]);
function folha(x, y, w, h, cor = COR.tela) { // página de caderno com argolas em cima
  return [F(rr(x, y, w, h, 10), cor), ...[0, 1, 2, 3, 4].map((k) => F(circulo(x + w * (0.14 + k * 0.18), y, 9, 10), COR.tela))];
}
function item(x, y, w, o = {}) { return [F(rr(x, y, 26, 26, 5), null, o), L(onda(x + 46, y + 13, w - 60, 4), { larg: 5, ...o })]; }
function risca(x, y, w) { return [L([[x - 10, y + 15], [x + w * 0.4, y + 9], [x + w + 10, y + 13]], { tinta: COR.faisca, larg: 7 })]; }
function lapis(x, y, g) {
  const p = (pts) => girar(pts, g, x, y);
  return [F(p([[x, y - 16], [x + 230, y - 16], [x + 230, y + 16], [x, y + 16]]), COR.amarelo), F(p([[x + 230, y - 16], [x + 285, y], [x + 230, y + 16]]), COR.bege),
    F(p([[x - 40, y - 16], [x, y - 16], [x, y + 16], [x - 40, y + 16]]), COR.rosa)];
}
function telefone(x, y) {
  return [F(rr(x, y, 200, 370, 34), COR.azul), F(rr(x + 18, y + 40, 164, 270, 10), COR.tela), L([[x + 80, y + 340], [x + 120, y + 340]], { larg: 6 }),
    ...[0, 1, 2].map((k) => L(onda(x + 40, y + 90 + k * 55, 110, 3), { larg: 4 }))];
}
function balao(x, y, w, h, cor, lado) { // balão de conversa: rabinho para a esquerda (ela) ou direita (eu)
  const bx = lado < 0 ? x + 30 : x + w - 30;
  return [F([[bx - 20, y + h - 4], [bx + 20, y + h - 4], [bx - lado * 6 + lado * 22, y + h + 34]], cor), F(rr(x, y, w, h, 22), cor), L(onda(x + 30, y + h / 2, w - 60, 3), { larg: 4 })];
}
function luminaria(x, mesa, cor = COR.amarelo) {
  return [L([[x, mesa - 6], [x + 40, 330], [x - 60, 290]]), F([[x - 130, 270], [x - 40, 240], [x - 20, 320]], cor)];
}
function janela(x, y, w, h) {
  return [F(rr(x, y, w, h, 12), COR.celeste), F(circulo(x + w * 0.7, y + h * 0.38, h * 0.16, 20), COR.amarelo),
    L([[x + w / 2, y], [x + w / 2, y + h]]), L([[x, y + h / 2], [x + w, y + h / 2]])];
}
const LISTA = { x: 330, w: 340, y: 230, passo: 70, n: 8 }; // a lista do começo e do fim (o episódio fecha em loop)
function listaInteira(em0, o = {}) {
  const { x, w, y, passo, n } = LISTA;
  return [ob(folha(x - 30, y - 70, w + 60, passo * n + 100), { em: em0, dura: 0.8, guia: true, ...o }),
    ...[...Array(n)].map((_, k) => ob(item(x + 10, y + k * passo, w - 20), { em: em0 + 0.5 + k * 0.16, dura: 0.45, ...o }))];
}
const LONGA = { x: 380, w: 300, passo: 62 }; // a lista comprida da noite, pendurada até a mesa
function listaLonga(r, mesa, o, riscar = {}, sobra = null) {
  const y0 = VIS.y0 - 40, n = Math.floor((mesa - 60 - y0 - 40) / LONGA.passo), objs = [ob([F(rr(LONGA.x - 30, y0, LONGA.w + 60, mesa - 30 - y0, 10))], o)];
  for (let k = 0; k < n; k++) {
    const y = y0 + 40 + k * LONGA.passo, fica = !sobra || sobra.includes(k);
    objs.push(ob(item(LONGA.x, y, LONGA.w), { ...o, em: (o.em ?? 0) + (o.em >= 0 ? 0.3 + k * 0.05 : 0), ...(fica ? {} : { ate: 0.15 }) }));
    if (riscar[k] !== undefined) objs.push(ob(risca(LONGA.x, y, LONGA.w), { em: riscar[k], dura: 0.35, ...(o.ate ? { ate: o.ate } : {}), ...(fica ? {} : { ate: 0.15 }) }));
  }
  return objs;
}
const ZOOM_Y = () => (LARGO ? -90 : -162); // altura do zoom na lista, para a mesa não descer até a legenda
const ITEM_Y = (k) => VIS.y0 - 40 + 40 + k * LONGA.passo;

Object.assign(CENAS, {
  lista(r, a) {
    const largo = LARGO ? [ob(caneca(820, 650, 1.2, COR.azul), { em: 0.5, dura: 0.6 })] : [];
    return { fundo: "papel", objetos: [ob(chao(830, ...CH()), { em: 0, dura: 0.5 }), ...listaInteira(0.15), ...largo, ob(lapis(VIS.x1 - 260, 900, -28), { z: 0.6, em: 0.3, dura: 0.6 })] };
  },
  listaCresce(r, a) {
    const objetos = [ob(chao(830, ...CH()), { em: -10, dura: 0.5 })];
    const pilhas = LARGO ? [-180, 300, 780] : [300]; // no largo, três pilhas crescendo lado a lado
    for (let s = 0; s < 9 * pilhas.length; s++) {
      const x = pilhas[s % pilhas.length] + (r() - 0.5) * 80, y = 600 - Math.floor(s / pilhas.length) * 120, g = (r() - 0.5) * 10;
      objetos.push(ob([F(girar(rr(x, y, 400, 220, 10), g, x + 200, y + 110), COR.tela), ...[0, 1, 2].map((k) => L(girar(onda(x + 40, y + 60 + k * 50, 300, 5), g, x + 200, y + 110), { larg: 5 }))],
        { em: 0.1 + (s * 0.22) / pilhas.length, dura: 0.5 }));
    }
    return { fundo: "papel", objetos }; // a pilha sai pelo alto do quadro
  },
  cafe(r, a) {
    return {
      fundo: "papel", objetos: [
        ob(chao(780, ...CH()), { em: 0, dura: 0.5 }),
        ob(caneca(380, 520, 1.7, COR.azul), { em: 0.15, dura: 0.9, guia: true }),
        ob([0, 1, 2].map((k) => L([[440 + k * 50, 470], [452 + k * 50, 430], [432 + k * 50, 390], [450 + k * 50, 350]], { larg: 5 })), { em: 0.9, dura: 0.6, move: [[0, 0, 0], [3, 0, -12], [6, 0, 0]] }),
        ob([F(circulo(760, 200, 70)), L([[760, 200], [760, 150]]), L([[760, 200], [725, 230]])], { z: 1.8, em: 0.3, dura: 0.6 }),
        ob([...folha(VIS.x0 - 60, 600, 300, 330), ...[0, 1, 2, 3].map((k) => L(onda(VIS.x0 - 20, 660 + k * 60, 220, 4), { larg: 5 }))], { z: 0.6, em: 0.5, dura: 0.6 }),
      ],
    };
  },
  telefone(r, a) {
    const tel = telefone(400, 330);
    return {
      fundo: "papel", objetos: [
        ob(chao(780, ...CH()), { em: 0, dura: 0.5 }),
        ob(tel, { em: 0.15, dura: 0.8, vibra: 4, som: "telefone", somDura: 2.4 }),
        ob([L(arco(500, 515, 200, 160, 200, 8)), L(arco(500, 515, 230, 165, 195, 8)), L(arco(500, 515, 200, -20, 20, 8)), L(arco(500, 515, 230, -15, 15, 8))], { em: 0.6, dura: 0.3, vibra: 5 }),
        ob(caneca(VIS.x0 - 110, 600, 2, COR.vermelho), { z: 0.6, em: 0, dura: 0.5 }),
      ], foco: [[0, 0.6], [0.5, 0.6], [1.2, 1]], dof: 12,
    };
  },
  notebook(r, a) {
    return {
      fundo: "papel", objetos: [
        ob(chao(720, ...CH()), { em: 0, dura: 0.5 }),
        ob([F(rr(270, 340, 460, 300, 18), COR.tela), F(rr(296, 366, 408, 248, 8), null), F([[220, 650], [780, 650], [820, 712], [180, 712]], COR.celeste)], { em: 0.15, dura: 1.0, guia: true }),
      ],
      faisca: [[0, 500, 490, 0, 0], [1.1, 500, 490, 0, 0], [1.4, 500, 490, 0, 1], [2.3, 500, 490, 0, 1], [2.7, 500, 490, 1, 1]],
    };
  },
  baloes(r, a) {
    const objetos = [], abre = LARGO ? 320 : 0;
    for (let k = 0; k < 6; k++) {
      const dela = k % 2 === 0, w = 300 + r() * 120;
      objetos.push(ob(balao(dela ? 150 - abre : 850 + abre - w, 700 - k * 115, w, 80, dela ? COR.amarelo : COR.celeste, dela ? -1 : 1), { em: 0.1 + k * 0.35, dura: 0.45 }));
    }
    return { fundo: "papel", objetos, faisca: [[0, 840 + abre, 150, 0, 0], [1.9, 840 + abre, 150, 0, 0], [2.1, 840 + abre, 150, 0, 1], [2.6, 840 + abre, 150, 1, 1]] };
  },
  noiteMesa(r, a) {
    const mesa = 760;
    return {
      fundo: "noite", objetos: [
        ob([L([[VIS.x0, mesa], [VIS.x1, mesa]])], { em: 1.0, dura: 0.5, ate: 99 }),
        ...listaLonga(r, mesa, { em: 1.1, dura: 0.7, ate: 99 }),
        ob(luminaria(840, mesa), { em: 1.5, dura: 0.7, ate: 99 }),
        ob([0, 1, 2, 3].map((i) => L([[730 - i * 25, 300 + i * 10], [640 - i * 60, 520]], { tinta: COR.amarelo, larg: 3 })), { em: 2.0, dura: 0.5, ate: 99 }),
        ob(caneca(VIS.x0 - 60, 640, 1.8, COR.azul), { z: 0.6, em: 1.3, dura: 0.6 }),
      ], faisca: [[0, LONGA.x + LONGA.w + 40, 700, 0, 0], [1.6, LONGA.x + LONGA.w + 40, 700, 0, 0], [2.0, LONGA.x + LONGA.w + 40, 700, 0, 1]],
    };
  },
  riscar(r, a) {
    const fim = a.t1 - a.t0, mesa = 760, fz = a.fala ? a.fala.t0 - a.t0 : 0.5;
    return {
      fundo: "noite", objetos: [
        ob([L([[VIS.x0, mesa], [VIS.x1, mesa]])], { em: -10, ate: 99 }),
        ...listaLonga(r, mesa, { em: -10, ate: 99 }, { 1: fz + 0.2, 3: fz + 1.0, 6: fz + 1.9 }),
        ob(luminaria(840, mesa), { em: -10, ate: 99 }),
        ob([0, 1, 2, 3].map((i) => L([[730 - i * 25, 300 + i * 10], [640 - i * 60, 520]], { tinta: COR.amarelo, larg: 3 })), { em: -10, ate: 99 }),
      ], faisca: [[0, LONGA.x + LONGA.w + 40, 700, 1, 1], [fz, LONGA.x + LONGA.w + 40, 700, 1, 1], [fz + 0.2, LONGA.x - 40, ITEM_Y(1) + 13, 1, 1], [fz + 1.0, LONGA.x - 40, ITEM_Y(3) + 13, 1, 1], [fz + 1.9, LONGA.x - 40, ITEM_Y(6) + 13, 1, 1]],
      cam: [[0, 0, 0, 1], [fim, 30, ZOOM_Y(), 1.15]], // aproxima da lista enquanto risca; a mesa fica acima da legenda
    };
  },
  tres(r, a) {
    const fim = a.t1 - a.t0, mesa = 760, sobra = [2, 4, 5];
    return {
      fundo: "noite", objetos: [
        ob([L([[VIS.x0, mesa], [VIS.x1, mesa]])], { em: -10 }),
        ...listaLonga(r, mesa, { em: -10 }, { 1: -10, 3: -10, 6: -10 }, sobra),
        ob(luminaria(840, mesa), { em: -10 }),
      ], faisca: [[0, LONGA.x - 40, ITEM_Y(6) + 13, 1, 1], [0.6, LONGA.x + LONGA.w + 40, ITEM_Y(4) + 13, 0.3, 1]],
      cam: [[0, 30, ZOOM_Y(), 1.15], [fim, 30, ZOOM_Y() + 12, 1.2]],
    };
  },
  amanhecer(r, a) {
    const hz = 640;
    return {
      fundo: "ceu", objetos: [
        ob([F(circulo(500, hz, 140, 30), COR.amarelo)], { em: 1.0, dura: 0.8, move: [[0, 0, 160], [1.0, 0, 160], [3.2, 0, 10]] }),
        ob([F([[VIS.x0 - 60, hz], [VIS.x1 + 60, hz], [VIS.x1 + 60, VIS.y1 + 60], [VIS.x0 - 60, VIS.y1 + 60]], "#efe6cc")], { em: 1.0, dura: 0.5 }),
        ...[0, 1, 2].map((k) => ob([L([[380 + k * 120, 380], [400 + k * 120, 405], [440 + k * 120, 350]], { larg: 9 })], { em: 2.2 + k * 0.35, dura: 0.3 })),
      ], faisca: [[0, 300, hz - 14, 0, 0], [1.4, 300, hz - 14, 0, 0], [1.7, 300, hz - 14, 0, 1], [2.0, 300, hz - 14, 1, 1]],
    };
  },
  manha(r, a) {
    return {
      fundo: "papel", objetos: [
        ob(janela(560, 130, 300, 260), { z: 1.6, em: 1.0, dura: 0.8 }),
        ob(chao(780, ...CH()), { em: 1.0, dura: 0.5 }),
        ob(folha(220, 470, 300, 300), { em: 1.2, dura: 0.6 }),
        ...[0, 1, 2].map((k) => ob(item(250, 520 + k * 70, 240), { em: 1.6 + k * 0.25, dura: 0.4 })),
        ob(caneca(600, 630, 1.0, COR.azul), { em: 1.4, dura: 0.6 }),
      ],
    };
  },
  fim(r, a) {
    return {
      fundo: "papel", objetos: [ob(chao(830, ...CH()), { em: 0, dura: 0.5, ate: 99 }), ...listaInteira(0.15, { ate: 99 })],
      faisca: [[0, 760, 815, 0, 0], [1.2, 760, 815, 0, 0], [1.5, 760, 815, 0, 1], [1.9, 760, 815, 1, 1]],
    };
  },
});
