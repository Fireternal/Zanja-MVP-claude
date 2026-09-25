'use client';
import {useId,useRef,useState} from 'react';
import {ImagePlus,ImageIcon,Expand,LoaderCircle,Trash2,RotateCcw} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {EVIDENCE_MAX_BYTES} from '@/lib/evidence';

function EvidenceImage({src}:{src:string}){
 const [failed,setFailed]=useState(false);const [loaded,setLoaded]=useState(false);const [attempt,setAttempt]=useState(0);
 const hashAt=src.indexOf('#');const base=hashAt<0?src:src.slice(0,hashAt);const hash=hashAt<0?'':src.slice(hashAt);
 const imageSrc=attempt&&!/^(data:|blob:)/.test(src)?`${base}${base.includes('?')?'&':'?'}retry=${attempt}${hash}`:src;
 return <div className="evidence-image-stage" aria-busy={!loaded&&!failed}>{failed?<div role="alert"><p>No se ha podido cargar la imagen.</p><button className="quiet-btn" onClick={()=>{setFailed(false);setLoaded(false);setAttempt(n=>n+1);}}><RotateCcw size={18}/>Reintentar</button></div>:<>{!loaded&&<LoaderCircle className="spin evidence-spinner" aria-label="Cargando imagen"/>}<img key={attempt} src={imageSrc} alt="Prueba gráfica adjunta a esta zanja" ref={node=>{if(node?.complete&&node.naturalWidth>0)setLoaded(true);}} onLoad={()=>setLoaded(true)} onError={()=>setFailed(true)}/></>}</div>;
}
export function EvidenceViewer({src,open,onOpenChange}:{src:string;open:boolean;onOpenChange:(v:boolean)=>void}){
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="evidence-viewer"><DialogTitle>Prueba gráfica</DialogTitle><DialogDescription>Imagen aportada por quien creó la zanja.</DialogDescription>{open&&<EvidenceImage key={src} src={src}/>}</DialogContent></Dialog>;
}

export function EvidenceAccess({src}:{src?:string|null}){
 const [open,setOpen]=useState(false);
 return src?<><button className="evidence-access" onClick={()=>setOpen(true)}><ImageIcon size={17}/><span>Ver prueba</span><Expand size={14}/></button><EvidenceViewer src={src} open={open} onOpenChange={setOpen}/></>:<span className="evidence-absent"><ImageIcon size={16}/>Sin imagen adjunta</span>;
}

async function prepareImage(file:File):Promise<string>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Elige una imagen JPG, PNG o WebP.');
 if(file.size>10*1024*1024)throw new Error('La imagen debe ocupar menos de 10 MB.');
 const bitmap=await createImageBitmap(file);try{
  if(bitmap.width*bitmap.height>40_000_000)throw new Error('La imagen es demasiado grande. Elige una versión más pequeña.');
  const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('No se pudo preparar la imagen.');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  for(const quality of [.84,.7,.55]){const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',quality));if(blob?.type==='image/webp'&&blob.size<=EVIDENCE_MAX_BYTES){return await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('No se pudo leer la imagen.'));reader.readAsDataURL(blob);});}}
  throw new Error('No se pudo reducir la imagen. Prueba con una más pequeña.');
 }finally{bitmap.close();}
}

export function EvidenceField({value,onChange,onBusy}:{value:string|null;onChange:(v:string|null)=>void;onBusy:(v:boolean)=>void}){
 const id=useId();const input=useRef<HTMLInputElement>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [open,setOpen]=useState(false);
 async function select(file?:File){if(!file)return;setBusy(true);onBusy(true);setError('');try{onChange(await prepareImage(file));}catch(e){setError(e instanceof DOMException?'No se pudo abrir la imagen. Prueba con otro archivo.':e instanceof Error?e.message:'No se pudo abrir la imagen.');}finally{setBusy(false);onBusy(false);if(input.current)input.current.value='';}}
 return <section className="evidence-field" aria-labelledby={id}><div className="evidence-field-heading"><h3 id={id}>Prueba gráfica</h3><span>Opcional</span></div><p>Una imagen que ayude a entender el caso.</p><input ref={input} className="sr-only" type="file" tabIndex={-1} accept="image/jpeg,image/png,image/webp" aria-label="Seleccionar prueba gráfica" onChange={e=>select(e.target.files?.[0])}/>{value?<div className="evidence-attached"><button className="evidence-preview" onClick={()=>setOpen(true)} aria-label="Ampliar imagen seleccionada"><img src={value} alt="Vista previa de tu prueba gráfica"/><span><Expand size={18}/>Ampliar</span></button><div className="evidence-edit-actions"><button disabled={busy} onClick={()=>input.current?.click()}>Cambiar imagen</button><button disabled={busy} onClick={()=>onChange(null)}><Trash2 size={16}/>Quitar</button></div><EvidenceViewer src={value} open={open} onOpenChange={setOpen}/></div>:<button className="evidence-upload" disabled={busy} onClick={()=>input.current?.click()}>{busy?<LoaderCircle className="spin" size={24}/>:<ImagePlus size={24}/>}<span>{busy?'Preparando imagen…':'Añadir imagen'}</span></button>}{busy&&value&&<p role="status">Preparando imagen…</p>}<small>JPG, PNG o WebP · Hasta 10 MB</small>{error&&<p className="evidence-error" role="alert">{error}</p>}</section>;
}
