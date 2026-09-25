'use client';
import {useLayoutEffect,useRef,type TextareaHTMLAttributes} from 'react';

// Expand the field itself so short mobile forms never acquire nested scrolling.
export function GrowingTextarea({value,style,...props}:TextareaHTMLAttributes<HTMLTextAreaElement>){
 const ref=useRef<HTMLTextAreaElement>(null);
 useLayoutEffect(()=>{
  const node=ref.current;if(!node)return;
  let active=true,lastWidth=-1;
  const fit=()=>{if(!active||!node.isConnected)return;node.style.height='0px';const css=getComputedStyle(node);const borders=parseFloat(css.borderTopWidth)+parseFloat(css.borderBottomWidth);node.style.height=`${Math.ceil(node.scrollHeight+borders)}px`;node.scrollTop=0;};
  fit();
  const observer=new ResizeObserver(()=>{const width=node.clientWidth;if(width!==lastWidth){lastWidth=width;fit();}});observer.observe(node);
  document.fonts.ready.then(fit);
  return()=>{active=false;observer.disconnect();};
 },[value,props.placeholder]);
 return <textarea {...props} ref={ref} value={value} style={{...style,boxSizing:'border-box',overflow:'hidden',resize:'none'}}/>;
}
