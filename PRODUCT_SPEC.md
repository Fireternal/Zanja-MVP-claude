# ZANJA Beta — Product Spec

## North Star
**Casos que completan su ciclo**: se publican, reúnen jurado suficiente y llegan a veredicto. La métrica secundaria es cuántos usuarios recorren más de una etapa del ciclo (juzgar → crear → seguir → verificar).

## Promesa
ZANJA convierte pequeñas discusiones en una experiencia social rápida: dos bandos, un jurado, un veredicto.

## El ciclo
El producto no son modos independientes, es un ciclo:

```
ZANJAR ──▶ ARENA ──▶ MIS ZANJAS ──▶ VERIFICACIÓN
(creas)    (juzgan)   (sigues)       (la comunidad
                                      se autorregula)
```

El Caso del Día y el Debate Semanal son rituales transversales que dan motivo para volver.

## Arquitectura

### 1. Arena Live
**Job:** «Quiero opinar.»
- Casos abiertos de comunidad.
- Pregunta: «¿A quién das la razón?»
- No existe score de acierto.
- Voto → resultado provisional → 5 s → siguiente.
- Quedan fuera de la cola: los que ya votaste, los que denunciaste, los retirados y los que acumulan 3 denuncias.
- Arena Daily Goal: 5 votos protegen la racha.

### 2. Zanjar
**Job:** «Quiero resolver mi discusión.»
1. Cuéntalo (texto libre, con prueba fotográfica opcional).
2. Edita pregunta + defensa A.
3. Invita a B, o responde como B en local.
4. Elige audiencia y duración.
5. ZÁNJALO.

Regla: B redacta sin ver la defensa A en el producto final.

### 3. Mis Zanjas
**Job:** «¿Qué ha pasado con lo mío?»
- Lista de los casos que has publicado.
- Estado: **zanjándose** (con cuenta atrás), **zanjado** (con veredicto) o **retirado**.
- Reparto A / AMBOS / B y total de votos.
- Aviso visible si el caso está en revisión por denuncias.

### 4. Verificación
**Job:** «Que esto no se llene de basura.»
- Se desbloquea en el **nivel 5** (600 XP). Antes, la pantalla explica cómo llegar.
- Cola de casos denunciados, con el motivo y el número de denuncias.
- Dos decisiones: **RETIRAR** o **MANTENER**.
- Al llegar a **5 votos** gana la mayoría simple. Un caso retirado deja de contar.
- No se verifican los casos propios.

### Caso del Día
Ritual transversal: un caso único para toda la comunidad, 24 h, cierre ZANJADO.

### Debate Semanal
Ritual de ciclo largo, con fase según el día:

| Días | Fase | Qué pasa |
|---|---|---|
| Lun–Mar | Propuestas | Cualquiera propone un tema con sus dos bandos |
| Mié | Elección | Un voto por persona entre los candidatos |
| Jue–Dom | Debate | El ganador se abre como caso destacado |
| Dom 23:59 | Zanjado | Se cierra y pasa al histórico |

### Actividad
Retorno diferido: caso juzgado que cierra, B respondió, logro desbloqueado, racha protegida, caso propio publicado, denuncia enviada, decisión de verificación.

### Tú / Instinto
Coincidencia con el jurado, XP y nivel, racha, distribución A / AMBOS / B, logros, histórico.

## Moderación

### Denuncia
Disponible desde la vista de votación de cualquier caso. Cinco motivos: ataque personal o acoso, datos privados, contenido sexual o violento, spam o publicidad, otro.

### Umbrales
- **1 denuncia** → el caso muestra el aviso *en revisión* pero se sigue pudiendo votar. Una denuncia falsa no censura nada por sí sola.
- **3 denuncias** → sale de Arena mientras se decide.
- Quien denuncia deja de verlo en su cola inmediatamente.

### Decisión
La toman los verificadores, no el sistema. Mayoría simple a los 5 votos.

## Recompensas

### XP
Refleja participación, no tener razón.

| Acción | XP |
|---|---|
| Voto en Arena | +5 |
| Verificación emitida | +10 |
| Caso del Día | +15 |
| Propuesta semanal | +15 |
| Voto del debate semanal | +25 |
| Caso publicado | +40 |

150 XP por nivel.

### Racha
Se protege con una actividad significativa: 5 votos en Arena, el Caso del Día, el debate semanal, publicar un caso o emitir una verificación. La misión diaria desaparece de la portada al cumplirse; la racha sigue visible en la cabecera.

### Logros
16 logros en cuatro familias: participación, perfil de criterio, comunidad (semanal) y responsabilidad (verificación).

## Registro progresivo
La beta frontend no fuerza cuenta. En producto real:
- votar y responder puede ser guest;
- se pide cuenta para guardar racha/XP/logros, publicar un caso o verificar.

## Lo que NO entra todavía
- comentarios;
- DMs;
- followers;
- tienda;
- monedas / energía;
- ranking global de «mejor juez».

## Backend requerido para beta multiusuario
Supabase debería incorporar:
- users
- cases
- case_media
- sides
- arguments
- votes
- invitations
- weekly_cycles
- weekly_proposals
- weekly_proposal_votes
- reports
- verifications
- achievements
- activity_events
- notification_preferences

Reglas críticas en servidor:
- voto único por user/case;
- resultado oculto antes de voto;
- B no accede a A antes de enviar;
- cierre temporizado en servidor;
- cálculo final de veredicto en servidor;
- umbrales de denuncia y quórum de verificación aplicados en servidor, nunca en cliente;
- el nivel que habilita verificación se comprueba en servidor;
- almacenamiento y moderación de las pruebas fotográficas.
