'use client';
// El marcador: todo el jurado en una sola tira.
//
// Antes eran cuatro tarjetas del mismo tamaño, así que la pantalla no decía
// quién iba ganando: había que leer cuatro números y compararlos. Y en un
// móvil bajo, cuatro tarjetas con altura flexible se aplastaban unas a otras.
//
// La tira ocupa una altura fija, se lee de un vistazo y deja sitio debajo
// para La Sala. Las cifras exactas bajan a las fichas, donde no estorban.

import {Check} from 'lucide-react';
import {SIDES,SIDE_NAME,percentOf,verdictLead,verdictHeadline,verdictSubhead,verdictOf,type Side} from '@/lib/verdict';
import type {Case} from '@/lib/cases';

/** El centro de tu tramo, para clavar ahí la aguja. */
function agujaEn(c:Case,elegido:Side,total:number){
 let antes=0;
 for(const side of SIDES){
  const parte=percentOf(c.counts||{},side,total);
  if(side===elegido)return antes+parte/2;
  antes+=parte;
 }
 return 50;
}

export function Marcador({c,onLado}:{c:Case;onLado:(l:'a'|'b')=>void}){
 const total=c.total||0;
 const fallo=verdictOf(c.counts||{},total);
 const cerrado=c.status==='closed';
 const elegido=(c.choice||null) as Side|null;

 // La tira va A · LOS DOS · B · NINGUNO, que es un espectro: de un extremo al
 // otro pasando por el medio. Las fichas van A · B · LOS DOS · NINGUNO, que es
 // una lista: primero el pleito, después los matices.
 const orden:Side[]=['a','b','both','none'];

 return <div className="marcador">
  {total>0
   ?<div className="marcador-pista">
     {elegido&&<div className="marcador-aguja" aria-hidden="true">
      <span style={{left:`${agujaEn(c,elegido,total)}%`}}>TÚ</span>
     </div>}
     <div className="marcador-tira" role="img"
      aria-label={SIDES.map(s=>`${SIDE_NAME[s]} ${percentOf(c.counts||{},s,total)}%`).join(', ')}>
      {SIDES.map(side=>{
       const parte=percentOf(c.counts||{},side,total);
       if(!parte)return null;
       return <i key={side} className={'tramo tramo-'+side+(elegido===side?' es-mio':'')} style={{width:parte+'%'}}>
        {parte>=12&&<b>{parte}%</b>}</i>;
      })}
     </div>
    </div>
   :<p className="marcador-desierto">Nadie ha votado todavía.</p>}

  {cerrado&&fallo.kind==='ruling'&&<img className="mascota mascota-fallo" width={240} height={240} src="/mazo-golpe.webp" alt="" aria-hidden="true"/>}
  <p className={'marcador-titular titular-'+fallo.kind+(fallo.kind==='ruling'?' titular-'+fallo.side:'')}>
   {cerrado?verdictHeadline(fallo):verdictLead(fallo)}
   <small>{verdictSubhead(fallo)}</small>
  </p>

  <div className="marcador-fichas">
   {orden.map(side=>{
    const votos=c.counts?.[side]||0;
    // Las fichas de A y B abren su versión; AMBOS y NINGUNO no tienen defensas
    // que enseñar, así que se quedan como dato.
    const lee=side==='a'||side==='b';
    const dentro=<>
     <u/>
     <span className="ficha-nombre">
      <em>{SIDE_NAME[side]}{elegido===side&&<Check size={12} aria-label="tu voto"/>}</em>
      <small>{votos} {votos===1?'voto':'votos'}</small>
     </span>
     <b>{percentOf(c.counts||{},side,total)}%</b>
    </>;
    const clases='ficha ficha-'+side+(elegido===side?' es-mia':'')+(lee?' es-lectura':'');
    return lee
     ?<button key={side} className={clases} onClick={()=>onLado(side as 'a'|'b')}
       aria-label={`Ver la versión del ${SIDE_NAME[side]}`}>{dentro}</button>
     :<span key={side} className={clases}>{dentro}</span>;
   })}
  </div>
 </div>;
}
