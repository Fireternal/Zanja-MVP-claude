// Contraseñas.
//
// Se guarda la huella de la contraseña, nunca la contraseña. La huella sale de
// PBKDF2-SHA256 con una sal distinta por persona, así que dos personas con la
// misma contraseña tienen huellas distintas y una tabla robada no se puede
// mirar contra un diccionario ya calculado.
//
// El número de vueltas se guarda con cada huella. Eso permite subirlo cuando
// el despliegue aguante más CPU sin invalidar las cuentas que ya existen: cada
// huella se comprueba con las vueltas con las que se creó.
//
// Sólo usa WebCrypto, que está igual en Workers y en el navegador; la vitrina
// ejecuta exactamente este mismo código.

/** Vueltas por defecto. Ver app/api/auth/LEEME.md antes de tocarlo. */
export const RONDAS=32000;
export const RONDAS_MIN=10000;
export const RONDAS_MAX=600000;
export const CLAVE_MIN=8;
export const CLAVE_MAX=200;

const bytes=new TextEncoder();

const aBase64=(raw:Uint8Array)=>{
 let texto='';for(const b of raw)texto+=String.fromCharCode(b);
 return btoa(texto).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
};

/** Una sal nueva, aleatoria, de 16 bytes. */
export const nuevaSal=()=>aBase64(crypto.getRandomValues(new Uint8Array(16)));

/** La huella de una contraseña con su sal y sus vueltas. */
export async function derivar(clave:string,sal:string,vueltas:number=RONDAS):Promise<string>{
 const material=await crypto.subtle.importKey('raw',bytes.encode(clave),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits(
  {name:'PBKDF2',salt:bytes.encode(sal),iterations:vueltas,hash:'SHA-256'},material,256);
 return aBase64(new Uint8Array(bits));
}

/**
 * Comparación que tarda lo mismo acierte o falle.
 *
 * Con `a===b` el tiempo depende de cuántos caracteres coinciden, y eso, medido
 * muchas veces, deja adivinar la huella carácter a carácter.
 */
export function iguales(a:string,b:string):boolean{
 if(a.length!==b.length)return false;
 let diferencia=0;
 for(let i=0;i<a.length;i++)diferencia|=a.charCodeAt(i)^b.charCodeAt(i);
 return diferencia===0;
}

/** La contraseña tal y como se acepta, o null si no vale. */
export function limpiaClave(valor:unknown):string|null{
 if(typeof valor!=='string')return null;
 if(valor.length<CLAVE_MIN||valor.length>CLAVE_MAX)return null;
 if(!valor.trim())return null;
 return valor;
}

/** La forma en la que un nombre es único: sin mayúsculas ni espacios de más. */
export const handleDe=(nombre:string)=>nombre.trim().replace(/\s+/g,' ').toLocaleLowerCase('es');

/** Vueltas que se usarán al crear una cuenta, según lo que diga el entorno. */
export function rondasDe(valor:unknown):number{
 const n=Number(valor);
 return Number.isFinite(n)&&n>=RONDAS_MIN&&n<=RONDAS_MAX?Math.floor(n):RONDAS;
}
