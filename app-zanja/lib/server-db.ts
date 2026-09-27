import {env} from 'cloudflare:workers';
export function db():D1Database {if(!env.DB) throw new Error('Database unavailable'); return env.DB;}

// El bucket es opcional: si no está atado, las pruebas gráficas van a la
// base de datos. Ver lib/almacen.ts, que explica por qué.
export function bucketOpcional():R2Bucket|null {return (env as unknown as {BUCKET?:R2Bucket}).BUCKET ?? null;}

// Secreto con el que se firman las sesiones. En producción lo pone la
// plataforma; en local se usa uno fijo para no tener que configurar nada, pero
// sólo cuando la petición viene de la propia máquina. Así es imposible
// desplegar de verdad con el secreto de desarrollo sin darse cuenta.
const DEV_SECRET='zanja-desarrollo-local-no-usar-en-produccion';
const LOCAL_HOSTS=new Set(['localhost','127.0.0.1','::1','0.0.0.0']);

export function sessionSecret(req:Request):string{
 const configured=(env as unknown as Record<string,unknown>).SESSION_SECRET;
 if(typeof configured==='string'&&configured.length>=32)return configured;
 const host=new URL(req.url).hostname;
 if(LOCAL_HOSTS.has(host)||host.endsWith('.local'))return DEV_SECRET;
 // Distinguir los dos casos ahorra una tarde: desde fuera se ven igual, y
 // "no llega" y "es corto" se arreglan de formas distintas.
 // Qué ataduras ve el Worker. Son sólo los nombres, nunca los valores: si
 // la lista sale vacía o sin DB, el problema no es el secreto sino que al
 // Worker no le llega su entorno.
 let vistas='(no se han podido leer)';
 try{vistas=Object.keys(env as unknown as Record<string,unknown>).sort().join(', ')||'(ninguna)';}catch{}
 throw new Error(configured==null
  ? `SESSION_SECRET no llega al Worker. Ataduras que sí ve: ${vistas}`
  : typeof configured!=='string'
   ? 'SESSION_SECRET no es texto.'
   : `SESSION_SECRET demasiado corto: tiene ${configured.length} caracteres y hacen falta 32.`);
}

// La plataforma de ChatGPT Sites inyectaba la identidad en una cabecera. Fuera
// de ella esa cabecera la puede enviar cualquiera, así que sólo se acepta si el
// despliegue declara que tiene delante un proxy de confianza que la limpia.
export function trustsPlatformHeader():boolean{
 return (env as unknown as Record<string,unknown>).TRUST_PLATFORM_HEADER==='1';
}

// Vueltas de PBKDF2 al crear una cuenta. Se puede subir por variable de
// entorno cuando el plan aguante más CPU; ver app/api/auth/LEEME.md.
export function pbkdf2Rounds():unknown{
 return (env as unknown as Record<string,unknown>).PBKDF2_ROUNDS;
}

// Dirección pública del sitio, para las tarjetas de compartir. Sólo hace falta
// si el despliegue está detrás de algo que no reenvía la cabecera Host.
export function sitioUrl():string|null{
 const valor=(env as unknown as Record<string,unknown>).SITIO_URL;
 return typeof valor==='string'&&valor.startsWith('http')?valor.replace(/\/$/,''):null;
}
