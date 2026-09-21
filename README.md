# ZANJA Beta 0.8 — Crear · Juzgar · Seguir · Moderar

Frontend completo de ZANJA. Esta build sustituye los dos modos de juego de la 0.7 (Pulso y Choque) por el ciclo real del producto: alguien publica un caso, la comunidad lo juzga, el autor ve cómo avanza y la propia comunidad decide qué contenido se queda.

## Qué incluye

**Arena Live.** Casos abiertos de la comunidad. Se vota **arrastrando la carta**: a la izquierda das la razón al bando A, a la derecha al B, hacia arriba a los dos. También valen los tres botones. Puedes filtrar por tema (convivencia, pareja, trabajo…) y, cuando no queda nada por juzgar, la app lo dice en vez de repetirte casos.

**Caso del Día.** Un caso único para todos, 24 h, como ritual diario.

**Debate Semanal.** Ciclo de cuatro fases según el día de la semana:
- lunes y martes: cualquiera propone un tema;
- miércoles: la comunidad vota qué tema quiere debatir;
- jueves a domingo: el ganador se abre como debate;
- domingo 23:59: se cierra y pasa al histórico.

**Zanjar.** Flujo de creación en cuatro pasos, con captura de una prueba fotográfica opcional y elección de audiencia y duración (15 min / 1 h / 24 h).

**Mis Zanjas.** Historial de tus casos: si están zanjándose o ya zanjados, cuántos votos llevan, el reparto A / AMBOS / B y el veredicto al cerrar. Tocar uno lo abre a pantalla completa con la votación en vivo, desde donde se comparte el veredicto.

**Denuncias y verificación.** Cualquier caso se puede denunciar desde la propia vista de votación. A la primera denuncia queda marcado *en revisión*; a la tercera sale de Arena. El panel de verificación se desbloquea en el nivel 5 y decide por mayoría simple al quinto voto.

**Progresión.** XP, nivel, racha, misión diaria que desaparece al completarse, y 16 logros.

**Sistema.** Sonido sintetizado con Web Audio, haptics cuando el navegador los soporta, `prefers-reduced-motion`, persistencia en `localStorage` y PWA estática lista para Vercel.

## XP

| Acción | XP |
|---|---|
| Votar en Arena | +5 |
| Emitir una verificación | +10 |
| Caso del Día | +15 |
| Proponer tema semanal | +15 |
| Votar el debate semanal | +25 |
| Publicar un caso | +40 |

Cada nivel son 150 XP. El nivel 5 (600 XP) abre el panel de verificación.

## Importante

Esta build es **frontend**. No hay backend: los votos, las denuncias y el debate semanal viven en el `localStorage` de cada dispositivo, y el recuento de votos de un caso publicado se deriva del tiempo que lleva abierto en vez de venir de gente real. Sirve para validar el producto y el flujo completo; para que sea multiusuario de verdad hace falta el backend descrito en `PRODUCT_SPEC.md`.

## Ejecutar en local

Cualquier servidor estático sobre la raíz del repositorio:

```
npx http-server -p 8099 .
```

Y abrir `http://127.0.0.1:8099/index.html`. No hay build ni dependencias de runtime.

## Archivos de diseño y producto

- `DESIGN_SYSTEM.md`: identidad visual y reglas escalables.
- `PRODUCT_SPEC.md`: arquitectura de producto y reglas de cada modo.
- `QA_AUDIT.md`: qué se ha probado y qué limitaciones tiene la build.
