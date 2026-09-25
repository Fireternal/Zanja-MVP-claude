// El jurado de ejemplo de la vitrina.
//
// Sin servidor no hay más gente votando, y una app de jurado donde todo marca
// «1 voto» no se puede juzgar. Así que la vitrina trae un jurado de ejemplo:
// un reparto fijo para cada caso editorial, y dos casos ya cerrados que
// aparecen en Mis zanjas la primera vez que entras, para poder ver la
// sentencia sin esperar a que se acabe un plazo.
//
// Es de mentira y sólo existe aquí. En el despliegue de verdad los votos son
// de personas.

export type Reparto={a:number;both:number;b:number;none:number};

const hash=(texto:string)=>{
 let h=2166136261;
 for(let i=0;i<texto.length;i++){h^=texto.charCodeAt(i);h=Math.imul(h,16777619);}
 return h>>>0;
};

/** El mismo caso da siempre el mismo reparto: la vitrina no parpadea. */
export function repartoDe(id:string):Reparto{
 const h=hash(id);
 const total=14+(h%160);
 const a=30+(h>>7)%45;              // el bando A se lleva entre el 30% y el 75%
 const both=6+(h>>13)%18;
 const none=3+(h>>19)%10;
 const b=Math.max(0,100-a-both-none);
 const parte=(p:number)=>Math.round(total*p/100);
 return {a:parte(a),both:parte(both),b:parte(b),none:parte(none)};
}

export const juradoDeEjemplo=(ids:string[])=>Object.fromEntries(ids.map(id=>[id,repartoDe(id)]));

/** Dos casos cerrados, uno con fallo claro y otro en empate técnico. */
export function casosCerrados(owner:string,ahora:number){
 const comun={owner,at:'Bando A',bt:'Bando B',emoji:'⚡',audience:'public',workflow:0,
  invite:null,respondent:null,evidence:null,duration:86400000,status:'open'};
 return [
  {...comun,id:'ejemplo-cerrado-claro',
   tag:'Convivencia',
   q:'¿Se puede poner una lavadora a las once de la noche?',
   story:'Vivimos en un piso con las paredes finas y sólo tengo libre esa hora.',
   a:JSON.stringify([
    'Es la única hora que me queda libre entre semana.',
    'La lavadora nueva apenas hace ruido en el centrifugado.',
    'Nadie me ha dicho nunca que le molestara.']),
   b:JSON.stringify([
    'Las paredes son finas y se oye el centrifugado entero.',
    'A las once hay gente que ya está durmiendo.',
    'El fin de semana hay horas de sobra para ponerla.']),
   created:ahora-5*86400000,closes:ahora-2*86400000,
   reparto:{a:8,both:6,b:41,none:2}},
  {...comun,id:'ejemplo-cerrado-empate',
   tag:'Amigos',
   q:'Si uno bebe y los demás no, ¿se reparte la cuenta a partes iguales?',
   story:'Cenamos ocho y tres pidieron vino. Al pedir la cuenta se lio.',
   a:JSON.stringify([
    'Salir juntos es repartir, no ir sumando lo de cada uno.',
    'Nadie contó las cervezas cuando pagué yo de más otras veces.',
    'Dividir la cuenta en ocho tarda diez segundos.']),
   b:JSON.stringify([
    'Dos botellas de vino son treinta euros que yo no he bebido.',
    'Repartir a partes iguales premia siempre al que más pide.',
    'Pagar lo tuyo no es ser tacaño, es ser justo.']),
   created:ahora-9*86400000,closes:ahora-6*86400000,
   reparto:{a:27,both:9,b:25,none:6}},
 ];
}
