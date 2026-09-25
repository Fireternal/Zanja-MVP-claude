import {db,bucket} from '@/lib/server-db';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
 const fail=(status:number)=>new Response('Imagen no disponible',{status,headers});
 const user=req.headers.get('oai-authenticated-user-id');if(!user)return fail(401);
 try{
  const url=new URL(req.url);const c:any=await db().prepare('SELECT id,owner,status,evidence,invite,respondent FROM cases WHERE id=?').bind(url.searchParams.get('id')||'').first();
  if(!c?.evidence||c.status==='removed')return fail(404);
  if(['waiting','ready'].includes(c.status)&&c.owner!==user&&c.respondent!==user&&(!c.invite||url.searchParams.get('invite')!==c.invite))return fail(404);
  const reports:any=await db().prepare('SELECT count(*) n FROM reports WHERE case_id=?').bind(c.id).first();
  if(reports.n>=3&&c.owner!==user)return fail(404);
  const image=await bucket().get(c.evidence);if(!image)return fail(404);
  return new Response(image.body,{headers:{...headers,'Content-Type':'image/webp','Content-Length':String(image.size),'Content-Disposition':'inline; filename="prueba.webp"'}});
 }catch(error){console.error('Evidence unavailable',error);return fail(503);}
}
