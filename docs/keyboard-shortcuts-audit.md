# Keyboard shortcuts & fallbacks — transversal audit

> **Status**: Initial audit, 2026-04-10. Produced as part of the
> elicitation pass that wrote `specs/filippo3d.allium`. This document
> identifies the current state of keyboard and pointer bindings in
> both the Editor (`index.html`) and the Viewer (`embed.html`),
> checks them for cross-surface consistency, and flags accessibility
> gaps against WCAG 2.1 and 2.2.
>
> **Purpose**: inform a future refinement pass. Nothing in this
> document has been implemented yet.

## 1. Scope and methodology

Two surfaces are audited:

- **Editor** — the full authoring environment (`index.html`, loaded JS in `js/sketch.js`, `js/input.js`, `js/drawing.js`, `js/ui.js`, `js/variables.js`, `js/stroke3d.js`).
- **Viewer** — the read-only embedded exploration mode (`embed.html`, `js/embed.js` plus the shared `js/variables.js`, `js/stroke3d.js`, `js/drawing.js`).

For each user-visible action the audit records:

1. **Primary binding** per surface (keyboard or pointer).
2. **Alternative bindings** the surface already provides.
3. **Discrete fallback**: whether the action can be performed without dragging or holding a modifier — through a panel button, tap target, or single key press.
4. **Consistency**: whether the two surfaces agree on the binding.
5. **WCAG status**: compliance against three criteria that matter for this application:
   - **SC 2.1.1 Keyboard** (A) — operable by keyboard alone.
   - **SC 2.1.4 Character Key Shortcuts** (A) — single-character shortcuts must be disableable, remappable, or only active on focus.
   - **SC 2.5.1 Pointer Gestures** (A) — multipoint or path gestures must have a single-pointer alternative.
   - **SC 2.5.7 Dragging Movements** (AA, WCAG 2.2) — any drag must have a single-pointer non-drag alternative.

## 2. Actions in the Editor

### 2.1 Drawing

| # | Action | Primary | Alternatives | Discrete fallback | Consistency | WCAG |
|---|--------|---------|--------------|---|---|---|
| 1 | Begin stroke | Left-click + drag on canvas | — | None | Editor only | 2.5.7 ⚠ |
| 2 | Append point | pointer move while drag active | — | None | Editor only | 2.5.7 ⚠ |
| 3 | End stroke | pointer up | — | n/a | Editor only | — |
| 4 | Straight line modifier | hold `Shift` while drag | — | None | Editor only | 2.1.4 ⚠ |
| 5 | Stroke weight − | `,` | panel slider | panel slider ✓ | Editor only | 2.1.4 ⚠ |
| 6 | Stroke weight + | `.` | panel slider | panel slider ✓ | Editor only | 2.1.4 ⚠ |
| 7 | Color pick | panel color input | — | panel ✓ | Editor only | — |

**Notes on drawing.** The core stroke creation action (#1-#3) is a dragging movement without a discrete fallback. Drawing a freehand line with a single keypress is not meaningful; this action is arguably exempt from SC 2.5.7 under the "essential exception" clause (the drag *is* the drawing). Worth recording explicitly in the spec as an intentional exception. Shift-for-straight-line (#4) is a modifier during drag and carries the same exception status.

### 2.2 Selection

| # | Action | Primary | Alternatives | Discrete fallback | Consistency | WCAG |
|---|--------|---------|--------------|---|---|---|
| 8 | Toggle draw/select mode | `V` | panel `btn-draw` / `btn-select` | panel ✓ | Editor only | 2.1.4 ⚠ |
| 9 | Select single stroke | click on stroke | — | None (keyboard can't identify which stroke to pick) | Editor only | 2.5.7 ⚠ (click is discrete but picking strokes requires pointer) |
| 10 | Add to selection | `Shift` + click | — | None | Editor only | — |
| 11 | Marquee select | left-click + drag rectangle | — | None | Editor only | 2.5.7 ⚠ |
| 12 | Clear selection | click empty space in select mode, or switch to draw mode | — | mode switch ✓ | Editor only | — |

**Notes on selection.** The core selection actions are pointer-driven. A keyboard-only user cannot identify which stroke to select because strokes have no focusable representation. A full keyboard-navigable selection would require a "cycle through strokes" shortcut (e.g., `Tab`/`Shift+Tab` when in select mode) with a visible focus indicator on the active stroke. That is a substantive UX addition; flagged as an open question below.

### 2.3 Transform selection

| # | Action | Primary | Alternatives | Discrete fallback | Consistency | WCAG |
|---|--------|---------|--------------|---|---|---|
| 13 | Move selection | right-click + drag, or `Space` + drag | — | None | Editor only | 2.5.7 ⚠ |
| 14 | Rotate around X axis | hold `X` + drag | — | None | Editor only | 2.1.4 ⚠ 2.5.7 ⚠ |
| 15 | Rotate around Y axis | hold `Y` + drag | — | None | Editor only | 2.1.4 ⚠ 2.5.7 ⚠ |
| 16 | Rotate around Z axis | hold `Z` + drag | — | None | Editor only | 2.1.4 ⚠ 2.5.7 ⚠ |
| 17 | Scale along X | hold `Shift + X` + drag | — | None | Editor only | 2.5.7 ⚠ |
| 18 | Scale along Y | hold `Shift + Y` + drag | — | None | Editor only | 2.5.7 ⚠ |
| 19 | Scale along Z | hold `Shift + Z` + drag | — | None | Editor only | 2.5.7 ⚠ |
| 20 | Erase selection | `E` | — | None (no panel button) | Editor only | 2.1.4 ⚠ |

**Notes on transform.** All transformations are drag-based with a modifier key. A keyboard-only alternative would require either (a) numeric input fields in the panel for translate/rotate/scale values, or (b) arrow-key nudging with a "current transform axis" selector. Option (a) is more common and more accessible. Erase (#20) has no panel button — easy fix.

### 2.4 View manipulation

| # | Action | Primary | Alternatives | Discrete fallback | Consistency | WCAG |
|---|--------|---------|--------------|---|---|---|
| 21 | Orbit (free rotation) | middle-click + drag | `Shift + Space` + drag; planned `C + drag` (trackpad-friendly, not yet in code) | None | Editor only | 2.5.7 ⚠ |
| 22 | Pan | right-click + drag, or `Space` + drag | — | None | Editor only | 2.5.7 ⚠ |
| 23 | Rotate view around X axis | hold `X` + drag (when nothing selected) | — | None | Editor only | 2.1.4 ⚠ 2.5.7 ⚠ |
| 24 | Rotate view around Y axis | hold `Y` + drag | — | None | Editor only | 2.1.4 ⚠ 2.5.7 ⚠ |
| 25 | Rotate view around Z axis | hold `Z` + drag | — | None | Editor only | 2.1.4 ⚠ 2.5.7 ⚠ |
| 26 | Translate view along X | hold `Shift + X` + drag | — | None | Editor only | 2.5.7 ⚠ |
| 27 | Translate view along Y | hold `Shift + Y` + drag | — | None | Editor only | 2.5.7 ⚠ |
| 28 | Translate view along Z | hold `Shift + Z` + drag | — | None | Editor only | 2.5.7 ⚠ |
| 29 | Front view preset | `F` | cube-face button in panel | panel ✓ | Shared with Viewer ✓ | 2.1.4 ⚠ |
| 30 | Top view preset | `T` | cube-face button | panel ✓ | Shared with Viewer ✓ | 2.1.4 ⚠ |
| 31 | Bottom view preset | `B` | cube-face button | panel ✓ | Shared with Viewer ✓ | 2.1.4 ⚠ |
| 32 | Left view preset | `L` | cube-face button | panel ✓ | Shared with Viewer ✓ | 2.1.4 ⚠ |
| 33 | Right view preset | `R` | cube-face button | panel ✓ | Shared with Viewer ✓ | 2.1.4 ⚠ |
| 34 | Back view preset | `K` | cube-face button | panel ✓ | Shared with Viewer ✓ | 2.1.4 ⚠ |
| 35 | Toggle orthographic/perspective | `O` | panel `btn-persp`/`btn-ortho` | panel ✓ | Shared with Viewer ✓ | 2.1.4 ⚠ |
| 36 | Toggle grid/axes | `G` | panel `btn-grid` | panel ✓ | Editor only | 2.1.4 ⚠ |
| 37 | Toggle depth mode | `D` | panel `btn-depth` | panel ✓ | Editor only ⚠ (not exposed in Viewer yet) | 2.1.4 ⚠ |
| 38 | Adjust depth (while depth mode) | scroll wheel | — | None (no panel control yet) | Editor only ⚠ | 2.5.1 ⚠ 2.5.7 ⚠ |

**Notes on view manipulation.** The orbit/pan/depth operations are the most accessibility-deficient area. Every drag-based view operation lacks a keyboard alternative in the editor. The Viewer already has arrow-key orbit and `+/-` zoom — the editor should adopt the same pattern. Depth adjustment (#38) has no panel control at all despite being on the spec's forward-looking list for WCAG compliance; it was decided (Camino B) to defer the broader fix and only address depth if it becomes urgent.

### 2.5 Modes and toggles

| # | Action | Primary | Alternatives | Discrete fallback | Consistency | WCAG |
|---|--------|---------|--------------|---|---|---|
| 39 | Toggle theme (dark/light) | `M` | panel `btn-dark`/`btn-light` | panel ✓ | Shared with Viewer ✓ | 2.1.4 ⚠ |
| 40 | Toggle draw/select | `V` | panel `btn-draw`/`btn-select` | panel ✓ (see #8) | Editor only | 2.1.4 ⚠ |

Theme invert behaviour is unified across surfaces per the spec decision (SurfaceBehaviorConsistency invariant).

### 2.6 Persistence

| # | Action | Primary | Alternatives | Discrete fallback | Consistency | WCAG |
|---|--------|---------|--------------|---|---|---|
| 41 | Undo | `Cmd/Ctrl + Z` | panel `btn-undo` | panel ✓ | Editor only | — |
| 42 | Redo | `Cmd/Ctrl + Shift + Z` | — | None (not in code yet) | Editor only, **spec-only** | — |
| 43 | New drawing | `N` | panel `btn-clear` | panel ✓ | Editor only | 2.1.4 ⚠ |
| 44 | Export PNG | `Cmd/Ctrl + S` | panel `btn-export` | panel ✓ | Editor only | — |
| 45 | Save `.f3d` | — | panel `btn-save` | panel ✓ | Editor only | — |
| 46 | Load `.f3d` | — | panel `btn-load` | panel ✓ | Editor only | — |
| 47 | Create embed | — | panel `btn-embed` | panel ✓ | Editor only | — |
| 48 | Export DXF | — | — (not in code yet) | **missing** | **spec-only** | — |

Redo (#42) and DXF export (#48) are in the spec but not yet implemented.

### 2.7 Panel and help

| # | Action | Primary | Alternatives | Discrete fallback | Consistency | WCAG |
|---|--------|---------|--------------|---|---|---|
| 49 | Toggle side panel | `Tab` | click the reference cube | cube ✓ | Editor only ⚠ | 2.1.4 ⚠ (Tab is usually reserved for focus navigation) |
| 50 | Toggle help overlay | `?` | panel `btn-help` | panel ✓ | Editor only | 2.1.4 ⚠ |

**Notes on Tab.** Overriding `Tab` to toggle the panel is unusual and conflicts with the browser's default focus-navigation semantics. A keyboard-only user trying to reach panel controls via `Tab` will instead toggle the panel's visibility. This is a real accessibility bug that should be reconsidered.

## 3. Actions in the Viewer

### 3.1 View manipulation

| # | Action | Primary | Alternatives | Discrete fallback | Consistency | WCAG |
|---|--------|---------|--------------|---|---|---|
| 51 | Orbit | left-click + drag, or `Arrow` keys (step `0.05` rad) | — | Arrow keys ✓ | Diverges from Editor (editor uses middle-click) ⚠ | — |
| 52 | Pan | right-click + drag, `Space` + drag, or two-finger drag | — | None | Editor uses the same primary; no keyboard alt in either | 2.5.7 ⚠ |
| 53 | Zoom in | `+` or `=` | pinch (two-finger spread), scroll wheel | `+` key ✓ | **Not in Editor** ⚠ | 2.5.1 ✓ |
| 54 | Zoom out | `-` or `_` | pinch in, scroll wheel | `-` key ✓ | **Not in Editor** ⚠ | 2.5.1 ✓ |
| 55 | Reset view | `V` or `Home` | — | Home ✓ | **Not in Editor** ⚠ | — |
| 56 | Front / Top / Bottom / Left / Right / Back preset | `F`/`T`/`B`/`L`/`R`/`K` | — | key itself ✓ | Shared ✓ | 2.1.4 ⚠ |
| 57 | Toggle ortho/perspective | `O` | — | key ✓ | Shared ✓ | 2.1.4 ⚠ |
| 58 | Toggle theme (with invert) | `M` | — | key ✓ | Shared ✓ (invert also applies in Editor per spec, but not yet in code) | 2.1.4 ⚠ |

**Divergences flagged:**

- The primary orbit gesture differs between surfaces. Editor uses middle-click (unusual for trackpad users); Viewer uses left-click. The viewer's choice is more trackpad-friendly and should propagate to the editor as a fourth orbit path alongside middle-click, `Shift + Space`, and the planned `C + drag`. Alternatively, the editor could adopt "left-click + drag on empty canvas when no stroke is being drawn" — but this conflicts with the marquee selector.
- Zoom exists only in Viewer. Per spec, zoom and depth are the same concept and both surfaces should expose the same operation. This is a **feature unification** pending implementation, not just a fallback gap.
- Reset-view (`V`/`Home`) exists only in Viewer. `V` in Editor means toggle draw/select — conflict. If Editor gets a reset-view binding, it needs a different key (e.g., `0` or `Home`).

### 3.2 Session actions

| # | Action | Primary | Alternatives | Discrete fallback | Consistency | WCAG |
|---|--------|---------|--------------|---|---|---|
| 59 | Open info modal | click reference cube | — | cube ✓ | Viewer only | 2.5.5 ⚠ (cube is 16px half-size ≈ 32px target; below 44px AAA) |
| 60 | Copy current data | button in info modal | — | button ✓ | Viewer only | — |
| 61 | Open in editor | button in info modal | — | button ✓ | Viewer only | — |
| 62 | Close modal | `Escape` | click outside modal | key ✓ | Viewer only | — |

## 4. Modifier keys held (no action on release)

These don't fire any action by themselves; they change interpretation of pointer input while held.

| # | Key | Editor behavior | Viewer behavior | Consistency |
|---|-----|------|------|---|
| 63 | `Shift` | straight line (while drawing), scale (with X/Y/Z), add to selection (with click), orbit chord (with Space + drag) | — | Editor only |
| 64 | `Space` | pan while drag, orbit chord with Shift | pan while drag | Partial (editor has more meanings) |
| 65 | `X` | rotate view or selection around X (drag), translate with Shift | — | Editor only |
| 66 | `Y` | rotate around Y | — | Editor only |
| 67 | `Z` | rotate around Z | — | Editor only |
| 68 | `C` (planned) | orbit (trackpad-friendly) — not yet in code | — (should also propagate) | Not implemented |
| 69 | `D` | depth mode on while held | — (depth mode not exposed in viewer yet) | Editor only ⚠ |

**Notes.**

- `X`/`Y`/`Z` as held modifiers are triple-duty: view rotation, selection rotation, and with `Shift` either view translation or selection scale. The dispatch depends on `drawMode` and whether a selection exists. This is powerful but dense; a first-time user is unlikely to discover it without reading the README.
- `D` is the only "toggleable" modifier in the current code — pressing it flips `depthGuide` rather than holding it. The spec treats it as a toggle, not a held modifier. The audit confirms that interpretation.

## 5. Gaps summary

### 5.1 Drag operations without discrete fallback (SC 2.5.7, AA)

| Gap | Actions affected | Severity | Proposed fallback |
|-----|-----------------|----------|-------------------|
| Orbit | #21 (editor) | High | Arrow keys (as in viewer). Editor should share the viewer's arrow-key orbit. |
| Pan | #22, #13, #52 | High | `WASD` or `Shift + Arrow` for pan. |
| Transform selection (rotate) | #14-16 | Medium | Numeric input fields in the panel: "rotate X°", "rotate Y°", "rotate Z°". |
| Transform selection (scale) | #17-19 | Medium | Numeric input fields in the panel: "scale X %", etc. |
| Transform selection (move) | #13 | Medium | Arrow keys while selection exists, with `Shift` for larger step. |
| Depth adjust | #38 | Medium | Panel `+`/`−` buttons while depth mode active. |
| Marquee select | #11 | Low | Keyboard cycling through strokes (see 5.4). |

### 5.2 Character key shortcuts without disable/remap (SC 2.1.4, A)

All single-letter shortcuts (`F`/`T`/`B`/`L`/`R`/`K`/`G`/`O`/`V`/`E`/`M`/`N`/`D`/`?`/`,`/`.`) fire globally when any non-input element has focus. A user with a speech-recognition device might accidentally trigger destructive actions like `N` (new drawing, discards work) or `E` (erase selection).

**Minimum mitigation** (low cost, unblocks 2.1.4 compliance):
- Add a panel toggle "Enable keyboard shortcuts" (on by default).
- Scope single-letter shortcuts behind a canvas-focus check (they only fire when the canvas has focus, not when focus is elsewhere).

**Medium mitigation** (better UX):
- Ship both editor and viewer with a `Settings → Keyboard shortcuts` section that lists every binding and allows enable/disable per binding.

**Higher mitigation** (full remapping):
- Allow the user to reassign any binding. Requires persistence (localStorage), which conflicts with the viewer's NoSessionPersistence invariant. Probably only the editor should support remapping; viewer inherits whatever the author published.

### 5.3 Pointer gestures without single-pointer alternative (SC 2.5.1, A)

- **Pinch zoom** in viewer (#53/#54): covered by `+`/`-` keys and scroll wheel. Compliant.
- **Two-finger drag pan** in viewer (#52): not covered by a single-pointer alternative beyond right-click drag (which is also a drag). Recommend adding `Shift + Arrow` or `WASD` as a non-drag single-pointer alternative.

### 5.4 Keyboard-only stroke selection (SC 2.1.1, A)

The selection model assumes pointer input. A keyboard-only user cannot select a specific stroke. The minimal fix is a stroke-cycling mechanism:

- `Tab` / `Shift + Tab` while in select mode: cycle forward/backward through strokes by draw order.
- The "focused" stroke is visually highlighted.
- `Enter` or `Space` on a focused stroke: toggle selection.

This has a clash: `Tab` currently toggles the panel (#49), which itself is a 2.1.4 problem. Fixing one makes the other easier. Reassign panel toggle to, e.g., `P` or a non-character shortcut like `F1`, freeing `Tab` for its natural focus-navigation role.

### 5.5 Target size (SC 2.5.5, AAA — aspirational)

- Reference cube in editor: 32px target (16px half-size). Below the 44×44 AAA recommendation. Tolerable on desktop with mouse; problematic on touch screens.
- Reference cube in viewer: same 32px target. Same tolerance tradeoff.

## 6. Cross-surface consistency issues

| Issue | Current state | Target state |
|-------|---------------|--------------|
| Orbit primary gesture | Editor: middle-click; Viewer: left-click | Unify — add left-click-on-empty-canvas OR `C`+drag in Editor (`C`+drag is already decided) |
| Zoom / depth | Viewer has independent `_zoomScale`; Editor uses `panZ` with depth mode | Unify — both surfaces use `panZ` via depth mode (spec decision, pending implementation) |
| Theme invert | Viewer inverts stroke colors on toggle; Editor does not | Unify — Editor should also invert on theme toggle (spec decision, pending implementation) |
| Reset view | Viewer has `V`/`Home`; Editor does not | Add to Editor with a free key (`0`? `Home`?) |
| Arrow key orbit | Viewer has it; Editor does not | Add to Editor |
| Depth mode UI | Editor has `D` key + panel button; Viewer has neither | Add depth mode button to Viewer panel (currently Viewer has no side panel — UI decision needed) |
| Toggle grid in viewer | Grid is forced off in Viewer's setup | Intentional (reader shouldn't see a distracting grid) — document as deliberate |

## 7. Prioritized action plan

Ordered from "low cost, high accessibility benefit" to "bigger scope":

1. **Scope single-letter shortcuts to canvas focus.** Change `window.addEventListener('keydown', ...)` to `canvas.addEventListener('keydown', ...)` where possible, or add an explicit focus check. Unblocks SC 2.1.4 for most bindings. Low risk.

2. **Free up `Tab`.** Reassign panel toggle from `Tab` to another key (`P`?). Restores native focus navigation. One small change.

3. **Add arrow-key orbit and `Shift + Arrow` pan to the Editor.** Reuses the Viewer's existing pattern. Covers SC 2.5.7 for view manipulation. Medium size.

4. **Add erase button to the panel.** Makes `E` reachable without keyboard. Trivial.

5. **Add "Enable keyboard shortcuts" toggle in the panel.** Provides the SC 2.1.4 escape hatch for users who need it. Medium.

6. **Unify depth and zoom across surfaces.** Feature unification, not just accessibility. Affects `_zoomScale` in embed.js and depth mode in editor. Medium-large.

7. **Implement `C + drag` orbit in the Editor** (already in spec as planned binding). Small.

8. **Add keyboard-only stroke selection** (Tab-cycle + Enter to toggle). Requires a focus indicator and changes selection model. Large. Also requires #2 (free `Tab`).

9. **Panel numeric inputs for transform.** Expose rotate/scale/translate values as number fields when something is selected. Large UI addition.

10. **Depth mode button + plus/minus in Viewer panel.** Currently Viewer has no side panel; adding one is a substantive UI change.

## 8. Open questions

1. **Orbit gesture in Editor**: adopt the Viewer's left-click-on-empty-canvas, stay with middle-click + planned `C + drag`, or do both?
2. **Tab replacement**: which key replaces `Tab` for panel toggle? (`P`, `F1`, `` ` ``, nothing — only the cube?)
3. **Viewer side panel**: should the Viewer gain a collapsible panel similar to the Editor's, to host depth mode and accessibility controls? The current design is intentionally minimal; adding a panel changes the "read mostly" character of the Viewer.
4. **Keyboard-remapping persistence**: the spec's `NoSessionPersistence` guarantee forbids `localStorage` in the Viewer. Does this extend to user keyboard preferences? If yes, remapping belongs only in the Editor; the Viewer ships with fixed bindings per the data author's publication.
5. **Stroke focus indicator**: if keyboard-only selection is added, how is the "focused stroke" rendered — a halo? a dashed outline? Which interacts well with dark/light themes?

## 9. What the spec already records

For reference, the following is already captured in `specs/filippo3d.allium`:

- `EditorSurface` `@guarantee DragOperationsHaveDiscreteAlternatives` — states the requirement without listing specific alternatives.
- `EditorSurface` `@guidance KeyboardBindings` — the intended binding table.
- `ViewerSurface` `@guidance ViewerKeyboardBindings` — the Viewer's bindings.
- `ViewerSurface` `@guarantee NoSessionPersistence` — constrains where user preferences can live.
- Open question on `C`+drag trackpad binding.
- Open question on transversal WCAG audit (this document partially closes it).

When any of the actions in section 7 are implemented, the spec should be updated in the same commit. The spec is authoritative for what ships; this audit is the working document that informs which items ship next.
