"""Trilha da Fantasia: orquestra de lenda feita em código, que muda com a cena e segue o desenho (eventos.json).

Uso (de dentro de estilos/fantasia): python3 som.py episodios/<slug>
Lê tempo.json, eventos.json (marteladas da forja) e audio/narracao.wav (para abaixar a música sob a voz).
Grava audio/trilha.wav (estéreo, 48 kHz), do tamanho exato do vídeo.

  luz     cenas claras (floresta, anel): cordas em Ré maior, harpa em arpejo, coro alto e sinos
  sombra  cenas escuras (forja, guerra, cavernas, toca, Monte da Perdição): drone grave em Ré menor, coro baixo, tambor no começo,
          bigorna em cada martelada; o golpe da espada e a queda no fogo ganham tambor (eventos.json)
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 48000
pasta = Path(sys.argv[1])
tempo = json.loads((pasta / "tempo.json").read_text())
ev = json.loads((pasta / "eventos.json").read_text()) if (pasta / "eventos.json").exists() else {}
TOTAL = tempo["total"]
N = int(TOTAL * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(5)

CLIMA = {"floresta": "luz", "anel": "luz", "forja": "sombra", "guerra": "sombra", "rio": "luz", "gollum": "sombra", "bilbo": "sombra",
         "toca": "sombra", "jornada": "luz", "beira": "sombra", "queda": "sombra", "aguias": "luz", "casa": "luz"}
LUZ = [[50, 62, 66, 69], [47, 62, 66, 71], [43, 59, 62, 67], [45, 61, 64, 69]]   # Ré, Si menor, Sol, Lá
SOMBRA = [[38, 50, 53, 57], [34, 50, 53, 58], [36, 48, 52, 55], [38, 50, 53, 57]]  # Ré menor, Si bemol, Dó, Ré menor


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def banda(x, lo, hi):
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = 1 / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4)
    return np.fft.irfft(np.fft.rfft(x) * m, len(x))


def reverb(x, seg, mix):
    m = int(seg * SR)
    ir = banda(rng.normal(0, 1, m) * np.exp(-np.arange(m) / (SR * seg / 6)), 150, 6000)
    wet = np.fft.irfft(np.fft.rfft(x, len(x) + m) * np.fft.rfft(ir, len(x) + m), len(x) + m)[: len(x)]
    return x * (1 - mix) + wet / (np.abs(wet).max() + 1e-9) * np.abs(x).max() * mix


def suave(x, seg):
    k = max(1, int(seg * SR))
    return np.convolve(x, np.ones(k) / k, mode="same")


def rms(x):
    return np.sqrt(np.mean(x ** 2)) + 1e-12


def cordas(dest, s0, s1, notas, nivel, ataque=1.2):
    sel = (t >= s0) & (t < s1)
    tt = t[sel]
    env = np.clip(np.minimum((tt - s0) / ataque, (s1 - tt) / 1.0), 0, 1) * nivel
    for nota in notas:
        for d in (-0.004, 0, 0.005):
            f = hz(nota) * (1 + d) * (1 + 0.003 * np.sin(2 * np.pi * 5 * tt + rng.uniform(0, 6)))
            fase = 2 * np.pi * np.cumsum(f) / SR
            dest[sel] += env * sum(np.sin(fase * h) / h ** 1.3 for h in range(1, 6)) * 0.25


def coro(dest, s0, s1, notas, nivel):
    """'Aah' de coro: senos desafinados com vibrato, só os formantes do 'a' (700 e 1200 Hz)."""
    sel = (t >= s0) & (t < s1)
    tt = t[sel]
    env = np.clip(np.minimum((tt - s0) / 1.8, (s1 - tt) / 1.2), 0, 1) * nivel
    x = np.zeros(len(tt))
    for nota in notas:
        for d in np.linspace(-0.007, 0.007, 5):
            f = hz(nota) * (1 + d) * (1 + 0.006 * np.sin(2 * np.pi * 5.5 * tt + rng.uniform(0, 6)))
            fase = 2 * np.pi * np.cumsum(f) / SR
            x += sum(np.sin(fase * h) * np.exp(-((hz(nota) * h - 700) / 380) ** 2 / 2) + 0.6 * np.sin(fase * h) * np.exp(-((hz(nota) * h - 1200) / 420) ** 2 / 2) for h in range(1, 12))
    dest[sel] += env * x / max(1, len(notas))


def harpa(dest, x0, nota, vel):
    a = int(x0 * SR)
    if a >= N:
        return
    n = min(N - a, int(3.5 * SR))
    tt = np.arange(n) / SR
    f = hz(nota)
    som = sum(np.sin(2 * np.pi * f * h * tt) * np.exp(-tt * (1.2 + h * 1.4)) / h for h in range(1, 6))
    dest[a:a + n] += vel * som * np.minimum(1, tt / 0.003)


def sino(dest, x0, nota, vel):
    a = int(x0 * SR)
    n = min(N - a, int(4 * SR))
    if n <= 0:
        return
    tt = np.arange(n) / SR
    f = hz(nota)
    dest[a:a + n] += vel * sum(amp * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt * dec) for r, amp, dec in ((1, 1, 1.2), (2.76, 0.4, 2.5), (5.4, 0.2, 4)))


def bigorna(dest, x0, vel=1.0):
    a = int(x0 * SR)
    n = min(N - a, int(2.2 * SR))
    if n <= 0:
        return
    tt = np.arange(n) / SR
    tinido = sum(amp * np.sin(2 * np.pi * 820 * r * tt + rng.uniform(0, 6)) * np.exp(-tt * dec) for r, amp, dec in ((1, 1, 3), (2.32, 0.6, 4.5), (3.87, 0.45, 6), (5.13, 0.3, 8), (7.2, 0.2, 11)))
    pancada = banda(rng.normal(0, 1, n), 200, 4000) * np.exp(-tt * 60)
    grave = np.sin(2 * np.pi * (70 + 60 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 12)
    dest[a:a + n] += vel * (0.5 * tinido + 0.8 * pancada + 0.9 * grave)


def tambor(dest, x0, vel=1.0):
    a = int(x0 * SR)
    n = min(N - a, int(3 * SR))
    tt = np.arange(n) / SR
    f = 45 + 35 * np.exp(-tt * 14)
    dest[a:a + n] += vel * (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 1.8) + 0.4 * banda(rng.normal(0, 1, n), 40, 300) * np.exp(-tt * 10))


# cenas seguidas com o mesmo clima viram uma seção
secoes = []
for a in tempo["atos"]:
    c = CLIMA.get(a["cena"], "luz")
    if secoes and secoes[-1][0] == c:
        secoes[-1][2] = a["t1"]
    else:
        secoes.append([c, a["t0"], a["t1"]])

cor, cho, pia, perc = (np.zeros(N) for _ in range(4))
for c, a, b in secoes:
    acordes, dur = (LUZ, 3.2) if c == "luz" else (SOMBRA, 4.0)
    x, j = a, 0
    while x < b - 0.3:
        ac, fim = acordes[j % len(acordes)], min(b, x + dur)
        cordas(cor, x - 0.4, fim + 0.8, ac, 0.8 if c == "luz" else 1.0)
        coro(cho, x - 0.4, fim + 0.8, [n + 12 for n in ac[1:]] if c == "luz" else ac[1:3], 0.5 if c == "luz" else 0.8)
        if c == "luz":
            arp = ac[1:] + [ac[1] + 12, ac[2] + 12, ac[3] + 12]
            p, k = x, 0
            while p < fim - 0.05:
                harpa(pia, p, arp[k % len(arp)] + 12, rng.uniform(0.5, 0.8))
                p += 0.2
                k += 1
            sino(pia, x + 0.05, ac[3] + 24, 0.25)
        x, j = fim, j + 1
    if c == "sombra":
        tambor(perc, a, 1.0)
for b in ev.get("batidas", []):
    bigorna(perc, b, 0.8)
for b in ev.get("corte", []):  # a espada corta a mão: metal, tambor e o anel tilinta ao cair
    bigorna(perc, b, 0.6)
    tambor(perc, b, 1.0)
    sino(pia, b + 0.9, 88, 0.4)
for b in ev.get("queda", []):  # o anel no fogo: o maior tambor do vídeo
    tambor(perc, b, 1.4)
    tambor(perc, b + 0.35, 0.8)
for a in tempo["atos"]:  # cintilância no anel do close: um sino agudo
    if a["cena"] == "anel":
        sino(pia, a["t0"] + 0.95, 93, 0.35)

cor = reverb(banda(cor, 60, 4000), 3.5, 0.45)
cho = reverb(banda(cho, 150, 5000), 4.0, 0.55)
pia = reverb(banda(pia, 120, 9000), 3.0, 0.4)
perc = reverb(perc, 2.2, 0.25)
musica = 0.5 * cor / (np.abs(cor).max() + 1e-9) + 0.35 * cho / (np.abs(cho).max() + 1e-9) + 0.4 * pia / (np.abs(pia).max() + 1e-9)
musica *= np.clip(t / 1.5, 0, 1) * np.clip((TOTAL - t) / 2.0, 0, 1)
musica += 0.75 * perc / (np.abs(perc).max() + 1e-9)

# volume pela voz: ~14 dB abaixo da fala e 4 dB a menos enquanto ela fala
voz = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", str(pasta / "audio" / "narracao.wav"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                                   capture_output=True, check=True).stdout, np.float32)[:N]
voz = np.pad(voz, (0, N - len(voz)))
falada = voz[np.abs(voz) > 0.02]
ref = rms(falada) if len(falada) else 0.1
fala = suave((suave(np.abs(voz), 0.05) > 0.01).astype(float), 0.4)
musica *= 1 - 0.37 * fala
musica *= ref * 10 ** (-14 / 20) / rms(musica[t > 1.5])
sala = banda(rng.normal(0, 1, N), 60, 900)  # o fundo nunca é zero
musica += sala / rms(sala) * 10 ** (-60 / 20)
musica = np.tanh(musica * 1.4) / 1.4
st = np.stack([musica, np.roll(musica, int(0.013 * SR))], 1)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s16le",
                str(pasta / "audio" / "trilha.wav")], input=st.astype(np.float32).tobytes(), check=True)
print(f"ok: trilha ({len(secoes)} seções, {len(ev.get('batidas', []))} marteladas, {TOTAL:.1f}s)")
