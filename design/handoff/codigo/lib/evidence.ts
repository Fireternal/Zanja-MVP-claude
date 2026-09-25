export const EVIDENCE_MAX_BYTES=750_000;
export function decodeEvidence(value:unknown):Uint8Array|null{
 if(value==null||value==='')return null;
 if(typeof value!=='string'||value.length>1_000_024||!/^data:image\/webp;base64,[A-Za-z0-9+/]+={0,2}$/.test(value))throw new Error('La imagen no tiene un formato válido. Vuelve a seleccionarla.');
 let raw:string;try{raw=atob(value.slice(23));}catch{throw new Error('No se pudo leer la imagen. Vuelve a seleccionarla.');}
 const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
 if(bytes.length<20||bytes.length>EVIDENCE_MAX_BYTES||raw.slice(0,4)!=='RIFF'||raw.slice(8,12)!=='WEBP'||!['VP8 ','VP8L','VP8X'].includes(raw.slice(12,16)))throw new Error('Selecciona una imagen WebP válida de menos de 750 KB.');
 const declared=new DataView(bytes.buffer).getUint32(4,true)+8;
 if(declared!==bytes.length)throw new Error('La imagen está incompleta. Vuelve a seleccionarla.');
 return bytes;
}
export async function boundedJson(req:Request){
 const reader=req.body?.getReader();if(!reader)throw new Error('Solicitud vacía.');
 const chunks:Uint8Array[]=[];let length=0;
 try{while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>1_050_000){await reader.cancel();throw new Error('La imagen es demasiado grande. Selecciónala de nuevo.');}chunks.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 return JSON.parse(new TextDecoder().decode(bytes));
}
