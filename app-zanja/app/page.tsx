// La portada, en el servidor.
//
// Sólo existe para poder poner los metadatos antes de que la página llegue al
// navegador: cuando alguien comparte un caso por WhatsApp, quien recibe el
// enlace no abre la app, la abre un robot que lee estas etiquetas y con eso
// dibuja la tarjeta. Si no están, sale un rectángulo gris.
import type {Metadata} from 'next';
import {headers} from 'next/headers';
import {seeds} from '@/lib/cases';
import {db,sitioUrl} from '@/lib/server-db';
import ZanjaApp from '@/components/game/zanja-app';

const TITULO='ZANJA · Dos bandos. Un jurado. Un veredicto.';
const DESCRIPCION='Discusiones de las de siempre, con jurado. Lee las dos versiones, vota y mira cómo queda la cosa.';

/** El origen real de la petición, para que las imágenes lleven URL absoluta. */
async function origen():Promise<string>{
 try{
  const cabeceras=await headers();
  const host=cabeceras.get('x-forwarded-host')||cabeceras.get('host');
  if(host)return (cabeceras.get('x-forwarded-proto')||(host.startsWith('localhost')||host.startsWith('127.')?'http':'https'))+'://'+host;
 }catch{}
 return sitioUrl()||'https://zanja.app';
}

/**
 * La pregunta de un caso, para el título de la tarjeta.
 *
 * Sólo se anuncian los casos públicos. Uno compartido sólo por enlace puede
 * tener contexto que su autora no quiere ver en la vista previa de nadie, así
 * que ésos llevan la tarjeta genérica. Si la base de datos no contesta, se
 * anuncia lo de siempre: una tarjeta fea es mejor que una página caída.
 */
async function preguntaDe(id:string):Promise<string|null>{
 const editorial=seeds.find(c=>c.id===id);
 if(editorial)return editorial.q;
 try{
  const fila=await db().prepare("SELECT q FROM cases WHERE id=? AND audience='public' AND status IN ('open','closed')")
   .bind(id).first() as {q:string}|null;
  return fila?.q||null;
 }catch{return null;}
}

export async function generateMetadata({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}):Promise<Metadata>{
 const parametros=await searchParams.catch(()=>({} as Record<string,string|undefined>));
 const id=typeof parametros?.case==='string'?parametros.case:null;
 const caso=id?await preguntaDe(id):null;
 const base=await origen();
 const titulo=caso?`${caso} · ZANJA`:TITULO;
 const descripcion=caso?`Dos bandos, dos versiones. Entra, lee las dos y vota quién tiene razón.`:DESCRIPCION;
 const imagen=base+'/og.jpg';
 return {
  metadataBase:new URL(base),
  title:titulo,
  description:descripcion,
  manifest:'/manifest.webmanifest',
  icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'},
  openGraph:{type:'website',siteName:'ZANJA',locale:'es_ES',title:titulo,description:descripcion,
   url:id?`${base}/?case=${encodeURIComponent(id)}`:base,
   images:[{url:imagen,width:1200,height:630,alt:'ZANJA · Dos bandos. Un jurado. Un veredicto.'}]},
  twitter:{card:'summary_large_image',title:titulo,description:descripcion,images:[imagen]},
 };
}

export default function Pagina(){
 return <ZanjaApp/>;
}
