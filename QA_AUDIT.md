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

## Responsive
Home del veterano medido en Chromium:

| Viewport | overflow-x | Elementos fuera de caja |
|---|---|---|
| 320×568 | no | ninguno |
| 375×667 | no | ninguno |
| 390×844 | no | ninguno |
| 430×932 | no | ninguno |

Las pantallas de panel (semanal, mis zanjas, verificación) hacen scroll controlado, como permite el Design System para pantallas que no son de juego.

## Fallos encontrados y corregidos durante el QA
- Añadir o quitar una prueba fotográfica re-renderizaba el paso 1 de Zanjar y borraba el texto ya escrito.
- `percentage()` devolvía `NaN` con un caso recién publicado y 0 votos.
- La cabecera del panel de verificación desbordaba con el contador de verificaciones.
- Concordancia de plural en «1 zanjada» y «1 caso creado».

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
