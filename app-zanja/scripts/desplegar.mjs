// Despliegue a Cloudflare.
//
// La compilación genera dist/server/wrangler.json con los nombres de ejemplo
// del starter y un identificador de base de datos de relleno. Este script lo
// copia, le pone tus recursos y llama a wrangler. Así no hay que tocar a mano
// un archivo que se regenera en cada compilación.
//
// Los valores salen de despliegue.json, que no se sube al repositorio.

import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ajustes = resolve(raiz, 'despliegue.json');
const generado = resolve(raiz, 'dist/server/wrangler.json');
const destino = resolve(raiz, 'dist/server/wrangler.deploy.json');

const aborta = (mensaje) => {
  console.error('\n' + mensaje + '\n');
  process.exit(1);
};

if (!existsSync(ajustes)) {
  aborta(
    'Falta despliegue.json. Copia despliegue.ejemplo.json, renómbralo y pon\n' +
    'dentro el nombre del Worker y el identificador que te dio\n' +
    '`wrangler d1 create`. Los pasos completos están en DESPLIEGUE.md.'
  );
}
if (!existsSync(generado)) {
  aborta('Falta dist/server/wrangler.json. Compila antes: corepack pnpm build');
}

const {worker, d1, r2} = JSON.parse(readFileSync(ajustes, 'utf8'));
if (!worker) aborta('despliegue.json: falta "worker", el nombre de la aplicación.');
if (!d1?.nombre || !d1?.id) aborta('despliegue.json: faltan "d1.nombre" o "d1.id".');
if (!r2?.nombre) aborta('despliegue.json: falta "r2.nombre".');
if (d1.id.startsWith('00000000-')) aborta('despliegue.json: "d1.id" sigue siendo el de relleno.');

const config = JSON.parse(readFileSync(generado, 'utf8'));
config.name = worker;
config.topLevelName = worker;
config.d1_databases = [{binding: 'DB', database_name: d1.nombre, database_id: d1.id}];
config.r2_buckets = [{binding: 'BUCKET', bucket_name: r2.nombre}];
delete config.dev;
writeFileSync(destino, JSON.stringify(config, null, 2));

console.log(`Worker: ${worker}\nBase de datos: ${d1.nombre}\nImágenes: ${r2.nombre}\n`);

const argumentos = ['wrangler', 'deploy', '--config', destino, ...process.argv.slice(2)];
const salida = spawnSync('corepack', ['pnpm', 'exec', ...argumentos], {cwd: raiz, stdio: 'inherit'});
process.exit(salida.status ?? 1);
