#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CHAPELARIA GARCIA — Renderizador de comercial country premium (9:16).

Gera o vídeo final por código: fundo cinematográfico de fim de tarde,
poeira volumétrica, luz quente, grade de cor, tipografia western e o
PRODUTO REAL (botinas de couro caramelo, extraídas do vídeo enviado)
como protagonista absoluto.

Regras:
  1) O produto nunca é distorcido/escondido/cortado mal: encaixe "contain",
     sempre dentro de um card seguro, com a proporção original preservada.
  2) O produto é valorizado: realce sutil de cor/contraste/nitidez, sombra
     suave, luz de recorte e brilho — sem artificializar a cor real.

Uso:
  python render.py --test     # gera keyframes p/ conferência (PNG)
  python render.py            # renderiza o vídeo completo (out/...mp4)
"""
import os, sys, math, subprocess, shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__))
PROD = os.path.join(HERE, "produto")
OUT  = os.path.join(HERE, "out")
FRAMES = os.path.join(OUT, "frames")

W, H = 1080, 1920
FPS  = 30
DURATION = 14.0
TEST = "--test" in sys.argv

# ----------------------------------------------------------------------------
# Fontes (Cinzel = serifada premium / Oswald = condensada moderna)
# ----------------------------------------------------------------------------
def font(path, size, weight=None):
    f = ImageFont.truetype(os.path.join(PROD, path), size)
    if weight is not None:
        try: f.set_variation_by_axes([weight])
        except Exception: pass
    return f

F_WORD_S  = lambda s: font("Cinzel.ttf", s, 700)
F_WORD_B  = lambda s: font("Cinzel.ttf", s, 900)
F_CAP     = lambda s: font("Oswald.ttf", s, 600)
F_KICK    = lambda s: font("Oswald.ttf", s, 500)

# ----------------------------------------------------------------------------
# Easing
# ----------------------------------------------------------------------------
def clamp(v,a,b): return max(a,min(b,v))
def lerp(a,b,t): return a+(b-a)*t
def smooth(t): t=clamp(t,0,1); return t*t*(3-2*t)
def ease_out(t): return 1-(1-clamp(t,0,1))**3
def ease_inout(t):
    t=clamp(t,0,1)
    return 4*t*t*t if t<.5 else 1-(-2*t+2)**3/2
def seg(t,a,b): return clamp((t-a)/(b-a),0,1)
def win(t,a,b,fin=.4,fout=.4):
    if t<a or t>b: return 0.0
    u=(t-a)/(b-a)
    return min(smooth(clamp(u/fin,0,1)), smooth(clamp((1-u)/fout,0,1)))

# ----------------------------------------------------------------------------
# Fundo cinematográfico (numpy) — calculado uma vez
# ----------------------------------------------------------------------------
def build_background_base():
    y = np.linspace(0,1,H)[:,None]
    # rampa de cor: terroso topo -> dourado embaixo (fim de tarde)
    stops = [(0.00,(26,17,9)),(0.45,(58,35,15)),(0.72,(122,63,23)),
             (0.86,(185,116,42)),(1.00,(231,162,59))]
    r=np.zeros((H,1)); g=np.zeros((H,1)); b=np.zeros((H,1))
    for i in range(len(stops)-1):
        p0,c0=stops[i]; p1,c1=stops[i+1]
        m=(y>=p0)&(y<=p1)
        f=(y-p0)/(p1-p0+1e-9)
        r=np.where(m, c0[0]+(c1[0]-c0[0])*f, r)
        g=np.where(m, c0[1]+(c1[1]-c0[1])*f, g)
        b=np.where(m, c0[2]+(c1[2]-c0[2])*f, b)
    base=np.concatenate([np.repeat(r,W,1)[...,None],
                         np.repeat(g,W,1)[...,None],
                         np.repeat(b,W,1)[...,None]],axis=2)
    # sol baixo (glow radial)
    xx,yy=np.meshgrid(np.arange(W),np.arange(H))
    cx,cy=W*0.5,H*0.9
    d=np.sqrt((xx-cx)**2+(yy-cy)**2)/(W*1.05)
    glow=np.clip(1-d,0,1)**1.8
    base[...,0]+=glow*150; base[...,1]+=glow*95; base[...,2]+=glow*40
    # raio de luz diagonal sutil
    beam=np.clip(1-np.abs((xx-yy*0.45-W*0.18))/(W*0.5),0,1)**2
    base[...,0]+=beam*26; base[...,1]+=beam*20; base[...,2]+=beam*9
    # textura de madeira (faixas verticais sutis)
    stripe=(np.sin(xx/ W*26*math.pi)*0.5+0.5)*6
    base[...,0]-=stripe; base[...,1]-=stripe*0.7; base[...,2]-=stripe*0.4
    return np.clip(base,0,255)

BG_BASE = build_background_base()

# vinheta (multiplicativa) e máscara de grão pré-calculadas
def build_vignette():
    xx,yy=np.meshgrid(np.linspace(-1,1,W),np.linspace(-1,1,H))
    r=np.sqrt((xx*0.95)**2+((yy-0.05)*1.0)**2)
    v=np.clip(1-(r-0.55)*0.95,0.0,1.0)
    v=smooth_np(v)
    return v[...,None]
def smooth_np(t):
    t=np.clip(t,0,1); return t*t*(3-2*t)
VIGNETTE=build_vignette()

# ----------------------------------------------------------------------------
# Poeira
# ----------------------------------------------------------------------------
rng=np.random.default_rng(20240618)
DUST=[{"x":rng.random(),"y":rng.random(),"r":rng.random()*2.6+0.7,
       "sp":rng.random()*0.4+0.08,"ph":rng.random()*6.28,
       "depth":rng.random()} for _ in range(95)]

def draw_dust(img,t,front):
    d=ImageDraw.Draw(img,"RGBA")
    for p in DUST:
        if (p["depth"]<0.45)==front:  # separa camadas
            continue
        y=((p["y"]-t*p["sp"]*0.04)%1)
        x=(p["x"]+math.sin(t*0.3+p["ph"])*0.012)%1
        tw=0.4+0.6*abs(math.sin(t*1.3+p["ph"]))
        a=int((30 if front else 60)*tw)
        r=p["r"]*(0.8 if front else 1.15)
        px,py=x*W,y*H
        d.ellipse([px-r,py-r,px+r,py+r],fill=(255,226,170,a))

# ----------------------------------------------------------------------------
# Produto — recortes (source ~474x850) e realce
# ----------------------------------------------------------------------------
ASSETS = {
    "hero":    ("frame_hero.png",    (95,150,398,602)),
    "detalhe": ("frame_detalhe.png", (44,120,392,648)),
    "par":     ("frame_par.png",     (60,118,430,566)),
    "logo":    ("frame_logo.png",    (150,70,474,360)),
    "lineup":  ("frame_lineup.png",  (55,120,425,548)),
}
_cache={}
def get_product(name):
    if name in _cache: return _cache[name]
    fn,box=ASSETS[name]
    im=Image.open(os.path.join(PROD,fn)).convert("RGB").crop(box)
    # Regra 2: realce contido (não muda a cor real) + nitidez
    im=ImageEnhance.Contrast(im).enhance(1.08)
    im=ImageEnhance.Color(im).enhance(1.12)
    im=ImageEnhance.Brightness(im).enhance(1.07)
    im=im.filter(ImageFilter.UnsharpMask(radius=2.2,percent=85,threshold=2))
    _cache[name]=im
    return im

def photo_spotlight(im):
    """Escurece só as bordas da FOTO (não o produto, que está ao centro):
    faz o produto saltar e empurra a poluição do fundo de loja para trás."""
    w,h=im.size
    xx,yy=np.meshgrid(np.linspace(-1,1,w),np.linspace(-1,1,h))
    r=np.sqrt((xx*0.92)**2+(yy*0.92)**2)
    v=np.clip(1-(r-0.42)*0.95,0.30,1.0)
    v=smooth_np(v)
    arr=np.asarray(im).astype(float)*v[...,None]
    return Image.fromarray(np.clip(arr,0,255).astype("uint8"))

def rounded_mask(size,rad):
    m=Image.new("L",size,0)
    ImageDraw.Draw(m).rounded_rectangle([0,0,size[0]-1,size[1]-1],rad,fill=255)
    return m

# Card base do produto (RGBA) — produto contido, moldura premium
CARD_W, CARD_H = int(W*0.84), int(H*0.54)
def build_card(name):
    cw,ch=CARD_W,CARD_H
    card=Image.new("RGBA",(cw,ch),(0,0,0,0))
    # painel escuro com leve gradiente quente
    panel=Image.new("RGB",(cw,ch),(20,14,10))
    pg=np.asarray(panel).astype(float)
    yy=np.linspace(0,1,ch)[:,None]
    pg[...,0]+=yy*14; pg[...,1]+=yy*8
    panel=Image.fromarray(np.clip(pg,0,255).astype("uint8"))
    rad=40
    mask=rounded_mask((cw,ch),rad)
    card.paste(panel,(0,0),mask)
    # produto contido (preserva proporção)
    pad=int(cw*0.06)
    iw,ih=cw-2*pad, ch-2*pad
    p=get_product(name)
    s=min(iw/p.width, ih/p.height)         # contain: nada cortado
    nw,nh=int(p.width*s),int(p.height*s)
    p2=photo_spotlight(p.resize((nw,nh),Image.LANCZOS))
    px,py=(cw-nw)//2,(ch-nh)//2
    # sombra de contato do produto dentro do card
    sh=Image.new("RGBA",(cw,ch),(0,0,0,0))
    ImageDraw.Draw(sh).ellipse([px+nw*0.1,py+nh-26,px+nw*0.9,py+nh+30],fill=(0,0,0,120))
    sh=sh.filter(ImageFilter.GaussianBlur(14))
    card=Image.alpha_composite(card,sh)
    card.paste(p2,(px,py))
    # moldura dourada fina + brilho interno nas bordas
    dr=ImageDraw.Draw(card)
    dr.rounded_rectangle([2,2,cw-3,ch-3],rad,outline=(227,168,87,210),width=3)
    dr.rounded_rectangle([8,8,cw-9,ch-9],rad-6,outline=(255,230,180,40),width=2)
    # recorta tudo na máscara arredondada
    out=Image.new("RGBA",(cw,ch),(0,0,0,0))
    out.paste(card,(0,0),mask)
    return out

# ----------------------------------------------------------------------------
# Texto com espaçamento de letras
# ----------------------------------------------------------------------------
def text_spaced(draw,cx,y,text,fnt,fill,spacing,shadow=True,anchor_mid=True):
    widths=[draw.textlength(ch,font=fnt) for ch in text]
    total=sum(widths)+spacing*(len(text)-1)
    x=cx-total/2 if anchor_mid else cx
    for ch,w in zip(text,widths):
        if shadow:
            draw.text((x+2,y+3),ch,font=fnt,fill=(0,0,0,160))
        draw.text((x,y),ch,font=fnt,fill=fill)
        x+=w+spacing

def caption(img,text,cy,alpha,size=44):
    if alpha<=0: return
    layer=Image.new("RGBA",(W,H),(0,0,0,0))
    d=ImageDraw.Draw(layer)
    f=F_CAP(size)
    asc,desc=f.getmetrics()
    text_spaced(d,W//2,cy-(asc+desc)//2,text.upper(),f,
                (243,231,211,255),size*0.11)
    if alpha<1:
        a=layer.split()[3].point(lambda v:int(v*alpha)); layer.putalpha(a)
    img.alpha_composite(layer)

def wordmark(img,cy,scale,alpha):
    if alpha<=0: return
    layer=Image.new("RGBA",(W,H),(0,0,0,0))
    d=ImageDraw.Draw(layer)
    s1=int(76*scale); s2=int(120*scale)
    f1=F_WORD_S(s1); f2=F_WORD_B(s2)
    a1,d1=f1.getmetrics(); a2,d2=f2.getmetrics()
    text_spaced(d,W//2,cy-70-(a1+d1)//2,"CHAPELARIA",f1,(255,247,234,255),s1*0.10)
    text_spaced(d,W//2,cy+30-(a2+d2)//2,"GARCIA",f2,(231,168,87,255),s2*0.06)
    # florão / régua dourada
    yline=cy+118
    d.line([W//2-160,yline,W//2-34,yline],fill=(227,168,87,255),width=4)
    d.line([W//2+34,yline,W//2+160,yline],fill=(227,168,87,255),width=4)
    d.ellipse([W//2-9,yline-9,W//2+9,yline+9],fill=(227,168,87,255))
    if alpha<1:
        a=layer.split()[3].point(lambda v:int(v*alpha)); layer.putalpha(a)
    img.alpha_composite(layer)

# ----------------------------------------------------------------------------
# Cenas: (t0,t1, asset, caption, scale0,scale1, dx, dy0,dy1)
# ----------------------------------------------------------------------------
D=DURATION
SCENES=[
    (0.0,      D*0.18, "hero",    None,                              0.90,1.00, 0,  60,  0),
    (D*0.18,   D*0.40, "hero",    "Tradição, atitude e presença",    1.00,1.07, 0,   0,  0),
    (D*0.40,   D*0.62, "detalhe", "Couro legítimo · costura artesanal",1.07,1.02, 18, 0,  0),
    (D*0.62,   D*0.82, "logo",    "Feito para quem vive o country",  1.02,1.05, 0,   0,  0),
    (D*0.82,   D,      "par",     None,                              1.05,0.62, 0,   0, -int(H*0.16)),
]
# pré-constrói cards usados
CARDS={n:build_card(n) for n in {s[2] for s in SCENES}}

BASE_CY = int(H*0.205)+CARD_H//2  # centro vertical padrão do card

def render_frame(t):
    # fundo
    pulse=0.86+0.14*math.sin(t*1.1)
    arr=BG_BASE.copy()
    # leve pulso de luz no terço inferior
    yy=np.linspace(0,1,H)[:,None,None]
    arr[...,0]+= (yy[:,:,0]* (pulse-0.86)*120)
    img=Image.fromarray(np.clip(arr,0,255).astype("uint8")).convert("RGBA")

    draw_dust(img,t,front=False)

    # cena atual
    sc=SCENES[-1]
    for s in SCENES:
        if s[0]<=t<s[1]: sc=s; break
    t0,t1,asset,cap,sc0,sc1,dx,dy0,dy1=sc
    u=ease_inout(seg(t,t0,t1))
    scale=lerp(sc0,sc1,u)
    cy=BASE_CY+int(lerp(dy0,dy1,u))
    cx=W//2+int(lerp(0,dx,u)) - dx//2

    # halo / luz de recorte atrás do produto
    halo=Image.new("RGBA",(W,H),(0,0,0,0))
    hg=ImageDraw.Draw(halo)
    hp=0.5+0.5*math.sin(t*1.4)
    R=int(CARD_W*0.62*scale)
    hg.ellipse([cx-R,cy-R,cx+R,cy+R],fill=(255,200,120,int(46+18*hp)))
    halo=halo.filter(ImageFilter.GaussianBlur(90))
    img=Image.alpha_composite(img,halo)

    # card do produto (sombra + escala)
    card=CARDS[asset]
    cw,ch=int(card.width*scale),int(card.height*scale)
    cardr=card.resize((cw,ch),Image.LANCZOS)
    # sombra projetada
    sh=Image.new("RGBA",(W,H),(0,0,0,0))
    shd=ImageDraw.Draw(sh)
    shd.rounded_rectangle([cx-cw//2,cy-ch//2+34,cx+cw//2,cy+ch//2+44],40,fill=(0,0,0,150))
    sh=sh.filter(ImageFilter.GaussianBlur(40))
    img=Image.alpha_composite(img,sh)
    img.alpha_composite(cardr,(cx-cw//2,cy-ch//2))

    # brilho de varredura (specular) durante o herói/detalhe
    sweep=win(t,D*0.20,D*0.60,.5,.5)
    if sweep>0:
        lay=Image.new("RGBA",(W,H),(0,0,0,0))
        ld=ImageDraw.Draw(lay)
        uu=seg(t,D*0.20,D*0.60)
        lxc=int(lerp(cx-cw//2-60,cx+cw//2+60,uu))
        for i in range(-90,91,3):
            a=int(60*sweep*(1-abs(i)/90))
            ld.line([lxc+i,cy-ch//2,lxc+i,cy+ch//2],fill=(255,240,210,a))
        img=Image.alpha_composite(img,lay)

    draw_dust(img,t,front=True)

    # textos
    a_intro=win(t,0.2,D*0.18,.4,.35)
    if a_intro>0: caption(img,"CHAPELARIA GARCIA",int(H*0.115),a_intro*0.92,34)
    if cap:
        a=win(t,t0+0.15,t1-0.1,.32,.3)
        caption(img,cap,int(H*0.865),a,42)
    # outro: wordmark + tagline
    a_logo=win(t,D*0.82,D,.30,.10)
    if a_logo>0:
        ls=lerp(0.84,1.0,ease_out(seg(t,D*0.82,D*0.92)))
        wordmark(img,int(H*0.74),ls,a_logo)
        a_tag=win(t,D*0.88,D,.4,.12)
        caption(img,"Vista o espírito country",int(H*0.86),a_tag,40)

    # flashes de transição entre cenas
    flash=0.0
    for s in SCENES[1:]:
        flash=max(flash,win(t,s[0]-0.18,s[0]+0.18,.5,.5))
    if flash>0:
        fl=Image.new("RGBA",(W,H),(255,228,172,int(60*flash)))
        img=Image.alpha_composite(img,fl)

    # ---- grade final: vinheta (multiplica) + grão ----
    rgb=np.asarray(img.convert("RGB")).astype(float)
    rgb=rgb*(0.42+0.58*VIGNETTE)            # escurece só bordas
    grain=(rng.random((H,W,1))-0.5)*16
    rgb=np.clip(rgb+grain,0,255).astype("uint8")
    return Image.fromarray(rgb)

# ----------------------------------------------------------------------------
def main():
    if TEST:
        os.makedirs(OUT,exist_ok=True)
        times=[0.6, D*0.30, D*0.50, D*0.72, D*0.95]
        thumbs=[]
        for i,t in enumerate(times):
            fr=render_frame(t).resize((W//3,H//3),Image.LANCZOS)
            thumbs.append(fr)
        sheet=Image.new("RGB",(W//3*len(thumbs)+10*(len(thumbs)-1),H//3),(0,0,0))
        x=0
        for th in thumbs:
            sheet.paste(th,(x,0)); x+=W//3+10
        sheet.save(os.path.join(OUT,"keyframes.png"))
        print("keyframes ->",os.path.join(OUT,"keyframes.png"))
        return

    if os.path.exists(FRAMES): shutil.rmtree(FRAMES)
    os.makedirs(FRAMES,exist_ok=True)
    total=int(DURATION*FPS)
    for i in range(total):
        t=i/FPS
        render_frame(t).save(os.path.join(FRAMES,f"f_{i:04d}.png"))
        if i%30==0: print(f"frame {i}/{total}")
    import imageio_ffmpeg
    ff=imageio_ffmpeg.get_ffmpeg_exe()
    outfile=os.path.join(OUT,"chapelaria-garcia-comercial.mp4")
    cmd=[ff,"-y","-framerate",str(FPS),"-i",os.path.join(FRAMES,"f_%04d.png"),
         "-c:v","libx264","-pix_fmt","yuv420p","-crf","18",
         "-preset","medium","-movflags","+faststart",outfile]
    print("encoding...")
    subprocess.run(cmd,check=True)
    print("DONE ->",outfile)

if __name__=="__main__":
    main()
