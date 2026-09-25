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
