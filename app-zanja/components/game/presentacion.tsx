'use client';
// La presentación: los primeros cuarenta segundos de ZANJA.
//
// Un tutorial que se lee no lo lee nadie. Así que aquí no se explica la app,
// se enseña funcionando: cada lámina tiene dentro la pieza de la que habla
// —el duelo, la barra del veredicto, el expediente— moviéndose sola. Se pasa
// deslizando o con el botón, se salta desde la primera y se puede volver a
// ver desde Ajustes, así que no atrapa a nadie.
//
// Sale una sola vez, la primera, y termina donde empieza la app de verdad:
// el último botón no dice "hecho", dice "empezar a juzgar", y lleva al
// Juzgado con el primer caso ya cargado.

import {useEffect,useRef,useState} from 'react';
import {ArrowRight,ArrowLeft,ClipboardList,KeyRound,Zap} from 'lucide-react';

/** A partir de aquí es un gesto y no un toque. */
const ARRASTRE=46;

type Lamina={
 id:string;
 mascota:string;
 eyebrow:string;
 titulo:string;
 texto:string;
 boton:string;
};

const LAMINAS:Lamina[]=[
 {id:'que-es',mascota:'/mazo-reposo.webp',
  eyebrow:'BIENVENIDO AL JUZGADO',
  titulo:'Dos bandos.\nUn jurado.',
  texto:'Alguien cuenta su versión. La otra parte cuenta la suya. Y un jurado de gente que no conoce a ninguno de los dos decide quién tiene razón.',
  boton:'¿Y CÓMO SE VOTA?'},
 {id:'votar',mascota:'/mazo-senala.webp',
  eyebrow:'ASÍ SE ZANJA',
  titulo:'Lees las dos.\nEliges una.',
  texto:'Tres argumentos por bando, sin nombres y sin comentarios hasta que votas. Puedes dar la razón a uno, a los dos o a ninguno.',
  boton:'¿Y QUIÉN DECIDE?'},
 {id:'veredicto',mascota:'/mazo-golpe.webp',
  eyebrow:'EL JURADO DECIDE',
  titulo:'Cinco votos\ny hay sentencia.',
  texto:'Con menos de cinco no hay veredicto: se queda sin jurado suficiente. Cuando lo hay, el resultado se sella y ya no se mueve. Después se habla en La Sala.',
  boton:'¿Y YO QUÉ GANO?'},
 {id:'tu-dia',mascota:'/mazo-celebra.webp',
  eyebrow:'Y TÚ, CADA DÍA',
  titulo:'Un expediente\nal día.',
  texto:'',
  boton:'EMPEZAR A JUZGAR'},
];

/** Las cuatro respuestas del duelo, que se encienden por turnos en la lámina 2. */
const RESPUESTAS=[
 {texto:'BANDO A',clase:'es-a'},
 {texto:'BANDO B',clase:'es-b'},
 {texto:'LOS DOS',clase:'es-ambos'},
 {texto:'NINGUNO',clase:'es-nadie'},
];

const DIARIO=[
 {Icon:ClipboardList,titulo:'El expediente del día',
  texto:'Tres diligencias: juzga, responde al Pulso y di lo tuyo en La Sala.'},
 {Icon:Zap,titulo:'Experiencia y niveles',
  texto:'Cada veredicto suma. Al nivel 2 se abre crear tus propias zanjas.'},
 {Icon:KeyRound,titulo:'Tus zanjas',
  texto:'Publica una discusión tuya, invita a la otra parte y que decida el jurado.'},
];

export function Presentacion({onCerrar}:{onCerrar:(alJuzgado:boolean)=>void}){
 const [i,setI]=useState(0);
 const [arrastre,setArrastre]=useState(0);
 const origen=useRef<number|null>(null);
 const titulo=useRef<HTMLHeadingElement|null>(null);
 const visor=useRef<HTMLDivElement|null>(null);
 const ultima=i===LAMINAS.length-1;

 const mueve=(paso:number)=>setI(n=>Math.min(LAMINAS.length-1,Math.max(0,n+paso)));

 // El teclado hace lo mismo que el dedo, y Escape sale como el botón saltar.
 useEffect(()=>{
  const tecla=(e:KeyboardEvent)=>{
   if(e.key==='Escape')onCerrar(false);
   if(e.key==='ArrowRight')mueve(1);
   if(e.key==='ArrowLeft')mueve(-1);
  };
  addEventListener('keydown',tecla);
  return()=>removeEventListener('keydown',tecla);
 },[onCerrar]);

 // Al cambiar de lámina el foco va al titular: quien navega con lector de
 // pantalla se entera de que la pantalla ha cambiado. Pero sin preventScroll
 // el navegador desplaza el visor para "enseñar" ese titular, que todavía
 // está fuera de pantalla mientras el carril se desliza, y el carril se queda
 // descuadrado una lámina entera. Con el foco quieto y el scroll a cero, la
 // única cosa que mueve el carril es su transform.
 useEffect(()=>{
  titulo.current?.focus({preventScroll:true});
  if(visor.current)visor.current.scrollLeft=0;
 },[i]);

 const l=LAMINAS[i];
 return <div className="presentacion" role="dialog" aria-modal="true" aria-label="Cómo funciona ZANJA">
  <div className="fondo" aria-hidden="true"><b/><u/><s/><i/></div>

  <header className="presentacion-mando">
   <ol className="presentacion-puntos" aria-hidden="true">
    {LAMINAS.map((x,n)=><li key={x.id} className={n===i?'es-ahora':n<i?'es-visto':''}/>)}
   </ol>
   {!ultima&&<button className="quiet-btn" onClick={()=>onCerrar(false)}>Saltar</button>}
  </header>

  <div className="presentacion-visor" ref={visor}
   onTouchStart={e=>{origen.current=e.touches[0].clientX;}}
   onTouchMove={e=>{if(origen.current!==null)setArrastre(e.touches[0].clientX-origen.current);}}
   onTouchEnd={()=>{
    if(Math.abs(arrastre)>ARRASTRE)mueve(arrastre<0?1:-1);
    origen.current=null;setArrastre(0);
   }}>
   <div className="presentacion-carril" style={{transform:`translateX(calc(${-i*100}% + ${arrastre}px))`}}>
    {LAMINAS.map((x,n)=><section key={x.id} className={'presentacion-lamina lamina-'+x.id+(n===i?' es-ahora':'')} aria-hidden={n!==i}>

     <div className="presentacion-escena">
      <img className="presentacion-mascota" width={300} height={300} src={x.mascota} alt="" aria-hidden="true"/>

      {/* Lámina 1: los dos bandos entran por los lados y se quedan mirándose. */}
      {x.id==='que-es'&&<><span className="mini-bando mini-a" aria-hidden="true">A</span>
       <span className="mini-bando mini-b" aria-hidden="true">B</span></>}

      {/* Lámina 2: las cuatro respuestas se encienden por turnos. */}
      {x.id==='votar'&&<ul className="mini-respuestas" aria-hidden="true">
       {RESPUESTAS.map((r,k)=><li key={r.texto} className={r.clase} style={{'--turno':k} as React.CSSProperties}>{r.texto}</li>)}
      </ul>}

      {/* Lámina 3: la barra se llena y el mazo cae encima. */}
      {x.id==='veredicto'&&<div className="mini-barra" aria-hidden="true"><i/><b>68%</b></div>}
     </div>

     <div className="presentacion-texto">
      <span className="eyebrow">{x.eyebrow}</span>
      <h2 tabIndex={-1} ref={n===i?titulo:undefined}>{x.titulo.split('\n').map((linea,k)=><span key={k}>{linea}</span>)}</h2>
      {x.texto&&<p>{x.texto}</p>}
      {x.id==='tu-dia'&&<ul className="presentacion-lista">
       {DIARIO.map(({Icon,titulo,texto},k)=><li key={titulo} style={{'--turno':k} as React.CSSProperties}>
        <span><Icon size={20}/></span><div><strong>{titulo}</strong><small>{texto}</small></div>
       </li>)}
      </ul>}
     </div>
    </section>)}
   </div>
  </div>

  <footer className="presentacion-pie">
   {i>0&&<button className="icon-btn" onClick={()=>mueve(-1)} aria-label="Lámina anterior"><ArrowLeft size={21}/></button>}
   <button className="game-btn yellow" onClick={()=>ultima?onCerrar(true):mueve(1)}>
    {l.boton}<ArrowRight size={20}/>
   </button>
  </footer>
 </div>;
}
