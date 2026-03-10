// Filippo 3D - Global State

// Rotation angles (current)
let ux = 0, uy = 0, uz = 0;
// Rotation angles (target for animated transitions)
let nx = 0, ny = 0, nz = 0;

// Strokes
let trazos = [];
let trazoActual = null;
let isDrawing = false;

// Modes
let drawMode = true;       // true = draw, false = select
let freeRotate = false;
let darkMode = true;
let animatingView = false;

// Stylus / pointer
let currentPressure = 0.5;
let pointerType = 'mouse';

// Drawing settings
let strokeColor = '#ffffff';
let strokeW = 2;

// View presets: { name: [rx, ry, rz] }
const VIEW_PRESETS = {
  front:  [0, 0, 0],
  top:    [-Math.PI / 2, 0, 0],
  bottom: [Math.PI / 2, 0, 0],
  left:   [0, Math.PI / 2, 0],
  right:  [0, -Math.PI / 2, 0],
  back:   [0, Math.PI, 0]
};

let currentView = 'front';

// Background colors
const BG_DARK = [17, 17, 17];
const BG_LIGHT = [245, 245, 240];
