// Los avisos.
//
// No hay una tabla de notificaciones: se deducen de lo que ya ha pasado, igual
// que el expediente. Lo único que se guarda es cuándo miraste la campana por
// última vez, que es lo que decide si un aviso es nuevo.
//
// Se agrupan por caso o por comentario a propósito. Diez personas secundando
// tu argumento son una buena noticia, no diez; una lista que se llena de
// repeticiones deja de leerse a la semana.

export type TipoAviso='zanjada'|'respondida'|'secundado'|'sala'|'pulso';
export type Aviso={id:string;tipo:TipoAviso;at:number;nuevo:boolean;caseId?:string;q?:string;cuantos?:number};

/** Cuántos avisos se guardan: lo de hace un mes ya no es un aviso. */
export const TOPE_AVISOS=30;

export type Material={
 /** Casos tuyos, para saber cuáles se han zanjado y a cuáles ha respondido B. */
 mios:{id:string;q:string;status:string;closes:number;answered:number;respondent:string|null}[];
 /** Apoyos de otras personas a comentarios tuyos. */
 apoyos:{commentId:string;caseId:string;q:string;at:number}[];
 /** Voces de otras personas en casos tuyos. */
 voces:{caseId:string;q:string;at:number}[];
 /** El acierto del Pulso de ayer, si lo hubo. */
 pulso:{acierto:boolean;dia:number}|null;
};

/** Junta varias cosas del mismo sitio en un solo aviso, con su recuento. */
function agrupar<T extends {at:number}>(filas:T[],clave:(x:T)=>string,hacer:(x:T,cuantos:number,at:number)=>Aviso):Aviso[]{
 const cajas=new Map<string,{fila:T;cuantos:number;at:number}>();
 for(const fila of filas){
  const k=clave(fila),caja=cajas.get(k),at=fila.at;
  if(caja){caja.cuantos++;if(at>caja.at){caja.at=at;caja.fila=fila;}}
  else cajas.set(k,{fila,cuantos:1,at});
 }
 return [...cajas.values()].map(c=>hacer(c.fila,c.cuantos,c.at));
}

export function avisosDe(m:Material,visto:number,ahora:number=Date.now()):{items:Aviso[];nuevos:number}{
 const items:Aviso[]=[];

 for(const c of m.mios){
  const cerrado=c.closes>0&&c.closes<=ahora&&c.status!=='waiting';
  if(cerrado)items.push({id:'zanjada:'+c.id,tipo:'zanjada',at:c.closes,nuevo:false,caseId:c.id,q:c.q});
  if(c.respondent&&c.answered>0)items.push({id:'respondida:'+c.id,tipo:'respondida',at:c.answered,nuevo:false,caseId:c.id,q:c.q});
 }

 items.push(...agrupar(m.apoyos,a=>a.commentId,(a,cuantos,at)=>
  ({id:'secundado:'+a.commentId,tipo:'secundado',at,nuevo:false,caseId:a.caseId,q:a.q,cuantos})));

 items.push(...agrupar(m.voces,v=>v.caseId,(v,cuantos,at)=>
  ({id:'sala:'+v.caseId,tipo:'sala',at,nuevo:false,caseId:v.caseId,q:v.q,cuantos})));

 if(m.pulso?.acierto)items.push({id:'pulso:'+m.pulso.dia,tipo:'pulso',at:(m.pulso.dia+1)*86400000,nuevo:false});

 const ordenados=items.filter(a=>a.at>0&&a.at<=ahora).sort((x,y)=>y.at-x.at).slice(0,TOPE_AVISOS)
  .map(a=>({...a,nuevo:a.at>visto}));
 return {items:ordenados,nuevos:ordenados.filter(a=>a.nuevo).length};
}

/** Hace cuánto, dicho como lo diría una persona. */
export function haceCuanto(at:number,ahora:number=Date.now()){
 const s=Math.max(0,Math.floor((ahora-at)/1000));
 if(s<60)return 'ahora mismo';
 const m=Math.floor(s/60); if(m<60)return `hace ${m} min`;
 const h=Math.floor(m/60); if(h<24)return `hace ${h} h`;
 const d=Math.floor(h/24); return d===1?'ayer':`hace ${d} días`;
}
