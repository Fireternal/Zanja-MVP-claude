'use client';
// El expediente del día: la tarjeta del menú y la hoja que se abre al tocarla.
//
// La tarjeta ocupa la misma línea que ocupaba el reto de los cinco votos, para
// no robarle sitio al lobby. Todo lo que hay que explicar —las tres
// diligencias, la racha y el sello— vive en la hoja, que sólo se abre si te
// interesa.
import {ChevronRight,Flame,Gavel,Zap,MessagesSquare,Check,Stamp,ArrowRight,ClipboardList} from 'lucide-react';
import {DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {SELLO_XP,type Expediente,type MisionId} from '@/lib/expediente';

const ICONOS={veredictos:Gavel,pulso:Zap,sala:MessagesSquare} as const;
const IR={veredictos:'AL JUZGADO',pulso:'AL PULSO',sala:'A HABLAR'} as const;

/** Un expediente en blanco, para mientras carga o si no hay sesión. */
export const expedienteVacio:Expediente={
 misiones:[
  {id:'veredictos',titulo:'Dicta cinco veredictos',pista:'En el Juzgado',hechos:0,meta:5,hecho:false},
  {id:'pulso',titulo:'Responde al Pulso de hoy',pista:'Sí o no, sin pensarlo',hechos:0,meta:1,hecho:false},
  {id:'sala',titulo:'Habla en La Sala',pista:'Deja un argumento',hechos:0,meta:1,hecho:false}],
 completas:0,sellado:false,racha:0,mejorRacha:0,sellos:0};

export function ExpedienteTarjeta({expediente,onOpen}:{expediente:Expediente|null;onOpen:()=>void}){
 const e=expediente||expedienteVacio;
 return <button className={'mission-tile'+(e.sellado?' tile-sellada':'')} onClick={onOpen} aria-label={`Expediente del día, ${e.completas} de 3 diligencias`}>
  <span className="mission-icon">{e.sellado?<Stamp size={21}/>:<ClipboardList size={21}/>}</span>
  <div>
   <div className="mission-title">
    <strong>{e.sellado?'¡Expediente sellado!':'Expediente del día'}</strong>
    <span className="mission-meta">{e.racha>0&&<b className="racha-chip"><Flame size={11} fill="currentColor"/>{e.racha}</b>}<span>{e.completas}/3</span></span>
   </div>
   <div className="mission-segments" aria-hidden="true">{e.misiones.map(m=><i key={m.id} className={m.hecho?'done':''}><span style={{width:Math.round(Math.min(m.hechos/m.meta,1)*100)+'%'}}/></i>)}</div>
  </div>
  <ChevronRight size={19}/>
 </button>;
}

export function ExpedienteHoja({expediente,onIr}:{expediente:Expediente|null;onIr:(id:MisionId)=>void}){
 const e=expediente||expedienteVacio;
 const faltan=3-e.completas;
 return <>
  <span className="eyebrow">{e.sellado?'DILIGENCIAS COMPLETADAS':'CADA DÍA, UN EXPEDIENTE'}</span>
  <DialogTitle>{e.sellado?'Expediente sellado.':'El expediente del día.'}</DialogTitle>
  <DialogDescription>{e.sellado
   ?`Has pasado por el Juzgado, por el Pulso y por La Sala. +${SELLO_XP} XP.`
   :`Tres diligencias en tres sitios distintos. Te ${faltan===1?'queda una':`quedan ${faltan}`}.`}</DialogDescription>

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

  <ol className="diligencias">{e.misiones.map((m,i)=>{
   const Icono=ICONOS[m.id];
   return <li key={m.id} className={m.hecho?'hecha':''}>
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
