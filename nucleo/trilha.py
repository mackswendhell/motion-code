"""Trilha de fundo noturna, gerada só com código. Emenda sem corte quando repetida.

Uso: python3 trilha.py [saida.wav] [--minutos 3] [--seed 7] [--estilo noite|contos|vila]

Estilos:
  noite   Ré maior, pad quente e notas de piano distantes (a primeira trilha)
  contos  no perfil medido no fundo dos vídeos-modelo: Dó maior / Lá menor com cor de Fámaj7,
          sem batida, pad escuro e brilhos agudos esparsos por cima
  vila    livro ilustrado: violão dedilhado em Dó / Sol / Lá menor / Fá a 80 bpm, caixinha de música
          esparsa e pad leve por baixo (Vila Acesa)
"""

import subprocess
import sys

import numpy as np

SR = 48000
args = dict(zip(sys.argv[2::2], sys.argv[3::2])) if len(sys.argv) > 2 else {}
OUT = sys.argv[1] if len(sys.argv) > 1 else "trilhas/noite.wav"
DUR = float(args.get("--minutos", 3)) * 60
rng = np.random.default_rng(int(args.get("--seed", 7)))
n = int(DUR * SR)
t = np.arange(n) / SR


def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def lowpass(x, cutoff):
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    spec *= 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(spec, len(x))


def reverb(x, seconds=3.5, mix=0.45):
    m = int(seconds * SR)
    ir = rng.normal(0, 1, m) * np.exp(-np.arange(m) / (SR * seconds / 6))
    ir = lowpass(ir, 3500)
    wet = np.fft.irfft(np.fft.rfft(x, len(x) + m) * np.fft.rfft(ir, len(x) + m), len(x) + m)
    wet = wet[: len(x)] + np.pad(wet[len(x):], (0, len(x) - m))  # cauda volta ao início: emenda
    return x * (1 - mix) + wet / np.abs(wet).max() * np.abs(x).max() * mix


ESTILO = args.get("--estilo", "noite")
if ESTILO == "contos":
    # Fámaj7, Dómaj9, Lám7, Solsus2 — 12 s cada
    chords = [[41, 48, 52, 57, 64], [36, 43, 50, 52, 59], [45, 52, 55, 60, 64], [43, 50, 55, 57, 62]]
    step = 12.0
    scale = [72, 74, 76, 79, 81, 84, 86, 88]  # notas altas: os brilhos
    corte_keys, espaco = 6000, (3.5, 8.0)
elif ESTILO == "vila":
    # Dó, Sol/Si, Lám, Fá — um compasso de 3 s cada
    chords = [[48, 55, 60, 64, 67], [47, 55, 59, 62, 67], [45, 52, 57, 60, 64], [41, 48, 53, 57, 65]]
    step = 3.0
    scale = [72, 74, 76, 79, 81, 84]
    corte_keys, espaco = 7000, (4.0, 9.0)
else:
    # Rémaj9, Sim9, Solmaj7, Lá6sus — 10 s cada
    chords = [[50, 57, 61, 64, 66], [47, 54, 57, 61, 62], [43, 50, 54, 57, 62], [45, 52, 57, 59, 64]]
    step = 10.0
    scale = [62, 64, 66, 69, 71, 74, 76, 78]
    corte_keys, espaco = 2500, (2.5, 6.0)
pad = np.zeros(n)
for i, start in enumerate(np.arange(0, DUR, step)):
    seg = (t >= start - 2) & (t < start + step + 2)
    env = np.clip(np.minimum((t[seg] - start + 2) / 3, (start + step + 2 - t[seg]) / 3), 0, 1)
    for note in chords[i % len(chords)]:
        for k, amp in ((1, 1.0), (2, 0.28), (3, 0.1)):
            f = hz(note) * k * (1 + rng.uniform(-0.002, 0.002))
            pad[seg] += amp * env * np.sin(2 * np.pi * f * t[seg] + rng.uniform(0, 6.28))
pad *= 0.8 + 0.2 * np.sin(2 * np.pi * t / 17)
pad = lowpass(pad, 1800)

# notas esparsas: piano elétrico distante (noite) ou brilhos agudos (contos)
keys = np.zeros(n)
for start in np.cumsum(rng.uniform(*espaco, int(DUR / 3))):
    if start > DUR - 4:
        break
    note = rng.choice(scale)
    a, b = int(start * SR), int((start + 4) * SR)
    tt = t[a:b] - start
    keys[a:b] += rng.uniform(0.3, 0.7) * np.exp(-tt * 1.6) * (
        np.sin(2 * np.pi * hz(note) * tt) + 0.2 * np.sin(2 * np.pi * hz(note) * 2 * tt))
keys = reverb(lowpass(keys, corte_keys), seconds=5.0 if ESTILO == "contos" else 3.5)

# quarto: ruído rosado baixo + zumbido de cidade + estalos raros
pink = np.fft.irfft(np.fft.rfft(rng.normal(0, 1, n)) / np.sqrt(np.maximum(np.fft.rfftfreq(n, 1 / SR), 20)), n)
room = lowpass(pink, 900)
city = lowpass(rng.normal(0, 1, n), 140) * (0.7 + 0.3 * np.sin(2 * np.pi * t / 23))
crackle = np.zeros(n)
crackle[rng.integers(0, n, int(DUR * 1.5))] = rng.uniform(-1, 1, int(DUR * 1.5))
crackle = lowpass(crackle, 4000)


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


mix = 0.55 * norm(pad) + 0.35 * norm(keys) + 0.10 * norm(room) + 0.10 * norm(city) + 0.04 * norm(crackle)

if ESTILO == "vila":
    def corda(f, dur):  # violão: Karplus-Strong, a corda pinçada que decai sozinha
        p = int(SR / f)
        buf = rng.uniform(-1, 1, p)
        out = np.zeros(int(dur * SR))
        for i in range(len(out)):
            out[i] = buf[i % p]
            buf[i % p] = 0.996 * 0.5 * (buf[i % p] + buf[(i + 1) % p])
        return out
    dedilhado = np.zeros(n)
    colcheia = 0.375  # 80 bpm
    ordem = [0, 2, 3, 4, 1, 3, 2, 4]  # baixo, depois as cordas de cima
    cache = {}
    for b, start in enumerate(np.arange(0, DUR, step)):
        acorde = chords[b % len(chords)]
        for k, idx in enumerate(ordem):
            st = start + k * colcheia + rng.uniform(-0.008, 0.008)  # mão humana: um pouco fora do tempo
            nota = acorde[idx] + (12 if idx else 0)
            if nota not in cache:
                cache[nota] = corda(hz(nota), 1.6)
            a = max(0, int(st * SR))
            if a >= n:
                break
            seg_ = cache[nota][: n - a]
            dedilhado[a:a + len(seg_)] += seg_ * (0.9 if idx == 0 else rng.uniform(0.45, 0.7))
    dedilhado = reverb(lowpass(dedilhado, 5000), seconds=2.0, mix=0.25)
    mix = 0.25 * norm(pad) + 0.6 * norm(dedilhado) + 0.3 * norm(keys) + 0.03 * norm(room)

# emenda: os últimos 4 s se fundem com o começo
x = int(4 * SR)
fade = np.linspace(0, 1, x)
mix[:x] = mix[:x] * fade + mix[-x:] * (1 - fade)
mix = mix[:-x]

stereo = np.stack([mix, np.roll(mix, int(0.012 * SR))], axis=1).astype(np.float32)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                "-af", "loudnorm=I=-24:TP=-3", "-ar", str(SR), OUT], input=stereo.tobytes(), check=True)
print(f"ok: {OUT} ({len(mix) / SR:.0f}s, emenda sem corte)")
