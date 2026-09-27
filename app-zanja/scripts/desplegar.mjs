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
// Sin esto, cada despliegue borra las variables y los secretos puestos a
// mano en el panel: wrangler considera que su configuración manda y elimina
// lo que no aparece en ella. El SESSION_SECRET se ponía desde el panel y se
// perdía en el siguiente build, así que la app volvía a dar 503.
config.keep_vars = true;
config.d1_databases = [{binding: 'DB', database_name: d1.nombre, database_id: d1.id}];
// Sin almacén no se declara la atadura: wrangler falla si se le nombra un
// bucket que no existe en la cuenta.
if (r2.nombre) config.r2_buckets = [{binding: 'BUCKET', bucket_name: r2.nombre}];
else delete config.r2_buckets;
delete config.dev;
writeFileSync(destino, JSON.stringify(config, null, 2));

console.log(`Worker: ${worker}\nBase de datos: ${d1.nombre}\nImágenes: ${r2.nombre || 'sin almacén (no se podrán adjuntar pruebas)'}\n`);

const argumentos = [wrangler, 'deploy', '--config', destino, ...process.argv.slice(2)];
const salida = spawnSync(process.execPath, argumentos, {cwd: raiz, stdio: 'inherit'});
if (salida.status) process.exit(salida.status);

// El secreto de las sesiones lo pone el despliegue, no el panel.
//
// Un secreto añadido a mano en Workers & Pages no llega a la versión que
// publica wrangler: el Worker acababa viendo sólo DB y la app devolvía 503
// en todo. Así que se pasa como variable de compilación —encriptada, que
// para eso está el botón— y aquí se instala en el Worker después de subirlo.
const secreto = process.env.SESSION_SECRET;
if (secreto) {
  if (secreto.length < 32) aborta('SESSION_SECRET tiene menos de 32 caracteres.');
  const puesto = spawnSync(
    process.execPath,
    [wrangler, 'secret', 'put', 'SESSION_SECRET', '--name', worker],
    {cwd: raiz, input: secreto, stdio: ['pipe', 'inherit', 'inherit']},
  );
  if (puesto.status) process.exit(puesto.status);
  console.log('\nSESSION_SECRET instalado en el Worker.');
} else {
  console.log('\nAviso: sin SESSION_SECRET en las variables de compilación, entrar dará error.');
}
process.exit(0);
