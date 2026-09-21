# ZANJA Beta — Product Spec

## North Star
**Sesiones de criterio completas por usuario activo**, observando además cross-mode: cuánto usuario termina un modo y empieza otro distinto.

## Promesa
ZANJA convierte pequeñas discusiones en una experiencia social rápida: dos bandos, un jurado, un veredicto.

## Arquitectura

### 1. Arena Live
**Job:** “Quiero opinar.”
- Casos abiertos de comunidad.
- Pregunta: “¿A quién das la razón?”
- No existe score de “acierto”.
- Voto → resultado provisional → 5 s → siguiente.
- Los casos votados pueden reaparecer después como “ZANJADO” en Actividad.
- Arena Daily Goal: 5 votos protegen la racha.

### 2. Pulso
**Job:** “Quiero jugar.”
- 7 casos.
- Pregunta: “¿Qué votará el jurado?”
- Correcto = predecir mayoría.
- Score, combo, mejor marca y final de partida.
- Diferencia semántica explícita respecto a Arena.

### 3. Choque
**Job:** “Quiero compararme con alguien.”
- 7 casos compartidos.
- Tus respuestas y las del rival permanecen ocultas hasta el final.
- Resultados: % acuerdo, coincidencias, choques y mayor desacuerdo.
- Revanchas y sharing.
- La beta incluye rival demo local; la sincronización real necesita backend.

### 4. Zanjar
**Job:** “Quiero resolver mi discusión.”
1. Cuéntalo.
2. Edita pregunta + defensa A.
3. Invita a B / respuesta local beta.
4. Elige audiencia y duración.
5. ZÁNJALO.

Regla: B redacta sin ver la defensa A en el producto final.

### Caso del Día
No es un modo independiente. Es un ritual transversal:
- un caso único para toda la comunidad;
- 24 h;
- resultados ocultos hasta votar;
- cierre ZANJADO.

### Actividad
Retorno diferido:
- caso juzgado que cierra;
- B respondió;
- Choque terminado;
- logro desbloqueado;
- racha protegida;
- caso propio publicado.

### Tú / Instinto
- coincidencia con jurado;
- XP / nivel;
- racha;
- distribución A / AMBOS / B;
- logros;
- históricos.

## Recompensas
### XP
Refleja participación, no “tener razón”.
- Arena: +5/voto.
- Caso del Día: +15.
- Pulso: +40 al terminar +10/acierto.
- Choque: +30 al terminar.
- Zanjar: +40 al publicar.

### Racha
Se protege con una actividad significativa:
- 5 votos Arena, o
- Caso del Día, o
- Pulso completo, o
- Choque completo, o
- caso publicado.

### Logros
16 logros iniciales en cuatro familias:
- participación;
- perfil de criterio;
- Pulso;
- social / Zanjar.

## Registro progresivo
La beta frontend no fuerza cuenta. En producto real:
- votar / probar Pulso / responder Choque puede ser guest;
- cuenta se pide para guardar racha/XP/logros o publicar un caso.

## Lo que NO entra todavía
- comentarios;
- DMs;
- followers;
- tienda;
- monedas / energía;
- ranking global de “mejor juez”.

## Backend requerido para beta multiusuario real
Supabase debería incorporar:
- users
- cases
- sides
- arguments
- votes
- invitations
- clash_sessions
- clash_votes
- achievements
- activity_events
- reports
- notification_preferences

Reglas críticas en servidor:
- voto único por user/case;
- resultado oculto antes de voto;
- B no accede a A antes de enviar;
- cierre temporizado en servidor;
- cálculo final de veredicto en servidor;
- reporting y moderación.
