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

  // Modifier modes: don't start drawing, but snapshot for undo
  if (spaceHeld || axisHeld) {
    interacting = true;
    // Snapshot selected strokes before transform
    let selected = trazos.filter(t => t.selected);
    if (!drawMode && selected.length > 0) {
      transformSnapshot = snapshotStrokes(selected);
    }
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
    // Start marquee selection
    marquee = { x0: mouseX, y0: mouseY, x1: mouseX, y1: mouseY };
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

  // ── Marquee ──
  if (marquee && !drawMode) {
    marquee.x1 = mouseX;
    marquee.y1 = mouseY;
  }
}

function mouseReleased() {
  if (interacting) {
    interacting = false;
    // If we were transforming selected strokes, push undo action
    if (transformSnapshot) {
      pushTransformUndo(transformSnapshot);
      transformSnapshot = null;
    }
    return;
  }

  if (isDrawing && trazoActual) {
    if (trazoActual.points.length > 1) {
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
      // Single click: select one stroke
      handleClickSelection(marquee.x0, marquee.y0);
    } else {
      // Marquee: select all strokes with any point inside the rectangle
      if (!shiftHeld) {
        // Without Shift: replace selection
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

function handleClickSelection(sx, sy) {
  // Without Shift: deselect all first, then select the clicked one
  // With Shift: toggle the clicked one, keep rest
  let hit = null;
  for (let i = trazos.length - 1; i >= 0; i--) {
    if (trazos[i].hitTest(sx, sy, 15)) {
      hit = trazos[i];
      break;
    }
  }

  if (shiftHeld) {
    // Shift+click: toggle this stroke
    if (hit) hit.selected = !hit.selected;
  } else {
    // Click: select only this stroke
    trazos.forEach(t => t.selected = false);
    if (hit) hit.selected = true;
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

    case 'o':
    case 'O':
      useOrtho = !useOrtho;
      syncProjectionButtons();
      break;

    case 'v':
    case 'V':
      drawMode = !drawMode;
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
  if (undoStack.length === 0) return;
  let action = undoStack.pop();

  if (action.type === 'add') {
    let idx = trazos.indexOf(action.stroke);
    if (idx !== -1) trazos.splice(idx, 1);
  } else if (action.type === 'delete') {
    // Re-insert deleted strokes at their original indices (reverse order)
    for (let i = action.entries.length - 1; i >= 0; i--) {
      let e = action.entries[i];
      trazos.splice(e.index, 0, e.stroke);
    }
  } else if (action.type === 'transform') {
    // Restore points from snapshot
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
  // Only push if points actually changed
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
