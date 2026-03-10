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
    let x = mouseX - width / 2;
    let y = mouseY - height / 2;
    trazoActual = new Stroke3D(strokeColor, strokeW);
    trazoActual.addPoint(x - panX, y - panY, -panZ, currentPressure);
    isDrawing = true;
  } else {
    handleSelection(mouseX, mouseY);
  }
}

function mouseDragged() {
  let dx = mouseX - pmouseX;
  let dy = mouseY - pmouseY;

  // ── Space held: pan or rotate ──
  if (spaceHeld) {
    if (shiftHeld) {
      // Shift+Space+drag = free 3D rotation
      uy -= dx * 0.005;
      ux -= dy * 0.005;
      currentView = null;
      updateViewButtons();
    } else {
      // Space+drag = pan (move origin)
      panX += dx;
      panY += dy;
    }
    return;
  }

  // ── Axis key held + drag: rotate or translate along axis ──
  if (axisHeld) {
    let amount = dx * 0.005;       // horizontal drag = amount
    let panAmount = dx;            // pixel-based for translation

    if (shiftHeld) {
      // Shift+axis+drag = translate along axis
      if (axisHeld === 'x') panX += panAmount;
      if (axisHeld === 'y') panY += panAmount;
      if (axisHeld === 'z') panZ += panAmount;
    } else {
      // axis+drag = rotate around axis
      if (axisHeld === 'x') ux += amount;
      if (axisHeld === 'y') uy += amount;
      if (axisHeld === 'z') uz += amount;
      currentView = null;
      updateViewButtons();
    }
    return;
  }

  // ── Drawing ──
  if (isDrawing && trazoActual && drawMode) {
    let x = mouseX - width / 2;
    let y = mouseY - height / 2;

    if (shiftHeld) {
      // Shift+drag = straight line (replace all points with just first + current)
      let first = trazoActual.points[0];
      trazoActual.points = [first];
      trazoActual.addPoint(x - panX, y - panY, -panZ, currentPressure);
    } else {
      trazoActual.addPoint(x - panX, y - panY, -panZ, currentPressure);
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
  if (!isDrawing && (key === 'x' || key === 'y' || key === 'z')) {
    axisHeld = key;
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
  if (key === 'x' || key === 'y' || key === 'z') {
    if (axisHeld === key) {
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

// ── Window resize ──

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
