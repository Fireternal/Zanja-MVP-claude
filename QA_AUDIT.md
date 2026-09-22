# ZANJA Beta 0.8 — QA

## Alcance
Esta build retira Pulso y Choque y añade Debate Semanal, Mis Zanjas, pruebas fotográficas, denuncias y panel de verificación. El menú se ha reconstruido para los modos que quedan.

## Comprobaciones técnicas
- `node --check app.js`: correcto.
- Sin dependencias JS externas en runtime. El único recurso externo es Google Fonts.
- Sin referencias muertas a los modos retirados en HTML, CSS ni JS.
- Todos los `id` que pide `app.js` existen en `index.html`, y no hay `id` huérfanos.
- Sonido: Web Audio generado en cliente; se degrada si no hay AudioContext.
- Haptics: se degrada si no existe `navigator.vibrate`.
- `prefers-reduced-motion`: soportado.
- Persistencia local: `zanja-beta-07`. Si `localStorage` se llena (las pruebas fotográficas ocupan), el guardado avisa en vez de fallar en silencio.

## Flujos recorridos en Chromium
Sin errores de página en ninguno:

1. **Novato (nivel 1).** El tile de Verificar aparece bloqueado y la pantalla explica cuánto XP falta.
2. **Veterano (nivel 7).** Mis Zanjas lista un caso `ZANJÁNDOSE` y otro `ZANJADO` con su veredicto.
3. **Verificación.** Cola de 3 casos; votar RETIRAR en uno que estaba a un voto del quórum lo resuelve en el acto.
4. **Denuncia.** El botón está en la vista de caso, la hoja ofrece 5 motivos y al enviar el caso desaparece de la cola.
5. **Debate semanal.** Las tres fases verificadas forzando el reloj del navegador: propuestas (lunes), elección (miércoles, votar deja el candidato marcado y retira el resto de botones) y debate (viernes y domingo, votar da +25 XP).
6. **Prueba fotográfica.** Captura → reescalado → vista previa → publicación → aparece en Mis Zanjas con su chip → el visor abre la imagen.
7. **Misión diaria.** Visible sin completar, oculta al completarse, con la racha intacta en la cabecera.
8. **Filtro por tema.** Elegir PAREJA deja sólo casos de ese tema; agotarlo muestra un final específico que ofrece volver a la cola completa.
9. **Compartir.** Un caso abierto ofrece pedir más votos; uno cerrado, compartir el veredicto con el bando ganador y su porcentaje.
10. **Invitación a B.** En el mismo dispositivo B ve la prueba; simulando otro navegador, la app avisa de que la imagen no viaja en el enlace en vez de callarlo.

## Responsive
Home del veterano medido en Chromium:

| Viewport | overflow-x | Elementos fuera de caja |
|---|---|---|
| 320×568 | no | ninguno |
| 375×667 | no | ninguno |
| 390×844 | no | ninguno |
| 430×932 | no | ninguno |

Las pantallas de panel (semanal, mis zanjas, verificación) hacen scroll controlado, como permite el Design System para pantallas que no son de juego.

## Interacción de voto

Se retiró el arrastre por completo: cada bando es un botón y se vota tocándolo; AMBOS es un
botón ancho bajo la carta. Los bandos siguen apilados, que es lo que deja a cada argumento el
ancho completo. Verificado en Chromium que los tres destinos (`[data-side="a"]`,
`[data-side="b"]`, `[data-vote="both"]`) registran el voto correcto y muestran el marcador, y
que la carta ya no captura punteros (`touch-action:auto`).

## Reestructuración de navegación

Barra de cinco ranuras con botón central de creación. Verificado: ARENA abre la votación
manteniendo la barra visible y la pestaña marcada; el botón central abre Zanjar desde Arena;
el aviso de casos abiertos en Inicio aparece sólo si los hay y lleva a Mis Zanjas; TÚ muestra
Verificación bloqueada con barra de progreso por debajo del nivel 5 y abierta por encima;
Inicio cierra con los tres últimos veredictos, o con una llamada a Arena si aún no hay
ninguno. Sin errores de consola en 320×568, 375×667, 390×844 y 430×932.

## Fallos encontrados y corregidos durante el QA
- Añadir o quitar una prueba fotográfica re-renderizaba el paso 1 de Zanjar y borraba el texto ya escrito.
- `percentage()` devolvía `NaN` con un caso recién publicado y 0 votos.
- La cabecera del panel de verificación desbordaba con el contador de verificaciones.
- Concordancia de plural en «1 zanjada» y «1 caso creado».
- Arena reciclaba la cola entera al agotarse, incluidos los casos ya votados, que reaparecían mostrando sólo su resultado y la cuenta atrás.
- Probada una disposición horizontal de los bandos: cada uno se quedaba con media pantalla de ancho y los argumentos se rompían en cuatro líneas. Descartada.
- Atenuar el bando no elegido con `saturate`+`brightness` convertía el coral en marrón; ahora se realza el elegido en vez de apagar el otro.
- Los candidatos del debate semanal se votaban a ciegas: sólo se veía la pregunta, no las dos defensas.
- La prueba fotográfica no llegaba a B por el enlace.
- Con la barra inferior visible en Arena, el botón central tapaba el botón AMBOS: la pantalla de voto no reservaba sitio para la barra.
- La carta repartía su alto en dos mitades fijas y aplastaba los bandos por debajo de 700 px de alto (el bando B llegaba a quedar fuera). Ahora la carta se mide por su contenido y la pantalla se desplaza antes que recortar.
- Al abrir un veredicto antiguo desde Inicio el botón anunciaba una cuenta atrás que no existía.

## Qué es real en esta beta frontend
- Los cuatro modos y sus reglas.
- Voto, resultados, progresión, XP, nivel, racha y logros locales.
- Creación de casos con foto, con cierre real por tiempo y veredicto al cerrar.
- Denuncias con umbrales y verificación con quórum, aplicados en cliente.
- Ciclo semanal completo según el día de la semana.

## Qué es simulado y por qué
No hay backend, así que:
- el recuento de votos de un caso publicado se deriva del tiempo que lleva abierto, no de gente real;
- la cola de verificación arranca con tres casos de ejemplo para que el panel sea demostrable;
- los votos de los candidatos semanales se generan de forma determinista a partir de la semana.

Conviene tenerlo presente al enseñar la demo: son andamios para validar el flujo, no actividad de usuarios reales.

## Qué necesita backend
- Jurado compartido real y en tiempo real.
- Invitación real a B y respuesta independiente.
- Cierre y veredicto calculados en servidor.
- Umbrales de denuncia y quórum de verificación en servidor, no en cliente.
- Comprobación en servidor del nivel que habilita verificación.
- Almacenamiento y moderación de las pruebas fotográficas.
- Notificaciones push, cuentas y reporting.
