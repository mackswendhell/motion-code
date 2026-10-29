"""Som do Excel Desenhado: sem trilha, só o que se ouve mexendo numa planilha (clique, tecla, arrasto, lápis).

Uso (de dentro de estilos/excel-desenhado): python3 som.py episodios/<slug>
Lê tempo.json e eventos.json (escrito pelo capturar.mjs a partir das ações do roteiro).
Grava audio/efeitos.wav (estéreo, 48 kHz) do tamanho exato do vídeo, com tom de sala por baixo (nunca zero).
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 48000
pasta = Path(sys.argv[1])
tempo = json.loads((pasta / "tempo.json").read_text())
eventos = json.loads((pasta / "eventos.json").read_text())
N = int(tempo["total"] * SR)
rng = np.random.default_rng(5)


def banda(x, lo, hi):
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = 1 / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4)
    return np.fft.irfft(np.fft.rfft(x) * m, len(x))


def estalo(dur, lo, hi, decai, n=1, gap=0.004):
    """Um clique de plástico: um ou dois transientes curtos de ruído filtrado."""
    x = np.zeros(int((dur + gap * n) * SR))
    for i in range(n):
        tt = np.arange(int(dur * SR)) / SR
        a = int(i * gap * SR)
        x[a:a + len(tt)] += rng.normal(0, 1, len(tt)) * np.exp(-tt * decai) * (1 if i == 0 else 0.55)
    return banda(x, lo, hi)


def clique():
    return estalo(0.03, 1800, 7000, 260, n=2, gap=0.006)


def tecla():
    f = rng.uniform(0.85, 1.15)
    return estalo(0.04, 900 * f, 4500 * f, 180, n=2, gap=rng.uniform(0.008, 0.016)) * rng.uniform(0.6, 1.0)


def enter():
    return estalo(0.06, 500, 3500, 120, n=2, gap=0.02) * 1.3


def arrasto(dur):  # o mouse deslizando: ruído grave e macio, com a mão acelerando e freando
    x = banda(rng.normal(0, 1, int(dur * SR)), 250, 1400)
    tt = np.linspace(0, 1, len(x))
    return x * np.sin(np.pi * tt) ** 1.5 * 0.25


def lapis(dur):  # traço de lápis no papel: agudo granulado, em pinceladas
    x = banda(rng.normal(0, 1, int(dur * SR)), 2000, 8000)
    tt = np.linspace(0, 1, len(x))
    return x * (0.6 + 0.4 * np.abs(np.sin(tt * dur * 9 * np.pi))) * np.sin(np.pi * tt) ** 0.6 * 0.35


def papel():  # o gráfico entrando: um sopro leve de folha
    x = banda(rng.normal(0, 1, int(0.5 * SR)), 400, 5000)
    return x * np.sin(np.linspace(0, np.pi, len(x))) ** 2 * 0.18


SONS = {"clique": lambda e: clique(), "solta": lambda e: clique() * 0.7, "tecla": lambda e: tecla(), "enter": lambda e: enter(),
        "arrasto": lambda e: arrasto(e["dura"]), "lapis": lambda e: lapis(e["dura"]), "papel": lambda e: papel()}
mix = np.zeros((N, 2))
for e in eventos:
    x = SONS[e["tipo"]](e)
    a = int(e["t"] * SR)
    if a >= N:
        continue
    x = x[: N - a] / (np.abs(x).max() + 1e-9) * {"arrasto": 0.25, "lapis": 0.3, "papel": 0.2, "tecla": 0.45}.get(e["tipo"], 0.6)
    pan = rng.uniform(-0.25, 0.25)
    mix[a:a + len(x), 0] += x * (1 - pan)
    mix[a:a + len(x), 1] += x * (1 + pan)
sala = banda(rng.normal(0, 1, N), 80, 1200)
mix += np.stack([sala, np.roll(sala, 700)], 1) / np.sqrt(np.mean(sala ** 2)) * 10 ** (-62 / 20)
mix *= 10 ** (-6 / 20) / np.abs(mix).max()
(pasta / "audio").mkdir(exist_ok=True)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s16le",
                str(pasta / "audio" / "efeitos.wav")], input=mix.astype(np.float32).tobytes(), check=True)
print(f"ok: efeitos ({len(eventos)} eventos, {tempo['total']:.1f}s)")
