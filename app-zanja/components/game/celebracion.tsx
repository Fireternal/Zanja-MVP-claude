'use client';
// Las dos celebraciones de la app.
//
// Subir de nivel abre una puerta y sellar el expediente cierra un día: son los
// únicos dos momentos que se ganan la pantalla entera. El resto de la app
// celebra en pequeño —un golpe, un destello— para que estos dos signifiquen
// algo cuando llegan.
import {useEffect} from 'react';
import {KeyRound,Flame,ArrowRight} from 'lucide-react';
import {rangos,tituloDe} from '@/lib/niveles';
import {SELLO_XP} from '@/lib/expediente';

export type Fiesta={tipo:'nivel';nivel:number}|{tipo:'sello';racha:number};

/** Se cierra sola cuando no hay nada que leer; el nivel espera a que lo mires. */
const SOLA=4200;

/** Trozos de confeti repartidos en abanico, siempre igual para poder probarlo. */
const CONFETI=Array.from({length:18},(_,i)=>{
 const angulo=(i/18)*Math.PI*2+(i%3)*0.21;
 const lejos=118+((i*37)%96);
 return {x:Math.round(Math.cos(angulo)*lejos),y:Math.round(Math.sin(angulo)*lejos)-40,
  color:['#ffd13e','#76d9fa','#ffa5b5','#b389ec','#fff3c4'][i%5],
  tarda:(i%6)*0.045,giro:(i%2?1:-1)*(220+(i*53)%260)};
});

export function Celebracion({fiesta,onCerrar}:{fiesta:Fiesta;onCerrar:()=>void}){
 useEffect(()=>{
  const fuera=(e:KeyboardEvent)=>{if(e.key==='Escape')onCerrar();};
  addEventListener('keydown',fuera);
  const reloj=fiesta.tipo==='sello'?setTimeout(onCerrar,SOLA):undefined;
  return()=>{removeEventListener('keydown',fuera);if(reloj)clearTimeout(reloj);};
 },[fiesta,onCerrar]);

 const rango=fiesta.tipo==='nivel'?rangos.find(r=>r.nivel===fiesta.nivel):undefined;
 return <div className={'fiesta'+(fiesta.tipo==='sello'?' sello':'')} role="dialog" aria-live="polite"
  aria-label={fiesta.tipo==='nivel'?`Has subido al nivel ${fiesta.nivel}`:'Expediente del día sellado'}
  onClick={onCerrar}>
  <span className="fiesta-rayos" aria-hidden="true"/>
  <span className="fiesta-aro" aria-hidden="true"/><span className="fiesta-aro" aria-hidden="true"/><span className="fiesta-aro" aria-hidden="true"/>
  {CONFETI.map((c,i)=><span key={i} className="fiesta-confeti" aria-hidden="true"
   style={{'--x':c.x+'px','--y':c.y+'px','--color':c.color,'--tarda':c.tarda+'s','--giro':c.giro+'deg'} as React.CSSProperties}/>)}

  <span className="fiesta-emblema con-mascota">
   <img width={380} height={380} src={fiesta.tipo==='nivel'?'/mazo-celebra.webp':'/mazo-sella.webp'} alt="" aria-hidden="true"/>
   {fiesta.tipo==='nivel'&&<b>{fiesta.nivel}</b>}
  </span>

  <div className="fiesta-cuerpo">
   {fiesta.tipo==='nivel'?<>
    <span className="fiesta-eyebrow">HAS SUBIDO AL NIVEL {fiesta.nivel}</span>
    <h2>{tituloDe(fiesta.nivel)}</h2>
    {rango?.llave
     ?<div className="fiesta-llave"><span><KeyRound size={20}/></span>
       <div><small>LLAVE NUEVA</small><strong>{rango.desbloqueo}</strong></div></div>
     :<p>{rango?.desbloqueo||'Sigues subiendo. El Juzgado ya te conoce.'}</p>}
   </>:<>
    <span className="fiesta-eyebrow">EXPEDIENTE DEL DÍA</span>
    <h2>Día sellado.</h2>
    <p>Has pasado por el Juzgado, por el Pulso y por La Sala.</p>
    <span className="fiesta-xp">+{SELLO_XP} XP</span>
    {fiesta.racha>1&&<div className="fiesta-llave"><span><Flame size={20} fill="currentColor"/></span>
     <div><small>RACHA</small><strong>{fiesta.racha} días seguidos</strong></div></div>}
   </>}
   <button className="game-btn yellow fiesta-salir" onClick={onCerrar}>
    {fiesta.tipo==='nivel'?'SEGUIR JUZGANDO':'¡HASTA MAÑANA!'}<ArrowRight size={20}/>
   </button>
  </div>
 </div>;
}
