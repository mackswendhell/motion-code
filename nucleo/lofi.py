"""Trilha lofi em loop exato: N compassos que emendam sem corte (tudo é circular: reverb, filtros, caudas).

Uso: python3 lofi.py saida.wav [--faixa estudo|piano|madrugada] [--seed 1] [--voltas 1]

Cada faixa fixa andamento, progressão e textura. O loop dura compassos * 4 * 60 / bpm; a 80 bpm, 8 compassos
são 24 s exatos (576 quadros a 24 fps), o que deixa o loop do vídeo casar com o da música.
--voltas 2 grava o loop duas vezes seguidas, para ouvir a emenda.
"""

import re
import subprocess
import sys

import numpy as np

SR = 48000
args = dict(zip(sys.argv[2::2], sys.argv[3::2]))
OUT = sys.argv[1]

FAIXAS = {
    # bpm, compassos, progressão (voicings em midi, um acorde por compasso), baixo (fundamental), chuva
    "estudo": dict(bpm=72, compassos=8, chuva=0.5, swing=0.6, acordes=[
        [53, 57, 60, 64, 67], [52, 55, 59, 62], [50, 53, 57, 60, 64], [48, 52, 55, 59, 62]],
        baixo=[41, 40, 38, 36]),
    "piano": dict(bpm=80, compassos=8, chuva=0.0, swing=0.58, acordes=[
        [50, 53, 57, 60, 64], [53, 55, 59, 62, 65], [52, 55, 59, 60, 64], [52, 57, 60, 64, 67]],
        baixo=[38, 43, 36, 45]),
    "madrugada": dict(bpm=90, compassos=8, chuva=0.2, swing=0.62, acordes=[
        [51, 55, 58, 62], [50, 53, 57, 60, 62], [48, 51, 55, 58, 62], [46, 50, 53, 57, 60]],
        baixo=[39, 38, 36, 34], escala=(0, 3, 5, 7, 10)),
}
F = FAIXAS[args.get("--faixa", "piano")]
rng = np.random.default_rng(int(args.get("--seed", 1)))
BEAT = 60 / F["bpm"]
L = F["compassos"] * 4 * BEAT
n = round(L * SR)


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def filtro(x, baixo=None, alto=None):
    """Passa-baixa / passa-alta pela FFT: circular, então não quebra a emenda."""
    s = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR) + 1e-9
    if baixo:
        s *= 1 / (1 + (f / baixo) ** 4)
    if alto:
        s *= 1 / (1 + (alto / f) ** 4)
    return np.fft.irfft(s, len(x))


def por(buf, sig, t):
    """Soma sig em buf a partir de t segundos, dando a volta no fim do loop."""
    a = int(round(t * SR)) % n
    sig = sig[:n]
    k = min(len(sig), n - a)
    buf[a:a + k] += sig[:k]
    buf[:len(sig) - k] += sig[k:]


def reverb(x, seg=2.5, mix=0.3):
    m = int(seg * SR)
    ir = filtro(rng.normal(0, 1, m) * np.exp(-np.arange(m) / (SR * seg / 6)), baixo=3000)
    wet = np.fft.irfft(np.fft.rfft(x) * np.fft.rfft(ir, n), n)  # convolução circular
    return x * (1 - mix) + wet / (np.abs(wet).max() + 1e-9) * np.abs(x).max() * mix


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def rhodes(m, dur=2.2, vel=1.0):
    t, f = tt(dur), hz(m)
    env = np.exp(-t * 1.8) * (1 - np.exp(-t * 300))
    tom = np.sin(2 * np.pi * f * t + 0.9 * np.exp(-t * 5) * np.sin(2 * np.pi * f * t))
    tom += 0.25 * np.exp(-t * 6) * np.sin(2 * np.pi * 2 * f * t)
    return vel * env * tom * (1 + 0.12 * np.sin(2 * np.pi * 4.2 * t))


def baixo(m, dur, vel=1.0):
    t, f = tt(dur), hz(m)
    env = np.minimum(t / 0.01, 1) * np.exp(-t * 1.2) * np.clip((dur - t) / 0.05, 0, 1)
    return vel * env * (np.sin(2 * np.pi * f * t) + 0.15 * np.sin(4 * np.pi * f * t))


def bumbo(vel=1.0):
    t = tt(0.5)
    fase = 2 * np.pi * np.cumsum(45 + 70 * np.exp(-t * 30)) / SR
    return vel * np.exp(-t * 8) * np.sin(fase)


def caixa(vel=1.0):
    t = tt(0.35)
    ruido = filtro(rng.normal(0, 1, len(t)), baixo=3200, alto=500)
    return vel * (0.8 * ruido * np.exp(-t * 16) + 0.5 * np.sin(2 * np.pi * 185 * t) * np.exp(-t * 28))


def chimbal(vel=1.0):
    t = tt(0.08)
    return vel * filtro(rng.normal(0, 1, len(t)), alto=7000) * np.exp(-t * 70)


teclas, grave, bateria, melodia = (np.zeros(n) for _ in range(4))
escala = sorted({p + o for p in F.get("escala", (0, 2, 4, 7, 9)) for o in (72, 84)})  # pentatônica de Dó
for c in range(F["compassos"]):
    t0 = c * 4 * BEAT
    ac, raiz = F["acordes"][c % 4], F["baixo"][c % 4]
    for i, m in enumerate(ac):  # acorde no 1, levemente arpejado, e um repique mais fraco
        por(teclas, rhodes(m, 3.0, 0.8), t0 + i * 0.018 + rng.uniform(0, 0.006))
    rep = rng.choice([1.5, 2.5, 3.5])
    for m in ac[1:]:
        por(teclas, rhodes(m, 1.4, 0.35), t0 + rep * BEAT + rng.uniform(0, 0.01))
    por(grave, baixo(raiz, 1.6 * BEAT), t0)
    por(grave, baixo(raiz + rng.choice([0, 7, 12]), 1.2 * BEAT, 0.7), t0 + 2.5 * BEAT)
    for b in (0, 1.5, 2.25) if c % 2 else (0, 1.75):
        por(bateria, bumbo(1.0 if b == 0 else 0.75), t0 + b * BEAT)
    for b in (1, 3):  # caixa um pouco atrás do tempo: o "preguiçoso" do lofi
        por(bateria, caixa(0.6), t0 + b * BEAT + 0.018)
    for k in range(8):
        sw = (F["swing"] - 0.5) * BEAT if k % 2 else 0
        por(bateria, chimbal(0.35 if k % 2 else 0.22) * rng.uniform(0.7, 1.0), t0 + k * BEAT / 2 + sw)
    if c >= F["compassos"] // 2:  # segunda metade ganha notas soltas por cima
        for b in sorted(rng.choice([0, 1, 1.5, 2, 2.5, 3], size=rng.integers(1, 3), replace=False)):
            por(melodia, rhodes(int(rng.choice(escala)), 2.0, 0.5), t0 + b * BEAT)

# bombeamento: as teclas abaixam um pouco a cada bumbo
duck = np.ones(n)
for c in range(F["compassos"]):
    t = tt(0.35)
    por(duck, -0.35 * np.exp(-t * 9), c * 4 * BEAT)

teclas = reverb(filtro(teclas, baixo=2600), 2.8, 0.35) * duck
melodia = reverb(filtro(melodia, baixo=3500), 3.5, 0.45)
grave = filtro(grave, baixo=400)
bateria = filtro(np.tanh(1.6 * bateria), baixo=4200, alto=40)

# disco e quarto: chiado constante, estalos, chuva opcional
chiado = filtro(rng.normal(0, 1, n), baixo=5000, alto=800)
estalos = np.zeros(n)
estalos[rng.integers(0, n, int(L * 6))] = rng.uniform(-1, 1, int(L * 6)) ** 3
estalos = filtro(estalos, baixo=6000, alto=300)
chuva = filtro(rng.normal(0, 1, n), baixo=2200, alto=300) * (1 + 0.15 * np.sin(2 * np.pi * 3 * np.arange(n) / n))


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


mix = (0.55 * norm(teclas) + 0.42 * norm(grave) + 0.5 * norm(bateria) + 0.22 * norm(melodia)
       + 0.025 * norm(chiado) + 0.08 * norm(estalos) + F["chuva"] * 0.1 * norm(chuva))

# fita: oscilação lenta de altura (wow), periódica no loop
ciclos = max(1, round(L / 2.7))
d = 0.0018 * SR * np.sin(2 * np.pi * ciclos * np.arange(n) / n)
pos = (np.arange(n) + d) % n
i0 = np.floor(pos).astype(int)
fr = pos - i0
mix = mix[i0] * (1 - fr) + mix[(i0 + 1) % n] * fr
mix = filtro(np.tanh(1.3 * norm(mix)), baixo=7500, alto=30)

mix = np.tile(mix, int(args.get("--voltas", 1)))
stereo = np.stack([mix, np.roll(mix, int(0.009 * SR))], axis=1).astype(np.float32)
crua = ["ffmpeg", "-loglevel", "info", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-"]
med = subprocess.run(crua + ["-af", "ebur128", "-f", "null", "-"], input=stereo.tobytes(), capture_output=True)
lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", med.stderr.decode())[-1])
ganho = 10 ** ((-16 - lufs) / 20)  # ganho fixo (não loudnorm dinâmico), para não quebrar a emenda
pico = np.abs(stereo).max() * ganho
stereo *= ganho * min(1, 0.89 / pico)
subprocess.run(crua[:2] + ["error"] + crua[3:] + [OUT], input=stereo.tobytes(), check=True)
print(f"ok: {OUT} ({F['bpm']} bpm, {F['compassos']} compassos, loop de {L:.3f}s)")
