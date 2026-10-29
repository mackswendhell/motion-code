"""Cena low-poly montada e animada só com código, dirigida pelo roteiro.json do episódio.

Uso:
  blender -b -P cena.py -- --ep episodios/<slug> [--scale 100] [--frames 0-900] [--list 30,90]
Cada quadro é uma função pura do tempo: apply(T) posiciona tudo e o Eevee renderiza.
"""

import math
import os
import random
import sys

import bmesh
import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from roteiro import FPS, carregar  # noqa: E402


# ------------------------------------------------------------------ util

def srgb(hexstr):
    h = hexstr.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (1.0,)


_mats = {}


def mat(color, emit=0.0, rough=0.75):
    key = (color, emit, rough)
    if key in _mats:
        return _mats[key]
    m = bpy.data.materials.new(f"m_{color}_{emit}")
    if not m.node_tree:
        m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = srgb(color)
    bsdf.inputs["Roughness"].default_value = rough
    if emit:
        bsdf.inputs["Emission Color"].default_value = srgb(color)
        bsdf.inputs["Emission Strength"].default_value = emit
    _mats[key] = m
    return m


def finish(o, name, color, parent, loc, rot, scale, emit=0.0, rough=0.75):
    o.name = name
    o.parent = parent
    o.location = loc
    o.rotation_euler = rot
    o.scale = scale
    o.data.materials.append(mat(color, emit, rough))
    return o


def box(name, size, loc, color, parent=None, rot=(0, 0, 0), emit=0.0, rough=0.75):
    bpy.ops.mesh.primitive_cube_add(size=1)
    return finish(bpy.context.active_object, name, color, parent, loc, rot, size, emit, rough)


def ico(name, size, loc, color, parent=None, rot=(0, 0, 0), emit=0.0, subdiv=1):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdiv, radius=1)
    return finish(bpy.context.active_object, name, color, parent, loc, rot, size, emit)


def cone(name, r, depth, loc, color, parent=None, rot=(0, 0, 0), verts=4):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, depth=depth)
    return finish(bpy.context.active_object, name, color, parent, loc, rot, (1, 1, 1))


def cyl(name, r, depth, loc, color, parent=None, scale=(1, 1, 1), verts=10, rough=0.75):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth)
    return finish(bpy.context.active_object, name, color, parent, loc, (0, 0, 0), scale, rough=rough)


def rotulo(name, txt, size, loc, color, parent, emit=0.0):
    """Texto 3D de frente para -Y (a frente dos personagens)."""
    cu = bpy.data.curves.new(name, "FONT")
    cu.body, cu.size, cu.extrude = txt, size, 0.002
    cu.align_x, cu.align_y = "CENTER", "CENTER"
    o = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(o)
    o.parent, o.location, o.rotation_euler = parent, loc, (math.radians(90), 0, 0)
    o.data.materials.append(mat(color, emit))
    return o


def empty(name, loc, parent=None):
    o = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(o)
    o.parent = parent
    o.location = loc
    return o


def smooth(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def track(keys, t):
    """Interpola (tempo, valor) com ease in-out; segura as pontas."""
    if t <= keys[0][0]:
        return keys[0][1]
    for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
        if t <= t1:
            return v0 + (v1 - v0) * smooth((t - t0) / (t1 - t0))
    return keys[-1][1]


def blink(t, every=3.1, offset=0.0):
    p = (t + offset) % every
    return 0.1 if p < 0.12 else 1.0


# ------------------------------------------------------------------ cena

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    engines = {e.identifier for e in scene.render.bl_rna.properties["engine"].enum_items}
    scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "BLENDER_EEVEE"
    scene.eevee.taa_render_samples = 48
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.fps = FPS
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"
    try:
        scene.view_settings.view_transform = "AgX"
        scene.view_settings.look = "AgX - Medium High Contrast"
    except TypeError:
        pass

    world = bpy.data.worlds.new("noite")
    if not world.node_tree:
        world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = srgb("#0b1236")
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.35
    scene.world = world
    return scene


def build_set():
    rnd = random.Random(7)

    # mesa e parede abaixo da janela
    box("mesa", (1.9, 0.95, 0.05), (0, 0.15, 0.725), "#3a2622", rough=0.6)
    box("parede", (4, 0.1, 0.95), (0, 1.5, 0.45), "#0d1024")
    # montantes da janela (ficam desfocados, como nos prints)
    box("montante_v", (0.09, 0.09, 3.2), (0.42, 1.45, 2.4), "#06070f")
    box("montante_h", (3.4, 0.09, 0.09), (0, 1.45, 2.05), "#06070f")
    box("batente_e", (0.5, 0.1, 3.2), (-1.45, 1.45, 2.4), "#06070f")
    box("batente_d", (0.5, 0.1, 3.2), (1.45, 1.45, 2.4), "#06070f")

    # cidade: prédios escuros + janelas acesas (viram bokeh)
    windows = {c: bmesh.new() for c in ("#ffcf7a", "#ff9f5a", "#fff1d6")}
    for i in range(26):
        x = -6 + i * 0.5 + rnd.uniform(-0.2, 0.2)
        y = rnd.uniform(7, 15)
        w, h = rnd.uniform(0.8, 1.6), rnd.uniform(1.5, 7)
        box(f"predio{i}", (w, 0.6, h + 4), (x, y, h / 2 - 2), "#070a1c")
        for gx in range(int(w / 0.28)):
            for gz in range(int((h + 1) / 0.42)):
                if rnd.random() > 0.33:
                    continue
                bm = windows[rnd.choice(list(windows))]
                cx = x - w / 2 + 0.16 + gx * 0.28
                cz = -1 + gz * 0.42
                v = [bm.verts.new((cx + dx, y - 0.31, cz + dz)) for dx, dz in ((-.06, -.08), (.06, -.08), (.06, .08), (-.06, .08))]
                bm.faces.new(v)
    for color, bm in windows.items():
        me = bpy.data.meshes.new(f"janelas{color}")
        bm.to_mesh(me)
        o = bpy.data.objects.new(f"janelas{color}", me)
        o.data.materials.append(mat(color, emit=9))
        bpy.context.scene.collection.objects.link(o)

    # varal de lâmpadas
    for i in range(7):
        x = -1.2 + i * 0.4
        sag = 0.18 * (1 - ((x / 1.2) ** 2))
        ico(f"lampada{i}", (0.035,) * 3, (x, 1.25, 2.45 - sag), "#ffd9a0", emit=40, subdiv=2)

    # notebook (a tampa fica de costas para a câmera, a tela ilumina o dev)
    lap = empty("notebook", (-0.22, 0.08, 0.75))
    box("nb_base", (0.36, 0.25, 0.015), (0, 0, 0.008), "#2b2d36", lap)
    box("nb_tampa", (0.36, 0.012, 0.24), (0, -0.13, 0.12), "#3a3d48", lap, rot=(math.radians(-12), 0, 0))
    box("nb_tela", (0.33, 0.002, 0.21), (0, -0.115, 0.122), "#ffe2c4", lap, rot=(math.radians(-12), 0, 0), emit=2.5)

    # caneca
    bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.045, depth=0.11)
    finish(bpy.context.active_object, "caneca", "#e8e1d6", None, (-0.58, -0.02, 0.81), (0, 0, 0), (1, 1, 1))

    # partículas (poeira/bokeh na frente e atrás)
    particles = []
    for i in range(46):
        c = rnd.choice(["#ffd9a0", "#ff7a6b", "#dfe6ff", "#ffd9a0"])
        base = Vector((rnd.uniform(-1.4, 1.4), rnd.uniform(-1.2, 1.3), rnd.uniform(0.9, 2.9)))
        o = ico(f"particula{i}", (rnd.uniform(0.006, 0.014),) * 3, base, c, emit=rnd.uniform(6, 20), subdiv=1)
        particles.append((o, base, rnd.uniform(0, 6.28), rnd.uniform(0.02, 0.06)))
    return particles


def build_lights():
    def light(name, kind, energy, color, loc, rot=(0, 0, 0), size=None):
        d = bpy.data.lights.new(name, kind)
        d.energy = energy
        d.color = srgb(color)[:3]
        if size is not None:
            d.size = size
        o = bpy.data.objects.new(name, d)
        bpy.context.scene.collection.objects.link(o)
        o.location = loc
        o.rotation_euler = rot
        luzes[name] = (o, energy)
        return o

    luzes = {}
    light("tela", "AREA", 14, "#ffd2a8", (-0.22, 0.02, 0.98), rot=(math.radians(80), 0, 0), size=0.35)
    light("recorte_quente", "POINT", 160, "#ff8a4a", (0.8, 0.7, 1.5))
    light("topo_quente", "POINT", 30, "#ffc070", (0.55, 0.1, 1.35))
    light("quente_claude", "POINT", 22, "#ffb060", (0.85, -0.25, 1.05))
    light("janela_azul", "AREA", 32, "#5b74ff", (0, 1.3, 1.7), rot=(math.radians(-90), 0, 0), size=2.4)
    light("preenchimento", "AREA", 7, "#7c8cff", (0, -2.2, 1.6), rot=(math.radians(90), 0, 0), size=2)
    # destaque: luz frontal quente no Claude, só acende em planos com "luz": "quente"
    light("destaque", "AREA", 0, "#ffb070", (0.05, -0.45, 1.1), rot=(math.radians(80), 0, math.radians(-25)), size=0.4)
    return luzes


def build_dev():
    root = empty("dev", (-0.25, 0.36, 0))
    torso_pivot = empty("dev_torso", (0, 0, 0.72), root)
    box("dev_corpo", (0.36, 0.24, 0.42), (0, 0, 0.21), "#2532b8", torso_pivot)
    neck = empty("dev_pescoco", (0, 0, 0.43), torso_pivot)
    head = empty("dev_cabeca", (0, 0, 0.02), neck)
    skin = "#e9a58e"
    ico("dev_rosto", (0.15, 0.14, 0.165), (0, 0, 0.15), skin, head)
    ico("dev_orelha_e", (0.035, 0.025, 0.045), (-0.15, 0.0, 0.15), skin, head)
    ico("dev_orelha_d", (0.035, 0.025, 0.045), (0.15, 0.0, 0.15), skin, head)
    cone("dev_nariz", 0.03, 0.05, (0, -0.15, 0.13), "#d98f79", head, rot=(math.radians(90), 0, 0))
    eyes = [ico(f"dev_olho{i}", (0.017, 0.01, 0.02), (s * 0.055, -0.13, 0.18), "#15121a", head) for i, s in enumerate((-1, 1))]
    mouth = box("dev_boca", (0.055, 0.01, 0.008), (0, -0.135, 0.075), "#3a1a1e", head)
    hair = "#231c2b"
    ico("dev_cabelo", (0.16, 0.15, 0.1), (0, 0.02, 0.25), hair, head)
    rnd = random.Random(3)
    for i in range(9):
        a = i / 9 * math.tau
        cone(f"dev_espeto{i}", 0.06, 0.16, (math.cos(a) * 0.08, math.sin(a) * 0.07 + 0.02, 0.31),
             hair, head, rot=(math.sin(a) * 0.7 + rnd.uniform(-.2, .2), -math.cos(a) * 0.7, rnd.uniform(0, 1)))

    arms = {}
    for side, s in (("e", -1), ("d", 1)):
        shoulder = empty(f"dev_ombro_{side}", (s * 0.22, 0, 0.36), torso_pivot)
        box(f"dev_braco_{side}", (0.09, 0.09, 0.24), (0, 0, -0.12), "#2532b8", shoulder)
        elbow = empty(f"dev_cotovelo_{side}", (0, 0, -0.24), shoulder)
        box(f"dev_antebraco_{side}", (0.08, 0.08, 0.22), (0, 0, -0.11), "#2230ad", elbow)
        ico(f"dev_mao_{side}", (0.045,) * 3, (0, 0, -0.24), skin, elbow)
        arms[side] = (shoulder, elbow)
    duvida = rotulo("dev_duvida", "?", 0.24, (0.17, 0, 0.42), "#fff1d6", head, emit=4)
    return dict(root=root, torso=torso_pivot, head=head, eyes=eyes, mouth=mouth, arms=arms, duvida=duvida)


def build_claude():
    root = empty("claude", (0.29, 0.16, 0.75))
    body = empty("claude_corpo", (0, 0, 0.06), root)
    orange = "#e0703f"
    box("claude_cubo", (0.3, 0.22, 0.22), (0, 0, 0.11), orange, body, rough=0.55)
    eyes = [box(f"claude_olho{i}", (0.032, 0.01, 0.058), (s * 0.065, -0.112, 0.13), "#120d14", body) for i, s in enumerate((-1, 1))]
    box("claude_braco_e", (0.06, 0.07, 0.06), (-0.18, 0, 0.08), orange, body)
    box("claude_braco_d", (0.06, 0.07, 0.06), (0.18, 0, 0.08), orange, body)
    legs = [box(f"claude_perna{i}", (0.035, 0.035, 0.065), (x, y, 0.032), "#d0633a", root)
            for i, (x, y) in enumerate(((-0.1, -0.06), (-0.035, -0.06), (0.035, -0.06), (0.1, -0.06)))]
    return dict(root=root, body=body, eyes=eyes, legs=legs)


def chapeu_peao(n, texto, body):
    h = empty(f"peao{n}", (0, 0, 0), body)
    h.rotation_euler = (0, math.radians(8), 0)
    oval = (1.15, 0.85, 1)
    cyl(f"peao{n}_aba", 0.2, 0.015, (0, 0, 0.232), "#9a6532", h, (1, 0.85, 1))
    cyl(f"peao{n}_copa", 0.095, 0.09, (0, 0, 0.28), "#8a5a2b", h, oval)
    cyl(f"peao{n}_fita", 0.098, 0.022, (0, 0, 0.25), "#3a2416", h, oval)
    rotulo(f"peao{n}_txt", texto, 0.034, (0, -0.084, 0.292), "#f3e3c3", h)
    return h


def chapeu_capitao(n, texto, body):
    h = empty(f"capitao{n}", (0, 0, 0), body)
    cyl(f"capitao{n}_topo", 0.13, 0.035, (0, 0, 0.29), "#f2f0ea", h, (1, 0.9, 1))
    cyl(f"capitao{n}_faixa", 0.1, 0.05, (0, 0, 0.25), "#1b1d2b", h, (1.1, 0.9, 1))
    box(f"capitao{n}_pala", (0.17, 0.07, 0.012), (0, -0.11, 0.232), "#111218", h, rot=(-0.25, 0, 0), rough=0.3)
    rotulo(f"capitao{n}_txt", texto, 0.026, (0, -0.093, 0.252), "#e8b84a", h, emit=0.4)
    return h


CHAPEUS = {"peao": chapeu_peao, "capitao": chapeu_capitao}


# ------------------------------------------------------------------ direção

DEV_HEAD = Vector((-0.25, 0.36, 1.33))
CLAUDE_C = Vector((0.29, 0.16, 0.92))
FOCO = {"usuario": Vector((-0.2, 0.24, 1.33)), "claude": Vector((0.22, 0.08, 0.95))}
FOCO["meio"] = (FOCO["usuario"] + FOCO["claude"]) / 2

# nome: (câmera de, câmera para, alvo, lente, foco). O alvo fica acima do rosto para
# o personagem cair na metade de baixo do quadro e a legenda respirar em cima.
PLANOS = {
    "aberto": ((0.02, -2.0, 1.15), (0.02, -1.8, 1.12), (0.0, 0.25, 1.38), 32, "meio"),
    "dois": ((0.0, -1.6, 1.12), (0.0, -1.52, 1.12), (0.0, 0.25, 1.32), 36, "meio"),
    "close_usuario": ((0.3, -0.95, 1.33), (0.28, -0.87, 1.33), tuple(DEV_HEAD + Vector((0, 0, 0.1))), 50, "usuario"),
    "close_claude": ((-0.14, -1.08, 1.14), (-0.12, -1.0, 1.12), tuple(CLAUDE_C + Vector((0, 0, 0.17))), 50, "claude"),
    "claude_baixo": ((-0.1, -0.95, 0.86), (-0.08, -0.88, 0.86), tuple(CLAUDE_C + Vector((0, 0, 0.22))), 40, "claude"),
    "claude_camera": ((0.29, -1.12, 1.06), (0.29, -1.04, 1.05), tuple(CLAUDE_C + Vector((0, 0, 0.16))), 50, "claude"),
    "extremo_usuario": ((0.2, -0.62, 1.3), (0.19, -0.58, 1.3), tuple(DEV_HEAD + Vector((0, 0, 0.04))), 55, "usuario"),
    "extremo_claude": ((-0.1, -0.92, 1.04), (-0.09, -0.88, 1.03), tuple(CLAUDE_C + Vector((0, 0, 0.08))), 55, "claude"),
    "tela": ((0.0, -1.6, 1.12), (0.0, -1.55, 1.12), (0.0, 0.25, 1.32), 36, "meio"),
}

# canais de pose: valor padrão e o que cada ação muda
DEV_PADRAO = dict(yaw=0.8, pitch=0.0, lean=0.0, typing=0.0, point=0.0, bounce=0.0, flail=0.0, facepalm=0.0)
DEV_ACOES = {
    "digita": dict(typing=1, yaw=0.2, pitch=0.3),
    "aponta": dict(point=1),
    "orgulhoso": dict(lean=-0.14, pitch=-0.15, yaw=0.4),
    "desanima": dict(pitch=0.4, lean=0.14),
    "empolgado": dict(bounce=1),
    "olha_camera": dict(yaw=0.0, pitch=0.0),
    "encara_claude": dict(yaw=0.8, pitch=0.0),
    "agita_bracos": dict(flail=1, yaw=0.6),
    "pensa": dict(pitch=-0.3, yaw=0.5),
    "encara_tela": dict(yaw=0.2, pitch=0.3),
    "duvida": dict(pitch=0.35, yaw=0.3),  # olha pra baixo com um "?" na cabeça
    "mao_no_rosto": dict(facepalm=1, pitch=0.3, yaw=0.3),
}
CLAUDE_PADRAO = dict(yaw=-0.75, sigh=1.0, lean=0.0, squint=0.0)
CLAUDE_ACOES = {
    "olha_camera": dict(yaw=0.0),
    "suspira": dict(sigh=0.86),
    "inclina": dict(lean=0.22),
    "desconfia": dict(squint=1, yaw=-0.55),
    "pulinho": {},
    "pisca_lento": {},
}


def segmentos(ep, quem):
    """Junta planos seguidos com a mesma ação, para a pose não 'piscar' entre cortes."""
    segs = []
    for p in ep.planos:
        a, b, plano, nome = p["a"], p["b"], p["plano"], p["acoes"].get(quem)
        if quem == "claude" and not nome and plano == "claude_camera":
            nome = "olha_camera"
        if segs and segs[-1][2] == nome and abs(segs[-1][1] - a) < 1e-6:
            segs[-1][1] = b
        else:
            segs.append([a, b, nome])
    return [s for s in segs if s[2]]


def pose(T, segs, padrao, acoes):
    v = dict(padrao)
    for a, b, nome in segs:
        if a <= T <= b:
            env = smooth(min((T - a) / 0.3, (b - T) / 0.3, 1.0))
            for k, alvo in acoes.get(nome, {}).items():
                v[k] = padrao[k] + (alvo - padrao[k]) * env
    return v


def place_camera(cam, ep, T):
    k, p = ep.plano_em(T)
    a, b, plano, mov = p["a"], p["b"], p["plano"], p["movimento"]
    de, para, alvo, lente, foco = PLANOS.get(plano, PLANOS["dois"])
    de, para, alvo = Vector(de), Vector(para), Vector(alvo)
    if mov == "aproxima":
        para = para.lerp(alvo, 0.14)
    elif mov == "afasta":
        de, para = para, de + (de - alvo).normalized() * max(0.25, 0.1 * (b - a))  # plano longo afasta mais
    elif mov == "parado":
        para = de
    u = (T - a) / max(b - a, 0.01)
    pos = de.lerp(para, smooth(u) if mov != "aproxima" else u)
    if mov != "parado":  # câmera na mão
        pos += Vector((0.004 * math.sin(T * 1.3 + k), 0, 0.003 * math.sin(T * 1.7 + k * 2)))
    cam.location = pos
    direcao = alvo - pos
    cam.rotation_euler = direcao.to_track_quat("-Z", "Y").to_euler()
    if mov == "inclinado":
        cam.rotation_euler.rotate_axis("Z", math.radians(9))
    cam.data.lens = lente
    cam.data.dof.focus_distance = (FOCO[foco] - pos).length
    # closes pedem mais profundidade, senão a própria cara do personagem desfoca
    cam.data.dof.aperture_fstop = 0.9 if plano == "tela" else 1.2 if lente <= 36 else 2.8


def apply(T, rig):
    ep, dev, cl, cam = rig["ep"], rig["dev"], rig["claude"], rig["cam"]
    place_camera(cam, ep, T)
    luz = ep.plano_em(T)[1]["luz"]
    for nome, (o, energia) in rig["luzes"].items():
        quente = nome in ("recorte_quente", "quente_claude", "topo_quente")
        fator = (1.9 if quente else 0.8) if luz == "quente" else (0.4 if quente else 1.5) if luz == "fria" else 1.0
        o.data.energy = (9 if luz == "quente" else 0) if nome == "destaque" else energia * fator

    d = pose(T, rig["segs_dev"], DEV_PADRAO, DEV_ACOES)
    dev["torso"].location.z = 0.72 + 0.006 * math.sin(T * 2.1) + d["bounce"] * 0.02 * abs(math.sin(T * 9))
    dev["torso"].rotation_euler = (-d["lean"], 0, 0)
    dev["head"].rotation_euler = (-d["pitch"] + 0.03 * math.sin(T * 1.3), 0, d["yaw"])
    for e in dev["eyes"]:
        e.scale.z = 0.02 * blink(T, 3.4, 0.7)
    dev["mouth"].scale.z = 0.008 + 0.045 * ep.boca("usuario", T)
    for side, s in (("e", -1), ("d", 1)):
        shoulder, elbow = dev["arms"][side]
        tap = d["typing"] * 0.08 * math.sin(T * 22 + (0 if s < 0 else 1.7))
        sh_x, el_x, sh_z = -0.75 + tap, -0.9, s * -0.15
        if side == "d":
            p = d["point"]
            sh_x = sh_x * (1 - p) + (-1.25) * p
            el_x = el_x * (1 - p) + (-0.25 + 0.06 * math.sin(T * 6)) * p
            sh_z = sh_z * (1 - p) + 0.55 * p
            m = d["facepalm"]  # mão sobe até o rosto
            sh_x = sh_x * (1 - m) + (-1.75) * m
            el_x = el_x * (1 - m) + (-1.9) * m
            sh_z = sh_z * (1 - m) + (-0.75) * m
        fl = d["flail"]  # braços abrem para os lados e sacodem
        sh_x = sh_x * (1 - fl) + (-0.5 + 0.25 * math.sin(T * 13 + s)) * fl
        el_x = el_x * (1 - fl) + (-0.7 + 0.35 * math.sin(T * 13 + s + 1)) * fl
        sh_z = sh_z * (1 - fl)
        sh_y = -s * (1.9 + 0.55 * math.sin(T * 11 + s)) * fl
        shoulder.rotation_euler = (sh_x, sh_y, sh_z)
        elbow.rotation_euler = (el_x, 0, 0)

    c = pose(T, rig["segs_claude"], CLAUDE_PADRAO, CLAUDE_ACOES)
    hop, slow = 0.0, 1.0
    for a, b, nome in rig["segs_claude"]:
        if nome == "pulinho" and a <= T <= a + 0.35:
            hop = 0.06 * math.sin(math.pi * (T - a) / 0.35)
        if nome == "pisca_lento" and a <= T <= a + 0.85:
            slow = 0.08 + 0.92 * abs(math.cos(math.pi * (T - a) / 0.85))
    sz = c["sigh"] * (1 + 0.012 * math.sin(T * 2.4) + 0.06 * ep.boca("claude", T))
    cl["body"].scale = (1 / math.sqrt(sz), 1 / math.sqrt(sz), sz)
    cl["body"].location.z = 0.06 + hop
    cl["root"].rotation_euler = (c["lean"], 0, c["yaw"])
    for n, e in enumerate(cl["eyes"]):  # desconfia: um olho aperta mais que o outro
        e.scale.z = 0.058 * min(slow, blink(T, 2.7)) * (1 - c["squint"] * (0.45 if n == 0 else 0.85))

    q = 0.0
    for a, b, nome in rig["segs_dev"]:
        if nome == "duvida" and a <= T <= b:
            u = min(1.0, (T - a) / 0.25, (b - T) / 0.15)
            q = u * (1 + 0.3 * math.sin(math.pi * min(1.0, (T - a) / 0.25)))
    dev["duvida"].scale = (q,) * 3
    dev["duvida"].rotation_euler = (math.radians(90), 0, 0.15 * math.sin(T * 3))

    k, dt = ep.chapeu_em(T)
    for n, h in enumerate(rig["chapeus"]):  # o chapéu da vez entra com um pop
        u = min(1.0, dt / 0.25)
        h.scale = (u * (1 + 0.3 * math.sin(math.pi * u)),) * 3 if n == k else (0, 0, 0)

    for o, base, phase, speed in rig["particles"]:
        o.location = (
            base.x + 0.05 * math.sin(T * 0.4 + phase),
            base.y,
            0.9 + (base.z - 0.9 + T * speed) % 2.0 + 0.03 * math.sin(T * 0.7 + phase),
        )


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    args = dict(zip(argv[::2], argv[1::2]))
    ep = carregar(args.get("--ep"))
    out = os.path.join(ep.pasta, "frames")
    os.makedirs(out, exist_ok=True)
    total = int(ep.total * FPS)
    first, last = (int(x) for x in args.get("--frames", f"0-{total - 1}").split("-"))

    scene = reset()
    scene.render.resolution_percentage = int(args.get("--scale", 100))
    particles = build_set()
    luzes = build_lights()
    cam_data = bpy.data.cameras.new("camera")
    cam_data.dof.use_dof = True
    cam = bpy.data.objects.new("camera", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    claude = build_claude()
    chapeus = [CHAPEUS[c["tipo"]](n, c.get("texto", ""), claude["body"]) if c else empty(f"sem_chapeu{n}", (0, 0, 0))
               for n, (_, c) in enumerate(ep.chapeus)]
    rig = dict(ep=ep, luzes=luzes, dev=build_dev(), claude=claude, chapeus=chapeus, particles=particles, cam=cam,
               segs_dev=segmentos(ep, "usuario"), segs_claude=segmentos(ep, "claude"))

    frames = [int(x) for x in args["--list"].split(",")] if "--list" in args else range(first, last + 1)
    for f in frames:
        T = f / FPS
        if ep.preto(T):
            continue  # o fim preto é feito na pós
        apply(T, rig)
        scene.render.filepath = os.path.join(out, f"{f:05d}.png")
        bpy.ops.render.render(write_still=True)


main()
