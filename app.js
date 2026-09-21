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
    {id:'radar',icon:'◎',name:'RADAR SOCIAL',desc:'Encadena 5 aciertos en Pulso.',test:s=>s.pulseMaxCombo>=5},
    {id:'oracle',icon:'7',name:'TE LEO',desc:'Consigue 7/7 en un Pulso.',test:s=>s.pulseBest>=7},
    {id:'creator',icon:'+',name:'ZANJADOR',desc:'Publica tu primer caso.',test:s=>s.created>=1},
    {id:'jury100',icon:'100',name:'EL JURADO HA HABLADO',desc:'Crea un caso que alcance 100 votos.',test:s=>s.createdVotePeak>=100},
    {id:'close',icon:'%',name:'SE HA LIADO',desc:'Participa en un caso cerrado por menos de 3 puntos.',test:s=>s.closeCalls>=1},
    {id:'twins',icon:'7/7',name:'DOS GOTAS',desc:'Coincide 7/7 en un Choque.',test:s=>s.clashPerfect>=1},
    {id:'train',icon:'0/7',name:'CHOQUE DE TRENES',desc:'No coincidas en ningún caso de un Choque.',test:s=>s.clashZero>=1}
  ];

  const DEFAULT_STATE={
    onboarded:false,sound:true,haptics:true,xp:0,streak:0,lastActiveDate:null,daily:{date:todayKey(),arenaVotes:0,done:false},
    judged:0,majorityMatches:0,choiceCounts:{a:0,both:0,b:0},votes:{},customCases:[],created:0,createdVotePeak:0,closeCalls:0,
    pulseBest:0,pulsePlayed:0,pulseCorrect:0,pulseMaxCombo:0,clashes:0,clashPerfect:0,clashZero:0,
    unlocked:[],activities:[],unread:3,clashHistory:[]
  };
  const STORAGE='zanja-beta-07';
  let state=loadState();

  let currentMode=null,currentCase=null,currentQueue=[],currentIndex=0,transitionBusy=false;
  let pulse={score:0,correct:0,combo:0,maxCombo:0};
  let clash={name:'Lucía',votes:[],otherVotes:[],queue:[]};
  let createStep=0,createPublished=false;
  let draft=freshDraft();
  let countdownTimer=null,countdownInterval=null;

  const screens={
    onboarding:$('#onboardingScreen'),home:$('#homeScreen'),play:$('#playScreen'),clashSetup:$('#clashSetupScreen'),create:$('#createScreen'),activity:$('#activityScreen'),profile:$('#profileScreen'),achievements:$('#achievementsScreen')
  };
  const els={bottom:$('#bottomNav'),playStage:$('#playStage'),playMode:$('#playModeLabel'),playProgress:$('#playProgress'),wash:$('#ambientWash'),toast:$('#toast'),share:$('#shareSheet')};

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
  function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch{}}
  function freshDraft(){return {story:'',question:'',tag:'TU ZANJA',a:['','',''],b:['','',''],bReady:false,inviteMode:false,audience:'public',duration:'1 h'};}
  function ratio(a,b){return b? a/b:0}
  function getLevel(){return Math.floor(state.xp/150)+1}
  function levelProgress(){return (state.xp%150)/150}
  function allCases(){return [...state.customCases,...CASES]}
  function getWinner(counts){return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0]}
  function percentage(counts){const t=counts.a+counts.b+counts.both;const a=Math.round(counts.a/t*100),both=Math.round(counts.both/t*100);return {a,both,b:100-a-both,total:t}}
  function dailyCase(){const idx=Math.floor(new Date().setHours(0,0,0,0)/86400000)%CASES.length;return CASES[idx]}

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
    if(name==='home')updateHome();if(name==='activity')renderActivity();if(name==='profile')renderProfile();if(name==='achievements')renderAchievements();
  }
  function toast(msg){els.toast.textContent=msg;els.toast.classList.add('is-visible');clearTimeout(toast.t);toast.t=setTimeout(()=>els.toast.classList.remove('is-visible'),1800)}
  function clearCountdown(){if(countdownTimer)clearTimeout(countdownTimer);if(countdownInterval)clearInterval(countdownInterval);countdownTimer=countdownInterval=null}

  function updateHome(){
    $('#homeStreak').textContent=state.streak;$('#homeLevel').textContent=getLevel();$('#pulseBest').textContent=state.pulsePlayed?`${state.pulseBest}/7`:'—';$('#createHomeStatus').textContent=state.created?`${state.created} casos creados`:'Crea tu primer caso';$('#clashHomeStatus').textContent=state.clashes?`${state.clashes} Choques completados`:'Reta a un amigo';$('#arenaOpenCount').textContent=CASES.length+state.customCases.length;
    const d=dailyCase();$('#dailyQuestion').textContent=d.q;$('#dailyJuryCount').textContent=fmt.format(d.counts.a+d.counts.b+d.counts.both);
    const now=new Date(),end=new Date(now);end.setHours(24,0,0,0);const ms=end-now,h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000);$('#dailyCountdown').textContent=`CIERRA ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    const daily=state.daily;let txt='Haz una actividad',pct=0;if(daily.done){txt='Racha protegida ✓';pct=100}else if(daily.arenaVotes>0){txt=`Arena ${daily.arenaVotes}/5 votos`;pct=daily.arenaVotes/5*100}$('#dailyGoalText').textContent=txt;$('#dailyGoalFill').style.width=`${pct}%`;
    $('#activityBadge').textContent=state.unread;$('#activityBadge').style.display=state.unread?'grid':'none';
  }

  function addActivity(type,title,detail){state.activities.unshift({id:Date.now()+Math.random(),type,title,detail,at:Date.now()});state.activities=state.activities.slice(0,20);state.unread=Math.min(9,state.unread+1);save()}
  function markDaily(kind){
    if(state.daily.date!==todayKey())state.daily={date:todayKey(),arenaVotes:0,done:false};
    if(kind==='arena')state.daily.arenaVotes=Math.min(5,state.daily.arenaVotes+1);
    const qualifies=['pulse','clash','created','daily'].includes(kind)||state.daily.arenaVotes>=5;
    if(qualifies&&!state.daily.done){state.daily.done=true;const y=yesterdayKey();state.streak=state.lastActiveDate===y?state.streak+1:Math.max(1,state.streak);state.lastActiveDate=todayKey();addActivity('streak','Racha protegida',`🔥 ${state.streak} días seguidos en ZANJA`)}
    save();updateHome();
  }
  function addXp(n){state.xp+=n;save()}
  function checkAchievements(){
    const before=new Set(state.unlocked);for(const a of ACHIEVEMENTS){if(!before.has(a.id)&&a.test(state)){state.unlocked.push(a.id);addActivity('achievement',`Logro: ${a.name}`,a.desc);setTimeout(()=>{sound('unlock');toast(`LOGRO DESBLOQUEADO · ${a.name}`)},150)}}save();
  }

  function openMode(mode){
    sound('open');haptic(8);clearCountdown();clearWash();
    if(mode==='arena')startArena();else if(mode==='pulse')startPulse();else if(mode==='clash')showScreen('clashSetup',{nav:'home'});else if(mode==='create')openCreate();
  }

  /* ---------------- ARENA / DAILY ---------------- */
  function startArena(tutorial=false){
    currentMode=tutorial?'tutorial':'arena';currentQueue=shuffle(allCases().filter(c=>!state.votes[c.id]));if(currentQueue.length<6)currentQueue=shuffle(allCases());currentIndex=0;els.playMode.textContent=tutorial?'PRIMER ZANJA':'ARENA LIVE';els.playProgress.innerHTML='';showScreen('play',{nav:'home'});renderArenaCase(currentQueue[0],tutorial);
  }
  function startDaily(){currentMode='daily';currentQueue=[dailyCase()];currentIndex=0;els.playMode.textContent='CASO DEL DÍA';els.playProgress.innerHTML='<i class="is-current"></i>';showScreen('play',{nav:'home'});renderArenaCase(currentQueue[0],false,true)}
  function renderArenaCase(c,tutorial=false,daily=false){
    clearCountdown();currentCase=c;transitionBusy=false;clearWash();const existing=state.votes[c.id];
    els.playStage.innerHTML=`<article class="case-shell">
      <header class="case-question"><div class="case-meta"><span class="case-tag">${escapeHtml(c.tag)}</span><span class="case-live"><i></i>${daily?'HOY':'VEREDICTO LIVE'}</span></div><h2>${escapeHtml(c.q)}</h2>${tutorial?'<div class="case-subline">Lee los dos bandos. Luego mantén el VS o toca una opción.</div>':''}</header>
      ${battlefieldMarkup(c,existing)}
      <section class="vote-zone" id="voteZone">${existing?arenaResultMarkup(c,existing.choice):voteMarkup(daily?'¿A QUIÉN DAS LA RAZÓN?':'¿A QUIÉN DAS LA RAZÓN?')}</section>
    </article>`;
    fitQuestionHeading($('.case-question h2',els.playStage));
    if(!existing){bindVoteButtons(choice=>commitArenaVote(choice));bindVs(choice=>commitArenaVote(choice))}else bindResultNext();
  }
  function fitQuestionHeading(h2){
    if(!h2)return;
    const shell=h2.closest('.case-shell,.clash-play-shell');
    h2.classList.remove('is-long','is-longer');
    if(!shell)return;
    const vs=shell.querySelector('.vs-control');
    const listA=shell.querySelector('.field--a .argument-list'),listB=shell.querySelector('.field--b .argument-list');
    if(!vs||!listA)return;
    const prevAnim=vs.style.animation;
    vs.style.animation='none';
    const fits=()=>{
      const vsBox=vs.getBoundingClientRect();
      const pad=6;
      const lastA=listA.lastElementChild,firstB=listB&&listB.firstElementChild;
      const aOk=!lastA||lastA.getBoundingClientRect().bottom<=vsBox.top-pad;
      const bOk=!firstB||firstB.getBoundingClientRect().top>=vsBox.bottom+pad;
      return aOk&&bOk;
    };
    const battlefield=shell.querySelector('.battlefield');
    if(battlefield)battlefield.classList.remove('is-tight');
    let guard=0;
    while(!fits()&&guard<3){h2.classList.add(guard===0?'is-long':guard===1?'is-longer':'is-longest');guard++}
    if(!fits()&&battlefield)battlefield.classList.add('is-tight');
    vs.style.animation=prevAnim;
  }
  function battlefieldMarkup(c,locked=false){
    return `<div class="battlefield">
      ${fieldMarkup('a',c.a)}${fieldMarkup('b',c.b)}
      <div class="vs-rail" id="vsRail"><div class="drag-hints"><span class="drag-hint drag-hint--a">A ↑</span><span class="drag-hint drag-hint--b">B ↓</span><span class="drag-hint drag-hint--l">← AMBOS</span><span class="drag-hint drag-hint--r">AMBOS →</span></div><span class="drag-label" id="dragLabel">ELIGE</span><button class="vs-control ${locked?'is-locked':''}" id="vsControl" type="button" ${locked?'disabled':''}><span>VS</span></button></div>
    </div>`
  }
  function fieldMarkup(side,args){return `<section class="field field--${side}" data-side="${side}" style="--side-color:${side==='a'?'var(--cyan)':'var(--coral)'}"><span class="field-ghost">${side.toUpperCase()}</span><div class="field-content"><div class="side-badge">${side.toUpperCase()}</div><div class="side-copy"><span class="side-label">BANDO ${side.toUpperCase()}</span><ul class="argument-list">${args.slice(0,3).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div></div></section>`}
  function voteMarkup(prompt='¿A QUIÉN DAS LA RAZÓN?'){return `<div class="vote-question">${prompt}</div><div class="vote-buttons"><button class="vote-button vote-button--a" data-vote="a" type="button"><span>A</span></button><button class="vote-button vote-button--both" data-vote="both" type="button"><span>AMBOS</span></button><button class="vote-button vote-button--b" data-vote="b" type="button"><span>B</span></button></div><div class="vote-helper"><b>MANTÉN EL VS</b> Y ARRASTRA · O TOCA UNA OPCIÓN</div>`}
  function arenaResultMarkup(c,choice){const counts={...c.counts};counts[choice]=(counts[choice]||0)+1;const p=percentage(counts),winner=getWinner(counts);let title=choice===winner?'ESTÁS CON LA MAYORÍA':'EL JURADO VA POR OTRO LADO';const sorted=Object.entries(counts).sort((a,b)=>b[1]-a[1]);if((sorted[0][1]-sorted[1][1])/p.total<.04)title='PARTIDO EN DOS';const label=currentMode==='daily'?'VOLVER AL INICIO':'SIGUIENTE CASO';return `<div class="result-panel"><div class="result-head"><strong>${title}</strong><span>RESULTADO AHORA</span></div><div class="result-bars">${resultBar('A',p.a,'var(--cyan)',choice==='a')}${resultBar('AMBOS',p.both,'var(--signal)',choice==='both')}${resultBar('B',p.b,'var(--coral)',choice==='b')}</div><button class="result-next result-next--arena" id="resultNext" type="button" data-label="${label}"><b id="resultCountdown">${label} · 5s</b><span class="countdown-track"><i></i></span></button></div>`}
  function resultBar(label,pct,color,selected){return `<div class="result-bar ${selected?'is-selected':''}" style="--pct:${pct}%;--bar:${color}"><span>${label}</span><strong>${pct}%</strong></div>`}
  function commitArenaVote(choice){
    if(!currentCase||transitionBusy||state.votes[currentCase.id])return;const counts={...currentCase.counts};counts[choice]++;const winner=getWinner(counts);state.votes[currentCase.id]={choice,at:Date.now()};state.judged++;state.choiceCounts[choice]++;if(choice===winner)state.majorityMatches++;addXp(currentMode==='daily'?15:5);if(currentMode==='daily')markDaily('daily');else markDaily('arena');save();checkAchievements();sound('vote',choice);haptic([12,15,20]);setWash(choice,.18);const z=$('#voteZone');z.innerHTML=arenaResultMarkup(currentCase,choice);$('#vsControl')?.classList.add('is-locked');setTimeout(()=>{sound('reveal');setWash(choice,.06)},150);bindResultNext();
  }
  function bindResultNext(){
    const btn=$('#resultNext');if(!btn)return;clearCountdown();let r=5;const label=btn.dataset.label||'SIGUIENTE';const out=$('#resultCountdown');const go=()=>{clearCountdown();advanceArena()};btn.addEventListener('click',go);countdownInterval=setInterval(()=>{r=Math.max(0,r-1);if(out)out.textContent=`${label} · ${r}s`},1000);countdownTimer=setTimeout(go,5000)
  }
  function advanceArena(){
    clearCountdown();if(transitionBusy)return;transitionBusy=true;$('.case-shell',els.playStage)?.classList.add('is-leaving');sound('whoosh');haptic(6);setTimeout(()=>{clearWash();if(currentMode==='daily'){showScreen('home');return}if(currentMode==='tutorial'){state.onboarded=true;save();showScreen('home');toast('YA SABES USAR ZANJA');return}currentIndex++;if(currentIndex>=currentQueue.length){currentQueue=shuffle(allCases());currentIndex=0}renderArenaCase(currentQueue[currentIndex])},330)
  }

  /* ---------------- PULSO ---------------- */
  function startPulse(){
    currentMode='pulse';currentQueue=shuffle(allCases()).slice(0,7);currentIndex=0;pulse={score:0,correct:0,combo:0,maxCombo:0};els.playMode.textContent='PULSO · LEE AL JURADO';showScreen('play',{nav:'home'});renderPlayDots(7,0);renderPulseCase()
  }
  function renderPlayDots(n,idx){els.playProgress.innerHTML=Array.from({length:n},(_,i)=>`<i class="${i<idx?'is-done':i===idx?'is-current':''}"></i>`).join('')}
  function renderPulseCase(){
    clearCountdown();currentCase=currentQueue[currentIndex];transitionBusy=false;const c=currentCase;
    els.playStage.innerHTML=`<article class="pulse-shell"><section class="pulse-hud"><div><span>PUNTOS</span><b>${pulse.score}</b></div><div class="pulse-hud__combo"><span>COMBO</span><b>×${pulse.combo}</b></div></section><div class="pulse-radar" style="--pulse-progress:${currentIndex/7*100}%"><i></i></div><section class="pulse-prompt"><span>¿QUÉ VOTARÁ EL JURADO?</span><h2>${escapeHtml(c.q)}</h2></section><section class="pulse-options"><button class="pulse-option pulse-option--a" data-pulse="a"><b>A · BANDO A</b><p>${escapeHtml(c.a[0])}</p></button><button class="pulse-option pulse-option--both" data-pulse="both"><b>AMBOS</b><p>El jurado puede decidir que los dos tienen parte de razón.</p></button><button class="pulse-option pulse-option--b" data-pulse="b"><b>B · BANDO B</b><p>${escapeHtml(c.b[0])}</p></button></section><section class="pulse-question-bottom"><span>NO VOTES LO QUE PIENSAS TÚ · PREDICE A LA GENTE</span><div class="pulse-answer-buttons"><button class="vote-button vote-button--a" data-pulse="a"><span>A</span></button><button class="vote-button vote-button--both" data-pulse="both"><span>AMBOS</span></button><button class="vote-button vote-button--b" data-pulse="b"><span>B</span></button></div></section></article>`;
    $$('[data-pulse]',els.playStage).forEach(b=>b.addEventListener('click',()=>commitPulse(b.dataset.pulse)))
  }
  function commitPulse(choice){if(transitionBusy)return;transitionBusy=true;const c=currentCase,winner=getWinner(c.counts),correct=choice===winner,p=percentage(c.counts);if(correct){pulse.correct++;pulse.combo++;pulse.maxCombo=Math.max(pulse.maxCombo,pulse.combo);pulse.score+=100+(pulse.combo-1)*20;sound('correct');haptic([10,15,18])}else{pulse.combo=0;sound('wrong');haptic(8)}
    els.playStage.innerHTML=`<article class="pulse-shell"><section class="pulse-hud"><div><span>PUNTOS</span><b>${pulse.score}</b></div><div class="pulse-hud__combo"><span>COMBO</span><b>×${pulse.combo}</b></div></section><div class="pulse-radar" style="--pulse-progress:${(currentIndex+1)/7*100}%"><i></i></div><section class="pulse-prompt"><span>EL JURADO HA RESPONDIDO</span><h2>${escapeHtml(c.q)}</h2></section><section class="pulse-reveal"><strong class="pulse-reveal__status ${correct?'is-correct':'is-wrong'}">${correct?'ACIERTO':'TE SORPRENDIÓ'}</strong><span class="pulse-reveal__score">La mayoría eligió <b>${winner==='both'?'AMBOS':winner.toUpperCase()}</b>${correct?` · COMBO ×${pulse.combo}`:''}</span><div class="result-bars">${resultBar('A',p.a,'var(--cyan)',winner==='a')}${resultBar('AMBOS',p.both,'var(--signal)',winner==='both')}${resultBar('B',p.b,'var(--coral)',winner==='b')}</div><button class="result-next" id="resultNext" data-label="${currentIndex===6?'VER RESULTADO':'SIGUIENTE'}"><b id="resultCountdown">${currentIndex===6?'VER RESULTADO':'SIGUIENTE'} · 5s</b><span class="countdown-track"><i></i></span></button></section></article>`;bindPulseNext()
  }
  function bindPulseNext(){const btn=$('#resultNext');let r=5;const label=btn.dataset.label,out=$('#resultCountdown');const go=()=>{clearCountdown();currentIndex++;if(currentIndex>=7)finishPulse();else{renderPlayDots(7,currentIndex);renderPulseCase()}};btn.addEventListener('click',go);countdownInterval=setInterval(()=>{r--;if(out)out.textContent=`${label} · ${Math.max(0,r)}s`},1000);countdownTimer=setTimeout(go,5000)}
  function finishPulse(){state.pulsePlayed++;state.pulseCorrect+=pulse.correct;state.pulseBest=Math.max(state.pulseBest,pulse.correct);state.pulseMaxCombo=Math.max(state.pulseMaxCombo,pulse.maxCombo);addXp(40+pulse.correct*10);markDaily('pulse');checkAchievements();addActivity('pulse','Pulso completado',`${pulse.correct}/7 predicciones · ${pulse.score} puntos`);sound('complete');haptic([12,25,18,25,26]);save();els.playProgress.innerHTML='';els.playStage.innerHTML=`<section class="clash-result-card"><span class="eyebrow">PULSO COMPLETADO</span><h2>¿QUÉ TAL LEES<br>AL JURADO?</h2><div class="clash-percent">${pulse.correct}/7</div><div class="clash-result-grid"><div><strong>${pulse.score}</strong><span>PUNTOS</span></div><div><strong>×${pulse.maxCombo}</strong><span>COMBO MÁXIMO</span></div></div><button class="action action--primary action--xl" id="pulseAgain">OTRO PULSO →</button><button class="action action--secondary action--lg" id="pulseArena">CAMBIAR A ARENA</button><button class="link-action" id="pulseHome">VOLVER AL INICIO</button></section>`;$('#pulseAgain').onclick=startPulse;$('#pulseArena').onclick=startArena;$('#pulseHome').onclick=()=>showScreen('home')}

  /* ---------------- CHOQUE ---------------- */
  function startClash(name='Lucía'){
    clash={name:name.trim()||'Invitado',queue:shuffle(allCases()).slice(0,7),votes:[],otherVotes:[]};clash.otherVotes=clash.queue.map((c,i)=>{const keys=['a','both','b'];const winner=getWinner(c.counts);return i%4===0?keys[(keys.indexOf(winner)+1)%3]:winner});currentMode='clash';currentIndex=0;els.playMode.textContent=`CHOQUE · ${clash.name.toUpperCase()}`;showScreen('play',{nav:'home'});renderPlayDots(7,0);renderClashCase()
  }
  function renderClashCase(){currentCase=clash.queue[currentIndex];transitionBusy=false;clearWash();els.playStage.innerHTML=`<article class="clash-play-shell"><section class="clash-scoreboard"><div class="clash-player"><i class="clash-avatar">TÚ</i><span>TÚ</span></div><b>VS</b><div class="clash-player"><span>${escapeHtml(clash.name)}</span><i class="clash-avatar">${escapeHtml(clash.name.slice(0,1).toUpperCase())}</i></div></section><div class="clash-lock">LAS RESPUESTAS SE REVELAN AL FINAL</div><header class="case-question"><div class="case-meta"><span class="case-tag">${escapeHtml(currentCase.tag)}</span><span class="case-live"><i></i>CHOQUE ${currentIndex+1}/7</span></div><h2>${escapeHtml(currentCase.q)}</h2></header>${battlefieldMarkup(currentCase,false)}<section class="vote-zone" id="voteZone">${voteMarkup('¿TÚ QUÉ PIENSAS?')}</section></article>`;fitQuestionHeading($('.case-question h2',els.playStage));bindVoteButtons(choice=>commitClash(choice));bindVs(choice=>commitClash(choice))}
  function commitClash(choice){if(transitionBusy)return;transitionBusy=true;clash.votes.push(choice);sound('vote',choice);haptic([10,12,16]);const zone=$('#voteZone');zone.innerHTML=`<div class="result-panel"><div class="result-head"><strong>RESPUESTA GUARDADA</strong><span>${clash.name.toUpperCase()} NO LA VE</span></div><button class="result-next" id="resultNext"><b>CASO BLOQUEADO ✓</b><span class="countdown-track"><i style="animation-duration:1.25s"></i></span></button></div>`;$('#vsControl')?.classList.add('is-locked');setTimeout(()=>{currentIndex++;if(currentIndex>=7)finishClash();else{renderPlayDots(7,currentIndex);renderClashCase()}},1250)}
  function finishClash(){const matches=clash.votes.filter((v,i)=>v===clash.otherVotes[i]).length;state.clashes++;if(matches===7)state.clashPerfect++;if(matches===0)state.clashZero++;state.clashHistory.unshift({name:clash.name,matches,at:Date.now()});state.clashHistory=state.clashHistory.slice(0,10);addXp(30);markDaily('clash');checkAchievements();addActivity('clash',`${clash.name} terminó vuestro Choque`,`${matches}/7 coincidencias · ya podéis ver dónde chocasteis`);save();sound('complete');const firstDiff=clash.votes.findIndex((v,i)=>v!==clash.otherVotes[i]);const diff=firstDiff>=0?clash.queue[firstDiff]:null;els.playProgress.innerHTML='';els.playStage.innerHTML=`<section class="clash-result-card"><span class="eyebrow">CHOQUE TERMINADO</span><h2>TÚ × ${escapeHtml(clash.name.toUpperCase())}</h2><div class="clash-percent">${Math.round(matches/7*100)}%</div><span style="color:#AEB6D5;font-size:11px;font-weight:800">DE ACUERDO</span><div class="clash-result-grid"><div><strong>${matches}</strong><span>COINCIDENCIAS</span></div><div><strong>${7-matches}</strong><span>CHOQUES</span></div></div>${diff?`<div class="clash-disagreement"><span>VUESTRO MAYOR DESACUERDO</span><b>${escapeHtml(diff.q)}</b><div><i>TÚ · ${clash.votes[firstDiff]==='both'?'AMBOS':clash.votes[firstDiff].toUpperCase()}</i><i>${escapeHtml(clash.name)} · ${clash.otherVotes[firstDiff]==='both'?'AMBOS':clash.otherVotes[firstDiff].toUpperCase()}</i></div></div>`:''}<button class="action action--clash action--xl" id="clashRematch">REVANCHA →</button><button class="action action--secondary action--lg" id="clashShare">COMPARTIR RESULTADO</button><button class="link-action" id="clashHome">VOLVER AL INICIO</button></section>`;$('#clashRematch').onclick=()=>startClash(clash.name);$('#clashShare').onclick=()=>openShare('CHOQUE','Juega mis mismos 7 casos y descubre cuánto coincidimos.',{t:'clash',name:myName(),ids:clash.queue.map(c=>c.id),votes:clash.votes});$('#clashHome').onclick=()=>showScreen('home')}

  /* ---------------- ZANJAR ---------------- */
  function openCreate(){createStep=0;createPublished=false;draft=freshDraft();showScreen('create',{nav:'home'});renderCreate()}
  function renderCreate(){
    const bars=$$('#createProgress i');bars.forEach((b,i)=>{b.classList.toggle('is-active',i===Math.min(createStep,3));b.classList.toggle('is-done',i<createStep)});
    const body=$('#createBody');
    body.classList.toggle('is-compact',createPublished||createStep===0||(createStep===2&&!draft.bReady));
    if(createPublished){body.innerHTML=`<section class="create-step"><div class="published-card"><div class="published-card__mark">✓</div><span class="eyebrow">CASO PUBLICADO</span><h2>YA ESTÁ EN<br>EL JURADO.</h2><p>${escapeHtml(draft.question)}</p></div><div class="create-actions"><button class="action action--primary action--xl" id="publishedArena">VER EN ARENA →</button><button class="action action--secondary action--lg" id="publishedShare">COMPARTIR CON AMIGOS</button><button class="link-action" id="publishedHome">VOLVER AL INICIO</button></div></section>`;$('#publishedArena').onclick=startArena;$('#publishedShare').onclick=()=>openShare('TU ZANJA',draft.question,{t:'case',tag:draft.tag||'TU ZANJA',q:draft.question,a:draft.a.filter(Boolean),b:draft.b.filter(Boolean)});$('#publishedHome').onclick=()=>showScreen('home');return}
    if(createStep===0){body.innerHTML=`<section class="create-step"><span class="eyebrow">PASO 1 · CUÉNTALO</span><h1>¿QUÉ HA<br>PASADO?</h1><p>No pienses en redactarlo perfecto. Cuéntalo como te salga y ZANJA lo ordena.</p><textarea class="text-area" id="storyInput" maxlength="650" placeholder="Ej.: Mi compañero dice que si avisa 10 minutos antes, llegar 20 minutos tarde ya no cuenta como llegar tarde…">${escapeHtml(draft.story)}</textarea><div class="create-tools"><button class="tool-button" id="dictateBtn" type="button">🎙 DICTAR</button><button class="tool-button" id="evidenceBtn" type="button">📷 AÑADIR PRUEBA</button></div><button class="action action--primary action--xl" id="createNext">ORDENAR MI CASO →</button></section>`;$('#createNext').onclick=()=>{draft.story=$('#storyInput').value.trim();if(draft.story.length<12){toast('CUÉNTAME UN POCO MÁS');return}autoBuildDraft();createStep=1;renderCreate()};$('#dictateBtn').onclick=()=>toast('DICTADO · LISTO PARA CONECTAR EN APP NATIVA');$('#evidenceBtn').onclick=()=>toast('PRUEBAS · SE AÑADIRÁN EN BACKEND BETA')}
    else if(createStep===1){body.innerHTML=`<section class="create-step"><span class="eyebrow">PASO 2 · TU DEFENSA</span><h1>ASÍ LO VERÁ<br>EL JURADO.</h1><p>Edita lo que haga falta. El caso debe entenderse en pocos segundos.</p><div class="case-builder"><div class="builder-question"><label>PREGUNTA</label><textarea id="draftQuestion">${escapeHtml(draft.question)}</textarea></div><div class="builder-side"><div class="builder-side__head"><strong>BANDO A</strong><span>TU POSICIÓN</span></div>${draft.a.map((x,i)=>`<input class="argument-input" data-a="${i}" value="${escapeHtml(x)}" placeholder="Argumento ${i+1}" />`).join('')}</div></div><button class="action action--primary action--xl" id="createNext">ESTA ES MI DEFENSA →</button></section>`;$('#createNext').onclick=()=>{draft.question=$('#draftQuestion').value.trim();draft.a=$$('[data-a]').map(i=>i.value.trim()).filter(Boolean).slice(0,3);while(draft.a.length<3)draft.a.push('');if(!draft.question||!draft.a[0]){toast('FALTA LA PREGUNTA O TU DEFENSA');return}createStep=2;renderCreate()}}
    else if(createStep===2){const bWritten=draft.b.some(Boolean);body.innerHTML=draft.bReady?`<section class="create-step"><span class="eyebrow">PASO 3 · BANDO B</span><h1>${bWritten?'EL OTRO LADO<br>YA ESTÁ LISTO.':'AHORA ESCRIBE<br>TU DEFENSA.'}</h1><div class="builder-question"><label>SOBRE QUÉ VOTA EL JURADO</label><textarea readonly>${escapeHtml(draft.question)}</textarea></div><div class="builder-side builder-side--b"><div class="builder-side__head"><strong>BANDO B</strong><span>SU DEFENSA</span></div>${draft.b.map((x,i)=>`<input class="argument-input" data-b="${i}" value="${escapeHtml(x)}" placeholder="Argumento ${i+1}" />`).join('')}</div><div class="info-box">A y B se han escrito <b>sin ver la defensa del otro</b>. El caso ya puede abrirse al jurado.</div><button class="action action--primary action--xl" id="createNext">${draft.inviteMode?'LISTO · GENERAR ENLACE →':'PREPARAR PUBLICACIÓN →'}</button></section>`:`<section class="create-step"><span class="eyebrow">PASO 3 · FALTA EL OTRO LADO</span><h1>AHORA LE TOCA<br>A B.</h1><p>B debe escribir su defensa sin ver la tuya. Así reducimos respuestas estratégicas.</p><div class="invite-hero"><b>VS</b></div><div class="create-actions"><button class="action action--primary action--xl" id="inviteB">ENVIAR INVITACIÓN →</button><button class="action action--secondary action--lg" id="localB">RESPONDER COMO B AQUÍ · BETA</button></div><div class="info-box"><b>B recibe un enlace y responde sin instalar nada.</b> Al terminar, le genera otro enlace para devolvértelo.</div></section>`;
      if(draft.bReady){
        if(draft.inviteMode){$('#createNext').onclick=()=>{draft.b=$$('[data-b]').map(i=>i.value.trim()).filter(Boolean).slice(0,3);if(!draft.b.length){toast('ESCRIBE AL MENOS UN ARGUMENTO');return}const id='shared-'+Date.now(),c={id,tag:draft.tag||'ZANJA COMPARTIDA',q:draft.question,a:draft.a.filter(Boolean),b:draft.b,counts:{a:9,both:3,b:8},custom:true};state.customCases.unshift(c);save();openShare('CASO COMPLETO','Ya escribí mi defensa. Puedes votarlo o mandárselo a quien te retó.',{t:'case',tag:c.tag,q:c.q,a:c.a,b:c.b})}}
        else{$('#createNext').onclick=()=>{draft.b=$$('[data-b]').map(i=>i.value.trim()).slice(0,3);createStep=3;renderCreate()}}
      }else{
        $('#inviteB').onclick=()=>openShare('INVITACIÓN A B',`Te han invitado a defender el Bando B en: ${draft.question}`,{t:'invite',tag:draft.tag,q:draft.question,a:draft.a});
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
  function publishDraft(){const id='custom-'+Date.now();const c={id,tag:draft.tag||'TU ZANJA',q:draft.question,a:draft.a.filter(Boolean),b:draft.b.filter(Boolean),counts:{a:7,both:2,b:6},custom:true};state.customCases.unshift(c);state.created++;state.createdVotePeak=Math.max(state.createdVotePeak,15);addXp(40);markDaily('created');addActivity('created','Tu ZANJA ya está en el jurado',`${draft.duration} · ${draft.audience==='public'?'jurado público':'solo con enlace'}`);checkAchievements();sound('zanjar');haptic([14,25,28]);createPublished=true;save();renderCreate()}

  /* ---------------- Activity / Profile ---------------- */
  function seedActivities(){if(state.activities.length)return;state.activities=[{id:1,type:'closed',title:'Un caso que juzgaste ha sido ZANJADO',detail:'“¿Puedes ver solo una serie?” · B gana 72%',at:Date.now()-1800000},{id:2,type:'clash',title:'Lucía te ha retado a un Choque',detail:'7 casos · todavía no has respondido',at:Date.now()-7200000},{id:3,type:'b',title:'Bando B ha respondido',detail:'Tu caso ya puede abrirse al jurado',at:Date.now()-86400000}];save()}
  function renderActivity(){seedActivities();state.unread=0;save();updateHome();const list=$('#activityList');list.innerHTML=state.activities.map(x=>`<article class="activity-item"><div class="activity-icon activity-icon--${x.type}">${x.type==='closed'?'✓':x.type==='clash'?'×':x.type==='achievement'?'✦':x.type==='streak'?'🔥':x.type==='pulse'?'◎':x.type==='created'?'+':'B'}</div><div class="activity-copy"><b>${escapeHtml(x.title)}</b><span>${escapeHtml(x.detail)}</span></div><button data-activity="${x.type}">VER →</button></article>`).join('');$$('[data-activity]',list).forEach(b=>b.onclick=()=>{if(b.dataset.activity==='clash')showScreen('clashSetup');else if(b.dataset.activity==='created'||b.dataset.activity==='closed')startArena();else toast('ACTIVIDAD REVISADA')})}
  function renderProfile(){const agree=state.judged?Math.round(state.majorityMatches/state.judged*100):null;$('#profileAgreement').textContent=agree==null?'—':`${agree}%`;$('#profileLevel').textContent=getLevel();$('#profileLevelFill').style.width=`${Math.round(levelProgress()*100)}%`;$('#profileXpText').textContent=`${state.xp} XP`;const metrics=[['CASOS',state.judged],['RACHA',`🔥 ${state.streak}`],['PULSOS',state.pulsePlayed],['CHOQUES',state.clashes]];$('#metricGrid').innerHTML=metrics.map(([a,b])=>`<div class="metric-card"><strong>${b}</strong><span>${a}</span></div>`).join('');const total=Math.max(1,state.judged),pc={a:Math.round(state.choiceCounts.a/total*100),both:Math.round(state.choiceCounts.both/total*100)};pc.b=state.judged?100-pc.a-pc.both:0;$('#criterionBars').innerHTML=[['A',pc.a,'var(--cyan)'],['AMBOS',pc.both,'var(--signal)'],['B',pc.b,'var(--coral)']].map(([l,p,c])=>`<div class="criterion-bar" style="--pct:${p}%;--color:${c}"><span>${l}</span><b>${p}%</b></div>`).join('');let label='Aún estamos conociéndote';if(state.judged>=20){if(agree<45)label='Tiendes a ir a contracorriente';else if(agree>72)label='Lees bastante bien al jurado';else if(pc.both>22)label='Buscas mucho el punto medio';else label='Tienes criterio propio'}$('#criterionLabel').textContent=label;checkAchievements();const featured=ACHIEVEMENTS.slice(0,3).map(a=>achievementMini(a));$('#achievementStrip').innerHTML=featured.join('');$('#historyJudged').textContent=state.judged;$('#historyCreated').textContent=state.created;$('#historyClashes').textContent=state.clashes}
  const MEDAL_IDS=new Set(['jury50','jury500','long','oracle','jury100']);
  function achievementMini(a){const u=state.unlocked.includes(a.id);return `<button class="achievement-mini ${u?'':'is-locked'}" data-ach="${a.id}" type="button"><i class="${MEDAL_IDS.has(a.id)?'is-medal':''}">${a.icon}</i><b>${a.name}</b><span>${u?'DESBLOQUEADO':'BLOQUEADO'}</span></button>`}
  function renderAchievements(){checkAchievements();$('#achievementGrid').innerHTML=ACHIEVEMENTS.map(a=>{const u=state.unlocked.includes(a.id);return `<article class="achievement-card ${u?'':'is-locked'}"><i class="${MEDAL_IDS.has(a.id)?'is-medal':''}">${a.icon}</i><b>${a.name}</b><p>${a.desc}</p><span>${u?'DESBLOQUEADO':'AÚN NO'}</span></article>`}).join('')}

  /* ---------------- Shared interactions ---------------- */
  function bindVoteButtons(cb){$$('.vote-button',els.playStage).forEach(b=>b.addEventListener('click',()=>{sound('tap');cb(b.dataset.vote)}))}
  function bindVs(cb){const vs=$('#vsControl'),rail=$('#vsRail'),shell=$('.case-shell',els.playStage)||$('.clash-play-shell',els.playStage),label=$('#dragLabel');if(!vs||!rail||!shell)return;let pid=null,sx=0,sy=0,target=null,last=null;const maxX=90,maxY=88;const choose=(dx,dy)=>{const ax=Math.abs(dx),ay=Math.abs(dy);if(ax<32&&ay<28)return null;if(ax>38&&ax>ay*.86)return'both';if(ay>34)return dy<0?'a':'b';return null};const reset=()=>{vs.style.transition='transform .22s var(--ease-spring)';vs.style.setProperty('--drag-x','0px');vs.style.setProperty('--drag-y','0px');setTimeout(()=>vs.style.transition='',230);rail.classList.remove('is-active');vs.classList.remove('is-dragging');shell.classList.remove('is-a-target','is-b-target','is-both-target');$$('.field',shell).forEach(x=>x.classList.remove('is-target','is-dimmed'));clearWash();if(label)label.textContent='ELIGE'};vs.onpointerdown=e=>{if(vs.disabled)return;audio.unlock();pid=e.pointerId;sx=e.clientX;sy=e.clientY;target=last=null;vs.setPointerCapture(pid);vs.classList.add('is-dragging');rail.classList.add('is-active');sound('pickup');haptic(9);e.preventDefault()};vs.onpointermove=e=>{if(e.pointerId!==pid)return;const dx=clamp(e.clientX-sx,-maxX,maxX),dy=clamp(e.clientY-sy,-maxY,maxY);vs.style.setProperty('--drag-x',`${dx}px`);vs.style.setProperty('--drag-y',`${dy}px`);target=choose(dx,dy);shell.classList.toggle('is-a-target',target==='a');shell.classList.toggle('is-b-target',target==='b');shell.classList.toggle('is-both-target',target==='both');const a=$('[data-side="a"]',shell),b=$('[data-side="b"]',shell);a?.classList.toggle('is-target',target==='a');b?.classList.toggle('is-target',target==='b');a?.classList.toggle('is-dimmed',target==='b');b?.classList.toggle('is-dimmed',target==='a');if(target){setWash(target,clamp(Math.max(Math.abs(dx)/maxX,Math.abs(dy)/maxY)*.2,0,.2));if(label)label.textContent=target==='both'?'VOTAS AMBOS':`VOTAS ${target.toUpperCase()}`}else{clearWash();if(label)label.textContent='ELIGE'}if(target&&target!==last){sound(target);haptic(11);last=target}};const finish=e=>{if(e.pointerId!==pid)return;try{vs.releasePointerCapture(pid)}catch{}pid=null;const t=target;reset();if(t)setTimeout(()=>cb(t),60)};vs.onpointerup=finish;vs.onpointercancel=finish}
  function openShare(title,text,payload){$('#shareTitle').textContent=title;const url=payload?`${location.origin}${location.pathname}?z=${encodePayload(payload)}`:`${location.origin}${location.pathname}`;$('#shareBody').innerHTML=`<div class="share-preview"><p>${escapeHtml(text)}</p><div class="share-url">${escapeHtml(url)}</div></div><div class="share-actions"><button class="action action--primary action--xl" id="shareNative">COMPARTIR →</button><button class="action action--secondary action--lg" id="shareCopy">COPIAR ENLACE</button></div>`;els.share.showModal();$('#shareNative').onclick=async()=>{if(navigator.share){try{await navigator.share({title:'ZANJA',text,url})}catch{}}else copyText(url)};$('#shareCopy').onclick=()=>copyText(url)}
  function myName(){if(!state.displayName){const n=(typeof prompt==='function')?prompt('¿Cómo te llamas? Lo verá quien reciba tu reto.'):null;state.displayName=(n&&n.trim())?n.trim().slice(0,20):'Alguien';save()}return state.displayName}
  async function copyText(t){try{await navigator.clipboard.writeText(t);toast('ENLACE COPIADO')}catch{toast('COPIA EL ENLACE MANUALMENTE')}}
  function toggleSound(){state.sound=!state.sound;save();toast(state.sound?'SONIDO ACTIVADO':'SONIDO SILENCIADO');updateSoundButtons()}
  function updateSoundButtons(){$$('.icon-button--sound').forEach(b=>b.style.opacity=state.sound?'1':'.5')}

  /* ---------------- bindings ---------------- */
  function bind(){
    $('#onboardingStart').onclick=()=>{state.onboarded=true;save();startArena(true)};$('#onboardingSkip').onclick=()=>{state.onboarded=true;save();showScreen('home')};
    $$('[data-mode]').forEach(b=>b.onclick=()=>openMode(b.dataset.mode));$('#dailyPlay').onclick=startDaily;$('#dailyCaseCard').onclick=e=>{if(e.target.closest('button'))return;startDaily()};
    $('#playBack').onclick=()=>{clearCountdown();showScreen('home')};$('#soundToggle').onclick=toggleSound;$('#activitySoundToggle').onclick=toggleSound;$('#profileSoundToggle').onclick=toggleSound;
    $$('[data-nav]').forEach(b=>b.onclick=()=>showScreen(b.dataset.nav,{nav:b.dataset.nav}));$('#activityShortcut').onclick=()=>showScreen('activity',{nav:'activity'});$('#profileShortcut').onclick=()=>showScreen('profile',{nav:'profile'});
    $('#startClash').onclick=()=>{const n=$('#clashName').value.trim();if(!n){toast('ESCRIBE EL NOMBRE DE LA OTRA PERSONA');return}startClash(n)};$('#demoClash').onclick=()=>startClash('Lucía');
    $('#createClose').onclick=()=>showScreen('home');$('#createBack').onclick=()=>{if(createPublished){createPublished=false;createStep=3;renderCreate()}else if(createStep>0){createStep--;renderCreate()}else showScreen('home')};
    $('#viewAllAchievements').onclick=()=>showScreen('achievements',{nav:'profile'});$('#achievementsBack').onclick=()=>showScreen('profile',{nav:'profile'});
    $('#shareClose').onclick=()=>els.share.close();els.share.addEventListener('click',e=>{if(e.target===els.share)els.share.close()});
    $$('.history-actions button').forEach(b=>b.onclick=()=>toast(b.dataset.history==='judged'?'HISTORIAL DE VOTOS · PRÓXIMA FASE':b.dataset.history==='created'?'TUS ZANJAS ESTÁN EN ARENA':'TUS CHOQUES SE GUARDAN AQUÍ'));
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
      draft.bReady=true;draft.b=['','',''];draft.inviteMode=true;
      createStep=2;createPublished=false;
      showScreen('create',{nav:'home'});renderCreate();
      return true;
    }
    if(data.t==='clash'){
      const ids=Array.isArray(data.ids)?data.ids:[],votes=Array.isArray(data.votes)?data.votes:[];
      const pool=allCases(),queue=ids.map(id=>pool.find(c=>c.id===id)).filter(Boolean);
      if(queue.length!==7||votes.length!==7)return false;
      state.onboarded=true;save();
      clash={name:String(data.name||'Alguien').slice(0,20)||'Alguien',queue,votes:[],otherVotes:votes.slice(0,7)};
      currentMode='clash';currentIndex=0;
      els.playMode.textContent=`CHOQUE · ${clash.name.toUpperCase()}`;
      showScreen('play',{nav:'home'});renderPlayDots(7,0);renderClashCase();
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
  function init(){seedActivities();bind();updateSoundButtons();const consumed=tryConsumeSharedLink();if(!consumed){if(state.onboarded)showScreen('home');else showScreen('onboarding')}updateHome();checkAchievements()}
  init();
})();
