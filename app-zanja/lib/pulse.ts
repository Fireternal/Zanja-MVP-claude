// El Pulso: una pregunta tonta al día.
//
// El Juzgado pide criterio y tiempo. El Pulso no pide nada: una pregunta de
// las de sobremesa, dos botones y ver de qué lado está la gente. Es el motivo
// para abrir la app un martes cualquiera.
//
// Y es el único sitio donde se premia coincidir con la mayoría. En el Juzgado
// eso convertiría el criterio en apostar; aquí, que es un juego, es la gracia.

export type Choice='si'|'no';
export const CHOICES:Choice[]=['si','no'];
/** Lo que se lleva quien acierta el pulso del día anterior. */
export const PULSE_POINTS=10;

/** El día como número entero, que es como cuenta los días la partida. */
export const dayOf=(at:number=Date.now())=>Math.floor(at/86400000);

export const questions:string[]=[
 '¿La pizza puede llevar piña?',
 '¿Se puede beber el café con hielo en invierno?',
 '¿La tortilla de patatas es mejor con cebolla?',
 '¿Se puede reservar sitio en la playa con una toalla a las siete de la mañana?',
 '¿Contestar un audio de tres minutos con un mensaje de texto es de mala persona?',
 '¿Se puede llevar calcetines con sandalias?',
 '¿El último trozo de la bandeja es de quien lo pida primero?',
 '¿Está bien acabar una serie antes que la persona con la que la empezaste?',
 '¿Se puede poner kétchup a la paella?',
 '¿Hay que devolver el táper lleno?',
 '¿Llegar cinco minutos tarde es llegar tarde?',
 '¿Se puede cantar en el coche de otro?',
 '¿El asiento de la ventanilla es de quien lo reserva o de quien llega antes?',
 '¿Está bien mirar el móvil en el cine si bajas el brillo?',
 '¿Se puede repetir camiseta dos días seguidos?',
 '¿La fruta caliente es una aberración?',
 '¿Se puede decir el final de una película de hace veinte años?',
 '¿Hay que avisar antes de presentarte en casa de alguien?',
 '¿Se puede desayunar pizza de ayer?',
 '¿El que conduce elige la música?',
 '¿Está bien poner el despertador cada cinco minutos?',
 '¿Se puede pedir lo mismo que la persona de al lado?',
 '¿Hay que quitarse los zapatos al entrar en una casa?',
 '¿Se puede ver una película con subtítulos si es en tu idioma?',
 '¿El pan hay que partirlo con la mano?',
 '¿Está bien pedir postre si nadie más va a pedir?',
 '¿Se puede dejar un grupo de WhatsApp sin decir nada?',
 '¿Hay que responder a un mensaje el mismo día?',
 '¿Se puede echar la siesta en casa ajena?',
 '¿La ducha es por la mañana o por la noche?',
 '¿Se puede llevar comida de fuera al cine?',
 '¿Está bien felicitar el cumpleaños por WhatsApp y no llamar?',
];

/** El día en que arranca la serie: el primero de la lista es la piña, que es
 *  la pregunta con la que se explica el Pulso. De ahí en adelante van en
 *  orden, y cuando se acaban vuelve a empezar. */
export const SERIES_START=20721;

/** La pregunta de un día. La misma para todo el mundo, sin sorteo. */
export const questionFor=(day:number)=>{
 const n=questions.length;
 return questions[(((day-SERIES_START)%n)+n)%n];
};

export type Tally={si:number;no:number};
export const totalOf=(t:Tally)=>t.si+t.no;
export const percentOf=(t:Tally,c:Choice)=>{const n=totalOf(t);return n?Math.round(t[c]/n*100):0;};

/** Quién gana un pulso. Un empate exacto no lo gana nadie. */
export function winnerOf(t:Tally):Choice|null{
 if(t.si===t.no)return null;
 return t.si>t.no?'si':'no';
}
