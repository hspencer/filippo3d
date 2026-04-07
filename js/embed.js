// Filippo 3D - Embed viewer
// Minimal view-only mode: orbit, pan, zoom, info modal

// ── State ──
const CUBE_MARGIN = 15 + 8;  // 15px margin + half cube size
const CUBE_BOTTOM = true;    // position cube at bottom-left
var cubeSize = 16;            // half the default size (50%)
var embedCubeStyle = true;    // custom cube style for embed
let _embedLoaded = false;
let _initialView = { ux: 0, uy: 0, uz: 0, panX: 0, panY: 0, panZ: 0 };
let _zoomScale = 1;
let _spaceHeld = false;       // space = pan mode (like main app)

// Pointer tracking
let _pointers = new Map();
let _lastPinchDist = 0;
let _lastPanCenter = null;

// ── Data loading ──

function _extractData() {
  // 1. URL hash: #d=COMPRESSED
  let hash = location.hash.slice(1);
  if (hash.startsWith('d=')) {
    console.log('Embed: data source = URL hash');
    return decodeURIComponent(hash.slice(2));
  }

  // 2. Query param: ?d=COMPRESSED
  let params = new URLSearchParams(location.search);
  let qd = params.get('d');
  if (qd) {
    console.log('Embed: data source = query param');
    return qd;
  }

  // 3. Inline script: <script>var F3D_DATA = "...";</script>
  if (typeof F3D_DATA !== 'undefined' && F3D_DATA) {
    console.log('Embed: data source = F3D_DATA global');
    return F3D_DATA;
  }

  return null;
}

function _loadCompressed(compressed) {
  try {
    compressed = compressed.replace(/&amp;/g, '&').replace(/&#43;/g, '+');

    let json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) {
      console.error('Embed: decompression returned null (data length:', compressed.length, ')');
      return;
    }
    let data = JSON.parse(json);
    if (data.view && data.view.darkMode === false) {
      darkMode = false;
      document.body.classList.add('light');
    }
    loadFromJSON(data);
    if (data.view && data.view.zoomScale) _zoomScale = data.view.zoomScale;
    _embedLoaded = true;
    console.log('Embed: loaded', trazos.length, 'strokes,',
      data.view ? (data.view.darkMode ? 'dark' : 'light') : 'default', 'theme');
  } catch (e) {
    console.error('Embed: error loading data:', e);
  }
}

// Returns the current compressed data string including embed zoom
function _getCurrentData() {
  let data = getDrawingData();
  data.view.zoomScale = _zoomScale;
  return LZString.compressToEncodedURIComponent(JSON.stringify(data));
}

// ── p5.js setup & draw ──

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  smooth();
  showGrid = false;
  depthGuide = false;

  let compressed = _extractData();

  if (compressed) {
    _loadCompressed(compressed);
  } else {
    console.warn('Embed: no data found — listening for postMessage');
    window.addEventListener('message', function handler(e) {
      if (e.data && typeof e.data === 'string' && e.data.length > 10) {
        _loadCompressed(e.data);
        window.removeEventListener('message', handler);
      } else if (e.data && e.data.f3d) {
        _loadCompressed(e.data.f3d);
        window.removeEventListener('message', handler);
      }
    });
  }

  _initialView = { ux, uy, uz, panX, panY, panZ, zoomScale: _zoomScale };

  _setupEmbedInput();
  _setupInfoModal();
}

function draw() {
  // Apply zoom scale via projection
  if (useOrtho) {
    let hw = width / (2 * _zoomScale), hh = height / (2 * _zoomScale);
    ortho(-hw, hw, -hh, hh, -10000, 10000);
  } else {
    let fov = PI / 3 / _zoomScale;
    fov = constrain(fov, 0.05, PI - 0.05);
    perspective(fov, width / height, 0.1, 20000);
  }

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

  // Reset projection for reference cube (unaffected by zoom)
  if (useOrtho) {
    ortho(-width / 2, width / 2, -height / 2, height / 2, -10000, 10000);
  } else {
    perspective();
  }
  _drawEmbedCube();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ── Embed reference cube (bottom-left, uses shared style + position override) ──

function _drawEmbedCube() {
  let size = cubeSize;
  let s = size / 2;
  let cx = -width / 2 + CUBE_MARGIN + 5;
  let cy = height / 2 - CUBE_MARGIN;  // bottom-left

  let edgeCol = darkMode ? 255 : 60;
  let edgeAlpha = darkMode ? 60 : 70;

  push();
  translate(cx, cy, 0);
  rotateX(ux); rotateY(uy); rotateZ(uz);

  // 8 edges wireframe
  strokeWeight(size * 0.03);
  stroke(edgeCol, edgeAlpha);
  noFill();
  line(-s,s,-s, s,s,-s); line(s,s,-s, s,s,s);
  line(s,s,s, -s,s,s);   line(-s,s,s, -s,s,-s);
  line(-s,-s,-s, s,-s,-s); line(s,-s,-s, s,-s,s);
  line(s,-s,s, -s,-s,s);   line(-s,-s,s, -s,-s,-s);
  line(-s,-s,-s, -s,s,-s); line(s,-s,-s, s,s,-s);
  line(s,-s,s, s,s,s);     line(-s,-s,s, -s,s,s);

  // Front face translucent
  fill(255, 255, 255, darkMode ? 35 : 25);
  stroke(edgeCol, edgeAlpha);
  beginShape();
  vertex(-s,-s,s); vertex(s,-s,s); vertex(s,s,s); vertex(-s,s,s);
  endShape(CLOSE);

  // Axis color hints
  strokeWeight(size * 0.06);
  stroke(255, 60, 60, 150); line(-s,s,s, s,s,s);
  stroke(60, 255, 60, 150); line(-s,-s,s, -s,s,s);
  stroke(60, 60, 255, 150); line(-s,s,-s, -s,s,s);

  // F in red, 1px ahead
  stroke(238, 43, 0, 200);
  strokeWeight(size * 0.06);
  noFill();
  let fl = size * 0.3, fw = size * 0.2;
  for (let fz of [s + 1, s - 1]) {
    line(-fw,-fl,fz, -fw,fl,fz);
    line(-fw,-fl,fz, fw,-fl,fz);
    line(-fw,-fl*0.15,fz, fw*0.6,-fl*0.15,fz);
  }

  pop();
}

// ── Embed Input ──

function _setupEmbedInput() {
  let cnv = document.querySelector('canvas');
  if (!cnv) return;

  cnv.addEventListener('pointerdown', _onPointerDown, { passive: false });
  cnv.addEventListener('pointermove', _onPointerMove, { passive: false });
  cnv.addEventListener('pointerup', _onPointerUp, { passive: false });
  cnv.addEventListener('pointercancel', _onPointerUp, { passive: false });
  cnv.addEventListener('wheel', _onWheel, { passive: false });
  cnv.addEventListener('contextmenu', e => e.preventDefault());

  // Focus for keyboard inside iframe
  cnv.setAttribute('tabindex', '0');
  cnv.style.outline = 'none';
  cnv.addEventListener('pointerenter', () => cnv.focus());
  cnv.addEventListener('pointerdown', () => cnv.focus());
  cnv.addEventListener('keydown', _onKeyDown);
  cnv.addEventListener('keyup', _onKeyUp);
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

    if (prev.button === 2 || _spaceHeld) {
      // Right-click or Space+drag: pan
      panX += dx;
      panY += dy;
    } else {
      // Left-click or touch: orbit
      uy -= dx * 0.005;
      ux -= dy * 0.005;
      currentView = null;
    }
  } else if (_pointers.size === 2) {
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
  let modal = document.getElementById('info-modal');
  if (e.key === 'Escape') {
    if (modal && !modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
      return;
    }
  }

  // Space held = pan mode
  if (e.key === ' ') {
    _spaceHeld = true;
    e.preventDefault();
    return;
  }

  let step = 0.05;
  switch (e.key) {
    case 'ArrowLeft':  uy += step; currentView = null; e.preventDefault(); break;
    case 'ArrowRight': uy -= step; currentView = null; e.preventDefault(); break;
    case 'ArrowUp':    ux += step; currentView = null; e.preventDefault(); break;
    case 'ArrowDown':  ux -= step; currentView = null; e.preventDefault(); break;
    case '+': case '=': _zoomScale *= 1.1; _zoomScale = Math.min(10, _zoomScale); break;
    case '-': case '_': _zoomScale *= 0.9; _zoomScale = Math.max(0.1, _zoomScale); break;
    case 'v': case 'V':
    case 'Home':
      // Reset to initial view
      ux = _initialView.ux; uy = _initialView.uy; uz = _initialView.uz;
      nx = ux; ny = uy; nz = uz;
      panX = _initialView.panX; panY = _initialView.panY; panZ = _initialView.panZ;
      _zoomScale = _initialView.zoomScale || 1;
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

function _onKeyUp(e) {
  if (e.key === ' ') {
    _spaceHeld = false;
  }
}

// ── Theme toggle with stroke color inversion ──

function _embedToggleTheme() {
  darkMode = !darkMode;
  document.body.classList.toggle('light', !darkMode);

  for (let t of trazos) {
    t.col = _invertColor(t.col);
  }
}

function _invertColor(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
  let r = 255 - parseInt(c.substring(0, 2), 16);
  let g = 255 - parseInt(c.substring(2, 4), 16);
  let b = 255 - parseInt(c.substring(4, 6), 16);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

// ── Clipboard (with iframe fallback) ──

function _copyText(text, btn) {
  function onSuccess() {
    let orig = btn.textContent;
    btn.textContent = '¡Copiado!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1500);
  }

  // Try modern API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
      // Fallback for cross-origin iframes
      _fallbackCopy(text, onSuccess);
    });
  } else {
    _fallbackCopy(text, onSuccess);
  }
}

function _fallbackCopy(text, onSuccess) {
  let ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    onSuccess();
  } catch (e) {
    // Last resort: show in a prompt so user can manually copy
    prompt('Copiar manualmente:', text);
  }
  document.body.removeChild(ta);
}

// ── Info Modal (triggered by clicking reference cube) ──

function _isOverCube(clientX, clientY) {
  // Cube bottom-left: center at (CUBE_MARGIN+5, height - CUBE_MARGIN)
  let cx = CUBE_MARGIN + 5, cy = window.innerHeight - CUBE_MARGIN, hit = 24;
  return clientX >= 0 && clientX <= (cx + hit) &&
         clientY >= (cy - hit) && clientY <= window.innerHeight;
}

function _setupInfoModal() {
  let modal = document.getElementById('info-modal');
  if (!modal) return;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });

  // Copy data button
  let copyBtn = document.getElementById('copy-data-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      let data = _getCurrentData();
      _copyText(data, copyBtn);
    });
  }

  let editBtn = document.getElementById('edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      let data = _getCurrentData();
      let base = location.href.replace(/embed\.html.*$/, '');
      window.open(base + '#d=' + data, '_blank');
    });
  }

  // Cursor hint when hovering over cube
  let cnv = document.querySelector('canvas');
  if (cnv) {
    cnv.addEventListener('pointermove', (e) => {
      cnv.style.cursor = _isOverCube(e.clientX, e.clientY) ? 'pointer' : 'default';
    });
  }
}
