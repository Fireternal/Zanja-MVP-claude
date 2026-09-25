// Aplica las migraciones pendientes a la base de datos.
//
//   node scripts/migrar.mjs           -> la base local de desarrollo
//   node scripts/migrar.mjs --remoto  -> la base de Cloudflare
//
// Usa el sistema de migraciones de wrangler, que apunta en la propia base
// cuáles ha aplicado ya. Repetirlo no rompe nada: las que ya están se saltan.

import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const generado = resolve(raiz, 'dist/server/wrangler.json');
const destino = resolve(raiz, 'dist/server/wrangler.migrate.json');
const ajustes = resolve(raiz, 'despliegue.json');
const remoto = process.argv.includes('--remoto');

const aborta = (mensaje) => {console.error('\n' + mensaje + '\n');process.exit(1);};

if (!existsSync(generado)) aborta('Falta dist/server/wrangler.json. Compila antes: corepack pnpm build');

const config = JSON.parse(readFileSync(generado, 'utf8'));
let nombre = config.d1_databases?.[0]?.database_name;
let id = config.d1_databases?.[0]?.database_id;

if (remoto) {
  if (!existsSync(ajustes)) aborta('Falta despliegue.json. Los pasos están en DESPLIEGUE.md');
  const {d1} = JSON.parse(readFileSync(ajustes, 'utf8'));
  if (!d1?.nombre || !d1?.id) aborta('despliegue.json: faltan "d1.nombre" o "d1.id".');
  nombre = d1.nombre; id = d1.id;
}

// wrangler busca las migraciones en migrations_dir, y lo resuelve desde donde
// está el archivo de configuración, no desde la raíz: por eso va absoluto.
// Las de drizzle ya se llaman 0000_, 0001_… así que sirven tal cual.
config.d1_databases = [{binding: 'DB', database_name: nombre, database_id: id, migrations_dir: resolve(raiz, 'drizzle')}];
delete config.dev;
writeFileSync(destino, JSON.stringify(config, null, 2));

console.log(`Migraciones sobre "${nombre}" (${remoto ? 'Cloudflare' : 'local'})\n`);

const ubicacion = remoto ? ['--remote'] : ['--local', '--persist-to', '.wrangler/state'];
const salida = spawnSync('corepack',
  ['pnpm','exec','wrangler','d1','migrations','apply',nombre,'--config',destino,...ubicacion],
  {cwd: raiz, stdio: 'inherit'});
process.exit(salida.status ?? 1);
