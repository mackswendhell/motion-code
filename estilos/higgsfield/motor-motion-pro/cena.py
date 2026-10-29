"""Motion Pro: ativos Higgsfield em uma animação 3D determinística.

Blender -b -t 8 -P motor-motion-pro/cena.py -- --ep episodios/002-motion-pro-picape --frames 1,24,72
O GLB de origem nunca é alterado. A malha de trabalho é repartida por regiões.
"""
import bpy
import math
import json
import sys
import struct
from pathlib import Path
import numpy as np
from mathutils import Vector

argv = sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
args = dict(zip(argv[::2], argv[1::2]))
EP = Path(args.get('--ep','episodios/002-motion-pro-picape')).resolve()
OUT = EP / 'quadros'
OUT.mkdir(exist_ok=True)
FPS=24
TAU=math.tau

def rgba(h):
    a=[int(h.lstrip('#')[i:i+2],16)/255 for i in (0,2,4)]
    return tuple(x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in a)+(1,)

def mat(name,color,rough=.5,metal=0,emit=0):
    m=bpy.data.materials.new(name); m.diffuse_color=rgba(color)
    n=m.node_tree.nodes.get('Principled BSDF'); n.inputs['Base Color'].default_value=rgba(color)
    n.inputs['Roughness'].default_value=rough; n.inputs['Metallic'].default_value=metal
    n.inputs['Emission Color'].default_value=rgba(color); n.inputs['Emission Strength'].default_value=emit
    return m

def parent(o,p):
    if p: o.parent=p
    return o

def empty(name,loc=(0,0,0),p=None):
    o=bpy.data.objects.new(name,None);bpy.context.scene.collection.objects.link(o);o.location=loc
    return parent(o,p)

def box(name,loc,size,m,bevel=.06,p=None):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name
    o.scale=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Bordas suaves','BEVEL');mod.width=bevel;mod.segments=3
        mod=o.modifiers.new('Normais','WEIGHTED_NORMAL')
    o.data.materials.append(m);return parent(o,p)

def cyl(name,loc,r,depth,m,p=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48,radius=r,depth=depth,location=loc)
    o=bpy.context.object;o.name=name;o.data.materials.append(m)
    for poly in o.data.polygons:poly.use_smooth=True
    return parent(o,p)

def sphere(name,loc,r,m,p=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,radius=r,location=loc)
    o=bpy.context.object;o.name=name;o.data.materials.append(m)
    for poly in o.data.polygons:poly.use_smooth=True
    return parent(o,p)

def line(name,pts,m,width=.012,p=None):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=width;c.bevel_resolution=3
    s=c.splines.new('POLY');s.points.add(len(pts)-1)
    for a,b in zip(s.points,pts):a.co=(*b,1)
    o=bpy.data.objects.new(name,c);bpy.context.scene.collection.objects.link(o);o.data.materials.append(m)
    return parent(o,p)

def text(name,body,loc,size,m,p=None,bold=False):
    c=bpy.data.curves.new(name,'FONT');c.body=body;c.size=size;c.align_y='CENTER';c.space_character=1.05
    c.font=FONT_BOLD if bold else FONT;c.extrude=.0005
    o=bpy.data.objects.new(name,c);bpy.context.scene.collection.objects.link(o);o.location=loc
    o.rotation_euler=(math.pi/2,0,0);o.data.materials.append(m);return parent(o,p)

def imageplane(name,path,loc,size,p=None):
    m=bpy.data.materials.new(name);n=m.node_tree.nodes;n.clear()
    tex=n.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(path),check_existing=True)
    e=n.new('ShaderNodeEmission');e.inputs[1].default_value=.8
    out=n.new('ShaderNodeOutputMaterial');m.node_tree.links.new(tex.outputs['Color'],e.inputs[0]);m.node_tree.links.new(e.outputs[0],out.inputs[0])
    bpy.ops.mesh.primitive_plane_add(size=2,location=loc);o=bpy.context.object;o.name=name
    o.rotation_euler=(math.pi/2,0,0);o.scale=(size[0]/2,size[1]/2,1);o.data.materials.append(m)
    return parent(o,p)

def descendants(o):
    return [o]+list(o.children_recursive)

def visible(group,on):
    for o in descendants(group):o.hide_render=not on

def smooth(x):
    x=max(0,min(1,x));return x*x*(3-2*x)

def ease(t,a,b):return smooth((t-a)/(b-a))
def mix(a,b,u):return Vector(a).lerp(Vector(b),u)
def pop(t,a,d=.35):
    u=max(0,min(1,(t-a)/d));return 1+2.70158*(u-1)**3+1.70158*(u-1)**2 if u>0 else 0

def light(name,loc,power,color,size,target):
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name
    o.data.energy=power;o.data.color=rgba(color)[:3];o.data.shape='DISK';o.data.size=size
    o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
    return o

bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE';scene.eevee.taa_render_samples=int(args.get('--samples',32))
scene.eevee.use_raytracing=False
scene.render.resolution_x=1920;scene.render.resolution_y=1080
scene.render.resolution_percentage=int(args.get('--scale',100));scene.render.fps=FPS
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGB';scene.render.image_settings.compression=15
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast'
world=bpy.data.worlds.new('Estúdio quente');world.node_tree.nodes['Background'].inputs[0].default_value=rgba('#D8C4A6')
world.node_tree.nodes['Background'].inputs[1].default_value=.45;scene.world=world
FONT=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Arial.ttf')
FONT_BOLD=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Arial Bold.ttf')
cream=mat('Marfim','#F1EADC');deskmat=mat('Bancada de areia','#CCAE8E',.6)
ink=mat('Grafite','#28332E');lime=mat('Verde lima','#B8E83E',.32,0,.25)
coral=mat('Terracota','#C97657');silver=mat('Alumínio','#A6AAA3',.3,.7)
white=mat('Papel luminoso','#F8F5EC',.6,0,.15);soft=mat('Texto secundário','#6D796C')
black=mat('Borracha','#1D2422',.72);green=mat('Fundo verde profundo','#182C22',.6)
chrome=mat('Metal da estrutura','#6E766E',.25,.7)

# Importação e normalização para bancada de miniaturas.
bpy.ops.import_scene.gltf(filepath=str(EP/'ativos/picape-original.glb'))
car=next(o for o in scene.objects if o.type=='MESH')
bpy.context.view_layer.objects.active=car;car.select_set(True)
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
me=car.data;v=np.empty(len(me.vertices)*3,dtype=np.float32);me.vertices.foreach_get('co',v);v=v.reshape(-1,3)
mn=v.min(axis=0);mx=v.max(axis=0);center=(mn+mx)/2;center[2]=mn[2];v=(v-center)*(5.5/max(mx-mn))
me.vertices.foreach_set('co',v.ravel());me.update()
# Classificação por centroides mantém UVs e todas as faces originais na soma das partes.
idx=np.empty(len(me.loops),dtype=np.int32);me.loops.foreach_get('vertex_index',idx);tri=idx.reshape(-1,3)
cent=v[tri].mean(axis=1);uv=np.empty(len(me.loops)*2,dtype=np.float32);me.uv_layers.active.data.foreach_get('uv',uv);uv=uv.reshape(-1,3,2)
groups=np.full(len(tri),4,dtype=np.int8)
wheelcenters=[(1.90,-.86,.50),(1.90,.86,.50),(-1.33,-.86,.50),(-1.33,.86,.50)]
for k,(x,y,z) in enumerate(wheelcenters):
    sel=((cent[:,0]-x)**2+(cent[:,2]-z)**2 < .52**2)&(cent[:,1]*np.sign(y)>.60)
    groups[sel]=k
# Faróis acima do teto. O santantônio permanece na carroceria, sem cortes oblíquos.
groups[cent[:,2]>2.40]=5
parts=[];root=empty('PICAPE • montagem')
for g,name in enumerate(['Roda dianteira E','Roda dianteira D','Roda traseira E','Roda traseira D','Carroceria Toyota','Santantônio e faróis']):
    take=np.flatnonzero(groups==g);t=tri[take];used,remap=np.unique(t,return_inverse=True)
    origin=np.array(wheelcenters[g]) if g<4 else np.array((0,0,0) if g==4 else (-.3,0,2.5))
    geo=bpy.data.meshes.new(name);geo.from_pydata((v[used]-origin).tolist(),[],remap.reshape(-1,3).tolist());geo.update()
    geo.uv_layers.new(name='UVMap');geo.uv_layers.active.data.foreach_set('uv',uv[take].ravel())
    for m in me.materials:geo.materials.append(m)
    for poly in geo.polygons:poly.use_smooth=True
    obj=bpy.data.objects.new(name,geo);scene.collection.objects.link(obj);obj.parent=root
    obj['origin']=origin.tolist();parts.append(obj)
bpy.data.objects.remove(car,do_unlink=True)
print('PARTS',[(o.name,len(o.data.polygons)) for o in parts],flush=True)

# Chassi demonstrativo: interior auxiliar, invisível no carro completo.
chassis=empty('Estrutura de montagem',p=root)
for y in [-.53,.53]:box('Longarina',(0,y,.72),(4.2,.10,.15),chrome,.025,chassis)
for x in [-1.33,-.6,.55,1.90]:box('Travessa',(x,0,.72),(.12,1.14,.12),chrome,.025,chassis)
for x in [-1.33,1.90]:
    axle=cyl('Eixo',(x,0,.56),.075,1.8,chrome,chassis);axle.rotation_euler=(math.pi/2,0,0)
    sphere('Diferencial',(x,0,.56),.17,black,chassis)
    for y in [-.49,.49]:
        pts=[(x+.055*math.cos(i*.36),y+.055*math.sin(i*.36),.60+i*.006) for i in range(55)]
        line('Mola',pts,lime,.013,chassis)

# Bancada, cenário e pequenos objetos.
static_before=set(scene.objects)
box('Mesa',(0,1,-.3),(24,17,.6),deskmat,.20)
box('Parede',(0,9,6),(35,.35,13),cream,.1)
for x in [-10,-5,0,5,10]:box('Painel vertical',(x,8.78,4.2),(.018,.02,8.2),white,.004)
for i in range(3):
    o=box('Livro',(-5.3,3.4,.13+i*.23),(2.1,1.45,.22),[lime,white,coral][i],.04);o.rotation_euler.z=.08*i-.08
cup=cyl('Vaso coral',(5.4,3.2,.47),.43,.94,coral)
soil=mat('Terra','#4F4736');cyl('Terra',(5.4,3.2,.94),.37,.04,soil)
leaf=mat('Folhas','#678342')
for j in range(8):
    a=j*TAU/8;pts=[]
    for i in range(16):
        u=i/15;pts.append((5.4+.55*u*math.cos(a),3.2+.55*u*math.sin(a),.92+1.05*u-.45*u*u))
    line('Folha',pts,leaf,.065)
box('Bloco verde',(4,1.8,.08),(1.1,.9,.16),lime,.04)
line('Lápis',[(-4.4,.6,.09),(-2.9,1.7,.09)],coral,.045)
box('Folha técnica',(-4.2,-.4,.025),(2.1,2.5,.025),white,.01)
for i in range(8):line('Grade da folha',[(-5.15,-1.55+i*.3,.045),(-3.25,-1.55+i*.3,.045)],soft,.002)
environment_static=list(set(scene.objects)-static_before)

# Notebook: tela e interface são geometria tipográfica legível.
laptop=empty('NOTEBOOK',(0,4,0))
box('Base', (0,-.65,.12),(6.8,2.85,.22),silver,.13,laptop)
box('Trackpad',(0,-1.35,.242),(1.65,.8,.015),chrome,.045,laptop)
for row in range(4):
    for col in range(15):box('Tecla',(-2.95+col*.42,-.75+row*.33,.25),(.35,.25,.035),ink,.03,laptop)
box('Moldura',(0,.50,2.48),(6.8,.23,4.36),ink,.15,laptop)
box('Tela',(0,.363,2.48),(6.5,.025,4.07),white,.08,laptop)
text('Marca','MOTION / LAB',(-2.96,.333,4.23),.19,ink,laptop,True)
text('Conectado','●  HIGGSFIELD', (1.48,.333,4.23),.12,soft,laptop)
line('Linha interface',[(-3,.32,3.98),(3,.32,3.98)],silver,.008,laptop)
ui=empty('Interface texto',p=laptop)
text('Título','Da peça ao movimento.',(-2.8,.30,3.5),.30,ink,ui,True)
text('Sub','Toyota 4×4  /  montagem em 3D',(-2.8,.30,3.07),.17,soft,ui)
imageplane('Foto da picape',EP/'ativos/picape-referencia.png',(1.25,.28,1.72),(3.2,1.79),ui)
text('Status1','01   Estrutura verificada',(-2.8,.29,2.38),.19,ink,ui)
text('Status2','02   Peças alinhadas',(-2.8,.29,1.97),.19,ink,ui)
text('Status3','03   Pronta para montar',(-2.8,.29,1.56),.19,ink,ui)
box('Progresso',(0,.29,.78),(5.6,.035,.06),cream,.025,ui)
progress=box('Progresso ativo',(-2.8,.26,.78),(5.6,.035,.065),lime,.025,ui)

# Cartões flutuantes atravessam a moldura da tela.
cards=[]
for j,(title,sub) in enumerate([('Chassi','Base do projeto'),('Suspensão','Altura e equilíbrio'),('Carroceria','Identidade original'),('Acabamento','Detalhes finais')]):
    card=empty('ETAPA '+title)
    box('Cartão',(0,0,0),(2.17,.12,1.24),white,.1,card)
    box('Destaque',(-.79,-.082,.20),(.34,.04,.34),lime if j==1 else coral,.07,card)
    text('Número',f'0{j+1}',(-.9,-.11,.20),.15,ink,card,True)
    text('Etapa',title,(-.51,-.085,.21),.18,ink,card,True)
    text('Legenda',sub,(-.93,-.085,-.16),.105,soft,card)
    tick=empty('Concluído',(.79,-.20,.51),card)
    disc=cyl('Selo',(0,0,0),.19,.065,coral,tick);disc.rotation_euler.x=math.pi/2
    line('Check',[(-.08,-.042,0),(-.025,-.042,-.055),(.09,-.042,.075)],white,.024,tick)
    cards.append((card,tick))

# Galeria com as vistas já geradas, sem trocar a identidade do carro.
gallery=empty('GALERIA')
gallery_cards=[]
for j,(file,label) in enumerate([('picape-lado-esquerdo.png','01 / PERFIL'),('picape-frente.png','02 / FRENTE'),('picape-referencia.png','03 / PERSPECTIVA')]):
    p=empty('Vista '+label,p=gallery)
    box('Placa',(0,0,0),(3.5,.10,2.45),white,.13,p)
    imageplane(label,EP/'ativos'/file,(0,-.07,.10),(3.27,1.83),p)
    text('Nome vista',label,(-1.48,-.09,-.96),.14,ink,p,True)
    gallery_cards.append(p)
selection=line('Seleção',[(1.72*math.cos(TAU*i/96),-.16,1.04*math.sin(TAU*i/96)+.08) for i in range(97)],lime,.037,gallery_cards[2])

# Rótulos da bancada acompanhando os componentes.
labels=[]
for title in ['RODAS / 4×4','CARROCERIA / ORIGINAL','ESTRUTURA / OK']:
    p=empty(title)
    box('Etiqueta',(0,0,0),(2.45,.06,.46),white,.06,p)
    box('Indicador',(-1,-.05,0),(.12,.025,.12),lime,.025,p)
    text('Texto etiqueta',title,(-.83,-.05,0),.14,ink,p,True)
    labels.append(p)
scanner=box('Varredura de inspeção',(0,0,.05),(.025,6.7,.012),lime,.005)

# Palco final separado: uma apresentação limpa em verde escuro.
stage=empty('PALCO FINAL',(24,0,0))
box('Chão final',(0,0,-.12),(20,20,.24),green,.08,stage)
box('Fundo final',(0,7,10),(70,.2,30),green,.08,stage)
cyl('Pedestal',(0,0,.10),3.55,.20,ink,stage)
ring=line('Anel da base',[(3.45*math.cos(i*TAU/120),3.45*math.sin(i*TAU/120),.22) for i in range(121)],lime,.018,stage)
light('Principal quente',(1,-5,9),1900,'#FFF1DC',7,(0,1,1))
light('Preenchimento',(-7,-1,5),1250,'#FFFFFF',6,(0,1,1))
light('Recorte quente',(4,6,7),2300,'#FFE4C3',5,(0,1,1))
light('Final principal',(28,-6,8),2400,'#FFF4DF',6,(24,0,1))
light('Final recorte',(20,4,5),2000,'#C2EB63',4,(24,0,1))
light('Final fill',(20,-4,4),1300,'#FFFFFF',5,(24,0,1))

bpy.ops.object.camera_add();cam=bpy.context.object;scene.camera=cam;cam.data.lens=44
focus=empty('Foco');cam.data.dof.use_dof=True;cam.data.dof.focus_object=focus;cam.data.dof.aperture_fstop=5.6

# Pontos de controle de câmera; entre eles a velocidade assenta nos alvos.
camera_keys=[
 (0,(.1,-6.9,16.8),(0,.3,.4),42),
 (.42,(.1,-6.8,16.4),(0,.3,.4),42),
 (.85,(1.7,-5.8,6.8),(1.3,-2,.35),42),
 (1.25,(1.7,-5.6,6.6),(1.3,-2,.35),42),
 (1.63,(-1.8,-6.9,8.4),(-.3,1.3,1),42),
 (2.30,(-1.6,-6.7,8.2),(-.2,1.4,1),42),
 (2.66,(-1.5,-6.5,8.1),(-.1,1.5,1),42),
 (3.04,(1.0,-3.5,3.85),(0,4.1,2.55),47),
 (4.20,(.6,-3.1,3.75),(0,4.1,2.50),47),
 (4.65,(1.0,-10.5,5.05),(0,3,2.2),43),
 (5.72,(.5,-10.3,4.8),(0,3,2.2),43),
 (6.10,(7.5,-10.2,5.2),(0,0,1.1),47),
 (7.25,(7.2,-9.8,4.7),(0,0,1.1),47),
 (8.30,(7.0,-9.1,3.5),(0,0,1.15),47),
 (8.77,(2.9,-2.8,1.1),(1.9,-.86,.5),38),
 (9.04,(2,-5.7,3.7),(0,3.6,2.4),40),
 (9.35,(1,-12.1,4.2),(0,2,2.3),42),
 (10.68,(.3,-11.8,4.0),(0,2,2.3),42),
 (10.86,(.3,-11.7,4.0),(0,2,2.3),42),
 (10.90,(31,-10.5,4.7),(24,0,1.15),49),
 (12,(30.5,-10.0,4.5),(24,0,1.15),49),
]

def camera_at(t):
    for a,b in zip(camera_keys,camera_keys[1:]):
        if a[0]<=t<=b[0]:
            u=ease(t,a[0],b[0]);cam.location=mix(a[1],b[1],u);target=mix(a[2],b[2],u)
            cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();focus.location=target
            cam.data.lens=a[3]+(b[3]-a[3])*u
            return

# Posição final é a geometria original. Abertura separa as mesmas peças.
inventory=[(-2.6,-2.0,.28),(-.86,-2.0,.28),(.86,-2.0,.28),(2.6,-2.0,.28),(0,1.6,-.35),(3.7,1.0,.30)]
spread=[(1,-1.2,.15),(1,1.2,.15),(-1,-1.2,.15),(-1,1.2,.15),(0,0,3.6),(0,0,1.6)]

def apply(t):
    scene.frame_set(round(t*FPS)+1)
    camera_at(t)
    hero=t>=10.90
    for o in environment_static:o.hide_render=hero
    root.location=(24,0,.23) if hero else (0,-.3,.04)
    root.rotation_euler=(0,0,(-.15+.32*ease(t,10.9,12)) if hero else 0)
    # Inventário, depois desmontagem fora de campo e montagem em cascata.
    for i,o in enumerate(parts):
        if t<2.8:u=0
        elif t<6:u=0
        else:
            start=6.05+[.22,.32,.42,.52,1.08,1.72][i]
            u=ease(t,start,start+.53)
        origin=Vector(o['origin'])
        o.rotation_euler=(0,0,0)
        o.location=origin+Vector(spread[i])*(1-u)
        if t<2.8:
            o.location=inventory[i]
            if i<4:o.rotation_euler.x=math.copysign(math.pi/2,origin.y)
        if i==4 and 6<=t<7.66:o.location=mix((0,0,3.6),(0,0,0),ease(t,7.1,7.66))
        if hero:o.location=origin
        o.hide_render=(2.8<t<6) or (i==4 and 6<=t<7.08) or (9.0<=t<10.9)
    visible(chassis,6<=t<7.8)
    scanner.hide_render=t>2.66
    scanner.location.x=-4+8*ease(t,0,2.6)
    visible(stage,hero)
    for j,(o,tick) in enumerate(cards):
        visible(o,4.25<=t<6.08)
        s=max(.001,.88*pop(t,4.28+j*.13));o.scale=(s,s,s)
        o.location=(-3.05+j*2.03,1.90,2.25+.05*math.sin(t*1.2+j))
        tick.scale=(max(.001,pop(t,5.03+j*.18,.24)),)*3
    visible(gallery,9.05<=t<10.90)
    for j,o in enumerate(gallery_cards):
        s=max(.001,pop(t,9.14+j*.16,.48));o.scale=(s,s,s)
        o.location=(-3.4+j*3.4,1.6+abs(j-1)*.25,2.4+(.12 if j==2 else 0))
        o.rotation_euler.z=(j-1)*-.06
    selection.hide_render=t<10.06 or t>=10.9
    for j,o in enumerate(labels):
        visible(o,t<2.66)
        o.location=[(1.0,-3.1,.8),(-1,1,2.6),(-3.2,.5,.5)][j]
        # Etiquetas orientadas ao plano da câmera.
        o.rotation_euler=cam.rotation_euler.copy();o.rotation_euler.rotate_axis('X',-math.pi/2)
    progress.scale.x=max(.01,ease(t,3.0,4.2));progress.location.x=-2.8+2.8*progress.scale.x
    visible(laptop,not hero)
    visible(ui,not(9.05<t<10.90))

frames=[int(x) for x in args.get('--frames','1,24,48,84,120,156,180,201,228,252,276').split(',')]
if args.get('--render')=='all':frames=list(range(1,289))
for f in frames:
    cached=OUT/f'{f:04d}.png'
    if cached.exists() and args.get('--resume')=='yes':
        data=cached.read_bytes()
        expected=(scene.render.resolution_x*scene.render.resolution_percentage//100,scene.render.resolution_y*scene.render.resolution_percentage//100)
        if len(data)>24 and struct.unpack('>II',data[16:24])==expected and data[-8:-4]==b'IEND':continue
    apply((f-1)/FPS);scene.render.filepath=str(OUT/f'{f:04d}.png');bpy.ops.render.render(write_still=True)
    print('FRAME_DONE',f,flush=True)
if args.get('--save')=='yes':
    apply(11.65);bpy.ops.wm.save_as_mainfile(filepath=str(EP/'motion-pro.blend'))
