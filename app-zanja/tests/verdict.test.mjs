// El fallo: qué dice el jurado cuando se acaba el tiempo.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const compile=source=>ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const source=compile(readFileSync(new URL('../lib/verdict.ts',import.meta.url),'utf8'));
const {verdictOf,verdictHeadline,verdictLead,verdictSubhead,caseNumber,QUORUM,TIE_MARGIN}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));

test('sin jurado suficiente no hay fallo',()=>{
 assert.deepEqual(verdictOf({a:2,b:2}),{kind:'few',total:4});
 assert.equal(verdictOf({}).kind,'few');
 // Justo en el límite ya hay jurado.
 assert.equal(verdictOf({a:QUORUM}).kind,'ruling');
});

test('un caso reñido queda sin zanjar',()=>{
 const reñido=verdictOf({a:51,b:49});
 assert.equal(reñido.kind,'tie');
 assert.deepEqual(reñido.sides,['a','b']);
 assert.equal(verdictHeadline(reñido),'EL JURADO NO SE PONE DE ACUERDO');
 assert.match(verdictSubhead(reñido),/BANDO A y BANDO B/);
});

test('el margen decide: justo fuera hay fallo, justo dentro hay empate',()=>{
 // 53% contra 47%: seis puntos, más que el margen.
 assert.equal(verdictOf({a:53,b:47}).kind,'ruling');
 // 52% contra 48%: cuatro puntos, dentro del margen.
 assert.equal(verdictOf({a:52,b:48}).kind,'tie');
 assert.equal(TIE_MARGIN,5);
});

test('las cuatro opciones pueden ganar, y se leen distinto',()=>{
 assert.equal(verdictHeadline(verdictOf({a:9,b:1})),'RAZÓN AL BANDO A');
 assert.equal(verdictHeadline(verdictOf({b:9,a:1})),'RAZÓN AL BANDO B');
 assert.equal(verdictHeadline(verdictOf({both:9,a:1})),'LOS DOS TENÍAN RAZÓN');
 assert.equal(verdictHeadline(verdictOf({none:9,a:1})),'NO LA TENÍA NINGUNO');
});

test('un empate a tres se nombra entero',()=>{
 const fallo=verdictOf({a:10,b:10,both:10,none:1});
 assert.equal(fallo.kind,'tie');
 assert.equal(fallo.sides.length,3);
});

test('el total manda sobre el recuento, porque viene del servidor',()=>{
 assert.equal(verdictOf({a:6},6).total,6);
 assert.equal(verdictOf({a:6},0).kind,'few');
});

test('el número de caso es corto, estable y de cuatro cifras',()=>{
 const uno=caseNumber('demo-diseno');
 assert.match(uno,/^\d{4}$/);
 assert.equal(uno,caseNumber('demo-diseno'));
 assert.notEqual(uno,caseNumber('pizza'));
});

test('mientras está abierta, nada está dicho todavía',()=>{
 assert.equal(verdictLead(verdictOf({a:2})),'TODAVÍA NO HAY JURADO');
 assert.equal(verdictLead(verdictOf({a:51,b:49})),'EL JURADO ESTÁ PARTIDO');
 assert.equal(verdictLead(verdictOf({a:9,b:1})),'EL JURADO VA CON EL BANDO A');
 assert.equal(verdictLead(verdictOf({both:9,a:1})),'EL JURADO DICE QUE LOS DOS');
 // Y al cerrar, el mismo caso ya se afirma.
 assert.equal(verdictHeadline(verdictOf({a:9,b:1})),'RAZÓN AL BANDO A');
});
