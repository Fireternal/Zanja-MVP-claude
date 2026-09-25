// Compilación de la vitrina: la misma interfaz, sin servidor.
//
// La app de verdad se compila con vinext (React Server Components sobre el
// runtime de Cloudflare). Aquí no hace falta nada de eso: toda la interfaz
// vive en app/page.tsx, que es un componente de cliente, así que se compila
// como una página suelta de Vite y se puede publicar en cualquier sitio.

import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, '..');

export default defineConfig({
  root: aqui,
  base: '',
  plugins: [react()],
  resolve: {alias: {'@': raiz}},
  css: {postcss: raiz},
  // Nombres fijos, sin huella: la vitrina se republica siempre en la misma
  // dirección y así cada versión sustituye a la anterior en vez de dejar
  // archivos sueltos detrás.
  build: {
    outDir: resolve(raiz, 'dist-vitrina'),
    emptyOutDir: true,
    rollupOptions: {output: {entryFileNames: 'zanja.js', chunkFileNames: 'zanja-[name].js', assetFileNames: 'zanja.[ext]'}},
  },
});
