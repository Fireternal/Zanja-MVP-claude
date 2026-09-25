// El fallo de un caso: qué dice el jurado cuando se acaba el tiempo.
//
// No siempre hay ganador, y eso es a propósito. Un caso que cierra 51-49 no
// lo ha zanjado nadie, y coronar a uno por dos votos sería mentir sobre lo
// que pasó. Por eso hay tres desenlaces posibles: sin jurado suficiente,
// empate técnico, o fallo.

export type Side='a'|'both'|'b'|'none';
export const SIDES:Side[]=['a','both','b','none'];

/** Por debajo de esto no hay jurado, hay anécdota. */
export const QUORUM=5;
/** Dos opciones a menos de esta distancia (en puntos) están empatadas. */
export const TIE_MARGIN=5;

export type Verdict=
 |{kind:'few';total:number}
 |{kind:'tie';sides:Side[];percent:number;total:number}
 |{kind:'ruling';side:Side;percent:number;total:number};

export type Counts=Partial<Record<Side,number>>;

export const percentOf=(counts:Counts,side:Side,total:number)=>total?Math.round((counts[side]||0)/total*100):0;

/** El nombre corto de cada opción, tal y como se lee en la sentencia. */
export const SIDE_NAME:Record<Side,string>={a:'BANDO A',both:'LOS DOS',b:'BANDO B',none:'NINGUNO'};

export function verdictOf(counts:Counts,total?:number):Verdict{
 const votes=total??SIDES.reduce((n,s)=>n+(counts[s]||0),0);
 if(votes<QUORUM)return {kind:'few',total:votes};
 const orden=SIDES.map(side=>({side,percent:percentOf(counts,side,votes)})).sort((x,y)=>y.percent-x.percent);
 const empatados=orden.filter(o=>orden[0].percent-o.percent<TIE_MARGIN);
 if(empatados.length>1)return {kind:'tie',sides:empatados.map(o=>o.side),percent:orden[0].percent,total:votes};
 return {kind:'ruling',side:orden[0].side,percent:orden[0].percent,total:votes};
}

/** El titular de la sentencia. */
export function verdictHeadline(v:Verdict){
 if(v.kind==='few')return 'SIN JURADO SUFICIENTE';
 if(v.kind==='tie')return 'EL JURADO NO SE PONE DE ACUERDO';
 if(v.side==='both')return 'LOS DOS TENÍAN RAZÓN';
 if(v.side==='none')return 'NO LA TENÍA NINGUNO';
 return `RAZÓN AL ${SIDE_NAME[v.side]}`;
}

/** La línea de debajo, que explica el titular sin repetirlo. */
export function verdictSubhead(v:Verdict){
 if(v.kind==='few')return `Sólo ${v.total} ${v.total===1?'voto':'votos'}. Hacen falta ${QUORUM}.`;
 if(v.kind==='tie')return `Empate técnico entre ${v.sides.map(s=>SIDE_NAME[s]).join(' y ')}.`;
 return `${v.percent}% de ${v.total} votos.`;
}

/** Un número de caso estable y corto, para poder citarlo. */
export function caseNumber(id:string){
 let h=2166136261;
 for(let i=0;i<id.length;i++){h^=id.charCodeAt(i);h=Math.imul(h,16777619);}
 return String((h>>>0)%10000).padStart(4,'0');
}
