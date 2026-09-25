'use client';
// La Sala: lo que dice el jurado después de votar.
//
// Tres reglas la separan de una sección de comentarios cualquiera, y las tres
// son a propósito:
//   · Se habla después de votar, así que nadie opina sin mojarse.
//   · Una vez por caso y sin respuestas: es una sala, no un hilo.
//   · Se secunda en vez de dar me gusta, y lo más secundado entra en la
//     sentencia como voto particular.

import {useCallback,useEffect,useRef,useState} from 'react';
import {Gavel,LoaderCircle,Send,Trash2,Users} from 'lucide-react';
import {COMMENT_MAX,COMMENT_MIN} from '@/lib/cases';

type Voz={id:string;side:string;body:string;at:number;seconds:number;seconded:boolean;mine:boolean};
type Estado={comments:Voz[];open:boolean;voted:boolean;spoke:boolean;protagonist:boolean};

const BANDO:Record<string,string>={a:'BANDO A',both:'LOS DOS',b:'BANDO B',none:'NINGUNO',si:'SÍ',no:'NO'};

function cuando(at:number){
 const minutos=Math.floor((Date.now()-at)/60000);
 if(minutos<1)return 'ahora mismo';
 if(minutos<60)return `hace ${minutos} min`;
 const horas=Math.floor(minutos/60);
 if(horas<24)return `hace ${horas} h`;
 const dias=Math.floor(horas/24);
 return dias===1?'ayer':`hace ${dias} días`;
}

export function Sala({sala,titulo='LA SALA'}:{sala:string;titulo?:string}){
 const [estado,setEstado]=useState<Estado|null>(null);
 const [texto,setTexto]=useState('');
 const [enviando,setEnviando]=useState(false);
 const [error,setError]=useState('');
 const campo=useRef<HTMLTextAreaElement>(null);

 const cargar=useCallback(async()=>{
  try{
   const r=await fetch('/api/game?room='+encodeURIComponent(sala),{cache:'no-store'});
   const d=await r.json() as Estado;
   if(r.ok)setEstado(d);
  }catch{}
 },[sala]);

 useEffect(()=>{setEstado(null);setTexto('');setError('');cargar();},[cargar]);

 async function envia(payload:unknown){
  const r=await fetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const d=await r.json() as any;
  if(!r.ok)throw new Error(d.error||'No se ha podido guardar.');
  return d;
 }

 async function hablar(){
  const cuerpo=texto.trim();
  if(cuerpo.length<COMMENT_MIN||enviando)return;
  setEnviando(true);setError('');
  try{await envia({action:'comment',id:sala,body:cuerpo});setTexto('');await cargar();}
  catch(e:any){setError(e.message);}
  finally{setEnviando(false);}
 }

 async function secundar(voz:Voz){
  // Se pinta antes de que conteste el servidor: si falla, se recoloca al recargar.
  setEstado(e=>e&&{...e,comments:e.comments.map(v=>v.id===voz.id?{...v,seconded:!v.seconded,seconds:v.seconds+(v.seconded?-1:1)}:v)});
  try{await envia({action:'second',id:voz.id});}catch(e:any){setError(e.message);}
  finally{cargar();}
 }

 async function borrar(){
  setEnviando(true);
  try{await envia({action:'uncomment',id:sala});await cargar();}
  catch(e:any){setError(e.message);}
  finally{setEnviando(false);}
 }

 const voces=estado?.comments||[];
 const puedeHablar=!!estado&&estado.open&&estado.voted&&!estado.spoke&&!estado.protagonist;

 return <section className="sala" aria-labelledby="sala-titulo">
  <header className="sala-cabecera">
   <h3 id="sala-titulo"><Users size={18}/>{titulo}</h3>
   <span>{voces.length} {voces.length===1?'voz':'voces'}</span>
  </header>

  {!estado
   ?<p className="sala-aviso"><LoaderCircle size={17} className="spin"/>Abriendo la sala…</p>
   :estado.protagonist
    ?<p className="sala-aviso"><Gavel size={17}/>La Sala es del jurado. Tu versión ya está en el caso.</p>
    :!estado.voted
     ?<p className="sala-aviso"><Gavel size={17}/>Aquí se habla después de votar.</p>
     :!estado.open
      ?<p className="sala-aviso"><Gavel size={17}/>La Sala se cerró con el caso.</p>
      :puedeHablar&&<div className="sala-turno">
        <textarea ref={campo} value={texto} onChange={e=>setTexto(e.target.value.slice(0,COMMENT_MAX))}
         placeholder="¿Por qué has votado así?" rows={2} maxLength={COMMENT_MAX} aria-label="Tu argumento"/>
        <div className="sala-turno-pie">
         <small>{texto.trim().length}/{COMMENT_MAX}</small>
         <button className="game-btn yellow small" onClick={hablar} disabled={texto.trim().length<COMMENT_MIN||enviando}>
          {enviando?<LoaderCircle size={17} className="spin"/>:<Send size={17}/>}HABLAR</button>
        </div>
       </div>}

  {error&&<p className="sala-error" role="alert">{error}</p>}

  {voces.length
   ?<ul className="sala-voces">{voces.map(v=><li key={v.id} className={'voz voz-'+v.side+(v.mine?' voz-mia':'')}>
     <div className="voz-cabecera"><span className="voz-bando">{BANDO[v.side]||v.side}</span><time>{cuando(v.at)}</time></div>
     <p>{v.body}</p>
     <div className="voz-pie">
      <button className={'secundar'+(v.seconded?' is-on':'')} onClick={()=>secundar(v)}
       disabled={v.mine||!estado?.open} aria-pressed={v.seconded}
       title={v.mine?'No puedes secundarte a ti mismo':'Secundar este argumento'}>
       <Gavel size={15}/>SECUNDAR<b>{v.seconds}</b></button>
      {v.mine&&estado?.open&&<button className="voz-borrar" onClick={borrar} disabled={enviando}><Trash2 size={15}/>Borrar</button>}
     </div>
    </li>)}</ul>
   :estado&&<p className="sala-vacia">Todavía no ha hablado nadie.{puedeHablar&&' Abre tú.'}</p>}
 </section>;
}
