// Despliegue a Cloudflare.
//
// La compilación genera dist/server/wrangler.json con los nombres de ejemplo
// del starter y un identificador de base de datos de relleno. Este script lo
// copia, le pone tus recursos y llama a wrangler. Así no hay que tocar a mano
// un archivo que se regenera en cada compilación.
//
// Los valores salen de despliegue.json o de variables de entorno: ver
// scripts/ajustes.mjs.

import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {raiz, aborta, ajustes, wrangler} from './ajustes.mjs';

const generado = resolve(raiz, 'dist/server/wrangler.json');
const destino = resolve(raiz, 'dist/server/wrangler.deploy.json');

if (!existsSync(generado)) {
  aborta('Falta dist/server/wrangler.json. Compila antes: corepack pnpm build');
}

const {worker, d1, r2} = ajustes();

const config = JSON.parse(readFileSync(generado, 'utf8'));
config.name = worker;
config.topLevelName = worker;
config.d1_databases = [{binding: 'DB', database_name: d1.nombre, database_id: d1.id}];
config.r2_buckets = [{binding: 'BUCKET', bucket_name: r2.nombre}];
delete config.dev;
writeFileSync(destino, JSON.stringify(config, null, 2));

console.log(`Worker: ${worker}\nBase de datos: ${d1.nombre}\nImágenes: ${r2.nombre}\n`);

const argumentos = [wrangler, 'deploy', '--config', destino, ...process.argv.slice(2)];
const salida = spawnSync(process.execPath, argumentos, {cwd: raiz, stdio: 'inherit'});
process.exit(salida.status ?? 1);
