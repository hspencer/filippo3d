// Filippo 3D - Input handling
// Uses Pointer Events API for unified mouse/touch/stylus support

// Internal pointer tracking
let _px = 0, _py = 0;   // current pointer position (screen pixels)
let _ppx = 0, _ppy = 0; // previous pointer position
let _canvas = null;      // cached canvas reference
let _pendingMove = null; // throttled pointermove
let _accumDx = 0, _accumDy = 0; // accumulated deltas for throttled ops

// ── Pointer Events (all drawing/interaction input) ──

function setupPointerEvents() {
  setTimeout(() => {
    _canvas = document.querySelector('canvas');
    if (!_canvas) return;

    _canvas.style.touchAction = 'none';
    _canvas.setAttribute('tabindex', '0');
    _canvas.focus();

    // Re-focus canvas on any tap so iPad keyboard events reach p5
    _canvas.addEventListener('pointerdown', () => _canvas.focus());

    // { passive: false } required on iOS Safari to allow preventDefault()
    _canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    _canvas.addEventListener('pointermove', onPointerMove, { passive: false });
    _canvas.addEventListener('pointerup', onPointerUp);
    _canvas.addEventListener('pointercancel', onPointerUp);
    _canvas.addEventListener('contextmenu', e => e.preventDefault());
    _canvas.addEventListener('wheel', onWheel, { passive: false });

    // Prevent iOS Safari from scrolling/bouncing on touch
    _canvas.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
    _canvas.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    _canvas.addEventListener('touchend', e => e.preventDefault(), { passive: false });
  }, 100);
}

function getPos(e) {
  let rect = _canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function onPointerDown(e) {
  e.preventDefault();
  let pos = getPos(e);
  _px = pos.x; _py = pos.y;
  _ppx = pos.x; _ppy = pos.y;
  currentPressure = e.pressure || 0.5;
  pointerType = e.pointerType || 'mouse';

  // Ignore clicks on UI panel
  let panelOpen = !document.getElementById('panel').classList.contains('collapsed');
  if (panelOpen && pos.x < 220) return;

  // Modifier modes: don't start drawing, but snapshot for undo
  if (spaceHeld || axisHeld) {
    interacting = true;
    let selected = trazos.filter(t => t.selected);
    if (!drawMode && selected.length > 0) {
      transformSnapshot = snapshotStrokes(selected);
    }
    return;
  }

  if (drawMode) {
    let x = pos.x - width / 2;
    let y = pos.y - height / 2;
    trazoActual = new Stroke3D(strokeColor, strokeW);
    trazoActual.addPoint(x, y, 0, currentPressure);
    isDrawing = true;
  } else {
    marquee = { x0: pos.x, y0: pos.y, x1: pos.x, y1: pos.y };
  }
}

function onPointerMove(e) {
  e.preventDefault();
  let pos = getPos(e);
  let dx = pos.x - _px;
  let dy = pos.y - _py;
  _ppx = _px; _ppy = _py;
  _px = pos.x; _py = pos.y;
  currentPressure = e.pressure || 0.5;

  if (e.buttons === 0) return; // not dragging

  // Drawing and marquee: process every event for accuracy
  if (isDrawing && trazoActual && drawMode) {
    let x = _px - width / 2;
    let y = _py - height / 2;
    if (shiftHeld) {
      let first = trazoActual.points[0];
      trazoActual.points = [first];
      trazoActual.addPoint(x, y, 0, currentPressure);
    } else {
      trazoActual.addPoint(x, y, 0, currentPressure);
    }
    return;
  }

  if (marquee && !drawMode) {
    marquee.x1 = _px;
    marquee.y1 = _py;
    return;
  }

  // Pan/rotate/transform: accumulate deltas and throttle to rAF
  _accumDx += dx;
  _accumDy += dy;
  if (!_pendingMove) {
    _pendingMove = true;
    requestAnimationFrame(() => {
      _pendingMove = false;
      _processPointerMove();
    });
  }
}

function _processPointerMove() {
  let dx = _accumDx;
  let dy = _accumDy;
  _accumDx = 0;
  _accumDy = 0;
  let hasSelection = !drawMode && trazos.some(t => t.selected);

  // ── Space held: pan/translate ──
  if (spaceHeld) {
    if (hasSelection) {
      applyToSelected(t => {
        let d = screenDeltaToModel(dx, dy);
        t.translate(d.x, d.y, d.z);
      });
    } else if (shiftHeld) {
      uy -= dx * 0.005;
      ux -= dy * 0.005;
      currentView = null;
      updateViewButtons();
    } else {
      panX += dx;
      panY += dy;
    }
    return;
  }

  // ── Axis key held + drag ──
  if (axisHeld) {
    let amount = dx * 0.005;
    let panAmount = dx;

    if (hasSelection) {
      if (shiftHeld) {
        let factor = 1 + dx * 0.005;
        applyToSelected(t => t.scaleAxis(axisHeld, factor));
      } else {
        applyToSelected(t => t.rotateAroundAxis(axisHeld, amount));
      }
    } else {
      if (shiftHeld) {
        if (axisHeld === 'x') panX += panAmount;
        if (axisHeld === 'y') panY += panAmount;
        if (axisHeld === 'z') panZ += panAmount;
      } else {
        if (axisHeld === 'x') ux += amount;
        if (axisHeld === 'y') uy += amount;
        if (axisHeld === 'z') uz += amount;
        currentView = null;
        updateViewButtons();
      }
    }
    return;
  }

}

function onPointerUp(e) {
  e.preventDefault();

  if (interacting) {
    interacting = false;
    if (transformSnapshot) {
      pushTransformUndo(transformSnapshot);
      transformSnapshot = null;
    }
    return;
  }

  if (isDrawing && trazoActual) {
    if (trazoActual.points.length > 1) {
      trazoActual.simplify(1.5);
      trazos.push(trazoActual);
      undoStack.push({ type: 'add', stroke: trazoActual });
    }
    trazoActual = null;
    isDrawing = false;
    updateStatus();
  }

  // ── Resolve marquee selection ──
  if (marquee && !drawMode) {
    let mx0 = Math.min(marquee.x0, marquee.x1);
    let my0 = Math.min(marquee.y0, marquee.y1);
    let mx1 = Math.max(marquee.x0, marquee.x1);
    let my1 = Math.max(marquee.y0, marquee.y1);
    let isClick = (mx1 - mx0 < 4 && my1 - my0 < 4);

    if (isClick) {
      handleClickSelection(marquee.x0, marquee.y0);
    } else {
      if (!shiftHeld) {
        trazos.forEach(t => t.selected = false);
      }
      for (let t of trazos) {
        if (t.hitTestRect(mx0, my0, mx1, my1)) {
          t.selected = true;
        }
      }
    }
    marquee = null;
  }
}

function onWheel(e) {
  e.preventDefault();
  if (!depthGuide) return;
  panZ += e.deltaY * 0.5;
}

// Disable p5 mouse handlers (we use pointer events)
function mousePressed()  { return false; }
function mouseDragged()  { return false; }
function mouseReleased() { return false; }

function handleClickSelection(sx, sy) {
  let hit = null;
  for (let i = trazos.length - 1; i >= 0; i--) {
    if (trazos[i].hitTest(sx, sy, 15)) {
      hit = trazos[i];
      break;
    }
  }

  if (shiftHeld) {
    if (hit) hit.selected = !hit.selected;
  } else {
    trazos.forEach(t => t.selected = false);
    if (hit) hit.selected = true;
  }
}

// ── Keyboard ──
// We use direct window listeners instead of p5's keyPressed/keyReleased
// because some browsers (Arc on iPad) don't propagate keyboard events to p5.

function setupKeyboardEvents() {
  window.addEventListener('keydown', _onKeyDown);
  window.addEventListener('keyup', _onKeyUp);
}

function _onKeyDown(e) {
  // Bridge to p5 globals so the rest of the code can use them
  key = e.key;
  keyCode = e.keyCode;
  _metaHeld = e.metaKey || e.ctrlKey;
  _handleKeyDown();
}

function _onKeyUp(e) {
  key = e.key;
  keyCode = e.keyCode;
  _metaHeld = e.metaKey || e.ctrlKey;
  _handleKeyUp();
}

let _metaHeld = false;

// Disable p5 keyboard handlers (we use our own window listeners)
function keyPressed()  { return false; }
function keyReleased() { return false; }

function _handleKeyDown() {
  if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

  if (keyCode === SHIFT) {
    shiftHeld = true;
    return;
  }

  if (key === ' ') {
    spaceHeld = true;
    if (shiftHeld) {
      cursor('grab');
    } else {
      cursor('move');
    }
    return false;
  }

  let lowerKey = key.toLowerCase();
  if (!isDrawing && (lowerKey === 'x' || lowerKey === 'y' || lowerKey === 'z')) {
    axisHeld = lowerKey;
    cursor('ew-resize');
    return;
  }

  let helpEl = document.getElementById('help-overlay');
  if (helpEl && !helpEl.classList.contains('hidden')) {
    helpEl.classList.add('hidden');
    return false;
  }

  if (_metaHeld) {
    if (key === 'z' || key === 'Z') {
      undo();
      return false;
    }
    if (key === 's' || key === 'S') {
      exportPNG();
      return false;
    }
  }

  switch (key) {
    case '?':
      if (helpEl) helpEl.classList.toggle('hidden');
      return false;

    case ',':
      strokeW = max(0.5, strokeW - 0.5);
      syncUIFromState();
      break;

    case '.':
      strokeW = min(20, strokeW + 0.5);
      syncUIFromState();
      break;

    case 'f':
    case 'F':
      setView('front');
      break;
    case 't':
    case 'T':
      setView('top');
      break;
    case 'l':
    case 'L':
      setView('left');
      break;
    case 'r':
    case 'R':
      setView('right');
      break;
    case 'k':
    case 'K':
      setView('back');
      break;
    case 'b':
    case 'B':
      setView('bottom');
      break;

    case 'g':
    case 'G':
      showGrid = !showGrid;
      break;

    case 'o':
    case 'O':
      useOrtho = !useOrtho;
      syncProjectionButtons();
      break;

    case 'v':
    case 'V':
      drawMode = !drawMode;
      if (drawMode) trazos.forEach(t => t.selected = false);
      cursor(drawMode ? CROSS : ARROW);
      document.getElementById('btn-draw').classList.toggle('active', drawMode);
      document.getElementById('btn-select').classList.toggle('active', !drawMode);
      break;

    case 'e':
    case 'E':
      eraseSelected();
      break;

    case 'm':
    case 'M':
      toggleTheme();
      break;

    case 'n':
    case 'N':
      newDrawing();
      break;

    case 'd':
    case 'D':
      depthGuide = !depthGuide;
      break;
  }

  if (keyCode === 9) {
    togglePanel();
    return false;
  }
}

function _handleKeyUp() {
  if (keyCode === SHIFT) {
    shiftHeld = false;
  }
  if (key === ' ') {
    spaceHeld = false;
    cursor(CROSS);
  }
  let releasedKey = key.toLowerCase();
  if (releasedKey === 'x' || releasedKey === 'y' || releasedKey === 'z') {
    if (axisHeld === releasedKey) {
      axisHeld = null;
      cursor(CROSS);
    }
  }
}

// ── Actions ──

function undo() {
  if (undoStack.length === 0) return;
  let action = undoStack.pop();

  if (action.type === 'add') {
    let idx = trazos.indexOf(action.stroke);
    if (idx !== -1) trazos.splice(idx, 1);
  } else if (action.type === 'delete') {
    for (let i = action.entries.length - 1; i >= 0; i--) {
      let e = action.entries[i];
      trazos.splice(e.index, 0, e.stroke);
    }
  } else if (action.type === 'transform') {
    for (let entry of action.snapshots) {
      entry.stroke.points = entry.points.map(p => {
        let v = createVector(p.x, p.y, p.z);
        v.pressure = p.pressure;
        return v;
      });
    }
  }

  updateStatus();
}

function eraseSelected() {
  let entries = [];
  for (let i = trazos.length - 1; i >= 0; i--) {
    if (trazos[i].selected) {
      entries.unshift({ stroke: trazos[i], index: i });
      trazos.splice(i, 1);
    }
  }
  if (entries.length > 0) {
    undoStack.push({ type: 'delete', entries });
  }
  updateStatus();
}

// ── Undo helpers ──

function snapshotStrokes(strokes) {
  return strokes.map(s => ({
    stroke: s,
    points: s.points.map(p => ({ x: p.x, y: p.y, z: p.z, pressure: p.pressure }))
  }));
}

function pushTransformUndo(snapshots) {
  let changed = snapshots.some(entry => {
    let curr = entry.stroke.points;
    let orig = entry.points;
    if (curr.length !== orig.length) return true;
    for (let i = 0; i < curr.length; i++) {
      if (Math.abs(curr[i].x - orig[i].x) > 0.001 ||
          Math.abs(curr[i].y - orig[i].y) > 0.001 ||
          Math.abs(curr[i].z - orig[i].z) > 0.001) return true;
    }
    return false;
  });
  if (changed) {
    undoStack.push({ type: 'transform', snapshots });
  }
}

function newDrawing() {
  trazos = [];
  trazoActual = null;
  isDrawing = false;
  undoStack = [];
  transformSnapshot = null;
  ux = 0; uy = 0; uz = 0;
  nx = 0; ny = 0; nz = 0;
  panX = 0; panY = 0; panZ = 0;
  currentView = 'front';
  cursor(CROSS);
  updateViewButtons();
  updateStatus();
}

function toggleTheme() {
  darkMode = !darkMode;
  document.body.classList.toggle('light', !darkMode);

  if (darkMode) {
    strokeColor = '#ffffff';
  } else {
    strokeColor = '#000000';
  }
  syncUIFromState();

  let btnDark = document.getElementById('btn-dark');
  let btnLight = document.getElementById('btn-light');
  if (btnDark && btnLight) {
    btnDark.classList.toggle('active', darkMode);
    btnLight.classList.toggle('active', !darkMode);
  }
}

// ── Rotate indicator ──

function showRotateIndicator(text) {
  removeRotateIndicator();
  let div = document.createElement('div');
  div.className = 'rotate-indicator';
  div.textContent = text;
  document.body.appendChild(div);
}

function removeRotateIndicator() {
  let el = document.querySelector('.rotate-indicator');
  if (el) el.remove();
}

// ── Selection helpers ──

function applyToSelected(fn) {
  for (let t of trazos) {
    if (t.selected) fn(t);
  }
}

function screenDeltaToModel(dx, dy) {
  let cosX = Math.cos(ux), sinX = Math.sin(ux);
  let cosY = Math.cos(uy), sinY = Math.sin(uy);
  let cosZ = Math.cos(uz), sinZ = Math.sin(uz);

  let x1 = dx;
  let y1 =  cosX * dy;
  let z1 = -sinX * dy;

  let x2 =  cosY * x1 - sinY * z1;
  let y2 = y1;
  let z2 =  sinY * x1 + cosY * z1;

  let x3 =  cosZ * x2 + sinZ * y2;
  let y3 = -sinZ * x2 + cosZ * y2;
  let z3 = z2;

  return { x: x3, y: y3, z: z3 };
}

// ── Window resize ──

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
