# Filippo 3D

A 3D drawing tool named after [Filippo Brunelleschi](https://en.wikipedia.org/wiki/Filippo_Brunelleschi), the inventor of perspective. Built for teaching — draw on a projected screen with a stylus while your students watch, then rotate and explore the drawing in 3D space.

**[Live demo](https://herbertspencer.net/filippo3d/)**

## Principle

You always draw on the screen plane (`z = 0` of the current view). Pan and rotate the model freely, but every stroke is deposited on the surface you see — like drawing on glass in front of a 3D scene.

## Controls

### Drawing

| Key | Action |
|-----|--------|
| Click + drag | Freehand drawing |
| `Shift` + drag | Straight line |
| `,` `.` | Stroke weight −/+ |
| `Cmd/Ctrl` + `Z` | Undo |
| `E` | Erase selected strokes |
| `N` | New drawing (clear all) |
| `V` | Toggle Draw / Select mode |

### Navigation

| Key | Action |
|-----|--------|
| `Space` + drag | Pan (move origin) |
| `Shift` + `Space` + drag | Free 3D rotation |
| `X` / `Y` / `Z` + drag | Rotate around axis |
| `Shift` + `X` / `Y` / `Z` + drag | Pan along axis |
| `F` `T` `L` `R` `K` `B` | View presets (Front, Top, Left, Right, bacK, Bottom) |

### Selection mode (`V`)

With selected strokes:

| Key | Action |
|-----|--------|
| `Space` + drag | Translate selection |
| `X` / `Y` / `Z` + drag | Rotate selection around axis |
| `Shift` + `X` / `Y` / `Z` + drag | Scale selection along axis |

### Display

| Key | Action |
|-----|--------|
| `G` | Grid and axes on/off |
| `O` | Orthographic / Perspective |
| `M` | Dark / Light theme |
| `Tab` | Show/hide panel |
| `Cmd/Ctrl` + `S` | Export PNG |
| `?` | Help overlay |

## Tech

- **p5.js** (WEBGL) for 3D rendering
- **Pointer Events API** for stylus pressure sensitivity
- Pure static files — no build step, no dependencies
- Deploys to GitHub Pages from `gh-pages` branch

## Legacy

The original Processing (Java) version is preserved in the [`processing-original`](https://github.com/hspencer/filippo3d/tree/processing-original) branch and tagged as [`v1.0`](https://github.com/hspencer/filippo3d/releases/tag/v1.0). Original [blog post](https://herbertspencer.net/2006/12/filippo-3d-ver-01/).

## License

(cc) Herbert Spencer
