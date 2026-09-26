// El orden de la cola: lo de la gente antes que el catálogo.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const compile=source=>ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const url=nombre=>'data:text/javascript;base64,'+Buffer.from(compile(readFileSync(new URL('../lib/'+nombre,import.meta.url),'utf8'))).toString('base64');
const verdictUrl=url('verdict.ts');
const fuente=compile(readFileSync(new URL('../lib/cola.ts',import.meta.url),'utf8')).replace("'./verdict'",JSON.stringify(verdictUrl));
const {ordenarCola,grupoDe,GRUPO}=await import('data:text/javascript;base64,'+Buffer.from(fuente).toString('base64'));
const {QUORUM}=await import(verdictUrl);

const AHORA=1_700_000_000_000, DIA=Math.floor(AHORA/86400000);
const caso=(id,extra={})=>({id,q:'¿'+id+'?',tag:'Amigos',at:'A',a:[],bt:'B',b:[],emoji:'⚡',
 created:AHORA,closes:0,status:'open',editorial:0,total:0,...extra});
const ids=lista=>lista.map(c=>c.id);
const orden=(lista,opciones={})=>ids(ordenarCola(lista,{dia:DIA,votos:3,...opciones}));

test('lo que escribe la gente va antes que el catálogo',()=>{
 const lista=[caso('editorial-1',{editorial:1}),caso('editorial-2',{editorial:1}),caso('de-ana'),caso('de-luis')];
 const puestos=orden(lista);
 assert.deepEqual(puestos.slice(0,2).sort(),['de-ana','de-luis']);
 assert.deepEqual(puestos.slice(2).sort(),['editorial-1','editorial-2']);
});

test('sin jurado suficiente se vota antes que con jurado de sobra',()=>{
 const lista=[caso('ya-tiene',{total:QUORUM+40}),caso('le-falta',{total:QUORUM-1})];
 assert.deepEqual(orden(lista),['le-falta','ya-tiene']);
 assert.equal(grupoDe(caso('le-falta',{total:QUORUM-1}),3),GRUPO.sinJurado);
 assert.equal(grupoDe(caso('ya-tiene',{total:QUORUM}),3),GRUPO.conJurado);
});

test('entre las de la gente, primero la que se queda sin tiempo',()=>{
 const lista=[caso('tarde',{closes:AHORA+86400000}),caso('sin-limite',{closes:0}),caso('pronto',{closes:AHORA+600000})];
 assert.deepEqual(orden(lista),['pronto','tarde','sin-limite']);
});

test('quien no ha votado nunca empieza por el caso ilustrado',()=>{
 const lista=[caso('de-ana'),caso('demo',{editorial:1,evidenceUrl:'/prueba.webp'}),caso('editorial-2',{editorial:1})];
 assert.equal(orden(lista,{votos:0})[0],'demo','en la primera visita, el escaparate');
 assert.equal(orden(lista,{votos:1})[0],'de-ana','a partir de ahí, lo de la gente');
});

test('el catálogo cambia de orden cada día, pero no dentro del mismo día',()=>{
 const lista=Array.from({length:12},(_,i)=>caso('cat-'+i,{editorial:1}));
 const hoy=orden(lista),otraVezHoy=orden(lista),manana=orden(lista,{dia:DIA+1});
 assert.deepEqual(hoy,otraVezHoy,'dentro del día no se mueve');
 assert.notDeepEqual(hoy,manana,'de un día para otro sí');
 assert.deepEqual([...hoy].sort(),[...manana].sort(),'son los mismos casos, en otro orden');
});

test('ordenar no pierde ni repite casos',()=>{
 const lista=[...Array.from({length:30},(_,i)=>caso('cat-'+i,{editorial:1})),
  ...Array.from({length:5},(_,i)=>caso('gente-'+i,{total:i}))];
 const puestos=orden(lista);
 assert.equal(puestos.length,lista.length);
 assert.equal(new Set(puestos).size,lista.length);
});

test('una cola vacía se queda vacía',()=>{
 assert.deepEqual(ordenarCola([],{dia:DIA}),[]);
});

test('con 150 de catálogo, una zanja nueva sigue siendo la primera',()=>{
 const lista=[...Array.from({length:150},(_,i)=>caso('cat-'+i,{editorial:1})),caso('recien-creada',{closes:AHORA+3600000})];
 assert.equal(orden(lista)[0],'recien-creada');
});
