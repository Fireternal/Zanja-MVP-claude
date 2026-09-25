# Un enlace que se actualiza solo

Esto es lo de antes con Vercel, pero en Cloudflare: **se sube un cambio a
GitHub y la dirección se actualiza sola**. No hay que instalar nada ni abrir
una terminal. Todo se hace en el panel, con el ratón, y una sola vez.

Son seis pasos. Unos veinte minutos la primera vez. Después ya no se vuelve
a tocar: cada cambio que subamos aparece en la misma dirección en un par de
minutos.

Lo único que no puedo hacer yo es esto, porque es tu cuenta. Los datos que
salgan de aquí (nombres e identificadores) no son secretos y me los puedes
pasar. **El secreto del paso 6 no: ese lo pegas tú y no me lo mandas.**

---

## 1. La base de datos

Panel de Cloudflare → **Storage & Databases** → **D1 SQL Database** →
**Create database**.

- Nombre: `zanja`
- Crear.

En la página de la base, arriba, aparece **Database ID**: algo como
`a1b2c3d4-….` **Cópialo**, hace falta en el paso 4.

## 2. Las tablas

En esa misma base → pestaña **Console**.

Abre el archivo [`db/crear-tablas.sql`](db/crear-tablas.sql) de este
repositorio, copia todo su contenido, pégalo en la consola y dale a
**Execute**.

Eso crea las tres tablas: casos, votos y denuncias. Es lo único de todo el
proceso que hay que hacer una vez y sólo una.

## 3. El almacén de imágenes

Panel → **R2 Object Storage** → **Create bucket**.

- Nombre: `zanja-pruebas`
- Crear.

Es donde se guardan las fotos que la gente adjunta como prueba en un caso.
Si Cloudflare pide activar R2 antes, actívalo; puede pedirte un método de
pago aunque con el plan gratuito no llegues a pagar nada.

## 4. Conectar GitHub

Panel → **Workers & Pages** → **Create** → pestaña **Workers** →
**Import a repository**.

- Conecta tu cuenta de GitHub y dale acceso al repositorio
  **`Fireternal/Zanja-MVP-claude`**.
- Elige ese repositorio.

Y en la pantalla de configuración que sale:

| Campo | Qué poner |
|---|---|
| **Project name** | `zanja` |
| **Branch** (rama) | `claude/eloquent-ritchie-htmxn9` |
| **Root directory** | `app-zanja` |
| **Build command** | `pnpm install --frozen-lockfile && pnpm build` |
| **Deploy command** | `pnpm desplegar` |

> El nombre del proyecto es el que aparece en la dirección final, así que
> `zanja` da `https://zanja.<lo-tuyo>.workers.dev`.
>
> La rama es la que estamos usando para trabajar. Cuando la pasemos a `main`
> se cambia aquí, en un desplegable, y ya está.

## 5. Las cuatro variables

En esa misma pantalla, **Build variables and secrets** (si no la ves, se
añaden después en *Settings → Build → Variables*). Son variables **de
compilación**, no del Worker:

| Nombre | Valor |
|---|---|
| `ZANJA_WORKER` | `zanja` |
| `ZANJA_D1_NOMBRE` | `zanja` |
| `ZANJA_D1_ID` | el identificador del paso 1 |
| `ZANJA_R2_NOMBRE` | `zanja-pruebas` |

Sin ellas la compilación se para y te dice cuál falta. Ninguna es secreta:
son nombres, y para usarlos hace falta entrar en tu cuenta.

Dale a **Deploy**. Tarda un par de minutos. Al terminar te da la dirección.

## 6. El secreto de las sesiones

Con el Worker ya creado: **Workers & Pages** → `zanja` → **Settings** →
**Variables and Secrets** → **Add** → tipo **Secret**.

- Nombre: `SESSION_SECRET`
- Valor: una cadena larga y aleatoria, 32 caracteres o más. Sirve cualquier
  cosa que no se pueda adivinar: aporrear el teclado un rato largo vale, o
  usar un generador de contraseñas.

**Guárdalo donde guardes tus contraseñas y no me lo mandes.** Es lo que firma
las sesiones: quien lo tenga puede hacerse pasar por cualquiera.

Hasta que exista, entrar en la app da error **a propósito**: prefiere fallar
antes que arrancar con un secreto de desarrollo. No hace falta volver a
desplegar, se aplica al momento.

---

## A partir de aquí

Yo subo los cambios al repositorio. Cloudflare se entera solo, compila y
actualiza la dirección. Tú recargas y lo ves. Si algo sale mal, en
**Workers & Pages → zanja → Deployments** está el registro de cada
compilación con el error concreto.

Cuando haya cambios en la base de datos te aviso, porque eso sí pide volver
a la consola de D1 un momento. No pasa en todos los cambios: sólo cuando se
añade algo que hay que guardar.

## Cosas que conviene tener claras

- **Entrar es provisional.** Cualquiera que escriba tu nombre entra como tú.
  Vale para enseñárselo a gente conocida; no para anunciarlo en público. El
  detalle está en [`app/api/auth/LEEME.md`](app/api/auth/LEEME.md).
- **Los datos son de verdad desde el primer minuto.** Los votos que se emitan
  en esa dirección se guardan. Si en algún momento quieres empezar de cero,
  se borra la base en el panel y se repiten los pasos 1 y 2.
- **La dirección es pública.** Cualquiera con el enlace entra. No hay forma
  de ponerle contraseña sin más trabajo.
- **Coste.** El plan gratuito da de sobra para una beta.

## Si prefieres hacerlo desde tu ordenador

La otra vía, con terminal, sigue documentada en [`DESPLIEGUE.md`](DESPLIEGUE.md).
Las dos llevan al mismo sitio y se pueden combinar.
