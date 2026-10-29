"""Plantas que o código desenha ANTES da Higgsfield pintar: a geometria vem daqui, a pintura segue ela.

Uso: python3 guias.py favo episodios/<slug>/ativos [--seed 4]
Grava favo-guia.png (a planta, passada como referência para a pintura) e favo.json (centros, raio e tipo
de cada célula, em pixels da pintura), que o motor lê para animar exatamente em cima das células pintadas.
"""

import json
import math
import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw

W, H, R = 3840, 2160, 130  # pintura em 4k 16:9; células de raio 130 (≈ 97 px na tela com a câmera a 0,75)
CORES = {"mel": "#e0a030", "vazia": "#6b3f1c", "operculo": "#f1e2b8",
         "polen_laranja": "#e07a2a", "polen_magenta": "#b04a8a", "polen_verde": "#6a9a3a", "polen_vermelho": "#c23a2a", "polen_mostarda": "#d8b42a"}
PESOS = {"mel": 45, "vazia": 14, "operculo": 10, "polen_laranja": 7, "polen_magenta": 6, "polen_verde": 7, "polen_vermelho": 5, "polen_mostarda": 6}


def hexagono(cx, cy, r):
    return [(cx + r * math.cos(math.radians(60 * k - 90)), cy + r * math.sin(math.radians(60 * k - 90))) for k in range(6)]


def favo(pasta, seed):
    rnd = random.Random(seed)
    celulas = []
    dx, dy = math.sqrt(3) * R, 1.5 * R
    for lin in range(-1, int(H / dy) + 2):
        for col in range(-1, int(W / dx) + 2):
            cx, cy = dx * (col + 0.5 * (lin % 2)), dy * lin
            celulas.append({"x": round(cx, 1), "y": round(cy, 1), "tipo": rnd.choices(list(PESOS), list(PESOS.values()))[0]})
    alvo = min(celulas, key=lambda c: (c["x"] - W * 0.47) ** 2 + (c["y"] - H * 0.5) ** 2)  # "começou aqui": a célula vazia do ovo
    alvo["tipo"], alvo["alvo"] = "vazia", True
    img = Image.new("RGB", (W, H), "#e8c27a")  # cera das paredes
    d = ImageDraw.Draw(img)
    for c in celulas:
        d.polygon(hexagono(c["x"], c["y"], R * 0.86), fill=CORES[c["tipo"]])
    img.save(pasta / "favo-guia.png")
    (pasta / "favo.json").write_text(json.dumps({"w": W, "h": H, "r": R, "celulas": celulas}))
    print(f"ok: {len(celulas)} células, alvo em ({alvo['x']:.0f}, {alvo['y']:.0f})")


if __name__ == "__main__":
    seed = int(sys.argv[sys.argv.index("--seed") + 1]) if "--seed" in sys.argv else 4
    {"favo": favo}[sys.argv[1]](Path(sys.argv[2]), seed)
