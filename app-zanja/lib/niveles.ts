// Los niveles: reconocimiento, no permisos.
//
// Durante un tiempo cada rango entregaba una llave —crear zanjas, invitar a la
// otra parte, adjuntar una prueba— y el Juzgado se abría a plazos. La idea era
// que nadie publicara antes de haber visto casos por dentro; el efecto real era
// que quien llegaba con una discusión encima no podía hacer nada con ella, que
// es justo el momento en que la app sirve para algo. Así que el Juzgado entra
// abierto: se crea, se invita y se adjunta una foto desde el primer minuto.
//
// Lo único que sigue dependiendo del nivel es cuántas zanjas caben en un día,
// y eso no es una llave sino un freno contra el ruido.
//
// Lo que nunca da un nivel es peso en la sentencia: un voto es un voto. El
// nivel premia la participación, no da la razón.
import {PULSE_POINTS} from './pulse';
import {SELLO_XP} from './expediente';

/** Lo que da un voto en el Juzgado. */
export const XP_VOTO=5;

/** La experiencia sale de los tres sitios donde se participa. */
export const xpDe=({votos=0,aciertos=0,sellos=0}:{votos?:number;aciertos?:number;sellos?:number})=>
 votos*XP_VOTO+aciertos*PULSE_POINTS+sellos*SELLO_XP;

export type Rango={nivel:number;xp:number;titulo:string;nota:string};

export const rangos:Rango[]=[
 {nivel:1,xp:0,  titulo:'Jurado novato',        nota:'Acabas de entrar y el Juzgado ya está entero abierto'},
 {nivel:2,xp:60, titulo:'Jurado de guardia',    nota:'Un día completo de expediente en tu hoja'},
 {nivel:3,xp:180,titulo:'Instructor del caso',  nota:'Vienes a menudo y aquí se nota'},
 {nivel:4,xp:360,titulo:'Fiscal',               nota:'De los que no fallan un día'},
 {nivel:5,xp:600,titulo:'Magistrado',           nota:'Abrir cinco zanjas al día en vez de dos'},
 {nivel:6,xp:900,titulo:'Presidente del tribunal',nota:'Lo más alto de la escalera. De aquí en adelante, oficio'}];

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

/** Cuántas zanjas al día: lo único que el nivel todavía decide. */
export const LIMITE_BASE=2,LIMITE_VETERANO=5;
export const limiteDiario=(xp:number)=>nivelDe(xp)>=5?LIMITE_VETERANO:LIMITE_BASE;
