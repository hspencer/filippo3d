// Filippo 3D - Embed viewer
// Minimal view-only mode: orbit, pan, zoom, info modal

// ── State ──
const CUBE_MARGIN = 42;  // cube center offset from edge (no panel)
var cubeSize = 16;       // half the default size (50%)
let _embedLoaded = false;
let _initialView = { ux: 0, uy: 0, uz: 0, panX: 0, panY: 0, panZ: 0 };
let _zoomScale = 1;

// Pointer tracking
let _pointers = new Map();
let _lastPinchDist = 0;
let _lastPanCenter = null;

// ── p5.js setup & draw ──

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  smooth();
  showGrid = false;
  depthGuide = false;

  // Decode drawing from URL hash
  let hash = location.hash.slice(1);
  if (hash.startsWith('d=')) {
    try {
      let compressed = hash.slice(2);
      let json = LZString.decompressFromEncodedURIComponent(compressed);
      if (json) {
        let data = JSON.parse(json);
        // Apply theme before loading (for background)
        if (data.view && data.view.darkMode === false) {
          darkMode = false;
          document.body.classList.add('light');
        }
        loadFromJSON(data);
        zoomExtents();
        _embedLoaded = true;
      }
    } catch (e) {
      console.error('Error loading embed data:', e);
    }
  }

  // Save initial view for reset
  _initialView = { ux, uy, uz, panX, panY, panZ };

  // Setup input
  _setupEmbedInput();
  _setupInfoModal();
}

function draw() {
  // Apply zoom scale via ortho/perspective
  if (useOrtho) {
    let hw = width / (2 * _zoomScale), hh = height / (2 * _zoomScale);
    ortho(-hw, hw, -hh, hh, -10000, 10000);
  } else {
    let fov = PI / 3 / _zoomScale;
    fov = constrain(fov, 0.05, PI - 0.05);
    perspective(fov, width / height, 0.1, 20000);
  }

  // Background
  let bg = darkMode ? BG_DARK : BG_LIGHT;
  background(bg[0], bg[1], bg[2]);

  // Animate view transitions
  if (animatingView) {
    let ease = 0.12;
    let dx = nx - ux, dy = ny - uy, dz = nz - uz;
    if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001 || Math.abs(dz) > 0.001) {
      ux += dx * ease; uy += dy * ease; uz += dz * ease;
    } else {
      ux = nx; uy = ny; uz = nz;
      animatingView = false;
    }
  }

  push();
  translate(panX, panY, panZ);
  rotateX(ux); rotateY(uy); rotateZ(uz);

  for (let t of trazos) {
    t.draw();
  }

  pop();

  // Reset projection to standard for reference cube (unaffected by zoom)
  if (useOrtho) {
    ortho(-width / 2, width / 2, -height / 2, height / 2, -10000, 10000);
  } else {
    perspective();
  }
  drawReferenceCube();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ── Embed Input ──

function _setupEmbedInput() {
  let cnv = document.querySelector('canvas');
  if (!cnv) return;

  // Pointer events
  cnv.addEventListener('pointerdown', _onPointerDown, { passive: false });
  cnv.addEventListener('pointermove', _onPointerMove, { passive: false });
  cnv.addEventListener('pointerup', _onPointerUp, { passive: false });
  cnv.addEventListener('pointercancel', _onPointerUp, { passive: false });

  // Wheel for zoom
  cnv.addEventListener('wheel', _onWheel, { passive: false });

  // Prevent context menu
  cnv.addEventListener('contextmenu', e => e.preventDefault());

  // Focus management for keyboard inside iframe
  cnv.setAttribute('tabindex', '0');
  cnv.style.outline = 'none';
  cnv.addEventListener('pointerenter', () => cnv.focus());
  cnv.addEventListener('pointerdown', () => cnv.focus());
  // Listen keyboard on canvas (not window) for iframe compat
  cnv.addEventListener('keydown', _onKeyDown);
}

function _onPointerDown(e) {
  e.preventDefault();

  // Click on reference cube → toggle info modal
  if (e.isPrimary && _isOverCube(e.clientX, e.clientY)) {
    let modal = document.getElementById('info-modal');
    if (modal) modal.classList.toggle('hidden');
    return;
  }

  this.setPointerCapture(e.pointerId);
  _pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, button: e.button });

  if (_pointers.size === 2) {
    let pts = [..._pointers.values()];
    _lastPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    _lastPanCenter = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
  }
}

function _onPointerMove(e) {
  e.preventDefault();
  let prev = _pointers.get(e.pointerId);
  if (!prev) return;

  let cx = e.clientX, cy = e.clientY;

  if (_pointers.size === 1) {
    let dx = cx - prev.x;
    let dy = cy - prev.y;

    if (prev.button === 2) {
      // Right-click: pan
      panX += dx;
      panY += dy;
    } else {
      // Left-click or touch: orbit
      uy -= dx * 0.005;
      ux -= dy * 0.005;
      currentView = null;
    }
  } else if (_pointers.size === 2) {
    // Update this pointer
    _pointers.set(e.pointerId, { x: cx, y: cy, button: prev.button });
    let pts = [..._pointers.values()];

    // Pinch zoom
    let dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    if (_lastPinchDist > 0) {
      let ratio = dist / _lastPinchDist;
      _zoomScale *= ratio;
      _zoomScale = Math.max(0.1, Math.min(10, _zoomScale));
    }
    _lastPinchDist = dist;

    // Two-finger pan
    let center = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
    if (_lastPanCenter) {
      panX += center.x - _lastPanCenter.x;
      panY += center.y - _lastPanCenter.y;
    }
    _lastPanCenter = center;
    return;
  }

  _pointers.set(e.pointerId, { x: cx, y: cy, button: prev.button });
}

function _onPointerUp(e) {
  _pointers.delete(e.pointerId);
  if (_pointers.size < 2) {
    _lastPinchDist = 0;
    _lastPanCenter = null;
  }
}

function _onWheel(e) {
  e.preventDefault();
  let delta = e.deltaY > 0 ? 0.9 : 1.1;
  _zoomScale *= delta;
  _zoomScale = Math.max(0.1, Math.min(10, _zoomScale));
}

function _onKeyDown(e) {
  // Don't capture when modal is open and Escape closes it
  let modal = document.getElementById('info-modal');
  if (e.key === 'Escape') {
    if (modal && !modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
      return;
    }
  }

  let step = 0.05;
  switch (e.key) {
    case 'ArrowLeft':  uy += step; currentView = null; e.preventDefault(); break;
    case 'ArrowRight': uy -= step; currentView = null; e.preventDefault(); break;
    case 'ArrowUp':    ux += step; currentView = null; e.preventDefault(); break;
    case 'ArrowDown':  ux -= step; currentView = null; e.preventDefault(); break;
    case '+': case '=': _zoomScale *= 1.1; _zoomScale = Math.min(10, _zoomScale); break;
    case '-': case '_': _zoomScale *= 0.9; _zoomScale = Math.max(0.1, _zoomScale); break;
    case ' ':
    case 'Home':
      // Reset to initial view
      ux = _initialView.ux; uy = _initialView.uy; uz = _initialView.uz;
      nx = ux; ny = uy; nz = uz;
      panX = _initialView.panX; panY = _initialView.panY; panZ = _initialView.panZ;
      _zoomScale = 1;
      animatingView = false;
      e.preventDefault();
      break;
    case 'o': case 'O':
      useOrtho = !useOrtho;
      break;
    case 'm': case 'M':
      _embedToggleTheme();
      break;
    case 'f': case 'F': setView('front'); break;
    case 't': case 'T': setView('top'); break;
    case 'b': case 'B': setView('bottom'); break;
    case 'l': case 'L': setView('left'); break;
    case 'r': case 'R': setView('right'); break;
    case 'k': case 'K': setView('back'); break;
  }
}

// ── Theme toggle with stroke color inversion ──

function _embedToggleTheme() {
  darkMode = !darkMode;
  document.body.classList.toggle('light', !darkMode);

  // Invert stroke colors to maintain contrast
  for (let t of trazos) {
    t.col = _invertColor(t.col);
  }
}

function _invertColor(hex) {
  // Parse hex color and invert RGB channels
  let c = hex.replace('#', '');
  if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
  let r = 255 - parseInt(c.substring(0, 2), 16);
  let g = 255 - parseInt(c.substring(2, 4), 16);
  let b = 255 - parseInt(c.substring(4, 6), 16);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

// ── Info Modal (triggered by clicking reference cube) ──

function _isOverCube(clientX, clientY) {
  // Reference cube center in embed: x = CUBE_MARGIN, y = CUBE_MARGIN+5
  // Hit area generous — comfortable tap target around the cube
  let cx = CUBE_MARGIN, cy = CUBE_MARGIN + 5, hit = 30;
  return clientX >= (cx - hit) && clientX <= (cx + hit) &&
         clientY >= (cy - hit) && clientY <= (cy + hit);
}

function _setupInfoModal() {
  let modal = document.getElementById('info-modal');
  if (!modal) return;

  // Click outside card to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });

  // Cursor hint when hovering over cube
  let cnv = document.querySelector('canvas');
  if (cnv) {
    cnv.addEventListener('pointermove', (e) => {
      cnv.style.cursor = _isOverCube(e.clientX, e.clientY) ? 'pointer' : 'default';
    });
  }
}
