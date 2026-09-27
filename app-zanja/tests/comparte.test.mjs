// La frase de la vista previa cuando se comparte un enlace.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const compile=source=>ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const verdictUrl='data:text/javascript;base64,'+Buffer.from(compile(readFileSync(new URL('../lib/verdict.ts',import.meta.url),'utf8'))).toString('base64');
const fuente=compile(readFileSync(new URL('../lib/comparte.ts',import.meta.url),'utf8')).replace("'./verdict'",JSON.stringify(verdictUrl));
const {descripcionDe}=await import('data:text/javascript;base64,'+Buffer.from(fuente).toString('base64'));
const {QUORUM}=await import(verdictUrl);

const frase=(counts,total,cerrado=true)=>descripcionDe({cerrado,counts,total});

test('un caso abierto invita, y dice cuánta gente ha votado ya',()=>{
 assert.match(frase({},0,false),/Dos bandos/);
 assert.match(frase({a:1},1,false),/Ya han votado 1 persona\./);
 assert.match(frase({a:70,b:42},112,false),/Ya han votado 112 personas\./);
});

test('un caso zanjado cuenta el veredicto',()=>{
 const f=frase({a:76,b:19,both:7,none:10},112);
 assert.match(f,/El jurado fue con el Bando A/);
 assert.match(f,/68% de 112 votos/);
 assert.match(frase({b:30,a:5},35),/el Bando B/);
});

test('cuando ganan los dos o ninguno se dice con palabras, no con letras',()=>{
 assert.match(frase({both:30,a:5,b:5},40),/los dos tenían razón/);
 assert.match(frase({none:30,a:5,b:5},40),/no la tenía ninguno/);
});

test('un empate técnico se cuenta como tal',()=>{
 const f=frase({a:51,b:49},100);
 assert.match(f,/no se puso de acuerdo/);
 assert.match(f,/100 votos/);
 assert.doesNotMatch(f,/%/,'sin porcentaje: en un empate no significa nada');
});

test('sin jurado suficiente se dice sin adornos',()=>{
 assert.match(frase({a:2,b:1},3),/sin jurado suficiente: sólo 3 votos/);
 assert.match(frase({a:1},1),/sólo 1 voto\./);
 assert.match(frase({},0),/sólo 0 votos/);
 // Justo en el límite ya hay veredicto.
 assert.match(frase({a:QUORUM},QUORUM),/El jurado fue con/);
});

test('la frase nunca se queda vacía ni desborda una vista previa',()=>{
 for(const [counts,total,cerrado] of [[{},0,false],[{},0,true],[{a:1},1,true],[{a:999,b:1},1000,true],[{a:50,b:50},100,true]]){
  const f=descripcionDe({cerrado,counts,total});
  assert.ok(f.length>20&&f.length<200,`frase de largo raro: ${f.length}`);
  assert.ok(f.endsWith('.'),'acaba en punto');
 }
});
