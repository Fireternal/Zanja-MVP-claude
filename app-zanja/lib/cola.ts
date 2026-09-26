// El orden de la cola del Juzgado.
//
// La cola se armaba concatenando el catálogo editorial y lo que había escrito
// la gente, en ese orden. Con 37 casos de catálogo ya costaba llegar a una
// zanja de verdad; con 150 nadie llegaría nunca, y una zanja que nadie ve no
// alcanza el jurado mínimo y muere sin veredicto. Eso mata lo único que hace
// que alguien quiera crear.
//
// Así que el catálogo pasa a ser lo que siempre debió ser: relleno. Primero va
// lo que escribe la gente, y dentro de eso lo que está a punto de cerrarse sin
// jurado suficiente, que es lo urgente.
import {QUORUM} from './verdict';
import type {Case} from './cases';

/** Grupos de la cola, de más urgente a menos. */
export const GRUPO={estreno:0,sinJurado:1,conJurado:2,catalogo:3} as const;

const esDeLaGente=(c:Case)=>!c.editorial;
/** El caso ilustrado con el que se recibe a quien no ha votado nunca. */
const esElEstreno=(c:Case)=>!!c.editorial&&!!c.evidenceUrl;

export function grupoDe(c:Case,votos:number):number{
 if(votos===0&&esElEstreno(c))return GRUPO.estreno;
 if(!esDeLaGente(c))return GRUPO.catalogo;
 return (c.total||0)<QUORUM?GRUPO.sinJurado:GRUPO.conJurado;
}

/** Revuelve el catálogo de forma distinta cada día, pero igual durante todo el día. */
function barajaDelDia(id:string,dia:number):number{
 let h=2166136261;
 const semilla=id+':'+dia;
 for(let i=0;i<semilla.length;i++){h^=semilla.charCodeAt(i);h=Math.imul(h,16777619);}
 return h>>>0;
}

/**
 * La cola, ordenada.
 *
 * `votos` son los que lleva quien mira, y sólo sirven para decidir si es su
 * primera vez. `dia` mantiene estable el orden del catálogo dentro del mismo
 * día: si cambiara en cada recarga, los casos bailarían delante de los ojos.
 */
export function ordenarCola(casos:Case[],{votos=0,dia=Math.floor(Date.now()/86400000)}={}):Case[]{
 return casos.map((c,orden)=>({c,orden,grupo:grupoDe(c,votos)})).sort((x,y)=>{
  if(x.grupo!==y.grupo)return x.grupo-y.grupo;
  if(x.grupo===GRUPO.catalogo)return barajaDelDia(x.c.id,dia)-barajaDelDia(y.c.id,dia);
  // Entre las de la gente, primero la que se queda sin tiempo.
  const cierre=(c:Case)=>c.closes>0?c.closes:Number.MAX_SAFE_INTEGER;
  const dif=cierre(x.c)-cierre(y.c);
  return dif||x.orden-y.orden;
 }).map(x=>x.c);
}
