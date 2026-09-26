'use client';
// La ficha de un caso en Mis zanjas.
//
// Antes era una tarjeta alta con emoji y un botón blanco dentro: ocupaba media
// pantalla por caso y no se parecía a nada del resto de la aplicación. Esto es
// una ficha de expediente: número de caso, estado, la pregunta y poco más. Se
// toca entera, así que no necesita botón propio, y con cuatro cabe la lista en
// una pantalla.
import {ArrowRight,Clock,Link2,Trash2,Users} from 'lucide-react';
import {caseNumber} from '@/lib/verdict';
import type {Case} from '@/lib/cases';

type Estado='abierto'|'espera'|'aviso'|'cerrado';

/** El estado manda en el color del canto y en el rótulo de arriba. */
function estadoDe(c:Case):{estado:Estado;rotulo:string}{
 if(c.status==='waiting')return {estado:'espera',rotulo:'ESPERANDO A B'};
 if(c.status==='ready')return {estado:'aviso',rotulo:'LISTO PARA PUBLICAR'};
 if(c.status==='incomplete')return {estado:'aviso',rotulo:'FALTAN DEFENSAS'};
 if(c.status==='review')return {estado:'aviso',rotulo:'EN REVISIÓN'};
 if(c.status==='closed')return {estado:'cerrado',rotulo:'ZANJADO'};
 return {estado:'abierto',rotulo:'EN VIVO'};
}

/** Lo que queda de tiempo, dicho corto. */
export function restante(c:Case){
 if(['waiting','ready','incomplete','review','closed'].includes(c.status))return '';
 if(!c.closes)return 'Sin límite';
 const m=Math.max(1,Math.ceil((c.closes-Date.now())/60000));
 return m>60?`${Math.ceil(m/60)} h`:`${m} min`;
}

export function FichaCaso({c,indice=0,onOpen,onShare,onRemove}:{c:Case;indice?:number;onOpen:()=>void;onShare:()=>void;onRemove:()=>void}){
 const {estado,rotulo}=estadoDe(c),tiempo=restante(c);
 return <article className="ficha-caso" data-estado={estado} style={{'--i':indice} as React.CSSProperties}>
  <button className="ficha-abrir" onClick={onOpen}>
   <div className="ficha-alto">
    <span className="ficha-num">CASO {caseNumber(c.id)}</span>
    <span className="ficha-estado">{rotulo}</span>
   </div>
   <h3>{c.q}</h3>
   <div className="ficha-pie">
    <span className="ficha-tema">{c.tag}</span>
    {tiempo&&<span><Clock size={13}/>{tiempo}</span>}
    <span><Users size={13}/>{c.total||0}</span>
    <ArrowRight className="ficha-flecha" size={17}/>
   </div>
  </button>
  {c.mine&&<div className="ficha-tools">
   {c.invite&&c.status==='waiting'&&<button onClick={onShare}><Link2 size={14}/>Invitar a B</button>}
   <button onClick={onRemove}><Trash2 size={14}/>Retirar</button>
  </div>}
 </article>;
}
