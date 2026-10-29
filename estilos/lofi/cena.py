"""Cena lofi em loop: tudo o que se mexe é periódico no tempo do loop, então o último quadro emenda no primeiro.

Uso:
  blender -b -P cena.py -- --cena estudo --loop 13.333 --bpm 72 --saida pasta [--scale 50] [--list 0,100]
Cada quadro é função pura do tempo: apply(t) posiciona tudo e o Eevee renderiza.
"""

import math
import os
import random
import sys

import bpy
from mathutils import Vector

FPS = 24
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ARGS = dict(zip(argv[::2], argv[1::2]))
LOOP = float(ARGS.get("--loop", 13.333))
BPM = float(ARGS.get("--bpm", 72))
TAU = 2 * math.pi


def onda(t, ciclos, fase=0.0):
    """Seno com um número inteiro de ciclos por loop: sempre emenda."""
    return math.sin(TAU * (ciclos * t / LOOP + fase))


# ------------------------------------------------------------------ materiais e formas

def srgb(h):
    c = [int(h.lstrip("#")[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (1.0,)


_mats = {}


def mat(cor, rough=0.8, emit=0.0, tecido=False, relevo=0.15, escala=60.0):
    """Material fosco de brinquedo: cor + grão fino de relevo (o "feltro" da referência)."""
    key = (cor, rough, emit, tecido, relevo, escala)
    if key in _mats:
        return _mats[key]
    m = bpy.data.materials.new(f"m_{cor}")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = srgb(cor)
    b.inputs["Roughness"].default_value = rough
    if tecido:
        b.inputs["Sheen Weight"].default_value = 0.6
        b.inputs["Sheen Tint"].default_value = (1, 1, 1, 1)
    if emit:
        b.inputs["Emission Color"].default_value = srgb(cor)
        b.inputs["Emission Strength"].default_value = emit
    if relevo:
        ruido = nt.nodes.new("ShaderNodeTexNoise")
        ruido.inputs["Scale"].default_value = escala
        ruido.inputs["Detail"].default_value = 6
        bump = nt.nodes.new("ShaderNodeBump")
        bump.inputs["Strength"].default_value = relevo
        bump.inputs["Distance"].default_value = 0.01
        nt.links.new(ruido.outputs["Fac"], bump.inputs["Height"])
        nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    _mats[key] = m
    return m


def _fim(o, nome, m, loc, rot=(0, 0, 0), esc=(1, 1, 1), sub=0, parent=None):
    o.name = nome
    o.location, o.rotation_euler, o.scale = loc, rot, esc
    o.parent = parent
    o.data.materials.append(m)
    if sub:
        o.modifiers.new("sub", "SUBSURF").levels = sub
        o.modifiers["sub"].render_levels = sub
    if o.type == "MESH":
        for p in o.data.polygons:
            p.use_smooth = True
    return o


def caixa(nome, tam, loc, m, rot=(0, 0, 0), arred=0.0, parent=None):
    """Caixa; arred > 0 chanfra as quinas (madeira, livros, móveis)."""
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.active_object
    o.name = nome
    o.location, o.rotation_euler, o.scale = loc, rot, tam
    o.parent = parent
    o.data.materials.append(m)
    if arred:
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        bv = o.modifiers.new("bv", "BEVEL")
        bv.width, bv.segments = arred, 3
        for p in o.data.polygons:
            p.use_smooth = True
    return o


def bolha(nome, tam, loc, m, rot=(0, 0, 0), parent=None):
    """Cubo subdividido: forma macia de massinha (corpo, mangas, almofadas)."""
    bpy.ops.mesh.primitive_cube_add(size=1)
    return _fim(bpy.context.active_object, nome, m, loc, rot, tam, sub=3, parent=parent)


def bola(nome, r, loc, m, esc=(1, 1, 1), parent=None, seg=32):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=r)
    return _fim(bpy.context.active_object, nome, m, loc, esc=esc, parent=parent)


def cilindro(nome, r, h, loc, m, rot=(0, 0, 0), verts=24, parent=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h)
    return _fim(bpy.context.active_object, nome, m, loc, rot, parent=parent)


def membro(o, a, b, r):
    """Estica um elipsoide (raio 1) entre os pontos a e b: braço, antebraço, rabo."""
    a, b = Vector(a), Vector(b)
    o.location = (a + b) / 2
    o.rotation_euler = (b - a).to_track_quat("Z", "Y").to_euler()
    o.scale = (r, r, (b - a).length / 2 + r * 0.6)


def instancias(nome, malha, m, qtd):
    """Muitos objetos com a mesma malha (gotas de chuva, poeira): rápido de montar."""
    if not malha.materials:
        malha.materials.append(m)
    obs = []
    for i in range(qtd):
        o = bpy.data.objects.new(f"{nome}{i}", malha)
        bpy.context.scene.collection.objects.link(o)
        obs.append(o)
    return obs


# ------------------------------------------------------------------ mundo, luz, câmera

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = "BLENDER_EEVEE"
    s.eevee.taa_render_samples = int(ARGS.get("--amostras", 64))
    s.eevee.use_raytracing = True
    s.eevee.volumetric_tile_size = "2"
    s.eevee.volumetric_samples = 128
    s.eevee.volumetric_end = 8
    s.eevee.use_volumetric_shadows = True
    s.render.resolution_x, s.render.resolution_y = 1920, 1080
    s.render.resolution_percentage = int(ARGS.get("--scale", 50))
    s.render.fps = FPS
    s.render.image_settings.file_format = "PNG"
    s.view_settings.view_transform = "AgX"
    s.view_settings.look = "AgX - Medium High Contrast"
    w = bpy.data.worlds.new("quarto")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = srgb("#1a1420")
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.25
    vol = w.node_tree.nodes.new("ShaderNodeVolumePrincipled")
    vol.inputs["Density"].default_value = float(ARGS.get("--neblina", 0.028))
    w.node_tree.links.new(vol.outputs[0], w.node_tree.nodes["World Output"].inputs["Volume"])
    s.world = w
    return s


def luz(nome, tipo, loc, cor, energia, alvo=None, tam=0.1, cone=None):
    d = bpy.data.lights.new(nome, tipo)
    d.color = srgb(cor)[:3]
    d.energy = energia
    d.shadow_soft_size = tam
    if cone:
        d.spot_size, d.spot_blend = math.radians(cone), 0.7
    o = bpy.data.objects.new(nome, d)
    bpy.context.scene.collection.objects.link(o)
    o.location = loc
    if alvo:
        o.rotation_euler = (Vector(alvo) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    return o


def camera(loc, alvo, lente=42, foco=None, fstop=2.2):
    d = bpy.data.cameras.new("cam")
    d.lens = lente
    d.dof.use_dof = True
    d.dof.aperture_fstop = fstop
    d.dof.focus_distance = foco or (Vector(alvo) - Vector(loc)).length
    o = bpy.data.objects.new("cam", d)
    bpy.context.scene.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = (Vector(alvo) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = o
    return o


# ------------------------------------------------------------------ peças reaproveitáveis entre cenas

def claude_bonequinho(loc, tam=0.16, rot_z=0.0):
    """O Claude da referência do piano: caixa coral, olhos de ^, bracinhos e quatro perninhas."""
    coral, olho = mat("#e07a62", 0.85, relevo=0.05), mat("#3a2422", 0.6, relevo=0)
    raiz = bpy.data.objects.new("claude", None)
    bpy.context.scene.collection.objects.link(raiz)
    raiz.location, raiz.rotation_euler = loc, (0, 0, rot_z)
    s = tam
    corpo = caixa("claude_corpo", (s, s * 0.75, s * 0.78), (0, 0, s * 0.62), coral, arred=s * 0.03, parent=raiz)
    for lado in (-1, 1):
        caixa(f"claude_braco{lado}", (s * 0.14, s * 0.3, s * 0.18), (lado * s * 0.56, 0, s * 0.62), coral,
              arred=s * 0.02, parent=raiz)
        for k, x in enumerate((-0.32, 0.32)):
            caixa(f"claude_perna{lado}{k}", (s * 0.12, s * 0.12, s * 0.26), (x * s, lado * s * 0.24, s * 0.12), coral,
                  arred=s * 0.015, parent=raiz)
        for k, inc in enumerate((-1, 1)):  # o ^ é duas barrinhas inclinadas
            caixa(f"claude_olho{lado}{k}", (s * 0.12, s * 0.01, s * 0.03),
                  (lado * s * 0.22 + inc * s * 0.045, -s * 0.376, s * 0.7), olho,
                  rot=(0, inc * math.radians(-45), 0), parent=raiz)
    return dict(raiz=raiz, corpo=corpo, base=Vector(loc))


def gato(loc, rot_z=0.0, cor="#1d1a1f"):
    """Gato preto enrodilhado, dormindo: corpo, cabeça, orelhas e rabo em volta."""
    pelo = mat(cor, 0.7, tecido=True, relevo=0.1, escala=120)
    rosa = mat("#c98a8a", 0.8, relevo=0)
    raiz = bpy.data.objects.new("gato", None)
    bpy.context.scene.collection.objects.link(raiz)
    raiz.location, raiz.rotation_euler = loc, (0, 0, rot_z)
    corpo = bola("gato_corpo", 1, (0, 0, 0.07), pelo, esc=(0.17, 0.11, 0.075), parent=raiz)
    cabeca = bola("gato_cabeca", 0.075, (-0.15, -0.03, 0.08), pelo, esc=(1, 1, 0.85), parent=raiz)
    for lado in (-1, 1):
        bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.03, depth=0.055)
        orelha = _fim(bpy.context.active_object, f"gato_orelha{lado}", pelo, (0.0, lado * 0.035, 0.07),
                      rot=(lado * 0.35, -0.2, 0), parent=cabeca)
        bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.016, depth=0.03)
        _fim(bpy.context.active_object, f"gato_orelha_in{lado}", rosa, (0.004, 0, -0.008), parent=orelha)
    rabo = [bola(f"gato_rabo{i}", 1, (0, 0, 0), pelo, parent=raiz) for i in range(5)]
    return dict(raiz=raiz, corpo=corpo, cabeca=cabeca, rabo=rabo)


def animar_gato(g, t):
    respira = 1 + 0.035 * (0.5 + 0.5 * onda(t, LOOP / 3.2))  # ~3 s por respiração, arredondado no loop
    g["corpo"].scale = (0.17, 0.11 * respira, 0.075 * respira)
    g["cabeca"].rotation_euler = (0.04 * onda(t, 1), 0, 0)
    # rabo em volta do corpo; a ponta dá uma batidinha uma vez por loop
    fase = (t / LOOP) % 1
    pulo = math.exp(-((fase - 0.6) / 0.04) ** 2)
    for i, o in enumerate(g["rabo"]):
        ang = math.radians(-30 - i * 32)
        r = 0.16 + 0.01 * i
        a = Vector((math.cos(ang) * r * 1.05 + 0.02, math.sin(ang) * r * 0.8, 0.025 + 0.01 * pulo * i))
        ang2 = math.radians(-30 - (i + 1) * 32)
        b = Vector((math.cos(ang2) * r * 1.05 + 0.02, math.sin(ang2) * r * 0.8, 0.025 + 0.02 * pulo * (i + 1)))
        membro(o, a, b, 0.024 - i * 0.002)


def chuva(caixa_min, caixa_max, qtd=90, seed=3, neve=False):
    """Chuva (riscos) ou neve (flocos) do lado de fora da janela; cada um volta ao topo um número inteiro de vezes."""
    if neve:
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.007)
    else:
        bpy.ops.mesh.primitive_cylinder_add(vertices=4, radius=0.0018, depth=0.18)
    base = bpy.context.active_object
    malha = base.data
    bpy.data.objects.remove(base)
    obs = instancias("chuva", malha, mat("#eef2ff" if neve else "#9fb4ff", 0.3, emit=0.5 if neve else 0.18,
                                         relevo=0), qtd)
    rnd = random.Random(seed)
    voltas = (2, 3) if neve else (14, 16, 18)
    gotas = [(o, rnd.uniform(caixa_min[0], caixa_max[0]), rnd.uniform(caixa_min[1], caixa_max[1]),
              rnd.random(), rnd.choice(voltas)) for o in obs]
    return dict(gotas=gotas, z0=caixa_min[2], z1=caixa_max[2], neve=neve)


def animar_chuva(c, t):
    for o, x, y, fase, voltas in c["gotas"]:
        p = (fase + voltas * t / LOOP) % 1
        if c["neve"]:
            o.location = (x + 0.04 * math.sin(TAU * (2 * p + fase)), y, c["z1"] - p * (c["z1"] - c["z0"]))
        else:
            o.location = (x + 0.05 * p, y, c["z1"] - p * (c["z1"] - c["z0"]))
            o.rotation_euler = (0, -0.2, 0)


def parede_com_janela(jx0, jx1, jz0, jz1, parede, creme, py=0.95):
    """Parede do fundo com o vão de uma janela de caixilho (dois vidros por fileira)."""
    caixa("parede_esq", (3 + jx0, 0.1, 3), ((jx0 - 3) / 2, py, 1.5), parede)
    caixa("parede_dir", (3 - jx1, 0.1, 3), ((jx1 + 3) / 2, py, 1.5), parede)
    caixa("parede_baixo", (jx1 - jx0, 0.1, jz0), ((jx0 + jx1) / 2, py, jz0 / 2), parede)
    caixa("parede_cima", (jx1 - jx0, 0.1, 3 - jz1), ((jx0 + jx1) / 2, py, (3 + jz1) / 2), parede)
    caixa("peitoril", (jx1 - jx0 + 0.16, 0.36, 0.05), ((jx0 + jx1) / 2, py - 0.08, jz0), creme, arred=0.01)
    for x in (jx0, (jx0 + jx1) / 2, jx1):
        caixa(f"batente{x}", (0.05, 0.06, jz1 - jz0), (x, py, (jz0 + jz1) / 2), creme, arred=0.008)
    caixa("travessa", (jx1 - jx0, 0.06, 0.05), ((jx0 + jx1) / 2, py, (jz0 + jz1) / 2), creme, arred=0.008)
    caixa("verga", (jx1 - jx0 + 0.1, 0.07, 0.06), ((jx0 + jx1) / 2, py, jz1), creme, arred=0.008)


def la_fora(x0, x1, z0, z1, ceu="#1b2340", brilho=0.35, luzes=26, lua=None, seed=11):
    """Céu de fundo, prédios escuros e janelas acesas longe (viram bokeh no desfoque)."""
    caixa("ceu", (x1 - x0 + 4, 0.05, 3.5), ((x0 + x1) / 2, 3.2, 1.5), mat(ceu, 1, emit=brilho, relevo=0))
    rnd = random.Random(seed)
    for i in range(luzes):
        cor = rnd.choice(("#ffcf7a", "#ff9f5a", "#fff1d6"))
        bola(f"janela_longe{i}", 0.03, (rnd.uniform(x0 - 0.3, x1 + 0.3), 3.1, rnd.uniform(z0, z1)),
             mat(cor, 0.5, emit=rnd.uniform(4, 9), relevo=0))
    w = x1 - x0
    caixa("predio1", (w * 0.45, 0.1, 1.2), (x0 + w * 0.15, 2.6, 0.9), mat("#10142a", 1, relevo=0))
    caixa("predio2", (w * 0.35, 0.1, 1.5), (x0 + w * 0.85, 2.7, 0.9), mat("#121731", 1, relevo=0))
    if lua:
        bola("lua", 0.12, lua, mat("#fff2d0", 0.5, emit=6, relevo=0))


def poeira(centro, raio, qtd=70, seed=5, brilho=3.0):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.0035)
    base = bpy.context.active_object
    malha = base.data
    bpy.data.objects.remove(base)
    obs = instancias("poeira", malha, mat("#ffe2b0", 0.5, emit=brilho, relevo=0), qtd)
    rnd = random.Random(seed)
    return [(o, Vector(centro) + Vector([rnd.uniform(-1, 1) * r for r in raio]), rnd.random(),
             rnd.choice((1, 2)), rnd.uniform(0.02, 0.06)) for o in obs]


def animar_poeira(p, t):
    for o, c, fase, ciclos, amp in p:
        o.location = c + Vector((amp * onda(t, ciclos, fase), amp * 0.5 * onda(t, ciclos, fase + 0.3),
                                 amp * onda(t, ciclos, fase + 0.6)))


def vapor(loc, qtd=6):
    m = mat("#f3e6d6", 0.9, relevo=0)
    m.surface_render_method = "BLENDED"
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Alpha"].default_value = 0.12
    return [(bola(f"vapor{i}", 0.02, loc, m, seg=12), i / qtd) for i in range(qtd)], Vector(loc)


def animar_vapor(v, t):
    obs, base = v
    for o, fase in obs:
        p = (fase + 3 * t / LOOP) % 1
        o.location = base + Vector((0.02 * math.sin(TAU * (p + fase)), 0, p * 0.22))
        s = 0.6 + 1.6 * p
        o.scale = (s, s, s * 1.3)
        o.hide_render = p > 0.92


# ------------------------------------------------------------------ cena: estudo (a moça na escrivaninha, noite de chuva)

def cena_estudo():
    madeira = mat("#5b3524", 0.6, relevo=0.08, escala=25)
    parede = mat("#4a2e26", 0.95, relevo=0.06, escala=6)
    creme = mat("#d9cdb4", 0.8, relevo=0.05)
    pele = mat("#f1c3a0", 0.7, relevo=0.02)
    cabelo = mat("#5a2a1c", 0.55, relevo=0.25, escala=200)
    blusa = mat("#1f5444", 0.9, tecido=True, relevo=0.3, escala=180)
    cachecol = mat("#c0392b", 0.9, tecido=True, relevo=0.3, escala=180)
    fone = mat("#e8dcc4", 0.5, relevo=0.02)
    poltrona = mat("#8e1f1f", 0.85, tecido=True, relevo=0.2, escala=90)

    # quarto: parede do fundo com o vão da janela, mesa e prateleira
    parede_com_janela(-1.25, 0.45, 0.95, 2.1, parede, creme)
    la_fora(-1.25, 0.45, 0.9, 1.8)
    c = chuva((-1.3, 1.3, 0.6), (0.5, 2.2, 2.3))

    caixa("mesa", (2.6, 0.75, 0.06), (-0.35, 0.45, 0.75), madeira, arred=0.012)
    caixa("mesa_frente", (2.6, 0.04, 0.12), (-0.35, 0.08, 0.68), madeira, arred=0.01)
    caixa("prateleira", (0.9, 0.25, 0.04), (1.25, 0.82, 1.75), madeira, arred=0.008)
    for i in range(7):
        h = 0.18 + 0.06 * (i % 3)
        caixa(f"livro_prat{i}", (0.07, 0.17, h), (0.9 + i * 0.085, 0.8, 1.77 + h / 2),
              mat(("#7a4a2a", "#2f4a5a", "#a8763e", "#5a2a2a")[i % 4], 0.8, relevo=0.05), arred=0.006)

    # objetos da mesa
    papel = mat("#efe6d2", 0.9, relevo=0.05)
    caixa("caderno", (0.42, 0.3, 0.012), (0.08, 0.32, 0.786), papel, rot=(0, 0, 0.12))
    for i, (cor, h) in enumerate((("#8a5a3a", 0.05), ("#2f3e4f", 0.04), ("#b0743a", 0.045))):
        caixa(f"livro{i}", (0.34, 0.24, h), (-0.45, 0.42, 0.78 + sum((0.05, 0.04)[:i]) + h / 2),
              mat(cor, 0.8, relevo=0.05), rot=(0, 0, 0.1 * (i - 1)), arred=0.006)
    vaso = mat("#7a3a24", 0.85, relevo=0.1)
    cilindro("vaso", 0.09, 0.16, (-1.15, 0.5, 0.86), vaso)
    folha = mat("#4f7a3a", 0.7, relevo=0.15)
    folhas = []
    rnd = random.Random(4)
    for i in range(14):
        a = rnd.uniform(0, TAU)
        r = rnd.uniform(0.04, 0.16)
        o = bola(f"folha{i}", 1, (-1.15 + math.cos(a) * r, 0.5 + math.sin(a) * r * 0.6, 1.0 + rnd.uniform(0, 0.22)),
                 folha, esc=(0.06, 0.035, 0.012), seg=12)
        o.rotation_euler = (rnd.uniform(-0.6, 0.6), rnd.uniform(-0.6, 0.6), a)
        folhas.append((o, o.rotation_euler.copy(), rnd.random()))
    caneca = mat("#4c6b4a", 0.5, relevo=0.03)
    cilindro("caneca", 0.045, 0.1, (-0.8, 0.2, 0.83), caneca)
    v = vapor((-0.8, 0.2, 0.89))
    copo = cilindro("porta_lapis", 0.04, 0.12, (-0.95, 0.3, 0.84), mat("#c9a26a", 0.7, relevo=0.05))
    for i in range(4):
        cilindro(f"lapis{i}", 0.006, 0.2, (-0.95 + 0.015 * (i - 1.5), 0.3, 0.92), mat(("#d94f3a", "#e0b040",
                 "#3a6ad9", "#40a060")[i], 0.6, relevo=0), rot=(0.15 * (i - 1.5), 0.1, 0))

    # abajur (cúpula vermelha como na referência) e a luz quente dele
    cupula = mat("#b5352a", 0.6, relevo=0.05)
    bpy.ops.mesh.primitive_cone_add(vertices=40, radius1=0.24, radius2=0.1, depth=0.22, end_fill_type="NOTHING")
    cup = _fim(bpy.context.active_object, "cupula", cupula, (-0.55, 0.35, 1.72), rot=(0, -0.45, 0))
    cup.modifiers.new("esp", "SOLIDIFY").thickness = 0.01
    bola("lampada", 0.05, (-0.5, 0.35, 1.64), mat("#fff3d6", 0.3, emit=25, relevo=0))
    cilindro("haste", 0.012, 0.9, (-0.75, 0.6, 1.25), mat("#2a2420", 0.4, relevo=0), rot=(0.3, 0.25, 0))
    luz("abajur", "SPOT", (-0.47, 0.35, 1.6), "#ffb066", 260, alvo=(0.1, 0.32, 0.78), tam=0.05, cone=110)
    luz("abajur_bounce", "POINT", (-0.3, 0.2, 1.3), "#ff9a50", 40, tam=0.4)
    luz("janela", "AREA", (-0.4, 1.4, 1.6), "#6b84ff", 40, alvo=(0.2, 0, 1.0), tam=1.2)
    luz("preenche", "AREA", (0.2, -1.8, 1.6), "#ff9f70", 30, alvo=(0, 0.4, 1.0), tam=2.0)

    # a moça: de perfil, virada para a esquerda, cotovelo na mesa, mão no queixo, escrevendo
    caixa("poltrona_encosto", (0.18, 0.7, 0.9), (1.25, 0.35, 1.1), poltrona, rot=(0, -0.12, 0), arred=0.08)
    corpo = bolha("tronco", (0.3, 0.3, 0.46), (0.8, 0.4, 1.0), blusa, rot=(0, -0.35, 0))
    gola = bolha("cachecol", (0.22, 0.26, 0.11), (0.68, 0.4, 1.23), cachecol, rot=(0, -0.4, 0))
    cabeca = bola("cabeca", 0.13, (0.56, 0.38, 1.36), pele)
    cab = bola("cabelo", 0.152, (0.035, 0.0, 0.035), cabelo, esc=(1.0, 1.02, 1.0), parent=cabeca)
    bola("franja", 0.1, (-0.08, 0.0, 0.065), cabelo, esc=(0.75, 1.25, 0.6), parent=cabeca)
    bola("coque", 0.07, (0.07, 0.0, 0.15), cabelo, parent=cabeca)
    olho = mat("#2a1a14", 0.6, relevo=0)
    bola("olho", 1, (-0.112, -0.06, 0.0), olho, esc=(0.004, 0.022, 0.006), parent=cabeca)
    bola("bochecha", 1, (-0.09, -0.085, -0.04), mat("#e8907a", 0.8, relevo=0), esc=(0.02, 0.012, 0.015),
         parent=cabeca)
    bola("nariz", 0.016, (-0.135, -0.02, -0.02), pele, parent=cabeca)
    # fone grande: concha na orelha de cá e o arco por cima
    concha = cilindro("fone_concha", 0.07, 0.05, (0.03, -0.14, 0.0), fone, rot=(math.radians(90), 0, 0),
                      parent=cabeca)
    concha.modifiers.new("bv", "BEVEL").width = 0.012
    cilindro("fone_almofada", 0.055, 0.03, (0.03, -0.12, 0.0), mat("#7a2a2a", 0.8, tecido=True, relevo=0.1),
             rot=(math.radians(90), 0, 0), parent=cabeca)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.16, minor_radius=0.014)
    arco = bpy.context.active_object
    arco.data.vertices.foreach_set("select", [v.co.y < 0.02 for v in arco.data.vertices])
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.delete(type="VERT")
    bpy.ops.object.mode_set(mode="OBJECT")
    _fim(arco, "fone_arco", fone, (0.03, 0, 0.0), rot=(math.radians(90), 0, math.radians(90)), parent=cabeca)

    manga_apoio = bola("braco_apoio", 1, (0, 0, 0), blusa)
    antebraco_apoio = bola("antebraco_apoio", 1, (0, 0, 0), blusa)
    mao_apoio = bola("mao_apoio", 0.045, (0, 0, 0), pele)
    manga_escreve = bola("braco_escreve", 1, (0, 0, 0), blusa)
    antebraco_escreve = bola("antebraco_escreve", 1, (0, 0, 0), blusa)
    mao_escreve = bola("mao_escreve", 0.04, (0, 0, 0), pele)
    lapis = cilindro("lapis_mao", 0.006, 0.16, (0, 0, 0), mat("#2a3a5a", 0.5, relevo=0))

    g = gato((-0.15, 0.92, 0.99), rot_z=0.15)
    cl = claude_bonequinho((-0.42, 0.42, 0.915), tam=0.14, rot_z=-0.35)
    pz = poeira((-0.2, 0.35, 1.25), (0.5, 0.25, 0.35))
    camera((0.05, -2.6, 1.32), (-0.1, 0.4, 1.12), lente=40, foco=2.95, fstop=1.2)

    def apply(t):
        animar_chuva(c, t)
        animar_gato(g, t)
        animar_poeira(pz, t)
        animar_vapor(v, t)
        for o, r0, fase in folhas:
            o.rotation_euler = (r0[0] + 0.04 * onda(t, 2, fase), r0[1], r0[2])
        # Claude balança a cabeça no tempo da música (um ciclo por batida)
        bat = (t * BPM / 60) % 1
        cl["raiz"].location = cl["base"] + Vector((0, 0, 0.008 * abs(math.sin(math.pi * bat))))
        cl["corpo"].rotation_euler = (0, 0.06 * math.sin(TAU * bat / 2), 0)
        # respiração e cabeça apoiada na mão
        r = onda(t, round(LOOP / 4.2))
        corpo.scale = (0.3, 0.3, 0.46 * (1 + 0.012 * r))
        cabeca.location = (0.56, 0.38, 1.36 + 0.004 * r)
        cabeca.rotation_euler = (0.12 + 0.02 * onda(t, 1), -0.3, 0.0)
        # braço de apoio (lado de lá): cotovelo na mesa, mão sob o queixo
        membro(manga_apoio, (0.74, 0.54, 1.16), (0.44, 0.56, 0.84), 0.055)
        membro(antebraco_apoio, (0.44, 0.56, 0.84), (0.47, 0.44, 1.2), 0.045)
        mao_apoio.location = (0.47, 0.43, 1.23)
        # braço que escreve (lado de cá): a mão rabisca e anda devagar pela linha
        linha = (t / LOOP * 3) % 1
        mx = 0.2 - 0.18 * linha + 0.008 * onda(t, round(LOOP * 1.6))
        my = 0.25 + 0.006 * onda(t, round(LOOP * 2.3), 0.25)
        ombro = Vector((0.72, 0.26, 1.16))
        cotovelo = Vector((0.6, 0.2, 0.87))
        membro(manga_escreve, ombro, cotovelo, 0.055)
        membro(antebraco_escreve, cotovelo, (mx + 0.05, my, 0.81), 0.045)
        mao_escreve.location = (mx, my, 0.81)
        lapis.location = (mx - 0.02, my - 0.01, 0.83)
        lapis.rotation_euler = (0.2, -0.7, 0)
    return apply


def batida(t):
    """0 a 1 dentro da batida da música."""
    return (t * BPM / 60) % 1


def fone_de_ouvido(parent, r, cor="#e8dcc4", almofada="#7a2a2a", centro=(0, 0, 0)):
    """Arco por cima e as duas conchas, em volta de algo de raio r (cabeça da pessoa ou corpo do Claude)."""
    fone = mat(cor, 0.5, relevo=0.02)
    cx, cy, cz = centro
    for lado in (-1, 1):
        c = cilindro(f"fone_concha{lado}{parent.name}", r * 0.5, r * 0.38, (cx, cy + lado * r * 1.05, cz), fone,
                     rot=(math.radians(90), 0, 0), parent=parent)
        c.modifiers.new("bv", "BEVEL").width = r * 0.09
        cilindro(f"fone_alm{lado}{parent.name}", r * 0.4, r * 0.2, (cx, cy + lado * r * 0.88, cz),
                 mat(almofada, 0.8, tecido=True, relevo=0.1), rot=(math.radians(90), 0, 0), parent=parent)
    bpy.ops.mesh.primitive_torus_add(major_radius=r * 1.15, minor_radius=r * 0.1)
    arco = bpy.context.active_object
    arco.data.vertices.foreach_set("select", [v.co.y < 0.0 for v in arco.data.vertices])
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.delete(type="VERT")
    bpy.ops.object.mode_set(mode="OBJECT")
    _fim(arco, f"fone_arco{parent.name}", fone, centro, rot=(math.radians(90), 0, math.radians(90)), parent=parent)


def abajur_de_mesa(base, cor="#d9a441", alvo=(0, 0.3, 0.78), energia=180):
    """Luminária de braço: pé, haste, cúpula pequena e a luz quente."""
    bx, by, bz = base
    metal = mat(cor, 0.4, relevo=0.02)
    cilindro("lum_pe", 0.07, 0.02, (bx, by, bz + 0.01), metal)
    cilindro("lum_haste", 0.01, 0.55, (bx + 0.08, by, bz + 0.27), metal, rot=(0, 0.3, 0))
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=0.1, radius2=0.04, depth=0.12, end_fill_type="NOTHING")
    cup = _fim(bpy.context.active_object, "lum_cupula", metal, (bx + 0.2, by, bz + 0.55), rot=(0, -0.7, 0))
    cup.modifiers.new("esp", "SOLIDIFY").thickness = 0.006
    bola("lum_lampada", 0.03, (bx + 0.22, by, bz + 0.52), mat("#fff3d6", 0.3, emit=25, relevo=0))
    luz("lum", "SPOT", (bx + 0.24, by, bz + 0.5), "#ffb066", energia, alvo=alvo, tam=0.04, cone=100)


# ------------------------------------------------------------------ cena: teclado (o rapaz programando de madrugada)

def cena_teclado():
    madeira = mat("#7a5236", 0.6, relevo=0.08, escala=25)
    parede = mat("#3c3346", 0.95, relevo=0.06, escala=6)
    creme = mat("#d9cdb4", 0.8, relevo=0.05)
    pele = mat("#d9a27c", 0.7, relevo=0.02)
    cabelo = mat("#1e1814", 0.55, relevo=0.25, escala=200)
    moletom = mat("#c8902e", 0.9, tecido=True, relevo=0.3, escala=180)
    escuro = mat("#26262c", 0.5, relevo=0.02)

    parede_com_janela(0.15, 1.35, 0.95, 2.05, parede, creme)
    la_fora(0.15, 1.35, 0.9, 1.7, lua=(1.05, 3.0, 1.85))
    c = chuva((0.1, 1.3, 0.6), (1.4, 2.2, 2.2), qtd=40, neve=False)
    for o, *_ in c["gotas"]:
        o.hide_render = True  # noite limpa: a chuva fica desligada aqui
    rnd = random.Random(8)
    for i in range(7):  # post-its na parede
        caixa(f"postit{i}", (0.08, 0.005, 0.08), (-1.0 + rnd.uniform(-0.25, 0.35), 0.895, 1.35 + rnd.uniform(0, 0.45)),
              mat(rnd.choice(("#f2d45c", "#f28c8c", "#8cd3f2", "#a8e08c")), 0.9, relevo=0.05),
              rot=(0, rnd.uniform(-0.2, 0.2), 0))
    caixa("quadro", (0.5, 0.03, 0.36), (-0.2, 0.9, 1.75), mat("#2c2a30", 0.6, relevo=0), arred=0.01)
    caixa("quadro_arte", (0.42, 0.01, 0.28), (-0.2, 0.88, 1.75), mat("#e08a5a", 0.9, relevo=0.1))
    bola("quadro_sol", 0.07, (-0.12, 0.87, 1.78), mat("#f5d38a", 0.9, relevo=0.05), esc=(1, 0.2, 1))

    caixa("mesa", (2.8, 0.75, 0.06), (-0.2, 0.45, 0.75), madeira, arred=0.012)
    caixa("mesa_frente", (2.8, 0.04, 0.12), (-0.2, 0.08, 0.68), madeira, arred=0.01)

    # monitor virado para ele e meio para nós; o código sobe na tela
    mon = bpy.data.objects.new("monitor", None)
    bpy.context.scene.collection.objects.link(mon)
    mon.location, mon.rotation_euler = (-0.42, 0.5, 0.78), (0, 0, math.radians(50))
    cilindro("mon_base", 0.1, 0.015, (0, 0, 0.008), escuro, parent=mon)
    cilindro("mon_pe", 0.018, 0.25, (0, 0.03, 0.13), escuro, parent=mon)
    caixa("mon_corpo", (0.64, 0.045, 0.4), (0, 0, 0.44), escuro, arred=0.01, parent=mon)
    caixa("mon_tela", (0.6, 0.004, 0.36), (0, -0.024, 0.44), mat("#14303d", 0.3, emit=1.2, relevo=0), parent=mon)
    linhas = []
    for i in range(16):
        w = rnd.uniform(0.08, 0.36)
        ind = rnd.choice((0, 0.04, 0.08))
        o = caixa(f"codigo{i}", (w, 0.003, 0.011), (-0.26 + ind + w / 2, -0.027, 0), mat(
            rnd.choice(("#5ce1c8", "#f28cc8", "#f2d45c", "#cfe6ff")), 0.4, emit=3, relevo=0), parent=mon)
        linhas.append((o, i / 16))
    luz("tela", "AREA", (-0.3, 0.38, 1.2), "#8fd0ff", 35, alvo=(0.5, 0.36, 1.3), tam=0.5)

    teclado = caixa("teclado", (0.15, 0.44, 0.022), (0.28, 0.36, 0.79), escuro, arred=0.006)
    teclas = []
    for lin in range(4):
        for col in range(12):
            o = caixa(f"tecla{lin}{col}", (0.026, 0.026, 0.012),
                      (0.23 + lin * 0.033, 0.18 + col * 0.033, 0.806), mat("#e9e4da", 0.6, relevo=0), arred=0.003)
            teclas.append((o, rnd.random(), rnd.choice((7, 9, 11, 13))))
    caneca = cilindro("caneca", 0.045, 0.1, (0.0, 0.15, 0.83), mat("#c0504a", 0.5, relevo=0.03))
    v = vapor((0.0, 0.15, 0.89))
    cilindro("cacto_vaso", 0.06, 0.09, (-1.25, 0.55, 0.825), mat("#c98a5a", 0.85, relevo=0.1))
    bolha("cacto", (0.07, 0.07, 0.2), (-1.25, 0.55, 0.96), mat("#5a8a4a", 0.7, relevo=0.2))
    abajur_de_mesa((-1.0, 0.6, 0.78), alvo=(-0.4, 0.3, 0.78), energia=120)
    luz("janela", "AREA", (0.75, 1.4, 1.6), "#6b84ff", 35, alvo=(0.4, 0, 1.0), tam=1.0)
    luz("preenche", "AREA", (0.2, -1.8, 1.6), "#ff9f70", 22, alvo=(0, 0.4, 1.0), tam=2.0)

    # o rapaz: de perfil, virado para o monitor, as duas mãos no teclado
    caixa("cadeira", (0.16, 0.6, 0.85), (1.05, 0.36, 1.05), mat("#2f4a5a", 0.85, tecido=True, relevo=0.2),
          rot=(0, -0.1, 0), arred=0.07)
    corpo = bolha("tronco", (0.32, 0.32, 0.46), (0.76, 0.38, 1.0), moletom, rot=(0, -0.2, 0))
    bolha("capuz", (0.16, 0.28, 0.1), (0.8, 0.38, 1.2), moletom, rot=(0, 0.3, 0))
    cabeca = bola("cabeca", 0.125, (0.58, 0.38, 1.37), pele)
    bola("cabelo", 0.13, (0.035, 0.0, 0.045), cabelo, esc=(1.0, 1.03, 0.78), parent=cabeca)
    bola("topete", 0.07, (-0.05, 0.0, 0.11), cabelo, esc=(1.2, 1.4, 0.6), parent=cabeca)
    bola("olho", 0.012, (-0.108, -0.058, 0.0), mat("#1a1210", 0.4, relevo=0), parent=cabeca)
    bola("nariz", 0.016, (-0.128, -0.02, -0.025), pele, parent=cabeca)
    oculos = mat("#2a2420", 0.4, relevo=0)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.03, minor_radius=0.004)
    _fim(bpy.context.active_object, "oculos", oculos, (-0.112, -0.06, 0.0),
         rot=(0, math.radians(90), math.radians(-28)), parent=cabeca)
    caixa("oculos_haste", (0.1, 0.004, 0.004), (-0.05, -0.105, 0.005), oculos, rot=(0, 0, -0.3), parent=cabeca)
    fone_de_ouvido(cabeca, 0.125, cor="#e0e0e6", almofada="#3a6ad9", centro=(0.02, 0, 0.0))
    bracos = [(bola(f"braco{i}", 1, (0, 0, 0), moletom), bola(f"antebraco{i}", 1, (0, 0, 0), moletom),
               bola(f"mao{i}", 0.04, (0, 0, 0), pele)) for i in range(2)]

    g = gato((-1.05, 0.25, 0.79), rot_z=0.4)
    cl = claude_bonequinho((-0.42, 0.5, 1.395), tam=0.11, rot_z=-0.25)
    pz = poeira((-0.3, 0.4, 1.2), (0.5, 0.25, 0.3), qtd=40)
    camera((0.0, -2.6, 1.32), (-0.1, 0.4, 1.1), lente=40, foco=2.9, fstop=1.4)

    def apply(t):
        animar_gato(g, t)
        animar_poeira(pz, t)
        animar_vapor(v, t)
        for o, fase in linhas:
            p = (fase + 2 * t / LOOP) % 1
            o.location.z = 0.28 + p * 0.31
            o.hide_render = p > 0.97
        # digita em rajadas: duas pausas por loop, com as mãos paradas
        rajada = max(0.0, onda(t, 2, 0.1))
        bat = batida(t)
        cl["raiz"].location = cl["base"] + Vector((0, 0, 0.006 * abs(math.sin(math.pi * bat))))
        r = onda(t, round(LOOP / 4.2))
        corpo.scale = (0.32, 0.32, 0.46 * (1 + 0.012 * r))
        cabeca.location = (0.58, 0.38, 1.37 + 0.004 * r)
        cabeca.rotation_euler = (0, -0.08 + 0.025 * math.sin(math.pi * bat) ** 2, 0)  # acompanha a batida
        for i, (braco, ante, mao) in enumerate(bracos):
            y = 0.25 if i == 0 else 0.5
            ombro = Vector((0.72, y - 0.01 if i == 0 else y + 0.03, 1.16))
            cot = Vector((0.6, y - 0.06 if i == 0 else y + 0.06, 0.88))
            sobe = 0.012 * rajada * max(0.0, math.sin(TAU * (round(LOOP * 3.1) + 2 * i) * t / LOOP + i))
            m = Vector((0.3, y + 0.0, 0.82 + sobe))
            membro(braco, ombro, cot, 0.042)
            membro(ante, cot, m + Vector((0.04, 0, 0)), 0.036)
            mao.location = m
        for o, fase, ciclos in teclas:
            aperta = rajada > 0.05 and (fase + ciclos * t / LOOP) % 1 < 0.08
            o.location.z = 0.802 if aperta else 0.806
    return apply


# ------------------------------------------------------------------ cena: piano (o Claude tocando e o gato no entardecer)

def cena_piano():
    azul = mat("#36586a", 0.7, relevo=0.12, escala=40)
    parede = mat("#5a3c2c", 0.95, relevo=0.06, escala=6)
    creme = mat("#d9cdb4", 0.8, relevo=0.05)
    branco = mat("#efe8da", 0.45, relevo=0.02)
    preto = mat("#1c1a1e", 0.4, relevo=0.02)
    madeira = mat("#6a4128", 0.6, relevo=0.08, escala=25)

    # parede do fundo inteira; a janela fica na parede da esquerda e o sol cruza a sala de lado
    caixa("parede_fundo", (6, 0.1, 3), (0, 1.25, 1.5), parede)
    wx, y0, y1, z0, z1 = -1.4, -0.4, 0.9, 0.95, 2.05
    caixa("lateral_frente", (0.1, 2, 3), (wx, y0 - 1, 1.5), parede)
    caixa("lateral_fundo", (0.1, 1.25 - y1, 3), (wx, (y1 + 1.25) / 2, 1.5), parede)
    caixa("lateral_baixo", (0.1, y1 - y0, z0), (wx, (y0 + y1) / 2, z0 / 2), parede)
    caixa("lateral_cima", (0.1, y1 - y0, 3 - z1), (wx, (y0 + y1) / 2, (3 + z1) / 2), parede)
    for y in (y0, (y0 + y1) / 2, y1):
        caixa(f"batente{y}", (0.06, 0.05, z1 - z0), (wx, y, (z0 + z1) / 2), creme, arred=0.008)
    caixa("travessa", (0.06, y1 - y0, 0.05), (wx, (y0 + y1) / 2, (z0 + z1) / 2), creme, arred=0.008)
    caixa("ceu", (0.05, 6, 4), (-3.8, 0.3, 1.5), mat("#f2a35e", 1, emit=1.6, relevo=0))
    luz("sol", "SPOT", (-3.4, -0.6, 2.5), "#ffb070", 3800, alvo=(0.3, 0.8, 1.0), tam=0.05, cone=35)
    caixa("chao", (6, 4, 0.02), (0, 0.5, -0.01), madeira)
    for i, x in enumerate((0.3, 1.2)):
        caixa(f"moldura{i}", (0.42, 0.03, 0.34), (x, 1.19, 2.05), mat("#3a2418", 0.6, relevo=0), arred=0.01)
        caixa(f"moldura_arte{i}", (0.34, 0.01, 0.26), (x, 1.17, 2.05), mat(("#7a9a6a", "#6a7aa0")[i], 0.9,
              relevo=0.1))

    # piano de armário, azul-petróleo gasto, de frente
    caixa("piano_corpo", (2.4, 0.55, 1.3), (0.2, 0.92, 0.65), azul, arred=0.03)
    caixa("piano_tampo", (2.5, 0.6, 0.05), (0.2, 0.9, 1.32), azul, arred=0.015)
    caixa("piano_leito", (2.36, 0.32, 0.1), (0.2, 0.5, 0.7), azul, arred=0.015)
    caixa("piano_tampa", (2.36, 0.05, 0.26), (0.2, 0.66, 0.9), azul, arred=0.01)
    caixa("piano_friso", (2.38, 0.012, 0.02), (0.2, 0.635, 0.8), mat("#b88a4a", 0.4, relevo=0))
    teclas = []
    for k in range(36):
        x = 0.2 - 1.05 + k * 0.06
        o = caixa(f"tecla{k}", (0.056, 0.26, 0.035), (x, 0.47, 0.765), branco, arred=0.004)
        teclas.append((o, x))
        if k % 7 not in (2, 6) and k < 35:
            caixa(f"preta{k}", (0.032, 0.15, 0.04), (x + 0.03, 0.54, 0.795), preto, arred=0.004)
    papel = mat("#f1e9d6", 0.9, relevo=0.05)
    pata = mat("#3a2a24", 0.6, relevo=0)
    for lado in (-1, 1):
        caixa(f"partitura{lado}", (0.3, 0.008, 0.38), (0.5 + lado * 0.155, 0.6, 1.08), papel,
              rot=(math.radians(-12), 0, lado * math.radians(-6)))
        for lin in range(3):
            for k in range(7):
                bola(f"nota{lado}{lin}{k}", 0.008, (0.5 + lado * 0.155 - 0.11 + k * 0.035, 0.59 - 0.03 * lin,
                     1.18 - lin * 0.1 + 0.012 * math.sin(k * 1.7 + lin)), pata, seg=8)
    # vela no tampo: chama que tremula (ciclos inteiros) e a luz dela
    cilindro("castical", 0.04, 0.03, (1.05, 0.8, 1.36), mat("#c9a040", 0.3, relevo=0))
    cilindro("vela", 0.022, 0.14, (1.05, 0.8, 1.44), creme)
    chama = bola("chama", 0.016, (1.05, 0.8, 1.535), mat("#ffd890", 0.3, emit=40, relevo=0), esc=(1, 1, 1.9))
    luz_vela = luz("vela", "POINT", (1.05, 0.76, 1.56), "#ffa850", 30, tam=0.02)
    cilindro("vaso", 0.07, 0.12, (-0.75, 0.85, 1.4), mat("#7a3a24", 0.85, relevo=0.1))
    for i in range(8):
        a = i * TAU / 8
        o = bola(f"folha{i}", 1, (-0.75 + 0.07 * math.cos(a), 0.85 + 0.05 * math.sin(a), 1.52 + 0.02 * (i % 3)),
                 mat("#4f7a3a", 0.7, relevo=0.15), esc=(0.05, 0.03, 0.01), seg=12)
        o.rotation_euler = (0.5 * math.sin(a), 0.5 * math.cos(a), a)
    cilindro("caneca", 0.04, 0.09, (0.95, 0.85, 1.39), mat("#4c6b4a", 0.5, relevo=0.03))
    luz("preenche", "AREA", (0.4, -1.6, 1.4), "#ffcf9f", 25, alvo=(0, 0.5, 0.9), tam=2.0)
    luz("parede", "AREA", (0.6, 0.2, 2.4), "#ff9a60", 15, alvo=(0.4, 1.2, 1.4), tam=1.0)

    g = gato((-0.15, 0.92, 1.345), rot_z=0.1)
    cl = claude_bonequinho((0, 0.45, 0.782), tam=0.14, rot_z=0.0)
    pz = poeira((-0.4, 0.5, 1.1), (0.6, 0.3, 0.4), qtd=35, brilho=1.2)
    camera((0.15, -1.55, 1.0), (0.05, 0.5, 0.93), lente=35, foco=1.95, fstop=1.6)

    def apply(t):
        animar_gato(g, t)
        animar_poeira(pz, t)
        tremor = 1 + 0.06 * onda(t, round(LOOP * 1.3)) + 0.04 * onda(t, round(LOOP * 2.9), 0.3)
        chama.scale = (1, 1, 1.9 * tremor)
        luz_vela.data.energy = 30 * tremor
        # o Claude anda pelo teclado: vai e volta uma vez por loop, um pulinho por batida, a tecla afunda quando pisa
        bat = batida(t)
        x = -0.35 + 0.55 * (0.5 - 0.5 * math.cos(TAU * t / LOOP))
        pulo = abs(math.sin(math.pi * bat))
        cl["raiz"].location = (x, 0.45, 0.782 + 0.03 * pulo)
        cl["corpo"].rotation_euler = (0, 0.05 * math.sin(TAU * bat), 0)
        for o, kx in teclas:
            o.location.z = 0.757 if (abs(kx - x) < 0.07 and pulo < 0.3) else 0.765
    return apply


# ------------------------------------------------------------------ cena: discos (o Claude de fone, toca-discos e neve)

def cena_discos():
    madeira = mat("#6b4430", 0.6, relevo=0.08, escala=25)
    parede = mat("#2f4a48", 0.95, relevo=0.06, escala=6)
    creme = mat("#d9cdb4", 0.8, relevo=0.05)
    escuro = mat("#2a2420", 0.5, relevo=0.05)

    parede_com_janela(0.55, 1.55, 0.9, 2.0, parede, creme, py=1.0)
    la_fora(0.55, 1.55, 0.9, 1.6, ceu="#26325a", brilho=0.4, luzes=14, lua=(1.3, 3.0, 1.85))
    c = chuva((0.5, 1.3, 0.6), (1.6, 2.4, 2.2), qtd=110, neve=True)
    caixa("chao", (6, 4, 0.02), (0, 0.5, -0.01), mat("#5a3a2a", 0.7, relevo=0.08, escala=25))
    caixa("tapete", (1.6, 1.0, 0.01), (0.3, 0.1, 0.005), mat("#a8503a", 0.9, tecido=True, relevo=0.3, escala=150))

    # aparador com discos, toca-discos e caixinhas de som
    # aparador aberto na frente: tampo, laterais, fundo e os discos guardados à mostra
    caixa("aparador", (1.7, 0.45, 0.04), (-0.25, 0.68, 0.53), madeira, arred=0.01)
    caixa("aparador_fundo", (1.7, 0.03, 0.5), (-0.25, 0.89, 0.27), madeira)
    caixa("aparador_base", (1.7, 0.45, 0.04), (-0.25, 0.68, 0.06), madeira, arred=0.01)
    for x in (-1.08, 0.58):
        caixa(f"aparador_lado{x}", (0.04, 0.45, 0.51), (x, 0.68, 0.29), madeira, arred=0.01)
    rnd = random.Random(6)
    for i in range(18):
        caixa(f"disco_lombada{i}", (0.022, 0.32, 0.3), (-0.98 + i * 0.045, 0.7, 0.24),
              mat(rnd.choice(("#c0504a", "#e0b040", "#3a6a8a", "#efe6d2", "#4a7a4a", "#2a2a30")), 0.8, relevo=0.05),
              rot=(0, rnd.uniform(-0.05, 0.05), 0))
    caixa("toca_base", (0.48, 0.36, 0.08), (-0.35, 0.66, 0.59), mat("#8a5a3a", 0.5, relevo=0.05), arred=0.012)
    cilindro("prato", 0.155, 0.014, (-0.39, 0.66, 0.637), mat("#3a3a40", 0.3, relevo=0))
    disco = cilindro("vinil", 0.148, 0.006, (-0.39, 0.66, 0.648), mat("#151418", 0.25, relevo=0.05, escala=400),
                     verts=48)
    cilindro("rotulo", 0.05, 0.002, (0, 0, 0.004), mat("#c0392b", 0.7, relevo=0), parent=disco)
    caixa("rotulo_marca", (0.03, 0.008, 0.002), (0.02, 0, 0.006), mat("#efe6d2", 0.7, relevo=0), parent=disco)
    cilindro("braco_pivo", 0.018, 0.04, (-0.17, 0.78, 0.65), mat("#b0b0b8", 0.3, relevo=0))
    caixa("braco", (0.24, 0.01, 0.01), (-0.26, 0.72, 0.665), mat("#b0b0b8", 0.3, relevo=0), rot=(0, 0, 0.55))
    caixas_som = []
    for i, x in enumerate((-0.95, 0.4)):
        caixa(f"som{i}", (0.24, 0.24, 0.38), (x, 0.7, 0.74), escuro, arred=0.015)
        cone = cilindro(f"som_cone{i}", 0.07, 0.01, (x, 0.578, 0.7), mat("#151418", 0.6, relevo=0.05),
                        rot=(math.radians(90), 0, 0))
        cilindro(f"som_tweeter{i}", 0.025, 0.01, (x, 0.578, 0.85), mat("#151418", 0.6, relevo=0.05),
                 rot=(math.radians(90), 0, 0))
        caixas_som.append(cone)

    # prateleira de discos na parede e o varal de luzinhas
    caixa("prateleira", (1.2, 0.22, 0.03), (-0.4, 0.88, 1.55), madeira, arred=0.006)
    for i in range(10):
        caixa(f"capa{i}", (0.02, 0.18, 0.3), (-0.9 + i * 0.1, 0.87, 1.72), mat(rnd.choice((
            "#e08a5a", "#5ab0a0", "#f2d45c", "#c05080", "#efe6d2")), 0.8, relevo=0.05), rot=(0, 0.25 * (i % 2), 0))
    luzinhas = []
    for i in range(18):
        u = i / 17
        x = -1.5 + 2.0 * u
        z = 2.15 - 0.22 * math.sin(math.pi * u)
        m = mat(("#ffcf7a", "#ff9f5a", "#fff1d6")[i % 3], 0.4, emit=6, relevo=0)
        m = m.copy()  # cada lâmpada pisca no seu tempo
        luzinhas.append((bola(f"luzinha{i}", 0.018, (x, 0.93, z), m, seg=12), m, rnd.random()))

    # Claude de fone no aparador, o gato dormindo na almofada
    cl = claude_bonequinho((0.02, 0.62, 0.55), tam=0.15, rot_z=-0.3)
    giro = bpy.data.objects.new("claude_fone", None)
    bpy.context.scene.collection.objects.link(giro)
    giro.parent, giro.location, giro.rotation_euler = cl["corpo"], (0, 0, 0.0), (0, 0, math.radians(90))
    fone_de_ouvido(giro, 0.085, cor="#e8dcc4", almofada="#c0392b")
    bolha("almofada", (0.5, 0.45, 0.12), (0.62, 0.25, 0.07), mat("#d9a441", 0.9, tecido=True, relevo=0.3, escala=150))
    g = gato((0.65, 0.25, 0.13), rot_z=-0.3)

    # luminária de pé à esquerda
    metal = mat("#2a2420", 0.4, relevo=0)
    cilindro("pe_base", 0.12, 0.02, (-1.45, 0.6, 0.01), metal)
    cilindro("pe_haste", 0.012, 1.5, (-1.45, 0.6, 0.76), metal)
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=0.2, radius2=0.14, depth=0.24, end_fill_type="NOTHING")
    cup = _fim(bpy.context.active_object, "pe_cupula", mat("#e8c890", 0.8, emit=0.6, tecido=True, relevo=0.2),
               (-1.45, 0.6, 1.58))
    cup.modifiers.new("esp", "SOLIDIFY").thickness = 0.006
    luz("pe_luz", "POINT", (-1.45, 0.6, 1.55), "#ffb066", 90, tam=0.1)
    luz("aparador_luz", "SPOT", (-0.6, 0.0, 1.6), "#ffb873", 260, alvo=(-0.2, 0.65, 0.6), tam=0.2, cone=60)
    luz("janela", "AREA", (1.05, 1.5, 1.5), "#7090ff", 40, alvo=(0.4, 0, 0.8), tam=1.0)
    luz("preenche", "AREA", (0.2, -1.8, 1.4), "#ff9f70", 45, alvo=(0, 0.4, 0.7), tam=2.0)
    pz = poeira((-0.3, 0.4, 1.0), (0.8, 0.3, 0.45), qtd=35, brilho=1.5)
    camera((0.15, -2.6, 1.15), (0.0, 0.45, 0.85), lente=34, foco=2.7, fstop=1.6)

    voltas = max(1, round(LOOP * 33.3 / 60))  # 33 rpm, arredondado para fechar o loop

    def apply(t):
        animar_chuva(c, t)
        animar_gato(g, t)
        animar_poeira(pz, t)
        disco.rotation_euler = (0, 0, -TAU * voltas * t / LOOP)
        bat = batida(t)
        soco = math.exp(-bat * 7)
        for cone in caixas_som:
            cone.scale = (1 + 0.06 * soco, 1 + 0.06 * soco, 1 + 1.5 * soco)
        cl["raiz"].location = cl["base"] + Vector((0, 0, 0.01 * abs(math.sin(math.pi * bat))))
        cl["corpo"].rotation_euler = (0.08 * math.sin(TAU * bat / 2), 0, 0.04 * math.sin(TAU * bat / 4))
        for o, m, fase in luzinhas:
            m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 4 + 3 * onda(t, 2, fase)
    return apply


CENAS = {"estudo": cena_estudo, "teclado": cena_teclado, "piano": cena_piano, "discos": cena_discos}


def main():
    s = reset()
    apply = CENAS[ARGS.get("--cena", "estudo")]()
    saida = ARGS.get("--saida", "frames")
    os.makedirs(saida, exist_ok=True)
    total = round(LOOP * FPS)
    quadros = [int(x) for x in ARGS["--list"].split(",")] if "--list" in ARGS else range(total)
    for f in quadros:
        apply(f / FPS)
        s.render.filepath = os.path.join(saida, f"{f:05d}.png")
        bpy.ops.render.render(write_still=True)


main()
