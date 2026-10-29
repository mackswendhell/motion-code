"""Pós-produção: brilho, grão, vinheta, legendas, inserto da tela e corte para preto.

Uso: python3 pos.py episodios/<slug> [--still N saida.png]
Gera episodios/<slug>/<slug>.mp4 (com a voz, se audio/mix.wav existir).
"""

import subprocess
import sys
from functools import lru_cache
from multiprocessing import Pool
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from roteiro import FPS, carregar

W, H = 1080, 1920
FONT = "/System/Library/Fonts/Avenir Next.ttc"
BOLD, DEMI, MEDIUM, ITALIC = 0, 2, 5, 6
EP = None


@lru_cache(None)
def font(face, size):
    return ImageFont.truetype(FONT, size, index=face)


@lru_cache(None)
def vignette():
    y, x = np.mgrid[0:H, 0:W]
    d = np.sqrt(((x - W / 2) / (W * 0.75)) ** 2 + ((y - H / 2) / (H * 0.62)) ** 2)
    return np.clip(1.15 - d * 0.75, 0.45, 1.0)[..., None]


def smooth01(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def fade(t, start, end, fin=0.12, fout=0.12):
    return max(0.0, min(1.0, (t - start) / fin, (end - t) / fout))


def grade(img, frame):
    a = np.asarray(img, dtype=np.float32) / 255
    lum = a.mean(axis=2, keepdims=True)
    bright = Image.fromarray((np.clip((lum - 0.62) * 2.2, 0, 1) * a * 255).astype(np.uint8))
    small = bright.resize((W // 2, H // 2))
    glow = (np.asarray(small.filter(ImageFilter.GaussianBlur(10)).resize((W, H)), dtype=np.float32) * 0.55
            + np.asarray(small.filter(ImageFilter.GaussianBlur(36)).resize((W, H)), dtype=np.float32) * 0.7) / 255
    a = 1 - (1 - a) * (1 - glow)  # screen
    a *= vignette()
    noise = np.random.default_rng(frame).normal(0, 0.03, (H, W, 1)).astype(np.float32)
    a = a + noise * (0.6 + 0.4 * (1 - a.mean(axis=2, keepdims=True)))
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).convert("RGBA")


def text_layer(lines, alpha, y):
    """Bloco de texto centralizado com brilho escuro atrás, como nos prints."""
    layer = Image.new("RGBA", (W, H))
    d = ImageDraw.Draw(layer)
    cy = y
    for txt, fnt, color in lines:
        box = d.textbbox((0, 0), txt, font=fnt)
        d.text(((W - (box[2] - box[0])) / 2, cy), txt, font=fnt, fill=color + (int(255 * alpha),))
        cy += (box[3] - box[1]) + 22
    shadow = Image.new("RGBA", (W, H), (5, 6, 25, 0))
    shadow.putalpha(layer.getchannel("A").filter(ImageFilter.GaussianBlur(14)).point(lambda v: min(255, v * 1.4)))
    return Image.alpha_composite(shadow, layer)


def wrap(txt, fnt, width=900):
    words, out, cur = txt.split(), [], ""
    for w in words:
        test = f"{cur} {w}".strip()
        if fnt.getlength(test) > width and cur:
            out.append(cur)
            cur = w
        else:
            cur = test
    return out + [cur]


EMOJI = "/System/Library/Fonts/Apple Color Emoji.ttc"
JAPONES = "/System/Library/Fonts/Hiragino Sans GB.ttc"  # a Avenir não tem kana nem kanji


def eh_emoji(ch):
    o = ord(ch)
    return 0x2600 <= o <= 0x27BF or o >= 0x1F000


def eh_cjk(ch):
    return 0x3000 <= ord(ch) <= 0x9FFF


def medir(txt, fnt):
    """Largura do texto como o texto_com_emoji vai desenhar."""
    return sum(0 if ch == "\ufe0f" else ImageFont.truetype(JAPONES, fnt.size).getlength(ch) if eh_cjk(ch)
               else fnt.size * 1.15 if eh_emoji(ch) else fnt.getlength(ch) for ch in txt)


def texto_com_emoji(d, layer, xy, txt, fnt, cor):
    """Escreve texto trocando emojis pela fonte colorida da Apple (que só existe em 160 px)."""
    x, y = xy
    tam = fnt.size
    for ch in txt:
        if ch == "\ufe0f":
            continue
        if eh_cjk(ch):
            fj = ImageFont.truetype(JAPONES, tam)
            d.text((x, y), ch, font=fj, fill=cor)
            x += fj.getlength(ch)
        elif eh_emoji(ch):
            g = Image.new("RGBA", (180, 180))
            ImageDraw.Draw(g).text((0, 0), ch, font=ImageFont.truetype(EMOJI, 160), embedded_color=True)
            g = g.crop(g.getbbox() or (0, 0, 1, 1)).resize((int(tam * 1.05), int(tam * 1.05)))
            layer.alpha_composite(g, (int(x), int(y + tam * 0.1)))
            x += tam * 1.15
        else:
            d.text((x, y), ch, font=fnt, fill=cor)
            x += fnt.getlength(ch)


def militar(w, h, nome, n):
    """Retrato 3x4 de um brigadeiro da Aeronáutica, desenhado em dobro e reduzido (antisserrilhado)."""
    k = 2
    im = Image.new("RGBA", (w * k, h * k))
    d = ImageDraw.Draw(im)
    W2, H2 = w * k, h * k
    foto = H2 - 70 * k
    d.rounded_rectangle((0, 0, W2, foto), 18 * k, fill=(188, 198, 212, 255))
    cx = W2 / 2
    pele = [(226, 170, 140), (196, 140, 108)][n % 2]
    farda, ouro = (38, 58, 104), (232, 188, 74)
    d.ellipse((cx - 190 * k, foto - 150 * k, cx + 190 * k, foto + 160 * k), fill=farda)
    d.polygon([(cx - 45 * k, foto - 150 * k), (cx + 45 * k, foto - 150 * k), (cx, foto - 70 * k)], fill=(240, 240, 236))
    d.polygon([(cx - 10 * k, foto - 140 * k), (cx + 10 * k, foto - 140 * k), (cx + 14 * k, foto - 60 * k), (cx, foto - 50 * k), (cx - 14 * k, foto - 60 * k)], fill=(20, 22, 30))
    for s in (-1, 1):
        d.rectangle((cx + s * 120 * k - 38 * k, foto - 140 * k, cx + s * 120 * k + 38 * k, foto - 122 * k), fill=ouro)
    cores = [(200, 40, 50), (40, 120, 60), (230, 200, 60), (40, 80, 180), (200, 40, 50), (240, 240, 240)]
    for i in range(6):
        x, y = cx - 150 * k + (i % 3) * 30 * k, foto - 100 * k + (i // 3) * 22 * k
        d.rectangle((x, y, x + 26 * k, y + 16 * k), fill=cores[(i + n) % 6])
    d.rectangle((cx - 30 * k, foto - 190 * k, cx + 30 * k, foto - 140 * k), fill=pele)
    d.ellipse((cx - 75 * k, foto - 330 * k, cx + 75 * k, foto - 160 * k), fill=pele)
    for s in (-1, 1):
        d.ellipse((cx + s * 30 * k - 7 * k, foto - 262 * k, cx + s * 30 * k + 7 * k, foto - 248 * k), fill=(20, 18, 24))
        d.line((cx + s * 30 * k - 16 * k, foto - 278 * k, cx + s * 30 * k + 16 * k, foto - 272 * k + s * 0 * k), fill=(40, 30, 30), width=5 * k)
    if n % 2 == 0:
        d.ellipse((cx - 40 * k, foto - 222 * k, cx + 40 * k, foto - 200 * k), fill=(60, 44, 36))
    d.line((cx - 22 * k, foto - 192 * k, cx + 22 * k, foto - 192 * k), fill=(110, 50, 50), width=5 * k)
    d.ellipse((cx - 100 * k, foto - 380 * k, cx + 100 * k, foto - 300 * k), fill=farda)
    d.rectangle((cx - 78 * k, foto - 330 * k, cx + 78 * k, foto - 292 * k), fill=(24, 30, 52))
    d.chord((cx - 82 * k, foto - 312 * k, cx + 82 * k, foto - 270 * k), 0, 180, fill=(14, 14, 20))
    d.ellipse((cx - 16 * k, foto - 352 * k, cx + 16 * k, foto - 320 * k), fill=ouro)
    moldura = Image.new("L", im.size)
    ImageDraw.Draw(moldura).rounded_rectangle((0, 0, W2, foto), 18 * k, fill=255)
    im.putalpha(moldura)
    d = ImageDraw.Draw(im)
    f = font(DEMI, 30 * k)
    d.text(((W2 - f.getlength(nome)) / 2, foto + 18 * k), nome, font=f, fill=(236, 233, 226, 255))
    return im.resize((w, h), Image.LANCZOS)


def tela(dados, alpha):
    """Inserto-prova: a janela do chat mostrando o que acabou de acontecer."""
    layer = Image.new("RGBA", (W, H))
    d = ImageDraw.Draw(layer)
    x0, x1, y0 = 70, W - 70, 560
    pedido = wrap(dados.get("pedido", ""), font(MEDIUM, 40), 640) if dados.get("pedido") else []
    resposta = wrap(dados.get("resposta", ""), font(MEDIUM, 42), 860) if dados.get("resposta") else []
    rodape = dados.get("rodape")
    fotos = dados.get("fotos", [])
    fw, fh = (x1 - x0 - 110) // 2, 520
    h = 110 + len(pedido) * 52 + (60 if pedido else 0) + len(resposta) * 58 + (fh + 20 if fotos else 0) + (90 if rodape else 0)
    d.rounded_rectangle((x0, y0, x1, y0 + h), 36, fill=(30, 29, 27, 240), outline=(70, 66, 60, 255), width=2)
    d.text((x0 + 40, y0 + 30), "Claude", font=font(DEMI, 30), fill=(217, 119, 87, 255))
    y = y0 + 90
    if pedido:
        bw = max(font(MEDIUM, 40).getlength(l) for l in pedido) + 60
        d.rounded_rectangle((x1 - 40 - bw, y - 14, x1 - 40, y + len(pedido) * 52 + 10), 28, fill=(52, 50, 46, 255))
        for l in pedido:
            d.text((x1 - 70 - font(MEDIUM, 40).getlength(l), y), l, font=font(MEDIUM, 40), fill=(236, 233, 226, 255))
            y += 52
        y += 60
    for l in resposta:
        texto_com_emoji(d, layer, (x0 + 40, y), l, font(MEDIUM, 42), (236, 233, 226, 255))
        y += 58
    for n, nome in enumerate(fotos[:2]):
        layer.alpha_composite(militar(fw, fh, nome, n), (x0 + 40 + n * (fw + 30), int(y)))
    if fotos:
        y += fh + 20
    if rodape:
        d.text((x0 + 40, y + 24), rodape, font=font(DEMI, 34), fill=(160, 152, 140, 255))
    layer.putalpha(layer.getchannel("A").point(lambda v: int(v * alpha)))
    return layer


def balao(dados, alpha, sobe):
    """Mensagem curta flutuando: Claude à esquerda, usuário à direita."""
    layer = Image.new("RGBA", (W, H))
    d = ImageDraw.Draw(layer)
    fnt = font(MEDIUM, 34)
    linhas = wrap(dados["texto"], fnt, 520)
    larg = max(medir(l, fnt) for l in linhas) + 56
    alt = len(linhas) * 46 + 40
    claude = dados["de"] == "claude"
    x0 = 70 if claude else W - 70 - larg
    y0 = 400 - alt + int(14 * (1 - sobe))
    d.rounded_rectangle((x0, y0, x0 + larg, y0 + alt), 26,
                        fill=(36, 34, 31, 235) if claude else (217, 119, 87, 235))
    for k, l in enumerate(linhas):
        texto_com_emoji(d, layer, (x0 + 28, y0 + 18 + k * 46), l, fnt, (240, 236, 228, 255))
    layer.putalpha(layer.getchannel("A").point(lambda v: int(v * alpha)))
    return layer


CORES_CARTAO = [(66, 133, 244), (217, 119, 87), (219, 68, 55), (40, 40, 40), (232, 160, 40)]


def cartao(nome, n, alpha, sobe):
    """Cartão de app grátis: ícone com a inicial, nome e selo GRÁTIS. Empilha em duas colunas."""
    w, h = 360, 104
    c = Image.new("RGBA", (w + 20, h + 20))
    d = ImageDraw.Draw(c)
    d.rounded_rectangle((10, 10, 10 + w, 10 + h), 22, fill=(250, 248, 244, 245))
    d.ellipse((30, 32, 90, 92), fill=CORES_CARTAO[n % len(CORES_CARTAO)] + (255,))
    d.text((60, 62), nome[0], font=font(DEMI, 34), fill=(255, 255, 255), anchor="mm")
    d.text((108, 30), nome, font=font(DEMI, 32), fill=(30, 30, 30))
    d.rounded_rectangle((108, 76, 196, 102), 13, fill=(46, 160, 90))
    d.text((152, 89), "GRÁTIS", font=font(DEMI, 18), fill=(255, 255, 255), anchor="mm")
    c = c.rotate((-3, 2.5, -1.5, 3, -2)[n % 5], resample=Image.BICUBIC, expand=True)
    escala = 0.85 + 0.15 * sobe + 0.08 * __import__("math").sin(__import__("math").pi * sobe)
    c = c.resize((int(c.width * escala), int(c.height * escala)), Image.LANCZOS)
    c.putalpha(c.getchannel("A").point(lambda v: int(v * alpha)))
    col, lin = n % 2, n // 2
    cx, cy = (300, 830)[col] + (lin % 2) * 30, 170 + lin * 150 + col * 60
    return c, (cx - c.width // 2, cy - c.height // 2)


def overlay(img, T):
    k, p = EP.plano_em(T)
    plano = p["plano"]
    if p.get("tela"):
        a = b = k  # o inserto atravessa cortes seguidos com a mesma tela sem piscar
        while a > 0 and EP.planos[a - 1].get("tela") == p["tela"]:
            a -= 1
        while b + 1 < len(EP.planos) and EP.planos[b + 1].get("tela") == p["tela"]:
            b += 1
        al = fade(T, EP.planos[a]["a"], EP.planos[b]["b"], 0.2, 0.15)
        camada = tela(p["tela"], al)
        if p["tela"].get("topo"):  # inserto menor no alto, a cena continua visível embaixo
            card = camada.crop(camada.getbbox())
            card = card.resize((int(card.width * 0.6), int(card.height * 0.6)), Image.LANCZOS)
            camada = Image.new("RGBA", (W, H))
            camada.alpha_composite(card, ((W - card.width) // 2, 140))
        else:
            img = Image.alpha_composite(img, Image.new("RGBA", (W, H), (0, 0, 0, int(110 * al))))
        if p["movimento"] == "aproxima" and not p["tela"].get("topo"):  # zoom de câmera no inserto, centrado nas fotos
            z = 1 + 0.22 * smooth01((T - p["a"]) / max(p["b"] - p["a"], 0.01))
            cx, cy = W / 2, H * 0.52
            grande = camada.resize((int(W * z), int(H * z)))
            x, y = int(cx * z - cx), int(cy * z - cy)
            camada = grande.crop((x, y, x + W, y + H))
        img = Image.alpha_composite(img, camada)
    for bl in EP.baloes:
        if bl["t0"] <= T <= bl["t1"]:
            sobe = smooth01((T - bl["t0"]) / 0.18)
            img = Image.alpha_composite(img, balao(bl, fade(T, bl["t0"], bl["t1"], 0.15, 0.2), sobe))
    for n, c in enumerate(EP.cartoes):
        if c["t0"] <= T <= c["t1"]:
            camada, xy = cartao(c["nome"], n, fade(T, c["t0"], c["t1"], 0.12, 0.25), smooth01((T - c["t0"]) / 0.22))
            img.alpha_composite(camada, xy)
    f = EP.fala_em(T) or EP.fala_em(T - 0.25)
    if f:
        al = fade(T, f["t0"] - 0.05, f["t1"] + 0.25)
        y = 330 if plano == "tela" else 640
        lines = [(l, font(DEMI, 52), (240, 238, 255)) for l in wrap(f["texto"], font(DEMI, 52), 860)]
        img = Image.alpha_composite(img, text_layer(lines, al, y))
    return img


def init(pasta):
    global EP
    EP = carregar(pasta)


def process(args):
    src, frame = args
    T = frame / FPS
    if EP.preto(T):
        return bytes(W * H * 3)
    img = overlay(grade(Image.open(src).convert("RGB"), frame), T)
    if EP.ganho(T) < 1:
        img = Image.blend(Image.new("RGB", img.size), img.convert("RGB"), float(EP.ganho(T)))
    return img.convert("RGB").tobytes()


def main():
    pasta = sys.argv[1]
    init(pasta)
    frames = Path(EP.pasta) / "frames"
    if "--still" in sys.argv:
        f = int(sys.argv[sys.argv.index("--still") + 1])
        out = sys.argv[sys.argv.index("--still") + 2] if len(sys.argv) > sys.argv.index("--still") + 2 else f"/tmp/{f}.png"
        Image.frombytes("RGB", (W, H), process((frames / f"{f:05d}.png", f))).save(out)
        return
    out = str(Path(EP.pasta) / f"{EP.slug}.mp4")
    jobs = [(frames / f"{f:05d}.png", f) for f in range(int(EP.total * FPS))]
    mix, sons = Path(EP.pasta) / "audio" / "mix.wav", Path(EP.pasta) / "audio" / "sons.wav"
    final = Path(EP.pasta) / "audio" / "final.wav"
    audio = []
    if final.exists():
        audio = ["-i", str(final), "-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "192k"]
    elif mix.exists() and sons.exists():
        audio = ["-i", str(mix), "-i", str(sons), "-filter_complex", "[1:a][2:a]amix=inputs=2:normalize=0[a]",
                 "-map", "0:v", "-map", "[a]", "-c:a", "aac", "-b:a", "192k"]
    elif mix.exists():
        audio = ["-i", str(mix), "-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "192k"]
    ff = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                           "-r", str(FPS), "-i", "-"] + audio + ["-c:v", "libx264", "-crf", "17", "-preset", "slow",
                           "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-t", f"{EP.total:.3f}", out], stdin=subprocess.PIPE)
    with Pool(initializer=init, initargs=(pasta,)) as pool:
        for data in pool.imap(process, jobs, chunksize=4):
            ff.stdin.write(data)
    ff.stdin.close()
    ff.wait()
    print(f"pronto: {out}")


if __name__ == "__main__":
    main()
