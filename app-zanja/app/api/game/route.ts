import {db,bucket,sessionSecret,trustsPlatformHeader} from '@/lib/server-db';
import {SESSION_COOKIE,readCookie,verifySession} from '@/lib/session';
import {boundedJson,decodeEvidence} from '@/lib/evidence';
import {CHOICES,PULSE_POINTS,dayOf,percentOf as pulsePercent,questionFor,totalOf,winnerOf,type Choice,type Tally} from '@/lib/pulse';
import {seeds,categories,readDefenses,validDefenses,COMMENT_MIN,COMMENT_MAX} from '@/lib/cases';
export const dynamic='force-dynamic';
const fail=(error:string,status=400)=>Response.json({error},{status});
const reply=(data:unknown)=>Response.json(data,{headers:{'Cache-Control':'no-store'}});
// La identidad sale de la cookie firmada. La cabecera de la plataforma sólo se
// acepta si el despliegue declara que tiene delante un proxy que la limpia.
async function identity(req:Request){
 const session=await verifySession(readCookie(req,SESSION_COOKIE),sessionSecret(req));
 if(session)return session.uid;
 return trustsPlatformHeader()?req.headers.get('oai-authenticated-user-id'):null;
}
// --- La Sala -----------------------------------------------------------
// Se habla después de votar, una vez por caso y sin respuestas. Se cierra
// cuando se cierra el caso: la sentencia no se discute después de dictada.
const caseFor=async(database:any,id:string)=>seeds.find(x=>x.id===id)||await database.prepare('SELECT id,owner,respondent,status,closes FROM cases WHERE id=?').bind(id).first();
const roomOpen=(c:any)=>!!c&&c.status==='open'&&!(c.closes&&c.closes<=Date.now());

/** El día de una sala del Pulso, o null si la sala es de un caso. */
const pulseDay=(id:string)=>/^pulso-\d+$/.test(id)?Number(id.slice(6)):null;

/** Quién puede hablar en una sala, sea de un caso o del Pulso. */
async function roomContext(database:any,id:string,user:string|null){
 const dia=pulseDay(id);
 if(dia!==null){
  const voto:any=user?await database.prepare('SELECT choice FROM pulse WHERE day=? AND user_id=?').bind(dia,user).first():null;
  return {exists:true,open:dia===dayOf(),side:voto?.choice||null,protagonist:false};
 }
 const c:any=await caseFor(database,id);
 if(!c)return {exists:false,open:false,side:null,protagonist:false};
 const voto:any=user?await database.prepare('SELECT choice FROM votes WHERE case_id=? AND user_id=?').bind(id,user).first():null;
 return {exists:true,open:roomOpen(c),side:voto?.choice||null,protagonist:c.owner===user||c.respondent===user};
}

async function sala(database:any,id:string,user:string|null){
 const contexto=await roomContext(database,id,user);
 if(!contexto.exists)return {error:'No encontramos esta sala.'};
 const [rows,backing]=await database.batch([
  database.prepare('SELECT id,user_id,side,body,at FROM comments WHERE case_id=? ORDER BY at ASC').bind(id),
  database.prepare('SELECT s.comment_id,s.user_id FROM seconds s JOIN comments c ON c.id=s.comment_id WHERE c.case_id=?').bind(id)]);
 const comments=(rows.results as any[]).map(r=>({
  id:r.id,side:r.side,body:r.body,at:r.at,
  seconds:(backing.results as any[]).filter(s=>s.comment_id===r.id).length,
  seconded:!!user&&(backing.results as any[]).some(s=>s.comment_id===r.id&&s.user_id===user),
  mine:r.user_id===user}))
  .sort((x,y)=>y.seconds-x.seconds||x.at-y.at);
 return {comments,open:contexto.open,voted:!!contexto.side,spoke:comments.some(x=>x.mine),
  protagonist:contexto.protagonist};
}

/** El comentario más secundado de cada caso: el que entra en la sentencia. */
async function topComments(database:any){
 const rows=await database.prepare('SELECT c.case_id,c.id,c.side,c.body,(SELECT count(*) FROM seconds s WHERE s.comment_id=c.id) n FROM comments c').all();
 const best=new Map<string,any>();
 for(const r of rows.results as any[]){
  const previo=best.get(r.case_id);
  if(!previo||Number(r.n)>previo.seconds)best.set(r.case_id,{side:r.side,body:r.body,seconds:Number(r.n)});
 }
 return best;
}

// --- El Pulso -----------------------------------------------------------
// Una pregunta al día. El reparto se ve después de responder, como en el
// Juzgado, y los puntos se cobran al día siguiente: sin eso no hay motivo
// para volver mañana.
async function pulso(database:any,user:string|null){
 const hoy=dayOf(),ayer=hoy-1;
 const [recuento,mios]=await database.batch([
  database.prepare('SELECT day,choice,count(*) n FROM pulse GROUP BY day,choice'),
  database.prepare('SELECT day,choice FROM pulse WHERE user_id=?').bind(user||'')]);
 const marca=(d:number):Tally=>{const t:Tally={si:0,no:0};
  for(const r of recuento.results as any[])if(Number(r.day)===d&&(r.choice==='si'||r.choice==='no'))t[r.choice as Choice]=Number(r.n);
  return t;};
 const mio=(d:number)=>user?((mios.results as any[]).find(r=>Number(r.day)===d)?.choice as Choice|undefined)||null:null;

 const hoyT=marca(hoy),elegido=mio(hoy);
 const ayerT=marca(ayer),elegidoAyer=mio(ayer),ganadorAyer=winnerOf(ayerT);

 // Los aciertos sólo cuentan días ya cerrados: el de hoy todavía se mueve.
 let aciertos=0;
 for(const r of mios.results as any[]){
  const d=Number(r.day);if(d>=hoy)continue;
  if(winnerOf(marca(d))===r.choice)aciertos++;
 }

 return {day:hoy,question:questionFor(hoy),choice:elegido,
  counts:elegido?hoyT:null,total:totalOf(hoyT),
  hits:aciertos,points:aciertos*PULSE_POINTS,
  yesterday:elegidoAyer?{question:questionFor(ayer),choice:elegidoAyer,winner:ganadorAyer,
   hit:!!ganadorAyer&&ganadorAyer===elegidoAyer,points:PULSE_POINTS,
   counts:ayerT,total:totalOf(ayerT)}:null};
}

const clean=(x:unknown,max:number,min=1)=>typeof x==='string'&&x.trim().length>=min&&x.trim().length<=max?x.trim():null;
export async function GET(req:Request){try{
 const user=await identity(req); const url=new URL(req.url); const token=url.searchParams.get('invite'); const database=db();
 const room=url.searchParams.get('room');
 if(room){const r:any=await sala(database,room,user);return r.error?fail(r.error,404):reply(r);}
 if(token){const c:any=await database.prepare('SELECT id,q,tag,status,owner,a,evidence,story,workflow FROM cases WHERE invite=?').bind(token).first(); if(!c) return fail('No encontramos esta invitación.',404);return reply({invitation:{id:c.id,story:c.story,workflow:c.workflow,q:c.q,tag:c.tag,status:validDefenses(readDefenses(c.a))?c.status:'incomplete',mine:c.owner===user,evidenceUrl:c.evidence?'/api/evidence?id='+encodeURIComponent(c.id)+'&invite='+encodeURIComponent(token):null}});}
 const [cs,vs,rs]=await database.batch([database.prepare("SELECT * FROM cases WHERE status != 'removed' ORDER BY created DESC LIMIT 300"),database.prepare('SELECT case_id,choice,count(*) n FROM votes GROUP BY case_id,choice'),database.prepare('SELECT case_id,count(*) n FROM reports GROUP BY case_id')]);
 const personal=user?await database.prepare('SELECT case_id,choice,at FROM votes WHERE user_id=?').bind(user).all():{results:[]};
 const voices=await topComments(database);
 const pulse=await pulso(database,user);
 const reported=user?await database.prepare('SELECT case_id FROM reports WHERE user_id=?').bind(user).all():{results:[]};
 const now=Date.now(); const editorialIds=new Set(seeds.map(c=>c.id)); const records=[...seeds,...cs.results.filter((c:any)=>!editorialIds.has(c.id))] as any[];
 const data=records.filter(c=>!['waiting','ready'].includes(c.status)||c.owner===user||(c.status==='ready'&&c.respondent===user)).filter(c=>c.audience!=='link'||c.owner===user||c.respondent===user||c.id===url.searchParams.get('case')).filter(c=>c.owner===user||!rs.results.some((r:any)=>r.case_id===c.id&&r.n>=3)).map(c=>{
 const a=readDefenses(c.a),b=readDefenses(c.b);const needsDefenses=!validDefenses(a)||(c.status!=='waiting'&&!validDefenses(b));
 const vote:any=personal.results.find((v:any)=>v.case_id===c.id);const closed=c.closes>0&&c.closes<=now&&c.status!=='waiting';const counts={a:0,both:0,b:0,none:0};vs.results.filter((v:any)=>v.case_id===c.id).forEach((v:any)=>{counts[v.choice as keyof typeof counts]=Number(v.n);});
 return {id:c.id,story:c.story||'',audience:c.audience||'public',workflow:c.workflow||0,duration:c.duration,evidenceUrl:c.evidence?'/api/evidence?id='+encodeURIComponent(c.id):(c.editorial?c.evidenceUrl||null:null),q:c.q,tag:c.tag,at:c.at,a:c.status==='ready'&&c.owner!==user?[]:a,bt:c.bt,b,needsDefenses,emoji:c.emoji,created:c.created,closes:c.closes,status:rs.results.some((r:any)=>r.case_id===c.id&&r.n>=3)?'review':closed?'closed':needsDefenses?'incomplete':c.status,editorial:c.editorial||0,mine:c.owner===user,participant:c.respondent===user,votedAt:vote?.at||0,bilateral:!!c.respondent,choice:vote?.choice||null,counts:vote||closed||c.owner===user?counts:null,voice:vote||closed||c.owner===user?voices.get(c.id)||null:null,total:Object.values(counts).reduce((a,b)=>a+b,0),invite:c.owner===user?c.invite:undefined,reported:reported.results.some((r:any)=>r.case_id===c.id)};
 });
 const perDay:Record<string,number>={};personal.results.forEach((v:any)=>{const key=new Date(v.at).toISOString().slice(0,10);perDay[key]=(perDay[key]||0)+1;});const day=new Date(now).toISOString().slice(0,10); const today=personal.results.filter((v:any)=>new Date(v.at).toISOString().slice(0,10)===day).length;
 return reply({cases:data,pulse,profile:{votes:personal.results.length,xp:personal.results.length*5,today,dailyAchieved:Object.values(perDay).some(n=>n>=5),created:cs.results.filter((c:any)=>c.owner===user).length},signedIn:!!user,daily:seeds[Math.floor(now/86400000)%seeds.length].id});
 }catch(e){console.error(e);return fail('No hemos podido cargar la partida. Inténtalo de nuevo.',503);}}
export async function POST(req:Request){try{
 const user=await identity(req);if(!user)return fail('Inicia sesión para guardar tu participación.',401);
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return fail('Origen no permitido.',403);
 let data:any;try{data=await boundedJson(req);}catch(error){return fail(error instanceof Error?error.message:'Solicitud no válida.');} const database=db();const now=Date.now();
 if(data.action==='reset_round'){
 await database.prepare('DELETE FROM votes WHERE user_id=?').bind(user).run();
 return reply({ok:true});
 }
 if(data.action==='create'){
 const q=clean(data.q,1200,12), a=validDefenses(data.a)?data.a.map((x:string)=>x.trim()):null, at='Bando A', b=validDefenses(data.b)?data.b.map((x:string)=>x.trim()):null,bt='Bando B';
 if(!q||!a||!categories.slice(1).includes(data.tag)||!['invite','solo'].includes(data.mode)||(!b&&data.mode==='solo')||![900000,3600000,86400000].includes(data.duration))return fail('Cada bando necesita tres defensas distintas de 12 a 160 caracteres. Revisa también el relato y la duración.');
 const story=data.story==null?'':clean(data.story,1200,0);if(story===null||data.audience&&!['public','link'].includes(data.audience))return fail('Revisa el contexto y la audiencia del caso.');
 const recent:any=await database.prepare('SELECT count(*) n FROM cases WHERE owner=? AND created>?').bind(user,now-86400000).first();if(recent.n>=5)return fail('Puedes crear hasta 5 zanjas al día. Vuelve mañana.',429);
 let evidenceBytes:Uint8Array|null;try{evidenceBytes=decodeEvidence(data.evidence);}catch(error){return fail((error as Error).message);}
 const id=crypto.randomUUID(),invite=data.mode==='invite'?crypto.randomUUID():null;const status=invite?'waiting':'open';
 const evidence=evidenceBytes?`cases/${id}/evidence.webp`:null;
 if(evidence&&evidenceBytes)await bucket().put(evidence,evidenceBytes,{httpMetadata:{contentType:'image/webp'}});
 try{await database.prepare('INSERT INTO cases (id,owner,q,tag,at,a,bt,b,emoji,created,closes,status,invite,duration,evidence,story,audience,workflow) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,user,q,data.tag,at,JSON.stringify(a),bt,JSON.stringify(b||[]),'⚡',now,invite?0:now+data.duration,status,invite,data.duration,evidence,story,data.audience||'public',data.deferPublication===true?1:0).run();}catch(error){if(evidence)await bucket().delete(evidence).catch(e=>console.error('Evidence cleanup failed',e));throw error;}return reply({id,invite});
 }
 if(data.action==='respond'){
 const a=validDefenses(data.b)?data.b.map((x:string)=>x.trim()):null,at='Bando B';if(!a||!data.consent)return fail('Escribe tres defensas distintas de 12 a 160 caracteres y confirma la pregunta.');
 const invited:any=await database.prepare('SELECT a,workflow FROM cases WHERE invite=?').bind(data.invite).first();if(!invited||!validDefenses(readDefenses(invited.a)))return fail('Esta invitación es anterior al nuevo formato. Pide al autor una nueva zanja.',409);
 const result=invited.workflow?await database.prepare("UPDATE cases SET b=?,bt=?,respondent=?,status='ready',closes=0 WHERE invite=? AND status='waiting' AND owner!=?").bind(JSON.stringify(a),at,user,data.invite,user).run():await database.prepare("UPDATE cases SET b=?,bt=?,respondent=?,status='open',closes=?+duration WHERE invite=? AND status='waiting' AND owner!=?").bind(JSON.stringify(a),at,user,now,data.invite,user).run();if(!result.meta.changes)return fail('La invitación ya se ha usado o pertenece a tu propio caso.',409);return reply({ok:true,pendingPublication:!!invited.workflow});
 }
 if(data.action==='pulse'){
 if(!CHOICES.includes(data.choice))return fail('Elige sí o no.');
 const hoy=dayOf(now);
 const puesto=await database.prepare('INSERT OR IGNORE INTO pulse (day,user_id,choice,at) VALUES (?,?,?,?)').bind(hoy,user,data.choice,now).run();
 if(!puesto.meta.changes)return fail('Ya has respondido el pulso de hoy.',409);
 const tally=await database.prepare('SELECT choice,count(*) n FROM pulse WHERE day=? GROUP BY choice').bind(hoy).all();
 const counts:Tally={si:0,no:0};
 for(const r of tally.results as any[])if(r.choice==='si'||r.choice==='no')counts[r.choice as Choice]=Number(r.n);
 return reply({ok:true,choice:data.choice,counts,total:totalOf(counts)});
 }
 if(data.action==='comment'||data.action==='uncomment'){
 const sala=String(data.id||'');
 const contexto=await roomContext(database,sala,user);
 if(!contexto.exists)return fail('No encontramos esta sala.',404);
 if(data.action==='uncomment'){
  const dicho:any=await database.prepare('SELECT id FROM comments WHERE case_id=? AND user_id=?').bind(sala,user).first();
  if(dicho){await database.prepare('DELETE FROM seconds WHERE comment_id=?').bind(dicho.id).run();await database.prepare('DELETE FROM comments WHERE id=?').bind(dicho.id).run();}
  return reply({ok:true});
 }
 const body=clean(data.body,COMMENT_MAX,COMMENT_MIN);
 if(!body)return fail(`Escribe entre ${COMMENT_MIN} y ${COMMENT_MAX} caracteres.`);
 if(contexto.protagonist)return fail('La Sala es del jurado. Tu versión ya está en el caso.',403);
 if(!contexto.open)return fail('Esta sala ya está cerrada.',409);
 if(!contexto.side)return fail('Aquí se habla después de votar.',403);
 const dicho:any=await database.prepare('SELECT id FROM comments WHERE case_id=? AND user_id=?').bind(sala,user).first();
 if(dicho)return fail('Ya has hablado aquí. Borra lo tuyo si quieres decirlo de otra forma.',409);
 const id=crypto.randomUUID();
 await database.prepare('INSERT INTO comments (id,case_id,user_id,side,body,at) VALUES (?,?,?,?,?,?)').bind(id,sala,user,contexto.side,body,now).run();
 return reply({id,side:contexto.side,body,at:now});
 }
 if(data.action==='second'){
 const target:any=await database.prepare('SELECT id,user_id,case_id FROM comments WHERE id=?').bind(data.id||'').first();
 if(!target)return fail('Ese comentario ya no está.',404);
 if(target.user_id===user)return fail('Secundar es apoyar a otro, no a ti mismo.',403);
 if(!(await roomContext(database,target.case_id,user)).open)return fail('Esta sala ya está cerrada.',409);
 const quitado=await database.prepare('DELETE FROM seconds WHERE comment_id=? AND user_id=?').bind(target.id,user).run();
 if(!quitado.meta.changes)await database.prepare('INSERT OR IGNORE INTO seconds (comment_id,user_id,at) VALUES (?,?,?)').bind(target.id,user,now).run();
 const tally:any=await database.prepare('SELECT count(*) n FROM seconds WHERE comment_id=?').bind(target.id).first();
 return reply({ok:true,seconded:!quitado.meta.changes,seconds:Number(tally.n)});
 }
 const c:any=seeds.find(x=>x.id===data.id)||await database.prepare('SELECT * FROM cases WHERE id=?').bind(data.id||'').first();if(!c)return fail('No encontramos este caso.',404);
 if(data.action==='publish'){
 if(c.owner!==user)return fail('Solo quien creó el caso puede abrirlo al jurado.',403);
 if(c.status!=='ready'||!validDefenses(readDefenses(c.a))||!validDefenses(readDefenses(c.b)))return fail('Todavía faltan las dos versiones completas.',409);
 if(data.tag&&!categories.slice(1).includes(data.tag))return fail('Elige un tema válido.');
 if(!['public','link'].includes(data.audience)||![900000,3600000,86400000].includes(data.duration))return fail('Elige la audiencia y la duración.');
 const changed=await database.prepare("UPDATE cases SET tag=?,audience=?,duration=?,closes=?,status='open' WHERE id=? AND owner=? AND status='ready'").bind(data.tag||c.tag,data.audience,data.duration,now+data.duration,c.id,user).run();if(!changed.meta.changes)return fail('Este caso ya se ha publicado.',409);return reply({id:c.id});
 }
 if(data.action==='remove'){if(c.owner!==user)return fail('No puedes retirar este caso.',403);await database.prepare("UPDATE cases SET status='removed' WHERE id=? AND owner=?").bind(c.id,user).run();if(c.evidence)await bucket().delete(c.evidence).catch(e=>console.error('Evidence cleanup failed',e));return reply({ok:true});}
 if(data.action==='report'){
 if(!['Datos personales','Acoso o insultos','Contenido sensible','Relato engañoso','Otro motivo'].includes(data.reason))return fail('Selecciona un motivo.');
 await database.prepare('INSERT OR IGNORE INTO reports (case_id,user_id,reason,at) VALUES (?,?,?,?)').bind(c.id,user,data.reason,now).run();return reply({ok:true});
 }
 if(data.action==='vote'){
 if(!['a','both','b','none'].includes(data.choice))return fail('Elige una respuesta válida.');if(c.owner===user||c.respondent===user)return fail('Los protagonistas no votan su propio caso.',403);
 if(!validDefenses(readDefenses(c.a))||!validDefenses(readDefenses(c.b)))return fail('Este caso necesita tres defensas por bando antes de aceptar nuevos votos.',409);
 if(c.status!=='open'||(c.closes&&c.closes<=now))return fail('Este caso ya no acepta votos.',409);
 const reports:any=await database.prepare('SELECT count(*) n FROM reports WHERE case_id=?').bind(c.id).first();if(reports.n>=3)return fail('Este caso está en revisión.',409);
 const result=await database.prepare('INSERT OR IGNORE INTO votes (case_id,user_id,choice,at) VALUES (?,?,?,?)').bind(c.id,user,data.choice,now).run();if(!result.meta.changes)return fail('Ya has votado en este caso.',409);const tally=await database.prepare('SELECT choice,count(*) n FROM votes WHERE case_id=? GROUP BY choice').bind(c.id).all();const counts={a:0,both:0,b:0,none:0};for(const row of tally.results as any[])counts[row.choice as keyof typeof counts]=Number(row.n);return reply({ok:true,xp:5,choice:data.choice,counts,total:counts.a+counts.both+counts.b+counts.none});
 }
 return fail('Acción no disponible.');
 }catch(e){console.error(e);return fail('No se ha guardado. Conservamos tus datos para que puedas reintentarlo.',503);}}
