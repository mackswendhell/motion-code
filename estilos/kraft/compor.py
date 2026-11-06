"""Montagem final do Kraft: câmera no lugar de cada ato + camada do motor + voz, trilha e efeitos.

Uso (de dentro de estilos/kraft): python3 compor.py episodios/<slug>
Modo gravacao: a camada é <slug>.mov (com transparência). Cada quadro da gravação é recortado em volta do rosto
("enquadre" do tempo.json) na proporção do retângulo da câmera daquele ato (tela cheia, metade de baixo, cartão),
com o zoom do ato, e posto nesse retângulo. Na troca de layout, recorte e retângulo andam juntos na mesma curva
que o motor usa para o buraco no papel (sai, 0,45 s). A gravação não é cortada nem reordenada: só reenquadrada.
Modo narrado: a camada é <slug>.mp4, opaca, e a voz é audio/narracao.wav.
Saída: <slug>-final.mp4. Ajustes de áudio do painel (tweaks.json: voz, trilha, efeitos em dB) valem aqui.
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

pasta = Path(sys.argv[1]).resolve()
slug = pasta.name
T = json.loads((pasta / "tempo.json").read_text())
TW = json.loads((pasta / "tweaks.json").read_text()) if (pasta / "tweaks.json").exists() else {}
W, H = {"16:9": (1920, 1080), "9:16": (1080, 1920), "1:1": (1080, 1080)}[T["formato"]]
fps, total = T["fps"], T["total"]


def db(k):
    return TW.get(k, 0)


def sai(x):
    return 1 - (1 - min(1, max(0, x))) ** 3


def lerp(a, b, k):
    return {c: a[c] + (b[c] - a[c]) * k for c in a}


def recorte(g, r, zoom):
    """Janela na gravação com a proporção do retângulo r (em pixels de tela), centrada no rosto, com zoom."""
    w, h, fx, fy = g["w"], g["h"], g["enquadre"]["x"] * g["w"], g["enquadre"]["y"] * g["h"]
    asp = (r["w"] * W) / max(1, r["h"] * H)
    cw, ch = (h * asp, h) if w / h > asp else (w, w / asp)
    cw, ch = cw / zoom, ch / zoom
    x0 = min(max(fx - cw / 2, 0), w - cw)
    y0 = min(max(fy - ch * (0.38 if asp < 1 else 0.45), 0), h - ch)  # rosto no terço de cima em pé; mais ao centro deitado
    return {"x": x0, "y": y0, "w": cw, "h": ch}


def camera(a, t):
    """(retângulo na tela, janela na gravação) do quadro t, ou None se a câmera não aparece."""
    if not a.get("camera"):
        return None
    g, z = T["gravacao"], a.get("zoom", 1)
    fim = (a["camera"], recorte(T["gravacao"], a["camera"], z))
    if not a.get("cam_de"):
        return fim
    k = sai((t - a["t0"]) / a.get("cam_dura", 0.45))
    ini = (a["cam_de"], recorte(g, a["cam_de"], z))
    return lerp(ini[0], fim[0], k), lerp(ini[1], fim[1], k)


def quadros_camera(enc):
    g = T["gravacao"]
    src = subprocess.Popen(["ffmpeg", "-v", "error", "-i", g["arquivo"], "-vf", f"fps={fps}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                           stdout=subprocess.PIPE)
    n, tam = round(total * fps), g["w"] * g["h"] * 3
    preto = Image.new("RGB", (W, H))
    ultimo = None
    for f in range(n):
        b = src.stdout.read(tam)
        if len(b) == tam:
            ultimo = Image.frombuffer("RGB", (g["w"], g["h"]), b, "raw", "RGB", 0, 1)
        t = f / fps
        a = next((x for x in T["atos"] if t < x["t1"]), T["atos"][-1])
        cam, quadro = camera(a, t), preto.copy()
        if cam and ultimo:
            r, j = cam
            dw, dh = max(2, round(r["w"] * W)), max(2, round(r["h"] * H))
            pedaco = ultimo.crop((round(j["x"]), round(j["y"]), round(j["x"] + j["w"]), round(j["y"] + j["h"]))).resize((dw, dh), Image.LANCZOS)
            quadro.paste(pedaco, (round(r["x"] * W), round(r["y"] * H)))
        enc.stdin.write(quadro.tobytes())
        if f % 90 == 0:
            print(f"\r  câmera {f}/{n}", end="", flush=True)
    src.stdout.close()
    src.wait()
    print()


def main():
    g = T.get("gravacao")
    if g:
        ent = ["-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-", "-i", str(pasta / f"{slug}.mov"), "-i", g["arquivo"]]
        filtro = ["[0:v][1:v]overlay=format=auto:shortest=0[v]"]
        voz, n = f"[2:a]atrim=0:{total},asetpts=PTS-STARTPTS,aresample=48000", 3
    else:
        ent = ["-i", str(pasta / f"{slug}.mp4"), "-i", str(pasta / "audio" / "narracao.wav")]
        filtro = ["[0:v]null[v]"]
        voz, n = "[1:a]aresample=48000", 2
    ent += ["-i", str(pasta / "audio" / "trilha.wav"), "-i", str(pasta / "audio" / "efeitos.wav")]
    filtro.append(f"{voz},volume={db('voz')}dB,pan=stereo|c0=c0|c1=c0[vz]")
    filtro.append(f"[{n}:a]volume={db('trilha')}dB[tr]")
    filtro.append(f"[{n + 1}:a]volume={db('efeitos')}dB[fx]")
    filtro.append("[vz][tr][fx]amix=inputs=3:normalize=0,alimiter=limit=0.95[a]")
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", *ent, "-filter_complex", ";".join(filtro), "-map", "[v]", "-map", "[a]",
                            "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                            "-t", f"{total:.3f}", "-movflags", "+faststart", str(pasta / f"{slug}-final.mp4")], stdin=subprocess.PIPE)
    if g:
        quadros_camera(enc)
    enc.stdin.close()
    if enc.wait():
        sys.exit("ffmpeg falhou na montagem")
    print(f"ok: {pasta / f'{slug}-final.mp4'}")


if __name__ == "__main__":
    main()
