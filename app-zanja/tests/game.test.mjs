import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import ts from 'typescript';
const sql=new DatabaseSync(':memory:');
for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')))sql.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));
class Statement{constructor(query){this.query=query;this.params=[];}bind(...params){this.params=params;return this;}async first(){return sql.prepare(this.query).get(...this.params)||null;}async all(){return{results:sql.prepare(this.query).all(...this.params)};}async run(){const r=sql.prepare(this.query).run(...this.params);return{meta:{changes:Number(r.changes)}};}}
globalThis.__zanjaTestDb={prepare:q=>new Statement(q),batch:async items=>Promise.all(items.map(s=>s.all()))};
const compile=source=>ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const seedsUrl=moduleUrl(compile(readFileSync(new URL('../lib/cases.ts',import.meta.url),'utf8')));
const blobs=new Map();let failStorage=false;
globalThis.__zanjaTestBucket={put:async(key,bytes)=>{if(failStorage)throw new Error('Storage unavailable');blobs.set(key,new Uint8Array(bytes));},get:async key=>{const bytes=blobs.get(key);return bytes?{body:bytes,size:bytes.length}:null;},delete:async key=>{blobs.delete(key);}};
const evidenceUrl=moduleUrl(compile(readFileSync(new URL('../lib/evidence.ts',import.meta.url),'utf8')));
const pulseUrl=moduleUrl(compile(readFileSync(new URL('../lib/pulse.ts',import.meta.url),'utf8')));
const expedienteUrl=moduleUrl(compile(readFileSync(new URL('../lib/expediente.ts',import.meta.url),'utf8')));
const avisosUrl=moduleUrl(compile(readFileSync(new URL('../lib/avisos.ts',import.meta.url),'utf8')));
const nivelesUrl=moduleUrl(compile(readFileSync(new URL('../lib/niveles.ts',import.meta.url),'utf8')
 .replace("'./pulse'",JSON.stringify(pulseUrl)).replace("'./expediente'",JSON.stringify(expedienteUrl))));
const sessionUrl=moduleUrl(compile(readFileSync(new URL('../lib/session.ts',import.meta.url),'utf8')));
globalThis.__zanjaTestSecret='secreto-de-pruebas-con-longitud-suficiente';
globalThis.__zanjaTrustHeader=false;
const {SESSION_COOKIE,signSession}=await import(sessionUrl);
// Cada identidad de prueba es una cookie firmada de verdad, no una cabecera.
const cookieFor=async user=>SESSION_COOKIE+'='+encodeURIComponent(await signSession({uid:user,name:user,exp:Date.now()+3600000},globalThis.__zanjaTestSecret));
const source=readFileSync(new URL('../app/api/game/route.ts',import.meta.url),'utf8').replace("import {db,bucket,sessionSecret,trustsPlatformHeader} from '@/lib/server-db';","const db=()=>globalThis.__zanjaTestDb;const bucket=()=>globalThis.__zanjaTestBucket;const sessionSecret=()=>globalThis.__zanjaTestSecret;const trustsPlatformHeader=()=>globalThis.__zanjaTrustHeader===true;").replace("'@/lib/session'",JSON.stringify(sessionUrl)).replace("'@/lib/cases'",JSON.stringify(seedsUrl)).replace("'@/lib/evidence'",JSON.stringify(evidenceUrl)).replace("'@/lib/pulse'",JSON.stringify(pulseUrl)).replace("'@/lib/expediente'",JSON.stringify(expedienteUrl)).replace("'@/lib/niveles'",JSON.stringify(nivelesUrl)).replace("'@/lib/avisos'",JSON.stringify(avisosUrl));
const {GET,POST}=await import(moduleUrl(compile(source)));
const base='https://zanja.test';
/**
 * Crear una zanja exige nivel. Estas pruebas van de otra cosa, así que a quien
 * crea le damos por hecha la experiencia; la puerta se prueba aparte, pasando
 * `false` en el tercer argumento.
 */
const conLlaves=user=>{const ins=sql.prepare('INSERT OR IGNORE INTO votes (case_id,user_id,choice,at) VALUES (?,?,?,?)');for(let i=0;i<200;i++)ins.run('xp-'+i,user,'a',Date.now());};
async function request(data,user='juror',darLlaves=true){if(darLlaves&&user&&data?.action==='create')conLlaves(user);return POST(new Request(base+'/api/game',{method:'POST',headers:{'content-type':'application/json','origin':base,...(user?{cookie:await cookieFor(user)}:{})},body:JSON.stringify(data)}));}
async function state(user='juror',suffix=''){const r=await GET(new Request(base+'/api/game'+suffix,{headers:user?{cookie:await cookieFor(user)}:{}}));assert.equal(r.status,200);return r.json();}
const valid={action:'create',q:'¿Quien cocina también tiene que fregar?',tag:'Convivencia',at:'Yo cocino',a:['He preparado la cena para los dos.','He dedicado una hora a cocinar.','Quiero repartir las tareas de forma justa.'],bt:'Yo ordeno',b:['He ordenado toda la casa esta tarde.','También he trabajado durante una hora.','Yo necesito descansar después de limpiar.'],mode:'solo',duration:3600000,consent:true};
test('votes are real, private until voting, unique and persisted',async()=>{
 const initial=await state();assert.equal(initial.cases.find(c=>c.id==='pizza').counts,null);assert.equal(initial.profile.votes,0);
 assert.equal((await request({action:'vote',id:'pizza',choice:'a'},null)).status,401);
 assert.equal((await request({action:'vote',id:'pizza',choice:'invalid'})).status,400);
 assert.equal((await request({action:'vote',id:'pizza',choice:'a'})).status,200);
 assert.equal((await request({action:'vote',id:'pizza',choice:'b'})).status,409);
 const voted=await state();assert.equal(voted.profile.xp,5);assert.equal(voted.cases.find(c=>c.id==='pizza').counts.a,1);
 assert.equal((await state('other')).cases.find(c=>c.id==='pizza').counts,null);
});
test('creation enforces validation, ownership and deadline',async()=>{
 assert.equal((await request({...valid,tag:'Tema inexistente'},'author')).status,400);
 const r=await request(valid,'author');assert.equal(r.status,200);const {id}=await r.json();
 const own=(await state('author')).cases.find(c=>c.id===id);assert.equal(own.mine,true);assert.equal(own.total,0);assert.equal(own.bilateral,false);assert.deepEqual(own.a,valid.a);assert.deepEqual(own.b,valid.b);
 assert.equal((await request({action:'vote',id,choice:'a'},'author')).status,403);
 assert.equal((await request({action:'remove',id},'stranger')).status,403);
 sql.prepare('UPDATE cases SET closes=? WHERE id=?').run(Date.now()-1,id);
 assert.equal((await request({action:'vote',id,choice:'b'},'juror')).status,409);
 assert.equal((await state()).cases.find(c=>c.id===id).status,'closed');
 assert.equal((await request({action:'remove',id},'author')).status,200);
 assert.equal((await state('author')).cases.some(c=>c.id===id),false);
});
test('invitations hide A, require another participant and accept only one response',async()=>{
 const r=await request({...valid,mode:'invite',bt:'',b:''},'inviter');assert.equal(r.status,200);const{id,invite}=await r.json();
 assert.equal((await state('outsider')).cases.some(c=>c.id===id),false);
 const d=await state('respondent','?invite='+invite);assert.equal(d.invitation.q,valid.q);assert.equal('a' in d.invitation,false);
 const response={action:'respond',invite,bt:'La otra postura',b:['Tenemos que repartir todas las tareas.','Yo ya he recogido el resto de la casa.','Podemos acordar turnos para la próxima vez.'],consent:true};
 assert.equal((await request(response,'inviter')).status,409);
 assert.equal((await request(response,'respondent')).status,200);
 assert.equal((await request(response,'second')).status,409);
 const c=(await state('respondent')).cases.find(c=>c.id===id);assert.equal(c.participant,true);assert.equal(c.bilateral,true);
 assert.equal((await request({action:'vote',id,choice:'b'},'respondent')).status,403);
});
test('three distinct reports hide a case and disable further votes',async()=>{
 const {id}=await (await request(valid,'report-author')).json();
 for(const user of ['r1','r1','r2']) assert.equal((await request({action:'report',id,reason:'Datos personales'},user)).status,200);
 assert.equal((await state('visitor')).cases.some(c=>c.id===id),true);
 await request({action:'report',id,reason:'Datos personales'},'r3');
 assert.equal((await state('visitor')).cases.some(c=>c.id===id),false);
 assert.equal((await request({action:'vote',id,choice:'a'},'visitor')).status,409);
});
test('cross-origin mutations are rejected',async()=>{
 const r=await POST(new Request(base+'/api/game',{method:'POST',headers:{'content-type':'application/json','origin':'https://other.test',cookie:await cookieFor('x')},body:JSON.stringify(valid)}));assert.equal(r.status,403);
});

test('exactly three distinct arguments are mandatory on create and invitation response',async()=>{
 const variants=[[],valid.a.slice(0,1),valid.a.slice(0,2),[...valid.a,'Otro motivo adicional de prueba.'],['','',''],[valid.a[0],valid.a[0],valid.a[2]],[valid.a[0],valid.a[0].toUpperCase(),valid.a[2]],['Corto',valid.a[1],valid.a[2]],['x'.repeat(161),valid.a[1],valid.a[2]],'Un párrafo único no cumple el formato.'];
 for(const a of variants){assert.equal((await request({...valid,a},'validation')).status,400);assert.equal((await request({...valid,b:a},'validation')).status,400);}
 const {invite,id}=await(await request({...valid,mode:'invite',b:[],bt:''},'strict-author')).json();
 for(const b of variants)assert.equal((await request({action:'respond',invite,bt:'Otra postura',b,consent:true},'strict-b')).status,400);
 assert.equal((await state('strict-author')).cases.find(c=>c.id===id).status,'waiting');
 assert.equal((await request({action:'respond',invite,bt:'Otra postura',b:valid.b,consent:true},'strict-b')).status,200);
 assert.deepEqual((await state('strict-b')).cases.find(c=>c.id===id).b,valid.b);
});
test('legacy authored text is preserved and cannot receive fresh votes',async()=>{
 const {id}=await(await request(valid,'legacy-owner')).json();
 const old='Este es el párrafo original y debe conservarse íntegramente.';
 sql.prepare('UPDATE cases SET a=?,b=? WHERE id=?').run(old,old,id);
 const c=(await state('legacy-owner')).cases.find(c=>c.id===id);
 assert.equal(c.status,'incomplete');assert.equal(c.needsDefenses,true);assert.deepEqual(c.a,[old]);
 assert.equal((await request({action:'vote',id,choice:'a'},'legacy-voter')).status,409);
});
test('editorial cases each expose three complete arguments per team',async()=>{
 const editorial=(await state('content-check')).cases.filter(c=>c.editorial);
 assert.equal(editorial.length,37);
 for(const c of editorial){for(const side of ['a','b']){assert.equal(c[side].length,3,c.id);assert.equal(new Set(c[side]).size,3);assert.ok(c[side].every(x=>x.length>=12&&x.length<=160));}}
});

 test('Both votes count toward shared totals, persist, and remain unique; titles are not required',async()=>{
 const {at,bt,...noTitles}=valid;
 const created=await request(noTitles,'both-author');assert.equal(created.status,200);const {id}=await created.json();
 for(const [user,choice] of [['both-1','both'],['both-2','both'],['a-1','a'],['b-1','b']])assert.equal((await request({action:'vote',id,choice},user)).status,200);
 assert.equal((await request({action:'vote',id,choice:'a'},'both-1')).status,409);
 for(const user of ['both-1','both-author']){
 const c=(await state(user)).cases.find(x=>x.id===id);assert.deepEqual(c.counts,{a:1,both:2,b:1,none:0});assert.equal(c.total,4);assert.deepEqual(['a','both','b'].map(k=>Math.round(c.counts[k]/c.total*100)),[25,50,25]);
 }
 const participant=await state('both-1');assert.equal(participant.cases.find(x=>x.id===id).choice,'both');assert.equal(participant.profile.xp,5);
 sql.prepare('UPDATE cases SET closes=? WHERE id=?').run(Date.now()-1,id);
 assert.deepEqual((await state('reader')).cases.find(x=>x.id===id).counts,{a:1,both:2,b:1,none:0});
 const inv=await request({...noTitles,mode:'invite'},'no-title-inviter');const {invite}=await inv.json();assert.equal((await request({action:'respond',invite,b:valid.b,consent:true},'no-title-respondent')).status,200);
 });

const evidenceSource=readFileSync(new URL('../app/api/evidence/route.ts',import.meta.url),'utf8').replace("import {db,bucket,sessionSecret,trustsPlatformHeader} from '@/lib/server-db';","const db=()=>globalThis.__zanjaTestDb;const bucket=()=>globalThis.__zanjaTestBucket;const sessionSecret=()=>globalThis.__zanjaTestSecret;const trustsPlatformHeader=()=>globalThis.__zanjaTrustHeader===true;").replace("'@/lib/session'",JSON.stringify(sessionUrl));
const {GET:readEvidence}=await import(moduleUrl(compile(evidenceSource)));
const image='data:image/webp;base64,'+readFileSync(new URL('../public/arena-menu.webp',import.meta.url)).toString('base64');
async function fetchImage(url,user='image-viewer'){return readEvidence(new Request(base+url,{headers:user?{cookie:await cookieFor(user)}:{}}));}
test('optional evidence persists in object storage, loads privately and is removed with its case',async()=>{
 const r=await request({...valid,evidence:image},'image-author');assert.equal(r.status,200);const {id}=await r.json();
 const c=(await state('image-viewer')).cases.find(x=>x.id===id);assert.ok(c.evidenceUrl);assert.equal('evidence' in c,false);assert.equal(blobs.size,1);
 assert.equal((await fetchImage(c.evidenceUrl,null)).status,401);const img=await fetchImage(c.evidenceUrl);assert.equal(img.status,200);assert.equal(img.headers.get('content-type'),'image/webp');assert.equal(img.headers.get('cache-control'),'private, no-store');assert.equal((await img.arrayBuffer()).byteLength,blobs.values().next().value.length);
 assert.equal((await request({action:'remove',id},'stranger')).status,403);assert.equal((await fetchImage(c.evidenceUrl)).status,200);
 assert.equal((await request({action:'remove',id},'image-author')).status,200);assert.equal((await fetchImage(c.evidenceUrl)).status,404);assert.equal(blobs.size,0);
});
test('evidence validates uploads and keeps drafts unpublished when storage fails',async(t)=>{
 t.mock.method(console,'error',()=>{});
 for(const value of ['data:image/svg+xml;base64,PHN2Zz4=','data:image/webp;base64,YmFk',{},'data:image/webp;base64,'+'A'.repeat(1000004)])assert.equal((await request({...valid,evidence:value},'invalid-image')).status,400);
 assert.equal(blobs.size,0);failStorage=true;
 assert.equal((await request({...valid,evidence:image},'storage-failure')).status,503);failStorage=false;
 assert.equal((await state('storage-failure')).cases.filter(c=>c.mine).length,0);
 const {id}=await (await request({...valid,evidence:null},'without-image')).json();assert.equal((await state('without-image')).cases.find(c=>c.id===id).evidenceUrl,null);
});
test('waiting evidence needs owner or invitation; reported evidence is hidden from jurors',async()=>{
 const {id,invite}=await (await request({...valid,mode:'invite',evidence:image},'private-image-author')).json();
 const c=(await state('private-image-author')).cases.find(c=>c.id===id);
 assert.equal((await fetchImage(c.evidenceUrl)).status,404);assert.equal((await fetchImage(c.evidenceUrl,'private-image-author')).status,200);
 const invited=await state('invited-image-user','?invite='+invite);assert.equal((await fetchImage(invited.invitation.evidenceUrl,'invited-image-user')).status,200);
 assert.equal((await request({action:'respond',invite,b:valid.b,consent:true},'invited-image-user')).status,200);assert.equal((await fetchImage(c.evidenceUrl)).status,200);
 for(const u of ['image-report-1','image-report-2','image-report-3'])await request({action:'report',id,reason:'Datos personales'},u);
 assert.equal((await fetchImage(c.evidenceUrl)).status,404);assert.equal((await fetchImage(c.evidenceUrl,'private-image-author')).status,200);
});

test('public entry keeps the illustrated editorial case first after loading persisted cases',async()=>{
 const created=await request({...valid,q:'¿Este caso nuevo desplaza el ejemplo con imagen?'},'ordering-author');
 assert.equal(created.status,200);
 const data=await state(null);
 assert.equal(data.signedIn,false);
 assert.equal(data.cases[0].id,'demo-diseno');
 assert.equal(data.cases[0].evidenceUrl,'/prueba-diseno.webp');
 assert.equal(data.cases[0].status,'open');
 assert.ok(readFileSync(new URL('../public/prueba-diseno.webp',import.meta.url)).length>0);
});


test('vote response includes confirmed results without a second game fetch',async()=>{
 const response=await request({action:'vote',id:'demo-diseno',choice:'both'},'instant-results-juror');
 assert.equal(response.status,200);const result=await response.json();
 assert.equal(result.choice,'both');assert.equal(result.xp,5);assert.ok(result.counts.both>=1);
 assert.equal(result.total,result.counts.a+result.counts.both+result.counts.b);
 const persisted=(await state('instant-results-juror')).cases.find(c=>c.id==='demo-diseno');
 assert.deepEqual(result.counts,persisted.counts);assert.equal(result.total,persisted.total);
});

test('four-step invitation keeps A hidden, waits for owner publication, and enforces link-only discovery',async()=>{
 const created=await request({...valid,mode:'invite',story:'Un desacuerdo cotidiano que ambas personas pueden reconocer.',audience:'link',deferPublication:true,evidence:image},'wizard-author');
 assert.equal(created.status,200);const {id,invite}=await created.json();
 const invitation=(await state('wizard-b','?invite='+invite)).invitation;
 assert.equal(invitation.story,'Un desacuerdo cotidiano que ambas personas pueden reconocer.');assert.equal('a' in invitation,false);assert.equal('b' in invitation,false);
 const response=await request({action:'respond',invite,b:valid.b,consent:true},'wizard-b');assert.equal(response.status,200);assert.equal((await response.json()).pendingPublication,true);
 const ready=(await state('wizard-author')).cases.find(c=>c.id===id);assert.equal(ready.status,'ready');assert.equal(ready.closes,0);
 assert.equal((await state('wizard-b')).cases.find(c=>c.id===id).a.length,0);
 assert.equal((await state('outsider','?case='+id)).cases.some(c=>c.id===id),false);
 assert.equal((await request({action:'vote',id,choice:'a'},'outsider')).status,409);
 assert.equal((await request({action:'publish',id,audience:'link',duration:900000,consent:true},'wizard-b')).status,403);
 assert.equal((await request({action:'publish',id,audience:'link',duration:0},'wizard-author')).status,400);
 assert.equal((await request({action:'publish',id,tag:'Amigos',audience:'link',duration:900000,consent:true},'wizard-author')).status,200);
 const published=(await state('outsider','?case='+id)).cases.find(c=>c.id===id);assert.equal(published.status,'open');assert.equal(published.audience,'link');assert.equal(published.tag,'Amigos');assert.equal(published.counts,null);assert.ok(published.closes>Date.now());
 assert.equal((await state('outsider')).cases.some(c=>c.id===id),false);assert.equal((await state(null)).cases.some(c=>c.id===id),false);
 assert.equal((await request({action:'publish',id,audience:'public',duration:900000,consent:true},'wizard-author')).status,409);
 assert.equal((await request({action:'vote',id,choice:'both'},'outsider')).status,200);
});

test('creation back navigation always leaves the current screen and respects saved invitations',async()=>{
 const {creationBack}=await import(moduleUrl(compile(readFileSync(new URL('../lib/creation-navigation.ts',import.meta.url),'utf8'))));
 assert.equal(creationBack(1,'choose',false,false),'close');
 assert.equal(creationBack(2,'choose',false,false),1);
 assert.equal(creationBack(3,'choose',false,false),2);
 assert.equal(creationBack(3,'local',false,false),'choose');
 assert.equal(creationBack(4,'local',false,false),3);
 assert.equal(creationBack(3,'choose',true,false),'close');
 assert.equal(creationBack(4,'choose',true,false),3);
 assert.equal(creationBack(4,'choose',true,true),'home');
});

test('creation preserves the original account without requiring a shorter editable question',async()=>{
 const story='He pedido que compren tostadas y han vuelto sin ellas. '+ 'Habíamos acordado la lista antes de salir. '.repeat(5);
 assert.ok(story.length>140);
 const response=await request({...valid,q:story,story},'original-account-author');assert.equal(response.status,200);
 const {id}=await response.json();const saved=(await state('original-account-author')).cases.find(c=>c.id===id);
 assert.equal(saved.q,story.trim());assert.equal(saved.story,story.trim());
 assert.equal((await request({...valid,q:'x'.repeat(1201)},'account-too-long')).status,400);
});


test('development reset clears only the caller votes and allows another round',async()=>{
 await request({action:'vote',id:'pan',choice:'a'},'reset-player');
 await request({action:'vote',id:'pan',choice:'b'},'other-player');
 assert.equal((await request({action:'reset_round'},null)).status,401);
 assert.equal((await request({action:'reset_round',user_id:'other-player'},'reset-player')).status,200);
 const reset=await state('reset-player');assert.equal(reset.profile.votes,0);assert.equal(reset.cases.find(c=>c.id==='pan').choice,null);
 const other=(await state('other-player')).cases.find(c=>c.id==='pan');assert.equal(other.choice,'b');assert.equal(other.counts.b,1);assert.equal(other.counts.a,0);
 assert.equal((await request({action:'vote',id:'pan',choice:'both'},'reset-player')).status,200);
});
test('explicit create and publish actions no longer require the removed creator checkboxes',async()=>{
 const result=await request({...valid,consent:undefined},'no-checkbox-author');assert.equal(result.status,200);
});

// ---- la cookie firmada, vista desde el juego. Crear cuenta y entrar se
// prueban aparte, en tests/auth.test.mjs.
test('una cookie manipulada, caducada o de otro secreto no vale',async()=>{
 const good=await cookieFor('tramposo');
 const corte=good.indexOf('.');
 const tampered=good.slice(0,corte+1)+(good[corte+1]==='A'?'B':'A')+good.slice(corte+2);
 const alterado=(good[0]==='e'?'f':'e')+good.slice(1);
 assert.equal((await request({action:'vote',id:'pizza',choice:'a'},null)).status,401);
 const send=cookie=>POST(new Request(base+'/api/game',{method:'POST',headers:{'content-type':'application/json',origin:base,cookie},body:JSON.stringify({action:'vote',id:'pizza',choice:'a'})}));
 assert.equal((await send(tampered)).status,401);
 assert.equal((await send(alterado)).status,401);
 const caducada=SESSION_COOKIE+'='+encodeURIComponent(await signSession({uid:'viejo',name:'viejo',exp:Date.now()-1000},globalThis.__zanjaTestSecret));
 assert.equal((await send(caducada)).status,401);
 const otroSecreto=SESSION_COOKIE+'='+encodeURIComponent(await signSession({uid:'colado',name:'colado',exp:Date.now()+3600000},'otro-secreto-igual-de-largo-que-el-real'));
 assert.equal((await send(otroSecreto)).status,401);
});

test('la cabecera de la plataforma no se acepta salvo que el despliegue lo declare',async()=>{
 const send=()=>POST(new Request(base+'/api/game',{method:'POST',headers:{'content-type':'application/json',origin:base,'oai-authenticated-user-id':'suplantador'},body:JSON.stringify({action:'vote',id:'pan',choice:'a'})}));
 assert.equal((await send()).status,401);
 globalThis.__zanjaTrustHeader=true;
 try{assert.equal((await send()).status,200);}finally{globalThis.__zanjaTrustHeader=false;}
 assert.equal((await send()).status,401);
});

// ---- cuatro veredictos: A, B, LOS DOS y NINGUNO
test('ninguno es un veredicto más: cuenta, es único y entra en el total',async()=>{
 assert.equal((await request({action:'vote',id:'serie',choice:'none'},'juez-duro')).status,200);
 const r=await request({action:'vote',id:'serie',choice:'a'},'juez-duro');assert.equal(r.status,409);
 assert.equal((await request({action:'vote',id:'serie',choice:'both'},'juez-salomonico')).status,200);
 assert.equal((await request({action:'vote',id:'serie',choice:'ninguno'},'juez-confundido')).status,400);
 const c=(await state('juez-duro')).cases.find(x=>x.id==='serie');
 assert.equal(c.counts.none,1);assert.equal(c.counts.both,1);assert.equal(c.total,2);
 assert.equal(c.choice,'none');
});

// --- La Sala ---------------------------------------------------------
const sala_=async(id,user)=>{const r=await GET(new Request(base+'/api/game?room='+id,{headers:user?{cookie:await cookieFor(user)}:{}}));return {status:r.status,body:await r.json()};};

test('en La Sala se habla después de votar, y una sola vez',async()=>{
 assert.equal((await request({action:'comment',id:'pizza',body:'Con piña también es pizza.'},'mudo')).status,403);
 assert.equal((await request({action:'vote',id:'pizza',choice:'a'},'mudo')).status,200);
 assert.equal((await request({action:'comment',id:'pizza',body:'ya'},'mudo')).status,400);
 const r=await request({action:'comment',id:'pizza',body:'Con piña también es pizza.'},'mudo');
 assert.equal(r.status,200);
 assert.equal((await r.json()).side,'a','el comentario hereda el bando de tu voto');
 assert.equal((await request({action:'comment',id:'pizza',body:'Y además está buena.'},'mudo')).status,409);
 const {body}=await sala_('pizza','mudo');
 assert.equal(body.comments.length,1);
 assert.equal(body.spoke,true);
 assert.equal(body.comments[0].mine,true);
});

test('borrar lo dicho deja hablar otra vez',async()=>{
 assert.equal((await request({action:'uncomment',id:'pizza'},'mudo')).status,200);
 assert.equal((await sala_('pizza','mudo')).body.comments.length,0);
 assert.equal((await request({action:'comment',id:'pizza',body:'Lo pienso mejor: con piña, no.'},'mudo')).status,200);
});

test('secundar es apoyar a otro, y se puede retirar',async()=>{
 const {body}=await sala_('pizza','mudo');
 const id=body.comments[0].id;
 assert.equal((await request({action:'second',id},'mudo')).status,403,'no puedes secundarte a ti mismo');
 assert.equal((await request({action:'second',id},null)).status,401);
 const apoyo=await request({action:'second',id},'apoyo');
 assert.equal(apoyo.status,200);
 assert.deepEqual(await apoyo.json(),{ok:true,seconded:true,seconds:1});
 assert.deepEqual(await (await request({action:'second',id},'apoyo')).json(),{ok:true,seconded:false,seconds:0});
 await request({action:'second',id},'apoyo');
 assert.equal((await sala_('pizza','apoyo')).body.comments[0].seconded,true);
});

test('el más secundado es el que entra en la sentencia',async()=>{
 await request({action:'vote',id:'pizza',choice:'b'},'otra');
 await request({action:'comment',id:'pizza',body:'La piña es fruta y la pizza no es macedonia.'},'otra');
 const antes=(await state('mudo')).cases.find(c=>c.id==='pizza');
 assert.match(antes.voice.body,/Lo pienso mejor/,'gana el que tiene un secundado');
 for(const quien of ['coro1','coro2']){
  await request({action:'vote',id:'pizza',choice:'b'},quien);
  const id=(await sala_('pizza',quien)).body.comments.find(x=>/macedonia/.test(x.body)).id;
  await request({action:'second',id},quien);
 }
 const despues=(await state('mudo')).cases.find(c=>c.id==='pizza');
 assert.match(despues.voice.body,/macedonia/);
 assert.equal(despues.voice.seconds,2);
 assert.equal(despues.voice.side,'b');
});

test('quien no ha votado no ve lo que se dice de su caso en el estado',async()=>{
 assert.equal((await state('mirón')).cases.find(c=>c.id==='pizza').voice,null);
});

test('los protagonistas no hablan en La Sala: su versión ya está en el caso',async()=>{
 const creado=await(await request(valid,'dueño')).json();
 assert.equal((await request({action:'comment',id:creado.id,body:'Que conste que yo tenía razón.'},'dueño')).status,403);
 assert.equal((await sala_(creado.id,'dueño')).body.protagonist,true);
});

test('La Sala se cierra con el caso',async()=>{
 const creado=await(await request({...valid,duration:900000},'autor2')).json();
 await request({action:'vote',id:creado.id,choice:'a'},'tarde');
 __zanjaTestDb.prepare('UPDATE cases SET closes=? WHERE id=?').bind(Date.now()-1000,creado.id).run();
 assert.equal((await request({action:'comment',id:creado.id,body:'Llego tarde a esta sala.'},'tarde')).status,409);
 assert.equal((await sala_(creado.id,'tarde')).body.open,false);
});

test('un caso que no existe no tiene sala',async()=>{
 assert.equal((await sala_('no-existe','mudo')).status,404);
});

// --- El Pulso --------------------------------------------------------
const {dayOf,questionFor,PULSE_POINTS}=await import(pulseUrl);

test('el pulso es una pregunta al día y un voto por persona',async()=>{
 const inicial=await state('pulsero');
 assert.equal(inicial.pulse.question,questionFor(dayOf()));
 assert.equal(inicial.pulse.choice,null);
 assert.equal(inicial.pulse.counts,null,'el reparto no se ve antes de responder');
 assert.equal((await request({action:'pulse',choice:'quizá'},'pulsero')).status,400);
 assert.equal((await request({action:'pulse',choice:'si'},null)).status,401);
 const r=await request({action:'pulse',choice:'si'},'pulsero');
 assert.equal(r.status,200);
 assert.deepEqual((await r.json()).counts,{si:1,no:0});
 assert.equal((await request({action:'pulse',choice:'no'},'pulsero')).status,409);
 const despues=await state('pulsero');
 assert.equal(despues.pulse.choice,'si');
 assert.deepEqual(despues.pulse.counts,{si:1,no:0});
});

test('quien no ha respondido ve cuánta gente va, pero no de qué lado',async()=>{
 const otro=await state('curioso');
 assert.equal(otro.pulse.total,1);
 assert.equal(otro.pulse.counts,null);
});

test('los puntos del pulso se cobran al día siguiente y sólo al acertar',async()=>{
 const ayer=dayOf()-1;
 // Ayer ganó "no" por dos a uno.
 for(const [quien,voto] of [['pulsero','si'],['curioso','no'],['tercero','no']])
  __zanjaTestDb.prepare('INSERT OR IGNORE INTO pulse (day,user_id,choice,at) VALUES (?,?,?,?)').bind(ayer,quien,voto,Date.now()).run();
 const falla=(await state('pulsero')).pulse;
 assert.equal(falla.yesterday.winner,'no');
 assert.equal(falla.yesterday.hit,false);
 assert.equal(falla.hits,0);
 assert.equal(falla.points,0);
 const acierta=(await state('curioso')).pulse;
 assert.equal(acierta.yesterday.hit,true);
 assert.equal(acierta.hits,1);
 assert.equal(acierta.points,PULSE_POINTS);
 // El de hoy todavía se mueve, así que no cuenta para los aciertos.
 assert.equal((await state('pulsero')).pulse.choice,'si');
 assert.equal((await state('pulsero')).pulse.hits,0);
});

test('un empate exacto no lo gana nadie',async()=>{
 const anteayer=dayOf()-2;
 for(const [quien,voto] of [['empate1','si'],['empate2','no']])
  __zanjaTestDb.prepare('INSERT OR IGNORE INTO pulse (day,user_id,choice,at) VALUES (?,?,?,?)').bind(anteayer,quien,voto,Date.now()).run();
 const p=(await state('empate1')).pulse;
 assert.equal(p.hits,0,'un empate no suma acierto');
});

test('el Pulso también es una sala, y se habla después de responder',async()=>{
 const sala='pulso-'+dayOf();
 assert.equal((await request({action:'comment',id:sala,body:'La piña es fruta, no ingrediente.'},'callado')).status,403);
 assert.equal((await request({action:'pulse',choice:'no'},'callado')).status,200);
 const r=await request({action:'comment',id:sala,body:'La piña es fruta, no ingrediente.'},'callado');
 assert.equal(r.status,200);
 assert.equal((await r.json()).side,'no','la voz hereda tu respuesta del día');
 const d=(await sala_(sala,'callado')).body;
 assert.equal(d.comments.length,1);
 assert.equal(d.open,true);
 assert.equal(d.protagonist,false,'en el Pulso no hay protagonistas');
});

test('la sala del Pulso se cierra con el día',async()=>{
 const ayer='pulso-'+(dayOf()-1);
 const d=(await sala_(ayer,'callado')).body;
 assert.equal(d.open,false);
 assert.equal((await request({action:'comment',id:ayer,body:'Llego un día tarde.'},'callado')).status,409);
});

test('una sala que no existe no se abre',async()=>{
 assert.equal((await sala_('pulso-no','callado')).status,404);
});

test('los niveles abren la creación, la invitación y las pruebas',async()=>{
 const nuevo='recien-llegado';
 const vota=n=>{const ins=sql.prepare('INSERT OR IGNORE INTO votes (case_id,user_id,choice,at) VALUES (?,?,?,?)');for(let i=0;i<n;i++)ins.run('nivel-'+i,nuevo,'a',Date.now());};
 // Quien acaba de llegar no publica nada: primero tiene que ver casos.
 assert.equal((await request(valid,nuevo,false)).status,403);

 vota(12); // 60 XP: nivel 2, la llave de crear.
 assert.equal((await request({...valid,mode:'invite',bt:'',b:''},nuevo,false)).status,403);
 assert.equal((await request({...valid,evidence:'data:image/webp;base64,AAAA'},nuevo,false)).status,403);
 assert.equal((await request({...valid,q:'¿La primera zanja de alguien de nivel dos vale?'},nuevo,false)).status,200);

 vota(36); // 180 XP: nivel 3, la llave de invitar.
 assert.equal((await request({...valid,q:'¿Y la invitación a la otra parte?',mode:'invite',bt:'',b:''},nuevo,false)).status,200);
 assert.equal((await request({...valid,evidence:'data:image/webp;base64,AAAA'},nuevo,false)).status,403);

 // Dos al día hasta el nivel cinco: la tercera ya no entra.
 const tope=await request({...valid,q:'¿Cabe una tercera zanja el mismo día?'},nuevo,false);
 assert.equal(tope.status,429);
 assert.match((await tope.json()).error,/2 zanjas al día/);
});

test('la campana avisa de lo tuyo y se calla al mirarla',async()=>{
 const autor='dueño-campana';
 assert.equal((await state(autor)).avisos.nuevos,0);
 const {id}=await(await request({...valid,q:'¿Avisa la campana cuando se zanja esto?'},autor)).json();
 // Con el caso abierto todavía no hay nada que contar.
 assert.equal((await state(autor)).avisos.items.length,0);

 sql.prepare('UPDATE cases SET closes=? WHERE id=?').run(Date.now()-1000,id);
 const zanjado=await state(autor);
 assert.equal(zanjado.avisos.nuevos,1);
 assert.equal(zanjado.avisos.items[0].tipo,'zanjada');
 assert.equal(zanjado.avisos.items[0].caseId,id);
 assert.equal(zanjado.avisos.items[0].nuevo,true);
 // A los demás no les llega nada de esto.
 assert.equal((await state('ajena-campana')).avisos.items.length,0);

 assert.equal((await request({action:'seen'},autor)).status,200);
 const mirado=await state(autor);
 assert.equal(mirado.avisos.nuevos,0);
 assert.equal(mirado.avisos.items.length,1,'el aviso sigue en la lista, pero ya no es nuevo');
 assert.equal(mirado.avisos.items[0].nuevo,false);
 // Sin sesión no hay campana que valga.
 assert.equal((await request({action:'seen'},null)).status,401);
});
