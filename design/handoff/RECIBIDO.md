# Qué llegó en el traspaso, y dónde está

Paquete entregado el 25-09-2026 por la IA que hizo la estética, en tres zip
(58 MB en total). Esto es el mapa de lo que se conservó en el repositorio.

## En `design/`

| Carpeta | Qué es |
|---|---|
| `handoff/` | La documentación del traspaso: HANDOFF, PANTALLAS, COMPONENTES, ESTILOS-EXACTOS, ANIMACIONES, IMAGENES, CODIGO, design-system.css |
| `handoff/codigo/` | El código fuente del prototipo: React 19 + Next 16 + Tailwind 4, TypeScript. Sin lockfile ni node_modules |
| `handoff/db/` | Las tres migraciones del esquema D1 (cases, votes, reports) |
| `handoff/capturas-historicas/` | Capturas de versiones anteriores. **No** son el estado actual |
| `img/` | Las nueve ilustraciones en WebP, tal y como las sirve la web |
| `originals/` | Los PNG originales a 1254×1254 y 1536×1024 |
| `iconos/` | Los 45 iconos Lucide en SVG |
| `screens/` | Captura y HTML de las cinco pantallas, recorridas con navegador |
| `css/`, `js/`, `index.html` | Lo descargado directamente del sitio publicado |

## Lo que NO se guardó aquí

- `archivo-historico/`: 21 compilaciones en tar.gz, 24 MB. El propio paquete las
  marca como recuperables pero no vigentes. Están en los zip originales.
- Las imágenes duplicadas: varios `generated_images/exec-*.png` son byte a byte
  idénticos a los de `assets/`. Se conservó una copia de cada una.

## Lo que el paquete dice que falta, y es cierto

- **Los prompts de las ilustraciones.** Sólo se conserva el de `court-energy.webp`.
  El resto figura como no recuperado, sin reconstruir.
- **Capturas del último commit.** Las que hay son históricas.
- El código es una instantánea del commit `dd57bf1f`, no el repositorio vivo.
