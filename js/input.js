// Filippo 3D - Input handling (pointer events, keyboard, touch)

// ── Pointer Events (unified mouse + stylus + touch) ──

function setupPointerEvents() {
  // Wait a frame for p5 canvas to be ready
  setTimeout(() => {
    let canvas = document.querySelector('canvas');
    if (!canvas) return;

    canvas.style.touchAction = 'none'; // prevent browser gestures

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    // Prevent context menu on right-click/long-press
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }, 100);
}

function getCanvasXY(e) {
  // Convert page coordinates to p5 WEBGL coordinates (origin at center)
  let canvas = document.querySelector('canvas');
  let rect = canvas.getBoundingClientRect();
  let px = e.clientX - rect.left;
  let py = e.clientY - rect.top;
  return {
    sx: px,                    // screen coords (for hit testing)
    sy: py,
    x: px - width / 2,        // WEBGL coords (origin at center)
    y: py - height / 2
  };
}

function handlePointerDown(e) {
  e.preventDefault();

  currentPressure = e.pressure || 0.5;
  pointerType = e.pointerType || 'mouse';

  let pos = getCanvasXY(e);

  if (freeRotate) {
    // In free rotate mode, just capture for delta tracking
    return;
  }

  if (drawMode) {
    trazoActual = new Stroke3D(strokeColor, strokeW);
    trazoActual.addPoint(pos.x, pos.y, 0, currentPressure);
    isDrawing = true;
  } else {
    // Select mode: hit test
    handleSelection(pos.sx, pos.sy);
  }
}

function handlePointerMove(e) {
  e.preventDefault();

  currentPressure = e.pressure || 0.5;

  if (freeRotate && e.buttons > 0) {
    let difx = e.movementX || 0;
    let dify = e.movementY || 0;
    uy -= difx * 0.005;
    ux -= dify * 0.005;
    return;
  }

  if (isDrawing && trazoActual && drawMode) {
    let pos = getCanvasXY(e);
    trazoActual.addPoint(pos.x, pos.y, 0, currentPressure);
  }
}

function handlePointerUp(e) {
  e.preventDefault();

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
  // Don't capture keys when typing in inputs
  if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

  // Help overlay: any key closes it if open
  let helpEl = document.getElementById('help-overlay');
  if (helpEl && !helpEl.classList.contains('hidden')) {
    helpEl.classList.add('hidden');
    return false;
  }

  switch (key) {
    case '?':
      if (helpEl) helpEl.classList.toggle('hidden');
      return false;

    case ' ':
      toggleFreeRotate();
      return false;

    case 'z':
    case 'Z':
      undo();
      break;

    case 's':
    case 'S':
      exportPNG();
      break;

    case 'n':
    case 'N':
      newDrawing();
      break;

    case 'm':
    case 'M':
      toggleTheme();
      break;

    case ',':
      strokeW = max(0.5, strokeW - 0.5);
      syncUIFromState();
      break;

    case '.':
      strokeW = min(20, strokeW + 0.5);
      syncUIFromState();
      break;

    case 'f':
      setView('front');
      break;
    case 't':
      setView('top');
      break;
    case 'l':
      setView('left');
      break;
    case 'r':
      setView('right');
      break;
    case 'k':
      setView('back');
      break;
    case 'b':
      setView('bottom');
      break;

    case 'e':
    case 'E':
      eraseSelected();
      break;
  }

  if (keyCode === 9) { // Tab
    togglePanel();
    return false;
  }
}

// ── Free rotate ──

function toggleFreeRotate() {
  freeRotate = !freeRotate;
  if (freeRotate) {
    currentView = null;
    updateViewButtons();
    showRotateIndicator();
    cursor('grab');
  } else {
    removeRotateIndicator();
    cursor(CROSS);
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
  freeRotate = false;
  currentView = 'front';
  removeRotateIndicator();
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

function showRotateIndicator() {
  if (!document.querySelector('.rotate-indicator')) {
    let div = document.createElement('div');
    div.className = 'rotate-indicator';
    div.textContent = 'Rotación libre — Space para fijar vista';
    document.body.appendChild(div);
  }
}

function removeRotateIndicator() {
  let el = document.querySelector('.rotate-indicator');
  if (el) el.remove();
}

// ── Window resize ──

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
