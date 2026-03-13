# Filippo 3D v2.2

A 3D drawing tool named after [Filippo Brunelleschi](https://en.wikipedia.org/wiki/Filippo_Brunelleschi), the inventor of perspective. Built for teaching — draw on a projected screen with a stylus while your students watch, then rotate and explore the drawing in 3D space.

**[Live demo](https://herbertspencer.net/filippo3d/)**

## Principle

You always draw on the screen plane (`z = 0` of the current view). Pan and rotate the model freely, but every stroke is deposited on the surface you see — like drawing on glass in front of a 3D scene.

## Interaction reference

### Drawing

| Action | How |
|--------|-----|
| Freehand drawing | Click + drag |
| Straight line | `Shift` + drag |
| Stroke weight −/+ | `,` / `.` |
| Undo | `Cmd/Ctrl` + `Z` |
| Erase selected strokes | `E` |
| New drawing (clear all) | `N` |

### Selection

| Action | How |
|--------|-----|
| Toggle Draw / Select mode | `V` or panel buttons |
| Select a stroke | Click on stroke (in select mode) |
| Add to selection | `Shift` + click |
| Marquee selection | Drag rectangle (in select mode) |

### Transform selection

| Action | How |
|--------|-----|
| Move | Right-click + drag |
| | `Space` + drag |
| Rotate around axis | `X` / `Y` / `Z` + drag |
| Scale along axis | `Shift` + `X` / `Y` / `Z` + drag |

### 3D Navigation

**Rotation**

| Action | How |
|--------|-----|
| Free rotation (orbit) | Middle-click + drag |
| | `Shift` + `Space` + drag |
| Rotate around single axis | `X` / `Y` / `Z` + drag |

**Panning**

| Action | How |
|--------|-----|
| Pan (move origin) | Right-click + drag |
| | `Space` + drag |
| Translate along axis | `Shift` + `X` / `Y` / `Z` + drag |

**Depth (Z axis)**

| Action | How |
|--------|-----|
| Depth guide on/off | `D` |
| Adjust drawing depth | Scroll wheel (with depth guide active) |

**Preset views**

| Action | How |
|--------|-----|
| Front | `F` |
| Top / Bottom | `T` / `B` |
| Left / Right | `L` / `R` |
| Back | `K` |

### General

| Action | How |
|--------|-----|
| Grid and axes on/off | `G` |
| Orthographic / Perspective | `O` |
| Dark / Light theme | `M` |
| Show / hide panel | `Tab` |
| Export PNG | `Cmd/Ctrl` + `S` |
| Save project (.f3d) | Panel button |
| Load project | Panel button |
| Help overlay | `?` |

## Mouse button summary

| Button | Without selection | With selection |
|--------|-------------------|----------------|
| Left click | Draw (or select) | Select |
| Middle click + drag | Orbit (free rotation) | Orbit (free rotation) |
| Right click + drag | Pan | Move selection |
| Scroll wheel | Adjust depth[^1] | Adjust depth[^1] |

[^1]: Only when the depth guide is active (`D`).

## File format

Drawings save as `.f3d` files (JSON). Older `.json` files are still supported on import.

## Tech

- **p5.js** (WEBGL) for 3D rendering
- **Pointer Events API** for unified mouse/touch/stylus input with pressure sensitivity
- Stylus pressure support (e.g., Apple Pencil) — stroke weight responds to pen pressure
- Pure static files — no build step, no dependencies
- Deploys to GitHub Pages from `gh-pages` branch

## Legacy

The original program was written in Processing (Java) in 2006, during the [Interactive Image](https://golancourses.net/) class taught by professor [Golan Levin](https://www.flong.com/). That version is preserved in the [`processing-original`](https://github.com/hspencer/filippo3d/tree/processing-original) branch and tagged as [`v1.0`](https://github.com/hspencer/filippo3d/releases/tag/v1.0). Original [blog post](https://herbertspencer.net/2006/12/filippo-3d-ver-01/).

## License

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — Herbert Spencer
