// Lo que se lee debajo del título cuando alguien pega un enlace de ZANJA.
//
// Un enlace compartido compite con todo lo demás del grupo de WhatsApp. Si la
// vista previa sólo dice "entra y vota", da igual que el caso lleve ciento
// doce votos y un veredicto: nadie lo sabe hasta abrirlo. Aquí se cuenta el
// estado real en una frase.
import {verdictOf,type Counts,type Side} from './verdict';

const COMO_SE_LLAMA:Record<Side,string>={a:'el Bando A',b:'el Bando B',both:'los dos',none:'ninguno de los dos'};

export type Estado={cerrado:boolean;counts:Counts;total:number};

/** La frase para la vista previa, contando lo que hay. */
export function descripcionDe({cerrado,counts,total}:Estado):string{
 const fallo=verdictOf(counts,total);
 if(!cerrado){
  return total>0
   ? `Ya han votado ${total} ${total===1?'persona':'personas'}. Entra, lee las dos versiones y di quién tiene razón.`
   : 'Dos bandos, dos versiones. Entra, lee las dos y di quién tiene razón.';
 }
 if(fallo.kind==='few')
  return `Se cerró sin jurado suficiente: sólo ${fallo.total} ${fallo.total===1?'voto':'votos'}.`;
 if(fallo.kind==='tie')
  return `El jurado no se puso de acuerdo: empate técnico con ${fallo.total} votos.`;
 const con=fallo.side==='both'?'dijo que los dos tenían razón'
  :fallo.side==='none'?'dijo que no la tenía ninguno'
  :`fue con ${COMO_SE_LLAMA[fallo.side]}`;
 return `El jurado ${con}: ${fallo.percent}% de ${fallo.total} votos.`;
}
