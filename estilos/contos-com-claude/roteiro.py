"""Linha do tempo de um episódio: lê episodios/<slug>/roteiro.json e decide quando cada coisa acontece.

O tempo nasce das falas: cada fala dura o áudio dela (audio/falas.json, escrito pelo voz.py)
ou, em rascunho, uma estimativa pelo número de palavras. Cena (Blender), voz e pós leem daqui.
"""

import json
import os

import numpy as np

FPS = 30
PALAVRAS_POR_SEG = 2.6
PAUSA_PADRAO = 0.8   # medido nos vídeos-modelo: 0,7 a 1,2 s entre falas
ENTRADA = 0.25   # o plano corta um pouco antes da fala começar
PRIMEIRA_FALA = 0.1  # nos modelos a voz entra entre 0,03 e 0,07 s: nada de esperar
PRETO = 0.7      # corte seco para preto no fim


class Episodio:
    def __init__(self, pasta):
        self.pasta = os.path.abspath(pasta)
        self.slug = os.path.basename(self.pasta)
        self.dados = json.load(open(os.path.join(self.pasta, "roteiro.json"), encoding="utf-8"))
        self.falas_cfg = self.dados["falas"]
        audio = os.path.join(self.pasta, "audio", "falas.json")
        self.audio = json.load(open(audio)) if os.path.exists(audio) else {}
        self._montar()

    def duracao_fala(self, i):
        a = self.audio.get(str(i))
        if a:
            return a["dur"]
        return max(0.6, len(self.falas_cfg[i]["texto"].split()) / PALAVRAS_POR_SEG + 0.2)

    def _montar(self):
        ab = self.dados.get("abertura") or {}
        t = float(ab.get("segundos", 0))
        self.planos = [dict(a=0.0, b=t, plano=ab.get("plano", "aberto"), acoes=ab.get("acoes", {}),
                            movimento=ab.get("movimento", "suave"), luz=ab.get("luz"), tela=None)] if t else []
        self.falas, self.baloes, self.chapeus, self.cartoes = [], [], [], []
        for i, f in enumerate(self.falas_cfg):
            t += f.get("pausa_antes", PRIMEIRA_FALA if i == 0 else PAUSA_PADRAO)
            if "chapeu" in f:  # vale da fala em diante; null tira o chapéu
                self.chapeus.append((t, f["chapeu"]))
            if f.get("cartoes") == []:  # lista vazia tira os cartões da tela
                for c in self.cartoes:
                    c["t1"] = min(c["t1"], t)
            for c in f.get("cartoes") or []:  # cartões de app empilhando no alto, um em cada "em"
                self.cartoes.append(dict(t0=t + c.get("em", 0), t1=float("inf"), nome=c["nome"]))
            dur = self.duracao_fala(i)
            self.falas.append(dict(i=i, t0=t, t1=t + dur, quem=f["quem"], texto=f["texto"], tela=f.get("tela")))
            if f.get("balao"):  # bolha pequena por cima do plano, sem cortar nem pausar
                b = f["balao"]
                b0 = t + b.get("em", 0.2)
                self.baloes.append(dict(t0=b0, t1=b0 + b.get("dura", 1.8), texto=b["texto"], de=b.get("de", "claude")))
            t += dur + f.get("pausa_depois", 0)
        fim = self.dados.get("final") or {}
        self.fim_falas = t + fim.get("segura", 0.8)
        self.fade = fim.get("fade", 0)  # escurece imagem e som nos últimos N segundos
        # cada fala comanda o plano do seu início (menos a entrada) até a próxima;
        # "cortes" dividem esse trecho em planos menores (reação, staccato)
        for k, f in enumerate(self.falas):
            a = max(0.0, f["t0"] - ENTRADA) if k else (self.planos[0]["b"] if self.planos else 0.0)
            b = max(0.0, self.falas[k + 1]["t0"] - ENTRADA) if k + 1 < len(self.falas) else self.fim_falas
            cfg = self.falas_cfg[f["i"]]
            if cfg.get("continua") and self.planos:  # o plano anterior segue, sem corte
                self.planos[-1]["b"] = b
                continue
            base = dict(plano=cfg.get("plano") or "close_" + f["quem"], acoes=cfg.get("acoes", {}),
                        movimento=cfg.get("movimento", "suave"), luz=cfg.get("luz"), tela=cfg.get("tela"))
            marcos = [(a, base)] + [(f["t0"] + c["em"], {**base, "movimento": "suave", **c})
                                   for c in cfg.get("cortes", []) if a < f["t0"] + c["em"] < b]
            for (x, d), (y, _) in zip(marcos, marcos[1:] + [(b, None)]):
                self.planos.append({**{k2: v for k2, v in d.items() if k2 != "em"}, "a": x, "b": y})
        self.total = self.fim_falas + (PRETO if fim.get("corte_preto", True) else 0)

    def plano_em(self, T):
        """Devolve (índice, plano) com chaves a, b, plano, acoes, movimento, luz, tela."""
        for k, p in enumerate(self.planos):
            if p["a"] <= T < p["b"] or k == len(self.planos) - 1:
                return k, p

    def fala_em(self, T):
        for f in self.falas:
            if f["t0"] <= T <= f["t1"]:
                return f
        return None

    def boca(self, quem, T):
        """0..1: volume real da fala se houver áudio; senão, sílabas sintéticas."""
        import math

        f = self.fala_em(T)
        if not f or f["quem"] != quem:
            return 0.0
        a = self.audio.get(str(f["i"]))
        if a:
            k = int((T - f["t0"]) * FPS)
            return a["boca"][k] if k < len(a["boca"]) else 0.0
        env = min(1.0, (T - f["t0"]) / 0.08, (f["t1"] - T) / 0.08)
        h = (math.sin(int(T * 11) * 12.9898) * 43758.5453) % 1.0
        return env * (0.35 + 0.65 * h)

    def chapeu_em(self, T):
        """(índice em self.chapeus, segundos desde a troca) ou (None, 0)."""
        k = max((n for n, (t0, _) in enumerate(self.chapeus) if t0 <= T), default=None)
        return (k, T - self.chapeus[k][0]) if k is not None and self.chapeus[k][1] else (None, 0)

    def ganho(self, T):
        """1 até o fade começar, 0 no fim; aceita número ou array."""
        return np.clip((self.fim_falas - T) / self.fade, 0, 1) if self.fade else 1.0

    def ganho_som(self, T):
        """O fade do som cai por igual em dB (36 dB ao longo do fade) e só então zera."""
        g = self.ganho(T)
        return g * 10 ** (-1.8 * (1 - g))

    def preto(self, T):
        return T >= self.fim_falas


def carregar(pasta=None):
    return Episodio(pasta or os.environ["EPISODIO"])
