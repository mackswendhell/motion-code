"""Placas tipográficas transparentes para a composição do vídeo."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import sys
ep=Path(sys.argv[1])
font='/System/Library/Fonts/Supplemental/Arial Bold.ttf'
im=Image.new('RGBA',(1920,1080));d=ImageDraw.Draw(im)
d.rounded_rectangle((760,974,1160,1030),radius=18,fill='#F1EADC',outline='#FFFFFF',width=1)
d.ellipse((782,994,798,1010),fill='#B8E83E')
d.text((821,987),'Montando a picape.',font=ImageFont.truetype(font,25),fill='#28332E')
im.save(ep/'grafico-montagem.png')
im=Image.new('RGBA',(1920,1080));d=ImageDraw.Draw(im)
d.text((64,54),'TOYOTA 4×4',font=ImageFont.truetype(font,43),fill='#F4EFDF')
d.text((66,113),'MOTION / PRO',font=ImageFont.truetype(font,21),fill='#B8E83E')
d.rounded_rectangle((1655,65,1845,118),radius=26,fill='#B8E83E')
d.text((1695,79),'PRONTO',font=ImageFont.truetype(font,22),fill='#28332E')
im.save(ep/'grafico-final.png')
