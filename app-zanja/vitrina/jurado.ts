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

/** Voces de ejemplo para La Sala, para poder juzgar cómo se lee llena. */
export type Voz={id:string;case_id:string;user_id:string;side:string;body:string;at:number;base:number};

const hace=(horas:number)=>Date.now()-horas*3600000;

export const vocesDeEjemplo=():Voz[]=>[
 {id:'v1',case_id:'demo-diseno',user_id:'j1',side:'b',base:14,at:hace(19),
  body:'Enseñar una solución está bien. Cambiarla sin avisar es decidir por los demás y que se enteren al abrir el archivo.'},
 {id:'v2',case_id:'demo-diseno',user_id:'j2',side:'a',base:9,at:hace(14),
  body:'Un mensaje de treinta segundos habría evitado todo esto, pero tampoco es para montar un drama.'},
 {id:'v3',case_id:'demo-diseno',user_id:'j3',side:'both',base:4,at:hace(6),
  body:'Los dos tenéis parte: él por no avisar y el equipo por aprobar algo que no terminaba de funcionar.'},
 {id:'v4',case_id:'pizza',user_id:'j4',side:'a',base:23,at:hace(30),
  body:'Quien la pide primero se arriesga a quedarse con la de menos queso. Eso también cuenta.'},
 {id:'v5',case_id:'pizza',user_id:'j5',side:'b',base:11,at:hace(8),
  body:'La última porción se ofrece. Siempre. Quien la coge sin preguntar ya ha perdido el caso.'},
 {id:'v6',case_id:'ejemplo-cerrado-claro',user_id:'j6',side:'b',base:31,at:hace(74),
  body:'Que tu lavadora sea silenciosa no lo decides tú: lo decide quien duerme al otro lado de la pared.'},
 {id:'v7',case_id:'ejemplo-cerrado-claro',user_id:'j7',side:'a',base:6,at:hace(70),
  body:'Si nadie se ha quejado nunca, alguien tendrá que decirlo antes de convertirlo en un caso.'},
 {id:'v8',case_id:'ejemplo-cerrado-empate',user_id:'j8',side:'a',base:19,at:hace(150),
  body:'Si vas a contar lo que bebe cada uno, avísalo al sentarte, no al pedir la cuenta.'},
 {id:'v9',case_id:'ejemplo-cerrado-empate',user_id:'j9',side:'b',base:17,at:hace(144),
  body:'Repartir a partes iguales no es generosidad, es que siempre pague lo mismo el que menos pide.'},
];
