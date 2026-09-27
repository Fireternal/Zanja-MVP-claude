# Enseñarle ZANJA a alguien que no la puede tocar

Para que otra IA —o un diseñador— critique la estética, lo que funciona son
**capturas**, no el enlace ni el código. Una app de una sola página no se deja
recorrer por un navegador automático, y leer CSS no dice cómo se ve la pantalla
montada.

## Sacar las capturas

```sh
corepack pnpm vitrina
cd dist-vitrina && python3 -m http.server 8099 &
node scripts/capturar-pantallas.mjs capturas
```

Salen 26 PNG a 390×844 en doble densidad, más `00-todas-las-pantallas.png`, una
hoja de contactos con todas juntas. El script va contra la vitrina, así que las
capturas siempre traen los mismos casos de ejemplo y no enseñan datos de nadie.
El botón REINICIAR DEV se oculta: no es diseño y despista a quien revisa.

Playwright no es dependencia del proyecto. Si no lo tienes:

```sh
npm i -g playwright && npx playwright install chromium
PLAYWRIGHT_MODULO=/ruta/a/playwright/index.mjs node scripts/capturar-pantallas.mjs capturas
```

## El encargo

Sin un brief, cualquier IA contesta «se ve moderno y atractivo». Esto es lo que
hay que pegarle junto con las imágenes.

---

Eres director de arte de producto digital. Te paso las capturas de una app
móvil y quiero una crítica estética exigente, no un resumen amable.

### Qué es la app

**ZANJA** — *«Dos bandos. Un jurado. Un veredicto.»* Alguien cuenta su versión
de una discusión cotidiana, la otra parte cuenta la suya, y un jurado de
desconocidos vota quién tiene razón. Está en beta privada, es sólo móvil
(390×844) y el público es gente de 18 a 35 años que hoy resuelve esto con
encuestas de Instagram.

El tono buscado es **juego de móvil**, no red social ni herramienta: colores
saturados, biseles, sombras duras, tipografía display gorda. La referencia
mental es una app de deportes o un juego casual, no Twitter.

### El sistema visual actual

- **Display**: Titan One. **Texto**: Nunito Sans (pesos 700–1000).
- **Fondo**: morado muy oscuro (`#19112d` de marco, con un escenario animado
  detrás: focos que se mueven, motas que suben y grano).
- **Bando A**: azul `#76d9fa` / `#227eac`. **Bando B**: coral `#ffa5b5` /
  `#c45270`. **Ambos**: violeta `#b389ec`. **Ninguno**: gris malva `#9a90b4`.
- **Acción principal**: amarillo `#ffd13e` con tinta oscura.
- **Acción secundaria**: uva (morado medio, borde lila `#a37ec6`).
- Todos los botones comparten borde de 2 px `#261539`, radio 12 px y una sombra
  inferior sólida que se hunde al pulsar.

### Qué quiero de ti

Sé concreto y duro. Nada de «se ve moderno». Para cada punto: **qué pantalla,
qué elemento, qué está mal y qué harías en su lugar.**

1. **Jerarquía.** En cada pantalla, ¿lo primero que mira el ojo es lo que
   importa? ¿Dónde compite algo por atención sin merecerlo?
2. **Color.** ¿Funciona la paleta? ¿Sobra saturación? ¿Significa lo mismo cada
   color en todas las pantallas? Comprueba el contraste de texto (AA).
3. **Tipografía.** Escala, pesos, longitud de línea, mayúsculas. ¿Dónde hay
   demasiados tamaños distintos? ¿Dónde se lee mal?
4. **Espaciado y ritmo.** ¿Se reconoce una rejilla o cada pantalla va por libre?
   Márgenes, aire entre bloques, alineaciones que no cuadran.
5. **Consistencia de componentes.** Botones, tarjetas, etiquetas, insignias:
   ¿se repiten las mismas formas o hay variantes que sobran?
6. **Densidad.** ¿Qué pantalla está cargada de más y qué quitarías?
7. **Las ilustraciones** (la mascota del mazo, los fondos de las tarjetas):
   ¿suman o ensucian? ¿Están integradas o parecen pegadas encima?
8. **Coherencia con la promesa.** ¿Esto parece un juego de juzgar discusiones,
   o parece otra cosa?

### Formato de la respuesta

- **Las cinco cosas que arreglaría primero**, por impacto visual, cada una con
  su captura y su cambio concreto.
- **Lo que funciona y no hay que tocar**, para no romperlo por el camino.
- **Una tabla** de problemas menores: pantalla · elemento · problema · arreglo.
- Si propones colores o tamaños, da **valores exactos** (hex, px).

### Las pantallas

`00-todas-las-pantallas.png` las tiene todas juntas; las numeradas son la misma
cosa a tamaño completo.

| Archivos | Pantalla |
|---|---|
| 01–04 | Presentación de bienvenida, cuatro láminas |
| 05 | Perfil sin cuenta |
| 06–07 | Crear cuenta, vacío y relleno |
| 08 | El Juzgado: las dos defensas y las cuatro respuestas |
| 09–10 | El veredicto tras votar, y La Sala debajo |
| 11–12 | Inicio y el expediente del día |
| 13–16 | Perfil, escalera de niveles, logros y ajustes |
| 17, 22 | Mis zanjas, vacío y con casos |
| 18–21 | Crear una zanja: relato, tu versión, el enlace, la espera |
| 23–25 | La otra parte al abrir el enlace, sin cuenta |
| 26 | Perfil de quien entró como invitado |
