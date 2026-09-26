# Publicar ZANJA en Cloudflare

Para tener una dirección pública tipo `https://zanja.<lo-tuyo>.workers.dev`,
publicando **a mano desde tu ordenador**.

> Si lo que quieres es que la dirección se actualice sola cada vez que se sube
> un cambio a GitHub, sin instalar nada ni abrir una terminal, la guía es
> [`DESPLIEGUE-AUTOMATICO.md`](DESPLIEGUE-AUTOMATICO.md). Las dos llevan al
> mismo sitio.

Los pasos que piden tu cuenta los tienes que ejecutar tú: abren el navegador y
crean recursos que se facturan a tu nombre. Lo demás ya está preparado.

Todo se hace desde `app-zanja/`.

---

## 1. Entrar en tu cuenta

```sh
corepack pnpm exec wrangler login
```

Abre el navegador y pide permiso. Una sola vez por máquina.

## 2. Crear la base de datos

```sh
corepack pnpm exec wrangler d1 create zanja
```

Responde con un bloque parecido a este:

```
[[d1_databases]]
binding = "DB"
database_name = "zanja"
database_id = "a1b2c3d4-...."
```

**Copia el `database_id`.** Hace falta en el paso 4.

## 3. Crear el almacén de imágenes

```sh
corepack pnpm exec wrangler r2 bucket create zanja-pruebas
```

Si Cloudflare te dice que R2 no está activado, actívalo en el panel
(*R2 → Enable*) y repite el comando. Es donde se guardan las pruebas
fotográficas de los casos.

## 4. Apuntar la configuración

```sh
cp despliegue.ejemplo.json despliegue.json
```

Y edita `despliegue.json` con el identificador del paso 2:

```json
{
  "worker": "zanja",
  "d1": { "nombre": "zanja", "id": "a1b2c3d4-...." },
  "r2": { "nombre": "zanja-pruebas" }
}
```

Este archivo no se sube al repositorio. (Los mismos valores se pueden pasar
como variables de entorno `ZANJA_WORKER`, `ZANJA_D1_NOMBRE`, `ZANJA_D1_ID` y
`ZANJA_R2_NOMBRE`; es lo que hace Cloudflare cuando compila solo.)

## 5. Compilar y publicar

```sh
corepack pnpm build
corepack pnpm desplegar
```

Al terminar te da la dirección. Ya es pública, pero todavía no tiene tablas.

## 6. Crear las tablas

```sh
corepack pnpm migrar --remoto
```

Aplica las tres migraciones sobre la base de datos de verdad. Wrangler apunta
en la propia base cuáles ha aplicado, así que repetirlo no rompe nada: las que
ya están se saltan. Sin el `--remoto` se aplican a la base local de tu máquina.

## 7. El secreto de las sesiones

```sh
openssl rand -base64 32                                  # genera uno
corepack pnpm exec wrangler secret put SESSION_SECRET    # y lo pegas
```

Hasta que no exista, entrar devuelve error **a propósito**: la app prefiere
fallar a arrancar con un secreto de desarrollo. No hace falta volver a
publicar; el secreto se aplica al momento.

### Otras variables (opcionales)

| Variable | Para qué | Si no está |
|---|---|---|
| `PBKDF2_ROUNDS` | Vueltas al cifrar contraseñas nuevas. Con el plan de pago cabe `200000`. | 32.000, que es lo que cabe en el límite de CPU del plan gratuito. Ver `app/api/auth/LEEME.md`. |
| `SITIO_URL` | La dirección pública, para las tarjetas de compartir. | Se deduce de la cabecera `Host` de cada petición, que es lo normal. Sólo hace falta si delante hay algo que no la reenvía. |


---

## Comprobar que funciona

```sh
curl "https://zanja.<lo-tuyo>.workers.dev/api/game?action=state"
```

Tiene que devolver los casos. Y en el navegador: entrar con un nombre, votar, y
que el voto siga ahí al recargar.

## Publicar los cambios siguientes

```sh
corepack pnpm build && corepack pnpm desplegar
```

Y `corepack pnpm migrar --remoto` sólo cuando haya migraciones nuevas.

---

## Lo que conviene saber

- **La cabecera de la plataforma viene desactivada.** `TRUST_PLATFORM_HEADER`
  no se define, así que la identidad sólo sale de la cookie firmada. No la
  actives salvo que pongas delante un proxy que de verdad limpie esa cabecera.
- **Entrar sigue siendo provisional.** Cualquiera que escriba tu nombre entra
  como tú. Ver `app/api/auth/LEEME.md`. Vale para enseñárselo a gente conocida;
  no para anunciarlo.
- **Los datos son reales desde el minuto uno.** Los votos que se emitan en esa
  dirección se guardan de verdad. Si quieres empezar de cero, borra la base de
  datos y vuelve a crearla.
- **Coste.** Con el plan gratuito de Cloudflare, una beta entra de sobra. R2
  puede pedirte añadir método de pago al activar el servicio aunque no llegues
  a pagar nada.
