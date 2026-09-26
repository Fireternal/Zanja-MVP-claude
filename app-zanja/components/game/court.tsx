'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,SlidersHorizontal,Check,Flag,Clock,Gavel,Zap,Trophy,Share2,BookOpen,ChevronRight,RotateCcw,Link2,LoaderCircle,HeartHandshake,Stamp} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {RadioGroup,RadioGroupItem} from '@/components/ui/radio-group';
import {EvidenceAccess} from '@/components/game/evidence';
import {DuelBoard} from '@/components/game/duel-board';
import {categories,validDefenses,type Case} from '@/lib/cases';
import {Sentencia} from '@/components/game/sentencia';
import {Sala} from '@/components/game/sala';
import {Marcador} from '@/components/game/marcador';
import {Defensas} from '@/components/game/defensas';
type Props={onCambio?:()=>void;current?:Case;cases:Case[];filter:string;loading:boolean;busy:boolean;celebrate:boolean;onFilter:(s:string)=>void;onBack:()=>void;onVote:(side:'a'|'both'|'b'|'none')=>Promise<boolean>;onNext:()=>void;onCreate:()=>void;onReport:()=>void;onShare:(c:Case,invite?:boolean)=>void;onRevise:(c:Case)=>void;};
function time(c:Case){if(c.status==='closed')return 'Cerrado';if(c.status==='waiting')return 'Esperando a B';if(!c.closes)return 'Sin límite';const m=Math.max(1,Math.ceil((c.closes-Date.now())/60000));return m>60?`${Math.ceil(m/60)} h`:`${m} min`;}
export function Court({onCambio,current:c,cases,filter,loading,busy,celebrate,onFilter,onBack,onVote,onNext,onCreate,onReport,onShare,onRevise}:Props){
 const [filters,setFilters]=useState(false),[choice,setChoice]=useState(filter),[pressed,setPressed]=useState<'a'|'both'|'b'|'none'|null>(null);
 const [sentencia,setSentencia]=useState(false),[defensas,setDefensas]=useState<'a'|'b'|null>(null);
 const heading=useRef<HTMLHeadingElement>(null);
 const result=!!c?.counts&&!!(c.choice||c.status==='closed'||c.mine&&c.status==='open');
 useEffect(()=>{setPressed(null);setDefensas(null);},[c?.id]);
 useEffect(()=>{if(c?.choice){setPressed(null);heading.current?.focus({preventScroll:true});}},[c?.choice]);
 const canVote=!!c&&c.status==='open'&&!c.choice&&!c.mine&&!c.participant&&validDefenses(c.a)&&validDefenses(c.b)&&!loading&&!busy;
 const choose=async(side:'a'|'both'|'b'|'none')=>{if(!canVote||pressed)return;setPressed(side);if(!await onVote(side))setPressed(null);};
 return <section className={'court-screen '+(result?'court-results':'')}>
  <div className="court-ambiente" aria-hidden="true"><span/><i/></div>
  <header className="court-toolbar"><button className="icon-btn" aria-label="Volver al inicio" onClick={onBack}><ArrowLeft size={22}/></button><h1 tabIndex={-1} ref={heading}>{result?'Tu veredicto':'El Juzgado'}</h1>{c&&<button className="icon-btn court-report" aria-label="Denunciar caso" onClick={onReport}><Flag size={19}/></button>}<button className={'court-filter icon-btn '+(filter!=='Todas'?'is-filtered':'')} aria-label={filter==='Todas'?'Filtrar casos':`Filtrar casos: ${filter}`} onClick={()=>{setChoice(filter);setFilters(true);}}><SlidersHorizontal size={21}/>{filter!=='Todas'&&<i/>}</button></header>
  {!c?<div className="court-empty"><Gavel size={48}/><h2>{loading?'Preparando el duelo…':'¡Todo zanjado!'}</h2><p>No quedan casos en esta selección. Elige otro tema o crea una zanja.</p><button className="game-btn yellow" onClick={()=>onFilter('Todas')}><RotateCcw size={19}/>VER TODOS</button><button className="quiet-btn" onClick={onCreate}>Crear una zanja<ArrowRight size={18}/></button></div>:result?<div className={'court-result-body '+(celebrate?'result-arrives':'')} key={'result-'+c.id}>
   {celebrate&&<div className="party-burst" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} style={{"--piece":i} as React.CSSProperties}/>)}</div>}
   <div className="court-desplazable"><div className="verdict-banner"><span className="verdict-confirmation"><Check size={18}/>{c.choice?'VOTO REGISTRADO':'ASÍ OPINA EL JURADO'}</span>{c.choice&&<span className="verdict-reward"><Zap size={16} fill="currentColor"/>+5 XP</span>}<h2 className="verdict-question">{c.q}</h2></div>
   <div className="verdict-context"><p className="verdict-status">{c.status==='closed'?'Resultado final':'Votación abierta'} · {c.total||0} {(c.total||0)===1?'voto':'votos'}</p>{c.evidenceUrl&&<EvidenceAccess src={c.evidenceUrl}/>}</div>
   <Marcador c={c} onLado={setDefensas}/>
   <div className="verdict-actions"><button className="quiet-btn" onClick={()=>setDefensas('a')}><BookOpen size={18}/>Ver defensas</button>{c.status==='closed'?<button className="quiet-btn" onClick={()=>{setSentencia(true);}}><Stamp size={18}/>Ver sentencia</button>:<button className="quiet-btn" onClick={()=>{onShare(c);}}><Share2 size={18}/>Compartir</button>}</div>
   <Sala key={'sala-'+c.id} sala={c.id} onCambio={onCambio}/>
   </div>
   <div className="court-salida"><button className="game-btn yellow court-next" onClick={onNext}>SIGUIENTE ZANJA<ArrowRight size={20}/></button></div>
  </div>:<DuelBoard key={c.id} c={c} canVote={canVote} pressed={pressed} choose={choose} onNext={onNext} onShare={onShare} onRevise={onRevise} />}

  {c&&<Sentencia c={c} open={sentencia} onOpenChange={setSentencia} onLink={()=>onShare(c)}/>}
  {c&&<Defensas c={c} abierto={!!defensas} onAbrir={v=>setDefensas(v?defensas||'a':null)} inicial={defensas||'a'}/>}
  <Dialog open={filters} onOpenChange={setFilters}><DialogContent className="zanja-dialog bottom-sheet court-filter-sheet"><DialogTitle>Elige tu terreno.</DialogTitle><DialogDescription>¿Qué te apetece zanjar?</DialogDescription><RadioGroup value={choice} onValueChange={setChoice} className="court-filter-options">{categories.map(cat=><label key={cat} className={choice===cat?'selected':''}><RadioGroupItem value={cat}/><span>{cat}</span><small>{cases.filter(x=>x.status==='open'&&!x.choice&&!x.mine&&!x.participant&&!x.reported&&(cat==='Todas'||x.tag===cat)).length}</small></label>)}</RadioGroup><button className="game-btn yellow" onClick={()=>{onFilter(choice);setFilters(false);}}>APLICAR FILTRO<Check size={19}/></button></DialogContent></Dialog>
 </section>;
}
