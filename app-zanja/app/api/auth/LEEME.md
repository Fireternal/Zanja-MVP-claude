# La sesión de ZANJA

## Cómo funciona ahora

1. La persona escribe un nombre.
2. El servidor deriva un identificador estable: `SHA-256(secreto + nombre)`.
   El mismo nombre da siempre la misma persona, también desde otro móvil.
3. Ese identificador viaja en una cookie **firmada con HMAC-SHA256** y marcada
   `HttpOnly`, `SameSite=Lax` y `Secure` fuera de local. El navegador la guarda
   pero el JavaScript de la página no puede leerla.
4. Cada petición verifica la firma. Si alguien toca un solo carácter, la sesión
   deja de valer.

El secreto sale de `SESSION_SECRET`. Si no está definido y la petición viene de
`localhost`, se usa uno fijo de desarrollo; fuera de local, sin secreto, la app
falla a propósito en vez de arrancar insegura.

## Lo que esto es y lo que no es

**Es** una identidad portable: funciona en local, en Cloudflare y en cualquier
sitio que ejecute el código, sin depender de la plataforma de ChatGPT.

**No es** autenticación de verdad. Cualquiera que escriba tu nombre entra como
tú. Sirve para desarrollar, para probar el bucle con dos identidades y para una
beta cerrada entre gente conocida. **No sirve para abrir al público.**

## Qué haría falta para abrirlo

Cambiar sólo el paso 1: en vez de aceptar un nombre, verificar a la persona
—enlace mágico por correo, o entrar con Google/Apple— y derivar el `uid` de la
identidad verificada. Todo lo demás (la cookie, la firma, la comprobación en
cada petición) se queda igual, porque ya está separado.

## La cabecera de la plataforma

El código original leía `oai-authenticated-user-id`, que inyectaba el proxy de
ChatGPT Sites. Esa cabecera la puede enviar cualquiera desde fuera, así que ya
**no se acepta por defecto**. Si algún día se despliega detrás de un proxy que
de verdad la ponga y la limpie, se activa con `TRUST_PLATFORM_HEADER=1`.
