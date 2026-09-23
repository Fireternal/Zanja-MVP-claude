# ZANJA — Dossier completo

Documento único de contexto, preparado para que un tercero (persona o IA) pueda auditar el
producto, la UX y el código sin acceso al repositorio ni al historial de conversación.

Fecha: 23 de septiembre de 2026 · Versión del frontend: Beta 0.9 · Idioma del producto: español

---

## 1. Qué es ZANJA

Una app social para **zanjar discusiones cotidianas mediante un jurado**.

> Dos bandos. Un jurado. Un veredicto.

El usuario hace tres cosas:

1. **Juzgar.** Ve un caso real de otra persona —una pregunta y los argumentos de cada
   bando— y da la razón a A, a B, o a los dos.
2. **Zanjar.** Lleva su propia discusión al jurado: la cuenta, escribe su defensa, invita a
   la otra parte a escribir la suya, y la comunidad vota durante un tiempo limitado.
3. **Moderar.** A partir del nivel 5 entra en el panel de verificación, donde se decide por
   mayoría si un caso denunciado se mantiene o se retira.

El material es **convivencia, pareja, trabajo, amigos, comida, etiqueta y viajes**: el tipo de
discusión que hoy se resuelve preguntando en un grupo de WhatsApp o en Twitter.

**Regla moral del producto, visible en la propia app:** *"Juzgamos situaciones. No personas."*

### Qué NO es (decisiones deliberadas, no olvidos)

Sin comentarios, sin mensajes directos, sin seguidores, sin tienda, sin monedas, sin energía
y sin ranking global de "mejor juez". Todo eso convertiría la app en una red social al uso y
abriría la puerta al acoso, que es exactamente el riesgo del concepto.

---

## 2. Estado real del proyecto

| | |
|---|---|
| Tipo | Frontend estático completo, sin backend |
| Ficheros | `index.html` (14 KB), `styles.css` (62 KB), `app.js` (93 KB) |
| Dependencias de runtime | Ninguna. Único recurso externo: Google Fonts |
| Build | No hay. Se sirve tal cual |
| Repositorio | `Fireternal/zanja-mvp-claude`, rama `claude/eloquent-ritchie-htmxn9` |
| Persistencia | `localStorage`, clave `zanja-beta-07` |
| Demo jugable | https://claude.ai/artifact/1xeKT6TqxWMJLiE2o7mR3s |

Es un **prototipo de producto funcional**, no un MVP lanzable: toda la lógica de negocio vive
en el cliente y los votos de la comunidad están simulados (ver §7).

### Situación de diseño en este momento

El aspecto visual está **en revisión completa**. El dueño del producto rechazó la estética
actual ("cero estética de aplicación gaming") y se abrió una exploración de estilos, todavía
sin cerrar:

| Exploración | Contenido | Resultado |
|---|---|---|
| https://claude.ai/artifact/ECb3qrYnH9yGdxR94gFcej | Estilo NEÓN: inicio, votación y resultado | Descartado como dirección final |
| https://claude.ai/artifact/5EGVWFTEHaEgQ6aGMgx4Ez | Tres estilos de juego: BRAWL, ESPORTS, ARCADE | **Elegido: BRAWL** |
| https://claude.ai/artifact/UQT2NhT1w7emXD4E37eJNQ | Tres reformulaciones del versus dentro de BRAWL | **Pendiente de decisión** |

Es decir: **la lógica y las reglas están decididas y construidas; la piel no.** Una auditoría
útil debería separar las dos cosas.

---

## 3. El ciclo del producto

```
        alguien publica un caso  ──►  la comunidad lo juzga  ──►  se cierra y hay veredicto
                  ▲                            │                            │
                  │                            ▼                            ▼
          se gana XP por crear        se gana XP por votar         el autor comparte el
                  │                            │                       veredicto
                  └──────── sube de nivel ◄────┘                            │
                                     │                                      │
                                     ▼                                      ▼
                          nivel 5: verificar        denuncias ──► panel de verificación
```

### Modos

| Modo | Qué es | Frecuencia esperada |
|---|---|---|
| **Arena Live** | Cola de casos abiertos de la comunidad. Es *la* actividad | Cada sesión |
| **Caso del Día** | Un caso único para todos, 24 h, ritual diario | 1 vez al día |
| **Debate Semanal** | Ciclo de fases, ver §5 | 1–3 veces por semana |
| **Zanjar** | Crear tu propio caso, 4 pasos | Raro, pero genera el contenido |
| **Mis Zanjas** | Historial de tus casos y cómo van | Sólo si has publicado |
| **Verificación** | Moderación por pares, desde nivel 5 | Cuando hay cola |

---

## 4. Reglas de producto (completas)

### Progresión

| Acción | XP |
|---|---|
| Votar en Arena | +5 |
| Emitir una verificación | +10 |
| Caso del Día | +15 |
| Proponer tema semanal | +15 |
| Votar el debate semanal | +25 |
| Publicar un caso | +40 |

- **Nivel** = `floor(XP / 150) + 1`. Lineal, sin curva.
- **Nivel 5** (600 XP) desbloquea el panel de verificación.
- **Racha**: días consecutivos con actividad. Se rompe al saltarse un día.
- **Misión diaria**: 5 votos en Arena protegen la racha. Al completarse, el bloque de la
  misión **desaparece** de la pantalla de inicio en vez de quedarse marcado.

### Logros (16)

`PRIMER CORTE` (1 voto) · `JURADO 50` · `JURADO 500` · `DE GUARDIA` (racha 7) ·
`INCOMBUSTIBLE` (racha 30) · `DISIDENTE` (tras 40 votos, coincides con la mayoría <40%) ·
`VOZ DE LA MAYORÍA` (>75%) · `EQUILIBRISTA` (≥25% de votos a AMBOS) · `TAJANTE` (<5% a AMBOS) ·
`VOZ SEMANAL` · `AGENDA PROPIA` (proponer tema) · `ZANJADOR` (publicar) ·
`EL JURADO HA HABLADO` (un caso tuyo llega a 100 votos) · `SE HA LIADO` (caso cerrado por <3
puntos) · `GUARDIÁN` (nivel 5) · `MANO FIRME` (10 verificaciones).

Los logros premian **el criterio**, no el volumen: ser disidente tiene logro igual que ser
mayoritario. Es deliberado — no queremos empujar a votar con el rebaño.

### Creación de un caso (Zanjar)

Cuatro pasos: (1) cuéntalo en texto libre, con **prueba fotográfica opcional** hecha con la
cámara; (2) se genera pregunta + defensa del bando A, editables; (3) se invita al bando B por
enlace, o se escribe su defensa en local; (4) audiencia y duración.

Duraciones: **15 min · 1 h · 24 h**. Al vencer, el caso pasa a `closed` y tiene veredicto.

### Denuncias y verificación

- Cualquier caso se denuncia desde la propia pantalla de votación (5 motivos tipificados).
- **1 denuncia** → el caso queda marcado *en revisión* y sale de tu cola.
- **3 denuncias** (`REPORT_HIDE_AT`) → sale de Arena para todos, pero **no se borra**.
- El panel de verificación se abre en **nivel 5** (`VERIFY_LEVEL`).
- Cada caso denunciado se resuelve por **mayoría simple al quinto voto** (`VERIFY_QUORUM = 5`).
- Nadie verifica sus propios casos ni los que ha denunciado.

### Debate semanal (por día de la semana)

| Días | Fase | Qué pasa |
|---|---|---|
| Lunes y martes | 1 · Propuestas | Cualquiera propone un tema con sus dos defensas |
| Miércoles | 2 · Elección | La comunidad vota qué tema quiere debatir |
| Jueves a domingo | 3 · Debate abierto | El tema ganador se abre como caso |
| Domingo 23:59 | Cierre | Se zanja y pasa al histórico |

Hay 7 propuestas sembradas para que la fase 1 nunca aparezca vacía.

---

## 5. Contenido

**67 casos sembrados** en el array `CASES` de `app.js`. Cada uno:

```js
{ id:'pan', tag:'CONVIVENCIA', q:'¿Comprar pan de molde cuenta como traer "pan"?',
  a:['argumento 1','argumento 2','argumento 3'],
  b:['argumento 1','argumento 2','argumento 3'],
  counts:{a:0,both:0,b:0} }
```

Invariantes que cumplen los 67: id único, exactamente 3 argumentos por bando, la pregunta
termina en `?`, y el `tag` pertenece a las 7 categorías.

Reparto: AMIGOS 11 · PAREJA 11 · ETIQUETA 11 · CONVIVENCIA 10 · TRABAJO 9 · COMIDA 8 · VIAJES 7.

**Cuello de botella conocido:** con Arena accesible en un toque desde cualquier pantalla, un
usuario activo agota los 67 casos en una o dos sesiones. La pantalla de "ya los has juzgado
todos" existe y funciona, pero el techo real es de contenido, no de navegación, y no se
resuelve sin usuarios reales publicando.

---

## 6. Modelo de datos

Todo el estado vive en `localStorage` bajo `zanja-beta-07`. `loadState()` mezcla con
`DEFAULT_STATE`, así que añadir campos es retrocompatible.

```js
{
  onboarded, sound, haptics,                 // preferencias
  xp, streak, lastActiveDate,                // progresión
  daily:{ date, arenaVotes, done },          // misión del día
  judged, majorityMatches,                   // perfil de criterio
  choiceCounts:{ a, both, b },
  votes:{ [caseId]: { choice, at } },        // voto único por caso
  customCases:[ … ],                         // tus casos publicados
  created, createdVotePeak, closeCalls,
  weekly, weeklyHistory, weeklyPlayed, proposalsMade,
  reported:{ [caseId]: motivo },             // lo que TÚ has denunciado
  verifyQueue:[ { caseId, reportCount, votes:{remove,keep}, resolved, mine } ],
  verifiedCount, invites:{}, arenaFilter,
  unlocked:[], activities:[], unread, displayName
}
```

Un caso publicado añade: `custom:true`, `createdAt`, `closesAt`, `audience`, `photoKey`,
`mix`, `reach`, y opcionalmente `removed`.

### Cómo se simulan los votos (importante para auditar)

No hay servidor, así que un caso publicado necesita aparentar actividad. Al crearlo se fija:

- `mix`: un reparto A/AMBOS/B aleatorio pero **fijo** para ese caso
  (`a` entre .22 y .64, `both` entre .05 y .21, el resto a `b`);
- `reach`: el total de votos al que llegará cuando cierre.

Y el recuento en cualquier instante es:

```js
caseProgress(c) = sqrt( (ahora - createdAt) / (closesAt - createdAt) )   // curva: rápido al principio
caseVotes(c)    = reach * caseProgress(c), repartido según mix
```

`caseVotes()` es **la única costura**: el día que haya backend, se sustituye esa función y el
resto de la app no se entera.

---

## 7. Qué es real y qué es andamio

**Real y auditable:** los modos y sus reglas, el voto y su registro, la progresión completa
(XP, nivel, racha, misión, logros), la creación de casos con foto y cierre por tiempo, los
umbrales de denuncia, el quórum de verificación, el ciclo semanal entero y el filtro por tema.

**Simulado por no haber backend:**

- Los votos de la comunidad (§6).
- La cola de verificación se siembra con casos de ejemplo.
- Las notificaciones de la pestaña Actividad son sintéticas.
- El "bando B" que responde por enlace, si se prueba en el mismo dispositivo.
- **Una foto no cabe en una URL**: el enlace de invitación lleva el texto (funciona entre
  dispositivos) y una clave que resuelve la imagen **sólo desde el mismo navegador**. Cuando
  no la encuentra, la app lo dice en vez de callarlo.

**Consecuencia para la auditoría:** todas las reglas que deberían ser de servidor hoy son de
confianza en el cliente. Concretamente: voto único por usuario y caso, resultado oculto antes
de votar, que B no vea la defensa de A antes de enviar la suya, el cálculo del veredicto, los
umbrales de denuncia, el quórum y el nivel que habilita verificar.

---

## 8. Arquitectura técnica

- **Un solo IIFE** en `app.js`. Sin módulos, sin framework, sin build.
- Helpers: `$(sel, root)` = `querySelector`; `$$(sel, root)` = `querySelectorAll` como array.
- **Render por `innerHTML` + re-bind inmediato.** No hay diffing ni estado en el DOM.
- **Todo dato de usuario pasa por `escapeHtml()`.** Sin excepciones.
- Las pantallas existen todas en el DOM y se conmutan con la clase `.is-active` desde
  `showScreen(name, {nav})`.
- Estilo de código: compacto, una sentencia por concepto, líneas largas. Es deliberado.
- Los comentarios explican **por qué**, no qué.

### Pantallas

| Clave | Id | Qué es |
|---|---|---|
| `onboarding` | `#onboardingScreen` | Primera apertura |
| `home` | `#homeScreen` | Tablero del día |
| `play` | `#playScreen` | Votación (la usan arena, daily, weekly, shared, own, review) |
| `create` | `#createScreen` | Zanjar, 4 pasos |
| `weekly` | `#weeklyScreen` | Debate semanal según fase |
| `mine` | `#myCasesScreen` | Mis Zanjas |
| `verify` | `#verifyScreen` | Panel de verificación |
| `activity` | `#activityScreen` | Actividad |
| `profile` | `#profileScreen` | Tú |
| `achievements` | `#achievementsScreen` | Los 16 logros |

La pantalla de juego cambia de comportamiento según `currentMode`:

- `arena` — cola larga, avanza sola a los 5 s;
- `daily`, `weekly`, `shared`, `review` — un solo caso, vuelven a inicio;
- `own` — tu caso en vivo: carta bloqueada, sin cuenta atrás, con compartir;
- `tutorial` — el primer caso tras el onboarding.

### Navegación actual

Barra inferior de **cinco ranuras**, una por trabajo:

```
[ INICIO ]  [ ARENA ]   (+)   [ ACTIVIDAD ]  [ TÚ ]
```

El botón central, elevado, crea una Zanja desde cualquier pantalla. **Mis Zanjas y
Verificación no están en la barra**: no son actividades, son historial y rol, y viven dentro
de TÚ. Verificación no aparece como tile gris bloqueado, sino como una línea de progreso
hasta el nivel 5.

**Inicio no es un menú**, es el tablero del día: *HOY* (misión diaria y Caso del Día en un
mismo marco), *ESTA SEMANA* (el debate con su fase), un aviso que sólo aparece si tienes
casos abiertos, y *TUS VEREDICTOS* con los tres últimos casos que juzgaste.

---

## 9. La pantalla de votación: cuatro intentos

Es el corazón de la app y se rehízo cuatro veces. El histórico importa porque explica por qué
la solución actual es tan sobria.

1. **Puck VS arrastrable.** Un disco de 72 px en el centro que se arrastraba hacia el bando
   elegido. Nadie adivinaba que fuera arrastrable, y el eje del gesto no coincidía con dónde
   estaba dibujado cada bando.
2. **Bandos en horizontal, estilo Tinder.** Falló: cada bando se quedaba con media pantalla de
   ancho y los argumentos se rompían en cuatro líneas. Tinder puede mover la carta porque es
   una foto; aquí hay **texto que hay que leer para decidir**.
3. **Arrastre sobre la carta entera, sin moverla**, con sello y realce del bando. Seguía sin
   entenderse: hacía falta un tutorial para explicar el gesto, y un tutorial que explica un
   gesto es la señal de que el gesto sobra.
4. **Actual: se toca la ventana del bando.** Cada bando es un botón. Debajo, un botón ancho
   para *AMBOS TIENEN RAZÓN*. El objetivo del toque es la respuesta, así que no hay nada que
   aprender. El dock de voto queda fijo abajo; si el caso no cabe, el caso se desplaza por
   detrás y las tres opciones siguen a la vista.

Consecuencia de diseño: **el círculo VS del centro ya no tiene sentido como botón** y en la
exploración visual en curso se ha convertido en separador (cinta, placa o grieta).

---

## 10. Dirección visual

### Paleta actual en código

| Token | Hex | Uso |
|---|---|---|
| ZANJA Violet | `#7456FF` | Marca, debate semanal |
| A Cyan | `#27C9E8` | Bando A |
| B Coral | `#FF625D` | Bando B |
| Signal | `#FFD54A` | AMBOS, llamadas a la acción |
| Ink 900 / 950 | `#0B1026` / `#080D20` | Fondos |

Tipografías: *Bricolage Grotesque* para display, *Manrope* para texto.

### Estilo elegido en la exploración (BRAWL)

Plástico de videojuego: contorno negro de 3–4 px en todo, bisel con brillo arriba y sombra
maciza abajo, todo "se hunde" al pulsarlo. Fondo morado `#2B1B6B` con focos de estadio.
Amarillo `#F4B607`, azul `#0358F4`, rojo `#E51A38`. Display en *Titan One* con el texto
perfilado en negro.

**Tensión conocida y sin resolver:** ese contorno grueso funciona con dos palabras
(*¡JUGAR!*) y mete ruido alrededor de tres argumentos por bando, que es lo que hay que leer.
Es el punto de equilibrio que una auditoría debería mirar con lupa.

---

## 11. Problemas conocidos y deuda

- **Sin backend.** Es el techo de todo lo demás.
- **Contenido finito** (67 casos) frente a una Arena que ahora está a un toque.
- **Moderación por pares sin identidad**: nada impide hoy que cinco cuentas coordinadas
  retiren un caso legítimo, ni que un caso denunciado con razón se mantenga.
- **El enlace al bando B no transporta la foto** entre dispositivos.
- `AUDIT.md` en el repositorio documenta la Alpha 0.6.9 y describe una geometría que ya no
  existe: está obsoleto.
- Quedan en el repositorio restos de una sesión de QA antigua: `qa-case.html`,
  `qa-result.html` y ocho `qa-*.png`.
- La clave de `localStorage` sigue llamándose `zanja-beta-07` por compatibilidad, aunque la
  versión sea 0.9.

### Trampa técnica documentada

Al parchear ficheros con scripts: `$$` es una secuencia de escape en el reemplazo de
`String.replace`, así que `$$(...)` se convierte silenciosamente en `$(...)` y el fallo
aparece en ejecución, no al comprobar sintaxis. Hay que usar `split().join()`.

---

## 12. Cómo probarlo

```bash
npx http-server -p 8099 .
# abrir http://127.0.0.1:8099/index.html
```

No hay framework de tests. La verificación se hace con Playwright sobre Chromium, recorriendo
flujos reales y comprobando en cada viewport (320×568, 375×667, 390×844, 430×932): cero
errores de página, cero desbordes horizontales, cero elementos fuera de su contenedor.

Para forzar una fase concreta del debate semanal se manipula el reloj del navegador
(`page.clock.install()`).

Antes de dar nada por bueno: `node --check app.js`, y comprobar que no queden `id` que el JS
pida y el HTML no tenga, ni al revés.

---

## 13. Preguntas abiertas para la auditoría

Lo que de verdad me interesa que un tercero juzgue, en orden de importancia:

1. **¿El concepto aguanta?** Juzgar discusiones ajenas es entretenido diez minutos. ¿Qué hace
   que alguien vuelva el día 30? Hoy la respuesta es la racha, el Caso del Día y el debate
   semanal. ¿Basta?
2. **¿El bucle de creación cierra?** La app depende de que la gente lleve sus propias
   discusiones, pero crear cuesta cuatro pasos y requiere convencer a la otra parte de que
   escriba su defensa. ¿Es demasiada fricción para el motor de contenido de la app?
3. **La moderación por pares, ¿es defendible?** Nivel 5, quórum de 5, mayoría simple. ¿Se
   sostiene sin identidad verificada y sin apelación?
4. **El debate semanal por fases, ¿aporta o complica?** Son tres estados distintos que el
   usuario tiene que entender, para una actividad que ocurre una vez por semana.
5. **La pantalla de votación, ¿está resuelta?** Cuatro intentos, y el actual es el más sobrio.
   ¿Es acertado o es una rendición?
6. **Riesgo reputacional.** "Juzgamos situaciones, no personas" es una frase en una pantalla.
   ¿Qué pasa el día que alguien publique un caso con nombres y apellidos, y el jurado se
   ponga de parte del que acosa?
7. **El salto a backend.** ¿Qué reglas hay que mover al servidor **sí o sí** antes de
   enseñárselo a un usuario real que no sea el autor?

---

## 14. Resumen en cinco líneas

ZANJA es un jurado popular para discusiones cotidianas, construido como frontend estático
completo y jugable, con reglas de producto decididas y probadas pero sin servidor. La
navegación se reestructuró hace poco a cinco ranuras con creación en el centro, y el voto pasó
de gesto a toque después de tres intentos fallidos. Lo que está cerrado es el producto; lo que
está abierto es la piel, ahora mismo en exploración sobre un registro de videojuego. Los dos
riesgos reales son la retención a medio plazo y la moderación de contenido sensible sin
identidad ni backend.
