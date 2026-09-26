'use client';
// La campana y su hoja.
//
// Sin esto puedes abrir una zanja, cerrarse con cuarenta votos y no enterarte
// nunca: la app no te reclama por ningún sitio. Cada aviso lleva a donde ha
// pasado la cosa, porque un aviso que no se puede abrir es sólo ruido.
import {Bell,Gavel,Swords,ThumbsUp,MessagesSquare,Zap,ChevronRight} from 'lucide-react';
import {DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {haceCuanto,type Aviso,type TipoAviso} from '@/lib/avisos';
import {PULSE_POINTS} from '@/lib/pulse';

export type Campanario={items:Aviso[];nuevos:number};

const ICONOS:Record<TipoAviso,typeof Bell>={zanjada:Gavel,respondida:Swords,secundado:ThumbsUp,sala:MessagesSquare,pulso:Zap};

function texto(a:Aviso):{titulo:string;pie:string}{
 const n=a.cuantos||1;
 switch(a.tipo){
  case 'zanjada':return {titulo:'Tu zanja ya tiene veredicto',pie:a.q||''};
  case 'respondida':return {titulo:'La otra parte ha escrito su defensa',pie:a.q||''};
  case 'secundado':return {titulo:n===1?'Han secundado tu argumento':`${n} personas han secundado tu argumento`,pie:a.q||''};
  case 'sala':return {titulo:n===1?'Una voz nueva en tu caso':`${n} voces nuevas en tu caso`,pie:a.q||''};
  case 'pulso':return {titulo:'Acertaste el Pulso de ayer',pie:`+${PULSE_POINTS} XP para tu experiencia`};
 }
}

export function Campana({campana,onOpen}:{campana:Campanario|null;onOpen:()=>void}){
 const nuevos=campana?.nuevos||0;
 return <button className={'campana icon-btn'+(nuevos?' con-avisos':'')} onClick={onOpen}
  aria-label={nuevos?`Avisos, ${nuevos} sin leer`:'Avisos'}>
  <Bell size={20}/>
  {nuevos>0&&<span className="campana-marca">{nuevos>9?'9+':nuevos}</span>}
 </button>;
}

export function AvisosHoja({campana,onIr}:{campana:Campanario|null;onIr:(a:Aviso)=>void}){
 const items=campana?.items||[];
 return <>
  <span className="eyebrow">MIENTRAS NO ESTABAS</span>
  <DialogTitle>Avisos.</DialogTitle>
  <DialogDescription>{items.length
   ?'Toca cualquiera para ir a donde ha pasado.'
   :'Cuando tus zanjas se muevan, te enterarás aquí.'}</DialogDescription>
  {items.length
   ?<ol className="avisos">{items.map(a=>{
     const Icono=ICONOS[a.tipo],{titulo,pie}=texto(a);
     return <li key={a.id} className={a.nuevo?'nuevo':''}>
      <button onClick={()=>onIr(a)}>
       <span className="aviso-icono"><Icono size={18}/></span>
       <div className="aviso-texto"><strong>{titulo}</strong>{pie&&<small>{pie}</small>}</div>
       <span className="aviso-cuando">{haceCuanto(a.at)}</span>
       <ChevronRight size={17} className="aviso-flecha"/>
      </button>
     </li>;})}
   </ol>
   :<div className="avisos-vacio"><span><Bell size={30}/></span>
    <p>Aquí aparecerán los veredictos de tus casos, quién ha secundado tus argumentos y los aciertos del Pulso.</p></div>}
 </>;
}
