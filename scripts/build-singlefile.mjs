// Inlines the Vite build (JS + CSS) into a single self-contained dist/index.html.
//
// Assets are embedded as base64 data URLs so the result is ONE file with no
// external references — robust for static hosts (e.g. Hostinger) where an
// assets/ folder may be uploaded incorrectly, causing 404s / a blank page.
//
// Run automatically after `npm run build` (see package.json "postbuild").

import {readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const dist = 'dist';
const indexPath = join(dist, 'index.html');
let html = readFileSync(indexPath, 'utf8');

const jsMatch = html.match(
  /<script[^>]*src="\.?\/?assets\/([^"]+\.js)"[^>]*><\/script>/,
);
const cssMatch = html.match(
  /<link[^>]*href="\.?\/?assets\/([^"]+\.css)"[^>]*>/,
);

if (!jsMatch || !cssMatch) {
  console.error('[singlefile] Could not find built JS/CSS tags in index.html');
  process.exit(1);
}

const jsB64 = readFileSync(join(dist, 'assets', jsMatch[1])).toString('base64');
const cssB64 = readFileSync(join(dist, 'assets', cssMatch[1])).toString('base64');

html = html
  .replace(
    cssMatch[0],
    `<link rel="stylesheet" href="data:text/css;base64,${cssB64}">`,
  )
  .replace(
    jsMatch[0],
    `<script type="module" src="data:text/javascript;base64,${jsB64}"></script>`,
  );

writeFileSync(indexPath, html);
console.log(
  `[singlefile] Wrote self-contained ${indexPath} (${(html.length / 1024).toFixed(0)} KB). ` +
    `Upload this single file to public_html.`,
);
