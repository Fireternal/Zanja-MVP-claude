// Revisa un lote de casos generados fuera de la app antes de meterlos en lib/cases.ts.
// Uso: node scripts/validar-casos.mjs lote.json [lote2.json ...]
import {readFileSync} from 'node:fs';

const CATEGORIAS = ['Convivencia','Pareja','Amigos','Comida','Trabajo','Viajes'];
const MIN = 12, MAX = 160;
const usados = new Set(
  readFileSync(new URL('../lib/cases.ts', import.meta.url), 'utf8')
    .match(/"id":\s*"([^"]+)"/g)?.map(x => x.slice(8, -1)) ?? []
);

const vistos = new Set(), fallos = [], porCategoria = {};
let total = 0;

for (const ruta of process.argv.slice(2)) {
  let lote;
  try { lote = JSON.parse(readFileSync(ruta, 'utf8')); }
  catch (e) { fallos.push(`${ruta}: JSON inválido — ${e.message}`); continue; }
  if (!Array.isArray(lote)) { fallos.push(`${ruta}: la raíz no es un array`); continue; }

  lote.forEach((c, i) => {
    total++;
    const donde = `${ruta}[${i}] ${c?.id ?? '¿sin id?'}`;
    const mal = m => fallos.push(`${donde}: ${m}`);
    if (typeof c?.id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)?$/.test(c.id)) mal('id con formato raro');
    else if (usados.has(c.id)) mal('id ya usado en lib/cases.ts');
    else if (vistos.has(c.id)) mal('id repetido en el lote');
    else vistos.add(c.id);
    if (!CATEGORIAS.includes(c?.tag)) mal(`tag fuera de la lista: ${c?.tag}`);
    else porCategoria[c.tag] = (porCategoria[c.tag] || 0) + 1;
    if (typeof c?.q !== 'string' || !c.q.startsWith('¿') || !c.q.endsWith('?')) mal('la pregunta no va entre ¿ ?');
    for (const campo of ['at','bt']) {
      const v = c?.[campo];
      if (typeof v !== 'string' || v.trim().length < 4 || v.trim().length > 32) mal(`${campo} fuera de 4-32 caracteres`);
      if (typeof v === 'string' && /^Bando [AB]$/.test(v.trim())) mal(`${campo} no puede ser "Bando A/B"`);
    }
    for (const campo of ['a','b']) {
      const v = c?.[campo];
      if (!Array.isArray(v) || v.length !== 3) { mal(`${campo} no tiene exactamente 3 frases`); continue; }
      v.forEach((f, j) => {
        if (typeof f !== 'string') return mal(`${campo}[${j}] no es texto`);
        const n = f.trim().length;
        if (n < MIN || n > MAX) mal(`${campo}[${j}] tiene ${n} caracteres (debe estar entre ${MIN} y ${MAX})`);
      });
      if (new Set(v.map(x => String(x).trim().toLocaleLowerCase('es'))).size !== 3) mal(`${campo} repite frases`);
    }
    if (typeof c?.emoji !== 'string' || [...c.emoji].length === 0) mal('falta el emoji');
    if (c?.editorial !== 1 || c?.owner !== 'editorial' || c?.created !== 0 || c?.closes !== 0 || c?.status !== 'open') mal('los campos fijos no son los esperados');
  });
}

console.log(`Casos leídos: ${total}`);
console.log('Por categoría:', CATEGORIAS.map(c => `${c} ${porCategoria[c] || 0}`).join(' · '));
if (!fallos.length) { console.log('Todo correcto.'); process.exit(0); }
console.log(`\n${fallos.length} problemas:`);
for (const f of fallos) console.log(' -', f);
process.exit(1);
