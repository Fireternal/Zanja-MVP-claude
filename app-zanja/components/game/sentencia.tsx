'use client';
// La sentencia sellada: la imagen que queda cuando un caso se cierra.
//
// Se dibuja en un canvas en vez de maquetarse en HTML porque el destino no es
// la pantalla, es el carrete: una imagen de 1080×1350 que se comparte fuera
// de ZANJA y tiene que explicarse sola a quien no ha entrado nunca.

import {useEffect,useRef,useState} from 'react';
import {Download,Link2,LoaderCircle} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {SIDES,SIDE_NAME,caseNumber,percentOf,verdictHeadline,verdictOf,verdictSubhead,type Side} from '@/lib/verdict';
import type {Case} from '@/lib/cases';

const ANCHO=1080,ALTO=1350;
const FONDO='#17122b',TINTA='#100d20',PAPEL='#faf8ff',ORO='#ffd13e',MALVA='#ad85ff',APAGADO='#bdb5cf';
const COLOR:Record<Side,string>={a:'#5de1f3',both:'#ad85ff',b:'#ff858d',none:'#7d7394'};

const display=(px:number)=>`${px}px "Titan One", Georgia, serif`;
const texto=(px:number,peso=700)=>`${peso} ${px}px "Nunito Sans", Arial, sans-serif`;

/** Parte un texto en líneas que quepan, sin cortar palabras. */
function lineas(ctx:CanvasRenderingContext2D,frase:string,ancho:number,maximo:number){
 const salida:string[]=[];let linea='';
 for(const palabra of frase.split(/\s+/)){
  const intento=linea?linea+' '+palabra:palabra;
  if(ctx.measureText(intento).width<=ancho||!linea)linea=intento;
  else{salida.push(linea);linea=palabra;}
 }
 if(linea)salida.push(linea);
 if(salida.length>maximo){salida.length=maximo;salida[maximo-1]=salida[maximo-1].replace(/[.,;:\s]+$/,'')+'…';}
 return salida;
}

function caja(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){
 ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);
 ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
}

function sello(ctx:CanvasRenderingContext2D,cx:number,cy:number,radio:number,numero:string){
 ctx.save();ctx.translate(cx,cy);ctx.rotate(-0.22);
 ctx.strokeStyle=ORO;ctx.lineWidth=7;ctx.globalAlpha=.92;
 ctx.beginPath();ctx.arc(0,0,radio,0,Math.PI*2);ctx.stroke();
 ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,radio-14,0,Math.PI*2);ctx.stroke();
 ctx.fillStyle=ORO;ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.font=display(Math.round(radio*.33));ctx.fillText('ZANJADO',0,-radio*.12);
 ctx.font=texto(Math.round(radio*.19),900);ctx.fillText(`Nº ${numero}`,0,radio*.32);
 ctx.restore();
}

/** Dibuja la sentencia entera. Todo lo que sale aquí es dato del caso.
 *
 * La composición va por bandas fijas en vez de fluir: una sentencia siempre
 * tiene el mismo aspecto, y así una pregunta larga no empuja el sello encima
 * del reparto. Lo que no cabe se recorta, que es lo que hace un documento. */
function dibuja(ctx:CanvasRenderingContext2D,c:Case){
 const fallo=verdictOf(c.counts||{},c.total||0);
 const total=c.total||0;
 const margen=80,util=ANCHO-margen*2;

 ctx.fillStyle=FONDO;ctx.fillRect(0,0,ANCHO,ALTO);
 const brillo=ctx.createRadialGradient(ANCHO*.5,0,0,ANCHO*.5,0,ALTO*.8);
 brillo.addColorStop(0,'#3c2364');brillo.addColorStop(1,'rgba(23,18,43,0)');
 ctx.fillStyle=brillo;ctx.fillRect(0,0,ANCHO,ALTO);
 ctx.textAlign='left';ctx.textBaseline='top';

 // Banda 1 · cabecera
 ctx.fillStyle=PAPEL;ctx.font=display(50);ctx.fillText('ZANJA',margen,margen);
 ctx.fillStyle=ORO;ctx.font=texto(23,900);ctx.letterSpacing='4px';
 ctx.fillText('SENTENCIA',margen+230,margen+14);
 ctx.fillStyle=APAGADO;ctx.font=texto(23,700);
 ctx.fillText(`CASO Nº ${caseNumber(c.id)}`,margen,margen+76);
 const fecha=new Date(c.closes||c.created||Date.now()).toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'});
 ctx.textAlign='right';ctx.fillText(fecha.toUpperCase(),ANCHO-margen,margen+76);
 ctx.letterSpacing='0px';ctx.textAlign='left';
 ctx.strokeStyle='#584a6d';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(margen,margen+124);ctx.lineTo(ANCHO-margen,margen+124);ctx.stroke();

 // Banda 2 · la pregunta
 ctx.fillStyle=PAPEL;ctx.font=display(52);
 let y=248;
 for(const linea of lineas(ctx,c.q,util,3)){ctx.fillText(linea,margen,y);y+=66;}

 // Banda 3 · el fallo
 const claro=fallo.kind==='ruling';
 ctx.fillStyle=claro?COLOR[fallo.side]:fallo.kind==='tie'?ORO:APAGADO;
 // El titular se encoge hasta caber en dos líneas: una palabra suelta en la
 // segunda línea estropea la sentencia entera.
 const titular=verdictHeadline(fallo);
 let cuerpo=claro?72:58,partes=[titular];
 for(const tamano of [claro?72:58,64,56,48]){
  ctx.font=display(tamano);const intento=lineas(ctx,titular,util,2);
  cuerpo=tamano;partes=intento;
  if(intento.length<2||intento[1].split(' ').length>1)break;
 }
 ctx.font=display(cuerpo);
 y=490;
 for(const linea of partes){ctx.fillText(linea,margen,y);y+=Math.round(cuerpo*1.14);}
 ctx.fillStyle=APAGADO;ctx.font=texto(29,700);
 ctx.fillText(verdictSubhead(fallo),margen,y+14);

 // Banda 4 · el reparto. La etiqueta va fuera de la barra: dentro, las
 // barras cortas se quedaban sin sitio y el texto salía a medias.
 const etiqueta=margen+238,derecha=ANCHO-margen-122;
 const pista=derecha-etiqueta-26,alto=42;
 y=768;
 for(const side of SIDES){
  const porcentaje=percentOf(c.counts||{},side,total);
  const medio=y+alto/2;
  ctx.textBaseline='middle';
  ctx.fillStyle=PAPEL;ctx.font=texto(27,900);ctx.fillText(SIDE_NAME[side],margen,medio);
  ctx.fillStyle='#2b2344';caja(ctx,etiqueta,y,pista,alto,14);ctx.fill();
  if(porcentaje>0){ctx.fillStyle=COLOR[side];caja(ctx,etiqueta,y,Math.max(alto,pista*porcentaje/100),alto,14);ctx.fill();}
  ctx.textAlign='right';ctx.fillStyle=porcentaje?COLOR[side]:APAGADO;ctx.font=texto(34,900);
  ctx.fillText(`${porcentaje}%`,ANCHO-margen,medio);
  ctx.textAlign='left';ctx.textBaseline='top';
  y+=alto+30;
 }

 // Banda 5 · pie y sello
 ctx.fillStyle=MALVA;ctx.font=texto(24,900);ctx.letterSpacing='2px';
 ctx.fillText('ZANJA.APP',margen,ALTO-margen-78);
 ctx.letterSpacing='0px';ctx.fillStyle=APAGADO;ctx.font=texto(25,700);
 ctx.fillText(`Juzgado por ${total} ${total===1?'persona':'personas'}.`,margen,ALTO-margen-36);
 sello(ctx,ANCHO-margen-96,ALTO-margen-98,94,caseNumber(c.id));
}

export function Sentencia({c,open,onOpenChange,onLink}:{c:Case;open:boolean;onOpenChange:(v:boolean)=>void;onLink:()=>void}){
 const [imagen,setImagen]=useState<string|null>(null);
 const blob=useRef<Blob|null>(null);
 const numero=caseNumber(c.id);

 useEffect(()=>{
  if(!open)return;
  let vivo=true,url='';
  (async()=>{
   try{await (document as any).fonts?.ready;}catch{}
   const canvas=document.createElement('canvas');
   canvas.width=ANCHO;canvas.height=ALTO;
   const ctx=canvas.getContext('2d');if(!ctx)return;
   dibuja(ctx,c);
   const datos=await new Promise<Blob|null>(res=>canvas.toBlob(res,'image/png'));
   if(!vivo||!datos)return;
   blob.current=datos;url=URL.createObjectURL(datos);setImagen(url);
  })();
  return()=>{vivo=false;setImagen(null);if(url)URL.revokeObjectURL(url);};
 },[open,c]);

 async function guardar(){
  const datos=blob.current;if(!datos)return;
  const archivo=new File([datos],`zanja-${numero}.png`,{type:'image/png'});
  if(navigator.canShare?.({files:[archivo]})){
   try{await navigator.share({files:[archivo],title:`ZANJA · caso nº ${numero}`});return;}catch{}
  }
  const enlace=document.createElement('a');
  enlace.href=URL.createObjectURL(datos);enlace.download=`zanja-${numero}.png`;
  enlace.click();setTimeout(()=>URL.revokeObjectURL(enlace.href),4000);
 }

 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="zanja-dialog sentencia-dialog">
  <DialogTitle>Sentencia del caso nº {numero}</DialogTitle>
  <DialogDescription>Así quedó cuando se acabó el tiempo. Guárdala o comparte el caso.</DialogDescription>
  <div className="sentencia-lienzo">
   {imagen
    ?<img src={imagen} alt={`Sentencia del caso número ${numero}: ${verdictHeadline(verdictOf(c.counts||{},c.total||0))}`}/>
    :<span className="sentencia-espera"><LoaderCircle className="spin" size={30}/>Sellando…</span>}
  </div>
  <p className="sentencia-pista">Si no se descarga, mantén pulsada la imagen para guardarla.</p>
  <div className="sentencia-acciones">
   <button className="game-btn yellow" onClick={guardar} disabled={!imagen}><Download size={20}/>GUARDAR IMAGEN</button>
   <button className="quiet-btn" onClick={onLink}><Link2 size={18}/>Copiar enlace del caso</button>
  </div>
 </DialogContent></Dialog>;
}
