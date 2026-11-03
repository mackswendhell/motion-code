"""Zona do rosto em 1 quadro por segundo do vídeo inteiro (detector Haar do OpenCV).

Uso: python rosto.py "<video.mp4>"
Precisa de opencv-python-headless<5 (no OpenCV 5 o CascadeClassifier saiu). Num venv à parte:
  python3 -m venv /tmp/cv && /tmp/cv/bin/pip install "opencv-python-headless<5" numpy
A caixa do Haar pega o rosto sem cabelo e sem queixo: some ~40 px em cima e ~60 px embaixo antes de usar.
"""
import subprocess
import sys

import cv2
import numpy as np

W, H = 960, 540
p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-vf", f"fps=1,scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
cc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
caixas, n, falhas = [], 0, 0
while True:
    b = p.stdout.read(W * H * 3)
    if len(b) < W * H * 3:
        break
    n += 1
    f = np.frombuffer(b, np.uint8).reshape(H, W, 3)
    fs = cc.detectMultiScale(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), 1.1, 6, minSize=(80, 80))
    if len(fs) == 0:
        falhas += 1
        continue
    x, y, w, h = max(fs, key=lambda r: r[2] * r[3])
    caixas.append((x * 2, y * 2, (x + w) * 2, (y + h) * 2))
a = np.array(caixas)
print("quadros", n, "sem rosto", falhas)
print("união   x0 %d y0 %d x1 %d y1 %d" % (a[:, 0].min(), a[:, 1].min(), a[:, 2].max(), a[:, 3].max()))
print("p2/p98  x0 %d y0 %d x1 %d y1 %d" % (np.percentile(a[:, 0], 2), np.percentile(a[:, 1], 2), np.percentile(a[:, 2], 98), np.percentile(a[:, 3], 98)))
