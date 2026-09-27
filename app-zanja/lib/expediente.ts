// El expediente del día.
//
// El reto de un solo objetivo ("vota cinco casos") se agota en cuanto lo
// cumples: el resto del día la app ya no te pide nada. El expediente pide dos
// cosas distintas —juzgar en el Juzgado y decir lo tuyo en La Sala— y sólo se
// sella cuando están las dos. Así una visita no se queda en la cola de votos.
//
// Eran tres hasta que se retiró el Pulso. El hueco queda para el siguiente
// modo de juego: añadirle una diligencia es añadir una línea a `misiones` y
// una condición a `selladoEn`.
//
// La racha es lo que hace volver mañana: no se guarda en ninguna tabla, se
// deduce de lo que ya hay (votos y comentarios con su fecha), así que no puede
// desincronizarse ni hace falta una migración para mantenerla.

/** Lo que se lleva quien sella el expediente. */
export const SELLO_XP=25;
/** Votos que pide la primera misión. */
export const VOTOS_META=5;

export type MisionId='veredictos'|'sala';
export type Mision={id:MisionId;titulo:string;pista:string;hechos:number;meta:number;hecho:boolean};
export type Expediente={misiones:Mision[];completas:number;sellado:boolean;racha:number;mejorRacha:number;sellos:number};

/** El día como número entero, que es como cuenta los días la partida. */
export const diaDe=(at:number=Date.now())=>Math.floor(at/86400000);

/** Lo que ha hecho una persona, en crudo: las marcas de tiempo. */
export type Actividad={votos:number[];comentarios:number[]};

type Dia={votos:number;comentario:boolean};

const selladoEn=(d:Dia|undefined)=>!!d&&d.votos>=VOTOS_META&&d.comentario;

function porDias({votos,comentarios}:Actividad){
 const dias=new Map<number,Dia>();
 const toca=(dia:number)=>{const d=dias.get(dia)||{votos:0,comentario:false};dias.set(dia,d);return d;};
 for(const at of votos)toca(diaDe(at)).votos++;
 for(const at of comentarios)toca(diaDe(at)).comentario=true;
 return dias;
}

/**
 * El expediente de hoy más la racha.
 *
 * La racha no se rompe hasta que el día termina: si hoy todavía no está
 * sellado se cuenta desde ayer, para que abrir la app por la mañana no parezca
 * que has perdido lo de la semana pasada.
 */
export function expedienteDe(actividad:Actividad,hoy:number=diaDe()):Expediente{
 const dias=porDias(actividad);
 const d=dias.get(hoy)||{votos:0,comentario:false};
 const misiones:Mision[]=[
  {id:'veredictos',titulo:'Dicta cinco veredictos',pista:'En el Juzgado',hechos:Math.min(d.votos,VOTOS_META),meta:VOTOS_META,hecho:d.votos>=VOTOS_META},
  {id:'sala',titulo:'Habla en La Sala',pista:'Deja un argumento',hechos:d.comentario?1:0,meta:1,hecho:d.comentario}];

 const sellado=selladoEn(d);
 let racha=0;
 for(let dia=sellado?hoy:hoy-1;selladoEn(dias.get(dia));dia--)racha++;

 let mejorRacha=0,seguidos=0;
 for(const dia of [...dias.keys()].sort((x,y)=>x-y)){
  seguidos=selladoEn(dias.get(dia))?(selladoEn(dias.get(dia-1))?seguidos+1:1):0;
  if(seguidos>mejorRacha)mejorRacha=seguidos;
 }

 return {misiones,completas:misiones.filter(m=>m.hecho).length,sellado,racha,mejorRacha,
  sellos:[...dias.keys()].filter(dia=>selladoEn(dias.get(dia))).length};
}
