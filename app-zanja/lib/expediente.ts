// El expediente del día.
//
// El reto de un solo objetivo ("vota cinco casos") se agota en cuanto lo
// cumples: el resto del día la app ya no te pide nada. El expediente pide tres
// cosas distintas, una por cada sitio donde pasa algo — el Juzgado, el Pulso y
// La Sala — y sólo se sella cuando están las tres. Así una visita recorre la
// aplicación entera en lugar de quedarse en la cola de votos.
//
// La racha es lo que hace volver mañana: no se guarda en ninguna tabla, se
// deduce de lo que ya hay (votos, pulsos y comentarios con su fecha), así que
// no puede desincronizarse ni hace falta una migración para mantenerla.

/** Lo que se lleva quien sella el expediente. */
export const SELLO_XP=25;
/** Votos que pide la primera misión. */
export const VOTOS_META=5;

export type MisionId='veredictos'|'pulso'|'sala';
export type Mision={id:MisionId;titulo:string;pista:string;hechos:number;meta:number;hecho:boolean};
export type Expediente={misiones:Mision[];completas:number;sellado:boolean;racha:number;mejorRacha:number;sellos:number};

/** El día como número entero, igual que lo cuenta el Pulso. */
export const diaDe=(at:number=Date.now())=>Math.floor(at/86400000);

/** Lo que ha hecho una persona, en crudo: marcas de tiempo y días del Pulso. */
export type Actividad={votos:number[];pulsos:number[];comentarios:number[]};

type Dia={votos:number;pulso:boolean;comentario:boolean};

const selladoEn=(d:Dia|undefined)=>!!d&&d.votos>=VOTOS_META&&d.pulso&&d.comentario;

function porDias({votos,pulsos,comentarios}:Actividad){
 const dias=new Map<number,Dia>();
 const toca=(dia:number)=>{const d=dias.get(dia)||{votos:0,pulso:false,comentario:false};dias.set(dia,d);return d;};
 for(const at of votos)toca(diaDe(at)).votos++;
 for(const dia of pulsos)toca(dia).pulso=true;
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
 const d=dias.get(hoy)||{votos:0,pulso:false,comentario:false};
 const misiones:Mision[]=[
  {id:'veredictos',titulo:'Dicta cinco veredictos',pista:'En el Juzgado',hechos:Math.min(d.votos,VOTOS_META),meta:VOTOS_META,hecho:d.votos>=VOTOS_META},
  {id:'pulso',titulo:'Responde al Pulso de hoy',pista:'Sí o no, sin pensarlo',hechos:d.pulso?1:0,meta:1,hecho:d.pulso},
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
