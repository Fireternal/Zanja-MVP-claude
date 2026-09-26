// Los niveles y lo que abren.
//
// Un nivel que sólo sube un número no es una recompensa. Aquí cada rango
// entrega una llave: crear zanjas, invitar a la otra parte, adjuntar una
// prueba. Así el nivel se lee como permiso ganado y no como puntuación, y de
// paso la gente que acaba de llegar no puede publicar nada hasta haber visto
// unos cuantos casos por dentro.
//
// Lo que nunca desbloquea un nivel es peso en la sentencia: un voto es un
// voto. El nivel premia la participación, no da la razón.
import {PULSE_POINTS} from './pulse';
import {SELLO_XP} from './expediente';

/** Lo que da un voto en el Juzgado. */
export const XP_VOTO=5;

/** La experiencia sale de los tres sitios donde se participa. */
export const xpDe=({votos=0,aciertos=0,sellos=0}:{votos?:number;aciertos?:number;sellos?:number})=>
 votos*XP_VOTO+aciertos*PULSE_POINTS+sellos*SELLO_XP;

export type Llave='crear'|'invitar'|'prueba';
export type Rango={nivel:number;xp:number;titulo:string;desbloqueo:string;llave:Llave|null};

export const rangos:Rango[]=[
 {nivel:1,xp:0,  titulo:'Jurado novato',        desbloqueo:'Votar en el Juzgado y responder al Pulso', llave:null},
 {nivel:2,xp:60, titulo:'Jurado de guardia',    desbloqueo:'Crear tus propias zanjas',                 llave:'crear'},
 {nivel:3,xp:180,titulo:'Instructor del caso',  desbloqueo:'Invitar a la otra parte a defenderse',     llave:'invitar'},
 {nivel:4,xp:360,titulo:'Fiscal',               desbloqueo:'Adjuntar una prueba a tus casos',          llave:'prueba'},
 {nivel:5,xp:600,titulo:'Magistrado',           desbloqueo:'Abrir cinco zanjas al día en vez de dos',  llave:null},
 {nivel:6,xp:900,titulo:'Presidente del tribunal',desbloqueo:'Ya tienes todas las llaves del Juzgado', llave:null}];

/** Pasada la escalera con nombre, los niveles siguen cada tantos puntos. */
export const PASO_EXTRA=400;
const CIMA=rangos[rangos.length-1];

export function nivelDe(xp:number):number{
 if(xp>=CIMA.xp)return CIMA.nivel+Math.floor((xp-CIMA.xp)/PASO_EXTRA);
 for(let i=rangos.length-1;i>=0;i--)if(xp>=rangos[i].xp)return rangos[i].nivel;
 return 1;
}

/** El umbral en el que empieza un nivel, incluidos los de más allá de la cima. */
export function xpDelNivel(nivel:number):number{
 const r=rangos.find(x=>x.nivel===nivel);
 return r?r.xp:CIMA.xp+(nivel-CIMA.nivel)*PASO_EXTRA;
}

export const tituloDe=(nivel:number)=>(rangos.find(r=>r.nivel===nivel)||CIMA).titulo;

export type Progreso={nivel:number;titulo:string;xp:number;desde:number;hasta:number;hecho:number;falta:number;siguiente:Rango|null};

export function progresoDe(xp:number):Progreso{
 const nivel=nivelDe(xp),desde=xpDelNivel(nivel),hasta=xpDelNivel(nivel+1);
 return {nivel,titulo:tituloDe(nivel),xp,desde,hasta,hecho:xp-desde,falta:hasta-xp,
  siguiente:rangos.find(r=>r.nivel===nivel+1)||null};
}

/** El nivel al que se abre cada llave. */
export const NIVEL_LLAVE:Record<Llave,number>=Object.fromEntries(
 rangos.filter(r=>r.llave).map(r=>[r.llave as Llave,r.nivel])) as Record<Llave,number>;

export const puede=(xp:number,llave:Llave)=>nivelDe(xp)>=NIVEL_LLAVE[llave];

/** Cuántas zanjas al día, que también es cosa del nivel. */
export const LIMITE_BASE=2,LIMITE_VETERANO=5;
export const limiteDiario=(xp:number)=>nivelDe(xp)>=5?LIMITE_VETERANO:LIMITE_BASE;

/** Lo que se le dice a alguien que todavía no tiene la llave. */
export function pegaDeLlave(llave:Llave):string{
 const nivel=NIVEL_LLAVE[llave];
 return `Necesitas el nivel ${nivel} (${tituloDe(nivel)}) para esto. Vota, responde al Pulso y sella el expediente del día.`;
}
