'use client';
// El expediente del día: la tarjeta del menú y la hoja que se abre al tocarla.
//
// La tarjeta ocupa la misma línea que ocupaba el reto de los cinco votos, para
// no robarle sitio al lobby. Todo lo que hay que explicar —las diligencias,
// la racha y el sello— vive en la hoja, que sólo se abre si te interesa.
//
// Cuántas diligencias hay lo dice el propio expediente: los textos cuentan
// `misiones.length` y no un número escrito a mano, así que añadir una no pide
// tocar nada aquí más que su icono y su botón.
import {useEffect,useRef,useState} from 'react';
import {ChevronRight,Flame,Gavel,MessagesSquare,Check,Stamp,ArrowRight,ClipboardList} from 'lucide-react';
import {DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {SELLO_XP,type Expediente,type MisionId} from '@/lib/expediente';

const ICONOS={veredictos:Gavel,sala:MessagesSquare} as const;
const IR={veredictos:'AL JUZGADO',sala:'A HABLAR'} as const;

/** Un expediente en blanco, para mientras carga o si no hay sesión. */
export const expedienteVacio:Expediente={
 misiones:[
  {id:'veredictos',titulo:'Dicta cinco veredictos',pista:'En el Juzgado',hechos:0,meta:5,hecho:false},
  {id:'sala',titulo:'Habla en La Sala',pista:'Deja un argumento',hechos:0,meta:1,hecho:false}],
 completas:0,sellado:false,racha:0,mejorRacha:0,sellos:0};

/** La tarjeta del menú. Cuando el día queda sellado se despide y deja el
 *  sitio: una barra completa que ya no se puede tocar es ruido. Quién decide
 *  cuándo se va es el menú, porque también tiene que recolocar su rejilla. */
export function ExpedienteTarjeta({expediente,saliendo,onOpen}:{expediente:Expediente|null;saliendo?:boolean;onOpen:()=>void}){
 const e=expediente||expedienteVacio;
 // El tramo que se acaba de completar se enciende, pero sólo esa vez: si la
 // animación fuera sólo de CSS se repetiría cada vez que vuelves al inicio.
 const [recien,setRecien]=useState(false);
 const hechasAntes=useRef<number|null>(null);
 useEffect(()=>{
  const hechas=e.misiones.filter(m=>m.hecho).length;
  if(hechasAntes.current===null){hechasAntes.current=hechas;return;}
  if(hechas<=hechasAntes.current){hechasAntes.current=hechas;return;}
  hechasAntes.current=hechas;
  setRecien(true);
  const reloj=setTimeout(()=>setRecien(false),900);
  return()=>clearTimeout(reloj);
 },[e.misiones]);
 return <button className={'mission-tile'+(saliendo?' tile-sale':e.sellado?' tile-sellada':'')} onClick={onOpen} aria-label={`Expediente del día, ${e.completas} de ${e.misiones.length} diligencias`}>
  <span className="mission-icon">{e.sellado?<Stamp size={21}/>:<ClipboardList size={21}/>}</span>
  <div>
   <div className="mission-title">
    <strong>{e.sellado?'¡Expediente sellado!':'Expediente del día'}</strong>
    <span className="mission-meta">{e.racha>0&&<b className="racha-chip"><Flame size={11} fill="currentColor"/>{e.racha}</b>}<span>{e.completas}/{e.misiones.length}</span></span>
   </div>
   <div className={'mission-segments'+(recien?' recien-hecha':'')} aria-hidden="true">{e.misiones.map(m=><i key={m.id} className={m.hecho?'done':''}><span style={{width:Math.round(Math.min(m.hechos/m.meta,1)*100)+'%'}}/></i>)}</div>
  </div>
  <ChevronRight size={19}/>
 </button>;
}

export function ExpedienteHoja({expediente,onIr}:{expediente:Expediente|null;onIr:(id:MisionId)=>void}){
 const e=expediente||expedienteVacio;
 const faltan=e.misiones.length-e.completas;
 return <>
  <span className="eyebrow">{e.sellado?'DILIGENCIAS COMPLETADAS':'CADA DÍA, UN EXPEDIENTE'}</span>
  <DialogTitle>{e.sellado?'Expediente sellado.':'El expediente del día.'}</DialogTitle>
  <DialogDescription>{e.sellado
   ?`Has juzgado y has dicho lo tuyo en La Sala. +${SELLO_XP} XP.`
   :`Juzga y habla. Te ${faltan===1?'queda una diligencia':`quedan ${faltan}`}.`}</DialogDescription>

  <div className={'racha-bloque'+(e.racha>0?' viva':'')}>
   <span className="racha-llama"><Flame size={26} fill="currentColor"/></span>
   <div>
    <strong>{e.racha>0?`${e.racha} ${e.racha===1?'día':'días'} de racha`:'Sin racha todavía'}</strong>
    <small>{e.racha>0
     ?(e.sellado?'Vuelve mañana y la mantienes.':'Sella hoy antes de medianoche para no perderla.')
     :'Sella el expediente y empieza a contar.'}</small>
   </div>
   {e.mejorRacha>0&&<span className="racha-record">RÉCORD<b>{e.mejorRacha}</b></span>}
  </div>

  <ol className="diligencias entra-lista">{e.misiones.map((m,i)=>{
   const Icono=ICONOS[m.id];
   return <li key={m.id} className={m.hecho?'hecha':''} style={{'--i':i} as React.CSSProperties}>
    <span className="diligencia-num">{String(i+1).padStart(2,'0')}</span>
    <span className="diligencia-icono"><Icono size={19}/></span>
    <div className="diligencia-texto">
     <strong>{m.titulo}</strong>
     <small>{m.hecho?'Hecho':m.meta>1?`${m.pista} · ${m.hechos}/${m.meta}`:m.pista}</small>
     {m.meta>1&&!m.hecho&&<span className="diligencia-barra"><i style={{width:Math.round(m.hechos/m.meta*100)+'%'}}/></span>}
    </div>
    {m.hecho
     ?<span className="diligencia-ok" aria-label="Completada"><Check size={17}/></span>
     :<button className="diligencia-ir" onClick={()=>onIr(m.id)}>{IR[m.id]}<ArrowRight size={15}/></button>}
   </li>;})}
  </ol>

  <div className={'sello-final'+(e.sellado?' puesto':'')}>
   {e.sellado
    ?<><Stamp size={22}/><span>SELLADO<b>+{SELLO_XP} XP</b></span></>
    :<><Stamp size={22}/><span>EL SELLO DE HOY<b>+{SELLO_XP} XP al completarlo</b></span></>}
  </div>
 </>;
}

/** Y en el perfil queda el registro: la racha viva, el récord y los días
 *  sellados en total. Es el único sitio donde el expediente sigue estando
 *  después de cerrarse, y desde aquí se vuelve a abrir la hoja. */
export function ExpedienteResumen({expediente,onOpen}:{expediente:Expediente|null;onOpen:()=>void}){
 const e=expediente||expedienteVacio;
 return <button className="resumen-expediente panel" onClick={onOpen}>
  <div className="resumen-cabecera">
   <span className={'resumen-llama'+(e.racha>0||e.sellado?' viva':'')}>
    {e.sellado?<Stamp size={21}/>:<Flame size={21} fill={e.racha>0?'currentColor':'none'}/>}
   </span>
   <div>
    <strong>El expediente del día</strong>
    <small>{e.sellado?'Sellado hoy. Vuelve mañana.':`${e.completas} de ${e.misiones.length} diligencias hoy`}</small>
   </div>
   <ChevronRight size={18}/>
  </div>
  <div className="resumen-cifras">
   <span><b>{e.racha}</b><small>RACHA</small></span>
   <span><b>{e.mejorRacha}</b><small>RÉCORD</small></span>
   <span><b>{e.sellos}</b><small>SELLADOS</small></span>
  </div>
 </button>;
}
