"use client";
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,Pause,Play} from 'lucide-react';
export function NextCountdown({onNext,blocked=false,onResume}:{onNext:()=>void;blocked?:boolean;onResume:()=>void}){
 const [remaining,setRemaining]=useState(4000),[paused,setPaused]=useState(false);
 const next=useRef(onNext);next.current=onNext;
 const remainingRef=useRef(4000),fired=useRef(false);
 useEffect(()=>{
  let last=performance.now();
  const timer=setInterval(()=>{const now=performance.now();const elapsed=now-last;last=now;
   if(paused||blocked||document.hidden||document.querySelector('[role="dialog"][data-state="open"],[role="alertdialog"][data-state="open"]'))return;
   remainingRef.current=Math.max(0,remainingRef.current-elapsed);setRemaining(remainingRef.current);
   if(remainingRef.current===0&&!fired.current){fired.current=true;clearInterval(timer);next.current();}
  },50);
  const visibility=()=>{last=performance.now();};document.addEventListener("visibilitychange",visibility);
  return()=>{clearInterval(timer);document.removeEventListener("visibilitychange",visibility);};
 },[paused,blocked]);
 function advance(){if(fired.current)return;fired.current=true;next.current();}
 return <div className="next-countdown"><div className="countdown-controls"><span>{paused||blocked?'Avance pausado':<>SIGUIENTE EN <b>{Math.ceil(remaining/1000)}</b></>}</span><button aria-label={paused||blocked?'Reanudar avance automático':'Pausar avance automático'} onClick={()=>{if(blocked){onResume();setPaused(false);}else setPaused(v=>!v);}}>{paused||blocked?<Play size={16}/>:<Pause size={16}/>}</button></div><button className="game-btn yellow court-next" onClick={advance}>SIGUIENTE ZANJA<ArrowRight size={20}/><span className="countdown-track" role="progressbar" aria-label="Tiempo hasta el siguiente caso" aria-valuemin={0} aria-valuemax={4} aria-valuenow={Math.ceil(remaining/1000)}><span style={{transform:`scaleX(${remaining/4000})`}}/></span></button></div>;
}
