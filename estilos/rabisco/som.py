"""Som do Rabisco: trilha que segue o roteiro e efeitos presos ao desenho.

Uso (de dentro de estilos/rabisco): python3 som.py episodios/<slug>
Lê roteiro.json (campo "musica" de cada ato), tempo.json, eventos.json (escrito pelo capturar.mjs)
e audio/narracao.wav (para calibrar os volumes pela voz).
Grava audio/trilha.wav e audio/efeitos.wav (estéreo, 48 kHz), do tamanho exato do vídeo.

Música por ato (a referência: pad baixo, quase silêncio antes da virada, cresce depois dela):
  leve      Ré maior, pad e notas de piano espaçadas
  noite     Si menor grave, piano raro
  silencio  só o tom de sala (nunca zero digital)
  cresce    Sol, Lá, Ré, mais alto e com notas cada vez mais juntas ao longo do ato
  fim       Rémaj9 parado, sumindo nos últimos 2 s
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 48000
pasta = Path(sys.argv[1])
roteiro = json.loads((pasta / "roteiro.json").read_text())
tempo = json.loads((pasta / "tempo.json").read_text())
eventos = json.loads((pasta / "eventos.json").read_text())
TOTAL = tempo["total"]
N = int(TOTAL * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(3)

ACORDES = {  # midi
    "leve": [[50, 57, 62, 64, 66, 69], [47, 54, 59, 62, 66], [43, 50, 55, 59, 62, 66], [45, 52, 57, 59, 64]],
    "noite": [[35, 47, 54, 59, 61, 62], [40, 47, 52, 55, 59, 66]],
    "silencio": [[50, 57, 62]],
    "cresce": [[43, 50, 55, 59, 62, 66, 71], [45, 52, 57, 61, 64, 69, 73], [50, 57, 62, 66, 69, 74, 76]],
    "fim": [[50, 57, 62, 64, 66, 69, 74]],
}
NIVEL = {"leve": 0.55, "noite": 0.45, "silencio": 0.0, "cresce": 1.0, "fim": 0.7}


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def banda(x, lo, hi):
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = 1 / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4)
    return np.fft.irfft(np.fft.rfft(x) * m, len(x))


def reverb(x, seg=2.5, mix=0.35):
    m = int(seg * SR)
    ir = banda(rng.normal(0, 1, m) * np.exp(-np.arange(m) / (SR * seg / 6)), 80, 4000)
    wet = np.fft.irfft(np.fft.rfft(x, len(x) + m) * np.fft.rfft(ir, len(x) + m), len(x) + m)[: len(x)]
    return x * (1 - mix) + wet / (np.abs(wet).max() + 1e-9) * np.abs(x).max() * mix


def suave(x, seg):
    k = int(seg * SR)
    return np.convolve(x, np.ones(k) / k, mode="same")


def rms(x):
    return np.sqrt(np.mean(x ** 2)) + 1e-12


# ---------- trilha ----------
atos = [(a, r.get("musica", "leve")) for a, r in zip(tempo["atos"], roteiro["atos"])]
nivel = np.zeros(N)
pad = np.zeros(N)
piano = np.zeros(N)
for a, mus in atos:
    i0, i1 = int(a["t0"] * SR), min(N, int(a["t1"] * SR))
    k = (t[i0:i1] - a["t0"]) / (a["t1"] - a["t0"])
    nivel[i0:i1] = NIVEL[mus] * ((0.35 + 0.65 * k) if mus == "cresce" else 1)
    if mus == "fim":
        nivel[i0:i1] *= np.clip((TOTAL - t[i0:i1]) / 2.0, 0, 1)
    passo = (a["t1"] - a["t0"]) / len(ACORDES[mus])
    for j, acorde in enumerate(ACORDES[mus]):  # acordes do ato, com 0,8 s de cruzamento entre eles
        s0, s1 = a["t0"] + j * passo - 0.8, a["t0"] + (j + 1) * passo + 0.8
        sel = (t >= s0) & (t < s1)
        env = np.clip(np.minimum(t[sel] - s0, s1 - t[sel]) / 0.8, 0, 1)
        for nota in acorde:
            for h, amp in ((1, 1.0), (2, 0.25), (3, 0.08)):
                pad[sel] += amp * env * np.sin(2 * np.pi * hz(nota) * h * (1 + rng.uniform(-0.002, 0.002)) * t[sel] + rng.uniform(0, 6.3))
        if mus == "silencio":
            continue
        dt = {"leve": 1.1, "noite": 2.0, "fim": 1.6}.get(mus)
        x = s0 + 0.8
        while x < s1 - 0.8:  # piano: notas de cima do acorde
            nota = rng.choice(acorde[2:]) + 12
            a0, a1 = int(x * SR), min(N, int((x + 3) * SR))
            tt = t[a0:a1] - x
            piano[a0:a1] += np.exp(-tt * 1.8) * (np.sin(2 * np.pi * hz(nota) * tt) + 0.25 * np.sin(4 * np.pi * hz(nota) * tt))
            kk = (x - a["t0"]) / (a["t1"] - a["t0"])
            x += 0.6 * (1 - kk) + 0.22 * kk if mus == "cresce" else dt * rng.uniform(0.8, 1.3)
nivel = suave(nivel, 0.6)  # o silêncio chega antes da frase e o crescendo não pula
pad = banda(pad, 40, 1800)
piano = reverb(banda(piano, 60, 5000))
musica = (0.6 * pad / (np.abs(pad).max() + 1e-9) + 0.45 * piano / (np.abs(piano).max() + 1e-9)) * nivel
sala = banda(rng.normal(0, 1, N), 60, 900)  # tom de sala: o fundo nunca é zero
musica += sala / rms(sala) * 10 ** (-58 / 20)

# ---------- efeitos ----------
def ruido(d):
    return rng.normal(0, 1, max(1, int(d * SR)))


def risco(d, giz):
    """Caneta: traços curtos de ruído agudo, com pausinhas; depois o giz, mais grave e granulado."""
    tr = d * 0.6
    x = banda(ruido(tr), 1800, 7000)
    am = np.zeros(len(x))
    p = 0
    while p < len(x):
        n = int(rng.uniform(0.08, 0.22) * SR)
        am[p:p + n] = np.sin(np.linspace(0, np.pi, len(am[p:p + n]))) * rng.uniform(0.5, 1)
        p += n + int(rng.uniform(0.01, 0.05) * SR)
    out = x * am
    if giz:
        g = banda(ruido(d * 0.6) * (rng.random(int(d * 0.6 * SR)) < 0.25), 500, 3500)
        g *= np.abs(np.sin(np.linspace(0, d * 0.6 * 9 * np.pi, len(g)))) ** 0.5
        o = int(d * 0.4 * SR)
        out = np.pad(out, (0, max(0, o + len(g) - len(out))))
        out[o:o + len(g)] += 0.8 * g / (np.abs(g).max() + 1e-9) * np.abs(out).max()
    return out


def apaga(d):
    x = banda(ruido(d), 300, 2200)
    return x * np.abs(np.sin(np.linspace(0, d * 7 * np.pi, len(x)))) * np.hanning(len(x)) * 0.7


def pincelada(d):
    x = banda(ruido(d * 1.2), 180, 2600)
    return x * np.abs(np.sin(np.linspace(0, 9 * np.pi, len(x)))) ** 0.6 * np.hanning(len(x))


def plim(d=1.2):
    tt = np.arange(int(d * SR)) / SR
    return sum(a * np.exp(-tt * k) * np.sin(2 * np.pi * f * tt) for f, a, k in ((1760, 1, 4), (2637, 0.5, 6), (3520, 0.3, 8), (5274, 0.15, 12))) * 0.6


def telefone(d):
    tt = np.arange(int(d * SR)) / SR
    tom = np.sin(2 * np.pi * 1300 * tt) + 0.6 * np.sin(2 * np.pi * 1630 * tt)
    return tom * (np.sin(2 * np.pi * 22 * tt) > 0) * ((tt % 0.6) < 0.4) * 0.5


SONS = {"risco": lambda e: risco(e["dura"], e["giz"]) / max(0.7, e["z"]), "apaga": lambda e: apaga(e["dura"]),
        "pincelada": lambda e: pincelada(e["dura"]) * 1.6, "plim": lambda e: plim(), "telefone": lambda e: telefone(e["dura"])}
NORM = {"risco": 0.5, "apaga": 0.35, "pincelada": 0.8, "plim": 0.5, "telefone": 0.45}
efe = np.zeros((N, 2))
ultimo = {}
for e in eventos:
    if e["tipo"] == "apaga" and e["t"] - ultimo.get("apaga", -9) < 0.2:
        continue  # muitas coisas se apagam juntas: uma borracha só
    ultimo[e["tipo"]] = e["t"]
    x = SONS[e["tipo"]](e)
    x = x / (np.abs(x).max() + 1e-9) * NORM[e["tipo"]]
    a = int(e["t"] * SR)
    if a >= N:
        continue
    x = x[: N - a]
    pan = rng.uniform(-0.3, 0.3)
    efe[a:a + len(x), 0] += x * (1 - pan)
    efe[a:a + len(x), 1] += x * (1 + pan)
efe = np.tanh(efe * 1.2) / 1.2

# ---------- volumes pela voz: trilha ~15 dB e efeitos ~14 dB abaixo da fala ----------
voz = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", str(pasta / "audio" / "narracao.wav"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                                   capture_output=True, check=True).stdout, np.float32)
falada = voz[np.abs(voz) > 0.02]
ref = rms(falada) if len(falada) else 0.1
cheia = musica[nivel > 0.5]
musica *= ref * 10 ** (-15 / 20) / rms(cheia if len(cheia) else musica)
ativo = np.abs(efe).max(1) > 1e-3
efe *= ref * 10 ** (-14 / 20) / rms(efe[ativo]) if ativo.any() else 1
efe += np.stack([sala, np.roll(sala, 500)], 1) / rms(sala) * 10 ** (-70 / 20)

for nome, x in (("trilha", np.stack([musica, np.roll(musica, int(0.012 * SR))], 1)), ("efeitos", efe)):
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s16le",
                    str(pasta / "audio" / f"{nome}.wav")], input=x.astype(np.float32).tobytes(), check=True)
print(f"ok: trilha e efeitos ({len(eventos)} eventos, {TOTAL:.1f}s)")
