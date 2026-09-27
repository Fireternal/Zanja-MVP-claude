'use client';
// Los niveles vistos desde la interfaz: la escalera del perfil y nada más.
//
// Aquí vivían también el candado de una llave que aún no tenías y la hoja que
// lo explicaba. Ya no hay llaves —el Juzgado entra abierto—, así que la
// escalera cuenta lo que llevas hecho y no lo que te falta por poder hacer.
import {rangos,nivelDe} from '@/lib/niveles';

/** Una medalla por rango. Literales a propósito: la vitrina empotra los
 *  archivos buscando estas rutas en el código, y no ve las que se arman al vuelo. */
export const MEDALLAS=['/rango-1.webp','/rango-2.webp','/rango-3.webp','/rango-4.webp','/rango-5.webp','/rango-6.webp'];

export function EscaleraNiveles({xp}:{xp:number}){
 const nivel=nivelDe(xp);
 return <ol className="escalera entra-lista">{rangos.map((r,i)=>{
  const abierto=nivel>=r.nivel;
  return <li key={r.nivel} className={abierto?'abierto':''} style={{'--i':i} as React.CSSProperties}>
   <span className="escalera-marca"><img width={96} height={96} src={MEDALLAS[r.nivel-1]||MEDALLAS[MEDALLAS.length-1]} alt="" aria-hidden="true"/><b>{r.nivel}</b></span>
   <div className="escalera-texto"><strong>{r.titulo}</strong><small>{r.nota}</small></div>
   <span className="escalera-xp">{r.xp?<>{r.xp}<i>XP</i></>:<i>DE SALIDA</i>}</span>
  </li>;})}
 </ol>;
}
