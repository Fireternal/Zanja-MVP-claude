import {sessionSecret} from '@/lib/server-db';
import {SESSION_COOKIE,SESSION_DAYS,cleanName,readCookie,sessionCookie,signSession,userIdFor,verifySession,NAME_MIN,NAME_MAX} from '@/lib/session';
export const dynamic='force-dynamic';

const fail=(error:string,status=400)=>Response.json({error},{status});
const noStore={'Cache-Control':'no-store'};

/** Quién soy. */
export async function GET(req:Request){try{
 const session=await verifySession(readCookie(req,SESSION_COOKIE),sessionSecret(req));
 return Response.json({user:session?{uid:session.uid,name:session.name}:null},{headers:noStore});
}catch(e){console.error(e);return fail('No hemos podido comprobar tu sesión.',503);}}

/** Entrar con un nombre. Provisional: ver el aviso de app/api/auth/LEEME.md */
export async function POST(req:Request){try{
 const origin=req.headers.get('origin');
 if(origin&&origin!==new URL(req.url).origin)return fail('Origen no permitido.',403);
 let body:unknown;
 try{body=await req.json();}catch{return fail('Solicitud no válida.');}
 const name=cleanName((body as Record<string,unknown>)?.name);
 if(!name)return fail(`Escribe un nombre de entre ${NAME_MIN} y ${NAME_MAX} caracteres, sin símbolos raros.`);
 const secret=sessionSecret(req);
 const session={uid:await userIdFor(name,secret),name,exp:Date.now()+SESSION_DAYS*86400000};
 const token=await signSession(session,secret);
 return Response.json({user:{uid:session.uid,name:session.name}},{headers:{...noStore,'Set-Cookie':sessionCookie(req,token,SESSION_DAYS*86400)}});
}catch(e){console.error(e);return fail('No hemos podido iniciar tu sesión.',503);}}

/** Salir. */
export async function DELETE(req:Request){
 return Response.json({user:null},{headers:{...noStore,'Set-Cookie':sessionCookie(req,'',0)}});
}
