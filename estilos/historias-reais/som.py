"""Trilha das Histórias Reais: piano e cordas que seguem a emoção de cada trecho (campo "musica" do roteiro).

Uso (de dentro de estilos/historias-reais): python3 som.py episodios/<slug>
Lê tempo.json e audio/narracao.wav (as vozes, para calibrar o volume e abaixar a música quando alguém fala).
Grava audio/trilha.wav (estéreo, 48 kHz), do tamanho exato do vídeo.

  abre   notas soltas de piano, quase nada
  conta  piano em arpejo, Lá menor, Fá, Dó, Sol; cordas baixinhas
  doi    o piano para; cordas crescem em Ré menor e Lá menor, uma nota aguda de piano aqui e ali
  ergue  a progressão sobe (Fá, Sol, Lá menor, Dó) e as cordas ganham corpo
  chega  um tambor grave e um acorde de cordas em cada "chega"
  fim    piano lento sob a narração; no escuro, só uma nota longa, e o último acorde some
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 48000
pasta = Path(sys.argv[1])
tempo = json.loads((pasta / "tempo.json").read_text())
TOTAL = tempo["total"]
N = int(TOTAL * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(8)

AM, F, C, G, DM, E, FG = [45, 57, 60, 64], [41, 57, 60, 65], [48, 55, 60, 64], [43, 55, 59, 62], [38, 57, 62, 65], [40, 56, 59, 64], [41, 55, 60, 65]
MUSICA = {  # acordes, segundos por acorde, piano (notas por segundo, 0 = sem), cordas, nível
    "abre": ([AM], 4.0, 0.7, 0.25, 0.45),
    "conta": ([AM, F, C, G], 2.4, 2.4, 0.35, 0.7),
    "doi": ([DM, AM, F, E], 1.6, 0.0, 1.0, 0.9),
    "ergue": ([F, G, AM, C], 1.5, 3.2, 0.8, 1.0),
    "chega": ([AM], 4.0, 0.0, 0.6, 0.9),
    "fim": ([AM, F, C, E, AM, F, G, AM], 3.0, 1.1, 0.45, 0.75),
}


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def banda(x, lo, hi):
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = 1 / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4)
    return np.fft.irfft(np.fft.rfft(x) * m, len(x))


def reverb(x, seg=3.0, mix=0.4):
    m = int(seg * SR)
    ir = banda(rng.normal(0, 1, m) * np.exp(-np.arange(m) / (SR * seg / 6)), 100, 5000)
    wet = np.fft.irfft(np.fft.rfft(x, len(x) + m) * np.fft.rfft(ir, len(x) + m), len(x) + m)[: len(x)]
    return x * (1 - mix) + wet / (np.abs(wet).max() + 1e-9) * np.abs(x).max() * mix


def suave(x, seg):
    k = max(1, int(seg * SR))
    return np.convolve(x, np.ones(k) / k, mode="same")


def rms(x):
    return np.sqrt(np.mean(x ** 2)) + 1e-12


def piano(dest, x0, nota, vel=1.0, dur=3.5):
    a, b = int(x0 * SR), min(N, int((x0 + dur) * SR))
    if a >= N:
        return
    tt = t[a:b] - x0
    f = hz(nota)
    som = sum(amp * np.sin(2 * np.pi * f * h * tt) * np.exp(-tt * (1.4 + h * 0.9)) for h, amp in ((1, 1), (2, 0.4), (3, 0.15), (4, 0.06)))
    dest[a:b] += vel * som * np.minimum(1, tt / 0.004)


def cordas(dest, s0, s1, notas, nivel, ataque=0.9):
    sel = (t >= s0) & (t < s1)
    tt = t[sel]
    env = np.clip(np.minimum((tt - s0) / ataque, (s1 - tt) / 0.9), 0, 1) * nivel
    for nota in notas:
        for d in (-0.004, 0, 0.0045):  # três instrumentos levemente desafinados entre si
            f = hz(nota + 12 if nota < 50 else nota) * (1 + d) * (1 + 0.003 * np.sin(2 * np.pi * 5.2 * tt + rng.uniform(0, 6)))
            fase = 2 * np.pi * np.cumsum(f) / SR
            dest[sel] += env * sum(np.sin(fase * h) / h for h in range(1, 7)) * 0.3


def tambor(dest, x0, vel=1.0):
    a = int(x0 * SR)
    tt = np.arange(int(1.6 * SR)) / SR
    f = 52 + 40 * np.exp(-tt * 18)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 3.2) + banda(rng.normal(0, 1, len(tt)), 60, 400) * np.exp(-tt * 20) * 0.5
    x = x[: N - a]
    dest[a:a + len(x)] += vel * x


# trechos seguidos com a mesma música viram uma seção
secoes = []
for s in tempo["segs"]:
    m = s.get("musica") or "conta"
    if secoes and secoes[-1][0] == m:
        secoes[-1][2] = s["t1"]
    else:
        secoes.append([m, s["t0"], s["t1"]])
for i in range(len(secoes) - 1):  # cada seção vai até a próxima começar
    secoes[i][2] = secoes[i + 1][1]
secoes[-1][2] = TOTAL

pia, cor, perc = np.zeros(N), np.zeros(N), np.zeros(N)
nivel = np.zeros(N)
final = next(s for s in tempo["segs"] if s["tipo"] == "final")
escuro = next((f["t0"] for f in final["frases"] if f["escuro"]), TOTAL)
for m, a, b in secoes:
    acordes, dur, densidade, corda, nv = MUSICA[m]
    i0, i1 = int(a * SR), int(b * SR)
    nivel[i0:i1] = nv
    x, j = a, 0
    while x < b - 0.2:
        ac = acordes[j % len(acordes)]
        fimAc = min(b, x + dur)
        if m == "fim" and x >= escuro - 0.5:
            cordas(cor, x, b, [57, 64], 0.5, ataque=1.5)  # no escuro: só uma nota longa
            piano(pia, b - 2.6, 45, 0.7, 3)
            piano(pia, b - 2.6, 64, 0.5, 3)
            break
        cordas(cor, x - 0.3, fimAc + 0.5, ac, corda * (0.6 + 0.4 * (x - a) / max(1, b - a)) if m in ("doi", "ergue") else corda)
        if densidade:
            p = x
            arp = ac[1:] + [ac[1] + 12, ac[2] + 12]
            k = 0
            while p < fimAc - 0.05:
                piano(pia, p, arp[k % len(arp)] + (12 if m == "abre" else 0), rng.uniform(0.55, 0.85))
                if k == 0:
                    piano(pia, p, ac[0], 0.7, 4.5)
                p += 1 / densidade * rng.uniform(0.92, 1.08)
                k += 1
        elif m == "doi":
            piano(pia, x + 0.4, ac[3] + 12, 0.5, 4)
        x, j = fimAc, j + 1
for s in tempo["segs"]:
    if s.get("musica") == "chega":
        tambor(perc, s["t0"] - 0.02, 1.0)
        cordas(cor, s["t0"], s["t0"] + 0.5, [45, 57, 64], 0.9, ataque=0.03)

nivel = suave(nivel, 0.8)
nivel *= np.clip((TOTAL - t) / 1.5, 0, 1)  # some no fim
pia = reverb(banda(pia, 50, 6000), 3.2, 0.45)
cor = reverb(banda(cor, 80, 3200), 2.5, 0.35)
musica = (0.55 * pia / (np.abs(pia).max() + 1e-9) + 0.5 * cor / (np.abs(cor).max() + 1e-9)) * nivel
musica += 0.7 * perc / (np.abs(perc).max() + 1e-9) * np.clip((TOTAL - t) / 1.5, 0, 1)

# volume pela voz: ~17 dB abaixo da fala, e 4 dB a menos enquanto alguém fala
voz = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", str(pasta / "audio" / "narracao.wav"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                                   capture_output=True, check=True).stdout, np.float32)[:N]
voz = np.pad(voz, (0, N - len(voz)))
falada = voz[np.abs(voz) > 0.02]
ref = rms(falada) if len(falada) else 0.1
fala = suave((suave(np.abs(voz), 0.05) > 0.01).astype(float), 0.4)
musica *= 1 - 0.37 * fala
musica *= ref * 10 ** (-17 / 20) / rms(musica[nivel > 0.5])
sala = banda(rng.normal(0, 1, N), 60, 900)  # o fundo nunca é zero
musica += sala / rms(sala) * 10 ** (-60 / 20)
musica = np.tanh(musica * 1.5) / 1.5
st = np.stack([musica, np.roll(musica, int(0.011 * SR))], 1)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s16le",
                str(pasta / "audio" / "trilha.wav")], input=st.astype(np.float32).tobytes(), check=True)
print(f"ok: trilha ({len(secoes)} seções, {TOTAL:.1f}s)")
