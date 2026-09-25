// De dónde salen el nombre del Worker y los identificadores de la base y del
// almacén de imágenes.
//
// Dos caminos, porque hay dos formas de publicar:
//
//   - Desde tu máquina: el archivo despliegue.json, que no se sube al
//     repositorio (ver DESPLIEGUE.md).
//   - Desde Cloudflare, cuando construye solo al recibir un push: ahí no hay
//     despliegue.json, así que los valores llegan como variables de entorno
//     que se escriben una vez en el panel (ver DESPLIEGUE-AUTOMATICO.md).
//
// Ninguno de estos datos es secreto: son nombres y un identificador de
// recurso. Para usarlos hace falta la cuenta. El único secreto de verdad,
// SESSION_SECRET, no pasa por aquí: se guarda en Cloudflare como secreto.

import {readFileSync, existsSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

export const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** wrangler, llamado directamente: en el contenedor de Cloudflare no hay corepack. */
export const wrangler = resolve(raiz, 'node_modules/wrangler/bin/wrangler.js');

export const aborta = (mensaje) => {
  console.error('\n' + mensaje + '\n');
  process.exit(1);
};

const desdeArchivo = () => {
  const ruta = resolve(raiz, 'despliegue.json');
  if (!existsSync(ruta)) return {};
  try {
    return JSON.parse(readFileSync(ruta, 'utf8'));
  } catch {
    aborta('despliegue.json no es un JSON válido.');
  }
};

/** Los ajustes de publicación, ya validados. */
export function ajustes() {
  const archivo = desdeArchivo();
  const env = process.env;

  const worker = env.ZANJA_WORKER || archivo.worker;
  const d1 = {
    nombre: env.ZANJA_D1_NOMBRE || archivo.d1?.nombre,
    id: env.ZANJA_D1_ID || archivo.d1?.id,
  };
  const r2 = {nombre: env.ZANJA_R2_NOMBRE || archivo.r2?.nombre};

  const falta = [];
  if (!worker) falta.push('el nombre del Worker (worker / ZANJA_WORKER)');
  if (!d1.nombre) falta.push('el nombre de la base (d1.nombre / ZANJA_D1_NOMBRE)');
  if (!d1.id) falta.push('el identificador de la base (d1.id / ZANJA_D1_ID)');
  if (!r2.nombre) falta.push('el nombre del almacén (r2.nombre / ZANJA_R2_NOMBRE)');

  if (falta.length) {
    aborta(
      'Faltan datos para publicar:\n  · ' + falta.join('\n  · ') + '\n\n' +
      'Se pueden poner de dos maneras:\n' +
      '  · En despliegue.json (copia despliegue.ejemplo.json). Ver DESPLIEGUE.md\n' +
      '  · Como variables de entorno, que es lo que usa Cloudflare cuando\n' +
      '    construye al recibir un push. Ver DESPLIEGUE-AUTOMATICO.md'
    );
  }
  if (d1.id.startsWith('00000000-')) {
    aborta('El identificador de la base sigue siendo el de relleno del ejemplo.');
  }

  return {worker, d1, r2};
}
