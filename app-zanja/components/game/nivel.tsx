'use client';
// Los niveles vistos desde la interfaz: la escalera del perfil, el aviso de
// una llave que aún no tienes y la hoja que lo explica cuando tocas algo
// cerrado. El candado siempre dice qué falta y cómo conseguirlo; un "no
// puedes" a secas sería lo peor que podría hacer una app que pide volver.
import {LockKeyhole,Check,ArrowRight,KeyRound} from 'lucide-react';
import {DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {rangos,NIVEL_LLAVE,tituloDe,nivelDe,progresoDe,xpDelNivel,type Llave} from '@/lib/niveles';

export function LlaveBloqueada({llave,xp}:{llave:Llave;xp:number}){
 const nivel=NIVEL_LLAVE[llave];
 return <div className="llave-bloqueada">
  <span className="llave-candado"><LockKeyhole size={17}/></span>
  <div><strong>{rangos.find(r=>r.llave===llave)?.desbloqueo}</strong>
   <small>Nivel {nivel} · {tituloDe(nivel)} · te faltan {Math.max(0,xpDelNivel(nivel)-xp)} XP</small></div>
 </div>;
}

export function EscaleraNiveles({xp}:{xp:number}){
 const nivel=nivelDe(xp);
 return <ol className="escalera">{rangos.map(r=>{
  const abierto=nivel>=r.nivel;
  return <li key={r.nivel} className={abierto?'abierto':''}>
   <span className="escalera-marca">{abierto?<Check size={15}/>:<LockKeyhole size={13}/>}<b>{r.nivel}</b></span>
   <div className="escalera-texto"><strong>{r.titulo}</strong><small>{r.desbloqueo}</small></div>
   <span className="escalera-xp">{r.xp?<>{r.xp}<i>XP</i></>:<i>DE SALIDA</i>}</span>
  </li>;})}
 </ol>;
}

/** Lo que se ve al tocar algo que todavía está cerrado. */
export function LlaveHoja({llave,xp,signedIn,onIr,onEntrar}:{llave:Llave;xp:number;signedIn:boolean;onIr:()=>void;onEntrar:()=>void}){
 const nivel=NIVEL_LLAVE[llave],falta=Math.max(0,xpDelNivel(nivel)-xp),p=progresoDe(xp);
 return <>
  <span className="success-emblem llave-emblema"><KeyRound size={42}/></span>
  <span className="eyebrow">NIVEL {nivel} · {tituloDe(nivel).toUpperCase()}</span>
  <DialogTitle>Todavía no.</DialogTitle>
  <DialogDescription>{llave==='crear'
   ?'Crear zanjas se abre cuando has juzgado unas cuantas. Así nadie publica un caso antes de haber visto por dentro cómo se defiende uno.'
   :llave==='invitar'
   ?'Invitar a la otra parte se abre en el nivel 3. Es la versión seria del juego: alguien de fuera escribe su defensa sin ver la tuya.'
   :'Adjuntar una prueba se abre en el nivel 4. Una foto pesa mucho en un veredicto, así que se gana.'}</DialogDescription>
  <div className="llave-progreso">
   <div><strong>Nivel {p.nivel} · {p.titulo}</strong><small>{falta} XP para el nivel {nivel}</small></div>
   <span className="llave-barra"><i style={{width:Math.round(Math.min(xp/xpDelNivel(nivel),1)*100)+'%'}}/></span>
  </div>
  <p className="notice">Un día completo del expediente son 60 XP: cinco veredictos, el Pulso y una intervención en La Sala.</p>
  {signedIn
   ?<button className="game-btn yellow" onClick={onIr}>IR AL JUZGADO<ArrowRight size={20}/></button>
   :<button className="game-btn yellow" onClick={onEntrar}>ENTRAR Y EMPEZAR<ArrowRight size={20}/></button>}
 </>;
}
