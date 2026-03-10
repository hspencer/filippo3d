// Filippo 3D - Input handling

// ── Pointer Events (for stylus pressure data) ──

function setupPointerEvents() {
  setTimeout(() => {
    let canvas = document.querySelector('canvas');
    if (!canvas) return;
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', e => {
      currentPressure = e.pressure || 0.5;
      pointerType = e.pointerType || 'mouse';
    });
    canvas.addEventListener('pointermove', e => {
      currentPressure = e.pressure || 0.5;
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }, 100);
}

// ── p5.js mouse handlers ──

function mousePressed() {
  // Ignore clicks on UI panel
  if (mouseX < 220 && !document.getElementById('panel').classList.contains('collapsed')) {
    return;
  }

  // Modifier modes: don't start drawing
  if (spaceHeld || axisHeld) {
    interacting = true;
    return;
  }

  if (drawMode) {
    // Screen coords relative to center (pan is handled inside _screenToModel)
    let x = mouseX - width / 2;
    let y = mouseY - height / 2;
    trazoActual = new Stroke3D(strokeColor, strokeW);
    trazoActual.addPoint(x, y, 0, currentPressure);
    isDrawing = true;
  } else {
    handleSelection(mouseX, mouseY);
  }
}

function mouseDragged() {
  let dx = mouseX - pmouseX;
  let dy = mouseY - pmouseY;
  let hasSelection = !drawMode && trazos.some(t => t.selected);

  // ── Space held: pan/translate ──
  if (spaceHeld) {
    if (hasSelection) {
      // Select mode: translate selection in screen plane → model space
      applyToSelected(t => {
        let d = screenDeltaToModel(dx, dy);
        t.translate(d.x, d.y, d.z);
      });
    } else if (shiftHeld) {
      // Shift+Space+drag = free 3D rotation (viewport)
      uy -= dx * 0.005;
      ux -= dy * 0.005;
      currentView = null;
      updateViewButtons();
    } else {
      // Space+drag = pan viewport
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
        // Select + Shift+axis+drag = scale selection
        let factor = 1 + dx * 0.005;
        applyToSelected(t => t.scaleAxis(axisHeld, factor));
      } else {
        // Select + axis+drag = rotate selection around axis
        applyToSelected(t => t.rotateAroundAxis(axisHeld, amount));
      }
    } else {
      if (shiftHeld) {
        // Shift+axis+drag = translate viewport along axis
        if (axisHeld === 'x') panX += panAmount;
        if (axisHeld === 'y') panY += panAmount;
        if (axisHeld === 'z') panZ += panAmount;
      } else {
        // axis+drag = rotate viewport around axis
        if (axisHeld === 'x') ux += amount;
        if (axisHeld === 'y') uy += amount;
        if (axisHeld === 'z') uz += amount;
        currentView = null;
        updateViewButtons();
      }
    }
    return;
  }

  // ── Drawing ──
  if (isDrawing && trazoActual && drawMode) {
    let x = mouseX - width / 2;
    let y = mouseY - height / 2;

    if (shiftHeld) {
      // Shift+drag = straight line (keep first point + current)
      let first = trazoActual.points[0];
      trazoActual.points = [first];
      trazoActual.addPoint(x, y, 0, currentPressure);
    } else {
      trazoActual.addPoint(x, y, 0, currentPressure);
    }
  }
}

function mouseReleased() {
  if (interacting) {
    interacting = false;
    return;
  }

  if (isDrawing && trazoActual) {
    if (trazoActual.points.length > 1) {
      trazos.push(trazoActual);
    }
    trazoActual = null;
    isDrawing = false;
    updateStatus();
  }
}

function handleSelection(sx, sy) {
  for (let i = trazos.length - 1; i >= 0; i--) {
    if (trazos[i].hitTest(sx, sy, 15)) {
      trazos[i].selected = !trazos[i].selected;
      return;
    }
  }
}

// ── Keyboard ──

function keyPressed() {
  if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

  // Track modifier keys
  if (keyCode === SHIFT) {
    shiftHeld = true;
    return;
  }

  // Track space (pan mode)
  if (key === ' ') {
    spaceHeld = true;
    if (shiftHeld) {
      cursor('grab');
    } else {
      cursor('move');
    }
    return false; // prevent scroll
  }

  // Track axis keys (only when not drawing)
  let lowerKey = key.toLowerCase();
  if (!isDrawing && (lowerKey === 'x' || lowerKey === 'y' || lowerKey === 'z')) {
    axisHeld = lowerKey;
    cursor('ew-resize');
    return;
  }

  // Help overlay
  let helpEl = document.getElementById('help-overlay');
  if (helpEl && !helpEl.classList.contains('hidden')) {
    helpEl.classList.add('hidden');
    return false;
  }

  // Cmd/Ctrl combinations
  if (keyIsDown(91) || keyIsDown(93) || keyIsDown(17)) { // meta or ctrl
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
  }

  if (keyCode === 9) { // Tab
    togglePanel();
    return false;
  }
}

function keyReleased() {
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
  if (trazos.length > 0) {
    trazos.pop();
    updateStatus();
  }
}

function eraseSelected() {
  trazos = trazos.filter(t => !t.selected);
  updateStatus();
}

function newDrawing() {
  trazos = [];
  trazoActual = null;
  isDrawing = false;
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

// Convert a screen-space delta (dx, dy pixels) to model-space delta
// Same R⁻¹ as _screenToModel: Rx⁻¹ first, then Ry⁻¹, then Rz⁻¹
function screenDeltaToModel(dx, dy) {
  let cosX = Math.cos(ux), sinX = Math.sin(ux);
  let cosY = Math.cos(uy), sinY = Math.sin(uy);
  let cosZ = Math.cos(uz), sinZ = Math.sin(uz);

  // Step 1: Rx⁻¹
  let x1 = dx;
  let y1 =  cosX * dy;
  let z1 = -sinX * dy;

  // Step 2: Ry⁻¹
  let x2 =  cosY * x1 - sinY * z1;
  let y2 = y1;
  let z2 =  sinY * x1 + cosY * z1;

  // Step 3: Rz⁻¹
  let x3 =  cosZ * x2 + sinZ * y2;
  let y3 = -sinZ * x2 + cosZ * y2;
  let z3 = z2;

  return { x: x3, y: y3, z: z3 };
}

// ── Window resize ──

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
