import {Check,Users} from 'lucide-react';
export function CreatorClash({ready=false}:{ready?:boolean}){
 return <div className="creator-versus creator-clash" role="img" aria-label={ready?'Bandos A y B preparados':'Bando A preparado. Esperando al bando B.'}>
  <span className="clash-a" aria-hidden="true">A<Check size={18}/></span>
  <b aria-hidden="true">VS</b>
  <span key={ready?'ready':'waiting'} className={'clash-b '+(ready?'clash-ready':'pending')} aria-hidden="true">B{ready?<Check size={18}/>:<Users size={18}/>}</span>
 </div>;
}
