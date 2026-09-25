import {env} from 'cloudflare:workers';
export function db():D1Database {if(!env.DB) throw new Error('Database unavailable'); return env.DB;}

export function bucket():R2Bucket {if(!env.BUCKET) throw new Error('Image storage unavailable'); return env.BUCKET;}
