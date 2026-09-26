# La sesión de ZANJA

## Cómo funciona

1. **Crear cuenta**: un nombre (2–24 caracteres) y una contraseña (8 o más).
   El nombre es único sin distinguir mayúsculas ni espacios de más, así que
   `Guillermo`, `guillermo` y `Guillermo ` son la misma cuenta.
2. De la contraseña se guarda sólo su **huella**: `PBKDF2-SHA256` con una sal
   aleatoria de 16 bytes por persona. La contraseña no se escribe en ninguna
   columna, ni en ningún registro, ni viaja en ninguna respuesta.
3. **Entrar** vuelve a calcular la huella con la sal de esa cuenta y la compara
   en tiempo constante. Si coincide, el servidor firma una cookie.
4. La cookie lleva `uid`, nombre y caducidad, firmada con **HMAC-SHA256** y
   marcada `HttpOnly`, `SameSite=Lax` y `Secure` fuera de local. El navegador
   la guarda pero el JavaScript de la página no puede leerla.
5. Cada petición verifica la firma. Si alguien toca un carácter, la sesión
   deja de valer.

El secreto de firma sale de `SESSION_SECRET`. Si no está definido y la petición
viene de `localhost`, se usa uno fijo de desarrollo; fuera de local, sin
secreto, la app falla a propósito en vez de arrancar insegura.

## El identificador

El `uid` es aleatorio y no tiene ninguna relación con el nombre. Antes se
derivaba del nombre, lo que permitía calcular el identificador de cualquiera
conociendo el secreto; ahora el nombre sólo sirve para encontrar la fila y para
que te vean en La Sala.

## Las vueltas de PBKDF2

`lib/passwords.ts` usa **32.000 vueltas** por defecto. No es el número que se
recomienda en un servidor normal (100.000 o más); es el que cabe en el límite
de CPU por petición del plan gratuito de Cloudflare Workers, que son 10 ms.

Cada huella guarda **con cuántas vueltas se calculó**, así que el número se
puede subir sin invalidar las cuentas que ya existen: las viejas se siguen
comprobando con las suyas y las nuevas nacen con las nuevas.

Para subirlo, define `PBKDF2_ROUNDS` en las variables del Worker (por ejemplo
`200000` con el plan de pago) y despliega. No hace falta tocar código ni migrar
nada.

## Intentos fallidos

Seis fallos seguidos en la misma cuenta la dejan en reposo **dos minutos**.
Acertar borra el contador. Un nombre que no existe tarda lo mismo en responder
que una contraseña equivocada —se calcula una huella contra una sal de mentira—
y devuelve exactamente el mismo mensaje, para que el tiempo de respuesta no
diga qué nombres hay registrados.

## Lo que esto es y lo que no es

**Es** una autenticación de verdad para una beta: nadie puede ser otra persona
sin su contraseña, y una copia robada de la base de datos no revela ninguna
contraseña.

**No es** un sistema de cuentas completo. Falta:

- **Recuperar la contraseña**. No hay correo, así que una contraseña perdida es
  una cuenta perdida. Es el primer hueco que habrá que tapar antes de abrir al
  público, y el que obliga a pedir un correo o un proveedor externo.
- **Cambiar la contraseña** desde Ajustes.
- **Cerrar las demás sesiones**: la cookie firmada vale hasta que caduca (180
  días), así que cambiar la contraseña —cuando exista— no echará a nadie.
- **Segundo factor**.

## La vitrina

`vitrina/api-local.ts` repite este mismo flujo contra `localStorage`, usando
exactamente `lib/passwords.ts`. Sirve para probar la interfaz; ahí las cuentas
viven en el navegador de cada persona y no protegen nada.
