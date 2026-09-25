// Mete las imágenes dentro del propio paquete.
//
// La app las pide por ruta absoluta (/arena-menu.webp), que es lo correcto
// cuando se sirve desde su propio dominio. La vitrina se publica colgando de
// una dirección ajena, así que esas rutas no llevarían a ninguna parte:
// aquí se sustituyen por la imagen misma, en base64. Son unos 200 KB en
// total, y a cambio la vitrina es un paquete que funciona en cualquier sitio.

import {readdirSync, readFileSync, writeFileSync, statSync} from 'node:fs';
import {resolve, dirname, extname} from 'node:path';
import {fileURLToPath} from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publico = resolve(raiz, 'public');
const salida = resolve(raiz, 'dist-vitrina');

const tipos = {'.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg'};

const imagenes = readdirSync(publico)
  .filter((f) => extname(f) in tipos)
  .map((f) => [`/${f}`, `data:${tipos[extname(f)]};base64,${readFileSync(resolve(publico, f)).toString('base64')}`]);

let cambios = 0, bytes = 0;
const archivos = [];
const recorre = (dir) => {
  for (const entrada of readdirSync(dir)) {
    const ruta = resolve(dir, entrada);
    if (statSync(ruta).isDirectory()) recorre(ruta);
    else if (/\.(js|css|html)$/.test(entrada)) archivos.push(ruta);
  }
};
recorre(salida);

for (const ruta of archivos) {
  let texto = readFileSync(ruta, 'utf8');
  const antes = texto;
  for (const [nombre, datos] of imagenes) {
    if (!texto.includes(nombre)) continue;
    texto = texto.split(nombre).join(datos);
    cambios++;
  }
  if (texto !== antes) {
    writeFileSync(ruta, texto);
    bytes += texto.length - antes.length;
  }
}

// El servidor que aloja la vitrina la sirve colgando de una ruta, así que las
// rutas del propio paquete van relativas y sin "./" delante.
const indice = resolve(salida, 'index.html');
writeFileSync(indice, readFileSync(indice, 'utf8').replaceAll('"./assets/', '"assets/'));

console.log(`${cambios} referencias empotradas (+${Math.round(bytes / 1024)} KB).`);
