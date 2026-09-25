'use client';
// Las dos versiones, encima del veredicto.
//
// Antes, para releer las defensas había que salir del resultado y volver al
// duelo: un cambio de pantalla entero para consultar un dato. Ahora se abre
// una hoja por encima, con el veredicto visible detrás, y se pasa de un bando
// al otro deslizando o con las flechas. Se consulta y se cierra, sin perder
// el sitio.

import {useEffect,useRef,useState} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import type {Case} from '@/lib/cases';

type Lado='a'|'b';
const LADOS:Lado[]=['a','b'];
const NOMBRE:Record<Lado,string>={a:'BANDO A',b:'BANDO B'};
/** A partir de aquí se considera un gesto y no un toque. */
const ARRASTRE=44;

export function Defensas({c,abierto,onAbrir,inicial='a'}:{c:Case;abierto:boolean;onAbrir:(v:boolean)=>void;inicial?:Lado}){
 const [lado,setLado]=useState<Lado>(inicial);
 const [arrastre,setArrastre]=useState(0);
 const origen=useRef<number|null>(null);

 useEffect(()=>{if(abierto)setLado(inicial);},[abierto,inicial]);

 const indice=LADOS.indexOf(lado);
 const mueve=(paso:number)=>setLado(LADOS[(indice+paso+LADOS.length)%LADOS.length]);

 const defensas=(l:Lado)=>(l==='a'?c.a:c.b)||[];

 return <Dialog open={abierto} onOpenChange={onAbrir}>
  <DialogContent className="zanja-dialog bottom-sheet defensas-hoja">
   <DialogTitle>Las dos versiones</DialogTitle>
   <DialogDescription>{c.q}</DialogDescription>

   <div className="defensas-mando">
    {LADOS.map(l=><button key={l} className={'defensas-pestana defensas-pestana-'+l+(l===lado?' es-activa':'')}
     onClick={()=>setLado(l)} aria-pressed={l===lado}>{NOMBRE[l]}</button>)}
   </div>

   <div className="defensas-visor"
    onTouchStart={e=>{origen.current=e.touches[0].clientX;}}
    onTouchMove={e=>{if(origen.current!==null)setArrastre(e.touches[0].clientX-origen.current);}}
    onTouchEnd={()=>{
     if(Math.abs(arrastre)>ARRASTRE)mueve(arrastre<0?1:-1);
     origen.current=null;setArrastre(0);
    }}>
    <div className="defensas-carril" style={{transform:`translateX(calc(${-indice*100}% + ${arrastre}px))`}}>
     {LADOS.map(l=><article key={l} className={'defensas-carta defensas-carta-'+l}
       aria-label={NOMBRE[l]} aria-hidden={l!==lado}>
       <ol>{defensas(l).map((texto,i)=><li key={i}><span>{i+1}</span><p>{texto}</p></li>)}</ol>
       {!defensas(l).length&&<p className="defensas-vacio">Este bando todavía no ha escrito su versión.</p>}
      </article>)}
    </div>

   </div>

   <p className="defensas-pista">Desliza para ver el otro bando</p>
  </DialogContent>
 </Dialog>;
}
