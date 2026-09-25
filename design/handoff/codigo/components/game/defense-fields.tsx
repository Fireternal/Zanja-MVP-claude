'use client';
import {GrowingTextarea} from './growing-textarea';
import {useId} from 'react';
import {Check} from 'lucide-react';
import {DEFENSE_MIN,DEFENSE_MAX,validDefenses} from '@/lib/cases';
type Props={side:'a'|'b';values:string[];onChange:(values:[string,string,string])=>void;};
export function DefenseFields({side,values,onChange}:Props){
 const id=useId();const letter=side.toUpperCase();const hints=['Escribe tu primera defensa','Escribe tu segunda defensa','Escribe tu tercera defensa'];
 return <fieldset className={'defense-editor editor-'+side+(validDefenses(values)?' is-complete':'')}><legend><span>{letter}</span>LAS 3 DEFENSAS DE {letter}</legend><p className="defense-instructions">Tres motivos distintos, de 12 a 160 caracteres cada uno.</p><div className="defense-fields">{[0,1,2].map(i=>{const text=values[i]||'';const valid=text.trim().length>=DEFENSE_MIN&&text.trim().length<=DEFENSE_MAX;return <div className="defense-field" key={i}><label htmlFor={id+'-'+i}><span>{String(i+1).padStart(2,'0')}</span>Defensa {i+1}{valid&&<Check size={15} aria-label="Longitud válida"/>}</label><GrowingTextarea id={id+'-'+i} required minLength={DEFENSE_MIN} maxLength={DEFENSE_MAX} rows={2} value={text} placeholder={hints[i]} aria-describedby={id+'-hint-'+i} onChange={e=>{const next:[string,string,string]=[values[0]||'',values[1]||'',values[2]||''];next[i]=e.target.value;onChange(next);}}/><small id={id+'-hint-'+i}>{text.length}/{DEFENSE_MAX} · mínimo {DEFENSE_MIN} caracteres</small></div>;})}</div>{values.every(x=>x.trim().length>=DEFENSE_MIN)&&!validDefenses(values)&&<p className="defense-error" role="status">Cada defensa debe ser distinta y tener como máximo {DEFENSE_MAX} caracteres.</p>}</fieldset>;
}
