'use client';
// El Pulso del día, en Inicio.
//
// Una pregunta tonta, dos botones y ver de qué lado está la gente. No pide
// criterio ni tiempo: es lo que hace que merezca la pena abrir la app un
// martes cualquiera. Y es el único sitio donde se premia coincidir con la
// mayoría; en el Juzgado eso convertiría el criterio en apostar.

import {useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,LockKeyhole,X,Timer} from 'lucide-react';
import {Sala} from '@/components/game/sala';
import {dayOf,percentOf,type Choice} from '@/lib/pulse';

export type PulseState={
 day:number;question:string;choice:Choice|null;
 counts:{si:number;no:number}|null;total:number;voices:number;hits:number;points:number;
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
  <div className="daily-feature-heading"><h2>PULSO DE <b>HOY</b></h2>
   {pulse.hits>0&&<span className="pulso-marcador">{pulse.points} pts</span>}</div>
  <div className="daily-question"><h3>{pulse.question}</h3></div>
  {pulse.choice
   ?<div className="pulso-avance">
     <div className="pulso-mini" aria-hidden="true">
      <i className="pulso-tramo pulso-si" style={{width:percentOf(marca,'si')+'%'}}/>
      <i className="pulso-tramo pulso-no" style={{width:percentOf(marca,'no')+'%'}}/>
     </div>
     <div className="pulso-mini-cifras"><span>SÍ {percentOf(marca,'si')}%</span><span>{percentOf(marca,'no')}% NO</span></div>
    </div>
   :<span className="pulso-llamada">Sin responder</span>}
  <ArrowRight className="shortcut-arrow" aria-hidden="true"/>
 </button>;
}

/** Cuánto queda para que el día cierre, que es la tensión de verdad. */
function restante(){
 const finDelDia=(dayOf()+1)*86400000;
 const queda=Math.max(0,finDelDia-Date.now());
 const h=Math.floor(queda/3600000),m=Math.floor(queda%3600000/60000),sg=Math.floor(queda%60000/1000);
 return h>0?`${h} h ${String(m).padStart(2,'0')} min`:`${m}:${String(sg).padStart(2,'0')}`;
}

/** La pantalla del Pulso: responder, ver el tirón y debatir. */
export function PulsoPantalla({pulse,busy,onAnswer,onBack}:{pulse:PulseState|null;busy:boolean;onAnswer:(c:Choice)=>Promise<boolean>;onBack:()=>void}){
 const [pulsado,setPulsado]=useState<Choice|null>(null);
 const [abierto,setAbierto]=useState(false);
 const respondido=!!pulse?.choice;
 // Un fotograma en tablas antes de abrirse: sin esto la barra aparece ya
 // colocada y no se ve el tirón.
 useEffect(()=>{if(!respondido){setAbierto(false);return;}
  const t=setTimeout(()=>setAbierto(true),90);return()=>clearTimeout(t);},[respondido,pulse?.day]);

 const [queda,setQueda]=useState(restante());
 useEffect(()=>{const t=setInterval(()=>setQueda(restante()),1000);return()=>clearInterval(t);},[]);
 if(!pulse)return null;

 const marca=pulse.counts||{si:0,no:0};
 const ayer=pulse.yesterday;

 return <section className="court-screen pulso-pantalla">
  <div className="court-ambiente" aria-hidden="true"><span/><i/></div>
  <header className="court-toolbar">
   <button className="icon-btn" aria-label="Volver al inicio" onClick={onBack}><ArrowLeft size={22}/></button>
   <h1>Pulso de hoy</h1>
   {pulse.hits>0&&<span className="pulso-marcador">{pulse.points} pts</span>}
  </header>
  <div className="court-desplazable pulso">
   <p className="pulso-cierre"><Timer size={15}/>CIERRA EN <b>{queda}</b></p>
   <h2 className="pulso-enunciado">{pulse.question}</h2>
   <p className="pulso-resumen">
    {respondido
     ?`${pulse.total} ${pulse.total===1?'respuesta':'respuestas'}. Aciertas si acabas con la mayoría.`
     :`${pulse.total} ${pulse.total===1?'persona ha respondido':'personas han respondido'}. Aciertas si vas con la mayoría.`}
   </p>

  {respondido
   ?<div className="pulso-resultado">
     {/* El duelo arranca en tablas y se abre hasta el reparto real: así se ve
         que esto es un tira y afloja y no una estadística. */}
     <div className="pulso-duelo" role="img"
      aria-label={`Sí ${percentOf(marca,'si')}%, no ${percentOf(marca,'no')}%`}>
      <i className="pulso-tramo pulso-si" style={{width:abierto?percentOf(marca,'si')+'%':'50%'}}/>
      <i className="pulso-tramo pulso-no" style={{width:abierto?percentOf(marca,'no')+'%':'50%'}}/>
      <span className="pulso-costura" style={{left:(abierto?percentOf(marca,'si'):50)+'%'}}/>
     </div>
     <div className="pulso-cifras">
      <span className={'pulso-lado-si'+(pulse.choice==='si'?' es-mio':'')}>SÍ <b>{percentOf(marca,'si')}%</b></span>
      <small>{pulse.total} {pulse.total===1?'voto':'votos'}</small>
      <span className={'pulso-lado-no'+(pulse.choice==='no'?' es-mio':'')}><b>{percentOf(marca,'no')}%</b> NO</span>
     </div>
    </div>
   :<>
     <div className="pulso-tapado" aria-hidden="true">
      <span>EL REPARTO SE VE AL RESPONDER</span>
     </div>
     <div className="pulso-botones">
      {(['si','no'] as Choice[]).map(c=>
       <button key={c} className={'pulso-boton pulso-boton-'+c+(pulsado===c?' es-pulsado':'')}
        disabled={busy||!!pulsado}
        onClick={async()=>{setPulsado(c);if(!await onAnswer(c))setPulsado(null);}}>
        {c==='si'?<Check size={18}/>:<X size={18}/>}{NOMBRE[c]}</button>)}
     </div>
     <div className="pulso-cerrojo">
      <LockKeyhole size={20}/>
      <div>
       <strong>{pulse.voices} {pulse.voices===1?'voz está debatiendo':'voces están debatiendo'} esto</strong>
       <small>Responde y entras. Aquí no se opina desde la barrera.</small>
      </div>
     </div>
    </>}

  {respondido&&<Sala sala={'pulso-'+pulse.day} titulo="ZONA DE DEBATE"/>}

  {ayer&&<p className={'pulso-ayer'+(ayer.hit?' es-acierto':'')}>
   {ayer.hit
    ?<>Ayer acertaste el pulso. <b>+{ayer.points} pts</b></>
    :ayer.winner
     ?<>Ayer ganó <b>{NOMBRE[ayer.winner]}</b> y tú dijiste {NOMBRE[ayer.choice]}.</>
     :<>Ayer quedó en empate: no ganó nadie.</>}
  </p>}
  </div>
 </section>;
}
