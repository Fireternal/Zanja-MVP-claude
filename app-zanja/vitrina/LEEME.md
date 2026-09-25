# La vitrina

La misma interfaz de ZANJA, compilada como una página suelta que funciona
**sin servidor**. Sirve para abrir un enlace y navegar la app: mirar pantallas,
votar, crear una zanja, ver cómo queda un veredicto.

## Qué es y qué no es

Toda la interfaz vive en `app/page.tsx`, que es un componente de cliente. Lo
único que necesita servidor es la API (`/api/game`, `/api/auth`), que habla con
la base de datos. La vitrina sustituye esa API por `api-local.ts`, que responde
lo mismo pero guardando en el `localStorage` del navegador.

Por tanto:

- **Cada persona ve sus propios datos.** Si votas tú y voto yo, no nos vemos.
  No hay jurado compartido, que es justo la gracia del producto.
- **Se borra al borrar los datos del navegador.** No hay copia en ninguna parte.
- **Las invitaciones no cruzan de un móvil a otro**, porque el caso vive sólo
  en el navegador de quien lo creó.

Para todo eso está el despliegue de verdad: `../DESPLIEGUE-AUTOMATICO.md`.

## Compilar

```sh
corepack pnpm vitrina        # deja el resultado en dist-vitrina/
corepack pnpm vitrina:dev    # con recarga en caliente, para trabajar
```

`empotrar.mjs` mete las imágenes de `public/` dentro del paquete en base64 y
deja las rutas relativas, para que la vitrina funcione colgando de cualquier
dirección.

## Mantenerla al día

`api-local.ts` repite a mano la lógica de `app/api/game/route.ts`. Es la
servidumbre de esto: **cuando cambie la API de verdad, hay que tocar las dos**.
Se aceptó a propósito, porque la alternativa era arrastrar el servidor entero
para poder enseñar la app.
