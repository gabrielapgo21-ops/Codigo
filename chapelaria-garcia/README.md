# Chapelaria Garcia — Comercial Country Premium 🤠

Vídeo comercial **gerado 100% por código** para a botina country da Chapelaria Garcia.
Estética country moderna, cinematográfica, cores quentes/terrosas/douradas — com o
**produto real como protagonista absoluto**.

> O produto do vídeo (botina de couro caramelo, com costura "arabesco" no bico,
> elástico lateral Chelsea e emblema bordado) foi extraído diretamente do vídeo
> enviado pelo cliente.

## 1. Conceito criativo

**"Vista o espírito country."** Fim de tarde na fazenda: luz baixa e dourada, poeira
suspensa no ar, couro e madeira. A câmera trata cada botina como joia — entra, aproxima,
revela a costura artesanal e o emblema, e fecha com a assinatura da marca. Ousado no
ritmo (flashes quentes nas viradas), elegante na composição (moldura dourada, tipografia
serifada premium).

### Detalhes do produto que o vídeo valoriza
- **Couro caramelo legítimo** — realce contido de cor/contraste para o tom saltar real.
- **Costura "arabesco" branca no bico** — assinatura visual, destacada na cena de detalhe.
- **Emblema bordado lateral** — cena dedicada ao logo.
- **Acabamento Chelsea** (elástico lateral + costuras do solado) — textura e construção.

### Roteiro de cenas (14 s · 9:16)
| Tempo | Cena | Conteúdo | Movimento |
|------|------|----------|-----------|
| 0.0–2.5s | **Abertura** | produto sobe com brilho + marca discreta | reveal + glow |
| 2.5–5.6s | **Herói** | botina em destaque · "Tradição, atitude e presença" | push-in |
| 5.6–8.6s | **Detalhe** | costura/couro · "Couro legítimo · costura artesanal" | drift Ken Burns |
| 8.6–11.5s | **Emblema** | logo lateral · "Feito para quem vive o country" | aproximação |
| 11.5–14s | **Assinatura** | wordmark **CHAPELARIA GARCIA** + "Vista o espírito country" | logo anima |

## 2. Arquivos

```
chapelaria-garcia/
├── render.py        # renderizador do vídeo (Python/PIL + ffmpeg) — gera o MP4 final
├── index.html       # versão interativa no navegador (Canvas + MediaRecorder)
├── produto/         # produto real recortado do vídeo + fontes
│   ├── frame_hero.png      frame_detalhe.png   frame_par.png
│   ├── frame_logo.png      frame_lineup.png
│   └── Cinzel.ttf          Oswald.ttf
└── out/
    ├── chapelaria-garcia-comercial.mp4   # ◀ VÍDEO FINAL
    └── keyframes.png                     # prévia dos quadros-chave
```

## 3. Como executar / renderizar

### A) Render do vídeo final (recomendado — reproduz o MP4)
```bash
cd chapelaria-garcia
pip install pillow numpy imageio-ffmpeg     # ffmpeg vem embutido no imageio-ffmpeg
python render.py --test                     # confere os keyframes (out/keyframes.png)
python render.py                            # renderiza out/chapelaria-garcia-comercial.mp4
```
O render desenha 420 quadros (14 s × 30 fps) e codifica em H.264 1080×1920.
Ajuste fácil no topo de `render.py`: `DURATION`, `FPS`, e a lista `SCENES`
(troque assets, textos e o tempo de cada cena).

### B) Versão interativa no navegador
```bash
# a partir da pasta chapelaria-garcia, suba um servidor simples:
python -m http.server 8080
# abra http://localhost:8080  (servir por HTTP carrega a foto real automaticamente)
```
- Arraste **a foto do seu produto** (PNG com fundo transparente fica perfeito) para trocar.
- Botão **"Renderizar & Baixar Vídeo"** grava em `.mp4` (ou `.webm`) via MediaRecorder.
- Sem servidor (abrindo o arquivo direto), entra uma silhueta de botina como placeholder.

## 4. Trocar o produto

- **No `render.py`:** substitua os arquivos em `produto/` (ou aponte novos caminhos/recortes
  no dicionário `ASSETS`). Cada entrada é `("arquivo.png", (x0,y0,x1,y1))` — o recorte.
- **No `index.html`:** arraste a nova foto na área de upload.

## 5. Checagem das regras (Regra 1 e Regra 2)

**Regra 1 — nunca prejudicar o produto:**
- Encaixe **`contain`** sempre: a proporção original é preservada, o produto **nunca é
  esticado, espremido ou deformado**.
- O produto fica numa *safe box* central e **grande** na tela; os textos ficam só em
  zonas seguras (topo/base) — **nada de texto por cima do produto**.
- Os movimentos de câmera animam o **card inteiro** (escala/posição), então a botina
  **nunca é cortada** pelo zoom.
- Efeitos (poeira, vinheta, grão, flashes) ficam no **fundo/bordas** e em baixa opacidade —
  **não cobrem nem escurecem** o produto.

**Regra 2 — valorizar ao máximo o produto:**
- Realce **contido** de contraste (1.08), cor/saturação (1.12) e brilho (1.06) +
  *Unsharp Mask* para nitidez — o couro caramelo fica vivo **sem ficar artificial**.
- **Spotlight no próprio produto** (escurece só as bordas da foto) faz a botina saltar e
  empurra a poluição do fundo de loja para trás, sem tocar no produto.
- **Sombra suave**, **luz de recorte (rim)** e **brilho de varredura** realçam volume,
  profundidade e a textura do couro/costura.
- Moldura dourada + composição cinematográfica dão presença premium ao produto.

> Observação: o comercial é entregue **sem trilha** para evitar áudio de origem
> desconhecida. Para publicar, basta adicionar uma música country licenciada por cima.
