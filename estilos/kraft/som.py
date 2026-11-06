"""Som do Kraft: efeitos presos a cada entrada de elemento e a trilha com as pausas antes das revelações.

Uso (de dentro de estilos/kraft): python3 som.py episodios/<slug>
Lê tempo.json e a voz (a gravação ou audio/narracao.wav) para calibrar volumes.
Grava audio/efeitos.wav e audio/trilha.wav (estéreo, 48 kHz, do tamanho exato do vídeo).

Perfil medido na referência (faixa sem voz separada pelo Demucs, 06/11/2026):
  trilha   batida leve a ~80 bpm, ~15 dB abaixo da voz; some ~0,6 s antes de uma revelação e volta com ela
           (a nossa: "musica" do roteiro; padrão lofi:piano do nucleo/lofi.py; também lofi:estudo, lofi:madrugada,
           kraft do nucleo/trilha.py, ou um arquivo pronto, caminho relativo ao episódio)
  pop      clique curto (60-140 ms, ~2 kHz) a cada comentário, etiqueta e recorte que surge
  bloop    pop grave (~650 Hz, 0,2 s) quando um personagem aparece
  boing    mola de 0,75 s no ponto de interrogação
  escrita  dois riscos agudos de 50 ms (~8 kHz) a cada item escrito na lista
  carimbo  batida grave com cauda
  impressora  zumbido agudo de 0,55 s quando a comanda sai
  plim     sininho no fecho ("próximo episódio")
  whoosh   ar no deslize, no pulo e na troca de lugar
  papel    corte seco da câmera para o kraft (e de volta)
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 48000
EST = Path(__file__).resolve().parent
pasta = Path(sys.argv[1]).resolve()
T = json.loads((pasta / "tempo.json").read_text())
ROT = json.loads((pasta / "roteiro.json").read_text())
TOTAL = T["total"]
N = int(TOTAL * SR)
rng = np.random.default_rng(3)


def ler(fonte, ch=1):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(fonte), "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).reshape(-1, ch)


def banda(x, lo, hi):
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(np.fft.rfft(x) * ((f >= lo) & (f <= hi)), len(x))


def tt(d):
    return np.arange(int(d * SR)) / SR


def ruido(d):
    return rng.normal(0, 1, int(d * SR))


def pop():
    t = tt(0.1)
    f = 700 + 900 * (1 - np.exp(-t / 0.02))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.028) + 0.4 * banda(ruido(0.1), 2000, 9000) * np.exp(-t / 0.004)


def bloop():
    t = tt(0.22)
    f = 280 + 420 * (1 - np.exp(-t / 0.05))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.07) * np.minimum(1, t / 0.003)


def whoosh(d=0.3):
    t, x = tt(d), ruido(d)
    out = np.zeros_like(x)
    for k in range(6):  # varredura de grave para agudo em fatias
        a, b = int(len(x) * k / 6), int(len(x) * (k + 1) / 6)
        out[a:b] = banda(x, 500 * 1.5 ** k, 1400 * 1.5 ** k)[a:b]
    return out * np.sin(np.pi * t / d) ** 2


def carimbo():
    t = tt(0.7)
    corpo = np.sin(2 * np.pi * np.cumsum(55 + 100 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.22)
    batida = banda(ruido(0.7), 80, 900) * np.exp(-t / 0.05)
    return corpo + 0.6 * batida / (np.abs(batida).max() + 1e-9)


def boing():
    t = tt(0.8)
    f = 260 + 340 * np.exp(-t / 0.18) + 40 * np.sin(2 * np.pi * 11 * t) * np.exp(-t / 0.3)
    fase = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(fase) + 0.35 * np.sin(2 * fase) + 0.15 * np.sin(3 * fase)) * np.exp(-t / 0.3) * np.minimum(1, t / 0.005)


def escrita():
    out = np.zeros(int(0.2 * SR))
    for st in (0.0, 0.11):
        a, x = int(st * SR), banda(ruido(0.055), 4500, 12000)
        out[a:a + len(x)] += x * np.hanning(len(x)) * rng.uniform(0.7, 1)
    return out


def impressora():
    t = tt(0.55)
    return banda(ruido(0.55), 5000, 12000) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 55 * t))) * np.minimum(1, np.minimum(t, 0.55 - t) / 0.02)


def plim():
    out = np.zeros(int(1.2 * SR))
    for i, m in enumerate((88, 84, 79)):
        t, f = tt(0.9), 440 * 2 ** ((m - 69) / 12)
        x = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t)) * np.exp(-t / 0.25)
        a = int(i * 0.07 * SR)
        out[a:a + len(x)] += x
    return out


def papel():
    t = tt(0.25)
    return banda(ruido(0.25), 300, 2500) * np.exp(-t / 0.05) + 0.8 * np.sin(2 * np.pi * 90 * t) * np.exp(-t / 0.06)


def clique():  # mouse: dois estalos curtos (aperta e solta)
    out = np.zeros(int(0.09 * SR))
    for st, g in ((0.0, 1.0), (0.055, 0.6)):
        x = banda(ruido(0.012), 1800, 7000) * np.exp(-tt(0.012) / 0.002) * g
        a = int(st * SR)
        out[a:a + len(x)] += x
    return out


def tecla():
    return banda(ruido(0.03), 1500, 6000) * np.exp(-tt(0.03) / 0.004) * rng.uniform(0.6, 1)


def obturador():
    t = tt(0.16)
    return banda(ruido(0.16), 800, 9000) * (np.exp(-t / 0.012) + 0.7 * np.exp(-np.maximum(0, t - 0.07) / 0.015) * (t > 0.07))


SONS = dict(pop=(pop, 0.55), bloop=(bloop, 0.6), whoosh=(whoosh, 0.35), carimbo=(carimbo, 0.8), boing=(boing, 0.5),
            escrita=(escrita, 0.3), impressora=(impressora, 0.3), plim=(plim, 0.45), papel=(papel, 0.45),
            clique=(clique, 0.45), tecla=(tecla, 0.12), obturador=(obturador, 0.5))
DISCRETO = 10 ** (-7 / 20)  # efeitos 7 dB abaixo do que a referência usa: o Macks pediu mais discretos (06/11/2026)
PADRAO = dict(etiqueta="pop", titulo="plim", carimbo="carimbo", interrogacao="boing", recibo="impressora", imagem="bloop",
              navegador="pop", print="papel")


def eventos():
    ev = []
    for i, a in enumerate(T["atos"]):
        if i and a["fundo"] != T["atos"][i - 1]["fundo"]:
            ev.append((a["t0"], "papel", 0.5))
        for e in a["elementos"]:
            x, som = e.get("x", 0.5), e.get("som")
            if som == "nenhum":
                continue
            tipo = e.get("tipo")
            if tipo == "comentarios":
                for j, it in enumerate(e["itens"]):
                    ev.append((it["em"] if isinstance(it, dict) and "em" in it else e["em"] + j * e.get("passo", 0.4), som or "pop", x))
            elif tipo == "lista":
                ev += [(it["em"], som or "escrita", x) for it in e.get("itens", []) if "em" in it]
            elif e.get("entrada") != "nenhuma" or som:
                ent = e.get("entrada", "pop")
                padrao = "whoosh" if ent in ("esquerda", "direita", "cima", "baixo", "cai") else PADRAO.get(tipo)
                if som or padrao:
                    ev.append((e["em"], som or padrao, x))
            ev += [(v["em"], v.get("som", "whoosh"), v.get("x", x)) for v in e.get("vai", []) if v.get("modo") in ("pulo", "desliza") and v.get("som") != "nenhum"]
            if e.get("url") and e.get("url_em", e["em"]) >= e["em"]:  # URL digitada na barra (se já veio digitada, sem som)
                t0 = e.get("url_em", e["em"])
                ev += [(t0 + k / 20, "tecla", x) for k in range(len(e["url"]))]
            for ac in e.get("acoes", []):  # o cursor chega em 0,45 s e então clica ou digita
                if ac["tipo"] in ("clica", "digita"):
                    ev.append((ac["em"] + 0.45, "clique", x))
                if ac["tipo"] == "digita":
                    ev += [(ac["em"] + 0.45 + k / 16, "tecla", x) for k in range(len(ac["texto"]))]
                if ac["tipo"] == "print":
                    ev.append((ac["em"], "obturador", x))
            for pg in e.get("paginas", [])[1:]:
                ev.append((pg["em"], "whoosh", x))
    return sorted(ev)


def main():
    g = T.get("gravacao")
    voz = ler(g["arquivo"] if g else pasta / "audio" / "narracao.wav")[: N, 0]
    ref = np.percentile(np.abs(voz), 99.5) + 1e-6
    rms_voz = np.sqrt(np.mean(voz[np.abs(voz) > ref * 0.05] ** 2))

    fx = np.zeros((N, 2))
    for t0, nome, x in eventos():
        f, ganho = SONS[nome]
        s = f()
        s = s / (np.abs(s).max() + 1e-9) * ref * ganho * DISCRETO
        a = int(t0 * SR)
        if a >= N:
            continue
        s = s[: N - a]
        pan = np.clip(x, 0.15, 0.85)  # o som vem do lado onde a peça aparece
        fx[a:a + len(s), 0] += s * np.sqrt(1 - pan)
        fx[a:a + len(s), 1] += s * np.sqrt(pan)

    musica = ROT.get("musica", "lofi:piano")
    nucleo = EST.parents[1] / "nucleo"
    if ":" in musica or musica == "kraft":  # gerada aqui, em cache por escolha
        base = pasta / "audio" / f"trilha-base-{musica.replace(':', '-')}.wav"
        if not base.exists():
            cmd = ([str(nucleo / "lofi.py"), str(base), "--faixa", musica.split(":")[1]] if musica.startswith("lofi:") else
                   [str(nucleo / "trilha.py"), str(base), "--minutos", f"{TOTAL / 60 + 0.15:.2f}", "--estilo", "kraft", "--seed", "5"])
            subprocess.run([sys.executable, *cmd], check=True)
    else:  # arquivo pronto: caminho relativo à pasta do episódio ou absoluto (faixa da biblioteca, gerada na Higgsfield)
        base = (pasta / musica).resolve()
    tr = ler(base, 2).astype(np.float64)
    fim_m = int(6 * SR)
    if len(tr) > N + fim_m:  # música maior que o vídeo: começo dela + o final de verdade dela, fundidos, sem acelerar
        x = int(1.5 * SR)
        cab, cauda = tr[: N - fim_m + x], tr[-(fim_m + x):]
        rampa = np.linspace(0, 1, x)[:, None]
        tr = np.concatenate([cab[:-x], cab[-x:] * (1 - rampa) + cauda[:x] * rampa, cauda[x:]])
    tr = np.tile(tr, (N // len(tr) + 1, 1))[:N]
    ganho = np.ones(N)
    for a in T["atos"]:
        if a.get("trilha") == "pausa":  # silêncio da música antes da revelação; volta junto com ela
            ganho[int(max(0, a["t0"] - 0.6) * SR): int(a["t0"] * SR)] = 0
        elif a.get("trilha") == "fora":
            ganho[int(a["t0"] * SR): int(a["t1"] * SR)] = 0
    k = int(0.03 * SR)
    ganho = np.convolve(ganho, np.ones(k) / k, "same")
    fim = int(min(1.5, TOTAL) * SR)
    ganho[-fim:] *= np.linspace(1, 0, fim)
    tr *= rms_voz * 10 ** (ROT.get("musica_db", -15) / 20) / (np.sqrt(np.mean(tr ** 2)) + 1e-9)  # dB abaixo da voz
    tr *= ganho[:, None]

    for nome, x in (("efeitos", fx), ("trilha", tr)):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", str(pasta / "audio" / f"{nome}.wav")],
                       input=x.astype(np.float32).tobytes(), check=True)
    print(f"ok: {len(eventos())} efeitos, trilha com {sum(a.get('trilha') == 'pausa' for a in T['atos'])} pausas")


if __name__ == "__main__":
    main()
