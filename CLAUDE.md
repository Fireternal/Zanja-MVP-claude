# ZANJA — contexto del proyecto

Documento de entrada para cualquiera (persona o IA) que se ponga con este repositorio.
Explica qué es la app, cómo está construida, por qué está construida así y qué trampas
tiene. Los detalles de producto viven en `PRODUCT_SPEC.md` y los visuales en
`DESIGN_SYSTEM.md`; aquí está lo que hace falta para no romper nada.

---

## 1. Qué es

ZANJA convierte discusiones cotidianas en un juicio popular rápido: **dos bandos, un
jurado, un veredicto**. Alguien publica su caso, la comunidad vota A / AMBOS / B, y al
cerrarse el tiempo hay resultado.

La frase que gobierna el producto está impresa en la portada: **juzgamos situaciones, no
personas**. Cualquier función nueva debería poder sostenerla.

Versión actual: **Beta 0.9**, sólo frontend, en español.

### El ciclo

El producto no son modos sueltos, es un ciclo. Cuando dudes dónde colocar algo, mira a qué
etapa pertenece:

```
ZANJAR ──▶ ARENA ──▶ MIS ZANJAS ──▶ VERIFICACIÓN
(creas)    (juzgan)   (sigues)       (la comunidad se autorregula)
```

El **Caso del Día** y el **Debate Semanal** son rituales transversales: no son etapas, son
el motivo para volver.

---

## 2. Stack y estructura

Sin build, sin dependencias de runtime, sin framework. HTML + CSS + un `app.js` en una IIFE.
El único recurso externo es Google Fonts.

| Fichero | Qué es |
|---|---|
| `index.html` | Todas las pantallas a la vez; se muestran con la clase `.is-active` |
| `app.js` | ~77 KB. Estado, lógica, render y bindings |
| `styles.css` | ~62 KB. Design system + componentes |
| `manifest.webmanifest`, `favicon.svg` | PWA |
| `vercel.json` | Cabeceras de seguridad y `cleanUrls` |

Para levantarlo:

```
npx http-server -p 8099 .
```

No hay proceso de build. Lo que hay en el repositorio es lo que se despliega.

### Convenciones del código

- `$(sel, root)` es `querySelector`. `$$(sel, root)` es `querySelectorAll` y devuelve array.
- Estilo compacto, una sentencia por concepto, líneas largas. Es deliberado: mantenlo.
- Todo texto de usuario que venga de datos pasa por `escapeHtml()`. Sin excepciones.
- El render es por `innerHTML` y re-bind inmediato. No hay diffing ni estado en el DOM.
- Los comentarios explican **por qué**, no qué. Si el qué no se entiende, arregla el nombre.

---

## 3. Pantallas

Registradas en el objeto `screens` y conmutadas por `showScreen(name, {nav})`.

| Clave | Id en el HTML | Qué es |
|---|---|---|
| `onboarding` | `#onboardingScreen` | Primera apertura |
| `home` | `#homeScreen` | Tablero del día: HOY · ESTA SEMANA · TUS VEREDICTOS |
| `play` | `#playScreen` | Votación. La usan arena, daily, weekly, shared y own |
| `create` | `#createScreen` | Flujo Zanjar, 4 pasos |
| `weekly` | `#weeklyScreen` | Debate semanal, según fase |
| `mine` | `#myCasesScreen` | Mis Zanjas |
| `verify` | `#verifyScreen` | Panel de verificación |
| `activity` | `#activityScreen` | Actividad |
| `profile` | `#profileScreen` | Tu Instinto |
| `achievements` | `#achievementsScreen` | Los 16 logros |

`showScreen` llama al render correspondiente. Si añades pantalla, añade su rama ahí.

### Navegación

Barra de cinco ranuras: `INICIO · ARENA · (+) · ACTIVIDAD · TÚ`. Cada una tiene un trabajo
distinto —hoy, juzgar, crear, lo que ha pasado, lo tuyo— y el centro es un botón elevado
(`#navCreate`) que abre Zanjar desde cualquier pantalla.

La barra sigue visible durante Arena (es una pestaña, no una pantalla modal), y `showScreen`
marca entonces `has-nav` en la pantalla de voto para que reserve sitio y el botón central no
tape el dock. En los modos de un solo caso —daily, weekly, shared, own, review— la barra
desaparece: se sale por la flecha de la cabecera.

Mis Zanjas y Verificación **no están en la barra**: no son actividades, son historial y rol.
Viven dentro de TÚ, en `renderHub()`. Verificación no aparece como tile gris bloqueado sino
como una línea de progreso hasta el nivel 5, para que desbloquearla sea un acontecimiento y
no el final de una molestia.

### `currentMode`

La pantalla de juego se comporta distinto según `currentMode`:

- `arena` — cola larga, avanza sola a los 5 s
- `daily`, `weekly`, `shared`, `review` — un solo caso, vuelven a inicio (`SINGLE_CASE_MODES`)
- `review` — un veredicto tuyo de hace rato, abierto desde Inicio: sin cuenta atrás
- `own` — tu propio caso en vivo: carta bloqueada, sin cuenta atrás, con compartir
- `tutorial` — primer caso tras el onboarding

---

## 4. Estado

Todo vive en `localStorage` bajo la clave **`zanja-beta-07`** (el nombre se quedó de la 0.7;
cambiarlo borraría el progreso de quien ya tenga la app). `loadState()` mezcla con
`DEFAULT_STATE`, así que añadir campos nuevos es seguro.

```js
{
  onboarded, sound, haptics,                 // preferencias
  xp, streak, lastActiveDate, daily{},       // progresión
  judged, majorityMatches, choiceCounts{},   // perfil de criterio
  votes{},                                   // caseId -> {choice, at}
  customCases[],                             // tus casos publicados
  created, createdVotePeak, closeCalls,
  weekly{}, weeklyHistory[], weeklyPlayed, proposalsMade,
  reported{}, verifyQueue[], verifiedCount,  // moderación
  invites{}, arenaFilter,
  unlocked[], activities[], unread, displayName
}
```

`save()` avisa por toast si `localStorage` se llena — pasa con las pruebas fotográficas,
que son data URLs.

### El modelo de caso

```js
{ id, tag, q, a:[], b:[], counts:{a,both,b},
  photo, mix:{a,both,b}, reach, createdAt, closesAt, custom, removed }
```

- `caseState(c)` → `open` | `closed` | `removed`
- `caseVotes(c)` → los votos **ahora**
- `caseProgress(c)` → cuánto lleva recorrido de su ventana, con curva `sqrt`

**Importante y a la vez incómodo:** un caso publicado no tiene jurado real detrás. Sus
votos se derivan del tiempo transcurrido usando `mix` (reparto fijo sorteado al publicar) y
`reach` (total al que llegará). Es un andamio para poder enseñar el ciclo completo sin
backend. Los 20 casos de `CASES` sí llevan recuentos fijos escritos a mano.

Cuando haya servidor, `caseVotes()` es el punto donde se enchufa y el resto no se entera.

---

## 5. Reglas del producto

### XP y niveles

```js
XP = { arena:5, daily:15, created:40, weekly:25, proposal:15, verify:10 }
```

150 XP por nivel. `levelOf(xp) = floor(xp/150)+1`.

### Racha

`markDaily(kind)` la protege. Cuenta como actividad significativa: 5 votos en Arena, el
Caso del Día, el debate semanal, publicar un caso o emitir una verificación. La misión
diaria **desaparece de la portada al cumplirse**; la racha se queda en la cabecera para no
irse con ella.

### Moderación

```js
VERIFY_LEVEL = 5    // nivel que abre el panel (600 XP)
VERIFY_QUORUM = 5   // votos que cierran la decisión, mayoría simple
REPORT_HIDE_AT = 3  // denuncias que sacan el caso de Arena
```

Los dos umbrales de denuncia resuelven abusos distintos, no los unifiques: **una** denuncia
sólo marca el caso *en revisión*, porque una denuncia falsa no debería poder censurar nada;
**tres** lo retiran, que ya exige que varias personas coincidan. Quién decide es la
comunidad, nunca el sistema. Nadie verifica sus propios casos.

### Debate semanal

La fase depende del **día de la semana**, no de un contador:

| Días | `weeklyPhase()` | Qué pasa |
|---|---|---|
| Lun–Mar | `propose` | Cualquiera propone tema con sus dos bandos |
| Mié | `elect` | Un voto por persona entre candidatos |
| Jue–Dom | `debate` | El ganador se abre como caso destacado |
| Dom 23:59 | — | Cierra y pasa a `weeklyHistory` |

`ensureWeekly()` detecta el cambio de semana y archiva. La semana se identifica por el lunes
(`weekKey()`), y las propuestas se generan de forma determinista a partir de esa clave, así
que todo el mundo ve los mismos candidatos.

Para probar otra fase, usa el reloj del navegador (`page.clock.install()` en Playwright),
no toques la lógica.

---

## 6. La pantalla de voto

Es el corazón de la app y ya se rehízo tres veces. Lee esto antes de tocarla.

**Cómo funciona ahora:** los bandos van **apilados** (A arriba, B abajo) y **cada bando es
un botón**: se vota tocando la ventana del bando con el que estás de acuerdo. Debajo, un
único botón ancho para `AMBOS TIENEN RAZÓN`. Todo el enlace lo hace `bindVote()`, que lee
`data-side` o `data-vote` y confirma con un realce blanco (`.is-picked`) antes de resolver.

**El dock queda pegado abajo** (`.vote-zone` es `position:sticky`). Si el caso no cabe —
pasa en pantallas de 320 y 375 px de alto con la barra inferior visible — el caso se
desplaza por debajo y los tres destinos del voto siguen siempre a la vista, por encima del
botón central de la barra.

**Por qué, para que no se vuelva a intentar:**

- El diseño original arrastraba un *puck* VS de 72 px en el centro. Nadie adivinaba que
  fuera arrastrable, y el eje del gesto no coincidía con dónde estaba dibujado cada bando.
- Se probó ponerlos en horizontal, estilo Tinder. No funciona: cada bando se quedaba con
  media pantalla de ancho y los argumentos se rompían en cuatro líneas. Tinder puede mover
  la carta porque es una foto; aquí hay texto que hay que **leer** para decidir.
- Se probó arrastrar sobre la carta entera sin moverla, con sello y realce. Seguía sin
  entenderse: el gesto no se anuncia solo, hacía falta un tutorial para explicarlo, y un
  tutorial que explica un gesto es la señal de que el gesto sobra.
- Tocar el bando no necesita explicación: el objetivo del toque **es** la respuesta. Por eso
  ya no existe `bindSwipe`, ni umbrales de gesto, ni `coachDone` en el estado.

---

## 7. Qué es real y qué es andamio

Conviene tenerlo claro antes de enseñar una demo.

**Real:** los modos y sus reglas, el voto, la progresión, XP, nivel, racha, logros, la
creación de casos con foto y cierre por tiempo, los umbrales de denuncia y el quórum de
verificación, y el ciclo semanal completo.

**Simulado, por no haber backend:**

- el recuento de votos de un caso publicado sale del tiempo, no de gente;
- la cola de verificación arranca con 3 casos de ejemplo para que el panel sea demostrable;
- los votos de los candidatos semanales se generan a partir de la clave de la semana;
- el rival, las invitaciones y los votos no se sincronizan entre dispositivos.

Nada de esto se presenta dentro de la app como actividad real de otros usuarios.

### El límite de los enlaces

Una imagen no cabe en una URL. El enlace de invitación a B lleva el texto (funciona en
cualquier dispositivo) y una clave que resuelve la foto **sólo desde el almacenamiento local
del mismo navegador**. Si no la encuentra, la app avisa de que la prueba existe pero no viaja
en el enlace, en vez de callarlo. Es lo máximo honesto sin servidor.

---

## 8. Cómo se prueba

No hay framework de tests. Se verifica con Playwright contra Chromium, recorriendo flujos
reales y comprobando tres cosas en cada viewport (320×568, 375×667, 390×844, 430×932):
cero errores de página, cero desbordes horizontales, cero elementos fuera de su contenedor.

Antes de dar por buena cualquier cosa:

```
node --check app.js
```

Y comprobar que no queden `id` que el JS pide y el HTML no tiene, ni al revés.

**Trampa conocida al parchear con scripts:** `$$` es una secuencia de escape en el
reemplazo de `String.replace`, así que `$$(...)` se convierte silenciosamente en `$(...)` y
el fallo aparece en ejecución, no al comprobar sintaxis. Usa `split().join()` o una función
de reemplazo.

---

## 9. Estado del repositorio

- Rama de trabajo: `claude/eloquent-ritchie-htmxn9`. `main` tiene la versión anterior.
- No hay despliegue configurado. Para tener URL: GitHub Pages apuntando a la rama, o
  importar el repositorio en Vercel (el `vercel.json` ya está listo).
- `AUDIT.md` documenta la Alpha 0.6.9 y describe una geometría que ya no existe. Está
  obsoleto: o se borra o se marca como histórico.
- Hay 67 casos sembrados en `CASES`. Con Arena a un toque desde cualquier pantalla se agotan
  antes; la pantalla de «ya los has juzgado todos» existe y está probada, pero el techo real
  es de contenido, no de navegación.
- `qa-case.html`, `qa-result.html` y los `qa-*.png` son restos de una sesión de QA antigua.

---

## 10. Lo siguiente

**Backend** (`PRODUCT_SPEC.md` tiene el esquema). Lo crítico es que estas reglas se
apliquen en servidor y no en cliente, porque ahora mismo son de confianza:

- voto único por usuario y caso;
- resultado oculto antes de votar;
- B no accede a la defensa de A antes de enviar la suya;
- cierre y veredicto calculados en servidor;
- umbrales de denuncia y quórum de verificación;
- el nivel que habilita verificar;
- almacenamiento y moderación de las pruebas fotográficas.

**Fuera de alcance a propósito:** comentarios, DMs, followers, tienda, monedas o energía, y
ranking global de «mejor juez». No son olvidos, son decisiones.
