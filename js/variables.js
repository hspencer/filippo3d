// Filippo 3D - Global State

const VERSION = '2.4';

// Rotation angles (current)
let ux = 0, uy = 0, uz = 0;
// Rotation angles (target for animated transitions)
let nx = 0, ny = 0, nz = 0;

// Pan offset (model translation)
let panX = 0, panY = 0, panZ = 0;

// Strokes
let trazos = [];
let trazoActual = null;
let isDrawing = false;

// Interaction modes
let drawMode = true;       // true = draw, false = select
let darkMode = true;
let animatingView = false;
let showGrid = true;
let useOrtho = false;

// Modifier-driven modes (active while key held)
let spaceHeld = false;     // pan mode
let shiftHeld = false;     // straight line / modifier
let axisHeld = null;       // 'x', 'y', or 'z' for axis-constrained ops
let interacting = false;   // true while dragging in a modifier mode

// Marquee selection
let marquee = null;        // { x0, y0, x1, y1 } while dragging, null otherwise

// Undo history
let undoStack = [];        // array of actions
let transformSnapshot = null; // temp snapshot during transform drag

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

// Depth guide
let depthGuide = false;

// Background colors
const BG_DARK = [17, 17, 17];
const BG_LIGHT = [245, 245, 240];
