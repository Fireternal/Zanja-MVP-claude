export const categories = ['Todas','Convivencia','Pareja','Amigos','Comida','Trabajo','Viajes'];
export const DEFENSE_MIN=12;
export const DEFENSE_MAX=160;
export function readDefenses(value:unknown):string[]{
 if(Array.isArray(value))return value.filter((x):x is string=>typeof x==='string');
 if(typeof value!=='string'||!value.trim())return [];
 try{const parsed:unknown=JSON.parse(value);if(Array.isArray(parsed))return parsed.filter((x):x is string=>typeof x==='string');}catch{}
 return [value]; // Preserve old authored text; never invent missing arguments.
}
export function validDefenses(value:unknown):value is [string,string,string]{
 return Array.isArray(value)&&value.length===3&&value.every(x=>typeof x==='string'&&x.trim().length>=DEFENSE_MIN&&x.trim().length<=DEFENSE_MAX)&&new Set(value.map(x=>x.trim().toLocaleLowerCase('es'))).size===3;
}
export function draftDefenses(value:unknown):[string,string,string]{const a=readDefenses(value);return[a[0]||'',a[1]||'',a[2]||''];}
export type Case={story?:string;audience?:'public'|'link';workflow?:number;duration?:number;id:string;tag:string;q:string;at:string;a:string[];bt:string;b:string[];emoji:string;editorial:number;owner?:string;created:number;closes:number;status:string;mine?:boolean;votedAt?:number;bilateral?:boolean;participant?:boolean;choice?:string|null;counts?:Record<string,number>|null;total?:number;invite?:string;reported?:boolean;needsDefenses?:boolean;evidenceUrl?:string|null;};
export const seeds:Case[] = [
{
  "id": "demo-diseno",
  "tag": "Trabajo",
  "q": "¿Hay que consultar al equipo antes de cambiar el diseño?",
  "at": "Bando A",
  "a": [
    "El diseño anterior tenía problemas de espacio.",
    "El cambio se podía probar sin perder la versión anterior.",
    "Quería enseñar una solución antes de discutirla."
  ],
  "bt": "Bando B",
  "b": [
    "El equipo ya había aprobado el diseño anterior.",
    "El cambio afecta al trabajo de otras personas.",
    "Una consulta breve habría evitado rehacer tareas."
  ],
  "emoji": "🎨",
  "editorial": 1,
  "created": 0,
  "closes": 0,
  "status": "open",
  "evidenceUrl": "/prueba-diseno.webp"
},
  {
    "id": "pizza",
    "tag": "Comida",
    "q": "¿La última porción es de quien la pide primero?",
    "at": "La vi primero",
    "a": [
      "Pregunté si alguien quería más.",
      "Nadie respondió cuando lo pregunté.",
      "No puedo esperar toda la noche."
    ],
    "bt": "Se comparte",
    "b": [
      "Estaba hablando y no pude responder.",
      "La pizza la hemos pagado entre los dos.",
      "Podemos cortar esa porción por la mitad."
    ],
    "emoji": "🍕",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "serie",
    "tag": "Pareja",
    "q": "¿Ver un capítulo sin tu pareja cuenta como traición?",
    "at": "No podía esperar",
    "a": [
      "Llevamos una semana sin encontrar un rato.",
      "No voy a contarte ningún spoiler.",
      "Puedo volver a ver el capítulo contigo."
    ],
    "bt": "Era nuestro plan",
    "b": [
      "Acordamos empezar esta serie juntos.",
      "Descubrir las sorpresas juntos era el plan.",
      "Podrías ver otra cosa mientras esperamos."
    ],
    "emoji": "🍿",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "platos",
    "tag": "Convivencia",
    "q": "Si uno cocina, ¿el otro tiene que fregar?",
    "at": "Yo ya he cocinado",
    "a": [
      "He dedicado una hora a cocinar.",
      "La cena era para los dos.",
      "Fregar sería una forma de repartir el trabajo."
    ],
    "bt": "No cualquier desastre",
    "b": [
      "Has usado cinco sartenes para hacer pasta.",
      "Podrías ir limpiando mientras cocinas.",
      "Repartir tareas también exige no ensuciar de más."
    ],
    "emoji": "🍳",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "audio",
    "tag": "Amigos",
    "q": "¿Un audio de cinco minutos merece una llamada?",
    "at": "Déjame contártelo",
    "a": [
      "Puedes escucharlo cuando tengas tiempo.",
      "Una llamada nos obliga a coincidir.",
      "El tono ayuda a entender lo que me pasa."
    ],
    "bt": "Ve al grano",
    "b": [
      "Cinco minutos es demasiado para un dato.",
      "No puedo buscar una frase dentro del audio.",
      "Puedes escribir lo importante y luego llamarme."
    ],
    "emoji": "🎧",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "ventana",
    "tag": "Viajes",
    "q": "¿Quien va en la ventana decide si baja la persiana?",
    "at": "Es mi asiento",
    "a": [
      "Elegí este sitio para disfrutar de las vistas.",
      "Mirar por la ventana hace ameno el viaje.",
      "Nadie me avisó de que debíamos cerrar."
    ],
    "bt": "Necesito descansar",
    "b": [
      "La luz me está dando directamente.",
      "Es un vuelo largo y necesito descansar.",
      "Podemos abrirla cuando nos acerquemos al destino."
    ],
    "emoji": "✈️",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "reunion",
    "tag": "Trabajo",
    "q": "¿Una reunión que termina a tu hora de salida puede alargarse?",
    "at": "Cinco minutos más",
    "a": [
      "Estamos a punto de resolver el problema.",
      "Mañana tendríamos que empezar otra reunión.",
      "Solo pido unos minutos para terminar."
    ],
    "bt": "Mi tiempo cuenta",
    "b": [
      "La reunión tenía una hora de fin.",
      "He organizado mi tarde contando con ella.",
      "Podemos dejar el último punto por escrito."
    ],
    "emoji": "💼",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "cumple",
    "tag": "Amigos",
    "q": "¿Está bien dividir la cuenta si has pedido mucho menos?",
    "at": "Entre todos",
    "a": [
      "Hemos venido a celebrar juntos.",
      "Compartimos varios platos en la mesa.",
      "Contar cada euro corta el ambiente."
    ],
    "bt": "Cada uno lo suyo",
    "b": [
      "Solo he pedido una ensalada y agua.",
      "Los cócteles suben mucho la cuenta.",
      "No acordamos pagar todos lo mismo."
    ],
    "emoji": "🧾",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "alarma",
    "tag": "Pareja",
    "q": "¿Puedes poner cinco alarmas si duermes acompañado?",
    "at": "Me cuesta despertar",
    "a": [
      "Con una alarma me vuelvo a dormir.",
      "Necesito llegar puntual al trabajo.",
      "Estoy intentando cambiar este hábito."
    ],
    "bt": "Nos despiertas a dos",
    "b": [
      "La primera alarma ya me despierta.",
      "Tú sigues durmiendo y yo no puedo.",
      "Puedes probar una alarma con vibración."
    ],
    "emoji": "⏰",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "tupper",
    "tag": "Convivencia",
    "q": "¿Los táperes vacíos se devuelven con comida?",
    "at": "Con devolverlo basta",
    "a": [
      "Te lo devuelvo limpio y a tiempo.",
      "Siempre agradezco la comida que me das.",
      "Un favor no debería convertirse en una deuda."
    ],
    "bt": "Un pequeño detalle",
    "b": [
      "He cocinado para ti varias veces.",
      "Un detalle de vuelta también hace ilusión.",
      "No tiene que ser algo caro ni complicado."
    ],
    "emoji": "🥡",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "foto",
    "tag": "Amigos",
    "q": "¿Hay que pedir permiso antes de subir una foto de grupo?",
    "at": "Es un recuerdo",
    "a": [
      "Todos sabíamos que hacíamos una foto.",
      "Solo la comparto con mis amigos.",
      "Quería guardar un recuerdo del día."
    ],
    "bt": "Mi imagen, mi decisión",
    "b": [
      "Posar no significa aceptar que la publiques.",
      "No conozco a todos tus seguidores.",
      "Pedir permiso solo lleva unos segundos."
    ],
    "emoji": "📸",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "musica",
    "tag": "Viajes",
    "q": "¿Quien conduce elige la música?",
    "at": "Conduzco yo",
    "a": [
      "Me encargo de conducir todo el trayecto.",
      "La música me ayuda a mantener la atención.",
      "He elegido canciones que también conocéis."
    ],
    "bt": "Viajamos todos",
    "b": [
      "Son cuatro horas de viaje para todos.",
      "También queremos disfrutar del trayecto.",
      "Podemos turnarnos sin distraer al conductor."
    ],
    "emoji": "🎵",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "patatas",
    "tag": "Comida",
    "q": "¿Puedes robar patatas después de decir que no querías?",
    "at": "Solo era una",
    "a": [
      "No quería una ración entera.",
      "Solo he cogido un par de patatas.",
      "Compartir un poco es un gesto entre amigos."
    ],
    "bt": "Entonces pide",
    "b": [
      "Te pregunté antes de hacer el pedido.",
      "He pedido la cantidad que quería comer.",
      "Si todos cogéis, me quedo sin mi ración."
    ],
    "emoji": "🍟",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "asiento",
    "tag": "Amigos",
    "q": "¿Llegar primero permite guardar sitio para todo el grupo?",
    "at": "Les estoy esperando",
    "a": [
      "Mis amigos ya vienen de camino.",
      "Solo les guardo el sitio unos minutos.",
      "Queremos sentarnos juntos para hablar."
    ],
    "bt": "El sitio está vacío",
    "b": [
      "Yo ya he llegado y necesito una silla.",
      "Los sitios siguen vacíos mientras espero.",
      "No se puede reservar media terraza sin límite."
    ],
    "emoji": "🪑",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "cargador",
    "tag": "Convivencia",
    "q": "¿Se puede coger un cargador sin pedirlo?",
    "at": "Es un momento",
    "a": [
      "Siempre compartimos cosas en casa.",
      "Lo necesito solo durante un momento.",
      "Lo devolveré al mismo sitio al terminar."
    ],
    "bt": "Pregunta primero",
    "b": [
      "Lo he buscado justo cuando tenía prisa.",
      "No sabía que lo tenías tú.",
      "Un mensaje habría evitado el problema."
    ],
    "emoji": "🔌",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "plan",
    "tag": "Amigos",
    "q": "¿Cancelar un plan porque estás cansado es una mala excusa?",
    "at": "Necesito descansar",
    "a": [
      "La semana me ha dejado sin energía.",
      "Prefiero decírtelo con sinceridad.",
      "Puedo proponerte otra fecha para vernos."
    ],
    "bt": "Yo me he organizado",
    "b": [
      "Reservé esta tarde para estar contigo.",
      "Me avisas cuando ya no puedo hacer otro plan.",
      "Me gustaría que también contaras con mi tiempo."
    ],
    "emoji": "🛋️",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "receta",
    "tag": "Comida",
    "q": "¿Cambiar ingredientes convierte una receta en otra?",
    "at": "La adapto a mi gusto",
    "a": [
      "Cocino con lo que tengo en casa.",
      "La adapto a lo que nos gusta.",
      "El nombre explica la idea del plato."
    ],
    "bt": "Entonces cambia el nombre",
    "b": [
      "El nombre crea una expectativa concreta.",
      "Los ingredientes cambian mucho el resultado.",
      "Puedes ponerle otro nombre sin problema."
    ],
    "emoji": "🍝",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "playlist",
    "tag": "Amigos",
    "q": "¿Es de mala educación saltar la canción que ha puesto alguien?",
    "at": "No pega con el momento",
    "a": [
      "La canción ha cortado el ambiente.",
      "Todos estábamos bailando antes.",
      "Solo quería mantener la energía de la fiesta."
    ],
    "bt": "Déjala terminar",
    "b": [
      "Era mi turno de elegir una canción.",
      "Las canciones de los demás sí se escucharon.",
      "Podemos esperar tres minutos a que termine."
    ],
    "emoji": "🎶",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "lavadora",
    "tag": "Convivencia",
    "q": "¿Se puede sacar la ropa de otra persona de la lavadora?",
    "at": "Necesito usarla",
    "a": [
      "La lavadora terminó hace una hora.",
      "También necesito lavar mi ropa.",
      "He dejado tus cosas en un cesto limpio."
    ],
    "bt": "Avísame antes",
    "b": [
      "Prefiero que me avises antes de tocarlas.",
      "Puedo bajar en cuanto reciba el mensaje.",
      "Hay prendas que necesito tender de otra forma."
    ],
    "emoji": "🧺",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "regalo",
    "tag": "Pareja",
    "q": "¿Un regalo práctico es menos romántico?",
    "at": "He pensado en ti",
    "a": [
      "Me habías dicho que lo querías.",
      "Lo elegí porque te hacía falta.",
      "Recordar lo que necesitas también es cariño."
    ],
    "bt": "Quería una sorpresa",
    "b": [
      "Era una fecha especial para nosotros.",
      "Me hacía ilusión recibir una sorpresa.",
      "Prefería algo para disfrutar y no para las tareas."
    ],
    "emoji": "🎁",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "maleta",
    "tag": "Viajes",
    "q": "¿Se puede ocupar parte de la maleta de tu acompañante?",
    "at": "Te sobra espacio",
    "a": [
      "Tu maleta tiene espacio que no vas a usar.",
      "Solo necesito guardar un par de cosas.",
      "Puedo ayudarte a cargarla durante el viaje."
    ],
    "bt": "La he hecho ligera",
    "b": [
      "He renunciado a cosas para viajar ligero.",
      "La maleta la voy a llevar yo.",
      "No acordamos compartir el espacio al prepararla."
    ],
    "emoji": "🧳",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "desayuno",
    "tag": "Comida",
    "q": "¿Desayunar juntos obliga a esperar a quien se levanta tarde?",
    "at": "Es nuestro rato",
    "a": [
      "Es el único rato tranquilo del fin de semana.",
      "Me hace ilusión desayunar contigo.",
      "Podríamos acordar una hora la noche anterior."
    ],
    "bt": "Tengo hambre ya",
    "b": [
      "Llevo dos horas despierto y tengo hambre.",
      "No quiero condicionarte la hora de levantarte.",
      "Puedo acompañarte luego con otro café."
    ],
    "emoji": "🥐",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "camino",
    "tag": "Viajes",
    "q": "¿Elegir el camino bonito justifica llegar más tarde?",
    "at": "Estamos de vacaciones",
    "a": [
      "Estamos de vacaciones y no tenemos tanta prisa.",
      "Las vistas merecen esos veinte minutos.",
      "El trayecto también forma parte del viaje."
    ],
    "bt": "Habíamos hecho un plan",
    "b": [
      "Tenemos una reserva con hora concreta.",
      "Quiero llegar sin preocuparme por el tiempo.",
      "Podemos parar tranquilamente a la vuelta."
    ],
    "emoji": "🗺️",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "chat",
    "tag": "Trabajo",
    "q": "¿Un mensaje de trabajo fuera de horario exige respuesta?",
    "at": "Lo mando para mañana",
    "a": [
      "Lo escribo ahora para no olvidarlo.",
      "No espero respuesta fuera de tu horario.",
      "Prefiero dejar la idea antes de que se me pase."
    ],
    "bt": "Me interrumpe igual",
    "b": [
      "El aviso interrumpe mi tiempo de descanso.",
      "No sé si esperas que lo resuelva ahora.",
      "Puedes programar el mensaje para mañana."
    ],
    "emoji": "💬",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "oficina",
    "tag": "Trabajo",
    "q": "¿El aire acondicionado se decide por mayoría?",
    "at": "Tenemos calor",
    "a": [
      "Casi todos estamos pasando calor.",
      "Nos cuesta concentrarnos con esta temperatura.",
      "Solo proponemos bajar un par de grados."
    ],
    "bt": "No puedo trabajar con frío",
    "b": [
      "Estoy justo debajo de la salida del aire.",
      "Siento mucho más frío que el resto.",
      "Podemos cambiarme de sitio antes de bajarlo."
    ],
    "emoji": "❄️",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "postre",
    "tag": "Comida",
    "q": "¿Pedir un postre para compartir da derecho a la mitad exacta?",
    "at": "Era para los dos",
    "a": [
      "Lo hemos pedido para los dos.",
      "Vamos a pagarlo a partes iguales.",
      "Me gustaría probar la misma cantidad que tú."
    ],
    "bt": "No llevemos la cuenta",
    "b": [
      "No estaba contando las cucharadas.",
      "Lo importante es disfrutar de la cena.",
      "Podemos pedir otro si te has quedado con ganas."
    ],
    "emoji": "🍰",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "mesa",
    "tag": "Convivencia",
    "q": "¿Está bien dejar un puzle a medias en la mesa del salón?",
    "at": "No puedo desmontarlo",
    "a": [
      "He pasado varias horas montando el puzle.",
      "Desmontarlo ahora haría perder ese trabajo.",
      "Mañana puedo terminarlo y liberar la mesa."
    ],
    "bt": "La mesa es de todos",
    "b": [
      "Es la única mesa donde puedo comer cómodo.",
      "También la necesito para trabajar.",
      "Una tabla permitiría moverlo sin desmontarlo."
    ],
    "emoji": "🧩",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "hora",
    "tag": "Amigos",
    "q": "¿Decir sobre las ocho permite llegar a las ocho y media?",
    "at": "Era aproximado",
    "a": [
      "Dijimos sobre las ocho, no a las ocho.",
      "Entendí que había un margen de llegada.",
      "No sabía que me esperarías en la calle."
    ],
    "bt": "Media hora es demasiado",
    "b": [
      "Yo llegué a la hora que habíamos hablado.",
      "Media hora me parece demasiado margen.",
      "Avisarme habría evitado quedarme esperando."
    ],
    "emoji": "⌚",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "cama",
    "tag": "Pareja",
    "q": "¿Quien se levanta último tiene que hacer la cama?",
    "at": "Tiene sentido",
    "a": [
      "No puedo hacerla mientras sigues durmiendo.",
      "Al levantarte ya tienes la cama libre.",
      "Es una tarea rápida antes de salir."
    ],
    "bt": "Repartamos las tareas",
    "b": [
      "Me levanto más tarde por mi horario.",
      "Eso hace que la tarea me toque siempre.",
      "Podemos compensarla con otra tarea de casa."
    ],
    "emoji": "🛏️",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "cine",
    "tag": "Amigos",
    "q": "¿Se puede hablar bajito durante una película?",
    "at": "Es solo un comentario",
    "a": [
      "Me gusta compartir la reacción contigo.",
      "Solo hago comentarios muy puntuales.",
      "Hablo bajo para no molestar al resto."
    ],
    "bt": "Me saca de la historia",
    "b": [
      "Cuando hablas pierdo parte del diálogo.",
      "Los comentarios me sacan de la historia.",
      "Podemos contárnoslo todo cuando termine."
    ],
    "emoji": "🎬",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "turismo",
    "tag": "Viajes",
    "q": "¿Hay que aprovechar cada hora de un viaje?",
    "at": "Quiero verlo todo",
    "a": [
      "Nos ha costado tiempo y dinero llegar.",
      "Quiero ver los sitios que hemos planeado.",
      "Puedo descansar cuando regresemos a casa."
    ],
    "bt": "También quiero descansar",
    "b": [
      "He venido también para descansar.",
      "Una lista contrarreloj me genera estrés.",
      "Prefiero disfrutar bien de menos lugares."
    ],
    "emoji": "🌄",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "nevera",
    "tag": "Convivencia",
    "q": "¿La última leche se repone aunque solo hayas usado un poco?",
    "at": "Se acabó conmigo",
    "a": [
      "Todos hemos usado la misma leche.",
      "Solo he tomado lo poco que quedaba.",
      "Puedo apuntarla en la próxima compra común."
    ],
    "bt": "Alguien tiene que hacerlo",
    "b": [
      "Me entero cuando ya estoy preparando el desayuno.",
      "Necesito saber que se ha terminado.",
      "Quien la acaba puede reponerla o avisar."
    ],
    "emoji": "🥛",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "prestamo",
    "tag": "Amigos",
    "q": "¿Se puede volver a prestar un libro que te han prestado?",
    "at": "Sé que le gustará",
    "a": [
      "Sé que esa historia también le gustará.",
      "Es una persona en la que confío.",
      "Me ha prometido devolverlo pronto."
    ],
    "bt": "No era tuyo para prestarlo",
    "b": [
      "Te presté el libro a ti, no a otra persona.",
      "Quiero saber dónde están mis cosas.",
      "Necesito poder recuperarlo cuando lo pida."
    ],
    "emoji": "📚",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "zoom",
    "tag": "Trabajo",
    "q": "¿Tener la cámara apagada hace que participes menos?",
    "at": "Estoy escuchando igual",
    "a": [
      "Estoy escuchando aunque no se me vea.",
      "Puedo participar igual cuando tenga algo que decir.",
      "Me concentro mejor sin mirarme en pantalla."
    ],
    "bt": "Ayuda vernos",
    "b": [
      "Las caras ayudan a saber si se entiende.",
      "Me cuesta hablar ante una pantalla vacía.",
      "Podríamos encenderla al menos al intervenir."
    ],
    "emoji": "💻",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "pan",
    "tag": "Comida",
    "q": "¿Comprar pan de molde cuenta como traer pan?",
    "at": "Pan es pan",
    "a": [
      "Me pediste pan sin especificar cuál.",
      "El pan de molde también sirve para comer.",
      "He elegido uno que dura varios días."
    ],
    "bt": "Era para la comida",
    "b": [
      "Íbamos a comer un guiso con salsa.",
      "Normalmente compramos una barra para eso.",
      "Pensaba que el contexto dejaba claro el tipo."
    ],
    "emoji": "🍞",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "mapa",
    "tag": "Viajes",
    "q": "¿Quien lleva el mapa manda sobre la ruta?",
    "at": "Para eso me encargo",
    "a": [
      "He revisado los horarios y las distancias.",
      "El plan permite llegar a todo sin correr.",
      "Cambiar cada parada complica la organización."
    ],
    "bt": "Decidimos juntos",
    "b": [
      "El viaje lo estamos haciendo los dos.",
      "Puedo descubrir algo que no estaba en el plan.",
      "Agradecer tu trabajo no me impide proponer cambios."
    ],
    "emoji": "🧭",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  },
  {
    "id": "movil",
    "tag": "Pareja",
    "q": "¿Mirar el móvil durante la cena rompe el momento?",
    "at": "Estoy resolviendo algo",
    "a": [
      "Es un mensaje que puedo resolver rápido.",
      "Después dejaré el teléfono a un lado.",
      "No quiero tenerlo pendiente toda la noche."
    ],
    "bt": "Nunca es solo un mensaje",
    "b": [
      "Al coger el teléfono cortas la conversación.",
      "A veces un mensaje acaba siendo muchos más.",
      "Podemos cenar veinte minutos sin pantallas."
    ],
    "emoji": "📱",
    "editorial": 1,
    "owner": "editorial",
    "created": 0,
    "closes": 0,
    "status": "open"
  }
];
