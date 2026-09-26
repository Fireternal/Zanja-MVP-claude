// Los niveles: la escalera, las llaves y lo que pasa más allá de la cima.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const compile=source=>ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const url=nombre=>'data:text/javascript;base64,'+Buffer.from(compile(readFileSync(new URL('../lib/'+nombre,import.meta.url),'utf8'))).toString('base64');
const pulseUrl=url('pulse.ts'),expedienteUrl=url('expediente.ts');
const fuente=compile(readFileSync(new URL('../lib/niveles.ts',import.meta.url),'utf8'))
 .replace("'./pulse'",JSON.stringify(pulseUrl)).replace("'./expediente'",JSON.stringify(expedienteUrl));
const {rangos,XP_VOTO,nivelDe,xpDelNivel,tituloDe,progresoDe,puede,NIVEL_LLAVE,limiteDiario,xpDe,PASO_EXTRA,LIMITE_BASE,LIMITE_VETERANO,pegaDeLlave}
 =await import('data:text/javascript;base64,'+Buffer.from(fuente).toString('base64'));

test('la escalera sube y no se repite',()=>{
 for(let i=1;i<rangos.length;i++){
  assert.equal(rangos[i].nivel,rangos[i-1].nivel+1);
  assert.ok(rangos[i].xp>rangos[i-1].xp,'cada rango cuesta más que el anterior');
 }
 assert.equal(rangos[0].xp,0);
});

test('cada tramo de experiencia cae en su nivel',()=>{
 assert.equal(nivelDe(0),1);
 assert.equal(nivelDe(59),1);
 assert.equal(nivelDe(60),2);
 assert.equal(nivelDe(179),2);
 assert.equal(nivelDe(360),4);
 assert.equal(nivelDe(899),5);
 assert.equal(nivelDe(900),6);
});

test('pasada la cima los niveles siguen cada PASO_EXTRA',()=>{
 const cima=rangos[rangos.length-1];
 assert.equal(nivelDe(cima.xp+PASO_EXTRA-1),cima.nivel);
 assert.equal(nivelDe(cima.xp+PASO_EXTRA),cima.nivel+1);
 assert.equal(nivelDe(cima.xp+PASO_EXTRA*3),cima.nivel+3);
 assert.equal(tituloDe(cima.nivel+3),cima.titulo,'arriba del todo se conserva el título');
 assert.equal(xpDelNivel(cima.nivel+2),cima.xp+PASO_EXTRA*2);
});

test('el progreso no se sale nunca de su tramo',()=>{
 for(const xp of [0,1,59,60,200,359,900,2000,5000]){
  const p=progresoDe(xp);
  assert.equal(p.nivel,nivelDe(xp));
  assert.ok(p.hecho>=0&&p.hecho<p.hasta-p.desde,`progreso raro con ${xp} XP`);
  assert.ok(p.falta>0);
  assert.equal(p.desde+p.hecho,xp);
 }
 assert.equal(progresoDe(0).siguiente.nivel,2);
});

test('las llaves se abren en su nivel y no antes',()=>{
 assert.equal(puede(0,'crear'),false);
 assert.equal(puede(xpDelNivel(NIVEL_LLAVE.crear)-1,'crear'),false);
 assert.equal(puede(xpDelNivel(NIVEL_LLAVE.crear),'crear'),true);
 assert.equal(puede(xpDelNivel(NIVEL_LLAVE.invitar),'invitar'),true);
 assert.equal(puede(xpDelNivel(NIVEL_LLAVE.invitar),'prueba'),false);
 assert.equal(puede(xpDelNivel(NIVEL_LLAVE.prueba),'prueba'),true);
 // Quien puede lo difícil puede lo fácil.
 assert.equal(puede(99999,'crear')&&puede(99999,'invitar')&&puede(99999,'prueba'),true);
 assert.match(pegaDeLlave('crear'),/nivel 2/);
});

test('el límite diario de zanjas depende del nivel',()=>{
 assert.equal(limiteDiario(0),LIMITE_BASE);
 assert.equal(limiteDiario(xpDelNivel(5)-1),LIMITE_BASE);
 assert.equal(limiteDiario(xpDelNivel(5)),LIMITE_VETERANO);
});

test('la experiencia suma los tres sitios',()=>{
 assert.equal(xpDe({}),0);
 assert.equal(xpDe({votos:10}),50);
 assert.ok(xpDe({votos:5,aciertos:1,sellos:1})>xpDe({votos:5}));
 // El nivel 2 está puesto justo en un día completo del expediente: quien se
 // lo toma en serio una tarde se gana el derecho a crear.
 const unDia=xpDe({votos:5,aciertos:1,sellos:1});
 assert.equal(unDia,xpDelNivel(2));
 assert.equal(puede(unDia,'crear'),true);
 assert.equal(puede(unDia-XP_VOTO,'crear'),false);
});
