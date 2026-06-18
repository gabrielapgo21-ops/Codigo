# Publicar o Códigø Animate no Hostinger

O site é um app estático (React + Vite). O servidor só precisa dos arquivos
**já compilados** — não roda `npm` no Hostinger.

## Por que aparece "403 Forbidden"

O erro 403 acontece quando a pasta `public_html` está vazia, ou os arquivos
foram enviados para a pasta errada, e o servidor não encontra um `index.html`
para servir. A solução é colocar o conteúdo **compilado** direto em
`public_html`.

## Passo a passo

1. Gere o build (na sua máquina ou em CI):

   ```bash
   npm install
   npm run build
   ```

   Isso cria a pasta `dist/` com:

   ```
   dist/index.html
   dist/.htaccess
   dist/assets/...
   ```

2. No **hPanel do Hostinger → Gerenciador de Arquivos**, abra `public_html`.
3. Apague o conteúdo antigo de `public_html` (se houver).
4. Envie **o conteúdo de dentro de `dist/`** para `public_html` — ou seja,
   o `index.html`, o `.htaccess` e a pasta `assets/` devem ficar na **raiz**
   de `public_html`, e **não** dentro de uma subpasta `dist/`.
5. Acesse o site. O `index.html` será servido e o app carrega.

> Importante: **não** envie o `index.html` da raiz do repositório (ele aponta
> para `/src/main.tsx`, que só funciona no modo de desenvolvimento). Envie
> sempre o `index.html` gerado dentro de `dist/`.

O arquivo `.htaccess` (em `public/.htaccess`, copiado para `dist/` no build)
define o `index.html` como página inicial, corrige os tipos MIME dos módulos
JavaScript e faz o fallback de SPA — o que evita o 403 e erros de rota.
