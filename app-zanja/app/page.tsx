'use client';
import {useState,useEffect,useCallback,useRef} from 'react';
import {Home,Swords,Layers,UserRound,Plus,ArrowRight,ArrowLeft,ChevronRight,Zap,Star,Trophy,Flame,ShieldCheck,Clock,Check,Flag,Share2,Copy,RotateCcw,HeartHandshake,Link2,Sparkles,CheckCircle2,LoaderCircle,Settings2,X,LockKeyhole,Gavel,Send,Trash2,BookOpen,Stamp} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel,AlertDialogAction} from '@/components/ui/alert-dialog';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {RadioGroup,RadioGroupItem} from '@/components/ui/radio-group';
import {Switch} from '@/components/ui/switch';
import {Checkbox} from '@/components/ui/checkbox';
import {Progress} from '@/components/ui/progress';
import {Toaster} from '@/components/ui/sonner';
import {toast} from 'sonner';
import {seeds,categories,validDefenses,draftDefenses,type Case} from '@/lib/cases';
import {CreateZanja,type ZanjaDraft} from '@/components/game/create-zanja';
import {InviteResponse} from '@/components/game/invite-response';
import {Court} from '@/components/game/court';
import {DefenseFields} from '@/components/game/defense-fields';
import {EvidenceField,EvidenceAccess} from '@/components/game/evidence';
import {PulsoTarjeta,PulsoPantalla,type PulseState} from '@/components/game/pulso';
import {ExpedienteTarjeta,ExpedienteHoja} from '@/components/game/expediente';
import {FichaCaso} from '@/components/game/ficha';
import {Campana,AvisosHoja,type Campanario} from '@/components/game/avisos';
import type {Expediente} from '@/lib/expediente';
import {EscaleraNiveles,LlaveHoja} from '@/components/game/nivel';
import {progresoDe,puede} from '@/lib/niveles';
import type {Choice} from '@/lib/pulse';
type Profile={votes:number;xp:number;today:number;created:number;dailyAchieved?:boolean};
type Draft=ZanjaDraft;
const blank:Draft={story:'',audience:'public',evidence:null,q:'',tag:'Convivencia',at:'',a:['','',''],bt:'',b:['','',''],mode:'invite',duration:3600000,consent:false};
const initProfile={votes:0,xp:0,today:0,created:0};
const navs=[{id:'home',label:'Inicio',Icon:Home},{id:'arena',label:'Juzgado',Icon:Gavel},{id:'profile',label:'Tú',Icon:UserRound}];
export default function Game(){
 const [view,setView]=useState('home'),[cases,setCases]=useState<Case[]>(seeds),[profile,setProfile]=useState<Profile>(initProfile),[signedIn,setSignedIn]=useState(false),[loading,setLoading]=useState(true),[failed,setFailed]=useState(false),[busy,setBusy]=useState(false);
 const [pulse,setPulse]=useState<PulseState|null>(null),[expediente,setExpediente]=useState<Expediente|null>(null),[campana,setCampana]=useState<Campanario|null>(null),[hojaAvisos,setHojaAvisos]=useState<Campanario|null>(null);
 const [filter,setFilter]=useState('Todas'),[active,setActive]=useState<string|null>(null),[daily,setDaily]=useState('pizza'),[skipped,setSkipped]=useState<string[]>([]),[mineTab,setMineTab]=useState('created');
 const [modal,setModal]=useState<string|null>(null),[step,setStep]=useState(1),[draft,setDraft]=useState<Draft>(blank),[created,setCreated]=useState<{id:string;invite?:string}|null>(null),[report,setReport]=useState(''),[remove,setRemove]=useState<string|null>(null);
 const [sound,setSound]=useState(false),[motion,setMotion]=useState(true),[celebrate,setCelebrate]=useState(false),[invitation,setInvitation]=useState<any>(null),[token,setToken]=useState<string|null>(null),[response,setResponse]=useState({bt:'',b:['','',''] as [string,string,string],consent:false}),[invError,setInvError]=useState('');
 const [evidenceBusy,setEvidenceBusy]=useState(false);
 const [signInName,setSignInName]=useState(''),[displayName,setDisplayName]=useState<string|null>(null),[signingIn,setSigningIn]=useState(false);
 const [afterSignIn,setAfterSignIn]=useState<string|null>(null);
 // Si entras desde el creador o desde una invitación, se vuelve a donde estabas.
 const openSignIn=(back:string|null=null)=>{setAfterSignIn(back);setModal('signin');};
 const stateRevision=useRef(0),returnedCase=useRef<string|null>(null),volverA=useRef('home'),arrancado=useRef(false);
 const audio=useRef<AudioContext|null>(null);
 const mainRef=useRef<HTMLElement|null>(null);
 const scrollTop=()=>mainRef.current?.scrollTo({top:0,behavior:'instant'});
 const loadUser=useCallback(async()=>{try{const res=await fetch('/api/auth',{cache:'no-store'});const data:any=await res.json();setDisplayName(data.user?.name||null);}catch{}},[]);
 const refresh=useCallback(async()=>{const revision=stateRevision.current;try{const res=await fetch('/api/game'+(new URLSearchParams(location.search).get('case')?'?case='+encodeURIComponent(new URLSearchParams(location.search).get('case')!):''),{cache:'no-store'});const data:any=await res.json();if(!res.ok)throw new Error(data.error);if(revision!==stateRevision.current)return true;setCases(data.cases);setProfile(data.profile);setPulse(data.pulse||null);setExpediente(data.expediente||null);setCampana(data.avisos||null);setSignedIn(data.signedIn);setDaily(data.daily);setFailed(false);return true;}catch{setFailed(true);return false;}finally{setLoading(false);}},[]);
 useEffect(()=>{refresh();loadUser();try{const prefs=JSON.parse(localStorage.getItem('zanja-preferences')||'{}');setSound(!!prefs.sound);setMotion(prefs.motion!==false&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches);const saved=localStorage.getItem('zanja-draft');if(saved){const d=JSON.parse(saved);setDraft({...blank,...d,a:draftDefenses(d.a),b:draftDefenses(d.b)});}}catch{}const params=new URLSearchParams(location.search);const inv=params.get('invite');const id=params.get('case');if(inv){setToken(inv);setModal('invite');fetch('/api/game?invite='+encodeURIComponent(inv)).then(async r=>{const d:any=await r.json();if(!r.ok)throw Error(d.error);setInvitation(d.invitation);}).catch(e=>setInvError(e.message));}if(id){setActive(id);setView('arena');}},[refresh]);
 useEffect(()=>{if(loading)return;const id=new URLSearchParams(location.search).get('case');const c=cases.find(c=>c.id===id);if(c?.mine&&c.status==='ready'&&!modal&&returnedCase.current!==id){returnedCase.current=id;resume(c);}},[loading,cases]);
 useEffect(()=>{const id=setInterval(()=>refresh(),45000);return()=>clearInterval(id);},[refresh]);
 // El botón de atrás del teléfono.
 //
 // La aplicación no cambia de página, así que sin esto el botón físico de
 // Android saca de ZANJA en lugar de retroceder. Cada pantalla y cada diálogo
 // dejan su entrada en el historial; cerrar un diálogo deshace la suya en vez
 // de apilar otra, para que atrás no lo vuelva a abrir.
 useEffect(()=>{
  const estado={view,active,modal};
  const previo=(history.state as any)?.zanja;
  try{
   if(!arrancado.current){arrancado.current=true;history.replaceState({zanja:estado},'');return;}
   if(previo&&previo.view===view&&previo.active===active&&previo.modal===modal)return;
   if(previo&&previo.modal&&!modal&&previo.view===view&&previo.active===active){history.back();return;}
   history.pushState({zanja:estado},'');
  }catch{}
 },[view,active,modal]);
 useEffect(()=>{
  const atras=(e:PopStateEvent)=>{
   const guardado=(e.state as any)?.zanja;
   if(!guardado)return;
   setModal(guardado.modal||null);setActive(guardado.active||null);setView(guardado.view||'home');
  };
  addEventListener('popstate',atras);
  return()=>removeEventListener('popstate',atras);
 },[]);

 useEffect(()=>{try{localStorage.setItem('zanja-draft',JSON.stringify(draft));}catch{}},[draft]);
 useEffect(()=>{document.documentElement.dataset.motion=motion?'on':'off';},[motion]);
 useEffect(()=>{const ctx=(document as any).modelContext;if(!ctx?.registerTool)return;const controller=new AbortController();Promise.resolve(ctx.registerTool({name:'navigate_zanja',description:'Open an existing ZANJA section without creating or voting.',inputSchema:{type:'object',properties:{section:{type:'string',enum:['home','arena','pulso','mine','profile']}},required:['section'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async(input:any)=>{if(!['home','arena','pulso','mine','profile'].includes(input.section))throw Error('Invalid section');setView(input.section);setActive(null);return{section:input.section};}},{signal:controller.signal})).catch(()=>{});return()=>controller.abort();},[]);
 // De dónde se ha entrado a una pantalla sin pestaña propia, para que la
 // flecha de arriba devuelva ahí y no siempre al menú.
 function recordar(){if(['home','mine','profile'].includes(view))volverA.current=view;}
 // Se congela la lista al abrirla: si no, marcarla como vista borraría el
 // resaltado de lo nuevo delante de tus ojos.
 async function abrirAvisos(){
  setHojaAvisos(campana);
  setModal('avisos');
  if(!campana?.nuevos)return;
  try{await post({action:'seen'});refresh();}catch{}
 }
 function go(id:string){recordar();setCelebrate(false);setView(id);setActive(null);setSkipped([]);scrollTop();}
 function volver(){go(volverA.current);}
 function prefs(s:boolean,m:boolean){setSound(s);setMotion(m);try{localStorage.setItem('zanja-preferences',JSON.stringify({sound:s,motion:m}));}catch{}}
 function blip(){if(!sound)return;try{audio.current ||= new AudioContext();const ctx=audio.current;ctx.resume();const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(520,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(880,ctx.currentTime+.12);gain.gain.setValueAtTime(.09,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.25);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.25);}catch{}}
 async function post(payload:any){const r=await fetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const d:any=await r.json();if(!r.ok)throw new Error(d.error);return d;}
 const available=cases.filter(c=>c.status==='open'&&!c.choice&&!c.mine&&!c.participant&&!c.reported&&!skipped.includes(c.id)&&(filter==='Todas'||c.tag===filter));
 const current=active?cases.find(c=>c.id===active):available[0];
 const rango=progresoDe(profile.xp),level=rango.nivel;
 const puedeCrear=puede(profile.xp,'crear');
 const recent=cases.filter(c=>c.choice).sort((a,b)=>(b.votedAt||0)-(a.votedAt||0)),own=cases.filter(c=>c.mine);
 const displayed=mineTab==='created'?own:recent;
 const patch=(field:keyof Draft,value:any)=>setDraft(d=>({...d,[field]:value}));
 function openCreate(){if(!puedeCrear){setModal('sinllave');return;}setCreated(null);setStep(1);setModal('create');}
 function resume(c:Case){setDraft({...blank,story:c.story||'',q:c.q,tag:c.tag,a:draftDefenses(c.a),b:draftDefenses(c.b),pendingId:c.id,invite:c.invite,duration:c.duration||3600000,audience:c.audience||'public'});setModal('create');}
 function play(id?:string){recordar();const c=cases.find(c=>c.id===id);if(c?.mine&&['waiting','ready'].includes(c.status)){resume(c);return;}setCelebrate(false);setActive(id||null);setView('arena');scrollTop();}

 async function vote(choice:string){if(!current||busy)return false;if(!signedIn){openSignIn();return false;}const caseId=current.id;stateRevision.current++;setBusy(true);blip();try{const result=await post({action:'vote',id:caseId,choice});setCases(items=>items.map(c=>c.id===caseId?{...c,choice:result.choice,counts:result.counts,total:result.total,votedAt:Date.now()}:c));setProfile(p=>({...p,votes:p.votes+1,xp:p.xp+result.xp,today:p.today+1}));setActive(caseId);scrollTop();setCelebrate(true);return true;}catch(e:any){toast.error(e.message);return false;}finally{setBusy(false);}}

 // Sesión propia: el servidor firma una cookie a partir del nombre. Ver
 // app/api/auth/LEEME.md — es provisional y no sustituye a una cuenta real.
 async function signIn(){const name=signInName.trim();if(!name||signingIn)return;setSigningIn(true);try{
  const res=await fetch('/api/auth',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name})});
  const data:any=await res.json();if(!res.ok)throw new Error(data.error);
  setDisplayName(data.user.name);setSignInName('');setModal(afterSignIn);setAfterSignIn(null);await refresh();blip();toast.success('Dentro, '+data.user.name+'.');
 }catch(e:any){toast.error(e.message);}finally{setSigningIn(false);}}
 async function signOut(){try{await fetch('/api/auth',{method:'DELETE'});setDisplayName(null);setModal(null);await refresh();toast.success('Sesión cerrada.');}catch{toast.error('No hemos podido cerrar la sesión.');}}
 async function resetRound(){if(busy)return;stateRevision.current++;setBusy(true);try{if(signedIn)await post({action:'reset_round'});setSkipped([]);setActive(null);setFilter('Todas');setCelebrate(false);await refresh();toast.success('Ronda reiniciada. Puedes volver a zanjar.');}catch(e:any){toast.error(e.message);}finally{setBusy(false);}}
 function next(){scrollTop();if(current)setSkipped(s=>[...s,current.id]);setActive(null);setCelebrate(false);}
 async function publish(){if(busy||evidenceBusy)return;if(!signedIn){toast.error('Inicia sesión para publicar y guardar tu zanja.');return;}setBusy(true);try{const d=await post({action:'create',...draft});setCreated(d);setDraft(blank);await refresh();blip();setModal('success');}catch(e:any){toast.error(e.message);}finally{setBusy(false);}}
 async function answerPulse(choice:Choice){
  if(busy)return false;
  if(!signedIn){openSignIn();return false;}
  setBusy(true);blip();
  try{
   const r=await post({action:'pulse',choice});
   setPulse(p=>p&&{...p,choice:r.choice,counts:r.counts,total:r.total});
   return true;
  }catch(e:any){toast.error(e.message);return false;}
  finally{setBusy(false);}
 }
 async function share(c:Case|{id:string;invite?:string},isInvite=false){const url=new URL('/',location.origin);url.searchParams.set(isInvite?'invite':'case',isInvite?c.invite!:c.id);try{if(navigator.share&&!isInvite)await navigator.share({title:'ZANJA · ¿Tú a quién das la razón?',url:url.href});else{await navigator.clipboard.writeText(url.href);toast.success(isInvite?'Invitación copiada':'Enlace copiado');}}catch(e:any){if(e.name!=='AbortError')toast.error('No se pudo copiar. Usa el enlace que aparece debajo.');}}
 const defensesReady=validDefenses(draft.a)&&(draft.mode==='invite'||validDefenses(draft.b));
 const canStep=!evidenceBusy&&(step===1?draft.q.trim().length>=12:step===2?defensesReady:draft.consent&&defensesReady);
 function revise(c:Case){setDraft({...blank,q:c.q,tag:c.tag,at:c.at,a:draftDefenses(c.a),bt:c.bt,b:draftDefenses(c.b),mode:c.status==='waiting'?'invite':'solo'});setStep(2);setModal('create');}
 return <div className={'game-shell mobile-app '+(view==='arena'||view==='pulso'?'arena-playing':view==='home'?'home-screen':'')}>
  <Toaster theme="dark" position="top-center" richColors/>
  <header className="topbar"><button className="brand" onClick={()=>go('home')} aria-label="ZANJA, inicio"><span className="brand-bolt"><Zap fill="currentColor"/></span><span>ZANJA<span className="brand-dot">.</span></span><span className="beta-tag">BETA</span></button>{view==='home'&&<button className="dev-reset" onClick={resetRound} disabled={busy} aria-label="Reiniciar mi ronda de pruebas" title="Desarrollo: borra mis votos de prueba y recupera los casos saltados">{busy?<LoaderCircle size={15} className="spin"/>:<RotateCcw size={15}/>}<span>REINICIAR<small>DEV</small></span></button>}
   <div className="header-right"><Campana campana={campana} onOpen={abrirAvisos}/><button className="level-chip" onClick={()=>go('profile')} aria-label={`Tu perfil, nivel ${level}`}><Star fill="currentColor" size={18}/><span>NIV. {level}</span></button><button className="avatar" onClick={()=>go('profile')} aria-label="Mi perfil"><UserRound size={21}/></button></div>
  </header>
  <main className="main-wrap" ref={mainRef}>
   {failed&&<div className="connection-banner" role="alert">No podemos conectar. Puedes explorar los casos; tus acciones necesitan conexión.<button onClick={()=>{setLoading(true);refresh();}}>Reintentar</button></div>}
   {view==='home'&&<div key="home" className="screen-in phone-home sketch-menu"><h1 className="sr-only">Inicio de ZANJA</h1>
    <ExpedienteTarjeta expediente={expediente} onOpen={()=>setModal('expediente')}/>
    <section className="mobile-lobby-hero"><div className="lobby-scene"><img width={768} height={512} fetchPriority="high" decoding="async" src="/arena-menu.webp" alt="Mazo dorado del Juzgado entre los bandos azul y coral"/><div className="scene-tint"/><span className="ribbon">JUZGADO</span><div className="scene-title">DOS BANDOS.<br/><span>TÚ DECIDES.</span></div><span className="scene-vs" aria-hidden="true">A <b>VS</b> B</span></div><div className="play-zone"><button className="game-btn yellow" onClick={()=>{setFilter('Todas');play();}}>¡A ZANJAR!<Gavel size={24}/></button></div></section>
    <PulsoTarjeta pulse={pulse} onOpen={()=>go('pulso')}/>
    <div className="home-shortcuts"><button className="home-shortcut shortcut-mine" onClick={()=>{setMineTab('created');go('mine');}}><img width={480} height={480} loading="eager" decoding="async" className="shortcut-art" src="/my-cases-menu.webp" alt="" aria-hidden="true"/><span className="shortcut-art-shade" aria-hidden="true"/><h2>MIS<br/>ZANJAS</h2><ArrowRight className="shortcut-arrow" size={21}/></button><button className={'home-shortcut shortcut-create'+(puedeCrear?'':' bajo-llave')} onClick={openCreate}><img width={480} height={480} loading="eager" decoding="async" className="shortcut-art" src="/create-case-menu.webp" alt="" aria-hidden="true"/><span className="shortcut-art-shade" aria-hidden="true"/><h2>CREAR<br/>ZANJA</h2>{puedeCrear?<ArrowRight className="shortcut-arrow" size={21}/>:<span className="shortcut-llave"><LockKeyhole size={12}/>NIVEL 2</span>}</button></div>
    
   </div>}
   {view==='pulso'&&<PulsoPantalla pulse={pulse} busy={busy} onAnswer={answerPulse} onBack={volver}/>}
   {view==='arena'&&<Court current={current} cases={cases} filter={filter} loading={loading} busy={busy} celebrate={celebrate} onBack={volver} onVote={vote} onNext={next} onCreate={openCreate} onFilter={cat=>{setFilter(cat);setActive(null);setSkipped([]);scrollTop();}} onReport={()=>{setReport('');setModal('report');}} onShare={share} onRevise={revise}/>}
   {view==='mine'&&<div key="mine" className="screen-in"><div className="page-heading"><div><span className="eyebrow">CADA DISCUSIÓN TIENE SU HISTORIA</span><h1>Mis zanjas</h1><p>Tus casos, tus votos y lo que pasó después.</p></div><button className="game-btn yellow small" onClick={openCreate}><Plus size={19}/>Crear zanja</button></div><Tabs value={mineTab} onValueChange={setMineTab}><TabsList className="mine-tabs"><TabsTrigger value="created">Mis casos <span>{own.length}</span></TabsTrigger><TabsTrigger value="voted">He votado <span>{recent.length}</span></TabsTrigger></TabsList></Tabs>{displayed.length?<div className="case-grid">{displayed.map(c=><FichaCaso key={c.id} c={c} onOpen={()=>play(c.id)} onShare={()=>share(c,true)} onRemove={()=>setRemove(c.id)}/>)}</div>:<section className="empty-state"><span className="empty-icon"><Layers size={44}/></span><h2>{mineTab==='created'?'Tu primera zanja empieza aquí.':'Todavía no has tomado partido.'}</h2><p>{mineTab==='created'?'¿Una discusión que siempre vuelve a la mesa? Dale dos versiones y un jurado.':'Entra en el Juzgado, lee las dos versiones y deja tu voto. Aquí podrás volver al resultado.'}</p><button className="game-btn yellow" onClick={mineTab==='created'?openCreate:()=>play()}>{mineTab==='created'?'CREAR MI PRIMERA ZANJA':'ENTRAR AL JUZGADO'}<ArrowRight size={20}/></button></section>}</div>}
   {view==='profile'&&<div key="profile" className="screen-in profile-view"><div className="page-heading"><div><span className="eyebrow">EL CRITERIO SE ENTRENA</span><h1>Tú</h1><p>Tu nivel, tu escalera y lo que llevas conseguido.</p></div><button className="quiet-btn" onClick={()=>setModal('settings')}><Settings2 size={18}/>Ajustes</button></div><section className="profile-hero panel"><div className="large-medal"><ShieldCheck size={62}/><span>{level}</span></div><div><span className="tag amber">NIVEL {level}</span><h2>{rango.titulo}</h2><p>{rango.falta} XP para {rango.siguiente?rango.siguiente.titulo:'el siguiente nivel'}</p><Progress className="xp-track" value={rango.hecho/(rango.hasta-rango.desde)*100} aria-label="Experiencia"/></div></section><div className="stat-grid"><div className="panel"><Gavel/><strong>{profile.votes}</strong><span>Decisiones tomadas</span></div><div className="panel"><Zap/><strong>{profile.xp}</strong><span>Experiencia total</span></div><div className="panel"><Layers/><strong>{profile.created}</strong><span>Zanjas creadas</span></div></div><div className="section-label"><h2>Lo que abre cada nivel</h2><span>TU ESCALERA</span></div><EscaleraNiveles xp={profile.xp}/><div className="section-label"><h2>Pequeñas grandes victorias</h2><span>TUS LOGROS</span></div><div className="achievement-grid">{[{name:'Primer veredicto',desc:'Emite tu primer voto',ok:profile.votes>=1,Icon:Gavel},{name:'A pleno criterio',desc:'Juzga 50 dilemas',ok:profile.votes>=50,Icon:Trophy},{name:'Abre el debate',desc:'Crea tu primera zanja',ok:profile.created>=1,Icon:Zap},{name:'Expediente sellado',desc:'Completa las tres diligencias de un día',ok:(expediente?.sellos||0)>=1,Icon:Stamp},{name:'Siete días seguidos',desc:'Encadena una racha de una semana',ok:(expediente?.mejorRacha||0)>=7,Icon:Flame}].map(({name,desc,ok,Icon})=><div className={'achievement panel '+(ok?'unlocked':'')} key={name}><span><Icon size={27}/></span><h3>{name}</h3><p>{desc}</p><small>{ok?'CONSEGUIDO':<><LockKeyhole size={12}/>POR DESCUBRIR</>}</small></div>)}</div><div className="principle"><ShieldCheck/><p>Tu nivel premia la participación. <strong>No mide quién tiene razón.</strong></p></div></div>}
  </main>
  <nav className="mobile-nav" aria-label="Navegación móvil">{navs.map(({id,label,Icon})=><button key={id} aria-current={view===id?'page':undefined} className={view===id?'active':''} onClick={()=>go(id)}><Icon size={22}/><span>{label}</span></button>)}</nav>
  <Dialog open={!!modal} onOpenChange={open=>{if(!open&&!busy)setModal(null);}}><DialogContent className={'zanja-dialog '+(['create','invite'].includes(modal||'')?'create-screen creator-shell':'bottom-sheet')} showCloseButton={false}>{!['create','invite'].includes(modal||'')&&<button className="dialog-x icon-btn" aria-label="Cerrar" disabled={busy} onClick={()=>setModal(null)}><X size={21}/></button>}
   {modal==='create'&&<CreateZanja xp={profile.xp} onSignIn={()=>openSignIn('create')} onHome={()=>{setModal(null);go('home');}} onBusy={setBusy} draft={draft} onChange={setDraft} cases={cases} signedIn={signedIn} onRefresh={refresh} onClose={()=>setModal(null)} onCase={id=>{setModal(null);play(id);}} onReset={()=>setDraft(blank)}/>}
   {modal==='success'&&created&&<><span className="success-emblem"><CheckCircle2 size={54}/></span><DialogTitle>{created.invite?'¡Le toca a la otra parte!':'¡Tu zanja está abierta!'}</DialogTitle><DialogDescription>{created.invite?'Comparte la invitación. Su versión se mantendrá independiente de la tuya.':'El jurado ya puede participar. Sigue los votos desde Mis zanjas.'}</DialogDescription><button className="game-btn yellow" onClick={()=>share(created,!!created.invite)}><Copy size={20}/>{created.invite?'COPIAR INVITACIÓN':'COMPARTIR CASO'}</button><p className="notice">Esta beta es privada. El enlace solo funciona para quienes tengan acceso a la aplicación.</p><button className="quiet-btn" onClick={()=>{setModal(null);go('profile');setMineTab('created');}}>Ver mis zanjas<ArrowRight size={17}/></button></>}
   {modal==='expediente'&&<ExpedienteHoja expediente={expediente} onIr={id=>{setModal(null);if(id==='pulso'||(id==='sala'&&!!pulse?.choice))go('pulso');else play();}}/>}
   {modal==='avisos'&&<AvisosHoja campana={hojaAvisos||campana} onIr={a=>{setModal(null);if(a.tipo==='pulso')go('pulso');else if(a.caseId)play(a.caseId);}}/>}
   {modal==='sinllave'&&<LlaveHoja llave="crear" xp={profile.xp} signedIn={signedIn} onIr={()=>{setModal(null);play();}} onEntrar={()=>openSignIn()}/>}
   {modal==='rules'&&<><span className="eyebrow">BUEN CRITERIO. BUEN ROLLO.</span><DialogTitle>Las reglas del juego.</DialogTitle><DialogDescription>Un jurado para desacuerdos cotidianos.</DialogDescription><div className="rules-list"><div><span>01</span><section><h3>Lee las dos versiones</h3><p>No hay prisa. Si falta contexto, puedes saltar el caso.</p></section></div><div><span>02</span><section><h3>Juzga el argumento</h3><p>Lee las tres defensas de cada bando y toca su tarjeta para votar. Elige Ambos si los dos tienen razón. Cada caso admite un voto por persona.</p></section></div><div><span>03</span><section><h3>Respeta a quien piensa distinto</h3><p>Sin nombres, datos personales ni ataques. Denuncia el contenido que incumpla las reglas.</p></section></div><div><span>04</span><section><h3>Una opinión, no una sentencia</h3><p>El resultado cuenta los votos, no demuestra quién tiene razón. No publiques amenazas, violencia ni conflictos sensibles.</p></section></div></div><button className="game-btn yellow" onClick={()=>{setModal(null);play();}}>ENTENDIDO. A JUGAR.<Swords size={20}/></button></>}
   {modal==='settings'&&<><span className="eyebrow">A TU MANERA</span><DialogTitle>Ajusta la partida.</DialogTitle><DialogDescription>Preferencias de este dispositivo.</DialogDescription><label className="setting-row"><span><strong>Sonido</strong><small>Un pequeño efecto al votar y publicar.</small></span><Switch checked={sound} onCheckedChange={v=>prefs(v,motion)} aria-label="Activar sonido"/></label><label className="setting-row"><span><strong>Animaciones</strong><small>Movimiento en tarjetas y celebraciones.</small></span><Switch checked={motion} onCheckedChange={v=>prefs(sound,v)} aria-label="Activar animaciones"/></label><p className="notice">Respetamos la preferencia de movimiento reducido de tu dispositivo.</p>{signedIn?<div className="setting-row session-row"><span><strong>Sesión</strong><small>Estás dentro como {displayName||'jurado'}.</small></span><button className="quiet-btn" onClick={signOut}>Cerrar sesión</button></div>:<div className="setting-row session-row"><span><strong>Sesión</strong><small>Estás explorando sin entrar.</small></span><button className="quiet-btn" onClick={()=>openSignIn()}>Entrar</button></div>}</>}
   {modal==='signin'&&<><span className="success-emblem"><UserRound size={44}/></span><DialogTitle>Tu voto merece contar.</DialogTitle><DialogDescription>Entra con un nombre para votar una sola vez por caso y guardar tu progreso.</DialogDescription><form className="signin-form" onSubmit={e=>{e.preventDefault();signIn();}}><label className="creator-label" htmlFor="signin-name">TU NOMBRE EN LA SALA</label><input id="signin-name" value={signInName} onChange={e=>setSignInName(e.target.value)} maxLength={24} autoComplete="nickname" placeholder="Lucía" autoFocus/><button className="game-btn yellow" type="submit" disabled={signInName.trim().length<2||signingIn}>{signingIn?<LoaderCircle className="spin"/>:<>ENTRAR<ArrowRight size={20}/></>}</button></form><p className="signin-note">Sin contraseña y sin correo. Quien escriba tu mismo nombre entrará como tú, así que es para la beta, no para abrir al público.</p><button className="quiet-btn" onClick={()=>setModal(null)}>Seguir explorando</button></>}
   {modal==='report'&&<><span className="eyebrow">CUIDEMOS EL JUZGADO</span><DialogTitle>¿Qué ocurre con este caso?</DialogTitle><DialogDescription>Dejará de aparecer en tu cola. Con tres denuncias de personas distintas se oculta del Juzgado.</DialogDescription><RadioGroup value={report} onValueChange={setReport} className="report-options">{['Datos personales','Acoso o insultos','Contenido sensible','Relato engañoso','Otro motivo'].map(r=><label key={r}><RadioGroupItem value={r}/>{r}</label>)}</RadioGroup><button className="game-btn yellow" disabled={!report||busy} onClick={async()=>{if(!signedIn){openSignIn();return;}setBusy(true);try{await post({action:'report',id:current?.id,reason:report});await refresh();setModal(null);next();toast.success('Denuncia registrada. Gracias por cuidar el Juzgado.');}catch(e:any){toast.error(e.message);}finally{setBusy(false);}}}>{busy?'ENVIANDO…':'ENVIAR DENUNCIA'}<Flag size={18}/></button></>}
   {modal==='invite'&&<InviteResponse onSignIn={()=>openSignIn('invite')} onHome={()=>{setModal(null);go('home');}} onBusy={setBusy} invitation={invitation} error={invError} token={token||''} signedIn={signedIn} onClose={()=>setModal(null)} onSend={async(b)=>{const result=await post({action:'respond',invite:token,b,consent:true});await refresh();return result.pendingPublication;}}/>}

  </DialogContent></Dialog>
  <AlertDialog open={!!remove} onOpenChange={o=>!o&&setRemove(null)}><AlertDialogContent className="zanja-dialog"><AlertDialogTitle>¿Retirar esta zanja?</AlertDialogTitle><AlertDialogDescription>Dejará de estar disponible en el Juzgado y en tus casos. Esta acción no se puede deshacer.</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Volver</AlertDialogCancel><AlertDialogAction disabled={busy} onClick={async()=>{setBusy(true);try{await post({action:'remove',id:remove});setRemove(null);await refresh();toast.success('Zanja retirada');}catch(e:any){toast.error(e.message);}finally{setBusy(false);}}}>Retirar zanja</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
 </div>;
}
