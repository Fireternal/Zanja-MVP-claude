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
