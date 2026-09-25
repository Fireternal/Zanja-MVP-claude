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

La primera vez hay que crear las tablas en la base local:

```sh
corepack pnpm migrar
```

Comprobación rápida de que la base responde:

```sh
curl "http://127.0.0.1:8787/api/game?action=state"     # 200 y el caso demo
```

## Verificaciones

```sh
node --test tests/game.test.mjs      # 24 pruebas, todas pasan
corepack pnpm exec tsc --noEmit      # sin errores
corepack pnpm build                  # compila
```

## Entrar

La app tiene sesión propia: escribes un nombre y el servidor te devuelve una
cookie firmada. Funciona igual en local que desplegada, sin depender de ninguna
plataforma.

Es provisional y no sustituye a una cuenta de verdad: quien escriba tu mismo
nombre entra como tú. Sirve para desarrollar y para una beta cerrada. Los
detalles y lo que haría falta para abrir al público están en
`app/api/auth/LEEME.md`.

Fuera de local hace falta definir `SESSION_SECRET` con 32 caracteres o más; sin
él la app falla a propósito en vez de arrancar insegura.

## Lo que se ha cambiado respecto al paquete recibido

- **Sesión portable** en lugar de la identidad por cabecera de ChatGPT Sites:
  `lib/session.ts`, `app/api/auth/`. La cabecera `oai-authenticated-user-id`
  ya no se acepta salvo que el despliegue declare `TRUST_PLATFORM_HEADER=1`,
  porque desde fuera de aquella plataforma la puede enviar cualquiera.
  Se retiró `app/chatgpt-auth.ts`, que ya no usaba nadie.
- **Se retiró `.openai/hosting.json`** con el `project_id` del sitio original.
  El propio traspaso avisa de no reutilizar esa identidad para desplegar otra
  aplicación. En su lugar queda un archivo con los nombres de los bindings
  (`DB` y `BUCKET`), que es lo único que la compilación necesita. Ver
  `.openai/LEEME.txt`.

El resto del código está tal y como se entregó.

## Publicar

Los pasos para ponerlo en internet están en `DESPLIEGUE.md`.

## Aviso sobre el proveedor

Esto depende de Cloudflare: D1 para los datos, R2 para las imágenes y el
runtime de Workers. No es un proyecto que se despliegue en cualquier hosting
estático. Si algún día se quiere mover, lo que hay que sustituir es la base de
datos (`lib/server-db.ts`, `db/`), el almacenamiento de imágenes
(`lib/evidence.ts`, `app/api/evidence/route.ts`) y la sesión.
