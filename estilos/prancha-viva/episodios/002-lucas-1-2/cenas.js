// Cenas exclusivas de Lucas 1–2. O núcleo do estúdio é importado, nunca alterado.
// Contrato herdado da Prancha Viva: iniciar(tempo) e quadro(t), determinísticos.
const LUCAS = {
  ink:'#493d35', paper:'#eee3cb', cream:'#f8eed8', clay:'#b26d50', gold:'#d9aa59',
  teal:'#3d7477', blue:'#284b60', skin:'#bc8964', olive:'#72795b', rose:'#a56e69'
};
const SC = [
  ['mesa',[['lucas',1120,900,1.1,'escreve']]],
  ['casa',[['isabel',760,910,1,'espera'],['zacarias',1180,900,1,'quieto']]],
  ['altar',[['zacarias',640,920,1.08,'espanto'],['gabriel',1290,885,1.12,'anuncia']]],
  ['altar',[['zacarias',650,930,1.1,'pergunta'],['gabriel',1280,885,1.1,'anuncia']]],
  ['patio',[['parente',440,940,.83,'ouve'],['parente2',700,960,.9,'ouve'],['zacarias',1160,895,1.08,'sinais']]],
  ['casa',[['isabel',960,910,1.14,'espera'],['zacarias',1370,865,.83,'ouve']]],
  ['nazare',[['maria',720,930,1.12,'espanto'],['gabriel',1260,900,1.1,'anuncia']]],
  ['nazare',[['maria',720,930,1.12,'ouve'],['gabriel',1260,900,1.1,'anuncia']]],
  ['nazare',[['maria',720,930,1.12,'consente'],['gabriel',1260,900,1.1,'anuncia']]],
  ['porta',[['maria',810,930,1.04,'acolhe'],['isabel',1110,925,1.07,'acolhe']]],
  ['jardim',[['maria',820,940,1.12,'louva'],['isabel',1210,900,.94,'ouve']]],
  ['jardim',[['maria',850,940,1.12,'louva'],['isabel',1240,910,.94,'ouve']]],
  ['casa',[['zacarias',700,940,1,'pano'],['isabel',1080,930,1.04,'pano'],['maria',1460,885,.8,'ouve']]],
  ['casa',[['isabel',850,940,1.12,'bebe'],['zacarias',1240,915,1.03,'acolhe']]],
  ['casa',[['parente',470,945,.86,'pergunta'],['isabel',890,945,1.05,'bebe'],['zacarias',1360,935,1.04,'tabuinha']]],
  ['casa',[['isabel',650,930,.95,'bebe'],['zacarias',1110,940,1.13,'louva'],['parente',1530,925,.79,'ouve']]],
  ['amanhecer',[['zacarias',1070,945,1.17,'bebe'],['isabel',650,905,.91,'ouve']]],
  ['amanhecer',[['zacarias',1070,945,1.17,'bebe'],['isabel',650,905,.91,'ouve']]],
  ['deserto',[['joao',1060,875,.76,'caminha']]],
  ['estrada',[['jose',780,940,1.02,'trouxa'],['maria',1140,945,1.02,'gravida']]],
  ['abrigo',[['jose',600,930,1.02,'protege'],['maria',1000,940,1.09,'bebe']]],
  ['campo',[['pastor',770,940,1,'manta'],['pastor2',1230,940,.9,'ouve']]],
  ['campo',[['pastor',620,950,.91,'espanto'],['pastor2',900,950,.85,'ouve'],['anjo',1370,880,1.08,'anuncia']]],
  ['ceu',[['pastor',650,1000,.72,'espanto'],['pastor2',1100,1000,.68,'louva']]],
  ['belem',[['pastor',760,940,.95,'caminha'],['pastor2',1150,940,.91,'caminha']]],
  ['abrigo',[['pastor',450,940,.89,'anuncia'],['jose',740,940,.97,'ouve'],['maria',1180,940,1.07,'bebe']]],
  ['abrigo',[['jose',680,940,1.02,'ouve'],['maria',1090,940,1.13,'bebe']]],
  ['templo',[['jose',750,940,1.03,'cesto'],['maria',1150,940,1.07,'bebe']]],
  ['templo',[['maria',650,940,1.02,'acolhe'],['simeao',1080,940,1.13,'bebe'],['jose',1460,925,.95,'ouve']]],
  ['templo',[['maria',630,945,1,'ouve'],['simeao',1080,945,1.17,'bebe'],['jose',1490,925,.95,'ouve']]],
  ['templo',[['maria',720,945,1.1,'preocupa'],['simeao',1220,945,1.14,'anuncia']]],
  ['templo',[['ana',900,945,1.12,'louva'],['maria',1260,930,.98,'bebe'],['simeao',500,940,.88,'ouve']]],
  ['nazare',[['jose',630,940,1.04,'ouve'],['maria',1250,940,1.05,'ouve'],['jesuspequeno',940,940,.59,'ouve']]],
  ['estrada',[['jose',650,945,1.03,'caminha'],['maria',1250,945,1.02,'caminha'],['jesus',950,945,.82,'caminha']]],
  ['estradatarde',[['jose',740,945,1.05,'procura'],['maria',1190,945,1.07,'procura']]],
  ['cidade',[['jose',730,945,1.05,'procura'],['maria',1160,945,1.07,'procura']]],
  ['doutores',[['doutor',580,960,1.1,'sentado'],['jesus',970,950,.86,'sentado'],['doutor2',1370,960,1.1,'sentado']]],
  ['doutores',[['jose',500,950,1,'ouve'],['maria',850,950,1.1,'pergunta'],['jesus',1270,950,.86,'ouve']]],
  ['doutores',[['jose',500,950,1,'ouve'],['maria',850,950,1.1,'ouve'],['jesus',1270,950,.86,'responde']]],
  ['nazare',[['jose',640,945,1.03,'caminha'],['jesus',950,945,.82,'caminha'],['maria',1250,945,1.04,'coracao']]]
];
const FIG = {
  maria:{robe:'#ad7970',cloak:'#4d7b87',head:'#e8d8b6',skin:'#c48e6e',hair:'#43352d',woman:true,role:'Maria'},
  isabel:{robe:'#886f7c',cloak:'#b5a08a',head:'#e5d8bd',skin:'#bd8f70',hair:'#aaa190',woman:true,old:true,role:'Isabel'},
  zacarias:{robe:'#dfcfac',cloak:'#8b7771',head:'#e9dcc0',skin:'#b58a6a',hair:'#d1c8b2',old:true,beard:true,role:'Zacarias'},
  jose:{robe:'#a86f4b',cloak:'#777e60',head:'#baa27b',skin:'#b37d56',hair:'#514137',beard:true},
  gabriel:{robe:'#f1e3be',cloak:'#d8b772',head:null,skin:'#d3a276',hair:'#795c41',angel:true,role:'Gabriel'},
  anjo:{robe:'#f0e2c3',cloak:'#c5b98a',skin:'#c99d79',hair:'#70563b',angel:true,role:'Anjo dos pastores'},
  simeao:{robe:'#b4b6a2',cloak:'#557078',head:'#c2b89a',skin:'#b08b71',hair:'#d6cdb7',old:true,beard:true,role:'Simeão'},
  ana:{robe:'#8c7965',cloak:'#8e9c94',head:'#dacbad',skin:'#b58c6f',hair:'#c2b8a3',old:true,woman:true},
  pastor:{robe:'#9b9272',cloak:'#806752',head:'#b8ac8d',skin:'#ae7e59',hair:'#594438',beard:true,role:'Pastores'},
  pastor2:{robe:'#937d6b',cloak:'#657573',head:'#d3ba8f',skin:'#bd926a',hair:'#4b3c32',beard:true},
  parente:{robe:'#859289',cloak:'#9e8263',head:'#d7c2a0',skin:'#ba8a63',hair:'#6a5948',beard:true,role:'Parente'},
  parente2:{robe:'#ad896c',cloak:'#777d6e',head:'#c6c1a3',skin:'#bc8f6c',hair:'#625044',woman:true},
  lucas:{robe:'#a18465',cloak:'#5f7372',skin:'#b88a67',hair:'#685442',beard:true},
  joao:{robe:'#957955',cloak:'#7c7757',skin:'#ad7e56',hair:'#514334',beard:true},
  jesus:{robe:'#c4a079',cloak:'#a76d59',skin:'#c08e68',hair:'#574333',boy:true,role:'Jesus aos doze anos'},
  jesuspequeno:{robe:'#d9c8a8',cloak:'#bb8b67',skin:'#c08e68',hair:'#574333',boy:true},
  doutor:{robe:'#a9a493',cloak:'#727e77',head:'#ded0ae',skin:'#ac8261',hair:'#b2ab98',old:true,beard:true},
  doutor2:{robe:'#ba9a78',cloak:'#9a7760',head:'#c9b895',skin:'#bb8f69',hair:'#8b7a62',old:true,beard:true}
};
let LAYERS=new Map(), FILM=[], TEXTURE, OFFA, OFFB;
const TAU=Math.PI*2;
function ellipse(c,x,y,rx,ry,color,rotation=0){c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,TAU);c.fillStyle=color;c.fill();}
function stroke(c,pts,color=LUCAS.ink,width=2){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function poly(c,pts,color){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=color;c.fill();}
function wash(c,draw,color,box,seed=1,n=32){
  c.save();draw();c.fillStyle=color;c.fill();c.clip();
  const r=rng(seed),[x,y,w,h]=box;
  for(let i=0;i<n;i++){
    const px=x+r()*w,py=y+r()*h,rr=12+r()*Math.min(w,h)*.4;
    const g=c.createRadialGradient(px,py,1,px,py,rr);
    g.addColorStop(0,i%3?'rgba(255,241,207,.10)':'rgba(56,36,27,.10)');g.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=g;c.fillRect(px-rr,py-rr,rr*2,rr*2);
  }
  for(let i=0;i<n*2;i++){
    const px=x+r()*w,py=y+r()*h;
    stroke(c,[[px,py],[px+3+r()*18,py-1-r()*4]],i%2?'rgba(255,234,195,.17)':'rgba(69,47,31,.13)',.7);
  }
  c.restore();
  c.save();c.strokeStyle='rgba(65,46,32,.48)';c.lineWidth=1.6;draw();c.stroke();c.restore();
}
function rectWash(c,x,y,w,h,color,seed,n=24){wash(c,()=>{c.beginPath();c.rect(x,y,w,h);},color,[x,y,w,h],seed,n);}
function blob(c,pts,color,seed=2){
  const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  wash(c,()=>caminho(c,tremido(pts,1.3,rng(seed),4)),color,[Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)],seed);
}
function glow(c,x,y,r,alpha=.4){const g=c.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,`rgba(255,228,158,${alpha})`);g.addColorStop(.35,`rgba(255,231,170,${alpha*.5})`);g.addColorStop(1,'rgba(255,231,170,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function arch(c,x,y,w,h,color){c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y+w/2);c.bezierCurveTo(x,y-w*.15,x+w,y-w*.15,x+w,y+w/2);c.lineTo(x+w,y+h);c.closePath();c.fillStyle=color;c.fill();}
function pottery(c,x,y,s=1,color='#b87a57'){
  c.save();c.translate(x,y);c.scale(s,s);
  wash(c,()=>{c.beginPath();c.moveTo(-20,-100);c.bezierCurveTo(-18,-63,-52,-67,-50,-25);c.bezierCurveTo(-47,14,44,12,49,-25);c.bezierCurveTo(51,-65,19,-65,20,-100);c.closePath();},color,[-51,-100,102,110],31,18);
  ellipse(c,0,-100,23,6,'#75533e');stroke(c,[[-20,-90],[20,-90]],'#d6ad81',3);
  c.restore();
}
function basket(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);blob(c,[[-53,-50],[53,-50],[42,0],[-40,0]],'#ac8b55',18);for(let i=-38;i<48;i+=10)stroke(c,[[i,-46],[i*.8,-2]],'rgba(68,49,29,.4)',1.4);for(let y=-40;y<0;y+=9)stroke(c,[[-48,y],[48,y]],'#d4b57a',1.8);c.restore();}
function lamp(c,x,y,s=1,t=0){c.save();c.translate(x,y);c.scale(s,s);glow(c,0,-26,170,.27);ellipse(c,0,0,24,11,'#996b47');ellipse(c,-3,-4,19,6,'#c79561');ellipse(c,16,-22+Math.sin(t*6)*.7,3.5,10,'#ffe6aa',.15);c.restore();}
function olive(c,x,y,s=1){
  c.save();c.translate(x,y);c.scale(s,s);const r=rng(88);
  stroke(c,[[0,0],[-10,-125],[15,-260],[0,-400]],'#78654c',23);
  for(let i=0;i<13;i++){
    const a=-Math.PI*.95+r()*Math.PI*.9,l=170+r()*130,by=-180-r()*140;
    stroke(c,[[0,by],[Math.cos(a)*l*.5,by+Math.sin(a)*l*.4],[Math.cos(a)*l,by+Math.sin(a)*l]],'#786d53',4+r()*4);
    for(let j=0;j<22;j++){const xx=Math.cos(a)*l+(r()-.5)*150,yy=by+Math.sin(a)*l+(r()-.5)*100;ellipse(c,xx,yy,15+r()*10,5+r()*4,j%3?'#79856b':'#a0a58a',r()*3);}
  }c.restore();
}
function hills(c,night=false){
  const cols=night?['#526c71','#3c6269','#2f535a']:['#b2b49a','#a3a184','#8e9474'];
  cols.forEach((co,i)=>{const y=410+i*95;blob(c,[[-100,y+30],[200,y-80+i*20],[500,y+55],[850,y-65],[1200,y+25],[1530,y-90],[2050,y+40],[2050,1100],[-100,1100]],co,83+i);});
}
function village(c,x,y,s=1,night=false){
  c.save();c.translate(x,y);c.scale(s,s);const r=rng(91);
  for(let i=0;i<19;i++){const bx=i*60-500,hh=70+r()*110,yy=-Math.sin(i*.17)*50;
    rectWash(c,bx,yy-hh,56,hh,night?['#776a58','#817458','#675d51'][i%3]:['#d6bd94','#c5a57d','#c7b38e'][i%3],100+i,7);
    if(i%3===0){c.fillStyle=night?'#d3aa62':'#786c55';c.fillRect(bx+19,yy-hh+22,10,20);}
    stroke(c,[[bx-3,yy-hh],[bx+59,yy-hh]],night?'#a08a67':'#b99b70',3);
  }c.restore();
}
function floor(c,color='#c5ad85'){
  blob(c,[[0,755],[1920,755],[2030,1080],[-100,1080]],color,36);
  const r=rng(52);for(let i=0;i<180;i++){const x=r()*1920,y=770+r()*310;stroke(c,[[x,y],[x+4+r()*27,y+(r()-.5)*5]],'rgba(85,64,42,.15)',.7);}
}
function interior(c,env){
  const temple=['altar','templo','patio','doutores'].includes(env),night=env==='abrigo';
  const grad=c.createLinearGradient(0,0,0,1080);grad.addColorStop(0,night?'#3c5359':temple?'#d4c9ad':'#e1cdac');grad.addColorStop(1,night?'#a38662':'#f2dfb6');c.fillStyle=grad;c.fillRect(0,0,1920,1080);
  aquarela(c,1920,1080,night?['#344b55','#7c745e','#c1965f']:['#d6bf94','#efdcb4','#bdbba0'],40,.18,rng(73));
  if(temple){
    arch(c,765,120,390,660,'#a99d7e');arch(c,800,151,320,630,env==='altar'?'#746955':'#e8d8ac');
    if(env!=='altar'){village(c,1000,655,.6,false);glow(c,990,400,400,.2);}
    for(const x of [180,480,1400,1700]){
      rectWash(c,x,70,98,720,'#d1c6a5',x,18);rectWash(c,x-18,67,134,32,'#bbb293',x+1,7);rectWash(c,x-17,766,132,32,'#b9b092',x+2,7);
      for(let a=0;a<4;a++)stroke(c,[[x+14+a*22,103],[x+14+a*22,761]],'rgba(91,86,67,.12)',2);
    }
    for(let y=160;y<730;y+=95)stroke(c,[[0,y],[1920,y]],'rgba(123,107,76,.13)',1);
  }else if(night){
    const rr=rng(17);for(let i=0;i<47;i++)ellipse(c,rr()*1920,rr()*560,rr()*1.5+.4,rr()*1.5+.4,'#cbbf9a');
    village(c,1020,590,1,true);
    blob(c,[[-50,30],[310,55],[480,150],[320,230],[-50,165]],'#75634b',75);
    blob(c,[[0,30],[170,90],[120,1060],[-20,1080]],'#877552',76);
    blob(c,[[1620,100],[1760,55],[1920,5],[1920,1080],[1830,1080],[1770,220]],'#716248',77);
    stroke(c,[[80,90],[1840,115]],'#786148',27);
    for(let x=240;x<1780;x+=150)stroke(c,[[x,95],[x+70,0]],'#8a7350',10);
    glow(c,1070,700,650,.32);
  }else{
    arch(c,175,170,355,580,'#b1956d');arch(c,205,200,295,550,'#b0b7a0');
    c.save();c.beginPath();c.rect(205,190,295,570);c.clip();hills(c);village(c,365,620,.55);c.restore();
    rectWash(c,1430,260,275,23,'#a58b64',62,8);pottery(c,1490,260,.55);pottery(c,1620,260,.72,'#c29769');
    for(let y=600;y<760;y+=80)stroke(c,[[40,y],[1880,y]],'rgba(135,102,67,.09)',1);
    if(env==='porta'){arch(c,740,140,490,645,'#ae9270');arch(c,780,180,410,610,'#8f9f86');}
    if(env==='nazare'){poly(c,[[250,210],[475,200],[1340,850],[1030,870]],'rgba(255,235,177,.18)');}
  }
  floor(c,night?'#958166':temple?'#c9b994':'#cbb48b');
  if(env==='altar'){
    rectWash(c,830,652,245,115,'#b8a16e',44);rectWash(c,805,628,295,29,'#cdb578',42);rectWash(c,815,758,275,22,'#aa9263',43);
    ellipse(c,950,624,56,13,'#a18a58');ellipse(c,950,616,45,10,'#d9bd7b');
  }
  if(!temple&&!night){
    pottery(c,1650,877,1.35);basket(c,1490,907,1.1);ellipse(c,350,929,105,24,'#9b815e');
    rectWash(c,220,860,330,23,'#9e7f59',55,10);stroke(c,[[250,880],[240,1010]],'#987d57',15);stroke(c,[[518,880],[526,1007]],'#987d57',15);
    pottery(c,270,858,.43);ellipse(c,420,857,55,9,'#baa477');
  }
  if(env==='doutores'){
    rectWash(c,400,863,1120,47,'#b6a380',81);rectWash(c,410,908,1100,32,'#c8b691',82);
    for(let x=470;x<1490;x+=170){rectWash(c,x,854,62,7,'#ddd0ad',x,3);}
  }
}
function buildBackground(env){
  const cv=tela(1920,1080),c=cv.getContext('2d');
  if(['mesa','casa','nazare','porta','altar','patio','templo','doutores','abrigo'].includes(env)){
    interior(c,env==='mesa'?'casa':env);
    if(env==='mesa'){
      rectWash(c,400,810,1000,37,'#9c7f5c',51);blob(c,[[630,725],[1130,740],[1090,822],[600,804]],'#e8d8b5',52);
      for(let i=0;i<7;i++)stroke(c,[[670,750+i*7],[1020-i*17,759+i*6]],'rgba(83,67,45,.30)',1.1);pottery(c,1260,809,.24,'#675841');
    }
  }else{
    const night=['campo','ceu','belem'].includes(env),late=env==='estradatarde';
    const g=c.createLinearGradient(0,0,0,1080);g.addColorStop(0,night?'#244956':late?'#a79382':'#b8c2ae');g.addColorStop(.65,night?'#718176':late?'#d6b18b':'#e9dbb3');g.addColorStop(1,'#d4bc91');c.fillStyle=g;c.fillRect(0,0,1920,1080);
    aquarela(c,1920,1080,night?['#3e6470','#75827c','#254c5a']:['#e6d9b7','#acb49a','#d0c49c'],30,.2,rng(9));
    if(night){const r=rng(8);for(let i=0;i<105;i++)ellipse(c,r()*1920,r()*490,.5+r()*1.4,.5+r()*1.4,'#dccfa7');ellipse(c,1530,175,30,30,'#dbd5b7');ellipse(c,1544,163,29,29,'#3e6069');}
    hills(c,night);
    if(env==='deserto'){blob(c,[[-100,720],[450,530],[1070,760],[1620,590],[2040,800],[2040,1090],[-100,1090]],'#c2a477',40);}
    else{
      blob(c,[[900,620],[1030,620],[1610,1080],[200,1080]],night?'#b6ad8b':'#d8c4a0',31);
      if(['estrada','estradatarde','cidade','belem','amanhecer'].includes(env))village(c,1080,597,1.23,night);
      if(env==='cidade'){for(const x of [0,1490]){rectWash(c,x,240,420,680,'#c4ad84',x+11);arch(c,x+70,490,180,400,'#9c896a');}}
      olive(c,1690,950,1.15);if(env==='jardim')olive(c,210,990,1.25);
      if(env==='campo'||env==='ceu'){for(let i=0;i<3;i++)sheep(c,330+i*250,945+(i%2)*40,.8+i*.1,0);}
    }
    if(env==='amanhecer'){glow(c,540,420,550,.52);}
  }
  // Texture commune du papier, construite une seule fois pour chaque décor.
  c.save();c.globalCompositeOperation='multiply';c.globalAlpha=.15;c.drawImage(MANCHA,0,0);c.globalCompositeOperation='soft-light';c.globalAlpha=.42;c.drawImage(GRAO,0,0);c.restore();
  return cv;
}
function sheep(c,x,y,s,t){c.save();c.translate(x,y);c.scale(s,s);ellipse(c,0,0,90,18,'rgba(57,52,39,.11)');for(let i of [-40,-14,24,52])stroke(c,[[i,-30],[i,-2]],'#6a6250',8);for(let i=0;i<16;i++){const a=i/16*TAU;ellipse(c,Math.cos(a)*48,-65+Math.sin(a)*26,22,20,i%2?'#cfc9ac':'#ddd5b9');}ellipse(c,70,-76,22,30,'#786e58',-.3);ellipse(c,82,-83,3,3,'#3f4038');ellipse(c,47,-91,17,6,'#8c8065',-.2);c.restore();}
function hand(c,x,y,rot,skin,open=false){c.save();c.translate(x,y);c.rotate(rot);ellipse(c,0,0,8,14,skin,-.12);ellipse(c,-7,-2,4,8,skin,-.5);for(let i=0;i<3;i++)stroke(c,[[i*3-4,-5],[i*3-4,7]],'rgba(91,57,39,.22)',.7);if(open)for(let i=0;i<4;i++)stroke(c,[[-5+i*3,-8],[-7+i*4,-18+Math.abs(i-1.5)*2]],skin,3);c.restore();}
function baby(c,x,y,s=1,t=0){
  c.save();c.translate(x,y);c.rotate(.16+Math.sin(t*.6)*.007);c.scale(s,s);
  wash(c,()=>{c.beginPath();c.ellipse(0,0,59,27,0,0,TAU);},'#e8d8b3',[-65,-30,130,60],65,15);
  for(let i=-28;i<38;i+=14)stroke(c,[[i,-20],[i+17,21]],'#c5b594',1.5);
  ellipse(c,-39,-4,20,22,'#d6a37c');ellipse(c,-48,-9,9,12,'rgba(239,187,144,.5)');
  stroke(c,[[-49,-5],[-44,-3]],'#775444',1);stroke(c,[[-37,-5],[-33,-4]],'#775444',1);stroke(c,[[-43,5],[-39,5]],'#a36b57',1);
  c.restore();
}
function figure(c,name,x,y,scale,pose,time,activity=0,facing=1,placing=0,detail={}){
  const p=FIG[name],r=rng(name.split('').reduce((a,b)=>a+b.charCodeAt(0),0)),phase=r()*10;
  const breath=Math.sin(time*1.7+phase)*1.3,walk=pose==='caminha'?Math.sin(time*2.2+phase)*3:0;
  c.save();c.translate(x,y);c.scale(scale,scale);c.scale(facing,1);
  ellipse(c,0,4,95,15,'rgba(63,50,33,.12)');
  if(pose==='sentado'){
    rectWash(c,-78,-105,160,18,'#aa9472',168,9);
    stroke(c,[[-65,-88],[-72,0]],'#9d8968',11);stroke(c,[[65,-88],[72,0]],'#9d8968',11);
    c.scale(1,.84);
  }
  c.translate(Math.sin(time*.45+phase)*1.2,breath+walk);
  if(detail.nod)c.rotate(detail.nod);
  if(p.angel){
    glow(c,0,-270,370,.22);
    for(const side of [-1,1]){
      const pts=[[side*30,-320],[side*100,-415],[side*180,-437],[side*150,-310],[side*72,-170]];
      blob(c,pts,'#dbd5b5',27+side);
      for(let i=0;i<13;i++)stroke(c,[[side*(62+i*7),-354-i*4],[side*(47+i*5),-221-i*9]],'rgba(143,131,91,.3)',1.3);
    }
  }
  // Sandales et pieds visibles sous une tunique ample.
  ellipse(c,-31,-2,28,9,'#9e7755');ellipse(c,35,-2,28,9,'#9e7755');
  stroke(c,[[-52,-5],[-17,-5]],'#65513b',3);stroke(c,[[16,-5],[56,-5]],'#65513b',3);
  const robe=()=>{c.beginPath();c.moveTo(-48,-307);c.bezierCurveTo(-69,-258,-59,-102,-92,-9);c.quadraticCurveTo(0,12,91,-9);c.bezierCurveTo(64,-128,72,-264,45,-307);c.closePath();};
  wash(c,robe,p.robe,[-95,-310,190,325],102,40);
  c.save();robe();c.clip();
  for(let i=0;i<15;i++){const xx=-70+i*10;stroke(c,[[xx*.47,-282],[xx*.7+Math.sin(i)*7,-170],[xx,-4]],i%3?'rgba(72,49,34,.18)':'rgba(247,230,191,.22)',i%3?1:2);}
  for(let y=-270;y<-15;y+=9)stroke(c,[[-90,y],[90,y+2]],'rgba(239,219,173,.07)',.6);
  c.restore();
  // Manteau asymétrique drapé; plis propres à chaque personnage.
  blob(c,[[-43,-320],[-74,-295],[-88,-94],[-57,-26],[-29,-63],[-22,-265],[29,-293]],p.cloak,112);
  for(let i=0;i<6;i++)stroke(c,[[-49-i*3,-290],[-57-i*3,-165],[-60-i*2,-54]],'rgba(52,55,45,.16)',1.4);
  stroke(c,[[-54,-202],[56,-200]],p.boy?'#947958':'#8f7858',7);
  // Cou et tête, avec très léger mouvement d'écoute.
  const tilt=(pose==='preocupa'?-.055:pose==='consente'?Math.sin(Math.min(time,8)*.3)*.025:Math.sin(time*.7+phase)*.012)+Math.sin(placing*Math.PI)*.06;
  c.save();c.translate(0,-329);c.rotate(tilt);
  rectWash(c,-14,-21,30,35,p.skin,91,4);
  if(p.head){blob(c,[[-44,-113],[-64,-59],[-60,78],[-27,95],[-24,-20],[36,-19],[53,80],[68,41],[55,-77],[30,-117]],p.head,72);}
  else{ellipse(c,-1,-62,45,59,p.hair);}
  ellipse(c,-34,-51,10,17,p.skin);ellipse(c,35,-51,9,17,p.skin);
  wash(c,()=>{c.beginPath();c.moveTo(-31,-95);c.bezierCurveTo(-43,-66,-34,-23,-20,-10);c.bezierCurveTo(-3,5,20,-3,30,-23);c.bezierCurveTo(42,-48,34,-88,20,-101);c.closePath();},p.skin,[-40,-105,80,110],120,15);
  // Cheveux à la racine du voile; mèches en encre.
  c.beginPath();c.moveTo(-35,-66);c.bezierCurveTo(-48,-99,-10,-122,23,-105);c.quadraticCurveTo(39,-96,37,-65);c.lineTo(24,-85);c.quadraticCurveTo(-4,-87,-22,-96);c.closePath();c.fillStyle=p.hair;c.fill();
  for(let i=0;i<12;i++)stroke(c,[[-28+i*5,-98+Math.sin(i)*4],[-24+i*5,-86+Math.sin(i)*5]],'rgba(249,228,185,.14)',.9);
  if(p.head){stroke(c,[[-43,-92],[-26,-113],[8,-120],[40,-107],[52,-76]],p.head,14);stroke(c,[[-44,-91],[-26,-111],[9,-118],[39,-106]],'rgba(255,245,213,.4)',1.4);}
  const eyes=-55,blink=(Math.sin(time*.8+phase)> .995)||Math.sin(time*1.22+phase)>.999;
  const eyebrow=pose==='espanto'?-5:pose==='preocupa'||pose==='pergunta'?-2:0;
  for(let i of [-1,1]){
    const ex=i<0?-15:17;
    const gaze=['bebe','acolhe','coracao'].includes(pose)?1.7:0;
    if(!blink){ellipse(c,ex,eyes,8,4.6,'#e8d9bb');ellipse(c,ex+2,eyes+gaze,3.1,3.7,'#4b453a');ellipse(c,ex+3,eyes-1+gaze,1,1,'#f7ebd1');}
    stroke(c,[[ex-7,eyes],[ex-3,eyes-(blink?0:3.7)],[ex+4,eyes-(blink?0:3)],[ex+7,eyes]],'#584536',1.3);
    stroke(c,[[ex-8,eyes-11+eyebrow],[ex-2,eyes-14+eyebrow],[ex+6,eyes-12+eyebrow]],p.old?'#8a7d66':p.hair,p.woman?1.5:2.4);
  }
  stroke(c,[[3,-51],[0,-35],[6,-32],[10,-35]],'rgba(108,67,45,.46)',1.3);
  ellipse(c,-24,-35,10,6,'rgba(178,98,74,.16)');ellipse(c,26,-34,8,5,'rgba(178,98,74,.14)');
  if(p.beard){
    blob(c,[[-32,-35],[-21,-23],[0,-19],[20,-23],[31,-38],[32,-12],[12,14],[-9,19],[-29,-4]],p.hair,19);
    for(let i=0;i<13;i++){const xx=-26+i*4;stroke(c,[[xx,-17],[xx*.72,7-Math.abs(xx)*.13]],'rgba(246,227,190,.3)',.8);}
  }
  const mouth=activity>0?.9+activity*3.2:0;
  if(mouth){ellipse(c,4,-19,5+activity*2,mouth,'#74503f');stroke(c,[[-2,-23],[9,-23]],'#c09275',.7);}
  else{c.beginPath();c.moveTo(-4,-19);c.quadraticCurveTo(3,pose==='louva'||pose==='bebe'?-15:-17,11,-20);c.strokeStyle='#8d5e4b';c.lineWidth=1.4;c.stroke();}
  if(p.old){for(const [xx,yy] of [[-26,-47],[24,-46],[-19,-72],[17,-73]])stroke(c,[[xx,yy],[xx+7,yy-1]],'rgba(106,77,52,.35)',.7);stroke(c,[[-11,-82],[13,-82]],'rgba(117,84,56,.22)',1);}
  c.restore();
  // Bras articulés : l'avant-bras suit l'intention, pas un balancement mécanique.
  let left=[-66,-160],right=[60,-157],lEl=[-86,-230],rEl=[82,-227];
  const gesture=Math.sin(time*.8+phase)*4;
  if(['anuncia','louva','responde','pergunta','sinais'].includes(pose)){right=[116+gesture,-260+(pose==='louva'?-32:0)];rEl=[99,-210];}
  if(['espera','gravida','consente','coracao','preocupa'].includes(pose)){right=[8,-231];rEl=[71,-198];left=pose==='gravida'?[-5,-173]:[-58,-179];}
  if(['bebe','acolhe'].includes(pose)){left=[21,-230];right=[65,-222];lEl=[-72,-208];rEl=[82,-206];}
  if(['tabuinha','escreve'].includes(pose)){left=[-2,-192];right=[63,-221];lEl=[-76,-217];rEl=[83,-228];}
  if(pose==='protege'){right=[86,-214];rEl=[80,-200];}
  if(pose==='trouxa'){right=[50,-299];rEl=[98,-253];}
  if(pose==='pano'){right=[105,-219+gesture];rEl=[85,-229];}
  if(pose==='ajeita'){left=[70,-267+Math.sin(time*1.8)*4];lEl=[-32,-231];right=[50,-300];rEl=[91,-260];}
  if(pose==='manta'){left=[-66,-160+Math.sin(time*.9)*3];lEl=[-89,-230];}
  if(placing>0){const reach=placing*(1-seg(placing,.9,1));left=[left[0]+68*reach,left[1]+140*reach];right=[right[0]+68*reach,right[1]+140*reach];lEl=[lEl[0]+24*reach,lEl[1]+62*reach];rEl=[rEl[0]+30*reach,rEl[1]+64*reach];}
  for(const [shoulder,elbow,end] of [[[-48,-285],lEl,left],[[47,-284],rEl,right]]){
    stroke(c,[shoulder,elbow,end],p.robe,32);stroke(c,[shoulder,elbow,end],'rgba(247,226,182,.12)',18);hand(c,end[0],end[1],end[0]>0?-.4:.3,p.skin,['anuncia','louva','responde','sinais','pergunta'].includes(pose));
  }
  if(pose==='bebe'||detail.bebe)baby(c,24,-229,.91,time);
  if(pose==='tabuinha'){
    rectWash(c,-52,-218,129,65,'#b59b6b',56,9);rectWash(c,-45,-211,115,50,'#6e6650',57,4);
    c.save();if(facing<0){c.translate(26,0);c.scale(-1,1);}c.beginPath();c.rect(-45,-211,115*(detail.escrita??1),50);c.clip();
    c.fillStyle='#f6e7bd';c.font='12px Georgia';c.textAlign='center';c.fillText('João é',13,-192);c.fillText('o seu nome',13,-176);c.restore();
    stroke(c,[[62,-226],[41,-201]],'#69553b',2);
  }
  if(pose==='trouxa'||pose==='ajeita'){blob(c,[[51,-320],[110,-313],[127,-269],[99,-248],[56,-271]],'#a99470',69);stroke(c,[[65,-307],[108,-284]],'#675d46',3);}
  if(pose==='cesto')basket(c,60,-127,.7);
  if(pose==='pano'){blob(c,[[98,-228],[148,-213],[139,-145],[109,-168]],'#c5b791',46);}
  if(pose==='protege')lamp(c,87,-203,.68,time);
  c.restore();
}
function smoke(c,t){for(let j=0;j<6;j++){c.beginPath();for(let i=0;i<32;i++){const y=610-i*13,x=950+Math.sin(i*.2-t*.4+j*.4)*(8+i*1.1);i?c.lineTo(x,y):c.moveTo(x,y);}c.strokeStyle=`rgba(245,230,197,${.065-j*.006})`;c.lineWidth=13+j*2;c.stroke();}}
function manger(c,xx,t,infant=true){
  const rr=rng(34);for(let i=0;i<130;i++){const x=xx-190+rr()*400,y=975+rr()*60;stroke(c,[[x,y],[x+(rr()-.5)*55,y-rr()*20]],i%3?'#c4aa6e':'#dfc896',1.2);}
  blob(c,[[xx-150,847],[xx+145,847],[xx+112,962],[xx-115,962]],'#98764b',15);
  for(let i=-130;i<140;i+=25)stroke(c,[[xx+i,861],[xx+i*.78,950]],'#bc9c64',2);
  ellipse(c,xx,848,151,27,'#d3bd88');if(infant)baby(c,xx,843,1.12,t);
}
function sceneConfig(id){return SC[Number(id.slice(1))-1];}
function cue(a,needle,fallback=.5){
  const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  for(const f of a.falas||[]){const text=normalize(f.texto),i=text.indexOf(normalize(needle));if(i>=0)return f.t0+(f.t1-f.t0)*i/text.length;}
  return (a.t1-a.t0)*fallback;
}
function activeSpeech(a,t,role){
  const f=(a.falas||[]).find(f=>t>=f.t0&&t<=f.t1&&f.quem===role);
  if(!f)return 0;
  if(f.envelope?.length){const idx=Math.min(f.envelope.length-1,Math.floor((t-f.t0)/.04));return Math.min(1,f.envelope[Math.max(0,idx)]);}
  return Math.max(0,Math.sin(t*17)*.7+Math.sin(t*31)*.3);
}
function getLayer(env){if(!LAYERS.has(env)){if(LAYERS.size>7)LAYERS.delete(LAYERS.keys().next().value);LAYERS.set(env,buildBackground(env));}return LAYERS.get(env);}
const SHOTS={
  P01:[[0,1050,710,1.10],[.20,1050,720,1.42],[.42,1050,720,1.42],[.66,1120,610,1.38],[1,960,600,1.10]],
  P17:[[0,960,610,1.08],[.18,1070,620,1.48],[.45,1070,620,1.48],[.68,650,630,1.40],[1,960,610,1.12]],
  P18:[[0,1040,720,1.42],[.22,1040,720,1.55],[.44,1070,610,1.48],[.70,1070,610,1.48],[1,960,560,1.08]],
  P24:[[0,960,600,1.03],[.20,960,490,1.08],[.72,960,490,1.08],[1,960,590,1.04]],
  P30:[[0,960,610,1.08],[.15,1080,620,1.53],[.48,1080,620,1.53],[.72,650,620,1.40],[1,960,610,1.12]],
  P39:[[0,1100,670,1.10],[.13,1270,700,1.58],[.40,1270,700,1.58],[.65,790,630,1.40],[.82,790,630,1.40],[1,960,640,1.10]],
  P07:[[0,960,590,1.03],[.10,960,590,1.04],[.28,720,610,1.58],[.42,720,610,1.58],[.60,1260,595,1.55],[.75,1260,595,1.55],[.90,720,610,1.58],[1,960,600,1.12]],
  P08:[[0,960,600,1.12],[.20,1260,595,1.58],[.40,1260,595,1.58],[.59,720,610,1.58],[.73,720,610,1.58],[.92,960,600,1.20],[1,960,600,1.20]],
  P09:[[0,960,600,1.13],[.13,720,610,1.62],[.25,1260,595,1.58],[.46,1260,595,1.58],[.62,720,610,1.62],[.75,720,610,1.62],[.91,960,610,1.13],[1,960,610,1.13]],
  P21:[[0,960,640,1.03],[.18,1030,660,1.38],[.40,1030,660,1.38],[.73,1100,830,1.62],[1,1100,830,1.68]]
};
function cameraShot(id,u){
  const keys=SHOTS[id];if(!keys)return null;
  let i=keys.findIndex(k=>k[0]>=u);if(i<=0)return keys[0].slice(1);
  const a=keys[i-1],b=keys[i],f=ease((u-a[0])/(b[0]-a[0]));
  return [lerp(a[1],b[1],f),lerp(a[2],b[2],f),lerp(a[3],b[3],f)];
}
function storyCamera(id,figs,u,duration){
  // Pranchas longas alternam conjunto, rosto que fala e rosto que escuta.
  // A interpolação mantém a transformação contínua da Prancha Viva.
  const main=figs.filter(f=>!['parente2','jesuspequeno'].includes(f[0]));
  const keys=[[0,960,600,1.04],[.07,960,600,1.05]];
  const beats=Math.max(2,Math.min(8,Math.floor(duration/9)));
  for(let j=0;j<beats;j++){
    const f=main[j%main.length],at=.13+j*(.69/Math.max(1,beats-1));
    const z=main.length===1?1.48:1.42;
    keys.push([at,Math.max(650,Math.min(1270,f[1])),f[2]-280*f[3],z]);
  }
  keys.push([.93,960,610,1.12],[1,960,610,1.12]);
  let i=keys.findIndex(k=>k[0]>=u);if(i<=0)return keys[0].slice(1);
  const a=keys[i-1],b=keys[i],k=ease((u-a[0])/(b[0]-a[0]));
  return [lerp(a[1],b[1],k),lerp(a[2],b[2],k),lerp(a[3],b[3],k)];
}
function poeticVignettes(c,id,u,t){
  if(!['P11','P12','P17','P18','P30'].includes(id))return;
  c.save();c.globalAlpha=.62*seg(u,0,.09)*(1-seg(u,.90,1));
  for(let i=0;i<3;i++){
    const x=330+i*630,y=255+Math.sin(i*2)*25;
    const g=c.createRadialGradient(x,y,20,x,y,184);g.addColorStop(0,'rgba(246,232,196,.94)');g.addColorStop(.82,'rgba(246,232,196,.4)');g.addColorStop(1,'rgba(246,232,196,0)');c.fillStyle=g;c.fillRect(x-190,y-190,380,380);
    if(id==='P12'&&i===0){
      const drop=seg(u,.16,.45)*35;rectWash(c,x-43,y-80+drop,86,100-drop,'#ab8a54',144,10);rectWash(c,x-53,y+13,106,13,'#c3a373',146,5);stroke(c,[[x-34,y+22],[x-40,y+55]],'#a08a63',8);stroke(c,[[x+34,y+22],[x+40,y+55]],'#a08a63',8);
    }else if(id==='P12'&&i===2){
      hand(c,x-75,y+25,-1.3,'#bc8b64',true);hand(c,x+65,y+25,1.4,'#bb8b68',true);ellipse(c,x,y,47,22,'#c69d5e');stroke(c,[[x-18,y-13],[x-8,y+10]],'#eed19a',2);stroke(c,[[x+9,y-13],[x+19,y+9]],'#eed19a',2);
    }else if(id==='P18'&&i===1){
      glow(c,x,y-10,160,.6);ellipse(c,x,y-10,48,48,'#d7b46e');stroke(c,[[x-120,y+60],[x+120,y+60]],'#aba77e',2);
      for(let j=0;j<7;j++){const a=-Math.PI+j*Math.PI/6;stroke(c,[[x+Math.cos(a)*65,y-10+Math.sin(a)*65],[x+Math.cos(a)*92,y-10+Math.sin(a)*92]],'#d7b46e',2);}
    }else{
      const names=id==='P30'?['parente','parente2','pastor']:['parente2','parente','jose'];
      figure(c,names[i],x,y+110,.36,'acolhe',t+i,0,i===2?-1:1);
      stroke(c,[[x-90,y+110],[x+90,y+110]],'rgba(132,116,82,.3)',1);
    }
  }c.restore();
}
function drawScene(c,a,t,absolute){
  const id=a.id||a.cena,[env,figs]=sceneConfig(id),duration=a.t1-a.t0;
  c.save();c.fillStyle=LUCAS.paper;c.fillRect(0,0,W,H);
  const u=Math.max(0,Math.min(1,t/duration));
  // Les changements de cadrage sont progressifs; aucune coupure dans le plan.
  const slow=(1-Math.cos(u*Math.PI))*.5;
  let focusX=960,focusY=590,zoom=1.025+slow*.045;
  const current=(a.falas||[]).find(f=>t>=f.t0&&t<f.t1);
  const active=current&&figs.find(f=>FIG[f[0]].role===current.quem);
  if(active){const f=seg(t,current.t0,current.t0+2.5)*(1-seg(t,current.t1-2,current.t1));zoom+=f*.075;focusX=lerp(960,active[1],f*.37);focusY=lerp(590,active[2]-260*active[3],f*.4);}
  const shot=cameraShot(id,u)||storyCamera(id,figs,u,duration);if(shot)[focusX,focusY,zoom]=shot;
  if(id==='P15'){
    const begin=cue(a,'tabuinha')-1,k=seg(t,begin,begin+2)*(1-seg(t,duration-3,duration-1));
    focusX=lerp(focusX,1360,k);focusY=lerp(focusY,690,k);zoom=lerp(zoom,2.2,k);
  }
  c.translate(W/2,H/2);c.scale(zoom,zoom);c.translate(-focusX,-focusY+(590-540));
  c.drawImage(getLayer(env),0,0);
  const arrival=id==='P25'?seg(t,cue(a,'encontraram')-2,cue(a,'encontraram')+2):0;
  if(arrival>0){
    c.save();c.globalAlpha=arrival;c.drawImage(getLayer('abrigo'),0,0);
    figure(c,'jose',1140,940,.95,'ouve',absolute,0,-1);
    figure(c,'maria',1480,940,1.05,'acolhe',absolute,0,-1);c.restore();
  }
  if(['P06','P13','P27','P33','P36'].includes(id)){
    const cycles={P06:5,P13:3,P27:8,P33:4,P36:3}[id];
    c.fillStyle=`rgba(225,188,113,${.035+.035*Math.sin(u*Math.PI*2*cycles)})`;c.fillRect(0,0,1920,1080);
  }
  poeticVignettes(c,id,u,absolute);
  if(['estrada','estradatarde','belem','deserto'].includes(env)){
    c.save();c.globalAlpha=.3;for(let i=0;i<4;i++)figure(c,'parente',250+i*400,720,.3,'caminha',absolute,0,i%2?1:-1);c.restore();
  }
  if(env==='campo'){
    if(id==='P22')blob(c,[[700,780],[750,795],[721,1010],[564,1005]],'#8c8e70',163);
    sheep(c,id==='P22'?600:400,1000,1.05,absolute);sheep(c,1560,984,.9,absolute);
    if(id==='P23')glow(c,1370,420,680,.2+.12*seg(t,0,4));
  }
  if(env==='ceu'){
    for(let i=0;i<7;i++){const x=250+i*240,y=480+Math.sin(i*1.8)*100;glow(c,x,y-150,180,.16);figure(c,'anjo',x,y,.37,'louva',absolute+i,0,i<3?1:-1);}
  }
  if(env==='altar')smoke(c,absolute);
  if(id==='P31'){poly(c,[[810,0],[900,0],[1170,1080],[1050,1080]],'rgba(58,62,60,.10)');}
  for(const [name,x,y,s,basePose] of figs){
    let pose=basePose,visible=1,dx=0,scale=s,detail={};
    if(['P07','P09'].includes(id)&&name==='gabriel')visible=id==='P07'?seg(t,2,6):1-seg(t,duration-5,duration-1);
    if(id==='P07'&&name==='maria'&&u>.55)pose='ouve';
    if(id==='P09'&&name==='maria')pose=current?.quem==='Maria'?'consente':'ouve';
    if(env==='abrigo'&&name==='maria')pose='acolhe';
    if(id==='P10')dx=(name==='maria'?1:-1)*95*seg(t,1.5,5.5);
    if(id==='P14'&&name==='zacarias')dx=-200*seg(u,.2,.6);
    if(id==='P15'&&name==='zacarias'){
      const at=cue(a,'tabuinha');pose=t<at-1?'ouve':'tabuinha';detail.escrita=seg(t,cue(a,'escreveu'),cue(a,'escreveu')+3);
    }
    if(id==='P13'&&name!=='maria')dx+=(name==='zacarias'?1:-1)*85*seg(u,.1,.35);
    if(id==='P19')scale=s*lerp(.55,1,seg(u,0,.6));
    if(id==='P20'&&name==='jose'&&u>.22&&u<.39)pose='ajeita';
    if(id==='P25'){dx=-250*arrival;if(arrival>.5)pose='ouve';}
    if(id==='P29'){
      if(name==='simeao'){dx=-220*seg(t,cue(a,'trouxeram')-2,cue(a,'trouxeram')+1.5);pose='acolhe';}
      if(name==='maria')pose='acolhe';
    }
    if(id==='P31'&&name==='maria'){pose='bebe';detail.nod=-.025;}
    if(id==='P33'&&name==='jesuspequeno')scale=s*lerp(.48,1,seg(u,.12,.85));
    if(['P35','P36'].includes(id)){dx=Math.sin(u*Math.PI*2+(name==='maria'?1:0))*33;detail.nod=Math.sin(t*.6)*.035;}
    if(id==='P40'&&name==='jesus')scale=s*lerp(1,1.07,seg(u,.35,.85));
    if(['caminha','trouxa','gravida'].includes(basePose)&&env.includes('estrada'))dx+=Math.sin(u*Math.PI)*65;
    const role=FIG[name].role;
    let activity=activeSpeech(a,t,role);
    if(id==='P37'&&name==='jesus'&&u>.16&&u<.7)activity=Math.max(0,Math.sin(absolute*13))*.27;
    let facing=x>1000?-1:1;
    if(['simeao','zacarias'].includes(name)&&basePose==='bebe')facing=-1;
    const placing=id==='P21'&&name==='maria'?seg(t,duration*.43,duration*.68):0;
    c.save();c.globalAlpha=visible;figure(c,name,x+dx,y,scale,pose,absolute,activity,facing,placing,detail);c.restore();
  }
  if(id==='P29'){
    const close=seg(t,cue(a,'trouxeram')-2,cue(a,'trouxeram')+1.5),pass=seg(t,cue(a,'tomou')-1.5,cue(a,'tomou')+2);
    baby(c,lerp(674,1080-220*close-27,pass),lerp(706,681,pass),.99,absolute);
  }
  if(arrival>0){c.save();c.globalAlpha=arrival;manger(c,1480,absolute);c.restore();}
  if(env==='abrigo'){
    // Au premier plan, les brins de paille encadrent le berceau sans cacher les visages.
    const xx=id==='P26'?1210:1100;
    manger(c,xx,absolute,false);
    if(id==='P21'){
      const placement=seg(t,duration*.43,duration*.68);
      baby(c,lerp(1026,xx,placement),lerp(690,843,placement),lerp(.99,1.12,placement),absolute);
    }else baby(c,xx,843,1.12,absolute);
    lamp(c,xx-390,935,.85,absolute);
  }
  if(id==='P19'){for(let i=0;i<4;i++)stroke(c,[[120+i*400,930],[200+i*410,840]],'rgba(130,102,68,.3)',2);}
  if(id==='P01'){
    // Plume et encrier, sans pseudo-texte ni interface.
    stroke(c,[[1160,672],[1030,791]],'#564c3a',3);blob(c,[[1160,673],[1183,598],[1220,558],[1192,642]],'#e8ddc0',73);
  }
  // Poussières lumineuses lentes, déterministes, limitées à la zone de lumière.
  const rr=rng(39);for(let i=0;i<25;i++){const x=350+rr()*1050,y=140+((rr()*600+absolute*2.5)%610);ellipse(c,x,y,.7+rr(),.7+rr(),'rgba(247,232,190,.30)');}
  c.restore();
  c.save();c.globalCompositeOperation='soft-light';c.globalAlpha=.11;c.drawImage(GRAO,Math.floor(absolute*5)%2,0);c.restore();
  // Bords de papier teintés; aucun fond noir, même pendant les transitions.
  const edge=c.createRadialGradient(960,530,420,960,540,1110);edge.addColorStop(0,'rgba(239,226,198,0)');edge.addColorStop(.75,'rgba(232,216,180,.025)');edge.addColorStop(1,'rgba(232,216,180,.5)');c.fillStyle=edge;c.fillRect(0,0,W,H);
}
function iniciar(tempo){
  TEMPO=tempo;W=1920;H=1080;const canvas=document.getElementById('c');canvas.width=W;canvas.height=H;ctx=canvas.getContext('2d');
  GRAO=fazerGrao();MANCHA=fazerMancha();OFFA=tela(W,H);OFFB=tela(W,H);LAYERS.clear();FILM=tempo.atos;
  if(!FILM?.length)throw new Error('Linha do tempo vazia');
  for(const a of FILM)if(!sceneConfig(a.id||a.cena))throw new Error('Prancha sem composição: '+(a.id||a.cena));
  quadro(0);
}
function quadro(t){
  const i=FILM.findIndex(a=>t>=a.t0&&t<a.t1),idx=i<0?FILM.length-1:i,a=FILM[idx];
  const local=Math.max(0,t-a.t0),blend=idx>0&&local<1.35;
  if(blend){
    const prev=FILM[idx-1],p=Math.max(0,prev.t1-prev.t0-.01);
    drawScene(OFFA.getContext('2d'),prev,p,prev.t1-.01);drawScene(OFFB.getContext('2d'),a,local,t);
    ctx.globalAlpha=1;ctx.drawImage(OFFA,0,0);ctx.globalAlpha=ease(local/1.35);ctx.drawImage(OFFB,0,0);ctx.globalAlpha=1;
  }else drawScene(ctx,a,local,t);
}
