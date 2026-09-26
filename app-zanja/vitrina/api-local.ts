// La API de ZANJA, pero dentro del navegador.
//
// La app de verdad habla con /api/game y /api/auth, que corren en Cloudflare
// contra una base de datos D1. La vitrina no tiene servidor: este archivo
// intercepta esas mismas llamadas y las responde igual, guardando en el
// localStorage de quien mira.
//
// Sirve para navegar la app y opinar sobre ella. No sustituye al despliegue:
// aquí cada persona ve sus propios datos, nadie comparte votos con nadie y
// todo desaparece si se borran los datos del navegador. La lógica de verdad,
// la que se puede auditar, sigue estando en app/api/game/route.ts; aquí está
// repetida a propósito para que la vitrina no arrastre el servidor entero.

import {seeds,categories,readDefenses,validDefenses,COMMENT_MIN,COMMENT_MAX} from '@/lib/cases';
import {decodeEvidence} from '@/lib/evidence';
import {cleanName,NAME_MIN,NAME_MAX} from '@/lib/session';
import {juradoDeEjemplo,casosCerrados,vocesDeEjemplo,repartoPulso,vocesDelPulso,type Reparto,type Voz} from './jurado';
import {CHOICES,PULSE_POINTS,dayOf,questionFor,totalOf,winnerOf,type Choice,type Tally} from '@/lib/pulse';
import {expedienteDe} from '@/lib/expediente';
import {xpDe,puede,limiteDiario,pegaDeLlave} from '@/lib/niveles';

const LLAVE='zanja-vitrina-v1';
const SECRETO='vitrina-sin-servidor';

type Ficha={id:string;owner:string;q:string;tag:string;at:string;a:string;bt:string;b:string;emoji:string;created:number;closes:number;status:string;invite:string|null;respondent:string|null;duration:number;evidence:string|null;story:string;audience:string;workflow:number};
type Voto={case_id:string;user_id:string;choice:string;at:number};
type Denuncia={case_id:string;user_id:string;reason:string;at:number};
type Apoyo={comment_id:string;user_id:string;at:number};
type Latido={day:number;user_id:string;choice:Choice;at:number};
type Guardado={user:{uid:string;name:string}|null;cases:Ficha[];votes:Voto[];reports:Denuncia[];jury:Record<string,Reparto>;comments:Voz[];seconds:Apoyo[];pulse:Latido[]};

const vacio=():Guardado=>({user:null,cases:[],votes:[],reports:[],jury:juradoDeEjemplo(seeds.map(c=>c.id)),comments:[...vocesDeEjemplo(),...vocesDelPulso('pulso-'+dayOf())],seconds:[],pulse:[]});

function leer():Guardado{
 try{const bruto=localStorage.getItem(LLAVE);if(!bruto)return vacio();return {...vacio(),...JSON.parse(bruto)};}catch{return vacio();}
}
function escribir(g:Guardado){try{localStorage.setItem(LLAVE,JSON.stringify(g));}catch{}}

/** El mismo identificador para el mismo nombre, como en el servidor. */
async function identificador(nombre:string){
 const datos=new TextEncoder().encode(SECRETO+'\n'+nombre.trim().toLocaleLowerCase('es'));
 const resumen=new Uint8Array(await crypto.subtle.digest('SHA-256',datos));
 return 'u_'+[...resumen.slice(0,8)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

const json=(cuerpo:unknown,status=200)=>new Response(JSON.stringify(cuerpo),{status,headers:{'Content-Type':'application/json'}});
const error=(mensaje:string,status=400)=>json({error:mensaje},status);
const limpio=(x:unknown,max:number,min=1)=>typeof x==='string'&&x.trim().length>=min&&x.trim().length<=max?x.trim():null;

// --- Sesión ------------------------------------------------------------

async function auth(metodo:string,cuerpo:any){
 const g=leer();
 if(metodo==='GET')return json({user:g.user});
 if(metodo==='DELETE'){g.user=null;escribir(g);return json({user:null});}
 const nombre=cleanName(cuerpo?.name);
 if(!nombre)return error(`Escribe un nombre de entre ${NAME_MIN} y ${NAME_MAX} caracteres, sin símbolos raros.`);
 g.user={uid:await identificador(nombre),name:nombre};
 sembrarEjemplos(g);
 escribir(g);
 return json({user:g.user});
}

/** Los casos cerrados de ejemplo, una sola vez por persona. */
function sembrarEjemplos(g:Guardado){
 const uid=g.user?.uid;if(!uid)return;
 const salaHoy='pulso-'+dayOf();
 if(!g.comments.some(v=>v.case_id===salaHoy))g.comments.push(...vocesDelPulso(salaHoy));
 const ayer=dayOf()-1;
 if(!g.pulse.some(l=>l.day===ayer&&l.user_id===uid))
  g.pulse.push({day:ayer,user_id:uid,choice:'si',at:Date.now()-86400000});
 for(const {reparto,...caso} of casosCerrados(uid,Date.now())){
  if(g.cases.some(c=>c.id===caso.id))continue;
  g.cases.push(caso as Ficha);
  g.jury[caso.id]=reparto;
 }
}

// --- Partida -----------------------------------------------------------

function estadoDeLaPartida(g:Guardado,params:URLSearchParams){
 const user=g.user?.uid||null;
 const ahora=Date.now();
 const editoriales=new Set(seeds.map(c=>c.id));
 const registros:any[]=[...seeds,...g.cases.filter(c=>c.status!=='removed'&&!editoriales.has(c.id))];
 const denunciasPorCaso=(id:string)=>g.reports.filter(r=>r.case_id===id).length;
 const voces=vocesPrincipales(g);

 const data=registros
  .filter(c=>!['waiting','ready'].includes(c.status)||c.owner===user||(c.status==='ready'&&c.respondent===user))
  .filter(c=>(c.audience||'public')!=='link'||c.owner===user||c.respondent===user||c.id===params.get('case'))
  .filter(c=>c.owner===user||denunciasPorCaso(c.id)<3)
  .map(c=>{
   const a=readDefenses(c.a),b=readDefenses(c.b);
   const faltan=!validDefenses(a)||(c.status!=='waiting'&&!validDefenses(b));
   const voto=user?g.votes.find(v=>v.case_id===c.id&&v.user_id===user):undefined;
   const cerrado=c.closes>0&&c.closes<=ahora&&c.status!=='waiting';
   const counts={...{a:0,both:0,b:0,none:0},...(g.jury[c.id]||{})};
   g.votes.filter(v=>v.case_id===c.id).forEach(v=>{counts[v.choice as keyof typeof counts]++;});
   return {id:c.id,story:c.story||'',audience:c.audience||'public',workflow:c.workflow||0,duration:c.duration,
    evidenceUrl:c.evidence||(c.editorial?c.evidenceUrl||null:null),
    q:c.q,tag:c.tag,at:c.at,a:c.status==='ready'&&c.owner!==user?[]:a,bt:c.bt,b,needsDefenses:faltan,
    emoji:c.emoji,created:c.created,closes:c.closes,
    status:denunciasPorCaso(c.id)>=3?'review':cerrado?'closed':faltan?'incomplete':c.status,
    editorial:c.editorial||0,mine:c.owner===user,participant:c.respondent===user,
    votedAt:voto?.at||0,bilateral:!!c.respondent,choice:voto?.choice||null,
    counts:voto||cerrado||c.owner===user?counts:null,
    voice:voto||cerrado||c.owner===user?voces.get(c.id)||null:null,
    total:counts.a+counts.both+counts.b+counts.none,
    invite:c.owner===user?c.invite:undefined,
    reported:!!user&&g.reports.some(r=>r.case_id===c.id&&r.user_id===user)};
  });

 const mios=user?g.votes.filter(v=>v.user_id===user):[];
 const porDia:Record<string,number>={};
 mios.forEach(v=>{const k=new Date(v.at).toISOString().slice(0,10);porDia[k]=(porDia[k]||0)+1;});
 const hoy=new Date(ahora).toISOString().slice(0,10);
 const latido=pulso(g);
 const expediente=expedienteDe({votos:mios.map(v=>v.at),
  pulsos:user?g.pulse.filter(l=>l.user_id===user).map(l=>l.day):[],
  comentarios:user?g.comments.filter(v=>v.user_id===user).map(v=>v.at):[]});
 return {cases:data,expediente,
  profile:{votes:mios.length,xp:xpDe({votos:mios.length,aciertos:latido.hits,sellos:expediente.sellos}),today:mios.filter(v=>new Date(v.at).toISOString().slice(0,10)===hoy).length,
   dailyAchieved:Object.values(porDia).some(n=>n>=5),created:g.cases.filter(c=>c.owner===user&&c.status!=='removed').length},
  signedIn:!!user,daily:seeds[Math.floor(ahora/86400000)%seeds.length].id,pulse:latido};
}

function invitacion(g:Guardado,token:string){
 const c=g.cases.find(x=>x.invite===token);
 if(!c)return error('No encontramos esta invitación.',404);
 return json({invitation:{id:c.id,story:c.story,workflow:c.workflow,q:c.q,tag:c.tag,
  status:validDefenses(readDefenses(c.a))?c.status:'incomplete',
  mine:c.owner===g.user?.uid,evidenceUrl:c.evidence||null}});
}

function guardarPartida(g:Guardado,data:any){
 const user=g.user?.uid;
 if(!user)return error('Inicia sesión para guardar tu participación.',401);
 const ahora=Date.now();

 if(data.action==='reset_round'){g.votes=g.votes.filter(v=>v.user_id!==user);escribir(g);return json({ok:true});}

 if(data.action==='create'){
  const q=limpio(data.q,1200,12);
  const a=validDefenses(data.a)?data.a.map((x:string)=>x.trim()):null;
  const b=validDefenses(data.b)?data.b.map((x:string)=>x.trim()):null;
  if(!q||!a||!categories.slice(1).includes(data.tag)||!['invite','solo'].includes(data.mode)||(!b&&data.mode==='solo')||![900000,3600000,86400000].includes(data.duration))
   return error('Cada bando necesita tres defensas distintas de 12 a 160 caracteres. Revisa también el relato y la duración.');
  const story=data.story==null?'':limpio(data.story,1200,0);
  if(story===null||(data.audience&&!['public','link'].includes(data.audience)))return error('Revisa el contexto y la audiencia del caso.');
  const xp=xpDelJurado(g,user);
  if(!puede(xp,'crear'))return error(pegaDeLlave('crear'),403);
  if(data.mode==='invite'&&!puede(xp,'invitar'))return error(pegaDeLlave('invitar'),403);
  if(data.evidence&&!puede(xp,'prueba'))return error(pegaDeLlave('prueba'),403);
  const tope=limiteDiario(xp);
  if(g.cases.filter(c=>c.owner===user&&c.created>ahora-86400000).length>=tope)return error(`Puedes abrir hasta ${tope} zanjas al día. Vuelve mañana o sube de nivel.`,429);
  try{decodeEvidence(data.evidence);}catch(e){return error((e as Error).message);}
  const id=crypto.randomUUID(),invite=data.mode==='invite'?crypto.randomUUID():null;
  g.cases.push({id,owner:user,q,tag:data.tag,at:'Bando A',a:JSON.stringify(a),bt:'Bando B',b:JSON.stringify(b||[]),
   emoji:'⚡',created:ahora,closes:invite?0:ahora+data.duration,status:invite?'waiting':'open',invite,respondent:null,
   duration:data.duration,evidence:typeof data.evidence==='string'&&data.evidence?data.evidence:null,
   story,audience:data.audience||'public',workflow:data.deferPublication===true?1:0});
  escribir(g);
  return json({id,invite});
 }

 if(data.action==='respond'){
  const b=validDefenses(data.b)?data.b.map((x:string)=>x.trim()):null;
  if(!b||!data.consent)return error('Escribe tres defensas distintas de 12 a 160 caracteres y confirma la pregunta.');
  const c=g.cases.find(x=>x.invite===data.invite);
  if(!c||!validDefenses(readDefenses(c.a)))return error('Esta invitación es anterior al nuevo formato. Pide al autor una nueva zanja.',409);
  if(c.status!=='waiting'||c.owner===user)return error('La invitación ya se ha usado o pertenece a tu propio caso.',409);
  c.b=JSON.stringify(b);c.bt='Bando B';c.respondent=user;
  if(c.workflow){c.status='ready';c.closes=0;}else{c.status='open';c.closes=ahora+c.duration;}
  escribir(g);
  return json({ok:true,pendingPublication:!!c.workflow});
 }

 if(data.action==='pulse'){
  if(!CHOICES.includes(data.choice))return error('Elige sí o no.');
  const hoy=dayOf(ahora);
  if(g.pulse.some(l=>l.day===hoy&&l.user_id===user))return error('Ya has respondido el pulso de hoy.',409);
  g.pulse.push({day:hoy,user_id:user,choice:data.choice,at:ahora});
  escribir(g);
  const counts=latidos(g,hoy);
  return json({ok:true,choice:data.choice,counts,total:totalOf(counts)});
 }
 if(data.action==='comment'||data.action==='uncomment'){
  const cuarto=String(data.id||'');
  const contexto=contextoSala(g,cuarto);
  if(!contexto.existe)return error('No encontramos esta sala.',404);
  if(data.action==='uncomment'){
   const voz=g.comments.find(v=>v.case_id===cuarto&&v.user_id===user);
   if(voz){g.comments=g.comments.filter(v=>v.id!==voz.id);g.seconds=g.seconds.filter(s=>s.comment_id!==voz.id);}
   escribir(g);return json({ok:true});
  }
  const cuerpo=limpio(data.body,COMMENT_MAX,COMMENT_MIN);
  if(!cuerpo)return error(`Escribe entre ${COMMENT_MIN} y ${COMMENT_MAX} caracteres.`);
  if(contexto.protagonista)return error('La Sala es del jurado. Tu versión ya está en el caso.',403);
  if(!contexto.abierta)return error('Esta sala ya está cerrada.',409);
  if(!contexto.lado)return error('Aquí se habla después de votar.',403);
  if(g.comments.some(v=>v.case_id===cuarto&&v.user_id===user))return error('Ya has hablado aquí. Borra lo tuyo si quieres decirlo de otra forma.',409);
  const voz={id:crypto.randomUUID(),case_id:cuarto,user_id:user,name:g.user?.name||'Jurado',side:contexto.lado,body:cuerpo,at:ahora,base:0};
  g.comments.push(voz);escribir(g);
  return json({id:voz.id,name:voz.name,side:voz.side,body:voz.body,at:voz.at});
 }
 if(data.action==='second'){
  const voz=g.comments.find(v=>v.id===data.id);
  if(!voz)return error('Ese comentario ya no está.',404);
  if(voz.user_id===user)return error('Secundar es apoyar a otro, no a ti mismo.',403);
  if(!contextoSala(g,voz.case_id).abierta)return error('Esta sala ya está cerrada.',409);
  const tenia=g.seconds.some(s=>s.comment_id===voz.id&&s.user_id===user);
  g.seconds=tenia?g.seconds.filter(s=>!(s.comment_id===voz.id&&s.user_id===user)):[...g.seconds,{comment_id:voz.id,user_id:user,at:ahora}];
  escribir(g);
  return json({ok:true,seconded:!tenia,seconds:apoyos(g,voz)});
 }

 const semilla:any=seeds.find(x=>x.id===data.id);
 const propio=g.cases.find(x=>x.id===data.id);
 const c:any=semilla||propio;
 if(!c)return error('No encontramos este caso.',404);

 if(data.action==='publish'){
  if(c.owner!==user)return error('Solo quien creó el caso puede abrirlo al jurado.',403);
  if(c.status!=='ready'||!validDefenses(readDefenses(c.a))||!validDefenses(readDefenses(c.b)))return error('Todavía faltan las dos versiones completas.',409);
  if(data.tag&&!categories.slice(1).includes(data.tag))return error('Elige un tema válido.');
  if(!['public','link'].includes(data.audience)||![900000,3600000,86400000].includes(data.duration))return error('Elige la audiencia y la duración.');
  c.tag=data.tag||c.tag;c.audience=data.audience;c.duration=data.duration;c.closes=ahora+data.duration;c.status='open';
  escribir(g);
  return json({id:c.id});
 }

 if(data.action==='remove'){
  if(c.owner!==user)return error('No puedes retirar este caso.',403);
  c.status='removed';escribir(g);return json({ok:true});
 }

 if(data.action==='report'){
  if(!['Datos personales','Acoso o insultos','Contenido sensible','Relato engañoso','Otro motivo'].includes(data.reason))return error('Selecciona un motivo.');
  if(!g.reports.some(r=>r.case_id===c.id&&r.user_id===user))g.reports.push({case_id:c.id,user_id:user,reason:data.reason,at:ahora});
  escribir(g);return json({ok:true});
 }

 if(data.action==='vote'){
  if(!['a','both','b','none'].includes(data.choice))return error('Elige una respuesta válida.');
  if(c.owner===user||c.respondent===user)return error('Los protagonistas no votan su propio caso.',403);
  if(!validDefenses(readDefenses(c.a))||!validDefenses(readDefenses(c.b)))return error('Este caso necesita tres defensas por bando antes de aceptar nuevos votos.',409);
  if(c.status!=='open'||(c.closes&&c.closes<=ahora))return error('Este caso ya no acepta votos.',409);
  if(g.reports.filter(r=>r.case_id===c.id).length>=3)return error('Este caso está en revisión.',409);
  if(g.votes.some(v=>v.case_id===c.id&&v.user_id===user))return error('Ya has votado en este caso.',409);
  g.votes.push({case_id:c.id,user_id:user,choice:data.choice,at:ahora});
  escribir(g);
  const counts={...{a:0,both:0,b:0,none:0},...(g.jury[c.id]||{})};
  g.votes.filter(v=>v.case_id===c.id).forEach(v=>{counts[v.choice as keyof typeof counts]++;});
  return json({ok:true,xp:5,choice:data.choice,counts,total:counts.a+counts.both+counts.b+counts.none});
 }

 return error('Acción no disponible.');
}

// --- La Sala -----------------------------------------------------------

const abierta=(c:any)=>!!c&&c.status==='open'&&!(c.closes&&c.closes<=Date.now());
const casoDe=(g:Guardado,id:string):any=>seeds.find(x=>x.id===id)||g.cases.find(x=>x.id===id&&x.status!=='removed');
/** El día de una sala del Pulso, o null si la sala es de un caso. */
const diaDelPulso=(id:string)=>/^pulso-\d+$/.test(id)?Number(id.slice(6)):null;

/** Quién puede hablar en una sala, sea de un caso o del Pulso. */
function contextoSala(g:Guardado,id:string){
 const user=g.user?.uid||null;
 const dia=diaDelPulso(id);
 if(dia!==null){
  const voto=user?g.pulse.find(l=>l.day===dia&&l.user_id===user)?.choice||null:null;
  return {existe:true,abierta:dia===dayOf(),lado:voto as string|null,protagonista:false};
 }
 const c=casoDe(g,id);
 if(!c)return {existe:false,abierta:false,lado:null as string|null,protagonista:false};
 const voto=user?g.votes.find(v=>v.case_id===id&&v.user_id===user)?.choice||null:null;
 return {existe:true,abierta:abierta(c),lado:voto as string|null,protagonista:c.owner===user||c.respondent===user};
}
const apoyos=(g:Guardado,voz:Voz)=>voz.base+g.seconds.filter(s=>s.comment_id===voz.id).length;

function sala(g:Guardado,id:string){
 const contexto=contextoSala(g,id);
 if(!contexto.existe)return error('No encontramos esta sala.',404);
 const user=g.user?.uid||null;
 const comments=g.comments.filter(v=>v.case_id===id).map(v=>({
  id:v.id,name:v.name,side:v.side,body:v.body,at:v.at,seconds:apoyos(g,v),
  seconded:!!user&&g.seconds.some(s=>s.comment_id===v.id&&s.user_id===user),
  mine:v.user_id===user})).sort((x,y)=>y.seconds-x.seconds||x.at-y.at);
 return json({comments,open:contexto.abierta,voted:!!contexto.lado,
  spoke:comments.some(x=>x.mine),protagonist:contexto.protagonista});
}

/** El comentario más secundado de cada caso. */
function vocesPrincipales(g:Guardado){
 const mejor=new Map<string,{side:string;body:string;seconds:number}>();
 for(const v of g.comments){
  const n=apoyos(g,v),previo=mejor.get(v.case_id);
  if(!previo||n>previo.seconds)mejor.set(v.case_id,{side:v.side,body:v.body,seconds:n});
 }
 return mejor;
}

// --- El Pulso ----------------------------------------------------------

function latidos(g:Guardado,dia:number):Tally{
 const base=repartoPulso(dia);
 const t:Tally={si:base.si,no:base.no};
 for(const l of g.pulse)if(l.day===dia)t[l.choice]++;
 return t;
}

/** La experiencia de quien mira, con la misma cuenta que hace el servidor. */
function xpDelJurado(g:Guardado,user:string|null){
 if(!user)return 0;
 const mios=g.votes.filter(v=>v.user_id===user);
 const expediente=expedienteDe({votos:mios.map(v=>v.at),
  pulsos:g.pulse.filter(l=>l.user_id===user).map(l=>l.day),
  comentarios:g.comments.filter(v=>v.user_id===user).map(v=>v.at)});
 return xpDe({votos:mios.length,aciertos:pulso(g).hits,sellos:expediente.sellos});
}

function pulso(g:Guardado){
 const user=g.user?.uid||null;
 const hoy=dayOf(),ayer=hoy-1;
 const mio=(d:number)=>user?g.pulse.find(l=>l.day===d&&l.user_id===user)?.choice||null:null;
 const hoyT=latidos(g,hoy),elegido=mio(hoy);
 const ayerT=latidos(g,ayer),elegidoAyer=mio(ayer),ganadorAyer=winnerOf(ayerT);
 const aciertos=user
  ?g.pulse.filter(l=>l.user_id===user&&l.day<hoy&&winnerOf(latidos(g,l.day))===l.choice).length
  :0;
 return {day:hoy,question:questionFor(hoy),choice:elegido,
  counts:elegido?hoyT:null,total:totalOf(hoyT),
  voices:g.comments.filter(v=>v.case_id==='pulso-'+hoy).length,
  hits:aciertos,points:aciertos*PULSE_POINTS,
  yesterday:elegidoAyer?{question:questionFor(ayer),choice:elegidoAyer,winner:ganadorAyer,
   hit:!!ganadorAyer&&ganadorAyer===elegidoAyer,points:PULSE_POINTS,
   counts:ayerT,total:totalOf(ayerT)}:null};
}

// --- El interceptor ----------------------------------------------------

export function instalarApiLocal(){
 const original=window.fetch.bind(window);
 window.fetch=async(entrada:RequestInfo|URL,opciones?:RequestInit)=>{
  const url=typeof entrada==='string'?entrada:entrada instanceof URL?entrada.href:entrada.url;
  const destino=new URL(url,location.href);
  if(destino.origin!==location.origin||!destino.pathname.startsWith('/api/'))return original(entrada as any,opciones);
  const metodo=(opciones?.method||(entrada instanceof Request?entrada.method:'GET')).toUpperCase();
  let cuerpo:any=null;
  if(opciones?.body)try{cuerpo=JSON.parse(String(opciones.body));}catch{}
  await new Promise(r=>setTimeout(r,90)); // que se vean los estados de carga
  try{
   if(destino.pathname==='/api/auth')return await auth(metodo,cuerpo);
   if(destino.pathname==='/api/game'){
    const g=leer();
    if(metodo==='GET'){
     const token=destino.searchParams.get('invite');
     const cuarto=destino.searchParams.get('room');
     if(cuarto)return sala(g,cuarto);
     return token?invitacion(g,token):json(estadoDeLaPartida(g,destino.searchParams));
    }
    return guardarPartida(g,cuerpo||{});
   }
  }catch(e){console.error(e);return error('Algo ha fallado en la vitrina.',503);}
  return error('No encontramos esta ruta.',404);
 };
}
