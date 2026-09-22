# ZANJA Design System 1.0 — Electric Rift

## 1. Principio de marca
ZANJA no se diseña como una red social genérica ni como un videojuego infantil. La línea visual es **social game / Electric Rift**: superficies oscuras editoriales, color saturado reservado para decisiones y modos, geometría de choque, profundidad física corta y motion expresivo.

La firma visual principal es la **grieta / corte**: dos campos que compiten y se encuentran en una frontera quebrada. El VS habita ese punto de tensión.

## 2. Paleta oficial

| Token | Hex | Uso |
|---|---|---|
| Ink 950 | `#080D20` | fondo profundo / sombras |
| Ink 900 | `#0B1026` | fondo principal |
| Ink 850 | `#101733` | superficies oscuras |
| Ink 800 | `#151D3E` | cards / controles |
| Ink 700 | `#202A53` | superficies elevadas |
| Snow | `#F8F9FF` | texto principal |
| Mist | `#ADB5D8` | texto secundario |
| ZANJA Violet | `#7456FF` | marca, debate semanal, sistema |
| A Cyan | `#27C9E8` | Bando A |
| B Coral | `#FF625D` | Bando B |
| Signal Yellow | `#FFD54A` | AMBOS, CTA, recompensa, VS |
| Live Pink | `#FF4FA3` | estados live / urgencia |
| Positive Green | `#91E66C` | confirmaciones puntuales |

### Reglas
- Cyan = A. Nunca se reasigna.
- Coral = B. Nunca se reasigna.
- Yellow = AMBOS, premio, VS, CTA principal.
- Pink = LIVE solamente.
- Verde no representa “ganador” porque el resultado es opinión colectiva, no verdad objetiva.
- Violeta pertenece a marca/sistema y al Debate Semanal.
- Verde marca además la verificación: no es un veredicto de opinión, es una comprobación de normas.

## 3. Tipografía

### Familias
- **Display:** Bricolage Grotesque 700–800.
- **UI / lectura:** Manrope 600–800.

### Escala móvil
| Rol | Tamaño |
|---|---|
| Hero | 36–46 px |
| H1 | 31–39 px |
| H2 | 24–30 px |
| H3 / card title | 20–26 px |
| Argumentos / body importante | 16–19 px |
| Body | 16 px |
| Botón principal | 18–21 px |
| Botón secundario | 16–18 px |
| Label | 11 px |
| Caption | 10 px |

### Reglas
- Nunca usar inputs o botones esenciales a 11–12 px.
- Preguntas de caso: máximo 2–4 líneas según viewport; deben dominar la pantalla.
- Argumentos: máximo 3 por lado, preferiblemente 1 línea, máximo 2.
- Mayúsculas + tracking solo para labels y navegación, nunca para párrafos.

## 4. Retícula
- Unidad base: **4 px**.
- Espaciado principal: `8 / 12 / 16 / 20 / 24 / 32 / 40`.
- Gutter móvil estándar: **16 px**.
- Viewport de referencia: **390 × 844**.
- Ninguna pantalla de juego depende de scroll documental.
- Pantallas de configuración/perfil sí pueden hacer scroll controlado.

## 5. Radios
- Controles: 16 px.
- Cards: 22 px.
- Hero / battlefield: 28–30 px.
- Pills: 999 px solo cuando semánticamente son etiquetas.

## 6. Profundidad
Dos sistemas:
1. **Physical shadow:** 4–7 px verticales para botones/VS.
2. **Ambient shadow:** blur suave solo en overlays o sheets.

No mezclar múltiples estilos de sombra sin función.

## 7. Botones
### Acción principal
- 64 px de alto.
- Yellow.
- Texto 20–21 px display.
- Profundidad corta.

### Acción secundaria
- 56–58 px.
- Superficie Ink 700.
- Borde visible.

### Voto
- A Cyan / AMBOS Yellow / B Coral.
- Carcasa Ink 950.
- Cara elevada con highlight superior.
- A y B con inclinación exterior sutil; AMBOS recto.
- 68 px estándar; nunca menos de 45 px en viewport bajo.

## 8. Formas
- Diagonal maestra: 12°.
- La grieta usa pocos quiebros grandes, no un serrucho decorativo.
- A y B deben compartir una frontera visual coherente.
- El VS se coloca en el nodo del choque, no en una “tercera tarjeta”.

## 9. Motion
### Ambient
- Pattern drift al noreste: 28 s lineal.
- VS breathing: 2.8 s suave.

### Event
- Entrada de pregunta: 300–480 ms.
- Entrada arena: 500–750 ms.
- Entrada VS: spring 580 ms.
- Press: 100–140 ms.
- Reveal: 400–550 ms.
- Salida de caso: 250–350 ms.
- Countdown: 5 s exactos.

### Por modo
- **Arena:** la carta permanece fija; el bando al que apunta el gesto se realza y aparece su sello.
- **Semanal:** fases que avanzan de izquierda a derecha.
- **Zanjar:** piezas que se ensamblan.
- **Verificación:** balanza, sin dramatismo.

## 10. Sonido y haptics
No música continua. Solo sonido ligado a acción.
- tap
- toque sobre un bando
- voto
- reveal
- final de cola
- ZÁNJALO
- logro

Todos deben funcionar también en silencio. Haptics se degradan con seguridad en navegadores sin `navigator.vibrate`.

## 11. Accesibilidad
- Target táctil mínimo: 48 × 48 px.
- No depender solo de color.
- `prefers-reduced-motion` reduce motion.
- Contraste alto entre texto y superficies.
- Inputs y labels visibles, no placeholders como única etiqueta.

## 12. Componentes oficiales
- AppHeader (marca + XP pod + racha)
- TodayBlock (misión diaria + Caso del Día en un mismo marco; la misión se oculta al completarse)
- BottomNav de cinco ranuras, con NavCreate elevado en el centro
- WeeklyCard y PhaseRail
- OpenCasesNudge (aviso, no entrada de menú)
- RecentRow (veredicto juzgado: pregunta, reparto del jurado y tu voto)
- HubRow (Mis Zanjas / Verificación, con su candado de nivel)
- CaseQuestion (con chips de prueba y denuncia)
- CaseCard (dos bandos apilados; cada bando es el botón de voto)
- VoteDock (fijo abajo, con el botón ancho de AMBOS)
- FilterChip / FilterSheet
- ResultBars
- CountdownButton
- ActionButton
- Field / TextArea / SegmentedControl
- StateChip (zanjándose / zanjado / retirado / en revisión)
- MineCard
- VerifyCard
- ProposalRow
- AchievementCard
- ActivityItem
- Sheet (compartir, denuncia, visor de prueba)

Cualquier pantalla nueva debe construirse con estos componentes antes de inventar una variante nueva.
