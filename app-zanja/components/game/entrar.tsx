'use client';
// Entrar en ZANJA.
//
// Hasta ahora bastaba con escribir un nombre: quien escribiera el tuyo entraba
// como tú, votaba por ti y borraba tus casos. Con una contraseña el nombre
// identifica y la contraseña demuestra. Ver app/api/auth/LEEME.md.
import {useState} from 'react';
import {ArrowRight,Eye,EyeOff,LoaderCircle,UserRound} from 'lucide-react';
import {DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {CLAVE_MIN} from '@/lib/passwords';
import {NAME_MIN,NAME_MAX} from '@/lib/session';

export type Credenciales={name:string;password:string;registrar:boolean};

export function Entrar({ocupado,onEnviar,onSalir}:{ocupado:boolean;onEnviar:(c:Credenciales)=>Promise<string|null>;onSalir:()=>void}){
 const [registrar,setRegistrar]=useState(false);
 const [name,setName]=useState(''),[password,setPassword]=useState('');
 const [verClave,setVerClave]=useState(false),[error,setError]=useState('');

 const listo=name.trim().length>=NAME_MIN&&password.length>=CLAVE_MIN&&!ocupado;
 async function enviar(e:React.FormEvent){
  e.preventDefault();
  if(!listo)return;
  setError('');
  const fallo=await onEnviar({name:name.trim(),password,registrar});
  if(fallo)setError(fallo);
 }
 function cambiar(aRegistrar:boolean){
  setRegistrar(aRegistrar);setError('');
 }

 return <>
  <span className="success-emblem"><UserRound size={44}/></span>
  <DialogTitle>{registrar?'Crea tu cuenta.':'Tu voto merece contar.'}</DialogTitle>
  <DialogDescription>{registrar
   ?'El nombre es con el que te verán en La Sala. La contraseña es para que nadie más pueda ser tú.'
   :'Entra para votar una sola vez por caso y que tu progreso sea tuyo.'}</DialogDescription>

  <div className="entrar-modos" role="tablist">
   <button role="tab" aria-selected={!registrar} className={registrar?'':'elegido'} onClick={()=>cambiar(false)}>Entrar</button>
   <button role="tab" aria-selected={registrar} className={registrar?'elegido':''} onClick={()=>cambiar(true)}>Crear cuenta</button>
  </div>

  <form className="signin-form" onSubmit={enviar}>
   <label className="creator-label" htmlFor="entrar-nombre">TU NOMBRE EN LA SALA</label>
   <input id="entrar-nombre" value={name} onChange={e=>setName(e.target.value)} maxLength={NAME_MAX}
    autoComplete="username" placeholder="Lucía" autoFocus disabled={ocupado}/>

   <label className="creator-label" htmlFor="entrar-clave">CONTRASEÑA</label>
   <div className="campo-clave">
    <input id="entrar-clave" type={verClave?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
     maxLength={200} autoComplete={registrar?'new-password':'current-password'}
     placeholder={registrar?`Mínimo ${CLAVE_MIN} caracteres`:'Tu contraseña'} disabled={ocupado}/>
    <button type="button" className="icon-btn" onClick={()=>setVerClave(v=>!v)}
     aria-label={verClave?'Ocultar la contraseña':'Ver la contraseña'}>{verClave?<EyeOff size={19}/>:<Eye size={19}/>}</button>
   </div>

   {error&&<p className="entrar-error" role="alert">{error}</p>}

   <button className="game-btn yellow" type="submit" disabled={!listo}>
    {ocupado?<LoaderCircle className="spin"/>:<>{registrar?'CREAR MI CUENTA':'ENTRAR'}<ArrowRight size={20}/></>}
   </button>
  </form>

  <p className="signin-note">{registrar
   ?'Sin correo y sin datos personales: sólo un nombre y una contraseña. Si la pierdes no hay forma de recuperarla, así que apúntala.'
   :'¿Todavía no tienes cuenta? Cámbiate a «Crear cuenta» aquí arriba.'}</p>
  <button className="quiet-btn" onClick={onSalir} disabled={ocupado}>Seguir explorando</button>
 </>;
}
