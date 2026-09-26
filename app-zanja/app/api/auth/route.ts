import {db,sessionSecret,pbkdf2Rounds} from '@/lib/server-db';
import {SESSION_COOKIE,SESSION_DAYS,cleanName,readCookie,sessionCookie,signSession,verifySession,NAME_MIN,NAME_MAX} from '@/lib/session';
import {CLAVE_MIN,derivar,handleDe,iguales,limpiaClave,nuevaSal,rondasDe} from '@/lib/passwords';
export const dynamic='force-dynamic';

const fail=(error:string,status=400)=>Response.json({error},{status});
const noStore={'Cache-Control':'no-store'};

/** Intentos fallidos seguidos antes de descansar, y cuánto se descansa. */
const FALLOS_MAX=6, CASTIGO=120000;
/** Sal de mentira para que un nombre que no existe tarde lo mismo que uno que sí. */
const SAL_FANTASMA='ZanjaNoExisteEstaCuenta';

type Cuenta={uid:string;name:string;hash:string;salt:string;rounds:number;fails:number;blocked:number};

/** Un identificador nuevo, sin relación con el nombre. */
function nuevoUid(){
 return 'u_'+[...crypto.getRandomValues(new Uint8Array(8))].map(b=>b.toString(16).padStart(2,'0')).join('');
}

async function abrirSesion(req:Request,uid:string,name:string){
 const session={uid,name,exp:Date.now()+SESSION_DAYS*86400000};
 const token=await signSession(session,sessionSecret(req));
 return Response.json({user:{uid,name}},
  {headers:{...noStore,'Set-Cookie':sessionCookie(req,token,SESSION_DAYS*86400)}});
}

/** Quién soy. */
export async function GET(req:Request){try{
 const session=await verifySession(readCookie(req,SESSION_COOKIE),sessionSecret(req));
 return Response.json({user:session?{uid:session.uid,name:session.name}:null},{headers:noStore});
}catch(e){console.error(e);return fail('No hemos podido comprobar tu sesión.',503);}}

/**
 * Crear una cuenta o entrar en la tuya.
 *
 * El nombre identifica y la contraseña demuestra que eres tú. Antes bastaba
 * con escribir el nombre de otro para ser esa persona; ver app/api/auth/LEEME.md.
 */
export async function POST(req:Request){try{
 const origin=req.headers.get('origin');
 if(origin&&origin!==new URL(req.url).origin)return fail('Origen no permitido.',403);
 let body:Record<string,unknown>;
 try{body=await req.json() as Record<string,unknown>;}catch{return fail('Solicitud no válida.');}

 const name=cleanName(body?.name);
 if(!name)return fail(`Escribe un nombre de entre ${NAME_MIN} y ${NAME_MAX} caracteres, sin símbolos raros.`);
 const clave=limpiaClave(body?.password);
 if(!clave)return fail(`La contraseña necesita al menos ${CLAVE_MIN} caracteres.`);
 const registrar=body?.action==='registrar';
 const handle=handleDe(name), database=db(), ahora=Date.now();

 if(registrar){
  if(handleDe(clave)===handle)return fail('La contraseña no puede ser tu propio nombre.');
  const vueltas=rondasDe(pbkdf2Rounds());
  const sal=nuevaSal(), hash=await derivar(clave,sal,vueltas), uid=nuevoUid();
  try{
   await database.prepare('INSERT INTO users (uid,name,handle,hash,salt,rounds,created,fails,blocked) VALUES (?,?,?,?,?,?,?,0,0)')
    .bind(uid,name,handle,hash,sal,vueltas,ahora).run();
  }catch{return fail('Ese nombre ya está cogido. Prueba con otro.',409);}
  return abrirSesion(req,uid,name);
 }

 const cuenta=await database.prepare('SELECT uid,name,hash,salt,rounds,fails,blocked FROM users WHERE handle=?').bind(handle).first() as Cuenta|null;
 if(cuenta&&Number(cuenta.blocked)>ahora){
  const faltan=Math.ceil((Number(cuenta.blocked)-ahora)/1000);
  return fail(`Demasiados intentos. Prueba otra vez en ${faltan} segundos.`,429);
 }
 // Sin cuenta también se calcula una huella: si no, el tiempo de respuesta
 // diría qué nombres existen.
 const hash=await derivar(clave,cuenta?.salt||SAL_FANTASMA,Number(cuenta?.rounds)||rondasDe(pbkdf2Rounds()));
 if(!cuenta||!iguales(hash,String(cuenta.hash))){
  if(cuenta){
   const fallos=Number(cuenta.fails)+1, castigo=fallos>=FALLOS_MAX?ahora+CASTIGO:0;
   await database.prepare('UPDATE users SET fails=?,blocked=? WHERE uid=?')
    .bind(castigo?0:fallos,castigo,cuenta.uid).run();
  }
  return fail('Nombre o contraseña incorrectos.',401);
 }
 if(Number(cuenta.fails))await database.prepare('UPDATE users SET fails=0,blocked=0 WHERE uid=?').bind(cuenta.uid).run();
 return abrirSesion(req,String(cuenta.uid),String(cuenta.name));
}catch(e){console.error(e);return fail('No hemos podido iniciar tu sesión.',503);}}

/** Salir. */
export async function DELETE(req:Request){
 return Response.json({user:null},{headers:{...noStore,'Set-Cookie':sessionCookie(req,'',0)}});
}
