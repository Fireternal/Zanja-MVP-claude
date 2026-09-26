'use client';
import {useEffect,useRef,useState} from 'react';

/**
 * Un número que sube solo hasta su valor.
 *
 * Ver "205" aparecer de golpe no cuenta nada; verlo subir desde donde estaba
 * dice que lo has ganado tú. Con el movimiento apagado salta al valor final
 * sin animar nada.
 */
export function useContador(valor:number,duracion=800){
 const [visible,setVisible]=useState(valor);
 const desde=useRef(valor);
 useEffect(()=>{
  const quieto=document.documentElement.dataset.motion==='off'
   ||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const salida=desde.current;
  if(quieto||valor===salida){desde.current=valor;setVisible(valor);return;}
  const inicio=performance.now(),salto=valor-salida;
  let vivo=true;
  const paso=(ahora:number)=>{
   if(!vivo)return;
   const p=Math.min(1,(ahora-inicio)/duracion);
   setVisible(Math.round(salida+salto*(1-Math.pow(1-p,3))));
   if(p<1)requestAnimationFrame(paso);else desde.current=valor;
  };
  requestAnimationFrame(paso);
  return()=>{vivo=false;desde.current=valor;};
 },[valor,duracion]);
 return visible;
}
