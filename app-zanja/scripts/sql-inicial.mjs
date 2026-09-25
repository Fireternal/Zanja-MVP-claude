// Junta las migraciones en un solo archivo SQL que se puede pegar en la
// consola de D1 del panel de Cloudflare, sin instalar nada.
//
//   node scripts/sql-inicial.mjs   ->  reescribe db/crear-tablas.sql
//
// Incluye también las anotaciones que wrangler guarda para saber qué
// migraciones ya están aplicadas, así que después se puede seguir usando
// `pnpm migrar --remoto` sin que intente repetirlas.
//
// Es para una base recién creada, y se ejecuta una sola vez: SQLite no sabe
// añadir dos veces la misma columna. Si la base ya tiene tablas, lo que toca
// es `pnpm migrar --remoto`, que sí sabe cuáles faltan.
//
// Hay que volver a ejecutarlo cada vez que se genere una migración nueva.

import {readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {raiz} from './ajustes.mjs';

const origen = resolve(raiz, 'drizzle');
const destino = resolve(raiz, 'db/crear-tablas.sql');

const migraciones = readdirSync(origen).filter((f) => /^\d+_.*\.sql$/.test(f)).sort();

const partes = [
  '-- ZANJA · todas las migraciones en un solo archivo.',
  '-- Generado por scripts/sql-inicial.mjs. No editar a mano.',
  '--',
  '-- Para usarlo: panel de Cloudflare → D1 → tu base → Console,',
  '-- pegar todo esto y ejecutar. Una sola vez, sobre una base recién creada:',
  '-- si la base ya tiene tablas, esto da error y no hace falta.',
  '',
  'CREATE TABLE IF NOT EXISTS d1_migrations(',
  '\tid         INTEGER PRIMARY KEY AUTOINCREMENT,',
  '\tname       TEXT UNIQUE,',
  '\tapplied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL',
  ');',
  '',
];

for (const archivo of migraciones) {
  const sql = readFileSync(resolve(origen, archivo), 'utf8')
    .split('--> statement-breakpoint')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.endsWith(';') ? s : s + ';'))
    .join('\n');
  partes.push(`-- ${archivo}`, sql, `INSERT OR IGNORE INTO d1_migrations (name) VALUES ('${archivo}');`, '');
}

writeFileSync(destino, partes.join('\n'));
console.log(`${destino}\n${migraciones.length} migraciones juntadas.`);
