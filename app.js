(()=>{
  'use strict';

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const shuffle=a=>[...a].sort(()=>Math.random()-.5);
  const fmt=new Intl.NumberFormat('es-ES');
  const escapeHtml=s=>String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  const b64e=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const b64d=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return decodeURIComponent(escape(atob(s)))};
  const encodePayload=obj=>{try{return b64e(JSON.stringify(obj))}catch{return ''}};
  const decodePayload=str=>{try{return JSON.parse(b64d(str))}catch{return null}};
  const todayKey=()=>new Date().toISOString().slice(0,10);
  const yesterdayKey=()=>{const d=new Date();d.setDate(d.getDate()-1);return d.toISOString().slice(0,10)};

  const CASES=[
    {id:'pan',tag:'CONVIVENCIA',q:'¿Comprar pan de molde cuenta como traer “pan”?',a:['Pediste pan, no un tipo concreto.','Sigue siendo pan.','Sirve para la misma comida.'],b:['“Pan” normalmente significa barra.','El de molde es otra cosa.','Sabías cuál compramos siempre.'],counts:{a:713,both:84,b:1189}},
    {id:'late',tag:'AMIGOS',q:'¿Llegar 15 minutos tarde cuenta como llegar tarde si avisas?',a:['Avisé antes de la hora.','Quince minutos no cambian el plan.','Hubo un imprevisto.'],b:['Avisar no elimina el retraso.','Los demás sí llegaron a tiempo.','Quince minutos son quince minutos.'],counts:{a:846,both:163,b:1051}},
    {id:'series',tag:'PAREJA',q:'¿Puedes ver solo una serie que empezasteis juntos?',a:['No prometimos verla siempre juntos.','Llevábamos días sin continuarla.','Puedo volver a ver el capítulo.'],b:['La empezamos como plan compartido.','Esperar era parte del acuerdo.','Te adelantaste sin avisar.'],counts:{a:344,both:91,b:1483}},
    {id:'cola',tag:'COMIDA',q:'¿Pedir Coca-Cola permite que te traigan Pepsi sin avisar?',a:['Son refrescos de cola equivalentes.','El precio suele ser el mismo.','Es una sustitución normal.'],b:['Pedí una marca concreta.','El sabor es distinto.','Deberían haber preguntado.'],counts:{a:397,both:96,b:1739}},
    {id:'fridge',tag:'CONVIVENCIA',q:'¿Se puede comer algo ajeno tras cuatro días en la nevera?',a:['Parecía abandonado.','Se iba a poner malo.','Compartimos comida habitualmente.'],b:['Seguía teniendo dueño.','Podías preguntar primero.','Cuatro días no lo hacen comunitario.'],counts:{a:532,both:122,b:1310}},
    {id:'music',tag:'VIAJES',q:'¿Quien conduce debería elegir siempre la música?',a:['Está haciendo el esfuerzo de conducir.','Necesita ir cómodo y concentrado.','El conductor controla el coche.'],b:['El viaje es de todos.','La música también afecta al resto.','Se puede hacer una playlist conjunta.'],counts:{a:651,both:302,b:990}},
    {id:'ahora',tag:'CONVIVENCIA',q:'¿“Ahora voy” puede significar dentro de 20 minutos?',a:['Es una forma de hablar.','Estaba terminando una cosa.','No di una hora exacta.'],b:['“Ahora” significa pronto.','Veinte minutos no es ahora.','Hace imposible organizarse.'],counts:{a:684,both:189,b:1248}},
    {id:'work',tag:'TRABAJO',q:'¿Está mal mandar un mensaje de trabajo a las 22:30?',a:['No exigía respuesta inmediata.','Podía leerlo al día siguiente.','Solo estaba dejando constancia.'],b:['Invade el tiempo personal.','Genera presión aunque no lo digas.','Podía programarse para mañana.'],counts:{a:721,both:182,b:1201}},
    {id:'cart',tag:'ETIQUETA',q:'¿Hay que devolver el carrito si está lloviendo mucho?',a:['Me estaba empapando.','Había otros carritos sueltos.','El parking estaba casi vacío.'],b:['La lluvia no cambia la norma.','Puede golpear otro coche.','Alguien tendrá que recogerlo.'],counts:{a:311,both:96,b:1692}},
    {id:'charger',tag:'PAREJA',q:'¿Puede tu pareja usar tu cargador sin pedirlo?',a:['Lo compartimos casi todo.','No lo estaba utilizando.','Siempre puede devolvérmelo.'],b:['Sigue siendo mío.','Luego nunca sé dónde está.','Pedirlo tarda dos segundos.'],counts:{a:1042,both:306,b:736}},
    {id:'jacket',tag:'ETIQUETA',q:'¿Reservar una mesa con una chaqueta es válido?',a:['La mesa estaba libre.','Solo fui a pedir a la barra.','Es una costumbre habitual.'],b:['Una chaqueta no es una persona.','Había gente esperando.','No puedes bloquearla indefinidamente.'],counts:{a:512,both:128,b:1395}},
    {id:'movie',tag:'PAREJA',q:'¿Dormirse durante una película elegida por ti está mal?',a:['Estaba cansadísimo.','No fue intencionado.','Podemos terminarla otro día.'],b:['Tú insististe en verla.','Era un plan de los dos.','Ni siquiera avisaste de que tenías sueño.'],counts:{a:861,both:228,b:1017}},
    {id:'birthday',tag:'AMIGOS',q:'¿Hay que felicitar el cumpleaños a alguien con quien ya casi no hablas?',a:['Es un gesto amable y barato.','La fecha sigue importando.','Puede reabrir el contacto.'],b:['Sería una cortesía automática.','Ya no tenemos relación.','No felicitar no significa enfado.'],counts:{a:892,both:301,b:877}},
    {id:'spoilers',tag:'AMIGOS',q:'¿Dos semanas son suficientes para poder hablar de spoilers?',a:['Ha pasado tiempo de sobra.','No se puede esperar eternamente.','La conversación era sobre la serie.'],b:['Sigue siendo fácil avisar antes.','No todos pueden verla al estreno.','El spoiler arruina algo irreversible.'],counts:{a:742,both:127,b:1240}},
    {id:'nowork',tag:'TRABAJO',q:'¿Se puede ignorar un mensaje laboral enviado en domingo?',a:['No estoy de guardia.','El domingo es tiempo personal.','Puede esperar al lunes.'],b:['Era una pregunta de diez segundos.','El proyecto era urgente.','Responder evita problemas mañana.'],counts:{a:1617,both:91,b:402}},
    {id:'seat',tag:'ETIQUETA',q:'¿Puedes guardar un asiento durante 20 minutos para un amigo?',a:['Ya viene de camino.','Llegamos juntos al plan.','No hay mucha gente aún.'],b:['El asiento está vacío.','Otros ya están allí.','Veinte minutos es demasiado.'],counts:{a:724,both:117,b:1194}},
    {id:'leftovers',tag:'COMIDA',q:'¿Está mal llevarte las sobras de una cena a la que te han invitado?',a:['Iban a tirarlas.','Me dijeron que cogiera lo que quisiera.','Evita desperdiciar comida.'],b:['La invitación era a cenar allí.','No preguntaste por las sobras.','Pareció que estabas haciendo acopio.'],counts:{a:1137,both:264,b:646}},
    {id:'voice',tag:'AMIGOS',q:'¿Un audio de 6 minutos debería resumirse en texto?',a:['Era más rápido contarlo hablando.','Puedes escucharlo cuando quieras.','Necesitaba explicar contexto.'],b:['Seis minutos es demasiado.','No siempre puedo escuchar audios.','Se podía resumir en cuatro líneas.'],counts:{a:533,both:123,b:1429}},
    {id:'phone',tag:'PAREJA',q:'¿Mirar el móvil durante una cena juntos es una falta de respeto?',a:['Solo contesté algo urgente.','Fueron menos de dos minutos.','No ignoré la conversación.'],b:['Era nuestro rato juntos.','Podías esperar.','Rompe completamente la atención.'],counts:{a:422,both:152,b:1543}},
    {id:'queue',tag:'ETIQUETA',q:'¿Puedes colarte con un amigo que ya está haciendo cola?',a:['Vamos juntos.','Solo se añade una persona.','Él guardó sitio por los dos.'],b:['El resto lleva esperando.','Tu amigo no puede reservarte turno.','Si llegas tarde, vas al final.'],counts:{a:287,both:68,b:1756}}
  ];

  const ACHIEVEMENTS=[
    {id:'first',icon:'✦',name:'PRIMER CORTE',desc:'Emite tu primer voto.',test:s=>s.judged>=1},
    {id:'jury50',icon:'50',name:'JURADO 50',desc:'Juzga 50 casos.',test:s=>s.judged>=50},
    {id:'jury500',icon:'500',name:'JURADO 500',desc:'Juzga 500 casos.',test:s=>s.judged>=500},
    {id:'guard',icon:'🔥',name:'DE GUARDIA',desc:'Mantén una racha de 7 días.',test:s=>s.streak>=7},
    {id:'long',icon:'30',name:'INCOMBUSTIBLE',desc:'Mantén una racha de 30 días.',test:s=>s.streak>=30},
    {id:'dissident',icon:'↯',name:'DISIDENTE',desc:'Tras 40 votos, coincide con la mayoría menos del 40%.',test:s=>s.judged>=40&&ratio(s.majorityMatches,s.judged)<.4},
    {id:'majority',icon:'≈',name:'VOZ DE LA MAYORÍA',desc:'Tras 40 votos, coincide con la mayoría más del 75%.',test:s=>s.judged>=40&&ratio(s.majorityMatches,s.judged)>.75},
    {id:'balance',icon:'=',name:'EQUILIBRISTA',desc:'Elige AMBOS en al menos el 25% de tus votos.',test:s=>s.judged>=30&&ratio(s.choiceCounts.both,s.judged)>=.25},
    {id:'sharp',icon:'!',name:'TAJANTE',desc:'Tras 30 votos, usa AMBOS menos del 5%.',test:s=>s.judged>=30&&ratio(s.choiceCounts.both,s.judged)<.05},
    {id:'weekly',icon:'W',name:'VOZ SEMANAL',desc:'Participa en un debate semanal.',test:s=>s.weeklyPlayed>=1},
    {id:'agenda',icon:'★',name:'AGENDA PROPIA',desc:'Propón un tema para el debate semanal.',test:s=>s.proposalsMade>=1},
    {id:'creator',icon:'+',name:'ZANJADOR',desc:'Publica tu primer caso.',test:s=>s.created>=1},
    {id:'jury100',icon:'100',name:'EL JURADO HA HABLADO',desc:'Crea un caso que alcance 100 votos.',test:s=>s.createdVotePeak>=100},
    {id:'close',icon:'%',name:'SE HA LIADO',desc:'Participa en un caso cerrado por menos de 3 puntos.',test:s=>s.closeCalls>=1},
    {id:'guardian',icon:'⚖',name:'GUARDIÁN',desc:'Llega al nivel 5 y entra en verificación.',test:s=>levelOf(s.xp)>=5},
    {id:'firm',icon:'10',name:'MANO FIRME',desc:'Emite 10 verificaciones.',test:s=>s.verifiedCount>=10}
  ];

  const DEFAULT_STATE={
    onboarded:false,sound:true,haptics:true,xp:0,streak:0,lastActiveDate:null,daily:{date:todayKey(),arenaVotes:0,done:false},
    judged:0,majorityMatches:0,choiceCounts:{a:0,both:0,b:0},votes:{},customCases:[],created:0,createdVotePeak:0,closeCalls:0,
    weekly:null,weeklyHistory:[],weeklyPlayed:0,proposalsMade:0,
    reported:{},verifyQueue:[],verifiedCount:0,coachDone:false,invites:{},
    unlocked:[],activities:[],unread:3,displayName:null
  };
  const STORAGE='zanja-beta-07';
  let state=loadState();

  let currentMode=null,currentCase=null,currentQueue=[],currentIndex=0,transitionBusy=false;
  let createStep=0,createPublished=false;
  let draft=freshDraft();
  let countdownTimer=null,countdownInterval=null;

  const screens={
    onboarding:$('#onboardingScreen'),home:$('#homeScreen'),play:$('#playScreen'),create:$('#createScreen'),weekly:$('#weeklyScreen'),mine:$('#myCasesScreen'),verify:$('#verifyScreen'),activity:$('#activityScreen'),profile:$('#profileScreen'),achievements:$('#achievementsScreen')
  };
  const els={bottom:$('#bottomNav'),playStage:$('#playStage'),playMode:$('#playModeLabel'),playProgress:$('#playProgress'),wash:$('#ambientWash'),toast:$('#toast'),share:$('#shareSheet'),report:$('#reportSheet'),photo:$('#photoDialog')};

  function loadState(){
    try{
      const raw=JSON.parse(localStorage.getItem(STORAGE)||'{}');
      const s={...DEFAULT_STATE,...raw};
      s.choiceCounts={...DEFAULT_STATE.choiceCounts,...(raw.choiceCounts||{})};
      s.daily={...DEFAULT_STATE.daily,...(raw.daily||{})};
      if(s.daily.date!==todayKey())s.daily={date:todayKey(),arenaVotes:0,done:false};
      return s;
    }catch{return structuredClone(DEFAULT_STATE)}
  }
  let quotaWarned=false;
  function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state));quotaWarned=false}catch{if(!quotaWarned){quotaWarned=true;toast('SIN ESPACIO LOCAL · BORRA ALGUNA PRUEBA')}}}
  function freshDraft(){return {story:'',question:'',tag:'TU ZANJA',photo:null,photoPromised:false,a:['','',''],b:['','',''],bReady:false,inviteMode:false,audience:'public',duration:'1 h'};}
  function ratio(a,b){return b? a/b:0}
  function levelOf(xp){return Math.floor(xp/150)+1}
  function getLevel(){return levelOf(state.xp)}
  function levelProgress(){return (state.xp%150)/150}
  function allCases(){return [...state.customCases,...CASES]}
  function getWinner(counts){return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0]}
  function percentage(counts){const t=counts.a+counts.b+counts.both;if(!t)return{a:0,both:0,b:0,total:0};const a=Math.round(counts.a/t*100),both=Math.round(counts.both/t*100);return {a,both,b:100-a-both,total:t}}
  function dailyCase(){const idx=Math.floor(new Date().setHours(0,0,0,0)/86400000)%CASES.length;return CASES[idx]}

  const XP={arena:5,daily:15,created:40,weekly:25,proposal:15,verify:10};
  const VERIFY_LEVEL=5,VERIFY_QUORUM=5,REPORT_HIDE_AT=3;
  const DURATION_MS={'15 min':9e5,'1 h':36e5,'24 h':864e5};
  const REPORT_REASONS=['Ataque personal o acoso','Datos privados de alguien','Contenido sexual o violento','Spam o publicidad','Otro motivo'];
  const SINGLE_CASE_MODES=['daily','weekly','shared'];

  // A published case has no real jury behind it in this beta, so its vote count is
  // derived from how far it is through its own open window.
  function caseProgress(c){if(!c.closesAt||!c.createdAt)return 1;const span=Math.max(1,c.closesAt-c.createdAt);return Math.sqrt(clamp((Date.now()-c.createdAt)/span,0,1))}
  function caseVotes(c){
    if(!c||!c.mix)return {...(c&&c.counts||{a:0,both:0,b:0})};
    const t=Math.round((c.reach||120)*caseProgress(c));
    const a=Math.round(t*c.mix.a),both=Math.round(t*c.mix.both);
    return {a,both,b:Math.max(0,t-a-both)};
  }
  function caseState(c){if(c.removed)return 'removed';if(c.closesAt&&Date.now()>=c.closesAt)return 'closed';return 'open'}
  function newMix(){const a=.22+Math.random()*.42,both=.05+Math.random()*.16;return {a,both,b:Math.max(.05,1-a-both)}}
  function reportFor(id){return state.verifyQueue.find(v=>v.caseId===id)}
  function isUnderReview(c){const r=reportFor(c.id);return !!(r&&!r.resolved)}
  function isHidden(c){const r=reportFor(c.id);return !!(c.removed||(r&&!r.resolved&&r.reportCount>=REPORT_HIDE_AT))}
  function arenaPool(){return allCases().filter(c=>!isHidden(c)&&!state.reported[c.id]&&caseState(c)==='open')}
  function timeLeft(ms){
    if(ms<=0)return 'CERRADO';
    const m=Math.floor(ms/60000),h=Math.floor(m/60),d=Math.floor(h/24);
    if(d>=1)return `${d} D ${h%24} H`;
    if(h>=1)return `${h} H ${m%60} MIN`;
    return `${Math.max(1,m)} MIN`;
  }

  class AudioEngine{
    constructor(){this.ctx=null;this.master=null}
    unlock(){if(!state.sound)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!this.ctx){this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=.18;this.master.connect(this.ctx.destination)}if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{})}
    tone(f=.05,d=.06,{type='sine',gain=.08,end=null,delay=0,pan=0}={}){if(!state.sound)return;this.unlock();if(!this.ctx)return;const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain(),p=this.ctx.createStereoPanner?this.ctx.createStereoPanner():null;o.type=type;o.frequency.setValueAtTime(f,t);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);if(p){p.pan.value=pan;g.connect(p);p.connect(this.master)}else g.connect(this.master);o.start(t);o.stop(t+d+.02)}
    noise(d=.06,gain=.03,delay=0){if(!state.sound)return;this.unlock();if(!this.ctx)return;const len=Math.floor(this.ctx.sampleRate*d),b=this.ctx.createBuffer(1,len,this.ctx.sampleRate),data=b.getChannelData(0);for(let i=0;i<len;i++)data[i]=(Math.random()*2-1)*(1-i/len);const s=this.ctx.createBufferSource(),g=this.ctx.createGain();s.buffer=b;g.gain.value=gain;s.connect(g);g.connect(this.master);s.start(this.ctx.currentTime+delay)}
    play(name,choice){switch(name){case'tap':this.tone(250,.035,{type:'square',gain:.05,end:210});break;case'open':this.tone(320,.07,{type:'triangle',gain:.07,end:460});break;case'pickup':this.tone(180,.08,{type:'triangle',gain:.085,end:290});break;case'a':this.tone(660,.045,{gain:.055,end:730,pan:-.25});break;case'b':this.tone(390,.05,{type:'triangle',gain:.06,end:340,pan:.25});break;case'both':this.tone(510,.05,{gain:.055});this.tone(690,.045,{gain:.025,delay:.012});break;case'vote':this.tone(130,.1,{type:'triangle',gain:.1,end:95});this.noise(.05,.025,.01);this.tone(choice==='a'?600:choice==='b'?360:490,.08,{type:'square',gain:.05,delay:.02});break;case'reveal':[430,550,690].forEach((f,i)=>this.tone(f,.07,{gain:.045,delay:i*.055}));break;case'correct':this.tone(520,.07,{gain:.06,end:650});this.tone(760,.1,{gain:.06,delay:.06,end:850});break;case'wrong':this.tone(360,.1,{type:'triangle',gain:.06,end:260});break;case'whoosh':this.noise(.1,.025);this.tone(240,.08,{gain:.02,end:390});break;case'complete':[330,440,554,660].forEach((f,i)=>this.tone(f,.12,{type:'triangle',gain:.06,delay:i*.075}));break;case'zanjar':this.tone(180,.14,{type:'triangle',gain:.085,end:120});this.noise(.07,.03,.03);this.tone(600,.1,{type:'square',gain:.045,delay:.07,end:680});break;case'unlock':this.tone(560,.08,{gain:.05});this.tone(840,.14,{gain:.06,delay:.06});break}}
  }
  const audio=new AudioEngine();
  function haptic(p=8){if(state.haptics&&navigator.vibrate)navigator.vibrate(p)}
  function sound(name,choice){audio.play(name,choice)}
  function setWash(choice,intensity=.14){const rgb=choice==='a'?'39,201,232':choice==='b'?'255,98,93':'255,213,74';els.wash.style.background=`rgba(${rgb},${intensity})`}
  function clearWash(){els.wash.style.background='rgba(116,86,255,0)'}

  function showScreen(name,{nav=name}={}){
    Object.values(screens).forEach(s=>s.classList.remove('is-active'));
    screens[name].classList.add('is-active');
    const main=['home','activity','profile'].includes(name);
    els.bottom.classList.toggle('is-visible',main);
    $$('#bottomNav button').forEach(b=>b.classList.toggle('is-active',b.dataset.nav===nav));
    if(name==='home')updateHome();if(name==='activity')renderActivity();if(name==='profile')renderProfile();if(name==='achievements')renderAchievements();if(name==='mine')renderMyCases();if(name==='verify')renderVerify();if(name==='weekly')renderWeekly();
  }
  function toast(msg){els.toast.textContent=msg;els.toast.classList.add('is-visible');clearTimeout(toast.t);toast.t=setTimeout(()=>els.toast.classList.remove('is-visible'),1800)}
  function clearCountdown(){if(countdownTimer)clearTimeout(countdownTimer);if(countdownInterval)clearInterval(countdownInterval);countdownTimer=countdownInterval=null}

  function updateHome(){
    const lvl=getLevel();
    $('#homeStreak').textContent=state.streak;$('#homeLevel').textContent=lvl;
    $('#homeXpFill').style.width=`${Math.round(levelProgress()*100)}%`;$('#homeXpText').textContent=`${state.xp%150} / 150 XP`;
    $('#createHomeStatus').textContent=state.created?`${state.created} caso${state.created===1?'':'s'} creado${state.created===1?'':'s'}`:'Crea tu primer caso';
    $('#arenaOpenCount').textContent=arenaPool().filter(c=>!state.votes[c.id]).length;
    $('#homeSectionLevel').textContent=lvl;

    const openMine=state.customCases.filter(c=>caseState(c)==='open').length;
    $('#mineCount').textContent=state.created?(openMine?`${openMine} abierta${openMine===1?'':'s'}`:'Todas zanjadas'):'Aún ninguna';

    const lockedVerify=lvl<VERIFY_LEVEL,pending=state.verifyQueue.filter(v=>!v.resolved).length;
    $('#verifyTile').classList.toggle('is-locked',lockedVerify);
    $('#verifyCount').textContent=lockedVerify?`NIVEL ${VERIFY_LEVEL} PARA ENTRAR`:(pending?`${pending} pendiente${pending===1?'':'s'}`:'Nada pendiente');

    const w=weeklySummary();
    $('#weeklyPhase').textContent=w.badge;$('#weeklyTitle').textContent=w.title;$('#weeklyMeta').textContent=w.meta;$('#weeklyCta').textContent=w.cta;

    const d=dailyCase();$('#dailyQuestion').textContent=d.q;$('#dailyJuryCount').textContent=fmt.format(d.counts.a+d.counts.b+d.counts.both);
    const now=new Date(),end=new Date(now);end.setHours(24,0,0,0);const ms=end-now,h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000);$('#dailyCountdown').textContent=`CIERRA EN ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;

    // Once the daily mission is done it stops taking space at the top.
    const daily=state.daily,goal=$('#dailyGoal');
    goal.hidden=daily.done;
    if(!daily.done){let txt='Haz una actividad',pct=0;if(daily.arenaVotes>0){txt=`Arena ${daily.arenaVotes}/5 votos`;pct=daily.arenaVotes/5*100}$('#dailyGoalText').textContent=txt;$('#dailyGoalFill').style.width=`${pct}%`}

    for(const b of [$('#activityBadge'),$('#homeUnread')]){b.textContent=state.unread;b.style.display=state.unread?'grid':'none'}
  }

  function addActivity(type,title,detail){state.activities.unshift({id:Date.now()+Math.random(),type,title,detail,at:Date.now()});state.activities=state.activities.slice(0,20);state.unread=Math.min(9,state.unread+1);save()}
  function markDaily(kind){
    if(state.daily.date!==todayKey())state.daily={date:todayKey(),arenaVotes:0,done:false};
    if(kind==='arena')state.daily.arenaVotes=Math.min(5,state.daily.arenaVotes+1);
    const qualifies=['weekly','created','daily','verify'].includes(kind)||state.daily.arenaVotes>=5;
    if(qualifies&&!state.daily.done){state.daily.done=true;const y=yesterdayKey();state.streak=state.lastActiveDate===y?state.streak+1:Math.max(1,state.streak);state.lastActiveDate=todayKey();addActivity('streak','Racha protegida',`🔥 ${state.streak} días seguidos en ZANJA`)}
    save();updateHome();
  }
  function addXp(n){state.xp+=n;save()}
  function checkAchievements(){
    const before=new Set(state.unlocked);for(const a of ACHIEVEMENTS){if(!before.has(a.id)&&a.test(state)){state.unlocked.push(a.id);addActivity('achievement',`Logro: ${a.name}`,a.desc);setTimeout(()=>{sound('unlock');toast(`LOGRO DESBLOQUEADO · ${a.name}`)},150)}}save();
  }

  function openMode(mode){
    sound('open');haptic(8);clearCountdown();clearWash();
    if(mode==='arena')startArena();else if(mode==='weekly')openWeekly();else if(mode==='mine')showScreen('mine',{nav:'home'});else if(mode==='verify')showScreen('verify',{nav:'home'});else if(mode==='create')openCreate();
  }

  /* ---------------- PANTALLA DE VOTO ---------------- */
  // A la izquierda, B a la derecha, AMBOS arriba: el gesto coincide con dónde está
  // dibujado cada bando, que es lo que hacía incomprensible arrastrar un puck central.
  const SWIPE_X=44,SWIPE_Y=52;

  function renderPlayMeta(){
    if(currentMode!=='arena'){els.playProgress.innerHTML='';return}
    const total=currentQueue.length,left=Math.max(0,total-currentIndex);
    const pct=total?Math.round(currentIndex/total*100):0;
    els.playProgress.innerHTML=`<span class="play-bar"><i style="width:${pct}%"></i></span><b>${left} sin juzgar</b>`;
  }

  function sideMarkup(side,args){
    const label=side==='a'?'BANDO A':'BANDO B';
    return `<section class="side side--${side}">
      <span class="side__crest">${side.toUpperCase()}</span>
      <span class="side__label">${label}</span>
      <ul class="side__args">${args.slice(0,3).filter(Boolean).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>
    </section>`;
  }

  function caseCardMarkup(c,locked){
    return `<div class="case-card${locked?' is-locked':''}" id="caseCard"${locked?' data-locked="1"':''}>
      ${sideMarkup('a',c.a)}
      <span class="case-card__seam" aria-hidden="true"></span>
      <span class="case-card__vs" aria-hidden="true">VS</span>
      ${sideMarkup('b',c.b)}
      <span class="stamp stamp--a" id="stampA" aria-hidden="true">A</span>
      <span class="stamp stamp--b" id="stampB" aria-hidden="true">B</span>
      <span class="stamp stamp--both" id="stampBoth" aria-hidden="true">AMBOS</span>
      ${state.coachDone||locked?'':`<div class="coach" id="coach">
        <div class="coach__inner">
          <span class="coach__hand" aria-hidden="true"></span>
          <b>ARRASTRA LA CARTA</b>
          <span>Izquierda si das la razón a <i>A</i>, derecha si se la das a <i>B</i>, arriba si la tienen <i>los dos</i>.</span>
          <button class="coach__ok" id="coachOk" type="button">ENTENDIDO</button>
        </div>
      </div>`}
    </div>`;
  }

  function voteDockMarkup(prompt){
    return `<div class="vote-dock">
      <div class="vote-dock__prompt">${prompt}</div>
      <div class="swipe-legend"><span>← DAS LA RAZÓN A <b>A</b></span><span><b>AMBOS</b> ↑</span><span><b>B</b> →</span></div>
      <div class="vote-buttons">
        <button class="vote-button vote-button--a" data-vote="a" type="button"><span>A</span></button>
        <button class="vote-button vote-button--both" data-vote="both" type="button"><span>AMBOS</span></button>
        <button class="vote-button vote-button--b" data-vote="b" type="button"><span>B</span></button>
      </div>
    </div>`;
  }

  function renderArenaCase(c,tutorial=false,daily=false){
    clearCountdown();currentCase=c;transitionBusy=false;clearWash();
    const existing=state.votes[c.id],readonly=currentMode==='own';
    renderPlayMeta();
    els.playStage.innerHTML=`<article class="case-shell">
      <header class="case-question">${caseMetaMarkup(c,daily)}<h2>${escapeHtml(c.q)}</h2></header>
      ${caseCardMarkup(c,!!existing||readonly)}
      <section class="vote-zone" id="voteZone">${existing||readonly?resultMarkup(c,existing&&existing.choice):voteDockMarkup(tutorial?'TU PRIMERA DECISIÓN':'¿A QUIÉN DAS LA RAZÓN?')}</section>
    </article>`;
    bindCaseMeta(c);
    if(existing||readonly)bindResultNext();
    else{
      bindVoteButtons(choice=>commitArenaVote(choice));
      bindSwipe(choice=>commitArenaVote(choice));
      const ok=$('#coachOk');if(ok)ok.onclick=dismissCoach;
    }
  }

  function dismissCoach(){
    state.coachDone=true;save();
    const el=$('#coach');if(el)el.remove();
  }

  function bindSwipe(cb){
    const card=$('#caseCard');if(!card)return;
    const stamps={a:$('#stampA'),b:$('#stampB'),both:$('#stampBoth')};
    let pid=null,sx=0,sy=0,target=null,last=null;
    const pick=(dx,dy)=>{
      if(dy<-SWIPE_Y&&Math.abs(dy)>Math.abs(dx))return 'both';
      if(dx<-SWIPE_X&&Math.abs(dx)>Math.abs(dy))return 'a';
      if(dx>SWIPE_X&&Math.abs(dx)>Math.abs(dy))return 'b';
      return null;
    };
    const paint=(dx,dy)=>{
      card.style.setProperty('--dx',`${clamp(dx*.2,-18,18)}px`);
      card.style.setProperty('--dy',`${clamp(dy*.2,-20,10)}px`);
      card.style.setProperty('--rot',`${clamp(dx/34,-3.5,3.5)}deg`);
      stamps.a.style.opacity=clamp(-dx/SWIPE_X,0,1);
      stamps.b.style.opacity=clamp(dx/SWIPE_X,0,1);
      stamps.both.style.opacity=clamp(-dy/SWIPE_Y,0,1);
    };
    const reset=()=>{
      card.classList.add('is-settling');
      paint(0,0);
      card.classList.remove('is-a','is-b','is-both');
      setTimeout(()=>card.classList.remove('is-settling'),220);
      clearWash();
    };
    card.onpointerdown=e=>{
      if(card.dataset.locked)return;
      if($('#coach'))dismissCoach();
      audio.unlock();pid=e.pointerId;sx=e.clientX;sy=e.clientY;target=last=null;
      try{card.setPointerCapture(pid)}catch{}
      card.classList.add('is-dragging');sound('pickup');haptic(8);e.preventDefault();
    };
    card.onpointermove=e=>{
      if(e.pointerId!==pid)return;
      const dx=e.clientX-sx,dy=e.clientY-sy;
      paint(dx,dy);
      target=pick(dx,dy);
      card.classList.toggle('is-a',target==='a');
      card.classList.toggle('is-b',target==='b');
      card.classList.toggle('is-both',target==='both');
      if(target)setWash(target,clamp(Math.max(Math.abs(dx)/SWIPE_X,Math.abs(dy)/SWIPE_Y)*.18,0,.2));
      else clearWash();
      if(target!==last){if(target){sound(target);haptic(11)}last=target}
    };
    const finish=e=>{
      if(e.pointerId!==pid)return;
      try{card.releasePointerCapture(pid)}catch{}
      pid=null;card.classList.remove('is-dragging');
      const t=target;target=null;
      if(!t){reset();return}
      card.dataset.locked='1';
      card.classList.add('is-flying');
      card.style.setProperty('--dx',`${t==='a'?-520:t==='b'?520:0}px`);
      card.style.setProperty('--dy',`${t==='both'?-560:0}px`);
      card.style.setProperty('--rot',`${t==='a'?-14:t==='b'?14:0}deg`);
      setTimeout(()=>cb(t),150);
    };
    card.onpointerup=finish;card.onpointercancel=finish;
  }

  function resultMarkup(c,choice){
    const counts=caseVotes(c);
    if(choice)counts[choice]=(counts[choice]||0)+1;
    const p=percentage(counts),winner=getWinner(counts);
    const sorted=Object.entries(counts).sort((x,y)=>y[1]-x[1]);
    const tight=p.total&&(sorted[0][1]-sorted[1][1])/p.total<.04;
    let title=!choice?'CÓMO VA AHORA':tight?'PARTIDO EN DOS':choice===winner?'ESTÁS CON LA MAYORÍA':'EL JURADO VA POR OTRO LADO';
    const own=currentMode==='own';
    const label=own?'VOLVER A MIS ZANJAS':SINGLE_CASE_MODES.includes(currentMode)?'VOLVER AL INICIO':'SIGUIENTE CASO';
    return `<div class="scoreboard">
      <div class="scoreboard__head"><strong>${title}</strong><span>${p.total?`${fmt.format(p.total)} votos`:'sin votos todavía'}</span></div>
      <div class="result-bars">
        ${resultBar('A',p.a,'var(--cyan)',choice==='a')}
        ${resultBar('AMBOS',p.both,'var(--signal)',choice==='both')}
        ${resultBar('B',p.b,'var(--coral)',choice==='b')}
      </div>
      ${own?`<button class="result-next" id="resultNext" type="button" data-label="${label}"><b id="resultCountdown">${label}</b></button>`
        :`<button class="result-next result-next--arena" id="resultNext" type="button" data-label="${label}"><b id="resultCountdown">${label} · 5s</b><span class="countdown-track"><i></i></span></button>`}
    </div>`;
  }

  function commitArenaVote(choice){
    if(!currentCase||transitionBusy||state.votes[currentCase.id])return;
    const counts=caseVotes(currentCase);counts[choice]++;
    const winner=getWinner(counts);
    state.votes[currentCase.id]={choice,at:Date.now()};
    state.judged++;state.choiceCounts[choice]++;
    if(choice===winner)state.majorityMatches++;
    const spread=Object.values(counts).sort((x,y)=>y-x),tally=spread.reduce((s,n)=>s+n,0);
    if(tally&&(spread[0]-spread[1])/tally<.03)state.closeCalls++;
    const kind=currentMode==='daily'?'daily':currentMode==='weekly'?'weekly':'arena';
    addXp(XP[kind]||XP.arena);
    if(kind==='weekly'){state.weeklyPlayed++;const w=ensureWeekly();w.debateVote=choice}
    markDaily(kind);save();checkAchievements();
    sound('vote',choice);haptic([12,15,20]);setWash(choice,.18);
    const z=$('#voteZone');z.innerHTML=resultMarkup(currentCase,choice);
    const card=$('#caseCard');if(card){card.dataset.locked='1';card.classList.add('is-locked')}
    setTimeout(()=>{sound('reveal');setWash(choice,.06)},150);
    bindResultNext();
  }

  function bindResultNext(){
    const btn=$('#resultNext');if(!btn)return;clearCountdown();
    const label=btn.dataset.label||'SIGUIENTE';
    const go=()=>{clearCountdown();advanceArena()};
    btn.addEventListener('click',go);
    if(currentMode==='own')return;            // el autor decide cuándo salir
    let r=5;const out=$('#resultCountdown');
    countdownInterval=setInterval(()=>{r=Math.max(0,r-1);if(out)out.textContent=`${label} · ${r}s`},1000);
    countdownTimer=setTimeout(go,5000);
  }

  function arenaExhaustedMarkup(){
    return `<section class="done-card">
      <div class="done-card__mark">✓</div>
      <span class="eyebrow">ARENA AL DÍA</span>
      <h2>YA LOS HAS<br>JUZGADO TODOS.</h2>
      <p>No quedan casos abiertos que no hayas votado. Vuelve cuando la comunidad publique más, o mueve tú la siguiente ficha.</p>
      <button class="action action--primary action--xl" id="doneCreate" type="button">PUBLICAR UN CASO →</button>
      <button class="action action--secondary action--lg" id="doneWeekly" type="button">IR AL DEBATE SEMANAL</button>
      <button class="link-action" id="doneHome" type="button">VOLVER AL INICIO</button>
    </section>`;
  }
  function showArenaExhausted(){
    clearCountdown();currentMode=null;els.playProgress.innerHTML='';
    els.playStage.innerHTML=arenaExhaustedMarkup();
    $('#doneCreate').onclick=openCreate;
    $('#doneWeekly').onclick=openWeekly;
    $('#doneHome').onclick=()=>showScreen('home');
  }

  function advanceArena(){
    clearCountdown();
    if(transitionBusy)return;transitionBusy=true;
    $('.case-shell',els.playStage)?.classList.add('is-leaving');
    sound('whoosh');haptic(6);
    setTimeout(()=>{
      clearWash();
      if(currentMode==='own'){showScreen('mine',{nav:'home'});return}
      if(SINGLE_CASE_MODES.includes(currentMode)){showScreen('home');return}
      if(currentMode==='tutorial'){state.onboarded=true;save();showScreen('home');toast('YA SABES USAR ZANJA');return}
      currentIndex++;
      // Nunca reciclar: un caso ya votado sólo mostraría su resultado y la cuenta atrás.
      while(currentIndex<currentQueue.length&&state.votes[currentQueue[currentIndex].id])currentIndex++;
      if(currentIndex>=currentQueue.length){showArenaExhausted();return}
      renderArenaCase(currentQueue[currentIndex]);
    },330);
  }

  function startArena(tutorial=false){
    currentMode=tutorial?'tutorial':'arena';
    currentQueue=shuffle(arenaPool().filter(c=>!state.votes[c.id]));
    currentIndex=0;
    els.playMode.textContent=tutorial?'PRIMER ZANJA':'ARENA LIVE';
    showScreen('play',{nav:'home'});
    if(!currentQueue.length){showArenaExhausted();return}
    renderArenaCase(currentQueue[0],tutorial);
  }

  function openOwnCase(id){
    const c=state.customCases.find(x=>x.id===id);if(!c)return;
    sound('open');haptic(8);clearCountdown();clearWash();
    currentMode='own';currentQueue=[c];currentIndex=0;
    els.playMode.textContent=caseState(c)==='closed'?'TU ZANJA · ZANJADA':'TU ZANJA · EN DIRECTO';
    showScreen('play',{nav:'home'});
    renderArenaCase(c);
  }
  function startDaily(){currentMode='daily';currentQueue=[dailyCase()];currentIndex=0;els.playMode.textContent='CASO DEL DÍA';showScreen('play',{nav:'home'});renderArenaCase(currentQueue[0],false,true)}
  function resultBar(label,pct,color,selected){return `<div class="result-bar ${selected?'is-selected':''}" style="--pct:${pct}%;--bar:${color}"><span>${label}</span><strong>${pct}%</strong></div>`}

  /* ---------------- ZANJAR ---------------- */
  function openCreate(){createStep=0;createPublished=false;draft=freshDraft();showScreen('create',{nav:'home'});renderCreate()}
  // Adding or removing a photo re-renders step 1, which would otherwise throw away
  // whatever the user had already typed into the story field.
  function keepStoryDraft(){const t=$('#storyInput');if(t)draft.story=t.value}
  function renderCreate(){
    const bars=$$('#createProgress i');bars.forEach((b,i)=>{b.classList.toggle('is-active',i===Math.min(createStep,3));b.classList.toggle('is-done',i<createStep)});
    const body=$('#createBody');
    body.classList.toggle('is-compact',createPublished||createStep===0||(createStep===2&&!draft.bReady));
    if(createPublished){body.innerHTML=`<section class="create-step"><div class="published-card"><div class="published-card__mark">✓</div><span class="eyebrow">CASO PUBLICADO</span><h2>YA ESTÁ EN<br>EL JURADO.</h2><p>${escapeHtml(draft.question)}</p></div><div class="create-actions"><button class="action action--primary action--xl" id="publishedArena">VER EN ARENA →</button><button class="action action--secondary action--lg" id="publishedShare">COMPARTIR CON AMIGOS</button><button class="link-action" id="publishedHome">VOLVER AL INICIO</button></div></section>`;$('#publishedArena').onclick=startArena;$('#publishedShare').onclick=()=>openShare('TU ZANJA',draft.question,{t:'case',tag:draft.tag||'TU ZANJA',q:draft.question,a:draft.a.filter(Boolean),b:draft.b.filter(Boolean)});$('#publishedHome').onclick=()=>showScreen('home');return}
    if(createStep===0){body.innerHTML=`<section class="create-step"><span class="eyebrow">PASO 1 · CUÉNTALO</span><h1>¿QUÉ HA<br>PASADO?</h1><p>No pienses en redactarlo perfecto. Cuéntalo como te salga y ZANJA lo ordena.</p><textarea class="text-area" id="storyInput" maxlength="650" placeholder="Ej.: Mi compañero dice que si avisa 10 minutos antes, llegar 20 minutos tarde ya no cuenta como llegar tarde…">${escapeHtml(draft.story)}</textarea><div class="create-tools"><button class="tool-button" id="dictateBtn" type="button">🎙 DICTAR</button><button class="tool-button${draft.photo?' is-on':''}" id="evidenceBtn" type="button">📷 ${draft.photo?'CAMBIAR PRUEBA':'AÑADIR PRUEBA'}</button></div>${draft.photo?`<figure class="evidence-preview"><img src="${draft.photo}" alt="Prueba adjunta al caso" /><button class="evidence-remove" id="removeEvidence" type="button">QUITAR PRUEBA</button></figure>`:''}<button class="action action--primary action--xl" id="createNext">ORDENAR MI CASO →</button></section>`;$('#createNext').onclick=()=>{draft.story=$('#storyInput').value.trim();if(draft.story.length<12){toast('CUÉNTAME UN POCO MÁS');return}autoBuildDraft();createStep=1;renderCreate()};$('#dictateBtn').onclick=()=>toast('DICTADO · LISTO PARA CONECTAR EN APP NATIVA');$('#evidenceBtn').onclick=()=>$('#photoInput').click();const rm=$('#removeEvidence');if(rm)rm.onclick=()=>{keepStoryDraft();draft.photo=null;renderCreate()}}
    else if(createStep===1){body.innerHTML=`<section class="create-step"><span class="eyebrow">PASO 2 · TU DEFENSA</span><h1>ASÍ LO VERÁ<br>EL JURADO.</h1><p>Edita lo que haga falta. El caso debe entenderse en pocos segundos.</p><div class="case-builder"><div class="builder-question"><label>PREGUNTA</label><textarea id="draftQuestion">${escapeHtml(draft.question)}</textarea></div><div class="builder-side"><div class="builder-side__head"><strong>BANDO A</strong><span>TU POSICIÓN</span></div>${draft.a.map((x,i)=>`<input class="argument-input" data-a="${i}" value="${escapeHtml(x)}" placeholder="Argumento ${i+1}" />`).join('')}</div></div><button class="action action--primary action--xl" id="createNext">ESTA ES MI DEFENSA →</button></section>`;$('#createNext').onclick=()=>{draft.question=$('#draftQuestion').value.trim();draft.a=$$('[data-a]').map(i=>i.value.trim()).filter(Boolean).slice(0,3);while(draft.a.length<3)draft.a.push('');if(!draft.question||!draft.a[0]){toast('FALTA LA PREGUNTA O TU DEFENSA');return}createStep=2;renderCreate()}}
    else if(createStep===2){const bWritten=draft.b.some(Boolean);body.innerHTML=draft.bReady?`<section class="create-step"><span class="eyebrow">PASO 3 · BANDO B</span><h1>${bWritten?'EL OTRO LADO<br>YA ESTÁ LISTO.':'AHORA ESCRIBE<br>TU DEFENSA.'}</h1><div class="builder-question"><label>SOBRE QUÉ VOTA EL JURADO</label><textarea readonly>${escapeHtml(draft.question)}</textarea></div>${draft.photo?`<button class="evidence-button" id="seeInviteEvidence" type="button">VER LA PRUEBA QUE ADJUNTÓ A</button>`:draft.photoPromised?'<div class="info-box info-box--warn">A adjuntó una prueba, pero <b>las imágenes no viajan dentro del enlace</b> en esta beta. La verás cuando el caso tenga servidor.</div>':''}<div class="builder-side builder-side--b"><div class="builder-side__head"><strong>BANDO B</strong><span>SU DEFENSA</span></div>${draft.b.map((x,i)=>`<input class="argument-input" data-b="${i}" value="${escapeHtml(x)}" placeholder="Argumento ${i+1}" />`).join('')}</div><div class="info-box">A y B se han escrito <b>sin ver la defensa del otro</b>. El caso ya puede abrirse al jurado.</div><button class="action action--primary action--xl" id="createNext">${draft.inviteMode?'LISTO · GENERAR ENLACE →':'PREPARAR PUBLICACIÓN →'}</button></section>`:`<section class="create-step"><span class="eyebrow">PASO 3 · FALTA EL OTRO LADO</span><h1>AHORA LE TOCA<br>A B.</h1><p>B debe escribir su defensa sin ver la tuya. Así reducimos respuestas estratégicas.</p><div class="invite-hero"><b>VS</b></div><div class="create-actions"><button class="action action--primary action--xl" id="inviteB">ENVIAR INVITACIÓN →</button><button class="action action--secondary action--lg" id="localB">RESPONDER COMO B AQUÍ · BETA</button></div><div class="info-box"><b>B recibe un enlace y responde sin instalar nada.</b> Al terminar, le genera otro enlace para devolvértelo.</div></section>`;
      if(draft.bReady){
        const ev=$('#seeInviteEvidence');if(ev)ev.onclick=()=>openPhoto(draft.photo,draft.question);
        if(draft.inviteMode){$('#createNext').onclick=()=>{draft.b=$$('[data-b]').map(i=>i.value.trim()).filter(Boolean).slice(0,3);if(!draft.b.length){toast('ESCRIBE AL MENOS UN ARGUMENTO');return}const id='shared-'+Date.now(),now=Date.now(),c={id,tag:draft.tag||'ZANJA COMPARTIDA',q:draft.question,a:draft.a.filter(Boolean),b:draft.b,photo:draft.photo||null,counts:{a:0,both:0,b:0},mix:newMix(),reach:60+Math.floor(Math.random()*340),createdAt:now,closesAt:now+DURATION_MS['24 h'],custom:true};state.customCases.unshift(c);save();openShare('CASO COMPLETO','Ya escribí mi defensa. Puedes votarlo o mandárselo a quien te retó.',{t:'case',tag:c.tag,q:c.q,a:c.a,b:c.b})}}
        else{$('#createNext').onclick=()=>{draft.b=$$('[data-b]').map(i=>i.value.trim()).slice(0,3);createStep=3;renderCreate()}}
      }else{
        $('#inviteB').onclick=()=>{
          let key=null;
          if(draft.photo){key='inv-'+Date.now();state.invites[key]={photo:draft.photo,at:Date.now()};
            state.invites=Object.fromEntries(Object.entries(state.invites).slice(-6));save()}
          openShare('INVITACIÓN A B',`Te han invitado a defender el Bando B en: ${draft.question}`,{t:'invite',tag:draft.tag,q:draft.question,a:draft.a,k:key,ph:!!draft.photo});
        };
        $('#localB').onclick=()=>{draft.bReady=true;draft.b=['','',''];renderCreate()}
      }
    }
    else if(createStep===3){body.innerHTML=`<section class="create-step"><span class="eyebrow">PASO 4 · ABRIR AL JURADO</span><h1>¿QUIÉN PUEDE<br>JUZGAR?</h1><div class="publish-preview"><span>ASÍ SALDRÁ PUBLICADO</span><h2>${escapeHtml(draft.question)}</h2></div><label class="field-label">AUDIENCIA</label><div class="segmented segmented--two" id="audienceSegment"><button data-value="public" class="${draft.audience==='public'?'is-selected':''}">JURADO PÚBLICO</button><button data-value="link" class="${draft.audience==='link'?'is-selected':''}">SOLO CON ENLACE</button></div><label class="field-label">DURACIÓN</label><div class="segmented" id="durationSegment"><button data-value="15 min" class="${draft.duration==='15 min'?'is-selected':''}">15 MIN</button><button data-value="1 h" class="${draft.duration==='1 h'?'is-selected':''}">1 H</button><button data-value="24 h" class="${draft.duration==='24 h'?'is-selected':''}">24 H</button></div><div class="info-box">El resultado permanecerá oculto hasta que cada jurado vote. <b>ZANJADO</b> aparecerá cuando cierre el tiempo.</div><button class="action action--primary action--xl" id="publishCase">ZÁNJALO →</button></section>`;$$('#audienceSegment button').forEach(b=>b.onclick=()=>{draft.audience=b.dataset.value;$$('#audienceSegment button').forEach(x=>x.classList.toggle('is-selected',x===b))});$$('#durationSegment button').forEach(b=>b.onclick=()=>{draft.duration=b.dataset.value;$$('#durationSegment button').forEach(x=>x.classList.toggle('is-selected',x===b))});$('#publishCase').onclick=publishDraft}
  }
  function autoBuildDraft(){
    let s=draft.story.replace(/\s+/g,' ').trim(),q;
    if(s.includes('?')){q=s.slice(0,s.indexOf('?')+1);if(!/^\s*¿/.test(q))q='¿'+q.replace(/^[¿\s]+/,'')}
    else{const base=s.length>90?s.slice(0,90).replace(/\s+\S*$/,'')+'…':s;q=`¿${base}?`}
    if(q.length>110)q=q.slice(0,106).replace(/\s+\S*$/,'')+'…?';
    draft.question=q;draft.a=['','',''];
  }
  function publishDraft(){
    const id='custom-'+Date.now(),now=Date.now(),span=DURATION_MS[draft.duration]||36e5;
    const c={id,tag:draft.tag||'TU ZANJA',q:draft.question,a:draft.a.filter(Boolean),b:draft.b.filter(Boolean),
      photo:draft.photo||null,counts:{a:0,both:0,b:0},mix:newMix(),reach:60+Math.floor(Math.random()*340),
      createdAt:now,closesAt:now+span,audience:draft.audience,custom:true};
    state.customCases.unshift(c);state.created++;
    addXp(XP.created);markDaily('created');
    addActivity('created','Tu ZANJA ya está en el jurado',`${draft.duration} · ${draft.audience==='public'?'jurado público':'solo con enlace'}`);
    checkAchievements();sound('zanjar');haptic([14,25,28]);createPublished=true;save();renderCreate();
  }

  /* ---------------- PRUEBAS FOTOGRÁFICAS ---------------- */
  function downscaleImage(file,max=900,q=.62){
    return new Promise((res,rej)=>{
      const url=URL.createObjectURL(file),img=new Image();
      img.onload=()=>{
        URL.revokeObjectURL(url);
        const s=Math.min(1,max/Math.max(img.width,img.height));
        const cv=document.createElement('canvas');
        cv.width=Math.max(1,Math.round(img.width*s));cv.height=Math.max(1,Math.round(img.height*s));
        cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
        try{res(cv.toDataURL('image/jpeg',q))}catch(e){rej(e)}
      };
      img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('imagen no válida'))};
      img.src=url;
    });
  }
  function openPhoto(src,caption){if(!src)return;$('#photoImage').src=src;$('#photoCaption').textContent=caption||'';els.photo.showModal()}

  /* ---------------- DENUNCIAS ---------------- */
  function caseMetaMarkup(c,daily){
    const review=isUnderReview(c);
    return `<div class="case-meta">
      <span class="case-tag">${escapeHtml(c.tag)}</span>
      <span class="case-live"><i></i>${daily?'HOY':currentMode==='weekly'?'SEMANAL':currentMode==='own'?(caseState(c)==='closed'?'ZANJADO':'EN DIRECTO'):'VEREDICTO LIVE'}</span>
      <span class="case-meta__gap"></span>
      ${c.photo?'<button class="case-chip case-chip--photo" id="caseEvidence" type="button" aria-label="Ver la prueba adjunta">PRUEBA</button>':''}
      <button class="case-chip case-chip--report" id="caseReport" type="button" aria-label="Denunciar este caso">⚑</button>
    </div>${review?'<div class="review-banner">EN REVISIÓN · la comunidad ha denunciado este caso</div>':''}`;
  }
  function bindCaseMeta(c){
    const ev=$('#caseEvidence');if(ev)ev.onclick=e=>{e.stopPropagation();openPhoto(c.photo,c.q)};
    const rp=$('#caseReport');if(rp)rp.onclick=e=>{e.stopPropagation();openReport(c)};
  }
  function openReport(c){
    if(state.reported[c.id]){toast('YA HABÍAS DENUNCIADO ESTE CASO');return}
    $('#reportQuestion').textContent=c.q;
    $('#reportBody').innerHTML=REPORT_REASONS.map((r,i)=>`<button class="report-reason" data-reason="${i}" type="button">${escapeHtml(r)}</button>`).join('');
    els.report.showModal();
    $$('[data-reason]',els.report).forEach(b=>b.onclick=()=>submitReport(c,REPORT_REASONS[+b.dataset.reason]));
  }
  function submitReport(c,reason){
    els.report.close();
    if(state.reported[c.id])return;
    state.reported[c.id]={reason,at:Date.now()};
    let item=reportFor(c.id);
    if(!item){item={caseId:c.id,tag:c.tag,q:c.q,photo:c.photo||null,reasons:[],reportCount:0,votes:{remove:0,keep:0},myVote:null,resolved:null,mine:state.customCases.some(x=>x.id===c.id)};state.verifyQueue.unshift(item)}
    item.reportCount++;item.reasons.push(reason);
    const pulled=item.reportCount>=REPORT_HIDE_AT;
    addActivity('report','Denuncia enviada',`${reason} · ${pulled?'el caso sale de Arena':'queda en revisión'}`);
    save();sound('tap');haptic(12);
    toast(pulled?'FUERA DE ARENA · PASA A VERIFICACIÓN':'DENUNCIA ENVIADA · EN REVISIÓN');
    if(currentMode==='arena')advanceArena();else showScreen('home');
  }

  /* ---------------- VERIFICACIÓN ---------------- */
  function seedVerifyQueue(){
    if(state.verifyQueue.length)return;
    state.verifyQueue=[
      {caseId:'demo-r1',tag:'DENUNCIADO',q:'¿Puede tu cuñado publicar fotos de tus hijos sin pedirte permiso?',photo:null,
       reasons:['Datos privados de alguien','Datos privados de alguien'],reportCount:2,votes:{remove:2,keep:2},myVote:null,resolved:null,mine:false},
      {caseId:'demo-r2',tag:'DENUNCIADO',q:'¿Está bien poner música a todo volumen a las 3 de la mañana un martes?',photo:null,
       reasons:['Otro motivo'],reportCount:1,votes:{remove:1,keep:1},myVote:null,resolved:null,mine:false},
      {caseId:'demo-r3',tag:'DENUNCIADO',q:'¿Se puede contar en público lo que te contaron en confianza?',photo:null,
       reasons:['Ataque personal o acoso','Otro motivo','Ataque personal o acoso'],reportCount:3,votes:{remove:3,keep:1},myVote:null,resolved:null,mine:false}
    ];
    save();
  }
  function verifyVote(item,choice){
    if(item.myVote||item.resolved)return;
    item.votes[choice]++;item.myVote=choice;
    const total=item.votes.remove+item.votes.keep;
    if(total>=VERIFY_QUORUM){
      item.resolved=item.votes.remove>item.votes.keep?'removed':'kept';
      if(item.resolved==='removed'){const c=state.customCases.find(x=>x.id===item.caseId);if(c)c.removed=true}
      addActivity('verify',item.resolved==='removed'?'Un caso ha sido retirado':'Un caso se mantiene publicado',
        `${item.votes.remove} retirar · ${item.votes.keep} mantener`);
    }
    state.verifiedCount++;addXp(XP.verify);markDaily('verify');checkAchievements();save();
    sound(choice==='remove'?'wrong':'correct');haptic(12);
    toast(item.resolved?(item.resolved==='removed'?'DECIDIDO · SE RETIRA':'DECIDIDO · SE MANTIENE'):`VOTO REGISTRADO · ${item.votes.remove+item.votes.keep}/${VERIFY_QUORUM}`);
    renderVerify();
  }
  function verifyCardMarkup(item){
    const total=item.votes.remove+item.votes.keep,pct=total?Math.round(item.votes.remove/total*100):0;
    const reasons=[...new Set(item.reasons)];
    return `<article class="verify-card${item.resolved?' is-resolved':''}">
      <div class="verify-card__head">
        <span class="state-chip is-review">${item.reportCount} DENUNCIA${item.reportCount===1?'':'S'}</span>
        ${item.reportCount>=REPORT_HIDE_AT?'<span class="state-chip is-removed">FUERA DE ARENA</span>':''}
        ${item.resolved?`<span class="state-chip ${item.resolved==='removed'?'is-removed':'is-closed'}">${item.resolved==='removed'?'RETIRADO':'MANTENIDO'}</span>`:''}
      </div>
      <b>${escapeHtml(item.q)}</b>
      <div class="verify-reasons">${reasons.map(r=>`<span>${escapeHtml(r)}</span>`).join('')}</div>
      ${item.photo?`<button class="evidence-button" data-vphoto="${escapeHtml(item.caseId)}" type="button">VER PRUEBA</button>`:''}
      <div class="verify-tally"><i style="width:${pct}%"></i></div>
      <div class="verify-tally__legend"><span>${item.votes.remove} retirar</span><span>${item.votes.keep} mantener</span><b>${total}/${VERIFY_QUORUM}</b></div>
      ${item.resolved?'' :item.myVote
        ?`<div class="verify-mine">TU VOTO: ${item.myVote==='remove'?'RETIRAR':'MANTENER'} · faltan votos</div>`
        :`<div class="verify-actions"><button class="action action--danger action--lg" data-verify="remove" data-id="${escapeHtml(item.caseId)}" type="button">RETIRAR</button><button class="action action--secondary action--lg" data-verify="keep" data-id="${escapeHtml(item.caseId)}" type="button">MANTENER</button></div>`}
    </article>`;
  }
  function renderVerify(){
    const lvl=getLevel(),body=$('#verifyBody');
    if(lvl<VERIFY_LEVEL){
      const need=Math.max(0,VERIFY_LEVEL*150-state.xp);
      body.innerHTML=`<div class="verify-lock">
        <div class="verify-lock__badge">⚖</div>
        <span class="eyebrow">PANEL DE VERIFICACIÓN</span>
        <h2>SE ABRE EN<br>EL NIVEL ${VERIFY_LEVEL}.</h2>
        <p>Los verificadores revisan los casos denunciados y deciden si se retiran. Hace falta criterio acumulado, así que se desbloquea usando ZANJA.</p>
        <div class="verify-lock__meter"><i style="width:${Math.round(clamp(state.xp/(VERIFY_LEVEL*150),0,1)*100)}%"></i></div>
        <b>NIVEL ${lvl} · TE FALTAN ${fmt.format(need)} XP</b>
        <ul class="xp-legend">
          <li><span>+${XP.arena}</span> votar en Arena</li>
          <li><span>+${XP.daily}</span> Caso del Día</li>
          <li><span>+${XP.weekly}</span> debate semanal</li>
          <li><span>+${XP.created}</span> publicar un caso</li>
        </ul>
      </div>`;
      return;
    }
    const queue=state.verifyQueue.filter(v=>!v.mine);
    const pending=queue.filter(v=>!v.resolved),done=queue.filter(v=>v.resolved);
    $('#verifyStat').textContent=`${state.verifiedCount} verificadas`;
    body.innerHTML=`<div class="verify-rules">Decide si el caso respeta las normas. Al llegar a <b>${VERIFY_QUORUM} votos</b> gana la mayoría simple. Cada verificación suma <b>+${XP.verify} XP</b>.</div>
      ${pending.length?pending.map(verifyCardMarkup).join(''):'<div class="empty-state"><b>NADA PENDIENTE</b><p>No hay casos denunciados esperando verificación ahora mismo.</p></div>'}
      ${done.length?`<div class="section-title"><div><span>YA RESUELTOS</span><b>Decisiones de la comunidad</b></div></div>${done.map(verifyCardMarkup).join('')}`:''}`;
    $$('[data-verify]',body).forEach(b=>b.onclick=()=>{const item=state.verifyQueue.find(v=>v.caseId===b.dataset.id);if(item)verifyVote(item,b.dataset.verify)});
    $$('[data-vphoto]',body).forEach(b=>b.onclick=()=>{const item=state.verifyQueue.find(v=>v.caseId===b.dataset.vphoto);if(item)openPhoto(item.photo,item.q)});
  }

  /* ---------------- MIS ZANJAS ---------------- */
  function sideLabel(k){return k==='both'?'AMBOS':k==='a'?'BANDO A':'BANDO B'}
  function refreshCasePeak(){
    let m=state.createdVotePeak;
    for(const c of state.customCases){const v=caseVotes(c);m=Math.max(m,v.a+v.both+v.b)}
    if(m!==state.createdVotePeak){state.createdVotePeak=m;save()}
  }
  function renderMyCases(){
    refreshCasePeak();checkAchievements();
    const list=state.customCases,body=$('#myCasesList');
    const open=list.filter(c=>caseState(c)==='open').length,closed=list.filter(c=>caseState(c)==='closed').length;
    $('#mineSummary').textContent=list.length?`${open} zanjándose · ${closed} zanjada${closed===1?'':'s'}`:'Todavía no has publicado nada';
    if(!list.length){
      body.innerHTML=`<div class="empty-state"><b>AÚN NO HAS ZANJADO NADA</b><p>Cuando publiques un caso aparecerá aquí: cómo va la votación, cuánto le queda abierto y el veredicto final.</p></div>`;
      return;
    }
    body.innerHTML=list.map(c=>{
      const st=caseState(c),v=caseVotes(c),p=percentage(v),review=isUnderReview(c);
      const chip=st==='removed'?['RETIRADO','is-removed']:st==='closed'?['ZANJADO','is-closed']:['ZANJÁNDOSE','is-open'];
      const foot=st==='open'?`CIERRA EN ${timeLeft(c.closesAt-Date.now())}`
        :st==='removed'?'RETIRADO POR VERIFICACIÓN'
        :p.total?`GANA ${sideLabel(getWinner(v))}`:'CERRÓ SIN VOTOS';
      return `<article class="mine-card${st==='removed'?' is-dimmed':''}" data-open="${escapeHtml(c.id)}" role="button" tabindex="0">
        <div class="mine-card__head">
          <span class="state-chip ${chip[1]}">${chip[0]}</span>
          ${review?'<span class="state-chip is-review">EN REVISIÓN</span>':''}
          ${c.photo?`<button class="mine-photo" data-mphoto="${escapeHtml(c.id)}" type="button">PRUEBA</button>`:''}
        </div>
        <b>${escapeHtml(c.q)}</b>
        <div class="result-bars result-bars--mini">
          ${resultBar('A',p.a,'var(--cyan)',false)}${resultBar('AMBOS',p.both,'var(--signal)',false)}${resultBar('B',p.b,'var(--coral)',false)}
        </div>
        <div class="mine-card__foot"><span>${p.total?`${fmt.format(p.total)} votos`:'Sin votos todavía'}</span><i>${foot}</i></div>
      </article>`;
    }).join('');
    $$('[data-mphoto]',body).forEach(b=>b.onclick=e=>{e.stopPropagation();const c=state.customCases.find(x=>x.id===b.dataset.mphoto);if(c)openPhoto(c.photo,c.q)});
    $$('[data-open]',body).forEach(el=>{
      const go=()=>openOwnCase(el.dataset.open);
      el.onclick=go;
      el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}};
    });
  }

  /* ---------------- DEBATE SEMANAL ---------------- */
  const PROPOSAL_POOL=[
    {q:'¿Se puede ir a una boda sin confirmar la asistencia?',a:['Avisé en el grupo el día antes.','Había sitio de sobra.','Surgió a última hora.'],b:['El catering se paga por cabeza.','Confirmar es lo mínimo.','Descolocas la mesa de alguien.'],author:'Marta'},
    {q:'¿Está mal devolver un regalo que no te gusta a la misma persona?',a:['Prefiero ser sincero.','No lo voy a usar nunca.','Que lo disfrute alguien.'],b:['El gesto era lo que contaba.','Hace sentir fatal a quien lo eligió.','Se guarda y ya está.'],author:'Iván'},
    {q:'¿Puede un grupo obligarte a pagar a partes iguales si tú no bebiste?',a:['Repartir es más rápido.','Siempre se hace así.','Otras veces salgo ganando yo.'],b:['Pagué lo mío y poco más.','La diferencia era grande.','Cada uno lo suyo.'],author:'Lucía'},
    {q:'¿Es de mala educación contestar mensajes mientras cenas con alguien?',a:['Miro el móvil dos segundos.','Puede ser algo urgente.','Sigo la conversación igual.'],b:['Rompe la atención del todo.','El rato era para los dos.','Puede esperar al postre.'],author:'Diego'},
    {q:'¿Deberías avisar si vas a llevar a alguien más a una cena en casa ajena?',a:['Es alguien de confianza.','Siempre sobra comida.','Se lo dije al llegar.'],b:['Hay que contar los platos.','La casa no es tuya.','Un mensaje antes cuesta nada.'],author:'Nerea'},
    {q:'¿Se puede dejar de seguir a un amigo en redes sin que sea algo personal?',a:['Solo limpio el feed.','Seguimos hablando igual.','No significa nada.'],b:['Se nota y duele.','Es un gesto público.','Podrías silenciarlo en vez de eso.'],author:'Pablo'}
  ];
  function weekStart(d=new Date()){const t=new Date(d);t.setHours(0,0,0,0);t.setDate(t.getDate()-((t.getDay()+6)%7));return t}
  function weekKey(){return weekStart().toISOString().slice(0,10)}
  function weekEnd(){const t=weekStart();t.setDate(t.getDate()+7);return t.getTime()-60000}
  function debateStart(){const t=weekStart();t.setDate(t.getDate()+3);return t.getTime()}
  function weeklyPhase(){const d=new Date().getDay();return (d===1||d===2)?'propose':d===3?'elect':'debate'}
  function seedProposals(key){
    let h=7;for(const ch of key)h=(h*33+ch.charCodeAt(0))>>>0;
    return PROPOSAL_POOL.map((p,i)=>({id:'p'+i,q:p.q,a:p.a,b:p.b,author:p.author,votes:60+((h>>(i*3))%180)}));
  }
  function winningProposal(w){return w&&w.proposals&&w.proposals.length?[...w.proposals].sort((x,y)=>y.votes-x.votes)[0]:null}
  function ensureWeekly(){
    const k=weekKey();
    if(state.weekly&&state.weekly.key===k)return state.weekly;
    if(state.weekly&&state.weekly.proposals){
      const win=winningProposal(state.weekly);
      if(win){state.weeklyHistory.unshift({key:state.weekly.key,q:win.q,myVote:state.weekly.debateVote||null,at:Date.now()});state.weeklyHistory=state.weeklyHistory.slice(0,8)}
    }
    state.weekly={key:k,proposals:seedProposals(k),myProposalId:null,votedProposalId:null,debateVote:null};
    save();return state.weekly;
  }
  function weeklyCase(w){
    const p=winningProposal(w);if(!p)return null;
    const mixA=.24+((p.votes*13)%34)/100,mixBoth=.06+((p.votes*7)%13)/100;
    return {id:`weekly-${w.key}`,tag:'DEBATE SEMANAL',q:p.q,a:p.a,b:p.b,counts:{a:0,both:0,b:0},
      mix:{a:mixA,both:mixBoth,b:Math.max(.05,1-mixA-mixBoth)},reach:900+((p.votes*7)%1500),
      createdAt:debateStart(),closesAt:weekEnd()};
  }
  function weeklySummary(){
    const w=ensureWeekly(),phase=weeklyPhase();
    if(phase==='propose')return {badge:'FASE 1 · PROPUESTAS',title:'¿QUÉ DEBATIMOS ESTA SEMANA?',meta:`${w.proposals.length} temas en la mesa`,cta:w.myProposalId?'VER PROPUESTAS →':'PROPONER TEMA →'};
    if(phase==='elect')return {badge:'FASE 2 · ELECCIÓN',title:'ELIGE EL TEMA DE LA SEMANA',meta:w.votedProposalId?'Ya has votado':'Tu voto decide el debate',cta:w.votedProposalId?'VER RESULTADOS →':'VOTAR TEMA →'};
    const c=weeklyCase(w);
    return {badge:'FASE 3 · DEBATE ABIERTO',title:c?c.q:'DEBATE DE LA SEMANA',meta:`Cierra en ${timeLeft(weekEnd()-Date.now())}`,cta:c&&state.votes[c.id]?'VER RESULTADO →':'ENTRAR AL DEBATE →'};
  }
  function openWeekly(){ensureWeekly();showScreen('weekly',{nav:'home'})}
  function startWeeklyDebate(){
    const w=ensureWeekly(),c=weeklyCase(w);
    if(!c){toast('TODAVÍA NO HAY TEMA GANADOR');return}
    sound('open');haptic(8);clearCountdown();clearWash();
    currentMode='weekly';currentQueue=[c];currentIndex=0;
    els.playMode.textContent='DEBATE SEMANAL';els.playProgress.innerHTML='<i class="is-current"></i>';
    showScreen('play',{nav:'home'});renderArenaCase(c);
  }
  function submitProposal(){
    const w=ensureWeekly();
    const q=$('#propQ').value.trim(),a=$('#propA').value.trim(),b=$('#propB').value.trim();
    if(q.length<10){toast('ESCRIBE UNA PREGUNTA MÁS CLARA');return}
    if(!a||!b){toast('HACEN FALTA LOS DOS BANDOS');return}
    const id='mine-'+Date.now();
    w.proposals.push({id,q:/^\s*¿/.test(q)?q:`¿${q.replace(/^[¿\s]+/,'')}`,a:[a],b:[b],author:'Tú',votes:1,mine:true});
    w.myProposalId=id;state.proposalsMade++;
    addXp(XP.proposal);addActivity('weekly','Has propuesto un tema',q.slice(0,70));
    checkAchievements();save();sound('zanjar');haptic([12,20]);
    toast(`PROPUESTA ENVIADA · +${XP.proposal} XP`);
    renderWeekly();
  }
  function voteProposal(id){
    const w=ensureWeekly();
    if(w.votedProposalId){toast('YA HAS ELEGIDO TEMA ESTA SEMANA');return}
    const p=w.proposals.find(x=>x.id===id);if(!p)return;
    p.votes++;w.votedProposalId=id;
    addActivity('weekly','Has votado el tema de la semana',p.q.slice(0,70));
    save();sound('vote','a');haptic(12);toast('VOTO REGISTRADO');
    renderWeekly();
  }
  function proposalRowMarkup(p,w,phase,maxVotes){
    const chosen=w.votedProposalId===p.id,pct=maxVotes?Math.round(p.votes/maxVotes*100):0;
    const first=(arr)=>escapeHtml((arr&&arr.find(Boolean))||'Sin argumento todavía');
    return `<article class="proposal${chosen?' is-chosen':''}${p.mine?' is-mine':''}">
      <div class="proposal__bar" style="width:${pct}%"></div>
      <div class="proposal__main">
        <b>${escapeHtml(p.q)}</b>
        <div class="proposal__sides">
          <div class="proposal__side proposal__side--a"><span>A</span><p>${first(p.a)}</p></div>
          <div class="proposal__side proposal__side--b"><span>B</span><p>${first(p.b)}</p></div>
        </div>
        <div class="proposal__foot">
          <span class="proposal__meta">${p.mine?'Tu propuesta':`Propuesto por ${escapeHtml(p.author)}`} · ${fmt.format(p.votes)} votos</span>
          ${phase==='elect'&&!w.votedProposalId?`<button class="proposal__vote" data-prop="${escapeHtml(p.id)}" type="button">ELEGIR ESTE</button>`:chosen?'<span class="proposal__check">✓ TU VOTO</span>':''}
        </div>
      </div>
    </article>`;
  }
  function renderWeekly(){
    const w=ensureWeekly(),phase=weeklyPhase(),body=$('#weeklyBody');
    const order=['propose','elect','debate'];
    const rail=`<div class="phase-rail">${[['PROPUESTAS','propose'],['ELECCIÓN','elect'],['DEBATE','debate'],['ZANJADO','end']].map(([l,k])=>{
      const cls=k===phase?'is-current':(order.indexOf(k)>-1&&order.indexOf(k)<order.indexOf(phase))?'is-done':'';
      return `<span class="${cls}">${l}</span>`;
    }).join('')}</div>`;
    const sorted=[...w.proposals].sort((x,y)=>y.votes-x.votes);
    const maxVotes=sorted.length?sorted[0].votes:0;

    if(phase==='propose'){
      body.innerHTML=`${rail}
        <section class="panel-hero">
          <span class="eyebrow">LUNES Y MARTES</span>
          <h1>¿QUÉ DEBATIMOS<br>ESTA SEMANA?</h1>
          <p>Propón un tema. El miércoles la comunidad elige cuál se debate de jueves a domingo.</p>
        </section>
        ${w.myProposalId
          ?'<div class="info-box"><b>Tu propuesta ya está en la mesa.</b> El miércoles se vota cuál gana.</div>'
          :`<div class="proposal-form">
              <label class="field-label" for="propQ">TU PREGUNTA</label>
              <textarea class="text-area text-area--sm" id="propQ" maxlength="120" placeholder="¿Se puede…?"></textarea>
              <label class="field-label" for="propA">BANDO A</label>
              <input class="text-input" id="propA" maxlength="80" placeholder="El argumento de un lado" />
              <label class="field-label" for="propB">BANDO B</label>
              <input class="text-input" id="propB" maxlength="80" placeholder="El argumento del otro" />
              <button class="action action--primary action--lg" id="sendProposal" type="button">ENVIAR PROPUESTA →</button>
            </div>`}
        <div class="section-title"><div><span>EN LA MESA</span><b>${w.proposals.length} temas propuestos</b></div></div>
        <div class="proposal-list">${sorted.map(p=>proposalRowMarkup(p,w,phase,maxVotes)).join('')}</div>`;
      const send=$('#sendProposal');if(send)send.onclick=submitProposal;
      return;
    }

    if(phase==='elect'){
      body.innerHTML=`${rail}
        <section class="panel-hero">
          <span class="eyebrow">MIÉRCOLES · DÍA DE ELECCIÓN</span>
          <h1>ELIGE EL TEMA<br>DE LA SEMANA.</h1>
          <p>${w.votedProposalId?'Ya has votado. El más votado se abrirá mañana como debate.':'Un voto por persona. El más votado se abre mañana como debate.'}</p>
        </section>
        <div class="proposal-list">${sorted.map(p=>proposalRowMarkup(p,w,phase,maxVotes)).join('')}</div>`;
      $$('[data-prop]',body).forEach(b=>b.onclick=()=>voteProposal(b.dataset.prop));
      return;
    }

    const c=weeklyCase(w),voted=c&&state.votes[c.id],v=c?caseVotes(c):null,p=v?percentage(v):null;
    body.innerHTML=`${rail}
      <section class="weekly-debate">
        <span class="eyebrow">EL TEMA GANADOR · JUEVES A DOMINGO</span>
        <h1>${c?escapeHtml(c.q):'TODAVÍA NO HAY TEMA'}</h1>
        <div class="weekly-clock">CIERRA EN ${timeLeft(weekEnd()-Date.now())}</div>
        ${voted&&p?`<div class="result-bars">${resultBar('A',p.a,'var(--cyan)',voted.choice==='a')}${resultBar('AMBOS',p.both,'var(--signal)',voted.choice==='both')}${resultBar('B',p.b,'var(--coral)',voted.choice==='b')}</div>
          <div class="weekly-voted">YA HAS VOTADO · ${sideLabel(voted.choice)}</div>`
        :`<button class="action action--primary action--xl" id="enterDebate" type="button">ENTRAR AL DEBATE →</button>`}
      </section>
      ${state.weeklyHistory.length?`<div class="section-title"><div><span>SEMANAS ANTERIORES</span><b>Lo que ya se zanjó</b></div></div>
        <div class="proposal-list">${state.weeklyHistory.map(h=>`<article class="proposal is-past"><div class="proposal__body"><b>${escapeHtml(h.q)}</b><span class="proposal__meta">Semana del ${escapeHtml(h.key)}${h.myVote?` · votaste ${sideLabel(h.myVote)}`:''}</span></div></article>`).join('')}</div>`:''}`;
    const enter=$('#enterDebate');if(enter)enter.onclick=startWeeklyDebate;
  }

  /* ---------------- Activity / Profile ---------------- */
  function seedActivities(){if(state.activities.length)return;state.activities=[{id:1,type:'closed',title:'Un caso que juzgaste ha sido ZANJADO',detail:'“¿Puedes ver solo una serie?” · B gana 72%',at:Date.now()-1800000},{id:2,type:'verify',title:'Hay casos esperando verificación',detail:'La comunidad ha denunciado 3 casos',at:Date.now()-7200000},{id:3,type:'b',title:'Bando B ha respondido',detail:'Tu caso ya puede abrirse al jurado',at:Date.now()-86400000}];save()}
  function renderActivity(){seedActivities();state.unread=0;save();updateHome();const list=$('#activityList');list.innerHTML=state.activities.map(x=>`<article class="activity-item"><div class="activity-icon activity-icon--${x.type}">${x.type==='closed'?'✓':x.type==='verify'?'⚖':x.type==='report'?'⚑':x.type==='achievement'?'✦':x.type==='streak'?'🔥':x.type==='weekly'?'W':x.type==='created'?'+':'B'}</div><div class="activity-copy"><b>${escapeHtml(x.title)}</b><span>${escapeHtml(x.detail)}</span></div><button data-activity="${x.type}">VER →</button></article>`).join('');$$('[data-activity]',list).forEach(b=>b.onclick=()=>{const t=b.dataset.activity;if(t==='verify'||t==='report')showScreen('verify',{nav:'activity'});else if(t==='created')showScreen('mine',{nav:'activity'});else if(t==='weekly')openWeekly();else if(t==='closed')startArena();else toast('ACTIVIDAD REVISADA')})}
  function renderProfile(){const agree=state.judged?Math.round(state.majorityMatches/state.judged*100):null;$('#profileAgreement').textContent=agree==null?'—':`${agree}%`;$('#profileLevel').textContent=getLevel();$('#profileLevelFill').style.width=`${Math.round(levelProgress()*100)}%`;$('#profileXpText').textContent=`${state.xp} XP`;const metrics=[['JUZGADOS',state.judged],['RACHA',`🔥 ${state.streak}`],['MIS ZANJAS',state.created],['VERIFICADAS',state.verifiedCount]];$('#metricGrid').innerHTML=metrics.map(([a,b])=>`<div class="metric-card"><strong>${b}</strong><span>${a}</span></div>`).join('');const total=Math.max(1,state.judged),pc={a:Math.round(state.choiceCounts.a/total*100),both:Math.round(state.choiceCounts.both/total*100)};pc.b=state.judged?100-pc.a-pc.both:0;$('#criterionBars').innerHTML=[['A',pc.a,'var(--cyan)'],['AMBOS',pc.both,'var(--signal)'],['B',pc.b,'var(--coral)']].map(([l,p,c])=>`<div class="criterion-bar" style="--pct:${p}%;--color:${c}"><span>${l}</span><b>${p}%</b></div>`).join('');let label='Aún estamos conociéndote';if(state.judged>=20){if(agree<45)label='Tiendes a ir a contracorriente';else if(agree>72)label='Lees bastante bien al jurado';else if(pc.both>22)label='Buscas mucho el punto medio';else label='Tienes criterio propio'}$('#criterionLabel').textContent=label;checkAchievements();const featured=ACHIEVEMENTS.slice(0,3).map(a=>achievementMini(a));$('#achievementStrip').innerHTML=featured.join('');$('#historyJudged').textContent=state.judged;$('#historyCreated').textContent=state.created;$('#historyVerified').textContent=state.verifiedCount}
  const MEDAL_IDS=new Set(['jury50','jury500','long','firm','jury100']);
  function achievementMini(a){const u=state.unlocked.includes(a.id);return `<button class="achievement-mini ${u?'':'is-locked'}" data-ach="${a.id}" type="button"><i class="${MEDAL_IDS.has(a.id)?'is-medal':''}">${a.icon}</i><b>${a.name}</b><span>${u?'DESBLOQUEADO':'BLOQUEADO'}</span></button>`}
  function renderAchievements(){checkAchievements();$('#achievementGrid').innerHTML=ACHIEVEMENTS.map(a=>{const u=state.unlocked.includes(a.id);return `<article class="achievement-card ${u?'':'is-locked'}"><i class="${MEDAL_IDS.has(a.id)?'is-medal':''}">${a.icon}</i><b>${a.name}</b><p>${a.desc}</p><span>${u?'DESBLOQUEADO':'AÚN NO'}</span></article>`}).join('')}

  /* ---------------- Shared interactions ---------------- */
  function bindVoteButtons(cb){$$('.vote-button',els.playStage).forEach(b=>b.addEventListener('click',()=>{sound('tap');cb(b.dataset.vote)}))}
  function openShare(title,text,payload){$('#shareTitle').textContent=title;const url=payload?`${location.origin}${location.pathname}?z=${encodePayload(payload)}`:`${location.origin}${location.pathname}`;$('#shareBody').innerHTML=`<div class="share-preview"><p>${escapeHtml(text)}</p><div class="share-url">${escapeHtml(url)}</div></div><div class="share-actions"><button class="action action--primary action--xl" id="shareNative">COMPARTIR →</button><button class="action action--secondary action--lg" id="shareCopy">COPIAR ENLACE</button></div>`;els.share.showModal();$('#shareNative').onclick=async()=>{if(navigator.share){try{await navigator.share({title:'ZANJA',text,url})}catch{}}else copyText(url)};$('#shareCopy').onclick=()=>copyText(url)}
  async function copyText(t){try{await navigator.clipboard.writeText(t);toast('ENLACE COPIADO')}catch{toast('COPIA EL ENLACE MANUALMENTE')}}
  function toggleSound(){state.sound=!state.sound;save();toast(state.sound?'SONIDO ACTIVADO':'SONIDO SILENCIADO');updateSoundButtons()}
  function updateSoundButtons(){$$('.icon-button--sound').forEach(b=>b.style.opacity=state.sound?'1':'.5')}

  /* ---------------- bindings ---------------- */
  function bind(){
    $('#onboardingStart').onclick=()=>{state.onboarded=true;save();startArena(true)};$('#onboardingSkip').onclick=()=>{state.onboarded=true;save();showScreen('home')};
    $$('[data-mode]').forEach(b=>b.onclick=()=>openMode(b.dataset.mode));$('#dailyCaseCard').onclick=startDaily;$('#dailyGoal').onclick=()=>openMode('arena');
    $('#playBack').onclick=()=>{clearCountdown();showScreen('home')};$('#soundToggle').onclick=toggleSound;$('#activitySoundToggle').onclick=toggleSound;$('#profileSoundToggle').onclick=toggleSound;
    $$('[data-nav]').forEach(b=>b.onclick=()=>showScreen(b.dataset.nav,{nav:b.dataset.nav}));$('#activityShortcut').onclick=()=>showScreen('activity',{nav:'activity'});$('#profileShortcut').onclick=()=>showScreen('profile',{nav:'profile'});
    $('#createClose').onclick=()=>showScreen('home');$('#createBack').onclick=()=>{if(createPublished){createPublished=false;createStep=3;renderCreate()}else if(createStep>0){createStep--;renderCreate()}else showScreen('home')};
    $('#viewAllAchievements').onclick=()=>showScreen('achievements',{nav:'profile'});$('#achievementsBack').onclick=()=>showScreen('profile',{nav:'profile'});
    $('#shareClose').onclick=()=>els.share.close();els.share.addEventListener('click',e=>{if(e.target===els.share)els.share.close()});
    $$('.history-actions button').forEach(b=>b.onclick=()=>{const h=b.dataset.history;if(h==='created')showScreen('mine',{nav:'profile'});else if(h==='verified')showScreen('verify',{nav:'profile'});else startArena()});
    $('#mineBack').onclick=()=>showScreen('home');$('#verifyBack').onclick=()=>showScreen('home');$('#weeklyBack').onclick=()=>showScreen('home');
    $('#mineCreate').onclick=openCreate;
    $('#reportClose').onclick=()=>els.report.close();els.report.addEventListener('click',e=>{if(e.target===els.report)els.report.close()});
    $('#photoClose').onclick=()=>els.photo.close();els.photo.addEventListener('click',e=>{if(e.target===els.photo)els.photo.close()});
    $('#photoInput').onchange=async e=>{
      const f=e.target.files&&e.target.files[0];e.target.value='';
      if(!f)return;
      keepStoryDraft();
      try{draft.photo=await downscaleImage(f);sound('pickup');haptic(10);toast('PRUEBA AÑADIDA');renderCreate()}
      catch{toast('NO SE PUDO LEER LA IMAGEN')}
    };
    document.addEventListener('pointerdown',()=>audio.unlock(),{once:true});
  }

  function applySharedPayload(data){
    if(!data||typeof data!=='object')return false;
    if(data.t==='case'){
      const q=String(data.q||'').trim(),a=(Array.isArray(data.a)?data.a:[]).filter(Boolean),b=(Array.isArray(data.b)?data.b:[]).filter(Boolean);
      if(!q||!a.length||!b.length)return false;
      const c={id:'shared-'+Date.now(),tag:String(data.tag||'ZANJA COMPARTIDA').slice(0,24),q,a,b,counts:{a:9,both:3,b:8},custom:true};
      state.onboarded=true;save();currentMode='shared';currentQueue=[c];currentIndex=0;
      els.playMode.textContent='CASO COMPARTIDO';els.playProgress.innerHTML='';
      showScreen('play',{nav:'home'});renderArenaCase(c);
      return true;
    }
    if(data.t==='invite'){
      const q=String(data.q||'').trim();if(!q)return false;
      const a=(Array.isArray(data.a)?data.a:['','','']);
      state.onboarded=true;save();draft=freshDraft();
      draft.question=q;draft.tag=String(data.tag||'ZANJA COMPARTIDA').slice(0,24);draft.a=a;
      const stored=data.k&&state.invites[data.k];
      draft.photo=stored?stored.photo:null;
      draft.photoPromised=!!data.ph&&!draft.photo;
      draft.bReady=true;draft.b=['','',''];draft.inviteMode=true;
      createStep=2;createPublished=false;
      showScreen('create',{nav:'home'});renderCreate();
      return true;
    }
    return false;
  }
  function tryConsumeSharedLink(){
    const z=new URLSearchParams(location.search).get('z');
    if(!z)return false;
    history.replaceState(null,'',location.pathname);
    const ok=applySharedPayload(decodePayload(z));
    if(!ok)toast('ENLACE NO VÁLIDO O CADUCADO');
    return ok;
  }
  function init(){seedActivities();seedVerifyQueue();ensureWeekly();bind();updateSoundButtons();const consumed=tryConsumeSharedLink();if(!consumed){if(state.onboarded)showScreen('home');else showScreen('onboarding')}updateHome();checkAchievements()}
  init();
})();
