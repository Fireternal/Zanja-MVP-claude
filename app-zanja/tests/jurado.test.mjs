// El jurado de ejemplo de la vitrina: nunca votos en negativo ni un bando por
// encima del 100%.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {repartoDe}=await import('data:text/javascript;base64,'+Buffer.from(
 compile(readFileSync(new URL('../vitrina/jurado.ts',import.meta.url),'utf8'))).toString('base64'));

test('ningún reparto tiene votos negativos ni pasa del cien por cien',()=>{
 for(let i=0;i<4000;i++){
  const id='caso-'+i;
  const r=repartoDe(id);
  const total=r.a+r.both+r.b+r.none;
  for(const [lado,n] of Object.entries(r)){
   assert.ok(n>=0,`${id}: ${lado} salió ${n}`);
   assert.ok(Math.round(n/total*100)<=100,`${id}: ${lado} es el ${Math.round(n/total*100)}%`);
  }
  assert.ok(total>0,`${id}: sin votos`);
 }
});

test('el mismo caso da siempre el mismo reparto',()=>{
 assert.deepEqual(repartoDe('pizza'),repartoDe('pizza'));
 assert.notDeepEqual(repartoDe('pizza'),repartoDe('demo-diseno'));
});
