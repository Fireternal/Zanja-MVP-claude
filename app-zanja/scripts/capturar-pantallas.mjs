// Retrata la app entera, pantalla por pantalla.
//
// Sirve para enseñarle ZANJA a alguien que no la puede tocar —un diseñador,
// otra IA, un inversor— sin mandarle un enlace que no va a saber recorrer.
// Sale un PNG por pantalla más una hoja de contactos con todas juntas.
//
//   corepack pnpm vitrina
//   cd dist-vitrina && python3 -m http.server 8099 &
//   node scripts/capturar-pantallas.mjs [carpeta-de-salida]
//
// Va contra la vitrina, no contra producción: así las capturas salen siempre
// con los mismos casos de ejemplo y no enseñan datos de nadie.
//
// Playwright no es dependencia del proyecto —pesa lo suyo y esto no se usa a
// diario—. Si no lo tienes: `npm i -g playwright && npx playwright install
// chromium`, o apunta PLAYWRIGHT_MODULO a donde lo tengas instalado.

import {mkdir, writeFile, rm} from 'node:fs/promises';
import {resolve} from 'node:path';

const {chromium} = await import(process.env.PLAYWRIGHT_MODULO || 'playwright')
 .catch(() => {
  console.error('No encuentro Playwright. Instálalo con `npm i -g playwright && npx playwright install chromium`,\n'
   + 'o pásale la ruta del módulo en PLAYWRIGHT_MODULO.');
  process.exit(1);
 });

const OUT = resolve(process.argv[2] || 'capturas');
const BASE = process.env.ZANJA_VITRINA || 'http://localhost:8099/';
/** El iPhone de referencia del proyecto, al doble para que se lea el detalle. */
const MOVIL = {viewport: {width: 390, height: 844}, deviceScaleFactor: 2};

const hechas = [];

await mkdir(OUT, {recursive: true});
const navegador = await chromium.launch({args: ['--ignore-certificate-errors']});
const pagina = await (await navegador.newContext(MOVIL)).newPage();

/** Tocar algo que puede no estar: la app cambia de forma según dónde estés. */
async function toca(loc, espera = 900) {
  try {
    await loc.first().click({timeout: 5000});
    await pagina.waitForTimeout(espera);
    return true;
  } catch {
    return false;
  }
}

async function retrata(nombre) {
  await pagina.waitForTimeout(900);
  const archivo = `${String(hechas.length + 1).padStart(2, '0')}-${nombre}.png`;
  await pagina.screenshot({path: `${OUT}/${archivo}`});
  hechas.push(archivo);
  console.log('  ', archivo);
}

const inicio = () => toca(pagina.getByRole('button', {name: 'Volver al inicio'}), 1100);
const pestana = i => toca(pagina.locator('.mobile-nav button').nth(i), 1100);

// El botón REINICIAR DEV sólo existe para probar y no forma parte del
// diseño: en una revisión estética distrae y da una idea falsa de la barra.
await pagina.addStyleTag({content: '.dev-reset{display:none!important}'}).catch(() => {});
pagina.on('load', () => pagina.addStyleTag({content: '.dev-reset{display:none!important}'}).catch(() => {}));

async function entra() {
  await pagina.goto(BASE);
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForTimeout(1500);
}

// --- La presentación, que sólo sale la primera vez -----------------------
await entra();
if (await pagina.locator('.presentacion').count()) {
  await retrata('onboarding-1');
  for (const boton of [/¿Y CÓMO SE VOTA\?/i, /¿Y QUIÉN DECIDE\?/i, /¿Y YO QUÉ GANO\?/i]) {
    if (await toca(pagina.getByRole('button', {name: boton}), 1000)) await retrata(`onboarding-${hechas.length + 1}`);
  }
  await toca(pagina.getByRole('button', {name: /EMPEZAR A JUZGAR/i}), 1300);
}
if (await pagina.locator('.rules-list').count()) {
  await retrata('reglas');
  await toca(pagina.getByRole('button', {name: /ENTENDIDO/i}), 1000);
}

// --- Sin cuenta ----------------------------------------------------------
await inicio();
await pestana(2);
await retrata('perfil-sin-cuenta');
await toca(pagina.locator('.sin-cuenta .game-btn'), 1200);
await retrata('crear-cuenta');
await pagina.locator('.zanja-dialog input').first().fill('Lucia');
const claves = pagina.locator('.zanja-dialog input[type=password]');
for (let i = 0; i < await claves.count(); i++) await claves.nth(i).fill('clave-de-ejemplo-1');
await retrata('crear-cuenta-relleno');
await toca(pagina.locator('.zanja-dialog .game-btn').first(), 2200);

// --- El Juzgado ----------------------------------------------------------
await pestana(1);
await retrata('juzgado-votacion');
await toca(pagina.locator('.vote-team').first(), 2300);
await retrata('juzgado-veredicto');
await pagina.mouse.wheel(0, 800);
await retrata('la-sala');
await inicio();

// --- Inicio y perfil ya con recorrido ------------------------------------
await pestana(0);
await retrata('inicio');
await toca(pagina.locator('.mission-tile'), 1200);
await retrata('expediente');
await pagina.keyboard.press('Escape');
await pagina.waitForTimeout(700);
await pestana(2);
await retrata('perfil-con-cuenta');
await pagina.mouse.wheel(0, 780);
await retrata('perfil-escalera');
await pagina.mouse.wheel(0, 900);
await retrata('perfil-logros');
await toca(pagina.getByRole('button', {name: /Ajustes/i}), 1200);
await retrata('ajustes');
await pagina.keyboard.press('Escape');
await pagina.waitForTimeout(700);

// --- Mis zanjas ----------------------------------------------------------
await pestana(0);
await toca(pagina.locator('.shortcut-mine'), 1300);
await retrata('mis-zanjas-vacio');

// --- Abrir un pleito -----------------------------------------------------
await pestana(0);
await toca(pagina.locator('.shortcut-create'), 1200);
await retrata('pleito-paso1');
await pagina.locator('#case-story').fill('Habíamos quedado a las ocho para cenar en casa y apareció a las nueve menos cuarto sin avisar. Otra vez.');
await pagina.waitForTimeout(400);
await toca(pagina.getByRole('button', {name: /DARLE FORMA/i}), 1000);
const mias = pagina.locator('.creator-body textarea');
for (let i = 0; i < await mias.count(); i++) await mias.nth(i).fill(`Motivo ${i + 1}: me dejó esperando con la cena hecha y fría.`);
await retrata('pleito-paso2');
await toca(pagina.getByRole('button', {name: /CONSEGUIR EL ENLACE/i}), 2300);
await retrata('pleito-enlace');
const enlace = await pagina.locator('#invitation-link').inputValue().catch(() => '');
await pagina.keyboard.press('Escape');
await pagina.waitForTimeout(800);
await retrata('pleito-invitacion-preparada');
await toca(pagina.locator('.creator-top .icon-btn').last(), 1000);
await pestana(0);
await toca(pagina.locator('.shortcut-mine'), 1300);
await retrata('mis-zanjas-con-caso');

// --- Y la otra parte, que llega por el enlace sin cuenta -----------------
if (enlace) {
  // La vitrina guarda la sesión en localStorage; soltarla es lo más cerca de
  // "otra persona" que se puede estar sin abrir otro navegador.
  await pagina.evaluate(() => {
    const g = JSON.parse(localStorage.getItem('zanja-vitrina-v1'));
    g.user = null;
    localStorage.setItem('zanja-vitrina-v1', JSON.stringify(g));
  });
  await pagina.goto(enlace);
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForTimeout(1600);
  await retrata('bando-b-invitacion');
  const suyas = pagina.locator('.creator-body textarea');
  for (let i = 0; i < await suyas.count(); i++) await suyas.nth(i).fill(`Mi motivo ${i + 1}: avisé al grupo y no me contestó nadie.`);
  await toca(pagina.locator('.consent button[role=checkbox]'), 600);
  await retrata('bando-b-relleno');
  await toca(pagina.getByRole('button', {name: /ENVIAR MI DEFENSA/i}), 2200);
  await retrata('bando-b-enviado');
  await toca(pagina.locator('.creator-top .icon-btn').last(), 1000);
  await pestana(2);
  await retrata('perfil-invitado');
}

// --- La hoja de contactos ------------------------------------------------
const celdas = hechas.map(n => `<figure><img src="${n}"><figcaption>${n.slice(0, -4)}</figcaption></figure>`).join('');
const hoja = `${OUT}/_hoja.html`;
await writeFile(hoja, `<!doctype html><meta charset=utf8><style>
body{margin:0;padding:28px;background:#14101d;color:#e9e2f5;font:14px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
h1{font-size:30px;margin:0 0 4px}p.sub{margin:0 0 26px;color:#a898c4}
.rejilla{display:grid;grid-template-columns:repeat(5,1fr);gap:22px}
figure{margin:0}img{width:100%;display:block;border:1px solid #4a3a63;border-radius:12px;background:#000}
figcaption{margin-top:7px;font-size:12px;color:#b0a0cc;text-align:center}
</style><h1>ZANJA · todas las pantallas</h1>
<p class=sub>Capturas a 390×844 (2x). ${hechas.length} pantallas.</p>
<div class=rejilla>${celdas}</div>`);
const contacto = await (await navegador.newContext({viewport: {width: 1700, height: 1000}})).newPage();
await contacto.goto('file://' + hoja);
await contacto.waitForTimeout(2500);
await contacto.screenshot({path: `${OUT}/00-todas-las-pantallas.png`, fullPage: true});
await rm(hoja);

await navegador.close();
console.log(`\n${hechas.length} pantallas en ${OUT}, más la hoja de contactos.`);
