'use client';
// El Pulso del día, en Inicio.
//
// Una pregunta tonta, dos botones y ver de qué lado está la gente. No pide
// criterio ni tiempo: es lo que hace que merezca la pena abrir la app un
// martes cualquiera. Y es el único sitio donde se premia coincidir con la
// mayoría; en el Juzgado eso convertiría el criterio en apostar.

import {useState} from 'react';
import {Activity,Check,X} from 'lucide-react';
import {percentOf,type Choice} from '@/lib/pulse';

export type PulseState={
 day:number;question:string;choice:Choice|null;
 counts:{si:number;no:number}|null;total:number;hits:number;points:number;
 yesterday:{question:string;choice:Choice;winner:Choice|null;hit:boolean;points:number;
  counts:{si:number;no:number};total:number}|null;
};

const NOMBRE:Record<Choice,string>={si:'SÍ',no:'NO'};

export function Pulso({pulse,busy,onAnswer}:{pulse:PulseState|null;busy:boolean;onAnswer:(c:Choice)=>Promise<boolean>}){
 const [pulsado,setPulsado]=useState<Choice|null>(null);
 if(!pulse)return null;

 const respondido=!!pulse.choice;
 const marca=pulse.counts||{si:0,no:0};
 const ayer=pulse.yesterday;

 return <section className="pulso" aria-labelledby="pulso-titulo">
  <header className="pulso-cabecera">
   <h2 id="pulso-titulo"><Activity size={16}/>PULSO DE HOY</h2>
   {pulse.hits>0&&<span className="pulso-marcador">{pulse.points} pts</span>}
  </header>

  <p className="pulso-pregunta">{pulse.question}</p>

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
