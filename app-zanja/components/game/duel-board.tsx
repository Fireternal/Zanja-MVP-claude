'use client';
import {useLayoutEffect,useRef,useState} from 'react';
import {ArrowRight,Check,Expand,LoaderCircle,ChevronRight} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {EvidenceViewer} from './evidence';
import type {Case} from '@/lib/cases';
type Side='a'|'both'|'b';
type Props={c:Case;canVote:boolean;pressed:Side|null;choose:(s:Side)=>void;onNext:()=>void;onShare:(c:Case,invite?:boolean)=>void;onRevise:(c:Case)=>void;ready:boolean;onResult:()=>void};
export function DuelBoard({c,canVote,pressed,choose,onNext,onShare,onRevise,ready,onResult}:Props){
 const root=useRef<HTMLDivElement>(null);const question=useRef<HTMLHeadingElement>(null);
 const [reading,setReading]=useState(false),[photo,setPhoto]=useState(false),[questionLong,setQuestionLong]=useState(false);
 useLayoutEffect(()=>{
  const node=question.current;if(!node)return;let active=true;
  const measure=()=>{if(active)setQuestionLong(node.scrollHeight>node.clientHeight+1);};
  const observer=new ResizeObserver(measure);observer.observe(node);document.fonts.ready.then(measure);measure();
  return()=>{active=false;observer.disconnect();};
 },[]);
 const eligible=canVote&&!pressed;
 const lines=(side:'a'|'b')=><>{c[side].map((text,i)=><span className="vote-argument" key={i}><span className="vote-number">{i+1}</span><span>{text}</span></span>)}{!c[side].length&&<span className="vote-waiting">Esperando sus defensas</span>}</>;
 return <div className={"fixed-duel"+(pressed?" vote-pending":"")} ref={root}>
  <div className={'duel-prompt'+(c.evidenceUrl?' with-photo':'')}><div><h2 ref={question}>{c.q}</h2>{!c.editorial&&<span className="case-origin">{c.bilateral?'Dos versiones independientes':'Relato de una sola persona'}</span>}{(questionLong||c.story)&&<button className="read-question" onClick={()=>setReading(true)}>{c.story?'Leer contexto':'Leer pregunta completa'}</button>}</div>{c.evidenceUrl&&<button className="case-photo" onClick={()=>setPhoto(true)} aria-label="Ver prueba gráfica"><img src={c.evidenceUrl} alt="Imagen adjunta al caso"/><span><Expand size={12}/>Prueba</span></button>}</div>
  <div className="fixed-battle">
   {(['a','b'] as const).map(side=><div className={'vote-team vote-'+side+(c.choice===side||pressed===side?' selected':'')} key={side}>
    <button className="team-vote" disabled={!eligible} onClick={()=>choose(side)} aria-label={`Votar bando ${side.toUpperCase()}. ${c[side].join(' ')}`}><span className="vote-heading"><img className="team-scene" width={384} height={256} decoding="async" src="/court-energy.webp" alt="" aria-hidden="true"/><span>BANDO <b>{side.toUpperCase()}</b></span>{pressed===side?<LoaderCircle size={20} className="spin"/>:c.choice===side?<Check size={20}/>:<ArrowRight size={20}/>}</span><span className="vote-defenses">{lines(side)}</span></button>
   </div>)}
   <div className="battle-seam"><span className="seam-line"/><span className="battle-vs" aria-hidden="true">VS</span><span className="seam-line"/></div>
  </div>
  <button className={'vote-both'+(c.choice==='both'||pressed==='both'?' selected':'')} disabled={!eligible} onClick={()=>choose('both')} aria-label="Votar Ambos: los dos bandos tienen razón"><img className="both-art" src="/court-energy.webp" width={384} height={256} decoding="async" alt="" aria-hidden="true"/><span className="both-copy"><strong>AMBOS</strong><small>Los dos tienen razón</small></span>{pressed==='both'?<LoaderCircle size={21} className="spin"/>:c.choice==='both'?<Check size={21}/>:<ArrowRight size={21}/>}</button>
  <footer className="battle-footer">{c.needsDefenses&&c.mine?<button onClick={()=>onRevise(c)}>Completar defensas<ArrowRight size={16}/></button>:c.status==='waiting'&&c.invite?<button onClick={()=>onShare(c,true)}>Invitar al bando B<ArrowRight size={16}/></button>:ready?<button onClick={onResult}>Ver resultado<ArrowRight size={16}/></button>:<button disabled={!!pressed} onClick={onNext}>Saltar zanja<ChevronRight size={16}/></button>}</footer>
  {c.evidenceUrl&&<EvidenceViewer src={c.evidenceUrl} open={photo} onOpenChange={setPhoto}/>}
  <Dialog open={reading} onOpenChange={setReading}><DialogContent className="duel-reading-dialog"><DialogTitle>{c.q}</DialogTitle><DialogDescription>Las tres defensas de cada bando.</DialogDescription>{c.story&&<p className="case-story">{c.story}</p>}{(['a','b'] as const).map(side=><section className={'reading-'+side} key={side}><h3>BANDO {side.toUpperCase()}</h3><ol>{c[side].map((text,i)=><li key={i}>{text}</li>)}</ol></section>)}<button className="game-btn yellow" onClick={()=>setReading(false)}>VOLVER AL DUELO</button></DialogContent></Dialog>
 </div>;
}
