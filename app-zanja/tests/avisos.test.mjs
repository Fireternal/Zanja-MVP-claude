// Los avisos: qué se cuenta, qué se agrupa y qué es nuevo.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const compile=source=>ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {avisosDe,TOPE_AVISOS}=await import('data:text/javascript;base64,'+
 Buffer.from(compile(readFileSync(new URL('../lib/avisos.ts',import.meta.url),'utf8'))).toString('base64'));

const AHORA=1_700_000_000_000;
const vacio={mios:[],apoyos:[],voces:[],pulso:null};
const caso=(extra={})=>({id:'c1',q:'¿Una pregunta?',status:'open',closes:0,answered:0,respondent:null,...extra});

test('sin nada que contar no hay avisos',()=>{
 const {items,nuevos}=avisosDe(vacio,0,AHORA);
 assert.deepEqual(items,[]);
 assert.equal(nuevos,0);
});

test('una zanja cerrada avisa, una abierta no',()=>{
 const abierta=avisosDe({...vacio,mios:[caso({closes:AHORA+3600000})]},0,AHORA);
 assert.equal(abierta.items.length,0);
 const cerrada=avisosDe({...vacio,mios:[caso({closes:AHORA-1000})]},0,AHORA);
 assert.equal(cerrada.items.length,1);
 assert.equal(cerrada.items[0].tipo,'zanjada');
 assert.equal(cerrada.items[0].caseId,'c1');
});

test('un caso esperando a B no cuenta como zanjado',()=>{
 const {items}=avisosDe({...vacio,mios:[caso({status:'waiting',closes:AHORA-1000})]},0,AHORA);
 assert.equal(items.length,0);
});

test('la respuesta de B avisa cuando tiene fecha',()=>{
 const sinFecha=avisosDe({...vacio,mios:[caso({respondent:'b',answered:0})]},0,AHORA);
 assert.equal(sinFecha.items.length,0);
 const {items}=avisosDe({...vacio,mios:[caso({respondent:'b',answered:AHORA-5000})]},0,AHORA);
 assert.equal(items[0].tipo,'respondida');
});

test('los apoyos al mismo comentario son un solo aviso con su recuento',()=>{
 const apoyos=[1,2,3].map(n=>({commentId:'m1',caseId:'c1',q:'¿Una pregunta?',at:AHORA-n*1000}));
 const {items}=avisosDe({...vacio,apoyos},0,AHORA);
 assert.equal(items.length,1);
 assert.equal(items[0].cuantos,3);
 assert.equal(items[0].at,AHORA-1000,'se queda con el más reciente');
});

test('comentarios distintos tuyos dan avisos distintos',()=>{
 const apoyos=[{commentId:'m1',caseId:'c1',q:'A',at:AHORA-1000},{commentId:'m2',caseId:'c2',q:'B',at:AHORA-2000}];
 const {items}=avisosDe({...vacio,apoyos},0,AHORA);
 assert.equal(items.length,2);
});

test('las voces en tu caso se agrupan por caso',()=>{
 const voces=[{caseId:'c1',q:'A',at:AHORA-3000},{caseId:'c1',q:'A',at:AHORA-1000},{caseId:'c2',q:'B',at:AHORA-2000}];
 const {items}=avisosDe({...vacio,voces},0,AHORA);
 assert.equal(items.length,2);
 const uno=items.find(a=>a.caseId==='c1');
 assert.equal(uno.cuantos,2);
 assert.equal(uno.at,AHORA-1000);
});

test('el pulso sólo avisa si acertaste',()=>{
 const dia=Math.floor(AHORA/86400000)-1;
 assert.equal(avisosDe({...vacio,pulso:{acierto:false,dia}},0,AHORA).items.length,0);
 const {items}=avisosDe({...vacio,pulso:{acierto:true,dia}},0,AHORA);
 assert.equal(items[0].tipo,'pulso');
});

test('lo nuevo es lo posterior a la última visita',()=>{
 const mios=[caso({id:'viejo',closes:AHORA-90000}),caso({id:'nuevo',closes:AHORA-1000})];
 const {items,nuevos}=avisosDe({...vacio,mios},AHORA-50000,AHORA);
 assert.equal(nuevos,1);
 assert.equal(items[0].id,'zanjada:nuevo');
 assert.equal(items[0].nuevo,true);
 assert.equal(items[1].nuevo,false);
 // Después de mirar, nada es nuevo.
 assert.equal(avisosDe({...vacio,mios},AHORA,AHORA).nuevos,0);
});

test('van del más reciente al más viejo y no pasan del tope',()=>{
 const mios=Array.from({length:TOPE_AVISOS+15},(_,i)=>caso({id:'c'+i,closes:AHORA-i*1000}));
 const {items}=avisosDe({...vacio,mios},0,AHORA);
 assert.equal(items.length,TOPE_AVISOS);
 assert.equal(items[0].id,'zanjada:c0','el más reciente primero');
 for(let i=1;i<items.length;i++)assert.ok(items[i-1].at>=items[i].at);
});

test('nada del futuro se cuela en la lista',()=>{
 const {items}=avisosDe({...vacio,voces:[{caseId:'c1',q:'A',at:AHORA+60000}]},0,AHORA);
 assert.equal(items.length,0);
});

test('el tiempo se dice como lo diría una persona',async()=>{
 const {haceCuanto}=await import('data:text/javascript;base64,'+
  Buffer.from(compile(readFileSync(new URL('../lib/avisos.ts',import.meta.url),'utf8'))).toString('base64'));
 const m=60000,h=60*m,d=24*h;
 assert.equal(haceCuanto(AHORA,AHORA),'ahora mismo');
 assert.equal(haceCuanto(AHORA-59000,AHORA),'ahora mismo');
 assert.equal(haceCuanto(AHORA-3*m,AHORA),'hace 3 min');
 assert.equal(haceCuanto(AHORA-59*m,AHORA),'hace 59 min');
 assert.equal(haceCuanto(AHORA-90*m,AHORA),'hace 1 h');
 assert.equal(haceCuanto(AHORA-23*h,AHORA),'hace 23 h');
 assert.equal(haceCuanto(AHORA-30*h,AHORA),'ayer');
 assert.equal(haceCuanto(AHORA-5*d,AHORA),'hace 5 días');
 assert.equal(haceCuanto(AHORA+9999,AHORA),'ahora mismo','nada del futuro se dice en negativo');
});
