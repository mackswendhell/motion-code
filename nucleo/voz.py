"""Voz do estúdio, usada por todos os estilos: chave, chamada ao Fish pelo OpenRouter e decodificação.

O elenco mora em nucleo/vozes.json e as amostras de clone em nucleo/referencias/. A chave fica no .env da raiz.
"""

import base64
import json
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

import numpy as np

NUCLEO = Path(__file__).resolve().parent  # vozes.json e referencias/
RAIZ = NUCLEO.parent  # .env
SR = 24000


def chave():
    env = RAIZ / ".env"
    for line in env.read_text().splitlines() if env.exists() else []:
        if line.startswith("OPENROUTER_API_KEY="):
            return line.split("=", 1)[1].strip()
    sys.exit("Chave não encontrada em .env. Rode ./configurar.sh na raiz do projeto.")


def openrouter(body, destino):
    req = urllib.request.Request("https://openrouter.ai/api/v1/audio/speech", data=json.dumps(body).encode(),
                                 headers={"Authorization": f"Bearer {chave()}", "Content-Type": "application/json"})
    for tentativa in range(3):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                destino.write_bytes(r.read())
                return
        except urllib.error.HTTPError as e:
            erro = f"{e.code} {e.read().decode()[:300]}"
            if e.code < 500:
                break
    sys.exit(f"OpenRouter recusou {body['input']!r}: {erro}")


def corpo(modelo, p, texto):
    body = {"model": modelo, "input": texto, "response_format": "mp3"}
    if p.get("clone"):
        wav = base64.b64encode((NUCLEO / p["clone"]).read_bytes()).decode()
        body["input_references"] = [{"type": "input_audio", "input_audio": {"data": "data:audio/wav;base64," + wav}}]
        if p.get("clone_texto"):
            body["input_references"].append({"type": "text", "text": (NUCLEO / p["clone_texto"]).read_text()})
    else:
        body["voice"] = p["voz"]
    return body


def decode(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    clip = np.frombuffer(raw, dtype=np.float32)
    loud = np.flatnonzero(np.abs(clip) > 0.02)  # corta o silêncio das pontas, deixa 50 ms
    pad = int(0.05 * SR)
    return clip[max(0, loud[0] - pad): loud[-1] + pad] if len(loud) else clip
