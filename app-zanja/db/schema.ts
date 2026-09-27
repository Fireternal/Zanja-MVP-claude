import {sqliteTable,text,integer,blob,primaryKey,index} from 'drizzle-orm/sqlite-core';
export const cases = sqliteTable('cases', {id:text('id').primaryKey(),owner:text('owner').notNull(),q:text('q').notNull(),tag:text('tag').notNull(),at:text('at').notNull(),a:text('a').notNull(),bt:text('bt').notNull(),b:text('b').notNull(),emoji:text('emoji').notNull(),created:integer('created').notNull(),closes:integer('closes').notNull(),status:text('status').notNull(),story:text('story').notNull().default(''),audience:text('audience').notNull().default('public'),workflow:integer('workflow').notNull().default(0),evidence:text('evidence'),invite:text('invite'),respondent:text('respondent'),answered:integer('answered').notNull().default(0),duration:integer('duration').notNull()}, t=>[index('cases_owner').on(t.owner),index('cases_status').on(t.status)]);
export const votes = sqliteTable('votes',{caseId:text('case_id').notNull(),userId:text('user_id').notNull(),choice:text('choice').notNull(),at:integer('at').notNull()},t=>[primaryKey({columns:[t.caseId,t.userId]}),index('votes_user').on(t.userId)]);
export const reports = sqliteTable('reports',{caseId:text('case_id').notNull(),userId:text('user_id').notNull(),reason:text('reason').notNull(),at:integer('at').notNull()},t=>[primaryKey({columns:[t.caseId,t.userId]})]);
// La Sala: lo que dice el jurado después de votar. Un comentario por persona
// y caso, sin respuestas, y SECUNDAR en vez de me gusta.
export const comments = sqliteTable('comments',{id:text('id').primaryKey(),caseId:text('case_id').notNull(),userId:text('user_id').notNull(),name:text('name').notNull().default('Jurado'),side:text('side').notNull(),body:text('body').notNull(),at:integer('at').notNull()},t=>[index('comments_case').on(t.caseId),index('comments_author').on(t.caseId,t.userId)]);
export const seconds = sqliteTable('seconds',{commentId:text('comment_id').notNull(),userId:text('user_id').notNull(),at:integer('at').notNull()},t=>[primaryKey({columns:[t.commentId,t.userId]})]);
// El Pulso: un voto por persona y día. RETIRADO: la app ya no lee ni escribe
// aquí. La tabla se queda porque borrarla sería una migración destructiva
// sobre datos que alguien pudo generar, y no estorba. Cuando se decida
// tirarla, es un DROP TABLE en una migración propia.
export const pulse = sqliteTable('pulse',{day:integer('day').notNull(),userId:text('user_id').notNull(),choice:text('choice').notNull(),at:integer('at').notNull()},t=>[primaryKey({columns:[t.day,t.userId]}),index('pulse_day').on(t.day)]);

// La campana. No se guardan los avisos —se deducen—, sólo cuándo miraste.
export const seen = sqliteTable('seen',{userId:text('user_id').primaryKey(),at:integer('at').notNull()});

// Las cuentas. Se guarda la huella de la contraseña, nunca la contraseña, y
// las vueltas con las que se calculó, para poder subirlas más adelante sin
// invalidar las cuentas que ya existen. Ver app/api/auth/LEEME.md.
export const users = sqliteTable('users',{
 uid:text('uid').primaryKey(),
 name:text('name').notNull(),
 handle:text('handle').notNull().unique(),
 hash:text('hash').notNull(),
 salt:text('salt').notNull(),
 rounds:integer('rounds').notNull(),
 created:integer('created').notNull(),
 fails:integer('fails').notNull().default(0),
 blocked:integer('blocked').notNull().default(0)});

// Las pruebas gráficas viven aquí y no en R2 a propósito: R2 cobra por uso
// desde el primer byte que pasa de su cuota, y Cloudflare no tiene tope duro
// de gasto. D1 sí lo tiene —al llenarse devuelve error y deja de escribir,
// pero no cobra nunca—, así que la beta corre sin ninguna vía de factura.
// Con un bucket atado se sigue usando el bucket; ver lib/almacen.ts.
export const evidence = sqliteTable('evidence',{
 clave:text('clave').primaryKey(),
 bytes:blob('bytes',{mode:'buffer'}).notNull(),
 at:integer('at').notNull(),
});
