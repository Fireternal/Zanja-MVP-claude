# ZANJA · Beta 1.0

Esta reconstrucción parte del dossier y del documento de contexto, no del código del repositorio anterior. Sustituye la demo con recuentos simulados por una base con almacenamiento en D1 y validación en servidor.

## Navegación

- Inicio: lobby. Una acción dominante (Arena), un Caso del Día, crear zanja y progreso personal. No es un catálogo de todos los modos.
- Arena: categorías, pregunta, dos versiones legibles, voto a A/B/ambos y salto si falta contexto. Resultados ocultos antes de votar; se muestran al cerrar incluso a quien no votó. El autor puede seguir los recuentos de su propio caso.
- Mis zanjas: dos pestañas, casos creados y votados. Estado, resultados, invitación y retirada por propietario.
- Mi perfil: experiencia por participación, nivel y cuatro logros simples. Preferencias de sonido y movimiento.
- Crear: acción accesible desde Inicio y Mis zanjas, y botón central permanente en móvil.

Se retiran de esta beta el debate semanal por fases, Actividad como pestaña, la moderación desbloqueada por XP y los logros que premian alinearse con mayorías. No se elimina su posible valor futuro: se evita añadir carga antes de medir creación y repetición. Las fotos se posponen por privacidad y moderación.

## Flujos

1. Juzgar: entrar, filtrar opcionalmente, leer, votar, ver recuento, siguiente. No hay avance automático ni votación por arrastre.
2. Crear en tres pasos: pregunta/tema; versiones; duración/confirmación. El borrador se conserva solo en el dispositivo y no se presenta como caso publicado.
3. Dos modalidades: relato de una persona o dos versiones independientes. En la segunda, B recibe un enlace, ve la pregunta pero no la defensa de A, confirma el planteamiento y envía su postura. En ese momento empieza el reloj.
4. Resultados: recuentos reales, nunca simulados. Menos de cinco votos equivale a participación insuficiente, no a un veredicto. Una votación abierta se identifica como parcial.
5. Denunciar: motivo tipificado, ocultación personal, tres denunciantes distintos ocultan el caso del listado y bloquean votos nuevos. El propietario conserva acceso para retirarlo. No existe aún revisión ni apelación administrativa: permanece oculto. Esta limitación impide considerar el producto listo para un lanzamiento público sin supervisión.

## Dirección visual

Videojuego original con inspiración en el lenguaje de interfaces arcade: violeta profundo, amarillo para la acción principal, cian/coral para las posturas. Ilustración original de un mazo y dos guantes. Titan One en titulares y acciones; Nunito Sans en lectura. Si las fuentes externas no están disponibles, hay fuentes de sistema de respaldo.

Botones con volumen y pulsación; aparición de pantallas; iluminación/leve movimiento de la Arena; progreso y resultados animados; celebración al votar; sonido sintetizado opcional, apagado inicialmente. Se respeta movimiento reducido y se ofrece un ajuste adicional.

## Datos y límites

- D1: casos, votos, denuncias. Las migraciones Drizzle se aplican en publicación.
- Identidad: usuario autenticado por la plataforma. No se confía en un ID enviado en el cuerpo del cliente.
- Servidor: autoría, voto único (clave primaria compuesta), cierre, participación, token de invitación y reclamación única, ocultación por denuncias, límites de creación y cálculo de XP.
- Casos de ejemplo: 36 dilemas editoriales marcados como tales. Sus recuentos son votos reales. No se generan usuarios, audiencias ni actividad ficticia.
- Esta publicación es privada. Enlaces e invitaciones requieren acceso al sitio. Para una beta con otras personas, hay que configurar la audiencia de forma deliberada.
- No hay notificaciones push, recuperación de borradores entre dispositivos, fotografías ni administrador de moderación. No se afirma que esta versión sea adecuada para un lanzamiento público sin esas revisiones.
- Los listados de esta beta tienen límite de 300 casos. La paginación y una cola de moderación son trabajo previo a escalar.

## Validación

`node --test tests/game.test.mjs` verifica los manejadores reales contra SQLite en memoria: identidad obligatoria, voto único, recuentos ocultos, permisos, cierre, retirada, privacidad de invitaciones, respuesta única, denunciantes distintos y rechazo de escrituras de otro origen. No sustituye las pruebas de infraestructura D1 ni las de navegador.

Comprobación TypeScript y compilación de producción. La vista previa supervisada del entorno no está disponible, por lo que no se ha podido verificar visualmente en un navegador ni probar WebMCP. El diseño incluye reglas responsive y accesibilidad, pero se debe revisar en dispositivos reales antes de ampliar la beta.

## Lo siguiente que hay que medir

Aceptación de la invitación a B; finalización del flujo de creación; casos con al menos cinco votos antes del cierre; consulta posterior de resultados; repetición de uso; satisfacción de ambas partes, especialmente la menos apoyada.


## Revisión mobile-first · Beta 1.1

La pantalla principal se reconstruye para teléfono: cabecera compacta, Arena ilustrada con botón Jugar, Caso del Día y reto de cinco votos en una línea. Los historiales y logros viven en sus pestañas y desaparecen del inicio. Una alerta aparece cuando hay casos propios en marcha.

La aplicación tiene un marco de hasta 480 px, también en escritorio. La navegación inferior es permanente salvo durante la votación. El contenido se desplaza dentro de la app. La Arena usa argumentos verticales independientes de los botones; A, Ambos y B quedan en una zona fija al pie, junto al salto. Después del voto se abre una vista dedicada al resultado, con regreso a argumentos y siguiente dilema. Crear es una pantalla completa de tres pasos con acción inferior; ajustes y ayuda son paneles inferiores. Se respetan áreas seguras y ampliación del texto.

Esta versión mantiene la tecnología web/PWA; no es un paquete nativo de iOS o Android.


## Menú según boceto · Beta 1.2

El inicio presenta, en orden: reto diario compacto, Juzgado ilustrado, Caso del Día destacado y dos accesos en paralelo (Mis zanjas y Crear zanja). Se elimina el saludo del inicio. El CTA principal es «¡A ZANJAR!»; se retira todo el subtítulo inferior y se reduce la altura de la tarjeta conservando el arte. Juzgado sustituye a Arena en las etiquetas visibles y la navegación; las rutas internas y los datos no cambian. Los accesos abren el historial de casos propios, la creación y el caso diario existentes.

## Tarjetas ilustradas · Beta 1.3

Caso del Día, Mis zanjas y Crear zanja incorporan ilustraciones originales con acabado de videojuego, compartiendo materiales y luz con Juzgado. El caso diario se lee directamente sobre el fondo de la tarjeta: se elimina el panel oscuro que provenía del recorte del boceto. Mis zanjas utiliza un archivo de expedientes y Crear zanja un lápiz con pergamino. Se añaden sombras de relieve, un leve acercamiento de la ilustración al pasar el puntero y pulsación táctil, respetando movimiento reducido. Las imágenes son decorativas para lectores de pantalla; las acciones y etiquetas permanecen como texto y botones accesibles.

## Nuevo Juzgado · Beta 1.4

Preferencia permanente del propietario: retirar la coletilla anterior del inicio y no volver a incorporarla. Los títulos de Juzgado, Caso del Día, Mis zanjas y Crear zanja comparten Titan One y el tratamiento de «Dos bandos, tú decides». El amarillo se reserva como acento distintivo de acciones y de Crear zanja.

Se sustituye la composición del inicio por una cuadrícula que reparte la altura disponible entre reto, tarjeta principal, caso diario y accesos. Tiene variantes para alturas de 740 y 640 px. No se recorta el texto para forzar el encaje: las pantallas excepcionalmente bajas, el texto ampliado o los avisos de conexión mantienen desplazamiento accesible.

El Juzgado se ha reconstruido en `components/game/court.tsx`, con estilos propios en `app/court.css`. Una cabecera compacta reúne volver, título e icono de filtros. Los temas viven en un panel inferior con recuentos reales, sin fila horizontal permanente. La pregunta da paso a dos tarjetas de bando, cada una con tres defensas numeradas, un VS central y animaciones de entrada desde lados opuestos. El texto permanece estable al leer. Se vota tocando la tarjeta A o B; se elimina el dock de tres botones. Los votos históricos a Ambos conservan su recuento en los resultados. El salto queda como acción secundaria bajo el duelo.

`DefenseFields` sirve tanto la creación como las invitaciones: exactamente tres casillas, de 12 a 160 caracteres cada una y distintas entre sí. La misma validación se aplica en servidor; no basta con el formulario. El paso final permite revisar las seis defensas. Los 36 dilemas editoriales tienen tres motivos escritos expresamente por bando.

Los argumentos se almacenan como arrays JSON en las columnas de texto existentes. No se reescriben migraciones publicadas. Los textos anteriores de usuarios se conservan íntegros y los casos abiertos incompletos salen de la cola de votación. El autor puede preparar una nueva zanja con ese contenido y completar las defensas que faltan; los votos del caso original permanecen en su historial.

Validación: ocho pruebas del manejador de API contra SQLite cubren voto único, identidad, permisos, cierre, invitaciones privadas, denunciantes distintos, creación/respuesta con tres argumentos obligatorios, conservación de texto anterior y 36 casos editoriales válidos. TypeScript y compilación de producción. La infraestructura de vista previa supervisada sigue sin estar disponible; no se ha podido comprobar en navegador el encaje visual final.


## Beta 1.5 — Menu consistency and full-height duel
- One responsive title-size token and identical display font, stroke and shadow across the four menu titles. The Juzgado hero headline sits lower; label icons are removed.
- Larger arrow squares sit at bottom right on all three secondary tiles. Create uses the same dark structural shadow, preserving its yellow artwork. Narrow layouts reserve a separate lower space for arrows to avoid collisions with large titles.
- Four optimized WebP assets replace old public images: 768px wide for hero/day and 480px for shortcuts. Total 108,818 bytes versus 2,284,819 previously (95.2% smaller). Intrinsic dimensions and eager loading supplied; hero has high fetch priority. Original artwork remains unchanged.
- Court is now the full phone working surface with one compact toolbar; big team banners, saturated purple cards, stronger bevels, three numbered defenses, and card-level voting. Cards share remaining height and grow naturally for long arguments. No empty bottom region deliberately reserved. Opposing entrances and VS pulse respect reduced motion.
- TypeScript and production build verification; managed browser preview unavailable because the preview daemon mailbox is absent. Visual device verification is not claimed.


## Beta 1.6 — Shared verdict
- Removed category and source labels from duel header and the summary below each team name. Creation and invitation forms require only three defenses; legacy title columns retain generic labels for compatibility.
- Ambos is a secondary violet control in the seam between the two cards, beside VS. It has the same vote lifecycle, duplicate prevention and XP as either team.
- All results show A, Ambos, B, including zero counts. Existing server totals already count all three options and percentages use the full total. Added integration coverage for Both, persisted choice, owner/closed results, uniqueness and title-free creation/response.


## Beta 1.7 — Evidence and vertical duel
- Reframed the phone screen around one 48px toolbar, a 40px evidence/time row, the question, two equal flexible cards, centered VS seam, then a 46px Ambos action and a quiet skip link. For 390×844 and ordinary short defenses the target budget is about 80px question, 440px combined cards and 28px seam; long authored text or enlarged fonts scroll naturally without clipping.
- Removed redundant voting instruction and decorative header lightning. Both cards retain their own complete tappable surface and the three numbered defenses. Entrance motion and a subtle VS pulse respect reduced motion.
- Evidence is optional in creation step 1, with preview/change/remove and final review. Input supports JPG/PNG/WebP up to 10MB, re-encodes as WebP up to 1600px and 750KB, dropping source metadata. Request body is bounded and the server validates the stored WebP signature/length.
- Added nullable cases.evidence via generated append-only migration 0001 and logical R2 BUCKET storage. Image bytes stay in R2, metadata in D1. Cases publish only after image storage succeeds; failed DB inserts clean up the image. Removal hides and deletes the attachment.
- Compact Ver prueba action opens an accessible full-image dialog; absent evidence is passive text, never a disabled action. Viewer includes loading, error and retry. Evidence remains accessible from results and invitation review.
- Retrieval requires sign-in and obeys waiting-case invitation access, removal, and moderation restrictions. Responses are private/no-store with nosniff. Uploads do not use a public object URL.
- 12 integration tests passed, covering voting plus evidence persistence, optionality, upload validation, storage failure, invitation access, moderation and removal. TypeScript passed. Browser preview remains unavailable (supervisor mailbox absent), so exact device rendering and live upload interaction have not been visually verified.


## Beta 1.8 — Fixed viewport duel, rebuilt
- Replaced the entire duel subtree with DuelBoard and rebuilt its CSS. Every flex/grid ancestor now has min-height:0, and both team rows use minmax(0,1fr). The arena main surface cannot scroll. Removed minimum card heights, duplicate CTA strips, the metadata row and the gold full-width Ambos action.
- Question starts immediately below toolbar; attached evidence is a compact thumbnail beside it, absent images render nothing. VS stays at geometric center, while A+B / AMBOS is a violet third-choice card in the shared seam, using the same display type and shadow as A/B.
- Body text remains 16px. Hidden, noninteractive copies measure actual argument height after fonts settle and on resize. Short cases show all six defenses. If they cannot fit, each card shows one defense at a time with numbered 1–3 controls; voting enables after visiting all three or opening the complete reading dialog. Long question text exposes its complete version through the same dialog. This avoids shrinking all text or silently losing arguments. Only the optional full reading/image dialogs scroll, not the duel itself.
- Results retain their own independent scrolling container; creation and persisted evidence/vote logic are unchanged. Production build and TypeScript validate the new component. The managed preview daemon is unavailable, so browser screenshots and real-device fitting remain unverified.


## Beta 1.9 — Shared lobby/duel visual language
- Shared --game-frame and --game-bevel tokens now style the lobby hero and all voting surfaces. Duel headers use the existing optimized Juzgado artwork, purple overlays and the exact menu display-title treatment, replacing flat blue/pink strips. Readable defense text remains on quiet purple surfaces.
- Ambos is a standalone full-width third-choice card below both teams, 68px high (58px on short screens), with A+B emblem, display heading, explanation and matching arrow affordance. It is deliberately purple and illustrated; yellow remains an accent rather than a continue-style surface.
- VS stays centered in its own 30px seam. Viewport height stays fixed and existing content measurement/defense paging adapts to the reserved Ambos card. Existing 33KB WebP is reused without additional image downloads.
- TypeScript and production build checks; managed browser preview unavailable.


## Beta 2.0 — Distinct illustrated teams
- Team A uses cobalt/cyan surfaces and borders; B uses coral/rose surfaces and borders, keeping the shared purple outlines, beveled frame and menu typography.
- Generated three original glossy game-art illustrations: blue glove with A, coral glove with B, and both gloves together with A+B. Integrated the separate art into each corresponding voting choice, with decorative empty alt because the text labels provide the meaning.
- All shipped illustrations are 384×256 WebP, compressed at quality 79. The high-resolution originals are not included in the app bundle. The existing fixed viewport and adaptive defense reading remain in place.
