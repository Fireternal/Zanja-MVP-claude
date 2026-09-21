# ZANJA Beta 0.7 — QA / Product Rebuild Audit

## Alcance
Esta versión se ha reconstruido como una SPA estática desde la arquitectura de producto, no modificando la jerarquía anterior con parches de CSS.

## Comprobaciones técnicas
- `node --check app.js`: correcto.
- HTML: estructura de pantallas separada por responsabilidades.
- Manifest y configuración Vercel: JSON válido.
- Sin dependencias JS externas en runtime.
- Sonido: Web Audio generado en cliente; se degrada si no hay AudioContext.
- Haptics: se degrada si no existe `navigator.vibrate`.
- `prefers-reduced-motion`: soportado.
- Persistencia local: `zanja-beta-07`.

## Flujos recorridos automáticamente en Chromium
Se recorrieron sin errores JavaScript:
1. Home → Arena.
2. Voto Arena → reveal → countdown.
3. Pulso completo de 7 casos → resultado final.
4. Choque demo completo de 7 casos → comparación final.
5. Zanjar: historia → defensa A → B local beta → audiencia/duración → publicación.
6. Apertura de Perfil / Tu Instinto.

Resultado del recorrido: **0 page errors**.

## Responsive medido
Core Arena medido en Chromium:

| Viewport | Core dentro del viewport |
|---|---|
| 320×568 | Sí |
| 375×667 | Sí |
| 390×844 | Sí |
| 430×932 | Sí |

En los cuatro tamaños se verificó que pregunta, battlefield y voto permanecen dentro del viewport. La pantalla de juego no depende de scroll documental.

## Auditoría visual
Se revisaron renders de:
- Home 390×844.
- Arena 390×844.
- Arena resultado.
- Pulso.
- Choque setup.
- Zanjar paso 1.
- Zanjar paso 2 (pregunta + argumentos grandes).
- Zanjar paso 3 (invitación B).
- Zanjar paso 4 (audiencia + duración + CTA).
- Perfil.

### Correcciones realizadas tras QA
- Home: ZANJAR dejó de ocupar una fila implícita minúscula; tiene una tercera fila de modo real.
- Arena: A y B se solapan bajo la grieta para evitar la antigua “tercera banda” oscura.
- Arena: la grieta central se redujo a una frontera estrecha tipo rayo, con VS anclado en su nodo.
- Arena: se corrigieron 4–6 px de overflow vertical detectados en 320/375/390/430.
- Zanjar: inputs, argumentos, duración y CTAs se escalaron a tamaños del Design System.

## Qué es real en esta beta frontend
- Modos y reglas diferenciadas.
- Voto, score, combo, resultados y progresión local.
- XP, nivel, racha y logros locales.
- Creación de casos locales y aparición en Arena.
- Actividad local.
- Historial básico.
- Motion, sonido y drag del VS.

## Qué necesita backend para ser beta multiusuario
- Jurado compartido en tiempo real.
- Invitación real a B y respuesta independiente.
- Choque entre dos dispositivos.
- Cierre real por servidor.
- Notificaciones push.
- Moderación, reportes y cuentas.

No se simula que estas capacidades ya sean multiusuario: el frontend deja preparado el producto y el siguiente paso es conectar Supabase.
