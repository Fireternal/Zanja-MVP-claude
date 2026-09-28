// El expediente del día: tres misiones, un sello y una racha deducida.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const compile=source=>ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const source=compile(readFileSync(new URL('../lib/expediente.ts',import.meta.url),'utf8'));
const {expedienteDe,diaDe,VOTOS_META,SELLO_XP}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));

const HOY=20000;
const enDia=(dia,cuantos=1)=>Array.from({length:cuantos},()=>dia*86400000+3600000);
/** Un día entero cumplido: cinco votos, el pulso y un comentario. */
const diaCompleto=dia=>({votos:enDia(dia,VOTOS_META),pulsos:[dia],comentarios:enDia(dia)});
const juntar=(...dias)=>dias.reduce((a,d)=>({votos:[...a.votos,...d.votos],pulsos:[...a.pulsos,...d.pulsos],comentarios:[...a.comentarios,...d.comentarios]}),{votos:[],pulsos:[],comentarios:[]});

test('un expediente vacío no tiene nada hecho',()=>{
 const e=expedienteDe({votos:[],pulsos:[],comentarios:[]},HOY);
 assert.equal(e.misiones.length,3);
 assert.equal(e.completas,0);
 assert.equal(e.sellado,false);
 assert.equal(e.racha,0);
 assert.equal(e.sellos,0);
 assert.deepEqual(e.misiones.map(m=>m.id),['veredictos','pulso','sala']);
});

test('cada misión cuenta lo suyo y sólo lo de hoy',()=>{
 const e=expedienteDe({votos:[...enDia(HOY,3),...enDia(HOY-1,9)],pulsos:[HOY-1],comentarios:enDia(HOY-1)},HOY);
 assert.equal(e.misiones[0].hechos,3);
 assert.equal(e.misiones[0].hecho,false);
 assert.equal(e.misiones[1].hecho,false);
 assert.equal(e.misiones[2].hecho,false);
 assert.equal(e.completas,0);
});

test('los votos de más no desbordan la barra',()=>{
 const e=expedienteDe({votos:enDia(HOY,40),pulsos:[],comentarios:[]},HOY);
 assert.equal(e.misiones[0].hechos,VOTOS_META);
 assert.equal(e.misiones[0].hecho,true);
 assert.equal(e.completas,1);
});

test('las tres misiones sellan el día',()=>{
 const e=expedienteDe(diaCompleto(HOY),HOY);
 assert.equal(e.completas,3);
 assert.equal(e.sellado,true);
 assert.equal(e.racha,1);
 assert.equal(e.sellos,1);
});

test('la racha suma días seguidos',()=>{
 const e=expedienteDe(juntar(diaCompleto(HOY),diaCompleto(HOY-1),diaCompleto(HOY-2)),HOY);
 assert.equal(e.racha,3);
 assert.equal(e.sellos,3);
 assert.equal(e.mejorRacha,3);
});

test('un hueco corta la racha pero no el recuento',()=>{
 const e=expedienteDe(juntar(diaCompleto(HOY),diaCompleto(HOY-2),diaCompleto(HOY-3)),HOY);
 assert.equal(e.racha,1);
 assert.equal(e.sellos,3);
 assert.equal(e.mejorRacha,2);
});

test('la racha de ayer aguanta mientras hoy no termine',()=>{
 // Nada hecho hoy: la racha se cuenta desde ayer y no se pierde por la mañana.
 const e=expedienteDe(juntar(diaCompleto(HOY-1),diaCompleto(HOY-2)),HOY);
 assert.equal(e.sellado,false);
 assert.equal(e.racha,2);
});

test('la racha se pierde cuando pasa un día entero en blanco',()=>{
 const e=expedienteDe(juntar(diaCompleto(HOY-2),diaCompleto(HOY-3)),HOY);
 assert.equal(e.racha,0);
 assert.equal(e.mejorRacha,2);
});

test('un día a medias no sella',()=>{
 const casi=juntar({votos:enDia(HOY,VOTOS_META),pulsos:[HOY],comentarios:[]});
 const e=expedienteDe(casi,HOY);
 assert.equal(e.completas,2);
 assert.equal(e.sellado,false);
 assert.equal(e.racha,0);
});

test('diaDe parte los días igual que el Pulso',()=>{
 assert.equal(diaDe(0),0);
 assert.equal(diaDe(86400000-1),0);
 assert.equal(diaDe(86400000),1);
 assert.ok(SELLO_XP>0);
});
