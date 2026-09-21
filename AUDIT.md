# ZANJA Alpha 0.6.9 — Lightning Clash · Auditoría

## Qué se rehizo
Esta versión vuelve a la build estable 0.6.5 y reconstruye el bloque de enfrentamiento sin reutilizar las geometrías defectuosas de 0.6.6–0.6.8.

## Geometría del enfrentamiento
- A y B son dos campos de color de una única arena.
- No existe una tercera banda central.
- La zona Ink visible es exclusivamente el espacio negativo entre dos contornos complementarios.
- La grieta mantiene una diagonal amplia y sólo se vuelve rayo alrededor del VS.
- El VS queda centrado sobre el nodo de choque y no empuja el layout.
- El contenido de B empieza por debajo de la zona de impacto para evitar cortes de texto o etiquetas.

## UI conservada
- Botones A / AMBOS / B con carcasa Ink, caras cian/amarillo/coral, bisel y ligera inclinación.
- AMBOS permanece amarillo.
- Hold + drag del VS: arriba A, abajo B, lateral AMBOS.
- Fondo animado, sonidos, haptics y entradas/salidas.
- Resultado con avance automático tras 5 segundos y barra de cuenta atrás.
- Ronda Express, Arena, Zanjar, Caso del Día y Tu Instinto.

## Legibilidad
- Título del caso aumentado.
- Argumentos grandes y separados.
- Zonas seguras de contenido alejadas del corte.
- Ajustes específicos para pantallas bajas y estrechas.

## Limitación de QA
El Chromium headless disponible en este entorno se bloquea por dependencias del sistema/DBus, por lo que no se afirma una captura de navegador real de esta build. La geometría del corte se verificó por separado y el código se revisó estáticamente.
