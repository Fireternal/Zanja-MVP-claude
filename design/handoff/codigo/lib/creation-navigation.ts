// Once an invitation exists, the authored defenses are locked on the server.
// Back from its waiting screen returns to the caller instead of a dead end.
export function creationBack(step:number,route:'choose'|'local',pending:boolean,published:boolean):'home'|'close'|'choose'|number{
 if(published)return 'home';
 if(pending)return step>3?3:'close';
 if(step===3&&route==='local')return 'choose';
 return step>1?step-1:'close';
}
