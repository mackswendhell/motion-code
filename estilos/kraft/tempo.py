"""Linha do tempo do Kraft: tempo.json com os atos, os elementos em segundos absolutos e as frases da legenda.

Uso (de dentro de estilos/kraft): python3 tempo.py episodios/<slug> [--ate N]

Dois modos, decididos pelo roteiro:
  gravacao  "gravacao": "<vídeo>" (caminho relativo à pasta do episódio ou absoluto). A voz é a da gravação,
            transcrita com o tempo de cada palavra (palavras.json, em cache). Cada ato começa em "de"
            (segundos do vídeo ou uma palavra dita) e vai até o começo do próximo.
  narrado   sem "gravacao": voz do Fish pelo nucleo/2d/narrar.py (campo "narracao" de cada ato), depois
            transcrita do mesmo jeito, para a legenda e os gatilhos baterem com o som.

Gatilho de tempo ("em", "sai", "vai[].em", "itens[].em", "de"): número = segundos desde o começo do ato;
texto = a palavra dita (sem acento e sem caixa; "palavra#2" = a segunda vez no ato). Nada aparece antes de ser dito.
"""

import hashlib
import json
import os
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

EST = Path(__file__).resolve().parent
NUCLEO = EST.parents[1] / "nucleo"
pasta = Path(sys.argv[1]).resolve()
ATE = int(sys.argv[sys.argv.index("--ate") + 1]) if "--ate" in sys.argv else None
R = json.loads((pasta / "roteiro.json").read_text())


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    return re.sub(r"[^\w%]", "", "".join(ch for ch in s if unicodedata.category(ch) != "Mn"))


def sonda(video):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration",
                          "-of", "json", str(video)], capture_output=True, text=True, check=True).stdout
    j = json.loads(out)
    return j["streams"][0]["width"], j["streams"][0]["height"], float(j["format"]["duration"])


def transcrever(fonte):
    """palavras.json em cache, preso ao arquivo de origem (refaz se o áudio mudar)."""
    destino, marca = pasta / "palavras.json", hashlib.sha1(Path(fonte).read_bytes()).hexdigest()[:12]
    if destino.exists():
        j = json.loads(destino.read_text())
        if j.get("origem") == marca:
            return j["palavras"]
    os.environ.setdefault("HF_HUB_OFFLINE", "1")
    import numpy as np
    from faster_whisper import WhisperModel
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(fonte), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    print("  transcrevendo...", flush=True)
    segs, _ = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8").transcribe(
        audio, language=R.get("idioma", "pt"), word_timestamps=True)
    ps = [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)} for s in segs for w in s.words]
    destino.write_text(json.dumps({"origem": marca, "palavras": ps}, ensure_ascii=False, indent=0))
    return ps


def corrige(palavras):
    """Grafia certa para a legenda ("corrige": {"cloud": "Claude"}): troca a palavra e mantém a pontuação."""
    mapa = {norm(k): v for k, v in R.get("corrige", {}).items()}
    for p in palavras:
        m = re.match(r"^(.*?)([.,!?:;]*)$", p["w"])
        if norm(m[1]) in mapa:
            p["w"] = mapa[norm(m[1])] + m[2]
    return palavras


def rosto(video, w, h):
    """Centro do rosto na horizontal (0 a 1), medido pelo tools/rosto.py do Studio (OpenCV via uv, 1 quadro por segundo).
    Só o x: é ele que decide o corte de 16:9 para 9:16. O y do Haar erra com boné e óculos; fica 0,35 ou o do roteiro."""
    ferramenta = EST.parent / "studio" / "tools" / "rosto.py"
    out = subprocess.run(["uv", "run", "--no-project", "--python", "3.12", "--with", "opencv-python-headless<5", "--with", "numpy",
                          "python", str(ferramenta), str(video)], capture_output=True, text=True).stdout
    m = re.search(r"p2/p98\s+x0 (\d+) y0 \d+ x1 (\d+)", out)
    if m:  # o rosto.py mede num quadro de 1920x1080, seja qual for a proporção
        x = round((int(m[1]) + int(m[2])) / 2 / 1920, 3)
        print(f"  rosto em x={x} (conferir num quadro; corrigir com \"enquadre\" no roteiro)")
        return {"x": x, "y": 0.35}
    print("  rosto não medido: enquadre no centro; ponha \"enquadre\" no roteiro se o rosto não estiver lá")
    return {"x": 0.5, "y": 0.35}


def acha(alvo, palavras, desde, onde):
    nome, _, n = str(alvo).partition("#")
    vistos = 0
    for p in palavras:
        if p["s"] >= desde - 0.05 and norm(p["w"]).startswith(norm(nome)):
            vistos += 1
            if vistos == int(n or 1):
                return max(desde, p["s"] - 0.04)
    ditas = " ".join(p["w"] for p in palavras if p["s"] >= desde - 0.05)[:400]
    sys.exit(f"palavra '{alvo}' não foi dita em {onde}. Palavras dali: {ditas}")


def quando(v, ato, palavras, onde):
    return round(ato["t0"] + v, 3) if isinstance(v, (int, float)) else round(acha(v, palavras, ato["t0"], onde), 3)


LIGA = set("o a os as de do da dos das e e um uma seu sua meu minha no na em que com por pra para mas".split())
JUNTAS = {"claudecode", "diaa"}


CAMERAS = {  # retângulo da gravação na tela, em fração
    "cheia": {"x": 0, "y": 0, "w": 1, "h": 1},
    "baixo": {"x": 0, "y": 0.5, "w": 1, "h": 0.5},       # tela dividida: animação em cima, você embaixo
    "cima": {"x": 0, "y": 0, "w": 1, "h": 0.5},
    "card": {"x": 0.52, "y": 0.58, "w": 0.44, "h": 0.28},  # cartão colado embaixo à direita
    "card-esq": {"x": 0.04, "y": 0.58, "w": 0.44, "h": 0.28},
}


def cheia(r):
    return r == CAMERAS["cheia"]


def resolve(x, ato, ps, onde):
    """Todo "em", "sai" e "url_em" do elemento, em qualquer nível (ações, páginas, focos, marcas, itens), vira segundo absoluto."""
    if isinstance(x, list):
        return [resolve(v, ato, ps, onde) for v in x]
    if not isinstance(x, dict):
        return x
    return {k: quando(v, ato, ps, onde) if k in ("em", "sai", "url_em") else resolve(v, ato, ps, onde) for k, v in x.items()}


def frases(palavras, ate):
    out, atual = [], []
    for i, p in enumerate(palavras):
        atual.append(p)
        prox = palavras[i + 1] if i + 1 < len(palavras) else None
        texto = " ".join(x["w"] for x in atual)
        curta = (norm(p["w"]) in LIGA or (prox and norm(p["w"] + prox["w"]) in JUNTAS)) and len(texto) <= 34  # não termina em "o", "de", "seu", nem parte "Claude Code"
        if not prox or prox["s"] - p["e"] > 0.3 or re.search(r"[.?!,:;]$", p["w"]) or (not curta and (len(atual) >= 5 or len(texto) > 26)):
            fim = min(prox["s"], p["e"] + 0.5) if prox else p["e"] + 0.4
            out.append({"t0": atual[0]["s"], "t1": round(min(fim, ate), 3), "texto": re.sub(r"[.,:;]$", "", texto)})
            atual = []
    return [f for f in out if f["t0"] < ate]


def main():
    atos_r = R["atos"][:ATE]
    tempo = {"fps": R.get("fps", 30), "formato": R.get("formato", "9:16"), "legenda": R.get("legenda", True),
             "pasta": os.path.relpath(pasta, EST / "motor") + "/"}  # o motor carrega ativos/ e prints/ daqui
    if (pasta / "ativos" / "kraft-fundo.png").exists():
        tempo["fundo_kraft"] = "kraft-fundo"

    if R.get("gravacao"):
        video = (pasta / R["gravacao"]).resolve()
        w, h, dur = sonda(video)
        palavras = corrige(transcrever(video))
        atos, t = [], 0.0
        for i, a in enumerate(R["atos"]):  # todos, para o último ato do teste (--ate) terminar onde o próximo começa
            de = a.get("de", 0) if i else 0  # o primeiro ato começa no começo: a voz da gravação não é cortada
            t = de if isinstance(de, (int, float)) else acha(de, palavras, t, f"ato {i}")
            atos.append({"t0": round(t, 3), "fundo": a.get("fundo", "gravacao")})
        for a, f in zip(atos, [x["t0"] for x in atos[1:]] + [R.get("ate", dur)]):
            a["t1"] = round(min(f, dur), 3)
        atos = atos[:ATE]
        tempo["gravacao"] = {"arquivo": str(video), "w": w, "h": h, "enquadre": R.get("enquadre") or rosto(video, w, h)}
        tempo["alfa"] = True
    else:
        subprocess.run([sys.executable, str(NUCLEO / "2d" / "narrar.py"), str(pasta), *(["--ate", str(ATE)] if ATE else [])], check=True)
        base = json.loads((pasta / "tempo.json").read_text())
        palavras = corrige(transcrever(pasta / "audio" / "narracao.wav"))
        atos = [{"t0": b["t0"], "t1": b["t1"], "fundo": "kraft"} for b in base["atos"]]
        # grafia do roteiro no lugar da do transcritor ("Cloud" -> "Claude"), quando as contas de palavras batem:
        # no texto inteiro; se não, ato por ato
        certas = [a["narracao"]["texto"].split() if a.get("narracao") else [] for a in atos_r]
        pares = [(palavras, sum(certas, []))] if len(palavras) == sum(map(len, certas)) else [
            ([p for p in palavras if b["t0"] - 0.05 <= p["s"] < b["fala"]["t1"] - 0.05], c) for b, c in zip(base["atos"], certas) if b.get("fala")]
        for ws, cs in pares:
            if len(ws) == len(cs):
                for p, c in zip(ws, cs):
                    p["w"] = c

    zoom_auto, antes = 0, None
    for i, (a, ar) in enumerate(zip(atos, atos_r)):
        ps = [p for p in palavras if a["t0"] - 0.05 <= p["s"] < a["t1"]]
        cam = ar.get("camera", "cheia" if a["fundo"] == "gravacao" else None) if R.get("gravacao") else None
        if cam:
            a["camera"] = CAMERAS[cam] if isinstance(cam, str) else cam
            if a["fundo"] == "gravacao" and cam != "cheia":
                a["fundo"] = "kraft"  # câmera reduzida: o resto da tela é papel
            if not cheia(a["camera"]):
                a["legenda_y"] = ar.get("legenda_y", 0.92 if a["camera"]["y"] + a["camera"]["h"] > 0.8 else 0.715)
            if i and not ar.get("camera_corte"):  # muda de layout com movimento: encolhe, cresce ou surge do centro do lugar novo
                c = a["camera"]
                de = antes or {"x": c["x"] + c["w"] * 0.4, "y": c["y"] + c["h"] * 0.4, "w": c["w"] * 0.2, "h": c["h"] * 0.2}
                if de != c:
                    a["cam_de"], a["cam_dura"] = de, 0.45
            a["zoom"] = ar.get("zoom", (1.0, 1.12)[zoom_auto % 2] if cheia(a["camera"]) else 1.0)  # punch-in alternado, como na referência
            zoom_auto += 1
        antes = a.get("camera")
        if ar.get("trilha"):
            a["trilha"] = ar["trilha"]
        a["elementos"] = [resolve(dict(e, em=e.get("em", 0)), a, ps, f"ato {i}, elemento {j} ({e.get('tipo')})")
                          for j, e in enumerate(ar.get("elementos", []))]

    tempo["atos"] = atos
    tempo["total"] = atos[-1]["t1"]
    tempo["frases"] = frases(palavras, tempo["total"])
    (pasta / "tempo.json").write_text(json.dumps(tempo, ensure_ascii=False, indent=1))
    print(f"ok: {len(atos)} atos, {tempo['total']:.1f}s, {len(tempo['frases'])} frases de legenda")


if __name__ == "__main__":
    main()
