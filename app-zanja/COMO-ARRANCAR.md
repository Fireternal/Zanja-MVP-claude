# ZANJA · cómo arrancar esto

Aplicación React 19 + Next 16 sobre el runtime de Cloudflare (Vinext + Vite).
Viene del prototipo publicado en `zanja-arena.cacahueto.chatgpt.site`, commit
`dd57bf1f`. La documentación completa del traspaso está en `../design/handoff/`.

Verificado de principio a fin el 25-09-2026 en este contenedor.

## Requisitos

Node ≥ 22.13 y pnpm (viene por corepack, no hace falta instalarlo aparte).

## Arranque de desarrollo

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm dev            # http://localhost:5173
```

Sirve la interfaz entera, pero **sin base de datos**: la app muestra el aviso
«No podemos conectar» y deja explorar sin guardar nada.

## Arranque con base de datos

```sh
corepack pnpm build
corepack pnpm start          # http://127.0.0.1:8787
```

La primera vez, y sólo la primera, hay que crear las tablas en la base local:

```sh
for f in drizzle/0000_*.sql drizzle/0001_*.sql drizzle/0002_*.sql; do
  corepack pnpm exec wrangler d1 execute site-creator-d1 \
    --config dist/server/wrangler.json --local --persist-to .wrangler/state --file "$f"
done
```

Comprobación rápida de que la base responde:

```sh
curl "http://127.0.0.1:8787/api/game?action=state"     # 200 y el caso demo
```

## Verificaciones

```sh
node --test tests/game.test.mjs      # 19 pruebas, todas pasan
corepack pnpm exec tsc --noEmit      # sin errores
corepack pnpm build                  # compila
```

## Lo que NO funciona fuera del hosting original

**La sesión.** La autenticación la ponía la plataforma de ChatGPT Sites
(`app/chatgpt-auth.ts`). En local puedes navegar y leer, pero cualquier acción
que escriba —votar, crear, denunciar— devuelve `401 Inicia sesión para guardar
tu participación`.

Es el primer trabajo real pendiente: sustituir esa autenticación por una
portable. Hasta entonces el bucle completo no se puede probar de punta a punta
fuera del sitio publicado.

## Lo que se ha cambiado respecto al paquete recibido

- **Se retiró `.openai/hosting.json`** con el `project_id` del sitio original.
  El propio traspaso avisa de no reutilizar esa identidad para desplegar otra
  aplicación. En su lugar queda un archivo con los nombres de los bindings
  (`DB` y `BUCKET`), que es lo único que la compilación necesita. Ver
  `.openai/LEEME.txt`.

Nada más. El resto del código está tal y como se entregó.

## Aviso sobre el proveedor

Esto depende de Cloudflare: D1 para los datos, R2 para las imágenes y el
runtime de Workers. No es un proyecto que se despliegue en cualquier hosting
estático. Si algún día se quiere mover, lo que hay que sustituir es la base de
datos (`lib/server-db.ts`, `db/`), el almacenamiento de imágenes
(`lib/evidence.ts`, `app/api/evidence/route.ts`) y la sesión.
