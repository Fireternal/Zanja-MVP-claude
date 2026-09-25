'use client';
// El Pulso del día, en Inicio.
//
// Una pregunta tonta, dos botones y ver de qué lado está la gente. No pide
// criterio ni tiempo: es lo que hace que merezca la pena abrir la app un
// martes cualquiera. Y es el único sitio donde se premia coincidir con la
// mayoría; en el Juzgado eso convertiría el criterio en apostar.

import {useState} from 'react';
import {ArrowRight,Check,X} from 'lucide-react';
import {DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {percentOf,type Choice} from '@/lib/pulse';

export type PulseState={
 day:number;question:string;choice:Choice|null;
 counts:{si:number;no:number}|null;total:number;hits:number;points:number;
 yesterday:{question:string;choice:Choice;winner:Choice|null;hit:boolean;points:number;
  counts:{si:number;no:number};total:number}|null;
};

const NOMBRE:Record<Choice,string>={si:'SÍ',no:'NO'};

/** La casilla de Inicio: la pregunta del día y, si ya has respondido, cómo va. */
export function PulsoTarjeta({pulse,onOpen}:{pulse:PulseState|null;onOpen:()=>void}){
 if(!pulse)return null;
 const marca=pulse.counts||{si:0,no:0};
 return <button className="daily-tile daily-feature illustrated-daily pulso-tarjeta" onClick={onOpen}>
  <img width={768} height={512} loading="eager" decoding="async" className="daily-art" src="/daily-menu.webp" alt="" aria-hidden="true"/>
  <span className="daily-art-shade" aria-hidden="true"/>
  <div className="daily-feature-heading"><h2>PULSO DE HOY</h2>
   {pulse.hits>0&&<span className="pulso-marcador">{pulse.points} pts</span>}</div>
  <div className="daily-question"><h3>{pulse.question}</h3></div>
  {pulse.choice
   ?<div className="pulso-mini" aria-hidden="true">
     <i className={'pulso-tramo pulso-si'+(pulse.choice==='si'?' es-mio':'')} style={{width:percentOf(marca,'si')+'%'}}/>
     <i className={'pulso-tramo pulso-no'+(pulse.choice==='no'?' es-mio':'')} style={{width:percentOf(marca,'no')+'%'}}/>
    </div>
   :<span className="pulso-llamada">Sin responder</span>}
  <ArrowRight className="shortcut-arrow" aria-hidden="true"/>
 </button>;
}

/** La hoja que se abre al entrar: responder y ver el reparto. */
export function PulsoHoja({pulse,busy,onAnswer}:{pulse:PulseState|null;busy:boolean;onAnswer:(c:Choice)=>Promise<boolean>}){
 const [pulsado,setPulsado]=useState<Choice|null>(null);
 if(!pulse)return null;

 const respondido=!!pulse.choice;
 const marca=pulse.counts||{si:0,no:0};
 const ayer=pulse.yesterday;

 return <section className="pulso" aria-labelledby="pulso-titulo">
  <span className="eyebrow">PULSO DE HOY</span>
  <DialogTitle id="pulso-titulo">{pulse.question}</DialogTitle>
  <DialogDescription>
   {respondido
    ?`Así va el pulso: ${pulse.total} ${pulse.total===1?'respuesta':'respuestas'}. Vuelve mañana.`
    :`${pulse.total} ${pulse.total===1?'persona ha respondido':'personas han respondido'}. Aciertas si vas con la mayoría.`}
  </DialogDescription>

  {respondido
   ?<div className="pulso-resultado">
     <div className="pulso-barra" role="img"
      aria-label={`Sí ${percentOf(marca,'si')}%, no ${percentOf(marca,'no')}%`}>
      <i className={'pulso-tramo pulso-si'+(pulse.choice==='si'?' es-mio':'')} style={{width:percentOf(marca,'si')+'%'}}/>
      <i className={'pulso-tramo pulso-no'+(pulse.choice==='no'?' es-mio':'')} style={{width:percentOf(marca,'no')+'%'}}/>
     </div>
     <div className="pulso-cifras">
      <span className={pulse.choice==='si'?'es-mio':''}>SÍ <b>{percentOf(marca,'si')}%</b></span>
      <small>{pulse.total} {pulse.total===1?'voto':'votos'}</small>
      <span className={pulse.choice==='no'?'es-mio':''}><b>{percentOf(marca,'no')}%</b> NO</span>
     </div>
    </div>
   :<div className="pulso-botones">
     {(['si','no'] as Choice[]).map(c=>
      <button key={c} className={'pulso-boton pulso-boton-'+c+(pulsado===c?' es-pulsado':'')}
       disabled={busy||!!pulsado}
       onClick={async()=>{setPulsado(c);if(!await onAnswer(c))setPulsado(null);}}>
       {c==='si'?<Check size={18}/>:<X size={18}/>}{NOMBRE[c]}</button>)}
    </div>}

  {ayer&&<p className={'pulso-ayer'+(ayer.hit?' es-acierto':'')}>
   {ayer.hit
    ?<>Ayer acertaste el pulso. <b>+{ayer.points} pts</b></>
    :ayer.winner
     ?<>Ayer ganó <b>{NOMBRE[ayer.winner]}</b> y tú dijiste {NOMBRE[ayer.choice]}.</>
     :<>Ayer quedó en empate: no ganó nadie.</>}
  </p>}
 </section>;
}
