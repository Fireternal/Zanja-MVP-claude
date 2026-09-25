# ZANJA · Paquete completo de traspaso

Para una IA o equipo que no ha visto la conversación. Leer este archivo primero; el código es una instantánea del prototipo y no del repositorio real del destinatario.

# Código completo y guía de integración

## Versión entregada

Commit `dd57bf1f08506018e27abf8250129e466d15ed5e`, árbol Git limpio al iniciar exportación. Fuente del prototipo ZANJA mobile en https://zanja-arena.cacahueto.chatgpt.site/ . Exportación25-09-2026. El sitio vivo puede evolucionar después: esta entrega es una instantánea.

**No es el repositorio original de la aplicación del destinatario.** Es el prototipo creado durante esta conversación. Integre componentes/diseño sobre su código real conservando sus contratos cuando corresponda. No sustituya a ciegas su backend con el del prototipo.

`codigo/` conserva archivos completos individuales TSX,TS,JS,MJS,CSS,SQL,JSON y configuración; no fragmentos. La UI se escribió en React/TypeScript, no como HTML plano autónomo. El HTML lo genera el framework. `compilado/` contiene además la salida disponible JS/CSS/worker completa. `archivo-historico/` conserva scripts anteriores y compilaciones tar.gz, solo para recuperación, no para instalar encima de la última versión. No se incluyen node_modules, caches, historial .git, credenciales ni bases de datos con usuarios.

## Mapa de archivos

| Ruta | Responsabilidad |
|---|---|
| app/page.tsx | Shell, navegación, Inicio, Mis zanjas, Perfil, estados y diálogo general, fetch y voto/reset |
| app/layout.tsx | Importación CSS, viewport, idioma y metadata |
| app/globals.css | Base, imports fuentes/Tailwind y estilos heredados |
| app/mobile.css | Shell móvil, lobby, navegación y densidades |
| app/court.css | Duelo, prueba, resultados y animación party |
| app/overlays.css | Viewport compartido de todos los portales |
| app/creator.css | Creación completa y animaciones de interacción/publicación |
| components/game/court.tsx | Coordinación del Juzgado y resultados |
| components/game/duel-board.tsx | A/B/VS/Ambos, pregunta, prueba y lectura |
| components/game/create-zanja.tsx | Cuatro pasos, bifurcación B, envío, publicación y éxito |
| components/game/invite-response.tsx | Respuesta independiente B y validación |
| components/game/defense-fields.tsx | Tres defensas reutilizables y validación visual |
| components/game/growing-textarea.tsx | Campo que crece sin scroll interno artificial |
| components/game/creator-clash.tsx | A/B que chocan |
| components/game/next-countdown.tsx | Tiempo4s, pausa y transición siguiente |
| components/game/evidence.tsx | Conversión, subida, preview y visor |
| lib/cases.ts | Tipos, casos editoriales, defensa12–160 y validadores |
| lib/creation-navigation.ts | Reglas de vuelta del flujo |
| lib/evidence.ts | Validación WebP y límite de body |
| app/api/game/route.ts | Operaciones persistentes y permisos |
| app/api/evidence/route.ts | Recuperación de evidencia y autorización |
| db/, drizzle/, lib/server-db.ts | Esquema D1, migraciones y adaptador |
| tests/game.test.mjs | Pruebas reales de handlers con SQLite de test |
| components/ui/ | Primitivas de biblioteca; varias sin uso actual |
| public/ | WebP optimizados, favicon y manifest |
| scripts/, build/, vite.config.ts | Infraestructura de build del prototipo Sites/Vinext |

## Arranque e infraestructura

Node>=22.13.0, React19.2.6, Next16.3.4, Vinext1.0.0-beta.5, Vite8.0.13, Tailwind4.2.1, pnpm11.25.0. Versiones exactas y dependencias transitivas en package.json/pnpm-lock.yaml. El README del starter contiene detalles históricos (incluida referencia npm ci sin package-lock); usar el lockfile pnpm entregado como fuente de dependencias.

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm dev
# Verificación:
node --test tests/game.test.mjs
corepack pnpm exec tsc --noEmit
corepack pnpm build
```

El runtime es específico de Sites/Cloudflare. `scripts/run-framework.mjs` distingue perfil portable y managed-linux; revisar README y scripts completos al arrancar fuera de este entorno. D1 requiere binding DB y evidencia R2 requiere BUCKET. `.openai/hosting.json` identifica el proyecto original: **no reutilizar su identidad para desplegar otra aplicación**. `compilado/` es referencia recuperable, no una web estática que funcione abriendo un HTML. Recompilar tras integrar.

## Datos y reglas que el diseño presupone

- Caso con pregunta/relato, tema, A[3], B[3], autor/participante, audiencia, duración, status, evidencia opcional, propia elección y recuentos. Conservar tres opciones `a`, `both`, `b` en todo cálculo; porcentaje=opción/total incluyendo ambos. No sustituir votos reales por recuentos decorativos.
- Defensas: exactamente3 por bando,12–160 caracteres tras trim, distintas. Validación cliente y servidor. No completar automáticamente argumentos de usuarios para llegar a tres.
- Relato inicial hasta1200 caracteres; el paso2 no permite reescribirlo. No hay API de IA que ordene el relato; el siguiente paso copia story a q. Si se añade una más adelante, hacer explícita la revisión por el creador.
- Nuevo flujo invitado: crear pendiente → B responde sin ver A → listo (`ready`) → A elige audiencia/duración y publica. Invitaciones previas conservan compatibilidad de workflow anterior. Mode solo significa que una sola persona redactó ambas posiciones.
- Login para mutaciones. Un voto por identidad/caso, autor y participante no votan su propio caso. El cierre y permisos se validan en servidor. Resultados no visibles antes de votar salvo permisos/estado contemplados por API.
- XP+5 por voto; nivel cada150XP; reto5 votos diarios. Las estadísticas salen de datos reales. Participación baja se comunica como insuficiente, no sentencia representativa.
- Evidencia JPG/PNG/WebP entrada≤10MB, convertida a WebP≤1600px y≤750000bytes; servidor valida firma/longitud. R2 guarda imagen, D1 metadatos. No enviar archivos/base64 gigantes sin límites. El visor requiere errores/reintento y permisos.
- Desaparición de cola por voto, salto, filtro, estado o denuncia. Reset de desarrollo elimina votos propios y limpia skip/filtro. No es un borrado global de casos.
- D1 migraciones0000,0001,0002 conservadas completas. No reescribir migraciones ya publicadas; adaptar mediante nuevas migraciones al código real.

## Secuencia de integración recomendada

1. Mapear Case/identidad/acciones al backend real sin perder estados, evidencia y Ambos.
2. Copiar recursos activos de imagen; mantener nombres o adaptar URLs en CSS/TSX.
3. Cargar fuentes y CSS en el orden exacto. `design-system.css` reúne tokens actuales y alias nuevos para portabilidad; no sustituye los cinco CSS ni los keyframes.
4. Integrar shell/menú, DuelBoard/Court, resultados/contador, creador/invitación y por último pantallas secundarias y overlays.
5. Conservar semántica de botones, labels, lectura completa, errores y preferencia de movimiento. No trasladar el CSS del starter entero si el destino ya tiene otro sistema sin aislar clases.
6. Probar datos extremos y dos identidades reales; revisar navegación Atrás y pausa del contador.
7. Retirar reset DEV, limpiar textos heredados, completar QA visual y contratos de permisos antes de beta abierta.

## Validación conocida y límites

La versión anterior a esta exportación se comprobó con TypeScript, build de producción y19 pruebas de handlers. Es evidencia de compilación/lógica, no evidencia de inspección visual. El entorno de preview no permitió revisar dispositivo ni generar capturas actuales. Consultar VALIDACION.txt para cualquier ejecución repetida durante esta entrega. No se ha cambiado el comportamiento de la app al empaquetar.


# 3. Sistema de diseño listo para pegar

Los primeros tokens se extraen de los :root existentes; los alias posteriores organizan valores actuales para integración. Se incluye la paleta literal de estilos heredados sin atribuirles falsamente una función vigente. Para reproducir exactamente la app se necesitan también los CSS de componentes y su cascada.

```css
/* ZANJA · extracción del commit dd57bf1. Importar fuentes una sola vez.
   Variables existentes + alias de integración. No sustituye los estilos de componentes. */
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800;900;1000&family=Titan+One&display=swap');
:root {
  --background:#17122b;
  --foreground:#faf8ff;
  --card:#27203e;
  --card-foreground:#faf8ff;
  --popover:#27203e;
  --popover-foreground:#fff;
  --primary:#ad85ff;
  --primary-foreground:#17122b;
  --secondary:#332849;
  --secondary-foreground:#fff;
  --muted:#30273f;
  --muted-foreground:#bdb5cf;
  --accent:#413158;
  --accent-foreground:#fff;
  --destructive:#fc768a;
  --border:#514365;
  --input:#625174;
  --ring:#ffce43;
  --radius:1rem;
  --yellow:#ffd13e;
  --purple:#9260ff;
  --ink:#100d20;
  --cyan:#5de1f3;
  --coral:#ff858d;
  --game-frame:#b389ec;
  --game-bevel:0 5px 0 #10081d,inset 0 2px 0 #e7c9ff55;
  --display:'Titan One','Arial Black',sans-serif;
  --menu-title-size:clamp(23px,6.5vw,32px);
  --phone-width:480px;
  --nav-height:72px;
  --gold:#ffd343;
  --frame:#19112d;

  /* Tipografía: Titan One solo 400; Nunito Sans 400,600,700,800,900,1000. */
  --font-body: 'Nunito Sans', Arial, sans-serif;
  --font-weight-display: 400;
  --font-weight-body: 600;
  --font-weight-defense: 800;
  --font-weight-strong: 900;
  --font-weight-heavy: 1000;
  --text-micro: 10px;
  --text-caption: 12px;
  --text-help: 14px;
  --text-body: 16px;
  --text-story: 19px;
  --text-action: 20px;
  --text-screen: 28px;
  --text-score: 32px;
  --text-question: clamp(21px,5.8vw,27px);
  --text-creator-title: clamp(27px,7vw,32px);
  --line-body: 1.4;
  --line-defense: 1.28;
  --line-menu: 1.13;
  --title-stroke: .7px #2b123e;
  --title-shadow: 0 3px 0 #2b123e;
  /* Superficies y semántica actuales */
  --surface-app: #19112d;
  --surface-court: #211330;
  --surface-creator: #21142f;
  --surface-nav: #21162f;
  --text-main: #ffffff;
  --text-secondary: #cdb8df;
  --text-placeholder: #ab93c1;
  --title-highlight: #ffdf59;
  --team-a-border: #76d9fa;
  --team-a-heading: #17679b;
  --team-a-text-accent: #92e9ff;
  --team-b-border: #ffa5b5;
  --team-b-heading: #a64064;
  --team-b-text-accent: #ffc1d6;
  --choice-selected: #ffe266;
  --team-a-fill: radial-gradient(ellipse at 90% 0%,#227eac,#174f7c 58%,#1b3358);
  --team-b-fill: radial-gradient(ellipse at 90% 0%,#c45270,#7e3455 58%,#542b48);
  --both-fill: linear-gradient(115deg,#51308b,#6f3295);
  --primary-fill: linear-gradient(#ffe264,#ffc82e);
  --creator-primary-fill: linear-gradient(#ffe574,#ffcc32);
  --secondary-fill: linear-gradient(#513568,#3b254f);
  --toolbar-fill: linear-gradient(#654485,#342044);
  --radius-xs: 6px;
  --radius-sm: 9px;
  --radius-control: 12px;
  --radius-field: 13px;
  --radius-score: 16px;
  --radius-tile: 17px;
  --radius-panel: 18px;
  --radius-card: 19px;
  --radius-sheet: 25px;
  --border-thin: 1px;
  --border-card: 2px;
  --border-heavy: 3px;
  --shadow-primary: 0 5px 0 #12091e,inset 0 2px 0 #fff6bd;
  --shadow-secondary: 0 4px 0 #10091b;
  --shadow-toolbar: 0 3px 0 #10081c,inset 0 2px 0 #ffffff22;
  --shadow-shortcut: 0 5px 0 #130922,inset 0 2px 0 #d1adff66;
  --shadow-shortcut-yellow: 0 5px 0 #130922,inset 0 2px 0 #fff7c0;
  --shadow-daily: 0 5px 0 #140926,inset 0 2px 0 #edceff55;
  --shadow-pressed-tile: 0 2px 0 #130922;
  --shadow-selected: 0 0 22px #ffd65080,var(--game-bevel);
  --focus-ring: 3px solid #ffd343;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 40px;
  --space-9: 48px;
  --toolbar-height: 44px;
  --icon-button-size: 42px;
  --primary-min-height: 54px;
  --creator-action-height: 49px;
  --both-height: 68px;
  --both-height-compact: 58px;
  --motion-press: 180ms;
  --motion-step: 320ms;
  --motion-duel: 480ms;
  --motion-clash: 940ms;
  --motion-score: 600ms;
  --motion-dialog: 180ms;
  --motion-countdown: 4000ms;
  --ease-party: cubic-bezier(.2,.9,.25,1.2);
  --ease-step: cubic-bezier(.2,.75,.25,1);
}

/* Paleta literal completa conservada en los cinco CSS, incluidos estilos heredados.
   Los alias raw no indican que todos esos tonos sigan visibles. */
:root {
  --raw-000: #000000;
  --raw-0007: #00000077;
  --raw-0009: #00000099;
  --raw-000b: #000000bb;
  --raw-09061080: #09061080;
  --raw-091d2d: #091d2d;
  --raw-0b0815: #0b0815;
  --raw-0b0816: #0b0816;
  --raw-0b0818: #0b0818;
  --raw-0c091a: #0c091a;
  --raw-0c091b: #0c091b;
  --raw-0d091b: #0d091b;
  --raw-0d0922: #0d0922;
  --raw-0d0a1c: #0d0a1c;
  --raw-0f0a1e: #0f0a1e;
  --raw-10071d: #10071d;
  --raw-10081b: #10081b;
  --raw-10081c: #10081c;
  --raw-10081d: #10081d;
  --raw-10091b: #10091b;
  --raw-10091f: #10091f;
  --raw-100a19: #100a19;
  --raw-100b20: #100b20;
  --raw-100c1b: #100c1b;
  --raw-100d1c: #100d1c;
  --raw-100d1d: #100d1d;
  --raw-100d20: #100d20;
  --raw-11081b: #11081b;
  --raw-110820: #110820;
  --raw-11091b: #11091b;
  --raw-110a21: #110a21;
  --raw-110b1a: #110b1a;
  --raw-110b1d: #110b1d;
  --raw-110d21: #110d21;
  --raw-12081e: #12081e;
  --raw-120820: #120820;
  --raw-12091e: #12091e;
  --raw-120a1d: #120a1d;
  --raw-120a1f: #120a1f;
  --raw-120b20: #120b20;
  --raw-120b21: #120b21;
  --raw-13081f: #13081f;
  --raw-130922: #130922;
  --raw-130b2e: #130b2e;
  --raw-130c1f: #130c1f;
  --raw-13578f: #13578f;
  --raw-14091c: #14091c;
  --raw-140926: #140926;
  --raw-140b23: #140b23;
  --raw-140c23: #140c23;
  --raw-140c24: #140c24;
  --raw-141128: #141128;
  --raw-150c24: #150c24;
  --raw-150d2340: #150d2340;
  --raw-151020: #151020;
  --raw-15394b33: #15394b33;
  --raw-16082f55: #16082f55;
  --raw-160b22: #160b22;
  --raw-160e21: #160e21;
  --raw-160e2430: #160e2430;
  --raw-160e26: #160e26;
  --raw-163342: #163342;
  --raw-170e2a80: #170e2a80;
  --raw-171020: #171020;
  --raw-171021: #171021;
  --raw-17102d88: #17102d88;
  --raw-17122b: #17122b;
  --raw-17122bd9: #17122bd9;
  --raw-173454: #173454;
  --raw-173d51: #173d51;
  --raw-174f7c: #174f7c;
  --raw-175f9800: #175f9800;
  --raw-175f98e6: #175f98e6;
  --raw-176292: #176292;
  --raw-17679b: #17679b;
  --raw-180729: #180729;
  --raw-180a2b: #180a2b;
  --raw-180e29: #180e29;
  --raw-180f25: #180f25;
  --raw-18334777: #18334777;
  --raw-185f8d: #185f8d;
  --raw-190d24: #190d24;
  --raw-19112d: #19112d;
  --raw-1a0b26: #1a0b26;
  --raw-1a2b41: #1a2b41;
  --raw-1b142bef: #1b142bef;
  --raw-1b3358: #1b3358;
  --raw-1c142c: #1c142c;
  --raw-1d132b: #1d132b;
  --raw-20133388: #20133388;
  --raw-20142f: #20142f;
  --raw-20142f66: #20142f66;
  --raw-201a30: #201a30;
  --raw-203044: #203044;
  --raw-211031: #211031;
  --raw-21112de8: #21112de8;
  --raw-21113966: #21113966;
  --raw-211330: #211330;
  --raw-21142f: #21142f;
  --raw-21152f: #21152f;
  --raw-21162f: #21162f;
  --raw-211634dd: #211634dd;
  --raw-22112f: #22112f;
  --raw-221934: #221934;
  --raw-227eac: #227eac;
  --raw-231132e8: #231132e8;
  --raw-233755: #233755;
  --raw-2384ba: #2384ba;
  --raw-240d3c: #240d3c;
  --raw-241038: #241038;
  --raw-24133e: #24133e;
  --raw-241430: #241430;
  --raw-241525: #241525;
  --raw-241632: #241632;
  --raw-25162f: #25162f;
  --raw-251d39: #251d39;
  --raw-251d3900: #251d3900;
  --raw-251e37: #251e37;
  --raw-25304c: #25304c;
  --raw-258cba: #258cba;
  --raw-261831: #261831;
  --raw-261d39: #261d39;
  --raw-271346bd: #271346bd;
  --raw-27144a: #27144a;
  --raw-271633: #271633;
  --raw-27164fc2: #27164fc2;
  --raw-27203e: #27203e;
  --raw-28152e: #28152e;
  --raw-281c3d: #281c3d;
  --raw-29104180: #29104180;
  --raw-29143f: #29143f;
  --raw-2a213c: #2a213c;
  --raw-2b123e: #2b123e;
  --raw-2b1255: #2b1255;
  --raw-2b1940: #2b1940;
  --raw-2b2039: #2b2039;
  --raw-2c2241: #2c2241;
  --raw-2e0f7890: #2e0f7890;
  --raw-2e2442: #2e2442;
  --raw-2e2445: #2e2445;
  --raw-302047: #302047;
  --raw-30243f: #30243f;
  --raw-30273f: #30273f;
  --raw-312a36: #312a36;
  --raw-321449a8: #321449a8;
  --raw-321850: #321850;
  --raw-32185009: #32185009;
  --raw-321850ce: #321850ce;
  --raw-322053aa: #322053aa;
  --raw-332034: #332034;
  --raw-33213c: #33213c;
  --raw-332849: #332849;
  --raw-342044: #342044;
  --raw-342045: #342045;
  --raw-342541: #342541;
  --raw-352039: #352039;
  --raw-352143: #352143;
  --raw-352148: #352148;
  --raw-352541: #352541;
  --raw-35c8e7: #35c8e7;
  --raw-37203b: #37203b;
  --raw-37215766: #37215766;
  --raw-372348: #372348;
  --raw-372b48: #372b48;
  --raw-38203b: #38203b;
  --raw-38203d: #38203d;
  --raw-382043: #382043;
  --raw-382152e6: #382152e6;
  --raw-382241: #382241;
  --raw-38234d: #38234d;
  --raw-382548: #382548;
  --raw-382b30: #382b30;
  --raw-382d44: #382d44;
  --raw-38306a: #38306a;
  --raw-392246: #392246;
  --raw-392349: #392349;
  --raw-392a4d: #392a4d;
  --raw-39869b: #39869b;
  --raw-3b223b: #3b223b;
  --raw-3b254f: #3b254f;
  --raw-3c274f: #3c274f;
  --raw-3d2852: #3d2852;
  --raw-3e2440: #3e2440;
  --raw-3e2465: #3e2465;
  --raw-402948: #402948;
  --raw-402958: #402958;
  --raw-403152: #403152;
  --raw-40334c: #40334c;
  --raw-409bbb: #409bbb;
  --raw-412164: #412164;
  --raw-41226c99: #41226c99;
  --raw-413158: #413158;
  --raw-4197b1: #4197b1;
  --raw-42207780: #42207780;
  --raw-422077e6: #422077e6;
  --raw-42227308: #42227308;
  --raw-42227391: #42227391;
  --raw-422273e6: #422273e6;
  --raw-422273fa: #422273fa;
  --raw-42266c: #42266c;
  --raw-43225c: #43225c;
  --raw-432349: #432349;
  --raw-43364f: #43364f;
  --raw-453422: #453422;
  --raw-482443: #482443;
  --raw-48257255: #48257255;
  --raw-482959: #482959;
  --raw-492581: #492581;
  --raw-493952: #493952;
  --raw-4a20a935: #4a20a935;
  --raw-4a20a985: #4a20a985;
  --raw-4a2191: #4a2191;
  --raw-4a264f: #4a264f;
  --raw-4a2e68: #4a2e68;
  --raw-4b203b: #4b203b;
  --raw-4b3b65: #4b3b65;
  --raw-4c1e9412: #4c1e9412;
  --raw-4c1e9438: #4c1e9438;
  --raw-4c283e: #4c283e;
  --raw-4c3261: #4c3261;
  --raw-4d287bcc: #4d287bcc;
  --raw-4e233e77: #4e233e77;
  --raw-4ebed52b: #4ebed52b;
  --raw-4f22a6: #4f22a6;
  --raw-512c82: #512c82;
  --raw-51308b: #51308b;
  --raw-513568: #513568;
  --raw-513764: #513764;
  --raw-514260: #514260;
  --raw-51429644: #51429644;
  --raw-514365: #514365;
  --raw-51445f: #51445f;
  --raw-5222b0: #5222b0;
  --raw-5222b0c9: #5222b0c9;
  --raw-524064: #524064;
  --raw-5322a5: #5322a5;
  --raw-533c63: #533c63;
  --raw-542238: #542238;
  --raw-542b48: #542b48;
  --raw-543389: #543389;
  --raw-544265: #544265;
  --raw-553145: #553145;
  --raw-553570: #553570;
  --raw-562747: #562747;
  --raw-56406b: #56406b;
  --raw-5825bada: #5825bada;
  --raw-5825baf0: #5825baf0;
  --raw-5825bafa: #5825bafa;
  --raw-583228: #583228;
  --raw-584267: #584267;
  --raw-58436c: #58436c;
  --raw-594073: #594073;
  --raw-59426e: #59426e;
  --raw-5a27b9: #5a27b9;
  --raw-5a456d: #5a456d;
  --raw-5b3979: #5b3979;
  --raw-5b3b46: #5b3b46;
  --raw-5d496f: #5d496f;
  --raw-5de1f3: #5de1f3;
  --raw-5e426c: #5e426c;
  --raw-613ca333: #613ca333;
  --raw-614574: #614574;
  --raw-624273: #624273;
  --raw-624a76: #624a76;
  --raw-625174: #625174;
  --raw-633383: #633383;
  --raw-63467d: #63467d;
  --raw-654485: #654485;
  --raw-654d7a: #654d7a;
  --raw-65e1f4: #65e1f4;
  --raw-663451: #663451;
  --raw-664a7c: #664a7c;
  --raw-674585: #674585;
  --raw-674975: #674975;
  --raw-674e78: #674e78;
  --raw-67507b: #67507b;
  --raw-675777: #675777;
  --raw-68478c: #68478c;
  --raw-693d91: #693d91;
  --raw-69469455: #69469455;
  --raw-694c32: #694c32;
  --raw-6a477b: #6a477b;
  --raw-6d478b: #6d478b;
  --raw-6ed9f0: #6ed9f0;
  --raw-6f3295: #6f3295;
  --raw-6fbfde: #6fbfde;
  --raw-703938: #703938;
  --raw-7040bb: #7040bb;
  --raw-705072: #705072;
  --raw-715180: #715180;
  --raw-72518c45: #72518c45;
  --raw-73519344: #73519344;
  --raw-73603c: #73603c;
  --raw-7445b744: #7445b744;
  --raw-755030: #755030;
  --raw-755887: #755887;
  --raw-7645b63d: #7645b63d;
  --raw-76508c70: #76508c70;
  --raw-765094: #765094;
  --raw-76528b: #76528b;
  --raw-76548e: #76548e;
  --raw-76d9fa: #76d9fa;
  --raw-7740ab4d: #7740ab4d;
  --raw-774ed0: #774ed0;
  --raw-775691: #775691;
  --raw-77582060: #77582060;
  --raw-7853a6: #7853a6;
  --raw-78e7ff: #78e7ff;
  --raw-79548d: #79548d;
  --raw-795589: #795589;
  --raw-79558d: #79558d;
  --raw-7a304433: #7a304433;
  --raw-7b549b55: #7b549b55;
  --raw-7b589b: #7b589b;
  --raw-7cdbf7: #7cdbf7;
  --raw-7e3455: #7e3455;
  --raw-7e708f: #7e708f;
  --raw-81dff7: #81dff7;
  --raw-8554c620: #8554c620;
  --raw-8560a6: #8560a6;
  --raw-867095: #867095;
  --raw-8760a6: #8760a6;
  --raw-8760ad: #8760ad;
  --raw-88d7ee: #88d7ee;
  --raw-8a50c4: #8a50c4;
  --raw-8a719b: #8a719b;
  --raw-8a789e: #8a789e;
  --raw-8be9ff: #8be9ff;
  --raw-8c7c9e: #8c7c9e;
  --raw-8ce3f0: #8ce3f0;
  --raw-8cebff: #8cebff;
  --raw-8cf0ff: #8cf0ff;
  --raw-8d65a5: #8d65a5;
  --raw-8d7aaa: #8d7aaa;
  --raw-8e749f: #8e749f;
  --raw-8ee9f5: #8ee9f5;
  --raw-8f7fa2: #8f7fa2;
  --raw-907b9f: #907b9f;
  --raw-917ba3: #917ba3;
  --raw-91eaff: #91eaff;
  --raw-9260ff: #9260ff;
  --raw-927caa: #927caa;
  --raw-92e9ff: #92e9ff;
  --raw-9370b5: #9370b5;
  --raw-9486ad: #9486ad;
  --raw-956caf: #956caf;
  --raw-9575b5: #9575b5;
  --raw-95eaff: #95eaff;
  --raw-963e65: #963e65;
  --raw-96631366: #96631366;
  --raw-9681ad: #9681ad;
  --raw-973f65: #973f65;
  --raw-9871b5: #9871b5;
  --raw-9871c1: #9871c1;
  --raw-994664: #994664;
  --raw-9970c7: #9970c7;
  --raw-99772d66: #99772d66;
  --raw-9a73da: #9a73da;
  --raw-9c66f285: #9c66f285;
  --raw-9ee7f0: #9ee7f0;
  --raw-9f92b5: #9f92b5;
  --raw-a16fdf30: #a16fdf30;
  --raw-a17cd1: #a17cd1;
  --raw-a17cd7: #a17cd7;
  --raw-a1e4ff66: #a1e4ff66;
  --raw-a578e5: #a578e5;
  --raw-a57cc2: #a57cc2;
  --raw-a592c0: #a592c0;
  --raw-a64064: #a64064;
  --raw-a780c7: #a780c7;
  --raw-a797bb: #a797bb;
  --raw-a87adc: #a87adc;
  --raw-a979fd: #a979fd;
  --raw-a98bc4: #a98bc4;
  --raw-a998bc: #a998bc;
  --raw-a99abd: #a99abd;
  --raw-a9e7d0: #a9e7d0;
  --raw-aa80c7: #aa80c7;
  --raw-ab93c1: #ab93c1;
  --raw-ac9ebc: #ac9ebc;
  --raw-ad85ff: #ad85ff;
  --raw-ad92bf: #ad92bf;
  --raw-ae5a77: #ae5a77;
  --raw-ae842a55: #ae842a55;
  --raw-ae91cb: #ae91cb;
  --raw-af93c2: #af93c2;
  --raw-af93c3: #af93c3;
  --raw-afa5c6: #afa5c6;
  --raw-b08bce66: #b08bce66;
  --raw-b08ed3: #b08ed3;
  --raw-b0a0c4: #b0a0c4;
  --raw-b0a1c3: #b0a1c3;
  --raw-b298c4: #b298c4;
  --raw-b389ec: #b389ec;
  --raw-b38be7: #b38be7;
  --raw-b39cc7: #b39cc7;
  --raw-b487ec: #b487ec;
  --raw-b48ac259: #b48ac259;
  --raw-b48bea: #b48bea;
  --raw-b48dcd: #b48dcd;
  --raw-b496fa55: #b496fa55;
  --raw-b49cc9: #b49cc9;
  --raw-b54d7000: #b54d7000;
  --raw-b54d70e6: #b54d70e6;
  --raw-b587df66: #b587df66;
  --raw-b58fe9: #b58fe9;
  --raw-b59bcc: #b59bcc;
  --raw-b5def0: #b5def0;
  --raw-b65b8a: #b65b8a;
  --raw-b689f2: #b689f2;
  --raw-b69ac8: #b69ac8;
  --raw-b69acb: #b69acb;
  --raw-b6a0c6: #b6a0c6;
  --raw-b6a4c8: #b6a4c8;
  --raw-b78cff66: #b78cff66;
  --raw-b797d8: #b797d8;
  --raw-b84473: #b84473;
  --raw-b8546d12: #b8546d12;
  --raw-b890ef: #b890ef;
  --raw-b89acb: #b89acb;
  --raw-b89bcb: #b89bcb;
  --raw-b8a0c7: #b8a0c7;
  --raw-b8a6ca: #b8a6ca;
  --raw-b9a0d1: #b9a0d1;
  --raw-b9a8cd: #b9a8cd;
  --raw-b9a8ce: #b9a8ce;
  --raw-b9adca: #b9adca;
  --raw-b9b0cb: #b9b0cb;
  --raw-ba5b7c: #ba5b7c;
  --raw-ba7724: #ba7724;
  --raw-bb8b3c: #bb8b3c;
  --raw-bba2ca: #bba2ca;
  --raw-bc7eff33: #bc7eff33;
  --raw-bc91d7: #bc91d7;
  --raw-bca3cd: #bca3cd;
  --raw-bca4cf: #bca4cf;
  --raw-bca6d0: #bca6d0;
  --raw-bca7ce: #bca7ce;
  --raw-bca9ce: #bca9ce;
  --raw-bcaccc: #bcaccc;
  --raw-bcb1d4: #bcb1d4;
  --raw-bd8ffc88: #bd8ffc88;
  --raw-bda1cb50: #bda1cb50;
  --raw-bdb5cf: #bdb5cf;
  --raw-bdf4ff: #bdf4ff;
  --raw-bf86ff20: #bf86ff20;
  --raw-bf8feb: #bf8feb;
  --raw-bfa7d1: #bfa7d1;
  --raw-c0a3f3: #c0a3f3;
  --raw-c0aecf: #c0aecf;
  --raw-c1a7d4: #c1a7d4;
  --raw-c1adcf: #c1adcf;
  --raw-c2f8ff: #c2f8ff;
  --raw-c3a8db: #c3a8db;
  --raw-c45270: #c45270;
  --raw-c4add4: #c4add4;
  --raw-c4add7: #c4add7;
  --raw-c59aff: #c59aff;
  --raw-c5a9d5: #c5a9d5;
  --raw-c5aed3: #c5aed3;
  --raw-c5b8ad: #c5b8ad;
  --raw-c6acd9: #c6acd9;
  --raw-c6acff: #c6acff;
  --raw-c6b5df: #c6b5df;
  --raw-c6e4ff55: #c6e4ff55;
  --raw-c7953540: #c7953540;
  --raw-c8a3ff: #c8a3ff;
  --raw-c9b0db: #c9b0db;
  --raw-cbb3de: #cbb3de;
  --raw-cbb4dc: #cbb4dc;
  --raw-ccb1da: #ccb1da;
  --raw-ccb7da: #ccb7da;
  --raw-cdb8df: #cdb8df;
  --raw-cf9ef5: #cf9ef5;
  --raw-cf9fff: #cf9fff;
  --raw-d0b8de: #d0b8de;
  --raw-d1adff66: #d1adff66;
  --raw-d1bfdc: #d1bfdc;
  --raw-d2b9f3: #d2b9f3;
  --raw-d34482: #d34482;
  --raw-d4a8ed16: #d4a8ed16;
  --raw-d4aaff: #d4aaff;
  --raw-d4b1ff: #d4b1ff;
  --raw-d4bbdf: #d4bbdf;
  --raw-d5c9e6: #d5c9e6;
  --raw-d6b7ff: #d6b7ff;
  --raw-d7b7ff99: #d7b7ff99;
  --raw-d7eafa: #d7eafa;
  --raw-d8b5f5: #d8b5f5;
  --raw-d8b6ff: #d8b6ff;
  --raw-d8c0e8: #d8c0e8;
  --raw-d9a63266: #d9a63266;
  --raw-dac0ff: #dac0ff;
  --raw-dac8ec: #dac8ec;
  --raw-dcbcff: #dcbcff;
  --raw-dcc5ec: #dcc5ec;
  --raw-ddbbff: #ddbbff;
  --raw-ddbfed: #ddbfed;
  --raw-ddc4ff: #ddc4ff;
  --raw-ddcce9: #ddcce9;
  --raw-dfd0f6: #dfd0f6;
  --raw-e0bcff66: #e0bcff66;
  --raw-e0cbea: #e0cbea;
  --raw-e1cdec: #e1cdec;
  --raw-e1e5ed: #e1e5ed;
  --raw-e485a2: #e485a2;
  --raw-e4c7f5: #e4c7f5;
  --raw-e4d3ff: #e4d3ff;
  --raw-e4d9f4: #e4d9f4;
  --raw-e5bcff: #e5bcff;
  --raw-e5c9ff: #e5c9ff;
  --raw-e7c9ff55: #e7c9ff55;
  --raw-e7cfff: #e7cfff;
  --raw-e7d0ff: #e7d0ff;
  --raw-e893b9: #e893b9;
  --raw-e8ceff: #e8ceff;
  --raw-e8d5fa: #e8d5fa;
  --raw-e8d9f6: #e8d9f6;
  --raw-ead1ff: #ead1ff;
  --raw-edceff55: #edceff55;
  --raw-eddcff: #eddcff;
  --raw-eea527: #eea527;
  --raw-efdcff: #efdcff;
  --raw-f0b7371c: #f0b7371c;
  --raw-f0e1ff: #f0e1ff;
  --raw-f2bf5a: #f2bf5a;
  --raw-f2e7ff: #f2e7ff;
  --raw-f3b73219: #f3b73219;
  --raw-f3ba3e: #f3ba3e;
  --raw-f4acbd: #f4acbd;
  --raw-f58daf: #f58daf;
  --raw-f7c53b: #f7c53b;
  --raw-f7d058: #f7d058;
  --raw-f7e6ff: #f7e6ff;
  --raw-f7eaff: #f7eaff;
  --raw-f87faa: #f87faa;
  --raw-faf8ff: #faf8ff;
  --raw-fc768a: #fc768a;
  --raw-ff71992e: #ff71992e;
  --raw-ff7faa: #ff7faa;
  --raw-ff858d: #ff858d;
  --raw-ff869a: #ff869a;
  --raw-ff91b0: #ff91b0;
  --raw-ff92a8: #ff92a8;
  --raw-ff9cbb: #ff9cbb;
  --raw-ffa5b5: #ffa5b5;
  --raw-ffa9c2: #ffa9c2;
  --raw-ffabb9: #ffabb9;
  --raw-ffabc6: #ffabc6;
  --raw-ffacc5: #ffacc5;
  --raw-ffadc9: #ffadc9;
  --raw-ffafc6: #ffafc6;
  --raw-ffafc8: #ffafc8;
  --raw-ffb0bf: #ffb0bf;
  --raw-ffb0c7: #ffb0c7;
  --raw-ffb5cc: #ffb5cc;
  --raw-ffba21: #ffba21;
  --raw-ffbbd1: #ffbbd1;
  --raw-ffc128: #ffc128;
  --raw-ffc1d6: #ffc1d6;
  --raw-ffc32e: #ffc32e;
  --raw-ffc333: #ffc333;
  --raw-ffc3d466: #ffc3d466;
  --raw-ffc53505: #ffc53505;
  --raw-ffc535e8: #ffc535e8;
  --raw-ffc792: #ffc792;
  --raw-ffc82e: #ffc82e;
  --raw-ffc83033: #ffc83033;
  --raw-ffca3b: #ffca3b;
  --raw-ffcb37: #ffcb37;
  --raw-ffcc32: #ffcc32;
  --raw-ffce43: #ffce43;
  --raw-ffcf3e: #ffcf3e;
  --raw-ffcf4115: #ffcf4115;
  --raw-ffcf46: #ffcf46;
  --raw-ffcfde: #ffcfde;
  --raw-ffd03335: #ffd03335;
  --raw-ffd13a12: #ffd13a12;
  --raw-ffd13e: #ffd13e;
  --raw-ffd1d8: #ffd1d8;
  --raw-ffd343: #ffd343;
  --raw-ffd3dc: #ffd3dc;
  --raw-ffd4a0: #ffd4a0;
  --raw-ffd65080: #ffd65080;
  --raw-ffd961: #ffd961;
  --raw-ffda4a: #ffda4a;
  --raw-ffda4b: #ffda4b;
  --raw-ffda4b30: #ffda4b30;
  --raw-ffda67: #ffda67;
  --raw-ffda69: #ffda69;
  --raw-ffdb63: #ffdb63;
  --raw-ffdb66: #ffdb66;
  --raw-ffdd59: #ffdd59;
  --raw-ffdd63: #ffdd63;
  --raw-ffdf59: #ffdf59;
  --raw-ffdf5b: #ffdf5b;
  --raw-ffdf5f: #ffdf5f;
  --raw-ffdf61: #ffdf61;
  --raw-ffdf611f: #ffdf611f;
  --raw-ffdf6a40: #ffdf6a40;
  --raw-ffdf6c: #ffdf6c;
  --raw-ffdf80: #ffdf80;
  --raw-ffe05d: #ffe05d;
  --raw-ffe06a: #ffe06a;
  --raw-ffe06b: #ffe06b;
  --raw-ffe0a2: #ffe0a2;
  --raw-ffe166: #ffe166;
  --raw-ffe16a: #ffe16a;
  --raw-ffe16a30: #ffe16a30;
  --raw-ffe187: #ffe187;
  --raw-ffe18b: #ffe18b;
  --raw-ffe190: #ffe190;
  --raw-ffe264: #ffe264;
  --raw-ffe266: #ffe266;
  --raw-ffe26b: #ffe26b;
  --raw-ffe292: #ffe292;
  --raw-ffe35e: #ffe35e;
  --raw-ffe367: #ffe367;
  --raw-ffe36b: #ffe36b;
  --raw-ffe36f: #ffe36f;
  --raw-ffe376cc: #ffe376cc;
  --raw-ffe467: #ffe467;
  --raw-ffe471: #ffe471;
  --raw-ffe47e: #ffe47e;
  --raw-ffe574: #ffe574;
  --raw-ffe57b: #ffe57b;
  --raw-ffe6ad: #ffe6ad;
  --raw-ffe894: #ffe894;
  --raw-ffe995: #ffe995;
  --raw-fff: #ffffff;
  --raw-fff2: #ffffff22;
  --raw-fff2a2: #fff2a2;
  --raw-fff6bd: #fff6bd;
  --raw-fff7b5: #fff7b5;
  --raw-fff7c0: #fff7c0;
  --raw-fff9: #ffffff99;
  --raw-ffffff04: #ffffff04;
  --raw-ffffff05: #ffffff05;
  --raw-ffffff08: #ffffff08;
  --raw-ffffff0d: #ffffff0d;
  --raw-ffffff0e: #ffffff0e;
  --raw-ffffff10: #ffffff10;
  --raw-ffffff15: #ffffff15;
  --raw-ffffff1c: #ffffff1c;
  --raw-ffffff40: #ffffff40;
  --raw-ffffff60: #ffffff60;
}
```

# Sistema de movimiento y composición

- Inicio: imagen del hero respira9s; hover de imágenes .35s; pulsación táctil con relieve. No mover textos de lectura constantemente.
- Entrada VS: A .48s desde-35px/rotación-3°/escala.94; B .48s con retraso.1s desde+35px/+3°; VS .52s con retraso.16s desde escala.3/rotación-25° a-7°. Ambos .4s con retraso.22s. La pregunta entra .35s.
- Voto: respuesta visual inmediata de selección y spinner; `party-pick` .45s con escalas1→.975→1.012→1. El resultado espera confirmación real del POST. La respuesta ya contiene counts/total y evita un segundo refresh bloqueante.
- Veredicto: banner .48s; tarjetas .4s con retrasos.12/.21/.30s; barras .7s con retraso.35s; cifras y recompensa pop.45/.5s. Confeti .95s por partícula con delay índice×.025s, colores amarillo/cian/rosa.
- Siguiente:4000ms, actualización50ms, barra scaleX(restante/4000), pausa manual, pestaña oculta y diálogos. No avanzar durante lectura/compartir. Nuevo caso monta otra entrada de tarjetas.
- Crear: transición horizontal±18px .32s según dirección. Progreso .4s. Check de defensa .3s; panel completo .5s; CTA listo .35s.
- Choque A/B: duración.94s, fichas desde±105px y±19°, contacto al44% en±43px con escala1.04/.96, retroceso al57%, asentamiento al76%, rotaciones finales±7°. VS aparece después del38%, pico escala1.25 al55%. Anillo .42s desde.39s, glow .4s desde.38s, pequeño temblor del contenedor. No cambiar por dos fichas que simplemente flotan.
- Publicado: emblema llega.45s; puerta cerrada rotaY(-80deg) en.65s con delay.25s, puerta abierta aparece.65s con delay.4s, check .4s con delay.8s. Emblema112×112px, radio25px; cerrado se oculta en reduced-motion.
- Diálogos: opacidad .18s. El contenedor de anclaje no debe animarse con translate/scale: fue causa de desbordamiento.
- Preferencias: `prefers-reduced-motion:reduce` y `html[data-motion=off]`; revisar reglas completas entregadas. Sonido opcional por WebAudio, apagado inicialmente. No hay archivos de audio omitidos.

## Presupuesto espacial real del VS

Viewport100dvh; shell480px máximo; padding superior10px+safe-area, laterales14px, inferior max(8px,safe-area). Toolbar44px + margen10px. Pregunta21–27px, resumen3 líneas; prueba60×66px opcional. El resto se reparte A / unión30px / B en filas `minmax(0,1fr)`. Cabeceras62px, argumentos16px/1.28. Ambos68px más márgenes; pie40px. A altura≤700px, cabeceras49px, unión28px, Ambos58px y márgenes reducidos. Las seis defensas largas NO caben siempre en todos los móviles: se conserva scroll interno, que es una limitación conocida a revisar. No volver a paginarlas con botones1/2/3.

## Tipografía y escala

Titan One400 para titulares/acciones; Nunito Sans400/600/700/800/900/1000 para cuerpo. Google Fonts con display=swap. Fallback Arial Black para display y Arial para cuerpo. Menú clamp(23px,6.5vw,32px), peso400, line-height1.13, stroke.7px #2b123e, sombra0 3px 0 #2b123e. No poner weight900 a Titan One para simular otra fuente. La escala de spacing4/8/12/16/20/24/32/40/48 es un esquema de integración; el código contiene ajustes ópticos7/9/10/11/13/14/15/17px, documentados íntegros en ESTILOS-EXACTOS.md, que no deben redondearse indiscriminadamente.


# 4. Inventario completo

# Inventario de componentes

Estados: **normal** = apariencia de reposo; **pulsado** = feedback durante el toque; **deshabilitado** = no permite actuar; **bloqueado** = restricción persistente de permisos o desbloqueo. “No diseñado” no equivale a que el navegador no pueda deshabilitarlo. Los estados seleccionados y de carga se documentan aparte. Los selectores y valores completos están en ESTILOS-EXACTOS.md.

| Pieza / implementación | Normal | Pulsado | Deshabilitado | Bloqueado / otros estados |
|---|---|---|---|---|
| Botón principal `.game-btn.yellow` | Titan One, amarillo en degradado, borde2px, radio12px, bisel5px | Traslación vertical; reglas exactas dependen de contexto | Opacidad .65 global, .45 en creador; evita envío duplicado | No se diseñó candado propio; autenticación abre modal |
| Botón secundario `.creator-secondary` | Violeta, contorno2px, relieve4px, mín48px | translateY(2px), relieve2px | Hereda opacidad global | No diseñado |
| Acción discreta `.quiet-btn` | Texto y posible icono; mínimo44px en contextos móviles | Transición global, sin estado especial uniforme | HTML disabled cuando procede | No diseñado |
| Botón de icono / toolbar |42×42px, violeta, borde2px, radio12px | Transición global; sin relieve pulsado propio uniforme | Hereda disabled | No diseñado; filtro activo añade punto amarillo |
| Logo ZANJA / etiqueta beta | Marca tipográfica con rayo y amarillo | No específico | No aplica | No aplica |
| Reiniciar DEV `.dev-reset` | Contorno discontinuo, junto al logo | Sin estado específico | Opacidad .5 mientras busy | Sin control de rol dev; temporal, eliminar antes de producción |
| Cinta de reto `.mission-tile` | Progreso de cinco segmentos; icono y contador | Sin estado específico propio | No diseñado | Segmentos completados amarillos; sin bloqueo |
| Hero Juzgado `.mobile-lobby-hero` | Imagen arena-menu.webp, marco y titular; CTA separado | Lo gestiona CTA | Lo gestiona CTA | No diseñado |
| Caso del día `.daily-feature` | Imagen integrada; pregunta sobre fondo, sin recuadro inferior | translateY(3px), sombra2px | No específico | No diseñado |
| Tile Mis zanjas / Crear zanja `.home-shortcut` | Imagen, mismo titular, flecha abajo derecha38px; Crear amarillo | translateY(3px), sombra2px | No específico | No diseñado |
| Navegación inferior `.mobile-nav` | Cinco posiciones; crear central elevado | Crear baja de -8 a -4px | No específico | Activa amarilla con marca superior; sin bloqueo |
| Chip nivel / etiqueta / estado | Superficie y color según nivel/estado | No interactivo por sí mismo | No aplica | Etiquetas waiting/ready/closed/review, no candado visual general |
| Pregunta VS `.duel-prompt` | Titan One21–27px, máximo3 líneas en resumen | No aplica | No aplica | Leer contexto/pregunta completa abre diálogo; no ocultar texto sin alternativa |
| Miniatura de prueba `.case-photo` |60×66px, borde2px, etiqueta Prueba | Sin variante propia | No se muestra si falta prueba | Restricciones/errores de acceso en visor |
| Tarjeta votable A/B `.vote-team`, `.team-vote` | Azul/cian o rosa/coral; tres defensas; fondo energético en cabecera | Brillo1.14; selección animada .45s | Conserva opacidad1 y deja de actuar | Propietario/participante/caso no abierto: voto impedido; no candado dibujado. Selección borde amarillo, spinner al enviar, check al confirmar |
| Defensa enumerada `.vote-argument` | Nunito Sans16px/800, número en placa23px | No control independiente | No aplica | Las tres visibles en el mismo contenedor; scroll interno si no caben |
| Sello VS `.battle-vs` |44×33px, amarillo, rotación-7° | No interactivo | No aplica | Entrada con escala/rotación; sin bloqueo |
| Tercera opción Ambos `.vote-both` | Violeta ilustrado,68px (58px compacto), título26px y explicación | translateY(3px), sombra2px | Opacidad1 y no actúa | Misma lógica de elegibilidad/selección que A/B |
| Saltar zanja `.battle-footer` | Centrado abajo, mínimo40px | Sin variante específica | Mientras voto pendiente | Cambia por invitar/completar/ver resultado según caso |
| Cabecera veredicto `.verdict-banner` | Fondo energético, pregunta, confirmación y recompensa | No aplica | No aplica | Marca voto registrado solo con respuesta válida |
| Tarjeta porcentaje `.verdict-card` | A azul, Ambos violeta, B rosa; número grande y barra | No interactiva | No aplica | Elección propia borde dorado; cero votos visible; recuentos ocultos según permisos |
| Barra Progress | Fondo oscuro, relleno de color por contexto | No aplica | No aplica | Transición .6s resultados; no progreso ficticio |
| Siguiente / NextCountdown | Acción amarilla,4s, barra que se vacía | Hereda botón principal | Pausado no equivale a disabled | Pausa/reanuda; se detiene con documento oculto o diálogo abierto; siguiente manual disponible |
| Confeti `.party-burst` | No visible en reposo | Se dispara con resultado nuevo | Desaparece con movimiento reducido | Sin bloqueo |
| Cabecera del creador | Atrás, título, cerrar; cuatro etapas | Botones de icono | Busy evita acciones conflictivas | Volver depende de paso/ruta; no confundir atrás con cerrar |
| Progreso creador `.creator-progress` | Cuatro segmentos y etiquetas | No clickable | No aplica | Etapa actual y completadas; no navegación directa arbitraria |
| GrowingTextarea / relato | Fondo morado,16px, crece con contenido; alto185–290px inicial | Focus amarillo | Envío/carga según pantalla | Story readonly al pasar a defensas; no textarea editable en paso2 |
| Panel relato `.creator-account` | Mín135px, texto19px/900, etiqueta18px | No interactivo | No aplica | Solo lectura; min115px y texto18px en alturas<700px |
| DefenseFields A/B | Tres campos, azul o rosa, placeholders ordinales | Focus; check de longitud válido | CTA deshabilitado hasta tres defensas válidas | Longitud12–160 y distintas; error de duplicado; check individual no garantiza validez del conjunto |
| EvidenceField | Subir opcional, preview, cambiar/eliminar | Acciones ordinarias | Procesamiento de imagen impide envío | Formato/tamaño/error de lectura y reintento |
| CreatorClash | Fichas A y B; B pendiente opaca/discontinua | No interactivo | No aplica | Entrada, choque, rebote, anillo; B completa añade check |
| Opciones de ruta B | Enviar invitación amarillo; Añadir defensa de B aquí violeta; sin iconos | Estados de ambos botones | Busy | Invitación pendiente/aceptada; autor no reescribe defensa remota |
| Tarjeta de audiencia | Dos opciones; público o enlace | scale(.97) | No específico | Seleccionada borde amarillo; no paywall |
| Duración | Tres opciones15min,1h,24h | scale(.97) | No específico | Seleccionada amarilla; sin bloqueo |
| Selector tema | Select con fuente16px | Control nativo/focus | No específico | No diseñado |
| Publicación `.case-opening` | Emblema112px, puerta dorada | No interactivo | No aplica | Puerta cerrada gira y revela abierta; check final; versión estática con movimiento reducido |
| Tarjeta Mis zanjas `.saved-case` | Pregunta, estado, acciones | Botones internos | Según estado/permiso | Incompleta: completar; esperando: invitar; lista: publicar; cerrada: resultados; revisión: restringida |
| Pestañas creadas/votadas | Selector de dos vistas | Estado global | No específico | Seleccionada; sin bloqueo |
| Medalla/estadísticas perfil | Nivel,XP, votos,creaciones | No interactivo | No aplica | Datos reales; no recompensa por seguir mayorías |
| Logro `.achievement` | Tarjeta e icono | No interactivo | No aplica | Sí: candado y POR DESCUBRIR; conseguido cambia clase a unlocked |
| Diálogo / bottom sheet | Portal viewport fijo; ancho≤480; alto≤viewport | Cierre con botón/acciones | Acciones busy cuando procede | Focus/escape suministrados por primitives; QA pendiente |
| Visor EvidenceViewer | Imagen contain, panel ancho≤720px | Cerrar/reintentar | Carga | Error, reintento, permisos; imagen ausente no crea botón vacío |
| Filtros | Panel con temas y recuentos | Selección | No específico | Activo en toolbar; no fila permanente consumiendo alto |
| Denuncia | Motivos tipificados y enviar | Acción principal | Sin motivo o busy | Login requerido; tres denunciantes distintos ocultan caso |
| Confirmar retirada | AlertDialog con Volver/Retirar | Botones de primitive | Busy | Solo propietario; acción irreversible |
| Ajustes | Switch sonido/movimiento | Primitive switch | No específico | Preferencia local; movimiento reducido del sistema prevalece |
| Compartir/copiar | Diálogo de enlace y acciones | Botones conocidos | Busy según flujo | Éxito copiado, error clipboard y cancelación share |
| Login | Diálogo con enlace de autenticación | Botón principal | No específico | Invita a autenticarse; no pantalla propia de credenciales |
| Toast/error/conexión | Mensaje visible según resultado | Reintentar/cerrar según contexto | No específico | Error de red/carga/voto no inventa éxito |
| Estado vacío | Título, explicación y acción | Botón conocido | No específico | Cola agotada, filtro vacío, historial vacío |

## Primitivas incluidas que no equivalen a diseño de producto

`components/ui` contiene componentes del starter. Muchos no aparecen en ninguna pantalla. Sus estados de biblioteca no constituyen una aprobación estética de ZANJA. Se entregan íntegros para que resuelvan imports; revisar uso antes de trasladarlos todos. Para cada uno, pulsado/deshabilitado/bloqueado de producto **no diseñado específicamente**, salvo las piezas descritas arriba.

- `accordion.tsx` — implementación completa en `codigo/components/ui/`.
- `alert-dialog.tsx` — implementación completa en `codigo/components/ui/`.
- `alert.tsx` — implementación completa en `codigo/components/ui/`.
- `aspect-ratio.tsx` — implementación completa en `codigo/components/ui/`.
- `attachment.tsx` — implementación completa en `codigo/components/ui/`.
- `avatar.tsx` — implementación completa en `codigo/components/ui/`.
- `badge.tsx` — implementación completa en `codigo/components/ui/`.
- `breadcrumb.tsx` — implementación completa en `codigo/components/ui/`.
- `bubble.tsx` — implementación completa en `codigo/components/ui/`.
- `button-group.tsx` — implementación completa en `codigo/components/ui/`.
- `button.tsx` — implementación completa en `codigo/components/ui/`.
- `calendar.tsx` — implementación completa en `codigo/components/ui/`.
- `card.tsx` — implementación completa en `codigo/components/ui/`.
- `carousel.tsx` — implementación completa en `codigo/components/ui/`.
- `chart.tsx` — implementación completa en `codigo/components/ui/`.
- `checkbox.tsx` — implementación completa en `codigo/components/ui/`.
- `collapsible.tsx` — implementación completa en `codigo/components/ui/`.
- `combobox.tsx` — implementación completa en `codigo/components/ui/`.
- `command.tsx` — implementación completa en `codigo/components/ui/`.
- `context-menu.tsx` — implementación completa en `codigo/components/ui/`.
- `dialog.tsx` — implementación completa en `codigo/components/ui/`.
- `direction.tsx` — implementación completa en `codigo/components/ui/`.
- `drawer.tsx` — implementación completa en `codigo/components/ui/`.
- `dropdown-menu.tsx` — implementación completa en `codigo/components/ui/`.
- `empty.tsx` — implementación completa en `codigo/components/ui/`.
- `field.tsx` — implementación completa en `codigo/components/ui/`.
- `form.tsx` — implementación completa en `codigo/components/ui/`.
- `hover-card.tsx` — implementación completa en `codigo/components/ui/`.
- `input-group.tsx` — implementación completa en `codigo/components/ui/`.
- `input-otp.tsx` — implementación completa en `codigo/components/ui/`.
- `input.tsx` — implementación completa en `codigo/components/ui/`.
- `item.tsx` — implementación completa en `codigo/components/ui/`.
- `kbd.tsx` — implementación completa en `codigo/components/ui/`.
- `label.tsx` — implementación completa en `codigo/components/ui/`.
- `marker.tsx` — implementación completa en `codigo/components/ui/`.
- `menubar.tsx` — implementación completa en `codigo/components/ui/`.
- `message-scroller.tsx` — implementación completa en `codigo/components/ui/`.
- `message.tsx` — implementación completa en `codigo/components/ui/`.
- `native-select.tsx` — implementación completa en `codigo/components/ui/`.
- `navigation-menu.tsx` — implementación completa en `codigo/components/ui/`.
- `pagination.tsx` — implementación completa en `codigo/components/ui/`.
- `popover.tsx` — implementación completa en `codigo/components/ui/`.
- `progress.tsx` — implementación completa en `codigo/components/ui/`.
- `radio-group.tsx` — implementación completa en `codigo/components/ui/`.
- `resizable.tsx` — implementación completa en `codigo/components/ui/`.
- `scroll-area.tsx` — implementación completa en `codigo/components/ui/`.
- `select.tsx` — implementación completa en `codigo/components/ui/`.
- `separator.tsx` — implementación completa en `codigo/components/ui/`.
- `sheet.tsx` — implementación completa en `codigo/components/ui/`.
- `sidebar.tsx` — implementación completa en `codigo/components/ui/`.
- `skeleton.tsx` — implementación completa en `codigo/components/ui/`.
- `slider.tsx` — implementación completa en `codigo/components/ui/`.
- `sonner.tsx` — implementación completa en `codigo/components/ui/`.
- `spinner.tsx` — implementación completa en `codigo/components/ui/`.
- `switch.tsx` — implementación completa en `codigo/components/ui/`.
- `table.tsx` — implementación completa en `codigo/components/ui/`.
- `tabs.tsx` — implementación completa en `codigo/components/ui/`.
- `textarea.tsx` — implementación completa en `codigo/components/ui/`.
- `toggle-group.tsx` — implementación completa en `codigo/components/ui/`.
- `toggle.tsx` — implementación completa en `codigo/components/ui/`.
- `tooltip.tsx` — implementación completa en `codigo/components/ui/`.


# 5. Pantallas, decisiones y pendientes

# Estado de pantallas y decisiones

## Criterio de estado y procedencia de capturas

“Terminada” significa implementada en este prototipo, no validada en todos los móviles ni lista para producción. **A medias** se usa donde quedan problemas conocidos o validación crítica. No se dispone de capturas verificadas del último commit: el navegador de previsualización del entorno no estuvo disponible. Las imágenes siguientes son históricas aportadas por el usuario o referencias de otro diseño. No deben usarse para contradecir el código actual. No se ha fabricado una captura de la última versión.

| Pantalla | Estado | Captura disponible |
|---|---|---|
| Inicio / lobby | Terminada en código; QA móvil pendiente | Histórica: `capturas-historicas/image(20260923-225132).png`; anterior a reset DEV |
| Caso del día | Terminada; abre el mismo Juzgado con el caso diario | Sin captura actual independiente; comparte VS |
| Juzgado / VS | A medias: implementación completa, encaje y scroll interno pendientes de verificar | Histórica: `capturas-historicas/43952e56-0b27-441a-84de-89d4c0d0c84b.png`; composición superada |
| Resultado / Tu veredicto | Terminada en código; QA animación pendiente | Histórica: `capturas-historicas/4c5e43e7-146f-4c35-99a8-c403e1fef14d.png`; el resultado actual usa tres tarjetas coloreadas |
| Crear1 · relato y prueba | Terminada en código | Referencia de OTRO diseño: `capturas-historicas/8d11a30b-187f-4c8f-91f6-c46b98303299.png` |
| Crear2 · Defensa de Bando A | Terminada en código; textos largos pueden necesitar desplazamiento | Histórica propia: `capturas-historicas/image(20260924-184500).png`; antes de quitar edición del relato y ampliarlo |
| Crear3 · invitar o responder B aquí | Terminada en código | Referencia de OTRO diseño: `capturas-historicas/f7038a11-4594-40de-8b76-214671e7dad7.png` |
| Compartir invitación | Terminada en código | Referencia de OTRO diseño: `capturas-historicas/e6de1de9-b90a-4ee9-a211-25aac3024554.png` |
| B desde enlace | Terminada en código; probar dos identidades reales | Referencia de OTRO diseño: `capturas-historicas/7b0766f6-af39-4d11-93d3-d9f1cbeef1d6.png` |
| B en este dispositivo, modo solo | Terminada en código | Sin captura propia actual; comparte DefenseFields |
| Esperando a B / listo para publicar | Terminada en código | Sin captura actual |
| Crear4 · audiencia y duración | Terminada en código | Referencia de OTRO diseño: `capturas-historicas/c953a7e0-dd55-4647-a005-d056cecc2cd5.png`; no reproducir su desbordamiento horizontal |
| Caso publicado | Terminada en código; animación de puerta pendiente de inspección real | Histórica parcial propia: `capturas-historicas/image(20260924-195910).png`; icono reemplazado. Referencia externa: `capturas-historicas/c3ddcb7d-7742-435d-ba26-d8a603511178.png` |
| Mis zanjas creadas/votadas | Terminada en código | Sin captura recuperada |
| Perfil / logros | Terminada en código | Sin captura recuperada |
| Filtros / denuncia / ajustes / reglas / login / retirada | A medias: implementados; confirmar portales en móviles reales | Sin captura actual |
| Visor de prueba / subir-cambiar-eliminar | A medias: implementado y validaciones de servidor; falta QA en enlace público/dispositivo | Sin captura actual |
| Lectura de contexto y seis defensas | Terminada en código | Sin captura actual |
| Cola agotada / vacío / errores | Terminada en código | Sin captura actual |
| Panel administrativo de moderación y apelación | Sin empezar | No existe |
| Push / app nativa iOS-Android / offline completo | Sin empezar | No existe |

## Galería histórica propia (no estado final)

### Inicio
![Inicio histórico](capturas-historicas/image(20260923-225132).png)

### VS anterior
![VS histórico](capturas-historicas/43952e56-0b27-441a-84de-89d4c0d0c84b.png)

### Veredicto anterior
![Veredicto histórico](capturas-historicas/4c5e43e7-146f-4c35-99a8-c403e1fef14d.png)

### Defensa A antes de la última modificación
![Defensa A histórica](capturas-historicas/image(20260924-184500).png)

## Estructura y razones

1. **App móvil primero.** Marco de480px máximo y100dvh; en escritorio se conserva la composición de teléfono. Sigue siendo web/PWA, no aplicación nativa. Áreas seguras con env(safe-area-inset-*). No confundir viewport fijo con obligación de cortar contenido accesible.
2. **Inicio, Juzgado, Crear, Mis zanjas y Perfil.** Inicio reúne reto breve, Juzgado, Caso del día y dos tiles. Progreso detallado y logros van al perfil. La acción de crear queda disponible en el centro de la navegación inferior. Evitamos un catálogo de modos en el lobby.
3. **Arena pasa a Juzgado y A jugar pasa a ¡A ZANJAR!** Se conserva `arena` como identificador interno. Se elimina subtítulo bajo el CTA y se reduce el hero. Los títulos del menú comparten Titan One, tamaño responsive, contorno y sombra. El amarillo distingue Crear y la acción principal.
4. **Caso del día sin icono lateral ni cajita inferior.** Pregunta sobre la ilustración; flecha en recuadro grande abajo derecha. También se quitó el icono de la etiqueta Juzgado. Crear conserva el mismo tipo de sombra estructural de los otros tiles.
5. **Quitar permanentemente la coletilla rechazada por el usuario.** No reincorporarla en nuevas pantallas ni textos de onboarding. Se suprimieron etiquetas Amigos/Dilema de ejemplo de la cabecera VS y descripciones inventadas debajo del nombre de cada bando.
6. **VS es pantalla de partida.** Oculta cabecera y navegación del lobby; arriba volver/título/denunciar/filtros. Los filtros pasan a un panel. Pregunta directamente debajo, prueba opcional como miniatura contextual. A y B verticales con tres defensas, VS en la unión, Ambos como tercera tarjeta violeta con presencia propia y saltar centrado abajo.
7. **Voto en tarjetas.** No dock redundante A/Ambos/B. No carrusel de defensas con controles1/2/3: se muestran las tres. Los números visibles son índices de argumentos, no botones. Ambos cuenta en el mismo denominador y tiene los mismos permisos, unicidad y XP.
8. **Ilustración integrada, no pegotes cuadrados.** Energía abstracta en los fondos VS, máscara degradada, cover y color por bando. Se retiraron los guantes de VS. El hero de Inicio conserva su arte histórico de mazo y guantes; la petición de retirarlos se aplicó a los nuevos fondos de VS.
9. **Prueba gráfica opcional.** Si no existe no aparece control vacío en VS. Si existe, miniatura abre visor; disponible también al responder B y en resultados. La prueba del caso editorial de diseño utiliza una captura real aportada como ejemplo, no pretende ser prueba factual de otro conflicto.
10. **Resultado vivo y útil.** Tres tarjetas coherentes con el duelo, propio voto, recuento real y recompensa. Cuenta atrás4s con barra que se vacía, pausable. No sustituye respuesta de servidor por porcentajes inventados para aparentar velocidad.
11. **Creación de cuatro pasos basada en el flujo de referencia, estética nueva.** Relato → tres defensas A → invitar B o escribir B aquí → audiencia/duración y publicar. Se conserva el relato exacto y solo se editan defensas en paso2. No se está usando IA para reescribir u ordenar el relato.
12. **Invitación independiente.** B ve relato/prueba pero no defensas A. Con el flujo nuevo, responder deja listo para que A publique; el reloj comienza al publicar. El modo de escribir ambas partes en el mismo dispositivo se identifica como relato de una sola persona.
13. **Últimos cambios ya en código.** Reset temporal junto al logo; eliminado dictado; textarea inicial más grande; relato readonly más grande en paso2; placeholders ordinales; invitación amarilla primero y B aquí después sin iconos; quitadas las dos confirmaciones del creador; emblema de publicación con puerta que se abre. La confirmación propia de B invitado sigue existiendo.
14. **Menos pantallas prematuras.** Debate semanal por fases, pestaña Actividad y moderación desbloqueada por XP quedaron fuera. No existen logros por votar con la mayoría. No agregar botones decorativos sin función.

## Lo pendiente y las contradicciones a resolver

- **QA móvil real**:320/360/390/430px de ancho; alturas568/667/740/844/932px; Safari iOS, Chrome Android, teclado abierto, zoom y fuente ampliada. No se certifica ausencia absoluta de scroll: el código tiene overflow-y:auto en defensas, creador y resultados. La prioridad del usuario es evitar scroll innecesario, no perder textos largos.
- **Portales**: comprobar filtros, denuncia, prueba, lectura, compartir y cerrar/volver, especialmente al abrir uno desde otro. Se cambió el anclaje a un viewport flex fijo para evitar transformaciones que sacaban el diálogo de pantalla.
- **Navegación**: probar atrás desde cada paso, rama B local, invitación remota pendiente/lista y éxito. La navegación principal usa estado React y query case/invite; no hay una ruta real por pantalla ni integración completa con botón Atrás del sistema operativo.
- **Textos heredados**: `PRODUCT_DECISIONS.md` es una cronología parcial, no especificación actual. Habla de tres pasos, falta de fotos, versión privada, Ambos en unión y defensas paginadas; todo eso fue superado. Metadata aún menciona Arena y un modal antiguo de éxito menciona beta privada; reglas conserva A JUGAR. Limpiar al integrar. Este HANDOFF prevalece para la intención actual; el código manda sobre lo efectivamente implementado.
- **Código heredado**: quedan funciones/estados y CSS antiguos en page.tsx y estilos. No eliminar reglas por parecido sin comprobar precedencia. Exportamos tal cual para no alterar silenciosamente la versión entregada.
- **Reset DEV**: limpia votos del usuario y saltos locales para poder repetir; no borra casos ni reinicia votos de todos. Sigue siendo un control temporal accesible en Inicio. Retirar o proteger con un entorno/rol real de desarrollo.
- **Moderación**: ocultación automática por tres denunciantes distintos, sin consola administrativa ni apelaciones. No confundir estar implementado con tener operación de moderación completa.
- **Audiencia por enlace**: es un caso no listado con identificador impredecible; no un grupo privado con ACL de miembros. Adaptar al modelo del backend real.
- **Autenticación**: depende de Sites; portar sesiones/permisos al servidor real. No aceptar una cabecera de identidad arbitraria enviada por el cliente.
- **Imágenes en público**: confirmar que el caso demo con evidenceUrl está en los datos servidos y que los casos privados subidos resuelven permisos/R2. Una miniatura visible en preview no prueba el funcionamiento fuera de él.
- **Tipografías externas**: se cargan de Google Fonts; si falla la red hay fallback y cambia el encaje. No hay fuentes WOFF locales en este paquete. Para uso offline/alojamiento propio obtener binarios y licencias correspondientes.
- **Accesibilidad**: reducir movimiento y permitir lectura completa están contemplados; falta auditoría con lector de pantalla, focus/teclado y contraste real de texto sobre imagen. Algunos controles son42px y no44px. No afirmar conformidad certificada.
- **No implementado**: backend IA de redacción, dictado (retirado), notificaciones push, sincronización de borrador multidispositivo, offline completo, empaquetado nativo, paginación más allá del límite actual de listados, analítica de producto y gestión administrativa.
- **Prompts y capturas**: no están conservados todos los prompts exactos ni capturas finales. Se entregan las ausencias explícitas y no reconstrucciones presentadas como originales.


# Anexo: archivos de imagen y procedencia

# Ilustraciones, iconos y prompts

Los archivos se copian sin recomprimir ni eliminar alfa. Se incluyen todos los originales disponibles, versiones intermedias y recursos retirados. Resolución máxima disponible no significa resolución nativa garantizada del modelo. No se ha generado ningún recurso nuevo para disimular ausencias.

Los originales no contienen metadatos de prompt. Solo se conserva el prompt exacto de `court-energy.webp`; el resto figura como no recuperado. Las capturas aportadas por el usuario no son ilustraciones generadas.

## imagenes/generated_images/exec-0e6c2c45-d10e-4810-9e43-17ce830af304.png

- **resolucion:** 1536×1024
- **bytes:** 2122429
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** RETIRADA · guante A, no usar en VS · original
- **tamano mostrado:** Antiguo:180×120px; no se muestra actualmente
- **original:** 
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** 9957723a395a8fda9f77f40ff1b905f9e3bf83213638901061f1737d9f7e62f1

## imagenes/generated_images/exec-1d0d2b4a-7a2d-4498-8412-fd7832001a6a.png

- **resolucion:** 862×1824
- **bytes:** 1624293
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** Mockup VS dos columnas, propuesta histórica, no integrar como UI
- **tamano mostrado:** No se integra este archivo directamente; usar derivado public/
- **original:** 
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** 535dfbab05964f1e0eada9cdf6ed3dc954f19d1cb337db0b8950b5874dc488f8

## imagenes/generated_images/exec-23ea9961-0683-4bed-8105-cb0d43634c77.png

- **resolucion:** 1536×1024
- **bytes:** 1805294
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** VS · cabeceras A/B y Ambos; veredicto y creación · fondos · original
- **tamano mostrado:** Cabeceras:100% ×62px (49px compacto); Ambos:100% ×68px (58px compacto). Cover; no miniatura cuadrada. En paneles cover adaptable.
- **original:** 
- **prompt exacto:** Create one landscape seamless-feeling background asset for a polished casual mobile game UI. Generic abstract 3D illustrated energy stage, glossy violet faceted planes and sweeping soft purple light rays, sparse glowing particles. Deep dark purple left half with generous quiet negative space for separately rendered interface text, subtle brighter violet lighting on right. Colorful saturated high-quality mobile videogame aesthetic, beveled surfaces, soft bloom. Background only, no focal object. NO gloves, hands, people, weapons, trophy, badge, text, letters, numbers, logos or UI. 1536x1024. Save generated asset for application integration.
- **sha256:** 69a1b93a03df3cf3716d9d9261934ef2227e7b0fd4a3ce5e12092251f91c23d7

## imagenes/generated_images/exec-9ae6f8d8-50d9-4fb4-9879-baabcebbc807.png

- **resolucion:** 863×1823
- **bytes:** 2373278
- **transparencia:** Canal alfa conservado; rango (13, 253)
- **pantalla y sitio:** Mockup VS dos columnas, propuesta histórica, no integrar como UI
- **tamano mostrado:** No se integra este archivo directamente; usar derivado public/
- **original:** 
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** 41069c85c19d14558a7f824a40f012b29624ce01bff80148cd150b8644b3ecd8

## imagenes/generated_images/exec-a0374508-e5b4-47dc-b1e3-615c79007b09.png

- **resolucion:** 1254×1254
- **bytes:** 1711846
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** Inicio · tile Crear zanja, fondo amarillo · original
- **tamano mostrado:** 100% del tile; cover; centro 29%; dos columnas de ancho flexible
- **original:** 
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** 588aeffd5fbe0b447071d41720ab9bba8c2683e51ea61f012eace01dc7e7a950

## imagenes/generated_images/exec-a0501da7-dcd2-4ead-8f28-340ac693fbf6.png

- **resolucion:** 1536×1024
- **bytes:** 2085162
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** RETIRADA · guantes A+B, no usar en VS · original
- **tamano mostrado:** Antiguo:170×113px; no se muestra actualmente
- **original:** 
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** 00a9625ade3c6a698692e7557dfc825b8973831d4b94bd55e966627e90084535

## imagenes/generated_images/exec-aabd61c6-2b83-4320-8ed5-35ef9e805fbd.png

- **resolucion:** 1536×1024
- **bytes:** 1953230
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** RETIRADA · guante B, no usar en VS · original
- **tamano mostrado:** Antiguo:180×120px; no se muestra actualmente
- **original:** 
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** c3063552809c2b498fe41a334b71421af1dcfde28aa76f5aab9699169b0a7246

## imagenes/generated_images/exec-ade0b277-a552-480d-b847-494f6e04482d.png

- **resolucion:** 1536×1024
- **bytes:** 1927119
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** Inicio · imagen del Juzgado, bajo titular y encima del CTA · original
- **tamano mostrado:** 100% de .lobby-scene, alto flexible; object-fit:cover; centro 52%
- **original:** 
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** c69701d75b424ecaf02424610d3336a99531b5ab345332efbd6920da7c534387

## imagenes/generated_images/exec-b30ffa0c-1b2a-4ec7-a132-fc07c481312d.png

- **resolucion:** 863×1822
- **bytes:** 1601637
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** Mockup vertical de VS, propuesta histórica, no integrar como UI
- **tamano mostrado:** No se integra este archivo directamente; usar derivado public/
- **original:** 
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** c4c9d7d7ad243dd3953ae4c73192877b9327ea133476c2bff6e7d0bc7803b092

## imagenes/generated_images/exec-dd73715d-0f5b-49a0-a10c-156c276f8728.png

- **resolucion:** 1254×1254
- **bytes:** 1776595
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** Inicio · tile Mis zanjas · original
- **tamano mostrado:** 100% del tile; cover; centro 29%; dos columnas de ancho flexible
- **original:** 
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** 164fb2fde267d135b25bd941b059f37258982c47641976a067fc479883b37e3d

## imagenes/generated_images/exec-ff0c83e3-8303-42ef-9ceb-ace3a42226d9.png

- **resolucion:** 1536×1024
- **bytes:** 1786755
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** Inicio · fondo de Caso del día · original
- **tamano mostrado:** 100% ancho/alto de .daily-feature; cover; degradado CSS a la izquierda
- **original:** 
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** 135774518ac29871fe9bb8cf4ad5e1bf18777a1e106727f2d3dafd36fb926e0b

## imagenes/assets/create-case-art.png

- **resolucion:** 1254×1254
- **bytes:** 1711846
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** Inicio · tile Crear zanja, fondo amarillo · original
- **tamano mostrado:** 100% del tile; cover; centro 29%; dos columnas de ancho flexible
- **original:** 
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** 588aeffd5fbe0b447071d41720ab9bba8c2683e51ea61f012eace01dc7e7a950

## imagenes/assets/daily-art.png

- **resolucion:** 1536×1024
- **bytes:** 1786755
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** Inicio · fondo de Caso del día · original
- **tamano mostrado:** 100% ancho/alto de .daily-feature; cover; degradado CSS a la izquierda
- **original:** 
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** 135774518ac29871fe9bb8cf4ad5e1bf18777a1e106727f2d3dafd36fb926e0b

## imagenes/assets/my-cases-art.png

- **resolucion:** 1254×1254
- **bytes:** 1776595
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** Inicio · tile Mis zanjas · original
- **tamano mostrado:** 100% del tile; cover; centro 29%; dos columnas de ancho flexible
- **original:** 
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** 164fb2fde267d135b25bd941b059f37258982c47641976a067fc479883b37e3d

## imagenes/assets/zanja-arena-hero.png

- **resolucion:** 1536×1024
- **bytes:** 1927119
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** Inicio · imagen del Juzgado, bajo titular y encima del CTA · original
- **tamano mostrado:** 100% de .lobby-scene, alto flexible; object-fit:cover; centro 52%
- **original:** 
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** c69701d75b424ecaf02424610d3336a99531b5ab345332efbd6920da7c534387

## imagenes/menu-originals/arena.png

- **resolucion:** 1536×1024
- **bytes:** 1927119
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** Inicio · imagen del Juzgado, bajo titular y encima del CTA · original
- **tamano mostrado:** 100% de .lobby-scene, alto flexible; object-fit:cover; centro 52%
- **original:** 
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** c69701d75b424ecaf02424610d3336a99531b5ab345332efbd6920da7c534387

## imagenes/menu-originals/create-case-art.webp

- **resolucion:** 1254×1254
- **bytes:** 112078
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** Versión intermedia del menú; original conservado, usar public/ para app
- **tamano mostrado:** Mismo tamaño de presentación del motivo correspondiente en el menú
- **original:** 
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** c75cbcd9b6168b1532641476bb1da62afef94d62737e630b1fc947c06a2f7f0f

## imagenes/menu-originals/daily-art.webp

- **resolucion:** 1536×1024
- **bytes:** 115310
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** Versión intermedia del menú; original conservado, usar public/ para app
- **tamano mostrado:** Mismo tamaño de presentación del motivo correspondiente en el menú
- **original:** 
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** 45af7d23b859bc582326e315672d0213ad601f06ec01a7596b454dabd0ff9888

## imagenes/menu-originals/my-cases-art.webp

- **resolucion:** 1254×1254
- **bytes:** 130312
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** Versión intermedia del menú; original conservado, usar public/ para app
- **tamano mostrado:** Mismo tamaño de presentación del motivo correspondiente en el menú
- **original:** 
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** be2b5913a172a71e0dd427e5606fcbe8be1d062a6a336b07124afb4233ab20fb

## imagenes/public/arena-menu.webp

- **resolucion:** 768×512
- **bytes:** 32952
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** Inicio · imagen del Juzgado, bajo titular y encima del CTA
- **tamano mostrado:** 100% de .lobby-scene, alto flexible; object-fit:cover; centro 52%
- **original:** assets/zanja-arena-hero.png
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** ae4d9a7426ca30fa13c8804743e75572369a08ab9db4da05a7a2d91f6fb7fefb

## imagenes/public/court-energy.webp

- **resolucion:** 640×427
- **bytes:** 16254
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** VS · cabeceras A/B y Ambos; veredicto y creación · fondos
- **tamano mostrado:** Cabeceras:100% ×62px (49px compacto); Ambos:100% ×68px (58px compacto). Cover; no miniatura cuadrada. En paneles cover adaptable.
- **original:** generated_images/exec-23ea9961-0683-4bed-8105-cb0d43634c77.png
- **prompt exacto:** Create one landscape seamless-feeling background asset for a polished casual mobile game UI. Generic abstract 3D illustrated energy stage, glossy violet faceted planes and sweeping soft purple light rays, sparse glowing particles. Deep dark purple left half with generous quiet negative space for separately rendered interface text, subtle brighter violet lighting on right. Colorful saturated high-quality mobile videogame aesthetic, beveled surfaces, soft bloom. Background only, no focal object. NO gloves, hands, people, weapons, trophy, badge, text, letters, numbers, logos or UI. 1536x1024. Save generated asset for application integration.
- **sha256:** f12e57e96fec34391b6b7fe24d4f3a18d2c2dbfe993050f22a05c4e64b8bbf53

## imagenes/public/create-case-menu.webp

- **resolucion:** 480×480
- **bytes:** 21242
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** Inicio · tile Crear zanja, fondo amarillo
- **tamano mostrado:** 100% del tile; cover; centro 29%; dos columnas de ancho flexible
- **original:** assets/create-case-art.png
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** 6ce66d5404bcf5660db239ba1516556d6ef7286b4f1dfeec8670ba649fe9067a

## imagenes/public/daily-menu.webp

- **resolucion:** 768×512
- **bytes:** 29422
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** Inicio · fondo de Caso del día
- **tamano mostrado:** 100% ancho/alto de .daily-feature; cover; degradado CSS a la izquierda
- **original:** assets/daily-art.png
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** f659d8ea5c3e84375f089823b2379b3ebc9a581b645bbb0e5eae49e1e4460373

## imagenes/public/duel-a.webp

- **resolucion:** 384×256
- **bytes:** 19990
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** RETIRADA · guante A, no usar en VS
- **tamano mostrado:** Antiguo:180×120px; no se muestra actualmente
- **original:** generated_images/exec-0e6c2c45-d10e-4810-9e43-17ce830af304.png
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** f222dfce01acd0b57ccd2a90afa60598f98295eada07424b6e1308b8c2cfdb54

## imagenes/public/duel-b.webp

- **resolucion:** 384×256
- **bytes:** 18852
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** RETIRADA · guante B, no usar en VS
- **tamano mostrado:** Antiguo:180×120px; no se muestra actualmente
- **original:** generated_images/exec-aabd61c6-2b83-4320-8ed5-35ef9e805fbd.png
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** 5d81bd97fd0e70b469328209f7639a4a20382a73b2246b9ea0fedffbbe6694d4

## imagenes/public/duel-both.webp

- **resolucion:** 384×256
- **bytes:** 16346
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** RETIRADA · guantes A+B, no usar en VS
- **tamano mostrado:** Antiguo:170×113px; no se muestra actualmente
- **original:** generated_images/exec-a0501da7-dcd2-4ead-8f28-340ac693fbf6.png
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** 34c6d8a11340a138c6fa7385b99269bfdd24e1da9af7a314dd1ebd0f841cca62

## imagenes/public/favicon.svg

- **resolucion:** vector
- **bytes:** 215
- **transparencia:** No
- **pantalla y sitio:** Icono navegador/metadata
- **tamano mostrado:** Escalable; tamaño decidido por navegador
- **original:** public/favicon.svg
- **prompt exacto:** No aplica: SVG escrito en código
- **sha256:** a8e1fdc696d0dfaa3229d10513ff6384f1a8ff965cb246f69287a321261fb6d2

## imagenes/public/my-cases-menu.webp

- **resolucion:** 480×480
- **bytes:** 25202
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** Inicio · tile Mis zanjas
- **tamano mostrado:** 100% del tile; cover; centro 29%; dos columnas de ancho flexible
- **original:** assets/my-cases-art.png
- **prompt exacto:** No recuperado: no hay registro exacto disponible; no se ha reconstruido como si fuese original
- **sha256:** f4602d6884eb905af57469fa1272024ad0118fa2df14aca2d7d2f2fb89fe0b6b

## imagenes/public/prueba-diseno.webp

- **resolucion:** 480×921
- **bytes:** 40956
- **transparencia:** No (RGB opaco)
- **pantalla y sitio:** Juzgado · prueba del caso editorial de diseño; imagen de muestra, no ilustración nueva
- **tamano mostrado:** Miniatura60×66px; visor hasta720px de ancho con contain
- **original:** ../capturas-historicas/43952e56-0b27-441a-84de-89d4c0d0c84b.png
- **prompt exacto:** No aplica: conversión de captura aportada por el usuario
- **sha256:** de5f05f15953dbf5a2152231fc1125e80ec902dfebcc4d7a7bc5644cb2698659

## imagenes/iconos-lucide/ArrowLeft.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 297
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** components/game/invite-response.tsx: &lt;ArrowLeft size={21}/; components/game/create-zanja.tsx: &lt;ArrowLeft size={21}/; components/game/court.tsx: &lt;ArrowLeft size={22}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 95e1d9e191083671c651fcdf4ca855e48e8f300f1965139904bd5c4ffe6e9f0e

## imagenes/iconos-lucide/ArrowRight.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 297
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;ArrowRight className="shortcut-arrow" aria-hidden="true"/, &lt;ArrowRight className="shortcut-arrow" size={21}/, &lt;ArrowRight className="shortcut-arrow" size={21}/, &lt;ArrowRight size={17}/, &lt;ArrowRight size={20}/, &lt;ArrowRight size={17}/, &lt;ArrowRight size={20}/; components/game/invite-response.tsx: &lt;ArrowRight size={20}/, &lt;ArrowRight size={20}/; components/game/create-zanja.tsx: &lt;ArrowRight size={21}/, &lt;ArrowRight size={20}/, &lt;ArrowRight size={19}/, &lt;ArrowRight size={21}/, &lt;ArrowRight size={20}/; components/game/court.tsx: &lt;ArrowRight size={18}/, &lt;ArrowRight size={20}/; components/game/duel-board.tsx: &lt;ArrowRight size={20}/, &lt;ArrowRight size={21}/, &lt;ArrowRight size={16}/, &lt;ArrowRight size={16}/, &lt;ArrowRight size={16}/; components/game/next-countdown.tsx: &lt;ArrowRight size={20}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** ee3de97c6b7d8a4c0ee0f7af61acbd6b2683b61bba9e4c19c24d9be38657682a

## imagenes/iconos-lucide/BookOpen.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 421
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** components/game/court.tsx: &lt;BookOpen size={18}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** eead724ce84d64e2c2d86feb02efb6d985906fd50fe106ff42c9f7ab04e12607

## imagenes/iconos-lucide/Check.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 267
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** components/game/create-zanja.tsx: &lt;Check size={20}/; components/game/court.tsx: &lt;Check size={18}/, &lt;Check size={13}/, &lt;Check size={19}/; components/game/duel-board.tsx: &lt;Check size={20}/, &lt;Check size={21}/; components/game/creator-clash.tsx: &lt;Check size={18}/, &lt;Check size={18}/; components/game/defense-fields.tsx: &lt;Check size={15} aria-label="Longitud válida"/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 68869f040dbf6626527e6f0281bc79833ec00da937464d59a223a557fee2a1f9

## imagenes/iconos-lucide/CheckCircle2.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 312
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;CheckCircle2 size={54}/; components/game/invite-response.tsx: &lt;CheckCircle2 size={60}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** dedf58ab5062aa42d5d46d6b63e86655e28a4e4c8b8f1609d540dc98d7de720f

## imagenes/iconos-lucide/ChevronRight.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 273
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;ChevronRight size={19}/; components/game/duel-board.tsx: &lt;ChevronRight size={16}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** ecbe98eb057e16d1be561111b6940b3af2594196d6252ddc9507cf34b75df4ed

## imagenes/iconos-lucide/Clock.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 303
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;Clock size={15}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 3e4ce3e78af6ab1c33f33acf954616fcd1861b2745c4bd9ae10f777d98b180a5

## imagenes/iconos-lucide/Copy.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 368
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;Copy size={20}/; components/game/invite-response.tsx: &lt;Copy size={18}/; components/game/create-zanja.tsx: &lt;Copy size={18}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 105b192aa637086d6dc8e982a3279a6f82e6a084caa06bc458c8d77fb4b61171

## imagenes/iconos-lucide/DoorClosed.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 353
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** components/game/create-zanja.tsx: &lt;DoorClosed className="case-door-closed" size={66}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** ac27d106ab743ba8a746b5d531274903c1a35b5bc79fb55438bce5302c2fd3f6

## imagenes/iconos-lucide/DoorOpen.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 472
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** components/game/create-zanja.tsx: &lt;DoorOpen className="case-door-open" size={66}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 521e8a8fd08ace208d41d0330378fa91ff6f6e451710236d74820f2274e0221b

## imagenes/iconos-lucide/Expand.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 453
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** components/game/duel-board.tsx: &lt;Expand size={12}/; components/game/evidence.tsx: &lt;Expand size={14}/, &lt;Expand size={18}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 5d31e9bb01581f2be2bdaafd58b5bd4b472a4c4561e33933cd124ca0623ae214

## imagenes/iconos-lucide/Flag.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 397
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;Flag size={18}/; components/game/court.tsx: &lt;Flag size={19}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** e56c12b7b5d1ad98e69dae94554714dd2c8e37d104719ab79effb66fb10b7ba3

## imagenes/iconos-lucide/Flame.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 342
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** Importado; uso dinámico o import sin uso directo
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** c63ffa731882eb4ef0e7cdf8a7a406482cc825b238e39c3c1b50000317d4c6af

## imagenes/iconos-lucide/Gavel.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 415
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;Gavel size={24}/, &lt;Gavel/; components/game/court.tsx: &lt;Gavel size={48}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 5f9dcdbd836eab3994ac9be70923e0d051c1d49ebfe367bb5dd3bb3a00f88277

## imagenes/iconos-lucide/Globe.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 365
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** Importado; uso dinámico o import sin uso directo
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 03795addd28af6a08543c0eb3e2b26b308a0da9500eca4b586aaa5a67c1d1505

## imagenes/iconos-lucide/HeartHandshake.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 601
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** Importado; uso dinámico o import sin uso directo
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 1ad540b1e71c8c214b40aecaf655eb4cdff06561c6f0fc87ae934f3ae74d3e9b

## imagenes/iconos-lucide/Home.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 413
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** Importado; uso dinámico o import sin uso directo
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** ec87d27405499ae8bf0c58f6aafee7b6c7b8b12415984ac50230910f4f4cdefc

## imagenes/iconos-lucide/ImageIcon.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 392
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** components/game/evidence.tsx: &lt;ImageIcon size={17}/, &lt;ImageIcon size={16}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 52fbc73d73e9dedc03f8d7aef7c26ea4a0061fe4642b99ca7f238988ab828bac

## imagenes/iconos-lucide/ImagePlus.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 464
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** components/game/evidence.tsx: &lt;ImagePlus size={24}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 6951b25b3d3a72e1910b1c55195dec2572f51cc4f6174e50f81e2e17878f3bc7

## imagenes/iconos-lucide/Layers.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 543
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;Layers size={44}/, &lt;Layers/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 7cfd88034de1965ed0208bde9d42f66086a365bd1c4f1946a51224b015a61820

## imagenes/iconos-lucide/Link2.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 376
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;Link2 size={16}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 3fdaa0be877b4f5a5a2e3a2040b7f869d199ffa79b2032e3ff6fff6e7b015563

## imagenes/iconos-lucide/LoaderCircle.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 287
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;LoaderCircle size={15} className="spin"/; components/game/invite-response.tsx: &lt;LoaderCircle className="spin"/, &lt;LoaderCircle className="spin"/; components/game/create-zanja.tsx: &lt;LoaderCircle className="spin"/; components/game/duel-board.tsx: &lt;LoaderCircle size={20} className="spin"/, &lt;LoaderCircle size={21} className="spin"/; components/game/evidence.tsx: &lt;LoaderCircle className="spin evidence-spinner" aria-label="Cargando imagen"/, &lt;LoaderCircle className="spin" size={24}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** c30ab038c652949e87002386511f4efc2162e17e558e3b28ee81c88d9f6b136f

## imagenes/iconos-lucide/LockKeyhole.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 378
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;LockKeyhole size={12}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 493a9abfdd2340bf2b8bc314040604b84fd96619f8cc05f4643c5fcd27e6c2c7

## imagenes/iconos-lucide/Pause.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 343
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** components/game/next-countdown.tsx: &lt;Pause size={16}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 75e896c2f91f8f33ec022428c97508e5372a01786b1bc214f55b7229b5f9a2a1

## imagenes/iconos-lucide/Play.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 333
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** components/game/next-countdown.tsx: &lt;Play size={16}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** bf924d1738836873d3a135c56024ca89a36c35813f6966b26a6ea0a58c6e5307

## imagenes/iconos-lucide/Plus.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 285
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;Plus size={19}/, &lt;Plus size={28}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** b208fd73aa48c54364eb6eaaa9c389de4de22759717542cb0a08172afad33980

## imagenes/iconos-lucide/RotateCcw.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 332
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;RotateCcw size={15}/; components/game/court.tsx: &lt;RotateCcw size={19}/; components/game/evidence.tsx: &lt;RotateCcw size={18}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** e4283608f8d893bae2ccce68873e68cbb64fc9e8edc6698a2cf4afa8004a6daa

## imagenes/iconos-lucide/Send.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 422
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** Importado; uso dinámico o import sin uso directo
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** d2d20c09863bdfc7bfde6109668ea6f421fa95a982a0a7884dffe405206f27bd

## imagenes/iconos-lucide/Settings2.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 384
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;Settings2 size={18}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** b4bd89f0843077d0ec9104a8abb3219935f8438bc64c9a9a330fa72033859158

## imagenes/iconos-lucide/Share2.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 476
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** components/game/create-zanja.tsx: &lt;Share2 size={18}/, &lt;Share2 size={19}/; components/game/court.tsx: &lt;Share2 size={18}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 55abe82e7b2d5fc28fe7bf89cf18c66c40266e0442915db3fbbb9793296e26cb

## imagenes/iconos-lucide/ShieldCheck.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 452
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;ShieldCheck size={62}/, &lt;ShieldCheck/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** c1f5d4e7357d603081eae6a548864a82c7b8ec03632d81427d4109b02a4d005e

## imagenes/iconos-lucide/SlidersHorizontal.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 479
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** components/game/court.tsx: &lt;SlidersHorizontal size={21}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** dd2710aef2f0abd5d4f505396c79c917fabd1d09d44826fef3847e1fbd77e125

## imagenes/iconos-lucide/Sparkles.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 606
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** Importado; uso dinámico o import sin uso directo
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** bc330897940133f862027749d6edb79ffbff47233a62f21222646e46a4418573

## imagenes/iconos-lucide/Star.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 615
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;Star fill="currentColor" size={18}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** f5eb5ec795d2e6ce89cb893cc5daf9d36fdb05a4ff2e00c1adb151ece13ebf81

## imagenes/iconos-lucide/Swords.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 624
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;Swords size={20}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 4c6359d2cf4a76c8e4ca73794637f7d49abc92547e7e4163dafe59bc906b5675

## imagenes/iconos-lucide/Trash2.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 441
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;Trash2 size={15}/; components/game/evidence.tsx: &lt;Trash2 size={16}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** c605c57ead265582b8ecff15e7d9ac677860852029a94600a06b5ce40cc74a01

## imagenes/iconos-lucide/Trophy.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 593
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** Importado; uso dinámico o import sin uso directo
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** d9a37ea8a0a3fe06306fb2a393c3528d5ef24c624230bdb2bf93c401ad9a5588

## imagenes/iconos-lucide/UserRound.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 316
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;UserRound size={21}/, &lt;UserRound size={44}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 9bb17b2ef4b8d898c35d57f4742206f7009bfcafb05439508e0ed91e4a66648a

## imagenes/iconos-lucide/Users.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 419
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** components/game/creator-clash.tsx: &lt;Users size={18}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** bc4899bcde11add4ecc0e2a0ad5f44ad73b2e0c8adc400a9d71695d912071a5e

## imagenes/iconos-lucide/Volume2.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 526
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;Volume2/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 6e566c02e1d28cafced75838cc4c003ae5b55c7194dad13e36761461e4171fac

## imagenes/iconos-lucide/VolumeX.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 511
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;VolumeX/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 99a1ae7a8e19648bcee01bc47c49f0ccda737b0b8a9731d0fc4834c59584ee98

## imagenes/iconos-lucide/X.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 286
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;X size={21}/; components/game/invite-response.tsx: &lt;X size={21}/; components/game/create-zanja.tsx: &lt;X size={21}/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** 9a0d26a7a2199b036188b812a84bedea051a45acb49c43832c1e3848959178b8

## imagenes/iconos-lucide/Zap.svg

- **resolucion:** Vector SVG 24×24, escalable
- **bytes:** 416
- **transparencia:** Sí: sin fondo
- **pantalla y sitio:** app/page.tsx: &lt;Zap fill="currentColor"/, &lt;Zap size={23} fill="currentColor"/, &lt;Zap/; components/game/court.tsx: &lt;Zap size={16} fill="currentColor"/
- **tamano mostrado:** Ver size en usos JSX anteriores; CSS del contexto puede sobrescribirlo
- **original:** lucide-react instalado, exportado en esta entrega
- **prompt exacto:** No aplica: icono de biblioteca, no generado por IA
- **sha256:** d8b2863ee60468bccd518357e0334cdf0228c562ad944aa010e913e99f8888a7

## Iconos de interfaz

La iconografía funcional procede de lucide-react, no de imágenes generadas con IA. El favicon sí se entrega como SVG. Incluimos SVG exportados de los iconos importados por las pantallas propias, su lista y licencia cuando están disponibles. Heredan currentColor y su tamaño final está en cada uso JSX/CSS; no tienen un prompt de generación. A, B, VS, los números, confeti, flechas en recuadros y efectos de luz usan texto, SVG de biblioteca o CSS, no recursos de imagen ocultos.

## Guía para nuevos recursos (dirección artística, NO prompt histórico)

Ilustración 3D de videojuego casual, materiales brillantes biselados, luz violeta y dorada, objeto legible y volumen suave. Fondo integrado mediante cover y degradados CSS, texto real separado de la imagen. El menú usa mazo, calendario, pergamino y expedientes. Para VS usar energía geométrica abstracta sin guantes; A azul/cian, B coral y Ambos violeta. No rasterizar textos funcionales dentro de las ilustraciones. Exportar original sin pérdida y una versión WebP ajustada al uso. Esta guía es una nueva descripción del estilo, no el prompt exacto de los archivos anteriores.
