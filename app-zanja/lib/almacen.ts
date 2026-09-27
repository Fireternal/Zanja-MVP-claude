// El almacén de las pruebas gráficas.
//
// Por defecto viven en la propia base de datos, no en R2. El motivo no es
// técnico sino de facturación: R2 cobra por uso desde el primer byte que
// pasa de su cuota gratuita, y Cloudflare no tiene tope duro de gasto —sólo
// avisos, y llegan cuando el gasto ya está hecho—. D1 sí lo tiene: cuando se
// llena o se pasa del límite diario devuelve error y deja de escribir, pero
// no cobra nunca. Así la beta no tiene ninguna vía por la que llegue una
// factura.
//
// El precio es el techo: 500 MB de base en el plan gratuito y 2 MB por
// valor. Con imágenes topadas donde las topamos caben del orden de mil y
// pico, que para una beta sobra. Cuando deje de sobrar se ata un bucket y
// esto empieza a usarlo solo, sin tocar nada más.
//
// Al leer se mira primero el bucket y después la base, para que lo guardado
// antes de atar el bucket se siga viendo.

import {db,bucketOpcional} from './server-db';

export async function guardarPrueba(clave:string,bytes:Uint8Array):Promise<void>{
 const r2=bucketOpcional();
 if(r2){await r2.put(clave,bytes,{httpMetadata:{contentType:'image/webp'}});return;}
 await db().prepare('INSERT OR REPLACE INTO evidence (clave,bytes,at) VALUES (?,?,?)')
  .bind(clave,bytes,Date.now()).run();
}

/** Devuelve un ArrayBuffer porque es lo que Response acepta como cuerpo. */
export async function leerPrueba(clave:string):Promise<ArrayBuffer|null>{
 const r2=bucketOpcional();
 if(r2){const objeto=await r2.get(clave);if(objeto)return await objeto.arrayBuffer();}
 const fila=await db().prepare('SELECT bytes FROM evidence WHERE clave=?').bind(clave).first<{bytes:unknown}>();
 const bytes=fila?.bytes;
 if(!bytes)return null;
 if(bytes instanceof ArrayBuffer)return bytes;
 // node:sqlite y D1 pueden devolverlo como vista o como lista de números.
 if(ArrayBuffer.isView(bytes)){const v=bytes as Uint8Array;return v.buffer.slice(v.byteOffset,v.byteOffset+v.byteLength) as ArrayBuffer;}
 if(Array.isArray(bytes))return Uint8Array.from(bytes as number[]).buffer as ArrayBuffer;
 return null;
}

export async function borrarPrueba(clave:string):Promise<void>{
 const r2=bucketOpcional();
 if(r2)await r2.delete(clave).catch(e=>console.error('Evidence cleanup failed',e));
 await db().prepare('DELETE FROM evidence WHERE clave=?').bind(clave).run();
}
