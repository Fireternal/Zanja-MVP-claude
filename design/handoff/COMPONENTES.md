# Inventario de componentes

Estados: **normal** = apariencia de reposo; **pulsado** = feedback durante el toque; **deshabilitado** = no permite actuar; **bloqueado** = restricción persistente de permisos o desbloqueo. “No diseñado” no equivale a que el navegador no pueda deshabilitarlo. Los estados seleccionados y de carga se documentan aparte. Los selectores y valores completos están en ESTILOS-EXACTOS.md.

| Pieza / implementación | Normal | Pulsado | Deshabilitado | Bloqueado / otros estados |
|---|---|---|---|---|
| Botón principal `.game-btn.yellow` | Titan One, amarillo en degradado, borde2px, radio12px, bisel5px | Traslación vertical; reglas exactas dependen de contexto | Opacidad .65 global, .45 en creador; evita envío duplicado | No se diseñó candado propio; autenticación abre modal |
| Botón secundario `.creator-secondary` | Violeta, contorno2px, relieve4px, mín48px | translateY(2px), relieve2px | Hereda opacidad global | No diseñado |
| Acción discreta `.quiet-btn` | Texto y posible icono; mínimo44px en contextos móviles | Transición global, sin estado especial uniforme | HTML disabled cuando procede | No diseñado |
| Botón de icono / toolbar |42×42px, violeta, borde2px, radio12px | Transición global; sin relieve pulsado propio uniforme | Hereda disabled | No diseñado; filtro activo añade punto amarillo |
| Logo ZANJA / etiqueta beta | Marca tipográfica con rayo y amarillo | No específico | No aplica | No aplica |
| Reiniciar DEV `.dev-reset` | Contorno discontinuo, junto al logo | Sin estado específico | Opacidad .5 mientras busy | Sin control de rol dev; temporal, eliminar antes de producción |
| Cinta de reto `.mission-tile` | Progreso de cinco segmentos; icono y contador | Sin estado específico propio | No diseñado | Segmentos completados amarillos; sin bloqueo |
| Hero Juzgado `.mobile-lobby-hero` | Imagen arena-menu.webp, marco y titular; CTA separado | Lo gestiona CTA | Lo gestiona CTA | No diseñado |
| Caso del día `.daily-feature` | Imagen integrada; pregunta sobre fondo, sin recuadro inferior | translateY(3px), sombra2px | No específico | No diseñado |
| Tile Mis zanjas / Crear zanja `.home-shortcut` | Imagen, mismo titular, flecha abajo derecha38px; Crear amarillo | translateY(3px), sombra2px | No específico | No diseñado |
| Navegación inferior `.mobile-nav` | Cinco posiciones; crear central elevado | Crear baja de -8 a -4px | No específico | Activa amarilla con marca superior; sin bloqueo |
| Chip nivel / etiqueta / estado | Superficie y color según nivel/estado | No interactivo por sí mismo | No aplica | Etiquetas waiting/ready/closed/review, no candado visual general |
| Pregunta VS `.duel-prompt` | Titan One21–27px, máximo3 líneas en resumen | No aplica | No aplica | Leer contexto/pregunta completa abre diálogo; no ocultar texto sin alternativa |
| Miniatura de prueba `.case-photo` |60×66px, borde2px, etiqueta Prueba | Sin variante propia | No se muestra si falta prueba | Restricciones/errores de acceso en visor |
| Tarjeta votable A/B `.vote-team`, `.team-vote` | Azul/cian o rosa/coral; tres defensas; fondo energético en cabecera | Brillo1.14; selección animada .45s | Conserva opacidad1 y deja de actuar | Propietario/participante/caso no abierto: voto impedido; no candado dibujado. Selección borde amarillo, spinner al enviar, check al confirmar |
| Defensa enumerada `.vote-argument` | Nunito Sans16px/800, número en placa23px | No control independiente | No aplica | Las tres visibles en el mismo contenedor; scroll interno si no caben |
| Sello VS `.battle-vs` |44×33px, amarillo, rotación-7° | No interactivo | No aplica | Entrada con escala/rotación; sin bloqueo |
| Tercera opción Ambos `.vote-both` | Violeta ilustrado,68px (58px compacto), título26px y explicación | translateY(3px), sombra2px | Opacidad1 y no actúa | Misma lógica de elegibilidad/selección que A/B |
| Saltar zanja `.battle-footer` | Centrado abajo, mínimo40px | Sin variante específica | Mientras voto pendiente | Cambia por invitar/completar/ver resultado según caso |
| Cabecera veredicto `.verdict-banner` | Fondo energético, pregunta, confirmación y recompensa | No aplica | No aplica | Marca voto registrado solo con respuesta válida |
| Tarjeta porcentaje `.verdict-card` | A azul, Ambos violeta, B rosa; número grande y barra | No interactiva | No aplica | Elección propia borde dorado; cero votos visible; recuentos ocultos según permisos |
| Barra Progress | Fondo oscuro, relleno de color por contexto | No aplica | No aplica | Transición .6s resultados; no progreso ficticio |
| Siguiente / NextCountdown | Acción amarilla,4s, barra que se vacía | Hereda botón principal | Pausado no equivale a disabled | Pausa/reanuda; se detiene con documento oculto o diálogo abierto; siguiente manual disponible |
| Confeti `.party-burst` | No visible en reposo | Se dispara con resultado nuevo | Desaparece con movimiento reducido | Sin bloqueo |
| Cabecera del creador | Atrás, título, cerrar; cuatro etapas | Botones de icono | Busy evita acciones conflictivas | Volver depende de paso/ruta; no confundir atrás con cerrar |
| Progreso creador `.creator-progress` | Cuatro segmentos y etiquetas | No clickable | No aplica | Etapa actual y completadas; no navegación directa arbitraria |
| GrowingTextarea / relato | Fondo morado,16px, crece con contenido; alto185–290px inicial | Focus amarillo | Envío/carga según pantalla | Story readonly al pasar a defensas; no textarea editable en paso2 |
| Panel relato `.creator-account` | Mín135px, texto19px/900, etiqueta18px | No interactivo | No aplica | Solo lectura; min115px y texto18px en alturas<700px |
| DefenseFields A/B | Tres campos, azul o rosa, placeholders ordinales | Focus; check de longitud válido | CTA deshabilitado hasta tres defensas válidas | Longitud12–160 y distintas; error de duplicado; check individual no garantiza validez del conjunto |
| EvidenceField | Subir opcional, preview, cambiar/eliminar | Acciones ordinarias | Procesamiento de imagen impide envío | Formato/tamaño/error de lectura y reintento |
| CreatorClash | Fichas A y B; B pendiente opaca/discontinua | No interactivo | No aplica | Entrada, choque, rebote, anillo; B completa añade check |
| Opciones de ruta B | Enviar invitación amarillo; Añadir defensa de B aquí violeta; sin iconos | Estados de ambos botones | Busy | Invitación pendiente/aceptada; autor no reescribe defensa remota |
| Tarjeta de audiencia | Dos opciones; público o enlace | scale(.97) | No específico | Seleccionada borde amarillo; no paywall |
| Duración | Tres opciones15min,1h,24h | scale(.97) | No específico | Seleccionada amarilla; sin bloqueo |
| Selector tema | Select con fuente16px | Control nativo/focus | No específico | No diseñado |
| Publicación `.case-opening` | Emblema112px, puerta dorada | No interactivo | No aplica | Puerta cerrada gira y revela abierta; check final; versión estática con movimiento reducido |
| Tarjeta Mis zanjas `.saved-case` | Pregunta, estado, acciones | Botones internos | Según estado/permiso | Incompleta: completar; esperando: invitar; lista: publicar; cerrada: resultados; revisión: restringida |
| Pestañas creadas/votadas | Selector de dos vistas | Estado global | No específico | Seleccionada; sin bloqueo |
| Medalla/estadísticas perfil | Nivel,XP, votos,creaciones | No interactivo | No aplica | Datos reales; no recompensa por seguir mayorías |
| Logro `.achievement` | Tarjeta e icono | No interactivo | No aplica | Sí: candado y POR DESCUBRIR; conseguido cambia clase a unlocked |
| Diálogo / bottom sheet | Portal viewport fijo; ancho≤480; alto≤viewport | Cierre con botón/acciones | Acciones busy cuando procede | Focus/escape suministrados por primitives; QA pendiente |
| Visor EvidenceViewer | Imagen contain, panel ancho≤720px | Cerrar/reintentar | Carga | Error, reintento, permisos; imagen ausente no crea botón vacío |
| Filtros | Panel con temas y recuentos | Selección | No específico | Activo en toolbar; no fila permanente consumiendo alto |
| Denuncia | Motivos tipificados y enviar | Acción principal | Sin motivo o busy | Login requerido; tres denunciantes distintos ocultan caso |
| Confirmar retirada | AlertDialog con Volver/Retirar | Botones de primitive | Busy | Solo propietario; acción irreversible |
| Ajustes | Switch sonido/movimiento | Primitive switch | No específico | Preferencia local; movimiento reducido del sistema prevalece |
| Compartir/copiar | Diálogo de enlace y acciones | Botones conocidos | Busy según flujo | Éxito copiado, error clipboard y cancelación share |
| Login | Diálogo con enlace de autenticación | Botón principal | No específico | Invita a autenticarse; no pantalla propia de credenciales |
| Toast/error/conexión | Mensaje visible según resultado | Reintentar/cerrar según contexto | No específico | Error de red/carga/voto no inventa éxito |
| Estado vacío | Título, explicación y acción | Botón conocido | No específico | Cola agotada, filtro vacío, historial vacío |

## Primitivas incluidas que no equivalen a diseño de producto

`components/ui` contiene componentes del starter. Muchos no aparecen en ninguna pantalla. Sus estados de biblioteca no constituyen una aprobación estética de ZANJA. Se entregan íntegros para que resuelvan imports; revisar uso antes de trasladarlos todos. Para cada uno, pulsado/deshabilitado/bloqueado de producto **no diseñado específicamente**, salvo las piezas descritas arriba.

- `accordion.tsx` — implementación completa en `codigo/components/ui/`.
- `alert-dialog.tsx` — implementación completa en `codigo/components/ui/`.
- `alert.tsx` — implementación completa en `codigo/components/ui/`.
- `aspect-ratio.tsx` — implementación completa en `codigo/components/ui/`.
- `attachment.tsx` — implementación completa en `codigo/components/ui/`.
- `avatar.tsx` — implementación completa en `codigo/components/ui/`.
- `badge.tsx` — implementación completa en `codigo/components/ui/`.
- `breadcrumb.tsx` — implementación completa en `codigo/components/ui/`.
- `bubble.tsx` — implementación completa en `codigo/components/ui/`.
- `button-group.tsx` — implementación completa en `codigo/components/ui/`.
- `button.tsx` — implementación completa en `codigo/components/ui/`.
- `calendar.tsx` — implementación completa en `codigo/components/ui/`.
- `card.tsx` — implementación completa en `codigo/components/ui/`.
- `carousel.tsx` — implementación completa en `codigo/components/ui/`.
- `chart.tsx` — implementación completa en `codigo/components/ui/`.
- `checkbox.tsx` — implementación completa en `codigo/components/ui/`.
- `collapsible.tsx` — implementación completa en `codigo/components/ui/`.
- `combobox.tsx` — implementación completa en `codigo/components/ui/`.
- `command.tsx` — implementación completa en `codigo/components/ui/`.
- `context-menu.tsx` — implementación completa en `codigo/components/ui/`.
- `dialog.tsx` — implementación completa en `codigo/components/ui/`.
- `direction.tsx` — implementación completa en `codigo/components/ui/`.
- `drawer.tsx` — implementación completa en `codigo/components/ui/`.
- `dropdown-menu.tsx` — implementación completa en `codigo/components/ui/`.
- `empty.tsx` — implementación completa en `codigo/components/ui/`.
- `field.tsx` — implementación completa en `codigo/components/ui/`.
- `form.tsx` — implementación completa en `codigo/components/ui/`.
- `hover-card.tsx` — implementación completa en `codigo/components/ui/`.
- `input-group.tsx` — implementación completa en `codigo/components/ui/`.
- `input-otp.tsx` — implementación completa en `codigo/components/ui/`.
- `input.tsx` — implementación completa en `codigo/components/ui/`.
- `item.tsx` — implementación completa en `codigo/components/ui/`.
- `kbd.tsx` — implementación completa en `codigo/components/ui/`.
- `label.tsx` — implementación completa en `codigo/components/ui/`.
- `marker.tsx` — implementación completa en `codigo/components/ui/`.
- `menubar.tsx` — implementación completa en `codigo/components/ui/`.
- `message-scroller.tsx` — implementación completa en `codigo/components/ui/`.
- `message.tsx` — implementación completa en `codigo/components/ui/`.
- `native-select.tsx` — implementación completa en `codigo/components/ui/`.
- `navigation-menu.tsx` — implementación completa en `codigo/components/ui/`.
- `pagination.tsx` — implementación completa en `codigo/components/ui/`.
- `popover.tsx` — implementación completa en `codigo/components/ui/`.
- `progress.tsx` — implementación completa en `codigo/components/ui/`.
- `radio-group.tsx` — implementación completa en `codigo/components/ui/`.
- `resizable.tsx` — implementación completa en `codigo/components/ui/`.
- `scroll-area.tsx` — implementación completa en `codigo/components/ui/`.
- `select.tsx` — implementación completa en `codigo/components/ui/`.
- `separator.tsx` — implementación completa en `codigo/components/ui/`.
- `sheet.tsx` — implementación completa en `codigo/components/ui/`.
- `sidebar.tsx` — implementación completa en `codigo/components/ui/`.
- `skeleton.tsx` — implementación completa en `codigo/components/ui/`.
- `slider.tsx` — implementación completa en `codigo/components/ui/`.
- `sonner.tsx` — implementación completa en `codigo/components/ui/`.
- `spinner.tsx` — implementación completa en `codigo/components/ui/`.
- `switch.tsx` — implementación completa en `codigo/components/ui/`.
- `table.tsx` — implementación completa en `codigo/components/ui/`.
- `tabs.tsx` — implementación completa en `codigo/components/ui/`.
- `textarea.tsx` — implementación completa en `codigo/components/ui/`.
- `toggle-group.tsx` — implementación completa en `codigo/components/ui/`.
- `toggle.tsx` — implementación completa en `codigo/components/ui/`.
- `tooltip.tsx` — implementación completa en `codigo/components/ui/`.
