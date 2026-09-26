// Entrar en ZANJA: crear cuenta, volver, y no poder entrar en la de otro.
import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import ts from 'typescript';

const sql=new DatabaseSync(':memory:');
for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')))
 sql.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));
class Statement{
 constructor(query){this.query=query;this.params=[];}
 bind(...params){this.params=params;return this;}
 async first(){return sql.prepare(this.query).get(...this.params)||null;}
 async all(){return{results:sql.prepare(this.query).all(...this.params)};}
 async run(){const r=sql.prepare(this.query).run(...this.params);return{meta:{changes:r.changes}};}}
globalThis.__zanjaTestDb={prepare:q=>new Statement(q),batch:async items=>Promise.all(items.map(s=>s.all()))};
globalThis.__zanjaTestSecret='secreto-de-pruebas-con-longitud-suficiente';
globalThis.__zanjaTestRounds=10000; // Las pruebas no necesitan tardar.

const compile=source=>ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const passwordsUrl=moduleUrl(compile(readFileSync(new URL('../lib/passwords.ts',import.meta.url),'utf8')));
const sessionUrl=moduleUrl(compile(readFileSync(new URL('../lib/session.ts',import.meta.url),'utf8')));
const fuente=readFileSync(new URL('../app/api/auth/route.ts',import.meta.url),'utf8')
 .replace("import {db,sessionSecret,pbkdf2Rounds} from '@/lib/server-db';",
  "const db=()=>globalThis.__zanjaTestDb;const sessionSecret=()=>globalThis.__zanjaTestSecret;const pbkdf2Rounds=()=>globalThis.__zanjaTestRounds;")
 .replace("'@/lib/session'",JSON.stringify(sessionUrl))
 .replace("'@/lib/passwords'",JSON.stringify(passwordsUrl));
const {GET,POST,DELETE}=await import(moduleUrl(compile(fuente)));
const {SESSION_COOKIE,verifySession}=await import(sessionUrl);
const {derivar}=await import(passwordsUrl);

const base='https://zanja.test';
const pide=(body,cookie)=>POST(new Request(base+'/api/auth',{method:'POST',
 headers:{'content-type':'application/json','origin':base,...(cookie?{cookie}:{})},body:JSON.stringify(body)}));
const galleta=res=>{const puesta=res.headers.get('set-cookie')||'';
 const m=/zanja_sesion=([^;]*)/.exec(puesta);return m?decodeURIComponent(m[1]):null;};
const quienSoy=async cookie=>(await GET(new Request(base+'/api/auth',{headers:cookie?{cookie:SESSION_COOKIE+'='+encodeURIComponent(cookie)}:{}}))).json();

test('crear una cuenta deja la sesión abierta',async()=>{
 const r=await pide({action:'registrar',name:'Guillermo',password:'unaClaveLarga'});
 assert.equal(r.status,200);
 const {user}=await r.json();
 assert.equal(user.name,'Guillermo');
 assert.match(user.uid,/^u_[0-9a-f]{16}$/);
 const token=galleta(r);
 assert.ok(token,'la respuesta trae la cookie de sesión');
 const sesion=await verifySession(token,globalThis.__zanjaTestSecret);
 assert.equal(sesion.uid,user.uid);
 assert.deepEqual((await quienSoy(token)).user,{uid:user.uid,name:'Guillermo'});
});

test('la contraseña no se guarda en claro en ninguna columna',()=>{
 const fila=sql.prepare('SELECT * FROM users WHERE handle=?').get('guillermo');
 for(const [columna,valor] of Object.entries(fila))
  assert.notEqual(String(valor),'unaClaveLarga',`la columna ${columna} guarda la contraseña`);
 assert.ok(fila.salt&&fila.hash&&fila.rounds>=10000);
});

test('la huella depende de la sal: dos personas con la misma clave no comparten hash',async()=>{
 await pide({action:'registrar',name:'Ana',password:'unaClaveLarga'});
 const a=sql.prepare('SELECT hash,salt FROM users WHERE handle=?').get('guillermo');
 const b=sql.prepare('SELECT hash,salt FROM users WHERE handle=?').get('ana');
 assert.notEqual(a.salt,b.salt);
 assert.notEqual(a.hash,b.hash);
 assert.equal(await derivar('unaClaveLarga',a.salt,10000),a.hash,'la huella se puede reproducir con su sal');
});

test('el nombre no se puede coger dos veces, ni cambiando mayúsculas',async()=>{
 const r=await pide({action:'registrar',name:'guillermo',password:'otraClaveLarga'});
 assert.equal(r.status,409);
 assert.match((await r.json()).error,/ya está cogido/);
});

test('volver con la contraseña correcta devuelve la misma cuenta',async()=>{
 const r=await pide({name:'Guillermo',password:'unaClaveLarga'});
 assert.equal(r.status,200);
 const {user}=await r.json();
 const fila=sql.prepare('SELECT uid FROM users WHERE handle=?').get('guillermo');
 assert.equal(user.uid,fila.uid,'es la misma persona, no una cuenta nueva');
});

test('con la contraseña equivocada no se entra',async()=>{
 const r=await pide({name:'Guillermo',password:'noEsMiClave'});
 assert.equal(r.status,401);
 assert.equal(galleta(r),null,'no se firma ninguna cookie');
 assert.match((await r.json()).error,/incorrectos/);
});

test('un nombre que no existe responde igual que una contraseña mala',async()=>{
 const nadie=await pide({name:'Fantasma',password:'cualquierClave'});
 const mala=await pide({name:'Guillermo',password:'tampocoEsMiClave'});
 assert.equal(nadie.status,mala.status);
 assert.deepEqual(await nadie.json(),await mala.json(),'el mensaje no dice qué nombres existen');
});

test('las contraseñas cortas y los nombres raros se rechazan',async()=>{
 assert.equal((await pide({action:'registrar',name:'Corto',password:'1234567'})).status,400);
 assert.equal((await pide({action:'registrar',name:'x',password:'unaClaveLarga'})).status,400);
 assert.equal((await pide({action:'registrar',name:'<script>',password:'unaClaveLarga'})).status,400);
 assert.equal((await pide({action:'registrar',name:'Pepe',password:'pepe'})).status,400,'la clave no puede ser el nombre');
});

test('seis fallos seguidos dejan la cuenta en reposo',async()=>{
 await pide({action:'registrar',name:'Castigada',password:'unaClaveLarga'});
 for(let i=0;i<5;i++)assert.equal((await pide({name:'Castigada',password:'mal'+i+'aaaaaa'})).status,401);
 const sexto=await pide({name:'Castigada',password:'malSeisAAAA'});
 assert.equal(sexto.status,401);
 // Ya en reposo: ni siquiera con la buena.
 const buena=await pide({name:'Castigada',password:'unaClaveLarga'});
 assert.equal(buena.status,429);
 assert.match((await buena.json()).error,/Demasiados intentos/);
 // Cuando pasa el castigo, la buena entra y el contador se reinicia.
 sql.prepare('UPDATE users SET blocked=? WHERE handle=?').run(Date.now()-1,'castigada');
 assert.equal((await pide({name:'Castigada',password:'unaClaveLarga'})).status,200);
 assert.equal(sql.prepare('SELECT fails FROM users WHERE handle=?').get('castigada').fails,0);
});

test('acertar borra los fallos acumulados',async()=>{
 await pide({action:'registrar',name:'Despistada',password:'unaClaveLarga'});
 await pide({name:'Despistada',password:'mecolela'});
 assert.equal(sql.prepare('SELECT fails FROM users WHERE handle=?').get('despistada').fails,1);
 await pide({name:'Despistada',password:'unaClaveLarga'});
 assert.equal(sql.prepare('SELECT fails FROM users WHERE handle=?').get('despistada').fails,0);
});

test('una petición de otro sitio no abre sesión',async()=>{
 const r=await POST(new Request(base+'/api/auth',{method:'POST',
  headers:{'content-type':'application/json','origin':'https://otro.example'},
  body:JSON.stringify({name:'Guillermo',password:'unaClaveLarga'})}));
 assert.equal(r.status,403);
});

test('salir borra la cookie',async()=>{
 const r=await DELETE(new Request(base+'/api/auth',{method:'DELETE'}));
 assert.equal(r.status,200);
 assert.match(r.headers.get('set-cookie'),/Max-Age=0/);
 assert.deepEqual((await quienSoy(null)).user,null);
});

test('una cookie manipulada no vale',async()=>{
 const r=await pide({name:'Guillermo',password:'unaClaveLarga'});
 const token=galleta(r);
 const roto=token.slice(0,token.indexOf('.'))+'.'+'A'.repeat(43);
 assert.equal((await quienSoy(roto)).user,null);
});
