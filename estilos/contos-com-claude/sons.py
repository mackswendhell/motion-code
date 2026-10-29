"""Sons discretos dos elementos da cena, gerados em código e mixados bem baixo.

Uso: python3 sons.py episodios/<slug>   -> episodios/<slug>/audio/sons.wav

Automáticos: teclado enquanto o usuário tem a ação "digita"; "bup" no pulinho do Claude.
Pontuais (roteiro.json, por fala): "sons": [{"som": "envio" | "resposta" | "pop", "em": 0 | "fim" | segundos}]
"""

import subprocess
import sys
from pathlib import Path

import numpy as np

from roteiro import carregar

SR = 48000
rng = np.random.default_rng(11)


def db(x):
    return 10 ** (x / 20)


def env(n, ataque, queda):
    t = np.arange(n) / SR
    return np.minimum(t / ataque, 1) * np.exp(-t / queda)


def banda(x, lo, hi):
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(spec, len(x))


def tecla():
    n = int(0.05 * SR)
    clique = banda(rng.normal(0, 1, n), 1800, 6000) * env(n, 0.0005, 0.008)
    baque = np.sin(2 * np.pi * 140 * np.arange(n) / SR) * env(n, 0.001, 0.012) * 0.4
    return (clique + baque) * rng.uniform(0.6, 1.0)


def envio():
    n = int(0.32 * SR)
    t = np.arange(n) / SR
    sopro = banda(rng.normal(0, 1, n), 600, 4000) * np.sin(np.pi * t / t[-1]) ** 2 * 0.5
    toque = np.zeros(n)
    k = int(0.24 * SR)
    m = n - k
    toque[k:] = np.sin(2 * np.pi * 1180 * np.arange(m) / SR) * env(m, 0.002, 0.03)
    return sopro + toque * 0.8


def resposta():
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    a = np.sin(2 * np.pi * 880 * t) * env(n, 0.004, 0.18)
    b = np.zeros(n)
    k = int(0.09 * SR)
    b[k:] = np.sin(2 * np.pi * 1318.5 * t[: n - k]) * env(n - k, 0.004, 0.22)
    return (a + b) * 0.6


def bup():
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * (200 + 260 * t / t[-1]) * t) * env(n, 0.003, 0.04)


def pop():
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * (700 - 300 * t / t[-1]) * t) * env(n, 0.001, 0.02)


SONS = {"envio": (envio, -30), "resposta": (resposta, -32), "pop": (pop, -32)}


def main():
    ep = carregar(sys.argv[1])
    trilha = np.zeros(int(ep.total * SR) + SR)

    def por(som, t, nivel):
        a = int(t * SR)
        trilha[a:a + len(som)] += som[: len(trilha) - a] * db(nivel)

    # teclado: toques espaçados de forma irregular enquanto "digita"
    for p in ep.planos:
        if p["acoes"].get("usuario") == "digita":
            t = p["a"] + 0.1
            while t < p["b"] - 0.1:
                por(tecla(), t, -38)
                t += rng.uniform(0.07, 0.2) if rng.random() > 0.15 else rng.uniform(0.3, 0.5)
    # pulinho do Claude: bup no começo do segmento
    anterior = None
    for p in ep.planos:
        nome = p["acoes"].get("claude")
        if nome == "pulinho" and anterior != "pulinho":
            por(bup(), p["a"] + 0.03, -34)
        anterior = nome
    # pontuais, marcados no roteiro
    for f in ep.falas:
        for s in ep.falas_cfg[f["i"]].get("sons", []):
            gerador, nivel = SONS[s["som"]]
            t = f["t1"] + 0.05 if s.get("em") == "fim" else f["t0"] + float(s.get("em", 0))
            por(gerador(), t, nivel)

    for bl in ep.baloes + ep.cartoes:  # todo balão ou cartão aparece com um pop
        por(pop(), bl["t0"], -32)

    trilha *= ep.ganho_som(np.arange(len(trilha)) / SR)
    saida = Path(ep.pasta) / "audio" / "sons.wav"
    saida.parent.mkdir(exist_ok=True)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-t", f"{ep.total:.3f}", str(saida)], input=trilha.tobytes(), check=True)
    print(f"ok: {saida}")


if __name__ == "__main__":
    main()
